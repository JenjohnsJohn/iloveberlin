# Sprint 6: Guides & Topic Pages

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Sprint Number**  | 6                                              |
| **Sprint Name**    | Guides & Topic Pages                           |
| **Duration**       | 2 weeks (10 working days)                      |
| **Dates**          | Week 11 -- Week 12 (Days 51--60 from project start) |
| **Team**           | 1 Backend, 1 Frontend, 1 DevOps / Infra        |

---

## Sprint Goal

> Build the guides content type -- long-form, evergreen reference content with auto-generated table of contents, topic-based navigation, and last-reviewed tracking -- giving users a comprehensive resource for living in and visiting Berlin. Deliver both the public reading experience and admin management interface.

---

## User Stories

### US-6.1 -- Guide Topics Data Model & Seed
**As a** developer,
**I want** a `guide_topics` table seeded with Berlin-relevant topics,
**so that** guides can be organized into meaningful categories.

**Acceptance Criteria:**
- [ ] `guide_topics` table: id (UUID), name, slug (unique), description, icon, display_order, is_active, created_at, updated_at
- [ ] Seed data: Moving to Berlin, Visa & Bureaucracy, Housing, Transportation, Healthcare, Banking & Finance, Working, Studying, Food & Dining, Nightlife & Culture, Neighborhoods, Practical Tips
- [ ] Topics are flat (no hierarchy, unlike article categories)
- [ ] Each topic has a distinct icon identifier

### US-6.2 -- Guides Data Model
**As a** developer,
**I want** a `guides` table with support for long-form content and review tracking,
**so that** the schema supports all planned guide features.

**Acceptance Criteria:**
- [ ] `guides` table: id (UUID), title, slug (unique), excerpt, content (HTML), topic_id (FK guide_topics), author_id (FK users), featured_image_id (FK media), status (enum: draft, in_review, published, archived), table_of_contents (JSONB), read_time_minutes, meta_title, meta_description, last_reviewed_at, last_reviewed_by (FK users), published_at, view_count, created_at, updated_at, deleted_at
- [ ] Table of contents JSON structure: `[{ id, text, level, children: [...] }]`
- [ ] Guides support the same bookmark system as articles (polymorphic `user_bookmarks`)

### US-6.3 -- Guide Module CRUD API
**As an** editor,
**I want** full CRUD operations for guides,
**so that** I can create and manage guide content.

**Acceptance Criteria:**
- [ ] `POST /api/admin/guides` -- create guide (editor+)
- [ ] `GET /api/admin/guides` -- list with pagination, filters (status, topic, author)
- [ ] `GET /api/admin/guides/:id` -- get full guide with relations
- [ ] `PATCH /api/admin/guides/:id` -- update guide fields
- [ ] `DELETE /api/admin/guides/:id` -- soft delete (admin only)
- [ ] Same status workflow as articles (draft -> in_review -> published -> archived)
- [ ] Slug auto-generated from title with conflict resolution
- [ ] Read time auto-calculated from content word count

### US-6.4 -- Table of Contents Auto-Generation
**As a** system,
**I want** to automatically generate a table of contents from guide headings,
**so that** readers can navigate long-form content easily.

**Acceptance Criteria:**
- [ ] Parse HTML content on save, extract H2 and H3 headings
- [ ] Generate unique IDs for each heading (slugified heading text)
- [ ] Build nested ToC: H2 as top level, H3 as children
- [ ] Inject `id` attributes into headings in the content HTML
- [ ] Store ToC as JSONB in `table_of_contents` column
- [ ] ToC regenerated on every content update
- [ ] Handle duplicate heading text (append `-2`, `-3`)

### US-6.5 -- Last-Reviewed Tracking
**As an** editor,
**I want** to mark guides as reviewed and track review dates,
**so that** readers know the content is up to date.

**Acceptance Criteria:**
- [ ] `POST /api/admin/guides/:id/mark-reviewed` -- sets last_reviewed_at and last_reviewed_by
- [ ] "Last reviewed" date displayed on guide detail page
- [ ] Admin can filter guides by "needs review" (last_reviewed_at > 90 days ago or null)
- [ ] Dashboard widget: "Guides needing review" count

