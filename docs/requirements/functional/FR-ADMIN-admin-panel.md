# FR-ADMIN: Admin Panel

**Module:** Admin Panel
**Status:** Draft
**Last Updated:** 2026-03-11
**Owner:** Platform Team
**Related User Stories:** US-ADMIN-001 through US-ADMIN-065

---

## 1. Overview

The Admin Panel is the centralized management interface for the ILoveBerlin platform, accessible to authorized staff at `admin.iloveberlin.biz`. It provides a dashboard with analytics charts, user management (search, role changes, ban/suspend), a content moderation queue (pending classifieds, events, reports), activity logging, site-wide settings, an SEO audit tool, advertising campaign management (campaigns, placements, impressions, clicks, CTR), and bulk operations across content types.

---

## 2. Functional Requirements

### 2.1 Dashboard and Analytics

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-001 | The admin dashboard SHALL display key metrics cards: total users, new users (last 7 days), total content items, total page views (last 7 days), active competitions, pending moderation items, open orders, and total revenue (current month). | Must | US-ADMIN-001 |
| FR-ADMIN-002 | The dashboard SHALL display a line chart of page views over time with selectable time ranges: 7 days, 30 days, 90 days, 12 months. Data points are aggregated daily. | Must | US-ADMIN-002 |
| FR-ADMIN-003 | The dashboard SHALL display a line chart of new user registrations over time with the same selectable time ranges. | Must | US-ADMIN-003 |
| FR-ADMIN-004 | The dashboard SHALL display a stacked area chart of content published over time, broken down by content type (articles, guides, events, videos, classifieds, products). | Must | US-ADMIN-004 |
| FR-ADMIN-005 | The dashboard SHALL display a bar chart of top 10 most-viewed content items in the selected time range. | Should | US-ADMIN-005 |
| FR-ADMIN-006 | The dashboard SHALL display a pie chart of user acquisition sources (direct, organic search, social, referral) based on first-visit referrer data. | Should | US-ADMIN-006 |
| FR-ADMIN-007 | The dashboard SHALL display a "quick actions" section with shortcuts: create article, create event, review moderation queue, view latest orders. | Should | US-ADMIN-007 |
| FR-ADMIN-008 | Analytics data SHALL be pre-aggregated into a `daily_analytics` table by a nightly job for fast dashboard loading. | Must | US-ADMIN-008 |
| FR-ADMIN-009 | The dashboard SHALL load within 2 seconds (p95), including all chart data. | Must | US-ADMIN-009 |
| FR-ADMIN-010 | Admin users SHALL be able to export analytics data as CSV for any chart's time range. | Should | US-ADMIN-010 |

### 2.2 User Management

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-011 | Admin users SHALL be able to search for users by name, email, or user ID with paginated results. | Must | US-ADMIN-011 |
| FR-ADMIN-012 | Admin users SHALL be able to view a user's profile detail: registration date, email (verified status), role, last login, total content created, total orders, competition entries, and account status. | Must | US-ADMIN-012 |
| FR-ADMIN-013 | Admin users SHALL be able to change a user's role. Available roles: `user` (default), `moderator`, `editor`, `admin`, `super_admin`. | Must | US-ADMIN-013 |
| FR-ADMIN-014 | Only `super_admin` users SHALL be able to assign or revoke the `admin` and `super_admin` roles. | Must | US-ADMIN-014 |
| FR-ADMIN-015 | Admin users SHALL be able to suspend a user account with a required reason and optional duration (permanent or timed). Suspended users cannot log in and their content is hidden from public view. | Must | US-ADMIN-015 |
| FR-ADMIN-016 | Admin users SHALL be able to ban a user account permanently. Banned users cannot log in, cannot create new accounts with the same email, and all their content is hidden. | Must | US-ADMIN-016 |
| FR-ADMIN-017 | Admin users SHALL be able to lift a suspension or ban, restoring the user's account and content visibility. | Must | US-ADMIN-017 |
| FR-ADMIN-018 | All user management actions (role change, suspend, ban, restore) SHALL be recorded in the activity log with the acting admin, target user, action type, reason, and timestamp. | Must | US-ADMIN-018 |
| FR-ADMIN-019 | Admin users SHALL be able to send a direct notification email to a specific user from the admin panel. | Should | US-ADMIN-019 |
| FR-ADMIN-020 | Admin users SHALL be able to force-verify a user's email address. | Should | US-ADMIN-020 |
| FR-ADMIN-021 | Admin users SHALL be able to trigger a password reset email for a user. | Should | US-ADMIN-021 |

### 2.3 Content Moderation Queue

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-022 | The admin panel SHALL provide a unified moderation queue showing all items requiring review, sorted by submission date (oldest first). | Must | US-ADMIN-022 |
| FR-ADMIN-023 | The moderation queue SHALL include the following item types: pending classified listings (from FR-CLASS), pending user-submitted events, and reported content (from FR-CLASS reports and other modules). | Must | US-ADMIN-023 |
| FR-ADMIN-024 | Each moderation queue item SHALL display: item type, title/summary, submitted by (user), submission date, priority (normal, high — auto-set for items with 3+ reports), and a preview of the content. | Must | US-ADMIN-024 |
| FR-ADMIN-025 | Moderators SHALL be able to approve, reject (with reason), or escalate a moderation item. Escalation moves the item to admin-only visibility. | Must | US-ADMIN-025 |
| FR-ADMIN-026 | The moderation queue SHALL support filtering by item type, priority, and status (pending, reviewed, escalated). | Must | US-ADMIN-026 |
| FR-ADMIN-027 | The moderation queue SHALL display a count badge in the admin navigation showing the number of pending items. | Must | US-ADMIN-027 |
| FR-ADMIN-028 | Moderators SHALL be able to claim a moderation item (assign it to themselves) to prevent duplicate review by multiple moderators. | Should | US-ADMIN-028 |
| FR-ADMIN-029 | The system SHALL send a daily digest email to moderators listing the number of pending items if the queue is non-empty. | Should | US-ADMIN-029 |

### 2.4 Activity Logging

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-030 | The system SHALL log all administrative actions in an append-only activity log. | Must | US-ADMIN-030 |
| FR-ADMIN-031 | Each activity log entry SHALL include: actor (admin user ID and display name), action type, target entity type, target entity ID, description, metadata (JSONB with before/after values where applicable), IP address, user agent, and timestamp. | Must | US-ADMIN-031 |
| FR-ADMIN-032 | The admin panel SHALL provide an activity log viewer with search (by actor, action type, entity type, entity ID) and time-range filtering. | Must | US-ADMIN-032 |
| FR-ADMIN-033 | The activity log SHALL be append-only. Entries cannot be edited or deleted except by a database-level archival process. | Must | US-ADMIN-033 |
| FR-ADMIN-034 | The activity log SHALL support pagination (cursor-based, 50 per page). | Must | US-ADMIN-034 |
| FR-ADMIN-035 | Activity log entries SHALL be retained for at least 2 years. Entries older than 2 years are archived to cold storage. | Should | US-ADMIN-035 |

**Logged action types include (non-exhaustive):**
- `user.role_changed`, `user.suspended`, `user.banned`, `user.restored`
- `content.published`, `content.unpublished`, `content.deleted`
- `moderation.approved`, `moderation.rejected`, `moderation.escalated`
- `order.status_changed`, `order.refunded`
- `settings.updated`
- `ad_campaign.created`, `ad_campaign.updated`, `ad_campaign.paused`
- `bulk_operation.executed`

### 2.5 Site Settings

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-036 | Admin users SHALL be able to manage global site settings via a settings panel. | Must | US-ADMIN-036 |
| FR-ADMIN-037 | The following settings SHALL be configurable: | Must | US-ADMIN-037 |

| Setting Key | Type | Description |
|------------|------|-------------|
| `site.name` | String | Site display name |
| `site.tagline` | String | Site tagline |
| `site.logo_media_id` | UUID | Site logo |
| `site.favicon_media_id` | UUID | Favicon |
| `site.contact_email` | String | Public contact email |
| `site.social.facebook` | String | Facebook page URL |
| `site.social.instagram` | String | Instagram profile URL |
| `site.social.twitter` | String | Twitter/X profile URL |
| `site.social.youtube` | String | YouTube channel URL |
| `site.social.tiktok` | String | TikTok profile URL |
| `seo.default_meta_title` | String | Default meta title template |
| `seo.default_meta_description` | String | Default meta description |
| `seo.google_analytics_id` | String | GA4 measurement ID |
| `seo.google_tag_manager_id` | String | GTM container ID |
| `store.shipping_flat_rate` | Decimal | Flat shipping rate (EUR) |
| `store.free_shipping_threshold` | Decimal | Free shipping minimum order |
| `store.tax_rate` | Decimal | VAT rate (default 0.19) |
| `classifieds.premium_price` | Decimal | Premium listing price (EUR) |
| `classifieds.listing_expiry_days` | Integer | Days until listing expires |
| `email.from_name` | String | Sender name for emails |
| `email.from_address` | String | Sender email address |
| `email.reply_to` | String | Reply-to address |
| `maintenance.enabled` | Boolean | Maintenance mode flag |
| `maintenance.message` | String | Maintenance mode message |

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-038 | Settings changes SHALL be recorded in the activity log with before and after values. | Must | US-ADMIN-038 |
| FR-ADMIN-039 | Settings SHALL be cached in memory and refreshed on change (pub/sub or polling). | Must | US-ADMIN-039 |
| FR-ADMIN-040 | When maintenance mode is enabled, all public pages SHALL display the maintenance message and return HTTP 503. Admin panel access remains available. | Must | US-ADMIN-040 |

