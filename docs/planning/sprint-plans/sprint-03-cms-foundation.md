# Sprint 3: CMS Foundation

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Sprint Number**  | 3                                              |
| **Sprint Name**    | CMS Foundation                                 |
| **Duration**       | 2 weeks (10 working days)                      |
| **Dates**          | Week 5 -- Week 6 (Days 21--30 from project start) |
| **Team**           | 1 Backend, 1 Frontend, 1 DevOps / Infra        |

---

## Sprint Goal

> Build the content management infrastructure -- categories, tags, media handling, and admin panel shell -- so that editors have a functional workspace for creating and managing content. Establish the media pipeline with Cloudflare R2 and Sharp image processing that all future content types will share.

---

## User Stories

### US-3.1 -- Category Management
**As an** admin,
**I want** to create, edit, and organize content categories,
**so that** articles and other content can be structured by topic.

**Acceptance Criteria:**
- [ ] Categories have: name, slug (auto-generated), description, icon, display_order, is_active
- [ ] Hierarchical support (parent_id for subcategories, max 2 levels)
- [ ] Seed data includes: News, Culture, Food & Drink, Nightlife, Housing, Transport, Work, Study
- [ ] CRUD endpoints protected by `editor` or `admin` role
- [ ] Slug must be unique; auto-generated from name with conflict resolution
- [ ] Reordering via drag-and-drop in admin UI

### US-3.2 -- Tag Management
**As an** editor,
**I want** to create and manage tags,
**so that** content can be cross-referenced by specific topics.

**Acceptance Criteria:**
- [ ] Tags have: name, slug (auto-generated, unique)
- [ ] Tags are flat (no hierarchy)
- [ ] Auto-suggest existing tags when typing
- [ ] CRUD endpoints protected by `editor` or `admin` role
- [ ] Bulk tag operations (merge, delete unused)
- [ ] Tag usage count displayed in admin

### US-3.3 -- Media Upload & Processing
**As an** editor,
**I want** to upload images that are automatically optimized,
**so that** the site loads quickly without manual image editing.

**Acceptance Criteria:**
- [ ] Upload via presigned URL directly to Cloudflare R2
- [ ] Server generates presigned URL, client uploads, server records metadata
- [ ] On upload complete, Sharp processes into 4 sizes: thumbnail (150x150), small (400w), medium (800w), large (1200w)
- [ ] Output formats: original + WebP
- [ ] Media record stores: original_url, sizes (JSON), mime_type, file_size, width, height, alt_text, uploaded_by
- [ ] Max file size: 10 MB; accepted types: JPEG, PNG, WebP, GIF, SVG
- [ ] SVG files are stored as-is (no resize)

### US-3.4 -- Media Library Browser
**As an** editor,
**I want** to browse, search, and select previously uploaded media,
**so that** I can reuse images across multiple content items.

**Acceptance Criteria:**
- [ ] Grid view showing thumbnails with filename, size, upload date
- [ ] Search by filename, alt text
- [ ] Filter by MIME type, upload date range, uploader
- [ ] Pagination (24 items per page)
- [ ] Select media for insertion into content
- [ ] Delete media (with orphan check warning)
- [ ] Edit alt text inline

### US-3.5 -- Admin Panel Shell
**As an** admin,
**I want** a dedicated admin panel with navigation and dashboard,
**so that** I can manage all platform content from one interface.

**Acceptance Criteria:**
- [ ] Admin routes under `/admin` route group
- [ ] Admin layout: sidebar navigation, top bar with user info, main content area
- [ ] Sidebar links: Dashboard, Articles (Sprint 4), Guides (Sprint 6), Events (Sprint 7), Media, Categories, Tags, Users
- [ ] Dashboard shows: total content counts, recent activity, quick actions
- [ ] Admin pages only accessible to `editor`, `admin`, `super_admin` roles
- [ ] Responsive: sidebar collapses to hamburger on tablet/mobile

### US-3.6 -- Rich Text Editor
**As an** editor,
**I want** a rich text editor with formatting and media embedding,
**so that** I can create visually engaging content.

