# coding=utf-8

"""
创建证书操作
"""
import logging
from typing import List, Optional
from datetime import datetime

from models.tls_certificate import TLSCertificate
from .create_or_update_certificate import create_or_update_certificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def create_certificate(
    repo: CertificateDatabaseLike,
    store: str,
    domain: str,
    certificate: str,
    private_key: str,
    sans: Optional[List[str]] = None,
    issuer: Optional[str] = None,
    not_before: Optional[datetime] = None,
    not_after: Optional[datetime] = None,
    is_valid: Optional[bool] = True,
    days_remaining: Optional[int] = None,
    folder_name: Optional[str] = None,
    email: Optional[str] = None
) -> Optional[TLSCertificate]:
    """
    创建证书（手动添加，source 固定为 manual_add，默认存到 database）
    
    Args:
        repo: CertificateDatabase 实例
        store: 存储位置（默认 database）
        domain: 域名
        certificate: 证书内容（PEM格式）
        private_key: 私钥内容（PEM格式）
        sans: SANs 列表
        issuer: 颁发者
        not_before: 有效期开始时间
        not_after: 有效期结束时间
        is_valid: 是否有效
        days_remaining: 剩余天数
        folder_name: 文件夹名称（可选）
        email: 邮箱地址（可选）
    
    Returns:
        证书对象，如果已存在则返回 None
    """
    return create_or_update_certificate(
        repo=repo,
        store=store,
        domain=domain,
        folder_name=folder_name,
        certificate=certificate,
        private_key=private_key,
        source='manual_add',
        status='process',  # 用户添加时显示 process
        sans=sans,
        issuer=issuer,
        not_before=not_before,
        not_after=not_after,
        is_valid=is_valid,
        days_remaining=days_remaining,
        email=email
    )

