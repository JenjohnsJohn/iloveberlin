# FR-STORE: Store

**Module:** Store
**Status:** Draft
**Last Updated:** 2026-03-11
**Owner:** E-Commerce Team
**Related User Stories:** US-STORE-001 through US-STORE-060

---

## 1. Overview

The Store module provides a full e-commerce experience on the ILoveBerlin platform. Administrators manage products with variants (size, color), images, and categories. Customers browse products, add items to a cart (session-based for guests, user-based for authenticated users), and check out via Stripe (PaymentIntent flow). The module handles order creation, Stripe webhook processing, order history, discount codes, and order confirmation emails.

---

## 2. Functional Requirements

### 2.1 Product CRUD

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-001 | Admin users SHALL be able to create a product with: name, slug, description (rich text), excerpt, SKU prefix, base price, compare-at price (optional), category, tags, status (draft/active/archived), and SEO metadata. | Must | US-STORE-001 |
| FR-STORE-002 | Admin users SHALL be able to edit any field of a product. | Must | US-STORE-002 |
| FR-STORE-003 | Admin users SHALL be able to archive a product, which removes it from the storefront but retains it in the database and in existing order history. | Must | US-STORE-003 |
| FR-STORE-004 | Admin users SHALL be able to delete a product that has never been ordered. Products with order history can only be archived. | Must | US-STORE-004 |
| FR-STORE-005 | The system SHALL auto-generate a URL-safe slug from the product name. Slugs must be unique. | Must | US-STORE-005 |
| FR-STORE-006 | Admin users SHALL be able to set a product as "featured" for homepage/category page promotion. | Should | US-STORE-006 |
| FR-STORE-007 | Admin users SHALL be able to set stock quantities at the variant level. The product-level stock is the sum of all variant stocks. | Must | US-STORE-007 |
| FR-STORE-008 | The system SHALL display "Out of Stock" and disable the "Add to Cart" button when variant stock reaches 0. | Must | US-STORE-008 |
| FR-STORE-009 | Admin users SHALL be able to set a "low stock threshold" per product. The admin dashboard SHALL display alerts when stock falls below this threshold. | Should | US-STORE-009 |

### 2.2 Product Categories

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-010 | Admin users SHALL be able to create, edit, and delete product categories. Categories have a name, slug, description, image, and sort order. | Must | US-STORE-010 |
| FR-STORE-011 | Categories SHALL support one level of nesting (parent/child). | Should | US-STORE-011 |
| FR-STORE-012 | Each product SHALL be assigned to exactly one category. | Must | US-STORE-012 |
| FR-STORE-013 | The storefront SHALL display category navigation with product counts. | Must | US-STORE-013 |

### 2.3 Product Variants

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-014 | Each product SHALL have one or more variants. A product with no options has a single "default" variant. | Must | US-STORE-014 |
| FR-STORE-015 | Variants SHALL support two option axes: size and color. Each variant is a unique combination of these options (e.g., "M / Red", "L / Blue"). | Must | US-STORE-015 |
| FR-STORE-016 | Each variant SHALL have its own: SKU (auto-generated from prefix + options or manually set), price (defaults to product base price, can be overridden), stock quantity, and weight (optional). | Must | US-STORE-016 |
| FR-STORE-017 | Each variant MAY have its own image. If not set, the product's primary image is used. | Should | US-STORE-017 |
| FR-STORE-018 | Admin users SHALL be able to add, edit, and remove variants from a product. | Must | US-STORE-018 |
| FR-STORE-019 | Admin users SHALL be able to bulk-generate variants from size and color option lists (cartesian product). | Should | US-STORE-019 |
| FR-STORE-020 | The storefront SHALL display variant options as selectable controls (dropdowns or swatches for color). Selecting a variant updates the displayed price, image, and stock status. | Must | US-STORE-020 |

### 2.4 Product Images

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-021 | Each product SHALL support up to 10 images. The first image is the primary/cover image. | Must | US-STORE-021 |
| FR-STORE-022 | Images are uploaded via the Media module (presigned URLs to R2) and processed into standard sizes (thumbnail, small, medium, large). | Must | US-STORE-022 |
| FR-STORE-023 | Admin users SHALL be able to reorder product images and designate a primary image. | Must | US-STORE-023 |
| FR-STORE-024 | The product detail page SHALL display images in a gallery with zoom/lightbox functionality. | Should | US-STORE-024 |

### 2.5 Shopping Cart

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-025 | Guest users SHALL have a session-based cart stored server-side, identified by a session token (UUID) set in an HTTP-only cookie. | Must | US-STORE-025 |
| FR-STORE-026 | Authenticated users SHALL have a persistent cart stored against their user ID. | Must | US-STORE-026 |
| FR-STORE-027 | When a guest user logs in, their session cart SHALL be merged into their user cart. If the same variant exists in both, the quantities are summed (up to available stock). | Must | US-STORE-027 |
| FR-STORE-028 | Users SHALL be able to add a specific product variant to the cart with a quantity. | Must | US-STORE-028 |
| FR-STORE-029 | Users SHALL be able to update the quantity of a cart item or remove it entirely. | Must | US-STORE-029 |
| FR-STORE-030 | The cart SHALL validate stock availability on each modification. If requested quantity exceeds stock, the system SHALL cap it at available stock and notify the user. | Must | US-STORE-030 |
| FR-STORE-031 | The cart response SHALL include line item subtotals, cart subtotal, applicable discounts, shipping estimate (flat rate or free-over-threshold), tax (German VAT 19%), and total. | Must | US-STORE-031 |
| FR-STORE-032 | Guest session carts SHALL expire after 7 days of inactivity. A cleanup job removes expired carts. | Should | US-STORE-032 |
| FR-STORE-033 | The cart SHALL display a mini-cart summary accessible from any page (header icon with item count badge). | Should | US-STORE-033 |

### 2.6 Checkout and Stripe Integration

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-034 | Checkout SHALL require user authentication. Guest users are prompted to log in or create an account before proceeding. | Must | US-STORE-034 |
| FR-STORE-035 | The checkout flow SHALL collect: shipping address (name, street, city, postal code, country — defaulting to Germany), billing address (same as shipping or separate), and email. | Must | US-STORE-035 |
| FR-STORE-036 | The system SHALL create a Stripe PaymentIntent with the order total (in EUR cents) and return the client secret to the frontend. | Must | US-STORE-036 |
| FR-STORE-037 | The frontend SHALL use Stripe Elements (or Flutter Stripe SDK on mobile) to collect payment details and confirm the PaymentIntent. | Must | US-STORE-037 |
| FR-STORE-038 | Supported payment methods SHALL include: credit/debit card, SEPA Direct Debit, and Giropay. | Should | US-STORE-038 |
| FR-STORE-039 | Upon successful payment confirmation on the frontend, the system SHALL NOT immediately finalize the order. Order finalization is handled exclusively by webhooks (FR-STORE-041). | Must | US-STORE-039 |
| FR-STORE-040 | The checkout page SHALL display an order summary with line items, subtotal, discount, shipping, tax, and total before payment submission. | Must | US-STORE-040 |

### 2.7 Webhooks

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-041 | The system SHALL expose a Stripe webhook endpoint at `/api/v1/store/webhooks/stripe`. | Must | US-STORE-041 |
| FR-STORE-042 | The webhook handler SHALL verify the Stripe signature using the webhook signing secret. Invalid signatures SHALL be rejected with 400. | Must | US-STORE-042 |
| FR-STORE-043 | On `payment_intent.succeeded` event, the system SHALL: (1) create the order record with status `confirmed`, (2) decrement variant stock quantities, (3) clear the user's cart, (4) send an order confirmation email. | Must | US-STORE-043 |
| FR-STORE-044 | On `payment_intent.payment_failed` event, the system SHALL update the pending order status to `payment_failed` and notify the user. | Must | US-STORE-044 |
| FR-STORE-045 | The webhook handler SHALL be idempotent. Duplicate event IDs SHALL be ignored. | Must | US-STORE-045 |
| FR-STORE-046 | On `charge.refunded` event, the system SHALL update the order status to `refunded` and restore variant stock quantities. | Should | US-STORE-046 |

