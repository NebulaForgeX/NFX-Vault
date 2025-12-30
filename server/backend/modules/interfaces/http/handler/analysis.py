# coding=utf-8

"""
分析 HTTP 处理器

处理 TLS 证书分析相关的 HTTP 请求
"""
import logging
from typing import Optional

from modules.applications.analysis import AnalysisApplication

logger = logging.getLogger(__name__)


class AnalysisHTTPHandler:
    """分析 HTTP 处理器"""
    def __init__(self, analysis_application: AnalysisApplication):
        self.analysis_application = analysis_application
    
    def analyze_tls_certificate(
        self,
        certificate: str,
        private_key: Optional[str] = None
    ):
        """
        分析 TLS 证书
        
        Args:
            certificate: 证书内容（PEM格式）
            private_key: 私钥内容（PEM格式，可选）
        
        Returns:
            分析结果
        """
        return self.analysis_application.analyze_tls_certificate(
            certificate=certificate,
            private_key=private_key
        )

