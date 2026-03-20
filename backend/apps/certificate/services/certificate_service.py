"""TLS 证书 Service：由原 `CertificateApplication` + tls handler 合并手写。"""
from __future__ import annotations

import logging
import threading
from typing import Any, Optional

from config.types import CertConfig, DatabaseConfig
from enums import CertificateSource, CertificateStatus, CertificateStore
from utils.pem import extract_cert_info_from_pem_sync

from apps.certificate.repos.certificate_cache_repo import CertificateCacheRepo
from apps.certificate.repos.certificate_repository import CertificateRepository
from apps.certificate.repos.tls_issue_repository import TlsIssueRepository
from apps.certificate.kafka.certificate_pipeline import CertificatePipeline

logger = logging.getLogger(__name__)


class CertificateService:
    def __init__(
        self,
        database_repo: CertificateRepository,
        cache_repo: CertificateCacheRepo,
        pipeline_repo: Optional[CertificatePipeline],
        tls_repo: Optional[TlsIssueRepository],
        db_config: Optional[DatabaseConfig],
        cert_config: CertConfig,
    ) -> None:
        self.database_repo = database_repo
        self.cache_repo = cache_repo
        self.pipeline_repo = pipeline_repo
        self.tls_repo = tls_repo
        self.db_config = db_config
        self.cert_config = cert_config
        self.base_dir = cert_config.BASE_DIR

    def list_certificates(
        self,
        store: str,
        offset: int = 0,
        limit: int = 20,
        use_cache: bool = True,
    ) -> dict[str, Any]:
        if use_cache:
            c = self.cache_repo.get_certificate_list(store, offset, limit)
            if c:
                return c
        cert_dicts, total = self.database_repo.get_certificate_list(store, offset, limit)
        items = []
        for d in cert_dicts:
            if not d or not d.get("domain"):
                continue
            items.append(
                {
                    "id": d.get("id"),
                    "domain": d.get("domain", ""),
                    "store": d.get("store"),
                    "folder_name": d.get("folder_name"),
                    "source": d.get("source") or "auto",
                    "status": d.get("status"),
                    "email": d.get("email"),
                    "issuer": d.get("issuer"),
                    "not_before": d.get("not_before").isoformat()
                    if hasattr(d.get("not_before"), "isoformat")
                    else d.get("not_before"),
                    "not_after": d.get("not_after").isoformat()
                    if hasattr(d.get("not_after"), "isoformat")
                    else d.get("not_after"),
                    "is_valid": d.get("is_valid"),
                    "days_remaining": d.get("days_remaining"),
                    "last_error_message": d.get("last_error_message"),
                    "last_error_time": d.get("last_error_time"),
                }
            )
        result: dict[str, Any] = {"items": items, "total": total}
        if use_cache:
            self.cache_repo.set_certificate_list(store, offset, limit, result, ttl=300)
        return result

    def get_certificate_detail_by_id(
        self, certificate_id: str, use_cache: bool = True
    ) -> Optional[dict[str, Any]]:
        cert_dict = self.database_repo.get_certificate_by_id(certificate_id)
        if not cert_dict:
            return None
        store = cert_dict.get("store")
        domain = cert_dict.get("domain")
        if use_cache and store and domain:
            cached = self.cache_repo.get_certificate_detail(str(store), str(domain))
            if cached and cached.get("id") == certificate_id:
                if cached.get("sans") is None:
                    cached["sans"] = []
                return cached
        result = {
            "id": cert_dict.get("id"),
            "domain": cert_dict["domain"],
            "store": cert_dict["store"],
            "folder_name": cert_dict.get("folder_name"),
            "source": cert_dict.get("source", "auto"),
            "status": cert_dict.get("status"),
            "email": cert_dict.get("email"),
            "certificate": cert_dict["certificate"],
            "private_key": cert_dict["private_key"],
            "sans": cert_dict.get("sans") or [],
            "issuer": cert_dict.get("issuer"),
            "not_before": cert_dict.get("not_before"),
            "not_after": cert_dict.get("not_after"),
            "is_valid": cert_dict.get("is_valid"),
            "days_remaining": cert_dict.get("days_remaining"),
            "last_error_message": cert_dict.get("last_error_message"),
            "last_error_time": cert_dict.get("last_error_time"),
        }
        if use_cache and store and domain:
            self.cache_repo.set_certificate_detail(str(store), str(domain), result, ttl=60)
        return result

    def publish_refresh_event(self, store: str, trigger: str = "manual") -> None:
        if self.pipeline_repo:
            self.pipeline_repo.send_refresh_event(store, trigger)

    def invalidate_cache(self, stores: list[str], trigger: str = "manual") -> bool:
        if not self.pipeline_repo:
            return False
        return self.pipeline_repo.send_cache_invalidate_event(stores, trigger)

    def create_certificate(
        self,
        store: str,
        domain: str,
        certificate: str,
        private_key: str,
        sans: Optional[list[str]] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
        issuer: Optional[str] = None,
    ) -> dict[str, Any]:
        actual_store = CertificateStore.DATABASE.value
        existing = self.database_repo.get_certificate_by_domain(domain)
        if existing:
            return {
                "success": False,
                "message": f"Certificate already exists for domain {domain}",
            }
        info = extract_cert_info_from_pem_sync(certificate)
        final_issuer = issuer or info.get("issuer", "Unknown")
        cert_obj = self.database_repo.create_certificate(
            store=actual_store,
            domain=domain,
            certificate=certificate,
            private_key=private_key,
            sans=sans,
            issuer=final_issuer,
            not_before=info.get("not_before"),
            not_after=info.get("not_after"),
            is_valid=info.get("is_valid", True),
            days_remaining=info.get("days_remaining"),
            folder_name=folder_name,
            email=email,
        )
        if cert_obj:
            cid = getattr(cert_obj, "id", None)
            if cid and self.pipeline_repo:
                self.pipeline_repo.send_parse_certificate_event(str(cid))
            self.invalidate_cache([CertificateStore.DATABASE.value], trigger="add")
            return {"success": True, "message": "Certificate created", "certificate_id": cid}
        return {"success": False, "message": "Failed to create certificate"}

    def update_manual_add_certificate(
        self,
        certificate_id: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
        sans: Optional[list[str]] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
    ) -> dict[str, Any]:
        cur = self.database_repo.get_certificate_by_id(certificate_id)
        if not cur:
            return {"success": False, "message": "Not found"}
        info = extract_cert_info_from_pem_sync(certificate) if certificate else {}
        self.database_repo.update_certificate_by_id(
            certificate_id,
            certificate=certificate,
            private_key=private_key,
            store=store,
            sans=sans,
            folder_name=folder_name,
            email=email,
            issuer=info.get("issuer"),
            not_before=info.get("not_before"),
            not_after=info.get("not_after"),
            is_valid=info.get("is_valid"),
            days_remaining=info.get("days_remaining"),
        )
        stores = {str(cur.get("store", CertificateStore.DATABASE.value))}
        if store:
            stores.add(str(store))
        self.invalidate_cache(sorted(stores), trigger="update")
        return {"success": True, "message": "Updated"}

    def update_manual_apply_certificate(
        self, domain: str, folder_name: str, store: Optional[str] = None
    ) -> dict[str, Any]:
        self.database_repo.update_certificate(
            domain,
            CertificateSource.MANUAL_APPLY.value,
            store=store,
            folder_name=folder_name,
        )
        return {"success": True, "message": "Updated"}

    def delete_certificate(self, certificate_id: str) -> dict[str, Any]:
        ok = self.database_repo.delete_certificate_by_id(certificate_id)
        if ok:
            self.invalidate_cache(
                [
                    CertificateStore.WEBSITES.value,
                    CertificateStore.APIS.value,
                    CertificateStore.DATABASE.value,
                ],
                trigger="delete",
            )
            return {"success": True, "message": "Deleted"}
        return {"success": False, "message": "Not found"}

    def _apply_manual_apply_impl(
        self,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list[str]],
        webroot: Optional[str],
        force_renewal: bool = False,
    ) -> dict[str, Any]:
        """同步：ACME 申请并写入 database / manual_apply 行。供 reapply 与后台线程共用。"""
        if not self.tls_repo:
            return {
                "success": False,
                "message": "TLS 签发未配置",
                "status": CertificateStatus.FAIL.value,
                "error": "no_tls_repo",
            }
        logger.info(
            "manual_apply_impl start domain=%s email=%s folder_name=%s sans=%s force_renewal=%s webroot=%s",
            domain,
            email,
            folder_name,
            sans,
            force_renewal,
            webroot,
        )
        try:
            ar = self.tls_repo.apply_certificate(
                domain=domain,
                email=email,
                sans=sans,
                webroot=webroot,
                folder_name=folder_name,
                force_renewal=force_renewal,
            )
            if ar.get("success"):
                cert_pem, key_pem = ar.get("certificate"), ar.get("private_key")
                if cert_pem and key_pem:
                    cert_info = extract_cert_info_from_pem_sync(cert_pem)
                    row = self.database_repo.create_or_update_certificate(
                        store=CertificateStore.DATABASE.value,
                        domain=domain,
                        certificate=cert_pem,
                        private_key=key_pem,
                        source=CertificateSource.MANUAL_APPLY.value,
                        status=CertificateStatus.SUCCESS.value,
                        email=email,
                        sans=sans,
                        folder_name=folder_name,
                        issuer=cert_info.get("issuer", "Let's Encrypt"),
                        not_before=cert_info.get("not_before"),
                        not_after=cert_info.get("not_after"),
                        is_valid=cert_info.get("is_valid", True),
                        days_remaining=cert_info.get("days_remaining"),
                    )
                    self.invalidate_cache([CertificateStore.DATABASE.value], trigger="add")
                    cid = str(row.id) if row and getattr(row, "id", None) else None
                    return {
                        "success": True,
                        "message": ar.get("message") or "申请成功",
                        "status": CertificateStatus.SUCCESS.value,
                        "error": None,
                        "certificate_id": cid,
                    }
                row = self.database_repo.create_or_update_certificate(
                    store=CertificateStore.DATABASE.value,
                    domain=domain,
                    source=CertificateSource.MANUAL_APPLY.value,
                    status=CertificateStatus.SUCCESS.value,
                    email=email,
                    sans=sans,
                    folder_name=folder_name,
                )
                self.invalidate_cache([CertificateStore.DATABASE.value], trigger="add")
                cid = str(row.id) if row and getattr(row, "id", None) else None
                return {
                    "success": True,
                    "message": ar.get("message") or "申请成功（无 PEM 回写）",
                    "status": CertificateStatus.SUCCESS.value,
                    "error": None,
                    "certificate_id": cid,
                }
            self.database_repo.create_or_update_certificate(
                store=CertificateStore.DATABASE.value,
                domain=domain,
                source=CertificateSource.MANUAL_APPLY.value,
                status=CertificateStatus.FAIL.value,
                email=email,
                sans=sans,
                folder_name=folder_name,
            )
            logger.error(
                "manual_apply_impl certbot/db fail domain=%s folder_name=%s message=%s error=%s",
                domain,
                folder_name,
                ar.get("message"),
                ar.get("error"),
            )
            return {
                "success": False,
                "message": ar.get("message") or "申请失败",
                "status": CertificateStatus.FAIL.value,
                "error": ar.get("error"),
            }
        except Exception as e:  # noqa: BLE001
            logger.exception("apply manual_apply")
            self.database_repo.create_or_update_certificate(
                store=CertificateStore.DATABASE.value,
                domain=domain,
                source=CertificateSource.MANUAL_APPLY.value,
                status=CertificateStatus.FAIL.value,
                email=email,
                sans=sans,
                folder_name=folder_name,
            )
            return {
                "success": False,
                "message": str(e),
                "status": CertificateStatus.FAIL.value,
                "error": "exception",
            }

    def _apply_bg(
        self,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list[str]],
        webroot: Optional[str],
    ) -> None:
        self._apply_manual_apply_impl(domain, email, folder_name, sans, webroot, force_renewal=False)

    def apply_certificate(
        self,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list[str]] = None,
        webroot: Optional[str] = None,
    ) -> dict[str, Any]:
        ex = self.database_repo.get_certificate_by_domain(domain)
        if ex and ex.get("status") == CertificateStatus.PROCESS.value:
            return {
                "success": False,
                "message": "Application in progress",
                "status": CertificateStatus.PROCESS.value,
                "error": "in progress",
            }
        self.database_repo.create_or_update_certificate(
            store=CertificateStore.DATABASE.value,
            domain=domain,
            source=CertificateSource.MANUAL_APPLY.value,
            status=CertificateStatus.PROCESS.value,
            email=email,
            sans=sans,
            folder_name=folder_name,
        )
        logger.info(
            "apply_certificate async spawn domain=%s folder_name=%s sans=%s webroot=%s",
            domain,
            folder_name,
            sans,
            webroot,
        )
        threading.Thread(
            target=self._apply_bg,
            args=(domain, email, folder_name, sans, webroot),
            daemon=True,
            name=f"cert-apply-{domain}",
        ).start()
        return {
            "success": True,
            "message": "Started",
            "status": CertificateStatus.PROCESS.value,
            "error": None,
        }

    def search_certificate(
        self,
        keyword: str,
        store: Optional[str] = None,
        source: Optional[str] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> dict[str, Any]:
        rows, total = self.database_repo.search_certificates(
            keyword, store=store, source=source, offset=offset, limit=limit
        )
        return {"items": rows, "total": total}

    def parse_certificate(self, certificate_id: str) -> dict[str, Any]:
        cert_obj = self.database_repo.get_certificate_by_id(certificate_id)
        if not cert_obj:
            return {"success": False, "message": "Not found"}
        if not cert_obj.get("certificate"):
            self.database_repo.update_certificate_parse_result(
                certificate_id,
                status=CertificateStatus.FAIL.value,
                is_valid=False,
                days_remaining=0,
            )
            return {"success": False, "message": "Empty certificate"}
        info = extract_cert_info_from_pem_sync(cert_obj["certificate"])
        if not info:
            self.database_repo.update_certificate_parse_result(
                certificate_id,
                status=CertificateStatus.FAIL.value,
                is_valid=False,
                days_remaining=0,
            )
            return {"success": False, "message": "Parse failed"}
        self.database_repo.update_certificate_parse_result(
            certificate_id,
            status=CertificateStatus.SUCCESS.value,
            sans=info.get("sans"),
            issuer=info.get("issuer"),
            email=info.get("email"),
            not_before=info.get("not_before"),
            not_after=info.get("not_after"),
            is_valid=info.get("is_valid"),
            days_remaining=info.get("days_remaining"),
        )
        return {"success": True, "message": "Parsed"}

    def _reapply_via_manual_apply_sync(
        self,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list[str]],
        webroot: Optional[str],
        force_renewal: bool,
    ) -> dict[str, Any]:
        """reapply（manual-apply / manual-add）：先置 PROCESS 再同步跑 ACME。"""
        ex = self.database_repo.get_certificate_by_domain(domain)
        if ex and ex.get("status") == CertificateStatus.PROCESS.value:
            return {
                "success": False,
                "message": "Application in progress",
                "status": CertificateStatus.PROCESS.value,
                "error": "in progress",
            }
        self.database_repo.create_or_update_certificate(
            store=CertificateStore.DATABASE.value,
            domain=domain,
            source=CertificateSource.MANUAL_APPLY.value,
            status=CertificateStatus.PROCESS.value,
            email=email,
            sans=sans,
            folder_name=folder_name,
        )
        return self._apply_manual_apply_impl(
            domain, email, folder_name, sans, webroot, force_renewal=force_renewal
        )

    def reapply_auto_certificate(
        self,
        certificate_id: str,
        email: str,
        sans: Optional[list[str]] = None,
        webroot: Optional[str] = None,
        force_renewal: bool = False,
    ) -> dict[str, Any]:
        cur = self.database_repo.get_certificate_by_id(certificate_id)
        if not cur or cur.get("source") != CertificateSource.AUTO.value:
            return {"success": False, "message": "Certificate not AUTO source"}
        domain = cur.get("domain")
        folder = cur.get("folder_name")
        if not self.tls_repo:
            return {
                "success": False,
                "message": "TLS 签发未配置",
                "status": CertificateStatus.FAIL.value,
                "error": "no_tls_repo",
            }
        self.database_repo.update_certificate_by_id(
            certificate_id, status=CertificateStatus.PROCESS.value
        )
        logger.info(
            "reapply_auto start certificate_id=%s domain=%s folder=%s sans=%s force_renewal=%s webroot=%s",
            certificate_id,
            domain,
            folder,
            sans,
            force_renewal,
            webroot,
        )
        ar = self.tls_repo.apply_certificate(
            domain=str(domain),
            email=email,
            sans=sans,
            webroot=webroot,
            folder_name=str(folder) if folder else None,
            force_renewal=force_renewal,
        )
        if ar.get("success") and ar.get("certificate") and ar.get("private_key"):
            info = extract_cert_info_from_pem_sync(ar["certificate"])
            self.database_repo.update_certificate_by_id(
                certificate_id,
                certificate=ar["certificate"],
                private_key=ar["private_key"],
                status=CertificateStatus.SUCCESS.value,
                issuer=info.get("issuer"),
                not_before=info.get("not_before"),
                not_after=info.get("not_after"),
                is_valid=info.get("is_valid"),
                days_remaining=info.get("days_remaining"),
            )
            self.invalidate_cache([CertificateStore.DATABASE.value], trigger="add")
            logger.info("reapply_auto success certificate_id=%s domain=%s", certificate_id, domain)
            return {
                "success": True,
                "message": ar.get("message") or "续签成功",
                "status": CertificateStatus.SUCCESS.value,
                "certificate_id": certificate_id,
                "error": None,
            }
        err_text = ar.get("message") or ar.get("error") or "apply failed"
        logger.error(
            "reapply_auto failed certificate_id=%s domain=%s\n--- message ---\n%s\n--- error ---\n%s",
            certificate_id,
            domain,
            ar.get("message"),
            ar.get("error"),
        )
        self.database_repo.update_certificate_by_id(
            certificate_id,
            status=CertificateStatus.FAIL.value,
            last_error_message=str(err_text),
        )
        self.invalidate_cache([CertificateStore.DATABASE.value], trigger="add")
        return {
            "success": False,
            "message": ar.get("message") or "续签失败",
            "status": CertificateStatus.FAIL.value,
            "certificate_id": certificate_id,
            "error": ar.get("error"),
        }

    def reapply_manual_apply_certificate(
        self,
        certificate_id: str,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list[str]] = None,
        webroot: Optional[str] = None,
        force_renewal: bool = False,
    ) -> dict[str, Any]:
        row = self.database_repo.get_certificate_by_id(certificate_id)
        if not row:
            return {
                "success": False,
                "message": "Certificate not found",
                "status": CertificateStatus.FAIL.value,
                "error": "not_found",
            }
        if str(row.get("domain") or "") != str(domain):
            return {
                "success": False,
                "message": "certificate_id 与 domain 不一致",
                "status": CertificateStatus.FAIL.value,
                "error": "domain_mismatch",
            }
        return self._reapply_via_manual_apply_sync(
            domain, email, folder_name, sans, webroot, force_renewal
        )

    def reapply_manual_add_certificate(
        self,
        certificate_id: str,
        email: str,
        sans: Optional[list[str]] = None,
        webroot: Optional[str] = None,
        force_renewal: bool = False,
    ) -> dict[str, Any]:
        cur = self.database_repo.get_certificate_by_id(certificate_id)
        if not cur:
            return {"success": False, "message": "Not found"}
        return self._reapply_via_manual_apply_sync(
            str(cur["domain"]),
            email,
            str(cur.get("folder_name") or ""),
            sans,
            webroot,
            force_renewal,
        )
