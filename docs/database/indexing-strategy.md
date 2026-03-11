# Indexing Strategy

> Comprehensive indexing plan for the ILoveBerlin PostgreSQL database.

---

## Indexing Principles

1. **Every foreign key gets an index.** PostgreSQL does not auto-index FKs. Without an index, `ON DELETE CASCADE` and join queries perform full table scans.
2. **Partial indexes for filtered queries.** When queries always include `WHERE deleted_at IS NULL` or `WHERE status = 'published'`, a partial index excludes irrelevant rows, keeping the index small and fast.
3. **Composite indexes match query patterns.** Column order in a composite index matters: leftmost column is the primary filter.
4. **GIN indexes for full-text search and JSONB.** B-tree indexes cannot serve `ILIKE`, `@@`, or `@>` operators.
5. **Index what you query, not what you store.** Not every column needs an index. Write-heavy columns (e.g., `view_count`) may not need real-time indexes.

---

## Index Types Used

### B-tree (Default)

The standard index type. Used for equality, range, and sort operations.

```sql
CREATE INDEX idx_articles_published
  ON articles (published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';
```

**Used for:**
- Primary key lookups (automatic)
- Foreign key joins
- `WHERE column = value`
- `WHERE column BETWEEN x AND y`
- `ORDER BY column`
- Unique constraints

### GIN (Generalized Inverted Index)

Supports multi-valued data types: full-text search vectors, JSONB, arrays, and trigrams.

```sql
-- Full-text search
CREATE INDEX idx_articles_fts
  ON articles USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  );

-- JSONB containment
CREATE INDEX idx_product_variants_attributes
  ON product_variants USING gin (attributes);

-- Trigram similarity (fuzzy search)
CREATE INDEX idx_tags_name_trgm
  ON tags USING gin (name gin_trgm_ops);
```

**Used for:**
- `@@` full-text search operator
- `@>` JSONB containment operator
- `ILIKE '%partial%'` via trigram ops
- `similarity()` function via trigram ops

### Partial Indexes

B-tree or GIN indexes with a `WHERE` clause that limits the indexed rows.

```sql
CREATE INDEX idx_events_published_date
  ON events (start_date ASC)
  WHERE deleted_at IS NULL AND status = 'published';
```

**Used for:**
- Soft-deleted tables (exclude `deleted_at IS NOT NULL`)
- Status-filtered queries (only index `'published'` or `'active'` rows)
- Boolean flags (e.g., `WHERE is_free = TRUE`)

---

## Complete Index Inventory

### Users & Auth

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `users` | `uq_users_email_active` | B-tree UNIQUE | `email` | `WHERE deleted_at IS NULL` | Login lookup, uniqueness |
| `users` | `idx_users_role` | B-tree | `role` | `WHERE deleted_at IS NULL` | Admin: filter by role |
| `users` | `idx_users_status` | B-tree | `status` | `WHERE deleted_at IS NULL` | Moderation filtering |
| `users` | `idx_users_last_login` | B-tree | `last_login_at DESC` | `WHERE deleted_at IS NULL` | Inactive user report |
| `users` | `idx_users_created_at` | B-tree | `created_at DESC` | `WHERE deleted_at IS NULL` | Newest users |
| `refresh_tokens` | `idx_refresh_tokens_token_hash` | B-tree | `token_hash` | `WHERE revoked_at IS NULL` | Token refresh flow |
| `refresh_tokens` | `idx_refresh_tokens_user_id` | B-tree | `user_id` | `WHERE revoked_at IS NULL` | Revoke all sessions |
| `refresh_tokens` | `idx_refresh_tokens_expires_at` | B-tree | `expires_at` | `WHERE revoked_at IS NULL` | Cleanup job |
| `user_bookmarks` | `uq_user_bookmarks_unique` | B-tree UNIQUE | `(user_id, bookmarkable_type, bookmarkable_id)` | -- | One bookmark per entity |
| `user_bookmarks` | `idx_user_bookmarks_user_type` | B-tree | `(user_id, bookmarkable_type, created_at DESC)` | -- | My bookmarks by type |
| `user_bookmarks` | `idx_user_bookmarks_target` | B-tree | `(bookmarkable_type, bookmarkable_id)` | -- | Bookmark count per entity |

