"""Initial schema + Phase 1 additions (PipelineRun, failure classification, backoff)

Revision ID: 001
Revises: None
Create Date: 2026-03-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Existing tables (create if not exists) ---

    op.create_table(
        "pipeline_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("content_type", sa.String(50), nullable=False, index=True),
        sa.Column("source_type", sa.String(50), nullable=False),
        sa.Column("source_id", sa.String(500)),
        sa.Column("raw_data", postgresql.JSONB, nullable=False),
        sa.Column("enriched_data", postgresql.JSONB),
        sa.Column("status", sa.String(20), default="fetched", index=True),
        sa.Column("error_message", sa.Text),
        sa.Column("push_attempts", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        # Phase 1.4 additions
        sa.Column("last_status_code", sa.Integer),
        sa.Column("next_retry_at", sa.DateTime(timezone=True)),
        if_not_exists=True,
    )

    op.create_table(
        "dedup_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("content_type", sa.String(50), nullable=False),
        sa.Column("fingerprint", sa.String(64), nullable=False),
        sa.Column("source_id", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.UniqueConstraint("content_type", "fingerprint", name="uq_dedup_type_fp"),
        if_not_exists=True,
    )

    op.create_table(
        "push_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("pipeline_item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("content_type", sa.String(50), nullable=False),
        sa.Column("api_entity_id", sa.String(100)),
        sa.Column("api_endpoint", sa.String(200)),
        sa.Column("status_code", sa.Integer),
        sa.Column("pushed_at", sa.DateTime(timezone=True)),
        # Phase 4.2 additions
        sa.Column("request_payload", postgresql.JSONB),
        sa.Column("response_body", sa.Text),
        if_not_exists=True,
    )

    op.create_table(
        "engine_settings",
        sa.Column("key", sa.String(100), primary_key=True),
        sa.Column("value", sa.Text, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        if_not_exists=True,
    )

    # --- Phase 2.1: Pipeline run history ---

    op.create_table(
        "pipeline_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("pipeline_name", sa.String(100), nullable=False, index=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
        sa.Column("status", sa.String(20), nullable=False, default="running"),
        sa.Column("items_fetched", sa.Integer, default=0),
        sa.Column("items_new", sa.Integer, default=0),
        sa.Column("items_enriched", sa.Integer, default=0),
        sa.Column("items_pushed", sa.Integer, default=0),
        sa.Column("error_message", sa.Text),
        if_not_exists=True,
    )

    # --- Phase 4.6: Settings audit trail ---

    op.create_table(
        "setting_change_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("key", sa.String(100), nullable=False, index=True),
        sa.Column("old_value", sa.Text),
        sa.Column("new_value", sa.Text),
        sa.Column("changed_at", sa.DateTime(timezone=True)),
        if_not_exists=True,
    )

    # --- Add new columns to existing tables (safe with try/except) ---
    # For first-time setup these are already in create_table above.
    # For existing databases, we need to add them.

    try:
        op.add_column("pipeline_items", sa.Column("last_status_code", sa.Integer))
    except Exception:
        pass

    try:
        op.add_column("pipeline_items", sa.Column("next_retry_at", sa.DateTime(timezone=True)))
    except Exception:
        pass

    try:
        op.add_column("push_log", sa.Column("request_payload", postgresql.JSONB))
    except Exception:
        pass

    try:
        op.add_column("push_log", sa.Column("response_body", sa.Text))
    except Exception:
        pass


def downgrade() -> None:
    op.drop_table("setting_change_log")
    op.drop_table("pipeline_runs")
    try:
        op.drop_column("pipeline_items", "last_status_code")
        op.drop_column("pipeline_items", "next_retry_at")
    except Exception:
        pass
    try:
        op.drop_column("push_log", "request_payload")
        op.drop_column("push_log", "response_body")
    except Exception:
        pass
