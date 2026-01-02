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
    page: int = 1,
    page_size: int = 20,
    use_cache: bool = True
) -> Dict[str, Any]:
    """
    获取证书列表（支持分页，优先级：缓存 -> 数据库）
    
    Args:
        app: CertificateApplication 实例
        store: 存储位置（websites、apis 或 database）
        page: 页码
        page_size: 每页数量
        use_cache: 是否使用缓存
        
    Returns:
        包含 certificates 和 total 的字典
    """
    # 1. 尝试从缓存获取
    if use_cache:
        cached = app.cache_repo.get_certificate_list(store, page, page_size)
        if cached:
            return cached
    
    # 2. 从数据库获取（已经是字典格式）
    cert_dicts, total = app.database_repo.get_certificate_list(store, page, page_size)
    
    # 转换为响应格式（保持 snake_case，前端 axios-case-converter 会自动转换为 camelCase）
    certificates = [
        {
            "domain": cert_dict.get("domain", ""),
            "store": cert_dict.get("store"),
            "folder_name": cert_dict.get("folder_name"),
            "source": cert_dict.get("source", "auto"),
            "status": cert_dict.get("status"),
            "email": cert_dict.get("email"),
            "issuer": cert_dict.get("issuer"),
            "not_before": cert_dict.get("not_before").isoformat() if cert_dict.get("not_before") else None,
            "not_after": cert_dict.get("not_after").isoformat() if cert_dict.get("not_after") else None,
            "is_valid": cert_dict.get("is_valid"),
            "days_remaining": cert_dict.get("days_remaining"),
            "last_error_message": cert_dict.get("last_error_message"),
            "last_error_time": cert_dict.get("last_error_time")
        }
        for cert_dict in cert_dicts
        if cert_dict and cert_dict.get("domain")  # 过滤掉 None 或没有 domain 的项
    ]
    
    result = {
        "certificates": certificates,
        "total": total
    }
    
    # 3. 写入缓存（使用较短的 TTL，默认 5 分钟）
    if use_cache:
        app.cache_repo.set_certificate_list(store, page, page_size, result, ttl=300)
    
    return result

