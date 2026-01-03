# coding=utf-8

"""
Server 模块

负责依赖注入和连接管理（类似于 Go 的 wire）
"""
from .wiring import Connections, init_connections, cleanup_connections

__all__ = [
    "Connections",
    "init_connections",
    "cleanup_connections",
]

