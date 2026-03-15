"""
Backfill script: re-fetch published restaurants from Google Places to fill
missing ratings, cuisines, opening_hours, and price_range.

Usage:
    cd apps/content-engine
    python -m scripts.backfill_restaurants [--dry-run] [--limit N]
"""

import argparse
import asyncio
import sys

import httpx

from config.settings import settings
from src.api_client.client import APIClient
from src.sources.google_places import (
    CUISINE_TYPE_SUFFIX,
    FIELD_MASK,
    GOOGLE_PRICE_TO_PRICE_RANGE,
    SEARCH_URL,
    get_photo_by_resource_name,
)
from src.api_client.media import upload_image


async def fetch_restaurants(api_client: APIClient, limit: int = 100) -> list[dict]:
    """Fetch all published restaurants from the API."""
    all_restaurants = []
    page = 1
    while True:
        resp = await api_client.get(
            f"/dining/restaurants?page={page}&limit=50"
        )
        data = resp.json()
        items = data.get("data", data) if isinstance(data, dict) else data
        if not items:
            break
        all_restaurants.extend(items if isinstance(items, list) else [items])
        if len(all_restaurants) >= limit:
            break
        # Check if there are more pages
        total = data.get("total", 0) if isinstance(data, dict) else 0
        if page * 50 >= total:
            break
        page += 1
    return all_restaurants[:limit]


async def search_google_places(name: str, address: str) -> dict | None:
    """Search Google Places for a restaurant by name + address."""
    if not settings.google_places_api_key:
        print("ERROR: google_places_api_key not configured")
        return None

    query = f"{name}, {address}"
    body = {"textQuery": query, "pageSize": 1}

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            SEARCH_URL,
            json=body,
            headers={
                "X-Goog-Api-Key": settings.google_places_api_key,
                "X-Goog-FieldMask": FIELD_MASK,
            },
        )
        resp.raise_for_status()

    places = resp.json().get("places", [])
    return places[0] if places else None


def extract_patch_data(place: dict) -> dict:
    """Extract PATCH-able fields from a Google Places result."""
    patch = {}

    # Rating
    rating = place.get("rating")
    if rating is not None:
        patch["rating"] = round(rating, 1)

    # Price range
    price_level = place.get("priceLevel", "")
    price_range = GOOGLE_PRICE_TO_PRICE_RANGE.get(price_level)
    if price_range:
        patch["price_range"] = price_range

    # Opening hours
    reg_hours = place.get("regularOpeningHours", {})
    opening_hours = {}
    for desc in reg_hours.get("weekdayDescriptions", []):
        parts = desc.split(": ", 1)
        if len(parts) == 2:
            opening_hours[parts[0]] = parts[1]
    if opening_hours:
        patch["opening_hours"] = opening_hours

    # Google Place ID
    place_id = place.get("id")
    if place_id:
        patch["google_place_id"] = place_id

    # Coordinates
    location = place.get("location", {})
    if location.get("latitude"):
        patch["latitude"] = location["latitude"]
    if location.get("longitude"):
        patch["longitude"] = location["longitude"]

    # Phone
    phone = place.get("internationalPhoneNumber")
    if phone:
        patch["phone"] = phone

    # Website
    website = place.get("websiteUri")
    if website:
        patch["website"] = website

    return patch


def extract_cuisines(place: dict) -> list[str]:
    """Extract cuisine names from Google Places types."""
    cuisines = []
    for ptype in place.get("types", []):
        if ptype.endswith(CUISINE_TYPE_SUFFIX):
            cuisine_name = ptype[: -len(CUISINE_TYPE_SUFFIX)].replace("_", " ").title()
            cuisines.append(cuisine_name)
    return cuisines


async def main():
    parser = argparse.ArgumentParser(description="Backfill restaurant data from Google Places")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without applying")
    parser.add_argument("--limit", type=int, default=200, help="Max restaurants to process")
    args = parser.parse_args()

    print(f"--- Restaurant Backfill Script ---")
    print(f"Dry run: {args.dry_run}")
    print(f"Limit: {args.limit}")
    print()

    client = APIClient()
    try:
        # Fetch published restaurants
        print("Fetching published restaurants from API...")
        restaurants = await fetch_restaurants(client, limit=args.limit)
        print(f"Found {len(restaurants)} published restaurants")

        updated = 0
        skipped = 0
        failed = 0

        for i, rest in enumerate(restaurants):
            name = rest.get("name", "")
            address = rest.get("address", "")
            rid = rest.get("id", "")
            rating = rest.get("rating")
            cuisines = rest.get("cuisines", [])
            opening_hours = rest.get("opening_hours", {})

            # Check if already has data
            has_rating = rating is not None and rating > 0
            has_cuisines = len(cuisines) > 0
            has_hours = bool(opening_hours)

            if has_rating and has_cuisines and has_hours:
                skipped += 1
                continue

            print(f"[{i+1}/{len(restaurants)}] {name}")
            print(f"  Missing: {'rating ' if not has_rating else ''}{'cuisines ' if not has_cuisines else ''}{'hours' if not has_hours else ''}")

            # Search Google Places
            try:
                place = await search_google_places(name, address)
            except Exception as e:
                print(f"  ERROR searching Google Places: {e}")
                failed += 1
                continue

            if not place:
                print(f"  NOT FOUND on Google Places")
                failed += 1
                continue

            # Build patch
            patch = extract_patch_data(place)
            # Only include fields that are currently missing
            if has_rating:
                patch.pop("rating", None)
            if has_hours:
                patch.pop("opening_hours", None)

            if not patch:
                print(f"  No new data to update")
                skipped += 1
                continue

            # Handle photo if restaurant has no featured image
            featured_image = rest.get("featured_image")
            if not featured_image:
                photos = place.get("photos", [])
                if photos:
                    photo_resource = photos[0].get("name")
                    if photo_resource:
                        print(f"  Fetching Google Places photo...")
                        photo_result = await get_photo_by_resource_name(photo_resource)
                        if photo_result:
                            image_bytes, content_type = photo_result
                            ext = content_type.split("/")[-1]
                            filename = f"backfill-{rid}.{ext}"
                            media_id = await upload_image(client, image_bytes, filename, content_type)
                            if media_id:
                                patch["featured_image_id"] = media_id
                                print(f"  Uploaded photo: {media_id}")

            print(f"  Patch: {', '.join(f'{k}={v!r:.60}' for k, v in patch.items())}")

            if not args.dry_run:
                try:
                    await client.patch(f"/dining/restaurants/{rid}", json=patch)
                    print(f"  UPDATED")
                    updated += 1
                except Exception as e:
                    print(f"  ERROR updating: {e}")
                    failed += 1
            else:
                print(f"  [DRY RUN] Would update")
                updated += 1

            # Brief pause to respect rate limits
            await asyncio.sleep(0.5)

        print()
        print(f"--- Results ---")
        print(f"Total: {len(restaurants)}")
        print(f"Updated: {updated}")
        print(f"Skipped (already complete): {skipped}")
        print(f"Failed: {failed}")

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
