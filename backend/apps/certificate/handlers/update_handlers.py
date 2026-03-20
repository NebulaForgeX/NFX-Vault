# coding=utf-8
"""PUT /vault/tls/update/manual-add | manual-apply。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import (
    UpdateManualAddCertificateRequest,
    UpdateManualApplyCertificateRequest,
)
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
        certificate=req.certificate,
        private_key=req.private_key,
        store=req.store,
        sans=req.sans,
        folder_name=req.folder_name,
        email=req.email,
    )
    return CertificateVo(**r)


@router.put("/update/manual-apply", response_model=CertificateVo)
async def update_manual_apply(
    req: UpdateManualApplyCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = svc.update_manual_apply_certificate(req.domain, req.folder_name, store=req.store)
    return CertificateVo(**r)
