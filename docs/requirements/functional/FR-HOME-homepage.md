# FR-HOME: Homepage

**Module:** Homepage
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft
**Owner:** Platform Engineering

---

## 1. Overview

This document defines the functional requirements for the ILoveBerlin platform homepage. The homepage serves as the primary entry point and discovery surface, presenting a curated mix of hero stories, trending articles, featured events, weekend picks, dining highlights, videos, community stories, competitions, and featured classifieds. Each section supports admin curation with intelligent fallback to algorithmic selection.

---

## 2. User Stories References

| Story ID | Title |
|----------|-------|
| US-HOME-001 | As a visitor, I want to see compelling featured stories so I can discover Berlin's best content |
| US-HOME-002 | As a visitor, I want to see trending articles so I know what is popular right now |
| US-HOME-003 | As a visitor, I want to see featured events so I can plan my upcoming activities |
| US-HOME-004 | As a visitor, I want weekend picks so I can plan my weekend |
| US-HOME-005 | As a visitor, I want dining highlights so I can discover new restaurants |
| US-HOME-006 | As a visitor, I want to watch the latest videos about Berlin |
| US-HOME-007 | As a visitor, I want to read community stories from other residents |
| US-HOME-008 | As a visitor, I want to see active competitions I can enter |
| US-HOME-009 | As a visitor, I want to browse featured classifieds listings |
| US-HOME-010 | As an admin, I want to curate each homepage section so I can control the editorial narrative |
| US-HOME-011 | As a visitor, I want the hero section to auto-rotate so I see multiple featured stories |
| US-HOME-012 | As a visitor, I want the homepage to load fast even on mobile connections |

---

## 3. Functional Requirements

### 3.1 Hero Stories Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-001 | The homepage SHALL display a hero section containing exactly 5 featured stories | Must |
| FR-HOME-002 | Each hero story SHALL display: featured image, headline, excerpt (max 160 characters), category badge, and publication date | Must |
| FR-HOME-003 | The hero section SHALL auto-rotate through the 5 stories with a 6-second interval | Must |
| FR-HOME-004 | The auto-rotation SHALL pause when the user hovers over the hero section (desktop) or touches it (mobile) | Must |
| FR-HOME-005 | The hero section SHALL display navigation indicators (dots or thumbnails) allowing direct access to any of the 5 stories | Must |
| FR-HOME-006 | The hero section SHALL support swipe gestures for navigation on touch devices | Must |
| FR-HOME-007 | Admin users SHALL be able to manually select and order the 5 hero stories from published articles | Must |
| FR-HOME-008 | If fewer than 5 stories are manually curated, the system SHALL fill remaining slots with the most recent published articles that have a featured image | Must |
| FR-HOME-009 | Hero stories SHALL link to the full article when clicked | Must |
| FR-HOME-010 | The hero section SHALL use responsive images with `srcset` for optimal loading across device sizes | Should |

### 3.2 Trending Articles Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-011 | The homepage SHALL display a "Trending" section showing the top 6 trending articles | Must |
| FR-HOME-012 | Trending articles SHALL be determined by a weighted score combining: view count (last 48 hours), bookmark count (last 48 hours), and share count (last 48 hours) | Must |
| FR-HOME-013 | Each trending article card SHALL display: thumbnail image, headline, category, publication date, and view count | Must |
| FR-HOME-014 | Admin users SHALL be able to pin specific articles to the trending section, overriding the algorithmic selection | Should |
| FR-HOME-015 | Admin users SHALL be able to exclude specific articles from appearing in the trending section | Should |
| FR-HOME-016 | The trending data SHALL be recalculated every 15 minutes via a background job | Must |
| FR-HOME-017 | Articles older than 7 days SHALL be excluded from the trending calculation unless pinned by an admin | Should |

### 3.3 Featured Events Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-018 | The homepage SHALL display a "Featured Events" section showing up to 8 upcoming events | Must |
| FR-HOME-019 | Each event card SHALL display: event image, title, date and time, venue name, district, and category badge | Must |
| FR-HOME-020 | Events SHALL be ordered by start date (soonest first), showing only events with a start date in the future | Must |
| FR-HOME-021 | Admin users SHALL be able to manually select and order featured events, overriding the default chronological selection | Must |
| FR-HOME-022 | The section SHALL include a "View All Events" link to the full events listing page | Must |
| FR-HOME-023 | Past events SHALL be automatically removed from the featured events section | Must |

### 3.4 Weekend Picks Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-024 | The homepage SHALL display a "Weekend Picks" section from Wednesday through Sunday each week | Must |
| FR-HOME-025 | Weekend picks SHALL display up to 6 curated items, which may be articles, events, or restaurants | Must |
| FR-HOME-026 | Each weekend pick card SHALL display: image, title, type indicator (article/event/restaurant), and a short blurb (max 120 characters) | Must |
| FR-HOME-027 | Admin users SHALL be able to curate weekend picks each week with a start and end date for display | Must |
| FR-HOME-028 | If no weekend picks are curated for the current week, the section SHALL be hidden | Must |
| FR-HOME-029 | Weekend picks from past weeks SHALL automatically stop displaying | Must |
| FR-HOME-030 | Outside of the Wednesday-to-Sunday window, the section SHALL be hidden unless manually overridden by an admin | Should |

### 3.5 Dining Highlights Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-031 | The homepage SHALL display a "Dining Highlights" section showing up to 6 featured restaurants | Must |
| FR-HOME-032 | Each dining card SHALL display: restaurant photo, name, cuisine type(s), district, price range indicator, and average rating | Must |
| FR-HOME-033 | Admin users SHALL be able to manually select featured restaurants | Must |
| FR-HOME-034 | If fewer than 6 restaurants are manually selected, the system SHALL fill remaining slots with top-rated restaurants | Must |
| FR-HOME-035 | The section SHALL include a "Explore All Restaurants" link to the dining section | Must |
| FR-HOME-036 | Restaurants with active dining offers SHALL display an "Offer" badge on their card | Should |

### 3.6 Latest Videos Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-037 | The homepage SHALL display a "Latest Videos" section showing up to 4 videos | Must |
| FR-HOME-038 | Each video card SHALL display: video thumbnail, title, duration, and publication date | Must |
| FR-HOME-039 | Videos SHALL be sourced from articles that contain embedded video content (YouTube, Vimeo) | Must |
| FR-HOME-040 | Clicking a video card SHALL navigate to the parent article | Must |
| FR-HOME-041 | Admin users SHALL be able to manually curate featured videos | Should |
| FR-HOME-042 | Video thumbnails SHALL be lazy-loaded to optimize page performance | Must |

### 3.7 Community Stories Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-043 | The homepage SHALL display a "Community Stories" section showing up to 4 user-contributed stories | Must |
| FR-HOME-044 | Community stories are articles published by users with the `author` role and tagged as "community" | Must |
| FR-HOME-045 | Each community story card SHALL display: author avatar, author display name, article title, excerpt, and publication date | Must |
| FR-HOME-046 | Admin users SHALL be able to feature or hide specific community stories from the homepage | Must |
| FR-HOME-047 | The section SHALL include a "Share Your Story" call-to-action link for authenticated users and a "Read More Stories" link for all visitors | Should |

### 3.8 Competitions Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-048 | The homepage SHALL display a "Competitions" section showing up to 3 active competitions | Must |
| FR-HOME-049 | Each competition card SHALL display: banner image, title, prize description, entry deadline, and a "Enter Now" button | Must |
| FR-HOME-050 | Only competitions with a deadline in the future SHALL be displayed | Must |
| FR-HOME-051 | Competitions SHALL be ordered by deadline (soonest first) | Must |
| FR-HOME-052 | The section SHALL be hidden when there are no active competitions | Must |
| FR-HOME-053 | Admin users SHALL be able to create and manage competitions with: title, description, banner image, prize description, entry URL/form, start date, and deadline | Must |

### 3.9 Featured Classifieds Section

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-054 | The homepage SHALL display a "Featured Classifieds" section showing up to 6 featured classified listings | Must |
| FR-HOME-055 | Each classified card SHALL display: thumbnail image (if available), title, category, price (if applicable), and posting date | Must |
| FR-HOME-056 | Admin users SHALL be able to select which classifieds appear as featured on the homepage | Must |
| FR-HOME-057 | Only active (non-expired) classifieds SHALL be displayed | Must |
| FR-HOME-058 | The section SHALL include a "Browse All Classifieds" link | Must |

