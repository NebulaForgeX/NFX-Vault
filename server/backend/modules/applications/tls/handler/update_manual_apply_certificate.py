# coding=utf-8

"""
更新手动申请证书 Handler
"""
import logging
from typing import Dict, Any, Optional

from .protocol import CertificateAppLike
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


def update_manual_apply_certificate(
    app: CertificateAppLike,
    domain: str,
    folder_name: str
) -> Dict[str, Any]:
    """
    更新手动申请的证书（MANUAL_APPLY）
    只能更新 folder_name
    
    Args:
        app: CertificateApplication 实例
        domain: 域名
        folder_name: 文件夹名称（必需）
    
    Returns:
        更新结果（包含 success, message 等）
    """
    if not folder_name:
        return {
            "success": False,
            "message": "folder_name is required for MANUAL_APPLY certificates"
        }
    
    try:
        # 只更新 folder_name
        cert_obj = app.database_repo.update_certificate(
            domain=domain,
            source=CertificateSource.MANUAL_APPLY.value,
            folder_name=folder_name
        )
        
        if cert_obj:
            # 发布缓存失效事件（通过 Kafka）
            app.invalidate_cache(["database"], trigger="update")
            
            # 发送 Kafka 事件通知前端刷新
            if app.pipeline_repo:
                try:
                    app.pipeline_repo.send_refresh_event("database", "update")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to send refresh event: {e}")
            
            return {
                "success": True,
                "message": f"Certificate updated successfully for domain '{domain}' (source: MANUAL_APPLY)"
            }
        else:
            return {
                "success": False,
                "message": f"Certificate not found: domain='{domain}', source='MANUAL_APPLY'"
            }
    except Exception as e:
        logger.error(f"❌ 更新证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error updating certificate: {str(e)}"
        }

