# Sprint 5: Articles Frontend & Public Experience

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Sprint Number**  | 5                                              |
| **Sprint Name**    | Articles Frontend & Public Experience          |
| **Duration**       | 2 weeks (10 working days)                      |
| **Dates**          | Week 9 -- Week 10 (Days 41--50 from project start) |
| **Team**           | 1 Backend, 1 Frontend, 1 DevOps / Infra        |

---

## Sprint Goal

> Deliver the complete public-facing article experience -- from the news landing page through category browsing to individual article pages -- with SSR, SEO optimization, social sharing, bookmarks, and responsive design. Conduct Phase 1 retrospective and ensure production-readiness of the articles vertical.

---

## User Stories

### US-5.1 -- Public Article Endpoints
**As a** frontend developer,
**I want** public (unauthenticated) API endpoints for published articles,
**so that** the public-facing pages can fetch content without auth tokens.

**Acceptance Criteria:**
- [ ] `GET /api/articles` -- list published articles with pagination, category filter, tag filter
- [ ] `GET /api/articles/:slug` -- get single published article with author, category, tags, featured image
- [ ] `GET /api/articles/:slug/related` -- get up to 4 related published articles
- [ ] `GET /api/categories` -- list all active categories with article counts
- [ ] Only articles with status `published` are returned
- [ ] Responses include `is_bookmarked` when Authorization header present
- [ ] Response time < 200 ms for list, < 100 ms for single article

### US-5.2 -- News Landing Page
**As a** visitor,
**I want** a news landing page showing the latest articles organized by category,
**so that** I can browse current content about Berlin.

**Acceptance Criteria:**
- [ ] Hero section with featured/latest article (large card)
- [ ] Category tabs: All, News, Culture, Food & Drink, etc.
- [ ] Clicking a tab filters articles by category (client-side for loaded, API for deep pages)
- [ ] Article cards: featured image, title, excerpt, category badge, author, date, read time
- [ ] Infinite scroll loading (12 articles per batch)
- [ ] Page renders in < 1 second (SSR)
- [ ] Route: `/news`

### US-5.3 -- Category Page
**As a** visitor,
**I want** to browse all articles in a specific category,
**so that** I can find content about a particular topic.

**Acceptance Criteria:**
- [ ] Route: `/news/category/:slug`
- [ ] Category header with name, description, article count
- [ ] Article grid with same card component as news landing
- [ ] Infinite scroll pagination
- [ ] Breadcrumbs: Home > News > [Category Name]
- [ ] SSR with category metadata

### US-5.4 -- Article Detail Page
**As a** reader,
**I want** to read a full article with rich formatting,
**so that** I can consume the content in a pleasant reading experience.

**Acceptance Criteria:**
- [ ] Route: `/news/:slug`
- [ ] SSR with full article content, meta tags, structured data
- [ ] Article layout: featured image (full-width or hero), title, author (avatar + name + date), read time, content body
- [ ] Content renders HTML from TipTap (headings, lists, images, embeds, blockquotes, code blocks)
- [ ] Images lazy-loaded with blur placeholder
- [ ] Responsive typography: comfortable reading width (max 720 px content), fluid font sizes
- [ ] Breadcrumbs: Home > News > [Category] > [Article Title]
- [ ] View tracking: fire view event on page load

### US-5.5 -- Social Sharing & Bookmarks
**As a** reader,
**I want** to share articles on social media and save them to my bookmarks,
**so that** I can spread interesting content and revisit it later.

**Acceptance Criteria:**
- [ ] Share buttons: Twitter/X, Facebook, LinkedIn, WhatsApp, copy link
- [ ] Share uses native Web Share API on mobile (fallback to button row)
- [ ] Bookmark button (heart/save icon): toggle on/off
- [ ] Bookmark requires login; show login prompt if unauthenticated
- [ ] Bookmark count visible on article card and detail page
- [ ] Share buttons do not affect page load performance (loaded client-side)

### US-5.6 -- SEO & Structured Data
**As a** product owner,
**I want** articles to be fully optimized for search engines,
**so that** content ranks well on Google and displays rich snippets.

**Acceptance Criteria:**
- [ ] `<title>`: meta_title or article title + " | ILoveBerlin"
- [ ] `<meta name="description">`: meta_description or excerpt
- [ ] Open Graph tags: og:title, og:description, og:image, og:url, og:type=article
- [ ] Twitter Card tags: twitter:card=summary_large_image, twitter:title, twitter:description, twitter:image
- [ ] JSON-LD `Article` structured data: headline, author, datePublished, dateModified, image, publisher
- [ ] Canonical URL set on every article page
- [ ] Sitemap includes all published articles (generated or static)
- [ ] `robots.txt` allows crawling of article pages

