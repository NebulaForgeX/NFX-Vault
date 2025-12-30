# coding=utf-8

"""
文件服务 HTTP 处理器

处理文件相关的 HTTP 请求
"""
import logging

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
