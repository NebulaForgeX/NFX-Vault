import logging
from typing import Optional

import redis

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        enable_redis: bool = True,
    ) -> None:
        self.host = host
        self.port = port
        self.db = db
        self.password = password
        self.enable_redis = enable_redis
        self.client: Optional[redis.Redis] = None

        if self.enable_redis:
            try:
                kwargs = {
                    "host": self.host,
                    "port": self.port,
                    "db": self.db,
                    "decode_responses": True,
                    "socket_connect_timeout": 5,
                    "socket_timeout": 5,
                    "retry_on_timeout": True,
                }
                if self.password:
                    kwargs["password"] = self.password
                self.client = redis.Redis(**kwargs)
                self.client.ping()
                logger.info("Redis 已连接 %s:%s/%s", self.host, self.port, self.db)
            except Exception as e:  # noqa: BLE001
                logger.error("Redis 初始化失败: %s", e)
                self.enable_redis = False
                self.client = None

    def get(self, key: str) -> Optional[str]:
        if not self.enable_redis or not self.client:
            return None
        try:
            return self.client.get(key)
        except Exception as e:  # noqa: BLE001
            logger.error("Redis GET 失败: %s", e)
            return None

    def setex(self, key: str, time: int, value: str) -> None:
        if not self.enable_redis or not self.client:
            return
        try:
            self.client.setex(key, time, value)
        except Exception as e:  # noqa: BLE001
            logger.error("Redis SETEX 失败: %s", e)

    def delete(self, *keys: str) -> None:
        if not self.enable_redis or not self.client or not keys:
            return
        try:
            self.client.delete(*keys)
        except Exception as e:  # noqa: BLE001
            logger.error("Redis DELETE 失败: %s", e)

    def keys(self, pattern: str) -> list[str]:
        if not self.enable_redis or not self.client:
            return []
        try:
            return list(self.client.keys(pattern))
        except Exception as e:  # noqa: BLE001
            logger.error("Redis KEYS 失败: %s", e)
            return []

    def close(self) -> None:
        if self.client:
            try:
                self.client.close()
                logger.info("Redis 已关闭")
            except Exception as e:  # noqa: BLE001
                logger.error("关闭 Redis 失败: %s", e)
