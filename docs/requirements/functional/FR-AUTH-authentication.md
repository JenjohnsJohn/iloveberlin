# FR-AUTH: Authentication & Authorization

**Module:** Authentication & Authorization
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft
**Owner:** Platform Engineering

---

## 1. Overview

This document defines the functional requirements for the ILoveBerlin platform's authentication and authorization system. The system provides secure identity management across the Next.js frontend, NestJS backend API, and Flutter mobile application. It supports multiple authentication methods, role-based access control, and comprehensive session management.

---

## 2. User Stories References

| Story ID | Title |
|----------|-------|
| US-AUTH-001 | As a visitor, I want to register with my email so I can access personalized features |
| US-AUTH-002 | As a user, I want to log in with my email and password so I can access my account |
| US-AUTH-003 | As a user, I want to log in with Google or Apple so I can avoid creating a new password |
| US-AUTH-004 | As a user, I want to verify my email so my account is trusted |
| US-AUTH-005 | As a user, I want to reset my password if I forget it |
| US-AUTH-006 | As a user, I want my session to persist securely so I don't have to log in repeatedly |
| US-AUTH-007 | As an admin, I want to assign roles to users so I can control platform access |
| US-AUTH-008 | As a user, I want my account locked after failed attempts to prevent unauthorized access |
| US-AUTH-009 | As a user, I want to manage my active sessions and revoke any I don't recognize |
| US-AUTH-010 | As an admin, I want to force-logout any user for security purposes |

---

## 3. Functional Requirements

### 3.1 Email Registration

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-001 | The system SHALL accept email registration with the fields: email, password, display name | Must |
| FR-AUTH-002 | The system SHALL validate that the email address conforms to RFC 5322 format | Must |
| FR-AUTH-003 | The system SHALL enforce password complexity: minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character | Must |
| FR-AUTH-004 | The system SHALL reject registration if the email address is already associated with an existing account | Must |
| FR-AUTH-005 | The system SHALL hash passwords using bcrypt with a cost factor of 12 before storage | Must |
| FR-AUTH-006 | The system SHALL send an email verification link upon successful registration | Must |
| FR-AUTH-007 | The system SHALL create the user account in an `unverified` state until email verification is completed | Must |
| FR-AUTH-008 | The system SHALL normalize email addresses to lowercase before storage | Must |
| FR-AUTH-009 | The system SHALL enforce a display name length between 2 and 50 characters | Must |
| FR-AUTH-010 | The system SHALL reject disposable/temporary email domains from a maintained blocklist | Should |

### 3.2 Email Verification

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-011 | The system SHALL generate a cryptographically secure, single-use verification token upon registration | Must |
| FR-AUTH-012 | The verification token SHALL expire after 24 hours from generation | Must |
| FR-AUTH-013 | The system SHALL transition the user account state from `unverified` to `active` upon successful token validation | Must |
| FR-AUTH-014 | The system SHALL allow users to request a new verification email if the original token has expired | Must |
| FR-AUTH-015 | The system SHALL rate-limit verification email resend requests to a maximum of 3 per hour per email address | Must |
| FR-AUTH-016 | The system SHALL invalidate all previous verification tokens when a new one is generated | Must |

### 3.3 Login

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-017 | The system SHALL authenticate users via email and password combination | Must |
| FR-AUTH-018 | The system SHALL return a JWT access token and a refresh token upon successful authentication | Must |
| FR-AUTH-019 | The system SHALL reject login attempts for accounts in `unverified`, `suspended`, or `banned` states, returning the appropriate status reason | Must |
| FR-AUTH-020 | The system SHALL record the login timestamp, IP address, and user agent for every successful login | Must |
| FR-AUTH-021 | The system SHALL return a generic error message ("Invalid email or password") for failed login attempts to prevent user enumeration | Must |
| FR-AUTH-022 | The system SHALL support a "remember me" option that extends the refresh token lifetime from 7 days to 30 days | Should |

