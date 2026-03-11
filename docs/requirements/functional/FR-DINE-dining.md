# FR-DINE: Dining

**Module:** Dining
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft
**Owner:** Platform Engineering

---

## 1. Overview

This document defines the functional requirements for the Dining module of the ILoveBerlin platform. The Dining section enables discovery and management of restaurants across Berlin, supporting cuisine-based and district-based filtering, price ranges, user ratings, opening hours, image galleries, dining offers, article-linked reviews, geocoded map display, and bookmarking.

---

## 2. User Stories References

| Story ID | Title |
|----------|-------|
| US-DINE-001 | As a visitor, I want to browse restaurants by cuisine type so I can find food I enjoy |
| US-DINE-002 | As a visitor, I want to filter restaurants by district and price range |
| US-DINE-003 | As a visitor, I want to see restaurant ratings so I can choose quality dining |
| US-DINE-004 | As a visitor, I want to see opening hours so I know when a restaurant is open |
| US-DINE-005 | As a visitor, I want to view restaurant photo galleries |
| US-DINE-006 | As a visitor, I want to see current dining offers and deals |
| US-DINE-007 | As a visitor, I want to read editorial reviews of restaurants |
| US-DINE-008 | As a user, I want to bookmark restaurants for later |
| US-DINE-009 | As a visitor, I want to see restaurants on a map |
| US-DINE-010 | As an editor, I want to create and manage restaurant listings |
| US-DINE-011 | As an editor, I want to create time-limited dining offers for restaurants |
| US-DINE-012 | As a visitor, I want to search for restaurants by name or cuisine |

---

## 3. Functional Requirements

### 3.1 Restaurant CRUD

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-001 | Users with `editor`+ roles SHALL be able to create restaurant listings | Must |
| FR-DINE-002 | The system SHALL require the following fields for restaurant creation: name, street address, district, postal code, and at least one cuisine type | Must |
| FR-DINE-003 | The system SHALL support the following optional fields: description, phone number, email, website URL, reservation URL, price range, featured image, opening hours, and social media links | Must |
| FR-DINE-004 | Users with `editor`+ roles SHALL be able to edit restaurant listings | Must |
| FR-DINE-005 | Users with `editor`+ roles SHALL be able to soft-delete restaurant listings | Must |
| FR-DINE-006 | Users with `admin`+ roles SHALL be able to permanently delete restaurant listings | Should |
| FR-DINE-007 | The system SHALL auto-generate a URL-safe slug from the restaurant name | Must |
| FR-DINE-008 | The system SHALL ensure slug uniqueness by appending a district slug or numeric suffix if a duplicate exists | Must |
| FR-DINE-009 | Each restaurant SHALL have a status: `draft`, `published`, `archived` | Must |

### 3.2 Cuisines

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-010 | The system SHALL support approximately 30 cuisine types including but not limited to: German, Turkish, Italian, Vietnamese, Indian, Thai, Japanese, Chinese, Korean, Mexican, Greek, Lebanese, Ethiopian, American, French, Spanish, Brazilian, Russian, Polish, Persian, Sushi, Pizza, Burger, Vegan, Vegetarian, Street Food, Bakery & Cafe, Seafood, BBQ & Grill, International | Must |
| FR-DINE-011 | Each restaurant SHALL be assigned one or more cuisine types (maximum 5) | Must |
| FR-DINE-012 | Each cuisine type SHALL have: a name, slug, icon/emoji, and a description | Must |
| FR-DINE-013 | Admin users SHALL be able to create, edit, and deactivate cuisine types | Must |
| FR-DINE-014 | Each cuisine type SHALL have a dedicated listing page showing restaurants of that cuisine | Must |
| FR-DINE-015 | The system SHALL maintain a cached restaurant count per cuisine type | Should |

### 3.3 Districts

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-016 | Each restaurant SHALL be associated with exactly one Berlin district (same district table as Events module) | Must |
| FR-DINE-017 | Users SHALL be able to filter restaurants by district | Must |
| FR-DINE-018 | Each district SHALL have a dining listing page showing restaurants in that area | Should |

### 3.4 Price Ranges

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-019 | The system SHALL support 4 price range tiers: `$` (budget, under 10 EUR), `$$` (moderate, 10-25 EUR), `$$$` (upscale, 25-50 EUR), `$$$$` (fine dining, over 50 EUR) | Must |
| FR-DINE-020 | Each restaurant SHALL optionally have a price range indicator | Must |
| FR-DINE-021 | Users SHALL be able to filter restaurants by one or more price ranges | Must |

