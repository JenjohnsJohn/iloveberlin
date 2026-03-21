"""Content Engine entry point — starts scheduler + admin panel."""

import asyncio
import signal
import sys

import uvicorn
from fastapi import FastAPI

from src.admin.app import admin_app
from src.api_client.client import APIClient
from src.db.engine import init_db
from src.scheduler.jobs import setup_scheduler
from src.utils.logging import get_logger, setup_logging

# Root FastAPI app — mounts admin under /admin
app = FastAPI(title="I♥Berlin Content Engine")
app.mount("/admin", admin_app)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "content-engine"}


async def main():
    setup_logging()
    log = get_logger("main")
    log.info("I♥Berlin Content Engine starting up")

    # Initialize staging database tables
    log.info("Initializing database")
    await init_db()

    # Seed default settings
    from src.db.engine import async_session
    from src.db.models import EngineSetting
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    async with async_session() as session:
        await session.execute(
            pg_insert(EngineSetting)
            .values(
                key="auto_push_enabled",
                value="true",
                description="Whether pipelines automatically push enriched content to the API",
            )
            .on_conflict_do_nothing(index_elements=["key"])
        )
        await session.commit()

    # Create shared API client
    api_client = APIClient()

    # Setup and start scheduler
    scheduler = setup_scheduler(api_client)
    scheduler.start()
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
        log.info("Shutdown signal received")
        scheduler.shutdown(wait=False)
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
