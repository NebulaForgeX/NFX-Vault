# coding=utf-8

"""
根据文件夹名称更新证书操作
"""
import logging
from typing import Optional, List
from datetime import datetime

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def update_certificate_by_folder_name(
    repo: CertificateDatabaseLike,
    folder_name: str,
    store: Optional[str] = None,
    domain: Optional[str] = None,
    certificate: Optional[str] = None,
    private_key: Optional[str] = None,
    status: Optional[str] = None,
    sans: Optional[List[str]] = None,
    issuer: Optional[str] = None,
    not_before: Optional[datetime] = None,
    not_after: Optional[datetime] = None,
    is_valid: Optional[bool] = None,
    days_remaining: Optional[int] = None
) -> Optional[TLSCertificate]:
    """
    根据 folder_name 更新证书（保持原有 source）
    
    Args:
        repo: CertificateDatabase 实例
        folder_name: 文件夹名称（唯一）
        store: 存储位置
        domain: 域名
        certificate: 证书内容（PEM格式）
        private_key: 私钥内容（PEM格式）
        status: 状态
        sans: SANs 列表
        issuer: 颁发者
        not_before: 有效期开始时间
        not_after: 有效期结束时间
        is_valid: 是否有效
        days_remaining: 剩余天数
    
    Returns:
        更新后的证书对象，如果不存在则返回 None
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法更新证书")
        return None
    
    try:
        with repo.db_session.get_session() as session:
            cert = session.query(TLSCertificate).filter(
                TLSCertificate.folder_name == folder_name
            ).first()
            
            if not cert:
                logger.warning(f"⚠️  证书不存在: folder_name={folder_name}")
                return None
            
            # 只更新提供的字段，保持原有 source
            if store is not None:
                cert.store = store
            if domain is not None:
                cert.domain = domain
            if certificate is not None:
                cert.certificate = certificate
            if private_key is not None:
                cert.private_key = private_key
            if status is not None:
                cert.status = status
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
            
            cert.updated_at = datetime.now()
            # 在 session 内访问 id 属性，确保它被加载（避免 detached instance 错误）
            _ = cert.id  # 触发属性加载
            # session.commit() 由 context manager 自动处理
            logger.debug(f"✅ 更新证书: folder_name={folder_name}, source={cert.source} (保持原有)")
            return cert
    except Exception as e:
        logger.error(f"❌ 更新证书失败: folder_name={folder_name}, error={e}", exc_info=True)
        return None

