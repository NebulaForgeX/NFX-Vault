# coding=utf-8

"""
TLS 证书应用层（Application）

MVC 架构 - Application 层
负责 TLS 证书业务逻辑
"""
import logging
from typing import Optional, Dict, Any

from modules.repositories.database.certificate import CertificateDatabase
from modules.repositories.cache.certificate import CertificateCache
from modules.repositories.pipeline.certificate import CertificatePipeline
from modules.repositories.tls.certificate import TLSCertificateRepository
from modules.configs.database_config import DatabaseConfig
from enums.certificate_source import CertificateSource

from .handler import (
    get_certificate_list,
    get_certificate_detail_by_id,
    publish_refresh_event,
    create_certificate,
    update_manual_add_certificate,
    update_manual_apply_certificate,
    delete_certificate,
    apply_certificate,
    reapply_auto_certificate,
    reapply_manual_apply_certificate,
    reapply_manual_add_certificate,
    search_certificate,
    invalidate_cache,
)
from modules.applications.analysis.handler import parse_certificate

logger = logging.getLogger(__name__)


class CertificateApplication:
    """证书应用层"""
    
    def __init__(
        self,
        database_repo: CertificateDatabase,
        cache_repo: CertificateCache,
        pipeline_repo: Optional[CertificatePipeline] = None,
        tls_repo: Optional[TLSCertificateRepository] = None,
        db_config: Optional[DatabaseConfig] = None,
        cert_config: Optional[object] = None
    ):
        """
        初始化应用层
        
        Args:
            database_repo: 数据库仓库
            cache_repo: 缓存仓库
            pipeline_repo: 管道仓库（用于发送 Kafka 事件）
            tls_repo: TLS 证书申请仓库
            db_config: 数据库配置对象（用于 Kafka 发送）
            cert_config: 证书配置对象（用于获取 BASE_DIR）
        """
        from modules.configs.types import CertConfig
        
        self.database_repo = database_repo
        self.cache_repo = cache_repo
        self.pipeline_repo = pipeline_repo
        self.tls_repo = tls_repo
        self.db_config = db_config
        
        # base_dir 从 cert_config 读取（必需）
        if not cert_config:
            raise ValueError("cert_config is required")
        if not isinstance(cert_config, CertConfig):
            raise ValueError(f"cert_config must be CertConfig instance, got {type(cert_config)}")
        self.base_dir = cert_config.BASE_DIR
    
    def get_certificate_list(
        self,
        store: str,
        offset: int = 0,
        limit: int = 20,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """获取证书列表"""
        return get_certificate_list(self, store, offset, limit, use_cache)
    
    def get_certificate_detail_by_id(
        self,
        certificate_id: str,
        use_cache: bool = True
    ) -> Optional[Dict[str, Any]]:
        """通过 ID 获取证书详情"""
        return get_certificate_detail_by_id(self, certificate_id, use_cache)
    
    def publish_refresh_event(
        self,
        store: str,
        trigger: str = "manual"
    ):
        """发布刷新事件"""
        return publish_refresh_event(self, store, trigger)
    
    def create_certificate(
        self,
        store: str,
        domain: str,
        certificate: str,
        private_key: str,
        sans: Optional[list] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None,
        issuer: Optional[str] = None
    ) -> Dict[str, Any]:
        """创建证书"""
        return create_certificate(self, store, domain, certificate, private_key, sans, folder_name, email, issuer)
    
    def update_manual_add_certificate(
        self,
        certificate_id: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
        sans: Optional[list] = None,
        folder_name: Optional[str] = None,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """更新手动添加的证书（MANUAL_ADD）"""
        return update_manual_add_certificate(self, certificate_id, certificate, private_key, store, sans, folder_name, email)
    
    def update_manual_apply_certificate(
        self,
        domain: str,
        folder_name: str,
        store: Optional[str] = None
    ) -> Dict[str, Any]:
        """更新手动申请的证书（MANUAL_APPLY），可以更新 folder_name 和 store"""
        return update_manual_apply_certificate(self, domain, folder_name, store)
    
    def delete_certificate(
        self,
        domain: str,
        source: CertificateSource
    ) -> Dict[str, Any]:
        """删除证书"""
        return delete_certificate(self, domain, source)
    
    def apply_certificate(
        self,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list] = None,
        webroot: Optional[str] = None
    ) -> Dict[str, Any]:
        """申请证书（统一存储在 database）"""
        return apply_certificate(self, domain, email, folder_name, sans, webroot)
    
    def reapply_auto_certificate(
        self,
        certificate_id: str,
        email: str,
        sans: Optional[list] = None,
        webroot: Optional[str] = None,
        force_renewal: bool = False
    ) -> Dict[str, Any]:
        """AUTO 证书重新申请（apply 后写回文件夹，不修改 domain 和 folder_name）"""
        return reapply_auto_certificate(self, certificate_id, email, sans, webroot, force_renewal)
    
    def reapply_manual_apply_certificate(
        self,
        certificate_id: str,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list] = None,
        webroot: Optional[str] = None,
        force_renewal: bool = False
    ) -> Dict[str, Any]:
        """MANUAL_APPLY 证书重新申请（正常 apply 流程）"""
        return reapply_manual_apply_certificate(self, certificate_id, domain, email, folder_name, sans, webroot, force_renewal)
    
    def reapply_manual_add_certificate(
        self,
        certificate_id: str,
        email: str,
        sans: Optional[list] = None,
        webroot: Optional[str] = None,
        force_renewal: bool = False
    ) -> Dict[str, Any]:
        """MANUAL_ADD 证书重新申请（只更新证书内容和私钥）"""
        return reapply_manual_add_certificate(self, certificate_id, email, sans, webroot, force_renewal)
    
    def search_certificate(
        self,
        keyword: str,
        store: Optional[str] = None,
        source: Optional[str] = None,
        offset: int = 0,
        limit: int = 20
    ) -> Dict[str, Any]:
        """搜索证书"""
        return search_certificate(self, keyword, store, source, offset, limit)
    
    def invalidate_cache(
        self,
        stores: list,
        trigger: str = "manual"
    ) -> bool:
        """
        发布缓存失效事件（通过 Kafka）
        
        Args:
            stores: 存储位置列表（websites, apis, database）
            trigger: 触发来源（manual, add, update, delete）
        
        Returns:
            是否成功发布事件
        """
        return invalidate_cache(self, stores, trigger)
    
    def parse_certificate(
        self,
        certificate_id: str
    ) -> Dict[str, Any]:
        """
        解析证书内容并更新数据库
        
        Args:
            certificate_id: 证书 ID
        
        Returns:
            解析结果（包含 success, message 等）
        """
        return parse_certificate(self, certificate_id)
