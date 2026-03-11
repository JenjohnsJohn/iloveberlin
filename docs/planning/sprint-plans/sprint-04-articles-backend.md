# Sprint 4: Articles Backend & Admin

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Sprint Number**  | 4                                              |
| **Sprint Name**    | Articles Backend & Admin                       |
| **Duration**       | 2 weeks (10 working days)                      |
| **Dates**          | Week 7 -- Week 8 (Days 31--40 from project start) |
| **Team**           | 1 Backend, 1 Frontend, 1 DevOps / Infra        |

---

## Sprint Goal

> Build the complete articles data model, backend API, and admin management interface -- including the full content lifecycle (draft through archive), revision tracking, scheduling, and bookmarks -- so that editors can create, manage, and publish articles through the admin panel.

---

## User Stories

### US-4.1 -- Article Data Model
**As a** developer,
**I want** a robust articles schema with support for tags, revisions, and bookmarks,
**so that** the data layer supports all planned article features.

**Acceptance Criteria:**
- [ ] `articles` table: id, title, slug (unique), excerpt, content (HTML), featured_image_id (FK media), category_id (FK), author_id (FK users), status (enum), published_at, scheduled_at, view_count, read_time_minutes, meta_title, meta_description, created_at, updated_at, deleted_at
- [ ] `article_tags` junction table: article_id, tag_id (composite PK)
- [ ] `article_revisions` table: id, article_id (FK), content, title, revised_by (FK users), revision_number, created_at
- [ ] `user_bookmarks` table: id, user_id (FK), bookmarkable_type (polymorphic), bookmarkable_id, created_at
- [ ] All foreign keys have appropriate indexes
- [ ] Status enum: `draft`, `in_review`, `scheduled`, `published`, `archived`

### US-4.2 -- Article CRUD API
**As an** editor,
**I want** full CRUD operations for articles,
**so that** I can create, update, and manage article content.

**Acceptance Criteria:**
- [ ] `POST /api/admin/articles` -- create article (editor+)
- [ ] `GET /api/admin/articles` -- list with pagination, filters (status, category, author, date range)
- [ ] `GET /api/admin/articles/:id` -- get full article with relations
- [ ] `PATCH /api/admin/articles/:id` -- update article fields
- [ ] `DELETE /api/admin/articles/:id` -- soft delete (admin only)
- [ ] Slug auto-generated from title; conflict appends `-2`, `-3`, etc.
- [ ] Read time auto-calculated from content word count (avg 200 words/min)
- [ ] Tags attached/detached via article update payload

### US-4.3 -- Article Status Workflow
**As an** editor,
**I want** a clear content workflow with status transitions,
**so that** articles go through review before publishing.

**Acceptance Criteria:**
- [ ] Valid transitions: draft -> in_review -> scheduled/published; in_review -> draft (reject); scheduled -> published (auto); published -> archived; archived -> draft (re-open)
- [ ] Invalid transitions return 422 with allowed transitions
- [ ] `PATCH /api/admin/articles/:id/status` -- change status (with transition validation)
- [ ] Status change emits event (for future notifications)
- [ ] Only admin can publish directly (skip in_review)

### US-4.4 -- Article Scheduling
**As an** editor,
**I want** to schedule articles for future publication,
**so that** content goes live at the right time without manual intervention.

**Acceptance Criteria:**
- [ ] Setting status to `scheduled` requires `scheduled_at` in the future
- [ ] Cron job runs every minute, publishes articles where `scheduled_at <= now`
- [ ] On publish: set status to `published`, set `published_at` to `scheduled_at`
- [ ] Scheduled articles visible in admin with countdown timer
- [ ] Cancelling a scheduled article returns it to `in_review`

### US-4.5 -- Revision Tracking
**As an** editor,
**I want** article revisions tracked automatically,
**so that** I can view history and revert to previous versions.

**Acceptance Criteria:**
- [ ] Every save creates a new revision with title, content, revised_by, revision_number
- [ ] `GET /api/admin/articles/:id/revisions` -- list revisions (newest first)
- [ ] `GET /api/admin/articles/:id/revisions/:revisionId` -- get specific revision content
- [ ] `POST /api/admin/articles/:id/revisions/:revisionId/restore` -- restore article to revision content
- [ ] Revisions are immutable (never updated or deleted)
- [ ] Maximum 50 revisions per article (oldest auto-pruned)

### US-4.6 -- Article View Count
**As a** product owner,
**I want** to track how many times each article is viewed,
**so that** I can measure content performance.

