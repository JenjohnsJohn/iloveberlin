"""Reusable retry with exponential backoff for external HTTP calls."""

import asyncio
import random
from typing import TypeVar

import httpx

from src.utils.logging import get_logger

log = get_logger("utils.retry")

T = TypeVar("T")

RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


async def retry_with_backoff(
    func,
    *args,
    max_attempts: int = 3,
    base_delay: float = 2.0,
    retryable_codes: set[int] = RETRYABLE_STATUS_CODES,
    **kwargs,
):
    """Call an async function with exponential backoff on transient failures.

    Retries on:
    - httpx.HTTPStatusError with status in retryable_codes
    - httpx.TimeoutException
    - httpx.ConnectError

    Raises the last exception if all attempts fail.
    """
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            return await func(*args, **kwargs)
        except httpx.HTTPStatusError as e:
            if e.response.status_code not in retryable_codes:
                raise
            last_error = e
        except (httpx.TimeoutException, httpx.ConnectError) as e:
            last_error = e
        except Exception:
            raise

        if attempt < max_attempts:
            delay = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 1)
            log.warning(
                "Retrying after transient failure",
                attempt=attempt,
                max_attempts=max_attempts,
                delay=f"{delay:.1f}s",
                error=str(last_error)[:200],
            )
            await asyncio.sleep(delay)

    raise last_error
