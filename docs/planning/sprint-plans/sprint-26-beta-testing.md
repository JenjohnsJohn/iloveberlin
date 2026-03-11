# Sprint 26: Beta Testing & Content Seeding

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 26 |
| **Sprint Name** | Beta Testing & Content Seeding |
| **Duration** | 2 weeks (10 working days) |
| **Start Date** | Week 51 (Day 251) |
| **End Date** | Week 52 (Day 260) |
| **Phase** | Phase 5 -- Launch Preparation |

## Sprint Goal

Populate iloveberlin.biz with real, high-quality Berlin content across all content types, recruit and onboard 20-30 beta testers, run structured testing sessions with a built-in feedback system, triage and fix all critical and high-priority bugs, refine UX based on tester feedback, conduct cross-browser and cross-device testing, and perform an accessibility audit -- ensuring the platform is content-rich, user-validated, and polished for launch.

---

## User Stories

### US-26-01: Seed Real Berlin Content
**As a** platform operator,
**I want** the platform populated with real, high-quality Berlin content,
**so that** beta testers and launch-day users experience a fully functional, content-rich platform.

**Acceptance Criteria:**
- [ ] 50+ articles published: covering neighborhoods, culture, history, practical guides, seasonal content
- [ ] 100+ events created: real upcoming Berlin events across categories (music, art, food, nightlife, family, sports)
- [ ] 30+ restaurants added: diverse cuisines, neighborhoods, and price ranges with photos and accurate details
- [ ] 20+ city guides published: transportation, housing, visa, healthcare, language, nightlife, shopping, parks
- [ ] 20+ videos added: Berlin tours, cultural highlights, neighborhood walks, food scenes, interviews
- [ ] All content has high-quality images (minimum 800x600px, optimized for web)
- [ ] All content is tagged and categorized correctly
- [ ] All content is indexed in Meilisearch and searchable
- [ ] Content is spread across categories to demonstrate the platform's breadth

### US-26-02: Recruit and Onboard Beta Testers
**As a** platform operator,
**I want** 20-30 engaged beta testers from the target audience,
**so that** I get authentic feedback before public launch.

**Acceptance Criteria:**
- [ ] Beta tester recruitment via: Berlin expat communities, social media, personal networks
- [ ] Target demographics: mix of expats, tourists, long-term residents, different age groups
- [ ] Beta tester welcome email with: staging URL, test account credentials (or signup link), testing guide, feedback instructions
- [ ] Beta testers added to a dedicated communication channel (Slack, Telegram, or email group)
- [ ] NDA or testing agreement (optional) shared if needed
- [ ] Incentive defined: credit on launch page, free premium access, or small gift

### US-26-03: In-App Feedback System
**As a** beta tester,
**I want** an easy way to report bugs and share feedback without leaving the app,
**so that** I can contribute to improving the platform seamlessly.

**Acceptance Criteria:**
- [ ] Floating feedback button on all pages (bottom-right corner, collapsible)
- [ ] Feedback form: type (bug, suggestion, compliment), description (text area), screenshot upload, page URL (auto-captured), browser/device info (auto-captured)
- [ ] `feedback` table: id, user_id (nullable), type, description, screenshot_url, page_url, user_agent, status (new/reviewed/in-progress/resolved/wont-fix), created_at
- [ ] POST `/api/feedback` endpoint
- [ ] Admin feedback dashboard: list all feedback, filter by type and status, update status, add internal notes
- [ ] Email notification to admin team when new feedback is submitted
- [ ] Feedback submitter receives confirmation toast: "Thank you for your feedback!"

### US-26-04: Structured Testing Sessions
**As a** platform operator,
**I want** beta testers to follow structured test scenarios,
**so that** all critical user flows are validated by real users.

**Acceptance Criteria:**
- [ ] Testing guide document with numbered test scenarios covering:
  - Account registration and login
  - Browse and search for events, dining, articles, videos
  - View content detail pages (verify all data displays correctly)
  - Add/remove favorites and verify sync
  - Enter a competition
  - Post a classified listing
  - Update profile and notification preferences
  - Use the mobile app (if applicable) for the same flows
  - Test on different devices/browsers
