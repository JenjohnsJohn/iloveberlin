# NFR-SEC: Security Requirements

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Category:** Non-Functional Requirements -- Security
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft

---

## 1. Overview

This document defines the security requirements for the ILoveBerlin platform. All requirements are designed to achieve compliance with the OWASP Top 10 (2021 edition) and align with GDPR obligations for a platform operating within the European Union. The platform architecture comprises a Next.js frontend, NestJS backend API, Flutter mobile application, PostgreSQL database, Cloudflare CDN/WAF, Cloudflare R2 storage, and Meilisearch -- hosted on Hetzner VPS infrastructure.

---

## 2. Transport Security

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-001 | **All communications** between clients and servers shall be encrypted using TLS 1.2 or higher. TLS 1.0 and 1.1 shall be disabled. | 100% HTTPS, TLS >= 1.2 | SSL Labs scan (Grade A or above) |
| NFR-SEC-002 | **HTTP Strict Transport Security (HSTS)** headers shall be set with a minimum `max-age` of 31536000 (1 year), including `includeSubDomains` and `preload` directives. | HSTS max-age >= 31536000 | HTTP header inspection, HSTS preload list submission |
| NFR-SEC-003 | **SSL certificates** shall be automatically managed and renewed via Cloudflare (or Let's Encrypt for origin). Certificates shall be renewed at least 30 days before expiration. | Auto-renewal, 30-day buffer | Certificate monitoring, Cloudflare dashboard |
| NFR-SEC-004 | **Internal service communication** (backend to database, backend to Meilisearch) shall use encrypted connections where supported, or operate within an isolated private network. | Encrypted or network-isolated | Network topology audit |

---

## 3. Authentication

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-010 | **JWT access tokens** shall have a maximum lifetime of 15 minutes. | Access token TTL = 15 min | Token configuration review, integration test |
| NFR-SEC-011 | **JWT refresh tokens** shall have a maximum lifetime of 7 days and shall use **rotation** -- each use of a refresh token issues a new refresh token and invalidates the previous one. | Refresh TTL = 7 days, single-use rotation | Integration test, code review |
| NFR-SEC-012 | **Refresh token reuse detection** shall be implemented. If a previously rotated refresh token is presented, all tokens in the family shall be revoked immediately, forcing re-authentication. | Reuse triggers full revocation | Automated security test |
| NFR-SEC-013 | JWT tokens shall be signed using **RS256** (RSA with SHA-256) or **EdDSA** with keys rotated every 90 days. | Asymmetric signing, 90-day key rotation | Configuration audit |
| NFR-SEC-014 | **Passwords** shall be hashed using bcrypt with a minimum cost factor of 12 (or Argon2id as an alternative). | bcrypt cost >= 12 | Code review, unit test |
| NFR-SEC-015 | **Password policy** shall enforce: minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character. | Policy enforced on registration and password change | Integration test |
| NFR-SEC-016 | **Account lockout** shall activate after 5 consecutive failed login attempts, imposing a 15-minute cooldown period. Locked accounts shall return a generic error message that does not distinguish between "account exists" and "account locked." | 5 failures = 15 min lockout | Integration test, penetration test |
| NFR-SEC-017 | **Multi-factor authentication (MFA)** support shall be architecturally planned for future implementation (TOTP-based). Data model shall accommodate MFA fields. | MFA-ready schema | Schema review |

---

## 4. Authorization

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-020 | **Role-Based Access Control (RBAC)** shall be implemented with at minimum the following roles: `anonymous`, `registered_user`, `content_creator`, `business_owner`, `moderator`, `admin`. | 6 roles defined and enforced | Code review, integration tests |
| NFR-SEC-021 | Every API endpoint shall enforce **authorization checks** via NestJS guards. No endpoint shall be accessible without an explicit role assignment (default deny). | 100% endpoint coverage | Automated endpoint audit, code review |
| NFR-SEC-022 | **Resource-level authorization** shall be enforced -- users may only modify or delete resources they own, unless they hold an elevated role (moderator/admin). | Ownership checks on all mutation endpoints | Integration test, penetration test |
| NFR-SEC-023 | **Admin endpoints** shall be restricted to the `admin` role and shall be served on a separate route prefix (`/admin/api/`) with additional rate limiting. | Admin routes isolated and restricted | Code review, access test |

---

## 5. Rate Limiting

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-030 | **Authentication endpoints** (login, register, password reset) shall be rate-limited to **30 requests per minute** per IP address. | 30 req/min per IP | Integration test with rate limit verification |
| NFR-SEC-031 | **General API endpoints** shall be rate-limited to **100 requests per minute** per authenticated user or per IP for unauthenticated requests. | 100 req/min per user/IP | Integration test |
| NFR-SEC-032 | **Search endpoints** shall be rate-limited to **60 requests per minute** per user/IP to prevent abuse of Meilisearch resources. | 60 req/min per user/IP | Integration test |
| NFR-SEC-033 | **File upload endpoints** shall be rate-limited to **10 requests per minute** per authenticated user. | 10 req/min per user | Integration test |
| NFR-SEC-034 | Rate limit responses shall return HTTP **429 Too Many Requests** with a `Retry-After` header indicating when the client may retry. | 429 + Retry-After header | Integration test |
| NFR-SEC-035 | **Cloudflare WAF** rate limiting rules shall provide an additional layer of protection at the edge, blocking IPs that exceed 300 requests per minute across all endpoints. | Edge rate limit at 300 req/min per IP | Cloudflare WAF rule configuration |

---

## 6. Input Validation and Sanitization

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-040 | All API request bodies shall be validated using **class-validator** decorators on NestJS DTOs. No raw request data shall reach service or repository layers without validation. | 100% DTO coverage with validation | Code review, automated DTO audit |
| NFR-SEC-041 | **Input length limits** shall be enforced on all string fields (e.g., title: 200 chars, description: 5000 chars, comment: 2000 chars). | Length limits on all string inputs | DTO review, integration test |
| NFR-SEC-042 | **SQL injection prevention** shall be achieved through exclusive use of parameterized queries via TypeORM. Raw SQL queries are prohibited unless reviewed and approved with explicit parameterization. | Zero raw, unparameterized SQL | Code review, static analysis, penetration test |
| NFR-SEC-043 | **XSS prevention** shall be achieved through: (a) output encoding in Next.js (default React behavior), (b) server-side sanitization of user-generated HTML content using a whitelist-based library (e.g., DOMPurify or sanitize-html), (c) Content Security Policy headers. | Zero XSS vectors | Penetration test, automated scanning |
| NFR-SEC-044 | **NoSQL injection** in Meilisearch queries shall be prevented by validating and sanitizing all search parameters before passing them to the Meilisearch client. | Sanitized search inputs | Code review |

---

## 7. Security Headers

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-050 | **Content Security Policy (CSP)** shall be configured to restrict script sources to `'self'` and explicitly whitelisted domains. `'unsafe-inline'` for scripts shall be avoided; nonce-based CSP shall be used where inline scripts are necessary. | CSP enforced, no unsafe-inline scripts | SecurityHeaders.com scan, penetration test |
| NFR-SEC-051 | **X-Content-Type-Options** header shall be set to `nosniff` on all responses. | Header present on all responses | HTTP header inspection |
| NFR-SEC-052 | **X-Frame-Options** header shall be set to `DENY` (or `SAMEORIGIN` if iframe embedding is required internally). | Header present on all responses | HTTP header inspection |
| NFR-SEC-053 | **Referrer-Policy** shall be set to `strict-origin-when-cross-origin`. | Header present on all responses | HTTP header inspection |
| NFR-SEC-054 | **Permissions-Policy** shall disable unnecessary browser features (camera, microphone, geolocation) unless explicitly needed. | Permissions restricted | HTTP header inspection |
| NFR-SEC-055 | The platform shall achieve a **SecurityHeaders.com grade of A** or above. | Grade A+ or A | SecurityHeaders.com scan |

---

## 8. File Upload Security

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-060 | **File type validation** shall verify both the file extension and **magic bytes** (file signature) to confirm the actual file type matches the declared MIME type. | Dual validation (extension + magic bytes) | Integration test with disguised files |
| NFR-SEC-061 | **Allowed file types** shall be explicitly whitelisted: images (JPEG, PNG, WebP, GIF), documents (PDF). All other file types shall be rejected. | Whitelist enforcement | Integration test |
| NFR-SEC-062 | **Maximum file size** shall be enforced: 5 MB for images, 10 MB for documents. | Size limits enforced | Integration test |
| NFR-SEC-063 | Uploaded files shall be **renamed** using a UUID or content-hash naming scheme. Original filenames shall be stored as metadata but never used for filesystem paths. | UUID-based naming | Code review |
| NFR-SEC-064 | Uploaded files shall be stored in **Cloudflare R2** with private access by default. Public access shall be granted only through signed URLs or CDN-proxied paths with appropriate cache headers. | Private-by-default storage | R2 bucket policy review |
| NFR-SEC-065 | **Image processing** (resizing, format conversion) shall be performed in a sandboxed process to mitigate image-based exploits (e.g., ImageTragick-class vulnerabilities). | Sandboxed processing | Architecture review |
| NFR-SEC-066 | Uploaded files shall be scanned for **malware** using ClamAV or equivalent before being stored permanently. Files failing the scan shall be quarantined and the upload rejected. | 100% of uploads scanned | Integration test, scan logs |

---

## 9. CORS Policy

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-070 | **CORS** shall be configured to allow requests only from explicitly whitelisted origins: the production frontend domain (`iloveberlin.biz`, `www.iloveberlin.biz`), staging domain, and `localhost` (development only). | Explicit origin whitelist | HTTP header inspection, integration test |
| NFR-SEC-071 | **Credentials** (`Access-Control-Allow-Credentials`) shall be set to `true` only for authenticated API routes. | Credentials restricted | HTTP header inspection |
| NFR-SEC-072 | **Allowed methods** shall be restricted to `GET, POST, PUT, PATCH, DELETE, OPTIONS`. | Methods restricted | HTTP header inspection |
| NFR-SEC-073 | **CORS preflight responses** shall be cached for at least 3600 seconds (`Access-Control-Max-Age`). | Preflight cache >= 3600 s | HTTP header inspection |

---

## 10. Dependency and Supply Chain Security

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-080 | **Automated dependency vulnerability scanning** shall run on every pull request and at minimum weekly on the main branch using `npm audit`, Snyk, or GitHub Dependabot. | 100% PR coverage + weekly scan | CI/CD pipeline configuration |
| NFR-SEC-081 | **Critical and high severity vulnerabilities** in dependencies shall be patched or mitigated within 48 hours of disclosure. Medium severity within 7 days. | Critical/High: 48 h, Medium: 7 d | Vulnerability tracking log |
| NFR-SEC-082 | **Lock files** (`package-lock.json`, `pubspec.lock`) shall be committed and used for deterministic builds. `npm install` without `--ignore-scripts` shall not be used in CI. | Lock files committed and enforced | CI/CD configuration review |
| NFR-SEC-083 | **Docker base images** (if used) shall be pinned to specific digests and scanned for vulnerabilities before deployment. | Pinned and scanned images | Dockerfile review, container scanning |

---

## 11. Data Protection

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-090 | **Personally identifiable information (PII)** shall be encrypted at rest in the PostgreSQL database using column-level encryption for sensitive fields (email, phone, address). | PII encrypted at rest | Database schema review |
| NFR-SEC-091 | **Database backups** shall be encrypted using AES-256 before storage. | AES-256 encrypted backups | Backup process audit |
| NFR-SEC-092 | **API responses** shall never expose internal identifiers (database auto-increment IDs) publicly. UUIDs shall be used for all external-facing resource identifiers. | UUIDs for external IDs | Code review, API response audit |
| NFR-SEC-093 | **Sensitive data** (passwords, tokens, API keys) shall never appear in application logs, error messages, or API responses. | Zero sensitive data in logs | Log audit, code review |
| NFR-SEC-094 | **Audit logging** shall record all authentication events (login, logout, failed attempts, token refresh, password change) and all administrative actions with timestamp, user ID, IP address, and action description. | 100% auth and admin event logging | Log review, integration test |

---

## 12. OWASP Top 10 Compliance

| ID | Requirement | OWASP Category | Mitigation |
|----|-------------|----------------|------------|
| NFR-SEC-100 | **A01: Broken Access Control** -- RBAC with default-deny, resource ownership checks, CORS restrictions. | A01:2021 | NFR-SEC-020 through NFR-SEC-023, NFR-SEC-070 through NFR-SEC-073 |
| NFR-SEC-101 | **A02: Cryptographic Failures** -- TLS 1.2+, bcrypt/Argon2id hashing, AES-256 at-rest encryption, no sensitive data in logs. | A02:2021 | NFR-SEC-001, NFR-SEC-014, NFR-SEC-090, NFR-SEC-093 |
| NFR-SEC-102 | **A03: Injection** -- Parameterized queries, class-validator input validation, search input sanitization. | A03:2021 | NFR-SEC-040 through NFR-SEC-044 |
| NFR-SEC-103 | **A04: Insecure Design** -- Threat modeling during design phase, security review as part of definition of done. | A04:2021 | Security design review process |
| NFR-SEC-104 | **A05: Security Misconfiguration** -- Security headers, CSP, minimal permissions, no default credentials. | A05:2021 | NFR-SEC-050 through NFR-SEC-055 |
| NFR-SEC-105 | **A06: Vulnerable and Outdated Components** -- Automated dependency scanning, patching SLA. | A06:2021 | NFR-SEC-080 through NFR-SEC-083 |
| NFR-SEC-106 | **A07: Identification and Authentication Failures** -- JWT rotation, account lockout, password policy, MFA readiness. | A07:2021 | NFR-SEC-010 through NFR-SEC-017 |
| NFR-SEC-107 | **A08: Software and Data Integrity Failures** -- Lock files, signed deployments, CI/CD pipeline integrity. | A08:2021 | NFR-SEC-082, CI/CD security |
| NFR-SEC-108 | **A09: Security Logging and Monitoring Failures** -- Audit logging, alerting on anomalous patterns. | A09:2021 | NFR-SEC-094 |
| NFR-SEC-109 | **A10: Server-Side Request Forgery (SSRF)** -- URL validation on any user-provided URLs, deny-list for internal IP ranges. | A10:2021 | Input validation, network policy |

---

## 13. Security Testing

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEC-110 | **Automated security scanning** (SAST) shall be integrated into the CI/CD pipeline using tools such as ESLint security plugins, Semgrep, or SonarQube. | SAST on every build | CI/CD pipeline configuration |
| NFR-SEC-111 | **Dynamic Application Security Testing (DAST)** shall be performed at minimum quarterly using OWASP ZAP or Burp Suite against the staging environment. | Quarterly DAST scan | Scan reports |
| NFR-SEC-112 | **Penetration testing** shall be conducted annually by a qualified third party or internal security team, covering the OWASP Top 10. | Annual pentest | Pentest report |
| NFR-SEC-113 | All **security findings** (Critical/High) from scans and tests shall be remediated before production deployment. Medium findings shall have a remediation plan within 14 days. | Critical/High: block deploy, Medium: 14-day plan | Defect tracking |

---

## 14. Acceptance Criteria Summary

All requirements in this document are considered **met** when:

1. SecurityHeaders.com scan returns Grade A or above.
2. SSL Labs scan returns Grade A or above.
3. Zero critical or high vulnerabilities in dependency scans.
4. Penetration test report shows no unresolved critical or high findings.
5. All authentication and authorization integration tests pass.
6. Rate limiting is verified through automated tests.
7. Audit logs capture all required events with correct data.

---

## 15. References

- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NestJS Security Best Practices](https://docs.nestjs.com/security)
- [Cloudflare WAF Documentation](https://developers.cloudflare.com/waf/)
- [GDPR Technical Requirements](https://gdpr.eu/checklist/)
