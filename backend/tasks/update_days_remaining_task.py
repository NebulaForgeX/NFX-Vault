# coding=utf-8
"""定时：仅按 not_after 批量更新剩余天数与 is_valid（不触发 certbot / 续签）。"""
from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def update_days_remaining_job(database_repo) -> dict[str, Any]:
    try:
        updated_count, total_count, _certificates = database_repo.update_all_days_remaining()
        logger.info("update_days_remaining: %s/%s", updated_count, total_count)
        return {
            "success": True,
            "message": f"Updated {updated_count}/{total_count} certificates",
            "updated": updated_count,
            "total": total_count,
        }
    except Exception as e:  # noqa: BLE001
        logger.error("update_days_remaining_job: %s", e, exc_info=True)
        return {"success": False, "message": str(e), "updated": 0, "total": 0}