### 3.5 Ratings

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-022 | The system SHALL support an editorial rating for each restaurant on a scale of 1.0 to 5.0 (half-point increments: 1.0, 1.5, 2.0, ..., 5.0) | Must |
| FR-DINE-023 | The editorial rating SHALL be set by users with `editor`+ roles | Must |
| FR-DINE-024 | The system SHALL display the rating as a star visualization (filled, half-filled, and empty stars) | Must |
| FR-DINE-025 | The system SHALL support user community ratings: authenticated users SHALL be able to rate a restaurant on a scale of 1 to 5 (whole numbers) | Should |
| FR-DINE-026 | Each user SHALL be allowed only one rating per restaurant; submitting a new rating SHALL replace the previous one | Must |
| FR-DINE-027 | The system SHALL calculate and cache the average community rating and total number of ratings for each restaurant | Must |
| FR-DINE-028 | The system SHALL display both the editorial rating and the average community rating (if available) on the restaurant detail page | Must |
| FR-DINE-029 | Users SHALL be able to sort restaurants by editorial rating or community rating | Should |
| FR-DINE-030 | The system SHALL require a minimum of 3 community ratings before displaying the average community rating publicly | Should |

### 3.6 Opening Hours

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-031 | The system SHALL store structured opening hours for each day of the week (Monday through Sunday) | Must |
| FR-DINE-032 | Each day's opening hours SHALL support: open time, close time, and a closed indicator | Must |
| FR-DINE-033 | The system SHALL support multiple opening periods per day (e.g., lunch 11:30-14:30, dinner 18:00-23:00) | Must |
| FR-DINE-034 | The system SHALL support overnight hours (e.g., 22:00-04:00) | Should |
| FR-DINE-035 | The system SHALL calculate and display the restaurant's current open/closed status based on the stored hours and the current time in Europe/Berlin timezone | Must |
| FR-DINE-036 | The open/closed status SHALL be calculated client-side to avoid server-side timezone issues and ensure real-time accuracy | Should |
| FR-DINE-037 | The system SHALL support special hours (e.g., holiday closures, seasonal changes) with a date range and override hours | Should |
| FR-DINE-038 | Users SHALL be able to filter restaurants to show only those currently open | Should |

### 3.7 Image Galleries

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-039 | Each restaurant SHALL support an image gallery of up to 20 images | Must |
| FR-DINE-040 | Each gallery image SHALL have: a file, alt text, caption, display order, and an `is_featured` flag | Must |
| FR-DINE-041 | The system SHALL accept images in JPEG, PNG, and WebP format with a maximum file size of 10 MB per image | Must |
| FR-DINE-042 | The system SHALL generate responsive image variants upon upload: original, large (1200px), medium (800px), small (400px), and thumbnail (200px) | Must |
| FR-DINE-043 | The system SHALL store gallery images in Cloudflare R2 under the path `media/restaurants/{restaurant_id}/gallery/{filename}` | Must |
| FR-DINE-044 | The restaurant detail page SHALL display the gallery in a lightbox/carousel format | Must |
| FR-DINE-045 | The image marked as `is_featured` SHALL be used as the restaurant's primary image in listings and cards | Must |
| FR-DINE-046 | If no image is marked as featured, the first image in display order SHALL be used | Must |

### 3.8 Dining Offers

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-047 | The system SHALL support time-limited dining offers (deals/promotions) for restaurants | Must |
| FR-DINE-048 | Each dining offer SHALL have: title, description, discount type (percentage, fixed amount, or descriptive), start date, end date, and terms/conditions | Must |
| FR-DINE-049 | A dining offer SHALL only be displayed when the current date falls between its start date and end date (inclusive) | Must |
| FR-DINE-050 | A restaurant MAY have multiple concurrent active offers | Must |
| FR-DINE-051 | The system SHALL display an "Offer" badge on restaurant cards that have at least one active offer | Must |
| FR-DINE-052 | The system SHALL display active offers prominently on the restaurant detail page, above the main description | Must |
| FR-DINE-053 | Users with `editor`+ roles SHALL be able to create, edit, and delete dining offers | Must |
| FR-DINE-054 | The system SHALL automatically stop displaying offers after their end date, without manual intervention | Must |
| FR-DINE-055 | Users SHALL be able to filter the restaurant listing to show only restaurants with active offers | Should |
| FR-DINE-056 | The system SHALL provide a dedicated "Dining Offers" page listing all active offers across all restaurants | Should |

### 3.9 Reviews (Linked to Articles)

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-057 | The system SHALL support editorial reviews of restaurants, implemented as articles with a special review designation | Must |
| FR-DINE-058 | A review article SHALL be linked to a specific restaurant via a foreign key relationship | Must |
| FR-DINE-059 | The restaurant detail page SHALL display linked review articles in a "Reviews" section | Must |
| FR-DINE-060 | Each review article card SHALL display: title, author, publication date, excerpt, and the editorial rating given in the review | Must |
| FR-DINE-061 | A restaurant MAY have multiple linked review articles (e.g., initial review, follow-up review) | Must |
| FR-DINE-062 | The review articles SHALL follow the same editorial workflow as standard articles (FR-NEWS-015 to 023) | Must |
| FR-DINE-063 | When a review article is published, the editorial rating in the review SHALL optionally update the restaurant's editorial rating | Should |

