# coding=utf-8
"""POST /vault/tls/refresh/{store}。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from apps.certificate.handlers.cert_store import CertStore
from apps.certificate.handlers.deps import get_certificate_service
from apps.certificate.services.certificate_service import CertificateService

router = APIRouter()


@router.post("/refresh/{store}")
async def refresh(
    store: CertStore,
    svc: CertificateService = Depends(get_certificate_service),
) -> dict:
    if store == CertStore.database:
        raise HTTPException(status_code=400, detail="store must be websites or apis")
    svc.publish_refresh_event(store.value, "api")
    return {
        "success": True,
        "message": f"Certificate refresh event published for {store.value}",
        "processed": 0,
    }
