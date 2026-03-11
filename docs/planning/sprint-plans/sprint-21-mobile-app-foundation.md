# Sprint 21: Mobile App Foundation

**Sprint Number:** 21
**Sprint Name:** Mobile App Foundation
**Duration:** 2 weeks (10 working days)
**Dates:** Weeks 41-42 (relative to project start)
**Team Capacity:** ~160 hours (2 mobile/Flutter, 1 backend support, 1 QA)

---

## Sprint Goal

Establish the Flutter mobile application foundation for ILoveBerlin, including clean architecture project setup with BLoC/Riverpod state management, a Dio-based API client with authentication interceptors, complete authentication flows (login, register, social auth, token management with secure storage), bottom navigation shell, deep linking for iOS (Universal Links) and Android (App Links), home screen, news list and article detail screens, offline connectivity indicator, and a solid test foundation with unit, widget, and integration tests.

---

## User Stories

### US-21.1: Flutter Project Setup
**As a** developer, **I want** a well-structured Flutter project **so that** the mobile app codebase is maintainable, testable, and scalable.

**Acceptance Criteria:**
- [ ] Flutter project created with clean architecture layers: presentation, domain, data
- [ ] Feature-based folder structure (auth, home, news, common)
- [ ] BLoC/Riverpod state management configured with dependency injection
- [ ] Environment configuration (dev, staging, production) with flavor support
- [ ] Linting rules configured (flutter_lints or very_good_analysis)
- [ ] CI-ready build configuration for iOS and Android
- [ ] Base theme configured matching ILoveBerlin brand (colors, typography, spacing)
- [ ] Common widgets library (buttons, cards, loading indicators, error widgets)

### US-21.2: API Client & Authentication Interceptors
**As a** developer, **I want** a configured API client with auth interceptors **so that** all API calls are properly authenticated and handle token refresh automatically.

**Acceptance Criteria:**
- [ ] Dio HTTP client configured with base URL, timeouts, and error handling
- [ ] Authentication interceptor attaches JWT access token to all requests
- [ ] Token refresh interceptor: on 401 response, refresh token, retry original request
- [ ] Queue mechanism: if refresh is in progress, queue subsequent requests and replay after refresh
- [ ] Request/response logging interceptor for development
- [ ] Network error handling with user-friendly error types
- [ ] API response models with JSON serialization (json_serializable or freezed)

### US-21.3: Authentication Flow
**As a** user, **I want to** log in, register, and use social authentication **so that** I can access my ILoveBerlin account on mobile.

**Acceptance Criteria:**
- [ ] Login screen with email and password fields, validation, error display
- [ ] Registration screen with name, email, password, confirm password, terms checkbox
- [ ] Social auth buttons: Google Sign-In and Apple Sign-In
- [ ] Access token and refresh token stored in secure storage (flutter_secure_storage)
- [ ] Auto-login on app launch if valid tokens exist
- [ ] Token refresh on expiry (transparent to user)
- [ ] Logout clears all stored tokens and navigates to login
- [ ] "Forgot Password" flow (email input, confirmation message)
- [ ] Form validation with inline error messages
- [ ] Loading states during authentication API calls

### US-21.4: Bottom Navigation Shell
**As a** user, **I want** a bottom navigation bar **so that** I can quickly switch between main sections of the app.

**Acceptance Criteria:**
- [ ] Bottom navigation with 5 tabs: Home, News, Explore, Search, Profile
- [ ] Each tab maintains its own navigation stack (nested navigators)
- [ ] Active tab is visually highlighted with ILoveBerlin theme color
- [ ] Tab state is preserved when switching between tabs
- [ ] Badge indicator on tabs for unread notifications (future)
- [ ] Tapping active tab scrolls to top / pops to root

### US-21.5: Deep Linking
**As a** user, **I want** to open ILoveBerlin links directly in the app **so that** shared content opens in the native experience.