### Content

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `categories` | `uq_categories_slug_type` | B-tree UNIQUE | `(slug, type)` | -- | Unique slug per type |
| `categories` | `idx_categories_parent_sort` | B-tree | `(parent_id, sort_order)` | -- | Children listing |
| `categories` | `idx_categories_type` | B-tree | `(type, sort_order)` | -- | Categories by type |
| `tags` | `uq_tags_slug` | B-tree UNIQUE | `slug` | -- | Unique tag slug |
| `tags` | `idx_tags_name_trgm` | GIN | `name gin_trgm_ops` | -- | Tag autocomplete |
| `articles` | `uq_articles_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `articles` | `idx_articles_published` | B-tree | `published_at DESC` | `WHERE ... status='published'` | Homepage feed |
| `articles` | `idx_articles_category` | B-tree | `(category_id, published_at DESC)` | `WHERE ... status='published'` | Category page |
| `articles` | `idx_articles_author` | B-tree | `(author_id, published_at DESC)` | `WHERE deleted_at IS NULL` | Author profile |
| `articles` | `idx_articles_scheduled` | B-tree | `scheduled_at` | `WHERE status='scheduled'` | Auto-publish cron |
| `articles` | `idx_articles_fts` | GIN | `to_tsvector(title \|\| body)` | -- | Full-text search |
| `articles` | `idx_articles_view_count` | B-tree | `view_count DESC` | `WHERE ... status='published'` | Trending articles |
| `article_tags` | PK | B-tree | `(article_id, tag_id)` | -- | Composite PK |
| `article_tags` | `idx_article_tags_tag_id` | B-tree | `tag_id` | -- | Articles by tag |
| `article_revisions` | `idx_article_revisions_article` | B-tree | `(article_id, created_at DESC)` | -- | Revision history |
| `article_revisions` | `idx_article_revisions_editor` | B-tree | `(edited_by, created_at DESC)` | -- | Editor activity |

### Guides

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `guide_topics` | `uq_guide_topics_slug` | B-tree UNIQUE | `slug` | -- | Unique URL |
| `guide_topics` | `idx_guide_topics_sort` | B-tree | `sort_order` | -- | Ordered listing |
| `guides` | `uq_guides_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `guides` | `idx_guides_topic_published` | B-tree | `(topic_id, published_at DESC)` | `WHERE ... status='published'` | Topic page |
| `guides` | `idx_guides_published` | B-tree | `published_at DESC` | `WHERE ... status='published'` | Guides index |
| `guides` | `idx_guides_last_reviewed` | B-tree | `last_reviewed_at ASC NULLS FIRST` | `WHERE ... status='published'` | Stale content report |
| `guides` | `idx_guides_author` | B-tree | `(author_id, published_at DESC)` | `WHERE deleted_at IS NULL` | Author profile |
| `guides` | `idx_guides_fts` | GIN | `to_tsvector(title \|\| body)` | -- | Full-text search |

