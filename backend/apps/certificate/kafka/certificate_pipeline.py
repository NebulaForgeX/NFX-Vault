# coding=utf-8
"""证书域 Kafka 事件发送（headers 键 `event_type` 与 Consumer 一致）。"""
from __future__ import annotations

import logging
from typing import Optional

from apps.certificate.events import (
    CacheInvalidateEvent,
    DeleteFileOrFolderEvent,
    DeleteFolderEvent,
    ExportCertificateEvent,
    EventType,
    OperationRefreshEvent,
    ParseCertificateEvent,
)
from config.types import DatabaseConfig
from utils import KafkaClient

logger = logging.getLogger(__name__)

_EVENT_HEADER = "event_type"


class CertificatePipeline:
    def __init__(
        self,
        db_config: Optional[DatabaseConfig] = None,
        kafka_client: Optional[KafkaClient] = None,
    ) -> None:
        self.db_config = db_config
        self.kafka_client = kafka_client

    def _send(self, data: dict, event_type: str) -> bool:
        if not self.db_config or not self.kafka_client or not self.kafka_client.enable_kafka:
            logger.warning("Kafka 未就绪，跳过发送")
            return False
        topic = self.db_config.KAFKA_EVENT_TOPIC
        self.kafka_client.ensure_topic_exists(topic)
        return self.kafka_client.send(
            topic=topic,
            data=data,
            headers={_EVENT_HEADER: event_type},
        )

    def send_refresh_event(self, store: str, trigger: str = "manual") -> bool:
        ev = OperationRefreshEvent(store=store, trigger=trigger)
        return self._send(ev.to_dict(), EventType.OPERATION_REFRESH)

    def send_cache_invalidate_event(self, trigger: str = "manual") -> bool:
        ev = CacheInvalidateEvent(stores=[], trigger=trigger)
        return self._send(ev.to_dict(), EventType.CACHE_INVALIDATE)

    def send_parse_certificate_event(self, certificate_id: str) -> bool:
        ev = ParseCertificateEvent(certificate_id=certificate_id)
        return self._send(ev.to_dict(), EventType.PARSE_CERTIFICATE)

    def send_delete_folder_event(self, store: str, folder_name: str) -> bool:
        ev = DeleteFolderEvent(store=store, folder_name=folder_name)
        return self._send(ev.to_dict(), EventType.DELETE_FOLDER)

    def send_delete_file_or_folder_event(self, store: str, path: str, item_type: str) -> bool:
        ev = DeleteFileOrFolderEvent(store=store, path=path, item_type=item_type)
        return self._send(ev.to_dict(), EventType.DELETE_FILE_OR_FOLDER)

    def send_export_certificate_event(self, certificate_id: str) -> bool:
        ev = ExportCertificateEvent(certificate_id=certificate_id)
        return self._send(ev.to_dict(), EventType.EXPORT_CERTIFICATE)
