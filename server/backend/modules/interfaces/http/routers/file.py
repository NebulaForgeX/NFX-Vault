# coding=utf-8

"""
文件服务路由

使用工厂函数创建路由，通过依赖注入传递服务
"""
import logging
from enum import Enum
from fastapi import APIRouter, HTTPException

from modules.interfaces.http.handler.file import FileHTTPHandler

logger = logging.getLogger(__name__)


class FileStore(str, Enum):
    """文件存储位置枚举"""
    websites = "websites"
    apis = "apis"


def create_file_router(handler: FileHTTPHandler) -> APIRouter:
    """
    创建文件服务路由
    
    Args:
        handler: 文件服务 HTTP 处理器
    
    Returns:
        APIRouter: 文件服务路由
    """
    router = APIRouter(prefix="/vault/file", tags=["file"])

    @router.post("/export/{store}")
    async def export_certificates(store: FileStore):
        """导出证书到文件"""
        try:
            result = handler.export_certificates(store.value)
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 导出证书失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    return router

