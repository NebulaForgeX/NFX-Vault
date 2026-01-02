# coding=utf-8

"""
删除证书 Handler
"""
import logging
from typing import Dict, Any

from .protocol import CertificateAppLike
from enums.certificate_store import CertificateStore

logger = logging.getLogger(__name__)


def delete_certificate(
    app: CertificateAppLike,
    certificate_id: str
) -> Dict[str, Any]:
    """
    删除证书
    
    如果证书的 store 是 'apis' 或 'websites'，会发送 Kafka 事件删除对应的文件夹
    然后删除数据库记录
    
    Args:
        app: CertificateApplication 实例
        certificate_id: 证书 ID
    
    Returns:
        删除结果（包含 success, message 等）
    """
    try:
        # 先获取证书详情
        cert_detail = app.database_repo.get_certificate_by_id(certificate_id)
        if not cert_detail:
            return {
                "success": False,
                "message": f"Certificate not found: certificate_id='{certificate_id}'"
            }
        
        store = cert_detail.get("store", "")
        folder_name = cert_detail.get("folder_name")
        
        # 如果 store 是 apis 或 websites，发送 Kafka 事件删除文件夹
        if store in [CertificateStore.APIS.value, CertificateStore.WEBSITES.value] and folder_name:
            if app.pipeline_repo:
                try:
                    app.pipeline_repo.send_delete_folder_event(store, folder_name)
                    logger.info(f"✅ 已发送删除文件夹事件: store={store}, folder_name={folder_name}")
                except Exception as e:
                    logger.warning(f"⚠️  发送删除文件夹事件失败: {e}")
        
        # 删除数据库记录
        success = app.database_repo.delete_certificate_by_id(certificate_id)
        
        if success:
            # 发布缓存失效事件（通过 Kafka）
            app.invalidate_cache(["websites", "apis", "database"], trigger="delete")
            
            return {
                "success": True,
                "message": f"Certificate deleted successfully: certificate_id='{certificate_id}'"
            }
        else:
            return {
                "success": False,
                "message": f"Certificate not found: certificate_id='{certificate_id}'"
            }
    except Exception as e:
        logger.error(f"❌ 删除证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error deleting certificate: {str(e)}"
        }
