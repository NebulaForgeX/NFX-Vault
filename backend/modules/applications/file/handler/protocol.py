# coding=utf-8

"""
文件服务协议定义

定义 FileApplication 需要实现的接口
"""
from typing import Protocol, Optional
from modules.repositories.database.certificate import CertificateDatabase
from modules.configs.database_config import DatabaseConfig


class FileAppLike(Protocol):
    """文件服务应用层协议"""
    
    base_dir: str
    database_repo: Optional[CertificateDatabase]
    db_config: Optional[DatabaseConfig]

