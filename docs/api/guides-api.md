# Guides API

**Base Path:** `/api/v1/guides`

Endpoints for managing city guides and guide topics on the ILoveBerlin platform. Guides are long-form, evergreen content organized by topics (e.g., "Relocating to Berlin", "Public Transport", "Neighborhoods"). Topics serve as categories for grouping related guides.

---

## Table of Contents

- [Endpoints Overview](#endpoints-overview)
- [Public Endpoints](#public-endpoints)
  - [GET /guides](#get-guides)
  - [GET /guides/topics](#get-guidestopics)
  - [GET /guides/topics/:slug](#get-guidestopicsslug)
  - [GET /guides/:slug](#get-guidesslug)
- [Editor Endpoints](#editor-endpoints)
  - [POST /guides](#post-guides)
  - [PATCH /guides/:id](#patch-guidesid)
  - [DELETE /guides/:id](#delete-guidesid)
- [Admin Endpoints](#admin-endpoints)
  - [POST /guides/topics](#post-guidestopics)
  - [PATCH /guides/topics/:id](#patch-guidestopicsid)
  - [DELETE /guides/topics/:id](#delete-guidestopicsid)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/guides` | Public | List all published guides |
| `GET` | `/guides/topics` | Public | List all guide topics |
| `GET` | `/guides/topics/:slug` | Public | Get a topic with its guides |
| `GET` | `/guides/:slug` | Public | Get a single guide by slug |
| `POST` | `/guides` | Editor | Create a new guide |
| `PATCH` | `/guides/:id` | Editor | Update a guide |
| `DELETE` | `/guides/:id` | Editor | Delete a guide |
| `POST` | `/guides/topics` | Admin | Create a new topic |
| `PATCH` | `/guides/topics/:id` | Admin | Update a topic |
| `DELETE` | `/guides/topics/:id` | Admin | Delete a topic |

---

## Public Endpoints

### GET /guides

Retrieve a paginated list of published guides. Supports filtering by topic and full-text search.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `order` | Sort field: `order`, `createdAt`, `updatedAt`, `title` |
| `order` | string | `asc` | Sort direction: `asc`, `desc` |
| `q` | string | -- | Full-text search across title, excerpt, and body |
| `topic` | string | -- | Filter by topic slug |
| `featured` | boolean | -- | Filter featured guides |

### Example Request

```
GET /api/v1/guides?topic=relocating&sort=order&order=asc&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 12,
      "title": "How to Register Your Address in Berlin (Anmeldung)",
      "slug": "anmeldung-berlin-address-registration",
      "excerpt": "A step-by-step guide to registering your address at the Buergeramt, including tips for getting an appointment.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/guides/12/cover.jpg",
      "topic": {
        "id": 1,
        "name": "Relocating to Berlin",
        "slug": "relocating"
      },
      "author": {
        "id": 987,
        "displayName": "Max M.",
        "avatarUrl": null
      },
      "readingTime": 12,
      "order": 1,
      "featured": true,
      "publishedAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-03-01T09:00:00.000Z"
    },
    {
      "id": 14,
      "title": "Opening a Bank Account in Germany",
      "slug": "opening-bank-account-germany",
      "excerpt": "Compare traditional banks, online banks, and neo-banks to find the best option for expats in Berlin.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/guides/14/cover.jpg",
      "topic": {
        "id": 1,
        "name": "Relocating to Berlin",
        "slug": "relocating"
      },
      "author": {
        "id": 1042,
        "displayName": "Anna S.",
        "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg"
      },
      "readingTime": 9,
      "order": 2,
      "featured": false,
      "publishedAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-02-20T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET /guides/topics

Retrieve all guide topics with guide counts.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | `order` | Sort field: `order`, `name`, `createdAt` |
| `order` | string | `asc` | Sort direction: `asc`, `desc` |

### Example Request

```
GET /api/v1/guides/topics?sort=order&order=asc
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "Relocating to Berlin",
      "slug": "relocating",
      "description": "Everything you need to know about moving to Berlin: visas, registration, housing, and more.",
      "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/relocating-icon.svg",
      "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/relocating-cover.jpg",
      "guidesCount": 8,
      "order": 1,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T09:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Public Transport",
      "slug": "public-transport",
      "description": "Navigate Berlin's BVG network like a local: U-Bahn, S-Bahn, trams, buses, and bike-sharing.",
      "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/transport-icon.svg",
      "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/transport-cover.jpg",
      "guidesCount": 5,
      "order": 2,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2026-02-15T11:00:00.000Z"
    },
    {
      "id": 3,
      "name": "Neighborhoods",
      "slug": "neighborhoods",
      "description": "Detailed profiles of Berlin's diverse Bezirke and Kieze, from Mitte to Neukoelln.",
      "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/neighborhoods-icon.svg",
      "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/neighborhoods-cover.jpg",
      "guidesCount": 12,
      "order": 3,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2026-03-05T16:00:00.000Z"
    },
    {
      "id": 4,
      "name": "Healthcare",
      "slug": "healthcare",
      "description": "Understanding the German healthcare system: insurance, finding doctors, and emergency services.",
      "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/healthcare-icon.svg",
      "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/healthcare-cover.jpg",
      "guidesCount": 4,
      "order": 4,
      "createdAt": "2025-12-15T10:00:00.000Z",
      "updatedAt": "2026-02-28T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### GET /guides/topics/:slug

Retrieve a single topic with its list of published guides.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (for the guides within the topic) |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `order` | Sort field for guides: `order`, `createdAt`, `title` |
| `order` | string | `asc` | Sort direction: `asc`, `desc` |

### Example Request

```
GET /api/v1/guides/topics/relocating?sort=order&order=asc
```

### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "name": "Relocating to Berlin",
    "slug": "relocating",
    "description": "Everything you need to know about moving to Berlin: visas, registration, housing, and more.",
    "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/relocating-icon.svg",
    "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/relocating-cover.jpg",
    "guides": [
      {
        "id": 12,
        "title": "How to Register Your Address in Berlin (Anmeldung)",
        "slug": "anmeldung-berlin-address-registration",
        "excerpt": "A step-by-step guide to registering your address at the Buergeramt.",
        "coverImageUrl": "https://cdn.iloveberlin.biz/guides/12/cover.jpg",
        "readingTime": 12,
        "order": 1,
        "publishedAt": "2026-01-10T10:00:00.000Z"
      },
      {
        "id": 14,
        "title": "Opening a Bank Account in Germany",
        "slug": "opening-bank-account-germany",
        "excerpt": "Compare traditional banks, online banks, and neo-banks for expats.",
        "coverImageUrl": "https://cdn.iloveberlin.biz/guides/14/cover.jpg",
        "readingTime": 9,
        "order": 2,
        "publishedAt": "2026-01-15T10:00:00.000Z"
      },
      {
        "id": 16,
        "title": "Finding an Apartment in Berlin",
        "slug": "finding-apartment-berlin",
        "excerpt": "Navigate Berlin's competitive housing market with our practical tips.",
        "coverImageUrl": "https://cdn.iloveberlin.biz/guides/16/cover.jpg",
        "readingTime": 15,
        "order": 3,
        "publishedAt": "2026-01-20T10:00:00.000Z"
      }
    ]
  },
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | `"Topic not found"` | No topic with that slug |

---

### GET /guides/:slug

Retrieve a single published guide by its URL slug with full content.

**Authentication:** Public

### Request

```
GET /api/v1/guides/anmeldung-berlin-address-registration
```

### Response `200 OK`

```json
{
  "data": {
    "id": 12,
    "title": "How to Register Your Address in Berlin (Anmeldung)",
    "slug": "anmeldung-berlin-address-registration",
    "excerpt": "A step-by-step guide to registering your address at the Buergeramt, including tips for getting an appointment.",
    "body": "<h2>What is the Anmeldung?</h2><p>The Anmeldung is the mandatory address registration process in Germany. By law, you must register your address within 14 days of moving into a new apartment...</p><h2>What You Need</h2><ul><li>Your passport or national ID</li><li>A completed Anmeldeformular (registration form)</li><li>Your rental contract or Wohnungsgeberbestaetigung (landlord confirmation)</li></ul><h2>How to Book an Appointment</h2><p>Visit the Berlin.de website to search for available Buergeramt appointments...</p>",
    "bodyFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/guides/12/cover.jpg",
    "images": [
      {
        "url": "https://cdn.iloveberlin.biz/guides/12/buergeramt.jpg",
        "alt": "Berlin Buergeramt entrance",
        "caption": "The Buergeramt in Friedrichshain-Kreuzberg"
      }
    ],
    "topic": {
      "id": 1,
      "name": "Relocating to Berlin",
      "slug": "relocating"
    },
    "author": {
      "id": 987,
      "displayName": "Max M.",
      "avatarUrl": null,
      "bio": "Berlin expat since 2019, helping newcomers navigate the city."
    },
    "readingTime": 12,
    "order": 1,
    "featured": true,
    "tableOfContents": [
      { "id": "what-is-the-anmeldung", "title": "What is the Anmeldung?", "level": 2 },
      { "id": "what-you-need", "title": "What You Need", "level": 2 },
      { "id": "how-to-book-an-appointment", "title": "How to Book an Appointment", "level": 2 }
    ],
    "seo": {
      "metaTitle": "Anmeldung Guide: How to Register Your Address in Berlin | ILoveBerlin",
      "metaDescription": "Step-by-step guide to the Anmeldung process in Berlin. Documents, appointments, and tips.",
      "canonicalUrl": "https://iloveberlin.biz/guides/anmeldung-berlin-address-registration"
    },
    "relatedGuides": [
      {
        "id": 14,
        "title": "Opening a Bank Account in Germany",
        "slug": "opening-bank-account-germany",
        "coverImageUrl": "https://cdn.iloveberlin.biz/guides/14/cover.jpg"
      },
      {
        "id": 18,
        "title": "Getting a German Tax ID (Steueridentifikationsnummer)",
        "slug": "german-tax-id-steueridentifikationsnummer",
        "coverImageUrl": "https://cdn.iloveberlin.biz/guides/18/cover.jpg"
      }
    ],
    "lastVerifiedAt": "2026-02-15T10:00:00.000Z",
    "publishedAt": "2026-01-10T10:00:00.000Z",
    "createdAt": "2025-12-20T09:00:00.000Z",
    "updatedAt": "2026-03-01T09:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | `"Guide not found"` | Slug does not match a published guide |

---

## Editor Endpoints

### POST /guides

Create a new guide. New guides are created with `draft` status by default.

**Authentication:** Editor

### Request

```json
{
  "title": "Understanding German Health Insurance",
  "excerpt": "A comprehensive overview of public (GKV) vs. private (PKV) health insurance for expats in Berlin.",
  "body": "<h2>Public vs. Private Insurance</h2><p>Germany has a dual healthcare system. Most employees earning below the threshold of 69,300 EUR (2026) must enroll in public health insurance (Gesetzliche Krankenversicherung, or GKV)...</p>",
  "bodyFormat": "html",
  "coverImageUrl": "https://cdn.iloveberlin.biz/guides/uploads/health-insurance-cover.jpg",
  "topicId": 4,
  "order": 1,
  "featured": false,
  "seo": {
    "metaTitle": "German Health Insurance Guide for Expats | ILoveBerlin",
    "metaDescription": "Understand public vs. private health insurance in Germany. Complete guide for Berlin expats."
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Min 5, max 200 chars |
| `excerpt` | string | Yes | Min 20, max 500 chars |
| `body` | string | Yes | Min 200 chars, valid HTML or Markdown |
| `bodyFormat` | string | No | `html` (default) or `markdown` |
| `coverImageUrl` | string | No | Valid URL |
| `topicId` | integer | Yes | Must reference existing topic |
| `order` | integer | No | Display order within topic (default: appended last) |
| `featured` | boolean | No | Default: `false` |
| `seo` | object | No | SEO metadata |
| `seo.metaTitle` | string | No | Max 70 chars |
| `seo.metaDescription` | string | No | Max 160 chars |

### Response `201 Created`

```json
{
  "data": {
    "id": 25,
    "title": "Understanding German Health Insurance",
    "slug": "understanding-german-health-insurance",
    "excerpt": "A comprehensive overview of public (GKV) vs. private (PKV) health insurance for expats in Berlin.",
    "body": "<h2>Public vs. Private Insurance</h2><p>Germany has a dual healthcare system...</p>",
    "bodyFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/guides/uploads/health-insurance-cover.jpg",
    "topic": {
      "id": 4,
      "name": "Healthcare",
      "slug": "healthcare"
    },
    "author": {
      "id": 1042,
      "displayName": "Anna S."
    },
    "status": "draft",
    "readingTime": 14,
    "order": 1,
    "featured": false,
    "seo": {
      "metaTitle": "German Health Insurance Guide for Expats | ILoveBerlin",
      "metaDescription": "Understand public vs. private health insurance in Germany. Complete guide for Berlin expats."
    },
    "createdAt": "2026-03-12T15:30:00.000Z",
    "updatedAt": "2026-03-12T15:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing or invalid fields |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an editor |
| `404` | `"Topic not found"` | Invalid topicId |
| `409` | `"A guide with this slug already exists"` | Duplicate slug |

---

### PATCH /guides/:id

Update an existing guide. Only the guide's author or an admin can update it. Only provided fields are updated.

**Authentication:** Editor (own guides) or Admin (any guide)

### Request

```json
{
  "title": "Understanding German Health Insurance: GKV vs PKV",
  "order": 2,
  "featured": true
}
```

All fields from `POST /guides` are accepted; all are optional.

### Response `200 OK`

```json
{
  "data": {
    "id": 25,
    "title": "Understanding German Health Insurance: GKV vs PKV",
    "slug": "understanding-german-health-insurance-gkv-vs-pkv",
    "excerpt": "A comprehensive overview of public (GKV) vs. private (PKV) health insurance for expats in Berlin.",
    "body": "<h2>Public vs. Private Insurance</h2><p>Germany has a dual healthcare system...</p>",
    "bodyFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/guides/uploads/health-insurance-cover.jpg",
    "topic": {
      "id": 4,
      "name": "Healthcare",
      "slug": "healthcare"
    },
    "author": {
      "id": 1042,
      "displayName": "Anna S."
    },
    "status": "draft",
    "readingTime": 14,
    "order": 2,
    "featured": true,
    "createdAt": "2026-03-12T15:30:00.000Z",
    "updatedAt": "2026-03-12T16:15:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid field values |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only edit your own guides"` | Editor trying to edit another editor's guide |
| `404` | `"Guide not found"` | No guide with that ID |

---

### DELETE /guides/:id

Soft-delete a guide. The guide is no longer visible publicly but can be restored by an admin.

**Authentication:** Editor (own guides) or Admin (any guide)

### Request

```
DELETE /api/v1/guides/25
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response `204 No Content`

No response body.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only delete your own guides"` | Editor trying to delete another editor's guide |
| `404` | `"Guide not found"` | No guide with that ID |

---

## Admin Endpoints

### POST /guides/topics

Create a new guide topic.

**Authentication:** Admin

### Request

```json
{
  "name": "Learning German",
  "description": "Resources and tips for learning German in Berlin, from language schools to tandem partners and apps.",
  "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/german-icon.svg",
  "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/german-cover.jpg",
  "order": 5
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Min 3, max 100 chars |
| `description` | string | Yes | Min 20, max 500 chars |
| `iconUrl` | string | No | Valid URL |
| `coverImageUrl` | string | No | Valid URL |
| `order` | integer | No | Display order (default: appended last) |

### Response `201 Created`

```json
{
  "data": {
    "id": 5,
    "name": "Learning German",
    "slug": "learning-german",
    "description": "Resources and tips for learning German in Berlin, from language schools to tandem partners and apps.",
    "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/german-icon.svg",
    "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/german-cover.jpg",
    "guidesCount": 0,
    "order": 5,
    "createdAt": "2026-03-12T16:00:00.000Z",
    "updatedAt": "2026-03-12T16:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing or invalid fields |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `409` | `"A topic with this name already exists"` | Duplicate topic name |

---

### PATCH /guides/topics/:id

Update an existing guide topic. Only provided fields are updated.

**Authentication:** Admin

### Request

```json
{
  "name": "Learning German in Berlin",
  "order": 3
}
```

All fields from `POST /guides/topics` are accepted; all are optional.

### Response `200 OK`

```json
{
  "data": {
    "id": 5,
    "name": "Learning German in Berlin",
    "slug": "learning-german-in-berlin",
    "description": "Resources and tips for learning German in Berlin, from language schools to tandem partners and apps.",
    "iconUrl": "https://cdn.iloveberlin.biz/guides/topics/german-icon.svg",
    "coverImageUrl": "https://cdn.iloveberlin.biz/guides/topics/german-cover.jpg",
    "guidesCount": 0,
    "order": 3,
    "createdAt": "2026-03-12T16:00:00.000Z",
    "updatedAt": "2026-03-12T16:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid field values |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `404` | `"Topic not found"` | No topic with that ID |
| `409` | `"A topic with this name already exists"` | Duplicate topic name |

---

### DELETE /guides/topics/:id

Delete a guide topic. Topics with existing guides cannot be deleted; reassign or delete guides first.

**Authentication:** Admin

### Request

```
DELETE /api/v1/guides/topics/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response `204 No Content`

No response body.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `404` | `"Topic not found"` | No topic with that ID |
| `409` | `"Cannot delete topic with existing guides. Reassign or delete the guides first."` | Topic has associated guides |

**Error Example:**

```json
{
  "statusCode": 409,
  "message": "Cannot delete topic with existing guides. Reassign or delete the guides first.",
  "error": "Conflict",
  "details": {
    "topicId": 5,
    "guidesCount": 3
  }
}
```

---

## Error Codes

| Status Code | Error | Common Cause |
|-------------|-------|--------------|
| `400` | Bad Request | Validation failure, invalid parameters |
| `401` | Unauthorized | Missing or invalid access token |
| `403` | Forbidden | Insufficient role or editing another user's content |
| `404` | Not Found | Guide, topic, or related resource does not exist |
| `409` | Conflict | Duplicate slug/name, or deleting topic with guides |
| `429` | Too Many Requests | Rate limit exceeded |

---

## Rate Limiting

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `GET /guides` | 60 requests | 1 minute | Public tier |
| `GET /guides/topics` | 60 requests | 1 minute | Public tier |
| `GET /guides/topics/:slug` | 60 requests | 1 minute | Public tier |
| `GET /guides/:slug` | 60 requests | 1 minute | Public tier |
| `POST /guides` | 30 requests | 1 minute | Write tier |
| `PATCH /guides/:id` | 30 requests | 1 minute | Write tier |
| `DELETE /guides/:id` | 30 requests | 1 minute | Write tier |
| `POST /guides/topics` | 15 requests | 1 minute | Admin write tier |
| `PATCH /guides/topics/:id` | 15 requests | 1 minute | Admin write tier |
| `DELETE /guides/topics/:id` | 15 requests | 1 minute | Admin write tier |