### US-6.6 -- Guide Landing Page
**As a** visitor,
**I want** a guides landing page showing all topics with their guides,
**so that** I can find the reference content I need.

**Acceptance Criteria:**
- [ ] Route: `/guides`
- [ ] Hero section with page title, description ("Your guide to living in Berlin")
- [ ] Topic grid: cards with icon, name, description, guide count
- [ ] Each card links to topic page
- [ ] Featured/popular guides section below topics
- [ ] SSR with meta tags
- [ ] Responsive: 3 columns desktop, 2 tablet, 1 mobile

### US-6.7 -- Topic Page
**As a** visitor,
**I want** to see all guides within a specific topic,
**so that** I can explore a subject area comprehensively.

**Acceptance Criteria:**
- [ ] Route: `/guides/:topicSlug`
- [ ] Topic header: name, description, icon, guide count
- [ ] Guide list: cards with featured image, title, excerpt, last reviewed date, read time
- [ ] Sorted by display_order (curated) then published_at
- [ ] Breadcrumbs: Home > Guides > [Topic Name]
- [ ] SSR with topic-specific meta tags

### US-6.8 -- Guide Detail Page
**As a** reader,
**I want** to read a guide with a sticky table of contents for easy navigation,
**so that** I can quickly find the section I need in long-form content.

**Acceptance Criteria:**
- [ ] Route: `/guides/:topicSlug/:guideSlug`
- [ ] Layout: content area (left/center) + ToC sidebar (right on desktop)
- [ ] ToC sidebar: sticky, highlights current section on scroll (scroll-spy)
- [ ] ToC collapses to a dropdown on mobile (top of content)
- [ ] Click ToC item scrolls to section with smooth animation and URL hash update
- [ ] Content rendering: same as article detail (headings, lists, images, embeds)
- [ ] "Last reviewed: [date] by [reviewer]" badge
- [ ] Author info, published date, read time
- [ ] Breadcrumbs: Home > Guides > [Topic] > [Guide Title]
- [ ] View tracking on page load
- [ ] Bookmark button

### US-6.9 -- Cross-Linking & Structured Data
**As a** product owner,
**I want** guides and articles to cross-reference each other with proper structured data,
**so that** users discover related content and search engines understand the content relationship.

**Acceptance Criteria:**
- [ ] "Related Articles" section at bottom of guide detail (articles sharing topic keywords)
- [ ] "Related Guides" section at bottom of article detail (guides in matching topic)
- [ ] JSON-LD `HowTo` or `Article` structured data on guide pages
- [ ] Open Graph + Twitter Card meta tags on guide pages
- [ ] Canonical URLs on all guide pages
- [ ] Sitemap includes guide pages

### US-6.10 -- Admin Guide Management
**As an** editor,
**I want** admin pages for managing guides and topics,
**so that** I can create and maintain guide content.

**Acceptance Criteria:**
- [ ] Guide list page: table with title, topic, author, status, last reviewed, views, actions
- [ ] Filters: status, topic, author, "needs review" toggle
- [ ] Guide create/edit page: same layout as article editor (title, slug, excerpt, topic select, featured image, TipTap editor, meta fields)
- [ ] ToC preview panel (shows auto-generated ToC)
- [ ] "Mark as Reviewed" button on edit page
- [ ] Topic management page: list, create, edit, reorder, activate/deactivate

---

## Day-by-Day Task Breakdown

### Week 1 (Days 51--55)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **51** | B-6.1 Create `guide_topics` migration + seed data | F-6.1 Admin topic management page (list, create, edit, reorder) | -- |
| **52** | B-6.2 Create `guides` migration + entity | F-6.2 Admin guide list page (table, filters, pagination) | -- |
| **53** | B-6.3 GuideModule scaffold, CRUD endpoints | F-6.3 Admin guide create/edit page (form fields + TipTap) | -- |
| **54** | B-6.4 Table of contents auto-generation from HTML | F-6.4 Admin guide: ToC preview panel, mark-reviewed button | -- |
| **55** | B-6.5 Guide topic CRUD + public endpoints | F-6.5 Guide landing page: topic grid + featured guides | D-6.1 Add guide pages to sitemap |

