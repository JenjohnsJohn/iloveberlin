# FR-USER: User Profiles

**Module:** User Profiles
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft
**Owner:** Platform Engineering

---

## 1. Overview

This document defines the functional requirements for user profile management on the ILoveBerlin platform. User profiles allow members to personalize their experience, manage preferences, interact with content through bookmarks and activity history, and control their account settings including GDPR-mandated data export and deletion.

---

## 2. User Stories References

| Story ID | Title |
|----------|-------|
| US-USER-001 | As a user, I want to view and edit my profile so I can present myself to the community |
| US-USER-002 | As a user, I want to upload an avatar so my profile has a personal image |
| US-USER-003 | As a user, I want to add a bio and social links so others can learn about me |
| US-USER-004 | As a user, I want to configure notification preferences so I only receive relevant updates |
| US-USER-005 | As a user, I want to bookmark articles, events, and restaurants so I can find them later |
| US-USER-006 | As a user, I want to view my activity history so I can revisit content I engaged with |
| US-USER-007 | As a user, I want to export all my personal data for GDPR compliance |
| US-USER-008 | As a user, I want to delete my account and all associated data |
| US-USER-009 | As a user, I want to manage my account settings (change email, change password) |
| US-USER-010 | As an admin, I want to view and moderate user profiles |
| US-USER-011 | As a user, I want my public profile to display my contributions (articles, reviews) |
| US-USER-012 | As a user, I want to set my preferred language for UI localization |

---

## 3. Functional Requirements

### 3.1 Profile CRUD

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-USER-001 | The system SHALL create a user profile record automatically when a user account is created | Must |
| FR-USER-002 | The system SHALL allow authenticated users to view their own full profile | Must |
| FR-USER-003 | The system SHALL allow authenticated users to update their profile fields: display name, bio, location, website URL, and social links | Must |
| FR-USER-004 | The system SHALL provide a public profile view that displays: display name, avatar, bio, location, join date, and published contributions | Must |
| FR-USER-005 | The system SHALL allow users to set their profile visibility to `public` or `private` | Should |
| FR-USER-006 | When profile visibility is set to `private`, the public profile SHALL show only the display name and avatar | Should |
| FR-USER-007 | The system SHALL validate the bio field to a maximum of 500 characters | Must |
| FR-USER-008 | The system SHALL validate social link URLs to conform to expected URL patterns for each platform | Should |
| FR-USER-009 | The system SHALL allow admins and editors to view any user's full profile | Must |
| FR-USER-010 | The system SHALL support the following social link types: Instagram, X (Twitter), LinkedIn, Facebook, TikTok, YouTube, personal website | Must |

