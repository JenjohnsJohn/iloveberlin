# Users API

**Base Path:** `/api/v1/users`

Endpoints for user profile management, bookmarks, activity tracking, and admin user administration.

---

## Table of Contents

- [Endpoints Overview](#endpoints-overview)
- [User Profile Endpoints](#user-profile-endpoints)
  - [GET /users/me](#get-usersme)
  - [PATCH /users/me](#patch-usersme)
  - [DELETE /users/me](#delete-usersme)
  - [POST /users/me/avatar](#post-usersmeavatar)
  - [GET /users/me/bookmarks](#get-usersmebookmarks)
  - [GET /users/me/activity](#get-usersmeactivity)
  - [POST /users/me/export-data](#post-usersmeexport-data)
  - [POST /users/me/delete-account](#post-usersmedelete-account)
- [Admin Endpoints](#admin-endpoints)
  - [GET /users](#get-users)
  - [GET /users/:id](#get-usersid)
  - [PATCH /users/:id/role](#patch-usersidrole)
  - [POST /users/:id/ban](#post-usersidban)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Endpoints Overview

### User Profile Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me` | User | Get current user profile |
| `PATCH` | `/users/me` | User | Update current user profile |
| `DELETE` | `/users/me` | User | Soft-delete user account (alias) |
| `POST` | `/users/me/avatar` | User | Upload or update avatar image |
| `GET` | `/users/me/bookmarks` | User | List all bookmarked content |
| `GET` | `/users/me/activity` | User | List user's recent activity |
| `POST` | `/users/me/export-data` | User | Request GDPR data export |
| `POST` | `/users/me/delete-account` | User | Permanently delete account and data |

### Admin Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users` | Admin | List all users with filters |
| `GET` | `/users/:id` | Admin | Get a specific user's details |
| `PATCH` | `/users/:id/role` | Superadmin | Change a user's role |
| `POST` | `/users/:id/ban` | Admin | Ban or unban a user |

---

## User Profile Endpoints

### GET /users/me

Retrieve the authenticated user's full profile.

**Authentication:** User

### Request

```
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

No query parameters.

### Response `200 OK`

```json
{
  "data": {
    "id": 1042,
    "email": "anna.schmidt@example.com",
    "firstName": "Anna",
    "lastName": "Schmidt",
    "displayName": "Anna S.",
    "bio": "Berlin-based food blogger and coffee enthusiast.",
    "role": "user",
    "emailVerified": true,
    "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg",
    "authProvider": "email",
    "language": "en",
    "district": "kreuzberg",
    "interests": ["food", "culture", "nightlife"],
    "notificationPreferences": {
      "email": true,
      "push": false,
      "weeklyDigest": true,
      "eventReminders": true
    },
    "stats": {
      "bookmarksCount": 47,
      "articlesRead": 132
    },
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-03-10T16:45:00.000Z",
    "lastLoginAt": "2026-03-12T14:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |

---

### PATCH /users/me

Update the authenticated user's profile. Only provided fields are updated (partial update).

**Authentication:** User

### Request

```json
{
  "firstName": "Anna-Marie",
  "bio": "Berlin-based food blogger, coffee enthusiast, and amateur photographer.",
  "district": "friedrichshain",
  "interests": ["food", "culture", "nightlife", "photography"],
  "language": "de",
  "notificationPreferences": {
    "email": true,
    "push": true,
    "weeklyDigest": true,
    "eventReminders": false
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `firstName` | string | No | Min 1, max 50 chars |
| `lastName` | string | No | Min 1, max 50 chars |
| `displayName` | string | No | Min 1, max 30 chars |
| `bio` | string | No | Max 500 chars |
| `district` | string | No | Must be a valid Berlin district slug |
| `interests` | string[] | No | Array of valid interest slugs, max 10 |
| `language` | string | No | `en` or `de` |
| `notificationPreferences` | object | No | Partial update supported |

### Response `200 OK`

```json
{
  "data": {
    "id": 1042,
    "email": "anna.schmidt@example.com",
    "firstName": "Anna-Marie",
    "lastName": "Schmidt",
    "displayName": "Anna S.",
    "bio": "Berlin-based food blogger, coffee enthusiast, and amateur photographer.",
    "role": "user",
    "emailVerified": true,
    "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg",
    "authProvider": "email",
    "language": "de",
    "district": "friedrichshain",
    "interests": ["food", "culture", "nightlife", "photography"],
    "notificationPreferences": {
      "email": true,
      "push": true,
      "weeklyDigest": true,
      "eventReminders": false
    },
    "stats": {
      "bookmarksCount": 47,
      "articlesRead": 132
    },
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-03-12T15:00:00.000Z",
    "lastLoginAt": "2026-03-12T14:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid field values |
| `401` | `"Unauthorized"` | Missing or invalid access token |

**Error Example:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "district",
      "message": "district must be a valid Berlin district slug"
    }
  ]
}
```

---

### DELETE /users/me

Soft-delete the authenticated user's account. This is an alias for `POST /users/me/delete-account` with immediate effect and no confirmation step. The account is deactivated and data is anonymized after 30 days.

**Authentication:** User

### Request

```
DELETE /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response `200 OK`

```json
{
  "message": "Account has been deactivated. Your data will be permanently deleted after 30 days. Contact support to reactivate."
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |

---

### POST /users/me/avatar

Upload or replace the user's profile avatar. Accepts JPEG, PNG, or WebP. Max file size: 5 MB. Images are resized to 256x256 px.

**Authentication:** User

### Request

```
POST /api/v1/users/me/avatar
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

------boundary
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

<binary data>
------boundary--
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `avatar` | file | Yes | JPEG, PNG, or WebP; max 5 MB |

### Response `200 OK`

```json
{
  "data": {
    "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo-20260312.jpg"
  },
  "message": "Avatar updated successfully"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"File type not allowed. Accepted: JPEG, PNG, WebP"` | Invalid file type |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `413` | `"File size exceeds 5 MB limit"` | File too large |

---

### GET /users/me/bookmarks

Retrieve all content bookmarked by the authenticated user. Results are paginated and can be filtered by content type.

**Authentication:** User

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | all | Filter by content type: `article`, `event`, `restaurant`, `guide` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `createdAt` | Sort field: `createdAt`, `title` |
| `order` | string | `desc` | Sort direction: `asc`, `desc` |

### Example Request

```
GET /api/v1/users/me/bookmarks?type=article&page=1&limit=10&sort=createdAt&order=desc
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 234,
      "type": "article",
      "contentId": 89,
      "title": "Top 10 Cafes in Kreuzberg",
      "slug": "top-10-cafes-kreuzberg",
      "excerpt": "Discover the best coffee spots in one of Berlin's most vibrant neighborhoods...",
      "imageUrl": "https://cdn.iloveberlin.biz/articles/89/cover.jpg",
      "bookmarkedAt": "2026-03-10T08:22:00.000Z"
    },
    {
      "id": 198,
      "type": "article",
      "contentId": 56,
      "title": "Berlin Street Art Walking Tour",
      "slug": "berlin-street-art-walking-tour",
      "excerpt": "A self-guided tour through Berlin's most impressive murals and graffiti...",
      "imageUrl": "https://cdn.iloveberlin.biz/articles/56/cover.jpg",
      "bookmarkedAt": "2026-03-08T14:10:00.000Z"
    }
  ],
  "meta": {
    "total": 47,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Invalid type. Allowed: article, event, restaurant, guide"` | Invalid type filter |
| `401` | `"Unauthorized"` | Missing or invalid access token |

---

### GET /users/me/activity

Retrieve the authenticated user's recent activity feed (views, bookmarks, etc.).

**Authentication:** User

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `action` | string | all | Filter by action: `view`, `bookmark`, `unbookmark` |

### Example Request

```
GET /api/v1/users/me/activity?page=1&limit=5&action=view
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 5621,
      "action": "view",
      "resourceType": "article",
      "resourceId": 89,
      "resourceTitle": "Top 10 Cafes in Kreuzberg",
      "resourceSlug": "top-10-cafes-kreuzberg",
      "createdAt": "2026-03-12T13:45:00.000Z"
    },
    {
      "id": 5618,
      "action": "view",
      "resourceType": "event",
      "resourceId": 312,
      "resourceTitle": "Berlin Coffee Festival 2026",
      "resourceSlug": "berlin-coffee-festival-2026",
      "createdAt": "2026-03-12T11:20:00.000Z"
    }
  ],
  "meta": {
    "total": 132,
    "page": 1,
    "limit": 5,
    "totalPages": 27
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |

---

### POST /users/me/export-data

Request a GDPR-compliant export of all user data. The export is generated asynchronously and delivered via email as a ZIP file.

**Authentication:** User

### Request

```json
{
  "format": "json"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `format` | string | No | `json` (default) or `csv` |

### Response `202 Accepted`

```json
{
  "message": "Your data export is being prepared. You will receive a download link at anna.schmidt@example.com within 24 hours.",
  "data": {
    "exportId": "exp_a1b2c3d4e5",
    "status": "processing",
    "format": "json",
    "requestedAt": "2026-03-12T15:00:00.000Z",
    "estimatedCompletionAt": "2026-03-12T16:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `429` | `"You can only request one data export every 24 hours"` | Export already requested recently |

---

### POST /users/me/delete-account

Permanently delete the user's account and all associated data. Requires password confirmation. This action is irreversible after the 30-day grace period.

**Authentication:** User

### Request

```json
{
  "password": "SecureP@ss123",
  "reason": "Moving away from Berlin",
  "confirmDeletion": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `password` | string | Yes | Must match current password (email auth only; OAuth users omit this) |
| `reason` | string | No | Max 500 chars; helps improve the platform |
| `confirmDeletion` | boolean | Yes | Must be `true` |

### Response `200 OK`

```json
{
  "message": "Your account has been scheduled for deletion. Your data will be permanently removed after 30 days. You will receive a confirmation email shortly."
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"confirmDeletion must be true"` | Deletion not confirmed |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `401` | `"Incorrect password"` | Password does not match |

---

## Admin Endpoints

### GET /users

List all users with optional filters, search, and pagination. Includes users in all states (active, banned, deactivated).

**Authentication:** Admin

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `createdAt` | Sort field: `createdAt`, `lastLoginAt`, `email`, `firstName` |
| `order` | string | `desc` | Sort direction: `asc`, `desc` |
| `q` | string | -- | Search by name or email |
| `role` | string | -- | Filter by role: `user`, `editor`, `admin`, `superadmin` |
| `status` | string | -- | Filter by status: `active`, `banned`, `deactivated` |
| `emailVerified` | boolean | -- | Filter by email verification status |
| `authProvider` | string | -- | Filter by auth provider: `email`, `google`, `apple` |
| `createdAt[gte]` | string | -- | Registered on or after (ISO 8601 date) |
| `createdAt[lte]` | string | -- | Registered on or before (ISO 8601 date) |

### Example Request

```
GET /api/v1/users?role=editor&status=active&sort=createdAt&order=desc&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1042,
      "email": "anna.schmidt@example.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "displayName": "Anna S.",
      "role": "editor",
      "status": "active",
      "emailVerified": true,
      "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg",
      "authProvider": "email",
      "createdAt": "2026-01-15T10:00:00.000Z",
      "lastLoginAt": "2026-03-12T14:30:00.000Z"
    },
    {
      "id": 987,
      "email": "max.mueller@example.com",
      "firstName": "Max",
      "lastName": "Mueller",
      "displayName": "Max M.",
      "role": "editor",
      "status": "active",
      "emailVerified": true,
      "avatarUrl": null,
      "authProvider": "google",
      "createdAt": "2025-12-01T08:00:00.000Z",
      "lastLoginAt": "2026-03-11T09:15:00.000Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |

---

### GET /users/:id

Retrieve a specific user's full profile and admin-relevant metadata.

**Authentication:** Admin

### Request

```
GET /api/v1/users/1042
```

### Response `200 OK`

```json
{
  "data": {
    "id": 1042,
    "email": "anna.schmidt@example.com",
    "firstName": "Anna",
    "lastName": "Schmidt",
    "displayName": "Anna S.",
    "bio": "Berlin-based food blogger and coffee enthusiast.",
    "role": "editor",
    "status": "active",
    "emailVerified": true,
    "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg",
    "authProvider": "email",
    "language": "en",
    "district": "kreuzberg",
    "interests": ["food", "culture", "nightlife"],
    "stats": {
      "bookmarksCount": 47,
      "articlesRead": 132,
      "articlesCreated": 24,
      "eventsCreated": 8
    },
    "banHistory": [],
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-03-10T16:45:00.000Z",
    "lastLoginAt": "2026-03-12T14:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `404` | `"User not found"` | No user with that ID |

---

### PATCH /users/:id/role

Change a user's role. Only superadmins can assign or revoke roles.

**Authentication:** Superadmin

### Request

```json
{
  "role": "editor"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `role` | string | Yes | One of: `user`, `editor`, `admin`, `superadmin` |

### Response `200 OK`

```json
{
  "data": {
    "id": 1042,
    "email": "anna.schmidt@example.com",
    "firstName": "Anna",
    "lastName": "Schmidt",
    "role": "editor",
    "previousRole": "user",
    "updatedAt": "2026-03-12T15:30:00.000Z"
  },
  "message": "User role updated from user to editor"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Invalid role"` | Role not in allowed list |
| `400` | `"User already has this role"` | No change needed |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not a superadmin |
| `403` | `"Cannot change your own role"` | Self-modification not allowed |
| `404` | `"User not found"` | No user with that ID |

**Error Example:**

```json
{
  "statusCode": 403,
  "message": "Cannot change your own role",
  "error": "Forbidden"
}
```

---

### POST /users/:id/ban

Ban or unban a user. Banned users cannot log in and their active sessions are invalidated.

**Authentication:** Admin

### Request (Ban)

```json
{
  "action": "ban",
  "reason": "Repeated spam content violations",
  "duration": "30d"
}
```

### Request (Unban)

```json
{
  "action": "unban"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `action` | string | Yes | `ban` or `unban` |
| `reason` | string | Yes (ban only) | Min 10, max 500 chars |
| `duration` | string | No | Duration string: `7d`, `30d`, `90d`, `permanent`. Default: `permanent` |

### Response `200 OK` (Ban)

```json
{
  "data": {
    "id": 1042,
    "email": "anna.schmidt@example.com",
    "status": "banned",
    "ban": {
      "reason": "Repeated spam content violations",
      "duration": "30d",
      "bannedAt": "2026-03-12T15:30:00.000Z",
      "expiresAt": "2026-04-11T15:30:00.000Z",
      "bannedBy": {
        "id": 5,
        "displayName": "Admin User"
      }
    }
  },
  "message": "User has been banned for 30 days"
}
```

### Response `200 OK` (Unban)

```json
{
  "data": {
    "id": 1042,
    "email": "anna.schmidt@example.com",
    "status": "active",
    "unbannedAt": "2026-03-12T16:00:00.000Z"
  },
  "message": "User has been unbanned"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"reason is required when banning a user"` | Missing ban reason |
| `400` | `"User is not currently banned"` | Trying to unban an active user |
| `400` | `"User is already banned"` | Trying to ban an already-banned user |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `403` | `"Cannot ban a user with equal or higher role"` | Target has admin/superadmin role |
| `404` | `"User not found"` | No user with that ID |

---

## Error Codes

| Status Code | Error | Common Cause |
|-------------|-------|--------------|
| `400` | Bad Request | Validation failure, invalid parameters |
| `401` | Unauthorized | Missing, expired, or invalid token; wrong password |
| `403` | Forbidden | Insufficient role for the endpoint |
| `404` | Not Found | User ID does not exist |
| `413` | Payload Too Large | Avatar file exceeds 5 MB |
| `429` | Too Many Requests | Rate limit exceeded |

---

## Rate Limiting

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `GET /users/me` | 120 requests | 1 minute | Standard authenticated |
| `PATCH /users/me` | 30 requests | 1 minute | Write tier |
| `DELETE /users/me` | 5 requests | 1 hour | Destructive action |
| `POST /users/me/avatar` | 10 requests | 1 hour | Upload tier |
| `GET /users/me/bookmarks` | 120 requests | 1 minute | Standard authenticated |
| `GET /users/me/activity` | 120 requests | 1 minute | Standard authenticated |
| `POST /users/me/export-data` | 3 requests | 24 hours | Export tier |
| `POST /users/me/delete-account` | 3 requests | 1 hour | Destructive action |
| `GET /users` | 60 requests | 1 minute | Admin |
| `GET /users/:id` | 60 requests | 1 minute | Admin |
| `PATCH /users/:id/role` | 30 requests | 1 minute | Superadmin write |
| `POST /users/:id/ban` | 30 requests | 1 minute | Admin write |
