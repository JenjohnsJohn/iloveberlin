"""
Regenerate missing image files for all published content.

Priority order for each item:
  1. Original source image URL (from RSS feed / source site)
  2. Google Places photo (restaurants)
  3. Kling AI generation (fallback)

Usage:
    cd apps/content-engine
    python -m scripts.regenerate_images [--dry-run] [--limit N]
"""

import argparse
import asyncio
import uuid as uuid_mod

import httpx

from src.ai.image_generator import generate_image
from src.api_client.client import APIClient
from src.api_client.media import download_image, upload_image
from src.db.engine import async_session
from src.db.models import PipelineItem, PushLog
from sqlalchemy import select


CONTENT_ENDPOINTS = {
    "article": "/articles",
    "event": "/events",
    "restaurant": "/dining/restaurants",
    "guide": "/guides",
    "video": "/videos",
}


async def check_image_exists(url: str) -> bool:
    """Check if an image URL returns 200."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.head(url)
            return resp.status_code == 200
    except Exception:
        return False


async def get_original_image_url(api_entity_id: str) -> str | None:
    """Look up the original source image URL from the pipeline DB."""
    async with async_session() as session:
        # Find the push log that created this API entity
        result = await session.execute(
            select(PushLog.pipeline_item_id)
            .where(PushLog.api_entity_id == api_entity_id)
            .order_by(PushLog.pushed_at.desc())
            .limit(1)
        )
        row = result.first()
        if not row:
            return None

        item = await session.get(PipelineItem, row[0])
        if not item:
            return None

        return item.raw_data.get("_image_url")


async def main():
    parser = argparse.ArgumentParser(description="Regenerate missing images")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=200)
    args = parser.parse_args()

    print("--- Image Regeneration Script ---")
    print(f"Dry run: {args.dry_run}")
    print()

    client = APIClient()
    regenerated = 0
    skipped = 0
    failed = 0

    try:
        for content_type, endpoint in CONTENT_ENDPOINTS.items():
            print(f"\n=== {content_type.upper()} ===")
            page = 1
            items = []
            while True:
                resp = await client.get(f"{endpoint}?page={page}&limit=50")
                data = resp.json()
                batch = data.get("data", data) if isinstance(data, dict) else data
                if not batch:
                    break
                items.extend(batch if isinstance(batch, list) else [batch])
                total = data.get("total", 0) if isinstance(data, dict) else 0
                if page * 50 >= total:
                    break
                page += 1

            for item in items[:args.limit]:
                item_id = item.get("id", "")
                title = item.get("title", item.get("name", ""))
                featured = item.get("featured_image")

                if featured and featured.get("url"):
                    exists = await check_image_exists(featured["url"])
                    if exists:
                        skipped += 1
                        continue

                print(f"  {title[:60]} — regenerating...")

                if args.dry_run:
                    regenerated += 1
                    continue

                image_bytes = None
                ct = "image/jpeg"

                # Strategy 1: Try original source image URL from pipeline DB
                source_url = await get_original_image_url(item_id)
                if source_url:
                    result = await download_image(source_url)
                    if result:
                        image_bytes, ct = result
                        print(f"    Source: original URL")

                # Strategy 2: Google Places photo (restaurants)
                if not image_bytes and content_type == "restaurant":
                    gp_id = item.get("google_place_id")
                    if gp_id:
                        from src.sources.google_places import get_photo_by_resource_name
                        # We don't have the photo resource name from the API response,
                        # but we can look it up from the pipeline DB
                        async with async_session() as session:
                            result = await session.execute(
                                select(PushLog.pipeline_item_id)
                                .where(PushLog.api_entity_id == item_id)
                                .limit(1)
                            )
                            row = result.first()
                            if row:
                                pi = await session.get(PipelineItem, row[0])
                                if pi and pi.enriched_data:
                                    photo_res = pi.enriched_data.get("_photo_resource_name")
                                    if photo_res:
                                        gp_result = await get_photo_by_resource_name(photo_res)
                                        if gp_result:
                                            image_bytes, ct = gp_result
                                            print(f"    Source: Google Places photo")

                # Strategy 3: Kling AI generation
                if not image_bytes:
                    enriched = {"title": title, "name": title}
                    if item.get("description"):
                        enriched["description"] = item["description"][:200]
                    if item.get("cuisines"):
                        enriched["cuisines"] = ", ".join(
                            c.get("name", "") for c in item["cuisines"]
                        )
                    if item.get("district"):
                        enriched["district"] = item["district"]

                    image_bytes = await generate_image(content_type, enriched)
                    if image_bytes:
                        ct = "image/jpeg"
                        print(f"    Source: Kling AI")

                if not image_bytes:
                    print(f"    FAILED — no image source available")
                    failed += 1
                    continue

                # Upload to API
                ext = ct.split("/")[-1]
                filename = f"regen-{item_id}.{ext}"
                media_id = await upload_image(client, image_bytes, filename, ct)
                if not media_id:
                    print(f"    FAILED to upload")
                    failed += 1
                    continue

                # Patch the content item
                patch_endpoint = f"{endpoint}/{item_id}"
                try:
                    await client.patch(patch_endpoint, json={"featured_image_id": media_id})
                    print(f"    OK (media_id={media_id})")
                    regenerated += 1
                except Exception as e:
                    print(f"    PATCH failed: {e}")
                    failed += 1

                await asyncio.sleep(1)

    finally:
        await client.close()

    print(f"\n--- Results ---")
    print(f"Regenerated: {regenerated}")
    print(f"Skipped (exists): {skipped}")
    print(f"Failed: {failed}")


if __name__ == "__main__":
    asyncio.run(main())
