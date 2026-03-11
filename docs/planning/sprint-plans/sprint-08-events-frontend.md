# Sprint 8: Events Frontend

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 8 |
| **Sprint Name** | Events Frontend |
| **Duration** | 2 weeks (10 working days) |
| **Dates** | Weeks 15-16 (relative to project start) |
| **Team** | 2 Frontend, 1 Backend, 1 QA, 0.5 DevOps |

## Sprint Goal

Deliver a fully functional, responsive events experience for end users -- including browsable/filterable event listings, an interactive map view powered by Leaflet and OpenStreetMap, rich event detail pages with calendar integration and structured data, and bookmarks -- enabling Berlin residents and visitors to discover, explore, and save local events.

---

## User Stories

### US-8.1: Event Listing with Date Tabs
**ID:** US-8.1
**As a** visitor, **I want to** browse events organized by date tabs (Today, Tomorrow, This Weekend, This Week, Next Week, Pick a Date) **so that** I can quickly find events relevant to my schedule.

**Acceptance Criteria:**
- [ ] Date tabs are displayed horizontally with active state indicator
- [ ] Selecting a tab fetches and displays events for that date range
- [ ] "Pick a Date" opens a date picker component
- [ ] Default tab is "Today" on page load
- [ ] Tab state is reflected in the URL query parameter
- [ ] Empty state is shown when no events match the selected date

### US-8.2: Event Category and District Filters
**ID:** US-8.2
**As a** visitor, **I want to** filter events by category and Berlin district **so that** I can narrow results to my interests and location.

**Acceptance Criteria:**
- [ ] Category filter dropdown lists all event categories from the API
- [ ] District filter dropdown lists all 12 Berlin districts
- [ ] Filters can be combined (category + district + date tab)
- [ ] Active filters are shown as removable chips
- [ ] URL updates to reflect active filters for shareability
- [ ] "Clear all filters" button resets to default state
- [ ] Result count updates in real time as filters change

### US-8.3: Event List View
**ID:** US-8.3
**As a** visitor, **I want to** view events in a card-based list layout **so that** I can scan event details efficiently.

**Acceptance Criteria:**
- [ ] Each event card shows: image, title, date/time, venue, district, category badge
- [ ] Cards are displayed in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- [ ] Pagination or infinite scroll loads additional events (20 per page)
- [ ] Sorting options: Date (default), Recently Added, Alphabetical
- [ ] Loading skeleton displayed during fetch
- [ ] Cards link to event detail page

### US-8.4: Event Map View
**ID:** US-8.4
**As a** visitor, **I want to** view events on an interactive map **so that** I can discover events near a specific location.

**Acceptance Criteria:**
- [ ] Toggle between List View and Map View with a segmented control
- [ ] Map renders using Leaflet with OpenStreetMap tiles
- [ ] Map centers on Berlin (52.52, 13.405) with appropriate zoom level
- [ ] Event markers are clustered when zoomed out (MarkerClusterGroup)
- [ ] Clicking a marker shows a popup with event summary and link to detail
- [ ] Map respects all active filters (date, category, district)
- [ ] Geo-bounding-box query fires on map pan/zoom to load visible events
- [ ] "Search this area" button appears after map movement
- [ ] Map view is hidden on mobile; replaced with a "Show Map" expandable

### US-8.5: Event Detail Page
**ID:** US-8.5
**As a** visitor, **I want to** view complete event information on a dedicated page **so that** I can decide whether to attend.

**Acceptance Criteria:**
- [ ] Page displays: hero image, title, date/time, venue name + address, description (rich text), category, price/free badge, organizer info
- [ ] Embedded map shows venue location with a single marker
- [ ] "Get Directions" link opens Google Maps/Apple Maps
- [ ] Breadcrumb navigation: Home > Events > [Category] > [Event Title]
- [ ] SEO: page title, meta description, Open Graph tags populated
- [ ] JSON-LD Event schema markup included in page head
- [ ] Page is server-side rendered for SEO

