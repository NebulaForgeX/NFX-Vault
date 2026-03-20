# coding=utf-8

"""
缓存失效 Operation
"""
import logging
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import InvalidateCacheRequest

logger = logging.getLogger(__name__)


def invalidate_cache(
    app: CertificateApplication,
    request: InvalidateCacheRequest
):
    """
    触发缓存失效（发送 Kafka 事件）
    
    Args:
        app: CertificateApplication 实例
        request: 缓存失效请求 DTO
    
    Returns:
        缓存失效结果
    """
    logger.info(f"📤 HTTP 请求触发缓存失效: store={request.store}, trigger={request.trigger}")
    success = app.invalidate_cache([request.store], request.trigger)
    return {
        "success": success,
        "message": f"Cache invalidate event published for {request.store}" if success else f"Failed to publish cache invalidate event for {request.store}",
    }

