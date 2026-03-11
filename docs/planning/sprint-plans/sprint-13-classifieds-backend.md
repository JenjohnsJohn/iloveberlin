# Sprint 13: Classifieds Backend

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 13 |
| **Sprint Name** | Classifieds Backend |
| **Duration** | 2 weeks (10 working days) |
| **Dates** | Weeks 25-26 (relative to project start) |
| **Team** | 2 Backend, 1 Frontend (admin), 1 QA, 0.5 DevOps |

## Sprint Goal

Build the complete classifieds backend infrastructure -- including categories, listings with user ownership, multi-image uploads, a moderation workflow, user-to-user messaging, reporting system, automatic 30-day expiry, and featured/premium flags -- along with admin moderation queue and report review interfaces, enabling users to post, manage, and communicate about classified listings.

---

## User Stories

### US-13.1: Classified Categories
**ID:** US-13.1
**As a** developer, **I want to** have a seeded classified categories table **so that** listings can be organized by type.

**Acceptance Criteria:**
- [ ] `classified_categories` table: id, name, slug, icon, description, parent_id (nullable for sub-categories), sort_order, is_active, created_at
- [ ] Seed migration populates categories: Jobs, Housing (Rent, Flatshare, Sublet), For Sale (Furniture, Electronics, Clothing, Bikes, Other), Services, Community, Musicians/Artists, Language Exchange, Lost & Found, Free Stuff, Wanted
- [ ] Hierarchical categories supported (parent/child)
- [ ] `GET /api/classified-categories` returns category tree (parents with children)
- [ ] Categories are admin-managed (not user-created)

### US-13.2: Classified Listings CRUD
**ID:** US-13.2
**As a** logged-in user, **I want to** create and manage classified listings **so that** I can sell items, find housing, or post services.

**Acceptance Criteria:**
- [ ] `classifieds` table: id, user_id, category_id, title, slug, description (rich text), price (nullable), price_type (enum: fixed, negotiable, free, contact), currency (EUR default), district, address (optional), latitude, longitude, contact_email, contact_phone (optional), status (enum: draft, pending_review, active, rejected, expired, archived, removed), rejection_reason, is_featured, is_premium, view_count, expires_at (auto-set 30 days from publish), created_at, updated_at
- [ ] `POST /api/classifieds` creates a listing owned by the authenticated user
- [ ] `PUT /api/classifieds/:id` updates listing (owner only)
- [ ] `DELETE /api/classifieds/:id` soft-deletes listing (owner or admin)
- [ ] `GET /api/classifieds` public listing with filters (category, district, price range, keyword search)
- [ ] `GET /api/classifieds/:slug` returns listing detail
- [ ] `GET /api/classifieds/my-listings` returns authenticated user's listings
- [ ] New listings start in `pending_review` status
- [ ] Only `active` listings visible to public
- [ ] Full-text search via Meilisearch

### US-13.3: Classified Images
**ID:** US-13.3
**As a** user, **I want to** upload photos for my classified listing **so that** buyers can see what I'm offering.

**Acceptance Criteria:**
- [ ] `classified_images` table: id, classified_id, image_url, thumbnail_url, alt_text, sort_order, created_at
- [ ] `POST /api/classifieds/:id/images` uploads image(s) to Cloudflare R2
- [ ] Maximum 8 images per listing (enforced at API level)
- [ ] Images resized to standard sizes (thumbnail: 300x300, medium: 800x600, large: 1200x900)
- [ ] First image is automatically the primary/cover image
- [ ] `PUT /api/classifieds/:id/images/reorder` reorders images
- [ ] `DELETE /api/classifieds/:id/images/:imageId` removes image (owner only)
- [ ] Only listing owner can manage images

### US-13.4: Moderation Workflow
**ID:** US-13.4
**As an** admin, **I want to** review and moderate classified listings **so that** inappropriate content is not published.

**Acceptance Criteria:**
- [ ] New listings enter `pending_review` status automatically
- [ ] Admin moderation queue: `GET /api/admin/classifieds/moderation-queue` (pending_review listings, ordered by created_at)
- [ ] `PATCH /api/admin/classifieds/:id/approve` transitions to `active` (sets expires_at to now + 30 days)
- [ ] `PATCH /api/admin/classifieds/:id/reject` transitions to `rejected` with rejection_reason
- [ ] `PATCH /api/admin/classifieds/:id/remove` transitions to `removed` (for violations)
- [ ] User notified via email on approval or rejection
- [ ] Rejection email includes the reason
- [ ] Admin can view all listings regardless of status
- [ ] Moderation queue shows count badge in admin nav