**Acceptance Criteria:**
- [ ] TipTap editor with toolbar: headings (H2--H4), bold, italic, links, lists, blockquote, code block
- [ ] Image insertion from media library (opens media browser modal)
- [ ] Image insertion via direct upload (drag-and-drop or paste)
- [ ] YouTube/Vimeo embed via URL paste
- [ ] HTML output sanitized before storage
- [ ] Editor content saved as HTML with auto-save (debounced, every 30 seconds)
- [ ] Word count and estimated read time displayed

---

## Day-by-Day Task Breakdown

### Week 1 (Days 21--25)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **21** | B-3.1 Create `categories` table migration + entity | F-3.1 Admin route group, admin layout (sidebar + topbar) | D-3.1 Cloudflare R2 bucket creation, CORS config |
| **22** | B-3.2 Category module: CRUD endpoints, seed data | F-3.2 Admin dashboard page (placeholder stats) | D-3.2 R2 credentials, env vars, presigned URL setup |
| **23** | B-3.3 Create `tags` table migration + entity, Tag CRUD | F-3.3 Category management page (list + create/edit modal) | -- |
| **24** | B-3.4 Create `media` table migration + entity | F-3.4 Tag management page (list + inline edit, auto-suggest) | -- |
| **25** | B-3.5 Media module: presigned URL generation endpoint | F-3.5 Media upload component (drag-and-drop zone) | D-3.3 Sharp image processing worker setup |

### Week 2 (Days 26--30)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **26** | B-3.6 Image processing pipeline (Sharp: 4 sizes + WebP) | F-3.6 Media library browser (grid, search, filter) | -- |
| **27** | B-3.7 Media CRUD endpoints (list, get, update alt, delete) | F-3.7 TipTap editor integration + toolbar | -- |
| **28** | B-3.8 Media deletion (R2 cleanup + DB record) | F-3.8 Editor: media insertion (library + upload) | D-3.4 R2 lifecycle rules (cleanup orphaned uploads) |
| **29** | B-3.9 Category reordering endpoint, tag merge/bulk ops | F-3.9 Editor: embeds (YouTube/Vimeo), auto-save | -- |
| **30** | QA-3.1 -- QA-3.4 Backend tests | QA-3.5 -- QA-3.8 Frontend tests | D-3.5 Deploy CMS to staging |

---

## Backend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| B-3.1 | Categories table + entity | - Migration: id (UUID), name, slug (unique), description, icon, parent_id (self-ref FK), display_order, is_active, created_at, updated_at | 3 h |
|        |  | - Category entity with TypeORM decorators, tree relations | |
|        |  | - Slug auto-generation utility (shared package) | |
| B-3.2 | Category CRUD + seed | - `GET /api/categories` -- list all (tree structure, public) | 4 h |
|        |  | - `POST /api/categories` -- create (admin) | |
|        |  | - `PATCH /api/categories/:id` -- update (admin) | |
|        |  | - `DELETE /api/categories/:id` -- soft delete (admin, fail if has content) | |
|        |  | - Seed migration: 8 default categories | |
| B-3.3 | Tags table + CRUD | - Migration: id (UUID), name, slug (unique), created_at | 3 h |
|        |  | - `GET /api/tags` -- list with usage count (public) | |
|        |  | - `GET /api/tags/search?q=` -- auto-suggest (public) | |
|        |  | - `POST /api/tags` -- create (editor) | |
|        |  | - `PATCH /api/tags/:id` -- update (editor) | |
|        |  | - `DELETE /api/tags/:id` -- delete (admin, only if unused) | |
| B-3.4 | Media table + entity | - Migration: id (UUID), original_filename, storage_key, original_url, sizes (JSONB), mime_type, file_size_bytes, width, height, alt_text, uploaded_by (FK), created_at, updated_at | 2 h |
|        |  | - Media entity with TypeORM decorators | |
| B-3.5 | Presigned URL endpoint | - `POST /api/media/presign` -- accepts filename, content_type | 3 h |
|        |  | - Validate file type and size limit (10 MB) | |
|        |  | - Generate unique storage key with UUID prefix | |
|        |  | - Return presigned PUT URL (5 min expiry) + storage key | |
|        |  | - Use `@aws-sdk/s3-request-presigner` with R2 endpoint | |
| B-3.6 | Image processing | - `POST /api/media/process` -- triggered after upload complete | 5 h |
|        |  | - Download original from R2 | |
|        |  | - Sharp resize: thumbnail (150x150 cover), small (400w), medium (800w), large (1200w) | |
|        |  | - Generate WebP variants for each size | |
|        |  | - Upload processed images to R2 | |
|        |  | - Update media record with sizes JSON | |
|        |  | - Handle SVG/GIF pass-through (no resize) | |
| B-3.7 | Media CRUD | - `GET /api/media` -- paginated list with filters (type, date, uploader) | 3 h |
|        |  | - `GET /api/media/:id` -- single media with all size URLs | |
|        |  | - `PATCH /api/media/:id` -- update alt_text | |
| B-3.8 | Media deletion | - `DELETE /api/media/:id` -- check for references in content | 2 h |
|        |  | - If referenced: return warning with reference list | |
|        |  | - If force=true or unreferenced: delete from R2 (all sizes) + DB | |
| B-3.9 | Category reorder + tag ops | - `PATCH /api/categories/reorder` -- accepts ordered ID array | 3 h |
|        |  | - `POST /api/tags/merge` -- merge source tag into target (admin) | |
|        |  | - `DELETE /api/tags/bulk` -- delete unused tags (admin) | |

