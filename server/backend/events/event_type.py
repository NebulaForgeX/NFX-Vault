# coding=utf-8

"""
事件类型常量
"""


class EventType:
    """事件类型常量"""
    # 操作事件
    OPERATION_REFRESH = "operation.refresh"  # 执行刷新操作（读取 acme.json 并更新数据库）
    CACHE_INVALIDATE = "cache.invalidate"  # 缓存失效事件（通知清除缓存）
    PARSE_CERTIFICATE = "certificate.parse"  # 解析证书事件（解析证书内容并更新数据库）