### US-13.5: Messaging System
**ID:** US-13.5
**As a** user, **I want to** send messages about a classified listing **so that** I can communicate with the seller without sharing my contact information publicly.

**Acceptance Criteria:**
- [ ] `classified_messages` table: id, classified_id, thread_id (UUID), sender_id, recipient_id, message_text, is_read, created_at
- [ ] `POST /api/classifieds/:id/messages` initiates a conversation or replies within an existing thread
- [ ] Thread is created automatically: one thread per (classified_id, buyer_user_id) pair
- [ ] `GET /api/messages/inbox` returns user's message threads (as either sender or recipient)
- [ ] `GET /api/messages/thread/:threadId` returns all messages in a thread
- [ ] `PATCH /api/messages/:id/read` marks message as read
- [ ] Users can only message active listings
- [ ] Users cannot message their own listings
- [ ] Unread message count available via `GET /api/messages/unread-count`
- [ ] Messages are plain text (no HTML, sanitized)

### US-13.6: Reporting System
**ID:** US-13.6
**As a** user, **I want to** report a classified listing **so that** inappropriate or fraudulent listings can be reviewed.

**Acceptance Criteria:**
- [ ] `classified_reports` table: id, classified_id, reporter_user_id, reason (enum: spam, fraud, inappropriate, duplicate, expired, other), description, status (enum: pending, reviewed, dismissed, action_taken), admin_notes, reviewed_by, reviewed_at, created_at
- [ ] `POST /api/classifieds/:id/report` submits a report (authenticated users only)
- [ ] One report per user per listing (prevent spam reports)
- [ ] Report reasons: Spam, Fraud/Scam, Inappropriate Content, Duplicate Listing, Already Sold/Expired, Other (with description)
- [ ] `GET /api/admin/reports` returns pending reports for admin review
- [ ] `PATCH /api/admin/reports/:id/review` admin reviews report (dismiss or take action)
- [ ] Taking action can trigger listing removal
- [ ] Admin can add notes to reports

### US-13.7: Auto-Expiry Cron Job
**ID:** US-13.7
**As a** system, **I want to** automatically expire listings after 30 days **so that** the classifieds section stays current.

**Acceptance Criteria:**
- [ ] Cron job runs daily to find active listings where `expires_at < now()`
- [ ] Matching listings transition to `expired` status
- [ ] User notified via email that their listing has expired
- [ ] Expired listing email includes option to renew (re-publish link)
- [ ] Expired listings are not visible to public
- [ ] User can renew expired listing (resets to `pending_review`, sets new expires_at)
- [ ] `PATCH /api/classifieds/:id/renew` endpoint for renewal

### US-13.8: Featured and Premium Flags
**ID:** US-13.8
**As an** admin, **I want to** mark listings as featured or premium **so that** they receive enhanced visibility.

**Acceptance Criteria:**
- [ ] `is_featured` boolean on classifieds table (admin-set, highlighted on landing page)
- [ ] `is_premium` boolean on classifieds table (indicates paid promotion)
- [ ] `PATCH /api/admin/classifieds/:id/feature` toggles featured status
- [ ] `PATCH /api/admin/classifieds/:id/premium` toggles premium status
- [ ] Featured listings appear in dedicated section on landing page
- [ ] Premium listings appear at top of search results (boosted sorting)
- [ ] `GET /api/classifieds/featured` returns featured active listings

### US-13.9: Admin Moderation Queue Interface
**ID:** US-13.9
**As an** admin, **I want to** manage the moderation queue through the admin panel **so that** I can efficiently review listings.

**Acceptance Criteria:**
- [ ] Moderation queue page showing pending listings in chronological order
- [ ] Each listing shows: title, category, user, image thumbnails, created date
- [ ] Quick preview of listing content without leaving queue
- [ ] Approve button (one-click)
- [ ] Reject button (with reason input modal)
- [ ] Remove button (with reason input modal)
- [ ] Queue count in admin sidebar navigation
- [ ] Filter by category

### US-13.10: Admin Report Review Interface
**ID:** US-13.10
**As an** admin, **I want to** review user reports through the admin panel **so that** I can take action on problematic listings.

