# coding=utf-8

"""
证书存储位置枚举

定义证书的存储位置类型
"""
from enum import Enum


class CertificateStore(str, Enum):
    """证书存储位置枚举"""
    
    WEBSITES = "websites"  # 网站证书
    APIS = "apis"          # API 证书
    DATABASE = "database"  # 数据库存储（申请的证书）
    
    def __str__(self) -> str:
        return self.value

