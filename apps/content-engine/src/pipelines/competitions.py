"""Competition pipeline — AI-generated contests."""

import hashlib
from datetime import datetime, timezone

import yaml

from src.ai.enricher import generate_competition
from src.api_client.client import APIClient
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.utils.logging import get_logger

log = get_logger("pipelines.competitions")


def _load_config() -> dict:
    with open("config/content_types.yaml") as f:
        return yaml.safe_load(f).get("competitions", {})


class CompetitionPipeline(BasePipeline):
    content_type = "competition"
    auto_publish = False

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", False)

    async def fetch(self) -> list[RawItem]:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        source_id = hashlib.sha256(
            f"ai:competition:{today}".encode()
        ).hexdigest()
        return [
            RawItem(
                source_type="ai",
                source_id=source_id,
                content_type="competition",
                data={"generate": True, "date": today},
            )
        ]

    async def enrich(self, raw_data: dict) -> dict:
        return await generate_competition()

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", ""),
            "description": enriched.get("description", ""),
            "start_date": enriched.get("start_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            "end_date": enriched.get("end_date", ""),
            # Competitions use active/draft, not published/draft
            "status": "draft",
        }
        if enriched.get("prize_description"):
            payload["prize_description"] = enriched["prize_description"]
        if enriched.get("terms_conditions"):
            payload["terms_conditions"] = enriched["terms_conditions"]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload
