# coding=utf-8

"""
证书 Kafka 处理器

处理证书相关的 Kafka 事件
"""
import logging
from typing import Dict, Any

from events.operation_refresh_event import OperationRefreshEvent
from events.cache_invalidate_event import CacheInvalidateEvent
from events.parse_certificate_event import ParseCertificateEvent
from modules.applications.tls import CertificateApplication
from modules.applications.file import FileApplication

logger = logging.getLogger(__name__)


class CertificateKafkaHandler:
    """证书 Kafka 处理器"""
    
    def __init__(
        self,
        certificate_application: CertificateApplication,
        file_application: FileApplication
    ):
        """
        初始化事件处理器
        
        Args:
            certificate_application: 证书应用层实例
            file_application: 文件应用层实例
        """
        self.certificate_application = certificate_application
        self.file_application = file_application
    
    def process_read_certificate_file(self, event_data: Dict[str, Any]):
        """
        处理读取文件夹证书（来自 Kafka 事件）
        
        此方法实际执行文件夹证书的读取和处理
        
        Args:
            event_data: 事件数据
        """
        try:
            event = OperationRefreshEvent.from_dict(event_data)
            logger.info(f"🔄 收到读取文件夹证书请求（事件）: store={event.store}, trigger={event.trigger}")
            
            # 调用 Application 层处理业务逻辑
            # 注意：将 trigger 改为 "event"，避免在 Application 层再次发送 Kafka 事件导致无限循环
            # 在 Kafka Consumer 线程中，需要创建新的事件循环
            import asyncio
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            loop.run_until_complete(
                self.file_application.read_folders_and_store_certificates(store=event.store)
            )
            
        except Exception as e:
            logger.error(f"❌ 处理读取文件夹证书失败: {e}", exc_info=True)
            raise
    
    def process_cache_invalidate(self, event_data: Dict[str, Any]):
        """
        处理缓存失效事件（来自 Kafka 事件）
        
        此方法会清除指定存储位置的缓存
        
        Args:
            event_data: 事件数据
        """
        try:
            event = CacheInvalidateEvent.from_dict(event_data)
            logger.info(f"🔄 收到缓存失效事件: stores={event.stores}, trigger={event.trigger}")
            
            # 清除缓存
            for store in event.stores:
                self.certificate_application.cache_repo.clear_store_cache(store)
                logger.info(f"✅ 已清除缓存: store={store}")
            
            logger.info(f"✅ 缓存失效处理完成: stores={event.stores}")
            
        except Exception as e:
            logger.error(f"❌ 处理缓存失效事件失败: {e}", exc_info=True)
            raise
    
    def process_parse_certificate(self, event_data: Dict[str, Any]):
        """
        处理解析证书事件（来自 Kafka 事件）
        
        此方法会解析证书内容并更新数据库
        
        Args:
            event_data: 事件数据
        """
        try:
            event = ParseCertificateEvent.from_dict(event_data)
            logger.info(f"🔄 收到解析证书请求（事件）: certificate_id={event.certificate_id}")
            
            # 调用 Application 层处理业务逻辑
            result = self.certificate_application.parse_certificate(
                certificate_id=event.certificate_id
            )
            
            if result.get("success"):
                logger.info(f"✅ 证书解析成功: certificate_id={event.certificate_id}")
            else:
                logger.warning(f"⚠️  证书解析失败: certificate_id={event.certificate_id}, message={result.get('message')}")
            
        except Exception as e:
            logger.error(f"❌ 处理解析证书事件失败: {e}", exc_info=True)
            raise

