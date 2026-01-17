# coding=utf-8

"""
MANUAL_APPLY 证书重新申请 Handler

行为：正常的 apply 流程
不修改 Certificate Type（store）
"""
import logging
import threading
from typing import List, Optional, Dict, Any

from .protocol import CertificateAppLike
from enums.certificate_status import CertificateStatus
from enums.certificate_source import CertificateSource
from enums.certificate_store import CertificateStore

logger = logging.getLogger(__name__)


def _reapply_manual_apply_certificate_background(
    app: CertificateAppLike,
    certificate_id: str,
    domain: str,
    email: str,
    folder_name: str,
    sans: Optional[List[str]],
    webroot: Optional[str],
    original_store: str,
    original_status: str,
    force_renewal: bool
):
    """
    后台线程执行 MANUAL_APPLY 证书重新申请
    
    Args:
        app: CertificateApplication 实例
        certificate_id: 证书 ID
        domain: 主域名
        email: 邮箱地址
        folder_name: 文件夹名称
        sans: SANs 列表
        webroot: Webroot 路径
        original_store: 原始 store（保持不修改）
        original_status: 原始状态（失败时恢复）
    """
    try:
        logger.info(f"🚀 Starting MANUAL_APPLY certificate reapplication in background for domain '{domain}'")
        
        # 调用 TLS repository 申请证书（根据 force_renewal 决定是否强制更新）
        apply_result = app.tls_repo.apply_certificate(
            domain=domain,
            email=email,
            sans=sans,
            webroot=webroot,
            folder_name=folder_name,
            force_renewal=force_renewal  # 根据用户选择决定是否强制更新
        )
        
        # 根据申请结果更新数据库状态
        if apply_result["success"]:
            try:
                from utils.certificate import extract_cert_info_from_pem_sync
                
                cert_pem = apply_result.get("certificate")
                key_pem = apply_result.get("private_key")
                
                if cert_pem and key_pem:
                    # 提取证书信息
                    cert_info = extract_cert_info_from_pem_sync(cert_pem)
                    
                    # 更新数据库状态为成功，保持原有 source 和 store
                    app.database_repo.update_certificate_by_id(
                        certificate_id=certificate_id,
                        domain=domain,
                        email=email,
                        sans=sans,
                        folder_name=folder_name,
                        certificate=cert_pem,
                        private_key=key_pem,
                        status=CertificateStatus.SUCCESS.value,
                        issuer=cert_info.get("issuer", "Let's Encrypt"),
                        not_before=cert_info.get("not_before"),
                        not_after=cert_info.get("not_after"),
                        is_valid=cert_info.get("is_valid", True),
                        days_remaining=cert_info.get("days_remaining")
                    )
                    logger.info(f"✅ Certificate saved to database for domain '{domain}'")
                else:
                    logger.warning(f"⚠️ Certificate content not found in apply_result")
                    app.database_repo.update_certificate_by_id(
                        certificate_id=certificate_id,
                        domain=domain,
                        email=email,
                        sans=sans,
                        folder_name=folder_name,
                        status=CertificateStatus.SUCCESS.value
                    )
                
                # 发布缓存失效事件
                app.invalidate_cache([original_store], trigger="update")
                logger.info(f"✅ MANUAL_APPLY certificate reapplication completed for domain '{domain}'")
            except Exception as e:
                logger.error(f"❌ Failed to update certificate after reapplication: {e}", exc_info=True)
                # 恢复原始状态，并保存错误信息
                from datetime import datetime
                app.database_repo.update_certificate_by_id(
                    certificate_id=certificate_id,
                    status=original_status,
                    last_error_message=str(e),
                    last_error_time=datetime.now()
                )
                logger.error(f"❌ MANUAL_APPLY certificate reapplication failed for domain '{domain}': {str(e)}. Status restored to original.")
        else:
            error_msg = apply_result.get("error", "Unknown error")
            # 恢复原始状态，并保存错误信息
            from datetime import datetime
            app.database_repo.update_certificate_by_id(
                certificate_id=certificate_id,
                status=original_status,
                last_error_message=error_msg,
                last_error_time=datetime.now()
            )
            logger.error(f"❌ MANUAL_APPLY certificate reapplication failed for domain '{domain}': {error_msg}. Status restored to original.")
    
    except Exception as e:
        logger.error(f"❌ MANUAL_APPLY 证书重新申请异常: {e}", exc_info=True)
        try:
            # 恢复原始状态，并保存错误信息
            from datetime import datetime
            app.database_repo.update_certificate_by_id(
                certificate_id=certificate_id,
                status=original_status,
                last_error_message=str(e),
                last_error_time=datetime.now()
            )
            logger.error(f"❌ MANUAL_APPLY certificate reapplication exception for domain '{domain}': {str(e)}. Status restored to original.")
        except:
            pass


