# coding=utf-8

"""
分析相关的响应 DTO
"""
from pydantic import BaseModel


class AnalyzeTLSResponse(BaseModel):
    """分析 TLS 证书响应"""
    success: bool
    message: str
    data: dict | None = None
    
    class Config:
        arbitrary_types_allowed = True

