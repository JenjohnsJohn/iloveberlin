import asyncio
import time


class TokenBucketRateLimiter:
    """Simple token bucket rate limiter for API calls."""

    def __init__(self, rate: float, burst: int = 1):
        """
        Args:
            rate: Tokens added per second.
            burst: Maximum tokens in the bucket.
        """
        self.rate = rate
        self.burst = burst
        self._tokens = float(burst)
        self._last_refill = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self):
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_refill
            self._tokens = min(self.burst, self._tokens + elapsed * self.rate)
            self._last_refill = now

            if self._tokens < 1:
                wait = (1 - self._tokens) / self.rate
                await asyncio.sleep(wait)
                self._tokens = 0
            else:
                self._tokens -= 1
