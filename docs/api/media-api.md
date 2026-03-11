# Media API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Media API manages file uploads and the media library on the ILoveBerlin platform. All media files (images, videos, documents) are stored on Cloudflare R2 object storage. Uploads use a two-step presigned URL flow: the client requests a presigned upload URL, uploads the file directly to R2, then confirms the upload so the server can trigger processing (image resizing, video transcoding, metadata extraction). Editors and above can manage the shared media library.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/media/presign` | editor | Get a presigned upload URL |
| `POST` | `/media/confirm` | editor | Confirm upload and trigger processing |
| `GET` | `/media` | editor | Browse the media library |
| `GET` | `/media/:id` | editor | Get media item details |
| `DELETE` | `/media/:id` | editor | Delete a media item |

---

## Upload Flow

The upload process follows a two-step presigned URL pattern to allow direct client-to-R2 uploads without proxying through the backend.

```
┌────────┐         ┌──────────┐         ┌───────────────┐
│ Client │         │ Backend  │         │ Cloudflare R2 │
└───┬────┘         └────┬─────┘         └──────┬────────┘
    │                   │                      │
    │ 1. POST /media/presign                   │
    │ ──────────────────>                      │
    │                   │                      │
    │ 2. presignedUrl + mediaId                │
    │ <──────────────────                      │
    │                   │                      │
    │ 3. PUT file directly to presignedUrl     │
    │ ─────────────────────────────────────────>
    │                   │                      │
    │ 4. 200 OK                                │
    │ <─────────────────────────────────────────
    │                   │                      │
    │ 5. POST /media/confirm                   │
    │ ──────────────────>                      │
    │                   │  6. Process file      │
    │                   │  (resize/transcode)   │
    │ 7. Media object   │                      │
    │ <──────────────────                      │
    │                   │                      │
```

### Step-by-Step:

1. **Request presigned URL** -- Client calls `POST /media/presign` with the filename, MIME type, and file size.
2. **Receive presigned URL** -- Backend validates the request, creates a pending media record, generates a presigned R2 upload URL, and returns it along with a `mediaId`.
3. **Upload to R2** -- Client uploads the file directly to Cloudflare R2 using the presigned URL via an HTTP `PUT` request.
4. **R2 confirms** -- R2 returns `200 OK` after the upload completes.
5. **Confirm upload** -- Client calls `POST /media/confirm` with the `mediaId` to notify the backend that the upload is complete.
6. **Processing** -- Backend verifies the file exists in R2, then triggers async processing (image resizing to multiple sizes, video transcoding to HLS, metadata extraction).
7. **Media object returned** -- Backend returns the media object with processing status. The client can poll or use WebSocket notifications to track processing completion.

---

## Endpoints

### Request Presigned Upload URL

```
POST /api/v1/media/presign
```

Generates a presigned URL for direct file upload to Cloudflare R2. The presigned URL is valid for 15 minutes.

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | yes | Original filename (used for display and extension detection) |
| `mimeType` | string | yes | MIME type of the file |
| `fileSize` | integer | yes | File size in bytes |
| `purpose` | string | yes | Upload purpose: `article_image`, `article_hero`, `event_image`, `dining_image`, `video`, `video_thumbnail`, `guide_image`, `product_image`, `competition_image`, `avatar`, `general` |
| `alt` | string | no | Alt text for accessibility (recommended for images) |

**Supported MIME Types and Limits:**

| Category | MIME Types | Max Size |
|----------|-----------|----------|
| Images | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml` | 10 MB |
| Videos | `video/mp4`, `video/quicktime`, `video/webm` | 500 MB |
| Documents | `application/pdf` | 20 MB |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/media/presign" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "berlin-wall-memorial.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 3450000,
    "purpose": "article_hero",
    "alt": "Berlin Wall Memorial at Bernauer Strasse"
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "mediaId": "med_a1b2c3d4",
    "presignedUrl": "https://iloveberlin-media.r2.cloudflarestorage.com/uploads/2026/03/med_a1b2c3d4.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Signature=...",
    "method": "PUT",
    "headers": {
      "Content-Type": "image/jpeg",
      "Content-Length": "3450000"
    },
    "expiresAt": "2026-03-12T16:15:00Z",
    "maxFileSize": 10485760
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "File size 15000000 bytes exceeds maximum allowed size of 10485760 bytes for images",
  "error": "Bad Request"
}
```

**Error Response: `422 Unprocessable Entity`**

```json
{
  "statusCode": 422,
  "message": "Unsupported MIME type: application/zip. Allowed types: image/jpeg, image/png, image/webp, image/gif, image/svg+xml, video/mp4, video/quicktime, video/webm, application/pdf",
  "error": "Unprocessable Entity"
}
```

---

### Confirm Upload

```
POST /api/v1/media/confirm
```

Confirms that the file has been uploaded to R2 and triggers async processing. The backend verifies the file exists in R2, extracts metadata, and starts processing (image resizing, video transcoding).

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mediaId` | string | yes | The media ID returned from the presign step |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/media/confirm" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "mediaId": "med_a1b2c3d4"
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "med_a1b2c3d4",
    "filename": "berlin-wall-memorial.jpg",
    "originalUrl": "https://media.iloveberlin.biz/originals/2026/03/med_a1b2c3d4.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 3450000,
    "purpose": "article_hero",
    "alt": "Berlin Wall Memorial at Bernauer Strasse",
    "status": "processing",
    "metadata": {
      "width": 3840,
      "height": 2560,
      "format": "jpeg",
      "colorSpace": "sRGB"
    },
    "variants": null,
    "uploadedBy": {
      "id": "usr_e1f2g3",
      "firstName": "Lena",
      "lastName": "Müller"
    },
    "createdAt": "2026-03-12T16:00:00Z"
  }
}
```

After processing completes (typically 2-10 seconds for images, 30-300 seconds for videos), the media item's status changes to `ready` and variant URLs become available.

**Processed Image Example (when polling or via webhook):**

```json
{
  "data": {
    "id": "med_a1b2c3d4",
    "filename": "berlin-wall-memorial.jpg",
    "originalUrl": "https://media.iloveberlin.biz/originals/2026/03/med_a1b2c3d4.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 3450000,
    "purpose": "article_hero",
    "alt": "Berlin Wall Memorial at Bernauer Strasse",
    "status": "ready",
    "metadata": {
      "width": 3840,
      "height": 2560,
      "format": "jpeg",
      "colorSpace": "sRGB"
    },
    "variants": {
      "original": "https://media.iloveberlin.biz/originals/2026/03/med_a1b2c3d4.jpg",
      "large": "https://media.iloveberlin.biz/large/2026/03/med_a1b2c3d4.jpg",
      "medium": "https://media.iloveberlin.biz/medium/2026/03/med_a1b2c3d4.jpg",
      "small": "https://media.iloveberlin.biz/small/2026/03/med_a1b2c3d4.jpg",
      "thumbnail": "https://media.iloveberlin.biz/thumbs/2026/03/med_a1b2c3d4.jpg"
    },
    "variantSizes": {
      "large": { "width": 1920, "height": 1280 },
      "medium": { "width": 960, "height": 640 },
      "small": { "width": 480, "height": 320 },
      "thumbnail": { "width": 200, "height": 133 }
    },
    "uploadedBy": {
      "id": "usr_e1f2g3",
      "firstName": "Lena",
      "lastName": "Müller"
    },
    "createdAt": "2026-03-12T16:00:00Z",
    "processedAt": "2026-03-12T16:00:05Z"
  }
}
```

**Processed Video Example:**

```json
{
  "data": {
    "id": "med_v1w2x3y4",
    "filename": "hidden-courtyards.mp4",
    "originalUrl": "https://media.iloveberlin.biz/originals/2026/03/med_v1w2x3y4.mp4",
    "mimeType": "video/mp4",
    "fileSize": 245000000,
    "purpose": "video",
    "status": "ready",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "duration": 482,
      "codec": "h264",
      "bitrate": 4000000,
      "fps": 30
    },
    "variants": {
      "original": "https://media.iloveberlin.biz/originals/2026/03/med_v1w2x3y4.mp4",
      "hls": "https://media.iloveberlin.biz/stream/2026/03/med_v1w2x3y4/playlist.m3u8",
      "720p": "https://media.iloveberlin.biz/stream/2026/03/med_v1w2x3y4/720p.m3u8",
      "480p": "https://media.iloveberlin.biz/stream/2026/03/med_v1w2x3y4/480p.m3u8",
      "thumbnail": "https://media.iloveberlin.biz/thumbs/2026/03/med_v1w2x3y4.jpg",
      "poster": "https://media.iloveberlin.biz/posters/2026/03/med_v1w2x3y4.jpg"
    },
    "uploadedBy": {
      "id": "usr_e1f2g3",
      "firstName": "Lena",
      "lastName": "Müller"
    },
    "createdAt": "2026-03-12T16:00:00Z",
    "processedAt": "2026-03-12T16:03:42Z"
  }
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Media item not found or presigned URL has expired",
  "error": "Not Found"
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "File not found in storage. Please re-upload using a new presigned URL.",
  "error": "Bad Request"
}
```

---

### Browse Media Library

```
GET /api/v1/media
```

Returns a paginated list of media items in the library. Supports filtering by type, purpose, uploader, and search.

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `30` | Items per page (max: 100) |
| `sort` | string | `createdAt:desc` | Sort: `createdAt:desc`, `createdAt:asc`, `filename:asc`, `fileSize:desc` |
| `type` | string | — | Filter by file type: `image`, `video`, `document` |
| `mimeType` | string | — | Filter by exact MIME type |
| `purpose` | string | — | Filter by upload purpose |
| `status` | string | — | Filter by processing status: `pending`, `processing`, `ready`, `failed` |
| `uploadedBy` | string | — | Filter by uploader user ID |
| `q` | string | — | Search by filename or alt text |
| `dateFrom` | string | — | ISO 8601 start date |
| `dateTo` | string | — | ISO 8601 end date |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/media?type=image&purpose=article_hero&limit=20&sort=createdAt:desc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "med_a1b2c3d4",
      "filename": "berlin-wall-memorial.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 3450000,
      "purpose": "article_hero",
      "alt": "Berlin Wall Memorial at Bernauer Strasse",
      "status": "ready",
      "thumbnailUrl": "https://media.iloveberlin.biz/thumbs/2026/03/med_a1b2c3d4.jpg",
      "metadata": {
        "width": 3840,
        "height": 2560,
        "format": "jpeg"
      },
      "usedIn": [
        {
          "type": "article",
          "id": "art_x1y2z3",
          "title": "Berlin Wall Memorial: A Complete Guide"
        }
      ],
      "uploadedBy": {
        "id": "usr_e1f2g3",
        "firstName": "Lena",
        "lastName": "Müller"
      },
      "createdAt": "2026-03-12T16:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 342,
    "totalPages": 18
  }
}
```

---

### Get Media Item

```
GET /api/v1/media/:id
```

Returns full details for a single media item, including all variant URLs.

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The media item ID |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/media/med_a1b2c3d4" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "med_a1b2c3d4",
    "filename": "berlin-wall-memorial.jpg",
    "originalUrl": "https://media.iloveberlin.biz/originals/2026/03/med_a1b2c3d4.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 3450000,
    "purpose": "article_hero",
    "alt": "Berlin Wall Memorial at Bernauer Strasse",
    "status": "ready",
    "metadata": {
      "width": 3840,
      "height": 2560,
      "format": "jpeg",
      "colorSpace": "sRGB",
      "exif": {
        "camera": "Canon EOS R5",
        "lens": "RF 24-70mm F2.8L",
        "focalLength": "35mm",
        "aperture": "f/5.6",
        "iso": 200,
        "dateTaken": "2026-03-10T14:22:00Z"
      }
    },
    "variants": {
      "original": "https://media.iloveberlin.biz/originals/2026/03/med_a1b2c3d4.jpg",
      "large": "https://media.iloveberlin.biz/large/2026/03/med_a1b2c3d4.jpg",
      "medium": "https://media.iloveberlin.biz/medium/2026/03/med_a1b2c3d4.jpg",
      "small": "https://media.iloveberlin.biz/small/2026/03/med_a1b2c3d4.jpg",
      "thumbnail": "https://media.iloveberlin.biz/thumbs/2026/03/med_a1b2c3d4.jpg"
    },
    "variantSizes": {
      "large": { "width": 1920, "height": 1280, "fileSize": 890000 },
      "medium": { "width": 960, "height": 640, "fileSize": 320000 },
      "small": { "width": 480, "height": 320, "fileSize": 95000 },
      "thumbnail": { "width": 200, "height": 133, "fileSize": 18000 }
    },
    "usedIn": [
      {
        "type": "article",
        "id": "art_x1y2z3",
        "title": "Berlin Wall Memorial: A Complete Guide",
        "field": "heroImage"
      }
    ],
    "uploadedBy": {
      "id": "usr_e1f2g3",
      "firstName": "Lena",
      "lastName": "Müller"
    },
    "createdAt": "2026-03-12T16:00:00Z",
    "processedAt": "2026-03-12T16:00:05Z"
  }
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Media item not found",
  "error": "Not Found"
}
```

---

### Delete Media Item

```
DELETE /api/v1/media/:id
```

Deletes a media item and all its variants from R2 storage. Editors can delete their own uploads. Admins can delete any media. The item cannot be deleted if it is currently in use by published content.

**Authentication:** Editor+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The media item ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `force` | boolean | `false` | Admin-only: force delete even if media is in use (removes references) |

**Request Example:**

```bash
curl -X DELETE "https://iloveberlin.biz/api/v1/media/med_a1b2c3d4" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `204 No Content`**

No response body.

**Error Response: `409 Conflict`**

```json
{
  "statusCode": 409,
  "message": "Cannot delete media: currently used by 1 published item(s). Use ?force=true to override (admin only).",
  "error": "Conflict",
  "usedIn": [
    {
      "type": "article",
      "id": "art_x1y2z3",
      "title": "Berlin Wall Memorial: A Complete Guide"
    }
  ]
}
```

**Error Response: `403 Forbidden`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: you can only delete your own uploads",
  "error": "Forbidden"
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
| `400` | Bad Request | File size exceeds limit, file not found in R2 after upload, or invalid parameters |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions (not editor+, or trying to delete another user's upload) |
| `404` | Not Found | Media item not found or presigned URL expired |
| `409` | Conflict | Media item is in use and cannot be deleted |
| `413` | Payload Too Large | File exceeds maximum allowed size for its type |
| `422` | Unprocessable Entity | Unsupported MIME type or corrupt file |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | R2 storage or processing pipeline temporarily unavailable |

---

## Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| `POST /media/presign` | 20 requests | 1 minute |
| `POST /media/confirm` | 20 requests | 1 minute |
| `GET /media` | 60 requests | 1 minute |
| `GET /media/:id` | 60 requests | 1 minute |
| `DELETE /media/:id` | 10 requests | 1 minute |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
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

## Storage Quotas

| Role | Storage Quota | Per-File Max |
|------|--------------|-------------|
| Editor | 5 GB | 500 MB (video), 10 MB (image) |
| Admin | 50 GB | 500 MB (video), 10 MB (image) |
| Superadmin | Unlimited | 500 MB (video), 10 MB (image) |

When a user exceeds their storage quota:

```json
{
  "statusCode": 400,
  "message": "Storage quota exceeded. You have used 4.92 GB of your 5 GB quota. Delete unused media or contact an admin to increase your limit.",
  "error": "Bad Request",
  "quotaUsed": 5284823040,
  "quotaLimit": 5368709120
}
```
