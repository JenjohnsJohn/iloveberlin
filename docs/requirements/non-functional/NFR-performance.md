# NFR-PER: Performance Requirements

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Category:** Non-Functional Requirements -- Performance
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft

---

## 1. Overview

This document defines the performance requirements for the ILoveBerlin platform. All targets are measured under normal operating conditions (up to 200 concurrent users) unless otherwise stated. The platform spans a Next.js frontend, NestJS backend API, Flutter mobile application, PostgreSQL database, Cloudflare CDN, Cloudflare R2 object storage, and Meilisearch full-text search -- all hosted on Hetzner VPS infrastructure.

---

## 2. Core Web Vitals

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-001 | **Largest Contentful Paint (LCP)** shall be under 2.5 seconds on the 75th percentile of page loads. | LCP < 2.5 s (p75) | Google Lighthouse, Chrome UX Report, Web Vitals JS library |
| NFR-PER-002 | **First Input Delay (FID)** shall be under 100 milliseconds on the 75th percentile of interactions. | FID < 100 ms (p75) | Chrome UX Report, Web Vitals JS library |
| NFR-PER-003 | **Cumulative Layout Shift (CLS)** shall remain below 0.1 on the 75th percentile of page loads. | CLS < 0.1 (p75) | Google Lighthouse, Web Vitals JS library |
| NFR-PER-004 | **Interaction to Next Paint (INP)** shall remain below 200 milliseconds on the 75th percentile of interactions. | INP < 200 ms (p75) | Chrome UX Report, Web Vitals JS library |
| NFR-PER-005 | **Time to First Byte (TTFB)** shall be under 600 milliseconds for server-rendered pages. | TTFB < 600 ms (p75) | Lighthouse, synthetic monitoring |

---

## 3. Page Load Performance

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-010 | The **homepage** shall achieve full interactive state within 3.0 seconds on a 4G mobile connection (simulated). | TTI < 3.0 s | Lighthouse (mobile profile) |
| NFR-PER-011 | **Content listing pages** (blog index, event listings, restaurant directory) shall render above-the-fold content within 2.0 seconds. | Above-fold render < 2.0 s | Lighthouse, Real User Monitoring (RUM) |
| NFR-PER-012 | **Content detail pages** (individual articles, event pages, restaurant profiles) shall render above-the-fold content within 2.5 seconds. | Above-fold render < 2.5 s | Lighthouse, RUM |
| NFR-PER-013 | **Client-side page transitions** (via Next.js router) shall complete within 300 milliseconds after data is available. | Transition < 300 ms | Performance API, custom instrumentation |
| NFR-PER-014 | The **Lighthouse Performance score** shall be 90 or above for all public-facing pages on both mobile and desktop profiles. | Lighthouse Performance >= 90 | Lighthouse CI in deployment pipeline |

---

## 4. API Response Times

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-020 | **General API endpoints** (CRUD operations) shall respond within 500 milliseconds at the 95th percentile. | p95 < 500 ms | Application Performance Monitoring (APM), server-side logging |
| NFR-PER-021 | **Autocomplete / typeahead search** endpoints (Meilisearch-backed) shall respond within 150 milliseconds at the 95th percentile. | p95 < 150 ms | APM, Meilisearch metrics |
| NFR-PER-022 | **Full-text search** endpoints shall respond within 300 milliseconds at the 95th percentile for queries returning up to 50 results. | p95 < 300 ms | APM, Meilisearch dashboard |
| NFR-PER-023 | **Authentication endpoints** (login, token refresh) shall respond within 400 milliseconds at the 95th percentile. | p95 < 400 ms | APM |
| NFR-PER-024 | **File upload endpoints** shall acknowledge receipt and begin processing within 1 second for files up to 5 MB. | Acknowledgement < 1 s | APM, custom instrumentation |
| NFR-PER-025 | **Health check endpoints** (`/health`, `/readiness`) shall respond within 50 milliseconds at the 99th percentile. | p99 < 50 ms | Uptime monitoring service |

---

## 5. Image Optimization

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-030 | All user-uploaded images shall be **automatically converted** to WebP (with AVIF as progressive enhancement) and served in responsive sizes via `<picture>` or `srcset`. | 100% of served images in modern format | Automated audit, Lighthouse |
| NFR-PER-031 | **Thumbnail generation** shall produce at minimum three breakpoints: 320w, 768w, and 1280w. | 3 breakpoints per image | Cloudflare R2 + image processing pipeline verification |
| NFR-PER-032 | Images shall include **explicit width and height attributes** or CSS aspect-ratio to prevent layout shift. | CLS contribution from images = 0 | Lighthouse CLS audit |
| NFR-PER-033 | **Hero images** shall not exceed 200 KB after compression at the largest breakpoint (1280w). | Max 200 KB per hero image | Build-time and upload-time validation |
| NFR-PER-034 | **Lazy loading** shall be applied to all images below the fold using the `loading="lazy"` attribute or Intersection Observer API. | 100% below-fold images lazy-loaded | Lighthouse audit, code review |
| NFR-PER-035 | Above-the-fold images shall use `fetchpriority="high"` and be **preloaded** via `<link rel="preload">` where applicable. | LCP image preloaded | Lighthouse audit |

---

## 6. Code Splitting and Bundle Size

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-040 | The **initial JavaScript bundle** (First Load JS shared by all routes) shall not exceed 150 KB gzipped. | Initial JS bundle <= 150 KB gzip | `next build` output, webpack-bundle-analyzer |
| NFR-PER-041 | **Per-route JavaScript bundles** shall not exceed 80 KB gzipped for any individual page. | Per-route JS <= 80 KB gzip | `next build` output |
| NFR-PER-042 | **Dynamic imports** (`next/dynamic`) shall be used for all components not required for initial render, including modals, maps, rich-text editors, and chart libraries. | All heavy components dynamically imported | Code review checklist, bundle analysis |
| NFR-PER-043 | **CSS** shall be extracted and critical CSS inlined for above-the-fold content; remaining CSS shall be loaded asynchronously. | Critical CSS inlined | Lighthouse audit |
| NFR-PER-044 | **Third-party scripts** (analytics, tracking) shall be loaded with `async` or `defer` and shall not block the main thread for more than 50 milliseconds. | Third-party main-thread blocking < 50 ms | Lighthouse Third-Party Summary |
| NFR-PER-045 | **Tree shaking** shall be verified; no unused exports from utility libraries (e.g., lodash, date-fns) shall appear in production bundles. | Zero unused library code in bundles | webpack-bundle-analyzer |

---

## 7. CDN and Caching Strategy

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-050 | **Static assets** (JS, CSS, fonts, images) shall be served through Cloudflare CDN with a cache TTL of at least 1 year, using content-hashed filenames for cache busting. | Cache-Control: max-age=31536000, immutable | HTTP header inspection, Cloudflare dashboard |
| NFR-PER-051 | **CDN cache hit ratio** for static assets shall be at least 95% under normal traffic. | Cache hit ratio >= 95% | Cloudflare analytics |
| NFR-PER-052 | **HTML pages** (SSR/ISR) shall use `stale-while-revalidate` caching with a revalidation interval appropriate to content freshness (e.g., 60 seconds for listings, 300 seconds for articles). | s-maxage configured per route | HTTP header inspection, Next.js ISR configuration review |
| NFR-PER-053 | **API responses** for public data (listings, search results) shall include appropriate `Cache-Control` headers allowing CDN edge caching for at least 60 seconds. | Cache-Control: s-maxage=60 (minimum) | HTTP header inspection |
| NFR-PER-054 | **Cache invalidation** shall be triggered automatically on content publish/update via Cloudflare API purge for affected URLs. | Stale content purged within 30 seconds of update | Integration test, Cloudflare API logs |

---

## 8. Database Query Performance

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-060 | **No individual database query** shall exceed 100 milliseconds at the 95th percentile under normal load. | p95 query time < 100 ms | PostgreSQL `pg_stat_statements`, query logging |
| NFR-PER-061 | **Complex aggregate queries** (reporting, dashboards) shall complete within 500 milliseconds. | Aggregate queries < 500 ms | `pg_stat_statements`, APM |
| NFR-PER-062 | All queries on tables exceeding 10,000 rows shall use **indexed columns** in WHERE, JOIN, and ORDER BY clauses. | Zero sequential scans on large tables in hot paths | `EXPLAIN ANALYZE` review, `pg_stat_user_tables` seq_scan monitoring |
| NFR-PER-063 | **N+1 query patterns** shall be eliminated; all related data shall be fetched via JOINs or batched queries. | Zero N+1 patterns in production code | Code review, APM query count per request |
| NFR-PER-064 | **Connection pool** utilization shall remain below 80% under peak load. Pool size shall be configured appropriately for the Hetzner VPS resources. | Connection pool utilization < 80% at peak | PgBouncer metrics, PostgreSQL `pg_stat_activity` |
| NFR-PER-065 | **Database migrations** shall complete within 30 seconds and shall not lock tables for more than 5 seconds. | Migration < 30 s, lock < 5 s | Migration timing logs, zero-downtime migration strategy |

