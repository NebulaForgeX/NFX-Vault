# coding=utf-8

"""
TLS 证书数据模型

使用 SQLAlchemy ORM 定义数据库表结构
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, Index, UniqueConstraint, Enum
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.sql import func
import uuid
from .base import Base
from enums import CertificateStore, CertificateSource, CertificateStatus


class TLSCertificate(Base):
    """TLS 证书表"""
    __tablename__ = "tls_certificates"
    __table_args__ = (
        UniqueConstraint('folder_name', name='uq_folder_name'),  # 唯一约束：folder_name
        Index('idx_store_domain', 'store', 'domain'),  # 复合索引：store + domain
        Index('idx_domain', 'domain'),  # 单列索引：domain
        Index('idx_source', 'source'),  # 单列索引：source
        Index('idx_folder_name', 'folder_name'),  # 单列索引：folder_name
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'},
    )
    
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="主键ID (UUID)")
    store = Column(Enum(CertificateStore), nullable=False, comment="存储位置（websites/apis/databases）")
    domain = Column(String(255), nullable=False, comment="主域名")
    folder_name = Column(String(255), nullable=True, unique=True, comment="文件夹名称（唯一，用于标识不同的域名）")
    source = Column(Enum(CertificateSource), nullable=False, default=CertificateSource.MANUAL_ADD, comment="来源（auto: 自动发现, manual_apply: 手动申请, manual_add: 手动添加）")
    status = Column(Enum(CertificateStatus), nullable=True, default=CertificateStatus.PROCESS, comment="申请状态（success: 成功, fail: 失败, process: 处理中）")
    email = Column(String(255), nullable=True, comment="邮箱地址（用于 Let's Encrypt 通知）")
    certificate = Column(Text, nullable=True, comment="证书内容（PEM格式）")
    private_key = Column(Text, nullable=True, comment="私钥内容（PEM格式）")
    sans = Column(JSON, nullable=True, comment="SANs（Subject Alternative Names）列表")
    issuer = Column(String(255), nullable=True, comment="颁发者")
    not_before = Column(DateTime, nullable=True, comment="有效期开始时间")
    not_after = Column(DateTime, nullable=True, comment="有效期结束时间")
    is_valid = Column(Boolean, nullable=True, default=True, comment="是否有效")
    days_remaining = Column(Integer, nullable=True, comment="剩余天数")
    created_at = Column(DateTime, server_default=func.now(), nullable=False, comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False, comment="更新时间")
    
    def __repr__(self):
        return f"<TLSCertificate(id={self.id}, store={self.store}, domain={self.domain})>"
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "store": self.store,
            "domain": self.domain,
            "folder_name": self.folder_name,
            "source": self.source,
            "status": self.status,
            "email": self.email,
            "certificate": self.certificate,
            "private_key": self.private_key,
            "sans": self.sans,
            "issuer": self.issuer,
            "not_before": self.not_before.isoformat() if self.not_before else None,
            "not_after": self.not_after.isoformat() if self.not_after else None,
            "is_valid": self.is_valid,
            "days_remaining": self.days_remaining,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

