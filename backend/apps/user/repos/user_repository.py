# coding=utf-8
from __future__ import annotations

from typing import Optional

from sqlalchemy import func, select
from apps.user.models.vault_user import VaultUser
from utils.mysql.session import MySQLSession


class UserRepository:
    def __init__(self, mysql: MySQLSession) -> None:
        self._mysql = mysql

    def get_by_email(self, email: str) -> Optional[VaultUser]:
        if not self._mysql.enable_mysql:
            return None
        normalized = (email or "").strip().lower()
        if not normalized:
            return None
        with self._mysql.get_session() as sess:
            # 与写入时 lower() 一致；兼容历史上大小写/首尾空格不一致的行
            row = sess.execute(
                select(VaultUser).where(func.lower(func.trim(VaultUser.email)) == normalized),
            ).scalar_one_or_none()
            if row is not None:
                sess.expunge(row)
            return row

    def get_by_id(self, user_id: str) -> Optional[VaultUser]:
        if not self._mysql.enable_mysql:
            return None
        with self._mysql.get_session() as sess:
            u = sess.get(VaultUser, user_id)
            if u is not None:
                sess.expunge(u)
            return u

    def create(self, user: VaultUser) -> None:
        if not self._mysql.enable_mysql:
            raise RuntimeError("MySQL 未启用")
        with self._mysql.get_session() as sess:
            sess.add(user)
            sess.flush()
            sess.refresh(user)
            sess.expunge(user)

    def update_fields(self, user_id: str, **fields: object) -> Optional[VaultUser]:
        if not self._mysql.enable_mysql:
            return None
        with self._mysql.get_session() as sess:
            u = sess.get(VaultUser, user_id)
            if not u:
                return None
            for k, v in fields.items():
                if hasattr(u, k):
                    setattr(u, k, v)
            sess.flush()
            sess.refresh(u)
            sess.expunge(u)
            return u
