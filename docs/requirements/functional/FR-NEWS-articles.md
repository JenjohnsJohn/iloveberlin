# FR-NEWS: News & Articles

**Module:** News & Articles
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft
**Owner:** Platform Engineering

---

## 1. Overview

This document defines the functional requirements for the News & Articles module of the ILoveBerlin platform. Articles are the primary content type, supporting a full editorial workflow from draft creation through review, scheduling, publication, and archival. The system supports rich text editing via TipTap, media embedding, SEO optimization, revision history, and content discovery features.

---

## 2. User Stories References

| Story ID | Title |
|----------|-------|
| US-NEWS-001 | As an author, I want to create and save article drafts so I can work on content over time |
| US-NEWS-002 | As an author, I want to submit my article for editorial review |
| US-NEWS-003 | As an editor, I want to review submitted articles and approve, request changes, or reject them |
| US-NEWS-004 | As an editor, I want to schedule articles for future publication |
| US-NEWS-005 | As a visitor, I want to read published articles with a clean, readable layout |
| US-NEWS-006 | As a visitor, I want to browse articles by category and tag |
| US-NEWS-007 | As a visitor, I want to search articles by keyword |
| US-NEWS-008 | As an author, I want to embed images, videos, and other media in my articles |
| US-NEWS-009 | As an editor, I want SEO fields so articles rank well in search engines |
| US-NEWS-010 | As a user, I want to bookmark articles for later reading |
| US-NEWS-011 | As a user, I want to share articles on social media |
| US-NEWS-012 | As a visitor, I want to see related articles at the end of each article |
| US-NEWS-013 | As an editor, I want to see revision history and revert to previous versions |
| US-NEWS-014 | As a visitor, I want to see estimated read time for each article |
| US-NEWS-015 | As an admin, I want to archive outdated articles without deleting them |

---

## 3. Functional Requirements

### 3.1 Article CRUD

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-001 | The system SHALL allow users with roles `author`, `editor`, `admin`, or `superadmin` to create articles | Must |
| FR-NEWS-002 | The system SHALL require the following fields for article creation: title, body content, and category | Must |
| FR-NEWS-003 | The system SHALL support the following optional fields: subtitle, excerpt, featured image, tags, SEO fields, and featured image caption/alt text | Must |
| FR-NEWS-004 | The system SHALL allow the article creator and users with `editor`+ roles to edit an article | Must |
| FR-NEWS-005 | The system SHALL allow users with `editor`+ roles to delete articles (soft delete) | Must |
| FR-NEWS-006 | The system SHALL allow users with `admin`+ roles to permanently delete articles (hard delete) | Should |
| FR-NEWS-007 | The system SHALL validate the title length between 5 and 200 characters | Must |
| FR-NEWS-008 | The system SHALL validate the excerpt length to a maximum of 300 characters | Must |
| FR-NEWS-009 | The system SHALL auto-save article drafts every 60 seconds while the user is editing | Should |

### 3.2 Slug Generation

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-010 | The system SHALL auto-generate a URL-safe slug from the article title upon creation | Must |
| FR-NEWS-011 | The slug SHALL be created by: lowercasing, replacing spaces and special characters with hyphens, removing consecutive hyphens, and trimming to a maximum of 100 characters | Must |
| FR-NEWS-012 | The system SHALL ensure slug uniqueness by appending a numeric suffix (e.g., `-2`, `-3`) if a duplicate exists | Must |
| FR-NEWS-013 | The system SHALL allow editors to manually override the auto-generated slug | Should |
| FR-NEWS-014 | Once an article is published, changing its slug SHALL create a redirect from the old slug to the new one | Must |

### 3.3 Editorial Workflow

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-015 | The system SHALL enforce the following article status workflow: `draft` -> `in_review` -> `scheduled` OR `published` -> `archived` | Must |
| FR-NEWS-016 | An `author` SHALL be able to transition an article from `draft` to `in_review` (submit for review) | Must |
| FR-NEWS-017 | An `editor`+ SHALL be able to transition an article from `in_review` to `draft` (request changes, with a comment), `scheduled`, or `published` | Must |
| FR-NEWS-018 | An `editor`+ SHALL be able to transition an article from `published` to `archived` | Must |
| FR-NEWS-019 | An `editor`+ SHALL be able to transition an article from `archived` back to `draft` for reworking | Should |
| FR-NEWS-020 | An `editor`+ SHALL be able to transition an article directly from `draft` to `published` (bypassing review) | Must |
| FR-NEWS-021 | When an article is returned to `draft` from `in_review`, the system SHALL record the reviewer's comment explaining the requested changes | Must |
| FR-NEWS-022 | The system SHALL record every status transition with: previous status, new status, user who made the change, timestamp, and optional comment | Must |
| FR-NEWS-023 | The system SHALL notify the article author via email and in-app notification when their article's status changes | Should |

