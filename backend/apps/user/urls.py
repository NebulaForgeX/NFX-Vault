from fastapi import APIRouter

from apps.user.handlers.auth_router import router as auth_handlers
from apps.user.handlers.image_serve_router import router as image_serve_router

user_router = APIRouter(prefix="/vault/auth", tags=["auth"])
user_router.include_router(auth_handlers)

__all__ = ["user_router", "image_serve_router"]
