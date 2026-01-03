"""
配置类型定义

使用 dataclass 定义配置类，提供完整的类型提示和 IDE 自动补全
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class CertConfig:
    """证书管理配置类"""
    BASE_DIR: str  # 证书存储根目录（从 CERTS_DIR 环境变量读取）
    ACME_CHALLENGE_DIR: str  # ACME 挑战文件存储目录（必需）
    CERT_MAX_WAIT_TIME: int  # 证书申请最大等待时间（秒）（必需）
    READ_ON_STARTUP: bool  # 启动时是否读取文件夹
    SCHEDULE_ENABLED: bool  # 是否启用定时任务
    SCHEDULE_WEEKLY_DAY: str  # mon, tue, wed, thu, fri, sat, sun
    SCHEDULE_WEEKLY_HOUR: int  # 0-23
    SCHEDULE_WEEKLY_MINUTE: int  # 0-59


@dataclass
class DatabaseConfig:
    """数据库配置类"""
    # MySQL 配置
    MYSQL_HOST: str
    MYSQL_PORT: int
    MYSQL_DATABASE: str
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    
    # Redis 配置
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int
    REDIS_PASSWORD: str  # 可以为空
    REDIS_CACHE_TTL: int
    
    # Kafka 配置
    KAFKA_BOOTSTRAP_SERVERS: str
    KAFKA_EVENT_TOPIC: str
    KAFKA_EVENT_POISON_TOPIC: str
    KAFKA_CONSUMER_GROUP_ID: str
