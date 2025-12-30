# coding=utf-8

"""
文件服务 HTTP Handler

处理文件相关的 HTTP 请求
"""
import logging
from enum import Enum
from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from modules.applications.file import FileApplication
from modules.interfaces.http.dto.reqdto.file import (
    ExportCertificatesRequest,
    ListDirectoryRequest,
    DownloadFileRequest,
    GetFileContentRequest,
)
from .operation import (
    export_certificates,
    list_directory,
    download_file,
    get_file_content,
)

logger = logging.getLogger(__name__)


class FileStore(str, Enum):
    """文件存储位置枚举"""
    websites = "websites"
    apis = "apis"


class FileHTTPHandler:
    """文件服务 HTTP 处理器"""
    
    def __init__(self, file_application: FileApplication):
        """初始化 HTTP 处理器"""
        self.file_application = file_application
        logger.info("✅ FileHTTPHandler initialized")
    
    def create_router(self) -> APIRouter:
        """创建文件服务路由"""
        router = APIRouter(prefix="/vault/file", tags=["file"])

        @router.post("/export/{store}")
        async def export_certificates_endpoint(store: FileStore):
            """导出证书到文件"""
            try:
                request = ExportCertificatesRequest(store=store.value)
                result = export_certificates(
                    app=self.file_application,
                    request=request
                )
                return result
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 导出证书失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.get("/list/{store}")
        async def list_directory_endpoint(store: FileStore, path: Optional[str] = None):
            """列出目录内容"""
            try:
                request = ListDirectoryRequest(store=store.value, subpath=path)
                result = list_directory(
                    app=self.file_application,
                    request=request
                )
                return result
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 列出目录失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.get("/download/{store}")
        async def download_file_endpoint(store: FileStore, path: str):
            """下载文件"""
            try:
                request = DownloadFileRequest(store=store.value, file_path=path)
                result = download_file(
                    app=self.file_application,
                    request=request
                )
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
        async def get_file_content_endpoint(store: FileStore, path: str):
            """获取文件内容（文本格式）"""
            try:
                request = GetFileContentRequest(store=store.value, file_path=path)
                result = get_file_content(
                    app=self.file_application,
                    request=request
                )
                return result
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 获取文件内容失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        return router

