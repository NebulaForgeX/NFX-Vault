# coding=utf-8

"""
证书来源枚举

定义证书的来源类型
"""
from enum import Enum


class CertificateSource(str, Enum):
    """证书来源枚举"""
    
    AUTO = "auto"      # 自动发现（从文件夹读取时自动创建的证书）
    MANUAL = "manual"  # 手动操作（用户主动申请的证书或手动上传的证书文件）
    
    def __str__(self) -> str:
        return self.value

