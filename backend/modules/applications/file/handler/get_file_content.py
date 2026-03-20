# coding=utf-8

"""
获取文件内容 Handler（文本格式）
"""
import logging
import os
from typing import Dict, Any, Optional

from .protocol import FileAppLike

logger = logging.getLogger(__name__)


def get_file_content(
    app: FileAppLike,
    store: str,
    file_path: str
) -> Dict[str, Any]:
    """
    获取文件内容（文本格式）
    
    Args:
        app: FileApplication 实例
        store: 存储位置（websites 或 apis）
        file_path: 文件路径（相对于 store 目录）
        
    Returns:
        文件内容字典（包含 content, filename 等）
    """
    try:
        base_dir = app.base_dir
        store_dir = os.path.join(base_dir, store.capitalize())
        
        # 防止路径遍历攻击
        file_path = file_path.lstrip('/').lstrip('\\')
        file_path = os.path.normpath(file_path).replace('..', '')
        target_file = os.path.join(store_dir, file_path)
        
        # 确保路径在 store_dir 内
        target_file = os.path.abspath(target_file)
        store_dir_abs = os.path.abspath(store_dir)
        if not target_file.startswith(store_dir_abs):
            logger.warning(f"⚠️ 路径遍历尝试: {target_file}")
            return {
                "success": False,
                "message": "Invalid path",
                "content": None,
                "filename": None
            }
        
        if not os.path.exists(target_file):
            return {
                "success": False,
                "message": f"File not found: {file_path}",
                "content": None,
                "filename": None
            }
        
        if not os.path.isfile(target_file):
            return {
                "success": False,
                "message": "Path is not a file",
                "content": None,
                "filename": None
            }
        
        # 读取文件内容（文本格式）
        try:
            # 尝试以文本格式读取
            with open(target_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            filename = os.path.basename(target_file)
            
            return {
                "success": True,
                "message": "File read successfully",
                "content": content,
                "filename": filename
            }
        except UnicodeDecodeError:
            # 如果无法以 UTF-8 读取，尝试其他编码
            try:
                with open(target_file, 'r', encoding='latin-1') as f:
                    content = f.read()
                filename = os.path.basename(target_file)
                return {
                    "success": True,
                    "message": "File read successfully",
                    "content": content,
                    "filename": filename
                }
            except Exception as e:
                logger.error(f"❌ 无法读取文件内容: {e}")
                return {
                    "success": False,
                    "message": "File is not a text file or cannot be decoded",
                    "content": None,
                    "filename": None
                }
        except PermissionError:
            logger.error(f"❌ 无权限读取文件: {target_file}")
            return {
                "success": False,
                "message": "Permission denied",
                "content": None,
                "filename": None
            }
    except Exception as e:
        logger.error(f"❌ 读取文件失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error reading file: {str(e)}",
            "content": None,
            "filename": None
        }

