# Sprint 20: SEO & Performance Optimization

**Sprint Number:** 20
**Sprint Name:** SEO & Performance Optimization
**Duration:** 2 weeks (10 working days)
**Dates:** Weeks 39-40 (relative to project start)
**Team Capacity:** ~160 hours (1 backend, 1 frontend, 1 DevOps, 1 QA)

---

## Sprint Goal

Optimize the ILoveBerlin platform for search engine visibility and production performance, including dynamic XML sitemaps for all content sections, structured data markup, Redis caching layer, API compression and cache headers, database query optimization, frontend bundle optimization with lazy loading and code splitting, Cloudflare CDN caching rules, custom error pages, and validate all improvements with Lighthouse audits (target 90+ Performance, 95+ SEO) and k6 load testing (200 concurrent users).

---

## User Stories

### US-20.1: XML Sitemaps
**As a** search engine crawler, **I want** comprehensive XML sitemaps **so that** all ILoveBerlin content is discoverable and indexed efficiently.

**Acceptance Criteria:**
- [ ] Dynamic XML sitemap generated per section: articles, events, places, forum, listings, products, static pages
- [ ] Sitemap index file at /sitemap.xml listing all section sitemaps
- [ ] Each sitemap entry includes: loc, lastmod, changefreq, priority
- [ ] Sitemaps are paginated (max 50,000 URLs per file)
- [ ] robots.txt at /robots.txt references the sitemap index
- [ ] Sitemaps regenerate automatically when content is created/updated/deleted
- [ ] Sitemaps are cached with 1-hour TTL and regenerated on demand

### US-20.2: Backend Performance Optimization
**As a** user, **I want** fast API responses **so that** pages load quickly and the platform feels responsive.

**Acceptance Criteria:**
- [ ] Redis caching layer for: homepage data (5-minute TTL), trending content (15-minute TTL), category listings (10-minute TTL)
- [ ] Cache invalidation on content create/update/delete
- [ ] API responses include appropriate Cache-Control headers
- [ ] API compression (gzip/brotli) enabled for all JSON responses
- [ ] Database query optimization: N+1 query elimination, index review, slow query identification
- [ ] API response times: p95 < 200ms for cached endpoints, p95 < 500ms for uncached
- [ ] Redis connection pooling configured

### US-20.3: Frontend Performance Optimization
**As a** user, **I want** pages to load fast and feel smooth **so that** I have a pleasant browsing experience.

**Acceptance Criteria:**
- [ ] Next.js Image component with Cloudflare R2 CDN for all images
- [ ] Lazy loading for below-the-fold images and components
- [ ] Code splitting per route (dynamic imports)
- [ ] Bundle size analysis and optimization (target < 200KB initial JS)
- [ ] Font optimization (font-display: swap, preload critical fonts)
- [ ] Critical CSS inlined for above-the-fold content
- [ ] Prefetch links for likely next navigations
- [ ] Lighthouse Performance score > 90 on key pages

### US-20.4: Structured Data & SEO Markup
**As a** search engine crawler, **I want** structured data on pages **so that** ILoveBerlin content appears as rich results in search.

**Acceptance Criteria:**
- [ ] JSON-LD structured data for: Article (news), Event, LocalBusiness (places), Product (store), BreadcrumbList, Organization, WebSite with SearchAction
- [ ] Breadcrumb navigation on all content pages with matching BreadcrumbList schema
- [ ] Canonical URLs on all pages to prevent duplicate content
- [ ] Open Graph and Twitter Card meta tags on all content pages
- [ ] hreflang tags for future multi-language support preparation
- [ ] Structured data validated via Google Rich Results Test

### US-20.5: CDN & Caching Infrastructure
**As a** DevOps engineer, **I want** Cloudflare CDN optimized **so that** static assets and cacheable content are served from edge locations.

**Acceptance Criteria:**
- [ ] Cloudflare cache rules for static assets (images, CSS, JS): 30-day TTL
- [ ] Cloudflare cache rules for API responses: respect Cache-Control headers
- [ ] Custom page rules for sitemap and robots.txt caching
- [ ] Cloudflare Polish for automatic image optimization
- [ ] Cloudflare Brotli compression enabled
- [ ] Cache purge workflow for deployment and content updates
- [ ] Cache hit ratio target: >80% for static assets

### US-20.6: Error Pages & Resilience
**As a** user, **I want** helpful error pages **so that** I know what happened and can navigate back to useful content.

