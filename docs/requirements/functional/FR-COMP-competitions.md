# FR-COMP: Competitions

**Module:** Competitions
**Status:** Draft
**Last Updated:** 2026-03-11
**Owner:** Marketing Team
**Related User Stories:** US-COMP-001 through US-COMP-040

---

## 1. Overview

The Competitions module allows administrators to create, manage, and run promotional competitions on the ILoveBerlin platform. Registered users can enter competitions (one entry per user per competition). Competitions follow a strict lifecycle (draft -> active -> closed -> archived), display countdown timers on the frontend, and support automated winner selection with notification emails. A public archive provides historical access to past competitions and their winners.

---

## 2. Functional Requirements

### 2.1 Competition CRUD

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-001 | Admin users SHALL be able to create a competition with: title, slug, description (rich text), excerpt, cover image, prize description, prize value, terms and conditions, start date/time, end date/time, max entries (optional), and status. | Must | US-COMP-001 |
| FR-COMP-002 | Admin users SHALL be able to edit any field of a competition that is in draft or active status. Closed and archived competitions allow only metadata edits (description, images). | Must | US-COMP-002 |
| FR-COMP-003 | Admin users SHALL be able to delete a competition that is in draft status. Active, closed, and archived competitions cannot be deleted but can be archived. | Must | US-COMP-003 |
| FR-COMP-004 | The system SHALL auto-generate a URL-safe slug from the competition title. Admin users MAY override the slug. Slugs must be unique. | Must | US-COMP-004 |
| FR-COMP-005 | The system SHALL validate that `end_date` is after `start_date` and that `start_date` is in the future when creating a new competition. | Must | US-COMP-005 |
| FR-COMP-006 | Admin users SHALL be able to attach up to 5 gallery images to a competition in addition to the cover image. | Should | US-COMP-006 |
| FR-COMP-007 | Admin users SHALL be able to associate a competition with a sponsor by providing sponsor name, logo (media reference), and URL. | Should | US-COMP-007 |

### 2.2 Status Transitions

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-008 | Competitions SHALL follow this lifecycle: `draft` -> `active` -> `closed` -> `archived`. No backwards transitions are permitted. | Must | US-COMP-008 |
| FR-COMP-009 | A competition SHALL automatically transition from `draft` to `active` when the current time reaches `start_date`. A background job SHALL check for pending activations every minute. | Must | US-COMP-009 |
| FR-COMP-010 | A competition SHALL automatically transition from `active` to `closed` when the current time reaches `end_date`. A background job SHALL check for pending closures every minute. | Must | US-COMP-010 |
| FR-COMP-011 | Admin users SHALL be able to manually close an active competition before its `end_date` (early closure). | Should | US-COMP-011 |
| FR-COMP-012 | Admin users SHALL be able to manually transition a closed competition to `archived` status. Alternatively, a background job SHALL auto-archive competitions 30 days after closure. | Should | US-COMP-012 |
| FR-COMP-013 | The system SHALL record each status transition in an audit log with the previous status, new status, timestamp, and the actor (system or admin user ID). | Must | US-COMP-013 |

### 2.3 Competition Entry

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-014 | Authenticated users SHALL be able to enter an active competition by submitting an entry. | Must | US-COMP-014 |
| FR-COMP-015 | The system SHALL enforce one entry per user per competition via a unique constraint on (`competition_id`, `user_id`). Duplicate submissions SHALL return a 409 Conflict error. | Must | US-COMP-015 |
| FR-COMP-016 | The entry form MAY include custom fields defined per competition by the admin (e.g., "answer this question", "upload a photo"). Custom fields are stored as JSONB. | Should | US-COMP-016 |
| FR-COMP-017 | The system SHALL reject entries for competitions that are not in `active` status. | Must | US-COMP-017 |
| FR-COMP-018 | The system SHALL reject entries if the competition has a `max_entries` limit and that limit has been reached. | Must | US-COMP-018 |
| FR-COMP-019 | Upon successful entry, the system SHALL return a confirmation response including entry ID and timestamp. | Must | US-COMP-019 |
| FR-COMP-020 | Authenticated users SHALL be able to view their own entry status for a competition (entered/not entered). | Must | US-COMP-020 |
| FR-COMP-021 | Authenticated users SHALL be able to view a list of all competitions they have entered, with entry dates and results (won/lost/pending). | Should | US-COMP-021 |
| FR-COMP-022 | The system SHALL record the user's IP address (hashed) and user agent at entry time for fraud detection. | Should | US-COMP-022 |

### 2.4 Countdown Timers

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-023 | The competition detail page SHALL display a real-time countdown timer showing time remaining until the competition ends (for active competitions) or time until it starts (for upcoming/draft-but-visible competitions). | Must | US-COMP-023 |
| FR-COMP-024 | The countdown timer SHALL update in real time on the client (JavaScript/Dart interval) without requiring server polling. | Must | US-COMP-024 |
| FR-COMP-025 | When the countdown reaches zero, the frontend SHALL automatically update the UI to reflect the new competition status (e.g., disable the entry button, show "Competition Ended"). | Must | US-COMP-025 |
| FR-COMP-026 | Competition list cards SHALL display a compact countdown or "Ends in X days" text. | Should | US-COMP-026 |

### 2.5 Winner Selection

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-027 | Admin users SHALL be able to trigger winner selection for a closed competition. | Must | US-COMP-027 |
| FR-COMP-028 | The system SHALL support random winner selection from all valid entries. The admin specifies the number of winners (default 1). | Must | US-COMP-028 |
| FR-COMP-029 | The random selection SHALL use a cryptographically secure random number generator (e.g., Node.js `crypto.randomInt`). | Must | US-COMP-029 |
| FR-COMP-030 | Admin users SHALL be able to manually select or override winners by specifying user IDs. | Should | US-COMP-030 |
| FR-COMP-031 | Selected winners SHALL be recorded in the `competition_winners` table with timestamp and selection method (random/manual). | Must | US-COMP-031 |
| FR-COMP-032 | The system SHALL prevent selecting the same user as a winner more than once for the same competition. | Must | US-COMP-032 |

### 2.6 Notification Emails

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-033 | Upon winner selection, the system SHALL send a notification email to each winner informing them of their win, including competition title, prize description, and instructions for claiming. | Must | US-COMP-033 |
| FR-COMP-034 | The winner notification email SHALL use a branded HTML template stored in the system. | Should | US-COMP-034 |
| FR-COMP-035 | Admin users SHALL be able to preview the winner email before sending. | Should | US-COMP-035 |
| FR-COMP-036 | The system SHALL send a confirmation email to users upon successful competition entry. | Should | US-COMP-036 |
| FR-COMP-037 | All competition-related emails SHALL include an unsubscribe link for competition notifications. | Must | US-COMP-037 |

### 2.7 Competition Archive

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-038 | The public site SHALL display an archive page listing all closed and archived competitions, ordered by `end_date` descending. | Must | US-COMP-038 |
| FR-COMP-039 | Archived competition detail pages SHALL display the winner(s) name(s) (first name + last initial) and the prize awarded. | Should | US-COMP-039 |
| FR-COMP-040 | The competition archive SHALL support pagination (cursor-based, 12 per page) and filtering by year. | Should | US-COMP-040 |

### 2.8 Terms and Conditions

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-COMP-041 | Each competition SHALL have associated terms and conditions stored as rich text. | Must | US-COMP-041 |
| FR-COMP-042 | Users SHALL be required to accept the terms and conditions (checkbox) before submitting an entry. The acceptance SHALL be recorded with a timestamp. | Must | US-COMP-042 |
| FR-COMP-043 | The terms and conditions SHALL be accessible via a link on the competition detail page and within the entry form. | Must | US-COMP-043 |

---

## 3. Database Schema

