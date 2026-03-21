"""APScheduler cron job definitions for all content pipelines."""

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.api_client.client import APIClient
from src.db.settings import get_bool_setting, get_int_setting
from src.pipelines.articles import ArticleAIPipeline, ArticleRSSPipeline
from src.pipelines.base import retry_failed_pushes
from src.pipelines.competitions import CompetitionPipeline
from src.pipelines.events import EventAIPipeline, EventBerlinDePipeline
from src.pipelines.guides import GuidePipeline
from src.pipelines.restaurants import RestaurantPipeline
from src.pipelines.videos import VideoPipeline
from src.utils.locks import get_pipeline_lock
from src.utils.logging import get_logger

log = get_logger("scheduler.jobs")

TIMEZONE = "Europe/Berlin"

# Map pipeline class -> settings key for enable/disable
PIPELINE_KEYS: dict[type, str] = {
    ArticleRSSPipeline: "articles_rss",
    ArticleAIPipeline: "articles_ai",
    EventBerlinDePipeline: "events_berlinde",
    EventAIPipeline: "events_ai",
    RestaurantPipeline: "restaurants",
    GuidePipeline: "guides",
    VideoPipeline: "videos",
    CompetitionPipeline: "competitions",
}


async def _run_pipeline(pipeline_cls: type, api_client: APIClient) -> None:
    """Wrapper to instantiate and run a pipeline, checking enabled state + concurrency guard."""
    pipeline_key: str = PIPELINE_KEYS.get(pipeline_cls, "")
    if pipeline_key:
        enabled = await get_bool_setting(f"pipeline.{pipeline_key}.enabled", True)
        if not enabled:
            log.info("Pipeline disabled, skipping", pipeline=pipeline_key)
            return

    # Phase 1.5: concurrency guard — skip if already running
    lock = get_pipeline_lock(pipeline_key or pipeline_cls.__name__)
    if lock.locked():
        log.warning("Pipeline already running, skipping scheduled run", pipeline=pipeline_key)
        return

    async with lock:
        pipeline = pipeline_cls(api_client)
        await pipeline.run()


async def _retry_failed(api_client: APIClient) -> None:
    await retry_failed_pushes(api_client)


async def _run_housekeeping() -> None:
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

    perm_failed_cutoff = now - timedelta(days=30)

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

        # Clean permanently failed items older than 30 days
        result = await session.execute(
            delete(PipelineItem).where(
                PipelineItem.status == "permanently_failed",
                PipelineItem.updated_at < perm_failed_cutoff,
            )
        )
        perm_failed_deleted = result.rowcount

        await session.commit()

    if dedup_deleted or pushed_deleted or perm_failed_deleted:
        log.info(
            "Housekeeping complete",
            dedup_deleted=dedup_deleted,
            pushed_deleted=pushed_deleted,
            perm_failed_deleted=perm_failed_deleted,
        )


async def setup_scheduler(api_client: APIClient) -> AsyncIOScheduler:
    """Configure all cron jobs and return the scheduler.

    Intervals are read from DB settings (key: scheduler.<job_id>.interval_seconds)
    with sensible defaults, allowing runtime tuning without code changes.
    """
    scheduler = AsyncIOScheduler(timezone=TIMEZONE)

    # Read configurable intervals from DB settings (all in seconds)
    rss_interval = await get_int_setting("scheduler.articles_rss.interval_seconds", 300)
    articles_ai_interval = await get_int_setting("scheduler.articles_ai.interval_seconds", 7200)
    events_berlinde_interval = await get_int_setting("scheduler.events_berlinde.interval_seconds", 7200)
    events_ai_interval = await get_int_setting("scheduler.events_ai.interval_seconds", 7200)
    restaurants_interval = await get_int_setting("scheduler.restaurants.interval_seconds", 7200)
    guides_interval = await get_int_setting("scheduler.guides.interval_seconds", 7200)
    videos_interval = await get_int_setting("scheduler.videos.interval_seconds", 7200)
    competitions_interval = await get_int_setting("scheduler.competitions.interval_seconds", 7200)
    retry_interval = await get_int_setting("scheduler.retry_failed.interval_seconds", 1800)

    # Articles (RSS) — default every 5 minutes
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[ArticleRSSPipeline, api_client],
        seconds=rss_interval,
        id="articles_rss",
        name="Articles from RSS feeds",
    )

    # Articles (AI originals) — default every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[ArticleAIPipeline, api_client],
        seconds=articles_ai_interval,
        id="articles_ai",
        name="AI-generated articles",
    )

    # Events (berlin.de) — default every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[EventBerlinDePipeline, api_client],
        seconds=events_berlinde_interval,
        id="events_berlinde",
        name="Events from berlin.de",
    )

    # Events (AI) — default every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[EventAIPipeline, api_client],
        seconds=events_ai_interval,
        id="events_ai",
        name="AI-generated events",
    )

    # Restaurants (Overpass) — default every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[RestaurantPipeline, api_client],
        seconds=restaurants_interval,
        id="restaurants",
        name="Restaurants from OpenStreetMap",
    )

    # Guides (AI) — default every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[GuidePipeline, api_client],
        seconds=guides_interval,
        id="guides",
        name="AI-generated guides",
    )

    # Videos (YouTube) — default every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[VideoPipeline, api_client],
        seconds=videos_interval,
        id="videos",
        name="Videos from YouTube",
    )

    # Competitions (AI) — default every 2 hours
    scheduler.add_job(
        _run_pipeline,
        "interval",
        args=[CompetitionPipeline, api_client],
        seconds=competitions_interval,
        id="competitions",
        name="AI-generated competitions",
    )

    # Retry failed pushes — default every 30 minutes
    scheduler.add_job(
        _retry_failed,
        "interval",
        args=[api_client],
        seconds=retry_interval,
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
