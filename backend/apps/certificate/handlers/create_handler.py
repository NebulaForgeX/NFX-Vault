# coding=utf-8
"""POST /vault/tls/create。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from apps.certificate.dto.certificate_request_dto import CreateCertificateRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService
from apps.certificate.vo.certificate_vo import CertificateVo

router = APIRouter()


@router.post("/create", response_model=CertificateVo)
async def create(
    req: CreateCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    if req.store not in ("websites", "apis", "database"):
        raise HTTPException(status_code=400, detail="invalid store")
    r = svc.create_certificate(
        req.store,
        req.domain,
        req.certificate,
        req.private_key,
        sans=req.sans,
        folder_name=req.folder_name,
        email=req.email,
        issuer=req.issuer,
    )
    return CertificateVo(**r)
