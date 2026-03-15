"""Alert system — webhook-based notifications for pipeline events."""

import json
from datetime import datetime, timezone

import httpx

from src.db.settings import get_setting
from src.utils.logging import get_logger

log = get_logger("utils.notifications")


async def _get_webhook_url() -> str | None:
    """Get the configured notification webhook URL from DB settings."""
    url = await get_setting("notifications.webhook_url", "")
    return url if url else None


async def _send_webhook(payload: dict):
    """Send a notification payload to the configured webhook URL."""
    url = await _get_webhook_url()
    if not url:
        return

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if "hooks.slack.com" in url or "discord" in url:
                # Slack/Discord format
                message = payload.get("text", "")
                if not message:
                    message = json.dumps(payload, indent=2, default=str)
                resp = await client.post(url, json={"text": message})
            else:
                # Generic webhook — send full payload
                resp = await client.post(url, json=payload)
            resp.raise_for_status()
            log.debug("Notification sent", url=url[:50])
    except Exception as e:
        log.warning("Failed to send notification", error=str(e)[:200])


async def notify_pipeline_failure(pipeline_name: str, error_message: str):
    """Alert when a pipeline run fails."""
    enabled = await get_setting("notifications.on_pipeline_failure", "true")
    if enabled.lower() not in ("true", "1", "yes"):
        return

    await _send_webhook({
        "event": "pipeline_failure",
        "text": f"Pipeline failure: *{pipeline_name}*\nError: {error_message[:500]}",
        "pipeline": pipeline_name,
        "error": error_message[:500],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


async def notify_high_failure_rate(
    content_type: str,
    failed_count: int,
    total_count: int,
    period: str = "24h",
):
    """Alert when failure rate exceeds threshold."""
    enabled = await get_setting("notifications.on_high_failure_rate", "true")
    if enabled.lower() not in ("true", "1", "yes"):
        return

    rate = (failed_count / total_count * 100) if total_count > 0 else 0
    await _send_webhook({
        "event": "high_failure_rate",
        "text": (
            f"High failure rate for *{content_type}*: "
            f"{failed_count}/{total_count} ({rate:.0f}%) in the last {period}"
        ),
        "content_type": content_type,
        "failed": failed_count,
        "total": total_count,
        "rate_percent": round(rate, 1),
        "period": period,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


async def notify_zero_items(pipeline_name: str):
    """Alert when a pipeline produces zero items when items were expected."""
    enabled = await get_setting("notifications.on_zero_items", "true")
    if enabled.lower() not in ("true", "1", "yes"):
        return

    await _send_webhook({
        "event": "zero_items_produced",
        "text": f"Pipeline *{pipeline_name}* produced zero new items",
        "pipeline": pipeline_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


async def notify_quota_warning(service: str, used: int, limit: int):
    """Alert when an API quota is approaching its limit."""
    enabled = await get_setting("notifications.on_quota_warning", "true")
    if enabled.lower() not in ("true", "1", "yes"):
        return

    pct = (used / limit * 100) if limit > 0 else 0
    await _send_webhook({
        "event": "quota_warning",
        "text": f"API quota warning for *{service}*: {used}/{limit} ({pct:.0f}%) used",
        "service": service,
        "used": used,
        "limit": limit,
        "percent": round(pct, 1),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