### 3.1 Table: `competitions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `title` | `VARCHAR(255)` | NOT NULL | Competition title |
| `slug` | `VARCHAR(280)` | NOT NULL, UNIQUE | URL-safe slug |
| `description` | `TEXT` | NOT NULL | Rich-text description |
| `excerpt` | `VARCHAR(500)` | NULLABLE | Short summary for listings |
| `cover_image_id` | `UUID` | FK -> media.id, NULLABLE | Cover image reference |
| `prize_description` | `TEXT` | NOT NULL | Description of the prize(s) |
| `prize_value` | `DECIMAL(10,2)` | NULLABLE | Monetary value of prize |
| `prize_currency` | `VARCHAR(3)` | NOT NULL, DEFAULT 'EUR' | ISO 4217 currency code |
| `terms_and_conditions` | `TEXT` | NOT NULL | Rich-text T&C |
| `custom_entry_fields` | `JSONB` | NULLABLE, DEFAULT '[]' | Schema for custom entry fields |
| `sponsor_name` | `VARCHAR(200)` | NULLABLE | Sponsor display name |
| `sponsor_logo_id` | `UUID` | FK -> media.id, NULLABLE | Sponsor logo image |
| `sponsor_url` | `VARCHAR(500)` | NULLABLE | Sponsor website URL |
| `max_entries` | `INTEGER` | NULLABLE | Maximum total entries allowed |
| `num_winners` | `INTEGER` | NOT NULL, DEFAULT 1 | Number of winners to select |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft', CHECK IN ('draft','active','closed','archived') | Current lifecycle status |
| `start_date` | `TIMESTAMPTZ` | NOT NULL | Competition start date/time |
| `end_date` | `TIMESTAMPTZ` | NOT NULL | Competition end date/time |
| `closed_at` | `TIMESTAMPTZ` | NULLABLE | Actual closure timestamp |
| `archived_at` | `TIMESTAMPTZ` | NULLABLE | Archive timestamp |
| `meta_title` | `VARCHAR(70)` | NULLABLE | SEO meta title |
| `meta_description` | `VARCHAR(160)` | NULLABLE | SEO meta description |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Admin who created |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_competitions_slug` UNIQUE on `slug`
- `idx_competitions_status` on `status`
- `idx_competitions_status_end_date` on (`status`, `end_date` DESC)
- `idx_competitions_start_date` on `start_date` WHERE `status` = 'draft'
- `idx_competitions_end_date` on `end_date` WHERE `status` = 'active'

**Constraints:**
- CHECK `end_date` > `start_date`

### 3.2 Table: `competition_gallery_images`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `competition_id` | `UUID` | FK -> competitions.id ON DELETE CASCADE, NOT NULL | Competition reference |
| `media_id` | `UUID` | FK -> media.id, NOT NULL | Image reference |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_competition_gallery_comp_id` on `competition_id`

**Constraints:**
- Application-level enforcement of max 5 gallery images per competition.

### 3.3 Table: `competition_entries`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `competition_id` | `UUID` | FK -> competitions.id ON DELETE CASCADE, NOT NULL | Competition reference |
| `user_id` | `UUID` | FK -> users.id ON DELETE CASCADE, NOT NULL | Entrant user |
| `custom_fields_data` | `JSONB` | NULLABLE | Custom field responses |
| `ip_hash` | `VARCHAR(64)` | NOT NULL | SHA-256 hashed IP |
| `user_agent` | `VARCHAR(500)` | NULLABLE | Browser user agent |
| `terms_accepted_at` | `TIMESTAMPTZ` | NOT NULL | T&C acceptance timestamp |
| `is_winner` | `BOOLEAN` | NOT NULL, DEFAULT false | Whether entry was selected |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Entry timestamp |

**Indexes:**
- `idx_competition_entries_unique` UNIQUE on (`competition_id`, `user_id`)
- `idx_competition_entries_comp_id` on `competition_id`
- `idx_competition_entries_user_id` on `user_id`
- `idx_competition_entries_winners` on (`competition_id`) WHERE `is_winner` = true

### 3.4 Table: `competition_winners`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `competition_id` | `UUID` | FK -> competitions.id ON DELETE CASCADE, NOT NULL | Competition reference |
| `entry_id` | `UUID` | FK -> competition_entries.id ON DELETE CASCADE, NOT NULL | Winning entry |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Winner user |
| `selection_method` | `VARCHAR(20)` | NOT NULL, CHECK IN ('random','manual') | How the winner was chosen |
| `selected_by` | `UUID` | FK -> users.id, NULLABLE | Admin who triggered selection |
| `notified_at` | `TIMESTAMPTZ` | NULLABLE | When email was sent |
| `claimed_at` | `TIMESTAMPTZ` | NULLABLE | When winner claimed prize |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Selection timestamp |

