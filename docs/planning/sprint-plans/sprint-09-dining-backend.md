# Sprint 9: Dining Backend

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 9 |
| **Sprint Name** | Dining Backend |
| **Duration** | 2 weeks (10 working days) |
| **Dates** | Weeks 17-18 (relative to project start) |
| **Team** | 2 Backend, 1 Frontend (admin), 1 QA, 0.5 DevOps |

## Sprint Goal

Build the complete dining backend infrastructure -- including cuisines, restaurants, restaurant images, and dining offers data models -- along with full CRUD APIs, filtering, image gallery management, bookmarks, review integration, and admin management interfaces, enabling the frontend team to build the dining experience in Sprint 10.

---

## User Stories

### US-9.1: Cuisines Reference Data
**ID:** US-9.1
**As a** developer, **I want to** have a seeded cuisines table with ~30 cuisine types **so that** restaurants can be categorized by cuisine for filtering.

**Acceptance Criteria:**
- [ ] `cuisines` table created with `id`, `name`, `slug`, `icon`, `sort_order`, `created_at`
- [ ] Seed migration populates ~30 cuisines (German, Turkish, Vietnamese, Italian, Indian, Thai, Japanese, Chinese, Korean, Mexican, Greek, Lebanese, Ethiopian, American, French, Spanish, Portuguese, Peruvian, Brazilian, African, Caribbean, Georgian, Russian, Polish, Austrian, Balkan, Vegan, Vegetarian, International, Street Food)
- [ ] `GET /api/cuisines` returns all cuisines sorted by `sort_order`
- [ ] Cuisines are immutable via API (admin-seeded only)

### US-9.2: Restaurant Management
**ID:** US-9.2
**As an** admin, **I want to** create and manage restaurant listings **so that** the dining section has comprehensive venue data.

**Acceptance Criteria:**
- [ ] `restaurants` table supports all required fields (name, slug, description, address, district, lat/lng, phone, email, website, price_range, opening_hours JSON, status)
- [ ] `restaurant_cuisines` junction table links restaurants to multiple cuisines
- [ ] `POST /api/admin/restaurants` creates a restaurant with cuisine associations
- [ ] `PUT /api/admin/restaurants/:id` updates restaurant details
- [ ] `DELETE /api/admin/restaurants/:id` soft-deletes a restaurant
- [ ] `GET /api/restaurants` supports filtering by cuisine, district, price range, status
- [ ] `GET /api/restaurants/:slug` returns full restaurant detail with cuisines, images, offers
- [ ] Pagination with 20 results per page
- [ ] Full-text search via Meilisearch integration

### US-9.3: Restaurant Image Gallery
**ID:** US-9.3
**As an** admin, **I want to** manage a photo gallery for each restaurant **so that** users can see the venue and food.

**Acceptance Criteria:**
- [ ] `restaurant_images` table with `id`, `restaurant_id`, `image_url`, `thumbnail_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`
- [ ] `POST /api/admin/restaurants/:id/images` uploads image to Cloudflare R2 and creates record
- [ ] Images are resized to standard sizes (thumbnail: 300x200, medium: 800x600, large: 1600x1200)
- [ ] `PUT /api/admin/restaurants/:id/images/:imageId` updates alt text and sort order
- [ ] `DELETE /api/admin/restaurants/:id/images/:imageId` removes image from R2 and database
- [ ] `PATCH /api/admin/restaurants/:id/images/:imageId/primary` sets an image as primary
- [ ] Maximum 20 images per restaurant
- [ ] `GET /api/restaurants/:id/images` returns all images sorted by `sort_order`

### US-9.4: Dining Offers / Specials
**ID:** US-9.4
**As an** admin, **I want to** create dining offers and specials for restaurants **so that** users can discover deals.

