"""
证书域 URL 出口（对齐 Farmwatch `apps/<app>/urls.py` 只做路由导出）。
"""
from __future__ import annotations

from apps.certificate.handlers.router import router as certificate_router

__all__ = ["certificate_router"]