### 3.4 Scheduling

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-024 | The system SHALL allow editors to schedule an article for future publication by setting a `publish_at` date and time | Must |
| FR-NEWS-025 | When a scheduled article's `publish_at` time is reached, the system SHALL automatically transition its status from `scheduled` to `published` | Must |
| FR-NEWS-026 | The scheduling job SHALL run every minute to check for articles due for publication | Must |
| FR-NEWS-027 | The system SHALL validate that `publish_at` is at least 5 minutes in the future | Should |
| FR-NEWS-028 | An `editor`+ SHALL be able to cancel a scheduled publication by transitioning the article back to `draft` | Must |

### 3.5 Categories

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-029 | The system SHALL support the following predefined article categories: General, Entertainment, Arts & Culture, Community, Business, Sports, Travel, Health & Wellness, Education, Technology, Things to Do, Berlin 2026 | Must |
| FR-NEWS-030 | Each article SHALL be assigned exactly one primary category | Must |
| FR-NEWS-031 | Each category SHALL have: a name, a URL-safe slug, a description, and an optional icon/image | Must |
| FR-NEWS-032 | Admin users SHALL be able to create, edit, and deactivate categories | Must |
| FR-NEWS-033 | Deactivated categories SHALL not be available for new articles but SHALL remain visible on existing articles | Must |
| FR-NEWS-034 | Each category SHALL have a dedicated listing page showing all published articles in that category | Must |

### 3.6 Tags

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-035 | The system SHALL support free-form tags on articles | Must |
| FR-NEWS-036 | An article SHALL support up to 10 tags | Must |
| FR-NEWS-037 | Tags SHALL be normalized to lowercase with spaces replaced by hyphens | Must |
| FR-NEWS-038 | The system SHALL auto-suggest existing tags as the user types (minimum 2 characters) | Should |
| FR-NEWS-039 | Each tag SHALL have a dedicated listing page showing all published articles with that tag | Must |
| FR-NEWS-040 | The system SHALL maintain a tag usage count for sorting by popularity | Should |

### 3.7 Rich Text Editor (TipTap)

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-041 | The system SHALL provide a TipTap-based rich text editor for article body content | Must |
| FR-NEWS-042 | The editor SHALL support the following block types: paragraph, headings (H2, H3, H4), blockquote, ordered list, unordered list, code block, horizontal rule, and table | Must |
| FR-NEWS-043 | The editor SHALL support the following inline formats: bold, italic, underline, strikethrough, inline code, and hyperlink | Must |
| FR-NEWS-044 | The editor SHALL support image insertion with: upload from device, URL input, alt text, caption, and alignment (left, center, right, full-width) | Must |
| FR-NEWS-045 | The editor SHALL support video embedding from YouTube and Vimeo via URL paste, rendering as a responsive embed | Must |
| FR-NEWS-046 | The editor SHALL support social media embeds (Instagram, X/Twitter) via URL paste | Should |
| FR-NEWS-047 | The editor SHALL support a "pull quote" block type for editorial emphasis | Should |
| FR-NEWS-048 | The editor SHALL store content as structured JSON (TipTap JSON format) in the database | Must |
| FR-NEWS-049 | The system SHALL render the TipTap JSON to sanitized HTML for the frontend display | Must |
| FR-NEWS-050 | The system SHALL strip any potentially malicious HTML/scripts during rendering (XSS prevention) | Must |

### 3.8 Media Management

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-051 | The system SHALL allow uploading images in JPEG, PNG, WebP, and GIF formats with a maximum file size of 10 MB | Must |
| FR-NEWS-052 | The system SHALL generate responsive image variants upon upload: original, large (1200px wide), medium (800px wide), small (400px wide), and thumbnail (200px wide) | Must |
| FR-NEWS-053 | The system SHALL store all media files in Cloudflare R2 under the path `media/articles/{article_id}/{filename}` | Must |
| FR-NEWS-054 | The system SHALL serve media files via Cloudflare CDN with cache headers (max-age 604800) | Must |
| FR-NEWS-055 | Each uploaded image SHALL have associated metadata: filename, file size, MIME type, dimensions, alt text, caption, and uploader ID | Must |
| FR-NEWS-056 | The system SHALL provide a media library allowing editors to browse and reuse previously uploaded images | Should |

