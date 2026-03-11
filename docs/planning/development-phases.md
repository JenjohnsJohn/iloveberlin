# ILoveBerlin Platform - Development Phases

**Project:** ILoveBerlin (iloveberlin.biz)
**Duration:** 56 weeks (28 sprints, 2 weeks each)
**Last Updated:** 2026-03-12

---

## Sprint Summary Table

| Sprint | Name | Phase | Weeks | Primary Focus |
|--------|------|-------|-------|---------------|
| 1 | Infrastructure & DevOps | 1 - Foundation | 1-2 | Server provisioning, CI/CD, database setup, repository structure |
| 2 | Authentication & Authorization | 1 - Foundation | 3-4 | Registration, login, JWT, social auth, RBAC |
| 3 | User Profiles & Management | 1 - Foundation | 5-6 | User profiles, avatars, preferences, account settings |
| 4 | Articles & Content Engine | 1 - Foundation | 7-8 | Rich text articles, categories, tags, content model |
| 5 | Media Library & Admin Shell | 1 - Foundation | 9-10 | Image/file uploads, media management, basic admin panel |
| 6 | Berlin Guides | 2 - Content Platform | 11-12 | Neighborhood guides, point-of-interest pages, map integration |
| 7 | Events System | 2 - Content Platform | 13-14 | Event listings, calendar views, venue integration, recurring events |
| 8 | Dining & Nightlife | 2 - Content Platform | 15-16 | Restaurant/bar listings, reviews, ratings, cuisine filtering |
| 9 | Video Content Platform | 2 - Content Platform | 17-18 | Video upload, transcoding, streaming, playlists |
| 10 | Competitions & Giveaways | 2 - Content Platform | 19-20 | Entry forms, prize management, winner selection, T&C |
| 11 | Advanced CMS & Editorial | 2 - Content Platform | 21-22 | Editorial workflow, scheduled publishing, content versioning |
| 12 | Homepage & Navigation | 2 - Content Platform | 23-24 | Homepage layout, navigation architecture, content aggregation |
| 13 | Classifieds & Listings | 3 - Community & Commerce | 25-26 | User-posted listings, categories, contact flow, moderation |
| 14 | Online Store | 3 - Community & Commerce | 27-28 | Product catalog, shopping cart, Stripe checkout, orders |
| 15 | Search & Discovery | 3 - Community & Commerce | 29-30 | Full-text search, filters, autocomplete, content discovery |
| 16 | Full Admin Dashboard | 3 - Community & Commerce | 31-32 | Unified admin, analytics dashboard, moderation tools |
| 17 | Advertising & Sponsorship | 3 - Community & Commerce | 33-34 | Ad zones, campaign management, impression tracking |
| 18 | SEO & Analytics | 3 - Community & Commerce | 35-36 | Sitemaps, structured data, meta tags, analytics integration |
| 19 | Integrations & API | 3 - Community & Commerce | 37-38 | Third-party integrations, public API, webhook system |
| 20 | Flutter App - Core | 4 - Mobile & Notifications | 39-40 | App scaffold, auth flow, article reading, navigation |
| 21 | Flutter App - Features | 4 - Mobile & Notifications | 41-42 | Events, guides, dining, video playback, deep linking |
| 22 | Push Notifications | 4 - Mobile & Notifications | 43-44 | Firebase FCM, segmented push, in-app notification center |
| 23 | Email Campaigns | 4 - Mobile & Notifications | 45-46 | Brevo integration, templates, drip sequences, analytics |
| 24 | Monitoring & Observability | 4 - Mobile & Notifications | 47-48 | Prometheus, Grafana, alerting, log aggregation, APM |
| 25 | Security Hardening | 5 - Launch | 49-50 | Penetration testing, OWASP remediation, GDPR audit |
| 26 | Beta Testing | 5 - Launch | 51-52 | Beta user onboarding, feedback collection, bug triage |
| 27 | Launch Preparation | 5 - Launch | 53-54 | Performance tuning, runbook, DNS cutover prep, CDN warming |
| 28 | Go-Live | 5 - Launch | 55-56 | Production deployment, launch monitoring, post-launch support |

---

## Phase 1: Foundation

**Duration:** Weeks 1-10 (Sprints 1-5)
**Theme:** Build the bedrock upon which the entire platform stands.

### Goals

1. Establish reliable, reproducible infrastructure with automated deployments.
2. Implement secure authentication and authorization supporting multiple identity providers.
3. Build user profile management with role-based access control.
4. Create the core content engine (articles) that defines the content model pattern for all future content types.
5. Deliver a media library for asset management and a basic admin shell for internal operations.

### Sprint Details

#### Sprint 1: Infrastructure & DevOps (Weeks 1-2)

**Objective:** Provision all environments and establish the development workflow.

**Key Deliverables:**
- Hetzner Cloud server provisioning (staging + production)
- PostgreSQL database setup with migration tooling
- CI/CD pipeline (GitHub Actions: lint, test, build, deploy)
- Repository structure (monorepo or multi-repo decision finalized)
- Docker containerization for all services
- Cloudflare DNS and CDN configuration
- Environment variable management and secrets handling
- Development environment documentation

**Definition of Done:**
- Developers can push code and see it deployed to staging within 10 minutes.
- Database migrations run automatically on deploy.
- All infrastructure is defined as code (Terraform/Ansible or equivalent).

#### Sprint 2: Authentication & Authorization (Weeks 3-4)

**Objective:** Secure the platform with robust identity management.

**Key Deliverables:**
- Email/password registration with email verification
- Login with JWT access/refresh token flow
- Google OAuth integration
- Apple Sign-In integration
- Password reset flow
- Role-based access control (RBAC) system: admin, editor, author, user
- Rate limiting on auth endpoints
- Session management and token revocation
- Auth middleware for API routes

**Definition of Done:**
- Users can register, log in, and receive valid JWT tokens.
- Social auth providers successfully return and link accounts.
- RBAC correctly restricts endpoints based on user role.
- Auth flows have 95%+ test coverage.

#### Sprint 3: User Profiles & Management (Weeks 5-6)

**Objective:** Enable users to manage their identity on the platform.

**Key Deliverables:**
- User profile pages (public-facing)
- Profile editing (bio, display name, location, website, social links)
- Avatar upload with image processing (resize, crop)
- Account settings (email change, password change, notification preferences)
- User preferences (language, content interests, newsletter opt-in)
- Admin user management (list, search, ban, role assignment)
- Account deletion flow (GDPR right to erasure)
- User activity log

**Definition of Done:**
- Users can view and edit their profiles with avatar upload.
- Admin can manage users through the admin interface.
- Account deletion properly anonymizes data per GDPR.

#### Sprint 4: Articles & Content Engine (Weeks 7-8)

**Objective:** Build the content engine that serves as the template for all content types.

**Key Deliverables:**
- Article data model (title, slug, body, excerpt, featured image, author, status)
- Rich text editor integration (Tiptap, ProseMirror, or equivalent)
- Category and tag taxonomy system
- Article CRUD API with validation
- Draft/published/archived status workflow
- Article listing with pagination, filtering, and sorting
- SEO-friendly URL structure for articles
- Related articles algorithm (tag-based)
- Article detail page with responsive layout
- Author attribution and byline display

**Definition of Done:**
- Editors can create, edit, and publish articles with rich text formatting.
- Articles render correctly with images, headings, lists, and embedded media.
- Article URLs are clean, SEO-friendly slugs.
- Content model is documented and extensible for future content types.

#### Sprint 5: Media Library & Admin Shell (Weeks 9-10)

**Objective:** Centralize asset management and provide basic administrative tooling.

**Key Deliverables:**
- Media upload service (images, documents, audio)
- Image processing pipeline (thumbnails, responsive sizes, WebP conversion)
- Cloud storage integration (Cloudflare R2 or Hetzner Object Storage)
- Media library browser with search and filtering
- Media metadata management (alt text, captions, credits)
- Basic admin panel framework (layout, navigation, auth guard)
- Admin CRUD for articles, users, media
- Admin activity audit log
- System health dashboard (basic)

**Definition of Done:**
- Media files upload to cloud storage with automatic processing.
- Admin panel provides functional CRUD for all Phase 1 entities.
- Media library supports drag-and-drop upload and browsing.

### Entry Criteria (Phase 1)

- Project charter approved
- Team assembled and onboarded
- Technology stack decisions documented
- Development environment prerequisites documented
- Source control repository created
- Cloud provider accounts provisioned (Hetzner, Cloudflare, GitHub)

### Exit Criteria (Phase 1)

- All Sprint 1-5 deliverables marked as done
- CI/CD pipeline operational with automated testing
- Authentication flow complete with social providers
- User management functional for all roles
- Article content engine operational with rich text
- Media library accepting and processing uploads
- Admin shell providing basic CRUD operations
- Test coverage > 70% on all modules
- No critical or high-severity bugs open
- Phase 1 retrospective completed and documented

### Phase 1 Retrospective Points

