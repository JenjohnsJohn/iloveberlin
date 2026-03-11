# Sprint 12: Competitions

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 12 |
| **Sprint Name** | Competitions |
| **Duration** | 2 weeks (10 working days) |
| **Dates** | Weeks 23-24 (relative to project start) |
| **Team** | 2 Frontend, 2 Backend, 1 QA, 0.5 DevOps |

## Sprint Goal

Deliver the complete competitions feature -- from database schema and backend logic (entry management, one-per-user enforcement, status transitions, winner selection with notification, and archive queries) through to a polished frontend with countdown timers, entry forms, and archive browsing -- while conducting the Phase 2 retrospective to refine processes for the final project phase.

---

## User Stories

### US-12.1: Competition Data Model
**ID:** US-12.1
**As a** developer, **I want to** have competitions and competition entries tables **so that** the platform can run prize competitions.

**Acceptance Criteria:**
- [ ] `competitions` table: id, title, slug, description (rich text), prize_description, prize_value, image_url, entry_type (enum: form, quiz, share), entry_question (for quiz type), terms_conditions (rich text), status (enum: draft, active, closed, judging, completed, archived), start_date, end_date, winner_announcement_date, max_entries (nullable), entry_count (cached counter), sponsor_name, sponsor_logo_url, sponsor_url, created_at, updated_at
- [ ] `competition_entries` table: id, competition_id, user_id, answer (for quiz type), entry_data (JSON for form fields), ip_address, user_agent, status (enum: pending, valid, invalid, winner), created_at
- [ ] Unique constraint on (competition_id, user_id) for one-per-user enforcement
- [ ] Indexes on competitions(status, end_date) and entries(competition_id, user_id)

### US-12.2: Competition CRUD and Management
**ID:** US-12.2
**As an** admin, **I want to** create and manage competitions **so that** I can run engaging promotions for the audience.

**Acceptance Criteria:**
- [ ] `POST /api/admin/competitions` creates a competition (draft status)
- [ ] `PUT /api/admin/competitions/:id` updates competition details
- [ ] `DELETE /api/admin/competitions/:id` soft-deletes (archived status)
- [ ] `GET /api/competitions` returns active competitions for public
- [ ] `GET /api/competitions/:slug` returns competition detail
- [ ] `GET /api/competitions/archive` returns completed/archived competitions
- [ ] Admin can view all competitions regardless of status
- [ ] Admin can filter by status, date range

### US-12.3: Competition Entry System
**ID:** US-12.3
**As a** logged-in user, **I want to** enter a competition **so that** I have a chance to win prizes.

**Acceptance Criteria:**
- [ ] `POST /api/competitions/:id/enter` submits an entry
- [ ] User must be authenticated to enter
- [ ] One entry per user per competition (enforced at database and application level)
- [ ] Entry includes answer (quiz type) or entry_data (form type)
- [ ] IP address and user agent captured for fraud prevention
- [ ] Entry count on competition is incremented atomically
- [ ] Entry rejected if competition is not in `active` status
- [ ] Entry rejected if competition end_date has passed
- [ ] Entry rejected if max_entries reached
- [ ] User receives confirmation response with entry ID

### US-12.4: Competition Status Transitions
**ID:** US-12.4
**As a** system, **I want to** manage competition lifecycle through status transitions **so that** competitions progress through defined stages.

**Acceptance Criteria:**
- [ ] Valid transitions: draft -> active, active -> closed, closed -> judging, judging -> completed, completed -> archived
- [ ] Invalid transitions are rejected with error
- [ ] Transition from active to closed can be triggered manually or by cron (when end_date passes)
- [ ] Cron job runs daily to close expired active competitions
- [ ] Status change emits event for downstream processing (notifications, homepage update)
- [ ] Admin can manually trigger any valid transition via `PATCH /api/admin/competitions/:id/status`

### US-12.5: Winner Selection and Notification
**ID:** US-12.5
**As an** admin, **I want to** select competition winners and notify them **so that** prizes can be awarded.

**Acceptance Criteria:**
- [ ] `POST /api/admin/competitions/:id/select-winner` selects winner(s) from entries
- [ ] Admin can select winner manually (pick entry ID) or randomly (system selects)
- [ ] Selected entry status changes to `winner`
- [ ] Winner notification sent via email (using existing email service)
- [ ] Email includes: congratulations message, prize details, claim instructions
- [ ] Competition status transitions to `completed` after winner announcement
- [ ] Winner info visible on competition detail (after announcement date)
- [ ] Admin can select multiple winners if needed

### US-12.6: Competitions Landing Page
**ID:** US-12.6
**As a** visitor, **I want to** browse active competitions **so that** I can find contests to enter.

**Acceptance Criteria:**
- [ ] Competitions landing page at `/competitions`
- [ ] Active competitions displayed as large cards
- [ ] Each card shows: image, title, prize description, countdown timer, entry count
- [ ] Countdown timer shows days, hours, minutes until end_date
- [ ] Cards link to competition detail page
- [ ] "Past Competitions" link to archive page
- [ ] Empty state when no active competitions
- [ ] Responsive layout

### US-12.7: Competition Detail Page
**ID:** US-12.7
**As a** visitor, **I want to** view full competition details and enter **so that** I can participate in the contest.

**Acceptance Criteria:**
- [ ] Full competition details: image, title, description, prize, countdown timer, sponsor info
- [ ] Entry form displayed for authenticated users (if competition is active)
- [ ] Quiz type: display question with answer input
- [ ] Form type: render dynamic form fields from entry_data schema
- [ ] Terms and conditions section with acceptance checkbox
- [ ] "Already entered" state if user has submitted an entry
- [ ] Entry confirmation display after successful submission
- [ ] Closed/completed state: "This competition has ended"
- [ ] Winner announcement section (after winner_announcement_date)
- [ ] Countdown timer (live updating, every second)
- [ ] Share buttons for social media

### US-12.8: Competition Archive Page
**ID:** US-12.8
**As a** visitor, **I want to** browse past competitions **so that** I can see previous contests and winners.

**Acceptance Criteria:**
- [ ] Archive page at `/competitions/archive`
- [ ] List of completed/archived competitions
- [ ] Each card shows: image, title, winner name (if announced), completion date
- [ ] Pagination (12 per page)
- [ ] Cards link to competition detail (read-only)
- [ ] Responsive layout

### US-12.9: Admin Competition Management
**ID:** US-12.9
**As an** admin, **I want to** manage competitions through the admin panel **so that** I can run the full competition lifecycle.

**Acceptance Criteria:**
- [ ] Competition list with status filter, search
- [ ] Competition create/edit form with all fields (including rich text editors)
- [ ] Status transition buttons (context-aware: show only valid transitions)
- [ ] Entries list view for each competition (with search, export to CSV)
- [ ] Winner selection interface (manual pick or random selection)
- [ ] Winner notification trigger button
- [ ] Entry count display
- [ ] Sponsor logo upload

### US-12.10: Countdown Timer Component
**ID:** US-12.10
**As a** visitor, **I want to** see a live countdown timer on competitions **so that** I know how much time remains to enter.

**Acceptance Criteria:**
- [ ] Displays days, hours, minutes, seconds
- [ ] Updates every second in real-time
- [ ] Shows "Competition ended" when timer reaches zero
- [ ] Handles timezone correctly (Europe/Berlin)
- [ ] Reusable component for cards and detail pages
- [ ] Accessible (aria-live for screen readers)

### US-12.11: Phase 2 Retrospective
**ID:** US-12.11
**As a** team, **we want to** conduct a Phase 2 retrospective **so that** we can improve processes for the remaining sprints.

**Acceptance Criteria:**
- [ ] Retrospective session scheduled for Day 9 or 10
- [ ] Review of Sprints 8-12 (Phase 2) outcomes
- [ ] Identify what went well, what could improve, action items
- [ ] Document velocity trends and estimation accuracy
- [ ] Update processes/templates based on learnings
- [ ] Carry forward action items to Sprint 13

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Create `competitions` table migration | Backend 1 | 3h | Full schema with enums, indexes, all columns |
| Create `competition_entries` table migration | Backend 1 | 2h | Schema with unique constraint, indexes |
| Build CompetitionEntity with TypeORM decorators | Backend 2 | 2h | All columns, relations, enum types |
| Build CompetitionEntryEntity | Backend 2 | 1h | Columns, relations, unique constraint |
| Design status transition state machine | Backend 2 | 2h | Map valid transitions, document in code |