### 3.9 SEO Fields

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-057 | The system SHALL support the following SEO fields per article: meta title, meta description, canonical URL, and Open Graph image | Must |
| FR-NEWS-058 | If the meta title is not provided, the system SHALL default to the article title | Must |
| FR-NEWS-059 | If the meta description is not provided, the system SHALL default to the article excerpt | Must |
| FR-NEWS-060 | The system SHALL enforce a meta title length between 30 and 70 characters (with warning, not hard block) | Should |
| FR-NEWS-061 | The system SHALL enforce a meta description length between 120 and 160 characters (with warning, not hard block) | Should |
| FR-NEWS-062 | The system SHALL generate Open Graph and Twitter Card meta tags for every published article | Must |
| FR-NEWS-063 | The system SHALL generate a JSON-LD structured data block (Article schema) for every published article | Must |

### 3.10 View Counting & Read Time

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-064 | The system SHALL track view counts for every published article | Must |
| FR-NEWS-065 | View counts SHALL be incremented once per unique visitor per article per 24-hour period (based on IP address or authenticated user ID) | Must |
| FR-NEWS-066 | View count incrementing SHALL be performed asynchronously to not block the article page load | Must |
| FR-NEWS-067 | The system SHALL calculate and store an estimated read time for each article based on word count (average 200 words per minute) | Must |
| FR-NEWS-068 | Read time SHALL be recalculated whenever the article body content is updated | Must |
| FR-NEWS-069 | The read time SHALL be displayed on article cards and the article detail page in the format "X min read" | Must |

### 3.11 Revisions

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-070 | The system SHALL create a revision record every time an article's title, body, excerpt, or metadata is saved | Must |
| FR-NEWS-071 | Each revision SHALL store: the complete article state (title, body JSON, excerpt, SEO fields), the user who made the change, and a timestamp | Must |
| FR-NEWS-072 | The system SHALL retain the last 50 revisions per article | Must |
| FR-NEWS-073 | Users with `editor`+ roles SHALL be able to view the revision history for any article | Must |
| FR-NEWS-074 | Users with `editor`+ roles SHALL be able to preview any previous revision | Must |
| FR-NEWS-075 | Users with `editor`+ roles SHALL be able to restore a previous revision, which creates a new revision with the restored content | Must |
| FR-NEWS-076 | The system SHALL provide a diff view comparing any two revisions of the same article | Should |

### 3.12 Related Articles

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-077 | The system SHALL display up to 4 related articles at the end of each article page | Must |
| FR-NEWS-078 | Related articles SHALL be determined by: same category, shared tags, and recency (with configurable weights) | Must |
| FR-NEWS-079 | Editors SHALL be able to manually override related articles for any given article | Should |
| FR-NEWS-080 | Related articles SHALL only include published, non-archived articles | Must |
| FR-NEWS-081 | The related articles calculation SHALL be performed asynchronously and cached with a 1-hour TTL | Should |

### 3.13 Bookmarks & Social Sharing

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-082 | Authenticated users SHALL be able to bookmark articles (references FR-USER-027) | Must |
| FR-NEWS-083 | The article detail API response SHALL include `is_bookmarked: true/false` for authenticated users | Must |
| FR-NEWS-084 | The system SHALL provide share URLs for: Facebook, X/Twitter, LinkedIn, WhatsApp, Telegram, and email | Must |
| FR-NEWS-085 | The share URLs SHALL include UTM parameters for tracking: `utm_source`, `utm_medium=social`, `utm_campaign=article_share` | Should |
| FR-NEWS-086 | The system SHALL track share click events per article per platform | Should |
| FR-NEWS-087 | The system SHALL provide a "Copy Link" button that copies the article URL to the clipboard | Must |

### 3.14 Article Listing & Discovery

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-NEWS-088 | The system SHALL provide a paginated article listing endpoint with support for filtering and sorting | Must |
| FR-NEWS-089 | The listing SHALL support filtering by: category, tag, author, status (admin only), and date range | Must |
| FR-NEWS-090 | The listing SHALL support sorting by: `published_at` (default, newest first), `view_count`, `title` (alphabetical) | Must |
| FR-NEWS-091 | The listing SHALL use cursor-based pagination with a configurable page size (default 12, max 50) | Must |
| FR-NEWS-092 | Article search SHALL be powered by Meilisearch with indexing of: title, excerpt, body text, category name, tags, and author display name | Must |
| FR-NEWS-093 | The search endpoint SHALL support typo tolerance, faceted search (by category, tag, author), and highlighting of matched terms | Must |
| FR-NEWS-094 | The Meilisearch index SHALL be updated within 30 seconds of an article being published or updated | Must |

