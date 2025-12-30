# coding=utf-8

"""
分析 TLS 证书 Operation
"""
import logging
from modules.applications.analysis import AnalysisApplication
from modules.interfaces.http.dto.reqdto.analysis import AnalyzeTLSRequest

logger = logging.getLogger(__name__)


def analyze_tls_certificate(
    app: AnalysisApplication,
    request: AnalyzeTLSRequest
):
    """
    分析 TLS 证书
    
    Args:
        app: AnalysisApplication 实例
        request: 分析请求 DTO
    
    Returns:
        分析结果
    """
    return app.analyze_tls_certificate(
        certificate=request.certificate,
        private_key=request.private_key
    )