**Indexes:**
- `idx_competition_winners_comp_id` on `competition_id`
- `idx_competition_winners_unique` UNIQUE on (`competition_id`, `user_id`)

### 3.5 Table: `competition_status_log`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `competition_id` | `UUID` | FK -> competitions.id ON DELETE CASCADE, NOT NULL | Competition reference |
| `previous_status` | `VARCHAR(20)` | NULLABLE | Status before transition |
| `new_status` | `VARCHAR(20)` | NOT NULL | Status after transition |
| `actor_type` | `VARCHAR(10)` | NOT NULL, CHECK IN ('system','admin') | Who triggered the change |
| `actor_id` | `UUID` | FK -> users.id, NULLABLE | Admin user (null for system) |
| `note` | `TEXT` | NULLABLE | Optional note (e.g., "early closure") |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Transition timestamp |

**Indexes:**
- `idx_competition_status_log_comp_id` on (`competition_id`, `created_at` DESC)

---

## 4. API Endpoints

### 4.1 Public Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/competitions` | None | List active competitions | `cursor`, `limit` (default 12, max 50), `sort` (ending_soon, newest) |
| GET | `/api/v1/competitions/:slug` | None | Get competition detail | — |
| POST | `/api/v1/competitions/:id/entries` | User | Submit an entry | Body: `{ custom_fields_data, terms_accepted: true }` |
| GET | `/api/v1/competitions/:id/my-entry` | User | Check if current user entered | — |
| GET | `/api/v1/competitions/archive` | None | List closed/archived competitions | `cursor`, `limit` (default 12, max 50), `year` (YYYY filter) |
| GET | `/api/v1/users/me/competition-entries` | User | List user's competition entries | `cursor`, `limit` |

**Response format (list):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "slug": "...",
      "excerpt": "...",
      "cover_image": { "small": "url", "medium": "url" },
      "prize_description": "...",
      "prize_value": 100.00,
      "prize_currency": "EUR",
      "sponsor": { "name": "...", "logo": "url", "url": "..." },
      "status": "active",
      "start_date": "ISO8601",
      "end_date": "ISO8601",
      "entry_count": 234,
      "is_entered": false
    }
  ],
  "pagination": { "next_cursor": "...", "has_more": true }
}
```

**Response format (detail):**
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "slug": "...",
    "description": "<html>",
    "excerpt": "...",
    "cover_image": { "small": "url", "medium": "url", "large": "url" },
    "gallery_images": [{ "small": "url", "medium": "url", "large": "url" }],
    "prize_description": "...",
    "prize_value": 100.00,
    "prize_currency": "EUR",
    "terms_and_conditions": "<html>",
    "custom_entry_fields": [{ "name": "answer", "type": "text", "label": "What is your favourite Berlin neighbourhood?", "required": true }],
    "sponsor": { "name": "...", "logo": "url", "url": "..." },
    "status": "active",
    "start_date": "ISO8601",
    "end_date": "ISO8601",
    "max_entries": null,
    "entry_count": 234,
    "is_entered": false,
    "winners": [{ "display_name": "Max S.", "selected_at": "ISO8601" }],
    "meta": { "title": "...", "description": "..." }
  }
}
```

