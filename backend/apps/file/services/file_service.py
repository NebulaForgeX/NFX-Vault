# coding=utf-8
"""文件域 Service：证书目录导出/列举/下载/删除（仅 Websites 磁盘树）。"""
from __future__ import annotations

import json
import logging
import os
import shutil
from datetime import datetime
from typing import Any, Optional

from apps.certificate.kafka.certificate_pipeline import CertificatePipeline
from apps.certificate.models import TLSCertificate
from apps.certificate.repos.certificate_repository import CertificateRepository
from config.types import DatabaseConfig
from enums import CertificateStatus
from utils import extract_cert_info_from_pem_sync

logger = logging.getLogger(__name__)

WEBSITES_STORE = "websites"

_TASK = "disk_cert_import"


def _log_disk_import(record: dict[str, Any]) -> None:
    payload = dict(record)
    payload.setdefault("task", _TASK)
    logger.info(json.dumps(payload, ensure_ascii=False, default=str))


def _log_disk_import_error(record: dict[str, Any], exc: BaseException) -> None:
    payload = dict(record)
    payload.setdefault("task", _TASK)
    payload["error"] = str(exc)
    logger.error(json.dumps(payload, ensure_ascii=False, default=str), exc_info=True)


def _fmt_dt(value: Any) -> Optional[str]:
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


