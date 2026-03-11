# Schema: Content (Articles, Categories, Tags)

> Domain: `content`
> Tables: `categories`, `tags`, `articles`, `article_tags`, `article_revisions`

---

## Table: `categories`

Shared taxonomy table used across multiple content types (articles, events, videos). Supports hierarchical nesting via `parent_id` and is scoped by `type`.

### SQL

```sql
CREATE TYPE category_type AS ENUM (
  'article', 'event', 'video'
);

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL,
  description TEXT,
  parent_id   UUID,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  type        category_type NOT NULL,

  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(100) | NO | -- | Display name, e.g., "Politics", "Food & Drink" |
| `slug` | VARCHAR(120) | NO | -- | URL-safe identifier, e.g., "food-and-drink" |
| `description` | TEXT | YES | `NULL` | Optional description for SEO and category pages |
| `parent_id` | UUID | YES | `NULL` | Self-referencing FK for subcategories |
| `sort_order` | INTEGER | NO | `0` | Display ordering within the same parent |
| `type` | `category_type` | NO | -- | Scopes category to a content domain |

### Constraints & Indexes

```sql
-- Unique slug per type (allows "music" in both article and event categories)
CREATE UNIQUE INDEX uq_categories_slug_type
  ON categories (slug, type);

-- Children of a parent, ordered
CREATE INDEX idx_categories_parent_sort
  ON categories (parent_id, sort_order);

-- Filter by type
CREATE INDEX idx_categories_type
  ON categories (type, sort_order);
```

### Design Decisions

1. **Shared categories table with `type` discriminator** rather than separate `article_categories`, `event_categories` tables. Reduces schema complexity and allows potential cross-domain categorization in the future.
2. **Single-level nesting:** While `parent_id` supports arbitrary depth, the application enforces max 2 levels (parent + child) for UX simplicity.
3. **`ON DELETE SET NULL` for parent:** If a parent category is deleted, children become top-level rather than being cascade-deleted.

---

## Table: `tags`

Freeform tagging system shared across articles and videos. Tags are lightweight and user/editor-created.

### SQL

```sql
CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(60) NOT NULL,
  slug       VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(60) | NO | -- | Display name, e.g., "Street Art" |
| `slug` | VARCHAR(80) | NO | -- | URL-safe, unique, e.g., "street-art" |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |

### Indexes

```sql
-- Slug is already unique (implicit B-tree index)

-- Name search for autocomplete (trigram index)
CREATE INDEX idx_tags_name_trgm
  ON tags USING gin (name gin_trgm_ops);
-- Rationale: When editors type a tag name, the UI provides autocomplete.
-- Trigram GIN index supports ILIKE '%partial%' queries efficiently.
```

### Design Decisions

- **No `updated_at` or `deleted_at`:** Tags are immutable after creation. To "rename" a tag, create a new one and reassign articles. To "delete" a tag, remove all associations (the orphan tag can be cleaned up by a periodic job).
- **Shared across articles and videos** via `article_tags` and `video_tags` join tables. Could be extended to other entities.

---

## Table: `articles`

The primary editorial content table. Articles are the backbone of the iloveberlin.biz content platform.

### SQL

```sql
CREATE TYPE article_status AS ENUM ('draft', 'in_review', 'scheduled', 'published', 'archived');

CREATE TABLE articles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(255) NOT NULL,
  subtitle           VARCHAR(255),
  slug               VARCHAR(280) NOT NULL,
  body               TEXT NOT NULL,
  excerpt            TEXT,
  featured_image_id  UUID,
  category_id        UUID,
  author_id          UUID,
  status             article_status NOT NULL DEFAULT 'draft',
  published_at       TIMESTAMPTZ,
  scheduled_at       TIMESTAMPTZ,
  view_count         INTEGER NOT NULL DEFAULT 0,
  read_time_minutes  SMALLINT,
  seo_title          VARCHAR(70),
  seo_description    VARCHAR(160),
  seo_keywords       VARCHAR(255),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ,

  CONSTRAINT fk_articles_featured_image
    FOREIGN KEY (featured_image_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_author
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_articles_view_count
    CHECK (view_count >= 0),
  CONSTRAINT chk_articles_read_time
    CHECK (read_time_minutes IS NULL OR read_time_minutes > 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `title` | VARCHAR(255) | NO | -- | Article headline |
| `subtitle` | VARCHAR(255) | YES | `NULL` | Optional subtitle / deck |
| `slug` | VARCHAR(280) | NO | -- | URL slug, unique among non-deleted articles |
| `body` | TEXT | NO | -- | Full article body in HTML or Markdown |
| `excerpt` | TEXT | YES | `NULL` | Short summary for cards and meta description |
| `featured_image_id` | UUID | YES | `NULL` | FK to `media` table |
| `category_id` | UUID | YES | `NULL` | FK to `categories` (type='article') |
| `author_id` | UUID | YES | `NULL` | FK to `users` |
| `status` | `article_status` | NO | `'draft'` | Publication workflow state |
| `published_at` | TIMESTAMPTZ | YES | `NULL` | When the article went live (set by publish action) |
| `scheduled_at` | TIMESTAMPTZ | YES | `NULL` | Scheduled publication time (cron job publishes) |
| `view_count` | INTEGER | NO | `0` | Incremented on page view (can be batched) |
| `read_time_minutes` | SMALLINT | YES | `NULL` | Estimated read time, calculated from word count |
| `seo_title` | VARCHAR(70) | YES | `NULL` | Custom SEO title (falls back to `title`) |
| `seo_description` | VARCHAR(160) | YES | `NULL` | Meta description for search engines |
| `seo_keywords` | VARCHAR(255) | YES | `NULL` | Comma-separated keywords |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Constraints & Indexes

```sql
-- Unique slug among active articles
CREATE UNIQUE INDEX uq_articles_slug_active
  ON articles (slug)
  WHERE deleted_at IS NULL;

-- Published articles feed (homepage, category pages)
CREATE INDEX idx_articles_published
  ON articles (published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';
-- Rationale: The most common query is "latest published articles."
-- Partial index only includes published, non-deleted rows.

-- Articles by category
CREATE INDEX idx_articles_category
  ON articles (category_id, published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Articles by author (author profile page)
CREATE INDEX idx_articles_author
  ON articles (author_id, published_at DESC)
  WHERE deleted_at IS NULL;

-- Scheduled articles (cron job to auto-publish)
CREATE INDEX idx_articles_scheduled
  ON articles (scheduled_at)
  WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND deleted_at IS NULL;
-- Rationale: The scheduler queries for articles where scheduled_at <= now().
-- Partial index keeps this scan tiny.

-- Full-text search on title and body
CREATE INDEX idx_articles_fts
  ON articles USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  );
-- Rationale: Enables full-text search across articles. Combined with
-- pg_trgm for fuzzy matching.

-- View count (trending / popular articles)
CREATE INDEX idx_articles_view_count
  ON articles (view_count DESC)
  WHERE deleted_at IS NULL AND status = 'published';
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `featured_image_id` | `media(id)` | SET NULL | Image can be deleted independently |
| `category_id` | `categories(id)` | SET NULL | Category removal shouldn't delete articles |
| `author_id` | `users(id)` | SET NULL | Author account deletion preserves articles |

---

## Table: `article_tags`

Many-to-many join table between articles and tags.

### SQL

```sql
CREATE TABLE article_tags (
  article_id UUID NOT NULL,
  tag_id     UUID NOT NULL,

  PRIMARY KEY (article_id, tag_id),

  CONSTRAINT fk_article_tags_article
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_article_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Reverse lookup: find all articles with a given tag
CREATE INDEX idx_article_tags_tag_id
  ON article_tags (tag_id);
-- Rationale: The composite PK already covers (article_id, tag_id) lookups.
-- This index covers the reverse: "all articles tagged 'street-art'".
```

### Design Decisions

- **Composite PK** instead of a surrogate UUID. The pair (article_id, tag_id) is inherently unique and is the only access pattern.
- **CASCADE on both FKs:** Deleting an article removes its tag associations. Deleting a tag removes all associations (the article remains).

---

## Table: `article_revisions`

Tracks edit history for articles. Every time an editor saves changes, a revision is created before the update is applied.

### SQL

```sql
CREATE TABLE article_revisions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  edited_by   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_article_revisions_article
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_article_revisions_editor
    FOREIGN KEY (edited_by) REFERENCES users (id) ON DELETE SET NULL
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `article_id` | UUID | NO | -- | The article this revision belongs to |
| `title` | VARCHAR(255) | NO | -- | Title at the time of this revision |
| `body` | TEXT | NO | -- | Body content at the time of this revision |
| `edited_by` | UUID | YES | `NULL` | User who made this edit |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the revision was captured |

### Indexes

```sql
-- Article's revision history (newest first)
CREATE INDEX idx_article_revisions_article
  ON article_revisions (article_id, created_at DESC);
-- Rationale: Viewing revision history for a single article, ordered by time.

-- Editor's edit history (admin reporting)
CREATE INDEX idx_article_revisions_editor
  ON article_revisions (edited_by, created_at DESC);
```

### Design Decisions

1. **Snapshot, not diff:** Each revision stores the full title and body, not a diff. This simplifies "view revision" and "restore revision" operations at the cost of storage. For a city guide with moderate editorial volume, storage cost is negligible.
2. **No `updated_at` or `deleted_at`:** Revisions are immutable. They are never edited after creation.
3. **CASCADE on article delete:** If the article is permanently removed, its revision history goes with it.
4. **SET NULL on editor delete:** Preserves revision history even if the editor account is removed.

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Full snapshot (chosen)** | Simple restore, easy diff in UI | More storage per revision |
| **JSON diff** | Smaller storage | Complex restore logic, harder to display |
| **Event sourcing** | Complete audit trail | Overkill for editorial content |

---

## Example Seed Data

```sql
-- Categories (article type)
INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'News',           'news',           'Latest Berlin news and updates',        'article', 1),
  ('10000000-0000-0000-0000-000000000002', 'Culture',        'culture',        'Art, music, theater, and cultural events','article', 2),
  ('10000000-0000-0000-0000-000000000003', 'Food & Drink',   'food-and-drink', 'Restaurant reviews, bars, and cafes',   'article', 3),
  ('10000000-0000-0000-0000-000000000004', 'Nightlife',      'nightlife',      'Clubs, bars, and Berlin after dark',    'article', 4),
  ('10000000-0000-0000-0000-000000000005', 'Lifestyle',      'lifestyle',      'Living in Berlin: tips and trends',     'article', 5),
  ('10000000-0000-0000-0000-000000000006', 'Travel',         'travel',         'Day trips and travel from Berlin',      'article', 6),
  ('10000000-0000-0000-0000-000000000007', 'Expat Life',     'expat-life',     'Resources and stories for expats',      'article', 7),
  ('10000000-0000-0000-0000-000000000008', 'Property',       'property',       'Real estate and housing in Berlin',     'article', 8),
  ('10000000-0000-0000-0000-000000000009', 'Business',       'business',       'Startups, economy, and business news',  'article', 9),
  ('10000000-0000-0000-0000-000000000010', 'Sports',         'sports',         'Sports events and teams in Berlin',     'article', 10),
  ('10000000-0000-0000-0000-000000000011', 'Opinion',        'opinion',        'Editorials and opinion pieces',         'article', 11),
  ('10000000-0000-0000-0000-000000000012', 'History',        'history',        'Berlin''s rich and complex history',    'article', 12);

