"""Tests for Prometheus metrics (Phase 5.6)."""

import pytest

from src.utils.metrics import (
    pipeline_runs_total,
    items_fetched_total,
    items_pushed_total,
    ai_requests_total,
    ai_tokens_used,
    get_metrics_response,
)


class TestMetrics:
    def test_counter_labels(self):
        """Verify counters accept expected labels."""
        pipeline_runs_total.labels(pipeline="test", status="success")
        items_fetched_total.labels(content_type="article", source_type="rss")
        items_pushed_total.labels(content_type="article")
        ai_requests_total.labels(status="success")
        ai_tokens_used.labels(type="prompt")

    def test_metrics_response(self):
        """Verify metrics endpoint generates valid response."""
        response = get_metrics_response()
        assert response.status_code == 200
        assert b"content_engine" in response.body
