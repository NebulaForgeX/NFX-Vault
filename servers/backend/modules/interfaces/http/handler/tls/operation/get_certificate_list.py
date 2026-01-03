# coding=utf-8

"""
获取证书列表 Operation
"""
import logging
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import GetCertificateListRequest

logger = logging.getLogger(__name__)


def get_certificate_list(
    app: CertificateApplication,
    request: GetCertificateListRequest
):
    """
    获取证书列表
    
    Args:
        app: CertificateApplication 实例
        request: 获取证书列表请求 DTO
    
    Returns:
        证书列表
    """
    return app.get_certificate_list(
        store=request.store,
        offset=request.offset,
        limit=request.limit,
        use_cache=True
    )