---

## 9. Search Performance (Meilisearch)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-070 | **Search index updates** shall be reflected in search results within 5 seconds of content publish/update. | Index propagation < 5 s | Integration test with timestamp comparison |
| NFR-PER-071 | **Faceted search** (filtering by category, neighborhood, price range) shall respond within 200 milliseconds at the 95th percentile. | p95 < 200 ms | Meilisearch metrics, APM |
| NFR-PER-072 | Meilisearch shall handle a **searchable dataset of up to 100,000 documents** without degradation below stated response time targets. | Targets met at 100K documents | Load test with representative dataset |

---

## 10. Mobile Application Performance (Flutter)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-080 | **App startup time** (cold start to interactive) shall be under 3 seconds on mid-range Android devices and under 2 seconds on iOS. | Android < 3 s, iOS < 2 s | Flutter DevTools, Firebase Performance |
| NFR-PER-081 | **Frame rendering** shall maintain 60 fps during scrolling and animations, with no more than 1% janky frames. | 60 fps, jank < 1% | Flutter DevTools performance overlay |
| NFR-PER-082 | **App binary size** shall not exceed 30 MB for the initial download (per platform). | APK/IPA < 30 MB | Build output measurement |
| NFR-PER-083 | **Offline content** (cached articles, saved listings) shall be accessible within 500 milliseconds from local storage. | Offline access < 500 ms | Custom instrumentation |

---

## 11. Load Testing

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-090 | The platform shall sustain **200 concurrent users** performing mixed operations (browsing, searching, authentication) while meeting all stated response time targets. | All targets met at 200 concurrent users | k6 or Artillery load test suite |
| NFR-PER-091 | **Stress testing** shall determine the breaking point; the system shall degrade gracefully (returning 503 with retry headers) rather than crashing when capacity is exceeded. | Graceful degradation beyond capacity | k6 stress test scenario |
| NFR-PER-092 | **Soak testing** shall run for a minimum of 2 hours at 100 concurrent users to detect memory leaks or resource exhaustion. | No memory leaks, stable resource usage over 2 hours | k6 soak test, server resource monitoring |
| NFR-PER-093 | Load test results shall be **baselined and tracked** across releases; any regression exceeding 10% on key metrics shall block deployment. | < 10% regression tolerance | CI/CD load test comparison |

---

## 12. Performance Monitoring

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-PER-100 | **Real User Monitoring (RUM)** shall be implemented to collect Core Web Vitals from actual user sessions. | RUM active on all pages | Web Vitals library + analytics pipeline |
| NFR-PER-101 | **Server-side APM** shall track request duration, database query time, and external service call duration for every API request. | 100% request tracing | APM tool (e.g., OpenTelemetry) |
| NFR-PER-102 | **Performance budgets** shall be enforced in the CI/CD pipeline; builds exceeding bundle size limits shall fail. | Automated budget enforcement | Lighthouse CI, bundlesize checks |
| NFR-PER-103 | A **performance dashboard** shall display real-time and historical metrics for all key performance indicators defined in this document. | Dashboard operational | Grafana or equivalent |

---

## 13. Acceptance Criteria Summary

All requirements in this document are considered **met** when:

1. Core Web Vitals targets are achieved on 75th percentile of real user traffic for 30 consecutive days.
2. API response time targets are achieved under load test conditions simulating 200 concurrent users.
3. Lighthouse Performance score of 90+ is maintained on all public pages across two consecutive weekly audits.
4. Load tests pass without regression in the CI/CD pipeline for three consecutive releases.
5. No production incident is attributed to performance degradation within the first 30 days after launch.

---

## 14. References

- [Google Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Meilisearch Performance Guide](https://docs.meilisearch.com/)
- [Cloudflare CDN Caching](https://developers.cloudflare.com/cache/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
