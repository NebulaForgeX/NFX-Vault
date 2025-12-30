# coding=utf-8

"""
删除证书操作
"""
import logging

from sqlalchemy import and_
from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def delete_certificate(
    repo: CertificateDatabaseLike,
    domain: str,
    source: str
) -> bool:
    """
    删除证书（根据 domain + source）
    
    Args:
        repo: CertificateDatabase 实例
        domain: 域名
        source: 来源（auto 或 manual）
    
    Returns:
        是否删除成功
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法删除证书")
        return False
    
    try:
        with repo.db_session.get_session() as session:
            deleted_count = session.query(TLSCertificate).filter(
                and_(
                    TLSCertificate.domain == domain,
                    TLSCertificate.source == source
                )
            ).delete()
            session.commit()
            
            if deleted_count > 0:
                logger.info(f"✅ 删除证书: domain={domain}, source={source}")
                return True
            else:
                logger.warning(f"⚠️  证书不存在: domain={domain}, source={source}")
                return False
    except Exception as e:
        logger.error(f"❌ 删除证书失败: domain={domain}, source={source}, error={e}", exc_info=True)
        return False

