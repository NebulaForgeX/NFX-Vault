"""Let's Encrypt 申请（封装 CertbotClient）。"""
from __future__ import annotations

import logging
from typing import Any, Optional

from config.types import CertConfig
from enums.certificate_status import CertificateStatus
from utils.certbot.client import CertbotClient

logger = logging.getLogger(__name__)


class TlsIssueRepository:
    def __init__(self, cert_config: CertConfig, client: Optional[CertbotClient] = None) -> None:
        self._client = client or CertbotClient(
            challenge_dir=cert_config.ACME_CHALLENGE_DIR,
            certs_dir=cert_config.BASE_DIR,
            max_wait_time=cert_config.CERT_MAX_WAIT_TIME,
        )

    def apply_certificate(
        self,
        domain: str,
        email: str,
        sans: Optional[list[str]] = None,
        webroot: Optional[str] = None,
        folder_name: Optional[str] = None,
        force_renewal: bool = False,
    ) -> dict[str, Any]:
        try:
            logger.info(
                "TlsIssueRepository.apply_certificate domain=%s folder_name=%s "
                "sans=%s force_renewal=%s webroot_param=%s",
                domain,
                folder_name,
                sans,
                force_renewal,
                webroot,
            )
            r = self._client.issue_certificate(
                domain=domain,
                email=email,
                sans=sans,
                webroot=webroot,
                folder_name=folder_name,
                force_renewal=force_renewal,
            )
            if "status" not in r:
                r["status"] = (
                    CertificateStatus.SUCCESS.value if r.get("success") else CertificateStatus.FAIL.value
                )
            if r.get("success"):
                logger.info("TlsIssueRepository.apply_certificate ok domain=%s", domain)
            else:
                logger.error(
                    "TlsIssueRepository.apply_certificate fail domain=%s message=%s error=%s",
                    domain,
                    r.get("message"),
                    r.get("error"),
                )
            return r
        except Exception as e:  # noqa: BLE001
            logger.exception("apply_certificate")
            return {
                "success": False,
                "message": str(e),
                "certificate": None,
                "private_key": None,
                "status": CertificateStatus.FAIL.value,
                "error": str(e),
            }
