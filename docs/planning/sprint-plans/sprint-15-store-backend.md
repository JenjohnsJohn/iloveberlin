# Sprint 15: Store Backend Infrastructure

**Sprint Number:** 15
**Sprint Name:** Store Backend Infrastructure
**Duration:** 2 weeks (10 working days)
**Dates:** Weeks 29-30 (relative to project start)
**Team Capacity:** ~160 hours (2 backend, 1 DevOps, 1 QA)

---

## Sprint Goal

Build the complete e-commerce backend for the ILoveBerlin store, including product catalog management with variants and images, session-based and authenticated cart functionality, Stripe-powered checkout with webhook handling, order lifecycle management, discount code validation, order confirmation emails, and full admin CRUD for products, orders, and discounts.

---

## User Stories

### US-15.1: Product Catalog Management
**As an** admin, **I want to** manage products with categories, variants, and images **so that** I can maintain the store catalog.

**Acceptance Criteria:**
- [ ] Admin can create, read, update, and delete product categories
- [ ] Admin can create products with title, description, price, and category assignment
- [ ] Admin can add product variants (size, color, etc.) with individual pricing and stock
- [ ] Admin can upload and reorder product images (stored in Cloudflare R2)
- [ ] Products can be marked as active/inactive
- [ ] Product listing supports pagination, filtering by category, and sorting
- [ ] Variant stock levels are tracked and decremented on purchase

### US-15.2: Shopping Cart
**As a** visitor or registered user, **I want to** add products to a cart that persists across sessions **so that** I can continue shopping later.

**Acceptance Criteria:**
- [ ] Guest users get a session-based cart (cookie/session ID)
- [ ] Authenticated users have a persistent user-based cart
- [ ] Guest cart merges into user cart upon login
- [ ] Cart items include product variant, quantity, and computed line total
- [ ] Cart validates stock availability on add and on checkout
- [ ] Cart recalculates totals when items are added, removed, or quantities change
- [ ] Stale cart items (out-of-stock variants) are flagged

### US-15.3: Checkout and Payment
**As a** customer, **I want to** check out using Stripe **so that** I can securely purchase products.

**Acceptance Criteria:**
- [ ] Checkout creates a Stripe PaymentIntent with the cart total
- [ ] Checkout supports 3D Secure authentication flow
- [ ] Stripe webhook handler processes `payment_intent.succeeded`, `payment_intent.payment_failed`, and `charge.refunded` events
- [ ] Webhook endpoint validates Stripe signature
- [ ] Successful payment creates an order and clears the cart
- [ ] Failed payment leaves the cart intact and returns an error
- [ ] Idempotent webhook processing (duplicate events do not create duplicate orders)

### US-15.4: Order Management
**As a** customer, **I want to** view my order history and details **so that** I can track my purchases.

**Acceptance Criteria:**
- [ ] Orders contain line items, totals, discount applied, payment status, and timestamps
- [ ] Order status transitions: pending -> paid -> processing -> shipped -> delivered / cancelled / refunded
- [ ] Customers can view their own order history (paginated)
- [ ] Customers can view a single order detail
- [ ] Admin can view all orders with filters (status, date range, customer)
- [ ] Admin can update order status

### US-15.5: Discount Codes
**As a** customer, **I want to** apply a discount code at checkout **so that** I can receive a price reduction.

**Acceptance Criteria:**
- [ ] Admin can create discount codes with: code, type (percentage/fixed), value, min order amount, max uses, expiry date
- [ ] Discount code validation checks: existence, active status, expiry, usage limit, minimum order amount
- [ ] Discount is applied to the cart total before Stripe PaymentIntent creation
- [ ] Used discount codes increment their usage counter
- [ ] Invalid codes return specific error messages

### US-15.6: Order Confirmation Email
**As a** customer, **I want to** receive an email confirmation when my order is placed **so that** I have a receipt.

