"""Prometheus metrics for the content engine."""

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# Pipeline run metrics
pipeline_runs_total = Counter(
    "content_engine_pipeline_runs_total",
    "Total pipeline runs",
    ["pipeline", "status"],
)

pipeline_run_duration_seconds = Histogram(
    "content_engine_pipeline_run_duration_seconds",
    "Pipeline run duration in seconds",
    ["pipeline"],
    buckets=[5, 10, 30, 60, 120, 300, 600],
)

# Item metrics
items_fetched_total = Counter(
    "content_engine_items_fetched_total",
    "Total items fetched from sources",
    ["content_type", "source_type"],
)

items_enriched_total = Counter(
    "content_engine_items_enriched_total",
    "Total items enriched via AI",
    ["content_type"],
)

items_pushed_total = Counter(
    "content_engine_items_pushed_total",
    "Total items pushed to API",
    ["content_type"],
)

items_failed_total = Counter(
    "content_engine_items_failed_total",
    "Total items that failed to push",
    ["content_type", "failure_type"],
)

# AI metrics
ai_requests_total = Counter(
    "content_engine_ai_requests_total",
    "Total AI API requests",
    ["status"],
)

ai_request_duration_seconds = Histogram(
    "content_engine_ai_request_duration_seconds",
    "AI API request duration in seconds",
    buckets=[1, 2, 5, 10, 30, 60],
)

ai_tokens_used = Counter(
    "content_engine_ai_tokens_total",
    "Total AI tokens consumed",
    ["type"],  # prompt or completion
)

# Push metrics
push_success_total = Counter(
    "content_engine_push_success_total",
    "Total successful API pushes",
    ["content_type"],
)

push_failure_total = Counter(
    "content_engine_push_failure_total",
    "Total failed API pushes",
    ["content_type", "status_code"],
)

# Current queue gauge
items_pending = Gauge(
    "content_engine_items_pending",
    "Current items awaiting processing",
    ["status"],
)

# Circuit breaker state
circuit_breaker_state = Gauge(
    "content_engine_circuit_breaker_state",
    "Circuit breaker state (0=closed, 1=open, 2=half-open)",
    ["name"],
)


def get_metrics_response():
    """Generate the Prometheus metrics response."""
    from fastapi.responses import Response
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )
