"""Article pipeline — RSS feeds + AI-generated originals."""

import hashlib
from datetime import datetime, timezone

import yaml

from src.ai.enricher import enrich_article_from_rss, enrich_article_original, summarize_article_from_rss
from src.api_client.client import APIClient
from src.db.settings import get_int_setting, get_json_setting
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.sources.rss import RSSSource
from src.utils.logging import get_logger

log = get_logger("pipelines.articles")

# Berlin-relevance keywords for filtering broad feeds
BERLIN_KEYWORDS = [
    "berlin", "kreuzberg", "neukölln", "mitte", "prenzlauer berg",
    "friedrichshain", "charlottenburg", "schöneberg", "tempelhof",
    "spandau", "reinickendorf", "steglitz", "pankow", "lichtenberg",
    "treptow", "köpenick", "moabit", "wedding", "bvg", "s-bahn",
    "u-bahn", "brandenburger tor", "reichstag", "alexanderplatz",
    "kurfürstendamm", "ku'damm", "potsdamer platz", "berghain",
    "hertha", "union berlin", "tiergarten", "wannsee", "tegel",
]


def _is_berlin_related(title: str, summary: str, content: str) -> bool:
    """Check if an article is Berlin-related by keyword matching."""
    text = f"{title} {summary} {content}".lower()
    return any(kw in text for kw in BERLIN_KEYWORDS)


# Category slug -> keyword mappings for auto-assignment
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "city-politics": ["politics", "government", "mayor", "senate", "election", "policy", "law", "regulation", "council", "parliament", "protest", "demonstration"],
    "business-economy": ["business", "economy", "startup", "company", "investment", "market", "trade", "finance", "economic", "industry", "tech", "commerce"],
    "culture": ["art", "museum", "gallery", "theater", "film", "cinema", "music", "concert", "festival", "exhibition", "literary", "opera", "dance", "performance"],
    "community": ["community", "neighborhood", "volunteer", "charity", "social", "integration", "refugee", "expat", "immigrant", "solidarity", "diversity"],
    "sports": ["sport", "football", "soccer", "marathon", "athletic", "olympic", "hertha", "union berlin", "basketball", "cycling", "fitness"],
    "education": ["education", "university", "school", "student", "research", "academic", "erasmus", "scholarship", "study", "campus"],
    "health": ["health", "hospital", "medical", "wellness", "mental health", "pandemic", "vaccine", "healthcare", "doctor", "clinic"],
    "environment": ["environment", "climate", "sustainability", "green", "energy", "recycling", "pollution", "park", "nature", "ecological"],
    "lifestyle": ["lifestyle", "food", "restaurant", "fashion", "shopping", "nightlife", "club", "bar", "cafe", "dating", "living"],
    "travel-tourism": ["travel", "tourism", "tourist", "hotel", "sightseeing", "day trip", "guide", "visit", "landmark", "attraction"],
}


def _assign_category_slug(title: str, body: str) -> str | None:
    """Auto-assign a category slug based on keyword matching in title+body."""
    text = f"{title} {body}".lower()
    scores: dict[str, int] = {}
    for slug, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[slug] = score
    if not scores:
        return "lifestyle"  # Default category
    return max(scores, key=scores.get)


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


class _ArticleCategoryMixin:
    """Shared category resolution for article pipelines."""

    _category_cache: dict[str, str] = {}

    async def _resolve_category_id(self, api_client: APIClient, slug: str | None) -> str | None:
        """Resolve a category slug to its UUID via the API, with caching."""
        if not slug:
            return None
        if slug in self._category_cache:
            return self._category_cache[slug]
        try:
            resp = await api_client.get(f"/categories/tree?type=article")
            categories = resp.json()
            if isinstance(categories, dict):
                categories = categories.get("data", categories)
            for cat in (categories if isinstance(categories, list) else []):
                self._category_cache[cat.get("slug", "")] = cat.get("id", "")
                for child in cat.get("children", []):
                    self._category_cache[child.get("slug", "")] = child.get("id", "")
        except Exception:
            pass
        return self._category_cache.get(slug)


class ArticleRSSPipeline(_ArticleCategoryMixin, BasePipeline):
    """Fetch RSS feeds -> AI rewrite -> push as articles."""

    content_type = "article"
    auto_publish = True

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", True)
        rss_config = config.get("sources", {}).get("rss", {})
        self._yaml_feeds = rss_config.get("feeds", [])
        self._max_items_per_feed = rss_config.get("max_items_per_feed", 0)
        self.source = RSSSource(
            self._yaml_feeds, max_items_per_feed=self._max_items_per_feed
        )

    async def fetch(self) -> list[RawItem]:
        db_feeds = await get_json_setting("source.rss_feeds", [])
        if db_feeds:
            self.source = RSSSource(
                db_feeds, max_items_per_feed=self._max_items_per_feed
            )
        return await self.source.fetch()

    async def enrich(self, raw_data: dict) -> dict | None:
        # Skip non-Berlin articles from broad feeds
        if not raw_data.get("berlin_only", False):
            if not _is_berlin_related(
                raw_data.get("title", ""),
                raw_data.get("summary", ""),
                raw_data.get("content", ""),
            ):
                log.info(
                    "Skipping non-Berlin article",
                    title=raw_data.get("title", "")[:80],
                    feed=raw_data.get("feed_name", ""),
                )
                return None
        return await summarize_article_from_rss(raw_data)

    async def build_api_payload_async(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", ""),
            "body": enriched.get("body", ""),
        }
        for field in ["subtitle", "excerpt", "seo_title", "seo_description", "seo_keywords", "source_url", "source_name"]:
            if enriched.get(field):
                payload[field] = enriched[field]
        if media_id:
            payload["featured_image_id"] = media_id
        # Auto-assign category
        cat_slug = _assign_category_slug(payload.get("title", ""), payload.get("body", ""))
        cat_id = await self._resolve_category_id(self.api_client, cat_slug)
        if cat_id:
            payload["category_id"] = cat_id
        return payload

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", ""),
            "body": enriched.get("body", ""),
        }
        for field in ["subtitle", "excerpt", "seo_title", "seo_description", "seo_keywords", "source_url", "source_name"]:
            if enriched.get(field):
                payload[field] = enriched[field]
        if media_id:
            payload["featured_image_id"] = media_id
        return payload


class ArticleAIPipeline(_ArticleCategoryMixin, BasePipeline):
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

    async def build_api_payload_async(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", ""),
            "body": enriched.get("body", ""),
        }
        for field in ["subtitle", "excerpt", "seo_title", "seo_description", "seo_keywords"]:
            if enriched.get(field):
                payload[field] = enriched[field]
        if media_id:
            payload["featured_image_id"] = media_id
        # Auto-assign category
        cat_slug = _assign_category_slug(payload.get("title", ""), payload.get("body", ""))
        cat_id = await self._resolve_category_id(self.api_client, cat_slug)
        if cat_id:
            payload["category_id"] = cat_id
        return payload

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
