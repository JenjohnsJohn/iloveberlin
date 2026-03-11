# Competitions API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Competitions API manages giveaways, sweepstakes, and promotional competitions on the ILoveBerlin platform. Competitions have defined entry periods, entry requirements, and prize details. Registered users can enter active competitions, and admins can manage competitions and select winners.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/competitions` | public | List active competitions |
| `GET` | `/competitions/:slug` | public | Get competition details |
| `GET` | `/competitions/archive` | public | List past competitions |
| `POST` | `/competitions/:id/enter` | user | Enter a competition |
| `GET` | `/competitions/my-entries` | user | List user's competition entries |
| `POST` | `/competitions` | admin | Create a new competition |
| `PATCH` | `/competitions/:id` | admin | Update a competition |
| `POST` | `/competitions/:id/select-winner` | admin | Select competition winner(s) |
| `GET` | `/competitions/:id/entries` | admin | List all entries for a competition |

---

## Public Endpoints

### List Active Competitions

```
GET /api/v1/competitions
```

Returns a paginated list of currently active (open for entry) competitions.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `sort` | string | `endsAt:asc` | Sort field. Options: `endsAt:asc`, `endsAt:desc`, `createdAt:desc`, `prizeValue:desc` |
| `category` | string | — | Filter by category slug |
| `status` | string | `active` | Filter by status: `active`, `upcoming`, `all` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/competitions?limit=10&sort=endsAt:asc"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "comp_a1b2c3",
      "title": "Win a Weekend at Hotel Adlon Kempinski",
      "slug": "win-weekend-hotel-adlon-kempinski",
      "description": "Enter for a chance to win a luxury weekend stay at one of Berlin's most iconic hotels, including breakfast and spa access.",
      "thumbnailUrl": "https://media.iloveberlin.biz/competitions/hotel-adlon-weekend.jpg",
      "prize": {
        "name": "Luxury Weekend Stay",
        "description": "2-night stay in a Superior Room including breakfast buffet and spa access for two",
        "value": 890.00,
        "currency": "EUR"
      },
      "sponsor": {
        "name": "Hotel Adlon Kempinski",
        "logoUrl": "https://media.iloveberlin.biz/sponsors/adlon-logo.png",
        "url": "https://www.kempinski.com/berlin"
      },
      "entryCount": 1243,
      "maxEntries": null,
      "startsAt": "2026-03-01T00:00:00Z",
      "endsAt": "2026-03-31T23:59:59Z",
      "status": "active",
      "createdAt": "2026-02-25T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

---

### Get Competition Details

```
GET /api/v1/competitions/:slug
```

Returns full details for a single competition.

**Authentication:** None (public). If the user is authenticated, the response includes their entry status.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The competition URL slug |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/competitions/win-weekend-hotel-adlon-kempinski" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "comp_a1b2c3",
    "title": "Win a Weekend at Hotel Adlon Kempinski",
    "slug": "win-weekend-hotel-adlon-kempinski",
    "description": "Enter for a chance to win a luxury weekend stay at one of Berlin's most iconic hotels, including breakfast and spa access.",
    "body": "## About this Competition\n\nThe **Hotel Adlon Kempinski** is offering one lucky ILoveBerlin reader the chance to experience a luxury weekend in the heart of Berlin...\n\n### Prize Includes\n- 2-night stay in a Superior Room\n- Daily breakfast buffet for two\n- Full spa access\n- Welcome bottle of champagne",
    "thumbnailUrl": "https://media.iloveberlin.biz/competitions/hotel-adlon-weekend.jpg",
    "heroImageUrl": "https://media.iloveberlin.biz/competitions/hotel-adlon-hero.jpg",
    "prize": {
      "name": "Luxury Weekend Stay",
      "description": "2-night stay in a Superior Room including breakfast buffet and spa access for two",
      "value": 890.00,
      "currency": "EUR"
    },
    "sponsor": {
      "name": "Hotel Adlon Kempinski",
      "logoUrl": "https://media.iloveberlin.biz/sponsors/adlon-logo.png",
      "url": "https://www.kempinski.com/berlin"
    },
    "entryRequirements": {
      "minAge": 18,
      "requiresAnswer": true,
      "question": "What year was the original Hotel Adlon first opened?",
      "answerType": "text",
      "requiresNewsletter": false
    },
    "termsUrl": "https://iloveberlin.biz/competitions/win-weekend-hotel-adlon-kempinski/terms",
    "entryCount": 1243,
    "maxEntries": null,
    "startsAt": "2026-03-01T00:00:00Z",
    "endsAt": "2026-03-31T23:59:59Z",
    "winnerAnnouncedAt": null,
    "status": "active",
    "userEntry": {
      "entered": true,
      "entryId": "entry_x1y2z3",
      "enteredAt": "2026-03-05T14:22:00Z"
    },
    "createdAt": "2026-02-25T10:00:00Z",
    "updatedAt": "2026-02-28T15:00:00Z"
  }
}
```

> **Note:** The `userEntry` field is only included when the request includes a valid authentication token. For unauthenticated requests, this field is omitted.

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Competition not found",
  "error": "Not Found"
}
```

---

### List Archived Competitions

```
GET /api/v1/competitions/archive
```

Returns a paginated list of past competitions that have ended.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `sort` | string | `endsAt:desc` | Sort field. Options: `endsAt:asc`, `endsAt:desc` |
| `year` | integer | — | Filter by year (e.g., `2025`) |
| `month` | integer | — | Filter by month (1-12), requires `year` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/competitions/archive?year=2025&limit=10"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "comp_d4e5f6",
      "title": "Christmas Market VIP Experience",
      "slug": "christmas-market-vip-experience",
      "description": "Win a private guided tour of Berlin's best Christmas markets with mulled wine and treats.",
      "thumbnailUrl": "https://media.iloveberlin.biz/competitions/christmas-market-vip.jpg",
      "prize": {
        "name": "VIP Christmas Market Tour",
        "value": 250.00,
        "currency": "EUR"
      },
      "entryCount": 3421,
      "startsAt": "2025-11-15T00:00:00Z",
      "endsAt": "2025-12-15T23:59:59Z",
      "status": "closed",
      "winner": {
        "firstName": "Marco",
        "lastInitial": "B.",
        "avatarUrl": "https://media.iloveberlin.biz/avatars/default.jpg"
      },
      "winnerAnnouncedAt": "2025-12-18T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 24,
    "totalPages": 3
  }
}
```

---

## User Endpoints

### Enter a Competition

```
POST /api/v1/competitions/:id/enter
```

Submits an entry for a competition. Each user can enter a competition only once.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The competition ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `answer` | string | conditional | Required if the competition has `requiresAnswer: true` |
| `agreeToTerms` | boolean | yes | Must be `true` to accept competition terms |
| `subscribeNewsletter` | boolean | no | Opt-in to newsletter (default: `false`) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/competitions/comp_a1b2c3/enter" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "1907",
    "agreeToTerms": true,
    "subscribeNewsletter": false
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "entryId": "entry_a1b2c3",
    "competitionId": "comp_a1b2c3",
    "competitionTitle": "Win a Weekend at Hotel Adlon Kempinski",
    "answer": "1907",
    "status": "confirmed",
    "enteredAt": "2026-03-12T14:30:00Z"
  }
}
```

**Error Response: `409 Conflict`**

```json
{
  "statusCode": 409,
  "message": "You have already entered this competition",
  "error": "Conflict"
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "This competition is no longer accepting entries",
  "error": "Bad Request"
}
```

**Error Response: `422 Unprocessable Entity`**

```json
{
  "statusCode": 422,
  "message": "You must agree to the competition terms to enter",
  "error": "Unprocessable Entity"
}
```

---

### List My Entries

```
GET /api/v1/competitions/my-entries
```

Returns a paginated list of competitions the authenticated user has entered.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `status` | string | — | Filter by competition status: `active`, `closed`, `won` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/competitions/my-entries?status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "entryId": "entry_a1b2c3",
      "competition": {
        "id": "comp_a1b2c3",
        "title": "Win a Weekend at Hotel Adlon Kempinski",
        "slug": "win-weekend-hotel-adlon-kempinski",
        "thumbnailUrl": "https://media.iloveberlin.biz/competitions/hotel-adlon-weekend.jpg",
        "endsAt": "2026-03-31T23:59:59Z",
        "status": "active"
      },
      "answer": "1907",
      "isWinner": false,
      "enteredAt": "2026-03-05T14:22:00Z"
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

## Admin Endpoints

### Create Competition

```
POST /api/v1/competitions
```

Creates a new competition.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Competition title (5-200 characters) |
| `description` | string | yes | Short description (10-500 characters) |
| `body` | string | yes | Full competition details (Markdown) |
| `thumbnailMediaId` | string | yes | Media ID for the thumbnail image |
| `heroImageMediaId` | string | no | Media ID for the hero image |
| `prize` | object | yes | Prize details |
| `prize.name` | string | yes | Prize name |
| `prize.description` | string | yes | Prize description |
| `prize.value` | number | yes | Prize monetary value |
| `prize.currency` | string | no | Currency code (default: `EUR`) |
| `sponsor` | object | no | Sponsor details |
| `sponsor.name` | string | yes | Sponsor name |
| `sponsor.logoMediaId` | string | no | Media ID for sponsor logo |
| `sponsor.url` | string | no | Sponsor website URL |
| `entryRequirements` | object | no | Entry requirements |
| `entryRequirements.minAge` | integer | no | Minimum age requirement |
| `entryRequirements.requiresAnswer` | boolean | no | Whether an answer is required |
| `entryRequirements.question` | string | conditional | Required if `requiresAnswer` is `true` |
| `entryRequirements.answerType` | string | no | `text`, `multiple_choice` |
| `entryRequirements.options` | string[] | conditional | Choices for `multiple_choice` type |
| `entryRequirements.requiresNewsletter` | boolean | no | Require newsletter opt-in |
| `maxEntries` | integer | no | Maximum number of entries allowed (null = unlimited) |
| `startsAt` | string | yes | ISO 8601 start date |
| `endsAt` | string | yes | ISO 8601 end date |
| `termsText` | string | no | Competition terms and conditions (Markdown) |
| `categoryId` | string | no | Category ID |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/competitions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Win Tickets to Berlin Festival of Lights",
    "description": "Enter to win a pair of VIP tickets to the 2026 Berlin Festival of Lights.",
    "body": "## Berlin Festival of Lights 2026\n\nExperience the magic of Berlin illuminated...",
    "thumbnailMediaId": "med_f1g2h3",
    "prize": {
      "name": "2x VIP Festival Tickets",
      "description": "Two VIP tickets including guided bus tour and backstage access",
      "value": 150.00,
      "currency": "EUR"
    },
    "sponsor": {
      "name": "Berlin Festival of Lights",
      "url": "https://festival-of-lights.de"
    },
    "entryRequirements": {
      "minAge": 16,
      "requiresAnswer": true,
      "question": "Which Berlin landmark is your favorite when illuminated?",
      "answerType": "text"
    },
    "startsAt": "2026-09-01T00:00:00Z",
    "endsAt": "2026-09-25T23:59:59Z"
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "comp_g7h8i9",
    "title": "Win Tickets to Berlin Festival of Lights",
    "slug": "win-tickets-berlin-festival-of-lights",
    "description": "Enter to win a pair of VIP tickets to the 2026 Berlin Festival of Lights.",
    "body": "## Berlin Festival of Lights 2026\n\nExperience the magic of Berlin illuminated...",
    "thumbnailUrl": "https://media.iloveberlin.biz/competitions/festival-of-lights.jpg",
    "prize": {
      "name": "2x VIP Festival Tickets",
      "description": "Two VIP tickets including guided bus tour and backstage access",
      "value": 150.00,
      "currency": "EUR"
    },
    "sponsor": {
      "name": "Berlin Festival of Lights",
      "url": "https://festival-of-lights.de"
    },
    "entryRequirements": {
      "minAge": 16,
      "requiresAnswer": true,
      "question": "Which Berlin landmark is your favorite when illuminated?",
      "answerType": "text"
    },
    "entryCount": 0,
    "maxEntries": null,
    "startsAt": "2026-09-01T00:00:00Z",
    "endsAt": "2026-09-25T23:59:59Z",
    "status": "upcoming",
    "createdAt": "2026-03-12T15:00:00Z",
    "updatedAt": "2026-03-12T15:00:00Z"
  }
}
```

---

### Update Competition

```
PATCH /api/v1/competitions/:id
```

Updates an existing competition. Cannot modify `startsAt` or `endsAt` for competitions that have already started unless the new dates expand the range.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The competition ID |

**Request Body:** Any subset of the fields from the create endpoint.

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/competitions/comp_g7h8i9" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "endsAt": "2026-09-28T23:59:59Z",
    "maxEntries": 5000
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "comp_g7h8i9",
    "title": "Win Tickets to Berlin Festival of Lights",
    "slug": "win-tickets-berlin-festival-of-lights",
    "endsAt": "2026-09-28T23:59:59Z",
    "maxEntries": 5000,
    "updatedAt": "2026-03-12T15:30:00Z"
  }
}
```

---

### Select Winner

```
POST /api/v1/competitions/:id/select-winner
```

Selects one or more winners from competition entries. Can be done randomly or by specifying entry IDs. Only works for competitions that have ended.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The competition ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | string | yes | `random` or `manual` |
| `winnerCount` | integer | no | Number of winners to select (default: `1`, max: `10`). Used with `random` |
| `entryIds` | string[] | conditional | Required if `method` is `manual`. Array of winning entry IDs |
| `notifyWinners` | boolean | no | Send email notification to winners (default: `true`) |
| `announcePublicly` | boolean | no | Display winner names publicly (default: `true`) |

**Request Example (random):**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/competitions/comp_a1b2c3/select-winner" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "method": "random",
    "winnerCount": 1,
    "notifyWinners": true,
    "announcePublicly": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "competitionId": "comp_a1b2c3",
    "competitionTitle": "Win a Weekend at Hotel Adlon Kempinski",
    "winners": [
      {
        "entryId": "entry_w1x2y3",
        "user": {
          "id": "usr_p1q2r3",
          "firstName": "Sofia",
          "lastInitial": "K.",
          "email": "sofia.k***@example.com"
        },
        "answer": "1907",
        "selectedAt": "2026-04-01T10:00:00Z",
        "notified": true
      }
    ],
    "method": "random",
    "totalEntries": 1243,
    "winnerAnnouncedAt": "2026-04-01T10:00:00Z"
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Cannot select winners: competition has not ended yet",
  "error": "Bad Request"
}
```

---

### List Competition Entries

```
GET /api/v1/competitions/:id/entries
```

Returns a paginated list of all entries for a competition.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The competition ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `50` | Items per page (max: 100) |
| `sort` | string | `enteredAt:desc` | Sort field. Options: `enteredAt:asc`, `enteredAt:desc` |
| `isWinner` | boolean | — | Filter by winner status |
| `search` | string | — | Search entries by user name or email |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/competitions/comp_a1b2c3/entries?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "entryId": "entry_w1x2y3",
      "user": {
        "id": "usr_p1q2r3",
        "firstName": "Sofia",
        "lastName": "Klein",
        "email": "sofia.klein@example.com"
      },
      "answer": "1907",
      "isWinner": true,
      "enteredAt": "2026-03-02T08:15:00Z"
    },
    {
      "entryId": "entry_a1b2c3",
      "user": {
        "id": "usr_s1t2u3",
        "firstName": "Thomas",
        "lastName": "Weber",
        "email": "thomas.weber@example.com"
      },
      "answer": "1907",
      "isWinner": false,
      "enteredAt": "2026-03-05T14:22:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 1243,
    "totalPages": 63
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
| `400` | Bad Request | Invalid input, competition not accepting entries, or competition hasn't ended (for winner selection) |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions for the requested action |
| `404` | Not Found | Competition or entry not found |
| `409` | Conflict | User has already entered this competition |
| `422` | Unprocessable Entity | Must agree to terms, or answer required but not provided |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Endpoint Group | Rate Limit | Window |
|----------------|-----------|--------|
| `GET /competitions`, `GET /competitions/archive` | 120 requests | 1 minute |
| `GET /competitions/:slug` | 60 requests | 1 minute |
| `POST /competitions/:id/enter` | 5 requests | 1 minute |
| `GET /competitions/my-entries` | 30 requests | 1 minute |
| Admin endpoints | 30 requests | 1 minute |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
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
