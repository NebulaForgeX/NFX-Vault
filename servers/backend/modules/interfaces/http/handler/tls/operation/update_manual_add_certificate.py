# coding=utf-8

"""
更新手动添加证书 Operation
"""
import logging
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import UpdateManualAddCertificateRequest

logger = logging.getLogger(__name__)


def update_manual_add_certificate(
    app: CertificateApplication,
    request: UpdateManualAddCertificateRequest
):
    """
    更新手动添加的证书（MANUAL_ADD）
    
    Args:
        app: CertificateApplication 实例
        request: 更新证书请求 DTO
    
    Returns:
        更新结果
    """
    return app.update_manual_add_certificate(
        certificate_id=request.certificate_id,
        certificate=request.certificate,
        private_key=request.private_key,
        store=request.store,
        sans=request.sans,
        folder_name=request.folder_name,
        email=request.email
    )