### 3.10 Geocoding & Map Display

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-064 | The system SHALL geocode restaurant addresses to obtain latitude and longitude coordinates | Must |
| FR-DINE-065 | Geocoding SHALL occur automatically when a restaurant is created or its address is updated | Must |
| FR-DINE-066 | The system SHALL store coordinates as `DECIMAL(10,7)` for sub-meter precision | Must |
| FR-DINE-067 | The system SHALL allow manual coordinate override for cases where geocoding is inaccurate | Should |
| FR-DINE-068 | The restaurant detail page SHALL display a map (Leaflet/OpenStreetMap) showing the restaurant's location | Must |
| FR-DINE-069 | The system SHALL provide a restaurant map view showing all published restaurants as markers | Must |
| FR-DINE-070 | The map view SHALL support the same filters as the list view (cuisine, district, price range, open now) | Must |
| FR-DINE-071 | Clicking a restaurant map marker SHALL display a popup with: name, cuisine(s), rating, price range, and a link to the detail page | Must |
| FR-DINE-072 | The map SHALL cluster nearby markers when zoomed out | Should |
| FR-DINE-073 | The map SHALL default to Berlin center (lat: 52.52, lng: 13.405) at zoom level 12 | Must |

### 3.11 Bookmarks

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-074 | Authenticated users SHALL be able to bookmark restaurants (references FR-USER-027) | Must |
| FR-DINE-075 | The restaurant detail API response SHALL include `is_bookmarked: true/false` for authenticated users | Must |

### 3.12 Restaurant Search & Discovery

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-DINE-076 | Restaurant search SHALL be powered by Meilisearch with indexing of: name, description, cuisine names, district name, tags, and address | Must |
| FR-DINE-077 | The search endpoint SHALL support typo tolerance and highlighting | Must |
| FR-DINE-078 | The search endpoint SHALL support faceted filtering by: cuisine, district, price range, has active offer | Must |
| FR-DINE-079 | The Meilisearch index SHALL include only published restaurants | Must |
| FR-DINE-080 | The index SHALL be updated within 30 seconds of restaurant creation, update, or archival | Must |

---

## 4. Database Schema

### 4.1 Table: `cuisines`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Cuisine identifier |
| `name` | `VARCHAR(50)` | UNIQUE, NOT NULL | Cuisine name |
| `slug` | `VARCHAR(50)` | UNIQUE, NOT NULL | URL-safe slug |
| `icon` | `VARCHAR(10)` | NULLABLE | Emoji icon (e.g., flag emoji) |
| `icon_url` | `VARCHAR(500)` | NULLABLE | Custom icon URL |
| `description` | `TEXT` | NULLABLE | Cuisine description |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Whether the cuisine is available |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order |
| `restaurant_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Cached count of published restaurants |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_cuisines_slug` UNIQUE ON (`slug`)
- `idx_cuisines_active` ON (`is_active`, `display_order`)

### 4.2 Table: `restaurants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Restaurant identifier |
| `name` | `VARCHAR(200)` | NOT NULL | Restaurant name |
| `slug` | `VARCHAR(220)` | UNIQUE, NOT NULL | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Full description (HTML from TipTap) |
| `description_text` | `TEXT` | NULLABLE | Plain text extraction for search |
| `street_address` | `VARCHAR(300)` | NOT NULL | Street address |
| `district_id` | `UUID` | FK -> districts.id, NOT NULL | Berlin district |
| `postal_code` | `VARCHAR(10)` | NOT NULL | Postal code |
| `latitude` | `DECIMAL(10,7)` | NOT NULL | Latitude coordinate |
| `longitude` | `DECIMAL(10,7)` | NOT NULL | Longitude coordinate |
| `phone` | `VARCHAR(30)` | NULLABLE | Phone number |
| `email` | `VARCHAR(255)` | NULLABLE | Contact email |
| `website_url` | `VARCHAR(500)` | NULLABLE | Restaurant website |
| `reservation_url` | `VARCHAR(500)` | NULLABLE | Reservation link (e.g., OpenTable, Quandoo) |
| `social_links` | `JSONB` | NOT NULL, DEFAULT '{}' | Social media links |
| `price_range` | `VARCHAR(4)` | NULLABLE | Price range: $, $$, $$$, $$$$ |
| `editorial_rating` | `DECIMAL(2,1)` | NULLABLE | Editorial rating (1.0-5.0, half-point increments) |
| `community_rating_avg` | `DECIMAL(2,1)` | NULLABLE | Average community rating |
| `community_rating_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of community ratings |
| `featured_image_url` | `VARCHAR(500)` | NULLABLE | Primary listing image URL |
| `tags` | `TEXT[]` | NOT NULL, DEFAULT '{}' | Tags for search/filtering |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft' | Status: draft, published, archived |
| `has_active_offer` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Denormalized: whether any active offer exists |
| `is_featured` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether featured on homepage |
| `author_id` | `UUID` | FK -> users.id, NOT NULL | Editor who created the listing |
| `published_at` | `TIMESTAMPTZ` | NULLABLE | Publication timestamp |
| `view_count` | `INTEGER` | NOT NULL, DEFAULT 0 | View count |
| `bookmark_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Bookmark count (denormalized) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft delete timestamp |

**Indexes:**
- `idx_restaurants_slug` UNIQUE ON (`slug`) WHERE `deleted_at IS NULL`
- `idx_restaurants_status` ON (`status`)
- `idx_restaurants_district` ON (`district_id`) WHERE `status = 'published'`
- `idx_restaurants_price_range` ON (`price_range`) WHERE `status = 'published'`
- `idx_restaurants_editorial_rating` ON (`editorial_rating` DESC NULLS LAST) WHERE `status = 'published'`
- `idx_restaurants_community_rating` ON (`community_rating_avg` DESC NULLS LAST) WHERE `status = 'published' AND community_rating_count >= 3`
- `idx_restaurants_geo` ON (`latitude`, `longitude`) WHERE `status = 'published'`
- `idx_restaurants_offers` ON (`has_active_offer`) WHERE `status = 'published' AND has_active_offer = TRUE`
- `idx_restaurants_featured` ON (`is_featured`) WHERE `status = 'published' AND is_featured = TRUE`
- `idx_restaurants_author` ON (`author_id`)

### 4.3 Table: `restaurant_cuisines`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `restaurant_id` | `UUID` | FK -> restaurants.id, NOT NULL | Restaurant |
| `cuisine_id` | `UUID` | FK -> cuisines.id, NOT NULL | Cuisine |

**Primary Key:** (`restaurant_id`, `cuisine_id`)

**Indexes:**
- `idx_restaurant_cuisines_cuisine` ON (`cuisine_id`)

### 4.4 Table: `restaurant_opening_hours`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `restaurant_id` | `UUID` | FK -> restaurants.id, NOT NULL | Restaurant |
| `day_of_week` | `INTEGER` | NOT NULL | Day: 0=Monday, 1=Tuesday, ..., 6=Sunday |
| `period_index` | `INTEGER` | NOT NULL, DEFAULT 0 | Period within the day (0=first, 1=second) |
| `open_time` | `TIME` | NOT NULL | Opening time (e.g., 11:30) |
| `close_time` | `TIME` | NOT NULL | Closing time (e.g., 23:00) |
| `is_overnight` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether closing time is on the next day |
| `is_closed` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the restaurant is closed this day |

**Indexes:**
- `idx_opening_hours_restaurant` ON (`restaurant_id`, `day_of_week`, `period_index`)

**Constraint:** UNIQUE (`restaurant_id`, `day_of_week`, `period_index`)