#### Day 2 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build CompetitionService - create and update | Backend 1 | 4h | CRUD with validation, slug generation |
| Build CompetitionService - list and detail | Backend 1 | 3h | Public queries (active only), admin queries (all statuses), by slug |
| Build CompetitionService - archive query | Backend 2 | 2h | Completed/archived competitions with pagination |
| Build CompetitionService - status transition logic | Backend 2 | 4h | State machine enforcement, transition validation, event emission |

#### Day 3 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build CompetitionEntryService | Backend 1 | 5h | Create entry with one-per-user check, max entries check, status check, atomic counter |
| Build CompetitionController (public endpoints) | Backend 1 | 3h | GET list, GET detail, POST entry |
| Build status transition cron job | Backend 2 | 3h | Daily cron to close expired active competitions |
| Build AdminCompetitionController | Backend 2 | 3h | Admin CRUD, status transition, entry list |

#### Day 4 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build winner selection service | Backend 1 | 4h | Manual pick and random selection logic, winner status update |
| Build winner notification email | Backend 1 | 3h | Email template, send via email service, prize details |
| Build entry export to CSV | Backend 2 | 2h | Stream entries as CSV download for admin |
| Backend unit tests - competition CRUD and entries | Backend 2 | 4h | Create, enter, duplicate entry rejection, max entries |

#### Day 5 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Backend unit tests - status transitions | Backend 1 | 3h | Valid/invalid transitions, cron job behavior |
| Backend unit tests - winner selection | Backend 1 | 2h | Manual/random selection, notification |
| Scaffold competitions frontend module | Frontend 1 | 3h | Create /competitions route, types, hooks |
| Build countdown timer component | Frontend 2 | 4h | Days/hours/minutes/seconds, real-time update, timezone handling |
| Seed sample competitions (5-6 in various statuses) | Backend 2 | 2h | Active, closed, completed with sample entries |

### Week 2 (Days 6-10)

#### Day 6 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build competitions landing page | Frontend 1 | 5h | Competition cards with image, title, prize, countdown, entry count |
| Build competition detail page layout | Frontend 2 | 5h | Full details, prize section, sponsor info, countdown |
| Integration tests - full competition lifecycle | Backend 1 | 4h | Create -> activate -> enter -> close -> judge -> select winner -> complete |
| API documentation for competition endpoints | Backend 2 | 2h | Swagger annotations |

#### Day 7 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build entry form on detail page | Frontend 1 | 5h | Quiz answer input, form-type dynamic fields, terms checkbox, submit |
| Build "Already entered" and confirmation states | Frontend 1 | 2h | State handling for entered/confirmed |
| Build competition archive page | Frontend 2 | 3h | Completed competitions list, winner display, pagination |
| Build closed/completed states on detail page | Frontend 2 | 2h | "Competition ended" messaging, winner announcement section |

#### Day 8 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin competition list page | Frontend 1 | 3h | Table with status filter, search, status badges |
| Admin competition create/edit form | Frontend 1 | 5h | All fields, rich text editors, entry type selector, sponsor upload |
| Admin entries list and export | Frontend 2 | 4h | Entries table with search, CSV export button |
| Admin winner selection interface | Frontend 2 | 3h | Entry list with "Select as winner" button, random selection button |

#### Day 9 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin status transition buttons | Frontend 1 | 2h | Context-aware buttons showing only valid next states |
| Admin winner notification trigger | Frontend 2 | 1.5h | "Send notification" button with confirmation |
| Responsive design - all competition pages | Frontend 1 + 2 | 4h | Mobile cards, form, countdown, archive |
| QA: Test competition landing and detail | QA | 4h | Cards, countdown, entry form, states |
| Phase 2 retrospective session (team) | All | 2h | Sprints 8-12 review, actions |

