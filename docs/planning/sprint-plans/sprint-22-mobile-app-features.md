# Sprint 22: Mobile App Feature Screens

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 22 |
| **Sprint Name** | Mobile App Feature Screens |
| **Duration** | 2 weeks (10 working days) |
| **Start Date** | Week 43 (Day 211) |
| **End Date** | Week 44 (Day 220) |
| **Phase** | Phase 4 -- Mobile & Notifications |

## Sprint Goal

Deliver all primary feature screens in the Flutter mobile app -- events, dining, videos, competitions, classifieds, and the "More" hub -- along with cross-cutting capabilities (favorites, search, sharing, pull-to-refresh), comprehensive widget tests, physical device validation, and performance profiling, producing an app that covers the full content surface of iloveberlin.biz.

---

## User Stories

### US-22-01: Events List and Detail with Map
**As a** Berlin visitor using the mobile app,
**I want to** browse upcoming events and see each event's location on an interactive map,
**so that** I can discover things to do and navigate to them.

**Acceptance Criteria:**
- [ ] Events list screen shows paginated events with thumbnail, title, date, and venue
- [ ] Pull-to-refresh reloads the event list from the API
- [ ] Tapping an event navigates to a detail screen with full description, date/time, price, and venue
- [ ] Detail screen includes an embedded map (Google Maps or Mapbox) with a pin at the venue location
- [ ] "Get Directions" button opens the native maps app with the venue coordinates
- [ ] Skeleton loading states display while data is fetched
- [ ] Empty state shown when no events are available

### US-22-02: Dining List and Detail with Gallery
**As a** user exploring Berlin restaurants,
**I want to** browse dining options and view photo galleries for each restaurant,
**so that** I can decide where to eat.

**Acceptance Criteria:**
- [ ] Dining list shows restaurants with thumbnail, name, cuisine type, and rating
- [ ] Filter chips allow filtering by cuisine type
- [ ] Detail screen shows full restaurant info: description, address, hours, price range, phone
- [ ] Swipeable photo gallery with pinch-to-zoom on detail screen
- [ ] Map section with restaurant pin and "Get Directions" button
- [ ] Pull-to-refresh on the list screen

### US-22-03: Video List and Player
**As a** user,
**I want to** watch Berlin-related videos in the app,
**so that** I can experience the city visually.

**Acceptance Criteria:**
- [ ] Video list shows thumbnails with play icon overlay, title, and duration
- [ ] Tapping a video navigates to a player screen
- [ ] Video player supports play/pause, seek, fullscreen, and volume control
- [ ] Player handles orientation changes (landscape fullscreen)
- [ ] Related videos section below the player
- [ ] Loading and error states handled gracefully

### US-22-04: Competitions List and Entry
**As a** user,
**I want to** browse active competitions and submit entries,
**so that** I can participate and win prizes.

**Acceptance Criteria:**
- [ ] Competitions list shows active competitions with image, title, end date, and prize
- [ ] Countdown timer displays remaining time for each competition
- [ ] Detail screen shows full rules, prize details, and entry form
- [ ] Authenticated users can submit entries (text and/or photo upload)
- [ ] Entry confirmation shown after successful submission
- [ ] Past competitions tab shows winners and results
- [ ] Unauthenticated users see a prompt to sign in before entering

### US-22-05: Favorites and Bookmarks (Local + Server Sync)
**As a** user,
**I want to** bookmark content and have my favorites synced across devices,
**so that** I can easily return to content I like.

**Acceptance Criteria:**
- [ ] Heart/bookmark icon on every content card and detail screen
- [ ] Tapping the icon toggles favorite state with immediate UI feedback (optimistic update)
- [ ] Favorites stored locally in SQLite for offline access
- [ ] When authenticated, favorites sync to the server via `/api/favorites` endpoint
- [ ] Conflict resolution: server state wins on sync, local changes queued when offline
- [ ] Dedicated "Favorites" tab in the app showing all bookmarked content grouped by type
- [ ] Removing a favorite updates both local and server state

### US-22-06: Classifieds Browsing
**As a** user,
**I want to** browse classified listings in the app,
**so that** I can find apartments, jobs, and items for sale in Berlin.

**Acceptance Criteria:**
- [ ] Classifieds list with category filter tabs (housing, jobs, for sale, services)
- [ ] Each listing shows title, price (if applicable), location, and thumbnail
- [ ] Detail screen with full description, photos, contact info, and post date
- [ ] Search within classifieds
- [ ] Pull-to-refresh on the list

### US-22-07: "More" Screen (Profile, Settings, About)
**As a** user,
**I want to** access my profile, app settings, and about information from a central hub,
**so that** I can manage my account and preferences.

**Acceptance Criteria:**
- [ ] "More" tab shows user avatar, name, and email (if authenticated) or sign-in prompt
- [ ] Profile section: edit display name, avatar, bio
- [ ] Settings section: notification preferences toggle, theme (light/dark/system), language
- [ ] About section: app version, licenses, privacy policy link, terms link, contact/feedback
- [ ] Sign-out button (with confirmation dialog) when authenticated
- [ ] All changes persist via API and locally

### US-22-08: Search with Autocomplete
**As a** user,
**I want to** search across all content types with instant suggestions,
**so that** I can quickly find what I am looking for.

**Acceptance Criteria:**
- [ ] Search icon in the app bar opens a search screen with auto-focus on the text field
- [ ] Autocomplete suggestions appear after typing 2+ characters (debounced 300ms)
- [ ] Suggestions sourced from Meilisearch via the backend `/api/search` endpoint
- [ ] Results grouped by content type (events, dining, articles, videos, classifieds)
- [ ] Tapping a result navigates to the appropriate detail screen
- [ ] Recent searches stored locally and shown when the search field is empty
- [ ] Clear search history option

### US-22-09: Share Functionality
**As a** user,
**I want to** share content from the app via native sharing,
**so that** I can send Berlin recommendations to friends.

**Acceptance Criteria:**
- [ ] Share button on every detail screen (events, dining, articles, videos, competitions, classifieds)
- [ ] Tapping share opens the native share sheet with a deep link URL
- [ ] Shared URL points to the web version of the content on iloveberlin.biz
- [ ] Share text includes the content title and a short description

### US-22-10: Widget Tests, Device Testing, and Performance Profiling
**As a** developer,
**I want to** ensure the app is well-tested and performant,
**so that** users have a reliable, smooth experience.

**Acceptance Criteria:**
- [ ] Widget tests cover all new screens (events, dining, videos, competitions, classifieds, more, search)
- [ ] Minimum 80% widget test coverage for new code
- [ ] Physical device testing on at least 1 iOS device and 1 Android device
- [ ] No jank frames (>16ms) on list scrolling verified via Flutter DevTools
- [ ] App startup time profiled and under 2 seconds on mid-range device
- [ ] Memory usage profiled; no leaks on navigation between screens
- [ ] Performance report documenting findings and any optimizations made

---

## Day-by-Day Task Breakdown

### Week 1 (Days 211-215)

#### Day 1 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-01 | Set up screen routing for all new feature screens | Mobile | 2 | -- |
| T22-02 | Events list screen: API integration, paginated list, skeleton loading | Mobile | 4 | T22-01 |
| T22-03 | Events detail screen: layout, description, date/time, venue info | Mobile | 3 | T22-01 |
| T22-04 | Review and confirm all mobile API endpoints are deployed and returning expected data | Backend | 2 | -- |

#### Day 2 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-05 | Events detail: embed interactive map with venue pin | Mobile | 3 | T22-03 |
| T22-06 | Events detail: "Get Directions" native maps integration | Mobile | 2 | T22-05 |
| T22-07 | Dining list screen: API integration, cuisine filter chips, paginated list | Mobile | 4 | T22-01 |
| T22-08 | Backend: verify `/api/restaurants` endpoint supports cuisine filtering and pagination | Backend | 2 | -- |

#### Day 3 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-09 | Dining detail screen: full info layout, map, directions | Mobile | 3 | T22-07 |
| T22-10 | Dining detail: swipeable photo gallery with pinch-to-zoom | Mobile | 4 | T22-09 |
| T22-11 | Video list screen: thumbnail grid with play overlay, title, duration | Mobile | 3 | T22-01 |

#### Day 4 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-12 | Video player screen: play/pause, seek, fullscreen, volume | Mobile | 5 | T22-11 |
| T22-13 | Video player: orientation handling (landscape fullscreen) | Mobile | 2 | T22-12 |
| T22-14 | Video player: related videos section | Mobile | 2 | T22-12 |

