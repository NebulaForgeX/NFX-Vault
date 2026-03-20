"""证书 API 请求 DTO（snake_case，与旧 backend 对齐）。"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator

from enums.certificate_store import CertificateStore


class CreateCertificateRequest(BaseModel):
    store: str
    domain: str
    certificate: str
    private_key: str
    sans: Optional[list[str]] = None
    folder_name: Optional[str] = None
    email: Optional[str] = None
    issuer: Optional[str] = None


class UpdateManualAddCertificateRequest(BaseModel):
    certificate_id: str
    certificate: Optional[str] = None
    private_key: Optional[str] = None
    store: Optional[str] = None
    sans: Optional[list[str]] = None
    folder_name: Optional[str] = None
    email: Optional[str] = None

    @field_validator("store")
    @classmethod
    def _v_store(cls, v: Optional[str]) -> Optional[str]:
        return CertificateStore.validate(v) if v else v


class UpdateManualApplyCertificateRequest(BaseModel):
    domain: str
    folder_name: str
    store: Optional[str] = None


class DeleteCertificateRequest(BaseModel):
    certificate_id: str


class ApplyCertificateRequest(BaseModel):
    domain: str
    email: str
    folder_name: str
    sans: Optional[list[str]] = None
    webroot: Optional[str] = None


class ReapplyAutoCertificateRequest(BaseModel):
    certificate_id: str
    email: str
    sans: Optional[list[str]] = None
    webroot: Optional[str] = None
    force_renewal: Optional[bool] = False


class ReapplyManualApplyCertificateRequest(BaseModel):
    certificate_id: str
    domain: str
    email: str
    folder_name: str
    sans: Optional[list[str]] = None
    webroot: Optional[str] = None
    force_renewal: Optional[bool] = False


class ReapplyManualAddCertificateRequest(BaseModel):
    certificate_id: str
    email: str
    sans: Optional[list[str]] = None
    webroot: Optional[str] = None
    force_renewal: Optional[bool] = False


class SearchCertificateRequest(BaseModel):
    keyword: str
    store: Optional[str] = None
    source: Optional[str] = None
    offset: int = 0
    limit: int = 20


class InvalidateCacheRequest(BaseModel):
    store: str
    trigger: str = "manual"
