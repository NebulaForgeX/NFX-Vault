# coding=utf-8
"""DELETE /vault/tls/delete（body）。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import DeleteCertificateRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService
from apps.certificate.vo.certificate_vo import CertificateVo

router = APIRouter()


@router.delete("/delete", response_model=CertificateVo)
async def delete_cert(
    req: DeleteCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = svc.delete_certificate(req.certificate_id)
    return CertificateVo(**r)
