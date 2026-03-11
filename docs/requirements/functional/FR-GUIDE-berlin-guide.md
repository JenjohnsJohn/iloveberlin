# FR-GUIDE: Berlin Guide

**Module:** Berlin Guide
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft
**Owner:** Platform Engineering

---

## 1. Overview

This document defines the functional requirements for the Berlin Guide module of the ILoveBerlin platform. The Berlin Guide provides authoritative, long-form content organized by topic, serving as a comprehensive resource for residents, visitors, students, and businesses. Each guide topic features auto-generated table of contents, scroll-spy navigation, cross-links to related articles/events/restaurants, and editorial last-reviewed dates to ensure content freshness.

---

## 2. User Stories References

| Story ID | Title |
|----------|-------|
| US-GUIDE-001 | As a newcomer to Berlin, I want comprehensive guides on living in the city so I can settle in quickly |
| US-GUIDE-002 | As a visitor, I want a guide to places to see so I can plan my trip |
| US-GUIDE-003 | As a reader, I want a table of contents to navigate long guide pages easily |
| US-GUIDE-004 | As a reader, I want scroll-spy navigation so I always know which section I am reading |
| US-GUIDE-005 | As a reader, I want to see when a guide was last reviewed to know if the information is current |
| US-GUIDE-006 | As a reader, I want cross-links to related articles, events, and restaurants within the guide |
| US-GUIDE-007 | As an editor, I want to create and manage guide topics and their content |
| US-GUIDE-008 | As an editor, I want to organize guide content into chapters and sections for readability |
| US-GUIDE-009 | As a user, I want to bookmark guide topics for later reference |
| US-GUIDE-010 | As a reader, I want to search within guides to find specific information |

---

## 3. Functional Requirements

### 3.1 Guide Topics

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-001 | The system SHALL support the following predefined top-level guide topics: Living in Berlin, Transportation, Laws & Regulations, Culture & Customs, Visiting Berlin, Work & Business, Places to See, Who's Who | Must |
| FR-GUIDE-002 | Admin users SHALL be able to create additional guide topics beyond the predefined set | Should |
| FR-GUIDE-003 | Each guide topic SHALL have: a title, slug, description, icon/image, display order, and a status (draft, published, archived) | Must |
| FR-GUIDE-004 | Each guide topic SHALL have a dedicated landing page accessible via `/guide/:topic-slug` | Must |
| FR-GUIDE-005 | The system SHALL provide a guide index page at `/guide` listing all published topics with their descriptions and icons | Must |
| FR-GUIDE-006 | Admin users SHALL be able to reorder guide topics on the index page | Must |
| FR-GUIDE-007 | Each guide topic SHALL display the last-reviewed date prominently at the top of the page | Must |
| FR-GUIDE-008 | Each guide topic SHALL display the original author and the editor who last reviewed it | Should |

### 3.2 Guide Content Structure

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-009 | Each guide topic SHALL support hierarchical content organized into chapters and sections | Must |
| FR-GUIDE-010 | A guide topic SHALL contain one or more chapters, each with a title and body content | Must |
| FR-GUIDE-011 | Each chapter SHALL contain one or more sections, each with a heading (H2 or H3) and body content | Must |
| FR-GUIDE-012 | The body content of chapters and sections SHALL use the same TipTap rich text editor as articles | Must |
| FR-GUIDE-013 | The system SHALL support the following content blocks within guide sections: paragraphs, headings, lists, tables, images, blockquotes, callout boxes (info, warning, tip), and embedded maps | Must |
| FR-GUIDE-014 | Each chapter and section SHALL have a display order for sequencing within the guide | Must |
| FR-GUIDE-015 | The system SHALL enforce a maximum of 20 chapters per guide topic | Should |
| FR-GUIDE-016 | The system SHALL enforce a maximum of 15 sections per chapter | Should |

### 3.3 Table of Contents (Auto-Generated)

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-017 | The system SHALL auto-generate a table of contents (TOC) from the chapter titles and section headings of each guide topic | Must |
| FR-GUIDE-018 | The TOC SHALL be hierarchical, reflecting the chapter/section structure with proper indentation | Must |
| FR-GUIDE-019 | Each TOC entry SHALL be an anchor link that scrolls smoothly to the corresponding section on the page | Must |
| FR-GUIDE-020 | The TOC SHALL be displayed in a sidebar on desktop viewports (sticky positioning) and as a collapsible menu on mobile viewports | Must |
| FR-GUIDE-021 | The TOC SHALL be regenerated each time the guide content is saved | Must |
| FR-GUIDE-022 | Each heading in the guide content SHALL have a unique, deterministic anchor ID generated from the heading text (slugified) | Must |

