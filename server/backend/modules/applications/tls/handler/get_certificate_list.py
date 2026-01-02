# coding=utf-8

"""
获取证书列表 Handler
"""
import logging
from typing import Dict, Any

from .protocol import CertificateAppLike

logger = logging.getLogger(__name__)


def get_certificate_list(
    app: CertificateAppLike,
    store: str,
    offset: int = 0,
    limit: int = 20,
    use_cache: bool = True
) -> Dict[str, Any]:
    """
    获取证书列表（支持分页，优先级：缓存 -> 数据库）
    
    Args:
        app: CertificateApplication 实例
        store: 存储位置（websites、apis 或 database）
        offset: 偏移量（从0开始）
        limit: 每页数量
        use_cache: 是否使用缓存
        
    Returns:
        包含 items 和 total 的字典
    """
    # 1. 尝试从缓存获取
    if use_cache:
        cached = app.cache_repo.get_certificate_list(store, offset, limit)
        if cached:
            return cached
    
    # 2. 从数据库获取（已经是字典格式）
    cert_dicts, total = app.database_repo.get_certificate_list(store, offset, limit)
    
    # 转换为响应格式（保持 snake_case，前端 axios-case-converter 会自动转换为 camelCase）
    # 注意：to_dict() 已经将日期字段转换为 ISO 格式字符串，所以不需要再次调用 isoformat()
    items = [
        {
            "id": cert_dict.get("id"),  # 添加 id 字段
            "domain": cert_dict.get("domain", ""),
            "store": cert_dict.get("store"),
            "folder_name": cert_dict.get("folder_name"),
            "source": cert_dict.get("source", "auto"),
            "status": cert_dict.get("status"),
            "email": cert_dict.get("email"),
            "issuer": cert_dict.get("issuer"),
            "not_before": cert_dict.get("not_before"),
            "not_after": cert_dict.get("not_after"),
            "is_valid": cert_dict.get("is_valid"),
            "days_remaining": cert_dict.get("days_remaining"),
            "last_error_message": cert_dict.get("last_error_message"),
            "last_error_time": cert_dict.get("last_error_time")
        }
        for cert_dict in cert_dicts
        if cert_dict and cert_dict.get("domain")  # 过滤掉 None 或没有 domain 的项
    ]
    
    result = {
        "items": items,
        "total": total
    }
    
    # 3. 写入缓存（使用较短的 TTL，默认 5 分钟）
    if use_cache:
        app.cache_repo.set_certificate_list(store, offset, limit, result, ttl=300)
    
    return result

