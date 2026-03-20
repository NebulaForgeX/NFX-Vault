"""Certbot webroot 申请证书（手写迁入，依赖系统 certbot + openssl）。"""
from __future__ import annotations

import logging
import os
import re
import shlex
import subprocess
from typing import Any, Optional

from enums.certificate_status import CertificateStatus

logger = logging.getLogger(__name__)


def _shell_join(cmd: list[str]) -> str:
    return " ".join(shlex.quote(c) for c in cmd)


class CertbotClient:
    def __init__(self, challenge_dir: str, certs_dir: str, max_wait_time: int) -> None:
        if not challenge_dir or not certs_dir:
            raise ValueError("challenge_dir and certs_dir required")
        if not isinstance(max_wait_time, int) or max_wait_time <= 0:
            raise ValueError("max_wait_time must be positive int")
        self.challenge_dir = challenge_dir
        self.certs_dir = certs_dir
        self.max_wait_time = max_wait_time
        self._ensure_acme_webroot_tree()
        os.makedirs(self.certs_dir, exist_ok=True)

    def _ensure_acme_webroot_tree(self) -> None:
        """Certbot --webroot-path 指向 challenge 根目录，写入 .well-known/acme-challenge/<token>。"""
        wk = os.path.join(self.challenge_dir, ".well-known", "acme-challenge")
        os.makedirs(wk, exist_ok=True, mode=0o755)
        logger.info(
            "Certbot webroot: root=%s token_dir=%s",
            self.challenge_dir,
            wk,
        )
        for path in (
            self.challenge_dir,
            os.path.join(self.challenge_dir, ".well-known"),
            wk,
        ):
            try:
                os.chmod(path, 0o777)
                logger.debug("ACME chmod 777 ok: %s", path)
            except OSError as e:
                logger.warning(
                    "ACME chmod 跳过（NAS 常见，若能创建挑战文件可忽略）: %s — %s",
                    path,
                    e,
                )

    def _existing_pem(self, folder_name: str) -> Optional[dict[str, Any]]:
        cfg = os.path.join(self.certs_dir, ".certbot", "config")
        live = os.path.join(cfg, "live", folder_name)
        cfile, kfile = os.path.join(live, "fullchain.pem"), os.path.join(live, "privkey.pem")
        if not (os.path.exists(cfile) and os.path.exists(kfile)):
            return None
        with open(cfile, encoding="utf-8") as f:
            cert = f.read()
        with open(kfile, encoding="utf-8") as f:
            key = f.read()
        is_valid = True
        try:
            r = subprocess.run(
                ["openssl", "x509", "-in", cfile, "-noout", "-checkend", "86400"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            is_valid = r.returncode == 0
        except Exception:  # noqa: BLE001
            pass
        return {"certificate": cert, "private_key": key, "is_valid": is_valid}

    @staticmethod
    def _rate_limit(msg: str) -> tuple[bool, Optional[str]]:
        m = re.search(
            r"too many certificates.*?retry after (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})",
            msg,
            re.I,
        )
        return (True, m.group(1)) if m else (False, None)

    def issue_certificate(
        self,
        domain: str,
        email: str,
        sans: Optional[list[str]] = None,
        folder_name: Optional[str] = None,
        force_renewal: bool = False,
        webroot: Optional[str] = None,
    ) -> dict[str, Any]:
        if webroot and os.path.normpath(webroot) != os.path.normpath(self.challenge_dir):
            logger.warning(
                "certbot ignores ui webroot=%s; using ACME_CHALLENGE_DIR=%s (align nginx with this path)",
                webroot,
                self.challenge_dir,
            )
        if not folder_name:
            folder_name = domain.replace(".", "_")
        if not force_renewal:
            ex = self._existing_pem(folder_name)
            if ex and ex.get("is_valid", True):
                logger.info(
                    "certbot skip cert_name=%s (reuse existing PEM, force_renewal=False)",
                    folder_name,
                )
                return {
                    "success": True,
                    "message": "Using existing certificate",
                    "certificate": ex["certificate"],
                    "private_key": ex["private_key"],
                    "status": CertificateStatus.SUCCESS.value,
                    "error": None,
                }
        custom_config_dir = os.path.join(self.certs_dir, ".certbot", "config")
        custom_work_dir = os.path.join(self.certs_dir, ".certbot", "work")
        custom_logs_dir = os.path.join(self.certs_dir, ".certbot", "logs")
        for d in (custom_config_dir, custom_work_dir, custom_logs_dir):
            os.makedirs(d, exist_ok=True)
        domains = [domain, *(sans or [])]
        cmd = [
            "certbot",
            "certonly",
            "--webroot",
            "--webroot-path",
            self.challenge_dir,
            "--email",
            email,
            "--agree-tos",
            "--non-interactive",
            "--cert-name",
            folder_name,
            "--config-dir",
            custom_config_dir,
            "--work-dir",
            custom_work_dir,
            "--logs-dir",
            custom_logs_dir,
        ]
        if force_renewal:
            cmd.append("--force-renewal")
        for d in domains:
            cmd.extend(["-d", d])
        self._ensure_acme_webroot_tree()
        logger.info(
            "certbot certonly start cert_name=%s force_renewal=%s timeout_s=%s domains=%s",
            folder_name,
            force_renewal,
            self.max_wait_time,
            domains,
        )
        logger.info("certbot --webroot-path=%s", self.challenge_dir)
        logger.info(
            "certbot dirs config_dir=%s work_dir=%s logs_dir=%s",
            custom_config_dir,
            custom_work_dir,
            custom_logs_dir,
        )
        logger.info("certbot cmd: %s", _shell_join(cmd))
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=self.max_wait_time)
        except subprocess.TimeoutExpired:
            logger.error(
                "certbot timeout after %ss cert_name=%s cmd=%s",
                self.max_wait_time,
                folder_name,
                _shell_join(cmd),
            )
            return {
                "success": False,
                "message": "certbot timeout",
                "certificate": None,
                "private_key": None,
                "status": CertificateStatus.FAIL.value,
                "error": "timeout",
            }
        if r.returncode != 0:
            out, err = (r.stdout or "").strip(), (r.stderr or "").strip()
            logger.error(
                "certbot failed rc=%s cert_name=%s\n--- stderr (%s B) ---\n%s\n--- stdout (%s B) ---\n%s",
                r.returncode,
                folder_name,
                len(r.stderr or ""),
                r.stderr or "",
                len(r.stdout or ""),
                r.stdout or "",
            )
            err = err or out or ""
            is_rl, retry_after = self._rate_limit(err)
            if is_rl and not force_renewal:
                ex = self._existing_pem(folder_name)
                if ex:
                    return {
                        "success": True,
                        "message": "rate limit, using existing",
                        "certificate": ex["certificate"],
                        "private_key": ex["private_key"],
                        "status": CertificateStatus.SUCCESS.value,
                        "error": None,
                    }
            if is_rl:
                return {
                    "success": False,
                    "message": err,
                    "certificate": None,
                    "private_key": None,
                    "status": CertificateStatus.FAIL.value,
                    "error": err,
                    "rate_limit": True,
                    "retry_after": retry_after,
                }
            return {
                "success": False,
                "message": err,
                "certificate": None,
                "private_key": None,
                "status": CertificateStatus.FAIL.value,
                "error": err,
            }
        cdir = os.path.join(custom_config_dir, "live", folder_name)
        cf, kf = os.path.join(cdir, "fullchain.pem"), os.path.join(cdir, "privkey.pem")
        if not (os.path.exists(cf) and os.path.exists(kf)):
            logger.error(
                "certbot rc=0 but PEM missing cert_name=%s cdir=%s fullchain=%s privkey=%s",
                folder_name,
                cdir,
                os.path.exists(cf),
                os.path.exists(kf),
            )
            return {
                "success": False,
                "message": "pem missing after certbot",
                "certificate": None,
                "private_key": None,
                "status": CertificateStatus.FAIL.value,
                "error": "no pem",
            }
        logger.info("certbot success cert_name=%s live_dir=%s", folder_name, cdir)
        with open(cf, encoding="utf-8") as f:
            cert = f.read()
        with open(kf, encoding="utf-8") as f:
            pk = f.read()
        return {
            "success": True,
            "message": "ok",
            "certificate": cert,
            "private_key": pk,
            "status": CertificateStatus.SUCCESS.value,
            "error": None,
        }
