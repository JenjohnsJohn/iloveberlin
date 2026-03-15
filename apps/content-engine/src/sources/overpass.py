import hashlib

import httpx

from src.sources.base import RawItem, Source
from src.utils.logging import get_logger

log = get_logger("sources.overpass")

OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"

# Phase 4.5: Berlin boroughs for rotation
BERLIN_BOROUGHS = [
    "Mitte",
    "Friedrichshain-Kreuzberg",
    "Pankow",
    "Charlottenburg-Wilmersdorf",
    "Spandau",
    "Steglitz-Zehlendorf",
    "Tempelhof-Schöneberg",
    "Neukölln",
    "Treptow-Köpenick",
    "Marzahn-Hellersdorf",
    "Lichtenberg",
    "Reinickendorf",
]

# Query Berlin restaurants filtered by borough (Phase 4.5)
OVERPASS_QUERY_BOROUGH = """
[out:json][timeout:60];
area["name"="Berlin"]["admin_level"="4"]->.berlin;
area["name"="{borough}"]["admin_level"="9"](area.berlin)->.borough;
(
  node["amenity"="restaurant"](area.borough);
  way["amenity"="restaurant"](area.borough);
);
out center {batch_size};
"""

# Fallback: query all of Berlin
OVERPASS_QUERY_ALL = """
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

    def __init__(
        self,
        endpoint: str = OVERPASS_ENDPOINT,
        batch_size: int = 20,
        borough: str | None = None,
    ):
        self.endpoint = endpoint
        self.batch_size = batch_size
        self.borough = borough

    async def fetch(self) -> list[RawItem]:
        if self.borough:
            query = OVERPASS_QUERY_BOROUGH.replace("{borough}", self.borough)
            query = query.replace("{batch_size}", str(self.batch_size))
        else:
            query = OVERPASS_QUERY_ALL.replace("{batch_size}", str(self.batch_size))

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
                address = "Berlin, Germany"

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
                        "district": tags.get("addr:suburb", self.borough or ""),
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

        log.info(
            "Overpass restaurants fetched",
            count=len(items),
            borough=self.borough or "all",
        )
        return items