**Acceptance Criteria:**
- [ ] View count incremented on each unique visit (debounced by IP + article, 1 hour window)
- [ ] View count endpoint: `POST /api/articles/:slug/view`
- [ ] View counts visible in admin article list
- [ ] Sortable by view count in admin

### US-4.7 -- Related Articles
**As a** reader,
**I want** to see related articles,
**so that** I can discover more content on topics I care about.

**Acceptance Criteria:**
- [ ] `GET /api/articles/:slug/related` -- returns up to 4 related articles
- [ ] Relation based on: same category (weight 3), shared tags (weight 2), recent (weight 1)
- [ ] Excludes the current article and unpublished articles
- [ ] Results scored and sorted by relevance weight

### US-4.8 -- Bookmarks
**As a** logged-in user,
**I want** to bookmark articles,
**so that** I can save content to read later.

**Acceptance Criteria:**
- [ ] `POST /api/bookmarks` -- add bookmark (type + id)
- [ ] `DELETE /api/bookmarks/:id` -- remove bookmark
- [ ] `GET /api/bookmarks?type=article` -- list user's bookmarks with pagination
- [ ] Polymorphic: same table supports articles, guides, events (future)
- [ ] Duplicate bookmark returns 409
- [ ] Bookmark status included in article responses when user authenticated

### US-4.9 -- Admin Article Management Pages
**As an** editor,
**I want** admin pages for managing articles,
**so that** I can create, edit, and manage the article lifecycle visually.

**Acceptance Criteria:**
- [ ] Article list page: table with title, category, author, status badge, views, date, actions
- [ ] Filters: status dropdown, category dropdown, author dropdown, date range picker
- [ ] Sorting: by date, views, title
- [ ] Create/edit article page: title, slug (auto + manual), excerpt, category select, tag multi-select, featured image picker, TipTap editor for content, meta fields (SEO)
- [ ] Status workflow buttons: "Submit for Review", "Approve & Publish", "Schedule", "Archive"
- [ ] Revision history sidebar: list of revisions with "Restore" button
- [ ] Preview button: opens article in new tab with draft preview

---

## Day-by-Day Task Breakdown

### Week 1 (Days 31--35)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **31** | B-4.1 Create `articles`, `article_tags`, `article_revisions`, `user_bookmarks` migrations | F-4.1 Admin article list page (table, pagination) | -- |
| **32** | B-4.2 Article entity + relations, ArticleModule scaffold | F-4.2 Article list: filters (status, category, author) + sorting | -- |
| **33** | B-4.3 Article CRUD endpoints (create, read, update, delete) | F-4.3 Article create/edit page: form fields (title, slug, excerpt, category, tags) | -- |
| **34** | B-4.4 Slug generation with conflict resolution | F-4.4 Article create/edit page: TipTap editor integration, featured image picker | -- |
| **35** | B-4.5 Status workflow engine + transition validation | F-4.5 Status workflow UI: buttons, confirmation dialogs, status badges | D-4.1 Set up cron job infrastructure (NestJS @Cron) |

### Week 2 (Days 36--40)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **36** | B-4.6 Scheduling cron job (publish scheduled articles) | F-4.6 Scheduling UI: date/time picker, countdown display | -- |
| **37** | B-4.7 Revision tracking (auto-save, list, get, restore) | F-4.7 Revision history sidebar (list, diff view, restore) | -- |
| **38** | B-4.8 View count tracking (debounced by IP) | F-4.8 SEO meta fields panel (meta_title, meta_description) | -- |
| **39** | B-4.9 Related articles algorithm + bookmarks CRUD | F-4.9 Preview button, article preview page (draft rendering) | D-4.2 Deploy articles to staging |
| **40** | QA-4.1 -- QA-4.5 Backend tests | QA-4.6 -- QA-4.9 Frontend tests | QA-4.10 Integration test: full lifecycle |

---