#### Day 10 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| QA: Test competition entry flow | QA | 4h | Enter, duplicate rejection, max entries, auth check |
| QA: Test admin management | QA | 3h | CRUD, status transitions, winner selection, notifications |
| Bug fixes from QA | Frontend 1 + 2 | 4h | Address P1/P2 issues |
| Update homepage competitions section with real data | Frontend 2 | 2h | Wire homepage to live competitions API |
| Cross-browser testing | QA | 2h | Countdown timer, forms, all browsers |
| Sprint review demo preparation | Frontend 1 | 2h | Demo script, test data |
| Document retrospective action items | Backend 1 | 1h | Write up and distribute findings |

---

## Backend Tasks

### BE-12.1: Competitions Schema
- **Sub-tasks:**
  - Create `competitions` table migration with all columns (2h)
  - Define status enum (draft, active, closed, judging, completed, archived) (0.5h)
  - Define entry_type enum (form, quiz, share) (0.5h)
  - Add indexes on (status, end_date), slug unique (0.5h)
- **Effort:** 3.5 hours

### BE-12.2: Competition Entries Schema
- **Sub-tasks:**
  - Create `competition_entries` table migration (1h)
  - Add unique constraint on (competition_id, user_id) (0.5h)
  - Define entry status enum (pending, valid, invalid, winner) (0.5h)
  - Add index on (competition_id, user_id) (0.5h)
- **Effort:** 2.5 hours

### BE-12.3: Competition Entities
- **Sub-tasks:**
  - Build CompetitionEntity with all TypeORM decorators and relations (1.5h)
  - Build CompetitionEntryEntity with relations and constraints (1h)
- **Effort:** 2.5 hours

### BE-12.4: Competition Service - CRUD
- **Sub-tasks:**
  - CompetitionService.create() with slug generation (1.5h)
  - CompetitionService.update() with validation (1h)
  - CompetitionService.softDelete() (transition to archived) (0.5h)
  - CompetitionService.findActive() for public listing (1h)
  - CompetitionService.findBySlug() with entry count (1h)
  - CompetitionService.findArchived() with pagination (1h)
  - CompetitionService.findAll() for admin with status filter (1h)
  - Input validation DTOs (1h)
- **Effort:** 8 hours

### BE-12.5: Competition Entry Service
- **Sub-tasks:**
  - CompetitionEntryService.create() with one-per-user enforcement (2h)
  - Validate competition status is `active` (0.5h)
  - Validate competition end_date not passed (0.5h)
  - Validate max_entries not reached (0.5h)
  - Capture IP address and user agent (0.5h)
  - Atomic entry_count increment on competition (1h)
  - Return confirmation with entry ID (0.5h)
  - CompetitionEntryService.findByCompetition() for admin (1h)
  - CompetitionEntryService.exportToCsv() (1.5h)
- **Effort:** 8 hours

### BE-12.6: Status Transition Logic
- **Sub-tasks:**
  - Define state machine (valid transitions map) (1h)
  - CompetitionService.transitionStatus() with validation (2h)
  - Emit status change events (NestJS EventEmitter) (1h)
  - PATCH /api/admin/competitions/:id/status endpoint (0.5h)
- **Effort:** 4.5 hours

### BE-12.7: Status Transition Cron Job
- **Sub-tasks:**
  - NestJS @Cron daily job to find active competitions past end_date (1.5h)
  - Transition matching competitions to `closed` status (1h)
  - Log transitions and emit events (0.5h)
- **Effort:** 3 hours

### BE-12.8: Winner Selection Service
- **Sub-tasks:**
  - CompetitionService.selectWinnerManually(competitionId, entryId) (1.5h)
  - CompetitionService.selectWinnerRandomly(competitionId, count) (2h)
  - Update winning entry status to `winner` (0.5h)
  - Transition competition to `completed` status (0.5h)
  - Support multiple winners (0.5h)
- **Effort:** 5 hours

### BE-12.9: Winner Notification
- **Sub-tasks:**
  - Design winner email template (congratulations, prize, instructions) (1.5h)
  - Build NotificationService.sendWinnerEmail() (1.5h)
  - Trigger notification on winner selection or manually (0.5h)
  - Log notification sent status (0.5h)
- **Effort:** 4 hours

### BE-12.10: Controllers
- **Sub-tasks:**
  - CompetitionController (public: list active, detail, enter) (2h)
  - AdminCompetitionController (CRUD, status transition, entries, winner selection, notification trigger, CSV export) (3h)
