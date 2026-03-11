# Schema: Events

> Domain: `events`
> Tables: `venues`, `events`

---

## Overview

Berlin's event scene is central to the platform. Events can be submitted by users and require editorial approval. The schema supports one-time and recurring events via the iCalendar RRULE standard. Events reference venues (reusable locations) and the shared `categories` table (type = 'event').

---

## Table: `venues`

Reusable venue records. A single venue (e.g., "Berghain", "Tempodrom") can host many events. Venues include geolocation data for map display.

### SQL

```sql
CREATE TABLE venues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(220) NOT NULL UNIQUE,
  address     VARCHAR(300) NOT NULL,
  district    VARCHAR(50),
  latitude    DECIMAL(9, 6),
  longitude   DECIMAL(9, 6),
  website     VARCHAR(500),
  phone       VARCHAR(30),
  capacity    INTEGER,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_venues_latitude
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  CONSTRAINT chk_venues_longitude
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  CONSTRAINT chk_venues_capacity
    CHECK (capacity IS NULL OR capacity > 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(200) | NO | -- | Venue name, e.g., "Tempodrom" |
| `slug` | VARCHAR(220) | NO | -- | URL slug, unique |
| `address` | VARCHAR(300) | NO | -- | Full street address |
| `district` | VARCHAR(50) | YES | `NULL` | Berlin district (Bezirk): Mitte, Kreuzberg, etc. |
| `latitude` | DECIMAL(9,6) | YES | `NULL` | GPS latitude for map pin |
| `longitude` | DECIMAL(9,6) | YES | `NULL` | GPS longitude for map pin |
| `website` | VARCHAR(500) | YES | `NULL` | Venue website URL |
| `phone` | VARCHAR(30) | YES | `NULL` | Contact phone number |
| `capacity` | INTEGER | YES | `NULL` | Maximum capacity (for filtering) |
| `description` | TEXT | YES | `NULL` | About the venue |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |

### Indexes

```sql
-- Slug covered by UNIQUE constraint

-- District filtering (e.g., "venues in Kreuzberg")
CREATE INDEX idx_venues_district
  ON venues (district);

-- Name search (autocomplete when creating events)
CREATE INDEX idx_venues_name_trgm
  ON venues USING gin (name gin_trgm_ops);
-- Rationale: When an editor creates an event, they search for the venue
-- by partial name. Trigram GIN supports fast ILIKE queries.