**Acceptance Criteria:**
- [ ] Custom 404 page with: ILoveBerlin branding, search bar, popular links, "Go Home" button
- [ ] Custom 500 page with: apology message, "Try Again" button, support contact link
- [ ] Custom maintenance page (for maintenance mode from admin settings)
- [ ] Error pages are static HTML (work even if Next.js is down)
- [ ] Error pages are responsive
- [ ] 404 page logs the requested URL for broken link analysis

### US-20.7: Load Testing & Validation
**As a** developer, **I want** to validate the platform handles 200 concurrent users **so that** we are confident in production readiness.

**Acceptance Criteria:**
- [ ] k6 load test script covering: homepage, article listing, article detail, search, product listing, product detail, cart operations, checkout flow
- [ ] Load test ramp-up: 0 -> 200 concurrent users over 5 minutes
- [ ] Sustained load: 200 concurrent users for 10 minutes
- [ ] Performance targets: p95 response time < 500ms, error rate < 1%, throughput > 500 req/s
- [ ] Load test results documented with bottleneck analysis
- [ ] Performance regression test suite for CI/CD pipeline

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday) - Sitemaps & robots.txt
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-20.1: Sitemap generation service | Backend | 3 | Generate XML sitemaps per content type, paginate at 50k URLs, include lastmod/changefreq/priority |
| BE-20.2: Sitemap index endpoint | Backend | 1.5 | /sitemap.xml listing all section sitemaps |
| BE-20.3: robots.txt endpoint | Backend | 0.5 | Static robots.txt with sitemap reference, disallow admin/api paths |
| BE-20.4: Sitemap caching (Redis) | Backend | 1.5 | Cache generated sitemaps (1-hour TTL), invalidate on content changes |
| FE-20.1: Next.js sitemap routes | Frontend | 2 | /sitemap.xml, /sitemap/[section].xml routes using Next.js API routes or generateStaticParams |
| DevOps-20.1: Cloudflare cache rules for sitemaps | DevOps | 1 | Cache sitemap responses at edge, 1-hour TTL |

#### Day 2 (Tuesday) - Cache Headers & API Compression
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-20.5: Cache-Control header middleware | Backend | 2 | NestJS interceptor to add Cache-Control headers based on route configuration |
| BE-20.6: API compression setup | Backend | 1.5 | Enable gzip/brotli compression for JSON responses via NestJS compression middleware |
| BE-20.7: Redis caching layer - homepage | Backend | 2.5 | Cache homepage data (featured content, trending, latest), 5-minute TTL |
| BE-20.8: Redis caching layer - trending | Backend | 2 | Cache trending content aggregation, 15-minute TTL, sorted by engagement score |
| FE-20.2: Structured data - Article schema | Frontend | 2 | JSON-LD for news articles: headline, author, datePublished, image, publisher |
| FE-20.3: Structured data - Event schema | Frontend | 2 | JSON-LD for events: name, startDate, endDate, location, offers, performer |

#### Day 3 (Wednesday) - Database Optimization & More Structured Data
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-20.9: Database query audit | Backend | 3 | Identify slow queries (pg_stat_statements), N+1 queries, missing indexes |
| BE-20.10: Database index optimization | Backend | 2 | Add composite indexes for common query patterns, partial indexes for filtered queries |
| BE-20.11: Query optimization - eager loading | Backend | 2 | Review TypeORM relations, fix N+1 queries with proper join/eager strategies |
| FE-20.4: Structured data - LocalBusiness schema | Frontend | 1.5 | JSON-LD for places: name, address, geo, telephone, openingHours, aggregateRating |
| FE-20.5: Structured data - Product schema | Frontend | 1.5 | JSON-LD for products: name, description, image, offers (price, availability) |
| FE-20.6: Structured data - BreadcrumbList schema | Frontend | 1 | JSON-LD for breadcrumb navigation on all content pages |
| DevOps-20.2: Database connection pool tuning | DevOps | 1.5 | Optimize PostgreSQL connection pool size, configure PgBouncer if needed |

