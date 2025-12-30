# coding=utf-8

"""
发布刷新事件 Operation
"""
import logging
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import PublishRefreshEventRequest

logger = logging.getLogger(__name__)


def publish_refresh_event(
    app: CertificateApplication,
    request: PublishRefreshEventRequest
):
    """
    发布读取证书文件事件（发送 Kafka 事件），实际读取由 Kafka Consumer 触发
    
    Args:
        app: CertificateApplication 实例
        request: 发布刷新事件请求 DTO
    
    Returns:
        None
    """
    logger.info(f"📤 HTTP 请求发布读取证书文件事件: store={request.store}, trigger={request.trigger}")
    app.publish_refresh_event(request.store, request.trigger)

