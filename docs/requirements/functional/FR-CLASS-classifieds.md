# FR-CLASS: Classifieds

**Module:** Classifieds
**Status:** Draft
**Last Updated:** 2026-03-11
**Owner:** Community Team
**Related User Stories:** US-CLASS-001 through US-CLASS-055

---

## 1. Overview

The Classifieds module enables registered users to create, manage, and browse classified listings on the ILoveBerlin platform. Listings span seven categories (Vehicles, Services, Property, Electronics, Furniture, Jobs, Other) and support up to 8 images each. All new listings pass through a moderation workflow before becoming publicly visible. The module includes a messaging system for buyer/seller communication, a reporting mechanism, automatic 30-day expiry, and optional featured/premium listing tiers.

---

## 2. Functional Requirements

### 2.1 Listing CRUD

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-001 | Authenticated users SHALL be able to create a classified listing with: title, description, category, subcategory, price (optional), price type (fixed/negotiable/free/contact), location (Berlin district), up to 8 images, and contact preference (in-app message, email, phone). | Must | US-CLASS-001 |
| FR-CLASS-002 | Authenticated users SHALL be able to edit their own listings that are in `pending`, `approved`, or `rejected` status. Editing an `approved` listing SHALL reset its status to `pending` for re-moderation. | Must | US-CLASS-002 |
| FR-CLASS-003 | Authenticated users SHALL be able to delete their own listings at any time. Deletion is a soft-delete that removes the listing from public view. | Must | US-CLASS-003 |
| FR-CLASS-004 | Authenticated users SHALL be able to mark their own approved listing as "sold" or "closed", which removes it from active listings but retains it in the user's listing history. | Must | US-CLASS-004 |
| FR-CLASS-005 | The system SHALL auto-generate a URL-safe slug from the listing title, appended with a short random suffix to ensure uniqueness. | Must | US-CLASS-005 |
| FR-CLASS-006 | Users SHALL be able to upload up to 8 images per listing. The first image is the primary/cover image. Images are uploaded via the Media module (presigned URLs to R2). | Must | US-CLASS-006 |
| FR-CLASS-007 | Users SHALL be able to reorder listing images via drag-and-drop in the listing editor. | Should | US-CLASS-007 |
| FR-CLASS-008 | The system SHALL record `created_at`, `updated_at`, `approved_at`, and `expires_at` timestamps. | Must | US-CLASS-008 |
| FR-CLASS-009 | Users SHALL be able to view a list of all their own listings with status indicators. | Must | US-CLASS-009 |

### 2.2 Categories

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-010 | The system SHALL support the following top-level categories: Vehicles, Services, Property, Electronics, Furniture, Jobs, Other. | Must | US-CLASS-010 |
| FR-CLASS-011 | Each top-level category SHALL have predefined subcategories. For example: Vehicles -> Cars, Motorcycles, Bicycles, Scooters; Property -> Apartments, Rooms, Offices, Parking; Electronics -> Phones, Computers, Cameras, Audio; Furniture -> Living Room, Bedroom, Kitchen, Office; Jobs -> Full-time, Part-time, Freelance, Internship; Services -> Tutoring, Cleaning, Moving, Repair, Other. | Must | US-CLASS-011 |
| FR-CLASS-012 | Admin users SHALL be able to add, edit, or deactivate subcategories. Top-level categories are fixed in application code. | Should | US-CLASS-012 |
| FR-CLASS-013 | Each listing SHALL be assigned to exactly one category and one subcategory. | Must | US-CLASS-013 |
| FR-CLASS-014 | Public users SHALL be able to browse listings by category and subcategory. | Must | US-CLASS-014 |

### 2.3 Moderation Workflow

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-015 | New listings SHALL enter `pending` status and be invisible to the public until moderated. | Must | US-CLASS-015 |
| FR-CLASS-016 | Moderator/admin users SHALL be able to approve a pending listing, transitioning it to `approved` status and making it publicly visible. | Must | US-CLASS-016 |
| FR-CLASS-017 | Moderator/admin users SHALL be able to reject a pending listing with a required reason. The rejection reason is visible to the listing owner. | Must | US-CLASS-017 |
| FR-CLASS-018 | The listing owner SHALL be notified (in-app notification and optional email) when their listing is approved or rejected. | Must | US-CLASS-018 |
| FR-CLASS-019 | Moderator/admin users SHALL be able to revoke approval of a published listing (e.g., after a report), transitioning it to `suspended` status. A reason is required. | Must | US-CLASS-019 |
| FR-CLASS-020 | The moderation queue SHALL be accessible from the admin panel and show all pending listings sorted by `created_at` ascending (oldest first). | Must | US-CLASS-020 |
| FR-CLASS-021 | The moderation queue SHALL display listing preview with title, images, description, category, and user profile link. | Must | US-CLASS-021 |
| FR-CLASS-022 | Listing status lifecycle: `pending` -> `approved` / `rejected`. Approved listings can become `sold`, `closed`, `suspended`, or `expired`. Rejected listings can be edited and re-enter `pending`. | Must | US-CLASS-022 |