- [ ] Each scenario has expected outcome and a pass/fail checkbox
- [ ] Testing sessions scheduled: 2 sessions in Week 1, 2 sessions in Week 2
- [ ] Session summary reports produced after each session
- [ ] Drop-in feedback calls (30 min) offered for testers who prefer verbal feedback

### US-26-05: Bug Triage and Prioritization
**As a** development team,
**I want** reported bugs triaged and prioritized systematically,
**so that** we fix the most impactful issues first.

**Acceptance Criteria:**
- [ ] Bug triage process defined: daily review of new feedback and bugs
- [ ] Priority levels: Critical (blocks core flow, data loss), High (significant UX issue, workaround exists), Medium (minor UX issue), Low (cosmetic, nice-to-have)
- [ ] All bugs logged in issue tracker with: title, description, steps to reproduce, expected vs. actual behavior, priority, assigned developer
- [ ] Critical bugs assigned immediately, fix targeted within 24 hours
- [ ] High-priority bugs assigned within 48 hours
- [ ] Daily standup includes bug triage status
- [ ] Bug burn-down tracked (new vs. resolved per day)

### US-26-06: Fix Critical and High Bugs
**As a** platform operator,
**I want** all critical and high-priority bugs fixed during beta,
**so that** the platform is stable for launch.

**Acceptance Criteria:**
- [ ] All critical bugs fixed and verified within 24 hours of identification
- [ ] All high-priority bugs fixed and verified within the sprint
- [ ] Fixes deployed to staging environment for beta testers to re-verify
- [ ] Regression tests written for each critical/high bug fix
- [ ] Zero critical bugs open at end of sprint
- [ ] High-priority bug count at end of sprint: maximum 3 (with documented remediation plan)

### US-26-07: UX Refinements Based on Feedback
**As a** user,
**I want** the platform to feel polished and intuitive,
**so that** I enjoy using it and return frequently.

**Acceptance Criteria:**
- [ ] UX feedback collected from beta testers categorized by theme
- [ ] Top 5 UX improvement themes identified and addressed
- [ ] Navigation refinements: any confusing flows simplified
- [ ] Loading state improvements: any screens with jarring load experiences smoothed
- [ ] Error message improvements: any unclear error messages rewritten
- [ ] Mobile responsiveness issues fixed on all tested devices
- [ ] Before/after comparison documented for significant UX changes

### US-26-08: Cross-Browser Testing
**As a** user using any modern browser,
**I want** the platform to work correctly,
**so that** I have a consistent experience regardless of browser choice.

**Acceptance Criteria:**
- [ ] Chrome (latest): full test pass, all features functional
- [ ] Firefox (latest): full test pass, all features functional
- [ ] Safari (latest on macOS and iOS): full test pass, all features functional
- [ ] Edge (latest): full test pass, all features functional
- [ ] Layout and styling consistent across all browsers
- [ ] JavaScript functionality (forms, modals, navigation) works in all browsers
- [ ] Browser-specific bugs logged and fixed (or documented with workaround)
- [ ] Cross-browser test report produced

### US-26-09: Cross-Device Testing
**As a** user on any device type,
**I want** the platform to work well on my device,
**so that** I can use it comfortably.

**Acceptance Criteria:**
- [ ] iPhone (Safari): full test pass including touch interactions
- [ ] Android phone (Chrome): full test pass including touch interactions
- [ ] iPad/Android tablet: full test pass, layout adapts to tablet viewport
- [ ] Desktop (1920x1080 and 1366x768): full test pass, layout uses available space
- [ ] Responsive breakpoints verified: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- [ ] Touch targets minimum 44x44px on mobile
- [ ] No horizontal scrolling on any device width
- [ ] Device-specific bugs logged and fixed
- [ ] Cross-device test report produced

### US-26-10: Accessibility Audit (VoiceOver, TalkBack)
**As a** user with accessibility needs,
**I want** the platform to be usable with screen readers and keyboard navigation,
**so that** the platform is inclusive.

