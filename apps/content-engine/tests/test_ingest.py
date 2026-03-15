"""Tests for webhook ingest endpoint (Phase 5.5)."""

import pytest

from src.api_client.ingest import VALID_CONTENT_TYPES


class TestIngestValidation:
    def test_valid_content_types(self):
        assert "article" in VALID_CONTENT_TYPES
        assert "event" in VALID_CONTENT_TYPES
        assert "restaurant" in VALID_CONTENT_TYPES
        assert "guide" in VALID_CONTENT_TYPES
        assert "video" in VALID_CONTENT_TYPES
        assert "competition" in VALID_CONTENT_TYPES

    def test_invalid_content_types_excluded(self):
        assert "unknown" not in VALID_CONTENT_TYPES
        assert "" not in VALID_CONTENT_TYPES
