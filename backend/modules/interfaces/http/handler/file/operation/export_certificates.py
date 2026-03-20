# coding=utf-8

"""
导出证书 Operation
"""
import logging
from modules.applications.file import FileApplication
from modules.interfaces.http.dto.reqdto.file import ExportCertificatesRequest

logger = logging.getLogger(__name__)


def export_certificates(
    app: FileApplication,
    request: ExportCertificatesRequest
):
    """
    导出证书到文件
    
    Args:
        app: FileApplication 实例
        request: 导出证书请求 DTO
    
    Returns:
        导出结果
    """
    logger.info(f"📤 HTTP 请求导出证书: store={request.store}")
    return app.export_certificates(request.store)