-- Tags
INSERT INTO tags (id, name, slug) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Street Art',        'street-art'),
  ('20000000-0000-0000-0000-000000000002', 'Berlin Wall',       'berlin-wall'),
  ('20000000-0000-0000-0000-000000000003', 'Craft Beer',        'craft-beer'),
  ('20000000-0000-0000-0000-000000000004', 'Vegan',             'vegan'),
  ('20000000-0000-0000-0000-000000000005', 'Techno',            'techno'),
  ('20000000-0000-0000-0000-000000000006', 'Christmas Markets', 'christmas-markets'),
  ('20000000-0000-0000-0000-000000000007', 'Museums',           'museums'),
  ('20000000-0000-0000-0000-000000000008', 'Free Things',       'free-things'),
  ('20000000-0000-0000-0000-000000000009', 'Startups',          'startups'),
  ('20000000-0000-0000-0000-000000000010', 'Public Transport',  'public-transport');

-- Sample article
INSERT INTO articles (
  id, title, subtitle, slug, body, excerpt, category_id, author_id,
  status, published_at, view_count, read_time_minutes,
  seo_title, seo_description
) VALUES (
  'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'The Ultimate Guide to Berlin''s Street Art Scene',
  'From Kreuzberg walls to gallery exhibitions',
  'ultimate-guide-berlin-street-art-scene',
  '<p>Berlin''s street art scene is one of the most vibrant in the world...</p>
   <h2>Kreuzberg: The Open-Air Gallery</h2>
   <p>Walk along Oranienstrasse and you''ll find...</p>',
  'Discover the best street art in Berlin, from iconic murals in Kreuzberg to hidden gems in Friedrichshain.',
  '10000000-0000-0000-0000-000000000002',  -- Culture category
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',  -- Editor user
  'published',
  '2026-03-01 10:00:00+01',
  1523,
  8,
  'Berlin Street Art Guide 2026 | ILoveBerlin',
  'Explore Berlin''s world-famous street art scene with our ultimate guide to murals, galleries, and tours.'
);

-- Tag associations
INSERT INTO article_tags (article_id, tag_id) VALUES
  ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '20000000-0000-0000-0000-000000000001'),  -- Street Art
  ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '20000000-0000-0000-0000-000000000002');  -- Berlin Wall

-- Article revision
INSERT INTO article_revisions (id, article_id, title, body, edited_by) VALUES (
  'g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
  'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'The Ultimate Guide to Berlin''s Street Art Scene',
  '<p>Berlin''s street art scene is one of the most vibrant in the world...</p>',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
);
```
