# coding=utf-8

"""
证书数据库仓库

MySQL 数据库数据访问
"""
import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime

from models.tls_certificate import TLSCertificate
from .operation import (
    get_certificate_list,
    get_certificate_by_domain,
    get_certificate_by_id,
    get_certificate_by_folder_name,
    create_or_update_certificate,
    create_certificate,
    update_certificate,
    update_certificate_by_id,
    update_certificate_by_folder_name,
    update_certificate_parse_result,
    update_all_days_remaining,
    delete_certificate_by_id,
    delete_certificates_by_store,
    search_certificates,
)

logger = logging.getLogger(__name__)


class CertificateDatabase:
    """证书数据库仓库"""
    
    def __init__(self, db_session: Optional[object] = None):
        """
        初始化数据库仓库
        
        Args:
            db_session: MySQLSession 对象（包含 get_session() 方法）
        """
        self.db_session = db_session
    
    def get_certificate_list(
        self,
        store: str,
        offset: int = 0,
        limit: int = 20
    ) -> Tuple[List[Dict], int]:
        """获取证书列表（支持分页）"""
        return get_certificate_list(self, store, offset, limit)
    
    def get_certificate_by_domain(
        self,
        store: str,
        domain: str,
        source: str = 'auto'
    ) -> Optional[Dict[str, Any]]:
        """根据域名和来源获取证书"""
        return get_certificate_by_domain(self, store, domain, source)
    
    def get_certificate_by_id(
        self,
        certificate_id: str
    ) -> Optional[Dict[str, Any]]:
        """根据证书 ID 获取证书"""
        return get_certificate_by_id(self, certificate_id)
    
    def get_certificate_by_folder_name(
        self,
        folder_name: str
    ) -> Optional[Dict[str, Any]]:
        """根据文件夹名称获取证书"""
        return get_certificate_by_folder_name(self, folder_name)
    
    def create_or_update_certificate(
        self,
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
        """创建或更新证书（根据 folder_name 的唯一约束）"""
        return create_or_update_certificate(
            self, store, domain, certificate, private_key, source, status,
            email, sans, issuer, not_before, not_after, is_valid,
            days_remaining, folder_name
        )
    
    def create_certificate_with_folder(
        self,
        store: str,
        domain: str,
        folder_name: str,
        certificate: str,
        private_key: str,
        source: str = 'auto',
        status: Optional[str] = None,
        email: Optional[str] = None,
        sans: Optional[List[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = True,
        days_remaining: Optional[int] = None
    ) -> Optional[TLSCertificate]:
        """创建证书（带 folder_name）"""
        return create_or_update_certificate(
            self, store, domain, folder_name=folder_name,
            certificate=certificate, private_key=private_key, source=source,
            status=status, email=email, sans=sans, issuer=issuer,
            not_before=not_before, not_after=not_after, is_valid=is_valid,
            days_remaining=days_remaining
        )
    
    def update_certificate_by_folder_name(
        self,
        folder_name: str,
        store: Optional[str] = None,
        domain: Optional[str] = None,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        status: Optional[str] = None,
        sans: Optional[List[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = None,
        days_remaining: Optional[int] = None
    ) -> Optional[TLSCertificate]:
        """根据 folder_name 更新证书（保持原有 source）"""
        return update_certificate_by_folder_name(
            self, folder_name, store, domain, certificate, private_key,
            status, sans, issuer, not_before, not_after, is_valid, days_remaining
        )
    
    def create_certificate(
        self,
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
        """创建证书（手动添加，source 固定为 manual_add，默认存到 database）"""
        return create_certificate(
            self, store, domain, certificate, private_key, sans, issuer,
            not_before, not_after, is_valid, days_remaining, folder_name, email
        )
    
    def update_certificate(
        self,
        domain: str,
        source: str,
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
        """更新证书（根据 domain + source）"""
        return update_certificate(
            self, domain, source, certificate, private_key, store, sans,
            issuer, not_before, not_after, is_valid, days_remaining, folder_name, email, status
        )
    
    def update_certificate_by_id(
        self,
        certificate_id: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
        domain: Optional[str] = None,
        sans: Optional[List[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = None,
        days_remaining: Optional[int] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
        status: Optional[str] = None,
        last_error_message: Optional[str] = None,
        last_error_time: Optional[datetime] = None
    ) -> Optional[TLSCertificate]:
        """根据证书 ID 更新证书"""
        return update_certificate_by_id(
            self, certificate_id, certificate, private_key, store, domain, sans,
            issuer, not_before, not_after, is_valid, days_remaining, folder_name, email, status,
            last_error_message, last_error_time
        )
    
    def update_certificate_parse_result(
        self,
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
        """更新证书解析结果"""
        return update_certificate_parse_result(
            self, certificate_id, status, sans, issuer, email, not_before,
            not_after, is_valid, days_remaining
        )
    
    def update_all_days_remaining(self) -> Tuple[int, int]:
        """批量更新所有证书的剩余天数和有效性状态"""
        return update_all_days_remaining(self)
    
    def delete_certificate_by_id(
        self,
        certificate_id: str
    ) -> bool:
        """根据证书 ID 删除证书"""
        return delete_certificate_by_id(self, certificate_id)
    
    def delete_certificates_by_store(
        self,
        store: str,
        source: str = 'auto'
    ) -> int:
        """删除指定 store 和 source 的所有证书"""
        return delete_certificates_by_store(self, store, source)
    
    def search_certificates(
        self,
        keyword: str,
        store: Optional[str] = None,
        source: Optional[str] = None,
        offset: int = 0,
        limit: int = 20
    ) -> Tuple[List[Dict], int]:
        """搜索证书（根据关键词匹配域名、文件夹名等）"""
        return search_certificates(self, keyword, store, source, offset, limit)
