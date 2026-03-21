"""Guide pipeline — AI-generated comprehensive guides."""

import hashlib
from datetime import datetime, timezone

import yaml

from src.ai.enricher import generate_guide
from src.api_client.client import APIClient
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.utils.logging import get_logger

log = get_logger("pipelines.guides")

GUIDE_TOPICS = [
    "Best Coffee Shops in Berlin",
    "Berlin Street Food Guide",
    "Exploring Berlin by Bike",
    "Berlin's Best Flea Markets",
    "A Guide to Berlin's Lakes and Swimming Spots",
    "Berlin Techno Scene: A Beginner's Guide",
    "Vegan and Vegetarian Dining in Berlin",
    "Berlin's Hidden Courtyards (Hinterhöfe)",
    "Budget Living in Berlin",
    "Berlin's Best Museums and Galleries",
    "Dog-Friendly Berlin",
    "Berlin's Craft Beer Scene",
    "Coworking Spaces in Berlin",
    "Berlin for Families with Kids",
    "Seasonal Guide to Berlin's Parks",
    "Berlin's Best Brunch Spots",
    "Vintage and Second-Hand Shopping in Berlin",
    "Berlin's Street Art and Graffiti Tour",
    "Learning German in Berlin: Best Schools and Resources",
    "Berlin's Christmas Markets Guide",
    "Running and Jogging Routes in Berlin",
    "Best Rooftop Bars in Berlin",
    "Berlin's Live Music Venues",
    "Photography Spots in Berlin",
    "Berlin's Best Bakeries and Konditorei",
]


def _load_config() -> dict:
    with open("config/content_types.yaml") as f:
        return yaml.safe_load(f).get("guides", {})


class GuidePipeline(BasePipeline):
    content_type = "guide"
    auto_publish = False

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", False)
        ai_config = config.get("sources", {}).get("ai", {})
        self.daily_count = ai_config.get("daily_count", 5)
        self.min_words = ai_config.get("min_words", 800)
        self.max_words = ai_config.get("max_words", 1500)

    async def fetch(self) -> list[RawItem]:
        items = []
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        # Rotate through topics using day of year
        day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
        for i in range(self.daily_count):
            idx = (day_of_year * self.daily_count + i) % len(GUIDE_TOPICS)
            topic = GUIDE_TOPICS[idx]
            source_id = hashlib.sha256(
                f"ai:guide:{topic}:{today}".encode()
            ).hexdigest()
            items.append(
                RawItem(
                    source_type="ai",
                    source_id=source_id,
                    content_type="guide",
                    data={
                        "topic": topic,
                        "date": today,
                        "min_words": self.min_words,
                        "max_words": self.max_words,
                    },
                )
            )
        return items

    async def enrich(self, raw_data: dict) -> dict:
        return await generate_guide(
            raw_data.get("topic", "Berlin Guide"),
            min_words=raw_data.get("min_words", self.min_words),
            max_words=raw_data.get("max_words", self.max_words),
        )

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", ""),
            "body": enriched.get("body", ""),
        }
        for field in ["excerpt", "seo_title", "seo_description"]:
            if enriched.get(field):
                payload[field] = enriched[field]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload
