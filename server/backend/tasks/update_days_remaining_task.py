# coding=utf-8

"""
更新证书剩余天数定时任务

每天定时更新所有证书的剩余天数和有效性状态
"""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def update_days_remaining_job(
    database_repo
) -> Dict[str, Any]:
    """
    定时任务：更新所有证书的剩余天数
    
    Args:
        database_repo: CertificateDatabase 实例
    
    Returns:
        任务执行结果
    """
    try:
        updated_count, total_count = database_repo.update_all_days_remaining()
        logger.info(f"✅ 更新剩余天数任务完成: 更新 {updated_count}/{total_count} 个证书")
        return {
            "success": True,
            "message": f"Updated {updated_count}/{total_count} certificates",
            "updated": updated_count,
            "total": total_count
        }
    except Exception as e:
        logger.error(f"❌ 更新剩余天数任务失败: error={e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error updating days remaining: {str(e)}",
            "updated": 0,
            "total": 0
        }