### 2.6 SEO Audit Tool

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-041 | The admin panel SHALL include an SEO audit tool that scans all published content for common SEO issues. | Should | US-ADMIN-041 |
| FR-ADMIN-042 | The SEO audit SHALL check for the following issues per content item: | Should | US-ADMIN-042 |

| Check | Severity | Condition |
|-------|----------|-----------|
| Missing meta title | Error | `meta_title` is NULL or empty |
| Meta title too long | Warning | `meta_title` > 60 characters |
| Missing meta description | Error | `meta_description` is NULL or empty |
| Meta description too long | Warning | `meta_description` > 155 characters |
| Missing alt text on images | Warning | Any referenced media has NULL `alt_text` |
| No images | Info | Content has no associated media |
| Short content | Warning | Body text < 300 words |
| Missing H1 | Warning | Body HTML has no `<h1>` tag |
| Duplicate meta title | Error | Same `meta_title` used by multiple content items |
| Missing Open Graph tags | Warning | OG tags not configured (detected at render level) |
| Broken internal links | Error | Links in body text reference non-existent slugs |

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-043 | The SEO audit SHALL present results grouped by severity (errors, warnings, info) with the total count per severity. | Should | US-ADMIN-043 |
| FR-ADMIN-044 | Each audit result SHALL link directly to the edit page of the affected content item. | Should | US-ADMIN-044 |
| FR-ADMIN-045 | The SEO audit SHALL be runnable on-demand and SHALL cache results until the next run. A full audit SHALL complete within 5 minutes for up to 10,000 content items. | Should | US-ADMIN-045 |
| FR-ADMIN-046 | The SEO audit SHALL generate a sitemap coverage report: how many published items are included in the sitemap vs. total published items. | Should | US-ADMIN-046 |

### 2.7 Advertising Management

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-047 | Admin users SHALL be able to create advertising campaigns with: name, advertiser name, start date, end date, budget (optional), status (draft, active, paused, completed), and notes. | Must | US-ADMIN-047 |
| FR-ADMIN-048 | Admin users SHALL be able to edit and manage campaign lifecycle (draft -> active -> paused/completed). | Must | US-ADMIN-048 |
| FR-ADMIN-049 | Each campaign SHALL contain one or more ad placements. Each placement has: name, placement slot (e.g., header_banner, sidebar_top, sidebar_bottom, article_inline, footer_banner, mobile_interstitial), creative (media reference — image or HTML snippet), click-through URL, alt text, and target criteria (optional: page type, category, tag). | Must | US-ADMIN-049 |
| FR-ADMIN-050 | The system SHALL track impressions (ad displayed) and clicks (ad clicked) for each placement. | Must | US-ADMIN-050 |
| FR-ADMIN-051 | Impression and click tracking SHALL be performed via lightweight API endpoints that respond in < 50ms. Impression tracking uses a 1x1 pixel beacon or JavaScript callback. | Must | US-ADMIN-051 |
| FR-ADMIN-052 | The system SHALL calculate and display click-through rate (CTR = clicks / impressions * 100) per placement and per campaign. | Must | US-ADMIN-052 |
| FR-ADMIN-053 | The admin panel SHALL display a campaign performance dashboard with: total impressions, total clicks, CTR, impressions/clicks over time (line chart), and per-placement breakdown. | Must | US-ADMIN-053 |
| FR-ADMIN-054 | Admin users SHALL be able to set daily impression caps per placement. The system stops serving the ad once the cap is reached for the day. | Should | US-ADMIN-054 |
| FR-ADMIN-055 | The system SHALL provide an ad-serving API endpoint that returns the appropriate creative for a given slot, considering: campaign status (active), date range (within start/end), daily impression cap (not exceeded), and target criteria (matching). | Must | US-ADMIN-055 |
| FR-ADMIN-056 | If multiple placements compete for the same slot, the system SHALL rotate them evenly (round-robin) or by weight (configurable). | Should | US-ADMIN-056 |
| FR-ADMIN-057 | Admin users SHALL be able to export campaign reports as CSV with columns: date, placement name, slot, impressions, clicks, CTR. | Should | US-ADMIN-057 |

### 2.8 Bulk Operations

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-ADMIN-058 | Admin users SHALL be able to select multiple content items (via checkboxes) and apply bulk actions. | Must | US-ADMIN-058 |
| FR-ADMIN-059 | Supported bulk actions SHALL include: publish, unpublish, delete, change category, add/remove tag, and assign editor. | Must | US-ADMIN-059 |
| FR-ADMIN-060 | Bulk operations SHALL display a confirmation dialog showing the number of items affected and the action to be performed. | Must | US-ADMIN-060 |
| FR-ADMIN-061 | Bulk operations SHALL be processed asynchronously for batches larger than 50 items. The admin receives a notification when the operation completes. | Should | US-ADMIN-061 |
| FR-ADMIN-062 | Each bulk operation SHALL be recorded as a single entry in the activity log with the list of affected entity IDs in the metadata. | Must | US-ADMIN-062 |
| FR-ADMIN-063 | Bulk operations SHALL be restricted to admin users only (not moderators or editors). | Must | US-ADMIN-063 |
| FR-ADMIN-064 | The system SHALL support bulk user actions: send email to selected users, export selected users as CSV. | Should | US-ADMIN-064 |
| FR-ADMIN-065 | Bulk delete operations SHALL use soft-delete and be reversible within 30 days. | Must | US-ADMIN-065 |

