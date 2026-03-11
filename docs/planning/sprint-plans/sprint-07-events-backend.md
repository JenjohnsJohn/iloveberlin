# Sprint 7: Events Backend & Admin

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Sprint Number**  | 7                                              |
| **Sprint Name**    | Events Backend & Admin                         |
| **Duration**       | 2 weeks (10 working days)                      |
| **Dates**          | Week 13 -- Week 14 (Days 61--70 from project start) |
| **Team**           | 1 Backend, 1 Frontend, 1 DevOps / Infra        |

---

## Sprint Goal

> Build the events and venues data layer, backend API, and admin management interface -- including date-based querying, category and district filtering, recurring event support (iCal RRULE), community submission workflow, and auto-archival -- so that the platform can list, manage, and promote Berlin events.

---

## User Stories

### US-7.1 -- Venues Data Model & CRUD
**As an** admin,
**I want** to manage venue information,
**so that** events can be associated with real Berlin locations.

**Acceptance Criteria:**
- [ ] `venues` table: id (UUID), name, slug (unique), description, address_line_1, address_line_2, postal_code, city (default "Berlin"), district (enum), latitude, longitude, website, phone, email, featured_image_id (FK media), is_verified, created_by (FK users), created_at, updated_at, deleted_at
- [ ] District enum: Mitte, Kreuzberg, Neukoelln, Friedrichshain, Prenzlauer Berg, Charlottenburg, Schoeneberg, Tempelhof, Wedding, Moabit, Lichtenberg, Treptow, Spandau, Steglitz, Reinickendorf, Pankow
- [ ] `POST /api/admin/venues` -- create venue (editor+)
- [ ] `GET /api/admin/venues` -- list with search, district filter, pagination
- [ ] `GET /api/admin/venues/:id` -- get venue with associated events
- [ ] `PATCH /api/admin/venues/:id` -- update venue (editor+)
- [ ] `DELETE /api/admin/venues/:id` -- soft delete (admin, fail if has future events)
- [ ] Slug auto-generated from name
- [ ] Geocoding: auto-populate lat/lng from address (Google Maps or Nominatim API)

### US-7.2 -- Events Data Model
**As a** developer,
**I want** a comprehensive events schema supporting single, multi-day, and recurring events,
**so that** the data layer supports all planned event features.

**Acceptance Criteria:**
- [ ] `events` table: id (UUID), title, slug (unique), description (HTML), excerpt, venue_id (FK venues, nullable for online events), category_id (FK categories), organizer_id (FK users), featured_image_id (FK media), status (enum), starts_at (timestamptz), ends_at (timestamptz), is_all_day, is_online, online_url, is_free, price_info, currency (EUR default), ticket_url, recurrence_rule (text, iCal RRULE), recurrence_parent_id (self-ref FK, nullable), meta_title, meta_description, view_count, submitted_by (FK users, nullable), submission_notes, published_at, created_at, updated_at, deleted_at
- [ ] Status enum: `draft`, `pending_review`, `approved`, `published`, `cancelled`, `archived`
- [ ] Event category seed: Concerts & Music, Art & Exhibitions, Theater & Performance, Film & Cinema, Festivals, Food & Markets, Sports & Fitness, Networking & Business, Community & Social, Workshops & Classes, Tours & Walks, Family & Kids, Nightlife & Clubs, Talks & Lectures
- [ ] Events support polymorphic bookmarks (bookmarkable_type = 'event')

### US-7.3 -- Event Module CRUD API
**As an** editor,
**I want** full CRUD operations for events,
**so that** I can create and manage event listings.

**Acceptance Criteria:**
- [ ] `POST /api/admin/events` -- create event (editor+)
- [ ] `GET /api/admin/events` -- list with pagination, filters (status, category, district, date range, venue, organizer)
- [ ] `GET /api/admin/events/:id` -- get event with relations (venue, category, organizer, featured_image)
- [ ] `PATCH /api/admin/events/:id` -- update event
- [ ] `DELETE /api/admin/events/:id` -- soft delete (admin only)
- [ ] Status workflow: draft -> pending_review -> approved -> published -> cancelled/archived
- [ ] Slug auto-generated from title + date (e.g., `berlin-techno-night-2026-04-15`)
- [ ] Validation: ends_at > starts_at; starts_at required unless is_all_day

### US-7.4 -- Date-Based Event Queries
**As a** visitor,
**I want** to find events happening today, this weekend, this week, or this month,
**so that** I can discover things to do in Berlin.

**Acceptance Criteria:**
- [ ] `GET /api/events?when=today` -- events where starts_at is today
- [ ] `GET /api/events?when=tomorrow` -- events where starts_at is tomorrow
- [ ] `GET /api/events?when=weekend` -- events from upcoming Saturday to Sunday (or current if today is Sat/Sun)
- [ ] `GET /api/events?when=week` -- events in the current/next 7 days
- [ ] `GET /api/events?when=month` -- events in the current month
- [ ] `GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD` -- custom date range
- [ ] All date queries respect Berlin timezone (Europe/Berlin)
- [ ] Multi-day events appear on each day they span
- [ ] Results sorted by starts_at ascending

### US-7.5 -- Event Filtering
**As a** visitor,
**I want** to filter events by category, district, and price,
**so that** I can find events matching my interests and location.

**Acceptance Criteria:**
- [ ] `GET /api/events?category=concerts-music` -- filter by category slug
- [ ] `GET /api/events?district=kreuzberg` -- filter by district
- [ ] `GET /api/events?is_free=true` -- free events only
- [ ] `GET /api/events?is_online=true` -- online events only
- [ ] Multiple filters combinable (AND logic)
- [ ] Filters work alongside date-based queries
- [ ] Response includes filter facets: counts per category, per district, per free/paid

### US-7.6 -- Recurring Events (iCal RRULE)
**As an** editor,
**I want** to create recurring events using standard iCal recurrence rules,
**so that** weekly, monthly, and custom repeat patterns are supported.

**Acceptance Criteria:**
- [ ] Support RRULE patterns: FREQ=DAILY, WEEKLY, MONTHLY, YEARLY
- [ ] Support BYDAY (e.g., MO,WE,FR), BYMONTHDAY, COUNT, UNTIL
- [ ] Parent event stores the RRULE; child occurrences generated on query
- [ ] Child occurrences can be individually modified (exception handling)
- [ ] Cancelled individual occurrences via EXDATE
- [ ] Editing parent event updates all future unmodified occurrences
- [ ] UI: recurrence builder (frequency, interval, end condition)
- [ ] Library: use `rrule` npm package for parsing and occurrence generation
- [ ] Generate occurrences up to 3 months ahead (performance limit)

### US-7.7 -- Event Submission Workflow
**As a** community member (logged-in user),
**I want** to submit events for review,
**so that** I can share events with the Berlin community.

**Acceptance Criteria:**
- [ ] `POST /api/events/submit` -- submit event (any logged-in user)
- [ ] Submitted events have status `pending_review`
- [ ] Submitter can add notes for editors
- [ ] Editor reviews: approve (moves to `approved`) or reject (moves to `draft` with feedback)
- [ ] `PATCH /api/admin/events/:id/review` -- approve/reject with optional feedback
- [ ] Approved events can be published by editor
- [ ] Submitter receives email notification on approval/rejection
- [ ] Admin filter: "pending review" events
- [ ] Rate limit: max 5 submissions per user per day

### US-7.8 -- Event Bookmarks & Auto-Archival
**As a** system,
**I want** past events automatically archived and users able to bookmark events,
**so that** the event listings stay current and users can save upcoming events.

**Acceptance Criteria:**
- [ ] Cron job: run daily at 03:00 UTC, archive events where `ends_at < NOW() - 24 hours`
- [ ] Archived events not shown in default listings (available via `?include_past=true`)
- [ ] Bookmark endpoints: reuse polymorphic bookmark system (bookmarkable_type = 'event')
- [ ] `GET /api/events/:slug` includes `is_bookmarked` for authenticated users
- [ ] Users can view their bookmarked upcoming events

### US-7.9 -- Related Events
**As a** visitor,
**I want** to see related events on an event detail page,
**so that** I can discover similar things to do.

**Acceptance Criteria:**
- [ ] `GET /api/events/:slug/related?limit=4` -- related published/approved events
- [ ] Relation scoring: same category (weight 3), same district (weight 2), same week (weight 1)
- [ ] Excludes past events and the current event
- [ ] Falls back to upcoming events in same category if insufficient matches

