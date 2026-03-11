# Sprint 2: Authentication & User Management

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Sprint Number**  | 2                                              |
| **Sprint Name**    | Authentication & User Management               |
| **Duration**       | 2 weeks (10 working days)                      |
| **Dates**          | Week 3 -- Week 4 (Days 11--20 from project start) |
| **Team**           | 1 Backend, 1 Frontend, 1 DevOps / Infra        |

---

## Sprint Goal

> Implement a complete, secure authentication system with local registration, JWT-based sessions, social login (Google, Apple), role-based access control, and user profile management so that all future features can rely on a proven identity layer.

---

## User Stories

### US-2.1 -- User Registration
**As a** visitor,
**I want** to register with my email and password,
**so that** I can create a personal account on the platform.

**Acceptance Criteria:**
- [ ] Registration form collects email, password, display name
- [ ] Password hashed with bcrypt (cost factor 12)
- [ ] Duplicate email returns 409 Conflict
- [ ] Verification email sent with a time-limited token (24 h expiry)
- [ ] Account inactive until email verified
- [ ] Password must be >= 8 chars, 1 uppercase, 1 number, 1 special

### US-2.2 -- User Login & JWT Sessions
**As a** registered user,
**I want** to log in and stay authenticated,
**so that** I can access personalized features.

**Acceptance Criteria:**
- [ ] Login accepts email + password, returns access token (15 min) + refresh token (7 days)
- [ ] Access token is a signed JWT with user ID, email, roles
- [ ] Refresh token stored in `refresh_tokens` table with device fingerprint
- [ ] `POST /api/auth/refresh` issues new token pair and invalidates old refresh token (rotation)
- [ ] `POST /api/auth/logout` invalidates the refresh token
- [ ] Failed login (5 attempts in 15 min) triggers temporary lockout

### US-2.3 -- Email Verification & Password Reset
**As a** user,
**I want** to verify my email and reset a forgotten password,
**so that** my account is secure and recoverable.

**Acceptance Criteria:**
- [ ] `GET /api/auth/verify-email?token=xxx` activates the account
- [ ] Expired token returns 410 Gone with option to resend
- [ ] `POST /api/auth/forgot-password` sends reset email (rate-limited: 3/hour)
- [ ] `POST /api/auth/reset-password` accepts token + new password
- [ ] Reset token expires after 1 hour
- [ ] After password reset, all existing refresh tokens for the user are invalidated

### US-2.4 -- Social Login (Google & Apple)
**As a** visitor,
**I want** to sign in with my Google or Apple account,
**so that** I can register without creating a new password.

**Acceptance Criteria:**
- [ ] "Sign in with Google" button triggers OAuth 2.0 flow
- [ ] "Sign in with Apple" button triggers Apple Sign-In flow
- [ ] First social login creates a new user account (auto-verified)
- [ ] Subsequent social login links to existing account if email matches
- [ ] Social user can later set a password for local login
- [ ] Social provider ID stored for future logins

### US-2.5 -- Role-Based Access Control
**As an** admin,
**I want** to restrict endpoints based on user roles,
**so that** only authorized users can access admin features.

**Acceptance Criteria:**
- [ ] Roles: `user`, `editor`, `admin`, `super_admin`
- [ ] `@Roles()` decorator on controller methods
- [ ] `RolesGuard` checks JWT role claim against required roles
- [ ] Unauthorized access returns 403 Forbidden with descriptive message
- [ ] Super admin can assign/revoke roles via API
- [ ] Role changes take effect on next token refresh

### US-2.6 -- User Profile Management
**As a** logged-in user,
**I want** to view and edit my profile,
**so that** I can personalize my account.

**Acceptance Criteria:**
- [ ] Profile page shows display name, email, avatar, bio, joined date
- [ ] User can update display name, bio, location, website
- [ ] User can upload avatar (max 5 MB, JPEG/PNG/WebP)
- [ ] Avatar resized to 200x200 and stored in Cloudflare R2
- [ ] User can change password (requires current password)
- [ ] User can delete account (soft delete with 30-day grace period)