### 3.4 JWT Token Management

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-023 | The access token SHALL be a signed JWT (RS256) with a lifetime of 15 minutes | Must |
| FR-AUTH-024 | The access token payload SHALL include: user ID, email, role, token ID (jti), issued-at (iat), and expiry (exp) | Must |
| FR-AUTH-025 | The refresh token SHALL be an opaque, cryptographically random token with a default lifetime of 7 days | Must |
| FR-AUTH-026 | The system SHALL implement refresh token rotation: each use of a refresh token SHALL issue a new access token and a new refresh token, and invalidate the consumed refresh token | Must |
| FR-AUTH-027 | If a previously consumed (invalidated) refresh token is presented, the system SHALL revoke the entire token family (all refresh tokens for that session) as a security measure against token theft | Must |
| FR-AUTH-028 | The system SHALL store refresh tokens in the database with associated user ID, device fingerprint, and expiry | Must |
| FR-AUTH-029 | The system SHALL support token revocation by marking individual tokens or all tokens for a user as revoked | Must |
| FR-AUTH-030 | The system SHALL deliver refresh tokens as HttpOnly, Secure, SameSite=Strict cookies on the web frontend | Must |
| FR-AUTH-031 | The Flutter mobile app SHALL store refresh tokens in the platform-specific secure storage (Keychain on iOS, EncryptedSharedPreferences on Android) | Must |

### 3.5 Social Login (OAuth 2.0 / OIDC)

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-032 | The system SHALL support Google OAuth 2.0 / OpenID Connect login | Must |
| FR-AUTH-033 | The system SHALL support Apple Sign-In (Sign in with Apple) | Must |
| FR-AUTH-034 | Upon first social login, if no account exists for the provider's email, the system SHALL create a new account with the `active` state (email is considered pre-verified by the provider) | Must |
| FR-AUTH-035 | Upon first social login, if an account already exists for the provider's email, the system SHALL link the social provider to the existing account after the user confirms ownership | Must |
| FR-AUTH-036 | The system SHALL store the provider name and provider user ID for each linked social account | Must |
| FR-AUTH-037 | A user SHALL be able to link multiple social providers to one account | Should |
| FR-AUTH-038 | A user SHALL be able to unlink a social provider as long as they have a password set or at least one other linked provider | Should |
| FR-AUTH-039 | The system SHALL request only the minimal scopes required: email and basic profile information | Must |
| FR-AUTH-040 | The system SHALL validate the OAuth state parameter to prevent CSRF attacks | Must |
| FR-AUTH-041 | The system SHALL validate the id_token signature and claims (iss, aud, exp) for OIDC providers | Must |

### 3.6 Password Reset

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-042 | The system SHALL allow users to request a password reset by providing their email address | Must |
| FR-AUTH-043 | The system SHALL always return a success message for password reset requests, regardless of whether the email exists, to prevent user enumeration | Must |
| FR-AUTH-044 | The system SHALL generate a cryptographically secure, single-use password reset token | Must |
| FR-AUTH-045 | The password reset token SHALL expire after 1 hour from generation | Must |
| FR-AUTH-046 | The system SHALL send the password reset link to the provided email if an account exists | Must |
| FR-AUTH-047 | Upon successful password reset, the system SHALL invalidate the token, revoke all existing refresh tokens for the user, and terminate all active sessions | Must |
| FR-AUTH-048 | The system SHALL rate-limit password reset requests to a maximum of 3 per hour per email address | Must |
| FR-AUTH-049 | The new password SHALL not match any of the user's last 5 passwords | Should |

### 3.7 Role-Based Access Control (RBAC)

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-050 | The system SHALL enforce the following role hierarchy (highest to lowest privilege): `superadmin`, `admin`, `editor`, `author`, `user`, `guest` | Must |
| FR-AUTH-051 | The `superadmin` role SHALL have unrestricted access to all platform features and administrative functions | Must |
| FR-AUTH-052 | The `admin` role SHALL have access to all content management, user management (except superadmin accounts), and platform configuration | Must |
| FR-AUTH-053 | The `editor` role SHALL have access to create, edit, publish, and archive content across all sections (articles, events, dining, guides) | Must |
| FR-AUTH-054 | The `author` role SHALL have access to create and edit their own content and submit it for review, but SHALL NOT publish directly | Must |
| FR-AUTH-055 | The `user` role SHALL have access to view published content, manage their profile, write reviews, bookmark content, and submit user-generated content | Must |
| FR-AUTH-056 | The `guest` role SHALL have read-only access to published content without personalization features | Must |
| FR-AUTH-057 | The system SHALL assign the `user` role by default upon registration | Must |
| FR-AUTH-058 | Only `superadmin` users SHALL be able to promote users to the `admin` or `superadmin` roles | Must |
| FR-AUTH-059 | `admin` users SHALL be able to assign `editor` and `author` roles | Must |
| FR-AUTH-060 | The system SHALL evaluate permissions per API endpoint based on the user's role | Must |
| FR-AUTH-061 | The system SHALL return HTTP 403 Forbidden when an authenticated user lacks the required role for an endpoint | Must |
| FR-AUTH-062 | The system SHALL return HTTP 401 Unauthorized when a request lacks valid authentication credentials | Must |

