# Sprint 14: Classifieds Frontend

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 14 |
| **Sprint Name** | Classifieds Frontend |
| **Duration** | 2 weeks (10 working days) |
| **Dates** | Weeks 27-28 (relative to project start) |
| **Team** | 2 Frontend, 1 Backend (support), 1 QA, 0.5 DevOps |

## Sprint Goal

Deliver the complete classifieds user-facing frontend -- including a browsable landing page with category tabs, search, and filters; classified detail pages with image galleries; a multi-step listing creation form (5 steps); user listing management; a messaging UI with inbox and conversation threads; and a report modal -- providing Berlin residents with a full peer-to-peer classifieds experience.

---

## User Stories

### US-14.1: Classifieds Landing Page
**ID:** US-14.1
**As a** visitor, **I want to** browse classified listings organized by category with search and filters **so that** I can find items, services, or housing in Berlin.

**Acceptance Criteria:**
- [ ] Classifieds landing page at `/classifieds`
- [ ] Category tabs displayed horizontally (scrollable on mobile) with icons
- [ ] "All" tab shows all active listings (default)
- [ ] Search bar with keyword search (powered by Meilisearch)
- [ ] Filter dropdowns: district, price range, price type (Free, Fixed, Negotiable)
- [ ] Sorting: Newest (default), Price Low-High, Price High-Low
- [ ] Active filters shown as removable chips
- [ ] URL reflects search/filter/tab state for shareability
- [ ] Result count updates on filter change
- [ ] Featured listings section at the top (highlighted)
- [ ] Empty state when no listings match

### US-14.2: Category Page
**ID:** US-14.2
**As a** visitor, **I want to** view all listings in a specific category **so that** I can browse within my area of interest.

**Acceptance Criteria:**
- [ ] Category page at `/classifieds/category/[slug]`
- [ ] Category title and description displayed
- [ ] Sub-category tabs if parent category (e.g., Housing -> Rent, Flatshare, Sublet)
- [ ] Listing grid filtered to selected category
- [ ] All filters (district, price range, search) available within category
- [ ] Breadcrumbs: Home > Classifieds > [Category]
- [ ] SEO: dynamic title and meta description per category

### US-14.3: Classified Detail Page
**ID:** US-14.3
**As a** visitor, **I want to** view full details of a classified listing **so that** I can decide if I'm interested.

**Acceptance Criteria:**
- [ ] Detail page at `/classifieds/[slug]`
- [ ] Image gallery (thumbnails + main image, click to enlarge)
- [ ] Title, price (with price type badge: Free, Negotiable, Fixed, Contact for Price)
- [ ] Category and district badges
- [ ] Full description (rich text)
- [ ] Contact section: "Send Message" button (opens messaging), phone (if provided)
- [ ] Posted date and expiry date
- [ ] View count display
- [ ] Seller info: username, member since, listing count
- [ ] Map showing approximate location (district level, not exact address)
- [ ] "Report Listing" link
- [ ] Share buttons (copy link, social)
- [ ] Breadcrumbs: Home > Classifieds > [Category] > [Listing Title]
- [ ] JSON-LD Product/Offer schema markup (where applicable)
- [ ] SSR for SEO

### US-14.4: Multi-Step Listing Creation Form
**ID:** US-14.4
**As a** logged-in user, **I want to** create a classified listing through a guided multi-step form **so that** I can post items for sale or services easily.

**Acceptance Criteria:**
- [ ] 5-step form accessible at `/classifieds/new`
- [ ] Step indicator showing progress (1 of 5, 2 of 5, etc.)
- [ ] **Step 1 - Category:** Select category from visual grid, then sub-category if applicable
- [ ] **Step 2 - Details:** Title, description (rich text), price, price type, district, contact info
- [ ] **Step 3 - Images:** Upload up to 8 images with drag-and-drop, reorder, remove, crop/rotate preview
- [ ] **Step 4 - Preview:** Full preview of the listing as it will appear
- [ ] **Step 5 - Submit:** Terms acceptance, submit button, confirmation page
- [ ] Back/Next navigation between steps
- [ ] Form state persisted across steps (not lost on back navigation)
- [ ] Client-side validation on each step before allowing "Next"
- [ ] Draft auto-save to localStorage (recover on return)
- [ ] Auth required: redirect to login if not authenticated
- [ ] Submission creates listing in `pending_review` status
- [ ] Confirmation page shows "Your listing is pending review"

### US-14.5: User's Listings Management
**ID:** US-14.5
**As a** logged-in user, **I want to** manage my classified listings **so that** I can edit, renew, or remove them.

**Acceptance Criteria:**
- [ ] "My Listings" page at `/classifieds/my-listings`
- [ ] Tabs: Active, Pending, Expired, Rejected, All
- [ ] Each listing shows: thumbnail, title, status badge, category, price, date, view count
- [ ] "Edit" button navigates to edit form (pre-filled multi-step form)
- [ ] "Renew" button for expired listings (resets to pending_review)
- [ ] "Delete" button with confirmation dialog
- [ ] Rejected listings show rejection reason
- [ ] Empty states per tab
- [ ] Responsive layout

### US-14.6: Messaging UI
**ID:** US-14.6
**As a** logged-in user, **I want to** send and receive messages about classified listings **so that** I can communicate with buyers/sellers.

**Acceptance Criteria:**
- [ ] Inbox page at `/messages`
- [ ] Thread list showing: listing thumbnail, listing title, other user's name, last message preview, timestamp, unread badge
- [ ] Threads sorted by most recent message
- [ ] Clicking a thread opens the conversation view
- [ ] Conversation view shows all messages in chronological order (chat bubble style)
- [ ] Own messages aligned right (blue), other's messages aligned left (gray)
- [ ] Message input field with "Send" button at bottom
- [ ] Messages marked as read when conversation is opened
- [ ] Unread message count in navigation header badge
- [ ] "Message Seller" button on classified detail opens new thread (or existing thread)
- [ ] Empty inbox state
- [ ] Responsive layout (mobile-friendly chat view)

### US-14.7: Report Modal
**ID:** US-14.7
**As a** logged-in user, **I want to** report a problematic classified listing **so that** admins can review it.

**Acceptance Criteria:**
- [ ] "Report Listing" link on classified detail page
- [ ] Clicking opens a modal dialog
- [ ] Report reason selector (radio buttons): Spam, Fraud/Scam, Inappropriate Content, Duplicate Listing, Already Sold/Expired, Other
- [ ] "Other" shows a text area for description
- [ ] "Submit Report" button with loading state
- [ ] Confirmation message on success ("Thank you, we'll review this listing")
- [ ] Auth required: show login prompt if not authenticated
- [ ] Already reported: show "You've already reported this listing"
- [ ] Close button / ESC to dismiss modal

### US-14.8: Responsive Design
**ID:** US-14.8
**As a** mobile user, **I want to** browse and create classifieds on my phone **so that** I can use the platform on the go.

**Acceptance Criteria:**
- [ ] Category tabs scroll horizontally on mobile
- [ ] Filter drawer slides up from bottom on mobile
- [ ] Listing cards stack vertically on mobile
- [ ] Detail page: image gallery swipeable on mobile
- [ ] Multi-step form: full-width steps, mobile-friendly inputs
- [ ] Image upload: camera capture option on mobile
- [ ] Messaging: full-screen chat view on mobile
- [ ] All content readable without horizontal scrolling
- [ ] Touch-friendly tap targets (minimum 44x44px)

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Scaffold classifieds frontend module | Frontend 1 | 3h | Create /classifieds route, layout, types/interfaces, API hooks |
| Build category tabs component | Frontend 1 | 4h | Horizontal scrollable tabs with icons, API fetch, URL sync |
| Build classified card component | Frontend 2 | 4h | Thumbnail, title, price/type badge, category, district, date |
| Set up search and filter state management | Frontend 2 | 3h | URL-based state, React Query hooks for filtered listing fetch |

#### Day 2 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build classifieds landing page | Frontend 1 | 5h | Category tabs, search bar, listing grid, featured section, pagination |
| Build filter bar (district, price range, price type, sorting) | Frontend 1 | 3h | Dropdowns, active chips, clear all, result count |
| Build search bar with Meilisearch integration | Frontend 2 | 3h | Debounced search input, instant results, clear button |
| Build category page | Frontend 2 | 4h | /classifieds/category/[slug], sub-category tabs, filtered grid, breadcrumbs |

#### Day 3 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build classified detail page layout | Frontend 1 | 6h | Image gallery, title/price, description, contact, seller info, breadcrumbs |
| Build detail page image gallery | Frontend 2 | 5h | Thumbnail strip, main image viewer, click-to-enlarge lightbox (reuse from Sprint 10) |
| Backend: API adjustments for frontend needs | Backend | 3h | Fix response shape issues, add missing fields |

#### Day 4 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build detail page map section | Frontend 1 | 2h | District-level map marker (approximate location), Leaflet |
| Build detail page contact section | Frontend 1 | 2h | "Send Message" button, phone link, seller info card |
| Build report modal component | Frontend 2 | 3h | Modal with reason radio buttons, description textarea, submit |
| Build share buttons on detail page | Frontend 2 | 1.5h | Copy link, social media share |
| Build JSON-LD schema for classifieds | Frontend 1 | 2h | Product/Offer structured data, inject in head |
| SEO: meta tags for detail and category pages | Frontend 2 | 2h | Dynamic title, description, OG tags |

#### Day 5 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build multi-step form scaffold | Frontend 1 | 4h | Step indicator, back/next navigation, form state management, localStorage auto-save |
| Build Step 1 - Category selection | Frontend 2 | 3h | Visual category grid with icons, sub-category selection |
| Build Step 2 - Details form (Part 1) | Frontend 1 | 4h | Title, description (rich text editor), price input, price type selector |
| QA: Begin test plan creation | QA | 4h | Write test scenarios for landing, detail, creation flow |

### Week 2 (Days 6-10)

#### Day 6 (Monday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build Step 2 - Details form (Part 2) | Frontend 1 | 3h | District dropdown, contact email/phone, client-side validation |
| Build Step 3 - Image upload | Frontend 2 | 6h | Drag-and-drop upload zone, preview grid, reorder (drag), remove, crop/rotate preview, camera capture on mobile |
| Build upload progress indicators | Frontend 2 | 2h | Per-image upload progress bars, error handling |

#### Day 7 (Tuesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build Step 4 - Preview | Frontend 1 | 4h | Full listing preview matching detail page appearance |
| Build Step 5 - Submit | Frontend 1 | 3h | Terms checkbox, submit with loading state, API call, confirmation page |
| Build "My Listings" page | Frontend 2 | 5h | Status tabs, listing rows with badges, edit/renew/delete buttons |

#### Day 8 (Wednesday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Build messaging inbox page | Frontend 1 | 5h | Thread list with listing thumbnail, user name, last message, timestamp, unread badge |
| Build conversation/chat view | Frontend 2 | 6h | Message bubbles (own right/blue, other left/gray), chronological order, input field, send button |
| Backend: unread count WebSocket or polling endpoint | Backend | 3h | Real-time or polling unread badge update |

#### Day 9 (Thursday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| Wire "Message Seller" from detail to messaging | Frontend 1 | 2h | Open existing thread or create new, pre-fill context |
| Build unread badge in navigation header | Frontend 1 | 1.5h | Poll unread count, display badge on messages icon |
| Responsive design - landing + category pages | Frontend 2 | 3h | Mobile tabs, filter drawer, card stack |
| Responsive design - detail page | Frontend 2 | 2h | Mobile gallery, contact, map |
| Responsive design - multi-step form | Frontend 1 | 3h | Mobile steps, inputs, image upload |
| Responsive design - messaging | Frontend 2 | 2h | Full-screen mobile chat, thread list |
| QA: Test classifieds landing and detail | QA | 4h | Tabs, filters, search, detail page content |

#### Day 10 (Friday)
| Task | Assignee | Hours | Details |
|---|---|---|---|
| QA: Test multi-step creation form | QA | 4h | All 5 steps, validation, image upload, submission |
| QA: Test my listings management | QA | 2h | Status tabs, edit, renew, delete |
| QA: Test messaging and reports | QA | 3h | Inbox, chat, send, read status, report modal |
| E2E test suite | QA | 4h | Cypress/Playwright: landing, detail, creation, messaging |
| Bug fixes from QA | Frontend 1 + 2 | 4h | Address P1/P2 issues |
| Cross-browser testing | QA | 2h | All pages, all browsers |
| Sprint review demo preparation | Frontend 1 | 2h | Demo script, test data |
| Update homepage classifieds section | Frontend 2 | 2h | Wire homepage to live classifieds API |

---

## Backend Tasks (Support)

### BE-14.1: API Adjustments
- **Sub-tasks:**
  - Fix response shape inconsistencies reported by frontend (2h)
  - Add missing query parameters (e.g., sorting options) (1h)
  - Optimize classified list query for frontend pagination patterns (1h)
- **Effort:** 4 hours

### BE-14.2: Unread Message Count
- **Sub-tasks:**
  - Optimize unread count query for polling (0.5h)
  - Add polling endpoint or WebSocket event for unread count changes (2h)
  - Rate limit polling to prevent excessive queries (0.5h)
- **Effort:** 3 hours

### BE-14.3: Draft Auto-Save Endpoint (Optional)
- **Sub-tasks:**
  - `POST /api/classifieds/draft` saves a draft listing server-side (1.5h)
  - `GET /api/classifieds/my-drafts` retrieves user's drafts (0.5h)
  - `DELETE /api/classifieds/draft/:id` deletes a draft (0.5h)
