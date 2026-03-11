# Schema: Dining

> Domain: `dining`
> Tables: `cuisines`, `restaurants`, `restaurant_cuisines`, `restaurant_images`, `dining_offers`

---

## Overview

The dining domain covers Berlin's restaurant scene. Restaurants have multiple cuisines (M:N), a gallery of images, and promotional offers. The schema supports filtering by district, price range, cuisine, and rating. Opening hours are stored as JSONB for flexible schedule representation.

---

## Table: `cuisines`

Reference table for cuisine types. Used for filtering and browsing restaurants.

### SQL

```sql
CREATE TABLE cuisines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(60) NOT NULL,
  slug       VARCHAR(80) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(60) | NO | -- | Display name, e.g., "Vietnamese" |
| `slug` | VARCHAR(80) | NO | -- | URL slug, unique |
| `sort_order` | INTEGER | NO | `0` | Display ordering in filter lists |

### Indexes

```sql
-- Slug covered by UNIQUE constraint
-- Sort order for display
CREATE INDEX idx_cuisines_sort ON cuisines (sort_order);
```

### Design Decisions

- **Minimal table:** Cuisines are pure reference data with no timestamps, descriptions, or soft delete. They are seeded at deployment and rarely change.
- **Separate from categories:** Cuisines are specific to dining. Using the shared `categories` table would conflate content taxonomy with dining taxonomy.

---

## Table: `restaurants`

The main restaurant listing table. Each restaurant has a primary featured image, geolocation, and rich metadata.

### SQL

```sql
CREATE TYPE price_range AS ENUM ('budget', 'moderate', 'upscale', 'fine_dining');
CREATE TYPE restaurant_status AS ENUM ('draft', 'published', 'closed', 'archived');

CREATE TABLE restaurants (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(200) NOT NULL,
  slug               VARCHAR(220) NOT NULL,
  description        TEXT,
  address            VARCHAR(300) NOT NULL,
  district           VARCHAR(50),
  latitude           DECIMAL(9, 6),
  longitude          DECIMAL(9, 6),
  phone              VARCHAR(30),
  website            VARCHAR(500),
  email              VARCHAR(255),
  price_range        price_range,
  rating             DECIMAL(2, 1),
  opening_hours      JSONB DEFAULT '{}',
  featured_image_id  UUID,
  status             restaurant_status NOT NULL DEFAULT 'draft',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ,

  CONSTRAINT fk_restaurants_featured_image
    FOREIGN KEY (featured_image_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT chk_restaurants_rating
    CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  CONSTRAINT chk_restaurants_latitude
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  CONSTRAINT chk_restaurants_longitude
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180))
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(200) | NO | -- | Restaurant name |
| `slug` | VARCHAR(220) | NO | -- | URL slug |
| `description` | TEXT | YES | `NULL` | Full description, supports HTML/Markdown |
| `address` | VARCHAR(300) | NO | -- | Street address |
| `district` | VARCHAR(50) | YES | `NULL` | Berlin district (Bezirk) |
| `latitude` | DECIMAL(9,6) | YES | `NULL` | GPS latitude |
| `longitude` | DECIMAL(9,6) | YES | `NULL` | GPS longitude |
| `phone` | VARCHAR(30) | YES | `NULL` | Phone number |
| `website` | VARCHAR(500) | YES | `NULL` | Restaurant website |
| `email` | VARCHAR(255) | YES | `NULL` | Contact email |
| `price_range` | `price_range` | YES | `NULL` | Cost bracket |
| `rating` | DECIMAL(2,1) | YES | `NULL` | Editorial rating 0.0 to 5.0 (not user-generated) |
| `opening_hours` | JSONB | YES | `'{}'` | Structured opening hours (see shape below) |
| `featured_image_id` | UUID | YES | `NULL` | FK to `media` for the primary/hero image |
| `status` | `restaurant_status` | NO | `'draft'` | Publication state |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### JSONB Shape: `opening_hours`

