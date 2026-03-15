"""Event pipeline — berlin.de + RSS feeds + AI-generated events."""

import hashlib
from datetime import datetime, timezone

import yaml

from src.ai.enricher import enrich_event, generate_event
from src.api_client.client import APIClient
from src.db.settings import get_int_setting
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.sources.berlin_de import BerlinDeSource
from src.sources.rss import RSSSource
from src.utils.logging import get_logger

log = get_logger("pipelines.events")


def _load_config() -> dict:
    with open("config/content_types.yaml") as f:
        return yaml.safe_load(f).get("events", {})


class EventBerlinDePipeline(BasePipeline):
    """Fetch events from berlin.de + RSS feeds → AI enrich → push."""

    content_type = "event"
    auto_publish = False

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", False)
        src_config = config.get("sources", {})

        # berlin.de source
        bd_config = src_config.get("berlin_de", {})
        self.berlin_de_source = BerlinDeSource(
            rss_url=bd_config.get("rss_url", "https://www.berlin.de/en/events/rss/"),
            html_url=bd_config.get("html_url", "https://www.berlin.de/en/events/"),
        )

        # Additional RSS feeds for events
        rss_feeds = src_config.get("rss", {}).get("feeds", [])
        self.rss_source = RSSSource(rss_feeds) if rss_feeds else None

    async def fetch(self) -> list[RawItem]:
        items = await self.berlin_de_source.fetch()

        # Also fetch from RSS feeds
        if self.rss_source:
            rss_items = await self.rss_source.fetch()
            # Override content_type to "event" since RSS source defaults to "article"
            for item in rss_items:
                item.content_type = "event"
            items.extend(rss_items)

        return items

    async def enrich(self, raw_data: dict) -> dict:
        return await enrich_event(raw_data)

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        start_date = enriched.get("start_date")
        if not start_date:
            start_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        payload = {
            "title": enriched.get("title", ""),
            "description": enriched.get("description", ""),
            "start_date": start_date,
        }
        for field in ["excerpt", "end_date", "start_time", "end_time", "is_free", "price"]:
            if enriched.get(field) is not None:
                payload[field] = enriched[field]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload


class EventAIPipeline(BasePipeline):
    """Generate original community events via AI."""

    content_type = "event"
    auto_publish = False

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", False)
        self.daily_count = config.get("sources", {}).get("ai", {}).get("daily_count", 5)

    async def fetch(self) -> list[RawItem]:
        # Read daily_count from DB, fallback to __init__ value
        self.daily_count = await get_int_setting(
            "target.events_ai.daily_count", self.daily_count
        )
        items = []
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        for i in range(self.daily_count):
            source_id = hashlib.sha256(
                f"ai:event:{today}:{i}".encode()
            ).hexdigest()
            items.append(
                RawItem(
                    source_type="ai",
                    source_id=source_id,
                    content_type="event",
                    data={"generate": True, "index": i, "date": today},
                )
            )
        return items

    async def enrich(self, raw_data: dict) -> dict:
        return await generate_event()

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        start_date = enriched.get("start_date")
        if not start_date:
            start_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        payload = {
            "title": enriched.get("title", ""),
            "description": enriched.get("description", ""),
            "start_date": start_date,
        }
        for field in ["excerpt", "end_date", "start_time", "end_time", "is_free", "price"]:
            if enriched.get(field) is not None:
                payload[field] = enriched[field]
        return payload
