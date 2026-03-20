# coding=utf-8
"""`/vault/file/*` 路由。"""
from __future__ import annotations

import logging
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from apps.file.dto.file_request_dto import DeleteFileOrFolderRequest, ExportSingleCertificateRequest
from apps.file.services.file_service import FileService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vault/file", tags=["file"])


class FileStore(str, Enum):
    websites = "websites"
    apis = "apis"


def get_file_service(request: Request) -> FileService:
    s = getattr(request.app.state, "file_service", None)
    if s is None:
        raise HTTPException(status_code=503, detail="file_service not ready")
    return s


@router.post("/export/{store}")
async def export_certificates_endpoint(
    store: FileStore,
    svc: FileService = Depends(get_file_service),
) -> dict:
    try:
        return svc.export_certificates(store.value)
    except Exception as e:  # noqa: BLE001
        logger.exception("export_certificates")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/export-single")
async def export_single_certificate_endpoint(
    req: ExportSingleCertificateRequest,
    svc: FileService = Depends(get_file_service),
) -> dict:
    try:
        return svc.export_single_certificate(req.certificate_id, req.store)
    except Exception as e:  # noqa: BLE001
        logger.exception("export_single")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/list/{store}")
async def list_directory_endpoint(
    store: FileStore,
    path: Optional[str] = None,
    svc: FileService = Depends(get_file_service),
) -> dict:
    try:
        return svc.list_directory(store.value, subpath=path)
    except Exception as e:  # noqa: BLE001
        logger.exception("list_directory")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/download/{store}")
async def download_file_endpoint(
    store: FileStore,
    path: str,
    svc: FileService = Depends(get_file_service),
) -> Response:
    try:
        result = svc.download_file(store.value, path)
        if result.get("success") and result.get("content") is not None:
            return Response(
                content=result["content"],
                media_type=result.get("mime_type", "application/octet-stream"),
                headers={
                    "Content-Disposition": f'attachment; filename="{result.get("filename", "file")}"'
                },
            )
        raise HTTPException(status_code=404, detail=result.get("message", "File not found"))
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        logger.exception("download_file")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/content/{store}")
async def get_file_content_endpoint(
    store: FileStore,
    path: str,
    svc: FileService = Depends(get_file_service),
) -> dict:
    try:
        return svc.get_file_content(store.value, path)
    except Exception as e:  # noqa: BLE001
        logger.exception("get_file_content")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.delete("/delete")
async def delete_file_or_folder_endpoint(
    req: DeleteFileOrFolderRequest,
    svc: FileService = Depends(get_file_service),
) -> dict:
    try:
        return svc.delete_file_or_folder_via_kafka(req.store, req.path, req.item_type)
    except Exception as e:  # noqa: BLE001
        logger.exception("delete_file_or_folder")
        raise HTTPException(status_code=500, detail=str(e)) from e
