"""Abstract pipeline: fetch -> dedup -> store -> enrich -> push to API."""

import asyncio
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from src.api_client.client import APIClient
from src.api_client.content import CONTENT_CREATORS, CONTENT_ENDPOINTS
from src.api_client.media import download_image, upload_image
from src.db.engine import async_session
from src.db.models import DedupLog, PipelineItem, PipelineRun, PushLog
from src.db.settings import get_bool_setting, get_int_setting, get_setting
from src.sources.base import RawItem
from src.pipelines.schemas import validate_enriched_data
from src.utils.locks import get_pipeline_lock
from src.utils.logging import get_logger
from src.utils.notifications import notify_pipeline_failure, notify_zero_items

log = get_logger("pipelines.base")

# Phase 1.4: defaults for retry behaviour (now configurable via DB settings)
DEFAULT_RETRY_BASE_DELAY = 300  # 5 minutes
DEFAULT_PERMANENT_FAILURE_CODES = {400, 401, 403, 404, 405, 409, 422}

# Keep module-level aliases so existing imports (e.g. tests) still work.
RETRY_BASE_DELAY = DEFAULT_RETRY_BASE_DELAY
PERMANENT_FAILURE_CODES = DEFAULT_PERMANENT_FAILURE_CODES


async def _get_retry_base_delay() -> int:
    """Read retry base delay from DB setting, falling back to default."""
    return await get_int_setting("retry.base_delay_seconds", DEFAULT_RETRY_BASE_DELAY)


async def _get_permanent_failure_codes() -> set[int]:
    """Read permanent failure codes from DB setting, falling back to default.

    DB value format: comma-separated integers, e.g. "400,401,403,404,405,409,422".
    """
    default_csv = ",".join(str(c) for c in sorted(DEFAULT_PERMANENT_FAILURE_CODES))
    raw = await get_setting("retry.permanent_failure_codes", default_csv)
    try:
        return {int(c.strip()) for c in raw.split(",") if c.strip()}
    except (ValueError, TypeError):
        return DEFAULT_PERMANENT_FAILURE_CODES


# Kept as a thin alias for backward compatibility; delegates to shared utility.
def _get_pipeline_lock(pipeline_key: str) -> asyncio.Lock:
    return get_pipeline_lock(pipeline_key)


def _extract_status_code(error: Exception) -> int | None:
    """Try to extract HTTP status code from an httpx exception."""
    import httpx
    if isinstance(error, httpx.HTTPStatusError):
        return error.response.status_code
    error_str = str(error)
    # Try to find status code pattern in error message
    import re
    match = re.search(r'\b([45]\d{2})\b', error_str)
    if match:
        return int(match.group(1))
    return None


def _extract_response_body(error: Exception) -> str | None:
    """Try to extract response body from httpx exception."""
    import httpx
    if isinstance(error, httpx.HTTPStatusError):
        try:
            return error.response.text[:2000]
        except Exception:
            pass
    return None


async def is_auto_push_enabled() -> bool:
    """Check if auto-push to API is enabled."""
    return await get_bool_setting("auto_push_enabled", True)