### US-5.7 -- Related Articles Component
**As a** reader,
**I want** to see related articles at the bottom of an article,
**so that** I can continue reading about similar topics.

**Acceptance Criteria:**
- [ ] Section title: "Related Articles" or "You May Also Like"
- [ ] 4 article cards in a responsive grid (2x2 on mobile, 4x1 on desktop)
- [ ] Same card component as news landing page
- [ ] Loaded after main content (not blocking SSR)
- [ ] If fewer than 4 related, fill with latest from same category

### US-5.8 -- Phase 1 Quality Gates
**As a** tech lead,
**I want** to pass E2E tests, SEO validation, performance benchmarks, and accessibility audit,
**so that** the articles vertical is production-ready.

**Acceptance Criteria:**
- [ ] E2E tests cover: landing page, category page, article detail, bookmark flow
- [ ] Lighthouse Performance score >= 90 on article detail page
- [ ] Lighthouse Accessibility score >= 95
- [ ] Lighthouse SEO score = 100
- [ ] Core Web Vitals: LCP < 2.5 s, FID < 100 ms, CLS < 0.1
- [ ] WAVE accessibility tool: zero errors
- [ ] All structured data validates via Google Rich Results Test
- [ ] Cross-browser testing: Chrome, Firefox, Safari, Edge (latest)
- [ ] Mobile testing: iPhone Safari, Android Chrome

---

## Day-by-Day Task Breakdown

### Week 1 (Days 41--45)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **41** | B-5.1 Public article list endpoint with filters | F-5.1 News landing page: hero section + article grid | -- |
| **42** | B-5.2 Public article detail endpoint (with relations) | F-5.2 Article card component (image, title, excerpt, meta) | -- |
| **43** | B-5.3 View tracking endpoint + deduplication | F-5.3 Category tabs on news landing, category page | D-5.1 CDN caching strategy for article pages |
| **44** | B-5.4 Public categories endpoint with article counts | F-5.4 Article detail page: layout, content rendering | -- |
| **45** | B-5.5 Sitemap generation (published articles) | F-5.5 Article detail: featured image, author info, read time | D-5.2 Sitemap deployment + robots.txt |

### Week 2 (Days 46--50)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **46** | B-5.6 Bookmark status in article responses | F-5.6 Social sharing buttons + bookmark toggle | -- |
| **47** | B-5.7 Performance optimization (query indexes, response caching) | F-5.7 JSON-LD structured data, Open Graph, Twitter Cards | -- |
| **48** | -- | F-5.8 Infinite scroll, breadcrumbs, responsive polish | D-5.3 Performance testing (Lighthouse CI) |
| **49** | QA-5.1 -- QA-5.3 Backend tests | F-5.9 Related articles component | -- |
| **50** | QA-5.4 SEO + structured data validation | QA-5.5 -- QA-5.8 E2E, accessibility, cross-browser | D-5.4 Deploy to staging, Phase 1 retrospective |

---

## Backend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| B-5.1 | Public article list | - `GET /api/articles` -- published only, exclude content body in list | 4 h |
|        |  | - Query params: page, limit, category (slug), tag (slug), search (title/excerpt) | |
|        |  | - Response: items[], total, page, limit, totalPages | |
|        |  | - Eager load: author (name, avatar), category (name, slug), featured_image (thumbnail URL) | |
|        |  | - Sort: newest first (default), most viewed, alphabetical | |
| B-5.2 | Public article detail | - `GET /api/articles/:slug` -- single published article | 3 h |
|        |  | - Full content body, author, category, tags, featured_image (all sizes) | |
|        |  | - If article not found or not published: 404 | |
|        |  | - Include `next` and `previous` article slugs (in same category) | |
| B-5.3 | View tracking | - `POST /api/articles/:slug/view` -- accepts no body | 2 h |
|        |  | - Extract IP from request (handle proxies via X-Forwarded-For) | |
|        |  | - Deduplication: `articleId:IP` cache key, 1-hour window | |
|        |  | - Atomic increment: `SET view_count = view_count + 1` | |
| B-5.4 | Public categories | - `GET /api/categories` -- active categories with published article count | 2 h |
|        |  | - Include subcategories nested under parent | |
|        |  | - Count uses subquery for performance | |
| B-5.5 | Sitemap generation | - `GET /api/sitemap.xml` -- dynamic XML sitemap | 3 h |
|        |  | - Include all published article URLs with lastmod | |
|        |  | - Include category pages | |
|        |  | - Cache sitemap for 1 hour (regenerate on article publish) | |
|        |  | - Sitemap index if > 50,000 URLs (future-proof) | |
| B-5.6 | Bookmark enrichment | - When Authorization header present, include `is_bookmarked: boolean` in article responses | 2 h |
|        |  | - Efficient: single query for bookmarks of requested articles | |
|        |  | - No impact when unauthenticated | |
| B-5.7 | Performance optimization | - Add database indexes on frequently queried columns | 3 h |
|        |  | - Response caching (Cache-Control headers, ETags) | |
|        |  | - Query optimization: analyze slow query log | |
|        |  | - Benchmark: < 200 ms for list, < 100 ms for detail | |

