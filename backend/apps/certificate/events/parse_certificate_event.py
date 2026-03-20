from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Optional


@dataclass
class ParseCertificateEvent:
    certificate_id: str
    timestamp: Optional[str] = None

    def __post_init__(self) -> None:
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ParseCertificateEvent:
        return cls(
            certificate_id=data.get("certificate_id", ""),
            timestamp=data.get("timestamp"),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
