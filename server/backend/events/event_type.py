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
    DELETE_FOLDER = "folder.delete"  # 删除文件夹事件（删除证书文件夹）
    DELETE_FILE_OR_FOLDER = "file_or_folder.delete"  # 删除文件或文件夹事件
    EXPORT_CERTIFICATE = "certificate.export"  # 导出证书事件（导出证书到文件夹）
