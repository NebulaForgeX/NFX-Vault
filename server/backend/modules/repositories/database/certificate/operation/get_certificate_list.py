# coding=utf-8

"""
获取证书列表操作
"""
import logging
from typing import List, Dict, Tuple

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def get_certificate_list(
    repo: CertificateDatabaseLike,
    store: str,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[Dict], int]:
    """
    获取证书列表（支持分页）
    
    Args:
        repo: CertificateDatabase 实例
        store: 存储位置（websites、apis 或 database）
        page: 页码（从1开始）
        page_size: 每页数量
    
    Returns:
        (证书列表, 总数)
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，返回空列表")
        return [], 0
    
    try:
        with repo.db_session.get_session() as session:
            # 查询总数
            total = session.query(TLSCertificate).filter(
                TLSCertificate.store == store
            ).count()
            
            # 分页查询
            certs = session.query(TLSCertificate).filter(
                TLSCertificate.store == store
            ).offset((page - 1) * page_size).limit(page_size).all()
            
            # 在 session 内部转换为字典，避免 DetachedInstanceError
            cert_dicts = [
                {
                    "domain": cert.domain,
                    "store": cert.store,
                    "folder_name": cert.folder_name,
                    "source": cert.source,
                    "status": cert.status,
                    "email": cert.email,
                    "issuer": cert.issuer,
                    "not_before": cert.not_before,
                    "not_after": cert.not_after,
                    "is_valid": cert.is_valid,
                    "days_remaining": cert.days_remaining,
                    "last_error_message": cert.last_error_message,
                    "last_error_time": cert.last_error_time.isoformat() if cert.last_error_time else None
                }
                for cert in certs
            ]
            
            return cert_dicts, total
    except Exception as e:
        logger.error(f"❌ 查询证书列表失败: {e}", exc_info=True)
        return [], 0

