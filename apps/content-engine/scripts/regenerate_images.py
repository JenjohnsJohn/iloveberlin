"""
Regenerate missing image files for all published content.

Reads media records from the API, checks if file exists on disk via HTTP,
and regenerates missing images using Kling AI.

Usage:
    cd apps/content-engine
    python -m scripts.regenerate_images [--dry-run] [--limit N]
"""

import argparse
import asyncio

from src.ai.image_generator import generate_image
from src.api_client.client import APIClient
from src.api_client.media import upload_image


CONTENT_ENDPOINTS = {
    "article": "/articles",
    "event": "/events",
    "restaurant": "/dining/restaurants",
    "guide": "/guides",
    "video": "/videos",
}


async def check_image_exists(url: str) -> bool:
    """Check if an image URL returns 200."""
    import httpx
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.head(url)
            return resp.status_code == 200
    except Exception:
        return False


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

                if not featured or not featured.get("url"):
                    # No image record at all — generate new
                    pass
                else:
                    # Check if file exists
                    exists = await check_image_exists(featured["url"])
                    if exists:
                        skipped += 1
                        continue

                print(f"  {title[:60]} — regenerating...")

                if args.dry_run:
                    regenerated += 1
                    continue

                # Generate new image via Kling AI
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
                if not image_bytes:
                    print(f"    FAILED to generate image")
                    failed += 1
                    continue

                # Upload to API
                filename = f"regen-{item_id}.jpg"
                media_id = await upload_image(client, image_bytes, filename, "image/jpeg")
                if not media_id:
                    print(f"    FAILED to upload image")
                    failed += 1
                    continue

                # Patch the content item with new image
                patch_endpoint = f"{endpoint}/{item_id}"
                try:
                    await client.patch(patch_endpoint, json={"featured_image_id": media_id})
                    print(f"    OK (media_id={media_id})")
                    regenerated += 1
                except Exception as e:
                    print(f"    PATCH failed: {e}")
                    failed += 1

                await asyncio.sleep(1)  # Rate limit Kling API

    finally:
        await client.close()

    print(f"\n--- Results ---")
    print(f"Regenerated: {regenerated}")
    print(f"Skipped (exists): {skipped}")
    print(f"Failed: {failed}")


if __name__ == "__main__":
    asyncio.run(main())
