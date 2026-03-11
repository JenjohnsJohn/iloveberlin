# Sprint 11: Videos and Homepage

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 11 |
| **Sprint Name** | Videos and Homepage |
| **Duration** | 2 weeks (10 working days) |
| **Dates** | Weeks 21-22 (relative to project start) |
| **Team** | 2 Frontend, 2 Backend, 1 QA, 0.5 DevOps |

## Sprint Goal

Build the video content system with series, tagging, and management capabilities alongside the platform homepage -- aggregating content from events, dining, articles, and videos into a curated, high-performance landing experience with hero sections, trending content, and editorial picks -- completing the core content discovery surface for iloveberlin.biz.

---

## User Stories

### US-11.1: Video Content Management
**ID:** US-11.1
**As an** admin, **I want to** manage video content organized into series **so that** I can publish Berlin-related video content on the platform.

**Acceptance Criteria:**
- [ ] `video_series` table: id, title, slug, description, thumbnail_url, status, sort_order, created_at, updated_at
- [ ] `videos` table: id, series_id (nullable), title, slug, description, video_url (external embed: YouTube/Vimeo), thumbnail_url, duration_seconds, status, view_count, is_featured, published_at, created_at, updated_at
- [ ] `video_tags` junction table linking videos to tags
- [ ] Video series CRUD: POST/PUT/DELETE via admin endpoints
- [ ] Video CRUD: POST/PUT/DELETE with series association and tag management
- [ ] `GET /api/videos` with filters (series, tag, status, featured) and pagination
- [ ] `GET /api/videos/:slug` returns video detail with series info and tags
- [ ] `GET /api/video-series` returns all series with video counts
- [ ] `GET /api/video-series/:slug` returns series with its videos
- [ ] Video view count increment endpoint

### US-11.2: Homepage Content Aggregation
**ID:** US-11.2
**As a** visitor, **I want to** see a curated homepage with highlights from all platform sections **so that** I can discover the best of Berlin at a glance.

**Acceptance Criteria:**
- [ ] `homepage_featured` table: id, section (enum: hero, trending, events, weekend, dining, videos, competitions, classifieds), entity_type, entity_id, position, title_override, subtitle_override, image_override, is_active, start_date, end_date, created_at, updated_at
- [ ] `GET /api/homepage` aggregation endpoint returns all homepage sections in a single response
- [ ] Response includes: hero items, trending articles, upcoming events, weekend picks, featured restaurants/offers, featured videos, active competitions, recent classifieds
- [ ] Each section returns appropriate data with limit (hero: 5, others: 4-6 items)
- [ ] Response is cached (TTL: 5 minutes) for performance
- [ ] Fallback: sections auto-populate from latest content if no manual curation

### US-11.3: Homepage Curation
**ID:** US-11.3
**As an** admin, **I want to** curate homepage sections **so that** I can highlight the most relevant content for visitors.

**Acceptance Criteria:**
- [ ] Admin can add/remove items from each homepage section
- [ ] Admin can reorder items within a section (drag-and-drop)
- [ ] Admin can override title, subtitle, and image for any featured item
- [ ] Admin can schedule featured items (start_date / end_date)
- [ ] Admin can toggle items active/inactive
- [ ] Sections auto-populate from latest content when no manual picks exist
- [ ] Changes are reflected on homepage within 5 minutes (cache TTL)

### US-11.4: Video Landing Page
**ID:** US-11.4
**As a** visitor, **I want to** browse all video content **so that** I can watch Berlin-related videos.

**Acceptance Criteria:**
- [ ] Video landing page at `/videos`
- [ ] Featured video hero section (latest or admin-picked featured video)
- [ ] Video grid with cards (thumbnail, title, series name, duration, view count)
- [ ] Filter by series and tags
- [ ] Pagination (12 per page)
- [ ] Responsive grid: 3 columns desktop, 2 tablet, 1 mobile

### US-11.5: Video Detail Page
**ID:** US-11.5
**As a** visitor, **I want to** watch a video and see related content **so that** I can enjoy Berlin video content.

**Acceptance Criteria:**
- [ ] Embedded video player (YouTube/Vimeo iframe with responsive aspect ratio)
- [ ] Video title, description, published date, view count, tags
- [ ] Series info with link to series page (if part of a series)
- [ ] "More from this series" section (if applicable)
- [ ] Related videos section (same tags)
- [ ] Share buttons (copy link, social media)
- [ ] View count increments on page load
- [ ] SEO: page title, meta description, OG tags with video thumbnail

### US-11.6: Video Series Page
**ID:** US-11.6
**As a** visitor, **I want to** browse all videos in a series **so that** I can watch related content sequentially.

**Acceptance Criteria:**
- [ ] Series page at `/videos/series/[slug]`
- [ ] Series title, description, thumbnail
- [ ] List of all videos in the series ordered by sort_order
- [ ] Video cards with episode number, thumbnail, title, duration
- [ ] Responsive layout

### US-11.7: Homepage Implementation
**ID:** US-11.7
**As a** visitor, **I want to** see a rich, engaging homepage **so that** I am drawn into exploring Berlin content.

**Acceptance Criteria:**
- [ ] Hero section: rotating carousel/slider with 3-5 featured items (auto-advance, manual navigation)
- [ ] Trending section: 4-6 trending articles with image cards
- [ ] Events section: upcoming events with date badges, "View all" link
- [ ] Weekend Picks section: curated weekend activities
- [ ] Dining section: featured restaurants and active offers
- [ ] Videos section: latest/featured videos with play button overlay
- [ ] Competitions section: active competitions with countdown timers
- [ ] Classifieds section: recent classifieds with category icons
- [ ] Each section has a "View all" link to its respective landing page
- [ ] Page loads within 2 seconds (LCP target)
- [ ] SSR for SEO

### US-11.8: Admin Homepage Curation Interface
**ID:** US-11.8
**As an** admin, **I want to** manage homepage sections through the admin panel **so that** I can control what visitors see first.

**Acceptance Criteria:**
- [ ] Dashboard showing all homepage sections
- [ ] Each section shows current items with drag-and-drop reorder
- [ ] "Add item" button opens entity search (search articles, events, restaurants, videos)
- [ ] Override fields (title, subtitle, image) editable per item
- [ ] Schedule picker (start/end dates)
- [ ] Active/inactive toggle
- [ ] Preview button to see homepage with pending changes
- [ ] "Auto-populate" fallback toggle per section

### US-11.9: Admin Video Management
**ID:** US-11.9
**As an** admin, **I want to** manage video series and videos through the admin panel **so that** I can publish video content.

**Acceptance Criteria:**
- [ ] Video series list with create/edit/delete
- [ ] Video list with series filter, status filter
- [ ] Video create/edit form with all fields (URL, thumbnail upload, series select, tags)
- [ ] Drag-and-drop reorder within series
- [ ] Bulk status change (draft/published/archived)

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Create `video_series` table migration | Backend 1 | 2h | Schema with all columns, slug unique index |
| Create `videos` table migration | Backend 1 | 3h | Full schema with indexes on series_id, status, published_at, is_featured |
| Create `video_tags` junction table migration | Backend 1 | 1h | Many-to-many with tags table |
| Create `homepage_featured` table migration | Backend 2 | 3h | Schema with section enum, entity polymorphic reference, scheduling fields |
| Design homepage aggregation query strategy | Backend 2 | 2h | Plan efficient multi-section data fetching |

#### Day 2 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build VideoSeriesEntity and VideoEntity | Backend 1 | 2h | TypeORM entities with relations |
| Build VideoSeriesService CRUD | Backend 1 | 3h | Create, update, delete, list with video counts |
| Build VideoService CRUD | Backend 1 | 4h | Create, update, delete with series/tag associations |
| Build HomepageFeaturedEntity | Backend 2 | 1.5h | TypeORM entity with section enum |
| Build HomepageService - aggregation endpoint | Backend 2 | 5h | Multi-query aggregation for all sections, response shaping |

