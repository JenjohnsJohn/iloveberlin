"""Tests for the circuit breaker (Phase 2.4)."""

import asyncio
import time

import pytest

from src.utils.circuit_breaker import CircuitBreaker


@pytest.mark.asyncio
class TestCircuitBreaker:
    async def test_starts_closed(self):
        cb = CircuitBreaker(name="test")
        assert cb.state == "closed"
        assert cb.is_available is True

    async def test_opens_after_threshold(self):
        cb = CircuitBreaker(name="test", failure_threshold=3, recovery_timeout=60)
        for _ in range(3):
            await cb.record_failure()
        assert cb.state == "open"
        assert cb.is_available is False

    async def test_stays_closed_below_threshold(self):
        cb = CircuitBreaker(name="test", failure_threshold=3)
        await cb.record_failure()
        await cb.record_failure()
        assert cb.state == "closed"
        assert cb.is_available is True

    async def test_success_resets_counter(self):
        cb = CircuitBreaker(name="test", failure_threshold=3)
        await cb.record_failure()
        await cb.record_failure()
        await cb.record_success()
        await cb.record_failure()
        await cb.record_failure()
        assert cb.state == "closed"

    async def test_half_open_after_timeout(self):
        cb = CircuitBreaker(name="test", failure_threshold=2, recovery_timeout=0.1)
        await cb.record_failure()
        await cb.record_failure()
        assert cb.state == "open"
        await asyncio.sleep(0.15)
        assert cb.state == "half-open"
        assert cb.is_available is True

    async def test_success_closes_from_half_open(self):
        cb = CircuitBreaker(name="test", failure_threshold=2, recovery_timeout=0.1)
        await cb.record_failure()
        await cb.record_failure()
        await asyncio.sleep(0.15)
        assert cb.state == "half-open"
        await cb.record_success()
        assert cb.state == "closed"
