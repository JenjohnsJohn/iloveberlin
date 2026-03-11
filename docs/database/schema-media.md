# Schema: Media

> Domain: `media`
> Tables: `media`

---

## Overview

A centralized media library for all uploaded files (images, documents). The `media` table stores metadata and URLs for multiple image sizes (responsive images). Files are stored in external object storage (e.g., AWS S3, Cloudflare R2) with `storage_key` referencing the object path. The `url` fields contain CDN-served public URLs.

Many tables reference `media` via `featured_image_id`, `thumbnail_id`, or through bridge tables (`restaurant_images`, `product_images`, `classified_images`).

---

## Table: `media`

### SQL

```sql
CREATE TABLE media (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename          VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type         VARCHAR(100) NOT NULL,
  size_bytes        INTEGER NOT NULL,
  storage_key       VARCHAR(500) NOT NULL UNIQUE,
  url               VARCHAR(500) NOT NULL,
  thumbnail_url     VARCHAR(500),
  small_url         VARCHAR(500),
  medium_url        VARCHAR(500),
  large_url         VARCHAR(500),
  width             INTEGER,
  height            INTEGER,
  alt_text          VARCHAR(300),
  uploaded_by       UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT fk_media_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_media_size
    CHECK (size_bytes > 0),
  CONSTRAINT chk_media_dimensions
    CHECK (
      (width IS NULL AND height IS NULL)
      OR (width > 0 AND height > 0)
    )
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `filename` | VARCHAR(255) | NO | -- | Stored filename (UUID-based to avoid collisions), e.g., `a1b2c3d4.jpg` |
| `original_filename` | VARCHAR(255) | NO | -- | User's original filename, e.g., `berlin-sunset-photo.jpg` |
| `mime_type` | VARCHAR(100) | NO | -- | MIME type, e.g., `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |
| `size_bytes` | INTEGER | NO | -- | File size in bytes |
| `storage_key` | VARCHAR(500) | NO | -- | Object storage path, e.g., `uploads/2026/03/a1b2c3d4.jpg` |
| `url` | VARCHAR(500) | NO | -- | Full-size image CDN URL |
| `thumbnail_url` | VARCHAR(500) | YES | `NULL` | Thumbnail (150x150 crop) |
| `small_url` | VARCHAR(500) | YES | `NULL` | Small size (320px wide) |
| `medium_url` | VARCHAR(500) | YES | `NULL` | Medium size (768px wide) |
| `large_url` | VARCHAR(500) | YES | `NULL` | Large size (1280px wide) |
| `width` | INTEGER | YES | `NULL` | Original image width in pixels |
| `height` | INTEGER | YES | `NULL` | Original image height in pixels |
| `alt_text` | VARCHAR(300) | YES | `NULL` | Accessibility alt text for `<img alt="">` |
| `uploaded_by` | UUID | YES | `NULL` | FK to `users` -- who uploaded it |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Upload timestamp |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Constraints & Indexes

