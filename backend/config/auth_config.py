# coding=utf-8
"""JWT 与 SMTP（验证码邮件）配置。"""
from __future__ import annotations

import logging
import os
import sys

from .types import AuthConfig

logger = logging.getLogger(__name__)


def load_auth_config() -> AuthConfig:
    def get_env(key: str) -> str:
        return os.environ.get(key, "").strip()

    def require_env(key: str) -> str:
        value = get_env(key)
        if not value:
            print(f"缺少必需配置: {key}", file=sys.stderr)
            sys.exit(1)
        return value

    def get_int_env(key: str, default: int | None = None) -> int:
        raw = get_env(key)
        if not raw and default is not None:
            return default
        if not raw:
            print(f"缺少必需配置: {key}", file=sys.stderr)
            sys.exit(1)
        try:
            return int(raw)
        except ValueError:
            print(f"{key} 必须是整数", file=sys.stderr)
            sys.exit(1)

    jwt_secret = get_env("JWT_SECRET")
    if not jwt_secret:
        jwt_secret = "nfx-vault-dev-only-change-me"
        logger.warning("JWT_SECRET 未设置，使用不安全默认值，生产环境务必配置")

    return AuthConfig(
        JWT_SECRET=jwt_secret,
        JWT_ACCESS_EXPIRE_MINUTES=get_int_env("JWT_ACCESS_EXPIRE_MINUTES", 30),
        JWT_REFRESH_EXPIRE_DAYS=get_int_env("JWT_REFRESH_EXPIRE_DAYS", 7),
        EMAIL_SMTP_HOST=require_env("EMAIL_SMTP_HOST"),
        EMAIL_SMTP_PORT=get_int_env("EMAIL_SMTP_PORT"),
        EMAIL_SMTP_USER=require_env("EMAIL_SMTP_USER"),
        EMAIL_SMTP_PASSWORD=require_env("EMAIL_SMTP_PASSWORD"),
        EMAIL_VERIFICATION_CODE_TTL_SECONDS=get_int_env("EMAIL_VERIFICATION_CODE_TTL_SECONDS", 600),
    )