#### Day 3 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build VideoController (public endpoints) | Backend 1 | 3h | GET /api/videos, GET /api/videos/:slug, view count increment |
| Build VideoSeriesController | Backend 1 | 2h | GET /api/video-series, GET /api/video-series/:slug |
| Build AdminVideoController | Backend 1 | 3h | Admin CRUD endpoints with guard |
| Build HomepageController | Backend 2 | 2h | GET /api/homepage with caching |
| Build HomepageCurationService | Backend 2 | 4h | Add/remove/reorder items, overrides, scheduling |
| Build AdminHomepageController | Backend 2 | 2h | Admin curation endpoints |

#### Day 4 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Video list/detail API filtering and pagination | Backend 1 | 3h | Filter by series, tag, status, featured; pagination |
| Homepage cache strategy implementation | Backend 2 | 3h | Redis/memory cache with 5-min TTL, cache invalidation on curation change |
| Homepage auto-populate fallback logic | Backend 2 | 3h | Query latest content per section when no manual curation exists |
| Scaffold videos frontend module | Frontend 1 | 3h | Create /videos route, types, hooks |
| Scaffold homepage frontend | Frontend 2 | 3h | Create homepage layout, section components skeleton |

#### Day 5 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Backend unit tests - Video module | Backend 1 | 4h | CRUD tests, filtering, view count |
| Backend unit tests - Homepage module | Backend 2 | 4h | Aggregation, curation, cache |
| Build video landing page with featured hero | Frontend 1 | 4h | Featured video, video card grid, filter UI |
| Build homepage hero carousel/slider | Frontend 2 | 5h | Rotating hero with 3-5 items, auto-advance, dots/arrows |

### Week 2 (Days 6-10)

#### Day 6 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build video detail page | Frontend 1 | 5h | Embedded player, info, series link, related videos |
| Build video series page | Frontend 1 | 3h | Series info, video list ordered by sort_order |
| Build homepage trending section | Frontend 2 | 3h | Article cards grid, "View all" link |
| Build homepage events section | Frontend 2 | 3h | Event cards with date badges, "View all" link |
| Seed sample video data (15-20 videos, 3-4 series) | Backend 1 | 2h | YouTube embed URLs, thumbnails |

#### Day 7 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build homepage weekend picks section | Frontend 2 | 3h | Curated activity cards |
| Build homepage dining section | Frontend 2 | 3h | Featured restaurants and offers cards |
| Build homepage videos section | Frontend 2 | 3h | Video cards with play button overlay |
| Build video card component | Frontend 1 | 2h | Thumbnail, title, series, duration, view count |
| Admin video series management UI | Frontend 1 | 3h | List, create/edit form, delete |

#### Day 8 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build homepage competitions section | Frontend 2 | 2h | Competition cards with countdown timers (placeholder data) |
| Build homepage classifieds section | Frontend 2 | 2h | Recent classifieds with category icons (placeholder data) |
| Admin video management UI | Frontend 1 | 5h | List with filters, create/edit form, tag management, series select |
| Admin homepage curation dashboard | Frontend 2 | 4h | Section overview, add/remove items |

#### Day 9 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin homepage - drag-and-drop reorder | Frontend 2 | 3h | dnd-kit for section item reorder |
| Admin homepage - entity search and overrides | Frontend 2 | 4h | Cross-entity search, override fields |
| Responsive design - video pages | Frontend 1 | 3h | Mobile video player, cards, series page |
| Responsive design - homepage | Frontend 2 | 3h | Mobile sections, carousel, card stacking |
| QA: Test video pages | QA | 4h | Landing, detail, series; filters, player |
| Performance testing - homepage load | Backend 2 | 3h | Profile aggregation query, optimize N+1 queries |

#### Day 10 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| QA: Test homepage sections | QA | 4h | All sections render, links work, data accuracy |
| QA: Test admin curation | QA | 3h | Add/remove/reorder, overrides, scheduling |
| Bug fixes from QA | Frontend 1 + 2 | 4h | Address P1/P2 issues |
| SEO: meta tags for video and homepage | Frontend 1 | 2h | OG tags, structured data |
| Sprint review demo preparation | Frontend 2 | 2h | Demo script, curated test data |
| Cross-browser testing | QA | 3h | All pages, all browsers |

---

## Backend Tasks

### BE-11.1: Video Series Schema and Module
- **Sub-tasks:**
  - Create `video_series` table migration (1h)
  - Create VideoSeriesEntity with TypeORM decorators (0.5h)
  - Build VideoSeriesService (create, update, delete, findAll with video counts, findBySlug) (3h)
  - Build VideoSeriesController (public endpoints) (1.5h)
  - Build AdminVideoSeriesController (admin CRUD) (1.5h)
  - Input validation DTOs (0.5h)
- **Effort:** 8 hours

### BE-11.2: Videos Schema and Module
- **Sub-tasks:**
  - Create `videos` table migration (2h)
  - Create `video_tags` junction table migration (0.5h)
  - Create VideoEntity with relations (1h)
  - Build VideoService (create with series/tag associations, update, delete, list with filters, detail by slug) (4h)
  - Build view count increment service (0.5h)
  - Build VideoController (public endpoints: list, detail, view count) (2h)
  - Build AdminVideoController (admin CRUD, bulk status change) (2h)
  - Input validation DTOs (1h)
- **Effort:** 13 hours

### BE-11.3: Homepage Featured Schema
- **Sub-tasks:**
  - Create `homepage_featured` table migration with section enum (2h)
  - Create HomepageFeaturedEntity with section enum type (1h)
  - Add indexes on section + is_active + position (0.5h)
- **Effort:** 3.5 hours

### BE-11.4: Homepage Aggregation Endpoint
- **Sub-tasks:**
  - Design aggregation response shape (all sections in one payload) (1h)
  - Build HomepageService.getAggregatedHomepage() (4h)
  - Query hero items from homepage_featured (0.5h)
  - Query trending articles (most viewed in last 7 days) (1h)
  - Query upcoming events (next 7 days, limit 6) (0.5h)
  - Query weekend picks (curated or auto: this weekend events) (1h)
  - Query featured restaurants and active dining offers (1h)
  - Query featured/latest videos (0.5h)
  - Query active competitions (0.5h)
  - Query recent classifieds (0.5h)
  - Build HomepageController with GET /api/homepage (1h)
  - Implement response caching (Redis, 5-min TTL) (1.5h)
  - Cache invalidation on curation changes (1h)
- **Effort:** 14 hours

### BE-11.5: Homepage Curation Endpoints
- **Sub-tasks:**
  - HomepageCurationService.addItem(section, entityType, entityId) (1.5h)
  - HomepageCurationService.removeItem(id) (0.5h)
  - HomepageCurationService.reorderItems(section, orderedIds) (1.5h)
  - HomepageCurationService.updateOverrides(id, overrides) (1h)
  - HomepageCurationService.setSchedule(id, startDate, endDate) (0.5h)
  - HomepageCurationService.toggleActive(id) (0.5h)
  - Auto-populate fallback logic per section (2h)
  - AdminHomepageController (all curation endpoints) (2h)
  - Input validation DTOs (0.5h)
- **Effort:** 10 hours

### BE-11.6: Seed Sample Data
- **Sub-tasks:**
  - Create 3-4 video series with descriptions (0.5h)
  - Create 15-20 videos with YouTube embed URLs (1h)
  - Create homepage featured items across all sections (0.5h)
- **Effort:** 2 hours

### BE-11.7: Backend Tests
- **Sub-tasks:**
  - Video series CRUD tests (1.5h)
  - Video CRUD and filtering tests (2h)
  - View count increment tests (0.5h)
  - Homepage aggregation tests (2h)
  - Homepage curation tests (2h)
  - Cache invalidation tests (1h)
- **Effort:** 9 hours

### BE-11.8: Performance Testing
- **Sub-tasks:**
  - Profile homepage aggregation query (multiple sub-queries) (1h)
  - Identify and fix N+1 queries in aggregation (1h)
  - Verify cache hit ratio and TTL behavior (0.5h)
  - Ensure homepage response < 200ms (cached), < 1s (uncached) (0.5h)
- **Effort:** 3 hours

**Total Backend Effort:** 62.5 hours

---

## Frontend Tasks

### FE-11.1: Video Landing Page
- **Sub-tasks:**
  - Create `/videos` page route (0.5h)
  - Featured video hero section (thumbnail, play button, title) (2h)
  - Video card component (thumbnail with play overlay, title, series, duration, views) (2h)
  - Video grid with responsive layout (3/2/1 columns) (1h)
  - Filter by series dropdown and tag pills (1.5h)
  - Pagination (12 per page) (1h)
  - Loading skeleton (0.5h)
- **Effort:** 8.5 hours

### FE-11.2: Video Detail Page
- **Sub-tasks:**
  - Create `/videos/[slug]` dynamic route (0.5h)
  - Responsive embedded video player (YouTube/Vimeo iframe, 16:9 aspect ratio) (2h)
  - Video info section (title, description, published date, view count) (1h)
  - Tag pills display (0.5h)
  - Series info with link to series page (0.5h)
  - "More from this series" section (compact video list) (1.5h)
  - Related videos section (by shared tags) (1.5h)
  - Share buttons (copy link, Twitter, Facebook) (1h)
  - View count increment on page load (0.5h)
  - SEO: page title, meta description, OG tags with thumbnail (1h)
- **Effort:** 10 hours

### FE-11.3: Video Series Page
- **Sub-tasks:**
  - Create `/videos/series/[slug]` route (0.5h)
  - Series header (title, description, thumbnail) (1h)
  - Video list ordered by sort_order with episode numbers (2h)
  - Responsive layout (1h)
- **Effort:** 4.5 hours

### FE-11.4: Homepage Hero Carousel
- **Sub-tasks:**
  - Build carousel/slider component (Swiper.js or custom) (3h)
  - Auto-advance every 5 seconds with pause on hover (1h)
  - Navigation dots and left/right arrows (1h)
  - Hero card: full-width image, title overlay, subtitle, CTA button (2h)
  - Responsive hero (image sizes, text scaling) (1h)
  - Lazy load off-screen slides (0.5h)
- **Effort:** 8.5 hours

### FE-11.5: Homepage Content Sections
- **Sub-tasks:**
  - Section container component (title, "View all" link, content area) (1h)
  - Trending section: article cards in 2x3 or 1x4 grid (2h)
  - Events section: event cards with date badges, compact layout (2h)
  - Weekend Picks section: curated cards with weekend date context (2h)
  - Dining section: restaurant cards + offer highlight cards (2.5h)
  - Videos section: video cards with play button overlay (2h)
  - Competitions section: competition cards with countdown timers (2h)
  - Classifieds section: classified cards with category icons (1.5h)
- **Effort:** 15 hours

### FE-11.6: Homepage Integration
- **Sub-tasks:**
  - Fetch all homepage data from GET /api/homepage (1h)
  - Wire each section to its data from aggregation response (2h)
  - Handle empty sections gracefully (show nothing or placeholder) (1h)
  - SSR setup for homepage (1h)
  - SEO: meta tags, OG tags for homepage (0.5h)
- **Effort:** 5.5 hours

