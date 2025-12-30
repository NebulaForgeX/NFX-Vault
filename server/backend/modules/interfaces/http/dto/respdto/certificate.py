# coding=utf-8

"""
证书相关的响应 DTO

定义证书操作的响应模型
"""
from pydantic import BaseModel, Field


class CertificateResponse(BaseModel):
    """证书操作响应"""
    success: bool = Field(..., description="操作是否成功")
    message: str = Field(..., description="响应消息")