#### Day 4 (Thursday) - Redis Caching & Cache Invalidation
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-20.12: Redis caching layer - category listings | Backend | 2 | Cache category-based content listings, 10-minute TTL |
| BE-20.13: Cache invalidation service | Backend | 3 | Event-driven cache invalidation on content create/update/delete, pattern-based key deletion |
| BE-20.14: Redis connection pooling | Backend | 1 | Configure ioredis connection pool, health checks |
| FE-20.7: Structured data - Organization + WebSite schemas | Frontend | 1.5 | JSON-LD for ILoveBerlin organization and website with SearchAction |
| FE-20.8: Canonical URLs on all pages | Frontend | 2 | Add <link rel="canonical"> to all pages, handle pagination canonicals |
| FE-20.9: Open Graph and Twitter Card review | Frontend | 1.5 | Verify OG/Twitter meta tags on all content types, add missing ones |
| DevOps-20.3: Redis monitoring dashboard | DevOps | 1.5 | Grafana dashboard for Redis: memory, hit rate, connection count, key count |

#### Day 5 (Friday) - Frontend Performance - Images & Code Splitting
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-20.10: Image optimization audit | Frontend | 2 | Identify all image usage, replace with Next.js Image component, configure R2 CDN loader |
| FE-20.11: Lazy loading implementation | Frontend | 2 | IntersectionObserver-based lazy loading for below-fold images and heavy components |
| FE-20.12: Code splitting per route | Frontend | 2 | Dynamic imports for route-level components, verify proper chunk splitting |
| FE-20.13: Bundle analysis | Frontend | 1.5 | Run webpack-bundle-analyzer, identify large dependencies, tree-shake unused code |
| BE-20.15: Cache invalidation integration tests | Backend | 2 | Test cache creation, invalidation on CRUD, TTL expiry, pattern deletion |
| QA-20.1: Sitemap validation | QA | 2 | Validate XML syntax, URL accuracy, lastmod correctness, robots.txt content |

### Week 2 (Days 6-10)

#### Day 6 (Monday) - Frontend Performance - Bundle & Fonts
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-20.14: Bundle optimization | Frontend | 2.5 | Replace heavy libraries with lighter alternatives, configure tree shaking, optimize lodash imports |
| FE-20.15: Font optimization | Frontend | 1.5 | Font-display: swap, preload critical fonts, subset fonts for used characters |
| FE-20.16: Critical CSS inlining | Frontend | 2 | Extract and inline critical CSS for above-the-fold content on key pages |
| FE-20.17: Link prefetching | Frontend | 1.5 | Prefetch likely next navigations (next page in list, product detail from grid) |
| DevOps-20.4: Cloudflare caching rules for static assets | DevOps | 2 | 30-day TTL for images/CSS/JS, cache-busting via content hash, Brotli compression |
| DevOps-20.5: Cloudflare Polish image optimization | DevOps | 1.5 | Enable auto WebP conversion, lossless/lossy optimization settings |

#### Day 7 (Tuesday) - Error Pages & Breadcrumbs
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-20.18: Custom 404 page | Frontend | 2 | ILoveBerlin branded, search bar, popular links, "Go Home" button, URL logging |
| FE-20.19: Custom 500 page | Frontend | 1.5 | Apology message, "Try Again" button, support link, static HTML fallback |
| FE-20.20: Custom maintenance page | Frontend | 1 | Maintenance mode page, estimated return time, social links |
| FE-20.21: Breadcrumb component review | Frontend | 1.5 | Ensure breadcrumbs on all content pages match structured data BreadcrumbList |
| BE-20.16: 404 URL logging service | Backend | 1.5 | Log 404 requests for broken link analysis, aggregate by URL, dashboard metric |
| DevOps-20.6: Static error page deployment | DevOps | 1.5 | Deploy static 500/maintenance pages to Cloudflare for failover |
| QA-20.2: Structured data validation | QA | 3 | Validate all structured data with Google Rich Results Test, verify each content type |

#### Day 8 (Wednesday) - Lighthouse Audit & Fixes
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-20.22: Lighthouse audit - homepage | Frontend | 1 | Run Lighthouse, document scores, identify top issues |
| FE-20.23: Lighthouse audit - article page | Frontend | 0.5 | Run Lighthouse, document scores |
| FE-20.24: Lighthouse audit - product page | Frontend | 0.5 | Run Lighthouse, document scores |
| FE-20.25: Lighthouse audit - store page | Frontend | 0.5 | Run Lighthouse, document scores |
| FE-20.26: Performance fixes from Lighthouse | Frontend | 3 | Address top performance issues: LCP, FID, CLS optimizations |
| FE-20.27: SEO fixes from Lighthouse | Frontend | 2 | Address SEO issues: missing meta, accessibility labels, crawlability |
| BE-20.17: API response time benchmarking | Backend | 2 | Benchmark key API endpoints, document current response times, identify bottlenecks |
| QA-20.3: Cache-Control header verification | QA | 2 | Verify correct headers on API responses, static assets, and dynamic content |

