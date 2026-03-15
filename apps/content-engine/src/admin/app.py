"""Content Engine Admin Panel — FastAPI app with authentication."""

import asyncio
import json
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import delete, func, select, or_

from src.admin.auth import (
    SESSION_COOKIE,
    _check_password,
    create_session_token,
    is_authenticated,
    require_auth,
)
from src.db.engine import async_session
from src.db.models import DedupLog, PipelineItem, PipelineRun, PushLog, SettingChangeLog
from src.db.settings import (
    get_all_settings,
    get_bool_setting,
    get_setting,
    get_settings_by_prefix,
    set_setting,
)
from src.utils.logging import get_logger

log = get_logger("admin")

TEMPLATES_DIR = Path(__file__).parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

admin_app = FastAPI(title="Content Engine Admin", docs_url=None, redoc_url=None)

# --- Pipeline concurrency locks (Phase 1.5) ---
_pipeline_locks: dict[str, asyncio.Lock] = {}


def _get_pipeline_lock(pipeline_name: str) -> asyncio.Lock:
    if pipeline_name not in _pipeline_locks:
        _pipeline_locks[pipeline_name] = asyncio.Lock()
    return _pipeline_locks[pipeline_name]


# --- CSRF helpers (Phase 2.7) ---

_SENSITIVE_KEY_PATTERNS = ("key", "password", "secret", "token", "hash")


def _mask_value(key: str, value: str) -> str:
    """Mask sensitive setting values for display."""
    key_lower = key.lower()
    if any(p in key_lower for p in _SENSITIVE_KEY_PATTERNS) and value:
        return "\u2022" * 8
    return value


def _generate_csrf_token(request: Request) -> str:
    """Generate or retrieve CSRF token for the current session."""
    if not hasattr(request.state, "_csrf_token"):
        request.state._csrf_token = secrets.token_hex(32)
    return request.state._csrf_token


# --- Login ---

@admin_app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request, "error": ""})


@admin_app.post("/login")
async def login_submit(request: Request):
    form = await request.form()
    password = form.get("password", "")

    if _check_password(password):
        token = create_session_token()
        response = RedirectResponse(url="/admin/", status_code=303)
        response.set_cookie(
            SESSION_COOKIE,
            token,
            max_age=86400 * 7,
            httponly=True,
            samesite="lax",
        )
        return response

    return templates.TemplateResponse(
        "login.html",
        {"request": request, "error": "Invalid password."},
        status_code=401,
    )


@admin_app.get("/logout")
async def logout():
    response = RedirectResponse(url="/admin/login", status_code=303)
    response.delete_cookie(SESSION_COOKIE)
    return response


# --- Dashboard ---

@admin_app.get("/", response_class=HTMLResponse)
@require_auth
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

        # Phase 4.7: 24h and 7d stats
        now = datetime.now(timezone.utc)
        from datetime import timedelta
        t_24h = now - timedelta(hours=24)
        t_7d = now - timedelta(days=7)

        # Items created in last 24h / 7d
        result = await session.execute(
            select(func.count()).where(PipelineItem.created_at >= t_24h)
        )
        created_24h = result.scalar() or 0

        result = await session.execute(
            select(func.count()).where(PipelineItem.created_at >= t_7d)
        )
        created_7d = result.scalar() or 0

        # Items pushed in last 24h / 7d
        result = await session.execute(
            select(func.count()).where(
                PipelineItem.status == "pushed",
                PipelineItem.updated_at >= t_24h,
            )
        )
        pushed_24h = result.scalar() or 0

        result = await session.execute(
            select(func.count()).where(
                PipelineItem.status == "pushed",
                PipelineItem.updated_at >= t_7d,
            )
        )
        pushed_7d = result.scalar() or 0

        # Items failed in last 24h / 7d
        result = await session.execute(
            select(func.count()).where(
                PipelineItem.status.in_(["failed", "permanently_failed"]),
                PipelineItem.updated_at >= t_24h,
            )
        )
        failed_24h = result.scalar() or 0

        result = await session.execute(
            select(func.count()).where(
                PipelineItem.status.in_(["failed", "permanently_failed"]),
                PipelineItem.updated_at >= t_7d,
            )
        )
        failed_7d = result.scalar() or 0

        # Recent pipeline runs
        result = await session.execute(
            select(PipelineRun)
            .order_by(PipelineRun.started_at.desc())
            .limit(5)
        )
        recent_runs = result.scalars().all()

    auto_push = await get_setting("auto_push_enabled", "true")
    pipeline_settings = await get_settings_by_prefix("pipeline.")

    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "status_counts": status_counts,
        "type_counts": type_counts,
        "total_pushed": total_pushed,
        "total_dedup": total_dedup,
        "auto_push_enabled": auto_push.lower() in ("true", "1", "yes"),
        "recent_items": recent_items,
        "last_push_times": last_push_times,
        "pipeline_settings": pipeline_settings,
        "created_24h": created_24h,
        "created_7d": created_7d,
        "pushed_24h": pushed_24h,
        "pushed_7d": pushed_7d,
        "failed_24h": failed_24h,
        "failed_7d": failed_7d,
        "recent_runs": recent_runs,
    })


