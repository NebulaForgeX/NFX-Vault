# coding=utf-8
"""APScheduler：周读目录 + 日更剩余天数。"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from apps.certificate.services.certificate_service import CertificateService
from apps.file.services.file_service import FileService
from config.types import CertConfig
from tasks.read_folders_task import read_folders_job
from tasks.update_days_remaining_task import update_days_remaining_job

logger = logging.getLogger(__name__)


def setup_scheduler(
    cert_config: CertConfig,
    file_service: FileService,
    certificate_service: CertificateService,
) -> Optional[BackgroundScheduler]:
    if not cert_config.SCHEDULE_ENABLED:
        logger.info("定时任务已禁用 SCHEDULE_ENABLED=0")
        return None
    scheduler = BackgroundScheduler()

    def run_async_read_folders(file_app: FileService, store: str) -> None:
        asyncio.run(read_folders_job(file_app, store))

    scheduler.add_job(
        run_async_read_folders,
        CronTrigger(
            day_of_week=cert_config.SCHEDULE_WEEKLY_DAY,
            hour=cert_config.SCHEDULE_WEEKLY_HOUR,
            minute=cert_config.SCHEDULE_WEEKLY_MINUTE,
        ),
        args=[file_service, "websites"],
        id="weekly_read_websites",
        replace_existing=True,
    )
    scheduler.add_job(
        run_async_read_folders,
        CronTrigger(
            day_of_week=cert_config.SCHEDULE_WEEKLY_DAY,
            hour=cert_config.SCHEDULE_WEEKLY_HOUR,
            minute=cert_config.SCHEDULE_WEEKLY_MINUTE,
        ),
        args=[file_service, "apis"],
        id="weekly_read_apis",
        replace_existing=True,
    )
    scheduler.add_job(
        update_days_remaining_job,
        CronTrigger(hour=1, minute=0),
        args=[certificate_service.database_repo],
        id="daily_update_days_remaining",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        "定时任务已启动: 每周 %s %02d:%02d 读目录；每日 01:00 更新剩余天数",
        cert_config.SCHEDULE_WEEKLY_DAY,
        cert_config.SCHEDULE_WEEKLY_HOUR,
        cert_config.SCHEDULE_WEEKLY_MINUTE,
    )
    return scheduler


def shutdown_scheduler(scheduler: Optional[BackgroundScheduler]) -> None:
    if scheduler:
        scheduler.shutdown()
        logger.info("定时任务已关闭")