## Backend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| B-4.1 | Database migrations | - `articles` table with all columns, indexes on slug, status, category_id, author_id, published_at | 4 h |
|        |  | - `article_tags` junction table with composite PK | |
|        |  | - `article_revisions` table with index on article_id + revision_number | |
|        |  | - `user_bookmarks` table with unique constraint on (user_id, bookmarkable_type, bookmarkable_id) | |
| B-4.2 | Article entity + module | - Article entity with TypeORM relations (ManyToOne category, ManyToOne author, ManyToMany tags, OneToMany revisions) | 3 h |
|        |  | - ArticleModule with controller, service, repository | |
|        |  | - DTOs: CreateArticleDto, UpdateArticleDto, ArticleQueryDto | |
| B-4.3 | CRUD endpoints | - `POST /api/admin/articles` -- create with tags, calculate read time | 5 h |
|        |  | - `GET /api/admin/articles` -- paginated list with QueryBuilder filters | |
|        |  | - `GET /api/admin/articles/:id` -- eager load category, tags, author, featured image | |
|        |  | - `PATCH /api/admin/articles/:id` -- partial update, sync tags | |
|        |  | - `DELETE /api/admin/articles/:id` -- soft delete, admin only | |
|        |  | - Pagination: page, limit (default 20, max 100), total count in response | |
| B-4.4 | Slug generation | - Utility: slugify title (lowercase, replace spaces, remove special chars) | 2 h |
|        |  | - Check uniqueness; if conflict, append `-2`, `-3`, etc. | |
|        |  | - Allow manual slug override in update | |
|        |  | - Shared utility in `packages/shared` | |
| B-4.5 | Status workflow | - ArticleStatus enum with allowed transitions map | 4 h |
|        |  | - `PATCH /api/admin/articles/:id/status` with body `{ status, scheduled_at? }` | |
|        |  | - Transition validation: check current -> target is allowed | |
|        |  | - Role check: only admin can directly publish | |
|        |  | - EventEmitter2: emit `article.status.changed` event | |
| B-4.6 | Scheduling cron | - `@Cron('* * * * *')` handler in ArticleService | 3 h |
|        |  | - Query: `WHERE status = 'scheduled' AND scheduled_at <= NOW()` | |
|        |  | - Batch update: set status = 'published', published_at = scheduled_at | |
|        |  | - Log each published article | |
|        |  | - Handle timezone correctly (store as UTC) | |
| B-4.7 | Revision tracking | - Auto-create revision on every article content/title update | 4 h |
|        |  | - Increment revision_number per article | |
|        |  | - `GET /api/admin/articles/:id/revisions` -- list with pagination | |
|        |  | - `GET /api/admin/articles/:id/revisions/:revId` -- get content | |
|        |  | - `POST /api/admin/articles/:id/revisions/:revId/restore` -- copy revision content to article | |
|        |  | - Auto-prune: delete oldest when > 50 revisions | |
| B-4.8 | View count tracking | - `POST /api/articles/:slug/view` -- increment view_count | 3 h |
|        |  | - Debounce: cache `IP:articleId` key with 1h TTL (in-memory or Redis if available) | |
|        |  | - If duplicate within window, skip increment | |
|        |  | - Bulk update to DB every 5 minutes (reduce write pressure) | |
| B-4.9 | Related articles + bookmarks | - Related articles query: score by category match (3), tag overlap (2), recency (1) | 5 h |
|        |  | - `GET /api/articles/:slug/related?limit=4` | |
|        |  | - BookmarkModule: `POST /api/bookmarks`, `DELETE /api/bookmarks/:id`, `GET /api/bookmarks` | |
|        |  | - Polymorphic: `bookmarkable_type` = 'article' | 'guide' | 'event' | |
|        |  | - Include `is_bookmarked` flag in article responses for authenticated users | |

**Backend Total: 33 hours**

---

