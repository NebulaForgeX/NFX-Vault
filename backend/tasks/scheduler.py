# coding=utf-8

"""
定时任务调度器

管理所有定时任务的启动和关闭
"""
import logging
import asyncio
from typing import Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from modules.configs.types import CertConfig
from modules.server.wiring import Connections
from .read_folders_task import read_folders_job
from .update_days_remaining_task import update_days_remaining_job

logger = logging.getLogger(__name__)


def setup_scheduler(
    cert_config: CertConfig,
    connections: Connections
) -> Optional[BackgroundScheduler]:
    """
    设置并启动定时任务调度器
    
    Args:
        cert_config: 证书配置对象
        connections: 连接对象集合
    
    Returns:
        调度器实例，如果定时任务被禁用则返回 None
    """
    if not cert_config.SCHEDULE_ENABLED:
        logger.info("ℹ️  定时任务已禁用")
        return None
    
    # 使用 BackgroundScheduler，它可以在后台线程中运行，适合长时间运行的服务
    scheduler = BackgroundScheduler()
    
    # 确保 file_http_handler 存在
    if not connections.file_http_handler:
        logger.warning("⚠️  file_http_handler 未初始化，无法启动定时任务")
        return None
    
    file_application = connections.file_http_handler.file_application
    
    # 包装异步任务为同步函数（BackgroundScheduler 需要同步函数）
    def run_async_read_folders(file_app, store: str):
        """包装异步任务为同步函数"""
        return asyncio.run(read_folders_job(file_app, store))
    
    # 添加 websites 文件夹读取任务
    scheduler.add_job(
        run_async_read_folders,
        CronTrigger(
            day_of_week=cert_config.SCHEDULE_WEEKLY_DAY,
            hour=cert_config.SCHEDULE_WEEKLY_HOUR,
            minute=cert_config.SCHEDULE_WEEKLY_MINUTE
        ),
        args=[file_application, "websites"],
        id="weekly_read_websites",
        replace_existing=True
    )
    
    # 添加 apis 文件夹读取任务
    scheduler.add_job(
        run_async_read_folders,
        CronTrigger(
            day_of_week=cert_config.SCHEDULE_WEEKLY_DAY,
            hour=cert_config.SCHEDULE_WEEKLY_HOUR,
            minute=cert_config.SCHEDULE_WEEKLY_MINUTE
        ),
        args=[file_application, "apis"],
        id="weekly_read_apis",
        replace_existing=True
    )
    
    # 确保 certificate_http_handler 存在
    if not connections.certificate_http_handler:
        logger.warning("⚠️  certificate_http_handler 未初始化，无法启动更新剩余天数任务")
    else:
        certificate_application = connections.certificate_http_handler.certificate_application
        database_repo = certificate_application.database_repo
        pipeline_repo = certificate_application.pipeline_repo
        
        # 添加每天更新剩余天数任务（每天凌晨 1:00 执行）
        # update_days_remaining_job 是同步函数，可以直接使用
        scheduler.add_job(
            update_days_remaining_job,
            CronTrigger(hour=1, minute=0),  # 每天凌晨 1:00
            args=[database_repo, certificate_application, pipeline_repo],
            id="daily_update_days_remaining",
            replace_existing=True
        )
        logger.info("✅ 已添加每天更新剩余天数任务：每天凌晨 1:00 执行")
    
    scheduler.start()
    logger.info(
        f"✅ 定时任务已启动：每周 {cert_config.SCHEDULE_WEEKLY_DAY} "
        f"{cert_config.SCHEDULE_WEEKLY_HOUR}:{cert_config.SCHEDULE_WEEKLY_MINUTE:02d} 读取文件夹"
    )
    
    return scheduler


def shutdown_scheduler(scheduler: Optional[BackgroundScheduler]) -> None:
    """
    关闭定时任务调度器
    
    Args:
        scheduler: 调度器实例
    """
    if scheduler:
        scheduler.shutdown()
        logger.info("✅ 定时任务已关闭")

