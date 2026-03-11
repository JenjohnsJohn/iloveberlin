# Schema: Competitions

> Domain: `competitions`
> Tables: `competitions`, `competition_entries`

---

## Overview

Competitions (prize draws, giveaways) are a key engagement feature. Users enter by submitting a form (stored as JSONB), and a winner is selected either randomly or by editorial choice. Each user can enter a competition only once. Competitions have time-bound entry windows and optional entry caps.

---

## Table: `competitions`

Defines a competition with prize details, entry window, terms, and winner tracking.

### SQL

```sql
CREATE TYPE competition_status AS ENUM ('draft', 'active', 'closed', 'winner_selected', 'archived');

CREATE TABLE competitions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               VARCHAR(255) NOT NULL,
  slug                VARCHAR(280) NOT NULL,
  description         TEXT NOT NULL,
  prize_description   TEXT NOT NULL,
  featured_image_id   UUID,
  start_date          TIMESTAMPTZ NOT NULL,
  end_date            TIMESTAMPTZ NOT NULL,
  status              competition_status NOT NULL DEFAULT 'draft',
  terms_conditions    TEXT,
  max_entries         INTEGER,
  winner_id           UUID,
  winner_selected_at  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ,

  CONSTRAINT fk_competitions_featured_image
    FOREIGN KEY (featured_image_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_competitions_winner
    FOREIGN KEY (winner_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_competitions_dates
    CHECK (end_date > start_date),
  CONSTRAINT chk_competitions_max_entries
    CHECK (max_entries IS NULL OR max_entries > 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `title` | VARCHAR(255) | NO | -- | Competition title, e.g., "Win Tickets to Berlin Festival" |
| `slug` | VARCHAR(280) | NO | -- | URL slug |
| `description` | TEXT | NO | -- | Full competition description |
| `prize_description` | TEXT | NO | -- | What the winner receives |
| `featured_image_id` | UUID | YES | `NULL` | FK to `media` for the competition banner |
| `start_date` | TIMESTAMPTZ | NO | -- | When entries open |
| `end_date` | TIMESTAMPTZ | NO | -- | When entries close |
| `status` | `competition_status` | NO | `'draft'` | Lifecycle state |
| `terms_conditions` | TEXT | YES | `NULL` | Legal terms and conditions |
| `max_entries` | INTEGER | YES | `NULL` | Maximum number of entries (NULL = unlimited) |
| `winner_id` | UUID | YES | `NULL` | FK to `users` -- the winner |
| `winner_selected_at` | TIMESTAMPTZ | YES | `NULL` | When the winner was chosen |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Constraints & Indexes

```sql
-- Unique slug among active competitions
CREATE UNIQUE INDEX uq_competitions_slug_active
  ON competitions (slug)
  WHERE deleted_at IS NULL;

-- Active competitions (entry page)
CREATE INDEX idx_competitions_active
  ON competitions (end_date ASC)
  WHERE deleted_at IS NULL AND status = 'active';
-- Rationale: "Show all competitions accepting entries, soonest to close first."

-- All published competitions (listing page)
CREATE INDEX idx_competitions_published
  ON competitions (created_at DESC)
  WHERE deleted_at IS NULL AND status IN ('active', 'closed', 'winner_selected');

-- Scheduled activation: competitions that should be activated
CREATE INDEX idx_competitions_scheduled
  ON competitions (start_date ASC)
  WHERE status = 'draft' AND deleted_at IS NULL;
-- Rationale: A cron job checks for competitions where start_date <= now()
-- and status = 'draft', then sets status = 'active'.
```

### Status Lifecycle

```
draft --> active --> closed --> winner_selected --> archived
                                     |
                                     v
                              (winner_id is set)
```

1. **draft:** Created by admin, not yet visible.
2. **active:** Entry window is open (`start_date <= now() < end_date`).
3. **closed:** Entry window has passed (`now() >= end_date`), winner not yet selected.
4. **winner_selected:** Winner has been chosen and `winner_id` is set.
5. **archived:** Competition is removed from active listings but retained for historical reference.

---

## Table: `competition_entries`

Records each user's entry into a competition. The unique constraint on `(competition_id, user_id)` ensures one entry per user per competition.

### SQL

```sql
CREATE TABLE competition_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL,
  user_id         UUID NOT NULL,
  entry_data      JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_competition_entries_competition
    FOREIGN KEY (competition_id) REFERENCES competitions (id) ON DELETE CASCADE,
  CONSTRAINT fk_competition_entries_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT uq_competition_entries_one_per_user
    UNIQUE (competition_id, user_id)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `competition_id` | UUID | NO | -- | FK to `competitions` |
| `user_id` | UUID | NO | -- | FK to `users` -- the entrant |
| `entry_data` | JSONB | YES | `'{}'` | Freeform entry data (answers to competition questions) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the entry was submitted |

### JSONB Shape: `entry_data`

The shape varies by competition. Examples:

```json
// Simple entry (no additional data required)
{}

// Quiz-based competition
{
  "answer": "Brandenburg Gate",
  "newsletter_opt_in": true
}

// Photo competition
{
  "photo_url": "https://cdn.iloveberlin.biz/uploads/...",
  "caption": "Sunset over the Spree"
}
```

### Indexes

