# Store API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Store API manages the ILoveBerlin e-commerce shop, including product catalog browsing, shopping cart management, Stripe-powered checkout, and order tracking. Admins manage products, orders, and discount codes. Payments are processed via Stripe with webhook confirmation.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **Products** | | | |
| `GET` | `/products` | public | List products |
| `GET` | `/products/:slug` | public | Get product details |
| `GET` | `/product-categories` | public | List product categories |
| `POST` | `/products` | admin | Create a product |
| `PATCH` | `/products/:id` | admin | Update a product |
| **Cart** | | | |
| `GET` | `/cart` | user | Get current cart |
| `POST` | `/cart/items` | user | Add item to cart |
| `PATCH` | `/cart/items/:id` | user | Update cart item quantity |
| `DELETE` | `/cart/items/:id` | user | Remove item from cart |
| `POST` | `/cart/discount` | user | Apply discount code |
| **Checkout** | | | |
| `POST` | `/checkout` | user | Create checkout session |
| `POST` | `/checkout/webhook` | — | Stripe webhook handler |
| **Orders** | | | |
| `GET` | `/orders` | user | List user's orders |
| `GET` | `/orders/:id` | user | Get order details |
| `GET` | `/admin/orders` | admin | List all orders |
| `PATCH` | `/admin/orders/:id/status` | admin | Update order status |
| `POST` | `/discount-codes` | admin | Create discount code |

---

## Product Endpoints (Public)

### List Products

```
GET /api/v1/products
```

