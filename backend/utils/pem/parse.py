"""PEM 证书解析（openssl 子进程）；纯工具、无业务逻辑。"""
from __future__ import annotations

import logging
import re
import subprocess
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)


def extract_cert_info_from_pem_sync(cert_pem: str) -> dict[str, Any]:
    """同步从 PEM 提取 not_before/not_after、issuer、CN、SANs 等。"""
    try:
        result = subprocess.run(
            ["openssl", "x509", "-noout", "-text", "-dates", "-subject", "-issuer"],
            input=cert_pem,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode != 0:
            logger.error("openssl 解析失败: %s", result.stderr)
            return {}
        output = result.stdout
        not_before = not_after = None
        issuer = "Unknown"
        common_name = None
        email = None
        subject: dict[str, str] = {}
        sans: list[str] = []
        subject_line = None
        for line in output.split("\n"):
            if "subject=" in line or "Subject:" in line:
                subject_line = line
                break
        if subject_line:
            cn_m = re.search(r"CN\s*=\s*([^,]+)", subject_line)
            if cn_m:
                common_name = cn_m.group(1).strip()
                subject["CN"] = common_name
            em_m = re.search(r"emailAddress\s*=\s*([^,]+)", subject_line)
            if em_m:
                email = em_m.group(1).strip()
                subject["emailAddress"] = email
        in_san = False
        for line in output.split("\n"):
            if "Subject Alternative Name" in line or "X509v3 Subject Alternative Name" in line:
                in_san = True
                continue
            if in_san:
                sans.extend(re.findall(r"DNS:\s*([^,\s]+)", line))
                if line.strip() == "" or (
                    line.strip() and not line.strip().startswith(" ") and ":" in line
                ):
                    break
        issuer_line = None
        for line in output.split("\n"):
            if "issuer=" in line or "Issuer:" in line:
                issuer_line = line
                break
        if issuer_line:
            om = re.search(r"O\s*=\s*([^,]+)", issuer_line)
            if om:
                issuer = om.group(1).strip()
            else:
                cm = re.search(r"CN\s*=\s*([^,]+)", issuer_line)
                if cm:
                    issuer = cm.group(1).strip()
        for line in output.split("\n"):
            if "notBefore" in line:
                ds = line.split("=", 1)[1].strip()
                try:
                    not_before = datetime.strptime(ds, "%b %d %H:%M:%S %Y %Z")
                except ValueError:
                    pass
            elif "notAfter" in line:
                ds = line.split("=", 1)[1].strip()
                try:
                    not_after = datetime.strptime(ds, "%b %d %H:%M:%S %Y %Z")
                except ValueError:
                    pass
        days_remaining = None
        is_valid = True
        if not_after:
            now = datetime.now(not_after.tzinfo) if not_after.tzinfo else datetime.now()
            days_remaining = (not_after - now).days
            is_valid = days_remaining >= 0
        all_domains = list({*sans})
        if common_name and common_name not in all_domains:
            all_domains.insert(0, common_name)
        return {
            "not_before": not_before,
            "not_after": not_after,
            "is_valid": is_valid,
            "days_remaining": days_remaining,
            "issuer": issuer,
            "common_name": common_name,
            "email": email,
            "subject": subject,
            "sans": sans,
            "all_domains": all_domains,
        }
    except subprocess.TimeoutExpired:
        logger.error("openssl 超时")
        return {}
    except Exception:
        logger.exception("解析 PEM 失败")
        return {}