### US-2.7 -- Frontend Auth Pages
**As a** user,
**I want** polished login, registration, and profile pages,
**so that** the auth experience feels professional.

**Acceptance Criteria:**
- [ ] Login page with email/password form and social login buttons
- [ ] Registration page with validation feedback
- [ ] Forgot password page
- [ ] Reset password page (from email link)
- [ ] Profile page (view and edit modes)
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Auth state persisted across page refreshes (httpOnly cookie or secure storage)
- [ ] Loading states and error handling on all auth forms

---

## Day-by-Day Task Breakdown

### Week 1 (Days 11--15)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **11** | B-2.1 Create `users`, `refresh_tokens`, `user_profiles` migrations | F-2.1 Auth state management (Zustand or Context) | D-2.1 Configure SMTP service (Resend or SES) for emails |
| **12** | B-2.2 User entity, UserModule scaffold, register endpoint | F-2.2 Registration page with form validation | D-2.2 Set up email templates (verification, reset) |
| **13** | B-2.3 Login endpoint, JWT strategy, access token generation | F-2.3 Login page with email/password form | -- |
| **14** | B-2.4 Refresh token rotation, logout endpoint | F-2.4 Token refresh interceptor in API client | -- |
| **15** | B-2.5 Email verification endpoint + send verification email | F-2.5 Email verification landing page | D-2.3 Rate limiting middleware (throttler) |

### Week 2 (Days 16--20)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **16** | B-2.6 Password reset (forgot + reset endpoints) | F-2.6 Forgot password + reset password pages | -- |
| **17** | B-2.7 Google OAuth strategy (passport-google-oauth20) | F-2.7 Social login buttons + OAuth callback handling | D-2.4 Google OAuth app registration, credentials |
| **18** | B-2.8 Apple Sign-In strategy | F-2.8 Profile page (view + edit + avatar upload) | D-2.5 Apple Developer Sign-In service config |
| **19** | B-2.9 RBAC guards, @Roles decorator, role assignment | F-2.9 Protected route HOC / middleware, redirect logic | -- |
| **20** | B-2.10 Profile CRUD, avatar upload to R2 | QA-2.1 -- QA-2.6 Full auth flow testing | D-2.6 Deploy auth to staging, smoke test |

---

## Backend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| B-2.1 | Database migrations | - `users` table: id (UUID), email (unique), password_hash, display_name, role, is_verified, is_active, created_at, updated_at, deleted_at | 4 h |
|        |  | - `refresh_tokens` table: id, user_id (FK), token_hash, device_info, ip_address, expires_at, revoked_at, created_at | |
|        |  | - `user_profiles` table: id, user_id (FK, unique), bio, location, website, avatar_url, date_of_birth, created_at, updated_at | |
| B-2.2 | Registration endpoint | - User entity with class-validator decorators | 4 h |
|        |  | - `POST /api/auth/register` -- validate, hash password (bcrypt, 12 rounds), create user | |
|        |  | - Unique constraint violation handling | |
|        |  | - Return sanitized user object (no password_hash) | |
| B-2.3 | Login + JWT | - `POST /api/auth/login` -- validate credentials | 4 h |
|        |  | - JWT signing with RS256 (asymmetric keys) | |
|        |  | - Access token payload: sub, email, roles, iat, exp | |
|        |  | - Passport JWT strategy + AuthGuard | |
| B-2.4 | Refresh token rotation | - Generate secure random refresh token | 4 h |
|        |  | - Store hashed token in DB with expiry | |
|        |  | - `POST /api/auth/refresh` -- validate, rotate, return new pair | |
|        |  | - `POST /api/auth/logout` -- revoke token | |
|        |  | - Detect token reuse (revoke all user tokens if reused token detected) | |
| B-2.5 | Email verification | - Generate verification token (crypto.randomBytes) | 3 h |
|        |  | - Send email via configured SMTP/API | |
|        |  | - `GET /api/auth/verify-email?token=xxx` -- verify + activate | |
|        |  | - `POST /api/auth/resend-verification` -- rate-limited | |
| B-2.6 | Password reset | - `POST /api/auth/forgot-password` -- generate reset token, send email | 3 h |
|        |  | - `POST /api/auth/reset-password` -- validate token, update password | |
|        |  | - Invalidate all refresh tokens on password change | |
| B-2.7 | Google OAuth | - Install passport-google-oauth20 | 3 h |
|        |  | - Google strategy: validate ID token, find-or-create user | |
|        |  | - `GET /api/auth/google` + `GET /api/auth/google/callback` | |
| B-2.8 | Apple Sign-In | - Install passport-apple | 3 h |
|        |  | - Apple strategy: validate identity token | |
|        |  | - Handle Apple's "hide my email" relay | |
| B-2.9 | RBAC system | - `@Roles('admin', 'editor')` decorator | 3 h |
|        |  | - `RolesGuard` implementing `CanActivate` | |
|        |  | - `PUT /api/admin/users/:id/role` -- super_admin only | |
|        |  | - Account lockout after 5 failed attempts (15 min cooldown) | |
| B-2.10 | Profile CRUD + avatar | - `GET /api/users/me/profile` -- return profile | 4 h |
|        |  | - `PATCH /api/users/me/profile` -- update fields | |
|        |  | - `POST /api/users/me/avatar` -- upload, resize (Sharp 200x200), store R2 | |
|        |  | - `DELETE /api/users/me` -- soft delete | |

