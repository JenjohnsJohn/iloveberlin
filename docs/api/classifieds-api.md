# Classifieds API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Classifieds API powers the community marketplace on the ILoveBerlin platform. Users can post classified listings (items for sale, housing, jobs, services), communicate with other users via threaded messages, and report inappropriate content. Admins moderate listings and handle reported content. Images are uploaded to Cloudflare R2.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/classifieds` | public | List published classifieds |
| `GET` | `/classifieds/:slug` | public | Get classified details |
| `GET` | `/classifieds/categories` | public | List classified categories |
| `POST` | `/classifieds` | user | Create a new classified listing |
| `PATCH` | `/classifieds/:id` | user | Update own listing |
| `DELETE` | `/classifieds/:id` | user | Delete own listing |
| `GET` | `/classifieds/my-listings` | user | List user's own listings |
| `POST` | `/classifieds/:id/images` | user | Upload images for a listing |
| `POST` | `/classifieds/:id/report` | user | Report a listing |
| `GET` | `/classifieds/messages` | user | List message threads |
| `GET` | `/classifieds/messages/:threadId` | user | Get messages in a thread |
| `POST` | `/classifieds/:id/message` | user | Send a message about a listing |
| `PATCH` | `/classifieds/:id/moderate` | admin | Moderate a listing |
| `GET` | `/classifieds/reports` | admin | List reported classifieds |

---

## Public Endpoints

### List Classifieds

```
GET /api/v1/classifieds
```

Returns a paginated list of published classified listings.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `sort` | string | `createdAt:desc` | Sort field. Options: `createdAt:desc`, `createdAt:asc`, `price:asc`, `price:desc` |
| `category` | string | — | Filter by category slug |
| `subcategory` | string | — | Filter by subcategory slug |
| `type` | string | — | Listing type: `for_sale`, `wanted`, `housing`, `jobs`, `services`, `free` |
| `priceMin` | number | — | Minimum price filter (EUR) |
| `priceMax` | number | — | Maximum price filter (EUR) |
| `district` | string | — | Filter by Berlin district (e.g., `kreuzberg`, `mitte`, `prenzlauer-berg`) |
| `q` | string | — | Free-text search query |
| `condition` | string | — | Item condition: `new`, `like_new`, `good`, `fair`, `poor` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/classifieds?category=furniture&district=kreuzberg&priceMax=200&sort=price:asc"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "cls_a1b2c3",
      "title": "Mid-century modern desk - solid walnut",
      "slug": "mid-century-modern-desk-solid-walnut",
      "description": "Beautiful mid-century modern desk in solid walnut. Minor scratches on the surface. Self-pickup in Kreuzberg.",
      "price": 120.00,
      "currency": "EUR",
      "priceType": "fixed",
      "type": "for_sale",
      "condition": "good",
      "category": {
        "id": "clscat_f1g2h3",
        "name": "Furniture",
        "slug": "furniture"
      },
      "district": "Kreuzberg",
      "images": [
        {
          "id": "img_001",
          "url": "https://media.iloveberlin.biz/classifieds/desk-walnut-1.jpg",
          "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/desk-walnut-1.jpg",
          "order": 1
        }
      ],
      "seller": {
        "id": "usr_k1l2m3",
        "firstName": "Jan",
        "lastInitial": "R.",
        "avatarUrl": "https://media.iloveberlin.biz/avatars/jan-r.jpg",
        "memberSince": "2024-06-15T00:00:00Z",
        "listingCount": 12
      },
      "isFeatured": false,
      "createdAt": "2026-03-10T09:00:00Z",
      "expiresAt": "2026-04-09T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 42,
    "totalPages": 3
  }
}
```

---

### Get Classified Details

```
GET /api/v1/classifieds/:slug
```

Returns full details for a single classified listing.

**Authentication:** None (public)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The classified listing URL slug |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/classifieds/mid-century-modern-desk-solid-walnut"
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "cls_a1b2c3",
    "title": "Mid-century modern desk - solid walnut",
    "slug": "mid-century-modern-desk-solid-walnut",
    "description": "Beautiful mid-century modern desk in solid walnut. Minor scratches on the surface but otherwise in great condition. Dimensions: 120cm x 60cm x 75cm. Self-pickup only in Kreuzberg (near Kottbusser Tor).",
    "price": 120.00,
    "currency": "EUR",
    "priceType": "fixed",
    "type": "for_sale",
    "condition": "good",
    "category": {
      "id": "clscat_f1g2h3",
      "name": "Furniture",
      "slug": "furniture"
    },
    "subcategory": {
      "id": "clssub_d1e2f3",
      "name": "Desks & Tables",
      "slug": "desks-tables"
    },
    "district": "Kreuzberg",
    "location": {
      "district": "Kreuzberg",
      "neighborhood": "Kottbusser Tor",
      "lat": 52.4987,
      "lng": 13.4184
    },
    "images": [
      {
        "id": "img_001",
        "url": "https://media.iloveberlin.biz/classifieds/desk-walnut-1.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/desk-walnut-1.jpg",
        "order": 1
      },
      {
        "id": "img_002",
        "url": "https://media.iloveberlin.biz/classifieds/desk-walnut-2.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/desk-walnut-2.jpg",
        "order": 2
      },
      {
        "id": "img_003",
        "url": "https://media.iloveberlin.biz/classifieds/desk-walnut-3.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/desk-walnut-3.jpg",
        "order": 3
      }
    ],
    "seller": {
      "id": "usr_k1l2m3",
      "firstName": "Jan",
      "lastInitial": "R.",
      "avatarUrl": "https://media.iloveberlin.biz/avatars/jan-r.jpg",
      "memberSince": "2024-06-15T00:00:00Z",
      "listingCount": 12,
      "responseRate": 0.92,
      "avgResponseTime": "2 hours"
    },
    "views": 87,
    "isFeatured": false,
    "status": "active",
    "createdAt": "2026-03-10T09:00:00Z",
    "updatedAt": "2026-03-10T09:00:00Z",
    "expiresAt": "2026-04-09T09:00:00Z"
  }
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Classified listing not found",
  "error": "Not Found"
}
```

---

### List Categories

```
GET /api/v1/classifieds/categories
```

Returns the classified category tree with subcategories and listing counts.

**Authentication:** None (public)

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/classifieds/categories"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "clscat_f1g2h3",
      "name": "Furniture",
      "slug": "furniture",
      "icon": "sofa",
      "listingCount": 234,
      "subcategories": [
        {
          "id": "clssub_d1e2f3",
          "name": "Desks & Tables",
          "slug": "desks-tables",
          "listingCount": 45
        },
        {
          "id": "clssub_g4h5i6",
          "name": "Sofas & Chairs",
          "slug": "sofas-chairs",
          "listingCount": 78
        },
        {
          "id": "clssub_j7k8l9",
          "name": "Storage & Shelving",
          "slug": "storage-shelving",
          "listingCount": 62
        }
      ]
    },
    {
      "id": "clscat_m1n2o3",
      "name": "Electronics",
      "slug": "electronics",
      "icon": "laptop",
      "listingCount": 189,
      "subcategories": [
        {
          "id": "clssub_p4q5r6",
          "name": "Computers & Laptops",
          "slug": "computers-laptops",
          "listingCount": 54
        },
        {
          "id": "clssub_s7t8u9",
          "name": "Phones & Tablets",
          "slug": "phones-tablets",
          "listingCount": 67
        }
      ]
    },
    {
      "id": "clscat_h1i2j3",
      "name": "Housing",
      "slug": "housing",
      "icon": "home",
      "listingCount": 156,
      "subcategories": [
        {
          "id": "clssub_v1w2x3",
          "name": "WG Rooms",
          "slug": "wg-rooms",
          "listingCount": 89
        },
        {
          "id": "clssub_y4z5a6",
          "name": "Sublets",
          "slug": "sublets",
          "listingCount": 67
        }
      ]
    }
  ]
}
```

---

## User Endpoints

### Create Classified Listing

```
POST /api/v1/classifieds
```

Creates a new classified listing. Listings are active for 30 days by default.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Listing title (5-100 characters) |
| `description` | string | yes | Description (20-5000 characters) |
| `price` | number | conditional | Price in EUR. Required for `for_sale` type. Set to `0` for free items |
| `priceType` | string | no | `fixed`, `negotiable`, `per_month` (housing). Default: `fixed` |
| `type` | string | yes | `for_sale`, `wanted`, `housing`, `jobs`, `services`, `free` |
| `condition` | string | conditional | Required for `for_sale`. Options: `new`, `like_new`, `good`, `fair`, `poor` |
| `categoryId` | string | yes | Category ID |
| `subcategoryId` | string | no | Subcategory ID |
| `district` | string | yes | Berlin district |
| `neighborhood` | string | no | Specific neighborhood |
| `contactMethod` | string | no | `message` (default), `email`, `phone` |
| `contactEmail` | string | conditional | Required if `contactMethod` is `email` |
| `contactPhone` | string | conditional | Required if `contactMethod` is `phone` |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/classifieds" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vintage Bianchi road bike - 56cm frame",
    "description": "Classic Bianchi road bike from the 1990s. Celeste green, recently serviced with new brake pads and chain. Frame size 56cm, suitable for riders 175-185cm. Test ride welcome in Friedrichshain.",
    "price": 350.00,
    "priceType": "negotiable",
    "type": "for_sale",
    "condition": "good",
    "categoryId": "clscat_b1c2d3",
    "subcategoryId": "clssub_e4f5g6",
    "district": "Friedrichshain",
    "neighborhood": "Boxhagener Platz",
    "contactMethod": "message"
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "cls_d4e5f6",
    "title": "Vintage Bianchi road bike - 56cm frame",
    "slug": "vintage-bianchi-road-bike-56cm-frame",
    "description": "Classic Bianchi road bike from the 1990s. Celeste green, recently serviced with new brake pads and chain. Frame size 56cm, suitable for riders 175-185cm. Test ride welcome in Friedrichshain.",
    "price": 350.00,
    "currency": "EUR",
    "priceType": "negotiable",
    "type": "for_sale",
    "condition": "good",
    "category": {
      "id": "clscat_b1c2d3",
      "name": "Sports & Outdoors",
      "slug": "sports-outdoors"
    },
    "subcategory": {
      "id": "clssub_e4f5g6",
      "name": "Bicycles",
      "slug": "bicycles"
    },
    "district": "Friedrichshain",
    "location": {
      "district": "Friedrichshain",
      "neighborhood": "Boxhagener Platz"
    },
    "images": [],
    "seller": {
      "id": "usr_a1b2c3",
      "firstName": "Alex",
      "lastInitial": "M."
    },
    "status": "active",
    "views": 0,
    "createdAt": "2026-03-12T16:00:00Z",
    "expiresAt": "2026-04-11T16:00:00Z"
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": [
    "title must be between 5 and 100 characters",
    "condition is required for for_sale listings"
  ],
  "error": "Bad Request"
}
```

---

### Update Classified Listing

```
PATCH /api/v1/classifieds/:id
```

Updates an existing classified listing. Users can only update their own listings.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The classified listing ID |

**Request Body:** Any subset of the fields from the create endpoint. Additionally:

| Field | Type | Description |
|-------|------|-------------|
| `renew` | boolean | Extends the listing expiry by 30 days from now |
| `status` | string | `active`, `sold`, `withdrawn` |

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/classifieds/cls_d4e5f6" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "price": 300.00,
    "description": "Classic Bianchi road bike from the 1990s. Price reduced! Celeste green, recently serviced..."
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "cls_d4e5f6",
    "title": "Vintage Bianchi road bike - 56cm frame",
    "slug": "vintage-bianchi-road-bike-56cm-frame",
    "price": 300.00,
    "description": "Classic Bianchi road bike from the 1990s. Price reduced! Celeste green, recently serviced...",
    "updatedAt": "2026-03-12T17:00:00Z"
  }
}
```

**Error Response: `403 Forbidden`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: you can only edit your own listings",
  "error": "Forbidden"
}
```

---

### Delete Classified Listing

```
DELETE /api/v1/classifieds/:id
```

Soft-deletes a classified listing. Users can only delete their own listings. Admins can delete any listing.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The classified listing ID |

**Request Example:**

```bash
curl -X DELETE "https://iloveberlin.biz/api/v1/classifieds/cls_d4e5f6" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `204 No Content`**

No response body.

---

### List My Listings

```
GET /api/v1/classifieds/my-listings
```

Returns all listings created by the authenticated user.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `status` | string | — | Filter by status: `active`, `sold`, `expired`, `withdrawn`, `moderated` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/classifieds/my-listings?status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "cls_d4e5f6",
      "title": "Vintage Bianchi road bike - 56cm frame",
      "slug": "vintage-bianchi-road-bike-56cm-frame",
      "price": 300.00,
      "currency": "EUR",
      "type": "for_sale",
      "status": "active",
      "views": 23,
      "messageCount": 4,
      "images": [
        {
          "id": "img_010",
          "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/bianchi-1.jpg",
          "order": 1
        }
      ],
      "createdAt": "2026-03-12T16:00:00Z",
      "expiresAt": "2026-04-11T16:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

---

### Upload Images

```
POST /api/v1/classifieds/:id/images
```

Uploads images for a classified listing. Maximum 8 images per listing. Accepts `multipart/form-data`.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The classified listing ID |

**Request Body:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | file[] | yes | Image files (JPEG, PNG, WebP). Max 5MB each, max 8 total per listing |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/classifieds/cls_d4e5f6/images" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "images=@bianchi-front.jpg" \
  -F "images=@bianchi-side.jpg" \
  -F "images=@bianchi-detail.jpg"
```

