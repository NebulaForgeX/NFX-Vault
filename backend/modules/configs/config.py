"""
配置管理模块

返回证书管理配置和数据库配置
"""
from typing import Tuple
from .cert_config import load_cert_config
from .database_config import load_database_config
from .types import CertConfig, DatabaseConfig


def load_config() -> Tuple[CertConfig, DatabaseConfig]:
    """
    返回证书管理配置和数据库配置（可通过点号访问，IDE 有完整类型提示）
    
    Returns:
        Tuple[CertConfig, DatabaseConfig]: (证书管理配置, 数据库配置)
    """
    return load_cert_config(), load_database_config()

