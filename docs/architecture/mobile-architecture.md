# Mobile Architecture

**Platform:** ILoveBerlin (iloveberlin.biz)
**Framework:** Flutter 3+
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [Clean Architecture Layers](#clean-architecture-layers)
2. [Project Structure](#project-structure)
3. [State Management](#state-management)
4. [HTTP Client Layer](#http-client-layer)
5. [Secure Storage](#secure-storage)
6. [Deep Linking](#deep-linking)
7. [Push Notifications](#push-notifications)
8. [Offline Capabilities](#offline-capabilities)
9. [Navigation Structure](#navigation-structure)

---

## Clean Architecture Layers

The Flutter app follows Clean Architecture principles with three distinct layers: Presentation, Domain, and Data. Dependencies flow inward, with the Domain layer having zero dependencies on external frameworks.

```
+=====================================================================+
|                                                                     |
|   PRESENTATION LAYER (UI)                                           |
|                                                                     |
|   +-------------------+  +-------------------+  +---------------+   |
|   |      Pages        |  |     Widgets       |  |   BLoC /      |   |
|   |   (Screens)       |  |  (UI Components)  |  |   Riverpod    |   |
|   +--------+----------+  +--------+----------+  |   Providers   |   |
|            |                       |             +-------+-------+   |
|            |                       |                     |           |
+============|=======================|=====================|===========+
             |                       |                     |
             v                       v                     v
+=====================================================================+
|                                                                     |
|   DOMAIN LAYER (Business Logic)                                     |
|                                                                     |
|   +-------------------+  +-------------------+  +---------------+   |
|   |    Use Cases       |  |     Entities      |  |  Repository   |   |
|   |  (Interactors)     |  |   (Models)        |  |  Interfaces   |   |
|   +--------+----------+  +-------------------+  +-------+-------+   |
|            |                                             |           |
+============|=============================================|===========+
             |                                             |
             v                                             v
+=====================================================================+
|                                                                     |
|   DATA LAYER (Infrastructure)                                       |
|                                                                     |
|   +-------------------+  +-------------------+  +---------------+   |
|   |   Repository      |  |    Data Sources   |  |    Models     |   |
|   |   Implementations |  |  +-------------+  |  |   (DTOs)      |   |
|   |                   |  |  | Remote (API) |  |  |              |   |
|   |                   |  |  +-------------+  |  | JSON          |   |
|   |                   |  |  | Local (Cache)|  |  | Serialization|   |
|   |                   |  |  +-------------+  |  |              |   |
|   +-------------------+  +-------------------+  +---------------+   |
|                                                                     |
+=====================================================================+
```

### Layer Responsibilities

| Layer        | Responsibility                                    | Dependencies           |
| ------------ | ------------------------------------------------- | ---------------------- |
| Presentation | UI rendering, user interaction, state management  | Domain                 |
| Domain       | Business logic, entities, use case definitions     | None (pure Dart)       |
| Data         | API communication, local storage, data mapping     | Domain (interfaces)    |

---

## Project Structure

```
lib/
├── main.dart                           # App entry point
├── app.dart                            # MaterialApp configuration
├── injection_container.dart            # Dependency injection setup
│
├── core/                               # Cross-cutting concerns
│   ├── config/
│   │   ├── app_config.dart             # Environment configuration
│   │   ├── api_config.dart             # API base URL, timeouts
│   │   └── theme_config.dart           # App theme definition
│   ├── constants/
│   │   ├── api_endpoints.dart          # API route constants
│   │   ├── storage_keys.dart           # Local storage key constants
│   │   └── app_constants.dart          # General constants
│   ├── error/
│   │   ├── exceptions.dart             # Custom exception classes
│   │   └── failures.dart               # Failure classes (Either pattern)
│   ├── network/
│   │   ├── dio_client.dart             # Dio HTTP client setup
│   │   ├── api_interceptor.dart        # Auth token interceptor
│   │   ├── error_interceptor.dart      # Error handling interceptor
│   │   ├── cache_interceptor.dart      # Response caching interceptor
│   │   └── network_info.dart           # Connectivity checker
│   ├── storage/
│   │   ├── secure_storage.dart         # flutter_secure_storage wrapper
│   │   └── local_storage.dart          # SharedPreferences wrapper
│   ├── utils/
│   │   ├── date_utils.dart
│   │   ├── string_utils.dart
│   │   └── validators.dart
│   └── widgets/                        # Shared UI widgets
│       ├── app_bar.dart
│       ├── loading_indicator.dart
│       ├── error_widget.dart
│       ├── empty_state.dart
│       ├── cached_image.dart
│       └── pull_to_refresh.dart
│
├── features/                           # Feature modules
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_remote_datasource.dart
│   │   │   │   └── auth_local_datasource.dart
│   │   │   ├── models/
│   │   │   │   ├── login_request_model.dart
│   │   │   │   ├── register_request_model.dart
│   │   │   │   └── auth_response_model.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── auth_tokens.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart    # Abstract interface
│   │   │   └── usecases/
│   │   │       ├── login_usecase.dart
│   │   │       ├── register_usecase.dart
│   │   │       ├── logout_usecase.dart
│   │   │       └── refresh_token_usecase.dart
│   │   └── presentation/
│   │       ├── bloc/                       # or providers/
│   │       │   ├── auth_bloc.dart
│   │       │   ├── auth_event.dart
│   │       │   └── auth_state.dart
│   │       ├── pages/
│   │       │   ├── login_page.dart
│   │       │   ├── register_page.dart
│   │       │   └── forgot_password_page.dart
│   │       └── widgets/
│   │           ├── login_form.dart
│   │           └── social_login_buttons.dart
│   │
│   ├── articles/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── article_remote_datasource.dart
│   │   │   │   └── article_local_datasource.dart
│   │   │   ├── models/
│   │   │   │   ├── article_model.dart
│   │   │   │   └── article_list_response.dart
│   │   │   └── repositories/
│   │   │       └── article_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── article.dart
│   │   │   ├── repositories/
│   │   │   │   └── article_repository.dart
│   │   │   └── usecases/
│   │   │       ├── get_articles_usecase.dart
│   │   │       ├── get_article_detail_usecase.dart
│   │   │       └── get_articles_by_category_usecase.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── article_list_bloc.dart
│   │       │   └── article_detail_bloc.dart
│   │       ├── pages/
│   │       │   ├── article_list_page.dart
│   │       │   └── article_detail_page.dart
│   │       └── widgets/
│   │           ├── article_card.dart
│   │           └── article_content.dart
│   │
│   ├── events/                         # Same structure as articles
│   ├── guides/
│   ├── dining/
│   ├── videos/
│   ├── competitions/
│   ├── classifieds/
│   ├── store/
│   ├── search/
│   ├── profile/
│   └── home/
│       ├── data/ ...
│       ├── domain/ ...
│       └── presentation/
│           ├── bloc/
│           │   └── home_bloc.dart
│           ├── pages/
│           │   └── home_page.dart
│           └── widgets/
│               ├── featured_carousel.dart
│               ├── latest_articles_section.dart
│               ├── upcoming_events_section.dart
│               ├── trending_section.dart
│               └── section_header.dart
│
└── l10n/                               # Localization
    ├── app_en.arb
    └── app_de.arb
```

---

## State Management

The app uses a hybrid approach: **BLoC** (Business Logic Component) for complex feature-level state with well-defined events and states, and **Riverpod** for simpler dependency injection, global state, and reactive data access.

### BLoC Architecture

```
+-----------+       +-----------+       +-----------+
|   UI      | Event |   BLoC    | Call  |  Use Case |
|  (Page/   +------>|           +------>|           |
|   Widget) |       |  Process  |       | Execute   |
|           |<------+  Event,   |<------+ Business  |
|  Rebuild  | State |  Emit     | Result| Logic     |
|   with    |       |  State    |       |           |
|   new     |       |           |       |           |
|   state   |       +-----------+       +-----------+
+-----------+
```

### BLoC Definitions per Feature

| Feature      | BLoC                | Events                                         | States                                    |
| ------------ | ------------------- | ---------------------------------------------- | ----------------------------------------- |
| Auth         | AuthBloc            | LoginRequested, RegisterRequested, LogoutRequested, TokenRefreshRequested | AuthInitial, AuthLoading, Authenticated, Unauthenticated, AuthError |
| Articles     | ArticleListBloc     | LoadArticles, LoadMoreArticles, FilterByCategory | ArticlesInitial, ArticlesLoading, ArticlesLoaded, ArticlesError |
|              | ArticleDetailBloc   | LoadArticleDetail                               | DetailInitial, DetailLoading, DetailLoaded, DetailError |
| Events       | EventListBloc       | LoadEvents, LoadMoreEvents, FilterEvents         | EventsInitial, EventsLoading, EventsLoaded, EventsError |
|              | EventDetailBloc     | LoadEventDetail                                  | Same pattern as articles |
| Dining       | DiningListBloc      | LoadDining, FilterByCuisine, FilterByArea        | DiningInitial, DiningLoading, DiningLoaded, DiningError |
| Store        | ProductListBloc     | LoadProducts, LoadMoreProducts                   | ProductsInitial, ProductsLoading, ProductsLoaded, ProductsError |
|              | CartBloc            | AddToCart, RemoveFromCart, UpdateQuantity, Checkout | CartInitial, CartLoading, CartLoaded, CartError, CheckoutSuccess |
| Search       | SearchBloc          | SearchQueryChanged, FilterChanged, LoadMore      | SearchInitial, SearchLoading, SearchLoaded, SearchError |
| Home         | HomeBloc            | LoadHomeFeed, RefreshHomeFeed                    | HomeInitial, HomeLoading, HomeLoaded, HomeError |

### Riverpod Providers

```
Riverpod Providers (Global / Cross-cutting):
│
├── Dependency Injection:
│   ├── dioClientProvider          # Dio HTTP client instance
│   ├── secureStorageProvider      # FlutterSecureStorage instance
│   ├── connectivityProvider       # Network connectivity stream
│   └── sharedPreferencesProvider  # SharedPreferences instance
│
├── Auth State:
│   ├── authStateProvider          # Stream of auth state changes
│   ├── currentUserProvider        # Current user (derived from auth)
│   └── isAuthenticatedProvider    # Boolean auth check
│
├── App State:
│   ├── themeProvider              # Current theme mode (light/dark)
│   ├── localeProvider             # Current locale (en/de)
│   └── appConfigProvider          # Runtime configuration
│
└── Data Providers:
    ├── categoriesProvider         # Cached list of all categories
    ├── neighborhoodsProvider      # Cached list of Berlin neighborhoods
    └── notificationCountProvider  # Unread notification count
```

---

## HTTP Client Layer

### Dio Configuration

```
Dio Client Setup
│
├── Base Configuration:
│   ├── baseUrl: 'https://iloveberlin.biz/api/v1'
│   ├── connectTimeout: 15 seconds
│   ├── receiveTimeout: 15 seconds
│   ├── sendTimeout: 30 seconds (for uploads)
│   └── headers:
│       ├── Content-Type: application/json
│       ├── Accept: application/json
│       ├── X-Platform: 'mobile'
│       └── X-App-Version: '1.0.0'
│
├── Interceptors (in order):
│   │
│   ├── 1. AuthInterceptor
│   │   ├── onRequest:  Attach Bearer token from secure storage
│   │   ├── onError 401: Attempt token refresh
│   │   │   ├── Success: Retry original request with new token
│   │   │   └── Failure: Emit logout event, navigate to login
│   │   └── Token refresh uses a queue to prevent concurrent refreshes
│   │
│   ├── 2. CacheInterceptor
│   │   ├── onRequest:  Check local cache for GET requests
│   │   │   ├── Online + Fresh cache:  Return cached response
│   │   │   ├── Online + Stale cache:  Proceed to network, update cache
│   │   │   └── Offline + Any cache:   Return cached response
│   │   └── onResponse: Cache successful GET responses with TTL
│   │
│   ├── 3. ErrorInterceptor
│   │   ├── Network errors: Map to ConnectionFailure
│   │   ├── Timeout errors: Map to TimeoutFailure
│   │   ├── 400 errors:    Map to ValidationFailure (with field errors)
│   │   ├── 401 errors:    Handled by AuthInterceptor
│   │   ├── 403 errors:    Map to ForbiddenFailure
│   │   ├── 404 errors:    Map to NotFoundFailure
│   │   ├── 429 errors:    Map to RateLimitFailure (with retry-after)
│   │   └── 5xx errors:    Map to ServerFailure
│   │
│   └── 4. LoggingInterceptor (debug only)
│       ├── onRequest:  Log method, URL, headers
│       ├── onResponse: Log status code, duration
│       └── onError:    Log error details
│
└── Certificate Pinning:
    └── Pin Cloudflare origin certificate for production builds
```

### API Service Pattern

```
// Each feature has a remote data source that uses Dio:

class ArticleRemoteDataSource {
  final Dio dio;

  Future<List<ArticleModel>> getArticles({
    int page = 1,
    int limit = 20,
    String? category,
  });

  Future<ArticleModel> getArticleBySlug(String slug);

  Future<List<ArticleModel>> getArticlesByCategory(String categorySlug);
}

// Repository implementation bridges remote and local data sources:

class ArticleRepositoryImpl implements ArticleRepository {
  final ArticleRemoteDataSource remote;
  final ArticleLocalDataSource local;
  final NetworkInfo networkInfo;

  Future<Either<Failure, List<Article>>> getArticles(params) async {
    if (await networkInfo.isConnected) {
      try {
        final articles = await remote.getArticles(params);
        await local.cacheArticles(articles);      // Cache for offline
        return Right(articles.map((m) => m.toEntity()).toList());
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      }
    } else {
      final cached = await local.getCachedArticles();
      return cached != null
        ? Right(cached.map((m) => m.toEntity()).toList())
        : Left(CacheFailure('No cached data available'));
    }
  }
}
```

---

## Secure Storage

### Token Storage Strategy

```
Storage Layer
│
├── flutter_secure_storage (encrypted)
│   ├── access_token          # JWT access token (15min expiry)
│   ├── refresh_token         # JWT refresh token (7 day expiry)
│   └── user_id               # Current user UUID
│
│   Platform encryption:
│   ├── iOS:     Keychain Services (kSecAttrAccessibleWhenUnlocked)
│   ├── Android: EncryptedSharedPreferences (AES-256-GCM)
│   └── Fallback: AES encryption with device-derived key
│
├── SharedPreferences (unencrypted, non-sensitive)
│   ├── theme_mode            # light / dark / system
│   ├── locale                # en / de
│   ├── onboarding_completed  # Boolean
│   ├── last_sync_timestamp   # ISO 8601 datetime
│   ├── notification_enabled  # Boolean
│   └── search_history        # List<String> (recent searches)
│
└── SQLite / Hive (structured offline cache)
    ├── cached_articles       # Offline article content
    ├── cached_events         # Offline event listings
    ├── cached_guides         # Offline guide content
    └── cached_dining         # Offline restaurant data
```

### Secure Storage Wrapper

```
SecureStorageService
├── saveTokens(accessToken, refreshToken)
├── getAccessToken() -> String?
├── getRefreshToken() -> String?
├── clearTokens()                    # On logout
├── hasValidToken() -> bool          # Check if token exists and not expired
└── Token expiry detection:
    └── Decode JWT payload (without verification)
        to check exp claim client-side
```

---

## Deep Linking

### URL Scheme Configuration

```
Deep Link Routes:
│
├── Universal Links (iOS) / App Links (Android):
│   ├── https://iloveberlin.biz/articles/:slug     -> ArticleDetailPage
│   ├── https://iloveberlin.biz/events/:slug        -> EventDetailPage
│   ├── https://iloveberlin.biz/guides/:slug        -> GuideDetailPage
│   ├── https://iloveberlin.biz/dining/:slug        -> DiningDetailPage
│   ├── https://iloveberlin.biz/classifieds/:id     -> ClassifiedDetailPage
│   ├── https://iloveberlin.biz/store/:slug         -> ProductDetailPage
│   ├── https://iloveberlin.biz/competitions/:slug  -> CompetitionDetailPage
│   └── https://iloveberlin.biz/search?q=:query     -> SearchPage
│
├── Custom Scheme (fallback):
│   └── iloveberlin://                 -> App open
│       ├── /article/:slug
│       ├── /event/:slug
│       └── /...
│
└── Configuration Files:
    ├── iOS:     apple-app-site-association (hosted at /.well-known/)
    ├── Android: assetlinks.json (hosted at /.well-known/)
    └── Flutter:  go_router deep link configuration
```

### Deep Link Handling Flow

```
Deep Link Received
        |
        v
+------------------+
| App Running?     |
+--------+---------+
    YES  |    NO
    |    |    |
    v    |    v
Navigate |  Launch App
to route |      |
    |    |      v
    |    |  Splash Screen
    |    |      |
    |    |      v
    |    |  Check Auth
    |    |      |
    |    |  +---+---+
    |    |  | Auth? |
    |    |  +---+---+
    |    |  YES | NO
    |    |   |  |
    |    |   v  v
    |    |  Navigate to
    |    |  pending route
    v    v       |
 +---------------+
 | Route Handler |
 +-------+-------+
         |
    +----+----+
    | Auth    |
    | Required|
    +----+----+
    NO   |  YES
    |    |   |
    v    |   v
  Show   | Login
  Page   | Screen
         |   |
         |   v
         | On Success
         |   |
         v   v
      Show Page
```

---

## Push Notifications

### Firebase Cloud Messaging (FCM) Setup

```
Push Notification Architecture
│
├── Registration Flow:
│   1. App starts -> Request notification permission
│   2. Get FCM device token
│   3. Send token to backend: POST /api/v1/users/me/device-token
│   4. Backend stores token associated with user ID
│   5. On token refresh -> Update backend
│
├── Notification Types:
│   │
│   ├── Content Notifications:
│   │   ├── new_article      -> "New Article: Berlin's Best Brunch Spots"
│   │   ├── new_event        -> "New Event: Berlin Marathon 2026"
│   │   ├── new_competition  -> "New Competition: Win Tickets to..."
│   │   └── content_update   -> "Article Updated: ..."
│   │
│   ├── User Notifications:
│   │   ├── classified_reply -> "Someone responded to your classified"
│   │   ├── order_update     -> "Your order #1234 has been shipped"
│   │   ├── competition_won  -> "You won the competition!"
│   │   └── event_reminder   -> "Event tomorrow: Berlin Light Festival"
│   │
│   └── System Notifications:
│       ├── maintenance      -> "Scheduled maintenance tonight"
│       └── app_update       -> "New version available"
│
├── Handling:
│   │
│   ├── Foreground:
│   │   └── Show in-app notification banner (non-intrusive)
│   │       └── Tap -> Navigate to relevant screen
│   │
│   ├── Background:
│   │   └── Show system notification
│   │       └── Tap -> Launch app + navigate to relevant screen
│   │
│   └── Terminated:
│       └── Show system notification
│           └── Tap -> Cold start app + navigate to relevant screen
│
└── Topic Subscriptions:
    ├── all_users             # Broadcast notifications
    ├── articles              # New article notifications
    ├── events                # New event notifications
    ├── competitions          # New competition notifications
    └── user_{id}             # User-specific notifications
```

### Notification Payload Structure

```
{
  "notification": {
    "title": "New Article",
    "body": "Berlin's Best Brunch Spots - 2026 Edition"
  },
  "data": {
    "type": "new_article",
    "route": "/articles/berlins-best-brunch-spots-2026",
    "id": "article-uuid",
    "image": "https://cdn.iloveberlin.biz/media/articles/brunch-thumb.webp"
  }
}
```

---

## Offline Capabilities

### Offline Strategy

```
Offline Architecture
│
├── Network Detection:
│   ├── connectivity_plus package
│   ├── Stream-based monitoring
│   └── Debounced to avoid rapid state changes
│
├── Cache-First Strategy (Content):
│   │
│   │   Online                          Offline
│   │   ┌──────────────────┐            ┌──────────────────┐
│   │   │ 1. Fetch from API│            │ 1. Load from     │
│   │   │ 2. Update cache  │            │    local cache   │
│   │   │ 3. Display data  │            │ 2. Display data  │
│   │   │                  │            │ 3. Show offline  │
│   │   │                  │            │    indicator     │
│   │   └──────────────────┘            └──────────────────┘
│   │
│   ├── Cached Content Types:
│   │   ├── Articles       # Full content + images (SQLite)
│   │   ├── Events         # Upcoming events list (SQLite)
│   │   ├── Guides         # Full guide content (SQLite)
│   │   ├── Dining         # Restaurant listings (SQLite)
│   │   └── Images         # Thumbnails via CachedNetworkImage
│   │
│   └── Cache Limits:
│       ├── Articles:  Last 50 articles + all bookmarked
│       ├── Events:    Next 30 days of events
│       ├── Guides:    All guides (relatively stable content)
│       ├── Dining:    Last 100 viewed restaurants
│       └── Images:    100MB cache limit, LRU eviction
│
├── Queue Strategy (User Actions):
│   │
│   │   Actions queued when offline, synced when online:
│   │   ├── Submit classified listing
│   │   ├── Submit event
│   │   ├── Post dining review
│   │   ├── Enter competition
│   │   └── Update profile
│   │
│   │   Queue Implementation:
│   │   ├── Actions serialized to SQLite queue table
│   │   ├── On connectivity restore -> process queue FIFO
│   │   ├── Retry with exponential backoff on failure
│   │   └── Notify user of sync status
│   │
│   └── Not Queued (require online):
│       ├── Login / Register
│       ├── Payment / Checkout
│       └── Media upload
│
└── Offline UI Indicators:
    ├── Persistent banner: "You are offline. Some features may be unavailable."
    ├── Greyed-out actions that require connectivity
    ├── "Cached" badge on content loaded from cache
    └── Sync progress indicator when reconnecting
```

### Local Database Schema (SQLite / Hive)

```
Tables:
├── cached_articles
│   ├── id (PK)
│   ├── slug
│   ├── title
│   ├── excerpt
│   ├── content (full HTML)
│   ├── featured_image_url
│   ├── author_name
│   ├── published_at
│   ├── category
│   └── cached_at (timestamp for staleness check)
│
├── cached_events
│   ├── id (PK)
│   ├── slug
│   ├── title
│   ├── description
│   ├── start_date
│   ├── end_date
│   ├── location
│   ├── image_url
│   ├── category
│   └── cached_at
│
├── offline_queue
│   ├── id (PK, auto-increment)
│   ├── action_type (classified_submit, event_submit, review_post, etc.)
│   ├── payload (JSON serialized)
│   ├── created_at
│   ├── retry_count
│   ├── status (pending, processing, completed, failed)
│   └── error_message (nullable)
│
└── bookmarks
    ├── id (PK)
    ├── content_type (article, event, guide, dining)
    ├── content_id
    ├── title
    └── bookmarked_at
```

---

## Navigation Structure

### Go Router Configuration

```
Navigation Tree (go_router)
│
├── /                                 # Redirect to /home
│
├── /splash                          # Splash screen (check auth, deep links)
│
├── /onboarding                      # First-time user onboarding
│
├── ShellRoute (BottomNavigationBar)
│   │
│   ├── /home                        # Home tab
│   │   ├── /home/articles           # All articles
│   │   │   └── /home/articles/:slug # Article detail
│   │   ├── /home/events             # All events
│   │   │   └── /home/events/:slug   # Event detail
│   │   └── /home/guides             # All guides
│   │       └── /home/guides/:slug   # Guide detail
│   │
│   ├── /discover                    # Discover tab
│   │   ├── /discover/dining         # Dining listings
│   │   │   └── /discover/dining/:slug # Restaurant detail
│   │   ├── /discover/videos         # Video content
│   │   │   └── /discover/videos/:slug # Video detail
│   │   └── /discover/competitions   # Competitions
│   │       └── /discover/competitions/:slug
│   │
│   ├── /search                      # Search tab
│   │   └── /search/results          # Search results
│   │
│   ├── /classifieds                 # Classifieds tab
│   │   ├── /classifieds/:id         # Classified detail
│   │   └── /classifieds/post        # Post new (auth required)
│   │
│   └── /profile                     # Profile tab (auth required)
│       ├── /profile/edit            # Edit profile
│       ├── /profile/classifieds     # My classifieds
│       ├── /profile/orders          # My orders
│       │   └── /profile/orders/:id  # Order detail
│       ├── /profile/bookmarks       # My bookmarks
│       └── /profile/settings        # App settings
│
├── /auth                            # Auth flow (outside shell)
│   ├── /auth/login
│   ├── /auth/register
│   └── /auth/forgot-password
│
└── /store                           # Store (outside main shell)
    ├── /store                       # Product listing
    ├── /store/:slug                 # Product detail
    ├── /store/cart                  # Shopping cart
    └── /store/checkout             # Checkout (auth required)
```

### Bottom Navigation Bar

```
+-------+----------+--------+-------------+---------+
| Home  | Discover | Search | Classifieds | Profile |
|  []   |   <>     |   Q    |    |||      |   ()    |
+-------+----------+--------+-------------+---------+
```

### Navigation Guards

```
Route Protection:
│
├── Unauthenticated routes:
│   ├── /splash, /onboarding, /auth/*
│   └── All content browsing (home, discover, search, classifieds list)
│
├── Authenticated routes (redirect to /auth/login if not logged in):
│   ├── /profile/*
│   ├── /classifieds/post
│   ├── /store/checkout
│   └── Competition entry actions
│
└── Redirect rules:
    ├── Authenticated user visits /auth/* -> redirect to /home
    ├── First launch -> /onboarding (once)
    └── Deep link while unauthenticated for protected route:
        -> /auth/login with returnUrl parameter
        -> On login success, navigate to returnUrl
```
