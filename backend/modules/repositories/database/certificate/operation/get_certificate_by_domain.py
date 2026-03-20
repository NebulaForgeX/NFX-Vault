# coding=utf-8

"""
根据域名获取证书操作
"""
import logging
from typing import Optional, Dict, Any

from sqlalchemy import and_
from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def get_certificate_by_domain(
    repo: CertificateDatabaseLike,
    store: str,
    domain: str,
    source: str = 'auto'
) -> Optional[Dict[str, Any]]:
    """
    根据域名和来源获取证书
    
    Args:
        repo: CertificateDatabase 实例
        store: 存储位置（websites 或 apis）
        domain: 域名
        source: 来源（auto 或 manual），默认为 auto
    
    Returns:
        证书字典，如果不存在则返回 None
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，返回 None")
        return None
    
    try:
        with repo.db_session.get_session() as session:
            cert = session.query(TLSCertificate).filter(
                and_(
                    TLSCertificate.store == store,
                    TLSCertificate.domain == domain,
                    TLSCertificate.source == source
                )
            ).first()
            
            if not cert:
                return None
            
            # 在 session 内部转换为字典，避免 DetachedInstanceError
            return {
                "id": cert.id,  # 添加 id 字段
                "domain": cert.domain,
                "store": cert.store,
                "folder_name": cert.folder_name,
                "source": cert.source,
                "status": cert.status,
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
                "last_error_time": cert.last_error_time.isoformat() if cert.last_error_time else None
            }
    except Exception as e:
        logger.error(f"❌ 查询证书失败: {e}", exc_info=True)
        return None

