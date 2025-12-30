# coding=utf-8

"""
证书 Pipeline 仓库

负责将证书刷新事件发送到 Kafka
"""
import logging
from typing import Optional

from modules.configs.database_config import DatabaseConfig
from resources.kafka.producer import send_message
from events.operation_refresh_event import OperationRefreshEvent
from events.cache_invalidate_event import CacheInvalidateEvent
from events.event_type import EventType
from resources.kafka.consumer import KafkaEventConsumer
from typing import List

logger = logging.getLogger(__name__)


class CertificatePipeline:
    """证书 Pipeline 仓库"""
    
    def __init__(self, db_config: Optional[DatabaseConfig] = None):
        """
        初始化 Pipeline 仓库
        
        Args:
            db_config: 数据库配置对象（包含 Kafka 配置）
        """
        self.db_config = db_config
    
    def send_refresh_event(
        self,
        store: str,
        trigger: str = "manual"
    ) -> bool:
        """
        发送证书刷新事件到 Kafka
        
        Args:
            store: 存储位置（websites 或 apis）
            trigger: 触发来源（manual, scheduled, api）
        
        Returns:
            是否发送成功
        """
        if not self.db_config or not self.db_config.KAFKA_ENABLED:
            logger.debug("⚠️  Kafka 未启用，跳过发送刷新事件")
            return False
        
        try:
            # 创建事件对象
            event = OperationRefreshEvent(
                store=store,
                trigger=trigger
            )
            
            # 发送事件（event_type 放在 headers 中）
            success = send_message(
                bootstrap_servers=self.db_config.KAFKA_BOOTSTRAP_SERVERS,
                topic=self.db_config.KAFKA_EVENT_TOPIC,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.OPERATION_REFRESH
                },
                enable_kafka=self.db_config.KAFKA_ENABLED
            )
            
            if success:
                logger.info(f"✅ 已发送证书刷新事件到 Kafka: store={store}, trigger={trigger}")
            else:
                logger.warning(f"⚠️  发送证书刷新事件失败: store={store}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ 发送证书刷新事件失败: {e}", exc_info=True)
            return False
    
    def send_cache_invalidate_event(
        self,
        stores: List[str],
        trigger: str = "manual"
    ) -> bool:
        """
        发送缓存失效事件到 Kafka
        
        Args:
            stores: 存储位置列表（websites, apis, database）
            trigger: 触发来源（manual, add, update, delete）
        
        Returns:
            是否发送成功
        """
        if not self.db_config or not self.db_config.KAFKA_ENABLED:
            logger.debug("⚠️  Kafka 未启用，跳过发送缓存失效事件")
            return False
        
        try:
            # 创建事件对象
            event = CacheInvalidateEvent(
                stores=stores,
                trigger=trigger
            )
            
            # 发送事件（event_type 放在 headers 中）
            success = send_message(
                bootstrap_servers=self.db_config.KAFKA_BOOTSTRAP_SERVERS,
                topic=self.db_config.KAFKA_EVENT_TOPIC,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.CACHE_INVALIDATE
                },
                enable_kafka=self.db_config.KAFKA_ENABLED
            )
            
            if success:
                logger.info(f"✅ 已发送缓存失效事件到 Kafka: stores={stores}, trigger={trigger}")
            else:
                logger.warning(f"⚠️  发送缓存失效事件失败: stores={stores}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ 发送缓存失效事件失败: {e}", exc_info=True)
            return False

