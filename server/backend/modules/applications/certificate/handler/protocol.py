# coding=utf-8

"""
Certificate Application Protocol

定义 CertificateApplication 的接口协议，用于类型检查
避免循环导入问题
"""
from __future__ import annotations
from typing import Protocol, Optional

from modules.repositories.database.certificate import CertificateDatabase
from modules.repositories.cache.certificate import CertificateCache
from modules.repositories.pipeline.certificate import CertificatePipeline
from modules.repositories.tls.certificate import TLSCertificateRepository
from modules.configs.database_config import DatabaseConfig


class CertificateAppLike(Protocol):
    """CertificateApplication 接口协议"""
    database_repo: CertificateDatabase
    cache_repo: CertificateCache
    pipeline_repo: Optional[CertificatePipeline]
    tls_repo: Optional[TLSCertificateRepository]
    db_config: Optional[DatabaseConfig]
    base_dir: str

