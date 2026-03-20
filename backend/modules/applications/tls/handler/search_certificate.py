# coding=utf-8

"""
搜索证书 Handler
"""
import logging
from typing import Optional, Dict, Any, Tuple, List

from .protocol import CertificateAppLike

logger = logging.getLogger(__name__)


def search_certificate(
    app: CertificateAppLike,
    keyword: str,
    store: Optional[str] = None,
    source: Optional[str] = None,
    offset: int = 0,
    limit: int = 20
) -> Dict[str, Any]:
    """
    搜索证书
    
    Args:
        app: CertificateApplication 实例
        keyword: 搜索关键词（域名、文件夹名等）
        store: 存储位置过滤（可选）
        source: 来源过滤（可选）
        offset: 偏移量（从0开始）
        limit: 每页数量
    
    Returns:
        返回搜索结果（包含 items 列表和 total 总数）
    """
    try:
        # 调用数据库仓库搜索（使用 offset/limit）
        items, total = app.database_repo.search_certificates(
            keyword=keyword,
            store=store,
            source=source,
            offset=offset,
            limit=limit
        )
        
        return {
            "success": True,
            "message": f"Found {total} certificates",
            "items": items,
            "total": total
        }
    
    except Exception as e:
        logger.error(f"❌ 搜索证书异常: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error searching certificates: {str(e)}",
            "items": [],
            "total": 0
        }

