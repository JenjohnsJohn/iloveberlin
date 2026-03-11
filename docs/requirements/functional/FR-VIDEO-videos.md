# FR-VIDEO: Videos

**Module:** Videos
**Status:** Draft
**Last Updated:** 2026-03-11
**Owner:** Content Team
**Related User Stories:** US-VIDEO-001 through US-VIDEO-045

---

## 1. Overview

The Videos module provides full lifecycle management for video content on the ILoveBerlin platform. Videos are organized into branded series (BTips, Dine Out Berlin, Made in Berlin, 2 Minutes With, Weekend Roundup) and can be independently categorized and tagged. The platform embeds videos hosted on YouTube and Vimeo rather than self-hosting video files, while thumbnails and supplementary images are stored on Cloudflare R2. View tracking, related-video suggestions, and series landing pages round out the feature set.

---

## 2. Functional Requirements

### 2.1 Video CRUD

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-001 | Admin users SHALL be able to create a new video record by providing a title, description, embed URL, thumbnail, series assignment, category, and tags. | Must | US-VIDEO-001 |
| FR-VIDEO-002 | Admin users SHALL be able to edit any field of an existing video record. | Must | US-VIDEO-002 |
| FR-VIDEO-003 | Admin users SHALL be able to soft-delete a video. Soft-deleted videos are excluded from all public queries but remain in the database for 90 days before hard deletion. | Must | US-VIDEO-003 |
| FR-VIDEO-004 | Admin users SHALL be able to restore a soft-deleted video within the 90-day retention window. | Should | US-VIDEO-004 |
| FR-VIDEO-005 | The system SHALL validate that the embed URL matches a supported provider pattern (YouTube or Vimeo) before saving. | Must | US-VIDEO-005 |
| FR-VIDEO-006 | The system SHALL extract and store the provider-specific video ID from the embed URL (e.g., YouTube `v` parameter, Vimeo path segment). | Must | US-VIDEO-006 |
| FR-VIDEO-007 | The system SHALL support draft, published, and archived statuses for videos. Only published videos appear on the public site. | Must | US-VIDEO-007 |
| FR-VIDEO-008 | The system SHALL record `created_at`, `updated_at`, and `published_at` timestamps automatically. | Must | US-VIDEO-008 |
| FR-VIDEO-009 | Admin users SHALL be able to schedule a video for future publication by setting a `published_at` timestamp in the future. A background job SHALL transition the video to published status at the scheduled time. | Should | US-VIDEO-009 |
| FR-VIDEO-010 | The system SHALL auto-generate a URL-safe slug from the video title. Admin users MAY override the generated slug. Slugs must be unique. | Must | US-VIDEO-010 |

### 2.2 Video Series

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-011 | The system SHALL support the following predefined video series: BTips, Dine Out Berlin, Made in Berlin, 2 Minutes With, Weekend Roundup. | Must | US-VIDEO-011 |
| FR-VIDEO-012 | Admin users SHALL be able to create additional custom video series with a name, slug, description, cover image, and sort order. | Should | US-VIDEO-012 |
| FR-VIDEO-013 | Each video MAY be assigned to exactly one series or left unassigned. | Must | US-VIDEO-013 |
| FR-VIDEO-014 | Each series SHALL have a dedicated landing page displaying all published videos in that series, ordered by `published_at` descending. | Must | US-VIDEO-014 |
| FR-VIDEO-015 | Series landing pages SHALL support cursor-based pagination with a default page size of 12 videos. | Must | US-VIDEO-015 |
| FR-VIDEO-016 | Admin users SHALL be able to edit series metadata (name, description, cover image, sort order). | Should | US-VIDEO-016 |
| FR-VIDEO-017 | Admin users SHALL be able to reorder the display sequence of series on the main videos index page via a `sort_order` integer. | Should | US-VIDEO-017 |
| FR-VIDEO-018 | Each series page SHALL include Open Graph and structured data (VideoObject schema) for SEO. | Should | US-VIDEO-018 |

