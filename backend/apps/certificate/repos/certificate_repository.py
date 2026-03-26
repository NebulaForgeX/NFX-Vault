"""TLS 证书 MySQL 仓储。"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Optional

from enums import CertificateStatus
from utils import MySQLSession
from apps.certificate.models import TLSCertificate

logger = logging.getLogger(__name__)


class CertificateRepository:
    def __init__(self, db_session: MySQLSession) -> None:
        self.db_session = db_session

    def get_certificate_list(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[dict[str, Any]], int]:
        if not self.db_session.enable_mysql:
            return [], 0
        try:
            with self.db_session.get_session() as session:
                q = session.query(TLSCertificate)
                total = q.count()
                rows = q.order_by(TLSCertificate.created_at.desc()).offset(offset).limit(limit).all()
                out: list[dict[str, Any]] = []
                for cert in rows:
                    out.append(
                        {
                            "id": cert.id,
                            "domain": cert.domain,
                            "folder_name": cert.folder_name,
                            "status": cert.status.value if cert.status else None,
                            "email": cert.email,
                            "issuer": cert.issuer,
                            "not_before": cert.not_before,
                            "not_after": cert.not_after,
                            "is_valid": cert.is_valid,
                            "days_remaining": cert.days_remaining,
                            "last_error_message": cert.last_error_message,
                            "last_error_time": cert.last_error_time.isoformat()
                            if cert.last_error_time
                            else None,
                        }
                    )
                return out, total
        except Exception:  # noqa: BLE001
            logger.exception("get_certificate_list")
            return [], 0

    def get_certificate_by_id(self, certificate_id: str) -> Optional[dict[str, Any]]:
        if not self.db_session.enable_mysql:
            return None
        try:
            with self.db_session.get_session() as session:
                cert = (
                    session.query(TLSCertificate)
                    .filter(TLSCertificate.id == certificate_id)
                    .first()
                )
                if not cert:
                    return None
                return cert.to_dict()
        except Exception:  # noqa: BLE001
            logger.exception("get_certificate_by_id")
            return None

    def get_certificate_by_domain(self, domain: str) -> Optional[dict[str, Any]]:
        if not self.db_session.enable_mysql:
            return None
        try:
            with self.db_session.get_session() as session:
                cert = (
                    session.query(TLSCertificate)
                    .filter(TLSCertificate.domain == domain)
                    .first()
                )
                if not cert:
                    return None
                return {
                    "id": cert.id,
                    "domain": cert.domain,
                    "folder_name": cert.folder_name,
                    "status": cert.status.value if cert.status else None,
                    "email": cert.email,
                    "certificate": cert.certificate,
                    "private_key": cert.private_key,
                    "sans": cert.sans or [],
                    "issuer": cert.issuer,
                    "not_before": cert.not_before,
                    "not_after": cert.not_after,
                    "is_valid": cert.is_valid,
                    "days_remaining": cert.days_remaining,
                    "last_error_message": cert.last_error_message,
                    "last_error_time": cert.last_error_time.isoformat()
                    if cert.last_error_time
                    else None,
                }
        except Exception:  # noqa: BLE001
            logger.exception("get_certificate_by_domain")
            return None

    def delete_certificate_by_id(self, certificate_id: str) -> bool:
        if not self.db_session.enable_mysql:
            return False
        try:
            with self.db_session.get_session() as session:
                n = (
                    session.query(TLSCertificate)
                    .filter(TLSCertificate.id == certificate_id)
                    .delete()
                )
                return n > 0
        except Exception:  # noqa: BLE001
            logger.exception("delete_certificate_by_id")
            return False

    def search_certificates(
        self,
        keyword: str,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[dict[str, Any]], int]:
        if not self.db_session.enable_mysql:
            return [], 0
        try:
            with self.db_session.get_session() as session:
                q = session.query(TLSCertificate).filter(
                    (TLSCertificate.domain.like(f"%{keyword}%"))
                    | (TLSCertificate.folder_name.like(f"%{keyword}%"))
                )
                total = q.count()
                rows = (
                    q.order_by(TLSCertificate.created_at.desc())
                    .offset(offset)
                    .limit(limit)
                    .all()
                )
                result = []
                for cert in rows:
                    result.append(
                        {
                            "id": cert.id,
                            "domain": cert.domain,
                            "status": cert.status.value if cert.status else None,
                            "email": cert.email,
                            "sans": cert.sans,
                            "folder_name": cert.folder_name,
                            "issuer": cert.issuer,
                            "not_before": cert.not_before.isoformat() if cert.not_before else None,
                            "not_after": cert.not_after.isoformat() if cert.not_after else None,
                            "is_valid": cert.is_valid,
                            "days_remaining": cert.days_remaining,
                            "created_at": cert.created_at.isoformat() if cert.created_at else None,
                            "updated_at": cert.updated_at.isoformat() if cert.updated_at else None,
                        }
                    )
                return result, total
        except Exception:  # noqa: BLE001
            logger.exception("search_certificates")
            return [], 0

    def update_certificate_parse_result(
        self,
        certificate_id: str,
        status: Optional[str] = None,
        sans: Optional[list[str]] = None,
        issuer: Optional[str] = None,
        email: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = None,
        days_remaining: Optional[int] = None,
    ) -> bool:
        if not self.db_session.enable_mysql:
            return False
        try:
            with self.db_session.get_session() as session:
                cert = (
                    session.query(TLSCertificate)
                    .filter(TLSCertificate.id == certificate_id)
                    .first()
                )
                if not cert:
                    return False
                if status is not None:
                    cert.status = CertificateStatus(status)
                if sans is not None:
                    cert.sans = sans
                if issuer is not None:
                    cert.issuer = issuer
                if email is not None:
                    cert.email = email
                if not_before is not None:
                    cert.not_before = not_before
                if not_after is not None:
                    cert.not_after = not_after
                if is_valid is not None:
                    cert.is_valid = is_valid
                if days_remaining is not None:
                    cert.days_remaining = days_remaining
                cert.updated_at = datetime.now()
                return True
        except Exception:  # noqa: BLE001
            logger.exception("update_certificate_parse_result")
            return False

    def update_certificate_by_id(
        self,
        certificate_id: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        domain: Optional[str] = None,
        sans: Optional[list[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = None,
        days_remaining: Optional[int] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
        status: Optional[str] = None,
        last_error_message: Optional[str] = None,
        last_error_time: Optional[datetime] = None,
    ) -> Optional[TLSCertificate]:
        if not self.db_session.enable_mysql:
            return None
        try:
            with self.db_session.get_session() as session:
                cert = (
                    session.query(TLSCertificate)
                    .filter(TLSCertificate.id == certificate_id)
                    .first()
                )
                if not cert:
                    return None
                if folder_name is not None:
                    cert.folder_name = folder_name
                if domain is not None:
                    cert.domain = domain
                if certificate is not None:
                    cert.certificate = certificate
                if private_key is not None:
                    cert.private_key = private_key
                if sans is not None:
                    cert.sans = sans
                if issuer is not None:
                    cert.issuer = issuer
                if not_before is not None:
                    cert.not_before = not_before
                if not_after is not None:
                    cert.not_after = not_after
                if is_valid is not None:
                    cert.is_valid = is_valid
                if days_remaining is not None:
                    cert.days_remaining = days_remaining
                if email is not None:
                    cert.email = email
                if status is not None:
                    cert.status = CertificateStatus(status)
                if last_error_message is not None:
                    cert.last_error_message = last_error_message
                if last_error_time is not None:
                    cert.last_error_time = last_error_time
                cert.updated_at = datetime.now()
                cid = cert.id
            with self.db_session.get_session() as session:
                obj = session.query(TLSCertificate).filter(TLSCertificate.id == cid).first()
                if obj:
                    session.expunge(obj)
                    return obj
        except Exception:  # noqa: BLE001
            logger.exception("update_certificate_by_id")
        return None

    def create_certificate(
        self,
        domain: str,
        certificate: str,
        private_key: str,
        sans: Optional[list[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = True,
        days_remaining: Optional[int] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
    ) -> Optional[TLSCertificate]:
        if not self.db_session.enable_mysql:
            return None
        cert_id: Optional[str] = None
        try:
            with self.db_session.get_session() as session:
                nc = TLSCertificate(
                    domain=domain,
                    folder_name=folder_name,
                    certificate=certificate,
                    private_key=private_key,
                    status=CertificateStatus.PROCESS,
                    email=email,
                    sans=sans,
                    issuer=issuer,
                    not_before=not_before,
                    not_after=not_after,
                    is_valid=is_valid,
                    days_remaining=days_remaining,
                )
                session.add(nc)
                session.flush()
                cert_id = nc.id
        except Exception:  # noqa: BLE001
            logger.exception("create_certificate")
            return None
        if not cert_id:
            return None
        with self.db_session.get_session() as session:
            obj = session.query(TLSCertificate).filter(TLSCertificate.id == cert_id).first()
            if obj:
                session.expunge(obj)
                return obj
        return None

    def update_all_days_remaining(self) -> tuple[int, int, list[dict[str, Any]]]:
        if not self.db_session.enable_mysql:
            return (0, 0, [])
        try:
            with self.db_session.get_session() as session:
                certificates = (
                    session.query(TLSCertificate).filter(TLSCertificate.not_after.isnot(None)).all()
                )
                total_count = len(certificates)
                updated_count = 0
                cert_list: list[dict[str, Any]] = []
                now = datetime.now()
                for cert in certificates:
                    try:
                        if not cert.not_after:
                            continue
                        not_after = cert.not_after
                        if not_after.tzinfo:
                            now_tz = datetime.now(not_after.tzinfo)
                        else:
                            now_tz = now
                        delta = not_after - now_tz
                        days_remaining = delta.days
                        is_valid = days_remaining >= 0
                        cert_list.append(
                            {
                                "id": cert.id,
                                "days_remaining": days_remaining,
                                "domain": cert.domain,
                                "email": cert.email,
                                "folder_name": cert.folder_name,
                            }
                        )
                        if cert.days_remaining != days_remaining or cert.is_valid != is_valid:
                            cert.days_remaining = days_remaining
                            cert.is_valid = is_valid
                            cert.updated_at = datetime.now()
                            updated_count += 1
                    except Exception:  # noqa: BLE001
                        logger.warning("更新单条证书剩余天数失败 id=%s", cert.id, exc_info=True)
                        continue
                logger.info("批量更新剩余天数: 变更 %s/%s", updated_count, total_count)
                return (updated_count, total_count, cert_list)
        except Exception:  # noqa: BLE001
            logger.exception("update_all_days_remaining")
            return (0, 0, [])