#### Day 5 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-15 | Competitions list screen: active competitions, countdown timer | Mobile | 4 | T22-01 |
| T22-16 | Competitions detail screen: rules, prize details, entry form | Mobile | 4 | T22-15 |
| T22-17 | Competitions: entry submission (text + photo upload) and confirmation | Mobile | 3 | T22-16 |

### Week 2 (Days 216-220)

#### Day 6 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-18 | Competitions: past competitions tab with winners | Mobile | 2 | T22-15 |
| T22-19 | Favorites: local SQLite storage for bookmarks | Mobile | 3 | -- |
| T22-20 | Favorites: heart/bookmark icon on all content cards with optimistic toggle | Mobile | 3 | T22-19 |
| T22-21 | Backend: verify `/api/favorites` CRUD endpoints (POST, GET, DELETE) | Backend | 2 | -- |

#### Day 7 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-22 | Favorites: server sync when authenticated (upload local, download remote, conflict resolution) | Mobile | 4 | T22-19, T22-21 |
| T22-23 | Favorites: dedicated "Favorites" tab screen grouped by content type | Mobile | 3 | T22-22 |
| T22-24 | Classifieds list screen: category tabs, listing cards, search | Mobile | 4 | T22-01 |

#### Day 8 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-25 | Classifieds detail screen: photos, description, contact, post date | Mobile | 3 | T22-24 |
| T22-26 | "More" screen: profile section (avatar, name, bio edit) | Mobile | 3 | T22-01 |
| T22-27 | "More" screen: settings (notifications toggle, theme, language) | Mobile | 3 | T22-26 |
| T22-28 | "More" screen: about section (version, licenses, links) and sign-out | Mobile | 2 | T22-26 |

#### Day 9 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-29 | Search screen: text field with auto-focus, debounced autocomplete (300ms) | Mobile | 3 | -- |
| T22-30 | Search: results grouped by content type, navigation to detail screens | Mobile | 3 | T22-29 |
| T22-31 | Search: recent searches (local storage), clear history | Mobile | 2 | T22-29 |
| T22-32 | Share functionality: native share sheet on all detail screens | Mobile | 2 | -- |
| T22-33 | Pull-to-refresh: add RefreshIndicator to all list screens | Mobile | 1 | -- |

#### Day 10 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T22-34 | Widget tests: events list, events detail, dining list, dining detail | QA/Mobile | 3 | T22-02 through T22-10 |
| T22-35 | Widget tests: video list, video player, competitions, classifieds | QA/Mobile | 3 | T22-11 through T22-25 |
| T22-36 | Widget tests: favorites, more screen, search, share | QA/Mobile | 2 | T22-19 through T22-33 |
| T22-37 | Physical device testing: iOS device (iPhone) full walkthrough | QA | 2 | All screen tasks |
| T22-38 | Physical device testing: Android device full walkthrough | QA | 2 | All screen tasks |
| T22-39 | Performance profiling: startup time, scroll jank, memory leaks | Mobile | 2 | All screen tasks |
| T22-40 | Performance report: document findings and optimizations | Mobile | 1 | T22-39 |

---

## Backend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T22-04 | Verify mobile API endpoints | Review events, dining, videos, competitions, classifieds, search endpoints; confirm pagination, filtering, response structure | 2 |
| T22-08 | Verify restaurant endpoint | Confirm cuisine filtering query param, pagination, response includes gallery URLs | 2 |
| T22-21 | Verify favorites endpoints | Confirm POST/GET/DELETE `/api/favorites`; test with multiple content types; verify auth guard | 2 |
| | **Backend Total** | | **6** |

## Frontend (Flutter) Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T22-01 | Screen routing | Add named routes for events, dining, videos, competitions, classifieds, more, search | 2 |
| T22-02 | Events list | API service call, pagination controller, list view with cards, skeleton shimmer, empty state | 4 |
| T22-03 | Events detail | Hero image, title, date/time, venue, description, price | 3 |
| T22-05 | Events map | google_maps_flutter or flutter_map integration, venue marker, info window | 3 |
| T22-06 | Get Directions | url_launcher to native maps with lat/lng | 2 |
| T22-07 | Dining list | API call with cuisine filter param, FilterChip row, paginated list | 4 |
| T22-09 | Dining detail | Full layout, map embed, directions | 3 |
| T22-10 | Photo gallery | PageView with cached_network_image, InteractiveViewer for zoom | 4 |
| T22-11 | Video list | Grid layout, thumbnail with play overlay, duration badge | 3 |
| T22-12 | Video player | chewie or video_player package, controls overlay | 5 |
| T22-13 | Orientation handling | SystemChrome.setPreferredOrientations, fullscreen toggle | 2 |
| T22-14 | Related videos | Horizontal list below player | 2 |
| T22-15 | Competitions list | Active tab with countdown (Timer + StreamBuilder), past tab | 4 |
| T22-16 | Competition detail | Rules, prize, entry form with validation | 4 |
| T22-17 | Entry submission | Image picker, multipart upload, confirmation dialog | 3 |
| T22-18 | Past competitions | Winners list, result display | 2 |
| T22-19 | Local favorites | sqflite table: id, content_type, content_id, created_at; DAO class | 3 |
| T22-20 | Favorite toggle UI | AnimatedSwitcher on heart icon, optimistic state management | 3 |
| T22-22 | Favorites sync | Sync service: push local, pull remote, merge with server-wins strategy | 4 |
| T22-23 | Favorites screen | Grouped list (events, dining, articles, etc.) with unfavorite swipe | 3 |
| T22-24 | Classifieds list | Category TabBar, listing cards, in-list search | 4 |
| T22-25 | Classifieds detail | Photo carousel, description, contact actions (call, email) | 3 |
| T22-26 | More: profile | Avatar upload, text fields, save button | 3 |
| T22-27 | More: settings | SwitchListTile for notifications, theme dropdown, language dropdown | 3 |
| T22-28 | More: about + sign-out | PackageInfo for version, LicensePage, links, sign-out with AlertDialog | 2 |
| T22-29 | Search autocomplete | TextField with onChanged debounce, API call to /api/search, suggestion list | 3 |
| T22-30 | Search results | Grouped results by type, tap navigation | 3 |
| T22-31 | Recent searches | SharedPreferences list, clear button | 2 |
| T22-32 | Share | share_plus package, deep link URL construction | 2 |
| T22-33 | Pull-to-refresh | RefreshIndicator wrapper on all list screens | 1 |
| | **Frontend Total** | | **89** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---|---|---|---|
| T22-34 | Widget tests batch 1 | Events list renders, pagination loads more, events detail displays all fields, map renders, dining list filters by cuisine, dining gallery swipes | 3 |
| T22-35 | Widget tests batch 2 | Video list renders thumbnails, player plays/pauses, competitions countdown ticks, entry form validates, classifieds category switch | 3 |
| T22-36 | Widget tests batch 3 | Favorite toggle updates icon, favorites screen groups correctly, more screen shows profile, search debounces, share opens sheet | 2 |
| T22-37 | iOS device testing | Full app walkthrough on physical iPhone: all screens, navigation, gestures, performance feel | 2 |
| T22-38 | Android device testing | Full app walkthrough on physical Android: all screens, navigation, gestures, performance feel | 2 |
| T22-39 | Performance profiling | Flutter DevTools timeline recording on scrolling lists, startup trace, memory snapshot after 5-minute usage | 2 |
| T22-40 | Performance report | Document frame times, startup duration, memory baseline, recommendations | 1 |
| | **QA Total** | | **15** |

---

## Dependencies

