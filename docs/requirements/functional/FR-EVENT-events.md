# FR-EVENT: Events

**Module:** Events
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft
**Owner:** Platform Engineering

---

## 1. Overview

This document defines the functional requirements for the Events module of the ILoveBerlin platform. The Events system enables discovery, creation, and management of events across Berlin, supporting date-based queries, categories, districts, recurring events with iCal RRULE, venue management, map views using Leaflet/OpenStreetMap, moderation workflows, calendar downloads, and bookmarking.

---

## 2. User Stories References

| Story ID | Title |
|----------|-------|
| US-EVENT-001 | As a visitor, I want to browse events happening today, this weekend, or this month |
| US-EVENT-002 | As a visitor, I want to filter events by category and district |
| US-EVENT-003 | As a visitor, I want to see events on a map so I can find nearby activities |
| US-EVENT-004 | As a visitor, I want to download an event to my calendar (.ics file) |
| US-EVENT-005 | As a user, I want to bookmark events I'm interested in |
| US-EVENT-006 | As an author, I want to submit events for the community |
| US-EVENT-007 | As an editor, I want to moderate user-submitted events before they are published |
| US-EVENT-008 | As an editor, I want to create and manage recurring events |
| US-EVENT-009 | As an admin, I want past events to be automatically archived |
| US-EVENT-010 | As a visitor, I want to view detailed event information including venue, time, and description |
| US-EVENT-011 | As a user, I want to see all events at a specific venue |
| US-EVENT-012 | As a visitor, I want to search events by keyword |

---

## 3. Functional Requirements

### 3.1 Event CRUD

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-001 | Users with `author`+ roles SHALL be able to create events | Must |
| FR-EVENT-002 | The system SHALL require the following fields for event creation: title, description, start date/time, venue (existing or new), and category | Must |
| FR-EVENT-003 | The system SHALL support the following optional fields: end date/time, featured image, ticket URL, ticket price range, tags, external event URL, organizer name, organizer contact email | Must |
| FR-EVENT-004 | Event creators and users with `editor`+ roles SHALL be able to edit events | Must |
| FR-EVENT-005 | Users with `editor`+ roles SHALL be able to soft-delete events | Must |
| FR-EVENT-006 | Users with `admin`+ roles SHALL be able to permanently delete events | Should |
| FR-EVENT-007 | The system SHALL auto-generate a URL-safe slug from the event title, with a date prefix for uniqueness (e.g., `2026-03-15-berlin-music-festival`) | Must |
| FR-EVENT-008 | The system SHALL validate that the end date/time is after the start date/time when provided | Must |
| FR-EVENT-009 | The system SHALL validate that the start date/time is not more than 12 months in the future | Should |

### 3.2 Event Categories

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-010 | The system SHALL support the following event categories: Entertainment, Sports, Food & Dining, Arts & Culture, Nightlife, Community, Education, Volunteer | Must |
| FR-EVENT-011 | Each event SHALL be assigned exactly one primary category | Must |
| FR-EVENT-012 | Each category SHALL have: a name, slug, description, icon, and color code | Must |
| FR-EVENT-013 | Admin users SHALL be able to create, edit, and deactivate event categories | Must |
| FR-EVENT-014 | Each category SHALL have a dedicated listing page showing upcoming events in that category | Must |