- Was the infrastructure setup smooth? Were there unexpected hosting issues?
- Did the content model in Sprint 4 prove extensible enough for Phase 2 needs?
- How well did the RBAC system accommodate the planned roles?
- Were there any auth integration issues with Google/Apple?
- Is the admin shell framework flexible enough for the full admin dashboard in Phase 3?
- Team velocity: did we establish a reliable sprint velocity?

---

## Phase 2: Content Platform

**Duration:** Weeks 11-24 (Sprints 6-12)
**Theme:** Build out all content verticals that make ILoveBerlin a destination for Berlin information.

### Goals

1. Launch five distinct content verticals (guides, events, dining, video, competitions).
2. Build a mature editorial workflow with scheduling and versioning.
3. Assemble the homepage that aggregates content across all verticals.
4. Establish the information architecture and navigation patterns for the platform.

### Sprint Details

#### Sprint 6: Berlin Guides (Weeks 11-12)

**Objective:** Create the first content vertical extending the article engine into structured guide content.

**Key Deliverables:**
- Guide data model (extending article model with location, neighborhood, category)
- Neighborhood taxonomy (Kreuzberg, Mitte, Prenzlauer Berg, Friedrichshain, etc.)
- Guide category system (food, culture, nightlife, shopping, outdoors, family)
- Map integration for guide locations (Google Maps or OpenStreetMap)
- Point-of-interest cards within guides
- Guide listing pages with filtering by neighborhood and category
- Guide detail pages with embedded maps and POI markers
- Photo galleries within guides
- "Best of" and "Top 10" list template

**Definition of Done:**
- Editorial team can create and publish Berlin guides with locations and maps.
- Users can browse guides by neighborhood and category.
- Guide pages render maps with interactive POI markers.

#### Sprint 7: Events System (Weeks 13-14)

**Objective:** Build a comprehensive events platform for Berlin happenings.

**Key Deliverables:**
- Event data model (title, description, date/time, end date, venue, price, organizer, image)
- Recurring event support (weekly, monthly, custom patterns)
- Calendar views (monthly, weekly, daily)
- List view with chronological sorting
- Event filtering (date range, category, price, neighborhood)
- Venue database with address, coordinates, capacity
- "Add to Calendar" export (iCal, Google Calendar)
- Event detail pages with venue map
- Event submission form (user-submitted events with moderation)
- Featured/promoted events capability

**Definition of Done:**
- Admin and approved users can create events with full details.
- Users can browse events in calendar and list views with filters.
- Recurring events generate correct future instances.
- Events display venue information with map integration.

#### Sprint 8: Dining & Nightlife (Weeks 15-16)

**Objective:** Build the dining and nightlife directory for Berlin.

**Key Deliverables:**
- Restaurant/bar/club data model (name, cuisine, price range, address, hours, contact)
- Cuisine taxonomy (German, Turkish, Vietnamese, Italian, vegan, etc.)
- Price range classification (budget, moderate, upscale, fine dining)
- User review and rating system (1-5 stars with text review)
- Review moderation workflow
- Venue photo galleries
- Opening hours display with "open now" indicator
- Reservation/booking link integration
- Dining listing pages with map view and list view
- Filter by cuisine, price, neighborhood, rating, "open now"
- Nightlife-specific features (dress code, music genre, cover charge)

**Definition of Done:**
- Dining venues are browsable with rich filtering.
- Users can leave ratings and reviews (moderated).
- "Open now" correctly calculates against Berlin timezone.
- Venue pages display all essential information for a visitor.

#### Sprint 9: Video Content Platform (Weeks 17-18)

**Objective:** Enable video content as a first-class content type.

**Key Deliverables:**
- Video upload service with size and format validation
- Video transcoding pipeline (multiple resolutions, HLS/DASH streaming)
- Video player component (responsive, with quality selection)
- Video data model (title, description, thumbnail, duration, category, tags)
- Video listing pages with thumbnail grid
- Playlist/series support
- Video embed support (YouTube, Vimeo fallback for external content)
- Video detail page with related videos
- Video-specific analytics (views, watch time, completion rate)
- Storage optimization (Cloudflare Stream or self-hosted with FFmpeg)

**Definition of Done:**
- Videos can be uploaded, transcoded, and streamed in multiple qualities.
- Video player works responsively across desktop and mobile browsers.
- Playlists can be created and managed by editors.

#### Sprint 10: Competitions & Giveaways (Weeks 19-20)

**Objective:** Build an engagement tool through competitions and giveaways.

**Key Deliverables:**
- Competition data model (title, description, prize, start/end date, rules, entry method)
- Entry form builder (email capture, quiz questions, social sharing entries)
- Entry validation and duplicate prevention
- Winner selection (random draw with auditable seed, or judge-selected)
- Winner notification system (email + in-platform)
- Terms and conditions template and display
- Competition listing page (active, upcoming, past)
- Competition detail page with countdown timer
- Entry confirmation and "share for bonus entries" flow
- Prize fulfillment tracking (admin)

