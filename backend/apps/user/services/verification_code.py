# coding=utf-8
"""Redis 邮箱验证码（与 PQTTEC VerificationCodeService 行为一致）。"""
from __future__ import annotations

import logging
import random

from utils.redis.client import RedisClient

logger = logging.getLogger(__name__)

PREFIX = "nfxvault:email:verification:"
CODE_LENGTH = 6

# 原子比对并删除，避免并发双请求都通过 GET 校验后重复消费/双注册
_COMPARE_AND_DELETE_LUA = """
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
"""


class VerificationCodeService:
    def __init__(self, redis_client: RedisClient, ttl_seconds: int) -> None:
        self._redis = redis_client
        self._ttl = ttl_seconds

    def generate_code(self) -> str:
        return "".join(str(random.randint(0, 9)) for _ in range(CODE_LENGTH))

    def save_code(self, email: str, code: str) -> bool:
        if not self._redis.enable_redis or not self._redis.client:
            logger.error("Redis 未启用，无法保存验证码")
            return False
        key = PREFIX + email.lower()
        try:
            self._redis.client.setex(key, self._ttl, code)
            return True
        except Exception:  # noqa: BLE001
            logger.exception("保存验证码失败")
            return False

    def verify_and_consume(self, email: str, code: str) -> bool:
        if not self._redis.enable_redis or not self._redis.client:
            return False
        key = PREFIX + email.lower()
        normalized = (code or "").strip()
        try:
            n = self._redis.client.eval(_COMPARE_AND_DELETE_LUA, 1, key, normalized)
            return int(n) >= 1
        except Exception:  # noqa: BLE001
            logger.exception("校验验证码失败")
            return False