**Backend Total: 28 hours**

---

## Frontend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| F-3.1 | Admin layout | - Admin route group `app/(admin)/admin/layout.tsx` | 5 h |
|        |  | - Sidebar component: collapsible, active state, icons | |
|        |  | - Top bar: user avatar + dropdown (profile, logout), breadcrumbs | |
|        |  | - Role guard: redirect non-admin users | |
|        |  | - Responsive: sidebar toggles on mobile | |
| F-3.2 | Admin dashboard | - Stats cards: placeholder counts (articles, media, users) | 3 h |
|        |  | - Recent activity feed (placeholder) | |
|        |  | - Quick action buttons (new article, upload media) | |
| F-3.3 | Category management page | - Table: name, slug, parent, order, status, actions | 4 h |
|        |  | - Create/edit modal with form | |
|        |  | - Drag-and-drop reordering (dnd-kit or @hello-pangea/dnd) | |
|        |  | - Delete with confirmation (block if has content) | |
|        |  | - Parent category dropdown for subcategories | |
| F-3.4 | Tag management page | - Table: name, slug, usage count, actions | 3 h |
|        |  | - Inline editing for tag names | |
|        |  | - Merge tags dialog (select source + target) | |
|        |  | - Bulk delete unused tags | |
|        |  | - Search/filter by name | |
| F-3.5 | Media upload component | - Drag-and-drop zone with file type/size validation | 4 h |
|        |  | - Progress bar during upload | |
|        |  | - Multi-file upload support (queue) | |
|        |  | - Preview after upload | |
|        |  | - Presigned URL flow: request URL -> upload to R2 -> confirm to API | |
| F-3.6 | Media library browser | - Grid of thumbnails (lazy loaded) | 5 h |
|        |  | - Search by filename, alt text | |
|        |  | - Filter by type (image, video), date range | |
|        |  | - Pagination (24 per page) | |
|        |  | - Click to select (for editor insertion) | |
|        |  | - Detail panel: preview, metadata, edit alt text | |
|        |  | - Delete with orphan check warning | |
| F-3.7 | TipTap editor | - Install @tiptap/react + extensions | 5 h |
|        |  | - Toolbar: H2, H3, H4, bold, italic, underline, strike | |
|        |  | - Toolbar: ordered list, bullet list, blockquote, code block | |
|        |  | - Toolbar: link (add/edit/remove), horizontal rule | |
|        |  | - Word count + read time display | |
| F-3.8 | Editor media insertion | - "Insert image" button opens media library modal | 4 h |
|        |  | - Drag-and-drop image into editor triggers upload | |
|        |  | - Paste image from clipboard triggers upload | |
|        |  | - Image node with alt text, caption, alignment | |
| F-3.9 | Editor embeds + auto-save | - YouTube URL paste -> embedded player | 3 h |
|        |  | - Vimeo URL paste -> embedded player | |
|        |  | - Auto-save: debounced (30 s), save to localStorage + API | |
|        |  | - "Unsaved changes" indicator | |

