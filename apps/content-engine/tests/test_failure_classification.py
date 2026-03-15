"""Tests for push failure classification (Phase 1.4)."""

import pytest

from src.pipelines.base import _extract_status_code, PERMANENT_FAILURE_CODES


class TestFailureClassification:
    def test_permanent_failure_codes(self):
        """Verify 4xx codes (except 429) are permanent."""
        assert 400 in PERMANENT_FAILURE_CODES
        assert 401 in PERMANENT_FAILURE_CODES
        assert 403 in PERMANENT_FAILURE_CODES
        assert 404 in PERMANENT_FAILURE_CODES
        assert 422 in PERMANENT_FAILURE_CODES
        assert 429 not in PERMANENT_FAILURE_CODES

    def test_extract_status_from_string(self):
        """Extract status code from error message string."""
        import httpx

        # Create a mock response for HTTPStatusError
        request = httpx.Request("POST", "https://example.com")
        response = httpx.Response(422, request=request)
        error = httpx.HTTPStatusError("422 Client Error", request=request, response=response)

        code = _extract_status_code(error)
        assert code == 422

    def test_extract_status_from_generic_error(self):
        """Extract from generic exception message."""
        error = Exception("Server returned 503 Service Unavailable")
        code = _extract_status_code(error)
        assert code == 503

    def test_no_status_code(self):
        """Return None when no status code found."""
        error = Exception("Connection refused")
        code = _extract_status_code(error)
        assert code is None


class TestCronParser:
    def test_parse_standard_cron(self):
        from src.scheduler.jobs import parse_cron_expression

        result = parse_cron_expression("0 5 * * *")
        assert result == {"minute": "0", "hour": "5"}

    def test_parse_complex_cron(self):
        from src.scheduler.jobs import parse_cron_expression

        result = parse_cron_expression("30 6,14 * * 1-5")
        assert result == {"minute": "30", "hour": "6,14", "day_of_week": "1-5"}

    def test_parse_all_wildcards(self):
        from src.scheduler.jobs import parse_cron_expression

        result = parse_cron_expression("* * * * *")
        assert result == {}

    def test_invalid_cron_raises(self):
        from src.scheduler.jobs import parse_cron_expression

        with pytest.raises(ValueError):
            parse_cron_expression("invalid")