### 2.8 Orders

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-047 | Each order SHALL have a human-readable order number in the format `ILB-YYYYMMDD-XXXX` (where XXXX is a daily sequential counter). | Must | US-STORE-047 |
| FR-STORE-048 | Order statuses SHALL follow this lifecycle: `pending_payment` -> `confirmed` -> `processing` -> `shipped` -> `delivered`. Additional statuses: `payment_failed`, `cancelled`, `refunded`. | Must | US-STORE-048 |
| FR-STORE-049 | Admin users SHALL be able to update order status (e.g., mark as shipped with tracking number). | Must | US-STORE-049 |
| FR-STORE-050 | Users SHALL be able to view their order history with status, items, and totals. | Must | US-STORE-050 |
| FR-STORE-051 | Users SHALL be able to view a single order detail page with full line items, shipping address, payment status, and tracking information. | Must | US-STORE-051 |
| FR-STORE-052 | Admin users SHALL be able to view and search all orders with filters for status, date range, and customer. | Must | US-STORE-052 |
| FR-STORE-053 | Admin users SHALL be able to initiate a refund through Stripe from the order detail page. | Should | US-STORE-053 |

### 2.9 Discount Codes

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-054 | Admin users SHALL be able to create discount codes with: code (unique, case-insensitive), discount type (percentage or fixed amount), discount value, minimum order amount (optional), maximum discount cap (optional for percentage), valid from/to dates, max total uses, max uses per user, and applicable product/category restrictions (optional). | Must | US-STORE-054 |
| FR-STORE-055 | Users SHALL be able to apply a discount code at checkout. The system validates eligibility and calculates the discount. | Must | US-STORE-055 |
| FR-STORE-056 | Only one discount code MAY be applied per order. | Must | US-STORE-056 |
| FR-STORE-057 | The system SHALL track usage count per discount code and per user. Codes exceeding their usage limits SHALL be rejected. | Must | US-STORE-057 |
| FR-STORE-058 | Admin users SHALL be able to deactivate a discount code at any time. | Must | US-STORE-058 |

### 2.10 Order Confirmation Emails

| ID | Requirement | Priority | User Stories |
|----|-------------|----------|--------------|
| FR-STORE-059 | Upon order confirmation (webhook-driven), the system SHALL send an order confirmation email to the customer with: order number, line items, quantities, prices, subtotal, discount, shipping, tax, total, shipping address, and estimated delivery time. | Must | US-STORE-059 |
| FR-STORE-060 | Upon shipping, the system SHALL send a shipping notification email with tracking number and carrier link. | Should | US-STORE-060 |

---

## 3. Database Schema

### 3.1 Table: `store_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(100)` | NOT NULL | Category name |
| `slug` | `VARCHAR(120)` | NOT NULL, UNIQUE | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Category description |
| `image_id` | `UUID` | FK -> media.id, NULLABLE | Category image |
| `parent_id` | `UUID` | FK -> store_categories.id, NULLABLE | Parent category |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Visibility flag |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_store_categories_slug` UNIQUE on `slug`
- `idx_store_categories_parent_id` on `parent_id`

### 3.2 Table: `store_products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(255)` | NOT NULL | Product name |
| `slug` | `VARCHAR(280)` | NOT NULL, UNIQUE | URL-safe slug |
| `description` | `TEXT` | NULLABLE | Rich-text description |
| `excerpt` | `VARCHAR(500)` | NULLABLE | Short description |
| `sku_prefix` | `VARCHAR(20)` | NOT NULL | SKU prefix for variants |
| `base_price` | `DECIMAL(10,2)` | NOT NULL | Base price in EUR |
| `compare_at_price` | `DECIMAL(10,2)` | NULLABLE | Original/strikethrough price |
| `category_id` | `UUID` | FK -> store_categories.id, NOT NULL | Product category |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'draft', CHECK IN ('draft','active','archived') | Product status |
| `is_featured` | `BOOLEAN` | NOT NULL, DEFAULT false | Featured product flag |
| `total_stock` | `INTEGER` | NOT NULL, DEFAULT 0 | Sum of variant stocks (materialized) |
| `low_stock_threshold` | `INTEGER` | NULLABLE | Alert threshold |
| `weight_grams` | `INTEGER` | NULLABLE | Product weight for shipping |
| `meta_title` | `VARCHAR(70)` | NULLABLE | SEO meta title |
| `meta_description` | `VARCHAR(160)` | NULLABLE | SEO meta description |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_store_products_slug` UNIQUE on `slug`
- `idx_store_products_status` on `status` WHERE `status` = 'active'
- `idx_store_products_category_id` on `category_id` WHERE `status` = 'active'
- `idx_store_products_featured` on `is_featured` WHERE `status` = 'active' AND `is_featured` = true
- `idx_store_products_price` on `base_price` WHERE `status` = 'active'
- `idx_store_products_low_stock` on `total_stock` WHERE `total_stock` <= `low_stock_threshold` AND `status` = 'active'