**Response: `201 Created`**

```json
{
  "data": {
    "listingId": "cls_d4e5f6",
    "images": [
      {
        "id": "img_010",
        "url": "https://media.iloveberlin.biz/classifieds/bianchi-front.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/bianchi-front.jpg",
        "order": 1,
        "size": 2450000,
        "width": 1920,
        "height": 1440
      },
      {
        "id": "img_011",
        "url": "https://media.iloveberlin.biz/classifieds/bianchi-side.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/bianchi-side.jpg",
        "order": 2,
        "size": 1980000,
        "width": 1920,
        "height": 1440
      },
      {
        "id": "img_012",
        "url": "https://media.iloveberlin.biz/classifieds/bianchi-detail.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/bianchi-detail.jpg",
        "order": 3,
        "size": 1120000,
        "width": 1920,
        "height": 1440
      }
    ],
    "totalImages": 3,
    "maxImages": 8
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Maximum 8 images per listing. You already have 6 images and tried to upload 4.",
  "error": "Bad Request"
}
```

---

### Report a Listing

```
POST /api/v1/classifieds/:id/report
```

Reports a classified listing for policy violations.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The classified listing ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | yes | Report reason: `spam`, `scam`, `prohibited_item`, `inappropriate`, `duplicate`, `wrong_category`, `other` |
| `details` | string | no | Additional details (max 1000 characters) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/classifieds/cls_x1y2z3/report" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "scam",
    "details": "This listing appears to be a scam. The seller is asking for wire transfer payment upfront and the price is suspiciously low for the item described."
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "reportId": "rpt_a1b2c3",
    "listingId": "cls_x1y2z3",
    "reason": "scam",
    "status": "pending",
    "createdAt": "2026-03-12T18:00:00Z"
  }
}
```

**Error Response: `409 Conflict`**

```json
{
  "statusCode": 409,
  "message": "You have already reported this listing",
  "error": "Conflict"
}
```

---

## Messaging Endpoints

### List Message Threads

```
GET /api/v1/classifieds/messages
```

Returns all message threads for the authenticated user (both as buyer and seller).

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `role` | string | — | Filter: `buyer` (threads where I initiated), `seller` (threads on my listings) |
| `unreadOnly` | boolean | `false` | Show only threads with unread messages |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/classifieds/messages?role=seller&unreadOnly=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "threadId": "thr_a1b2c3",
      "listing": {
        "id": "cls_d4e5f6",
        "title": "Vintage Bianchi road bike - 56cm frame",
        "slug": "vintage-bianchi-road-bike-56cm-frame",
        "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/bianchi-front.jpg",
        "price": 300.00,
        "status": "active"
      },
      "otherParty": {
        "id": "usr_p1q2r3",
        "firstName": "Maria",
        "lastInitial": "S.",
        "avatarUrl": "https://media.iloveberlin.biz/avatars/maria-s.jpg"
      },
      "lastMessage": {
        "body": "Hi! Is this bike still available? I could pick it up this weekend.",
        "sentAt": "2026-03-12T15:30:00Z",
        "isFromMe": false
      },
      "unreadCount": 1,
      "messageCount": 1,
      "createdAt": "2026-03-12T15:30:00Z",
      "updatedAt": "2026-03-12T15:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 4,
    "totalPages": 1
  }
}
```

---

### Get Thread Messages

```
GET /api/v1/classifieds/messages/:threadId
```

