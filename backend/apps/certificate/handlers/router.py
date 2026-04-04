# coding=utf-8
"""证书域 HTTP 路由聚合。"""
from __future__ import annotations

from fastapi import APIRouter

from apps.certificate.handlers.apply_handler import router as apply_router
from apps.certificate.handlers.reapply_handler import router as reapply_router
from apps.certificate.handlers.create_handler import router as create_router
from apps.certificate.handlers.delete_handler import router as delete_router
from apps.certificate.handlers.detail_handler import router as detail_router
from apps.certificate.handlers.invalidate_cache_handler import router as invalidate_cache_router
from apps.certificate.handlers.list_handler import router as list_router
from apps.certificate.handlers.parse_preview_handler import router as parse_preview_router
from apps.certificate.handlers.search_handler import router as search_router
from apps.certificate.handlers.update_handlers import router as update_router

router = APIRouter(prefix="/vault/tls", tags=["tls"])

router.include_router(list_router)
router.include_router(detail_router)
router.include_router(invalidate_cache_router)
router.include_router(apply_router)
router.include_router(reapply_router)
router.include_router(create_router)
router.include_router(update_router)
router.include_router(delete_router)
router.include_router(search_router)
router.include_router(parse_preview_router)