Returns a paginated list of published products.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `sort` | string | `createdAt:desc` | Sort field. Options: `createdAt:desc`, `createdAt:asc`, `price:asc`, `price:desc`, `name:asc`, `bestselling` |
| `category` | string | — | Filter by category slug |
| `priceMin` | number | — | Minimum price (EUR) |
| `priceMax` | number | — | Maximum price (EUR) |
| `inStock` | boolean | — | Filter by stock availability |
| `tag` | string | — | Filter by tag slug |
| `q` | string | — | Free-text search |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/products?category=apparel&sort=bestselling&limit=12"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "prod_a1b2c3",
      "name": "I Love Berlin Classic Tee",
      "slug": "i-love-berlin-classic-tee",
      "shortDescription": "Our signature tee featuring the iconic ILoveBerlin logo. 100% organic cotton.",
      "price": 29.90,
      "compareAtPrice": null,
      "currency": "EUR",
      "images": [
        {
          "id": "pimg_001",
          "url": "https://media.iloveberlin.biz/products/classic-tee-black-front.jpg",
          "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/classic-tee-black-front.jpg",
          "alt": "I Love Berlin Classic Tee - Black - Front",
          "order": 1
        }
      ],
      "category": {
        "id": "pcat_a1b2c3",
        "name": "Apparel",
        "slug": "apparel"
      },
      "variants": [
        { "id": "var_001", "name": "S / Black", "inStock": true },
        { "id": "var_002", "name": "M / Black", "inStock": true },
        { "id": "var_003", "name": "L / Black", "inStock": true },
        { "id": "var_004", "name": "XL / Black", "inStock": false }
      ],
      "inStock": true,
      "isNew": false,
      "isFeatured": true,
      "averageRating": 4.7,
      "reviewCount": 42,
      "createdAt": "2025-06-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "totalItems": 48,
    "totalPages": 4
  }
}
```

---

### Get Product Details

```
GET /api/v1/products/:slug
```

Returns full details for a single product.

**Authentication:** None (public)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The product URL slug |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/products/i-love-berlin-classic-tee"
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "prod_a1b2c3",
    "name": "I Love Berlin Classic Tee",
    "slug": "i-love-berlin-classic-tee",
    "shortDescription": "Our signature tee featuring the iconic ILoveBerlin logo. 100% organic cotton.",
    "description": "## I Love Berlin Classic Tee\n\nShow your love for Berlin with our signature tee. Made from **100% GOTS-certified organic cotton**, this shirt is soft, durable, and ethically produced.\n\n### Details\n- Unisex regular fit\n- Crew neck\n- Screen-printed logo\n- Pre-shrunk\n- Machine washable at 30°C\n\n### Size Guide\n| Size | Chest (cm) | Length (cm) |\n|------|-----------|-------------|\n| S | 96 | 70 |\n| M | 102 | 72 |\n| L | 108 | 74 |\n| XL | 114 | 76 |",
    "price": 29.90,
    "compareAtPrice": null,
    "currency": "EUR",
    "sku": "ILB-TEE-BLK",
    "weight": 200,
    "weightUnit": "g",
    "images": [
      {
        "id": "pimg_001",
        "url": "https://media.iloveberlin.biz/products/classic-tee-black-front.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/classic-tee-black-front.jpg",
        "alt": "I Love Berlin Classic Tee - Black - Front",
        "order": 1
      },
      {
        "id": "pimg_002",
        "url": "https://media.iloveberlin.biz/products/classic-tee-black-back.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/classic-tee-black-back.jpg",
        "alt": "I Love Berlin Classic Tee - Black - Back",
        "order": 2
      },
      {
        "id": "pimg_003",
        "url": "https://media.iloveberlin.biz/products/classic-tee-black-detail.jpg",
        "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/classic-tee-black-detail.jpg",
        "alt": "I Love Berlin Classic Tee - Print Detail",
        "order": 3
      }
    ],
    "category": {
      "id": "pcat_a1b2c3",
      "name": "Apparel",
      "slug": "apparel"
    },
    "tags": [
      { "id": "ptag_001", "name": "T-Shirts", "slug": "t-shirts" },
      { "id": "ptag_002", "name": "Organic", "slug": "organic" }
    ],
    "variants": [
      {
        "id": "var_001",
        "sku": "ILB-TEE-BLK-S",
        "name": "S / Black",
        "options": { "size": "S", "color": "Black" },
        "price": 29.90,
        "inStock": true,
        "stockQuantity": 45
      },
      {
        "id": "var_002",
        "sku": "ILB-TEE-BLK-M",
        "name": "M / Black",
        "options": { "size": "M", "color": "Black" },
        "price": 29.90,
        "inStock": true,
        "stockQuantity": 32
      },
      {
        "id": "var_003",
        "sku": "ILB-TEE-BLK-L",
        "name": "L / Black",
        "options": { "size": "L", "color": "Black" },
        "price": 29.90,
        "inStock": true,
        "stockQuantity": 18
      },
      {
        "id": "var_004",
        "sku": "ILB-TEE-BLK-XL",
        "name": "XL / Black",
        "options": { "size": "XL", "color": "Black" },
        "price": 29.90,
        "inStock": false,
        "stockQuantity": 0
      }
    ],
    "shipping": {
      "freeShippingThreshold": 50.00,
      "standardShipping": 4.95,
      "estimatedDays": "3-5"
    },
    "inStock": true,
    "isNew": false,
    "isFeatured": true,
    "averageRating": 4.7,
    "reviewCount": 42,
    "relatedProducts": [
      {
        "id": "prod_d4e5f6",
        "name": "I Love Berlin Hoodie",
        "slug": "i-love-berlin-hoodie",
        "price": 59.90,
        "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/hoodie-black-front.jpg",
        "inStock": true
      }
    ],
    "createdAt": "2025-06-01T10:00:00Z",
    "updatedAt": "2026-03-01T12:00:00Z"
  }
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

---

### List Product Categories

```
GET /api/v1/product-categories
```

Returns all product categories with product counts.

**Authentication:** None (public)

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/product-categories"
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "pcat_a1b2c3",
      "name": "Apparel",
      "slug": "apparel",
      "description": "T-shirts, hoodies, and accessories with Berlin-inspired designs",
      "imageUrl": "https://media.iloveberlin.biz/categories/apparel.jpg",
      "productCount": 24
    },
    {
      "id": "pcat_d4e5f6",
      "name": "Prints & Posters",
      "slug": "prints-posters",
      "description": "Art prints and posters featuring iconic Berlin landmarks and street art",
      "imageUrl": "https://media.iloveberlin.biz/categories/prints.jpg",
      "productCount": 18
    },
    {
      "id": "pcat_g7h8i9",
      "name": "Books & Maps",
      "slug": "books-maps",
      "description": "Curated Berlin guidebooks, photo books, and illustrated maps",
      "imageUrl": "https://media.iloveberlin.biz/categories/books.jpg",
      "productCount": 12
    },
    {
      "id": "pcat_j1k2l3",
      "name": "Gifts & Souvenirs",
      "slug": "gifts-souvenirs",
      "description": "Unique Berlin-themed gifts, from Ampelmännchen to currywurst kits",
      "imageUrl": "https://media.iloveberlin.biz/categories/gifts.jpg",
      "productCount": 30
    }
  ]
}
```

---

## Cart Endpoints

### Get Cart

```
GET /api/v1/cart
```

Returns the authenticated user's current shopping cart.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/cart" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "cart_a1b2c3",
    "items": [
      {
        "id": "ci_001",
        "product": {
          "id": "prod_a1b2c3",
          "name": "I Love Berlin Classic Tee",
          "slug": "i-love-berlin-classic-tee",
          "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/classic-tee-black-front.jpg"
        },
        "variant": {
          "id": "var_002",
          "name": "M / Black",
          "sku": "ILB-TEE-BLK-M",
          "options": { "size": "M", "color": "Black" }
        },
        "quantity": 2,
        "unitPrice": 29.90,
        "lineTotal": 59.80,
        "inStock": true
      },
      {
        "id": "ci_002",
        "product": {
          "id": "prod_g7h8i9",
          "name": "Berlin Illustrated Map Poster",
          "slug": "berlin-illustrated-map-poster",
          "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/berlin-map-poster.jpg"
        },
        "variant": {
          "id": "var_010",
          "name": "A2 / Unframed",
          "sku": "ILB-MAP-A2",
          "options": { "size": "A2", "framing": "Unframed" }
        },
        "quantity": 1,
        "unitPrice": 24.90,
        "lineTotal": 24.90,
        "inStock": true
      }
    ],
    "discount": null,
    "subtotal": 84.70,
    "shippingCost": 0.00,
    "shippingNote": "Free shipping on orders over 50 EUR",
    "tax": 16.09,
    "taxRate": 0.19,
    "total": 100.79,
    "currency": "EUR",
    "itemCount": 3,
    "updatedAt": "2026-03-12T14:00:00Z"
  }
}
```

---

### Add Item to Cart

```
POST /api/v1/cart/items
```

Adds a product variant to the shopping cart. If the variant already exists in the cart, the quantity is incremented.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | string | yes | Product ID |
| `variantId` | string | yes | Variant ID |
| `quantity` | integer | no | Quantity to add (default: `1`, max: `10`) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/cart/items" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_a1b2c3",
    "variantId": "var_002",
    "quantity": 2
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "ci_001",
    "product": {
      "id": "prod_a1b2c3",
      "name": "I Love Berlin Classic Tee",
      "slug": "i-love-berlin-classic-tee"
    },
    "variant": {
      "id": "var_002",
      "name": "M / Black"
    },
    "quantity": 2,
    "unitPrice": 29.90,
    "lineTotal": 59.80,
    "cartTotal": 59.80,
    "cartItemCount": 2
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "This variant is out of stock",
  "error": "Bad Request"
}
```

**Error Response: `422 Unprocessable Entity`**

```json
{
  "statusCode": 422,
  "message": "Maximum quantity per item is 10",
  "error": "Unprocessable Entity"
}
```

---

### Update Cart Item Quantity

```
PATCH /api/v1/cart/items/:id
```

Updates the quantity of an item in the cart.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The cart item ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quantity` | integer | yes | New quantity (1-10). Set to `0` to remove |

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/cart/items/ci_001" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "ci_001",
    "quantity": 3,
    "unitPrice": 29.90,
    "lineTotal": 89.70,
    "cartTotal": 114.60,
    "cartItemCount": 4
  }
}
```

---

### Remove Cart Item

```
DELETE /api/v1/cart/items/:id
```

Removes an item from the cart.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The cart item ID |

**Request Example:**

```bash
curl -X DELETE "https://iloveberlin.biz/api/v1/cart/items/ci_002" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "removedItemId": "ci_002",
    "cartTotal": 89.70,
    "cartItemCount": 3
  }
}
```

