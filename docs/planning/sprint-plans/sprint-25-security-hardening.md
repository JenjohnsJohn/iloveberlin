# Sprint 25: Security Hardening & GDPR Compliance

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 25 |
| **Sprint Name** | Security Hardening & GDPR Compliance |
| **Duration** | 2 weeks (10 working days) |
| **Start Date** | Week 49 (Day 241) |
| **End Date** | Week 50 (Day 250) |
| **Phase** | Phase 5 -- Launch Preparation |

## Sprint Goal

Conduct a thorough security audit and hardening of the iloveberlin.biz platform -- implementing per-endpoint rate limiting, request validation review, security headers, file upload verification, account lockout, SQL injection review, and dependency scanning -- while achieving GDPR compliance through data export/deletion endpoints, cookie consent logging, and audit logging, then validating everything with an OWASP ZAP automated scan, delivering a platform ready for production launch with confidence in its security posture.

---

## User Stories

### US-25-01: Security Audit of All Endpoints
**As a** platform operator,
**I want** a comprehensive security audit of every API endpoint,
**so that** vulnerabilities are identified and remediated before launch.

**Acceptance Criteria:**
- [ ] Every API endpoint cataloged with: method, path, auth requirement, input validation, response data
- [ ] Authentication/authorization verified on every protected endpoint
- [ ] Endpoints with missing or insufficient auth guards identified and fixed
- [ ] Endpoints returning excessive data (over-fetching) identified and response shapes trimmed
- [ ] IDOR (Insecure Direct Object Reference) checks: users cannot access other users' private data
- [ ] Audit report document produced with findings and remediation status

### US-25-02: Per-Endpoint Rate Limiting
**As a** platform operator,
**I want** rate limiting configured per endpoint type,
**so that** the platform is protected from abuse, brute force, and DDoS.

**Acceptance Criteria:**
- [ ] Rate limiting middleware using `@nestjs/throttler` or custom Redis-based limiter
- [ ] Authentication endpoints (login, register, password reset): 5 requests/minute per IP
- [ ] Search endpoints: 30 requests/minute per IP
- [ ] Content read endpoints: 100 requests/minute per IP
- [ ] Content write endpoints (create, update, delete): 20 requests/minute per IP
- [ ] Analytics tracking endpoint: 100 requests/minute per IP (already exists from Sprint 24)
- [ ] Admin endpoints: 60 requests/minute per authenticated user
- [ ] Rate limit response returns 429 with `Retry-After` header
- [ ] Rate limit state stored in Redis for consistency across instances
- [ ] Rate limiting bypassed for health check endpoints

### US-25-03: Request Validation Review
**As a** platform operator,
**I want** all API inputs rigorously validated,
**so that** malicious or malformed input is rejected.

**Acceptance Criteria:**
- [ ] All DTOs (Data Transfer Objects) reviewed for class-validator decorators
- [ ] Missing validation decorators added (email format, string length, number ranges, enum values)
- [ ] Global ValidationPipe configured with: whitelist (strip unknown properties), forbidNonWhitelisted, transform
- [ ] File upload size limits enforced (images: 5MB, documents: 10MB)
- [ ] Request body size limit set in NestJS (1MB default)
- [ ] Query parameters validated (pagination limits, sort field whitelist)
- [ ] Path parameters validated (UUID format where applicable)

### US-25-04: Security Headers (CSP, HSTS)
**As a** platform operator,
**I want** proper security headers on all responses,
**so that** the platform is protected against XSS, clickjacking, and downgrade attacks.

**Acceptance Criteria:**
- [ ] `helmet` middleware installed and configured in NestJS
- [ ] Content-Security-Policy (CSP) header: restrict script-src, style-src, img-src, connect-src to known domains
- [ ] Strict-Transport-Security (HSTS): max-age=31536000; includeSubDomains; preload
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY (or SAMEORIGIN for admin pages with iframes)
- [ ] X-XSS-Protection: 0 (deprecated but set for legacy browsers)
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy: restrict camera, microphone, geolocation to self
- [ ] CSP report-uri configured to log violations (non-blocking report-only mode initially)

### US-25-05: File Upload Security (Magic Bytes Validation)
**As a** platform operator,
**I want** uploaded files validated by their actual content (magic bytes),
**so that** renamed malicious files are rejected.

