# coding=utf-8
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt


@dataclass
class TokenPair:
    access_token: str
    refresh_token: str


class JwtTokenService:
    def __init__(
        self,
        secret: str,
        access_expire_minutes: int,
        refresh_expire_days: int,
    ) -> None:
        self._secret = secret
        self._access_minutes = access_expire_minutes
        self._refresh_days = refresh_expire_days

    def issue_pair(self, user_id: str, email: str, display_name: str) -> TokenPair:
        now = datetime.now(timezone.utc)
        access_payload: dict[str, Any] = {
            "sub": user_id,
            "email": email,
            "name": display_name,
            "typ": "access",
            "iat": now,
            "exp": now + timedelta(minutes=self._access_minutes),
        }
        refresh_payload: dict[str, Any] = {
            "sub": user_id,
            "typ": "refresh",
            "iat": now,
            "exp": now + timedelta(days=self._refresh_days),
        }
        access = jwt.encode(access_payload, self._secret, algorithm="HS256")
        refresh = jwt.encode(refresh_payload, self._secret, algorithm="HS256")
        return TokenPair(access_token=access, refresh_token=refresh)

    def decode_access(self, token: str) -> dict[str, Any]:
        payload = jwt.decode(token, self._secret, algorithms=["HS256"])
        if payload.get("typ") != "access":
            raise jwt.PyJWTError("not an access token")
        return payload

    def decode_refresh(self, token: str) -> dict[str, Any]:
        payload = jwt.decode(token, self._secret, algorithms=["HS256"])
        if payload.get("typ") != "refresh":
            raise jwt.PyJWTError("not a refresh token")
        return payload

    def refresh_pair(self, refresh_token: str, email: str, display_name: str) -> Optional[TokenPair]:
        try:
            payload = self.decode_refresh(refresh_token)
            uid = payload.get("sub")
            if not uid or not isinstance(uid, str):
                return None
            return self.issue_pair(uid, email, display_name)
        except jwt.PyJWTError:
            return None