**Acceptance Criteria:**
- [ ] Order confirmation email is sent via Brevo after successful payment
- [ ] Email contains order number, items, quantities, prices, discount, total, and estimated delivery
- [ ] Email is queued via BullMQ to avoid blocking the checkout flow
- [ ] Failed email sends are retried up to 3 times
- [ ] Email template is branded with ILoveBerlin design

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday) - Database Schema & Project Setup
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.1: Create product_categories migration | Backend 1 | 2 | id, name, slug, description, image_url, parent_id (self-ref), sort_order, is_active, created_at, updated_at |
| BE-15.2: Create products migration | Backend 1 | 2 | id, category_id (FK), name, slug, description, base_price, is_active, featured, meta_title, meta_description, created_at, updated_at |
| BE-15.3: Create product_variants migration | Backend 1 | 2 | id, product_id (FK), sku, name, price_override, stock_quantity, attributes (JSONB), is_active, created_at, updated_at |
| BE-15.4: Create product_images migration | Backend 1 | 1 | id, product_id (FK), variant_id (FK nullable), url, alt_text, sort_order, is_primary, created_at |
| BE-15.5: Create carts migration | Backend 2 | 1.5 | id, user_id (FK nullable), session_id (unique), status (active/merged/converted), expires_at, created_at, updated_at |
| BE-15.6: Create cart_items migration | Backend 2 | 1 | id, cart_id (FK), product_id (FK), variant_id (FK), quantity, unit_price, created_at, updated_at |
| BE-15.7: Create orders migration | Backend 2 | 2 | id, user_id (FK), order_number (unique), status, subtotal, discount_amount, tax_amount, total, discount_code_id (FK nullable), stripe_payment_intent_id, shipping_address (JSONB), billing_address (JSONB), notes, created_at, updated_at |
| BE-15.8: Create order_items migration | Backend 2 | 1 | id, order_id (FK), product_id (FK), variant_id (FK), product_name, variant_name, quantity, unit_price, total_price |

#### Day 2 (Tuesday) - Discount Codes Schema & Product Module Start
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.9: Create discount_codes migration | Backend 1 | 1.5 | id, code (unique), type (percentage/fixed), value, min_order_amount, max_uses, current_uses, starts_at, expires_at, is_active, created_at, updated_at |
| BE-15.10: Seed database with test categories and products | Backend 1 | 1 | Create seed script with sample Berlin-themed categories and products |
| BE-15.11: ProductCategory entity and repository | Backend 1 | 2 | TypeORM entity, repository with tree structure support, unit tests |
| BE-15.12: ProductCategory CRUD service | Backend 1 | 2.5 | Create, findAll (with tree), findOne, update, delete, slug generation, validation |
| BE-15.13: Product entity and repository | Backend 2 | 2 | TypeORM entity with relations (category, variants, images), repository |
| BE-15.14: Product CRUD service | Backend 2 | 3 | Create, findAll (paginated, filterable), findOne (with variants/images), update, delete, slug generation |

#### Day 3 (Wednesday) - Product Module Completion & Variants
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.15: ProductCategory controller and DTOs | Backend 1 | 2 | REST endpoints, CreateCategoryDto, UpdateCategoryDto, validation pipes |
| BE-15.16: Product controller and DTOs | Backend 1 | 2.5 | REST endpoints with query params for filtering/sorting/pagination, CreateProductDto, UpdateProductDto |
| BE-15.17: ProductVariant entity, service, and controller | Backend 2 | 3 | Full CRUD for variants nested under products, stock management methods |
| BE-15.18: ProductImage entity, service, and controller | Backend 2 | 2.5 | Image upload to Cloudflare R2, reordering, primary image designation, deletion with R2 cleanup |
| BE-15.19: Product module integration tests | Backend 1 | 1.5 | Test category CRUD, product CRUD with relations |
| DevOps-15.1: Configure R2 bucket for product images | DevOps | 2 | Create bucket, set CORS policy, configure presigned URL generation |

#### Day 4 (Thursday) - Cart Module
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.20: Cart entity and repository | Backend 1 | 1.5 | TypeORM entity with relations to cart_items, user |
| BE-15.21: CartItem entity and repository | Backend 1 | 1 | TypeORM entity with relations to product, variant |
| BE-15.22: Cart service - session-based guest cart | Backend 1 | 3 | Create cart with session ID, add/update/remove items, calculate totals, stock validation |
| BE-15.23: Cart service - user-based cart | Backend 2 | 2 | Create/retrieve cart by user ID, same operations as guest cart |
| BE-15.24: Cart merge service | Backend 2 | 2.5 | Merge guest cart into user cart on login, handle duplicate items (sum quantities), mark guest cart as merged |
| BE-15.25: Cart controller and DTOs | Backend 1 | 2 | AddToCartDto, UpdateCartItemDto, cart identification middleware (session or auth) |
| BE-15.26: Cart expiration job (BullMQ) | Backend 2 | 1.5 | Scheduled job to clean up expired guest carts (older than 30 days) |

