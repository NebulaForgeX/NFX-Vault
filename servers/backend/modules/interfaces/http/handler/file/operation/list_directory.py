# coding=utf-8

"""
列出目录 Operation
"""
import logging
from modules.applications.file import FileApplication
from modules.interfaces.http.dto.reqdto.file import ListDirectoryRequest

logger = logging.getLogger(__name__)


def list_directory(
    app: FileApplication,
    request: ListDirectoryRequest
):
    """
    列出目录内容
    
    Args:
        app: FileApplication 实例
        request: 列出目录请求 DTO
    
    Returns:
        目录内容
    """
    return app.list_directory(request.store, request.subpath)

