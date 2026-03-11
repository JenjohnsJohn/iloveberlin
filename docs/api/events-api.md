# Events API

**Base Path:** `/api/v1/events`

Endpoints for managing events, venues, and event discovery on the ILoveBerlin platform. Supports date-based filtering, geolocation/map queries, and recurring event patterns.

---

## Table of Contents

- [Endpoints Overview](#endpoints-overview)
- [Public Endpoints](#public-endpoints)
  - [GET /events](#get-events)
  - [GET /events/:slug](#get-eventsslug)
  - [GET /events/today](#get-eventstoday)
  - [GET /events/weekend](#get-eventsweekend)
  - [GET /events/map](#get-eventsmap)
- [Editor Endpoints](#editor-endpoints)
  - [POST /events](#post-events)
  - [PATCH /events/:id](#patch-eventsid)
  - [DELETE /events/:id](#delete-eventsid)
- [Admin Endpoints](#admin-endpoints)
  - [PATCH /events/:id/moderate](#patch-eventsidmoderate)
  - [GET /venues](#get-venues)
  - [POST /venues](#post-venues)
  - [PATCH /venues/:id](#patch-venuesid)
- [User Endpoints](#user-endpoints)
  - [POST /events/:id/bookmark](#post-eventsidbookmark)
  - [DELETE /events/:id/bookmark](#delete-eventsidbookmark)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/events` | Public | List events with filters |
| `GET` | `/events/:slug` | Public | Get a single event |
| `GET` | `/events/today` | Public | List events happening today |
| `GET` | `/events/weekend` | Public | List events this weekend |
| `GET` | `/events/map` | Public | Get events with geolocation for map display |
| `POST` | `/events` | Editor | Create a new event |
| `PATCH` | `/events/:id` | Editor | Update an event |
| `DELETE` | `/events/:id` | Editor | Delete an event |
| `PATCH` | `/events/:id/moderate` | Admin | Approve, reject, or feature an event |
| `GET` | `/venues` | Admin | List all venues |
| `POST` | `/venues` | Admin | Create a new venue |
| `PATCH` | `/venues/:id` | Admin | Update a venue |
| `POST` | `/events/:id/bookmark` | User | Bookmark an event |
| `DELETE` | `/events/:id/bookmark` | User | Remove event bookmark |

---

## Public Endpoints

### GET /events

Retrieve a paginated list of upcoming published events. Extensive filtering is available for category, location, date range, price, and recurrence.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `startDate` | Sort field: `startDate`, `endDate`, `createdAt`, `title` |
| `order` | string | `asc` | Sort direction: `asc`, `desc` |
| `q` | string | -- | Full-text search across title and description |
| `category` | string | -- | Filter by category slug (comma-separated for multiple): `music`, `art`, `food`, `nightlife`, `culture`, `sports`, `family`, `tech`, `markets`, `community` |
| `district` | string | -- | Filter by Berlin district slug (comma-separated): `mitte`, `kreuzberg`, `neukoelln`, `friedrichshain`, `prenzlauer-berg`, `charlottenburg`, `schoeneberg`, `wedding`, `tempelhof`, `treptow`, `lichtenberg`, `spandau` |
| `startDate[gte]` | string | today | Events starting on or after (ISO 8601 date) |
| `startDate[lte]` | string | -- | Events starting on or before (ISO 8601 date) |
| `endDate[gte]` | string | -- | Events ending on or after (ISO 8601 date) |
| `endDate[lte]` | string | -- | Events ending on or before (ISO 8601 date) |
| `isFree` | boolean | -- | Filter for free events (`true`) or paid events (`false`) |
| `isRecurring` | boolean | -- | Filter for recurring events |
| `venueId` | integer | -- | Filter by venue ID |
| `featured` | boolean | -- | Filter featured events |

### Example Request

```
GET /api/v1/events?category=music,nightlife&district=kreuzberg,friedrichshain&isFree=false&startDate[gte]=2026-03-15&startDate[lte]=2026-03-31&sort=startDate&order=asc&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 312,
      "title": "Berlin Techno Night at Tresor",
      "slug": "berlin-techno-night-tresor-march-2026",
      "excerpt": "An all-night techno event featuring international DJs at one of Berlin's most iconic clubs.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/events/312/cover.jpg",
      "category": {
        "id": 4,
        "name": "Nightlife",
        "slug": "nightlife"
      },
      "venue": {
        "id": 18,
        "name": "Tresor",
        "slug": "tresor",
        "district": "mitte",
        "address": "Koepenicker Str. 70, 10179 Berlin"
      },
      "startDate": "2026-03-22T23:00:00.000Z",
      "endDate": "2026-03-23T08:00:00.000Z",
      "timezone": "Europe/Berlin",
      "isFree": false,
      "price": {
        "amount": 18.00,
        "currency": "EUR",
        "displayPrice": "18,00 EUR"
      },
      "isRecurring": false,
      "featured": true,
      "status": "published",
      "createdAt": "2026-03-01T10:00:00.000Z"
    },
    {
      "id": 318,
      "title": "Jazz at A-Trane",
      "slug": "jazz-a-trane-march-22-2026",
      "excerpt": "Live jazz in Charlottenburg's legendary A-Trane club.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/events/318/cover.jpg",
      "category": {
        "id": 1,
        "name": "Music",
        "slug": "music"
      },
      "venue": {
        "id": 42,
        "name": "A-Trane",
        "slug": "a-trane",
        "district": "charlottenburg",
        "address": "Bleibtreustr. 1, 10623 Berlin"
      },
      "startDate": "2026-03-22T21:00:00.000Z",
      "endDate": "2026-03-23T01:00:00.000Z",
      "timezone": "Europe/Berlin",
      "isFree": false,
      "price": {
        "amount": 25.00,
        "currency": "EUR",
        "displayPrice": "25,00 EUR"
      },
      "isRecurring": true,
      "recurrence": {
        "pattern": "weekly",
        "day": "saturday"
      },
      "featured": false,
      "status": "published",
      "createdAt": "2026-02-15T12:00:00.000Z"
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

---

### GET /events/:slug

Retrieve a single published event by its URL slug with full details.

**Authentication:** Public

### Request

```
GET /api/v1/events/berlin-techno-night-tresor-march-2026
```

### Response `200 OK`

```json
{
  "data": {
    "id": 312,
    "title": "Berlin Techno Night at Tresor",
    "slug": "berlin-techno-night-tresor-march-2026",
    "description": "<p>Join us for an unforgettable night of techno at Tresor, one of Berlin's most legendary clubs. Located in the vaults of a former department store, Tresor has been at the heart of Berlin's electronic music scene since 1991.</p><h3>Lineup</h3><ul><li>DJ Kobosil (Ostgut Ton)</li><li>VTSS (Possession)</li><li>Local support DJs</li></ul><h3>Door Policy</h3><p>Tresor has a selective door policy. Arrive before 1:00 AM for the best chance of entry. No photos inside the club.</p>",
    "descriptionFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/events/312/cover.jpg",
    "images": [
      {
        "url": "https://cdn.iloveberlin.biz/events/312/img-01.jpg",
        "alt": "Tresor club interior",
        "caption": "The iconic vault room at Tresor"
      }
    ],
    "category": {
      "id": 4,
      "name": "Nightlife",
      "slug": "nightlife"
    },
    "tags": [
      { "id": 101, "name": "Techno", "slug": "techno" },
      { "id": 102, "name": "Clubs", "slug": "clubs" }
    ],
    "venue": {
      "id": 18,
      "name": "Tresor",
      "slug": "tresor",
      "district": "mitte",
      "address": "Koepenicker Str. 70, 10179 Berlin",
      "latitude": 52.5112,
      "longitude": 13.4205,
      "website": "https://tresorberlin.com",
      "phone": "+49 30 62908730"
    },
    "startDate": "2026-03-22T23:00:00.000Z",
    "endDate": "2026-03-23T08:00:00.000Z",
    "timezone": "Europe/Berlin",
    "isFree": false,
    "price": {
      "amount": 18.00,
      "currency": "EUR",
      "displayPrice": "18,00 EUR"
    },
    "ticketUrl": "https://ra.co/events/berlin-techno-night-tresor",
    "isRecurring": false,
    "recurrence": null,
    "featured": true,
    "organizer": {
      "name": "Tresor Berlin",
      "email": "info@tresorberlin.com",
      "website": "https://tresorberlin.com"
    },
    "seo": {
      "metaTitle": "Berlin Techno Night at Tresor - March 22 | ILoveBerlin",
      "metaDescription": "All-night techno event at Tresor with DJ Kobosil and VTSS. March 22, 2026.",
      "canonicalUrl": "https://iloveberlin.biz/events/berlin-techno-night-tresor-march-2026"
    },
    "relatedEvents": [
      {
        "id": 320,
        "title": "Berghain Saturday Night",
        "slug": "berghain-saturday-march-22",
        "coverImageUrl": "https://cdn.iloveberlin.biz/events/320/cover.jpg",
        "startDate": "2026-03-22T23:59:00.000Z"
      }
    ],
    "status": "published",
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-03-10T14:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | `"Event not found"` | Slug does not match a published event |

---

### GET /events/today

Retrieve events happening today in Berlin. Shortcut for `GET /events` with today's date range filter pre-applied.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `category` | string | -- | Filter by category slug |
| `district` | string | -- | Filter by district slug |
| `isFree` | boolean | -- | Filter free/paid |

### Example Request

```
GET /api/v1/events/today?category=music&limit=5
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 330,
      "title": "Open Mic Night at Madame Claude",
      "slug": "open-mic-madame-claude-march-12",
      "excerpt": "Weekly open mic night in the upside-down bar of Neukoelln.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/events/330/cover.jpg",
      "category": {
        "id": 1,
        "name": "Music",
        "slug": "music"
      },
      "venue": {
        "id": 55,
        "name": "Madame Claude",
        "slug": "madame-claude",
        "district": "neukoelln",
        "address": "Luebbener Str. 19, 10997 Berlin"
      },
      "startDate": "2026-03-12T20:00:00.000Z",
      "endDate": "2026-03-12T23:30:00.000Z",
      "timezone": "Europe/Berlin",
      "isFree": true,
      "price": null,
      "isRecurring": true,
      "recurrence": {
        "pattern": "weekly",
        "day": "thursday"
      },
      "featured": false,
      "status": "published"
    }
  ],
  "meta": {
    "total": 23,
    "page": 1,
    "limit": 5,
    "totalPages": 5
  }
}
```

---

### GET /events/weekend

Retrieve events happening this coming weekend (Friday 18:00 through Sunday 23:59, Berlin time).

**Authentication:** Public

### Query Parameters

Same as `GET /events/today`.

### Example Request

```
GET /api/v1/events/weekend?category=art,culture&district=mitte&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 335,
      "title": "Gallery Weekend Berlin: Spring Edition",
      "slug": "gallery-weekend-berlin-spring-2026",
      "excerpt": "Over 50 galleries open their doors for a weekend of contemporary art exhibitions.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/events/335/cover.jpg",
      "category": {
        "id": 2,
        "name": "Art",
        "slug": "art"
      },
      "venue": {
        "id": 60,
        "name": "KW Institute for Contemporary Art",
        "slug": "kw-institute",
        "district": "mitte",
        "address": "Auguststr. 69, 10117 Berlin"
      },
      "startDate": "2026-03-13T18:00:00.000Z",
      "endDate": "2026-03-15T20:00:00.000Z",
      "timezone": "Europe/Berlin",
      "isFree": true,
      "price": null,
      "isRecurring": false,
      "featured": true,
      "status": "published"
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

---

### GET /events/map

Retrieve events with geolocation data for rendering on a map. Returns minimal event data with latitude/longitude coordinates. Supports bounding box queries.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `100` | Max items (max 500) |
| `category` | string | -- | Filter by category slug |
| `district` | string | -- | Filter by district slug |
| `startDate[gte]` | string | today | Events starting on or after |
| `startDate[lte]` | string | -- | Events starting on or before |
| `isFree` | boolean | -- | Filter free/paid |
| `bbox` | string | -- | Bounding box: `sw_lat,sw_lng,ne_lat,ne_lng` |

### Example Request

```
GET /api/v1/events/map?category=music&startDate[gte]=2026-03-12&startDate[lte]=2026-03-19&bbox=52.45,13.25,52.58,13.55
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 312,
      "title": "Berlin Techno Night at Tresor",
      "slug": "berlin-techno-night-tresor-march-2026",
      "category": "nightlife",
      "startDate": "2026-03-22T23:00:00.000Z",
      "isFree": false,
      "displayPrice": "18,00 EUR",
      "venue": {
        "id": 18,
        "name": "Tresor",
        "latitude": 52.5112,
        "longitude": 13.4205
      }
    },
    {
      "id": 330,
      "title": "Open Mic Night at Madame Claude",
      "slug": "open-mic-madame-claude-march-12",
      "category": "music",
      "startDate": "2026-03-12T20:00:00.000Z",
      "isFree": true,
      "displayPrice": null,
      "venue": {
        "id": 55,
        "name": "Madame Claude",
        "latitude": 52.4985,
        "longitude": 13.4380
      }
    },
    {
      "id": 318,
      "title": "Jazz at A-Trane",
      "slug": "jazz-a-trane-march-22-2026",
      "category": "music",
      "startDate": "2026-03-22T21:00:00.000Z",
      "isFree": false,
      "displayPrice": "25,00 EUR",
      "venue": {
        "id": 42,
        "name": "A-Trane",
        "latitude": 52.5055,
        "longitude": 13.3225
      }
    }
  ],
  "meta": {
    "total": 3,
    "bounds": {
      "sw": { "lat": 52.45, "lng": 13.25 },
      "ne": { "lat": 52.58, "lng": 13.55 }
    }
  }
}
```

---

## Editor Endpoints

### POST /events

Create a new event. New events are created with `pending` status and require admin approval before being published.

**Authentication:** Editor

### Request

```json
{
  "title": "Berlin Coffee Festival 2026",
  "description": "<p>The annual celebration of Berlin's thriving coffee scene. Sample beans from over 30 local roasters, attend barista workshops, and enjoy live music.</p><h3>Highlights</h3><ul><li>Cupping sessions with Five Elephant, Bonanza, and The Barn</li><li>Latte art championship</li><li>Sustainable coffee panel discussion</li></ul>",
  "descriptionFormat": "html",
  "coverImageUrl": "https://cdn.iloveberlin.biz/events/uploads/coffee-fest-cover.jpg",
  "categoryId": 3,
  "tagIds": [45, 67, 89],
  "venueId": 25,
  "startDate": "2026-04-18T10:00:00.000Z",
  "endDate": "2026-04-19T18:00:00.000Z",
  "timezone": "Europe/Berlin",
  "isFree": false,
  "price": {
    "amount": 12.00,
    "currency": "EUR"
  },
  "ticketUrl": "https://berlincoffeefestival.com/tickets",
  "isRecurring": false,
  "organizer": {
    "name": "Berlin Coffee Collective",
    "email": "hello@berlincoffeecollective.de",
    "website": "https://berlincoffeecollective.de"
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Min 5, max 200 chars |
| `description` | string | Yes | Min 50 chars, valid HTML or Markdown |
| `descriptionFormat` | string | No | `html` (default) or `markdown` |
| `coverImageUrl` | string | No | Valid URL |
| `categoryId` | integer | Yes | Must reference existing event category |
| `tagIds` | integer[] | No | Array of existing tag IDs, max 10 |
| `venueId` | integer | Yes | Must reference existing venue |
| `startDate` | string | Yes | ISO 8601 datetime, must be in the future |
| `endDate` | string | Yes | ISO 8601 datetime, must be after `startDate` |
| `timezone` | string | No | IANA timezone (default: `Europe/Berlin`) |
| `isFree` | boolean | Yes | Whether the event is free |
| `price` | object | Conditional | Required if `isFree` is `false` |
| `price.amount` | number | Conditional | Positive number |
| `price.currency` | string | No | ISO 4217 code (default: `EUR`) |
| `ticketUrl` | string | No | Valid URL for ticket purchase |
| `isRecurring` | boolean | No | Default: `false` |
| `recurrence` | object | Conditional | Required if `isRecurring` is `true` |
| `recurrence.pattern` | string | Conditional | `daily`, `weekly`, `biweekly`, `monthly` |
| `recurrence.day` | string | Conditional | Day of the week (for weekly/biweekly) |
| `recurrence.endDate` | string | No | When the recurrence ends (ISO 8601 date) |
| `organizer` | object | No | Event organizer details |
| `organizer.name` | string | No | Max 100 chars |
| `organizer.email` | string | No | Valid email |
| `organizer.website` | string | No | Valid URL |

### Response `201 Created`

```json
{
  "data": {
    "id": 350,
    "title": "Berlin Coffee Festival 2026",
    "slug": "berlin-coffee-festival-2026",
    "description": "<p>The annual celebration of Berlin's thriving coffee scene...</p>",
    "descriptionFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/events/uploads/coffee-fest-cover.jpg",
    "category": {
      "id": 3,
      "name": "Food & Drink",
      "slug": "food"
    },
    "tags": [
      { "id": 45, "name": "Coffee", "slug": "coffee" },
      { "id": 67, "name": "Street Food", "slug": "street-food" },
      { "id": 89, "name": "Festival", "slug": "festival" }
    ],
    "venue": {
      "id": 25,
      "name": "Arena Berlin",
      "slug": "arena-berlin",
      "district": "treptow",
      "address": "Eichenstr. 4, 12435 Berlin"
    },
    "startDate": "2026-04-18T10:00:00.000Z",
    "endDate": "2026-04-19T18:00:00.000Z",
    "timezone": "Europe/Berlin",
    "isFree": false,
    "price": {
      "amount": 12.00,
      "currency": "EUR",
      "displayPrice": "12,00 EUR"
    },
    "ticketUrl": "https://berlincoffeefestival.com/tickets",
    "isRecurring": false,
    "recurrence": null,
    "featured": false,
    "status": "pending",
    "organizer": {
      "name": "Berlin Coffee Collective",
      "email": "hello@berlincoffeecollective.de",
      "website": "https://berlincoffeecollective.de"
    },
    "createdBy": {
      "id": 1042,
      "displayName": "Anna S."
    },
    "createdAt": "2026-03-12T16:00:00.000Z",
    "updatedAt": "2026-03-12T16:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing or invalid fields |
| `400` | `"endDate must be after startDate"` | Invalid date range |
| `400` | `"startDate must be in the future"` | Past date |
| `400` | `"price is required when isFree is false"` | Missing price for paid event |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an editor |
| `404` | `"Venue not found"` | Invalid venueId |
| `409` | `"An event with this slug already exists"` | Duplicate slug |

---

### PATCH /events/:id

Update an existing event. Only the event's creator or an admin can update it.

**Authentication:** Editor (own events) or Admin (any event)

### Request

```json
{
  "title": "Berlin Coffee Festival 2026 - Extended Edition",
  "endDate": "2026-04-20T18:00:00.000Z",
  "price": {
    "amount": 15.00,
    "currency": "EUR"
  }
}
```

All fields from `POST /events` are accepted; all are optional.

### Response `200 OK`

Returns the full updated event object (same structure as `POST /events` response).

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid field values |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only edit your own events"` | Editor editing another's event |
| `404` | `"Event not found"` | No event with that ID |

---

### DELETE /events/:id

Soft-delete an event.

**Authentication:** Editor (own events) or Admin (any event)

### Request

```
DELETE /api/v1/events/350
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response `204 No Content`

No response body.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only delete your own events"` | Editor deleting another's event |
| `404` | `"Event not found"` | No event with that ID |

---

## Admin Endpoints

### PATCH /events/:id/moderate

Approve, reject, or feature an event. Events in `pending` status are not visible publicly until approved.

**Authentication:** Admin

### Request (Approve)

```json
{
  "action": "approve",
  "featured": true
}
```

### Request (Reject)

```json
{
  "action": "reject",
  "reason": "Duplicate event listing. This event is already listed under a different name."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `action` | string | Yes | `approve`, `reject`, `feature`, `unfeature` |
| `reason` | string | Conditional | Required when rejecting; min 10, max 500 chars |
| `featured` | boolean | No | Set featured status when approving |

### Response `200 OK` (Approve)

```json
{
  "data": {
    "id": 350,
    "title": "Berlin Coffee Festival 2026",
    "slug": "berlin-coffee-festival-2026",
    "status": "published",
    "previousStatus": "pending",
    "featured": true,
    "moderatedBy": {
      "id": 5,
      "displayName": "Admin User"
    },
    "moderatedAt": "2026-03-12T17:00:00.000Z"
  },
  "message": "Event approved and published"
}
```

### Response `200 OK` (Reject)

```json
{
  "data": {
    "id": 350,
    "title": "Berlin Coffee Festival 2026",
    "slug": "berlin-coffee-festival-2026",
    "status": "rejected",
    "previousStatus": "pending",
    "rejectionReason": "Duplicate event listing. This event is already listed under a different name.",
    "moderatedBy": {
      "id": 5,
      "displayName": "Admin User"
    },
    "moderatedAt": "2026-03-12T17:00:00.000Z"
  },
  "message": "Event rejected"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"reason is required when rejecting an event"` | Missing rejection reason |
| `400` | `"Event is not in pending status"` | Cannot moderate already-published event |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `404` | `"Event not found"` | No event with that ID |

---

### GET /venues

List all venues with optional search and filtering.

**Authentication:** Admin

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `name` | Sort field: `name`, `createdAt`, `district` |
| `order` | string | `asc` | Sort direction: `asc`, `desc` |
| `q` | string | -- | Search by venue name or address |
| `district` | string | -- | Filter by district slug |

### Example Request

```
GET /api/v1/venues?district=kreuzberg&sort=name&order=asc&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 55,
      "name": "Madame Claude",
      "slug": "madame-claude",
      "district": "neukoelln",
      "address": "Luebbener Str. 19, 10997 Berlin",
      "latitude": 52.4985,
      "longitude": 13.4380,
      "website": "https://madameclaude.de",
      "phone": "+49 30 69818359",
      "capacity": 100,
      "eventsCount": 52,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T09:00:00.000Z"
    },
    {
      "id": 18,
      "name": "Tresor",
      "slug": "tresor",
      "district": "mitte",
      "address": "Koepenicker Str. 70, 10179 Berlin",
      "latitude": 52.5112,
      "longitude": 13.4205,
      "website": "https://tresorberlin.com",
      "phone": "+49 30 62908730",
      "capacity": 1500,
      "eventsCount": 128,
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2026-02-20T14:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### POST /venues

Create a new venue.

**Authentication:** Admin

### Request

```json
{
  "name": "Holzmarkt 25",
  "address": "Holzmarktstr. 25, 10243 Berlin",
  "district": "friedrichshain",
  "latitude": 52.5098,
  "longitude": 13.4270,
  "website": "https://holzmarkt.com",
  "phone": "+49 30 12345678",
  "capacity": 2000,
  "description": "A creative village on the banks of the Spree, hosting concerts, markets, and cultural events."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Min 2, max 150 chars |
| `address` | string | Yes | Min 5, max 300 chars |
| `district` | string | Yes | Valid Berlin district slug |
| `latitude` | number | Yes | Valid latitude (-90 to 90) |
| `longitude` | number | Yes | Valid longitude (-180 to 180) |
| `website` | string | No | Valid URL |
| `phone` | string | No | Valid phone number format |
| `capacity` | integer | No | Positive integer |
| `description` | string | No | Max 500 chars |

### Response `201 Created`

```json
{
  "data": {
    "id": 72,
    "name": "Holzmarkt 25",
    "slug": "holzmarkt-25",
    "address": "Holzmarktstr. 25, 10243 Berlin",
    "district": "friedrichshain",
    "latitude": 52.5098,
    "longitude": 13.4270,
    "website": "https://holzmarkt.com",
    "phone": "+49 30 12345678",
    "capacity": 2000,
    "description": "A creative village on the banks of the Spree, hosting concerts, markets, and cultural events.",
    "eventsCount": 0,
    "createdAt": "2026-03-12T17:00:00.000Z",
    "updatedAt": "2026-03-12T17:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing or invalid fields |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `409` | `"A venue with this name already exists"` | Duplicate venue name |

---

### PATCH /venues/:id

Update an existing venue. Only provided fields are updated.

**Authentication:** Admin

### Request

```json
{
  "capacity": 2500,
  "description": "A creative village on the Spree with concert venues, restaurants, and co-working spaces."
}
```

All fields from `POST /venues` are accepted; all are optional.

### Response `200 OK`

Returns the full updated venue object (same structure as `POST /venues` response).

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid field values |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an admin |
| `404` | `"Venue not found"` | No venue with that ID |

---

## User Endpoints

### POST /events/:id/bookmark

Bookmark an event for the authenticated user.

**Authentication:** User

### Request

```
POST /api/v1/events/312/bookmark
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

No request body required.

### Response `201 Created`

```json
{
  "message": "Event bookmarked successfully",
  "data": {
    "eventId": 312,
    "bookmarkedAt": "2026-03-12T17:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `404` | `"Event not found"` | No published event with that ID |
| `409` | `"Event is already bookmarked"` | Duplicate bookmark |

---

### DELETE /events/:id/bookmark

Remove a bookmark from an event.

**Authentication:** User

### Request

```
DELETE /api/v1/events/312/bookmark
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
| `404` | `"Bookmark not found"` | Event was not bookmarked |

---

## Error Codes

| Status Code | Error | Common Cause |
|-------------|-------|--------------|
| `400` | Bad Request | Validation failure, invalid date ranges, missing required fields |
| `401` | Unauthorized | Missing or invalid access token |
| `403` | Forbidden | Insufficient role or editing another user's event |
| `404` | Not Found | Event, venue, or related resource does not exist |
| `409` | Conflict | Duplicate slug, duplicate bookmark, or duplicate venue |
| `422` | Unprocessable Entity | Semantically invalid data (e.g., end date before start date) |
| `429` | Too Many Requests | Rate limit exceeded |

---

## Rate Limiting

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `GET /events` | 60 requests | 1 minute | Public tier |
| `GET /events/:slug` | 60 requests | 1 minute | Public tier |
| `GET /events/today` | 60 requests | 1 minute | Public tier |
| `GET /events/weekend` | 60 requests | 1 minute | Public tier |
| `GET /events/map` | 30 requests | 1 minute | Search tier (heavier query) |
| `POST /events` | 30 requests | 1 minute | Write tier |
| `PATCH /events/:id` | 30 requests | 1 minute | Write tier |
| `DELETE /events/:id` | 30 requests | 1 minute | Write tier |
| `PATCH /events/:id/moderate` | 30 requests | 1 minute | Admin write tier |
| `GET /venues` | 60 requests | 1 minute | Admin read |
| `POST /venues` | 15 requests | 1 minute | Admin write tier |
| `PATCH /venues/:id` | 15 requests | 1 minute | Admin write tier |
| `POST /events/:id/bookmark` | 30 requests | 1 minute | Write tier |
| `DELETE /events/:id/bookmark` | 30 requests | 1 minute | Write tier |
