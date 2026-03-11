# Dining API

**Base Path:** `/api/v1`

Endpoints for managing restaurants, cuisine types, and dining offers on the ILoveBerlin platform. Supports filtering by cuisine, district, price range, and rating.

---

## Table of Contents

- [Endpoints Overview](#endpoints-overview)
- [Public Endpoints](#public-endpoints)
  - [GET /restaurants](#get-restaurants)
  - [GET /restaurants/:slug](#get-restaurantsslug)
  - [GET /restaurants/:id/offers](#get-restaurantsidoffers)
  - [GET /dining/offers](#get-diningoffers)
  - [GET /cuisines](#get-cuisines)
- [Editor Endpoints](#editor-endpoints)
  - [POST /restaurants](#post-restaurants)
  - [PATCH /restaurants/:id](#patch-restaurantsid)
  - [DELETE /restaurants/:id](#delete-restaurantsid)
  - [POST /restaurants/:id/images](#post-restaurantsidimages)
  - [POST /dining/offers](#post-diningoffers)
- [User Endpoints](#user-endpoints)
  - [POST /restaurants/:id/bookmark](#post-restaurantsidbookmark)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/restaurants` | Public | List restaurants with filters |
| `GET` | `/restaurants/:slug` | Public | Get a single restaurant |
| `GET` | `/restaurants/:id/offers` | Public | Get active offers for a restaurant |
| `GET` | `/dining/offers` | Public | List all active dining offers |
| `GET` | `/cuisines` | Public | List all cuisine types |
| `POST` | `/restaurants` | Editor | Create a new restaurant |
| `PATCH` | `/restaurants/:id` | Editor | Update a restaurant |
| `DELETE` | `/restaurants/:id` | Editor | Delete a restaurant |
| `POST` | `/restaurants/:id/images` | Editor | Upload restaurant images |
| `POST` | `/dining/offers` | Editor | Create a new dining offer |
| `POST` | `/restaurants/:id/bookmark` | User | Bookmark a restaurant |

---

## Public Endpoints

### GET /restaurants

Retrieve a paginated list of published restaurants. Supports filtering by cuisine, district, price range, rating, and full-text search.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `rating` | Sort field: `rating`, `name`, `createdAt`, `priceRange` |
| `order` | string | `desc` | Sort direction: `asc`, `desc` |
| `q` | string | -- | Full-text search across name, description, and cuisine |
| `cuisine` | string | -- | Filter by cuisine slug (comma-separated): `german`, `turkish`, `vietnamese`, `italian`, `japanese`, `indian`, `thai`, `mexican`, `middle-eastern`, `vegan`, `breakfast`, `cafe` |
| `district` | string | -- | Filter by Berlin district slug (comma-separated) |
| `priceRange[gte]` | integer | -- | Minimum price range (1-4, where 1 = budget, 4 = fine dining) |
| `priceRange[lte]` | integer | -- | Maximum price range (1-4) |
| `rating[gte]` | number | -- | Minimum rating (1.0-5.0) |
| `hasOffers` | boolean | -- | Filter restaurants with active offers |
| `openNow` | boolean | -- | Filter restaurants currently open (based on Berlin time) |
| `featured` | boolean | -- | Filter featured restaurants |

### Example Request

```
GET /api/v1/restaurants?cuisine=vietnamese,thai&district=kreuzberg,neukoelln&priceRange[lte]=2&rating[gte]=4.0&sort=rating&order=desc&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 145,
      "name": "Mama Pho",
      "slug": "mama-pho-kreuzberg",
      "excerpt": "Authentic Vietnamese pho and banh mi in the heart of Kreuzberg.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/145/cover.jpg",
      "cuisine": [
        {
          "id": 3,
          "name": "Vietnamese",
          "slug": "vietnamese"
        }
      ],
      "district": "kreuzberg",
      "address": "Oranienstr. 158, 10969 Berlin",
      "priceRange": 1,
      "priceRangeDisplay": "EUR",
      "rating": 4.7,
      "reviewCount": 234,
      "hasOffers": true,
      "featured": false,
      "openingHours": {
        "isOpenNow": true,
        "todayHours": "11:00 - 22:00"
      },
      "createdAt": "2026-01-10T10:00:00.000Z"
    },
    {
      "id": 189,
      "name": "Co Chu",
      "slug": "co-chu-neukoelln",
      "excerpt": "Modern Vietnamese street food with a Berlin twist in Neukoelln.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/189/cover.jpg",
      "cuisine": [
        {
          "id": 3,
          "name": "Vietnamese",
          "slug": "vietnamese"
        }
      ],
      "district": "neukoelln",
      "address": "Karl-Marx-Str. 56, 12043 Berlin",
      "priceRange": 2,
      "priceRangeDisplay": "EUR EUR",
      "rating": 4.5,
      "reviewCount": 178,
      "hasOffers": false,
      "featured": true,
      "openingHours": {
        "isOpenNow": false,
        "todayHours": "12:00 - 23:00"
      },
      "createdAt": "2026-02-05T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### GET /restaurants/:slug

Retrieve a single restaurant by its URL slug with full details including opening hours, images, and active offers.

**Authentication:** Public

### Request

```
GET /api/v1/restaurants/mama-pho-kreuzberg
```

### Response `200 OK`

```json
{
  "data": {
    "id": 145,
    "name": "Mama Pho",
    "slug": "mama-pho-kreuzberg",
    "description": "<p>Mama Pho has been serving authentic Vietnamese cuisine in Kreuzberg since 2018. Our recipes come straight from Hanoi, using fresh ingredients sourced daily from local markets.</p><h3>Specialties</h3><ul><li>Pho Bo (beef pho) - our signature dish with 12-hour bone broth</li><li>Banh Mi - crispy baguettes with various fillings</li><li>Bun Cha - grilled pork with rice noodles and herbs</li></ul>",
    "descriptionFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/145/cover.jpg",
    "images": [
      {
        "id": 301,
        "url": "https://cdn.iloveberlin.biz/restaurants/145/img-01.jpg",
        "alt": "Interior of Mama Pho",
        "caption": "The cozy interior with traditional Vietnamese decor",
        "order": 1
      },
      {
        "id": 302,
        "url": "https://cdn.iloveberlin.biz/restaurants/145/img-02.jpg",
        "alt": "Pho Bo at Mama Pho",
        "caption": "Our signature Pho Bo with 12-hour bone broth",
        "order": 2
      },
      {
        "id": 303,
        "url": "https://cdn.iloveberlin.biz/restaurants/145/img-03.jpg",
        "alt": "Banh Mi selection",
        "caption": "Freshly made Banh Mi with assorted fillings",
        "order": 3
      }
    ],
    "cuisine": [
      {
        "id": 3,
        "name": "Vietnamese",
        "slug": "vietnamese"
      }
    ],
    "district": "kreuzberg",
    "address": "Oranienstr. 158, 10969 Berlin",
    "latitude": 52.5020,
    "longitude": 13.4240,
    "phone": "+49 30 61620789",
    "email": "info@mamapho.de",
    "website": "https://mamapho.de",
    "priceRange": 1,
    "priceRangeDisplay": "EUR",
    "rating": 4.7,
    "reviewCount": 234,
    "featured": false,
    "openingHours": {
      "isOpenNow": true,
      "timezone": "Europe/Berlin",
      "schedule": {
        "monday": { "open": "11:00", "close": "22:00" },
        "tuesday": { "open": "11:00", "close": "22:00" },
        "wednesday": { "open": "11:00", "close": "22:00" },
        "thursday": { "open": "11:00", "close": "22:00" },
        "friday": { "open": "11:00", "close": "23:00" },
        "saturday": { "open": "12:00", "close": "23:00" },
        "sunday": { "open": "12:00", "close": "21:00" }
      }
    },
    "features": ["dine-in", "takeaway", "delivery", "outdoor-seating", "vegetarian-options"],
    "paymentMethods": ["cash", "ec-card", "credit-card"],
    "activeOffers": [
      {
        "id": 78,
        "title": "Lunch Special: Pho + Spring Roll",
        "description": "Get a bowl of any Pho with 2 spring rolls for a special price.",
        "discountType": "fixed",
        "discountValue": 9.90,
        "currency": "EUR",
        "validFrom": "2026-03-01T00:00:00.000Z",
        "validUntil": "2026-03-31T23:59:59.000Z",
        "conditions": "Monday to Friday, 11:00 - 15:00 only"
      }
    ],
    "seo": {
      "metaTitle": "Mama Pho - Vietnamese Restaurant in Kreuzberg | ILoveBerlin",
      "metaDescription": "Authentic Vietnamese pho, banh mi, and street food in Kreuzberg, Berlin.",
      "canonicalUrl": "https://iloveberlin.biz/restaurants/mama-pho-kreuzberg"
    },
    "relatedRestaurants": [
      {
        "id": 189,
        "name": "Co Chu",
        "slug": "co-chu-neukoelln",
        "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/189/cover.jpg",
        "cuisine": ["Vietnamese"],
        "priceRange": 2,
        "rating": 4.5
      }
    ],
    "createdAt": "2026-01-10T10:00:00.000Z",
    "updatedAt": "2026-03-10T14:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | `"Restaurant not found"` | Slug does not match a published restaurant |

---

### GET /restaurants/:id/offers

Retrieve all active dining offers for a specific restaurant.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 50) |
| `includeExpired` | boolean | `false` | Include recently expired offers (last 7 days) |

### Example Request

```
GET /api/v1/restaurants/145/offers?page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 78,
      "restaurantId": 145,
      "title": "Lunch Special: Pho + Spring Roll",
      "description": "Get a bowl of any Pho with 2 spring rolls for a special price.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/offers/78/cover.jpg",
      "discountType": "fixed",
      "discountValue": 9.90,
      "originalPrice": 14.80,
      "currency": "EUR",
      "displayPrice": "9,90 EUR (save 4,90 EUR)",
      "validFrom": "2026-03-01T00:00:00.000Z",
      "validUntil": "2026-03-31T23:59:59.000Z",
      "conditions": "Monday to Friday, 11:00 - 15:00 only",
      "isActive": true,
      "restaurant": {
        "id": 145,
        "name": "Mama Pho",
        "slug": "mama-pho-kreuzberg",
        "district": "kreuzberg"
      },
      "createdAt": "2026-02-25T10:00:00.000Z"
    },
    {
      "id": 82,
      "restaurantId": 145,
      "title": "Happy Hour: 2-for-1 Vietnamese Iced Coffee",
      "description": "Buy one Ca Phe Sua Da, get one free during happy hour.",
      "coverImageUrl": null,
      "discountType": "percentage",
      "discountValue": 50,
      "originalPrice": 4.50,
      "currency": "EUR",
      "displayPrice": "2,25 EUR (50% off)",
      "validFrom": "2026-03-01T00:00:00.000Z",
      "validUntil": "2026-04-30T23:59:59.000Z",
      "conditions": "Daily, 15:00 - 17:00",
      "isActive": true,
      "restaurant": {
        "id": 145,
        "name": "Mama Pho",
        "slug": "mama-pho-kreuzberg",
        "district": "kreuzberg"
      },
      "createdAt": "2026-02-28T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `404` | `"Restaurant not found"` | No restaurant with that ID |

---

### GET /dining/offers

Retrieve all active dining offers across all restaurants. Supports filtering by cuisine, district, and discount type.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `createdAt` | Sort field: `createdAt`, `discountValue`, `validUntil` |
| `order` | string | `desc` | Sort direction: `asc`, `desc` |
| `q` | string | -- | Full-text search across offer titles and descriptions |
| `cuisine` | string | -- | Filter by restaurant cuisine slug |
| `district` | string | -- | Filter by restaurant district slug |
| `discountType` | string | -- | Filter by discount type: `percentage`, `fixed`, `bogo` (buy one get one) |

### Example Request

```
GET /api/v1/dining/offers?district=kreuzberg&discountType=percentage&sort=discountValue&order=desc&page=1&limit=10
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 82,
      "title": "Happy Hour: 2-for-1 Vietnamese Iced Coffee",
      "description": "Buy one Ca Phe Sua Da, get one free during happy hour.",
      "coverImageUrl": null,
      "discountType": "percentage",
      "discountValue": 50,
      "originalPrice": 4.50,
      "currency": "EUR",
      "displayPrice": "2,25 EUR (50% off)",
      "validFrom": "2026-03-01T00:00:00.000Z",
      "validUntil": "2026-04-30T23:59:59.000Z",
      "conditions": "Daily, 15:00 - 17:00",
      "isActive": true,
      "restaurant": {
        "id": 145,
        "name": "Mama Pho",
        "slug": "mama-pho-kreuzberg",
        "district": "kreuzberg",
        "cuisine": ["Vietnamese"],
        "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/145/cover.jpg"
      },
      "createdAt": "2026-02-28T10:00:00.000Z"
    },
    {
      "id": 95,
      "title": "20% Off All Pizzas on Tuesdays",
      "description": "Enjoy any pizza from our menu at 20% off every Tuesday.",
      "coverImageUrl": "https://cdn.iloveberlin.biz/offers/95/cover.jpg",
      "discountType": "percentage",
      "discountValue": 20,
      "originalPrice": null,
      "currency": "EUR",
      "displayPrice": "20% off",
      "validFrom": "2026-03-01T00:00:00.000Z",
      "validUntil": "2026-06-30T23:59:59.000Z",
      "conditions": "Tuesdays only, dine-in only",
      "isActive": true,
      "restaurant": {
        "id": 210,
        "name": "Il Casolare",
        "slug": "il-casolare-kreuzberg",
        "district": "kreuzberg",
        "cuisine": ["Italian"],
        "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/210/cover.jpg"
      },
      "createdAt": "2026-02-20T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET /cuisines

Retrieve all available cuisine types with restaurant counts.

**Authentication:** Public

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | `name` | Sort field: `name`, `restaurantCount` |
| `order` | string | `asc` | Sort direction: `asc`, `desc` |

### Example Request

```
GET /api/v1/cuisines?sort=restaurantCount&order=desc
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "German",
      "slug": "german",
      "description": "Traditional German cuisine, from Schnitzel to Currywurst.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/german-icon.svg",
      "restaurantCount": 85
    },
    {
      "id": 2,
      "name": "Turkish",
      "slug": "turkish",
      "description": "Doener, lahmacun, pide, and more from Berlin's vibrant Turkish food scene.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/turkish-icon.svg",
      "restaurantCount": 72
    },
    {
      "id": 3,
      "name": "Vietnamese",
      "slug": "vietnamese",
      "description": "Pho, banh mi, and fresh Vietnamese flavors.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/vietnamese-icon.svg",
      "restaurantCount": 45
    },
    {
      "id": 4,
      "name": "Italian",
      "slug": "italian",
      "description": "Pizza, pasta, and authentic Italian trattorias.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/italian-icon.svg",
      "restaurantCount": 62
    },
    {
      "id": 5,
      "name": "Japanese",
      "slug": "japanese",
      "description": "Ramen, sushi, izakaya, and Japanese specialty restaurants.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/japanese-icon.svg",
      "restaurantCount": 38
    },
    {
      "id": 6,
      "name": "Indian",
      "slug": "indian",
      "description": "Curries, tandoori, biryani, and Indian street food.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/indian-icon.svg",
      "restaurantCount": 34
    },
    {
      "id": 10,
      "name": "Vegan",
      "slug": "vegan",
      "description": "Fully plant-based restaurants and cafes.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/vegan-icon.svg",
      "restaurantCount": 28
    },
    {
      "id": 12,
      "name": "Cafe & Breakfast",
      "slug": "breakfast",
      "description": "Brunch spots, bakeries, and all-day breakfast cafes.",
      "iconUrl": "https://cdn.iloveberlin.biz/cuisines/breakfast-icon.svg",
      "restaurantCount": 56
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## Editor Endpoints

### POST /restaurants

Create a new restaurant listing. New restaurants are created with `draft` status by default.

**Authentication:** Editor

### Request

```json
{
  "name": "Hamy Cafe",
  "description": "<p>Hamy Cafe has been a Kreuzberg institution since 2005, known for generous portions of Vietnamese comfort food at unbeatable prices. The no-frills atmosphere keeps the focus on the food, which is always fresh and bursting with flavor.</p>",
  "descriptionFormat": "html",
  "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/uploads/hamy-cover.jpg",
  "cuisineIds": [3],
  "district": "kreuzberg",
  "address": "Hasenheide 10, 10967 Berlin",
  "latitude": 52.4870,
  "longitude": 13.4210,
  "phone": "+49 30 69566640",
  "website": "https://hamycafe.de",
  "priceRange": 1,
  "openingHours": {
    "monday": { "open": "12:00", "close": "22:00" },
    "tuesday": { "open": "12:00", "close": "22:00" },
    "wednesday": { "open": "12:00", "close": "22:00" },
    "thursday": { "open": "12:00", "close": "22:00" },
    "friday": { "open": "12:00", "close": "23:00" },
    "saturday": { "open": "12:00", "close": "23:00" },
    "sunday": null
  },
  "features": ["dine-in", "takeaway", "cash-only"],
  "paymentMethods": ["cash"]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Min 2, max 150 chars |
| `description` | string | Yes | Min 50 chars, valid HTML or Markdown |
| `descriptionFormat` | string | No | `html` (default) or `markdown` |
| `coverImageUrl` | string | No | Valid URL |
| `cuisineIds` | integer[] | Yes | Array of existing cuisine IDs, min 1, max 5 |
| `district` | string | Yes | Valid Berlin district slug |
| `address` | string | Yes | Min 5, max 300 chars |
| `latitude` | number | Yes | Valid latitude |
| `longitude` | number | Yes | Valid longitude |
| `phone` | string | No | Valid phone number format |
| `email` | string | No | Valid email format |
| `website` | string | No | Valid URL |
| `priceRange` | integer | Yes | 1-4 (1 = budget, 4 = fine dining) |
| `openingHours` | object | No | Schedule object; null for closed days |
| `features` | string[] | No | Array of feature slugs |
| `paymentMethods` | string[] | No | Array: `cash`, `ec-card`, `credit-card`, `mobile-pay` |

### Response `201 Created`

```json
{
  "data": {
    "id": 250,
    "name": "Hamy Cafe",
    "slug": "hamy-cafe-kreuzberg",
    "description": "<p>Hamy Cafe has been a Kreuzberg institution since 2005...</p>",
    "descriptionFormat": "html",
    "coverImageUrl": "https://cdn.iloveberlin.biz/restaurants/uploads/hamy-cover.jpg",
    "images": [],
    "cuisine": [
      {
        "id": 3,
        "name": "Vietnamese",
        "slug": "vietnamese"
      }
    ],
    "district": "kreuzberg",
    "address": "Hasenheide 10, 10967 Berlin",
    "latitude": 52.4870,
    "longitude": 13.4210,
    "phone": "+49 30 69566640",
    "email": null,
    "website": "https://hamycafe.de",
    "priceRange": 1,
    "priceRangeDisplay": "EUR",
    "rating": null,
    "reviewCount": 0,
    "status": "draft",
    "featured": false,
    "openingHours": {
      "timezone": "Europe/Berlin",
      "schedule": {
        "monday": { "open": "12:00", "close": "22:00" },
        "tuesday": { "open": "12:00", "close": "22:00" },
        "wednesday": { "open": "12:00", "close": "22:00" },
        "thursday": { "open": "12:00", "close": "22:00" },
        "friday": { "open": "12:00", "close": "23:00" },
        "saturday": { "open": "12:00", "close": "23:00" },
        "sunday": null
      }
    },
    "features": ["dine-in", "takeaway", "cash-only"],
    "paymentMethods": ["cash"],
    "createdBy": {
      "id": 1042,
      "displayName": "Anna S."
    },
    "createdAt": "2026-03-12T17:00:00.000Z",
    "updatedAt": "2026-03-12T17:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing or invalid fields |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an editor |
| `404` | `"Cuisine not found"` | Invalid cuisineId in array |
| `409` | `"A restaurant with this name and district already exists"` | Duplicate listing |

---

### PATCH /restaurants/:id

Update an existing restaurant listing. Only the restaurant's creator or an admin can update it.

**Authentication:** Editor (own listings) or Admin (any listing)

### Request

```json
{
  "description": "<p>Hamy Cafe has been a Kreuzberg institution since 2005. Known for its legendary Pho and generous portions at unbeatable prices. Cash only!</p>",
  "openingHours": {
    "monday": { "open": "12:00", "close": "22:00" },
    "tuesday": { "open": "12:00", "close": "22:00" },
    "wednesday": { "open": "12:00", "close": "22:00" },
    "thursday": { "open": "12:00", "close": "22:00" },
    "friday": { "open": "12:00", "close": "23:00" },
    "saturday": { "open": "12:00", "close": "23:00" },
    "sunday": { "open": "13:00", "close": "21:00" }
  }
}
```

All fields from `POST /restaurants` are accepted; all are optional.

### Response `200 OK`

Returns the full updated restaurant object (same structure as `POST /restaurants` response).

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid field values |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only edit your own restaurant listings"` | Editor editing another's listing |
| `404` | `"Restaurant not found"` | No restaurant with that ID |

---

### DELETE /restaurants/:id

Soft-delete a restaurant listing. The restaurant is no longer visible publicly but can be restored by an admin.

**Authentication:** Editor (own listings) or Admin (any listing)

### Request

```
DELETE /api/v1/restaurants/250
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response `204 No Content`

No response body.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only delete your own restaurant listings"` | Editor deleting another's listing |
| `404` | `"Restaurant not found"` | No restaurant with that ID |

---

### POST /restaurants/:id/images

Upload one or more images for a restaurant. Accepts JPEG, PNG, or WebP. Max 10 images per restaurant. Max file size: 10 MB per image.

**Authentication:** Editor (own listings) or Admin (any listing)

### Request

```
POST /api/v1/restaurants/145/images
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

------boundary
Content-Disposition: form-data; name="images"; filename="interior.jpg"
Content-Type: image/jpeg

<binary data>
------boundary
Content-Disposition: form-data; name="images"; filename="pho-dish.jpg"
Content-Type: image/jpeg

<binary data>
------boundary
Content-Disposition: form-data; name="alt[]"
Content-Type: text/plain

Interior of Mama Pho restaurant
------boundary
Content-Disposition: form-data; name="alt[]"
Content-Type: text/plain

Signature Pho Bo dish
------boundary
Content-Disposition: form-data; name="captions[]"
Content-Type: text/plain

The warm, inviting interior of Mama Pho
------boundary
Content-Disposition: form-data; name="captions[]"
Content-Type: text/plain

Our famous Pho Bo with 12-hour bone broth
------boundary--
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `images` | file[] | Yes | JPEG, PNG, or WebP; max 10 MB each; max 5 files per upload |
| `alt[]` | string[] | No | Alt text for each image; max 200 chars |
| `captions[]` | string[] | No | Caption for each image; max 300 chars |

### Response `201 Created`

```json
{
  "data": [
    {
      "id": 304,
      "url": "https://cdn.iloveberlin.biz/restaurants/145/img-04.jpg",
      "alt": "Interior of Mama Pho restaurant",
      "caption": "The warm, inviting interior of Mama Pho",
      "order": 4,
      "createdAt": "2026-03-12T17:30:00.000Z"
    },
    {
      "id": 305,
      "url": "https://cdn.iloveberlin.biz/restaurants/145/img-05.jpg",
      "alt": "Signature Pho Bo dish",
      "caption": "Our famous Pho Bo with 12-hour bone broth",
      "order": 5,
      "createdAt": "2026-03-12T17:30:00.000Z"
    }
  ],
  "message": "2 images uploaded successfully"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"File type not allowed. Accepted: JPEG, PNG, WebP"` | Invalid file type |
| `400` | `"Maximum 10 images per restaurant. Currently 8, trying to add 5."` | Image limit exceeded |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: you can only upload images to your own restaurant listings"` | Editor uploading to another's listing |
| `404` | `"Restaurant not found"` | No restaurant with that ID |
| `413` | `"File size exceeds 10 MB limit"` | File too large |

---

### POST /dining/offers

Create a new dining offer associated with a restaurant.

**Authentication:** Editor

### Request

```json
{
  "restaurantId": 145,
  "title": "Weekend Brunch Special",
  "description": "Enjoy our special Vietnamese brunch menu including Pho, Banh Mi, and a Vietnamese iced coffee for one flat price.",
  "coverImageUrl": "https://cdn.iloveberlin.biz/offers/uploads/brunch-cover.jpg",
  "discountType": "fixed",
  "discountValue": 14.90,
  "originalPrice": 22.50,
  "currency": "EUR",
  "validFrom": "2026-04-01T00:00:00.000Z",
  "validUntil": "2026-06-30T23:59:59.000Z",
  "conditions": "Saturdays and Sundays, 10:00 - 14:00. Dine-in only."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `restaurantId` | integer | Yes | Must reference existing restaurant |
| `title` | string | Yes | Min 5, max 200 chars |
| `description` | string | Yes | Min 20, max 1000 chars |
| `coverImageUrl` | string | No | Valid URL |
| `discountType` | string | Yes | `percentage`, `fixed`, or `bogo` |
| `discountValue` | number | Yes | Positive number; for percentage, 1-100 |
| `originalPrice` | number | No | Original price before discount |
| `currency` | string | No | ISO 4217 code (default: `EUR`) |
| `validFrom` | string | Yes | ISO 8601 datetime |
| `validUntil` | string | Yes | ISO 8601 datetime, must be after `validFrom` |
| `conditions` | string | No | Max 500 chars |

### Response `201 Created`

```json
{
  "data": {
    "id": 110,
    "restaurantId": 145,
    "title": "Weekend Brunch Special",
    "description": "Enjoy our special Vietnamese brunch menu including Pho, Banh Mi, and a Vietnamese iced coffee for one flat price.",
    "coverImageUrl": "https://cdn.iloveberlin.biz/offers/uploads/brunch-cover.jpg",
    "discountType": "fixed",
    "discountValue": 14.90,
    "originalPrice": 22.50,
    "currency": "EUR",
    "displayPrice": "14,90 EUR (save 7,60 EUR)",
    "validFrom": "2026-04-01T00:00:00.000Z",
    "validUntil": "2026-06-30T23:59:59.000Z",
    "conditions": "Saturdays and Sundays, 10:00 - 14:00. Dine-in only.",
    "isActive": false,
    "restaurant": {
      "id": 145,
      "name": "Mama Pho",
      "slug": "mama-pho-kreuzberg",
      "district": "kreuzberg"
    },
    "createdBy": {
      "id": 1042,
      "displayName": "Anna S."
    },
    "createdAt": "2026-03-12T18:00:00.000Z",
    "updatedAt": "2026-03-12T18:00:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing or invalid fields |
| `400` | `"validUntil must be after validFrom"` | Invalid date range |
| `400` | `"discountValue must be between 1 and 100 for percentage type"` | Invalid percentage |
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `403` | `"Forbidden: insufficient permissions"` | User is not an editor |
| `404` | `"Restaurant not found"` | Invalid restaurantId |

**Error Example:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "discountValue",
      "message": "discountValue must be between 1 and 100 for percentage type"
    }
  ]
}
```

---

## User Endpoints

### POST /restaurants/:id/bookmark

Bookmark a restaurant for the authenticated user.

**Authentication:** User

### Request

```
POST /api/v1/restaurants/145/bookmark
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

No request body required.

### Response `201 Created`

```json
{
  "message": "Restaurant bookmarked successfully",
  "data": {
    "restaurantId": 145,
    "bookmarkedAt": "2026-03-12T18:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |
| `404` | `"Restaurant not found"` | No published restaurant with that ID |
| `409` | `"Restaurant is already bookmarked"` | Duplicate bookmark |

### Removing a Restaurant Bookmark

To remove a restaurant bookmark, use the general bookmarks management through the Users API:

```
DELETE /api/v1/users/me/bookmarks/:bookmarkId
```

Or filter bookmarks by type:

```
GET /api/v1/users/me/bookmarks?type=restaurant
```

---

## Error Codes

| Status Code | Error | Common Cause |
|-------------|-------|--------------|
| `400` | Bad Request | Validation failure, invalid parameters, invalid date ranges |
| `401` | Unauthorized | Missing or invalid access token |
| `403` | Forbidden | Insufficient role or editing another user's listing |
| `404` | Not Found | Restaurant, cuisine, or offer does not exist |
| `409` | Conflict | Duplicate listing or duplicate bookmark |
| `413` | Payload Too Large | Image file exceeds 10 MB |
| `429` | Too Many Requests | Rate limit exceeded |

---

## Rate Limiting

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `GET /restaurants` | 60 requests | 1 minute | Public tier |
| `GET /restaurants/:slug` | 60 requests | 1 minute | Public tier |
| `GET /restaurants/:id/offers` | 60 requests | 1 minute | Public tier |
| `GET /dining/offers` | 60 requests | 1 minute | Public tier |
| `GET /cuisines` | 60 requests | 1 minute | Public tier |
| `POST /restaurants` | 30 requests | 1 minute | Write tier |
| `PATCH /restaurants/:id` | 30 requests | 1 minute | Write tier |
| `DELETE /restaurants/:id` | 30 requests | 1 minute | Write tier |
| `POST /restaurants/:id/images` | 10 requests | 1 hour | Upload tier |
| `POST /dining/offers` | 30 requests | 1 minute | Write tier |
| `POST /restaurants/:id/bookmark` | 30 requests | 1 minute | Write tier |