### 3.3 Table: `store_product_tags`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `name` | `VARCHAR(80)` | NOT NULL, UNIQUE | Tag name |
| `slug` | `VARCHAR(100)` | NOT NULL, UNIQUE | URL-safe slug |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |

### 3.4 Table: `store_product_tag_assignments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `product_id` | `UUID` | PK (composite), FK -> store_products.id ON DELETE CASCADE | Product reference |
| `tag_id` | `UUID` | PK (composite), FK -> store_product_tags.id ON DELETE CASCADE | Tag reference |

### 3.5 Table: `store_product_variants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `product_id` | `UUID` | FK -> store_products.id ON DELETE CASCADE, NOT NULL | Product reference |
| `sku` | `VARCHAR(50)` | NOT NULL, UNIQUE | Stock keeping unit |
| `name` | `VARCHAR(100)` | NOT NULL | Display name (e.g., "M / Red") |
| `size` | `VARCHAR(30)` | NULLABLE | Size option |
| `color` | `VARCHAR(30)` | NULLABLE | Color option |
| `color_hex` | `VARCHAR(7)` | NULLABLE | Hex code for color swatch |
| `price` | `DECIMAL(10,2)` | NULLABLE | Override price (NULL = use base price) |
| `stock_quantity` | `INTEGER` | NOT NULL, DEFAULT 0 | Available stock |
| `weight_grams` | `INTEGER` | NULLABLE | Override weight |
| `image_id` | `UUID` | FK -> media.id, NULLABLE | Variant-specific image |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Whether variant is purchasable |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_store_variants_sku` UNIQUE on `sku`
- `idx_store_variants_product_id` on `product_id`
- `idx_store_variants_stock` on (`product_id`, `stock_quantity`) WHERE `is_active` = true

**Constraints:**
- UNIQUE on (`product_id`, `size`, `color`)

### 3.6 Table: `store_product_images`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `product_id` | `UUID` | FK -> store_products.id ON DELETE CASCADE, NOT NULL | Product reference |
| `media_id` | `UUID` | FK -> media.id, NOT NULL | Media reference |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | Display order (0 = primary) |
| `alt_text` | `VARCHAR(200)` | NULLABLE | Image alt text |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Upload timestamp |

**Indexes:**
- `idx_store_product_images_product_id` on (`product_id`, `sort_order`)

### 3.7 Table: `store_carts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `user_id` | `UUID` | FK -> users.id, NULLABLE, UNIQUE | Authenticated user (NULL for guest) |
| `session_token` | `UUID` | NULLABLE, UNIQUE | Guest session identifier |
| `discount_code_id` | `UUID` | FK -> store_discount_codes.id, NULLABLE | Applied discount |
| `last_activity_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | For guest cart expiry |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_store_carts_user_id` UNIQUE on `user_id` WHERE `user_id` IS NOT NULL
- `idx_store_carts_session_token` UNIQUE on `session_token` WHERE `session_token` IS NOT NULL
- `idx_store_carts_last_activity` on `last_activity_at` WHERE `user_id` IS NULL

**Constraints:**
- CHECK (`user_id` IS NOT NULL OR `session_token` IS NOT NULL)