### 2.4 Messaging System

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-023 | Authenticated users SHALL be able to send a message to the listing owner via an in-app messaging thread. | Must | US-CLASS-023 |
| FR-CLASS-024 | Each unique (listing, sender, receiver) combination SHALL create a distinct conversation thread. | Must | US-CLASS-024 |
| FR-CLASS-025 | Both parties SHALL be able to send and receive messages within the thread. Messages are text-only (no file attachments in v1). | Must | US-CLASS-025 |
| FR-CLASS-026 | Users SHALL see a list of all their conversation threads, grouped by listing, with the most recently active thread first. | Must | US-CLASS-026 |
| FR-CLASS-027 | Unread message count SHALL be available per thread and as a total badge count for the user. | Must | US-CLASS-027 |
| FR-CLASS-028 | Users SHALL receive an email notification for new messages if they have not viewed the thread within 15 minutes. Email notifications are rate-limited to one per thread per hour. | Should | US-CLASS-028 |
| FR-CLASS-029 | Users SHALL be able to block another user, which prevents that user from sending further messages. | Should | US-CLASS-029 |
| FR-CLASS-030 | Messages SHALL be soft-deleted when a user deletes a conversation from their side; the other party retains their copy. | Should | US-CLASS-030 |

### 2.5 Reporting

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-031 | Authenticated users SHALL be able to report a listing by selecting a reason (spam, prohibited item, scam, incorrect category, offensive content, other) and providing an optional description. | Must | US-CLASS-031 |
| FR-CLASS-032 | The system SHALL prevent a user from submitting multiple reports for the same listing. | Must | US-CLASS-032 |
| FR-CLASS-033 | Reports SHALL appear in the admin moderation queue with listing details and reporter information. | Must | US-CLASS-033 |
| FR-CLASS-034 | Admin users SHALL be able to dismiss a report (marking it as reviewed) or take action (suspend the listing). | Must | US-CLASS-034 |
| FR-CLASS-035 | If a listing receives 3 or more reports, the system SHALL automatically flag it for priority review and notify moderators. | Should | US-CLASS-035 |

### 2.6 Auto-Expiry

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-036 | Approved listings SHALL automatically expire 30 days after `approved_at`. The `expires_at` timestamp is set at approval time. | Must | US-CLASS-036 |
| FR-CLASS-037 | A background job SHALL transition expired listings from `approved` to `expired` status. The job runs every hour. | Must | US-CLASS-037 |
| FR-CLASS-038 | The listing owner SHALL be notified 3 days before expiry via in-app notification and email, with an option to renew. | Should | US-CLASS-038 |
| FR-CLASS-039 | Listing owners SHALL be able to renew an expired or about-to-expire listing, which resets the 30-day expiry timer. Renewal of an expired listing sets status back to `approved` (no re-moderation needed unless content was changed). | Should | US-CLASS-039 |
| FR-CLASS-040 | Expired listings remain in the database for 90 days, after which they are hard-deleted by a cleanup job. | Should | US-CLASS-040 |

### 2.7 Featured / Premium Listings

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-041 | Admin users SHALL be able to mark a listing as "featured". Featured listings appear in a highlighted section at the top of category pages and the classifieds index. | Must | US-CLASS-041 |
| FR-CLASS-042 | The system SHALL support a "premium" listing tier that users can purchase. Premium listings receive: highlighted styling, priority placement in search results, extended 60-day expiry, and a "Premium" badge. | Should | US-CLASS-042 |
| FR-CLASS-043 | Premium listing purchases SHALL be processed via Stripe (single payment, not subscription). | Should | US-CLASS-043 |
| FR-CLASS-044 | The system SHALL track premium listing purchases in a `listing_upgrades` table with Stripe payment reference and validity period. | Should | US-CLASS-044 |
| FR-CLASS-045 | Featured and premium listings SHALL be visually distinguished in listing cards (badge, border highlight, or background color). | Should | US-CLASS-045 |