---

### Apply Discount Code

```
POST /api/v1/cart/discount
```

Applies a discount code to the cart.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | yes | Discount code |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/cart/discount" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BERLIN20"
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "code": "BERLIN20",
    "type": "percentage",
    "value": 20,
    "description": "20% off your order",
    "discountAmount": 17.94,
    "newSubtotal": 84.70,
    "newTotal": 79.47,
    "appliedAt": "2026-03-12T15:00:00Z"
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Discount code 'EXPIRED10' has expired",
  "error": "Bad Request"
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Discount code not found",
  "error": "Not Found"
}
```

---

## Checkout Endpoints

### Create Checkout Session

```
POST /api/v1/checkout
```

Creates a Stripe checkout session for the current cart. Returns a Stripe session URL for redirect.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shippingAddress` | object | yes | Shipping address |
| `shippingAddress.firstName` | string | yes | First name |
| `shippingAddress.lastName` | string | yes | Last name |
| `shippingAddress.street` | string | yes | Street address |
| `shippingAddress.city` | string | yes | City |
| `shippingAddress.postalCode` | string | yes | Postal code |
| `shippingAddress.country` | string | yes | ISO 3166-1 alpha-2 country code |
| `shippingAddress.phone` | string | no | Phone number |
| `billingAddress` | object | no | Billing address. If omitted, shipping address is used |
| `shippingMethod` | string | no | `standard` (default), `express` |
| `notes` | string | no | Order notes (max 500 characters) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/checkout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "firstName": "Anna",
      "lastName": "Schmidt",
      "street": "Kastanienallee 42",
      "city": "Berlin",
      "postalCode": "10435",
      "country": "DE",
      "phone": "+49 170 1234567"
    },
    "shippingMethod": "standard"
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "orderId": "ord_a1b2c3",
    "stripeSessionId": "cs_live_a1b2c3d4e5f6",
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_a1b2c3d4e5f6",
    "expiresAt": "2026-03-12T16:00:00Z",
    "orderSummary": {
      "subtotal": 89.70,
      "discount": 17.94,
      "shippingCost": 0.00,
      "tax": 13.63,
      "total": 85.39,
      "currency": "EUR",
      "itemCount": 3
    }
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Your cart is empty",
  "error": "Bad Request"
}
```

**Error Response: `409 Conflict`**

```json
{
  "statusCode": 409,
  "message": "Some items in your cart are no longer available: I Love Berlin Classic Tee (XL / Black) is out of stock",
  "error": "Conflict"
}
```

---

### Stripe Webhook

```
POST /api/v1/checkout/webhook
```

Handles Stripe payment webhooks. This endpoint is called by Stripe, not by client applications.

**Authentication:** Stripe webhook signature verification (`Stripe-Signature` header)

**Handled Events:**

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Mark order as paid, send confirmation email |
| `payment_intent.payment_failed` | Mark order as payment failed, notify user |
| `charge.refunded` | Process refund, update order status |
| `charge.dispute.created` | Flag order for review |

**Request Headers:**

```
Stripe-Signature: t=1710288000,v1=abc123...
Content-Type: application/json
```

**Response: `200 OK`**

```json
{
  "received": true
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Webhook signature verification failed",
  "error": "Bad Request"
}
```

---

## Order Endpoints

### List Orders

```
GET /api/v1/orders
```

Returns the authenticated user's order history.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 50) |
| `status` | string | — | Filter by status: `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `sort` | string | `createdAt:desc` | Sort: `createdAt:desc`, `createdAt:asc` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/orders" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "ord_a1b2c3",
      "orderNumber": "ILB-20260312-001",
      "status": "shipped",
      "items": [
        {
          "productName": "I Love Berlin Classic Tee",
          "variantName": "M / Black",
          "quantity": 3,
          "unitPrice": 29.90,
          "lineTotal": 89.70,
          "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/classic-tee-black-front.jpg"
        }
      ],
      "subtotal": 89.70,
      "discount": 17.94,
      "shippingCost": 0.00,
      "tax": 13.63,
      "total": 85.39,
      "currency": "EUR",
      "itemCount": 3,
      "tracking": {
        "carrier": "DHL",
        "trackingNumber": "1234567890",
        "trackingUrl": "https://www.dhl.de/en/privatkunden/pakete-empfangen/verfolgen.html?piececode=1234567890"
      },
      "createdAt": "2026-03-12T15:15:00Z",
      "paidAt": "2026-03-12T15:16:00Z",
      "shippedAt": "2026-03-13T09:00:00Z"
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