---

## 3. Database Schema

### 3.1 Table: `admin_activity_log`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `actor_id` | `UUID` | FK -> users.id, NOT NULL | Admin who performed action |
| `actor_display_name` | `VARCHAR(200)` | NOT NULL | Snapshot of actor's name |
| `action_type` | `VARCHAR(100)` | NOT NULL | Action type identifier |
| `entity_type` | `VARCHAR(50)` | NULLABLE | Target entity type |
| `entity_id` | `UUID` | NULLABLE | Target entity ID |
| `description` | `TEXT` | NOT NULL | Human-readable description |
| `metadata` | `JSONB` | NULLABLE | Additional context (before/after, affected IDs) |
| `ip_address` | `INET` | NOT NULL | Actor's IP address |
| `user_agent` | `VARCHAR(500)` | NULLABLE | Actor's browser user agent |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Action timestamp |

**Indexes:**
- `idx_activity_log_actor_id` on `actor_id`
- `idx_activity_log_action_type` on `action_type`
- `idx_activity_log_entity` on (`entity_type`, `entity_id`)
- `idx_activity_log_created_at` on `created_at` DESC
- `idx_activity_log_search` GIN on `to_tsvector('english', description)`

**Partitioning:** Partition by RANGE on `created_at` with quarterly partitions.

### 3.2 Table: `site_settings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | `VARCHAR(100)` | PK | Setting key (dot-separated) |
| `value` | `JSONB` | NOT NULL | Setting value |
| `value_type` | `VARCHAR(20)` | NOT NULL, CHECK IN ('string','number','boolean','json') | Value type for validation |
| `description` | `VARCHAR(500)` | NULLABLE | Human-readable description |
| `is_sensitive` | `BOOLEAN` | NOT NULL, DEFAULT false | Whether value should be masked in logs |
| `updated_by` | `UUID` | FK -> users.id, NULLABLE | Last editor |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

### 3.3 Table: `daily_analytics`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `date` | `DATE` | NOT NULL | Analytics date |
| `metric` | `VARCHAR(50)` | NOT NULL | Metric name |
| `dimension` | `VARCHAR(100)` | NULLABLE | Dimension value (e.g., content type, referrer source) |
| `value` | `BIGINT` | NOT NULL, DEFAULT 0 | Metric value |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Aggregation timestamp |

**Indexes:**
- `idx_daily_analytics_date_metric` UNIQUE on (`date`, `metric`, `dimension`) — ensures one entry per day per metric per dimension
- `idx_daily_analytics_metric` on (`metric`, `date` DESC)

**Metrics tracked:**
- `page_views` (dimension: NULL for total, or page path for per-page)
- `unique_visitors` (dimension: NULL)
- `new_users` (dimension: NULL)
- `content_published` (dimension: content type)
- `orders_placed` (dimension: NULL)
- `revenue` (dimension: NULL, value in EUR cents)
- `competition_entries` (dimension: NULL)
- `classified_listings_created` (dimension: NULL)
- `search_queries` (dimension: NULL)

### 3.4 Table: `moderation_queue`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `item_type` | `VARCHAR(50)` | NOT NULL | Content type (classified_listing, event, report) |
| `item_id` | `UUID` | NOT NULL | Reference to the content item |
| `submitted_by` | `UUID` | FK -> users.id, NOT NULL | User who submitted the item |
| `priority` | `VARCHAR(10)` | NOT NULL, DEFAULT 'normal', CHECK IN ('normal','high') | Priority level |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','claimed','approved','rejected','escalated') | Queue status |
| `claimed_by` | `UUID` | FK -> users.id, NULLABLE | Moderator who claimed this item |
| `claimed_at` | `TIMESTAMPTZ` | NULLABLE | Claim timestamp |
| `reviewed_by` | `UUID` | FK -> users.id, NULLABLE | Moderator who reviewed |
| `reviewed_at` | `TIMESTAMPTZ` | NULLABLE | Review timestamp |
| `review_action` | `VARCHAR(20)` | NULLABLE | Action taken (approved, rejected, escalated) |
| `review_note` | `TEXT` | NULLABLE | Review note/reason |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Queue entry timestamp |

