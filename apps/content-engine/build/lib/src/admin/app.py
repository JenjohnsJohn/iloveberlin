"""Content Engine Admin Panel — FastAPI app."""

import asyncio
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from src.db.engine import async_session
from src.db.models import DedupLog, EngineSetting, PipelineItem, PushLog

TEMPLATES_DIR = Path(__file__).parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

admin_app = FastAPI(title="Content Engine Admin", docs_url=None, redoc_url=None)


# --- Helper ---

async def get_setting(key: str, default: str = "") -> str:
    async with async_session() as session:
        result = await session.execute(
            select(EngineSetting.value).where(EngineSetting.key == key)
        )
        val = result.scalar_one_or_none()
        return val if val is not None else default


async def set_setting(key: str, value: str, description: str = ""):
    async with async_session() as session:
        await session.execute(
            pg_insert(EngineSetting)
            .values(key=key, value=value, description=description)
            .on_conflict_do_update(
                index_elements=["key"],
                set_={"value": value, "updated_at": datetime.now(timezone.utc)},
            )
        )
        await session.commit()


# --- Dashboard ---

@admin_app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    async with async_session() as session:
        # Counts by status
        status_counts = {}
        result = await session.execute(
            select(PipelineItem.status, func.count())
            .group_by(PipelineItem.status)
        )
        for status, count in result.all():
            status_counts[status] = count

        # Counts by content type
        type_counts = {}
        result = await session.execute(
            select(PipelineItem.content_type, PipelineItem.status, func.count())
            .group_by(PipelineItem.content_type, PipelineItem.status)
        )
        for ct, status, count in result.all():
            if ct not in type_counts:
                type_counts[ct] = {}
            type_counts[ct][status] = count

        # Total push log
        result = await session.execute(select(func.count()).select_from(PushLog))
        total_pushed = result.scalar() or 0

        # Total dedup
        result = await session.execute(select(func.count()).select_from(DedupLog))
        total_dedup = result.scalar() or 0

        # Recent activity — last 10 items
        result = await session.execute(
            select(PipelineItem)
            .order_by(PipelineItem.updated_at.desc())
            .limit(10)
        )
        recent_items = result.scalars().all()

        # Last push time per content type
        result = await session.execute(
            select(PushLog.content_type, func.max(PushLog.pushed_at))
            .group_by(PushLog.content_type)
        )
        last_push_times = {ct: ts for ct, ts in result.all()}

    auto_push = await get_setting("auto_push_enabled", "true")

    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "status_counts": status_counts,
        "type_counts": type_counts,
        "total_pushed": total_pushed,
        "total_dedup": total_dedup,
        "auto_push_enabled": auto_push.lower() in ("true", "1", "yes"),
        "recent_items": recent_items,
        "last_push_times": last_push_times,
    })


# --- Toggle auto-push ---

@admin_app.post("/settings/auto-push")
async def toggle_auto_push(request: Request):
    form = await request.form()
    enabled = form.get("enabled", "false")
    await set_setting(
        "auto_push_enabled",
        enabled,
        "Whether pipelines automatically push enriched content to the I♥Berlin API",
    )
    return RedirectResponse(url="/admin/", status_code=303)


# --- Run pipeline now ---

@admin_app.post("/pipelines/run")
async def run_pipeline_now(request: Request):
    form = await request.form()
    pipeline_name = form.get("pipeline", "")

    from src.api_client.client import APIClient
    from src.pipelines.articles import ArticleAIPipeline, ArticleRSSPipeline
    from src.pipelines.competitions import CompetitionPipeline
    from src.pipelines.events import EventAIPipeline, EventBerlinDePipeline
    from src.pipelines.guides import GuidePipeline
    from src.pipelines.restaurants import RestaurantPipeline
    from src.pipelines.videos import VideoPipeline

    pipeline_map = {
        "articles_rss": ArticleRSSPipeline,
        "articles_ai": ArticleAIPipeline,
        "events_berlinde": EventBerlinDePipeline,
        "events_ai": EventAIPipeline,
        "restaurants": RestaurantPipeline,
        "guides": GuidePipeline,
        "videos": VideoPipeline,
        "competitions": CompetitionPipeline,
    }

    cls = pipeline_map.get(pipeline_name)
    if cls:
        client = APIClient()
        try:
            pipeline = cls(client)
            # Run in background so the page doesn't hang
            asyncio.create_task(_run_pipeline_task(pipeline, client))
        except Exception:
            await client.close()

    return RedirectResponse(url="/admin/", status_code=303)


