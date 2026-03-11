# FR-SEARCH: Search

**Module:** Search
**Status:** Draft
**Last Updated:** 2026-03-11
**Owner:** Platform Team
**Related User Stories:** US-SEARCH-001 through US-SEARCH-035

---

## 1. Overview

The Search module integrates Meilisearch as the full-text search engine for the ILoveBerlin platform. It provides unified search across seven content types (articles, guides, events, restaurants, videos, classifieds, products), autocomplete/suggest functionality, type-specific filtering, configurable ranking rules with freshness boosting, typo tolerance, event-driven index updates, and a full rebuild script for disaster recovery and schema migrations.

---

## 2. Functional Requirements

### 2.1 Meilisearch Integration

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-001 | The system SHALL run a self-hosted Meilisearch instance on the Hetzner infrastructure behind Cloudflare. | Must | US-SEARCH-001 |
| FR-SEARCH-002 | The NestJS backend SHALL communicate with Meilisearch via the official Meilisearch JavaScript SDK (`meilisearch` npm package). | Must | US-SEARCH-002 |
| FR-SEARCH-003 | The Meilisearch master key SHALL be stored in environment variables and never exposed to the frontend. | Must | US-SEARCH-003 |
| FR-SEARCH-004 | The backend SHALL generate scoped API keys (search-only, with index restrictions and expiry) for direct frontend-to-Meilisearch queries where applicable (autocomplete). | Should | US-SEARCH-004 |
| FR-SEARCH-005 | The system SHALL maintain separate Meilisearch indexes for each content type. Index names follow the pattern `ilb_{content_type}` (e.g., `ilb_articles`, `ilb_videos`). | Must | US-SEARCH-005 |

### 2.2 Content Type Indexes

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-006 | The system SHALL maintain the following 7 indexes with the specified document schemas: | Must | US-SEARCH-006 |

#### Index: `ilb_articles`

| Field | Type | Searchable | Filterable | Sortable | Displayed |
|-------|------|-----------|------------|----------|-----------|
| `id` | String (UUID) | No | Yes | No | Yes |
| `title` | String | Yes | No | No | Yes |
| `excerpt` | String | Yes | No | No | Yes |
| `body` | String | Yes | No | No | No |
| `slug` | String | No | No | No | Yes |
| `category` | String | No | Yes | No | Yes |
| `tags` | String[] | No | Yes | No | Yes |
| `author_name` | String | Yes | No | No | Yes |
| `thumbnail_url` | String | No | No | No | Yes |
| `published_at` | Number (Unix ts) | No | Yes | Yes | Yes |
| `_geo` | Object | No | No | No | No |

#### Index: `ilb_guides`

| Field | Type | Searchable | Filterable | Sortable | Displayed |
|-------|------|-----------|------------|----------|-----------|
| `id` | String (UUID) | No | Yes | No | Yes |
| `title` | String | Yes | No | No | Yes |
| `excerpt` | String | Yes | No | No | Yes |
| `body` | String | Yes | No | No | No |
| `slug` | String | No | No | No | Yes |
| `category` | String | No | Yes | No | Yes |
| `tags` | String[] | No | Yes | No | Yes |
| `thumbnail_url` | String | No | No | No | Yes |
| `published_at` | Number (Unix ts) | No | Yes | Yes | Yes |

#### Index: `ilb_events`

| Field | Type | Searchable | Filterable | Sortable | Displayed |
|-------|------|-----------|------------|----------|-----------|
| `id` | String (UUID) | No | Yes | No | Yes |
| `title` | String | Yes | No | No | Yes |
| `excerpt` | String | Yes | No | No | Yes |
| `body` | String | Yes | No | No | No |
| `slug` | String | No | No | No | Yes |
| `category` | String | No | Yes | No | Yes |
| `venue` | String | Yes | Yes | No | Yes |
| `district` | String | No | Yes | No | Yes |
| `start_date` | Number (Unix ts) | No | Yes | Yes | Yes |
| `end_date` | Number (Unix ts) | No | Yes | No | Yes |
| `is_free` | Boolean | No | Yes | No | Yes |
| `thumbnail_url` | String | No | No | No | Yes |
| `published_at` | Number (Unix ts) | No | No | No | Yes |