**Indexes:**
- `idx_moderation_queue_pending` on (`priority` DESC, `created_at` ASC) WHERE `status` = 'pending'
- `idx_moderation_queue_status` on `status`
- `idx_moderation_queue_item` UNIQUE on (`item_type`, `item_id`)
- `idx_moderation_queue_claimed_by` on `claimed_by` WHERE `status` = 'claimed'

### 3.5 Table: `ad_campaigns`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(200)` | NOT NULL | Campaign name |
| `advertiser_name` | `VARCHAR(200)` | NOT NULL | Advertiser/client name |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft', CHECK IN ('draft','active','paused','completed') | Campaign status |
| `start_date` | `TIMESTAMPTZ` | NOT NULL | Campaign start |
| `end_date` | `TIMESTAMPTZ` | NOT NULL | Campaign end |
| `budget` | `DECIMAL(10,2)` | NULLABLE | Campaign budget (EUR) |
| `notes` | `TEXT` | NULLABLE | Internal notes |
| `total_impressions` | `BIGINT` | NOT NULL, DEFAULT 0 | Materialized total impressions |
| `total_clicks` | `BIGINT` | NOT NULL, DEFAULT 0 | Materialized total clicks |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Creating admin |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_ad_campaigns_status` on `status`
- `idx_ad_campaigns_dates` on (`start_date`, `end_date`) WHERE `status` = 'active'

### 3.6 Table: `ad_placements`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `campaign_id` | `UUID` | FK -> ad_campaigns.id ON DELETE CASCADE, NOT NULL | Campaign reference |
| `name` | `VARCHAR(200)` | NOT NULL | Placement name |
| `slot` | `VARCHAR(50)` | NOT NULL, CHECK IN ('header_banner','sidebar_top','sidebar_bottom','article_inline','footer_banner','mobile_interstitial') | Ad slot location |
| `creative_type` | `VARCHAR(20)` | NOT NULL, CHECK IN ('image','html') | Creative format |
| `creative_media_id` | `UUID` | FK -> media.id, NULLABLE | Image creative reference |
| `creative_html` | `TEXT` | NULLABLE | HTML snippet creative |
| `click_url` | `VARCHAR(1000)` | NOT NULL | Click-through destination URL |
| `alt_text` | `VARCHAR(200)` | NULLABLE | Image alt text |
| `target_page_types` | `VARCHAR(50)[]` | NULLABLE | Page types to target (homepage, article, event, listing, etc.) |
| `target_categories` | `VARCHAR(100)[]` | NULLABLE | Category slugs to target |
| `target_tags` | `VARCHAR(100)[]` | NULLABLE | Tag slugs to target |
| `weight` | `INTEGER` | NOT NULL, DEFAULT 1 | Rotation weight (1-100) |
| `daily_impression_cap` | `INTEGER` | NULLABLE | Max impressions per day |
| `today_impressions` | `INTEGER` | NOT NULL, DEFAULT 0 | Today's impression count (reset daily) |
| `total_impressions` | `BIGINT` | NOT NULL, DEFAULT 0 | Lifetime impressions |
| `total_clicks` | `BIGINT` | NOT NULL, DEFAULT 0 | Lifetime clicks |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Whether placement is active |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_ad_placements_campaign_id` on `campaign_id`
- `idx_ad_placements_slot_active` on (`slot`, `is_active`) WHERE `is_active` = true
- `idx_ad_placements_serving` on (`slot`, `weight` DESC) WHERE `is_active` = true

**Constraints:**
- CHECK (`creative_type` = 'image' AND `creative_media_id` IS NOT NULL) OR (`creative_type` = 'html' AND `creative_html` IS NOT NULL)

### 3.7 Table: `ad_events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `placement_id` | `UUID` | FK -> ad_placements.id ON DELETE CASCADE, NOT NULL | Placement reference |
| `event_type` | `VARCHAR(20)` | NOT NULL, CHECK IN ('impression','click') | Event type |
| `ip_hash` | `VARCHAR(64)` | NOT NULL | Hashed visitor IP |
| `user_agent` | `VARCHAR(500)` | NULLABLE | Visitor user agent |
| `page_url` | `VARCHAR(1000)` | NULLABLE | Page where ad was shown |
| `referrer` | `VARCHAR(1000)` | NULLABLE | HTTP referrer |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Event timestamp |

**Indexes:**
- `idx_ad_events_placement_id` on (`placement_id`, `created_at` DESC)
- `idx_ad_events_type_date` on (`event_type`, `created_at` DESC)
- `idx_ad_events_created_at` on `created_at` — for time-range analytics

**Partitioning:** Partition by RANGE on `created_at` with monthly partitions.

### 3.8 Table: `ad_daily_stats`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `placement_id` | `UUID` | FK -> ad_placements.id ON DELETE CASCADE, NOT NULL | Placement reference |
| `date` | `DATE` | NOT NULL | Stats date |
| `impressions` | `BIGINT` | NOT NULL, DEFAULT 0 | Daily impressions |
| `clicks` | `BIGINT` | NOT NULL, DEFAULT 0 | Daily clicks |
| `ctr` | `DECIMAL(5,4)` | NOT NULL, DEFAULT 0 | Daily CTR |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Aggregation timestamp |

