# coding=utf-8

"""
根据 ID 删除证书操作
"""
import logging

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def delete_certificate_by_id(
    repo: CertificateDatabaseLike,
    certificate_id: str
) -> bool:
    """
    根据证书 ID 删除证书
    
    Args:
        repo: CertificateDatabase 实例
        certificate_id: 证书 ID
    
    Returns:
        是否删除成功
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法删除证书")
        return False
    
    try:
        with repo.db_session.get_session() as session:
            deleted_count = session.query(TLSCertificate).filter(
                TLSCertificate.id == certificate_id
            ).delete()
            session.commit()
            
            if deleted_count > 0:
                logger.info(f"✅ 删除证书: certificate_id={certificate_id}")
                return True
            else:
                logger.warning(f"⚠️  证书不存在: certificate_id={certificate_id}")
                return False
    except Exception as e:
        logger.error(f"❌ 删除证书失败: certificate_id={certificate_id}, error={e}", exc_info=True)
        return False

