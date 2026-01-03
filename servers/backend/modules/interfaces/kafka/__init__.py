"""
Kafka 接口模块

处理 Kafka 事件
"""
from .router import KafkaEventRouter, setup_routes
from .handler.certificate import CertificateKafkaHandler

__all__ = [
    "KafkaEventRouter",
    "setup_routes",
    "CertificateKafkaHandler",
]

