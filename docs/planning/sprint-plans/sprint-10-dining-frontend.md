# Sprint 10: Dining Frontend

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 10 |
| **Sprint Name** | Dining Frontend |
| **Duration** | 2 weeks (10 working days) |
| **Dates** | Weeks 19-20 (relative to project start) |
| **Team** | 2 Frontend, 1 Backend (support), 1 QA, 0.5 DevOps |

## Sprint Goal

Deliver the complete dining frontend experience -- a browsable dining landing page with cuisine, district, and price filters; rich restaurant detail pages featuring photo gallery with lightbox, reviews, map, hours, and contact info; special offers and dining news sections; structured data and bookmarks -- providing Berlin residents and visitors with a comprehensive restaurant discovery platform.

---

## User Stories

### US-10.1: Dining Landing Page with Filters
**ID:** US-10.1
**As a** visitor, **I want to** browse restaurants organized by cuisine tabs with additional filters for district and price range **so that** I can find dining options matching my preferences.

**Acceptance Criteria:**
- [ ] Cuisine tabs displayed horizontally (scrollable on mobile) with icons
- [ ] Selecting a cuisine tab filters restaurant list
- [ ] District dropdown filter lists all 12 Berlin districts
- [ ] Price range filter with 4 levels (budget, moderate, upscale, fine dining)
- [ ] Filters combinable (cuisine + district + price)
- [ ] Active filters shown as removable chips
- [ ] URL reflects filter state for shareability
- [ ] Result count updates as filters change
- [ ] "All" tab shows all restaurants (default)

### US-10.2: Restaurant List View
**ID:** US-10.2
**As a** visitor, **I want to** view restaurants in a card-based list **so that** I can quickly scan dining options.

**Acceptance Criteria:**
- [ ] Restaurant card shows: primary image, name, cuisine tags, district, price range indicators, rating (if reviewed)
- [ ] Responsive grid: 3 columns desktop, 2 tablet, 1 mobile
- [ ] Pagination (20 per page) or infinite scroll
- [ ] Sorting: Recommended (default), Newest, A-Z, Price Low-High, Price High-Low
- [ ] Loading skeleton during fetch
- [ ] Empty state when no restaurants match filters
- [ ] Hover effect shows brief description on desktop
- [ ] Cards link to restaurant detail page

### US-10.3: Restaurant Detail Page
**ID:** US-10.3
**As a** visitor, **I want to** view complete restaurant information **so that** I can decide whether to dine there.

**Acceptance Criteria:**
- [ ] Hero section with primary image and restaurant name overlay
- [ ] Info bar: cuisine tags, price range, district, rating
- [ ] "About" section with rich text description
- [ ] Photo gallery section with thumbnails (clicking opens lightbox)
- [ ] Reviews section showing linked editorial reviews with ratings
- [ ] Map section showing restaurant location (Leaflet/OpenStreetMap)
- [ ] "Get Directions" link
- [ ] Opening hours section with current open/closed status indicator
- [ ] Contact section: phone (click-to-call), email, website link
- [ ] Active dining offers section (if any)
- [ ] Breadcrumbs: Home > Dining > [Cuisine] > [Restaurant Name]
- [ ] JSON-LD Restaurant schema markup
- [ ] SSR for SEO

### US-10.4: Photo Gallery with Lightbox
**ID:** US-10.4
**As a** visitor, **I want to** view restaurant photos in a fullscreen lightbox with swipe and zoom **so that** I can see the venue and food in detail.

**Acceptance Criteria:**
- [ ] Gallery section shows thumbnail grid (4 visible + "View all X photos" overlay)
- [ ] Clicking thumbnail opens fullscreen lightbox overlay
- [ ] Lightbox supports left/right navigation (arrows + keyboard)
- [ ] Swipe gestures for mobile navigation
- [ ] Pinch-to-zoom on mobile; scroll-to-zoom on desktop
- [ ] Image counter (e.g., "3 of 12")
- [ ] Close button and ESC key to dismiss
- [ ] Preloads adjacent images for smooth navigation
- [ ] Dark overlay background with subtle blur

### US-10.5: Special Offers Section
**ID:** US-10.5
**As a** visitor, **I want to** see special dining offers **so that** I can discover deals and save money.

**Acceptance Criteria:**
- [ ] "Special Offers" section on dining landing page
- [ ] Offer cards show: restaurant name, offer title, discount/price, valid dates, offer type badge
- [ ] Featured offers displayed in a horizontal carousel
- [ ] "View all offers" link to dedicated offers page
- [ ] Offer detail shows: full description, terms, valid days, restaurant link
- [ ] Expired offers are not displayed

### US-10.6: Dining News Section
**ID:** US-10.6
**As a** visitor, **I want to** read dining-related news and articles **so that** I can stay informed about Berlin's food scene.

**Acceptance Criteria:**
- [ ] "Dining News" section on dining landing page
- [ ] Shows latest 4-6 articles tagged with dining/food category
- [ ] Article cards show: image, title, excerpt, date
- [ ] Cards link to full article page
- [ ] "View all dining news" link to filtered articles page

### US-10.7: Restaurant Bookmarks
**ID:** US-10.7
**As a** logged-in user, **I want to** bookmark restaurants **so that** I can save favorites for later.

**Acceptance Criteria:**
- [ ] Bookmark icon on restaurant cards and detail page
- [ ] Optimistic UI toggle on click
- [ ] Auth check: unauthenticated users see login prompt
- [ ] Bookmarked state persists across page refreshes
- [ ] Bookmarked restaurants accessible from user profile

### US-10.8: Responsive Design
**ID:** US-10.8
**As a** mobile user, **I want to** browse dining options on my phone **so that** I can find restaurants on the go.

**Acceptance Criteria:**
- [ ] Cuisine tabs scroll horizontally on mobile
- [ ] Filter drawer slides in from bottom on mobile
- [ ] Restaurant cards stack vertically on mobile
- [ ] Detail page sections collapse/stack for mobile
- [ ] Gallery lightbox is touch-friendly
- [ ] Opening hours are collapsible on mobile
- [ ] Click-to-call phone number works on mobile
- [ ] All content readable without horizontal scrolling

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Scaffold dining frontend module | Frontend 1 | 3h | Create `/dining` route, layout, shared types/interfaces |
| Build cuisine tabs component | Frontend 1 | 4h | Horizontal scrollable tabs with cuisine icons, API fetch |
| Set up restaurant data hooks | Frontend 2 | 3h | React Query hooks for restaurant list, detail, offers |
| Build district and price range filter components | Frontend 2 | 4h | Dropdown filters, URL state sync |

#### Day 2 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build restaurant card component | Frontend 1 | 4h | Primary image, name, cuisine tags, district, price, rating |
| Build restaurant list grid with pagination | Frontend 1 | 3h | Responsive grid, pagination controls, sorting |
| Build filter bar integration | Frontend 2 | 3h | Combine cuisine tabs + filters, active chips, clear all |
| Build loading skeleton and empty states | Frontend 2 | 2h | Skeleton cards, no results illustration |

#### Day 3 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build restaurant detail page layout | Frontend 1 | 6h | Hero, info bar, about section, breadcrumbs, SSR setup |
| Build photo gallery thumbnail grid | Frontend 2 | 4h | Thumbnail layout, "View all X photos" overlay |
| Backend: Fix any API issues found during integration | Backend | 4h | Address frontend-reported API inconsistencies |

#### Day 4 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build lightbox component - core | Frontend 2 | 6h | Fullscreen overlay, image display, navigation arrows, counter |
| Build opening hours component | Frontend 1 | 3h | Day-by-day display, current open/closed status calculation |
| Build contact section | Frontend 1 | 2h | Phone (click-to-call), email, website link |
| Build reviews section on detail page | Frontend 1 | 3h | Linked editorial reviews with ratings, article links |

#### Day 5 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build lightbox - swipe and zoom | Frontend 2 | 4h | Touch swipe gestures, pinch/scroll zoom, image preloading |
| Build map section on detail page | Frontend 1 | 3h | Embedded Leaflet map, single marker, "Get Directions" |
| Build special offers section - landing page | Frontend 2 | 3h | Offer cards, horizontal carousel, "View all" link |
| QA: Begin test plan creation | QA | 4h | Write test scenarios for dining landing and detail pages |

### Week 2 (Days 6-10)

#### Day 6 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build active offers on restaurant detail | Frontend 1 | 3h | Offer cards within detail page, terms display |
| Build dining news section | Frontend 2 | 4h | Article cards, fetch dining-tagged articles, "View all" link |
| Build bookmark functionality | Frontend 1 | 4h | BookmarkButton on cards + detail, optimistic UI, auth check |
| JSON-LD Restaurant schema implementation | Frontend 2 | 3h | Structured data with schema.org LocalBusiness/Restaurant |

#### Day 7 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| SEO: meta tags, OG tags for dining pages | Frontend 1 | 3h | Dynamic meta per restaurant, social sharing preview |
| Responsive design - dining landing page | Frontend 2 | 4h | Mobile tabs, filter drawer, card layout, offers carousel |
| Responsive design - restaurant detail page | Frontend 1 | 4h | Mobile sections, collapsible hours, stacked layout |
| QA: Test dining landing page | QA | 4h | Cuisine tabs, filters, sorting, pagination |

#### Day 8 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Responsive design - lightbox | Frontend 2 | 3h | Mobile fullscreen, touch gestures, close button positioning |
| Accessibility pass | Frontend 1 | 3h | ARIA labels, keyboard navigation, focus management |
| QA: Test restaurant detail page | QA | 4h | All sections, data accuracy, map, hours |
| QA: Test lightbox component | QA | 3h | Navigation, zoom, swipe, keyboard, close |

#### Day 9 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Bug fixes from QA feedback | Frontend 1 + 2 | 6h | Address P1/P2 bugs |
| E2E test suite: dining landing | QA | 4h | Cypress/Playwright tests for filters, pagination, navigation |
| E2E test suite: restaurant detail | QA | 4h | Tests for detail page, lightbox, bookmarks |
| Performance optimization | Frontend 1 | 2h | Image optimization, code splitting, lazy loading |

#### Day 10 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Final bug fixes | Frontend 1 + 2 | 3h | Resolve remaining issues |
| Cross-browser testing | QA | 3h | Chrome, Firefox, Safari, Edge; iOS, Android |
| Sprint review demo preparation | Frontend 1 | 2h | Demo script, test data |
| Documentation | Frontend 2 | 2h | Component docs, integration notes |

---

## Backend Tasks (Support)

### BE-10.1: API Adjustments and Bug Fixes
- **Sub-tasks:**
  - Fix API response inconsistencies reported by frontend (2h)
  - Add missing query parameters or sorting options (1h)
  - Optimize slow queries found during frontend integration (2h)
  - Add CORS or header configuration if needed (0.5h)
- **Effort:** 5.5 hours

### BE-10.2: Dining News Query
- **Sub-tasks:**
  - Create or extend articles endpoint with dining/food category filter (1.5h)
  - Return latest 6 articles tagged with dining-related categories (0.5h)
- **Effort:** 2 hours

### BE-10.3: Open/Closed Status Helper
- **Sub-tasks:**
  - Add `is_currently_open` computed field to restaurant detail response (1.5h)
  - Handle timezone (Europe/Berlin) and edge cases (overnight hours) (1h)
- **Effort:** 2.5 hours

**Total Backend Effort:** 10 hours

---

## Frontend Tasks

