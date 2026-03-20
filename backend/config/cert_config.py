"""证书相关配置（环境变量）。"""
import os
import sys

from .acme_webroot import resolve_acme_challenge_dir
from .types import CertConfig


def load_cert_config() -> CertConfig:
    def get_env(key: str) -> str:
        return os.environ.get(key, "").strip()

    def require_env(key: str) -> str:
        value = get_env(key)
        if not value:
            print(f"缺少必需配置: {key}", file=sys.stderr)
            sys.exit(1)
        return value

    def get_bool_env(key: str) -> bool:
        return require_env(key).lower() in ("true", "1")

    def get_int_env(key: str) -> int:
        value = require_env(key)
        try:
            return int(value)
        except ValueError:
            print(f"{key} 必须是整数", file=sys.stderr)
            sys.exit(1)

    schedule_weekly_day = require_env("SCHEDULE_WEEKLY_DAY")
    valid_days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    if schedule_weekly_day.lower() not in valid_days:
        print("SCHEDULE_WEEKLY_DAY 无效", file=sys.stderr)
        sys.exit(1)

    h = get_int_env("SCHEDULE_WEEKLY_HOUR")
    m = get_int_env("SCHEDULE_WEEKLY_MINUTE")
    if h < 0 or h > 23 or m < 0 or m > 59:
        print("定时时间范围无效", file=sys.stderr)
        sys.exit(1)

    base_dir = require_env("CERTS_DIR")
    acme_dir = resolve_acme_challenge_dir(require_env("ACME_CHALLENGE_DIR"), base_dir)
    return CertConfig(
        BASE_DIR=base_dir,
        ACME_CHALLENGE_DIR=acme_dir,
        CERT_MAX_WAIT_TIME=get_int_env("CERT_MAX_WAIT_TIME"),
        READ_ON_STARTUP=get_bool_env("READ_ON_STARTUP"),
        SCHEDULE_ENABLED=get_bool_env("SCHEDULE_ENABLED"),
        SCHEDULE_WEEKLY_DAY=schedule_weekly_day.lower(),
        SCHEDULE_WEEKLY_HOUR=h,
        SCHEDULE_WEEKLY_MINUTE=m,
    )
