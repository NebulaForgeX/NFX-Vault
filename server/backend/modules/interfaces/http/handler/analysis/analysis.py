# coding=utf-8

"""
分析 HTTP Handler

处理 TLS 证书分析相关的 HTTP 请求
"""
import logging
from fastapi import APIRouter, HTTPException
from modules.applications.analysis import AnalysisApplication
from modules.interfaces.http.dto.reqdto.analysis import AnalyzeTLSRequest
from modules.interfaces.http.dto.respdto.analysis import AnalyzeTLSResponse
from .operation import analyze_tls_certificate

logger = logging.getLogger(__name__)


class AnalysisHTTPHandler:
    """分析 HTTP 处理器"""
    def __init__(self, analysis_application: AnalysisApplication):
        self.analysis_application = analysis_application
    
    def create_router(self) -> APIRouter:
        """创建分析路由"""
        router = APIRouter(prefix="/vault/analysis", tags=["Analysis"])
        
        @router.post("/tls", response_model=AnalyzeTLSResponse)
        async def analyze_tls_certificate_endpoint(request: AnalyzeTLSRequest):
            """
            分析 TLS 证书
            用户可以上传或粘贴证书和私钥文件，系统会解析并返回证书信息
            """
            try:
                result = analyze_tls_certificate(
                    app=self.analysis_application,
                    request=request
                )
                return result
            except Exception as e:
                logger.error(f"❌ 分析 TLS 证书失败: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to analyze certificate: {str(e)}"
                )
        
        return router