### Get Order Details

```
GET /api/v1/orders/:id
```

Returns full details for a specific order.

**Authentication:** User+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The order ID |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/orders/ord_a1b2c3" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "ord_a1b2c3",
    "orderNumber": "ILB-20260312-001",
    "status": "shipped",
    "items": [
      {
        "id": "oi_001",
        "product": {
          "id": "prod_a1b2c3",
          "name": "I Love Berlin Classic Tee",
          "slug": "i-love-berlin-classic-tee"
        },
        "variant": {
          "id": "var_002",
          "name": "M / Black",
          "sku": "ILB-TEE-BLK-M"
        },
        "quantity": 3,
        "unitPrice": 29.90,
        "lineTotal": 89.70,
        "thumbnailUrl": "https://media.iloveberlin.biz/products/thumbs/classic-tee-black-front.jpg"
      }
    ],
    "subtotal": 89.70,
    "discount": {
      "code": "BERLIN20",
      "type": "percentage",
      "value": 20,
      "amount": 17.94
    },
    "shippingCost": 0.00,
    "shippingMethod": "standard",
    "tax": 13.63,
    "taxRate": 0.19,
    "total": 85.39,
    "currency": "EUR",
    "shippingAddress": {
      "firstName": "Anna",
      "lastName": "Schmidt",
      "street": "Kastanienallee 42",
      "city": "Berlin",
      "postalCode": "10435",
      "country": "DE",
      "phone": "+49 170 1234567"
    },
    "billingAddress": {
      "firstName": "Anna",
      "lastName": "Schmidt",
      "street": "Kastanienallee 42",
      "city": "Berlin",
      "postalCode": "10435",
      "country": "DE"
    },
    "tracking": {
      "carrier": "DHL",
      "trackingNumber": "1234567890",
      "trackingUrl": "https://www.dhl.de/en/privatkunden/pakete-empfangen/verfolgen.html?piececode=1234567890",
      "estimatedDelivery": "2026-03-16T00:00:00Z"
    },
    "statusHistory": [
      { "status": "pending", "timestamp": "2026-03-12T15:15:00Z" },
      { "status": "paid", "timestamp": "2026-03-12T15:16:00Z" },
      { "status": "processing", "timestamp": "2026-03-12T16:00:00Z" },
      { "status": "shipped", "timestamp": "2026-03-13T09:00:00Z" }
    ],
    "notes": null,
    "createdAt": "2026-03-12T15:15:00Z",
    "paidAt": "2026-03-12T15:16:00Z",
    "shippedAt": "2026-03-13T09:00:00Z",
    "deliveredAt": null
  }
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found"
}
```

---

## Admin Endpoints

### Create Product

```
POST /api/v1/products
```

Creates a new product.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Product name (3-200 characters) |
| `shortDescription` | string | yes | Short description (10-300 characters) |
| `description` | string | yes | Full description (Markdown) |
| `price` | number | yes | Base price in EUR |
| `compareAtPrice` | number | no | Original price for sale items |
| `sku` | string | yes | Stock keeping unit |
| `weight` | number | no | Weight in grams |
| `categoryId` | string | yes | Product category ID |
| `tagIds` | string[] | no | Array of tag IDs |
| `imageMediaIds` | string[] | no | Array of media IDs for product images |
| `variants` | object[] | yes | At least one variant required |
| `variants[].name` | string | yes | Variant display name |
| `variants[].sku` | string | yes | Variant SKU |
| `variants[].options` | object | yes | Key-value pairs for variant options |
| `variants[].price` | number | no | Override price (defaults to base price) |
| `variants[].stockQuantity` | integer | yes | Initial stock quantity |
| `shipping` | object | no | Shipping configuration |
| `status` | string | no | `draft` (default) or `published` |
| `isFeatured` | boolean | no | Featured on homepage (default: `false`) |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/products" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Berlin Skyline Canvas Print",
    "shortDescription": "Stunning panoramic canvas print of the Berlin skyline at sunset.",
    "description": "## Berlin Skyline Canvas Print\n\nCapture the beauty of Berlin with this high-quality canvas print...",
    "price": 49.90,
    "sku": "ILB-CANVAS-SKY",
    "weight": 800,
    "categoryId": "pcat_d4e5f6",
    "tagIds": ["ptag_003"],
    "imageMediaIds": ["med_c1d2e3"],
    "variants": [
      {
        "name": "60x30cm",
        "sku": "ILB-CANVAS-SKY-60",
        "options": { "size": "60x30cm" },
        "price": 49.90,
        "stockQuantity": 25
      },
      {
        "name": "90x45cm",
        "sku": "ILB-CANVAS-SKY-90",
        "options": { "size": "90x45cm" },
        "price": 79.90,
        "stockQuantity": 15
      }
    ],
    "status": "published",
    "isFeatured": false
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "prod_j1k2l3",
    "name": "Berlin Skyline Canvas Print",
    "slug": "berlin-skyline-canvas-print",
    "shortDescription": "Stunning panoramic canvas print of the Berlin skyline at sunset.",
    "price": 49.90,
    "sku": "ILB-CANVAS-SKY",
    "status": "published",
    "variants": [
      {
        "id": "var_020",
        "name": "60x30cm",
        "sku": "ILB-CANVAS-SKY-60",
        "price": 49.90,
        "stockQuantity": 25,
        "inStock": true
      },
      {
        "id": "var_021",
        "name": "90x45cm",
        "sku": "ILB-CANVAS-SKY-90",
        "price": 79.90,
        "stockQuantity": 15,
        "inStock": true
      }
    ],
    "createdAt": "2026-03-12T16:00:00Z"
  }
}
```

