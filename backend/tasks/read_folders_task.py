# coding=utf-8
"""定时：读取证书目录入库。"""
from __future__ import annotations

import logging
from typing import Any

from apps.file.services.file_service import FileService

logger = logging.getLogger(__name__)


async def read_folders_job(file_application: FileService, store: str) -> dict[str, Any]:
    try:
        result = await file_application.read_folders_and_store_certificates(store)
        logger.info("read_folders_job store=%s processed=%s", store, result.get("processed", 0))
        return result
    except Exception as e:  # noqa: BLE001
        logger.error("read_folders_job: %s", e, exc_info=True)
        return {"success": False, "message": str(e), "processed": 0}
