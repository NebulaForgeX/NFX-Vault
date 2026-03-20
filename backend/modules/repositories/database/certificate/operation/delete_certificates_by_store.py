# coding=utf-8

"""
根据 store 删除证书操作
"""
import logging

from sqlalchemy import and_
from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def delete_certificates_by_store(
    repo: CertificateDatabaseLike,
    store: str,
    source: str = 'auto'
) -> int:
    """
    删除指定 store 和 source 的所有证书
    
    Args:
        repo: CertificateDatabase 实例
        store: 存储位置
        source: 来源（auto 或 manual），默认为 auto
    
    Returns:
        删除的记录数
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法删除证书")
        return 0
    
    try:
        with repo.db_session.get_session() as session:
            deleted_count = session.query(TLSCertificate).filter(
                and_(
                    TLSCertificate.store == store,
                    TLSCertificate.source == source
                )
            ).delete()
            session.commit()
            logger.info(f"✅ 删除 {deleted_count} 条证书记录: store={store}, source={source}")
            return deleted_count
    except Exception as e:
        logger.error(f"❌ 删除证书失败: {e}", exc_info=True)
        return 0