async def _run_pipeline_task(pipeline, client):
    try:
        await pipeline.run()
    finally:
        await client.close()


# --- Content list ---

@admin_app.get("/content", response_class=HTMLResponse)
async def content_list(
    request: Request,
    content_type: str = Query(default=""),
    status: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=25, ge=5, le=100),
):
    async with async_session() as session:
        query = select(PipelineItem).order_by(PipelineItem.created_at.desc())

        if content_type:
            query = query.where(PipelineItem.content_type == content_type)
        if status:
            query = query.where(PipelineItem.status == status)

        # Count
        count_query = select(func.count()).select_from(query.subquery())
        total = (await session.execute(count_query)).scalar() or 0

        # Paginate
        items = (
            await session.execute(
                query.offset((page - 1) * per_page).limit(per_page)
            )
        ).scalars().all()

        # Get distinct types and statuses for filters
        types_result = await session.execute(
            select(PipelineItem.content_type).distinct()
        )
        all_types = sorted([r[0] for r in types_result.all()])

        statuses_result = await session.execute(
            select(PipelineItem.status).distinct()
        )
        all_statuses = sorted([r[0] for r in statuses_result.all()])

    total_pages = max(1, (total + per_page - 1) // per_page)

    return templates.TemplateResponse("content_list.html", {
        "request": request,
        "items": items,
        "content_type": content_type,
        "status": status,
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
        "all_types": all_types,
        "all_statuses": all_statuses,
    })


# --- Content detail ---

@admin_app.get("/content/{item_id}", response_class=HTMLResponse)
async def content_detail(request: Request, item_id: str):
    async with async_session() as session:
        item = await session.get(PipelineItem, uuid.UUID(item_id))
        if not item:
            return HTMLResponse("Not found", status_code=404)

        # Get push log for this item
        result = await session.execute(
            select(PushLog)
            .where(PushLog.pipeline_item_id == item.id)
            .order_by(PushLog.pushed_at.desc())
        )
        push_logs = result.scalars().all()

    return templates.TemplateResponse("content_detail.html", {
        "request": request,
        "item": item,
        "push_logs": push_logs,
    })


# --- Manual push ---

@admin_app.post("/content/{item_id}/push")
async def manual_push(item_id: str):
    from src.api_client.client import APIClient
    from src.pipelines import get_pipeline

    client = APIClient()
    try:
        async with async_session() as session:
            item = await session.get(PipelineItem, uuid.UUID(item_id))
            if not item:
                return RedirectResponse(url="/admin/content", status_code=303)

        pipeline = get_pipeline(item.content_type, client)
        if pipeline:
            await pipeline._push_item(uuid.UUID(item_id))
    finally:
        await client.close()

    return RedirectResponse(url=f"/admin/content/{item_id}", status_code=303)


# --- Push all enriched ---

@admin_app.post("/content/push-all")
async def push_all_enriched(request: Request):
    form = await request.form()
    content_type = form.get("content_type", "")

    from src.api_client.client import APIClient
    from src.pipelines import get_pipeline

    client = APIClient()
    try:
        async with async_session() as session:
            query = select(PipelineItem.id).where(PipelineItem.status == "enriched")
            if content_type:
                query = query.where(PipelineItem.content_type == content_type)
            result = await session.execute(query)
            ids = [r[0] for r in result.all()]

        for pid in ids:
            async with async_session() as session:
                item = await session.get(PipelineItem, pid)
                if item:
                    pipeline = get_pipeline(item.content_type, client)
                    if pipeline:
                        await pipeline._push_item(pid)
    finally:
        await client.close()

    return RedirectResponse(url="/admin/content?status=enriched", status_code=303)


# --- Delete item ---

@admin_app.post("/content/{item_id}/delete")
async def delete_item(item_id: str):
    uid = uuid.UUID(item_id)
    async with async_session() as session:
        await session.execute(delete(PushLog).where(PushLog.pipeline_item_id == uid))
        await session.execute(delete(PipelineItem).where(PipelineItem.id == uid))
        await session.commit()
    return RedirectResponse(url="/admin/content", status_code=303)


# --- Health check ---

@admin_app.get("/health")
async def health():
    return {"status": "ok", "service": "content-engine"}