### 3.4 Scroll-Spy Navigation

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-023 | The system SHALL implement scroll-spy behavior: as the user scrolls through the guide content, the corresponding TOC entry SHALL be visually highlighted | Must |
| FR-GUIDE-024 | The scroll-spy SHALL update the browser URL hash to reflect the currently visible section, enabling deep linking | Must |
| FR-GUIDE-025 | When a user navigates to a guide URL with a hash fragment, the page SHALL automatically scroll to the referenced section | Must |
| FR-GUIDE-026 | The scroll-spy SHALL use the Intersection Observer API for performant detection of visible sections | Should |
| FR-GUIDE-027 | On mobile, the scroll-spy SHALL update a sticky header showing the current chapter/section title | Should |

### 3.5 Last-Reviewed Date & Content Freshness

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-028 | Each guide topic SHALL have a `last_reviewed_at` date that is distinct from the `updated_at` timestamp | Must |
| FR-GUIDE-029 | The `last_reviewed_at` date SHALL only be updated when an editor explicitly marks the guide as reviewed (not on every minor edit) | Must |
| FR-GUIDE-030 | The system SHALL display a freshness indicator based on the `last_reviewed_at` date: "Up to date" (reviewed within 3 months), "Review recommended" (3-6 months), "May be outdated" (over 6 months) | Must |
| FR-GUIDE-031 | The system SHALL send an internal notification to editors when a guide topic has not been reviewed for 3 months | Should |
| FR-GUIDE-032 | The last-reviewed date and reviewer name SHALL be displayed at the top of the guide page | Must |

### 3.6 Cross-Linking

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-033 | The system SHALL support cross-linking guide content to related articles, events, and restaurants | Must |
| FR-GUIDE-034 | Cross-links SHALL be manageable per guide topic by editors, associating related content items | Must |
| FR-GUIDE-035 | The guide page SHALL display a "Related Articles" section showing up to 6 linked articles | Must |
| FR-GUIDE-036 | The guide page SHALL display a "Related Events" section showing up to 4 linked upcoming events (future dates only) | Must |
| FR-GUIDE-037 | The guide page SHALL display a "Related Restaurants" section showing up to 4 linked restaurants (for relevant topics like Visiting Berlin, Culture) | Should |
| FR-GUIDE-038 | Cross-linked items SHALL be displayed with: title/name, thumbnail image, and a brief description | Must |
| FR-GUIDE-039 | The system SHALL support inline cross-links within the guide body text, rendered as styled internal links to articles, events, or restaurants | Should |
| FR-GUIDE-040 | Editors SHALL be able to add inline cross-links via the TipTap editor using an autocomplete picker for content selection | Should |

### 3.7 Guide Bookmarks & Search

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-041 | Authenticated users SHALL be able to bookmark guide topics (references FR-USER-027) | Must |
| FR-GUIDE-042 | The guide detail API response SHALL include `is_bookmarked: true/false` for authenticated users | Must |
| FR-GUIDE-043 | Guide content SHALL be indexed in Meilisearch for full-text search | Must |
| FR-GUIDE-044 | The search index SHALL include: topic title, chapter titles, section headings, and body text | Must |
| FR-GUIDE-045 | Search results for guides SHALL deep-link to the specific section within the guide that matched the query | Should |

### 3.8 Guide Editorial Workflow

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-GUIDE-046 | The system SHALL support the following guide statuses: `draft`, `published`, `archived` | Must |
| FR-GUIDE-047 | Only users with `editor`+ roles SHALL be able to create and edit guide topics | Must |
| FR-GUIDE-048 | Only users with `editor`+ roles SHALL be able to publish or archive guide topics | Must |
| FR-GUIDE-049 | The system SHALL create a revision record each time the guide content is saved, storing the full content state | Must |
| FR-GUIDE-050 | The system SHALL retain the last 30 revisions per guide topic | Must |
| FR-GUIDE-051 | Editors SHALL be able to view revision history and restore any previous revision | Must |
| FR-GUIDE-052 | The system SHALL track and display the estimated read time for the entire guide topic | Should |