## Frontend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| F-4.1 | Article list page | - Data table with columns: title, category, author, status, views, published_at, actions | 4 h |
|        |  | - Status badge component (color-coded: draft=gray, in_review=yellow, scheduled=blue, published=green, archived=red) | |
|        |  | - Pagination controls (page size selector, page numbers) | |
|        |  | - "New Article" button | |
| F-4.2 | List filters + sorting | - Status dropdown filter | 3 h |
|        |  | - Category dropdown filter | |
|        |  | - Author dropdown filter (with search) | |
|        |  | - Date range picker | |
|        |  | - Column header click to sort (asc/desc toggle) | |
|        |  | - Filters persist in URL query params | |
| F-4.3 | Article form (fields) | - Title input with character count | 5 h |
|        |  | - Slug field: auto-generated from title, editable with "lock" toggle | |
|        |  | - Excerpt textarea (max 300 chars) | |
|        |  | - Category select dropdown | |
|        |  | - Tag multi-select with auto-suggest (from Sprint 3 tag API) | |
|        |  | - Form validation with error messages | |
| F-4.4 | Article form (content) | - TipTap editor (from Sprint 3) for article body | 4 h |
|        |  | - Featured image picker: click to open media library, show preview | |
|        |  | - Read time display (auto-calculated) | |
|        |  | - Save draft button, auto-save indicator | |
| F-4.5 | Status workflow UI | - Current status badge prominently displayed | 3 h |
|        |  | - Action buttons based on allowed transitions: "Submit for Review", "Approve", "Publish", "Schedule", "Archive", "Reopen" | |
|        |  | - Confirmation dialog for status changes | |
|        |  | - Disable buttons for invalid transitions | |
| F-4.6 | Scheduling UI | - Date/time picker for scheduled_at (future dates only) | 3 h |
|        |  | - Timezone display and conversion | |
|        |  | - Countdown timer on scheduled articles | |
|        |  | - Cancel schedule button (returns to in_review) | |
| F-4.7 | Revision history | - Sidebar panel or tab: list of revisions (revision #, date, author) | 4 h |
|        |  | - Click revision to view content | |
|        |  | - Side-by-side diff view (current vs. selected revision) | |
|        |  | - "Restore this version" button with confirmation | |
| F-4.8 | SEO meta panel | - Collapsible panel below editor | 2 h |
|        |  | - Meta title input (max 60 chars, with counter) | |
|        |  | - Meta description textarea (max 160 chars, with counter) | |
|        |  | - Google SERP preview (title, URL, description) | |
| F-4.9 | Preview + misc | - Preview button: opens `/preview/:id?token=xxx` in new tab | 3 h |
|        |  | - Draft preview page rendering article as it would appear published | |
|        |  | - Preview token: short-lived (1 hour), single-use | |

**Frontend Total: 31 hours**

---

## DevOps / Infrastructure Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| D-4.1 | Cron infrastructure | - Verify NestJS `@nestjs/schedule` configured | 1 h |
|        |  | - Ensure cron runs in single instance (leader election or lock) | |
|        |  | - Logging for cron execution | |
| D-4.2 | Staging deployment | - Deploy articles backend + admin pages to staging | 1 h |
|        |  | - Verify scheduling cron works on staging | |

**DevOps Total: 2 hours**

---

## QA Tasks

| ID | Test Scenario | Type | Estimate |
| -- | ------------- | ---- | -------- |
| QA-4.1 | Article CRUD: create with tags, update, soft delete, list with filters | Integration | 2 h |
| QA-4.2 | Status workflow: valid transitions succeed, invalid transitions return 422 | Unit | 2 h |
| QA-4.3 | Scheduling: create scheduled article, advance time, verify auto-publish | Integration | 2 h |
| QA-4.4 | Revisions: edit article 3 times, list revisions, restore revision #1 | Integration | 1 h |
| QA-4.5 | View count: same IP within 1h doesn't double-count; different IPs do | Unit | 1 h |
| QA-4.6 | Related articles: returns articles from same category, excludes current | Unit | 1 h |
| QA-4.7 | Bookmarks: add, remove, list, duplicate returns 409 | Integration | 1 h |
| QA-4.8 | Admin article list: filters by status, category, author; sorts by views | E2E | 2 h |
| QA-4.9 | Admin article form: create article, add tags, set featured image, save | E2E | 2 h |
| QA-4.10 | Full lifecycle: draft -> in_review -> scheduled -> auto-published -> archived | E2E | 2 h |

**QA Total: 16 hours**

---

## Dependencies

```
Sprint 3 (complete) -- categories, tags, media, TipTap editor, admin layout
 +-- B-4.1 (Migrations) -- depends on categories + media tables existing
 +-- F-4.3 (Article form) -- depends on category API, tag auto-suggest
 +-- F-4.4 (Content editor) -- depends on TipTap from Sprint 3
 +-- F-4.4 (Featured image) -- depends on media library from Sprint 3

B-4.1 (Migrations)
 +-- B-4.2 (Entity + module) -- depends on tables
      +-- B-4.3 (CRUD) -- depends on entity
      |    +-- B-4.4 (Slug) -- integrated with create/update
      |    +-- B-4.5 (Status workflow) -- depends on CRUD
      |         +-- B-4.6 (Scheduling) -- depends on status workflow
      +-- B-4.7 (Revisions) -- depends on article entity
      +-- B-4.8 (View count) -- depends on article entity
      +-- B-4.9 (Related + bookmarks) -- depends on article entity + tags

F-4.1 (List page) -- depends on B-4.3 (list endpoint)
F-4.5 (Status UI) -- depends on B-4.5 (status endpoint)
F-4.6 (Scheduling) -- depends on B-4.6 (scheduling endpoint)
F-4.7 (Revisions) -- depends on B-4.7 (revisions endpoints)
```

---

## Risk Items

| # | Risk | Likelihood | Impact | Mitigation |
| - | ---- | ---------- | ------ | ---------- |
| R-1 | Cron job running on multiple instances (duplicate publishes) | Medium | High | Use DB advisory lock or cron instance flag; idempotent publish logic |
| R-2 | View count race condition under load | Low | Low | Use atomic increment (`UPDATE ... SET view_count = view_count + 1`); batch writes |
| R-3 | Revision storage growing large (50 full HTML snapshots) | Medium | Medium | Consider storing diffs instead of full content; monitor DB size |
| R-4 | Related articles query performance with many articles | Low | Medium | Add composite indexes; consider materialized view for large datasets |
| R-5 | Complex article form state management | Medium | Medium | Use React Hook Form with controlled state; break into subcomponents |
| R-6 | Slug conflict resolution edge cases | Low | Low | Unit test with 10+ same-title articles; verify sequential numbering |

---

## Deliverables Checklist

- [ ] `articles`, `article_tags`, `article_revisions`, `user_bookmarks` tables migrated
- [ ] Article CRUD API with pagination, filtering, and sorting
- [ ] Slug auto-generation with conflict resolution
- [ ] Status workflow with transition validation
- [ ] Scheduling cron job (minute-level precision)
- [ ] Revision tracking (auto-save, list, view, restore)
- [ ] View count tracking with IP-based deduplication
- [ ] Related articles algorithm (category + tag scoring)
- [ ] Bookmarks CRUD (polymorphic, supports articles)
- [ ] Admin article list page with filters, sorting, pagination
- [ ] Admin article create/edit page with TipTap, tags, featured image
- [ ] Status workflow UI with action buttons and confirmations
- [ ] Scheduling UI with date picker and countdown
- [ ] Revision history panel with diff view
- [ ] SEO meta fields panel with SERP preview
- [ ] Article preview (draft rendering)
- [ ] All tests passing in CI

---

## Definition of Done

1. All acceptance criteria for US-4.1 through US-4.9 are met
2. Full article lifecycle works: create draft -> submit for review -> schedule -> auto-publish -> archive
3. Revision history tracks all changes with restore capability
4. View count deduplication working correctly
5. Related articles returns relevant results
6. Bookmarks work for authenticated users
7. Admin pages fully functional with all filters and actions
8. Scheduling cron tested with actual time-based trigger
9. Slug generation handles 10+ conflicts gracefully
10. All tests (unit + integration + E2E) passing in CI
11. Swagger docs updated for all article endpoints
12. Deployed and verified on staging

---

## Sprint Review Demo Script

1. **Article creation** (3 min) -- Create new article: title, category, tags, excerpt, write content in TipTap, select featured image, show auto-generated slug
2. **Save and revisions** (2 min) -- Save draft, edit content twice more, show revision history with 3 entries
3. **Status workflow** (2 min) -- Submit for review, approve (as admin), show status badge changes
4. **Scheduling** (2 min) -- Schedule article for 2 minutes in the future, show countdown, wait for auto-publish
5. **Article list** (2 min) -- Show admin list, filter by status, category, author; sort by views
6. **Revision restore** (1 min) -- Open revision history, view diff, restore earlier version
7. **View tracking** (1 min) -- Hit view endpoint, show count increment, hit again (same IP), show no increment
8. **Related articles** (1 min) -- Show related articles for a published article
9. **Bookmarks** (1 min) -- Bookmark an article (as regular user), show bookmarks list
10. **SEO preview** (1 min) -- Show SERP preview with meta title and description
11. **Q&A** (3 min)

**Total demo time: ~19 minutes**

---

## Rollover Criteria

A task may roll over to Sprint 5 only if ALL of the following are true:

1. Article CRUD and status workflow are fully functional
2. Admin create/edit page works with TipTap editor
3. At least 80% of story points completed
4. The rollover task does not block Sprint 5's public-facing article pages

**Candidates for rollover (if needed):**
- B-4.7 Revision restore (list + view sufficient; restore can come later)
- B-4.8 View count deduplication (basic increment acceptable initially)
- F-4.7 Diff view in revision history (list-only acceptable)
- F-4.8 SERP preview (meta fields without preview acceptable)

**Must NOT roll over:**
- Article CRUD endpoints (blocks Sprint 5 public pages)
- Status workflow (blocks content publishing)
- Scheduling cron (core feature)
- Admin article list and form pages (blocks editorial workflow)
- Bookmarks API (Sprint 5 needs bookmark buttons on public pages)