---

## 4. Database Schema

### 4.1 Table: `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Category identifier |
| `name` | `VARCHAR(100)` | UNIQUE, NOT NULL | Category name |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Category description |
| `icon_url` | `VARCHAR(500)` | NULLABLE | Category icon/image URL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Whether the category is available for new articles |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order in navigation |
| `article_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Cached count of published articles |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_categories_slug` UNIQUE ON (`slug`)
- `idx_categories_active` ON (`is_active`, `display_order`)

### 4.2 Table: `tags`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Tag identifier |
| `name` | `VARCHAR(50)` | UNIQUE, NOT NULL | Tag name (normalized lowercase) |
| `slug` | `VARCHAR(50)` | UNIQUE, NOT NULL | URL-safe slug |
| `usage_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of published articles using this tag |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_tags_slug` UNIQUE ON (`slug`)
- `idx_tags_name` ON (`name`)
- `idx_tags_usage_count` ON (`usage_count` DESC)

### 4.3 Table: `articles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Article identifier |
| `title` | `VARCHAR(200)` | NOT NULL | Article title |
| `subtitle` | `VARCHAR(300)` | NULLABLE | Optional subtitle |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | URL-safe slug |
| `excerpt` | `VARCHAR(300)` | NULLABLE | Short summary |
| `body` | `JSONB` | NOT NULL | TipTap JSON content |
| `body_text` | `TEXT` | NOT NULL | Plain text extraction of body (for search/read time) |
| `featured_image_url` | `VARCHAR(500)` | NULLABLE | Featured image URL |
| `featured_image_alt` | `VARCHAR(200)` | NULLABLE | Featured image alt text |
| `featured_image_caption` | `VARCHAR(300)` | NULLABLE | Featured image caption |
| `category_id` | `UUID` | FK -> categories.id, NOT NULL | Primary category |
| `author_id` | `UUID` | FK -> users.id, NOT NULL | Article author |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft' | Status: draft, in_review, scheduled, published, archived |
| `publish_at` | `TIMESTAMPTZ` | NULLABLE | Scheduled publication date |
| `published_at` | `TIMESTAMPTZ` | NULLABLE | Actual publication timestamp |
| `archived_at` | `TIMESTAMPTZ` | NULLABLE | Archive timestamp |
| `meta_title` | `VARCHAR(70)` | NULLABLE | SEO meta title |
| `meta_description` | `VARCHAR(160)` | NULLABLE | SEO meta description |
| `canonical_url` | `VARCHAR(500)` | NULLABLE | Canonical URL |
| `og_image_url` | `VARCHAR(500)` | NULLABLE | Open Graph image URL |
| `view_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Total view count |
| `read_time_minutes` | `INTEGER` | NOT NULL, DEFAULT 1 | Estimated read time in minutes |
| `word_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Word count |
| `is_community_story` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether this is a community-contributed story |
| `has_video` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the article contains embedded video |
| `video_thumbnail_url` | `VARCHAR(500)` | NULLABLE | Thumbnail of the primary embedded video |
| `video_duration_seconds` | `INTEGER` | NULLABLE | Duration of the primary embedded video |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft delete timestamp |

**Indexes:**
- `idx_articles_slug` UNIQUE ON (`slug`) WHERE `deleted_at IS NULL`
- `idx_articles_status` ON (`status`)
- `idx_articles_category_id` ON (`category_id`)
- `idx_articles_author_id` ON (`author_id`)
- `idx_articles_published_at` ON (`published_at` DESC) WHERE `status = 'published'`
- `idx_articles_publish_at` ON (`publish_at`) WHERE `status = 'scheduled'`
- `idx_articles_view_count` ON (`view_count` DESC) WHERE `status = 'published'`
- `idx_articles_community` ON (`is_community_story`, `published_at` DESC) WHERE `status = 'published'`
- `idx_articles_video` ON (`has_video`, `published_at` DESC) WHERE `status = 'published' AND has_video = TRUE`

### 4.4 Table: `article_tags`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Article |
| `tag_id` | `UUID` | FK -> tags.id, NOT NULL | Tag |

**Primary Key:** (`article_id`, `tag_id`)

**Indexes:**
- `idx_article_tags_tag_id` ON (`tag_id`)

### 4.5 Table: `article_slug_redirects`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Associated article |
| `old_slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | Previous slug |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Redirect creation timestamp |

**Indexes:**
- `idx_article_slug_redirects_old_slug` UNIQUE ON (`old_slug`)

### 4.6 Table: `article_revisions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Revision identifier |
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Associated article |
| `revision_number` | `INTEGER` | NOT NULL | Sequential revision number within the article |
| `title` | `VARCHAR(200)` | NOT NULL | Article title at this revision |
| `subtitle` | `VARCHAR(300)` | NULLABLE | Subtitle at this revision |
| `excerpt` | `VARCHAR(300)` | NULLABLE | Excerpt at this revision |
| `body` | `JSONB` | NOT NULL | TipTap JSON content at this revision |
| `meta_title` | `VARCHAR(70)` | NULLABLE | Meta title at this revision |
| `meta_description` | `VARCHAR(160)` | NULLABLE | Meta description at this revision |
| `changed_by` | `UUID` | FK -> users.id, NOT NULL | User who created this revision |
| `change_summary` | `VARCHAR(500)` | NULLABLE | Optional summary of changes |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Revision timestamp |

**Indexes:**
- `idx_article_revisions_article` ON (`article_id`, `revision_number` DESC)
- `idx_article_revisions_changed_by` ON (`changed_by`)

### 4.7 Table: `article_status_history`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Associated article |
| `previous_status` | `VARCHAR(20)` | NULLABLE | Status before transition |
| `new_status` | `VARCHAR(20)` | NOT NULL | Status after transition |
| `changed_by` | `UUID` | FK -> users.id, NOT NULL | User who made the change |
| `comment` | `TEXT` | NULLABLE | Reviewer comment (e.g., reason for returning to draft) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Transition timestamp |

**Indexes:**
- `idx_article_status_history_article` ON (`article_id`, `created_at` DESC)

### 4.8 Table: `article_views`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Viewed article |
| `user_id` | `UUID` | FK -> users.id, NULLABLE | Authenticated viewer (NULL for anonymous) |
| `ip_address` | `INET` | NOT NULL | Viewer's IP address |
| `user_agent` | `TEXT` | NULLABLE | Viewer's user agent |
| `referrer` | `VARCHAR(500)` | NULLABLE | HTTP referrer |
| `viewed_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | View timestamp |

**Indexes:**
- `idx_article_views_article_id` ON (`article_id`, `viewed_at` DESC)
- `idx_article_views_unique` ON (`article_id`, `ip_address`, `viewed_at`) -- for dedup
- `idx_article_views_user_id` ON (`user_id`) WHERE `user_id IS NOT NULL`

### 4.9 Table: `article_shares`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Shared article |
| `platform` | `VARCHAR(20)` | NOT NULL | Share platform: facebook, twitter, linkedin, whatsapp, telegram, email, copy_link |
| `user_id` | `UUID` | FK -> users.id, NULLABLE | Authenticated user who shared |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Share timestamp |

**Indexes:**
- `idx_article_shares_article_id` ON (`article_id`)
- `idx_article_shares_platform` ON (`article_id`, `platform`)

### 4.10 Table: `article_media`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Media identifier |
| `article_id` | `UUID` | FK -> articles.id, NULLABLE | Associated article (NULL for library uploads) |
| `filename` | `VARCHAR(255)` | NOT NULL | Original filename |
| `storage_path` | `VARCHAR(500)` | NOT NULL | R2 storage path |
| `cdn_url` | `VARCHAR(500)` | NOT NULL | CDN URL for the file |
| `mime_type` | `VARCHAR(50)` | NOT NULL | MIME type |
| `file_size_bytes` | `BIGINT` | NOT NULL | File size in bytes |
| `width` | `INTEGER` | NULLABLE | Image width in pixels |
| `height` | `INTEGER` | NULLABLE | Image height in pixels |
| `alt_text` | `VARCHAR(200)` | NULLABLE | Alt text |
| `caption` | `VARCHAR(300)` | NULLABLE | Caption |
| `variants` | `JSONB` | NOT NULL, DEFAULT '{}' | URLs for each generated size variant |
| `uploaded_by` | `UUID` | FK -> users.id, NOT NULL | Uploader |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Upload timestamp |

**`variants` JSONB structure:**
```json
{
  "original": "https://cdn.iloveberlin.biz/media/articles/{id}/original.webp",
  "large": "https://cdn.iloveberlin.biz/media/articles/{id}/large.webp",
  "medium": "https://cdn.iloveberlin.biz/media/articles/{id}/medium.webp",
  "small": "https://cdn.iloveberlin.biz/media/articles/{id}/small.webp",
  "thumbnail": "https://cdn.iloveberlin.biz/media/articles/{id}/thumbnail.webp"
}
```

**Indexes:**
- `idx_article_media_article_id` ON (`article_id`)
- `idx_article_media_uploaded_by` ON (`uploaded_by`)

### 4.11 Table: `article_related`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Source article |
| `related_article_id` | `UUID` | FK -> articles.id, NOT NULL | Related article |
| `relevance_score` | `DECIMAL(5,2)` | NOT NULL, DEFAULT 0 | Calculated relevance score |
| `is_manual` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether manually curated by an editor |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Primary Key:** (`article_id`, `related_article_id`)

**Indexes:**
- `idx_article_related_source` ON (`article_id`, `relevance_score` DESC)

---

## 5. API Endpoints

### 5.1 Public Article Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/articles` | Public | List published articles with filters | FR-NEWS-088 to 091 |
| `GET` | `/api/v1/articles/search` | Public | Full-text search via Meilisearch | FR-NEWS-092 to 094 |
| `GET` | `/api/v1/articles/:slug` | Public | Get a single published article by slug | FR-NEWS-005, 014, 069 |
| `GET` | `/api/v1/articles/:slug/related` | Public | Get related articles | FR-NEWS-077 to 081 |
| `POST` | `/api/v1/articles/:slug/views` | Public | Record a view (async) | FR-NEWS-064 to 066 |
| `POST` | `/api/v1/articles/:slug/shares` | Public | Record a share event | FR-NEWS-086 |
| `GET` | `/api/v1/categories` | Public | List all active categories | FR-NEWS-029 to 034 |
| `GET` | `/api/v1/categories/:slug/articles` | Public | List articles by category | FR-NEWS-034 |
| `GET` | `/api/v1/tags` | Public | List tags (optionally with usage counts) | FR-NEWS-035 to 040 |
| `GET` | `/api/v1/tags/:slug/articles` | Public | List articles by tag | FR-NEWS-039 |
| `GET` | `/api/v1/tags/suggest` | Authenticated | Suggest tags by prefix | FR-NEWS-038 |

