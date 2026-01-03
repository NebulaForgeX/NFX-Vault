# coding=utf-8

"""
删除文件或文件夹事件
"""
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from .event_type import EventType


@dataclass
class DeleteFileOrFolderEvent:
    """删除文件或文件夹事件"""
    store: str  # websites 或 apis
    path: str  # 文件或文件夹路径（相对于 store 目录）
    item_type: str  # "file" 或 "folder"
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DeleteFileOrFolderEvent":
        """从字典创建事件"""
        return cls(
            store=data.get("store", "websites"),
            path=data.get("path", ""),
            item_type=data.get("item_type", "file"),
            timestamp=data.get("timestamp"),
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @staticmethod
    def event_type() -> str:
        """返回事件类型"""
        return EventType.DELETE_FILE_OR_FOLDER

