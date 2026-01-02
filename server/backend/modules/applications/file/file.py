# coding=utf-8

"""
文件服务应用层（Application）

MVC 架构 - Application 层
负责文件操作业务逻辑
"""
import logging
from typing import Optional, Dict, Any

from modules.repositories.database.certificate import CertificateDatabase
from modules.configs.database_config import DatabaseConfig

from .handler import export_certificates, export_single_certificate, read_folders_and_store_certificates, list_directory, download_file, get_file_content, delete_folder, delete_file_or_folder

logger = logging.getLogger(__name__)


class FileApplication:
    """文件服务应用层"""
    
    def __init__(
        self,
        base_dir: str,
        database_repo: Optional[CertificateDatabase] = None,
        db_config: Optional[DatabaseConfig] = None
    ):
        """
        初始化文件服务应用层
        
        Args:
            base_dir: 基础目录路径
            database_repo: 数据库仓库（可选）
            db_config: 数据库配置（可选）
        """
        self.base_dir = base_dir
        self.database_repo = database_repo
        self.db_config = db_config
        
        logger.info(f"📁 FileApplication initialized with base_dir: {base_dir}")
    
    def export_certificates(self, store: str) -> Dict[str, Any]:
        """导出证书到文件"""
        return export_certificates(self, store)
    
    def export_single_certificate(self, certificate_id: str, store: str) -> Dict[str, Any]:
        """导出单个证书到指定文件夹"""
        return export_single_certificate(self, certificate_id, store)
    
    async def read_folders_and_store_certificates(
        self,
        store: str
    ) -> Dict[str, Any]:
        """读取文件夹并存储证书"""
        return await read_folders_and_store_certificates(self, store)
    
    def list_directory(
        self,
        store: str,
        subpath: Optional[str] = None
    ) -> Dict[str, Any]:
        """列出目录内容"""
        return list_directory(self, store, subpath)
    
    def download_file(
        self,
        store: str,
        file_path: str
    ) -> Dict[str, Any]:
        """下载文件"""
        return download_file(self, store, file_path)
    
    def get_file_content(
        self,
        store: str,
        file_path: str
    ) -> Dict[str, Any]:
        """获取文件内容（文本格式）"""
        return get_file_content(self, store, file_path)
    
    def delete_folder(
        self,
        store: str,
        folder_name: str
    ) -> Dict[str, Any]:
        """删除证书文件夹"""
        return delete_folder(self, store, folder_name)
    
    def delete_file_or_folder(
        self,
        store: str,
        path: str,
        item_type: str
    ) -> Dict[str, Any]:
        """删除文件或文件夹"""
        return delete_file_or_folder(self, store, path, item_type)

