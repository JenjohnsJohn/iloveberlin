# System Architecture

**Platform:** ILoveBerlin (iloveberlin.biz)
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Request Flow](#request-flow)
3. [Component Diagram](#component-diagram)
4. [Service Communication Patterns](#service-communication-patterns)
5. [Environment Overview](#environment-overview)
6. [Technology Decisions](#technology-decisions)

---

## High-Level Overview

The ILoveBerlin platform follows a modern three-tier architecture with a clear separation between the presentation layer (Next.js web app and Flutter mobile apps), the application layer (NestJS API), and the data layer (PostgreSQL, Redis, Meilisearch, Cloudflare R2). All services are containerized with Docker and orchestrated via Docker Compose on Hetzner VPS infrastructure, fronted by Cloudflare for CDN, DNS, SSL termination, and WAF protection.

---

## Request Flow

### Web Request Flow

```
                                    INTERNET
                                       |
                                       v
                            +--------------------+
                            |    Cloudflare CDN   |
                            |  (DNS, SSL, WAF,    |
                            |   Caching, R2)      |
                            +--------------------+
                                       |
                           +-----------+-----------+
                           |                       |
                      Cache HIT               Cache MISS
                           |                       |
                      Return cached                |
                      response                     v
                                       +--------------------+
                                       |   Hetzner VPS      |
                                       |                    |
                                       |  +---------------+ |
                                       |  |    Nginx      | |
                                       |  | (Reverse      | |
                                       |  |  Proxy)       | |
                                       |  +-------+-------+ |
                                       |          |         |
                                       |    +-----+-----+  |
                                       |    |           |   |
                                       |    v           v   |
                                       | +--------+ +-----+ |
                                       | |Next.js | |Nest | |
                                       | |  :3000 | |JS   | |
                                       | |        | |:4000| |
                                       | +---+----+ +--+--+ |
                                       |     |         |    |
                                       |     v         v    |
                                       | +------------------+|
                                       | |  PostgreSQL :5432 ||
                                       | +------------------+|
                                       | |  Redis      :6379 ||
                                       | +------------------+|
                                       | |  Meilisearch:7700 ||
                                       | +------------------+|
                                       +--------------------+
```

### Detailed Request Path

```
1. User Request
   |
   v
2. Cloudflare Edge (nearest PoP)
   ├── DNS Resolution (iloveberlin.biz -> Cloudflare IP)
   ├── SSL/TLS Termination (Full Strict mode)
   ├── WAF Rule Evaluation
   ├── Bot Detection
   ├── Rate Limiting Check
   ├── Cache Lookup (by URL + headers)
   |   ├── HIT  -> Return cached response (with cf-cache-status: HIT)
   |   └── MISS -> Forward to origin
   |
   v
3. Nginx Reverse Proxy (:80/:443)
   ├── Route: /api/*      -> upstream NestJS (:4000)
   ├── Route: /admin/*    -> upstream Next.js (:3000)
   ├── Route: /*          -> upstream Next.js (:3000)
   ├── Route: /health     -> 200 OK (direct)
   ├── Static file serving with aggressive caching headers
   └── Gzip / Brotli compression
   |
   v
4a. Next.js Application (:3000) — Web Pages
    ├── App Router resolves route
    ├── SSR: Server-side render with data fetch from NestJS API
    ├── SSG: Serve pre-built static page
    ├── ISR: Serve cached page, revalidate in background
    └── Return HTML response
   |
   v
4b. NestJS API (:4000) — API Requests
    ├── Global Middleware (CORS, Helmet, Compression)
    ├── Guard Layer (JWT Auth, Roles, Throttle)
    ├── Interceptor Layer (Logging, Transform, Cache)
    ├── Controller -> Service -> Repository
    ├── Data Sources:
    |   ├── PostgreSQL (primary data store)
    |   ├── Redis (session cache, rate limits, hot data)
    |   └── Meilisearch (full-text search queries)
    └── Return JSON response
```

### Mobile Request Flow

```
 +------------------+      +------------------+
 |  Flutter App     |      |  Flutter App     |
 |  (iOS)           |      |  (Android)       |
 +--------+---------+      +--------+---------+
          |                          |
          +------------+-------------+
                       |
                       v
              +------------------+
              |   Cloudflare     |
              |   (API Gateway)  |
              +--------+---------+
                       |
                       v
              +------------------+
              |    Nginx         |
              |  /api/* -> :4000 |
              +--------+---------+
                       |
                       v
              +------------------+
              |   NestJS API     |
              |   (:4000)        |
              +------------------+
```

---

## Component Diagram

```
+============================================================================+
|                           CLOUDFLARE EDGE NETWORK                          |
|                                                                            |
|  +-------------+  +-------------+  +----------+  +----------+  +-------+  |
|  |    DNS       |  |   SSL/TLS   |  |   WAF    |  |  CDN     |  |  R2   |  |
|  |  Resolution  |  | Termination |  |  Rules   |  |  Cache   |  | Store |  |
|  +-------------+  +-------------+  +----------+  +----------+  +-------+  |
+============================================================================+
                                    |
                                    | HTTPS (origin pull)
                                    v
+============================================================================+
|                        HETZNER VPS (Production)                            |
|                                                                            |
|  +----------------------------------------------------------------------+  |
|  |                         DOCKER NETWORK                               |  |
|  |                                                                      |  |
|  |  +------------------+                                                |  |
|  |  |      NGINX       |                                                |  |
|  |  |  (Reverse Proxy) |                                                |  |
|  |  |    :80 / :443    |                                                |  |
|  |  +--------+---------+                                                |  |
|  |           |                                                          |  |
|  |     +-----+------+                                                   |  |
|  |     |            |                                                   |  |
|  |     v            v                                                   |  |
|  |  +--------+  +--------+                                             |  |
|  |  |Next.js |  |NestJS  |                                             |  |
|  |  | :3000  |  | :4000  +----+------+------+                          |  |
|  |  |        |  |        |    |      |      |                          |  |
|  |  |  SSR   |  | REST   |    |      |      |                          |  |
|  |  |  SSG   |  | API    |    |      |      |                          |  |
|  |  |  ISR   |  |        |    |      |      |                          |  |
|  |  +---+----+  +--------+    |      |      |                          |  |
|  |      |                     |      |      |                          |  |
|  |      |  (internal API)     |      |      |                          |  |
|  |      +---->  :4000         |      |      |                          |  |
|  |                            v      v      v                          |  |
|  |                      +------+ +-----+ +------------+               |  |
|  |                      |Postgr| |Redis| |Meilisearch |               |  |
|  |                      |SQL   | |     | |            |               |  |
|  |                      |:5432 | |:6379| |:7700       |               |  |
|  |                      +------+ +-----+ +------------+               |  |
|  |                                                                      |  |
|  |  +------------------+  +------------------+                          |  |
|  |  |   Prometheus     |  |    Grafana       |                          |  |
|  |  |   :9090          |  |    :3100         |                          |  |
|  |  +------------------+  +------------------+                          |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
```

---

## Service Communication Patterns

### Internal Service Communication

All inter-service communication occurs over the Docker bridge network. No service except Nginx exposes ports to the host network.

| Source          | Destination   | Protocol   | Port  | Purpose                              |
| --------------- | ------------- | ---------- | ----- | ------------------------------------ |
| Nginx           | Next.js       | HTTP       | 3000  | Proxy web page requests              |
| Nginx           | NestJS        | HTTP       | 4000  | Proxy API requests (/api/*)          |
| Next.js         | NestJS        | HTTP       | 4000  | Server-side data fetching            |
| NestJS          | PostgreSQL    | TCP        | 5432  | Primary data read/write              |
| NestJS          | Redis         | TCP        | 6379  | Caching, sessions, rate limiting     |
| NestJS          | Meilisearch   | HTTP       | 7700  | Full-text search queries             |
| NestJS          | Cloudflare R2 | HTTPS      | 443   | Media upload (presigned URLs)        |
| Prometheus      | NestJS        | HTTP       | 4000  | Metrics scraping (/metrics)          |
| Prometheus      | Node Exporter | HTTP       | 9100  | System metrics                       |
| Grafana         | Prometheus    | HTTP       | 9090  | Metrics querying                     |

### API Communication Style

```
+------------------+         +------------------+
|   Web / Mobile   |  HTTPS  |    NestJS API    |
|    Clients       +-------->|                  |
|                  |  REST   |  JSON Request/   |
|                  |<--------+  Response         |
+------------------+  JSON   +------------------+

- Protocol:    RESTful HTTP/HTTPS
- Format:      JSON (application/json)
- Auth:        Bearer JWT (access + refresh tokens)
- Versioning:  URL-based (/api/v1/...)
- Pagination:  Cursor-based for feeds, offset for admin
- Rate Limit:  Per-endpoint, tracked in Redis
```

### Event-Driven Patterns (Internal)

While the platform primarily uses synchronous REST communication, certain background operations use an internal event bus:

```
+------------------+       +-----------------+       +------------------+
|  Article Service |       |  Event Bus      |       |  Search Service  |
|                  +------>| (NestJS         +------>|                  |
|  emit:           |       |  EventEmitter2) |       |  on:             |
| 'article.created'|       |                 |       | 'article.created'|
| 'article.updated'|       |                 |       | -> sync to       |
| 'article.deleted'|       |                 |       |    Meilisearch   |
+------------------+       +-----------------+       +------------------+
                                   |
                                   +-------->+------------------+
                                             |  Media Service   |
                                             |                  |
                                             |  on:             |
                                             | 'article.deleted'|
                                             | -> cleanup media |
                                             +------------------+
```

### External Service Integrations

| Service           | Purpose                    | Integration Method       |
| ----------------- | -------------------------- | ------------------------ |
| Cloudflare R2     | Object storage (media)     | AWS S3-compatible SDK    |
| Cloudflare CDN    | Content delivery           | DNS proxy + cache rules  |
| Stripe            | Payment processing (Store) | Stripe Node.js SDK       |
| Firebase (FCM)    | Push notifications         | Firebase Admin SDK       |
| SMTP Provider     | Transactional email        | Nodemailer               |
| Google Analytics  | Web analytics              | Client-side gtag.js      |

---

## Environment Overview

### Environment Matrix

| Attribute            | Development          | Staging                | Production             |
| -------------------- | -------------------- | ---------------------- | ---------------------- |
| **URL**              | localhost:3000       | staging.iloveberlin.biz| iloveberlin.biz        |
| **Server**           | Local machine        | Hetzner VPS (CX21)    | Hetzner VPS (CX41)    |
| **CPU / RAM**        | Developer machine    | 2 vCPU / 4 GB         | 4 vCPU / 16 GB        |
| **PostgreSQL**       | Local Docker         | Shared instance        | Dedicated instance     |
| **Redis**            | Local Docker         | Shared instance        | Dedicated instance     |
| **Meilisearch**      | Local Docker         | Shared instance        | Dedicated instance     |
| **Cloudflare**       | Bypassed             | Development mode       | Full production rules  |
| **SSL**              | Self-signed / none   | Cloudflare (Flexible)  | Cloudflare (Full Strict)|
| **Monitoring**       | None                 | Basic Prometheus       | Full Prometheus+Grafana|
| **Logging**          | Console              | File + Console         | Structured JSON + ELK  |
| **Data**             | Seed data            | Sanitized prod copy    | Live data              |
| **Deployments**      | Hot reload           | Manual / PR merge      | CI/CD pipeline         |
| **Backups**          | None                 | Daily                  | Hourly + daily + weekly|

### Environment Topology

```
DEVELOPMENT                    STAGING                     PRODUCTION
+------------------+          +------------------+        +------------------+
| Developer Machine|          | Hetzner CX21     |        | Hetzner CX41     |
|                  |          |                  |        |                  |
| docker-compose   |          | docker-compose   |        | docker-compose   |
|  up --dev        |          |  up -d           |        |  up -d           |
|                  |          |                  |        |                  |
| - Next.js (HMR) |          | - Next.js        |        | - Next.js (x2)   |
| - NestJS (watch) |          | - NestJS         |        | - NestJS (x2)    |
| - PostgreSQL     |          | - PostgreSQL     |        | - PostgreSQL     |
| - Redis          |          | - Redis          |        | - Redis          |
| - Meilisearch    |          | - Meilisearch    |        | - Meilisearch    |
|                  |          | - Nginx          |        | - Nginx          |
|                  |          |                  |        | - Prometheus     |
|                  |          |                  |        | - Grafana        |
+------------------+          +------------------+        +------------------+
                                      |                           |
                              staging.iloveberlin.biz     iloveberlin.biz
                                      |                           |
                              +-------+---------------------------+-------+
                              |            CLOUDFLARE                     |
                              +-------------------------------------------+
```

---

## Technology Decisions

### Why Next.js for Frontend?

- **Server-side rendering** for SEO-critical content (articles, guides, events).
- **Static site generation** for content that changes infrequently (about, legal pages).
- **Incremental static regeneration** for content that updates periodically (homepage, listings).
- **App Router** provides nested layouts ideal for the platform's content structure.
- **React Server Components** reduce client-side JavaScript bundle size.

### Why NestJS for Backend?

- **Modular architecture** maps directly to the platform's domain modules (Auth, Article, Event, etc.).
- **TypeScript-native** ensures type safety across the full stack.
- **Decorator-based** approach simplifies guard, interceptor, and pipe composition.
- **TypeORM integration** provides a clean ORM layer for PostgreSQL.
- **Built-in support** for WebSockets, scheduling, events, and queuing.

### Why Flutter for Mobile?

- **Single codebase** for iOS and Android reduces development and maintenance effort.
- **Near-native performance** for smooth scrolling through content feeds.
- **Rich widget library** enables the custom UI needed for the Berlin lifestyle brand.
- **Strong ecosystem** for push notifications, deep linking, and offline storage.

### Why Hetzner + Cloudflare?

- **Hetzner** offers excellent price-to-performance VPS hosting in German data centers (GDPR compliance).
- **Cloudflare** provides a global CDN with generous free tier, plus R2 object storage with zero egress fees.
- **Combined**, they deliver enterprise-grade infrastructure at a fraction of the cost of major cloud providers.

### Why Meilisearch over Elasticsearch?

- **Lower resource footprint** — runs efficiently on a single VPS alongside other services.
- **Sub-50ms search** out of the box with typo tolerance and relevancy tuning.
- **Simple REST API** with easy integration into the NestJS backend.
- **Built-in features** like faceted search, filtering, and sorting without complex query DSL.