### 3.8 Account Lockout

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-063 | The system SHALL lock an account after 5 consecutive failed login attempts | Must |
| FR-AUTH-064 | The lockout duration SHALL be progressive: 5 minutes after the first lockout, 15 minutes after the second, 60 minutes after the third, and indefinite (manual unlock required) after the fourth | Must |
| FR-AUTH-065 | The system SHALL reset the failed attempt counter upon a successful login | Must |
| FR-AUTH-066 | The system SHALL notify the user via email when their account is locked | Should |
| FR-AUTH-067 | An `admin` or `superadmin` SHALL be able to manually unlock any account | Must |
| FR-AUTH-068 | The system SHALL log all lockout events with timestamp, IP address, and user agent | Must |

### 3.9 Session Management

| Req ID | Requirement | Priority |
|--------|------------|----------|
| FR-AUTH-069 | The system SHALL track active sessions per user, including device type, OS, browser/app, IP address, and last activity timestamp | Must |
| FR-AUTH-070 | A user SHALL be able to view all their active sessions | Must |
| FR-AUTH-071 | A user SHALL be able to revoke (logout) any individual session | Must |
| FR-AUTH-072 | A user SHALL be able to revoke all sessions except the current one ("logout everywhere else") | Must |
| FR-AUTH-073 | The system SHALL limit concurrent active sessions to a maximum of 10 per user | Should |
| FR-AUTH-074 | The system SHALL automatically purge expired sessions from the database via a scheduled task running every 24 hours | Must |
| FR-AUTH-075 | The system SHALL update the session's last activity timestamp on every authenticated API request | Should |
| FR-AUTH-076 | An `admin` or `superadmin` SHALL be able to forcibly terminate all sessions for any user | Must |

---

## 4. Database Schema

### 4.1 Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Normalized email address |
| `password_hash` | `VARCHAR(255)` | NULLABLE | Bcrypt hash; NULL for social-only accounts |
| `display_name` | `VARCHAR(50)` | NOT NULL | User's chosen display name |
| `role` | `VARCHAR(20)` | NOT NULL, DEFAULT 'user' | One of: superadmin, admin, editor, author, user, guest |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'unverified' | One of: unverified, active, suspended, banned |
| `email_verified_at` | `TIMESTAMPTZ` | NULLABLE | Timestamp of email verification |
| `failed_login_attempts` | `INTEGER` | NOT NULL, DEFAULT 0 | Consecutive failed login count |
| `locked_until` | `TIMESTAMPTZ` | NULLABLE | Account lockout expiry; NULL if not locked |
| `lockout_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of times the account has been locked |
| `last_login_at` | `TIMESTAMPTZ` | NULLABLE | Most recent successful login |
| `last_login_ip` | `INET` | NULLABLE | IP address of most recent login |
| `password_changed_at` | `TIMESTAMPTZ` | NULLABLE | Last password change timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last account update timestamp |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft delete timestamp |

**Indexes:**
- `idx_users_email` UNIQUE ON (`email`) WHERE `deleted_at IS NULL`
- `idx_users_role` ON (`role`)
- `idx_users_status` ON (`status`)
- `idx_users_created_at` ON (`created_at`)

### 4.2 Table: `password_history`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Associated user |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Historical password hash |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When this password was set |

**Indexes:**
- `idx_password_history_user_id` ON (`user_id`)

### 4.3 Table: `social_accounts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Associated user |
| `provider` | `VARCHAR(20)` | NOT NULL | Provider name: google, apple |
| `provider_user_id` | `VARCHAR(255)` | NOT NULL | User ID from the provider |
| `provider_email` | `VARCHAR(255)` | NULLABLE | Email from the provider |
| `provider_data` | `JSONB` | NULLABLE | Additional profile data from provider |
| `linked_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When this provider was linked |

**Indexes:**
- `idx_social_accounts_user_id` ON (`user_id`)
- `idx_social_accounts_provider_uid` UNIQUE ON (`provider`, `provider_user_id`)

### 4.4 Table: `refresh_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Token identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Associated user |
| `token_hash` | `VARCHAR(255)` | UNIQUE, NOT NULL | SHA-256 hash of the refresh token |
| `family_id` | `UUID` | NOT NULL | Groups tokens in the same rotation chain |
| `device_fingerprint` | `VARCHAR(255)` | NULLABLE | Device identifier |
| `ip_address` | `INET` | NULLABLE | IP address at token issuance |
| `user_agent` | `TEXT` | NULLABLE | User agent string |
| `is_revoked` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the token has been revoked |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Token expiry timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Token creation timestamp |

