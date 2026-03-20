# coding=utf-8
"""POST /vault/tls/apply。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import ApplyCertificateRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService
from apps.certificate.vo.certificate_vo import CertificateVo

router = APIRouter()


@router.post("/apply", response_model=CertificateVo)
async def apply(
    req: ApplyCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = svc.apply_certificate(
        req.domain, req.email, req.folder_name, sans=req.sans, webroot=req.webroot
    )
    return CertificateVo(**r)
