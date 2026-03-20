# coding=utf-8

"""
HTTP 路由统一入口

集合所有路由的创建和注册
"""
import logging
from fastapi import FastAPI, APIRouter, Response
from modules.interfaces.http.handler.tls.tls import CertificateHTTPHandler
from modules.interfaces.http.handler.file.file import FileHTTPHandler
from modules.interfaces.http.handler.analysis.analysis import AnalysisHTTPHandler
from modules.applications.acme import ACMEChallengeStorage

logger = logging.getLogger(__name__)


def create_acme_router(storage: ACMEChallengeStorage) -> APIRouter:
    """创建 ACME 挑战路由"""
    router = APIRouter(tags=["acme"])

    @router.get("/.well-known/acme-challenge/{token}")
    async def acme_challenge(token: str, response: Response):
        """
        ACME HTTP-01 挑战端点
        
        Let's Encrypt 会访问此端点来验证域名所有权
        路径格式：/.well-known/acme-challenge/{token}
        """
        logger.info(f"🔔 ACME challenge request received: token={token}")
        
        # 从存储中获取挑战响应
        key_authorization = storage.get_challenge(token)
        
        if not key_authorization:
            logger.warning(f"⚠️  ACME challenge token not found: {token}")
            logger.warning(f"⚠️  Challenge directory: {storage.challenge_dir if storage else 'N/A'}")
            response.status_code = 404
            return {"error": "Challenge token not found"}
        
        logger.info(f"✅ ACME challenge response sent: token={token}, content_length={len(key_authorization)}")
        # 返回纯文本响应（key authorization）
        response.headers["Content-Type"] = "text/plain"
        return Response(content=key_authorization, media_type="text/plain")

    return router


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
        tls_handler.create_router(),
        file_handler.create_router(),
        analysis_handler.create_router(),
        create_acme_router(acme_storage)
    ]
    for router in routers:
        app.include_router(router)
