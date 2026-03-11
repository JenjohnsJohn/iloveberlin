# ILoveBerlin Platform - Project Roadmap

**Project:** ILoveBerlin (iloveberlin.biz)
**Duration:** 56 weeks (28 sprints, 2 weeks each)
**Last Updated:** 2026-03-12

---

## 1. Gantt-Style Timeline

```
Week:  1    5    10   15   20   25   30   35   40   45   50   55
       |    |    |    |    |    |    |    |    |    |    |    |
       ├─── PHASE 1: FOUNDATION (Wk 1-10) ───┤
       │ S1 ── S2 ── S3 ── S4 ── S5 │
       │                              │
       │    Infra  Auth  Users  Art  Media/Admin
       │                              │
       ▼                              │
                                      ├─── PHASE 2: CONTENT PLATFORM (Wk 11-24) ──────┤
                                      │ S6 ── S7 ── S8 ── S9 ── S10 ── S11 ── S12 │
                                      │                                              │
                                      │ Guides Events Dining Video Comp  CMS   Home │
                                      │                                              │
                                      ▼                                              │
                                                                                     ├─── PHASE 3: COMMUNITY & COMMERCE (Wk 25-38) ──────┤
                                                                                     │ S13 ── S14 ── S15 ── S16 ── S17 ── S18 ── S19 │
                                                                                     │                                                │
                                                                                     │ Class  Store  Search Admin  Ads   SEO   Integ  │
                                                                                     │                                                │
                                                                                     ▼                                                │
                                                                                                                                      ├─── PHASE 4: MOBILE & NOTIF (Wk 39-48) ───┤
                                                                                                                                      │ S20 ── S21 ── S22 ── S23 ── S24 │
                                                                                                                                      │                                  │
                                                                                                                                      │ App-1 App-2  Push  Email  Monit  │
                                                                                                                                      │                                  │
                                                                                                                                      ▼                                  │
                                                                                                                                                                         ├─── PHASE 5: LAUNCH (Wk 49-56) ──┤
                                                                                                                                                                         │ S25 ── S26 ── S27 ── S28 │
                                                                                                                                                                         │                            │
                                                                                                                                                                         │ Sec   Beta  Prep  GoLive │
                                                                                                                                                                         └────────────────────────────┘
```

### Sprint-Level Timeline (Compact View)

```
PHASE 1: FOUNDATION                           Weeks 1-10
├── Sprint 1:  Infrastructure & DevOps         [Wk  1-2 ] ████
├── Sprint 2:  Authentication & Authorization  [Wk  3-4 ] ████
├── Sprint 3:  User Profiles & Management      [Wk  5-6 ] ████
├── Sprint 4:  Articles & Content Engine       [Wk  7-8 ] ████
└── Sprint 5:  Media Library & Admin Shell     [Wk  9-10] ████

PHASE 2: CONTENT PLATFORM                     Weeks 11-24
├── Sprint 6:  Berlin Guides                   [Wk 11-12] ████
├── Sprint 7:  Events System                   [Wk 13-14] ████
├── Sprint 8:  Dining & Nightlife              [Wk 15-16] ████
├── Sprint 9:  Video Content Platform          [Wk 17-18] ████
├── Sprint 10: Competitions & Giveaways        [Wk 19-20] ████
├── Sprint 11: Advanced CMS & Editorial        [Wk 21-22] ████
└── Sprint 12: Homepage & Navigation           [Wk 23-24] ████

PHASE 3: COMMUNITY & COMMERCE                Weeks 25-38
├── Sprint 13: Classifieds & Listings          [Wk 25-26] ████
├── Sprint 14: Online Store                    [Wk 27-28] ████
├── Sprint 15: Search & Discovery              [Wk 29-30] ████
├── Sprint 16: Full Admin Dashboard            [Wk 31-32] ████
├── Sprint 17: Advertising & Sponsorship       [Wk 33-34] ████
├── Sprint 18: SEO & Analytics                 [Wk 35-36] ████
└── Sprint 19: Integrations & API              [Wk 37-38] ████

PHASE 4: MOBILE & NOTIFICATIONS              Weeks 39-48
├── Sprint 20: Flutter App - Core              [Wk 39-40] ████
├── Sprint 21: Flutter App - Features          [Wk 41-42] ████
├── Sprint 22: Push Notifications              [Wk 43-44] ████
├── Sprint 23: Email Campaigns                 [Wk 45-46] ████
└── Sprint 24: Monitoring & Observability      [Wk 47-48] ████

PHASE 5: LAUNCH                               Weeks 49-56
├── Sprint 25: Security Hardening              [Wk 49-50] ████
├── Sprint 26: Beta Testing                    [Wk 51-52] ████
├── Sprint 27: Launch Preparation              [Wk 53-54] ████
└── Sprint 28: Go-Live                         [Wk 55-56] ████
```

