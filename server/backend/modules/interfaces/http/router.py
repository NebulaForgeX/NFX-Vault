# coding=utf-8

"""
HTTP 路由

FastAPI HTTP API 路由定义
"""
import logging
from fastapi import APIRouter, HTTPException, Query, Response

from modules.interfaces.http.handler.certificate import CertificateHTTPHandler
from enums.certificate_source import CertificateSource
from modules.interfaces.http.dto.reqdto import (
    CreateCertificateRequest,
    UpdateCertificateRequest,
    DeleteCertificateRequest,
    ApplyCertificateRequest,
)
from modules.interfaces.http.dto.respdto import (
    CertificateResponse,
)

logger = logging.getLogger(__name__)

# 创建路由器
router = APIRouter(prefix="/api", tags=["certificates"])

# ACME 挑战路由器（不需要 /api 前缀，用于直接访问）
acme_router = APIRouter(tags=["acme"])

# 全局 HTTP 处理器（由 main.py 设置）
http_handler: CertificateHTTPHandler = None

# 全局 ACME 挑战存储（由 main.py 设置）
acme_storage = None


def set_acme_challenge_storage(storage):
    """设置全局 ACME 挑战存储"""
    global acme_storage
    acme_storage = storage


def set_http_handler(handler: CertificateHTTPHandler):
    """设置全局 HTTP 处理器"""
    global http_handler
    http_handler = handler