**Acceptance Criteria:**
- [ ] Reports list showing pending reports
- [ ] Report detail: reported listing, reporter, reason, description
- [ ] Link to view the reported listing
- [ ] "Dismiss" button (report was unfounded)
- [ ] "Take Action" button (opens action options: remove listing, warn user)
- [ ] Admin notes field
- [ ] Report history (reviewed reports)

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Create `classified_categories` table migration | Backend 1 | 2h | Schema with parent_id for hierarchy, indexes |
| Create classified categories seed migration | Backend 1 | 2h | ~15 categories with hierarchy (parent + child) |
| Create `classifieds` table migration | Backend 2 | 3h | Full schema with all columns, enums, indexes |
| Create `classified_images` table migration | Backend 2 | 1.5h | Schema with sort_order, foreign keys |

#### Day 2 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Create `classified_messages` table migration | Backend 1 | 2.5h | Thread-based schema, indexes on thread_id, sender/recipient |
| Create `classified_reports` table migration | Backend 1 | 2h | Schema with reason enum, status enum, admin fields |
| Build ClassifiedCategoryEntity and Service | Backend 2 | 3h | Entity, tree query (parent/child), GET /api/classified-categories |
| Build ClassifiedEntity with TypeORM decorators | Backend 2 | 2h | All columns, relations, enum types |

#### Day 3 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build ClassifiedService - create | Backend 1 | 3h | Create listing owned by auth user, auto pending_review status |
| Build ClassifiedService - update (owner only) | Backend 1 | 2h | Ownership check, validation, slug update |
| Build ClassifiedService - list with filters | Backend 2 | 4h | Category, district, price range, keyword; only active; pagination |
| Build ClassifiedService - detail and my-listings | Backend 2 | 3h | By slug, user's own listings with all statuses |

#### Day 4 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build ClassifiedController (public + user endpoints) | Backend 1 | 3h | CRUD endpoints with auth guards and ownership checks |
| Build ClassifiedImageService | Backend 2 | 5h | Upload to R2, resize (sharp), max 8 enforcement, reorder, delete |
| Build ClassifiedImageController | Backend 2 | 2h | User endpoints for image management (owner only) |
| Integrate Meilisearch for classified search | Backend 1 | 3h | Index classifieds, sync on CRUD, search endpoint |

#### Day 5 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build ModerationService | Backend 1 | 4h | Queue query, approve (set expires_at), reject (with reason), remove |
| Build ModerationController (admin) | Backend 1 | 2h | Admin endpoints for moderation actions |
| Build approval/rejection notification emails | Backend 2 | 3h | Email templates for approved, rejected (with reason), removed |
| Build moderation queue count endpoint | Backend 2 | 1h | GET /api/admin/classifieds/moderation-queue/count |

### Week 2 (Days 6-10)

#### Day 6 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build ClassifiedMessageService | Backend 1 | 5h | Create thread, send message, inbox query, thread query, read status |
| Build ClassifiedMessageController | Backend 1 | 3h | User endpoints for messaging |
| Build ClassifiedReportService | Backend 2 | 3h | Submit report (one per user per listing), admin review, action |
| Build ClassifiedReportController | Backend 2 | 2h | User report endpoint, admin review endpoints |

#### Day 7 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build 30-day auto-expiry cron job | Backend 1 | 3h | Daily cron, find expired, transition status, notify user |
| Build renewal endpoint | Backend 1 | 2h | PATCH /api/classifieds/:id/renew, reset to pending_review |
| Build expiry notification email | Backend 1 | 1.5h | Email template with renewal link |
| Build featured/premium flag endpoints | Backend 2 | 2h | Admin toggle endpoints, featured query |
| Build premium sort boosting in list query | Backend 2 | 1.5h | Premium listings appear first in results |
| Unread message count endpoint | Backend 2 | 1h | GET /api/messages/unread-count |

#### Day 8 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin moderation queue page | Frontend (admin) | 5h | Queue list, listing preview, approve/reject/remove buttons |
| Admin report review page | Frontend (admin) | 4h | Reports list, detail, dismiss/action buttons, notes |
| Backend integration tests - classified CRUD | Backend 1 | 4h | Create, update, list, filters, ownership |
| Backend integration tests - messaging | Backend 2 | 3h | Thread creation, messages, inbox, read status |