#### Index: `ilb_restaurants`

| Field | Type | Searchable | Filterable | Sortable | Displayed |
|-------|------|-----------|------------|----------|-----------|
| `id` | String (UUID) | No | Yes | No | Yes |
| `name` | String | Yes | No | No | Yes |
| `description` | String | Yes | No | No | Yes |
| `slug` | String | No | No | No | Yes |
| `cuisine` | String[] | No | Yes | No | Yes |
| `district` | String | No | Yes | No | Yes |
| `price_range` | String | No | Yes | No | Yes |
| `rating` | Number | No | Yes | Yes | Yes |
| `thumbnail_url` | String | No | No | No | Yes |
| `_geo` | Object {lat, lng} | No | Yes (geoRadius) | Yes (geoPoint) | Yes |
| `published_at` | Number (Unix ts) | No | No | No | Yes |

#### Index: `ilb_videos`

| Field | Type | Searchable | Filterable | Sortable | Displayed |
|-------|------|-----------|------------|----------|-----------|
| `id` | String (UUID) | No | Yes | No | Yes |
| `title` | String | Yes | No | No | Yes |
| `excerpt` | String | Yes | No | No | Yes |
| `description` | String | Yes | No | No | No |
| `slug` | String | No | No | No | Yes |
| `series` | String | No | Yes | No | Yes |
| `category` | String | No | Yes | No | Yes |
| `tags` | String[] | No | Yes | No | Yes |
| `embed_provider` | String | No | Yes | No | Yes |
| `thumbnail_url` | String | No | No | No | Yes |
| `view_count` | Number | No | No | Yes | Yes |
| `published_at` | Number (Unix ts) | No | Yes | Yes | Yes |

#### Index: `ilb_classifieds`

| Field | Type | Searchable | Filterable | Sortable | Displayed |
|-------|------|-----------|------------|----------|-----------|
| `id` | String (UUID) | No | Yes | No | Yes |
| `title` | String | Yes | No | No | Yes |
| `description` | String | Yes | No | No | No |
| `slug` | String | No | No | No | Yes |
| `category` | String | No | Yes | No | Yes |
| `subcategory` | String | No | Yes | No | Yes |
| `price` | Number | No | Yes | Yes | Yes |
| `price_type` | String | No | Yes | No | Yes |
| `district` | String | No | Yes | No | Yes |
| `is_premium` | Boolean | No | Yes | No | Yes |
| `thumbnail_url` | String | No | No | No | Yes |
| `approved_at` | Number (Unix ts) | No | Yes | Yes | Yes |

#### Index: `ilb_products`

| Field | Type | Searchable | Filterable | Sortable | Displayed |
|-------|------|-----------|------------|----------|-----------|
| `id` | String (UUID) | No | Yes | No | Yes |
| `name` | String | Yes | No | No | Yes |
| `excerpt` | String | Yes | No | No | Yes |
| `description` | String | Yes | No | No | No |
| `slug` | String | No | No | No | Yes |
| `category` | String | No | Yes | No | Yes |
| `tags` | String[] | No | Yes | No | Yes |
| `price` | Number | No | Yes | Yes | Yes |
| `compare_at_price` | Number | No | No | No | Yes |
| `in_stock` | Boolean | No | Yes | No | Yes |
| `is_featured` | Boolean | No | Yes | No | Yes |
| `thumbnail_url` | String | No | No | No | Yes |
| `created_at` | Number (Unix ts) | No | Yes | Yes | Yes |

### 2.3 Search API

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-007 | The system SHALL provide a unified search endpoint that searches across all indexes and returns combined results grouped by content type. | Must | US-SEARCH-007 |
| FR-SEARCH-008 | The system SHALL provide per-index search endpoints for type-specific search with type-specific filters. | Must | US-SEARCH-008 |
| FR-SEARCH-009 | Search results SHALL include: document data (displayed fields only), relevance score, and highlight/match information. | Must | US-SEARCH-009 |
| FR-SEARCH-010 | Search results SHALL support pagination via `offset` and `limit` parameters (max limit 50). | Must | US-SEARCH-010 |
| FR-SEARCH-011 | The unified search endpoint SHALL return the top N results from each content type (default 3), with total count per type for "see all" links. | Must | US-SEARCH-011 |

### 2.4 Autocomplete / Suggest

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-012 | The system SHALL provide an autocomplete endpoint that returns suggestions as the user types (minimum 2 characters). | Must | US-SEARCH-012 |
| FR-SEARCH-013 | Autocomplete results SHALL return within 50ms (p95) to support real-time typing. | Must | US-SEARCH-013 |
| FR-SEARCH-014 | Autocomplete SHALL search across all indexes and return up to 5 suggestions per content type (max 15 total), including title, type label, thumbnail, and slug. | Must | US-SEARCH-014 |
| FR-SEARCH-015 | The frontend (Next.js and Flutter) SHALL debounce autocomplete requests by 200ms. | Must | US-SEARCH-015 |
| FR-SEARCH-016 | Autocomplete SHALL highlight the matching portion of the suggestion text. | Should | US-SEARCH-016 |

### 2.5 Type Filtering

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-017 | Users SHALL be able to filter search results by one or more content types (e.g., show only articles and guides). | Must | US-SEARCH-017 |
| FR-SEARCH-018 | Users SHALL be able to apply type-specific filters when searching within a single content type (e.g., events filtered by district and date range, classifieds filtered by category and price range, restaurants filtered by cuisine and price range). | Must | US-SEARCH-018 |
| FR-SEARCH-019 | Filters SHALL be passed as query parameters and mapped to Meilisearch `filter` expressions. | Must | US-SEARCH-019 |
| FR-SEARCH-020 | The search results page SHALL display available filter options with counts (faceted search) where applicable. | Should | US-SEARCH-020 |

### 2.6 Ranking Rules

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-021 | Each index SHALL be configured with the following Meilisearch ranking rules in order: `words`, `typo`, `proximity`, `attribute`, `sort`, `exactness`, `published_at:desc` (freshness boost). | Must | US-SEARCH-021 |
| FR-SEARCH-022 | The `attribute` ranking SHALL prioritize fields in this order: title/name > excerpt > body/description. This is achieved via the `searchableAttributes` setting. | Must | US-SEARCH-022 |
| FR-SEARCH-023 | The freshness boost (`published_at:desc` or equivalent timestamp) SHALL give recently published content higher ranking when relevance scores are otherwise equal. | Must | US-SEARCH-023 |
| FR-SEARCH-024 | For the `ilb_restaurants` index, sorting by `_geoPoint(lat, lng)` SHALL be supported for proximity-based results. | Should | US-SEARCH-024 |
| FR-SEARCH-025 | For the `ilb_products` index, sorting by `price` (ascending/descending) SHALL be supported alongside relevance. | Should | US-SEARCH-025 |

### 2.7 Typo Tolerance

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-026 | Typo tolerance SHALL be enabled on all indexes with the following Meilisearch settings: `minWordSizeForTypos.oneTypo: 4`, `minWordSizeForTypos.twoTypos: 8`. | Must | US-SEARCH-026 |
| FR-SEARCH-027 | Typo tolerance SHALL be disabled for the following attributes across all indexes: `slug`, `id`, `sku`. | Must | US-SEARCH-027 |
| FR-SEARCH-028 | The system SHALL configure a stop words list for German and English common words (der, die, das, the, a, an, etc.) to improve search precision. | Should | US-SEARCH-028 |
| FR-SEARCH-029 | The system SHALL configure synonyms for common Berlin-related terms (e.g., "Kreuzberg" -> "Xberg", "Friedrichshain" -> "Fhain", "restaurant" -> "restaurant, eatery, dining"). | Should | US-SEARCH-029 |

### 2.8 Event-Driven Index Updates

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-030 | The system SHALL update Meilisearch indexes in near-real-time when content is created, updated, published, unpublished, or deleted. | Must | US-SEARCH-030 |
| FR-SEARCH-031 | Index updates SHALL be triggered by domain events (e.g., `VideoPublished`, `ClassifiedApproved`, `ProductUpdated`) published to an internal event bus. | Must | US-SEARCH-031 |
| FR-SEARCH-032 | The search indexer SHALL subscribe to these events and perform the appropriate Meilisearch operation (addDocuments, updateDocuments, deleteDocument). | Must | US-SEARCH-032 |
| FR-SEARCH-033 | Index updates SHALL be processed asynchronously (via a job queue) to avoid blocking the primary request. Meilisearch task IDs SHALL be logged for monitoring. | Must | US-SEARCH-033 |
| FR-SEARCH-034 | If an index update fails, the system SHALL retry up to 3 times with exponential backoff (1s, 5s, 25s). Permanent failures SHALL be logged to the error tracking system. | Must | US-SEARCH-034 |

### 2.9 Full Rebuild Script

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-SEARCH-035 | The system SHALL provide a CLI command (`npm run search:rebuild` or NestJS CLI command) that performs a full rebuild of all Meilisearch indexes from the PostgreSQL database. | Must | US-SEARCH-035 |
| FR-SEARCH-036 | The rebuild script SHALL: (1) create new indexes with a temporary name suffix, (2) configure settings (searchable attributes, filterable attributes, sortable attributes, ranking rules, typo tolerance, synonyms, stop words), (3) batch-import all documents (1000 per batch), (4) swap the new index with the live index atomically (Meilisearch index swap), (5) delete the old index. | Must | US-SEARCH-036 |
| FR-SEARCH-037 | The rebuild script SHALL support rebuilding a single index by name (e.g., `npm run search:rebuild -- --index=ilb_videos`) or all indexes. | Should | US-SEARCH-037 |
| FR-SEARCH-038 | The rebuild script SHALL log progress (documents indexed, time elapsed, errors) to stdout. | Must | US-SEARCH-038 |
| FR-SEARCH-039 | The rebuild script SHALL be safe to run in production without downtime (zero-downtime rebuild via index swap). | Must | US-SEARCH-039 |

---

## 3. Database Schema

The Search module does not introduce its own PostgreSQL tables; it reads from tables owned by other modules. However, it does maintain a tracking table for index synchronization:

### 3.1 Table: `search_index_sync_log`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `index_name` | `VARCHAR(50)` | NOT NULL | Meilisearch index name |
| `operation` | `VARCHAR(20)` | NOT NULL, CHECK IN ('add','update','delete','rebuild') | Operation type |
| `document_id` | `UUID` | NULLABLE | Document ID (null for rebuilds) |
| `meilisearch_task_id` | `INTEGER` | NULLABLE | Meilisearch async task ID |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'queued', CHECK IN ('queued','processing','completed','failed') | Sync status |
| `error_message` | `TEXT` | NULLABLE | Error details |
| `retry_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of retry attempts |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Event timestamp |
| `completed_at` | `TIMESTAMPTZ` | NULLABLE | Completion timestamp |

**Indexes:**
- `idx_search_sync_log_status` on `status` WHERE `status` IN ('queued', 'processing')
- `idx_search_sync_log_index` on (`index_name`, `created_at` DESC)
- `idx_search_sync_log_document` on (`index_name`, `document_id`)

### 3.2 Table: `search_index_metadata`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `index_name` | `VARCHAR(50)` | PK | Meilisearch index name |
| `last_full_rebuild_at` | `TIMESTAMPTZ` | NULLABLE | Last successful rebuild timestamp |
| `last_rebuild_duration_ms` | `INTEGER` | NULLABLE | Duration of last rebuild |
| `document_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Current document count |
| `settings_hash` | `VARCHAR(64)` | NULLABLE | SHA-256 hash of current settings (for detecting config drift) |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

---

## 4. API Endpoints

### 4.1 Public Search Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/search` | None | Unified search across all types | `q` (required, min 2 chars), `types` (comma-separated: articles, guides, events, restaurants, videos, classifieds, products), `limit_per_type` (default 3, max 10), `offset` (default 0) |
| GET | `/api/v1/search/autocomplete` | None | Autocomplete suggestions | `q` (required, min 2 chars), `types` (comma-separated, optional), `limit` (default 5 per type, max 10) |
| GET | `/api/v1/search/articles` | None | Search articles | `q`, `category`, `tag`, `sort` (relevance, newest), `offset`, `limit` |
| GET | `/api/v1/search/guides` | None | Search guides | `q`, `category`, `tag`, `sort`, `offset`, `limit` |
| GET | `/api/v1/search/events` | None | Search events | `q`, `category`, `district`, `date_from` (Unix ts), `date_to`, `is_free` (bool), `sort` (relevance, date, newest), `offset`, `limit` |
| GET | `/api/v1/search/restaurants` | None | Search restaurants | `q`, `cuisine`, `district`, `price_range`, `min_rating`, `lat`, `lng`, `radius_km` (for geo), `sort` (relevance, rating, distance), `offset`, `limit` |
| GET | `/api/v1/search/videos` | None | Search videos | `q`, `series`, `category`, `tag`, `sort` (relevance, newest, popular), `offset`, `limit` |
| GET | `/api/v1/search/classifieds` | None | Search classifieds | `q`, `category`, `subcategory`, `district`, `price_min`, `price_max`, `price_type`, `sort` (relevance, newest, price_asc, price_desc), `offset`, `limit` |
| GET | `/api/v1/search/products` | None | Search products | `q`, `category`, `tag`, `min_price`, `max_price`, `in_stock` (bool), `sort` (relevance, newest, price_asc, price_desc), `offset`, `limit` |

**Unified search response format:**
```json
{
  "query": "kreuzberg brunch",
  "processing_time_ms": 12,
  "results": {
    "articles": {
      "hits": [
        {
          "id": "uuid",
          "title": "Best Brunch Spots in <em>Kreuzberg</em>",
          "excerpt": "Discover the top <em>brunch</em> cafes...",
          "slug": "best-brunch-kreuzberg",
          "category": "Food & Drink",
          "thumbnail_url": "https://...",
          "published_at": 1710000000,
          "_score": 0.95
        }
      ],
      "total_hits": 15,
      "limit": 3
    },
    "restaurants": {
      "hits": [...],
      "total_hits": 42,
      "limit": 3
    },
    "events": { "hits": [], "total_hits": 0, "limit": 3 },
    "guides": { "hits": [...], "total_hits": 5, "limit": 3 },
    "videos": { "hits": [], "total_hits": 0, "limit": 3 },
    "classifieds": { "hits": [], "total_hits": 0, "limit": 3 },
    "products": { "hits": [...], "total_hits": 2, "limit": 3 }
  }
}
```

**Autocomplete response format:**
```json
{
  "query": "kreuz",
  "suggestions": [
    { "title": "Kreuzberg Guide", "type": "guide", "slug": "kreuzberg-guide", "thumbnail_url": "...", "highlight": "<em>Kreuz</em>berg Guide" },
    { "title": "Kreuzberg Street Food Festival", "type": "event", "slug": "kreuzberg-street-food-festival", "thumbnail_url": "...", "highlight": "<em>Kreuz</em>berg Street Food Festival" }
  ]
}
```

**Per-type search response format:**
```json
{
  "query": "brunch",
  "index": "ilb_restaurants",
  "processing_time_ms": 8,
  "hits": [
    {
      "id": "uuid",
      "name": "Cafe <em>Brunch</em> Berlin",
      "description": "...",
      "slug": "cafe-brunch-berlin",
      "cuisine": ["German", "International"],
      "district": "Kreuzberg",
      "price_range": "$$",
      "rating": 4.5,
      "thumbnail_url": "...",
      "_score": 0.92
    }
  ],
  "total_hits": 42,
  "offset": 0,
  "limit": 20,
  "facets": {
    "cuisine": { "German": 12, "International": 8, "Italian": 5 },
    "district": { "Kreuzberg": 15, "Mitte": 10, "Prenzlauer Berg": 8 },
    "price_range": { "$": 5, "$$": 20, "$$$": 12, "$$$$": 5 }
  }
}
```

