"""Content Engine entry point — starts scheduler + admin panel."""

import asyncio
import signal
import sys

import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import select, func

from src.admin.app import admin_app
from src.api_client.client import APIClient
from src.api_client.ingest import ingest_router
from src.db.engine import async_session, init_db
from src.scheduler.jobs import setup_scheduler
from src.utils.logging import get_logger, setup_logging
from src.utils.metrics import get_metrics_response

# Root FastAPI app — mounts admin under /admin
app = FastAPI(title="I\u2665Berlin Content Engine")
app.mount("/admin", admin_app)

# Phase 5.5: webhook ingest endpoint
app.include_router(ingest_router)

# Store scheduler reference for dynamic schedule reload (Phase 2.5)
_scheduler_ref = None


@app.get("/health")
async def health():
    """Phase 2.2: real health check — verify DB and scheduler."""
    checks = {"db": "ok", "scheduler": "ok"}
    overall = "ok"

    # Check DB connectivity
    try:
        async with async_session() as session:
            await session.execute(select(func.now()))
    except Exception:
        checks["db"] = "error"
        overall = "degraded"

    # Check scheduler
    if _scheduler_ref:
        if _scheduler_ref.running:
            checks["scheduler"] = "ok"
        else:
            checks["scheduler"] = "stopped"
            overall = "degraded"
    else:
        checks["scheduler"] = "not initialized"
        overall = "degraded"

    status_code = 200 if overall == "ok" else 503
    return JSONResponse(
        {"status": overall, "service": "content-engine", "checks": checks},
        status_code=status_code,
    )


@app.get("/metrics")
async def metrics():
    """Phase 5.6: Prometheus metrics endpoint."""
    return get_metrics_response()