- **Effort:** 2.5 hours

**Total Backend Effort:** 9.5 hours

---

## Frontend Tasks

### FE-14.1: Classifieds Landing Page
- **Sub-tasks:**
  - Create `/classifieds` page route with layout (1h)
  - Category tabs with icons (horizontal scrollable) (2h)
  - Search bar with debounced Meilisearch query (2h)
  - Filter bar: district dropdown, price range, price type, sorting (3h)
  - Active filter chips with remove and clear all (1h)
  - Featured listings section (highlighted, top of page) (1.5h)
  - Listing card grid (responsive: 3/2/1 columns) (1h)
  - Pagination controls (1h)
  - Result count display (0.5h)
  - Empty state and loading skeleton (1h)
  - URL state sync for filters/search/category (1h)
- **Effort:** 14 hours

### FE-14.2: Category Page
- **Sub-tasks:**
  - Create `/classifieds/category/[slug]` route (0.5h)
  - Category header (title, description, icon) (1h)
  - Sub-category tabs for parent categories (1.5h)
  - Filtered listing grid with all filters available (1h)
  - Breadcrumbs: Home > Classifieds > [Category] (0.5h)
  - SEO: dynamic meta tags per category (0.5h)
- **Effort:** 5 hours

### FE-14.3: Classified Card Component
- **Sub-tasks:**
  - Card layout: thumbnail, title, price with type badge, category, district, date (2h)
  - Featured card variant (highlighted border/badge) (0.5h)
  - Premium card variant (subtle promotion indicator) (0.5h)
  - Loading skeleton variant (0.5h)
  - Link to detail page (0.5h)
- **Effort:** 4 hours

### FE-14.4: Classified Detail Page
- **Sub-tasks:**
  - Create `/classifieds/[slug]` route with SSR (1h)
  - Image gallery: thumbnail strip + main image viewer (2h)
  - Click-to-enlarge lightbox (reuse Sprint 10 component) (1h)
  - Title and price section with price type badge (1h)
  - Category and district badges (0.5h)
  - Rich text description rendering (0.5h)
  - Seller info card (username, member since, listing count) (1.5h)
  - Contact section: "Send Message" button, phone link (if available) (1h)
  - Map section: approximate location (district level, Leaflet) (1.5h)
  - Posted date, expiry date, view count (0.5h)
  - Share buttons (copy link, social) (1h)
  - "Report Listing" link (0.5h)
  - Breadcrumbs: Home > Classifieds > [Category] > [Title] (0.5h)
  - JSON-LD Product/Offer schema (1.5h)
  - SEO meta tags and OG tags (1h)
- **Effort:** 14 hours

### FE-14.5: Report Modal
- **Sub-tasks:**
  - Modal overlay component (0.5h)
  - Report reason radio button group (6 options) (1h)
  - "Other" conditional text area (0.5h)
  - Submit button with loading state (0.5h)
  - Success confirmation message (0.5h)
  - "Already reported" state (0.5h)
  - Auth check: login prompt for unauthenticated (0.5h)
  - Close via button, ESC, overlay click (0.5h)
- **Effort:** 4.5 hours

### FE-14.6: Multi-Step Form - Scaffold
- **Sub-tasks:**
  - Step indicator component (1 of 5, 2 of 5, etc.) with progress bar (1.5h)
  - Back/Next button navigation (0.5h)
  - Form state management (React context or reducer) (1.5h)
  - localStorage auto-save and recovery (1.5h)
  - Auth guard: redirect to login if not authenticated (0.5h)
  - Route: `/classifieds/new` (0.5h)
- **Effort:** 6 hours

### FE-14.7: Step 1 - Category Selection
- **Sub-tasks:**
  - Visual category grid with icons and names (2h)
  - Click to select category, highlight selected (0.5h)
  - Sub-category display when parent selected (1h)
  - Validation: category required before "Next" (0.5h)
- **Effort:** 4 hours

### FE-14.8: Step 2 - Details
- **Sub-tasks:**
  - Title input with character count (0.5h)
  - Description rich text editor (TipTap or similar) (2.5h)
  - Price input with currency symbol (EUR) (0.5h)
  - Price type selector (Fixed, Negotiable, Free, Contact for Price) (0.5h)
  - District dropdown (12 Berlin districts) (0.5h)
  - Contact email (pre-filled from profile) and phone (optional) (1h)
  - Client-side validation for all fields (1h)
- **Effort:** 6.5 hours