### 3.10 Admin Curation Controls

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-059 | The system SHALL provide an admin dashboard page for homepage curation | Must |
| FR-HOME-060 | The curation dashboard SHALL allow drag-and-drop reordering of items within each section | Should |
| FR-HOME-061 | The curation dashboard SHALL show a preview of the homepage as visitors will see it | Should |
| FR-HOME-062 | Each section's curation SHALL support a "publish date" and "expiry date" for time-limited featured content | Should |
| FR-HOME-063 | The system SHALL log all curation changes in an audit log with: admin user ID, section, action, previous state, new state, and timestamp | Must |
| FR-HOME-064 | The curation state SHALL be cached in a server-side cache (Redis or in-memory) with a TTL of 5 minutes, refreshable on demand by admin action | Must |
| FR-HOME-065 | Admin users SHALL be able to force-refresh the homepage cache immediately after making curation changes | Must |

### 3.11 General Homepage Requirements

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-HOME-066 | The homepage SHALL load with a target Largest Contentful Paint (LCP) under 2.5 seconds on a 4G connection | Must |
| FR-HOME-067 | The homepage API response SHALL be served from Cloudflare CDN cache with a TTL of 5 minutes for unauthenticated requests | Must |
| FR-HOME-068 | The homepage SHALL implement skeleton loading states for each section while data is being fetched | Should |
| FR-HOME-069 | The homepage layout SHALL be fully responsive across desktop (1200px+), tablet (768-1199px), and mobile (<768px) breakpoints | Must |
| FR-HOME-070 | The homepage SHALL support server-side rendering (SSR) via Next.js for SEO and initial load performance | Must |

---

## 4. Database Schema

### 4.1 Table: `homepage_sections`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Section identifier |
| `section_type` | `VARCHAR(30)` | UNIQUE, NOT NULL | Section identifier: hero, trending, events, weekend_picks, dining, videos, community, competitions, classifieds |
| `display_name` | `VARCHAR(100)` | NOT NULL | Human-readable section name |
| `is_visible` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Whether the section is displayed |
| `display_order` | `INTEGER` | NOT NULL | Order of the section on the page |
| `config` | `JSONB` | NOT NULL, DEFAULT '{}' | Section-specific configuration (item count, rotation speed, etc.) |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `updated_by` | `UUID` | FK -> users.id, NULLABLE | Admin who last updated |

**Indexes:**
- `idx_homepage_sections_type` UNIQUE ON (`section_type`)
- `idx_homepage_sections_order` ON (`display_order`)

### 4.2 Table: `homepage_curated_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `section_type` | `VARCHAR(30)` | FK -> homepage_sections.section_type, NOT NULL | Which section this belongs to |
| `content_type` | `VARCHAR(20)` | NOT NULL | Type: article, event, restaurant, video, competition, classified |
| `content_id` | `UUID` | NOT NULL | ID of the curated content |
| `display_order` | `INTEGER` | NOT NULL | Order within the section |
| `custom_headline` | `VARCHAR(200)` | NULLABLE | Override headline for this placement |
| `custom_excerpt` | `VARCHAR(200)` | NULLABLE | Override excerpt for this placement |
| `custom_image_url` | `VARCHAR(500)` | NULLABLE | Override image for this placement |
| `blurb` | `VARCHAR(120)` | NULLABLE | Short blurb (used for weekend picks) |
| `is_pinned` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether this item is pinned (overrides algorithm) |
| `publish_at` | `TIMESTAMPTZ` | NULLABLE | Scheduled publish date for this curation |
| `expire_at` | `TIMESTAMPTZ` | NULLABLE | Scheduled expiry date for this curation |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Admin who curated this item |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_curated_items_section` ON (`section_type`, `display_order`)
- `idx_curated_items_content` ON (`content_type`, `content_id`)
- `idx_curated_items_publish` ON (`publish_at`, `expire_at`)

### 4.3 Table: `homepage_excluded_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `section_type` | `VARCHAR(30)` | NOT NULL | Section from which the item is excluded |
| `content_type` | `VARCHAR(20)` | NOT NULL | Content type |
| `content_id` | `UUID` | NOT NULL | ID of the excluded content |
| `excluded_by` | `UUID` | FK -> users.id, NOT NULL | Admin who excluded this |
| `reason` | `VARCHAR(255)` | NULLABLE | Reason for exclusion |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Exclusion timestamp |

