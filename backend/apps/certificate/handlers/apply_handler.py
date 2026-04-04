# coding=utf-8
"""POST /vault/tls/apply — 新建证书（Certbot 签发后写入 DB）。"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import ApplyCertificateRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService
from apps.certificate.vo.certificate_vo import CertificateVo

router = APIRouter()


@router.post("/apply", response_model=CertificateVo)
async def apply_new(
    req: ApplyCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> CertificateVo:
    # Certbot 使用 subprocess.run，必须放到线程池，否则会阻塞 asyncio 事件环（登录等 API 全部卡住）。
    r = await asyncio.to_thread(
        svc.apply_new_certificate,
        domain=req.domain,
        email=req.email,
        sans=req.sans,
        folder_name=req.folder_name,
        webroot=req.webroot,
        force_renewal=req.force_renewal,
    )
    return CertificateVo(**r)
