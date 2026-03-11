# Articles API

**Base Path:** `/api/v1/articles`

Endpoints for managing editorial articles, blog posts, and long-form content on the ILoveBerlin platform. Supports public browsing, editor content management, and user bookmarking.

---

## Table of Contents

- [Endpoints Overview](#endpoints-overview)
- [Public Endpoints](#public-endpoints)
  - [GET /articles](#get-articles)
  - [GET /articles/:slug](#get-articlesslug)
  - [POST /articles/:slug/view](#post-articlesslugview)
- [Editor Endpoints](#editor-endpoints)
  - [POST /articles](#post-articles)
  - [PATCH /articles/:id](#patch-articlesid)
  - [DELETE /articles/:id](#delete-articlesid)
  - [PATCH /articles/:id/status](#patch-articlesidstatus)
  - [GET /articles/:id/revisions](#get-articlesidrevisions)
- [User Endpoints](#user-endpoints)
  - [POST /articles/:id/bookmark](#post-articlesidbookmark)
  - [DELETE /articles/:id/bookmark](#delete-articlesidbookmark)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/articles` | Public | List published articles |
| `GET` | `/articles/:slug` | Public | Get a single article by slug |
| `POST` | `/articles/:slug/view` | Public | Record an article view |
| `POST` | `/articles` | Editor | Create a new article |
| `PATCH` | `/articles/:id` | Editor | Update an article |
| `DELETE` | `/articles/:id` | Editor | Delete an article |
| `PATCH` | `/articles/:id/status` | Editor | Change article publication status |
| `GET` | `/articles/:id/revisions` | Editor | List article revision history |
| `POST` | `/articles/:id/bookmark` | User | Bookmark an article |
| `DELETE` | `/articles/:id/bookmark` | User | Remove article bookmark |

---

## Public Endpoints

### GET /articles

Retrieve a paginated list of published articles. Supports full-text search, category/tag filtering, and sorting.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `publishedAt` | Sort field: `publishedAt`, `createdAt`, `updatedAt`, `views`, `title` |
| `order` | string | `desc` | Sort direction: `asc`, `desc` |
| `q` | string | -- | Full-text search across title, excerpt, and body |
| `category` | string | -- | Filter by category slug (comma-separated for multiple) |
| `tag` | string | -- | Filter by tag slug (comma-separated for multiple) |
| `author` | integer | -- | Filter by author user ID |
| `status` | string | `published` | Article status (public can only see `published`) |
| `featured` | boolean | -- | Filter featured articles |
| `publishedAt[gte]` | string | -- | Published on or after (ISO 8601 date) |
| `publishedAt[lte]` | string | -- | Published on or before (ISO 8601 date) |

### Sorting: Trending

To fetch trending articles, use the special sort value `trending`, which combines view count, recency, and engagement:

```
GET /api/v1/articles?sort=trending&limit=10
```

### Example Request

```
GET /api/v1/articles?category=food,culture&tag=kreuzberg&sort=publishedAt&order=desc&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 89,
      "title": "Top 10 Cafes in Kreuzberg",
      "slug": "top-10-cafes-kreuzberg",
      "excerpt": "Discover the best coffee spots in one of Berlin's most vibrant neighborhoods, from third-wave roasters to cozy corner cafes.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/articles/89/cover.jpg",
      "category": {
        "id": 3,
        "name": "Food & Drink",
        "slug": "food"
      },
      "tags": [
        { "id": 12, "name": "Kreuzberg", "slug": "kreuzberg" },
        { "id": 45, "name": "Coffee", "slug": "coffee" },
        { "id": 8, "name": "Cafes", "slug": "cafes" }
      ],
      "author": {
        "id": 1042,
        "displayName": "Anna S.",
        "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg"
      },
      "readingTime": 7,
      "views": 3421,
      "featured": false,
      "publishedAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-05T14:22:00.000Z"
    },
    {
      "id": 92,
      "title": "Berlin's Best Street Food Markets",
      "slug": "berlins-best-street-food-markets",
      "excerpt": "From Markthalle Neun to Thai Park, explore the city's most delicious outdoor food experiences.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/articles/92/cover.jpg",
      "category": {
        "id": 3,
        "name": "Food & Drink",
        "slug": "food"
      },
      "tags": [
        { "id": 67, "name": "Street Food", "slug": "street-food" },
        { "id": 12, "name": "Kreuzberg", "slug": "kreuzberg" }
      ],
      "author": {
        "id": 987,
        "displayName": "Max M.",
        "avatarUrl": null
      },
      "readingTime": 5,
      "views": 2198,
      "featured": true,
      "publishedAt": "2026-02-28T08:30:00.000Z",
      "updatedAt": "2026-02-28T08:30:00.000Z"
    }
  ],
  "meta": {
    "total": 34,
    "page": 1,
    "limit": 10,
    "totalPages": 4
  }
}
```

---

### GET /articles/:slug

Retrieve a single published article by its URL slug. Returns the full article body and metadata.

**Authentication:** Public

### Request

```
GET /api/v1/articles/top-10-cafes-kreuzberg
```

### Response `200 OK`

```json
{
  "data": {
    "id": 89,
    "title": "Top 10 Cafes in Kreuzberg",
    "slug": "top-10-cafes-kreuzberg",
    "excerpt": "Discover the best coffee spots in one of Berlin's most vibrant neighborhoods, from third-wave roasters to cozy corner cafes.",
    "body": "<h2>1. Concierge Coffee</h2><p>Tucked away on Paul-Lincke-Ufer, this tiny standing-room-only cafe serves some of the best pour-over in Berlin...</p><h2>2. Companion Coffee</h2><p>A Kreuzberg staple since 2014, Companion combines excellent espresso with a rotating selection of single-origin beans...</p>",
    "bodyFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/articles/89/cover.jpg",
    "images": [
      {
        "url": "https://cdn.iloveberlin.biz/articles/89/img-01.jpg",
        "alt": "Interior of Concierge Coffee",
        "caption": "The minimalist interior of Concierge Coffee on Paul-Lincke-Ufer"
      },
      {
        "url": "https://cdn.iloveberlin.biz/articles/89/img-02.jpg",
        "alt": "Latte art at Companion Coffee",
        "caption": "Expert latte art at Companion Coffee"
      }
    ],
    "category": {
      "id": 3,
      "name": "Food & Drink",
      "slug": "food"
    },
    "tags": [
      { "id": 12, "name": "Kreuzberg", "slug": "kreuzberg" },
      { "id": 45, "name": "Coffee", "slug": "coffee" },
      { "id": 8, "name": "Cafes", "slug": "cafes" }
    ],
    "author": {
      "id": 1042,
      "displayName": "Anna S.",
      "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg",
      "bio": "Berlin-based food blogger and coffee enthusiast."
    },
    "readingTime": 7,
    "views": 3421,
    "featured": false,
    "seo": {
      "metaTitle": "Top 10 Cafes in Kreuzberg | ILoveBerlin",
      "metaDescription": "Discover the best coffee spots in Kreuzberg, from third-wave roasters to cozy corner cafes.",
      "canonicalUrl": "https://iloveberlin.biz/articles/top-10-cafes-kreuzberg"
    },
    "relatedArticles": [
      {
        "id": 92,
        "title": "Berlin's Best Street Food Markets",
        "slug": "berlins-best-street-food-markets",
        "coverImageUrl": "https://cdn.iloveberlin.biz/articles/92/cover.jpg"
      },
      {
        "id": 78,
        "title": "Specialty Coffee Guide to Berlin",
        "slug": "specialty-coffee-guide-berlin",
        "coverImageUrl": "https://cdn.iloveberlin.biz/articles/78/cover.jpg"
      }
    ],
    "publishedAt": "2026-03-01T10:00:00.000Z",
    "createdAt": "2026-02-25T09:00:00.000Z",
    "updatedAt": "2026-03-05T14:22:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | `"Article not found"` | Slug does not match a published article |

---

### POST /articles/:slug/view

Record an article page view. Used for analytics and trending calculations. Deduplicated by IP/session to prevent inflation.

**Authentication:** Public

### Request

```
POST /api/v1/articles/top-10-cafes-kreuzberg/view
```

Request body is optional. If provided:

```json
{
  "referrer": "https://www.google.com",
  "sessionId": "sess_abc123"
}
```

### Response `200 OK`

```json
{
  "data": {
    "views": 3422
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | `"Article not found"` | Slug does not exist |

---

## Editor Endpoints

### POST /articles

Create a new article. New articles are created with `draft` status by default.

**Authentication:** Editor

### Request

```json
{
  "title": "Hidden Courtyards of Berlin-Mitte",
  "excerpt": "Step through unassuming doorways to discover Berlin's secret Hinterhof culture, from art galleries to tranquil gardens.",
  "body": "<h2>The Hackesche Hoefe</h2><p>Perhaps the most famous of Berlin's courtyards, the Hackesche Hoefe is a complex of eight interconnected yards...</p>",
  "bodyFormat": "html",
  "coverImageUrl": "https://cdn.iloveberlin.biz/articles/uploads/courtyard-cover.jpg",
  "categoryId": 2,
  "tagIds": [15, 22, 33],
  "seo": {
    "metaTitle": "Hidden Courtyards of Berlin-Mitte | ILoveBerlin",
    "metaDescription": "Discover secret courtyards and Hinterhof culture in Berlin-Mitte."
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Min 5, max 200 chars |
| `excerpt` | string | Yes | Min 20, max 500 chars |
| `body` | string | Yes | Min 100 chars, valid HTML or Markdown |
| `bodyFormat` | string | No | `html` (default) or `markdown` |
| `coverImageUrl` | string | No | Valid URL |
| `categoryId` | integer | Yes | Must reference existing category |
| `tagIds` | integer[] | No | Array of existing tag IDs, max 10 |
| `seo` | object | No | SEO metadata |
| `seo.metaTitle` | string | No | Max 70 chars |
| `seo.metaDescription` | string | No | Max 160 chars |

### Response `201 Created`

```json
{
  "data": {
    "id": 105,
    "title": "Hidden Courtyards of Berlin-Mitte",
    "slug": "hidden-courtyards-berlin-mitte",
    "excerpt": "Step through unassuming doorways to discover Berlin's secret Hinterhof culture, from art galleries to tranquil gardens.",
    "body": "<h2>The Hackesche Hoefe</h2><p>Perhaps the most famous of Berlin's courtyards...</p>",
    "bodyFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/articles/uploads/courtyard-cover.jpg",
    "category": {
      "id": 2,
      "name": "Culture & History",
      "slug": "culture"
    },
    "tags": [
      { "id": 15, "name": "Mitte", "slug": "mitte" },
      { "id": 22, "name": "Architecture", "slug": "architecture" },
      { "id": 33, "name": "Hidden Gems", "slug": "hidden-gems" }
    ],
    "author": {
      "id": 1042,
      "displayName": "Anna S."
    },
    "status": "draft",
    "readingTime": 6,
    "views": 0,
    "featured": false,
    "seo": {
      "metaTitle": "Hidden Courtyards of Berlin-Mitte | ILoveBerlin",
      "metaDescription": "Discover secret courtyards and Hinterhof culture in Berlin-Mitte."
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
| `404` | `"Category not found"` | Invalid categoryId |
| `409` | `"An article with this slug already exists"` | Duplicate slug generated from title |

---

### PATCH /articles/:id

Update an existing article. Only the article's author or an admin can update it. Only provided fields are updated.

**Authentication:** Editor (own articles) or Admin (any article)

### Request

```json
{
  "title": "Hidden Courtyards of Berlin-Mitte: A Walking Guide",
  "excerpt": "Step through unassuming doorways to discover Berlin's secret Hinterhof culture.",
  "tagIds": [15, 22, 33, 41]
}
```

All fields from `POST /articles` are accepted; all are optional.

### Response `200 OK`

```json
{
  "data": {
    "id": 105,
    "title": "Hidden Courtyards of Berlin-Mitte: A Walking Guide",
    "slug": "hidden-courtyards-berlin-mitte-walking-guide",
    "excerpt": "Step through unassuming doorways to discover Berlin's secret Hinterhof culture.",
    "body": "<h2>The Hackesche Hoefe</h2><p>Perhaps the most famous of Berlin's courtyards...</p>",
    "bodyFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/articles/uploads/courtyard-cover.jpg",
    "category": {
      "id": 2,
      "name": "Culture & History",
      "slug": "culture"
    },
    "tags": [
      { "id": 15, "name": "Mitte", "slug": "mitte" },
      { "id": 22, "name": "Architecture", "slug": "architecture" },
      { "id": 33, "name": "Hidden Gems", "slug": "hidden-gems" },
      { "id": 41, "name": "Walking Tour", "slug": "walking-tour" }
    ],
    "author": {
      "id": 1042,
      "displayName": "Anna S."
    },
    "status": "draft",
    "readingTime": 6,
    "views": 0,
    "featured": false,
    "createdAt": "2026-03-12T15:30:00.000Z",
    "updatedAt": "2026-03-12T16:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid field values |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only edit your own articles"` | Editor trying to edit another editor's article |
| `404` | `"Article not found"` | No article with that ID |

---

### DELETE /articles/:id

Soft-delete an article. The article is no longer visible publicly but can be restored by an admin.

**Authentication:** Editor (own articles) or Admin (any article)

### Request

```
DELETE /api/v1/articles/105
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response `204 No Content`

No response body.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only delete your own articles"` | Editor trying to delete another editor's article |
| `404` | `"Article not found"` | No article with that ID |

---

### PATCH /articles/:id/status

Change an article's publication status. Editors can submit for review; admins can approve/publish.

**Authentication:** Editor

### Request

```json
{
  "status": "published",
  "publishedAt": "2026-03-15T08:00:00.000Z"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | Yes | One of: `draft`, `review`, `published`, `archived` |
| `publishedAt` | string | No | ISO 8601 datetime; required when publishing, can be future for scheduling |

### Status Transitions

| Current | Allowed Transitions | Who Can Transition |
|---------|---------------------|--------------------|
| `draft` | `review` | Editor (author) |
| `review` | `draft`, `published` | Admin |
| `published` | `archived`, `draft` | Admin |
| `archived` | `draft` | Admin |

### Response `200 OK`

```json
{
  "data": {
    "id": 105,
    "title": "Hidden Courtyards of Berlin-Mitte: A Walking Guide",
    "slug": "hidden-courtyards-berlin-mitte-walking-guide",
    "status": "published",
    "previousStatus": "review",
    "publishedAt": "2026-03-15T08:00:00.000Z",
    "updatedAt": "2026-03-12T16:30:00.000Z"
  },
  "message": "Article status changed from review to published"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Invalid status transition from draft to published"` | Transition not allowed |
| `400` | `"publishedAt is required when publishing"` | Missing publish date |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | Role cannot perform this transition |
| `404` | `"Article not found"` | No article with that ID |

---

### GET /articles/:id/revisions

List the revision history of an article. Each save creates a revision, enabling content rollback.

**Authentication:** Editor (own articles) or Admin (any article)

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 50) |

### Example Request

```
GET /api/v1/articles/105/revisions?page=1&limit=5
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 412,
      "articleId": 105,
      "version": 3,
      "title": "Hidden Courtyards of Berlin-Mitte: A Walking Guide",
      "excerpt": "Step through unassuming doorways to discover Berlin's secret Hinterhof culture.",
      "changesSummary": "Updated title, added walking tour tag",
      "editedBy": {
        "id": 1042,
        "displayName": "Anna S."
      },
      "createdAt": "2026-03-12T16:00:00.000Z"
    },
    {
      "id": 410,
      "articleId": 105,
      "version": 2,
      "title": "Hidden Courtyards of Berlin-Mitte",
      "excerpt": "Step through unassuming doorways to discover Berlin's secret Hinterhof culture, from art galleries to tranquil gardens.",
      "changesSummary": "Updated body content, added images",
      "editedBy": {
        "id": 1042,
        "displayName": "Anna S."
      },
      "createdAt": "2026-03-12T15:45:00.000Z"
    },
    {
      "id": 408,
      "articleId": 105,
      "version": 1,
      "title": "Hidden Courtyards of Berlin-Mitte",
      "excerpt": "Step through unassuming doorways to discover Berlin's secret Hinterhof culture, from art galleries to tranquil gardens.",
      "changesSummary": "Initial creation",
      "editedBy": {
        "id": 1042,
        "displayName": "Anna S."
      },
      "createdAt": "2026-03-12T15:30:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only view revisions of your own articles"` | Editor trying to view another editor's revisions |
| `404` | `"Article not found"` | No article with that ID |

---

## User Endpoints

### POST /articles/:id/bookmark

Bookmark an article for the authenticated user.

**Authentication:** User

### Request

```
POST /api/v1/articles/89/bookmark
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

No request body required.

### Response `201 Created`

```json
{
  "message": "Article bookmarked successfully",
  "data": {
    "articleId": 89,
    "bookmarkedAt": "2026-03-12T16:45:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `404` | `"Article not found"` | No published article with that ID |
| `409` | `"Article is already bookmarked"` | Duplicate bookmark |

---

### DELETE /articles/:id/bookmark

Remove a bookmark from an article for the authenticated user.

**Authentication:** User

### Request

```
DELETE /api/v1/articles/89/bookmark
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response `200 OK`

```json
{
  "message": "Bookmark removed successfully"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `404` | `"Bookmark not found"` | Article was not bookmarked |

---

## Error Codes

| Status Code | Error | Common Cause |
|-------------|-------|--------------|
| `400` | Bad Request | Validation failure, invalid status transition |
| `401` | Unauthorized | Missing or invalid access token |
| `403` | Forbidden | Insufficient role or trying to edit another user's content |
| `404` | Not Found | Article or related resource does not exist |
| `409` | Conflict | Duplicate slug or duplicate bookmark |
| `429` | Too Many Requests | Rate limit exceeded |

---

## Rate Limiting

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `GET /articles` | 60 requests | 1 minute | Public tier |
| `GET /articles/:slug` | 60 requests | 1 minute | Public tier |
| `POST /articles/:slug/view` | 120 requests | 1 minute | High-frequency, deduplicated |
| `POST /articles` | 30 requests | 1 minute | Write tier |
| `PATCH /articles/:id` | 30 requests | 1 minute | Write tier |
| `DELETE /articles/:id` | 30 requests | 1 minute | Write tier |
| `PATCH /articles/:id/status` | 30 requests | 1 minute | Write tier |
| `GET /articles/:id/revisions` | 60 requests | 1 minute | Authenticated read |
| `POST /articles/:id/bookmark` | 30 requests | 1 minute | Write tier |
| `DELETE /articles/:id/bookmark` | 30 requests | 1 minute | Write tier |