#### Day 9 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin classified list page (all statuses) | Frontend (admin) | 3h | Table with status/category filters, search |
| Admin featured/premium toggle UI | Frontend (admin) | 1.5h | Toggle switches on listing detail |
| Backend integration tests - moderation flow | Backend 1 | 3h | Submit -> review -> approve/reject, notifications |
| Backend integration tests - reports and expiry | Backend 2 | 3h | Report, review, expiry cron, renewal |
| QA: Test classified CRUD and images | QA | 4h | Create, update, images, ownership enforcement |

#### Day 10 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| QA: Test moderation flow | QA | 3h | Pending -> approve/reject, notifications |
| QA: Test messaging system | QA | 3h | Send, inbox, threads, read status |
| QA: Test reports and expiry | QA | 3h | Submit report, admin review, cron expiry |
| Bug fixes from QA | Backend 1 + 2 | 4h | Address P1/P2 issues |
| API documentation | Backend 1 | 2h | Swagger annotations for all endpoints |
| Seed sample classifieds (15-20) | Backend 2 | 2h | Various categories, statuses, with images |
| Sprint review preparation | Backend 1 | 1h | Demo script |

---

## Backend Tasks

### BE-13.1: Classified Categories Schema and Module
- **Sub-tasks:**
  - Create `classified_categories` table migration with parent_id (1.5h)
  - Seed migration with ~15 categories (hierarchy: parent + children) (2h)
  - Build ClassifiedCategoryEntity with self-referencing relation (1h)
  - Build ClassifiedCategoryService (tree query, list) (1h)
  - Build ClassifiedCategoryController (GET /api/classified-categories) (0.5h)
  - Cache categories response (0.5h)
- **Effort:** 6.5 hours

### BE-13.2: Classifieds Schema
- **Sub-tasks:**
  - Create `classifieds` table migration with all columns (2h)
  - Define status enum (draft, pending_review, active, rejected, expired, archived, removed) (0.5h)
  - Define price_type enum (fixed, negotiable, free, contact) (0.5h)
  - Add indexes on (category_id, status), (user_id, status), (status, expires_at), slug unique (0.5h)
  - Create ClassifiedEntity with TypeORM decorators (1.5h)
- **Effort:** 5 hours

### BE-13.3: Classified Images Schema
- **Sub-tasks:**
  - Create `classified_images` table migration (1h)
  - Create ClassifiedImageEntity (0.5h)
- **Effort:** 1.5 hours

### BE-13.4: Classified Messages Schema
- **Sub-tasks:**
  - Create `classified_messages` table migration (1.5h)
  - Add thread_id UUID generation logic (0.5h)
  - Create ClassifiedMessageEntity (0.5h)
  - Add indexes on (thread_id, created_at), (sender_id), (recipient_id), (is_read) (0.5h)
- **Effort:** 3 hours

### BE-13.5: Classified Reports Schema
- **Sub-tasks:**
  - Create `classified_reports` table migration (1h)
  - Define reason enum (spam, fraud, inappropriate, duplicate, expired, other) (0.5h)
  - Define review status enum (pending, reviewed, dismissed, action_taken) (0.5h)
  - Create ClassifiedReportEntity (0.5h)
  - Add unique constraint on (classified_id, reporter_user_id) (0.5h)
- **Effort:** 3 hours

### BE-13.6: Classified Service - CRUD
- **Sub-tasks:**
  - ClassifiedService.create() with auto pending_review, slug generation (2h)
  - ClassifiedService.update() with ownership check (1.5h)
  - ClassifiedService.softDelete() with ownership check (0.5h)
  - ClassifiedService.findAll() with filters (category, district, price range, keyword, status=active) (3h)
  - ClassifiedService.findBySlug() with images, category, user (1h)
  - ClassifiedService.findMyListings() for authenticated user (1h)
  - ClassifiedService.incrementViewCount() (0.5h)
  - Input validation DTOs (CreateClassifiedDto, UpdateClassifiedDto, FilterClassifiedDto) (1.5h)
- **Effort:** 11 hours

### BE-13.7: Classified Controller
- **Sub-tasks:**
  - Public endpoints: GET list, GET detail (1h)
  - User endpoints: POST create, PUT update, DELETE, GET my-listings (1.5h)
  - Auth guards and ownership checks middleware (1h)
  - Renew endpoint: PATCH /api/classifieds/:id/renew (0.5h)
- **Effort:** 4 hours