Returns all messages within a specific thread. Marks unread messages as read.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `threadId` | string | The message thread ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `50` | Items per page (max: 100) |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/classifieds/messages/thr_a1b2c3" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "threadId": "thr_a1b2c3",
    "listing": {
      "id": "cls_d4e5f6",
      "title": "Vintage Bianchi road bike - 56cm frame",
      "slug": "vintage-bianchi-road-bike-56cm-frame",
      "price": 300.00,
      "status": "active"
    },
    "participants": [
      {
        "id": "usr_a1b2c3",
        "firstName": "Alex",
        "lastInitial": "M.",
        "role": "seller"
      },
      {
        "id": "usr_p1q2r3",
        "firstName": "Maria",
        "lastInitial": "S.",
        "role": "buyer"
      }
    ],
    "messages": [
      {
        "id": "msg_001",
        "body": "Hi! Is this bike still available? I could pick it up this weekend.",
        "sender": {
          "id": "usr_p1q2r3",
          "firstName": "Maria",
          "lastInitial": "S."
        },
        "isFromMe": false,
        "readAt": "2026-03-12T18:00:00Z",
        "sentAt": "2026-03-12T15:30:00Z"
      },
      {
        "id": "msg_002",
        "body": "Yes, still available! Saturday afternoon works well for me. I'm near Boxhagener Platz.",
        "sender": {
          "id": "usr_a1b2c3",
          "firstName": "Alex",
          "lastInitial": "M."
        },
        "isFromMe": true,
        "readAt": null,
        "sentAt": "2026-03-12T18:05:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 50,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

**Error Response: `403 Forbidden`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: you are not a participant in this thread",
  "error": "Forbidden"
}
```

---

### Send Message

```
POST /api/v1/classifieds/:id/message
```

Sends a message about a classified listing. Creates a new thread if one does not exist between the two users for this listing.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The classified listing ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `body` | string | yes | Message content (1-2000 characters) |
| `threadId` | string | no | Existing thread ID to reply to. If omitted, a new thread is created |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/classifieds/cls_d4e5f6/message" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Hi! Is this bike still available? I could pick it up this weekend."
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "messageId": "msg_001",
    "threadId": "thr_a1b2c3",
    "listingId": "cls_d4e5f6",
    "body": "Hi! Is this bike still available? I could pick it up this weekend.",
    "sentAt": "2026-03-12T15:30:00Z"
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Cannot send messages on your own listing",
  "error": "Bad Request"
}
```

---

## Admin Endpoints

### Moderate Listing

```
PATCH /api/v1/classifieds/:id/moderate
```

Applies a moderation action to a classified listing.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The classified listing ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | yes | `approve`, `reject`, `suspend`, `remove` |
| `reason` | string | conditional | Required for `reject`, `suspend`, `remove` |
| `notifyUser` | boolean | no | Send notification to the listing owner (default: `true`) |

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/classifieds/cls_x1y2z3/moderate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove",
    "reason": "Listing violates our policy against prohibited items. Please review our community guidelines.",
    "notifyUser": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "listingId": "cls_x1y2z3",
    "action": "remove",
    "reason": "Listing violates our policy against prohibited items. Please review our community guidelines.",
    "moderatedBy": "usr_admin1",
    "previousStatus": "active",
    "newStatus": "removed",
    "userNotified": true,
    "moderatedAt": "2026-03-12T19:00:00Z"
  }
}
```

---

### List Reports

```
GET /api/v1/classifieds/reports
```

Returns a paginated list of reported classifieds.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `status` | string | `pending` | Report status: `pending`, `reviewed`, `resolved`, `dismissed` |
| `reason` | string | — | Filter by report reason |
| `sort` | string | `createdAt:desc` | Sort: `createdAt:desc`, `createdAt:asc`, `reportCount:desc` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/classifieds/reports?status=pending" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "reportId": "rpt_a1b2c3",
      "listing": {
        "id": "cls_x1y2z3",
        "title": "Suspicious electronics deal",
        "slug": "suspicious-electronics-deal",
        "seller": {
          "id": "usr_z9y8x7",
          "firstName": "Unknown",
          "lastName": "User",
          "email": "unknown@example.com"
        },
        "status": "active"
      },
      "reportedBy": {
        "id": "usr_a1b2c3",
        "firstName": "Alex",
        "lastName": "Meier"
      },
      "reason": "scam",
      "details": "This listing appears to be a scam. The seller is asking for wire transfer payment upfront and the price is suspiciously low.",
      "totalReports": 3,
      "status": "pending",
      "createdAt": "2026-03-12T18:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 8,
    "totalPages": 1
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
| `400` | Bad Request | Invalid input, validation failure, or business rule violation |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions (editing another user's listing, accessing another user's thread) |
| `404` | Not Found | Listing, thread, or category not found |
| `409` | Conflict | Duplicate report or duplicate listing slug |
| `413` | Payload Too Large | Image file exceeds 5MB limit |
| `422` | Unprocessable Entity | Image format not supported |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Endpoint Group | Rate Limit | Window |
|----------------|-----------|--------|
| `GET /classifieds`, `GET /classifieds/categories` | 120 requests | 1 minute |
| `GET /classifieds/:slug` | 60 requests | 1 minute |
| `POST /classifieds` | 5 requests | 1 minute |
| `POST /classifieds/:id/images` | 10 requests | 1 minute |
| `POST /classifieds/:id/message` | 20 requests | 1 minute |
| `POST /classifieds/:id/report` | 5 requests | 1 minute |
| `GET /classifieds/messages` | 60 requests | 1 minute |
| Admin endpoints | 30 requests | 1 minute |

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