### US-7.10 -- Admin Venue & Event Management Pages
**As an** editor,
**I want** admin pages for managing venues and events,
**so that** I can maintain event listings through a visual interface.

**Acceptance Criteria:**
- [ ] Venue list page: table with name, district, event count, verified status, actions
- [ ] Venue create/edit page: form with address fields, map pin (optional), image upload
- [ ] Event list page: table with title, date/time, venue, category, status, views, actions
- [ ] Event list filters: status, category, district, date range, "pending review"
- [ ] Event create/edit page: title, slug, dates (start/end), venue select (with search), category, description (TipTap), featured image, pricing fields, ticket URL, online toggle, recurrence builder
- [ ] Event status workflow buttons (same pattern as articles)
- [ ] Pending review queue: dedicated view for submitted events with approve/reject actions
- [ ] Calendar view (optional): month view showing events by date

---

## Day-by-Day Task Breakdown

### Week 1 (Days 61--65)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **61** | B-7.1 Create `venues` migration + entity + VenueModule scaffold | F-7.1 Admin venue list page (table, search, district filter) | -- |
| **62** | B-7.2 Venue CRUD endpoints + district enum | F-7.2 Admin venue create/edit page (address, image, map) | D-7.1 Geocoding API setup (Nominatim or Google Maps) |
| **63** | B-7.3 Create `events` migration + entity + event category seed | F-7.3 Admin event list page (table, filters, pagination) | -- |
| **64** | B-7.4 EventModule scaffold, CRUD endpoints | F-7.4 Admin event create/edit: basic fields (title, dates, venue, category) | -- |
| **65** | B-7.5 Date-based queries (today, weekend, week, month, custom) | F-7.5 Admin event create/edit: description (TipTap), pricing, ticket, online fields | D-7.2 Cron job infrastructure for events |

### Week 2 (Days 66--70)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **66** | B-7.6 Category + district + free/paid filtering + facets | F-7.6 Admin event: status workflow buttons, scheduling | -- |
| **67** | B-7.7 Recurring events: RRULE parsing, occurrence generation | F-7.7 Admin event: recurrence builder UI | -- |
| **68** | B-7.8 Event submission workflow + review endpoints | F-7.8 Admin pending review queue (approve/reject) | D-7.3 Email notification for submission approval/rejection |
| **69** | B-7.9 Bookmarks, auto-archival cron, related events | F-7.9 Admin venue/event polish, validation, error states | D-7.4 Deploy events to staging |
| **70** | QA-7.1 -- QA-7.5 Backend tests | QA-7.6 -- QA-7.10 Frontend tests | QA-7.11 Full event lifecycle test |

---