**Acceptance Criteria:**
- [ ] iOS Universal Links configured for iloveberlin.biz domain
- [ ] Android App Links configured for iloveberlin.biz domain
- [ ] Deep link routes: /articles/:slug, /events/:slug, /places/:slug, /store/products/:slug
- [ ] App handles deep links when running (foreground) and when launched via deep link (cold start)
- [ ] Invalid deep links gracefully fall back to the home screen
- [ ] Deep link testing tool/utility for development

### US-21.6: Home Screen
**As a** user, **I want** a home screen with curated content **so that** I can discover the latest from ILoveBerlin.

**Acceptance Criteria:**
- [ ] Hero carousel with featured content (auto-scroll, manual swipe, page indicator)
- [ ] "Latest News" section with horizontal scrollable article cards
- [ ] "Upcoming Events" section with event cards (date, title, venue)
- [ ] "Popular Places" section with place cards (image, name, rating)
- [ ] Pull-to-refresh to reload all sections
- [ ] Loading skeletons for each section
- [ ] Error state with retry button if API fails
- [ ] Smooth scroll performance with lazy image loading

### US-21.7: News List Screen
**As a** user, **I want** to browse news articles **so that** I can stay informed about Berlin.

**Acceptance Criteria:**
- [ ] News list with article cards: image, title, excerpt, author, date, category badge
- [ ] Infinite scroll pagination (load 20 articles per page)
- [ ] Category filter chips at the top (horizontal scroll)
- [ ] Pull-to-refresh
- [ ] Loading skeleton for initial load
- [ ] Empty state ("No articles found")
- [ ] Tap article card navigates to article detail

### US-21.8: Article Detail Screen
**As a** user, **I want** to read a full article **so that** I can consume news content on mobile.

**Acceptance Criteria:**
- [ ] Hero image at the top with back button overlay
- [ ] Article title, author info (avatar, name), publish date
- [ ] Rich text content rendering (headings, paragraphs, bold, italic, links, images, blockquotes)
- [ ] Share button (native share sheet with article URL)
- [ ] Bookmark/save button (persisted locally and via API)
- [ ] Related articles section at the bottom
- [ ] Smooth reading experience with proper typography
- [ ] Back navigation preserves list scroll position

### US-21.9: Offline Indicator
**As a** user, **I want** to know when I am offline **so that** I understand why content might not load.

**Acceptance Criteria:**
- [ ] Connectivity status monitored (connectivity_plus package)
- [ ] Offline banner appears at the top of the screen when connectivity is lost
- [ ] Banner animates in/out smoothly
- [ ] Banner auto-dismisses when connectivity is restored
- [ ] Previously loaded content remains visible when offline
- [ ] API errors during offline show appropriate "You are offline" message instead of generic error

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday) - Project Setup & Architecture
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.1: Create Flutter project with clean architecture | Mobile 1 | 3 | Project scaffolding, folder structure (lib/features, lib/core, lib/shared), clean architecture layers per feature |
| MOB-21.2: Configure environment flavors | Mobile 1 | 2 | Dev, staging, production flavors with separate API URLs, app IDs, icons |
| MOB-21.3: Set up dependency injection | Mobile 2 | 2 | get_it or Riverpod provider setup, service locator pattern, register core services |
| MOB-21.4: Configure linting and code analysis | Mobile 2 | 1 | very_good_analysis or custom lint rules, dart fix integration |
| MOB-21.5: Base theme setup | Mobile 1 | 2 | ILoveBerlin colors, typography (font families, text styles), spacing constants, dark/light theme |
| MOB-21.6: Common widgets library | Mobile 2 | 3 | IlbButton, IlbCard, IlbLoadingIndicator, IlbErrorWidget, IlbAvatar, IlbBadge |

#### Day 2 (Tuesday) - API Client & Networking
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.7: Dio client setup | Mobile 1 | 2 | Base URL configuration per environment, connect/receive timeouts, default headers |
| MOB-21.8: Auth interceptor | Mobile 1 | 3 | Attach Bearer token from secure storage, handle missing token (redirect to login) |
| MOB-21.9: Token refresh interceptor | Mobile 2 | 3 | Intercept 401, refresh token, queue pending requests, replay after refresh, handle refresh failure (logout) |
| MOB-21.10: Logging interceptor | Mobile 2 | 1 | Log request method/URL/headers, response status/time, only in debug mode |
| MOB-21.11: API error handling | Mobile 1 | 2 | Error type hierarchy (NetworkError, ServerError, AuthError, ValidationError), user-friendly messages |
| MOB-21.12: API response models (base) | Mobile 2 | 2 | Base ApiResponse<T> model, PaginatedResponse<T>, json_serializable setup, build_runner config |

#### Day 3 (Wednesday) - Authentication - Backend Support & Login
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-21.1: Verify mobile auth endpoints | Backend | 2 | Ensure login, register, refresh, social auth endpoints work for mobile (no CSRF, proper CORS) |
| BE-21.2: Apple Sign-In server-side validation | Backend | 2 | Validate Apple identity token, create/link user account |
| MOB-21.13: Auth repository (data layer) | Mobile 1 | 2 | AuthRemoteDataSource (API calls), AuthLocalDataSource (secure storage), AuthRepository |
| MOB-21.14: Auth domain layer | Mobile 1 | 1.5 | User entity, AuthState, LoginUseCase, RegisterUseCase, LogoutUseCase |
| MOB-21.15: Auth BLoC/Riverpod state | Mobile 2 | 2.5 | AuthBloc with states (initial, loading, authenticated, unauthenticated, error), events (login, register, logout, checkAuth) |
| MOB-21.16: Login screen UI | Mobile 2 | 3 | Email/password fields, "Login" button, "Forgot Password" link, social auth buttons, "Register" link |

#### Day 4 (Thursday) - Authentication - Register & Social Auth
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.17: Registration screen UI | Mobile 1 | 2.5 | Name, email, password, confirm password fields, terms checkbox, "Register" button |
| MOB-21.18: Form validation mixin | Mobile 1 | 1.5 | Email validation, password strength, required field, confirm match, terms accepted |
| MOB-21.19: Google Sign-In integration | Mobile 2 | 2.5 | google_sign_in package, obtain ID token, send to backend, handle account linking |
| MOB-21.20: Apple Sign-In integration | Mobile 2 | 2.5 | sign_in_with_apple package, obtain identity token, send to backend, handle account linking |
| MOB-21.21: Secure token storage | Mobile 1 | 2 | flutter_secure_storage for access/refresh tokens, encrypted storage, read/write/delete methods |
| MOB-21.22: Auto-login on app launch | Mobile 1 | 1.5 | Check for stored tokens on startup, validate/refresh token, navigate to home or login |
| MOB-21.23: Forgot password flow | Mobile 2 | 1.5 | Email input screen, API call, confirmation message screen |

#### Day 5 (Friday) - Bottom Navigation & Auth Completion
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.24: Bottom navigation shell | Mobile 1 | 3 | 5 tabs (Home, News, Explore, Search, Profile), Material 3 NavigationBar |
| MOB-21.25: Nested navigation per tab | Mobile 1 | 2.5 | Each tab has its own Navigator, back button behavior, preserve tab state |
| MOB-21.26: Logout flow | Mobile 2 | 1.5 | Clear tokens, clear cached data, navigate to login, confirm dialog |
| MOB-21.27: Auth flow integration tests | Mobile 2 | 2.5 | Login success/failure, register success/failure, token refresh, auto-login, logout |
| MOB-21.28: Auth unit tests | Mobile 1 | 2 | AuthRepository, AuthBloc, LoginUseCase, token storage |
| QA-21.1: Auth flow manual testing | QA | 3 | Login, register, Google/Apple sign-in, forgot password, auto-login, logout |

### Week 2 (Days 6-10)

