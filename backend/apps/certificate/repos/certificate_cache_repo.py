"""证书 Redis 缓存：列表分页、详情、全量清理。"""
from __future__ import annotations

import json
import logging
from typing import Any, Optional

from utils import RedisClient

logger = logging.getLogger(__name__)


class CertificateCacheRepo:
    def __init__(self, redis_client: Optional[RedisClient] = None) -> None:
        self._redis = redis_client
        self.default_ttl = 60

    def get_certificate_list(
        self, offset: int, limit: int
    ) -> Optional[dict[str, Any]]:
        return self._get_list(offset, limit)

    def set_certificate_list(
        self,
        offset: int,
        limit: int,
        data: dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        return self._set_list(offset, limit, data, ttl)

    def get_certificate_detail(self, domain: str) -> Optional[dict[str, Any]]:
        if not self._redis or not self._redis.enable_redis:
            return None
        try:
            key = f"certs:detail:{domain}"
            raw = self._redis.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception:  # noqa: BLE001
            logger.exception("读取详情缓存失败")
            return None

    def set_certificate_detail(
        self,
        domain: str,
        data: dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        if not self._redis or not self._redis.enable_redis:
            return False
        try:
            key = f"certs:detail:{domain}"
            sec = ttl if ttl is not None else self.default_ttl
            self._redis.setex(key, sec, json.dumps(data, default=str))
            return True
        except Exception:  # noqa: BLE001
            logger.exception("写入详情缓存失败")
            return False

    def clear_all_certificate_cache(self) -> bool:
        if not self._redis or not self._redis.enable_redis:
            return False
        try:
            keys = self._redis.keys("certs:*")
            if keys:
                self._redis.delete(*keys)
            return True
        except Exception:  # noqa: BLE001
            logger.exception("清除证书缓存失败")
            return False

    def _get_list(self, offset: int, limit: int) -> Optional[dict[str, Any]]:
        if not self._redis or not self._redis.enable_redis:
            return None
        try:
            key = f"certs:list:offset_{offset}:limit_{limit}"
            raw = self._redis.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception:  # noqa: BLE001
            logger.exception("读取列表缓存失败")
            return None

    def _set_list(
        self,
        offset: int,
        limit: int,
        data: dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        if not self._redis or not self._redis.enable_redis:
            return False
        try:
            key = f"certs:list:offset_{offset}:limit_{limit}"
            sec = ttl if ttl is not None else self.default_ttl
            self._redis.setex(key, sec, json.dumps(data, default=str))
            return True
        except Exception:  # noqa: BLE001
            logger.exception("写入列表缓存失败")
            return False