### 3.3 Districts

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-015 | The system SHALL support all 12 Berlin districts (Bezirke): Mitte, Friedrichshain-Kreuzberg, Pankow, Charlottenburg-Wilmersdorf, Spandau, Steglitz-Zehlendorf, Tempelhof-Schoneberg, Neukolln, Treptow-Kopenick, Marzahn-Hellersdorf, Lichtenberg, Reinickendorf | Must |
| FR-EVENT-016 | Each event SHALL be associated with a district (derived from the venue's location) | Must |
| FR-EVENT-017 | Users SHALL be able to filter events by one or more districts | Must |
| FR-EVENT-018 | Each district SHALL have a dedicated listing page for events | Should |

### 3.4 Date-Based Queries

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-019 | The system SHALL support the following predefined date filters: "Today", "Tomorrow", "This Weekend" (Saturday-Sunday), "This Week" (Monday-Sunday), "This Month" (calendar month) | Must |
| FR-EVENT-020 | The system SHALL support custom date range filtering with a start date and end date | Must |
| FR-EVENT-021 | All date-based queries SHALL use the Europe/Berlin timezone as the reference timezone | Must |
| FR-EVENT-022 | The "Today" filter SHALL return events where the start date is today OR the event spans today (start date <= today AND end date >= today) | Must |
| FR-EVENT-023 | The "This Weekend" filter SHALL return events starting on or spanning the next Saturday and Sunday; if the current day is Saturday or Sunday, it SHALL use the current weekend | Must |
| FR-EVENT-024 | The system SHALL return events sorted by start date ascending (soonest first) within any date query | Must |

### 3.5 Venues

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-025 | The system SHALL maintain a database of venues that can be reused across multiple events | Must |
| FR-EVENT-026 | Each venue SHALL have: name, street address, district, postal code, latitude, longitude, description, website URL, phone number, and capacity | Must |
| FR-EVENT-027 | When creating an event, the user SHALL be able to select an existing venue or create a new one | Must |
| FR-EVENT-028 | The system SHALL geocode venue addresses to obtain latitude and longitude coordinates using a geocoding service | Must |
| FR-EVENT-029 | Venue latitude and longitude SHALL be stored as `DECIMAL(10,7)` to provide sub-meter precision | Must |
| FR-EVENT-030 | The system SHALL provide a venue autocomplete search (by name) when creating/editing events | Should |
| FR-EVENT-031 | Each venue SHALL have a dedicated page listing all upcoming events at that venue | Should |
| FR-EVENT-032 | Users with `editor`+ roles SHALL be able to edit and merge duplicate venues | Should |

### 3.6 Recurring Events (iCal RRULE)

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-033 | The system SHALL support recurring events using the iCal RRULE specification (RFC 5545) | Must |
| FR-EVENT-034 | The system SHALL support the following recurrence frequencies: daily, weekly, biweekly, monthly, yearly | Must |
| FR-EVENT-035 | The system SHALL support recurrence end conditions: by count (e.g., "repeat 10 times"), by end date (e.g., "repeat until December 31"), or indefinitely | Must |
| FR-EVENT-036 | The system SHALL support recurrence exceptions (EXDATE) for skipping specific occurrences | Must |
| FR-EVENT-037 | The system SHALL generate individual event occurrence records from the RRULE for querying and display | Must |
| FR-EVENT-038 | The system SHALL generate occurrences up to 6 months in advance; a scheduled job SHALL generate additional occurrences as needed | Must |
| FR-EVENT-039 | Editing a recurring event SHALL offer the following options: "This occurrence only", "This and all future occurrences", "All occurrences" | Must |
| FR-EVENT-040 | Each generated occurrence SHALL reference the parent recurring event and store its specific date/time | Must |
| FR-EVENT-041 | The system SHALL provide a user-friendly recurrence rule builder in the event creation form (not raw RRULE input) | Should |

### 3.7 Moderation Workflow

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-042 | The system SHALL enforce the following event statuses: `draft`, `pending_review`, `published`, `rejected`, `cancelled`, `archived` | Must |
| FR-EVENT-043 | Events created by `author` or `user` roles SHALL start in `pending_review` status | Must |
| FR-EVENT-044 | Events created by `editor`+ roles SHALL default to `published` status (bypassing review) | Must |
| FR-EVENT-045 | An `editor`+ SHALL be able to approve (publish), reject (with reason), or request edits for pending events | Must |
| FR-EVENT-046 | The system SHALL notify the event creator via email and in-app notification when their event is approved or rejected | Should |
| FR-EVENT-047 | Rejected events SHALL include a rejection reason visible to the creator | Must |
| FR-EVENT-048 | Event creators SHALL be able to resubmit a rejected event after making changes | Must |
| FR-EVENT-049 | Event creators SHALL be able to cancel their own published events | Must |
| FR-EVENT-050 | Cancelled events SHALL remain visible with a "Cancelled" badge for 7 days, then be archived | Should |

### 3.8 Auto-Archival

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-051 | The system SHALL automatically archive events whose end date (or start date if no end date) has passed by more than 24 hours | Must |
| FR-EVENT-052 | The auto-archival job SHALL run daily at 02:00 UTC | Must |
| FR-EVENT-053 | Archived events SHALL remain accessible via their direct URL but SHALL NOT appear in listing pages or search results by default | Must |
| FR-EVENT-054 | Admin users SHALL be able to view and search archived events | Must |
| FR-EVENT-055 | Admin users SHALL be able to unarchive an event (e.g., if the event date was changed) | Should |

### 3.9 Map View

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-056 | The system SHALL provide a map view of events using Leaflet with OpenStreetMap tiles | Must |
| FR-EVENT-057 | The map SHALL display event markers at the venue's geocoded location | Must |
| FR-EVENT-058 | Clicking an event marker SHALL display a popup with: event title, date/time, venue name, category badge, and a link to the full event page | Must |
| FR-EVENT-059 | The map SHALL cluster nearby markers when zoomed out using a marker clustering library | Should |
| FR-EVENT-060 | The map view SHALL respect the same filters as the list view (category, district, date range) | Must |
| FR-EVENT-061 | The map SHALL default to a Berlin-centered view (lat: 52.52, lng: 13.405) at zoom level 11 | Must |
| FR-EVENT-062 | The system SHALL return event coordinates in the listing API response to avoid additional requests for the map view | Must |
| FR-EVENT-063 | The map view SHALL support toggling between map and list views without losing filter state | Must |

### 3.10 Calendar Download (.ics)

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-064 | The system SHALL provide a downloadable .ics (iCalendar) file for each event | Must |
| FR-EVENT-065 | The .ics file SHALL include: event title, description (plain text), start date/time, end date/time (or 2-hour default), location (venue name and address), organizer, and URL to the event page | Must |
| FR-EVENT-066 | The .ics file SHALL include timezone data (VTIMEZONE for Europe/Berlin) | Must |
| FR-EVENT-067 | For recurring events, the .ics file SHALL include the RRULE and EXDATE properties | Should |
| FR-EVENT-068 | The system SHALL provide an "Add to Calendar" button with options for: download .ics, Google Calendar link, and Outlook Calendar link | Should |

### 3.11 Bookmarks

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-069 | Authenticated users SHALL be able to bookmark events (references FR-USER-027) | Must |
| FR-EVENT-070 | The event detail API response SHALL include `is_bookmarked: true/false` for authenticated users | Must |
| FR-EVENT-071 | The system SHALL send a reminder notification to users who have bookmarked an event, 24 hours before the event start time | Should |

### 3.12 Event Search & Discovery

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-EVENT-072 | Event search SHALL be powered by Meilisearch with indexing of: title, description, venue name, category, tags, district, and organizer name | Must |
| FR-EVENT-073 | The search endpoint SHALL support typo tolerance and highlighting | Must |
| FR-EVENT-074 | The search endpoint SHALL support faceted filtering by: category, district, date range | Must |
| FR-EVENT-075 | The Meilisearch index SHALL include only non-archived, non-rejected events | Must |
| FR-EVENT-076 | The index SHALL be updated within 30 seconds of event publication, update, or archival | Must |

---

## 4. Database Schema

### 4.1 Table: `event_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Category identifier |
| `name` | `VARCHAR(100)` | UNIQUE, NOT NULL | Category name |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Category description |
| `icon_url` | `VARCHAR(500)` | NULLABLE | Category icon URL |
| `color_code` | `VARCHAR(7)` | NOT NULL, DEFAULT '#000000' | Hex color code for UI display |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Whether the category is active |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order |
| `event_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Cached count of upcoming events |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_event_categories_slug` UNIQUE ON (`slug`)
- `idx_event_categories_active` ON (`is_active`, `display_order`)

### 4.2 Table: `districts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | District identifier |
| `name` | `VARCHAR(100)` | UNIQUE, NOT NULL | District name (Bezirk) |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | URL-safe slug |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order |

**Indexes:**
- `idx_districts_slug` UNIQUE ON (`slug`)

### 4.3 Table: `venues`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Venue identifier |
| `name` | `VARCHAR(200)` | NOT NULL | Venue name |
| `slug` | `VARCHAR(200)` | UNIQUE, NOT NULL | URL-safe slug |
| `street_address` | `VARCHAR(300)` | NOT NULL | Street address |
| `district_id` | `UUID` | FK -> districts.id, NOT NULL | Berlin district |
| `postal_code` | `VARCHAR(10)` | NOT NULL | Postal code |
| `latitude` | `DECIMAL(10,7)` | NOT NULL | Latitude coordinate |
| `longitude` | `DECIMAL(10,7)` | NOT NULL | Longitude coordinate |
| `description` | `TEXT` | NULLABLE | Venue description |
| `website_url` | `VARCHAR(500)` | NULLABLE | Venue website |
| `phone` | `VARCHAR(30)` | NULLABLE | Phone number |
| `capacity` | `INTEGER` | NULLABLE | Venue capacity |
| `image_url` | `VARCHAR(500)` | NULLABLE | Venue image |
| `is_verified` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the venue has been verified by an editor |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | User who created the venue |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_venues_slug` UNIQUE ON (`slug`)
- `idx_venues_district` ON (`district_id`)
- `idx_venues_name` ON (`name`)
- `idx_venues_geo` ON (`latitude`, `longitude`)

### 4.4 Table: `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Event identifier |
| `title` | `VARCHAR(200)` | NOT NULL | Event title |
| `slug` | `VARCHAR(220)` | UNIQUE, NOT NULL | URL-safe slug with date prefix |
| `description` | `TEXT` | NOT NULL | Full event description (HTML from TipTap) |
| `description_text` | `TEXT` | NOT NULL | Plain text extraction for search |
| `featured_image_url` | `VARCHAR(500)` | NULLABLE | Featured image URL |
| `category_id` | `UUID` | FK -> event_categories.id, NOT NULL | Event category |
| `venue_id` | `UUID` | FK -> venues.id, NOT NULL | Event venue |
| `district_id` | `UUID` | FK -> districts.id, NOT NULL | Berlin district (denormalized from venue) |
| `start_date` | `TIMESTAMPTZ` | NOT NULL | Event start date and time |
| `end_date` | `TIMESTAMPTZ` | NULLABLE | Event end date and time |
| `is_all_day` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether this is an all-day event |
| `ticket_url` | `VARCHAR(500)` | NULLABLE | URL to purchase tickets |
| `ticket_price_min` | `DECIMAL(10,2)` | NULLABLE | Minimum ticket price (EUR) |
| `ticket_price_max` | `DECIMAL(10,2)` | NULLABLE | Maximum ticket price (EUR) |
| `is_free` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the event is free |
| `external_url` | `VARCHAR(500)` | NULLABLE | External event page URL |
| `organizer_name` | `VARCHAR(200)` | NULLABLE | Event organizer |
| `organizer_email` | `VARCHAR(255)` | NULLABLE | Organizer contact email |
| `tags` | `TEXT[]` | NOT NULL, DEFAULT '{}' | Event tags (PostgreSQL array) |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft' | Status: draft, pending_review, published, rejected, cancelled, archived |
| `rejection_reason` | `TEXT` | NULLABLE | Reason for rejection |
| `is_recurring` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether this is a recurring event |
| `recurring_event_id` | `UUID` | FK -> recurring_events.id, NULLABLE | Parent recurring event (for generated occurrences) |
| `occurrence_date` | `DATE` | NULLABLE | Specific occurrence date (for recurring instances) |
| `author_id` | `UUID` | FK -> users.id, NOT NULL | Event creator |
| `published_at` | `TIMESTAMPTZ` | NULLABLE | Publication timestamp |
| `archived_at` | `TIMESTAMPTZ` | NULLABLE | Archive timestamp |
| `cancelled_at` | `TIMESTAMPTZ` | NULLABLE | Cancellation timestamp |
| `view_count` | `INTEGER` | NOT NULL, DEFAULT 0 | View count |
| `bookmark_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Bookmark count (denormalized) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft delete timestamp |

**Indexes:**
- `idx_events_slug` UNIQUE ON (`slug`) WHERE `deleted_at IS NULL`
- `idx_events_status` ON (`status`)
- `idx_events_start_date` ON (`start_date`) WHERE `status = 'published'`
- `idx_events_end_date` ON (`end_date`) WHERE `status = 'published'`
- `idx_events_category` ON (`category_id`, `start_date`) WHERE `status = 'published'`
- `idx_events_district` ON (`district_id`, `start_date`) WHERE `status = 'published'`
- `idx_events_venue` ON (`venue_id`, `start_date`) WHERE `status = 'published'`
- `idx_events_author` ON (`author_id`)
- `idx_events_recurring` ON (`recurring_event_id`) WHERE `recurring_event_id IS NOT NULL`
- `idx_events_pending` ON (`status`, `created_at`) WHERE `status = 'pending_review'`
- `idx_events_geo` ON (`district_id`) -- for geographic queries via venue join
- `idx_events_archive_candidates` ON (`end_date`, `start_date`) WHERE `status IN ('published', 'cancelled')`

### 4.5 Table: `recurring_events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Recurring event identifier |
| `event_template_id` | `UUID` | FK -> events.id, NOT NULL | Template event (the first occurrence) |
| `rrule` | `VARCHAR(500)` | NOT NULL | iCal RRULE string |
| `frequency` | `VARCHAR(10)` | NOT NULL | Frequency: daily, weekly, biweekly, monthly, yearly |
| `interval` | `INTEGER` | NOT NULL, DEFAULT 1 | Recurrence interval |
| `by_day` | `VARCHAR(50)` | NULLABLE | RRULE BYDAY (e.g., "MO,WE,FR") |
| `by_month_day` | `INTEGER` | NULLABLE | RRULE BYMONTHDAY (1-31) |
| `dtstart` | `TIMESTAMPTZ` | NOT NULL | Recurrence start date/time |
| `until` | `TIMESTAMPTZ` | NULLABLE | Recurrence end date (NULL for indefinite) |
| `count` | `INTEGER` | NULLABLE | Number of occurrences (NULL for indefinite/until-based) |
| `exdates` | `TIMESTAMPTZ[]` | NOT NULL, DEFAULT '{}' | Exception dates (skipped occurrences) |
| `last_generated_until` | `TIMESTAMPTZ` | NOT NULL | Last date up to which occurrences have been generated |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_recurring_events_template` ON (`event_template_id`)
- `idx_recurring_events_generation` ON (`last_generated_until`)

### 4.6 Table: `event_status_history`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `event_id` | `UUID` | FK -> events.id, NOT NULL | Associated event |
| `previous_status` | `VARCHAR(20)` | NULLABLE | Status before transition |
| `new_status` | `VARCHAR(20)` | NOT NULL | Status after transition |
| `changed_by` | `UUID` | FK -> users.id, NOT NULL | User who made the change |
| `comment` | `TEXT` | NULLABLE | Comment (e.g., rejection reason) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Transition timestamp |

**Indexes:**
- `idx_event_status_history_event` ON (`event_id`, `created_at` DESC)

---

## 5. API Endpoints

### 5.1 Public Event Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/events` | Public | List published events with filters | FR-EVENT-019 to 024 |
| `GET` | `/api/v1/events/search` | Public | Full-text search events via Meilisearch | FR-EVENT-072 to 076 |
| `GET` | `/api/v1/events/:slug` | Public | Get a single event by slug | FR-EVENT-010 |
| `GET` | `/api/v1/events/:slug/ics` | Public | Download .ics calendar file | FR-EVENT-064 to 068 |
| `GET` | `/api/v1/events/map` | Public | Get events with coordinates for map view | FR-EVENT-056 to 063 |
| `GET` | `/api/v1/events/categories` | Public | List event categories | FR-EVENT-010 to 014 |
| `GET` | `/api/v1/events/categories/:slug` | Public | List events by category | FR-EVENT-014 |
| `GET` | `/api/v1/events/districts/:slug` | Public | List events by district | FR-EVENT-018 |
| `GET` | `/api/v1/venues` | Public | List venues | FR-EVENT-025 to 031 |
| `GET` | `/api/v1/venues/:slug` | Public | Get venue details with upcoming events | FR-EVENT-031 |

**`GET /api/v1/events`**

Query Parameters:
- `date_filter` - Predefined: `today`, `tomorrow`, `weekend`, `week`, `month` (optional)
- `date_from` - Custom range start, ISO 8601 date (optional, overrides `date_filter`)
- `date_to` - Custom range end, ISO 8601 date (optional)
- `category` - Category slug (optional; supports multiple comma-separated)
- `district` - District slug (optional; supports multiple comma-separated)
- `is_free` - Boolean filter for free events (optional)
- `sort` - Sort field: `start_date` (default), `created_at`, `popularity` (optional)
- `order` - Sort order: `asc` (default for start_date), `desc` (optional)
- `cursor` - Pagination cursor (optional)
- `limit` - Items per page (default 12, max 50)

Response `200 OK`:
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Berlin Music Festival 2026",
      "slug": "2026-03-15-berlin-music-festival",
      "featured_image_url": "string | null",
      "category": {
        "id": "uuid",
        "name": "Entertainment",
        "slug": "entertainment",
        "color_code": "#FF5733"
      },
      "venue": {
        "id": "uuid",
        "name": "Tempodrom",
        "district": "Friedrichshain-Kreuzberg"
      },
      "district": {
        "id": "uuid",
        "name": "Friedrichshain-Kreuzberg",
        "slug": "friedrichshain-kreuzberg"
      },
      "start_date": "2026-03-15T19:00:00+01:00",
      "end_date": "2026-03-15T23:00:00+01:00",
      "is_all_day": false,
      "is_free": false,
      "ticket_price_min": 25.00,
      "ticket_price_max": 75.00,
      "is_recurring": false,
      "is_bookmarked": false,
      "latitude": 52.5063,
      "longitude": 13.3808
    }
  ],
  "pagination": {
    "next_cursor": "string | null",
    "has_more": true,
    "total_count": 156
  },
  "applied_filters": {
    "date_filter": "weekend",
    "date_range": {
      "from": "2026-03-14",
      "to": "2026-03-15"
    }
  }
}
```

**`GET /api/v1/events/:slug`**

Response `200 OK`:
```json
{
  "id": "uuid",
  "title": "Berlin Music Festival 2026",
  "slug": "2026-03-15-berlin-music-festival",
  "description_html": "<p>Join us for the biggest music festival...</p>",
  "featured_image_url": "string | null",
  "category": {
    "id": "uuid",
    "name": "Entertainment",
    "slug": "entertainment",
    "color_code": "#FF5733"
  },
  "venue": {
    "id": "uuid",
    "name": "Tempodrom",
    "slug": "tempodrom",
    "street_address": "Mockernstrasse 10",
    "district": "Friedrichshain-Kreuzberg",
    "postal_code": "10963",
    "latitude": 52.5063,
    "longitude": 13.3808,
    "website_url": "https://www.tempodrom.de"
  },
  "district": {
    "id": "uuid",
    "name": "Friedrichshain-Kreuzberg",
    "slug": "friedrichshain-kreuzberg"
  },
  "start_date": "2026-03-15T19:00:00+01:00",
  "end_date": "2026-03-15T23:00:00+01:00",
  "is_all_day": false,
  "is_free": false,
  "ticket_url": "https://tickets.example.com/...",
  "ticket_price_min": 25.00,
  "ticket_price_max": 75.00,
  "external_url": "string | null",
  "organizer_name": "Berlin Events GmbH",
  "organizer_email": "info@berlinevents.de",
  "tags": ["music", "festival", "outdoor"],
  "is_recurring": true,
  "recurrence": {
    "rrule": "FREQ=WEEKLY;BYDAY=SA;COUNT=4",
    "frequency": "weekly",
    "human_readable": "Every Saturday for 4 weeks",
    "next_occurrence": "2026-03-22T19:00:00+01:00",
    "total_occurrences": 4
  },
  "author": {
    "id": "uuid",
    "display_name": "string"
  },
  "published_at": "2026-03-01T10:00:00Z",
  "view_count": 567,
  "bookmark_count": 89,
  "is_bookmarked": false,
  "calendar_links": {
    "ics_url": "/api/v1/events/2026-03-15-berlin-music-festival/ics",
    "google_calendar_url": "https://calendar.google.com/calendar/render?action=TEMPLATE&...",
    "outlook_url": "https://outlook.live.com/calendar/0/deeplink/compose?..."
  },
  "seo": {
    "meta_title": "Berlin Music Festival 2026 | ILoveBerlin",
    "meta_description": "Join us for the biggest music festival...",
    "canonical_url": "https://iloveberlin.biz/events/2026-03-15-berlin-music-festival",
    "json_ld": {}
  }
}
```

Error Responses:
- `404 Not Found` - Event not found or not published
- `410 Gone` - Event has been archived (with redirect suggestion to upcoming events)

**`GET /api/v1/events/map`**

Query Parameters: Same as `GET /api/v1/events` plus:
- `bounds` - Map viewport bounds: `sw_lat,sw_lng,ne_lat,ne_lng` (optional, for spatial filtering)
- `limit` - Max markers (default 100, max 500)

Response `200 OK`:
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "category": { "name": "string", "color_code": "#FF5733" },
      "start_date": "2026-03-15T19:00:00+01:00",
      "venue_name": "string",
      "latitude": 52.5063,
      "longitude": 13.3808,
      "is_free": false
    }
  ],
  "total_count": 156,
  "bounds": {
    "sw": { "lat": 52.34, "lng": 13.09 },
    "ne": { "lat": 52.68, "lng": 13.76 }
  }
}
```

