# coding=utf-8

"""
删除文件或文件夹 Handler

此 Handler 用于删除文件系统中的文件或文件夹（通过 DELETE_FILE_OR_FOLDER Kafka 事件触发）。

使用场景：
- 用户在 FileFolderPage 中点击删除按钮时，会发送 DELETE_FILE_OR_FOLDER 事件
- Pipeline 服务接收事件后，调用此 Handler 删除指定的文件或文件夹
- 支持删除任意路径的文件或文件夹（不仅限于证书文件夹）

与 delete_folder.py 的区别：
- delete_file_or_folder.py: 可以删除文件或文件夹，参数是 store + path + item_type，用于文件浏览器直接删除场景
- delete_folder.py: 只删除文件夹，参数是 store + folder_name，用于证书删除场景
"""
import logging
import os
import shutil
from typing import Dict, Any

from .protocol import FileAppLike

logger = logging.getLogger(__name__)


def delete_file_or_folder(
    app: FileAppLike,
    store: str,
    path: str,
    item_type: str
) -> Dict[str, Any]:
    """
    删除文件或文件夹
    
    Args:
        app: FileApplication 实例
        store: 存储位置（websites 或 apis）
        path: 文件或文件夹路径（相对于 store 目录）
        item_type: 类型（"file" 或 "folder"）
    
    Returns:
        删除结果
    """
    try:
        base_dir = app.base_dir
        store_dir = os.path.join(base_dir, store.capitalize())
        target_path = os.path.join(store_dir, path)
        
        if not os.path.exists(target_path):
            logger.warning(f"⚠️  路径不存在: {target_path}")
            return {
                "success": False,
                "message": f"Path not found: {path}",
                "store": store,
                "path": path,
                "item_type": item_type
            }
        
        # 验证路径类型是否匹配
        is_file = os.path.isfile(target_path)
        is_dir = os.path.isdir(target_path)
        
        if item_type == "file" and not is_file:
            return {
                "success": False,
                "message": f"Path is not a file: {path}",
                "store": store,
                "path": path,
                "item_type": item_type
            }
        
        if item_type == "folder" and not is_dir:
            return {
                "success": False,
                "message": f"Path is not a folder: {path}",
                "store": store,
                "path": path,
                "item_type": item_type
            }
        
        # 删除文件或文件夹
        if is_file:
            os.remove(target_path)
            logger.info(f"✅ 删除文件成功: {target_path} (store: {store}, path: {path})")
        else:
            shutil.rmtree(target_path)
            logger.info(f"✅ 删除文件夹成功: {target_path} (store: {store}, path: {path})")
        
        return {
            "success": True,
            "message": f"Successfully deleted {item_type}: {store}/{path}",
            "store": store,
            "path": path,
            "item_type": item_type
        }
        
    except Exception as e:
        logger.error(f"❌ 删除失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error deleting {item_type}: {str(e)}",
            "store": store,
            "path": path,
            "item_type": item_type
        }

