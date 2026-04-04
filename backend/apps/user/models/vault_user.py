# coding=utf-8
"""Vault 登录用户表（无角色、无邀请码）。"""
from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Column, DateTime, Index, String, Text, func
from sqlalchemy.dialects.mysql import CHAR

from apps.certificate.models.base import Base


class VaultUser(Base):
    __tablename__ = "vault_users"
    __table_args__ = (
        Index("idx_vault_users_email", "email"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)
    avatar_image_id = Column(CHAR(36), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_public_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "avatar_image_id": self.avatar_image_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