**`GET /api/v1/events/:slug/ics`**

Response `200 OK` with `Content-Type: text/calendar; charset=utf-8` and `Content-Disposition: attachment; filename="event.ics"`.

### 5.2 Event Management Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/events` | Author+ | Create a new event | FR-EVENT-001 to 009 |
| `PATCH` | `/api/v1/events/:id` | Author+ | Update an event | FR-EVENT-004 |
| `DELETE` | `/api/v1/events/:id` | Editor+ | Soft delete an event | FR-EVENT-005 |
| `POST` | `/api/v1/events/:id/submit` | Author+ | Submit event for review | FR-EVENT-043 |
| `POST` | `/api/v1/events/:id/cancel` | Author+ | Cancel own event | FR-EVENT-049 |

**`POST /api/v1/events`**

Request Body:
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required, HTML or TipTap JSON)",
  "start_date": "2026-03-15T19:00:00+01:00 (required)",
  "end_date": "2026-03-15T23:00:00+01:00 (optional)",
  "is_all_day": false,
  "category_id": "uuid (required)",
  "venue_id": "uuid (required, or provide new_venue)",
  "new_venue": {
    "name": "string",
    "street_address": "string",
    "district_id": "uuid",
    "postal_code": "string",
    "description": "string (optional)",
    "website_url": "string (optional)"
  },
  "featured_image_url": "string (optional)",
  "ticket_url": "string (optional)",
  "ticket_price_min": 25.00,
  "ticket_price_max": 75.00,
  "is_free": false,
  "external_url": "string (optional)",
  "organizer_name": "string (optional)",
  "organizer_email": "string (optional)",
  "tags": ["music", "festival"],
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "by_day": ["SA"],
    "until": "2026-04-05T23:00:00+01:00",
    "count": null
  }
}
```

Response `201 Created`: Full event object.

### 5.3 Admin Event Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/events` | Editor+ | List all events (all statuses) | FR-EVENT-054 |
| `GET` | `/api/v1/admin/events/pending` | Editor+ | List events pending review | FR-EVENT-045 |
| `POST` | `/api/v1/admin/events/:id/approve` | Editor+ | Approve and publish an event | FR-EVENT-045 |
| `POST` | `/api/v1/admin/events/:id/reject` | Editor+ | Reject an event with reason | FR-EVENT-045, 047 |
| `POST` | `/api/v1/admin/events/:id/unarchive` | Editor+ | Unarchive an event | FR-EVENT-055 |
| `DELETE` | `/api/v1/admin/events/:id/permanent` | Admin+ | Permanently delete an event | FR-EVENT-006 |
| `POST` | `/api/v1/admin/venues` | Editor+ | Create a venue | FR-EVENT-027 |
| `PATCH` | `/api/v1/admin/venues/:id` | Editor+ | Update a venue | FR-EVENT-032 |
| `POST` | `/api/v1/admin/venues/:id/merge` | Admin+ | Merge duplicate venues | FR-EVENT-032 |

