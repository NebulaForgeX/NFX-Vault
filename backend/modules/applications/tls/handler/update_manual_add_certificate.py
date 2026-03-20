# coding=utf-8

"""
更新手动添加证书 Handler
"""
import logging
from typing import List, Optional, Dict, Any

from .protocol import CertificateAppLike
from utils.certificate import extract_cert_info_from_pem_sync
from enums.certificate_source import CertificateSource
from enums.certificate_status import CertificateStatus

logger = logging.getLogger(__name__)


def update_manual_add_certificate(
    app: CertificateAppLike,
    certificate_id: str,
    certificate: Optional[str] = None,
    private_key: Optional[str] = None,
    store: Optional[str] = None,
    sans: Optional[List[str]] = None,
    folder_name: Optional[str] = None,
    email: Optional[str] = None
) -> Dict[str, Any]:
    """
    更新手动添加的证书（MANUAL_ADD）
    
    Args:
        app: CertificateApplication 实例
        certificate_id: 证书 ID（必需）
        certificate: 证书内容（PEM格式），可选
        private_key: 私钥内容（PEM格式），可选
        store: 存储位置，可选
        sans: SANs 列表，可选
        folder_name: 文件夹名称，可选
        email: 邮箱地址，可选
    
    Returns:
        更新结果（包含 success, message 等）
    """
    try:
        # 检查是否更新了 certificate 字段
        certificate_updated = certificate is not None
        
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
        
        # 如果更新了 certificate 字段，设置状态为 PROCESS（等待解析）
        status = CertificateStatus.PROCESS.value if certificate_updated else None
        
        # 直接使用 ID 更新证书
        cert_obj = app.database_repo.update_certificate_by_id(
            certificate_id=certificate_id,
            certificate=certificate,
            private_key=private_key,
            store=store,
            sans=sans,
            issuer=issuer,
            not_before=not_before,
            not_after=not_after,
            is_valid=is_valid,
            days_remaining=days_remaining,
            folder_name=folder_name,
            email=email,
            status=status
        )
        
        if cert_obj:
            # 发布缓存失效事件（通过 Kafka）
            stores_to_clear = [store] if store else ["websites", "apis", "database"]
            app.invalidate_cache(stores_to_clear, trigger="update")
            
            # 发送 Kafka 事件通知前端刷新
            if app.pipeline_repo:
                try:
                    for s in stores_to_clear:
                        app.pipeline_repo.send_refresh_event(s, "update")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to send refresh event: {e}")
            
            # 如果更新了 certificate 字段（无论是否为空），都发送解析事件（通过 Kafka）
            if certificate_updated:
                if app.pipeline_repo:
                    try:
                        app.pipeline_repo.send_parse_certificate_event(certificate_id=certificate_id)
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to send parse event: {e}")
                else:
                    logger.warning("⚠️ Pipeline repo 未初始化，无法发送解析事件")
            
            return {
                "success": True,
                "message": f"Certificate updated successfully (ID: {certificate_id})"
            }
        else:
            return {
                "success": False,
                "message": f"Certificate not found: certificate_id='{certificate_id}'"
            }
    except Exception as e:
        logger.error(f"❌ 更新证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error updating certificate: {str(e)}"
        }

