"""
根路由聚合（对齐 Farmwatch `config/urls.py` 只做 include，不含业务）。
"""
from __future__ import annotations

from fastapi import APIRouter

from apps.analysis.urls import analysis_router
from apps.certificate.urls import certificate_router
from apps.file.urls import file_router
from apps.user.urls import image_serve_router, user_router
from routers.acme_router import router as acme_router

api_router = APIRouter()
api_router.include_router(certificate_router)
api_router.include_router(file_router)
api_router.include_router(analysis_router)
api_router.include_router(user_router)
api_router.include_router(image_serve_router)
api_router.include_router(acme_router)