**Acceptance Criteria:**
- [ ] File upload handler checks magic bytes (file signatures) in addition to MIME type and extension
- [ ] Allowed image types: JPEG (FF D8 FF), PNG (89 50 4E 47), GIF (47 49 46), WebP (52 49 46 46)
- [ ] Allowed document types: PDF (25 50 44 46) -- if applicable
- [ ] Files with mismatched extension vs. magic bytes are rejected with 400 error
- [ ] Uploaded files renamed to UUID to prevent path traversal
- [ ] Upload directory is outside the web root
- [ ] Virus/malware scanning considered (ClamAV) -- document decision
- [ ] Maximum file dimensions enforced for images (e.g., 8000x8000 pixels)

### US-25-06: Account Lockout
**As a** platform operator,
**I want** accounts locked after repeated failed login attempts,
**so that** brute force attacks are mitigated.

**Acceptance Criteria:**
- [ ] After 5 consecutive failed login attempts, account is locked for 15 minutes
- [ ] Lockout tracked per user in Redis (key: `lockout:{userId}`, TTL: 900 seconds)
- [ ] Locked accounts receive 423 Locked response with message indicating retry time
- [ ] Successful login resets the failed attempt counter
- [ ] Failed attempt counter includes: IP address and user ID
- [ ] Account lockout events logged in audit log
- [ ] Admin can manually unlock accounts via admin API
- [ ] Password reset bypasses lockout (user can reset password while locked out)

### US-25-07: SQL Injection Review
**As a** platform operator,
**I want** confirmation that the application is not vulnerable to SQL injection,
**so that** the database is protected from unauthorized access.

**Acceptance Criteria:**
- [ ] All database queries reviewed: TypeORM query builder and raw queries audited
- [ ] No string concatenation in SQL queries -- all parameterized
- [ ] Raw SQL queries (if any) use parameterized placeholders ($1, $2)
- [ ] TypeORM `createQueryBuilder` calls verified for proper parameter binding
- [ ] Search functionality reviewed for injection via Meilisearch (Meilisearch is not SQL but verify input sanitization)
- [ ] Documented list of all raw queries with confirmation each is parameterized

### US-25-08: GDPR Data Export Endpoint
**As a** user,
**I want to** export all my personal data,
**so that** I can exercise my GDPR right to data portability.

**Acceptance Criteria:**
- [ ] GET `/api/account/data-export` triggers data export generation
- [ ] Export is generated asynchronously via BullMQ job (can take time for large accounts)
- [ ] Export includes: profile data, email address, favorites, competition entries, classifieds, analytics events (user-associated), notification preferences
- [ ] Export format: JSON file (machine-readable per GDPR)
- [ ] User notified via email when export is ready with secure download link
- [ ] Download link expires after 48 hours
- [ ] Rate limit: 1 export request per user per 24 hours

### US-25-09: GDPR Data Deletion
**As a** user,
**I want to** delete my account and all associated data,
**so that** I can exercise my GDPR right to erasure.

**Acceptance Criteria:**
- [ ] DELETE `/api/account` initiates account deletion process
- [ ] Requires password confirmation in request body
- [ ] Soft-delete initially: account marked as `deleted`, personal data cleared after 30-day grace period
- [ ] Grace period allows account recovery if deletion was accidental
- [ ] After 30 days, hard-delete cron removes: user record, profile, favorites, competition entries, classifieds, notification preferences, device tokens, analytics events
- [ ] Content created by user (articles, comments) is anonymized (author set to "Deleted User") not deleted
- [ ] Confirmation email sent to user acknowledging deletion request
- [ ] Admin audit log entry created for deletion request

### US-25-10: Cookie Consent Logging
**As a** platform operator,
**I want** cookie consent choices logged,
**so that** I can demonstrate GDPR compliance if audited.

**Acceptance Criteria:**
- [ ] `cookie_consents` table: id, session_id, ip_hash, consent_categories (JSONB), action (accept/reject/customize), created_at
- [ ] POST `/api/consent` logs consent choice
- [ ] Consent categories: necessary (always on), analytics, marketing
- [ ] Consent stored in cookie on client side for persistence
- [ ] Consent ID returned and stored in cookie for future reference
- [ ] Consent log immutable (no updates, only new records for changed preferences)

### US-25-11: Audit Logging for Sensitive Operations
**As a** platform operator,
**I want** an audit trail for all sensitive operations,
**so that** I can investigate security incidents and demonstrate compliance.

**Acceptance Criteria:**
- [ ] `audit_logs` table: id, user_id, action, entity_type, entity_id, ip_address, user_agent, metadata (JSONB), created_at
- [ ] Logged operations: login_success, login_failure, password_change, password_reset, account_deletion_request, data_export_request, admin_login, admin_content_publish, admin_content_delete, admin_user_modify, role_change, account_lockout
- [ ] AuditService injectable in any module
- [ ] Audit logs retained for 2 years
- [ ] Admin audit log viewer endpoint: GET `/api/admin/audit-logs` with filtering by action, user, date range
- [ ] Audit log entries are immutable (no update or delete API)

### US-25-12: Dependency Vulnerability Scan
**As a** platform operator,
**I want** all dependencies scanned for known vulnerabilities,
**so that** I can address security issues in third-party code.

**Acceptance Criteria:**
- [ ] `npm audit` run on backend and frontend projects
- [ ] All critical and high vulnerabilities resolved (updated or patched)
- [ ] Medium vulnerabilities documented with risk assessment
- [ ] Snyk CLI scan run as secondary check
- [ ] Flutter `pub outdated` and security advisory check run
- [ ] Report generated listing all findings and resolutions
- [ ] CI pipeline step added to run `npm audit --audit-level=high` on every build

### US-25-13: Cookie Consent Banner (Frontend)
**As a** website visitor,
**I want** a cookie consent banner,
**so that** I can control which cookies are used per GDPR requirements.

**Acceptance Criteria:**
- [ ] Cookie consent banner displayed on first visit (bottom of page, non-blocking)
- [ ] Options: "Accept All", "Reject All", "Customize"
- [ ] Customize modal shows toggles for: Analytics, Marketing (Necessary always on, grayed out)
- [ ] Consent choice persisted in cookie and logged via POST `/api/consent`
- [ ] Analytics scripts (tracking) only loaded after analytics consent
- [ ] Banner does not reappear after consent given (until consent expires or is cleared)
- [ ] Consent expires after 12 months, banner reappears
- [ ] Banner accessible (keyboard navigable, screen reader compatible)

### US-25-14: Privacy Policy and Terms Pages
**As a** website visitor,
**I want** to read the privacy policy and terms of service,
**so that** I understand how my data is handled.

**Acceptance Criteria:**
- [ ] Privacy policy page at `/privacy` with comprehensive GDPR-compliant content
- [ ] Terms of service page at `/terms`
- [ ] Pages are static/pre-rendered for performance
- [ ] Last updated date displayed on each page
- [ ] Table of contents for easy navigation
- [ ] Links to privacy policy and terms in: footer, registration form, cookie consent banner, "More" screen in mobile app

### US-25-15: GDPR Data Request Pages (Frontend)
**As a** user,
**I want** a UI to request data export and account deletion,
**so that** I can exercise my GDPR rights easily.

**Acceptance Criteria:**
- [ ] Data export request page at `/account/data-export`
- [ ] Shows status of pending export (if any) and download link (if ready)
- [ ] "Request Export" button triggers API call, shows processing message
- [ ] Account deletion page at `/account/delete`
- [ ] Requires password confirmation before submission
- [ ] Warning message explaining 30-day grace period and what data is deleted
- [ ] Confirmation dialog before final submission
- [ ] Success message with information about the grace period

### US-25-16: OWASP ZAP Automated Scan
**As a** platform operator,
**I want** an automated security scan using OWASP ZAP,
**so that** common web vulnerabilities are detected.

**Acceptance Criteria:**
- [ ] OWASP ZAP baseline scan run against staging environment
- [ ] ZAP spider crawls all public pages and API endpoints
- [ ] Active scan tests for: XSS, CSRF, injection, broken auth, security misconfigurations
- [ ] Scan report generated in HTML format
- [ ] All high-severity findings remediated
- [ ] Medium-severity findings documented with remediation plan
- [ ] Low/informational findings reviewed and accepted or addressed

### US-25-17: Rate Limiting and CORS Verification
**As a** platform operator,
**I want** rate limiting and CORS configuration verified end-to-end,
**so that** protections work as expected in realistic conditions.

**Acceptance Criteria:**
- [ ] Rate limiting tested with concurrent requests from same IP -- verify 429 returned after threshold
- [ ] Rate limiting tested across different endpoint types (auth, search, content, admin)
- [ ] Retry-After header value verified
- [ ] CORS configuration reviewed: only iloveberlin.biz and approved subdomains allowed
- [ ] CORS preflight requests (OPTIONS) return correct headers
- [ ] Cross-origin requests from unauthorized domains are rejected
- [ ] Document rate limit configuration for operations team

