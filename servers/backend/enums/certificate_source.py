# coding=utf-8

"""
证书来源枚举

定义证书的来源类型
"""
from enum import Enum


class CertificateSource(str, Enum):
    """证书来源枚举"""
    
    AUTO = "auto"              # 自动发现（从文件夹读取时自动创建的证书，所有信息都无法编辑）
    MANUAL_APPLY = "manual_apply"  # 手动申请（用户通过 Let's Encrypt 申请的证书，只能编辑 folder_name）
    MANUAL_ADD = "manual_add"      # 手动添加（用户手动上传的证书文件，所有信息都可以编辑）
    
    def __str__(self) -> str:
        return self.value

