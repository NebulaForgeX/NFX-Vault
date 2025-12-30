# coding=utf-8

"""
文件服务 HTTP 处理器

处理文件相关的 HTTP 请求
"""
import logging
from typing import Optional

from modules.applications.file import FileApplication

logger = logging.getLogger(__name__)


class FileHTTPHandler:
    """文件服务 HTTP 处理器"""
    
    def __init__(self, file_application: FileApplication):
        """初始化 HTTP 处理器"""
        self.file_application = file_application
        logger.info("✅ FileHTTPHandler initialized")
    
    def export_certificates(self, store: str):  # 存储位置（websites 或 apis）
        """导出证书到文件"""
        logger.info(f"📤 HTTP 请求导出证书: store={store}")
        return self.file_application.export_certificates(store)
    
    def list_directory(self, store: str, subpath: Optional[str] = None):
        """列出目录内容"""
        return self.file_application.list_directory(store, subpath)
    
    def download_file(self, store: str, file_path: str):
        """下载文件"""
        return self.file_application.download_file(store, file_path)
    
    def get_file_content(self, store: str, file_path: str):
        """获取文件内容（文本格式）"""
        return self.file_application.get_file_content(store, file_path)