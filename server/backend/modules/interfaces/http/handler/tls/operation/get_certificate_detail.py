# coding=utf-8

"""
获取证书详情 Operation
"""
import logging
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import GetCertificateDetailRequest

logger = logging.getLogger(__name__)


def get_certificate_detail(
    app: CertificateApplication,
    request: GetCertificateDetailRequest
):
    """
    获取证书详情
    
    Args:
        app: CertificateApplication 实例
        request: 获取证书详情请求 DTO
    
    Returns:
        证书详情，如果不存在则返回 None
    """
    return app.get_certificate_detail(
        store=request.store,
        domain=request.domain,
        source=request.source,
        use_cache=True
    )

