# coding=utf-8

"""
创建证书 Operation
"""
import logging
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import CreateCertificateRequest

logger = logging.getLogger(__name__)


def create_certificate(
    app: CertificateApplication,
    request: CreateCertificateRequest
):
    """
    创建证书（手动添加）
    
    Args:
        app: CertificateApplication 实例
        request: 创建证书请求 DTO
    
    Returns:
        创建结果
    """
    return app.create_certificate(
        store=request.store,
        domain=request.domain,
        certificate=request.certificate,
        private_key=request.private_key,
        sans=request.sans,
        folder_name=request.folder_name,
        email=request.email,
        issuer=request.issuer
    )