### 3.2 Avatar Upload

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-USER-011 | The system SHALL allow users to upload an avatar image in JPEG, PNG, or WebP format | Must |
| FR-USER-012 | The system SHALL enforce a maximum avatar file size of 5 MB | Must |
| FR-USER-013 | The system SHALL resize and crop uploaded avatars to 400x400 pixels, maintaining aspect ratio with center crop | Must |
| FR-USER-014 | The system SHALL generate three variants of the avatar: original (400x400), medium (200x200), and thumbnail (80x80) | Must |
| FR-USER-015 | The system SHALL store avatar images in Cloudflare R2 under the path `avatars/{user_id}/{size}.webp` | Must |
| FR-USER-016 | The system SHALL serve avatar images via Cloudflare CDN with appropriate cache headers (max-age 86400) | Must |
| FR-USER-017 | The system SHALL delete previous avatar files from R2 when a user uploads a new avatar | Must |
| FR-USER-018 | The system SHALL provide a default avatar (generated from the user's initials and a deterministic background color) when no avatar is uploaded | Should |
| FR-USER-019 | The system SHALL validate that uploaded files are genuine image files by checking magic bytes, not just file extension | Must |

### 3.3 Notification Preferences

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-USER-020 | The system SHALL allow users to configure notification preferences for the following channels: email, push (mobile), and in-app | Must |
| FR-USER-021 | The system SHALL support per-category notification toggles for: new articles in followed categories, event reminders, dining offers, comment replies, admin announcements, and weekly digest | Must |
| FR-USER-022 | The system SHALL default all notification preferences to enabled (opt-out model) for email and in-app channels | Must |
| FR-USER-023 | The system SHALL default push notification preferences to disabled (opt-in model) | Must |
| FR-USER-024 | The system SHALL respect notification preferences when dispatching any notification | Must |
| FR-USER-025 | The system SHALL allow users to unsubscribe from email notifications via a one-click link in each email | Must |
| FR-USER-026 | The system SHALL store the user's push notification device tokens for up to 3 devices | Should |

### 3.4 Bookmarks / Favorites

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-USER-027 | The system SHALL allow authenticated users to bookmark content of the following types: articles, events, restaurants, and guide topics | Must |
| FR-USER-028 | The system SHALL toggle a bookmark: if the item is not bookmarked, create the bookmark; if already bookmarked, remove it | Must |
| FR-USER-029 | The system SHALL allow users to view all their bookmarks, filterable by content type | Must |
| FR-USER-030 | The system SHALL return bookmarks sorted by most recently added first (descending `created_at`) | Must |
| FR-USER-031 | The system SHALL support pagination of bookmarks with cursor-based pagination (20 items per page) | Must |
| FR-USER-032 | The system SHALL include the bookmarked item's summary data (title, image, date) in the bookmark list response to avoid additional lookups | Should |
| FR-USER-033 | The system SHALL cascade-delete bookmarks when the referenced content is permanently deleted | Must |
| FR-USER-034 | The system SHALL return the bookmark state (bookmarked or not) for authenticated users when fetching content detail endpoints | Must |

### 3.5 Activity History

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-USER-035 | The system SHALL track the following user activities: article views, event views, restaurant views, guide views, bookmarks created, reviews submitted, comments posted | Must |
| FR-USER-036 | The system SHALL store activity records with: user ID, activity type, content type, content ID, and timestamp | Must |
| FR-USER-037 | The system SHALL allow users to view their own activity history, sorted by most recent first | Must |
| FR-USER-038 | The system SHALL support filtering activity history by activity type and content type | Should |
| FR-USER-039 | The system SHALL support pagination of activity history with cursor-based pagination (30 items per page) | Must |
| FR-USER-040 | The system SHALL retain activity history for a maximum of 12 months, after which records are automatically purged | Should |
| FR-USER-041 | The system SHALL allow users to clear their activity history entirely | Should |
| FR-USER-042 | The system SHALL deduplicate consecutive views of the same content item within a 30-minute window | Should |

### 3.6 Account Settings

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-USER-043 | The system SHALL allow users to change their email address after re-authenticating with their current password | Must |
| FR-USER-044 | Changing email SHALL trigger a verification email to the new address; the email SHALL not be updated until the new address is verified | Must |
| FR-USER-045 | The system SHALL allow users to change their password by providing the current password and a new password | Must |
| FR-USER-046 | The system SHALL allow users to set a preferred locale from supported options: `en`, `de` | Should |
| FR-USER-047 | The system SHALL allow users to set a preferred timezone for date/time display | Should |
| FR-USER-048 | The system SHALL allow users to enable or disable their public profile visibility | Should |
| FR-USER-049 | The system SHALL allow users to manage their linked social login providers (view, link, unlink) | Must |

### 3.7 GDPR Data Export & Deletion

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-USER-050 | The system SHALL allow users to request an export of all their personal data (GDPR Article 20: Right to Data Portability) | Must |
| FR-USER-051 | The data export SHALL include: profile information, bookmarks, activity history, reviews, comments, notification preferences, and login history | Must |
| FR-USER-052 | The data export SHALL be generated as a ZIP archive containing JSON files, organized by data category | Must |
| FR-USER-053 | The system SHALL generate the export asynchronously and notify the user via email with a secure, time-limited download link (valid for 48 hours) | Must |
| FR-USER-054 | The system SHALL rate-limit data export requests to 1 per 24 hours per user | Must |
| FR-USER-055 | The system SHALL allow users to request full account deletion (GDPR Article 17: Right to Erasure) | Must |
| FR-USER-056 | Account deletion SHALL require re-authentication with the current password or social login | Must |
| FR-USER-057 | The system SHALL implement a 30-day grace period after deletion request, during which the account is deactivated but recoverable | Must |
| FR-USER-058 | After the 30-day grace period, the system SHALL permanently and irreversibly delete all personal data associated with the account | Must |
| FR-USER-059 | Upon permanent deletion, the system SHALL: remove profile data, remove avatar files from R2, anonymize authored content (replace author with "Deleted User"), delete bookmarks, delete activity history, delete notification preferences, delete all sessions and tokens | Must |
| FR-USER-060 | The system SHALL send a confirmation email when the deletion request is made and a final notification 7 days before permanent deletion | Must |
| FR-USER-061 | The system SHALL allow users to cancel a pending deletion request during the 30-day grace period | Must |

---

## 4. Database Schema

### 4.1 Table: `user_profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Profile identifier |
| `user_id` | `UUID` | FK -> users.id, UNIQUE, NOT NULL | Associated user |
| `display_name` | `VARCHAR(50)` | NOT NULL | Display name (synced from users table on creation) |
| `bio` | `VARCHAR(500)` | NULLABLE | User biography |
| `location` | `VARCHAR(100)` | NULLABLE | User's location (free text, e.g., "Kreuzberg, Berlin") |
| `website_url` | `VARCHAR(500)` | NULLABLE | Personal website URL |
| `avatar_url` | `VARCHAR(500)` | NULLABLE | URL to the full-size avatar on R2/CDN |
| `avatar_thumbnail_url` | `VARCHAR(500)` | NULLABLE | URL to the thumbnail avatar |
| `social_links` | `JSONB` | NOT NULL, DEFAULT '{}' | Social media links (see structure below) |
| `visibility` | `VARCHAR(10)` | NOT NULL, DEFAULT 'public' | Profile visibility: public, private |
| `locale` | `VARCHAR(5)` | NOT NULL, DEFAULT 'en' | Preferred language: en, de |
| `timezone` | `VARCHAR(50)` | NOT NULL, DEFAULT 'Europe/Berlin' | Preferred timezone |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Profile creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**`social_links` JSONB structure:**
```json
{
  "instagram": "https://instagram.com/username",
  "twitter": "https://x.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "facebook": "https://facebook.com/username",
  "tiktok": "https://tiktok.com/@username",
  "youtube": "https://youtube.com/@username",
  "website": "https://example.com"
}
```

**Indexes:**
- `idx_user_profiles_user_id` UNIQUE ON (`user_id`)
- `idx_user_profiles_display_name` ON (`display_name`)

### 4.2 Table: `notification_preferences`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `user_id` | `UUID` | FK -> users.id, UNIQUE, NOT NULL | Associated user |
| `email_new_articles` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Email for new articles in followed categories |
| `email_event_reminders` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Email for event reminders |
| `email_dining_offers` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Email for dining offers |
| `email_comment_replies` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Email for comment replies |
| `email_admin_announcements` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Email for admin announcements |
| `email_weekly_digest` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Weekly digest email |
| `push_new_articles` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Push for new articles |
| `push_event_reminders` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Push for event reminders |
| `push_dining_offers` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Push for dining offers |
| `push_comment_replies` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Push for comment replies |
| `push_admin_announcements` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Push for admin announcements |
| `inapp_new_articles` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | In-app for new articles |
| `inapp_event_reminders` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | In-app for event reminders |
| `inapp_dining_offers` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | In-app for dining offers |
| `inapp_comment_replies` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | In-app for comment replies |
| `inapp_admin_announcements` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | In-app for admin announcements |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_notification_preferences_user_id` UNIQUE ON (`user_id`)

### 4.3 Table: `push_device_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Associated user |
| `device_token` | `VARCHAR(500)` | NOT NULL | FCM or APNs device token |
| `platform` | `VARCHAR(10)` | NOT NULL | `ios` or `android` |
| `device_name` | `VARCHAR(100)` | NULLABLE | Human-readable device name |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Whether the token is valid |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Token registration timestamp |
| `last_used_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last successful push delivery |

**Indexes:**
- `idx_push_device_tokens_user_id` ON (`user_id`)
- `idx_push_device_tokens_token` UNIQUE ON (`device_token`)

### 4.4 Table: `bookmarks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Bookmark identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | User who created the bookmark |
| `content_type` | `VARCHAR(20)` | NOT NULL | Type: article, event, restaurant, guide |
| `content_id` | `UUID` | NOT NULL | ID of the bookmarked content |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Bookmark creation timestamp |

**Indexes:**
- `idx_bookmarks_user_content` UNIQUE ON (`user_id`, `content_type`, `content_id`)
- `idx_bookmarks_user_id` ON (`user_id`, `created_at` DESC)
- `idx_bookmarks_content` ON (`content_type`, `content_id`)

### 4.5 Table: `activity_history`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Activity record identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | User who performed the activity |
| `activity_type` | `VARCHAR(20)` | NOT NULL | Type: view, bookmark, review, comment |
| `content_type` | `VARCHAR(20)` | NOT NULL | Type: article, event, restaurant, guide |
| `content_id` | `UUID` | NOT NULL | ID of the content |
| `metadata` | `JSONB` | NULLABLE | Additional context (e.g., referrer, time spent) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Activity timestamp |

**Indexes:**
- `idx_activity_history_user_id` ON (`user_id`, `created_at` DESC)
- `idx_activity_history_user_type` ON (`user_id`, `activity_type`, `created_at` DESC)
- `idx_activity_history_content` ON (`content_type`, `content_id`)
- `idx_activity_history_created_at` ON (`created_at`) -- for purge job

### 4.6 Table: `data_export_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Request identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Requesting user |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | Status: pending, processing, completed, failed, expired |
| `file_path` | `VARCHAR(500)` | NULLABLE | R2 path to the generated ZIP file |
| `file_size_bytes` | `BIGINT` | NULLABLE | Size of the export file |
| `download_url` | `VARCHAR(1000)` | NULLABLE | Time-limited presigned download URL |
| `download_expires_at` | `TIMESTAMPTZ` | NULLABLE | Expiry of the download link |
| `completed_at` | `TIMESTAMPTZ` | NULLABLE | When the export was completed |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Request timestamp |

**Indexes:**
- `idx_data_export_requests_user_id` ON (`user_id`, `created_at` DESC)

### 4.7 Table: `account_deletion_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Request identifier |
| `user_id` | `UUID` | FK -> users.id, UNIQUE, NOT NULL | User requesting deletion |
| `reason` | `TEXT` | NULLABLE | Optional reason for leaving |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | Status: pending, cancelled, completed |
| `grace_period_ends_at` | `TIMESTAMPTZ` | NOT NULL | 30 days from request |
| `permanent_deletion_at` | `TIMESTAMPTZ` | NULLABLE | When data was permanently deleted |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Request timestamp |

**Indexes:**
- `idx_account_deletion_requests_user_id` UNIQUE ON (`user_id`) WHERE `status = 'pending'`
- `idx_account_deletion_requests_grace_period` ON (`grace_period_ends_at`) WHERE `status = 'pending'`

### 4.8 Table: `email_change_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Request identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | User requesting the change |
| `new_email` | `VARCHAR(255)` | NOT NULL | Requested new email address |
| `token_hash` | `VARCHAR(255)` | UNIQUE, NOT NULL | SHA-256 hash of verification token |
| `is_used` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the token was consumed |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Token expiry (24 hours) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Request timestamp |

**Indexes:**
- `idx_email_change_requests_token_hash` UNIQUE ON (`token_hash`)
- `idx_email_change_requests_user_id` ON (`user_id`)

---

## 5. API Endpoints

### 5.1 Profile Management

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/users/me/profile` | Authenticated | Get current user's full profile | FR-USER-002 |
| `PATCH` | `/api/v1/users/me/profile` | Authenticated | Update current user's profile | FR-USER-003 |
| `GET` | `/api/v1/users/:userId/profile` | Public | Get a user's public profile | FR-USER-004, 005, 006 |
| `POST` | `/api/v1/users/me/avatar` | Authenticated | Upload or replace avatar | FR-USER-011 to 019 |
| `DELETE` | `/api/v1/users/me/avatar` | Authenticated | Remove avatar (revert to default) | FR-USER-017 |

**`GET /api/v1/users/me/profile`**

Response `200 OK`:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "email": "string",
  "display_name": "string",
  "bio": "string | null",
  "location": "string | null",
  "website_url": "string | null",
  "avatar_url": "string | null",
  "avatar_thumbnail_url": "string | null",
  "social_links": {
    "instagram": "string | null",
    "twitter": "string | null",
    "linkedin": "string | null",
    "facebook": "string | null",
    "tiktok": "string | null",
    "youtube": "string | null",
    "website": "string | null"
  },
  "visibility": "public",
  "locale": "en",
  "timezone": "Europe/Berlin",
  "role": "user",
  "status": "active",
  "email_verified": true,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-03-10T14:30:00Z"
}
```

**`PATCH /api/v1/users/me/profile`**

Request Body (all fields optional):
```json
{
  "display_name": "string (2-50 chars)",
  "bio": "string (max 500 chars)",
  "location": "string (max 100 chars)",
  "website_url": "string (valid URL)",
  "social_links": {
    "instagram": "string | null"
  },
  "visibility": "public | private",
  "locale": "en | de",
  "timezone": "string (IANA timezone)"
}
```

Response `200 OK`: Updated profile object (same structure as GET).

Error Responses:
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Not authenticated

**`GET /api/v1/users/:userId/profile`**

Response `200 OK` (public profile):
```json
{
  "user_id": "uuid",
  "display_name": "string",
  "avatar_url": "string | null",
  "avatar_thumbnail_url": "string | null",
  "bio": "string | null",
  "location": "string | null",
  "social_links": {},
  "member_since": "2026-01-15T10:00:00Z",
  "contributions": {
    "articles_count": 12,
    "reviews_count": 5
  }
}
```

*Note: If profile visibility is `private`, only `display_name` and `avatar_url` are returned.*

Error Responses:
- `404 Not Found` - User not found or account deleted

**`POST /api/v1/users/me/avatar`**

Request: `multipart/form-data`
- `avatar` - Image file (JPEG, PNG, WebP; max 5 MB)

Response `200 OK`:
```json
{
  "avatar_url": "https://cdn.iloveberlin.biz/avatars/{user_id}/full.webp",
  "avatar_thumbnail_url": "https://cdn.iloveberlin.biz/avatars/{user_id}/thumb.webp"
}
```

Error Responses:
- `400 Bad Request` - Invalid file type, exceeds size limit, or not a genuine image
- `413 Payload Too Large` - File exceeds 5 MB

### 5.2 Notification Preferences

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/users/me/notifications/preferences` | Authenticated | Get notification preferences | FR-USER-020 to 023 |
| `PATCH` | `/api/v1/users/me/notifications/preferences` | Authenticated | Update notification preferences | FR-USER-020 to 024 |
| `POST` | `/api/v1/users/me/notifications/unsubscribe` | Token-based | Unsubscribe via email link | FR-USER-025 |
| `POST` | `/api/v1/users/me/devices` | Authenticated | Register push notification device token | FR-USER-026 |
| `DELETE` | `/api/v1/users/me/devices/:deviceId` | Authenticated | Remove a device token | FR-USER-026 |

**`PATCH /api/v1/users/me/notifications/preferences`**

Request Body (all fields optional):
```json
{
  "email_new_articles": true,
  "email_event_reminders": false,
  "push_comment_replies": true,
  "inapp_dining_offers": false
}
```

Response `200 OK`: Full notification preferences object.

**`POST /api/v1/users/me/notifications/unsubscribe`**

Query Parameters:
- `token` - Signed unsubscribe token from the email
- `category` - Notification category to unsubscribe from (optional; if omitted, unsubscribes from all email notifications)

Response `200 OK`:
```json
{
  "message": "You have been unsubscribed successfully."
}
```

### 5.3 Bookmarks

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/users/me/bookmarks` | Authenticated | List user's bookmarks | FR-USER-029 to 032 |
| `POST` | `/api/v1/users/me/bookmarks` | Authenticated | Toggle bookmark on/off | FR-USER-027, 028 |
| `DELETE` | `/api/v1/users/me/bookmarks/:bookmarkId` | Authenticated | Remove a specific bookmark | FR-USER-028 |

**`GET /api/v1/users/me/bookmarks`**

Query Parameters:
- `content_type` - Filter by type: `article`, `event`, `restaurant`, `guide` (optional)
- `cursor` - Cursor for pagination (optional)
- `limit` - Items per page (default 20, max 50)

Response `200 OK`:
```json
{
  "bookmarks": [
    {
      "id": "uuid",
      "content_type": "article",
      "content_id": "uuid",
      "created_at": "2026-03-10T09:00:00Z",
      "content": {
        "title": "Best Street Food in Kreuzberg",
        "slug": "best-street-food-kreuzberg",
        "featured_image_url": "https://cdn.iloveberlin.biz/...",
        "excerpt": "Discover the top street food...",
        "published_at": "2026-03-08T12:00:00Z"
      }
    }
  ],
  "pagination": {
    "next_cursor": "string | null",
    "has_more": true,
    "total_count": 47
  }
}
```

**`POST /api/v1/users/me/bookmarks`**

Request Body:
```json
{
  "content_type": "article",
  "content_id": "uuid"
}
```

Response `200 OK` (toggled on):
```json
{
  "bookmarked": true,
  "bookmark_id": "uuid"
}
```

Response `200 OK` (toggled off):
```json
{
  "bookmarked": false
}
```

Error Responses:
- `404 Not Found` - Content not found

### 5.4 Activity History

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/users/me/activity` | Authenticated | List user's activity history | FR-USER-037 to 039 |
| `DELETE` | `/api/v1/users/me/activity` | Authenticated | Clear activity history | FR-USER-041 |

**`GET /api/v1/users/me/activity`**

Query Parameters:
- `activity_type` - Filter: `view`, `bookmark`, `review`, `comment` (optional)
- `content_type` - Filter: `article`, `event`, `restaurant`, `guide` (optional)
- `cursor` - Cursor for pagination (optional)
- `limit` - Items per page (default 30, max 100)

Response `200 OK`:
```json
{
  "activities": [
    {
      "id": "uuid",
      "activity_type": "view",
      "content_type": "article",
      "content_id": "uuid",
      "created_at": "2026-03-10T14:30:00Z",
      "content": {
        "title": "Berlin Wall Anniversary Events",
        "slug": "berlin-wall-anniversary-events"
      }
    }
  ],
  "pagination": {
    "next_cursor": "string | null",
    "has_more": true
  }
}
```

### 5.5 Account Settings

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/users/me/change-email` | Authenticated | Initiate email change | FR-USER-043, 044 |
| `POST` | `/api/v1/users/me/verify-new-email` | Public | Verify new email address | FR-USER-044 |
| `POST` | `/api/v1/users/me/change-password` | Authenticated | Change password | FR-USER-045 |

**`POST /api/v1/users/me/change-email`**

Request Body:
```json
{
  "current_password": "string (required)",
  "new_email": "string (required, valid email)"
}
```

Response `200 OK`:
```json
{
  "message": "A verification email has been sent to your new email address."
}
```

Error Responses:
- `401 Unauthorized` - Incorrect current password
- `409 Conflict` - New email already in use

**`POST /api/v1/users/me/change-password`**

Request Body:
```json
{
  "current_password": "string (required)",
  "new_password": "string (required, complexity enforced)"
}
```

Response `200 OK`:
```json
{
  "message": "Password changed successfully."
}
```

Error Responses:
- `401 Unauthorized` - Incorrect current password
- `400 Bad Request` - New password matches a recent password or fails complexity requirements

### 5.6 GDPR Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/users/me/data-export` | Authenticated | Request data export | FR-USER-050 to 054 |
| `GET` | `/api/v1/users/me/data-export/:requestId` | Authenticated | Check export status / download | FR-USER-053 |
| `POST` | `/api/v1/users/me/delete-account` | Authenticated | Request account deletion | FR-USER-055 to 058 |
| `POST` | `/api/v1/users/me/cancel-deletion` | Authenticated | Cancel pending deletion | FR-USER-061 |

**`POST /api/v1/users/me/data-export`**

Response `202 Accepted`:
```json
{
  "request_id": "uuid",
  "status": "pending",
  "message": "Your data export is being prepared. You will receive an email with a download link when it is ready.",
  "estimated_completion": "2026-03-11T16:00:00Z"
}
```

Error Responses:
- `429 Too Many Requests` - Export already requested within the last 24 hours

**`GET /api/v1/users/me/data-export/:requestId`**

Response `200 OK` (completed):
```json
{
  "request_id": "uuid",
  "status": "completed",
  "download_url": "https://cdn.iloveberlin.biz/exports/...",
  "file_size_bytes": 1048576,
  "download_expires_at": "2026-03-13T15:00:00Z",
  "completed_at": "2026-03-11T15:30:00Z"
}
```

**`POST /api/v1/users/me/delete-account`**

Request Body:
```json
{
  "current_password": "string (required for password accounts)",
  "reason": "string (optional, max 1000 chars)"
}
```

Response `200 OK`:
```json
{
  "message": "Your account has been scheduled for deletion.",
  "grace_period_ends_at": "2026-04-10T15:00:00Z",
  "recovery_instructions": "You can cancel this request by logging in and visiting your account settings within 30 days."
}
```

**`POST /api/v1/users/me/cancel-deletion`**

Response `200 OK`:
```json
{
  "message": "Account deletion has been cancelled. Your account is fully active."
}
```

Error Responses:
- `404 Not Found` - No pending deletion request

### 5.7 Admin Profile Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/users` | Admin+ | List all users with profiles | FR-USER-009 |
| `GET` | `/api/v1/admin/users/:userId/profile` | Admin+ | View any user's full profile | FR-USER-009 |
| `PATCH` | `/api/v1/admin/users/:userId/profile` | Admin+ | Edit any user's profile | FR-USER-009 |

**`GET /api/v1/admin/users`**

Query Parameters:
- `search` - Search by display name or email (optional)
- `role` - Filter by role (optional)
- `status` - Filter by status (optional)
- `sort` - Sort field: `created_at`, `display_name`, `last_login_at` (default `created_at`)
- `order` - Sort order: `asc`, `desc` (default `desc`)
- `page` - Page number (default 1)
- `limit` - Items per page (default 25, max 100)

Response `200 OK`:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "string",
      "display_name": "string",
      "avatar_thumbnail_url": "string | null",
      "role": "user",
      "status": "active",
      "last_login_at": "2026-03-10T14:30:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total_count": 1250,
    "total_pages": 50
  }
}
```

---

## 6. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Activity History Purge | Daily at 03:00 UTC | Delete activity records older than 12 months |
| Data Export Cleanup | Daily at 04:00 UTC | Delete export files with expired download links from R2 |
| Account Deletion Processor | Daily at 05:00 UTC | Permanently delete accounts past the 30-day grace period |
| Deletion Reminder Email | Daily at 06:00 UTC | Send reminder email to users 7 days before permanent deletion |
| Push Token Cleanup | Weekly on Sunday at 02:00 UTC | Deactivate push tokens not used in 90 days |
