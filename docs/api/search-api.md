# Search API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Search API provides full-text search and autocomplete functionality across all content types on the ILoveBerlin platform. Search is powered by Meilisearch, delivering fast, typo-tolerant, and relevant results. The API supports type filtering, faceted search, and highlighted result snippets. Results are returned in a unified format with type-specific shapes for each content category.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/search` | public | Full-text search across all content |
| `GET` | `/search/suggest` | public | Autocomplete suggestions |

---

## Search

```
GET /api/v1/search
```

Performs a full-text search across all content types. Results are ranked by relevance using Meilisearch's ranking rules (typo tolerance, word proximity, attribute weight, recency).

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | **Required.** Search query (1-200 characters) |
| `type` | string | — | Filter by content type. Options: `articles`, `events`, `guides`, `dining`, `videos`, `competitions`, `classifieds`, `products`. Comma-separated for multiple (e.g., `events,dining`) |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `sort` | string | `relevance` | Sort order: `relevance` (default), `date:desc`, `date:asc` |
| `dateFrom` | string | — | ISO 8601 start date (filter results published/created after) |
| `dateTo` | string | — | ISO 8601 end date (filter results published/created before) |
| `district` | string | — | Filter by Berlin district (for events, dining, classifieds) |
| `category` | string | — | Filter by category slug |
| `tag` | string | — | Filter by tag slug |
| `facets` | boolean | `false` | Include facet counts in the response |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/search?q=kreuzberg+street+food&type=dining,events&limit=10&facets=true"
```

**Response: `200 OK`**

```json
{
  "data": {
    "query": "kreuzberg street food",
    "hits": [
      {
        "type": "dining",
        "id": "din_a1b2c3",
        "title": "Markthalle Neun Street Food Thursday",
        "slug": "markthalle-neun-street-food-thursday",
        "description": "Experience Berlin's best street food every Thursday at the historic Markthalle Neun in Kreuzberg.",
        "url": "/dining/markthalle-neun-street-food-thursday",
        "thumbnailUrl": "https://media.iloveberlin.biz/dining/markthalle-neun-thumb.jpg",
        "highlight": {
          "title": "Markthalle Neun <em>Street Food</em> Thursday",
          "description": "Experience Berlin's best <em>street food</em> every Thursday at the historic Markthalle Neun in <em>Kreuzberg</em>."
        },
        "meta": {
          "cuisine": "International",
          "priceRange": "$$",
          "rating": 4.6,
          "district": "Kreuzberg",
          "address": "Eisenbahnstraße 42/43, 10997 Berlin"
        },
        "score": 0.98,
        "publishedAt": "2026-01-15T10:00:00Z"
      },
      {
        "type": "event",
        "id": "evt_d4e5f6",
        "title": "Kreuzberg Food Festival 2026",
        "slug": "kreuzberg-food-festival-2026",
        "description": "Three days of street food, live music, and cooking workshops in the heart of Kreuzberg.",
        "url": "/events/kreuzberg-food-festival-2026",
        "thumbnailUrl": "https://media.iloveberlin.biz/events/kreuzberg-food-fest-thumb.jpg",
        "highlight": {
          "title": "<em>Kreuzberg</em> Food Festival 2026",
          "description": "Three days of <em>street food</em>, live music, and cooking workshops in the heart of <em>Kreuzberg</em>."
        },
        "meta": {
          "startDate": "2026-06-12T11:00:00Z",
          "endDate": "2026-06-14T22:00:00Z",
          "venue": "Görlitzer Park",
          "district": "Kreuzberg",
          "price": "Free entry"
        },
        "score": 0.94,
        "publishedAt": "2026-02-20T08:00:00Z"
      },
      {
        "type": "dining",
        "id": "din_g7h8i9",
        "title": "Burgermeister",
        "slug": "burgermeister",
        "description": "Iconic burger joint under the Schlesisches Tor U-Bahn tracks. A Kreuzberg institution known for craft burgers.",
        "url": "/dining/burgermeister",
        "thumbnailUrl": "https://media.iloveberlin.biz/dining/burgermeister-thumb.jpg",
        "highlight": {
          "title": "Burgermeister",
          "description": "Iconic burger joint under the Schlesisches Tor U-Bahn tracks. A <em>Kreuzberg</em> institution known for craft burgers."
        },
        "meta": {
          "cuisine": "American",
          "priceRange": "$",
          "rating": 4.4,
          "district": "Kreuzberg",
          "address": "Oberbaumstraße 8, 10997 Berlin"
        },
        "score": 0.87,
        "publishedAt": "2025-09-10T12:00:00Z"
      }
    ],
    "facets": {
      "type": {
        "dining": 18,
        "events": 7,
        "articles": 12,
        "guides": 3,
        "videos": 5,
        "classifieds": 2,
        "products": 1,
        "competitions": 0
      },
      "district": {
        "Kreuzberg": 32,
        "Neukölln": 8,
        "Friedrichshain": 5,
        "Mitte": 3
      },
      "category": {
        "street-food": 14,
        "restaurants": 9,
        "food-markets": 6,
        "food-festivals": 4
      }
    },
    "processingTimeMs": 12
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 48,
    "totalPages": 5
  }
}
```

### Type-Specific Result Shapes

Each search hit includes a `meta` object with fields specific to its content type.

#### Articles

```json
{
  "type": "article",
  "meta": {
    "author": "Lena Müller",
    "readTime": "5 min",
    "category": "Culture"
  }
}
```

#### Events

```json
{
  "type": "event",
  "meta": {
    "startDate": "2026-06-12T11:00:00Z",
    "endDate": "2026-06-14T22:00:00Z",
    "venue": "Görlitzer Park",
    "district": "Kreuzberg",
    "price": "Free entry"
  }
}
```

#### Guides

```json
{
  "type": "guide",
  "meta": {
    "topic": "Living in Berlin",
    "readTime": "12 min",
    "lastUpdated": "2026-02-01T10:00:00Z"
  }
}
```

#### Dining

```json
{
  "type": "dining",
  "meta": {
    "cuisine": "International",
    "priceRange": "$$",
    "rating": 4.6,
    "district": "Kreuzberg",
    "address": "Eisenbahnstraße 42/43, 10997 Berlin"
  }
}
```

#### Videos

```json
{
  "type": "video",
  "meta": {
    "duration": 482,
    "views": 12840,
    "series": "Secret Berlin"
  }
}
```

#### Competitions

```json
{
  "type": "competition",
  "meta": {
    "status": "active",
    "endsAt": "2026-03-31T23:59:59Z",
    "prizeValue": 890.00
  }
}
```

#### Classifieds

```json
{
  "type": "classified",
  "meta": {
    "price": 120.00,
    "condition": "good",
    "district": "Kreuzberg",
    "listingType": "for_sale"
  }
}
```

#### Products

```json
{
  "type": "product",
  "meta": {
    "price": 29.90,
    "compareAtPrice": null,
    "inStock": true,
    "category": "Apparel"
  }
}
```

---

### Empty Results

When no results match the query:

**Response: `200 OK`**

```json
{
  "data": {
    "query": "xyznonexistent",
    "hits": [],
    "facets": null,
    "processingTimeMs": 3
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

---

### Error Response: Missing Query

**Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Query parameter 'q' is required and must be between 1 and 200 characters",
  "error": "Bad Request"
}
```

---

## Autocomplete Suggestions

```
GET /api/v1/search/suggest
```

Returns autocomplete suggestions as the user types. Optimized for speed with a response target of under 50ms. Returns up to 8 suggestions grouped by content type.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | **Required.** Partial search query (minimum 2 characters) |
| `type` | string | — | Limit suggestions to specific types (comma-separated) |
| `limit` | integer | `8` | Maximum number of suggestions (max: 12) |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/search/suggest?q=kreuz"
```

**Response: `200 OK`**

```json
{
  "data": {
    "query": "kreuz",
    "suggestions": [
      {
        "text": "Kreuzberg",
        "type": "district",
        "url": null,
        "resultCount": 142
      },
      {
        "text": "Kreuzberg Food Festival 2026",
        "type": "event",
        "url": "/events/kreuzberg-food-festival-2026",
        "thumbnailUrl": "https://media.iloveberlin.biz/events/kreuzberg-food-fest-thumb.jpg",
        "resultCount": null
      },
      {
        "text": "Kreuzberg street art tour",
        "type": "query",
        "url": null,
        "resultCount": 15
      },
      {
        "text": "Kreuzberg restaurants",
        "type": "query",
        "url": null,
        "resultCount": 34
      },
      {
        "text": "Kreuzköllner Döner",
        "type": "dining",
        "url": "/dining/kreuzkoellner-doener",
        "thumbnailUrl": "https://media.iloveberlin.biz/dining/kreuzkoellner-thumb.jpg",
        "resultCount": null
      }
    ],
    "processingTimeMs": 8
  }
}
```

### Suggestion Types

| Type | Description |
|------|-------------|
| `query` | Suggested search query (popular searches matching the input) |
| `district` | Matching Berlin district name |
| `article` | Matching article title |
| `event` | Matching event title |
| `guide` | Matching guide title |
| `dining` | Matching restaurant/dining venue name |
| `video` | Matching video title |
| `product` | Matching product name |
| `classified` | Matching classified listing title |
| `competition` | Matching competition title |

---

### Minimum Characters

When the query is too short:

**Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Query must be at least 2 characters for suggestions",
  "error": "Bad Request"
}
```

---

## Search Indexing Details

The following table describes how each content type is indexed in Meilisearch, including searchable attributes and their relative weight.

| Content Type | Searchable Attributes (by priority) | Filterable Attributes |
|-------------|-------------------------------------|----------------------|
| Articles | title, body, tags, author, category | category, tags, publishedAt |
| Events | title, description, venue, tags, category | category, district, startDate, endDate, price |
| Guides | title, body, tags, topic | topic, tags, updatedAt |
| Dining | name, description, cuisine, tags, address | cuisine, district, priceRange, rating |
| Videos | title, description, tags, series, category | category, series, tags, publishedAt, duration |
| Competitions | title, description, prize, sponsor | status, endsAt, category |
| Classifieds | title, description, category | category, type, district, condition, price |
| Products | name, description, tags, category | category, tags, price, inStock |

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
| `400` | Bad Request | Missing or invalid query parameter, query too short for suggestions |
| `422` | Unprocessable Entity | Invalid type filter, invalid sort parameter |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | Meilisearch service temporarily unavailable |

---

## Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| `GET /search` | 60 requests | 1 minute |
| `GET /search/suggest` | 120 requests | 1 minute |

The suggest endpoint has a higher rate limit because it is called on every keystroke during autocomplete.

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
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

---

## Performance Notes

- **Search latency target:** < 100ms for full search, < 50ms for suggestions
- **Typo tolerance:** Meilisearch automatically handles up to 2 typos per word for words with 5+ characters, 1 typo for words with 3-4 characters
- **Highlighting:** Use `<em>` tags in `highlight` fields for rendering matched terms in the UI
- **Index freshness:** Content is indexed within 30 seconds of creation or update via async Meilisearch tasks
- **Stop words:** Common German and English stop words are excluded from indexing (der, die, das, the, a, an, etc.)
