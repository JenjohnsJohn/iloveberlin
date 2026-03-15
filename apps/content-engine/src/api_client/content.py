"""Content creation endpoints — one method per content type."""

from src.api_client.client import APIClient
from src.utils.logging import get_logger

log = get_logger("api_client.content")


async def create_article(client: APIClient, data: dict) -> dict:
    resp = await client.post("/articles", json=data)
    result = resp.json()
    log.info("Article created", id=result.get("id"), title=data.get("title", "")[:60])
    return result


async def create_event(client: APIClient, data: dict) -> dict:
    resp = await client.post("/events", json=data)
    result = resp.json()
    log.info("Event created", id=result.get("id"), title=data.get("title", "")[:60])
    return result


async def create_restaurant(client: APIClient, data: dict) -> dict:
    resp = await client.post("/dining/restaurants", json=data)
    result = resp.json()
    log.info("Restaurant created", id=result.get("id"), name=data.get("name", "")[:60])
    return result


async def create_guide(client: APIClient, data: dict) -> dict:
    resp = await client.post("/guides", json=data)
    result = resp.json()
    log.info("Guide created", id=result.get("id"), title=data.get("title", "")[:60])
    return result


async def create_video(client: APIClient, data: dict) -> dict:
    resp = await client.post("/videos", json=data)
    result = resp.json()
    log.info("Video created", id=result.get("id"), title=data.get("title", "")[:60])
    return result


async def create_competition(client: APIClient, data: dict) -> dict:
    resp = await client.post("/competitions", json=data)
    result = resp.json()
    log.info("Competition created", id=result.get("id"), title=data.get("title", "")[:60])
    return result


# Map content_type string → creator function
CONTENT_CREATORS = {
    "article": create_article,
    "event": create_event,
    "restaurant": create_restaurant,
    "guide": create_guide,
    "video": create_video,
    "competition": create_competition,
}

# Map content_type string → API endpoint (for push_log)
CONTENT_ENDPOINTS = {
    "article": "/articles",
    "event": "/events",
    "restaurant": "/dining/restaurants",
    "guide": "/guides",
    "video": "/videos",
    "competition": "/competitions",
}