**Frontend Total: 36 hours**

---

## DevOps / Infrastructure Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| D-3.1 | R2 bucket setup | - Create bucket `iloveberlin-media` in Cloudflare R2 | 2 h |
|        |  | - CORS configuration (allow uploads from app domains) | |
|        |  | - Public access via custom domain or R2.dev URL | |
| D-3.2 | R2 credentials | - Generate R2 API token (S3-compatible) | 1 h |
|        |  | - Add to `.env.example` and staging secrets | |
|        |  | - Configure `@aws-sdk/client-s3` with R2 endpoint | |
| D-3.3 | Sharp worker | - Install Sharp in API, verify native binary builds in Docker | 2 h |
|        |  | - Consider Bull queue for async processing if volume demands | |
| D-3.4 | R2 lifecycle rules | - Auto-delete incomplete multipart uploads after 24 h | 1 h |
|        |  | - Monitoring: alert if bucket size exceeds threshold | |
| D-3.5 | Staging deployment | - Deploy CMS features, verify media uploads on staging | 1 h |
|        |  | - Test presigned URLs work with Cloudflare in front | |

**DevOps Total: 7 hours**

---

## QA Tasks

| ID | Test Scenario | Type | Estimate |
| -- | ------------- | ---- | -------- |
| QA-3.1 | Category CRUD: create, read tree, update, reorder, delete | Integration | 2 h |
| QA-3.2 | Tag CRUD: create, search auto-suggest, merge, bulk delete | Integration | 1 h |
| QA-3.3 | Media upload: presigned URL -> upload to R2 -> process 4 sizes | Integration | 2 h |
| QA-3.4 | Media upload edge cases: > 10 MB rejected, SVG pass-through, invalid MIME rejected | Unit | 1 h |
| QA-3.5 | Admin panel: non-admin redirected, admin sees dashboard | E2E | 1 h |
| QA-3.6 | Category page: create, reorder via drag-and-drop, delete with warning | E2E | 2 h |
| QA-3.7 | Media library: upload, browse grid, search, filter, delete | E2E | 2 h |
| QA-3.8 | TipTap editor: all formatting options, image insertion, embed, auto-save | E2E | 2 h |

**QA Total: 13 hours**

---

## Dependencies

```
Sprint 2 (complete) -- auth + RBAC required
 +-- F-3.1 (Admin layout) -- depends on auth protected routes
 +-- All admin endpoints -- depend on RBAC guards

B-3.1 (Categories table) -- independent
 +-- B-3.2 (Category CRUD) -- depends on B-3.1
      +-- F-3.3 (Category page) -- depends on B-3.2

B-3.3 (Tags table) -- independent
 +-- F-3.4 (Tag page) -- depends on B-3.3

D-3.1 (R2 bucket) -- independent
 +-- D-3.2 (R2 credentials) -- depends on D-3.1
      +-- B-3.5 (Presigned URLs) -- depends on D-3.2
           +-- B-3.6 (Image processing) -- depends on B-3.5 + D-3.3
                +-- B-3.7 (Media CRUD) -- depends on B-3.6
                +-- B-3.8 (Media deletion) -- depends on B-3.7
           +-- F-3.5 (Upload component) -- depends on B-3.5
                +-- F-3.6 (Media library) -- depends on B-3.7 + F-3.5
                +-- F-3.8 (Editor media) -- depends on F-3.7 + F-3.6

F-3.7 (TipTap editor) -- independent (no backend dependency)
 +-- F-3.9 (Embeds + auto-save) -- depends on F-3.7
```

---

## Risk Items

| # | Risk | Likelihood | Impact | Mitigation |
| - | ---- | ---------- | ------ | ---------- |
| R-1 | Sharp native binary fails in Docker | Medium | High | Test Docker build early (Day 25); use `--platform linux/amd64` if needed |
| R-2 | R2 presigned URL CORS issues with Cloudflare proxy | Medium | High | Test CORS on Day 25; may need to bypass CF proxy for uploads |
| R-3 | TipTap custom extensions complexity (media, embeds) | Medium | Medium | Use community extensions first; custom only if needed |
| R-4 | Large image processing times blocking API | Low | Medium | Process async with Bull queue; return 202 with processing status |
| R-5 | Drag-and-drop library conflicts with TipTap | Low | Medium | Use separate drag-and-drop lib for admin vs. TipTap's built-in |
| R-6 | R2 storage costs if media not cleaned up | Low | Low | Implement lifecycle rules (D-3.4); orphan cleanup cron later |

