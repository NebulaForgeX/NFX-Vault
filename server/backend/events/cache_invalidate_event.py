# coding=utf-8

"""
缓存失效事件
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class CacheInvalidateEvent:
    """缓存失效事件"""
    stores: List[str]  # 需要失效缓存的存储位置列表（websites, apis, database）
    trigger: str = "manual"  # manual, add, update, delete
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CacheInvalidateEvent":
        """从字典创建事件"""
        stores = data.get("stores", [])
        if isinstance(stores, str):
            stores = [stores]
        return cls(
            stores=stores,
            trigger=data.get("trigger", "manual"),
            timestamp=data.get("timestamp"),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.CACHE_INVALIDATE

