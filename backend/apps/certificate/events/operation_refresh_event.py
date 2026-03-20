from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Optional


@dataclass
class OperationRefreshEvent:
    store: str
    trigger: str = "manual"
    timestamp: Optional[str] = None

    def __post_init__(self) -> None:
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OperationRefreshEvent:
        return cls(
            store=data.get("store", "websites"),
            trigger=data.get("trigger", "manual"),
            timestamp=data.get("timestamp"),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