**Backend Total: 19 hours**

---

## Frontend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| F-5.1 | News landing page | - Route `/news` with SSR (Next.js `generateMetadata` + server component) | 5 h |
|        |  | - Hero section: latest article as large featured card | |
|        |  | - Grid below hero: remaining articles (3-column desktop, 2-column tablet, 1-column mobile) | |
|        |  | - Page title, description meta tags | |
| F-5.2 | Article card component | - Shared component used on landing, category, related | 3 h |
|        |  | - Featured image with aspect ratio container (16:9) | |
|        |  | - Category badge (colored pill) | |
|        |  | - Title (truncate at 2 lines), excerpt (truncate at 3 lines) | |
|        |  | - Author avatar + name, date (relative: "2 hours ago"), read time | |
|        |  | - Hover effect: subtle shadow + image zoom | |
|        |  | - Bookmark icon (top-right corner of image) | |
| F-5.3 | Category tabs + page | - Tab bar on news landing: "All" + each category | 4 h |
|        |  | - Active tab styling, horizontal scroll on mobile | |
|        |  | - Category page route `/news/category/:slug` | |
|        |  | - Category header: name, description, article count | |
|        |  | - Same article grid as landing | |
|        |  | - SSR with category-specific meta tags | |
| F-5.4 | Article detail layout | - Route `/news/:slug` with SSR | 6 h |
|        |  | - Featured image: full-width hero or contained | |
|        |  | - Title (H1), subtitle/excerpt | |
|        |  | - Author block: avatar, name (link to author page placeholder), published date | |
|        |  | - Read time badge | |
|        |  | - Content area: max-width 720 px, centered | |
|        |  | - Render HTML content with sanitized styles | |
|        |  | - Handle: headings, paragraphs, lists, blockquotes, code blocks, images, embeds | |
| F-5.5 | Article detail (continued) | - Images within content: lazy loading with blur-up placeholder | 3 h |
|        |  | - Responsive images: use `sizes` JSON for srcset | |
|        |  | - YouTube/Vimeo embeds: responsive iframe wrapper | |
|        |  | - Code blocks: syntax highlighting (optional: Prism or highlight.js) | |
| F-5.6 | Sharing + bookmarks | - Share button row (below author info and at article bottom) | 4 h |
|        |  | - Twitter/X: pre-filled tweet text with article title + URL | |
|        |  | - Facebook: share dialog | |
|        |  | - LinkedIn: share URL | |
|        |  | - WhatsApp: pre-filled message | |
|        |  | - Copy link button with "Copied!" toast | |
|        |  | - Mobile: Web Share API (navigator.share) | |
|        |  | - Bookmark button: heart icon, toggle state, login prompt for unauthenticated | |
| F-5.7 | SEO + structured data | - `generateMetadata` in Next.js for each page | 4 h |
|        |  | - Open Graph: og:title, og:description, og:image (featured image medium size), og:url, og:type=article, og:site_name | |
|        |  | - Twitter Cards: summary_large_image | |
|        |  | - JSON-LD script tag: `@type: "Article"`, headline, author, datePublished, dateModified, image, publisher (with logo), mainEntityOfPage | |
|        |  | - Canonical URL: `https://iloveberlin.biz/news/:slug` | |
| F-5.8 | Infinite scroll + breadcrumbs + polish | - Intersection Observer for infinite scroll trigger | 4 h |
|        |  | - Loading skeleton while fetching next page | |
|        |  | - "Back to top" button after scrolling | |
|        |  | - Breadcrumbs component: Home > News > Category > Article | |
|        |  | - JSON-LD BreadcrumbList structured data | |
|        |  | - Responsive design audit: test all breakpoints | |
|        |  | - Typography: font sizes, line heights, heading hierarchy | |
| F-5.9 | Related articles | - "Related Articles" section below article content | 3 h |
|        |  | - 4-card grid using ArticleCard component | |
|        |  | - Client-side loaded (not blocking SSR) | |
|        |  | - Skeleton loader while fetching | |
|        |  | - Graceful fallback if no related articles | |

**Frontend Total: 36 hours**

---

## DevOps / Infrastructure Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| D-5.1 | CDN caching strategy | - Configure Cloudflare page rules for article pages | 2 h |
|        |  | - Cache TTL: article list 5 min, article detail 10 min | |
|        |  | - Stale-while-revalidate headers | |
|        |  | - Cache purge on article publish/update | |
| D-5.2 | Sitemap + robots.txt | - Deploy sitemap URL registration with Google Search Console | 1 h |
|        |  | - `robots.txt` allowing article crawling, disallowing admin | |
| D-5.3 | Performance testing | - Lighthouse CI in GitHub Actions | 2 h |
|        |  | - Budget: Performance >= 90, Accessibility >= 95, SEO = 100 | |
|        |  | - Alert on regression | |
| D-5.4 | Staging deploy + retro | - Deploy all Sprint 5 features to staging | 2 h |
|        |  | - Phase 1 retrospective: document what went well, what to improve | |
|        |  | - Performance baseline metrics captured | |

**DevOps Total: 7 hours**

---

## QA Tasks

| ID | Test Scenario | Type | Estimate |
| -- | ------------- | ---- | -------- |
| QA-5.1 | Public article list: pagination, category filter, tag filter, search | Integration | 2 h |
| QA-5.2 | Public article detail: returns full content, 404 for unpublished | Integration | 1 h |
| QA-5.3 | View tracking: deduplication within 1h window | Integration | 1 h |
| QA-5.4 | SEO validation: all meta tags, JSON-LD, Open Graph, sitemap | Manual + tool | 2 h |
| QA-5.5 | E2E: navigate landing -> category -> article -> share -> bookmark | E2E (Playwright) | 3 h |
| QA-5.6 | Performance: Lighthouse CI scores meet thresholds | Performance | 2 h |
| QA-5.7 | Accessibility: WAVE tool zero errors, keyboard navigation, screen reader | Accessibility | 2 h |
| QA-5.8 | Cross-browser: Chrome, Firefox, Safari, Edge; mobile Safari, Android Chrome | Cross-browser | 3 h |
| QA-5.9 | Infinite scroll: loads next page on scroll, no duplicate articles, handles end-of-list | E2E | 1 h |
| QA-5.10 | Structured data: Google Rich Results Test validation for 3 sample articles | Manual | 1 h |

**QA Total: 18 hours**

---

## Dependencies

```
Sprint 4 (complete) -- article CRUD, status workflow, bookmarks
 +-- B-5.1 (Public list) -- depends on articles table + published articles
 +-- B-5.2 (Public detail) -- depends on articles table
 +-- B-5.6 (Bookmark enrichment) -- depends on bookmarks API from Sprint 4

B-5.1 (Public list)
 +-- F-5.1 (Landing page) -- depends on list endpoint
 +-- F-5.3 (Category page) -- depends on list endpoint + B-5.4

B-5.2 (Public detail)
 +-- F-5.4 (Article detail) -- depends on detail endpoint
 +-- F-5.5 (Image handling) -- depends on media sizes from Sprint 3
 +-- F-5.7 (SEO) -- depends on article data

B-5.3 (View tracking)
 +-- F-5.4 fires view event on load

B-5.4 (Categories)
 +-- F-5.3 (Category tabs) -- depends on categories with counts

F-5.2 (Article card) -- shared component, no backend dependency
 +-- F-5.1 uses card
 +-- F-5.3 uses card
 +-- F-5.9 uses card

F-5.6 (Sharing + bookmarks) -- depends on B-5.6 for bookmark status
F-5.8 (Infinite scroll) -- depends on F-5.1 (base page)
F-5.9 (Related articles) -- depends on Sprint 4 B-4.9 related endpoint
```

---

## Risk Items

| # | Risk | Likelihood | Impact | Mitigation |
| - | ---- | ---------- | ------ | ---------- |
| R-1 | SSR performance with large article content | Medium | High | Use streaming SSR (React Suspense boundaries); cache rendered pages |
| R-2 | Lighthouse score below 90 due to third-party scripts | Medium | Medium | Defer non-critical scripts; use `next/script` with `lazyOnload` strategy |
| R-3 | Infinite scroll causing memory issues on long sessions | Low | Medium | Virtualize off-screen cards; limit loaded articles to 100 |
| R-4 | Structured data validation errors | Medium | Medium | Validate early with Google's testing tool; fix schema iteratively |
| R-5 | Social share previews not showing image | Medium | Medium | Verify og:image is absolute URL with correct dimensions (1200x630) |
| R-6 | CDN cache serving stale content after updates | Low | High | Implement cache purge on publish; use short TTLs initially |
| R-7 | Cross-browser rendering differences in article content | Medium | Low | Use CSS reset; test HTML rendering edge cases in all browsers |

