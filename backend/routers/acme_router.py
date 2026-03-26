# coding=utf-8
"""ACME HTTP-01 `/.well-known/acme-challenge/{token}`。"""
from __future__ import annotations

import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from utils import ACMEChallengeStorage

logger = logging.getLogger(__name__)

router = APIRouter(tags=["acme"])


def get_acme_storage(request: Request) -> ACMEChallengeStorage:
    s = getattr(request.app.state, "acme_storage", None)
    if s is None:
        raise HTTPException(status_code=503, detail="acme_storage not ready")
    return s


@router.get("/.well-known/acme-challenge/{token}")
async def acme_challenge(
    token: str,
    storage: ACMEChallengeStorage = Depends(get_acme_storage),
) -> Response:
    logger.info("ACME challenge request token=%s", token)
    key_authorization = storage.get_challenge(token)
    if not key_authorization:
        wk_path = os.path.join(
            storage.challenge_dir, ".well-known", "acme-challenge", token
        )
        logger.warning(
            "ACME challenge HTTP 404 token=%s challenge_dir=%s expected_file=%s exists=%s",
            token,
            storage.challenge_dir,
            wk_path,
            os.path.exists(wk_path),
        )
        raise HTTPException(status_code=404, detail="Challenge token not found")
    return Response(content=key_authorization, media_type="text/plain")
