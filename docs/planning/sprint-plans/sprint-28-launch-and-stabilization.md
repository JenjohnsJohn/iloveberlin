# Sprint 28: Launch & Stabilization

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 28 |
| **Sprint Name** | Launch & Stabilization |
| **Duration** | 2 weeks (10 working days) |
| **Start Date** | Week 55 (Day 271) |
| **End Date** | Week 56 (Day 280) |
| **Phase** | Phase 5 -- Launch |

## Sprint Goal

Execute the live launch of iloveberlin.biz by performing the DNS cutover and full service verification, maintain heightened monitoring for the first 72 hours to catch and resolve any launch-day issues, monitor Core Web Vitals, search engine crawling, and mobile crash reports, publish the launch announcement, respond to early user feedback, fix critical bugs under rapid-response SLA, execute social media promotion, compile a known issues list for the next development cycle, and conduct a comprehensive post-launch retrospective to capture lessons learned.

---

## User Stories

### US-28-01: DNS Cutover and Service Verification
**As a** DevOps engineer,
**I want to** execute the DNS cutover and verify all services are operational,
**so that** iloveberlin.biz is live and accessible to the public.

**Acceptance Criteria:**
- [ ] Pre-launch checklist from runbook completed (all items green)
- [ ] DNS records updated in Cloudflare to point to production server
- [ ] DNS propagation verified using multiple tools (dig, whatsmydns.com)
- [ ] HTTPS verified: valid certificate, no mixed content warnings
- [ ] Frontend loads correctly at https://iloveberlin.biz and https://www.iloveberlin.biz
- [ ] API responds at https://iloveberlin.biz/api with correct data
- [ ] User registration and login work end-to-end
- [ ] Search returns results
- [ ] Image and media loading verified
- [ ] Email sending verified (trigger a test email flow)
- [ ] Push notifications verified (send test push to a device)
- [ ] Monitoring subdomain accessible (monitor.iloveberlin.biz)
- [ ] All Cloudflare settings active (WAF, page rules, SSL Full Strict)
- [ ] Launch timestamp recorded

### US-28-02: Heightened Monitoring (First 72 Hours)
**As a** DevOps engineer,
**I want** heightened monitoring during the first 72 hours post-launch,
**so that** any issue is detected and resolved before it impacts a significant number of users.

**Acceptance Criteria:**
- [ ] On-call rotation established for first 72 hours (24/7 coverage)
- [ ] Grafana dashboards reviewed every 30 minutes during business hours (first 24 hours)
- [ ] Grafana dashboards reviewed every 2 hours for hours 24-72
- [ ] Alert thresholds temporarily tightened:
  - Error rate alert: > 2% (lowered from 5%)
  - p95 latency alert: > 500ms (lowered from 1s)
  - Disk usage alert: > 70% (lowered from 80%)
- [ ] Slack incident channel created for real-time communication
- [ ] Uptime monitoring checks verified (external pings every 1 minute)
- [ ] Database connection pool utilization monitored (PgBouncer stats)
- [ ] Redis memory usage monitored
- [ ] BullMQ queue depths monitored (email queue, background jobs)
- [ ] Monitoring log with observations recorded every check cycle

### US-28-03: Monitor and Fix Launch-Day Issues
**As a** development team,
**I want** a rapid-response process for launch-day issues,
**so that** critical problems are resolved within minutes.

**Acceptance Criteria:**
- [ ] Issue severity classification applied immediately on detection:
  - **P0 (Critical)**: Site down, data loss, security breach -> fix within 30 minutes
  - **P1 (High)**: Core feature broken (auth, search, content loading) -> fix within 2 hours
  - **P2 (Medium)**: Non-core feature broken (sharing, favorites sync) -> fix within 24 hours
  - **P3 (Low)**: Cosmetic issue, minor UX problem -> track for next cycle
- [ ] Hotfix deployment procedure established: branch from main, fix, test on staging, deploy to production
- [ ] Rollback procedure ready: revert to previous Docker images if hotfix causes regression
- [ ] Communication template ready for status updates (internal Slack, external status page if applicable)
- [ ] All P0 issues resolved on launch day
- [ ] All P1 issues resolved within first 48 hours
- [ ] Issue log maintained with: timestamp, description, severity, resolution, time-to-resolve

### US-28-04: Monitor Core Web Vitals
**As a** platform operator,
**I want** Core Web Vitals monitored from day one,
**so that** I can ensure excellent user experience and SEO ranking.

**Acceptance Criteria:**
- [ ] Largest Contentful Paint (LCP): target < 2.5 seconds (measured on real users)
- [ ] First Input Delay (FID) / Interaction to Next Paint (INP): target < 200ms
- [ ] Cumulative Layout Shift (CLS): target < 0.1
- [ ] Web Vitals measured via:
  - Google Search Console (Core Web Vitals report)
  - Google Analytics 4 (Web Vitals events)
  - PageSpeed Insights spot checks on key pages
- [ ] Any page with "Poor" Core Web Vitals identified and improvement plan created
- [ ] Performance optimization applied if any vital is in "Needs Improvement" range:
  - LCP: optimize hero images, preload critical resources, improve server response time
  - INP: reduce JavaScript execution time, defer non-critical scripts
  - CLS: set explicit dimensions on images/ads, avoid dynamic content injection above fold

### US-28-05: Monitor Search Engine Crawling
**As a** platform operator,
**I want** to verify search engines are crawling and indexing the site,
**so that** content starts appearing in search results.

**Acceptance Criteria:**
- [ ] Google Search Console: verify Googlebot is crawling pages (Coverage report)
- [ ] Check for crawl errors (404s, 5xxs, redirect issues) and fix immediately
- [ ] Verify sitemap.xml is being processed (submitted URLs vs. indexed URLs)
- [ ] Check robots.txt is not blocking important pages
- [ ] Bing Webmaster Tools: verify BingBot crawling
- [ ] Monitor indexing progress: target 50%+ of pages indexed within 7 days
- [ ] Submit individual high-priority URLs for indexing if not crawled (Inspect URL tool)
- [ ] Structured data validation: verify schema.org markup renders correctly (Rich Results Test)

### US-28-06: Monitor Mobile Crash Reports
**As a** mobile developer,
**I want** to monitor mobile app crash reports,
**so that** I can fix stability issues quickly.

**Acceptance Criteria:**
- [ ] Firebase Crashlytics enabled for both iOS and Android builds
- [ ] Crash-free user rate target: > 99%
- [ ] Crashlytics dashboard reviewed daily
- [ ] Any crash affecting > 1% of users investigated and fixed within 24 hours
- [ ] Non-fatal errors (API failures, network timeouts) logged and monitored
- [ ] App ANR (Application Not Responding) reports for Android reviewed
- [ ] Crash fixes released as app updates (expedited review for critical fixes)

### US-28-07: Publish Launch Announcement
**As a** platform operator,
**I want** a launch announcement published across channels,
**so that** the target audience knows iloveberlin.biz is live.

**Acceptance Criteria:**
- [ ] Launch blog post or announcement page on iloveberlin.biz published
- [ ] Email announcement sent to newsletter subscribers (via Brevo)
- [ ] Social media posts published: Facebook, Instagram, Twitter/X, LinkedIn
- [ ] App store availability announced (with download links)
- [ ] Berlin expat community channels notified (Facebook groups, Reddit r/berlin, InterNations)
- [ ] Beta testers thanked with a personalized message
- [ ] Press kit available if media inquiries come in (one-pager about the platform)

### US-28-08: Respond to User Feedback
**As a** platform operator,
**I want to** actively respond to early user feedback,
**so that** users feel heard and the platform improves based on real usage.

