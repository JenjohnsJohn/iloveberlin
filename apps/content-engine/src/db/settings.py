"""Centralized settings helpers — read/write EngineSetting from DB."""

import json
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from src.db.engine import async_session
from src.db.models import EngineSetting, SettingChangeLog


async def get_setting(key: str, default: str = "") -> str:
    async with async_session() as session:
        result = await session.execute(
            select(EngineSetting.value).where(EngineSetting.key == key)
        )
        val = result.scalar_one_or_none()
        return val if val is not None else default


async def get_bool_setting(key: str, default: bool = False) -> bool:
    val = await get_setting(key, str(default).lower())
    return val.lower() in ("true", "1", "yes")


async def get_int_setting(key: str, default: int = 0) -> int:
    val = await get_setting(key, str(default))
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


async def get_float_setting(key: str, default: float = 0.0) -> float:
    val = await get_setting(key, str(default))
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


async def get_json_setting(key: str, default: list | dict | None = None) -> list | dict:
    val = await get_setting(key, "")
    if not val:
        return default if default is not None else []
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else []


async def set_setting(key: str, value: str, description: str = ""):
    """Upsert a setting, logging the change if the value differs."""
    async with async_session() as session:
        # Phase 4.6: read old value for audit trail
        result = await session.execute(
            select(EngineSetting.value).where(EngineSetting.key == key)
        )
        old_value = result.scalar_one_or_none()

        await session.execute(
            pg_insert(EngineSetting)
            .values(key=key, value=value, description=description)
            .on_conflict_do_update(
                index_elements=["key"],
                set_={"value": value, "updated_at": datetime.now(timezone.utc)},
            )
        )

        # Log change if value actually changed
        if old_value is not None and old_value != value:
            session.add(SettingChangeLog(
                key=key,
                old_value=old_value,
                new_value=value,
            ))

        await session.commit()


async def get_all_settings() -> dict[str, EngineSetting]:
    async with async_session() as session:
        result = await session.execute(select(EngineSetting))
        return {s.key: s for s in result.scalars().all()}


async def get_settings_by_prefix(prefix: str) -> dict[str, str]:
    async with async_session() as session:
        result = await session.execute(
            select(EngineSetting).where(EngineSetting.key.startswith(prefix))
        )
        return {s.key: s.value for s in result.scalars().all()}