**Backend Total: 35 hours**

---

## Frontend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| F-2.1 | Auth state management | - Auth context/store with user, tokens, loading state | 3 h |
|        |  | - Token storage (httpOnly cookie preferred, fallback localStorage) | |
|        |  | - `useAuth()` hook: login, logout, register, refreshToken | |
| F-2.2 | Registration page | - Form with email, password, confirm password, display name | 4 h |
|        |  | - Real-time validation (password strength meter) | |
|        |  | - Success state: "Check your email for verification" | |
|        |  | - Link to login page | |
| F-2.3 | Login page | - Form with email, password | 3 h |
|        |  | - "Remember me" checkbox (extends refresh token) | |
|        |  | - Error states (invalid credentials, account locked, unverified) | |
|        |  | - Links to register and forgot password | |
| F-2.4 | Token refresh interceptor | - Axios interceptor: on 401, attempt refresh | 3 h |
|        |  | - Queue concurrent requests during refresh | |
|        |  | - On refresh failure, redirect to login | |
| F-2.5 | Email verification page | - Parse token from URL query param | 1 h |
|        |  | - Call verify endpoint, show success/error | |
|        |  | - "Resend verification" button | |
| F-2.6 | Password reset pages | - Forgot password: email input form | 3 h |
|        |  | - Reset password: new password + confirm form | |
|        |  | - Success/error states | |
| F-2.7 | Social login buttons | - Google Sign-In button (branded per Google guidelines) | 3 h |
|        |  | - Apple Sign-In button (branded per Apple guidelines) | |
|        |  | - Handle OAuth redirect callback | |
| F-2.8 | Profile page | - View mode: avatar, display name, bio, joined date | 5 h |
|        |  | - Edit mode: inline editing, form validation | |
|        |  | - Avatar upload with preview and crop | |
|        |  | - Change password modal | |
|        |  | - Delete account with confirmation dialog | |
| F-2.9 | Protected routes | - `withAuth` HOC or middleware for protected pages | 2 h |
|        |  | - Redirect to `/login?redirect=<original_url>` | |
|        |  | - Role-based UI visibility (`{user.role === 'admin' && ...}`) | |

**Frontend Total: 27 hours**

---