### US-8.6: Add to Calendar
**ID:** US-8.6
**As a** visitor, **I want to** add an event to my personal calendar **so that** I am reminded to attend.

**Acceptance Criteria:**
- [ ] "Add to Calendar" button is visible on event detail page
- [ ] Clicking generates and downloads an .ics file with correct VEVENT data
- [ ] .ics includes: summary, description, start/end datetime, location, URL
- [ ] Timezone is set to Europe/Berlin
- [ ] Works on desktop and mobile browsers
- [ ] Alternative: dropdown with Google Calendar, Outlook, Apple Calendar links

### US-8.7: Event Bookmarks
**ID:** US-8.7
**As a** logged-in user, **I want to** bookmark events **so that** I can save them for later reference.

**Acceptance Criteria:**
- [ ] Bookmark icon (heart/star) displayed on event cards and detail page
- [ ] Clicking toggles bookmark state with optimistic UI update
- [ ] Bookmark persists via API call to backend bookmarks endpoint
- [ ] Unauthenticated users see a login prompt on click
- [ ] Bookmarked events accessible from user profile/bookmarks page
- [ ] Bookmark count is visible to the user

### US-8.8: Related Events
**ID:** US-8.8
**As a** visitor, **I want to** see related events on an event detail page **so that** I can discover similar activities.

**Acceptance Criteria:**
- [ ] "Related Events" section shows 4-6 events below main content
- [ ] Related events share the same category or venue
- [ ] Related events are in the future (not past events)
- [ ] Each related event is displayed as a compact card
- [ ] Cards link to their respective detail pages

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Optimize event database indexes | Backend | 4h | Add composite indexes for date range + category + district queries; add spatial index for geo queries |
| Implement geo-bounding-box query endpoint | Backend | 4h | `GET /api/events?bbox=sw_lat,sw_lng,ne_lat,ne_lng` with validation |
| Scaffold events frontend module | Frontend 1 | 4h | Create `/events` route, layout component, shared types/interfaces |
| Set up Leaflet and OpenStreetMap integration | Frontend 2 | 4h | Install react-leaflet, configure tile provider, create base Map component |

#### Day 2 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Add related events endpoint | Backend | 4h | `GET /api/events/:id/related` returning events by same category/venue |
| Build .ics file generation utility | Backend | 3h | Service to generate valid iCalendar files with VEVENT data |
| Build date tabs component | Frontend 1 | 4h | Horizontal scrollable tabs with date range calculation logic |
| Build category and district filter dropdowns | Frontend 1 | 4h | Fetch categories/districts from API, multi-select dropdowns, URL sync |

#### Day 3 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Implement Add to Calendar endpoint | Backend | 3h | `GET /api/events/:id/calendar` returning .ics file download |
| Google/Outlook/Apple calendar link generation | Backend | 2h | Generate deep links for each calendar provider |
| Build event list view with cards | Frontend 1 | 6h | Responsive grid, event card component, skeleton loading |
| Build map view with markers and clustering | Frontend 2 | 6h | Marker rendering, MarkerClusterGroup, popup component |

#### Day 4 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Backend: performance test date range + filter queries | Backend | 4h | EXPLAIN ANALYZE on complex queries, optimize slow paths |
| Wire list view to API with pagination | Frontend 1 | 4h | useSWR/React Query, pagination controls, sorting dropdown |
| Wire map view to geo-bounding-box API | Frontend 2 | 4h | Fetch on map move, "Search this area" button, debounced fetch |
| Build filter chips and "Clear all" logic | Frontend 1 | 3h | Active filter display, removal, URL state management |

#### Day 5 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Integrate list/map view toggle | Frontend 1 + 2 | 4h | Segmented control, shared filter state, view persistence |
| Build date picker component | Frontend 1 | 3h | Calendar date picker for "Pick a Date" tab |
| Build event card bookmark button | Frontend 2 | 3h | Heart/star icon, optimistic toggle, auth check |
| QA: Begin test plan creation | QA | 4h | Write test scenarios for events landing, filters, map |