**Acceptance Criteria:**
- [ ] In-app feedback system monitored continuously (same system from Sprint 26)
- [ ] All feedback reviewed within 4 hours during business hours
- [ ] Feedback acknowledgment sent to user within 24 hours (if email available)
- [ ] Actionable feedback categorized: bug, UX improvement, feature request, content issue
- [ ] Quick wins (fixes under 1 hour) addressed immediately
- [ ] Larger items added to backlog with priority
- [ ] App store reviews monitored and responded to (both App Store and Google Play)
- [ ] Social media mentions monitored and engaged with

### US-28-09: Fix Critical Post-Launch Bugs
**As a** development team,
**I want** to fix critical bugs discovered after launch,
**so that** the platform remains stable and trustworthy.

**Acceptance Criteria:**
- [ ] Hotfix branch created from production tag for each critical fix
- [ ] Fix verified on staging before deploying to production
- [ ] Hotfix deployed to production with zero-downtime process (rolling update)
- [ ] Regression test run after each hotfix deployment
- [ ] Users affected by the bug notified if appropriate (email or in-app)
- [ ] Post-incident report written for any P0 issue (root cause, timeline, resolution, prevention)
- [ ] All P0 bugs fixed within Sprint 28
- [ ] All P1 bugs fixed or have documented remediation plan

### US-28-10: Social Media Promotion
**As a** marketing team,
**I want** a sustained social media promotion during launch week,
**so that** awareness and user acquisition grow beyond the initial announcement.

**Acceptance Criteria:**
- [ ] Day 1: Launch announcement post (all platforms)
- [ ] Day 2: Feature spotlight -- "Discover Berlin Events" with event screenshots
- [ ] Day 3: Feature spotlight -- "Find the Best Restaurants" with dining screenshots
- [ ] Day 4: Community engagement -- "What's your favorite Berlin neighborhood?" poll/question
- [ ] Day 5: Feature spotlight -- "Berlin City Guides" with guide screenshots
- [ ] Day 6-7: User testimonials or beta tester quotes (with permission)
- [ ] Day 8-10: Continued posting as per schedule, engagement with comments
- [ ] Hashtags defined: #ILoveBerlin #BerlinGuide #ExpatBerlin #VisitBerlin
- [ ] Cross-promotion with Berlin community accounts (if relationships established)
- [ ] Social media metrics tracked: followers, engagement rate, click-throughs, app downloads

### US-28-11: Known Issues List for Next Cycle
**As a** product owner,
**I want** a documented list of known issues and improvement opportunities,
**so that** the next development cycle has a clear starting backlog.

**Acceptance Criteria:**
- [ ] All open bugs categorized by severity and area (frontend, backend, mobile, infrastructure)
- [ ] Feature requests collected during beta and launch consolidated
- [ ] UX improvements identified but not implemented documented
- [ ] Technical debt items identified during development captured
- [ ] Performance optimization opportunities documented
- [ ] Accessibility improvements not yet addressed listed
- [ ] Each item has: title, description, priority recommendation, estimated effort
- [ ] List organized as a prioritized backlog for Sprint 29+ planning
- [ ] Stakeholder input collected on priority ranking

### US-28-12: Post-Launch Retrospective
**As a** development team,
**I want** a comprehensive post-launch retrospective,
**so that** we capture what worked, what did not, and how to improve for future projects.

**Acceptance Criteria:**
- [ ] Retrospective scheduled in Week 2 (after initial stabilization)
- [ ] All team members participate (development, design, content, PM, DevOps)
- [ ] Format: What went well, What could be improved, Action items
- [ ] Topics covered:
  - Overall project timeline (28 sprints) vs. original estimate
  - Technical architecture decisions (what worked, what would change)
  - Sprint planning accuracy (velocity predictions vs. actual)
  - Quality and testing approach effectiveness
  - Communication and collaboration
  - Launch execution smoothness
  - Content strategy effectiveness
  - Biggest challenges and how they were overcome
- [ ] Action items assigned with owners and due dates
- [ ] Retrospective summary document produced and shared with stakeholders
- [ ] Celebration of launch achievement

---

## Day-by-Day Task Breakdown

### Week 1 (Days 271-275) -- Launch Week

#### Day 1 (Monday) -- LAUNCH DAY
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-01 | Execute pre-launch checklist from runbook (final verification of all systems) | DevOps | 1 | -- |
| T28-02 | DNS cutover: update records in Cloudflare | DevOps | 0.5 | T28-01 |
| T28-03 | Verify DNS propagation (dig, whatsmydns.com, multiple browsers) | DevOps | 1 | T28-02 |
| T28-04 | Full service verification: frontend, API, auth, search, images, email, push | DevOps/All | 2 | T28-03 |
| T28-05 | Verify Cloudflare proxy, WAF, SSL Full Strict active | DevOps | 0.5 | T28-03 |
| T28-06 | Publish launch announcement on iloveberlin.biz | Content | 0.5 | T28-04 |
| T28-07 | Send launch email to newsletter subscribers via Brevo | Marketing | 0.5 | T28-04 |
| T28-08 | Publish social media launch posts (Facebook, Instagram, Twitter/X, LinkedIn) | Marketing | 1 | T28-04 |
| T28-09 | Post to Berlin expat communities (Reddit, Facebook groups, InterNations) | Marketing | 1 | T28-04 |
| T28-10 | Begin heightened monitoring: Grafana review every 30 min, tightened alert thresholds | DevOps | Ongoing | T28-04 |
| T28-11 | Monitor and fix any immediate launch issues (P0 response within 30 min) | All | Ongoing | T28-04 |
| T28-12 | Record launch timestamp, take screenshots, document initial metrics | PM | 0.5 | T28-04 |

#### Day 2 (Tuesday) -- Launch + 24h
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-13 | Morning monitoring review: Grafana dashboards, error logs, queue depths | DevOps | 1 | T28-10 |
| T28-14 | Review overnight issues: triage any P0/P1 bugs from monitoring or feedback | All | 2 | T28-10 |
| T28-15 | Fix critical bugs identified in first 24 hours | Backend/Frontend | 4 | T28-14 |
| T28-16 | Deploy hotfixes to production if needed (staging test first) | DevOps | 1 | T28-15 |
| T28-17 | Social media: Day 2 post -- "Discover Berlin Events" feature spotlight | Marketing | 0.5 | -- |
| T28-18 | Review and respond to user feedback (in-app feedback system) | PM | 2 | -- |
| T28-19 | Monitor Crashlytics for mobile app crashes | Mobile | 1 | -- |

#### Day 3 (Wednesday) -- Launch + 48h
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-20 | Monitoring review: continue 2-hour Grafana checks | DevOps | 1 | T28-10 |
| T28-21 | Fix remaining P1 bugs from Days 1-2 | Backend/Frontend | 4 | T28-14 |
| T28-22 | Monitor Core Web Vitals: run PageSpeed Insights on top 10 pages | Frontend | 2 | -- |
| T28-23 | Check Google Search Console: crawl status, errors, sitemap processing | Frontend | 1 | -- |
| T28-24 | Social media: Day 3 post -- "Find the Best Restaurants" spotlight | Marketing | 0.5 | -- |
| T28-25 | Respond to app store reviews (if any) | Mobile/PM | 1 | -- |
| T28-26 | 72-hour monitoring period ends: return to normal alert thresholds if stable | DevOps | 0.5 | T28-10 |

#### Day 4 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-27 | Review and address Core Web Vitals issues (if any pages in "Poor" range) | Frontend | 3 | T28-22 |
| T28-28 | Fix crawl errors reported in Google Search Console | Frontend/Backend | 2 | T28-23 |
| T28-29 | Submit high-priority URLs for manual indexing if not yet crawled | Frontend | 1 | T28-23 |
| T28-30 | Social media: Day 4 post -- community engagement poll | Marketing | 0.5 | -- |
| T28-31 | Continue fixing P2 bugs and quick-win feedback items | Backend/Frontend | 4 | T28-18 |
| T28-32 | Verify Bing Webmaster Tools crawl status | Frontend | 0.5 | -- |