**Indexes:**
- `idx_ad_daily_stats_unique` UNIQUE on (`placement_id`, `date`)
- `idx_ad_daily_stats_date` on `date` DESC

### 3.9 Table: `bulk_operations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `action` | `VARCHAR(50)` | NOT NULL | Bulk action type |
| `entity_type` | `VARCHAR(50)` | NOT NULL | Content type |
| `entity_ids` | `UUID[]` | NOT NULL | Affected entity IDs |
| `parameters` | `JSONB` | NULLABLE | Action parameters (e.g., target category) |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','processing','completed','failed','partially_failed') | Operation status |
| `total_items` | `INTEGER` | NOT NULL | Total items in batch |
| `processed_items` | `INTEGER` | NOT NULL, DEFAULT 0 | Items processed so far |
| `failed_items` | `INTEGER` | NOT NULL, DEFAULT 0 | Items that failed |
| `error_details` | `JSONB` | NULLABLE | Per-item error details |
| `initiated_by` | `UUID` | FK -> users.id, NOT NULL | Admin who started the operation |
| `started_at` | `TIMESTAMPTZ` | NULLABLE | Processing start timestamp |
| `completed_at` | `TIMESTAMPTZ` | NULLABLE | Completion timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_bulk_operations_status` on `status` WHERE `status` IN ('pending', 'processing')
- `idx_bulk_operations_initiated_by` on `initiated_by`

### 3.10 Table: `user_suspensions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Suspended user |
| `action` | `VARCHAR(20)` | NOT NULL, CHECK IN ('suspend','ban') | Action type |
| `reason` | `TEXT` | NOT NULL | Reason for action |
| `expires_at` | `TIMESTAMPTZ` | NULLABLE | Suspension end (NULL for permanent/ban) |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Whether currently in effect |
| `lifted_by` | `UUID` | FK -> users.id, NULLABLE | Admin who lifted the suspension |
| `lifted_at` | `TIMESTAMPTZ` | NULLABLE | When the suspension was lifted |
| `lift_reason` | `TEXT` | NULLABLE | Reason for lifting |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Admin who imposed the action |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Action timestamp |

**Indexes:**
- `idx_user_suspensions_user_id` on `user_id` WHERE `is_active` = true
- `idx_user_suspensions_expires` on `expires_at` WHERE `is_active` = true AND `expires_at` IS NOT NULL

---

## 4. API Endpoints

### 4.1 Dashboard Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/admin/dashboard/overview` | Admin | Get key metrics cards | — |
| GET | `/api/v1/admin/dashboard/charts/pageviews` | Admin | Page views over time | `range` (7d, 30d, 90d, 12m) |
| GET | `/api/v1/admin/dashboard/charts/users` | Admin | New user registrations over time | `range` |
| GET | `/api/v1/admin/dashboard/charts/content` | Admin | Content published over time (by type) | `range` |
| GET | `/api/v1/admin/dashboard/charts/top-content` | Admin | Top 10 most-viewed content | `range` |
| GET | `/api/v1/admin/dashboard/charts/acquisition` | Admin | User acquisition sources | `range` |
| GET | `/api/v1/admin/dashboard/export` | Admin | Export analytics as CSV | `metric`, `range`, `format` (csv) |

### 4.2 User Management Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/users` | Admin | Search and list users | `cursor`, `limit`, `search` (name, email), `role`, `status` (active, suspended, banned), `sort` (newest, oldest, name) |
| GET | `/api/v1/admin/users/:id` | Admin | Get user detail | — |
| PATCH | `/api/v1/admin/users/:id/role` | Admin | Change user role | Body: `{ role }` |
| POST | `/api/v1/admin/users/:id/suspend` | Admin | Suspend user | Body: `{ reason, duration_days (optional, null=permanent) }` |
| POST | `/api/v1/admin/users/:id/ban` | Admin | Ban user | Body: `{ reason }` |
| POST | `/api/v1/admin/users/:id/restore` | Admin | Lift suspension/ban | Body: `{ reason }` |
| POST | `/api/v1/admin/users/:id/verify-email` | Admin | Force-verify email | — |
| POST | `/api/v1/admin/users/:id/reset-password` | Admin | Trigger password reset email | — |
| POST | `/api/v1/admin/users/:id/notify` | Admin | Send direct notification email | Body: `{ subject, body }` |
| POST | `/api/v1/admin/users/bulk-export` | Admin | Export selected users as CSV | Body: `{ user_ids: [] }` or `{ filters: {...} }` |
| POST | `/api/v1/admin/users/bulk-email` | Admin | Send email to selected users | Body: `{ user_ids: [], subject, body }` |

