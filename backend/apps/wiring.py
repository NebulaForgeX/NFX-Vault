# coding=utf-8
"""
依赖组装：MySQL / Redis / Kafka(Producer+Consumer) / Repos / Services / Kafka 路由。
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from config.types import CertConfig, DatabaseConfig
from apps.certificate.models.base import Base
from utils.acme.challenge_storage import ACMEChallengeStorage
from utils.kafka import KafkaClient
from utils.kafka.consumer import KafkaEventConsumer
from apps.certificate.kafka.certificate_pipeline import CertificatePipeline
from utils.mysql.session import MySQLSession
from utils.redis.client import RedisClient

from apps.analysis.services.analysis_service import AnalysisService
from apps.certificate.kafka.certificate_kafka_handler import CertificateKafkaHandler
from apps.certificate.kafka.event_router import KafkaEventRouter, setup_kafka_routes
from apps.certificate.repos.certificate_cache_repo import CertificateCacheRepo
from apps.certificate.repos.certificate_repository import CertificateRepository
from apps.certificate.repos.tls_issue_repository import TlsIssueRepository
from apps.certificate.services.certificate_service import CertificateService
from apps.file.services.file_service import FileService

logger = logging.getLogger(__name__)


@dataclass
class ApplicationStack:
    mysql: MySQLSession
    redis: RedisClient
    kafka: KafkaClient
    kafka_consumer: Optional[KafkaEventConsumer]
    certificate_service: CertificateService
    file_service: FileService
    analysis_service: AnalysisService
    acme_storage: ACMEChallengeStorage
    event_router: Optional[KafkaEventRouter]


def build_application_stack(
    cert_config: CertConfig,
    db_config: DatabaseConfig,
) -> ApplicationStack:
    mysql = MySQLSession(
        host=db_config.MYSQL_HOST,
        port=db_config.MYSQL_PORT,
        database=db_config.MYSQL_DATABASE,
        user=db_config.MYSQL_USER,
        password=db_config.MYSQL_PASSWORD,
        enable_mysql=True,
    )
    try:
        mysql.create_database()
        mysql.create_tables(Base)
    except Exception:  # noqa: BLE001
        logger.exception("create_tables")

    redis_client = RedisClient(
        host=db_config.REDIS_HOST,
        port=db_config.REDIS_PORT,
        db=db_config.REDIS_DB,
        password=db_config.REDIS_PASSWORD or None,
        enable_redis=True,
    )

    kafka_client = KafkaClient(
        bootstrap_servers=db_config.KAFKA_BOOTSTRAP_SERVERS,
        enable_kafka=True,
    )
    if kafka_client.enable_kafka:
        kafka_client.ensure_topic_exists(db_config.KAFKA_EVENT_TOPIC)

    db_repo = CertificateRepository(mysql)
    cache_repo = CertificateCacheRepo(redis_client)
    pipeline = CertificatePipeline(db_config=db_config, kafka_client=kafka_client)
    tls_repo = TlsIssueRepository(cert_config)

    certificate_service = CertificateService(
        database_repo=db_repo,
        cache_repo=cache_repo,
        pipeline_repo=pipeline,
        tls_repo=tls_repo,
        db_config=db_config,
        cert_config=cert_config,
    )

    file_service = FileService(
        base_dir=cert_config.BASE_DIR,
        database_repo=db_repo,
        pipeline_repo=pipeline,
        db_config=db_config,
    )

    analysis_service = AnalysisService()
    acme_storage = ACMEChallengeStorage(challenge_dir=cert_config.ACME_CHALLENGE_DIR)

    kafka_consumer: Optional[KafkaEventConsumer] = None
    event_router = None
    if kafka_client.enable_kafka:
        kafka_consumer = KafkaEventConsumer(
            bootstrap_servers=db_config.KAFKA_BOOTSTRAP_SERVERS,
            topic=db_config.KAFKA_EVENT_TOPIC,
            group_id=db_config.KAFKA_CONSUMER_GROUP_ID,
        )
        kafka_handler = CertificateKafkaHandler(certificate_service, file_service)
        event_router = setup_kafka_routes(kafka_handler)
        for et, fn in event_router.routes.items():
            kafka_consumer.register_handler(et, fn)

    return ApplicationStack(
        mysql=mysql,
        redis=redis_client,
        kafka=kafka_client,
        kafka_consumer=kafka_consumer,
        certificate_service=certificate_service,
        file_service=file_service,
        analysis_service=analysis_service,
        acme_storage=acme_storage,
        event_router=event_router,
    )


def build_certificate_stack(
    cert_config: CertConfig,
    db_config: DatabaseConfig,
) -> tuple[MySQLSession, RedisClient, KafkaClient, CertificateService]:
    """兼容旧调用：仅返回证书栈四元组。"""
    s = build_application_stack(cert_config, db_config)
    return s.mysql, s.redis, s.kafka, s.certificate_service