#### Day 5 (Friday) - Cart Tests & Discount Codes
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.27: Cart module unit tests | Backend 1 | 2 | Test add/remove/update items, total calculation, stock validation |
| BE-15.28: Cart module integration tests | Backend 1 | 2 | Test guest flow, auth flow, merge flow |
| BE-15.29: DiscountCode entity and repository | Backend 2 | 1.5 | TypeORM entity, repository with validation queries |
| BE-15.30: DiscountCode validation service | Backend 2 | 2.5 | Validate code existence, active status, date range, usage limits, minimum order amount; apply discount calculation |
| BE-15.31: DiscountCode admin CRUD service | Backend 2 | 2 | Create, findAll (paginated), findOne, update, deactivate |
| QA-15.1: Set up store backend test environment | QA | 3 | Configure test database, Stripe test keys, R2 test bucket |

### Week 2 (Days 6-10)

#### Day 6 (Monday) - Checkout Module & Stripe Integration
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.32: Stripe service setup | Backend 1 | 2 | Configure Stripe SDK, environment variables, test/live mode switching |
| BE-15.33: Checkout service - PaymentIntent creation | Backend 1 | 3 | Validate cart, apply discount, calculate final total, create Stripe PaymentIntent, return client_secret |
| BE-15.34: Checkout controller and DTOs | Backend 1 | 2 | POST /checkout/create-payment-intent, CheckoutDto (cart_id, discount_code, shipping_address, billing_address) |
| BE-15.35: DiscountCode controller and DTOs | Backend 2 | 2 | Admin CRUD endpoints, POST /discount-codes/validate for customer use |
| BE-15.36: DiscountCode unit tests | Backend 2 | 2 | Test validation logic: expired, max uses, min amount, percentage vs fixed |
| DevOps-15.2: Configure Stripe webhook endpoint | DevOps | 2 | Set up webhook URL, configure events, store webhook secret |

#### Day 7 (Tuesday) - Stripe Webhooks & Order Creation
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.37: Stripe webhook controller | Backend 1 | 2 | POST /webhooks/stripe, raw body parsing, signature verification |
| BE-15.38: Webhook event handlers | Backend 1 | 3 | Handle payment_intent.succeeded (create order), payment_intent.payment_failed (log failure), charge.refunded (update order status) |
| BE-15.39: Idempotent webhook processing | Backend 1 | 2 | Track processed event IDs, skip duplicates, use database transactions |
| BE-15.40: Order entity and repository | Backend 2 | 1.5 | TypeORM entity with all relations, order number generation (ILB-YYYYMMDD-XXXX) |
| BE-15.41: Order service - creation from checkout | Backend 2 | 3 | Create order from cart, create order items, decrement variant stock, clear cart, increment discount usage |
| BE-15.42: Order service - status management | Backend 2 | 1.5 | Status transitions with validation, status history tracking |

#### Day 8 (Wednesday) - Order Module Completion & Email
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.43: Order controller and DTOs | Backend 1 | 2.5 | Customer endpoints (list own orders, view detail), Admin endpoints (list all, filter, update status) |
| BE-15.44: Order confirmation email template | Backend 1 | 2 | Brevo transactional email template with order details, line items, totals |
| BE-15.45: Order confirmation email service | Backend 1 | 2 | BullMQ job to send email via Brevo API, retry logic (3 attempts, exponential backoff) |
| BE-15.46: Admin product management endpoints | Backend 2 | 3 | Bulk activate/deactivate, stock adjustment, featured toggle, product search |
| BE-15.47: Admin order management endpoints | Backend 2 | 2 | Order search, bulk status update, order export (CSV) |
| QA-15.2: Write product CRUD test scenarios | QA | 3 | Category CRUD, product CRUD, variant management, image upload |

#### Day 9 (Thursday) - Admin Discount Management & Integration Tests
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.48: Admin discount management endpoints | Backend 1 | 2 | List with usage stats, bulk activate/deactivate, usage report |
| BE-15.49: Checkout integration tests | Backend 1 | 3 | Test full checkout flow with Stripe test mode, 3DS simulation |
| BE-15.50: Order module integration tests | Backend 2 | 3 | Test order creation, status transitions, stock decrement |
| BE-15.51: Webhook integration tests | Backend 2 | 2 | Simulate Stripe webhook events, test idempotency |
| QA-15.3: Execute cart and checkout test scenarios | QA | 4 | Guest cart, auth cart, merge, checkout success/failure, 3DS |