### FE-14.9: Step 3 - Image Upload
- **Sub-tasks:**
  - Drag-and-drop upload zone (react-dropzone) (2h)
  - File type validation (images only: jpg, png, webp) (0.5h)
  - File size validation (max 5MB per image) (0.5h)
  - Upload progress bar per image (1h)
  - Preview grid of uploaded images (1h)
  - Drag-and-drop reorder within preview grid (dnd-kit) (2h)
  - Remove button per image with confirmation (0.5h)
  - Crop/rotate preview (basic, optional) (2h)
  - Mobile: camera capture option via file input accept="image/*" (0.5h)
  - Counter: "3 of 8 images uploaded" (0.5h)
  - Validation: at least 1 image recommended (soft warning) (0.5h)
- **Effort:** 11 hours

### FE-14.10: Step 4 - Preview
- **Sub-tasks:**
  - Full listing preview matching detail page layout (3h)
  - Show all entered data: images, title, price, description, category, district (1h)
  - "Edit" links per section to jump back to relevant step (0.5h)
- **Effort:** 4.5 hours

### FE-14.11: Step 5 - Submit
- **Sub-tasks:**
  - Terms and conditions checkbox (required) with link to full terms (0.5h)
  - "Submit Listing" button with loading state (0.5h)
  - API call: create classified + upload images (1h)
  - Error handling: show errors, allow retry (0.5h)
  - Confirmation page: "Your listing has been submitted for review" (1h)
  - Clear localStorage auto-save on successful submission (0.5h)
  - Link to "My Listings" from confirmation (0.5h)
- **Effort:** 4.5 hours

### FE-14.12: My Listings Page
- **Sub-tasks:**
  - Create `/classifieds/my-listings` route (0.5h)
  - Status tabs: Active, Pending, Expired, Rejected, All (1.5h)
  - Listing row component: thumbnail, title, status badge, category, price, date, view count (2h)
  - "Edit" button: navigate to pre-filled multi-step form (1h)
  - "Renew" button for expired listings with confirmation (0.5h)
  - "Delete" button with confirmation dialog (0.5h)
  - Rejection reason display on rejected listings (0.5h)
  - Empty state per tab (0.5h)
  - Responsive layout (1h)
- **Effort:** 8 hours

### FE-14.13: Messaging - Inbox Page
- **Sub-tasks:**
  - Create `/messages` route (0.5h)
  - Thread list component (2h)
  - Thread item: listing thumbnail, listing title, other user's name, last message preview, timestamp (1.5h)
  - Unread badge per thread (0.5h)
  - Sort by most recent message (0.5h)
  - Empty inbox state (0.5h)
  - Loading state (0.5h)
- **Effort:** 6 hours

### FE-14.14: Messaging - Conversation View
- **Sub-tasks:**
  - Conversation header: listing info, other user's name (1h)
  - Message list: chronological order, auto-scroll to latest (1.5h)
  - Message bubble component: own messages right/blue, other's left/gray (1.5h)
  - Timestamp display per message (or grouped by day) (0.5h)
  - Message input area: text input + send button (1h)
  - Send message: API call, optimistic append, error handling (1.5h)
  - Mark messages as read on conversation open (0.5h)
  - Auto-poll for new messages (every 10 seconds) (1h)
  - "Back to inbox" navigation (0.5h)
- **Effort:** 9 hours

### FE-14.15: Messaging Integration
- **Sub-tasks:**
  - "Message Seller" button on detail page: open existing thread or create new (1.5h)
  - Unread count badge in site navigation header (1h)
  - Poll unread count (every 30 seconds) (0.5h)
  - Link from thread to classified listing (0.5h)
- **Effort:** 3.5 hours

### FE-14.16: Homepage Classifieds Section Update
- **Sub-tasks:**
  - Wire homepage classifieds section to live API (1h)
  - Replace placeholder with recent classified cards (0.5h)
  - Category icons on cards (0.5h)
- **Effort:** 2 hours

### FE-14.17: Responsive Design Pass
- **Sub-tasks:**
  - Landing page: mobile category tabs, filter drawer, card stack (2h)
  - Category page: mobile sub-category tabs, breadcrumbs (1h)
  - Detail page: mobile gallery swipe, contact, map (2h)
  - Multi-step form: mobile-friendly steps, camera capture (2h)
  - My Listings: mobile listing rows, action buttons (1h)
  - Messaging: full-screen mobile chat, collapsible thread list (2h)
  - Test at breakpoints: 320px, 375px, 768px, 1024px, 1440px (1h)
- **Effort:** 11 hours

