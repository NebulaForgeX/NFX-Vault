"""文件 API 请求 DTO。"""
from __future__ import annotations

from pydantic import BaseModel, Field


class ExportSingleCertificateRequest(BaseModel):
    certificate_id: str = Field(..., description="证书 ID")


class DeleteFileOrFolderRequest(BaseModel):
    store: str = Field(default="websites", description="仅支持 websites")
    path: str = Field(...)
    item_type: str = Field(..., description="file 或 folder")