### 3.8 Table: `store_cart_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `cart_id` | `UUID` | FK -> store_carts.id ON DELETE CASCADE, NOT NULL | Cart reference |
| `variant_id` | `UUID` | FK -> store_product_variants.id, NOT NULL | Product variant |
| `quantity` | `INTEGER` | NOT NULL, CHECK > 0 | Item quantity |
| `unit_price` | `DECIMAL(10,2)` | NOT NULL | Price at time of adding (snapshot) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Added timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_store_cart_items_cart_id` on `cart_id`
- `idx_store_cart_items_unique` UNIQUE on (`cart_id`, `variant_id`)

### 3.9 Table: `store_orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `order_number` | `VARCHAR(20)` | NOT NULL, UNIQUE | Human-readable order number (ILB-YYYYMMDD-XXXX) |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Customer |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending_payment', CHECK IN ('pending_payment','confirmed','processing','shipped','delivered','payment_failed','cancelled','refunded') | Order status |
| `subtotal` | `DECIMAL(10,2)` | NOT NULL | Sum of line items |
| `discount_amount` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0 | Discount applied |
| `discount_code_id` | `UUID` | FK -> store_discount_codes.id, NULLABLE | Discount code used |
| `shipping_amount` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0 | Shipping cost |
| `tax_amount` | `DECIMAL(10,2)` | NOT NULL | VAT amount |
| `tax_rate` | `DECIMAL(5,4)` | NOT NULL, DEFAULT 0.1900 | Tax rate applied |
| `total` | `DECIMAL(10,2)` | NOT NULL | Final total charged |
| `currency` | `VARCHAR(3)` | NOT NULL, DEFAULT 'EUR' | ISO 4217 currency |
| `shipping_name` | `VARCHAR(200)` | NOT NULL | Recipient name |
| `shipping_street` | `VARCHAR(300)` | NOT NULL | Street address |
| `shipping_city` | `VARCHAR(100)` | NOT NULL | City |
| `shipping_postal_code` | `VARCHAR(20)` | NOT NULL | Postal code |
| `shipping_country` | `VARCHAR(2)` | NOT NULL, DEFAULT 'DE' | ISO 3166-1 alpha-2 |
| `billing_name` | `VARCHAR(200)` | NULLABLE | Billing name (if different) |
| `billing_street` | `VARCHAR(300)` | NULLABLE | Billing street |
| `billing_city` | `VARCHAR(100)` | NULLABLE | Billing city |
| `billing_postal_code` | `VARCHAR(20)` | NULLABLE | Billing postal code |
| `billing_country` | `VARCHAR(2)` | NULLABLE | Billing country |
| `customer_email` | `VARCHAR(320)` | NOT NULL | Email for confirmation |
| `stripe_payment_intent_id` | `VARCHAR(100)` | NOT NULL, UNIQUE | Stripe PaymentIntent ID |
| `stripe_charge_id` | `VARCHAR(100)` | NULLABLE | Stripe Charge ID |
| `tracking_number` | `VARCHAR(100)` | NULLABLE | Shipping tracking number |
| `tracking_carrier` | `VARCHAR(50)` | NULLABLE | Shipping carrier name |
| `tracking_url` | `VARCHAR(500)` | NULLABLE | Tracking URL |
| `notes` | `TEXT` | NULLABLE | Admin notes |
| `shipped_at` | `TIMESTAMPTZ` | NULLABLE | Shipping timestamp |
| `delivered_at` | `TIMESTAMPTZ` | NULLABLE | Delivery timestamp |
| `cancelled_at` | `TIMESTAMPTZ` | NULLABLE | Cancellation timestamp |
| `refunded_at` | `TIMESTAMPTZ` | NULLABLE | Refund timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Order creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_store_orders_order_number` UNIQUE on `order_number`
- `idx_store_orders_user_id` on (`user_id`, `created_at` DESC)
- `idx_store_orders_status` on `status`
- `idx_store_orders_stripe_pi` UNIQUE on `stripe_payment_intent_id`
- `idx_store_orders_created_at` on `created_at` DESC

### 3.10 Table: `store_order_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `order_id` | `UUID` | FK -> store_orders.id ON DELETE CASCADE, NOT NULL | Order reference |
| `variant_id` | `UUID` | FK -> store_product_variants.id, NOT NULL | Variant purchased |
| `product_name` | `VARCHAR(255)` | NOT NULL | Snapshot of product name |
| `variant_name` | `VARCHAR(100)` | NOT NULL | Snapshot of variant name |
| `sku` | `VARCHAR(50)` | NOT NULL | Snapshot of SKU |
| `quantity` | `INTEGER` | NOT NULL | Quantity ordered |
| `unit_price` | `DECIMAL(10,2)` | NOT NULL | Price per unit at order time |
| `line_total` | `DECIMAL(10,2)` | NOT NULL | quantity * unit_price |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_store_order_items_order_id` on `order_id`
- `idx_store_order_items_variant_id` on `variant_id`

### 3.11 Table: `store_discount_codes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Discount code (stored uppercase) |
| `description` | `VARCHAR(255)` | NULLABLE | Internal description |
| `discount_type` | `VARCHAR(20)` | NOT NULL, CHECK IN ('percentage','fixed') | Type of discount |
| `discount_value` | `DECIMAL(10,2)` | NOT NULL | Percentage (0-100) or fixed amount |
| `min_order_amount` | `DECIMAL(10,2)` | NULLABLE | Minimum cart subtotal |
| `max_discount_amount` | `DECIMAL(10,2)` | NULLABLE | Cap for percentage discounts |
| `valid_from` | `TIMESTAMPTZ` | NOT NULL | Start date |
| `valid_until` | `TIMESTAMPTZ` | NOT NULL | End date |
| `max_uses` | `INTEGER` | NULLABLE | Total usage limit |
| `max_uses_per_user` | `INTEGER` | NULLABLE | Per-user usage limit |
| `current_uses` | `INTEGER` | NOT NULL, DEFAULT 0 | Current usage count |
| `applicable_product_ids` | `UUID[]` | NULLABLE | Restrict to specific products |
| `applicable_category_ids` | `UUID[]` | NULLABLE | Restrict to specific categories |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Active flag |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_store_discount_codes_code` UNIQUE on UPPER(`code`)
- `idx_store_discount_codes_active` on (`is_active`, `valid_from`, `valid_until`)

### 3.12 Table: `store_discount_code_uses`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `discount_code_id` | `UUID` | FK -> store_discount_codes.id, NOT NULL | Discount code reference |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | User who used the code |
| `order_id` | `UUID` | FK -> store_orders.id, NOT NULL | Associated order |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Usage timestamp |

**Indexes:**
- `idx_store_discount_uses_code_user` on (`discount_code_id`, `user_id`)

### 3.13 Table: `store_webhook_events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `stripe_event_id` | `VARCHAR(100)` | NOT NULL, UNIQUE | Stripe event ID (for idempotency) |
| `event_type` | `VARCHAR(100)` | NOT NULL | Event type (e.g., payment_intent.succeeded) |
| `payload` | `JSONB` | NOT NULL | Full event payload |
| `processed` | `BOOLEAN` | NOT NULL, DEFAULT false | Processing status |
| `error` | `TEXT` | NULLABLE | Error message if processing failed |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Receipt timestamp |
| `processed_at` | `TIMESTAMPTZ` | NULLABLE | Processing timestamp |

