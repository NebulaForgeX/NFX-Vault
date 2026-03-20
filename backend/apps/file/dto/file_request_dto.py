"""文件 API 请求 DTO。"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ExportSingleCertificateRequest(BaseModel):
    certificate_id: str = Field(..., description="证书 ID")
    store: str = Field(..., description="websites 或 apis")


class DeleteFileOrFolderRequest(BaseModel):
    store: str = Field(...)
    path: str = Field(...)
    item_type: str = Field(..., description="file 或 folder")
