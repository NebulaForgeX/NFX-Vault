import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, Index, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.mysql import CHAR

from enums import CertificateStatus
from apps.certificate.models.base import Base


class TLSCertificate(Base):
    __tablename__ = "tls_certificates"
    __table_args__ = (
        UniqueConstraint("domain", name="uq_tls_certificates_domain"),
        Index("idx_tls_certificates_domain", "domain"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain = Column(String(255), nullable=False)
    folder_name = Column(String(255), nullable=True)
    status = Column(Enum(CertificateStatus), nullable=True, default=CertificateStatus.PROCESS)
    email = Column(String(255), nullable=True)
    certificate = Column(Text, nullable=True)
    private_key = Column(Text, nullable=True)
    sans = Column(JSON, nullable=True)
    issuer = Column(String(255), nullable=True)
    not_before = Column(DateTime, nullable=True)
    not_after = Column(DateTime, nullable=True)
    is_valid = Column(Boolean, nullable=True, default=True)
    days_remaining = Column(Integer, nullable=True)
    sans_changed = Column(Boolean, nullable=False, default=False)
    last_error_message = Column(Text, nullable=True)
    last_error_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self) -> dict:
        def ev(x):
            return x.value if x is not None and hasattr(x, "value") else x

        return {
            "id": self.id,
            "domain": self.domain,
            "folder_name": self.folder_name,
            "status": ev(self.status),
            "email": self.email,
            "certificate": self.certificate,
            "private_key": self.private_key,
            "sans": self.sans,
            "issuer": self.issuer,
            "not_before": self.not_before.isoformat() if self.not_before else None,
            "not_after": self.not_after.isoformat() if self.not_after else None,
            "is_valid": self.is_valid,
            "days_remaining": self.days_remaining,
            "sans_changed": bool(self.sans_changed),
            "last_error_message": self.last_error_message,
            "last_error_time": self.last_error_time.isoformat() if self.last_error_time else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
