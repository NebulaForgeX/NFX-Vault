# coding=utf-8

"""
执行刷新操作事件
"""
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class OperationRefreshEvent:
    """执行刷新操作事件"""
    store: str  # websites 或 apis
    trigger: str = "manual"  # manual, scheduled, api
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OperationRefreshEvent":
        """从字典创建事件"""
        return cls(
            store=data.get("store", "websites"),
            trigger=data.get("trigger", "manual"),
            timestamp=data.get("timestamp"),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.OPERATION_REFRESH