#### Day 6 (Monday) - Deep Linking
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.29: Deep link route configuration | Mobile 1 | 2 | Define deep link routes: /articles/:slug, /events/:slug, /places/:slug, /store/products/:slug |
| MOB-21.30: iOS Universal Links setup | Mobile 1 | 2.5 | apple-app-site-association file, entitlements configuration, Associated Domains |
| MOB-21.31: Android App Links setup | Mobile 2 | 2.5 | assetlinks.json file, intent filters in AndroidManifest.xml, auto-verify |
| MOB-21.32: Deep link handler service | Mobile 2 | 2.5 | Parse incoming deep links, route to correct screen, handle cold start vs foreground |
| MOB-21.33: Deep link fallback (invalid routes) | Mobile 1 | 1 | Gracefully navigate to home screen for unrecognized deep links |
| BE-21.3: Host apple-app-site-association and assetlinks.json | Backend | 1.5 | Serve verification files from /.well-known/ on iloveberlin.biz |

#### Day 7 (Tuesday) - Home Screen
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.34: Home screen data layer | Mobile 1 | 2 | HomeRemoteDataSource (fetch featured, latest news, events, places), HomeRepository |
| MOB-21.35: Home screen BLoC/state | Mobile 1 | 1.5 | HomeBloc with loading/loaded/error states, pull-to-refresh event |
| MOB-21.36: Hero carousel component | Mobile 2 | 3 | PageView with auto-scroll (5s interval), manual swipe, page indicator dots, tap to navigate |
| MOB-21.37: Home section components | Mobile 2 | 2.5 | Horizontal scroll sections: "Latest News", "Upcoming Events", "Popular Places" with "See All" link |
| MOB-21.38: Home screen assembly | Mobile 1 | 2 | Compose sections into scrollable home screen, pull-to-refresh, loading skeletons, error state |
| MOB-21.39: Article card widget | Mobile 2 | 1.5 | Image, title, excerpt, author, date, category badge - reusable across home and news list |

#### Day 8 (Wednesday) - News List & Article Detail
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.40: News list data layer | Mobile 1 | 1.5 | NewsRemoteDataSource (paginated articles, category filter), NewsRepository |
| MOB-21.41: News list BLoC/state | Mobile 1 | 2 | NewsListBloc with pagination, category filter, pull-to-refresh, loading/loaded/error states |
| MOB-21.42: News list screen UI | Mobile 1 | 2.5 | Category filter chips, article card list, infinite scroll, pull-to-refresh, empty state |
| MOB-21.43: Article detail data layer | Mobile 2 | 1.5 | ArticleRemoteDataSource (fetch by slug), ArticleRepository, bookmark API |
| MOB-21.44: Article detail screen UI | Mobile 2 | 3.5 | Hero image, title, author info, rich text content (flutter_widget_from_html or flutter_markdown), share/bookmark buttons |
| MOB-21.45: Related articles section | Mobile 2 | 1.5 | Horizontal scroll of related article cards at bottom of detail screen |

#### Day 9 (Thursday) - Offline Indicator & Polish
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.46: Connectivity monitoring service | Mobile 1 | 1.5 | connectivity_plus integration, stream of connectivity status, debounce rapid changes |
| MOB-21.47: Offline banner widget | Mobile 1 | 2 | Animated banner at top of screen, "No internet connection" message, auto-dismiss on reconnect |
| MOB-21.48: Offline-aware error handling | Mobile 1 | 1.5 | Replace generic API errors with "You are offline" when connectivity is lost, cache previous responses |
| MOB-21.49: Bookmark/save article functionality | Mobile 2 | 2 | Toggle bookmark button, persist via API + local cache, optimistic update |
| MOB-21.50: Share article functionality | Mobile 2 | 1 | Native share sheet with article title and URL (share_plus package) |
| MOB-21.51: Screen transition animations | Mobile 2 | 1.5 | Smooth hero transitions for images, slide transitions for navigation, fade for tab switches |
| MOB-21.52: Skeleton loading widgets | Mobile 1 | 2 | Shimmer skeletons for home sections, news list, article detail |
| QA-21.2: Home screen and navigation testing | QA | 3 | Bottom nav, tab persistence, home screen sections, pull-to-refresh |