---

## Day-by-Day Task Breakdown

### Week 1 (Days 241-245)

#### Day 1 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-01 | Catalog all API endpoints: method, path, auth requirement, input validation | Backend | 4 | -- |
| T25-02 | Verify authentication/authorization on all protected endpoints; identify gaps | Backend | 4 | T25-01 |
| T25-03 | Create `audit_logs` table migration | Backend | 1 | -- |

#### Day 2 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-04 | Fix auth guard gaps identified in audit; add missing guards | Backend | 3 | T25-02 |
| T25-05 | IDOR checks: test accessing other users' data on all user-scoped endpoints | Backend | 3 | T25-02 |
| T25-06 | Review and fix over-fetching: trim response DTOs to exclude sensitive/unnecessary fields | Backend | 2 | T25-01 |
| T25-07 | Install and configure @nestjs/throttler with Redis store | Backend | 2 | -- |

#### Day 3 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-08 | Configure rate limits: auth endpoints 5/min, search 30/min, content read 100/min | Backend | 2 | T25-07 |
| T25-09 | Configure rate limits: content write 20/min, admin 60/min; bypass for health checks | Backend | 1.5 | T25-07 |
| T25-10 | Implement 429 response with Retry-After header | Backend | 1 | T25-07 |
| T25-11 | Review all DTOs for class-validator decorators; add missing validations | Backend | 4 | -- |
| T25-12 | Configure global ValidationPipe: whitelist, forbidNonWhitelisted, transform | Backend | 1 | T25-11 |

#### Day 4 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-13 | Install helmet; configure CSP, HSTS, X-Content-Type-Options, X-Frame-Options | Backend | 3 | -- |
| T25-14 | Configure Referrer-Policy, Permissions-Policy, CSP report-uri | Backend | 2 | T25-13 |
| T25-15 | File upload security: implement magic bytes validation for images and PDFs | Backend | 3 | -- |
| T25-16 | File upload: UUID rename, directory isolation, dimension limits | Backend | 2 | T25-15 |

#### Day 5 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-17 | Account lockout: Redis-based tracking (5 failures = 15 min lockout) | Backend | 3 | -- |
| T25-18 | Account lockout: 423 response, reset on success, admin unlock endpoint | Backend | 2 | T25-17 |
| T25-19 | Account lockout: password reset bypass, audit log entry | Backend | 1.5 | T25-17, T25-03 |
| T25-20 | SQL injection review: audit all TypeORM queries and raw SQL | Backend | 3 | -- |
| T25-21 | SQL injection: fix any string concatenation issues, document all raw queries | Backend | 1 | T25-20 |

### Week 2 (Days 246-250)

#### Day 6 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-22 | GDPR data export: create BullMQ job, gather all user data, generate JSON | Backend | 4 | -- |
| T25-23 | GDPR data export: secure download link with 48-hour expiry, email notification | Backend | 2.5 | T25-22 |
| T25-24 | GDPR data export: rate limit (1/24h), GET `/api/account/data-export` endpoint | Backend | 1.5 | T25-22 |
| T25-25 | AuditService: create injectable service, log method, all sensitive operation types | Backend | 2 | T25-03 |

#### Day 7 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-26 | GDPR data deletion: DELETE `/api/account`, password confirmation, soft-delete | Backend | 3 | -- |
| T25-27 | GDPR data deletion: 30-day hard-delete cron (remove all user data, anonymize content) | Backend | 3 | T25-26 |
| T25-28 | GDPR data deletion: confirmation email, audit log entry | Backend | 1.5 | T25-26, T25-25 |
| T25-29 | Cookie consent: create `cookie_consents` table, POST `/api/consent` endpoint | Backend | 2 | -- |
| T25-30 | Integrate AuditService into: auth module, admin module, account module | Backend | 2 | T25-25 |

#### Day 8 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-31 | Admin audit log viewer: GET `/api/admin/audit-logs` with filtering | Backend | 2.5 | T25-25 |
| T25-32 | Dependency scan: npm audit (backend + frontend), resolve critical/high issues | Backend | 3 | -- |
| T25-33 | Dependency scan: Snyk CLI scan, Flutter pub outdated, generate report | Backend | 2 | T25-32 |
| T25-34 | Add npm audit to CI pipeline | DevOps | 1 | T25-32 |
| T25-35 | Frontend: cookie consent banner component (Accept All, Reject All, Customize) | Frontend | 3 | T25-29 |

#### Day 9 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-36 | Frontend: cookie consent customize modal with category toggles | Frontend | 2 | T25-35 |
| T25-37 | Frontend: consent persistence (cookie), conditional analytics loading, 12-month expiry | Frontend | 2 | T25-35 |
| T25-38 | Frontend: privacy policy page at `/privacy` | Frontend | 2 | -- |
| T25-39 | Frontend: terms of service page at `/terms` | Frontend | 2 | -- |
| T25-40 | Frontend: GDPR data export request page at `/account/data-export` | Frontend | 2 | T25-24 |
| T25-41 | Frontend: account deletion page at `/account/delete` with confirmation flow | Frontend | 2 | T25-26 |

#### Day 10 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T25-42 | Run OWASP ZAP baseline + active scan against staging | QA | 3 | All backend tasks |
| T25-43 | Remediate high-severity ZAP findings | Backend | 2 | T25-42 |
| T25-44 | Document medium/low ZAP findings with remediation plan | QA | 1 | T25-42 |
| T25-45 | QA: test rate limiting with concurrent requests on each endpoint type | QA | 2 | T25-08, T25-09 |
| T25-46 | QA: test CORS (authorized domains pass, unauthorized rejected) | QA | 1 | -- |
| T25-47 | QA: test account lockout (5 failures, lockout, unlock, password reset bypass) | QA | 1.5 | T25-17 |
| T25-48 | QA: test GDPR export (request, receive email, download, verify content) | QA | 1.5 | T25-22 |
| T25-49 | QA: test GDPR deletion (request, grace period, verify hard delete after 30 days) | QA | 1 | T25-26 |
| T25-50 | Produce security audit report summarizing all findings and status | Backend | 2 | All tasks |

---

## Backend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T25-01-02 | Endpoint audit | Catalog endpoints, verify auth/authz, identify gaps | 8 |
| T25-04-06 | Fix audit findings | Auth guard gaps, IDOR fixes, response trimming | 8 |
| T25-07-10 | Rate limiting | Install throttler, configure per-endpoint limits, Redis store, 429 + Retry-After | 6.5 |
| T25-11-12 | Validation review | DTO audit, missing decorators, global ValidationPipe config | 5 |
| T25-13-14 | Security headers | Helmet, CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy | 5 |
| T25-15-16 | File upload security | Magic bytes check, UUID rename, directory isolation, dimension limits | 5 |
| T25-17-19 | Account lockout | Redis tracking, 423 response, reset, admin unlock, audit log | 6.5 |
| T25-20-21 | SQL injection review | Audit all queries, fix concatenation, document raw queries | 4 |
| T25-22-24 | GDPR data export | BullMQ job, data gathering, JSON generation, download link, email, rate limit | 8 |
| T25-25, T25-30-31 | Audit logging | AuditService, integration into modules, admin viewer endpoint | 6.5 |
| T25-26-28 | GDPR data deletion | DELETE endpoint, soft-delete, hard-delete cron, anonymization, email, audit | 7.5 |
| T25-29 | Cookie consent backend | Table migration, POST /api/consent | 2 |
| T25-32-33 | Dependency scanning | npm audit, Snyk, Flutter pub, report | 5 |
| T25-43 | ZAP remediation | Fix high-severity findings from OWASP ZAP | 2 |
| T25-50 | Security report | Summary of all findings, status, residual risk | 2 |
| | **Backend Total** | | **81** |

## Frontend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T25-35 | Cookie consent banner | Bottom banner, Accept All, Reject All, Customize buttons, styling | 3 |
| T25-36 | Consent customize modal | Category toggles (necessary, analytics, marketing), save button | 2 |
| T25-37 | Consent logic | Cookie persistence, conditional script loading, 12-month expiry, API logging | 2 |
| T25-38 | Privacy policy page | Static page with TOC, last updated date, GDPR-compliant content | 2 |
| T25-39 | Terms of service page | Static page with TOC, last updated date | 2 |
| T25-40 | Data export page | Request button, pending status display, download link, loading states | 2 |
| T25-41 | Account deletion page | Password field, warning message, confirmation dialog, success message | 2 |
| | **Frontend Total** | | **15** |