### 2.8 Public Listing and Filtering

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-CLASS-046 | The public classifieds index SHALL display approved listings ordered by `approved_at` descending, with featured/premium listings prioritized. | Must | US-CLASS-046 |
| FR-CLASS-047 | Users SHALL be able to filter by category, subcategory, price range (min/max), location (Berlin district), and listing type (fixed/negotiable/free). | Must | US-CLASS-047 |
| FR-CLASS-048 | Users SHALL be able to sort by newest, price low-to-high, and price high-to-low. | Must | US-CLASS-048 |
| FR-CLASS-049 | Listing detail pages SHALL display title, all images (gallery with lightbox), description, price, location, category, seller profile (name, member since, number of listings), and a "Send Message" button. | Must | US-CLASS-049 |
| FR-CLASS-050 | Authenticated users SHALL be able to save/favourite a listing. Favourited listings appear in the user's saved listings page. | Should | US-CLASS-050 |
| FR-CLASS-051 | The system SHALL display a count of total approved listings per category on the classifieds index page. | Should | US-CLASS-051 |

---

## 3. Database Schema

### 3.1 Table: `classified_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(100)` | NOT NULL | Category name |
| `slug` | `VARCHAR(120)` | NOT NULL, UNIQUE | URL-safe slug |
| `parent_id` | `UUID` | FK -> classified_categories.id, NULLABLE | Parent (NULL = top-level) |
| `icon` | `VARCHAR(50)` | NULLABLE | Icon class or name |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Whether visible to users |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_classified_categories_slug` UNIQUE on `slug`
- `idx_classified_categories_parent_id` on `parent_id`

### 3.2 Table: `classified_listings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `title` | `VARCHAR(200)` | NOT NULL | Listing title |
| `slug` | `VARCHAR(250)` | NOT NULL, UNIQUE | URL-safe slug with random suffix |
| `description` | `TEXT` | NOT NULL | Listing description (sanitized HTML) |
| `category_id` | `UUID` | FK -> classified_categories.id, NOT NULL | Top-level category |
| `subcategory_id` | `UUID` | FK -> classified_categories.id, NOT NULL | Subcategory |
| `price` | `DECIMAL(12,2)` | NULLABLE | Price in EUR |
| `price_type` | `VARCHAR(20)` | NOT NULL, CHECK IN ('fixed','negotiable','free','contact') | Pricing model |
| `location_district` | `VARCHAR(100)` | NULLABLE | Berlin district/neighbourhood |
| `contact_preference` | `VARCHAR(20)` | NOT NULL, DEFAULT 'message', CHECK IN ('message','email','phone') | How to contact seller |
| `contact_phone` | `VARCHAR(30)` | NULLABLE | Phone number (if preference is phone) |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','approved','rejected','sold','closed','suspended','expired') | Listing status |
| `rejection_reason` | `TEXT` | NULLABLE | Moderator rejection reason |
| `suspension_reason` | `TEXT` | NULLABLE | Moderator suspension reason |
| `is_featured` | `BOOLEAN` | NOT NULL, DEFAULT false | Admin-set featured flag |
| `is_premium` | `BOOLEAN` | NOT NULL, DEFAULT false | Paid premium listing |
| `user_id` | `UUID` | FK -> users.id ON DELETE CASCADE, NOT NULL | Listing owner |
| `moderated_by` | `UUID` | FK -> users.id, NULLABLE | Moderator who reviewed |
| `moderated_at` | `TIMESTAMPTZ` | NULLABLE | When moderation action taken |
| `approved_at` | `TIMESTAMPTZ` | NULLABLE | Approval timestamp |
| `expires_at` | `TIMESTAMPTZ` | NULLABLE | Expiry timestamp |
| `view_count` | `INTEGER` | NOT NULL, DEFAULT 0 | View counter |
| `message_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of inquiry messages |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft-delete timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_classified_listings_slug` UNIQUE on `slug`
- `idx_classified_listings_status_approved` on (`status`, `approved_at` DESC) WHERE `deleted_at` IS NULL
- `idx_classified_listings_category` on (`category_id`, `status`) WHERE `deleted_at` IS NULL
- `idx_classified_listings_subcategory` on (`subcategory_id`, `status`) WHERE `deleted_at` IS NULL
- `idx_classified_listings_user_id` on `user_id`
- `idx_classified_listings_pending` on `created_at` ASC WHERE `status` = 'pending' AND `deleted_at` IS NULL
- `idx_classified_listings_expires_at` on `expires_at` WHERE `status` = 'approved'
- `idx_classified_listings_featured` on (`is_featured`, `is_premium`, `approved_at` DESC) WHERE `status` = 'approved' AND `deleted_at` IS NULL
- `idx_classified_listings_price` on `price` WHERE `status` = 'approved' AND `deleted_at` IS NULL
- `idx_classified_listings_location` on `location_district` WHERE `status` = 'approved' AND `deleted_at` IS NULL

