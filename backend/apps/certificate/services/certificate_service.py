"""TLS 证书 Service。"""
from __future__ import annotations

import logging
from typing import Any, Optional

from config.types import CertConfig, DatabaseConfig
from enums import CertificateStatus
from utils import extract_cert_info_from_pem_sync

from apps.certificate.repos.certificate_cache_repo import CertificateCacheRepo
from apps.certificate.repos.certificate_repository import CertificateRepository
from apps.certificate.repos.tls_issue_repository import TlsIssueRepository
from apps.certificate.kafka.certificate_pipeline import CertificatePipeline

logger = logging.getLogger(__name__)


def _normalized_sans_set(sans: Any) -> frozenset[str]:
    if not sans or not isinstance(sans, list):
        return frozenset()
    out: set[str] = set()
    for x in sans:
        s = str(x).strip().lower()
        if s:
            out.add(s)
    return frozenset(out)


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
        offset: int = 0,
        limit: int = 20,
        use_cache: bool = True,
    ) -> dict[str, Any]:
        if use_cache:
            c = self.cache_repo.get_certificate_list(offset, limit)
            if c:
                return c
        cert_dicts, total = self.database_repo.get_certificate_list(offset, limit)
        items = []
        for d in cert_dicts:
            if not d or not d.get("domain"):
                continue
            items.append(
                {
                    "id": d.get("id"),
                    "domain": d.get("domain", ""),
                    "folder_name": d.get("folder_name"),
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
                    "sans_changed": bool(d.get("sans_changed")),
                    "last_error_message": d.get("last_error_message"),
                    "last_error_time": d.get("last_error_time"),
                }
            )
        result: dict[str, Any] = {"items": items, "total": total}
        if use_cache:
            self.cache_repo.set_certificate_list(offset, limit, result, ttl=300)
        return result

    def get_certificate_detail_by_id(
        self, certificate_id: str, use_cache: bool = True
    ) -> Optional[dict[str, Any]]:
        cert_dict = self.database_repo.get_certificate_by_id(certificate_id)
        if not cert_dict:
            return None
        domain = cert_dict.get("domain")
        if use_cache and domain:
            cached = self.cache_repo.get_certificate_detail(str(domain))
            if cached and cached.get("id") == certificate_id:
                if cached.get("sans") is None:
                    cached["sans"] = []
                return cached
        nb = cert_dict.get("not_before")
        na = cert_dict.get("not_after")
        result = {
            "id": cert_dict.get("id"),
            "domain": cert_dict["domain"],
            "folder_name": cert_dict.get("folder_name"),
            "status": cert_dict.get("status"),
            "email": cert_dict.get("email"),
            "certificate": cert_dict["certificate"],
            "private_key": cert_dict["private_key"],
            "sans": cert_dict.get("sans") or [],
            "issuer": cert_dict.get("issuer"),
            "not_before": nb.isoformat() if hasattr(nb, "isoformat") else nb,
            "not_after": na.isoformat() if hasattr(na, "isoformat") else na,
            "is_valid": cert_dict.get("is_valid"),
            "days_remaining": cert_dict.get("days_remaining"),
            "last_error_message": cert_dict.get("last_error_message"),
            "last_error_time": cert_dict.get("last_error_time"),
            "sans_changed": bool(cert_dict.get("sans_changed")),
        }
        if use_cache and domain:
            self.cache_repo.set_certificate_detail(str(domain), result, ttl=60)
        return result

    def invalidate_cache(self, trigger: str = "manual") -> bool:
        self.cache_repo.clear_all_certificate_cache()
        if self.pipeline_repo:
            return self.pipeline_repo.send_cache_invalidate_event(trigger=trigger)
        return True

    def apply_new_certificate(
        self,
        domain: str,
        email: str,
        sans: Optional[list[str]] = None,
        folder_name: Optional[str] = None,
        webroot: Optional[str] = None,
        force_renewal: bool = False,
    ) -> dict[str, Any]:
        """通过 Certbot 申请新证书并入库（仅新建；已存在域名会拒绝）。"""
        if not self.tls_repo:
            return {"success": False, "message": "TLS 签发未配置或未启用"}
        domain_clean = (domain or "").strip()
        email_clean = (email or "").strip()
        if not domain_clean or not email_clean:
            return {"success": False, "message": "domain 与 email 不能为空"}
        existing = self.database_repo.get_certificate_by_domain(domain_clean)
        if existing:
            return {
                "success": False,
                "message": f"域名已存在，无法重复申请: {domain_clean}",
            }
        return self._run_tls_apply_and_persist(
            domain_clean=domain_clean,
            email_clean=email_clean,
            sans=sans,
            folder_name=folder_name,
            webroot=webroot,
            force_renewal=force_renewal,
            renew_certificate_id=None,
        )

    def reapply_certificate(
        self,
        certificate_id: str,
        force_renewal: bool = False,
    ) -> dict[str, Any]:
        """从数据库读取域名、邮箱、SAN 等后重新签发并更新同一条记录；请求体只需 id 与 force。"""
        if not self.tls_repo:
            return {"success": False, "message": "TLS 签发未配置或未启用"}
        cid = (certificate_id or "").strip()
        if not cid:
            return {"success": False, "message": "certificate_id 无效"}
        row = self.database_repo.get_certificate_by_id(cid)
        if not row:
            return {"success": False, "message": "证书不存在"}
        domain_clean = (row.get("domain") or "").strip()
        email_clean = (row.get("email") or "").strip()
        if not domain_clean:
            return {"success": False, "message": "记录中缺少域名"}
        if not email_clean:
            return {"success": False, "message": "请先补全联系邮箱后再重新申请"}
        raw_sans = row.get("sans")
        sans_list: Optional[list[str]] = None
        if isinstance(raw_sans, list) and raw_sans:
            sans_list = [str(x).strip() for x in raw_sans if str(x).strip()]
        folder_name = row.get("folder_name")
        folder_name_s = folder_name.strip() if isinstance(folder_name, str) else None
        return self._run_tls_apply_and_persist(
            domain_clean=domain_clean,
            email_clean=email_clean,
            sans=sans_list,
            folder_name=folder_name_s,
            webroot=None,
            force_renewal=force_renewal,
            renew_certificate_id=cid,
        )

    def _run_tls_apply_and_persist(
        self,
        *,
        domain_clean: str,
        email_clean: str,
        sans: Optional[list[str]],
        folder_name: Optional[str],
        webroot: Optional[str],
        force_renewal: bool,
        renew_certificate_id: Optional[str],
    ) -> dict[str, Any]:
        assert self.tls_repo
        r = self.tls_repo.apply_certificate(
            domain=domain_clean,
            email=email_clean,
            sans=sans,
            webroot=webroot,
            folder_name=folder_name,
            force_renewal=force_renewal,
        )
        if not r.get("success"):
            out: dict[str, Any] = {
                "success": False,
                "message": (r.get("message") or r.get("error") or "证书申请失败").strip(),
                "error": r.get("error"),
                "status": r.get("status"),
            }
            if r.get("rate_limit") is not None:
                out["rate_limit"] = r.get("rate_limit")
            if r.get("retry_after") is not None:
                out["retry_after"] = r.get("retry_after")
            return out
        certificate = (r.get("certificate") or "").strip()
        private_key = (r.get("private_key") or "").strip()
        if not certificate or not private_key:
            return {"success": False, "message": "签发结果中缺少证书或私钥 PEM"}
        info = extract_cert_info_from_pem_sync(certificate)
        parsed_sans = info.get("sans") or []
        all_domains = info.get("all_domains", [])
        if not isinstance(all_domains, list):
            all_domains = []
        cn = info.get("common_name") or (info.get("subject") or {}).get("CN", "") or domain_clean
        if cn and cn not in all_domains:
            all_domains.insert(0, cn)
        for s in parsed_sans:
            if s and s not in all_domains:
                all_domains.append(s)
        final_issuer = info.get("issuer") or "Let's Encrypt"
        if renew_certificate_id:
            updated = self.database_repo.update_certificate_by_id(
                renew_certificate_id,
                certificate=certificate,
                private_key=private_key,
                sans=all_domains if all_domains else None,
                issuer=final_issuer,
                not_before=info.get("not_before"),
                not_after=info.get("not_after"),
                is_valid=info.get("is_valid", True),
                days_remaining=info.get("days_remaining"),
                folder_name=folder_name,
                email=email_clean,
                status=CertificateStatus.PROCESS.value,
                sans_changed=False,
            )
            if updated:
                if self.pipeline_repo:
                    self.pipeline_repo.send_parse_certificate_event(str(renew_certificate_id))
                self.invalidate_cache(trigger="update")
                return {
                    "success": True,
                    "message": r.get("message") or "证书已重新申请并更新",
                    "certificate_id": str(renew_certificate_id),
                    "status": r.get("status"),
                }
            return {"success": False, "message": "更新失败"}
        cert_obj = self.database_repo.create_certificate(
            domain=domain_clean,
            certificate=certificate,
            private_key=private_key,
            sans=all_domains if all_domains else None,
            issuer=final_issuer,
            not_before=info.get("not_before"),
            not_after=info.get("not_after"),
            is_valid=info.get("is_valid", True),
            days_remaining=info.get("days_remaining"),
            folder_name=folder_name,
            email=email_clean,
        )
        if cert_obj:
            cid = getattr(cert_obj, "id", None)
            if cid and self.pipeline_repo:
                self.pipeline_repo.send_parse_certificate_event(str(cid))
            self.invalidate_cache(trigger="add")
            return {
                "success": True,
                "message": r.get("message") or "证书已申请并入库",
                "certificate_id": str(cid) if cid else None,
                "status": r.get("status"),
            }
        return {"success": False, "message": "入库失败"}

    def create_certificate(
        self,
        domain: str,
        certificate: str,
        private_key: str,
        sans: Optional[list[str]] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
        issuer: Optional[str] = None,
    ) -> dict[str, Any]:
        existing = self.database_repo.get_certificate_by_domain(domain)
        if existing:
            return {
                "success": False,
                "message": f"Certificate already exists for domain {domain}",
            }
        info = extract_cert_info_from_pem_sync(certificate)
        final_issuer = issuer or info.get("issuer", "Unknown")
        cert_obj = self.database_repo.create_certificate(
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
            self.invalidate_cache(trigger="add")
            return {"success": True, "message": "Certificate created", "certificate_id": cid}
        return {"success": False, "message": "Failed to create certificate"}

    def update_manual_add_certificate(
        self,
        certificate_id: str,
        sans: Optional[list[str]] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
    ) -> dict[str, Any]:
        cur = self.database_repo.get_certificate_by_id(certificate_id)
        if not cur:
            return {"success": False, "message": "Not found"}
        sans_changed_update: Optional[bool] = None
        if sans is not None:
            sans_changed_update = _normalized_sans_set(sans) != _normalized_sans_set(cur.get("sans"))
        self.database_repo.update_certificate_by_id(
            certificate_id,
            sans=sans,
            folder_name=folder_name,
            email=email,
            sans_changed=sans_changed_update,
        )
        self.invalidate_cache(trigger="update")
        return {"success": True, "message": "Updated"}

    def delete_certificate(self, certificate_id: str) -> dict[str, Any]:
        ok = self.database_repo.delete_certificate_by_id(certificate_id)
        if ok:
            self.invalidate_cache(trigger="delete")
            return {"success": True, "message": "Deleted"}
        return {"success": False, "message": "Not found"}

    def search_certificate(
        self,
        keyword: str,
        offset: int = 0,
        limit: int = 20,
    ) -> dict[str, Any]:
        rows, total = self.database_repo.search_certificates(
            keyword, offset=offset, limit=limit
        )
        return {"items": rows, "total": total}

    def parse_certificate_preview(self, certificate_pem: str) -> dict[str, Any]:
        """解析 PEM（不入库），供前端上传回填。"""
        pem = (certificate_pem or "").strip()
        if not pem:
            return {"success": False, "message": "certificate is empty"}
        try:
            info = extract_cert_info_from_pem_sync(pem)
        except Exception as e:  # noqa: BLE001
            logger.exception("parse_certificate_preview")
            return {"success": False, "message": str(e)}
        if not info:
            return {"success": False, "message": "Parse failed"}
        domain = info.get("common_name") or (info.get("subject") or {}).get("CN", "")
        sans = info.get("sans") or []
        all_domains = info.get("all_domains", [])
        if not isinstance(all_domains, list):
            all_domains = []
        if domain and domain not in all_domains:
            all_domains.insert(0, domain)
        nb = info.get("not_before")
        na = info.get("not_after")
        return {
            "success": True,
            "message": "OK",
            "domain": domain or None,
            "sans": all_domains if all_domains else sans,
            "issuer": info.get("issuer"),
            "not_before": nb.isoformat() if hasattr(nb, "isoformat") else nb,
            "not_after": na.isoformat() if hasattr(na, "isoformat") else na,
            "is_valid": info.get("is_valid", True),
            "days_remaining": info.get("days_remaining"),
        }

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
            sans_changed=False,
        )
        return {"success": True, "message": "Parsed"}