```json
{
  "monday":    { "open": "11:00", "close": "22:00" },
  "tuesday":   { "open": "11:00", "close": "22:00" },
  "wednesday": { "open": "11:00", "close": "22:00" },
  "thursday":  { "open": "11:00", "close": "23:00" },
  "friday":    { "open": "11:00", "close": "00:00" },
  "saturday":  { "open": "10:00", "close": "00:00" },
  "sunday":    null
}
```

A `null` value means the restaurant is closed on that day. The application validates this structure before saving.

### Constraints & Indexes

```sql
-- Unique slug among active restaurants
CREATE UNIQUE INDEX uq_restaurants_slug_active
  ON restaurants (slug)
  WHERE deleted_at IS NULL;

-- Published restaurants list (main browse page)
CREATE INDEX idx_restaurants_published
  ON restaurants (name ASC)
  WHERE deleted_at IS NULL AND status = 'published';

-- Filter by district
CREATE INDEX idx_restaurants_district
  ON restaurants (district)
  WHERE deleted_at IS NULL AND status = 'published';

-- Filter by price range
CREATE INDEX idx_restaurants_price_range
  ON restaurants (price_range)
  WHERE deleted_at IS NULL AND status = 'published';

-- Top-rated restaurants
CREATE INDEX idx_restaurants_rating
  ON restaurants (rating DESC NULLS LAST)
  WHERE deleted_at IS NULL AND status = 'published';

-- Geolocation (map view)
CREATE INDEX idx_restaurants_geo
  ON restaurants (latitude, longitude)
  WHERE deleted_at IS NULL AND status = 'published'
    AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Name search (autocomplete)
CREATE INDEX idx_restaurants_name_trgm
  ON restaurants USING gin (name gin_trgm_ops);

-- Full-text search on name + description
CREATE INDEX idx_restaurants_fts
  ON restaurants USING gin (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  );

-- JSONB index on opening_hours for "open now" queries
-- Not indexed: "open now" logic is best handled in application code
-- by checking the current day's hours against the current time.
-- GIN on opening_hours would index keys/values but not support time comparisons.
```

---

## Table: `restaurant_cuisines`

Many-to-many join between restaurants and cuisines. A restaurant can serve multiple cuisines (e.g., "Japanese" and "Ramen").

### SQL

```sql
CREATE TABLE restaurant_cuisines (
  restaurant_id UUID NOT NULL,
  cuisine_id    UUID NOT NULL,

  PRIMARY KEY (restaurant_id, cuisine_id),

  CONSTRAINT fk_restaurant_cuisines_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE,
  CONSTRAINT fk_restaurant_cuisines_cuisine
    FOREIGN KEY (cuisine_id) REFERENCES cuisines (id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Reverse lookup: "all restaurants serving Vietnamese food"
CREATE INDEX idx_restaurant_cuisines_cuisine
  ON restaurant_cuisines (cuisine_id);
```

---

## Table: `restaurant_images`

Image gallery for restaurants. Each restaurant can have multiple images beyond the featured image.

### SQL

```sql
CREATE TABLE restaurant_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  media_id      UUID NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  caption       VARCHAR(255),

  CONSTRAINT fk_restaurant_images_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE,
  CONSTRAINT fk_restaurant_images_media
    FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE CASCADE
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `restaurant_id` | UUID | NO | -- | FK to `restaurants` |
| `media_id` | UUID | NO | -- | FK to `media` |
| `sort_order` | INTEGER | NO | `0` | Display order in the gallery |
| `caption` | VARCHAR(255) | YES | `NULL` | Image caption (e.g., "Interior view") |

### Indexes

```sql
-- Restaurant's gallery, ordered
CREATE INDEX idx_restaurant_images_restaurant
  ON restaurant_images (restaurant_id, sort_order);
