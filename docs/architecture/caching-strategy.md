# Caching Strategy

**Platform:** ILoveBerlin (iloveberlin.biz)
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [Caching Layers Overview](#caching-layers-overview)
2. [CDN Cache Rules per Content Type](#cdn-cache-rules-per-content-type)
3. [API Response Cache Headers](#api-response-cache-headers)
4. [Redis Caching Layer](#redis-caching-layer)
5. [ISR Revalidation Intervals](#isr-revalidation-intervals)
6. [Browser Cache Policy](#browser-cache-policy)
7. [Cache Invalidation Strategy](#cache-invalidation-strategy)
8. [Cache Monitoring](#cache-monitoring)

---

## Caching Layers Overview

The ILoveBerlin platform implements caching at five distinct layers, each serving a specific purpose and optimized for different content types.

```
USER REQUEST FLOW THROUGH CACHE LAYERS

User (Browser/App)
│
├── Layer 1: BROWSER CACHE
│   ├── Service Worker (PWA, if applicable)
│   ├── HTTP Cache (disk/memory)
│   │   ├── HIT -> Serve from local cache (instant)
│   │   └── MISS -> Continue to network
│   └── Check: Cache-Control, ETag, Last-Modified
│
├── Layer 2: CLOUDFLARE CDN CACHE
│   ├── Edge server (nearest PoP to user)
│   │   ├── HIT -> Return cached response (< 30ms)
│   │   └── MISS -> Forward to origin
│   └── Check: URL + Cache-Control + Page Rules
│
├── Layer 3: NGINX PROXY CACHE (optional, limited use)
│   ├── Reverse proxy cache for static assets
│   │   ├── HIT -> Return cached response
│   │   └── MISS -> Forward to upstream
│   └── Check: proxy_cache directives
│
├── Layer 4: APPLICATION CACHE (Redis)
│   ├── NestJS CacheInterceptor
│   │   ├── HIT -> Return cached JSON (< 5ms)
│   │   └── MISS -> Execute controller logic
│   └── Check: Redis key based on URL + params + user role
│
├── Layer 5: NEXT.js ISR CACHE
│   ├── Pre-rendered HTML pages
│   │   ├── FRESH -> Serve cached page
│   │   ├── STALE -> Serve cached, revalidate in background
│   │   └── MISS -> SSR the page, cache result
│   └── Check: Revalidation interval per page
│
└── ORIGIN (Database)
    └── PostgreSQL query execution
```

### Cache Layer Effectiveness

```
Expected Cache Hit Rates (production, steady state):

Layer 1 (Browser):     ~40% of total requests never leave the browser
Layer 2 (CDN):         ~70% of remaining requests served from CDN edge
Layer 3 (Nginx):       ~5% additional hits for static assets
Layer 4 (Redis):       ~60% of API requests served from Redis
Layer 5 (ISR):         ~90% of page requests served from ISR cache

Net effect: Only ~5-10% of user-facing requests hit PostgreSQL directly
```

---

## CDN Cache Rules per Content Type

### Cloudflare Cache Configuration

| Content Category     | URL Pattern                    | Edge TTL     | Browser TTL  | Cache Level      |
| -------------------- | ------------------------------ | ------------ | ------------ | ---------------- |
| Static JS bundles    | `/_next/static/*`              | 1 year       | 1 year       | Cache Everything |
| Static CSS           | `/_next/static/css/*`          | 1 year       | 1 year       | Cache Everything |
| Next.js images       | `/_next/image*`                | 1 hour       | 1 hour       | Cache Everything |
| Media (R2)           | `cdn.iloveberlin.biz/media/*`  | 30 days      | 30 days      | Cache Everything |
| Fonts                | `*.woff2`, `*.woff`            | 1 year       | 1 year       | Cache Everything |
| Favicon/icons        | `/favicon.ico`, `/icons/*`     | 30 days      | 30 days      | Cache Everything |
| HTML pages           | `/*` (text/html)               | Origin       | Origin       | Standard         |
| API responses        | `/api/*`                       | Bypass       | N/A          | Bypass           |
| Admin panel          | `/admin/*`                     | Bypass       | N/A          | Bypass           |
| Auth pages           | `/auth/*`                      | Bypass       | N/A          | Bypass           |
| Account pages        | `/account/*`                   | Bypass       | N/A          | Bypass           |
| Search               | `/search*`                     | Bypass       | N/A          | Bypass           |
| Sitemap              | `/sitemap.xml`                 | 1 hour       | 1 hour       | Cache Everything |
| robots.txt           | `/robots.txt`                  | 1 day        | 1 day        | Cache Everything |

### Cache Key Configuration

```
Cloudflare Cache Key:
├── Default:     Scheme + Host + Path + Query String
├── Exclusions:  UTM parameters stripped from cache key
│                (utm_source, utm_medium, utm_campaign, etc.)
├── Headers:     Not included in cache key (same page for all users)
└── Cookies:     Not included in cache key (personalization handled client-side)
```

---

## API Response Cache Headers

### NestJS Response Headers by Endpoint

```
API Cache Header Strategy:
│
├── PUBLIC content endpoints (read-only, no auth required):
│   │
│   ├── GET /api/v1/articles
│   │   Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
│   │   Vary: Accept-Encoding
│   │   ETag: "hash-of-response-body"
│   │
│   ├── GET /api/v1/articles/:slug
│   │   Cache-Control: public, max-age=120, s-maxage=600, stale-while-revalidate=1200
│   │   Vary: Accept-Encoding
│   │   ETag: "hash-of-response-body"
│   │
│   ├── GET /api/v1/events
│   │   Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
│   │
│   ├── GET /api/v1/dining
│   │   Cache-Control: public, max-age=120, s-maxage=900, stale-while-revalidate=1800
│   │
│   ├── GET /api/v1/guides
│   │   Cache-Control: public, max-age=300, s-maxage=1800, stale-while-revalidate=3600
│   │
│   └── GET /api/v1/store/products
│       Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
│
├── AUTHENTICATED endpoints (user-specific):
│   │
│   ├── GET /api/v1/users/me
│   │   Cache-Control: private, no-cache
│   │
│   ├── GET /api/v1/cart
│   │   Cache-Control: private, no-store
│   │
│   ├── GET /api/v1/account/*
│   │   Cache-Control: private, no-cache
│   │
│   └── GET /api/v1/admin/*
│       Cache-Control: private, no-store
│
├── MUTATION endpoints (POST, PUT, PATCH, DELETE):
│   │
│   └── All mutations:
│       Cache-Control: no-store
│
└── SEARCH endpoint:
    │
    └── GET /api/v1/search
        Cache-Control: public, max-age=30, s-maxage=60, stale-while-revalidate=120
        Vary: Accept-Encoding
```

### Header Explanation

```
Cache-Control Directives Used:
│
├── public:                 Response can be cached by any cache (CDN, browser)
├── private:                Response can only be cached by the user's browser
├── max-age=N:              Browser cache TTL in seconds
├── s-maxage=N:             CDN/proxy cache TTL in seconds (overrides max-age for proxies)
├── stale-while-revalidate=N: Serve stale content while revalidating in background
├── no-cache:               Always revalidate with origin (may use ETag/Last-Modified)
├── no-store:               Never cache (sensitive data, mutations)
└── immutable:              Content will never change (hashed static assets)

Additional Headers:
├── ETag:                   Hash of response body for conditional requests
├── Vary: Accept-Encoding:  Cache separately for gzip vs brotli clients
└── X-Cache-TTL:            Custom header indicating Redis cache TTL (debugging)
```

---

## Redis Caching Layer

### Redis Cache Architecture

```
Redis Cache Instance:
├── Host:           redis (Docker service)
├── Port:           6379
├── Max Memory:     512 MB (production)
├── Eviction Policy: allkeys-lru (Least Recently Used)
├── Persistence:    AOF (appendonly yes)
└── Key Prefix:     ilb: (namespace prefix)
```

### Cached Data Categories

#### Homepage Data

```
Key:    ilb:cache:homepage
TTL:    300 seconds (5 minutes)
Size:   ~50 KB
Content: {
  "featuredArticles":  [...top 5 articles],
  "latestArticles":    [...10 most recent],
  "upcomingEvents":    [...next 8 events],
  "trending":          [...trending content across all types],
  "activeCompetitions":[...active competitions],
  "featuredDining":    [...featured restaurants]
}
Invalidation: On article publish, event approve, competition create
```

#### Trending Content

```
Key:    ilb:cache:trending
TTL:    600 seconds (10 minutes)
Size:   ~20 KB
Content: {
  "articles":    [...top 5 by views in last 7 days],
  "events":      [...top 5 by views in last 7 days],
  "dining":      [...top 5 by reviews in last 30 days],
  "videos":      [...top 5 by views in last 7 days]
}
Computed: Aggregation query on view/interaction counts
Invalidation: TTL-based only (expensive to compute, acceptable staleness)
```

#### Popular Search Queries

```
Key:    ilb:cache:search:popular
TTL:    3600 seconds (1 hour)
Size:   ~5 KB
Content: [...top 20 search queries by frequency]
Source:  Aggregated from search analytics
Invalidation: TTL-based only
```

#### Individual Search Query Cache

```
Key:    ilb:cache:search:q:{hash}
Hash:   SHA256 of (query + filters + sort + page)
TTL:    60 seconds (1 minute)
Size:   ~10-50 KB
Content: Full search response (results + facets + pagination)
Invalidation: TTL-based (short TTL acceptable for search freshness)
```

#### Content Listing Caches

```
Key Pattern:  ilb:cache:{type}:list:{hash}
Hash:         SHA256 of (filters + sort + page)
TTL:          Varies by type (see table below)
Content:      Paginated listing response

Type-specific TTLs:
├── articles:     300s  (5 min)   - Frequent updates
├── events:       300s  (5 min)   - Time-sensitive
├── guides:       1800s (30 min)  - Stable content
├── dining:       900s  (15 min)  - Moderate updates
├── videos:       900s  (15 min)  - Infrequent updates
├── classifieds:  300s  (5 min)   - Frequent new listings
└── products:     300s  (5 min)   - Stock changes
```

#### Content Detail Caches

```
Key Pattern:  ilb:cache:{type}:detail:{id}
TTL:          Varies by type (see table below)
Content:      Full entity with relations (author, media, categories)

Type-specific TTLs:
├── articles:     600s  (10 min)
├── events:       300s  (5 min)
├── guides:       1800s (30 min)
├── dining:       900s  (15 min)
├── videos:       900s  (15 min)
├── classifieds:  300s  (5 min)
└── products:     600s  (10 min)
```

#### Session and Auth Caches

```
Key:    ilb:auth:refresh:{tokenHash}
TTL:    604800 seconds (7 days, matches refresh token expiry)
Content: { userId, tokenVersion }
Purpose: Validate refresh tokens, enable revocation

Key:    ilb:auth:blacklist:{tokenJti}
TTL:    900 seconds (15 minutes, matches access token expiry)
Content: "1" (exists = blacklisted)
Purpose: Immediate token revocation (logout)

Key:    ilb:throttle:{ip}:{endpoint}
TTL:    60 seconds
Content: Request count (INCR)
Purpose: Rate limiting per endpoint
```

#### Navigation/Configuration Caches

```
Key:    ilb:cache:categories:{type}
TTL:    3600 seconds (1 hour)
Content: List of categories for a content type
Size:   ~2 KB

Key:    ilb:cache:neighborhoods
TTL:    86400 seconds (24 hours)
Content: List of Berlin neighborhoods
Size:   ~1 KB

Key:    ilb:cache:site-config
TTL:    3600 seconds (1 hour)
Content: Site-wide configuration (feature flags, etc.)
Size:   ~1 KB
```

### Redis Memory Budget

```
Redis Memory Allocation (512 MB total):

Category              Estimated Keys     Estimated Memory
──────────────────── ────────────────── ────────────────
Homepage cache        1                  50 KB
Trending cache        1                  20 KB
Popular searches      1                  5 KB
Search query cache    ~1,000             50 MB
Content listings      ~500               25 MB
Content details       ~2,000             100 MB
Auth/Session          ~5,000             25 MB
Rate limiting         ~10,000            10 MB
Navigation/Config     ~20                 50 KB
──────────────────── ────────────────── ────────────────
Total (estimated)     ~18,500            ~210 MB

Headroom for spikes:  ~300 MB
Eviction policy:      allkeys-lru (evicts least recently used when full)
```

---

## ISR Revalidation Intervals

### Next.js ISR Configuration

```
ISR (Incremental Static Regeneration) Strategy:

When a page is requested:
│
├── Page not yet built:
│   └── SSR immediately, cache the result, serve to user
│
├── Page is cached and FRESH (within revalidation interval):
│   └── Serve cached HTML instantly (no server-side work)
│
├── Page is cached but STALE (past revalidation interval):
│   ├── Serve stale cached HTML to user (instant)
│   └── Background: Re-render the page with fresh data
│       ├── Success: Replace cache with new version
│       └── Failure: Keep serving stale version (resilient)
│
└── On-demand revalidation (webhook from NestJS):
    └── Immediately invalidate and rebuild specific pages
```

### ISR Interval Table

| Page                         | Revalidation (seconds) | Reason                                    |
| ---------------------------- | ---------------------- | ----------------------------------------- |
| `/` (Homepage)               | 300 (5 min)            | Mix of content, moderate freshness needed |
| `/articles`                  | 300 (5 min)            | New articles published multiple times/day |
| `/articles/[slug]`           | 600 (10 min)           | Article content rarely changes post-publish |
| `/articles/category/[cat]`   | 300 (5 min)            | Same as article listing                   |
| `/guides`                    | 1800 (30 min)          | Guides updated infrequently               |
| `/guides/[slug]`             | 1800 (30 min)          | Guide content is long-form, stable        |
| `/events`                    | 300 (5 min)            | Events are time-sensitive                 |
| `/events/[slug]`             | 300 (5 min)            | Event details may change (venue, time)    |
| `/dining`                    | 900 (15 min)           | Restaurant data changes infrequently      |
| `/dining/[slug]`             | 900 (15 min)           | Reviews added client-side, not in ISR     |
| `/dining/neighborhood/[area]`| 900 (15 min)           | Same as dining listing                    |
| `/videos`                    | 900 (15 min)           | Videos published less frequently          |
| `/videos/[slug]`             | 900 (15 min)           | Video content is stable once published    |
| `/competitions`              | 300 (5 min)            | Time-sensitive entry deadlines            |
| `/classifieds`               | 300 (5 min)            | High volume of new listings               |
| `/classifieds/[id]`          | 300 (5 min)            | Status may change (sold, expired)         |
| `/store`                     | 300 (5 min)            | Stock levels may change                   |
| `/store/[slug]`              | 600 (10 min)           | Product details are relatively stable     |
| `/sitemap.xml`               | 3600 (1 hour)          | Sitemap doesn't need real-time freshness  |

### On-Demand Revalidation Triggers

```
On-Demand ISR Revalidation (via webhook from NestJS):

Event                          Pages Revalidated
───────────────────────────── ──────────────────────────────────────
Article published              /, /articles, /articles/{slug}, /articles/category/{cat}
Article updated                /articles/{slug}
Article deleted                /, /articles, /articles/category/{cat}
Event approved                 /, /events, /events/{slug}
Event updated                  /events/{slug}
Guide published                /guides, /guides/{slug}
Dining listing created         /dining, /dining/{slug}, /dining/neighborhood/{area}
Classified created             /classifieds, /classifieds/{id}
Classified sold/expired        /classifieds, /classifieds/{id}
Product created                /store, /store/{slug}
Product stock change           /store/{slug}
Competition created            /, /competitions, /competitions/{slug}
Competition ended              /competitions, /competitions/{slug}

Webhook Implementation:
  POST /api/revalidate
  Headers: { Authorization: Bearer {REVALIDATION_SECRET} }
  Body: { paths: ["/articles", "/articles/my-article-slug"] }
```

---

## Browser Cache Policy

### Cache-Control Headers by Asset Type

```
BROWSER CACHE MATRIX

Asset Type              Cache-Control                                Typical Size    Hit Rate
─────────────────────── ──────────────────────────────────────────── ─────────────── ─────────
JS bundles (hashed)     public, max-age=31536000, immutable         50-200 KB       ~95%
CSS (hashed)            public, max-age=31536000, immutable         10-30 KB        ~95%
Fonts (woff2)           public, max-age=31536000, immutable         15-50 KB        ~99%
Images (CDN, UUID)      public, max-age=2592000, immutable          10-500 KB       ~90%
favicon.ico             public, max-age=2592000                     5 KB            ~99%
HTML pages              no-cache (revalidate via ETag)              20-100 KB       ~50%
API JSON responses      Varies (see API section above)              1-50 KB         ~30%
Service Worker          no-cache                                    5 KB            ~0%
manifest.json           public, max-age=86400                       1 KB            ~95%
```

### ETag Strategy

```
ETag Implementation:
│
├── Static assets (JS, CSS, fonts, images):
│   └── Not needed — immutable cache means browser never revalidates
│
├── HTML pages:
│   ├── Generated by Next.js based on page content hash
│   ├── Browser sends: If-None-Match: "etag-value"
│   ├── Server responds: 304 Not Modified (if unchanged)
│   └── Saves bandwidth on repeat visits to same page
│
├── API responses (public endpoints):
│   ├── Generated from SHA256 of response body
│   ├── Enables conditional requests for stale cache
│   └── Useful when max-age is short but content hasn't changed
│
└── API responses (private endpoints):
    └── No ETag (no-cache or no-store, always fresh)
```

### Preloading Strategy

```
Resource Preloading (in <head>):
│
├── Fonts (preload, critical for FCP):
│   <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
│   <link rel="preload" href="/fonts/plus-jakarta-sans.woff2" as="font" type="font/woff2" crossorigin>
│
├── Hero image (preload, critical for LCP):
│   <link rel="preload" href="{hero-image-url}" as="image" type="image/webp">
│
├── DNS prefetch (external services):
│   <link rel="dns-prefetch" href="https://cdn.iloveberlin.biz">
│   <link rel="dns-prefetch" href="https://js.stripe.com">
│   <link rel="dns-prefetch" href="https://www.googletagmanager.com">
│
└── Preconnect (critical external origins):
    <link rel="preconnect" href="https://cdn.iloveberlin.biz" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
```

---

## Cache Invalidation Strategy

### Invalidation Matrix

```
WHEN CONTENT CHANGES, WHICH CACHES NEED INVALIDATION?

Content Change          Redis Keys              ISR Pages               CDN
                        to Invalidate           to Revalidate           Action
─────────────────────── ─────────────────────── ─────────────────────── ──────────
Article published       cache:homepage          /, /articles,           Purge URLs
                        cache:trending          /articles/{slug},
                        cache:articles:list:*   /articles/category/{cat}
                        cache:search:q:*

Article updated         cache:articles:detail:  /articles/{slug}        Purge URL
                        {id}
                        cache:articles:list:*

Article deleted         cache:homepage          /, /articles,           Purge URLs
                        cache:trending          /articles/category/{cat}
                        cache:articles:list:*
                        cache:articles:detail:
                        {id}

Event approved          cache:homepage          /, /events,             Purge URLs
                        cache:events:list:*     /events/{slug}

Dining review added     cache:dining:detail:    /dining/{slug}          No action
                        {id}                                            (ISR handles)
                        cache:trending

Product stock change    cache:products:detail:  /store/{slug}           No action
                        {id}
                        cache:products:list:*

User profile updated    No cache to invalidate  No pages to revalidate  No action
                        (private data)

Classified expired      cache:classifieds:      /classifieds,           No action
                        list:*                  /classifieds/{id}
                        cache:classifieds:
                        detail:{id}
```

### Invalidation Implementation

```
CACHE INVALIDATION FLOW

Content Service                 Cache Service               Redis           Next.js            Cloudflare
     |                               |                       |                |                   |
     |  1. Content changed           |                       |                |                   |
     |  (create/update/delete)       |                       |                |                   |
     |                               |                       |                |                   |
     |  Emit event:                  |                       |                |                   |
     |  'cache.invalidate'           |                       |                |                   |
     |  { type, action, entity }     |                       |                |                   |
     |------------------------------>|                       |                |                   |
     |                               |                       |                |                   |
     |                               |  2. Delete matching   |                |                   |
     |                               |  Redis keys           |                |                   |
     |                               |  (pattern-based)      |                |                   |
     |                               |---------------------->|                |                   |
     |                               |                       |                |                   |
     |                               |  3. Trigger ISR       |                |                   |
     |                               |  revalidation         |                |                   |
     |                               |  POST /api/revalidate |                |                   |
     |                               |  { paths: [...] }     |                |                   |
     |                               |------------------------------->|       |                   |
     |                               |                       |                |                   |
     |                               |  4. Purge CDN cache   |                |                   |
     |                               |  (if applicable)      |                |                   |
     |                               |  Cloudflare API:      |                |                   |
     |                               |  POST /zones/{id}/    |                |                   |
     |                               |  purge_cache          |                |                   |
     |                               |  { files: [...URLs] } |                |                   |
     |                               |-------------------------------------------------->|        |
     |                               |                       |                |                   |
     |                               |  5. Log invalidation  |                |                   |
     |                               |  metrics              |                |                   |
```

### Redis Key Invalidation Patterns

```
Redis Key Deletion Strategies:
│
├── Exact key delete:
│   └── DEL ilb:cache:articles:detail:{id}
│   └── Used when a specific entity changes
│
├── Pattern-based delete (via SCAN + DEL):
│   └── SCAN for ilb:cache:articles:list:*
│   └── DEL all matching keys
│   └── Used when listing pages need refresh
│   └── Note: SCAN is non-blocking (unlike KEYS)
│
├── Tag-based invalidation:
│   └── Each cache key is associated with tags
│   └── Tags stored in Redis SET: ilb:tags:{tag} -> [key1, key2, ...]
│   └── Invalidate by tag: Get all keys for tag, DEL them
│   └── Example tags: "articles", "homepage", "trending"
│
└── Full flush (emergency only):
    └── FLUSHDB — clears all Redis data
    └── Used only during major deployments or data issues
    └── Requires admin confirmation
```

### Cloudflare Cache Purge

```
Cloudflare Purge Strategies:
│
├── Purge by URL (most common):
│   POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache
│   { "files": ["https://iloveberlin.biz/articles/my-article-slug"] }
│   └── Max 30 URLs per request
│
├── Purge by prefix:
│   POST .../purge_cache
│   { "prefixes": ["iloveberlin.biz/articles/"] }
│   └── Purges all URLs matching prefix
│
├── Purge by tag (Enterprise only):
│   POST .../purge_cache
│   { "tags": ["articles"] }
│
└── Purge everything (emergency):
    POST .../purge_cache
    { "purge_everything": true }
    └── Triggers CDN-wide cache clear
    └── Used only during deployments or major content restructuring
```

---

## Cache Monitoring

### Metrics Tracked

```
Cache Monitoring (Prometheus + Grafana):
│
├── Redis Metrics:
│   ├── redis_keyspace_hits_total     # Cache hits
│   ├── redis_keyspace_misses_total   # Cache misses
│   ├── redis_used_memory_bytes       # Current memory usage
│   ├── redis_evicted_keys_total      # Keys evicted by LRU
│   ├── redis_connected_clients       # Active connections
│   └── Custom:
│       ├── cache_hit_rate             # hits / (hits + misses)
│       ├── cache_invalidations_total  # Invalidations triggered
│       └── cache_set_operations_total # Cache writes
│
├── CDN Metrics (Cloudflare Analytics):
│   ├── cf_cache_status distribution (HIT, MISS, EXPIRED, BYPASS)
│   ├── Bandwidth saved by cache
│   ├── Requests served from cache vs origin
│   └── Cache hit ratio by content type
│
├── ISR Metrics:
│   ├── Pages revalidated per minute
│   ├── Revalidation duration (p50, p95)
│   ├── On-demand revalidations triggered
│   └── Stale pages served (stale-while-revalidate)
│
└── Application Metrics:
    ├── api_cache_hit_total (endpoint, method)
    ├── api_cache_miss_total (endpoint, method)
    ├── api_cache_set_total (endpoint, ttl)
    └── api_response_time_cached_vs_uncached (histogram)
```

### Grafana Dashboard: Cache Performance

```
+============================================================+
|  CACHE PERFORMANCE DASHBOARD                                |
|                                                             |
|  ┌─────────────────────┐  ┌─────────────────────────────┐  |
|  │ Redis Hit Rate      │  │ CDN Hit Rate                │  |
|  │                     │  │                             │  |
|  │    ████████░░ 78%   │  │    ██████████░ 92%          │  |
|  │                     │  │                             │  |
|  └─────────────────────┘  └─────────────────────────────┘  |
|                                                             |
|  ┌──────────────────────────────────────────────────────┐   |
|  │ Cache Hit Rate by Endpoint (last 24h)                │   |
|  │                                                      │   |
|  │ /api/v1/articles        ████████████████░░ 85%       │   |
|  │ /api/v1/events          ███████████████░░░ 80%       │   |
|  │ /api/v1/dining          ██████████████████░ 90%      │   |
|  │ /api/v1/guides          ████████████████████ 95%     │   |
|  │ /api/v1/search          ████████░░░░░░░░░░ 45%      │   |
|  │ /api/v1/store/products  ███████████████░░░ 78%       │   |
|  └──────────────────────────────────────────────────────┘   |
|                                                             |
|  ┌──────────────────────────────────────────────────────┐   |
|  │ Response Time: Cached vs Uncached                    │   |
|  │                                                      │   |
|  │ Cached (Redis):    p50: 3ms    p95: 8ms              │   |
|  │ Uncached (DB):     p50: 45ms   p95: 180ms            │   |
|  │ Speedup:           ~15x (p50)  ~22x (p95)            │   |
|  └──────────────────────────────────────────────────────┘   |
+============================================================+
```

### Alerting Rules

| Alert                     | Condition                       | Severity | Action         |
| ------------------------- | ------------------------------- | -------- | -------------- |
| Redis hit rate < 50%      | Sustained for 10 minutes        | Warning  | Slack          |
| Redis memory > 90%        | Memory usage near limit         | Warning  | Slack          |
| Redis evictions > 100/min | Aggressive eviction occurring   | Warning  | Slack + Review |
| CDN hit rate < 70%        | Sustained for 30 minutes        | Warning  | Slack          |
| ISR revalidation failures | > 10 failures in 5 minutes      | Warning  | Slack          |
| Cache invalidation errors | Any invalidation fails          | Warning  | Slack          |
| Redis down                | Connection refused              | Critical | PagerDuty      |
