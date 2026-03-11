# ADR-008: JWT with Refresh Token Rotation for Authentication

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform requires an authentication system that supports multiple clients and use cases:

- **Web application (Next.js)**: Users sign up, log in, and maintain sessions while browsing listings, writing reviews, and managing their profiles.
- **Mobile application (Flutter)**: Users authenticate on iOS and Android, often remaining logged in for weeks or months between active sessions.
- **Social login**: Users expect to sign in with Google, Apple (required for iOS apps with third-party login), and optionally Facebook, without creating a separate account.
- **API access**: The NestJS backend serves both web and mobile clients via a RESTful API. Authentication must work consistently across both clients.
- **Role-based access control**: The platform has distinct user roles -- regular users, business owners (who manage listings), and administrators. Access to endpoints and features must be restricted based on roles.
- **Security**: The platform handles user personal data (profiles, email, location, reviews) and potentially payment information. Authentication must be resistant to common attacks (token theft, replay attacks, CSRF, XSS) and comply with security best practices.
- **Statelessness**: The API should be stateless where possible, avoiding server-side session storage that complicates horizontal scaling.

## Decision

We will implement **JWT (JSON Web Token) based authentication with short-lived access tokens and refresh token rotation**, integrated with social login providers (Google, Apple) via OAuth 2.0 / OpenID Connect.

The authentication flow works as follows:

1. **Login** (email/password or social login) returns a short-lived access token (15 minutes) and a long-lived refresh token (7 days for web, 30 days for mobile).
2. **Access tokens** are JWTs containing the user ID, roles, and expiration. They are sent in the `Authorization: Bearer` header with every API request. The backend validates them without a database lookup (stateless).
3. **Refresh tokens** are opaque tokens stored in the database (hashed). When the access token expires, the client sends the refresh token to obtain a new access token and a new refresh token (rotation).
4. **Refresh token rotation**: Each refresh token is single-use. When used, it is invalidated and replaced with a new one. If a previously used refresh token is presented (indicating potential theft), all refresh tokens for that user are revoked.
5. **Social login**: Google and Apple OAuth flows are handled by the backend. The OAuth provider's ID token is verified, a user record is created or matched, and the platform's own JWT access/refresh tokens are issued.
6. **Logout** invalidates the user's refresh token(s) on the server side. Access tokens remain valid until their short expiration but cannot be renewed.

## Alternatives Considered

| Criterion | JWT + Refresh Token Rotation | Server-side Sessions (Cookie) | OAuth-only (Delegated Auth) | Passport.js Sessions |
|---|---|---|---|---|
| Statelessness | Yes (access token is self-contained) | No (session store required) | Yes (tokens from provider) | No (session store required) |
| Mobile compatibility | Excellent (Bearer token) | Poor (cookie handling is complex) | Limited (tied to provider) | Poor (cookie handling) |
| Horizontal scaling | Easy (no shared state for access token) | Requires shared session store (Redis) | Easy | Requires shared session store |
| Token revocation | Eventual (access token lives until expiry; refresh token revocable immediately) | Immediate (delete session) | Depends on provider | Immediate (delete session) |
| Security (token theft) | Mitigated by short expiry + rotation detection | Session fixation/hijacking risks | Provider handles security | Session fixation/hijacking |
| Social login integration | Clean (exchange OAuth token for platform JWT) | Possible but complex | Native but limiting | Built-in Passport strategies |
| RBAC implementation | Claims in JWT payload | Session data or DB lookup | Provider scopes (limited) | Session data or DB lookup |
| Offline / poor connectivity (mobile) | Good (cached access token works until expiry) | Poor (requires server round-trip) | Provider-dependent | Poor |
| Implementation complexity | Medium (token issuance, rotation logic, storage) | Low (express-session, connect-redis) | Low (delegate to provider) | Low (passport + express-session) |
| Cross-domain / CORS | Simple (Authorization header) | Complex (SameSite, CORS cookies) | Redirect-based (complex) | Complex |
| Token size | ~1 KB (JWT payload) | ~32 bytes (session ID) | Varies by provider | ~32 bytes (session ID) |

### Why not server-side sessions?

Server-side sessions (using cookies with a session ID stored in Redis or PostgreSQL) are the traditional approach and offer immediate revocation -- deleting the session invalidates access instantly. However:

- **Mobile incompatibility**: The Flutter mobile app communicates with the API via HTTP requests. Cookie-based sessions on mobile require manual cookie management (cookie jars), handling of `Set-Cookie` headers, and dealing with platform-specific WebView cookie behavior. Bearer tokens in the `Authorization` header are the standard and simpler approach for mobile API clients.
- **Scaling complexity**: Sessions require a shared session store (Redis) accessible to all API server instances. While the platform already uses Redis (for caching and queues), making it a hard dependency for authentication adds a critical failure point. If Redis is unavailable, no user can authenticate. JWTs can be validated using only the signing key, with no external dependency.
- **Cross-origin complexity**: The web frontend (Next.js) may be served from a different domain or subdomain than the API. Cookie-based sessions require careful `SameSite`, `Secure`, `Domain`, and CORS configuration. Bearer tokens avoid this entirely.

