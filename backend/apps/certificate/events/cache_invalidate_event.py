from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Optional


@dataclass
class CacheInvalidateEvent:
    stores: list[str]
    trigger: str = "manual"
    timestamp: Optional[str] = None

    def __post_init__(self) -> None:
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> CacheInvalidateEvent:
        stores = data.get("stores", [])
        if isinstance(stores, str):
            stores = [stores]
        return cls(
            stores=list(stores),
            trigger=data.get("trigger", "manual"),
            timestamp=data.get("timestamp"),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