**`GET /api/v1/articles`**

Query Parameters:
- `category` - Category slug (optional)
- `tag` - Tag slug (optional)
- `author` - Author user ID (optional)
- `date_from` - Start date filter (optional, ISO 8601)
- `date_to` - End date filter (optional, ISO 8601)
- `sort` - Sort field: `published_at` (default), `view_count`, `title` (optional)
- `order` - Sort order: `desc` (default), `asc` (optional)
- `cursor` - Pagination cursor (optional)
- `limit` - Items per page (default 12, max 50)

Response `200 OK`:
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "string",
      "subtitle": "string | null",
      "slug": "string",
      "excerpt": "string | null",
      "featured_image_url": "string | null",
      "featured_image_alt": "string | null",
      "category": {
        "id": "uuid",
        "name": "string",
        "slug": "string"
      },
      "author": {
        "id": "uuid",
        "display_name": "string",
        "avatar_thumbnail_url": "string | null"
      },
      "tags": [
        { "id": "uuid", "name": "string", "slug": "string" }
      ],
      "published_at": "2026-03-10T12:00:00Z",
      "read_time_minutes": 5,
      "view_count": 1234,
      "is_bookmarked": false
    }
  ],
  "pagination": {
    "next_cursor": "string | null",
    "has_more": true
  }
}
```

**`GET /api/v1/articles/:slug`**

Response `200 OK`:
```json
{
  "id": "uuid",
  "title": "string",
  "subtitle": "string | null",
  "slug": "string",
  "excerpt": "string | null",
  "body_html": "string (rendered HTML)",
  "featured_image_url": "string | null",
  "featured_image_alt": "string | null",
  "featured_image_caption": "string | null",
  "category": {
    "id": "uuid",
    "name": "string",
    "slug": "string"
  },
  "author": {
    "id": "uuid",
    "display_name": "string",
    "avatar_thumbnail_url": "string | null",
    "bio": "string | null"
  },
  "tags": [
    { "id": "uuid", "name": "string", "slug": "string" }
  ],
  "published_at": "2026-03-10T12:00:00Z",
  "updated_at": "2026-03-11T08:00:00Z",
  "read_time_minutes": 5,
  "view_count": 1234,
  "word_count": 1000,
  "is_bookmarked": false,
  "share_urls": {
    "facebook": "string",
    "twitter": "string",
    "linkedin": "string",
    "whatsapp": "string",
    "telegram": "string",
    "email": "string"
  },
  "seo": {
    "meta_title": "string",
    "meta_description": "string",
    "canonical_url": "string",
    "og_image_url": "string",
    "json_ld": {}
  }
}
```

Error Responses:
- `301 Redirect` - If slug matches an old slug redirect
- `404 Not Found` - Article not found or not published

**`GET /api/v1/articles/search`**

Query Parameters:
- `q` - Search query (required, min 2 characters)
- `category` - Category slug facet filter (optional)
- `tag` - Tag slug facet filter (optional)
- `author` - Author user ID facet filter (optional)
- `limit` - Results per page (default 12, max 50)
- `offset` - Offset for pagination (default 0)

Response `200 OK`:
```json
{
  "query": "string",
  "hits": [
    {
      "id": "uuid",
      "title": "string",
      "_formatted": {
        "title": "string with <mark>highlights</mark>",
        "excerpt": "string with <mark>highlights</mark>"
      },
      "slug": "string",
      "excerpt": "string",
      "featured_image_url": "string | null",
      "category": { "name": "string", "slug": "string" },
      "published_at": "2026-03-10T12:00:00Z",
      "read_time_minutes": 5
    }
  ],
  "facet_distribution": {
    "category": { "entertainment": 5, "sports": 3 },
    "tags": { "berlin-2026": 2, "nightlife": 4 }
  },
  "total_hits": 42,
  "processing_time_ms": 12
}
```

### 5.2 Author/Editor Article Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/articles` | Author+ | Create a new article (draft) | FR-NEWS-001 to 009 |
| `GET` | `/api/v1/articles/:id/edit` | Author+ | Get article with full edit data (TipTap JSON) | FR-NEWS-004 |
| `PATCH` | `/api/v1/articles/:id` | Author+ | Update an article | FR-NEWS-004 |
| `POST` | `/api/v1/articles/:id/autosave` | Author+ | Auto-save article draft | FR-NEWS-009 |
| `POST` | `/api/v1/articles/:id/submit` | Author+ | Submit article for review (draft -> in_review) | FR-NEWS-016 |
| `POST` | `/api/v1/articles/:id/publish` | Editor+ | Publish article | FR-NEWS-017, 020 |
| `POST` | `/api/v1/articles/:id/schedule` | Editor+ | Schedule article for future publication | FR-NEWS-024, 027 |
| `POST` | `/api/v1/articles/:id/archive` | Editor+ | Archive article | FR-NEWS-018 |
| `POST` | `/api/v1/articles/:id/unarchive` | Editor+ | Unarchive (return to draft) | FR-NEWS-019 |
| `POST` | `/api/v1/articles/:id/request-changes` | Editor+ | Return to draft with comment | FR-NEWS-017, 021 |
| `DELETE` | `/api/v1/articles/:id` | Editor+ | Soft delete article | FR-NEWS-005 |
| `POST` | `/api/v1/articles/:id/media` | Author+ | Upload media for an article | FR-NEWS-051 to 056 |