---

## Deliverables Checklist

- [ ] Public article list endpoint with pagination, filters
- [ ] Public article detail endpoint with full content and relations
- [ ] View tracking endpoint with IP deduplication
- [ ] Public categories endpoint with article counts
- [ ] Sitemap with all published articles
- [ ] Bookmark status in article responses (authenticated users)
- [ ] News landing page (`/news`) with hero + article grid + category tabs
- [ ] Category page (`/news/category/:slug`) with filtered articles
- [ ] Article detail page (`/news/:slug`) with SSR, full content rendering
- [ ] Article card component (shared, responsive)
- [ ] Social sharing buttons (Twitter/X, Facebook, LinkedIn, WhatsApp, copy link)
- [ ] Bookmark toggle button with login prompt
- [ ] JSON-LD Article structured data
- [ ] Open Graph and Twitter Card meta tags
- [ ] Canonical URLs on all pages
- [ ] Breadcrumbs with JSON-LD BreadcrumbList
- [ ] Infinite scroll on list pages
- [ ] Related articles component
- [ ] Responsive design across all breakpoints
- [ ] Lighthouse Performance >= 90, Accessibility >= 95, SEO = 100
- [ ] E2E tests for full article reading flow
- [ ] Cross-browser testing complete
- [ ] Phase 1 retrospective documented

---

## Definition of Done

1. All acceptance criteria for US-5.1 through US-5.8 are met
2. News landing page, category pages, and article detail pages fully functional
3. SSR working correctly (verify by viewing page source)
4. All SEO elements present and validated (meta tags, structured data, sitemap)
5. Social sharing generates correct previews on all platforms
6. Bookmarks work for authenticated users, login prompt for anonymous
7. Infinite scroll loads additional pages without duplicates
8. Related articles display relevant content
9. Lighthouse scores: Performance >= 90, Accessibility >= 95, SEO = 100
10. Core Web Vitals: LCP < 2.5 s, FID < 100 ms, CLS < 0.1
11. Cross-browser testing passed on 6 browser/device combinations
12. All E2E tests passing in CI
13. Phase 1 retrospective completed with action items documented
14. Deployed and verified on staging

---

## Sprint Review Demo Script

1. **News landing page** (2 min) -- Open `/news`, show hero article, browse grid, switch category tabs
2. **Category page** (1 min) -- Click category, show filtered articles, breadcrumbs
3. **Article detail** (3 min) -- Open article, show featured image, content rendering (headings, lists, images, embeds), responsive layout
4. **Social sharing** (1 min) -- Click share buttons, show pre-filled share dialogs, copy link toast
5. **Bookmarks** (2 min) -- Bookmark article (logged in), show bookmark toggle; try unauthenticated, show login prompt
6. **Infinite scroll** (1 min) -- Scroll down on landing page, show loading skeleton, more articles appearing
7. **Related articles** (1 min) -- Scroll to bottom of article, show related articles grid
8. **SEO audit** (2 min) -- View page source (meta tags, JSON-LD), run Google Rich Results Test live
9. **Performance** (2 min) -- Run Lighthouse audit live, show scores meeting thresholds
10. **Mobile experience** (1 min) -- Show article on mobile device or responsive mode
11. **Phase 1 retrospective summary** (2 min) -- Highlight key wins, areas for improvement, action items
12. **Q&A** (3 min)

**Total demo time: ~21 minutes**

---

## Rollover Criteria

A task may roll over to Sprint 6 only if ALL of the following are true:

1. Core article reading flow works: landing -> category -> article detail
2. SSR is functioning correctly
3. At least 85% of story points completed
4. Phase 1 retrospective completed

**Candidates for rollover (if needed):**
- QA-5.8 Cross-browser testing on all 6 combinations (minimum 3 required)
- F-5.6 WhatsApp sharing (Twitter, Facebook, copy link are minimum)
- B-5.5 Sitemap (can be added post-launch)

**Must NOT roll over:**
- News landing page (core user-facing feature)
- Article detail page with SSR (core user-facing feature)
- SEO meta tags and structured data (impacts search indexing from day 1)
- Lighthouse Performance >= 90 (non-negotiable quality bar)
- Phase 1 retrospective (informs Sprint 6+ planning)
