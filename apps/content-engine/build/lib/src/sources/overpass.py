import hashlib

import httpx

from src.sources.base import RawItem, Source
from src.utils.logging import get_logger

log = get_logger("sources.overpass")

OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"

# Query Berlin restaurants with useful tags
OVERPASS_QUERY = """
[out:json][timeout:60];
area["name"="Berlin"]["admin_level"="4"]->.berlin;
(
  node["amenity"="restaurant"](area.berlin);
  way["amenity"="restaurant"](area.berlin);
);
out center {batch_size};
"""


class OverpassSource(Source):
    source_type = "overpass"

    def __init__(self, endpoint: str = OVERPASS_ENDPOINT, batch_size: int = 20):
        self.endpoint = endpoint
        self.batch_size = batch_size

    async def fetch(self) -> list[RawItem]:
        query = OVERPASS_QUERY.replace("{batch_size}", str(self.batch_size))
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(
                    self.endpoint, data={"data": query}
                )
                resp.raise_for_status()
                data = resp.json()
        except Exception as e:
            log.error("Overpass API failed", error=str(e))
            return []

        items = []
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            osm_id = f"{element['type']}/{element['id']}"
            source_id = hashlib.sha256(f"osm:{osm_id}".encode()).hexdigest()

            lat = element.get("lat") or element.get("center", {}).get("lat")
            lon = element.get("lon") or element.get("center", {}).get("lon")

            # Build address from OSM tags
            addr_parts = []
            for key in ["addr:street", "addr:housenumber"]:
                if tags.get(key):
                    addr_parts.append(tags[key])
            postcode = tags.get("addr:postcode", "")
            city = tags.get("addr:city", "Berlin")
            if addr_parts:
                address = f"{' '.join(addr_parts)}, {postcode} {city}".strip()
            else:
                address = f"Berlin, Germany"

            # Extract cuisine
            cuisine_raw = tags.get("cuisine", "")
            cuisines = [c.strip() for c in cuisine_raw.split(";") if c.strip()]

            # Opening hours
            opening_hours_raw = tags.get("opening_hours", "")

            items.append(
                RawItem(
                    source_type="overpass",
                    source_id=source_id,
                    content_type="restaurant",
                    data={
                        "osm_id": osm_id,
                        "name": name,
                        "address": address,
                        "district": tags.get("addr:suburb", ""),
                        "latitude": lat,
                        "longitude": lon,
                        "phone": tags.get("phone", "") or tags.get("contact:phone", ""),
                        "website": tags.get("website", "") or tags.get("contact:website", ""),
                        "email": tags.get("email", "") or tags.get("contact:email", ""),
                        "cuisines": cuisines,
                        "opening_hours_raw": opening_hours_raw,
                    },
                )
            )

        log.info("Overpass restaurants fetched", count=len(items))
        return items
