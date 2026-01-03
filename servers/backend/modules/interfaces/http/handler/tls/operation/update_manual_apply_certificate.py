# coding=utf-8

"""
更新手动申请证书 Operation
"""
import logging
from fastapi import HTTPException
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import UpdateManualApplyCertificateRequest

logger = logging.getLogger(__name__)


def update_manual_apply_certificate(
    app: CertificateApplication,
    request: UpdateManualApplyCertificateRequest
):
    """
    更新手动申请的证书（MANUAL_APPLY），可以更新 folder_name 和 store
    
    Args:
        app: CertificateApplication 实例
        request: 更新证书请求 DTO
    
    Returns:
        更新结果
    """
    # 验证 folder_name
    if not request.folder_name:
        raise HTTPException(status_code=400, detail="folder_name is required for MANUAL_APPLY certificates")
    
    return app.update_manual_apply_certificate(
        domain=request.domain,
        folder_name=request.folder_name,
        store=request.store
    )

