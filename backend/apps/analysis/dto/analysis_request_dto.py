"""分析 API 请求 DTO。"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class AnalyzeTLSRequest(BaseModel):
    certificate: str = Field(...)
    private_key: Optional[str] = None
