from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Optional


@dataclass
class DeleteFolderEvent:
    store: str
    folder_name: str
    timestamp: Optional[str] = None

    def __post_init__(self) -> None:
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> DeleteFolderEvent:
        return cls(
            store=data.get("store", ""),
            folder_name=data.get("folder_name", ""),
            timestamp=data.get("timestamp"),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
