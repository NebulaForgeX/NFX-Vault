"""配置类型（从原 backend modules/configs/types 迁入）。"""
from dataclasses import dataclass


@dataclass
class CertConfig:
    BASE_DIR: str
    ACME_CHALLENGE_DIR: str
    CERT_MAX_WAIT_TIME: int
    READ_ON_STARTUP: bool
    SCHEDULE_ENABLED: bool


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


@dataclass
class VaultDataConfig:
    """本地用户头像：`data/tmp/<user_id>/` 上传暂存，`data/avatar/<user_id>/` 正式文件（对齐 Pqttec tmp→avatar，无环境分子目录）。"""

    DATA_DIR: str


@dataclass
class AuthConfig:
    """邮箱验证码注册 / JWT 登录（对齐 PQTTEC auth，省略邀请码与角色）。"""

    JWT_SECRET: str
    JWT_ACCESS_EXPIRE_MINUTES: int
    JWT_REFRESH_EXPIRE_DAYS: int
    EMAIL_SMTP_HOST: str
    EMAIL_SMTP_PORT: int
    EMAIL_SMTP_USER: str
    EMAIL_SMTP_PASSWORD: str
    EMAIL_VERIFICATION_CODE_TTL_SECONDS: int