**Definition of Done:**
- Competitions can be created, managed, and concluded by editors.
- Users can enter competitions and receive confirmation.
- Winner selection is fair and auditable.
- Terms and conditions are displayed and accepted before entry.

#### Sprint 11: Advanced CMS & Editorial (Weeks 21-22)

**Objective:** Mature the content management system for editorial team productivity.

**Key Deliverables:**
- Multi-stage editorial workflow (draft -> in review -> approved -> scheduled -> published)
- Scheduled publishing with cron-based publisher
- Content versioning and revision history
- Compare revisions (diff view)
- Bulk content operations (publish, unpublish, categorize, tag)
- Content templates for common formats
- Editorial calendar view (Kanban or timeline)
- Content analytics summary (views, engagement per article)
- Cross-linking and content relationship management
- Content import/export (CSV, JSON)
- Inline image placement improvements
- Multi-language content support scaffolding (DE/EN)

**Definition of Done:**
- Editors can manage content through a defined workflow with approvals.
- Scheduled posts publish automatically at the configured time.
- Revision history allows viewing and restoring previous versions.
- Editorial calendar gives a visual overview of the content pipeline.

#### Sprint 12: Homepage & Navigation (Weeks 23-24)

**Objective:** Assemble the front page and navigation that ties all content verticals together.

**Key Deliverables:**
- Homepage layout with curated content sections
- Hero section with featured content rotator
- Content aggregation widgets (latest articles, upcoming events, featured guides)
- Category-based content streams
- Navigation architecture (main nav, mega menu, footer)
- Breadcrumb system
- "Trending" and "Most Popular" algorithms
- Newsletter signup integration on homepage
- Responsive homepage design (mobile, tablet, desktop)
- Site-wide header and footer components
- 404 and error page design
- Loading states and skeleton screens

**Definition of Done:**
- Homepage displays content from all verticals in an organized layout.
- Navigation allows access to all sections within two clicks.
- Homepage renders performantly (LCP < 2.5s, CLS < 0.1).
- Responsive design verified across breakpoints.

### Entry Criteria (Phase 2)

- Phase 1 exit criteria fully met
- Content model documented and validated for extensibility
- UI/UX designs for all content verticals approved
- Content strategy document defining each vertical's purpose and audience
- Media library operational for content asset management
- Editorial team identified and available for UAT

### Exit Criteria (Phase 2)

- All five content verticals operational and content-populated
- Editorial workflow in use by content team
- Homepage assembles content from all verticals
- Navigation tested for usability
- All content types render correctly on mobile devices
- Performance benchmarks met (Core Web Vitals passing)
- Test coverage > 75% on Phase 2 modules
- No critical or high-severity bugs open
- Phase 2 retrospective completed

### Phase 2 Retrospective Points

- Did the content model established in Phase 1 scale well across verticals?
- Were the map and location features reliable and performant?
- How did the video transcoding pipeline perform under load?
- Is the editorial workflow meeting the content team's needs?
- Were there any navigation/IA issues discovered during usability testing?
- Content volume: is the platform ready for sustained content production?

---

## Phase 3: Community & Commerce

**Duration:** Weeks 25-38 (Sprints 13-19)
**Theme:** Transform the platform from a content site into a community and commerce ecosystem.

### Goals

1. Enable user-generated content through classifieds.
2. Launch an e-commerce store with payment processing.
3. Build platform-wide search and discovery.
4. Complete the admin dashboard for all operational needs.
5. Implement advertising infrastructure for revenue.
6. Optimize for search engine visibility.

### Sprint Details

#### Sprint 13: Classifieds & Listings (Weeks 25-26)

**Objective:** Enable community-driven classified listings.

**Key Deliverables:**
- Classified listing data model (title, description, price, category, condition, images, contact)
- Listing categories (housing, jobs, for sale, services, community, lost & found)
- Listing submission form with image upload
- Listing moderation queue and workflow
- Listing search and filtering (category, price range, location)
- Listing detail pages with contact form (no direct email exposure)
- Listing expiration and renewal
- User's "my listings" management page
- Flagging/reporting system for inappropriate listings
- Listing promotion (featured/boosted placement, future monetization hook)

**Definition of Done:**
- Users can create, manage, and find classified listings.
- Moderation workflow prevents inappropriate content from appearing.
- Contact happens through the platform (no scraped emails).

#### Sprint 14: Online Store (Weeks 27-28)

