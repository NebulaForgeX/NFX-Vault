# coding=utf-8
"""PUT /vault/tls/update/manual-add。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import UpdateManualAddCertificateRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService
from apps.certificate.vo.certificate_vo import CertificateVo

router = APIRouter()


@router.put("/update/manual-add", response_model=CertificateVo)
async def update_manual_add(
    req: UpdateManualAddCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = svc.update_manual_add_certificate(
        req.certificate_id,
        sans=req.sans,
        folder_name=req.folder_name,
        email=req.email,
    )
    return CertificateVo(**r)
