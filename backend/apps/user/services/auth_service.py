# coding=utf-8
from __future__ import annotations

import logging
import mimetypes
import re
import uuid
from pathlib import Path
from typing import Any, Optional

import bcrypt
from sqlalchemy.exc import IntegrityError

from apps.user.models.vault_user import VaultUser
from apps.user.repos.image_repository import ImageRepository
from apps.user.repos.user_repository import UserRepository
from apps.user.services.avatar_storage import AvatarStorageService
from apps.user.services.jwt_tokens import JwtTokenService, TokenPair
from apps.user.services.mail_sender import SmtpMailSender, build_verification_email_html
from apps.user.services.verification_code import VerificationCodeService
from config.types import AuthConfig

logger = logging.getLogger(__name__)

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AuthService:
    def __init__(
        self,
        auth_config: AuthConfig,
        users: UserRepository,
        codes: VerificationCodeService,
        mail: SmtpMailSender,
        jwt_svc: JwtTokenService,
        avatars: AvatarStorageService,
        images: ImageRepository,
    ) -> None:
        self._cfg = auth_config
        self._users = users
        self._codes = codes
        self._mail = mail
        self._jwt = jwt_svc
        self._avatars = avatars
        self._images = images

    def send_signup_code(self, email: str) -> tuple[bool, str]:
        email = (email or "").strip().lower()
        if not _EMAIL_RE.match(email):
            return False, "邮箱格式无效"
        code = self._codes.generate_code()
        if not self._codes.save_code(email, code):
            return False, "验证码保存失败，请检查 Redis"
        try:
            self._mail.send_html(
                email,
                "NFX-Vault 邮箱验证码",
                build_verification_email_html(code),
            )
        except Exception as e:  # noqa: BLE001
            logger.exception("发送邮件失败")
            return False, f"邮件发送失败: {e!s}"
        return True, "OK"

    def signup(
        self,
        email: str,
        password: str,
        verification_code: str,
        display_name: Optional[str] = None,
    ) -> tuple[Optional[dict[str, Any]], str]:
        email = (email or "").strip().lower()
        if not _EMAIL_RE.match(email):
            return None, "邮箱格式无效"
        if len(password or "") < 8:
            return None, "密码至少 8 位"
        if not verification_code:
            return None, "请填写验证码"
        if not self._codes.verify_and_consume(email, verification_code.strip()):
            return None, "验证码无效或已过期"
        if self._users.get_by_email(email):
            return None, "该邮箱已注册"
        name = (display_name or "").strip() or email.split("@")[0]
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user = VaultUser(
            email=email,
            password_hash=hashed,
            display_name=name[:255],
            avatar_image_id=None,
            is_active=True,
        )
        try:
            self._users.create(user)
        except IntegrityError:
            logger.warning("signup duplicate email (race or retry): %s", email)
            return None, "该邮箱已注册"
        pair = self._jwt.issue_pair(user.id, user.email, user.display_name)
        return self._login_payload(user, pair), "OK"

    def login(self, email: str, password: str) -> tuple[Optional[dict[str, Any]], str]:
        email = (email or "").strip().lower()
        user = self._users.get_by_email(email)
        if not user or not user.is_active:
            return None, "邮箱或密码错误"
        try:
            ok = bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8"))
        except ValueError:
            return None, "邮箱或密码错误"
        if not ok:
            return None, "邮箱或密码错误"
        pair = self._jwt.issue_pair(user.id, user.email, user.display_name)
        return self._login_payload(user, pair), "OK"

    def refresh(self, refresh_token: str) -> tuple[Optional[dict[str, Any]], str]:
        try:
            payload = self._jwt.decode_refresh(refresh_token)
        except Exception:  # noqa: BLE001
            return None, "刷新令牌无效"
        uid = payload.get("sub")
        if not uid:
            return None, "刷新令牌无效"
        user = self._users.get_by_id(uid)
        if not user or not user.is_active:
            return None, "用户不可用"
        pair = self._jwt.issue_pair(user.id, user.email, user.display_name)
        return {
            "token": pair.access_token,
            "refresh_token": pair.refresh_token,
        }, "OK"

    def me(self, user_id: str) -> tuple[Optional[dict[str, Any]], str]:
        user = self._users.get_by_id(user_id)
        if not user or not user.is_active:
            return None, "用户不存在"
        return user.to_public_dict(), "OK"

    def save_avatar_tmp(self, user_id: str, filename: str, raw: bytes) -> tuple[Optional[str], str]:
        rel, msg = self._avatars.save_tmp_file(user_id, filename, raw)
        if not rel:
            return None, msg
        image_id = str(uuid.uuid4())
        mime, _enc = mimetypes.guess_type(filename or "")
        if not mime:
            ext = Path(filename or "").suffix.lower()
            mime = {
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".gif": "image/gif",
                ".webp": "image/webp",
            }.get(ext, "application/octet-stream")
        self._images.create(
            image_id=image_id,
            file_path=rel,
            mime_type=mime,
            uploader_id=user_id,
        )
        return image_id, "OK"

    def _purge_image_row_and_file(self, image_id: str) -> None:
        img = self._images.get_by_id(image_id)
        if not img:
            return
        self._avatars.remove_file_if_under_data(img.file_path)
        self._images.delete_by_id(image_id)

    def update_profile_patch(self, user_id: str, patch: dict[str, Any]) -> tuple[Optional[dict[str, Any]], str]:
        """与 Pqttec 一致：上传得 image_id，PUT /me 传 avatar_image_id 后 tmp→avatar 并写用户。"""
        user = self._users.get_by_id(user_id)
        if not user:
            return None, "用户不存在"

        updates: dict[str, object] = {}
        purge_after: list[str] = []
        avatar_noop_same = False

        if "display_name" in patch:
            dn = str(patch.get("display_name") or "").strip()
            if not dn:
                return None, "昵称不能为空"
            updates["display_name"] = dn[:255]

        if "avatar_image_id" in patch:
            raw_av = patch["avatar_image_id"]
            if raw_av is None or (isinstance(raw_av, str) and not raw_av.strip()):
                if user.avatar_image_id:
                    purge_after.append(user.avatar_image_id)
                updates["avatar_image_id"] = None
            else:
                new_id = str(raw_av).strip()
                try:
                    uuid.UUID(new_id)
                except ValueError:
                    return None, "无效的头像图片 ID"
                img = self._images.get_by_id(new_id)
                if not img or img.uploader_id != user_id:
                    return None, "无效的头像图片"
                rel = (img.file_path or "").replace("\\", "/")
                if rel.startswith("avatar/"):
                    if user.avatar_image_id == new_id:
                        avatar_noop_same = True
                    else:
                        return None, "无效的图片状态"
                elif rel.startswith("tmp/"):
                    new_rel, msg = self._avatars.move_tmp_to_avatar(user_id, rel)
                    if not new_rel:
                        return None, msg
                    if not self._images.update_file_path(new_id, new_rel):
                        return None, "更新图片记录失败"
                    if user.avatar_image_id and user.avatar_image_id != new_id:
                        purge_after.append(user.avatar_image_id)
                    updates["avatar_image_id"] = new_id
                else:
                    return None, "无效的图片路径"

        if not updates:
            if avatar_noop_same:
                return user.to_public_dict(), "OK"
            return None, "没有要更新的字段"

        updated = self._users.update_fields(user_id, **updates)
        if not updated:
            return None, "用户不存在"
        for oid in purge_after:
            self._purge_image_row_and_file(oid)
        return updated.to_public_dict(), "OK"

    def update_password(self, user_id: str, old_password: str, new_password: str) -> tuple[bool, str]:
        if len(new_password or "") < 8:
            return False, "新密码至少 8 位"
        user = self._users.get_by_id(user_id)
        if not user:
            return False, "用户不存在"
        if not bcrypt.checkpw(old_password.encode("utf-8"), user.password_hash.encode("utf-8")):
            return False, "原密码错误"
        hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        self._users.update_fields(user_id, password_hash=hashed)
        return True, "OK"

    def verify_access_token(self, token: str) -> Optional[str]:
        try:
            payload = self._jwt.decode_access(token)
            uid = payload.get("sub")
            return uid if isinstance(uid, str) else None
        except Exception:  # noqa: BLE001
            return None

    def _login_payload(self, user: VaultUser, pair: TokenPair) -> dict[str, Any]:
        return {
            "token": pair.access_token,
            "refresh_token": pair.refresh_token,
            "user": user.to_public_dict(),
        }