### FE-10.1: Dining Landing Page Scaffold
- **Sub-tasks:**
  - Create `/dining` page route with layout component (1h)
  - Define TypeScript interfaces for Restaurant, DiningOffer, DiningFilter (1h)
  - Set up React Query hooks for restaurant and offer data (1h)
- **Effort:** 3 hours

### FE-10.2: Cuisine Tabs Component
- **Sub-tasks:**
  - Horizontal tab bar with cuisine icons (fetched from API) (2h)
  - Active state styling and scroll behavior on mobile (1h)
  - "All" default tab (0.5h)
  - URL sync for active cuisine (0.5h)
- **Effort:** 4 hours

### FE-10.3: District and Price Filters
- **Sub-tasks:**
  - District dropdown with 12 Berlin districts (1h)
  - Price range filter (4 levels with icons: $, $$, $$$, $$$$) (1h)
  - Active filter chips with remove buttons (1h)
  - Combined filter state management with URL sync (1h)
  - Result count display (0.5h)
- **Effort:** 4.5 hours

### FE-10.4: Restaurant Card Component
- **Sub-tasks:**
  - Card layout: primary image, name, cuisine tags, district, price dots, rating stars (2h)
  - Hover effect with description preview (desktop) (0.5h)
  - Bookmark icon on card (0.5h)
  - Loading skeleton variant (0.5h)
  - Link to detail page (0.5h)
- **Effort:** 4 hours

### FE-10.5: Restaurant List View
- **Sub-tasks:**
  - Responsive grid layout (3/2/1 columns) (1h)
  - Pagination controls with page numbers (1h)
  - Sorting dropdown (Recommended, Newest, A-Z, Price) (1h)
  - Empty state with illustration (0.5h)
  - Integration with filter state and API (1h)
- **Effort:** 4.5 hours

### FE-10.6: Restaurant Detail Page
- **Sub-tasks:**
  - Create `/dining/[slug]` dynamic route with SSR (1h)
  - Hero section with primary image and name overlay (1.5h)
  - Info bar: cuisine tags, price range, district, rating (1h)
  - "About" section with rich text rendering (1h)
  - Breadcrumb navigation (0.5h)
  - Reviews section with editorial review cards and ratings (2h)
  - Map section with Leaflet marker and "Get Directions" (2h)
  - Opening hours with open/closed status indicator (2h)
  - Contact section: click-to-call phone, email link, website (1h)
  - Active dining offers within detail page (2h)
- **Effort:** 14 hours

### FE-10.7: Photo Gallery and Lightbox
- **Sub-tasks:**
  - Gallery thumbnail grid (4 visible + "View all X" overlay) (2h)
  - Lightbox overlay with dark background and blur (1.5h)
  - Image display with proper aspect ratio and centering (1h)
  - Left/right arrow navigation (1h)
  - Keyboard navigation (arrow keys, ESC to close) (0.5h)
  - Image counter display (0.5h)
  - Swipe gesture support for mobile (Hammer.js or custom) (2h)
  - Pinch-to-zoom (mobile) and scroll-to-zoom (desktop) (2h)
  - Adjacent image preloading (1h)
  - Close button and overlay click to dismiss (0.5h)
- **Effort:** 12 hours

### FE-10.8: Special Offers Section
- **Sub-tasks:**
  - Offer card component (restaurant name, title, discount, dates, type badge) (2h)
  - Horizontal carousel on landing page (featured offers) (2h)
  - "View all offers" link (0.5h)
  - Offer detail display (description, terms, valid days, restaurant link) (1.5h)
- **Effort:** 6 hours

### FE-10.9: Dining News Section
- **Sub-tasks:**
  - News article card (image, title, excerpt, date) (1.5h)
  - Section layout with 4-6 cards on landing page (1h)
  - "View all dining news" link to filtered articles (0.5h)
  - API integration with dining-tagged articles (0.5h)
- **Effort:** 3.5 hours

