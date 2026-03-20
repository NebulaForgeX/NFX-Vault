# coding=utf-8

"""
读取文件夹定时任务

定时读取证书文件夹并存储到数据库
"""
import logging
from typing import Dict, Any

from modules.applications.file.handler.read_folders_and_store import read_folders_and_store_certificates

logger = logging.getLogger(__name__)


async def read_folders_job(
    file_application,
    store: str
) -> Dict[str, Any]:
    """
    定时任务：读取文件夹并存储证书
    
    Args:
        file_application: FileApplication 实例
        store: 存储位置（websites 或 apis）
    
    Returns:
        任务执行结果
    """
    try:
        result = await read_folders_and_store_certificates(
            file_application,
            store
        )
        logger.info(f"✅ 定时任务完成: store={store}, processed={result.get('processed', 0)}")
        return result
    except Exception as e:
        logger.error(f"❌ 定时任务失败: store={store}, error={e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error reading folders: {str(e)}",
            "processed": 0
        }

