# coding=utf-8

"""
列出目录内容 Handler
"""
import logging
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

from .protocol import FileAppLike

logger = logging.getLogger(__name__)


def list_directory(
    app: FileAppLike,
    store: str,
    subpath: Optional[str] = None
) -> Dict[str, Any]:
    """
    列出目录内容
    
    Args:
        app: FileApplication 实例
        store: 存储位置（websites 或 apis）
        subpath: 子路径（相对于 store 目录），可选
        
    Returns:
        目录内容列表（包含文件和文件夹）
    """
    try:
        base_dir = app.base_dir
        store_dir = os.path.join(base_dir, store.capitalize())
        
        # 如果提供了 subpath，构建完整路径
        if subpath:
            # 防止路径遍历攻击
            subpath = subpath.lstrip('/').lstrip('\\')
            # 移除任何 .. 路径
            subpath = os.path.normpath(subpath).replace('..', '')
            target_dir = os.path.join(store_dir, subpath)
        else:
            target_dir = store_dir
        
        # 确保路径在 store_dir 内（防止路径遍历）
        target_dir = os.path.abspath(target_dir)
        store_dir_abs = os.path.abspath(store_dir)
        if not target_dir.startswith(store_dir_abs):
            logger.warning(f"⚠️ 路径遍历尝试: {target_dir}")
            return {
                "success": False,
                "message": "Invalid path",
                "items": []
            }
        
        if not os.path.exists(target_dir):
            return {
                "success": False,
                "message": f"Directory not found: {subpath or store}",
                "items": []
            }
        
        if not os.path.isdir(target_dir):
            return {
                "success": False,
                "message": "Path is not a directory",
                "items": []
            }
        
        # 列出目录内容
        items: List[Dict[str, Any]] = []
        try:
            entries = os.listdir(target_dir)
            entries.sort()  # 排序
            
            for entry in entries:
                entry_path = os.path.join(target_dir, entry)
                rel_path = os.path.relpath(entry_path, store_dir)
                
                # 跳过隐藏文件
                if entry.startswith('.'):
                    continue
                
                stat_info = os.stat(entry_path)
                is_dir = os.path.isdir(entry_path)
                
                items.append({
                    "name": entry,
                    "type": "directory" if is_dir else "file",
                    "path": rel_path.replace('\\', '/'),  # 统一使用 / 分隔符
                    "size": stat_info.st_size if not is_dir else None,
                    "modified": stat_info.st_mtime
                })
        except PermissionError:
            logger.error(f"❌ 无权限访问目录: {target_dir}")
            return {
                "success": False,
                "message": "Permission denied",
                "items": []
            }
        
        # 计算相对路径用于返回
        current_path = subpath.replace('\\', '/') if subpath else ""
        
        return {
            "success": True,
            "message": "Directory listed successfully",
            "store": store,
            "path": current_path,
            "items": items
        }
    except Exception as e:
        logger.error(f"❌ 列出目录失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error listing directory: {str(e)}",
            "items": []
        }