### BE-13.8: Classified Image Service
- **Sub-tasks:**
  - ClassifiedImageService.upload() - upload to R2, resize with sharp (2.5h)
  - Image resize pipeline: thumbnail 300x300, medium 800x600, large 1200x900 (1h)
  - Max 8 images enforcement (0.5h)
  - ClassifiedImageService.reorder() (1h)
  - ClassifiedImageService.delete() - remove from R2 and database (0.5h)
  - Ownership validation (only listing owner can manage) (0.5h)
  - ClassifiedImageController (1h)
- **Effort:** 7 hours

### BE-13.9: Meilisearch Integration
- **Sub-tasks:**
  - Create classified search index (1h)
  - Sync classified data on create/update/delete/status change (1.5h)
  - Configure filterable attributes (category, district, price_type, price range) (0.5h)
  - Build search endpoint (0.5h)
- **Effort:** 3.5 hours

### BE-13.10: Moderation Service
- **Sub-tasks:**
  - ModerationService.getQueue() - pending_review listings ordered by created_at (1h)
  - ModerationService.getQueueCount() (0.5h)
  - ModerationService.approve() - set status=active, expires_at=now+30d (1h)
  - ModerationService.reject() - set status=rejected, store reason (1h)
  - ModerationService.remove() - set status=removed (0.5h)
  - Approval/rejection/removal notification emails (2.5h)
  - AdminModerationController (1.5h)
- **Effort:** 8 hours

### BE-13.11: Messaging Service
- **Sub-tasks:**
  - ClassifiedMessageService.sendMessage() - create/find thread, send message (2.5h)
  - Thread creation logic: one thread per (classified_id, buyer_user_id) (1h)
  - ClassifiedMessageService.getInbox() - user's threads with latest message preview (2h)
  - ClassifiedMessageService.getThread() - all messages in a thread (1h)
  - ClassifiedMessageService.markAsRead() (0.5h)
  - ClassifiedMessageService.getUnreadCount() (0.5h)
  - Validation: cannot message own listing, listing must be active (0.5h)
  - Input sanitization (strip HTML from messages) (0.5h)
  - ClassifiedMessageController (2h)
- **Effort:** 10.5 hours

### BE-13.12: Reporting Service
- **Sub-tasks:**
  - ClassifiedReportService.submitReport() with one-per-user check (1.5h)
  - ClassifiedReportService.getReports() for admin (pending, paginated) (1h)
  - ClassifiedReportService.reviewReport() - dismiss or take action (1.5h)
  - Action integration: taking action can remove listing (0.5h)
  - Admin notes storage (0.5h)
  - ClassifiedReportController (user + admin endpoints) (1.5h)
- **Effort:** 6.5 hours

### BE-13.13: Auto-Expiry Cron Job
- **Sub-tasks:**
  - NestJS @Cron daily job to find active classifieds where expires_at < now() (1.5h)
  - Transition matching listings to `expired` status (0.5h)
  - Remove expired listings from Meilisearch index (0.5h)
  - Send expiry notification email with renewal link (1.5h)
  - Build renewal endpoint (reset to pending_review, new expires_at) (1h)
- **Effort:** 5 hours

### BE-13.14: Featured/Premium Flags
- **Sub-tasks:**
  - Admin toggle endpoints: PATCH /api/admin/classifieds/:id/feature and /premium (1h)
  - Featured query: GET /api/classifieds/featured (0.5h)
  - Premium sort boosting in list query (is_premium DESC in ORDER BY) (1h)
- **Effort:** 2.5 hours

### BE-13.15: Sample Data
- **Sub-tasks:**
  - Seed 15-20 classifieds across categories and statuses (1.5h)
  - Upload sample images for seeded classifieds (0.5h)
- **Effort:** 2 hours

### BE-13.16: Integration Tests
- **Sub-tasks:**
  - Classified CRUD flow (create, update, list, filter, delete, ownership) (3h)
  - Image upload flow (upload, max 8, reorder, delete) (1.5h)
  - Moderation flow (submit, queue, approve, reject, notifications) (2h)
  - Messaging flow (send, inbox, thread, read, validation) (2h)
  - Reporting flow (submit, admin review, action) (1.5h)
  - Expiry cron and renewal flow (1.5h)
  - Featured/premium flag tests (0.5h)
- **Effort:** 12 hours

### BE-13.17: API Documentation
- **Sub-tasks:**
  - Swagger annotations for all classifieds endpoints (1.5h)
  - Document messaging API (0.5h)
  - Document moderation workflow (0.5h)
  - Document reporting API (0.5h)
- **Effort:** 3 hours

