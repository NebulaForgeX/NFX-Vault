"""
证书管理配置模块

负责加载和管理证书管理相关配置
从环境变量读取（Docker Compose 会自动从 .env 加载）
"""
import os
import sys
from .types import CertConfig


def load_cert_config() -> CertConfig:
    """
    加载证书管理相关配置（从环境变量），返回配置对象
    所有必需配置缺失则退出程序
    
    Returns:
        CertConfig: 可通过 config.KEY 访问的配置对象，IDE 有完整类型提示
    """
    
    def get_env(key: str) -> str:
        """获取环境变量，缺失则返回空字符串"""
        return os.environ.get(key, "").strip()
    
    def get_bool_env(key: str, default: bool = False) -> bool:
        value = get_env(key)
        return value.lower() in ("true", "1") if value else default
    
    def get_int_env(key: str, default: int = None) -> int:
        value = get_env(key)
        return int(value) if value else default
    
    # 读取必需配置
    certs_dir = get_env("CERTS_DIR")
    acme_challenge_dir = get_env("ACME_CHALLENGE_DIR")
    cert_max_wait_time_str = get_env("CERT_MAX_WAIT_TIME")
    
    # 验证必需配置
    errors = []
    if not certs_dir:
        errors.append("❌ 缺少必需配置: CERTS_DIR")
    if not acme_challenge_dir:
        errors.append("❌ 缺少必需配置: ACME_CHALLENGE_DIR")
    if not cert_max_wait_time_str:
        errors.append("❌ 缺少必需配置: CERT_MAX_WAIT_TIME")
    else:
        try:
            cert_max_wait_time = int(cert_max_wait_time_str)
        except ValueError:
            errors.append(f"❌ CERT_MAX_WAIT_TIME 必须是整数，当前值: {cert_max_wait_time_str}")
    
    # 如果有错误，输出并停止程序
    if errors:
        print("\n" + "=" * 60)
        print("证书管理配置验证失败！")
        print("=" * 60)
        for error in errors:
            print(error)
        print("=" * 60)
        print("请检查环境变量或 .env 文件，确保所有必需的配置都已设置。")
        print("=" * 60 + "\n")
        sys.exit(1)
    
    cert_max_wait_time = int(cert_max_wait_time_str)
    
    # 构建配置对象
    config = CertConfig(
        BASE_DIR=certs_dir,
        ACME_CHALLENGE_DIR=acme_challenge_dir,
        CERT_MAX_WAIT_TIME=cert_max_wait_time,
        READ_ON_STARTUP=get_bool_env("READ_ON_STARTUP", True),
        SCHEDULE_ENABLED=get_bool_env("SCHEDULE_ENABLED", True),
        SCHEDULE_WEEKLY_DAY=get_env("SCHEDULE_WEEKLY_DAY") or "mon",
        SCHEDULE_WEEKLY_HOUR=get_int_env("SCHEDULE_WEEKLY_HOUR") or 2,
        SCHEDULE_WEEKLY_MINUTE=get_int_env("SCHEDULE_WEEKLY_MINUTE") or 0,
    )
    
    print("✅ 证书管理配置加载完成")
    return config

