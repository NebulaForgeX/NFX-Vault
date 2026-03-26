# coding=utf-8
"""
NFX-Vault Backend（MVC，自包含于 `backend/`）。

运行：cd backend && PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import json
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
from utils import KafkaConsumerThread
from routers.urls import api_router
from tasks.scheduler import setup_scheduler, shutdown_scheduler

load_repo_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
# APScheduler 默认 INFO 为人读句子，与业务 JSON 日志混排；仍可通过 WARNING 及以上看到异常
logging.getLogger("apscheduler").setLevel(logging.WARNING)

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
        logger.info(
            json.dumps(
                {"task": "kafka_consumer", "event": "thread_started"},
                ensure_ascii=False,
            )
        )
    else:
        logger.info(
            json.dumps(
                {
                    "task": "kafka_consumer",
                    "event": "not_started",
                    "reason": "kafka_unavailable_or_unconfigured",
                },
                ensure_ascii=False,
            )
        )

    if cert_cfg.READ_ON_STARTUP:
        logger.info(
            json.dumps(
                {
                    "task": "disk_cert_import",
                    "event": "startup_begin",
                    "store": "websites",
                    "message": "READ_ON_STARTUP",
                },
                ensure_ascii=False,
            )
        )
        try:
            r = await _stack.file_service.read_folders_and_store_certificates("websites")
            logger.info(
                json.dumps(
                    {
                        "task": "disk_cert_import",
                        "event": "startup_api_summary",
                        "success": r.get("success"),
                        "inserted": r.get("inserted", r.get("processed", 0)),
                        "skipped_existing": r.get("skipped_existing", 0),
                        "skipped_missing_files": r.get("skipped_missing_files", 0),
                        "skipped_no_domain": r.get("skipped_no_domain", 0),
                        "failed": r.get("failed", 0),
                        "message": r.get("message", ""),
                    },
                    ensure_ascii=False,
                    default=str,
                )
            )
        except Exception as e:  # noqa: BLE001
            logger.error(
                json.dumps(
                    {
                        "task": "disk_cert_import",
                        "event": "startup_failed",
                        "error": str(e),
                    },
                    ensure_ascii=False,
                ),
                exc_info=True,
            )

    _scheduler = setup_scheduler(cert_cfg, _stack.certificate_service)

    logger.info(
        json.dumps(
            {
                "task": "startup",
                "event": "lifespan_deps",
                "mysql": getattr(_stack.mysql, "enable_mysql", False),
                "redis": getattr(_stack.redis, "enable_redis", False),
                "kafka": getattr(_stack.kafka, "enable_kafka", False),
            },
            ensure_ascii=False,
        )
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
