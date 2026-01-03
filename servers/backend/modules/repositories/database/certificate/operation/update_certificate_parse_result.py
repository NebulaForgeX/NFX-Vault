# coding=utf-8

"""
更新证书解析结果操作
"""
import logging
from typing import List, Optional
from datetime import datetime

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def update_certificate_parse_result(
    repo: CertificateDatabaseLike,
    certificate_id: str,
    status: Optional[str] = None,
    sans: Optional[List[str]] = None,
    issuer: Optional[str] = None,
    email: Optional[str] = None,
    not_before: Optional[datetime] = None,
    not_after: Optional[datetime] = None,
    is_valid: Optional[bool] = None,
    days_remaining: Optional[int] = None
) -> bool:
    """
    更新证书解析结果
    
    Args:
        repo: CertificateDatabase 实例
        certificate_id: 证书 ID
        status: 状态（success, fail, process）
        sans: SANs 列表
        issuer: 颁发者
        email: 邮箱地址
        not_before: 有效期开始时间
        not_after: 有效期结束时间
        is_valid: 是否有效
        days_remaining: 剩余天数
    
    Returns:
        是否更新成功
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法更新证书")
        return False
    
    try:
        with repo.db_session.get_session() as session:
            cert = session.query(TLSCertificate).filter(
                TLSCertificate.id == certificate_id
            ).first()
            
            if not cert:
                logger.error(f"❌ 证书不存在: certificate_id={certificate_id}")
                return False
            
            # 更新字段（只更新非 None 的字段）
            if status is not None:
                cert.status = status
            # sans 可以是空列表 []，表示没有 SANs，所以需要特殊处理
            if sans is not None:
                cert.sans = sans
            if issuer is not None:
                cert.issuer = issuer
            if email is not None:
                cert.email = email
            if not_before is not None:
                cert.not_before = not_before
            if not_after is not None:
                cert.not_after = not_after
            if is_valid is not None:
                cert.is_valid = is_valid
            if days_remaining is not None:
                cert.days_remaining = days_remaining
            
            cert.updated_at = datetime.now()
            session.commit()
            
            return True
    except Exception as e:
        logger.error(f"❌ 更新证书解析结果失败: {e}", exc_info=True)
        return False