---

## 2. Key Milestones

### Phase 1 Milestones (Foundation)

| ID | Milestone | Target Week | Success Criteria |
|----|-----------|-------------|------------------|
| M1.1 | Infrastructure operational | Wk 2 | CI/CD pipeline green, staging environment accessible, database provisioned |
| M1.2 | Authentication live | Wk 4 | Users can register, log in (email + social), JWT tokens issued and validated |
| M1.3 | User management complete | Wk 6 | Profile CRUD, role-based access control, avatar uploads functional |
| M1.4 | Article engine ready | Wk 8 | Articles can be created, edited, published with rich text, categories, tags |
| M1.5 | Phase 1 gate passed | Wk 10 | Media library operational, admin shell with basic CRUD, all Phase 1 tests passing |

### Phase 2 Milestones (Content Platform)

| ID | Milestone | Target Week | Success Criteria |
|----|-----------|-------------|------------------|
| M2.1 | First content vertical live | Wk 12 | Berlin Guides module with neighborhood, category, and map integration |
| M2.2 | Events system operational | Wk 14 | Events with date/time, venue, ticketing links, calendar views, recurring events |
| M2.3 | Dining module complete | Wk 16 | Restaurant listings, reviews, ratings, cuisine filtering, price ranges |
| M2.4 | Video platform ready | Wk 18 | Video upload, transcoding, streaming, playlists, embed support |
| M2.5 | Competitions system live | Wk 20 | Entry forms, winner selection, prize management, terms & conditions |
| M2.6 | Editorial workflow mature | Wk 22 | Draft/review/publish workflow, scheduled publishing, content versioning |
| M2.7 | Phase 2 gate passed | Wk 24 | Homepage assembled, navigation finalized, all content types rendering correctly |

### Phase 3 Milestones (Community & Commerce)

| ID | Milestone | Target Week | Success Criteria |
|----|-----------|-------------|------------------|
| M3.1 | Classifieds marketplace live | Wk 26 | Users can post, browse, filter listings; contact flow operational |
| M3.2 | Store accepting payments | Wk 28 | Product catalog, cart, Stripe checkout, order management functional |
| M3.3 | Search engine deployed | Wk 30 | Full-text search across all content types, filters, autocomplete |
| M3.4 | Admin dashboard complete | Wk 32 | Unified admin for all modules, analytics, user management, content moderation |
| M3.5 | Ad system revenue-ready | Wk 34 | Ad zones defined, campaign management, impression/click tracking |
| M3.6 | SEO fully optimized | Wk 36 | Sitemaps, structured data, meta tags, social cards, page speed optimized |
| M3.7 | Phase 3 gate passed | Wk 38 | All integrations tested, API documented, commerce flow end-to-end verified |

### Phase 4 Milestones (Mobile & Notifications)

| ID | Milestone | Target Week | Success Criteria |
|----|-----------|-------------|------------------|
| M4.1 | Flutter app core functional | Wk 40 | App runs on iOS/Android, auth flow, article reading, navigation working |
| M4.2 | App feature parity (core) | Wk 42 | Events, guides, dining, video in-app; deep linking operational |
| M4.3 | Push notifications live | Wk 44 | Firebase integration, segmented push, in-app notification center |
| M4.4 | Email campaigns operational | Wk 46 | Brevo integration, templates, automated drip sequences, analytics |
| M4.5 | Phase 4 gate passed | Wk 48 | Monitoring dashboards live, alerting configured, app store builds passing |

### Phase 5 Milestones (Launch)

| ID | Milestone | Target Week | Success Criteria |
|----|-----------|-------------|------------------|
| M5.1 | Security audit passed | Wk 50 | Pen test complete, OWASP top 10 addressed, GDPR audit passed |
| M5.2 | Beta testing complete | Wk 52 | 100+ beta testers onboarded, critical bugs resolved, NPS > 40 |
| M5.3 | Launch readiness confirmed | Wk 54 | Runbook prepared, DNS configured, CDN warm, support team trained |
| M5.4 | Public launch | Wk 56 | iloveberlin.biz live, app in stores, marketing campaigns active |

