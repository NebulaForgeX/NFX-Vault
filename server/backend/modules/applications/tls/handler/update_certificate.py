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
    sans: Optional[List[str]] = None,
    folder_name: Optional[str] = None
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
    
    # manual_apply 源的证书只能编辑 folder_name
    if source == CertificateSource.MANUAL_APPLY:
        if folder_name is None:
            return {
                "success": False,
                "message": "folder_name is required for MANUAL_APPLY certificates"
            }
        # 只更新 folder_name，不允许更新其他字段
        if certificate is not None or private_key is not None or store is not None or sans is not None:
            return {
                "success": False,
                "message": "MANUAL_APPLY certificates can only update folder_name"
            }
    
    # manual_add 源的证书可以编辑所有字段
    
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
            days_remaining=days_remaining,
            folder_name=folder_name
        )
        
        if cert_obj:
            # 发布缓存失效事件（通过 Kafka）
            stores_to_clear = [store] if store else ["websites", "apis", "database"]
            app.invalidate_cache(stores_to_clear, trigger="update")
            
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