**Indexes:**
- `idx_refresh_tokens_token_hash` UNIQUE ON (`token_hash`)
- `idx_refresh_tokens_user_id` ON (`user_id`)
- `idx_refresh_tokens_family_id` ON (`family_id`)
- `idx_refresh_tokens_expires_at` ON (`expires_at`) WHERE `is_revoked = FALSE`

### 4.5 Table: `sessions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Session identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Associated user |
| `refresh_token_id` | `UUID` | FK -> refresh_tokens.id, NULLABLE | Active refresh token for this session |
| `device_type` | `VARCHAR(20)` | NULLABLE | desktop, mobile, tablet |
| `os` | `VARCHAR(50)` | NULLABLE | Operating system |
| `browser` | `VARCHAR(50)` | NULLABLE | Browser or app name |
| `ip_address` | `INET` | NULLABLE | Most recent IP address |
| `last_activity_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last API activity timestamp |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Whether the session is active |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Session creation timestamp |

**Indexes:**
- `idx_sessions_user_id` ON (`user_id`) WHERE `is_active = TRUE`
- `idx_sessions_last_activity` ON (`last_activity_at`)

### 4.6 Table: `email_verification_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Associated user |
| `token_hash` | `VARCHAR(255)` | UNIQUE, NOT NULL | SHA-256 hash of the verification token |
| `is_used` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the token has been consumed |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Token expiry (24 hours from creation) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Token creation timestamp |

**Indexes:**
- `idx_email_verification_tokens_hash` UNIQUE ON (`token_hash`)
- `idx_email_verification_tokens_user_id` ON (`user_id`)

### 4.7 Table: `password_reset_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `user_id` | `UUID` | FK -> users.id, NOT NULL | Associated user |
| `token_hash` | `VARCHAR(255)` | UNIQUE, NOT NULL | SHA-256 hash of the reset token |
| `is_used` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Whether the token has been consumed |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Token expiry (1 hour from creation) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Token creation timestamp |

**Indexes:**
- `idx_password_reset_tokens_hash` UNIQUE ON (`token_hash`)
- `idx_password_reset_tokens_user_id` ON (`user_id`)

### 4.8 Table: `auth_audit_log`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Record identifier |
| `user_id` | `UUID` | FK -> users.id, NULLABLE | Associated user (NULL for failed lookups) |
| `action` | `VARCHAR(50)` | NOT NULL | Event type (see enumeration below) |
| `ip_address` | `INET` | NULLABLE | Request IP address |
| `user_agent` | `TEXT` | NULLABLE | Request user agent |
| `metadata` | `JSONB` | NULLABLE | Additional context (e.g., provider name, failure reason) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Event timestamp |

**Action values:** `register`, `login_success`, `login_failure`, `logout`, `token_refresh`, `token_revoke`, `password_reset_request`, `password_reset_complete`, `email_verify`, `social_login`, `social_link`, `social_unlink`, `account_lock`, `account_unlock`, `role_change`, `session_revoke`, `force_logout`

**Indexes:**
- `idx_auth_audit_log_user_id` ON (`user_id`)
- `idx_auth_audit_log_action` ON (`action`)
- `idx_auth_audit_log_created_at` ON (`created_at`)

---

## 5. API Endpoints

### 5.1 Registration & Verification

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/auth/register` | Public | Register a new user account | FR-AUTH-001 to 010 |
| `POST` | `/api/v1/auth/verify-email` | Public | Verify email address with token | FR-AUTH-011 to 016 |
| `POST` | `/api/v1/auth/resend-verification` | Public | Resend verification email | FR-AUTH-014, 015, 016 |

**`POST /api/v1/auth/register`**

Request Body:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, complexity enforced)",
  "display_name": "string (required, 2-50 chars)"
}
```