---

## Deliverables Checklist

- [ ] `categories` table with seed data (8 default categories)
- [ ] `tags` table
- [ ] `media` table
- [ ] Category CRUD API with tree structure and reordering
- [ ] Tag CRUD API with auto-suggest, merge, bulk delete
- [ ] Media presigned URL generation for R2 uploads
- [ ] Image processing pipeline (4 sizes + WebP via Sharp)
- [ ] Media CRUD API (list, get, update alt text, delete with orphan check)
- [ ] Admin layout with sidebar navigation
- [ ] Admin dashboard page
- [ ] Category management page with drag-and-drop reordering
- [ ] Tag management page with inline editing
- [ ] Media upload component with drag-and-drop and progress
- [ ] Media library browser with search, filter, pagination
- [ ] TipTap rich text editor with full toolbar
- [ ] Editor media insertion (library browser + direct upload + paste)
- [ ] Editor embeds (YouTube, Vimeo)
- [ ] Editor auto-save (30-second debounce)
- [ ] Cloudflare R2 bucket configured with CORS and lifecycle rules
- [ ] All integration and E2E tests passing

---

## Definition of Done

1. All acceptance criteria for US-3.1 through US-3.6 are met
2. Admin panel accessible only to authorized roles
3. Media upload -> processing -> storage pipeline works end-to-end
4. All 4 image sizes generated correctly (verified by visual inspection)
5. WebP variants generated for all image sizes
6. TipTap editor produces clean, sanitized HTML
7. Editor auto-save works without data loss
8. Category tree renders correctly with 2 levels
9. Tag auto-suggest responds in < 200 ms
10. All tests passing in CI
11. Swagger docs updated with all new endpoints
12. CMS features deployed and verified on staging

---

## Sprint Review Demo Script

1. **Admin panel access** (1 min) -- Login as admin, show sidebar navigation; login as regular user, show redirect
2. **Dashboard** (1 min) -- Show stats cards, recent activity, quick action buttons
3. **Category management** (2 min) -- Create category, add subcategory, drag-and-drop reorder, edit, delete
4. **Tag management** (1 min) -- Create tags, show auto-suggest, merge two tags, bulk delete unused
5. **Media upload** (2 min) -- Drag-and-drop image upload, show progress bar, show 4 generated sizes
6. **Media library** (2 min) -- Browse grid, search by name, filter by type, select image, edit alt text
7. **Rich text editor** (3 min) -- Demonstrate all formatting: headings, lists, blockquote, code
8. **Editor media** (2 min) -- Insert image from library, drag-and-drop image into editor, paste from clipboard
9. **Editor embeds** (1 min) -- Paste YouTube URL, show embedded player
10. **Auto-save** (1 min) -- Type content, show auto-save indicator, refresh page, show content restored
11. **Q&A** (3 min)

**Total demo time: ~19 minutes**

---

## Rollover Criteria

A task may roll over to Sprint 4 only if ALL of the following are true:

1. Core CMS infrastructure (categories, tags, media upload) is functional
2. Admin layout is complete and accessible
3. TipTap editor has basic formatting (media insertion can be simplified)
4. At least 80% of story points completed

**Candidates for rollover (if needed):**
- B-3.9 Tag merge/bulk operations (convenience features, not blocking)
- F-3.9 YouTube/Vimeo embeds (nice-to-have for Sprint 4 articles)
- QA-3.6 Drag-and-drop E2E tests (hard to automate, can do manual testing)

**Must NOT roll over:**
- Category CRUD + seed data (blocks Sprint 4 article categorization)
- Tag CRUD (blocks Sprint 4 article tagging)
- Media upload + processing pipeline (blocks Sprint 4 article images)
- Admin layout (blocks all future admin pages)
- TipTap editor core (blocks Sprint 4 article editing)
