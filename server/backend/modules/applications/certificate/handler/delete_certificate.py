# coding=utf-8

"""
删除证书 Handler
"""
import logging
from typing import Dict, Any

from .protocol import CertificateAppLike
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


def delete_certificate(
    app: CertificateAppLike,
    domain: str,
    source: CertificateSource
) -> Dict[str, Any]:
    """
    删除证书（只删除数据库记录，不影响 acme.json 文件）
    
    Args:
        app: CertificateApplication 实例
        domain: 域名
        source: 来源（CertificateSource枚举）
    
    Returns:
        删除结果（包含 success, message 等）
    """
    try:
        # 转换为字符串（枚举继承自str，可以直接使用.value）
        source_str = source.value
        success = app.database_repo.delete_certificate(domain, source_str)
        
        if success:
            # 发布缓存失效事件（通过 Kafka）
            app.invalidate_cache(["websites", "apis", "database"], trigger="delete")
            
            # 发送 Kafka 事件通知前端刷新（删除操作不需要从 acme.json 读取，只需要通知前端刷新列表）
            if app.pipeline_repo:
                try:
                    app.pipeline_repo.send_refresh_event("websites", "delete")
                    app.pipeline_repo.send_refresh_event("apis", "delete")
                    logger.info(f"✅ Certificate deleted, refresh event sent for domain '{domain}'")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to send refresh event: {e}")
            
            return {
                "success": True,
                "message": f"Certificate deleted successfully: domain='{domain}', source='{source_str}'"
            }
        else:
            return {
                "success": False,
                "message": f"Certificate not found: domain='{domain}', source='{source_str}'"
            }
    except Exception as e:
        logger.error(f"❌ 删除证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error deleting certificate: {str(e)}"
        }

