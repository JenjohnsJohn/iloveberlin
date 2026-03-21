import io

import httpx
from PIL import Image

from config.settings import settings
from src.api_client.client import APIClient
from src.utils.logging import get_logger
from src.utils.retry import retry_with_backoff

log = get_logger("api_client.media")

# Shared connection-pooled client for image downloads
_download_client: httpx.AsyncClient | None = None


def _get_download_client() -> httpx.AsyncClient:
    """Get or create a shared httpx client with connection pooling for downloads."""
    global _download_client
    if _download_client is None or _download_client.is_closed:
        _download_client = httpx.AsyncClient(
            timeout=15.0,
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
            follow_redirects=True,
        )
    return _download_client


async def _download_image_once(url: str) -> tuple[bytes, str] | None:
    """Single attempt to download an image."""
    client = _get_download_client()
    resp = await client.get(url)
    resp.raise_for_status()
    content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
    if not content_type.startswith("image/"):
        return None
    return resp.content, content_type


async def download_image(url: str) -> tuple[bytes, str] | None:
    """Download image from URL with retry, return (bytes, content_type) or None on failure."""
    try:
        return await retry_with_backoff(_download_image_once, url, max_attempts=2, base_delay=2.0)
    except Exception as e:
        log.warning("Failed to download image after retries", url=url, error=str(e))
        return None


def get_image_dimensions(image_bytes: bytes) -> tuple[int, int]:
    """Get width and height of an image from bytes."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        return img.size


async def _upload_image_once(
    api_client: APIClient, image_bytes: bytes, filename: str, content_type: str
) -> str | None:
    """Single attempt to upload an image via 3-step media flow."""
    # Step 1: Presign
    presign_resp = await api_client.post(
        "/media/presign",
        json={"filename": filename, "content_type": content_type},
    )
    presign_data = presign_resp.json()
    storage_key = presign_data["storage_key"]

    # Step 2: Upload file to the upload URL
    client = await api_client._get_client()
    headers = await api_client._headers()
    del headers["Content-Type"]  # Let httpx set multipart content-type
    upload_api_url = f"{settings.iloveberlin_api_url}/media/upload/{storage_key}"
    resp = await client.put(
        upload_api_url,
        headers=headers,
        files={"file": (filename, image_bytes, content_type)},
    )
    resp.raise_for_status()

    # Step 3: Confirm
    width, height = get_image_dimensions(image_bytes)
    confirm_resp = await api_client.post(
        "/media/confirm",
        json={
            "storage_key": storage_key,
            "original_filename": filename,
            "mime_type": content_type,
            "file_size_bytes": len(image_bytes),
            "width": width,
            "height": height,
        },
    )
    media = confirm_resp.json()
    media_id = media.get("id")
    log.info("Image uploaded successfully", media_id=media_id, filename=filename)
    return media_id


async def upload_image(
    api_client: APIClient, image_bytes: bytes, filename: str, content_type: str
) -> str | None:
    """Upload an image via the 3-step media flow with retry.

    Returns the media ID on success, None on failure.
    """
    try:
        return await retry_with_backoff(
            _upload_image_once,
            api_client, image_bytes, filename, content_type,
            max_attempts=2,
            base_delay=2.0,
        )
    except Exception as e:
        log.error("Image upload failed after retries", filename=filename, error=str(e))
        return None
