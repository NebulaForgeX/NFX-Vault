"""证书 API 响应 VO（出站形状）。"""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CertificateVo(BaseModel):
    model_config = ConfigDict(extra="ignore")

    success: bool = Field(...)
    message: str = Field(...)
    certificate_id: Optional[str] = None
    status: Optional[str] = None
    error: Optional[str] = None
    rate_limit: Optional[bool] = None
    retry_after: Optional[str] = None
