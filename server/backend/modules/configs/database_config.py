"""
数据库配置模块

负责加载和管理数据库/Redis/Kafka相关配置
从环境变量读取（Docker Compose 会自动从 .env 加载）
"""
import os
import sys
from .types import DatabaseConfig


def load_database_config() -> DatabaseConfig:
    """
    加载数据库/Redis/Kafka相关配置（从环境变量），返回配置对象
    
    Returns:
        DatabaseConfig: 可通过 config.KEY 访问的配置对象，IDE 有完整类型提示
    """
    
    def get_env(key: str, default: str = "") -> str:
        return os.environ.get(key, default).strip()
    
    def get_bool_env(key: str, default: bool = False) -> bool:
        value = get_env(key, "")
        return value.lower() in ("true", "1") if value else default
    
    def get_int_env(key: str, default: int = None) -> int:
        value = get_env(key, "")
        return int(value) if value else default
    
    # 直接创建 DatabaseConfig 对象
    config = DatabaseConfig(
        # MySQL 配置
        MYSQL_ENABLED=get_bool_env("MYSQL_ENABLED", True),
        MYSQL_HOST=get_env("MYSQL_HOST", "localhost"),
        MYSQL_PORT=get_int_env("MYSQL_DATABASE_PORT"),
        MYSQL_DATABASE=get_env("MYSQL_DATABASE", "nfxvault"),
        MYSQL_USER=get_env("MYSQL_ROOT_USERNAME", "root"),
        MYSQL_PASSWORD=get_env("MYSQL_ROOT_PASSWORD", ""),
        
        # Redis 配置
        REDIS_ENABLED=get_bool_env("REDIS_ENABLED", True),
        REDIS_HOST=get_env("REDIS_HOST", "localhost"),
        REDIS_PORT=get_int_env("REDIS_DATABASE_PORT", 6379),
        REDIS_DB=get_int_env("REDIS_DB", 0),
        REDIS_PASSWORD=get_env("REDIS_PASSWORD", ""),
        REDIS_CACHE_TTL=get_int_env("REDIS_CACHE_TTL", 60),  # 默认 5 分钟（缩短缓存时间以提高数据实时性）
        
        # Kafka 配置
        KAFKA_ENABLED=get_bool_env("KAFKA_ENABLED", False),
        KAFKA_BOOTSTRAP_SERVERS=get_env("KAFKA_BOOTSTRAP_SERVERS", ""),
        KAFKA_EVENT_TOPIC=get_env("KAFKA_EVENT_TOPIC", "nfxvault.cert_server"),
        KAFKA_EVENT_POISON_TOPIC=get_env("KAFKA_EVENT_POISON_TOPIC", "nfxvault.cert_server.poison"),
        KAFKA_CONSUMER_GROUP_ID=get_env("KAFKA_CONSUMER_GROUP_ID", "nfxvault-cert-server"),
    )
    
    # 验证必需配置（如果启用服务，则必须提供所有配置）
    _validate_resource_configs(config)
    
    print("✅ 数据库配置加载完成")
    return config


def _validate_resource_configs(config: DatabaseConfig):
    """
    验证资源配置（MySQL、Redis、Kafka）
    如果启用服务但缺少必需配置，则抛出错误并停止程序
    
    Args:
        config: 数据库配置对象
    """
    errors = []
    
    # 验证 MySQL 配置
    if config.MYSQL_ENABLED:
        if not config.MYSQL_HOST:
            errors.append("❌ MySQL 已启用，但缺少 MYSQL_HOST 配置")
        if not config.MYSQL_PORT:
            errors.append("❌ MySQL 已启用，但缺少 MYSQL_DATABASE_PORT 配置")
        if not config.MYSQL_DATABASE:
            errors.append("❌ MySQL 已启用，但缺少 MYSQL_DATABASE 配置")
        if not config.MYSQL_USER:
            errors.append("❌ MySQL 已启用，但缺少 MYSQL_ROOT_USERNAME 配置")
        if not config.MYSQL_PASSWORD:
            errors.append("❌ MySQL 已启用，但缺少 MYSQL_ROOT_PASSWORD 配置")
    
    # 验证 Kafka 配置
    if config.KAFKA_ENABLED:
        if not config.KAFKA_BOOTSTRAP_SERVERS:
            errors.append("❌ Kafka 已启用，但缺少 KAFKA_BOOTSTRAP_SERVERS 配置")
        if not config.KAFKA_EVENT_TOPIC:
            errors.append("❌ Kafka 已启用，但缺少 KAFKA_EVENT_TOPIC 配置")
        if not config.KAFKA_EVENT_POISON_TOPIC:
            errors.append("❌ Kafka 已启用，但缺少 KAFKA_EVENT_POISON_TOPIC 配置")
        if not config.KAFKA_CONSUMER_GROUP_ID:
            errors.append("❌ Kafka 已启用，但缺少 KAFKA_CONSUMER_GROUP_ID 配置")
    
    # 验证 Redis 配置
    if config.REDIS_ENABLED:
        if not config.REDIS_HOST:
            errors.append("❌ Redis 已启用，但缺少 REDIS_HOST 配置")
        if config.REDIS_PORT is None:
            errors.append("❌ Redis 已启用，但缺少 REDIS_DATABASE_PORT 配置")
        if config.REDIS_DB is None:
            errors.append("❌ Redis 已启用，但缺少 REDIS_DB 配置")
        # Redis 密码可能为空
    
    # 如果有错误，输出并停止程序
    if errors:
        print("\n" + "=" * 60)
        print("配置验证失败！")
        print("=" * 60)
        for error in errors:
            print(error)
        print("=" * 60)
        print("请检查环境变量或 .env 文件，确保所有必需的配置都已设置。")
        print("=" * 60 + "\n")
        sys.exit(1)