#### Day 9 (Thursday) - Load Testing
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-20.18: k6 load test script - read endpoints | Backend | 2.5 | Homepage, article listing, article detail, search, product listing, product detail |
| BE-20.19: k6 load test script - write endpoints | Backend | 2 | Cart add, cart update, checkout flow (with Stripe test mode) |
| BE-20.20: Load test execution (200 concurrent) | Backend | 2 | Ramp 0->200 over 5 min, sustain 10 min, collect metrics |
| BE-20.21: Load test analysis and bottleneck fixes | Backend | 2 | Analyze results, fix identified bottlenecks, re-test if time allows |
| DevOps-20.7: Load test infrastructure | DevOps | 2 | Configure k6 Cloud or local k6 with Grafana integration for result visualization |
| DevOps-20.8: Cache purge workflow | DevOps | 1.5 | Cloudflare cache purge on deployment, selective purge for content updates |
| QA-20.4: Error page testing | QA | 2 | 404 page rendering, 500 page fallback, maintenance mode, responsive |

#### Day 10 (Friday) - Final Validation & Documentation
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-20.28: Final Lighthouse audit (all pages) | Frontend | 2 | Re-run Lighthouse on all key pages, verify targets met (90+ Perf, 95+ SEO) |
| FE-20.29: Core Web Vitals verification | Frontend | 1.5 | LCP < 2.5s, FID < 100ms, CLS < 0.1 on all key pages |
| FE-20.30: Performance regression test setup | Frontend | 2 | Lighthouse CI configuration for automated performance checks in CI/CD |
| BE-20.22: Load test results documentation | Backend | 1.5 | Document results: response times, throughput, error rates, bottlenecks, recommendations |
| BE-20.23: Performance optimization documentation | Backend | 1 | Document caching strategy, cache invalidation patterns, query optimization changes |
| DevOps-20.9: Production performance monitoring | DevOps | 2 | Grafana dashboards for production: response times, cache hit rates, error rates |
| QA-20.5: Full SEO regression | QA | 2 | Sitemaps, structured data, meta tags, canonical URLs, breadcrumbs, robots.txt |
| QA-20.6: Performance acceptance testing | QA | 2 | Verify Lighthouse scores meet targets, load test results meet criteria |

---

## Backend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| BE-20.1-20.4 | XML sitemaps | Generation service, index, robots.txt, caching | 6.5 |
| BE-20.5-20.8 | Caching & compression | Cache headers, gzip/brotli, Redis homepage/trending | 8 |
| BE-20.9-20.11 | Database optimization | Query audit, index optimization, N+1 fixes | 7 |
| BE-20.12-20.15 | Redis caching completion | Category cache, invalidation service, connection pool, tests | 8 |
| BE-20.16-20.17 | 404 logging & benchmarks | URL logging, API benchmarking | 3.5 |
| BE-20.18-20.23 | Load testing & docs | k6 scripts, execution, analysis, documentation | 11 |
| **Total** | | | **44** |

## Frontend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| FE-20.1 | Next.js sitemap routes | Sitemap XML routes | 2 |
| FE-20.2-20.9 | Structured data & SEO | Article/Event/Place/Product/Breadcrumb/Org schemas, canonicals, OG tags | 12 |
| FE-20.10-20.17 | Performance optimization | Images, lazy loading, code splitting, bundle, fonts, critical CSS, prefetching | 13 |
| FE-20.18-20.21 | Error pages & breadcrumbs | 404, 500, maintenance, breadcrumb review | 6 |
| FE-20.22-20.27 | Lighthouse audits & fixes | Audit 4 pages, performance fixes, SEO fixes | 7.5 |
| FE-20.28-20.30 | Final validation | Final Lighthouse, Core Web Vitals, CI setup | 5.5 |
| **Total** | | | **46** |

## DevOps/Infrastructure Tasks

| Task ID | Task | Effort (hrs) |
|---------|------|-------------|
| DevOps-20.1 | Cloudflare cache rules for sitemaps | 1 |
| DevOps-20.2 | Database connection pool tuning | 1.5 |
| DevOps-20.3 | Redis monitoring dashboard (Grafana) | 1.5 |
| DevOps-20.4 | Cloudflare static asset caching rules | 2 |
| DevOps-20.5 | Cloudflare Polish image optimization | 1.5 |
| DevOps-20.6 | Static error page deployment | 1.5 |
| DevOps-20.7 | k6 load test infrastructure | 2 |
| DevOps-20.8 | Cache purge workflow | 1.5 |
| DevOps-20.9 | Production performance monitoring dashboards | 2 |
| **Total** | | **14.5** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---------|------|---------------|-------------|
| QA-20.1 | Sitemap validation | XML syntax valid; all content URLs present; lastmod accurate; robots.txt correct; pagination works | 2 |
| QA-20.2 | Structured data validation | Google Rich Results Test for Article, Event, Place, Product, BreadcrumbList; no errors | 3 |
| QA-20.3 | Cache-Control headers | Correct headers on cached APIs, static assets, dynamic content; no private data cached | 2 |
| QA-20.4 | Error page testing | 404 renders with search bar; 500 fallback works; maintenance mode; responsive on all | 2 |
| QA-20.5 | Full SEO regression | Sitemaps + structured data + meta tags + canonicals + breadcrumbs + robots.txt end-to-end | 2 |
| QA-20.6 | Performance acceptance | Lighthouse Performance > 90, SEO > 95; load test p95 < 500ms, error rate < 1%, 200 concurrent | 2 |
| **Total** | | | **13** |

---

## Dependencies

