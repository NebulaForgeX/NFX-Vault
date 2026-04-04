# coding=utf-8
from __future__ import annotations

from typing import Optional

from sqlalchemy import delete, select

from apps.user.models.vault_image import VaultImage
from utils.mysql.session import MySQLSession


class ImageRepository:
    def __init__(self, mysql: MySQLSession) -> None:
        self._mysql = mysql

    def create(
        self,
        *,
        image_id: str,
        file_path: str,
        mime_type: str,
        uploader_id: str,
    ) -> VaultImage:
        if not self._mysql.enable_mysql:
            raise RuntimeError("MySQL 未启用")
        row = VaultImage(
            id=image_id,
            file_path=file_path,
            mime_type=mime_type,
            uploader_id=uploader_id,
        )
        with self._mysql.get_session() as sess:
            sess.add(row)
            sess.flush()
            sess.refresh(row)
            sess.expunge(row)
        return row

    def get_by_id(self, image_id: str) -> Optional[VaultImage]:
        if not self._mysql.enable_mysql:
            return None
        with self._mysql.get_session() as sess:
            row = sess.get(VaultImage, image_id)
            if row is not None:
                sess.expunge(row)
            return row

    def update_file_path(self, image_id: str, file_path: str) -> bool:
        if not self._mysql.enable_mysql:
            return False
        with self._mysql.get_session() as sess:
            row = sess.get(VaultImage, image_id)
            if not row:
                return False
            row.file_path = file_path
            sess.flush()
            return True

    def delete_by_id(self, image_id: str) -> None:
        if not self._mysql.enable_mysql:
            return
        with self._mysql.get_session() as sess:
            sess.execute(delete(VaultImage).where(VaultImage.id == image_id))
