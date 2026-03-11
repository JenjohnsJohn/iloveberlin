# Schema: Store (E-Commerce)

> Domain: `store`
> Tables: `product_categories`, `products`, `product_variants`, `product_images`, `carts`, `cart_items`, `orders`, `order_items`, `discount_codes`

---

## Overview

A lightweight e-commerce module for selling Berlin-themed merchandise (prints, clothing, guides, etc.). Products have variants (size, color), carts support both authenticated and anonymous users, and orders integrate with Stripe for payment processing. Prices are stored as DECIMAL to avoid floating-point precision issues.

---

## Table: `product_categories`

Store-specific product taxonomy. Separate from the shared `categories` table.

### SQL

```sql
CREATE TABLE product_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(100) | NO | -- | Category name, e.g., "Clothing", "Prints" |
| `slug` | VARCHAR(120) | NO | -- | URL slug, unique |
| `sort_order` | INTEGER | NO | `0` | Display ordering |

---

## Table: `products`

Store items. Each product has a base price and can have multiple variants (e.g., sizes for a T-shirt).

### SQL

```sql
CREATE TYPE product_status AS ENUM ('draft', 'active', 'out_of_stock', 'discontinued');

CREATE TABLE products (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(200) NOT NULL,
  slug               VARCHAR(220) NOT NULL,
  description        TEXT,
  base_price         DECIMAL(10, 2) NOT NULL,
  category_id        UUID,
  featured_image_id  UUID,
  status             product_status NOT NULL DEFAULT 'draft',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ,

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES product_categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_products_featured_image
    FOREIGN KEY (featured_image_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT chk_products_base_price
    CHECK (base_price >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(200) | NO | -- | Product name |
| `slug` | VARCHAR(220) | NO | -- | URL slug |
| `description` | TEXT | YES | `NULL` | Rich text product description |
| `base_price` | DECIMAL(10,2) | NO | -- | Default price (variants may override) |
| `category_id` | UUID | YES | `NULL` | FK to `product_categories` |
| `featured_image_id` | UUID | YES | `NULL` | FK to `media` for hero image |
| `status` | `product_status` | NO | `'draft'` | Product availability state |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Indexes

```sql
-- Unique slug among active products
CREATE UNIQUE INDEX uq_products_slug_active
  ON products (slug)
  WHERE deleted_at IS NULL;

-- Active products (store front page)
CREATE INDEX idx_products_active
  ON products (created_at DESC)
  WHERE deleted_at IS NULL AND status = 'active';

-- Products by category
CREATE INDEX idx_products_category
  ON products (category_id, created_at DESC)
  WHERE deleted_at IS NULL AND status = 'active';

-- Price sorting
CREATE INDEX idx_products_price
  ON products (base_price ASC)
  WHERE deleted_at IS NULL AND status = 'active';

-- Full-text search
CREATE INDEX idx_products_fts
  ON products USING gin (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  );
```

---

## Table: `product_variants`

SKU-level records for products with variations (size, color, etc.). Every product has at least one variant (the default). Inventory is tracked at the variant level.

### SQL

```sql
CREATE TABLE product_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL,
  name            VARCHAR(100) NOT NULL,
  sku             VARCHAR(50) NOT NULL UNIQUE,
  price           DECIMAL(10, 2) NOT NULL,
  stock_quantity  INTEGER NOT NULL DEFAULT 0,
  attributes      JSONB DEFAULT '{}',

  CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT chk_product_variants_price
    CHECK (price >= 0),
  CONSTRAINT chk_product_variants_stock
    CHECK (stock_quantity >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `product_id` | UUID | NO | -- | FK to `products` |
| `name` | VARCHAR(100) | NO | -- | Variant name, e.g., "M / Black", "A3 Print" |
| `sku` | VARCHAR(50) | NO | -- | Stock Keeping Unit, globally unique |
| `price` | DECIMAL(10,2) | NO | -- | Variant-specific price (may differ from product base_price) |
| `stock_quantity` | INTEGER | NO | `0` | Available inventory |
| `attributes` | JSONB | YES | `'{}'` | Structured variant attributes |

### JSONB Shape: `attributes`

```json
{
  "size": "M",
  "color": "Black",
  "material": "Organic Cotton"
}
```

### Indexes

```sql
-- SKU covered by UNIQUE constraint

-- Product's variants
CREATE INDEX idx_product_variants_product
  ON product_variants (product_id);

-- Low stock alert (admin dashboard)
CREATE INDEX idx_product_variants_low_stock
  ON product_variants (stock_quantity ASC)
  WHERE stock_quantity < 10;

-- GIN index for attribute filtering (e.g., "all black variants")
CREATE INDEX idx_product_variants_attributes
  ON product_variants USING gin (attributes);
-- Rationale: Supports queries like:
--   WHERE attributes @> '{"color": "Black"}'
```

### Design Decisions

1. **Every product has at least one variant.** For products without options (e.g., a book), a single "Default" variant is created. This simplifies cart and order logic -- everything references a variant, never a product directly.
2. **Price at variant level, not product level.** The product's `base_price` is for display purposes (listing page). The variant's `price` is the actual purchase price. This handles scenarios where different sizes have different prices.
3. **SKU uniqueness is global**, not per-product. This ensures SKUs can be used for inventory management, shipping labels, and analytics without ambiguity.

---

## Table: `product_images`

Additional images for products beyond the featured image.

### SQL

```sql
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL,
  media_id    UUID NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_product_images_media
    FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE CASCADE
);
```

### Indexes

```sql
CREATE INDEX idx_product_images_product
  ON product_images (product_id, sort_order);
```

---

## Table: `carts`

Shopping carts. Supports both authenticated users (`user_id`) and guest sessions (`session_id`). When a guest logs in, the cart is merged by updating `user_id` and clearing `session_id`.

### SQL

```sql
CREATE TABLE carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  session_id  VARCHAR(128),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | YES | `NULL` | FK to `users`. NULL for guest carts |
| `session_id` | VARCHAR(128) | YES | `NULL` | Session identifier for guest carts |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Cart creation |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last cart modification |

### Constraints & Indexes

```sql
-- Each user has at most one active cart
CREATE UNIQUE INDEX uq_carts_user
  ON carts (user_id)
  WHERE user_id IS NOT NULL;

-- Guest cart lookup
CREATE UNIQUE INDEX uq_carts_session
  ON carts (session_id)
  WHERE session_id IS NOT NULL;

-- Stale cart cleanup (cron: delete carts not updated in 30 days)
CREATE INDEX idx_carts_updated
  ON carts (updated_at);
```

### Design Decisions

1. **One cart per user:** The unique index on `user_id` ensures a user never has multiple carts. Adding to cart always finds-or-creates.
2. **Guest carts via `session_id`:** Anonymous users get a session-based cart. On login/registration, the cart is associated with the user and `session_id` is cleared.
3. **CASCADE on user delete:** Removes the user's cart and its items.

---

## Table: `cart_items`

Items in a cart. References a specific product variant.

### SQL

```sql
CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     UUID NOT NULL,
  variant_id  UUID NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
  CONSTRAINT chk_cart_items_quantity
    CHECK (quantity > 0)
);
```

### Indexes

```sql
-- Cart's items
CREATE INDEX idx_cart_items_cart
  ON cart_items (cart_id);

-- Prevent duplicate variants in same cart
CREATE UNIQUE INDEX uq_cart_items_cart_variant
  ON cart_items (cart_id, variant_id);
-- Rationale: If a user adds the same variant twice, the quantity should be
-- incremented, not a new row created.
```

---

## Table: `orders`

Placed orders after checkout. Order data is intentionally denormalized (snapshots) so that product/price changes don't affect historical orders.

### SQL

```sql
CREATE TYPE order_status AS ENUM (
  'pending_payment', 'paid', 'processing', 'shipped', 'delivered',
  'cancelled', 'refunded'
);

CREATE TABLE orders (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL,
  status                   order_status NOT NULL DEFAULT 'pending_payment',
  subtotal                 DECIMAL(10, 2) NOT NULL,
  discount_amount          DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total                    DECIMAL(10, 2) NOT NULL,
  shipping_address         JSONB NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT chk_orders_subtotal
    CHECK (subtotal >= 0),
  CONSTRAINT chk_orders_discount
    CHECK (discount_amount >= 0),
  CONSTRAINT chk_orders_total
    CHECK (total >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key (also serves as order number) |
| `user_id` | UUID | NO | -- | FK to `users` -- the buyer |
| `status` | `order_status` | NO | `'pending_payment'` | Order fulfillment state |
| `subtotal` | DECIMAL(10,2) | NO | -- | Sum of item prices before discount |
| `discount_amount` | DECIMAL(10,2) | NO | `0` | Applied discount |
| `total` | DECIMAL(10,2) | NO | -- | Final amount charged (`subtotal - discount_amount`) |
| `shipping_address` | JSONB | NO | -- | Snapshot of the shipping address at order time |
| `stripe_payment_intent_id` | VARCHAR(255) | YES | `NULL` | Stripe PaymentIntent ID for tracking |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Order placed at |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last status update |

### JSONB Shape: `shipping_address`

```json
{
  "name": "Max Mueller",
  "line1": "Oranienstrasse 42",
  "line2": "3. OG",
  "city": "Berlin",
  "postal_code": "10999",
  "country": "DE",
  "phone": "+49 176 12345678"
}
```

### Constraints & Indexes

```sql
-- User's orders (order history)
CREATE INDEX idx_orders_user
  ON orders (user_id, created_at DESC);

-- Orders by status (admin: fulfillment dashboard)
CREATE INDEX idx_orders_status
  ON orders (status, created_at DESC);

-- Stripe payment lookup (webhook handling)
CREATE UNIQUE INDEX uq_orders_stripe_pi
  ON orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Revenue reporting (date range queries)
CREATE INDEX idx_orders_created
  ON orders (created_at DESC)
  WHERE status IN ('paid', 'processing', 'shipped', 'delivered');
```

### Foreign Key Behavior

| FK | References | ON DELETE | Rationale |
|----|-----------|-----------|-----------|
| `user_id` | `users(id)` | RESTRICT | Cannot delete a user with orders (legal/accounting requirement) |

---

## Table: `order_items`

Line items for each order. Data is snapshot/denormalized: `product_name`, `variant_name`, and `price` are copied at order time so that future product changes don't alter historical orders.

### SQL

```sql
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL,
  variant_id    UUID,
  product_name  VARCHAR(200) NOT NULL,
  variant_name  VARCHAR(100) NOT NULL,
  price         DECIMAL(10, 2) NOT NULL,
  quantity      INTEGER NOT NULL,

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL,
  CONSTRAINT chk_order_items_price
    CHECK (price >= 0),
  CONSTRAINT chk_order_items_quantity
    CHECK (quantity > 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `order_id` | UUID | NO | -- | FK to `orders` |
| `variant_id` | UUID | YES | `NULL` | FK to `product_variants`. NULL if variant was deleted |
| `product_name` | VARCHAR(200) | NO | -- | **Snapshot** of product name at order time |
| `variant_name` | VARCHAR(100) | NO | -- | **Snapshot** of variant name at order time |
| `price` | DECIMAL(10,2) | NO | -- | **Snapshot** of price at order time |
| `quantity` | INTEGER | NO | -- | Quantity ordered |

### Indexes

```sql
-- Order's items
CREATE INDEX idx_order_items_order
  ON order_items (order_id);
```

### Design Decisions

1. **Denormalized product data:** `product_name`, `variant_name`, and `price` are copied from the product/variant at checkout. This ensures order history remains accurate even if products are renamed, repriced, or deleted.
2. **SET NULL on variant delete:** The `variant_id` FK allows linking back to the current variant for reordering, but if the variant is discontinued, the order item record remains intact with its snapshot data.

---

## Table: `discount_codes`

Promotional discount codes applied at checkout.

### SQL

```sql
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');

CREATE TABLE discount_codes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             VARCHAR(50) NOT NULL UNIQUE,
  type             discount_type NOT NULL,
  value            DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  max_uses         INTEGER,
  used_count       INTEGER NOT NULL DEFAULT 0,
  valid_from       TIMESTAMPTZ NOT NULL,
  valid_until      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_discount_codes_value
    CHECK (value > 0),
  CONSTRAINT chk_discount_codes_percentage
    CHECK (type != 'percentage' OR value <= 100),
  CONSTRAINT chk_discount_codes_dates
    CHECK (valid_until > valid_from),
  CONSTRAINT chk_discount_codes_max_uses
    CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT chk_discount_codes_used_count
    CHECK (used_count >= 0)
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `code` | VARCHAR(50) | NO | -- | The discount code string, e.g., "BERLIN20" |
| `type` | `discount_type` | NO | -- | Percentage or fixed amount |
| `value` | DECIMAL(10,2) | NO | -- | Discount value (20 = 20% or EUR 20.00) |
| `min_order_amount` | DECIMAL(10,2) | YES | `NULL` | Minimum order subtotal required |
| `max_uses` | INTEGER | YES | `NULL` | Maximum total uses (NULL = unlimited) |
| `used_count` | INTEGER | NO | `0` | Current usage count |
| `valid_from` | TIMESTAMPTZ | NO | -- | Code becomes active |
| `valid_until` | TIMESTAMPTZ | NO | -- | Code expires |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |

### Indexes

```sql
-- Code lookup (checkout validation)
-- Covered by UNIQUE constraint on `code`

-- Active codes (admin listing)
CREATE INDEX idx_discount_codes_active
  ON discount_codes (valid_until ASC)
  WHERE valid_from <= now() AND valid_until >= now();
-- Note: This partial index condition is evaluated at query time,
-- so it effectively scans all codes. A simpler approach:
CREATE INDEX idx_discount_codes_validity
  ON discount_codes (valid_from, valid_until);
```

### Design Decisions

1. **No per-user tracking:** The current schema does not prevent a user from using the same code on multiple orders. To enforce single-use-per-user, add an `order_discount_codes` join table or a `discount_code_id` FK on `orders`.
2. **`used_count` increment:** Incremented atomically in the checkout transaction: `UPDATE discount_codes SET used_count = used_count + 1 WHERE id = $1 AND (max_uses IS NULL OR used_count < max_uses)`. The `WHERE` clause ensures atomic enforcement of the cap.
3. **Percentage cap:** The CHECK constraint ensures percentage discounts don't exceed 100%.

---

## Example Seed Data

```sql
-- Product categories
INSERT INTO product_categories (id, name, slug, sort_order) VALUES
  ('90000000-0000-0000-0000-000000000001', 'Clothing',    'clothing',    1),
  ('90000000-0000-0000-0000-000000000002', 'Prints',      'prints',      2),
  ('90000000-0000-0000-0000-000000000003', 'Accessories', 'accessories', 3),
  ('90000000-0000-0000-0000-000000000004', 'Books',       'books',       4),
  ('90000000-0000-0000-0000-000000000005', 'Stationery',  'stationery',  5);

-- Sample products
INSERT INTO products (id, name, slug, description, base_price, category_id, status) VALUES
(
  '91000000-0000-0000-0000-000000000001',
  'ILoveBerlin Classic T-Shirt',
  'iloveberlin-classic-tshirt',
  'Premium organic cotton T-shirt featuring the iconic ILoveBerlin logo. Available in multiple sizes and colors. Ethically produced in Berlin.',
  29.90,
  '90000000-0000-0000-0000-000000000001',  -- Clothing
  'active'
),
(
  '91000000-0000-0000-0000-000000000002',
  'Berlin Skyline Art Print (A3)',
  'berlin-skyline-art-print-a3',
  'Beautiful minimalist illustration of the Berlin skyline featuring the TV Tower, Brandenburg Gate, and Molecule Man. Printed on 300gsm archival paper.',
  24.90,
  '90000000-0000-0000-0000-000000000002',  -- Prints
  'active'
);

-- Product variants
INSERT INTO product_variants (id, product_id, name, sku, price, stock_quantity, attributes) VALUES
  -- T-shirt variants
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'S / White',  'ILB-TS-WHT-S',  29.90, 50,  '{"size": "S", "color": "White"}'),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000001', 'M / White',  'ILB-TS-WHT-M',  29.90, 75,  '{"size": "M", "color": "White"}'),
  ('92000000-0000-0000-0000-000000000003', '91000000-0000-0000-0000-000000000001', 'L / White',  'ILB-TS-WHT-L',  29.90, 60,  '{"size": "L", "color": "White"}'),
  ('92000000-0000-0000-0000-000000000004', '91000000-0000-0000-0000-000000000001', 'XL / White', 'ILB-TS-WHT-XL', 29.90, 40,  '{"size": "XL", "color": "White"}'),
  ('92000000-0000-0000-0000-000000000005', '91000000-0000-0000-0000-000000000001', 'S / Black',  'ILB-TS-BLK-S',  29.90, 50,  '{"size": "S", "color": "Black"}'),
  ('92000000-0000-0000-0000-000000000006', '91000000-0000-0000-0000-000000000001', 'M / Black',  'ILB-TS-BLK-M',  29.90, 80,  '{"size": "M", "color": "Black"}'),
  ('92000000-0000-0000-0000-000000000007', '91000000-0000-0000-0000-000000000001', 'L / Black',  'ILB-TS-BLK-L',  29.90, 65,  '{"size": "L", "color": "Black"}'),
  ('92000000-0000-0000-0000-000000000008', '91000000-0000-0000-0000-000000000001', 'XL / Black', 'ILB-TS-BLK-XL', 29.90, 35,  '{"size": "XL", "color": "Black"}'),
  -- Print variant (single)
  ('92000000-0000-0000-0000-000000000009', '91000000-0000-0000-0000-000000000002', 'A3 Print',   'ILB-SKY-A3',    24.90, 200, '{"size": "A3", "paper": "300gsm Archival"}');

-- Sample cart (authenticated user)
INSERT INTO carts (id, user_id) VALUES
  ('93000000-0000-0000-0000-000000000001', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33');

INSERT INTO cart_items (id, cart_id, variant_id, quantity) VALUES
  ('94000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000006', 1),  -- M/Black T-shirt
  ('94000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000009', 2);  -- 2x A3 Print

-- Sample order
INSERT INTO orders (
  id, user_id, status, subtotal, discount_amount, total,
  shipping_address, stripe_payment_intent_id
) VALUES (
  '95000000-0000-0000-0000-000000000001',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'paid',
  79.70,  -- 29.90 + 2*24.90
  7.97,   -- 10% discount
  71.73,
  '{"name": "Max Mueller", "line1": "Oranienstrasse 42", "line2": "3. OG", "city": "Berlin", "postal_code": "10999", "country": "DE", "phone": "+49 176 12345678"}',
  'pi_3abc123def456ghi789'
);

INSERT INTO order_items (id, order_id, variant_id, product_name, variant_name, price, quantity) VALUES
  ('96000000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000006', 'ILoveBerlin Classic T-Shirt', 'M / Black', 29.90, 1),
  ('96000000-0000-0000-0000-000000000002', '95000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000009', 'Berlin Skyline Art Print (A3)', 'A3 Print', 24.90, 2);

-- Discount codes
INSERT INTO discount_codes (id, code, type, value, min_order_amount, max_uses, valid_from, valid_until) VALUES
(
  '97000000-0000-0000-0000-000000000001',
  'WELCOME10',
  'percentage',
  10.00,
  20.00,
  NULL,  -- unlimited uses
  '2026-01-01 00:00:00+01',
  '2026-12-31 23:59:59+01'
),
(
  '97000000-0000-0000-0000-000000000002',
  'BERLIN5',
  'fixed_amount',
  5.00,
  25.00,
  500,
  '2026-03-01 00:00:00+01',
  '2026-06-30 23:59:59+01'
);
```