**Acceptance Criteria:**
- [ ] `dining_offers` table with `id`, `restaurant_id`, `title`, `description`, `offer_type` (enum: discount, set_menu, happy_hour, brunch_deal, event), `discount_percentage`, `original_price`, `offer_price`, `valid_from`, `valid_until`, `days_of_week` (JSON array), `terms`, `status`, `is_featured`, `created_at`, `updated_at`
- [ ] `POST /api/admin/dining-offers` creates an offer linked to a restaurant
- [ ] `PUT /api/admin/dining-offers/:id` updates offer details
- [ ] `DELETE /api/admin/dining-offers/:id` soft-deletes an offer
- [ ] `GET /api/dining-offers` returns active offers with filters (restaurant, type, district)
- [ ] `GET /api/dining-offers/featured` returns featured offers for homepage/landing
- [ ] Expired offers auto-transition to `expired` status via cron job

### US-9.5: Restaurant Bookmarks
**ID:** US-9.5
**As a** logged-in user, **I want to** bookmark restaurants **so that** I can save my favorite dining spots.

**Acceptance Criteria:**
- [ ] Bookmarks endpoint supports `entity_type: 'restaurant'`
- [ ] `POST /api/bookmarks` with `{ entity_type: 'restaurant', entity_id: <id> }` creates bookmark
- [ ] `DELETE /api/bookmarks/:id` removes bookmark
- [ ] `GET /api/bookmarks?entity_type=restaurant` returns user's restaurant bookmarks
- [ ] Bookmark status included in restaurant list/detail API responses for authenticated users

### US-9.6: Restaurant Review Integration
**ID:** US-9.6
**As a** system, **I want to** link editorial reviews (articles) to restaurants **so that** users can read expert opinions.

**Acceptance Criteria:**
- [ ] `restaurant_reviews` linking table with `restaurant_id`, `article_id`, `rating` (1-5), `excerpt`
- [ ] `GET /api/restaurants/:slug` includes linked reviews with article title, excerpt, rating
- [ ] Admin can link/unlink articles to restaurants via `POST /api/admin/restaurants/:id/reviews`
- [ ] A restaurant can have multiple linked reviews
- [ ] Reviews are displayed in order of most recent

### US-9.7: Admin Restaurant Management Interface
**ID:** US-9.7
**As an** admin, **I want to** manage restaurants and dining offers through the admin panel **so that** I can maintain the dining section efficiently.

**Acceptance Criteria:**
- [ ] Admin restaurant list page with search, filter by status/cuisine/district
- [ ] Admin restaurant create/edit form with all fields including cuisine multi-select
- [ ] Admin image gallery manager (upload, reorder drag-and-drop, delete, set primary)
- [ ] Admin dining offers list with filter by restaurant/status
- [ ] Admin dining offer create/edit form
- [ ] Admin restaurant review linking interface

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Design and create `cuisines` table migration | Backend 1 | 2h | Schema with id, name, slug, icon, sort_order, timestamps |
| Create cuisines seed migration (~30 cuisines) | Backend 1 | 2h | Comprehensive Berlin-relevant cuisine list |
| Design and create `restaurants` table migration | Backend 2 | 3h | Full schema with all fields, indexes on district, status, slug |
| Create `restaurant_cuisines` junction table | Backend 2 | 1h | Composite primary key, foreign keys with cascade |

#### Day 2 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Create `restaurant_images` table migration | Backend 1 | 2h | Schema with sort_order, is_primary, foreign keys |
| Create `dining_offers` table migration | Backend 1 | 3h | Full schema with enum types, JSON days_of_week, indexes |
| Create `restaurant_reviews` linking table migration | Backend 2 | 1.5h | Junction table linking restaurants to articles |
| Build CuisinesModule (entity, service, controller) | Backend 2 | 3h | GET /api/cuisines endpoint, caching |

#### Day 3 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build RestaurantEntity with TypeORM decorators | Backend 1 | 2h | All columns, relations to cuisines, images, offers |
| Build RestaurantService - create and update | Backend 1 | 4h | CRUD logic with cuisine association management |
| Build RestaurantService - list with filters | Backend 2 | 4h | Filter by cuisine, district, price_range, status; pagination |
| Build RestaurantService - detail by slug | Backend 2 | 2h | Eager load cuisines, images, offers, reviews |

#### Day 4 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build RestaurantController (public endpoints) | Backend 1 | 3h | GET /api/restaurants, GET /api/restaurants/:slug |
| Build AdminRestaurantController | Backend 1 | 3h | POST, PUT, DELETE with admin guard |
| Integrate Meilisearch for restaurant search | Backend 2 | 4h | Index restaurants, sync on create/update/delete, search endpoint |
| Unit tests for RestaurantService | Backend 2 | 2h | Test CRUD, filters, cuisine associations |

