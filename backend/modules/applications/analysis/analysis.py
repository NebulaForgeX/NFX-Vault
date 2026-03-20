# coding=utf-8

"""
TLS 分析应用层（Application）

MVC 架构 - Application 层
负责 TLS 证书分析业务逻辑
"""
import logging
from typing import Dict, Any, Optional

from .handler import analyze_tls_certificate

logger = logging.getLogger(__name__)


class AnalysisApplication:
    """TLS 分析应用层"""
    
    def __init__(self):
        """
        初始化分析应用层
        """
        logger.info("📊 AnalysisApplication initialized")
    
    def analyze_tls_certificate(
        self,
        certificate: str,
        private_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        分析 TLS 证书
        
        Args:
            certificate: 证书内容（PEM格式）
            private_key: 私钥内容（PEM格式，可选）
        
        Returns:
            分析结果（包含证书信息、解析结果等）
        """
        return analyze_tls_certificate(self, certificate, private_key)

