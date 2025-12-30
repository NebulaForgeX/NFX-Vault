# coding=utf-8

"""
资源连接模块

负责初始化外部资源连接（MySQL, Redis, Kafka）
"""
import logging
from typing import Optional, NamedTuple

from modules.configs.database_config import DatabaseConfig
from resources.mysql.session import MySQLSession
from resources.redis.client import RedisClient
from resources.kafka import (
    KafkaEventConsumer,
    KafkaConsumerThread,
)
from resources.kafka.client import KafkaClient

logger = logging.getLogger(__name__)


class ResourceConnections(NamedTuple):
    """资源连接集合（数据库、Redis、Kafka）"""
    db_session: Optional[MySQLSession]
    redis_client: Optional[RedisClient]
    kafka_client: Optional[KafkaClient]
    kafka_consumer: Optional[KafkaEventConsumer]
    kafka_consumer_thread: Optional[KafkaConsumerThread]


def init_resource_connections(db_config: DatabaseConfig) -> ResourceConnections:
    """
    初始化资源连接（数据库、Redis、Kafka）
    
    Args:
        db_config: 数据库配置对象
    
    Returns:
        ResourceConnections: 包含所有资源连接的命名元组
    """
    db_session: Optional[MySQLSession] = None
    redis_client: Optional[RedisClient] = None
    kafka_client: Optional[KafkaClient] = None
    kafka_consumer: Optional[KafkaEventConsumer] = None
    kafka_consumer_thread: Optional[KafkaConsumerThread] = None
    
    # 初始化 MySQL
    if db_config.MYSQL_ENABLED:
        try:
            db_session = MySQLSession(
                host=db_config.MYSQL_HOST,
                port=db_config.MYSQL_PORT,
                database="nfxvault",
                user=db_config.MYSQL_USER,
                password=db_config.MYSQL_PASSWORD,
                enable_mysql=True
            )
            # 创建数据库和表
            db_session.create_database()
            from models.base import Base
            db_session.create_tables(Base)
            logger.info("✅ MySQL 数据库会话已初始化，表已创建")
        except Exception as e:
            logger.error(f"❌ MySQL 数据库会话初始化失败: {e}")
    
    # 初始化 Redis
    if db_config.REDIS_ENABLED:
        try:
            redis_client = RedisClient(
                host=db_config.REDIS_HOST,
                port=db_config.REDIS_PORT,
                db=db_config.REDIS_DB,
                password=db_config.REDIS_PASSWORD or None,
                enable_redis=True
            )
            logger.info("✅ Redis 连接已初始化")
        except Exception as e:
            logger.error(f"❌ Redis 初始化失败: {e}")
    
    # 初始化 Kafka Client 和 Consumer
    if db_config.KAFKA_ENABLED:
        try:
            bootstrap_servers = db_config.KAFKA_BOOTSTRAP_SERVERS or "localhost:9092"
            event_topic = db_config.KAFKA_EVENT_TOPIC or "nfxvault.events"
            group_id = db_config.KAFKA_CONSUMER_GROUP_ID or "nfxvault-server"
            
            # 创建 Kafka Client（单例，复用）
            kafka_client = KafkaClient(
                bootstrap_servers=bootstrap_servers,
                enable_kafka=True
            )
            
            # 确保 Kafka topic 存在
            if kafka_client.ensure_topic_exists(event_topic):
                logger.info(f"✅ Kafka topic 已存在或创建成功: {event_topic}")
            else:
                logger.warning(f"⚠️  Kafka topic 创建失败: {event_topic}")
            
            # 创建 Kafka Consumer
            kafka_consumer = KafkaEventConsumer(
                bootstrap_servers=bootstrap_servers,
                topic=event_topic,
                group_id=group_id
            )
            
            # 注意：Kafka Consumer 线程在 main.py 中启动，这里只初始化
            logger.info("✅ Kafka Client 和 Consumer 已初始化（Client 将复用，Consumer 等待在 main.py 中启动线程）")
        except Exception as e:
            logger.error(f"❌ Kafka 初始化失败: {e}")
    
    return ResourceConnections(
        db_session=db_session,
        redis_client=redis_client,
        kafka_client=kafka_client,
        kafka_consumer=kafka_consumer,
        kafka_consumer_thread=kafka_consumer_thread
    )