#### Day 5 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build RestaurantImageService | Backend 1 | 4h | Upload to R2, resize (sharp), create record, reorder, delete |
| Build RestaurantImageController | Backend 1 | 2h | Admin endpoints for image CRUD, set primary |
| Build DiningOfferEntity and DiningOfferService | Backend 2 | 4h | CRUD with restaurant association, filter by type/district |
| Build DiningOfferController | Backend 2 | 2h | Public and admin endpoints |

### Week 2 (Days 6-10)

#### Day 6 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build featured dining offers endpoint | Backend 1 | 2h | GET /api/dining-offers/featured with is_featured flag |
| Build dining offer expiry cron job | Backend 1 | 3h | NestJS @Cron to transition expired offers |
| Extend bookmarks for restaurant entity type | Backend 2 | 3h | Add 'restaurant' to entity_type enum, test bookmark flow |
| Build restaurant review linking service | Backend 2 | 3h | Link/unlink articles, fetch reviews with ratings |

#### Day 7 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build admin review linking controller | Backend 1 | 2h | POST/DELETE /api/admin/restaurants/:id/reviews |
| Integration tests - restaurant CRUD flow | Backend 1 | 4h | Full create, update, list, detail, delete flow |
| Integration tests - dining offers flow | Backend 2 | 3h | Create, list, filter, featured, expiry |
| Integration tests - image gallery flow | Backend 2 | 3h | Upload, reorder, set primary, delete |

#### Day 8 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin restaurant list page | Frontend (admin) | 4h | Table with search, status/cuisine/district filters |
| Admin restaurant create/edit form | Frontend (admin) | 4h | All fields, cuisine multi-select, opening hours editor |
| Seed sample restaurants (20-30) | Backend 1 | 3h | Realistic Berlin restaurant data for testing |
| API documentation for all dining endpoints | Backend 2 | 3h | Swagger/OpenAPI annotations |

#### Day 9 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin image gallery manager | Frontend (admin) | 6h | Upload UI, drag-and-drop reorder, delete, set primary thumbnail |
| Admin dining offers management | Frontend (admin) | 4h | List, create/edit form, restaurant selector |
| QA: Test restaurant CRUD via API | QA | 4h | All endpoints, edge cases, validation errors |
| QA: Test image upload and management | QA | 3h | Upload, resize verification, reorder, delete |

#### Day 10 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Admin restaurant review linking UI | Frontend (admin) | 3h | Article search, link/unlink interface |
| QA: Test dining offers and bookmarks | QA | 4h | Offer CRUD, expiry, bookmarks, featured |
| Bug fixes from QA feedback | Backend 1 + 2 | 4h | Address P1/P2 issues |
| Sprint review preparation | Backend 1 | 2h | Demo script, test data verification |

---

## Backend Tasks

### BE-9.1: Database Schema - Cuisines
- **Sub-tasks:**
  - Create `cuisines` table migration (1h)
  - Create CuisineEntity with TypeORM decorators (0.5h)
  - Write seed migration with ~30 cuisines (1.5h)
  - Build CuisinesModule, Service, Controller (1.5h)
  - Add response caching (cache-manager) for cuisines endpoint (0.5h)
- **Effort:** 5 hours

### BE-9.2: Database Schema - Restaurants
- **Sub-tasks:**
  - Create `restaurants` table migration with all columns and indexes (2h)
  - Create `restaurant_cuisines` junction table migration (0.5h)
  - Create RestaurantEntity with relations (1.5h)
  - Add unique index on `slug`, composite index on `district + status` (0.5h)
  - Add GIN index on opening_hours JSONB column (0.5h)
- **Effort:** 5 hours

### BE-9.3: Database Schema - Restaurant Images
- **Sub-tasks:**
  - Create `restaurant_images` table migration (1h)
  - Create RestaurantImageEntity with relations (0.5h)
  - Add index on `restaurant_id + sort_order` (0.5h)
- **Effort:** 2 hours

### BE-9.4: Database Schema - Dining Offers
- **Sub-tasks:**
  - Create `dining_offers` table migration with enum type (1.5h)
  - Create DiningOfferEntity with relations (1h)
  - Add indexes on `restaurant_id`, `status`, `valid_until`, `is_featured` (0.5h)
- **Effort:** 3 hours

### BE-9.5: Database Schema - Restaurant Reviews
- **Sub-tasks:**
  - Create `restaurant_reviews` linking table migration (1h)
  - Create RestaurantReviewEntity with relations (0.5h)
- **Effort:** 1.5 hours

### BE-9.6: Restaurant Module - CRUD
- **Sub-tasks:**
  - RestaurantService.create() with cuisine association (2h)
  - RestaurantService.update() with cuisine sync (2h)
  - RestaurantService.findAll() with filters (cuisine, district, price_range, status, pagination) (3h)
  - RestaurantService.findBySlug() with eager loading (1.5h)
  - RestaurantService.softDelete() (0.5h)
  - RestaurantController (public endpoints) (2h)
  - AdminRestaurantController (admin CRUD endpoints) (2h)
  - Input validation DTOs (CreateRestaurantDto, UpdateRestaurantDto, FilterRestaurantDto) (1.5h)
- **Effort:** 14.5 hours

### BE-9.7: Restaurant Image Gallery Management
- **Sub-tasks:**
  - RestaurantImageService.upload() - upload to R2, resize with sharp (3h)
  - Image resize pipeline: thumbnail 300x200, medium 800x600, large 1600x1200 (1.5h)
  - RestaurantImageService.updateSortOrder() - reorder images (1h)
  - RestaurantImageService.setPrimary() - set primary image (0.5h)
  - RestaurantImageService.delete() - remove from R2 and database (1h)
  - Max 20 images validation (0.5h)
  - RestaurantImageController (admin endpoints) (1.5h)
- **Effort:** 9 hours

### BE-9.8: Dining Offers Module
- **Sub-tasks:**
  - DiningOfferService.create() with restaurant validation (1.5h)
  - DiningOfferService.update() (1h)
  - DiningOfferService.findAll() with filters (restaurant, type, district, status) (2h)
  - DiningOfferService.findFeatured() (1h)
  - DiningOfferService.softDelete() (0.5h)
  - Expiry cron job - transition offers past valid_until to 'expired' (2h)
  - DiningOfferController (public and admin endpoints) (2h)
  - Input validation DTOs (1h)
- **Effort:** 11 hours

### BE-9.9: Meilisearch Integration for Restaurants
- **Sub-tasks:**
  - Create restaurant search index configuration (1h)
  - Sync restaurant data to Meilisearch on create/update/delete (1.5h)
  - Build search endpoint with Meilisearch client (1h)
  - Configure filterable and sortable attributes (0.5h)
- **Effort:** 4 hours

### BE-9.10: Restaurant Bookmarks
- **Sub-tasks:**
  - Extend entity_type enum to include 'restaurant' (0.5h)
  - Update bookmark service to validate restaurant entity (1h)
  - Include bookmark status in restaurant list/detail responses for auth users (1.5h)
- **Effort:** 3 hours

### BE-9.11: Restaurant Review Linking
- **Sub-tasks:**
  - RestaurantReviewService.linkArticle() (1h)
  - RestaurantReviewService.unlinkArticle() (0.5h)
  - RestaurantReviewService.findByRestaurant() (0.5h)
  - Include reviews in restaurant detail response (0.5h)
  - AdminRestaurantReviewController (1h)
- **Effort:** 3.5 hours

### BE-9.12: Sample Data Seeding
- **Sub-tasks:**
  - Create 20-30 sample restaurants with realistic Berlin data (2h)
  - Associate cuisines, upload sample images (1h)
  - Create 10-15 sample dining offers (0.5h)
- **Effort:** 3.5 hours

### BE-9.13: Integration Tests
- **Sub-tasks:**
  - Restaurant CRUD flow tests (3h)
  - Image gallery flow tests (2h)
  - Dining offers flow tests (2h)
  - Bookmark and review linking tests (1.5h)
  - Meilisearch sync tests (1h)
