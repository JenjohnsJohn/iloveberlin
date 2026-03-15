"""Google Places API — full restaurant source + photo helper."""

import hashlib

import httpx

from config.settings import settings
from src.sources.base import RawItem, Source
from src.utils.logging import get_logger
from src.utils.retry import retry_with_backoff

log = get_logger("sources.google_places")

SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
MEDIA_URL = "https://places.googleapis.com/v1"

FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.priceLevel",
    "places.regularOpeningHours",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.photos",
    "places.types",
])

GOOGLE_PRICE_TO_PRICE_RANGE = {
    "PRICE_LEVEL_INEXPENSIVE": "budget",
    "PRICE_LEVEL_MODERATE": "moderate",
    "PRICE_LEVEL_EXPENSIVE": "upscale",
    "PRICE_LEVEL_VERY_EXPENSIVE": "fine_dining",
}

# Google Places types that map to cuisine names
CUISINE_TYPE_SUFFIX = "_restaurant"


class GooglePlacesSource(Source):
    """Fetch restaurants from Google Places Text Search API."""

    source_type = "google_places"

    def __init__(self, batch_size: int = 20, borough: str | None = None):
        self.batch_size = batch_size
        self.borough = borough

    async def fetch(self) -> list[RawItem]:
        if not settings.google_places_api_key:
            log.warning("Google Places API key not configured")
            return []

        query = f"restaurants in {self.borough}, Berlin" if self.borough else "restaurants in Berlin"

        try:
            items = await retry_with_backoff(
                self._fetch_once, query, max_attempts=2, base_delay=2.0
            )
        except Exception as e:
            log.error("Google Places fetch failed", error=str(e))
            return []

        log.info(
            "Google Places restaurants fetched",
            count=len(items),
            borough=self.borough or "all",
        )
        return items

    async def _fetch_once(self, query: str) -> list[RawItem]:
        body: dict = {
            "textQuery": query,
            "pageSize": self.batch_size,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                SEARCH_URL,
                json=body,
                headers={
                    "X-Goog-Api-Key": settings.google_places_api_key,
                    "X-Goog-FieldMask": FIELD_MASK,
                },
            )
            resp.raise_for_status()

        data = resp.json()
        places = data.get("places", [])

        items: list[RawItem] = []
        for place in places[: self.batch_size]:
            place_id = place.get("id", "")
            name = place.get("displayName", {}).get("text", "")
            if not name:
                continue

            source_id = hashlib.sha256(f"gp:{place_id}".encode()).hexdigest()

            # Parse opening hours
            opening_hours: dict[str, str] = {}
            reg_hours = place.get("regularOpeningHours", {})
            for desc in reg_hours.get("weekdayDescriptions", []):
                # Format: "Monday: 10:00 AM – 10:00 PM"
                parts = desc.split(": ", 1)
                if len(parts) == 2:
                    opening_hours[parts[0]] = parts[1]

            # Extract cuisines from types
            cuisines: list[str] = []
            for ptype in place.get("types", []):
                if ptype.endswith(CUISINE_TYPE_SUFFIX):
                    cuisine_name = ptype[: -len(CUISINE_TYPE_SUFFIX)].replace("_", " ").title()
                    cuisines.append(cuisine_name)

            # Price level
            price_level = GOOGLE_PRICE_TO_PRICE_RANGE.get(
                place.get("priceLevel", ""), None
            )

            # First photo resource name
            photos = place.get("photos", [])
            photo_resource = photos[0]["name"] if photos else None

            item_data = {
                "google_place_id": place_id,
                "name": name,
                "address": place.get("formattedAddress", "Berlin, Germany"),
                "district": self.borough,
                "latitude": place.get("location", {}).get("latitude"),
                "longitude": place.get("location", {}).get("longitude"),
                "phone": place.get("internationalPhoneNumber"),
                "website": place.get("websiteUri"),
                "rating": place.get("rating"),
                "price_level": price_level,
                "opening_hours": opening_hours if opening_hours else None,
                "cuisines": cuisines,
                "_photo_resource_name": photo_resource,
            }

            items.append(
                RawItem(
                    source_type="google_places",
                    source_id=source_id,
                    content_type="restaurant",
                    data=item_data,
                    image_url=None,
                )
            )

        return items


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


async def get_photo_by_resource_name(photo_name: str) -> tuple[bytes, str] | None:
    """Get photo bytes from a Google Places photo resource name.

    Returns (image_bytes, content_type) or None.
    """
    if not settings.google_places_api_key or not photo_name:
        return None

    try:
        return await retry_with_backoff(
            _fetch_photo_bytes, photo_name,
            max_attempts=2, base_delay=2.0,
        )
    except Exception as e:
        log.warning("Google Places photo fetch failed", photo_name=photo_name, error=str(e))
        return None