### 4.2 Admin Search Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/search/status` | Admin | Get index health and stats | — |
| POST | `/api/v1/admin/search/rebuild` | Admin | Trigger full rebuild | Body: `{ index: "ilb_videos" }` (optional; omit for all) |
| GET | `/api/v1/admin/search/rebuild/:taskId` | Admin | Check rebuild progress | — |
| GET | `/api/v1/admin/search/sync-log` | Admin | View recent sync operations | `index`, `status`, `limit` (default 50) |

**Admin status response:**
```json
{
  "indexes": [
    {
      "name": "ilb_articles",
      "document_count": 1245,
      "is_indexing": false,
      "last_rebuild_at": "ISO8601",
      "last_rebuild_duration_ms": 4500,
      "pending_sync_tasks": 0,
      "failed_sync_tasks": 0,
      "settings_hash": "abc123..."
    }
  ],
  "meilisearch_version": "1.8.0",
  "meilisearch_health": "available"
}
```

### 4.3 Error Responses

| Code | Status | Trigger |
|------|--------|---------|
| SEARCH_QUERY_TOO_SHORT | 422 | Query `q` is fewer than 2 characters |
| SEARCH_UNAVAILABLE | 503 | Meilisearch is unreachable |
| INVALID_INDEX | 422 | Unknown index name in rebuild request |
| REBUILD_IN_PROGRESS | 409 | Rebuild triggered while another is running |
| INVALID_FILTER | 422 | Unsupported filter parameter or value |
| INVALID_GEO_PARAMS | 422 | Missing lat/lng or invalid radius for geo search |

---

## 5. Meilisearch Index Configuration

### 5.1 Common Settings (applied to all indexes)

```json
{
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": {
      "oneTypo": 4,
      "twoTypos": 8
    },
    "disableOnAttributes": ["id", "slug"]
  },
  "pagination": {
    "maxTotalHits": 1000
  },
  "faceting": {
    "maxValuesPerFacet": 100
  }
}
```

### 5.2 Stop Words

```json
{
  "stopWords": [
    "der", "die", "das", "den", "dem", "des",
    "ein", "eine", "einer", "eines", "einem", "einen",
    "und", "oder", "aber", "nicht", "ist", "sind", "war", "für", "von", "mit", "auf", "in", "zu",
    "the", "a", "an", "and", "or", "but", "not", "is", "are", "was", "for", "of", "with", "on", "in", "to", "at"
  ]
}
```

### 5.3 Synonyms

```json
{
  "synonyms": {
    "kreuzberg": ["xberg", "x-berg"],
    "friedrichshain": ["fhain", "f-hain"],
    "prenzlauer berg": ["p-berg", "pberg"],
    "charlottenburg": ["charlenburg"],
    "schoeneberg": ["schöneberg"],
    "neukoelln": ["neukölln"],
    "restaurant": ["eatery", "dining", "bistro"],
    "cafe": ["café", "coffee shop", "kaffee"],
    "bar": ["pub", "kneipe"],
    "club": ["nightclub", "disco"],
    "apartment": ["flat", "wohnung"],
    "bicycle": ["bike", "fahrrad"],
    "flea market": ["flohmarkt", "fleamarket"]
  }
}
```

### 5.4 Per-Index Searchable Attributes (priority order)

| Index | Searchable Attributes (ordered) |
|-------|-------------------------------|
| `ilb_articles` | `["title", "excerpt", "body", "author_name"]` |
| `ilb_guides` | `["title", "excerpt", "body"]` |
| `ilb_events` | `["title", "excerpt", "body", "venue"]` |
| `ilb_restaurants` | `["name", "description"]` |
| `ilb_videos` | `["title", "excerpt", "description"]` |
| `ilb_classifieds` | `["title", "description"]` |
| `ilb_products` | `["name", "excerpt", "description"]` |

### 5.5 Ranking Rules (all indexes)

```json
{
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
    "published_at:desc"
  ]
}
```

Note: The last rule provides the freshness boost. For indexes using `approved_at` or `created_at` instead of `published_at`, the corresponding timestamp field is used.

---

## 6. Event-Driven Update Mapping

| Domain Event | Index | Meilisearch Operation |
|-------------|-------|----------------------|
| `ArticlePublished` | `ilb_articles` | `addDocuments` |
| `ArticleUpdated` | `ilb_articles` | `updateDocuments` |
| `ArticleUnpublished` / `ArticleDeleted` | `ilb_articles` | `deleteDocument` |
| `GuidePublished` | `ilb_guides` | `addDocuments` |
| `GuideUpdated` | `ilb_guides` | `updateDocuments` |
| `GuideUnpublished` / `GuideDeleted` | `ilb_guides` | `deleteDocument` |
| `EventPublished` | `ilb_events` | `addDocuments` |
| `EventUpdated` | `ilb_events` | `updateDocuments` |
| `EventCancelled` / `EventDeleted` | `ilb_events` | `deleteDocument` |
| `RestaurantPublished` | `ilb_restaurants` | `addDocuments` |
| `RestaurantUpdated` | `ilb_restaurants` | `updateDocuments` |
| `RestaurantDeleted` | `ilb_restaurants` | `deleteDocument` |
| `VideoPublished` | `ilb_videos` | `addDocuments` |
| `VideoUpdated` | `ilb_videos` | `updateDocuments` |
| `VideoArchived` / `VideoDeleted` | `ilb_videos` | `deleteDocument` |
| `ClassifiedApproved` | `ilb_classifieds` | `addDocuments` |
| `ClassifiedUpdated` (re-approved) | `ilb_classifieds` | `updateDocuments` |
| `ClassifiedExpired` / `ClassifiedSuspended` / `ClassifiedDeleted` | `ilb_classifieds` | `deleteDocument` |
| `ProductActivated` | `ilb_products` | `addDocuments` |
| `ProductUpdated` | `ilb_products` | `updateDocuments` |
| `ProductArchived` / `ProductDeleted` | `ilb_products` | `deleteDocument` |
| `ProductStockChanged` | `ilb_products` | `updateDocuments` (update `in_stock` field) |

---

## 7. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `ProcessSearchIndexQueue` | Continuous (worker) | Processes queued index update events. |
| `RetryFailedIndexUpdates` | Every 5 minutes | Retries failed sync tasks with retry_count < 3. |
| `CleanupSyncLog` | Daily at 05:00 UTC | Deletes completed sync log entries older than 30 days. |
| `VerifyIndexCounts` | Daily at 06:00 UTC | Compares Meilisearch document counts with PostgreSQL counts; alerts on drift > 1%. |

---

## 8. Integration Points

| System | Integration |
|--------|-------------|
| All content modules | Domain events trigger index updates |
| Meilisearch | Full-text search, autocomplete, faceted filtering |
| NestJS Event Bus | Domain event subscription for index updates |
| Admin Panel (FR-ADMIN) | Index health dashboard, rebuild triggers, sync log |
| Next.js Frontend | Search page, autocomplete component |
| Flutter Mobile | Search screen, autocomplete widget |

---

## 9. Non-Functional Constraints

- Autocomplete p95 latency < 50ms.
- Full search p95 latency < 200ms.
- Index update propagation time (event to searchable) < 5 seconds under normal load.
- Full rebuild of all 7 indexes SHALL complete within 10 minutes for a dataset of up to 500,000 total documents.
- The rebuild script SHALL not cause search downtime (zero-downtime via index swap).
- Meilisearch SHALL be configured with authentication (master key) and accessible only from the backend network; it is not directly exposed to the public internet.
- Search query logs (anonymized) SHALL be retained for 90 days for search quality analysis.
- The system SHALL gracefully degrade if Meilisearch is unavailable: the search endpoint returns a 503 error, and other platform features remain unaffected.