- **Effort:** 9.5 hours

### BE-9.14: API Documentation
- **Sub-tasks:**
  - Swagger annotations for all dining endpoints (2h)
  - Document request/response schemas (0.5h)
  - Document error codes and validation rules (0.5h)
- **Effort:** 3 hours

**Total Backend Effort:** 77 hours

---

## Frontend Tasks (Admin Panel)

### FE-9.1: Admin Restaurant List Page
- **Sub-tasks:**
  - Table component with columns: name, district, cuisine, status, actions (2h)
  - Search bar with debounced API call (0.5h)
  - Filter dropdowns: status, cuisine, district (1h)
  - Pagination controls (0.5h)
- **Effort:** 4 hours

### FE-9.2: Admin Restaurant Create/Edit Form
- **Sub-tasks:**
  - Form layout with all restaurant fields (1.5h)
  - Cuisine multi-select dropdown (1h)
  - Opening hours editor (day-by-day time inputs) (1.5h)
  - Price range selector (0.5h)
  - District dropdown (0.5h)
  - Map picker for lat/lng (1h)
  - Form validation and error display (1h)
  - API integration (create and update) (1h)
- **Effort:** 8 hours

### FE-9.3: Admin Image Gallery Manager
- **Sub-tasks:**
  - Image upload dropzone (multi-file) (1.5h)
  - Upload progress indicators (1h)
  - Image grid with drag-and-drop reorder (dnd-kit) (2h)
  - Set primary image button (0.5h)
  - Delete image with confirmation (0.5h)
  - Alt text editing inline (0.5h)
- **Effort:** 6 hours

### FE-9.4: Admin Dining Offers Management
- **Sub-tasks:**
  - Offers list table with restaurant name, type, dates, status (1.5h)
  - Filter by restaurant, status (0.5h)
  - Offer create/edit form with all fields (2h)
  - Restaurant selector dropdown with search (0.5h)
  - Days of week checkbox group (0.5h)
  - Date range pickers for validity period (0.5h)
- **Effort:** 5.5 hours

### FE-9.5: Admin Restaurant Review Linking
- **Sub-tasks:**
  - Article search autocomplete (1h)
  - Link/unlink article UI with rating input (1h)
  - Linked reviews list on restaurant detail (0.5h)
  - Excerpt text area (0.5h)
- **Effort:** 3 hours

**Total Frontend Effort:** 26.5 hours

---

## DevOps / Infrastructure Tasks

### DEVOPS-9.1: Cloudflare R2 Image Pipeline
- **Sub-tasks:**
  - Configure R2 bucket for restaurant images (if not already done) (1h)
  - Set up image transformation pipeline with sharp (1h)
  - Configure CDN caching for image URLs (0.5h)
- **Effort:** 2.5 hours

### DEVOPS-9.2: Meilisearch Restaurant Index
- **Sub-tasks:**
  - Create restaurant index with appropriate settings (0.5h)
  - Configure filterable attributes (cuisine, district, price_range) (0.5h)
  - Configure sortable attributes (name, created_at) (0.5h)
- **Effort:** 1.5 hours

### DEVOPS-9.3: Cron Job Infrastructure
- **Sub-tasks:**
  - Verify NestJS scheduler module is configured (0.5h)
  - Set up cron job monitoring/alerting (0.5h)
- **Effort:** 1 hour

**Total DevOps Effort:** 5 hours

---

## QA Tasks

### QA-9.1: Restaurant CRUD Testing
- **Test Scenarios:**
  1. Create restaurant with all required fields - verify saved correctly
  2. Create restaurant with optional fields omitted - verify defaults
  3. Create restaurant with invalid data - verify validation errors
  4. Update restaurant - verify changes persisted
  5. Update restaurant cuisines - verify association changes
  6. Delete restaurant - verify soft delete (status change, not removed)
  7. List restaurants with no filters - verify pagination
  8. Filter by cuisine - verify only matching restaurants returned
  9. Filter by district - verify only matching district returned
  10. Filter by price range - verify correct range
  11. Combined filters - verify intersection
  12. Search restaurants via Meilisearch - verify relevant results
  13. Get restaurant by slug - verify all relations loaded
  14. Duplicate slug handling - verify unique constraint error