### FE-10.10: Bookmark Functionality
- **Sub-tasks:**
  - BookmarkButton on restaurant cards (1h)
  - BookmarkButton on detail page (0.5h)
  - Optimistic UI toggle with API sync (1h)
  - Auth check with login prompt modal (1h)
  - Bookmark state from API for authenticated users (0.5h)
- **Effort:** 4 hours

### FE-10.11: JSON-LD Restaurant Schema
- **Sub-tasks:**
  - Map restaurant data to schema.org Restaurant/LocalBusiness (1.5h)
  - Include opening hours in structured data (0.5h)
  - Include aggregate rating if available (0.5h)
  - Inject into page head via next/head (0.5h)
  - Validate with Google Rich Results Test (0.5h)
- **Effort:** 3.5 hours

### FE-10.12: SEO and Meta Tags
- **Sub-tasks:**
  - Dynamic page title and meta description per restaurant (1h)
  - Open Graph tags (og:title, og:description, og:image) (1h)
  - Twitter Card tags (0.5h)
  - SSR verification for all dining pages (0.5h)
- **Effort:** 3 hours

### FE-10.13: Responsive Design Pass
- **Sub-tasks:**
  - Dining landing: mobile cuisine tabs, filter drawer, card stack, offers carousel (3h)
  - Restaurant detail: mobile hero, collapsible sections, stacked layout (3h)
  - Lightbox: fullscreen mobile, touch gesture handling (2h)
  - Click-to-call and mobile-friendly contact (0.5h)
  - Test at breakpoints: 320px, 375px, 768px, 1024px, 1440px (1h)
- **Effort:** 9.5 hours

### FE-10.14: Accessibility Pass
- **Sub-tasks:**
  - ARIA labels for interactive elements (1h)
  - Keyboard navigation for lightbox (focus trap, ESC) (1h)
  - Screen reader support for gallery (0.5h)
  - Color contrast verification (0.5h)
- **Effort:** 3 hours

### FE-10.15: Performance Optimization
- **Sub-tasks:**
  - Image lazy loading with next/image (1h)
  - Dynamic import for lightbox component (0.5h)
  - Dynamic import for map component (0.5h)
  - Bundle analysis (0.5h)
  - Lighthouse audit and fixes (0.5h)
- **Effort:** 3 hours

**Total Frontend Effort:** 81.5 hours

---

## DevOps / Infrastructure Tasks

### DEVOPS-10.1: Image CDN Optimization
- **Sub-tasks:**
  - Configure Cloudflare cache rules for restaurant images (0.5h)
  - Set up responsive image serving (srcset) via R2 URLs (1h)
  - Configure image format negotiation (WebP where supported) (0.5h)
- **Effort:** 2 hours

**Total DevOps Effort:** 2 hours

---

## QA Tasks

### QA-10.1: Dining Landing Page Tests
- **Test Scenarios:**
  1. Default view shows all restaurants
  2. Selecting a cuisine tab filters to that cuisine only
  3. District filter narrows to selected district
  4. Price filter shows correct price range restaurants
  5. Combined filters (cuisine + district + price) show intersection
  6. Active filter chips display; removing a chip updates results
  7. "Clear all" resets to default
  8. URL reflects filters; page refresh restores state
  9. Sorting options reorder results correctly
  10. Pagination navigates between pages
  11. Empty state displays when no matches
  12. Special offers section shows featured offers
  13. Dining news section shows recent articles
- **Effort:** 8 hours

### QA-10.2: Restaurant Detail Page Tests
- **Test Scenarios:**
  1. Hero image and restaurant name display correctly
  2. Info bar shows cuisine, price, district, rating
  3. About section renders rich text correctly
  4. Gallery shows thumbnails with correct count
  5. Reviews section shows linked articles with ratings
  6. Map shows correct location with marker
  7. "Get Directions" opens external maps app
  8. Opening hours display for each day
  9. Open/closed status indicator is accurate
  10. Contact links (phone, email, website) function correctly
  11. Active offers display with correct data
  12. Breadcrumbs navigate correctly
  13. Bookmark toggle works (auth/unauth)
  14. JSON-LD validates in Rich Results Test
