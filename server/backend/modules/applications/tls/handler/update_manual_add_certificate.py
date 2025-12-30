# coding=utf-8

"""
更新手动添加证书 Handler
"""
import logging
from typing import List, Optional, Dict, Any

from .protocol import CertificateAppLike
from utils.certificate import extract_cert_info_from_pem_sync
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


def update_manual_add_certificate(
    app: CertificateAppLike,
    domain: str,
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
        domain: 域名
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
            source=CertificateSource.MANUAL_ADD.value,
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
            email=email
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
            
            # 如果更新了证书内容，发送解析事件
            if certificate and app.pipeline_repo:
                try:
                    # 安全获取证书 ID（避免 detached instance 错误）
                    certificate_id = None
                    try:
                        certificate_id = cert_obj.id
                    except Exception as e:
                        # 如果无法从对象获取 ID，使用 domain 和 source 重新查询
                        logger.warning(f"⚠️ 无法从对象获取 ID，尝试重新查询: {e}")
                        cert_by_domain = app.database_repo.get_certificate_by_domain(
                            store or "database", 
                            domain, 
                            source=CertificateSource.MANUAL_ADD.value
                        )
                        if cert_by_domain:
                            certificate_id = cert_by_domain.get("id")
                        else:
                            logger.error("❌ 无法通过 domain 查询证书 ID")
                    
                    if certificate_id:
                        app.pipeline_repo.send_parse_certificate_event(certificate_id=certificate_id)
                except Exception as e:
                    logger.warning(f"⚠️ Failed to send parse certificate event: {e}")
            
            return {
                "success": True,
                "message": f"Certificate updated successfully for domain '{domain}' (source: MANUAL_ADD)"
            }
        else:
            return {
                "success": False,
                "message": f"Certificate not found: domain='{domain}', source='MANUAL_ADD'"
            }
    except Exception as e:
        logger.error(f"❌ 更新证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error updating certificate: {str(e)}"
        }