### 2.3 Categories and Tags

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-019 | Admin users SHALL be able to create, edit, and delete video categories. Each category has a name, slug, and optional parent category (one level of nesting). | Must | US-VIDEO-019 |
| FR-VIDEO-020 | Each video SHALL be assigned to exactly one category. | Must | US-VIDEO-020 |
| FR-VIDEO-021 | Admin users SHALL be able to create and manage tags. Tags have a name and auto-generated slug. | Must | US-VIDEO-021 |
| FR-VIDEO-022 | Each video MAY have zero or more tags (many-to-many relationship). | Must | US-VIDEO-022 |
| FR-VIDEO-023 | Public users SHALL be able to filter the video listing by category and/or tag. | Must | US-VIDEO-023 |

### 2.4 Embeds and Thumbnails

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-024 | The system SHALL render an embedded video player (iframe) using the YouTube or Vimeo oEmbed endpoint or direct embed URL. | Must | US-VIDEO-024 |
| FR-VIDEO-025 | The embedded player SHALL use privacy-enhanced mode where available (e.g., `youtube-nocookie.com`). | Should | US-VIDEO-025 |
| FR-VIDEO-026 | The embedded player SHALL lazy-load (loading="lazy" on iframe) to improve page performance. | Should | US-VIDEO-026 |
| FR-VIDEO-027 | Admin users SHALL upload a custom thumbnail image for each video. The image is stored on Cloudflare R2 and processed into four sizes via the Media module (FR-MEDIA): 150px, 400px, 800px, 1200px. | Must | US-VIDEO-027 |
| FR-VIDEO-028 | If no custom thumbnail is uploaded, the system SHALL attempt to fetch the default thumbnail from the video provider API and store it on R2. | Should | US-VIDEO-028 |
| FR-VIDEO-029 | Thumbnail images SHALL be served via Cloudflare CDN with a Cache-Control max-age of 30 days. | Should | US-VIDEO-029 |

### 2.5 View Tracking

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-030 | The system SHALL record a view event each time a public user loads a video detail page. | Must | US-VIDEO-030 |
| FR-VIDEO-031 | View events SHALL capture: video ID, viewer user ID (nullable for anonymous), IP address (hashed for GDPR), user agent, referrer, and timestamp. | Must | US-VIDEO-031 |
| FR-VIDEO-032 | The system SHALL de-duplicate views from the same IP + user-agent combination within a 30-minute window for the same video. | Must | US-VIDEO-032 |
| FR-VIDEO-033 | The system SHALL maintain a materialized `view_count` column on the video record, updated asynchronously by a background job at 5-minute intervals. | Should | US-VIDEO-033 |
| FR-VIDEO-034 | Admin users SHALL be able to view an analytics breakdown of views per video over selectable time ranges (7d, 30d, 90d, all time). | Should | US-VIDEO-034 |

### 2.6 Related Videos

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-035 | The video detail page SHALL display up to 6 related videos. | Must | US-VIDEO-035 |
| FR-VIDEO-036 | Related videos SHALL be determined by the following priority: (1) same series, (2) shared tags, (3) same category, (4) most recent published. | Must | US-VIDEO-036 |
| FR-VIDEO-037 | Admin users MAY manually pin up to 3 related videos to a given video; pinned videos appear first in the related list. | Should | US-VIDEO-037 |

### 2.7 Public Listing and Filtering

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-038 | The public videos index page SHALL display published videos ordered by `published_at` descending with cursor-based pagination (default 12 per page). | Must | US-VIDEO-038 |
| FR-VIDEO-039 | Users SHALL be able to filter by series, category, and tag via query parameters. Filters are combinable (AND logic). | Must | US-VIDEO-039 |
| FR-VIDEO-040 | The videos index page SHALL display a featured/hero section showing the latest video from each active series. | Should | US-VIDEO-040 |
| FR-VIDEO-041 | The system SHALL provide an RSS feed of published videos at `/videos/feed.xml`. | Could | US-VIDEO-041 |

