# Frontend Architecture

**Platform:** ILoveBerlin (iloveberlin.biz)
**Framework:** Next.js 14+ (App Router)
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [App Router Structure](#app-router-structure)
2. [Page Rendering Strategies](#page-rendering-strategies)
3. [Component Hierarchy](#component-hierarchy)
4. [State Management](#state-management)
5. [API Client Layer](#api-client-layer)
6. [SEO Component Strategy](#seo-component-strategy)
7. [Tailwind CSS Setup](#tailwind-css-setup)
8. [Code Splitting Approach](#code-splitting-approach)
9. [Performance Budget](#performance-budget)

---

## App Router Structure

The Next.js frontend uses the App Router with nested layouts, route groups, and parallel routes to deliver a structured, performant content platform.

```
app/
├── layout.tsx                          # Root layout (html, body, providers)
├── page.tsx                            # Homepage (ISR)
├── not-found.tsx                       # Custom 404 page
├── error.tsx                           # Global error boundary
├── loading.tsx                         # Global loading skeleton
├── globals.css                         # Tailwind directives + global styles
│
├── (marketing)/                        # Route group: marketing pages
│   ├── layout.tsx                      # Marketing layout (no sidebar)
│   ├── about/
│   │   └── page.tsx                    # About ILoveBerlin (SSG)
│   ├── contact/
│   │   └── page.tsx                    # Contact form (SSG + client)
│   ├── privacy/
│   │   └── page.tsx                    # Privacy policy (SSG)
│   ├── terms/
│   │   └── page.tsx                    # Terms of service (SSG)
│   └── imprint/
│       └── page.tsx                    # Impressum / Legal (SSG)
│
├── (content)/                          # Route group: content pages
│   ├── layout.tsx                      # Content layout (header, sidebar, footer)
│   │
│   ├── articles/
│   │   ├── page.tsx                    # Article listing (ISR 5min)
│   │   ├── [slug]/
│   │   │   └── page.tsx               # Article detail (ISR 10min)
│   │   └── category/
│   │       └── [category]/
│   │           └── page.tsx            # Articles by category (ISR 5min)
│   │
│   ├── guides/
│   │   ├── page.tsx                    # Guide listing (ISR 30min)
│   │   └── [slug]/
│   │       └── page.tsx               # Guide detail (ISR 30min)
│   │
│   ├── events/
│   │   ├── page.tsx                    # Event calendar (ISR 5min)
│   │   ├── [slug]/
│   │   │   └── page.tsx               # Event detail (ISR 5min)
│   │   └── submit/
│   │       └── page.tsx               # Event submission form (SSR, auth)
│   │
│   ├── dining/
│   │   ├── page.tsx                    # Restaurant listing (ISR 15min)
│   │   ├── [slug]/
│   │   │   └── page.tsx               # Restaurant detail (ISR 15min)
│   │   └── neighborhood/
│   │       └── [area]/
│   │           └── page.tsx            # Dining by area (ISR 15min)
│   │
│   ├── videos/
│   │   ├── page.tsx                    # Video listing (ISR 15min)
│   │   └── [slug]/
│   │       └── page.tsx               # Video detail (ISR 15min)
│   │
│   ├── competitions/
│   │   ├── page.tsx                    # Active competitions (ISR 5min)
│   │   └── [slug]/
│   │       └── page.tsx               # Competition detail (SSR, dynamic)
│   │
│   └── classifieds/
│       ├── page.tsx                    # Classified listing (ISR 5min)
│       ├── [id]/
│       │   └── page.tsx               # Classified detail (ISR 5min)
│       ├── post/
│       │   └── page.tsx               # Post classified (SSR, auth)
│       └── category/
│           └── [category]/
│               └── page.tsx            # Classifieds by category (ISR 5min)
│
├── store/
│   ├── layout.tsx                      # Store layout (cart sidebar)
│   ├── page.tsx                        # Product listing (ISR 5min)
│   ├── [slug]/
│   │   └── page.tsx                    # Product detail (ISR 10min)
│   ├── cart/
│   │   └── page.tsx                    # Cart page (SSR, client-heavy)
│   └── checkout/
│       └── page.tsx                    # Checkout (SSR, auth required)
│
├── search/
│   └── page.tsx                        # Search results (SSR, dynamic)
│
├── auth/
│   ├── login/
│   │   └── page.tsx                    # Login form (SSG + client)
│   ├── register/
│   │   └── page.tsx                    # Registration form (SSG + client)
│   ├── forgot-password/
│   │   └── page.tsx                    # Password reset request (SSG + client)
│   └── reset-password/
│       └── page.tsx                    # Password reset form (SSR)
│
├── account/                            # Protected routes (auth required)
│   ├── layout.tsx                      # Account layout (sidebar nav)
│   ├── page.tsx                        # Dashboard (SSR)
│   ├── profile/
│   │   └── page.tsx                    # Edit profile (SSR)
│   ├── classifieds/
│   │   └── page.tsx                    # My classifieds (SSR)
│   ├── orders/
│   │   ├── page.tsx                    # Order history (SSR)
│   │   └── [id]/
│   │       └── page.tsx               # Order detail (SSR)
│   └── settings/
│       └── page.tsx                    # Account settings (SSR)
│
├── admin/                              # Admin panel (admin role required)
│   ├── layout.tsx                      # Admin layout (sidebar, topbar)
│   ├── page.tsx                        # Admin dashboard (SSR)
│   ├── articles/
│   │   ├── page.tsx                    # Manage articles (SSR)
│   │   └── [id]/
│   │       └── page.tsx               # Edit article (SSR)
│   ├── events/
│   │   └── page.tsx                    # Manage events (SSR)
│   ├── classifieds/
│   │   └── page.tsx                    # Moderate classifieds (SSR)
│   ├── users/
│   │   └── page.tsx                    # Manage users (SSR)
│   ├── store/
│   │   ├── products/
│   │   │   └── page.tsx               # Manage products (SSR)
│   │   └── orders/
│   │       └── page.tsx               # Manage orders (SSR)
│   └── media/
│       └── page.tsx                    # Media library (SSR)
│
└── api/                                # Next.js API routes (minimal)
    └── revalidate/
        └── route.ts                    # On-demand ISR revalidation webhook
```

---

## Page Rendering Strategies

Each section of the platform uses the rendering strategy best suited to its content freshness requirements and SEO needs.

### Strategy Matrix

| Section          | Strategy | Revalidation | Rationale                                   |
| ---------------- | -------- | ------------ | ------------------------------------------- |
| Homepage         | ISR      | 300s (5min)  | Mix of latest content, changes moderately   |
| Articles list    | ISR      | 300s (5min)  | New articles published several times daily   |
| Article detail   | ISR      | 600s (10min) | Content rarely changes after publication     |
| Guides list      | ISR      | 1800s (30min)| Guides updated infrequently                  |
| Guide detail     | ISR      | 1800s (30min)| Long-form content, stable                    |
| Events list      | ISR      | 300s (5min)  | Events added frequently, time-sensitive      |
| Event detail     | ISR      | 300s (5min)  | Details may update (venue changes, etc.)     |
| Event submit     | SSR      | N/A          | Requires authentication, dynamic form        |
| Dining list      | ISR      | 900s (15min) | Restaurant data changes infrequently         |
| Dining detail    | ISR      | 900s (15min) | Reviews add dynamically via client-side      |
| Videos list      | ISR      | 900s (15min) | Videos added less frequently                 |
| Competitions     | ISR      | 300s (5min)  | Time-sensitive entry deadlines               |
| Competition detail | SSR    | N/A          | Entry counts, status must be real-time       |
| Classifieds list | ISR      | 300s (5min)  | Listings added frequently                    |
| Classified detail| ISR      | 300s (5min)  | May be marked as sold/expired                |
| Post classified  | SSR      | N/A          | Requires auth, dynamic form                  |
| Store products   | ISR      | 300s (5min)  | Stock levels may change                      |
| Product detail   | ISR      | 600s (10min) | Pricing and stock updates                    |
| Cart             | SSR      | N/A          | Fully dynamic, user-specific                 |
| Checkout         | SSR      | N/A          | User-specific, payment flow                  |
| Search results   | SSR      | N/A          | Query-dependent, cannot pre-render           |
| Auth pages       | SSG      | Build-time   | Static forms, logic runs client-side         |
| Account pages    | SSR      | N/A          | User-specific, requires authentication       |
| Admin pages      | SSR      | N/A          | Dynamic data, requires admin role            |
| Marketing pages  | SSG      | Build-time   | Content changes only at deploy time          |

### ISR Revalidation Flow

```
1. User requests /articles/berlin-wall-history
2. Next.js checks ISR cache:
   ├── FRESH (< 10min old): Serve cached HTML instantly
   ├── STALE (> 10min old): Serve cached HTML, trigger background revalidation
   │   └── Background: Fetch fresh data from NestJS API, rebuild page, update cache
   └── MISS (never built): SSR the page, cache it, serve to user
3. On-demand revalidation:
   └── NestJS webhook -> POST /api/revalidate?path=/articles/berlin-wall-history&secret=xxx
       └── Immediately purges and rebuilds the cached page
```

---

## Component Hierarchy

### Component Organization

```
components/
├── ui/                          # Base UI primitives (design system)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Dropdown.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   ├── Pagination.tsx
│   ├── Avatar.tsx
│   ├── Tabs.tsx
│   └── Tooltip.tsx
│
├── layout/                      # Structural layout components
│   ├── Header.tsx               # Site header with navigation
│   ├── Footer.tsx               # Site footer
│   ├── Sidebar.tsx              # Content sidebar
│   ├── MobileNav.tsx            # Mobile hamburger navigation
│   ├── Breadcrumb.tsx           # Breadcrumb navigation
│   └── Container.tsx            # Max-width content wrapper
│
├── features/                    # Feature-specific compound components
│   ├── articles/
│   │   ├── ArticleCard.tsx      # Article preview card
│   │   ├── ArticleGrid.tsx      # Grid of article cards
│   │   ├── ArticleContent.tsx   # Rich article body renderer
│   │   ├── ArticleMeta.tsx      # Author, date, read time
│   │   └── ArticleSidebar.tsx   # Related articles, tags
│   │
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventCalendar.tsx    # Calendar view component
│   │   ├── EventList.tsx        # List view component
│   │   ├── EventFilters.tsx     # Date, category, area filters
│   │   └── EventSubmitForm.tsx  # Event submission form
│   │
│   ├── dining/
│   │   ├── DiningCard.tsx
│   │   ├── DiningGrid.tsx
│   │   ├── DiningMap.tsx        # Map view with markers
│   │   ├── DiningFilters.tsx    # Cuisine, price, area filters
│   │   ├── ReviewCard.tsx
│   │   └── ReviewForm.tsx
│   │
│   ├── classifieds/
│   │   ├── ClassifiedCard.tsx
│   │   ├── ClassifiedGrid.tsx
│   │   ├── ClassifiedFilters.tsx
│   │   └── ClassifiedPostForm.tsx
│   │
│   ├── store/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx   # Image gallery with zoom
│   │   ├── VariantSelector.tsx
│   │   ├── AddToCartButton.tsx
│   │   ├── CartDrawer.tsx       # Slide-out cart
│   │   ├── CartItem.tsx
│   │   └── CheckoutForm.tsx
│   │
│   ├── search/
│   │   ├── SearchBar.tsx        # Header search with autocomplete
│   │   ├── SearchResults.tsx    # Unified search results
│   │   ├── SearchFilters.tsx    # Content type, date filters
│   │   └── SearchSuggestions.tsx # Autocomplete dropdown
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── AuthGuard.tsx        # Client-side auth protection
│   │
│   └── media/
│       ├── ImageUploader.tsx    # Drag-and-drop image upload
│       ├── MediaGallery.tsx     # Admin media browser
│       └── OptimizedImage.tsx   # next/image wrapper with R2 loader
│
├── seo/                         # SEO components
│   ├── JsonLd.tsx               # JSON-LD structured data
│   ├── OpenGraph.tsx            # Open Graph meta tags
│   └── Canonical.tsx            # Canonical URL management
│
└── providers/                   # Context providers
    ├── AuthProvider.tsx         # Authentication state
    ├── CartProvider.tsx         # Shopping cart state
    ├── ThemeProvider.tsx        # Dark/light mode
    └── ToastProvider.tsx        # Toast notification queue
```

### Component Architecture Pattern

```
Page (Server Component)
│
├── Data Fetching (server-side)
│   └── Fetch from NestJS API
│
├── Layout Components (Server)
│   ├── Header
│   ├── Breadcrumb
│   └── Footer
│
├── Feature Components (Server or Client)
│   ├── Server Components (default)
│   │   ├── ArticleContent     # Render static content
│   │   ├── ArticleMeta        # Display metadata
│   │   └── RelatedArticles    # Fetch and render related
│   │
│   └── Client Components ("use client")
│       ├── SearchBar           # Interactive search
│       ├── EventFilters        # Dynamic filtering
│       ├── AddToCartButton     # Cart interaction
│       ├── ReviewForm          # Form submission
│       └── ImageUploader       # File upload
│
└── UI Primitives (Server or Client, as needed)
    ├── Card, Badge, Button     # Rendered on server when possible
    └── Modal, Dropdown, Toast  # Client-side when interactive
```

---

## State Management

### Zustand Store Architecture

Zustand is used for client-side state management, providing lightweight stores for each domain concern.

```
stores/
├── useAuthStore.ts          # Authentication state
├── useCartStore.ts          # Shopping cart state
├── useSearchStore.ts        # Search query and filters
├── useUIStore.ts            # UI state (modals, sidebars, toasts)
└── usePreferencesStore.ts   # User preferences (theme, language)
```

### Auth Store

```
useAuthStore
├── State:
│   ├── user: User | null
│   ├── accessToken: string | null
│   ├── isAuthenticated: boolean
│   └── isLoading: boolean
├── Actions:
│   ├── login(email, password)       # Authenticate and store tokens
│   ├── register(data)               # Register and auto-login
│   ├── logout()                     # Clear tokens and state
│   ├── refreshToken()               # Refresh access token
│   ├── updateProfile(data)          # Update user profile
│   └── checkAuth()                  # Validate current session
└── Persistence:
    └── Access token in memory, refresh token in httpOnly cookie
```

### Cart Store

```
useCartStore
├── State:
│   ├── items: CartItem[]
│   ├── totalItems: number
│   ├── totalPrice: number
│   ├── isOpen: boolean (drawer)
│   └── isLoading: boolean
├── Actions:
│   ├── addItem(productId, variantId, quantity)
│   ├── removeItem(itemId)
│   ├── updateQuantity(itemId, quantity)
│   ├── clearCart()
│   ├── toggleDrawer()
│   └── syncWithServer()             # Sync cart on login
└── Persistence:
    ├── Guest: localStorage
    └── Authenticated: Server-side (PostgreSQL) via API
```

### Search Store

```
useSearchStore
├── State:
│   ├── query: string
│   ├── filters: { type, category, dateRange, area }
│   ├── results: SearchResult[]
│   ├── suggestions: string[]
│   ├── isLoading: boolean
│   └── totalResults: number
├── Actions:
│   ├── setQuery(query)
│   ├── setFilter(key, value)
│   ├── search()                     # Execute search via API
│   ├── fetchSuggestions(query)      # Autocomplete
│   └── clearFilters()
└── Debouncing:
    └── Autocomplete debounced at 200ms
```

---

## API Client Layer

### Axios Instance Configuration

```
lib/
├── api/
│   ├── client.ts                # Axios instance with interceptors
│   ├── endpoints.ts             # API endpoint constants
│   ├── types.ts                 # API response types
│   └── services/
│       ├── auth.api.ts          # Auth API calls
│       ├── articles.api.ts      # Article API calls
│       ├── events.api.ts        # Event API calls
│       ├── dining.api.ts        # Dining API calls
│       ├── classifieds.api.ts   # Classified API calls
│       ├── store.api.ts         # Store API calls
│       ├── search.api.ts        # Search API calls
│       ├── media.api.ts         # Media API calls
│       └── admin.api.ts         # Admin API calls
```

### Client Configuration

```
Axios Instance (client.ts)
│
├── Base URL:
│   ├── Server-side: http://nestjs:4000/api/v1  (internal Docker network)
│   └── Client-side: /api/v1                    (proxied through Next.js/Nginx)
│
├── Default Headers:
│   ├── Content-Type: application/json
│   └── Accept: application/json
│
├── Request Interceptor:
│   ├── Attach Bearer token from auth store (client-side)
│   ├── Attach Bearer token from cookie (server-side)
│   └── Add X-Request-ID for tracing
│
├── Response Interceptor:
│   ├── Extract data from ApiResponseDto envelope
│   ├── Handle 401: Attempt token refresh, retry original request
│   ├── Handle 403: Redirect to unauthorized page
│   ├── Handle 429: Show rate limit toast
│   └── Handle 5xx: Show generic error toast
│
└── Timeout: 15 seconds (client), 10 seconds (server)
```

### Server-Side vs. Client-Side Fetching

```
Server Components (SSR/ISR):
├── Use fetch() with Next.js caching extensions
│   fetch(url, {
│     next: { revalidate: 300 },        // ISR: revalidate every 5min
│     headers: { Authorization: ... }    // Forward auth from cookie
│   })
├── Benefits:
│   ├── Automatic request deduplication
│   ├── Built-in ISR cache integration
│   └── No client-side JavaScript required
└── Used for: Page data, initial loads, SEO content

Client Components:
├── Use Axios instance via API service functions
├── Benefits:
│   ├── Token refresh interceptor
│   ├── Optimistic updates
│   └── Real-time user interactions
└── Used for: Form submissions, cart operations, search, auth
```

---

## SEO Component Strategy

### Metadata API (App Router)

Each page exports a `generateMetadata` function that produces page-specific meta tags.

```
Metadata Generation Pattern:
│
├── Static pages (SSG):
│   └── Export const metadata = { title, description, ... }
│
├── Dynamic pages (ISR/SSR):
│   └── Export async function generateMetadata({ params }) {
│       const article = await fetchArticle(params.slug)
│       return {
│         title: `${article.title} | ILoveBerlin`,
│         description: article.excerpt,
│         openGraph: {
│           title: article.title,
│           description: article.excerpt,
│           images: [article.featuredImage],
│           type: 'article',
│           publishedTime: article.publishedAt,
│           authors: [article.author.name],
│         },
│         twitter: {
│           card: 'summary_large_image',
│           title: article.title,
│           description: article.excerpt,
│           images: [article.featuredImage],
│         },
│         alternates: {
│           canonical: `https://iloveberlin.biz/articles/${params.slug}`,
│         },
│       }
│   }
│
└── Root Layout metadata:
    ├── title: { template: '%s | ILoveBerlin', default: 'ILoveBerlin - Your Berlin Guide' }
    ├── description: 'Your essential guide to Berlin...'
    ├── metadataBase: new URL('https://iloveberlin.biz')
    ├── robots: { index: true, follow: true }
    └── icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' }
```

### JSON-LD Structured Data

```
Content Type       Schema.org Type        Key Properties
──────────────────────────────────────────────────────────────
Homepage           WebSite                name, url, searchAction
Article            Article                headline, author, datePublished, image
Guide              TouristAttraction      name, description, geo
Event              Event                  name, startDate, location, offers
Dining             Restaurant             name, address, servesCuisine, review
Video              VideoObject            name, description, thumbnailUrl
Product            Product                name, offers, image, review
Classified         Offer                  name, price, availability
Organization       Organization           name, logo, sameAs (social links)
Breadcrumb         BreadcrumbList         itemListElement
```

### Sitemap Generation

```
app/sitemap.ts
├── Static routes:    /, /about, /contact, /privacy, /terms
├── Article routes:   Fetched from API, sorted by lastmod
├── Guide routes:     Fetched from API
├── Event routes:     Active and upcoming events only
├── Dining routes:    All active listings
├── Classified routes: Active listings only
├── Store routes:     All active products
├── Change frequencies and priorities set per section
└── Generated at build time, refreshed via ISR
```

---

## Tailwind CSS Setup

### Configuration

```
tailwind.config.ts
│
├── Theme Extensions:
│   ├── Colors:
│   │   ├── primary:    Berlin-inspired palette (blue/teal spectrum)
│   │   │   ├── 50:  '#f0f9ff'
│   │   │   ├── 100: '#e0f2fe'
│   │   │   ├── 500: '#0891b2'  (brand primary)
│   │   │   ├── 600: '#0e7490'
│   │   │   └── 900: '#164e63'
│   │   ├── secondary: Warm accent (amber)
│   │   │   └── 500: '#f59e0b'
│   │   ├── neutral:   Gray scale for text/backgrounds
│   │   └── error/success/warning: Semantic colors
│   │
│   ├── Fonts:
│   │   ├── sans: ['Inter', 'system-ui', 'sans-serif']
│   │   ├── heading: ['Plus Jakarta Sans', 'sans-serif']
│   │   └── mono: ['JetBrains Mono', 'monospace']
│   │
│   ├── Spacing:
│   │   └── Extended with container-specific values
│   │
│   ├── Screens:
│   │   ├── sm:  '640px'
│   │   ├── md:  '768px'
│   │   ├── lg:  '1024px'
│   │   ├── xl:  '1280px'
│   │   └── 2xl: '1440px'
│   │
│   └── Container:
│       ├── center: true
│       └── padding: { DEFAULT: '1rem', lg: '2rem' }
│
├── Plugins:
│   ├── @tailwindcss/typography    # Prose styling for articles/guides
│   ├── @tailwindcss/forms         # Form input styling
│   ├── @tailwindcss/aspect-ratio  # Responsive media
│   └── tailwindcss-animate        # Animation utilities
│
└── Content paths:
    └── ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']
```

### CSS Architecture

```
globals.css
├── @tailwind base;
│   └── @layer base {
│       html { @apply scroll-smooth; }
│       body { @apply bg-white text-neutral-900 antialiased; }
│       h1   { @apply font-heading text-3xl font-bold; }
│       h2   { @apply font-heading text-2xl font-semibold; }
│       h3   { @apply font-heading text-xl font-semibold; }
│   }
│
├── @tailwind components;
│   └── @layer components {
│       .btn-primary  { @apply bg-primary-500 text-white px-4 py-2 rounded-lg ...; }
│       .btn-secondary{ @apply bg-secondary-500 text-white px-4 py-2 rounded-lg ...; }
│       .card         { @apply bg-white rounded-xl shadow-sm border border-neutral-100 ...; }
│       .input        { @apply border border-neutral-300 rounded-lg px-3 py-2 ...; }
│       .badge        { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ...; }
│   }
│
└── @tailwind utilities;
    └── @layer utilities {
        .text-balance { text-wrap: balance; }
        .animation-delay-200 { animation-delay: 200ms; }
    }
```

---

## Code Splitting Approach

### Automatic Code Splitting

Next.js App Router automatically splits code at the route level. Each page produces its own JavaScript bundle, loaded only when the user navigates to that route.

```
Route-Based Splitting (automatic):
├── /                -> homepage chunk (~30KB gzipped)
├── /articles        -> articles chunk (~25KB)
├── /articles/[slug] -> article-detail chunk (~20KB)
├── /events          -> events chunk (~35KB, includes calendar)
├── /store           -> store chunk (~40KB, includes cart logic)
├── /admin           -> admin chunk (~60KB, loaded only for admins)
└── Each chunk loads independently on navigation
```

### Dynamic Imports for Heavy Components

```
Lazily Loaded Components:
│
├── EventCalendar (react-big-calendar)
│   const EventCalendar = dynamic(() => import('@/components/features/events/EventCalendar'), {
│     loading: () => <CalendarSkeleton />,
│     ssr: false
│   })
│
├── DiningMap (Leaflet / Mapbox)
│   const DiningMap = dynamic(() => import('@/components/features/dining/DiningMap'), {
│     loading: () => <MapSkeleton />,
│     ssr: false
│   })
│
├── RichTextEditor (Admin article editor)
│   const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
│     loading: () => <EditorSkeleton />,
│     ssr: false
│   })
│
├── ProductGallery (image zoom/lightbox)
│   const ProductGallery = dynamic(() => import('@/components/features/store/ProductGallery'), {
│     loading: () => <GallerySkeleton />
│   })
│
└── CheckoutForm (Stripe Elements)
    const CheckoutForm = dynamic(() => import('@/components/features/store/CheckoutForm'), {
      loading: () => <CheckoutSkeleton />,
      ssr: false
    })
```

### Third-Party Library Strategy

```
Library                  Size     Loading Strategy         Used In
─────────────────────────────────────────────────────────────────────
React                    ~45KB    Framework (always)       All pages
Zustand                  ~3KB     Framework (always)       All pages
Axios                    ~14KB    Framework (always)       All pages
Tailwind (runtime)       0KB      Build-time only          All pages
date-fns                 ~8KB     Tree-shaken imports      Events, Articles
react-big-calendar       ~50KB    Dynamic import           Events page only
leaflet                  ~40KB    Dynamic import           Dining map only
@stripe/stripe-js        ~30KB    Dynamic import           Checkout only
sharp (server)           N/A      Server-side only         Image processing
react-hook-form          ~9KB     Bundle with forms        Forms
zod                      ~12KB    Bundle with forms        Form validation
```

---

## Performance Budget

| Metric               | Target        | Strategy                              |
| -------------------- | ------------- | ------------------------------------- |
| FCP (First Contentful Paint) | < 1.5s | SSR/SSG, font preloading, CDN         |
| LCP (Largest Contentful Paint) | < 2.5s | Optimized images, priority hints    |
| CLS (Cumulative Layout Shift) | < 0.1  | Image dimensions, font display swap |
| TTI (Time to Interactive) | < 3.5s    | Code splitting, lazy hydration        |
| Total Page JS        | < 150KB gz    | Dynamic imports, tree shaking         |
| Total Page CSS        | < 30KB gz    | Tailwind purging, minimal CSS         |
| Image (hero)         | < 200KB       | WebP/AVIF, responsive srcset          |
| API response (p95)   | < 200ms       | Redis cache, query optimization       |
