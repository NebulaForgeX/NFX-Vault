# coding=utf-8

"""
创建证书 Handler
"""
import logging
from typing import List, Optional, Dict, Any

from .protocol import CertificateAppLike
from utils.certificate import extract_cert_info_from_pem_sync
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


def create_certificate(
    app: CertificateAppLike,
    store: str,
    domain: str,
    certificate: str,
    private_key: str,
    sans: Optional[List[str]] = None,
    folder_name: Optional[str] = None,
    email: Optional[str] = None,
    issuer: Optional[str] = None
) -> Dict[str, Any]:
    """
    创建证书（手动添加，source='manual'，默认存到 database，status='process'）
    
    Args:
        app: CertificateApplication 实例
        store: 存储位置（默认 database，只有导出时才存到 websites 或 apis）
        domain: 域名
        certificate: 证书内容（PEM格式）
        private_key: 私钥内容（PEM格式）
        sans: SANs 列表，可选
    
    Returns:
        创建结果（包含 success, message 等）
    """
    try:
        from enums.certificate_store import CertificateStore
        from enums.certificate_status import CertificateStatus
        
        # 使用 openssl 提取证书信息
        cert_info = extract_cert_info_from_pem_sync(certificate)
        
        # 默认存到 database
        actual_store = CertificateStore.DATABASE.value
        
        # 检查 domain + source='manual' 是否已存在
        existing = app.database_repo.get_certificate_by_domain(actual_store, domain, source=CertificateSource.MANUAL_ADD.value)
        if existing:
            return {
                "success": False,
                "message": f"Certificate with domain '{domain}' and source 'manual_add' already exists"
            }
        
        # 创建证书（默认存到 database，status='process'）
        # 使用传入的 issuer 或从证书中提取
        final_issuer = issuer or cert_info.get("issuer", "Unknown")
        
        cert_obj = app.database_repo.create_certificate(
            store=actual_store,
            domain=domain,
            certificate=certificate,
            private_key=private_key,
            sans=sans,
            issuer=final_issuer,
            not_before=cert_info.get("not_before"),
            not_after=cert_info.get("not_after"),
            is_valid=cert_info.get("is_valid", True),
            days_remaining=cert_info.get("days_remaining"),
            folder_name=folder_name,
            email=email
        )
        
        if cert_obj:
            # 在 session 关闭前获取 ID（避免 detached instance 错误）
            certificate_id = cert_obj.id
            
            # 发布缓存失效事件（通过 Kafka）
            app.invalidate_cache([actual_store], trigger="add")
            
            # 发送解析证书事件（通过 Kafka）
            if app.pipeline_repo:
                try:
                    app.pipeline_repo.send_parse_certificate_event(certificate_id=certificate_id)
                    logger.info(f"✅ Certificate created, parse event sent for certificate_id '{certificate_id}'")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to send parse event: {e}")
            
            return {
                "success": True,
                "message": f"Certificate created successfully for domain '{domain}' (stored in database, parsing in background)"
            }
        else:
            return {
                "success": False,
                "message": "Failed to create certificate"
            }
    except Exception as e:
        logger.error(f"❌ 创建证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error creating certificate: {str(e)}"
        }