**Indexes:**
- `idx_excluded_items_section_content` UNIQUE ON (`section_type`, `content_type`, `content_id`)

### 4.4 Table: `trending_scores`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `article_id` | `UUID` | FK -> articles.id, UNIQUE, NOT NULL | Article being scored |
| `view_count_48h` | `INTEGER` | NOT NULL, DEFAULT 0 | Views in last 48 hours |
| `bookmark_count_48h` | `INTEGER` | NOT NULL, DEFAULT 0 | Bookmarks in last 48 hours |
| `share_count_48h` | `INTEGER` | NOT NULL, DEFAULT 0 | Shares in last 48 hours |
| `weighted_score` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0 | Calculated weighted score |
| `calculated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last calculation timestamp |

**Indexes:**
- `idx_trending_scores_article_id` UNIQUE ON (`article_id`)
- `idx_trending_scores_weighted` ON (`weighted_score` DESC)

### 4.5 Table: `weekend_picks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `content_type` | `VARCHAR(20)` | NOT NULL | Type: article, event, restaurant |
| `content_id` | `UUID` | NOT NULL | ID of the picked content |
| `display_order` | `INTEGER` | NOT NULL | Order within the picks |
| `blurb` | `VARCHAR(120)` | NULLABLE | Custom short blurb |
| `display_start` | `DATE` | NOT NULL | Start date for display (Wednesday) |
| `display_end` | `DATE` | NOT NULL | End date for display (Sunday) |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Admin who created the pick |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_weekend_picks_dates` ON (`display_start`, `display_end`)
- `idx_weekend_picks_order` ON (`display_start`, `display_order`)

### 4.6 Table: `competitions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Competition identifier |
| `title` | `VARCHAR(200)` | NOT NULL | Competition title |
| `description` | `TEXT` | NOT NULL | Full description |
| `banner_image_url` | `VARCHAR(500)` | NOT NULL | Banner image URL |
| `prize_description` | `VARCHAR(500)` | NOT NULL | Description of the prize |
| `entry_url` | `VARCHAR(500)` | NULLABLE | External URL for entry form |
| `entry_form_config` | `JSONB` | NULLABLE | Internal form configuration (if not external) |
| `starts_at` | `TIMESTAMPTZ` | NOT NULL | Competition start date |
| `deadline` | `TIMESTAMPTZ` | NOT NULL | Entry deadline |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft' | Status: draft, active, closed, archived |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Admin who created |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_competitions_status_deadline` ON (`status`, `deadline`)
- `idx_competitions_starts_at` ON (`starts_at`)

### 4.7 Table: `homepage_audit_log`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `admin_user_id` | `UUID` | FK -> users.id, NOT NULL | Admin who made the change |
| `section_type` | `VARCHAR(30)` | NOT NULL | Section that was modified |
| `action` | `VARCHAR(30)` | NOT NULL | Action: add, remove, reorder, update, toggle_visibility |
| `previous_state` | `JSONB` | NULLABLE | State before the change |
| `new_state` | `JSONB` | NULLABLE | State after the change |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Change timestamp |

**Indexes:**
- `idx_homepage_audit_log_admin` ON (`admin_user_id`)
- `idx_homepage_audit_log_section` ON (`section_type`, `created_at` DESC)

---

## 5. API Endpoints

### 5.1 Public Homepage Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/homepage` | Public | Get full homepage data (all sections) | FR-HOME-001 to 070 |
| `GET` | `/api/v1/homepage/sections/:sectionType` | Public | Get data for a specific section | FR-HOME-001 to 058 |
| `GET` | `/api/v1/homepage/trending` | Public | Get trending articles | FR-HOME-011 to 017 |

**`GET /api/v1/homepage`**

Query Parameters:
- `sections` - Comma-separated list of section types to include (optional; default: all visible sections)