- **Effort:** 5 hours

### BE-12.11: Sample Data
- **Sub-tasks:**
  - Seed 2 active competitions with different entry types (0.5h)
  - Seed 1 closed competition with entries (0.5h)
  - Seed 1 completed competition with winner (0.5h)
  - Seed 1 archived competition (0.5h)
- **Effort:** 2 hours

### BE-12.12: Backend Tests
- **Sub-tasks:**
  - Competition CRUD unit tests (2h)
  - Entry submission tests (one-per-user, max entries, status check) (2.5h)
  - Status transition tests (valid/invalid transitions) (2h)
  - Winner selection tests (manual and random) (1.5h)
  - Cron job tests (1h)
  - Full lifecycle integration test (2h)
- **Effort:** 11 hours

### BE-12.13: API Documentation
- **Sub-tasks:**
  - Swagger annotations for all competition endpoints (1.5h)
  - Document status transition rules (0.5h)
  - Document entry validation rules (0.5h)
- **Effort:** 2.5 hours

**Total Backend Effort:** 61.5 hours

---

## Frontend Tasks

### FE-12.1: Countdown Timer Component
- **Sub-tasks:**
  - Build CountdownTimer component with days/hours/minutes/seconds display (2h)
  - setInterval updating every second (0.5h)
  - Handle timezone (Europe/Berlin to user local) (0.5h)
  - "Competition ended" state when timer reaches zero (0.5h)
  - Compact variant for cards and full variant for detail pages (0.5h)
  - Accessibility: aria-live region for screen readers (0.5h)
  - Cleanup interval on unmount (0.5h)
- **Effort:** 5 hours

### FE-12.2: Competitions Landing Page
- **Sub-tasks:**
  - Create `/competitions` page route (0.5h)
  - Competition card component (image, title, prize, countdown, entry count) (2.5h)
  - Card grid layout (responsive: 2 columns desktop, 1 mobile) (1h)
  - Integrate countdown timer on each card (0.5h)
  - "Past Competitions" link to archive (0.5h)
  - Empty state (no active competitions) (0.5h)
  - Loading skeleton (0.5h)
- **Effort:** 6 hours

### FE-12.3: Competition Detail Page
- **Sub-tasks:**
  - Create `/competitions/[slug]` dynamic route (0.5h)
  - Hero image section (1h)
  - Competition info: title, description (rich text), prize description, prize value (2h)
  - Countdown timer (full variant) (0.5h)
  - Sponsor section (logo, name, link) (1h)
  - Terms and conditions section (collapsible) (1h)
  - Share buttons (copy link, social media) (1h)
  - Entry count display (0.5h)
  - SSR for SEO (0.5h)
- **Effort:** 8 hours

### FE-12.4: Entry Form
- **Sub-tasks:**
  - Quiz type: question display with text input answer (1.5h)
  - Form type: dynamic form field rendering from schema (2.5h)
  - Terms acceptance checkbox (required) (0.5h)
  - Submit button with loading state (0.5h)
  - Form validation (client-side) (1h)
  - API submission with error handling (1h)
  - "Already entered" state display (0.5h)
  - Entry confirmation display after submission (0.5h)
  - Auth check: show login prompt for unauthenticated users (1h)
- **Effort:** 9 hours

### FE-12.5: Competition States
- **Sub-tasks:**
  - Active state: show entry form and countdown (included in FE-12.3/12.4)
  - Closed state: "Competition has ended - winners being selected" (0.5h)
  - Judging state: "Winners are being selected" with illustration (0.5h)
  - Completed state: winner announcement section (1.5h)
  - Winner display: winner name (or initials for privacy), prize details (1h)
  - Archived state: read-only with "This competition has concluded" (0.5h)
- **Effort:** 4 hours

### FE-12.6: Competition Archive Page
- **Sub-tasks:**
  - Create `/competitions/archive` route (0.5h)
  - Archive card (image, title, winner name, completion date) (1.5h)
  - Card grid with pagination (12 per page) (1h)
  - Responsive layout (0.5h)
  - Link to detail page (read-only) (0.5h)
- **Effort:** 4 hours

