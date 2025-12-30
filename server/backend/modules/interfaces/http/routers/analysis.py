# coding=utf-8

"""
分析路由

TLS 证书分析相关的 API 路由
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from modules.interfaces.http.handler.analysis import AnalysisHTTPHandler

logger = logging.getLogger(__name__)


class AnalyzeTLSRequest(BaseModel):
    """分析 TLS 证书请求"""
    certificate: str = Field(..., description="证书内容（PEM格式）")
    private_key: str | None = Field(None, description="私钥内容（PEM格式，可选）")


class AnalyzeTLSResponse(BaseModel):
    """分析 TLS 证书响应"""
    success: bool
    message: str
    data: dict | None = None
    
    class Config:
        # 允许任意类型，因为 data 是动态的嵌套字典
        arbitrary_types_allowed = True


def create_analysis_router(handler: AnalysisHTTPHandler) -> APIRouter:
    """创建分析路由"""
    router = APIRouter(prefix="/vault/analysis", tags=["Analysis"])
    
    @router.post("/tls", response_model=AnalyzeTLSResponse)
    async def analyze_tls_certificate(request: AnalyzeTLSRequest):
        """
        分析 TLS 证书
        
        用户可以上传或粘贴证书和私钥文件，系统会解析并返回证书信息
        """
        try:
            result = handler.analyze_tls_certificate(
                certificate=request.certificate,
                private_key=request.private_key
            )
            # 打印返回结果用于调试
            import json
            logger.info(f"🔍 返回结果: {json.dumps(result, default=str, ensure_ascii=False)}")
            return result
        except Exception as e:
            logger.error(f"❌ 分析 TLS 证书失败: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze certificate: {str(e)}"
            )
    
    return router

