"""分析 API 响应 VO。"""
from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class AnalyzeTLSVo(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    success: bool
    message: str
    data: Optional[dict[str, Any]] = None
