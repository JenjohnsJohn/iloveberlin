"""Kling AI image generation with watermarking for content without source images."""

import asyncio
import io
import time

import httpx
import jwt
from PIL import Image, ImageDraw, ImageFont

from config.settings import settings
from src.utils.logging import get_logger

log = get_logger("ai.image_generator")

KLING_API_BASE = "https://api.klingai.com/v1"

# Shared connection-pooled client
_http_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    """Get or create a shared httpx client with connection pooling."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=30.0,
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
        )
    return _http_client


# Cached JWT token
_cached_token: str | None = None
_token_expires_at: float = 0


def _get_jwt_token() -> str | None:
    """Generate a JWT token for Kling API auth, cached for 30 minutes."""
    global _cached_token, _token_expires_at

    if _cached_token and time.time() < _token_expires_at:
        return _cached_token

    ak = settings.kling_access_key
    sk = settings.kling_secret_key
    if not ak or not sk:
        return None

    now = time.time()
    payload = {
        "iss": ak,
        "exp": int(now + 1800),
        "nbf": int(now - 5),
    }
    token = jwt.encode(payload, sk, algorithm="HS256")
    _cached_token = token
    _token_expires_at = now + 1700  # refresh a bit before actual expiry
    return token


def build_image_prompt(content_type: str, enriched: dict) -> str:
    """Build a content-type-specific image generation prompt."""
    title = enriched.get("title", enriched.get("name", "Berlin"))

    if content_type == "guide":
        return (
            f"A wide-angle photograph representing a guide to {title} in Berlin. "
            "Travel photography, inviting and informative, warm natural lighting, "
            "showing iconic Berlin scenery. No text overlays."
        )
    elif content_type == "event":
        return (
            f"A vibrant photograph of {title} in Berlin. "
            "Event photography, energetic atmosphere, dynamic composition, "
            "crowd or venue setting. No text overlays."
        )
    elif content_type == "restaurant":
        district = enriched.get("district", "")
        cuisines = enriched.get("cuisines", "")
        if isinstance(cuisines, list):
            cuisines = ", ".join(cuisines)
        location = f" in {district}" if district else ""
        cuisine_desc = f" {cuisines} cuisine." if cuisines else ""
        return (
            f"A cozy photograph of {title} restaurant{location}, Berlin.{cuisine_desc} "
            "Food photography, warm ambient lighting, appetizing presentation, "
            "inviting restaurant atmosphere. No text overlays."
        )
    elif content_type == "competition":
        return (
            f"A promotional photograph for {title} in Berlin. "
            "Contest theme, exciting and celebratory mood, prize or reward concept, "
            "vibrant colors. No text overlays."
        )
    else:  # article and fallback
        return (
            f"A photograph of {title} in Berlin. "
            "Editorial lifestyle photography, modern urban setting, "
            "natural lighting, authentic Berlin atmosphere. No text overlays."
        )


async def _submit_generation(client: httpx.AsyncClient, prompt: str) -> str | None:
    """Submit image generation request, return task_id."""
    token = _get_jwt_token()
    if not token:
        return None

    resp = await client.post(
        f"{KLING_API_BASE}/images/generations",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "model": "kling-v2",
            "prompt": prompt,
            "aspect_ratio": "16:9",
            "n": 1,
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json().get("data", {})
    return data.get("task_id")


async def _poll_result(client: httpx.AsyncClient, task_id: str) -> str | None:
    """Poll for generation result, return image URL or None."""
    token = _get_jwt_token()
    if not token:
        return None

    for _ in range(20):  # max 60s (20 * 3s)
        await asyncio.sleep(3)
        resp = await client.get(
            f"{KLING_API_BASE}/images/generations/{task_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json().get("data", {})
        status = data.get("task_status")

        if status == "succeed":
            images = data.get("task_result", {}).get("images", [])
            if images:
                return images[0].get("url")
            return None
        elif status == "failed":
            log.warning("Kling generation failed", task_id=task_id, data=data)
            return None

    log.warning("Kling generation timed out", task_id=task_id)
    return None


def add_watermark(image_bytes: bytes) -> bytes:
    """Add 'iloveberlin.biz' watermark to bottom-right of image."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Try to use a reasonable font size relative to image width
    font_size = max(16, img.width // 40)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except (OSError, IOError):
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except (OSError, IOError):
            font = ImageFont.load_default()

    text = "iloveberlin.biz"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    margin = max(10, img.width // 80)
    x = img.width - text_w - margin
    y = img.height - text_h - margin

    # Dark shadow for readability
    for dx, dy in [(-1, -1), (-1, 1), (1, -1), (1, 1), (-2, -2), (2, 2)]:
        draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, 180))
    # White text
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 230))

    img = Image.alpha_composite(img, overlay)
    img = img.convert("RGB")

    out = io.BytesIO()
    img.save(out, format="JPEG", quality=90)
    return out.getvalue()


async def generate_image(content_type: str, enriched: dict) -> bytes | None:
    """Generate a Kling AI image for content, watermarked. Returns JPEG bytes or None."""
    if not settings.kling_access_key or not settings.kling_secret_key:
        log.debug("Kling credentials not configured, skipping image generation")
        return None

    prompt = build_image_prompt(content_type, enriched)
    log.info("Generating image via Kling AI", content_type=content_type, prompt=prompt[:100])

    try:
        client = _get_http_client()
        task_id = await _submit_generation(client, prompt)
        if not task_id:
            log.warning("Kling API did not return a task_id")
            return None

        image_url = await _poll_result(client, task_id)
        if not image_url:
            return None

        # Download the generated image
        resp = await client.get(image_url, timeout=30)
        resp.raise_for_status()
        image_bytes = resp.content

        # Add watermark
        return add_watermark(image_bytes)

    except Exception as e:
        log.warning("Kling image generation failed", error=str(e), content_type=content_type)
        return None