#### Day 5 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-33 | Weekly metrics review: traffic, signups, content views, search queries, favorites | PM | 2 | -- |
| T28-34 | Social media: Day 5 post -- "Berlin City Guides" spotlight | Marketing | 0.5 | -- |
| T28-35 | Continue bug fixes (P2 items and feedback-driven quick wins) | Backend/Frontend | 4 | -- |
| T28-36 | Mobile crash review: fix any crashes affecting > 1% of users | Mobile | 2 | T28-19 |
| T28-37 | Database performance review: check slow queries, connection pool health | DevOps | 1.5 | -- |
| T28-38 | Backup verification: confirm automated backups ran successfully all week | DevOps | 0.5 | -- |

### Week 2 (Days 276-280) -- Stabilization

#### Day 6 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-39 | Review all feedback from Week 1: categorize and prioritize | PM | 3 | T28-18, T28-25 |
| T28-40 | Begin compiling known issues list (open bugs by severity and area) | PM | 2 | T28-39 |
| T28-41 | Continue P2 bug fixes based on prioritized feedback | Backend/Frontend | 4 | T28-39 |
| T28-42 | Social media: Day 6-7 posts -- user testimonials or beta tester quotes | Marketing | 1 | -- |
| T28-43 | Monitor search engine indexing progress (target 50%+ pages indexed) | Frontend | 1 | T28-28 |

#### Day 7 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-44 | Compile feature requests from beta + launch feedback | PM | 2 | T28-39 |
| T28-45 | Document technical debt items identified during development | Backend/DevOps | 2 | -- |
| T28-46 | Document UX improvements not yet implemented | Frontend | 1.5 | -- |
| T28-47 | Document accessibility improvements for next cycle | Frontend | 1 | -- |
| T28-48 | Continue bug fixes and stabilization | Backend/Frontend | 4 | -- |
| T28-49 | Social media: continued posting per schedule | Marketing | 0.5 | -- |

#### Day 8 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-50 | Finalize known issues list: title, description, priority, effort estimate for each item | PM | 3 | T28-40, T28-44, T28-45, T28-46, T28-47 |
| T28-51 | Organize backlog for Sprint 29+ planning: prioritize items, group by theme | PM | 2 | T28-50 |
| T28-52 | Collect stakeholder input on backlog priority ranking | PM | 1.5 | T28-51 |
| T28-53 | Write post-incident reports for any P0 issues that occurred | DevOps/Backend | 2 | -- |
| T28-54 | Performance optimization: address any remaining Core Web Vitals issues | Frontend | 2 | T28-27 |

#### Day 9 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-55 | Prepare retrospective: gather data on sprint velocity, bug counts, timeline adherence | PM | 2 | -- |
| T28-56 | Post-launch retrospective meeting (all team members) | All | 3 | T28-55 |
| T28-57 | Document retrospective: what went well, what to improve, action items with owners | PM | 2 | T28-56 |
| T28-58 | Final social media metrics report: followers, engagement, click-throughs, downloads | Marketing | 1 | -- |

#### Day 10 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T28-59 | Share retrospective summary with stakeholders | PM | 1 | T28-57 |
| T28-60 | Final stabilization: address any remaining critical items | Backend/Frontend | 3 | -- |
| T28-61 | Two-week post-launch metrics report: traffic, signups, content engagement, errors, performance | PM/DevOps | 2 | -- |
| T28-62 | Team celebration and acknowledgment of launch achievement | All | 1 | -- |
| T28-63 | Handoff: known issues list and prioritized backlog ready for next cycle | PM | 1 | T28-50, T28-51 |

---

