# coding=utf-8

"""
文件服务相关的请求 DTO
"""
from pydantic import BaseModel, Field
from typing import Optional


class ExportCertificatesRequest(BaseModel):
    """导出证书请求"""
    store: str = Field(..., description="存储位置（websites 或 apis）")


class ListDirectoryRequest(BaseModel):
    """列出目录请求"""
    store: str = Field(..., description="存储位置（websites 或 apis）")
    subpath: Optional[str] = Field(None, description="子路径（可选）")


class DownloadFileRequest(BaseModel):
    """下载文件请求"""
    store: str = Field(..., description="存储位置（websites 或 apis）")
    file_path: str = Field(..., description="文件路径")


class GetFileContentRequest(BaseModel):
    """获取文件内容请求"""
    store: str = Field(..., description="存储位置（websites 或 apis）")
    file_path: str = Field(..., description="文件路径")


class ExportSingleCertificateRequest(BaseModel):
    """导出单个证书请求"""
    certificate_id: str = Field(..., description="证书 ID")
    store: str = Field(..., description="存储位置（websites 或 apis）")


class DeleteFileOrFolderRequest(BaseModel):
    """删除文件或文件夹请求"""
    store: str = Field(..., description="存储位置（websites 或 apis）")
    path: str = Field(..., description="文件或文件夹路径（相对于 store 目录）")
    item_type: str = Field(..., description="类型（'file' 或 'folder'）")