@router.get("/certs/check/{cert_type}")
async def check_certificates(
    cert_type: str,
    page: int = Query(1, ge=1, description="页码（从1开始）"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """
    检查证书状态（从数据库读取，支持分页）
    
    Args:
        cert_type: 证书类型（websites、apis 或 database）
        page: 页码
        page_size: 每页数量
    """
    if cert_type not in ["websites", "apis", "database"]:
        raise HTTPException(status_code=400, detail="cert_type must be 'websites', 'apis' or 'database'")
    
    try:
        if not http_handler:
            raise HTTPException(status_code=500, detail="Certificate HTTP handler not initialized")
        
        result = http_handler.get_certificate_list(
            store=cert_type,
            page=page,
            page_size=page_size
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 查询证书列表失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/certs/detail/{cert_type}")
async def get_certificate_detail(
    cert_type: str,
    domain: str = Query(..., description="域名"),
    source: str = Query('auto', description="来源（auto 或 manual）")
):
    """
    获取单个证书的详细信息（包含证书内容和私钥）
    
    Args:
        cert_type: 证书类型（websites、apis 或 database）
        domain: 域名（查询参数）
        source: 来源（auto 或 manual），默认为 auto（查询参数）
    """
    # 转换为枚举
    try:
        source_enum = CertificateSource(source)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid source value. Must be one of: {[s.value for s in CertificateSource]}")
    
    if cert_type not in ["websites", "apis", "database"]:
        raise HTTPException(status_code=400, detail="cert_type must be 'websites', 'apis' or 'database'")
    
    try:
        if not http_handler:
            raise HTTPException(status_code=500, detail="Certificate HTTP handler not initialized")
        
        result = http_handler.get_certificate_detail(
            store=cert_type,
            domain=domain,
            source=source_enum
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Certificate not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 查询证书详情失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/certs/refresh/{cert_type}")
async def refresh_certificates(
    cert_type: str
):
    """
    手动触发读取 acme.json（发送 Kafka 事件）
    
    Args:
        cert_type: 证书类型（websites 或 apis）
    """
    if cert_type not in ["websites", "apis"]:
        raise HTTPException(status_code=400, detail="cert_type must be 'websites' or 'apis'")
    
    try:
        if not http_handler:
            raise HTTPException(status_code=500, detail="Certificate HTTP handler not initialized")
        
        # 发送 Kafka 事件，不直接处理
        http_handler.publish_read_certificate_file(cert_type, trigger="api")
        
        return {
            "success": True,
            "message": f"Certificate refresh event published for {cert_type}",
            "processed": 0  # 实际处理由 Kafka Consumer 完成
        }
    except Exception as e:
        logger.error(f"❌ 发布刷新证书事件失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/certs/create", response_model=CertificateResponse)
async def create_certificate(
    request: CreateCertificateRequest
):
    """
    创建证书（手动添加）
    
    Args:
        request: 创建证书请求
    """
    if request.store not in ["websites", "apis"]:
        raise HTTPException(status_code=400, detail="store must be 'websites' or 'apis'")
    
    try:
        if not http_handler:
            raise HTTPException(status_code=500, detail="Certificate HTTP handler not initialized")
        
        result = http_handler.create_certificate(
            store=request.store,
            domain=request.domain,
            certificate=request.certificate,
            private_key=request.private_key,
            sans=request.sans
        )
        
        return CertificateResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 创建证书失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/certs/update", response_model=CertificateResponse)
async def update_certificate(
    request: UpdateCertificateRequest
):
    """
    更新证书
    
    Args:
        request: 更新证书请求
    """
    
    if request.store and request.store not in ["websites", "apis"]:
        raise HTTPException(status_code=400, detail="store must be 'websites' or 'apis'")
    
    try:
        if not http_handler:
            raise HTTPException(status_code=500, detail="Certificate HTTP handler not initialized")
        
        result = http_handler.update_certificate(
            domain=request.domain,
            source=request.source,
            certificate=request.certificate,
            private_key=request.private_key,
            store=request.store,
            sans=request.sans
        )
        
        return CertificateResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 更新证书失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/certs/delete", response_model=CertificateResponse)
async def delete_certificate(
    request: DeleteCertificateRequest
):
    """
    删除证书（只删除数据库记录，不影响 acme.json 文件）
    
    Args:
        request: 删除证书请求
    """
    
    try:
        if not http_handler:
            raise HTTPException(status_code=500, detail="Certificate HTTP handler not initialized")
        
        result = http_handler.delete_certificate(
            domain=request.domain,
            source=request.source
        )
        
        return CertificateResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 删除证书失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/certs/apply", response_model=CertificateResponse)
async def apply_certificate(
    request: ApplyCertificateRequest
):
    """
    申请 Let's Encrypt 证书（统一存储在 database）
    
    Args:
        request: 申请证书请求
    """
    try:
        if not http_handler:
            raise HTTPException(status_code=500, detail="Certificate HTTP handler not initialized")
        
        result = http_handler.apply_certificate(
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


# ============================================
# ACME HTTP-01 挑战路由
# ============================================

@acme_router.get("/.well-known/acme-challenge/{token}")
async def acme_challenge(token: str, response: Response):
    """
    ACME HTTP-01 挑战端点
    
    Let's Encrypt 会访问此端点来验证域名所有权
    路径格式：/.well-known/acme-challenge/{token}
    
    Args:
        token: ACME 挑战 token
    """
    global acme_storage
    
    logger.info(f"🔔 ACME challenge request received: token={token}")
    
    if not acme_storage:
        logger.error("❌ ACME challenge storage not initialized")
        response.status_code = 503
        return {"error": "ACME challenge storage not available"}
    
    # 从存储中获取挑战响应
    key_authorization = acme_storage.get_challenge(token)
    
    if not key_authorization:
        logger.warning(f"⚠️  ACME challenge token not found: {token}")
        logger.warning(f"⚠️  Challenge directory: {acme_storage.challenge_dir if acme_storage else 'N/A'}")
        response.status_code = 404
        return {"error": "Challenge token not found"}
    
    logger.info(f"✅ ACME challenge response sent: token={token}, content_length={len(key_authorization)}")
    # 返回纯文本响应（key authorization）
    response.headers["Content-Type"] = "text/plain"
    return Response(content=key_authorization, media_type="text/plain")