### FE-14.18: Performance Optimization
- **Sub-tasks:**
  - Image lazy loading on listing grids (0.5h)
  - Code splitting for rich text editor (dynamic import) (0.5h)
  - Code splitting for image upload components (0.5h)
  - Bundle analysis (0.5h)
  - Lighthouse audit (0.5h)
- **Effort:** 2.5 hours

**Total Frontend Effort:** 120 hours

---

## DevOps / Infrastructure Tasks

### DEVOPS-14.1: Image Upload Client Configuration
- **Sub-tasks:**
  - Configure client-side direct upload to R2 (signed URLs) if applicable (2h)
  - Set up CORS for upload endpoints (0.5h)
- **Effort:** 2.5 hours

### DEVOPS-14.2: Polling / WebSocket Infrastructure
- **Sub-tasks:**
  - Evaluate polling vs WebSocket for message notifications (0.5h)
  - Configure polling endpoint caching/rate limiting (0.5h)
  - Future: set up WebSocket gateway for real-time messaging (defer) (0h)
- **Effort:** 1 hour

**Total DevOps Effort:** 3.5 hours

---

## QA Tasks

### QA-14.1: Classifieds Landing Page Tests
- **Test Scenarios:**
  1. Landing page loads with active listings
  2. "All" tab selected by default, shows all categories
  3. Selecting a category tab filters listings to that category
  4. Search bar returns relevant results via Meilisearch
  5. District filter narrows results
  6. Price range filter shows correct listings
  7. Price type filter (Free, Fixed, Negotiable) works
  8. Sorting: Newest, Price Low-High, Price High-Low
  9. Combined filters and search work together
  10. Active filter chips display; removing chips updates results
  11. URL reflects state; refresh restores state
  12. Featured listings appear at top in highlighted section
  13. Pagination navigates correctly
  14. Empty state displays when no results match
  15. Responsive: mobile tabs, filter drawer, card layout
- **Effort:** 8 hours

### QA-14.2: Category and Detail Page Tests
- **Test Scenarios:**
  1. Category page shows listings for selected category
  2. Sub-category tabs appear for parent categories
  3. Breadcrumbs navigate correctly
  4. Detail page shows all listing information
  5. Image gallery displays thumbnails and main image
  6. Click-to-enlarge opens lightbox
  7. Price type badge displays correctly for each type
  8. Seller info section shows correct user data
  9. Map shows approximate location (district level)
  10. Share buttons function (copy link)
  11. "Report Listing" opens report modal
  12. JSON-LD markup validates
  13. SEO meta tags present and correct
- **Effort:** 6 hours

### QA-14.3: Multi-Step Creation Form Tests
- **Test Scenarios:**
  1. Unauthenticated user: redirected to login
  2. Step 1: Category grid displays; selection required before "Next"
  3. Step 1: Sub-category appears for parent category
  4. Step 2: All fields render; validation enforced (title required, etc.)
  5. Step 2: Rich text editor functions for description
  6. Step 2: Price input accepts only numbers; currency shown
  7. Step 2: District dropdown lists all 12 districts
  8. Step 3: Drag-and-drop upload zone accepts images
  9. Step 3: Upload progress shows per image
  10. Step 3: Max 8 images enforced
  11. Step 3: Invalid file type rejected
  12. Step 3: Oversized file rejected
  13. Step 3: Drag-and-drop reorder works
  14. Step 3: Remove image works
  15. Step 4: Preview matches detail page appearance
  16. Step 4: All entered data displayed correctly
  17. Step 5: Terms checkbox required
  18. Step 5: Submit creates listing with pending_review status
  19. Step 5: Confirmation page displays
  20. Back navigation: form state preserved
  21. localStorage auto-save: close and reopen recovers state
  22. Mobile: camera capture option available
- **Effort:** 10 hours

### QA-14.4: My Listings Management Tests
- **Test Scenarios:**
  1. My Listings page shows user's listings
  2. Status tabs filter correctly (Active, Pending, Expired, Rejected, All)
  3. Edit button opens pre-filled form
  4. Renew button on expired listing triggers renewal
  5. Delete button with confirmation removes listing
  6. Rejected listings show rejection reason
  7. Empty state per tab
  8. Responsive layout
- **Effort:** 4 hours

### QA-14.5: Messaging Tests
- **Test Scenarios:**
  1. "Message Seller" on detail page opens/creates thread
  2. Inbox shows all threads sorted by most recent
  3. Thread item shows listing thumbnail, other user, last message, timestamp
  4. Unread badge shows on threads with unread messages
  5. Clicking thread opens conversation view
  6. Messages displayed in chronological order (chat bubbles)
  7. Own messages right/blue, other's left/gray
  8. Send message: appears immediately (optimistic)
  9. Messages marked as read when conversation opened
  10. Unread count badge in header updates
  11. Cannot message own listing
  12. Back to inbox navigation works
  13. Empty inbox state
  14. Responsive: mobile chat view
