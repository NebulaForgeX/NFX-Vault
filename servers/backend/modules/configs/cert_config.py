"""
证书管理配置模块

负责加载和管理证书管理相关配置
从环境变量读取（Docker Compose 会自动从 .env 加载）
所有必需配置必须存在，否则在配置阶段报错退出
"""
import os
import sys
from .types import CertConfig


def load_cert_config() -> CertConfig:
    """
    加载证书管理相关配置（从环境变量），返回配置对象
    所有必需配置必须存在，否则报错退出
    
    Returns:
        CertConfig: 可通过 config.KEY 访问的配置对象，IDE 有完整类型提示
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
    
    def get_bool_env(key: str) -> bool:
        """获取布尔环境变量，必须存在"""
        value = require_env(key)
        return value.lower() in ("true", "1")
    
    def get_int_env(key: str) -> int:
        """获取整数环境变量，必须存在"""
        value = require_env(key)
        try:
            return int(value)
        except ValueError:
            print(f"❌ {key} 必须是整数，当前值: {value}")
            sys.exit(1)
    
    # 读取所有必需配置（必须存在，不能有默认值）
    certs_dir = require_env("CERTS_DIR")
    acme_challenge_dir = require_env("ACME_CHALLENGE_DIR")
    cert_max_wait_time = get_int_env("CERT_MAX_WAIT_TIME")
    read_on_startup = get_bool_env("READ_ON_STARTUP")
    schedule_enabled = get_bool_env("SCHEDULE_ENABLED")
    schedule_weekly_day = require_env("SCHEDULE_WEEKLY_DAY")
    schedule_weekly_hour = get_int_env("SCHEDULE_WEEKLY_HOUR")
    schedule_weekly_minute = get_int_env("SCHEDULE_WEEKLY_MINUTE")
    
    # 验证 SCHEDULE_WEEKLY_DAY 的有效值
    valid_days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    if schedule_weekly_day.lower() not in valid_days:
        print(f"❌ SCHEDULE_WEEKLY_DAY 必须是以下值之一: {', '.join(valid_days)}，当前值: {schedule_weekly_day}")
        sys.exit(1)
    
    # 验证 SCHEDULE_WEEKLY_HOUR 的范围
    if schedule_weekly_hour < 0 or schedule_weekly_hour > 23:
        print(f"❌ SCHEDULE_WEEKLY_HOUR 必须在 0-23 之间，当前值: {schedule_weekly_hour}")
        sys.exit(1)
    
    # 验证 SCHEDULE_WEEKLY_MINUTE 的范围
    if schedule_weekly_minute < 0 or schedule_weekly_minute > 59:
        print(f"❌ SCHEDULE_WEEKLY_MINUTE 必须在 0-59 之间，当前值: {schedule_weekly_minute}")
        sys.exit(1)
    
    # 构建配置对象
    config = CertConfig(
        BASE_DIR=certs_dir,
        ACME_CHALLENGE_DIR=acme_challenge_dir,
        CERT_MAX_WAIT_TIME=cert_max_wait_time,
        READ_ON_STARTUP=read_on_startup,
        SCHEDULE_ENABLED=schedule_enabled,
        SCHEDULE_WEEKLY_DAY=schedule_weekly_day.lower(),
        SCHEDULE_WEEKLY_HOUR=schedule_weekly_hour,
        SCHEDULE_WEEKLY_MINUTE=schedule_weekly_minute,
    )
    
    print("✅ 证书管理配置加载完成")
    return config