### 2.8 SEO and Metadata

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-VIDEO-042 | Each video detail page SHALL include Open Graph tags (og:title, og:description, og:image, og:video, og:type=video.other). | Must | US-VIDEO-042 |
| FR-VIDEO-043 | Each video detail page SHALL include JSON-LD structured data using the VideoObject schema. | Should | US-VIDEO-043 |
| FR-VIDEO-044 | The system SHALL generate a video sitemap at `/sitemap-videos.xml` listing all published videos with thumbnail, title, description, and player URL. | Should | US-VIDEO-044 |
| FR-VIDEO-045 | Admin users SHALL be able to set a custom meta title and meta description per video for SEO purposes. | Should | US-VIDEO-045 |

---

## 3. Database Schema

### 3.1 Table: `video_series`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(150)` | NOT NULL, UNIQUE | Display name |
| `slug` | `VARCHAR(170)` | NOT NULL, UNIQUE | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Series description |
| `cover_image_id` | `UUID` | FK -> media.id, NULLABLE | Cover image reference |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display ordering |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Whether series appears publicly |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_video_series_slug` UNIQUE on `slug`
- `idx_video_series_sort_order` on `sort_order`

### 3.2 Table: `video_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(100)` | NOT NULL | Category name |
| `slug` | `VARCHAR(120)` | NOT NULL, UNIQUE | URL-safe slug |
| `parent_id` | `UUID` | FK -> video_categories.id, NULLABLE | Parent category (one level) |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display ordering |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_video_categories_slug` UNIQUE on `slug`
- `idx_video_categories_parent_id` on `parent_id`

### 3.3 Table: `video_tags`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(80)` | NOT NULL, UNIQUE | Tag name |
| `slug` | `VARCHAR(100)` | NOT NULL, UNIQUE | URL-safe slug |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_video_tags_slug` UNIQUE on `slug`
- `idx_video_tags_name` on `name`

### 3.4 Table: `videos`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `title` | `VARCHAR(255)` | NOT NULL | Video title |
| `slug` | `VARCHAR(280)` | NOT NULL, UNIQUE | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Rich-text description |
| `excerpt` | `VARCHAR(500)` | NULLABLE | Short summary for listings |
| `embed_url` | `VARCHAR(500)` | NOT NULL | Full embed URL (YouTube/Vimeo) |
| `embed_provider` | `VARCHAR(20)` | NOT NULL, CHECK IN ('youtube','vimeo') | Video provider |
| `embed_video_id` | `VARCHAR(50)` | NOT NULL | Provider-specific video ID |
| `thumbnail_media_id` | `UUID` | FK -> media.id, NULLABLE | Custom thumbnail reference |
| `series_id` | `UUID` | FK -> video_series.id, NULLABLE | Series assignment |
| `category_id` | `UUID` | FK -> video_categories.id, NOT NULL | Category assignment |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft', CHECK IN ('draft','published','archived') | Publication status |
| `view_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Materialized view counter |
| `duration_seconds` | `INTEGER` | NULLABLE | Video duration in seconds |
| `meta_title` | `VARCHAR(70)` | NULLABLE | Custom SEO meta title |
| `meta_description` | `VARCHAR(160)` | NULLABLE | Custom SEO meta description |
| `author_id` | `UUID` | FK -> users.id, NOT NULL | Creator/author |
| `published_at` | `TIMESTAMPTZ` | NULLABLE | Publish date/time |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft-delete timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_videos_slug` UNIQUE on `slug`
- `idx_videos_status_published_at` on (`status`, `published_at` DESC) WHERE `deleted_at` IS NULL
- `idx_videos_series_id` on `series_id` WHERE `deleted_at` IS NULL
- `idx_videos_category_id` on `category_id` WHERE `deleted_at` IS NULL
- `idx_videos_author_id` on `author_id`
- `idx_videos_view_count` on `view_count` DESC WHERE `status` = 'published' AND `deleted_at` IS NULL
- `idx_videos_deleted_at` on `deleted_at` WHERE `deleted_at` IS NOT NULL

### 3.5 Table: `video_tag_assignments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `video_id` | `UUID` | PK (composite), FK -> videos.id ON DELETE CASCADE | Video reference |
| `tag_id` | `UUID` | PK (composite), FK -> video_tags.id ON DELETE CASCADE | Tag reference |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Assignment timestamp |

