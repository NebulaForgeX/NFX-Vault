"""
数据库配置模块

负责加载和管理数据库/Redis/Kafka相关配置
从环境变量读取（Docker Compose 会自动从 .env 加载）
所有必需配置必须存在，否则在配置阶段报错退出
"""
import os
import sys
from .types import DatabaseConfig


def load_database_config() -> DatabaseConfig:
    """
    加载数据库/Redis/Kafka相关配置（从环境变量），返回配置对象
    所有必需配置必须存在，否则报错退出
    
    Returns:
        DatabaseConfig: 可通过 config.KEY 访问的配置对象，IDE 有完整类型提示
    """
    
    def get_env(key: str) -> str:
        """获取环境变量，缺失则返回空字符串"""
        return os.environ.get(key, "").strip()
    
    def require_env(key: str) -> str:
        """获取必需环境变量，缺失则报错退出"""
        value = get_env(key)
        if not value:
            print(f"❌ 缺少必需配置: {key}")
            sys.exit(1)
        return value
    
    def get_int_env(key: str) -> int:
        """获取整数环境变量，必须存在"""
        value = require_env(key)
        try:
            return int(value)
        except ValueError:
            print(f"❌ {key} 必须是整数，当前值: {value}")
            sys.exit(1)
    
    # MySQL 配置（所有配置必须存在）
    mysql_host = require_env("MYSQL_HOST")
    mysql_port = get_int_env("MYSQL_DATABASE_PORT")
    mysql_database = require_env("MYSQL_DATABASE")
    mysql_user = require_env("MYSQL_ROOT_USERNAME")
    mysql_password = require_env("MYSQL_ROOT_PASSWORD")
    
    # Redis 配置（所有配置必须存在）
    redis_host = require_env("REDIS_HOST")
    redis_port = get_int_env("REDIS_DATABASE_PORT")
    redis_db = get_int_env("REDIS_DB")
    redis_password = get_env("REDIS_PASSWORD")  # Redis 密码可以为空
    redis_cache_ttl = get_int_env("REDIS_CACHE_TTL")
    
    # Kafka 配置（所有配置必须存在）
    kafka_bootstrap_servers = require_env("KAFKA_BOOTSTRAP_SERVERS")
    kafka_event_topic = require_env("KAFKA_EVENT_TOPIC")
    kafka_event_poison_topic = require_env("KAFKA_EVENT_POISON_TOPIC")
    kafka_consumer_group_id = require_env("KAFKA_CONSUMER_GROUP_ID")
    
    # 创建配置对象
    config = DatabaseConfig(
        # MySQL 配置
        MYSQL_HOST=mysql_host,
        MYSQL_PORT=mysql_port,
        MYSQL_DATABASE=mysql_database,
        MYSQL_USER=mysql_user,
        MYSQL_PASSWORD=mysql_password,
        
        # Redis 配置
        REDIS_HOST=redis_host,
        REDIS_PORT=redis_port,
        REDIS_DB=redis_db,
        REDIS_PASSWORD=redis_password,
        REDIS_CACHE_TTL=redis_cache_ttl,
        
        # Kafka 配置
        KAFKA_BOOTSTRAP_SERVERS=kafka_bootstrap_servers,
        KAFKA_EVENT_TOPIC=kafka_event_topic,
        KAFKA_EVENT_POISON_TOPIC=kafka_event_poison_topic,
        KAFKA_CONSUMER_GROUP_ID=kafka_consumer_group_id,
    )
    
    print("✅ 数据库配置加载完成")
    return config
