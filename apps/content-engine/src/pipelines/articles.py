"""Article pipeline — RSS feeds + AI-generated originals."""

import hashlib
from datetime import datetime, timezone

import yaml

from src.ai.enricher import enrich_article_from_rss, enrich_article_original
from src.api_client.client import APIClient
from src.db.settings import get_int_setting, get_json_setting
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.sources.rss import RSSSource
from src.utils.logging import get_logger

log = get_logger("pipelines.articles")

# Phase 3.1: default topics, can be overridden via DB setting
DEFAULT_ARTICLE_TOPICS = [
    "Berlin neighborhoods and local life",
    "Berlin food and restaurant scene",
    "Berlin nightlife and clubs",
    "Berlin art and culture",
    "Berlin history and architecture",
    "Berlin parks and outdoor activities",
    "Berlin shopping and markets",
    "Berlin tech and startup scene",
    "Berlin music scene",
    "Berlin expat life and tips",
]


def _load_config() -> dict:
    with open("config/content_types.yaml") as f:
        return yaml.safe_load(f).get("articles", {})


class ArticleRSSPipeline(BasePipeline):
    """Fetch RSS feeds -> AI rewrite -> push as articles."""

    content_type = "article"
    auto_publish = True

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", True)
        self._yaml_feeds = config.get("sources", {}).get("rss", {}).get("feeds", [])
        self.source = RSSSource(self._yaml_feeds)

    async def fetch(self) -> list[RawItem]:
        db_feeds = await get_json_setting("source.rss_feeds", [])
        if db_feeds:
            self.source = RSSSource(db_feeds)
        return await self.source.fetch()

    async def enrich(self, raw_data: dict) -> dict:
        return await enrich_article_from_rss(raw_data)

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", ""),
            "body": enriched.get("body", ""),
        }
        for field in ["subtitle", "excerpt", "seo_title", "seo_description", "seo_keywords"]:
            if enriched.get(field):
                payload[field] = enriched[field]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload


class ArticleAIPipeline(BasePipeline):
    """Generate fully original AI articles."""

    content_type = "article"
    auto_publish = True

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", True)
        ai_config = config.get("sources", {}).get("ai", {})
        self.daily_count = ai_config.get("daily_count", 15)
        self._yaml_topics = ai_config.get("topics", DEFAULT_ARTICLE_TOPICS)

    async def fetch(self) -> list[RawItem]:
        """Generate RawItems for AI article topics."""
        self.daily_count = await get_int_setting(
            "target.articles_ai.daily_count", self.daily_count
        )

        # Phase 3.1: read topics from DB, fall back to YAML/defaults
        topics = await get_json_setting("source.ai_article_topics", self._yaml_topics)
        if not topics:
            topics = self._yaml_topics

        items = []
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        for i, topic in enumerate(topics):
            if i >= self.daily_count:
                break
            source_id = hashlib.sha256(
                f"ai:article:{topic}:{today}".encode()
            ).hexdigest()
            items.append(
                RawItem(
                    source_type="ai",
                    source_id=source_id,
                    content_type="article",
                    data={"topic": topic, "date": today},
                )
            )
        return items

    async def enrich(self, raw_data: dict) -> dict:
        return await enrich_article_original(raw_data.get("topic", "Berlin lifestyle"))

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", ""),
            "body": enriched.get("body", ""),
        }
        for field in ["subtitle", "excerpt", "seo_title", "seo_description", "seo_keywords"]:
            if enriched.get(field):
                payload[field] = enriched[field]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload
