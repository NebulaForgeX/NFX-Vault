# coding=utf-8

"""
TLS 证书路由

使用工厂函数创建路由，通过依赖注入传递服务
"""
import logging
from enum import Enum
from fastapi import APIRouter, HTTPException, Query

from modules.interfaces.http.handler.certificate import CertificateHTTPHandler
from enums.certificate_source import CertificateSource
from modules.interfaces.http.dto.reqdto import (
    CreateCertificateRequest,
    UpdateManualAddCertificateRequest,
    UpdateManualApplyCertificateRequest,
    DeleteCertificateRequest,
    ApplyCertificateRequest,
)
from modules.interfaces.http.dto.respdto import (
    CertificateResponse,
)

logger = logging.getLogger(__name__)


class CertStore(str, Enum):
    """证书存储位置枚举"""
    websites = "websites"
    apis = "apis"
    database = "database"


def create_tls_router(handler: CertificateHTTPHandler) -> APIRouter:
    """
    创建 TLS 证书路由
    
    Args:
        handler: TLS 证书 HTTP 处理器
    
    Returns:
        APIRouter: TLS 证书路由
    """
    router = APIRouter(prefix="/vault/tls", tags=["tls"])

    @router.get("/check/{store}")
    async def check_certificates(
        store: CertStore,
        page: int = Query(1, ge=1, description="页码（从1开始）"),
        page_size: int = Query(20, ge=1, le=100, description="每页数量")
    ):
        """检查证书状态（从数据库读取，支持分页）"""
        try:
            result = handler.get_certificate_list(
                store=store.value,
                page=page,
                page_size=page_size
            )
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 查询证书列表失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/detail/{store}")
    async def get_certificate_detail(
        store: CertStore,
        domain: str = Query(..., description="域名"),
        source: CertificateSource = Query(CertificateSource.AUTO, description="来源（auto 或 manual）")
    ):
        """获取单个证书的详细信息（包含证书内容和私钥）"""
        try:
            result = handler.get_certificate_detail(
                store=store.value,
                domain=domain,
                source=source
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
            # 发送 Kafka 事件，不直接处理
            handler.publish_read_certificate_file(store.value, trigger="api")
            return {
                "success": True,
                "message": f"Certificate refresh event published for {store.value}",
                "processed": 0  # 实际处理由 Kafka Consumer 完成
            }
        except Exception as e:
            logger.error(f"❌ 发布刷新证书事件失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/invalidate-cache/{store}")
    async def invalidate_cache(store: CertStore):  # pyright: ignore[reportUnusedFunction]
        """手动触发缓存失效（发送 Kafka 事件）"""
        try:
            result = handler.invalidate_cache(store.value, trigger="api")
            return result
        except Exception as e:
            logger.error(f"❌ 触发缓存失效失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/create", response_model=CertificateResponse)
    async def create_certificate(request: CreateCertificateRequest):
        """创建证书（手动添加）"""
        if request.store not in ["websites", "apis", "database"]:
            raise HTTPException(status_code=400, detail="store must be 'websites', 'apis' or 'database'")
        try:
            result = handler.create_certificate(
                store=request.store,
                domain=request.domain,
                certificate=request.certificate,
                private_key=request.private_key,
                sans=request.sans,
                folder_name=request.folder_name,
                email=request.email,
                issuer=request.issuer
            )
            return CertificateResponse(**result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 创建证书失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @router.put("/update/manual-add", response_model=CertificateResponse)
    async def update_manual_add_certificate(request: UpdateManualAddCertificateRequest):
        """更新手动添加的证书（MANUAL_ADD）"""
        try:
            result = handler.update_manual_add_certificate(
                certificate_id=request.certificate_id,
                certificate=request.certificate,
                private_key=request.private_key,
                store=request.store,
                sans=request.sans,
                folder_name=request.folder_name,
                email=request.email
            )
            return CertificateResponse(**result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 更新手动添加证书失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.put("/update/manual-apply", response_model=CertificateResponse)
    async def update_manual_apply_certificate(request: UpdateManualApplyCertificateRequest):
        """更新手动申请的证书（MANUAL_APPLY），只能更新 folder_name"""
        try:
            result = handler.update_manual_apply_certificate(
                domain=request.domain,
                folder_name=request.folder_name
            )
            return CertificateResponse(**result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 更新手动申请证书失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/delete", response_model=CertificateResponse)
    async def delete_certificate(request: DeleteCertificateRequest):
        """删除证书（只删除数据库记录，不影响文件）"""
        try:
            result = handler.delete_certificate(
                domain=request.domain,
                source=request.source
            )
            return CertificateResponse(**result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 删除证书失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/apply", response_model=CertificateResponse)
    async def apply_certificate(request: ApplyCertificateRequest):
        """申请 Let's Encrypt 证书（统一存储在 database）"""
        try:
            result = handler.apply_certificate(
                domain=request.domain,
                email=request.email,
                folder_name=request.folder_name,
                sans=request.sans,
                webroot=request.webroot
            )
            return CertificateResponse(**result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 申请证书失败: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    return router

