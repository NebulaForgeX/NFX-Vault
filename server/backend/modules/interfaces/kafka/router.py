# coding=utf-8

"""
Kafka 事件路由分发器

负责将 Kafka 事件（event_type）路由到对应的 Handler 方法
"""
import logging
from typing import Dict, Callable, Any, Optional

from events.event_type import EventType
from modules.interfaces.kafka.handler.certificate import CertificateKafkaHandler

logger = logging.getLogger(__name__)


class KafkaEventRouter:
    """Kafka 事件路由分发器"""
    
    def __init__(
        self,
        certificate_kafka_handler: Optional[CertificateKafkaHandler] = None
    ):
        """
        初始化路由分发器
        
        Args:
            certificate_kafka_handler: 证书 Kafka 处理器
        """
        self.certificate_kafka_handler = certificate_kafka_handler
        self.routes: Dict[str, Callable[[Dict[str, Any]], None]] = {}
    
    def register_routes(self):
        """注册所有路由"""
        if self.certificate_kafka_handler:
            # 注册 operation.refresh 路由
            self.routes[EventType.OPERATION_REFRESH] = self.certificate_kafka_handler.process_read_certificate_file
            logger.info(f"✅ 注册路由: {EventType.OPERATION_REFRESH} -> CertificateKafkaHandler.process_read_certificate_file")
            
            # 注册 cache.invalidate 路由
            self.routes[EventType.CACHE_INVALIDATE] = self.certificate_kafka_handler.process_cache_invalidate
            logger.info(f"✅ 注册路由: {EventType.CACHE_INVALIDATE} -> CertificateKafkaHandler.process_cache_invalidate")
            
            # 注册 certificate.parse 路由
            self.routes[EventType.PARSE_CERTIFICATE] = self.certificate_kafka_handler.process_parse_certificate
            logger.info(f"✅ 注册路由: {EventType.PARSE_CERTIFICATE} -> CertificateKafkaHandler.process_parse_certificate")
            
            # 注册 folder.delete 路由
            self.routes[EventType.DELETE_FOLDER] = self.certificate_kafka_handler.process_delete_folder
            logger.info(f"✅ 注册路由: {EventType.DELETE_FOLDER} -> CertificateKafkaHandler.process_delete_folder")
            
            # 注册 file_or_folder.delete 路由
            self.routes[EventType.DELETE_FILE_OR_FOLDER] = self.certificate_kafka_handler.process_delete_file_or_folder
            logger.info(f"✅ 注册路由: {EventType.DELETE_FILE_OR_FOLDER} -> CertificateKafkaHandler.process_delete_file_or_folder")
            
            # 注册 certificate.export 路由
            self.routes[EventType.EXPORT_CERTIFICATE] = self.certificate_kafka_handler.process_export_certificate
            logger.info(f"✅ 注册路由: {EventType.EXPORT_CERTIFICATE} -> CertificateKafkaHandler.process_export_certificate")
        
        logger.info(f"📋 共注册 {len(self.routes)} 个路由")
    
    def route(self, event_type: str, event_data: Dict[str, Any]) -> bool:
        """
        路由事件到对应的处理器
        
        Args:
            event_type: 事件类型
            event_data: 事件数据
        
        Returns:
            是否成功路由和处理
        """
        handler = self.routes.get(event_type)
        if not handler:
            logger.warning(f"⚠️  未找到路由处理器: event_type={event_type}")
            return False
        
        try:
            handler(event_data)
            return True
        except Exception as e:
            logger.error(f"❌ 路由处理失败: event_type={event_type}, error={e}", exc_info=True)
            return False
    
    def get_handler(self, event_type: str) -> Optional[Callable[[Dict[str, Any]], None]]:
        """
        获取指定事件类型的处理器
        
        Args:
            event_type: 事件类型
        
        Returns:
            处理器函数，如果不存在则返回 None
        """
        return self.routes.get(event_type)
    
    def list_routes(self) -> Dict[str, str]:
        """
        列出所有已注册的路由
        
        Returns:
            路由映射字典 {event_type: handler_name}
        """
        return {
            event_type: handler.__name__ if hasattr(handler, '__name__') else str(handler)
            for event_type, handler in self.routes.items()
        }


def setup_routes(
    certificate_kafka_handler: Optional[CertificateKafkaHandler] = None
) -> KafkaEventRouter:
    """
    设置 Kafka 事件路由分发器
    
    Args:
        certificate_kafka_handler: 证书 Kafka 处理器
    
    Returns:
        配置好的 KafkaEventRouter 实例
    """
    router = KafkaEventRouter(
        certificate_kafka_handler=certificate_kafka_handler
    )
    router.register_routes()
    return router