---

## 4. Database Schema

### 4.1 Table: `guide_topics`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Topic identifier |
| `title` | `VARCHAR(200)` | NOT NULL | Topic title |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Short description for the index page |
| `icon_url` | `VARCHAR(500)` | NULLABLE | Topic icon/image URL |
| `featured_image_url` | `VARCHAR(500)` | NULLABLE | Featured image for the topic page |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft' | Status: draft, published, archived |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Order on the guide index page |
| `author_id` | `UUID` | FK -> users.id, NOT NULL | Original author |
| `last_reviewed_at` | `TIMESTAMPTZ` | NULLABLE | Last editorial review date |
| `last_reviewed_by` | `UUID` | FK -> users.id, NULLABLE | Editor who last reviewed |
| `read_time_minutes` | `INTEGER` | NOT NULL, DEFAULT 1 | Estimated read time for entire guide |
| `word_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Total word count across all chapters/sections |
| `published_at` | `TIMESTAMPTZ` | NULLABLE | First publication timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_guide_topics_slug` UNIQUE ON (`slug`)
- `idx_guide_topics_status` ON (`status`, `display_order`)
- `idx_guide_topics_review` ON (`last_reviewed_at`)

### 4.2 Table: `guide_chapters`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Chapter identifier |
| `topic_id` | `UUID` | FK -> guide_topics.id, NOT NULL | Parent topic |
| `title` | `VARCHAR(200)` | NOT NULL | Chapter title |
| `anchor_id` | `VARCHAR(100)` | NOT NULL | Slugified anchor identifier |
| `display_order` | `INTEGER` | NOT NULL | Order within the topic |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_guide_chapters_topic` ON (`topic_id`, `display_order`)
- `idx_guide_chapters_anchor` UNIQUE ON (`topic_id`, `anchor_id`)

### 4.3 Table: `guide_sections`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Section identifier |
| `chapter_id` | `UUID` | FK -> guide_chapters.id, NOT NULL | Parent chapter |
| `heading` | `VARCHAR(200)` | NOT NULL | Section heading |
| `anchor_id` | `VARCHAR(100)` | NOT NULL | Slugified anchor identifier |
| `heading_level` | `INTEGER` | NOT NULL, DEFAULT 2 | Heading level: 2 (H2) or 3 (H3) |
| `body` | `JSONB` | NOT NULL | TipTap JSON content |
| `body_text` | `TEXT` | NOT NULL | Plain text extraction for search |
| `display_order` | `INTEGER` | NOT NULL | Order within the chapter |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_guide_sections_chapter` ON (`chapter_id`, `display_order`)
- `idx_guide_sections_anchor` UNIQUE ON (`chapter_id`, `anchor_id`)

### 4.4 Table: `guide_toc`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `topic_id` | `UUID` | FK -> guide_topics.id, UNIQUE, NOT NULL | Parent topic |
| `toc_data` | `JSONB` | NOT NULL | Structured TOC data |
| `generated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Generation timestamp |

**`toc_data` JSONB structure:**
```json
[
  {
    "type": "chapter",
    "title": "Getting Started",
    "anchor_id": "getting-started",
    "sections": [
      {
        "type": "section",
        "title": "Registration Requirements",
        "anchor_id": "registration-requirements",
        "heading_level": 2
      },
      {
        "type": "section",
        "title": "Required Documents",
        "anchor_id": "required-documents",
        "heading_level": 3
      }
    ]
  }
]
```

**Indexes:**
- `idx_guide_toc_topic_id` UNIQUE ON (`topic_id`)

### 4.5 Table: `guide_cross_links`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `topic_id` | `UUID` | FK -> guide_topics.id, NOT NULL | Source guide topic |
| `content_type` | `VARCHAR(20)` | NOT NULL | Linked content type: article, event, restaurant |
| `content_id` | `UUID` | NOT NULL | ID of the linked content |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Order within the cross-links section |
| `link_context` | `VARCHAR(200)` | NULLABLE | Optional editorial note on why this is linked |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Editor who created the link |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_guide_cross_links_topic` ON (`topic_id`, `content_type`, `display_order`)
- `idx_guide_cross_links_content` ON (`content_type`, `content_id`)
- `idx_guide_cross_links_unique` UNIQUE ON (`topic_id`, `content_type`, `content_id`)

