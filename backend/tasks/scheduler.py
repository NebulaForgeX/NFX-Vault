# coding=utf-8
"""APScheduler：每日更新证书剩余天数（仅 DB，不读磁盘目录）。"""
from __future__ import annotations

import json
import logging
from typing import Optional

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from apps.certificate.services.certificate_service import CertificateService
from config.types import CertConfig
from tasks.update_days_remaining_task import update_days_remaining_job

logger = logging.getLogger(__name__)


def setup_scheduler(
    cert_config: CertConfig,
    certificate_service: CertificateService,
) -> Optional[BackgroundScheduler]:
    if not cert_config.SCHEDULE_ENABLED:
        logger.info(
            json.dumps(
                {
                    "task": "scheduler",
                    "event": "disabled",
                    "reason": "SCHEDULE_ENABLED=0",
                },
                ensure_ascii=False,
            )
        )
        return None
    scheduler = BackgroundScheduler()
    job_id = "daily_update_days_remaining"
    scheduler.add_job(
        update_days_remaining_job,
        CronTrigger(hour=1, minute=0),
        args=[certificate_service.database_repo],
        id=job_id,
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        json.dumps(
            {
                "task": "scheduler",
                "event": "started",
                "job_id": job_id,
                "cron": {"hour": 1, "minute": 0},
                "description": "update days_remaining from not_after",
            },
            ensure_ascii=False,
        )
    )
    return scheduler


def shutdown_scheduler(scheduler: Optional[BackgroundScheduler]) -> None:
    if scheduler:
        scheduler.shutdown()
        logger.info(
            json.dumps({"task": "scheduler", "event": "shutdown"}, ensure_ascii=False)
        )