def reapply_manual_apply_certificate(
    app: CertificateAppLike,
    certificate_id: str,
    domain: str,
    email: str,
    folder_name: str,
    sans: Optional[List[str]] = None,
    webroot: Optional[str] = None,
    force_renewal: bool = False
) -> Dict[str, Any]:
    """
    MANUAL_APPLY 证书重新申请
    
    行为：正常的 apply 流程
    不修改 Certificate Type（store）
    
    Args:
        app: CertificateApplication 实例
        certificate_id: 证书 ID
        domain: 主域名
        email: 邮箱地址
        folder_name: 文件夹名称
        sans: SANs 列表
        webroot: Webroot 路径
    
    Returns:
        返回重新申请结果
    """
    try:
        # 获取原始证书信息
        original_cert = app.database_repo.get_certificate_by_id(certificate_id)
        if not original_cert:
            raise ValueError("Certificate not found")
        
        original_store = original_cert.get("store")  # 保持原有 store
        original_status = original_cert.get("status")  # 保存原始状态，失败时恢复
        
        # 检查证书状态，如果正在申请中，拒绝重复申请
        if original_status == CertificateStatus.PROCESS.value:
            logger.warning(
                f"⚠️  Certificate is already being processed, skipping duplicate request: "
                f"certificate_id={certificate_id}, domain={domain}"
            )
            return {
                "success": False,
                "message": f"Certificate for domain '{domain}' is already being processed. Please wait for the current request to complete.",
                "status": CertificateStatus.PROCESS.value,
                "error": "Certificate is already being processed"
            }
        
        logger.info(f"🚀 Starting MANUAL_APPLY certificate reapplication for domain '{domain}' (async)")
        
        # 先更新状态为申请中
        app.database_repo.update_certificate_by_id(
            certificate_id=certificate_id,
            status=CertificateStatus.PROCESS.value
        )
        
        # 在后台线程中执行证书重新申请
        thread = threading.Thread(
            target=_reapply_manual_apply_certificate_background,
            args=(app, certificate_id, domain, email, folder_name, sans, webroot, original_store, original_status, force_renewal),
            daemon=True,
            name=f"cert-reapply-manual-apply-{domain}"
        )
        thread.start()
        logger.info(f"✅ MANUAL_APPLY certificate reapplication started in background thread for domain '{domain}'")
        
        return {
            "success": True,
            "message": f"MANUAL_APPLY certificate reapplication started for domain '{domain}'. Please check the status later.",
            "status": CertificateStatus.PROCESS.value,
            "error": None
        }
    
    except Exception as e:
        logger.error(f"❌ MANUAL_APPLY 证书重新申请异常: {e}", exc_info=True)
        try:
            app.database_repo.update_certificate_by_id(
                certificate_id=certificate_id,
                status=CertificateStatus.FAIL.value
            )
        except:
            pass
        
        return {
            "success": False,
            "message": f"Error starting MANUAL_APPLY certificate reapplication: {str(e)}",
            "status": CertificateStatus.FAIL.value,
            "error": str(e)
        }

