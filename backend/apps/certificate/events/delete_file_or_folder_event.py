from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Optional


@dataclass
class DeleteFileOrFolderEvent:
    store: str
    path: str
    item_type: str
    timestamp: Optional[str] = None

    def __post_init__(self) -> None:
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> DeleteFileOrFolderEvent:
        return cls(
            store=data.get("store", ""),
            path=data.get("path", ""),
            item_type=data.get("item_type", "file"),
            timestamp=data.get("timestamp"),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
