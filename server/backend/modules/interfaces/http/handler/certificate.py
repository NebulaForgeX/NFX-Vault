# coding=utf-8

"""
证书 HTTP 处理器

处理证书相关的 HTTP 请求
"""
import logging
from typing import Optional

from modules.applications.certificate import CertificateApplication
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


class CertificateHTTPHandler:
    """证书 HTTP 处理器"""
    
    def __init__(
        self,
        certificate_application: CertificateApplication
    ):
        """
        初始化 HTTP 处理器
        
        Args:
            certificate_application: 证书应用层实例
        """
        self.certificate_application = certificate_application
    
    def get_certificate_list(
        self,
        store: str,
        page: int = 1,
        page_size: int = 20
    ):
        """
        获取证书列表
        
        Args:
            store: 存储位置（websites 或 apis）
            page: 页码
            page_size: 每页数量
        
        Returns:
            证书列表结果
        """
        return self.certificate_application.get_certificate_list(
            store=store,
            page=page,
            page_size=page_size,
            use_cache=True
        )
    
    def get_certificate_detail(
        self,
        store: str,
        domain: str,
        source: CertificateSource = CertificateSource.AUTO
    ):
        """
        获取证书详情
        
        Args:
            store: 存储位置（websites 或 apis）
            domain: 域名
            source: 来源（auto 或 manual），默认为 auto
        
        Returns:
            证书详情，如果不存在则返回 None
        """
        return self.certificate_application.get_certificate_detail(
            store=store,
            domain=domain,
            source=source,
            use_cache=True
        )
    
    def create_certificate(
        self,
        store: str,
        domain: str,
        certificate: str,
        private_key: str,
        sans: Optional[list] = None
    ):
        """
        创建证书（手动添加）
        
        Args:
            store: 存储位置（websites 或 apis）
            domain: 域名
            certificate: 证书内容（PEM格式）
            private_key: 私钥内容（PEM格式）
            sans: SANs 列表，可选
        
        Returns:
            创建结果
        """
        return self.certificate_application.create_certificate(
            store=store,
            domain=domain,
            certificate=certificate,
            private_key=private_key,
            sans=sans
        )
    
    def update_certificate(
        self,
        domain: str,
        source: CertificateSource,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
        sans: Optional[list] = None
    ):
        """
        更新证书
        
        Args:
            domain: 域名
            source: 来源（auto 或 manual）
            certificate: 证书内容（PEM格式），可选
            private_key: 私钥内容（PEM格式），可选
            store: 存储位置，可选
            sans: SANs 列表，可选
        
        Returns:
            更新结果
        """
        return self.certificate_application.update_certificate(
            domain=domain,
            source=source,
            certificate=certificate,
            private_key=private_key,
            store=store,
            sans=sans
        )
    
    def delete_certificate(
        self,
        domain: str,
        source: CertificateSource
    ):
        """
        删除证书
        
        Args:
            domain: 域名
            source: 来源（auto 或 manual）
        
        Returns:
            删除结果
        """
        return self.certificate_application.delete_certificate(
            domain=domain,
            source=source
        )
    
    def publish_read_certificate_file(self, store: str, trigger: str = "api"):
        """
        发布读取证书文件（发送 Kafka 事件）
        
        此方法只发送事件，不实际读取文件
        实际读取由 Kafka Consumer 触发
        
        Args:
            store: 存储位置（websites 或 apis）
            trigger: 触发来源（api, manual）
        """
        logger.info(f"📤 HTTP 请求发布读取证书文件事件: store={store}, trigger={trigger}")
        self.certificate_application.publish_refresh_event(store, trigger)
    
    def export_certificates(self, store: str):
        """
        导出证书
        
        Args:
            store: 存储位置（websites 或 apis）
        
        Returns:
            导出结果
        """
        return self.certificate_application.export_certificates(store)
    
    def apply_certificate(
        self,
        domain: str,
        email: str,
        folder_name: str,
        sans: Optional[list] = None,
        webroot: Optional[str] = None
    ):
        """
        申请 Let's Encrypt 证书（统一存储在 database）
        
        Args:
            domain: 主域名
            email: 邮箱地址（用于 Let's Encrypt 通知）
            folder_name: 文件夹名称（唯一标识符）
            sans: SANs 列表（可选）
            webroot: Webroot 路径（用于 HTTP-01 验证），留空使用默认路径
        
        Returns:
            申请结果
        """
        return self.certificate_application.apply_certificate(
            domain=domain,
            email=email,
            folder_name=folder_name,
            sans=sans,
            webroot=webroot
        )