**Objective:** Launch an e-commerce capability for Berlin-themed merchandise and local products.

**Key Deliverables:**
- Product catalog data model (name, description, price, images, variants, stock)
- Product listing pages with filtering and sorting
- Product detail pages with image gallery and variant selection
- Shopping cart (persistent, with session and logged-in user support)
- Stripe payment integration (SCA-compliant, EU card processing)
- Checkout flow (address, shipping, payment, confirmation)
- Order management (admin: order list, status updates, refunds)
- Customer order history and tracking
- Inventory management
- Shipping calculation (flat rate, weight-based, or free thresholds)
- Invoice generation (PDF)
- VAT handling for EU sales

**Definition of Done:**
- End-to-end purchase flow works: browse -> cart -> checkout -> payment -> confirmation.
- Stripe payments process successfully in test and live modes.
- Admin can manage orders, process refunds, and update inventory.
- VAT is correctly calculated and displayed.

#### Sprint 15: Search & Discovery (Weeks 29-30)

**Objective:** Build a unified search experience across all content types.

**Key Deliverables:**
- Search engine integration (Meilisearch, Elasticsearch, or PostgreSQL full-text)
- Unified search index covering articles, guides, events, dining, videos, classifieds, products
- Search API with relevance ranking
- Autocomplete/typeahead in search bar
- Search results page with faceted filtering (content type, date, category)
- Search result snippets with highlighting
- "Did you mean?" suggestions for typos
- Search analytics (popular queries, zero-result queries)
- Content discovery features (related content, "you might also like")
- Tag-based and category-based discovery pages

**Definition of Done:**
- Search returns relevant results across all content types within 200ms.
- Autocomplete provides suggestions within 100ms.
- Faceted filters correctly narrow results.
- Search analytics are captured for ongoing optimization.

#### Sprint 16: Full Admin Dashboard (Weeks 31-32)

**Objective:** Build the comprehensive admin panel for platform operations.

**Key Deliverables:**
- Unified admin dashboard with key metrics (users, content, orders, revenue)
- Content management for all content types (CRUD + moderation)
- User management with advanced filters and bulk actions
- Order management and fulfillment tracking
- Classified listing moderation queue
- Comment and review moderation
- Analytics dashboard (traffic, engagement, revenue)
- System configuration management (feature flags, settings)
- Admin role hierarchy (super admin, content admin, commerce admin, moderator)
- Admin notification center (flagged content, new orders, system alerts)
- Export functionality (CSV/Excel for users, orders, content)

**Definition of Done:**
- Admin team can manage all platform operations from a single dashboard.
- Analytics provide actionable insights on platform performance.
- Role-based admin access restricts sensitive operations appropriately.

#### Sprint 17: Advertising & Sponsorship (Weeks 33-34)

**Objective:** Implement advertising infrastructure for platform monetization.

**Key Deliverables:**
- Ad zone system (header banner, sidebar, in-content, footer, interstitial)
- Ad campaign data model (advertiser, creative, targeting, schedule, budget)
- Campaign management interface (admin)
- Ad serving engine with targeting (section, category, user segment)
- Impression and click tracking
- Ad performance reporting (impressions, clicks, CTR, revenue)
- Self-serve advertiser portal (future-ready)
- Sponsored content tagging and display
- Ad frequency capping
- Ad-blocker detection (informational, not blocking)
- GDPR-compliant ad consent management

**Definition of Done:**
- Ads display in configured zones with correct targeting.
- Impression and click tracking produces accurate reports.
- Ad scheduling respects start/end dates and frequency caps.
- Consent is obtained before serving targeted ads.

#### Sprint 18: SEO & Analytics (Weeks 35-36)

**Objective:** Maximize search engine visibility and implement comprehensive analytics.

**Key Deliverables:**
- Dynamic XML sitemap generation (all content types)
- Structured data / JSON-LD (articles, events, restaurants, products, organization)
- Open Graph and Twitter Card meta tags for all pages
- Canonical URL management
- robots.txt configuration
- Page speed optimization (image lazy loading, code splitting, caching headers)
- Core Web Vitals optimization (LCP, FID/INP, CLS)
- Google Analytics 4 integration
- Internal analytics dashboard (pageviews, sessions, popular content)
- Google Search Console integration
- Hreflang tags for DE/EN content
- Breadcrumb structured data
- FAQ and HowTo structured data for guides
- Social sharing optimization

**Definition of Done:**
- All pages have appropriate meta tags, structured data, and canonical URLs.
- XML sitemaps are auto-generated and submitted to search engines.
- Core Web Vitals pass on all key page templates.
- Analytics capture user behavior across the platform.

