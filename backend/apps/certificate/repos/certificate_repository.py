"""TLS 证书 MySQL 仓储：由原 DDD `CertificateDatabase` 多条 operation 合并手写为单一 Repo。"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Optional

from enums import CertificateSource, CertificateStatus, CertificateStore
from utils.mysql.session import MySQLSession
from apps.certificate.models import TLSCertificate

logger = logging.getLogger(__name__)


def _parse_store(s: str) -> CertificateStore:
    return CertificateStore(s)


def _parse_source(s: str) -> CertificateSource:
    return CertificateSource(s)


def _parse_status(s: Optional[str]) -> Optional[CertificateStatus]:
    if s is None:
        return None
    return CertificateStatus(s)


class CertificateRepository:
    """对齐原 `CertificateDatabase` 对外方法名，供 Service 调用。"""

    def __init__(self, db_session: MySQLSession) -> None:
        self.db_session = db_session

    def get_certificate_list(
        self, store: str, offset: int = 0, limit: int = 20
    ) -> tuple[list[dict[str, Any]], int]:
        if not self.db_session.enable_mysql:
            return [], 0
        try:
            st = _parse_store(store)
        except ValueError:
            return [], 0
        try:
            with self.db_session.get_session() as session:
                q = session.query(TLSCertificate).filter(TLSCertificate.store == st)
                total = q.count()
                rows = q.offset(offset).limit(limit).all()
                out = []
                for cert in rows:
                    out.append(
                        {
                            "id": cert.id,
                            "domain": cert.domain,
                            "store": cert.store.value if cert.store else store,
                            "folder_name": cert.folder_name,
                            "source": cert.source.value if cert.source else None,
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
        """全局每个域名至多一行，按 domain 查找。"""
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
                    "store": cert.store.value if cert.store else None,
                    "folder_name": cert.folder_name,
                    "source": cert.source.value if cert.source else None,
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
        store: Optional[str] = None,
        source: Optional[str] = None,
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
                if store:
                    q = q.filter(TLSCertificate.store == _parse_store(store))
                if source:
                    q = q.filter(TLSCertificate.source == _parse_source(source))
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
                            "store": cert.store.value if cert.store else None,
                            "domain": cert.domain,
                            "source": cert.source.value if cert.source else None,
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

    def create_or_update_certificate(
        self,
        store: str,
        domain: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        source: str = "auto",
        status: Optional[str] = None,
        email: Optional[str] = None,
        sans: Optional[list[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = True,
        days_remaining: Optional[int] = None,
        folder_name: Optional[str] = None,
    ) -> Optional[TLSCertificate]:
        if not self.db_session.enable_mysql:
            return None
        try:
            st = _parse_store(store)
            so = _parse_source(source)
        except ValueError:
            return None
        cert_id: Optional[str] = None
        try:
            with self.db_session.get_session() as session:
                existing = (
                    session.query(TLSCertificate)
                    .filter(TLSCertificate.domain == domain)
                    .first()
                )
                if existing:
                    existing.store = st
                    existing.source = so
                    if certificate is not None:
                        existing.certificate = certificate
                    if private_key is not None:
                        existing.private_key = private_key
                    if status is not None:
                        existing.status = CertificateStatus(status)
                    if email is not None:
                        existing.email = email
                    existing.sans = sans
                    existing.issuer = issuer
                    existing.not_before = not_before
                    existing.not_after = not_after
                    existing.is_valid = is_valid
                    existing.days_remaining = days_remaining
                    if folder_name is not None:
                        existing.folder_name = folder_name
                    existing.updated_at = datetime.now()
                    cert_id = existing.id
                else:
                    st_val = CertificateStatus(status) if status else CertificateStatus.PROCESS
                    nc = TLSCertificate(
                        store=st,
                        domain=domain,
                        folder_name=folder_name,
                        source=so,
                        certificate=certificate,
                        private_key=private_key,
                        status=st_val,
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
            logger.exception("create_or_update_certificate")
            return None
        if not cert_id:
            return None
        with self.db_session.get_session() as session:
            obj = session.query(TLSCertificate).filter(TLSCertificate.id == cert_id).first()
            if obj:
                session.expunge(obj)
                return obj
        return None

    def update_certificate_by_id(
        self,
        certificate_id: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
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
                if store is not None:
                    cert.store = _parse_store(store)
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
        store: str,
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
        """手动添加：source=manual_add，初始 status=process。"""
        return self.create_or_update_certificate(
            store=store,
            domain=domain,
            certificate=certificate,
            private_key=private_key,
            source=CertificateSource.MANUAL_ADD.value,
            status=CertificateStatus.PROCESS.value,
            email=email,
            sans=sans,
            issuer=issuer,
            not_before=not_before,
            not_after=not_after,
            is_valid=is_valid,
            days_remaining=days_remaining,
            folder_name=folder_name,
        )

    def get_certificate_by_folder_name(self, folder_name: str) -> Optional[dict[str, Any]]:
        if not self.db_session.enable_mysql:
            return None
        try:
            with self.db_session.get_session() as session:
                cert = (
                    session.query(TLSCertificate)
                    .filter(TLSCertificate.folder_name == folder_name)
                    .first()
                )
                return cert.to_dict() if cert else None
        except Exception:  # noqa: BLE001
            logger.exception("get_certificate_by_folder_name")
            return None

    def update_certificate(
        self,
        domain: str,
        source: Optional[str] = None,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
        sans: Optional[list[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = None,
        days_remaining: Optional[int] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Optional[TLSCertificate]:
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
                if source is not None:
                    cert.source = _parse_source(source)
                if folder_name is not None:
                    cert.folder_name = folder_name
                if store is not None:
                    cert.store = _parse_store(store)
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
                cert.updated_at = datetime.now()
                cid = cert.id
            with self.db_session.get_session() as session:
                obj = session.query(TLSCertificate).filter(TLSCertificate.id == cid).first()
                if obj:
                    session.expunge(obj)
                    return obj
        except Exception:  # noqa: BLE001
            logger.exception("update_certificate")
        return None

    def update_all_days_remaining(self) -> tuple[int, int, list[dict[str, Any]]]:
        """批量更新 not_after 对应的剩余天数与 is_valid，返回 (updated_count, total_count, cert_snapshots)。"""
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
                                "source": cert.source.value if cert.source else None,
                                "store": cert.store.value if cert.store else None,
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