**`POST /api/v1/admin/events/:id/approve`**

Request Body (optional):
```json
{
  "comment": "string (optional, note to creator)"
}
```

Response `200 OK`:
```json
{
  "event_id": "uuid",
  "status": "published",
  "published_at": "2026-03-11T14:30:00Z",
  "approved_by": "uuid"
}
```

**`POST /api/v1/admin/events/:id/reject`**

Request Body:
```json
{
  "reason": "string (required, visible to creator)"
}
```

Response `200 OK`:
```json
{
  "event_id": "uuid",
  "status": "rejected",
  "rejection_reason": "string",
  "rejected_by": "uuid"
}
```

### 5.4 Recurring Event Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/events/:id/occurrences` | Public | List all occurrences of a recurring event | FR-EVENT-037, 040 |
| `PATCH` | `/api/v1/events/:id/occurrences/:occurrenceId` | Author+ | Edit a specific occurrence | FR-EVENT-039 |
| `POST` | `/api/v1/events/:id/recurrence/edit` | Author+ | Edit recurring event (with scope selection) | FR-EVENT-039 |

**`POST /api/v1/events/:id/recurrence/edit`**

Request Body:
```json
{
  "scope": "this_only | this_and_future | all",
  "changes": {
    "title": "string (optional)",
    "start_date": "2026-03-22T20:00:00+01:00 (optional)",
    "end_date": "2026-03-22T23:00:00+01:00 (optional)",
    "description": "string (optional)"
  }
}
```