## DevOps/Infrastructure Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T25-34 | CI security check | Add npm audit --audit-level=high to CI pipeline, fail build on high/critical | 1 |
| T25-INFRA-01 | CSP report-uri endpoint or service | Configure reporting endpoint or use report-uri.com | 1 |
| T25-INFRA-02 | Verify HSTS preload submission eligibility | Check headers, consider hstspreload.org submission | 0.5 |
| | **DevOps Total** | | **2.5** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---|---|---|---|
| T25-42 | OWASP ZAP scan | Run ZAP against staging: spider, active scan, review report, categorize findings | 3 |
| T25-44 | ZAP report | Document medium/low findings with accepted risk or remediation timeline | 1 |
| T25-45 | Rate limiting test | Send burst requests to auth endpoint (expect 429 after 5), search (after 30), content read (after 100); verify Retry-After header | 2 |
| T25-46 | CORS test | Request from iloveberlin.biz (pass), request from evil.com (reject), preflight OPTIONS verification | 1 |
| T25-47 | Account lockout test | 5 failed logins -> locked 15 min -> 423 response; correct login before 5 -> reset; admin unlock; password reset while locked | 1.5 |
| T25-48 | GDPR export test | Request export -> email arrives -> download link works -> JSON contains all user data -> link expires after 48h | 1.5 |
| T25-49 | GDPR deletion test | Request deletion -> soft-delete -> user cannot login -> after 30-day cron -> all data removed -> content anonymized | 1 |
| T25-QA-01 | Cookie consent test | Banner appears on first visit; Accept All sets all cookies; Reject All blocks analytics; Customize modal works; banner does not reappear; consent logged in DB | 1.5 |
| T25-QA-02 | Security headers test | Verify all security headers present in response (CSP, HSTS, X-Frame-Options, etc.) using browser DevTools or curl | 1 |
| T25-QA-03 | File upload test | Upload valid JPEG (accepted); upload .jpg with PNG bytes (accepted - valid image); upload .jpg with EXE bytes (rejected); oversized file (rejected) | 1 |
| | **QA Total** | | **14.5** |

---

## Dependencies