Response `200 OK`:
```json
{
  "sections": {
    "hero": {
      "items": [
        {
          "content_type": "article",
          "content_id": "uuid",
          "headline": "string",
          "excerpt": "string (max 160 chars)",
          "featured_image_url": "string",
          "featured_image_srcset": "string",
          "category": { "id": "uuid", "name": "string", "slug": "string" },
          "published_at": "2026-03-11T08:00:00Z",
          "slug": "string",
          "display_order": 1
        }
      ],
      "rotation_interval_ms": 6000
    },
    "trending": {
      "items": [
        {
          "content_type": "article",
          "content_id": "uuid",
          "headline": "string",
          "thumbnail_url": "string",
          "category": { "id": "uuid", "name": "string", "slug": "string" },
          "published_at": "2026-03-10T12:00:00Z",
          "view_count": 1234,
          "slug": "string",
          "is_pinned": false
        }
      ]
    },
    "events": {
      "items": [
        {
          "content_type": "event",
          "content_id": "uuid",
          "title": "string",
          "image_url": "string",
          "start_date": "2026-03-15T19:00:00Z",
          "end_date": "2026-03-15T23:00:00Z",
          "venue_name": "string",
          "district": "string",
          "category": "string",
          "slug": "string"
        }
      ],
      "view_all_url": "/events"
    },
    "weekend_picks": {
      "is_active": true,
      "display_start": "2026-03-11",
      "display_end": "2026-03-15",
      "items": [
        {
          "content_type": "event",
          "content_id": "uuid",
          "title": "string",
          "image_url": "string",
          "blurb": "string (max 120 chars)",
          "slug": "string"
        }
      ]
    },
    "dining": {
      "items": [
        {
          "content_type": "restaurant",
          "content_id": "uuid",
          "name": "string",
          "photo_url": "string",
          "cuisines": ["Italian", "Pizza"],
          "district": "Mitte",
          "price_range": "$$",
          "average_rating": 4.5,
          "has_active_offer": true,
          "slug": "string"
        }
      ],
      "view_all_url": "/dining"
    },
    "videos": {
      "items": [
        {
          "content_type": "video",
          "content_id": "uuid",
          "title": "string",
          "thumbnail_url": "string",
          "duration_seconds": 245,
          "article_slug": "string",
          "published_at": "2026-03-09T10:00:00Z"
        }
      ]
    },
    "community": {
      "items": [
        {
          "content_type": "article",
          "content_id": "uuid",
          "title": "string",
          "excerpt": "string",
          "author": {
            "display_name": "string",
            "avatar_thumbnail_url": "string"
          },
          "published_at": "2026-03-08T14:00:00Z",
          "slug": "string"
        }
      ]
    },
    "competitions": {
      "items": [
        {
          "content_type": "competition",
          "content_id": "uuid",
          "title": "string",
          "banner_image_url": "string",
          "prize_description": "string",
          "deadline": "2026-03-31T23:59:59Z",
          "entry_url": "string | null"
        }
      ]
    },
    "classifieds": {
      "items": [
        {
          "content_type": "classified",
          "content_id": "uuid",
          "title": "string",
          "thumbnail_url": "string | null",
          "category": "string",
          "price": "string | null",
          "posted_at": "2026-03-10T16:00:00Z",
          "slug": "string"
        }
      ],
      "view_all_url": "/classifieds"
    }
  },
  "cache_key": "string",
  "cached_at": "2026-03-11T14:30:00Z"
}
```

**Response Headers:**
- `Cache-Control: public, max-age=300, s-maxage=300`
- `CDN-Cache-Control: max-age=300`
- `ETag: "abc123"`

### 5.2 Admin Curation Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/homepage/sections` | Editor+ | List all sections with curation state | FR-HOME-059 |
| `PATCH` | `/api/v1/admin/homepage/sections/:sectionType` | Editor+ | Update section settings (visibility, config) | FR-HOME-059 to 065 |
| `GET` | `/api/v1/admin/homepage/sections/:sectionType/items` | Editor+ | List curated items for a section | FR-HOME-059 |
| `POST` | `/api/v1/admin/homepage/sections/:sectionType/items` | Editor+ | Add a curated item to a section | FR-HOME-007, 021, 033, 041, 046, 056 |
| `PATCH` | `/api/v1/admin/homepage/sections/:sectionType/items/:itemId` | Editor+ | Update a curated item (order, overrides) | FR-HOME-060 |
| `DELETE` | `/api/v1/admin/homepage/sections/:sectionType/items/:itemId` | Editor+ | Remove a curated item | FR-HOME-059 |
| `POST` | `/api/v1/admin/homepage/sections/:sectionType/reorder` | Editor+ | Reorder all items in a section | FR-HOME-060 |
| `POST` | `/api/v1/admin/homepage/sections/:sectionType/exclude` | Editor+ | Exclude an item from a section | FR-HOME-015 |
| `DELETE` | `/api/v1/admin/homepage/sections/:sectionType/exclude/:itemId` | Editor+ | Remove an exclusion | FR-HOME-015 |
| `POST` | `/api/v1/admin/homepage/cache/invalidate` | Editor+ | Force-refresh homepage cache | FR-HOME-065 |
| `GET` | `/api/v1/admin/homepage/audit-log` | Admin+ | View homepage curation audit log | FR-HOME-063 |

