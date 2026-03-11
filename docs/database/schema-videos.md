# Schema: Videos

> Domain: `video`
> Tables: `video_series`, `videos`, `video_tags`

---

## Overview

Video content hosted on external platforms (YouTube, Vimeo) and organized into optional series. Videos share the `tags` table with articles for cross-content discovery. The schema tracks view counts locally (in addition to platform analytics) and supports the same publication workflow as other content types.

---

## Table: `video_series`

Groups videos into a named series (e.g., "Neighborhood Guides", "Chef Interviews"). A series provides a landing page and navigation context.

### SQL

```sql
CREATE TABLE video_series (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(150) NOT NULL,
  slug         VARCHAR(170) NOT NULL UNIQUE,
  description  TEXT,
  thumbnail_id UUID,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_video_series_thumbnail
    FOREIGN KEY (thumbnail_id) REFERENCES media (id) ON DELETE SET NULL
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(150) | NO | -- | Series name, e.g., "Neighborhood Guides" |
| `slug` | VARCHAR(170) | NO | -- | URL slug, unique |
| `description` | TEXT | YES | `NULL` | Series description for the landing page |
| `thumbnail_id` | UUID | YES | `NULL` | FK to `media` for series cover image |
| `sort_order` | INTEGER | NO | `0` | Display ordering on the video index page |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |

### Indexes

```sql
-- Slug covered by UNIQUE constraint
-- Ordered listing
CREATE INDEX idx_video_series_sort
  ON video_series (sort_order);