**Acceptance Criteria:**
- [ ] VoiceOver (iOS/macOS) test: navigate through main flows, verify all content is announced correctly
- [ ] TalkBack (Android) test: navigate through main flows in the Flutter app
- [ ] Keyboard navigation: all interactive elements reachable via Tab, activatable via Enter/Space
- [ ] Focus indicators visible on all focusable elements
- [ ] All images have meaningful alt text (or empty alt for decorative images)
- [ ] Form inputs have associated labels
- [ ] ARIA landmarks used on main page regions (header, nav, main, footer)
- [ ] Color contrast ratio meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Accessibility issues logged with WCAG reference and priority
- [ ] Critical accessibility issues (blocking screen reader usage) fixed this sprint
- [ ] Accessibility audit report produced

---

## Day-by-Day Task Breakdown

### Week 1 (Days 251-255)

#### Day 1 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-01 | Content plan: outline 50+ article topics, assign to content categories | Content | 3 | -- |
| T26-02 | Begin article creation: write and publish 10 articles (neighborhoods, culture) | Content | 5 | T26-01 |
| T26-03 | Build feedback system: `feedback` table migration, POST `/api/feedback` endpoint | Backend | 3 | -- |
| T26-04 | Build feedback system: admin dashboard (list, filter, status update, notes) | Backend | 3 | T26-03 |

#### Day 2 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-05 | Continue articles: write and publish 10 more articles (history, practical guides) | Content | 5 | -- |
| T26-06 | Begin events: create 30 upcoming Berlin events with images | Content | 4 | -- |
| T26-07 | Frontend: floating feedback button + feedback form (type, description, screenshot, auto-capture URL/UA) | Frontend | 4 | T26-03 |
| T26-08 | Email notification to admin on new feedback submission | Backend | 1 | T26-03 |

#### Day 3 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-09 | Continue articles: write and publish 10 more articles (seasonal, food, nightlife) | Content | 5 | -- |
| T26-10 | Continue events: create 30 more events with images | Content | 4 | -- |
| T26-11 | Begin restaurants: add 15 restaurants with photos, menus, hours | Content | 4 | -- |
| T26-12 | Draft beta tester recruitment message and testing guide document | PM | 3 | -- |

#### Day 4 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-13 | Continue articles: write and publish 10 more articles (guides, tips) | Content | 5 | -- |
| T26-14 | Continue events: create 20 more events | Content | 3 | -- |
| T26-15 | Continue restaurants: add 15 more restaurants | Content | 4 | -- |
| T26-16 | Begin city guides: write and publish 10 guides (transport, housing, visa, healthcare, language) | Content | 4 | -- |
| T26-17 | Send recruitment outreach to Berlin expat communities, social media | PM | 2 | T26-12 |

#### Day 5 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-18 | Finish articles: write and publish remaining 10+ articles | Content | 5 | -- |
| T26-19 | Continue events: create 20 more events (total 100+) | Content | 3 | -- |
| T26-20 | Continue city guides: write and publish 10 more guides (nightlife, shopping, parks, culture) | Content | 4 | -- |
| T26-21 | Begin videos: add 10 videos with thumbnails and metadata | Content | 3 | -- |
| T26-22 | Onboard first batch of beta testers: send welcome emails, share testing guide, create communication channel | PM | 3 | T26-17 |
| T26-23 | Run first structured testing session with available beta testers | QA/PM | 2 | T26-22 |

### Week 2 (Days 256-260)

#### Day 6 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-24 | Finish videos: add 10 more videos (total 20+) | Content | 3 | -- |
| T26-25 | Content QA: verify all content has images, correct categories, tags, and is searchable in Meilisearch | Content/QA | 4 | T26-18 through T26-24 |
| T26-26 | Triage feedback from first testing session: categorize, prioritize, assign bugs | QA | 3 | T26-23 |
| T26-27 | Fix critical bugs identified in session 1 | Backend/Frontend | 4 | T26-26 |

#### Day 7 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-28 | Run second structured testing session | QA/PM | 2 | T26-27 |
| T26-29 | Fix high-priority bugs from sessions 1 and 2 | Backend/Frontend | 5 | T26-26 |
| T26-30 | UX refinement: identify top 5 UX themes from feedback | Frontend | 2 | T26-26 |
| T26-31 | Begin UX refinements: navigation, loading states, error messages | Frontend | 3 | T26-30 |