```sql
-- Unique constraint already creates an implicit index on (competition_id, user_id)

-- Competition's entries (admin: list all entrants)
CREATE INDEX idx_competition_entries_competition
  ON competition_entries (competition_id, created_at DESC);
-- Note: The unique index covers competition_id lookups, but adding
-- created_at to the index supports ordered listing without a sort.

-- User's entries (profile: "my competitions")
CREATE INDEX idx_competition_entries_user
  ON competition_entries (user_id, created_at DESC);

-- Random winner selection helper
-- No index needed: SELECT * FROM competition_entries
--   WHERE competition_id = $1 ORDER BY random() LIMIT 1
-- This performs a sequential scan of the competition's entries (typically < 10K rows),
-- which is fast enough.
```

### Design Decisions

1. **Unique constraint `(competition_id, user_id)`:** Prevents double entries at the database level. The application also checks before insert, but the DB constraint is the ultimate guard.

2. **`entry_data` as JSONB:** Competitions have varying entry formats. Some require just a click ("enter to win"), others need answers to questions. JSONB provides flexibility without schema changes for each competition.

3. **CASCADE on both FKs:**
   - Deleting a competition removes all entries (entries are meaningless without the competition).
   - Deleting a user removes their entries (GDPR compliance, and they can no longer win).

4. **`max_entries` enforcement:** The application checks `count(*) FROM competition_entries WHERE competition_id = $1` before inserting. This is a soft limit -- under extreme concurrency, a few extra entries might slip in. A `BEFORE INSERT` trigger could enforce this strictly if needed.

5. **Winner stored on `competitions` table, not on `competition_entries`:** The winner is a property of the competition, not the entry. This avoids scanning entries to find the winner.

### Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| **JSONB entry_data** | Flexible, no schema changes per competition | No column-level validation, harder to query |
| **Typed entry columns** | Strong validation, queryable | Schema migration for each competition type |
| **Winner on competitions** | O(1) winner lookup | Denormalized (winner_id could be derived from entries) |
| **Winner on entries (is_winner flag)** | Normalized | Requires scanning entries to find winner |

---

## TypeORM Entities

### Competition Entity

```typescript
// src/modules/competitions/entities/competition.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';

export enum CompetitionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  WINNER_SELECTED = 'winner_selected',
  ARCHIVED = 'archived',
}

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 280 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  prize_description: string;

  @Column({ type: 'uuid', nullable: true })
  featured_image_id: string | null;

  @Column({ type: 'timestamptz' })
  start_date: Date;

  @Column({ type: 'timestamptz' })
  end_date: Date;

  @Column({ type: 'enum', enum: CompetitionStatus, default: CompetitionStatus.DRAFT })
  status: CompetitionStatus;

  @Column({ type: 'text', nullable: true })
  terms_conditions: string | null;

  @Column({ type: 'int', nullable: true })
  max_entries: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'winner_id' })
  winner: User;

  @Column({ type: 'uuid', nullable: true })
  winner_id: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  winner_selected_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => CompetitionEntry, (entry) => entry.competition)
  entries: CompetitionEntry[];
}
```

---

## Example Seed Data

```sql
-- Active competition
INSERT INTO competitions (
  id, title, slug, description, prize_description,
  start_date, end_date, status, terms_conditions, max_entries
) VALUES (
  '70000000-0000-0000-0000-000000000001',
  'Win 2 Tickets to Berlin Festival of Lights 2026',
  'win-tickets-berlin-festival-of-lights-2026',
  'Berlin''s Festival of Lights transforms the city into an open-air gallery every October. We''re giving away 2 VIP tickets to the opening night, including a guided illumination tour and complimentary drinks.',
  '2x VIP tickets to Berlin Festival of Lights opening night (value EUR 120 each), including guided tour and drinks reception.',
  '2026-03-01 00:00:00+01',
  '2026-03-31 23:59:59+01',
  'active',
  'Open to registered users aged 18+. One entry per person. Winner will be selected at random and notified by email within 7 days of the competition closing. Prize is non-transferable and cannot be exchanged for cash. ILoveBerlin''s decision is final.',
  NULL  -- unlimited entries
);

-- Past competition with winner
INSERT INTO competitions (
  id, title, slug, description, prize_description,
  start_date, end_date, status, winner_id, winner_selected_at
) VALUES (
  '70000000-0000-0000-0000-000000000002',
  'Win a Dinner for Two at CODA',
  'win-dinner-for-two-coda-2026',
  'Experience the extraordinary dessert tasting menu at CODA, Berlin''s two Michelin-starred dessert restaurant. We''re giving away a dinner for two with wine pairing.',
  'Dinner for two at CODA with full wine pairing (value EUR 450).',
  '2026-01-15 00:00:00+01',
  '2026-02-15 23:59:59+01',
  'winner_selected',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',  -- Max Mueller won
  '2026-02-20 14:30:00+01'
);

-- Competition entries
INSERT INTO competition_entries (id, competition_id, user_id, entry_data) VALUES
(
  '71000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  '{"newsletter_opt_in": true}'
),
(
  '71000000-0000-0000-0000-000000000002',
  '70000000-0000-0000-0000-000000000001',
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  '{"newsletter_opt_in": false}'
),
(
  '71000000-0000-0000-0000-000000000003',
  '70000000-0000-0000-0000-000000000002',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  '{}'
);
```