#### Sprint 19: Integrations & API (Weeks 37-38)

**Objective:** Finalize third-party integrations and expose a public API.

**Key Deliverables:**
- Public REST API for content consumption (articles, events, guides)
- API authentication (API keys for partners)
- API rate limiting and usage tracking
- API documentation (Swagger/OpenAPI)
- Social media integration (auto-posting to Facebook, Instagram, Twitter)
- Google Maps Places API integration refinement
- Calendar feed (iCal) for events
- RSS feeds for content sections
- Webhook system for platform events (new content, new order, etc.)
- Integration health monitoring
- Third-party embed support (content syndication)

**Definition of Done:**
- Public API serves content with proper authentication and rate limiting.
- API documentation is complete and accessible.
- Social media auto-posting works for new content.
- All third-party integrations have health checks and error handling.

### Entry Criteria (Phase 3)

- Phase 2 exit criteria fully met
- Store product catalog and pricing defined
- Classified listing categories and rules defined
- Ad zone layout and pricing model defined
- SEO audit of current site completed (baseline metrics)
- Stripe account provisioned and verified

### Exit Criteria (Phase 3)

- All community features (classifieds) operational with moderation
- Store processing payments end-to-end
- Search returns results across all content types
- Admin dashboard covers all operational needs
- Ad system serving and tracking impressions
- SEO score improved by measurable margin over baseline
- Public API documented and functional
- Test coverage > 80% on Phase 3 modules
- No critical or high-severity bugs open
- Phase 3 retrospective completed

### Phase 3 Retrospective Points

- Is the classifieds moderation workflow manageable at expected volume?
- Were there issues with Stripe integration or payment edge cases?
- How accurate and fast is the search engine?
- Does the admin dashboard meet the operations team's daily needs?
- Are the ad serving performance and tracking reliable?
- What is the SEO baseline, and are structured data implementations validated?

---

## Phase 4: Mobile & Notifications

**Duration:** Weeks 39-48 (Sprints 20-24)
**Theme:** Extend the platform to mobile devices and build proactive communication channels.

### Goals

1. Ship a cross-platform mobile app (iOS + Android) using Flutter.
2. Implement push notification infrastructure for user re-engagement.
3. Build email campaign capability for marketing and transactional communications.
4. Establish monitoring and observability for production reliability.

### Sprint Details

#### Sprint 20: Flutter App - Core (Weeks 39-40)

**Objective:** Build the mobile app foundation with authentication and content reading.

**Key Deliverables:**
- Flutter project setup (iOS + Android targets)
- App architecture (state management: Riverpod/Bloc, navigation: GoRouter)
- Authentication flow (login, register, social auth - reusing web API)
- Article reading experience (rich text rendering, images, sharing)
- App navigation (bottom tabs, drawer, stack navigation)
- App theming and design system (matching web brand)
- Offline capability foundation (local caching)
- App splash screen and onboarding flow
- API client layer connecting to backend
- Secure token storage (Flutter Secure Storage)

**Definition of Done:**
- App runs on iOS simulator and Android emulator.
- Users can log in and read articles with full formatting.
- Navigation structure matches the information architecture.
- App handles offline gracefully (cached content viewable).

#### Sprint 21: Flutter App - Features (Weeks 41-42)

**Objective:** Bring key content verticals into the mobile app.

**Key Deliverables:**
- Events browsing and detail views (with calendar integration)
- Berlin Guides with map integration (native map SDK)
- Dining directory with map view
- Video playback (native player)
- Competition entry flow
- Deep linking (web URLs open in app)
- Universal links (iOS) and App Links (Android) configuration
- Share sheet integration
- User profile view and editing
- App store assets preparation (screenshots, descriptions, keywords)
- Beta distribution setup (TestFlight, Google Play Internal Testing)

**Definition of Done:**
- All key content types are browsable and interactive in the app.
- Deep links correctly open content in the app when installed.
- App builds are distributable via TestFlight and Google Play Internal Testing.

#### Sprint 22: Push Notifications (Weeks 43-44)

**Objective:** Implement push notification delivery for user engagement.

**Key Deliverables:**
- Firebase Cloud Messaging (FCM) integration
- Push notification service (backend)
- Device token registration and management
- Notification topics and user segmentation
- Notification triggers (new content, event reminders, competition deadlines)
- In-app notification center (bell icon, notification list, read/unread)
- Notification preferences (user opt-in/out per category)
- Rich notifications (image, action buttons)
- Scheduled notifications
- Notification analytics (delivery rate, open rate, action rate)
- Web push notification support (PWA)

