"""配置类型（从原 backend modules/configs/types 迁入）。"""
from dataclasses import dataclass


@dataclass
class CertConfig:
    BASE_DIR: str
    ACME_CHALLENGE_DIR: str
    CERT_MAX_WAIT_TIME: int
    READ_ON_STARTUP: bool
    SCHEDULE_ENABLED: bool
    SCHEDULE_WEEKLY_DAY: str
    SCHEDULE_WEEKLY_HOUR: int
    SCHEDULE_WEEKLY_MINUTE: int


@dataclass
class DatabaseConfig:
    MYSQL_HOST: str
    MYSQL_PORT: int
    MYSQL_DATABASE: str
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int
    REDIS_PASSWORD: str
    REDIS_CACHE_TTL: int
    KAFKA_BOOTSTRAP_SERVERS: str
    KAFKA_EVENT_TOPIC: str
    KAFKA_EVENT_POISON_TOPIC: str
    KAFKA_CONSUMER_GROUP_ID: str