#### Day 8 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-32 | Cross-browser testing: Chrome full test pass | QA | 2.5 | -- |
| T26-33 | Cross-browser testing: Firefox full test pass | QA | 2.5 | -- |
| T26-34 | Cross-browser testing: Safari (macOS + iOS) full test pass | QA | 2.5 | -- |
| T26-35 | Cross-browser testing: Edge full test pass | QA | 2 | -- |
| T26-36 | Fix browser-specific bugs found during testing | Frontend | 3 | T26-32 through T26-35 |
| T26-37 | Continue UX refinements | Frontend | 2 | T26-31 |

#### Day 9 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-38 | Cross-device testing: iPhone (Safari) full test pass with touch interactions | QA | 2 | -- |
| T26-39 | Cross-device testing: Android phone (Chrome) full test pass | QA | 2 | -- |
| T26-40 | Cross-device testing: tablet (iPad or Android tablet) full test pass | QA | 2 | -- |
| T26-41 | Cross-device testing: desktop at 1920x1080 and 1366x768 | QA | 1.5 | -- |
| T26-42 | Fix device-specific bugs and responsive layout issues | Frontend | 3 | T26-38 through T26-41 |
| T26-43 | Run third structured testing session (beta testers on their own devices) | QA/PM | 2 | -- |

#### Day 10 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T26-44 | Accessibility audit: VoiceOver (macOS) on main web flows | QA | 2 | -- |
| T26-45 | Accessibility audit: TalkBack (Android) on Flutter app | QA | 2 | -- |
| T26-46 | Accessibility audit: keyboard navigation, focus indicators, ARIA landmarks | QA | 2 | -- |
| T26-47 | Accessibility audit: color contrast check (WCAG AA), alt text review, form labels | QA | 2 | -- |
| T26-48 | Fix critical accessibility issues (screen reader blockers) | Frontend/Mobile | 3 | T26-44 through T26-47 |
| T26-49 | Run fourth testing session and collect final feedback | QA/PM | 1.5 | -- |
| T26-50 | Final bug triage: confirm zero critical, count remaining high, document medium/low for backlog | QA | 1.5 | T26-49 |
| T26-51 | Produce cross-browser, cross-device, and accessibility audit reports | QA | 2 | T26-32-47 |
| T26-52 | Write regression tests for all critical/high bug fixes | Backend/QA | 2 | T26-27, T26-29 |

---

## Backend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T26-03 | Feedback endpoint | Migration (feedback table), POST /api/feedback, validation, file upload for screenshot | 3 |
| T26-04 | Admin feedback dashboard | GET /api/admin/feedback with filters, PATCH status update, internal notes field | 3 |
| T26-08 | Feedback notification | Email to admin team on new feedback via email queue | 1 |
| T26-27 | Critical bug fixes (session 1) | Fix session 1 critical bugs (estimate; actual depends on findings) | 4 |
| T26-29 | High-priority bug fixes | Fix session 1+2 high-priority bugs | 5 |
| | **Backend Total** | | **16** |

## Frontend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T26-07 | Feedback widget | Floating button, form with type dropdown, description textarea, screenshot upload, auto-capture, confirmation toast | 4 |
| T26-30-31 | UX identification + refinement | Categorize feedback themes, navigation fixes, loading state improvements, error message rewrites | 5 |
| T26-36 | Browser bug fixes | Fix CSS/JS issues specific to Firefox, Safari, Edge | 3 |
| T26-37 | UX refinement continued | Additional polish based on feedback themes | 2 |
| T26-42 | Device bug fixes | Responsive layout fixes, touch target sizing, horizontal scroll fixes | 3 |
| T26-48 | Accessibility fixes | Focus indicators, alt text, ARIA landmarks, color contrast adjustments, label associations | 3 |
| | **Frontend Total** | | **20** |

