# coding=utf-8

"""
创建或更新证书操作
"""
import logging
from typing import List, Optional
from datetime import datetime

from sqlalchemy import and_
from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def create_or_update_certificate(
    repo: CertificateDatabaseLike,
    store: str,
    domain: str,
    certificate: Optional[str] = None,
    private_key: Optional[str] = None,
    source: str = 'auto',
    status: Optional[str] = None,
    email: Optional[str] = None,
    sans: Optional[List[str]] = None,
    issuer: Optional[str] = None,
    not_before: Optional[datetime] = None,
    not_after: Optional[datetime] = None,
    is_valid: Optional[bool] = True,
    days_remaining: Optional[int] = None,
    folder_name: Optional[str] = None
) -> Optional[TLSCertificate]:
    """
    创建或更新证书（根据 folder_name 的唯一约束）
    
    Args:
        repo: CertificateDatabase 实例
        store: 存储位置
        domain: 域名
        certificate: 证书内容（PEM格式）
        private_key: 私钥内容（PEM格式）
        source: 来源（auto 或 manual），默认为 auto
        email: 邮箱地址（用于 Let's Encrypt 通知）
        sans: SANs 列表
        issuer: 颁发者
        not_before: 有效期开始时间
        not_after: 有效期结束时间
        is_valid: 是否有效
        days_remaining: 剩余天数
        folder_name: 文件夹名称（唯一）
    
    Returns:
        证书对象
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法创建/更新证书")
        return None
    
    cert_id = None
    try:
        # 第一步：在会话内完成创建/更新操作，获取 ID
        with repo.db_session.get_session() as session:
            # 如果提供了 folder_name，根据 folder_name 查询
            if folder_name:
                existing = session.query(TLSCertificate).filter(
                    TLSCertificate.folder_name == folder_name
                ).first()
            else:
                # 否则根据 domain + source 查询（向后兼容）
                existing = session.query(TLSCertificate).filter(
                    and_(
                        TLSCertificate.domain == domain,
                        TLSCertificate.source == source
                    )
                ).first()
            
            if existing:
                # 更新现有记录（保持原有 source）
                existing.store = store
                if certificate is not None:
                    existing.certificate = certificate
                if private_key is not None:
                    existing.private_key = private_key
                if status is not None:
                    existing.status = status
                if email is not None:
                    existing.email = email
                existing.sans = sans
                existing.issuer = issuer
                existing.not_before = not_before
                existing.not_after = not_after
                existing.is_valid = is_valid
                existing.days_remaining = days_remaining
                existing.updated_at = datetime.now()
                # 不更新 source，保持原有 source
                # 在 session 内访问 id 属性，确保它被加载
                cert_id = existing.id
                # 提交更改
                session.commit()
            else:
                # 创建新记录（upsert 的 insert 部分）
                new_cert = TLSCertificate(
                    store=store,
                    domain=domain,
                    folder_name=folder_name,
                    source=source,
                    certificate=certificate,
                    private_key=private_key,
                    status=status,
                    email=email,
                    sans=sans,
                    issuer=issuer,
                    not_before=not_before,
                    not_after=not_after,
                    is_valid=is_valid,
                    days_remaining=days_remaining
                )
                session.add(new_cert)
                # 使用 flush 确保 ID 被加载到对象状态中
                session.flush()
                # 在 session 内访问 id 属性，确保它被加载
                cert_id = new_cert.id
                # 提交更改
                session.commit()
        
        # 第二步：使用 ID 在新会话中重新查询对象（避免 detached instance 错误）
        if cert_id:
            with repo.db_session.get_session() as session:
                cert_obj = session.query(TLSCertificate).filter(
                    TLSCertificate.id == cert_id
                ).first()
                if cert_obj:
                    # 在会话内访问所有常用属性，确保它们被加载（避免 detached instance 错误）
                    _ = cert_obj.id
                    _ = cert_obj.domain
                    _ = cert_obj.store
                    _ = cert_obj.source
                    _ = cert_obj.status
                    # 使用 expunge 将对象从 session 分离，但保留已加载的属性
                    session.expunge(cert_obj)
                    return cert_obj
        
        return None
    except Exception as e:
        logger.error(f"❌ Upsert 证书失败: folder_name={folder_name}, domain={domain}, source={source}, error={e}", exc_info=True)
        return None

