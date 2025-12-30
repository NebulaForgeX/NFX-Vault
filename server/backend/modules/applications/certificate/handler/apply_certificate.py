# coding=utf-8

"""
申请证书 Handler
"""
import logging
from typing import List, Optional, Dict, Any

from .protocol import CertificateAppLike
from enums.certificate_status import CertificateStatus
from enums.certificate_source import CertificateSource
from enums.certificate_store import CertificateStore

logger = logging.getLogger(__name__)


def apply_certificate(
    app: CertificateAppLike,
    domain: str,
    email: str,
    folder_name: str,
    sans: Optional[List[str]] = None,
    webroot: Optional[str] = None
) -> Dict[str, Any]:
    """
    申请 Let's Encrypt 证书（同步处理，等待完成）
    
    此方法会同步执行证书申请过程，等待 certbot 完成后再返回结果。
    证书申请完成后，会通过 Kafka 事件触发刷新，从文件夹读取证书并保存到数据库。
    
    注意：
    - 通过 Certbot 直接申请证书（使用 webroot 模式）
    - 申请的证书统一存储在 database store
    - 证书会保存到 Websites 或 Apis 文件夹中
    
    Args:
        app: CertificateApplication 实例
        domain: 主域名
        email: 邮箱地址（用于 Let's Encrypt 通知）
        folder_name: 文件夹名称（唯一标识符）
        sans: SANs 列表（可选）
        webroot: Webroot 路径（用于 HTTP-01 验证）
    
    Returns:
        返回证书申请结果（包含 success, message, status 等）
        - success: True 表示证书申请成功，False 表示失败
        - status: 证书状态（SUCCESS, FAIL, PROCESS）
        - message: 结果消息
        - error: 错误信息（如果有）
    """
    try:
        # 验证 email 格式（简单验证）
        if not email or "@" not in email:
            return {
                "success": False,
                "message": "Invalid email address",
                "status": CertificateStatus.FAIL.value,
                "error": "Invalid email address"
            }
        
        # 检查 TLS repository 是否初始化
        if not hasattr(app, 'tls_repo') or not app.tls_repo:
            return {
                "success": False,
                "message": "TLS repository not initialized",
                "status": CertificateStatus.FAIL.value,
                "error": "TLS repository not initialized"
            }
        
        logger.info(f"🚀 Starting certificate application for domain '{domain}' (synchronous)")
        
        # 先记录申请中的状态
        app.database_repo.create_or_update_certificate(
            store=CertificateStore.DATABASE.value,
            domain=domain,
            source=CertificateSource.AUTO.value,
            status=CertificateStatus.PROCESS.value,  # 申请中，状态为 process
            email=email,
            sans=sans,
            folder_name=folder_name
        )
        
        # 同步调用 TLS repository 申请证书（会等待 certbot 完成）
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
                # 清除缓存
                app.cache_repo.clear_store_cache(CertificateStore.DATABASE.value)
                
                # 触发 Kafka 事件来刷新证书（从文件夹读取并保存到数据库）
                if app.pipeline_repo:
                    app.pipeline_repo.send_refresh_event(CertificateStore.DATABASE.value, "apply")
                    logger.info(f"✅ Certificate application completed, refresh event sent for domain '{domain}'")
                else:
                    logger.warning("⚠️ Pipeline repository not initialized, cannot send refresh event")
                
                # 返回成功响应
                return {
                    "success": True,
                    "message": f"Certificate applied successfully for domain '{domain}'",
                    "status": CertificateStatus.SUCCESS.value,
                    "error": None
                }
            except Exception as e:
                logger.error(f"❌ Failed to send refresh event: {e}", exc_info=True)
                # 记录申请失败的状态
                app.database_repo.create_or_update_certificate(
                    store=CertificateStore.DATABASE.value,
                    domain=domain,
                    source=CertificateSource.AUTO.value,
                    status=CertificateStatus.FAIL.value,
                    email=email,
                    sans=sans,
                    folder_name=folder_name
                )
                return {
                    "success": False,
                    "message": f"Certificate applied but failed to refresh: {str(e)}",
                    "status": CertificateStatus.FAIL.value,
                    "error": str(e)
                }
        else:
            # 申请失败，记录失败状态到数据库
            error_msg = apply_result.get("error", "Unknown error")
            app.database_repo.create_or_update_certificate(
                store=CertificateStore.DATABASE.value,
                domain=domain,
                source=CertificateSource.AUTO.value,
                status=CertificateStatus.FAIL.value,
                email=email,
                sans=sans,
                folder_name=folder_name
            )
            logger.error(f"❌ Certificate application failed for domain '{domain}': {error_msg}")
            return {
                "success": False,
                "message": f"Certificate application failed for domain '{domain}': {error_msg}",
                "status": CertificateStatus.FAIL.value,
                "error": error_msg
            }
    
    except Exception as e:
        logger.error(f"❌ 申请证书异常: {e}", exc_info=True)
        # 记录失败状态
        try:
            app.database_repo.create_or_update_certificate(
                store=CertificateStore.DATABASE.value,
                domain=domain,
                source=CertificateSource.AUTO.value,
                status=CertificateStatus.FAIL.value,
                email=email,
                sans=sans,
                folder_name=folder_name
            )
        except:
            pass
        
        return {
            "success": False,
            "message": f"Error applying certificate: {str(e)}",
            "status": CertificateStatus.FAIL.value,
            "error": str(e)
        }

