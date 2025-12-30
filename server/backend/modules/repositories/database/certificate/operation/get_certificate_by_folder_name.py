# coding=utf-8

"""
根据文件夹名称获取证书操作
"""
import logging
from typing import Optional, Dict, Any

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def get_certificate_by_folder_name(
    repo: CertificateDatabaseLike,
    folder_name: str
) -> Optional[Dict[str, Any]]:
    """
    根据文件夹名称获取证书
    
    Args:
        repo: CertificateDatabase 实例
        folder_name: 文件夹名称（唯一）
    
    Returns:
        证书字典，如果不存在则返回 None
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，返回 None")
        return None
    
    try:
        with repo.db_session.get_session() as session:
            cert = session.query(TLSCertificate).filter(
                TLSCertificate.folder_name == folder_name
            ).first()
            
            if not cert:
                return None
            
            # 在 session 内部转换为字典，避免 DetachedInstanceError
            return {
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
                "days_remaining": cert.days_remaining
            }
    except Exception as e:
        logger.error(f"❌ 查询证书失败: {e}", exc_info=True)
        return None

