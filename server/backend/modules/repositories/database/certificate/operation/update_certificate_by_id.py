# coding=utf-8

"""
根据 ID 更新证书操作
"""
import logging
from typing import List, Optional
from datetime import datetime

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def update_certificate_by_id(
    repo: CertificateDatabaseLike,
    certificate_id: str,
    certificate: Optional[str] = None,
    private_key: Optional[str] = None,
    store: Optional[str] = None,
    sans: Optional[List[str]] = None,
    issuer: Optional[str] = None,
    not_before: Optional[datetime] = None,
    not_after: Optional[datetime] = None,
    is_valid: Optional[bool] = None,
    days_remaining: Optional[int] = None,
    folder_name: Optional[str] = None,
    email: Optional[str] = None,
    status: Optional[str] = None
) -> Optional[TLSCertificate]:
    """
    根据 ID 更新证书
    
    Args:
        repo: CertificateDatabase 实例
        certificate_id: 证书 ID
        certificate: 证书内容（PEM格式），可选
        private_key: 私钥内容（PEM格式），可选
        store: 存储位置，可选
        sans: SANs 列表，可选
        issuer: 颁发者，可选
        not_before: 有效期开始时间，可选
        not_after: 有效期结束时间，可选
        is_valid: 是否有效，可选
        days_remaining: 剩余天数，可选
        folder_name: 文件夹名称，可选
        email: 邮箱地址，可选
        status: 证书状态，可选
    
    Returns:
        更新后的证书对象，如果不存在则返回 None
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法更新证书")
        return None
    
    try:
        with repo.db_session.get_session() as session:
            cert = session.query(TLSCertificate).filter(
                TLSCertificate.id == certificate_id
            ).first()
            
            if not cert:
                logger.warning(f"⚠️  证书不存在: certificate_id={certificate_id}")
                return None
            
            # 只更新提供的字段
            if folder_name is not None:
                cert.folder_name = folder_name
            if store is not None:
                cert.store = store
            if certificate is not None:
                cert.certificate = certificate
            if private_key is not None:
                cert.private_key = private_key
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
            if email is not None:
                cert.email = email
            if status is not None:
                cert.status = status
            
            cert.updated_at = datetime.now()
            # 在 session 内访问 id 属性，确保它被加载
            cert_id = cert.id
            session.commit()
            
            # 在新会话中重新查询以确保对象完全加载
            if cert_id:
                try:
                    with repo.db_session.get_session() as new_session:
                        cert_obj = new_session.query(TLSCertificate).filter(
                            TLSCertificate.id == cert_id
                        ).first()
                        if cert_obj:
                            # 显式加载常用属性
                            _ = cert_obj.id
                            _ = cert_obj.domain
                            _ = cert_obj.store
                            _ = cert_obj.source
                            _ = cert_obj.status
                            new_session.expunge(cert_obj)
                            return cert_obj
                except Exception as e:
                    logger.warning(f"⚠️ 重新查询证书对象失败，返回原对象: {e}")
            
            return cert
    except Exception as e:
        logger.error(f"❌ 更新证书失败: certificate_id={certificate_id}, error={e}", exc_info=True)
        return None

