# coding=utf-8

"""
解析证书事件
"""
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class ParseCertificateEvent:
    """解析证书事件"""
    certificate_id: str  # 证书 ID
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ParseCertificateEvent":
        """从字典创建事件"""
        return cls(
            certificate_id=data.get("certificate_id", ""),
            timestamp=data.get("timestamp"),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.PARSE_CERTIFICATE

