# coding=utf-8
"""GET /vault/tls/detail-by-id/{certificate_id}。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService

router = APIRouter()


@router.get("/detail-by-id/{certificate_id}")
async def detail_by_id(
    certificate_id: str,
    svc: CertificateService = Depends(get_certificate_service),
) -> dict:
    r = svc.get_certificate_detail_by_id(certificate_id)
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return r
