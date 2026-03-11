# Schema: Guides

> Domain: `guides`
> Tables: `guide_topics`, `guides`

---

## Overview

Guides are long-form, evergreen content distinct from articles. They cover practical topics for expats and newcomers (visa, housing, healthcare, etc.) and are organized by topic rather than by news category. Guides have a `last_reviewed_at` field to track editorial freshness -- critical for relocation advice that may change with German regulations.

---

## Table: `guide_topics`

Taxonomy for guide content. Each topic groups related guides (e.g., "Visa & Immigration" contains guides on Blue Card, freelancer visa, family reunion).

### SQL

```sql
CREATE TABLE guide_topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(50),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(100) | NO | -- | Display name, e.g., "Visa & Immigration" |
| `slug` | VARCHAR(120) | NO | -- | URL slug, unique |
| `description` | TEXT | YES | `NULL` | Topic description for the topic landing page |
| `icon` | VARCHAR(50) | YES | `NULL` | Icon identifier (e.g., "passport", "home", "heart") for UI rendering |
| `sort_order` | INTEGER | NO | `0` | Display ordering on the guides index page |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |

### Indexes

```sql
-- Slug is covered by the UNIQUE constraint (implicit B-tree)

-- Ordered listing
CREATE INDEX idx_guide_topics_sort
  ON guide_topics (sort_order);
```

### Design Decisions

- **No `updated_at` / `deleted_at`:** Topics are reference data managed by admins. They are created, occasionally renamed, and rarely deleted. If a topic is removed, its guides are reassigned or orphaned (SET NULL on the FK).
- **Flat structure:** Unlike categories, guide topics are not hierarchical. A single level of topics keeps navigation simple for the relocation guide use case.

---

## Table: `guides`

Long-form guides for living in Berlin. Each guide belongs to a topic and follows the same publication workflow as articles (draft -> in_review -> published).

### SQL

```sql
CREATE TYPE guide_status AS ENUM ('draft', 'in_review', 'published', 'archived');

CREATE TABLE guides (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id           UUID,
  title              VARCHAR(255) NOT NULL,
  slug               VARCHAR(280) NOT NULL,
  body               TEXT NOT NULL,
  excerpt            TEXT,
  featured_image_id  UUID,
  author_id          UUID,
  status             guide_status NOT NULL DEFAULT 'draft',
  last_reviewed_at   TIMESTAMPTZ,
  seo_title          VARCHAR(70),
  seo_description    VARCHAR(160),
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ,

  CONSTRAINT fk_guides_topic
    FOREIGN KEY (topic_id) REFERENCES guide_topics (id) ON DELETE SET NULL,
  CONSTRAINT fk_guides_featured_image
    FOREIGN KEY (featured_image_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_guides_author
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `topic_id` | UUID | YES | `NULL` | FK to `guide_topics`. NULL if topic was deleted |
| `title` | VARCHAR(255) | NO | -- | Guide title, e.g., "How to Get a Blue Card in Germany" |
| `slug` | VARCHAR(280) | NO | -- | URL slug, unique among non-deleted guides |
| `body` | TEXT | NO | -- | Full content in HTML or Markdown |
| `excerpt` | TEXT | YES | `NULL` | Summary for cards and search results |
| `featured_image_id` | UUID | YES | `NULL` | FK to `media` table |
| `author_id` | UUID | YES | `NULL` | FK to `users` |
| `status` | `guide_status` | NO | `'draft'` | Publication state |
| `last_reviewed_at` | TIMESTAMPTZ | YES | `NULL` | When the guide was last reviewed for accuracy |
| `seo_title` | VARCHAR(70) | YES | `NULL` | Custom title for search engines |
| `seo_description` | VARCHAR(160) | YES | `NULL` | Meta description |
| `published_at` | TIMESTAMPTZ | YES | `NULL` | Publication timestamp |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Constraints & Indexes

```sql
-- Unique slug among active guides
CREATE UNIQUE INDEX uq_guides_slug_active
  ON guides (slug)
  WHERE deleted_at IS NULL;

-- Published guides by topic (topic landing page)
CREATE INDEX idx_guides_topic_published
  ON guides (topic_id, published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';
-- Rationale: "Show all published guides under Visa & Immigration, newest first."

-- All published guides (guides index page)
CREATE INDEX idx_guides_published
  ON guides (published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Stale content report: guides not reviewed in > 6 months
CREATE INDEX idx_guides_last_reviewed
  ON guides (last_reviewed_at ASC NULLS FIRST)
  WHERE deleted_at IS NULL AND status = 'published';
-- Rationale: Admin dashboard shows guides that need editorial review.
-- NULLS FIRST surfaces guides that have never been reviewed.

-- Author's guides
CREATE INDEX idx_guides_author
  ON guides (author_id, published_at DESC)
  WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_guides_fts
  ON guides USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  );
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `topic_id` | `guide_topics(id)` | SET NULL | Topic removal orphans guides, admin reassigns |
| `featured_image_id` | `media(id)` | SET NULL | Image deletion doesn't affect guide |
| `author_id` | `users(id)` | SET NULL | Author removal preserves guide content |

### Design Decisions

1. **Separate from articles:** Guides have different lifecycle characteristics:
   - Articles are time-sensitive news; guides are evergreen reference content.
   - Guides need `last_reviewed_at` for editorial freshness tracking.
   - Guides use `guide_topics` (flat taxonomy) rather than `categories` (hierarchical, shared).
   - Separate tables allow different admin workflows (e.g., guides require periodic review, articles do not).

2. **`last_reviewed_at` field:** Berlin regulations (visa rules, Anmeldung process, health insurance requirements) change periodically. The editorial team sets a review schedule, and the admin dashboard flags guides where `last_reviewed_at` is older than 6 months or NULL.

3. **No tags on guides:** Unlike articles, guides are purely topic-based. Tags would add complexity without clear benefit for this content type. If needed later, a `guide_tags` join table can be added.

4. **No `view_count`:** Analytics for guides are tracked externally (e.g., Google Analytics, Plausible). Articles have inline view counts for "trending" features; guides do not have this UI requirement.

### Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| **Separate guides table** | Tailored schema, independent workflows | Some field duplication with articles |
| **Merged with articles + `is_guide` flag** | Single table, less duplication | Mixed query patterns, bloated status logic |
| **No tags** | Simpler schema | Less discoverability via tag browsing |

---

## TypeORM Entities

### GuideTopic Entity

```typescript
// src/modules/guides/entities/guide-topic.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, OneToMany,
} from 'typeorm';

@Entity('guide_topics')
export class GuideTopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => Guide, (guide) => guide.topic)
  guides: Guide[];
}
```

### Guide Entity

```typescript
// src/modules/guides/entities/guide.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';

