"""Kafka 生产者 + Admin（与原先 backend_old 行为一致，自旧树手写迁入）。"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any, Optional

from kafka import KafkaProducer
from kafka.admin import KafkaAdminClient, NewTopic
from kafka.errors import KafkaError, TopicAlreadyExistsError

logger = logging.getLogger(__name__)


class KafkaClient:
    EVENT_TYPE_HEADER_KEY = "event_type"

    def __init__(self, bootstrap_servers: str, enable_kafka: bool = False) -> None:
        self.bootstrap_servers = bootstrap_servers
        self.enable_kafka = enable_kafka
        self.producer = None
        self.admin_client = None
        if self.enable_kafka:
            logging.getLogger("kafka").setLevel(logging.WARNING)
            try:
                self.admin_client = KafkaAdminClient(
                    bootstrap_servers=bootstrap_servers,
                    client_id="nfx-vault-admin",
                    request_timeout_ms=10000,
                )
                self.producer = KafkaProducer(
                    bootstrap_servers=bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode("utf-8"),
                    key_serializer=lambda k: k.encode("utf-8") if k and isinstance(k, str) else k,
                    request_timeout_ms=30000,
                    retries=3,
                )
            except Exception as e:  # noqa: BLE001
                logger.error("Kafka 初始化失败: %s", e)
                self.enable_kafka = False

    def ensure_topic_exists(
        self,
        topic: str,
        num_partitions: int = 3,
        replication_factor: int = 1,
    ) -> bool:
        if not self.enable_kafka or not self.admin_client:
            return False
        try:
            existing = self.admin_client.list_topics(timeout_ms=5000)
            if topic in existing:
                return True
        except Exception:  # noqa: BLE001
            pass
        try:
            self.admin_client.create_topics(
                new_topics=[
                    NewTopic(
                        name=topic,
                        num_partitions=num_partitions,
                        replication_factor=replication_factor,
                    )
                ],
                validate_only=False,
            )
            return True
        except TopicAlreadyExistsError:
            return True
        except Exception as e:  # noqa: BLE001
            logger.error("创建 topic 失败: %s", e)
            return False

    def send(
        self,
        topic: str,
        data: dict[str, Any],
        key: Optional[str] = None,
        ensure_topic: bool = True,
        headers: Optional[dict[str, str]] = None,
    ) -> bool:
        if not self.enable_kafka or not self.producer:
            return False
        if ensure_topic:
            self.ensure_topic_exists(topic)
        try:
            if "_timestamp" not in data:
                data["_timestamp"] = datetime.now().isoformat()
            kafka_headers = []
            if headers:
                for k, v in headers.items():
                    kafka_headers.append((str(k), v.encode("utf-8") if isinstance(v, str) else v))
            future = self.producer.send(
                topic=topic,
                key=key if not isinstance(key, bytes) else key.decode(),
                value=data,
                headers=kafka_headers or None,
            )
            future.get(timeout=10)
            et = "-"
            if headers:
                et = str(headers.get("event_type") or "-")
            logger.info("Kafka 已发送 topic=%s event_type=%s", topic, et)
            return True
        except KafkaError as e:
            logger.error("Kafka 发送失败: %s", e)
            return False
        except Exception as e:  # noqa: BLE001
            logger.error("发送异常: %s", e)
            return False

    def close(self) -> None:
        if self.admin_client:
            try:
                self.admin_client.close()
            except Exception:  # noqa: BLE001
                pass
        if self.producer:
            try:
                self.producer.close()
            except Exception:  # noqa: BLE001
                pass