### FE-11.7: Admin Video Management
- **Sub-tasks:**
  - Video series list page with create/edit/delete (2h)
  - Video series create/edit form (1.5h)
  - Video list page with series/status filters (2h)
  - Video create/edit form (URL, thumbnail upload, series select, tag multi-select) (3h)
  - Drag-and-drop reorder within series (1.5h)
  - Bulk status change (select multiple, change status dropdown) (1h)
- **Effort:** 11 hours

### FE-11.8: Admin Homepage Curation
- **Sub-tasks:**
  - Curation dashboard showing all sections (2h)
  - Section detail view with current items list (1h)
  - "Add item" with cross-entity search (articles, events, restaurants, videos) (3h)
  - Override fields editor (title, subtitle, image) per item (1.5h)
  - Drag-and-drop reorder within section (1.5h)
  - Schedule picker (start/end date) per item (1h)
  - Active/inactive toggle per item (0.5h)
  - Preview button (open homepage in new tab with draft changes) (1.5h)
  - Auto-populate fallback toggle per section (0.5h)
- **Effort:** 12.5 hours

### FE-11.9: Responsive Design Pass
- **Sub-tasks:**
  - Video landing: mobile grid, filter layout (1.5h)
  - Video detail: mobile player, info stacking (1h)
  - Homepage: mobile hero, section stacking, carousel touch support (3h)
  - Test at all breakpoints (1h)
- **Effort:** 6.5 hours

### FE-11.10: Performance Optimization
- **Sub-tasks:**
  - Homepage: lazy load below-fold sections (Intersection Observer) (1.5h)
  - Image optimization for all sections (next/image, srcset) (1h)
  - Code splitting for video player and carousel (1h)
  - Lighthouse audit targeting LCP < 2s (0.5h)
- **Effort:** 4 hours

**Total Frontend Effort:** 86 hours

---

## DevOps / Infrastructure Tasks

### DEVOPS-11.1: Video Thumbnail Storage
- **Sub-tasks:**
  - Configure R2 bucket/path for video thumbnails (0.5h)
  - Set up thumbnail resize pipeline (0.5h)
- **Effort:** 1 hour

### DEVOPS-11.2: Homepage Cache Infrastructure
- **Sub-tasks:**
  - Verify Redis is available for homepage caching (0.5h)
  - Configure cache TTL and invalidation policy (0.5h)
  - Monitor cache hit rates (0.5h)
- **Effort:** 1.5 hours

### DEVOPS-11.3: CDN Configuration for Homepage
- **Sub-tasks:**
  - Configure Cloudflare page rules for homepage caching (1h)
  - Set appropriate Cache-Control headers (0.5h)
- **Effort:** 1.5 hours

**Total DevOps Effort:** 4 hours

---

## QA Tasks

### QA-11.1: Video Landing Page Tests
- **Test Scenarios:**
  1. Landing page loads with video grid
  2. Featured video hero displays correct video
  3. Video cards show thumbnail, title, series, duration, views
  4. Filter by series shows correct videos
  5. Filter by tag shows correct videos
  6. Pagination navigates correctly
  7. Empty state when no videos match filter
  8. Responsive layout at all breakpoints
- **Effort:** 4 hours

### QA-11.2: Video Detail and Series Tests
- **Test Scenarios:**
  1. Video player embeds correctly (YouTube)
  2. Video player embeds correctly (Vimeo)
  3. Player has responsive 16:9 aspect ratio
  4. Video info (title, description, date, views) displays correctly
  5. View count increments on page load
  6. Series link navigates to series page
  7. "More from this series" shows correct videos
  8. Related videos show by shared tags
  9. Share buttons work (copy link, social)
  10. Series page lists all videos in order
  11. SEO meta tags present
- **Effort:** 5 hours