### FE-12.7: Admin Competition List Page
- **Sub-tasks:**
  - Table with columns: title, status badge, entry count, dates, actions (2h)
  - Status filter dropdown (0.5h)
  - Search by title (0.5h)
  - Status badge color coding (draft=gray, active=green, closed=yellow, etc.) (0.5h)
- **Effort:** 3.5 hours

### FE-12.8: Admin Competition Create/Edit Form
- **Sub-tasks:**
  - Form layout with all competition fields (2h)
  - Rich text editor for description and terms_conditions (1.5h)
  - Entry type selector (form/quiz/share) with conditional fields (1h)
  - Date pickers for start, end, winner announcement dates (1h)
  - Sponsor section (name, logo upload, URL) (1h)
  - Image upload for competition image (0.5h)
  - Form validation (1h)
  - API integration (create/update) (1h)
- **Effort:** 9 hours

### FE-12.9: Admin Entries Management
- **Sub-tasks:**
  - Entries list table for a competition (user, date, answer/data, status) (2h)
  - Search entries by user (0.5h)
  - CSV export button (download trigger) (0.5h)
  - Entry detail modal (0.5h)
- **Effort:** 3.5 hours

### FE-12.10: Admin Winner Selection
- **Sub-tasks:**
  - "Select as winner" button on entry rows (1h)
  - "Random selection" button with winner count input (1.5h)
  - Winner confirmation dialog (0.5h)
  - "Send notification" button with confirmation (0.5h)
  - Winner badge/highlight on entry list (0.5h)
- **Effort:** 4 hours

### FE-12.11: Admin Status Transitions
- **Sub-tasks:**
  - Status transition buttons (context-aware: only show valid transitions) (1h)
  - Confirmation dialog for each transition (0.5h)
  - Status change reflects immediately in UI (0.5h)
- **Effort:** 2 hours

### FE-12.12: Homepage Competitions Section Update
- **Sub-tasks:**
  - Wire homepage competitions section to live API (1h)
  - Replace placeholder data with real active competitions (0.5h)
  - Integrate countdown timer component (0.5h)
- **Effort:** 2 hours

### FE-12.13: Responsive Design Pass
- **Sub-tasks:**
  - Landing page: mobile card layout, countdown timer sizing (1h)
  - Detail page: mobile layout, form fields, countdown, terms (1.5h)
  - Archive page: mobile card stack (0.5h)
  - Admin pages: responsive tables and forms (1h)
- **Effort:** 4 hours

**Total Frontend Effort:** 64 hours

---

## DevOps / Infrastructure Tasks

### DEVOPS-12.1: Competition Image Storage
- **Sub-tasks:**
  - Configure R2 path for competition images and sponsor logos (0.5h)
  - Set up image resize for competition hero images (0.5h)
- **Effort:** 1 hour

### DEVOPS-12.2: Email Service Verification
- **Sub-tasks:**
  - Verify email service supports winner notification template (0.5h)
  - Test email delivery in staging environment (0.5h)
  - Configure email rate limiting for bulk winner notifications (0.5h)
- **Effort:** 1.5 hours

### DEVOPS-12.3: Cron Job Monitoring
- **Sub-tasks:**
  - Add monitoring for competition status transition cron (0.5h)
  - Alert on cron failure (0.5h)
- **Effort:** 1 hour

**Total DevOps Effort:** 3.5 hours

---

## QA Tasks

### QA-12.1: Competition Landing Page Tests
- **Test Scenarios:**
  1. Landing page shows only active competitions
  2. Competition cards display all required info (image, title, prize, countdown, entries)
  3. Countdown timer updates every second
  4. Countdown shows "Competition ended" at zero
  5. Cards link to correct detail pages
  6. "Past Competitions" link navigates to archive
  7. Empty state displays when no active competitions
  8. Responsive layout on mobile
- **Effort:** 4 hours

### QA-12.2: Competition Detail and Entry Tests
- **Test Scenarios:**
  1. Detail page shows all competition information
  2. Countdown timer is accurate (matches end_date in Europe/Berlin timezone)
  3. Entry form displays for authenticated user on active competition
  4. Quiz type: question and answer input display correctly
  5. Form type: dynamic fields render correctly
  6. Terms checkbox is required before submission
  7. Successful entry shows confirmation
  8. Second entry attempt shows "Already entered"
  9. Unauthenticated user sees login prompt
  10. Closed competition shows "Competition ended" (no form)
  11. Completed competition shows winner announcement
  12. Share buttons function correctly