## Backend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| B-7.1 | Venues table + module | - Migration: all venue columns, indexes on slug, district, (latitude, longitude) | 4 h |
|        |  | - Venue entity with TypeORM decorators | |
|        |  | - VenueModule with controller, service | |
|        |  | - District enum definition (shared package) | |
| B-7.2 | Venue CRUD | - `POST /api/admin/venues` -- create with address, auto-geocode | 4 h |
|        |  | - `GET /api/admin/venues` -- list with search (name), district filter, pagination | |
|        |  | - `GET /api/admin/venues/:id` -- venue detail with upcoming events count | |
|        |  | - `PATCH /api/admin/venues/:id` -- update, re-geocode if address changed | |
|        |  | - `DELETE /api/admin/venues/:id` -- soft delete, block if future events | |
|        |  | - `GET /api/venues` -- public endpoint for venue search (used in event form) | |
|        |  | - Geocoding service: address -> lat/lng (Nominatim with fallback) | |
| B-7.3 | Events table + entity | - Migration: all event columns, indexes on slug, status, category_id, venue_id, starts_at, ends_at, recurrence_parent_id | 4 h |
|        |  | - Event entity with relations (ManyToOne venue, category, organizer, featured_image) | |
|        |  | - Event category seed migration (14 categories) | |
|        |  | - Status enum definition | |
| B-7.4 | Event CRUD | - `POST /api/admin/events` -- create event with validation | 5 h |
|        |  | - `GET /api/admin/events` -- paginated list with all filters | |
|        |  | - `GET /api/admin/events/:id` -- full event with relations | |
|        |  | - `PATCH /api/admin/events/:id` -- update event | |
|        |  | - `DELETE /api/admin/events/:id` -- soft delete (admin) | |
|        |  | - Status workflow (reuse pattern from articles) | |
|        |  | - Slug: slugify(title) + date fragment | |
|        |  | - Validation: ends_at > starts_at, starts_at required, etc. | |
| B-7.5 | Date-based queries | - Query builder for `when` parameter: today, tomorrow, weekend, week, month | 5 h |
|        |  | - Custom date range: `from` and `to` params (ISO date strings) | |
|        |  | - Timezone handling: convert Berlin time to UTC for DB queries | |
|        |  | - Multi-day events: appear if any part overlaps the query range | |
|        |  | - SQL: `WHERE (starts_at <= :rangeEnd AND ends_at >= :rangeStart)` | |
|        |  | - Default sort: starts_at ASC | |
|        |  | - Public endpoint: `GET /api/events` (published only) | |
| B-7.6 | Filtering + facets | - Category filter: `?category=slug` | 4 h |
|        |  | - District filter: `?district=kreuzberg` (join through venue) | |
|        |  | - Price filter: `?is_free=true` | |
|        |  | - Online filter: `?is_online=true` | |
|        |  | - Combine filters with AND logic | |
|        |  | - Facets in response: `{ categories: [{slug, name, count}], districts: [{name, count}], free_count, paid_count }` | |
|        |  | - Facets respect current filters (e.g., category facets update when district filtered) | |
| B-7.7 | Recurring events | - Install `rrule` npm package | 6 h |
|        |  | - Parse RRULE string from `recurrence_rule` column | |
|        |  | - Generate occurrences up to 3 months ahead | |
|        |  | - Virtual occurrences: not stored in DB, generated at query time | |
|        |  | - Exception handling: `EXDATE` for cancelled occurrences | |
|        |  | - Individual modification: create child event with `recurrence_parent_id` and modified fields | |
|        |  | - Update parent: regenerate future occurrences (skip individually modified) | |
|        |  | - Include recurring event occurrences in date-based queries | |
| B-7.8 | Submission workflow | - `POST /api/events/submit` -- any authenticated user | 4 h |
|        |  | - Submitted event: status = `pending_review`, submitted_by = currentUser | |
|        |  | - `PATCH /api/admin/events/:id/review` -- body: `{ action: 'approve' | 'reject', feedback?: string }` | |
|        |  | - Approve: status -> `approved` | |
|        |  | - Reject: status -> `draft`, feedback emailed to submitter | |
|        |  | - Submitter notification email on approval/rejection | |
|        |  | - Rate limit: 5 submissions/user/day (throttler) | |
|        |  | - Admin filter: `?status=pending_review` | |
| B-7.9 | Bookmarks + archival + related | - Bookmark support: bookmarkable_type = 'event' (reuse existing system) | 5 h |
|        |  | - `is_bookmarked` in event responses for authenticated users | |
|        |  | - Auto-archival cron: `@Cron('0 3 * * *')` -- archive events with ends_at < NOW() - 24h | |
|        |  | - Related events: score by category (3), district (2), same week (1) | |
|        |  | - `GET /api/events/:slug/related?limit=4` | |
|        |  | - Public event detail: `GET /api/events/:slug` | |

**Backend Total: 41 hours**

---

