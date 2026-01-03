# coding=utf-8

"""
通过 ID 获取证书详情操作
"""
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException

from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import GetCertificateDetailByIdRequest

logger = logging.getLogger(__name__)


def get_certificate_detail_by_id(
    app: CertificateApplication,
    request: GetCertificateDetailByIdRequest
) -> Dict[str, Any]:
    """
    通过 ID 获取证书详情
    
    Args:
        app: CertificateApplication 实例
        request: 获取证书详情请求
    
    Returns:
        证书详情字典
    """
    try:
        result = app.get_certificate_detail_by_id(
            certificate_id=request.certificate_id
        )
        if not result:
            raise HTTPException(status_code=404, detail="Certificate not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 通过 ID 查询证书详情失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