### Events

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `venues` | `uq_venues_slug` | B-tree UNIQUE | `slug` | -- | Unique URL |
| `venues` | `idx_venues_district` | B-tree | `district` | -- | District filter |
| `venues` | `idx_venues_name_trgm` | GIN | `name gin_trgm_ops` | -- | Venue autocomplete |
| `venues` | `idx_venues_geo` | B-tree | `(latitude, longitude)` | `WHERE lat/lng IS NOT NULL` | Map queries |
| `events` | `uq_events_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `events` | `idx_events_published_date` | B-tree | `(start_date, start_time)` | `WHERE ... status='published'` | Event listing |
| `events` | `idx_events_category_date` | B-tree | `(category_id, start_date)` | `WHERE ... status='published'` | Category filter |
| `events` | `idx_events_venue` | B-tree | `(venue_id, start_date)` | `WHERE ... status='published'` | Venue events |
| `events` | `idx_events_free` | B-tree | `start_date` | `WHERE ... is_free=TRUE` | Free events |
| `events` | `idx_events_pending` | B-tree | `created_at` | `WHERE status='pending_review'` | Moderation queue |
| `events` | `idx_events_submitted_by` | B-tree | `(submitted_by, created_at DESC)` | `WHERE deleted_at IS NULL` | User's events |
| `events` | `idx_events_fts` | GIN | `to_tsvector(title \|\| description)` | -- | Full-text search |

### Dining

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `cuisines` | `uq_cuisines_slug` | B-tree UNIQUE | `slug` | -- | Unique URL |
| `cuisines` | `idx_cuisines_sort` | B-tree | `sort_order` | -- | Ordered listing |
| `restaurants` | `uq_restaurants_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `restaurants` | `idx_restaurants_published` | B-tree | `name` | `WHERE ... status='published'` | Name sort |
| `restaurants` | `idx_restaurants_district` | B-tree | `district` | `WHERE ... status='published'` | District filter |
| `restaurants` | `idx_restaurants_price_range` | B-tree | `price_range` | `WHERE ... status='published'` | Price filter |
| `restaurants` | `idx_restaurants_rating` | B-tree | `rating DESC` | `WHERE ... status='published'` | Top-rated |
| `restaurants` | `idx_restaurants_geo` | B-tree | `(latitude, longitude)` | `WHERE ... status='published'` | Map view |
| `restaurants` | `idx_restaurants_name_trgm` | GIN | `name gin_trgm_ops` | -- | Name search |
| `restaurants` | `idx_restaurants_fts` | GIN | `to_tsvector(name \|\| description)` | -- | Full-text search |
| `restaurant_cuisines` | PK | B-tree | `(restaurant_id, cuisine_id)` | -- | Composite PK |
| `restaurant_cuisines` | `idx_restaurant_cuisines_cuisine` | B-tree | `cuisine_id` | -- | Restaurants by cuisine |
| `restaurant_images` | `idx_restaurant_images_restaurant` | B-tree | `(restaurant_id, sort_order)` | -- | Gallery |
| `dining_offers` | `idx_dining_offers_active` | B-tree | `(restaurant_id, start_date, end_date)` | `WHERE is_active=TRUE` | Active offers |
| `dining_offers` | `idx_dining_offers_current` | B-tree | `end_date` | `WHERE is_active=TRUE` | Offers listing |

### Videos

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `video_series` | `uq_video_series_slug` | B-tree UNIQUE | `slug` | -- | Unique URL |
| `video_series` | `idx_video_series_sort` | B-tree | `sort_order` | -- | Ordered listing |
| `videos` | `uq_videos_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `videos` | `idx_videos_published` | B-tree | `published_at DESC` | `WHERE ... status='published'` | Video feed |
| `videos` | `idx_videos_series` | B-tree | `(series_id, published_at DESC)` | `WHERE ... status='published'` | Series page |
| `videos` | `idx_videos_category` | B-tree | `(category_id, published_at DESC)` | `WHERE ... status='published'` | Category page |
| `videos` | `idx_videos_popular` | B-tree | `view_count DESC` | `WHERE ... status='published'` | Trending videos |
| `videos` | `idx_videos_fts` | GIN | `to_tsvector(title \|\| description)` | -- | Full-text search |
| `video_tags` | PK | B-tree | `(video_id, tag_id)` | -- | Composite PK |
| `video_tags` | `idx_video_tags_tag_id` | B-tree | `tag_id` | -- | Videos by tag |

### Competitions

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `competitions` | `uq_competitions_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `competitions` | `idx_competitions_active` | B-tree | `end_date` | `WHERE ... status='active'` | Active competitions |
| `competitions` | `idx_competitions_published` | B-tree | `created_at DESC` | `WHERE ... status IN (...)` | Listing page |
| `competitions` | `idx_competitions_scheduled` | B-tree | `start_date` | `WHERE status='draft'` | Activation cron |
| `competition_entries` | `uq_competition_entries_one_per_user` | B-tree UNIQUE | `(competition_id, user_id)` | -- | One entry per user |
| `competition_entries` | `idx_competition_entries_competition` | B-tree | `(competition_id, created_at DESC)` | -- | Entrant listing |
| `competition_entries` | `idx_competition_entries_user` | B-tree | `(user_id, created_at DESC)` | -- | My competitions |

