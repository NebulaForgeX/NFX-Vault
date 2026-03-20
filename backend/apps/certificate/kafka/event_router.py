# coding=utf-8
"""Kafka 事件类型 → 处理函数（对齐原 KafkaEventRouter）。"""
from __future__ import annotations

import logging
from typing import Any, Callable, Optional

from apps.certificate.events import EventType
from apps.certificate.kafka.certificate_kafka_handler import CertificateKafkaHandler

logger = logging.getLogger(__name__)


class KafkaEventRouter:
    def __init__(self, certificate_kafka_handler: Optional[CertificateKafkaHandler] = None) -> None:
        self.certificate_kafka_handler = certificate_kafka_handler
        self.routes: dict[str, Callable[[dict[str, Any]], None]] = {}

    def register_routes(self) -> None:
        h = self.certificate_kafka_handler
        if not h:
            return
        self.routes[EventType.OPERATION_REFRESH] = h.process_read_certificate_file
        self.routes[EventType.CACHE_INVALIDATE] = h.process_cache_invalidate
        self.routes[EventType.PARSE_CERTIFICATE] = h.process_parse_certificate
        self.routes[EventType.DELETE_FOLDER] = h.process_delete_folder
        self.routes[EventType.DELETE_FILE_OR_FOLDER] = h.process_delete_file_or_folder
        self.routes[EventType.EXPORT_CERTIFICATE] = h.process_export_certificate
        logger.info("Kafka 路由注册: %s 条", len(self.routes))


def setup_kafka_routes(
    certificate_kafka_handler: Optional[CertificateKafkaHandler] = None,
) -> KafkaEventRouter:
    router = KafkaEventRouter(certificate_kafka_handler=certificate_kafka_handler)
    router.register_routes()
    return router
