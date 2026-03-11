# Sprint 19: Admin Panel Content & Advertising

**Sprint Number:** 19
**Sprint Name:** Admin Panel Content & Advertising
**Duration:** 2 weeks (10 working days)
**Dates:** Weeks 37-38 (relative to project start)
**Team Capacity:** ~160 hours (1 backend, 2 frontend, 1 QA)

---

## Sprint Goal

Extend the admin panel with advertising campaign management, ad placement configuration and analytics, SEO audit tooling with bulk editing capabilities, public-facing ad banner components with impression and click tracking, and conduct the Phase 3 retrospective to assess progress and plan Phase 4 priorities.

---

## User Stories

### US-19.1: Advertising Infrastructure
**As an** admin, **I want to** manage ad campaigns and placements **so that** the platform can generate advertising revenue.

**Acceptance Criteria:**
- [ ] ad_campaigns table stores: name, advertiser, budget, start_date, end_date, status, targeting criteria (JSONB), created_at, updated_at
- [ ] ad_placements table stores: campaign_id (FK), placement_type (banner, sidebar, inline), page_location, dimensions, asset_url, click_url, impressions_count, clicks_count, is_active, created_at, updated_at
- [ ] Campaigns have statuses: draft, scheduled, active, paused, completed, archived
- [ ] Campaign budget tracking with daily spend limits
- [ ] Placement dimensions support standard IAB sizes (728x90, 300x250, 160x600, 320x50 mobile)

### US-19.2: Ad Campaign Management
**As an** admin, **I want to** create, schedule, and monitor ad campaigns **so that** I can manage advertiser relationships.

**Acceptance Criteria:**
- [ ] Campaign creation form with: name, advertiser info, date range, budget, targeting options
- [ ] Campaign list with: name, advertiser, status badge, budget/spend, date range, CTR
- [ ] Campaign detail view with: performance chart, placement list, daily breakdown
- [ ] Campaign status transitions with validation (cannot activate without at least one placement)
- [ ] Campaign cloning for repeat advertisers
- [ ] Campaign scheduling (auto-activate on start_date, auto-complete on end_date)

### US-19.3: Ad Placement Management
**As an** admin, **I want to** configure where ads appear and upload creative assets **so that** ads display correctly across the platform.

**Acceptance Criteria:**
- [ ] Placement creation: select campaign, placement type, page location, upload asset, set click URL
- [ ] Asset upload to Cloudflare R2 with dimension validation
- [ ] Preview placement in context (show how ad will appear on the page)
- [ ] Placement analytics: impressions, clicks, CTR, daily trend chart
- [ ] A/B testing support: multiple placements per campaign location, weighted rotation
- [ ] Placement activation/deactivation without affecting the parent campaign

### US-19.4: Ad Serving & Tracking
**As a** developer, **I want** an ad serving endpoint and tracking system **so that** ads are delivered and measured accurately.

**Acceptance Criteria:**
- [ ] GET /api/ads/serve?location={location}&page={page} returns the appropriate ad placement
- [ ] Ad serving respects campaign schedule, budget limits, and targeting criteria
- [ ] Impression tracking via IntersectionObserver (counted when 50% of ad is visible for 1 second)
- [ ] Click tracking via redirect endpoint (POST /api/ads/click/:placementId)
- [ ] Impression and click counts are updated asynchronously via BullMQ to avoid blocking
- [ ] Anti-fraud measures: rate limiting per IP, bot detection, duplicate impression filtering
- [ ] Ad serving latency target: <50ms

### US-19.5: SEO Audit Tool
**As an** admin, **I want** an SEO audit tool **so that** I can identify and fix SEO issues across the platform.

**Acceptance Criteria:**
- [ ] SEO audit endpoint scans all content pages for: missing titles, missing meta descriptions, missing alt text, broken links, duplicate titles, thin content (<300 words)
- [ ] Audit results displayed in a table with: page URL, issue type, severity, current value, suggested fix
- [ ] Issues categorized by severity: critical (red), warning (yellow), info (blue)
- [ ] Bulk edit: select multiple pages, update meta titles or descriptions in batch
- [ ] SEO score per page (0-100) based on checklist completion
- [ ] Overall site SEO score displayed on admin dashboard
- [ ] Audit can be triggered manually or runs weekly via cron