async def main():
    global _scheduler_ref

    setup_logging()
    log = get_logger("main")
    log.info("I\u2665Berlin Content Engine starting up")

    # Validate configuration
    from config.settings import validate_settings
    validate_settings()

    # Initialize staging database tables
    log.info("Initializing database")
    await init_db()

    # Seed default settings
    from src.db.models import EngineSetting
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    default_settings = [
        # Global
        ("auto_push_enabled", "true", "Whether pipelines automatically push enriched content to the API"),
        ("max_push_attempts", "3", "Maximum push retry attempts per item"),
        ("retry_interval_minutes", "30", "Minutes between failed push retries"),
        # Per-pipeline enabled
        ("pipeline.articles_rss.enabled", "true", "Enable Articles (RSS) pipeline"),
        ("pipeline.articles_ai.enabled", "true", "Enable Articles (AI) pipeline"),
        ("pipeline.events_berlinde.enabled", "true", "Enable Events (berlin.de) pipeline"),
        ("pipeline.events_ai.enabled", "true", "Enable Events (AI) pipeline"),
        ("pipeline.restaurants.enabled", "true", "Enable Restaurants pipeline"),
        ("pipeline.guides.enabled", "true", "Enable Guides pipeline"),
        ("pipeline.videos.enabled", "true", "Enable Videos pipeline"),
        ("pipeline.competitions.enabled", "true", "Enable Competitions pipeline"),
        # Per-type auto-publish
        ("publish.article", "true", "Auto-publish articles as 'published' (false = draft)"),
        ("publish.event", "false", "Auto-publish events as 'published' (false = draft)"),
        ("publish.restaurant", "false", "Auto-publish restaurants as 'published' (false = draft)"),
        ("publish.guide", "false", "Auto-publish guides as 'published' (false = draft)"),
        ("publish.video", "true", "Auto-publish videos as 'published' (false = draft)"),
        ("publish.competition", "false", "Auto-publish competitions as 'published' (false = draft)"),
        # Per-pipeline schedules (cron expressions)
        ("schedule.articles_rss", "*/5 * * * *", "Cron schedule for Articles (RSS)"),
        ("schedule.articles_ai", "0 */2 * * *", "Cron schedule for Articles (AI)"),
        ("schedule.events_berlinde", "0 */2 * * *", "Cron schedule for Events (berlin.de)"),
        ("schedule.events_ai", "0 */2 * * *", "Cron schedule for Events (AI)"),
        ("schedule.restaurants", "0 */2 * * *", "Cron schedule for Restaurants"),
        ("schedule.guides", "0 */2 * * *", "Cron schedule for Guides"),
        ("schedule.videos", "0 */2 * * *", "Cron schedule for Videos"),
        ("schedule.competitions", "0 */2 * * *", "Cron schedule for Competitions"),
        # Daily targets / limits
        ("target.articles_ai.daily_count", "15", "Number of AI articles to generate per day"),
        ("target.restaurants.batch_size", "20", "Number of restaurants to fetch per run"),
        ("target.guides.daily_count", "5", "Number of guides to generate per day"),
        ("target.events_ai.daily_count", "5", "Number of AI events to generate per day"),
        ("target.videos.max_results_per_query", "5", "Max YouTube results per search query"),
        # AI settings
        ("ai.model", "kimi-k2.5", "AI model name for content generation"),
        # Source config (JSON)
        ("source.rss_feeds", '[{"url":"https://www.iheartberlin.de/feed/","name":"iHeartBerlin"},{"url":"https://rss.dw.com/xml/rss-en-all","name":"DW Germany"},{"url":"https://www.berliner-zeitung.de/feed.xml","name":"Berliner Zeitung"},{"url":"https://www.tip-berlin.de/feed/","name":"Tip Berlin"},{"url":"https://www.exberliner.com/feed/","name":"Exberliner"},{"url":"https://slowtravelberlin.com/feed/","name":"Slow Travel Berlin"},{"url":"https://thebritishberliner.com/feed/","name":"The British Berliner"},{"url":"https://www.berlinartlink.com/feed/","name":"Berlin Art Link"},{"url":"https://ceecee.cc/feed/","name":"Cee Cee Berlin"},{"url":"https://berlinfoodstories.com/feed/","name":"Berlin Food Stories"},{"url":"https://masha-sedgwick.com/feed/","name":"Masha Sedgwick"}]', "RSS feed sources (JSON array of {url, name})"),
        ("source.youtube_queries", '["Berlin travel vlog","Berlin food tour","Berlin nightlife","Berlin street art","Berlin history documentary","Berlin apartment tour","Berlin day in my life","Berlin hidden gems"]', "YouTube search queries (JSON array of strings)"),
        # Phase 4.1: housekeeping retention periods
        ("housekeeping.dedup_retention_days", "90", "Days to retain dedup log entries"),
        ("housekeeping.pushed_retention_days", "30", "Days to retain pushed pipeline items"),
        # Phase 5.7: notification settings
        ("notifications.webhook_url", "", "Webhook URL for alerts (Slack, Discord, or generic)"),
        ("notifications.on_pipeline_failure", "true", "Send alert on pipeline failure"),
        ("notifications.on_high_failure_rate", "true", "Send alert on high failure rate"),
        ("notifications.on_zero_items", "true", "Send alert when pipeline produces zero items"),
        ("notifications.on_quota_warning", "true", "Send alert on API quota warning"),
    ]

    async with async_session() as session:
        for key, value, description in default_settings:
            await session.execute(
                pg_insert(EngineSetting)
                .values(key=key, value=value, description=description)
                .on_conflict_do_nothing(index_elements=["key"])
            )
        await session.commit()

    # Create shared API client
    api_client = APIClient()

    # Setup and start scheduler
    scheduler = setup_scheduler(api_client)
    scheduler.start()
    _scheduler_ref = scheduler

    # Make scheduler available to admin app for dynamic rescheduling (Phase 2.5)
    admin_app.state.scheduler = scheduler

    log.info("Scheduler started — content pipelines are running")

    # Run admin web server
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8100,
        log_level="info",
        access_log=False,
    )
    server = uvicorn.Server(config)

    log.info("Admin panel available at http://localhost:8100/admin/")

    # Handle graceful shutdown
    original_handler = signal.getsignal(signal.SIGINT)

    def _shutdown(signum, frame):
        log.info("Shutdown signal received — draining in-flight tasks")
        # Phase 5.2: wait for running jobs (up to 30s timeout)
        scheduler.shutdown(wait=True)
        server.should_exit = True
        if callable(original_handler) and original_handler is not signal.default_int_handler:
            original_handler(signum, frame)

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT, _shutdown)

    try:
        await server.serve()
    finally:
        await api_client.close()
        log.info("Content Engine stopped")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