---

### Update Product

```
PATCH /api/v1/products/:id
```

Updates an existing product.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The product ID |

**Request Body:** Any subset of the fields from the create endpoint. Additionally:

| Field | Type | Description |
|-------|------|-------------|
| `variants[].id` | string | Existing variant ID (for updates). Omit for new variants |
| `variants[].delete` | boolean | Set `true` to remove a variant |

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/products/prod_j1k2l3" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "price": 44.90,
    "compareAtPrice": 49.90,
    "variants": [
      {
        "id": "var_020",
        "price": 44.90,
        "stockQuantity": 20
      }
    ]
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "prod_j1k2l3",
    "name": "Berlin Skyline Canvas Print",
    "price": 44.90,
    "compareAtPrice": 49.90,
    "updatedAt": "2026-03-12T17:00:00Z"
  }
}
```

---

### List All Orders (Admin)

```
GET /api/v1/admin/orders
```

Returns a paginated list of all orders across all users.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max: 100) |
| `status` | string | — | Filter by order status |
| `sort` | string | `createdAt:desc` | Sort: `createdAt:desc`, `createdAt:asc`, `total:desc`, `total:asc` |
| `search` | string | — | Search by order number, customer name, or email |
| `dateFrom` | string | — | ISO 8601 start date |
| `dateTo` | string | — | ISO 8601 end date |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/orders?status=processing&sort=createdAt:desc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "ord_a1b2c3",
      "orderNumber": "ILB-20260312-001",
      "status": "processing",
      "customer": {
        "id": "usr_a1b2c3",
        "firstName": "Anna",
        "lastName": "Schmidt",
        "email": "anna.schmidt@example.com"
      },
      "itemCount": 3,
      "total": 85.39,
      "currency": "EUR",
      "shippingMethod": "standard",
      "createdAt": "2026-03-12T15:15:00Z",
      "paidAt": "2026-03-12T15:16:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 12,
    "totalPages": 1
  }
}
```

---

### Update Order Status

```
PATCH /api/v1/admin/orders/:id/status
```