export enum GuideStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('guides')
export class Guide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  topic_id: string | null;

  @ManyToOne(() => GuideTopic, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'topic_id' })
  topic: GuideTopic;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 280 })
  slug: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column({ type: 'uuid', nullable: true })
  featured_image_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  author_id: string | null;

  @Column({ type: 'enum', enum: GuideStatus, default: GuideStatus.DRAFT })
  status: GuideStatus;

  @Column({ type: 'timestamptz', nullable: true })
  last_reviewed_at: Date | null;

  @Column({ type: 'varchar', length: 70, nullable: true })
  seo_title: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  seo_description: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;
}
```

---

## Example Seed Data

```sql
-- Guide Topics
INSERT INTO guide_topics (id, name, slug, description, icon, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Visa & Immigration',  'visa-immigration',  'Everything you need to know about German visas, residence permits, and immigration.',   'passport',   1),
  ('30000000-0000-0000-0000-000000000002', 'Housing',             'housing',            'Finding an apartment in Berlin: tips, legal rights, and neighborhoods.',                'home',       2),
  ('30000000-0000-0000-0000-000000000003', 'Healthcare',          'healthcare',         'Navigating the German healthcare system, insurance, and finding doctors.',              'heart',      3),
  ('30000000-0000-0000-0000-000000000004', 'Finance & Banking',   'finance-banking',    'Opening a bank account, taxes, and managing finances in Germany.',                     'bank',       4),
  ('30000000-0000-0000-0000-000000000005', 'Working in Berlin',   'working-in-berlin',  'Job market, freelancing, co-working spaces, and employment law.',                     'briefcase',  5),
  ('30000000-0000-0000-0000-000000000006', 'Education',           'education',          'Schools, universities, language courses, and continuing education.',                   'graduation', 6),
  ('30000000-0000-0000-0000-000000000007', 'Transport',           'transport',          'Getting around Berlin: BVG, cycling, car sharing, and more.',                         'train',      7),
  ('30000000-0000-0000-0000-000000000008', 'Settling In',         'settling-in',        'Anmeldung, phone contracts, internet, and essential first steps.',                    'checklist',  8);

-- Sample Guide
INSERT INTO guides (
  id, topic_id, title, slug, body, excerpt, author_id,
  status, published_at, last_reviewed_at,
  seo_title, seo_description
) VALUES (
  '31000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',  -- Visa & Immigration
  'How to Get a Blue Card in Germany (2026 Guide)',
  'blue-card-germany-guide-2026',
  '<h2>What is the EU Blue Card?</h2>
   <p>The EU Blue Card is a residence permit for highly qualified non-EU nationals...</p>
   <h2>Eligibility Requirements</h2>
   <p>To qualify for a Blue Card in Germany, you need:</p>
   <ul>
     <li>A recognized university degree</li>
     <li>A job offer or binding employment contract</li>
     <li>A minimum annual gross salary of EUR 45,300 (2026 threshold) for shortage occupations...</li>
   </ul>',
  'Complete guide to obtaining an EU Blue Card in Germany, including requirements, application process, and timeline.',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',  -- Editor
  'published',
  '2026-01-15 09:00:00+01',
  '2026-03-01 14:00:00+01',
  'EU Blue Card Germany 2026 | Complete Guide | ILoveBerlin',
  'Everything you need to know about getting an EU Blue Card in Germany: requirements, salary thresholds, documents, and step-by-step process.'
),
(
  '31000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000002',  -- Housing
  'Finding an Apartment in Berlin: The Complete Guide',
  'finding-apartment-berlin-complete-guide',
  '<h2>The Berlin Housing Market</h2>
   <p>Berlin''s rental market is notoriously competitive...</p>
   <h2>Where to Search</h2>
   <p>The main platforms for apartment searches in Berlin are:</p>
   <ul>
     <li>WG-Gesucht (for shared apartments / WGs)</li>
     <li>ImmobilienScout24 (for standalone apartments)</li>
     <li>eBay Kleinanzeigen (informal listings)</li>
   </ul>',
  'A comprehensive guide to finding and securing a rental apartment in Berlin, from neighborhood picks to application tips.',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'published',
  '2026-02-01 10:00:00+01',
  '2026-02-28 16:30:00+01',
  'Finding an Apartment in Berlin 2026 | ILoveBerlin',
  'How to find a flat in Berlin: best websites, documents you need, tips for beating the competition, and neighborhood guide.'
);
```
