# coding=utf-8

"""
搜索证书操作
"""
import logging
from typing import List, Optional, Tuple, Dict, Any

from models.tls_certificate import TLSCertificate
from .protocol import CertificateDatabaseLike

logger = logging.getLogger(__name__)


def search_certificates(
    repo: CertificateDatabaseLike,
    keyword: str,
    store: Optional[str] = None,
    source: Optional[str] = None,
    offset: int = 0,
    limit: int = 20
) -> Tuple[List[Dict[str, Any]], int]:
    """
    搜索证书（根据关键词匹配域名、文件夹名等）
    
    Args:
        repo: CertificateDatabase 实例
        keyword: 搜索关键词
        store: 存储位置过滤（可选）
        source: 来源过滤（可选）
        offset: 偏移量（从0开始）
        limit: 每页数量
    
    Returns:
        (证书列表, 总数)
    """
    if not repo.db_session or not hasattr(repo.db_session, 'get_session'):
        logger.warning("⚠️  数据库会话未初始化，无法搜索证书")
        return [], 0
    
    try:
        with repo.db_session.get_session() as session:
            # 构建查询
            query = session.query(TLSCertificate)
            
            # 关键词搜索（匹配 domain 或 folder_name）
            keyword_filter = (
                TLSCertificate.domain.like(f"%{keyword}%") |
                TLSCertificate.folder_name.like(f"%{keyword}%")
            )
            query = query.filter(keyword_filter)
            
            # 可选的 store 过滤
            if store:
                query = query.filter(TLSCertificate.store == store)
            
            # 可选的 source 过滤
            if source:
                query = query.filter(TLSCertificate.source == source)
            
            # 获取总数
            total = query.count()
            
            # 分页（使用 offset/limit）
            certificates = query.order_by(TLSCertificate.created_at.desc()).offset(offset).limit(limit).all()
            
            # 转换为字典列表
            result = []
            for cert in certificates:
                cert_dict = {
                    "id": cert.id,
                    "store": cert.store,
                    "domain": cert.domain,
                    "source": cert.source,
                    "status": cert.status,
                    "email": cert.email,
                    "sans": cert.sans,
                    "folder_name": cert.folder_name,
                    "issuer": cert.issuer,
                    "not_before": cert.not_before.isoformat() if cert.not_before else None,
                    "not_after": cert.not_after.isoformat() if cert.not_after else None,
                    "is_valid": cert.is_valid,
                    "days_remaining": cert.days_remaining,
                    "created_at": cert.created_at.isoformat() if cert.created_at else None,
                    "updated_at": cert.updated_at.isoformat() if cert.updated_at else None,
                }
                result.append(cert_dict)
            
            return result, total
    
    except Exception as e:
        logger.error(f"❌ 搜索证书失败: keyword={keyword}, error={e}", exc_info=True)
        return [], 0

