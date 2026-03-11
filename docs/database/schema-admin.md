# Schema: Admin

> Domain: `admin`
> Tables: `admin_activity_log`, `homepage_featured`, `ad_campaigns`, `ad_placements`, `notification_preferences`

---

## Overview

The admin domain covers platform operations: audit logging, homepage curation, advertising management, and user notification preferences. These tables support the admin dashboard and background operations.

---

## Table: `admin_activity_log`

Immutable audit trail for all admin and editor actions. Every create, update, delete, approve, or reject action by a privileged user is logged here.

### SQL

```sql
CREATE TABLE admin_activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  action      VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   UUID,
  details     JSONB DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_admin_activity_log_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | YES | `NULL` | FK to `users` -- the admin/editor who performed the action |
| `action` | VARCHAR(50) | NO | -- | Action type: `'create'`, `'update'`, `'delete'`, `'publish'`, `'approve'`, `'reject'`, `'login'`, `'password_change'`, etc. |
| `entity_type` | VARCHAR(50) | NO | -- | Affected entity: `'article'`, `'event'`, `'user'`, `'classified'`, etc. |
| `entity_id` | UUID | YES | `NULL` | ID of the affected entity. NULL for actions without a specific entity (e.g., `'login'`) |
| `details` | JSONB | YES | `'{}'` | Additional context about the action |
| `ip_address` | INET | YES | `NULL` | IP address of the request |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the action occurred |

### JSONB Shape: `details`

```json
// Article published
{
  "title": "Berlin Street Art Guide",
  "previous_status": "draft",
  "new_status": "published"
}

// User role changed
{
  "email": "editor@iloveberlin.biz",
  "previous_role": "user",
  "new_role": "editor"
}

// Classified rejected
{
  "title": "Suspicious listing",
  "reason": "Potential scam - reported by 3 users"
}
```

### Indexes

```sql
-- Recent activity (admin dashboard feed)
CREATE INDEX idx_admin_activity_log_created
  ON admin_activity_log (created_at DESC);

-- Activity by user (audit: "what did this admin do?")
CREATE INDEX idx_admin_activity_log_user
  ON admin_activity_log (user_id, created_at DESC);

-- Activity by entity (audit: "what happened to this article?")
CREATE INDEX idx_admin_activity_log_entity
  ON admin_activity_log (entity_type, entity_id, created_at DESC);

-- Action type filtering (e.g., "show all delete actions")
CREATE INDEX idx_admin_activity_log_action
  ON admin_activity_log (action, created_at DESC);

-- GIN index on details for flexible querying
CREATE INDEX idx_admin_activity_log_details
  ON admin_activity_log USING gin (details);
-- Rationale: Allows queries like "find all actions where details contains
-- a specific email or title." Used sparingly for investigations.
```

### Design Decisions

1. **Append-only / immutable:** Rows are never updated or deleted. This is an audit trail. No `updated_at`, no `deleted_at`.
2. **SET NULL on user delete:** If an admin account is deleted, the log entries persist with `user_id = NULL`. The `details` JSONB may contain the admin's email for identification.
3. **INET for IP address:** PostgreSQL's `INET` type efficiently stores both IPv4 and IPv6 addresses and supports comparison operators.
4. **No index on `ip_address`:** IP-based queries are rare (incident investigation). A full table scan is acceptable for this infrequent use case. An index can be added if needed.
5. **Retention policy:** Logs are retained for 2 years. A cron job deletes records older than `now() - INTERVAL '2 years'`.

---

## Table: `homepage_featured`

Admin-curated content for the homepage. Editors select which articles, events, or other content appear in featured homepage sections.

### SQL

```sql
CREATE TYPE homepage_section AS ENUM (
  'hero',
  'featured_articles',
  'featured_events',
  'featured_restaurants',
  'featured_videos',
  'editors_pick',
  'trending'
);