class BasePipeline(ABC):
    """Base pipeline for all content types."""

    content_type: str
    auto_publish: bool = False

    def __init__(self, api_client: APIClient):
        self.api_client = api_client

    async def run(self, dry_run: bool = False):
        """Execute the full pipeline: fetch -> dedup -> store -> enrich -> push.

        Args:
            dry_run: If True, skip the push step entirely (Phase 3.3).
        """
        pipeline_name = f"{self.content_type} pipeline"
        log.info("Pipeline started", pipeline=pipeline_name, dry_run=dry_run)

        # Phase 2.1: record pipeline run
        run_record = PipelineRun(pipeline_name=pipeline_name, status="running")
        async with async_session() as session:
            session.add(run_record)
            await session.commit()
            run_id = run_record.id

        try:
            # Step 1: Fetch raw items
            raw_items = await self.fetch()
            log.info("Fetched raw items", pipeline=pipeline_name, count=len(raw_items))

            async with async_session() as session:
                run = await session.get(PipelineRun, run_id)
                if run:
                    run.items_fetched = len(raw_items)
                    await session.commit()

            if not raw_items:
                log.info("No items to process", pipeline=pipeline_name)
                await self._finish_run(run_id, "success", 0, 0, 0, 0)
                # Phase 5.7: alert on zero items
                try:
                    await notify_zero_items(pipeline_name)
                except Exception as e:
                    log.error("Failed to send zero-items notification", pipeline=pipeline_name, error=str(e))
                return

            # Step 2: Dedup + store
            new_items = await self._dedup_and_store(raw_items)
            log.info("New items after dedup", pipeline=pipeline_name, count=len(new_items))

            # Step 3: Enrich with AI
            # Reset failed enrichment items (failed + no enriched_data) back to "fetched"
            # so they can be retried in this run
            async with async_session() as session:
                result = await session.execute(
                    select(PipelineItem)
                    .where(
                        PipelineItem.content_type == self.content_type,
                        PipelineItem.status == "failed",
                        PipelineItem.enriched_data.is_(None),
                    )
                )
                stale_items = result.scalars().all()
                for stale in stale_items:
                    stale.status = "fetched"
                    stale.error_message = None
                    stale.updated_at = datetime.now(timezone.utc)
                if stale_items:
                    await session.commit()
                    log.info(
                        "Reset failed enrichment items for retry",
                        pipeline=pipeline_name,
                        count=len(stale_items),
                    )

            # Include both new items AND orphaned "fetched" items from previous runs
            enrich_batch_limit = await get_int_setting("enrich_batch_limit", 20)
            pending_ids = list(new_items)

            # Pick up orphaned "fetched" items not in current batch
            async with async_session() as session:
                remaining_slots = max(0, enrich_batch_limit - len(pending_ids))
                if remaining_slots > 0:
                    result = await session.execute(
                        select(PipelineItem.id)
                        .where(
                            PipelineItem.content_type == self.content_type,
                            PipelineItem.status == "fetched",
                            PipelineItem.enriched_data.is_(None),
                            *([PipelineItem.id.notin_(pending_ids)] if pending_ids else []),
                        )
                        .order_by(PipelineItem.created_at)
                        .limit(remaining_slots)
                    )
                    backlog_ids = [row[0] for row in result.all()]
                    if backlog_ids:
                        log.info(
                            "Picking up backlog items for enrichment",
                            pipeline=pipeline_name,
                            count=len(backlog_ids),
                        )
                        pending_ids.extend(backlog_ids)

            enriched_count = 0
            for item_id in pending_ids:
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
                    # Phase 1.3: store error on the item
                    async with async_session() as session:
                        item = await session.get(PipelineItem, item_id)
                        if item:
                            item.error_message = f"Enrichment error: {str(e)[:1000]}"
                            item.status = "failed"
                            item.updated_at = datetime.now(timezone.utc)
                            await session.commit()

            # Count AI vs fallback enrichment methods
            ai_enriched = 0
            fallback_enriched = 0
            async with async_session() as session:
                for item_id in pending_ids:
                    item = await session.get(PipelineItem, item_id)
                    if item and item.enriched_data:
                        method = item.enriched_data.get("_enrichment_method", "ai")
                        if method == "fallback":
                            fallback_enriched += 1
                        else:
                            ai_enriched += 1
            log.info(
                "Items enriched",
                pipeline=pipeline_name,
                count=enriched_count,
                ai=ai_enriched,
                fallback=fallback_enriched,
            )

            # Step 4: Push enriched items to API (if auto-push enabled and not dry run)
            pushed_count = 0
            if dry_run:
                log.info(
                    "Dry run — skipping push step",
                    pipeline=pipeline_name,
                    enriched=enriched_count,
                )
            else:
                push_enabled = await is_auto_push_enabled()
                if not push_enabled:
                    log.info(
                        "Auto-push disabled, skipping push step",
                        pipeline=pipeline_name,
                        enriched=enriched_count,
                    )
                else:
                    # Push items from current batch + any orphaned "enriched" items
                    push_ids = list(pending_ids)
                    async with async_session() as session:
                        result = await session.execute(
                            select(PipelineItem.id)
                            .where(
                                PipelineItem.content_type == self.content_type,
                                PipelineItem.status == "enriched",
                                PipelineItem.enriched_data.isnot(None),
                                *([PipelineItem.id.notin_(push_ids)] if push_ids else []),
                            )
                            .order_by(PipelineItem.created_at)
                            .limit(enrich_batch_limit)
                        )
                        backlog_push_ids = [row[0] for row in result.all()]
                        if backlog_push_ids:
                            log.info(
                                "Picking up backlog items for push",
                                pipeline=pipeline_name,
                                count=len(backlog_push_ids),
                            )
                            push_ids.extend(backlog_push_ids)

                    for item_id in push_ids:
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
            await self._finish_run(
                run_id, "success",
                len(raw_items), len(new_items), enriched_count, pushed_count,
            )

        except Exception as e:
            log.error("Pipeline failed", pipeline=pipeline_name, error=str(e))
            await self._finish_run(run_id, "failed", error_message=str(e)[:1000])
            # Phase 5.7: alert on pipeline failure
            try:
                await notify_pipeline_failure(pipeline_name, str(e))
            except Exception as notify_err:
                log.error("Failed to send pipeline-failure notification", pipeline=pipeline_name, error=str(notify_err))

    async def _finish_run(
        self,
        run_id: uuid.UUID,
        status: str,
        items_fetched: int = 0,
        items_new: int = 0,
        items_enriched: int = 0,
        items_pushed: int = 0,
        error_message: str | None = None,
    ):
        """Update the pipeline run record with final stats."""
        async with async_session() as session:
            run = await session.get(PipelineRun, run_id)
            if run:
                run.status = status
                run.finished_at = datetime.now(timezone.utc)
                run.items_fetched = items_fetched
                run.items_new = items_new
                run.items_enriched = items_enriched
                run.items_pushed = items_pushed
                run.error_message = error_message
                await session.commit()

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
        """Atomic dedup+store using INSERT ... ON CONFLICT. Returns new pipeline_item IDs.

        Note: a related but distinct dedup implementation exists in the webhook
        ingest endpoint (``src.api_client.ingest``). That version uses SHA-256
        fingerprinting and a SELECT-first check (for early HTTP 200 response),
        whereas this one relies solely on the atomic ON CONFLICT clause.
        """
        new_ids: list[uuid.UUID] = []

        async with async_session() as session:
            for item in raw_items:
                # Atomic insert — ON CONFLICT DO NOTHING returns 0 rows if duplicate
                result = await session.execute(
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

                if result.rowcount == 0:
                    # Already existed — skip
                    continue

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

            # enrich() returning None means the item should be skipped (e.g. not Berlin-related)
            if enriched is None:
                item.status = "skipped"
                item.updated_at = datetime.now(timezone.utc)
                await session.commit()
                return

            # Validate enriched data against schema
            validation_error = validate_enriched_data(self.content_type, enriched)
            if validation_error:
                item.status = "failed"
                item.error_message = f"Enriched data validation failed: {validation_error}"
                item.updated_at = datetime.now(timezone.utc)
                await session.commit()
                log.warning(
                    "Enriched data validation failed",
                    item_id=str(item_id),
                    error=validation_error[:200],
                )
                return

            item.enriched_data = enriched
            item.status = "enriched"
            item.updated_at = datetime.now(timezone.utc)
            await session.commit()

    async def _push_item(self, item_id: uuid.UUID) -> bool:
        """Push an enriched item to the API with failure classification."""
        max_attempts = await get_int_setting("max_push_attempts", 3)
        retry_base_delay = await _get_retry_base_delay()
        permanent_codes = await _get_permanent_failure_codes()
        async with async_session() as session:
            item = await session.get(PipelineItem, item_id)
            if not item or item.status not in ("enriched", "failed"):
                return False
            if item.status == "permanently_failed":
                return False
            if item.push_attempts >= max_attempts:
                return False

            enriched = item.enriched_data
            if not enriched:
                return False

            # Handle image upload if present
            media_id = None
            image_url = item.raw_data.get("_image_url")

            # 1. Try source image URL
            if image_url:
                result = await download_image(image_url)
                if result:
                    image_bytes, content_type = result
                    ext = content_type.split("/")[-1]
                    filename = f"content-engine-{item.id}.{ext}"
                    media_id = await upload_image(
                        self.api_client, image_bytes, filename, content_type
                    )

            # 2. Try Google Places photo (restaurants only)
            if not media_id and item.content_type == "restaurant":
                photo_resource = enriched.get("_photo_resource_name")
                if photo_resource:
                    from src.sources.google_places import get_photo_by_resource_name

                    gp_result = await get_photo_by_resource_name(photo_resource)
                    if gp_result:
                        image_bytes, content_type = gp_result
                        ext = content_type.split("/")[-1]
                        filename = f"content-engine-{item.id}.{ext}"
                        media_id = await upload_image(
                            self.api_client, image_bytes, filename, content_type
                        )

            # 3. Fallback: Kling AI
            if not media_id:
                from src.ai.image_generator import generate_image

                image_bytes = await generate_image(item.content_type, enriched)
                if image_bytes:
                    filename = f"content-engine-{item.id}.jpg"
                    media_id = await upload_image(
                        self.api_client, image_bytes, filename, "image/jpeg"
                    )

            # Build and send payload (use async version if available for category resolution)
            if hasattr(self, 'build_api_payload_async'):
                payload = await self.build_api_payload_async(enriched, media_id)
            else:
                payload = self.build_api_payload(enriched, media_id)

            # Set status based on per-type auto_publish setting from DB
            should_publish = await get_bool_setting(
                f"publish.{self.content_type}", self.auto_publish
            )
            if should_publish:
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
                    request_payload=payload,
                )
                session.add(push_log)
                await session.commit()
                return True

            except Exception as e:
                status_code = _extract_status_code(e)
                response_body = _extract_response_body(e)
                item.last_status_code = status_code
                item.error_message = str(e)[:1000]
                item.updated_at = datetime.now(timezone.utc)

                # Phase 1.4: classify failure type
                if status_code and status_code in permanent_codes and status_code != 429:
                    item.status = "permanently_failed"
                    log.warning(
                        "Permanent push failure — will not retry",
                        content_type=self.content_type,
                        item_id=str(item.id),
                        status_code=status_code,
                        error=str(e),
                    )
                else:
                    item.status = "failed"
                    # Phase 2.3: exponential backoff for retry
                    delay = retry_base_delay * (2 ** (item.push_attempts - 1))
                    item.next_retry_at = datetime.now(timezone.utc) + timedelta(seconds=delay)

                # Log request/response for debugging
                push_log = PushLog(
                    pipeline_item_id=item.id,
                    content_type=self.content_type,
                    api_endpoint=endpoint,
                    status_code=status_code,
                    request_payload=payload,
                    response_body=response_body,
                )
                session.add(push_log)

                await session.commit()
                log.error(
                    "Push failed",
                    content_type=self.content_type,
                    item_id=str(item.id),
                    status_code=status_code,
                    error=str(e),
                )
                return False


async def retry_failed_pushes(api_client: APIClient):
    """Retry failed pushes that haven't exceeded max attempts and are due for retry."""
    push_enabled = await is_auto_push_enabled()
    if not push_enabled:
        log.info("Auto-push disabled, skipping retry")
        return

    max_attempts = await get_int_setting("max_push_attempts", 3)
    now = datetime.now(timezone.utc)

    async with async_session() as session:
        result = await session.execute(
            select(PipelineItem).where(
                PipelineItem.status == "failed",
                PipelineItem.push_attempts < max_attempts,
                PipelineItem.enriched_data.isnot(None),
                # Phase 2.3: only retry items whose backoff period has elapsed
                (PipelineItem.next_retry_at.is_(None)) | (PipelineItem.next_retry_at <= now),
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