```

### Design Decisions

- **No `updated_at` / `deleted_at`:** Series are reference data managed by editors. If a series is removed, its videos are reassigned (`SET NULL`).
- **`thumbnail_id` via media table:** Series thumbnails go through the centralized media pipeline for consistent responsive image handling.

---

## Table: `videos`

Individual video records. Videos are embedded from external providers (YouTube, Vimeo) rather than self-hosted.

### SQL

```sql
CREATE TYPE video_provider AS ENUM ('youtube', 'vimeo', 'self_hosted');
CREATE TYPE video_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE videos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  slug              VARCHAR(280) NOT NULL,
  description       TEXT,
  video_url         VARCHAR(500) NOT NULL,
  video_provider    video_provider NOT NULL DEFAULT 'youtube',
  thumbnail_id      UUID,
  series_id         UUID,
  category_id       UUID,
  duration_seconds  INTEGER,
  view_count        INTEGER NOT NULL DEFAULT 0,
  status            video_status NOT NULL DEFAULT 'draft',
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT fk_videos_thumbnail
    FOREIGN KEY (thumbnail_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_videos_series
    FOREIGN KEY (series_id) REFERENCES video_series (id) ON DELETE SET NULL,
  CONSTRAINT fk_videos_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT chk_videos_duration
    CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  CONSTRAINT chk_videos_view_count
    CHECK (view_count >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `title` | VARCHAR(255) | NO | -- | Video title |
| `slug` | VARCHAR(280) | NO | -- | URL slug |
| `description` | TEXT | YES | `NULL` | Video description, supports Markdown |
| `video_url` | VARCHAR(500) | NO | -- | Embed/source URL, e.g., `https://youtube.com/watch?v=xxx` |
| `video_provider` | `video_provider` | NO | `'youtube'` | Platform hosting the video |
| `thumbnail_id` | UUID | YES | `NULL` | Custom thumbnail (overrides provider default) |
| `series_id` | UUID | YES | `NULL` | FK to `video_series`. NULL for standalone videos |
| `category_id` | UUID | YES | `NULL` | FK to `categories` (type='video') |
| `duration_seconds` | INTEGER | YES | `NULL` | Video length in seconds |
| `view_count` | INTEGER | NO | `0` | Local view counter (may lag provider stats) |
| `status` | `video_status` | NO | `'draft'` | Publication state |
| `published_at` | TIMESTAMPTZ | YES | `NULL` | Publication timestamp |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Constraints & Indexes

```sql
-- Unique slug among active videos
CREATE UNIQUE INDEX uq_videos_slug_active
  ON videos (slug)
  WHERE deleted_at IS NULL;

-- Published videos feed (video listing page)
CREATE INDEX idx_videos_published
  ON videos (published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Videos by series (series landing page)
CREATE INDEX idx_videos_series
  ON videos (series_id, published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Videos by category
CREATE INDEX idx_videos_category
  ON videos (category_id, published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Popular videos (trending widget)
CREATE INDEX idx_videos_popular
  ON videos (view_count DESC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Full-text search
CREATE INDEX idx_videos_fts
  ON videos USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  );
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `thumbnail_id` | `media(id)` | SET NULL | Thumbnail deletion reverts to provider default |
| `series_id` | `video_series(id)` | SET NULL | Series removal orphans videos (they become standalone) |
| `category_id` | `categories(id)` | SET NULL | Category removal doesn't affect video |

### Design Decisions

1. **External hosting:** Videos are not stored in the platform's media library. `video_url` points to YouTube/Vimeo. This avoids bandwidth costs and leverages platform CDNs.
2. **`video_provider` enum:** The frontend uses this to select the correct embed component (YouTube iframe, Vimeo player, etc.). `self_hosted` is reserved for future use.
3. **`duration_seconds` as INTEGER:** Stored in seconds for easy math. The UI formats to `MM:SS` or `HH:MM:SS`. Pulled from provider API during video creation.
4. **Local `view_count`:** Tracked when the video page is loaded on iloveberlin.biz. This is not the same as YouTube/Vimeo view counts. Used for "trending on our platform" features.
5. **No `author_id`:** Unlike articles, videos are produced by the editorial team and don't have individual author attribution. If needed, an `author_id` FK can be added later.

### Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| **External hosting only** | Zero storage/CDN cost, reliable playback | Dependent on third-party availability |
| **Self-hosted option (future)** | Full control, no third-party dependency | Significant storage and bandwidth cost |
| **Shared tags (reuse `tags` table)** | Cross-content discovery | Tags may not all be relevant to videos |
| **Separate video tags table** | Clean separation | Duplication of tag data |

---

## Table: `video_tags`

Many-to-many join between videos and the shared `tags` table.

### SQL

```sql
CREATE TABLE video_tags (
  video_id UUID NOT NULL,
  tag_id   UUID NOT NULL,

  PRIMARY KEY (video_id, tag_id),

  CONSTRAINT fk_video_tags_video
    FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE,
  CONSTRAINT fk_video_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Reverse lookup: "all videos with tag 'techno'"
CREATE INDEX idx_video_tags_tag_id
  ON video_tags (tag_id);
```

---

## TypeORM Entities

### Video Entity

```typescript
// src/modules/videos/entities/video.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, ManyToMany, JoinColumn, JoinTable,
} from 'typeorm';

export enum VideoProvider {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  SELF_HOSTED = 'self_hosted',
}

export enum VideoStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 280 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500 })
  video_url: string;

  @Column({ type: 'enum', enum: VideoProvider, default: VideoProvider.YOUTUBE })
  video_provider: VideoProvider;

  @Column({ type: 'uuid', nullable: true })
  thumbnail_id: string | null;

  @ManyToOne(() => VideoSeries, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'series_id' })
  series: VideoSeries;

  @Column({ type: 'uuid', nullable: true })
  series_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  category_id: string | null;

  @Column({ type: 'int', nullable: true })
  duration_seconds: number | null;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.DRAFT })
  status: VideoStatus;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'video_tags',
    joinColumn: { name: 'video_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags: Tag[];
}
```

---

## Example Seed Data

```sql
-- Video categories
INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES
  ('12000000-0000-0000-0000-000000000001', 'City Tours',      'city-tours',      'Virtual tours of Berlin neighborhoods and landmarks', 'video', 1),
  ('12000000-0000-0000-0000-000000000002', 'Interviews',      'interviews',      'Conversations with Berliners and local personalities', 'video', 2),
  ('12000000-0000-0000-0000-000000000003', 'Food & Cooking',  'food-cooking',    'Berlin food scene and cooking tutorials',              'video', 3),
  ('12000000-0000-0000-0000-000000000004', 'Culture & Events', 'culture-events', 'Coverage of Berlin cultural events and scenes',        'video', 4),
  ('12000000-0000-0000-0000-000000000005', 'Tips & How-To',   'tips-how-to',     'Practical tips for living in Berlin',                  'video', 5);

