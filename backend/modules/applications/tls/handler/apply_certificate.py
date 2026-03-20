# coding=utf-8

"""
申请证书 Handler
"""
import logging
import threading
from typing import List, Optional, Dict, Any

from .protocol import CertificateAppLike
from enums.certificate_status import CertificateStatus
from enums.certificate_source import CertificateSource
from enums.certificate_store import CertificateStore

logger = logging.getLogger(__name__)


def _apply_certificate_background(
    app: CertificateAppLike,
    domain: str,
    email: str,
    folder_name: str,
    sans: Optional[List[str]],
    webroot: Optional[str]
):
    """
    后台线程执行证书申请
    
    Args:
        app: CertificateApplication 实例
        domain: 主域名
        email: 邮箱地址
        folder_name: 文件夹名称
        sans: SANs 列表
        webroot: Webroot 路径
    """
    try:
        logger.info(f"🚀 Starting certificate application in background for domain '{domain}'")
        
        # 调用 TLS repository 申请证书（会等待 certbot 完成）
        apply_result = app.tls_repo.apply_certificate(
            domain=domain,
            email=email,
            sans=sans,
            webroot=webroot,
            folder_name=folder_name
        )
        
        # 根据申请结果更新数据库状态
        if apply_result["success"]:
            try:
                # Certbot 申请成功后，证书文件已经保存在文件夹中
                # certbot 返回的结果中已经包含了证书内容，直接使用
                from utils.certificate import extract_cert_info_from_pem_sync
                
                cert_pem = apply_result.get("certificate")
                key_pem = apply_result.get("private_key")
                
                if cert_pem and key_pem:
                    # 提取证书信息
                    cert_info = extract_cert_info_from_pem_sync(cert_pem)
                    
                    # 更新数据库状态为成功，并保存证书内容（保持 source 为 MANUAL）
                    app.database_repo.create_or_update_certificate(
                        store=CertificateStore.DATABASE.value,
                        domain=domain,
                        source=CertificateSource.MANUAL_APPLY.value,  # 用户主动申请的证书
                        status=CertificateStatus.SUCCESS.value,
                        email=email,
                        sans=sans,
                        folder_name=folder_name,
                        certificate=cert_pem,
                        private_key=key_pem,
                        issuer=cert_info.get("issuer", "Let's Encrypt"),
                        not_before=cert_info.get("not_before"),
                        not_after=cert_info.get("not_after"),
                        is_valid=cert_info.get("is_valid", True),
                        days_remaining=cert_info.get("days_remaining")
                    )
                    logger.info(f"✅ Certificate saved to database for domain '{domain}'")
                else:
                    logger.warning(f"⚠️ Certificate content not found in apply_result")
                    # 即使证书内容不存在，也更新状态为成功（certbot 已经申请成功，文件已保存）
                    app.database_repo.create_or_update_certificate(
                        store=CertificateStore.DATABASE.value,
                        domain=domain,
                        source=CertificateSource.MANUAL_APPLY.value,  # 用户主动申请的证书
                        status=CertificateStatus.SUCCESS.value,
                        email=email,
                        sans=sans,
                        folder_name=folder_name
                    )
                
                # 发布缓存失效事件（通过 Kafka），让前端刷新列表
                app.invalidate_cache([CertificateStore.DATABASE.value], trigger="add")
                logger.info(f"✅ Certificate application completed for domain '{domain}'")
            except Exception as e:
                logger.error(f"❌ Failed to update certificate after application: {e}", exc_info=True)
                # 记录申请失败的状态
                app.database_repo.create_or_update_certificate(
                    store=CertificateStore.DATABASE.value,
                    domain=domain,
                    source=CertificateSource.MANUAL_APPLY.value,  # 用户主动申请的证书
                    status=CertificateStatus.FAIL.value,
                    email=email,
                    sans=sans,
                    folder_name=folder_name
                )
        else:
            # 申请失败，记录失败状态到数据库
            error_msg = apply_result.get("error", "Unknown error")
            app.database_repo.create_or_update_certificate(
                store=CertificateStore.DATABASE.value,
                domain=domain,
                source=CertificateSource.MANUAL_APPLY.value,  # 用户主动申请的证书
                status=CertificateStatus.FAIL.value,
                email=email,
                sans=sans,
                folder_name=folder_name
            )
            logger.error(f"❌ Certificate application failed for domain '{domain}': {error_msg}")
    
    except Exception as e:
        logger.error(f"❌ 申请证书异常: {e}", exc_info=True)
        # 记录失败状态
        try:
            app.database_repo.create_or_update_certificate(
                store=CertificateStore.DATABASE.value,
                domain=domain,
                source=CertificateSource.MANUAL_APPLY.value,  # 用户主动申请的证书
                status=CertificateStatus.FAIL.value,
                email=email,
                sans=sans,
                folder_name=folder_name
            )
        except:
            pass


