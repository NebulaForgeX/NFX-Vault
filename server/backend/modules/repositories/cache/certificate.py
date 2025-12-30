# coding=utf-8

"""
证书缓存仓库

Redis 缓存数据访问
"""
import json
import logging
from typing import Optional, List, Dict, Any

from resources.redis.client import RedisClient

logger = logging.getLogger(__name__)


class CertificateCache:
    """证书缓存仓库"""
    
    def __init__(self, redis_client: Optional[RedisClient] = None):
        """
        初始化缓存仓库
        
        Args:
            redis_client: Redis 客户端
        """
        self.redis_client = redis_client
        self.default_ttl = 60  # 默认 5 分钟（缩短缓存时间以提高数据实时性）
    
    def get_certificate_list(
        self, 
        store: str, 
        page: int = 1, 
        page_size: int = 20
    ) -> Optional[Dict[str, Any]]:
        """
        从缓存获取证书列表
        
        Args:
            store: 存储位置
            page: 页码
            page_size: 每页数量
            
        Returns:
            缓存数据，如果不存在则返回 None
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return None
        
        try:
            cache_key = f"certs:list:{store}:page_{page}:size_{page_size}"
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            logger.error(f"❌ 从缓存获取证书列表失败: {e}", exc_info=True)
            return None
    
    def set_certificate_list(
        self, 
        store: str, 
        page: int, 
        page_size: int, 
        data: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """
        缓存证书列表
        
        Args:
            store: 存储位置
            page: 页码
            page_size: 每页数量
            data: 要缓存的数据
            ttl: 过期时间（秒），如果为 None 则使用默认值
            
        Returns:
            是否成功
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        
        try:
            cache_key = f"certs:list:{store}:page_{page}:size_{page_size}"
            ttl = ttl or self.default_ttl
            self.redis_client.setex(cache_key, ttl, json.dumps(data, default=str))
            return True
        except Exception as e:
            logger.error(f"❌ 缓存证书列表失败: {e}", exc_info=True)
            return False
    
    def get_certificate_detail(
        self, 
        store: str, 
        domain: str
    ) -> Optional[Dict[str, Any]]:
        """
        从缓存获取证书详情
        
        Args:
            store: 存储位置
            domain: 域名
            
        Returns:
            缓存数据，如果不存在则返回 None
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return None
        
        try:
            cache_key = f"certs:detail:{store}:{domain}"
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            logger.error(f"❌ 从缓存获取证书详情失败: {e}", exc_info=True)
            return None
    
    def set_certificate_detail(
        self, 
        store: str, 
        domain: str, 
        data: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """
        缓存证书详情
        
        Args:
            store: 存储位置
            domain: 域名
            data: 要缓存的数据
            ttl: 过期时间（秒），如果为 None 则使用默认值
            
        Returns:
            是否成功
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        
        try:
            cache_key = f"certs:detail:{store}:{domain}"
            ttl = ttl or self.default_ttl
            self.redis_client.setex(cache_key, ttl, json.dumps(data, default=str))
            return True
        except Exception as e:
            logger.error(f"❌ 缓存证书详情失败: {e}", exc_info=True)
            return False
    
    def clear_store_cache(self, store: str) -> bool:
        """
        清除指定 store 的所有缓存
        
        Args:
            store: 存储位置
            
        Returns:
            是否成功
        """
        if not self.redis_client or not self.redis_client.enable_redis:
            return False
        
        try:
            pattern = f"certs:*:{store}*"
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"✅ 清除 Redis 缓存: store={store}, 删除 {len(keys)} 个 key")
            return True
        except Exception as e:
            logger.error(f"❌ 清除缓存失败: {e}", exc_info=True)
            return False