### 4.6 Table: `guide_revisions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Revision identifier |
| `topic_id` | `UUID` | FK -> guide_topics.id, NOT NULL | Associated guide topic |
| `revision_number` | `INTEGER` | NOT NULL | Sequential revision number |
| `content_snapshot` | `JSONB` | NOT NULL | Full snapshot of all chapters and sections |
| `changed_by` | `UUID` | FK -> users.id, NOT NULL | User who made changes |
| `change_summary` | `VARCHAR(500)` | NULLABLE | Summary of what changed |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Revision timestamp |

**`content_snapshot` JSONB structure:**
```json
{
  "title": "Living in Berlin",
  "description": "...",
  "chapters": [
    {
      "title": "Getting Started",
      "display_order": 1,
      "sections": [
        {
          "heading": "Registration Requirements",
          "heading_level": 2,
          "body": {},
          "display_order": 1
        }
      ]
    }
  ]
}
```

**Indexes:**
- `idx_guide_revisions_topic` ON (`topic_id`, `revision_number` DESC)

---

## 5. API Endpoints

### 5.1 Public Guide Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/guide` | Public | List all published guide topics | FR-GUIDE-005 |
| `GET` | `/api/v1/guide/:slug` | Public | Get a full guide topic with all content | FR-GUIDE-004 |
| `GET` | `/api/v1/guide/:slug/toc` | Public | Get the table of contents for a guide topic | FR-GUIDE-017 to 022 |
| `GET` | `/api/v1/guide/:slug/cross-links` | Public | Get cross-linked content for a guide topic | FR-GUIDE-033 to 038 |
| `GET` | `/api/v1/guide/search` | Public | Search across all guide content | FR-GUIDE-043 to 045 |

**`GET /api/v1/guide`**

Response `200 OK`:
```json
{
  "topics": [
    {
      "id": "uuid",
      "title": "Living in Berlin",
      "slug": "living-in-berlin",
      "description": "Everything you need to know about settling in Berlin...",
      "icon_url": "https://cdn.iloveberlin.biz/guide/icons/living.svg",
      "featured_image_url": "https://cdn.iloveberlin.biz/guide/featured/living.webp",
      "display_order": 1,
      "read_time_minutes": 25,
      "last_reviewed_at": "2026-02-15T10:00:00Z",
      "freshness": "up_to_date",
      "chapter_count": 6
    }
  ]
}
```

**`GET /api/v1/guide/:slug`**

Response `200 OK`:
```json
{
  "id": "uuid",
  "title": "Living in Berlin",
  "slug": "living-in-berlin",
  "description": "Everything you need to know about settling in Berlin...",
  "featured_image_url": "https://cdn.iloveberlin.biz/guide/featured/living.webp",
  "author": {
    "id": "uuid",
    "display_name": "string",
    "avatar_thumbnail_url": "string"
  },
  "last_reviewed_at": "2026-02-15T10:00:00Z",
  "last_reviewed_by": {
    "id": "uuid",
    "display_name": "string"
  },
  "freshness": "up_to_date",
  "read_time_minutes": 25,
  "word_count": 5000,
  "published_at": "2025-06-01T08:00:00Z",
  "updated_at": "2026-02-15T10:00:00Z",
  "is_bookmarked": false,
  "chapters": [
    {
      "id": "uuid",
      "title": "Getting Started",
      "anchor_id": "getting-started",
      "display_order": 1,
      "sections": [
        {
          "id": "uuid",
          "heading": "Registration Requirements",
          "anchor_id": "registration-requirements",
          "heading_level": 2,
          "body_html": "<p>When you move to Berlin, you must register your address...</p>",
          "display_order": 1
        },
        {
          "id": "uuid",
          "heading": "Required Documents",
          "anchor_id": "required-documents",
          "heading_level": 3,
          "body_html": "<p>You will need the following documents...</p>",
          "display_order": 2
        }
      ]
    }
  ],
  "toc": [
    {
      "type": "chapter",
      "title": "Getting Started",
      "anchor_id": "getting-started",
      "sections": [
        {
          "type": "section",
          "title": "Registration Requirements",
          "anchor_id": "registration-requirements",
          "heading_level": 2
        }
      ]
    }
  ],
  "seo": {
    "meta_title": "Living in Berlin - Complete Guide | ILoveBerlin",
    "meta_description": "Everything you need to know about settling in Berlin...",
    "canonical_url": "https://iloveberlin.biz/guide/living-in-berlin",
    "json_ld": {}
  }
}
```