- **Effort:** 8 hours

### QA-10.3: Lightbox Tests
- **Test Scenarios:**
  1. Clicking thumbnail opens lightbox
  2. Left/right arrows navigate images
  3. Keyboard arrows navigate images
  4. ESC key closes lightbox
  5. Close button closes lightbox
  6. Image counter updates correctly
  7. Swipe left/right navigates on mobile
  8. Pinch-to-zoom works on mobile
  9. Scroll-to-zoom works on desktop
  10. Adjacent images preload (no lag on navigation)
  11. Overlay click (outside image) closes lightbox
  12. Body scroll is locked when lightbox is open
- **Effort:** 6 hours

### QA-10.4: E2E Test Suite
- **Test Scenarios:**
  - Dining landing load and navigation (3 tests)
  - Filter application and URL sync (3 tests)
  - Restaurant detail page content verification (3 tests)
  - Lightbox open/navigate/close (2 tests)
  - Bookmark flow (2 tests)
  - Special offers display (1 test)
- **Effort:** 8 hours

### QA-10.5: Cross-Browser and Responsive Testing
- **Test Scenarios:**
  1. Chrome, Firefox, Safari, Edge on desktop
  2. iOS Safari and Android Chrome on mobile
  3. Responsive breakpoints testing
  4. Touch interactions (swipe, pinch-to-zoom)
  5. Click-to-call on mobile devices
- **Effort:** 4 hours

**Total QA Effort:** 34 hours

---

## Dependencies

| Blocked Task | Depends On | Notes |
|---|---|---|
| FE-10.2 (Cuisine Tabs) | BE: Cuisines API (Sprint 9) | Need cuisines data |
| FE-10.4 (Restaurant Cards) | BE: Restaurant list API (Sprint 9) | Need restaurant data with images |
| FE-10.6 (Detail Page) | BE: Restaurant detail API (Sprint 9) | Need full restaurant data |
| FE-10.7 (Lightbox) | BE: Restaurant images API (Sprint 9) | Need image URLs |
| FE-10.8 (Special Offers) | BE: Dining offers API (Sprint 9) | Need offers data |
| FE-10.9 (Dining News) | BE-10.2 (Dining News Query) | Need dining-tagged articles |
| FE-10.10 (Bookmarks) | BE: Restaurant bookmarks (Sprint 9) | Bookmark API must work for restaurants |
| FE-10.6 (Map Section) | Leaflet setup (Sprint 8) | Map components from events sprint |
| QA-10.4 (E2E) | All FE tasks complete | Tests run against finished features |
| BE-10.3 (Open/Closed) | BE: Restaurant detail API (Sprint 9) | Extends existing endpoint |

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Lightbox performance with large images | Medium | Medium | Lazy load images in lightbox; use medium size for display, large for zoom |
| Touch gesture conflicts (swipe vs scroll) | High | Medium | Use established gesture library (Hammer.js); test on multiple devices |
| Opening hours edge cases (holidays, temporary closures) | Medium | Low | Display hours as provided; add "Hours may vary" disclaimer |
| Gallery component complexity (zoom + swipe + preload) | Medium | High | Consider using proven library (yet-another-react-lightbox) as foundation |
| SEO impact of client-side filtering | Low | Medium | SSR for initial page load; filter changes are client-side with URL updates |
| Restaurant data quality (missing images, incomplete hours) | Medium | Low | Graceful fallbacks: placeholder image, "Hours not available" |

---

## Deliverables Checklist

