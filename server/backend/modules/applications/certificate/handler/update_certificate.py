# coding=utf-8

"""
更新证书 Handler
"""
import logging
from typing import List, Optional, Dict, Any

from .protocol import CertificateAppLike
from utils.certificate import extract_cert_info_from_pem_sync
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


def update_certificate(
    app: CertificateAppLike,
    domain: str,
    source: CertificateSource,
    certificate: Optional[str] = None,
    private_key: Optional[str] = None,
    store: Optional[str] = None,
    sans: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    更新证书
    
    Args:
        app: CertificateApplication 实例
        domain: 域名
        source: 来源（CertificateSource枚举）
        certificate: 证书内容（PEM格式），可选
        private_key: 私钥内容（PEM格式），可选
        store: 存储位置，可选
        sans: SANs 列表，可选
    
    Returns:
        更新结果（包含 success, message 等）
    """
    # auto 源的证书不能手动修改（只能通过读取文件夹更新）
    if source == CertificateSource.AUTO:
        return {
            "success": False,
            "message": "Auto source certificates cannot be manually updated. Please refresh from folders instead."
        }
    
    try:
        # 如果提供了证书内容，需要重新解析证书信息
        if certificate:
            cert_info = extract_cert_info_from_pem_sync(certificate)
            issuer = cert_info.get("issuer")
            not_before = cert_info.get("not_before")
            not_after = cert_info.get("not_after")
            is_valid = cert_info.get("is_valid")
            days_remaining = cert_info.get("days_remaining")
        else:
            issuer = None
            not_before = None
            not_after = None
            is_valid = None
            days_remaining = None
        
        # 更新证书（转换为字符串）
        cert_obj = app.database_repo.update_certificate(
            domain=domain,
            source=source.value if isinstance(source, CertificateSource) else source,
            certificate=certificate,
            private_key=private_key,
            store=store,
            sans=sans,
            issuer=issuer,
            not_before=not_before,
            not_after=not_after,
            is_valid=is_valid,
            days_remaining=days_remaining
        )
        
        if cert_obj:
            # 清除缓存
            stores_to_clear = [store] if store else ["websites", "apis"]
            for s in stores_to_clear:
                app.cache_repo.clear_store_cache(s)
            
            # 发送 Kafka 事件通知前端刷新（手动更新的证书不需要从 acme.json 读取，只需要通知前端刷新列表）
            if app.pipeline_repo:
                try:
                    for s in stores_to_clear:
                        app.pipeline_repo.send_refresh_event(s, "update")
                    logger.info(f"✅ Certificate updated, refresh event sent for domain '{domain}'")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to send refresh event: {e}")
            
            return {
                "success": True,
                "message": f"Certificate updated successfully for domain '{domain}' (source: {source})"
            }
        else:
            return {
                "success": False,
                "message": f"Certificate not found: domain='{domain}', source='{source.value if isinstance(source, CertificateSource) else source}'"
            }
    except Exception as e:
        logger.error(f"❌ 更新证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error updating certificate: {str(e)}"
        }