**`POST /api/v1/articles`**

Request Body:
```json
{
  "title": "string (required, 5-200 chars)",
  "subtitle": "string (optional, max 300 chars)",
  "excerpt": "string (optional, max 300 chars)",
  "body": {} ,
  "category_id": "uuid (required)",
  "tags": ["string", "string"],
  "featured_image_url": "string (optional)",
  "featured_image_alt": "string (optional)",
  "featured_image_caption": "string (optional)",
  "meta_title": "string (optional, max 70 chars)",
  "meta_description": "string (optional, max 160 chars)",
  "canonical_url": "string (optional)",
  "og_image_url": "string (optional)"
}
```

Response `201 Created`: Full article object including `id`, `slug`, `status: "draft"`.

**`POST /api/v1/articles/:id/request-changes`**

Request Body:
```json
{
  "comment": "string (required, explanation of requested changes)"
}
```

Response `200 OK`:
```json
{
  "article_id": "uuid",
  "status": "draft",
  "comment": "string",
  "changed_by": "uuid",
  "changed_at": "2026-03-11T14:30:00Z"
}
```

**`POST /api/v1/articles/:id/schedule`**

Request Body:
```json
{
  "publish_at": "2026-03-15T08:00:00Z (required, at least 5 min in future)"
}
```

Response `200 OK`:
```json
{
  "article_id": "uuid",
  "status": "scheduled",
  "publish_at": "2026-03-15T08:00:00Z"
}
```