class FileService:
    def __init__(
        self,
        base_dir: str,
        database_repo: CertificateRepository,
        pipeline_repo: Optional[CertificatePipeline] = None,
        db_config: Optional[DatabaseConfig] = None,
    ) -> None:
        self.base_dir = base_dir
        self.database_repo = database_repo
        self.pipeline_repo = pipeline_repo
        self.db_config = db_config

    async def read_folders_and_store_certificates(self, store: str = WEBSITES_STORE) -> dict[str, Any]:
        """读取磁盘证书目录写入 DB（启动时仅调用 websites）。"""
        if not self.database_repo.db_session.enable_mysql:
            return {"success": False, "message": "Database repository not initialized", "processed": 0}
        base_dir = self.base_dir
        store_dir = os.path.join(base_dir, store.capitalize())
        if not os.path.exists(store_dir):
            return {"success": True, "message": f"Directory not found: {store_dir}", "processed": 0}
        try:
            inserted_count = 0
            skipped_existing_count = 0
            skipped_missing_files_count = 0
            skipped_no_domain_count = 0
            failed_count = 0
            for folder_name in os.listdir(store_dir):
                folder_path = os.path.join(store_dir, folder_name)
                if not os.path.isdir(folder_path) or folder_name.startswith("."):
                    continue
                cert_file = os.path.join(folder_path, "cert.crt")
                key_file = os.path.join(folder_path, "key.key")
                if not os.path.exists(cert_file) or not os.path.exists(key_file):
                    has_c = os.path.exists(cert_file)
                    has_k = os.path.exists(key_file)
                    _log_disk_import(
                        {
                            "event": "skip_missing_files",
                            "store": store,
                            "disk_folder": folder_name,
                            "path": folder_path,
                            "has_cert_crt": has_c,
                            "has_key_key": has_k,
                        }
                    )
                    skipped_missing_files_count += 1
                    continue
                try:
                    with open(cert_file, encoding="utf-8") as f:
                        cert_pem = f.read()
                    with open(key_file, encoding="utf-8") as f:
                        key_pem = f.read()
                    cert_info = extract_cert_info_from_pem_sync(cert_pem)
                    domain = cert_info.get("common_name") or (
                        cert_info.get("subject") or {}
                    ).get("CN", "")
                    if not domain:
                        _log_disk_import(
                            {
                                "event": "skip_no_domain",
                                "store": store,
                                "disk_folder": folder_name,
                                "path": folder_path,
                            }
                        )
                        skipped_no_domain_count += 1
                        continue
                    parsed_sans = cert_info.get("sans", [])
                    all_domains = cert_info.get("all_domains", [])
                    if not isinstance(all_domains, list):
                        all_domains = []
                    if domain and domain not in all_domains:
                        all_domains.insert(0, domain)
                    if parsed_sans:
                        for san in parsed_sans:
                            if san and san not in all_domains:
                                all_domains.append(san)
                    with self.database_repo.db_session.get_session() as session:
                        existing = (
                            session.query(TLSCertificate)
                            .filter(TLSCertificate.domain == domain)
                            .first()
                        )
                        if existing:
                            _log_disk_import(
                                {
                                    "event": "skip_domain_exists",
                                    "store": store,
                                    "disk_folder": folder_name,
                                    "domain": domain,
                                    "certificate_id": existing.id,
                                    "db_folder_name": existing.folder_name,
                                    "db_status": existing.status.value if existing.status else None,
                                    "db_issuer": existing.issuer,
                                    "db_not_before": _fmt_dt(existing.not_before),
                                    "db_not_after": _fmt_dt(existing.not_after),
                                    "db_days_remaining": existing.days_remaining,
                                    "db_sans": existing.sans,
                                    "db_updated_at": _fmt_dt(existing.updated_at),
                                }
                            )
                            skipped_existing_count += 1
                            continue
                        new_cert = TLSCertificate(
                            domain=domain,
                            folder_name=folder_name,
                            certificate=cert_pem,
                            private_key=key_pem,
                            status=CertificateStatus.SUCCESS,
                            sans=all_domains if all_domains else [],
                            issuer=cert_info.get("issuer", "Let's Encrypt"),
                            not_before=cert_info.get("not_before"),
                            not_after=cert_info.get("not_after"),
                            is_valid=cert_info.get("is_valid", True),
                            days_remaining=cert_info.get("days_remaining"),
                        )
                        session.add(new_cert)
                        session.flush()
                        _log_disk_import(
                            {
                                "event": "insert_ok",
                                "store": store,
                                "disk_folder": folder_name,
                                "certificate_id": new_cert.id,
                                "domain": domain,
                                "issuer": new_cert.issuer,
                                "not_before": _fmt_dt(new_cert.not_before),
                                "not_after": _fmt_dt(new_cert.not_after),
                                "days_remaining": new_cert.days_remaining,
                                "is_valid": new_cert.is_valid,
                                "sans": new_cert.sans,
                            }
                        )
                        inserted_count += 1
                except Exception as e:  # noqa: BLE001
                    _log_disk_import_error(
                        {
                            "event": "row_error",
                            "store": store,
                            "disk_folder": folder_name,
                            "path": folder_path,
                        },
                        e,
                    )
                    failed_count += 1
            msg = (
                f"read_folders_and_store_certificates store={store}: "
                f"inserted={inserted_count} skipped_existing={skipped_existing_count} "
                f"skipped_missing_files={skipped_missing_files_count} "
                f"skipped_no_domain={skipped_no_domain_count} failed={failed_count}"
            )
            _log_disk_import(
                {
                    "event": "batch_summary",
                    "store": store,
                    "inserted": inserted_count,
                    "skipped_existing": skipped_existing_count,
                    "skipped_missing_files": skipped_missing_files_count,
                    "skipped_no_domain": skipped_no_domain_count,
                    "failed": failed_count,
                    "message": msg,
                }
            )
            return {
                "success": True,
                "message": msg,
                "processed": inserted_count,
                "inserted": inserted_count,
                "skipped_existing": skipped_existing_count,
                "skipped_missing_files": skipped_missing_files_count,
                "skipped_no_domain": skipped_no_domain_count,
                "failed": failed_count,
            }
        except Exception as e:  # noqa: BLE001
            _log_disk_import_error({"event": "batch_fatal", "store": store}, e)
            return {"success": False, "message": str(e), "processed": 0}

    def export_certificates(self) -> dict[str, Any]:
        try:
            cert_dicts, _total = self.database_repo.get_certificate_list(
                offset=0, limit=10000
            )
            exported_certs: list[dict[str, Any]] = []
            store = WEBSITES_STORE
            for cert_dict in cert_dicts:
                domain = cert_dict.get("domain")
                if not domain:
                    continue
                cert_detail = self.database_repo.get_certificate_by_domain(domain)
                if not cert_detail:
                    continue
                folder_name = cert_detail.get("folder_name")
                if folder_name:
                    store_dir = os.path.join(self.base_dir, store.capitalize())
                    folder_path = os.path.join(store_dir, folder_name)
                    os.makedirs(folder_path, exist_ok=True)
                    cert_file = os.path.join(folder_path, "cert.crt")
                    key_file = os.path.join(folder_path, "key.key")
                    with open(cert_file, "w", encoding="utf-8") as f:
                        f.write(cert_detail.get("certificate", "") or "")
                    with open(key_file, "w", encoding="utf-8") as f:
                        f.write(cert_detail.get("private_key", "") or "")
                nb = cert_detail.get("not_before")
                na = cert_detail.get("not_after")
                exported_certs.append(
                    {
                        "domain": cert_detail.get("domain"),
                        "folder_name": cert_detail.get("folder_name"),
                        "status": cert_detail.get("status"),
                        "certificate": cert_detail.get("certificate"),
                        "private_key": cert_detail.get("private_key"),
                        "sans": cert_detail.get("sans") or [],
                        "issuer": cert_detail.get("issuer"),
                        "not_before": nb.isoformat() if nb and hasattr(nb, "isoformat") else nb,
                        "not_after": na.isoformat() if na and hasattr(na, "isoformat") else na,
                        "is_valid": cert_detail.get("is_valid"),
                        "days_remaining": cert_detail.get("days_remaining"),
                    }
                )
            return {
                "success": True,
                "message": f"Successfully exported {len(exported_certs)} certificates",
                "certificates": exported_certs,
                "total": len(exported_certs),
            }
        except Exception as e:  # noqa: BLE001
            logger.error("export_certificates: %s", e, exc_info=True)
            return {
                "success": False,
                "message": str(e),
                "certificates": [],
                "total": 0,
            }

    def export_single_certificate(self, certificate_id: str) -> dict[str, Any]:
        store = WEBSITES_STORE
        try:
            cert_detail = self.database_repo.get_certificate_by_id(certificate_id)
            if not cert_detail:
                return {
                    "success": False,
                    "message": f"Certificate not found: {certificate_id}",
                    "certificate_id": certificate_id,
                }
            folder_name = cert_detail.get("folder_name")
            if not folder_name:
                return {
                    "success": False,
                    "message": f"Folder name not found for certificate: {certificate_id}",
                    "certificate_id": certificate_id,
                }
            domain = cert_detail.get("domain")
            certificate = cert_detail.get("certificate", "") or ""
            private_key = cert_detail.get("private_key", "") or ""
            if not certificate or not private_key:
                return {
                    "success": False,
                    "message": f"Certificate or private key is empty for certificate: {certificate_id}",
                    "certificate_id": certificate_id,
                }
            store_dir = os.path.join(self.base_dir, store.capitalize())
            folder_path = os.path.join(store_dir, folder_name)
            os.makedirs(folder_path, exist_ok=True)
            with open(os.path.join(folder_path, "cert.crt"), "w", encoding="utf-8") as f:
                f.write(certificate)
            with open(os.path.join(folder_path, "key.key"), "w", encoding="utf-8") as f:
                f.write(private_key)
            if self.database_repo.db_session.enable_mysql:
                try:
                    cert_info = extract_cert_info_from_pem_sync(certificate)
                    parsed_sans = cert_info.get("sans", [])
                    all_domains = cert_info.get("all_domains", [])
                    if not isinstance(all_domains, list):
                        all_domains = []
                    if domain and domain not in all_domains:
                        all_domains.insert(0, domain)
                    if parsed_sans:
                        for san in parsed_sans:
                            if san and san not in all_domains:
                                all_domains.append(san)
                    with self.database_repo.db_session.get_session() as session:
                        existing = (
                            session.query(TLSCertificate)
                            .filter(TLSCertificate.domain == domain)
                            .first()
                        )
                        if existing:
                            existing.folder_name = folder_name
                            existing.certificate = certificate
                            existing.private_key = private_key
                            existing.sans = all_domains if all_domains else cert_detail.get("sans", [])
                            existing.issuer = cert_info.get("issuer") or cert_detail.get("issuer")
                            existing.not_before = cert_info.get("not_before") or cert_detail.get(
                                "not_before"
                            )
                            existing.not_after = cert_info.get("not_after") or cert_detail.get(
                                "not_after"
                            )
                            existing.is_valid = (
                                cert_info.get("is_valid")
                                if cert_info.get("is_valid") is not None
                                else cert_detail.get("is_valid", True)
                            )
                            existing.days_remaining = (
                                cert_info.get("days_remaining")
                                if cert_info.get("days_remaining") is not None
                                else cert_detail.get("days_remaining")
                            )
                            existing.status = CertificateStatus.SUCCESS
                            existing.email = cert_detail.get("email")
                            existing.updated_at = datetime.now()
                        else:
                            session.add(
                                TLSCertificate(
                                    domain=domain,
                                    folder_name=folder_name,
                                    certificate=certificate,
                                    private_key=private_key,
                                    status=CertificateStatus.SUCCESS,
                                    sans=all_domains if all_domains else cert_detail.get("sans", []),
                                    issuer=cert_info.get("issuer") or cert_detail.get("issuer"),
                                    not_before=cert_info.get("not_before")
                                    or cert_detail.get("not_before"),
                                    not_after=cert_info.get("not_after") or cert_detail.get("not_after"),
                                    is_valid=cert_info.get("is_valid")
                                    if cert_info.get("is_valid") is not None
                                    else cert_detail.get("is_valid", True),
                                    days_remaining=cert_info.get("days_remaining")
                                    if cert_info.get("days_remaining") is not None
                                    else cert_detail.get("days_remaining"),
                                    email=cert_detail.get("email"),
                                )
                            )
                except Exception as e:  # noqa: BLE001
                    logger.error("export_single DB upsert: %s", e, exc_info=True)
            return {
                "success": True,
                "message": f"Successfully exported certificate for {domain} to {store}/{folder_name}",
                "store": store,
                "folder_name": folder_name,
                "domain": domain,
                "certificate_id": certificate_id,
            }
        except Exception as e:  # noqa: BLE001
            logger.error("export_single_certificate: %s", e, exc_info=True)
            return {
                "success": False,
                "message": str(e),
                "certificate_id": certificate_id,
            }

    def list_directory(self, store: str = WEBSITES_STORE, subpath: Optional[str] = None) -> dict[str, Any]:
        try:
            store_dir = os.path.join(self.base_dir, store.capitalize())
            if subpath:
                subpath = subpath.lstrip("/").lstrip("\\")
                subpath = os.path.normpath(subpath).replace("..", "")
                target_dir = os.path.join(store_dir, subpath)
            else:
                target_dir = store_dir
            target_dir = os.path.abspath(target_dir)
            store_dir_abs = os.path.abspath(store_dir)
            if not target_dir.startswith(store_dir_abs):
                return {"success": False, "message": "Invalid path", "items": []}
            if not os.path.exists(target_dir):
                return {"success": False, "message": f"Directory not found: {subpath or store}", "items": []}
            if not os.path.isdir(target_dir):
                return {"success": False, "message": "Path is not a directory", "items": []}
            items: list[dict[str, Any]] = []
            for entry in sorted(os.listdir(target_dir)):
                if entry.startswith("."):
                    continue
                entry_path = os.path.join(target_dir, entry)
                rel_path = os.path.relpath(entry_path, store_dir)
                stat_info = os.stat(entry_path)
                is_dir = os.path.isdir(entry_path)
                items.append(
                    {
                        "name": entry,
                        "type": "directory" if is_dir else "file",
                        "path": rel_path.replace("\\", "/"),
                        "size": stat_info.st_size if not is_dir else None,
                        "modified": stat_info.st_mtime,
                    }
                )
            current_path = subpath.replace("\\", "/") if subpath else ""
            return {
                "success": True,
                "message": "Directory listed successfully",
                "store": store,
                "path": current_path,
                "items": items,
            }
        except Exception as e:  # noqa: BLE001
            logger.error("list_directory: %s", e, exc_info=True)
            return {"success": False, "message": str(e), "items": []}

    def download_file(self, store: str = WEBSITES_STORE, file_path: str = "") -> dict[str, Any]:
        try:
            store_dir = os.path.join(self.base_dir, store.capitalize())
            file_path = file_path.lstrip("/").lstrip("\\")
            file_path = os.path.normpath(file_path).replace("..", "")
            target_file = os.path.join(store_dir, file_path)
            target_file = os.path.abspath(target_file)
            store_dir_abs = os.path.abspath(store_dir)
            if not target_file.startswith(store_dir_abs):
                return {"success": False, "message": "Invalid path", "content": None, "filename": None}
            if not os.path.exists(target_file) or not os.path.isfile(target_file):
                return {"success": False, "message": "File not found", "content": None, "filename": None}
            with open(target_file, "rb") as f:
                content = f.read()
            return {
                "success": True,
                "message": "File read successfully",
                "content": content,
                "filename": os.path.basename(target_file),
                "mime_type": "application/octet-stream",
            }
        except Exception as e:  # noqa: BLE001
            logger.error("download_file: %s", e, exc_info=True)
            return {"success": False, "message": str(e), "content": None, "filename": None}

    def get_file_content(self, store: str = WEBSITES_STORE, file_path: str = "") -> dict[str, Any]:
        try:
            store_dir = os.path.join(self.base_dir, store.capitalize())
            file_path = file_path.lstrip("/").lstrip("\\")
            file_path = os.path.normpath(file_path).replace("..", "")
            target_file = os.path.join(store_dir, file_path)
            target_file = os.path.abspath(target_file)
            store_dir_abs = os.path.abspath(store_dir)
            if not target_file.startswith(store_dir_abs):
                return {"success": False, "message": "Invalid path", "content": None, "filename": None}
            if not os.path.exists(target_file) or not os.path.isfile(target_file):
                return {"success": False, "message": "File not found", "content": None, "filename": None}
            try:
                with open(target_file, encoding="utf-8") as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(target_file, encoding="latin-1") as f:
                    content = f.read()
            return {
                "success": True,
                "message": "File read successfully",
                "content": content,
                "filename": os.path.basename(target_file),
            }
        except Exception as e:  # noqa: BLE001
            logger.error("get_file_content: %s", e, exc_info=True)
            return {"success": False, "message": str(e), "content": None, "filename": None}

    def delete_folder(self, store: str = WEBSITES_STORE, folder_name: str = "") -> dict[str, Any]:
        try:
            store_dir = os.path.join(self.base_dir, store.capitalize())
            folder_path = os.path.join(store_dir, folder_name)
            if not os.path.exists(folder_path):
                return {
                    "success": False,
                    "message": f"Folder not found: {folder_path}",
                    "store": store,
                    "folder_name": folder_name,
                }
            shutil.rmtree(folder_path)
            return {
                "success": True,
                "message": f"Successfully deleted folder: {store}/{folder_name}",
                "store": store,
                "folder_name": folder_name,
            }
        except Exception as e:  # noqa: BLE001
            logger.error("delete_folder: %s", e, exc_info=True)
            return {"success": False, "message": str(e), "store": store, "folder_name": folder_name}

    def delete_file_or_folder_fs(self, store: str = WEBSITES_STORE, path: str = "", item_type: str = "") -> dict[str, Any]:
        try:
            store_dir = os.path.join(self.base_dir, store.capitalize())
            target_path = os.path.join(store_dir, path)
            if not os.path.exists(target_path):
                return {
                    "success": False,
                    "message": f"Path not found: {path}",
                    "store": store,
                    "path": path,
                    "item_type": item_type,
                }
            is_file = os.path.isfile(target_path)
            is_dir = os.path.isdir(target_path)
            if item_type == "file" and not is_file:
                return {
                    "success": False,
                    "message": f"Path is not a file: {path}",
                    "store": store,
                    "path": path,
                    "item_type": item_type,
                }
            if item_type == "folder" and not is_dir:
                return {
                    "success": False,
                    "message": f"Path is not a folder: {path}",
                    "store": store,
                    "path": path,
                    "item_type": item_type,
                }
            if is_file:
                os.remove(target_path)
            else:
                shutil.rmtree(target_path)
            return {
                "success": True,
                "message": f"Successfully deleted {item_type}: {store}/{path}",
                "store": store,
                "path": path,
                "item_type": item_type,
            }
        except Exception as e:  # noqa: BLE001
            logger.error("delete_file_or_folder_fs: %s", e, exc_info=True)
            return {
                "success": False,
                "message": str(e),
                "store": store,
                "path": path,
                "item_type": item_type,
            }

    def delete_file_or_folder_via_kafka(self, store: str, path: str, item_type: str) -> dict[str, Any]:
        if not self.pipeline_repo:
            return {"success": False, "message": "Pipeline repository not available, cannot send delete event"}
        ok = self.pipeline_repo.send_delete_file_or_folder_event(store, path, item_type)
        if ok:
            return {
                "success": True,
                "message": f"Delete event sent for {item_type}: {store}/{path}",
            }
        return {
            "success": False,
            "message": f"Failed to send delete event for {item_type}: {store}/{path}",
        }
