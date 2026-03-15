"""
Backfill script: assign categories to published articles that have category=null.

Uses keyword matching on title+body to determine the best category.

Usage:
    cd apps/content-engine
    python -m scripts.backfill_article_categories [--dry-run] [--limit N]
"""

import argparse
import asyncio

from src.api_client.client import APIClient

# Category slug -> keyword mappings (same as in articles.py pipeline)
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "city-politics": ["politics", "government", "mayor", "senate", "election", "policy", "law", "regulation", "council", "parliament", "protest", "demonstration", "political", "coalition"],
    "business-economy": ["business", "economy", "startup", "company", "investment", "market", "trade", "finance", "economic", "industry", "tech", "commerce"],
    "culture": ["art", "museum", "gallery", "theater", "film", "cinema", "music", "concert", "festival", "exhibition", "literary", "opera", "dance", "performance", "reading", "book"],
    "community": ["community", "neighborhood", "volunteer", "charity", "social", "integration", "refugee", "expat", "immigrant", "solidarity", "diversity", "fleeing", "war"],
    "sports": ["sport", "football", "soccer", "marathon", "athletic", "olympic", "hertha", "union berlin", "basketball", "cycling", "fitness", "athlete"],
    "education": ["education", "university", "school", "student", "research", "academic", "erasmus", "scholarship", "study", "campus", "exchange"],
    "health": ["health", "hospital", "medical", "wellness", "mental health", "pandemic", "vaccine", "healthcare", "doctor", "clinic"],
    "environment": ["environment", "climate", "sustainability", "green", "energy", "recycling", "pollution", "park", "nature", "ecological"],
    "lifestyle": ["lifestyle", "food", "restaurant", "fashion", "shopping", "nightlife", "club", "bar", "cafe", "dating", "living"],
    "travel-tourism": ["travel", "tourism", "tourist", "hotel", "sightseeing", "day trip", "guide", "visit", "landmark", "attraction", "commuter", "highway", "crash"],
}


def assign_category_slug(title: str, body: str) -> str:
    """Assign a category slug based on keyword matching."""
    text = f"{title} {body}".lower()
    scores: dict[str, int] = {}
    for slug, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[slug] = score
    if not scores:
        return "lifestyle"
    return max(scores, key=scores.get)


async def main():
    parser = argparse.ArgumentParser(description="Backfill article categories")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without applying")
    parser.add_argument("--limit", type=int, default=200, help="Max articles to process")
    args = parser.parse_args()

    print("--- Article Category Backfill ---")
    print(f"Dry run: {args.dry_run}")
    print()

    client = APIClient()
    try:
        # Fetch categories to build slug->ID map
        resp = await client.get("/categories/tree?type=article")
        categories = resp.json()
        if isinstance(categories, dict):
            categories = categories.get("data", categories)

        cat_map: dict[str, str] = {}
        for cat in (categories if isinstance(categories, list) else []):
            cat_map[cat.get("slug", "")] = cat.get("id", "")
            for child in cat.get("children", []):
                cat_map[child.get("slug", "")] = child.get("id", "")

        print(f"Loaded {len(cat_map)} categories")

        # Fetch published articles
        all_articles = []
        page = 1
        while True:
            resp = await client.get(f"/articles?page={page}&limit=50&status=published")
            data = resp.json()
            items = data.get("data", data) if isinstance(data, dict) else data
            if not items:
                break
            all_articles.extend(items if isinstance(items, list) else [items])
            total = data.get("total", 0) if isinstance(data, dict) else 0
            if page * 50 >= total:
                break
            page += 1

        print(f"Found {len(all_articles)} published articles")

        updated = 0
        skipped = 0

        for i, article in enumerate(all_articles[:args.limit]):
            aid = article.get("id", "")
            title = article.get("title", "")
            body = article.get("body", "")[:500]  # Use first 500 chars for matching
            category = article.get("category")

            if category is not None:
                skipped += 1
                continue

            slug = assign_category_slug(title, body)
            cat_id = cat_map.get(slug)

            if not cat_id:
                print(f"  [{i+1}] {title[:60]} -> {slug} (NO ID FOUND)")
                continue

            print(f"  [{i+1}] {title[:60]} -> {slug}")

            if not args.dry_run:
                try:
                    await client.patch(f"/articles/{aid}", json={"category_id": cat_id})
                    updated += 1
                except Exception as e:
                    print(f"    ERROR: {e}")
            else:
                updated += 1

            await asyncio.sleep(0.2)

        print()
        print(f"--- Results ---")
        print(f"Total: {len(all_articles)}")
        print(f"Updated: {updated}")
        print(f"Skipped (already has category): {skipped}")

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