**`POST /api/v1/admin/homepage/sections/:sectionType/items`**

Request Body:
```json
{
  "content_type": "article",
  "content_id": "uuid",
  "display_order": 1,
  "custom_headline": "string (optional)",
  "custom_excerpt": "string (optional)",
  "custom_image_url": "string (optional)",
  "blurb": "string (optional, max 120 chars)",
  "is_pinned": false,
  "publish_at": "2026-03-12T00:00:00Z (optional)",
  "expire_at": "2026-03-18T23:59:59Z (optional)"
}
```

Response `201 Created`:
```json
{
  "id": "uuid",
  "section_type": "hero",
  "content_type": "article",
  "content_id": "uuid",
  "display_order": 1,
  "created_by": "uuid",
  "created_at": "2026-03-11T14:30:00Z"
}
```

Error Responses:
- `400 Bad Request` - Invalid content type or content not found
- `409 Conflict` - Content already curated in this section
- `422 Unprocessable Entity` - Section at maximum capacity

**`POST /api/v1/admin/homepage/sections/:sectionType/reorder`**

Request Body:
```json
{
  "item_ids": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5"]
}
```

Response `200 OK`:
```json
{
  "message": "Items reordered successfully.",
  "section_type": "hero"
}
```

**`POST /api/v1/admin/homepage/cache/invalidate`**

Response `200 OK`:
```json
{
  "message": "Homepage cache invalidated.",
  "new_cache_key": "string",
  "invalidated_at": "2026-03-11T14:35:00Z"
}
```

### 5.3 Competition Admin Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/competitions` | Editor+ | List all competitions | FR-HOME-053 |
| `POST` | `/api/v1/admin/competitions` | Editor+ | Create a competition | FR-HOME-053 |
| `GET` | `/api/v1/admin/competitions/:id` | Editor+ | Get competition details | FR-HOME-053 |
| `PATCH` | `/api/v1/admin/competitions/:id` | Editor+ | Update a competition | FR-HOME-053 |
| `DELETE` | `/api/v1/admin/competitions/:id` | Admin+ | Delete a competition | FR-HOME-053 |

**`POST /api/v1/admin/competitions`**

Request Body:
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required)",
  "banner_image_url": "string (required)",
  "prize_description": "string (required, max 500 chars)",
  "entry_url": "string (optional, valid URL)",
  "starts_at": "2026-03-15T00:00:00Z (required)",
  "deadline": "2026-03-31T23:59:59Z (required)",
  "status": "draft | active"
}
```

Response `201 Created`: Full competition object.

### 5.4 Weekend Picks Admin Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/weekend-picks` | Editor+ | List weekend picks (current and upcoming) | FR-HOME-027 |
| `POST` | `/api/v1/admin/weekend-picks` | Editor+ | Create weekend picks for a week | FR-HOME-027 |
| `PATCH` | `/api/v1/admin/weekend-picks/:id` | Editor+ | Update a weekend pick | FR-HOME-027 |
| `DELETE` | `/api/v1/admin/weekend-picks/:id` | Editor+ | Remove a weekend pick | FR-HOME-027 |

---

## 6. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Trending Score Calculation | Every 15 minutes | Recalculate trending scores for all articles published within the last 7 days |
| Competition Status Update | Daily at 00:05 UTC | Close competitions past their deadline; activate competitions past their start date |
| Homepage Cache Warm | Every 5 minutes | Pre-build and cache the homepage API response |
| Expired Curation Cleanup | Hourly | Remove curated items past their `expire_at` date |

---

## 7. Performance Requirements

| Metric | Target |
|--------|--------|
| Homepage API response time (cached) | < 50ms |
| Homepage API response time (cold) | < 500ms |
| Largest Contentful Paint (LCP) | < 2.5s on 4G |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Homepage payload size (gzipped) | < 100 KB |
