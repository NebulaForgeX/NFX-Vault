# coding=utf-8
"""ACME HTTP-01 挑战存储（由原 backend 迁入）。"""
from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


class ACMEChallengeStorage:
    def __init__(self, challenge_dir: str = "/tmp/acme-challenges") -> None:
        self.challenge_dir = challenge_dir
        wk = os.path.join(self.challenge_dir, ".well-known", "acme-challenge")
        os.makedirs(wk, exist_ok=True, mode=0o755)
        logger.info(
            "ACME challenge storage: root=%s token_dir=%s",
            self.challenge_dir,
            wk,
        )
        for path in (self.challenge_dir, os.path.join(self.challenge_dir, ".well-known"), wk):
            try:
                os.chmod(path, 0o777)
                logger.debug("ACME storage chmod ok: %s", path)
            except OSError as e:
                logger.warning("ACME storage chmod 跳过: %s — %s", path, e)

    def store_challenge(self, token: str, key_authorization: str) -> bool:
        try:
            challenge_file = os.path.join(self.challenge_dir, token)
            with open(challenge_file, "w", encoding="utf-8") as f:
                f.write(key_authorization)
            return True
        except Exception as e:  # noqa: BLE001
            logger.error("store_challenge: %s", e, exc_info=True)
            return False

    def get_challenge(self, token: str) -> Optional[str]:
        challenge_file = os.path.join(
            self.challenge_dir, ".well-known", "acme-challenge", token
        )
        fallback_file = os.path.join(self.challenge_dir, token)
        try:
            if os.path.exists(challenge_file):
                with open(challenge_file, encoding="utf-8") as f:
                    return f.read().strip()
            if os.path.exists(fallback_file):
                with open(fallback_file, encoding="utf-8") as f:
                    return f.read().strip()
            logger.warning(
                "ACME challenge not on disk token=%s root=%s primary=%s exists=%s fallback=%s exists=%s",
                token,
                self.challenge_dir,
                challenge_file,
                False,
                fallback_file,
                False,
            )
            return None
        except Exception as e:  # noqa: BLE001
            logger.error("get_challenge: %s", e, exc_info=True)
            return None

    def remove_challenge(self, token: str) -> bool:
        try:
            challenge_file = os.path.join(self.challenge_dir, token)
            if os.path.exists(challenge_file):
                os.remove(challenge_file)
                return True
            return False
        except Exception as e:  # noqa: BLE001
            logger.error("remove_challenge: %s", e, exc_info=True)
            return False