- **Effort:** 6 hours

### QA-12.3: Competition Entry Backend Tests
- **Test Scenarios:**
  1. Submit entry to active competition - success
  2. Submit duplicate entry (same user) - rejected
  3. Submit entry to closed competition - rejected
  4. Submit entry to draft competition - rejected
  5. Submit entry when max_entries reached - rejected
  6. Entry count increments correctly
  7. IP address and user agent captured
  8. Unauthenticated entry attempt - 401
  9. Quiz answer stored correctly
  10. Form data (JSON) stored correctly
- **Effort:** 5 hours

### QA-12.4: Status Transition Tests
- **Test Scenarios:**
  1. draft -> active: succeeds
  2. active -> closed: succeeds
  3. closed -> judging: succeeds
  4. judging -> completed: succeeds
  5. completed -> archived: succeeds
  6. active -> draft: fails (invalid)
  7. closed -> active: fails (invalid)
  8. Cron: active competition past end_date transitions to closed
  9. Cron: active competition before end_date stays active
- **Effort:** 4 hours

### QA-12.5: Winner Selection Tests
- **Test Scenarios:**
  1. Manual winner selection - entry status changes to winner
  2. Random winner selection - a valid entry is selected
  3. Multiple winners selection - all entries marked as winner
  4. Winner notification email sent - verify email content
  5. Competition transitions to completed after winner selection
  6. Winner info visible on detail page after announcement date
  7. Winner info hidden before announcement date
- **Effort:** 4 hours

### QA-12.6: Admin Panel Tests
- **Test Scenarios:**
  1. Competition list with status filter and search
  2. Create competition form validates and saves
  3. Edit competition form pre-fills and updates
  4. Status transition buttons show only valid transitions
  5. Entries list shows all entries for a competition
  6. CSV export downloads file with correct data
  7. Winner selection interface works (manual and random)
  8. Notification trigger sends email
  9. Non-admin access blocked
- **Effort:** 4 hours

### QA-12.7: Cross-Browser Testing
- **Test Scenarios:**
  1. Countdown timer renders correctly on all browsers
  2. Entry form submission on all browsers
  3. Countdown timer on iOS Safari (battery/background tab behavior)
  4. Responsive layout verification
- **Effort:** 2 hours

**Total QA Effort:** 29 hours

---

## Dependencies

| Blocked Task | Depends On | Notes |
|---|---|---|
| BE-12.4 (Competition Service) | BE-12.1, BE-12.2 (Schema migrations) | Tables must exist |
| BE-12.5 (Entry Service) | BE-12.3 (Entities), BE-12.4 (Competition Service) | Needs competition validation |
| BE-12.6 (Status Transitions) | BE-12.4 (Competition Service) | Built on top of CRUD service |
| BE-12.8 (Winner Selection) | BE-12.5 (Entry Service), BE-12.6 (Status Transitions) | Needs entries and status machine |
| BE-12.9 (Winner Notification) | Email service (prior sprint), BE-12.8 (Winner Selection) | Needs email infrastructure |
| FE-12.2 (Landing Page) | BE-12.4 (Competition list API) | Needs active competitions data |
| FE-12.3 (Detail Page) | BE-12.4 (Competition detail API) | Needs competition detail data |
| FE-12.4 (Entry Form) | BE-12.5 (Entry endpoint) | Needs entry submission API |
| FE-12.7-12.11 (Admin) | BE-12.4-12.9 (All backend) | Admin UI needs all backend endpoints |
| FE-12.12 (Homepage Update) | Homepage module (Sprint 11), competitions API | Wire live data |

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Countdown timer accuracy across timezones | Medium | Medium | Use UTC on backend; convert to local on frontend; test with multiple timezones |
| One-per-user enforcement race condition | Low | High | Database unique constraint as ultimate guard; application-level check for user-friendly error |
| Entry fraud (multiple accounts, bots) | Medium | Medium | Capture IP/user agent; rate limiting; CAPTCHA consideration for future sprint |
| Winner notification email deliverability | Medium | Medium | Use verified sender domain; test with real email addresses; add retry logic |
| Dynamic form rendering complexity | Medium | Medium | Limit form types to simple inputs initially (text, textarea, select); expand later |
| Cron job timing (midnight UTC vs Berlin time) | Low | Low | Schedule cron for 02:00 Europe/Berlin; document timing |

