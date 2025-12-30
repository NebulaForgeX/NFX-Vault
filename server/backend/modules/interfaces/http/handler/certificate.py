# coding=utf-8

"""
证书 HTTP 处理器

处理证书相关的 HTTP 请求
"""
import logging
from typing import Optional

from modules.applications.tls import CertificateApplication
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


class CertificateHTTPHandler:
    """证书 HTTP 处理器"""
    def __init__(self, certificate_application: CertificateApplication):
        self.certificate_application = certificate_application
    
    def get_certificate_list(
        self,
        store: str,  # 存储位置（websites 或 apis）
        page: int = 1,  # 页码
        page_size: int = 20  # 每页数量
    ):
        return self.certificate_application.get_certificate_list(
            store=store,
            page=page,
            page_size=page_size,
            use_cache=True
        )
    
    def get_certificate_detail(
        self,
        store: str,  # 存储位置（websites 或 apis）
        domain: str,  # 域名
        source: CertificateSource = CertificateSource.AUTO  # 来源（auto 或 manual），默认为 auto
    ):
        """获取证书详情，如果不存在则返回 None"""
        return self.certificate_application.get_certificate_detail(
            store=store,
            domain=domain,
            source=source,
            use_cache=True
        )
    
    def create_certificate(
        self,
        store: str,  # 存储位置（websites 或 apis）
        domain: str,  # 域名
        certificate: str,  # 证书内容（PEM格式）
        private_key: str,  # 私钥内容（PEM格式）
        sans: Optional[list] = None  # SANs 列表，可选
    ):
        """创建证书（手动添加）"""
        return self.certificate_application.create_certificate(
            store=store,
            domain=domain,
            certificate=certificate,
            private_key=private_key,
            sans=sans
        )
    
    def update_certificate(
        self,
        domain: str,  # 域名
        source: CertificateSource,  # 来源（auto 或 manual）
        certificate: Optional[str] = None,  # 证书内容（PEM格式），可选
        private_key: Optional[str] = None,  # 私钥内容（PEM格式），可选
        store: Optional[str] = None,  # 存储位置，可选
        sans: Optional[list] = None  # SANs 列表，可选
    ):
        """更新证书"""
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
        domain: str,  # 域名
        source: CertificateSource  # 来源（auto 或 manual）
    ):
        """删除证书"""
        return self.certificate_application.delete_certificate(
            domain=domain,
            source=source
        )
    
    def publish_read_certificate_file(
        self,
        store: str,  # 存储位置（websites 或 apis）
        trigger: str = "api"  # 触发来源（api, manual）
    ):
        """发布读取证书文件事件（发送 Kafka 事件），实际读取由 Kafka Consumer 触发"""
        logger.info(f"📤 HTTP 请求发布读取证书文件事件: store={store}, trigger={trigger}")
        self.certificate_application.publish_refresh_event(store, trigger)
    
    def apply_certificate(
        self,
        domain: str,  # 主域名
        email: str,  # 邮箱地址（用于 Let's Encrypt 通知）
        folder_name: str,  # 文件夹名称（唯一标识符）
        sans: Optional[list] = None,  # SANs 列表（可选）
        webroot: Optional[str] = None  # Webroot 路径（用于 HTTP-01 验证），留空使用默认路径
    ):
        """申请 Let's Encrypt 证书（统一存储在 database）"""
        return self.certificate_application.apply_certificate(
            domain=domain,
            email=email,
            folder_name=folder_name,
            sans=sans,
            webroot=webroot
        )
    
    def invalidate_cache(
        self,
        store: str,  # 存储位置（websites, apis, database）
        trigger: str = "manual"  # 触发来源（manual, api）
    ):
        """触发缓存失效（发送 Kafka 事件）"""
        logger.info(f"📤 HTTP 请求触发缓存失效: store={store}, trigger={trigger}")
        success = self.certificate_application.invalidate_cache([store], trigger)
        return {
            "success": success,
            "message": f"Cache invalidate event published for {store}" if success else f"Failed to publish cache invalidate event for {store}",
        }