## Frontend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| F-7.1 | Admin venue list | - Data table: name, address, district, event count, verified badge, actions | 3 h |
|        |  | - Search by venue name | |
|        |  | - District filter dropdown | |
|        |  | - Pagination | |
|        |  | - "New Venue" button | |
| F-7.2 | Admin venue form | - Form fields: name, address (line 1, line 2, postal code, city), district dropdown | 4 h |
|        |  | - Website, phone, email fields | |
|        |  | - Featured image picker (media library) | |
|        |  | - Map preview: show pin at geocoded coordinates (leaflet or static map image) | |
|        |  | - Verified toggle (admin only) | |
|        |  | - Form validation, error messages | |
| F-7.3 | Admin event list | - Data table: title, date/time (formatted), venue name, category badge, status badge, views, actions | 4 h |
|        |  | - Filters: status, category, district, date range picker, "pending review" quick filter | |
|        |  | - Sorting by date, views, title | |
|        |  | - Pagination | |
|        |  | - "New Event" button | |
|        |  | - Color-coded status badges | |
| F-7.4 | Admin event form (basic) | - Title input | 5 h |
|        |  | - Slug field (auto + manual, includes date) | |
|        |  | - Date/time pickers: start date, start time, end date, end time | |
|        |  | - All-day toggle (hides time pickers) | |
|        |  | - Venue search-and-select (autocomplete, searches venue API) | |
|        |  | - "Online event" toggle (shows online URL field, hides venue) | |
|        |  | - Category select dropdown | |
|        |  | - Featured image picker | |
| F-7.5 | Admin event form (extended) | - Description: TipTap editor (reuse from Sprint 3) | 4 h |
|        |  | - Excerpt textarea | |
|        |  | - Pricing section: is_free toggle, price_info text, currency, ticket_url | |
|        |  | - Meta fields: meta_title, meta_description | |
|        |  | - Form validation: end > start, required fields | |
| F-7.6 | Event status + scheduling | - Status badge prominently displayed | 3 h |
|        |  | - Action buttons: "Submit for Review", "Approve", "Publish", "Cancel", "Archive" | |
|        |  | - Confirmation dialogs for status changes | |
|        |  | - Cancel event with reason (displayed on event) | |
| F-7.7 | Recurrence builder UI | - "Repeat" toggle on event form | 5 h |
|        |  | - Frequency selector: Does not repeat, Daily, Weekly, Monthly, Yearly | |
|        |  | - Interval: "Every [N] [weeks]" | |
|        |  | - Weekly: day checkboxes (Mon--Sun) | |
|        |  | - Monthly: "Day [N] of month" or "Nth [weekday]" | |
|        |  | - End condition: "Never", "After [N] occurrences", "On date [picker]" | |
|        |  | - Preview: show next 5 occurrence dates | |
|        |  | - Generate RRULE string from UI selections | |
|        |  | - Parse RRULE string to populate UI on edit | |
| F-7.8 | Admin pending review queue | - Dedicated view: list of pending_review events | 3 h |
|        |  | - Each item shows: title, submitter, submission date, submission notes | |
|        |  | - "Approve" button (quick approve) | |
|        |  | - "Reject" button opens modal with feedback textarea | |
|        |  | - Approved/rejected event removed from queue with success toast | |
| F-7.9 | Admin polish | - Venue form: address auto-complete (optional, best effort) | 3 h |
|        |  | - Event form: validate all edge cases (all-day, online, recurring) | |
|        |  | - Loading states, error handling, success toasts | |
|        |  | - Confirmation dialog for deleting venue with events | |
|        |  | - Responsive admin pages (tablet) | |

**Frontend Total: 34 hours**

---

## DevOps / Infrastructure Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| D-7.1 | Geocoding API | - Set up Nominatim (OpenStreetMap) as primary geocoder | 2 h |
|        |  | - Google Maps Geocoding API as fallback (optional, requires API key) | |
|        |  | - Rate limiting for geocoding requests | |
|        |  | - Cache geocoding results to avoid repeated lookups | |
| D-7.2 | Cron infrastructure | - Verify event archival cron runs correctly alongside article scheduling cron | 1 h |
|        |  | - Log cron execution, alert on failure | |
|        |  | - Ensure single-instance execution (same lock pattern as Sprint 4) | |
| D-7.3 | Email notifications | - Submission approval email template | 2 h |
|        |  | - Submission rejection email template (includes editor feedback) | |
|        |  | - ILoveBerlin branded, responsive | |
| D-7.4 | Staging deployment | - Deploy venues + events backend and admin pages | 1 h |
|        |  | - Verify cron jobs on staging | |
|        |  | - Seed sample events for testing | |

**DevOps Total: 6 hours**

---

## QA Tasks