- **Effort:** 6 hours

### QA-9.2: Image Gallery Testing
- **Test Scenarios:**
  1. Upload single image - verify stored in R2 and database record created
  2. Upload image - verify thumbnail, medium, large sizes generated
  3. Upload 20th image - verify accepted
  4. Upload 21st image - verify rejected with error
  5. Reorder images - verify sort_order updated
  6. Set primary image - verify previous primary unset
  7. Delete image - verify removed from R2 and database
  8. Upload invalid file type (e.g., .txt) - verify rejected
  9. Upload oversized file (>10MB) - verify rejected
  10. Gallery endpoint returns images in sort order
- **Effort:** 5 hours

### QA-9.3: Dining Offers Testing
- **Test Scenarios:**
  1. Create offer with all fields - verify saved
  2. Create offer with invalid restaurant_id - verify error
  3. Update offer - verify changes
  4. List active offers - verify only active status returned
  5. Filter by type - verify correct offers
  6. Featured offers endpoint - verify only is_featured=true
  7. Expired offer cron - create past-dated offer, run cron, verify status change
  8. Soft delete offer - verify status change
  9. Days of week filter - verify correct filtering
- **Effort:** 4 hours

### QA-9.4: Bookmarks and Reviews Testing
- **Test Scenarios:**
  1. Bookmark restaurant - verify created
  2. Bookmark duplicate - verify idempotent or error
  3. Remove bookmark - verify deleted
  4. List restaurant bookmarks - verify correct entities
  5. Bookmark status in restaurant list (authenticated) - verify present
  6. Bookmark status in restaurant list (unauthenticated) - verify absent
  7. Link article to restaurant - verify review created with rating
  8. Unlink article - verify removed
  9. Restaurant detail includes reviews - verify correct articles
- **Effort:** 4 hours

### QA-9.5: Admin Panel Testing
- **Test Scenarios:**
  1. Restaurant list page loads with data
  2. Search filters results correctly
  3. Create form validates and submits
  4. Edit form pre-fills and updates
  5. Image gallery upload, reorder, delete works
  6. Dining offer form validates and submits
  7. Review linking search and link works
  8. Non-admin access is blocked (403)
- **Effort:** 4 hours

**Total QA Effort:** 23 hours

---

## Dependencies

| Blocked Task | Depends On | Notes |
|---|---|---|
| BE-9.6 (Restaurant Module) | BE-9.1 to BE-9.5 (Database schemas) | Tables must exist before module logic |
| BE-9.7 (Image Gallery) | BE-9.3 (restaurant_images table), DEVOPS-9.1 (R2 config) | Image storage requires R2 bucket |
| BE-9.8 (Dining Offers) | BE-9.4 (dining_offers table) | Table must exist |
| BE-9.9 (Meilisearch) | BE-9.6 (Restaurant Module), DEVOPS-9.2 (Meilisearch index) | Must have restaurant data and index |
| BE-9.10 (Bookmarks) | Bookmarks module (Sprint 6) | Bookmarks API must exist |
| BE-9.11 (Reviews) | Articles module (Sprint 5-6) | Articles must exist for linking |
| FE-9.1-9.5 (Admin UI) | BE-9.6-9.8 (All backend CRUD) | Admin UI needs working APIs |
| BE-9.12 (Seed data) | BE-9.6, BE-9.7 (Restaurant + Image modules) | Modules must be functional for seeding |
| QA tasks | Corresponding backend/frontend tasks | QA follows development |

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Image resize pipeline performance (sharp) | Medium | Medium | Process resizing asynchronously via queue; return upload immediately |
| Meilisearch sync consistency | Medium | Medium | Use database hooks for real-time sync; add manual re-index admin endpoint |
| Opening hours JSON schema complexity | Medium | Low | Define strict TypeScript interface; validate on input with class-validator |
| Large image uploads timing out | Medium | High | Set appropriate upload limits (10MB); use multipart upload; add progress feedback |
| Dining offer expiry cron reliability | Low | Medium | Add manual trigger endpoint; log cron runs; alert on failure |
| Restaurant slug uniqueness with special characters | Medium | Low | Use slugify library with collision detection; append number suffix on conflict |

