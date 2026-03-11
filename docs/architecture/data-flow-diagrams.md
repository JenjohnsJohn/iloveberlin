# Data Flow Diagrams

**Platform:** ILoveBerlin (iloveberlin.biz)
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [User Authentication Flow](#user-authentication-flow)
2. [Article Publishing Flow](#article-publishing-flow)
3. [Event Submission Flow](#event-submission-flow)
4. [Classified Listing Flow](#classified-listing-flow)
5. [Store Checkout Flow](#store-checkout-flow)
6. [Media Upload Flow](#media-upload-flow)
7. [Search Indexing Flow](#search-indexing-flow)

---

## User Authentication Flow

### Registration Flow

```
 User (Browser/App)              Next.js / Flutter           NestJS API                PostgreSQL             Redis
      |                               |                         |                        |                    |
      |  1. Fill registration form    |                         |                        |                    |
      |------------------------------>|                         |                        |                    |
      |                               |  2. POST /auth/register |                        |                    |
      |                               |  {email, password, name}|                        |                    |
      |                               |------------------------>|                        |                    |
      |                               |                         |  3. Check duplicate    |                    |
      |                               |                         |  SELECT FROM users     |                    |
      |                               |                         |  WHERE email = ?       |                    |
      |                               |                         |----------------------->|                    |
      |                               |                         |<-----------------------|                    |
      |                               |                         |                        |                    |
      |                               |                         |  4. Hash password      |                    |
      |                               |                         |  (bcrypt, 12 rounds)   |                    |
      |                               |                         |                        |                    |
      |                               |                         |  5. INSERT user        |                    |
      |                               |                         |----------------------->|                    |
      |                               |                         |<-----------------------|                    |
      |                               |                         |                        |                    |
      |                               |                         |  6. Generate tokens    |                    |
      |                               |                         |  - Access (JWT, 15min) |                    |
      |                               |                         |  - Refresh (JWT, 7d)   |                    |
      |                               |                         |                        |                    |
      |                               |                         |  7. Store refresh token|                    |
      |                               |                         |--------------------------------------------------->|
      |                               |                         |                        |                    |
      |                               |                         |  8. Send verification  |                    |
      |                               |                         |  email (async)         |                    |
      |                               |                         |                        |                    |
      |                               |  9. Return tokens + user|                        |                    |
      |                               |<------------------------|                        |                    |
      |  10. Store tokens, redirect   |                         |                        |                    |
      |<------------------------------|                         |                        |                    |
```

### Login Flow

```
 User                     Client                    NestJS API               PostgreSQL          Redis
  |                         |                         |                        |                   |
  |  1. Enter credentials   |                         |                        |                   |
  |------------------------>|                         |                        |                   |
  |                         |  2. POST /auth/login    |                        |                   |
  |                         |  {email, password}      |                        |                   |
  |                         |------------------------>|                        |                   |
  |                         |                         |  3. Find user          |                   |
  |                         |                         |----------------------->|                   |
  |                         |                         |<---- user record ------|                   |
  |                         |                         |                        |                   |
  |                         |                         |  4. Verify password    |                   |
  |                         |                         |  bcrypt.compare()      |                   |
  |                         |                         |                        |                   |
  |                         |                         |  [FAIL] -----> 401 Unauthorized            |
  |                         |                         |                        |                   |
  |                         |                         |  [PASS]                |                   |
  |                         |                         |  5. Check account status                   |
  |                         |                         |  (active, not suspended)                   |
  |                         |                         |                        |                   |
  |                         |                         |  6. Check rate limit   |                   |
  |                         |                         |-------------------------------------->|   |
  |                         |                         |<--------------------------------------|   |
  |                         |                         |                        |                   |
  |                         |                         |  7. Generate JWT pair  |                   |
  |                         |                         |  8. Store refresh token|                   |
  |                         |                         |-------------------------------------->|   |
  |                         |                         |                        |                   |
  |                         |                         |  9. Update lastLoginAt |                   |
  |                         |                         |----------------------->|                   |
  |                         |                         |                        |                   |
  |                         |  10. {accessToken,      |                        |                   |
  |                         |   refreshToken, user}   |                        |                   |
  |                         |<------------------------|                        |                   |
  |  11. Store tokens       |                         |                        |                   |
  |  Redirect to dashboard  |                         |                        |                   |
  |<------------------------|                         |                        |                   |
```

### Token Refresh Flow

```
 Client                     NestJS API                  Redis
  |                           |                           |
  |  API call with expired    |                           |
  |  access token             |                           |
  |-------------------------->|                           |
  |  <--- 401 Unauthorized ---|                           |
  |                           |                           |
  |  POST /auth/refresh       |                           |
  |  {refreshToken}           |                           |
  |-------------------------->|                           |
  |                           |  Validate refresh token   |
  |                           |  (JWT signature + expiry) |
  |                           |                           |
  |                           |  Check token in Redis     |
  |                           |  (not revoked?)           |
  |                           |-------------------------->|
  |                           |<-- token exists ----------|
  |                           |                           |
  |                           |  Revoke old refresh token |
  |                           |  (delete from Redis)      |
  |                           |-------------------------->|
  |                           |                           |
  |                           |  Generate new token pair  |
  |                           |  Store new refresh token  |
  |                           |-------------------------->|
  |                           |                           |
  |  {newAccessToken,         |                           |
  |   newRefreshToken}        |                           |
  |<--------------------------|                           |
  |                           |                           |
  |  Retry original API call  |                           |
  |  with new access token    |                           |
  |-------------------------->|                           |
  |  <--- 200 OK ------------|                           |
```

---

## Article Publishing Flow

```
 Editor                   Admin UI              NestJS API           PostgreSQL        Meilisearch        Cloudflare R2
   |                        |                      |                    |                 |                   |
   |  1. Create article     |                      |                    |                 |                   |
   |  (draft mode)          |                      |                    |                 |                   |
   |----------------------->|                      |                    |                 |                   |
   |                        |                      |                    |                 |                   |
   |  2. Upload images      |                      |                    |                 |                   |
   |  (drag & drop)         |                      |                    |                 |                   |
   |----------------------->|                      |                    |                 |                   |
   |                        |  3. Get presigned URL|                    |                 |                   |
   |                        |--------------------->|                    |                 |                   |
   |                        |<------ URL ----------|                    |                 |                   |
   |                        |                      |                    |                 |                   |
   |                        |  4. Upload to R2 ----|----------------------------------------------------->|
   |                        |<------ 200 OK -------|------------------------------------------------------|
   |                        |                      |                    |                 |                   |
   |                        |  5. Confirm upload   |                    |                 |                   |
   |                        |  POST /media/confirm |                    |                 |                   |
   |                        |--------------------->|                    |                 |                   |
   |                        |                      |  6. Save media     |                 |                   |
   |                        |                      |  metadata          |                 |                   |
   |                        |                      |------------------->|                 |                   |
   |                        |<-- media ID ---------|                    |                 |                   |
   |                        |                      |                    |                 |                   |
   |  7. Write content      |                      |                    |                 |                   |
   |  (rich text editor)    |                      |                    |                 |                   |
   |  Set category, tags    |                      |                    |                 |                   |
   |  Attach media          |                      |                    |                 |                   |
   |----------------------->|                      |                    |                 |                   |
   |                        |  8. POST /articles   |                    |                 |                   |
   |                        |  {title, content,    |                    |                 |                   |
   |                        |   category, tags,    |                    |                 |                   |
   |                        |   mediaIds,          |                    |                 |                   |
   |                        |   status: 'draft'}   |                    |                 |                   |
   |                        |--------------------->|                    |                 |                   |
   |                        |                      |  9. Validate input |                 |                   |
   |                        |                      |  Sanitize HTML     |                 |                   |
   |                        |                      |  Generate slug     |                 |                   |
   |                        |                      |                    |                 |                   |
   |                        |                      |  10. INSERT article|                 |                   |
   |                        |                      |------------------->|                 |                   |
   |                        |                      |<--- article -------|                 |                   |
   |                        |<--- draft created ---|                    |                 |                   |
   |                        |                      |                    |                 |                   |
   |  11. Preview & review  |                      |                    |                 |                   |
   |----------------------->|                      |                    |                 |                   |
   |                        |                      |                    |                 |                   |
   |  12. Click "Publish"   |                      |                    |                 |                   |
   |----------------------->|                      |                    |                 |                   |
   |                        |  13. PATCH /articles |                    |                 |                   |
   |                        |  /:id/publish        |                    |                 |                   |
   |                        |--------------------->|                    |                 |                   |
   |                        |                      |  14. UPDATE article|                 |                   |
   |                        |                      |  status='published'|                 |                   |
   |                        |                      |  publishedAt=NOW() |                 |                   |
   |                        |                      |------------------->|                 |                   |
   |                        |                      |                    |                 |                   |
   |                        |                      |  15. Emit event:   |                 |                   |
   |                        |                      |  'article.published'                 |                   |
   |                        |                      |                    |                 |                   |
   |                        |                      |  16. Index in      |                 |                   |
   |                        |                      |  Meilisearch       |                 |                   |
   |                        |                      |-------------------------------->|    |                   |
   |                        |                      |                    |                 |                   |
   |                        |                      |  17. Trigger ISR   |                 |                   |
   |                        |                      |  revalidation for: |                 |                   |
   |                        |                      |  - /articles       |                 |                   |
   |                        |                      |  - /articles/:slug |                 |                   |
   |                        |                      |  - / (homepage)    |                 |                   |
   |                        |                      |                    |                 |                   |
   |                        |<-- published --------|                    |                 |                   |
   |  18. Article live!     |                      |                    |                 |                   |
   |<-----------------------|                      |                    |                 |                   |
```

---

## Event Submission Flow

```
 User (Public)               Frontend                NestJS API            PostgreSQL          Admin
    |                           |                       |                     |                  |
    |  1. Navigate to           |                       |                     |                  |
    |  /events/submit           |                       |                     |                  |
    |-------------------------->|                       |                     |                  |
    |                           |  2. Check auth        |                     |                  |
    |                           |  (redirect to login   |                     |                  |
    |                           |   if not logged in)   |                     |                  |
    |  3. Fill event form       |                       |                     |                  |
    |  - Title                  |                       |                     |                  |
    |  - Description            |                       |                     |                  |
    |  - Date/Time              |                       |                     |                  |
    |  - Venue/Address          |                       |                     |                  |
    |  - Category               |                       |                     |                  |
    |  - Cover image            |                       |                     |                  |
    |  - Ticket URL (optional)  |                       |                     |                  |
    |  - Recurrence (optional)  |                       |                     |                  |
    |-------------------------->|                       |                     |                  |
    |                           |                       |                     |                  |
    |                           |  4. Upload image      |                     |                  |
    |                           |  (presigned URL flow) |                     |                  |
    |                           |---------------------->|                     |                  |
    |                           |<--- mediaId ----------|                     |                  |
    |                           |                       |                     |                  |
    |                           |  5. POST /events      |                     |                  |
    |                           |  {title, description, |                     |                  |
    |                           |   startDate, endDate, |                     |                  |
    |                           |   venue, category,    |                     |                  |
    |                           |   mediaId, ticketUrl} |                     |                  |
    |                           |---------------------->|                     |                  |
    |                           |                       |                     |                  |
    |                           |                       |  6. Validate:       |                  |
    |                           |                       |  - Required fields  |                  |
    |                           |                       |  - Date in future   |                  |
    |                           |                       |  - Valid category   |                  |
    |                           |                       |  - Sanitize HTML    |                  |
    |                           |                       |                     |                  |
    |                           |                       |  7. INSERT event    |                  |
    |                           |                       |  status='pending'   |                  |
    |                           |                       |-------------------->|                  |
    |                           |                       |<----- event --------|                  |
    |                           |                       |                     |                  |
    |                           |                       |  8. If recurrence:  |                  |
    |                           |                       |  Generate recurrence|                  |
    |                           |                       |  instances          |                  |
    |                           |                       |-------------------->|                  |
    |                           |                       |                     |                  |
    |                           |                       |  9. Notify admin    |                  |
    |                           |                       |  (email + in-app)   |                  |
    |                           |                       |---------------------------------------------->|
    |                           |                       |                     |                  |
    |                           |<-- event submitted ---|                     |                  |
    |  10. "Event submitted     |                       |                     |                  |
    |   for review" message     |                       |                     |                  |
    |<--------------------------|                       |                     |                  |
    |                           |                       |                     |                  |
    |                           |                       |                     |                  |
    |                           |                       |        ADMIN REVIEW PROCESS            |
    |                           |                       |                     |                  |
    |                           |                       |                     |   11. Review     |
    |                           |                       |                     |   pending event  |
    |                           |                       |<---------------------------------------------|
    |                           |                       |                     |                  |
    |                           |                       |  [APPROVE]          |                  |
    |                           |                       |  12. UPDATE event   |                  |
    |                           |                       |  status='approved'  |                  |
    |                           |                       |-------------------->|                  |
    |                           |                       |                     |                  |
    |                           |                       |  13. Index in       |                  |
    |                           |                       |  Meilisearch        |                  |
    |                           |                       |                     |                  |
    |                           |                       |  14. Trigger ISR    |                  |
    |                           |                       |  revalidation       |                  |
    |                           |                       |                     |                  |
    |                           |                       |  15. Notify user    |                  |
    |  16. "Event approved"     |                       |  (email + push)     |                  |
    |  notification received    |                       |                     |                  |
    |                           |                       |                     |                  |
    |                           |                       |  [REJECT]           |                  |
    |                           |                       |  12b. UPDATE event  |                  |
    |                           |                       |  status='rejected'  |                  |
    |                           |                       |  rejectionReason=...|                  |
    |                           |                       |-------------------->|                  |
    |                           |                       |                     |                  |
    |                           |                       |  13b. Notify user   |                  |
    |  14b. "Event rejected     |                       |  with reason        |                  |
    |  because..." notification |                       |                     |                  |
```

---

## Classified Listing Flow

```
 User                      Frontend                NestJS API            PostgreSQL        Meilisearch
   |                          |                       |                     |                  |
   |  1. POST /classifieds    |                       |                     |                  |
   |  {title, description,    |                       |                     |                  |
   |   category, price,       |                       |                     |                  |
   |   contact, mediaIds}     |                       |                     |                  |
   |------------------------->|                       |                     |                  |
   |                          |  2. Submit             |                     |                  |
   |                          |---------------------->|                     |                  |
   |                          |                       |  3. Validate:       |                  |
   |                          |                       |  - Category valid   |                  |
   |                          |                       |  - Price >= 0       |                  |
   |                          |                       |  - No spam keywords |                  |
   |                          |                       |  - Rate limit check |                  |
   |                          |                       |    (5 per day/user) |                  |
   |                          |                       |                     |                  |
   |                          |                       |  4. INSERT classified|                  |
   |                          |                       |  status='active'    |                  |
   |                          |                       |  expiresAt=NOW()+30d|                  |
   |                          |                       |------------------->|                  |
   |                          |                       |<--- classified -----|                  |
   |                          |                       |                     |                  |
   |                          |                       |  5. Index in        |                  |
   |                          |                       |  Meilisearch        |                  |
   |                          |                       |-------------------------------------->|
   |                          |                       |                     |                  |
   |                          |                       |  6. Trigger ISR     |                  |
   |                          |                       |  revalidation       |                  |
   |                          |                       |                     |                  |
   |                          |<-- listing created ---|                     |                  |
   |  7. Listing live!        |                       |                     |                  |
   |<-------------------------|                       |                     |                  |
   |                          |                       |                     |                  |
   |                          |                       |                     |                  |
   |          CLASSIFIED LIFECYCLE                     |                     |                  |
   |                          |                       |                     |                  |
   |  8. Mark as sold         |                       |                     |                  |
   |------------------------->|                       |                     |                  |
   |                          |  PATCH /:id           |                     |                  |
   |                          |  {status: 'sold'}     |                     |                  |
   |                          |---------------------->|                     |                  |
   |                          |                       |  9. Verify owner    |                  |
   |                          |                       |  10. UPDATE status  |                  |
   |                          |                       |------------------->|                  |
   |                          |                       |  11. Update index   |                  |
   |                          |                       |-------------------------------------->|
   |                          |<-- updated -----------|                     |                  |
   |                          |                       |                     |                  |
   |                          |      AUTOMATIC EXPIRY (CRON JOB)            |                  |
   |                          |                       |                     |                  |
   |                          |                       |  12. Daily cron:    |                  |
   |                          |                       |  Find expired       |                  |
   |                          |                       |  classifieds        |                  |
   |                          |                       |------------------->|                  |
   |                          |                       |<-- expired list ----|                  |
   |                          |                       |                     |                  |
   |                          |                       |  13. UPDATE status  |                  |
   |                          |                       |  = 'expired'        |                  |
   |                          |                       |------------------->|                  |
   |                          |                       |                     |                  |
   |                          |                       |  14. Remove from    |                  |
   |                          |                       |  search index       |                  |
   |                          |                       |-------------------------------------->|
   |                          |                       |                     |                  |
   |                          |                       |  15. Notify users   |                  |
   |  16. "Your listing       |                       |  of expiry          |                  |
   |  has expired" email      |                       |                     |                  |
```

---

## Store Checkout Flow

```
 User                     Frontend              NestJS API          PostgreSQL        Stripe           Email
  |                         |                      |                   |                |                |
  |  1. Browse products     |                      |                   |                |                |
  |  Add items to cart      |                      |                   |                |                |
  |------------------------>|                      |                   |                |                |
  |                         |  POST /cart/items     |                   |                |                |
  |                         |  {productId, variant, |                   |                |                |
  |                         |   quantity}           |                   |                |                |
  |                         |--------------------->|                   |                |                |
  |                         |                      |  2. Validate:     |                |                |
  |                         |                      |  - Product exists |                |                |
  |                         |                      |  - Variant valid  |                |                |
  |                         |                      |  - Stock available|                |                |
  |                         |                      |                   |                |                |
  |                         |                      |  3. Upsert cart   |                |                |
  |                         |                      |  item             |                |                |
  |                         |                      |----------------->|                |                |
  |                         |<-- updated cart -----|                   |                |                |
  |                         |                      |                   |                |                |
  |  4. Go to checkout      |                      |                   |                |                |
  |------------------------>|                      |                   |                |                |
  |                         |  GET /cart            |                   |                |                |
  |                         |--------------------->|                   |                |                |
  |                         |                      |  5. Load cart     |                |                |
  |                         |                      |  with product     |                |                |
  |                         |                      |  details + prices |                |                |
  |                         |                      |----------------->|                |                |
  |                         |<-- cart with prices --|                   |                |                |
  |                         |                      |                   |                |                |
  |  6. Enter shipping info |                      |                   |                |                |
  |  + payment details      |                      |                   |                |                |
  |------------------------>|                      |                   |                |                |
  |                         |  POST /checkout       |                   |                |                |
  |                         |  {shippingAddress,    |                   |                |                |
  |                         |   billingAddress}     |                   |                |                |
  |                         |--------------------->|                   |                |                |
  |                         |                      |  7. Re-validate   |                |                |
  |                         |                      |  stock & prices   |                |                |
  |                         |                      |----------------->|                |                |
  |                         |                      |                   |                |                |
  |                         |                      |  8. Calculate:    |                |                |
  |                         |                      |  - Subtotal       |                |                |
  |                         |                      |  - Shipping       |                |                |
  |                         |                      |  - Tax (MwSt 19%) |                |                |
  |                         |                      |  - Total          |                |                |
  |                         |                      |                   |                |                |
  |                         |                      |  9. Create Stripe |                |                |
  |                         |                      |  PaymentIntent    |                |                |
  |                         |                      |---------------------------------------->|           |
  |                         |                      |<--- clientSecret --|----------------|           |
  |                         |                      |                   |                |                |
  |                         |                      |  10. Create order  |                |                |
  |                         |                      |  status='pending'  |                |                |
  |                         |                      |----------------->|                |                |
  |                         |                      |<-- order ---------|                |                |
  |                         |                      |                   |                |                |
  |                         |<-- {clientSecret,    |                   |                |                |
  |                         |     orderId} --------|                   |                |                |
  |                         |                      |                   |                |                |
  |  11. Stripe.js confirms |                      |                   |                |                |
  |  payment in browser     |                      |                   |                |                |
  |--------------------------- Stripe.confirmPayment() -------------------------------->|               |
  |<-- payment result ------- (direct client-Stripe communication) --<----------------|               |
  |                         |                      |                   |                |                |
  |                         |                      |                   |                |                |
  |                         |                      |   STRIPE WEBHOOK                   |                |
  |                         |                      |                   |                |                |
  |                         |                      |  12. POST /webhooks/stripe         |                |
  |                         |                      |  payment_intent.succeeded          |                |
  |                         |                      |<---------------------------------------|           |
  |                         |                      |                   |                |                |
  |                         |                      |  13. Verify webhook|                |                |
  |                         |                      |  signature         |                |                |
  |                         |                      |                   |                |                |
  |                         |                      |  14. UPDATE order  |                |                |
  |                         |                      |  status='paid'     |                |                |
  |                         |                      |  paymentId=pi_...  |                |                |
  |                         |                      |----------------->|                |                |
  |                         |                      |                   |                |                |
  |                         |                      |  15. Decrement    |                |                |
  |                         |                      |  product stock    |                |                |
  |                         |                      |----------------->|                |                |
  |                         |                      |                   |                |                |
  |                         |                      |  16. Clear cart   |                |                |
  |                         |                      |----------------->|                |                |
  |                         |                      |                   |                |                |
  |                         |                      |  17. Send order   |                |                |
  |                         |                      |  confirmation     |                |                |
  |                         |                      |------------------------------------------------------->|
  |  18. Confirmation email |                      |                   |                |                |
  |<---------------------------------------------------------------------------------------|            |
  |                         |                      |                   |                |                |
  |  19. Redirect to        |                      |                   |                |                |
  |  order confirmation     |                      |                   |                |                |
  |  page                   |                      |                   |                |                |
  |<------------------------|                      |                   |                |                |
```

---

## Media Upload Flow

```
 Client                   NestJS API           Cloudflare R2         PostgreSQL          Sharp
   |                         |                      |                    |                  |
   |  1. Request upload      |                      |                    |                  |
   |  POST /media/presign    |                      |                    |                  |
   |  {filename, mimeType,   |                      |                    |                  |
   |   size, context}        |                      |                    |                  |
   |------------------------>|                      |                    |                  |
   |                         |  2. Validate:         |                    |                  |
   |                         |  - Allowed MIME type  |                    |                  |
   |                         |  - Max size (10MB img,|                    |                  |
   |                         |    100MB video)       |                    |                  |
   |                         |  - User upload quota  |                    |                  |
   |                         |                      |                    |                  |
   |                         |  3. Generate upload   |                    |                  |
   |                         |  path:                |                    |                  |
   |                         |  media/{context}/     |                    |                  |
   |                         |  {yyyy}/{mm}/{uuid}.  |                    |                  |
   |                         |  {ext}                |                    |                  |
   |                         |                      |                    |                  |
   |                         |  4. Create presigned  |                    |                  |
   |                         |  PUT URL (15min exp)  |                    |                  |
   |                         |--------------------->|                    |                  |
   |                         |<-- presigned URL ----|                    |                  |
   |                         |                      |                    |                  |
   |                         |  5. Create media      |                    |                  |
   |                         |  record (pending)     |                    |                  |
   |                         |-------------------------------------------->|               |
   |                         |                      |                    |                  |
   |  6. {uploadUrl,          |                      |                    |                  |
   |   mediaId, fields}      |                      |                    |                  |
   |<------------------------|                      |                    |                  |
   |                         |                      |                    |                  |
   |  7. PUT file directly   |                      |                    |                  |
   |  to presigned URL       |                      |                    |                  |
   |  (browser -> R2)        |                      |                    |                  |
   |---------------------------------------------->|                    |                  |
   |<-- 200 OK --------------|----------------------|                    |                  |
   |                         |                      |                    |                  |
   |  8. Confirm upload      |                      |                    |                  |
   |  POST /media/:id/confirm|                      |                    |                  |
   |------------------------>|                      |                    |                  |
   |                         |  9. Verify file       |                    |                  |
   |                         |  exists in R2         |                    |                  |
   |                         |--------------------->|                    |                  |
   |                         |<-- file metadata ----|                    |                  |
   |                         |                      |                    |                  |
   |                         |  10. If image:        |                    |                  |
   |                         |  Trigger processing   |                    |                  |
   |                         |  pipeline             |                    |                  |
   |                         |                      |                    |                  |
   |                         |  11. Download         |                    |                  |
   |                         |  original from R2     |                    |                  |
   |                         |--------------------->|                    |                  |
   |                         |<-- image data -------|                    |                  |
   |                         |                      |                    |                  |
   |                         |  12. Process with Sharp --------------------------------->|  |
   |                         |  - Thumbnail (150x150)  |                    |              |  |
   |                         |  - Small    (400x300)   |                    |              |  |
   |                         |  - Medium   (800x600)   |                    |              |  |
   |                         |  - Large    (1200x900)  |                    |              |  |
   |                         |  - Convert to WebP      |                    |              |  |
   |                         |  - Strip EXIF metadata  |                    |              |  |
   |                         |<------ processed variants ----------------------------|     |
   |                         |                      |                    |                  |
   |                         |  13. Upload variants  |                    |                  |
   |                         |  to R2                |                    |                  |
   |                         |--------------------->|                    |                  |
   |                         |                      |                    |                  |
   |                         |  14. UPDATE media     |                    |                  |
   |                         |  record:              |                    |                  |
   |                         |  status='processed'   |                    |                  |
   |                         |  variants={...}       |                    |                  |
   |                         |  width, height        |                    |                  |
   |                         |-------------------------------------------->|               |
   |                         |                      |                    |                  |
   |  15. {mediaId,           |                      |                    |                  |
   |   urls: {thumb, sm,     |                      |                    |                  |
   |    md, lg, original}}   |                      |                    |                  |
   |<------------------------|                      |                    |                  |
```

---

## Search Indexing Flow

```
 Content Service           Event Bus             Search Service          Meilisearch        PostgreSQL
      |                       |                       |                      |                  |
      |                       |                       |                      |                  |
      |   REAL-TIME INDEXING (on content change)      |                      |                  |
      |                       |                       |                      |                  |
      |  1. Article created/  |                       |                      |                  |
      |  updated/published    |                       |                      |                  |
      |  emit('article.       |                       |                      |                  |
      |   published', data)   |                       |                      |                  |
      |---------------------->|                       |                      |                  |
      |                       |  2. Route to          |                      |                  |
      |                       |  SearchService        |                      |                  |
      |                       |---------------------->|                      |                  |
      |                       |                       |  3. Transform entity |                  |
      |                       |                       |  to search document: |                  |
      |                       |                       |  {                   |                  |
      |                       |                       |    id, title, slug,  |                  |
      |                       |                       |    excerpt, content, |                  |
      |                       |                       |    category, tags,   |                  |
      |                       |                       |    author, date,     |                  |
      |                       |                       |    type: 'article'   |                  |
      |                       |                       |  }                   |                  |
      |                       |                       |                      |                  |
      |                       |                       |  4. PUT /indexes/    |                  |
      |                       |                       |  articles/documents  |                  |
      |                       |                       |--------------------->|                  |
      |                       |                       |<-- taskUid ----------|                  |
      |                       |                       |                      |                  |
      |                       |                       |                      |                  |
      |   DELETION                                    |                      |                  |
      |                       |                       |                      |                  |
      |  5. Article deleted/  |                       |                      |                  |
      |  unpublished          |                       |                      |                  |
      |  emit('article.       |                       |                      |                  |
      |   unpublished', id)   |                       |                      |                  |
      |---------------------->|                       |                      |                  |
      |                       |---------------------->|                      |                  |
      |                       |                       |  6. DELETE /indexes/ |                  |
      |                       |                       |  articles/documents/ |                  |
      |                       |                       |  :id                 |                  |
      |                       |                       |--------------------->|                  |
      |                       |                       |                      |                  |
      |                       |                       |                      |                  |
      |   FULL REINDEX (scheduled / manual)           |                      |                  |
      |                       |                       |                      |                  |
      |                       |                       |  7. Cron: daily 3AM  |                  |
      |                       |                       |  or manual trigger   |                  |
      |                       |                       |                      |                  |
      |                       |                       |  8. For each content |                  |
      |                       |                       |  type (7 types):     |                  |
      |                       |                       |                      |                  |
      |                       |                       |  9. Fetch all from   |                  |
      |                       |                       |  PostgreSQL          |                  |
      |                       |                       |  (paginated, 1000/   |                  |
      |                       |                       |   batch)             |                  |
      |                       |                       |---------------------------------------------->|
      |                       |                       |<--- batch of records -------------------------|
      |                       |                       |                      |                  |
      |                       |                       |  10. Transform to    |                  |
      |                       |                       |  search documents    |                  |
      |                       |                       |                      |                  |
      |                       |                       |  11. Bulk upsert     |                  |
      |                       |                       |  POST /indexes/      |                  |
      |                       |                       |  {type}/documents    |                  |
      |                       |                       |--------------------->|                  |
      |                       |                       |                      |                  |
      |                       |                       |  12. Repeat for all  |                  |
      |                       |                       |  batches and types   |                  |
      |                       |                       |                      |                  |
      |                       |                       |  13. Log reindex     |                  |
      |                       |                       |  completion metrics  |                  |
      |                       |                       |  (docs indexed, time,|                  |
      |                       |                       |   errors)            |                  |
      |                       |                       |                      |                  |
      |                       |                       |                      |                  |
      |   SEARCH QUERY FLOW                           |                      |                  |
      |                       |                       |                      |                  |
      |                       |        User query:    |                      |                  |
      |                       |        GET /search    |                      |                  |
      |                       |        ?q=berlin+wall |                      |                  |
      |                       |        &type=article  |                      |                  |
      |                       |        &limit=20      |                      |                  |
      |                       |        --------------------------->|         |                  |
      |                       |                       |            |         |                  |
      |                       |                       |  14. Multi-index     |                  |
      |                       |                       |  search (if no type  |                  |
      |                       |                       |  filter)             |                  |
      |                       |                       |  or single-index     |                  |
      |                       |                       |  search (with type)  |                  |
      |                       |                       |--------------------->|                  |
      |                       |                       |<-- results ----------|                  |
      |                       |                       |                      |                  |
      |                       |                       |  15. Enrich results  |                  |
      |                       |                       |  with additional data|                  |
      |                       |                       |  (author, images)    |                  |
      |                       |                       |  from PostgreSQL     |                  |
      |                       |                       |---------------------------------------------->|
      |                       |                       |<-----------------------------------------------------|
      |                       |                       |                      |                  |
      |                       |                       |  16. Return unified  |                  |
      |                       |                       |  search response     |                  |
```