```
T25-01 (endpoint catalog) --> T25-02 (auth verification) --> T25-04 (fix gaps), T25-05 (IDOR), T25-06 (over-fetching)
T25-07 (throttler install) --> T25-08, T25-09 (rate limit config) --> T25-10 (429 response)
T25-11 (DTO review) --> T25-12 (ValidationPipe)
T25-13 (helmet) --> T25-14 (additional headers)
T25-15 (magic bytes) --> T25-16 (file hardening)
T25-17 (lockout logic) --> T25-18 (response + unlock), T25-19 (bypass + audit)
T25-20 (SQL review) --> T25-21 (fixes)
T25-03 (audit_logs migration) --> T25-25 (AuditService) --> T25-30 (integration), T25-31 (admin viewer)
T25-22 (export job) --> T25-23 (download link) --> T25-24 (endpoint)
T25-26 (delete endpoint) --> T25-27 (hard-delete cron), T25-28 (email + audit)
T25-29 (consent backend) --> T25-35 (consent banner) --> T25-36 (customize), T25-37 (logic)
T25-32 (npm audit) --> T25-33 (Snyk + Flutter) --> T25-34 (CI)
T25-24 --> T25-40 (export page)
T25-26 --> T25-41 (deletion page)
All backend tasks --> T25-42 (ZAP scan) --> T25-43 (remediation), T25-44 (report)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Security audit reveals many critical issues requiring extensive rework | Medium | High | Prioritize critical fixes; defer medium/low to post-launch backlog |
| Rate limiting causes false positives for legitimate users | Medium | Medium | Start with generous limits; monitor 429 rates in Grafana; tune based on real traffic |
| CSP breaks legitimate functionality (inline scripts, third-party resources) | High | Medium | Use report-only mode first; review CSP violations; whitelist as needed |
| OWASP ZAP generates false positives requiring investigation time | High | Low | Review each finding; mark confirmed false positives; focus on high-severity |
| GDPR data export generates very large files for active users | Low | Medium | Stream JSON generation; set file size limit; paginate if needed |
| Dependency updates introduce breaking changes | Medium | Medium | Test thoroughly after updates; pin exact versions; update one at a time |

---

## Deliverables Checklist

- [ ] Security audit report with all endpoints cataloged and findings addressed
- [ ] Per-endpoint rate limiting active with Redis-backed state
- [ ] All DTOs validated with class-validator, global ValidationPipe configured
- [ ] Security headers (CSP, HSTS, X-Frame-Options, etc.) on all responses
- [ ] File upload magic bytes validation
- [ ] Account lockout after 5 failed attempts (15-minute lockout)
- [ ] SQL injection review complete with all queries parameterized
- [ ] GDPR data export endpoint with async generation and secure download
- [ ] GDPR account deletion with 30-day soft-delete and hard-delete cron
- [ ] Cookie consent logging to database
- [ ] Audit logging for all sensitive operations
- [ ] Dependency vulnerability scan report (npm audit, Snyk)
- [ ] npm audit added to CI pipeline
- [ ] Cookie consent banner on frontend
- [ ] Privacy policy and terms of service pages
- [ ] GDPR data export and account deletion pages
- [ ] OWASP ZAP scan report with high-severity findings remediated
- [ ] Rate limiting and CORS verified end-to-end

---

## Definition of Done

- Security audit report produced with zero unresolved critical findings
- Rate limiting returns 429 with Retry-After for all configured endpoint types
- All API inputs validated; unknown properties stripped; malformed requests rejected with 400
- Security headers verified in browser DevTools on every page load
- File uploads with invalid magic bytes rejected
- Account locks after 5 failed logins, unlocks after 15 minutes
- No SQL injection vulnerabilities found (all queries parameterized)
- GDPR data export produces complete JSON of user data with secure download
- GDPR account deletion follows soft-delete -> hard-delete lifecycle correctly
- Cookie consent choices logged in database
- Audit logs capture all sensitive operations with immutable records
- All critical and high dependency vulnerabilities resolved
- Cookie consent banner functional and accessible
- Privacy policy and terms pages published
- OWASP ZAP scan shows no high-severity vulnerabilities
- All code reviewed and merged

---

## Sprint Review Demo Script

1. **Security audit summary** (2 min): Present audit report: total endpoints reviewed, findings count by severity, remediation status
2. **Rate limiting** (3 min): Demonstrate rate limiting on login endpoint (send 6 rapid requests from Postman, show 429 on 6th); show Retry-After header; demonstrate different limits on search vs. content endpoints
3. **Security headers** (2 min): Open browser DevTools on iloveberlin.biz, show Response Headers tab with CSP, HSTS, X-Frame-Options, etc.
4. **File upload security** (2 min): Upload a valid JPEG (success); attempt to upload a renamed .exe as .jpg (rejected with 400); show magic bytes validation in action
5. **Account lockout** (2 min): Attempt 5 failed logins, show 423 Locked response, show retry time; demonstrate admin unlock from admin panel
6. **GDPR data export** (3 min): Navigate to `/account/data-export`; click "Request Export"; show processing status; show email notification; click download link; open JSON file and highlight included data categories
7. **GDPR account deletion** (2 min): Navigate to `/account/delete`; show warning message; enter password; show confirmation dialog; show success message with grace period information
8. **Cookie consent** (2 min): Load site in incognito; show consent banner; click "Customize"; toggle analytics off; accept; verify analytics scripts not loaded; show consent logged in database
9. **Privacy & terms** (1 min): Navigate to `/privacy` and `/terms`; show table of contents; show links in footer
10. **OWASP ZAP results** (2 min): Show ZAP HTML report; highlight zero high-severity findings; discuss any medium findings and remediation plan
11. **Dependency scan** (1 min): Show npm audit and Snyk results; confirm zero critical/high vulnerabilities

**Total demo time:** ~22 minutes

---

## Rollover Criteria

Items roll over to Sprint 26 if:
- OWASP ZAP medium-severity findings that require significant refactoring -- document and schedule
- CSP is still in report-only mode due to violations -- switch to enforce in Sprint 26 after tuning
- Snyk findings for indirect dependencies that cannot be immediately updated -- document with risk acceptance
- Admin audit log viewer UI polish -- backend logging must be functional

Items that **must** be completed this sprint (no rollover):
- Security audit of all endpoints with critical/high issues resolved
- Rate limiting on authentication and write endpoints
- Account lockout mechanism
- GDPR data export and deletion endpoints (legal requirement)
- Cookie consent banner and logging (legal requirement)
- Security headers (CSP at minimum in report-only, HSTS active)
- File upload magic bytes validation
- SQL injection review confirmed clean
