# coding=utf-8

"""
Kafka 消息生产者

工具函数层：提供基础的 Kafka 消息发送功能
"""
import logging
from typing import Dict, Any, Optional

from resources.kafka.client import KafkaClient

logger = logging.getLogger(__name__)


def send_message(
    bootstrap_servers: str,
    topic: str,
    data: Dict[str, Any],
    key: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None,
    enable_kafka: bool = True
) -> bool:
    """
    发送单条消息到 Kafka
    
    Args:
        bootstrap_servers: Kafka 服务器地址
        topic: 主题名称
        data: 消息数据（字典）
        key: 消息键（可选）
        headers: 消息头（可选）
        enable_kafka: 是否启用 Kafka
    
    Returns:
        是否发送成功
    """
    if not enable_kafka:
        logger.debug("⚠️  Kafka 未启用，跳过发送")
        return False
    
    try:
        kafka_client = KafkaClient(
            bootstrap_servers=bootstrap_servers,
            enable_kafka=enable_kafka
        )
        
        if not kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未启用或初始化失败")
            return False
        
        # 确保 topic 存在
        if not kafka_client.ensure_topic_exists(topic):
            logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
        
        success = kafka_client.send(
            topic=topic,
            data=data,
            key=key,
            headers=headers or {}
        )
        
        kafka_client.close()
        return success
        
    except Exception as e:
        logger.error(f"❌ 发送 Kafka 消息失败: {e}", exc_info=True)
        return False


def send_batch_messages(
    bootstrap_servers: str,
    topic: str,
    data_list: list[Dict[str, Any]],
    key_prefix: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None,
    enable_kafka: bool = True
) -> int:
    """
    批量发送消息到 Kafka
    
    Args:
        bootstrap_servers: Kafka 服务器地址
        topic: 主题名称
        data_list: 消息数据列表
        key_prefix: 消息键前缀（可选）
        headers: 消息头（可选）
        enable_kafka: 是否启用 Kafka
    
    Returns:
        成功发送的消息数量
    """
    if not enable_kafka:
        logger.debug("⚠️  Kafka 未启用，跳过批量发送")
        return 0
    
    if not data_list:
        return 0
    
    try:
        kafka_client = KafkaClient(
            bootstrap_servers=bootstrap_servers,
            enable_kafka=enable_kafka
        )
        
        if not kafka_client.enable_kafka:
            logger.warning("⚠️  Kafka 客户端未启用或初始化失败")
            return 0
        
        # 确保 topic 存在
        if not kafka_client.ensure_topic_exists(topic):
            logger.warning(f"⚠️  Topic '{topic}' 不存在且创建失败，但会尝试发送（依赖自动创建）")
        
        success_count = kafka_client.send_batch(
            topic=topic,
            data_list=data_list,
            key_prefix=key_prefix,
            headers=headers or {}
        )
        
        kafka_client.close()
        return success_count
        
    except Exception as e:
        logger.error(f"❌ 批量发送 Kafka 消息失败: {e}", exc_info=True)
        return 0

