import asyncio
import time

import httpx

from config.settings import settings
from src.utils.logging import get_logger

log = get_logger("api_client.auth")

# Singleton token state — shared across all APIClient instances
# This prevents multiple pipelines from each logging in separately
_token_state = {
    "access_token": None,
    "refresh_token": None,
    "expires_at": 0.0,
    "login_failed_at": 0.0,  # timestamp of last login failure
    "lock": None,  # asyncio.Lock, created lazily
}

LOGIN_COOLDOWN = 60  # seconds to wait after a failed login before retrying


def _get_lock() -> asyncio.Lock:
    if _token_state["lock"] is None:
        _token_state["lock"] = asyncio.Lock()
    return _token_state["lock"]


class AuthManager:
    """Manages JWT authentication with the I♥Berlin API.

    Uses singleton token state so all APIClient instances share one login session.
    Includes login cooldown to prevent account lockout from cascading failures.
    """

    @property
    def is_expired(self) -> bool:
        return time.time() >= _token_state["expires_at"] - 60  # 60s buffer

    @property
    def _in_cooldown(self) -> bool:
        """True if we recently failed to login and should wait."""
        if _token_state["login_failed_at"] == 0:
            return False
        return time.time() - _token_state["login_failed_at"] < LOGIN_COOLDOWN

    async def get_token(self, client: httpx.AsyncClient) -> str:
        # Fast path: valid cached token
        if _token_state["access_token"] and not self.is_expired:
            return _token_state["access_token"]

        # Serialize login/refresh to prevent concurrent auth requests
        async with _get_lock():
            # Re-check after acquiring lock (another coroutine may have refreshed)
            if _token_state["access_token"] and not self.is_expired:
                return _token_state["access_token"]

            # Try refresh first (doesn't count as login attempt on the API)
            if _token_state["refresh_token"]:
                try:
                    return await self._refresh(client)
                except Exception:
                    log.warning("Token refresh failed, will re-login")

            # Check cooldown before attempting login
            if self._in_cooldown:
                wait = LOGIN_COOLDOWN - (time.time() - _token_state["login_failed_at"])
                raise RuntimeError(
                    f"Login cooldown active — last login failed {int(time.time() - _token_state['login_failed_at'])}s ago. "
                    f"Retrying in {int(wait)}s to avoid account lockout."
                )

            return await self._login(client)

    async def _login(self, client: httpx.AsyncClient) -> str:
        log.info("Logging in to I♥Berlin API")
        try:
            resp = await client.post(
                f"{settings.iloveberlin_api_url}/auth/login",
                json={
                    "email": settings.iloveberlin_admin_email,
                    "password": settings.iloveberlin_admin_password,
                },
            )
            resp.raise_for_status()
        except Exception as e:
            _token_state["login_failed_at"] = time.time()
            log.error("Login failed — cooldown activated for 60s", error=str(e)[:200])
            raise

        data = resp.json()
        _token_state["access_token"] = data["access_token"]
        _token_state["refresh_token"] = data["refresh_token"]
        _token_state["expires_at"] = time.time() + data.get("expires_in", 604800)
        _token_state["login_failed_at"] = 0.0  # clear cooldown on success

        log.info("Login successful")
        return _token_state["access_token"]

    async def _refresh(self, client: httpx.AsyncClient) -> str:
        log.info("Refreshing access token")
        resp = await client.post(
            f"{settings.iloveberlin_api_url}/auth/refresh",
            json={"refresh_token": _token_state["refresh_token"]},
        )
        resp.raise_for_status()
        data = resp.json()

        _token_state["access_token"] = data["access_token"]
        _token_state["refresh_token"] = data["refresh_token"]
        _token_state["expires_at"] = time.time() + data.get("expires_in", 604800)
        _token_state["login_failed_at"] = 0.0

        log.info("Token refreshed")
        return _token_state["access_token"]
