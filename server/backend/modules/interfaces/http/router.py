# coding=utf-8

"""
HTTP 路由统一入口

集合所有路由的创建和注册
"""
from fastapi import FastAPI

from modules.interfaces.http.handler.certificate import CertificateHTTPHandler
from modules.interfaces.http.handler.file import FileHTTPHandler
from modules.interfaces.http.handler.analysis import AnalysisHTTPHandler
from modules.applications.acme import ACMEChallengeStorage
from .routers import create_tls_router, create_file_router, create_acme_router, create_analysis_router


def register_routers(
    app: FastAPI,
    tls_handler: CertificateHTTPHandler,
    file_handler: FileHTTPHandler,
    analysis_handler: AnalysisHTTPHandler,
    acme_storage: ACMEChallengeStorage
) -> None:
    """
    注册所有路由到 FastAPI 应用
    
    Args:
        app: FastAPI 应用实例
        tls_handler: TLS 证书 HTTP 处理器
        file_handler: 文件服务 HTTP 处理器
        analysis_handler: 分析 HTTP 处理器
        acme_storage: ACME 挑战存储
    """
    routers = [
        create_tls_router(tls_handler),
        create_file_router(file_handler),
        create_analysis_router(analysis_handler),
        create_acme_router(acme_storage)
    ]
    for router in routers:
        app.include_router(router)
