import hashlib
import re

import feedparser
import httpx
from bs4 import BeautifulSoup

from src.db.settings import get_setting, set_setting
from src.sources.base import RawItem, Source
from src.utils.html import strip_html
from src.utils.logging import get_logger

log = get_logger("sources.rss")

IMG_RE = re.compile(r'<img[^>]+src=["\']([^"\'> ]+)', re.IGNORECASE)


class RSSSource(Source):
    source_type = "rss"

    def __init__(
        self,
        feeds: list[dict],
        fetch_og_images: bool = True,
        max_items_per_feed: int = 0,
    ):
        """
        Args:
            feeds: List of dicts with 'url' and 'name' keys.
            fetch_og_images: If True, fetch article pages to get og:image when no image in feed.
            max_items_per_feed: If > 0, only take the latest N items per feed.
        """
        self.feeds = feeds
        self.fetch_og_images = fetch_og_images
        self.max_items_per_feed = max_items_per_feed

    async def fetch(self) -> list[RawItem]:
        items: list[RawItem] = []
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            for feed_cfg in self.feeds:
                try:
                    feed_items = await self._fetch_feed(client, feed_cfg)
                    items.extend(feed_items)
                    log.info(
                        "RSS feed fetched",
                        feed=feed_cfg["name"],
                        count=len(feed_items),
                    )
                except Exception as e:
                    log.error("RSS feed failed", feed=feed_cfg["name"], url=feed_cfg["url"], error=str(e))
        return items

    async def _fetch_feed(
        self, client: httpx.AsyncClient, feed_cfg: dict
    ) -> list[RawItem]:
        url = feed_cfg["url"]
        feed_hash = hashlib.sha256(url.encode()).hexdigest()[:16]

        # Phase 5.4: conditional fetch with ETag/Last-Modified
        headers = {}
        etag_key = f"rss.etag.{feed_hash}"
        last_modified_key = f"rss.last_modified.{feed_hash}"

        cached_etag = await get_setting(etag_key, "")
        cached_modified = await get_setting(last_modified_key, "")
        if cached_etag:
            headers["If-None-Match"] = cached_etag
        if cached_modified:
            headers["If-Modified-Since"] = cached_modified

        resp = await client.get(url, headers=headers)

        # 304 Not Modified — feed hasn't changed
        if resp.status_code == 304:
            log.info("RSS feed unchanged (304)", feed=feed_cfg["name"])
            return []

        resp.raise_for_status()

        # Store ETag/Last-Modified for next fetch
        new_etag = resp.headers.get("ETag", "")
        new_modified = resp.headers.get("Last-Modified", "")
        if new_etag:
            await set_setting(etag_key, new_etag)
        if new_modified:
            await set_setting(last_modified_key, new_modified)

        parsed = feedparser.parse(resp.text)
        entries = parsed.entries
        if self.max_items_per_feed > 0:
            entries = entries[: self.max_items_per_feed]
        items = []
        for entry in entries:
            source_id = entry.get("id") or entry.get("link", "")
            fingerprint = hashlib.sha256(source_id.encode()).hexdigest()

            # Extract image — try multiple sources
            image_url = self._extract_image_from_entry(entry)

            # If no image found and fetch_og_images is on, try og:image from article page
            if not image_url and self.fetch_og_images and entry.get("link"):
                image_url = await self._fetch_og_image(client, entry["link"])

            # Extract full content if available
            content = ""
            if hasattr(entry, "content") and entry.content:
                content = entry.content[0].get("value", "")

            items.append(
                RawItem(
                    source_type="rss",
                    source_id=fingerprint,
                    content_type="article",
                    image_url=image_url,
                    data={
                        "feed_name": feed_cfg["name"],
                        "berlin_only": feed_cfg.get("berlin_only", False),
                        "title": entry.get("title", ""),
                        "link": entry.get("link", ""),
                        "summary": strip_html(entry.get("summary", "")),
                        "content": strip_html(content) if content else "",
                        "published": entry.get("published", ""),
                        "author": entry.get("author", ""),
                    },
                )
            )
        return items

    def _extract_image_from_entry(self, entry) -> str | None:
        """Try to extract image URL from RSS entry metadata and content."""
        # 1. media:content
        if hasattr(entry, "media_content") and entry.media_content:
            for mc in entry.media_content:
                url = mc.get("url", "")
                if url and ("image" in mc.get("type", "image") or mc.get("medium") == "image"):
                    return url
            # If no type specified, use first one
            return entry.media_content[0].get("url")

        # 2. media:thumbnail
        if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
            return entry.media_thumbnail[0].get("url")

        # 3. enclosures with image type
        if hasattr(entry, "enclosures") and entry.enclosures:
            for enc in entry.enclosures:
                if enc.get("type", "").startswith("image/"):
                    return enc.get("href")

        # 4. img tag inside content or summary
        content_html = ""
        if hasattr(entry, "content") and entry.content:
            content_html = entry.content[0].get("value", "")
        if not content_html:
            content_html = entry.get("summary", "")

        if content_html:
            match = IMG_RE.search(content_html)
            if match:
                url = match.group(1)
                # Skip tiny tracking pixels and icons
                if not any(skip in url.lower() for skip in ["pixel", "1x1", "spacer", "blank", "icon"]):
                    return url

        return None

    async def _fetch_og_image(self, client: httpx.AsyncClient, url: str) -> str | None:
        """Fetch article page and extract og:image meta tag."""
        try:
            resp = await client.get(url, timeout=10.0)
            if resp.status_code != 200:
                return None
            # Only parse head section for speed
            head_end = resp.text.find("</head>")
            html_chunk = resp.text[: head_end + 7] if head_end > 0 else resp.text[:5000]
            soup = BeautifulSoup(html_chunk, "lxml")

            # Try og:image first, then twitter:image
            for prop in ["og:image", "twitter:image"]:
                tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
                if tag and tag.get("content"):
                    img = tag["content"]
                    if img.startswith("http"):
                        return img
            return None
        except Exception:
            return None
