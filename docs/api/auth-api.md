# Auth API

**Base Path:** `/api/v1/auth`

All authentication endpoints handle user registration, login, token management, and social OAuth flows.

---

## Table of Contents

- [Endpoints Overview](#endpoints-overview)
- [POST /auth/register](#post-authregister)
- [POST /auth/login](#post-authlogin)
- [POST /auth/refresh](#post-authrefresh)
- [POST /auth/logout](#post-authlogout)
- [POST /auth/verify-email](#post-authverify-email)
- [POST /auth/forgot-password](#post-authforgot-password)
- [POST /auth/reset-password](#post-authreset-password)
- [POST /auth/google](#post-authgoogle)
- [POST /auth/apple](#post-authapple)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Log in with email and password |
| `POST` | `/auth/refresh` | Public | Refresh an expired access token |
| `POST` | `/auth/logout` | User | Invalidate refresh token |
| `POST` | `/auth/verify-email` | Public | Verify email address with token |
| `POST` | `/auth/forgot-password` | Public | Request a password reset email |
| `POST` | `/auth/reset-password` | Public | Reset password using token |
| `POST` | `/auth/google` | Public | Authenticate via Google OAuth |
| `POST` | `/auth/apple` | Public | Authenticate via Apple Sign-In |

---

## POST /auth/register

Register a new user account. A verification email is sent upon successful registration.

**Authentication:** Public

### Request

```json
{
  "email": "anna.schmidt@example.com",
  "password": "SecureP@ss123",
  "firstName": "Anna",
  "lastName": "Schmidt",
  "acceptTerms": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format, max 255 chars |
| `password` | string | Yes | Min 8 chars, must include uppercase, lowercase, number, and special character |
| `firstName` | string | Yes | Min 1, max 50 chars |
| `lastName` | string | Yes | Min 1, max 50 chars |
| `acceptTerms` | boolean | Yes | Must be `true` |

### Response `201 Created`

```json
{
  "data": {
    "id": 1042,
    "email": "anna.schmidt@example.com",
    "firstName": "Anna",
    "lastName": "Schmidt",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2026-03-12T09:15:00.000Z"
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing or invalid fields |
| `400` | `"acceptTerms must be true"` | Terms not accepted |
| `409` | `"A user with this email already exists"` | Duplicate email |

**Error Example:**

```json
{
  "statusCode": 409,
  "message": "A user with this email already exists",
  "error": "Conflict"
}
```

---

## POST /auth/login

Authenticate a user and return JWT tokens.

**Authentication:** Public

### Request

```json
{
  "email": "anna.schmidt@example.com",
  "password": "SecureP@ss123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Non-empty string |

### Response `200 OK`

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEwNDIsImVtYWlsIjoiYW5uYS5zY2htaWR0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTAyMzQ1MDAsImV4cCI6MTcxMDIzNTQwMH0.abc123signature",
    "refreshToken": "d4f8a2b1-9c3e-4a7f-b5d6-1e2f3a4b5c6d",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": 1042,
      "email": "anna.schmidt@example.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "role": "user",
      "emailVerified": true,
      "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg",
      "createdAt": "2026-03-12T09:15:00.000Z",
      "lastLoginAt": "2026-03-12T14:30:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Missing fields |
| `401` | `"Invalid email or password"` | Wrong credentials |
| `403` | `"Account is banned"` | User account is banned |
| `403` | `"Please verify your email before logging in"` | Unverified email |

**Error Example:**

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

---

## POST /auth/refresh

Obtain a new access token using a valid refresh token. The refresh token is rotated (old one invalidated, new one issued).

**Authentication:** Public (requires valid refresh token)

### Request

```json
{
  "refreshToken": "d4f8a2b1-9c3e-4a7f-b5d6-1e2f3a4b5c6d"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `refreshToken` | string | Yes | Valid UUID v4 |

### Response `200 OK`

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEwNDIsImVtYWlsIjoiYW5uYS5zY2htaWR0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTAyMzU0MDAsImV4cCI6MTcxMDIzNjMwMH0.def456signature",
    "refreshToken": "e5g9b3c2-0d4f-5b8g-c6e7-2f3g4a5b6c7d",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"refreshToken is required"` | Missing refresh token |
| `401` | `"Invalid or expired refresh token"` | Token not found, expired, or already used |

**Error Example:**

```json
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized"
}
```

---

## POST /auth/logout

Invalidate the current refresh token. The access token remains valid until it expires naturally (max 15 minutes).

**Authentication:** User

### Request

```json
{
  "refreshToken": "d4f8a2b1-9c3e-4a7f-b5d6-1e2f3a4b5c6d"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `refreshToken` | string | Yes | Valid UUID v4 |

### Response `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized"` | Missing or invalid access token |

---

## POST /auth/verify-email

Verify a user's email address using the token sent during registration.

**Authentication:** Public

### Request

```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | Yes | Non-empty, 32-char hex token |

### Response `200 OK`

```json
{
  "message": "Email verified successfully. You can now log in."
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Invalid or expired verification token"` | Token not found, expired, or already used |
| `400` | `"Email is already verified"` | User already verified |

**Error Example:**

```json
{
  "statusCode": 400,
  "message": "Invalid or expired verification token",
  "error": "Bad Request"
}
```

---

## POST /auth/forgot-password

Request a password reset email. For security, this endpoint always returns a success response, even if the email is not registered.

**Authentication:** Public

### Request

```json
{
  "email": "anna.schmidt@example.com"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format |

### Response `200 OK`

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Validation failed"` | Invalid email format |

---

## POST /auth/reset-password

Reset the user's password using the token received via email.

**Authentication:** Public

### Request

```json
{
  "token": "x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4",
  "password": "NewSecureP@ss456",
  "passwordConfirmation": "NewSecureP@ss456"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | Yes | 32-char hex reset token |
| `password` | string | Yes | Min 8 chars, must include uppercase, lowercase, number, and special character |
| `passwordConfirmation` | string | Yes | Must match `password` |

### Response `200 OK`

```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Invalid or expired reset token"` | Token not found or expired |
| `400` | `"Passwords do not match"` | `password` and `passwordConfirmation` differ |
| `400` | `"Validation failed"` | Password does not meet complexity requirements |
| `422` | `"New password must be different from your previous password"` | Same password reused |

**Error Example:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "password",
      "message": "password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  ]
}
```

---

## POST /auth/google

Authenticate or register a user using a Google OAuth2 ID token. If no account exists for the Google email, one is created automatically.

**Authentication:** Public

### Request

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTIzNDU2Nzg5MC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjEyMzQ1Njc4OTAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIyMzM0NDU1NjY3Nzg4OTkiLCJlbWFpbCI6ImFubmEuc2NobWlkdEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFubmEgU2NobWlkdCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9kZWZhdWx0LXVzZXIiLCJpYXQiOjE3MTAyMzQ1MDAsImV4cCI6MTcxMDIzODEwMH0.google-signature"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `idToken` | string | Yes | Valid Google ID token |

### Response `200 OK` (existing user)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "f6h0c4d3-1e5g-6c9h-d7f8-3g4h5a6b7c8d",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "isNewUser": false,
    "user": {
      "id": 1042,
      "email": "anna.schmidt@gmail.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "role": "user",
      "emailVerified": true,
      "avatarUrl": "https://cdn.iloveberlin.biz/avatars/1042/photo.jpg",
      "authProvider": "google",
      "createdAt": "2026-02-01T12:00:00.000Z",
      "lastLoginAt": "2026-03-12T14:30:00.000Z"
    }
  }
}
```

### Response `201 Created` (new user)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "g7i1d5e4-2f6h-7d0i-e8g9-4h5i6b7c8d9e",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "isNewUser": true,
    "user": {
      "id": 1098,
      "email": "anna.schmidt@gmail.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "role": "user",
      "emailVerified": true,
      "avatarUrl": "https://lh3.googleusercontent.com/a/default-user",
      "authProvider": "google",
      "createdAt": "2026-03-12T14:30:00.000Z",
      "lastLoginAt": "2026-03-12T14:30:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Invalid Google ID token"` | Token verification failed |
| `403` | `"Account is banned"` | Associated account is banned |
| `409` | `"An account with this email already exists using a different sign-in method"` | Email tied to password-based account |

---

## POST /auth/apple

Authenticate or register a user using Apple Sign-In. If no account exists for the Apple ID, one is created automatically.

**Authentication:** Public

### Request

```json
{
  "identityToken": "eyJraWQiOiJXNldjT0tCIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiYml6Lmlsb3ZlYmVybGluLndlYiIsImV4cCI6MTcxMDIzODEwMCwiaWF0IjoxNzEwMjM0NTAwLCJzdWIiOiIwMDEyMzQuYWJjZGVmMTIzNDU2Nzg5MC4xMjM0IiwiZW1haWwiOiJhbm5hQHByaXZhdGVyZWxheS5hcHBsZWlkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSJ9.apple-signature",
  "authorizationCode": "c1a2b3d4e5f6a7b8c9d0",
  "firstName": "Anna",
  "lastName": "Schmidt"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `identityToken` | string | Yes | Valid Apple identity token |
| `authorizationCode` | string | Yes | Apple authorization code |
| `firstName` | string | No | Required only on first sign-in (Apple sends it once) |
| `lastName` | string | No | Required only on first sign-in |

### Response `200 OK` (existing user)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "h8j2e6f5-3g7i-8e1j-f9h0-5i6j7c8d9e0f",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "isNewUser": false,
    "user": {
      "id": 1042,
      "email": "anna@privaterelay.appleid.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "role": "user",
      "emailVerified": true,
      "avatarUrl": null,
      "authProvider": "apple",
      "createdAt": "2026-02-15T08:00:00.000Z",
      "lastLoginAt": "2026-03-12T14:30:00.000Z"
    }
  }
}
```

### Response `201 Created` (new user)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "i9k3f7g6-4h8j-9f2k-g0i1-6j7k8d9e0f1g",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "isNewUser": true,
    "user": {
      "id": 1099,
      "email": "anna@privaterelay.appleid.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "role": "user",
      "emailVerified": true,
      "avatarUrl": null,
      "authProvider": "apple",
      "createdAt": "2026-03-12T14:30:00.000Z",
      "lastLoginAt": "2026-03-12T14:30:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"Invalid Apple identity token"` | Token verification failed |
| `400` | `"Authorization code is required"` | Missing authorization code |
| `403` | `"Account is banned"` | Associated account is banned |
| `409` | `"An account with this email already exists using a different sign-in method"` | Email tied to a different auth method |

---

## Error Codes

Summary of all error responses across Auth API endpoints:

| Status Code | Error | Endpoint(s) | Message |
|-------------|-------|-------------|---------|
| `400` | Bad Request | All | Validation failures, invalid tokens |
| `401` | Unauthorized | `/login`, `/refresh`, `/logout` | Invalid credentials or tokens |
| `403` | Forbidden | `/login`, `/google`, `/apple` | Banned account, unverified email |
| `409` | Conflict | `/register`, `/google`, `/apple` | Duplicate email or auth provider conflict |
| `422` | Unprocessable Entity | `/reset-password` | Password reuse |
| `429` | Too Many Requests | All | Rate limit exceeded |

---

## Rate Limiting

Auth endpoints have stricter rate limits to prevent brute-force attacks.

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `POST /auth/register` | 5 requests | 15 minutes | Per IP address |
| `POST /auth/login` | 10 requests | 15 minutes | Per IP address; after 5 failures, CAPTCHA required |
| `POST /auth/refresh` | 30 requests | 1 minute | Per user |
| `POST /auth/logout` | 30 requests | 1 minute | Per user |
| `POST /auth/verify-email` | 5 requests | 15 minutes | Per IP address |
| `POST /auth/forgot-password` | 3 requests | 15 minutes | Per IP address |
| `POST /auth/reset-password` | 5 requests | 15 minutes | Per IP address |
| `POST /auth/google` | 10 requests | 15 minutes | Per IP address |
| `POST /auth/apple` | 10 requests | 15 minutes | Per IP address |

After exceeding the login rate limit, the account enters a cooldown period. Subsequent login attempts (even with correct credentials) are rejected for the remainder of the window.