- **Effort:** 6 hours

### QA-14.6: Report Modal Tests
- **Test Scenarios:**
  1. "Report Listing" opens modal
  2. All 6 reason options selectable
  3. "Other" shows description textarea
  4. Submit with reason selected: success confirmation
  5. Submit without reason: validation error
  6. Already reported: "You've already reported this listing"
  7. Unauthenticated: login prompt
  8. Close via button, ESC, overlay click
- **Effort:** 3 hours

### QA-14.7: E2E Test Suite
- **Test Scenarios:**
  - Landing page load and filter interaction (3 tests)
  - Category navigation and sub-categories (2 tests)
  - Detail page content and gallery (2 tests)
  - Multi-step form complete flow (3 tests)
  - My Listings management actions (2 tests)
  - Messaging: send and receive (2 tests)
  - Report modal flow (1 test)
- **Effort:** 8 hours

### QA-14.8: Cross-Browser and Responsive Testing
- **Test Scenarios:**
  1. Chrome, Firefox, Safari, Edge on desktop
  2. iOS Safari and Android Chrome on mobile
  3. Responsive breakpoints: 320px, 375px, 768px, 1024px, 1440px
  4. Image upload on mobile (camera capture)
  5. Rich text editor on mobile
  6. Chat view on mobile
- **Effort:** 4 hours

**Total QA Effort:** 49 hours

---

## Dependencies

| Blocked Task | Depends On | Notes |
|---|---|---|
| FE-14.1 (Landing Page) | BE: Classified list API (Sprint 13) | Needs classified data with filters |
| FE-14.2 (Category Page) | BE: Categories API (Sprint 13) | Needs category tree |
| FE-14.4 (Detail Page) | BE: Classified detail API (Sprint 13) | Needs full listing data |
| FE-14.6-14.11 (Creation Form) | BE: Classified create + Image upload APIs (Sprint 13) | Needs CRUD and image endpoints |
| FE-14.12 (My Listings) | BE: My listings API (Sprint 13) | Needs user's listings endpoint |
| FE-14.13-14.15 (Messaging) | BE: Messaging APIs (Sprint 13) | Needs message endpoints |
| FE-14.5 (Report Modal) | BE: Report API (Sprint 13) | Needs report endpoint |
| FE-14.4 (Detail Map) | Leaflet setup (Sprint 8) | Map components from events sprint |
| FE-14.4 (Lightbox) | Lightbox component (Sprint 10) | Reuse from dining sprint |
| QA-14.7 (E2E) | All FE tasks complete | Tests run against finished features |
| BE-14.2 (Unread Count) | BE: Messaging (Sprint 13) | Extends messaging module |

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Multi-step form state management complexity | High | Medium | Use React context/reducer; test each step independently; localStorage auto-save as safety net |
| Image upload UX on mobile (camera, file size) | Medium | Medium | Test on real devices; compress images client-side before upload; clear error messages |
| Rich text editor bundle size | Medium | Low | Dynamic import (code split); consider lightweight editor (TipTap) over heavier options |
| Messaging polling performance | Medium | Medium | Throttle polling (30s for unread count, 10s for active conversation); use HTTP caching |
| Drag-and-drop reorder on mobile | High | Medium | Use touch-friendly dnd library (dnd-kit supports touch); test on real devices |
| Form data loss on navigation/crash | Medium | High | localStorage auto-save every 10 seconds; recovery prompt on return |
| Sprint 13 backend APIs not ready on Day 1 | Low | High | Parallel development with mock data; prioritize API-independent tasks first |

---

## Deliverables Checklist

- [ ] Classifieds landing page with category tabs
- [ ] Search bar with Meilisearch integration
- [ ] Filter dropdowns (district, price range, price type) with active chips
- [ ] Featured listings section
- [ ] Category page with sub-category tabs
- [ ] Classified detail page with all sections
- [ ] Image gallery with lightbox on detail page
- [ ] JSON-LD Product/Offer schema
- [ ] Report modal with all reason options
- [ ] Multi-step listing creation form (5 steps)
  - [ ] Step 1: Category selection
  - [ ] Step 2: Details form
  - [ ] Step 3: Image upload with drag-and-drop
  - [ ] Step 4: Preview
  - [ ] Step 5: Submit with confirmation
