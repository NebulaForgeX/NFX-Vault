# coding=utf-8

"""
依赖注入和连接管理模块（Wiring）

负责初始化和清理所有外部资源连接（MySQL, Redis, Kafka）
类似于 Go 的 wire 工具，用于依赖注入
"""
import logging
from typing import Optional, NamedTuple

from modules.configs.database_config import DatabaseConfig
from modules.configs.types import CertConfig
from .resources import init_resource_connections
from resources.mysql.session import MySQLSession
from resources.redis.client import RedisClient
from resources.kafka import KafkaEventConsumer
from resources.kafka.client import KafkaClient
from modules.interfaces.http.handler.tls.tls import CertificateHTTPHandler
from modules.interfaces.http.handler.file.file import FileHTTPHandler
from modules.interfaces.http.handler.analysis.analysis import AnalysisHTTPHandler
from modules.interfaces.kafka.handler.certificate import CertificateKafkaHandler
from modules.applications.tls import CertificateApplication
from modules.applications.file import FileApplication
from modules.applications.analysis import AnalysisApplication
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
    kafka_client: Optional[KafkaClient]
    kafka_consumer: Optional[KafkaEventConsumer]
    certificate_http_handler: Optional[CertificateHTTPHandler]
    file_http_handler: Optional[FileHTTPHandler]
    certificate_kafka_handler: Optional[CertificateKafkaHandler]
    event_router: Optional[object]


def init_connections(db_config: DatabaseConfig, cert_config: CertConfig) -> Connections:
    """
    初始化所有连接（MySQL, Redis, Kafka）和 MVC Interfaces
    
    类似于 Go 的 wire.NewDependencies，负责依赖注入
    
    Args:
        db_config: 数据库配置对象
        cert_config: 证书配置对象
    
    Returns:
        Connections: 包含所有初始化对象的命名元组
    """
    # 1. 初始化资源连接（数据库、Redis、Kafka）
    resources = init_resource_connections(db_config)
    
    # 2. 初始化 MVC 架构（必须在 Kafka Consumer 之前初始化，因为注册处理器时需要用到）
    # 2.1 初始化 Repositories
    certificate_cache_repo = CertificateCache(redis_client=resources.redis_client)
    certificate_database_repo = CertificateDatabase(db_session=resources.db_session)
    certificate_pipeline_repo = CertificatePipeline(
        db_config=db_config,
        kafka_client=resources.kafka_client
    )
    
    # 初始化 TLS Repository（使用 Certbot 申请证书）
    # 所有配置从 cert_config 传入，不允许默认值
    certificate_tls_repo = TLSCertificateRepository(cert_config=cert_config)
    
    # 2.2 初始化 Applications
    certificate_application = CertificateApplication(
        database_repo=certificate_database_repo,
        cache_repo=certificate_cache_repo,
        pipeline_repo=certificate_pipeline_repo,
        tls_repo=certificate_tls_repo,
        db_config=db_config,
        cert_config=cert_config
    )
    
    # 初始化 File Application
    file_application = FileApplication(
        base_dir=cert_config.BASE_DIR,
        database_repo=certificate_database_repo,
        db_config=db_config
    )
    
    # 初始化 Analysis Application
    analysis_application = AnalysisApplication()
    
    # 2.3 初始化 Interfaces（HTTP 和 Kafka 分离）
    certificate_http_handler = CertificateHTTPHandler(
        certificate_application=certificate_application
    )
    file_http_handler = FileHTTPHandler(
        file_application=file_application,
        pipeline_repo=certificate_pipeline_repo
    )
    analysis_http_handler = AnalysisHTTPHandler(
        analysis_application=analysis_application
    )
    certificate_kafka_handler = CertificateKafkaHandler(
        certificate_application=certificate_application,
        file_application=file_application
    )
    
    logger.info("✅ MVC Interfaces 初始化完成（HTTP 和 Kafka 分离）")
    
    # 2.4 初始化 Kafka 事件路由分发器
    event_router = setup_routes(
        certificate_kafka_handler=certificate_kafka_handler
    )
    logger.info("✅ Kafka 事件路由分发器初始化完成")
    
    # 2.5 注册 Kafka 事件处理器（如果 Kafka 已启用）
    if resources.kafka_consumer and event_router:
        try:
            # 使用路由分发器注册事件处理器（将 interface 的方法注册到 Kafka consumer）
            for event_type, handler in event_router.routes.items():
                resources.kafka_consumer.register_handler(event_type, handler)
                logger.info(f"✅ 注册 Kafka 事件处理器: {event_type}")
        except Exception as e:
            logger.error(f"❌ 注册 Kafka 事件处理器失败: {e}")
    
    return Connections(
        db_session=resources.db_session,
        redis_client=resources.redis_client,
        kafka_client=resources.kafka_client,
        kafka_consumer=resources.kafka_consumer,
        certificate_http_handler=certificate_http_handler,
        file_http_handler=file_http_handler,
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
    
    if connections.kafka_client:
        connections.kafka_client.close()
    
    if connections.redis_client:
        connections.redis_client.close()
    
    if connections.db_session:
        connections.db_session.close()
    
    logger.info("✅ 所有连接已清理")
