# coding=utf-8

"""
导出证书 Handler
"""
import logging
from typing import Dict, Any

from .protocol import FileAppLike

logger = logging.getLogger(__name__)


def export_certificates(
    app: FileAppLike,
    store: str
) -> Dict[str, Any]:
    """
    导出证书
    
    Args:
        app: FileApplication 实例
        store: 存储位置（websites 或 apis）
    
    Returns:
        导出结果
    """
    try:
        # 从数据库获取所有证书（字典格式）
        cert_dicts, total = app.database_repo.get_certificate_list(store, page=1, page_size=10000)
        
        # 需要获取完整的证书详情（包括证书内容和私钥）
        exported_certs = []
        for cert_dict in cert_dicts:
            domain = cert_dict.get("domain")
            source = cert_dict.get("source", "auto")
            if not domain:
                continue
            
            # 获取完整的证书详情
            cert_detail = app.database_repo.get_certificate_by_domain(store, domain, source)
            if cert_detail:
                # 导出证书到文件夹（只有用户选择导出时才导出）
                folder_name = cert_detail.get("folder_name")
                if folder_name:
                    # 写入证书文件到对应文件夹
                    import os
                    
                    base_dir = app.base_dir
                    store_dir = os.path.join(base_dir, store.capitalize())
                    folder_path = os.path.join(store_dir, folder_name)
                    
                    # 确保文件夹存在
                    os.makedirs(folder_path, exist_ok=True)
                    
                    # 写入证书和私钥文件
                    cert_file = os.path.join(folder_path, "cert.crt")
                    key_file = os.path.join(folder_path, "key.key")
                    
                    with open(cert_file, 'w') as f:
                        f.write(cert_detail.get("certificate", ""))
                    
                    with open(key_file, 'w') as f:
                        f.write(cert_detail.get("private_key", ""))
                    
                    logger.info(f"✅ 导出证书到文件夹: {folder_path}")
                
                exported_certs.append({
                    "domain": cert_detail.get("domain"),
                    "store": cert_detail.get("store", store),
                    "folder_name": cert_detail.get("folder_name"),
                    "source": cert_detail.get("source", "auto"),
                    "status": cert_detail.get("status"),
                    "certificate": cert_detail.get("certificate"),
                    "privateKey": cert_detail.get("private_key"),
                    "sans": cert_detail.get("sans") or [],
                    "issuer": cert_detail.get("issuer"),
                    "notBefore": cert_detail.get("not_before").isoformat() if cert_detail.get("not_before") and hasattr(cert_detail.get("not_before"), "isoformat") else None,
                    "notAfter": cert_detail.get("not_after").isoformat() if cert_detail.get("not_after") and hasattr(cert_detail.get("not_after"), "isoformat") else None,
                    "isValid": cert_detail.get("is_valid"),
                    "daysRemaining": cert_detail.get("days_remaining")
                })
        
        return {
            "success": True,
            "message": f"Successfully exported {len(exported_certs)} certificates from {store}",
            "certificates": exported_certs,
            "total": len(exported_certs)
        }
        
    except Exception as e:
        logger.error(f"❌ 导出证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error exporting certificates: {str(e)}",
            "certificates": [],
            "total": 0
        }