def apply_certificate(
    app: CertificateAppLike,
    domain: str,
    email: str,
    folder_name: str,
    sans: Optional[List[str]] = None,
    webroot: Optional[str] = None
) -> Dict[str, Any]:
    """
    申请 Let's Encrypt 证书（异步处理，立即返回）
    
    此方法会立即返回，证书申请在后台线程中执行。
    前端可以通过查询证书状态来获取申请进度。
    
    注意：
    - 通过 Certbot 直接申请证书（使用 webroot 模式）
    - 申请的证书统一存储在 database store
    - 证书会保存到 Websites 或 Apis 文件夹中
    - 申请完成后会自动更新数据库状态
    
    Args:
        app: CertificateApplication 实例
        domain: 主域名
        email: 邮箱地址（用于 Let's Encrypt 通知）
        folder_name: 文件夹名称（唯一标识符）
        sans: SANs 列表（可选）
        webroot: Webroot 路径（用于 HTTP-01 验证）
    
    Returns:
        返回证书申请结果（包含 success, message, status 等）
        - success: True 表示已开始申请
        - status: 证书状态（PROCESS - 申请中）
        - message: 结果消息
    """
    try:
        logger.info(f"🚀 Starting certificate application for domain '{domain}' (async)")
        
        # 检查是否已存在相同域名的证书且正在申请中
        existing_cert = app.database_repo.get_certificate_by_domain(
            store=CertificateStore.DATABASE.value,
            domain=domain,
            source=CertificateSource.MANUAL_APPLY.value
        )
        
        if existing_cert and existing_cert.get("status") == CertificateStatus.PROCESS.value:
            logger.warning(
                f"⚠️  Certificate application is already in progress for domain '{domain}', "
                f"skipping duplicate request: certificate_id={existing_cert.get('id')}"
            )
            return {
                "success": False,
                "message": f"Certificate application for domain '{domain}' is already in progress. Please wait for the current request to complete.",
                "status": CertificateStatus.PROCESS.value,
                "error": "Certificate application is already in progress"
            }
        
        # 先记录申请中的状态（用户主动申请的，source 为 MANUAL_APPLY）
        app.database_repo.create_or_update_certificate(
            store=CertificateStore.DATABASE.value,
            domain=domain,
            source=CertificateSource.MANUAL_APPLY.value,  # 用户主动申请的证书
            status=CertificateStatus.PROCESS.value,  # 申请中，状态为 process
            email=email,
            sans=sans,
            folder_name=folder_name
        )
        
        # 在后台线程中执行证书申请
        thread = threading.Thread(
            target=_apply_certificate_background,
            args=(app, domain, email, folder_name, sans, webroot),
            daemon=True,
            name=f"cert-apply-{domain}"
        )
        thread.start()
        logger.info(f"✅ Certificate application started in background thread for domain '{domain}'")
        
        # 立即返回，告诉前端正在申请中
        return {
            "success": True,
            "message": f"Certificate application started for domain '{domain}'. Please check the status later.",
            "status": CertificateStatus.PROCESS.value,
            "error": None
        }
    
    except Exception as e:
        logger.error(f"❌ 申请证书异常: {e}", exc_info=True)
        # 记录失败状态
        try:
            app.database_repo.create_or_update_certificate(
                store=CertificateStore.DATABASE.value,
                domain=domain,
                source=CertificateSource.MANUAL_APPLY.value,  # 用户主动申请的证书
                status=CertificateStatus.FAIL.value,
                email=email,
                sans=sans,
                folder_name=folder_name
            )
        except:
            pass
        
        return {
            "success": False,
            "message": f"Error starting certificate application: {str(e)}",
            "status": CertificateStatus.FAIL.value,
            "error": str(e)
        }