### 4.5 Table: `restaurant_special_hours`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `restaurant_id` | `UUID` | FK -> restaurants.id, NOT NULL | Restaurant |
| `date` | `DATE` | NOT NULL | Specific date for the override |
| `label` | `VARCHAR(100)` | NULLABLE | Label (e.g., "Christmas Day", "Summer hours") |
| `is_closed` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether closed on this date |
| `open_time` | `TIME` | NULLABLE | Override opening time |
| `close_time` | `TIME` | NULLABLE | Override closing time |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_special_hours_restaurant_date` UNIQUE ON (`restaurant_id`, `date`)

### 4.6 Table: `restaurant_gallery`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Image identifier |
| `restaurant_id` | `UUID` | FK -> restaurants.id, NOT NULL | Restaurant |
| `filename` | `VARCHAR(255)` | NOT NULL | Original filename |
| `storage_path` | `VARCHAR(500)` | NOT NULL | R2 storage path |
| `cdn_url` | `VARCHAR(500)` | NOT NULL | CDN URL |
| `mime_type` | `VARCHAR(50)` | NOT NULL | MIME type |
| `file_size_bytes` | `BIGINT` | NOT NULL | File size |
| `width` | `INTEGER` | NULLABLE | Image width |
| `height` | `INTEGER` | NULLABLE | Image height |
| `alt_text` | `VARCHAR(200)` | NULLABLE | Alt text |
| `caption` | `VARCHAR(300)` | NULLABLE | Caption |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Order in the gallery |
| `is_featured` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether this is the primary image |
| `variants` | `JSONB` | NOT NULL, DEFAULT '{}' | URLs for generated size variants |
| `uploaded_by` | `UUID` | FK -> users.id, NOT NULL | Uploader |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Upload timestamp |

**Indexes:**
- `idx_gallery_restaurant` ON (`restaurant_id`, `display_order`)
- `idx_gallery_featured` ON (`restaurant_id`, `is_featured`) WHERE `is_featured = TRUE`

### 4.7 Table: `dining_offers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Offer identifier |
| `restaurant_id` | `UUID` | FK -> restaurants.id, NOT NULL | Associated restaurant |
| `title` | `VARCHAR(200)` | NOT NULL | Offer title |
| `description` | `TEXT` | NOT NULL | Full offer description |
| `discount_type` | `VARCHAR(20)` | NOT NULL | Type: percentage, fixed_amount, descriptive |
| `discount_value` | `DECIMAL(10,2)` | NULLABLE | Numeric discount value (e.g., 20 for 20%, 10.00 for 10 EUR off) |
| `discount_label` | `VARCHAR(100)` | NOT NULL | Human-readable label (e.g., "20% off", "EUR 10 off", "Buy 1 Get 1 Free") |
| `terms_conditions` | `TEXT` | NULLABLE | Terms and conditions |
| `start_date` | `DATE` | NOT NULL | Offer start date (inclusive) |
| `end_date` | `DATE` | NOT NULL | Offer end date (inclusive) |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Whether the offer is active (can be manually disabled) |
| `image_url` | `VARCHAR(500)` | NULLABLE | Offer banner image |
| `created_by` | `UUID` | FK -> users.id, NOT NULL | Editor who created the offer |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_dining_offers_restaurant` ON (`restaurant_id`)
- `idx_dining_offers_dates` ON (`start_date`, `end_date`) WHERE `is_active = TRUE`
- `idx_dining_offers_active` ON (`restaurant_id`, `start_date`, `end_date`) WHERE `is_active = TRUE`

### 4.8 Table: `restaurant_reviews`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `restaurant_id` | `UUID` | FK -> restaurants.id, NOT NULL | Reviewed restaurant |
| `article_id` | `UUID` | FK -> articles.id, NOT NULL | Linked review article |
| `rating_given` | `DECIMAL(2,1)` | NULLABLE | Rating given in this review (1.0-5.0) |
| `is_primary_review` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether this is the primary/latest review |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Link creation timestamp |

**Indexes:**
- `idx_restaurant_reviews_restaurant` ON (`restaurant_id`)
- `idx_restaurant_reviews_article` UNIQUE ON (`article_id`)
- `idx_restaurant_reviews_primary` ON (`restaurant_id`) WHERE `is_primary_review = TRUE`

### 4.9 Table: `community_ratings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Rating identifier |
| `restaurant_id` | `UUID` | FK -> restaurants.id, NOT NULL | Rated restaurant |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | User who rated |
| `rating` | `INTEGER` | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Rating value (1-5) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Rating timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_community_ratings_restaurant_user` UNIQUE ON (`restaurant_id`, `user_id`)
- `idx_community_ratings_restaurant` ON (`restaurant_id`)

---

## 5. API Endpoints

### 5.1 Public Restaurant Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/restaurants` | Public | List published restaurants with filters | FR-DINE-017, 021, 029 |
| `GET` | `/api/v1/restaurants/search` | Public | Full-text search via Meilisearch | FR-DINE-076 to 080 |
| `GET` | `/api/v1/restaurants/:slug` | Public | Get restaurant details | FR-DINE-002, 003 |
| `GET` | `/api/v1/restaurants/:slug/gallery` | Public | Get restaurant image gallery | FR-DINE-039 to 046 |
| `GET` | `/api/v1/restaurants/:slug/offers` | Public | Get active dining offers | FR-DINE-047 to 055 |
| `GET` | `/api/v1/restaurants/:slug/reviews` | Public | Get linked review articles | FR-DINE-057 to 062 |
| `GET` | `/api/v1/restaurants/map` | Public | Get restaurants with coordinates for map | FR-DINE-069 to 073 |
| `GET` | `/api/v1/restaurants/offers` | Public | List all active dining offers across all restaurants | FR-DINE-056 |
| `GET` | `/api/v1/cuisines` | Public | List all active cuisine types | FR-DINE-010 to 015 |
| `GET` | `/api/v1/cuisines/:slug/restaurants` | Public | List restaurants by cuisine | FR-DINE-014 |
| `POST` | `/api/v1/restaurants/:slug/rate` | Authenticated | Submit or update community rating | FR-DINE-025 to 027 |

**`GET /api/v1/restaurants`**