#### Day 10 (Friday) - Polish, Edge Cases & Documentation
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-15.52: Edge case handling | Backend 1 | 2 | Out-of-stock during checkout, concurrent cart modifications, race conditions on stock |
| BE-15.53: API documentation (Swagger) | Backend 1 | 2 | Document all store endpoints with examples |
| BE-15.54: Performance optimization | Backend 2 | 2 | Add database indexes, optimize product listing queries, eager/lazy loading tuning |
| BE-15.55: Email delivery integration test | Backend 2 | 1.5 | Test with Brevo sandbox, verify email content |
| BE-15.56: Stock reservation mechanism | Backend 2 | 2 | Reserve stock during checkout (15-minute hold), release on timeout |
| QA-15.4: Execute order and discount test scenarios | QA | 3 | Order lifecycle, discount validation, email delivery |
| QA-15.5: Full regression and edge case testing | QA | 3 | End-to-end flows, concurrent user scenarios |

---

## Backend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| BE-15.1-15.9 | Database migrations (9 tables) | Schema design, migrations, indexes, foreign keys, seeds | 14 |
| BE-15.11-15.16 | Product module | Entity, repository, service, controller, DTOs, tests | 14 |
| BE-15.17-15.18 | Variants & images | CRUD, R2 upload, reordering | 5.5 |
| BE-15.19 | Product integration tests | Category + product relation tests | 1.5 |
| BE-15.20-15.28 | Cart module | Entities, guest/user carts, merge, expiration, tests | 18 |
| BE-15.29-15.31 | Discount codes | Entity, validation, admin CRUD | 6 |
| BE-15.32-15.34 | Checkout/Stripe | Stripe SDK, PaymentIntent, controller | 7 |
| BE-15.35-15.36 | Discount controller + tests | Endpoints, validation tests | 4 |
| BE-15.37-15.39 | Stripe webhooks | Controller, handlers, idempotency | 7 |
| BE-15.40-15.42 | Order module | Entity, creation, status management | 6 |
| BE-15.43-15.45 | Order completion + email | Controller, email template, BullMQ job | 6.5 |
| BE-15.46-15.48 | Admin management | Product, order, discount admin endpoints | 7 |
| BE-15.49-15.51 | Integration tests | Checkout, order, webhook tests | 8 |
| BE-15.52-15.56 | Polish & optimization | Edge cases, docs, performance, stock reservation | 9.5 |
| **Total** | | | **109** |

## Frontend Tasks Summary

_No frontend tasks in this sprint. Frontend store work is Sprint 16._

## DevOps/Infrastructure Tasks

| Task ID | Task | Effort (hrs) |
|---------|------|-------------|
| DevOps-15.1 | Configure Cloudflare R2 bucket for product images | 2 |
| DevOps-15.2 | Configure Stripe webhook endpoint (test + production) | 2 |
| **Total** | | **4** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---------|------|---------------|-------------|
| QA-15.1 | Test environment setup | N/A | 3 |
| QA-15.2 | Product CRUD testing | Create/update/delete categories, products, variants; image upload/reorder/delete; pagination and filtering | 3 |
| QA-15.3 | Cart & checkout testing | Guest cart CRUD; auth cart CRUD; cart merge on login; checkout success; checkout failure; 3DS flow; out-of-stock handling | 4 |
| QA-15.4 | Order & discount testing | Order creation; status transitions; discount validation (expired, max uses, min amount); email receipt | 3 |
| QA-15.5 | Regression & edge cases | Concurrent cart modifications; simultaneous checkout for last item; webhook replay; cart expiration | 3 |
| **Total** | | | **16** |

---

## Dependencies

