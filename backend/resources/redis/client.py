# coding=utf-8

"""
Redis 客户端
"""
import logging
from typing import Optional
import redis

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis 客户端类"""
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        enable_redis: bool = True
    ):
        """
        初始化 Redis 客户端
        
        Args:
            host: Redis 主机地址
            port: Redis 端口
            db: 数据库编号
            password: 密码（可选）
            enable_redis: 是否启用 Redis
        """
        self.host = host
        self.port = port
        self.db = db
        self.password = password
        self.enable_redis = enable_redis
        self.client: Optional[redis.Redis] = None
        
        if self.enable_redis:
            try:
                redis_kwargs = {
                    "host": self.host,
                    "port": self.port,
                    "db": self.db,
                    "decode_responses": True,  # 自动解码为字符串
                    "socket_connect_timeout": 5,
                    "socket_timeout": 5,
                    "retry_on_timeout": True,
                }
                
                # 只有当密码存在时才添加 password 参数
                if self.password:
                    redis_kwargs["password"] = self.password
                
                self.client = redis.Redis(**redis_kwargs)
                
                # 测试连接
                self.client.ping()
                logger.info(f"✅ Redis 连接已初始化: {self.host}:{self.port}/{self.db}")
            except Exception as e:
                logger.error(f"❌ Redis 连接初始化失败: {e}")
                self.enable_redis = False
                self.client = None
    
    def get(self, key: str) -> Optional[str]:
        """获取键值"""
        if not self.enable_redis or not self.client:
            return None
        try:
            return self.client.get(key)
        except Exception as e:
            logger.error(f"❌ Redis GET 失败: {e}")
            return None
    
    def set(self, key: str, value: str, ex: Optional[int] = None):
        """设置键值"""
        if not self.enable_redis or not self.client:
            return
        try:
            self.client.set(key, value, ex=ex)
        except Exception as e:
            logger.error(f"❌ Redis SET 失败: {e}")
    
    def setex(self, key: str, time: int, value: str):
        """设置键值（带过期时间）"""
        if not self.enable_redis or not self.client:
            return
        try:
            self.client.setex(key, time, value)
        except Exception as e:
            logger.error(f"❌ Redis SETEX 失败: {e}")
    
    def delete(self, *keys: str):
        """删除键"""
        if not self.enable_redis or not self.client:
            return
        try:
            self.client.delete(*keys)
        except Exception as e:
            logger.error(f"❌ Redis DELETE 失败: {e}")
    
    def keys(self, pattern: str):
        """获取匹配模式的键列表"""
        if not self.enable_redis or not self.client:
            return []
        try:
            return self.client.keys(pattern)
        except Exception as e:
            logger.error(f"❌ Redis KEYS 失败: {e}")
            return []
    
    def close(self):
        """关闭 Redis 连接"""
        if self.client:
            try:
                self.client.close()
                logger.info("✅ Redis 连接已关闭")
            except Exception as e:
                logger.error(f"❌ 关闭 Redis 连接失败: {e}")