### QA-11.3: Homepage Tests
- **Test Scenarios:**
  1. Homepage loads within 2 seconds (LCP)
  2. Hero carousel displays 3-5 items
  3. Hero auto-advances every 5 seconds
  4. Hero dots and arrows navigate correctly
  5. Trending section shows articles
  6. Events section shows upcoming events with correct dates
  7. Weekend picks section displays curated content
  8. Dining section shows restaurants and offers
  9. Videos section shows videos with play overlay
  10. Competitions section shows active competitions (or placeholder)
  11. Classifieds section shows recent listings (or placeholder)
  12. All "View all" links navigate to correct pages
  13. Empty sections are hidden gracefully
  14. Responsive layout on mobile
- **Effort:** 8 hours

### QA-11.4: Admin Tests
- **Test Scenarios:**
  1. Video series CRUD in admin panel
  2. Video CRUD with all fields
  3. Drag-and-drop reorder in series
  4. Bulk status change
  5. Homepage curation: add item to section
  6. Homepage curation: remove item
  7. Homepage curation: reorder items
  8. Homepage curation: override fields
  9. Homepage curation: schedule item
  10. Homepage curation: active/inactive toggle
  11. Non-admin access blocked
- **Effort:** 5 hours

### QA-11.5: Performance Tests
- **Test Scenarios:**
  1. Homepage loads < 2s on 3G throttle
  2. Homepage aggregation API responds < 200ms (cached)
  3. Video detail page loads < 3s
  4. Below-fold sections lazy load correctly
  5. Images load progressively (blur placeholder to full)
- **Effort:** 3 hours

### QA-11.6: Cross-Browser Testing
- **Test Scenarios:**
  1. Video embed playback in Chrome, Firefox, Safari, Edge
  2. Homepage carousel on all browsers
  3. Mobile carousel touch/swipe
  4. iOS Safari video embed behavior
- **Effort:** 3 hours

**Total QA Effort:** 28 hours

---

## Dependencies

| Blocked Task | Depends On | Notes |
|---|---|---|
| BE-11.4 (Homepage Aggregation) | Events API (Sprint 7), Dining API (Sprint 9), Articles API (Sprint 5-6) | Must query from existing content modules |
| BE-11.4 (Homepage Aggregation) | BE-11.2 (Videos Module) | Videos section needs video data |
| FE-11.4 (Hero Carousel) | BE-11.4 (Homepage Aggregation) | Needs hero items data |
| FE-11.5 (Homepage Sections) | BE-11.4 (Homepage Aggregation) | Needs all section data |
| FE-11.1 (Video Landing) | BE-11.2 (Videos Module) | Needs video list API |
| FE-11.2 (Video Detail) | BE-11.2 (Videos Module) | Needs video detail API |
| FE-11.7 (Admin Video) | BE-11.1, BE-11.2 (Video CRUD) | Needs admin video endpoints |
| FE-11.8 (Admin Curation) | BE-11.5 (Curation Endpoints) | Needs curation API |
| Homepage competitions section | Competitions module (Sprint 12) | Placeholder data until Sprint 12 |
| Homepage classifieds section | Classifieds module (Sprint 13-14) | Placeholder data until Sprint 14 |

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Homepage aggregation query performance (multiple tables) | High | High | Use Redis caching (5-min TTL); optimize individual queries; consider parallel query execution |
| Video embed cross-origin issues | Medium | Medium | Use official embed URLs (youtube.com/embed, player.vimeo.com); test CSP headers |
| Hero carousel accessibility | Medium | Medium | Follow WAI-ARIA carousel pattern; pause on focus; provide skip link |
| Homepage complexity (8 sections) | High | Medium | Build sections independently; test each in isolation; lazy load below-fold |
| Competition/Classified sections without data | Low | Low | Auto-populate with placeholder or hide section if no data |
| Cache invalidation consistency | Medium | Medium | Invalidate on all curation writes; add manual cache-clear admin button |

---

## Deliverables Checklist

