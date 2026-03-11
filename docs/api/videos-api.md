# Videos API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Videos API manages video content on the ILoveBerlin platform, including individual videos and video series. Videos can be organized into series for sequential or thematic viewing. Editors create and manage individual video content, while admins manage series-level organization. Video files are stored on Cloudflare R2 with streaming via signed URLs.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/videos` | public | List all published videos |
| `GET` | `/videos/:slug` | public | Get a single video by slug |
| `GET` | `/videos/series` | public | List all video series |
| `GET` | `/videos/series/:slug` | public | Get a video series with its videos |
| `POST` | `/videos` | editor | Create a new video |
| `PATCH` | `/videos/:id` | editor | Update a video |
| `DELETE` | `/videos/:id` | editor | Delete a video |
| `POST` | `/video-series` | admin | Create a new video series |
| `PATCH` | `/video-series/:id` | admin | Update a video series |

---

## Public Endpoints

### List Videos

```
GET /api/v1/videos
```

Returns a paginated list of published videos.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `sort` | string | `publishedAt:desc` | Sort field and direction. Options: `publishedAt:asc`, `publishedAt:desc`, `title:asc`, `title:desc`, `views:desc` |
| `series` | string | — | Filter by series slug |
| `category` | string | — | Filter by category slug |
| `tag` | string | — | Filter by tag slug (comma-separated for multiple) |
| `duration` | string | — | Filter by duration range: `short` (<5min), `medium` (5-20min), `long` (>20min) |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/videos?page=1&limit=10&category=culture&sort=publishedAt:desc"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "vid_a1b2c3d4",
      "title": "Hidden Courtyards of Kreuzberg",
      "slug": "hidden-courtyards-kreuzberg",
      "description": "Explore the secret Hinterhöfe that most tourists never see in Berlin's vibrant Kreuzberg district.",
      "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/hidden-courtyards-kreuzberg.jpg",
      "duration": 482,
      "views": 12840,
      "category": {
        "id": "cat_x1y2z3",
        "name": "Culture",
        "slug": "culture"
      },
      "series": {
        "id": "ser_m1n2o3",
        "title": "Secret Berlin",
        "slug": "secret-berlin"
      },
      "tags": [
        { "id": "tag_001", "name": "Kreuzberg", "slug": "kreuzberg" },
        { "id": "tag_002", "name": "Architecture", "slug": "architecture" }
      ],
      "author": {
        "id": "usr_e1f2g3",
        "firstName": "Lena",
        "lastName": "Müller",
        "avatarUrl": "https://media.iloveberlin.biz/avatars/lena-mueller.jpg"
      },
      "publishedAt": "2026-03-10T14:30:00Z",
      "createdAt": "2026-03-08T09:15:00Z",
      "updatedAt": "2026-03-10T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 87,
    "totalPages": 9
  }
}
```

---

### Get Video by Slug

```
GET /api/v1/videos/:slug
```

Returns full details for a single video, including the streaming URL.

**Authentication:** None (public)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The video's URL slug |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/videos/hidden-courtyards-kreuzberg"
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "vid_a1b2c3d4",
    "title": "Hidden Courtyards of Kreuzberg",
    "slug": "hidden-courtyards-kreuzberg",
    "description": "Explore the secret Hinterhöfe that most tourists never see in Berlin's vibrant Kreuzberg district.",
    "body": "In this episode we visit five stunning courtyards in Kreuzberg, from the famous Kunstquartier Bethanien to lesser-known gems tucked away on side streets...",
    "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/hidden-courtyards-kreuzberg.jpg",
    "videoUrl": "https://media.iloveberlin.biz/videos/stream/hidden-courtyards-kreuzberg.m3u8",
    "duration": 482,
    "views": 12840,
    "category": {
      "id": "cat_x1y2z3",
      "name": "Culture",
      "slug": "culture"
    },
    "series": {
      "id": "ser_m1n2o3",
      "title": "Secret Berlin",
      "slug": "secret-berlin",
      "episodeNumber": 3
    },
    "tags": [
      { "id": "tag_001", "name": "Kreuzberg", "slug": "kreuzberg" },
      { "id": "tag_002", "name": "Architecture", "slug": "architecture" }
    ],
    "author": {
      "id": "usr_e1f2g3",
      "firstName": "Lena",
      "lastName": "Müller",
      "avatarUrl": "https://media.iloveberlin.biz/avatars/lena-mueller.jpg"
    },
    "relatedVideos": [
      {
        "id": "vid_e5f6g7",
        "title": "Street Art Tour: Friedrichshain",
        "slug": "street-art-tour-friedrichshain",
        "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/street-art-friedrichshain.jpg",
        "duration": 610,
        "views": 9200
      }
    ],
    "publishedAt": "2026-03-10T14:30:00Z",
    "createdAt": "2026-03-08T09:15:00Z",
    "updatedAt": "2026-03-10T14:30:00Z"
  }
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Video not found",
  "error": "Not Found"
}
```

---

### List Video Series

```
GET /api/v1/videos/series
```

Returns a paginated list of all video series.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `sort` | string | `createdAt:desc` | Sort field and direction. Options: `createdAt:asc`, `createdAt:desc`, `title:asc`, `title:desc` |
| `category` | string | — | Filter by category slug |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/videos/series?limit=5"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "ser_m1n2o3",
      "title": "Secret Berlin",
      "slug": "secret-berlin",
      "description": "Discover the hidden corners of Berlin that locals love.",
      "thumbnailUrl": "https://media.iloveberlin.biz/series/thumbs/secret-berlin.jpg",
      "videoCount": 8,
      "category": {
        "id": "cat_x1y2z3",
        "name": "Culture",
        "slug": "culture"
      },
      "latestVideoAt": "2026-03-10T14:30:00Z",
      "createdAt": "2025-11-01T10:00:00Z",
      "updatedAt": "2026-03-10T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "totalItems": 12,
    "totalPages": 3
  }
}
```

---

### Get Video Series by Slug

```
GET /api/v1/videos/series/:slug
```

Returns a video series with all its videos ordered by episode number.

**Authentication:** None (public)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The series URL slug |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page for the videos within the series |
| `limit` | integer | `50` | Videos per page (max: 100) |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/videos/series/secret-berlin"
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "ser_m1n2o3",
    "title": "Secret Berlin",
    "slug": "secret-berlin",
    "description": "Discover the hidden corners of Berlin that locals love.",
    "thumbnailUrl": "https://media.iloveberlin.biz/series/thumbs/secret-berlin.jpg",
    "category": {
      "id": "cat_x1y2z3",
      "name": "Culture",
      "slug": "culture"
    },
    "videos": [
      {
        "id": "vid_z9y8x7",
        "title": "The Abandoned Listening Station at Teufelsberg",
        "slug": "teufelsberg-listening-station",
        "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/teufelsberg.jpg",
        "duration": 720,
        "views": 18500,
        "episodeNumber": 1,
        "publishedAt": "2025-11-15T10:00:00Z"
      },
      {
        "id": "vid_w6v5u4",
        "title": "Underground Bunkers of Gesundbrunnen",
        "slug": "underground-bunkers-gesundbrunnen",
        "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/bunkers-gesundbrunnen.jpg",
        "duration": 540,
        "views": 15300,
        "episodeNumber": 2,
        "publishedAt": "2025-12-01T10:00:00Z"
      },
      {
        "id": "vid_a1b2c3d4",
        "title": "Hidden Courtyards of Kreuzberg",
        "slug": "hidden-courtyards-kreuzberg",
        "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/hidden-courtyards-kreuzberg.jpg",
        "duration": 482,
        "views": 12840,
        "episodeNumber": 3,
        "publishedAt": "2026-03-10T14:30:00Z"
      }
    ],
    "videoCount": 8,
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2026-03-10T14:30:00Z"
  },
  "meta": {
    "page": 1,
    "limit": 50,
    "totalItems": 8,
    "totalPages": 1
  }
}
```

---

## Editor Endpoints

### Create Video

```
POST /api/v1/videos
```

Creates a new video. The video file must already be uploaded via the Media API. The video is created in `draft` status by default.

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Video title (3-200 characters) |
| `description` | string | yes | Short description (10-500 characters) |
| `body` | string | no | Long-form description / show notes (Markdown) |
| `mediaId` | string | yes | ID of the uploaded video file from Media API |
| `thumbnailMediaId` | string | no | ID of the uploaded thumbnail image from Media API |
| `categoryId` | string | yes | Category ID |
| `seriesId` | string | no | Series ID to attach the video to |
| `episodeNumber` | integer | no | Episode number within the series |
| `tagIds` | string[] | no | Array of tag IDs |
| `status` | string | no | `draft` (default) or `published` |
| `publishedAt` | string | no | ISO 8601 scheduled publish date (future dates allowed) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/videos" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Berlin Wall Memorial: Then and Now",
    "description": "A moving visual comparison of the Berlin Wall Memorial at Bernauer Strasse, contrasting archival footage with the present day.",
    "body": "## The Berlin Wall Memorial\n\nIn this video, we walk along **Bernauer Strasse** and compare...",
    "mediaId": "med_v1w2x3",
    "thumbnailMediaId": "med_t4u5v6",
    "categoryId": "cat_h1i2j3",
    "seriesId": "ser_m1n2o3",
    "episodeNumber": 4,
    "tagIds": ["tag_003", "tag_004"],
    "status": "draft"
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "vid_n3o4p5",
    "title": "Berlin Wall Memorial: Then and Now",
    "slug": "berlin-wall-memorial-then-and-now",
    "description": "A moving visual comparison of the Berlin Wall Memorial at Bernauer Strasse, contrasting archival footage with the present day.",
    "body": "## The Berlin Wall Memorial\n\nIn this video, we walk along **Bernauer Strasse** and compare...",
    "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/berlin-wall-memorial.jpg",
    "videoUrl": null,
    "duration": null,
    "views": 0,
    "status": "draft",
    "category": {
      "id": "cat_h1i2j3",
      "name": "History",
      "slug": "history"
    },
    "series": {
      "id": "ser_m1n2o3",
      "title": "Secret Berlin",
      "slug": "secret-berlin",
      "episodeNumber": 4
    },
    "tags": [
      { "id": "tag_003", "name": "Berlin Wall", "slug": "berlin-wall" },
      { "id": "tag_004", "name": "History", "slug": "history" }
    ],
    "author": {
      "id": "usr_e1f2g3",
      "firstName": "Lena",
      "lastName": "Müller"
    },
    "publishedAt": null,
    "createdAt": "2026-03-12T11:00:00Z",
    "updatedAt": "2026-03-12T11:00:00Z"
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": [
    "title must be between 3 and 200 characters",
    "mediaId must reference an existing uploaded video"
  ],
  "error": "Bad Request"
}
```

---

### Update Video

```
PATCH /api/v1/videos/:id
```

Updates an existing video. Editors can only update their own videos. Admins can update any video.

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The video ID |

**Request Body:** Any subset of the fields from the create endpoint.

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/videos/vid_n3o4p5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "publishedAt": "2026-03-15T08:00:00Z"
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "vid_n3o4p5",
    "title": "Berlin Wall Memorial: Then and Now",
    "slug": "berlin-wall-memorial-then-and-now",
    "status": "published",
    "publishedAt": "2026-03-15T08:00:00Z",
    "updatedAt": "2026-03-12T11:30:00Z"
  }
}
```

**Error Response: `403 Forbidden`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: you can only edit your own videos",
  "error": "Forbidden"
}
```

---

### Delete Video

```
DELETE /api/v1/videos/:id
```

Soft-deletes a video. Editors can only delete their own videos. Admins can delete any video.

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The video ID |

**Request Example:**

```bash
curl -X DELETE "https://iloveberlin.biz/api/v1/videos/vid_n3o4p5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `204 No Content`**

No response body.

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Video not found",
  "error": "Not Found"
}
```

---

## Admin Endpoints

### Create Video Series

```
POST /api/v1/video-series
```

Creates a new video series.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Series title (3-200 characters) |
| `description` | string | yes | Series description (10-1000 characters) |
| `thumbnailMediaId` | string | no | Media ID for the series thumbnail |
| `categoryId` | string | yes | Category ID |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/video-series" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Berlin Food Markets",
    "description": "A complete guide to the best food markets in Berlin, from Markthalle Neun to the Turkish Market.",
    "thumbnailMediaId": "med_a1b2c3",
    "categoryId": "cat_f1g2h3"
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "ser_q1r2s3",
    "title": "Berlin Food Markets",
    "slug": "berlin-food-markets",
    "description": "A complete guide to the best food markets in Berlin, from Markthalle Neun to the Turkish Market.",
    "thumbnailUrl": "https://media.iloveberlin.biz/series/thumbs/berlin-food-markets.jpg",
    "videoCount": 0,
    "category": {
      "id": "cat_f1g2h3",
      "name": "Food & Drink",
      "slug": "food-drink"
    },
    "createdAt": "2026-03-12T12:00:00Z",
    "updatedAt": "2026-03-12T12:00:00Z"
  }
}
```

---

### Update Video Series

```
PATCH /api/v1/video-series/:id
```

Updates an existing video series.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The series ID |

**Request Body:** Any subset of the fields from the create series endpoint.

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/video-series/ser_q1r2s3" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Berlin Food Markets & Street Food",
    "description": "Updated: A complete guide to the best food markets and street food spots in Berlin."
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "ser_q1r2s3",
    "title": "Berlin Food Markets & Street Food",
    "slug": "berlin-food-markets-street-food",
    "description": "Updated: A complete guide to the best food markets and street food spots in Berlin.",
    "thumbnailUrl": "https://media.iloveberlin.biz/series/thumbs/berlin-food-markets.jpg",
    "videoCount": 0,
    "category": {
      "id": "cat_f1g2h3",
      "name": "Food & Drink",
      "slug": "food-drink"
    },
    "updatedAt": "2026-03-12T12:15:00Z"
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
| `400` | Bad Request | Invalid input, missing required fields, or validation failure |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions for the requested action |
| `404` | Not Found | Video or series not found |
| `409` | Conflict | Duplicate slug or episode number within a series |
| `413` | Payload Too Large | Video file exceeds the maximum allowed size |
| `422` | Unprocessable Entity | Video file format not supported |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Endpoint Group | Rate Limit | Window |
|----------------|-----------|--------|
| `GET /videos`, `GET /videos/series` | 120 requests | 1 minute |
| `GET /videos/:slug` | 60 requests | 1 minute |
| `POST /videos` | 10 requests | 1 minute |
| `PATCH /videos/:id` | 20 requests | 1 minute |
| `DELETE /videos/:id` | 10 requests | 1 minute |
| `POST /video-series`, `PATCH /video-series/:id` | 10 requests | 1 minute |

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
