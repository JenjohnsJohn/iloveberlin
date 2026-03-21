"""Shared pipeline concurrency locks.

Provides a single source of truth for the lazy-init asyncio.Lock pattern
used by the scheduler, admin panel, and base pipeline to prevent
overlapping runs of the same pipeline.
"""

import asyncio

_pipeline_locks: dict[str, asyncio.Lock] = {}


def get_pipeline_lock(key: str) -> asyncio.Lock:
    """Return (or lazily create) an asyncio.Lock for the given pipeline key.

    Args:
        key: A unique identifier for the pipeline (e.g. ``"articles_rss"``).

    Returns:
        The ``asyncio.Lock`` associated with *key*.
    """
    if key not in _pipeline_locks:
        _pipeline_locks[key] = asyncio.Lock()
    return _pipeline_locks[key]
