# coding=utf-8

"""
搜索证书 Operation
"""
import logging
from fastapi import HTTPException
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import SearchCertificateRequest

logger = logging.getLogger(__name__)


def search_certificate(
    app: CertificateApplication,
    request: SearchCertificateRequest
):
    """
    搜索证书
    
    Args:
        app: CertificateApplication 实例
        request: 搜索证书请求 DTO
    
    Returns:
        搜索结果
    """
    # 验证 keyword
    if not request.keyword or not request.keyword.strip():
        raise HTTPException(status_code=400, detail="Keyword is required")
    
    return app.search_certificate(
        keyword=request.keyword.strip(),
        store=request.store,
        source=request.source,
        page=request.page,
        page_size=request.page_size
    )