### US-19.6: Public Ad Display
**As a** visitor, **I want to** see relevant ads that do not disrupt my browsing experience **so that** I discover useful products and services.

**Acceptance Criteria:**
- [ ] Ad banner components render in designated page locations
- [ ] Ads are visually distinguished with "Ad" or "Sponsored" label
- [ ] Ads are responsive: appropriate sizes for desktop, tablet, and mobile
- [ ] Ads load asynchronously and do not block page rendering
- [ ] Empty ad slots (no campaign active) collapse gracefully without blank space
- [ ] Ad close/dismiss button (optional, per campaign setting)
- [ ] Ads respect user's "reduced motion" preference

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday) - Advertising Database & Module Setup
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-19.1: ad_campaigns migration | Backend | 2 | id, name, advertiser_name, advertiser_email, budget_cents, daily_budget_cents, spent_cents, start_date, end_date, status (enum), targeting (JSONB), notes, created_at, updated_at |
| BE-19.2: ad_placements migration | Backend | 2 | id, campaign_id (FK), placement_type (enum), page_location (enum), width, height, asset_url, click_url, alt_text, weight (for rotation), impressions_count, clicks_count, is_active, created_at, updated_at |
| BE-19.3: AdCampaign entity and repository | Backend | 1.5 | TypeORM entity, repository with status filtering, budget queries |
| BE-19.4: AdPlacement entity and repository | Backend | 1.5 | TypeORM entity, repository with campaign relation, analytics queries |
| FE-19.1: Admin advertising section navigation | Frontend 1 | 1 | Add "Advertising" section to admin sidebar with sub-items (Campaigns, Placements) |
| FE-19.2: Campaign list page layout | Frontend 1 | 2 | Table with columns, status filter tabs, search, create button |

#### Day 2 (Tuesday) - Campaign CRUD Backend & Frontend
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-19.5: AdCampaign CRUD service | Backend | 3 | Create, findAll (paginated, filterable), findOne (with placements), update, archive, clone |
| BE-19.6: Campaign status management | Backend | 2 | Status transitions with validation, auto-schedule via BullMQ cron (activate on start_date, complete on end_date) |
| BE-19.7: AdCampaign controller and DTOs | Backend | 2 | REST endpoints, CreateCampaignDto, UpdateCampaignDto, validation |
| FE-19.3: Campaign creation form | Frontend 1 | 3 | Multi-step form: basic info -> date/budget -> targeting -> review, validation |
| FE-19.4: Campaign list table component | Frontend 2 | 2.5 | Sortable columns, status badges (color coded), budget progress bar, CTR display |
| FE-19.5: Campaign status filter tabs | Frontend 2 | 1 | All, Draft, Active, Paused, Completed tabs with counts |

#### Day 3 (Wednesday) - Placement CRUD & Campaign Detail
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-19.8: AdPlacement CRUD service | Backend | 2.5 | Create (with asset upload to R2), findAll by campaign, update, activate/deactivate, dimension validation |
| BE-19.9: AdPlacement controller and DTOs | Backend | 2 | REST endpoints nested under campaigns, CreatePlacementDto with file upload |
| BE-19.10: Ad serving endpoint | Backend | 2.5 | GET /api/ads/serve, location-based ad selection, campaign schedule/budget/targeting checks, weighted rotation for A/B |
| FE-19.6: Campaign detail page | Frontend 1 | 3 | Campaign info header, performance metrics cards, placement list, daily performance chart (Recharts) |
| FE-19.7: Placement creation form | Frontend 2 | 2.5 | Placement type selector, dimension presets (IAB sizes), asset upload with preview, click URL input |
| FE-19.8: Placement list component | Frontend 2 | 1.5 | Thumbnails, dimensions, impressions/clicks/CTR, active toggle |

