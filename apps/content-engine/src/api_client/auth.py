import time

import httpx

from config.settings import settings
from src.utils.logging import get_logger

log = get_logger("api_client.auth")


class AuthManager:
    """Manages JWT authentication with the I♥Berlin API."""

    def __init__(self):
        self._access_token: str | None = None
        self._refresh_token: str | None = None
        self._expires_at: float = 0

    @property
    def is_expired(self) -> bool:
        return time.time() >= self._expires_at - 60  # 60s buffer

    async def get_token(self, client: httpx.AsyncClient) -> str:
        if self._access_token and not self.is_expired:
            return self._access_token

        if self._refresh_token:
            try:
                return await self._refresh(client)
            except Exception:
                log.warning("Token refresh failed, re-logging in")

        return await self._login(client)

    async def _login(self, client: httpx.AsyncClient) -> str:
        log.info("Logging in to I♥Berlin API")
        resp = await client.post(
            f"{settings.iloveberlin_api_url}/auth/login",
            json={
                "email": settings.iloveberlin_admin_email,
                "password": settings.iloveberlin_admin_password,
            },
        )
        resp.raise_for_status()
        data = resp.json()

        self._access_token = data["access_token"]
        self._refresh_token = data["refresh_token"]
        self._expires_at = time.time() + data.get("expires_in", 604800)

        log.info("Login successful")
        return self._access_token

    async def _refresh(self, client: httpx.AsyncClient) -> str:
        log.info("Refreshing access token")
        resp = await client.post(
            f"{settings.iloveberlin_api_url}/auth/refresh",
            json={"refresh_token": self._refresh_token},
        )
        resp.raise_for_status()
        data = resp.json()

        self._access_token = data["access_token"]
        self._refresh_token = data["refresh_token"]
        self._expires_at = time.time() + data.get("expires_in", 604800)

        log.info("Token refreshed")
        return self._access_token