**Indexes:**
- `idx_store_webhook_events_stripe_id` UNIQUE on `stripe_event_id`
- `idx_store_webhook_events_unprocessed` on `created_at` WHERE `processed` = false

---

## 4. API Endpoints

### 4.1 Public / Storefront Endpoints

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/store/products` | None | List active products | `cursor`, `limit` (default 20, max 50), `category` (slug), `tag` (slug), `min_price`, `max_price`, `sort` (newest, price_asc, price_desc, popular), `featured` (bool) |
| GET | `/api/v1/store/products/:slug` | None | Get product detail with variants | — |
| GET | `/api/v1/store/categories` | None | List active categories with counts | — |
| GET | `/api/v1/store/categories/:slug` | None | Category detail with products | `cursor`, `limit`, `sort` |

### 4.2 Cart Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/store/cart` | Optional | Get current cart | Cookie: `cart_session` (for guests) |
| POST | `/api/v1/store/cart/items` | Optional | Add item to cart | Body: `{ variant_id, quantity }` |
| PATCH | `/api/v1/store/cart/items/:itemId` | Optional | Update cart item quantity | Body: `{ quantity }` |
| DELETE | `/api/v1/store/cart/items/:itemId` | Optional | Remove item from cart | — |
| POST | `/api/v1/store/cart/discount` | Optional | Apply discount code | Body: `{ code }` |
| DELETE | `/api/v1/store/cart/discount` | Optional | Remove applied discount | — |
| POST | `/api/v1/store/cart/merge` | User | Merge guest cart into user cart | Body: `{ session_token }` |

