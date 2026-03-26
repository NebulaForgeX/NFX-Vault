# coding=utf-8
"""TLS 分析 Service（不写入数据库）。"""
from __future__ import annotations

import logging
from typing import Any, Optional

from utils import extract_cert_info_from_pem_sync

logger = logging.getLogger(__name__)


class AnalysisService:
    def analyze_tls_certificate(
        self, certificate: str, private_key: Optional[str] = None
    ) -> dict[str, Any]:
        try:
            if not certificate or not certificate.strip():
                return {"success": False, "message": "Certificate content is empty", "data": None}
            cert_info = extract_cert_info_from_pem_sync(certificate)
            if not cert_info:
                return {
                    "success": False,
                    "message": "Failed to parse certificate. Please check PEM format.",
                    "data": None,
                }
            parsed_domain = cert_info.get("common_name")
            parsed_sans = cert_info.get("sans", [])
            parsed_issuer = cert_info.get("issuer")
            parsed_not_before = cert_info.get("not_before")
            parsed_not_after = cert_info.get("not_after")
            parsed_is_valid = cert_info.get("is_valid")
            parsed_days_remaining = cert_info.get("days_remaining")
            parsed_subject = cert_info.get("subject", {})
            if parsed_is_valid is None:
                parsed_is_valid = True
            all_domains = cert_info.get("all_domains") or []
            if not isinstance(all_domains, list):
                all_domains = []
            if parsed_domain and parsed_domain not in all_domains:
                all_domains.insert(0, parsed_domain)
            key_valid = None
            key_info: dict[str, Any]
            if private_key and private_key.strip():
                key_info = {"has_private_key": True, "key_length": None}
                key_valid = True
            else:
                key_info = {"has_private_key": False}
            result_data = {
                "certificate": {
                    "domain": parsed_domain,
                    "subject": parsed_subject,
                    "issuer": parsed_issuer,
                    "sans": parsed_sans,
                    "all_domains": all_domains,
                    "not_before": parsed_not_before.isoformat() if parsed_not_before else None,
                    "not_after": parsed_not_after.isoformat() if parsed_not_after else None,
                    "is_valid": parsed_is_valid if parsed_is_valid is not None else True,
                    "days_remaining": parsed_days_remaining,
                },
                "private_key": key_info,
                "summary": {
                    "is_valid": parsed_is_valid if parsed_is_valid is not None else True,
                    "days_remaining": parsed_days_remaining,
                    "has_private_key": bool(private_key and private_key.strip()),
                    "key_valid": key_valid,
                },
            }
            return {
                "success": True,
                "message": "Certificate analyzed successfully",
                "data": result_data,
            }
        except Exception as e:  # noqa: BLE001
            logger.error("analyze_tls_certificate: %s", e, exc_info=True)
            return {"success": False, "message": str(e), "data": None}
