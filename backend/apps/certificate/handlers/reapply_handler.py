# coding=utf-8
"""POST /vault/tls/reapply — 按证书 ID 从库中读取信息后重新签发并更新。"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import ReapplyCertificateRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService
from apps.certificate.vo.certificate_vo import CertificateVo

router = APIRouter()


@router.post("/reapply", response_model=CertificateVo)
async def reapply_existing(
    req: ReapplyCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    r = await asyncio.to_thread(
        svc.reapply_certificate,
        certificate_id=req.certificate_id,
        force_renewal=req.force_renewal,
    )
    return CertificateVo(**r)
