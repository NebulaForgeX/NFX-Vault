# coding=utf-8
"""证书相关 Kafka 事件处理（对齐原 CertificateKafkaHandler）。"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from apps.certificate.events import (
    CacheInvalidateEvent,
    DeleteFileOrFolderEvent,
    DeleteFolderEvent,
    ExportCertificateEvent,
    OperationRefreshEvent,
    ParseCertificateEvent,
)
from apps.certificate.services.certificate_service import CertificateService
from apps.file.services.file_service import FileService
from enums import CertificateSource, CertificateStore

logger = logging.getLogger(__name__)


class CertificateKafkaHandler:
    def __init__(
        self,
        certificate_service: CertificateService,
        file_service: FileService,
    ) -> None:
        self.certificate_service = certificate_service
        self.file_service = file_service

    def process_read_certificate_file(self, event_data: dict[str, Any]) -> None:
        try:
            event = OperationRefreshEvent.from_dict(event_data)
            logger.info("Kafka refresh folders: store=%s trigger=%s", event.store, event.trigger)
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            loop.run_until_complete(
                self.file_service.read_folders_and_store_certificates(store=event.store)
            )
        except Exception as e:  # noqa: BLE001
            logger.error("process_read_certificate_file: %s", e, exc_info=True)
            raise

    def process_cache_invalidate(self, event_data: dict[str, Any]) -> None:
        try:
            event = CacheInvalidateEvent.from_dict(event_data)
            for store in event.stores:
                self.certificate_service.cache_repo.clear_store_cache(store)
        except Exception as e:  # noqa: BLE001
            logger.error("process_cache_invalidate: %s", e, exc_info=True)
            raise

    def process_parse_certificate(self, event_data: dict[str, Any]) -> None:
        try:
            event = ParseCertificateEvent.from_dict(event_data)
            self.certificate_service.parse_certificate(event.certificate_id)
        except Exception as e:  # noqa: BLE001
            logger.error("process_parse_certificate: %s", e, exc_info=True)
            raise

    def process_delete_folder(self, event_data: dict[str, Any]) -> None:
        try:
            event = DeleteFolderEvent.from_dict(event_data)
            self.file_service.delete_folder(store=event.store, folder_name=event.folder_name)
        except Exception as e:  # noqa: BLE001
            logger.error("process_delete_folder: %s", e, exc_info=True)
            raise

    def process_delete_file_or_folder(self, event_data: dict[str, Any]) -> None:
        try:
            event = DeleteFileOrFolderEvent.from_dict(event_data)
            self.file_service.delete_file_or_folder_fs(
                store=event.store, path=event.path, item_type=event.item_type
            )
        except Exception as e:  # noqa: BLE001
            logger.error("process_delete_file_or_folder: %s", e, exc_info=True)
            raise

    def process_export_certificate(self, event_data: dict[str, Any]) -> None:
        try:
            event = ExportCertificateEvent.from_dict(event_data)
            cert_detail = self.certificate_service.database_repo.get_certificate_by_id(
                event.certificate_id
            )
            if not cert_detail:
                logger.error("证书不存在: %s", event.certificate_id)
                return
            store = cert_detail.get("store")
            source = cert_detail.get("source")
            if source == CertificateSource.AUTO.value and store == CertificateStore.DATABASE.value:
                logger.warning(
                    "AUTO 证书不应在 database store，跳过导出: id=%s", event.certificate_id
                )
                return
            self.file_service.export_single_certificate(event.certificate_id, store=str(store))
        except Exception as e:  # noqa: BLE001
            logger.error("process_export_certificate: %s", e, exc_info=True)
            raise