### 4.3 Checkout Endpoints

| Method | Path | Auth | Description | Body |
|--------|------|------|-------------|------|
| POST | `/api/v1/store/checkout` | User | Create order + PaymentIntent | Body: `{ shipping_address: {...}, billing_address: {...}, email }` |
| GET | `/api/v1/store/checkout/:orderId/status` | User | Poll order status after payment | — |

### 4.4 Webhook Endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/store/webhooks/stripe` | Stripe Signature | Handle Stripe webhook events |

### 4.5 Order Endpoints (User)

| Method | Path | Auth | Description | Query Params |
|--------|------|------|-------------|-------------|
| GET | `/api/v1/store/orders` | User | List user's orders | `cursor`, `limit` (default 10), `status` |
| GET | `/api/v1/store/orders/:orderNumber` | User (owner) | Get order detail | — |

### 4.6 Admin Endpoints

| Method | Path | Auth | Description | Query Params / Body |
|--------|------|------|-------------|---------------------|
| GET | `/api/v1/admin/store/products` | Admin | List all products (any status) | `cursor`, `limit`, `status`, `category`, `search`, `sort`, `low_stock` (bool) |
| POST | `/api/v1/admin/store/products` | Admin | Create a product | Body: full product object |
| GET | `/api/v1/admin/store/products/:id` | Admin | Get product detail | — |
| PATCH | `/api/v1/admin/store/products/:id` | Admin | Update product | Body: partial product object |
| DELETE | `/api/v1/admin/store/products/:id` | Admin | Delete/archive product | — |
| POST | `/api/v1/admin/store/products/:id/variants` | Admin | Add variant | Body: variant object |
| PATCH | `/api/v1/admin/store/products/:id/variants/:variantId` | Admin | Update variant | Body: partial variant object |
| DELETE | `/api/v1/admin/store/products/:id/variants/:variantId` | Admin | Remove variant | — |
| POST | `/api/v1/admin/store/products/:id/variants/bulk` | Admin | Bulk-generate variants | Body: `{ sizes: [], colors: [{name, hex}] }` |
| POST | `/api/v1/admin/store/products/:id/images` | Admin | Add product image | Body: `{ media_id, sort_order, alt_text }` |
| PUT | `/api/v1/admin/store/products/:id/images/reorder` | Admin | Reorder images | Body: `{ image_ids: [ordered] }` |
| DELETE | `/api/v1/admin/store/products/:id/images/:imageId` | Admin | Remove product image | — |
| POST | `/api/v1/admin/store/categories` | Admin | Create category | Body: `{ name, description, image_id, parent_id, sort_order }` |
| PATCH | `/api/v1/admin/store/categories/:id` | Admin | Update category | Body: partial object |
| DELETE | `/api/v1/admin/store/categories/:id` | Admin | Delete category | Fails if products assigned |
| GET | `/api/v1/admin/store/orders` | Admin | List all orders | `cursor`, `limit`, `status`, `search` (order number, customer email), `date_from`, `date_to`, `sort` |
| GET | `/api/v1/admin/store/orders/:id` | Admin | Get order detail | — |
| PATCH | `/api/v1/admin/store/orders/:id` | Admin | Update order status / tracking | Body: `{ status, tracking_number, tracking_carrier, tracking_url, notes }` |
| POST | `/api/v1/admin/store/orders/:id/refund` | Admin | Initiate refund | Body: `{ amount (optional, full refund if omitted), reason }` |
| GET | `/api/v1/admin/store/discount-codes` | Admin | List discount codes | `cursor`, `limit`, `is_active`, `search` |
| POST | `/api/v1/admin/store/discount-codes` | Admin | Create discount code | Body: full discount code object |
| PATCH | `/api/v1/admin/store/discount-codes/:id` | Admin | Update discount code | Body: partial object |
| DELETE | `/api/v1/admin/store/discount-codes/:id` | Admin | Deactivate discount code | — |