The tradeoff is that JWT access tokens cannot be immediately revoked (they are valid until they expire). The 15-minute expiry window is a deliberately short compromise: short enough to limit damage from a stolen token, long enough to avoid excessive refresh requests.

### Why not OAuth-only (delegated authentication)?

Relying entirely on Google/Apple/Facebook for authentication (no email/password option) would simplify the authentication system. The platform would never handle passwords, and token management would be delegated to the providers. However:

- **User choice**: Not all users have or want to use Google or Apple accounts. Email/password authentication is expected and necessary for accessibility.
- **Provider dependency**: If Google's OAuth service has an outage, or if a provider changes its terms, the platform's authentication is affected. Maintaining an independent authentication path ensures resilience.
- **Limited user control**: The platform cannot enforce its own password policies, MFA requirements, or session management rules if authentication is fully delegated.
- **Token scope mismatch**: OAuth provider tokens are scoped to the provider's resources (e.g., Google profile data). The platform needs its own token with platform-specific claims (user ID, roles, subscription status).

Social login is supported as a convenience alongside email/password, using the "exchange OAuth token for platform JWT" pattern.

### Why not Passport.js with sessions?

Passport.js is a popular authentication middleware for Node.js (and NestJS has a `@nestjs/passport` module). Using Passport.js with session-based authentication is a common pattern. Passport handles the OAuth flow and serializes the user into the session. However, this approach combines the drawbacks of sessions (mobile incompatibility, shared session store, cross-origin complexity) with Passport's specific patterns. The decision is not against Passport.js itself -- Passport strategies (passport-jwt, passport-google-oauth20, passport-apple) are used in the implementation for verifying tokens and handling OAuth flows. The decision is against session-based storage in favor of JWTs.

## Consequences

### Positive

- **Mobile-first compatibility**: Bearer tokens in the `Authorization` header are the standard for mobile API clients. The Flutter app stores tokens securely (iOS Keychain, Android Keystore via flutter_secure_storage) and includes them in every request with no cookie management complexity.
- **Stateless access validation**: The backend validates access tokens by verifying the JWT signature and checking expiration, with no database or Redis lookup. This is fast (microseconds) and has no external dependencies.
- **Horizontal scaling**: API server instances can be added or removed without shared session state. Any server can validate any user's access token using the shared signing key.
- **Refresh token rotation provides security**: Single-use refresh tokens with rotation detection mitigate token theft. If an attacker steals and uses a refresh token, the legitimate user's next refresh attempt (with the now-invalidated token) triggers automatic revocation of all tokens, forcing re-authentication.
- **Social login integration**: The "exchange OAuth ID token for platform JWT" pattern cleanly separates social login from the platform's token management. Adding new social providers (e.g., GitHub, Twitter) requires only a new OAuth strategy without changing the token architecture.
- **Role-based access control**: User roles are encoded in the JWT payload, allowing guards and middleware to check permissions without database queries on every request.
- **Web and mobile consistency**: Both the Next.js frontend and Flutter app use the same token-based authentication flow, simplifying API design and documentation.

### Negative

- **No immediate access token revocation**: A stolen access token remains valid until it expires (up to 15 minutes). For immediate revocation (e.g., banning a user, compromised account), the backend must maintain a token blacklist (checked on each request) or reduce the access token lifetime further, adding complexity.
- **Token storage security (web)**: On the web, JWTs stored in `localStorage` are vulnerable to XSS attacks. Storing them in `httpOnly` cookies mitigates XSS but reintroduces CSRF concerns. The recommended approach is `httpOnly` cookies for the access token on the web (with CSRF protection) and Bearer headers for the mobile app.
- **Refresh token storage responsibility**: Refresh tokens must be stored securely in the database (hashed), and the rotation logic must be implemented correctly. Bugs in rotation detection (false positives) could lock users out; failure to detect reuse leaves a security gap.
- **Token payload size**: JWTs are larger than session IDs (~1 KB vs. ~32 bytes), increasing the size of every HTTP request. This is negligible for most use cases but is a consideration for bandwidth-constrained environments.
- **Implementation complexity**: Implementing refresh token rotation, reuse detection, multi-device token management, and the interaction between email/password and social login flows requires careful design and thorough testing.
- **Clock sensitivity**: JWT expiration validation depends on synchronized clocks between the token issuer and validator. Clock skew between servers can cause premature or delayed token expiration. NTP synchronization must be maintained.

## References

- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [Refresh Token Rotation (Auth0)](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [NestJS Authorization (Guards)](https://docs.nestjs.com/security/authorization)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
