# API Conventions

**Base URL:** `https://iloveberlin.biz/api/v1`

---

## Table of Contents

- [RESTful Design Principles](#restful-design-principles)
- [Versioning](#versioning)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Pagination](#pagination)
- [Sorting](#sorting)
- [Filtering](#filtering)
- [Search](#search)
- [Error Handling](#error-handling)
- [Date and Time Format](#date-and-time-format)
- [Rate Limiting](#rate-limiting)
- [CORS](#cors)
- [Idempotency](#idempotency)

---

## RESTful Design Principles

The ILoveBerlin API follows standard RESTful conventions:

| HTTP Method | Purpose | Idempotent | Example |
|-------------|---------|------------|---------|
| `GET` | Retrieve a resource or collection | Yes | `GET /articles` |
| `POST` | Create a new resource | No | `POST /articles` |
| `PATCH` | Partially update a resource | Yes | `PATCH /articles/42` |
| `DELETE` | Remove a resource | Yes | `DELETE /articles/42` |

### Resource Naming

- Plural nouns for collections: `/articles`, `/events`, `/users`
- Nested resources for relationships: `/restaurants/:id/offers`
- Slugs for public-facing lookups: `/articles/:slug`
- Numeric IDs for internal/editor operations: `/articles/:id`

---

## Versioning

The API is versioned via URL path prefix:

```
/api/v1/articles
/api/v1/events
```

When a new version is released, the previous version will remain available for at least 12 months with a deprecation notice in response headers:

```
Sunset: Sat, 01 Mar 2028 00:00:00 GMT
Deprecation: true
Link: <https://iloveberlin.biz/api/v2/articles>; rel="successor-version"
```

---

## Request Format

### Content Type

All request bodies must be JSON:

```
Content-Type: application/json
```

File uploads use multipart form data:

```
Content-Type: multipart/form-data
```

### Authentication Header

```
Authorization: Bearer <access_token>
```

### Accept Header (optional)

```
Accept: application/json
```

---

## Response Format

### Single Resource Response

```json
{
  "data": {
    "id": 1,
    "type": "article",
    "title": "Top 10 Cafes in Kreuzberg",
    "slug": "top-10-cafes-kreuzberg",
    "createdAt": "2026-02-15T10:30:00.000Z",
    "updatedAt": "2026-03-01T14:22:00.000Z"
  }
}
```

### Collection Response (Paginated)

```json
{
  "data": [
    {
      "id": 1,
      "type": "article",
      "title": "Top 10 Cafes in Kreuzberg",
      "slug": "top-10-cafes-kreuzberg"
    },
    {
      "id": 2,
      "type": "article",
      "title": "Berlin Street Art Walking Tour",
      "slug": "berlin-street-art-walking-tour"
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Success Response (No Data)

Used for operations like `DELETE` that return no content:

```
HTTP/1.1 204 No Content
```

### Action Confirmation Response

Used for operations like bookmark toggles:

```json
{
  "message": "Article bookmarked successfully"
}
```

---

## Pagination

All collection endpoints support cursor-free offset-based pagination.

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | `1` | -- | Page number (1-indexed) |
| `limit` | integer | `20` | `100` | Items per page |

### Example Request

```
GET /api/v1/articles?page=2&limit=10
```

### Example Response

```json
{
  "data": [ ... ],
  "meta": {
    "total": 142,
    "page": 2,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Meta Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of matching records |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `totalPages` | integer | Total number of pages (`ceil(total / limit)`) |

### Edge Cases

- Requesting a page beyond `totalPages` returns an empty `data` array with correct `meta`.
- `limit=0` is invalid and returns a `400` error.
- Negative page numbers return a `400` error.

---

## Sorting

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | varies by endpoint | Field to sort by |
| `order` | string | `desc` | Sort direction: `asc` or `desc` |

### Example Requests

```
GET /api/v1/articles?sort=createdAt&order=desc
GET /api/v1/events?sort=startDate&order=asc
GET /api/v1/restaurants?sort=rating&order=desc
```

### Multi-field Sorting

Use comma-separated values for multi-field sorting:

```
GET /api/v1/articles?sort=category,createdAt&order=asc,desc
```

### Available Sort Fields by Resource

| Resource | Sortable Fields |
|----------|----------------|
| Articles | `createdAt`, `updatedAt`, `publishedAt`, `views`, `title` |
| Events | `startDate`, `endDate`, `createdAt`, `title` |
| Guides | `createdAt`, `updatedAt`, `title`, `order` |
| Restaurants | `createdAt`, `name`, `rating`, `priceRange` |

---

## Filtering

Filtering is done via query parameters. Different filter types are available depending on the data type.

### Exact Match

```
GET /api/v1/articles?category=culture
GET /api/v1/events?district=kreuzberg
```

### Multiple Values (OR logic)

Use comma-separated values:

```
GET /api/v1/articles?category=culture,food
GET /api/v1/events?district=kreuzberg,mitte,neukoelln
```

### Range Filters

Use bracket suffixes for numeric and date ranges:

```
GET /api/v1/restaurants?priceRange[gte]=2&priceRange[lte]=4
GET /api/v1/events?startDate[gte]=2026-03-01&startDate[lte]=2026-03-31
```

| Suffix | Meaning |
|--------|---------|
| `[eq]` | Equal to (default) |
| `[gte]` | Greater than or equal to |
| `[lte]` | Less than or equal to |
| `[gt]` | Greater than |
| `[lt]` | Less than |

### Boolean Filters

```
GET /api/v1/events?isFree=true
GET /api/v1/events?isRecurring=false
```

### Null Filters

```
GET /api/v1/articles?publishedAt[ne]=null
```

### Combined Filters (AND logic)

All filter parameters are combined with AND logic:

```
GET /api/v1/events?category=music&district=kreuzberg&isFree=true&startDate[gte]=2026-04-01
```

---

## Search

Full-text search is available on selected endpoints via the `q` parameter:

```
GET /api/v1/articles?q=best+coffee+berlin
GET /api/v1/events?q=techno+party
GET /api/v1/restaurants?q=vietnamese+pho
```

Search examines titles, descriptions, tags, and other relevant text fields. Results are ordered by relevance unless a `sort` parameter is specified.

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    },
    {
      "field": "password",
      "message": "password must be at least 8 characters"
    }
  ]
}
```

### Standard Error Codes

| Status Code | Error | Typical Cause |
|-------------|-------|---------------|
| `400` | Bad Request | Malformed JSON, invalid query parameters, validation failure |
| `401` | Unauthorized | Missing token, expired token, invalid token |
| `403` | Forbidden | Valid token but insufficient role/permissions |
| `404` | Not Found | Resource does not exist or has been deleted |
| `409` | Conflict | Duplicate resource (e.g., email already registered) |
| `413` | Payload Too Large | Request body or file upload exceeds size limit |
| `422` | Unprocessable Entity | Semantically invalid request (e.g., end date before start date) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

### Validation Error Example

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "title",
      "message": "title must be between 5 and 200 characters"
    }
  ]
}
```

### Rate Limit Error Example

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again in 60 seconds.",
  "error": "Too Many Requests",
  "retryAfter": 60
}
```

---

## Date and Time Format

All dates and timestamps use **ISO 8601** format in **UTC**:

```
2026-03-12T14:30:00.000Z
```

### Date-only Fields

Some fields (e.g., event dates) use date-only format:

```
2026-03-12
```

### Duration Fields

Durations use ISO 8601 duration format:

```
PT2H30M   (2 hours, 30 minutes)
P1D       (1 day)
```

### Timezone Handling

- All timestamps stored and returned in UTC.
- Client applications are responsible for converting to the user's local timezone.
- Berlin-specific times (e.g., event start times) include a `timezone` field set to `Europe/Berlin`.

---

## Rate Limiting

Rate limits protect the API from abuse and ensure fair usage.

### Rate Limit Tiers

| Tier | Scope | Limit | Window |
|------|-------|-------|--------|
| **Public** | Unauthenticated requests | 60 requests | 1 minute |
| **Authenticated** | Standard authenticated requests | 120 requests | 1 minute |
| **Write** | POST, PATCH, DELETE operations | 30 requests | 1 minute |
| **Auth** | Login, register, password reset | 10 requests | 15 minutes |
| **Upload** | File uploads (images, avatars) | 10 requests | 1 hour |
| **Export** | Data export endpoints | 3 requests | 1 hour |
| **Search** | Full-text search queries | 30 requests | 1 minute |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 117
X-RateLimit-Reset: 1710288060
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

### Rate Limit Exceeded Response

```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1710288060
```

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again in 45 seconds.",
  "error": "Too Many Requests",
  "retryAfter": 45
}
```

---

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for browser-based clients.

### Allowed Origins

- `https://iloveberlin.biz`
- `https://www.iloveberlin.biz`
- `https://admin.iloveberlin.biz`
- `http://localhost:3000` (development only)

### CORS Headers

```
Access-Control-Allow-Origin: https://iloveberlin.biz
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

---

## Idempotency

For POST requests that create resources, you can supply an `Idempotency-Key` header to prevent duplicate creation on network retries:

```
Idempotency-Key: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

- The key must be a UUID v4.
- Keys are valid for 24 hours.
- Repeated requests with the same key return the original response without creating a duplicate.
- GET, PATCH, and DELETE requests are inherently idempotent and do not require this header.