```

### Design Decisions

- **CASCADE on both FKs:** Deleting a restaurant removes gallery entries. Deleting a media record removes the gallery reference (the image is gone, so the reference is meaningless).
- **Separate from `media` table:** `restaurant_images` is a bridge table that adds `sort_order` and `caption` context specific to the restaurant gallery.

---

## Table: `dining_offers`

Promotional offers and deals from restaurants. Time-limited, with an active flag for quick toggling.

### SQL

```sql
CREATE TABLE dining_offers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_dining_offers_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE,
  CONSTRAINT chk_dining_offers_dates
    CHECK (end_date >= start_date)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `restaurant_id` | UUID | NO | -- | FK to `restaurants` |
| `title` | VARCHAR(200) | NO | -- | Offer headline, e.g., "Happy Hour: 2-for-1 Cocktails" |
| `description` | TEXT | YES | `NULL` | Offer details and fine print |
| `start_date` | DATE | NO | -- | Offer start date |
| `end_date` | DATE | NO | -- | Offer end date |
| `is_active` | BOOLEAN | NO | `TRUE` | Manual toggle; allows deactivating before end_date |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |

### Indexes

```sql
-- Active current offers (homepage widget, restaurant detail page)
CREATE INDEX idx_dining_offers_active
  ON dining_offers (restaurant_id, start_date, end_date)
  WHERE is_active = TRUE;
-- Rationale: Query pattern is "active offers for restaurant X where
-- start_date <= today AND end_date >= today."

-- All active offers sorted by date (offers listing page)
CREATE INDEX idx_dining_offers_current
  ON dining_offers (end_date ASC)
  WHERE is_active = TRUE;
```

### Design Decisions

1. **No soft delete:** Offers are time-limited. Expired offers are kept for historical reference but are simply filtered out by date. The `is_active` flag allows manual deactivation.
2. **No `updated_at`:** Offers are typically created once and not edited. If editing becomes common, `updated_at` can be added.
3. **CASCADE on restaurant delete:** If a restaurant is removed, its offers are meaningless and are deleted.

---

## Example Seed Data

