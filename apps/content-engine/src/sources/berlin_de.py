import hashlib

import feedparser
import httpx
from bs4 import BeautifulSoup

from src.sources.base import RawItem, Source
from src.utils.html import strip_html
from src.utils.logging import get_logger

log = get_logger("sources.berlin_de")

EVENTS_RSS_URL = "https://www.berlin.de/en/events/rss/"
EVENTS_HTML_URL = "https://www.berlin.de/en/events/"


class BerlinDeSource(Source):
    source_type = "berlin_de"

    def __init__(self, rss_url: str = EVENTS_RSS_URL, html_url: str = EVENTS_HTML_URL):
        self.rss_url = rss_url
        self.html_url = html_url

    async def fetch(self) -> list[RawItem]:
        items: list[RawItem] = []
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            # Fetch from RSS
            try:
                rss_items = await self._fetch_rss(client)
                items.extend(rss_items)
                log.info("berlin.de RSS fetched", count=len(rss_items))
            except Exception as e:
                log.error("berlin.de RSS failed", error=str(e))

            # Also try HTML scraping for richer data
            try:
                html_items = await self._fetch_html(client)
                items.extend(html_items)
                log.info("berlin.de HTML fetched", count=len(html_items))
            except Exception as e:
                log.error("berlin.de HTML scrape failed", error=str(e))

        return items

    async def _fetch_rss(self, client: httpx.AsyncClient) -> list[RawItem]:
        resp = await client.get(self.rss_url)
        resp.raise_for_status()
        parsed = feedparser.parse(resp.text)
        items = []
        for entry in parsed.entries:
            link = entry.get("link", "")
            source_id = hashlib.sha256(f"berlinde:{link}".encode()).hexdigest()
            items.append(
                RawItem(
                    source_type="berlin_de",
                    source_id=source_id,
                    content_type="event",
                    data={
                        "title": entry.get("title", ""),
                        "link": link,
                        "description": strip_html(entry.get("summary", "")),
                        "published": entry.get("published", ""),
                        "source": "berlin.de RSS",
                    },
                )
            )
        return items

    async def _fetch_html(self, client: httpx.AsyncClient) -> list[RawItem]:
        resp = await client.get(self.html_url)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")
        items = []

        # Phase 5.3: warn when HTTP 200 + non-empty body yields zero items
        html_has_content = len(resp.text) > 500

        for article in soup.select("article.event, .vevent, .event-item"):
            title_el = article.select_one("h2, h3, .summary, .event-title")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            link_el = article.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            if link and not link.startswith("http"):
                link = f"https://www.berlin.de{link}"

            desc_el = article.select_one(".description, .event-description, p")
            description = desc_el.get_text(strip=True) if desc_el else ""

            date_el = article.select_one(".dtstart, time, .event-date")
            date_str = ""
            if date_el:
                date_str = date_el.get("datetime", "") or date_el.get_text(strip=True)

            location_el = article.select_one(".location, .event-location")
            location = location_el.get_text(strip=True) if location_el else ""

            source_id = hashlib.sha256(f"berlinde:{link or title}".encode()).hexdigest()
            items.append(
                RawItem(
                    source_type="berlin_de",
                    source_id=source_id,
                    content_type="event",
                    data={
                        "title": title,
                        "link": link,
                        "description": description,
                        "date": date_str,
                        "location": location,
                        "source": "berlin.de HTML",
                    },
                )
            )

        # Phase 5.3: warn if page had content but no events matched selectors
        if not items and html_has_content:
            log.warning(
                "berlin.de HTML returned 200 with content but zero events matched — "
                "selectors may be outdated, check for site redesign",
                html_url=self.html_url,
                body_size=len(resp.text),
            )

        return items
