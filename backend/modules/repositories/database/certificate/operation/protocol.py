# coding=utf-8

"""
Certificate Database Repository Protocol

定义 CertificateDatabase 的接口协议，用于类型检查
避免循环导入问题
"""
from __future__ import annotations
from typing import Protocol, Optional


class CertificateDatabaseLike(Protocol):
    """CertificateDatabase 接口协议"""
    db_session: Optional[object]