# --- Toggle auto-push ---

@admin_app.post("/settings/auto-push")
@require_auth
async def toggle_auto_push(request: Request):
    form = await request.form()
    enabled = form.get("enabled", "false")
    await set_setting(
        "auto_push_enabled",
        enabled,
        "Whether pipelines automatically push enriched content to the I\u2665Berlin API",
    )
    return RedirectResponse(url="/admin/", status_code=303)


# --- Settings page ---

PIPELINE_LABELS = {
    "articles_rss": ("Articles (RSS)", "article"),
    "articles_ai": ("Articles (AI)", "article"),
    "events_berlinde": ("Events (berlin.de)", "event"),
    "events_ai": ("Events (AI)", "event"),
    "restaurants": ("Restaurants", "restaurant"),
    "guides": ("Guides", "guide"),
    "videos": ("Videos", "video"),
    "competitions": ("Competitions", "competition"),
}

TARGET_KEYS = {
    "articles_ai": "target.articles_ai.daily_count",
    "events_ai": "target.events_ai.daily_count",
    "restaurants": "target.restaurants.batch_size",
    "guides": "target.guides.daily_count",
    "videos": "target.videos.max_results_per_query",
}


@admin_app.get("/settings", response_class=HTMLResponse)
@require_auth
async def settings_page(request: Request):
    all_settings = await get_all_settings()
    return templates.TemplateResponse("settings.html", {
        "request": request,
        "settings": all_settings,
        "pipeline_labels": PIPELINE_LABELS,
        "target_keys": TARGET_KEYS,
        "mask_value": _mask_value,
    })


@admin_app.post("/settings/update")
@require_auth
async def update_settings(request: Request):
    form = await request.form()
    for key, value in form.items():
        if key.startswith("_"):
            continue
        await set_setting(key, value)
    return RedirectResponse(url="/admin/settings", status_code=303)


@admin_app.post("/settings/update-json")
@require_auth
async def update_json_setting(request: Request):
    form = await request.form()
    key = form.get("key", "")
    value = form.get("value", "[]")
    if key:
        try:
            json.loads(value)
        except json.JSONDecodeError:
            return RedirectResponse(url="/admin/settings", status_code=303)
        await set_setting(key, value)
    return RedirectResponse(url="/admin/settings", status_code=303)


# --- Run pipeline now (with concurrency guard, Phase 1.5) ---

@admin_app.post("/pipelines/run")
@require_auth
async def run_pipeline_now(request: Request):
    form = await request.form()
    pipeline_name = form.get("pipeline", "")
    dry_run = form.get("dry_run", "false") == "true"

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
            asyncio.create_task(_run_pipeline_task(pipeline, client, pipeline_name, dry_run))
        except Exception:
            await client.close()

    return RedirectResponse(url="/admin/", status_code=303)


async def _run_pipeline_task(pipeline, client, pipeline_name: str, dry_run: bool = False):
    """Run pipeline with concurrency guard."""
    lock = _get_pipeline_lock(pipeline_name)
    if lock.locked():
        log.warning("Pipeline already running, skipping", pipeline=pipeline_name)
        await client.close()
        return
    async with lock:
        try:
            await pipeline.run(dry_run=dry_run)
        finally:
            await client.close()


# --- Pipeline runs history (Phase 2.1) ---

@admin_app.get("/runs", response_class=HTMLResponse)
@require_auth
async def pipeline_runs(request: Request):
    async with async_session() as session:
        result = await session.execute(
            select(PipelineRun)
            .order_by(PipelineRun.started_at.desc())
            .limit(100)
        )
        runs = result.scalars().all()
    return templates.TemplateResponse("runs.html", {
        "request": request,
        "runs": runs,
    })


# --- Content list (with search, Phase 2.6) ---

