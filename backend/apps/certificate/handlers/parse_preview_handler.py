# coding=utf-8
"""POST /vault/tls/parse-preview — 解析 PEM 供前端上传回填（不入库）。"""
from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from apps.certificate.dto.certificate_request_dto import ParseCertificatePreviewRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService

router = APIRouter()


class ParseCertificatePreviewVo(BaseModel):
    success: bool = Field(...)
    message: str = Field(...)
    domain: Optional[str] = None
    sans: Optional[list[str]] = None
    issuer: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    is_valid: Optional[bool] = None
    days_remaining: Optional[int] = None


@router.post("/parse-preview", response_model=ParseCertificatePreviewVo)
async def parse_preview(
    req: ParseCertificatePreviewRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> dict[str, Any]:
    r = svc.parse_certificate_preview(req.certificate)
    return r