Response `201 Created`:
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "string",
    "display_name": "string",
    "role": "user",
    "status": "unverified"
  }
}
```

Error Responses:
- `400 Bad Request` - Validation errors (invalid email, weak password, etc.)
- `409 Conflict` - Email already registered
- `429 Too Many Requests` - Rate limit exceeded

**`POST /api/v1/auth/verify-email`**

Request Body:
```json
{
  "token": "string (required)"
}
```

Response `200 OK`:
```json
{
  "message": "Email verified successfully."
}
```

Error Responses:
- `400 Bad Request` - Invalid or expired token
- `410 Gone` - Token already used

**`POST /api/v1/auth/resend-verification`**

Request Body:
```json
{
  "email": "string (required)"
}
```

Response `200 OK`:
```json
{
  "message": "If an unverified account exists for this email, a new verification link has been sent."
}
```

Error Responses:
- `429 Too Many Requests` - Rate limit exceeded (max 3/hour)

### 5.2 Login & Token Management

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/auth/login` | Public | Authenticate with email and password | FR-AUTH-017 to 022 |
| `POST` | `/api/v1/auth/refresh` | Cookie/Token | Refresh access token using refresh token | FR-AUTH-023 to 031 |
| `POST` | `/api/v1/auth/logout` | Authenticated | Logout and revoke current session tokens | FR-AUTH-029 |

**`POST /api/v1/auth/login`**

Request Body:
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "remember_me": "boolean (optional, default false)"
}
```

Response `200 OK`:
```json
{
  "access_token": "string (JWT)",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "string",
    "display_name": "string",
    "role": "string",
    "status": "active"
  }
}
```
*Note: Refresh token is set as an HttpOnly cookie (web) or returned in a `refresh_token` field (mobile).*

Headers (Response):
- `Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`

Error Responses:
- `401 Unauthorized` - Invalid credentials ("Invalid email or password")
- `403 Forbidden` - Account unverified, suspended, or banned (with reason)
- `423 Locked` - Account locked (with lockout duration)
- `429 Too Many Requests` - Rate limit exceeded

**`POST /api/v1/auth/refresh`**

Request: Refresh token sent via HttpOnly cookie (web) or Authorization header (mobile).

Response `200 OK`:
```json
{
  "access_token": "string (JWT)",
  "token_type": "Bearer",
  "expires_in": 900
}
```
*Note: New refresh token is set via rotated cookie/response.*

Error Responses:
- `401 Unauthorized` - Invalid, expired, or revoked refresh token
- `401 Unauthorized` - Token reuse detected (entire family revoked)

**`POST /api/v1/auth/logout`**

Request: Access token in Authorization header; refresh token in cookie or body.

Response `204 No Content`

### 5.3 Social Login

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/auth/social/:provider` | Public | Initiate OAuth flow (redirect to provider) | FR-AUTH-032 to 041 |
| `GET` | `/api/v1/auth/social/:provider/callback` | Public | OAuth callback handler | FR-AUTH-032 to 041 |
| `POST` | `/api/v1/auth/social/link` | Authenticated | Link a social provider to existing account | FR-AUTH-037 |
| `DELETE` | `/api/v1/auth/social/:provider` | Authenticated | Unlink a social provider | FR-AUTH-038 |

**`GET /api/v1/auth/social/:provider`**

Path Parameters:
- `provider` - `google` or `apple`

Query Parameters:
- `redirect_uri` - Where to redirect after authentication (optional, defaults to frontend origin)

Response: `302 Redirect` to provider's authorization URL with state parameter.

**`GET /api/v1/auth/social/:provider/callback`**

Query Parameters (set by provider):
- `code` - Authorization code
- `state` - CSRF protection state

Response: `302 Redirect` to frontend with short-lived authorization code, or error page.