- [ ] `video_series` table and entity
- [ ] `videos` table and entity
- [ ] `video_tags` junction table
- [ ] `homepage_featured` table and entity
- [ ] Video series CRUD API (public + admin)
- [ ] Videos CRUD API with filters, pagination, view count
- [ ] Homepage aggregation endpoint (cached)
- [ ] Homepage curation endpoints (add, remove, reorder, override, schedule)
- [ ] Auto-populate fallback for homepage sections
- [ ] Video landing page with featured hero and grid
- [ ] Video detail page with embedded player
- [ ] Video series page
- [ ] Homepage hero carousel
- [ ] Homepage trending section
- [ ] Homepage events section
- [ ] Homepage weekend picks section
- [ ] Homepage dining section
- [ ] Homepage videos section
- [ ] Homepage competitions section (placeholder-ready)
- [ ] Homepage classifieds section (placeholder-ready)
- [ ] Admin video series management
- [ ] Admin video management with bulk actions
- [ ] Admin homepage curation dashboard
- [ ] Responsive design for all pages
- [ ] Performance optimized (homepage LCP < 2s)
- [ ] Sample video data seeded
- [ ] Test suites passing

---

## Definition of Done

- [ ] All user stories meet their acceptance criteria
- [ ] Video pages render server-side for SEO
- [ ] Homepage renders server-side with all sections populated
- [ ] Homepage loads within 2 seconds (LCP) on standard connection
- [ ] Homepage aggregation API responds < 200ms from cache
- [ ] Video embeds play correctly on all supported browsers
- [ ] Hero carousel is accessible (keyboard navigation, pause on focus)
- [ ] Admin curation changes reflect on homepage within 5 minutes
- [ ] Below-fold homepage sections lazy load correctly
- [ ] All sections handle empty data gracefully
- [ ] Responsive design verified at all breakpoints
- [ ] Cross-browser testing complete with no P1 bugs
- [ ] Code reviewed and merged to main branch

---

## Sprint Review Demo Script

1. **Video Landing Page (2 min)**
   - Open `/videos` and show featured video hero
   - Browse video grid with cards (thumbnails, series names, durations)
   - Filter by a video series
   - Show pagination

2. **Video Detail Page (2 min)**
   - Click a video card to open detail
   - Play embedded video (YouTube/Vimeo)
   - Show video info, tags, series link
   - Scroll to "More from this series" and "Related videos"
   - Show share buttons

3. **Video Series Page (1 min)**
   - Navigate to a series page
   - Show series description and video list in order

4. **Homepage (5 min)**
   - Navigate to homepage
   - Walk through hero carousel: auto-advance, manual navigation with arrows and dots
   - Trending section: article cards
   - Events section: upcoming events with dates
   - Weekend Picks section
   - Dining section: restaurants and offers
   - Videos section: video cards with play overlay
   - Competitions section (placeholder or active)
   - Classifieds section (placeholder or recent)
   - Click "View all" links to verify navigation

5. **Admin Video Management (2 min)**
   - Open admin panel, navigate to videos
   - Create a new video with YouTube URL
   - Assign to a series, add tags
   - Drag to reorder within series

6. **Admin Homepage Curation (3 min)**
   - Open admin curation dashboard
   - View current hero section items
   - Add a new item using entity search (e.g., add an event to hero)
   - Override title and subtitle
   - Set schedule (start/end dates)
   - Drag to reorder items
   - Show change reflected on homepage (after cache refresh)

7. **Performance (1 min)**
   - Show Lighthouse score for homepage
   - Demonstrate lazy loading of below-fold sections
   - Show cached vs uncached API response times

---

## Rollover Criteria

A story or task rolls over to Sprint 12 if:
- Homepage aggregation performance cannot be resolved within the sprint
- Video embed integration has cross-origin issues requiring CSP changes
- Admin curation complexity exceeds estimated effort by >50%
- Critical bugs in existing modules (events, dining) pull resources away

**Candidates for rollover (if needed):**
1. Homepage competitions section (Sprint 12 will build the full module)
2. Homepage classifieds section (Sprint 13-14 will build the full module)
3. Admin homepage preview functionality (curation can be verified by refreshing homepage)
4. Video view count analytics (basic increment can suffice initially)