**Total Backend Effort:** 93 hours

---

## Frontend Tasks (Admin Panel)

### FE-13.1: Admin Moderation Queue Page
- **Sub-tasks:**
  - Queue list ordered by creation date (1.5h)
  - Listing preview card (title, category, user info, image thumbnails, date) (1.5h)
  - Expandable content preview without leaving page (1h)
  - "Approve" button with confirmation (0.5h)
  - "Reject" button with reason input modal (1h)
  - "Remove" button with reason input modal (0.5h)
  - Queue count badge in admin sidebar (0.5h)
  - Filter by category (0.5h)
  - Auto-refresh queue on action (0.5h)
- **Effort:** 7.5 hours

### FE-13.2: Admin Report Review Page
- **Sub-tasks:**
  - Pending reports list (reporter, listing, reason, date) (1.5h)
  - Report detail view (full report with listing link) (1h)
  - "Dismiss" button with confirmation (0.5h)
  - "Take Action" dropdown (remove listing, warn user) (1h)
  - Admin notes text area (0.5h)
  - Reviewed reports history tab (1h)
  - Report count badge in admin sidebar (0.5h)
- **Effort:** 6 hours

### FE-13.3: Admin Classified List Page
- **Sub-tasks:**
  - Table with all classifieds (title, category, user, status, dates) (2h)
  - Status filter dropdown (0.5h)
  - Category filter dropdown (0.5h)
  - Search by title/keyword (0.5h)
  - Status badge color coding (0.5h)
- **Effort:** 4 hours

### FE-13.4: Admin Featured/Premium Controls
- **Sub-tasks:**
  - Featured toggle switch on listing detail/row (0.5h)
  - Premium toggle switch on listing detail/row (0.5h)
  - Confirmation dialog for status changes (0.5h)
- **Effort:** 1.5 hours

**Total Frontend Effort:** 19 hours

---

## DevOps / Infrastructure Tasks

### DEVOPS-13.1: Cloudflare R2 for Classified Images
- **Sub-tasks:**
  - Configure R2 bucket/path for classified images (0.5h)
  - Set up image resize pipeline reusing restaurant pattern (0.5h)
  - Configure CDN caching for classified images (0.5h)
- **Effort:** 1.5 hours

### DEVOPS-13.2: Meilisearch Classified Index
- **Sub-tasks:**
  - Create classified search index (0.5h)
  - Configure filterable attributes (category, district, price_type, price) (0.5h)
  - Configure sortable attributes (created_at, price, is_premium) (0.5h)
- **Effort:** 1.5 hours

### DEVOPS-13.3: Cron Job Configuration
- **Sub-tasks:**
  - Configure expiry cron job schedule (daily at 03:00 Europe/Berlin) (0.5h)
  - Set up monitoring and alerting for cron (0.5h)
- **Effort:** 1 hour

### DEVOPS-13.4: Email Templates
- **Sub-tasks:**
  - Deploy approval email template (0.5h)
  - Deploy rejection email template (0.5h)
  - Deploy expiry notification email template (0.5h)
  - Test all email templates in staging (0.5h)
- **Effort:** 2 hours

**Total DevOps Effort:** 6 hours

---

## QA Tasks

### QA-13.1: Classified CRUD Tests
- **Test Scenarios:**
  1. Create classified with all required fields - status is pending_review
  2. Create classified with optional fields omitted - verify defaults
  3. Create classified with invalid data - verify validation errors
  4. Update classified - owner can update
  5. Update classified - non-owner gets 403
  6. Delete classified - owner can delete (soft delete)
  7. Delete classified - non-owner gets 403
  8. List classifieds - only active listings visible to public
  9. Filter by category - correct results
  10. Filter by district - correct results
  11. Filter by price range - correct results
  12. Keyword search via Meilisearch - relevant results
  13. My listings - shows all statuses for authenticated user
  14. Detail by slug - returns all data with images and category
- **Effort:** 6 hours

### QA-13.2: Image Upload Tests
- **Test Scenarios:**
  1. Upload single image - stored in R2, all sizes generated
  2. Upload multiple images - all stored correctly
  3. Upload 8th image - accepted
  4. Upload 9th image - rejected with error
  5. Reorder images - sort_order updated
  6. Delete image - removed from R2 and database
  7. Non-owner upload attempt - 403
  8. Invalid file type - rejected
  9. Oversized file (>5MB) - rejected
  10. First uploaded image is primary/cover
