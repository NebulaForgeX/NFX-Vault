# coding=utf-8
from __future__ import annotations

from typing import Optional

from sqlalchemy import delete, select

from apps.user.models.vault_image import VaultImage
from utils.postgres.session import PostgresSession


class ImageRepository:
    def __init__(self, db: PostgresSession) -> None:
        self._db = db

    def create(
        self,
        *,
        image_id: str,
        file_path: str,
        mime_type: str,
        uploader_id: str,
    ) -> VaultImage:
        if not self._db.enable_db:
            raise RuntimeError("PostgreSQL 未启用")
        row = VaultImage(
            id=image_id,
            file_path=file_path,
            mime_type=mime_type,
            uploader_id=uploader_id,
        )
        with self._db.get_session() as sess:
            sess.add(row)
            sess.flush()
            sess.refresh(row)
            sess.expunge(row)
        return row

    def get_by_id(self, image_id: str) -> Optional[VaultImage]:
        if not self._db.enable_db:
            return None
        with self._db.get_session() as sess:
            row = sess.get(VaultImage, image_id)
            if row is not None:
                sess.expunge(row)
            return row

    def update_file_path(self, image_id: str, file_path: str) -> bool:
        if not self._db.enable_db:
            return False
        with self._db.get_session() as sess:
            row = sess.get(VaultImage, image_id)
            if not row:
                return False
            row.file_path = file_path
            sess.flush()
            return True

    def delete_by_id(self, image_id: str) -> None:
        if not self._db.enable_db:
            return
        with self._db.get_session() as sess:
            sess.execute(delete(VaultImage).where(VaultImage.id == image_id))
