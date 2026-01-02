# coding=utf-8

"""
删除证书 Operation
"""
import logging
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import DeleteCertificateRequest

logger = logging.getLogger(__name__)


def delete_certificate(
    app: CertificateApplication,
    request: DeleteCertificateRequest
):
    """
    删除证书
    
    Args:
        app: CertificateApplication 实例
        request: 删除证书请求 DTO
    
    Returns:
        删除结果
    """
    return app.delete_certificate(
        certificate_id=request.certificate_id
    )