Query Parameters:
- `cuisine` - Cuisine slug (optional; supports multiple comma-separated)
- `district` - District slug (optional; supports multiple comma-separated)
- `price_range` - Price range: `$`, `$$`, `$$$`, `$$$$` (optional; supports multiple comma-separated)
- `min_rating` - Minimum editorial rating, e.g., `3.5` (optional)
- `has_offers` - Boolean filter for restaurants with active offers (optional)
- `open_now` - Boolean filter for currently open restaurants (optional; requires client timezone offset)
- `sort` - Sort field: `name` (default), `editorial_rating`, `community_rating`, `newest`, `distance` (optional)
- `order` - Sort order: `asc` (default for name), `desc` (optional)
- `cursor` - Pagination cursor (optional)
- `limit` - Items per page (default 12, max 50)

Response `200 OK`:
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "Mustafa's Gemuse Kebap",
      "slug": "mustafas-gemuse-kebap",
      "featured_image_url": "string | null",
      "cuisines": [
        { "id": "uuid", "name": "Turkish", "slug": "turkish", "icon": "flag_emoji" },
        { "id": "uuid", "name": "Street Food", "slug": "street-food", "icon": "food_emoji" }
      ],
      "district": {
        "id": "uuid",
        "name": "Friedrichshain-Kreuzberg",
        "slug": "friedrichshain-kreuzberg"
      },
      "price_range": "$$",
      "editorial_rating": 4.5,
      "community_rating_avg": 4.2,
      "community_rating_count": 128,
      "has_active_offer": true,
      "latitude": 52.4894,
      "longitude": 13.3878,
      "is_bookmarked": false
    }
  ],
  "pagination": {
    "next_cursor": "string | null",
    "has_more": true,
    "total_count": 342
  }
}
```

**`GET /api/v1/restaurants/:slug`**

Response `200 OK`:
```json
{
  "id": "uuid",
  "name": "Mustafa's Gemuse Kebap",
  "slug": "mustafas-gemuse-kebap",
  "description_html": "<p>Famous for the best Gemuse Kebap in Berlin...</p>",
  "street_address": "Mehringdamm 32",
  "district": {
    "id": "uuid",
    "name": "Friedrichshain-Kreuzberg",
    "slug": "friedrichshain-kreuzberg"
  },
  "postal_code": "10961",
  "latitude": 52.4894,
  "longitude": 13.3878,
  "phone": "+49 30 1234567",
  "email": "info@mustafas.de",
  "website_url": "https://mustafas.de",
  "reservation_url": null,
  "social_links": {
    "instagram": "https://instagram.com/mustafas",
    "facebook": "https://facebook.com/mustafas"
  },
  "cuisines": [
    { "id": "uuid", "name": "Turkish", "slug": "turkish", "icon": "flag_emoji" },
    { "id": "uuid", "name": "Street Food", "slug": "street-food", "icon": "food_emoji" }
  ],
  "price_range": "$$",
  "editorial_rating": 4.5,
  "community_rating_avg": 4.2,
  "community_rating_count": 128,
  "user_rating": 4,
  "opening_hours": [
    {
      "day": "monday",
      "day_index": 0,
      "is_closed": false,
      "periods": [
        { "open": "10:00", "close": "02:00", "is_overnight": true }
      ]
    },
    {
      "day": "tuesday",
      "day_index": 1,
      "is_closed": false,
      "periods": [
        { "open": "10:00", "close": "02:00", "is_overnight": true }
      ]
    },
    {
      "day": "sunday",
      "day_index": 6,
      "is_closed": true,
      "periods": []
    }
  ],
  "special_hours": [
    {
      "date": "2026-12-25",
      "label": "Christmas Day",
      "is_closed": true
    }
  ],
  "is_currently_open": true,
  "featured_image_url": "string",
  "gallery_count": 12,
  "has_active_offer": true,
  "active_offers": [
    {
      "id": "uuid",
      "title": "20% off all kebaps",
      "discount_label": "20% off",
      "end_date": "2026-03-31",
      "terms_conditions": "Valid Monday-Thursday only"
    }
  ],
  "reviews": [
    {
      "article_id": "uuid",
      "title": "Mustafa's: Still the Best Kebap in Berlin?",
      "slug": "mustafas-still-best-kebap-berlin",
      "author": { "display_name": "string" },
      "published_at": "2026-01-15T10:00:00Z",
      "rating_given": 4.5,
      "excerpt": "We revisited the legendary Gemuse Kebap stand..."
    }
  ],
  "tags": ["kebap", "street-food", "kreuzberg-legend"],
  "view_count": 2345,
  "bookmark_count": 189,
  "is_bookmarked": false,
  "published_at": "2025-08-01T10:00:00Z",
  "updated_at": "2026-03-01T14:30:00Z",
  "seo": {
    "meta_title": "Mustafa's Gemuse Kebap - Turkish Street Food in Kreuzberg | ILoveBerlin",
    "meta_description": "Famous for the best Gemuse Kebap in Berlin...",
    "canonical_url": "https://iloveberlin.biz/restaurants/mustafas-gemuse-kebap",
    "json_ld": {}
  }
}
```

Error Responses:
- `404 Not Found` - Restaurant not found or not published

**`GET /api/v1/restaurants/map`**

Query Parameters: Same as `GET /api/v1/restaurants` plus:
- `bounds` - Map viewport bounds: `sw_lat,sw_lng,ne_lat,ne_lng` (optional)
- `limit` - Max markers (default 100, max 500)

Response `200 OK`:
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "cuisines": ["Turkish", "Street Food"],
      "price_range": "$$",
      "editorial_rating": 4.5,
      "latitude": 52.4894,
      "longitude": 13.3878,
      "has_active_offer": true
    }
  ],
  "total_count": 342
}
```

