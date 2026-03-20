# coding=utf-8
"""`/vault/analysis/*` 路由。"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from apps.analysis.dto.analysis_request_dto import AnalyzeTLSRequest
from apps.analysis.services.analysis_service import AnalysisService
from apps.analysis.vo.analysis_vo import AnalyzeTLSVo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vault/analysis", tags=["Analysis"])


def get_analysis_service(request: Request) -> AnalysisService:
    s = getattr(request.app.state, "analysis_service", None)
    if s is None:
        raise HTTPException(status_code=503, detail="analysis_service not ready")
    return s


@router.post("/tls", response_model=AnalyzeTLSVo)
async def analyze_tls(
    req: AnalyzeTLSRequest,
    svc: AnalysisService = Depends(get_analysis_service),
) -> AnalyzeTLSVo:
    try:
        r = svc.analyze_tls_certificate(req.certificate, req.private_key)
        return AnalyzeTLSVo(**r)
    except Exception as e:  # noqa: BLE001
        logger.exception("analyze_tls")
        raise HTTPException(status_code=500, detail=str(e)) from e
