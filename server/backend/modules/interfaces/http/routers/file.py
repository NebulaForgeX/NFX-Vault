# coding=utf-8

"""
文件服务路由

使用工厂函数创建路由，通过依赖注入传递服务
"""
import logging
from enum import Enum
from typing import Optional
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

    @router.get("/list/{store}")
    async def list_directory(store: FileStore, path: Optional[str] = None):
        """列出目录内容"""
        try:
            result = handler.list_directory(store.value, path)
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 列出目录失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/download/{store}")
    async def download_file(store: FileStore, path: str):
        """下载文件"""
        try:
            from fastapi.responses import Response
            result = handler.download_file(store.value, path)
            if result.get("success") and result.get("content"):
                return Response(
                    content=result["content"],
                    media_type=result.get("mime_type", "application/octet-stream"),
                    headers={
                        "Content-Disposition": f'attachment; filename="{result.get("filename", "file")}"'
                    }
                )
            else:
                raise HTTPException(
                    status_code=404,
                    detail=result.get("message", "File not found")
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 下载文件失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/content/{store}")
    async def get_file_content(store: FileStore, path: str):
        """获取文件内容（文本格式）"""
        try:
            result = handler.get_file_content(store.value, path)
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 获取文件内容失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    return router