- **Effort:** 4 hours

### QA-13.3: Moderation Flow Tests
- **Test Scenarios:**
  1. New listing appears in moderation queue
  2. Queue ordered by creation date (oldest first)
  3. Approve listing - status changes to active, expires_at set
  4. Reject listing - status changes to rejected, reason stored
  5. Remove listing - status changes to removed
  6. Approval email sent to user
  7. Rejection email sent with reason
  8. Queue count updates after action
  9. Approved listing visible in public search
  10. Rejected listing not visible in public search
- **Effort:** 5 hours

### QA-13.4: Messaging System Tests
- **Test Scenarios:**
  1. Send first message about a listing - thread created
  2. Reply in thread - message added to same thread
  3. Inbox shows all threads with latest message preview
  4. Thread view shows all messages in order
  5. Mark message as read - is_read updates
  6. Unread count returns correct number
  7. Cannot message own listing
  8. Cannot message inactive listing
  9. Unauthenticated message attempt - 401
  10. Messages are sanitized (no HTML)
- **Effort:** 5 hours

### QA-13.5: Reporting Tests
- **Test Scenarios:**
  1. Submit report on a listing - created with pending status
  2. Submit duplicate report (same user, same listing) - rejected
  3. Admin sees pending reports in queue
  4. Admin dismisses report - status changes
  5. Admin takes action - listing removed
  6. Admin notes saved on report
  7. Unauthenticated report attempt - 401
- **Effort:** 3 hours

### QA-13.6: Expiry and Featured Tests
- **Test Scenarios:**
  1. Active listing with expires_at in past - cron transitions to expired
  2. Expiry notification email sent
  3. Renew expired listing - status back to pending_review, new expires_at
  4. Featured toggle - listing appears in featured query
  5. Premium toggle - listing boosted in sort order
  6. Featured listing not shown if not active
- **Effort:** 3 hours

### QA-13.7: Admin Panel Tests
- **Test Scenarios:**
  1. Moderation queue page loads with pending listings
  2. Approve/reject/remove actions work from queue
  3. Report review page shows pending reports
  4. Dismiss/action work from report review
  5. Classified list page shows all statuses
  6. Featured/premium toggles work
  7. Non-admin access blocked
- **Effort:** 3 hours

**Total QA Effort:** 29 hours

---

## Dependencies

| Blocked Task | Depends On | Notes |
|---|---|---|
| BE-13.6 (Classified Service) | BE-13.1-13.5 (All schema migrations) | Tables must exist |
| BE-13.8 (Image Service) | BE-13.3 (classified_images table), DEVOPS-13.1 (R2 config) | Storage must be ready |
| BE-13.9 (Meilisearch) | BE-13.6 (Classified Service), DEVOPS-13.2 (Index config) | Need classified data and index |
| BE-13.10 (Moderation) | BE-13.6 (Classified Service) | Moderation acts on classified status |
| BE-13.11 (Messaging) | BE-13.4 (Messages table), BE-13.6 (Classified Service) | Need both tables |
| BE-13.12 (Reporting) | BE-13.5 (Reports table), BE-13.6 (Classified Service) | Need both tables |
| BE-13.13 (Expiry Cron) | BE-13.6 (Classified Service), DEVOPS-13.3 (Cron config) | Cron acts on classified status |
| FE-13.1 (Moderation Queue) | BE-13.10 (Moderation Service) | Needs moderation endpoints |
| FE-13.2 (Report Review) | BE-13.12 (Reporting Service) | Needs report endpoints |
| FE-13.3 (Classified List) | BE-13.6 (Classified Service) | Needs list endpoint with admin filter |
| BE-13.10 (Notification emails) | Email service (prior sprints), DEVOPS-13.4 (Templates) | Email must be functional |

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Messaging system complexity (thread management) | High | Medium | Keep thread model simple (one thread per classified+buyer pair); defer real-time notifications |
| Moderation queue becoming backlogged | Medium | Medium | Implement batch approve/reject; consider auto-moderation rules in future |
| Image upload abuse (large files, many requests) | Medium | High | Enforce max 8 images, max 5MB per image; rate limiting on upload endpoint |
| Classified spam (fake listings) | Medium | High | Mandatory moderation review; rate limit listing creation (max 5 per day per user) |
| Auto-expiry cron affecting valid listings | Low | Medium | Send warning email 3 days before expiry (future enhancement); clear renewal path |
| Report abuse (false reports) | Medium | Low | One-per-user-per-listing constraint; admin reviews all reports before action |