### 5.4 Password Reset

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/auth/forgot-password` | Public | Request password reset email | FR-AUTH-042 to 044, 046, 048 |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset password with token | FR-AUTH-045, 047, 049 |

**`POST /api/v1/auth/forgot-password`**

Request Body:
```json
{
  "email": "string (required)"
}
```

Response `200 OK`:
```json
{
  "message": "If an account exists for this email, a password reset link has been sent."
}
```

Error Responses:
- `429 Too Many Requests` - Rate limit exceeded (max 3/hour)

**`POST /api/v1/auth/reset-password`**

Request Body:
```json
{
  "token": "string (required)",
  "password": "string (required, complexity enforced)"
}
```

Response `200 OK`:
```json
{
  "message": "Password reset successfully. Please log in with your new password."
}
```

Error Responses:
- `400 Bad Request` - Invalid or expired token, password matches recent history
- `410 Gone` - Token already used

### 5.5 Session Management

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `GET` | `/api/v1/auth/sessions` | Authenticated | List all active sessions for current user | FR-AUTH-069, 070 |
| `DELETE` | `/api/v1/auth/sessions/:sessionId` | Authenticated | Revoke a specific session | FR-AUTH-071 |
| `DELETE` | `/api/v1/auth/sessions` | Authenticated | Revoke all sessions except current | FR-AUTH-072 |

**`GET /api/v1/auth/sessions`**

Response `200 OK`:
```json
{
  "sessions": [
    {
      "id": "uuid",
      "device_type": "desktop",
      "os": "macOS 15",
      "browser": "Safari 19",
      "ip_address": "192.168.1.1",
      "last_activity_at": "2026-03-11T14:30:00Z",
      "is_current": true,
      "created_at": "2026-03-10T08:00:00Z"
    }
  ]
}
```

**`DELETE /api/v1/auth/sessions/:sessionId`**

Response `204 No Content`

Error Responses:
- `404 Not Found` - Session not found or does not belong to user
- `400 Bad Request` - Cannot revoke current session (use logout instead)

**`DELETE /api/v1/auth/sessions`**

Query Parameters:
- `keep_current` - `true` (default) to keep current session, `false` to revoke all

Response `204 No Content`

### 5.6 Admin Endpoints

| Method | Path | Auth | Description | Req IDs |
|--------|------|------|-------------|---------|
| `PATCH` | `/api/v1/admin/users/:userId/role` | Admin/Superadmin | Change a user's role | FR-AUTH-058, 059 |
| `POST` | `/api/v1/admin/users/:userId/unlock` | Admin/Superadmin | Manually unlock a locked account | FR-AUTH-067 |
| `POST` | `/api/v1/admin/users/:userId/force-logout` | Admin/Superadmin | Terminate all sessions for a user | FR-AUTH-076 |
| `PATCH` | `/api/v1/admin/users/:userId/status` | Admin/Superadmin | Change user status (suspend, ban, activate) | FR-AUTH-019 |

**`PATCH /api/v1/admin/users/:userId/role`**

Request Body:
```json
{
  "role": "string (one of: superadmin, admin, editor, author, user)"
}
```

Response `200 OK`:
```json
{
  "user_id": "uuid",
  "previous_role": "user",
  "new_role": "editor",
  "changed_by": "uuid"
}
```

Error Responses:
- `403 Forbidden` - Insufficient privileges (e.g., admin trying to set superadmin)
- `404 Not Found` - User not found
- `422 Unprocessable Entity` - Invalid role value

---

## 6. Rate Limiting

| Endpoint Pattern | Limit | Window | Key |
|-----------------|-------|--------|-----|
| `POST /auth/register` | 5 requests | 1 hour | IP address |
| `POST /auth/login` | 10 requests | 15 minutes | IP address |
| `POST /auth/forgot-password` | 3 requests | 1 hour | Email address |
| `POST /auth/resend-verification` | 3 requests | 1 hour | Email address |
| `POST /auth/refresh` | 30 requests | 15 minutes | User ID |
| `POST /auth/reset-password` | 5 requests | 1 hour | IP address |

---

## 7. Non-Functional Considerations

| Concern | Approach |
|---------|----------|
| Password hashing | bcrypt, cost factor 12 |
| Token signing | RS256 with rotatable key pairs stored in environment |
| Token storage (DB) | SHA-256 hash of raw token; raw token never stored |
| HTTPS | All auth endpoints require TLS; enforced by Cloudflare |
| CORS | Strict origin allowlist for web frontend |
| CSRF | SameSite=Strict cookies + CSRF token header for state-changing requests |
| Logging | All auth events logged to `auth_audit_log`; no plaintext credentials logged |
| Cleanup | Scheduled job purges expired tokens and sessions every 24 hours |
