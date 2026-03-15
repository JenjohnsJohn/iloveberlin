"""Webhook/push ingest endpoint — accept content via POST from external sources."""

import hashlib
import hmac
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request

from src.db.engine import async_session
from src.db.models import PipelineItem, DedupLog
from src.db.settings import get_setting
from src.utils.logging import get_logger
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

log = get_logger("api.ingest")

ingest_router = APIRouter(prefix="/api/ingest", tags=["ingest"])

VALID_CONTENT_TYPES = {"article", "event", "restaurant", "guide", "video", "competition"}


async def _verify_api_key(api_key: str | None) -> bool:
    """Verify the ingest API key against the stored value."""
    if not api_key:
        return False
    stored_key = await get_setting("ingest.api_key", "")
    if not stored_key:
        return False
    return hmac.compare_digest(api_key, stored_key)


@ingest_router.post("")
async def ingest_content(request: Request, x_api_key: str | None = Header(default=None)):
    """Accept content via webhook.

    Expected JSON payload:
    {
        "content_type": "article|event|restaurant|guide|video|competition",
        "source_id": "unique-identifier-from-source",
        "source_type": "webhook",
        "data": { ... raw content fields ... },
        "image_url": "https://...",  // optional
        "enriched_data": { ... }     // optional, skip enrichment if provided
    }
    """
    if not await _verify_api_key(x_api_key):
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    content_type = body.get("content_type", "")
    if content_type not in VALID_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content_type. Must be one of: {', '.join(sorted(VALID_CONTENT_TYPES))}",
        )

    source_id = body.get("source_id", "")
    if not source_id:
        raise HTTPException(status_code=400, detail="source_id is required")

    data = body.get("data")
    if not data or not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="data must be a non-empty object")

    source_type = body.get("source_type", "webhook")
    image_url = body.get("image_url")
    enriched_data = body.get("enriched_data")

    fingerprint = hashlib.sha256(f"webhook:{source_id}".encode()).hexdigest()

    async with async_session() as session:
        # Check dedup
        exists = await session.execute(
            select(DedupLog.id).where(
                DedupLog.content_type == content_type,
                DedupLog.fingerprint == fingerprint,
            )
        )
        if exists.scalar_one_or_none():
            return {"status": "duplicate", "message": "Item already exists"}

        # Insert dedup record
        await session.execute(
            pg_insert(DedupLog)
            .values(
                content_type=content_type,
                fingerprint=fingerprint,
                source_id=source_id,
            )
            .on_conflict_do_nothing(index_elements=["content_type", "fingerprint"])
        )

        # Create pipeline item
        raw_data = {**data}
        if image_url:
            raw_data["_image_url"] = image_url

        status = "enriched" if enriched_data else "fetched"
        item = PipelineItem(
            content_type=content_type,
            source_type=source_type,
            source_id=source_id,
            raw_data=raw_data,
            enriched_data=enriched_data,
            status=status,
        )
        session.add(item)
        await session.flush()
        item_id = str(item.id)
        await session.commit()

    log.info(
        "Webhook content ingested",
        content_type=content_type,
        source_id=source_id,
        status=status,
        item_id=item_id,
    )

    return {
        "status": "accepted",
        "item_id": item_id,
        "content_type": content_type,
        "pipeline_status": status,
    }


@ingest_router.post("/batch")
async def ingest_batch(request: Request, x_api_key: str | None = Header(default=None)):
    """Accept multiple content items in a single request.

    Expected JSON payload:
    {
        "items": [
            { "content_type": "...", "source_id": "...", "data": { ... } },
            ...
        ]
    }
    """
    if not await _verify_api_key(x_api_key):
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    items = body.get("items", [])
    if not items or not isinstance(items, list):
        raise HTTPException(status_code=400, detail="items must be a non-empty array")

    results = []
    for entry in items[:100]:  # Cap at 100 items per batch
        content_type = entry.get("content_type", "")
        source_id = entry.get("source_id", "")

        if content_type not in VALID_CONTENT_TYPES or not source_id:
            results.append({"source_id": source_id, "status": "rejected", "reason": "invalid"})
            continue

        data = entry.get("data", {})
        if not data:
            results.append({"source_id": source_id, "status": "rejected", "reason": "empty data"})
            continue

        fingerprint = hashlib.sha256(f"webhook:{source_id}".encode()).hexdigest()

        async with async_session() as session:
            exists = await session.execute(
                select(DedupLog.id).where(
                    DedupLog.content_type == content_type,
                    DedupLog.fingerprint == fingerprint,
                )
            )
            if exists.scalar_one_or_none():
                results.append({"source_id": source_id, "status": "duplicate"})
                continue

            await session.execute(
                pg_insert(DedupLog)
                .values(
                    content_type=content_type,
                    fingerprint=fingerprint,
                    source_id=source_id,
                )
                .on_conflict_do_nothing(index_elements=["content_type", "fingerprint"])
            )

            raw_data = {**data}
            image_url = entry.get("image_url")
            if image_url:
                raw_data["_image_url"] = image_url

            enriched_data = entry.get("enriched_data")
            status = "enriched" if enriched_data else "fetched"

            item = PipelineItem(
                content_type=content_type,
                source_type=entry.get("source_type", "webhook"),
                source_id=source_id,
                raw_data=raw_data,
                enriched_data=enriched_data,
                status=status,
            )
            session.add(item)
            await session.flush()
            results.append({
                "source_id": source_id,
                "status": "accepted",
                "item_id": str(item.id),
            })
            await session.commit()

    log.info("Batch ingest complete", total=len(items), accepted=sum(1 for r in results if r["status"] == "accepted"))
    return {"results": results}
