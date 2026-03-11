# Admin API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Admin API provides platform administration capabilities including analytics dashboards, user management, content moderation, activity logging, site settings, advertising campaign management, and SEO auditing. All endpoints in this document require Admin+ role unless otherwise specified.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **Dashboard** | | | |
| `GET` | `/admin/dashboard` | admin | Get analytics dashboard data |
| **User Management** | | | |
| `GET` | `/admin/users` | admin | List and search users |
| `PATCH` | `/admin/users/:id/role` | superadmin | Change user role |
| `POST` | `/admin/users/:id/ban` | admin | Ban or unban a user |
| **Content Moderation** | | | |
| `GET` | `/admin/moderation-queue` | admin | Get content moderation queue |
| `POST` | `/admin/bulk-moderate` | admin | Bulk moderate content items |
| **Activity & Settings** | | | |
| `GET` | `/admin/activity-log` | admin | View admin activity log |
| `GET` | `/admin/settings` | admin | Get site settings |
| `PATCH` | `/admin/settings` | superadmin | Update site settings |
| **Advertising** | | | |
| `GET` | `/admin/campaigns` | admin | List ad campaigns |
| `POST` | `/admin/campaigns` | admin | Create an ad campaign |
| `GET` | `/admin/placements` | admin | List ad placements |
| `POST` | `/admin/placements` | admin | Create an ad placement |
| **SEO** | | | |
| `GET` | `/admin/seo-audit` | admin | Run SEO audit |

---

## Dashboard

### Get Analytics Dashboard

```
GET /api/v1/admin/dashboard
```

Returns aggregated analytics data for the admin dashboard, including key metrics, trends, and top-performing content.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `30d` | Time period: `24h`, `7d`, `30d`, `90d`, `12m`, `custom` |
| `dateFrom` | string | — | ISO 8601 start date (required if `period` is `custom`) |
| `dateTo` | string | — | ISO 8601 end date (required if `period` is `custom`) |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/dashboard?period=30d" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "period": {
      "from": "2026-02-10T00:00:00Z",
      "to": "2026-03-12T23:59:59Z",
      "label": "Last 30 days"
    },
    "overview": {
      "pageViews": {
        "value": 1245000,
        "change": 12.5,
        "changeDirection": "up"
      },
      "uniqueVisitors": {
        "value": 342000,
        "change": 8.3,
        "changeDirection": "up"
      },
      "registrations": {
        "value": 2340,
        "change": -3.2,
        "changeDirection": "down"
      },
      "revenue": {
        "value": 12450.80,
        "currency": "EUR",
        "change": 18.7,
        "changeDirection": "up"
      }
    },
    "traffic": {
      "dailyPageViews": [
        { "date": "2026-03-11", "value": 42000 },
        { "date": "2026-03-12", "value": 38500 }
      ],
      "topSources": [
        { "source": "Google", "visits": 145000, "percentage": 42.4 },
        { "source": "Direct", "visits": 89000, "percentage": 26.0 },
        { "source": "Instagram", "visits": 45000, "percentage": 13.2 },
        { "source": "Facebook", "visits": 32000, "percentage": 9.4 },
        { "source": "Twitter", "visits": 18000, "percentage": 5.3 }
      ]
    },
    "content": {
      "totalArticles": 1240,
      "totalEvents": 890,
      "totalGuides": 156,
      "totalVideos": 87,
      "totalDining": 432,
      "publishedThisPeriod": 45,
      "topContent": [
        {
          "type": "article",
          "id": "art_a1b2c3",
          "title": "Best Christmas Markets in Berlin 2026",
          "views": 34500,
          "slug": "best-christmas-markets-berlin-2026"
        },
        {
          "type": "event",
          "id": "evt_d4e5f6",
          "title": "Berlin Gallery Weekend",
          "views": 28300,
          "slug": "berlin-gallery-weekend"
        }
      ]
    },
    "users": {
      "totalUsers": 45200,
      "activeUsers": 12400,
      "newUsersThisPeriod": 2340,
      "roleDistribution": {
        "user": 44800,
        "editor": 320,
        "admin": 72,
        "superadmin": 8
      }
    },
    "store": {
      "ordersThisPeriod": 187,
      "revenueThisPeriod": 12450.80,
      "averageOrderValue": 66.58,
      "topProducts": [
        {
          "id": "prod_a1b2c3",
          "name": "I Love Berlin Classic Tee",
          "unitsSold": 45,
          "revenue": 1345.50
        }
      ]
    },
    "moderation": {
      "pendingReports": 8,
      "pendingClassifieds": 12,
      "resolvedThisPeriod": 34
    }
  }
}
```

---

## User Management

### List Users

```
GET /api/v1/admin/users
```

Returns a paginated list of all users with management options.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 100) |
| `sort` | string | `createdAt:desc` | Sort: `createdAt:desc`, `createdAt:asc`, `lastName:asc`, `lastLoginAt:desc` |
| `search` | string | — | Search by name, email, or user ID |
| `role` | string | — | Filter by role: `user`, `editor`, `admin`, `superadmin` |
| `status` | string | — | Filter by status: `active`, `banned`, `unverified` |
| `dateFrom` | string | — | Registered after (ISO 8601) |
| `dateTo` | string | — | Registered before (ISO 8601) |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/users?search=schmidt&role=user&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "usr_a1b2c3",
      "email": "anna.schmidt@example.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "avatarUrl": "https://media.iloveberlin.biz/avatars/anna-schmidt.jpg",
      "role": "user",
      "status": "active",
      "isEmailVerified": true,
      "provider": "email",
      "articleCount": 0,
      "bookmarkCount": 12,
      "orderCount": 3,
      "lastLoginAt": "2026-03-11T18:30:00Z",
      "createdAt": "2025-06-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 3,
    "totalPages": 1
  }
}
```

---

### Change User Role

```
PATCH /api/v1/admin/users/:id/role
```

Changes a user's authorization role. Only superadmins can change roles.

**Authentication:** Superadmin (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The user ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | yes | New role: `user`, `editor`, `admin`, `superadmin` |
| `reason` | string | no | Reason for the role change (logged in activity log) |

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/admin/users/usr_a1b2c3/role" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "role": "editor",
    "reason": "Promoted to editorial contributor for culture section"
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "userId": "usr_a1b2c3",
    "previousRole": "user",
    "newRole": "editor",
    "changedBy": "usr_superadmin1",
    "reason": "Promoted to editorial contributor for culture section",
    "changedAt": "2026-03-12T10:00:00Z"
  }
}
```

**Error Response: `403 Forbidden`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: only superadmins can change user roles",
  "error": "Forbidden"
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Cannot change the role of the last remaining superadmin",
  "error": "Bad Request"
}
```

---

### Ban or Unban User

```
POST /api/v1/admin/users/:id/ban
```

Bans or unbans a user account. Banned users cannot log in or access authenticated endpoints. Active sessions are immediately invalidated upon ban.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The user ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | yes | `ban` or `unban` |
| `reason` | string | conditional | Required for `ban`. Reason displayed to the user |
| `duration` | string | no | Ban duration: `24h`, `7d`, `30d`, `permanent` (default: `permanent`) |
| `notifyUser` | boolean | no | Send email notification (default: `true`) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/admin/users/usr_z9y8x7/ban" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ban",
    "reason": "Repeated violations of community guidelines: posting spam classified listings.",
    "duration": "30d",
    "notifyUser": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "userId": "usr_z9y8x7",
    "action": "ban",
    "reason": "Repeated violations of community guidelines: posting spam classified listings.",
    "duration": "30d",
    "bannedUntil": "2026-04-11T17:00:00Z",
    "sessionsInvalidated": 2,
    "userNotified": true,
    "bannedBy": "usr_admin1",
    "bannedAt": "2026-03-12T17:00:00Z"
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Cannot ban an admin or superadmin user. Demote their role first.",
  "error": "Bad Request"
}
```

---

## Content Moderation

### Get Moderation Queue

```
GET /api/v1/admin/moderation-queue
```

Returns items pending moderation: reported content, flagged classifieds, and auto-flagged items.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `type` | string | — | Filter by content type: `article`, `classified`, `comment`, `review`, `message` |
| `reason` | string | — | Filter by flag reason: `reported`, `spam_detected`, `profanity`, `duplicate` |
| `priority` | string | — | Filter by priority: `high`, `medium`, `low` |
| `sort` | string | `priority:desc` | Sort: `priority:desc`, `createdAt:asc`, `reportCount:desc` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/moderation-queue?type=classified&priority=high" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "mod_a1b2c3",
      "contentType": "classified",
      "contentId": "cls_x1y2z3",
      "contentTitle": "Suspicious electronics deal - 90% off",
      "contentSlug": "suspicious-electronics-deal-90-off",
      "contentExcerpt": "Brand new iPhone 15 Pro Max for only 100 EUR. Wire transfer only...",
      "author": {
        "id": "usr_z9y8x7",
        "firstName": "Unknown",
        "lastName": "User",
        "email": "unknown@example.com",
        "accountAge": "2 days",
        "previousFlags": 3
      },
      "flags": [
        {
          "reason": "scam",
          "reportedBy": "usr_a1b2c3",
          "details": "This is clearly a scam listing. Price is impossibly low.",
          "reportedAt": "2026-03-12T14:00:00Z"
        },
        {
          "reason": "scam",
          "reportedBy": "usr_d4e5f6",
          "details": "Seller asks for wire transfer. Scam.",
          "reportedAt": "2026-03-12T15:30:00Z"
        },
        {
          "reason": "spam_detected",
          "reportedBy": "system",
          "details": "Auto-flagged: new account, suspicious pricing pattern",
          "reportedAt": "2026-03-12T13:55:00Z"
        }
      ],
      "reportCount": 3,
      "priority": "high",
      "status": "pending",
      "createdAt": "2026-03-12T13:55:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 12,
    "totalPages": 1
  }
}
```

---

### Bulk Moderate Content

```
POST /api/v1/admin/bulk-moderate
```

Applies a moderation action to multiple content items at once.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | object[] | yes | Array of items to moderate (max: 50) |
| `items[].moderationId` | string | yes | The moderation queue item ID |
| `items[].action` | string | yes | `approve`, `reject`, `remove`, `dismiss` |
| `reason` | string | conditional | Required for `reject` and `remove` actions |
| `notifyAuthors` | boolean | no | Send notification to content authors (default: `true`) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/admin/bulk-moderate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "moderationId": "mod_a1b2c3", "action": "remove" },
      { "moderationId": "mod_d4e5f6", "action": "approve" },
      { "moderationId": "mod_g7h8i9", "action": "dismiss" }
    ],
    "reason": "Content violates community guidelines regarding scam listings.",
    "notifyAuthors": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "processed": 3,
    "results": [
      {
        "moderationId": "mod_a1b2c3",
        "action": "remove",
        "status": "completed",
        "contentId": "cls_x1y2z3",
        "authorNotified": true
      },
      {
        "moderationId": "mod_d4e5f6",
        "action": "approve",
        "status": "completed",
        "contentId": "cls_p1q2r3",
        "authorNotified": false
      },
      {
        "moderationId": "mod_g7h8i9",
        "action": "dismiss",
        "status": "completed",
        "contentId": "cls_s4t5u6",
        "authorNotified": false
      }
    ],
    "moderatedBy": "usr_admin1",
    "moderatedAt": "2026-03-12T17:30:00Z"
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Maximum 50 items per bulk moderation request",
  "error": "Bad Request"
}
```

---

## Activity & Settings

### Get Activity Log

```
GET /api/v1/admin/activity-log
```

Returns a chronological log of administrative actions taken on the platform.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `50` | Items per page (max: 100) |
| `actor` | string | — | Filter by admin user ID |
| `action` | string | — | Filter by action type: `user_banned`, `role_changed`, `content_removed`, `content_approved`, `settings_updated`, `campaign_created`, `order_updated` |
| `targetType` | string | — | Filter by target type: `user`, `article`, `classified`, `event`, `order`, `settings` |
| `dateFrom` | string | — | ISO 8601 start date |
| `dateTo` | string | — | ISO 8601 end date |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/activity-log?action=user_banned&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "log_a1b2c3",
      "action": "user_banned",
      "actor": {
        "id": "usr_admin1",
        "firstName": "Max",
        "lastName": "Admin",
        "role": "admin"
      },
      "target": {
        "type": "user",
        "id": "usr_z9y8x7",
        "label": "Unknown User (unknown@example.com)"
      },
      "details": {
        "reason": "Repeated violations of community guidelines: posting spam classified listings.",
        "duration": "30d",
        "bannedUntil": "2026-04-11T17:00:00Z"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "timestamp": "2026-03-12T17:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 156,
    "totalPages": 8
  }
}
```

---

### Get Site Settings

```
GET /api/v1/admin/settings
```

Returns current site-wide settings and configuration.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/settings" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "general": {
      "siteName": "ILoveBerlin",
      "siteUrl": "https://iloveberlin.biz",
      "tagline": "Your Complete Guide to Berlin",
      "contactEmail": "hello@iloveberlin.biz",
      "supportEmail": "support@iloveberlin.biz",
      "defaultLanguage": "en",
      "availableLanguages": ["en", "de"],
      "timezone": "Europe/Berlin"
    },
    "content": {
      "articlesPerPage": 12,
      "eventsPerPage": 20,
      "classifiedsPerPage": 20,
      "classifiedExpiryDays": 30,
      "maxClassifiedImages": 8,
      "autoModeration": true,
      "requireApproval": {
        "classifieds": true,
        "comments": false,
        "reviews": false
      }
    },
    "users": {
      "registrationEnabled": true,
      "emailVerificationRequired": true,
      "oauthProviders": ["google", "facebook", "apple"],
      "maxLoginAttempts": 5,
      "lockoutDuration": "15m"
    },
    "store": {
      "enabled": true,
      "currency": "EUR",
      "taxRate": 0.19,
      "freeShippingThreshold": 50.00,
      "standardShippingRate": 4.95,
      "expressShippingRate": 9.95
    },
    "seo": {
      "defaultTitle": "ILoveBerlin - Your Complete Guide to Berlin",
      "defaultDescription": "Discover the best of Berlin: events, dining, culture, nightlife, and city guides.",
      "googleAnalyticsId": "G-XXXXXXXXXX",
      "enableSitemap": true,
      "enableRobotsTxt": true
    },
    "notifications": {
      "emailProvider": "sendgrid",
      "pushEnabled": true,
      "digestFrequency": "weekly"
    },
    "updatedAt": "2026-03-01T10:00:00Z",
    "updatedBy": {
      "id": "usr_superadmin1",
      "firstName": "Super",
      "lastName": "Admin"
    }
  }
}
```

---

### Update Site Settings

```
PATCH /api/v1/admin/settings
```

Updates site-wide settings. Only superadmins can modify settings.

**Authentication:** Superadmin (`Authorization: Bearer <token>`)

**Request Body:** Any subset of the settings structure. Uses dot notation for nested fields.

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/admin/settings" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "classifiedExpiryDays": 45,
      "autoModeration": true
    },
    "store": {
      "freeShippingThreshold": 40.00
    }
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "updated": {
      "content.classifiedExpiryDays": { "from": 30, "to": 45 },
      "store.freeShippingThreshold": { "from": 50.00, "to": 40.00 }
    },
    "updatedAt": "2026-03-12T18:00:00Z",
    "updatedBy": {
      "id": "usr_superadmin1",
      "firstName": "Super",
      "lastName": "Admin"
    }
  }
}
```

**Error Response: `403 Forbidden`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: only superadmins can modify site settings",
  "error": "Forbidden"
}
```

---

## Advertising

### List Ad Campaigns

```
GET /api/v1/admin/campaigns
```

Returns a paginated list of advertising campaigns.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `status` | string | — | Filter: `draft`, `active`, `paused`, `completed`, `archived` |
| `sort` | string | `createdAt:desc` | Sort: `createdAt:desc`, `startsAt:asc`, `budget:desc` |
| `search` | string | — | Search by campaign name or advertiser |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/campaigns?status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "camp_a1b2c3",
      "name": "Hotel Adlon Spring Campaign",
      "advertiser": {
        "name": "Hotel Adlon Kempinski",
        "contactEmail": "marketing@kempinski.com"
      },
      "status": "active",
      "budget": {
        "total": 5000.00,
        "spent": 2340.00,
        "remaining": 2660.00,
        "currency": "EUR"
      },
      "pricingModel": "cpm",
      "cpmRate": 8.50,
      "performance": {
        "impressions": 275294,
        "clicks": 3842,
        "ctr": 1.40,
        "conversions": 12
      },
      "placements": ["homepage_hero", "events_sidebar"],
      "startsAt": "2026-03-01T00:00:00Z",
      "endsAt": "2026-04-30T23:59:59Z",
      "createdAt": "2026-02-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 8,
    "totalPages": 1
  }
}
```

---

### Create Ad Campaign

```
POST /api/v1/admin/campaigns
```

Creates a new advertising campaign.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Campaign name (5-200 characters) |
| `advertiser` | object | yes | Advertiser details |
| `advertiser.name` | string | yes | Advertiser name |
| `advertiser.contactEmail` | string | yes | Contact email |
| `advertiser.contactPhone` | string | no | Contact phone |
| `advertiser.website` | string | no | Advertiser website |
| `budget` | object | yes | Budget configuration |
| `budget.total` | number | yes | Total budget (EUR) |
| `budget.dailyCap` | number | no | Daily spend cap |
| `pricingModel` | string | yes | `cpm`, `cpc`, `flat_rate` |
| `cpmRate` | number | conditional | Rate per 1000 impressions (required if `cpm`) |
| `cpcRate` | number | conditional | Rate per click (required if `cpc`) |
| `flatRate` | number | conditional | Total flat rate (required if `flat_rate`) |
| `targetUrl` | string | yes | Click-through URL |
| `creativeMediaIds` | string[] | yes | Media IDs for ad creative (banner images) |
| `placementIds` | string[] | yes | Ad placement IDs |
| `targeting` | object | no | Targeting configuration |
| `targeting.categories` | string[] | no | Target content categories |
| `targeting.districts` | string[] | no | Target Berlin districts |
| `targeting.languages` | string[] | no | Target languages |
| `startsAt` | string | yes | ISO 8601 start date |
| `endsAt` | string | yes | ISO 8601 end date |
| `status` | string | no | `draft` (default) or `active` |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/admin/campaigns" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Markthalle Neun Summer Events",
    "advertiser": {
      "name": "Markthalle Neun",
      "contactEmail": "events@markthalleneun.de",
      "website": "https://markthalleneun.de"
    },
    "budget": {
      "total": 2000.00,
      "dailyCap": 100.00
    },
    "pricingModel": "cpm",
    "cpmRate": 6.00,
    "targetUrl": "https://markthalleneun.de/events",
    "creativeMediaIds": ["med_ad_001", "med_ad_002"],
    "placementIds": ["plc_events_sidebar", "plc_dining_banner"],
    "targeting": {
      "categories": ["events", "dining"],
      "districts": ["kreuzberg"]
    },
    "startsAt": "2026-06-01T00:00:00Z",
    "endsAt": "2026-08-31T23:59:59Z",
    "status": "draft"
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "camp_d4e5f6",
    "name": "Markthalle Neun Summer Events",
    "advertiser": {
      "name": "Markthalle Neun",
      "contactEmail": "events@markthalleneun.de"
    },
    "status": "draft",
    "budget": {
      "total": 2000.00,
      "dailyCap": 100.00,
      "spent": 0.00,
      "remaining": 2000.00,
      "currency": "EUR"
    },
    "pricingModel": "cpm",
    "cpmRate": 6.00,
    "targetUrl": "https://markthalleneun.de/events",
    "placements": ["plc_events_sidebar", "plc_dining_banner"],
    "startsAt": "2026-06-01T00:00:00Z",
    "endsAt": "2026-08-31T23:59:59Z",
    "createdAt": "2026-03-12T18:00:00Z"
  }
}
```

---

### List Ad Placements

```
GET /api/v1/admin/placements
```

Returns all available ad placement positions on the site.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/placements" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "plc_homepage_hero",
      "name": "Homepage Hero Banner",
      "slug": "homepage_hero",
      "description": "Large banner at the top of the homepage, above the fold",
      "dimensions": {
        "width": 1200,
        "height": 400,
        "unit": "px"
      },
      "format": ["image/jpeg", "image/png", "image/gif"],
      "page": "homepage",
      "position": "top",
      "avgImpressions": 45000,
      "avgImpressionsUnit": "daily",
      "activeCampaigns": 1,
      "maxConcurrentCampaigns": 3,
      "isActive": true
    },
    {
      "id": "plc_events_sidebar",
      "name": "Events Page Sidebar",
      "slug": "events_sidebar",
      "description": "Sidebar banner on the events listing page",
      "dimensions": {
        "width": 300,
        "height": 250,
        "unit": "px"
      },
      "format": ["image/jpeg", "image/png", "image/gif"],
      "page": "events",
      "position": "sidebar",
      "avgImpressions": 18000,
      "avgImpressionsUnit": "daily",
      "activeCampaigns": 2,
      "maxConcurrentCampaigns": 5,
      "isActive": true
    },
    {
      "id": "plc_dining_banner",
      "name": "Dining Page Banner",
      "slug": "dining_banner",
      "description": "Horizontal banner between dining listings",
      "dimensions": {
        "width": 728,
        "height": 90,
        "unit": "px"
      },
      "format": ["image/jpeg", "image/png", "image/gif"],
      "page": "dining",
      "position": "inline",
      "avgImpressions": 12000,
      "avgImpressionsUnit": "daily",
      "activeCampaigns": 1,
      "maxConcurrentCampaigns": 3,
      "isActive": true
    }
  ]
}
```

---

### Create Ad Placement

```
POST /api/v1/admin/placements
```

Creates a new ad placement position.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Placement name |
| `slug` | string | yes | Unique slug identifier |
| `description` | string | no | Description of the placement |
| `dimensions` | object | yes | Ad dimensions |
| `dimensions.width` | integer | yes | Width in pixels |
| `dimensions.height` | integer | yes | Height in pixels |
| `format` | string[] | yes | Accepted image formats |
| `page` | string | yes | Page where the placement appears |
| `position` | string | yes | Position on the page: `top`, `sidebar`, `inline`, `footer` |
| `maxConcurrentCampaigns` | integer | no | Max concurrent campaigns (default: 3) |
| `isActive` | boolean | no | Whether the placement is active (default: `true`) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/admin/placements" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Article Footer Banner",
    "slug": "article_footer",
    "description": "Banner displayed at the bottom of article pages",
    "dimensions": { "width": 728, "height": 90 },
    "format": ["image/jpeg", "image/png", "image/gif"],
    "page": "articles",
    "position": "footer",
    "maxConcurrentCampaigns": 3
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "plc_article_footer",
    "name": "Article Footer Banner",
    "slug": "article_footer",
    "description": "Banner displayed at the bottom of article pages",
    "dimensions": { "width": 728, "height": 90, "unit": "px" },
    "format": ["image/jpeg", "image/png", "image/gif"],
    "page": "articles",
    "position": "footer",
    "maxConcurrentCampaigns": 3,
    "activeCampaigns": 0,
    "isActive": true,
    "createdAt": "2026-03-12T19:00:00Z"
  }
}
```

---

## SEO

### Run SEO Audit

```
GET /api/v1/admin/seo-audit
```

Runs an SEO audit of the site and returns findings, warnings, and recommendations.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | string | `full` | Audit scope: `full`, `pages`, `images`, `metadata`, `links` |
| `limit` | integer | `100` | Maximum number of issues to return |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/seo-audit?scope=full&limit=50" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "auditedAt": "2026-03-12T19:00:00Z",
    "scope": "full",
    "score": 87,
    "summary": {
      "totalPages": 2450,
      "pagesAudited": 2450,
      "issues": {
        "critical": 2,
        "warning": 15,
        "info": 34
      }
    },
    "issues": [
      {
        "severity": "critical",
        "category": "metadata",
        "title": "Missing meta description",
        "description": "2 pages are missing meta descriptions, which impacts search engine visibility.",
        "affectedPages": [
          {
            "url": "/guides/visa-requirements-germany",
            "title": "Visa Requirements for Germany"
          },
          {
            "url": "/dining/new-restaurant-mitte",
            "title": "New Restaurant in Mitte"
          }
        ],
        "recommendation": "Add unique meta descriptions (150-160 characters) to each page describing its content."
      },
      {
        "severity": "warning",
        "category": "images",
        "title": "Images missing alt text",
        "description": "12 images across 8 pages are missing alt attributes.",
        "affectedCount": 12,
        "recommendation": "Add descriptive alt text to all images for accessibility and SEO."
      },
      {
        "severity": "warning",
        "category": "links",
        "title": "Broken internal links",
        "description": "3 internal links point to pages that return 404 errors.",
        "affectedPages": [
          {
            "sourceUrl": "/articles/old-berlin-guide",
            "brokenLink": "/guides/transportation-old",
            "anchorText": "Berlin transportation guide"
          }
        ],
        "recommendation": "Fix or remove broken internal links to improve crawlability."
      },
      {
        "severity": "info",
        "category": "metadata",
        "title": "Title tag length",
        "description": "15 pages have title tags longer than 60 characters, which may be truncated in search results.",
        "affectedCount": 15,
        "recommendation": "Keep title tags under 60 characters for optimal display in search results."
      }
    ],
    "recommendations": [
      {
        "priority": "high",
        "title": "Add structured data (Schema.org)",
        "description": "Implement JSON-LD structured data for events, restaurants, and articles to enable rich snippets in Google search.",
        "impactEstimate": "Can increase click-through rate by 20-30%"
      },
      {
        "priority": "medium",
        "title": "Optimize Core Web Vitals",
        "description": "LCP (Largest Contentful Paint) is 3.2s on mobile. Target is under 2.5s. Consider lazy loading images and optimizing hero images.",
        "impactEstimate": "Improved mobile search rankings"
      }
    ]
  }
}
```

---

## Error Responses

All error responses follow this standard format:

```json
{
  "statusCode": 400,
  "message": "Description of what went wrong",
  "error": "Bad Request"
}
```

| Status Code | Error | Description |
|-------------|-------|-------------|
| `400` | Bad Request | Invalid parameters, cannot ban admin, or bulk moderation exceeds limit |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions (admin trying to access superadmin-only endpoints) |
| `404` | Not Found | User, moderation item, campaign, or placement not found |
| `409` | Conflict | Duplicate placement slug or campaign name |
| `422` | Unprocessable Entity | Invalid role value or setting value |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Endpoint Group | Rate Limit | Window |
|----------------|-----------|--------|
| `GET /admin/dashboard` | 10 requests | 1 minute |
| `GET /admin/users` | 30 requests | 1 minute |
| `PATCH /admin/users/:id/role`, `POST /admin/users/:id/ban` | 10 requests | 1 minute |
| `GET /admin/moderation-queue` | 30 requests | 1 minute |
| `POST /admin/bulk-moderate` | 10 requests | 1 minute |
| `GET /admin/activity-log` | 30 requests | 1 minute |
| `GET /admin/settings`, `PATCH /admin/settings` | 10 requests | 1 minute |
| `GET /admin/campaigns`, `POST /admin/campaigns` | 20 requests | 1 minute |
| `GET /admin/placements`, `POST /admin/placements` | 20 requests | 1 minute |
| `GET /admin/seo-audit` | 5 requests | 1 minute |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Reset: 1710288000
```

**Rate Limit Exceeded Response: `429 Too Many Requests`**

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "error": "Too Many Requests",
  "retryAfter": 45
}
```