---

## Deliverables Checklist

- [ ] `competitions` table with all columns and enums
- [ ] `competition_entries` table with unique constraint
- [ ] Competition CRUD API (public + admin)
- [ ] Competition entry endpoint with one-per-user enforcement
- [ ] Status transition system (state machine)
- [ ] Status transition cron job (auto-close expired)
- [ ] Winner selection (manual + random)
- [ ] Winner notification email
- [ ] Entry export to CSV
- [ ] Countdown timer component (reusable)
- [ ] Competitions landing page with cards and countdown timers
- [ ] Competition detail page with entry form
- [ ] Competition archive page
- [ ] Admin competition list and management
- [ ] Admin create/edit form with rich text
- [ ] Admin entries management and CSV export
- [ ] Admin winner selection interface
- [ ] Admin status transition controls
- [ ] Homepage competitions section wired to live data
- [ ] Responsive design for all pages
- [ ] Phase 2 retrospective completed
- [ ] Test suites passing

---

## Definition of Done

- [ ] All user stories meet their acceptance criteria
- [ ] One-per-user entry enforcement works at database and application level
- [ ] Status transitions follow defined state machine (no invalid transitions possible)
- [ ] Countdown timer accurately reflects time remaining in user's timezone
- [ ] Winner selection and notification flow works end-to-end
- [ ] Cron job runs daily and transitions expired competitions
- [ ] Entry form handles quiz and form types correctly
- [ ] Competition pages render server-side for SEO
- [ ] Responsive design verified at all breakpoints
- [ ] Cross-browser testing complete
- [ ] Backend integration tests cover full lifecycle
- [ ] No P1 or P2 bugs open
- [ ] Code reviewed and merged to main branch
- [ ] Phase 2 retrospective completed with documented action items

---

## Sprint Review Demo Script

1. **Competitions Landing Page (2 min)**
   - Open `/competitions` and show active competition cards
   - Point out countdown timers ticking in real-time
   - Show entry counts, prize descriptions
   - Show empty state (if applicable)

2. **Competition Detail and Entry (4 min)**
   - Click an active competition card
   - Walk through detail page: image, description, prize, sponsor, countdown
   - Show terms and conditions (collapsible)
   - Submit a quiz-type entry (answer a question, accept terms, submit)
   - Show confirmation state
   - Navigate back and enter again: show "Already entered" state
   - Try with unauthenticated user: show login prompt

3. **Competition Lifecycle (3 min)**
   - Admin: show competition in "active" status
   - Trigger transition to "closed"
   - Show detail page now shows "Competition ended"
   - Trigger transition to "judging"
   - Select a random winner
   - Send winner notification (show email)
   - Trigger transition to "completed"
   - Show winner announcement on detail page

4. **Archive Page (1 min)**
   - Navigate to `/competitions/archive`
   - Show past competitions with winners and dates

5. **Admin Panel (3 min)**
   - Show competition list with status filters
   - Create a new competition (form with rich text, dates, entry type)
   - Show entries list for an existing competition
   - Export entries to CSV
   - Show status transition buttons (context-aware)

6. **Homepage Integration (1 min)**
   - Navigate to homepage
   - Show competitions section with live data and countdown timers

7. **Phase 2 Retrospective Summary (1 min)**
   - Brief overview of key findings and action items

---

## Rollover Criteria

A story or task rolls over to Sprint 13 if:
- Status transition system has edge cases requiring more than 1 day of additional work
- Winner notification email delivery issues require infrastructure changes
- Entry form dynamic rendering complexity exceeds estimates by >50%
- Phase 2 retrospective reveals critical process changes requiring immediate attention

**Candidates for rollover (if needed):**
1. Form-type entry (start with quiz-type only; add form-type later)
2. Entry export to CSV (admin can view entries in UI)
3. Share buttons on competition detail (lower priority)
4. Multiple winners support (start with single winner)
