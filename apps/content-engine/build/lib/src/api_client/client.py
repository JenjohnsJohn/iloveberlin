import httpx

from config.settings import settings
from src.api_client.auth import AuthManager
from src.utils.logging import get_logger

log = get_logger("api_client.client")


class APIClient:
    """Base HTTP client for the I♥Berlin API with automatic auth."""

    def __init__(self):
        self.auth = AuthManager()
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def _headers(self) -> dict[str, str]:
        client = await self._get_client()
        token = await self.auth.get_token(client)
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    async def get(self, path: str, **kwargs) -> httpx.Response:
        client = await self._get_client()
        headers = await self._headers()
        url = f"{settings.iloveberlin_api_url}{path}"
        resp = await client.get(url, headers=headers, **kwargs)
        resp.raise_for_status()
        return resp

    async def post(self, path: str, json: dict | None = None, **kwargs) -> httpx.Response:
        client = await self._get_client()
        headers = await self._headers()
        url = f"{settings.iloveberlin_api_url}{path}"
        resp = await client.post(url, headers=headers, json=json, **kwargs)
        resp.raise_for_status()
        return resp

    async def put_raw(self, url: str, content: bytes, content_type: str) -> httpx.Response:
        """PUT raw bytes to an arbitrary URL (used for media upload)."""
        client = await self._get_client()
        headers = await self._headers()
        headers["Content-Type"] = content_type
        resp = await client.put(url, content=content, headers=headers)
        resp.raise_for_status()
        return resp

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None