@admin_app.get("/content", response_class=HTMLResponse)
@require_auth
async def content_list(
    request: Request,
    content_type: str = Query(default=""),
    status: str = Query(default=""),
    search: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=25, ge=5, le=100),
):
    async with async_session() as session:
        query = select(PipelineItem).order_by(PipelineItem.created_at.desc())

        if content_type:
            query = query.where(PipelineItem.content_type == content_type)
        if status:
            query = query.where(PipelineItem.status == status)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    PipelineItem.enriched_data["title"].astext.ilike(search_pattern),
                    PipelineItem.enriched_data["name"].astext.ilike(search_pattern),
                    PipelineItem.raw_data["title"].astext.ilike(search_pattern),
                    PipelineItem.raw_data["name"].astext.ilike(search_pattern),
                    PipelineItem.raw_data["topic"].astext.ilike(search_pattern),
                )
            )

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
        "search": search,
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
        "all_types": all_types,
        "all_statuses": all_statuses,
    })


# --- Content detail ---

@admin_app.get("/content/{item_id}", response_class=HTMLResponse)
@require_auth
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


# --- Edit content (Phase 3.2) ---

@admin_app.get("/content/{item_id}/edit", response_class=HTMLResponse)
@require_auth
async def content_edit_page(request: Request, item_id: str):
    async with async_session() as session:
        item = await session.get(PipelineItem, uuid.UUID(item_id))
        if not item:
            return HTMLResponse("Not found", status_code=404)

    return templates.TemplateResponse("content_edit.html", {
        "request": request,
        "item": item,
    })


@admin_app.post("/content/{item_id}/edit")
@require_auth
async def content_edit_submit(request: Request, item_id: str):
    form = await request.form()
    async with async_session() as session:
        item = await session.get(PipelineItem, uuid.UUID(item_id))
        if not item:
            return HTMLResponse("Not found", status_code=404)

        enriched = dict(item.enriched_data or {})
        for key, value in form.items():
            if key.startswith("_"):
                continue
            if value:
                enriched[key] = value
        item.enriched_data = enriched
        item.updated_at = datetime.now(timezone.utc)
        await session.commit()

    return RedirectResponse(url=f"/admin/content/{item_id}", status_code=303)


# --- Manual push ---

@admin_app.post("/content/{item_id}/push")
@require_auth
async def manual_push(request: Request, item_id: str):
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
@require_auth
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


# --- Bulk operations (Phase 3.5) ---

@admin_app.post("/content/bulk-action")
@require_auth
async def bulk_action(request: Request):
    form = await request.form()
    action = form.get("action", "")
    item_ids = form.getlist("item_ids")

    if not item_ids or not action:
        return RedirectResponse(url="/admin/content", status_code=303)

    uuids = [uuid.UUID(i) for i in item_ids]

    if action == "delete":
        async with async_session() as session:
            for uid in uuids:
                await session.execute(delete(PushLog).where(PushLog.pipeline_item_id == uid))
                await session.execute(delete(PipelineItem).where(PipelineItem.id == uid))
            await session.commit()

    elif action == "re-enrich":
        async with async_session() as session:
            for uid in uuids:
                item = await session.get(PipelineItem, uid)
                if item:
                    item.status = "fetched"
                    item.enriched_data = None
                    item.error_message = None
                    item.updated_at = datetime.now(timezone.utc)
            await session.commit()

    elif action == "mark-failed":
        async with async_session() as session:
            for uid in uuids:
                item = await session.get(PipelineItem, uid)
                if item:
                    item.status = "failed"
                    item.updated_at = datetime.now(timezone.utc)
            await session.commit()

    return RedirectResponse(url="/admin/content", status_code=303)


# --- Delete item ---

@admin_app.post("/content/{item_id}/delete")
@require_auth
async def delete_item(request: Request, item_id: str):
    uid = uuid.UUID(item_id)
    async with async_session() as session:
        await session.execute(delete(PushLog).where(PushLog.pipeline_item_id == uid))
        await session.execute(delete(PipelineItem).where(PipelineItem.id == uid))
        await session.commit()
    return RedirectResponse(url="/admin/content", status_code=303)


# --- Health check (Phase 2.2: real health check) ---

@admin_app.get("/health")
async def health():
    checks = {"db": "ok", "scheduler": "unknown"}
    overall = "ok"

    # Check DB connectivity
    try:
        async with async_session() as session:
            await session.execute(select(func.now()))
        checks["db"] = "ok"
    except Exception as e:
        checks["db"] = f"error: {str(e)[:100]}"
        overall = "degraded"

    status_code = 200 if overall == "ok" else 503
    return {"status": overall, "service": "content-engine", "checks": checks}
