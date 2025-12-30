# coding=utf-8

"""
根据 ID 获取证书操作
"""
import logging
from typing import Optional, Dict, Any

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def get_certificate_by_id(
    repo: CertificateDatabaseLike,
    certificate_id: str
) -> Optional[Dict[str, Any]]:
    """
    根据证书 ID 获取证书
    
    Args:
        repo: CertificateDatabase 实例
        certificate_id: 证书 ID
    
    Returns:
        证书字典，如果不存在则返回 None
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，返回 None")
        return None
    
    try:
        with repo.db_session.get_session() as session:
            cert = session.query(TLSCertificate).filter(
                TLSCertificate.id == certificate_id
            ).first()
            
            if cert:
                return cert.to_dict()
            return None
    except Exception as e:
        logger.error(f"❌ 查询证书失败: {e}", exc_info=True)
        return None

