# Schema: Classifieds

> Domain: `classifieds`
> Tables: `classified_categories`, `classifieds`, `classified_images`, `classified_messages`, `classified_reports`

---

## Overview

The classifieds section is a community marketplace where users post ads (apartments, jobs, items for sale, services). It includes buyer-seller messaging, image galleries, moderation with reporting, and auto-expiration. Classified ads require moderation approval before going live.

---

## Table: `classified_categories`

Categories specific to the classifieds marketplace. Separate from the shared `categories` table because classifieds have distinct taxonomy needs (icons for visual browsing, no hierarchy).

### SQL

```sql
CREATE TABLE classified_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  icon       VARCHAR(50),
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(100) | NO | -- | Category name, e.g., "Housing" |
| `slug` | VARCHAR(120) | NO | -- | URL slug, unique |
| `icon` | VARCHAR(50) | YES | `NULL` | Icon identifier for UI, e.g., "home", "briefcase" |
| `sort_order` | INTEGER | NO | `0` | Display ordering |

### Indexes

```sql
-- Slug covered by UNIQUE constraint
CREATE INDEX idx_classified_categories_sort
  ON classified_categories (sort_order);
```

---

## Table: `classifieds`

Individual classified ads posted by users.

### SQL

```sql
CREATE TYPE classified_contact_method AS ENUM ('platform_message', 'email', 'phone', 'whatsapp');
CREATE TYPE classified_status AS ENUM ('draft', 'pending_review', 'active', 'rejected', 'expired', 'sold', 'archived');