#### Day 4 (Thursday) - Ad Tracking & Analytics
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-19.11: Impression tracking endpoint | Backend | 2 | POST /api/ads/impression/:placementId, BullMQ async processing, duplicate filtering (IP + placement + 1hr window) |
| BE-19.12: Click tracking endpoint | Backend | 2 | POST /api/ads/click/:placementId, log click, redirect to click_url, rate limiting |
| BE-19.13: Ad analytics aggregation | Backend | 2.5 | Daily impressions/clicks/CTR per placement and campaign, BullMQ cron job |
| BE-19.14: Campaign analytics endpoint | Backend | 1.5 | GET /admin/campaigns/:id/analytics, daily breakdown, total spend, ROI calculation |
| FE-19.9: Campaign performance chart | Frontend 1 | 2.5 | Recharts line chart: impressions and clicks over time, date range selector |
| FE-19.10: Placement analytics view | Frontend 2 | 2 | Per-placement metrics cards, mini trend chart, CTR comparison |

#### Day 5 (Friday) - SEO Audit Backend
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-19.15: SEO audit service | Backend | 3.5 | Scan content pages for: missing titles (<60 chars), missing descriptions (<160 chars), missing alt text, thin content (<300 words), duplicate titles |
| BE-19.16: SEO audit endpoint | Backend | 2 | GET /admin/seo/audit, POST /admin/seo/audit/run (trigger scan), results with pagination and severity filter |
| BE-19.17: SEO score calculation | Backend | 1.5 | Per-page score (0-100) based on checklist items, overall site score as average |
| FE-19.11: Ad placement preview component | Frontend 1 | 2 | Show how ad looks in context (mock page layout with placement highlighted) |
| FE-19.12: Campaign clone functionality | Frontend 2 | 1.5 | Clone button, pre-fill form with existing campaign data, change name to "Copy of..." |
| QA-19.1: Campaign CRUD testing | QA | 3 | Create, edit, delete campaigns; status transitions; scheduling; clone |

### Week 2 (Days 6-10)

#### Day 6 (Monday) - SEO Audit Frontend & Ad Banner Components
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-19.13: SEO audit page layout | Frontend 1 | 2 | Summary cards (critical/warning/info counts), overall score, "Run Audit" button |
| FE-19.14: SEO issues table | Frontend 1 | 2.5 | Sortable by severity, page URL, issue type; expandable row with current value and suggestion |
| FE-19.15: SEO bulk edit modal | Frontend 2 | 3 | Select multiple pages, edit meta title or description, preview changes, save batch |
| FE-19.16: Public ad banner component (React) | Frontend 2 | 2.5 | Responsive banner, "Sponsored" label, lazy load, collapse when empty, close button |
| BE-19.18: SEO bulk update service | Backend | 2 | Batch update meta titles/descriptions for multiple content items, validation |
| QA-19.2: Placement CRUD and ad serving testing | QA | 3 | Create placements, upload assets, serve ads, verify rotation |

#### Day 7 (Tuesday) - Ad Tracking Frontend & SEO Completion
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-19.17: IntersectionObserver impression tracking | Frontend 1 | 2.5 | Track when ad is 50% visible for 1 second, fire impression API call once per session per placement |
| FE-19.18: Click tracking wrapper | Frontend 1 | 1.5 | Wrap ad links with click tracking, fire API call, redirect to destination |
| FE-19.19: Ad component integration into page layouts | Frontend 2 | 3 | Add ad slots to: homepage (banner), article pages (sidebar, inline), store page (banner), event listing (inline) |
| FE-19.20: SEO audit weekly cron trigger | Backend | 1.5 | BullMQ scheduled job to run SEO audit weekly, store results, compare with previous |
| BE-19.19: Anti-fraud measures | Backend | 2.5 | IP-based rate limiting (max 10 impressions/minute/IP), User-Agent bot detection, duplicate filtering |
| QA-19.3: Ad impression and click tracking testing | QA | 3 | Verify impressions count correctly, clicks track, anti-fraud measures work |

