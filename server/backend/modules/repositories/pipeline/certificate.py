# coding=utf-8

"""
证书 Pipeline 仓库

负责将证书刷新事件发送到 Kafka
"""
import logging
from typing import Optional

from modules.configs.database_config import DatabaseConfig
from resources.kafka.client import KafkaClient
from events.operation_refresh_event import OperationRefreshEvent
from events.cache_invalidate_event import CacheInvalidateEvent
from events.parse_certificate_event import ParseCertificateEvent
from events.event_type import EventType
from events.delete_folder_event import DeleteFolderEvent
from events.delete_file_or_folder_event import DeleteFileOrFolderEvent
from events.export_certificate_event import ExportCertificateEvent
from resources.kafka.consumer import KafkaEventConsumer
from typing import List, Optional

logger = logging.getLogger(__name__)


class CertificatePipeline:
    """证书 Pipeline 仓库"""
    
    def __init__(
        self,
        db_config: Optional[DatabaseConfig] = None,
        kafka_client: Optional[KafkaClient] = None
    ):
        """
        初始化 Pipeline 仓库
        
        Args:
            db_config: 数据库配置对象（包含 Kafka 配置）
            kafka_client: Kafka 客户端实例（复用，不每次创建）
        """
        self.db_config = db_config
        self.kafka_client = kafka_client
    
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
        if not self.db_config:
            logger.warning("⚠️  数据库配置未初始化，跳过发送刷新事件")
            return False
        
        if not self.kafka_client or not self.kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未初始化或未启用")
            return False
        
        try:
            # 创建事件对象
            event = OperationRefreshEvent(
                store=store,
                trigger=trigger
            )
            
            # 确保 topic 存在
            topic = self.db_config.KAFKA_EVENT_TOPIC
            if not self.kafka_client.ensure_topic_exists(topic):
                logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
            
            # 发送事件（event_type 放在 headers 中）
            success = self.kafka_client.send(
                topic=topic,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.OPERATION_REFRESH
                }
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
        if not self.db_config:
            logger.warning("⚠️  数据库配置未初始化，跳过发送缓存失效事件")
            return False
        
        if not self.kafka_client or not self.kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未初始化或未启用")
            return False
        
        try:
            # 创建事件对象
            event = CacheInvalidateEvent(
                stores=stores,
                trigger=trigger
            )
            
            # 确保 topic 存在
            topic = self.db_config.KAFKA_EVENT_TOPIC
            if not self.kafka_client.ensure_topic_exists(topic):
                logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
            
            # 发送事件（event_type 放在 headers 中）
            success = self.kafka_client.send(
                topic=topic,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.CACHE_INVALIDATE
                }
            )
            
            if success:
                logger.info(f"✅ 已发送缓存失效事件到 Kafka: stores={stores}, trigger={trigger}")
            else:
                logger.warning(f"⚠️  发送缓存失效事件失败: stores={stores}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ 发送缓存失效事件失败: {e}", exc_info=True)
            return False
    
    def send_parse_certificate_event(
        self,
        certificate_id: str
    ) -> bool:
        """
        发送解析证书事件到 Kafka
        
        Args:
            certificate_id: 证书 ID
        
        Returns:
            是否发送成功
        """
        if not self.db_config:
            logger.warning("⚠️  数据库配置未初始化，跳过发送解析证书事件")
            return False
        
        if not self.kafka_client or not self.kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未初始化或未启用")
            return False
        
        try:
            # 创建事件对象
            event = ParseCertificateEvent(
                certificate_id=certificate_id
            )
            
            # 确保 topic 存在
            topic = self.db_config.KAFKA_EVENT_TOPIC
            if not self.kafka_client.ensure_topic_exists(topic):
                logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
            
            # 发送事件（event_type 放在 headers 中）
            success = self.kafka_client.send(
                topic=topic,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.PARSE_CERTIFICATE
                }
            )
            
            if success:
                logger.info(f"✅ 已发送解析证书事件到 Kafka: certificate_id={certificate_id}")
            else:
                logger.warning(f"⚠️  发送解析证书事件失败: certificate_id={certificate_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ 发送解析证书事件失败: {e}", exc_info=True)
            return False
    
    def send_delete_folder_event(
        self,
        store: str,
        folder_name: str
    ) -> bool:
        """
        发送删除文件夹事件到 Kafka
        
        Args:
            store: 存储位置（websites 或 apis）
            folder_name: 文件夹名称
        
        Returns:
            是否发送成功
        """
        if not self.db_config:
            logger.warning("⚠️  数据库配置未初始化，跳过发送删除文件夹事件")
            return False
        
        if not self.kafka_client or not self.kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未初始化或未启用")
            return False
        
        try:
            # 创建事件对象
            event = DeleteFolderEvent(
                store=store,
                folder_name=folder_name
            )
            
            # 确保 topic 存在
            topic = self.db_config.KAFKA_EVENT_TOPIC
            if not self.kafka_client.ensure_topic_exists(topic):
                logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
            
            # 发送事件（event_type 放在 headers 中）
            success = self.kafka_client.send(
                topic=topic,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.DELETE_FOLDER
                }
            )
            
            if success:
                logger.info(f"✅ 已发送删除文件夹事件到 Kafka: store={store}, folder_name={folder_name}")
            else:
                logger.warning(f"⚠️  发送删除文件夹事件失败: store={store}, folder_name={folder_name}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ 发送删除文件夹事件失败: {e}", exc_info=True)
            return False
    
    def send_delete_file_or_folder_event(
        self,
        store: str,
        path: str,
        item_type: str
    ) -> bool:
        """
        发送删除文件或文件夹事件到 Kafka
        
        Args:
            store: 存储位置（websites 或 apis）
            path: 文件或文件夹路径
            item_type: 类型（"file" 或 "folder"）
        
        Returns:
            是否发送成功
        """
        if not self.db_config:
            logger.warning("⚠️  数据库配置未初始化，跳过发送删除文件/文件夹事件")
            return False
        
        if not self.kafka_client or not self.kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未初始化或未启用")
            return False
        
        try:
            # 创建事件对象
            event = DeleteFileOrFolderEvent(
                store=store,
                path=path,
                item_type=item_type
            )
            
            # 确保 topic 存在
            topic = self.db_config.KAFKA_EVENT_TOPIC
            if not self.kafka_client.ensure_topic_exists(topic):
                logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
            
            # 发送事件（event_type 放在 headers 中）
            success = self.kafka_client.send(
                topic=topic,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.DELETE_FILE_OR_FOLDER
                }
            )
            
            if success:
                logger.info(f"✅ 已发送删除文件/文件夹事件到 Kafka: store={store}, path={path}, item_type={item_type}")
            else:
                logger.warning(f"⚠️  发送删除文件/文件夹事件失败: store={store}, path={path}, item_type={item_type}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ 发送删除文件/文件夹事件失败: {e}", exc_info=True)
            return False
    
    def send_export_certificate_event(
        self,
        certificate_id: str
    ) -> bool:
        """
        发送导出证书事件到 Kafka
        
        Args:
            certificate_id: 证书 ID
        
        Returns:
            是否发送成功
        """
        if not self.db_config:
            logger.warning("⚠️  数据库配置未初始化，跳过发送导出证书事件")
            return False
        
        if not self.kafka_client or not self.kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未初始化或未启用")
            return False
        
        try:
            # 创建事件对象
            event = ExportCertificateEvent(
                certificate_id=certificate_id
            )
            
            # 确保 topic 存在
            topic = self.db_config.KAFKA_EVENT_TOPIC
            if not self.kafka_client.ensure_topic_exists(topic):
                logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
            
            # 发送事件（event_type 放在 headers 中）
            success = self.kafka_client.send(
                topic=topic,
                data=event.to_dict(),
                headers={
                    KafkaEventConsumer.EVENT_TYPE_HEADER_KEY: EventType.EXPORT_CERTIFICATE
                }
            )
            
            if success:
                logger.info(f"✅ 已发送导出证书事件到 Kafka: certificate_id={certificate_id}")
            else:
                logger.warning(f"⚠️  发送导出证书事件失败: certificate_id={certificate_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ 发送导出证书事件失败: {e}", exc_info=True)
            return False

