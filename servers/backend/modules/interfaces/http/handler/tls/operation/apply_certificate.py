# coding=utf-8

"""
申请证书 Operation
"""
import logging
from fastapi import HTTPException
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import ApplyCertificateRequest

logger = logging.getLogger(__name__)


def apply_certificate(
    app: CertificateApplication,
    request: ApplyCertificateRequest
):
    """
    申请 Let's Encrypt 证书（统一存储在 database）
    
    Args:
        app: CertificateApplication 实例
        request: 申请证书请求 DTO
    
    Returns:
        申请结果
    """
    # 验证 email 格式
    if not request.email or "@" not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    
    # 检查 TLS repository 是否初始化
    if not hasattr(app, 'tls_repo') or not app.tls_repo:
        raise HTTPException(status_code=500, detail="TLS repository not initialized")
    
    return app.apply_certificate(
        domain=request.domain,
        email=request.email,
        folder_name=request.folder_name,
        sans=request.sans,
        webroot=request.webroot
    )