### Week 2 (Days 56--60)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **56** | B-6.6 Last-reviewed tracking + needs-review filter | F-6.6 Topic page: guide list with cards | -- |
| **57** | B-6.7 Public guide endpoints (list, detail) | F-6.7 Guide detail page: content + ToC sidebar | -- |
| **58** | B-6.8 Cross-linking: related articles/guides queries | F-6.8 Scroll-spy + sticky ToC + mobile ToC dropdown | -- |
| **59** | B-6.9 Guide structured data + view tracking | F-6.9 Structured data, OG tags, cross-linking sections | D-6.2 Deploy guides to staging |
| **60** | QA-6.1 -- QA-6.4 Backend tests | QA-6.5 -- QA-6.8 Frontend + responsive tests | QA-6.9 SEO + performance validation |

---

## Backend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| B-6.1 | Guide topics table + seed | - Migration: id, name, slug, description, icon, display_order, is_active, created_at, updated_at | 3 h |
|        |  | - GuideTopic entity with TypeORM decorators | |
|        |  | - Seed migration: 12 default topics with icons | |
| B-6.2 | Guides table + entity | - Migration: id, title, slug, excerpt, content, topic_id (FK), author_id (FK), featured_image_id (FK), status, table_of_contents (JSONB), read_time_minutes, meta_title, meta_description, last_reviewed_at, last_reviewed_by (FK), published_at, view_count, created_at, updated_at, deleted_at | 3 h |
|        |  | - Guide entity with relations (ManyToOne topic, ManyToOne author, ManyToOne featured_image) | |
|        |  | - Indexes on slug, status, topic_id, published_at | |
| B-6.3 | Guide CRUD endpoints | - `POST /api/admin/guides` -- create with ToC generation | 5 h |
|        |  | - `GET /api/admin/guides` -- paginated list with filters (status, topic, author, needs_review) | |
|        |  | - `GET /api/admin/guides/:id` -- full guide with relations | |
|        |  | - `PATCH /api/admin/guides/:id` -- update, regenerate ToC on content change | |
|        |  | - `DELETE /api/admin/guides/:id` -- soft delete (admin) | |
|        |  | - DTOs with validation, reuse status workflow from articles | |
| B-6.4 | ToC auto-generation | - HTML parser: extract H2 and H3 elements from content | 4 h |
|        |  | - Generate slug IDs for each heading (e.g., `finding-an-apartment`) | |
|        |  | - Handle duplicates: append `-2`, `-3` to IDs | |
|        |  | - Build nested structure: H2 as parents, H3 as children | |
|        |  | - Inject `id` attributes into heading elements in content HTML | |
|        |  | - Store ToC JSON in `table_of_contents` column | |
|        |  | - Service method: `generateTableOfContents(html: string): { toc: TocEntry[], updatedHtml: string }` | |
| B-6.5 | Topic CRUD + public endpoints | - `GET /api/guide-topics` -- list active topics with guide count (public) | 3 h |
|        |  | - `POST /api/admin/guide-topics` -- create (admin) | |
|        |  | - `PATCH /api/admin/guide-topics/:id` -- update (admin) | |
|        |  | - `PATCH /api/admin/guide-topics/reorder` -- reorder (admin) | |
|        |  | - `DELETE /api/admin/guide-topics/:id` -- deactivate (admin, fail if has guides) | |
| B-6.6 | Last-reviewed tracking | - `POST /api/admin/guides/:id/mark-reviewed` -- set last_reviewed_at = NOW, last_reviewed_by = currentUser | 2 h |
|        |  | - Filter: `needs_review` = true when last_reviewed_at is null or > 90 days ago | |
|        |  | - Dashboard endpoint: count of guides needing review | |
| B-6.7 | Public guide endpoints | - `GET /api/guides` -- list published guides with topic filter, pagination | 3 h |
|        |  | - `GET /api/guides/:topicSlug` -- list published guides for a topic | |
|        |  | - `GET /api/guides/:topicSlug/:guideSlug` -- single published guide with full content, ToC, relations | |
|        |  | - Include `is_bookmarked` for authenticated users | |
| B-6.8 | Cross-linking queries | - Related articles for a guide: match by topic keywords in article categories/tags | 3 h |
|        |  | - Related guides for an article: match by article category to guide topic | |
|        |  | - `GET /api/guides/:topicSlug/:guideSlug/related-articles?limit=4` | |
|        |  | - `GET /api/articles/:slug/related-guides?limit=3` | |
| B-6.9 | Structured data + views | - Guide view tracking (same pattern as articles) | 2 h |
|        |  | - Add guide URLs to sitemap generation | |

