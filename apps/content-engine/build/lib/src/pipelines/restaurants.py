"""Restaurant pipeline — OpenStreetMap Overpass API + AI enrichment."""

import yaml

from src.ai.enricher import enrich_restaurant
from src.api_client.client import APIClient
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.sources.overpass import OverpassSource
from src.utils.logging import get_logger

log = get_logger("pipelines.restaurants")


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
        src_config = config.get("sources", {}).get("overpass", {})
        self.source = OverpassSource(
            endpoint=src_config.get("endpoint", "https://overpass-api.de/api/interpreter"),
            batch_size=src_config.get("batch_size", 20),
        )

    async def fetch(self) -> list[RawItem]:
        return await self.source.fetch()

    async def enrich(self, raw_data: dict) -> dict:
        ai_data = await enrich_restaurant(raw_data)
        # Merge raw OSM data with AI-generated description
        return {
            "name": raw_data.get("name", ""),
            "description": ai_data.get("description", ""),
            "address": raw_data.get("address", "Berlin, Germany"),
            "district": raw_data.get("district"),
            "latitude": raw_data.get("latitude"),
            "longitude": raw_data.get("longitude"),
            "phone": raw_data.get("phone"),
            "website": raw_data.get("website"),
            "email": raw_data.get("email"),
            "cuisines": raw_data.get("cuisines", []),
        }

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "name": enriched.get("name", ""),
            "description": enriched.get("description", ""),
            "address": enriched.get("address", "Berlin, Germany"),
        }
        if enriched.get("district"):
            payload["district"] = enriched["district"]
        if enriched.get("latitude") is not None:
            payload["latitude"] = enriched["latitude"]
        if enriched.get("longitude") is not None:
            payload["longitude"] = enriched["longitude"]
        if enriched.get("phone"):
            payload["phone"] = enriched["phone"]
        if enriched.get("website"):
            payload["website"] = enriched["website"]
        if enriched.get("email"):
            payload["email"] = enriched["email"]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload
