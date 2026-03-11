# FR-MEDIA: Media

**Module:** Media
**Status:** Draft
**Last Updated:** 2026-03-11
**Owner:** Platform Team
**Related User Stories:** US-MEDIA-001 through US-MEDIA-035

---

## 1. Overview

The Media module manages all file uploads on the ILoveBerlin platform. Files are uploaded directly to Cloudflare R2 via presigned URLs (bypassing the application server for large payloads). Images are processed server-side using Sharp into four standard sizes (thumbnail 150px, small 400px, medium 800px, large 1200px). The module provides a media library browser for administrators, drag-and-drop upload UI, progress tracking, comprehensive metadata storage, and enforces supported formats and file size limits.

---

## 2. Functional Requirements

### 2.1 Presigned URL Upload to R2

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-001 | The system SHALL generate presigned PUT URLs for direct upload to Cloudflare R2. The frontend uploads files directly to R2 without proxying through the NestJS backend. | Must | US-MEDIA-001 |
| FR-MEDIA-002 | Presigned URLs SHALL be scoped to a specific object key, content type, and maximum content length. They SHALL expire after 15 minutes. | Must | US-MEDIA-002 |
| FR-MEDIA-003 | Object keys SHALL follow the pattern: `uploads/{year}/{month}/{uuid}.{ext}` (e.g., `uploads/2026/03/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`). | Must | US-MEDIA-003 |
| FR-MEDIA-004 | The presigned URL request SHALL validate the file's MIME type and size against the allowed list before generating the URL. | Must | US-MEDIA-004 |
| FR-MEDIA-005 | After the frontend completes the upload to R2, it SHALL call a confirmation endpoint on the backend with the media ID. The backend verifies the file exists in R2 (HEAD request) and triggers image processing. | Must | US-MEDIA-005 |
| FR-MEDIA-006 | If the upload confirmation is not received within 30 minutes of presigned URL generation, a cleanup job SHALL delete the orphaned R2 object. | Should | US-MEDIA-006 |
| FR-MEDIA-007 | The system SHALL support multi-part uploads for files larger than 10 MB via R2's multipart upload API. The backend generates presigned URLs for each part and a completion URL. | Should | US-MEDIA-007 |

### 2.2 Image Processing (Sharp)

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-008 | Upon upload confirmation of an image file, the system SHALL download the original from R2, process it using Sharp, and upload the processed variants back to R2. | Must | US-MEDIA-008 |
| FR-MEDIA-009 | The system SHALL generate four image sizes from the original, resizing by maximum width while maintaining aspect ratio: | Must | US-MEDIA-009 |

| Size Name | Max Width | Use Case |
|-----------|-----------|----------|
| `thumbnail` | 150px | List items, admin grid |
| `small` | 400px | Cards, mobile listings |
| `medium` | 800px | Article body, detail pages |
| `large` | 1200px | Hero images, lightbox |

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-010 | Processed variants SHALL be stored in R2 with the key pattern: `processed/{year}/{month}/{uuid}/{size}.{ext}` (e.g., `processed/2026/03/uuid/thumbnail.webp`). | Must | US-MEDIA-010 |
| FR-MEDIA-011 | All processed image variants SHALL be converted to WebP format for optimal file size, with a JPEG fallback generated for the `large` size. | Should | US-MEDIA-011 |
| FR-MEDIA-012 | The system SHALL apply the following Sharp processing options: auto-orient (EXIF rotation), strip EXIF metadata (except copyright), quality 80 for WebP, quality 85 for JPEG. | Must | US-MEDIA-012 |
| FR-MEDIA-013 | If the uploaded image is smaller than a target size (e.g., a 100px image for the 150px thumbnail), the system SHALL NOT upscale it. The variant is saved at the original dimensions. | Must | US-MEDIA-013 |
| FR-MEDIA-014 | Image processing SHALL be performed asynchronously via a background job queue. The media record's `processing_status` field tracks progress: `pending` -> `processing` -> `completed` / `failed`. | Must | US-MEDIA-014 |
| FR-MEDIA-015 | If image processing fails, the system SHALL retry up to 3 times with exponential backoff. After 3 failures, the status is set to `failed` and an admin alert is generated. | Must | US-MEDIA-015 |
| FR-MEDIA-016 | For GIF files, the system SHALL generate a static thumbnail (first frame) and retain the original animated GIF without resizing. | Should | US-MEDIA-016 |
| FR-MEDIA-017 | For video files (MP4), the system SHALL NOT perform transcoding. The original file is stored as-is. A thumbnail may be extracted using ffmpeg (optional, v2). | Should | US-MEDIA-017 |

### 2.3 Media Library Browser

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-018 | Admin users SHALL have access to a media library browser that displays all uploaded media in a grid view with thumbnails. | Must | US-MEDIA-018 |
| FR-MEDIA-019 | The media library SHALL support filtering by: file type (image, video, document), upload date range, uploader (user), and search by filename or alt text. | Must | US-MEDIA-019 |
| FR-MEDIA-020 | The media library SHALL support pagination (cursor-based, 48 items per page) and sorting by upload date (newest first, default) or file size. | Must | US-MEDIA-020 |
| FR-MEDIA-021 | Admin users SHALL be able to view media details: all size variants with URLs, file metadata (dimensions, file size, format), upload date, uploader, and all content references (which articles, videos, products, etc. use this media). | Must | US-MEDIA-021 |
| FR-MEDIA-022 | Admin users SHALL be able to edit media metadata: alt text, title, caption, and credit/attribution. | Must | US-MEDIA-022 |
| FR-MEDIA-023 | Admin users SHALL be able to delete media that is not referenced by any content. If the media is in use, the system SHALL warn the admin and list all references; deletion is blocked unless the admin confirms force-delete. | Must | US-MEDIA-023 |
| FR-MEDIA-024 | The media library SHALL be accessible as a modal/picker from content editors (article editor, video editor, product editor, etc.) for selecting existing media or uploading new files. | Must | US-MEDIA-024 |

### 2.4 Drag-and-Drop Upload

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-025 | The frontend SHALL support drag-and-drop file upload in the media library and within content editors. | Must | US-MEDIA-025 |
| FR-MEDIA-026 | Users SHALL also be able to upload via a traditional file picker dialog (click to browse). | Must | US-MEDIA-026 |
| FR-MEDIA-027 | The upload interface SHALL support multiple file selection (batch upload of up to 20 files simultaneously). | Should | US-MEDIA-027 |
| FR-MEDIA-028 | The upload interface SHALL validate files client-side before upload: check file type against allowed MIME types, check file size against limits, and show validation errors inline. | Must | US-MEDIA-028 |

### 2.5 Progress Tracking

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-029 | The frontend SHALL display upload progress (percentage) for each file during the R2 upload using XMLHttpRequest or fetch with progress events. | Must | US-MEDIA-029 |
| FR-MEDIA-030 | After upload completes, the frontend SHALL display the processing status (pending, processing, completed, failed) by polling the media detail endpoint or via server-sent events. | Must | US-MEDIA-030 |
| FR-MEDIA-031 | The upload interface SHALL display a queue of pending uploads with individual progress bars and overall progress. | Should | US-MEDIA-031 |
| FR-MEDIA-032 | Users SHALL be able to cancel an in-progress upload. Cancellation SHALL abort the R2 PUT request and clean up the media record. | Should | US-MEDIA-032 |

### 2.6 File Formats and Size Limits

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-033 | The system SHALL support the following file formats: | Must | US-MEDIA-033 |

| Format | MIME Type | Max File Size | Notes |
|--------|-----------|--------------|-------|
| JPEG | `image/jpeg` | 20 MB | Most common image format |
| PNG | `image/png` | 20 MB | Supports transparency |
| WebP | `image/webp` | 20 MB | Modern image format |
| GIF | `image/gif` | 10 MB | Animated GIFs supported |
| MP4 | `video/mp4` | 200 MB | Video format |

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-MEDIA-034 | The system SHALL reject uploads that exceed the file size limit for their format with a clear error message. | Must | US-MEDIA-034 |
| FR-MEDIA-035 | The system SHALL reject uploads with MIME types not in the supported list. MIME type validation SHALL check both the `Content-Type` header and the file's magic bytes (server-side). | Must | US-MEDIA-035 |

---

## 3. Database Schema

### 3.1 Table: `media`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `original_filename` | `VARCHAR(255)` | NOT NULL | Original upload filename |
| `storage_key` | `VARCHAR(500)` | NOT NULL, UNIQUE | R2 object key for original file |
| `mime_type` | `VARCHAR(100)` | NOT NULL | MIME type (validated) |
| `file_size_bytes` | `BIGINT` | NOT NULL | Original file size |
| `file_type` | `VARCHAR(20)` | NOT NULL, CHECK IN ('image','video','document') | High-level file type |
| `width` | `INTEGER` | NULLABLE | Original image/video width in pixels |
| `height` | `INTEGER` | NULLABLE | Original image/video height in pixels |
| `duration_seconds` | `DECIMAL(10,2)` | NULLABLE | Video duration |
| `alt_text` | `VARCHAR(300)` | NULLABLE | Accessibility alt text |
| `title` | `VARCHAR(255)` | NULLABLE | Media title |
| `caption` | `TEXT` | NULLABLE | Media caption |
| `credit` | `VARCHAR(255)` | NULLABLE | Attribution / credit |
| `color_dominant` | `VARCHAR(7)` | NULLABLE | Dominant color hex (extracted by Sharp) |
| `blur_hash` | `VARCHAR(50)` | NULLABLE | BlurHash string for placeholder |
| `processing_status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','processing','completed','failed') | Image processing status |
| `processing_error` | `TEXT` | NULLABLE | Error message if processing failed |
| `processing_retries` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of processing retries |
| `uploaded_by` | `UUID` | FK -> users.id, NOT NULL | Uploader user |
| `confirmed_at` | `TIMESTAMPTZ` | NULLABLE | Upload confirmation timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_media_storage_key` UNIQUE on `storage_key`
- `idx_media_uploaded_by` on `uploaded_by`
- `idx_media_file_type` on `file_type`
- `idx_media_processing_status` on `processing_status` WHERE `processing_status` IN ('pending', 'processing')
- `idx_media_created_at` on `created_at` DESC
- `idx_media_confirmed` on `confirmed_at` WHERE `confirmed_at` IS NULL

### 3.2 Table: `media_variants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `media_id` | `UUID` | FK -> media.id ON DELETE CASCADE, NOT NULL | Parent media |
| `size_name` | `VARCHAR(20)` | NOT NULL, CHECK IN ('thumbnail','small','medium','large','original') | Variant size |
| `storage_key` | `VARCHAR(500)` | NOT NULL, UNIQUE | R2 object key |
| `url` | `VARCHAR(1000)` | NOT NULL | Public CDN URL |
| `mime_type` | `VARCHAR(100)` | NOT NULL | Variant MIME type (may differ from original if converted to WebP) |
| `file_size_bytes` | `BIGINT` | NOT NULL | Variant file size |
| `width` | `INTEGER` | NOT NULL | Variant width in pixels |
| `height` | `INTEGER` | NOT NULL | Variant height in pixels |
| `format` | `VARCHAR(10)` | NOT NULL | Output format (webp, jpeg, png, gif) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_media_variants_media_id` on (`media_id`, `size_name`)
- `idx_media_variants_storage_key` UNIQUE on `storage_key`

**Constraints:**
- UNIQUE on (`media_id`, `size_name`, `format`)

### 3.3 Table: `media_references`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `media_id` | `UUID` | FK -> media.id ON DELETE CASCADE, NOT NULL | Media reference |
| `entity_type` | `VARCHAR(50)` | NOT NULL | Referencing entity type (e.g., 'video', 'article', 'product', 'classified_listing') |
| `entity_id` | `UUID` | NOT NULL | Referencing entity ID |
| `reference_type` | `VARCHAR(50)` | NOT NULL | How the media is used (e.g., 'thumbnail', 'cover_image', 'gallery', 'body_inline') |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Reference timestamp |

**Indexes:**
- `idx_media_references_media_id` on `media_id`
- `idx_media_references_entity` on (`entity_type`, `entity_id`)
- `idx_media_references_unique` UNIQUE on (`media_id`, `entity_type`, `entity_id`, `reference_type`)

### 3.4 Table: `media_upload_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `media_id` | `UUID` | FK -> media.id ON DELETE CASCADE, NOT NULL | Associated media record |
| `presigned_url` | `TEXT` | NOT NULL | Generated presigned URL |
| `storage_key` | `VARCHAR(500)` | NOT NULL | Target R2 key |
| `content_type` | `VARCHAR(100)` | NOT NULL | Expected content type |
| `max_size_bytes` | `BIGINT` | NOT NULL | Maximum allowed size |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | URL expiry timestamp |
| `is_used` | `BOOLEAN` | NOT NULL, DEFAULT false | Whether upload was confirmed |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_media_upload_tokens_media_id` on `media_id`
- `idx_media_upload_tokens_expired` on `expires_at` WHERE `is_used` = false

---

## 4. API Endpoints

### 4.1 Upload Endpoints

| Method | Path | Auth | Description | Body |
|--------|------|------|-------------|------|
| POST | `/api/v1/media/upload-url` | User | Request presigned upload URL | Body: `{ filename, content_type, file_size_bytes }` |
| POST | `/api/v1/media/:id/confirm` | User (uploader) | Confirm upload completion | — |
| POST | `/api/v1/media/multipart/initiate` | User | Initiate multipart upload | Body: `{ filename, content_type, file_size_bytes, part_count }` |
| POST | `/api/v1/media/multipart/:id/complete` | User (uploader) | Complete multipart upload | Body: `{ parts: [{ part_number, etag }] }` |
| POST | `/api/v1/media/multipart/:id/abort` | User (uploader) | Abort multipart upload | — |

**Presigned URL response:**
```json
{
  "data": {
    "media_id": "uuid",
    "upload_url": "https://r2-bucket.example.com/uploads/2026/03/uuid.jpg?X-Amz-...",
    "storage_key": "uploads/2026/03/uuid.jpg",
    "expires_at": "ISO8601",
    "max_size_bytes": 20971520
  }
}
```

**Multipart initiate response:**
```json
{
  "data": {
    "media_id": "uuid",
    "upload_id": "r2-multipart-upload-id",
    "part_urls": [
      { "part_number": 1, "url": "https://..." },
      { "part_number": 2, "url": "https://..." }
    ],
    "expires_at": "ISO8601"
  }
}
```

### 4.2 Media CRUD Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/media/:id` | User | Get media detail with all variants | — |
| PATCH | `/api/v1/media/:id` | User (uploader) or Admin | Update media metadata | Body: `{ alt_text, title, caption, credit }` |
| DELETE | `/api/v1/media/:id` | Admin | Delete media (with reference check) | `force` (bool, skip reference check) |

**Media detail response:**
```json
{
  "data": {
    "id": "uuid",
    "original_filename": "photo.jpg",
    "mime_type": "image/jpeg",
    "file_type": "image",
    "file_size_bytes": 2456789,
    "width": 3000,
    "height": 2000,
    "alt_text": "Berlin skyline at sunset",
    "title": "Berlin Skyline",
    "caption": "View from Tempelhofer Feld",
    "credit": "Photo by Max Mustermann",
    "color_dominant": "#4A90D9",
    "blur_hash": "LKO2?U%2Tw=w]~RBVZRi};RPxuwH",
    "processing_status": "completed",
    "variants": {
      "thumbnail": { "url": "https://cdn.iloveberlin.biz/processed/2026/03/uuid/thumbnail.webp", "width": 150, "height": 100, "file_size_bytes": 8234, "format": "webp" },
      "small": { "url": "https://cdn.iloveberlin.biz/processed/2026/03/uuid/small.webp", "width": 400, "height": 267, "file_size_bytes": 24567, "format": "webp" },
      "medium": { "url": "https://cdn.iloveberlin.biz/processed/2026/03/uuid/medium.webp", "width": 800, "height": 533, "file_size_bytes": 67890, "format": "webp" },
      "large": { "url": "https://cdn.iloveberlin.biz/processed/2026/03/uuid/large.webp", "width": 1200, "height": 800, "file_size_bytes": 145678, "format": "webp" },
      "large_jpeg": { "url": "https://cdn.iloveberlin.biz/processed/2026/03/uuid/large.jpg", "width": 1200, "height": 800, "file_size_bytes": 198765, "format": "jpeg" }
    },
    "uploaded_by": { "id": "uuid", "display_name": "Admin User" },
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

### 4.3 Media Library Endpoints (Admin)

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/admin/media` | Admin | Browse media library | `cursor`, `limit` (default 48, max 100), `file_type` (image, video), `uploaded_by` (user ID), `date_from`, `date_to`, `search` (filename or alt text), `sort` (newest, oldest, size_asc, size_desc) |
| GET | `/api/v1/admin/media/:id/references` | Admin | List all content references | — |
| POST | `/api/v1/admin/media/bulk-delete` | Admin | Bulk delete unreferenced media | Body: `{ media_ids: [uuid] }` |
| GET | `/api/v1/admin/media/stats` | Admin | Storage usage statistics | — |

**Media library list response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "original_filename": "photo.jpg",
      "thumbnail_url": "https://cdn.iloveberlin.biz/processed/2026/03/uuid/thumbnail.webp",
      "mime_type": "image/jpeg",
      "file_type": "image",
      "file_size_bytes": 2456789,
      "width": 3000,
      "height": 2000,
      "alt_text": "Berlin skyline",
      "processing_status": "completed",
      "reference_count": 3,
      "created_at": "ISO8601"
    }
  ],
  "pagination": { "next_cursor": "...", "has_more": true }
}
```

**Storage stats response:**
```json
{
  "data": {
    "total_files": 12456,
    "total_size_bytes": 15234567890,
    "total_size_human": "14.2 GB",
    "by_type": {
      "image": { "count": 11200, "size_bytes": 8234567890 },
      "video": { "count": 256, "size_bytes": 6500000000 }
    },
    "by_status": {
      "completed": 12300,
      "pending": 50,
      "processing": 6,
      "failed": 100
    },
    "orphaned_count": 45,
    "orphaned_size_bytes": 123456789
  }
}
```

### 4.4 Error Responses

| Code | Status | Trigger |
|------|--------|---------|
| UNSUPPORTED_FILE_TYPE | 422 | MIME type not in allowed list |
| FILE_TOO_LARGE | 422 | File exceeds size limit for its type |
| UPLOAD_NOT_CONFIRMED | 422 | Trying to use a media record that hasn't been confirmed |
| MEDIA_NOT_FOUND | 404 | Media ID does not exist |
| MEDIA_IN_USE | 409 | Deletion attempt on referenced media (without force flag) |
| PRESIGNED_URL_EXPIRED | 410 | Upload attempted after presigned URL expiry |
| PROCESSING_FAILED | 500 | Image processing failed after all retries |
| UPLOAD_CANCELLED | 422 | Action on a cancelled upload |
| INVALID_MIME_MAGIC | 422 | File content does not match declared Content-Type |

---

## 5. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `ProcessImageVariants` | Event-driven (queue) | Downloads original from R2, generates size variants using Sharp, uploads variants to R2, updates media record. |
| `CleanupOrphanedUploads` | Every 30 minutes | Deletes R2 objects for media records created > 30 minutes ago with `confirmed_at` IS NULL. |
| `CleanupDeletedMedia` | Daily at 04:00 UTC | Deletes R2 objects (original + all variants) for media records that have been soft-deleted. |
| `RetryFailedProcessing` | Every 10 minutes | Retries media with `processing_status = 'failed'` and `processing_retries < 3`. |
| `ExtractMediaMetadata` | Event-driven (queue) | Extracts dominant color (Sharp) and generates BlurHash for newly processed images. |
| `CalculateStorageStats` | Hourly | Updates storage usage statistics for the admin dashboard. |

---

## 6. Sharp Processing Pipeline

The image processing pipeline executes the following steps in order:

1. **Download** original file from R2 to a temporary directory.
2. **Validate** file integrity (check magic bytes match declared MIME type).
3. **Read** image metadata using `sharp(file).metadata()` (width, height, format, orientation).
4. **Auto-orient** based on EXIF orientation data.
5. **Strip metadata** (remove EXIF, IPTC, XMP — except copyright field).
6. **Extract** dominant color using `sharp.stats()`.
7. **Generate** BlurHash from a 32x32 downscaled version.
8. **For each target size** (thumbnail, small, medium, large):
   a. Resize to max width (maintaining aspect ratio, no upscaling).
   b. Convert to WebP (quality 80).
   c. Upload variant to R2.
   d. Record variant in `media_variants` table.
9. **For large size additionally**: generate JPEG fallback (quality 85).
10. **Update** `media` record: set `processing_status = 'completed'`, store `width`, `height`, `color_dominant`, `blur_hash`.
11. **Cleanup** temporary files.

---

## 7. R2 Bucket Configuration

| Setting | Value |
|---------|-------|
| Bucket name | `iloveberlin-media` |
| Region | `auto` (Cloudflare R2 is regionless) |
| Public access | Via Cloudflare CDN custom domain (`cdn.iloveberlin.biz`) |
| CORS | Allow `https://iloveberlin.biz`, `https://admin.iloveberlin.biz`, `http://localhost:3000` |
| Cache-Control (originals) | `public, max-age=31536000, immutable` |
| Cache-Control (variants) | `public, max-age=2592000` (30 days) |
| Lifecycle rules | Delete objects in `uploads/` prefix older than 24 hours if no corresponding `media` record exists |

---

## 8. Integration Points

| System | Integration |
|--------|-------------|
| Cloudflare R2 | Object storage for all media files |
| Cloudflare CDN | Media delivery via `cdn.iloveberlin.biz` custom domain |
| Sharp (npm) | Server-side image processing |
| All content modules | Thumbnail, cover image, gallery, and inline image references |
| Admin Panel (FR-ADMIN) | Media library browser, upload UI, storage stats |
| Next.js Frontend | Drag-and-drop upload component, image display with srcset |
| Flutter Mobile | Image picker, upload progress, cached image display |

---

## 9. Non-Functional Constraints

- Presigned URL generation p95 latency < 100ms.
- Image processing (all 4 sizes + JPEG fallback) SHALL complete within 30 seconds for images up to 20 MB.
- Maximum concurrent image processing jobs: 10 (configurable via environment variable).
- R2 storage costs are monitored; a monthly storage budget alert is configured at the Cloudflare level.
- All media URLs use the CDN domain (`cdn.iloveberlin.biz`), never direct R2 URLs.
- The system SHALL generate responsive `srcset` attributes for `<img>` tags using the four variant sizes.
- BlurHash is used as a placeholder while images load on both Next.js and Flutter frontends.
- Uploaded files are immutable: editing media metadata does not re-process the file; only database fields change.
- The system SHALL prevent path traversal attacks in filenames by using UUID-based keys exclusively and never incorporating user-supplied filenames in storage paths.
