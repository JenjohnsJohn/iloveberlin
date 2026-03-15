"""Fetch real restaurant photos from Google Places API (New)."""

import httpx

from config.settings import settings
from src.utils.logging import get_logger
from src.utils.retry import retry_with_backoff

log = get_logger("sources.google_places")

SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
MEDIA_URL = "https://places.googleapis.com/v1"


async def _search_place_photo(name: str, latitude: float | None, longitude: float | None) -> str | None:
    """Text Search to find a place and return its first photo resource name."""
    body: dict = {"textQuery": f"{name}, Berlin"}
    if latitude is not None and longitude is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": latitude, "longitude": longitude},
                "radius": 500.0,
            }
        }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            SEARCH_URL,
            json=body,
            headers={
                "X-Goog-Api-Key": settings.google_places_api_key,
                "X-Goog-FieldMask": "places.photos",
            },
        )
        resp.raise_for_status()

    data = resp.json()
    places = data.get("places", [])
    if not places:
        return None
    photos = places[0].get("photos", [])
    if not photos:
        return None
    return photos[0].get("name")


async def _fetch_photo_bytes(photo_name: str) -> tuple[bytes, str] | None:
    """Fetch the actual photo bytes from a Google Places photo resource."""
    url = f"{MEDIA_URL}/{photo_name}/media"
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(
            url,
            params={"maxWidthPx": 1200, "key": settings.google_places_api_key},
        )
        resp.raise_for_status()

    content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
    if not content_type.startswith("image/"):
        return None
    return resp.content, content_type


async def _get_restaurant_photo_once(
    name: str, latitude: float | None, longitude: float | None
) -> tuple[bytes, str] | None:
    """Single attempt: search place then fetch photo."""
    photo_name = await _search_place_photo(name, latitude, longitude)
    if not photo_name:
        log.info("No Google Places photo found", restaurant=name)
        return None
    result = await _fetch_photo_bytes(photo_name)
    if result:
        log.info("Google Places photo fetched", restaurant=name, size=len(result[0]))
    return result


async def get_restaurant_photo(
    name: str, latitude: float | None = None, longitude: float | None = None
) -> tuple[bytes, str] | None:
    """Get a real photo for a restaurant via Google Places API.

    Returns (image_bytes, content_type) or None.
    """
    if not settings.google_places_api_key:
        return None

    try:
        return await retry_with_backoff(
            _get_restaurant_photo_once, name, latitude, longitude,
            max_attempts=2, base_delay=2.0,
        )
    except Exception as e:
        log.warning("Google Places photo fetch failed", restaurant=name, error=str(e))
        return None
