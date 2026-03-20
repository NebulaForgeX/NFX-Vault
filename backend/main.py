# coding=utf-8
"""
NFX-Vault Backend（MVC，自包含于 `backend/`）。

运行：cd backend && PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import logging
import os
import signal
from contextlib import asynccontextmanager
from typing import Any, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from apps.wiring import ApplicationStack, build_application_stack
from config import load_config, load_repo_dotenv
from utils.kafka import KafkaConsumerThread
from routers.urls import api_router
from tasks.scheduler import setup_scheduler, shutdown_scheduler

load_repo_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

_stack: Optional[ApplicationStack] = None
_scheduler: Any = None
_consumer_thread: Optional[KafkaConsumerThread] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _stack, _scheduler, _consumer_thread
    cert_cfg, db_cfg = load_config()
    _stack = build_application_stack(cert_cfg, db_cfg)

    app.state.certificate_service = _stack.certificate_service
    app.state.file_service = _stack.file_service
    app.state.analysis_service = _stack.analysis_service
    app.state.acme_storage = _stack.acme_storage
    app.state.cert_config = cert_cfg
    app.state.db_config = db_cfg

    if _stack.kafka_consumer and _stack.kafka_consumer.start():
        _consumer_thread = KafkaConsumerThread(_stack.kafka_consumer)
        _consumer_thread.start()
        logger.info("Kafka Consumer 线程已启动")
    else:
        logger.info("Kafka Consumer 未启动（Kafka 不可用或未配置）")

    if cert_cfg.READ_ON_STARTUP:
        logger.info("READ_ON_STARTUP: 读取 Websites/Apis 目录入库")
        try:
            for store in ("websites", "apis"):
                r = await _stack.file_service.read_folders_and_store_certificates(store)
                logger.info("READ_ON_STARTUP store=%s processed=%s", store, r.get("processed", 0))
        except Exception as e:  # noqa: BLE001
            logger.error("READ_ON_STARTUP 失败: %s", e, exc_info=True)

    _scheduler = setup_scheduler(cert_cfg, _stack.file_service, _stack.certificate_service)

    logger.info(
        "mysql=%s redis=%s kafka=%s",
        getattr(_stack.mysql, "enable_mysql", False),
        getattr(_stack.redis, "enable_redis", False),
        getattr(_stack.kafka, "enable_kafka", False),
    )

    yield

    shutdown_scheduler(_scheduler)
    if _stack.kafka_consumer:
        _stack.kafka_consumer.stop()
    if _consumer_thread:
        _consumer_thread.join(timeout=5)
    if _stack.kafka:
        _stack.kafka.close()
    if _stack.redis:
        _stack.redis.close()
    if _stack.mysql:
        _stack.mysql.close()


app = FastAPI(title="NFX-Vault API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/")
async def root() -> dict:
    return {
        "message": "NFX-Vault API",
        "version": "1.0.0",
        "description": "Certificate Management System — unified backend (HTTP + Kafka consumer + scheduler)",
    }


@app.get("/health")
async def health() -> dict:
    return {
        "status": "healthy",
        "service": "backend",
        "database": "connected"
        if _stack and getattr(_stack.mysql, "enable_mysql", False)
        else "disconnected",
        "redis": "connected"
        if _stack and getattr(_stack.redis, "enable_redis", False)
        else "disconnected",
        "kafka": "connected"
        if _stack and getattr(_stack.kafka, "enable_kafka", False)
        else "disconnected",
    }


def _on_signal(sig, frame) -> None:
    logger.info("收到停止信号")


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, _on_signal)
    signal.signal(signal.SIGINT, _on_signal)
    port = int(os.environ.get("NFX_VAULT_API_PORT", "8000"))
    host = os.environ.get("NFX_VAULT_API_HOST", "0.0.0.0")
    dev = os.environ.get("NFX_VAULT_DEV", "").lower() in ("1", "true", "yes")
    if dev:
        uvicorn.run("main:app", host=host, port=port, reload=True, log_level="debug")
    else:
        uvicorn.run(app, host=host, port=port, reload=False, log_level="info")
