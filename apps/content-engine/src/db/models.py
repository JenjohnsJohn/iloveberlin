import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PipelineItem(Base):
    __tablename__ = "pipeline_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    content_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(500))
    raw_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    enriched_data: Mapped[dict | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(20), default="fetched", index=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    push_attempts: Mapped[int] = mapped_column(Integer, default=0)
    # Phase 1.4: failure classification + backoff
    last_status_code: Mapped[int | None] = mapped_column(Integer)
    next_retry_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class DedupLog(Base):
    __tablename__ = "dedup_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (UniqueConstraint("content_type", "fingerprint", name="uq_dedup_type_fp"),)


class PushLog(Base):
    __tablename__ = "push_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pipeline_item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    api_entity_id: Mapped[str | None] = mapped_column(String(100))
    api_endpoint: Mapped[str | None] = mapped_column(String(200))
    status_code: Mapped[int | None] = mapped_column(Integer)
    # Phase 4.2: request/response logging
    request_payload: Mapped[dict | None] = mapped_column(JSONB)
    response_body: Mapped[str | None] = mapped_column(Text)
    pushed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class EngineSetting(Base):
    __tablename__ = "engine_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class PipelineRun(Base):
    """Phase 2.1: Track pipeline execution history."""
    __tablename__ = "pipeline_runs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pipeline_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="running")
    items_fetched: Mapped[int] = mapped_column(Integer, default=0)
    items_new: Mapped[int] = mapped_column(Integer, default=0)
    items_enriched: Mapped[int] = mapped_column(Integer, default=0)
    items_pushed: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str | None] = mapped_column(Text)


class SettingChangeLog(Base):
    """Phase 4.6: Audit trail for settings changes."""
    __tablename__ = "setting_change_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    old_value: Mapped[str | None] = mapped_column(Text)
    new_value: Mapped[str | None] = mapped_column(Text)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