## Backend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T28-15 | Critical bug fixes (Day 2) | Fix P0/P1 bugs from first 24 hours; may include API errors, auth issues, data integrity | 4 |
| T28-21 | P1 bug fixes (Day 3) | Fix remaining high-priority bugs from Days 1-2 | 4 |
| T28-28 | Fix crawl errors | Fix 404s, redirect chains, or 5xx errors reported by search engines | 2 |
| T28-31, 35, 41, 48 | P2 bug fixes | Fix medium-priority bugs and quick-win improvements based on feedback | 16 |
| T28-53 | Post-incident reports | Write root cause analysis for any P0 incidents | 2 |
| | **Backend Total** | | **28** |

## Frontend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T28-22 | Core Web Vitals check | Run PageSpeed Insights on top 10 pages, document scores | 2 |
| T28-23 | Search Console check | Review crawl status, errors, sitemap processing | 1 |
| T28-27 | Web Vitals optimization | Optimize LCP (images, preload), INP (JS reduction), CLS (dimensions) | 3 |
| T28-29 | Manual indexing submissions | Use Inspect URL tool for high-priority pages not yet crawled | 1 |
| T28-43 | Indexing progress monitoring | Check coverage report, submit missing pages | 1 |
| T28-46 | UX improvement documentation | Document deferred UX improvements from beta + launch feedback | 1.5 |
| T28-47 | Accessibility documentation | Document deferred accessibility items with WCAG references | 1 |
| T28-54 | Performance optimization | Address remaining Core Web Vitals issues from Week 1 analysis | 2 |
| | **Frontend Total** | | **12.5** |

## Mobile Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T28-19 | Crashlytics monitoring | Review crash reports, identify top crashes, assess crash-free rate | 1 |
| T28-36 | Crash fixes | Fix crashes affecting > 1% of users, prepare and submit app update | 2 |
| T28-25 | App store review response | Monitor and respond to app store ratings and reviews | 1 |
| | **Mobile Total** | | **4** |

## DevOps/Infrastructure Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T28-01 | Pre-launch checklist | Walk through runbook checklist, verify all items green | 1 |
| T28-02 | DNS cutover | Update A record and CNAME records in Cloudflare | 0.5 |
| T28-03 | DNS verification | Check propagation via dig, whatsmydns.com, multiple ISPs | 1 |
| T28-04-05 | Service verification | Test every service endpoint, verify Cloudflare settings | 2.5 |
| T28-10 | Heightened monitoring setup | Tighten alert thresholds, create incident Slack channel, set check schedule | 1 |
| T28-13, 20 | Monitoring reviews | Regular Grafana dashboard checks, error log review, queue monitoring | 2 |
| T28-16 | Hotfix deployment | Deploy fixes to production with staging test first | 1 |
| T28-26 | Monitoring normalization | Return to standard alert thresholds after 72-hour stable period | 0.5 |
| T28-37 | Database performance | Review slow queries, connection pool stats, PgBouncer health | 1.5 |
| T28-38 | Backup verification | Confirm daily backups ran, spot-check backup file sizes | 0.5 |
| T28-45 | Tech debt documentation | Document infrastructure, architecture, and operational tech debt | 2 |
| | **DevOps Total** | | **13.5** |

## PM/Content Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T28-06 | Launch announcement | Publish announcement post on the platform | 0.5 |
| T28-12 | Launch documentation | Record timestamp, initial metrics, screenshots | 0.5 |
| T28-18, 39 | Feedback management | Review, categorize, respond to user feedback (in-app, email, social) | 5 |
| T28-33 | Week 1 metrics | Compile traffic, signups, content views, search, favorites report | 2 |
| T28-40 | Known issues draft | Open bugs by severity, area; initial categorization | 2 |
| T28-44 | Feature requests | Consolidate feature requests from beta + launch | 2 |
| T28-50-52 | Known issues finalized | Complete list, prioritized backlog, stakeholder input | 6.5 |
| T28-55 | Retrospective prep | Gather velocity data, timeline data, bug counts, survey team | 2 |
| T28-56-57 | Retrospective | Facilitate meeting, document outcomes, assign action items | 5 |
| T28-59 | Stakeholder communication | Share retrospective summary and next cycle plan | 1 |
| T28-61 | 2-week report | Comprehensive metrics report covering the full launch period | 2 |
| T28-63 | Handoff | Deliver backlog and known issues to next cycle planning | 1 |
| | **PM/Content Total** | | **29.5** |

