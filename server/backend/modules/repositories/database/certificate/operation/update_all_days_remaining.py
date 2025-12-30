# coding=utf-8

"""
批量更新所有证书的剩余天数操作

每天定时更新所有证书的剩余天数和有效性状态
"""
import logging
from datetime import datetime
from typing import Tuple

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def update_all_days_remaining(
    repo: CertificateDatabaseLike
) -> Tuple[int, int]:
    """
    批量更新所有证书的剩余天数和有效性状态
    
    根据 not_after 日期计算剩余天数，并更新 is_valid 状态
    
    Args:
        repo: CertificateDatabase 实例
    
    Returns:
        (updated_count, total_count) - 更新的证书数量和总证书数量
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法更新证书")
        return (0, 0)
    
    try:
        with repo.db_session.get_session() as session:
            # 查询所有有 not_after 的证书
            certificates = session.query(TLSCertificate).filter(
                TLSCertificate.not_after.isnot(None)
            ).all()
            
            total_count = len(certificates)
            updated_count = 0
            
            now = datetime.now()
            
            for cert in certificates:
                try:
                    # 计算剩余天数
                    if cert.not_after:
                        # 处理时区
                        not_after = cert.not_after
                        if not_after.tzinfo:
                            now_tz = datetime.now(not_after.tzinfo)
                        else:
                            now_tz = now
                        
                        delta = not_after - now_tz
                        days_remaining = delta.days
                        is_valid = days_remaining >= 0
                        
                        # 只更新有变化的证书
                        if cert.days_remaining != days_remaining or cert.is_valid != is_valid:
                            cert.days_remaining = days_remaining
                            cert.is_valid = is_valid
                            cert.updated_at = datetime.now()
                            updated_count += 1
                except Exception as e:
                    logger.warning(f"⚠️  更新证书剩余天数失败: id={cert.id}, error={e}")
                    continue
            
            session.commit()
            logger.info(f"✅ 批量更新剩余天数完成: 更新 {updated_count}/{total_count} 个证书")
            
            return (updated_count, total_count)
    except Exception as e:
        logger.error(f"❌ 批量更新剩余天数失败: {e}", exc_info=True)
        return (0, 0)

