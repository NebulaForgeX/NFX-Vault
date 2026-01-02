# coding=utf-8

"""
通过 ID 获取证书详情 Handler
"""
import logging
from typing import Optional, Dict, Any

from .protocol import CertificateAppLike

logger = logging.getLogger(__name__)


def get_certificate_detail_by_id(
    app: CertificateAppLike,
    certificate_id: str,
    use_cache: bool = True
) -> Optional[Dict[str, Any]]:
    """
    通过证书 ID 获取证书详情（包含证书内容和私钥）
    
    Args:
        app: CertificateApplication 实例
        certificate_id: 证书 ID
        use_cache: 是否使用缓存
    
    Returns:
        证书详情字典，如果不存在则返回 None
    """
    # 1. 从数据库通过 ID 获取证书
    cert_dict = app.database_repo.get_certificate_by_id(certificate_id)
    if not cert_dict:
        return None
    
    store = cert_dict.get("store")
    domain = cert_dict.get("domain")
    
    # 2. 尝试从缓存获取（如果有的话，使用 store + domain 作为缓存 key）
    if use_cache and store and domain:
        cached = app.cache_repo.get_certificate_detail(store, domain)
        if cached and cached.get("id") == certificate_id:
            # 确保缓存中的数据包含完整字段
            if "sans" not in cached or cached.get("sans") is None:
                cached["sans"] = []
            return cached
    
    # 3. 转换为响应格式
    # 注意：to_dict() 已经将日期字段转换为 ISO 格式字符串，所以不需要再次调用 isoformat()
    result = {
        "id": cert_dict.get("id"),
        "domain": cert_dict["domain"],
        "store": cert_dict["store"],
        "folder_name": cert_dict.get("folder_name"),
        "source": cert_dict.get("source", "auto"),
        "status": cert_dict.get("status"),
        "email": cert_dict.get("email"),
        "certificate": cert_dict["certificate"],
        "private_key": cert_dict["private_key"],
        "sans": cert_dict.get("sans") or [],
        "issuer": cert_dict.get("issuer"),
        "not_before": cert_dict.get("not_before"),
        "not_after": cert_dict.get("not_after"),
        "is_valid": cert_dict.get("is_valid"),
        "days_remaining": cert_dict.get("days_remaining"),
        "last_error_message": cert_dict.get("last_error_message"),
        "last_error_time": cert_dict.get("last_error_time")
    }
    
    # 4. 写入缓存
    if use_cache and store and domain:
        app.cache_repo.set_certificate_detail(store, domain, result, ttl=60)
    
    return result