Error Responses:
- `404 Not Found` - Guide topic not found or not published

**`GET /api/v1/guide/:slug/cross-links`**

Response `200 OK`:
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Top 10 Tips for New Berlin Residents",
      "slug": "top-10-tips-new-berlin-residents",
      "featured_image_url": "string",
      "excerpt": "string",
      "published_at": "2026-03-01T10:00:00Z",
      "link_context": "Great overview for newcomers"
    }
  ],
  "events": [
    {
      "id": "uuid",
      "title": "Newcomers Welcome Meet-up",
      "slug": "newcomers-welcome-meetup-march",
      "image_url": "string",
      "start_date": "2026-03-20T18:00:00Z",
      "venue_name": "Kulturbrauerei",
      "district": "Prenzlauer Berg"
    }
  ],
  "restaurants": [
    {
      "id": "uuid",
      "name": "Mustafa's Gemuse Kebap",
      "slug": "mustafas-gemuse-kebap",
      "photo_url": "string",
      "cuisines": ["Turkish", "Street Food"],
      "district": "Kreuzberg",
      "average_rating": 4.7
    }
  ]
}
```

**`GET /api/v1/guide/search`**

Query Parameters:
- `q` - Search query (required, min 2 characters)
- `topic` - Filter by topic slug (optional)
- `limit` - Results per page (default 10, max 30)
- `offset` - Offset for pagination (default 0)

Response `200 OK`:
```json
{
  "query": "string",
  "hits": [
    {
      "topic_id": "uuid",
      "topic_title": "Living in Berlin",
      "topic_slug": "living-in-berlin",
      "section_heading": "Registration Requirements",
      "section_anchor_id": "registration-requirements",
      "chapter_title": "Getting Started",
      "_formatted": {
        "section_heading": "<mark>Registration</mark> Requirements",
        "body_text": "When you move to Berlin, you must <mark>register</mark> your address..."
      },
      "deep_link": "/guide/living-in-berlin#registration-requirements"
    }
  ],
  "total_hits": 15,
  "processing_time_ms": 8
}
```

### 5.2 Admin Guide Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/guide/topics` | Editor+ | List all guide topics (all statuses) | FR-GUIDE-047 |
| `POST` | `/api/v1/admin/guide/topics` | Editor+ | Create a new guide topic | FR-GUIDE-002, 003 |
| `PATCH` | `/api/v1/admin/guide/topics/:id` | Editor+ | Update a guide topic's metadata | FR-GUIDE-003 |
| `POST` | `/api/v1/admin/guide/topics/:id/publish` | Editor+ | Publish a guide topic | FR-GUIDE-048 |
| `POST` | `/api/v1/admin/guide/topics/:id/archive` | Editor+ | Archive a guide topic | FR-GUIDE-048 |
| `POST` | `/api/v1/admin/guide/topics/:id/review` | Editor+ | Mark a guide as reviewed (updates last_reviewed_at) | FR-GUIDE-028, 029 |
| `POST` | `/api/v1/admin/guide/topics/reorder` | Editor+ | Reorder guide topics on the index page | FR-GUIDE-006 |
| `DELETE` | `/api/v1/admin/guide/topics/:id` | Admin+ | Delete a guide topic (soft delete) | FR-GUIDE-047 |

**`POST /api/v1/admin/guide/topics`**

Request Body:
```json
{
  "title": "string (required, max 200 chars)",
  "slug": "string (optional, auto-generated from title)",
  "description": "string (optional)",
  "icon_url": "string (optional)",
  "featured_image_url": "string (optional)"
}
```

Response `201 Created`: Full topic object with `status: "draft"`.

**`POST /api/v1/admin/guide/topics/:id/review`**

Request Body:
```json
{
  "review_notes": "string (optional, internal notes about what was reviewed)"
}
```

Response `200 OK`:
```json
{
  "topic_id": "uuid",
  "last_reviewed_at": "2026-03-11T14:30:00Z",
  "last_reviewed_by": {
    "id": "uuid",
    "display_name": "string"
  }
}
```