### 4.3 Moderation Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/moderation` | Moderator+ | List moderation queue | `cursor`, `limit`, `item_type`, `priority`, `status`, `claimed_by` |
| GET | `/api/v1/admin/moderation/count` | Moderator+ | Get pending item count | — |
| GET | `/api/v1/admin/moderation/:id` | Moderator+ | Get moderation item detail | — |
| POST | `/api/v1/admin/moderation/:id/claim` | Moderator+ | Claim item for review | — |
| POST | `/api/v1/admin/moderation/:id/release` | Moderator+ | Release claimed item | — |
| POST | `/api/v1/admin/moderation/:id/approve` | Moderator+ | Approve item | Body: `{ note }` (optional) |
| POST | `/api/v1/admin/moderation/:id/reject` | Moderator+ | Reject item | Body: `{ note }` (required) |
| POST | `/api/v1/admin/moderation/:id/escalate` | Moderator+ | Escalate item to admin | Body: `{ note }` (required) |

### 4.4 Activity Log Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/admin/activity-log` | Admin | Browse activity log | `cursor`, `limit` (default 50), `actor_id`, `action_type`, `entity_type`, `entity_id`, `date_from`, `date_to`, `search` (description text) |

### 4.5 Settings Endpoints

| Method | Path | Auth | Description | Body |
|--------|------|------|-------------|------|
| GET | `/api/v1/admin/settings` | Admin | Get all settings | — |
| GET | `/api/v1/admin/settings/:key` | Admin | Get single setting | — |
| PUT | `/api/v1/admin/settings/:key` | Admin | Update a setting | Body: `{ value }` |
| PUT | `/api/v1/admin/settings` | Admin | Bulk update settings | Body: `{ settings: { key: value, ... } }` |

### 4.6 SEO Audit Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| POST | `/api/v1/admin/seo/audit` | Admin | Trigger a new SEO audit | Body: `{ content_types: [] }` (optional, all if omitted) |
| GET | `/api/v1/admin/seo/audit/results` | Admin | Get latest audit results | `severity` (error, warning, info), `content_type`, `check`, `cursor`, `limit` |
| GET | `/api/v1/admin/seo/audit/summary` | Admin | Get audit summary counts | — |
| GET | `/api/v1/admin/seo/sitemap-coverage` | Admin | Get sitemap coverage report | — |

### 4.7 Advertising Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/ad-campaigns` | Admin | List all campaigns | `cursor`, `limit`, `status`, `search` |
| POST | `/api/v1/admin/ad-campaigns` | Admin | Create campaign | Body: full campaign object |
| GET | `/api/v1/admin/ad-campaigns/:id` | Admin | Get campaign detail with placements and stats | — |
| PATCH | `/api/v1/admin/ad-campaigns/:id` | Admin | Update campaign | Body: partial object |
| POST | `/api/v1/admin/ad-campaigns/:id/activate` | Admin | Activate campaign | — |
| POST | `/api/v1/admin/ad-campaigns/:id/pause` | Admin | Pause campaign | — |
| POST | `/api/v1/admin/ad-campaigns/:id/complete` | Admin | Mark campaign as completed | — |
| GET | `/api/v1/admin/ad-campaigns/:id/report` | Admin | Get performance report | `date_from`, `date_to`, `format` (json, csv) |
| POST | `/api/v1/admin/ad-campaigns/:id/placements` | Admin | Add placement to campaign | Body: full placement object |
| PATCH | `/api/v1/admin/ad-campaigns/:id/placements/:placementId` | Admin | Update placement | Body: partial object |
| DELETE | `/api/v1/admin/ad-campaigns/:id/placements/:placementId` | Admin | Remove placement | — |

