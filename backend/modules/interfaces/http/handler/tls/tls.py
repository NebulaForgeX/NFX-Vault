# coding=utf-8

"""
TLS 证书 HTTP Handler

处理证书相关的 HTTP 请求
"""
import logging
from enum import Enum
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from modules.applications.tls import CertificateApplication
from enums.certificate_source import CertificateSource
from modules.interfaces.http.dto.reqdto import (
    GetCertificateListRequest,
    GetCertificateDetailByIdRequest,
    CreateCertificateRequest,
    UpdateManualAddCertificateRequest,
    UpdateManualApplyCertificateRequest,
    DeleteCertificateRequest,
    ApplyCertificateRequest,
    ReapplyAutoCertificateRequest,
    ReapplyManualApplyCertificateRequest,
    ReapplyManualAddCertificateRequest,
    SearchCertificateRequest,
    PublishRefreshEventRequest,
    InvalidateCacheRequest,
)
from modules.interfaces.http.dto.respdto import CertificateResponse
from .operation import (
    get_certificate_list,
    get_certificate_detail_by_id,
    create_certificate,
    update_manual_add_certificate,
    update_manual_apply_certificate,
    delete_certificate,
    apply_certificate,
    reapply_auto_certificate,
    reapply_manual_apply_certificate,
    reapply_manual_add_certificate,
    search_certificate,
    publish_refresh_event,
    invalidate_cache,
)

logger = logging.getLogger(__name__)


class CertStore(str, Enum):
    """证书存储位置枚举"""
    websites = "websites"
    apis = "apis"
    database = "database"


class CertificateHTTPHandler:
    """证书 HTTP 处理器"""
    def __init__(self, certificate_application: CertificateApplication):
        self.certificate_application = certificate_application
    
    def create_router(self) -> APIRouter:
        """创建 TLS 证书路由"""
        router = APIRouter(prefix="/vault/tls", tags=["tls"])

        @router.get("/check/{store}")
        async def check_certificates(
            store: CertStore,
            offset: int = Query(0, ge=0, description="偏移量（从0开始）"),
            limit: int = Query(20, ge=1, le=100, description="每页数量")
        ):
            """检查证书状态（从数据库读取，支持分页）"""
            try:
                request = GetCertificateListRequest(
                    store=store.value,
                    offset=offset,
                    limit=limit
                )
                result = get_certificate_list(
                    app=self.certificate_application,
                    request=request
                )
                return result
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 查询证书列表失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.get("/detail-by-id/{certificate_id}")
        async def get_certificate_detail_by_id_endpoint(certificate_id: str):
            """通过 ID 获取单个证书的详细信息（包含证书内容和私钥）"""
            try:
                request = GetCertificateDetailByIdRequest(certificate_id=certificate_id)
                result = get_certificate_detail_by_id(
                    app=self.certificate_application,
                    request=request
                )
                return result
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 通过 ID 查询证书详情失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.post("/refresh/{store}")
        async def refresh_certificates(store: CertStore):
            """手动触发读取证书文件（发送 Kafka 事件）"""
            if store == CertStore.database:
                raise HTTPException(status_code=400, detail="store must be 'websites' or 'apis'")
            try:
                request = PublishRefreshEventRequest(
                    store=store.value,
                    trigger="api"
                )
                publish_refresh_event(
                    app=self.certificate_application,
                    request=request
                )
                return {
                    "success": True,
                    "message": f"Certificate refresh event published for {store.value}",
                    "processed": 0
                }
            except Exception as e:
                logger.error(f"❌ 发布刷新证书事件失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))
        
        @router.post("/invalidate-cache/{store}")
        async def invalidate_cache_endpoint(store: CertStore):
            """手动触发缓存失效（发送 Kafka 事件）"""
            try:
                request = InvalidateCacheRequest(
                    store=store.value,
                    trigger="api"
                )
                result = invalidate_cache(
                    app=self.certificate_application,
                    request=request
                )
                return result
            except Exception as e:
                logger.error(f"❌ 触发缓存失效失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.post("/create", response_model=CertificateResponse)
        async def create_certificate_endpoint(request: CreateCertificateRequest):
            """创建证书（手动添加）"""
            if request.store not in ["websites", "apis", "database"]:
                raise HTTPException(status_code=400, detail="store must be 'websites', 'apis' or 'database'")
            try:
                result = create_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 创建证书失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.put("/update/manual-add", response_model=CertificateResponse)
        async def update_manual_add_certificate_endpoint(request: UpdateManualAddCertificateRequest):
            """更新手动添加的证书（MANUAL_ADD）"""
            try:
                result = update_manual_add_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 更新手动添加证书失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))
        
        @router.put("/update/manual-apply", response_model=CertificateResponse)
        async def update_manual_apply_certificate_endpoint(request: UpdateManualApplyCertificateRequest):
            """更新手动申请的证书（MANUAL_APPLY），只能更新 folder_name"""
            try:
                result = update_manual_apply_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 更新手动申请证书失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.delete("/delete", response_model=CertificateResponse)
        async def delete_certificate_endpoint(request: DeleteCertificateRequest):
            """删除证书（只删除数据库记录，不影响文件）"""
            try:
                result = delete_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 删除证书失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.post("/apply", response_model=CertificateResponse)
        async def apply_certificate_endpoint(request: ApplyCertificateRequest):
            """申请 Let's Encrypt 证书（统一存储在 database）"""
            try:
                result = apply_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 申请证书失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.post("/reapply/auto", response_model=CertificateResponse)
        async def reapply_auto_certificate_endpoint(request: ReapplyAutoCertificateRequest):
            """AUTO 证书重新申请（apply 后写回文件夹，不修改 domain 和 folder_name）"""
            try:
                result = reapply_auto_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ AUTO 证书重新申请失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.post("/reapply/manual-apply", response_model=CertificateResponse)
        async def reapply_manual_apply_certificate_endpoint(request: ReapplyManualApplyCertificateRequest):
            """MANUAL_APPLY 证书重新申请（正常 apply 流程）"""
            try:
                result = reapply_manual_apply_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ MANUAL_APPLY 证书重新申请失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.post("/reapply/manual-add", response_model=CertificateResponse)
        async def reapply_manual_add_certificate_endpoint(request: ReapplyManualAddCertificateRequest):
            """MANUAL_ADD 证书重新申请（只更新证书内容和私钥）"""
            try:
                result = reapply_manual_add_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return CertificateResponse(**result)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ MANUAL_ADD 证书重新申请失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

        @router.post("/search")
        async def search_certificate_endpoint(request: SearchCertificateRequest):
            """搜索证书"""
            try:
                result = search_certificate(
                    app=self.certificate_application,
                    request=request
                )
                return result
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 搜索证书失败: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))


        return router