```
BE-20.1-20.4 (sitemaps backend) --> FE-20.1 (Next.js routes)
BE-20.5-20.6 (cache headers/compression) --> QA-20.3 (header verification)
BE-20.7-20.8 (Redis caching) --> BE-20.12-20.14 (more caching + invalidation)
BE-20.9-20.11 (DB optimization) --> BE-20.17 (API benchmarking)
FE-20.10-20.17 (frontend perf) --> FE-20.22-20.27 (Lighthouse audits)
FE-20.22-20.27 (Lighthouse audits) --> FE-20.28-20.30 (final validation)
DevOps-20.4-20.5 (Cloudflare rules) --> QA-20.3 (cache verification)
DevOps-20.7 (k6 infra) --> BE-20.18-20.21 (load testing)
BE-20.18-20.21 (load testing) --> QA-20.6 (performance acceptance)
All SEO tasks --> QA-20.5 (SEO regression)
DevOps-20.6 (static error pages) --> QA-20.4 (error page testing)
Redis infrastructure (from earlier sprints) --> BE-20.7-20.14 (Redis caching)
Cloudflare R2 (from Sprint 15) --> FE-20.10 (image optimization)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Lighthouse scores below target after optimization | Medium | High | Start Lighthouse audits early (Day 8); iterative fix cycle; prioritize LCP and CLS |
| Load test reveals critical bottlenecks | Medium | High | Run preliminary load test on Day 8; leave Day 10 for fixes; have scaling plan ready |
| Redis cache invalidation causing stale data | Medium | Medium | Conservative TTLs; event-driven invalidation; monitoring for cache inconsistencies |
| Database index changes causing slow migrations | Low | High | Test index creation on staging with production-size data; use CONCURRENTLY for large tables |
| Bundle size reduction insufficient | Medium | Medium | Identify and replace heavy dependencies early; consider alternative libraries |
| Cloudflare cache rules causing issues | Low | Medium | Test rules in staging first; have cache purge ready; monitor cache hit rates |
| Sitemap generation slow for large content sets | Medium | Medium | Batch generation; Redis caching; background regeneration via BullMQ |

---

## Deliverables Checklist

- [ ] Dynamic XML sitemaps for all content sections (articles, events, places, forum, listings, products, static pages)
- [ ] Sitemap index at /sitemap.xml and robots.txt at /robots.txt
- [ ] Cache-Control headers on all API responses
- [ ] API compression (gzip/brotli) enabled
- [ ] Database queries optimized (N+1 eliminated, indexes added)
- [ ] Redis caching layer for homepage, trending, and category data
- [ ] Cache invalidation on content changes
- [ ] JSON-LD structured data for Article, Event, LocalBusiness, Product, BreadcrumbList, Organization, WebSite
- [ ] Canonical URLs on all pages
- [ ] Open Graph and Twitter Card meta tags verified
- [ ] Next.js Image component with R2 CDN for all images
- [ ] Lazy loading and code splitting implemented
- [ ] Bundle size optimized (< 200KB initial JS)
- [ ] Font optimization (font-display: swap, preload)
- [ ] Custom 404, 500, and maintenance pages
- [ ] Cloudflare caching rules for static assets (30-day TTL)
- [ ] Cloudflare Polish image optimization enabled
- [ ] Breadcrumb navigation on all content pages
- [ ] Lighthouse audit: Performance > 90, SEO > 95
- [ ] k6 load test passing at 200 concurrent users (p95 < 500ms, error < 1%)
- [ ] Load test results documented with analysis
- [ ] Performance monitoring dashboards in Grafana

---

## Definition of Done

1. All 7 section sitemaps generate correctly with valid XML
2. robots.txt is accessible and references sitemap index
3. API responses include appropriate Cache-Control headers
4. gzip/brotli compression reduces API response sizes by >50%
5. No N+1 database queries remain in critical paths
6. Redis cache hit rate exceeds 80% for cached endpoints
7. Cache invalidation correctly clears stale data on content changes
8. All structured data passes Google Rich Results Test with no errors
9. Canonical URLs prevent duplicate content issues
10. Lighthouse Performance score > 90 on homepage, article, product, and store pages
11. Lighthouse SEO score > 95 on all pages
12. Core Web Vitals pass: LCP < 2.5s, FID < 100ms, CLS < 0.1
13. Initial JS bundle < 200KB
14. k6 load test at 200 concurrent users: p95 < 500ms, error rate < 1%
15. Custom error pages render correctly and fallback to static HTML
16. Grafana dashboards show production performance metrics
17. Code reviewed and approved by at least one other developer

---

## Sprint Review Demo Script

1. **Sitemaps & robots.txt** (3 min)
   - Navigate to /sitemap.xml, show sitemap index
   - Open articles sitemap, show XML entries with lastmod
   - Show robots.txt with sitemap reference and disallowed paths
   - Create a new article, show it appears in the sitemap

2. **Structured Data** (4 min)
   - Open article page, view source, show JSON-LD Article markup
   - Open event page, show Event schema with dates and location
   - Open product page, show Product schema with price and availability
   - Run Google Rich Results Test on one page live

3. **Performance Metrics** (5 min)
   - Run Lighthouse on homepage, show scores (target: 90+ Perf, 95+ SEO)
   - Show Core Web Vitals: LCP, FID, CLS
   - Run Lighthouse on product page, compare with pre-optimization baseline
   - Show bundle analysis: initial JS size < 200KB

4. **Caching Layer** (4 min)
   - Show Redis dashboard: cache hit rate, key count
   - Request homepage API, show Cache-Control header
   - Request again, show response from Redis cache (faster response time)
   - Update content, show cache invalidation in action

5. **Database Optimization** (2 min)
   - Show before/after query execution times
   - Show new indexes added
   - Show N+1 queries eliminated (query count comparison)

6. **Load Test Results** (4 min)
   - Show k6 load test dashboard in Grafana
   - Walk through metrics: 200 concurrent users, p95 < 500ms, error rate < 1%
   - Highlight throughput: >500 req/s sustained
   - Point out any bottlenecks identified and resolved

7. **Error Pages** (2 min)
   - Navigate to a non-existent URL, show custom 404 page with search bar
   - Show custom maintenance page
   - Point out responsive design on mobile viewport

8. **Cloudflare CDN** (2 min)
   - Show Cloudflare analytics: cache hit ratio
   - Show image optimization: WebP conversion
   - Show compression: response size reduction

---

## Rollover Criteria

Tasks may roll over to Sprint 21 if:
- Lighthouse Performance score requires more than 6 additional hours to reach 90+
- Load test reveals critical infrastructure bottlenecks requiring architectural changes
- Database optimization uncovers complex N+1 queries requiring service refactoring
- Structured data implementation for all 7 types takes more than estimated

Tasks that MUST complete in this sprint (no rollover):
- XML sitemaps and robots.txt
- API compression (gzip/brotli)
- Redis caching for homepage and trending
- Database query optimization (critical queries)
- At least 4 structured data schemas (Article, Event, Product, BreadcrumbList)
- Custom 404 page
- Lighthouse audit (even if scores need improvement)
- Load test execution (even if targets not fully met)

Deprioritized if time is short:
- Custom maintenance page
- Font subsetting
- Link prefetching
- Lighthouse CI configuration
- hreflang tags
- Performance regression test suite (CI setup only)