**`POST /api/v1/restaurants/:slug/rate`**

Request Body:
```json
{
  "rating": 4
}
```

Response `200 OK`:
```json
{
  "restaurant_id": "uuid",
  "user_rating": 4,
  "community_rating_avg": 4.2,
  "community_rating_count": 129
}
```

Error Responses:
- `400 Bad Request` - Invalid rating value (must be 1-5)
- `404 Not Found` - Restaurant not found

**`GET /api/v1/restaurants/offers`**

Query Parameters:
- `district` - District slug (optional)
- `cuisine` - Cuisine slug (optional)
- `sort` - Sort: `end_date` (default, ending soonest first), `newest` (optional)
- `cursor` - Pagination cursor (optional)
- `limit` - Items per page (default 12, max 50)

Response `200 OK`:
```json
{
  "offers": [
    {
      "id": "uuid",
      "title": "20% off all kebaps",
      "description": "Enjoy 20% off all our kebap varieties...",
      "discount_label": "20% off",
      "start_date": "2026-03-01",
      "end_date": "2026-03-31",
      "image_url": "string | null",
      "restaurant": {
        "id": "uuid",
        "name": "Mustafa's Gemuse Kebap",
        "slug": "mustafas-gemuse-kebap",
        "featured_image_url": "string",
        "district": "Friedrichshain-Kreuzberg",
        "cuisines": ["Turkish", "Street Food"]
      }
    }
  ],
  "pagination": {
    "next_cursor": "string | null",
    "has_more": true,
    "total_count": 24
  }
}
```

### 5.2 Admin Restaurant Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/restaurants` | Editor+ | List all restaurants (all statuses) | FR-DINE-004 |
| `POST` | `/api/v1/admin/restaurants` | Editor+ | Create a restaurant | FR-DINE-001 to 003 |
| `PATCH` | `/api/v1/admin/restaurants/:id` | Editor+ | Update a restaurant | FR-DINE-004 |
| `POST` | `/api/v1/admin/restaurants/:id/publish` | Editor+ | Publish a restaurant | FR-DINE-009 |
| `POST` | `/api/v1/admin/restaurants/:id/archive` | Editor+ | Archive a restaurant | FR-DINE-009 |
| `DELETE` | `/api/v1/admin/restaurants/:id` | Editor+ | Soft delete | FR-DINE-005 |
| `DELETE` | `/api/v1/admin/restaurants/:id/permanent` | Admin+ | Permanent delete | FR-DINE-006 |

**`POST /api/v1/admin/restaurants`**

Request Body:
```json
{
  "name": "string (required, max 200 chars)",
  "description": "string (optional, HTML or TipTap JSON)",
  "street_address": "string (required, max 300 chars)",
  "district_id": "uuid (required)",
  "postal_code": "string (required)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "website_url": "string (optional)",
  "reservation_url": "string (optional)",
  "social_links": {
    "instagram": "string (optional)",
    "facebook": "string (optional)"
  },
  "cuisine_ids": ["uuid", "uuid"],
  "price_range": "$$ (optional)",
  "editorial_rating": 4.5,
  "tags": ["kebap", "street-food"],
  "opening_hours": [
    {
      "day_of_week": 0,
      "periods": [
        { "open_time": "10:00", "close_time": "02:00", "is_overnight": true }
      ],
      "is_closed": false
    },
    {
      "day_of_week": 6,
      "periods": [],
      "is_closed": true
    }
  ]
}
```

Response `201 Created`: Full restaurant object.

### 5.3 Gallery Management Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/restaurants/:id/gallery` | Editor+ | List gallery images with admin metadata | FR-DINE-039 |
| `POST` | `/api/v1/admin/restaurants/:id/gallery` | Editor+ | Upload gallery image | FR-DINE-039 to 043 |
| `PATCH` | `/api/v1/admin/restaurants/:id/gallery/:imageId` | Editor+ | Update image metadata (alt, caption, order, featured) | FR-DINE-040 |
| `DELETE` | `/api/v1/admin/restaurants/:id/gallery/:imageId` | Editor+ | Delete gallery image | FR-DINE-039 |
| `POST` | `/api/v1/admin/restaurants/:id/gallery/reorder` | Editor+ | Reorder gallery images | FR-DINE-040 |