## Content Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T26-01 | Article planning | Topic outline, category assignment, keyword research | 3 |
| T26-02, 05, 09, 13, 18 | Article creation (50+) | Write, source images, format, publish, tag, categorize (10 articles/day x 5 days) | 25 |
| T26-06, 10, 14, 19 | Event creation (100+) | Research real events, add details, images, dates, venues (25 events/day x 4 days) | 14 |
| T26-11, 15 | Restaurant creation (30+) | Research restaurants, add photos, menus, hours, addresses (15/day x 2 days) | 8 |
| T26-16, 20 | City guide creation (20+) | Write comprehensive guides, source images, publish (10 guides/day x 2 days) | 8 |
| T26-21, 24 | Video addition (20+) | Source videos, add metadata, thumbnails, descriptions (10/day x 2 days) | 6 |
| T26-25 | Content QA | Verify images, categories, tags, Meilisearch indexing for all content | 4 |
| | **Content Total** | | **68** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---|---|---|---|
| T26-23 | Testing session 1 | Guided walk-through with first batch of beta testers; observe, note issues, collect verbal feedback | 2 |
| T26-26 | Bug triage session 1 | Review all feedback, categorize by type and priority, create issue tracker entries, assign | 3 |
| T26-28 | Testing session 2 | Second guided session with bug fixes deployed; focus on previously broken flows | 2 |
| T26-32-35 | Cross-browser testing | Chrome, Firefox, Safari (macOS + iOS), Edge: full feature test pass on each; document issues | 9.5 |
| T26-38-41 | Cross-device testing | iPhone, Android phone, tablet, desktop (2 resolutions): full test pass; document issues | 7.5 |
| T26-43 | Testing session 3 | Unguided session: testers use platform freely on their own devices; collect feedback forms | 2 |
| T26-44-47 | Accessibility audit | VoiceOver, TalkBack, keyboard nav, focus indicators, ARIA, color contrast, alt text, form labels | 8 |
| T26-49 | Testing session 4 | Final session: verify all critical/high fixes; collect final satisfaction feedback | 1.5 |
| T26-50 | Final triage | Confirm zero critical bugs; count high/medium/low; document backlog items | 1.5 |
| T26-51 | Test reports | Cross-browser report, cross-device report, accessibility audit report | 2 |
| T26-52 | Regression tests | Write automated tests for each critical/high bug fix | 2 |
| | **QA Total** | | **41** |

## PM Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T26-12 | Recruitment prep | Write recruitment message, testing guide, test scenarios with expected outcomes | 3 |
| T26-17 | Outreach | Post to communities, DM candidates, manage sign-ups | 2 |
| T26-22 | Onboarding | Welcome emails, account setup, communication channel, testing guide distribution | 3 |
| | **PM Total** | | **8** |

---

## Dependencies