### 4.2 Admin Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/competitions` | Admin | List all competitions (any status) | `cursor`, `limit`, `status`, `search`, `sort` (newest, ending_soon, start_date) |
| POST | `/api/v1/admin/competitions` | Admin | Create a competition | Body: full competition object |
| GET | `/api/v1/admin/competitions/:id` | Admin | Get competition detail | — |
| PATCH | `/api/v1/admin/competitions/:id` | Admin | Update competition fields | Body: partial competition object |
| DELETE | `/api/v1/admin/competitions/:id` | Admin | Delete draft competition | — |
| POST | `/api/v1/admin/competitions/:id/close` | Admin | Manually close an active competition | Body: `{ note }` (optional) |
| POST | `/api/v1/admin/competitions/:id/archive` | Admin | Archive a closed competition | — |
| GET | `/api/v1/admin/competitions/:id/entries` | Admin | List all entries for a competition | `cursor`, `limit`, `search` (user name/email) |
| GET | `/api/v1/admin/competitions/:id/entries/:entryId` | Admin | Get single entry detail | — |
| POST | `/api/v1/admin/competitions/:id/select-winners` | Admin | Trigger winner selection | Body: `{ method: "random" \| "manual", count: N, user_ids: [] (for manual) }` |
| POST | `/api/v1/admin/competitions/:id/preview-winner-email` | Admin | Preview winner notification email | — |
| POST | `/api/v1/admin/competitions/:id/send-winner-notifications` | Admin | Send emails to selected winners | — |
| GET | `/api/v1/admin/competitions/:id/status-log` | Admin | View status transition history | — |
| POST | `/api/v1/admin/competitions/:id/gallery` | Admin | Add gallery image | Body: `{ media_id, sort_order }` |
| DELETE | `/api/v1/admin/competitions/:id/gallery/:imageId` | Admin | Remove gallery image | — |

### 4.3 Error Responses

| Code | Status | Trigger |
|------|--------|---------|
| COMPETITION_NOT_FOUND | 404 | ID/slug does not match a competition |
| COMPETITION_NOT_ACTIVE | 422 | Entry submitted to non-active competition |
| ALREADY_ENTERED | 409 | User has already entered this competition |
| MAX_ENTRIES_REACHED | 422 | Competition entry limit hit |
| TERMS_NOT_ACCEPTED | 422 | `terms_accepted` not true in entry body |
| INVALID_STATUS_TRANSITION | 422 | Attempted backwards or invalid lifecycle transition |
| COMPETITION_NOT_CLOSED | 422 | Winner selection attempted on non-closed competition |
| CANNOT_DELETE_NON_DRAFT | 422 | Delete attempted on active/closed/archived competition |
| GALLERY_LIMIT_EXCEEDED | 422 | More than 5 gallery images |

---

## 5. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `ActivateCompetitions` | Every 1 minute | Finds competitions with `status = 'draft'` and `start_date <= now()`, transitions to `active`. |
| `CloseCompetitions` | Every 1 minute | Finds competitions with `status = 'active'` and `end_date <= now()`, transitions to `closed`. |
| `AutoArchiveCompetitions` | Daily at 02:00 UTC | Archives competitions that have been `closed` for 30+ days. |
| `SendEntryConfirmation` | Event-driven (queue) | Sends confirmation email upon successful entry. |
| `SendWinnerNotification` | Event-driven (queue) | Sends winner notification email when triggered by admin. |

---

## 6. Email Templates

| Template | Trigger | Variables |
|----------|---------|-----------|
| `competition-entry-confirmation` | User submits entry | `user.first_name`, `competition.title`, `competition.end_date`, `entry.id` |
| `competition-winner-notification` | Admin sends winner emails | `user.first_name`, `competition.title`, `prize_description`, `claim_instructions_url` |

---

## 7. Integration Points

| System | Integration |
|--------|-------------|
| Media Module (FR-MEDIA) | Cover images, gallery images, sponsor logos |
| Search Module (FR-SEARCH) | Competitions indexed for search on create/update/status change |
| Email Service | Entry confirmation and winner notification emails |
| Admin Panel (FR-ADMIN) | Competition management, entry review, winner selection UI |

---

## 8. Non-Functional Constraints

- Competition entry endpoint SHALL handle concurrent entry attempts safely via the database unique constraint on (`competition_id`, `user_id`); the application SHALL catch unique violation errors and return 409 ALREADY_ENTERED.
- `max_entries` enforcement SHALL use `SELECT count(*) ... FOR UPDATE` within a transaction to prevent race conditions at the entry limit boundary.
- Countdown timer accuracy: the server SHALL return `start_date` and `end_date` as ISO 8601 with timezone; the client SHALL compute the countdown locally.
- Winner selection (random) SHALL complete within 5 seconds for competitions with up to 100,000 entries.
- All competition list endpoints support `If-None-Match` / ETag for conditional caching.