### 3.3 Table: `classified_listing_images`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `listing_id` | `UUID` | FK -> classified_listings.id ON DELETE CASCADE, NOT NULL | Listing reference |
| `media_id` | `UUID` | FK -> media.id, NOT NULL | Media reference |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Image order (0 = primary) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Upload timestamp |

**Indexes:**
- `idx_classified_listing_images_listing_id` on (`listing_id`, `sort_order`)

**Constraints:**
- Application-level enforcement of max 8 images per listing.

### 3.4 Table: `classified_messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `thread_id` | `UUID` | FK -> classified_message_threads.id ON DELETE CASCADE, NOT NULL | Thread reference |
| `sender_id` | `UUID` | FK -> users.id, NOT NULL | Message author |
| `body` | `TEXT` | NOT NULL | Message text |
| `is_read` | `BOOLEAN` | NOT NULL, DEFAULT false | Read status for recipient |
| `deleted_by_sender` | `BOOLEAN` | NOT NULL, DEFAULT false | Sender soft-deleted |
| `deleted_by_recipient` | `BOOLEAN` | NOT NULL, DEFAULT false | Recipient soft-deleted |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Sent timestamp |

**Indexes:**
- `idx_classified_messages_thread_id` on (`thread_id`, `created_at` ASC)

### 3.5 Table: `classified_message_threads`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `listing_id` | `UUID` | FK -> classified_listings.id ON DELETE CASCADE, NOT NULL | Listing reference |
| `buyer_id` | `UUID` | FK -> users.id, NOT NULL | User who initiated inquiry |
| `seller_id` | `UUID` | FK -> users.id, NOT NULL | Listing owner |
| `last_message_at` | `TIMESTAMPTZ` | NULLABLE | Timestamp of latest message |
| `buyer_unread_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Unread count for buyer |
| `seller_unread_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Unread count for seller |
| `is_blocked` | `BOOLEAN` | NOT NULL, DEFAULT false | Whether one party blocked the other |
| `blocked_by` | `UUID` | FK -> users.id, NULLABLE | User who initiated block |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Thread creation timestamp |

**Indexes:**
- `idx_classified_threads_unique` UNIQUE on (`listing_id`, `buyer_id`)
- `idx_classified_threads_buyer_id` on (`buyer_id`, `last_message_at` DESC)
- `idx_classified_threads_seller_id` on (`seller_id`, `last_message_at` DESC)

### 3.6 Table: `classified_reports`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `listing_id` | `UUID` | FK -> classified_listings.id ON DELETE CASCADE, NOT NULL | Reported listing |
| `reporter_id` | `UUID` | FK -> users.id, NOT NULL | Reporting user |
| `reason` | `VARCHAR(30)` | NOT NULL, CHECK IN ('spam','prohibited','scam','wrong_category','offensive','other') | Report reason |
| `description` | `TEXT` | NULLABLE | Additional details |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','reviewed','actioned') | Report status |
| `reviewed_by` | `UUID` | FK -> users.id, NULLABLE | Admin who reviewed |
| `reviewed_at` | `TIMESTAMPTZ` | NULLABLE | Review timestamp |
| `action_taken` | `VARCHAR(50)` | NULLABLE | Action description |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Report timestamp |

**Indexes:**
- `idx_classified_reports_unique` UNIQUE on (`listing_id`, `reporter_id`)
- `idx_classified_reports_pending` on `created_at` ASC WHERE `status` = 'pending'
- `idx_classified_reports_listing_id` on `listing_id`

### 3.7 Table: `classified_favourites`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `UUID` | PK (composite), FK -> users.id ON DELETE CASCADE | User reference |
| `listing_id` | `UUID` | PK (composite), FK -> classified_listings.id ON DELETE CASCADE | Listing reference |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Favourite timestamp |

**Indexes:**
- `idx_classified_favourites_user_id` on (`user_id`, `created_at` DESC)

### 3.8 Table: `classified_listing_upgrades`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `listing_id` | `UUID` | FK -> classified_listings.id ON DELETE CASCADE, NOT NULL | Listing reference |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Purchasing user |
| `upgrade_type` | `VARCHAR(20)` | NOT NULL, CHECK IN ('premium') | Type of upgrade |
| `stripe_payment_intent_id` | `VARCHAR(100)` | NOT NULL, UNIQUE | Stripe PaymentIntent ID |
| `amount` | `DECIMAL(10,2)` | NOT NULL | Amount charged |
| `currency` | `VARCHAR(3)` | NOT NULL, DEFAULT 'EUR' | ISO 4217 currency |
| `valid_from` | `TIMESTAMPTZ` | NOT NULL | Upgrade start date |
| `valid_until` | `TIMESTAMPTZ` | NOT NULL | Upgrade end date |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Purchase timestamp |

**Indexes:**
- `idx_classified_listing_upgrades_listing_id` on `listing_id`
- `idx_classified_listing_upgrades_stripe` UNIQUE on `stripe_payment_intent_id`

### 3.9 Table: `user_blocks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `blocker_id` | `UUID` | PK (composite), FK -> users.id ON DELETE CASCADE | User who blocks |
| `blocked_id` | `UUID` | PK (composite), FK -> users.id ON DELETE CASCADE | User who is blocked |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Block timestamp |

**Constraints:**
- CHECK `blocker_id` != `blocked_id`

---

## 4. API Endpoints

### 4.1 Public Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/classifieds` | None | List approved listings | `cursor`, `limit` (default 20, max 50), `category` (slug), `subcategory` (slug), `district`, `price_min`, `price_max`, `price_type`, `sort` (newest, price_asc, price_desc) |
| GET | `/api/v1/classifieds/:slug` | None | Get listing detail | — |
| GET | `/api/v1/classifieds/categories` | None | List all active categories with subcategories and listing counts | — |

### 4.2 Authenticated User Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| POST | `/api/v1/classifieds` | User | Create a listing | Body: `{ title, description, category_id, subcategory_id, price, price_type, location_district, contact_preference, contact_phone, image_media_ids[] }` |
| PATCH | `/api/v1/classifieds/:id` | User (owner) | Edit own listing | Body: partial listing object |
| DELETE | `/api/v1/classifieds/:id` | User (owner) | Soft-delete own listing | — |
| POST | `/api/v1/classifieds/:id/mark-sold` | User (owner) | Mark listing as sold | — |
| POST | `/api/v1/classifieds/:id/close` | User (owner) | Close listing | — |
| POST | `/api/v1/classifieds/:id/renew` | User (owner) | Renew expired/expiring listing | — |
| GET | `/api/v1/classifieds/my-listings` | User | List own listings (all statuses) | `cursor`, `limit`, `status` |
| POST | `/api/v1/classifieds/:id/report` | User | Report a listing | Body: `{ reason, description }` |
| POST | `/api/v1/classifieds/:id/favourite` | User | Add to favourites | — |
| DELETE | `/api/v1/classifieds/:id/favourite` | User | Remove from favourites | — |
| GET | `/api/v1/classifieds/favourites` | User | List favourited listings | `cursor`, `limit` |
| POST | `/api/v1/classifieds/:id/messages` | User | Send initial message to listing owner (creates thread) | Body: `{ body }` |
| GET | `/api/v1/classifieds/threads` | User | List user's message threads | `cursor`, `limit` |
| GET | `/api/v1/classifieds/threads/:threadId` | User (participant) | Get thread with messages | `cursor`, `limit` (messages, oldest first) |
| POST | `/api/v1/classifieds/threads/:threadId/messages` | User (participant) | Send message in thread | Body: `{ body }` |
| POST | `/api/v1/classifieds/threads/:threadId/read` | User (participant) | Mark thread as read | — |
| POST | `/api/v1/classifieds/threads/:threadId/block` | User (participant) | Block other party | — |
| DELETE | `/api/v1/classifieds/threads/:threadId` | User (participant) | Delete thread from user's side | — |
| GET | `/api/v1/classifieds/unread-count` | User | Get total unread message count | — |