## DevOps / Infrastructure Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| D-2.1 | SMTP configuration | - Set up Resend (or SES) account, verify domain | 2 h |
|        |  | - Add SMTP env vars to `.env.example` | |
|        |  | - NestJS mailer module configuration | |
| D-2.2 | Email templates | - Verification email HTML template | 3 h |
|        |  | - Password reset email HTML template | |
|        |  | - Responsive, ILoveBerlin branded | |
| D-2.3 | Rate limiting | - `@nestjs/throttler` configuration | 1 h |
|        |  | - Per-route limits (login: 5/15min, register: 3/hour) | |
| D-2.4 | Google OAuth setup | - Create Google Cloud project, OAuth consent screen | 1 h |
|        |  | - Generate client ID + secret | |
| D-2.5 | Apple Sign-In setup | - Register App ID, Services ID in Apple Developer portal | 1 h |
|        |  | - Generate key + configure callbacks | |
| D-2.6 | Staging deployment | - Deploy auth-enabled API to staging | 1 h |
|        |  | - Verify email delivery from staging | |

**DevOps Total: 9 hours**

---

## QA Tasks

| ID | Test Scenario | Type | Estimate |
| -- | ------------- | ---- | -------- |
| QA-2.1 | Register with valid data -> receive verification email -> verify -> login successfully | E2E | 2 h |
| QA-2.2 | Login with wrong password 5 times -> account locked for 15 min | Integration | 1 h |
| QA-2.3 | Access token expires -> refresh token auto-rotates -> session continues | Integration | 2 h |
| QA-2.4 | Refresh token reuse detected -> all sessions revoked | Security | 1 h |
| QA-2.5 | Google OAuth: new user -> account created -> profile populated from Google | E2E | 1 h |
| QA-2.6 | Protected route without token -> 401; with wrong role -> 403 | Unit | 1 h |
| QA-2.7 | Upload avatar > 5 MB -> rejected; upload valid avatar -> resized and stored | Integration | 1 h |
| QA-2.8 | Password reset flow: request reset -> click email link -> set new password -> old sessions invalidated | E2E | 2 h |
| QA-2.9 | SQL injection attempts on login/register -> rejected by validation | Security | 1 h |

**QA Total: 12 hours**

---

## Dependencies

```
Sprint 1 (complete)
 +-- B-2.1 (DB migrations) -- depends on TypeORM config from Sprint 1
      +-- B-2.2 (Register) -- depends on users table
      |    +-- B-2.3 (Login + JWT) -- depends on user entity
      |    |    +-- B-2.4 (Refresh tokens) -- depends on JWT strategy
      |    |    +-- B-2.9 (RBAC) -- depends on JWT strategy
      |    +-- B-2.5 (Email verification) -- depends on register + SMTP
      |    +-- B-2.6 (Password reset) -- depends on register + SMTP
      +-- B-2.10 (Profile CRUD) -- depends on users + user_profiles tables

D-2.1 (SMTP) -- independent, but blocks B-2.5 and B-2.6
D-2.4 (Google OAuth) -- independent, but blocks B-2.7
D-2.5 (Apple Sign-In) -- independent, but blocks B-2.8

F-2.1 (Auth state) -- independent
F-2.2 (Register page) -- depends on F-2.1 + B-2.2
F-2.3 (Login page) -- depends on F-2.1 + B-2.3
F-2.4 (Token interceptor) -- depends on B-2.4
F-2.7 (Social buttons) -- depends on B-2.7 + B-2.8
F-2.8 (Profile page) -- depends on B-2.10 + F-2.1
F-2.9 (Protected routes) -- depends on F-2.1 + B-2.9
```

---

## Risk Items

| # | Risk | Likelihood | Impact | Mitigation |
| - | ---- | ---------- | ------ | ---------- |
| R-1 | Apple Sign-In provisioning delays (Apple Developer review) | Medium | Medium | Start D-2.5 on Day 11; if delayed, defer Apple Sign-In to Sprint 3 |
| R-2 | Email deliverability issues (SPF/DKIM/DMARC) | Medium | High | Use established provider (Resend); verify domain DNS records early |
| R-3 | JWT refresh token race conditions under concurrent requests | Medium | High | Implement request queuing in Axios interceptor; add DB-level locking |
| R-4 | OAuth callback URL mismatch between environments | Low | Medium | Environment-specific callback URLs in config; test on staging |
| R-5 | Avatar upload size/format edge cases | Low | Low | Validate MIME type server-side; Sharp handles format conversion |
| R-6 | Bcrypt performance under load (blocking event loop) | Low | Medium | Use `bcrypt` native binding (not `bcryptjs`); consider worker threads |