**Definition of Done:**
- Push notifications deliver to iOS and Android devices.
- Users can manage notification preferences.
- Event reminders trigger automatically before event start.
- Notification analytics track delivery and engagement.

#### Sprint 23: Email Campaigns (Weeks 45-46)

**Objective:** Build email marketing and transactional email capability.

**Key Deliverables:**
- Brevo API integration for email sending
- Transactional email templates (welcome, password reset, order confirmation, etc.)
- Marketing email template builder
- Email list management and segmentation
- Newsletter signup flow (double opt-in, GDPR-compliant)
- Automated email sequences (welcome series, re-engagement drip)
- Email campaign scheduling and sending
- Email analytics (open rate, click rate, unsubscribe rate)
- Unsubscribe handling (one-click, preference center)
- Email preview and test sending
- Bounce and complaint handling

**Definition of Done:**
- Transactional emails send reliably for all platform events.
- Marketing campaigns can be created, scheduled, and tracked.
- Unsubscribe works immediately and is GDPR-compliant.
- Email analytics are accessible in the admin dashboard.

#### Sprint 24: Monitoring & Observability (Weeks 47-48)

**Objective:** Ensure production reliability through comprehensive monitoring.

**Key Deliverables:**
- Prometheus metrics collection (application, infrastructure, business)
- Grafana dashboards (system health, API performance, business KPIs)
- Alerting rules (PagerDuty/Slack/email for critical issues)
- Log aggregation (Loki, ELK, or equivalent)
- Application Performance Monitoring (APM) for API endpoints
- Database query performance monitoring
- Uptime monitoring (external health checks)
- Error tracking integration (Sentry or equivalent)
- Infrastructure monitoring (CPU, memory, disk, network)
- Custom business metric dashboards (DAU, content published, orders, revenue)
- Runbook for common incidents
- On-call rotation setup

**Definition of Done:**
- Dashboards display real-time system health and business metrics.
- Alerts fire for critical issues (downtime, error spikes, resource exhaustion).
- Log search enables rapid incident investigation.
- Runbook covers the top 10 expected incident scenarios.

### Entry Criteria (Phase 4)

- Phase 3 exit criteria fully met
- Web API stable and documented (Sprint 19 complete)
- Flutter development environment set up
- Apple Developer and Google Play Developer accounts active
- Firebase project created and configured
- Brevo account provisioned with sending domain verified
- Mobile app designs approved

### Exit Criteria (Phase 4)

- Flutter app functional on iOS and Android with core content verticals
- App builds passing on TestFlight and Google Play Internal Testing
- Push notifications delivering to both platforms
- Email campaigns operational with analytics
- Monitoring dashboards live with alerting configured
- Runbook documented for incident response
- Test coverage > 75% on mobile codebase
- No critical or high-severity bugs open
- Phase 4 retrospective completed

### Phase 4 Retrospective Points

- Did the Flutter choice deliver on the promise of shared iOS/Android development?
- Were there platform-specific issues on iOS or Android?
- How reliable is push notification delivery?
- Is the email deliverability rate acceptable (>95%)?
- Are the monitoring dashboards providing actionable insights?
- App store review process: any issues or rejections?

---

## Phase 5: Launch

**Duration:** Weeks 49-56 (Sprints 25-28)
**Theme:** Harden, test, and launch the platform to the public.

### Goals

1. Complete a security audit and remediate all findings.
2. Run a beta test with real users and iterate on feedback.
3. Prepare all launch infrastructure, marketing, and support.
4. Execute a successful public launch.

### Sprint Details

#### Sprint 25: Security Hardening (Weeks 49-50)

**Objective:** Ensure the platform meets security and compliance standards.

**Key Deliverables:**
- Third-party penetration testing engagement
- OWASP Top 10 vulnerability assessment and remediation
- SQL injection and XSS testing across all inputs
- CSRF protection verification
- Authentication and session security review
- API security audit (rate limiting, input validation, authorization)
- GDPR compliance audit (data processing, consent, right to erasure, DPA)
- Cookie consent implementation audit
- Content Security Policy (CSP) headers
- Security headers review (HSTS, X-Frame-Options, etc.)
- Dependency vulnerability scanning (npm audit, Snyk)
- Secrets management audit
- Data encryption at rest and in transit verification
- Incident response plan documentation

**Definition of Done:**
- Pen test report received with no critical or high findings unresolved.
- OWASP Top 10 issues assessed and remediated.
- GDPR compliance checklist fully satisfied.
- Security headers achieve an A+ rating on securityheaders.com.
- Incident response plan documented and team trained.

#### Sprint 26: Beta Testing (Weeks 51-52)

