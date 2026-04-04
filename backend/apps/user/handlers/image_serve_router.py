# coding=utf-8
"""公开 GET 头像/图片二进制：与 Pqttec ServeFile 一致，仅允许已落盘到 `avatar/` 的路径。"""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse

router = APIRouter(prefix="/vault/images", tags=["images"])


@router.get("/{image_id}/file")
async def serve_vault_image_file(image_id: str, request: Request) -> FileResponse:
    try:
        uuid.UUID(image_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found") from None
    repo = getattr(request.app.state, "image_repository", None)
    data_dir = getattr(request.app.state, "vault_data_dir", None)
    if repo is None or not data_dir:
        raise HTTPException(status_code=503, detail="服务未就绪")
    img = repo.get_by_id(image_id)
    if img is None:
        raise HTTPException(status_code=404, detail="Not found")
    rel = (img.file_path or "").strip().replace("\\", "/")
    if not rel.startswith("avatar/"):
        raise HTTPException(status_code=404, detail="Not found")
    root = Path(data_dir).resolve()
    full = (root / rel).resolve()
    try:
        full.relative_to(root)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found") from None
    if not full.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(str(full), media_type=img.mime_type or "application/octet-stream")