**Indexes:**
- `idx_video_tag_assignments_tag_id` on `tag_id`

### 3.6 Table: `video_views`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `video_id` | `UUID` | FK -> videos.id ON DELETE CASCADE, NOT NULL | Video reference |
| `user_id` | `UUID` | FK -> users.id, NULLABLE | Authenticated viewer |
| `ip_hash` | `VARCHAR(64)` | NOT NULL | SHA-256 hashed IP address |
| `user_agent` | `VARCHAR(500)` | NULLABLE | Browser user agent |
| `referrer` | `VARCHAR(1000)` | NULLABLE | HTTP referrer |
| `viewed_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | View timestamp |

**Indexes:**
- `idx_video_views_video_id_viewed_at` on (`video_id`, `viewed_at` DESC)
- `idx_video_views_dedup` on (`video_id`, `ip_hash`, `user_agent`) — used for de-duplication lookups
- `idx_video_views_viewed_at` on `viewed_at` — for analytics time-range queries

**Partitioning:** Partition by RANGE on `viewed_at` with monthly partitions for scalability.

### 3.7 Table: `video_related_pins`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `video_id` | `UUID` | PK (composite), FK -> videos.id ON DELETE CASCADE | Source video |
| `related_video_id` | `UUID` | PK (composite), FK -> videos.id ON DELETE CASCADE | Pinned related video |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order (0-2) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Pin timestamp |

**Constraints:**
- CHECK `sort_order` BETWEEN 0 AND 2
- CHECK `video_id` != `related_video_id`

---

## 4. API Endpoints

### 4.1 Public Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/videos` | None | List published videos | `cursor`, `limit` (default 12, max 50), `series` (slug), `category` (slug), `tag` (slug), `sort` (newest, popular) |
| GET | `/api/v1/videos/:slug` | None | Get single published video with related videos | — |
| GET | `/api/v1/videos/series` | None | List all active video series | — |
| GET | `/api/v1/videos/series/:slug` | None | Get series detail with paginated videos | `cursor`, `limit` (default 12, max 50) |
| GET | `/api/v1/videos/categories` | None | List all video categories | — |
| GET | `/api/v1/videos/tags` | None | List all tags | `q` (search prefix, min 2 chars) |
| POST | `/api/v1/videos/:id/views` | None | Record a view event | — |
| GET | `/api/v1/videos/feed.xml` | None | RSS feed of published videos | `series` (slug, optional filter) |

**Response format (list):**
```json
{
  "data": [ { "id": "uuid", "title": "...", "slug": "...", "excerpt": "...", "thumbnail": { "small": "url", "medium": "url" }, "series": { "name": "...", "slug": "..." }, "category": { "name": "...", "slug": "..." }, "tags": [{ "name": "...", "slug": "..." }], "view_count": 1234, "published_at": "ISO8601" } ],
  "pagination": { "next_cursor": "...", "has_more": true }
}
```

**Response format (detail):**
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "slug": "...",
    "description": "<html>",
    "excerpt": "...",
    "embed_url": "...",
    "embed_provider": "youtube",
    "embed_video_id": "abc123",
    "thumbnail": { "small": "url", "medium": "url", "large": "url" },
    "series": { "id": "uuid", "name": "...", "slug": "..." },
    "category": { "id": "uuid", "name": "...", "slug": "..." },
    "tags": [{ "id": "uuid", "name": "...", "slug": "..." }],
    "duration_seconds": 340,
    "view_count": 1234,
    "author": { "id": "uuid", "display_name": "..." },
    "published_at": "ISO8601",
    "related_videos": [ { "id": "uuid", "title": "...", "slug": "...", "thumbnail": { "small": "url" }, "view_count": 500 } ],
    "meta": { "title": "...", "description": "..." },
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

