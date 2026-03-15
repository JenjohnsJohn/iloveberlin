"""Restaurant pipeline — Google Places API + AI enrichment."""

import yaml

from src.ai.enricher import enrich_restaurant
from src.api_client.client import APIClient
from src.db.settings import get_int_setting, get_setting, set_setting
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.sources.google_places import GooglePlacesSource
from src.utils.logging import get_logger

log = get_logger("pipelines.restaurants")

BERLIN_BOROUGHS = [
    "Mitte",
    "Friedrichshain-Kreuzberg",
    "Pankow",
    "Charlottenburg-Wilmersdorf",
    "Spandau",
    "Steglitz-Zehlendorf",
    "Tempelhof-Schöneberg",
    "Neukölln",
    "Treptow-Köpenick",
    "Marzahn-Hellersdorf",
    "Lichtenberg",
    "Reinickendorf",
]


def _load_config() -> dict:
    with open("config/content_types.yaml") as f:
        return yaml.safe_load(f).get("restaurants", {})


class RestaurantPipeline(BasePipeline):
    content_type = "restaurant"
    auto_publish = False

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", False)
        src_config = config.get("sources", {}).get("google_places", {})
        self._batch_size = src_config.get("batch_size", 20)

    async def fetch(self) -> list[RawItem]:
        batch_size = await get_int_setting(
            "target.restaurants.batch_size", self._batch_size
        )

        # Rotate through boroughs
        last_borough_idx = int(await get_setting("google_places.last_borough_index", "0"))
        borough_idx = last_borough_idx % len(BERLIN_BOROUGHS)
        borough = BERLIN_BOROUGHS[borough_idx]

        # Advance to next borough for next run
        await set_setting(
            "google_places.last_borough_index",
            str(borough_idx + 1),
            "Index of last fetched Berlin borough for restaurant rotation",
        )

        log.info("Fetching restaurants from borough", borough=borough)
        source = GooglePlacesSource(
            batch_size=batch_size,
            borough=borough,
        )
        return await source.fetch()

    async def enrich(self, raw_data: dict) -> dict:
        ai_data = await enrich_restaurant(raw_data)
        return {
            "name": raw_data.get("name", ""),
            "description": ai_data.get("description", ""),
            "google_place_id": raw_data.get("google_place_id"),
            "address": raw_data.get("address", "Berlin, Germany"),
            "district": raw_data.get("district"),
            "latitude": raw_data.get("latitude"),
            "longitude": raw_data.get("longitude"),
            "phone": raw_data.get("phone"),
            "website": raw_data.get("website"),
            "email": raw_data.get("email"),
            "rating": raw_data.get("rating"),
            "price_range": raw_data.get("price_level"),
            "opening_hours": raw_data.get("opening_hours"),
            "cuisines": raw_data.get("cuisines", []),
            "_photo_resource_name": raw_data.get("_photo_resource_name"),
        }

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "name": enriched.get("name", ""),
            "description": enriched.get("description", ""),
            "address": enriched.get("address", "Berlin, Germany"),
        }
        for key in (
            "google_place_id", "district", "latitude", "longitude",
            "phone", "website", "email", "rating", "price_range", "opening_hours",
        ):
            if enriched.get(key) is not None:
                payload[key] = enriched[key]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload
