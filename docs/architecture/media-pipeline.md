# Media Pipeline

**Platform:** ILoveBerlin (iloveberlin.biz)
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [Upload Flow](#upload-flow)
2. [Image Processing Pipeline](#image-processing-pipeline)
3. [Supported Formats](#supported-formats)
4. [Storage Structure in R2](#storage-structure-in-r2)
5. [CDN Delivery via Cloudflare](#cdn-delivery-via-cloudflare)
6. [Media Metadata Tracking](#media-metadata-tracking)
7. [Cleanup and Orphan Detection](#cleanup-and-orphan-detection)

---

## Upload Flow

### Presigned URL Upload Strategy

The platform uses a presigned URL pattern to upload files directly from the client to Cloudflare R2, bypassing the NestJS server for the actual file transfer. This reduces server load and bandwidth costs.

```
UPLOAD FLOW OVERVIEW

Client                    NestJS API               Cloudflare R2           PostgreSQL
  |                          |                          |                      |
  |  1. Request upload       |                          |                      |
  |  POST /media/presign     |                          |                      |
  |  {                       |                          |                      |
  |    filename: "photo.jpg",|                          |                      |
  |    mimeType: "image/jpeg"|                          |                      |
  |    size: 2048576,        |                          |                      |
  |    context: "article"    |                          |                      |
  |  }                       |                          |                      |
  |------------------------->|                          |                      |
  |                          |                          |                      |
  |                          |  2. VALIDATION           |                      |
  |                          |  ├── Auth: User logged in|                      |
  |                          |  ├── MIME type allowed?  |                      |
  |                          |  ├── File size within limit?                    |
  |                          |  ├── User quota not exceeded?                   |
  |                          |  └── Context valid?      |                      |
  |                          |                          |                      |
  |                          |  [FAIL] -> 400 Bad Request                      |
  |                          |  [PASS] -> Continue      |                      |
  |                          |                          |                      |
  |                          |  3. Generate storage path|                      |
  |                          |  media/article/2026/03/  |                      |
  |                          |  {uuid}.jpg              |                      |
  |                          |                          |                      |
  |                          |  4. Generate presigned URL                      |
  |                          |  (PUT, 15-minute expiry) |                      |
  |                          |  using R2 S3-compatible  |                      |
  |                          |  SDK                     |                      |
  |                          |------------------------->|                      |
  |                          |<-- presigned URL --------|                      |
  |                          |                          |                      |
  |                          |  5. Create media record  |                      |
  |                          |  status: 'pending'       |                      |
  |                          |--------------------------------------------------->|
  |                          |<-- media record ----------------------------------|
  |                          |                          |                      |
  |  6. Response:            |                          |                      |
  |  {                       |                          |                      |
  |    mediaId: "uuid",      |                          |                      |
  |    uploadUrl: "https://..                           |                      |
  |      .r2.cloudflarestorage                          |                      |
  |      .com/iloveberlin-media                         |                      |
  |      /media/article/2026/03                         |                      |
  |      /{uuid}.jpg?X-Amz-...",                        |                      |
  |    expiresAt: "...",     |                          |                      |
  |    maxSize: 10485760     |                          |                      |
  |  }                       |                          |                      |
  |<-------------------------|                          |                      |
  |                          |                          |                      |
  |  7. Upload file directly |                          |                      |
  |  to presigned URL        |                          |                      |
  |  PUT {uploadUrl}         |                          |                      |
  |  Content-Type: image/jpeg|                          |                      |
  |  Body: <binary data>     |                          |                      |
  |---------------------------------------------->|     |                      |
  |<-- 200 OK -----------------------------------|     |                      |
  |                          |                          |                      |
  |  8. Confirm upload       |                          |                      |
  |  POST /media/{id}/confirm|                          |                      |
  |------------------------->|                          |                      |
  |                          |                          |                      |
  |                          |  9. Verify file exists   |                      |
  |                          |  HEAD {storage path}     |                      |
  |                          |------------------------->|                      |
  |                          |<-- 200 + metadata -------|                      |
  |                          |                          |                      |
  |                          |  10. If image:           |                      |
  |                          |  Trigger processing      |                      |
  |                          |  (see Image Processing)  |                      |
  |                          |                          |                      |
  |                          |  11. Update media record |                      |
  |                          |  status: 'processing'    |                      |
  |                          |  -> 'ready'              |                      |
  |                          |--------------------------------------------------->|
  |                          |                          |                      |
  |  12. Response:           |                          |                      |
  |  {                       |                          |                      |
  |    mediaId: "uuid",      |                          |                      |
  |    status: "ready",      |                          |                      |
  |    urls: {               |                          |                      |
  |      original: "https://cdn.iloveberlin.biz/...",   |                      |
  |      large:    "https://cdn.iloveberlin.biz/...",   |                      |
  |      medium:   "https://cdn.iloveberlin.biz/...",   |                      |
  |      small:    "https://cdn.iloveberlin.biz/...",   |                      |
  |      thumbnail:"https://cdn.iloveberlin.biz/..."    |                      |
  |    },                    |                          |                      |
  |    width: 4032,          |                          |                      |
  |    height: 3024,         |                          |                      |
  |    size: 2048576,        |                          |                      |
  |    mimeType: "image/jpeg"|                          |                      |
  |  }                       |                          |                      |
  |<-------------------------|                          |                      |
```

### Upload Size Limits

| Content Type  | Max File Size | Allowed MIME Types                              |
| ------------- | ------------- | ----------------------------------------------- |
| Image         | 10 MB         | image/jpeg, image/png, image/webp, image/gif    |
| Video         | 100 MB        | video/mp4, video/webm                           |
| Document      | 5 MB          | application/pdf                                 |

### Per-User Upload Quotas

| User Role     | Daily Upload Limit | Total Storage Limit |
| ------------- | ------------------ | ------------------- |
| user          | 10 files / 50 MB   | 500 MB              |
| editor        | 100 files / 500 MB | 10 GB               |
| admin         | Unlimited          | Unlimited           |

---

## Image Processing Pipeline

### Processing with Sharp

All uploaded images are processed through a Sharp-based pipeline that creates multiple size variants and converts to modern formats.

```
IMAGE PROCESSING PIPELINE

Original Upload (e.g., 4032x3024 JPEG, 3.2MB)
        |
        v
+------------------+
| 1. DOWNLOAD      |
|    from R2       |
+--------+---------+
         |
         v
+------------------+
| 2. ANALYZE       |
| - Read metadata  |
| - Get dimensions |
| - Detect orient. |
| - Check animated |
|   (GIF)          |
+--------+---------+
         |
         v
+------------------+
| 3. STRIP EXIF    |
| - Remove GPS     |
| - Remove camera  |
|   data           |
| - Preserve ICC   |
|   color profile  |
+--------+---------+
         |
         v
+------------------+
| 4. AUTO-ORIENT   |
| - Apply EXIF     |
|   rotation       |
+--------+---------+
         |
    +----+----+----+----+
    |         |         |         |
    v         v         v         v
+-------+ +-------+ +-------+ +-------+
|THUMB  | |SMALL  | |MEDIUM | |LARGE  |
|150x150| |400x300| |800x600| |1200x  |
|crop   | |fit    | |fit    | | 900   |
|center | |inside | |inside | |fit    |
+---+---+ +---+---+ +---+---+ +---+---+
    |         |         |         |
    v         v         v         v
+-------+ +-------+ +-------+ +-------+
|WebP   | |WebP   | |WebP   | |WebP   |
|q: 80  | |q: 80  | |q: 80  | |q: 85  |
+---+---+ +---+---+ +---+---+ +---+---+
    |         |         |         |
    v         v         v         v
+------------------------------------------+
| 5. UPLOAD ALL VARIANTS TO R2             |
|                                          |
| media/article/2026/03/{uuid}_thumb.webp  |
| media/article/2026/03/{uuid}_sm.webp     |
| media/article/2026/03/{uuid}_md.webp     |
| media/article/2026/03/{uuid}_lg.webp     |
| media/article/2026/03/{uuid}.jpg         |
|                                 (original)|
+------------------------------------------+
```

### Variant Specifications

| Variant    | Dimensions     | Resize Mode | Format | Quality | Use Case                      |
| ---------- | -------------- | ----------- | ------ | ------- | ----------------------------- |
| thumbnail  | 150 x 150      | Cover (crop)| WebP   | 80      | Grid views, admin thumbnails  |
| small      | 400 x 300      | Inside (fit)| WebP   | 80      | Card components, mobile lists |
| medium     | 800 x 600      | Inside (fit)| WebP   | 80      | Article inline, tablet views  |
| large      | 1200 x 900     | Inside (fit)| WebP   | 85      | Hero images, desktop detail   |
| original   | Unchanged      | None        | Original| N/A    | Download, fallback            |

### Processing Rules by Content Type

```
Context-Based Processing:
│
├── Article images:
│   ├── All 4 variants generated
│   ├── Hero image: additional 1600x900 variant
│   └── Max aspect ratio: 3:1 (wider images cropped)
│
├── Event images:
│   ├── All 4 variants generated
│   └── Square crop for calendar view: 300x300
│
├── Dining photos:
│   ├── All 4 variants generated
│   └── Square crop for listing: 300x300
│
├── Guide images:
│   ├── All 4 variants generated
│   └── Wide banner variant: 1600x500 (cover crop)
│
├── Product images:
│   ├── All 4 variants generated
│   ├── Square variants for store grid: 400x400, 800x800
│   └── White background padding for product shots
│
├── User avatars:
│   ├── Thumbnail only: 150x150 (cover crop, center)
│   ├── Small: 300x300 (cover crop, center)
│   └── No large variants needed
│
├── Classified images:
│   ├── Small and medium variants only
│   └── Original preserved for detail view
│
└── Video thumbnails:
    ├── Extracted from video (if uploaded)
    ├── Or user-uploaded thumbnail
    └── Small and medium variants
```

### GIF Handling

```
Animated GIF Processing:
├── Detect animation via Sharp metadata
├── If animated:
│   ├── Preserve animation in original
│   ├── Generate static thumbnail (first frame)
│   ├── Generate static small/medium variants (first frame)
│   ├── Convert to animated WebP for large variant (if < 5MB)
│   └── Warn user if GIF exceeds 5MB
└── If static GIF:
    └── Process normally, convert to WebP
```

---

## Supported Formats

### Input Formats

| Format | MIME Type      | Max Size | Processing | Notes                          |
| ------ | -------------- | -------- | ---------- | ------------------------------ |
| JPEG   | image/jpeg     | 10 MB    | Full       | Most common upload format      |
| PNG    | image/png      | 10 MB    | Full       | Transparency preserved in WebP |
| WebP   | image/webp     | 10 MB    | Full       | Already optimized, still resize|
| GIF    | image/gif      | 10 MB    | Partial    | Animation handling (see above) |
| MP4    | video/mp4      | 100 MB   | Metadata   | No transcoding, metadata only  |
| WebM   | video/webm     | 100 MB   | Metadata   | No transcoding, metadata only  |
| PDF    | application/pdf| 5 MB     | None       | Stored as-is                   |

### Output Formats

| Format | Used For              | Quality | Advantages                            |
| ------ | --------------------- | ------- | ------------------------------------- |
| WebP   | All image variants    | 80-85   | 25-35% smaller than JPEG at same quality |
| Original | Preserved for download | N/A   | Fallback for older browsers           |

### Format Fallback Strategy

```
Browser Image Delivery:
│
├── Modern browsers (95%+):
│   └── Serve WebP variants via CDN
│
├── Legacy browsers (< 5%):
│   └── Serve original format (JPEG/PNG)
│   └── Handled by <picture> element with fallback:
│       <picture>
│         <source srcset="image.webp" type="image/webp">
│         <img src="image.jpg" alt="...">
│       </picture>
│
└── Next.js Image Component:
    └── Automatic format negotiation via Accept header
    └── next/image with custom R2 loader
```

---

## Storage Structure in R2

### Bucket Organization

```
R2 Bucket: iloveberlin-media
│
├── media/
│   ├── articles/
│   │   ├── 2026/
│   │   │   ├── 01/
│   │   │   │   ├── {uuid}.jpg              # Original
│   │   │   │   ├── {uuid}_thumb.webp       # 150x150
│   │   │   │   ├── {uuid}_sm.webp          # 400x300
│   │   │   │   ├── {uuid}_md.webp          # 800x600
│   │   │   │   ├── {uuid}_lg.webp          # 1200x900
│   │   │   │   └── {uuid}_hero.webp        # 1600x900
│   │   │   ├── 02/
│   │   │   └── 03/
│   │   └── ...
│   │
│   ├── events/
│   │   └── {year}/{month}/{uuid}_{variant}.{ext}
│   │
│   ├── guides/
│   │   └── {year}/{month}/{uuid}_{variant}.{ext}
│   │
│   ├── dining/
│   │   └── {year}/{month}/{uuid}_{variant}.{ext}
│   │
│   ├── videos/
│   │   └── {year}/{month}/{uuid}_{variant}.{ext}   # Thumbnails only
│   │
│   ├── classifieds/
│   │   └── {year}/{month}/{uuid}_{variant}.{ext}
│   │
│   ├── products/
│   │   └── {year}/{month}/{uuid}_{variant}.{ext}
│   │
│   ├── avatars/
│   │   └── {user-uuid}/
│   │       ├── {uuid}_thumb.webp
│   │       └── {uuid}_sm.webp
│   │
│   └── misc/
│       └── {year}/{month}/{uuid}.{ext}
│
├── static/                                 # Static site assets (if any)
│   ├── logos/
│   ├── icons/
│   └── defaults/
│       ├── article-placeholder.webp
│       ├── event-placeholder.webp
│       ├── avatar-placeholder.webp
│       └── product-placeholder.webp
│
└── backups/                                # Meilisearch dumps (optional)
    └── meili/
        └── {date}/
```

### File Naming Convention

```
Pattern: {uuid}_{variant}.{ext}

Components:
├── uuid:    UUID v4 (e.g., 550e8400-e29b-41d4-a716-446655440000)
│            Ensures uniqueness, no collisions, no enumeration
├── variant: Size variant identifier
│            ├── (none)  -> original
│            ├── thumb   -> thumbnail (150x150)
│            ├── sm      -> small (400x300)
│            ├── md      -> medium (800x600)
│            ├── lg      -> large (1200x900)
│            ├── hero    -> hero banner (1600x900)
│            └── sq      -> square (300x300 or 400x400)
└── ext:     File extension
             ├── .webp   -> WebP variant
             ├── .jpg    -> JPEG original
             ├── .png    -> PNG original
             └── .gif    -> GIF original
```

### Storage Estimates

| Content Type   | Avg Files/Item | Avg Size/Item | Estimated Items | Total Storage |
| -------------- | -------------- | ------------- | --------------- | ------------- |
| Articles       | 3 images       | ~5 MB         | 2,000           | ~10 GB        |
| Events         | 1 image        | ~2 MB         | 5,000           | ~10 GB        |
| Guides         | 5 images       | ~8 MB         | 200             | ~1.6 GB       |
| Dining         | 4 images       | ~6 MB         | 1,500           | ~9 GB         |
| Videos         | 1 thumbnail    | ~0.5 MB       | 500             | ~0.25 GB      |
| Classifieds    | 2 images       | ~3 MB         | 10,000          | ~30 GB        |
| Products       | 3 images       | ~5 MB         | 300             | ~1.5 GB       |
| Avatars        | 1 image        | ~0.5 MB       | 10,000          | ~5 GB         |
| **Total**      |                |               |                 | **~67 GB**    |

*Note: Cloudflare R2 charges $0.015/GB/month for storage, zero egress. Estimated monthly cost: ~$1.*

---

## CDN Delivery via Cloudflare

### CDN Configuration

```
CDN Delivery Architecture:

User (Browser/App)
       |
       | Request: https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_md.webp
       |
       v
+------------------+
| Cloudflare CDN   |
| (Edge PoP)       |
|                  |
| Cache Lookup:    |
| ├── HIT:  Return |  <-- 95%+ of image requests served from edge cache
| │   cached image |
| │   (cf-cache-   |
| │   status: HIT) |
| │                |
| └── MISS: Pull   |  <-- First request or after cache eviction
|     from R2      |
|     origin       |
+--------+---------+
         |
         v (on MISS only)
+------------------+
| Cloudflare R2    |
| (Origin)         |
|                  |
| Serve file with  |
| response headers:|
| Cache-Control:   |
|  public,         |
|  max-age=2592000 |
|  (30 days)       |
| Content-Type:    |
|  image/webp      |
+------------------+
```

### Cache Headers for Media

| File Type         | Cache-Control Header                       | CDN Edge TTL | Browser TTL |
| ----------------- | ------------------------------------------ | ------------ | ----------- |
| Image (variant)   | `public, max-age=2592000, immutable`       | 30 days      | 30 days     |
| Image (original)  | `public, max-age=2592000, immutable`       | 30 days      | 30 days     |
| Video thumbnail   | `public, max-age=2592000, immutable`       | 30 days      | 30 days     |
| PDF document      | `public, max-age=86400`                    | 1 day        | 1 day       |
| Static assets     | `public, max-age=31536000, immutable`      | 1 year       | 1 year      |

### Why `immutable`?

Since all media files use UUID-based filenames, the content at a given URL never changes. If an image is replaced, a new UUID is generated, and a new URL is created. This means:

- Files can be cached indefinitely (immutable)
- No need for cache busting or versioned URLs
- No conditional requests (If-Modified-Since) -- saves round trips
- Old files naturally become orphaned and are cleaned up

### Custom Domain Setup

```
cdn.iloveberlin.biz -> Cloudflare R2 Custom Domain
│
├── CNAME Record: cdn.iloveberlin.biz -> {account-id}.r2.dev (proxied)
├── SSL: Cloudflare Universal SSL (automatic)
├── R2 Custom Domain: Configured in R2 bucket settings
└── Public Access: Enabled via custom domain
```

### Image URL Examples

```
Thumbnail:  https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_thumb.webp
Small:      https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_sm.webp
Medium:     https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_md.webp
Large:      https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_lg.webp
Original:   https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}.jpg
```

---

## Media Metadata Tracking

### Media Entity (PostgreSQL)

```
Table: media

Column            Type          Constraints              Description
──────────────── ───────────── ────────────────────────  ─────────────────────────────
id                UUID          PK, DEFAULT uuid_v4()    Unique identifier
uploaderId        UUID          FK -> users.id, NOT NULL Who uploaded the file
originalFilename  VARCHAR(255)  NOT NULL                 Original filename from client
mimeType          VARCHAR(100)  NOT NULL                 MIME type (image/jpeg, etc.)
size              INTEGER       NOT NULL                 File size in bytes
context           VARCHAR(50)   NOT NULL                 Upload context (article, event, etc.)
storagePath       VARCHAR(500)  NOT NULL, UNIQUE         Full path in R2 bucket
status            ENUM          NOT NULL                 pending, processing, ready, error
width             INTEGER       NULLABLE                 Image width in pixels
height            INTEGER       NULLABLE                 Image height in pixels
variants          JSONB         NULLABLE                 Map of variant paths (see below)
blurhash          VARCHAR(100)  NULLABLE                 BlurHash placeholder string
alt               VARCHAR(500)  NULLABLE                 Alt text for accessibility
caption           VARCHAR(500)  NULLABLE                 Image caption
processingError   TEXT          NULLABLE                 Error message if processing failed
referencedBy      JSONB         NULLABLE                 Entities referencing this media
createdAt         TIMESTAMP     DEFAULT NOW()            Upload timestamp
updatedAt         TIMESTAMP     DEFAULT NOW()            Last update timestamp
deletedAt         TIMESTAMP     NULLABLE                 Soft delete timestamp
```

### Variants JSONB Structure

```json
{
  "thumbnail": {
    "path": "media/articles/2026/03/{uuid}_thumb.webp",
    "url": "https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_thumb.webp",
    "width": 150,
    "height": 150,
    "size": 8432,
    "format": "webp"
  },
  "small": {
    "path": "media/articles/2026/03/{uuid}_sm.webp",
    "url": "https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_sm.webp",
    "width": 400,
    "height": 300,
    "size": 24567,
    "format": "webp"
  },
  "medium": {
    "path": "media/articles/2026/03/{uuid}_md.webp",
    "url": "https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_md.webp",
    "width": 800,
    "height": 600,
    "size": 67890,
    "format": "webp"
  },
  "large": {
    "path": "media/articles/2026/03/{uuid}_lg.webp",
    "url": "https://cdn.iloveberlin.biz/media/articles/2026/03/{uuid}_lg.webp",
    "width": 1200,
    "height": 900,
    "size": 134567,
    "format": "webp"
  }
}
```

### BlurHash for Progressive Loading

```
BlurHash Generation:
├── Generated during image processing (Sharp + blurhash library)
├── Stored as compact string (e.g., "LGF5]+Yk^6#M@-5c,1J5@[or[Q6.")
├── Sent in API responses alongside image URLs
├── Client renders BlurHash as placeholder while image loads
└── Result: Smooth loading experience, no layout shift
```

---

## Cleanup and Orphan Detection

### Orphan Detection

An orphan is a media file stored in R2 that is not referenced by any content entity (article, event, user profile, etc.).

```
ORPHAN DETECTION FLOW (Scheduled: Weekly, Sunday 4 AM CET)

+------------------+       +------------------+       +------------------+
|   PostgreSQL     |       |  Cleanup Service |       |   Cloudflare R2  |
|                  |       |  (NestJS Cron)   |       |                  |
+--------+---------+       +--------+---------+       +--------+---------+
         |                          |                          |
         |                          |  1. Query all media      |
         |                          |  records with            |
         |                          |  status = 'ready'        |
         |                          |  AND no references       |
         |<-------------------------|                          |
         |                          |                          |
         |  All media IDs with      |                          |
         |  referenced_by IS NULL   |                          |
         |  or referenced_by = '[]' |                          |
         |------------------------->|                          |
         |                          |                          |
         |                          |  2. Check each orphan:   |
         |                          |  ├── Age > 24 hours?     |
         |                          |  │   (Allow time for     |
         |                          |  │    content creation)  |
         |                          |  │                       |
         |                          |  └── Not referenced by   |
         |                          |      any entity:         |
         |                          |      ├── articles.media_ids
         |                          |      ├── events.cover_image_id
         |                          |      ├── users.avatar_id |
         |                          |      ├── dining.media_ids|
         |                          |      ├── products.media_ids
         |                          |      └── etc.            |
         |                          |                          |
         |                          |  3. For confirmed        |
         |                          |  orphans:                |
         |                          |                          |
         |                          |  4. Delete all variants  |
         |                          |  from R2                 |
         |                          |------------------------->|
         |                          |                          |
         |                          |  5. Delete original      |
         |                          |  from R2                 |
         |                          |------------------------->|
         |                          |                          |
         |                          |  6. Soft-delete media    |
         |                          |  record in PostgreSQL    |
         |<-------------------------|                          |
         |                          |                          |
         |                          |  7. Log cleanup results: |
         |                          |  - Orphans found: 23     |
         |                          |  - Files deleted: 115    |
         |                          |  - Storage freed: 89 MB  |
         |                          |  - Errors: 0             |
```

### Pending Upload Cleanup

```
PENDING UPLOAD CLEANUP (Scheduled: Hourly)
│
├── Find media records where:
│   ├── status = 'pending'
│   └── createdAt < NOW() - INTERVAL '2 hours'
│
├── These are uploads where:
│   ├── Client requested presigned URL but never uploaded the file
│   ├── Client uploaded but never called /confirm
│   └── Client disconnected mid-upload
│
├── For each expired pending record:
│   ├── Attempt to delete the R2 object (may not exist)
│   ├── Hard-delete the media record from PostgreSQL
│   └── Log the cleanup
│
└── Expected volume: < 50 records per day
```

### Content Deletion Cascade

```
When content is deleted, its media references must be cleaned up:

Article Deleted
├── ArticleSubscriber detects delete event
├── For each media ID referenced by the article:
│   ├── Remove article from media.referencedBy
│   └── If referencedBy is now empty:
│       └── Media becomes an orphan (cleaned up by weekly job)
│
User Account Deleted
├── Soft-delete user
├── Remove avatar reference
├── User's uploaded media:
│   ├── Media referenced by published content: Keep (transfer to system user)
│   └── Media not referenced: Mark as orphan
```

### Manual Cleanup via Admin

```
Admin API Endpoints:
│
├── GET  /admin/media/orphans           # List orphaned media
├── GET  /admin/media/stats             # Storage statistics
│   Response: {
│     totalFiles: 45000,
│     totalSize: "67.2 GB",
│     orphanedFiles: 23,
│     orphanedSize: "89 MB",
│     pendingFiles: 5,
│     byContext: {
│       articles: { files: 15000, size: "22.1 GB" },
│       events: { files: 8000, size: "12.3 GB" },
│       ...
│     }
│   }
├── POST /admin/media/cleanup           # Trigger manual cleanup
└── DELETE /admin/media/:id             # Force-delete specific media
```

### Monitoring and Alerts

```
Media Pipeline Monitoring:
│
├── Metrics (Prometheus):
│   ├── media_uploads_total (context, status)
│   ├── media_processing_duration_seconds (histogram)
│   ├── media_processing_errors_total (error_type)
│   ├── media_storage_bytes (context)
│   ├── media_orphans_total
│   └── media_cleanup_files_deleted_total
│
├── Alerts:
│   ├── Processing error rate > 5%: Warning (Slack)
│   ├── Processing queue depth > 50: Warning (Slack)
│   ├── R2 storage > 100 GB: Info (Slack)
│   └── Orphan count > 500: Warning (Slack)
│
└── Dashboard (Grafana):
    ├── Uploads per day (by context)
    ├── Processing success rate
    ├── Average processing time
    ├── Storage growth trend
    └── Orphan count trend
```
