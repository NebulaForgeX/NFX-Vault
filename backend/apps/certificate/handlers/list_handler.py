# coding=utf-8
"""GET /vault/tls/check/{store} — 列表/分页。"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query

from apps.certificate.handlers.cert_store import CertStore
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/check/{store}")
async def check_certificates(
    store: CertStore,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    svc: CertificateService = Depends(get_certificate_service),
) -> dict:
    try:
        return svc.list_certificates(store.value, offset, limit)
    except Exception as e:  # noqa: BLE001
        logger.exception("check_certificates")
        raise HTTPException(status_code=500, detail=str(e)) from e
