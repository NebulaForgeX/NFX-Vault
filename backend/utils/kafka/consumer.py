"""Kafka 事件消费者（由原 backend resources.kafka.consumer 迁入）。"""
from __future__ import annotations

import json
import logging
import threading
from typing import Any, Callable, Optional

from kafka import KafkaConsumer

logger = logging.getLogger(__name__)


class KafkaEventConsumer:
    EVENT_TYPE_HEADER_KEY = "event_type"

    def __init__(
        self,
        bootstrap_servers: str = "localhost:9092",
        topic: str = "events",
        group_id: str = "nfx-vault",
        enable_auto_commit: bool = True,
    ) -> None:
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.group_id = group_id
        self.enable_auto_commit = enable_auto_commit
        self.consumer: Optional[KafkaConsumer] = None
        self.running = False
        self.handlers: dict[str, Callable[[dict[str, Any]], None]] = {}
        for name in ("kafka", "kafka.conn", "kafka.coordinator", "kafka.consumer", "kafka.cluster"):
            logging.getLogger(name).setLevel(logging.WARNING)

    def register_handler(self, event_type: str, handler: Callable[[dict[str, Any]], None]) -> None:
        self.handlers[event_type] = handler

    def start(self) -> bool:
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                enable_auto_commit=self.enable_auto_commit,
                auto_offset_reset="latest",
                consumer_timeout_ms=1000,
            )
            self.running = True
            logger.info("Kafka 消费者启动: topic=%s group=%s", self.topic, self.group_id)
            return True
        except Exception as e:  # noqa: BLE001
            logger.error("Kafka 消费者启动失败: %s", e)
            return False

    def consume_loop(self) -> None:
        if not self.consumer:
            logger.error("消费者未初始化")
            return
        while self.running:
            try:
                message_pack = self.consumer.poll(timeout_ms=1000)
                if not message_pack:
                    continue
                for _tp, messages in message_pack.items():
                    for message in messages:
                        try:
                            self._handle_message(message)
                        except Exception as e:  # noqa: BLE001
                            logger.error("处理消息失败: %s", e, exc_info=True)
            except Exception as e:  # noqa: BLE001
                if self.running:
                    logger.error("消费出错: %s", e, exc_info=True)
                break

    def _handle_message(self, message: Any) -> None:
        event_type: str | None = None
        if message.headers:
            for header_key, header_value in message.headers:
                try:
                    key_str = header_key.decode("utf-8") if isinstance(header_key, bytes) else header_key
                    if key_str == self.EVENT_TYPE_HEADER_KEY:
                        event_type = (
                            header_value.decode("utf-8")
                            if isinstance(header_value, bytes)
                            else header_value
                        )
                        break
                except (UnicodeDecodeError, AttributeError):
                    continue
        if not event_type:
            logger.warning("消息缺少 event_type header offset=%s", getattr(message, "offset", ""))
            return
        event_data = message.value if message.value else {}
        handler = self.handlers.get(event_type)
        if handler:
            try:
                handler(event_data)
                logger.info("Kafka 已消费 event_type=%s offset=%s", event_type, getattr(message, "offset", ""))
            except Exception as e:  # noqa: BLE001
                logger.error("事件处理失败: %s %s", event_type, e, exc_info=True)
        else:
            logger.warning("未注册的事件类型: %s", event_type)

    def stop(self) -> None:
        self.running = False
        if self.consumer:
            try:
                self.consumer.close()
            except Exception as e:  # noqa: BLE001
                logger.error("关闭 consumer: %s", e)


class KafkaConsumerThread(threading.Thread):
    def __init__(self, consumer: KafkaEventConsumer) -> None:
        super().__init__(daemon=True, name="KafkaConsumer")
        self.consumer = consumer

    def run(self) -> None:
        self.consumer.consume_loop()