### Week 2 (Days 6-10)

#### Day 6 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build event detail page layout | Frontend 1 | 6h | Hero image, info sections, rich text description, breadcrumbs |
| Build embedded map on detail page | Frontend 2 | 3h | Single marker map, "Get Directions" link |
| Implement JSON-LD Event schema | Frontend 2 | 3h | Structured data component, server-side injection |
| QA: Test events landing page | QA | 4h | Date tabs, filter combinations, empty states |

#### Day 7 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build Add to Calendar UI | Frontend 1 | 4h | Button with dropdown, .ics download, calendar provider links |
| Build related events section | Frontend 2 | 4h | Compact card grid, API integration |
| Bookmark functionality on detail page | Frontend 1 | 3h | Bookmark toggle, login prompt for unauthenticated users |
| QA: Test map view | QA | 4h | Marker clustering, popup links, geo-bounding-box loading |

#### Day 8 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Responsive design pass - events landing | Frontend 1 | 4h | Mobile layout, filter drawer, tab scrolling |
| Responsive design pass - event detail | Frontend 2 | 4h | Mobile hero, collapsible sections, map behavior |
| SEO: meta tags, OG tags, SSR verification | Frontend 2 | 3h | Dynamic meta per event, social sharing preview |
| QA: Test event detail page | QA | 4h | All sections, calendar download, related events |

#### Day 9 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Fix bugs from QA feedback | Frontend 1 + 2 | 6h | Address all P1/P2 bugs from QA rounds |
| E2E test suite: events landing | QA | 4h | Cypress/Playwright tests for date tabs, filters, pagination |
| E2E test suite: event detail | QA | 4h | Cypress/Playwright tests for detail page, calendar, bookmarks |
| Performance optimization | Frontend 1 | 2h | Image lazy loading, bundle analysis, code splitting |

#### Day 10 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Final bug fixes | Frontend 1 + 2 | 3h | Resolve remaining QA issues |
| Cross-browser testing | QA | 3h | Chrome, Firefox, Safari, Edge; iOS Safari, Android Chrome |
| Sprint review demo preparation | Frontend 1 | 2h | Prepare demo script and test data |
| Documentation and handoff notes | Backend | 2h | API docs, component docs, known issues |

---

## Backend Tasks

### BE-8.1: Optimize Event Database Indexes
- **Sub-tasks:**
  - Add composite index on `events(start_date, category_id, district_id)` (1h)
  - Add composite index on `events(start_date, status)` for active event queries (1h)
  - Add PostGIS spatial index on `events(latitude, longitude)` or create geometry column (1.5h)
  - Run EXPLAIN ANALYZE on top 5 query patterns and verify index usage (0.5h)
- **Effort:** 4 hours

### BE-8.2: Geo-Bounding-Box Query Endpoint
- **Sub-tasks:**
  - Add `bbox` query parameter validation (sw_lat, sw_lng, ne_lat, ne_lng) (1h)
  - Implement spatial query using PostGIS `ST_MakeEnvelope` or lat/lng range (2h)
  - Add pagination support for bounding box results (0.5h)
  - Unit tests for bounding box queries (0.5h)
- **Effort:** 4 hours

### BE-8.3: Related Events Endpoint
- **Sub-tasks:**
  - Create `GET /api/events/:id/related` endpoint (1h)
  - Query logic: same category, same venue, exclude past, exclude current event (2h)
  - Limit to 6 results, randomize order for variety (0.5h)
  - Unit tests (0.5h)
- **Effort:** 4 hours

### BE-8.4: Add to Calendar (.ics) Generation
- **Sub-tasks:**
  - Install `ical-generator` or build VEVENT string manually (0.5h)
  - Create CalendarService with `generateIcs(event)` method (1.5h)
  - Create `GET /api/events/:id/calendar` endpoint returning `.ics` file (1h)
  - Generate Google Calendar, Outlook, Apple Calendar deep links (1.5h)
  - Unit tests for .ics output validation (0.5h)
- **Effort:** 5 hours

### BE-8.5: Performance Testing and Query Optimization
- **Sub-tasks:**
  - Seed database with 5,000+ test events across all districts and categories (1h)
  - Run EXPLAIN ANALYZE on date range + category + district combined query (1h)
  - Run EXPLAIN ANALYZE on geo-bounding-box query (1h)
  - Optimize any queries with sequential scans > 100ms (1h)
- **Effort:** 4 hours

**Total Backend Effort:** 21 hours

---

## Frontend Tasks

### FE-8.1: Events Landing Page Scaffold
- **Sub-tasks:**
  - Create `/events` page route with layout component (1h)
  - Define TypeScript interfaces for Event, EventFilter, EventsResponse (1h)
  - Set up React Query/useSWR hooks for event fetching (1h)
  - Create shared EventsContext for filter state management (1h)
- **Effort:** 4 hours

### FE-8.2: Date Tabs Component
- **Sub-tasks:**
  - Build horizontal tab bar with scroll on mobile (1.5h)
  - Implement date range calculation (Today, Tomorrow, This Weekend, etc.) (1.5h)
  - Sync active tab with URL query parameter (0.5h)
  - Build date picker modal for "Pick a Date" (1.5h)
- **Effort:** 5 hours

### FE-8.3: Category and District Filters
- **Sub-tasks:**
  - Build filter bar component with dropdowns (2h)
  - Fetch categories and districts from API on mount (0.5h)
  - Implement multi-select with search within dropdown (1.5h)
  - Build active filter chips with remove buttons (1h)
  - "Clear all filters" button (0.5h)
  - Sync filter state with URL parameters (1h)
  - Display result count badge (0.5h)
- **Effort:** 7 hours

### FE-8.4: Event List View
- **Sub-tasks:**
  - Build EventCard component (image, title, date, venue, district, category badge) (2h)
  - Build responsive grid layout (3/2/1 columns) (1h)
  - Build skeleton loading cards (1h)
  - Implement pagination controls (1.5h)
  - Implement sorting dropdown (Date, Recently Added, Alphabetical) (1h)
  - Empty state component (0.5h)
- **Effort:** 7 hours

### FE-8.5: Event Map View
- **Sub-tasks:**
  - Install and configure react-leaflet with OpenStreetMap tiles (1h)
  - Build MapView component with Berlin center default (1h)
  - Implement event markers with custom icons (1.5h)
  - Integrate react-leaflet-markercluster for clustering (1.5h)
  - Build marker popup with event summary and link (1.5h)
  - Implement geo-bounding-box fetch on map move (debounced) (2h)
  - "Search this area" button logic (1h)
  - Mobile: collapsible map with "Show Map" toggle (1h)
- **Effort:** 10.5 hours

### FE-8.6: List/Map View Toggle
- **Sub-tasks:**
  - Build segmented control (List | Map) (1h)
  - Ensure shared filter state between views (1h)
  - Persist view preference in localStorage (0.5h)
  - Transition animation between views (0.5h)
- **Effort:** 3 hours

### FE-8.7: Event Detail Page
- **Sub-tasks:**
  - Create `/events/[slug]` dynamic route (0.5h)
  - Build hero image section with gradient overlay (1.5h)
  - Build event info section (date/time, venue, price, category) (2h)
  - Render rich text description (1h)
  - Build breadcrumb navigation (0.5h)
  - Embedded venue map with single marker (1.5h)
  - "Get Directions" link (Google Maps / Apple Maps detection) (1h)
  - Organizer info section (0.5h)
- **Effort:** 8.5 hours

### FE-8.8: Add to Calendar UI
- **Sub-tasks:**
  - Build "Add to Calendar" button with dropdown menu (1.5h)
  - .ics file download trigger (0.5h)
  - Google Calendar link (opens in new tab) (0.5h)
  - Outlook link (opens in new tab) (0.5h)
  - Apple Calendar link (0.5h)
  - Mobile-friendly dropdown positioning (0.5h)
- **Effort:** 4 hours

### FE-8.9: Bookmark Functionality
- **Sub-tasks:**
  - Build BookmarkButton component with heart/star icon (1h)
  - Optimistic UI toggle with API sync (1.5h)
  - Authentication check with login prompt modal (1h)
  - Integrate on EventCard and EventDetail page (0.5h)
  - Bookmark count display (0.5h)
- **Effort:** 4.5 hours

### FE-8.10: Related Events Section
- **Sub-tasks:**
  - Build RelatedEvents component with compact card grid (2h)
  - Fetch from `/api/events/:id/related` (0.5h)
  - Loading and empty states (0.5h)
  - Responsive layout (2 columns mobile, 3 tablet, 4 desktop) (1h)
- **Effort:** 4 hours

### FE-8.11: JSON-LD Event Schema
- **Sub-tasks:**
  - Build JsonLd component for Event schema (1h)
  - Map event data to schema.org Event properties (1h)
  - Inject into page head via next/head (0.5h)
  - Validate with Google Rich Results Test (0.5h)
- **Effort:** 3 hours

### FE-8.12: SEO and Meta Tags
- **Sub-tasks:**
  - Dynamic page title and meta description per event (1h)
  - Open Graph tags (og:title, og:description, og:image, og:type) (1h)
  - Twitter Card meta tags (0.5h)
  - Verify SSR output with view-source (0.5h)
- **Effort:** 3 hours

### FE-8.13: Responsive Design Pass
- **Sub-tasks:**
  - Events landing: mobile filter drawer, tab scroll, card layout (3h)
  - Event detail: mobile hero, collapsible map, stacked layout (3h)
  - Touch interactions: swipe tabs, tap targets (1h)
  - Test at breakpoints: 320px, 375px, 768px, 1024px, 1440px (1h)
- **Effort:** 8 hours

### FE-8.14: Performance Optimization
- **Sub-tasks:**
  - Image lazy loading with next/image and blur placeholders (1h)
  - Code splitting for map components (dynamic import) (1h)
  - Bundle analysis and tree shaking review (0.5h)
  - Lighthouse performance audit and fixes (0.5h)
- **Effort:** 3 hours

**Total Frontend Effort:** 74.5 hours

---

## DevOps / Infrastructure Tasks

### DEVOPS-8.1: Leaflet/Map Tile Configuration
- **Sub-tasks:**
  - Configure OpenStreetMap tile server URL and attribution (0.5h)
  - Set up tile caching policy via Cloudflare (1h)
  - Evaluate tile usage limits and fallback tile provider (0.5h)
- **Effort:** 2 hours

### DEVOPS-8.2: Performance Monitoring for Map Queries
- **Sub-tasks:**
  - Add query timing logs for geo-bounding-box queries (0.5h)
  - Set up alert for geo queries exceeding 500ms (0.5h)
- **Effort:** 1 hour

**Total DevOps Effort:** 3 hours

---

## QA Tasks

### QA-8.1: Events Landing Page Tests
- **Test Scenarios:**
  1. Verify default "Today" tab loads events correctly
  2. Switch between all date tabs and verify correct date ranges
  3. "Pick a Date" opens date picker; selecting a date loads events
  4. Category filter returns only events in selected category
  5. District filter returns only events in selected district
  6. Combined filters (date + category + district) return correct results
  7. Clear all filters resets to default state
  8. Empty state displays when no events match filters
  9. URL reflects active filters; refreshing page restores filter state
  10. Sorting options reorder results correctly
- **Effort:** 8 hours

### QA-8.2: Map View Tests
- **Test Scenarios:**
  1. Map loads centered on Berlin with correct zoom
  2. Event markers appear at correct coordinates
  3. Markers cluster when zoomed out; uncluster when zoomed in
  4. Clicking a marker shows popup with event summary
  5. Popup link navigates to event detail page
  6. Panning map triggers "Search this area" button
  7. Clicking "Search this area" fetches events in new bounding box
  8. Filters apply to map markers
  9. Mobile: map is collapsed by default; "Show Map" expands it
- **Effort:** 6 hours

### QA-8.3: Event Detail Page Tests
- **Test Scenarios:**
  1. All event fields display correctly (title, date, venue, description, etc.)
  2. Hero image loads with proper aspect ratio
  3. Embedded map shows correct venue location
  4. "Get Directions" opens correct maps app
  5. Breadcrumb links navigate correctly
  6. "Add to Calendar" downloads valid .ics file
  7. .ics file opens correctly in calendar apps
  8. Google/Outlook/Apple calendar links open correct URLs
  9. Related events section shows relevant future events
  10. Bookmark toggle works for authenticated users
  11. Bookmark shows login prompt for unauthenticated users
  12. JSON-LD markup validates in Rich Results Test
- **Effort:** 8 hours

### QA-8.4: E2E Test Suite
- **Test Scenarios:**
  - Events landing page load and interaction (3 tests)
  - Filter application and URL sync (3 tests)
  - List/Map view toggle (2 tests)
  - Event detail page navigation and content (3 tests)
  - Add to Calendar flow (2 tests)
  - Bookmark flow for auth/unauth users (2 tests)
- **Effort:** 8 hours

### QA-8.5: Cross-Browser and Responsive Testing
- **Test Scenarios:**
  1. Chrome, Firefox, Safari, Edge on desktop
  2. iOS Safari and Android Chrome on mobile
  3. Responsive breakpoints: 320px, 375px, 768px, 1024px, 1440px
  4. Touch interactions on mobile/tablet
- **Effort:** 4 hours

**Total QA Effort:** 34 hours

---

## Dependencies

| Blocked Task | Depends On | Notes |
|---|---|---|
| FE-8.4 (Event List View) | BE: Events API with filter/pagination (Sprint 7) | API must support date range, category, district filters |
| FE-8.5 (Map View) | BE-8.2 (Geo-Bounding-Box Endpoint) | Map needs spatial query support |
| FE-8.7 (Event Detail) | BE: Event detail endpoint (Sprint 7) | Single event fetch by slug |
| FE-8.8 (Add to Calendar) | BE-8.4 (.ics Generation) | Calendar file generation must be ready |
| FE-8.9 (Bookmarks) | BE: Bookmarks endpoint (Sprint 6) | Bookmark API must exist |
| FE-8.10 (Related Events) | BE-8.3 (Related Events Endpoint) | Related events query must be ready |
| FE-8.5 (Map View) | DEVOPS-8.1 (Tile Config) | Tile server URL must be configured |
| QA-8.4 (E2E Tests) | All FE tasks complete | E2E tests run against finished features |

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Leaflet SSR issues with Next.js | High | Medium | Use dynamic import with `ssr: false` for all map components |
| OpenStreetMap tile rate limiting | Low | High | Configure Cloudflare caching; have fallback tile provider (Stamen/Carto) |
| Geo-bounding-box query performance on large datasets | Medium | Medium | PostGIS spatial index; limit results per viewport; debounce map move events |
| .ics file compatibility across calendar apps | Medium | Low | Test with Google Calendar, Apple Calendar, Outlook; follow RFC 5545 strictly |
| Complex filter state management | Medium | Medium | Use URL as single source of truth; comprehensive unit tests for filter logic |
| Map marker performance with 1000+ events | Medium | High | MarkerClusterGroup handles clustering; cap API results at 200 per viewport |

---

## Deliverables Checklist

- [ ] Events landing page with date tabs
- [ ] Category and district filter dropdowns with active filter chips
- [ ] Event list view with responsive card grid and pagination
- [ ] Event map view with Leaflet, OpenStreetMap, marker clustering
- [ ] Geo-bounding-box query for map viewport
- [ ] List/Map view toggle
- [ ] Event detail page with all sections
- [ ] JSON-LD Event schema markup
- [ ] "Add to Calendar" with .ics download and provider links
- [ ] Bookmark functionality (event cards + detail page)
- [ ] Related events section on detail page
- [ ] Date picker component
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] SEO meta tags and Open Graph tags
- [ ] E2E test suite (15+ tests)
- [ ] Cross-browser testing complete
- [ ] Performance optimized (Lighthouse > 85)

---

## Definition of Done

- [ ] All user stories meet their acceptance criteria
- [ ] Events landing page renders server-side for SEO
- [ ] Event detail page renders server-side with JSON-LD markup
- [ ] All filters work individually and in combination
- [ ] Map view renders correctly with clustered markers
- [ ] Geo-bounding-box queries return results within 300ms
- [ ] .ics files download and import correctly in 3+ calendar apps
- [ ] Bookmarks persist across sessions for authenticated users
- [ ] Responsive design verified at all breakpoints
- [ ] E2E test suite passes in CI
- [ ] Cross-browser testing complete with no P1 bugs
- [ ] Lighthouse Performance score > 85 on events landing
- [ ] No accessibility violations (axe-core scan clean)
- [ ] Code reviewed and merged to main branch
- [ ] API documentation updated

---

## Sprint Review Demo Script

1. **Events Landing Page (3 min)**
   - Open `/events` and show default "Today" tab with event cards
   - Click through each date tab, showing content changes
   - Use "Pick a Date" to select a specific date
   - Show sorting options (Date, Recently Added, Alphabetical)

2. **Filters Demo (2 min)**
   - Select a category (e.g., "Music") and show filtered results
   - Add a district filter (e.g., "Kreuzberg") and show combined filtering
   - Point out active filter chips; remove one filter
   - Click "Clear all filters" to reset
   - Copy URL and paste in new tab to show filter state persistence

3. **Map View Demo (3 min)**
   - Toggle to Map View using segmented control
   - Show Berlin map with clustered event markers
   - Zoom in to show clusters expanding into individual markers
   - Click a marker to show popup with event summary
   - Pan the map and click "Search this area" to load new events
   - Show filters affecting map markers

4. **Event Detail Page (3 min)**
   - Click an event card to navigate to detail page
   - Walk through all sections: hero, info, description, venue map
   - Click "Get Directions" to show maps integration
   - Show breadcrumb navigation
   - Scroll to Related Events section

5. **Calendar Integration (1 min)**
   - Click "Add to Calendar" dropdown
   - Download .ics file and open in calendar app
   - Show Google Calendar link opening in new tab

6. **Bookmarks (1 min)**
   - Click bookmark icon on an event card (logged in)
   - Show bookmark state persists on page refresh
   - Log out and click bookmark; show login prompt

7. **Responsive Demo (2 min)**
   - Open Chrome DevTools responsive mode
   - Show mobile layout: stacked cards, filter drawer, collapsed map
   - Show tablet layout: 2-column grid
   - Navigate to event detail on mobile

---

## Rollover Criteria

A story or task rolls over to Sprint 9 if:
- It is blocked by an unresolved backend dependency for more than 3 days
- A P1 bug related to the task cannot be resolved within the sprint
- The task requires a design change not yet approved by the product owner
- Scope increase is identified mid-sprint and approved for deferral

**Candidates for rollover (if needed):**
1. Related events section (lower priority, can be added later)
2. "Pick a Date" date picker (can default to this week's range)
3. Cross-browser edge case fixes (can be addressed in hardening sprint)