**Objective:** Validate the platform with real users before public launch.

**Key Deliverables:**
- Beta user recruitment (100+ users across target demographics)
- Beta onboarding flow and welcome materials
- Feedback collection mechanisms (in-app feedback, surveys, interviews)
- Bug reporting system for beta users
- Beta-specific analytics tracking
- Bug triage and prioritization process
- Critical and high-priority bug fixes
- Usability issues identified and resolved
- Performance profiling under realistic load
- Load testing (simulating expected launch-day traffic)
- Content seeding (ensuring platform feels populated at launch)
- App store beta testing (TestFlight public link, Google Play open beta)

**Definition of Done:**
- 100+ beta users onboarded and actively using the platform.
- Net Promoter Score (NPS) > 40.
- All critical bugs from beta resolved.
- Load test confirms platform handles 5x expected traffic.
- App store beta builds stable with no crash-level bugs.

#### Sprint 27: Launch Preparation (Weeks 53-54)

**Objective:** Complete all pre-launch tasks and confirm readiness.

**Key Deliverables:**
- Production environment final configuration
- DNS cutover plan (iloveberlin.biz pointing to production)
- CDN cache warming for key pages
- Database backup and recovery verification
- Disaster recovery test
- Performance final tuning (database indexes, query optimization, caching)
- App store submission (iOS App Store, Google Play Store)
- App store listing optimization (ASO: title, keywords, screenshots, description)
- Launch marketing materials (social media, press release, email blast)
- Support team training and FAQ preparation
- Launch day runbook (step-by-step deployment plan)
- Rollback plan documentation
- Final stakeholder demo and sign-off
- Legal review (terms of service, privacy policy, imprint/Impressum)

**Definition of Done:**
- Production environment fully configured and tested.
- Apps approved and ready for release in both stores.
- Launch runbook reviewed and rehearsed.
- Rollback plan tested and confirmed functional.
- All stakeholders signed off on launch readiness.

#### Sprint 28: Go-Live (Weeks 55-56)

**Objective:** Execute the public launch and stabilize the platform.

**Key Deliverables:**
- DNS cutover execution
- Production deployment execution
- App store release (simultaneous iOS and Android)
- Launch monitoring (24/7 for first 48 hours)
- Real-time dashboard for launch metrics
- Incident response on standby
- Launch marketing activation (social, email, PR)
- Post-launch bug triage and hotfix process
- User feedback monitoring and response
- Performance monitoring under real traffic
- Post-launch retrospective (Week 56, Day 5)
- Project documentation finalization
- Handover to operations team
- Post-launch roadmap planning kickoff

**Definition of Done:**
- iloveberlin.biz is live and accessible to the public.
- Mobile apps available in iOS App Store and Google Play Store.
- No critical issues in first 48 hours post-launch.
- Monitoring confirms stable performance under production traffic.
- Launch marketing campaigns active and tracking.
- Post-launch retrospective completed.
- Project formally handed over to operations team.

### Entry Criteria (Phase 5)

- Phase 4 exit criteria fully met
- Security testing vendor selected and engaged
- Beta test plan approved
- Launch date communicated to stakeholders
- Marketing materials in development
- Support team identified

### Exit Criteria (Phase 5)

- Security audit passed with no critical findings open
- Beta testing completed with positive NPS
- Platform live at iloveberlin.biz
- Apps published in both app stores
- Monitoring confirms stable production operation
- Handover to operations team complete
- Project retrospective completed
- Post-launch roadmap draft created

### Phase 5 Retrospective Points

- Were security findings manageable, or did they require significant rework?
- Did beta testing surface unexpected issues?
- Was the launch execution smooth? Were there incidents?
- How did production traffic compare to projections?
- What should be prioritized in the post-launch roadmap?
- Overall project: what went well, what could improve for future phases/projects?

---

## Cross-Phase Considerations

### Technical Debt Management

Each phase allocates 15% of sprint capacity for technical debt reduction. Tech debt items are tracked in the backlog with a "tech-debt" label and prioritized alongside feature work during sprint planning.

### Quality Gates

Every phase transition requires:
1. All exit criteria met
2. Test coverage at or above target
3. No open critical or high-severity bugs
4. Performance benchmarks met
5. Retrospective completed and action items captured
6. Stakeholder sign-off

### Continuous Activities (All Phases)

- Code reviews (all PRs reviewed before merge)
- Automated testing (unit, integration, e2e on every PR)
- Dependency updates (weekly automated PR via Dependabot/Renovate)
- Accessibility compliance (WCAG 2.1 AA target)
- Documentation updates (API docs, architecture docs, runbooks)
- Security scanning (automated on every build)
