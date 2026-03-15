"""Simple circuit breaker for external API calls."""

import asyncio
import time

from src.utils.logging import get_logger

log = get_logger("utils.circuit_breaker")


class CircuitBreaker:
    """Three-state circuit breaker: closed -> open -> half-open -> closed.

    - closed: requests pass through normally
    - open: requests fail immediately (circuit tripped after consecutive failures)
    - half-open: one probe request allowed to test recovery
    """

    def __init__(
        self,
        name: str = "default",
        failure_threshold: int = 5,
        recovery_timeout: float = 300,  # 5 minutes
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self._state = "closed"
        self._consecutive_failures = 0
        self._opened_at: float = 0
        self._lock = asyncio.Lock()

    @property
    def state(self) -> str:
        if self._state == "open":
            if time.monotonic() - self._opened_at >= self.recovery_timeout:
                return "half-open"
        return self._state

    @property
    def is_available(self) -> bool:
        """Check if requests should be allowed through."""
        return self.state != "open"

    async def record_success(self):
        """Record a successful call — reset failure counter, close circuit."""
        async with self._lock:
            self._consecutive_failures = 0
            if self._state != "closed":
                log.info("Circuit breaker closed", name=self.name)
            self._state = "closed"

    async def record_failure(self):
        """Record a failed call — increment counter, potentially open circuit."""
        async with self._lock:
            self._consecutive_failures += 1
            if self._consecutive_failures >= self.failure_threshold:
                if self._state != "open":
                    log.warning(
                        "Circuit breaker opened",
                        name=self.name,
                        failures=self._consecutive_failures,
                        recovery_timeout=self.recovery_timeout,
                    )
                self._state = "open"
                self._opened_at = time.monotonic()