```sql
-- Cuisines (~30)
INSERT INTO cuisines (id, name, slug, sort_order) VALUES
  ('50000000-0000-0000-0000-000000000001', 'German',         'german',          1),
  ('50000000-0000-0000-0000-000000000002', 'Turkish',        'turkish',         2),
  ('50000000-0000-0000-0000-000000000003', 'Vietnamese',     'vietnamese',      3),
  ('50000000-0000-0000-0000-000000000004', 'Italian',        'italian',         4),
  ('50000000-0000-0000-0000-000000000005', 'Japanese',       'japanese',        5),
  ('50000000-0000-0000-0000-000000000006', 'Chinese',        'chinese',         6),
  ('50000000-0000-0000-0000-000000000007', 'Indian',         'indian',          7),
  ('50000000-0000-0000-0000-000000000008', 'Thai',           'thai',            8),
  ('50000000-0000-0000-0000-000000000009', 'Mexican',        'mexican',         9),
  ('50000000-0000-0000-0000-000000000010', 'Korean',         'korean',         10),
  ('50000000-0000-0000-0000-000000000011', 'Lebanese',       'lebanese',       11),
  ('50000000-0000-0000-0000-000000000012', 'Greek',          'greek',          12),
  ('50000000-0000-0000-0000-000000000013', 'French',         'french',         13),
  ('50000000-0000-0000-0000-000000000014', 'Spanish',        'spanish',        14),
  ('50000000-0000-0000-0000-000000000015', 'American',       'american',       15),
  ('50000000-0000-0000-0000-000000000016', 'Ethiopian',      'ethiopian',      16),
  ('50000000-0000-0000-0000-000000000017', 'Georgian',       'georgian',       17),
  ('50000000-0000-0000-0000-000000000018', 'Persian',        'persian',        18),
  ('50000000-0000-0000-0000-000000000019', 'Israeli',        'israeli',        19),
  ('50000000-0000-0000-0000-000000000020', 'Vegan',          'vegan',          20),
  ('50000000-0000-0000-0000-000000000021', 'Vegetarian',     'vegetarian',     21),
  ('50000000-0000-0000-0000-000000000022', 'Seafood',        'seafood',        22),
  ('50000000-0000-0000-0000-000000000023', 'Pizza',          'pizza',          23),
  ('50000000-0000-0000-0000-000000000024', 'Burger',         'burger',         24),
  ('50000000-0000-0000-0000-000000000025', 'Ramen',          'ramen',          25),
  ('50000000-0000-0000-0000-000000000026', 'Sushi',          'sushi',          26),
  ('50000000-0000-0000-0000-000000000027', 'Brunch',         'brunch',         27),
  ('50000000-0000-0000-0000-000000000028', 'Cafe',           'cafe',           28),
  ('50000000-0000-0000-0000-000000000029', 'Street Food',    'street-food',    29),
  ('50000000-0000-0000-0000-000000000030', 'Fine Dining',    'fine-dining',    30);

-- Sample restaurants
INSERT INTO restaurants (
  id, name, slug, description, address, district,
  latitude, longitude, phone, website, email,
  price_range, rating, opening_hours, status
) VALUES
(
  'a1234567-1234-1234-1234-123456789abc',
  'Mustafas Gemuese Kebap',
  'mustafas-gemuese-kebap',
  'Berlin''s most famous kebab stand, known for its legendary vegetable kebab with grilled vegetables and secret sauce. Be prepared to queue!',
  'Mehringdamm 32, 10961 Berlin',
  'Kreuzberg',
  52.493889,
  13.388056,
  '+49 30 12345678',
  'https://mustafas.de',
  'info@mustafas.de',
  'budget',
  4.5,
  '{
    "monday":    {"open": "10:00", "close": "02:00"},
    "tuesday":   {"open": "10:00", "close": "02:00"},
    "wednesday": {"open": "10:00", "close": "02:00"},
    "thursday":  {"open": "10:00", "close": "03:00"},
    "friday":    {"open": "10:00", "close": "05:00"},
    "saturday":  {"open": "10:00", "close": "05:00"},
    "sunday":    {"open": "11:00", "close": "02:00"}
  }',
  'published'
),
(
  'a1234567-1234-1234-1234-123456789abd',
  'CODA Dessert Dining',
  'coda-dessert-dining',
  'Two Michelin-starred dessert restaurant by chef Rene Frank, offering a unique multi-course dessert-focused tasting menu.',
  'Friedelstrasse 47, 12047 Berlin',
  'Neukolln',
  52.487500,
  13.432778,
  '+49 30 91496396',
  'https://coda-berlin.com',
  'reservations@coda-berlin.com',
  'fine_dining',
  4.8,
  '{
    "monday":    null,
    "tuesday":   null,
    "wednesday": {"open": "19:00", "close": "23:00"},
    "thursday":  {"open": "19:00", "close": "23:00"},
    "friday":    {"open": "19:00", "close": "00:00"},
    "saturday":  {"open": "19:00", "close": "00:00"},
    "sunday":    null
  }',
  'published'
);

-- Restaurant-cuisine associations
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id) VALUES
  ('a1234567-1234-1234-1234-123456789abc', '50000000-0000-0000-0000-000000000002'),  -- Turkish
  ('a1234567-1234-1234-1234-123456789abc', '50000000-0000-0000-0000-000000000029'),  -- Street Food
  ('a1234567-1234-1234-1234-123456789abd', '50000000-0000-0000-0000-000000000030');  -- Fine Dining

-- Dining offer
INSERT INTO dining_offers (id, restaurant_id, title, description, start_date, end_date) VALUES
(
  '51000000-0000-0000-0000-000000000001',
  'a1234567-1234-1234-1234-123456789abd',
  'Weekday Pairing Menu Special',
  'Book the Wednesday or Thursday tasting menu and receive a complimentary wine pairing upgrade. Valid for reservations made through ILoveBerlin.',
  '2026-03-01',
  '2026-04-30'
);
```