```
BE-15.1-15.9 (migrations) --> All other backend tasks
BE-15.11-15.16 (product module) --> BE-15.17-15.18 (variants/images)
BE-15.17-15.18 (variants/images) --> BE-15.20-15.28 (cart module)
DevOps-15.1 (R2 config) --> BE-15.18 (product images)
BE-15.20-15.28 (cart module) --> BE-15.32-15.34 (checkout)
BE-15.29-15.31 (discount codes) --> BE-15.33 (checkout service - discount application)
BE-15.32-15.34 (checkout) --> BE-15.37-15.39 (webhooks)
BE-15.37-15.39 (webhooks) --> BE-15.40-15.42 (order creation)
DevOps-15.2 (Stripe webhook) --> BE-15.37 (webhook controller)
BE-15.40-15.42 (order module) --> BE-15.44-15.45 (order email)
BE-15.40-15.42 (order module) --> BE-15.43 (order controller)
All implementation tasks --> QA-15.2-15.5 (testing)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stripe API changes or test mode limitations | Low | Medium | Pin Stripe SDK version; review latest API docs before starting |
| Complex cart merge logic causing data loss | Medium | High | Extensive unit testing of merge scenarios; database transactions |
| Race conditions on stock management | Medium | High | Implement optimistic locking on variant stock; use SELECT FOR UPDATE |
| Webhook event ordering issues | Medium | Medium | Idempotent processing; event sequence tracking |
| R2 upload failures or slow performance | Low | Medium | Implement retry logic; client-side presigned URL upload |
| BullMQ email queue failures | Low | Medium | Dead letter queue for failed emails; admin notification for stuck jobs |
| Schema design not accommodating future needs | Low | High | Review schema against Phase 4 requirements before finalizing |

---

## Deliverables Checklist

- [ ] 9 database tables created and migrated (product_categories, products, product_variants, product_images, carts, cart_items, orders, order_items, discount_codes)
- [ ] Product module with full CRUD, variant management, and image upload
- [ ] Cart module with session-based guest cart and user-based authenticated cart
- [ ] Cart merge functionality on user login
- [ ] Checkout module creating Stripe PaymentIntents
- [ ] Stripe webhook handler with signature verification and idempotent processing
- [ ] Order module with creation from successful payment and status management
- [ ] Discount code validation and application at checkout
- [ ] Order confirmation email via Brevo/BullMQ
- [ ] Admin endpoints for product, order, and discount management
- [ ] Cloudflare R2 configured for product image storage
- [ ] Unit tests for all services (>80% coverage)
- [ ] Integration tests for checkout, webhook, and order flows
- [ ] API documentation (Swagger) for all store endpoints
- [ ] Database indexes optimized for common queries

---

## Definition of Done

1. All 9 database tables are created with proper indexes, foreign keys, and constraints
2. All CRUD operations for products, variants, images, categories pass integration tests
3. Guest and authenticated cart flows work end-to-end including merge on login
4. Stripe PaymentIntent creation succeeds with correct amounts (including discounts)
5. Stripe webhooks are processed idempotently with signature verification
6. Orders are created with correct line items, totals, and status after successful payment
7. Discount codes validate all constraints (expiry, usage limits, minimum amount)
8. Order confirmation emails are sent and received with correct content
9. Admin can manage products, orders, and discount codes through API endpoints
10. All endpoints are documented in Swagger
11. Unit test coverage exceeds 80% for new code
12. No critical or high-severity bugs remain open
13. Code reviewed and approved by at least one other developer
14. All database queries execute within 100ms under normal load

---

## Sprint Review Demo Script

1. **Database Schema Tour** (3 min)
   - Show the 9 new tables in a database client
   - Walk through key relationships and indexes

2. **Product Management** (5 min)
   - Create a product category ("Berlin Souvenirs")
   - Create a product ("Brandenburg Gate Snow Globe") with description and price
   - Add variants (Small, Medium, Large) with different prices and stock
   - Upload product images and reorder them
   - Show product listing with filtering and pagination

3. **Shopping Cart** (5 min)
   - Add items to cart as guest (show session-based cart)
   - Update quantities, remove items
   - Log in and demonstrate cart merge
   - Show stock validation when adding more than available

4. **Checkout & Payment** (7 min)
   - Apply a discount code, show validation errors for invalid codes
   - Initiate checkout, show PaymentIntent creation
   - Complete payment with Stripe test card
   - Show webhook processing in logs
   - Show created order with correct totals

5. **Order Confirmation** (3 min)
   - Show the confirmation email received via Brevo
   - Show order in customer's order history
   - Admin views and updates order status

6. **Admin Management** (5 min)
   - Admin product list with bulk operations
   - Admin order list with filters
   - Admin discount code management with usage stats

7. **Edge Cases** (2 min)
   - Attempt to checkout with out-of-stock item
   - Replay a webhook event, show idempotent handling

---

## Rollover Criteria

Tasks may roll over to Sprint 16 if:
- Stripe 3D Secure edge cases require additional handling beyond allocated time
- Cart merge logic requires more than 3 additional hours to resolve edge cases
- R2 integration issues delay image upload beyond Day 4
- Email template design requires design team input not available this sprint

Tasks that MUST complete in this sprint (no rollover):
- All database migrations
- Product CRUD (core, without image upload if R2 is blocked)
- Cart module (guest and authenticated)
- Basic checkout with Stripe PaymentIntent
- Webhook handler with order creation
- Discount code validation

If rollover occurs, the following Sprint 16 tasks will be deprioritized:
- Order export CSV functionality
- Stock reservation mechanism (can use simple decrement instead)
