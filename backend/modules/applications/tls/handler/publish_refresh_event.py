# coding=utf-8

"""
发布刷新事件 Handler
"""
import logging

from .protocol import CertificateAppLike

logger = logging.getLogger(__name__)


def publish_refresh_event(
    app: CertificateAppLike,
    store: str,
    trigger: str = "manual"
):
    """
    发布刷新事件（发送 Kafka 事件）
    
    此方法只发送事件，不实际读取文件
    实际读取由 Kafka Consumer 触发
    
    Args:
        app: CertificateApplication 实例
        store: 存储位置（websites 或 apis）
        trigger: 触发来源（manual, scheduled, api, startup）
    """
    if not app.pipeline_repo:
        logger.warning("⚠️  Pipeline 仓库未初始化，无法发送 Kafka 事件")
        return
    
    try:
        app.pipeline_repo.send_refresh_event(store, trigger)
        logger.info(f"✅ 已发布刷新事件: store={store}, trigger={trigger}")
    except Exception as e:
        logger.error(f"❌ 发布刷新事件失败: {e}", exc_info=True)
        raise