---

## Deliverables Checklist

- [ ] `cuisines` table with ~30 seeded cuisines
- [ ] `restaurants` table with all columns and indexes
- [ ] `restaurant_cuisines` junction table
- [ ] `restaurant_images` table
- [ ] `dining_offers` table with enum types
- [ ] `restaurant_reviews` linking table
- [ ] Cuisines API endpoint (GET)
- [ ] Restaurant CRUD API (public list/detail + admin create/update/delete)
- [ ] Restaurant filtering (cuisine, district, price range, status)
- [ ] Restaurant search via Meilisearch
- [ ] Image gallery management API (upload, reorder, set primary, delete)
- [ ] Image resize pipeline (thumbnail, medium, large)
- [ ] Dining offers CRUD API (public list/featured + admin create/update/delete)
- [ ] Dining offer expiry cron job
- [ ] Restaurant bookmarks integration
- [ ] Restaurant review linking (article-to-restaurant)
- [ ] Admin restaurant list page
- [ ] Admin restaurant create/edit form
- [ ] Admin image gallery manager
- [ ] Admin dining offers management
- [ ] Admin review linking interface
- [ ] 20-30 sample restaurants seeded
- [ ] Integration test suite passing
- [ ] API documentation (Swagger/OpenAPI)

---

## Definition of Done

- [ ] All database migrations run successfully in development and staging
- [ ] All CRUD endpoints return correct HTTP status codes and response shapes
- [ ] Restaurant filtering returns correct results for all filter combinations
- [ ] Meilisearch returns relevant search results within 50ms
- [ ] Image upload pipeline creates all three sizes and stores in R2
- [ ] Dining offer expiry cron runs on schedule and transitions offers correctly
- [ ] Bookmarks work for restaurant entity type
- [ ] Admin panel pages are functional and access-controlled
- [ ] Integration tests pass with >90% coverage on new code
- [ ] API documentation is complete and accurate
- [ ] No P1 or P2 bugs open
- [ ] Code reviewed and merged to main branch
- [ ] Sample data available for Sprint 10 frontend development

---

## Sprint Review Demo Script

1. **Database Schema Walkthrough (2 min)**
   - Show ER diagram of new tables and relationships
   - Highlight key design decisions (JSON opening_hours, enum offer_type)

2. **Cuisines API (1 min)**
   - Call `GET /api/cuisines` and show ~30 seeded cuisines
   - Show cached response headers

3. **Restaurant CRUD via Admin (4 min)**
   - Open admin panel, navigate to restaurant management
   - Create a new restaurant with all fields, select multiple cuisines
   - Show the restaurant in the list with filters applied
   - Edit the restaurant, change district and cuisines
   - Show `GET /api/restaurants/:slug` response with all relations

4. **Image Gallery (3 min)**
   - Upload 3-4 images to the restaurant
   - Show resized versions in R2 (thumbnail, medium, large)
   - Drag-and-drop reorder images
   - Set a different primary image
   - Delete an image

5. **Dining Offers (2 min)**
   - Create a dining offer (happy hour) linked to the restaurant
   - Show offer in `GET /api/dining-offers` with filters
   - Mark offer as featured; show `GET /api/dining-offers/featured`

6. **Search (1 min)**
   - Search for a restaurant by name via Meilisearch
   - Show instant search results

7. **Bookmarks and Reviews (2 min)**
   - Bookmark a restaurant via API
   - Show bookmark status in restaurant detail response
   - Link an article as a review with rating
   - Show reviews in restaurant detail response

---

## Rollover Criteria

A story or task rolls over to Sprint 10 if:
- Database migration issues block more than 2 days of development
- R2 image pipeline has unresolved issues preventing upload
- Meilisearch integration encounters version compatibility issues
- Critical bug in core restaurant CRUD blocks dependent tasks

**Candidates for rollover (if needed):**
1. Admin review linking interface (can be deferred; reviews can be linked via API)
2. Dining offer expiry cron (can be manual initially)
3. Featured offers endpoint (can be added as part of Sprint 11 homepage)