## Marketing Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T28-07 | Newsletter blast | Send launch email via Brevo to confirmed subscribers | 0.5 |
| T28-08 | Social media launch posts | Publish launch announcement on all platforms | 1 |
| T28-09 | Community outreach | Post to Berlin expat groups, Reddit, InterNations | 1 |
| T28-17 | Day 2 social post | "Discover Berlin Events" feature spotlight | 0.5 |
| T28-24 | Day 3 social post | "Find the Best Restaurants" spotlight | 0.5 |
| T28-30 | Day 4 social post | Community engagement poll | 0.5 |
| T28-34 | Day 5 social post | "Berlin City Guides" spotlight | 0.5 |
| T28-42 | Day 6-7 social posts | Testimonials and quotes | 1 |
| T28-49 | Day 8-10 social posts | Continued engagement and posting | 0.5 |
| T28-58 | Social metrics report | Followers, engagement, clicks, downloads analysis | 1 |
| | **Marketing Total** | | **6.5** |

---

## Dependencies

```
T28-01 (pre-launch checklist) --> T28-02 (DNS cutover) --> T28-03 (propagation check) --> T28-04, T28-05 (verification)
T28-04 (verified) --> T28-06 (announcement), T28-07 (newsletter), T28-08 (social), T28-09 (communities)
T28-04 --> T28-10 (monitoring begins)
T28-10 --> T28-11 (issue response), T28-13 (Day 2 review), T28-20 (Day 3 review)
T28-10, T28-11 --> T28-14 (triage) --> T28-15 (fixes) --> T28-16 (deploy hotfix)
T28-22 (Web Vitals check) --> T28-27 (optimization) --> T28-54 (continued optimization)
T28-23 (Search Console) --> T28-28 (fix crawl errors), T28-29 (manual indexing)
T28-19 (Crashlytics) --> T28-36 (crash fixes)
T28-18 (feedback review) --> T28-39 (categorize) --> T28-40 (known issues draft)
T28-40, T28-44, T28-45, T28-46, T28-47 --> T28-50 (finalize known issues) --> T28-51 (backlog) --> T28-52 (stakeholder input)
T28-55 (retro prep) --> T28-56 (retrospective) --> T28-57 (document) --> T28-59 (share)
T28-50, T28-51 --> T28-63 (handoff)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DNS propagation delays cause partial outage | Low | High | TTL lowered 48h prior; Cloudflare proxied records propagate fast; have direct IP access as fallback |
| Launch-day traffic spike overwhelms server | Medium | Critical | Load tested at 2x in Sprint 27; auto-scaling not in place but can vertically scale Hetzner quickly; Cloudflare caching absorbs static traffic |
| Critical bug discovered immediately after launch | Medium | High | Hotfix procedure established; staging environment ready; rollback plan available |
| App store review still pending at launch | Medium | Medium | Apps submitted in Sprint 27 with buffer; announce web-first, apps "coming soon" if delayed |
| Negative user feedback or bad first impressions | Medium | Medium | Rapid feedback response; quick-win fixes deployed same day; community management active |
| Team burnout from launch intensity | Medium | High | Limit on-call to defined hours; rotate responsibilities; schedule celebration; acknowledge effort |
| Search engines slow to index content | Medium | Low | Submit sitemaps, request manual indexing, use social media to drive initial traffic while SEO ramps up |
| Database performance degradation under real traffic patterns | Low | High | PgBouncer in place; slow query monitoring active; Grafana alerts set; optimization capacity available |

---

## Deliverables Checklist

- [ ] DNS cutover executed and iloveberlin.biz live
- [ ] All services verified operational post-cutover
- [ ] 72-hour heightened monitoring completed with observation log
- [ ] All P0 (critical) issues resolved on launch day
- [ ] All P1 (high) issues resolved within 48 hours
- [ ] Core Web Vitals monitored and optimizations applied
- [ ] Search engine crawling verified (Google and Bing)
- [ ] Mobile crash reports monitored, critical crashes fixed
- [ ] Launch announcement published on platform and email
- [ ] Social media launch campaign executed (10 days of posts)
- [ ] User feedback reviewed and responded to
- [ ] P2 bug fixes deployed based on feedback
- [ ] Post-incident reports written for any P0 issues
- [ ] Known issues list compiled and prioritized
- [ ] Backlog for next development cycle organized
- [ ] Post-launch retrospective completed
- [ ] Retrospective summary shared with stakeholders
- [ ] 2-week post-launch metrics report produced
- [ ] Team celebration held

---

## Definition of Done

- iloveberlin.biz is live and accessible at the production URL with valid HTTPS
- All services (frontend, API, database, search, email, push, monitoring) are operational
- Zero P0 bugs open; maximum 2 P1 bugs open with documented remediation plan
- Heightened monitoring period (72 hours) completed with documented observations
- Core Web Vitals for top pages meet "Good" thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Search engines are crawling and beginning to index the site
- Mobile app crash-free rate is above 99%
- Launch announcement and social media campaign executed
- User feedback response process operational with feedback addressed within 24 hours
- Known issues list and prioritized backlog ready for next cycle
- Post-launch retrospective completed with documented action items
- Team morale acknowledged; launch celebrated

---

## Sprint Review Demo Script

1. **Launch moment** (2 min): Show the DNS cutover moment (if recorded); show iloveberlin.biz loading live; show SSL certificate; highlight launch timestamp
2. **Monitoring during launch** (3 min): Show Grafana dashboards with launch-day traffic spike; walk through the monitoring observation log; show alert history (ideally clean); show the tightened thresholds and when they were normalized
3. **Issues and fixes** (3 min): Present the issue log: total issues by severity; walk through any P0 incidents (what happened, how fast it was resolved, post-incident report); show P1 fixes deployed
4. **Traffic and metrics** (3 min): Present 2-week metrics: total visitors, unique users, page views, top pages, signups, search queries, favorites created, competition entries; compare to expectations
5. **Core Web Vitals** (2 min): Show PageSpeed Insights scores for homepage, article page, event page; highlight any optimizations made
6. **Search engine status** (2 min): Show Google Search Console coverage report; show number of pages indexed vs. submitted; show any crawl errors and how they were fixed
7. **Mobile app status** (2 min): Show App Store and Google Play listings; show Crashlytics crash-free rate; show download numbers (if available); show any crash fixes deployed
8. **User feedback and response** (2 min): Show feedback dashboard with total submissions; categorize by type; show response times; highlight quick wins implemented
9. **Social media results** (2 min): Show social media metrics: followers gained, post engagement, click-throughs, top-performing post; show community responses
10. **Known issues and backlog** (3 min): Present the prioritized known issues list; show the organized backlog for next cycle; highlight top priorities recommended for Sprint 29
11. **Retrospective highlights** (3 min): Share top 3 things that went well; top 3 things to improve; key action items for the next cycle
12. **Celebration** (2 min): Acknowledge team contributions; celebrate the achievement of launching iloveberlin.biz from concept to live platform over 28 sprints

**Total demo time:** ~29 minutes

---

## Rollover Criteria

This is the final sprint of the initial project. Rollover items go to the next development cycle backlog:

Items that carry to the next cycle:
- All P2 and P3 bugs not fixed during stabilization
- Feature requests collected from beta testers and early users
- UX improvements identified but not implemented
- Accessibility improvements beyond critical issues
- Technical debt items documented during development
- Performance optimizations for edge cases
- Any medium-severity OWASP ZAP findings from Sprint 25

Items that **must** be completed this sprint (no deferral):
- DNS cutover and live site verification
- 72-hour heightened monitoring period
- All P0 bugs fixed
- Launch announcement published
- Post-launch retrospective conducted
- Known issues list and backlog handoff completed
