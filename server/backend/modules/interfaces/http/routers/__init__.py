# coding=utf-8

"""
HTTP 路由模块

使用工厂函数创建路由，通过依赖注入传递服务
"""
from .tls import create_tls_router
from .file import create_file_router
from .acme import create_acme_router
from .analysis import create_analysis_router

__all__ = [
    "create_tls_router",
    "create_file_router",
    "create_acme_router",
    "create_analysis_router",
]