```sql
-- storage_key is already UNIQUE (implicit B-tree index)

-- Files by uploader (admin: "show me what this user uploaded")
CREATE INDEX idx_media_uploaded_by
  ON media (uploaded_by, created_at DESC)
  WHERE deleted_at IS NULL;

-- MIME type filtering (admin: "show all PDFs")
CREATE INDEX idx_media_mime_type
  ON media (mime_type)
  WHERE deleted_at IS NULL;

-- Recent uploads (media library browsing)
CREATE INDEX idx_media_created_at
  ON media (created_at DESC)
  WHERE deleted_at IS NULL;

-- Original filename search (admin: "find the file I uploaded")
CREATE INDEX idx_media_original_filename_trgm
  ON media USING gin (original_filename gin_trgm_ops);
-- Rationale: Editors search for files by the name they uploaded.
-- Trigram index supports partial matching.
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `uploaded_by` | `users(id)` | SET NULL | Files persist even if the uploader's account is deleted |

### Design Decisions

1. **Multiple URL columns vs. computed URLs:**
   - Storing pre-computed URLs for each size (`thumbnail_url`, `small_url`, etc.) avoids runtime string manipulation and allows each size to potentially live on a different CDN or storage path.
   - **Alternative:** Store only `storage_key` and compute URLs at runtime from a base CDN URL + size suffix. This is simpler but less flexible.
   - **Chosen approach:** Pre-computed URLs. The upload service generates all sizes and records the URLs.

2. **No `updated_at`:** Media files are immutable after upload. To "replace" an image, a new media record is created and the reference is updated on the parent entity. The old media record can be soft-deleted.

3. **Soft delete:** Media may be referenced by multiple entities. Soft deleting (rather than hard deleting) prevents broken references. A periodic cleanup job hard-deletes media where `deleted_at` is older than 30 days and no active references exist.

4. **`storage_key` uniqueness:** Ensures no two records point to the same file in object storage. The upload service generates keys using `uploads/{year}/{month}/{uuid}.{ext}` format.

5. **`size_bytes` as INTEGER:** Supports files up to ~2 GB. For video files (if self-hosted in the future), this would need to be `BIGINT`. Current limit is acceptable for images and documents.

6. **No folder/collection system:** Media are organized by association (which article/restaurant they belong to), not by folders. The admin media library provides flat browsing with search and filters. A folder system could be added later via a `media_folders` table.

### Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| **Pre-computed URLs** | No runtime computation, CDN flexibility | More storage, must update on CDN migration |
| **Computed URLs** | Less storage, easy CDN migration | Runtime overhead, less flexibility |
| **Soft delete** | Prevents broken references | Orphaned files in object storage |
| **Hard delete** | Clean storage | Broken image references across content |

### Responsive Image Integration

The multiple URL columns map directly to HTML `<picture>` / `srcset` attributes:

```html
<picture>
  <source media="(max-width: 320px)" srcset="{{ small_url }}">
  <source media="(max-width: 768px)" srcset="{{ medium_url }}">
  <source media="(max-width: 1280px)" srcset="{{ large_url }}">
  <img src="{{ url }}" alt="{{ alt_text }}" width="{{ width }}" height="{{ height }}">
</picture>
```

### Image Processing Pipeline

On upload, the application:
1. Validates MIME type and file size (max 10 MB for images).
2. Uploads the original to object storage.
3. Generates resized versions (thumbnail: 150x150 crop, small: 320w, medium: 768w, large: 1280w).
4. Converts to WebP where supported.
5. Uploads resized versions to object storage.
6. Inserts the `media` record with all URLs.

---

## TypeORM Entity

```typescript
// src/modules/media/entities/media.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 255 })
  original_filename: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type: string;

  @Column({ type: 'int' })
  size_bytes: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  storage_key: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  small_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  medium_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  large_url: string | null;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  alt_text: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;
}
```

---

## Example Seed Data

```sql
INSERT INTO media (
  id, filename, original_filename, mime_type, size_bytes,
  storage_key, url, thumbnail_url, small_url, medium_url, large_url,
  width, height, alt_text, uploaded_by
) VALUES
(
  'f0000000-0000-0000-0000-000000000001',
  'a1b2c3d4-street-art.jpg',
  'berlin-street-art-kreuzberg.jpg',
  'image/jpeg',
  2456789,
  'uploads/2026/03/a1b2c3d4-street-art.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/03/a1b2c3d4-street-art.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/03/a1b2c3d4-street-art_thumb.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/03/a1b2c3d4-street-art_320.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/03/a1b2c3d4-street-art_768.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/03/a1b2c3d4-street-art_1280.jpg',
  3840,
  2560,
  'Colorful street art mural on a brick wall in Kreuzberg, Berlin',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
),
(
  'f0000000-0000-0000-0000-000000000002',
  'e5f6g7h8-festival.jpg',
  'festival-of-lights-2025.jpg',
  'image/jpeg',
  1823456,
  'uploads/2026/02/e5f6g7h8-festival.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/02/e5f6g7h8-festival.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/02/e5f6g7h8-festival_thumb.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/02/e5f6g7h8-festival_320.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/02/e5f6g7h8-festival_768.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/02/e5f6g7h8-festival_1280.jpg',
  4000,
  3000,
  'Berlin Cathedral illuminated during the Festival of Lights',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
),
(
  'f0000000-0000-0000-0000-000000000003',
  'i9j0k1l2-tshirt.jpg',
  'iloveberlin-tshirt-product.jpg',
  'image/jpeg',
  987654,
  'uploads/2026/01/i9j0k1l2-tshirt.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/01/i9j0k1l2-tshirt.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/01/i9j0k1l2-tshirt_thumb.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/01/i9j0k1l2-tshirt_320.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/01/i9j0k1l2-tshirt_768.jpg',
  'https://cdn.iloveberlin.biz/uploads/2026/01/i9j0k1l2-tshirt_1280.jpg',
  2000,
  2000,
  'ILoveBerlin classic T-shirt in black, folded flat lay',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);
```
