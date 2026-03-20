# coding=utf-8
"""POST /vault/tls/reapply/*。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import (
    ReapplyAutoCertificateRequest,
    ReapplyManualAddCertificateRequest,
    ReapplyManualApplyCertificateRequest,
)
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService
from apps.certificate.vo.certificate_vo import CertificateVo

router = APIRouter()


@router.post("/reapply/auto", response_model=CertificateVo)
async def reapply_auto(
    req: ReapplyAutoCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = svc.reapply_auto_certificate(
        req.certificate_id,
        req.email,
        sans=req.sans,
        webroot=req.webroot,
        force_renewal=bool(req.force_renewal),
    )
    return CertificateVo(**r)


@router.post("/reapply/manual-apply", response_model=CertificateVo)
async def reapply_manual_apply(
    req: ReapplyManualApplyCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = svc.reapply_manual_apply_certificate(
        req.certificate_id,
        req.domain,
        req.email,
        req.folder_name,
        sans=req.sans,
        webroot=req.webroot,
        force_renewal=bool(req.force_renewal),
    )
    return CertificateVo(**r)


@router.post("/reapply/manual-add", response_model=CertificateVo)
async def reapply_manual_add(
    req: ReapplyManualAddCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = svc.reapply_manual_add_certificate(
        req.certificate_id,
        req.email,
        sans=req.sans,
        webroot=req.webroot,
        force_renewal=bool(req.force_renewal),
    )
    return CertificateVo(**r)
