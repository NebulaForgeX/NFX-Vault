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
    GetCertificateDetailRequest,
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
    get_certificate_detail,
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
            page: int = Query(1, ge=1, description="页码（从1开始）"),
            page_size: int = Query(20, ge=1, le=100, description="每页数量")
        ):
            """检查证书状态（从数据库读取，支持分页）"""
            try:
                request = GetCertificateListRequest(
                    store=store.value,
                    page=page,
                    page_size=page_size
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

        @router.get("/detail/{store}")
        async def get_certificate_detail_endpoint(
            store: CertStore,
            domain: str = Query(..., description="域名"),
            source: CertificateSource = Query(CertificateSource.AUTO, description="来源（auto 或 manual）")
        ):
            """获取单个证书的详细信息（包含证书内容和私钥）"""
            try:
                request = GetCertificateDetailRequest(
                    store=store.value,
                    domain=domain,
                    source=source
                )
                result = get_certificate_detail(
                    app=self.certificate_application,
                    request=request
                )
                if not result:
                    raise HTTPException(status_code=404, detail="Certificate not found")
                return result
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ 查询证书详情失败: {e}", exc_info=True)
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