- [ ] Dining landing page with cuisine tabs
- [ ] District and price range filter dropdowns
- [ ] Active filter chips with clear all
- [ ] Restaurant list view with responsive card grid
- [ ] Pagination and sorting controls
- [ ] Restaurant detail page with all sections
- [ ] Photo gallery thumbnail grid
- [ ] Fullscreen lightbox with swipe and zoom
- [ ] Reviews section with editorial reviews
- [ ] Map section with venue location
- [ ] Opening hours with open/closed indicator
- [ ] Contact section (phone, email, website)
- [ ] Special offers section on landing page
- [ ] Dining offers on restaurant detail page
- [ ] Dining news section
- [ ] JSON-LD Restaurant schema markup
- [ ] Bookmark functionality (cards + detail)
- [ ] SEO meta tags and Open Graph tags
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility compliance
- [ ] E2E test suite (14+ tests)
- [ ] Cross-browser testing complete
- [ ] Performance optimized (Lighthouse > 85)

---

## Definition of Done

- [ ] All user stories meet their acceptance criteria
- [ ] Dining landing page renders server-side for SEO
- [ ] Restaurant detail page renders server-side with JSON-LD
- [ ] Cuisine tabs and filters work individually and combined
- [ ] Lightbox supports keyboard, swipe, and zoom interactions
- [ ] Opening hours correctly show open/closed status in Europe/Berlin timezone
- [ ] Bookmarks persist for authenticated users
- [ ] Responsive design verified at all breakpoints
- [ ] E2E test suite passes in CI
- [ ] Cross-browser testing complete with no P1 bugs
- [ ] Lighthouse Performance score > 85
- [ ] Accessibility audit passes (axe-core)
- [ ] Code reviewed and merged to main branch

---

## Sprint Review Demo Script

1. **Dining Landing Page (3 min)**
   - Open `/dining` and show default "All" cuisine view
   - Click through cuisine tabs (German, Turkish, Vietnamese, Italian)
   - Apply district filter (Kreuzberg) and show filtered results
   - Apply price filter ($$) and show combined filtering
   - Show active filter chips; remove one; clear all
   - Demonstrate sorting options

2. **Restaurant Cards and List (1 min)**
   - Show responsive card grid on desktop
   - Point out card elements: image, name, cuisines, price, rating
   - Navigate pagination

3. **Restaurant Detail Page (4 min)**
   - Click a restaurant card to navigate to detail
   - Walk through hero, info bar, about section
   - Show reviews section with linked articles and ratings
   - Show map with venue marker; click "Get Directions"
   - Show opening hours with open/closed indicator
   - Show contact section; demonstrate click-to-call concept
   - Show active dining offers section

4. **Photo Gallery and Lightbox (3 min)**
   - Show thumbnail grid with "View all X photos" overlay
   - Click to open lightbox
   - Navigate with arrows (keyboard and click)
   - Show image counter
   - Demonstrate zoom (scroll on desktop)
   - Close with ESC key
   - Mobile demo: swipe navigation, pinch-to-zoom

5. **Special Offers and News (2 min)**
   - Show special offers carousel on landing page
   - Click an offer to see details and terms
   - Show dining news section with article cards

6. **Bookmarks (1 min)**
   - Bookmark a restaurant from the card
   - Bookmark from detail page
   - Show login prompt for unauthenticated user

7. **Responsive Demo (2 min)**
   - DevTools responsive mode
   - Mobile: cuisine tabs scroll, filter drawer, stacked cards
   - Mobile: detail page with collapsible hours
   - Mobile: lightbox with touch gestures

---

## Rollover Criteria

A story or task rolls over to Sprint 11 if:
- Backend APIs from Sprint 9 have unresolved bugs blocking frontend work for >2 days
- Lightbox component scope expands beyond planned implementation
- Design revisions require significant rework of completed components
- Critical performance issue requires architectural change

**Candidates for rollover (if needed):**
1. Zoom functionality in lightbox (swipe navigation is higher priority)
2. Dining news section (depends on article tagging quality)
3. Open/closed status indicator (can show hours without status)
