import os
import tempfile

import httpx
from PIL import Image

from config.settings import settings
from src.api_client.client import APIClient
from src.utils.logging import get_logger

log = get_logger("api_client.media")


async def download_image(url: str) -> tuple[bytes, str] | None:
    """Download image from URL, return (bytes, content_type) or None on failure."""
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
            if not content_type.startswith("image/"):
                return None
            return resp.content, content_type
    except Exception as e:
        log.warning("Failed to download image", url=url, error=str(e))
        return None


def get_image_dimensions(image_bytes: bytes) -> tuple[int, int]:
    """Get width and height of an image from bytes."""
    with tempfile.NamedTemporaryFile(suffix=".img", delete=False) as tmp:
        tmp.write(image_bytes)
        tmp.flush()
        try:
            with Image.open(tmp.name) as img:
                return img.size
        finally:
            os.unlink(tmp.name)


async def upload_image(
    api_client: APIClient, image_bytes: bytes, filename: str, content_type: str
) -> str | None:
    """
    Upload an image via the 3-step media flow.
    Returns the media ID on success, None on failure.
    """
    try:
        # Step 1: Presign
        presign_resp = await api_client.post(
            "/media/presign",
            json={"filename": filename, "content_type": content_type},
        )
        presign_data = presign_resp.json()
        upload_url = presign_data["upload_url"]
        storage_key = presign_data["storage_key"]

        # Step 2: Upload file to the upload URL
        # The upload endpoint is PUT /api/media/upload/:storageKey with multipart file
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

    except Exception as e:
        log.error("Image upload failed", filename=filename, error=str(e))
        return None