### 4.2 Admin Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/videos` | Admin | List all videos (any status) | `cursor`, `limit`, `status`, `series`, `category`, `tag`, `search` (title substring), `sort` (newest, oldest, popular) |
| POST | `/api/v1/admin/videos` | Admin | Create a video | Body: `{ title, description, excerpt, embed_url, thumbnail_media_id, series_id, category_id, tag_ids[], status, published_at, meta_title, meta_description }` |
| GET | `/api/v1/admin/videos/:id` | Admin | Get video by ID (any status) | — |
| PATCH | `/api/v1/admin/videos/:id` | Admin | Update video fields | Body: partial video object |
| DELETE | `/api/v1/admin/videos/:id` | Admin | Soft-delete a video | — |
| POST | `/api/v1/admin/videos/:id/restore` | Admin | Restore a soft-deleted video | — |
| PUT | `/api/v1/admin/videos/:id/related-pins` | Admin | Set pinned related videos | Body: `{ related_video_ids: [uuid, uuid, uuid] }` (max 3) |
| GET | `/api/v1/admin/videos/:id/analytics` | Admin | View analytics for a video | `range` (7d, 30d, 90d, all) |
| POST | `/api/v1/admin/video-series` | Admin | Create a series | Body: `{ name, description, cover_image_id, sort_order }` |
| PATCH | `/api/v1/admin/video-series/:id` | Admin | Update a series | Body: partial series object |
| DELETE | `/api/v1/admin/video-series/:id` | Admin | Delete a series (unlinks videos) | — |
| POST | `/api/v1/admin/video-categories` | Admin | Create a category | Body: `{ name, parent_id }` |
| PATCH | `/api/v1/admin/video-categories/:id` | Admin | Update a category | Body: partial category object |
| DELETE | `/api/v1/admin/video-categories/:id` | Admin | Delete a category | Fails if videos assigned; query `reassign_to` (category ID) to move them |
| POST | `/api/v1/admin/video-tags` | Admin | Create a tag | Body: `{ name }` |
| DELETE | `/api/v1/admin/video-tags/:id` | Admin | Delete a tag | — |

### 4.3 Error Responses

All endpoints return standard error objects:

```json
{
  "error": {
    "code": "VIDEO_NOT_FOUND",
    "message": "The requested video does not exist.",
    "status": 404
  }
}
```

| Code | Status | Trigger |
|------|--------|---------|
| VIDEO_NOT_FOUND | 404 | Slug or ID does not match a published (public) or any (admin) video |
| INVALID_EMBED_URL | 422 | embed_url does not match YouTube or Vimeo patterns |
| SLUG_CONFLICT | 409 | Generated or custom slug already exists |
| CATEGORY_HAS_VIDEOS | 409 | Attempt to delete a category with assigned videos without `reassign_to` |
| SERIES_NOT_FOUND | 404 | series_id references a non-existent series |
| VIEW_RATE_LIMITED | 429 | Duplicate view within 30-minute window (silent on public; returned to admin callers) |

---

## 5. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `UpdateVideoViewCounts` | Every 5 minutes | Aggregates `video_views` rows since last run, updates `videos.view_count`. |
| `PublishScheduledVideos` | Every 1 minute | Finds videos with `status = 'draft'` and `published_at <= now()`, transitions to `published`. |
| `PurgeDeletedVideos` | Daily at 03:00 UTC | Hard-deletes videos where `deleted_at < now() - interval '90 days'`. |
| `SyncVideoThumbnails` | On video create (async) | Fetches provider thumbnail if no custom thumbnail supplied. |

---

## 6. Integration Points

| System | Integration |
|--------|-------------|
| Media Module (FR-MEDIA) | Thumbnail upload, processing, and storage |
| Search Module (FR-SEARCH) | Videos index updated on create/update/delete/publish events |
| Cloudflare CDN | Thumbnail delivery with cache headers |
| YouTube / Vimeo APIs | Thumbnail fetch, oEmbed data (optional duration fetch) |

---

## 7. Non-Functional Constraints

- Video list endpoint p95 latency < 200ms.
- View tracking endpoint is fire-and-forget; it SHALL return 202 Accepted immediately and process asynchronously.
- Thumbnail images are served from Cloudflare R2 via Cloudflare CDN; origin requests to Hetzner are avoided for media.
- All public list endpoints support `If-None-Match` / ETag for conditional requests.
