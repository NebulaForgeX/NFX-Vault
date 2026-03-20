"""若 ACME_CHALLENGE_DIR 对当前进程不可写，回退到 CERTS_DIR/.nfx-acme-webroot。"""
from __future__ import annotations

import logging
import os
import uuid

logger = logging.getLogger(__name__)


def _can_use_acme_webroot(root: str) -> bool:
    try:
        root = os.path.abspath(os.path.expanduser(root))
        wk = os.path.join(root, ".well-known", "acme-challenge")
        os.makedirs(wk, exist_ok=True)
        probe = os.path.join(wk, f".nfx-write-{uuid.uuid4().hex}")
        with open(probe, "w", encoding="utf-8") as f:
            f.write("1")
        os.remove(probe)
        return True
    except OSError as e:
        logger.info("ACME webroot _probe 失败 %s: %s", root, e)
        return False


def resolve_acme_challenge_dir(preferred: str, certs_dir: str) -> str:
    preferred = os.path.abspath(os.path.expanduser(preferred.strip()))
    certs_dir = os.path.abspath(os.path.expanduser(certs_dir.strip()))
    if _can_use_acme_webroot(preferred):
        logger.info("ACME_CHALLENGE_DIR 使用首选路径（可写）: %s", preferred)
        return preferred
    fallback = os.path.join(certs_dir, ".certbot")
    if _can_use_acme_webroot(fallback):
        logger.warning(
            "ACME_CHALLENGE_DIR=%s 不可写，已改用 %s；反代请与证书目录/本 API 读盘路径一致。",
            preferred,
            fallback,
        )
        return fallback
    logger.error(
        "ACME webroot 在 %s 与 %s 均不可写，仍使用首选路径。",
        preferred,
        fallback,
    )
    return preferred