Updates the status of an order (e.g., mark as shipped).

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The order ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | yes | New status: `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `trackingCarrier` | string | conditional | Required when setting status to `shipped` |
| `trackingNumber` | string | conditional | Required when setting status to `shipped` |
| `notifyCustomer` | boolean | no | Send email notification (default: `true`) |
| `reason` | string | conditional | Required for `cancelled` or `refunded` |

**Request Example:**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/admin/orders/ord_a1b2c3/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingCarrier": "DHL",
    "trackingNumber": "1234567890",
    "notifyCustomer": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "orderId": "ord_a1b2c3",
    "orderNumber": "ILB-20260312-001",
    "previousStatus": "processing",
    "newStatus": "shipped",
    "tracking": {
      "carrier": "DHL",
      "trackingNumber": "1234567890",
      "trackingUrl": "https://www.dhl.de/en/privatkunden/pakete-empfangen/verfolgen.html?piececode=1234567890"
    },
    "customerNotified": true,
    "updatedAt": "2026-03-13T09:00:00Z"
  }
}
```

---

### Create Discount Code

```
POST /api/v1/discount-codes
```

Creates a new discount code.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | yes | Discount code (3-30 alphanumeric characters, uppercase) |
| `type` | string | yes | `percentage`, `fixed_amount`, `free_shipping` |
| `value` | number | conditional | Discount value. Required for `percentage` and `fixed_amount` |
| `minOrderAmount` | number | no | Minimum order amount for the code to apply |
| `maxUses` | integer | no | Maximum total uses (null = unlimited) |
| `maxUsesPerUser` | integer | no | Maximum uses per user (default: `1`) |
| `validFrom` | string | no | ISO 8601 start date (default: now) |
| `validUntil` | string | yes | ISO 8601 expiration date |
| `applicableProductIds` | string[] | no | Restrict to specific products |
| `applicableCategoryIds` | string[] | no | Restrict to specific categories |

**Request Example:**

```bash
curl -X POST "https://iloveberlin.biz/api/v1/discount-codes" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SPRING25",
    "type": "percentage",
    "value": 25,
    "minOrderAmount": 30.00,
    "maxUses": 500,
    "maxUsesPerUser": 1,
    "validFrom": "2026-03-20T00:00:00Z",
    "validUntil": "2026-04-20T23:59:59Z"
  }'
```

**Response: `201 Created`**

```json
{
  "data": {
    "id": "disc_a1b2c3",
    "code": "SPRING25",
    "type": "percentage",
    "value": 25,
    "minOrderAmount": 30.00,
    "maxUses": 500,
    "currentUses": 0,
    "maxUsesPerUser": 1,
    "validFrom": "2026-03-20T00:00:00Z",
    "validUntil": "2026-04-20T23:59:59Z",
    "applicableProductIds": null,
    "applicableCategoryIds": null,
    "isActive": true,
    "createdAt": "2026-03-12T16:00:00Z"
  }
}
```

**Error Response: `409 Conflict`**

```json
{
  "statusCode": 409,
  "message": "Discount code 'SPRING25' already exists",
  "error": "Conflict"
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
| `400` | Bad Request | Invalid input, empty cart, expired discount code, or webhook signature failure |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions for the requested action |
| `404` | Not Found | Product, cart item, order, or discount code not found |
| `409` | Conflict | Out-of-stock items in cart, duplicate discount code, or duplicate SKU |
| `422` | Unprocessable Entity | Quantity exceeds limit, or invalid variant configuration |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `502` | Bad Gateway | Stripe payment gateway unavailable |

---

## Rate Limiting

| Endpoint Group | Rate Limit | Window |
|----------------|-----------|--------|
| `GET /products`, `GET /product-categories` | 120 requests | 1 minute |
| `GET /products/:slug` | 60 requests | 1 minute |
| `GET /cart`, `PATCH /cart/items/:id` | 60 requests | 1 minute |
| `POST /cart/items` | 30 requests | 1 minute |
| `POST /cart/discount` | 10 requests | 1 minute |
| `POST /checkout` | 5 requests | 1 minute |
| `GET /orders` | 30 requests | 1 minute |
| Admin endpoints | 30 requests | 1 minute |
| `POST /checkout/webhook` | No rate limit | — |

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