#### Day 10 (Friday) - Testing & Final Polish
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| MOB-21.53: Unit tests - API client | Mobile 1 | 2 | Dio interceptors, error handling, token refresh logic |
| MOB-21.54: Unit tests - repositories | Mobile 1 | 1.5 | HomeRepository, NewsRepository, ArticleRepository with mocked data sources |
| MOB-21.55: Widget tests - key screens | Mobile 2 | 2.5 | Login screen, home screen, news list, article detail - test rendering and interaction |
| MOB-21.56: Integration test - auth flow | Mobile 2 | 2 | Full login -> home -> logout flow with mocked API |
| MOB-21.57: Integration test - news browsing | Mobile 1 | 2 | Home -> news list -> article detail -> back, verify navigation and data |
| MOB-21.58: Performance profiling | Mobile 2 | 1.5 | Profile scroll performance, image loading, screen transitions on physical devices |
| QA-21.3: News list and article detail testing | QA | 2 | Pagination, category filter, article rendering, share, bookmark |
| QA-21.4: Deep linking testing | QA | 2 | Test deep links for articles/events/places, cold start and foreground, invalid links |
| QA-21.5: Offline indicator testing | QA | 1.5 | Toggle airplane mode, verify banner, verify cached content, verify recovery |

---

## Backend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| BE-21.1 | Verify mobile auth endpoints | Test login/register/refresh for mobile clients | 2 |
| BE-21.2 | Apple Sign-In server-side | Validate Apple identity token, user creation/linking | 2 |
| BE-21.3 | Deep link verification files | Serve apple-app-site-association and assetlinks.json | 1.5 |
| **Total** | | | **5.5** |

## Mobile/Flutter Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| MOB-21.1-21.6 | Project setup | Architecture, flavors, DI, linting, theme, common widgets | 13 |
| MOB-21.7-21.12 | API client | Dio setup, auth interceptor, refresh interceptor, logging, error handling, models | 13 |
| MOB-21.13-21.23 | Authentication | Data/domain/presentation layers, login, register, social auth, secure storage, auto-login, forgot password | 21.5 |
| MOB-21.24-21.28 | Navigation & auth tests | Bottom nav, nested navigators, logout, unit + integration tests | 11.5 |
| MOB-21.29-21.33 | Deep linking | Route config, iOS Universal Links, Android App Links, handler, fallback | 10.5 |
| MOB-21.34-21.39 | Home screen | Data layer, BLoC, carousel, sections, assembly, article card | 12.5 |
| MOB-21.40-21.45 | News list & article detail | Data layers, BLoCs, list UI, detail UI, related articles | 12.5 |
| MOB-21.46-21.52 | Offline & polish | Connectivity, banner, error handling, bookmark, share, animations, skeletons | 11 |
| MOB-21.53-21.58 | Testing | Unit tests (API, repos), widget tests, integration tests, performance profiling | 11.5 |
| **Total** | | | **117** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---------|------|---------------|-------------|
| QA-21.1 | Auth flow testing | Login valid/invalid credentials; register with validation errors; Google Sign-In; Apple Sign-In; forgot password; auto-login on relaunch; logout | 3 |
| QA-21.2 | Home screen & navigation | Bottom nav tab switching; tab state preservation; home carousel auto-scroll; section scrolling; pull-to-refresh; loading states | 3 |
| QA-21.3 | News & article detail | Article list infinite scroll; category filter; article detail rendering; rich text display; share; bookmark toggle; back preserves scroll | 2 |
| QA-21.4 | Deep linking | Article deep link (cold start); event deep link (foreground); invalid deep link fallback; all supported routes | 2 |
| QA-21.5 | Offline indicator | Airplane mode: banner appears; reconnect: banner dismisses; cached content visible; API errors show offline message | 1.5 |
| **Total** | | | **11.5** |

