"""证书 API 请求 DTO（snake_case）。"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class CreateCertificateRequest(BaseModel):
    domain: str
    certificate: str
    private_key: str
    sans: Optional[list[str]] = None
    folder_name: Optional[str] = None
    email: Optional[str] = None
    issuer: Optional[str] = None


class UpdateManualAddCertificateRequest(BaseModel):
    certificate_id: str
    sans: Optional[list[str]] = None
    folder_name: Optional[str] = None
    email: Optional[str] = None


class DeleteCertificateRequest(BaseModel):
    certificate_id: str


class SearchCertificateRequest(BaseModel):
    keyword: str
    offset: int = 0
    limit: int = 20


class ParseCertificatePreviewRequest(BaseModel):
    certificate: str = Field(..., description="PEM 证书全文")


class ApplyCertificateRequest(BaseModel):
    """新建证书：Let's Encrypt 签发后入库（不要求前端提交 PEM）。"""

    domain: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1, description="ACME 账户邮箱")
    sans: Optional[list[str]] = None
    folder_name: Optional[str] = None
    webroot: Optional[str] = None
    force_renewal: bool = False
