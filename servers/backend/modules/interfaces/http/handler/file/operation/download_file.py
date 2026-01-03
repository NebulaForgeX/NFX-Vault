# coding=utf-8

"""
下载文件 Operation
"""
import logging
from modules.applications.file import FileApplication
from modules.interfaces.http.dto.reqdto.file import DownloadFileRequest

logger = logging.getLogger(__name__)


def download_file(
    app: FileApplication,
    request: DownloadFileRequest
):
    """
    下载文件
    
    Args:
        app: FileApplication 实例
        request: 下载文件请求 DTO
    
    Returns:
        文件内容
    """
    return app.download_file(request.store, request.file_path)