### 4.7 Error Responses

| Code | Status | Trigger |
|------|--------|---------|
| PRODUCT_NOT_FOUND | 404 | Product slug/ID not found |
| VARIANT_NOT_FOUND | 404 | Variant ID not found |
| OUT_OF_STOCK | 422 | Variant stock is 0 |
| INSUFFICIENT_STOCK | 422 | Requested quantity exceeds available stock |
| CART_EMPTY | 422 | Checkout with empty cart |
| INVALID_DISCOUNT_CODE | 422 | Code not found, expired, or inactive |
| DISCOUNT_CODE_EXHAUSTED | 422 | Max uses reached |
| DISCOUNT_MIN_ORDER | 422 | Cart subtotal below minimum |
| ORDER_NOT_FOUND | 404 | Order number/ID not found |
| PAYMENT_FAILED | 422 | Stripe payment failure |
| INVALID_WEBHOOK_SIGNATURE | 400 | Stripe signature verification failure |
| CANNOT_DELETE_ORDERED_PRODUCT | 422 | Product has order history |
| CATEGORY_HAS_PRODUCTS | 409 | Delete category with assigned products |

---

## 5. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `CleanupGuestCarts` | Daily at 04:00 UTC | Removes guest carts with `last_activity_at` older than 7 days. |
| `UpdateProductStockTotals` | On variant stock change (event) | Recalculates `store_products.total_stock` from sum of variant stocks. |
| `RetryFailedWebhooks` | Every 5 minutes | Reprocesses `store_webhook_events` where `processed = false` and `error IS NOT NULL` (max 3 retries). |
| `SendShippingNotification` | Event-driven (queue) | Sends shipping email when order transitions to `shipped`. |
| `ExpireUnpaidOrders` | Hourly | Transitions `pending_payment` orders older than 24 hours to `cancelled`. |

---

## 6. Email Templates

| Template | Trigger | Variables |
|----------|---------|-----------|
| `order-confirmation` | Order confirmed (webhook) | `user.first_name`, `order.order_number`, `order.items[]`, `order.subtotal`, `order.discount`, `order.shipping`, `order.tax`, `order.total`, `order.shipping_address` |
| `order-shipped` | Order marked shipped | `user.first_name`, `order.order_number`, `tracking_number`, `tracking_carrier`, `tracking_url` |
| `payment-failed` | Payment failure webhook | `user.first_name`, `order.order_number`, `retry_url` |
| `order-refunded` | Order refunded | `user.first_name`, `order.order_number`, `refund_amount` |

---

## 7. Integration Points

| System | Integration |
|--------|-------------|
| Stripe | PaymentIntent creation, webhook handling, refunds |
| Media Module (FR-MEDIA) | Product images, category images, variant images |
| Search Module (FR-SEARCH) | Products index updated on create/update/archive/delete |
| Admin Panel (FR-ADMIN) | Product management, order management, discount codes, low-stock alerts |
| Email Service | Order confirmation, shipping notification, payment failure |

---

## 8. Non-Functional Constraints

- Cart endpoints p95 latency < 100ms.
- Checkout endpoint (PaymentIntent creation) p95 latency < 2 seconds.
- Webhook endpoint SHALL return 200 within 5 seconds; long processing is deferred to a background queue.
- Stock decrement on order confirmation SHALL use `UPDATE ... SET stock_quantity = stock_quantity - :qty WHERE stock_quantity >= :qty` for atomic, race-free stock management. If the update affects 0 rows, the item is out of stock and the order transitions to a partial failure state.
- All monetary amounts are stored as DECIMAL(10,2) and transmitted as strings in JSON to avoid floating-point precision issues.
- Stripe webhook signing secret is stored in environment variables, never in the database.
- Product prices and variant prices are in EUR. Multi-currency is out of scope for v1.