#### Day 8 (Wednesday) - Ad Analytics Dashboard & Polish
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-19.21: Ad analytics dashboard section | Frontend 1 | 2.5 | Add advertising metrics to main admin dashboard: total impressions, clicks, revenue, active campaigns |
| FE-19.22: Ad revenue chart | Frontend 1 | 2 | Recharts bar chart: daily ad revenue, campaign breakdown |
| FE-19.23: SEO trend chart | Frontend 2 | 1.5 | Line chart showing SEO score over time (weekly audit results) |
| FE-19.24: Ad responsive sizing | Frontend 2 | 2 | Banner: 728x90 desktop, 320x50 mobile. Sidebar: 300x250. Inline: 728x90 desktop, 300x250 mobile |
| FE-19.25: Ad loading and empty state | Frontend 1 | 1 | Skeleton loader while ad loads, graceful collapse when no ad available |
| BE-19.20: Ad serving performance optimization | Backend | 2 | Redis cache for active ads per location (1-minute TTL), precompute eligible ads |

#### Day 9 (Thursday) - Integration Testing & Phase 3 Retrospective Prep
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-19.26: E2E test - campaign management flow | Frontend 1 | 2 | Create campaign, add placement, activate, verify serving |
| FE-19.27: E2E test - SEO audit flow | Frontend 2 | 2 | Run audit, view results, bulk edit, verify changes |
| FE-19.28: Ad component accessibility audit | Frontend 2 | 1.5 | Screen reader labels, keyboard navigation, reduced motion support |
| BE-19.21: Advertising module integration tests | Backend | 3 | Campaign CRUD, placement CRUD, ad serving, tracking, analytics |
| BE-19.22: SEO audit integration tests | Backend | 2 | Audit scan accuracy, bulk update, score calculation |
| QA-19.4: SEO audit tool testing | QA | 2.5 | Audit accuracy (verify detected issues are real), bulk edit, score calculation |
| QA-19.5: Cross-browser ad display testing | QA | 1.5 | Ad rendering on Chrome, Firefox, Safari, Edge; mobile viewports |

#### Day 10 (Friday) - Final Polish & Phase 3 Retrospective
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-19.29: Admin advertising section responsive design | Frontend 1 | 1.5 | Campaign forms, tables, and charts responsive on tablet/mobile |
| FE-19.30: Ad performance documentation | Frontend 1 | 1 | Document ad slot locations, dimensions, and integration points |
| FE-19.31: Final polish and bug fixes | Frontend 2 | 2 | Address QA feedback, fix visual inconsistencies |
| BE-19.23: API documentation for ad and SEO endpoints | Backend | 1.5 | Swagger docs for all new endpoints |
| QA-19.6: Full admin panel regression (including Sprint 18) | QA | 3 | Complete admin panel regression including advertising and SEO |
| ALL-19.1: Phase 3 Retrospective | All | 4 | Review Sprints 15-19 accomplishments, velocity, technical debt, lessons learned, Phase 4 priorities |

---

## Backend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| BE-19.1-19.4 | Advertising database & entities | Migrations, entities, repositories | 7 |
| BE-19.5-19.7 | Campaign CRUD | Service, status management, controller, DTOs | 7 |
| BE-19.8-19.10 | Placement CRUD & ad serving | Service, controller, serving endpoint | 7 |
| BE-19.11-19.14 | Ad tracking & analytics | Impression/click tracking, analytics aggregation, analytics endpoint | 8 |
| BE-19.15-19.17 | SEO audit service | Scanning service, endpoint, score calculation | 7 |
| BE-19.18-19.20 | SEO bulk update & ad optimization | Batch updates, anti-fraud, Redis caching, audit cron | 8 |
| BE-19.21-19.23 | Tests & documentation | Integration tests, Swagger docs | 6.5 |
| **Total** | | | **50.5** |

