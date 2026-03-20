# coding=utf-8
"""POST /vault/tls/invalidate-cache/{store}。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.dto.certificate_request_dto import InvalidateCacheRequest
from apps.certificate.handlers.cert_store import CertStore
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService

router = APIRouter()


@router.post("/invalidate-cache/{store}")
async def invalidate_cache(
    store: CertStore,
    svc: CertificateService = Depends(get_certificate_service),
) -> dict:
    req = InvalidateCacheRequest(store=store.value, trigger="api")
    ok = svc.invalidate_cache([req.store], req.trigger)
    return {
        "success": ok,
        "message": f"Cache invalidate event published for {req.store}"
        if ok
        else "Failed to publish",
    }