Response `200 OK`: Updated event(s) details.

---

## 6. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Event Auto-Archival | Daily at 02:00 UTC | Archive events whose end_date (or start_date) is more than 24 hours in the past |
| Cancelled Event Archival | Daily at 02:30 UTC | Archive cancelled events older than 7 days |
| Recurring Event Generation | Daily at 01:00 UTC | Generate occurrences for recurring events up to 6 months ahead |
| Bookmark Reminder Notifications | Every hour | Send reminders to users who bookmarked events starting in the next 24 hours |
| Meilisearch Sync | Near real-time (event-driven) | Update Meilisearch index on event publish, update, archive |
| Event Category Count Update | Every hour | Recalculate `event_count` for each category |
| Venue Geocoding | On create (event-driven) | Geocode new venues without coordinates |
| Expired Event Cleanup | Monthly | Hard-delete archived events older than 24 months |

---

## 7. Meilisearch Index Configuration

**Index Name:** `events`

**Searchable Attributes (ranked):**
1. `title`
2. `description_text`
3. `venue_name`
4. `organizer_name`
5. `tags`
6. `category_name`
7. `district_name`

**Filterable Attributes:**
- `category_slug`
- `district_slug`
- `start_date` (numeric timestamp for range filters)
- `is_free`
- `status`

**Sortable Attributes:**
- `start_date`
- `created_at`
- `view_count`

**Ranking Rules:**
1. `words`
2. `typo`
3. `proximity`
4. `attribute`
5. `sort`
6. `exactness`
