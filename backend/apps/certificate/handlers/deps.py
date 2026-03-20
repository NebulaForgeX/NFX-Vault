"""Handler 层依赖：从 app.state 取 Service（对齐 Farmwatch handler 注入 service）。"""
from __future__ import annotations

from fastapi import HTTPException, Request

from apps.certificate.services.certificate_service import CertificateService


def get_certificate_service(request: Request) -> CertificateService:
    s = getattr(request.app.state, "certificate_service", None)
    if s is None:
        raise HTTPException(status_code=503, detail="certificate_service not ready")
    return s