### Classifieds

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `classified_categories` | `uq_classified_categories_slug` | B-tree UNIQUE | `slug` | -- | Unique URL |
| `classifieds` | `uq_classifieds_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `classifieds` | `idx_classifieds_active` | B-tree | `created_at DESC` | `WHERE ... status='active'` | Browse page |
| `classifieds` | `idx_classifieds_category` | B-tree | `(category_id, created_at DESC)` | `WHERE ... status='active'` | Category filter |
| `classifieds` | `idx_classifieds_district` | B-tree | `(district, created_at DESC)` | `WHERE ... status='active'` | District filter |
| `classifieds` | `idx_classifieds_featured` | B-tree | `created_at DESC` | `WHERE ... featured=TRUE` | Featured widget |
| `classifieds` | `idx_classifieds_user` | B-tree | `(user_id, created_at DESC)` | `WHERE deleted_at IS NULL` | My ads |
| `classifieds` | `idx_classifieds_pending` | B-tree | `created_at` | `WHERE status='pending_review'` | Moderation queue |
| `classifieds` | `idx_classifieds_expires` | B-tree | `expires_at` | `WHERE status='active'` | Expiration cron |
| `classifieds` | `idx_classifieds_fts` | GIN | `to_tsvector(title \|\| description)` | -- | Full-text search |
| `classifieds` | `idx_classifieds_price` | B-tree | `price ASC` | `WHERE ... status='active'` | Price filter |
| `classified_images` | `idx_classified_images_classified` | B-tree | `(classified_id, sort_order)` | -- | Gallery |
| `classified_messages` | `idx_classified_messages_thread` | B-tree | `(classified_id, sender_id, receiver_id, created_at)` | -- | Conversation |
| `classified_messages` | `idx_classified_messages_inbox` | B-tree | `(receiver_id, created_at DESC)` | `WHERE read_at IS NULL` | Unread inbox |
| `classified_messages` | `idx_classified_messages_sent` | B-tree | `(sender_id, created_at DESC)` | -- | Sent messages |
| `classified_reports` | `idx_classified_reports_pending` | B-tree | `created_at` | `WHERE status='pending'` | Moderation queue |
| `classified_reports` | `idx_classified_reports_classified` | B-tree | `classified_id` | -- | Reports per ad |
| `classified_reports` | `idx_classified_reports_reporter` | B-tree | `(reporter_id, created_at DESC)` | -- | Reporter history |

### Store

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `product_categories` | `uq_product_categories_slug` | B-tree UNIQUE | `slug` | -- | Unique URL |
| `products` | `uq_products_slug_active` | B-tree UNIQUE | `slug` | `WHERE deleted_at IS NULL` | Unique URL |
| `products` | `idx_products_active` | B-tree | `created_at DESC` | `WHERE ... status='active'` | Store front |
| `products` | `idx_products_category` | B-tree | `(category_id, created_at DESC)` | `WHERE ... status='active'` | Category page |
| `products` | `idx_products_price` | B-tree | `base_price` | `WHERE ... status='active'` | Price sort |
| `products` | `idx_products_fts` | GIN | `to_tsvector(name \|\| description)` | -- | Product search |
| `product_variants` | `uq_product_variants_sku` | B-tree UNIQUE | `sku` | -- | SKU lookup |
| `product_variants` | `idx_product_variants_product` | B-tree | `product_id` | -- | Variant listing |
| `product_variants` | `idx_product_variants_low_stock` | B-tree | `stock_quantity` | `WHERE stock_quantity < 10` | Low stock alert |
| `product_variants` | `idx_product_variants_attributes` | GIN | `attributes` | -- | Attribute filtering |
| `product_images` | `idx_product_images_product` | B-tree | `(product_id, sort_order)` | -- | Gallery |
| `carts` | `uq_carts_user` | B-tree UNIQUE | `user_id` | `WHERE user_id IS NOT NULL` | One cart per user |
| `carts` | `uq_carts_session` | B-tree UNIQUE | `session_id` | `WHERE session_id IS NOT NULL` | Guest cart |
| `carts` | `idx_carts_updated` | B-tree | `updated_at` | -- | Stale cart cleanup |
| `cart_items` | `idx_cart_items_cart` | B-tree | `cart_id` | -- | Cart contents |
| `cart_items` | `uq_cart_items_cart_variant` | B-tree UNIQUE | `(cart_id, variant_id)` | -- | No duplicate variants |
| `orders` | `idx_orders_user` | B-tree | `(user_id, created_at DESC)` | -- | Order history |
| `orders` | `idx_orders_status` | B-tree | `(status, created_at DESC)` | -- | Fulfillment dashboard |
| `orders` | `uq_orders_stripe_pi` | B-tree UNIQUE | `stripe_payment_intent_id` | `WHERE ... IS NOT NULL` | Webhook lookup |
| `orders` | `idx_orders_created` | B-tree | `created_at DESC` | `WHERE status IN (...)` | Revenue report |
| `order_items` | `idx_order_items_order` | B-tree | `order_id` | -- | Order details |
| `discount_codes` | `uq_discount_codes_code` | B-tree UNIQUE | `code` | -- | Code validation |
| `discount_codes` | `idx_discount_codes_validity` | B-tree | `(valid_from, valid_until)` | -- | Active codes |

### Media

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `media` | `uq_media_storage_key` | B-tree UNIQUE | `storage_key` | -- | Object storage dedup |
| `media` | `idx_media_uploaded_by` | B-tree | `(uploaded_by, created_at DESC)` | `WHERE deleted_at IS NULL` | Uploader's files |
| `media` | `idx_media_mime_type` | B-tree | `mime_type` | `WHERE deleted_at IS NULL` | Type filter |
| `media` | `idx_media_created_at` | B-tree | `created_at DESC` | `WHERE deleted_at IS NULL` | Recent uploads |
| `media` | `idx_media_original_filename_trgm` | GIN | `original_filename gin_trgm_ops` | -- | Filename search |

### Admin

| Table | Index | Type | Columns | Partial | Purpose |
|-------|-------|------|---------|---------|---------|
| `admin_activity_log` | `idx_admin_activity_log_created` | B-tree | `created_at DESC` | -- | Recent activity |
| `admin_activity_log` | `idx_admin_activity_log_user` | B-tree | `(user_id, created_at DESC)` | -- | User audit |
| `admin_activity_log` | `idx_admin_activity_log_entity` | B-tree | `(entity_type, entity_id, created_at DESC)` | -- | Entity history |
| `admin_activity_log` | `idx_admin_activity_log_action` | B-tree | `(action, created_at DESC)` | -- | Action filter |
| `admin_activity_log` | `idx_admin_activity_log_details` | GIN | `details` | -- | JSONB queries |
| `homepage_featured` | `idx_homepage_featured_section` | B-tree | `(section, sort_order)` | -- | Homepage rendering |
| `homepage_featured` | `uq_homepage_featured_content` | B-tree UNIQUE | `(section, content_type, content_id)` | -- | No duplicates |
| `ad_campaigns` | `idx_ad_campaigns_active` | B-tree | `(start_date, end_date)` | `WHERE status='active'` | Ad serving |
| `ad_campaigns` | `idx_ad_campaigns_advertiser` | B-tree | `advertiser` | -- | Account management |
| `ad_campaigns` | `idx_ad_campaigns_status` | B-tree | `(status, start_date DESC)` | -- | Dashboard |
| `ad_placements` | `idx_ad_placements_campaign` | B-tree | `campaign_id` | -- | Campaign placements |
| `ad_placements` | `idx_ad_placements_position` | B-tree | `position` | -- | Position query |
| `notification_preferences` | `uq_notification_prefs_user` | B-tree UNIQUE | `user_id` | -- | 1:1 with users |
| `notification_preferences` | `idx_notification_prefs_email_articles` | B-tree | `user_id` | `WHERE email_new_articles=TRUE` | Batch email |
| `notification_preferences` | `idx_notification_prefs_email_competitions` | B-tree | `user_id` | `WHERE email_competitions=TRUE` | Batch email |
| `notification_preferences` | `idx_notification_prefs_push_events` | B-tree | `user_id` | `WHERE push_events=TRUE` | Push notifications |

---

## Index Monitoring & Optimization

### Identifying Unused Indexes

```sql
-- Indexes that have never been used since last stats reset
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'uq_%'  -- Don't drop unique indexes
  AND indexrelname NOT LIKE '%_pkey' -- Don't drop primary keys
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Identifying Missing Indexes

