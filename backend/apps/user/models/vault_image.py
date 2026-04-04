# coding=utf-8
"""上传图片元数据（与 Pqttec Images 表角色一致）：tmp → avatar 后只保留最终 file_path。"""
from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, Index, String, func
from sqlalchemy.dialects.mysql import CHAR

from apps.certificate.models.base import Base


class VaultImage(Base):
    __tablename__ = "vault_images"
    __table_args__ = (
        Index("idx_vault_images_uploader", "uploader_id"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_path = Column(String(512), nullable=False)
    mime_type = Column(String(128), nullable=False)
    uploader_id = Column(CHAR(36), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
