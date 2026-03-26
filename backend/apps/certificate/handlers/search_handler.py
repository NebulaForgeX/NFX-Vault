# coding=utf-8
"""POST /vault/tls/search。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import SearchCertificateRequest
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService

router = APIRouter()


@router.post("/search")
async def search(
    req: SearchCertificateRequest,
    svc: CertificateService = Depends(get_certificate_service),
) -> dict:
    return svc.search_certificate(
        req.keyword,
        offset=req.offset,
        limit=req.limit,
    )