**`POST /api/v1/admin/restaurants/:id/gallery`**

Request: `multipart/form-data`
- `image` - Image file (JPEG, PNG, WebP; max 10 MB)
- `alt_text` - Alt text (optional)
- `caption` - Caption (optional)
- `is_featured` - Boolean (optional, default false)

Response `201 Created`:
```json
{
  "id": "uuid",
  "cdn_url": "https://cdn.iloveberlin.biz/media/restaurants/{id}/gallery/...",
  "variants": {
    "original": "string",
    "large": "string",
    "medium": "string",
    "small": "string",
    "thumbnail": "string"
  },
  "display_order": 5,
  "is_featured": false,
  "created_at": "2026-03-11T14:30:00Z"
}
```

Error Responses:
- `400 Bad Request` - Invalid file type or not a genuine image
- `413 Payload Too Large` - File exceeds 10 MB
- `422 Unprocessable Entity` - Gallery already has 20 images

### 5.4 Dining Offer Management Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/restaurants/:id/offers` | Editor+ | List all offers (including expired) | FR-DINE-053 |
| `POST` | `/api/v1/admin/restaurants/:id/offers` | Editor+ | Create a dining offer | FR-DINE-053 |
| `PATCH` | `/api/v1/admin/offers/:offerId` | Editor+ | Update a dining offer | FR-DINE-053 |
| `DELETE` | `/api/v1/admin/offers/:offerId` | Editor+ | Delete a dining offer | FR-DINE-053 |

**`POST /api/v1/admin/restaurants/:id/offers`**

Request Body:
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required)",
  "discount_type": "percentage | fixed_amount | descriptive (required)",
  "discount_value": 20.00,
  "discount_label": "20% off (required, max 100 chars)",
  "terms_conditions": "string (optional)",
  "start_date": "2026-03-01 (required)",
  "end_date": "2026-03-31 (required)",
  "image_url": "string (optional)"
}
```

Response `201 Created`: Full offer object.

Error Responses:
- `400 Bad Request` - Validation errors (e.g., end_date before start_date)

### 5.5 Review Link Management Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/admin/restaurants/:id/reviews` | Editor+ | Link a review article to a restaurant | FR-DINE-058 |
| `DELETE` | `/api/v1/admin/restaurant-reviews/:reviewId` | Editor+ | Unlink a review article | FR-DINE-058 |

**`POST /api/v1/admin/restaurants/:id/reviews`**

Request Body:
```json
{
  "article_id": "uuid (required)",
  "rating_given": 4.5,
  "is_primary_review": true
}
```

Response `201 Created`: Full review link object.

Error Responses:
- `404 Not Found` - Article not found
- `409 Conflict` - Article already linked to a restaurant

### 5.6 Cuisine Management Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/admin/cuisines` | Admin+ | List all cuisines (including inactive) | FR-DINE-013 |
| `POST` | `/api/v1/admin/cuisines` | Admin+ | Create a cuisine | FR-DINE-013 |
| `PATCH` | `/api/v1/admin/cuisines/:id` | Admin+ | Update a cuisine | FR-DINE-013 |

---

## 6. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Active Offer Flag Update | Every hour | Recalculate `has_active_offer` flag on all restaurants based on current date vs offer date ranges |
| Community Rating Aggregation | On rating change (event-driven) | Recalculate `community_rating_avg` and `community_rating_count` for the rated restaurant |
| Cuisine Count Update | Every hour | Recalculate `restaurant_count` for each cuisine |
| Restaurant Geocoding | On create/update (event-driven) | Geocode restaurant addresses to obtain lat/lng coordinates |
| Meilisearch Sync | Near real-time (event-driven) | Update Meilisearch index on restaurant publish, update, or archive |
| Expired Offer Cleanup | Daily at 01:00 UTC | Deactivate offers past their end_date |
| Featured Image Sync | On gallery change (event-driven) | Update `featured_image_url` on the restaurant when gallery images change |

---

## 7. Meilisearch Index Configuration

**Index Name:** `restaurants`

**Searchable Attributes (ranked):**
1. `name`
2. `cuisine_names`
3. `description_text`
4. `district_name`
5. `tags`
6. `street_address`

**Filterable Attributes:**
- `cuisine_slugs`
- `district_slug`
- `price_range`
- `editorial_rating` (numeric for range filters)
- `has_active_offer`
- `status`

**Sortable Attributes:**
- `name`
- `editorial_rating`
- `community_rating_avg`
- `created_at`

**Ranking Rules:**
1. `words`
2. `typo`
3. `proximity`
4. `attribute`
5. `sort`
6. `exactness`
