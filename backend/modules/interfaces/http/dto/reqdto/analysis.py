# coding=utf-8

"""
分析相关的请求 DTO
"""
from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeTLSRequest(BaseModel):
    """分析 TLS 证书请求"""
    certificate: str = Field(..., description="证书内容（PEM格式）")
    private_key: Optional[str] = Field(None, description="私钥内容（PEM格式，可选）")

