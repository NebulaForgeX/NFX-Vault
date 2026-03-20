# coding=utf-8

"""
删除文件夹 Handler

此 Handler 用于删除证书对应的文件夹（通过 DELETE_FOLDER Kafka 事件触发）。

使用场景：
- 当证书被删除时，如果证书的 store 是 'apis' 或 'websites'，会发送 DELETE_FOLDER 事件
- Pipeline 服务接收事件后，调用此 Handler 删除对应的文件夹（Certs/Websites/{folder_name} 或 Certs/Apis/{folder_name}）

与 delete_file_or_folder.py 的区别：
- delete_folder.py: 只删除文件夹，参数是 store + folder_name，用于证书删除场景
- delete_file_or_folder.py: 可以删除文件或文件夹，参数是 store + path + item_type，用于文件浏览器直接删除场景
"""
import logging
import os
import shutil
from typing import Dict, Any

from .protocol import FileAppLike

logger = logging.getLogger(__name__)


def delete_folder(
    app: FileAppLike,
    store: str,
    folder_name: str
) -> Dict[str, Any]:
    """
    删除证书文件夹
    
    Args:
        app: FileApplication 实例
        store: 存储位置（websites 或 apis）
        folder_name: 文件夹名称
    
    Returns:
        删除结果
    """
    try:
        base_dir = app.base_dir
        store_dir = os.path.join(base_dir, store.capitalize())
        folder_path = os.path.join(store_dir, folder_name)
        
        if not os.path.exists(folder_path):
            logger.warning(f"⚠️  文件夹不存在: {folder_path}")
            return {
                "success": False,
                "message": f"Folder not found: {folder_path}",
                "store": store,
                "folder_name": folder_name
            }
        
        # 删除文件夹
        shutil.rmtree(folder_path)
        logger.info(f"✅ 删除文件夹成功: {folder_path} (store: {store}, folder_name: {folder_name})")
        
        return {
            "success": True,
            "message": f"Successfully deleted folder: {store}/{folder_name}",
            "store": store,
            "folder_name": folder_name
        }
        
    except Exception as e:
        logger.error(f"❌ 删除文件夹失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error deleting folder: {str(e)}",
            "store": store,
            "folder_name": folder_name
        }