-- Video Series
INSERT INTO video_series (id, name, slug, description, sort_order) VALUES
  ('60000000-0000-0000-0000-000000000001', 'Neighborhood Guides',    'neighborhood-guides',    'In-depth video tours of Berlin''s unique neighborhoods.',                    1),
  ('60000000-0000-0000-0000-000000000002', 'Berlin Eats',            'berlin-eats',            'Exploring Berlin''s diverse food scene one restaurant at a time.',           2),
  ('60000000-0000-0000-0000-000000000003', 'Expat Stories',          'expat-stories',          'Personal stories from international residents of Berlin.',                   3),
  ('60000000-0000-0000-0000-000000000004', 'Hidden Berlin',          'hidden-berlin',          'Discovering Berlin''s secret spots, hidden courtyards, and unknown history.',4),
  ('60000000-0000-0000-0000-000000000005', 'Berlin Explained',       'berlin-explained',       'Explaining German bureaucracy, culture, and daily life for newcomers.',      5);

-- Sample Videos
INSERT INTO videos (
  id, title, slug, description, video_url, video_provider,
  series_id, category_id, duration_seconds, view_count,
  status, published_at
) VALUES
(
  '61000000-0000-0000-0000-000000000001',
  'Kreuzberg: The Complete Neighborhood Guide',
  'kreuzberg-complete-neighborhood-guide',
  'Take a virtual walking tour through Kreuzberg, from the Turkish Market along the Landwehr Canal to the street art of Oranienstrasse. We cover the best cafes, parks, and hidden gems.',
  'https://www.youtube.com/watch?v=example_kreuzberg_id',
  'youtube',
  '60000000-0000-0000-0000-000000000001',  -- Neighborhood Guides
  '12000000-0000-0000-0000-000000000001',  -- City Tours
  847,  -- 14:07
  2340,
  'published',
  '2026-02-15 10:00:00+01'
),
(
  '61000000-0000-0000-0000-000000000002',
  'How to Register Your Address in Berlin (Anmeldung)',
  'how-to-register-address-berlin-anmeldung',
  'Step-by-step guide to the Anmeldung process: what documents you need, how to book an appointment at the Burgeramt, and common mistakes to avoid.',
  'https://www.youtube.com/watch?v=example_anmeldung_id',
  'youtube',
  '60000000-0000-0000-0000-000000000005',  -- Berlin Explained
  '12000000-0000-0000-0000-000000000005',  -- Tips & How-To
  623,  -- 10:23
  5891,
  'published',
  '2026-01-20 09:00:00+01'
),
(
  '61000000-0000-0000-0000-000000000003',
  'Best Ramen in Berlin: Top 5 Spots',
  'best-ramen-berlin-top-5',
  'We taste-tested ramen across the city and ranked our top 5 bowls. From tonkotsu to miso, Berlin''s ramen scene has something for everyone.',
  'https://www.youtube.com/watch?v=example_ramen_id',
  'youtube',
  '60000000-0000-0000-0000-000000000002',  -- Berlin Eats
  '12000000-0000-0000-0000-000000000003',  -- Food & Cooking
  512,  -- 8:32
  3102,
  'published',
  '2026-03-01 11:00:00+01'
);

-- Video tag associations
INSERT INTO video_tags (video_id, tag_id) VALUES
  ('61000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),  -- Street Art
  ('61000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000010'),  -- Public Transport (tangentially related)
  ('61000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004');  -- Vegan (some ramen spots are vegan)
```
