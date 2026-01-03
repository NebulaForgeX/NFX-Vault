# coding=utf-8

"""
缓存失效 Handler
"""
import logging
from typing import List

from .protocol import CertificateAppLike

logger = logging.getLogger(__name__)


def invalidate_cache(
    app: CertificateAppLike,
    stores: List[str],
    trigger: str = "manual"
) -> bool:
    """
    发布缓存失效事件（通过 Kafka）
    
    此方法只发送 Kafka 事件，不直接清除缓存。
    缓存清除由 Pipeline 服务（Kafka Consumer）收到事件后执行。
    
    Args:
        app: CertificateApplication 实例
        stores: 存储位置列表（websites, apis, database）
        trigger: 触发来源（manual, add, update, delete）
    
    Returns:
        是否成功发布事件
    """
    if not app.pipeline_repo:
        logger.warning("⚠️  Pipeline 仓库未初始化，无法发送缓存失效事件")
        return False
    
    try:
        # 只发送 Kafka 事件，不直接清除缓存
        # 缓存清除由 Pipeline 服务（Kafka Consumer）收到事件后执行
        success = app.pipeline_repo.send_cache_invalidate_event(stores, trigger)
        
        if success:
            logger.info(f"✅ 缓存失效事件已发布: stores={stores}, trigger={trigger}")
        else:
            logger.warning(f"⚠️  发布缓存失效事件失败: stores={stores}")
        
        return success
        
    except Exception as e:
        logger.error(f"❌ 发布缓存失效事件失败: {e}", exc_info=True)
        return False

