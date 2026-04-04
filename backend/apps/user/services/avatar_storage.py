# coding=utf-8
"""本地头像存储：tmp/<user_id>/ 上传，确认后移至 avatar/<user_id>/（与 Pqttec LocalStorage.SaveToTmp + Move 一致，仅保留 tmp/avatar）。"""
from __future__ import annotations

import os
import re
import uuid
from pathlib import Path

import logging

logger = logging.getLogger(__name__)

_ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
_MAX_BYTES = 5 * 1024 * 1024
_TMP_PREFIX = "tmp"
_AVATAR_PREFIX = "avatar"
_TMP_FILE_RE = re.compile(
    r"^tmp/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/([a-f0-9]{32}\.(?:jpg|jpeg|png|gif|webp))$",
    re.IGNORECASE,
)


class AvatarStorageService:
    def __init__(self, data_dir: str) -> None:
        self._root = Path(data_dir).resolve()
        self._tmp_root = self._root / _TMP_PREFIX
        self._avatar_root = self._root / _AVATAR_PREFIX

    def ensure_dirs(self) -> None:
        self._tmp_root.mkdir(parents=True, exist_ok=True)
        self._avatar_root.mkdir(parents=True, exist_ok=True)

    @property
    def avatar_filesystem_dir(self) -> str:
        return str(self._avatar_root)

    def save_tmp_file(self, user_id: str, original_filename: str, raw: bytes) -> tuple[str | None, str]:
        if len(raw) > _MAX_BYTES:
            return None, "图片过大（最大 5MB）"
        ext = Path(original_filename or "").suffix.lower()
        if ext not in _ALLOWED_EXT:
            return None, f"不支持的格式，允许：{', '.join(sorted(_ALLOWED_EXT))}"
        name = f"{uuid.uuid4().hex}{ext}"
        rel = f"{_TMP_PREFIX}/{user_id}/{name}"
        full = self._root / rel
        try:
            full.parent.mkdir(parents=True, exist_ok=True)
            full.write_bytes(raw)
        except OSError as e:
            logger.exception("save_tmp_file")
            return None, f"保存失败: {e!s}"
        return rel.replace("\\", "/"), "OK"

    def validate_tmp_rel_path(self, user_id: str, tmp_rel: str) -> Path | None:
        s = (tmp_rel or "").strip().replace("\\", "/")
        m = _TMP_FILE_RE.match(s)
        if not m or m.group(1) != user_id:
            return None
        full = (self._root / s).resolve()
        try:
            full.relative_to(self._tmp_root.resolve())
        except ValueError:
            return None
        if not full.is_file():
            return None
        return full

    def move_tmp_to_avatar(self, user_id: str, tmp_rel: str) -> tuple[str | None, str]:
        """返回相对路径 `avatar/<user_id>/<file>`（写入 vault_images.file_path），非 URL。"""
        src = self.validate_tmp_rel_path(user_id, tmp_rel)
        if src is None:
            return None, "无效或过期的临时文件"
        filename = src.name
        dest_rel = f"{_AVATAR_PREFIX}/{user_id}/{filename}"
        dest_full = (self._root / dest_rel).resolve()
        try:
            dest_full.parent.mkdir(parents=True, exist_ok=True)
            os.replace(src, dest_full)
        except OSError as e:
            logger.exception("move_tmp_to_avatar")
            return None, f"移动头像失败: {e!s}"
        return dest_rel.replace("\\", "/"), "OK"

    def remove_file_if_under_data(self, rel: str) -> None:
        """删除 `tmp/` 或 `avatar/` 下已登记相对路径对应的文件（路径穿越防护）。"""
        s = (rel or "").strip().replace("\\", "/")
        if not s or ".." in s:
            return
        if not (s.startswith(f"{_TMP_PREFIX}/") or s.startswith(f"{_AVATAR_PREFIX}/")):
            return
        full = (self._root / s).resolve()
        try:
            full.relative_to(self._root.resolve())
        except ValueError:
            return
        try:
            if full.is_file():
                os.remove(full)
        except OSError:
            pass
