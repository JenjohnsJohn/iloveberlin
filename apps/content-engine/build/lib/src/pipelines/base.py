"""Abstract pipeline: fetch → dedup → store → enrich → push to API."""

import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from src.api_client.client import APIClient
from src.api_client.content import CONTENT_CREATORS, CONTENT_ENDPOINTS
from src.api_client.media import download_image, upload_image
from src.db.engine import async_session
from src.db.models import DedupLog, EngineSetting, PipelineItem, PushLog
from src.sources.base import RawItem
from src.utils.logging import get_logger

log = get_logger("pipelines.base")

MAX_PUSH_ATTEMPTS = 3


async def is_auto_push_enabled() -> bool:
    """Check if auto-push to API is enabled."""
    async with async_session() as session:
        result = await session.execute(
            select(EngineSetting.value).where(EngineSetting.key == "auto_push_enabled")
        )
        val = result.scalar_one_or_none()
        if val is None:
            return True  # Default: enabled
        return val.lower() in ("true", "1", "yes")


class BasePipeline(ABC):
    """Base pipeline for all content types."""

    content_type: str
    auto_publish: bool = False

    def __init__(self, api_client: APIClient):
        self.api_client = api_client

    async def run(self):
        """Execute the full pipeline: fetch → dedup → store → enrich → push."""
        pipeline_name = f"{self.content_type} pipeline"
        log.info("Pipeline started", pipeline=pipeline_name)

        try:
            # Step 1: Fetch raw items
            raw_items = await self.fetch()
            log.info("Fetched raw items", pipeline=pipeline_name, count=len(raw_items))

            if not raw_items:
                log.info("No items to process", pipeline=pipeline_name)
                return

            # Step 2: Dedup + store
            new_items = await self._dedup_and_store(raw_items)
            log.info("New items after dedup", pipeline=pipeline_name, count=len(new_items))

            # Step 3: Enrich with AI
            enriched_count = 0
            for item_id in new_items:
                try:
                    await self._enrich_item(item_id)
                    enriched_count += 1
                except Exception as e:
                    log.error(
                        "Enrichment failed",
                        pipeline=pipeline_name,
                        item_id=str(item_id),
                        error=str(e),
                    )
            log.info("Items enriched", pipeline=pipeline_name, count=enriched_count)

            # Step 4: Push enriched items to API (if auto-push enabled)
            pushed_count = 0
            push_enabled = await is_auto_push_enabled()
            if not push_enabled:
                log.info(
                    "Auto-push disabled, skipping push step",
                    pipeline=pipeline_name,
                    enriched=enriched_count,
                )
            else:
                for item_id in new_items:
                    try:
                        success = await self._push_item(item_id)
                        if success:
                            pushed_count += 1
                    except Exception as e:
                        log.error(
                            "Push failed",
                            pipeline=pipeline_name,
                            item_id=str(item_id),
                            error=str(e),
                        )

            log.info(
                "Pipeline complete",
                pipeline=pipeline_name,
                fetched=len(raw_items),
                new=len(new_items),
                enriched=enriched_count,
                pushed=pushed_count,
            )

        except Exception as e:
            log.error("Pipeline failed", pipeline=pipeline_name, error=str(e))

    @abstractmethod
    async def fetch(self) -> list[RawItem]:
        """Fetch raw items from source(s)."""
        ...

    @abstractmethod
    async def enrich(self, raw_data: dict) -> dict:
        """Enrich raw data with AI. Return API-ready payload."""
        ...

    def build_api_payload(self, enriched: dict, media_id: str | None = None) -> dict:
        """Build the final API payload from enriched data. Override per pipeline."""
        return enriched

    async def _dedup_and_store(self, raw_items: list[RawItem]) -> list[uuid.UUID]:
        """Check dedup, store new items. Returns list of new pipeline_item IDs."""
        new_ids: list[uuid.UUID] = []

        async with async_session() as session:
            for item in raw_items:
                # Check dedup
                exists = await session.execute(
                    select(DedupLog.id).where(
                        DedupLog.content_type == item.content_type,
                        DedupLog.fingerprint == item.source_id,
                    )
                )
                if exists.scalar_one_or_none():
                    continue

                # Insert dedup record
                await session.execute(
                    pg_insert(DedupLog)
                    .values(
                        content_type=item.content_type,
                        fingerprint=item.source_id,
                        source_id=item.source_id,
                    )
                    .on_conflict_do_nothing(
                        index_elements=["content_type", "fingerprint"]
                    )
                )

                # Store pipeline item
                pi = PipelineItem(
                    content_type=item.content_type,
                    source_type=item.source_type,
                    source_id=item.source_id,
                    raw_data={**item.data, "_image_url": item.image_url},
                    status="fetched",
                )
                session.add(pi)
                await session.flush()
                new_ids.append(pi.id)

            await session.commit()

        return new_ids

    async def _enrich_item(self, item_id: uuid.UUID):
        """Run AI enrichment on a single pipeline item."""
        async with async_session() as session:
            item = await session.get(PipelineItem, item_id)
            if not item or item.status != "fetched":
                return

            enriched = await self.enrich(item.raw_data)
            item.enriched_data = enriched
            item.status = "enriched"
            item.updated_at = datetime.now(timezone.utc)
            await session.commit()

    async def _push_item(self, item_id: uuid.UUID) -> bool:
        """Push an enriched item to the API."""
        async with async_session() as session:
            item = await session.get(PipelineItem, item_id)
            if not item or item.status not in ("enriched", "failed"):
                return False
            if item.push_attempts >= MAX_PUSH_ATTEMPTS:
                return False

            enriched = item.enriched_data
            if not enriched:
                return False

            # Handle image upload if present
            media_id = None
            image_url = item.raw_data.get("_image_url")
            if image_url:
                result = await download_image(image_url)
                if result:
                    image_bytes, content_type = result
                    ext = content_type.split("/")[-1]
                    filename = f"content-engine-{item.id}.{ext}"
                    media_id = await upload_image(
                        self.api_client, image_bytes, filename, content_type
                    )

            # Build and send payload
            payload = self.build_api_payload(enriched, media_id)

            # Set status based on auto_publish
            if self.auto_publish:
                payload.setdefault("status", "published")
            else:
                payload.setdefault("status", "draft")

            creator = CONTENT_CREATORS.get(self.content_type)
            endpoint = CONTENT_ENDPOINTS.get(self.content_type, "")

            try:
                item.push_attempts += 1
                result = await creator(self.api_client, payload)
                api_id = result.get("id", "")

                item.status = "pushed"
                item.updated_at = datetime.now(timezone.utc)

                push_log = PushLog(
                    pipeline_item_id=item.id,
                    content_type=self.content_type,
                    api_entity_id=str(api_id),
                    api_endpoint=endpoint,
                    status_code=200,
                )
                session.add(push_log)
                await session.commit()
                return True

            except Exception as e:
                item.status = "failed"
                item.error_message = str(e)[:1000]
                item.updated_at = datetime.now(timezone.utc)
                await session.commit()
                log.error(
                    "Push failed",
                    content_type=self.content_type,
                    item_id=str(item.id),
                    error=str(e),
                )
                return False


async def retry_failed_pushes(api_client: APIClient):
    """Retry all failed pushes that haven't exceeded max attempts."""
    push_enabled = await is_auto_push_enabled()
    if not push_enabled:
        log.info("Auto-push disabled, skipping retry")
        return

    async with async_session() as session:
        result = await session.execute(
            select(PipelineItem).where(
                PipelineItem.status == "failed",
                PipelineItem.push_attempts < MAX_PUSH_ATTEMPTS,
                PipelineItem.enriched_data.isnot(None),
            )
        )
        failed_items = result.scalars().all()

    if not failed_items:
        return

    log.info("Retrying failed pushes", count=len(failed_items))
    from src.pipelines import get_pipeline

    for item in failed_items:
        pipeline = get_pipeline(item.content_type, api_client)
        if pipeline:
            await pipeline._push_item(item.id)