### 4.3 Admin Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/classifieds` | Admin | List all listings | `cursor`, `limit`, `status`, `category`, `search`, `user_id`, `sort` |
| GET | `/api/v1/admin/classifieds/:id` | Admin | Get listing detail | — |
| POST | `/api/v1/admin/classifieds/:id/approve` | Moderator+ | Approve a pending listing | — |
| POST | `/api/v1/admin/classifieds/:id/reject` | Moderator+ | Reject a pending listing | Body: `{ reason }` |
| POST | `/api/v1/admin/classifieds/:id/suspend` | Moderator+ | Suspend an approved listing | Body: `{ reason }` |
| POST | `/api/v1/admin/classifieds/:id/feature` | Admin | Toggle featured status | Body: `{ is_featured: true/false }` |
| DELETE | `/api/v1/admin/classifieds/:id` | Admin | Hard-delete a listing | — |
| GET | `/api/v1/admin/classifieds/moderation-queue` | Moderator+ | Pending listings queue | `cursor`, `limit` |
| GET | `/api/v1/admin/classifieds/reports` | Moderator+ | List pending reports | `cursor`, `limit`, `status` |
| POST | `/api/v1/admin/classifieds/reports/:id/review` | Moderator+ | Review a report | Body: `{ status: "reviewed" \| "actioned", action_taken }` |
| POST | `/api/v1/admin/classified-categories` | Admin | Create subcategory | Body: `{ name, parent_id, icon, sort_order }` |
| PATCH | `/api/v1/admin/classified-categories/:id` | Admin | Update category | Body: partial object |
| DELETE | `/api/v1/admin/classified-categories/:id` | Admin | Deactivate category | — |

### 4.4 Error Responses

| Code | Status | Trigger |
|------|--------|---------|
| LISTING_NOT_FOUND | 404 | Slug/ID does not match a visible listing |
| NOT_LISTING_OWNER | 403 | User tries to edit/delete another user's listing |
| LISTING_NOT_PENDING | 422 | Approve/reject on non-pending listing |
| MAX_IMAGES_EXCEEDED | 422 | More than 8 images uploaded |
| ALREADY_REPORTED | 409 | User already reported this listing |
| THREAD_BLOCKED | 403 | Message sent to blocked thread |
| CANNOT_MESSAGE_OWN_LISTING | 422 | User tries to message their own listing |
| LISTING_EXPIRED | 422 | Action on expired listing (except renew) |
| INVALID_CATEGORY | 422 | Subcategory does not belong to specified category |
| NOT_THREAD_PARTICIPANT | 403 | User tries to access thread they are not part of |

---

## 5. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `ExpireListings` | Hourly | Finds approved listings where `expires_at <= now()`, transitions to `expired`. |
| `SendExpiryWarnings` | Daily at 09:00 UTC | Sends notifications for listings expiring in 3 days. |
| `PurgeExpiredListings` | Daily at 03:00 UTC | Hard-deletes listings expired for 90+ days. |
| `SendMessageNotifications` | Every 15 minutes | Sends email notifications for unread messages older than 15 minutes. |
| `AutoFlagReportedListings` | Every 5 minutes | Flags listings with 3+ pending reports for priority review. |
| `UpdateListingViewCounts` | Every 10 minutes | Aggregates view events into `view_count`. |

---

## 6. Email Templates

| Template | Trigger | Variables |
|----------|---------|-----------|
| `classified-approved` | Listing approved | `user.first_name`, `listing.title`, `listing.url` |
| `classified-rejected` | Listing rejected | `user.first_name`, `listing.title`, `rejection_reason` |
| `classified-suspended` | Listing suspended | `user.first_name`, `listing.title`, `suspension_reason` |
| `classified-expiry-warning` | 3 days before expiry | `user.first_name`, `listing.title`, `expires_at`, `renew_url` |
| `classified-new-message` | New message (after 15min delay) | `user.first_name`, `listing.title`, `sender.display_name`, `thread_url` |

---

## 7. Integration Points

| System | Integration |
|--------|-------------|
| Media Module (FR-MEDIA) | Listing image uploads and processing |
| Search Module (FR-SEARCH) | Classifieds index updated on approve/edit/expire/delete |
| Store Module (FR-STORE) | Premium listing upgrade purchases via Stripe |
| Admin Panel (FR-ADMIN) | Moderation queue, reports, listing management |
| Email Service | Notification emails |

---

## 8. Non-Functional Constraints

- Classified listing creation endpoint SHALL validate and sanitize HTML in the description field to prevent XSS.
- Message send endpoint p95 latency < 150ms.
- The moderation queue SHALL load within 300ms for up to 1,000 pending listings.
- Image upload is handled via presigned URLs (see FR-MEDIA); the listing endpoint only receives media IDs.
- All listing text content is indexed in Meilisearch for full-text search.
- Berlin districts are stored as free-text with autocomplete suggestions from a predefined list; they are not enforced as an enum to accommodate neighbourhood-level specificity.