### 5.3 Chapter & Section Management Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/guide/topics/:topicId/chapters` | Editor+ | List chapters for a topic (with sections) | FR-GUIDE-009 to 016 |
| `POST` | `/api/v1/admin/guide/topics/:topicId/chapters` | Editor+ | Create a new chapter | FR-GUIDE-010 |
| `PATCH` | `/api/v1/admin/guide/chapters/:id` | Editor+ | Update a chapter (title, order) | FR-GUIDE-010 |
| `DELETE` | `/api/v1/admin/guide/chapters/:id` | Editor+ | Delete a chapter and all its sections | FR-GUIDE-010 |
| `POST` | `/api/v1/admin/guide/topics/:topicId/chapters/reorder` | Editor+ | Reorder chapters within a topic | FR-GUIDE-014 |
| `POST` | `/api/v1/admin/guide/chapters/:chapterId/sections` | Editor+ | Create a new section | FR-GUIDE-011 |
| `PATCH` | `/api/v1/admin/guide/sections/:id` | Editor+ | Update a section (heading, body, order) | FR-GUIDE-011, 012 |
| `DELETE` | `/api/v1/admin/guide/sections/:id` | Editor+ | Delete a section | FR-GUIDE-011 |
| `POST` | `/api/v1/admin/guide/chapters/:chapterId/sections/reorder` | Editor+ | Reorder sections within a chapter | FR-GUIDE-014 |

**`POST /api/v1/admin/guide/chapters/:chapterId/sections`**

Request Body:
```json
{
  "heading": "string (required, max 200 chars)",
  "heading_level": 2,
  "body": {},
  "display_order": 1
}
```

Response `201 Created`: Full section object.

### 5.4 Cross-Link Management Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/guide/topics/:topicId/cross-links` | Editor+ | List cross-links for a topic | FR-GUIDE-034 |
| `POST` | `/api/v1/admin/guide/topics/:topicId/cross-links` | Editor+ | Add a cross-link | FR-GUIDE-034 |
| `PATCH` | `/api/v1/admin/guide/cross-links/:id` | Editor+ | Update a cross-link (order, context) | FR-GUIDE-034 |
| `DELETE` | `/api/v1/admin/guide/cross-links/:id` | Editor+ | Remove a cross-link | FR-GUIDE-034 |

**`POST /api/v1/admin/guide/topics/:topicId/cross-links`**

Request Body:
```json
{
  "content_type": "article | event | restaurant",
  "content_id": "uuid (required)",
  "display_order": 1,
  "link_context": "string (optional, max 200 chars)"
}
```

Response `201 Created`: Full cross-link object.

Error Responses:
- `404 Not Found` - Content not found
- `409 Conflict` - Cross-link already exists for this topic and content

### 5.5 Revision Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/guide/topics/:topicId/revisions` | Editor+ | List revisions for a guide topic | FR-GUIDE-051 |
| `GET` | `/api/v1/admin/guide/revisions/:id` | Editor+ | Get a specific revision (full content snapshot) | FR-GUIDE-051 |
| `POST` | `/api/v1/admin/guide/revisions/:id/restore` | Editor+ | Restore a previous revision | FR-GUIDE-051 |

---

## 6. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Review Reminder | Daily at 09:00 UTC | Notify editors of guide topics not reviewed in 3+ months |
| TOC Regeneration | On save (event-driven) | Regenerate the TOC JSON when guide content is saved |
| Meilisearch Index Sync | Near real-time (event-driven) | Update guide content in Meilisearch when published or updated |
| Word Count & Read Time | On save (event-driven) | Recalculate word count and read time for the guide topic |
| Revision Pruning | Daily at 03:00 UTC | Delete revisions beyond the 30 most recent per guide topic |
| Cross-Link Validation | Weekly | Check all cross-links for broken references (archived/deleted content) and notify editors |

---

## 7. Meilisearch Index Configuration

**Index Name:** `guides`

**Searchable Attributes (ranked):**
1. `topic_title`
2. `chapter_title`
3. `section_heading`
4. `body_text`

**Filterable Attributes:**
- `topic_slug`
- `status`

**Sortable Attributes:**
- `topic_title`
- `last_reviewed_at`

**Ranking Rules:**
1. `words`
2. `typo`
3. `proximity`
4. `attribute`
5. `sort`
6. `exactness`
