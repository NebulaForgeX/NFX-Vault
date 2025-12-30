# coding=utf-8

"""
连接管理模块

负责初始化和清理所有外部资源连接（MySQL, Redis, Kafka）
"""
import logging
from typing import Optional, NamedTuple

from .database_config import DatabaseConfig
from .types import CertConfig
from resources.mysql.session import MySQLSession
from resources.redis.client import RedisClient
from resources.kafka import (
    KafkaEventConsumer,
    KafkaConsumerThread,
)
from resources.kafka.client import KafkaClient
from modules.interfaces.http.handler.certificate import CertificateHTTPHandler
from modules.interfaces.kafka.handler.certificate import CertificateKafkaHandler
from modules.applications.certificate import CertificateApplication
from modules.repositories import (
    CertificateCache,
    CertificateDatabase,
    CertificatePipeline,
)
from modules.repositories.tls import TLSCertificateRepository
from modules.interfaces.kafka import setup_routes

logger = logging.getLogger(__name__)


class Connections(NamedTuple):
    """连接对象集合"""
    db_session: Optional[MySQLSession]
    redis_client: Optional[RedisClient]
    kafka_consumer: Optional[KafkaEventConsumer]
    kafka_consumer_thread: Optional[KafkaConsumerThread]
    certificate_http_handler: Optional[CertificateHTTPHandler]
    certificate_kafka_handler: Optional[CertificateKafkaHandler]
    event_router: Optional[object]


def init_connections(db_config: DatabaseConfig, cert_config: CertConfig) -> Connections:
    """
    初始化所有连接（MySQL, Redis, Kafka）和 MVC Interfaces
    
    Args:
        db_config: 数据库配置对象
    
    Returns:
        Connections: 包含所有初始化对象的命名元组
    """
    
    db_session: Optional[MySQLSession] = None
    redis_client: Optional[RedisClient] = None
    kafka_consumer: Optional[KafkaEventConsumer] = None
    kafka_consumer_thread: Optional[KafkaConsumerThread] = None
    certificate_http_handler: Optional[CertificateHTTPHandler] = None
    certificate_kafka_handler: Optional[CertificateKafkaHandler] = None
    event_router: Optional[object] = None
    
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
    
    # 初始化 MVC 架构（必须在 Kafka Consumer 之前初始化，因为注册处理器时需要用到）
    # 1. 初始化 Repositories
    certificate_cache_repo = CertificateCache(redis_client=redis_client)
    certificate_database_repo = CertificateDatabase(db_session=db_session)
    certificate_pipeline_repo = CertificatePipeline(db_config=db_config)
    
    # 初始化 TLS Repository（使用 Certbot 申请证书）
    # 所有配置从 cert_config 传入，不允许默认值
    certificate_tls_repo = TLSCertificateRepository(cert_config=cert_config)
    
    # 2. 初始化 Applications
    certificate_application = CertificateApplication(
        database_repo=certificate_database_repo,
        cache_repo=certificate_cache_repo,
        pipeline_repo=certificate_pipeline_repo,
        tls_repo=certificate_tls_repo,
        db_config=db_config,
        cert_config=cert_config
    )
    
    # 3. 初始化 Interfaces（HTTP 和 Kafka 分离）
    certificate_http_handler = CertificateHTTPHandler(
        certificate_application=certificate_application
    )
    certificate_kafka_handler = CertificateKafkaHandler(
        certificate_application=certificate_application
    )
    
    logger.info("✅ MVC Interfaces 初始化完成（HTTP 和 Kafka 分离）")
    
    # 4. 初始化 Kafka 事件路由分发器
    event_router = setup_routes(
        certificate_kafka_handler=certificate_kafka_handler
    )
    logger.info("✅ Kafka 事件路由分发器初始化完成")
    
    # 初始化 Kafka Consumer（在 Interfaces 和 Router 初始化之后）
    if db_config.KAFKA_ENABLED:
        try:
            bootstrap_servers = db_config.KAFKA_BOOTSTRAP_SERVERS or "localhost:9092"
            event_topic = db_config.KAFKA_EVENT_TOPIC or "nfxvault.events"
            group_id = db_config.KAFKA_CONSUMER_GROUP_ID or "nfxvault-server"
            
            # 确保 Kafka topic 存在
            kafka_client = KafkaClient(
                bootstrap_servers=bootstrap_servers,
                enable_kafka=True
            )
            if kafka_client.ensure_topic_exists(event_topic):
                logger.info(f"✅ Kafka topic 已存在或创建成功: {event_topic}")
            else:
                logger.warning(f"⚠️  Kafka topic 创建失败: {event_topic}")
            
            kafka_consumer = KafkaEventConsumer(
                bootstrap_servers=bootstrap_servers,
                topic=event_topic,
                group_id=group_id
            )
            
            # 使用路由分发器注册事件处理器（将 interface 的方法注册到 Kafka consumer）
            for event_type, handler in event_router.routes.items():
                kafka_consumer.register_handler(event_type, handler)
                logger.debug(f"✅ 注册 Kafka 事件处理器: {event_type}")
            
            # 注意：Kafka Consumer 线程在 main.py 中启动，这里只初始化
            logger.info("✅ Kafka Consumer 已初始化（等待在 main.py 中启动线程）")
        except Exception as e:
            logger.error(f"❌ Kafka Consumer 初始化失败: {e}")
    
    return Connections(
        db_session=db_session,
        redis_client=redis_client,
        kafka_consumer=kafka_consumer,
        kafka_consumer_thread=kafka_consumer_thread,
        certificate_http_handler=certificate_http_handler,
        certificate_kafka_handler=certificate_kafka_handler,
        event_router=event_router
    )


def cleanup_connections(connections: Connections):
    """清理所有连接
    
    Args:
        connections: 连接对象集合
    """
    logger.info("🧹 正在清理连接...")
    
    if connections.kafka_consumer:
        connections.kafka_consumer.stop()
    
    if connections.redis_client:
        connections.redis_client.close()
    
    if connections.db_session:
        connections.db_session.close()
    
    logger.info("✅ 所有连接已清理")