| ID | Test Scenario | Type | Estimate |
| -- | ------------- | ---- | -------- |
| QA-7.1 | Venue CRUD: create with geocoding, update address (re-geocode), delete (blocked if future events) | Integration | 2 h |
| QA-7.2 | Event CRUD: create, update, status workflow (draft -> pending -> approved -> published -> archived) | Integration | 2 h |
| QA-7.3 | Date queries: today returns today's events, weekend returns Sat-Sun, custom range works | Integration | 3 h |
| QA-7.4 | Multi-day event appears in queries spanning any day of the event | Unit | 1 h |
| QA-7.5 | Filtering: category + district + free combined; facets update correctly | Integration | 2 h |
| QA-7.6 | Recurring events: weekly RRULE generates correct occurrences for 3 months; EXDATE excludes cancelled | Integration | 3 h |
| QA-7.7 | Submission workflow: user submits, editor approves -> published; editor rejects -> submitter emailed | E2E | 2 h |
| QA-7.8 | Auto-archival: cron archives events ended > 24h ago; future events untouched | Integration | 1 h |
| QA-7.9 | Admin venue form: geocoding populates lat/lng, map shows pin, validation works | E2E | 2 h |
| QA-7.10 | Admin event form: all fields save correctly, recurrence builder generates valid RRULE | E2E | 2 h |
| QA-7.11 | Full lifecycle: submit event -> review -> approve -> publish -> auto-archive after date passes | E2E | 2 h |
| QA-7.12 | Timezone handling: event at 20:00 Berlin time stored correctly, displayed correctly | Unit | 1 h |

**QA Total: 23 hours**

---

## Dependencies

```
Sprint 3 (complete) -- media library, TipTap editor, admin layout, categories table
 +-- B-7.3 (Events table) -- uses categories table for event categories
 +-- F-7.5 (Event form) -- uses TipTap editor
 +-- F-7.4 (Event form) -- uses media library for featured image

Sprint 4 (complete) -- bookmarks API, status workflow pattern, cron infrastructure
 +-- B-7.9 (Bookmarks) -- reuses polymorphic bookmark system
 +-- B-7.4 (Status workflow) -- reuses pattern from article status
 +-- B-7.9 (Auto-archival) -- reuses cron infrastructure

Sprint 2 (complete) -- auth, RBAC, email sending
 +-- B-7.8 (Submission) -- requires auth for submission, email for notifications
 +-- All admin endpoints -- require RBAC guards

B-7.1 (Venues table)
 +-- B-7.2 (Venue CRUD) -- depends on venue entity
      +-- F-7.1 (Venue list) -- depends on venue list endpoint
      +-- F-7.2 (Venue form) -- depends on venue CRUD
 +-- B-7.3 (Events table) -- venue_id FK depends on venues table
      +-- B-7.4 (Event CRUD) -- depends on event entity
      |    +-- B-7.5 (Date queries) -- depends on event list endpoint
      |    +-- B-7.6 (Filtering) -- depends on event list endpoint
      |    +-- B-7.7 (Recurring) -- depends on event CRUD
      |    +-- B-7.8 (Submission) -- depends on event CRUD
      |    +-- B-7.9 (Bookmarks + archival + related) -- depends on event entity
      +-- F-7.3 (Event list) -- depends on B-7.4
      +-- F-7.4 (Event form basic) -- depends on B-7.4 + B-7.2 (venue search)
      +-- F-7.7 (Recurrence builder) -- depends on B-7.7

D-7.1 (Geocoding) -- independent, but blocks B-7.2 auto-geocode feature
D-7.3 (Email templates) -- independent, but blocks B-7.8 notifications
```

---

## Risk Items

| # | Risk | Likelihood | Impact | Mitigation |
| - | ---- | ---------- | ------ | ---------- |
| R-1 | iCal RRULE complexity: edge cases with DST transitions | High | High | Use well-tested `rrule` library; write extensive unit tests for DST transition dates; test EXDATE handling |
| R-2 | Timezone bugs in date-based queries (Berlin is UTC+1/UTC+2) | High | High | Store all times as UTC with timezone info; convert in query layer; test across DST boundaries |
| R-3 | Recurring event occurrence generation performance for large datasets | Medium | Medium | Limit generation to 3 months; cache generated occurrences; paginate results |
| R-4 | Geocoding API rate limits or downtime (Nominatim) | Medium | Low | Cache results; queue geocoding requests; allow manual lat/lng entry as fallback |
| R-5 | Complex event form state management (conditional fields, recurrence) | Medium | Medium | Use React Hook Form with watch/conditional rendering; break into subcomponents |
| R-6 | Auto-archival cron accidentally archiving ongoing multi-day events | Medium | High | Check `ends_at` not `starts_at`; require ends_at > now + 24h buffer; add "undo archive" action |
| R-7 | Event submission spam (fake events from malicious users) | Low | Medium | Rate limiting (5/day), CAPTCHA on submission form, moderation queue |

---

## Deliverables Checklist

