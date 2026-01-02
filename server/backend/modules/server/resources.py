# coding=utf-8

"""
资源连接模块

负责初始化外部资源连接（MySQL, Redis, Kafka）
所有服务都是必需的，必须成功初始化
"""
import logging
import sys
from typing import NamedTuple

from modules.configs.database_config import DatabaseConfig
from resources.mysql.session import MySQLSession
from resources.redis.client import RedisClient
from resources.kafka import KafkaEventConsumer
from resources.kafka.client import KafkaClient

logger = logging.getLogger(__name__)


class ResourceConnections(NamedTuple):
    """资源连接集合（数据库、Redis、Kafka）"""
    db_session: MySQLSession
    redis_client: RedisClient
    kafka_client: KafkaClient
    kafka_consumer: KafkaEventConsumer


def init_resource_connections(db_config: DatabaseConfig) -> ResourceConnections:
    """
    初始化资源连接（数据库、Redis、Kafka）
    所有服务都是必需的，如果初始化失败则退出程序
    
    Args:
        db_config: 数据库配置对象
    
    Returns:
        ResourceConnections: 包含所有资源连接的命名元组
    """
    
    # 初始化 MySQL
    try:
        db_session = MySQLSession(
            host=db_config.MYSQL_HOST,
            port=db_config.MYSQL_PORT,
            database=db_config.MYSQL_DATABASE,
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
        sys.exit(1)
    
    # 初始化 Redis
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
        sys.exit(1)
    
    # 初始化 Kafka Client 和 Consumer
    try:
        # 创建 Kafka Client（单例，复用）
        kafka_client = KafkaClient(
            bootstrap_servers=db_config.KAFKA_BOOTSTRAP_SERVERS,
            enable_kafka=True
        )
        
        # 确保 Kafka topic 存在
        if kafka_client.ensure_topic_exists(db_config.KAFKA_EVENT_TOPIC):
            logger.info(f"✅ Kafka topic 已存在或创建成功: {db_config.KAFKA_EVENT_TOPIC}")
        else:
            logger.warning(f"⚠️  Kafka topic 创建失败: {db_config.KAFKA_EVENT_TOPIC}")
        
        # 创建 Kafka Consumer
        kafka_consumer = KafkaEventConsumer(
            bootstrap_servers=db_config.KAFKA_BOOTSTRAP_SERVERS,
            topic=db_config.KAFKA_EVENT_TOPIC,
            group_id=db_config.KAFKA_CONSUMER_GROUP_ID
        )
        logger.info("✅ Kafka Client 和 Consumer 已初始化")
    except Exception as e:
        logger.error(f"❌ Kafka 初始化失败: {e}")
        sys.exit(1)
    
    return ResourceConnections(
        db_session=db_session,
        redis_client=redis_client,
        kafka_client=kafka_client,
        kafka_consumer=kafka_consumer
    )

