"""APScheduler cron job definitions for all content pipelines."""

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.api_client.client import APIClient
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


async def _run_pipeline(pipeline_cls, api_client: APIClient):
    """Wrapper to instantiate and run a pipeline."""
    pipeline = pipeline_cls(api_client)
    await pipeline.run()


async def _retry_failed(api_client: APIClient):
    await retry_failed_pushes(api_client)


def setup_scheduler(api_client: APIClient) -> AsyncIOScheduler:
    """Configure all cron jobs and return the scheduler."""
    scheduler = AsyncIOScheduler(timezone=TIMEZONE)

    # Articles (RSS) — every 2 hours from 6am to 10pm
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[ArticleRSSPipeline, api_client],
        hour="6,8,10,12,14,16,18,20,22",
        minute=0,
        id="articles_rss",
        name="Articles from RSS feeds",
    )

    # Articles (AI originals) — daily at 5:00am
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[ArticleAIPipeline, api_client],
        hour=5,
        minute=0,
        id="articles_ai",
        name="AI-generated articles",
    )

    # Events (berlin.de) — twice daily: 6am, 2pm
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[EventBerlinDePipeline, api_client],
        hour="6,14",
        minute=0,
        id="events_berlinde",
        name="Events from berlin.de",
    )

    # Events (AI) — daily at 5:30am
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[EventAIPipeline, api_client],
        hour=5,
        minute=30,
        id="events_ai",
        name="AI-generated events",
    )

    # Restaurants (Overpass) — daily at 3:00am
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[RestaurantPipeline, api_client],
        hour=3,
        minute=0,
        id="restaurants",
        name="Restaurants from OpenStreetMap",
    )

    # Guides (AI) — daily at 4:00am
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[GuidePipeline, api_client],
        hour=4,
        minute=0,
        id="guides",
        name="AI-generated guides",
    )

    # Videos (YouTube) — twice daily: 8am, 4pm
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[VideoPipeline, api_client],
        hour="8,16",
        minute=0,
        id="videos",
        name="Videos from YouTube",
    )

    # Competitions (AI) — every 3 days at 6am
    scheduler.add_job(
        _run_pipeline,
        "cron",
        args=[CompetitionPipeline, api_client],
        day="*/3",
        hour=6,
        minute=0,
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

    log.info("Scheduler configured", job_count=len(scheduler.get_jobs()))
    return scheduler