**Backend Total: 28 hours**

---

## Frontend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| F-6.1 | Admin topic management | - Topic list table: name, slug, icon, guide count, order, active status | 3 h |
|        |  | - Create/edit modal: name, description, icon selector, active toggle | |
|        |  | - Drag-and-drop reorder (reuse from category management) | |
| F-6.2 | Admin guide list | - Data table: title, topic, author, status badge, last reviewed, views, actions | 3 h |
|        |  | - Filters: status dropdown, topic dropdown, author, "needs review" toggle | |
|        |  | - Sorting by columns | |
|        |  | - "New Guide" button | |
| F-6.3 | Admin guide form | - Reuse article form pattern: title, slug, excerpt, topic select, featured image, TipTap editor | 4 h |
|        |  | - Meta fields panel (meta_title, meta_description) | |
|        |  | - Status workflow buttons (same as articles) | |
|        |  | - Save draft, auto-save indicator | |
| F-6.4 | Admin guide extras | - ToC preview panel: rendered table of contents (updates on save) | 3 h |
|        |  | - "Mark as Reviewed" button with confirmation + last reviewed display | |
|        |  | - Preview button (opens public view) | |
| F-6.5 | Guide landing page | - Route `/guides` with SSR | 5 h |
|        |  | - Hero: title "Berlin Guides", description, search bar (future) | |
|        |  | - Topic grid: cards with icon, name, description, guide count | |
|        |  | - Each card links to `/guides/:topicSlug` | |
|        |  | - Featured guides section: 3--4 highlighted guides | |
|        |  | - Meta tags, responsive design | |
| F-6.6 | Topic page | - Route `/guides/:topicSlug` with SSR | 4 h |
|        |  | - Topic header: icon, name, description, guide count | |
|        |  | - Guide cards: featured image, title, excerpt, last reviewed, read time | |
|        |  | - Breadcrumbs: Home > Guides > [Topic] | |
|        |  | - Empty state if no guides in topic | |
| F-6.7 | Guide detail page | - Route `/guides/:topicSlug/:guideSlug` with SSR | 6 h |
|        |  | - Two-column layout: content (left/center 70%), ToC (right 30%) | |
|        |  | - Content rendering (same as article detail) | |
|        |  | - Author info, published date, read time | |
|        |  | - "Last reviewed: [date] by [reviewer]" badge | |
|        |  | - Bookmark button, social sharing | |
|        |  | - Breadcrumbs: Home > Guides > [Topic] > [Guide] | |
|        |  | - View tracking on load | |
| F-6.8 | Scroll-spy + ToC | - Sticky ToC sidebar: fixed position on scroll (respects header height) | 5 h |
|        |  | - Scroll-spy: IntersectionObserver on each heading, highlight active ToC item | |
|        |  | - Smooth scroll to section on ToC item click | |
|        |  | - URL hash update on scroll (without triggering re-render) | |
|        |  | - Mobile: collapsible dropdown ToC at top of content | |
|        |  | - Mobile ToC: current section displayed, tap to expand | |
| F-6.9 | Structured data + cross-links | - JSON-LD for guide pages (`Article` or `HowTo` type) | 4 h |
|        |  | - Open Graph + Twitter Card meta tags | |
|        |  | - Canonical URLs | |
|        |  | - "Related Articles" section below guide content | |
|        |  | - "Related Guides" section on article detail page | |
|        |  | - Cross-link card component (compact variant of article/guide card) | |

**Frontend Total: 37 hours**

---

## DevOps / Infrastructure Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| D-6.1 | Sitemap update | - Add guide pages to sitemap generation | 1 h |
|        |  | - Add topic pages to sitemap | |
| D-6.2 | Staging deployment | - Deploy guide features to staging | 1 h |
|        |  | - Verify ToC rendering and scroll-spy on staging | |

**DevOps Total: 2 hours**

---

## QA Tasks

