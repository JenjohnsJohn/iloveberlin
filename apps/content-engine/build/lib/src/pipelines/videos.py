"""Video pipeline — YouTube Data API v3."""

import yaml

from src.api_client.client import APIClient
from src.api_client.media import download_image, upload_image
from src.pipelines.base import BasePipeline
from src.sources.base import RawItem
from src.sources.youtube import YouTubeSource
from src.utils.logging import get_logger

log = get_logger("pipelines.videos")


def _load_config() -> dict:
    with open("config/content_types.yaml") as f:
        return yaml.safe_load(f).get("videos", {})


class VideoPipeline(BasePipeline):
    """Fetch YouTube videos → push to API (no AI enrichment needed)."""

    content_type = "video"
    auto_publish = True

    def __init__(self, api_client: APIClient):
        super().__init__(api_client)
        config = _load_config()
        self.auto_publish = config.get("auto_publish", True)
        yt_config = config.get("sources", {}).get("youtube", {})
        self.source = YouTubeSource(
            search_queries=yt_config.get("search_queries", []),
            max_results_per_query=yt_config.get("max_results_per_query", 5),
        )

    async def fetch(self) -> list[RawItem]:
        return await self.source.fetch()

    async def enrich(self, raw_data: dict) -> dict:
        # YouTube videos don't need AI enrichment — the data is already rich
        return {
            "title": raw_data.get("title", ""),
            "description": raw_data.get("description", ""),
            "video_url": raw_data.get("video_url", ""),
            "video_provider": "youtube",
            "duration_seconds": raw_data.get("duration_seconds", 0),
            "thumbnail_url": raw_data.get("thumbnail_url"),
            "published_at": raw_data.get("published_at"),
        }

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        payload = {
            "title": enriched.get("title", "")[:255],
            "video_url": enriched.get("video_url", ""),
            "video_provider": "youtube",
        }
        if enriched.get("description"):
            payload["description"] = enriched["description"][:5000]
        if enriched.get("duration_seconds"):
            payload["duration_seconds"] = enriched["duration_seconds"]
        if enriched.get("published_at"):
            payload["published_at"] = enriched["published_at"]
        if media_id:
            payload["thumbnail_id"] = media_id
        return payload
