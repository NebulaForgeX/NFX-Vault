# coding=utf-8

"""
证书应用层（Application）

MVC 架构 - Application 层
负责证书业务逻辑
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
    get_certificate_detail,
    publish_refresh_event,
    read_folders_and_store_certificates,
    create_certificate,
    update_certificate,
    delete_certificate,
    export_certificates,
    apply_certificate,
    invalidate_cache,
)

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
        page: int = 1,
        page_size: int = 20,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """获取证书列表"""
        return get_certificate_list(self, store, page, page_size, use_cache)
    
    def get_certificate_detail(
        self,
        store: str,
        domain: str,
        source: CertificateSource = CertificateSource.AUTO,
        use_cache: bool = True
    ) -> Optional[Dict[str, Any]]:
        """获取证书详情"""
        return get_certificate_detail(self, store, domain, source, use_cache)
    
    def publish_refresh_event(
        self,
        store: str,
        trigger: str = "manual"
    ):
        """发布刷新事件"""
        return publish_refresh_event(self, store, trigger)
    
    async def read_folders_and_store_certificates(
        self,
        store: str
    ) -> Dict[str, Any]:
        """读取文件夹并存储证书"""
        return await read_folders_and_store_certificates(self, store)
    
    def create_certificate(
        self,
        store: str,
        domain: str,
        certificate: str,
        private_key: str,
        sans: Optional[list] = None
    ) -> Dict[str, Any]:
        """创建证书"""
        return create_certificate(self, store, domain, certificate, private_key, sans)
    
    def update_certificate(
        self,
        domain: str,
        source: CertificateSource,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
        sans: Optional[list] = None
    ) -> Dict[str, Any]:
        """更新证书"""
        return update_certificate(self, domain, source, certificate, private_key, store, sans)
    
    def delete_certificate(
        self,
        domain: str,
        source: CertificateSource
    ) -> Dict[str, Any]:
        """删除证书"""
        return delete_certificate(self, domain, source)
    
    def export_certificates(
        self,
        store: str
    ) -> Dict[str, Any]:
        """导出证书"""
        return export_certificates(self, store)
    
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
