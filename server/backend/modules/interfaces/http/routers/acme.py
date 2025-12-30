# coding=utf-8

"""
ACME HTTP-01 挑战路由

使用工厂函数创建路由，通过依赖注入传递存储
"""
import logging
from fastapi import APIRouter, HTTPException, Response

from modules.applications.acme import ACMEChallengeStorage

logger = logging.getLogger(__name__)


def create_acme_router(storage: ACMEChallengeStorage) -> APIRouter:
    """
    创建 ACME 挑战路由
    
    Args:
        storage: ACME 挑战存储
    
    Returns:
        APIRouter: ACME 挑战路由
    """
    router = APIRouter(tags=["acme"])

    @router.get("/.well-known/acme-challenge/{token}")
    async def acme_challenge(token: str, response: Response):
        """
        ACME HTTP-01 挑战端点
        
        Let's Encrypt 会访问此端点来验证域名所有权
        路径格式：/.well-known/acme-challenge/{token}
        
        Args:
            token: ACME 挑战 token
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

