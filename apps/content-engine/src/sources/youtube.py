import hashlib
from datetime import datetime, timezone

import httpx

from config.settings import settings
from src.db.settings import get_setting, set_setting
from src.sources.base import RawItem, Source
from src.utils.logging import get_logger

log = get_logger("sources.youtube")

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

# Phase 4.4: quota costs per endpoint
SEARCH_QUOTA_COST = 100
VIDEOS_QUOTA_COST = 1
DAILY_QUOTA_LIMIT = 10000


class YouTubeSource(Source):
    source_type = "youtube"

    def __init__(self, search_queries: list[str], max_results_per_query: int = 5):
        self.search_queries = search_queries
        self.max_results_per_query = max_results_per_query

    async def _track_quota(self, units: int):
        """Phase 4.4: track daily YouTube API quota usage."""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        key = f"youtube.quota.{today}"
        current = int(await get_setting(key, "0"))
        new_total = current + units
        await set_setting(key, str(new_total), f"YouTube API quota used on {today}")
        return new_total

    async def _get_quota_used(self) -> int:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return int(await get_setting(f"youtube.quota.{today}", "0"))

    async def fetch(self) -> list[RawItem]:
        if not settings.youtube_api_key:
            log.warning("YouTube API key not set, skipping")
            return []

        items: list[RawItem] = []
        seen_ids: set[str] = set()

        async with httpx.AsyncClient(timeout=15.0) as client:
            for query in self.search_queries:
                # Phase 4.4: check quota before making requests
                quota_used = await self._get_quota_used()
                if quota_used + SEARCH_QUOTA_COST > DAILY_QUOTA_LIMIT:
                    log.warning(
                        "YouTube daily quota limit approaching, skipping remaining queries",
                        quota_used=quota_used,
                        limit=DAILY_QUOTA_LIMIT,
                    )
                    break

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
        await self._track_quota(SEARCH_QUOTA_COST)
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
        await self._track_quota(VIDEOS_QUOTA_COST)
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