### 5.3 Revision Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/articles/:id/revisions` | Editor+ | List revisions for an article | FR-NEWS-073 |
| `GET` | `/api/v1/articles/:id/revisions/:revisionId` | Editor+ | Get a specific revision | FR-NEWS-074 |
| `POST` | `/api/v1/articles/:id/revisions/:revisionId/restore` | Editor+ | Restore a previous revision | FR-NEWS-075 |
| `GET` | `/api/v1/articles/:id/revisions/diff` | Editor+ | Compare two revisions | FR-NEWS-076 |

**`GET /api/v1/articles/:id/revisions`**

Query Parameters:
- `page` - Page number (default 1)
- `limit` - Items per page (default 20, max 50)

Response `200 OK`:
```json
{
  "revisions": [
    {
      "id": "uuid",
      "revision_number": 15,
      "changed_by": {
        "id": "uuid",
        "display_name": "string"
      },
      "change_summary": "string | null",
      "created_at": "2026-03-10T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_count": 15,
    "total_pages": 1
  }
}
```

**`GET /api/v1/articles/:id/revisions/diff`**

Query Parameters:
- `from` - Revision ID (required)
- `to` - Revision ID (required)

Response `200 OK`:
```json
{
  "from_revision": { "id": "uuid", "revision_number": 10, "created_at": "..." },
  "to_revision": { "id": "uuid", "revision_number": 15, "created_at": "..." },
  "diff": {
    "title": { "from": "Old Title", "to": "New Title" },
    "body": "HTML diff output",
    "excerpt": { "from": null, "to": "New excerpt text" }
  }
}
```

### 5.4 Admin Article Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/articles` | Editor+ | List all articles (all statuses) | FR-NEWS-088 |
| `GET` | `/api/v1/admin/articles/pending-review` | Editor+ | List articles awaiting review | FR-NEWS-017 |
| `GET` | `/api/v1/admin/articles/scheduled` | Editor+ | List scheduled articles | FR-NEWS-024 |
| `DELETE` | `/api/v1/admin/articles/:id/permanent` | Admin+ | Permanently delete an article | FR-NEWS-006 |
| `GET` | `/api/v1/admin/categories` | Admin+ | List all categories (including inactive) | FR-NEWS-032 |
| `POST` | `/api/v1/admin/categories` | Admin+ | Create a category | FR-NEWS-032 |
| `PATCH` | `/api/v1/admin/categories/:id` | Admin+ | Update a category | FR-NEWS-032 |

**`GET /api/v1/admin/articles`**

Query Parameters (extends public listing):
- `status` - Filter by status: `draft`, `in_review`, `scheduled`, `published`, `archived` (optional)
- `author_id` - Filter by author (optional)
- All parameters from the public listing endpoint

Response: Same structure as public listing with additional admin fields (`status`, `created_at`, `publish_at`).

---

## 6. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Scheduled Publisher | Every minute | Publish articles where `status = 'scheduled'` and `publish_at <= NOW()` |
| Trending Score Calculator | Every 15 minutes | Recalculate trending scores based on 48-hour engagement metrics |
| Meilisearch Sync | Near real-time (event-driven) | Update Meilisearch index when articles are published, updated, or archived |
| Related Articles Calculator | Every 6 hours | Recalculate related articles for all published articles |
| View Count Aggregator | Every 5 minutes | Flush view count increments from the async queue to the articles table |
| Category Count Update | Every hour | Recalculate `article_count` for each category |
| Tag Usage Count Update | Every hour | Recalculate `usage_count` for each tag |
| Revision Pruning | Daily at 03:00 UTC | Delete revisions beyond the 50 most recent per article |
| Old View Records Cleanup | Weekly | Delete `article_views` records older than 90 days (aggregate counts are preserved in `articles.view_count`) |

---

## 7. Meilisearch Index Configuration

**Index Name:** `articles`

**Searchable Attributes (ranked):**
1. `title`
2. `excerpt`
3. `body_text`
4. `category_name`
5. `tags`
6. `author_name`

**Filterable Attributes:**
- `category_slug`
- `tags`
- `author_id`
- `published_at`
- `status`

**Sortable Attributes:**
- `published_at`
- `view_count`
- `title`

**Ranking Rules:**
1. `words`
2. `typo`
3. `proximity`
4. `attribute`
5. `sort`
6. `exactness`

**Typo Tolerance:** Enabled (min word size for 1 typo: 4, min word size for 2 typos: 8)
