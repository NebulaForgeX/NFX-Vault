"""
Interfaces 模块

MVC 架构 - Interface 层
处理 HTTP 请求和 Kafka 事件（分离）
"""
from . import http, kafka

__all__ = [
    "http",
    "kafka",
]