CREATE TABLE homepage_featured (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section      homepage_section NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_id   UUID NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `section` | `homepage_section` | NO | -- | Which homepage section this belongs to |
| `content_type` | VARCHAR(50) | NO | -- | Entity type: `'article'`, `'event'`, `'restaurant'`, `'video'` |
| `content_id` | UUID | NO | -- | ID of the featured entity |
| `sort_order` | INTEGER | NO | `0` | Display order within the section |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the feature was created |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |

### Indexes

```sql
-- Homepage rendering: load all items for a section, ordered
CREATE INDEX idx_homepage_featured_section
  ON homepage_featured (section, sort_order);

-- Prevent duplicate content in the same section
CREATE UNIQUE INDEX uq_homepage_featured_content
  ON homepage_featured (section, content_type, content_id);
```

### Design Decisions

1. **Polymorphic reference:** Like `user_bookmarks`, the `content_type` + `content_id` pattern avoids separate tables per content type. No FK on `content_id` -- the application validates references.
2. **No `deleted_at`:** Featured items are removed by hard delete. The homepage is a live curation surface, not an archive.
3. **Section enum:** Limits sections to known values. Adding a new section requires a migration (enum alteration). This is intentional -- homepage sections are structural and should be deliberate.

---

## Table: `ad_campaigns`

Advertising campaigns sold to local businesses or managed internally.

### SQL

```sql
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

CREATE TABLE ad_campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  advertiser  VARCHAR(200) NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  budget      DECIMAL(10, 2),
  status      campaign_status NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_ad_campaigns_dates
    CHECK (end_date >= start_date),
  CONSTRAINT chk_ad_campaigns_budget
    CHECK (budget IS NULL OR budget >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(200) | NO | -- | Campaign name, e.g., "Spring 2026 - Berghain Promo" |
| `advertiser` | VARCHAR(200) | NO | -- | Advertiser/client name |
| `start_date` | DATE | NO | -- | Campaign start date |
| `end_date` | DATE | NO | -- | Campaign end date |
| `budget` | DECIMAL(10,2) | YES | `NULL` | Campaign budget in EUR |
| `status` | `campaign_status` | NO | `'draft'` | Campaign lifecycle state |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |

### Indexes

```sql
-- Active campaigns (ad serving)
CREATE INDEX idx_ad_campaigns_active
  ON ad_campaigns (start_date, end_date)
  WHERE status = 'active';

-- Campaigns by advertiser (account management)
CREATE INDEX idx_ad_campaigns_advertiser
  ON ad_campaigns (advertiser);

-- Campaign status (admin dashboard)
CREATE INDEX idx_ad_campaigns_status
  ON ad_campaigns (status, start_date DESC);
```

---

## Table: `ad_placements`

Individual ad slots within a campaign. Each placement specifies where the ad appears, the creative, and tracks performance (impressions, clicks).

### SQL

```sql
CREATE TYPE ad_position AS ENUM (
  'homepage_hero',
  'homepage_sidebar',
  'article_top',
  'article_inline',
  'article_sidebar',
  'events_sidebar',
  'dining_sidebar',
  'footer_banner'
);

CREATE TABLE ad_placements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL,
  position     ad_position NOT NULL,
  image_url    VARCHAR(500) NOT NULL,
  target_url   VARCHAR(500) NOT NULL,
  impressions  INTEGER NOT NULL DEFAULT 0,
  clicks       INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_ad_placements_campaign
    FOREIGN KEY (campaign_id) REFERENCES ad_campaigns (id) ON DELETE CASCADE,
  CONSTRAINT chk_ad_placements_impressions
    CHECK (impressions >= 0),
  CONSTRAINT chk_ad_placements_clicks
    CHECK (clicks >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `campaign_id` | UUID | NO | -- | FK to `ad_campaigns` |
| `position` | `ad_position` | NO | -- | Where the ad appears on the site |
| `image_url` | VARCHAR(500) | NO | -- | URL to the ad creative image |
| `target_url` | VARCHAR(500) | NO | -- | Click-through destination URL |
| `impressions` | INTEGER | NO | `0` | Number of times the ad was displayed |
| `clicks` | INTEGER | NO | `0` | Number of times the ad was clicked |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |

### Indexes

```sql
-- Placements for a campaign
CREATE INDEX idx_ad_placements_campaign
  ON ad_placements (campaign_id);

-- Active placements by position (ad serving query)
-- Requires joining to ad_campaigns for status and date checks
CREATE INDEX idx_ad_placements_position
  ON ad_placements (position);
```

### Design Decisions

1. **Impression/click counters:** Updated atomically with `UPDATE ad_placements SET impressions = impressions + 1`. For high-traffic pages, consider buffering counts in Redis and flushing to PostgreSQL periodically.
2. **`image_url` not `media_id`:** Ad creatives are uploaded by advertisers and may not go through the platform's media pipeline. Direct URL reference is simpler.
3. **CASCADE on campaign delete:** Removing a campaign removes all its placements and performance data.

---

## Table: `notification_preferences`

Per-user notification settings. One row per user. Controls what emails and push notifications the user receives.

### SQL

```sql
CREATE TABLE notification_preferences (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE,
  email_new_articles  BOOLEAN NOT NULL DEFAULT TRUE,
  email_competitions  BOOLEAN NOT NULL DEFAULT TRUE,
  push_events         BOOLEAN NOT NULL DEFAULT TRUE,
  push_articles       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_notification_preferences_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | -- | FK to `users`, unique (1:1 relationship) |
| `email_new_articles` | BOOLEAN | NO | `TRUE` | Receive email when new articles are published |
| `email_competitions` | BOOLEAN | NO | `TRUE` | Receive email about new competitions |
| `push_events` | BOOLEAN | NO | `TRUE` | Receive push notifications for upcoming events |
| `push_articles` | BOOLEAN | NO | `FALSE` | Receive push notifications for new articles |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |

### Indexes

```sql
-- user_id is already covered by the UNIQUE constraint

-- Users opted into specific notifications (batch email sending)
CREATE INDEX idx_notification_prefs_email_articles
  ON notification_preferences (user_id)
  WHERE email_new_articles = TRUE;

CREATE INDEX idx_notification_prefs_email_competitions
  ON notification_preferences (user_id)
  WHERE email_competitions = TRUE;

CREATE INDEX idx_notification_prefs_push_events
  ON notification_preferences (user_id)
  WHERE push_events = TRUE;
```

### Design Decisions

1. **1:1 relationship with users:** Each user has exactly one preferences row. Created automatically on user registration via a database trigger or application hook.
2. **CASCADE on user delete:** Preferences are meaningless without the user.
3. **Boolean columns, not JSONB:** Each preference is a discrete column for indexed querying. The batch email job queries `WHERE email_new_articles = TRUE` and joins to `users` -- this requires an indexable column, not a JSONB key.
4. **Sensible defaults:** Email notifications are opt-in by default (TRUE), push notifications for articles are opt-out (FALSE) to avoid notification fatigue.

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Individual boolean columns (chosen)** | Indexable, queryable, explicit defaults | Schema change for new preference types |
| **JSONB preferences** | Flexible, no migrations for new types | Not indexable for batch queries |
| **Separate notification_types table** | Highly normalized | Over-engineered for ~5 preferences |

---

## TypeORM Entities

### AdminActivityLog Entity

```typescript
// src/modules/admin/entities/admin-activity-log.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';

@Entity('admin_activity_log')
export class AdminActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50 })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string | null;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, any>;

  @Column({ type: 'inet', nullable: true })
  ip_address: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
