# ILoveBerlin API Documentation

**Base URL:** `https://iloveberlin.biz/api/v1`

**Version:** 1.0

**Last Updated:** 2026-03-12

---

## Table of Contents

| Document | Description |
|----------|-------------|
| [API Conventions](./api-conventions.md) | RESTful design principles, response formats, pagination, error handling, rate limiting |
| [Auth API](./auth-api.md) | Registration, login, token refresh, OAuth, password reset |
| [Users API](./users-api.md) | User profile management, bookmarks, activity, admin user management |
| [Articles API](./articles-api.md) | Blog articles, editorial content, bookmarking, revision history |
| [Guides API](./guides-api.md) | City guides, topics, relocation and living-in-Berlin content |
| [Events API](./events-api.md) | Events, venues, date-based filtering, map integration |
| [Dining API](./dining-api.md) | Restaurants, cuisine types, dining offers, price filtering |
| [Videos API](./videos-api.md) | Video content, video series, filtering by series/category/tag |
| [Competitions API](./competitions-api.md) | Giveaways, entries, winner selection, archived competitions |
| [Classifieds API](./classifieds-api.md) | Community marketplace, listings, messaging, reporting, moderation |
| [Store API](./store-api.md) | Products, shopping cart, Stripe checkout, orders, discount codes |
| [Search API](./search-api.md) | Full-text search (Meilisearch), autocomplete, faceted results |
| [Media API](./media-api.md) | Presigned uploads to Cloudflare R2, media library, image/video processing |
| [Admin API](./admin-api.md) | Dashboard analytics, user management, moderation, settings, advertising, SEO |
| [Homepage API](./homepage-api.md) | Aggregated homepage data, section curation, featured items |

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend Framework | NestJS (Node.js) |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| Search Engine | Meilisearch |
| Payment Processing | Stripe |
| Object Storage | Cloudflare R2 |
| API Style | RESTful |
| Data Format | JSON |

---

## Authentication Overview

ILoveBerlin uses JWT-based authentication with short-lived access tokens and long-lived refresh tokens.

### Token Types

| Token | Location | Lifetime | Purpose |
|-------|----------|----------|---------|
| Access Token | `Authorization: Bearer <token>` header | 15 minutes | Authenticate API requests |
| Refresh Token | HTTP-only cookie or request body | 7 days | Obtain new access tokens |

### Authorization Levels

Roles are hierarchical. Higher roles inherit all permissions of lower roles.

| Level | Description | Examples |
|-------|-------------|----------|
| **public** | No authentication required | Browse articles, view events |
| **user** | Registered and authenticated user | Bookmark content, manage profile |
| **editor** | Content creator / editorial staff | Create and edit articles, events, guides |
| **admin** | Platform administrator | Moderate content, manage users, manage venues |
| **superadmin** | Full system access | System configuration, role assignments, data export |

### Authentication Header

All authenticated requests must include the access token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Unauthenticated Requests

Requests to protected endpoints without a valid token receive:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

Requests with a valid token but insufficient role receive:

```json
{
  "statusCode": 403,
  "message": "Forbidden: insufficient permissions",
  "error": "Forbidden"
}
```

---

## Quick Start

### 1. Register a new account

```bash
curl -X POST https://iloveberlin.biz/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss1",
    "firstName": "Anna",
    "lastName": "Schmidt"
  }'
```

### 2. Log in

```bash
curl -X POST https://iloveberlin.biz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss1"
  }'
```

### 3. Use the access token

```bash
curl -X GET https://iloveberlin.biz/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no content (deletes) |
| `400` | Bad request / validation error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `422` | Unprocessable entity |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Rate Limiting

All endpoints enforce rate limits. Limits vary by endpoint sensitivity. Rate limit status is returned in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1710288000
```

See [API Conventions](./api-conventions.md) for detailed rate limiting rules.

---

## Support

For API questions or issues, contact: **api-support@iloveberlin.biz**