```
T22-01 (routing) --> T22-02, T22-07, T22-11, T22-15, T22-24, T22-26 (all list screens)
T22-02 (events list) --> T22-03 (events detail)
T22-03 (events detail) --> T22-05 (map) --> T22-06 (directions)
T22-07 (dining list) --> T22-09 (dining detail) --> T22-10 (gallery)
T22-11 (video list) --> T22-12 (player) --> T22-13 (orientation), T22-14 (related)
T22-15 (competitions list) --> T22-16 (detail) --> T22-17 (entry)
T22-19 (local favorites) --> T22-20 (toggle UI), T22-22 (sync)
T22-21 (backend favorites verify) --> T22-22 (sync)
T22-22 (sync) --> T22-23 (favorites screen)
T22-24 (classifieds list) --> T22-25 (classifieds detail)
T22-26 (profile) --> T22-27 (settings), T22-28 (about)
T22-29 (search autocomplete) --> T22-30 (results), T22-31 (recent)
All screen tasks --> T22-34 through T22-40 (testing and profiling)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Map SDK integration issues (API key, platform-specific config) | Medium | Medium | Allocate buffer time on Day 2; have fallback to static map image |
| Video player performance on older devices | Medium | High | Test early on low-end device; consider adaptive quality |
| Favorites sync conflicts with poor connectivity | Medium | Medium | Server-wins strategy simplifies conflict resolution; queue offline changes |
| Large number of screens may not fit in 2 weeks | Medium | High | Prioritize events, dining, favorites, search; defer classifieds detail polish if needed |
| Physical device availability for testing | Low | Medium | Ensure devices reserved in advance; use BrowserStack as fallback |

---

## Deliverables Checklist

- [ ] Events list screen with pagination and pull-to-refresh
- [ ] Events detail screen with interactive map and directions
- [ ] Dining list screen with cuisine filters
- [ ] Dining detail screen with photo gallery (swipe + zoom)
- [ ] Video list screen with thumbnail grid
- [ ] Video player with controls and fullscreen
- [ ] Competitions list with countdown timers
- [ ] Competition entry form with photo upload
- [ ] Favorites: local storage, server sync, dedicated screen
- [ ] Classifieds list with category tabs and detail screen
- [ ] "More" screen: profile editing, settings, about, sign-out
- [ ] Search with autocomplete and grouped results
- [ ] Share functionality on all detail screens
- [ ] Pull-to-refresh on all list screens
- [ ] Widget tests with 80%+ coverage on new code
- [ ] Physical device testing on iOS and Android
- [ ] Performance profiling report

---

## Definition of Done

- All feature screens are implemented and navigable from the bottom navigation and/or tab structure
- Every list screen supports pull-to-refresh and paginated loading
- Every detail screen has a share button and (where applicable) a favorites toggle
- Favorites sync correctly between local SQLite and the server API
- Search returns results from Meilisearch grouped by content type
- Widget tests pass with 80%+ coverage on new code
- Physical device testing completed on at least 1 iOS and 1 Android device with no blocking issues
- Performance profiling shows no jank on list scrolling and startup under 2 seconds
- All code reviewed and merged to the development branch
- No critical or high-severity bugs open

---

## Sprint Review Demo Script

1. **Events flow** (3 min): Open Events tab, scroll the list, pull to refresh, tap an event, show detail with map, tap "Get Directions" to open native maps, tap share
2. **Dining flow** (3 min): Open Dining tab, filter by cuisine, tap a restaurant, swipe through gallery, pinch to zoom a photo, tap directions
3. **Video flow** (2 min): Open Videos tab, tap a video, demonstrate play/pause/seek, rotate to fullscreen, scroll related videos
4. **Competitions flow** (2 min): Show active competitions with countdown, tap one, fill in entry form with photo, submit, show confirmation, switch to past competitions tab
5. **Favorites flow** (3 min): Favorite an event, a restaurant, and a video from their detail screens. Navigate to Favorites tab, show grouped bookmarks. Sign out, sign back in, show favorites synced from server
6. **Classifieds flow** (2 min): Browse classifieds, switch categories, tap a listing, show detail with contact actions
7. **More screen** (2 min): Show profile editing, change theme to dark mode, view about section, tap privacy policy link, sign out with confirmation
8. **Search flow** (2 min): Tap search, type partial query, show autocomplete suggestions, tap a result to navigate to detail
9. **Testing summary** (2 min): Show widget test results (coverage percentage), summarize physical device findings, present performance profiling report

**Total demo time:** ~21 minutes

---

## Rollover Criteria

Items roll over to Sprint 23 if:
- Any feature screen is incomplete in UI but the API integration is functional -- complete the UI polish in next sprint
- Widget test coverage is below 80% -- write remaining tests early in next sprint
- Performance profiling reveals issues requiring more than 4 hours of optimization work -- schedule as tech debt
- Physical device testing reveals platform-specific bugs that cannot be fixed within the sprint -- log and prioritize

Items that **must** be completed this sprint (no rollover):
- Events list + detail (core feature)
- Dining list + detail (core feature)
- Favorites with local storage (server sync can roll over if needed)
- Search with autocomplete (core UX feature)