```

---

## Example Seed Data

```sql
-- Admin activity log entries
INSERT INTO admin_activity_log (id, user_id, action, entity_type, entity_id, details, ip_address) VALUES
(
  'aa000000-0000-0000-0000-000000000001',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'create',
  'user',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '{"email": "editor@iloveberlin.biz", "role": "editor"}',
  '192.168.1.1'
),
(
  'aa000000-0000-0000-0000-000000000002',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'publish',
  'article',
  'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  '{"title": "The Ultimate Guide to Berlin''s Street Art Scene", "previous_status": "draft", "new_status": "published"}',
  '192.168.1.2'
),
(
  'aa000000-0000-0000-0000-000000000003',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'approve',
  'event',
  '41000000-0000-0000-0000-000000000001',
  '{"title": "Berlin Philharmonic: Spring Concert Series", "previous_status": "pending_review", "new_status": "published"}',
  '192.168.1.1'
);

-- Homepage featured content
INSERT INTO homepage_featured (id, section, content_type, content_id, sort_order) VALUES
  ('ab000000-0000-0000-0000-000000000001', 'hero',              'article',    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 1),
  ('ab000000-0000-0000-0000-000000000002', 'featured_events',   'event',      '41000000-0000-0000-0000-000000000001', 1),
  ('ab000000-0000-0000-0000-000000000003', 'featured_events',   'event',      '41000000-0000-0000-0000-000000000002', 2),
  ('ab000000-0000-0000-0000-000000000004', 'featured_restaurants','restaurant','a1234567-1234-1234-1234-123456789abd', 1),
  ('ab000000-0000-0000-0000-000000000005', 'featured_videos',   'video',      '61000000-0000-0000-0000-000000000001', 1),
  ('ab000000-0000-0000-0000-000000000006', 'editors_pick',      'article',    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 1);

-- Ad campaign
INSERT INTO ad_campaigns (id, name, advertiser, start_date, end_date, budget, status) VALUES
(
  'ac000000-0000-0000-0000-000000000001',
  'Spring 2026 - Berlin Philharmonic',
  'Berliner Philharmoniker GmbH',
  '2026-03-01',
  '2026-04-30',
  5000.00,
  'active'
);

-- Ad placements
INSERT INTO ad_placements (id, campaign_id, position, image_url, target_url, impressions, clicks) VALUES
(
  'ad000000-0000-0000-0000-000000000001',
  'ac000000-0000-0000-0000-000000000001',
  'homepage_sidebar',
  'https://cdn.iloveberlin.biz/ads/philharmonic-spring-2026-sidebar.jpg',
  'https://www.berliner-philharmoniker.de/en/concerts/calendar/',
  12450,
  234
),
(
  'ad000000-0000-0000-0000-000000000002',
  'ac000000-0000-0000-0000-000000000001',
  'events_sidebar',
  'https://cdn.iloveberlin.biz/ads/philharmonic-spring-2026-events.jpg',
  'https://www.berliner-philharmoniker.de/en/concerts/calendar/',
  8320,
  187
);

-- Notification preferences
INSERT INTO notification_preferences (id, user_id, email_new_articles, email_competitions, push_events, push_articles) VALUES
  ('ae000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', FALSE, FALSE, FALSE, FALSE),  -- Admin: no notifications
  ('ae000000-0000-0000-0000-000000000002', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', TRUE,  TRUE,  TRUE,  TRUE),   -- Editor: all on
  ('ae000000-0000-0000-0000-000000000003', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', TRUE,  TRUE,  TRUE,  FALSE),  -- User: default
  ('ae000000-0000-0000-0000-000000000004', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', TRUE,  TRUE,  TRUE,  FALSE);  -- New user: default
```
