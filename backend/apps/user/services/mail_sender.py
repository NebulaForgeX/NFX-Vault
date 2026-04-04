# coding=utf-8
"""SMTP 发送验证码邮件。"""
from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


def build_verification_email_html(code: str) -> str:
    return f"""<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;padding:24px;">
  <h2 style="color:#c9a227;">NFX-Vault</h2>
  <p>Your verification code is:</p>
  <p style="font-size:28px;letter-spacing:4px;font-weight:700;">{code}</p>
  <p style="color:#666;">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
</body></html>"""


class SmtpMailSender:
    def __init__(
        self,
        host: str,
        port: int,
        user: str,
        password: str,
    ) -> None:
        self._host = host
        self._port = port
        self._user = user
        self._password = password

    def send_html(self, to_email: str, subject: str, html_body: str) -> None:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self._user
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(self._host, self._port, timeout=30) as server:
            server.starttls()
            server.login(self._user, self._password)
            server.sendmail(self._user, [to_email], msg.as_string())
        logger.info("验证码邮件已发送至 %s", to_email)