## Frontend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| FE-19.1-19.5 | Campaign management UI | Navigation, list page, creation form, table, status tabs | 9.5 |
| FE-19.6-19.12 | Campaign detail & placement UI | Detail page, placement form, placement list, analytics charts, preview, clone | 16 |
| FE-19.13-19.15 | SEO audit UI | Page layout, issues table, bulk edit modal | 7.5 |
| FE-19.16-19.19 | Public ad components | Banner component, page integration, impression tracking, click tracking | 9.5 |
| FE-19.21-19.25 | Ad analytics & polish | Dashboard section, revenue chart, SEO chart, responsive, loading states | 9 |
| FE-19.26-19.31 | Testing & final polish | E2E tests, accessibility, responsive, documentation, bug fixes | 8.5 |
| **Total** | | | **60** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---------|------|---------------|-------------|
| QA-19.1 | Campaign CRUD | Create/edit/delete campaigns; status transitions (draft->active->paused->completed); scheduling; clone | 3 |
| QA-19.2 | Placement & ad serving | Create placements with asset upload; verify ad serving by location; rotation/A/B; empty slots | 3 |
| QA-19.3 | Ad tracking | Impression counted after 50% visible for 1s; click tracked and redirected; anti-fraud: rate limiting, bot detection | 3 |
| QA-19.4 | SEO audit | Audit detects missing titles/descriptions/alt text; bulk edit updates correctly; score accurate | 2.5 |
| QA-19.5 | Cross-browser ads | Ad banner rendering, responsive sizes, Sponsored label, close button, empty state | 1.5 |
| QA-19.6 | Full regression | Sprints 18-19 admin panel, all sections, data integrity, RBAC | 3 |
| **Total** | | | **16** |

---

## Dependencies

```
Sprint 18 (admin panel core) --> FE-19.1 (admin navigation - extending existing shell)
BE-19.1-19.4 (database + entities) --> BE-19.5-19.10 (campaign + placement CRUD)
BE-19.5-19.7 (campaign CRUD) --> FE-19.3-19.5 (campaign UI)
BE-19.8-19.9 (placement CRUD) --> FE-19.7-19.8 (placement UI)
BE-19.10 (ad serving) --> FE-19.16 (public ad banner)
BE-19.10 (ad serving) --> BE-19.11-19.12 (tracking endpoints)
BE-19.11-19.12 (tracking) --> FE-19.17-19.18 (tracking integration)
BE-19.5-19.7 (campaigns) --> BE-19.6 (status scheduling cron)
FE-19.16 (ad banner component) --> FE-19.19 (page integration)
BE-19.15-19.17 (SEO audit backend) --> FE-19.13-19.15 (SEO audit UI)
BE-19.18 (SEO bulk update) --> FE-19.15 (bulk edit modal)
Cloudflare R2 (from Sprint 15) --> BE-19.8 (placement asset upload)
All content modules (articles, events, places, etc.) --> BE-19.15 (SEO audit scanning)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Ad tracking accuracy concerns (bots, ad blockers) | High | Medium | Implement server-side validation; accept that ad blockers will reduce counts; document methodology |
| SEO audit scanning large content sets is slow | Medium | Medium | Batch processing; run asynchronously via BullMQ; cache results |
| IntersectionObserver browser compatibility | Low | Medium | Polyfill for older browsers; fallback to simple load-based tracking |
| Ad creative asset dimension variety | Medium | Low | Enforce standard IAB sizes; validate on upload; provide dimension guidelines |
| Phase 3 retrospective reveals scope changes | Medium | Medium | Keep retrospective focused; separate action items from immediate sprint work |
| Ad serving latency exceeds 50ms target | Medium | High | Redis caching for active ads; precompute eligible ads hourly |
| Content modules lack uniform meta fields for SEO audit | Medium | Medium | Abstract SEO fields; handle missing fields gracefully in audit |

---

## Deliverables Checklist

- [ ] ad_campaigns table created and migrated
- [ ] ad_placements table created and migrated
- [ ] Campaign CRUD with status management and scheduling
- [ ] Placement CRUD with asset upload to Cloudflare R2
- [ ] Ad serving endpoint with targeting and rotation
- [ ] Impression tracking via IntersectionObserver
- [ ] Click tracking via redirect endpoint
- [ ] Anti-fraud measures (rate limiting, bot detection)
- [ ] Campaign analytics with daily breakdown
- [ ] Admin campaign management page (list, create, detail)
- [ ] Admin placement management with preview
- [ ] Admin ad analytics dashboard integration
- [ ] SEO audit endpoint scanning all content types
- [ ] Admin SEO audit page with issues table
- [ ] SEO bulk edit for meta titles and descriptions
- [ ] Public ad banner components integrated into page layouts
- [ ] Ad components responsive across breakpoints
- [ ] Phase 3 retrospective completed with action items documented

---

## Definition of Done

1. ad_campaigns and ad_placements tables are created with proper indexes and foreign keys
2. Campaigns can be created, scheduled, activated, paused, completed, and archived
3. Placements can be created with asset uploads and serve in designated page locations
4. Ad serving endpoint returns appropriate ads based on location, schedule, and targeting
5. Impressions are tracked when ad is 50% visible for 1 second (IntersectionObserver)
6. Clicks are tracked and redirect to the destination URL
7. Anti-fraud measures prevent duplicate impressions and excessive click rates
8. Campaign analytics show accurate daily impressions, clicks, and CTR
9. SEO audit scans all content types and correctly identifies issues
10. Bulk SEO edit updates meta fields for multiple pages in a single operation
11. Public ad banners render correctly across all breakpoints
12. All admin pages are accessible and functional with appropriate RBAC
13. Integration tests pass for campaign CRUD, ad serving, tracking, and SEO audit
14. Phase 3 retrospective is completed with documented outcomes
15. Code reviewed and approved by at least one other developer

---

## Sprint Review Demo Script

1. **Campaign Management** (5 min)
   - Create a new ad campaign ("Berlin Coffee Week Sponsor")
   - Set budget, date range, targeting (page: events, category: food)
   - Add a placement (728x90 banner, upload creative, set click URL)
   - Activate the campaign
   - Clone the campaign for a different date range

2. **Ad Serving & Display** (4 min)
   - Navigate to the events page, show the ad banner rendered
   - Show the "Sponsored" label
   - Resize browser, show responsive ad sizing
   - Show empty ad slot collapsing gracefully

3. **Ad Tracking** (3 min)
   - Scroll to see the ad, explain IntersectionObserver tracking
   - Click the ad, show click tracking redirect
   - Return to admin, show updated impressions and clicks
   - Show anti-fraud: rapid clicks are rate-limited

4. **Campaign Analytics** (3 min)
   - View campaign detail page
   - Show performance chart (impressions/clicks over time)
   - Show per-placement breakdown
   - Show CTR calculations

5. **SEO Audit** (5 min)
   - Run SEO audit from admin panel
   - Show results table: missing titles, short descriptions
   - Filter by severity (critical issues first)
   - Select 3 pages, bulk edit meta descriptions
   - Show SEO score improvement after fixes

6. **Dashboard Integration** (2 min)
   - Show advertising metrics on main admin dashboard
   - Show SEO score trend chart

7. **Phase 3 Retrospective Summary** (3 min)
   - Summarize Phase 3 accomplishments (Sprints 15-19)
   - Highlight key learnings
   - Preview Phase 4 priorities

---

## Rollover Criteria

Tasks may roll over to Sprint 20 if:
- Ad tracking IntersectionObserver implementation has cross-browser issues taking more than 4 extra hours
- SEO audit scanning requires refactoring content module meta fields (>6 hours additional)
- Campaign scheduling cron has reliability issues requiring more than 3 extra hours

Tasks that MUST complete in this sprint (no rollover):
- ad_campaigns and ad_placements database tables
- Campaign CRUD backend and frontend
- Placement CRUD with asset upload
- Ad serving endpoint
- Basic impression and click tracking
- SEO audit endpoint and frontend page
- Phase 3 retrospective

Deprioritized if time is short:
- A/B testing (weighted rotation) for placements
- Ad dismiss/close button
- SEO trend chart
- Campaign clone functionality
- Anti-fraud bot detection (keep rate limiting only)
