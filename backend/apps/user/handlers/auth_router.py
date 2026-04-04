# coding=utf-8
"""`/vault/auth/*`：验证码注册、邮箱登录、JWT 刷新与个人资料。"""
from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from apps.user.services.auth_service import AuthService

router = APIRouter()
_bearer = HTTPBearer(auto_error=False)


def _ok(data: object | None = None, message: str = "OK") -> JSONResponse:
    return JSONResponse(content={"code": 200, "message": message, "data": data}, status_code=200)


def _err(http_status: int, message: str, biz_code: int = 400) -> JSONResponse:
    return JSONResponse(
        content={"code": biz_code, "message": message, "data": None},
        status_code=http_status,
    )


def get_auth_service(request: Request) -> AuthService:
    svc = getattr(request.app.state, "auth_service", None)
    if svc is None:
        raise HTTPException(status_code=503, detail="auth_service not ready")
    return svc


class SendCodeBody(BaseModel):
    email: str = Field(min_length=3, max_length=255)


class SignupBody(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    verification_code: str = Field(min_length=4, max_length=16)
    display_name: Optional[str] = Field(default=None, max_length=255)


class LoginEmailBody(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class RefreshBody(BaseModel):
    refresh_token: str = Field(min_length=10)


class UpdateProfileBody(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=255)
    avatar_image_id: Optional[str] = Field(default=None, max_length=36)


class UpdatePasswordBody(BaseModel):
    old_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


def _current_user_id(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(_bearer)],
    auth: AuthService = Depends(get_auth_service),
) -> str:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="未登录")
    uid = auth.verify_access_token(credentials.credentials)
    if not uid:
        raise HTTPException(status_code=401, detail="令牌无效或已过期")
    return uid


@router.post("/signup/send-code")
async def send_signup_code(
    body: SendCodeBody,
    auth: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    ok, msg = auth.send_signup_code(body.email)
    if not ok:
        return _err(400, msg)
    return _ok(None, msg)


@router.post("/signup")
async def signup(
    body: SignupBody,
    auth: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    data, msg = auth.signup(
        body.email,
        body.password,
        body.verification_code,
        body.display_name,
    )
    if not data:
        return _err(400, msg)
    return _ok(data, msg)


@router.post("/login/email")
async def login_email(
    body: LoginEmailBody,
    auth: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    data, msg = auth.login(body.email, body.password)
    if not data:
        return _err(401, msg, biz_code=401)
    return _ok(data, msg)


@router.post("/refresh")
async def refresh_tokens(
    body: RefreshBody,
    auth: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    data, msg = auth.refresh(body.refresh_token)
    if not data:
        return _err(401, msg, biz_code=401)
    return _ok(data, msg)


@router.get("/me")
async def get_me(
    user_id: Annotated[str, Depends(_current_user_id)],
    auth: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    """当前用户资料；Bearer 访问。供前端启动时校验会话（角色同 Pqttec-Admin `check-login`）。"""
    data, msg = auth.me(user_id)
    if not data:
        return _err(404, msg)
    return _ok(data, msg)


@router.post("/avatar/upload")
async def upload_avatar_tmp(
    user_id: Annotated[str, Depends(_current_user_id)],
    auth: AuthService = Depends(get_auth_service),
    file: UploadFile = File(...),
) -> JSONResponse:
    """上传至 tmp 并写入 vault_images；PUT /me 传 `avatar_image_id` 后移至 avatar/（与 Pqttec image_id 流程一致）。"""
    raw = await file.read()
    image_id, msg = auth.save_avatar_tmp(user_id, file.filename or "avatar.bin", raw)
    if not image_id:
        return _err(400, msg)
    return _ok({"image_id": image_id}, msg)


@router.put("/me")
async def update_me(
    body: UpdateProfileBody,
    user_id: Annotated[str, Depends(_current_user_id)],
    auth: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    patch = body.model_dump(exclude_unset=True)
    data, msg = auth.update_profile_patch(user_id, patch)
    if not data:
        return _err(400, msg)
    return _ok(data, msg)


@router.put("/me/password")
async def update_password(
    body: UpdatePasswordBody,
    user_id: Annotated[str, Depends(_current_user_id)],
    auth: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    ok, msg = auth.update_password(user_id, body.old_password, body.new_password)
    if not ok:
        return _err(400, msg)
    return _ok(None, msg)
