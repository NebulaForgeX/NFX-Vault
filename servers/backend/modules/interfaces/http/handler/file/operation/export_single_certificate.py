# coding=utf-8

"""
导出单个证书操作
"""
import logging
from typing import Dict, Any
from fastapi import HTTPException

from modules.applications.file import FileApplication
from modules.interfaces.http.dto.reqdto.file import ExportSingleCertificateRequest

logger = logging.getLogger(__name__)


def export_single_certificate(
    app: FileApplication,
    request: ExportSingleCertificateRequest
) -> Dict[str, Any]:
    """
    导出单个证书到指定文件夹
    
    Args:
        app: FileApplication 实例
        request: 导出单个证书请求
    
    Returns:
        导出结果
    """
    try:
        result = app.export_single_certificate(
            certificate_id=request.certificate_id,
            store=request.store
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 导出单个证书失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