- [ ] `venues` table with district enum and geocoding support
- [ ] Venue CRUD API with search, district filter
- [ ] `events` table with comprehensive schema
- [ ] Event category seed data (14 categories)
- [ ] Event CRUD API with status workflow
- [ ] Date-based queries: today, tomorrow, weekend, week, month, custom range
- [ ] Category + district + free/paid filtering with facet counts
- [ ] Recurring events with iCal RRULE support (DAILY, WEEKLY, MONTHLY, YEARLY)
- [ ] RRULE occurrence generation (up to 3 months)
- [ ] Exception handling (EXDATE, individual modifications)
- [ ] Event submission workflow (submit, review, approve/reject)
- [ ] Submission notification emails (approval/rejection)
- [ ] Event bookmarks (polymorphic, reusing existing system)
- [ ] Auto-archival cron (daily, archive past events)
- [ ] Related events algorithm (category + district + date scoring)
- [ ] Public event detail endpoint
- [ ] Admin venue list page with search and district filter
- [ ] Admin venue create/edit page with geocoding and map
- [ ] Admin event list page with filters (status, category, district, date range)
- [ ] Admin event create/edit page with all fields
- [ ] Recurrence builder UI (frequency, interval, end condition, occurrence preview)
- [ ] Admin event status workflow buttons
- [ ] Admin pending review queue with approve/reject
- [ ] All tests passing in CI

---

## Definition of Done

1. All acceptance criteria for US-7.1 through US-7.10 are met
2. Venue CRUD works with auto-geocoding of addresses
3. Event CRUD works with full status workflow
4. Date-based queries return correct results for all time ranges (tested across timezone)
5. Filtering with combined parameters returns accurate results
6. Facet counts are correct and update based on applied filters
7. Recurring events generate correct occurrences (tested with WEEKLY, MONTHLY patterns)
8. DST transition handling verified (March and October boundaries)
9. Submission workflow: submit -> review -> approve/reject with email notifications
10. Auto-archival cron tested and verified (does not archive ongoing events)
11. Admin pages fully functional with all forms, filters, and actions
12. Recurrence builder generates valid RRULE strings and parses them on edit
13. All tests (unit + integration + E2E) passing in CI
14. Swagger docs updated for all venue and event endpoints
15. Deployed and verified on staging with sample seed data

---

## Sprint Review Demo Script

1. **Venue management** (2 min) -- Create venue with address, show geocoded coordinates, map pin
2. **Event creation** (3 min) -- Create event: title, dates, venue (search + select), category, description, featured image, pricing
3. **Recurring event** (3 min) -- Create weekly recurring event (every Tuesday), show recurrence builder, preview next 5 occurrences
4. **Date queries** (2 min) -- API demo: `?when=today`, `?when=weekend`, `?when=month`, show correct events returned
5. **Filtering** (2 min) -- Filter by category + district, show facet counts updating
6. **Submission workflow** (2 min) -- Login as regular user, submit event; login as editor, see in review queue, approve
7. **Rejection flow** (1 min) -- Reject a submission with feedback, show email notification
8. **Status workflow** (1 min) -- Move event through: draft -> approved -> published -> cancel
9. **Auto-archival** (1 min) -- Show archived past events, explain cron schedule
10. **Related events** (1 min) -- Show related events for a published event
11. **Admin event list** (1 min) -- Filter by status, category, district; sort by date
12. **Q&A** (3 min)

**Total demo time: ~22 minutes**

---

## Rollover Criteria

A task may roll over to Sprint 8 only if ALL of the following are true:

1. Venue and event CRUD are fully functional
2. Date-based queries work correctly
3. At least 80% of story points completed
4. The rollover does not block Sprint 8 public event pages (frontend)

**Candidates for rollover (if needed):**
- B-7.7 Recurring events (complex feature, can launch with single events only)
- F-7.7 Recurrence builder UI (depends on B-7.7)
- B-7.9 Related events (nice-to-have for launch)
- F-7.9 Map preview on venue form (functional without map)

**Must NOT roll over:**
- Venue CRUD (blocks event creation with venue)
- Event CRUD + status workflow (core feature)
- Date-based queries (core feature for event discovery)
- Category + district filtering (core UX for event browsing)
- Event submission workflow (community engagement feature)
- Auto-archival cron (prevents stale event listings)
- Admin event management pages (blocks editorial workflow)