```sql
-- Tables with the highest ratio of sequential scans to index scans
SELECT
  schemaname,
  relname AS table_name,
  seq_scan,
  idx_scan,
  CASE WHEN seq_scan > 0
    THEN round(100.0 * idx_scan / (seq_scan + idx_scan), 1)
    ELSE 100
  END AS idx_scan_pct,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE n_live_tup > 1000
ORDER BY seq_scan DESC
LIMIT 20;
```

### Index Size Report

```sql
-- All indexes with their sizes
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS times_used,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Index Bloat Detection

```sql
-- Estimate index bloat (simplified)
SELECT
  nspname AS schema,
  relname AS index_name,
  pg_size_pretty(pg_relation_size(oid)) AS index_size,
  pg_size_pretty(
    pg_relation_size(oid) - (
      SELECT (relpages * current_setting('block_size')::int)
      FROM pg_class
      WHERE oid = indexrelid
    )
  ) AS estimated_bloat
FROM pg_stat_user_indexes
JOIN pg_class ON pg_class.oid = indexrelid
WHERE pg_relation_size(indexrelid) > 1024 * 1024  -- > 1 MB
ORDER BY pg_relation_size(indexrelid) DESC;
```

### REINDEX for Bloated Indexes

```sql
-- Rebuild a bloated index (locks the table briefly)
REINDEX INDEX CONCURRENTLY idx_articles_published;

-- Or rebuild all indexes on a table
REINDEX TABLE CONCURRENTLY articles;
```

---

## Performance Benchmarks

Estimated query performance targets (with proper indexing):

| Query Pattern | Expected Time | Index Used |
|--------------|---------------|------------|
| User login (email lookup) | < 1ms | `uq_users_email_active` |
| Published articles feed (page 1) | < 5ms | `idx_articles_published` |
| Article by slug | < 1ms | `uq_articles_slug_active` |
| Full-text search (articles) | < 50ms | `idx_articles_fts` |
| Events this week | < 10ms | `idx_events_published_date` |
| Restaurants by district | < 5ms | `idx_restaurants_district` |
| Restaurant by cuisine | < 10ms | `idx_restaurant_cuisines_cuisine` + join |
| Product variant by SKU | < 1ms | `uq_product_variants_sku` |
| User's order history | < 5ms | `idx_orders_user` |
| Admin activity feed | < 5ms | `idx_admin_activity_log_created` |
| Unread messages count | < 2ms | `idx_classified_messages_inbox` |

These targets assume datasets of < 100K rows per table (appropriate for a city guide). For tables that may grow larger (e.g., `admin_activity_log`, `classified_messages`), monitoring and potential partitioning should be considered.

---

## Index Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| ANALYZE tables | After bulk inserts, weekly via cron | `ANALYZE;` |
| Check for unused indexes | Monthly | Query above |
| Check for missing indexes | Monthly | Query above |
| Check index bloat | Quarterly | Query above |
| REINDEX bloated indexes | As needed | `REINDEX CONCURRENTLY` |
| Review slow query log | Weekly | `pg_stat_statements` |
