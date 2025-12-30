# coding=utf-8

"""
获取文件内容 Operation
"""
import logging
from modules.applications.file import FileApplication
from modules.interfaces.http.dto.reqdto.file import GetFileContentRequest

logger = logging.getLogger(__name__)


def get_file_content(
    app: FileApplication,
    request: GetFileContentRequest
):
    """
    获取文件内容（文本格式）
    
    Args:
        app: FileApplication 实例
        request: 获取文件内容请求 DTO
    
    Returns:
        文件内容
    """
    return app.get_file_content(request.store, request.file_path)

