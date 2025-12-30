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
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    """
    搜索证书
    
    Args:
        app: CertificateApplication 实例
        keyword: 搜索关键词（域名、文件夹名等）
        store: 存储位置过滤（可选）
        source: 来源过滤（可选）
        page: 页码
        page_size: 每页数量
    
    Returns:
        返回搜索结果（包含 certificates 列表和 total 总数）
    """
    try:
        # 调用数据库仓库搜索
        certificates, total = app.database_repo.search_certificates(
            keyword=keyword,
            store=store,
            source=source,
            page=page,
            page_size=page_size
        )
        
        return {
            "success": True,
            "message": f"Found {total} certificates",
            "certificates": certificates,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    except Exception as e:
        logger.error(f"❌ 搜索证书异常: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error searching certificates: {str(e)}",
            "certificates": [],
            "total": 0,
            "page": page,
            "page_size": page_size
        }