```
T26-01 (article plan) --> T26-02, 05, 09, 13, 18 (article creation)
T26-03 (feedback backend) --> T26-04 (admin dashboard), T26-07 (frontend widget), T26-08 (notification)
T26-12 (recruitment prep) --> T26-17 (outreach) --> T26-22 (onboarding) --> T26-23 (session 1)
T26-23 (session 1) --> T26-26 (triage) --> T26-27 (critical fixes), T26-29 (high fixes)
T26-27 (critical fixes) --> T26-28 (session 2)
T26-26 --> T26-30 (UX themes) --> T26-31, T26-37 (UX refinements)
T26-32-35 (cross-browser) --> T26-36 (browser fixes)
T26-38-41 (cross-device) --> T26-42 (device fixes)
T26-44-47 (accessibility audit) --> T26-48 (a11y fixes)
T26-27, T26-29 --> T26-52 (regression tests)
All content tasks --> T26-25 (content QA)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Insufficient beta tester recruitment (fewer than 20) | Medium | Medium | Start outreach early in Week 1; broaden channels; offer stronger incentives |
| Beta testers unresponsive or drop out | Medium | Medium | Over-recruit (target 30); regular reminders; quick feedback loop to show testers their input matters |
| High volume of bugs overwhelms development capacity | Medium | High | Strict triage: only fix critical/high in sprint; medium/low to backlog; focus on launch-blocking issues |
| Content creation takes longer than estimated | Medium | Medium | Prioritize articles and events (most visible content); accept 80% of target if time runs short |
| Accessibility fixes require significant UI refactoring | Medium | High | Focus on critical a11y issues (screen reader access, keyboard nav); defer cosmetic a11y to post-launch |
| Cross-browser Safari issues (known CSS/JS differences) | High | Medium | Test Safari early; use CSS autoprefixer; document known Safari limitations |

---

## Deliverables Checklist

- [ ] 50+ articles published and searchable
- [ ] 100+ events created with images and correct dates
- [ ] 30+ restaurants added with photos and details
- [ ] 20+ city guides published
- [ ] 20+ videos added with thumbnails
- [ ] All content tagged, categorized, and indexed in Meilisearch
- [ ] 20-30 beta testers recruited and onboarded
- [ ] In-app feedback system (floating button + form + admin dashboard)
- [ ] 4 structured testing sessions completed
- [ ] Bug triage process established and executed daily
- [ ] All critical bugs fixed (zero open)
- [ ] All high-priority bugs fixed (maximum 3 open with plan)
- [ ] Top 5 UX improvements implemented based on feedback
- [ ] Cross-browser test pass: Chrome, Firefox, Safari, Edge
- [ ] Cross-device test pass: iPhone, Android, tablet, desktop
- [ ] Accessibility audit completed (VoiceOver, TalkBack, keyboard, contrast)
- [ ] Critical accessibility issues fixed
- [ ] Regression tests for all critical/high bug fixes
- [ ] Cross-browser, cross-device, and accessibility reports produced

---

## Definition of Done

- Platform contains at minimum 50 articles, 100 events, 30 restaurants, 20 guides, and 20 videos -- all searchable
- At least 20 beta testers have completed structured testing sessions
- Feedback system is functional and capturing submissions
- Zero critical bugs open; maximum 3 high-priority bugs open with documented remediation plans
- Top UX improvements implemented based on structured feedback analysis
- Platform works correctly on Chrome, Firefox, Safari, and Edge (latest versions)
- Platform works correctly on iPhone, Android phone, tablet, and desktop
- Accessibility audit report produced with critical issues resolved
- All test reports (browser, device, accessibility) committed to the repository
- Regression test suite includes tests for every critical and high bug fix
- All code reviewed and merged

---

## Sprint Review Demo Script

1. **Content showcase** (4 min): Browse articles by category, show variety and quality; search for "restaurants in Kreuzberg" -- show relevant results; browse events calendar; open a city guide; play a video
2. **Feedback system** (2 min): Click floating feedback button; fill in a bug report with screenshot; submit; show confirmation toast; open admin feedback dashboard; show the submission; update status to "in-progress"
3. **Beta testing results** (3 min): Present summary statistics: number of testers, sessions completed, total feedback items, bug counts by priority; show bug burn-down chart (new vs. resolved over 2 weeks)
4. **Bug fix highlights** (3 min): Walk through the top 3-5 critical/high bugs that were fixed; show before (screenshot/description) and after (live demo)
5. **UX improvements** (3 min): Present the top 5 UX themes from feedback; demonstrate each improvement with before/after comparison
6. **Cross-browser results** (2 min): Show test report summary; demonstrate any notable browser-specific fixes; confirm all 4 browsers pass
7. **Cross-device results** (2 min): Show test report summary; demonstrate responsive layout at phone, tablet, and desktop widths; show any device-specific fixes
8. **Accessibility results** (3 min): Present accessibility audit findings summary; demonstrate VoiceOver navigating the homepage; show keyboard tab navigation through the main menu; highlight color contrast improvements
9. **Remaining items** (2 min): Present any remaining high/medium bugs with remediation timeline; show backlog of post-launch improvements from beta feedback

**Total demo time:** ~24 minutes

---

## Rollover Criteria

Items roll over to Sprint 27 if:
- Content count is below target but above 70% (e.g., 35 articles, 70 events) -- continue seeding in Sprint 27
- Some medium-priority bugs remain unfixed -- add to post-launch backlog
- Non-critical accessibility issues remain -- schedule for post-launch iteration
- Cross-browser/device testing found issues that require deeper investigation -- document and schedule

Items that **must** be completed this sprint (no rollover):
- Minimum viable content: 30 articles, 50 events, 20 restaurants, 10 guides, 10 videos
- Beta testing: at least 2 structured sessions with at least 15 testers
- Feedback system functional
- All critical bugs fixed (zero open)
- Cross-browser testing completed on all 4 browsers
- Accessibility audit completed (even if not all issues fixed)
