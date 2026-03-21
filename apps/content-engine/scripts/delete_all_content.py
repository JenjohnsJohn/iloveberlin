"""Delete all existing content from the production I♥Berlin API."""

import asyncio
import httpx
import sys
import time

API = "https://api.iloveberlin.biz/api"
EMAIL = "iamjenjohns@gmail.com"
PASSWORD = "Music72458@Media"

CONTENT_TYPES = [
    ("articles", "articles/admin/list", "articles"),
    ("guides", "guides/admin/list", "guides"),
    ("events", "events/admin/list", "events"),
    ("restaurants", "dining/restaurants/admin/list", "dining/restaurants"),
    ("videos", "videos/admin/list", "videos"),
    ("competitions", "competitions/admin/list", "competitions"),
]


async def main():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login
        resp = await client.post(f"{API}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        resp.raise_for_status()
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Logged in as {resp.json()['user']['role']}")

        for name, list_ep, delete_ep in CONTENT_TYPES:
            print(f"\n--- {name.upper()} ---")

            # Get total count
            r = await client.get(f"{API}/{list_ep}?limit=1", headers=headers)
            if r.status_code == 429:
                print("  Rate limited, waiting 60s...")
                await asyncio.sleep(60)
                r = await client.get(f"{API}/{list_ep}?limit=1", headers=headers)
            data = r.json()
            total = data.get("total", len(data.get("data", data.get("items", []))))
            print(f"  Total: {total}")

            if total == 0:
                print("  Nothing to delete.")
                continue

            deleted = 0
            while True:
                # Fetch a page of IDs
                r = await client.get(f"{API}/{list_ep}?limit=50&page=1", headers=headers)
                if r.status_code == 429:
                    print("  Rate limited, waiting 30s...")
                    await asyncio.sleep(30)
                    continue

                items = r.json().get("data", r.json().get("items", []))
                if not items:
                    break

                # Delete each item with small delay to avoid rate limits
                for item in items:
                    item_id = item["id"]
                    while True:
                        dr = await client.delete(f"{API}/{delete_ep}/{item_id}", headers=headers)
                        if dr.status_code == 429:
                            await asyncio.sleep(5)
                            continue
                        elif dr.status_code in (204, 200):
                            deleted += 1
                            break
                        else:
                            print(f"  Warning: DELETE {item_id} returned {dr.status_code}")
                            break
                    # Small delay between deletes
                    await asyncio.sleep(0.15)

                print(f"  Deleted {deleted} so far...")

                # Re-login if token might expire (every 500 deletes)
                if deleted % 500 == 0 and deleted > 0:
                    resp = await client.post(f"{API}/auth/login", json={"email": EMAIL, "password": PASSWORD})
                    token = resp.json()["access_token"]
                    headers = {"Authorization": f"Bearer {token}"}

            print(f"  DONE: {deleted} {name} deleted")

    print("\n=== All content deleted ===")


if __name__ == "__main__":
    asyncio.run(main())
