"""数据库 / Redis / Kafka 配置（环境变量）。"""
import os
import sys

from .types import DatabaseConfig


def load_database_config() -> DatabaseConfig:
    def get_env(key: str) -> str:
        return os.environ.get(key, "").strip()

    def require_env(key: str) -> str:
        value = get_env(key)
        if not value:
            print(f"缺少必需配置: {key}", file=sys.stderr)
            sys.exit(1)
        return value

    def get_int_env(key: str) -> int:
        value = require_env(key)
        try:
            return int(value)
        except ValueError:
            print(f"{key} 必须是整数", file=sys.stderr)
            sys.exit(1)

    return DatabaseConfig(
        MYSQL_HOST=require_env("MYSQL_HOST"),
        MYSQL_PORT=get_int_env("MYSQL_DATABASE_PORT"),
        MYSQL_DATABASE=require_env("MYSQL_DATABASE"),
        MYSQL_USER=require_env("MYSQL_ROOT_USERNAME"),
        MYSQL_PASSWORD=require_env("MYSQL_ROOT_PASSWORD"),
        REDIS_HOST=require_env("REDIS_HOST"),
        REDIS_PORT=get_int_env("REDIS_DATABASE_PORT"),
        REDIS_DB=get_int_env("REDIS_DB"),
        REDIS_PASSWORD=get_env("REDIS_PASSWORD"),
        REDIS_CACHE_TTL=get_int_env("REDIS_CACHE_TTL"),
        KAFKA_BOOTSTRAP_SERVERS=require_env("KAFKA_BOOTSTRAP_SERVERS"),
        KAFKA_EVENT_TOPIC=require_env("KAFKA_EVENT_TOPIC"),
        KAFKA_EVENT_POISON_TOPIC=require_env("KAFKA_EVENT_POISON_TOPIC"),
        KAFKA_CONSUMER_GROUP_ID=require_env("KAFKA_CONSUMER_GROUP_ID"),
    )