---

## Deliverables Checklist

- [ ] `users`, `refresh_tokens`, `user_profiles` tables created and migrated
- [ ] `POST /api/auth/register` with bcrypt hashing and email validation
- [ ] `POST /api/auth/login` returning JWT access + refresh tokens
- [ ] `POST /api/auth/refresh` with token rotation
- [ ] `POST /api/auth/logout` revoking refresh token
- [ ] `GET /api/auth/verify-email` activating user account
- [ ] `POST /api/auth/forgot-password` sending reset email
- [ ] `POST /api/auth/reset-password` with token validation
- [ ] Google OAuth login flow working end-to-end
- [ ] Apple Sign-In flow working end-to-end
- [ ] `@Roles()` decorator and `RolesGuard` protecting admin endpoints
- [ ] `GET/PATCH /api/users/me/profile` for profile management
- [ ] `POST /api/users/me/avatar` uploading and resizing to R2
- [ ] Registration, login, forgot password, reset password frontend pages
- [ ] Profile page with view/edit modes and avatar upload
- [ ] Auth state persisted across refreshes
- [ ] Protected route middleware redirecting unauthenticated users
- [ ] Social login buttons on login/register pages
- [ ] Rate limiting on auth endpoints
- [ ] All auth E2E tests passing

---

## Definition of Done

1. All acceptance criteria for US-2.1 through US-2.7 are met
2. Full registration -> verification -> login -> refresh -> logout flow works E2E
3. Google and Apple OAuth flows work on staging
4. RBAC guards correctly restrict admin endpoints
5. All passwords hashed with bcrypt; no plaintext passwords stored or logged
6. Refresh token rotation prevents token reuse attacks
7. Rate limiting active on all auth endpoints
8. Email templates render correctly in Gmail, Outlook, Apple Mail
9. Profile avatar upload, resize, and R2 storage working
10. All tests (unit + integration + E2E) passing in CI
11. Swagger docs updated with all new auth endpoints
12. No security vulnerabilities in OWASP Top 10 categories

---

## Sprint Review Demo Script

1. **Registration flow** (2 min) -- Fill registration form, show validation, submit, show success message
2. **Email verification** (1 min) -- Open email (Resend dashboard or real inbox), click verify link, show account activated
3. **Login flow** (1 min) -- Login with registered credentials, show JWT in network tab (dev tools)
4. **Token refresh** (2 min) -- Wait for access token expiry (or manually expire), show silent refresh in network tab
5. **Google OAuth** (1 min) -- Click "Sign in with Google", complete OAuth flow, show auto-created profile
6. **Apple Sign-In** (1 min) -- Click "Sign in with Apple", complete flow
7. **Profile management** (2 min) -- Edit display name, upload avatar, show resized image from R2
8. **RBAC demo** (1 min) -- Access admin endpoint as regular user (403), then as admin (200)
9. **Password reset** (1 min) -- Request reset, click email link, set new password, login with new password
10. **Security** (1 min) -- Show rate limiting in action, show locked account after failed attempts
11. **Q&A** (3 min)

**Total demo time: ~16 minutes**

---

## Rollover Criteria

A task may roll over to Sprint 3 only if ALL of the following are true:

1. Core auth flow (register, login, refresh, logout) is fully functional
2. At least 85% of story points are completed
3. The rollover does not block CMS foundation work in Sprint 3
4. Documented with reason and revised estimate

**Candidates for rollover (if needed):**
- B-2.8 Apple Sign-In (can launch with Google-only; Apple added in Sprint 3)
- F-2.8 Profile page avatar crop feature (upload without crop is acceptable)
- QA-2.9 Security pen testing (can be done alongside Sprint 3)

**Must NOT roll over:**
- Registration + login + JWT flow (blocks all authenticated features)
- Refresh token rotation (security requirement)
- RBAC guards (blocks Sprint 3 admin panel)
- Email verification (blocks production launch)
- Protected routes (blocks Sprint 3 admin pages)
