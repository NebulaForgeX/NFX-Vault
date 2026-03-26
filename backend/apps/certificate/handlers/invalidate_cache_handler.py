# coding=utf-8
"""POST /vault/tls/invalidate-cache — 刷新 Redis 证书缓存。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService

router = APIRouter()


@router.post("/invalidate-cache")
async def invalidate_cache(
    svc: CertificateService = Depends(get_certificate_service),
) -> dict:
    ok = svc.invalidate_cache(trigger="api")
    return {
        "success": ok,
        "message": "Cache invalidated" if ok else "Failed to publish",
    }