### 4.8 Ad Serving Endpoints (Public)

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/ads/serve` | None | Get ad for a slot | `slot`, `page_type`, `category`, `tag` |
| POST | `/api/v1/ads/impression` | None | Record ad impression | Body: `{ placement_id, page_url }` |
| POST | `/api/v1/ads/click` | None | Record ad click | Body: `{ placement_id, page_url }` |
| GET | `/api/v1/ads/pixel/:placementId.gif` | None | 1x1 pixel impression beacon | — |

**Ad serve response:**
```json
{
  "data": {
    "placement_id": "uuid",
    "creative_type": "image",
    "creative_url": "https://cdn.iloveberlin.biz/...",
    "click_url": "https://iloveberlin.biz/ads/click?p=uuid&u=encoded_url",
    "alt_text": "Advertiser banner",
    "impression_url": "https://iloveberlin.biz/api/v1/ads/pixel/uuid.gif",
    "width": 728,
    "height": 90
  }
}
```

### 4.9 Bulk Operations Endpoints

| Method | Path | Auth | Description | Body |
|--------|------|------|-------------|------|
| POST | `/api/v1/admin/bulk-operations` | Admin | Execute bulk operation | Body: `{ action, entity_type, entity_ids, parameters }` |
| GET | `/api/v1/admin/bulk-operations/:id` | Admin | Get operation status | — |
| GET | `/api/v1/admin/bulk-operations` | Admin | List recent operations | `cursor`, `limit`, `status` |

### 4.10 Error Responses

| Code | Status | Trigger |
|------|--------|---------|
| USER_NOT_FOUND | 404 | User ID not found |
| INSUFFICIENT_PRIVILEGES | 403 | Action requires higher role |
| CANNOT_MODIFY_SUPER_ADMIN | 403 | Non-super_admin trying to modify super_admin |
| USER_ALREADY_SUSPENDED | 409 | Suspend on already-suspended user |
| USER_ALREADY_BANNED | 409 | Ban on already-banned user |
| USER_NOT_SUSPENDED | 422 | Restore on non-suspended/banned user |
| MODERATION_ITEM_NOT_FOUND | 404 | Queue item ID not found |
| MODERATION_ALREADY_CLAIMED | 409 | Claim on already-claimed item |
| MODERATION_NOT_CLAIMED | 422 | Action on unclaimed item (if claim-first workflow) |
| SETTING_NOT_FOUND | 404 | Unknown setting key |
| INVALID_SETTING_VALUE | 422 | Value doesn't match expected type |
| CAMPAIGN_NOT_FOUND | 404 | Campaign ID not found |
| INVALID_CAMPAIGN_STATUS | 422 | Invalid campaign status transition |
| BULK_OPERATION_TOO_LARGE | 422 | More than 1000 items in single batch |
| AUDIT_IN_PROGRESS | 409 | SEO audit triggered while one is running |

---

## 5. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `AggregateDailyAnalytics` | Daily at 01:00 UTC | Aggregates raw analytics data into `daily_analytics` table for the previous day. |
| `AggregateAdDailyStats` | Daily at 01:30 UTC | Aggregates `ad_events` into `ad_daily_stats` and updates campaign/placement totals. |
| `ResetDailyImpressionCaps` | Daily at 00:00 UTC | Resets `ad_placements.today_impressions` to 0. |
| `AutoCompleteExpiredCampaigns` | Hourly | Transitions active campaigns past their `end_date` to `completed`. |
| `ExpireTimedSuspensions` | Every 15 minutes | Lifts user suspensions where `expires_at <= now()`. |
| `ProcessBulkOperations` | Continuous (worker) | Processes queued bulk operations. |
| `SendModerationDigest` | Daily at 08:00 UTC | Sends daily digest to moderators if pending queue is non-empty. |
| `RunSeoAudit` | Weekly (Sunday 03:00 UTC) | Runs automated SEO audit and caches results. |
| `ArchiveActivityLog` | Monthly (1st, 02:00 UTC) | Archives activity log entries older than 2 years to cold storage. |

---

## 6. Role Permissions Matrix

| Feature | User | Moderator | Editor | Admin | Super Admin |
|---------|------|-----------|--------|-------|-------------|
| View dashboard | - | - | Read-only | Full | Full |
| User management | - | - | - | Full (except super_admin) | Full |
| Moderation queue | - | Approve/Reject | Approve/Reject | Full + Escalation | Full |
| Content CRUD | Own only | - | All content | All content | All content |
| Site settings | - | - | - | Full | Full |
| SEO audit | - | - | View only | Full | Full |
| Ad management | - | - | - | Full | Full |
| Bulk operations | - | - | - | Full | Full |
| Activity log | - | - | - | View | Full |
| Role assignment | - | - | - | Up to editor | All roles |

---

## 7. Integration Points

| System | Integration |
|--------|-------------|
| All content modules | Moderation queue items, content management, analytics tracking |
| User/Auth Module | User management, role system, suspension/ban enforcement |
| Media Module (FR-MEDIA) | Ad creative images, site logos, storage stats |
| Search Module (FR-SEARCH) | Search index health on dashboard |
| Store Module (FR-STORE) | Order management, revenue analytics |
| Competitions Module (FR-COMP) | Competition management |
| Email Service | User notifications, moderation digests, bulk emails |

---

## 8. Non-Functional Constraints

- Admin panel pages SHALL be server-side rendered for SEO-irrelevant but performance-relevant reasons (fast initial load).
- Dashboard overview endpoint p95 latency < 500ms (pre-aggregated data).
- Activity log queries p95 latency < 300ms (indexed, partitioned).
- Ad serving endpoint p95 latency < 30ms (critical path for page render).
- Ad impression/click recording is fire-and-forget; endpoints return 202 and process asynchronously.
- The admin panel SHALL be accessible only at `admin.iloveberlin.biz` with an additional layer of IP allowlisting or Cloudflare Access for security.
- All admin API endpoints SHALL require a valid JWT with an admin-level role claim.
- CSRF protection SHALL be enforced on all state-changing admin endpoints.
- Rate limiting: admin endpoints are rate-limited to 100 requests per minute per user to prevent accidental bulk API abuse.
