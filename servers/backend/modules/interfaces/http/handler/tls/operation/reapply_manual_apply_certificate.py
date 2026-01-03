# coding=utf-8

"""
MANUAL_APPLY 证书重新申请 Operation
"""
import logging
from fastapi import HTTPException
from modules.applications.tls import CertificateApplication
from modules.interfaces.http.dto.reqdto.certificate import ReapplyManualApplyCertificateRequest
from enums.certificate_source import CertificateSource

logger = logging.getLogger(__name__)


def reapply_manual_apply_certificate(
    app: CertificateApplication,
    request: ReapplyManualApplyCertificateRequest
):
    """
    MANUAL_APPLY 证书重新申请（正常 apply 流程）
    
    Args:
        app: CertificateApplication 实例
        request: 重新申请证书请求 DTO
    
    Returns:
        重新申请结果
    """
    # 验证证书是否存在
    original_cert = app.database_repo.get_certificate_by_id(request.certificate_id)
    if not original_cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # 验证证书 source 是 MANUAL_APPLY
    if original_cert.get("source") != CertificateSource.MANUAL_APPLY.value:
        raise HTTPException(
            status_code=400, 
            detail=f"Certificate source is not MANUAL_APPLY, got {original_cert.get('source')}"
        )
    
    # 检查 TLS repository 是否初始化
    if not hasattr(app, 'tls_repo') or not app.tls_repo:
        raise HTTPException(status_code=500, detail="TLS repository not initialized")
    
    return app.reapply_manual_apply_certificate(
        certificate_id=request.certificate_id,
        domain=request.domain,
        email=request.email,
        folder_name=request.folder_name,
        sans=request.sans,
        webroot=request.webroot,
        force_renewal=request.force_renewal or False
    )