-- Geo proximity queries
CREATE INDEX idx_venues_geo
  ON venues (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
-- Rationale: "Events near me" feature. For true geo-queries at scale,
-- PostGIS would be preferred. For Berlin-only scope, simple lat/lng
-- range filtering is sufficient.
```

### Design Decisions

1. **No soft delete on venues:** Venues are reference data. If a venue closes permanently, it is kept for historical event records but marked via description or a future `is_closed` flag. Deleting a venue would orphan events.
2. **No PostGIS:** The platform is Berlin-focused. Simple decimal lat/lng with range queries (`WHERE lat BETWEEN x AND y`) is adequate. PostGIS can be added later if needed for radius-based search.
3. **District as VARCHAR, not FK:** Berlin has 12 districts (Bezirke), but freeform entry handles edge cases (e.g., "Kreuzberg / Neuk`olln border"). A CHECK constraint could enforce known districts, but flexibility is preferred.

---

## Table: `events`

Event listings with support for one-time and recurring schedules, free/paid distinction, user submission, and editorial approval.

### SQL

```sql
CREATE TYPE event_status AS ENUM ('draft', 'pending_review', 'approved', 'published', 'rejected', 'cancelled');

CREATE TABLE events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(255) NOT NULL,
  slug               VARCHAR(280) NOT NULL,
  description        TEXT NOT NULL,
  excerpt            TEXT,
  venue_id           UUID,
  category_id        UUID,
  start_date         DATE NOT NULL,
  end_date           DATE,
  start_time         TIME,
  end_time           TIME,
  is_recurring       BOOLEAN NOT NULL DEFAULT FALSE,
  rrule              VARCHAR(500),
  is_free            BOOLEAN NOT NULL DEFAULT FALSE,
  price              DECIMAL(10, 2),
  price_max          DECIMAL(10, 2),
  ticket_url         VARCHAR(500),
  featured_image_id  UUID,
  status             event_status NOT NULL DEFAULT 'draft',
  submitted_by       UUID,
  approved_by        UUID,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ,

  CONSTRAINT fk_events_venue
    FOREIGN KEY (venue_id) REFERENCES venues (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_featured_image
    FOREIGN KEY (featured_image_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_submitted_by
    FOREIGN KEY (submitted_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,

  CONSTRAINT chk_events_dates
    CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT chk_events_price
    CHECK (price IS NULL OR price >= 0),
  CONSTRAINT chk_events_price_max
    CHECK (price_max IS NULL OR price_max >= COALESCE(price, 0)),
  CONSTRAINT chk_events_rrule
    CHECK (
      (is_recurring = FALSE AND rrule IS NULL)
      OR (is_recurring = TRUE AND rrule IS NOT NULL)
    )
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `title` | VARCHAR(255) | NO | -- | Event name |
| `slug` | VARCHAR(280) | NO | -- | URL slug |
| `description` | TEXT | NO | -- | Full event description |
| `excerpt` | TEXT | YES | `NULL` | Short description for cards |
| `venue_id` | UUID | YES | `NULL` | FK to `venues`. NULL for online events |
| `category_id` | UUID | YES | `NULL` | FK to `categories` (type='event') |
| `start_date` | DATE | NO | -- | Event start date |
| `end_date` | DATE | YES | `NULL` | End date for multi-day events |
| `start_time` | TIME | YES | `NULL` | Start time (NULL for all-day events) |
| `end_time` | TIME | YES | `NULL` | End time |
| `is_recurring` | BOOLEAN | NO | `FALSE` | Whether the event repeats |
| `rrule` | VARCHAR(500) | YES | `NULL` | iCalendar RRULE string, e.g., `"FREQ=WEEKLY;BYDAY=SA"` |
| `is_free` | BOOLEAN | NO | `FALSE` | Whether admission is free |
| `price` | DECIMAL(10,2) | YES | `NULL` | Starting price in EUR |
| `price_max` | DECIMAL(10,2) | YES | `NULL` | Maximum price (for price ranges) |
| `ticket_url` | VARCHAR(500) | YES | `NULL` | External ticketing link |
| `featured_image_id` | UUID | YES | `NULL` | FK to `media` |
| `status` | `event_status` | NO | `'draft'` | Approval workflow state |
| `submitted_by` | UUID | YES | `NULL` | User who submitted the event |
| `approved_by` | UUID | YES | `NULL` | Admin/editor who approved it |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Indexes

```sql
-- Unique slug among active events
CREATE UNIQUE INDEX uq_events_slug_active
  ON events (slug)
  WHERE deleted_at IS NULL;

-- Upcoming events feed (the most critical query)
CREATE INDEX idx_events_upcoming
  ON events (start_date ASC, start_time ASC NULLS LAST)
  WHERE deleted_at IS NULL AND status = 'published' AND start_date >= CURRENT_DATE;
-- Rationale: "What's happening in Berlin this week?" scans future dates.
-- Partial index ensures only published, non-deleted events are included.
-- NOTE: The >= CURRENT_DATE condition in a partial index is evaluated at
-- query time, not at index creation. For a truly static partial index,
-- omit the date condition and rely on the query planner.

-- Better approach for upcoming events:
CREATE INDEX idx_events_published_date
  ON events (start_date ASC, start_time ASC NULLS LAST)
  WHERE deleted_at IS NULL AND status = 'published';

-- Events by category ("Music events", "Food festivals")
CREATE INDEX idx_events_category_date
  ON events (category_id, start_date ASC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Events by venue ("What's on at Berghain?")
CREATE INDEX idx_events_venue
  ON events (venue_id, start_date ASC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Free events filter
CREATE INDEX idx_events_free
  ON events (start_date ASC)
  WHERE deleted_at IS NULL AND status = 'published' AND is_free = TRUE;
-- Rationale: "Free events in Berlin" is a popular filter. Partial index
-- on is_free = TRUE keeps the index small.

-- Pending review (admin moderation queue)
CREATE INDEX idx_events_pending
  ON events (created_at ASC)
  WHERE status = 'pending_review' AND deleted_at IS NULL;

-- User's submitted events
CREATE INDEX idx_events_submitted_by
  ON events (submitted_by, created_at DESC)
  WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_events_fts
  ON events USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  );
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `venue_id` | `venues(id)` | SET NULL | Venue removal doesn't delete events |
| `category_id` | `categories(id)` | SET NULL | Category removal orphans events |
| `featured_image_id` | `media(id)` | SET NULL | Image can be deleted independently |
| `submitted_by` | `users(id)` | SET NULL | User deletion preserves events |
| `approved_by` | `users(id)` | SET NULL | Approver removal preserves approval record |

### Design Decisions

1. **DATE + TIME separate columns** instead of a single TIMESTAMPTZ for start/end:
   - Allows representing all-day events (TIME is NULL).
   - Simplifies date-based queries ("events on March 15") without time zone conversion.
   - `start_date` is `DATE` (no TZ), while `created_at` is `TIMESTAMPTZ` (with TZ). This is intentional: a Berlin event on March 15 is March 15 regardless of the viewer's time zone.

2. **RRULE for recurrence:** Uses the iCalendar RFC 5545 RRULE format (e.g., `FREQ=WEEKLY;BYDAY=SA;COUNT=12`). This is a well-established standard with libraries in every language (e.g., `rrule.js`). The application expands RRULE into individual occurrences for display.

3. **Price range:** `price` and `price_max` support "EUR 15-25" display. When `is_free = TRUE`, prices are NULL.

4. **Submission workflow:** Users submit events with `status = 'pending_review'`. Editors approve (`status = 'published'`) or reject (`status = 'rejected'`). The `approved_by` field tracks who approved.

### Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| **RRULE string** | Standard, library support, flexible | Requires app-level expansion for date queries |
| **Separate occurrence rows** | Direct SQL queries on dates | Explosion of rows for weekly events |
| **DATE + TIME columns** | Natural all-day event support | Two columns instead of one |
| **Single TIMESTAMPTZ** | One column, simpler schema | Awkward for all-day events, TZ issues |

---

## Example Seed Data

```sql
-- Event categories
INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES
  ('11000000-0000-0000-0000-000000000001', 'Music',         'music',          'Concerts, festivals, and live music',         'event', 1),
  ('11000000-0000-0000-0000-000000000002', 'Art',           'art',            'Exhibitions, gallery openings, and art fairs', 'event', 2),
  ('11000000-0000-0000-0000-000000000003', 'Food & Markets','food-markets',   'Food festivals, markets, and tastings',        'event', 3),
  ('11000000-0000-0000-0000-000000000004', 'Film',          'film',           'Cinema screenings and film festivals',         'event', 4),
  ('11000000-0000-0000-0000-000000000005', 'Sports',        'sports-events',  'Sports events and outdoor activities',         'event', 5),
  ('11000000-0000-0000-0000-000000000006', 'Nightlife',     'nightlife-events','Club nights and DJ sets',                     'event', 6),
  ('11000000-0000-0000-0000-000000000007', 'Comedy',        'comedy',         'Stand-up comedy and improv shows',             'event', 7),
  ('11000000-0000-0000-0000-000000000008', 'Networking',    'networking',     'Professional networking and meetups',          'event', 8);

-- Venues
INSERT INTO venues (id, name, slug, address, district, latitude, longitude, website, capacity, description) VALUES
(
  '40000000-0000-0000-0000-000000000001',
  'Tempodrom',
  'tempodrom',
  'Moeckernstrasse 10, 10963 Berlin',
  'Kreuzberg',
  52.498611,
  13.382222,
  'https://www.tempodrom.de',
  3800,
  'Iconic tent-shaped venue hosting concerts, cultural events, and shows since 1980.'
),
(
  '40000000-0000-0000-0000-000000000002',
  'Berghain',
  'berghain',
  'Am Wriezener Bahnhof, 10243 Berlin',
  'Friedrichshain',
  52.511389,
  13.443333,
  'https://www.berghain.berlin',
  1500,
  'World-renowned techno club in a former power plant.'
),
(
  '40000000-0000-0000-0000-000000000003',
  'Markthalle Neun',
  'markthalle-neun',
  'Eisenbahnstrasse 42/43, 10997 Berlin',
  'Kreuzberg',
  52.500833,
  13.428333,
  'https://markthalleneun.de',
  500,
  'Historic market hall hosting the famous Thursday Street Food market and special food events.'
),
(
  '40000000-0000-0000-0000-000000000004',
  'Waldbuhne',
  'waldbuehne',
  'Glockenturmstrasse 1, 14053 Berlin',
  'Charlottenburg-Wilmersdorf',
  52.515000,
  13.228889,
  'https://www.waldbuehne-berlin.de',
  22290,
  'Open-air amphitheatre nestled in a natural forest clearing, one of the most beautiful concert venues in Europe.'
),
(
  '40000000-0000-0000-0000-000000000005',
  'Lido',
  'lido',
  'Cuvrystrasse 7, 10997 Berlin',
  'Kreuzberg',
  52.496667,
  13.441667,
  'https://lido-berlin.de',
  800,
  'Former cinema turned live music venue in the heart of Kreuzberg.'
);

-- Sample events
INSERT INTO events (
  id, title, slug, description, excerpt, venue_id, category_id,
  start_date, end_date, start_time, end_time,
  is_recurring, is_free, price, price_max, ticket_url,
  status, submitted_by, approved_by, published_at
) VALUES
(
  '41000000-0000-0000-0000-000000000001',
  'Berlin Philharmonic: Spring Concert Series',
  'berlin-philharmonic-spring-concert-2026',
  'The Berlin Philharmonic opens its spring season with a program featuring...',
  'Experience the world-renowned Berlin Philharmonic in their spring concert series.',
  '40000000-0000-0000-0000-000000000001',  -- Tempodrom
  '11000000-0000-0000-0000-000000000001',  -- Music
  '2026-04-05',
  '2026-04-05',
  '20:00',
  '22:30',
  FALSE,
  FALSE,
  25.00,
  85.00,
  'https://tickets.example.com/philharmonic-spring',
  'published',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '2026-03-01 12:00:00+01'
),
(
  '41000000-0000-0000-0000-000000000002',
  'Street Food Thursday at Markthalle Neun',
  'street-food-thursday-markthalle-neun',
  'Every Thursday, Markthalle Neun transforms into a street food paradise with vendors from around the world...',
  'Weekly street food market every Thursday at the iconic Markthalle Neun in Kreuzberg.',
  '40000000-0000-0000-0000-000000000003',  -- Markthalle Neun
  '11000000-0000-0000-0000-000000000003',  -- Food & Markets
  '2026-03-12',
  NULL,
  '17:00',
  '22:00',
  TRUE,                                       -- Recurring
  TRUE,                                       -- Free entry
  NULL,
  NULL,
  NULL,
  'published',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '2026-01-10 09:00:00+01'
),
(
  '41000000-0000-0000-0000-000000000003',
  'Open-Air Cinema: Waldbuhne Summer Nights',
  'open-air-cinema-waldbuehne-summer-2026',
  'The Waldbuhne kicks off its summer cinema season under the stars...',
  'Outdoor cinema screenings at the beautiful Waldbuhne amphitheatre.',
  '40000000-0000-0000-0000-000000000004',  -- Waldbuhne
  '11000000-0000-0000-0000-000000000004',  -- Film
  '2026-06-15',
  '2026-08-31',
  '21:00',
  '23:30',
  FALSE,
  FALSE,
  12.00,
  NULL,
  'https://tickets.example.com/waldbuehne-cinema',
  'published',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '2026-03-05 10:00:00+01'
);

-- Update the recurring event with its RRULE
UPDATE events
SET rrule = 'FREQ=WEEKLY;BYDAY=TH'
WHERE id = '41000000-0000-0000-0000-000000000002';
```
