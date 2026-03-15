"""APScheduler cron job definitions for all content pipelines."""

import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.api_client.client import APIClient
from src.db.settings import get_bool_setting
from src.pipelines.articles import ArticleAIPipeline, ArticleRSSPipeline
from src.pipelines.base import retry_failed_pushes
from src.pipelines.competitions import CompetitionPipeline
from src.pipelines.events import EventAIPipeline, EventBerlinDePipeline
from src.pipelines.guides import GuidePipeline
from src.pipelines.restaurants import RestaurantPipeline
from src.pipelines.videos import VideoPipeline
from src.utils.logging import get_logger

log = get_logger("scheduler.jobs")

TIMEZONE = "Europe/Berlin"

# Map pipeline class -> settings key for enable/disable
PIPELINE_KEYS = {
    ArticleRSSPipeline: "articles_rss",
    ArticleAIPipeline: "articles_ai",
    EventBerlinDePipeline: "events_berlinde",
    EventAIPipeline: "events_ai",
    RestaurantPipeline: "restaurants",
    GuidePipeline: "guides",
    VideoPipeline: "videos",
    CompetitionPipeline: "competitions",
}

# Phase 1.5: module-level concurrency locks per pipeline key
_pipeline_locks: dict[str, asyncio.Lock] = {}


def _get_lock(key: str) -> asyncio.Lock:
    if key not in _pipeline_locks:
        _pipeline_locks[key] = asyncio.Lock()
    return _pipeline_locks[key]


async def _run_pipeline(pipeline_cls, api_client: APIClient):
    """Wrapper to instantiate and run a pipeline, checking enabled state + concurrency guard."""
    pipeline_key = PIPELINE_KEYS.get(pipeline_cls, "")
    if pipeline_key:
        enabled = await get_bool_setting(f"pipeline.{pipeline_key}.enabled", True)
        if not enabled:
            log.info("Pipeline disabled, skipping", pipeline=pipeline_key)
            return

    # Phase 1.5: concurrency guard — skip if already running
    lock = _get_lock(pipeline_key or pipeline_cls.__name__)
    if lock.locked():
        log.warning("Pipeline already running, skipping scheduled run", pipeline=pipeline_key)
        return

    async with lock:
        pipeline = pipeline_cls(api_client)
        await pipeline.run()


async def _retry_failed(api_client: APIClient):
    await retry_failed_pushes(api_client)


async def _run_housekeeping():
    """Phase 4.1: data housekeeping — clean old dedup log and pushed items."""
    from datetime import datetime, timedelta, timezone
    from sqlalchemy import delete, select

    from src.db.engine import async_session
    from src.db.models import DedupLog, PipelineItem
    from src.db.settings import get_int_setting

    dedup_retention_days = await get_int_setting("housekeeping.dedup_retention_days", 90)
    pushed_retention_days = await get_int_setting("housekeeping.pushed_retention_days", 30)

    now = datetime.now(timezone.utc)
    dedup_cutoff = now - timedelta(days=dedup_retention_days)
    pushed_cutoff = now - timedelta(days=pushed_retention_days)

    async with async_session() as session:
        # Clean old dedup records
        result = await session.execute(
            delete(DedupLog).where(DedupLog.created_at < dedup_cutoff)
        )
        dedup_deleted = result.rowcount

        # Clean old pushed items
        result = await session.execute(
            delete(PipelineItem).where(
                PipelineItem.status == "pushed",
                PipelineItem.updated_at < pushed_cutoff,
            )
        )
        pushed_deleted = result.rowcount

        await session.commit()

    if dedup_deleted or pushed_deleted:
        log.info(
            "Housekeeping complete",
            dedup_deleted=dedup_deleted,
            pushed_deleted=pushed_deleted,
        )


def setup_scheduler(api_client: APIClient) -> AsyncIOScheduler:
    """Configure all cron jobs and return the scheduler."""
    scheduler = AsyncIOScheduler(timezone=TIMEZONE)

    # Articles (RSS) — every 5 minutes
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[ArticleRSSPipeline, api_client],
        minutes=5,
        id="articles_rss",
        name="Articles from RSS feeds",
    )

    # Articles (AI originals) — every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[ArticleAIPipeline, api_client],
        hours=2,
        id="articles_ai",
        name="AI-generated articles",
    )

    # Events (berlin.de) — every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[EventBerlinDePipeline, api_client],
        hours=2,
        id="events_berlinde",
        name="Events from berlin.de",
    )

    # Events (AI) — every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[EventAIPipeline, api_client],
        hours=2,
        id="events_ai",
        name="AI-generated events",
    )

    # Restaurants (Overpass) — every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[RestaurantPipeline, api_client],
        hours=2,
        id="restaurants",
        name="Restaurants from OpenStreetMap",
    )

    # Guides (AI) — every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[GuidePipeline, api_client],
        hours=2,
        id="guides",
        name="AI-generated guides",
    )

    # Videos (YouTube) — every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[VideoPipeline, api_client],
        hours=2,
        id="videos",
        name="Videos from YouTube",
    )

    # Competitions (AI) — every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[CompetitionPipeline, api_client],
        hours=2,
        id="competitions",
        name="AI-generated competitions",
    )

    # Retry failed pushes — every 30 minutes
    scheduler.add_job(
        _retry_failed,
        "interval",
        args=[api_client],
        minutes=30,
        id="retry_failed",
        name="Retry failed API pushes",
    )

    # Phase 4.1: Housekeeping — daily at 2am
    scheduler.add_job(
        _run_housekeeping,
        "cron",
        hour=2,
        minute=0,
        id="housekeeping",
        name="Data housekeeping (dedup + pushed items cleanup)",
    )

    log.info("Scheduler configured", job_count=len(scheduler.get_jobs()))
    return scheduler


def parse_cron_expression(cron_str: str) -> dict:
    """Parse a 5-field cron expression into APScheduler kwargs.

    Format: minute hour day_of_month month day_of_week
    """
    parts = cron_str.strip().split()
    if len(parts) != 5:
        raise ValueError(f"Invalid cron expression: {cron_str}")

    fields = {}
    names = ["minute", "hour", "day", "month", "day_of_week"]
    for name, value in zip(names, parts):
        if value != "*":
            fields[name] = value
    return fields


async def reschedule_pipeline(scheduler: AsyncIOScheduler, job_id: str, cron_str: str):
    """Phase 2.5: reschedule a pipeline job from a cron string."""
    try:
        fields = parse_cron_expression(cron_str)
        scheduler.reschedule_job(job_id, trigger="cron", **fields)
        log.info("Job rescheduled", job_id=job_id, cron=cron_str)
    except Exception as e:
        log.error("Failed to reschedule job", job_id=job_id, error=str(e))