---

## 3. Critical Path

The critical path represents the longest chain of dependent tasks that determines the minimum project duration. Any delay on the critical path delays the entire project.

```
Critical Path Through ILoveBerlin:

Sprint 1 (Infra) ──► Sprint 2 (Auth) ──► Sprint 3 (Users) ──► Sprint 4 (Articles)
       │                                                              │
       ▼                                                              ▼
Sprint 5 (Media/Admin) ──► Sprint 6 (Guides) ──► Sprint 7 (Events)
                                                        │
                                                        ▼
Sprint 11 (CMS) ──► Sprint 12 (Homepage) ──► Sprint 15 (Search)
                                                   │
                                                   ▼
Sprint 16 (Admin) ──► Sprint 18 (SEO) ──► Sprint 20 (App Core)
                                                │
                                                ▼
Sprint 21 (App Features) ──► Sprint 22 (Push) ──► Sprint 25 (Security)
                                                        │
                                                        ▼
Sprint 26 (Beta) ──► Sprint 27 (Launch Prep) ──► Sprint 28 (Go-Live)
```

**Critical path items requiring special attention:**

1. **Infrastructure (Sprint 1)** - All subsequent work depends on CI/CD, hosting, and database being operational.
2. **Authentication (Sprint 2)** - Every feature requiring user context is blocked until auth is complete.
3. **Article Engine (Sprint 4)** - The content model established here is the template for all content verticals.
4. **Homepage & Navigation (Sprint 12)** - The information architecture must be solidified before community/commerce features are built.
5. **Search (Sprint 15)** - Cross-cutting concern that indexes all content types; must be designed to accommodate future content.
6. **Flutter App Core (Sprint 20)** - Mobile app must wrap a stable web API; API changes after this point carry high cost.
7. **Security Hardening (Sprint 25)** - Cannot enter beta without security audit completion.

---

## 4. Resource Assumptions

### Team Composition

| Role | Count | Allocation | Phase Involvement |
|------|-------|------------|-------------------|
| Project Manager | 1 | 100% | All phases |
| Tech Lead / Architect | 1 | 100% | All phases |
| Senior Backend Developer | 2 | 100% | Phases 1-5 |
| Senior Frontend Developer | 2 | 100% | Phases 1-5 |
| Flutter/Mobile Developer | 1 | 50% Phase 1-3, 100% Phase 4-5 | Phase 1 (setup), Phase 4-5 (primary) |
| DevOps Engineer | 1 | 100% Phase 1, 50% Phase 2-5 | All phases |
| UI/UX Designer | 1 | 100% Phase 1-2, 75% Phase 3-5 | All phases |
| QA Engineer | 1 | 50% Phase 1-2, 100% Phase 3-5 | All phases |
| Content Strategist | 1 | 25% Phase 1, 100% Phase 2-5 | Phase 2 onward (primary) |
| **Total Core Team** | **11** | | |

### Role Responsibilities

- **Project Manager:** Sprint planning, stakeholder communication, risk management, scope control, vendor coordination.
- **Tech Lead / Architect:** System design, code reviews, technical decisions, mentoring, performance oversight.
- **Senior Backend Developers:** API development (NestJS/Node.js), database design (PostgreSQL), service integrations, business logic.
- **Senior Frontend Developers:** Next.js/React UI development, component library, responsive design, accessibility.
- **Flutter/Mobile Developer:** Cross-platform mobile app, native integrations (push, camera, location), app store submissions.
- **DevOps Engineer:** Infrastructure as code, CI/CD pipelines, monitoring, security configuration, deployment automation.
- **UI/UX Designer:** Wireframes, prototypes, design system, user research, usability testing.
- **QA Engineer:** Test planning, automated testing, regression testing, performance testing, UAT coordination.
- **Content Strategist:** Content modeling, editorial guidelines, seed content, SEO content strategy, content migration.

### External / Part-Time Resources

| Role | Engagement | Phase |
|------|------------|-------|
| Security Consultant | 2 weeks | Phase 5 (Sprint 25) |
| Performance Engineer | 1 week | Phase 3 (Sprint 18), Phase 5 (Sprint 27) |
| Legal / GDPR Consultant | Ongoing retainer | Phase 1 (policies), Phase 5 (audit) |
| Copywriter / Translator (DE/EN) | Part-time | Phase 2 onward |
| App Store Optimization Specialist | 1 week | Phase 4 (Sprint 21) |

### Velocity Assumptions

- Sprint duration: 2 weeks (10 working days)
- Team velocity target: 60-80 story points per sprint (stabilizing after Sprint 3)
- Sprint ceremonies: 1 day total (planning, standup, review, retro)
- Net productive days per sprint: 9 days
- Buffer allocation: 15% of each sprint reserved for bug fixes, tech debt, and unplanned work

---

## 5. Budget Considerations

### Infrastructure Costs (Monthly Estimates)

| Service | Provider | Monthly Cost (EUR) | Notes |
|---------|----------|--------------------|-------|
| Application Servers | Hetzner Cloud | 150-300 | 2-4 dedicated servers, scaling with phase |
| Database (PostgreSQL) | Hetzner Cloud | 50-100 | Managed or self-hosted on dedicated instance |
| Object Storage / CDN | Cloudflare R2 + CDN | 50-150 | Media storage, static assets, video delivery |
| Email Service | Brevo | 25-75 | Transactional + marketing emails |
| Push Notifications | Firebase (FCM) | 0-25 | Free tier covers initial scale |
| CI/CD | GitHub Actions | 0-50 | Free tier + paid minutes as needed |
| Monitoring | Self-hosted (Grafana/Prometheus) | 0 | Runs on infrastructure servers |
| SSL / DNS | Cloudflare | 0-20 | Free tier likely sufficient |
| **Monthly Total** | | **275-720** | Scaling with platform growth |

### Third-Party Service Costs

| Service | Cost Model | Estimated Annual (EUR) |
|---------|------------|------------------------|
| Stripe | 1.4% + 0.25 EUR per transaction | Variable (commission-based) |
| Google Maps API | Per-request pricing | 500-2,000 |
| Video Transcoding | Per-minute pricing | 1,000-3,000 |
| App Store Fees | Apple: 99 USD/yr, Google: 25 USD one-time | ~125 |
| Domain & DNS | Annual renewal | 50-100 |
| **Annual Total** | | **1,675-5,225** |

### Personnel Costs (Not Itemized)

Personnel costs are the dominant expense and depend on team location, employment model (in-house vs. contract), and seniority levels. These should be budgeted separately based on organizational compensation structures. The team of 11 core members over 56 weeks represents approximately 616 person-weeks of effort.

### Budget Risk Factors

1. **Video hosting and transcoding** costs can escalate rapidly with content volume. Consider self-hosted transcoding (FFmpeg on Hetzner) to control costs.
2. **Stripe transaction fees** are unavoidable but should be modeled against projected store revenue.
3. **Google Maps API** costs depend on traffic volume. Implement caching and consider OpenStreetMap as a fallback for non-critical map views.
4. **Scale events** (viral content, major Berlin events) could spike infrastructure costs. Cloudflare CDN and caching strategy are critical cost controls.
5. **App store review delays** do not have direct costs but can delay monetization timelines.

---

## 6. Decision Log

Track key architectural and business decisions that affect the roadmap.

| ID | Date | Decision | Rationale | Impact |
|----|------|----------|-----------|--------|
| D001 | - | Use Hetzner for primary hosting | Cost-effective EU-based hosting, GDPR-compliant data residency | Infra design, latency profile |
| D002 | - | Cloudflare for CDN and edge | Global CDN, DDoS protection, R2 storage integration | Media delivery, security posture |
| D003 | - | Brevo for email | Transactional + marketing in one platform, EU-based | Email architecture, campaign tooling |
| D004 | - | Flutter for mobile | Single codebase for iOS + Android, fast development | Mobile team structure, Phase 4 timeline |
| D005 | - | Stripe for payments | Industry standard, strong EU support, SCA-compliant | Store architecture, checkout flow |
| D006 | - | Firebase for push notifications | Free tier, reliable delivery, Flutter SDK support | Notification architecture |

---

## 7. Change Control

All scope changes to the roadmap must follow this process:

1. **Request:** Change request submitted with business justification and impact assessment.
2. **Assess:** Tech Lead evaluates effort, dependencies, and risk. PM evaluates timeline and budget impact.
3. **Review:** Change reviewed in next sprint planning or emergency review if urgent.
4. **Decide:** Project sponsor approves or rejects. Decision recorded in Decision Log.
5. **Implement:** If approved, roadmap updated, affected sprints re-planned, team notified.

**Scope change threshold:** Any change estimated at more than 5 story points or affecting the critical path requires formal change control. Smaller changes can be absorbed into sprint buffers at the Tech Lead's discretion.