- [ ] localStorage auto-save for form
- [ ] My Listings management page with status tabs
- [ ] Edit, renew, delete actions for own listings
- [ ] Messaging inbox page with thread list
- [ ] Conversation view with chat bubbles
- [ ] Send message functionality
- [ ] Unread message count badge in header
- [ ] "Message Seller" integration on detail page
- [ ] Homepage classifieds section wired to live data
- [ ] Responsive design (all pages, mobile-friendly)
- [ ] SEO meta tags and structured data
- [ ] E2E test suite (15+ tests)
- [ ] Cross-browser testing complete

---

## Definition of Done

- [ ] All user stories meet their acceptance criteria
- [ ] Classifieds landing page renders server-side for SEO
- [ ] Category pages render server-side with dynamic meta tags
- [ ] Detail pages render server-side with JSON-LD markup
- [ ] All filters and search work individually and in combination
- [ ] Multi-step form completes full creation flow successfully
- [ ] Image upload works on desktop (drag-and-drop) and mobile (camera capture)
- [ ] Form state persists across steps and recovers from localStorage
- [ ] My Listings shows all statuses with correct actions per status
- [ ] Messaging inbox and conversation view work correctly
- [ ] Unread badge updates on message receipt
- [ ] Report modal submits successfully with reason
- [ ] Responsive design verified at all breakpoints (320px-1440px)
- [ ] E2E test suite passes in CI
- [ ] Cross-browser testing complete with no P1 bugs
- [ ] Lighthouse Performance score > 80 on landing page
- [ ] Accessibility audit passes (axe-core)
- [ ] Code reviewed and merged to main branch

---

## Sprint Review Demo Script

1. **Classifieds Landing Page (3 min)**
   - Open `/classifieds` and show all active listings
   - Click through category tabs (Jobs, Housing, For Sale)
   - Search for "bicycle" and show Meilisearch results
   - Apply district filter (Prenzlauer Berg) and price range
   - Show active filter chips; remove one; clear all
   - Point out featured listings section at top
   - Demonstrate sorting options

2. **Category Page (1 min)**
   - Click Housing category tab
   - Show sub-category tabs: Rent, Flatshare, Sublet
   - Show breadcrumbs and category description

3. **Classified Detail Page (3 min)**
   - Click a listing card to open detail
   - Walk through: image gallery, title/price, description
   - Click image to open lightbox; navigate images
   - Show seller info card
   - Show approximate location on map
   - Show share buttons

4. **Creating a Listing (5 min)**
   - Navigate to `/classifieds/new` (logged in)
   - **Step 1:** Select "For Sale" category, then "Electronics" sub-category
   - **Step 2:** Fill in title, description (rich text), price (50 EUR, Negotiable), district (Mitte), contact info
   - **Step 3:** Upload 3 photos via drag-and-drop; reorder by dragging; remove one
   - **Step 4:** Show full preview of the listing
   - **Step 5:** Accept terms, submit; show confirmation ("Pending review")
   - Navigate to My Listings to see listing in "Pending" tab

5. **My Listings Management (2 min)**
   - Show My Listings page with status tabs
   - Show Active, Pending, Expired listings
   - Click "Edit" on a listing to show pre-filled form
   - Click "Renew" on an expired listing
   - Show rejection reason on a rejected listing

6. **Messaging (3 min)**
   - From a listing detail page, click "Message Seller"
   - Type and send a message
   - Switch to the seller's account
   - Show inbox with unread badge
   - Open conversation thread
   - Reply to the message
   - Show unread count badge in header

7. **Report Modal (1 min)**
   - Click "Report Listing" on a detail page
   - Select reason (e.g., "Spam")
   - Submit report
   - Show confirmation message

8. **Responsive Demo (2 min)**
   - DevTools responsive mode
   - Mobile: category tabs scroll, filter drawer, stacked cards
   - Mobile: detail page with swipeable gallery
   - Mobile: creation form on phone
   - Mobile: full-screen chat view

---

## Rollover Criteria

A story or task rolls over to Sprint 15 (if applicable) if:
- Sprint 13 backend APIs have unresolved bugs blocking frontend work for >3 days
- Multi-step form complexity exceeds estimates by >50%
- Messaging UI requires real-time WebSocket support (currently polling)
- Image upload performance issues on mobile require client-side compression

**Candidates for rollover (if needed):**
1. Crop/rotate preview in image upload (nice-to-have; basic upload is sufficient)
2. localStorage auto-save (form state is preserved in React state within session)
3. Homepage classifieds section update (can be done in next sprint)
4. Advanced messaging features (typing indicators, real-time delivery -- defer to future)