| ID | Test Scenario | Type | Estimate |
| -- | ------------- | ---- | -------- |
| QA-6.1 | Guide CRUD: create, update, list with filters, soft delete | Integration | 2 h |
| QA-6.2 | ToC generation: H2/H3 extraction, nested structure, duplicate handling, ID injection | Unit | 2 h |
| QA-6.3 | Last-reviewed: mark reviewed, filter needs-review (> 90 days) | Integration | 1 h |
| QA-6.4 | Topic CRUD + public endpoints: list with guide counts, reorder | Integration | 1 h |
| QA-6.5 | Guide landing page: topic grid loads, links work, SSR correct | E2E | 2 h |
| QA-6.6 | Topic page: guides listed, breadcrumbs, empty state | E2E | 1 h |
| QA-6.7 | Guide detail: ToC renders, scroll-spy highlights correctly, smooth scroll | E2E | 2 h |
| QA-6.8 | Mobile ToC: dropdown works, current section displayed | E2E (mobile viewport) | 1 h |
| QA-6.9 | SEO: structured data validates, meta tags present, sitemap includes guides | Manual + tool | 1 h |
| QA-6.10 | Cross-linking: related articles appear on guide, related guides on article | E2E | 1 h |
| QA-6.11 | Responsive: guide detail at all breakpoints, ToC transitions desktop/mobile | Visual | 1 h |

**QA Total: 15 hours**

---

## Dependencies

```
Sprint 5 (complete) -- public article pages, SEO patterns, article card component
 +-- F-6.9 (Cross-linking) -- article detail page must support "Related Guides" section
 +-- F-6.7 (Guide detail) -- reuse content rendering from article detail

Sprint 3 (complete) -- TipTap editor, media library, admin layout
 +-- F-6.3 (Admin guide form) -- reuse TipTap, media picker, admin layout

Sprint 4 (complete) -- bookmarks API, status workflow
 +-- B-6.3 (Guide CRUD) -- reuse status workflow pattern
 +-- US-6.2 -- reuse polymorphic bookmarks (bookmarkable_type = 'guide')

B-6.1 (Topics table)
 +-- B-6.5 (Topic CRUD) -- depends on topics table
 +-- B-6.2 (Guides table) -- depends on topics table (FK)
      +-- B-6.3 (Guide CRUD) -- depends on guides entity
      |    +-- B-6.4 (ToC generation) -- integrated into create/update
      |    +-- B-6.6 (Last-reviewed) -- depends on guide entity
      +-- B-6.7 (Public endpoints) -- depends on guide entity
           +-- F-6.5 (Landing page) -- depends on public topics + guides list
           +-- F-6.6 (Topic page) -- depends on public guides by topic
           +-- F-6.7 (Guide detail) -- depends on public guide detail
                +-- F-6.8 (Scroll-spy) -- depends on guide detail page structure
      +-- B-6.8 (Cross-linking) -- depends on guides + articles

F-6.1 (Topic admin) -- depends on B-6.5
F-6.2 (Guide admin list) -- depends on B-6.3
F-6.3 (Guide form) -- depends on B-6.3 + Sprint 3 TipTap
```

---

## Risk Items

| # | Risk | Likelihood | Impact | Mitigation |
| - | ---- | ---------- | ------ | ---------- |
| R-1 | Scroll-spy inaccuracy with dynamic content heights (images loading) | High | Medium | Use ResizeObserver + recalculate on image load; debounce scroll events |
| R-2 | ToC generation edge cases (empty headings, deeply nested, HTML entities) | Medium | Medium | Comprehensive unit tests with edge cases; sanitize heading text |
| R-3 | Sticky sidebar overlapping footer on short guides | Medium | Low | Calculate sidebar height, stop sticky before footer; Intersection Observer on footer |
| R-4 | Cross-linking query performance (topic keyword matching) | Low | Medium | Use simple category-to-topic mapping rather than keyword search; index appropriately |
| R-5 | Mobile ToC dropdown z-index conflicts | Low | Low | Use proper stacking context; test on real devices |
| R-6 | Reusing article patterns (editor, status) may reveal hidden coupling | Medium | Medium | Extract shared components early; use composition over inheritance |

---

## Deliverables Checklist

