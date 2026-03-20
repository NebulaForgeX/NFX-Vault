"""证书 Redis 缓存：列表分页、详情、按 store 批量清理（手写，对齐原行为）。"""
from __future__ import annotations

import json
import logging
from typing import Any, Optional

from utils.redis.client import RedisClient

logger = logging.getLogger(__name__)


class CertificateCacheRepo:
    def __init__(self, redis_client: Optional[RedisClient] = None) -> None:
        self._redis = redis_client
        self.default_ttl = 60

    def get_certificate_list(
        self, store: str, offset: int, limit: int
    ) -> Optional[dict[str, Any]]:
        return self._get_list(store, offset, limit)

    def set_certificate_list(
        self,
        store: str,
        offset: int,
        limit: int,
        data: dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        return self._set_list(store, offset, limit, data, ttl)

    def get_certificate_detail(self, store: str, domain: str) -> Optional[dict[str, Any]]:
        if not self._redis or not self._redis.enable_redis:
            return None
        try:
            key = f"certs:detail:{store}:{domain}"
            raw = self._redis.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception:  # noqa: BLE001
            logger.exception("读取详情缓存失败")
            return None

    def set_certificate_detail(
        self,
        store: str,
        domain: str,
        data: dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        if not self._redis or not self._redis.enable_redis:
            return False
        try:
            key = f"certs:detail:{store}:{domain}"
            sec = ttl if ttl is not None else self.default_ttl
            self._redis.setex(key, sec, json.dumps(data, default=str))
            return True
        except Exception:  # noqa: BLE001
            logger.exception("写入详情缓存失败")
            return False

    def clear_store_cache(self, store: str) -> bool:
        if not self._redis or not self._redis.enable_redis:
            return False
        try:
            pattern = f"certs:*:{store}*"
            keys = self._redis.keys(pattern)
            if keys:
                self._redis.delete(*keys)
            return True
        except Exception:  # noqa: BLE001
            logger.exception("清除 store 缓存失败")
            return False

    def _get_list(self, store: str, offset: int, limit: int) -> Optional[dict[str, Any]]:
        if not self._redis or not self._redis.enable_redis:
            return None
        try:
            key = f"certs:list:{store}:offset_{offset}:limit_{limit}"
            raw = self._redis.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception:  # noqa: BLE001
            logger.exception("读取列表缓存失败")
            return None

    def _set_list(
        self,
        store: str,
        offset: int,
        limit: int,
        data: dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        if not self._redis or not self._redis.enable_redis:
            return False
        try:
            key = f"certs:list:{store}:offset_{offset}:limit_{limit}"
            sec = ttl if ttl is not None else self.default_ttl
            self._redis.setex(key, sec, json.dumps(data, default=str))
            return True
        except Exception:  # noqa: BLE001
            logger.exception("写入列表缓存失败")
            return False