---

## Deliverables Checklist

- [ ] `classified_categories` table with seeded categories (hierarchical)
- [ ] `classifieds` table with all columns, enums, indexes
- [ ] `classified_images` table
- [ ] `classified_messages` table with thread support
- [ ] `classified_reports` table
- [ ] Classified categories API (tree structure)
- [ ] Classified CRUD API with user ownership enforcement
- [ ] Classified filtering (category, district, price range, keyword search)
- [ ] Meilisearch integration for classifieds
- [ ] Image upload (max 8) with resize pipeline
- [ ] Moderation workflow (pending_review -> approve/reject/remove)
- [ ] Moderation notification emails (approved, rejected, removed)
- [ ] Messaging system (send, inbox, threads, read status)
- [ ] Reporting system (submit, admin review, action)
- [ ] 30-day auto-expiry cron job
- [ ] Expiry notification email with renewal link
- [ ] Renewal endpoint
- [ ] Featured/premium flags with sort boosting
- [ ] Admin moderation queue page
- [ ] Admin report review page
- [ ] Admin classified list page
- [ ] Admin featured/premium controls
- [ ] Integration test suite passing
- [ ] API documentation complete
- [ ] 15-20 sample classifieds seeded

---

## Definition of Done

- [ ] All user stories meet their acceptance criteria
- [ ] User ownership enforced on all create/update/delete operations
- [ ] Moderation workflow functions end-to-end (submit -> review -> approve/reject)
- [ ] Messaging threads work correctly (create, reply, inbox, read status)
- [ ] Reports can be submitted and reviewed by admin
- [ ] 30-day auto-expiry cron runs daily and transitions expired listings
- [ ] Renewal path works (expired -> pending_review with new expiry)
- [ ] Max 8 images enforced per listing
- [ ] Featured/premium flags affect listing visibility and sort order
- [ ] Notification emails sent on approval, rejection, removal, and expiry
- [ ] Meilisearch returns relevant search results
- [ ] Integration tests cover all major flows
- [ ] API documentation complete (Swagger/OpenAPI)
- [ ] No P1 or P2 bugs open
- [ ] Code reviewed and merged to main branch

---

## Sprint Review Demo Script

1. **Classified Categories (1 min)**
   - Call `GET /api/classified-categories` and show hierarchical tree
   - Highlight parent/child relationship (Housing -> Rent, Flatshare, Sublet)

2. **Creating a Classified Listing (3 min)**
   - Create a listing via API (or Postman) as an authenticated user
   - Show listing created with `pending_review` status
   - Upload 3 images, show resize results (thumbnail, medium, large)
   - Attempt to upload 9th image: show rejection

3. **Moderation Workflow (3 min)**
   - Open admin moderation queue
   - Show pending listing with preview
   - Approve the listing: status changes to `active`, expires_at set
   - Show approval email sent to user
   - Create another listing, reject it with reason
   - Show rejection email with reason

4. **Public Listing and Search (2 min)**
   - Show approved listing in public search results
   - Apply category and district filters
   - Search by keyword via Meilisearch
   - Show listing detail with images

5. **Messaging System (3 min)**
   - As a different user, send a message about the listing
   - Show thread created
   - Reply as the listing owner
   - Show inbox with thread preview
   - Show unread count

6. **Reporting (1 min)**
   - Report a listing (select reason: spam)
   - Admin: review report, take action (remove listing)

7. **Auto-Expiry (1 min)**
   - Show listing with expires_at date
   - Manually trigger cron (or show pre-expired listing)
   - Show expiry email with renewal link
   - Renew the listing: show status back to pending_review

8. **Featured/Premium (1 min)**
   - Toggle featured flag on a listing
   - Show listing in featured query
   - Toggle premium flag
   - Show listing boosted in sort order

---

## Rollover Criteria

A story or task rolls over to Sprint 14 if:
- Messaging system thread management has unresolved edge cases requiring >2 extra days
- Moderation email delivery issues require infrastructure changes
- Image upload pipeline has performance issues under load
- Report review workflow needs design changes based on admin feedback

**Candidates for rollover (if needed):**
1. Admin report review interface (reports can be reviewed via API initially)
2. Premium sort boosting (can be added after core classifieds work)
3. Renewal notification email (users can renew manually via my-listings)
4. Meilisearch integration (basic SQL filtering can suffice initially)
