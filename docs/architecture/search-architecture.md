# Search Architecture

**Platform:** ILoveBerlin (iloveberlin.biz)
**Search Engine:** Meilisearch v1.6+
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [Meilisearch Setup](#meilisearch-setup)
2. [Index Definitions](#index-definitions)
3. [Ranking Rules](#ranking-rules)
4. [Filterable and Sortable Attributes](#filterable-and-sortable-attributes)
5. [Synonym Configuration](#synonym-configuration)
6. [Stop Words](#stop-words)
7. [Indexing Pipeline](#indexing-pipeline)
8. [Autocomplete Implementation](#autocomplete-implementation)
9. [Search API Design](#search-api-design)
10. [Performance Considerations](#performance-considerations)

---

## Meilisearch Setup

### Deployment Configuration

```
Meilisearch Instance:
├── Version:        v1.6+
├── Container:      getmeili/meilisearch:v1.6
├── Internal Port:  7700
├── Environment:    production
├── Master Key:     Stored in .env (64+ character random string)
├── Data Directory: /meili_data (Docker volume)
├── Max Indexing Memory: 1024 MB (production), 256 MB (staging)
├── Max Indexing Threads: 2 (of 4 available CPUs)
└── Log Level:      INFO
```

### API Key Structure

```
Key Hierarchy:
│
├── Master Key (never exposed to clients)
│   └── Used only for admin operations and key management
│
├── Admin API Key (backend only)
│   ├── Permissions: *, documents.*, indexes.*, settings.*, tasks.*
│   ├── Used by: NestJS indexing service
│   └── Stored in: Backend .env file
│
├── Search API Key (frontend-safe)
│   ├── Permissions: search
│   ├── Indexes: ["articles", "events", "guides", "dining", "videos", "classifieds", "products"]
│   ├── Used by: Autocomplete (client-side, if direct search needed)
│   └── Stored in: NEXT_PUBLIC env var (safe to expose)
│
└── Key Rotation: Quarterly, coordinated with deployments
```

---

## Index Definitions

### Overview of All Indexes

| Index           | Primary Key | Document Count (est.) | Update Frequency    |
| --------------- | ----------- | --------------------- | ------------------- |
| `articles`      | id          | ~2,000                | On publish/update   |
| `events`        | id          | ~5,000                | On approve/update   |
| `guides`        | id          | ~200                  | On publish/update   |
| `dining`        | id          | ~1,500                | On create/update    |
| `videos`        | id          | ~500                  | On publish/update   |
| `classifieds`   | id          | ~10,000               | On create/update    |
| `products`      | id          | ~300                  | On create/update    |

### Index 1: Articles

```
Index: articles
Primary Key: id

Document Schema:
{
  "id":              "uuid",           // Primary key
  "title":           "string",         // Searchable (weight: highest)
  "slug":            "string",         // For URL construction
  "excerpt":         "string",         // Searchable (weight: high)
  "content":         "string",         // Searchable (weight: medium), HTML stripped
  "category":        "string",         // Filterable
  "categorySlug":    "string",         // For URL construction
  "tags":            ["string"],       // Filterable, searchable
  "authorName":      "string",         // Searchable, filterable
  "authorId":        "uuid",           // Filterable
  "featuredImageUrl":"string",         // Display only
  "publishedAt":     1709251200,       // Unix timestamp, sortable
  "readTimeMinutes": 5,               // Display only
  "viewCount":       1234,            // Sortable (popularity)
  "status":          "published",      // Filterable (only published indexed)
  "type":            "article"         // For multi-index identification
}
```

### Index 2: Events

```
Index: events
Primary Key: id

Document Schema:
{
  "id":              "uuid",
  "title":           "string",         // Searchable (highest)
  "slug":            "string",
  "description":     "string",         // Searchable (high)
  "category":        "string",         // Filterable
  "categorySlug":    "string",
  "venue":           "string",         // Searchable (medium)
  "address":         "string",         // Searchable (medium)
  "neighborhood":    "string",         // Filterable
  "startDate":       1709251200,       // Unix timestamp, sortable, filterable
  "endDate":         1709337600,       // Unix timestamp, filterable
  "isRecurring":     false,            // Filterable
  "isFree":          true,             // Filterable
  "priceRange":      "0-20",           // Filterable
  "imageUrl":        "string",
  "ticketUrl":       "string",
  "submitterName":   "string",
  "type":            "event"
}
```

### Index 3: Guides

```
Index: guides
Primary Key: id

Document Schema:
{
  "id":              "uuid",
  "title":           "string",         // Searchable (highest)
  "slug":            "string",
  "description":     "string",         // Searchable (high)
  "content":         "string",         // Searchable (medium), stripped
  "category":        "string",         // Filterable (food, nightlife, culture, etc.)
  "neighborhood":    "string",         // Filterable
  "tags":            ["string"],       // Filterable, searchable
  "imageUrl":        "string",
  "poiCount":        12,               // Number of points of interest
  "publishedAt":     1709251200,       // Sortable
  "updatedAt":       1709337600,       // Sortable
  "type":            "guide"
}
```

### Index 4: Dining

```
Index: dining
Primary Key: id

Document Schema:
{
  "id":              "uuid",
  "name":            "string",         // Searchable (highest)
  "slug":            "string",
  "description":     "string",         // Searchable (high)
  "cuisines":        ["string"],       // Filterable, searchable
  "priceLevel":      2,               // 1-4 (EUR signs), filterable
  "neighborhood":    "string",         // Filterable
  "address":         "string",         // Searchable (medium)
  "averageRating":   4.2,             // Sortable, filterable (min rating)
  "reviewCount":     48,              // Sortable
  "features":        ["string"],       // Filterable (outdoor, vegan, etc.)
  "imageUrl":        "string",
  "isOpen":          true,             // Filterable
  "latitude":        52.5200,          // For geo-based features
  "longitude":       13.4050,
  "type":            "dining"
}
```

### Index 5: Videos

```
Index: videos
Primary Key: id

Document Schema:
{
  "id":              "uuid",
  "title":           "string",         // Searchable (highest)
  "slug":            "string",
  "description":     "string",         // Searchable (high)
  "category":        "string",         // Filterable
  "tags":            ["string"],       // Filterable, searchable
  "duration":        "12:34",          // Display only
  "durationSeconds": 754,             // Sortable
  "thumbnailUrl":    "string",
  "publishedAt":     1709251200,       // Sortable
  "viewCount":       5678,            // Sortable
  "type":            "video"
}
```

### Index 6: Classifieds

```
Index: classifieds
Primary Key: id

Document Schema:
{
  "id":              "uuid",
  "title":           "string",         // Searchable (highest)
  "description":     "string",         // Searchable (high)
  "category":        "string",         // Filterable (housing, jobs, services, items)
  "subcategory":     "string",         // Filterable
  "price":           150.00,           // Sortable, filterable (range)
  "currency":        "EUR",            // Filterable
  "neighborhood":    "string",         // Filterable
  "condition":       "string",         // Filterable (new, used, etc.)
  "imageUrl":        "string",
  "postedAt":        1709251200,       // Sortable
  "expiresAt":       1711929600,       // For cleanup
  "status":          "active",         // Filterable (only active indexed)
  "type":            "classified"
}
```

### Index 7: Products

```
Index: products
Primary Key: id

Document Schema:
{
  "id":              "uuid",
  "name":            "string",         // Searchable (highest)
  "slug":            "string",
  "description":     "string",         // Searchable (high)
  "category":        "string",         // Filterable
  "tags":            ["string"],       // Filterable, searchable
  "price":           29.99,            // Sortable, filterable (range)
  "currency":        "EUR",
  "inStock":         true,             // Filterable
  "imageUrl":        "string",
  "variantCount":    3,
  "createdAt":       1709251200,       // Sortable
  "type":            "product"
}
```

---

## Ranking Rules

### Default Ranking Rules (Applied to All Indexes)

```
Ranking Rule Order (top = highest priority):
│
├── 1. words         # Documents with more matching words rank higher
├── 2. typo          # Documents with fewer typos rank higher
├── 3. proximity     # Documents where matched words are closer together rank higher
├── 4. attribute     # Documents that match in higher-weighted attributes rank higher
├── 5. sort          # User-specified sort order (when sort parameter used)
├── 6. exactness     # Documents with exact matches rank higher
└── 7. custom        # Per-index custom ranking rules (see below)
```

### Per-Index Custom Ranking Rules

| Index         | Custom Rules (appended after default)                     |
| ------------- | --------------------------------------------------------- |
| `articles`    | `publishedAt:desc`, `viewCount:desc`                      |
| `events`      | `startDate:asc` (upcoming first)                          |
| `guides`      | `updatedAt:desc`                                          |
| `dining`      | `averageRating:desc`, `reviewCount:desc`                  |
| `videos`      | `publishedAt:desc`, `viewCount:desc`                      |
| `classifieds` | `postedAt:desc`                                           |
| `products`    | `createdAt:desc`                                          |

### Searchable Attributes (Priority Order)

Each index defines the priority order for attribute searching:

```
Articles:   ["title", "tags", "excerpt", "content", "authorName"]
Events:     ["title", "description", "venue", "address"]
Guides:     ["title", "tags", "description", "content"]
Dining:     ["name", "cuisines", "description", "address"]
Videos:     ["title", "tags", "description"]
Classifieds:["title", "description"]
Products:   ["name", "tags", "description"]
```

---

## Filterable and Sortable Attributes

### Filterable Attributes

| Index         | Filterable Attributes                                                    |
| ------------- | ------------------------------------------------------------------------ |
| `articles`    | `category`, `tags`, `authorId`, `authorName`, `status`, `publishedAt`    |
| `events`      | `category`, `neighborhood`, `startDate`, `endDate`, `isRecurring`, `isFree`, `priceRange` |
| `guides`      | `category`, `neighborhood`, `tags`                                       |
| `dining`      | `cuisines`, `priceLevel`, `neighborhood`, `averageRating`, `features`, `isOpen` |
| `videos`      | `category`, `tags`                                                       |
| `classifieds` | `category`, `subcategory`, `neighborhood`, `condition`, `price`, `status` |
| `products`    | `category`, `tags`, `price`, `inStock`                                   |

### Sortable Attributes

| Index         | Sortable Attributes                              |
| ------------- | ------------------------------------------------ |
| `articles`    | `publishedAt`, `viewCount`                       |
| `events`      | `startDate`                                      |
| `guides`      | `publishedAt`, `updatedAt`                       |
| `dining`      | `averageRating`, `reviewCount`, `name`            |
| `videos`      | `publishedAt`, `viewCount`, `durationSeconds`     |
| `classifieds` | `postedAt`, `price`                              |
| `products`    | `price`, `createdAt`                             |

### Filter Query Examples

```
Meilisearch Filter Syntax:

# Events this weekend in Kreuzberg
filter: "startDate >= 1709337600 AND startDate <= 1709510400 AND neighborhood = 'Kreuzberg'"

# Italian restaurants in Mitte with rating >= 4
filter: "cuisines = 'Italian' AND neighborhood = 'Mitte' AND averageRating >= 4"

# Active classifieds under 100 EUR in housing category
filter: "category = 'housing' AND price <= 100 AND status = 'active'"

# Free events that are not recurring
filter: "isFree = true AND isRecurring = false"

# Products in stock under 50 EUR
filter: "inStock = true AND price <= 50"

# Vegan-friendly dining options
filter: "features = 'vegan'"
```

---

## Synonym Configuration

### Global Synonyms (Applied to All Indexes)

```json
{
  "berlin": ["bln"],
  "kreuzberg": ["xberg", "x-berg"],
  "friedrichshain": ["fhain", "f-hain"],
  "prenzlauer berg": ["p-berg", "pberg", "prenzlberg"],
  "schoeneberg": ["schöneberg"],
  "neukoelln": ["neukölln"],
  "charlottenburg": ["charlbg"],

  "restaurant": ["restaurants", "eatery", "eateries", "gaststätte"],
  "cafe": ["café", "coffee shop", "kaffehaus"],
  "bar": ["pub", "kneipe"],
  "club": ["nightclub", "disco"],

  "apartment": ["flat", "wohnung", "apt"],
  "room": ["zimmer", "wg-zimmer"],
  "sublet": ["untermiete", "zwischenmiete"],
  "job": ["jobs", "stelle", "arbeit", "employment"],

  "free": ["kostenlos", "gratis", "umsonst"],
  "cheap": ["affordable", "budget", "günstig"],
  "vegan": ["plant-based", "pflanzlich"],
  "vegetarian": ["veggie"],
  "organic": ["bio"],

  "exhibition": ["ausstellung", "exhibit"],
  "concert": ["gig", "live music", "konzert"],
  "market": ["markt", "flea market", "flohmarkt"],
  "festival": ["fest"],
  "workshop": ["class", "kurs"],
  "tour": ["walking tour", "stadtführung"],

  "secondhand": ["second hand", "used", "gebraucht"],
  "vintage": ["retro"],

  "brunch": ["breakfast", "frühstück"],
  "dinner": ["abendessen", "supper"],
  "lunch": ["mittagessen"],

  "bike": ["bicycle", "fahrrad"],
  "transport": ["bvg", "public transit", "öpnv", "ubahn", "sbahn"]
}
```

---

## Stop Words

### Stop Word Lists

```
German Stop Words:
["aber", "alle", "allem", "allen", "aller", "allerdings", "alles", "also",
 "andere", "anderem", "anderen", "anderer", "anderes", "anderm", "andern",
 "anders", "auch", "auf", "aus", "bei", "beim", "bereits", "bin", "bis",
 "bist", "da", "dabei", "dadurch", "dafür", "dagegen", "daher", "dahin",
 "damals", "damit", "danach", "daneben", "dann", "daran", "darauf",
 "daraus", "darf", "darfst", "darin", "darum", "darunter", "das", "dass",
 "davon", "davor", "dazu", "dein", "deine", "deinem", "deinen", "deiner",
 "dem", "den", "denn", "dennoch", "der", "deren", "des", "deshalb",
 "dessen", "die", "dies", "diese", "dieselbe", "dieselben", "diesem",
 "diesen", "dieser", "dieses", "doch", "dort", "drei", "du", "dumm",
 "durch", "ein", "eine", "einem", "einen", "einer", "einige", "einigem",
 "einigen", "einiger", "einiges", "einmal", "er", "erst", "es", "etwas",
 "euch", "euer", "eure", "eurem", "euren", "eurer"]

English Stop Words:
["a", "an", "and", "are", "as", "at", "be", "but", "by", "do", "for",
 "from", "had", "has", "have", "he", "her", "him", "his", "how", "i",
 "if", "in", "into", "is", "it", "its", "just", "me", "my", "no",
 "nor", "not", "of", "on", "or", "our", "out", "own", "say", "she",
 "so", "some", "than", "that", "the", "their", "them", "then", "there",
 "these", "they", "this", "to", "too", "us", "very", "was", "we",
 "were", "what", "when", "where", "which", "while", "who", "whom",
 "why", "will", "with", "would", "you", "your"]
```

### Typo Tolerance Configuration

```
Typo Tolerance Settings:
├── Enabled:          true
├── Min Word Size for 1 Typo:  4 characters
├── Min Word Size for 2 Typos: 8 characters
├── Disable on Words:  ["uuid", "isbn", "sku"] (exact match needed)
└── Disable on Attributes: ["slug", "id"] (identifiers should be exact)
```

---

## Indexing Pipeline

### PostgreSQL to Meilisearch Sync

```
INDEXING PIPELINE ARCHITECTURE

+------------------+       +------------------+       +------------------+
|   PostgreSQL     |       |  NestJS Indexing  |       |   Meilisearch    |
|                  |       |  Service          |       |                  |
|  Source of Truth |------>|  Transform &      |------>|  Search Index    |
|                  |       |  Sync             |       |                  |
+------------------+       +------------------+       +------------------+

Sync Strategies:
├── 1. Real-time sync (on content change)
├── 2. Full reindex (scheduled)
└── 3. Manual reindex (admin triggered)
```

### Real-Time Sync Flow

```
Content Change               Event Bus                Indexing Service           Meilisearch
     |                          |                          |                        |
     |  Entity saved            |                          |                        |
     |  (create/update/delete)  |                          |                        |
     |                          |                          |                        |
     |  TypeORM Subscriber      |                          |                        |
     |  detects change          |                          |                        |
     |                          |                          |                        |
     |  Emit event:             |                          |                        |
     |  '{entity}.{action}'     |                          |                        |
     |------------------------->|                          |                        |
     |                          |  Route to handler        |                        |
     |                          |------------------------->|                        |
     |                          |                          |                        |
     |                          |                          |  Determine action:     |
     |                          |                          |                        |
     |                          |                          |  [CREATE/UPDATE]       |
     |                          |                          |  - Transform entity    |
     |                          |                          |    to search doc       |
     |                          |                          |  - Strip HTML from     |
     |                          |                          |    content fields      |
     |                          |                          |  - Add 'type' field    |
     |                          |                          |  - PUT /indexes/       |
     |                          |                          |    {type}/documents    |
     |                          |                          |----------------------->|
     |                          |                          |                        |
     |                          |                          |  [DELETE/UNPUBLISH]    |
     |                          |                          |  - DELETE /indexes/    |
     |                          |                          |    {type}/documents/   |
     |                          |                          |    {id}                |
     |                          |                          |----------------------->|
     |                          |                          |                        |
     |                          |                          |  Log sync result       |
     |                          |                          |  (success/failure,     |
     |                          |                          |   taskUid, duration)   |
```

### Full Reindex Process

```
Full Reindex (Scheduled: Daily at 3:00 AM CET)
│
├── Triggered by: NestJS @Cron('0 3 * * *') or manual admin API call
│
├── Process (per content type):
│   │
│   │  For each type in [articles, events, guides, dining, videos, classifieds, products]:
│   │
│   ├── 1. Create temporary index: {type}_tmp
│   │
│   ├── 2. Configure settings on temp index:
│   │   ├── searchableAttributes
│   │   ├── filterableAttributes
│   │   ├── sortableAttributes
│   │   ├── rankingRules
│   │   ├── synonyms
│   │   ├── stopWords
│   │   └── typoTolerance
│   │
│   ├── 3. Fetch all published records from PostgreSQL
│   │   └── Paginated: 1000 records per batch
│   │
│   ├── 4. For each batch:
│   │   ├── Transform entities to search documents
│   │   ├── Strip HTML from content fields
│   │   ├── Add type identifier
│   │   └── POST /indexes/{type}_tmp/documents (bulk upsert)
│   │
│   ├── 5. Wait for all indexing tasks to complete
│   │   └── Poll GET /tasks?indexUids={type}_tmp until all succeeded
│   │
│   ├── 6. Swap indexes atomically:
│   │   └── POST /swap-indexes [{indexA: "{type}", indexB: "{type}_tmp"}]
│   │
│   ├── 7. Delete old temporary index:
│   │   └── DELETE /indexes/{type}_tmp
│   │
│   └── 8. Log completion:
│       └── Total documents, duration, errors
│
├── On Failure:
│   ├── Log error with full context
│   ├── Send alert notification
│   ├── Temp index is not swapped (production index unchanged)
│   └── Retry on next scheduled run
│
└── Metrics Logged:
    ├── Total documents indexed per type
    ├── Total time elapsed
    ├── Batches processed
    └── Errors encountered
```

---

## Autocomplete Implementation

### Architecture

```
User Typing                  Frontend                   NestJS API              Meilisearch
     |                          |                          |                        |
     |  Keystroke: "ber"        |                          |                        |
     |------------------------->|                          |                        |
     |                          |                          |                        |
     |                          |  Debounce 200ms          |                        |
     |                          |  (skip if < 2 chars)     |                        |
     |                          |                          |                        |
     |  Keystroke: "berl"       |                          |                        |
     |------------------------->|                          |                        |
     |                          |                          |                        |
     |                          |  Debounce resets         |                        |
     |                          |                          |                        |
     |  (200ms passes)          |                          |                        |
     |                          |                          |                        |
     |                          |  GET /search/suggest     |                        |
     |                          |  ?q=berl&limit=5         |                        |
     |                          |------------------------->|                        |
     |                          |                          |                        |
     |                          |                          |  Multi-index search    |
     |                          |                          |  (all 7 indexes)       |
     |                          |                          |  limit: 2 per index    |
     |                          |                          |  attributesToRetrieve: |
     |                          |                          |    [title/name, slug,  |
     |                          |                          |     type, imageUrl]    |
     |                          |                          |----------------------->|
     |                          |                          |<--- results -----------|
     |                          |                          |                        |
     |                          |                          |  Aggregate & format:   |
     |                          |                          |  - Group by type       |
     |                          |                          |  - Max 8 total results |
     |                          |                          |  - Include type labels |
     |                          |                          |                        |
     |                          |<--- suggestions ---------|                        |
     |                          |                          |                        |
     |  Show dropdown:          |                          |                        |
     |  ┌─────────────────────┐ |                          |                        |
     |  │ Articles            │ |                          |                        |
     |  │  Berlin Wall History│ |                          |                        |
     |  │  Berlin Brunch Guide│ |                          |                        |
     |  │ Events              │ |                          |                        |
     |  │  Berlin Marathon    │ |                          |                        |
     |  │ Dining              │ |                          |                        |
     |  │  Berlin Burger Co   │ |                          |                        |
     |  │                     │ |                          |                        |
     |  │ Search for "berl" →│ |                          |                        |
     |  └─────────────────────┘ |                          |                        |
     |                          |                          |                        |
```

### Autocomplete Response Format

```json
{
  "query": "berl",
  "suggestions": [
    {
      "type": "article",
      "typeLabel": "Articles",
      "items": [
        {
          "title": "Berlin Wall History: A Complete Guide",
          "slug": "berlin-wall-history-complete-guide",
          "imageUrl": "https://cdn.iloveberlin.biz/media/articles/wall-thumb.webp",
          "url": "/articles/berlin-wall-history-complete-guide"
        },
        {
          "title": "Berlin Brunch Guide 2026",
          "slug": "berlin-brunch-guide-2026",
          "imageUrl": "https://cdn.iloveberlin.biz/media/articles/brunch-thumb.webp",
          "url": "/articles/berlin-brunch-guide-2026"
        }
      ]
    },
    {
      "type": "event",
      "typeLabel": "Events",
      "items": [
        {
          "title": "Berlin Marathon 2026",
          "slug": "berlin-marathon-2026",
          "imageUrl": "https://cdn.iloveberlin.biz/media/events/marathon-thumb.webp",
          "url": "/events/berlin-marathon-2026"
        }
      ]
    },
    {
      "type": "dining",
      "typeLabel": "Restaurants",
      "items": [
        {
          "title": "Berlin Burger Company",
          "slug": "berlin-burger-company",
          "imageUrl": "https://cdn.iloveberlin.biz/media/dining/bbc-thumb.webp",
          "url": "/dining/berlin-burger-company"
        }
      ]
    }
  ],
  "totalResults": 47,
  "searchUrl": "/search?q=berl"
}
```

### Client-Side Autocomplete Behavior

```
Autocomplete Configuration:
├── Minimum query length:    2 characters
├── Debounce delay:          200ms
├── Maximum suggestions:     8 items (across all types)
├── Per-type limit:          2 items
├── Highlight matches:       Bold matched text in suggestions
├── Keyboard navigation:     Arrow keys to navigate, Enter to select
├── Click outside:           Close dropdown
├── Escape key:              Close dropdown
├── Empty state:             "No results found for '{query}'"
├── Loading state:           Skeleton items while fetching
└── "See all results" link:  Navigate to /search?q={query}
```

---

## Search API Design

### Search Endpoint

```
GET /api/v1/search

Query Parameters:
├── q          (required)  Search query string
├── type       (optional)  Content type filter: article|event|guide|dining|video|classified|product
├── category   (optional)  Category filter (depends on type)
├── neighborhood (optional) Berlin neighborhood filter
├── dateFrom   (optional)  Start date filter (ISO 8601, events only)
├── dateTo     (optional)  End date filter (ISO 8601, events only)
├── priceMin   (optional)  Minimum price (dining, classifieds, products)
├── priceMax   (optional)  Maximum price
├── sort       (optional)  Sort field: relevance|date|rating|price
├── order      (optional)  Sort order: asc|desc (default: desc)
├── limit      (optional)  Results per page (default: 20, max: 50)
├── offset     (optional)  Pagination offset (default: 0)
└── facets     (optional)  Request facet counts: type|category|neighborhood
```

### Search Response Format

```json
{
  "success": true,
  "data": {
    "query": "berlin brunch",
    "results": [
      {
        "id": "uuid",
        "type": "article",
        "title": "Best <em>Brunch</em> Spots in <em>Berlin</em>",
        "excerpt": "Discover the top 15 <em>brunch</em> locations across <em>Berlin</em>...",
        "url": "/articles/best-brunch-spots-berlin",
        "imageUrl": "https://cdn.iloveberlin.biz/media/articles/brunch-sm.webp",
        "meta": {
          "author": "Anna Schmidt",
          "publishedAt": "2026-03-01T10:00:00Z",
          "category": "Food & Drink"
        }
      }
    ],
    "facets": {
      "type": {
        "article": 12,
        "dining": 8,
        "event": 3,
        "guide": 2
      },
      "category": {
        "Food & Drink": 15,
        "Lifestyle": 5,
        "Culture": 3
      }
    },
    "pagination": {
      "total": 25,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    },
    "processingTimeMs": 12
  }
}
```

---

## Performance Considerations

### Performance Targets

| Metric                     | Target      | Actual (measured) |
| -------------------------- | ----------- | ----------------- |
| Autocomplete response time | < 50ms      | ~15-30ms          |
| Full search response time  | < 100ms     | ~30-70ms          |
| Indexing (single document) | < 200ms     | ~50-100ms         |
| Full reindex (all types)   | < 5 minutes | ~2-3 minutes      |
| Memory usage (idle)        | < 500 MB    | ~300 MB           |
| Memory usage (reindexing)  | < 1.5 GB    | ~800 MB           |

### Optimization Strategies

```
Performance Optimizations:
│
├── Index Design:
│   ├── Strip HTML from content before indexing (smaller documents)
│   ├── Only index published/active content (smaller index size)
│   ├── Use Unix timestamps (faster numeric comparison than date strings)
│   └── Limit searchable attributes to essential fields
│
├── Query Optimization:
│   ├── Use attributesToRetrieve to limit response size
│   ├── Use attributesToHighlight for search result display
│   ├── Use attributesToCrop for excerpt generation
│   ├── Limit per-index results in multi-search
│   └── Cache popular queries in Redis (5-minute TTL)
│
├── Indexing Optimization:
│   ├── Batch upserts (1000 documents per batch)
│   ├── Atomic index swap for full reindex (zero downtime)
│   ├── Limit indexing threads to avoid CPU contention
│   └── Schedule full reindex during low-traffic hours (3 AM)
│
└── Infrastructure:
    ├── Meilisearch data on NVMe SSD (fast random reads)
    ├── Dedicated memory allocation (1 GB limit)
    ├── Docker resource limits to prevent OOM
    └── Health monitoring via Prometheus metrics
```
