import hashlib

import httpx

from config.settings import settings
from src.sources.base import RawItem, Source
from src.utils.logging import get_logger

log = get_logger("sources.youtube")

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


class YouTubeSource(Source):
    source_type = "youtube"

    def __init__(self, search_queries: list[str], max_results_per_query: int = 5):
        self.search_queries = search_queries
        self.max_results_per_query = max_results_per_query

    async def fetch(self) -> list[RawItem]:
        if not settings.youtube_api_key:
            log.warning("YouTube API key not set, skipping")
            return []

        items: list[RawItem] = []
        seen_ids: set[str] = set()

        async with httpx.AsyncClient(timeout=15.0) as client:
            for query in self.search_queries:
                try:
                    query_items = await self._search(client, query, seen_ids)
                    items.extend(query_items)
                except Exception as e:
                    log.error("YouTube search failed", query=query, error=str(e))

        log.info("YouTube videos fetched", count=len(items))
        return items

    async def _search(
        self, client: httpx.AsyncClient, query: str, seen_ids: set[str]
    ) -> list[RawItem]:
        resp = await client.get(
            YOUTUBE_SEARCH_URL,
            params={
                "key": settings.youtube_api_key,
                "q": query,
                "part": "snippet",
                "type": "video",
                "maxResults": self.max_results_per_query,
                "order": "date",
                "relevanceLanguage": "en",
                "regionCode": "DE",
            },
        )
        resp.raise_for_status()
        search_data = resp.json()

        video_ids = []
        for item in search_data.get("items", []):
            vid = item["id"].get("videoId")
            if vid and vid not in seen_ids:
                video_ids.append(vid)
                seen_ids.add(vid)

        if not video_ids:
            return []

        # Get video details (duration, etc.)
        details_resp = await client.get(
            YOUTUBE_VIDEOS_URL,
            params={
                "key": settings.youtube_api_key,
                "id": ",".join(video_ids),
                "part": "snippet,contentDetails",
            },
        )
        details_resp.raise_for_status()
        details_data = details_resp.json()

        items = []
        for video in details_data.get("items", []):
            vid = video["id"]
            snippet = video["snippet"]
            content_details = video.get("contentDetails", {})
            duration_iso = content_details.get("duration", "")
            duration_seconds = _parse_iso_duration(duration_iso)

            source_id = hashlib.sha256(f"youtube:{vid}".encode()).hexdigest()
            thumbnail = (
                snippet.get("thumbnails", {}).get("high", {}).get("url")
                or snippet.get("thumbnails", {}).get("default", {}).get("url", "")
            )

            items.append(
                RawItem(
                    source_type="youtube",
                    source_id=source_id,
                    content_type="video",
                    image_url=thumbnail,
                    data={
                        "video_id": vid,
                        "title": snippet.get("title", ""),
                        "description": snippet.get("description", ""),
                        "channel_title": snippet.get("channelTitle", ""),
                        "published_at": snippet.get("publishedAt", ""),
                        "thumbnail_url": thumbnail,
                        "duration_seconds": duration_seconds,
                        "video_url": f"https://www.youtube.com/watch?v={vid}",
                    },
                )
            )
        return items


def _parse_iso_duration(iso: str) -> int:
    """Parse ISO 8601 duration (PT1H2M3S) to seconds."""
    if not iso or not iso.startswith("PT"):
        return 0
    iso = iso[2:]  # Remove 'PT'
    hours = minutes = seconds = 0
    num = ""
    for ch in iso:
        if ch.isdigit():
            num += ch
        elif ch == "H":
            hours = int(num) if num else 0
            num = ""
        elif ch == "M":
            minutes = int(num) if num else 0
            num = ""
        elif ch == "S":
            seconds = int(num) if num else 0
            num = ""
    return hours * 3600 + minutes * 60 + seconds
