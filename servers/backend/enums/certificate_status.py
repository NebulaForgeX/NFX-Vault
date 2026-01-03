# coding=utf-8

"""
证书申请状态枚举

定义证书申请的状态类型
"""
from enum import Enum


class CertificateStatus(str, Enum):
    """证书申请状态枚举"""
    
    SUCCESS = "success"  # 申请成功
    FAIL = "fail"        # 申请失败
    PROCESS = "process"  # 处理中（用户添加时显示 process）
    
    def __str__(self) -> str:
        return self.value

