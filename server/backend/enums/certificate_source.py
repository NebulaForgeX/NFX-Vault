# coding=utf-8

"""
证书来源枚举

定义证书的来源类型
"""
from enum import Enum


class CertificateSource(str, Enum):
    """证书来源枚举"""
    
    AUTO = "auto"      # 自动申请（从文件夹读取时创建新的才是 auto，update 保持原有 source）
    MANUAL = "manual"  # 手动添加的证书
    
    def __str__(self) -> str:
        return self.value