- [ ] `guide_topics` table with 12 seeded topics
- [ ] `guides` table with all required columns
- [ ] Guide topic CRUD API with reordering
- [ ] Guide CRUD API with pagination, filtering, status workflow
- [ ] Table of contents auto-generation from H2/H3 headings
- [ ] Last-reviewed tracking with mark-reviewed endpoint
- [ ] Needs-review filter (> 90 days or never reviewed)
- [ ] Public guide endpoints (list, by topic, detail)
- [ ] Cross-linking queries (related articles on guides, related guides on articles)
- [ ] Guide view tracking
- [ ] Admin topic management page with drag-and-drop reorder
- [ ] Admin guide list page with filters (status, topic, needs review)
- [ ] Admin guide create/edit page with TipTap editor
- [ ] Admin guide: ToC preview panel and mark-reviewed button
- [ ] Guide landing page (`/guides`) with topic grid
- [ ] Topic page (`/guides/:topicSlug`) with guide list
- [ ] Guide detail page with content rendering and author info
- [ ] Sticky ToC sidebar with scroll-spy (desktop)
- [ ] Collapsible ToC dropdown (mobile)
- [ ] JSON-LD structured data on guide pages
- [ ] Open Graph + Twitter Card meta tags
- [ ] Sitemap includes guide and topic pages
- [ ] Cross-linking sections on guide and article detail pages
- [ ] Responsive design across all breakpoints
- [ ] All tests passing in CI

---

## Definition of Done

1. All acceptance criteria for US-6.1 through US-6.10 are met
2. Guide landing, topic, and detail pages fully functional with SSR
3. Table of contents auto-generated correctly for various heading structures
4. Scroll-spy accurately highlights current section on desktop
5. Mobile ToC dropdown works correctly on iOS Safari and Android Chrome
6. Last-reviewed tracking functional with needs-review filtering
7. Cross-linking between guides and articles working in both directions
8. All SEO elements present and validated (structured data, meta tags, sitemap)
9. Admin guide management fully functional (create, edit, status workflow)
10. All tests (unit + integration + E2E) passing in CI
11. Swagger docs updated for all guide endpoints
12. Lighthouse scores maintained (Performance >= 90, Accessibility >= 95)
13. Deployed and verified on staging

---

## Sprint Review Demo Script

1. **Admin topic management** (1 min) -- Create a topic, reorder topics, show seed data
2. **Admin guide creation** (3 min) -- Create new guide: title, topic, content with multiple H2/H3 headings, featured image
3. **ToC preview** (1 min) -- Show auto-generated ToC in admin preview panel
4. **Mark as reviewed** (1 min) -- Click "Mark as Reviewed", show last_reviewed_at updated
5. **Needs review filter** (1 min) -- Filter guides needing review in admin list
6. **Guide landing page** (2 min) -- Open `/guides`, browse topic grid, show featured guides
7. **Topic page** (1 min) -- Click topic, show guides list, breadcrumbs
8. **Guide detail + ToC** (3 min) -- Open guide, demonstrate scroll-spy highlighting, click ToC items for smooth scroll, show URL hash updates
9. **Mobile ToC** (1 min) -- Switch to mobile viewport, show collapsible dropdown ToC
10. **Cross-linking** (1 min) -- Show related articles on guide, related guides on an article
11. **SEO** (1 min) -- View page source for JSON-LD, check structured data
12. **Q&A** (3 min)

**Total demo time: ~19 minutes**

---

## Rollover Criteria

A task may roll over to Sprint 7 only if ALL of the following are true:

1. Guide CRUD and public pages are functional
2. ToC generation and basic ToC rendering work
3. At least 80% of story points completed
4. The rollover does not block Sprint 7 events work

**Candidates for rollover (if needed):**
- F-6.8 Scroll-spy (static ToC without auto-highlight is acceptable temporarily)
- B-6.8 Cross-linking (nice-to-have, can be added later)
- F-6.9 Structured data for guides (can use Article type initially)
- QA-6.8 Mobile ToC testing (can test manually)

**Must NOT roll over:**
- Guide topics table + seed (foundational data)
- Guide CRUD API (blocks admin usage)
- ToC auto-generation (core differentiator from articles)
- Guide landing + topic + detail pages (core user-facing feature)
- Admin guide management pages (blocks editorial workflow)
