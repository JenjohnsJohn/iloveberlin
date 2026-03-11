# Backend Module Architecture

**Platform:** ILoveBerlin (iloveberlin.biz)
**Framework:** NestJS 10+ with TypeORM
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [Module Structure Convention](#module-structure-convention)
3. [Module Descriptions](#module-descriptions)
4. [Module Dependency Graph](#module-dependency-graph)
5. [Shared Modules](#shared-modules)
6. [Middleware Pipeline](#middleware-pipeline)
7. [Interceptors](#interceptors)
8. [Exception Filters](#exception-filters)
9. [Guards](#guards)
10. [TypeORM Repository Pattern](#typeorm-repository-pattern)
11. [Application Bootstrap](#application-bootstrap)

---

## Module Overview

The NestJS backend is organized into 13 domain modules, each encapsulating a bounded context of the platform's business logic. Modules follow a consistent internal structure and communicate through well-defined interfaces.

```
src/
├── main.ts
├── app.module.ts
├── common/                    # Shared utilities, decorators, pipes
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── interfaces/
│   ├── middleware/
│   ├── pipes/
│   └── utils/
├── config/                    # Configuration module
│   ├── config.module.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── cloudflare.config.ts
│   └── app.config.ts
└── modules/
    ├── auth/
    ├── user/
    ├── article/
    ├── guide/
    ├── event/
    ├── dining/
    ├── video/
    ├── competition/
    ├── classified/
    ├── store/
    ├── search/
    ├── media/
    └── admin/
```

---

## Module Structure Convention

Every domain module follows the same internal structure:

```
modules/<module-name>/
├── <module-name>.module.ts          # Module definition
├── <module-name>.controller.ts      # HTTP route handlers
├── <module-name>.service.ts         # Business logic
├── dto/
│   ├── create-<entity>.dto.ts       # Validated input for creation
│   ├── update-<entity>.dto.ts       # Validated input for updates
│   ├── query-<entity>.dto.ts        # Query/filter parameters
│   └── <entity>-response.dto.ts     # Serialized output shape
├── entities/
│   ├── <entity>.entity.ts           # TypeORM entity definition
│   └── <related-entity>.entity.ts   # Related entities (if any)
├── guards/
│   └── <module>-owner.guard.ts      # Module-specific authorization
├── interfaces/
│   └── <module>.interface.ts        # TypeScript interfaces
├── subscribers/
│   └── <entity>.subscriber.ts       # TypeORM entity subscribers
└── tests/
    ├── <module>.controller.spec.ts
    └── <module>.service.spec.ts
```

---

## Module Descriptions

### Auth Module

Handles user authentication, token management, and password operations.

```
modules/auth/
├── auth.module.ts
├── auth.controller.ts           # POST /auth/login, /auth/register, /auth/refresh, etc.
├── auth.service.ts              # Login, register, token generation/validation
├── dto/
│   ├── login.dto.ts             # { email, password }
│   ├── register.dto.ts          # { email, password, name, ... }
│   ├── refresh-token.dto.ts     # { refreshToken }
│   ├── forgot-password.dto.ts   # { email }
│   └── reset-password.dto.ts    # { token, newPassword }
├── entities/
│   └── refresh-token.entity.ts  # Stored refresh tokens
├── guards/
│   ├── jwt-auth.guard.ts        # Validates JWT access tokens
│   ├── jwt-refresh.guard.ts     # Validates JWT refresh tokens
│   └── local-auth.guard.ts      # Validates email/password login
├── strategies/
│   ├── jwt.strategy.ts          # Passport JWT strategy
│   ├── jwt-refresh.strategy.ts  # Passport refresh token strategy
│   └── local.strategy.ts        # Passport local strategy
└── tests/
```

**Key Endpoints:**

| Method | Endpoint                 | Auth     | Description                   |
| ------ | ------------------------ | -------- | ----------------------------- |
| POST   | /api/v1/auth/register    | Public   | Register a new user           |
| POST   | /api/v1/auth/login       | Public   | Authenticate and get tokens   |
| POST   | /api/v1/auth/refresh     | Refresh  | Get new access token          |
| POST   | /api/v1/auth/logout      | Bearer   | Invalidate refresh token      |
| POST   | /api/v1/auth/forgot-password | Public | Send password reset email |
| POST   | /api/v1/auth/reset-password  | Token  | Reset password with token |

### User Module

Manages user profiles, roles, preferences, and account settings.

```
modules/user/
├── user.module.ts
├── user.controller.ts           # GET/PATCH /users, /users/me, etc.
├── user.service.ts
├── dto/
│   ├── update-user.dto.ts
│   ├── user-response.dto.ts
│   └── query-users.dto.ts
├── entities/
│   ├── user.entity.ts           # Core user table
│   └── user-preference.entity.ts
├── guards/
│   └── user-owner.guard.ts
└── tests/
```

**User Entity Fields:**

| Field           | Type        | Notes                             |
| --------------- | ----------- | --------------------------------- |
| id              | UUID        | Primary key                       |
| email           | VARCHAR     | Unique, indexed                   |
| passwordHash    | VARCHAR     | bcrypt hashed                     |
| name            | VARCHAR     | Display name                      |
| bio             | TEXT        | Optional biography                |
| avatarUrl       | VARCHAR     | URL to avatar in R2               |
| role            | ENUM        | user, editor, admin               |
| status          | ENUM        | active, suspended, deactivated    |
| emailVerified   | BOOLEAN     | Email verification status         |
| lastLoginAt     | TIMESTAMP   | Last successful login             |
| createdAt       | TIMESTAMP   | Auto-generated                    |
| updatedAt       | TIMESTAMP   | Auto-updated                      |

### Article Module

Manages Berlin-focused articles with rich content, categories, and author attribution.

```
modules/article/
├── article.module.ts
├── article.controller.ts        # Full CRUD + publish/unpublish
├── article.service.ts
├── dto/
│   ├── create-article.dto.ts
│   ├── update-article.dto.ts
│   ├── query-articles.dto.ts
│   └── article-response.dto.ts
├── entities/
│   ├── article.entity.ts
│   ├── article-category.entity.ts
│   └── article-tag.entity.ts
├── subscribers/
│   └── article.subscriber.ts   # Emits events for search indexing
└── tests/
```

### Guide Module

City guides organized by neighborhood and theme (food, nightlife, culture, etc.).

```
modules/guide/
├── guide.module.ts
├── guide.controller.ts
├── guide.service.ts
├── dto/
│   ├── create-guide.dto.ts
│   ├── update-guide.dto.ts
│   ├── query-guides.dto.ts
│   └── guide-response.dto.ts
├── entities/
│   ├── guide.entity.ts
│   ├── guide-section.entity.ts
│   └── guide-poi.entity.ts      # Points of interest within guide
└── tests/
```

### Event Module

Berlin events calendar with submission workflow, categorization, and recurrence.

```
modules/event/
├── event.module.ts
├── event.controller.ts
├── event.service.ts
├── dto/
│   ├── create-event.dto.ts
│   ├── update-event.dto.ts
│   ├── query-events.dto.ts
│   └── event-response.dto.ts
├── entities/
│   ├── event.entity.ts
│   ├── event-category.entity.ts
│   └── event-recurrence.entity.ts
├── guards/
│   └── event-owner.guard.ts
└── tests/
```

### Dining Module

Restaurant and cafe listings with reviews, ratings, and neighborhood filtering.

```
modules/dining/
├── dining.module.ts
├── dining.controller.ts
├── dining.service.ts
├── dto/
│   ├── create-dining.dto.ts
│   ├── update-dining.dto.ts
│   ├── create-review.dto.ts
│   ├── query-dining.dto.ts
│   └── dining-response.dto.ts
├── entities/
│   ├── dining.entity.ts
│   ├── dining-review.entity.ts
│   ├── dining-cuisine.entity.ts
│   └── dining-hours.entity.ts
└── tests/
```

### Video Module

Video content management with external hosting references and metadata.

```
modules/video/
├── video.module.ts
├── video.controller.ts
├── video.service.ts
├── dto/
│   ├── create-video.dto.ts
│   ├── update-video.dto.ts
│   ├── query-videos.dto.ts
│   └── video-response.dto.ts
├── entities/
│   ├── video.entity.ts
│   └── video-category.entity.ts
└── tests/
```

### Competition Module

Contests and giveaways with entry tracking and winner selection.

```
modules/competition/
├── competition.module.ts
├── competition.controller.ts
├── competition.service.ts
├── dto/
│   ├── create-competition.dto.ts
│   ├── enter-competition.dto.ts
│   ├── query-competitions.dto.ts
│   └── competition-response.dto.ts
├── entities/
│   ├── competition.entity.ts
│   └── competition-entry.entity.ts
└── tests/
```

### Classified Module

User-submitted classified listings (housing, jobs, services, items for sale).

```
modules/classified/
├── classified.module.ts
├── classified.controller.ts
├── classified.service.ts
├── dto/
│   ├── create-classified.dto.ts
│   ├── update-classified.dto.ts
│   ├── query-classifieds.dto.ts
│   └── classified-response.dto.ts
├── entities/
│   ├── classified.entity.ts
│   └── classified-category.entity.ts
├── guards/
│   └── classified-owner.guard.ts
└── tests/
```

### Store Module

E-commerce module for Berlin-themed merchandise with cart, checkout, and order tracking.

```
modules/store/
├── store.module.ts
├── store.controller.ts
├── store.service.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── add-to-cart.dto.ts
│   ├── checkout.dto.ts
│   ├── query-products.dto.ts
│   └── product-response.dto.ts
├── entities/
│   ├── product.entity.ts
│   ├── product-variant.entity.ts
│   ├── cart.entity.ts
│   ├── cart-item.entity.ts
│   ├── order.entity.ts
│   └── order-item.entity.ts
├── guards/
│   └── order-owner.guard.ts
└── tests/
```

### Search Module

Unified search interface across all content types, powered by Meilisearch.

```
modules/search/
├── search.module.ts
├── search.controller.ts        # GET /search?q=...&type=...
├── search.service.ts           # Query Meilisearch, aggregate results
├── indexing.service.ts          # Sync PostgreSQL data to Meilisearch
├── dto/
│   ├── search-query.dto.ts
│   └── search-response.dto.ts
├── interfaces/
│   └── searchable.interface.ts  # Implemented by indexable entities
└── tests/
```

### Media Module

Centralized media management: upload, processing, storage, and delivery.

```
modules/media/
├── media.module.ts
├── media.controller.ts         # POST /media/upload, GET /media/:id
├── media.service.ts            # Presigned URL generation, metadata tracking
├── processing.service.ts       # Image resize/optimization with Sharp
├── dto/
│   ├── upload-request.dto.ts
│   ├── upload-response.dto.ts
│   └── media-response.dto.ts
├── entities/
│   └── media.entity.ts
└── tests/
```

### Admin Module

Administrative dashboard API for content moderation, user management, and analytics.

```
modules/admin/
├── admin.module.ts
├── admin.controller.ts         # /admin/* endpoints
├── admin.service.ts
├── dto/
│   ├── admin-query.dto.ts
│   ├── moderate-content.dto.ts
│   └── dashboard-response.dto.ts
├── guards/
│   └── admin-role.guard.ts     # Restricts to admin role
└── tests/
```

---

## Module Dependency Graph

```
                            +-------------+
                            |  AppModule  |
                            +------+------+
                                   |
                    +--------------++--------------+
                    |               |              |
                    v               v              v
             +----------+   +----------+   +-----------+
             | Config   |   | Common   |   | Database  |
             | Module   |   | Module   |   | Module    |
             +----------+   +----------+   +-----------+
                    |               |              |
        +-----------+-----------+--+--+------------+
        |           |           |     |            |
        v           v           v     v            v
   +--------+  +--------+  +------+ +------+ +---------+
   | Auth   |  | Media  |  |Search| |Redis | | Health  |
   | Module |  | Module |  |Module| |Module| | Module  |
   +---+----+  +---+----+  +--+---+ +------+ +---------+
       |            |          |
       v            |          |
   +--------+      |          |
   | User   |      |          |
   | Module |      |          |
   +---+----+      |          |
       |            |          |
       +-----+-----+-----+----+
             |           |
    +--------+--------+  |
    |        |        |  |
    v        v        v  v
+-------+ +-----+ +-------+
|Article| |Guide| | Event |
|Module | |Mod. | | Module|
+-------+ +-----+ +-------+

+-------+ +-------+ +-----------+ +----------+ +-------+
|Dining | |Video  | |Competition| |Classified | | Store |
|Module | |Module | |Module     | |Module     | |Module |
+-------+ +-------+ +-----------+ +----------+ +-------+
    |         |           |             |           |
    +---------+-----------+-------------+-----------+
                          |
                All depend on: Auth, User, Media, Search
```

### Dependency Table

| Module       | Depends On                                          |
| ------------ | --------------------------------------------------- |
| Auth         | Config, User, Redis                                 |
| User         | Config, Media                                       |
| Article      | Config, Auth, User, Media, Search                   |
| Guide        | Config, Auth, User, Media, Search                   |
| Event        | Config, Auth, User, Media, Search                   |
| Dining       | Config, Auth, User, Media, Search                   |
| Video        | Config, Auth, User, Media, Search                   |
| Competition  | Config, Auth, User, Media, Search                   |
| Classified   | Config, Auth, User, Media, Search                   |
| Store        | Config, Auth, User, Media, Search, Redis             |
| Search       | Config, Meilisearch client                          |
| Media        | Config, Cloudflare R2 SDK                           |
| Admin        | Config, Auth, User, Article, Event, Classified, Store |

---

## Shared Modules

### Common Module

Provides utilities, decorators, and base classes used across all modules.

```typescript
// common/decorators/
@CurrentUser()          // Extract authenticated user from request
@Roles('admin','editor')// Declare required roles
@Public()               // Mark endpoint as publicly accessible
@ApiPaginated()         // Swagger pagination decorator
@Serialize(DtoClass)    // Response serialization decorator

// common/dto/
PaginationQueryDto      // { page, limit, sortBy, sortOrder }
PaginatedResponseDto<T> // { data: T[], meta: { total, page, limit, totalPages } }
ApiResponseDto<T>       // { success, data, message, timestamp }

// common/pipes/
ParseUUIDPipe           // Validates UUID route parameters
TrimPipe                // Trims whitespace from string inputs

// common/utils/
slugify()               // Generate URL-safe slugs from titles
sanitizeHtml()          // Clean user-submitted HTML content
generateToken()         // Cryptographically secure random tokens
```

### Config Module

Centralized configuration with environment variable validation using `@nestjs/config` and Joi schemas.

```
Config Module
├── app.config.ts        # APP_PORT, APP_ENV, APP_URL, CORS_ORIGINS
├── database.config.ts   # DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
├── redis.config.ts      # REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
├── auth.config.ts       # JWT_SECRET, JWT_EXPIRY, REFRESH_EXPIRY
├── cloudflare.config.ts # R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_BUCKET
├── meilisearch.config.ts# MEILI_HOST, MEILI_MASTER_KEY
├── mail.config.ts       # SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
└── stripe.config.ts     # STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

### Database Module

TypeORM configuration with connection pooling and migration support.

```
Database Module
├── database.module.ts       # TypeOrmModule.forRootAsync(...)
├── migrations/              # Versioned schema migrations
│   ├── 1700000000000-InitialSchema.ts
│   ├── 1700000001000-AddArticleCategories.ts
│   └── ...
├── seeds/                   # Development seed data
│   ├── seed.ts
│   ├── users.seed.ts
│   └── articles.seed.ts
└── data-source.ts           # TypeORM CLI data source
```

---

## Middleware Pipeline

The NestJS request lifecycle processes every incoming request through a defined pipeline of middleware, guards, interceptors, pipes, and filters.

```
Incoming HTTP Request
        |
        v
+------------------+
| 1. MIDDLEWARE     |  Global middleware applied to all routes
|   - Helmet       |  Security headers (X-Frame-Options, CSP, etc.)
|   - CORS         |  Cross-origin resource sharing configuration
|   - Compression  |  Gzip/Brotli response compression
|   - Morgan/Logger|  HTTP request logging
|   - Rate Limiter |  Global rate limiting (100 req/min default)
|   - Cookie Parser|  Parse cookies for refresh tokens
+--------+---------+
         |
         v
+------------------+
| 2. GUARDS        |  Authentication and authorization checks
|   - JwtAuthGuard |  Validate Bearer token (unless @Public)
|   - RolesGuard   |  Check user role against @Roles() decorator
|   - ThrottleGuard|  Per-endpoint rate limiting
|   - OwnerGuard   |  Resource ownership verification
+--------+---------+
         |
         v
+------------------+
| 3. INTERCEPTORS  |  Request/response transformation
|   (Before)       |
|   - LoggingIntcpt|  Log request start time
|   - CacheIntcpt  |  Check Redis cache for GET requests
+--------+---------+
         |
         v
+------------------+
| 4. PIPES         |  Input validation and transformation
|   - ValidationPipe| class-validator DTO validation
|   - ParseUUIDPipe|  Validate UUID parameters
|   - TrimPipe     |  Trim whitespace from strings
+--------+---------+
         |
         v
+------------------+
| 5. CONTROLLER    |  Route handler execution
|   method()       |
+--------+---------+
         |
         v
+------------------+
| 6. SERVICE       |  Business logic execution
|   method()       |
+--------+---------+
         |
         v
+------------------+
| 7. INTERCEPTORS  |  Response transformation
|   (After)        |
|   - TransformInt |  Wrap response in ApiResponseDto
|   - CacheIntcpt  |  Store result in Redis cache
|   - LoggingIntcpt|  Log request duration
+--------+---------+
         |
         v
+------------------+
| 8. EXCEPTION     |  Error handling (if exception thrown)
|    FILTERS       |
|   - HttpException|  Standard HTTP error responses
|   - TypeORM      |  Database constraint violations
|   - Validation   |  DTO validation error formatting
|   - AllExceptions|  Catch-all for unhandled errors
+--------+---------+
         |
         v
   HTTP Response
```

---

## Interceptors

### Logging Interceptor

Logs every request with method, URL, user, duration, and status code.

```
LoggingInterceptor
├── Before: Record start timestamp, log request details
├── After:  Calculate duration, log response status
└── Error:  Log error details with stack trace

Log format (production):
{
  "timestamp": "2026-03-12T14:30:00.000Z",
  "method": "GET",
  "url": "/api/v1/articles?page=1",
  "userId": "uuid-or-anonymous",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "duration": 45,
  "statusCode": 200
}
```

### Transform Interceptor

Wraps all successful responses in a standard envelope.

```
Input (raw service response):
  { id: "...", title: "Berlin Wall History", ... }

Output (transformed):
  {
    "success": true,
    "data": { id: "...", title: "Berlin Wall History", ... },
    "timestamp": "2026-03-12T14:30:00.000Z"
  }
```

### Cache Interceptor

Caches GET responses in Redis with configurable TTL per endpoint.

```
CacheInterceptor
├── Before:
│   ├── Generate cache key from URL + query params + user role
│   ├── Check Redis for cached response
│   ├── HIT:  Return cached response (skip controller)
│   └── MISS: Continue to controller
├── After:
│   └── Store response in Redis with TTL
└── Configuration:
    ├── @CacheTTL(300)    // Cache for 5 minutes
    ├── @NoCache()        // Skip caching for this endpoint
    └── Cache key pattern: "cache:<module>:<method>:<hash>"
```

### Timeout Interceptor

Enforces a maximum request duration to prevent long-running queries.

```
TimeoutInterceptor
├── Default timeout: 30 seconds
├── Configurable per endpoint: @Timeout(60000)
└── Throws: RequestTimeoutException on timeout
```

---

## Exception Filters

### HTTP Exception Filter

Formats standard NestJS HTTP exceptions into a consistent error response.

```
Response format:
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Article not found",
    "error": "Not Found",
    "timestamp": "2026-03-12T14:30:00.000Z",
    "path": "/api/v1/articles/invalid-uuid"
  }
}
```

### Validation Exception Filter

Formats class-validator errors into a structured list of field errors.

```
Response format:
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [
      {
        "field": "email",
        "messages": ["email must be a valid email address"]
      },
      {
        "field": "password",
        "messages": [
          "password must be at least 8 characters",
          "password must contain at least one uppercase letter"
        ]
      }
    ],
    "timestamp": "2026-03-12T14:30:00.000Z"
  }
}
```

### TypeORM Exception Filter

Catches database-level errors and translates them to user-friendly messages.

```
Mapping:
├── UniqueConstraintViolation (23505) -> 409 Conflict
│   "A record with this [field] already exists"
├── ForeignKeyViolation (23503) -> 400 Bad Request
│   "Referenced resource does not exist"
├── NotNullViolation (23502) -> 400 Bad Request
│   "Required field [field] is missing"
└── All others -> 500 Internal Server Error
    "An unexpected database error occurred" (details logged, not exposed)
```

### All Exceptions Filter (Catch-All)

Last-resort handler for unhandled exceptions. Logs the full error (including stack trace) but returns a generic message to the client.

---

## Guards

### JWT Authentication Guard

```
JwtAuthGuard (Global)
├── Checks for @Public() decorator -> skip if present
├── Extracts Bearer token from Authorization header
├── Validates JWT signature and expiry
├── Attaches decoded user payload to request.user
├── Rejects with 401 Unauthorized if invalid
└── Configuration:
    ├── Algorithm: RS256
    ├── Access token expiry: 15 minutes
    └── Issuer: iloveberlin.biz
```

### Roles Guard

```
RolesGuard
├── Checks for @Roles() decorator on handler/class
├── Compares request.user.role against required roles
├── Rejects with 403 Forbidden if role insufficient
└── Role hierarchy:
    ├── admin  -> Full access
    ├── editor -> Content management access
    └── user   -> Standard user access
```

### Throttle Guard

```
ThrottleGuard (Global)
├── Default: 100 requests per 60 seconds per IP
├── Tracked in Redis (key: "throttle:<ip>:<endpoint>")
├── Custom limits per endpoint:
│   ├── POST /auth/login     -> 5 per 60s
│   ├── POST /auth/register  -> 3 per 60s
│   ├── POST /media/upload   -> 10 per 60s
│   ├── GET  /search         -> 30 per 60s
│   └── POST /classified     -> 5 per 60s
└── Rejects with 429 Too Many Requests + Retry-After header
```

---

## TypeORM Repository Pattern

The platform uses the TypeORM repository pattern with custom repositories for complex queries.

### Base Entity

```
BaseEntity (abstract)
├── id: UUID (PrimaryGeneratedColumn)
├── createdAt: TIMESTAMP (CreateDateColumn)
├── updatedAt: TIMESTAMP (UpdateDateColumn)
└── deletedAt: TIMESTAMP (DeleteDateColumn, soft delete)
```

### Repository Pattern

```
Controller                   Service                     Repository
    |                            |                            |
    |  createArticle(dto)        |                            |
    +--------------------------->|                            |
    |                            |  repository.create(dto)    |
    |                            +--------------------------->|
    |                            |                            |
    |                            |  repository.save(entity)   |
    |                            +--------------------------->|
    |                            |                            |
    |                            |<---- saved entity ---------+
    |<---- ArticleResponseDto ---+                            |
    |                            |                            |
```

### Query Builder Pattern for Complex Queries

```
// Example: Article listing with filters, search, and pagination

ArticleService.findAll(query: QueryArticlesDto):
  1. Start QueryBuilder on Article entity
  2. Left join: author (User), categories, tags, featuredImage (Media)
  3. Apply filters:
     ├── category:  WHERE category.slug = :category
     ├── tag:       WHERE tag.name IN (:tags)
     ├── author:    WHERE author.id = :authorId
     ├── status:    WHERE article.status = :status
     ├── dateRange: WHERE article.publishedAt BETWEEN :start AND :end
     └── search:    WHERE article.title ILIKE :search (basic, Meilisearch for full)
  4. Apply sorting: ORDER BY :sortBy :sortOrder
  5. Apply pagination: SKIP :offset TAKE :limit
  6. Execute: getManyAndCount()
  7. Return: PaginatedResponseDto<ArticleResponseDto>
```

### Entity Relationships

```
User
 ├── 1:N  Articles        (author)
 ├── 1:N  Events          (submitter)
 ├── 1:N  Classifieds     (poster)
 ├── 1:N  DiningReviews   (reviewer)
 ├── 1:N  CompetitionEntries
 ├── 1:N  Orders          (buyer)
 ├── 1:1  Cart
 └── 1:N  Media           (uploader)

Article
 ├── N:1  User            (author)
 ├── N:M  ArticleCategory
 ├── N:M  ArticleTag
 └── N:M  Media           (images)

Event
 ├── N:1  User            (submitter)
 ├── N:M  EventCategory
 ├── 1:N  EventRecurrence
 └── N:M  Media           (images)

Dining
 ├── 1:N  DiningReview
 ├── N:M  DiningCuisine
 ├── 1:N  DiningHours
 └── N:M  Media           (photos)

Product
 ├── 1:N  ProductVariant
 ├── N:M  Media           (images)
 └── 1:N  OrderItem       (via variant)

Order
 ├── N:1  User            (buyer)
 └── 1:N  OrderItem
```

---

## Application Bootstrap

```
main.ts Bootstrap Sequence
│
├── 1. Create NestJS application
│      NestFactory.create(AppModule)
│
├── 2. Global prefix
│      app.setGlobalPrefix('api/v1')
│
├── 3. Global pipes
│      ValidationPipe (whitelist, forbidNonWhitelisted, transform)
│
├── 4. Global filters
│      AllExceptionsFilter
│      HttpExceptionFilter
│      ValidationExceptionFilter
│      TypeOrmExceptionFilter
│
├── 5. Global interceptors
│      LoggingInterceptor
│      TransformInterceptor
│      TimeoutInterceptor
│
├── 6. Security middleware
│      Helmet, CORS, Compression, CookieParser
│
├── 7. Swagger documentation
│      SwaggerModule.setup('api/docs', ...)
│
├── 8. Graceful shutdown hooks
│      app.enableShutdownHooks()
│
└── 9. Start listening
       app.listen(4000)
```