CREATE TABLE classifieds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) NOT NULL,
  description     TEXT NOT NULL,
  price           DECIMAL(12, 2),
  category_id     UUID NOT NULL,
  user_id         UUID NOT NULL,
  district        VARCHAR(50),
  contact_method  classified_contact_method NOT NULL DEFAULT 'platform_message',
  status          classified_status NOT NULL DEFAULT 'draft',
  moderator_notes TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,

  CONSTRAINT fk_classifieds_category
    FOREIGN KEY (category_id) REFERENCES classified_categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_classifieds_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_classifieds_price
    CHECK (price IS NULL OR price >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `title` | VARCHAR(200) | NO | -- | Ad title, e.g., "2-room apartment in Prenzlauer Berg" |
| `slug` | VARCHAR(220) | NO | -- | URL slug |
| `description` | TEXT | NO | -- | Full ad description |
| `price` | DECIMAL(12,2) | YES | `NULL` | Price in EUR. NULL for "price on request" or free items |
| `category_id` | UUID | NO | -- | FK to `classified_categories` |
| `user_id` | UUID | NO | -- | FK to `users` -- the poster |
| `district` | VARCHAR(50) | YES | `NULL` | Berlin district where the item/service is located |
| `contact_method` | `classified_contact_method` | NO | `'platform_message'` | How buyers should contact the seller |
| `status` | `classified_status` | NO | `'draft'` | Moderation and lifecycle state |
| `moderator_notes` | TEXT | YES | `NULL` | Internal notes from moderators (not visible to users) |
| `featured` | BOOLEAN | NO | `FALSE` | Whether the ad is promoted/featured |
| `expires_at` | TIMESTAMPTZ | NO | -- | Auto-expiration date (typically 30 days from approval) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Constraints & Indexes

```sql
-- Unique slug among active classifieds
CREATE UNIQUE INDEX uq_classifieds_slug_active
  ON classifieds (slug)
  WHERE deleted_at IS NULL;

-- Active listings browse (main classifieds page)
CREATE INDEX idx_classifieds_active
  ON classifieds (created_at DESC)
  WHERE deleted_at IS NULL AND status = 'active';
-- Rationale: Default sort is newest first.

-- Browse by category
CREATE INDEX idx_classifieds_category
  ON classifieds (category_id, created_at DESC)
  WHERE deleted_at IS NULL AND status = 'active';

-- Browse by district
CREATE INDEX idx_classifieds_district
  ON classifieds (district, created_at DESC)
  WHERE deleted_at IS NULL AND status = 'active';

-- Featured classifieds (homepage widget)
CREATE INDEX idx_classifieds_featured
  ON classifieds (created_at DESC)
  WHERE deleted_at IS NULL AND status = 'active' AND featured = TRUE;

-- User's classifieds (profile: "my ads")
CREATE INDEX idx_classifieds_user
  ON classifieds (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Moderation queue
CREATE INDEX idx_classifieds_pending
  ON classifieds (created_at ASC)
  WHERE status = 'pending_review' AND deleted_at IS NULL;

-- Expiration job (cron: set status = 'expired' WHERE expires_at <= now())
CREATE INDEX idx_classifieds_expires
  ON classifieds (expires_at)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_classifieds_fts
  ON classifieds USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  );

-- Price range filtering
CREATE INDEX idx_classifieds_price
  ON classifieds (price ASC NULLS LAST)
  WHERE deleted_at IS NULL AND status = 'active';
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `category_id` | `classified_categories(id)` | RESTRICT | Cannot delete a category that has ads |
| `user_id` | `users(id)` | CASCADE | User deletion removes their ads |

### Status Lifecycle

```
draft --> pending_review --> active --> expired
              |                |          |
              v                v          v
           rejected          sold      archived
```

---

## Table: `classified_images`

Image gallery for a classified ad. Each ad can have multiple images.

### SQL

```sql
CREATE TABLE classified_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classified_id UUID NOT NULL,
  media_id      UUID NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT fk_classified_images_classified
    FOREIGN KEY (classified_id) REFERENCES classifieds (id) ON DELETE CASCADE,
  CONSTRAINT fk_classified_images_media
    FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Classified's images, ordered
CREATE INDEX idx_classified_images_classified
  ON classified_images (classified_id, sort_order);
```

---

## Table: `classified_messages`

Direct messaging between classified ad posters and interested buyers/renters. Messages are tied to a specific classified for context.

### SQL

```sql
CREATE TABLE classified_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classified_id UUID NOT NULL,
  sender_id     UUID NOT NULL,
  receiver_id   UUID NOT NULL,
  message       TEXT NOT NULL,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_classified_messages_classified
    FOREIGN KEY (classified_id) REFERENCES classifieds (id) ON DELETE CASCADE,
  CONSTRAINT fk_classified_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_classified_messages_receiver
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_classified_messages_sender_receiver
    CHECK (sender_id != receiver_id)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `classified_id` | UUID | NO | -- | FK to `classifieds` -- the ad being discussed |
| `sender_id` | UUID | NO | -- | FK to `users` -- who sent the message |
| `receiver_id` | UUID | NO | -- | FK to `users` -- who receives the message |
| `message` | TEXT | NO | -- | Message body (plain text, no HTML) |
| `read_at` | TIMESTAMPTZ | YES | `NULL` | When the receiver read the message |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the message was sent |

### Indexes

```sql
-- Conversation thread for a classified (between two users)
CREATE INDEX idx_classified_messages_thread
  ON classified_messages (classified_id, sender_id, receiver_id, created_at ASC);
-- Rationale: Loads the message history between two users about a specific ad.

-- User's inbox (unread messages)
CREATE INDEX idx_classified_messages_inbox
  ON classified_messages (receiver_id, created_at DESC)
  WHERE read_at IS NULL;
-- Rationale: "You have N unread messages" badge + inbox listing.

-- User's sent messages
CREATE INDEX idx_classified_messages_sent
  ON classified_messages (sender_id, created_at DESC);
```

### Design Decisions

1. **Tied to classified:** Every message is associated with a classified ad. This provides context ("Which apartment are they asking about?") and allows cleanup when the ad is deleted.
2. **No thread/conversation entity:** Messages are flat, not grouped into threads. The UI groups by `(classified_id, other_user_id)` to show conversation threads. This is simpler than a separate `conversations` table for this use case.
3. **CASCADE on all FKs:** Deleting a classified removes all messages. Deleting a user removes their sent and received messages (GDPR).
4. **CHECK constraint:** Prevents a user from messaging themselves.
5. **No `updated_at` / `deleted_at`:** Messages are immutable after sending. Deletion is hard (GDPR erasure).

---

## Table: `classified_reports`

Abuse reports submitted by users against classified ads. Supports a moderation workflow.

### SQL

```sql
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'action_taken', 'dismissed');

CREATE TABLE classified_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classified_id   UUID NOT NULL,
  reporter_id     UUID NOT NULL,
  reason          TEXT NOT NULL,
  status          report_status NOT NULL DEFAULT 'pending',
  moderator_notes TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ,

  CONSTRAINT fk_classified_reports_classified
    FOREIGN KEY (classified_id) REFERENCES classifieds (id) ON DELETE CASCADE,
  CONSTRAINT fk_classified_reports_reporter
    FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE SET NULL
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `classified_id` | UUID | NO | -- | FK to `classifieds` -- the reported ad |
| `reporter_id` | UUID | NO | -- | FK to `users` -- who reported it |
| `reason` | TEXT | NO | -- | Why the user is reporting (freeform text) |
| `status` | `report_status` | NO | `'pending'` | Moderation state |
| `moderator_notes` | TEXT | YES | `NULL` | Internal moderator notes |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the report was filed |
| `resolved_at` | TIMESTAMPTZ | YES | `NULL` | When a moderator resolved the report |

### Indexes

```sql
-- Pending reports (moderation queue)
CREATE INDEX idx_classified_reports_pending
  ON classified_reports (created_at ASC)
  WHERE status = 'pending';
-- Rationale: Moderators see oldest unresolved reports first.

-- Reports per classified (admin: "how many reports does this ad have?")
CREATE INDEX idx_classified_reports_classified
  ON classified_reports (classified_id);

-- Reporter's reports (detect serial reporters / abuse of reporting)
CREATE INDEX idx_classified_reports_reporter
  ON classified_reports (reporter_id, created_at DESC);
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `classified_id` | `classifieds(id)` | CASCADE | If the ad is removed, reports are moot |
| `reporter_id` | `users(id)` | SET NULL | Keep the report even if reporter account is deleted |

### Design Decisions

1. **SET NULL on reporter deletion:** Reports should persist for audit purposes even if the reporter deletes their account. The report reason and moderation notes remain.
2. **No unique constraint on (classified_id, reporter_id):** A user could theoretically report the same ad for different reasons (e.g., "misleading photos" and later "scam"). The application may enforce a rate limit (max 1 report per user per ad per 24 hours).
3. **`resolved_at` + `status`:** The `resolved_at` timestamp provides a clear record of when moderation acted, separate from the status change.

---

## Example Seed Data

```sql
-- Classified categories
INSERT INTO classified_categories (id, name, slug, icon, sort_order) VALUES
  ('80000000-0000-0000-0000-000000000001', 'Housing',          'housing',          'home',       1),
  ('80000000-0000-0000-0000-000000000002', 'Jobs',             'jobs',             'briefcase',  2),
  ('80000000-0000-0000-0000-000000000003', 'For Sale',         'for-sale',         'tag',        3),
  ('80000000-0000-0000-0000-000000000004', 'Services',         'services',         'wrench',     4),
  ('80000000-0000-0000-0000-000000000005', 'Community',        'community',        'users',      5),
  ('80000000-0000-0000-0000-000000000006', 'Language Exchange', 'language-exchange','chat',       6),
  ('80000000-0000-0000-0000-000000000007', 'Lost & Found',     'lost-and-found',   'search',     7);

-- Sample classifieds
INSERT INTO classifieds (
  id, title, slug, description, price, category_id, user_id,
  district, contact_method, status, featured, expires_at
) VALUES
(
  '81000000-0000-0000-0000-000000000001',
  'Bright 2-Room Apartment in Prenzlauer Berg - Zwischenmiete',
  'bright-2-room-apartment-prenzlauer-berg-zwischenmiete',
  'Beautiful furnished 2-room apartment (55m2) available for sublet from April 1 to July 31, 2026. The apartment is on the 3rd floor of a lovely Altbau building on a quiet street. Features: high ceilings, hardwood floors, fully equipped kitchen, washing machine, balcony facing the courtyard. Close to Helmholtzplatz and Eberswalder Strasse U-Bahn.',
  950.00,
  '80000000-0000-0000-0000-000000000001',  -- Housing
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',  -- Max Mueller
  'Prenzlauer Berg',
  'platform_message',
  'active',
  FALSE,
  '2026-04-12 00:00:00+01'
),
(
  '81000000-0000-0000-0000-000000000002',
  'English-German Language Exchange Partner Wanted',
  'english-german-language-exchange-partner',
  'Hi! I''m a native English speaker (American) looking for a regular language exchange partner. My German is B1 level and I want to improve. Happy to meet in a cafe in Kreuzberg or Neukolln. I can help with English at any level. Let''s chat!',
  NULL,
  '80000000-0000-0000-0000-000000000006',  -- Language Exchange
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',  -- New User
  'Kreuzberg',
  'platform_message',
  'active',
  FALSE,
  '2026-04-12 00:00:00+01'
);

-- Sample message
INSERT INTO classified_messages (id, classified_id, sender_id, receiver_id, message) VALUES
(
  '82000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000001',
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',  -- New User (inquirer)
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',  -- Max Mueller (poster)
  'Hi Max! I''m interested in your apartment for the April-July sublet. Is it still available? I''m a quiet, non-smoking professional. Could I arrange a viewing this week?'
),
(
  '82000000-0000-0000-0000-000000000002',
  '81000000-0000-0000-0000-000000000001',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',  -- Max Mueller
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',  -- New User
  'Hi! Yes, it''s still available. I can show you the apartment on Wednesday or Thursday evening. Which works better for you?'
);

-- Sample report
INSERT INTO classified_reports (id, classified_id, reporter_id, reason, status) VALUES
(
  '83000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000001',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',  -- Editor reports (unusual, but valid)
  'The listing price seems unusually low for a 2-room in Prenzlauer Berg. May want to verify this is not a scam.',
  'pending'
);
```
