# coding=utf-8

"""
获取证书详情 Handler
"""
import logging
from typing import Optional, Dict, Any

from .protocol import CertificateAppLike
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


def get_certificate_detail(
    app: CertificateAppLike,
    store: str,
    domain: str,
    source: CertificateSource = CertificateSource.AUTO,
    use_cache: bool = True
) -> Optional[Dict[str, Any]]:
    """
    获取证书详情（包含证书内容和私钥）
    
    Args:
        app: CertificateApplication 实例
        store: 存储位置（websites、apis 或 database）
        domain: 域名
        source: 来源（CertificateSource枚举），默认为 AUTO
        use_cache: 是否使用缓存
    
    Returns:
        证书详情字典，如果不存在则返回 None
    """
    # 转换为字符串
    source_str = source.value if isinstance(source, CertificateSource) else source
    
    # 1. 尝试从缓存获取
    if use_cache:
        cached = app.cache_repo.get_certificate_detail(store, domain)
        if cached:
            # 确保缓存中的数据包含 sans 字段（兼容旧缓存）
            if "sans" not in cached or cached.get("sans") is None:
                cached["sans"] = []
            return cached
    
    # 2. 从数据库获取（已经是字典格式）
    cert_dict = app.database_repo.get_certificate_by_domain(store, domain, source_str)
    if not cert_dict:
        return None
    
    # 转换为响应格式（数据库返回的是 snake_case，需要转换为 camelCase）
    result = {
        "domain": cert_dict["domain"],
        "store": cert_dict["store"],
        "folder_name": cert_dict.get("folder_name"),
        "source": cert_dict.get("source", "auto"),
        "status": cert_dict.get("status"),
        "certificate": cert_dict["certificate"],
        "privateKey": cert_dict["private_key"],
        "sans": cert_dict.get("sans") or [],  # 确保 sans 不会是 None
        "issuer": cert_dict.get("issuer"),
        "notBefore": cert_dict["not_before"].isoformat() if cert_dict.get("not_before") else None,
        "notAfter": cert_dict["not_after"].isoformat() if cert_dict.get("not_after") else None,
        "isValid": cert_dict.get("is_valid"),
        "daysRemaining": cert_dict.get("days_remaining")
    }
    
    # 3. 写入缓存（使用较短的 TTL，默认 5 分钟）
    if use_cache:
        app.cache_repo.set_certificate_detail(store, domain, result, ttl=60)
    
    return result

