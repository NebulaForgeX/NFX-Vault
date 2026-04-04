# coding=utf-8
"""
依赖组装：MySQL / Redis / Kafka(Producer+Consumer) / Repos / Services / Kafka 路由。
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from config.types import AuthConfig, CertConfig, DatabaseConfig, VaultDataConfig
from apps.certificate.models.base import Base
from apps.certificate.kafka.certificate_pipeline import CertificatePipeline
from utils import ACMEChallengeStorage, KafkaClient, KafkaEventConsumer, MySQLSession, RedisClient

from apps.analysis.services.analysis_service import AnalysisService
from apps.certificate.kafka.certificate_kafka_handler import CertificateKafkaHandler
from apps.certificate.kafka.event_router import KafkaEventRouter, setup_kafka_routes
from apps.certificate.repos.certificate_cache_repo import CertificateCacheRepo
from apps.certificate.repos.certificate_repository import CertificateRepository
from apps.certificate.repos.tls_issue_repository import TlsIssueRepository
from apps.certificate.services.certificate_service import CertificateService
from apps.file.services.file_service import FileService
from apps.user.models.vault_image import VaultImage  # noqa: F401 — 注册 metadata
from apps.user.models.vault_user import VaultUser  # noqa: F401 — 注册 metadata
from apps.user.repos.image_repository import ImageRepository
from apps.user.repos.user_repository import UserRepository
from apps.user.services.avatar_storage import AvatarStorageService
from apps.user.services.auth_service import AuthService
from apps.user.services.jwt_tokens import JwtTokenService
from apps.user.services.mail_sender import SmtpMailSender
from apps.user.services.verification_code import VerificationCodeService

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
    image_repository: ImageRepository
    auth_service: AuthService


def build_application_stack(
    cert_config: CertConfig,
    db_config: DatabaseConfig,
    auth_config: AuthConfig,
    vault_data_config: VaultDataConfig,
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

    user_repo = UserRepository(mysql)
    image_repo = ImageRepository(mysql)
    verification = VerificationCodeService(redis_client, auth_config.EMAIL_VERIFICATION_CODE_TTL_SECONDS)
    mailer = SmtpMailSender(
        auth_config.EMAIL_SMTP_HOST,
        auth_config.EMAIL_SMTP_PORT,
        auth_config.EMAIL_SMTP_USER,
        auth_config.EMAIL_SMTP_PASSWORD,
    )
    jwt_tokens = JwtTokenService(
        auth_config.JWT_SECRET,
        auth_config.JWT_ACCESS_EXPIRE_MINUTES,
        auth_config.JWT_REFRESH_EXPIRE_DAYS,
    )
    avatar_storage = AvatarStorageService(vault_data_config.DATA_DIR)
    avatar_storage.ensure_dirs()
    auth_service = AuthService(
        auth_config,
        user_repo,
        verification,
        mailer,
        jwt_tokens,
        avatar_storage,
        image_repo,
    )

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
        image_repository=image_repo,
        auth_service=auth_service,
    )


def build_certificate_stack(
    cert_config: CertConfig,
    db_config: DatabaseConfig,
    auth_config: AuthConfig,
    vault_data_config: VaultDataConfig,
) -> tuple[MySQLSession, RedisClient, KafkaClient, CertificateService]:
    """兼容旧调用：仅返回证书栈四元组。"""
    s = build_application_stack(cert_config, db_config, auth_config, vault_data_config)
    return s.mysql, s.redis, s.kafka, s.certificate_service