---

## Dependencies

```
MOB-21.1-21.6 (project setup) --> All other mobile tasks
MOB-21.7-21.12 (API client) --> MOB-21.13-21.23 (auth flow)
MOB-21.7-21.12 (API client) --> MOB-21.34 (home data layer)
MOB-21.7-21.12 (API client) --> MOB-21.40 (news data layer)
MOB-21.13-21.23 (auth flow) --> MOB-21.24-21.25 (bottom nav - needs auth state for conditional routing)
MOB-21.24-21.25 (bottom nav) --> MOB-21.34-21.38 (home screen - needs navigation shell)
MOB-21.24-21.25 (bottom nav) --> MOB-21.29-21.33 (deep linking - needs router)
MOB-21.34-21.39 (home screen) --> MOB-21.40-21.45 (news list/detail - shares article card)
BE-21.1-21.2 (auth endpoints) --> MOB-21.13 (auth data layer)
BE-21.3 (verification files) --> MOB-21.30-21.31 (deep link setup)
Existing backend API (articles, events, places) --> MOB-21.34 (home data layer)
MOB-21.46-21.48 (offline handling) --> MOB-21.48 (integrated into API client error handling)
All screens --> MOB-21.52 (skeleton loading)
All implementation --> MOB-21.53-21.58 (testing)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Apple Sign-In review/configuration delays | Medium | Medium | Start Apple Developer setup on Day 1; have backup plan (email-only auth initially) |
| Deep link verification file hosting issues | Low | Medium | Test apple-app-site-association with Apple's validator; test assetlinks.json with Google's tester |
| Flutter package compatibility issues | Medium | Medium | Pin all package versions; test on both iOS and Android simultaneously |
| Rich text rendering quality for article content | Medium | Medium | Evaluate flutter_widget_from_html and flutter_markdown early; have fallback WebView option |
| Token refresh race condition with multiple simultaneous requests | High | High | Implement request queuing during refresh; use mutex/lock pattern |
| Performance issues with image-heavy home screen | Medium | Medium | Use cached_network_image with memory/disk cache; lazy load off-screen images |
| iOS/Android platform-specific bugs | High | Medium | Test on both platforms daily; maintain platform-specific code in separate files |
| Backend API not returning mobile-optimized responses | Medium | Medium | Coordinate with backend for any needed response adjustments in BE-21.1 |

---

## Deliverables Checklist

- [ ] Flutter project with clean architecture (presentation/domain/data layers)
- [ ] Feature-based folder structure
- [ ] BLoC/Riverpod state management configured
- [ ] Environment flavors (dev, staging, production)
- [ ] ILoveBerlin base theme (light and dark)
- [ ] Common widget library (6+ reusable widgets)
- [ ] Dio API client with base configuration
- [ ] Auth interceptor attaching JWT tokens
- [ ] Token refresh interceptor with request queuing
- [ ] Login screen with email/password
- [ ] Registration screen with validation
- [ ] Google Sign-In integration
- [ ] Apple Sign-In integration
- [ ] Secure token storage (flutter_secure_storage)
- [ ] Auto-login on app launch
- [ ] Forgot password flow
- [ ] Bottom navigation with 5 tabs
- [ ] Nested navigation per tab with state preservation
- [ ] iOS Universal Links configured
- [ ] Android App Links configured
- [ ] Deep link handler for articles, events, places, products
- [ ] Home screen with hero carousel and content sections
- [ ] News list screen with infinite scroll and category filter
- [ ] Article detail screen with rich text rendering
- [ ] Share and bookmark functionality
- [ ] Offline connectivity indicator banner
- [ ] Unit tests for API client, repositories, and BLoCs
- [ ] Widget tests for key screens
- [ ] Integration tests for auth and news browsing flows
- [ ] Performance profiled on physical devices

---

## Definition of Done

1. Flutter project builds and runs on both iOS (16+) and Android (API 24+)
2. Clean architecture layers are properly separated with no cross-layer imports
3. All 3 environment flavors build and connect to correct API endpoints
4. Login, registration, and social auth flows work end-to-end
5. Token refresh is transparent to the user (no unexpected logouts)
6. Auto-login works on app relaunch with valid stored tokens
7. Bottom navigation preserves tab state when switching
8. Deep links open correct content in the app (both cold start and foreground)
9. Home screen loads and displays all sections within 3 seconds on 4G
10. News list infinite scroll loads additional pages correctly
11. Article detail renders rich text content accurately
12. Offline banner appears within 2 seconds of connectivity loss
13. Unit test coverage exceeds 70% for business logic (BLoCs, repositories, use cases)
14. Widget tests cover all key screen layouts
15. Integration tests pass for auth and news browsing flows
16. No jank (consistent 60fps) on scroll and navigation transitions
17. Code reviewed and approved by at least one other developer

---

## Sprint Review Demo Script

1. **Project Architecture** (3 min)
   - Show folder structure and clean architecture layers
   - Show environment flavor switching (dev -> staging)
   - Show theme (ILoveBerlin colors, typography)

2. **Authentication Flow** (5 min)
   - Launch app (fresh install), show login screen
   - Register a new account, show validation
   - Log out, log back in with email/password
   - Demonstrate Google Sign-In
   - Demonstrate Apple Sign-In (on iOS device)
   - Force-kill app, relaunch, show auto-login
   - Show "Forgot Password" flow

3. **Navigation** (3 min)
   - Show bottom navigation with 5 tabs
   - Navigate within Home tab, switch to News tab, switch back (state preserved)
   - Show back button behavior within tabs
   - Tap active tab to scroll to top

4. **Home Screen** (3 min)
   - Show hero carousel with auto-scroll
   - Show "Latest News" horizontal scroll
   - Show "Upcoming Events" section
   - Pull-to-refresh, show loading skeletons
   - Show error state (temporarily disconnect API)

5. **News Browsing** (4 min)
   - Navigate to News tab, show article list
   - Filter by category (tap category chip)
   - Scroll down, show infinite scroll loading more articles
   - Tap an article, show article detail
   - Show rich text content rendering
   - Share the article (native share sheet)
   - Bookmark the article, verify save

6. **Deep Linking** (3 min)
   - Open a deep link URL in browser, show app opening to correct article
   - Kill the app, tap a deep link, show cold start to correct screen
   - Show invalid deep link fallback to home screen

7. **Offline Handling** (2 min)
   - Enable airplane mode, show offline banner appear
   - Try to load content, show "You are offline" message
   - Previously loaded content still visible
   - Disable airplane mode, show banner dismiss

8. **Testing** (2 min)
   - Run unit tests, show pass count
   - Run widget tests, show key screen tests passing
   - Show integration test running on emulator

---

## Rollover Criteria

Tasks may roll over to Sprint 22 if:
- Apple Sign-In requires more than 4 additional hours due to Apple Developer configuration
- Deep linking verification files are not properly served by the backend within 2 days
- Rich text rendering requires WebView fallback (additional 6 hours)
- Token refresh race condition requires more than 3 additional hours to resolve

Tasks that MUST complete in this sprint (no rollover):
- Flutter project setup with clean architecture
- Dio API client with auth interceptor
- Login and registration screens (email/password)
- Secure token storage and auto-login
- Bottom navigation shell
- Home screen with at least 2 sections
- News list screen with basic pagination
- Article detail screen

Deprioritized if time is short:
- Apple Sign-In (implement in next sprint, keep Google Sign-In)
- Deep linking (implement after app store setup)
- Forgot password flow
- Offline indicator
- Related articles section
- Dark theme (keep light theme only)
- Performance profiling (defer to dedicated performance sprint)
