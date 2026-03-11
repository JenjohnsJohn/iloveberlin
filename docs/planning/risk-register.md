# ILoveBerlin Platform - Risk Register

**Project:** ILoveBerlin (iloveberlin.biz)
**Last Updated:** 2026-03-12
**Review Cadence:** Biweekly (during sprint planning)

---

## Risk Scoring Matrix

### Probability

| Level | Description | Likelihood |
|-------|-------------|------------|
| **High** | Very likely to occur | > 70% chance |
| **Medium** | Could occur under certain conditions | 30-70% chance |
| **Low** | Unlikely but possible | < 30% chance |

### Impact

| Level | Description | Consequence |
|-------|-------------|-------------|
| **High** | Major impact on timeline, budget, or quality | > 2 week delay, > 20% budget overrun, or critical feature dropped |
| **Medium** | Moderate impact requiring mitigation | 1-2 week delay, 10-20% budget overrun, or feature degraded |
| **Low** | Minor impact, manageable within sprint | < 1 week delay, < 10% budget overrun, or cosmetic issue |

### Risk Score Calculation

| | Impact: Low | Impact: Medium | Impact: High |
|---|---|---|---|
| **Probability: High** | 3 - Moderate | 6 - High | 9 - Critical |
| **Probability: Medium** | 2 - Low | 4 - Moderate | 6 - High |
| **Probability: Low** | 1 - Negligible | 2 - Low | 3 - Moderate |

**Action thresholds:**
- Score 9 (Critical): Immediate action required. Escalate to project sponsor.
- Score 6 (High): Active mitigation plan required. Review weekly.
- Score 3-4 (Moderate): Mitigation plan documented. Review biweekly.
- Score 1-2 (Low): Accept and monitor. Review monthly.

---

## Risk Register

### R001: Scope Creep

| Field | Value |
|-------|-------|
| **Risk ID** | R001 |
| **Category** | Project Management |
| **Description** | Uncontrolled expansion of project scope through informal feature requests, stakeholder additions, or team "gold plating." With 28 sprints and 5 phases, scope creep is cumulative and can become significant by Phase 3-4 if not managed. |
| **Probability** | **High** |
| **Impact** | **High** |
| **Risk Score** | **9 - Critical** |
| **Affected Phases** | All phases, highest risk in Phase 2-3 |
| **Mitigation Strategy** | (1) Formal change control process: all changes > 5 story points require written request and sponsor approval. (2) Sprint backlog is locked after planning; new items go to product backlog. (3) Phase gates enforce scope validation before proceeding. (4) "Must have / Should have / Could have / Won't have" (MoSCoW) prioritization for every sprint. (5) 15% buffer in each sprint absorbs minor additions. |
| **Contingency Plan** | If scope has grown beyond manageable levels: (1) Conduct scope audit to identify additions vs. original plan. (2) Negotiate feature deferrals to a post-launch phase. (3) Extend timeline by adding sprints at the end of the affected phase rather than compressing later phases. |
| **Owner** | Project Manager |
| **Status** | Open |

---

### R002: Technical Complexity and Architectural Debt

| Field | Value |
|-------|-------|
| **Risk ID** | R002 |
| **Category** | Technical |
| **Description** | The platform spans many domains (CMS, e-commerce, video, mobile, ads, search) and the accumulated technical complexity may lead to architectural decisions that don't scale, integration difficulties between modules, or performance bottlenecks that are expensive to resolve. |
| **Probability** | **High** |
| **Impact** | **Medium** |
| **Risk Score** | **6 - High** |
| **Affected Phases** | Phase 2-3 (highest risk), Phase 4 |
| **Mitigation Strategy** | (1) Tech Lead conducts architecture review before each phase. (2) Module boundaries are enforced through well-defined API contracts between subsystems. (3) 15% sprint capacity reserved for tech debt reduction. (4) Spike stories scheduled before complex features (video transcoding, search engine, payment integration). (5) Load testing integrated into CI/CD from Phase 2 onward. (6) Technology decisions documented in Architecture Decision Records (ADRs). |
| **Contingency Plan** | If architectural issues surface: (1) Allocate a full "stabilization sprint" between phases to address debt. (2) Bring in external architecture consultant for review. (3) Consider replacing problematic components (e.g., swap search engine if current choice underperforms). |
| **Owner** | Tech Lead |
| **Status** | Open |

---

### R003: Third-Party API Changes or Deprecations

| Field | Value |
|-------|-------|
| **Risk ID** | R003 |
| **Category** | External Dependency |
| **Description** | The platform depends on multiple third-party APIs (Stripe, Google OAuth, Apple Sign-In, Google Maps, Brevo, Firebase FCM). Any of these could introduce breaking changes, deprecate features, change pricing, or experience outages that affect platform functionality. |
| **Probability** | **Medium** |
| **Impact** | **High** |
| **Risk Score** | **6 - High** |
| **Affected Phases** | All phases (materialization likely in Phase 3-5) |
| **Mitigation Strategy** | (1) Abstract all third-party integrations behind adapter/wrapper layers so that swapping providers requires changing only the adapter, not business logic. (2) Pin API versions where possible; subscribe to provider changelogs and deprecation notices. (3) Maintain a third-party dependency inventory with version, last review date, and alternative providers. (4) Implement circuit breakers and graceful degradation for non-critical external calls. (5) Run integration tests against sandbox/test environments weekly. |
| **Contingency Plan** | If a critical API breaks or becomes unavailable: (1) Activate fallback (e.g., OpenStreetMap for Google Maps, alternative email provider for Brevo). (2) If Stripe changes pricing significantly, evaluate Adyen or Mollie as alternatives. (3) Google OAuth -> consider Auth0 or Keycloak as an auth abstraction layer. (4) For Apple Sign-In (App Store requirement), no alternative exists; prioritize immediate fix. |
| **Owner** | Tech Lead |
| **Status** | Open |

---

### R004: Performance Under Load

| Field | Value |
|-------|-------|
| **Risk ID** | R004 |
| **Category** | Technical |
| **Description** | The platform may experience performance degradation under load, particularly during: launch day traffic spikes, viral content events, large event calendar renders, video streaming, full-text search across large datasets, or concurrent e-commerce checkout sessions. Berlin-focused content could see traffic spikes around major city events (Berlin Marathon, Festival of Lights, etc.). |
| **Probability** | **Medium** |
| **Impact** | **High** |
| **Risk Score** | **6 - High** |
| **Affected Phases** | Phase 3-5 (as data volume and feature complexity grow) |
| **Mitigation Strategy** | (1) Implement caching at all layers: CDN (Cloudflare), application cache (Redis), database query cache. (2) Database indexing strategy reviewed quarterly. (3) Load testing with realistic data volumes before each phase gate. (4) Auto-scaling configuration on Hetzner Cloud (or manual scaling runbook). (5) Video streaming offloaded to CDN, not served from application servers. (6) Search engine sized for 10x current data volume. (7) Core Web Vitals monitoring in CI/CD pipeline. (8) N+1 query detection in development. |
| **Contingency Plan** | If performance issues emerge in production: (1) Activate Cloudflare "Under Attack" mode for DDoS. (2) Enable emergency caching (serve stale content). (3) Temporarily disable non-critical features (ads, analytics, recommendations). (4) Scale infrastructure horizontally (add servers). (5) Identify and fix hot queries with database query analysis. |
| **Owner** | Tech Lead + DevOps Engineer |
| **Status** | Open |

---

### R005: Security Vulnerabilities

| Field | Value |
|-------|-------|
| **Risk ID** | R005 |
| **Category** | Security |
| **Description** | Security vulnerabilities could be introduced through custom code, third-party dependencies, misconfigured infrastructure, or inadequate input validation. The platform handles user data, payment information, and user-generated content, all of which are high-value targets. A breach could result in data exposure, financial loss, regulatory penalties, and reputational damage. |
| **Probability** | **Medium** |
| **Impact** | **High** |
| **Risk Score** | **6 - High** |
| **Affected Phases** | All phases |
| **Mitigation Strategy** | (1) Security-by-design: threat modeling during architecture phase. (2) OWASP Top 10 awareness training for development team. (3) Automated dependency scanning (npm audit, Snyk) in CI/CD. (4) Static Application Security Testing (SAST) in build pipeline. (5) Input validation on all user-facing inputs (server-side). (6) Parameterized queries only (no string concatenation in SQL). (7) CSP headers, CORS configuration, and security headers from Sprint 1. (8) Stripe handles all payment card data (PCI compliance via Stripe). (9) Professional penetration testing in Sprint 25. (10) Regular dependency updates via automated PRs. |
| **Contingency Plan** | If a vulnerability is discovered or exploited: (1) Activate incident response plan. (2) Assess and contain the breach (isolate affected systems). (3) Notify affected users within 72 hours per GDPR Article 33. (4) Engage security consultant for forensic analysis. (5) Issue emergency patch and deploy. (6) Conduct post-incident review and update security practices. |
| **Owner** | Tech Lead + DevOps Engineer |
| **Status** | Open |

---

### R006: Team Availability and Turnover

| Field | Value |
|-------|-------|
| **Risk ID** | R006 |
| **Category** | People |
| **Description** | Over a 56-week project, team members may leave, take extended leave, fall ill, or become unavailable. Key-person dependencies (especially Tech Lead, senior developers) create single points of failure. Knowledge silos can form around complex modules if documentation is insufficient. |
| **Probability** | **Medium** |
| **Impact** | **Medium** |
| **Risk Score** | **4 - Moderate** |
| **Affected Phases** | All phases |
| **Mitigation Strategy** | (1) Cross-training: ensure at least two team members can work on every module. (2) Comprehensive documentation of architecture decisions, API contracts, and operational procedures. (3) Code reviews ensure shared knowledge of all code changes. (4) Pair programming on complex features. (5) Competitive compensation and team culture investment. (6) Notice period contracts to allow transition time. (7) Modular architecture reduces the blast radius of a single person's departure. |
| **Contingency Plan** | If a key team member becomes unavailable: (1) Redistribute their sprint tasks among remaining team. (2) Reduce sprint scope by 20-30% for the affected sprint. (3) If departure is permanent, begin recruitment immediately; use contractors as bridge staffing. (4) Extend the current phase by 1-2 sprints if the knowledge gap is significant. |
| **Owner** | Project Manager |
| **Status** | Open |

---

### R007: Content Availability at Launch

| Field | Value |
|-------|-------|
| **Risk ID** | R007 |
| **Category** | Content/Business |
| **Description** | The platform requires substantial content (articles, guides, event listings, dining reviews, videos) to feel valuable to users at launch. If content production lags behind feature development, the platform may launch with an empty or sparse feeling, leading to poor user retention. |
| **Probability** | **High** |
| **Impact** | **Medium** |
| **Risk Score** | **6 - High** |
| **Affected Phases** | Phase 2-5 |
| **Mitigation Strategy** | (1) Content Strategist joins at 25% in Phase 1, ramping to 100% in Phase 2. (2) Content production begins as soon as each content module is functional (not waiting for launch). (3) Content calendar with targets: 50 articles, 20 guides, 100 events, 50 dining reviews by launch. (4) Seed content from public sources (Berlin open data, public event listings) with proper attribution. (5) Partner with Berlin bloggers, event organizers, and restaurant owners for initial content. (6) User-submitted events and classifieds supplement editorial content. (7) Content import tools built in Sprint 11 to bulk-load content. |
| **Contingency Plan** | If content is insufficient at launch: (1) Soft launch with limited marketing to build content before broad push. (2) Focus launch on 2-3 strongest verticals rather than all sections. (3) Hire freelance writers for content sprint in Phase 5. (4) Populate with curated aggregated content (with permissions) as placeholder. |
| **Owner** | Content Strategist + Project Manager |
| **Status** | Open |

---

### R008: App Store Rejection

| Field | Value |
|-------|-------|
| **Risk ID** | R008 |
| **Category** | External Dependency |
| **Description** | Apple App Store and/or Google Play Store may reject the Flutter app during review. Common rejection reasons include: privacy policy issues, incomplete functionality, crashes during review, guideline violations (e.g., web view wrapping, payment bypass), or metadata issues. Apple is particularly strict with review guidelines. |
| **Probability** | **Medium** |
| **Impact** | **Medium** |
| **Risk Score** | **4 - Moderate** |
| **Affected Phases** | Phase 4-5 |
| **Mitigation Strategy** | (1) Study Apple Human Interface Guidelines and Google Play policies before app development begins. (2) Ensure app provides native-feeling experience (not just a web view wrapper). (3) Use Apple's in-app purchase for digital goods if applicable (or structure offerings to avoid IAP requirements). (4) Privacy nutrition labels (iOS) prepared accurately. (5) App preview and screenshots meet store guidelines. (6) Submit app for review 4+ weeks before planned launch (Sprint 27) to allow for rejection-resubmission cycles. (7) Use TestFlight and Google Play Internal Testing throughout Phase 4 to catch issues early. (8) App Store Optimization specialist engaged in Sprint 21. |
| **Contingency Plan** | If app is rejected: (1) Address rejection reasons immediately (typically 1-3 day turnaround). (2) If rejection is fundamental (e.g., IAP requirement for digital goods), redesign the affected flow and resubmit. (3) If Apple review is delayed, proceed with web-only launch and add "coming soon" for mobile app. (4) Expedited review request if rejection was a misunderstanding. |
| **Owner** | Flutter Developer + Tech Lead |
| **Status** | Open |

---

### R009: GDPR Compliance Gaps

| Field | Value |
|-------|-------|
| **Risk ID** | R009 |
| **Category** | Legal/Compliance |
| **Description** | As a Berlin-based platform serving EU users, full GDPR compliance is mandatory. Gaps could exist in: user consent management, data processing documentation, right to erasure implementation, data portability, cookie consent, third-party data sharing disclosures, data retention policies, or Data Protection Impact Assessment (DPIA). Non-compliance carries fines up to 4% of annual revenue or 20 million EUR. |
| **Probability** | **Medium** |
| **Impact** | **High** |
| **Risk Score** | **6 - High** |
| **Affected Phases** | All phases (audit in Phase 5) |
| **Mitigation Strategy** | (1) GDPR consultant engaged from Phase 1 for policy drafting. (2) Privacy by design: data minimization principle applied to all data models. (3) Cookie consent banner implemented in Sprint 1 with granular controls. (4) Right to erasure (account deletion with data anonymization) built in Sprint 3. (5) Data processing records maintained from project start. (6) Third-party DPAs (Data Processing Agreements) signed with all providers (Stripe, Brevo, Hetzner, Firebase, Cloudflare). (7) Privacy policy and Impressum reviewed by legal counsel. (8) DPIA conducted for high-risk processing (profiling, location data). (9) Formal GDPR audit scheduled in Sprint 25. (10) Data retention policies defined and automated (auto-delete after retention period). |
| **Contingency Plan** | If GDPR gaps are found during audit: (1) Prioritize remediation in Sprint 25-26 (security hardening and beta). (2) If gaps are significant, delay launch until resolved. (3) Engage specialized GDPR legal firm for accelerated remediation guidance. (4) Temporarily disable non-compliant features until fixed. (5) Document remediation for accountability per GDPR Article 5(2). |
| **Owner** | Project Manager + Legal/GDPR Consultant |
| **Status** | Open |

---

### R010: Search Engine Indexing Delays

| Field | Value |
|-------|-------|
| **Risk ID** | R010 |
| **Category** | Business/Marketing |
| **Description** | After launch, Google and other search engines may take weeks or months to fully index the site. Organic search traffic (a primary acquisition channel for a content platform) may be negligible in the initial weeks, affecting user growth projections and ad revenue. New domains without backlink history start with low domain authority. |
| **Probability** | **High** |
| **Impact** | **Medium** |
| **Risk Score** | **6 - High** |
| **Affected Phases** | Phase 5 (post-launch) |
| **Mitigation Strategy** | (1) SEO foundations built in Sprint 18 (sitemaps, structured data, meta tags). (2) Google Search Console set up and sitemap submitted before launch. (3) Server-side rendering (Next.js) ensures content is crawlable. (4) Internal linking strategy to ensure all pages are discoverable. (5) Backlink strategy: partnerships with Berlin tourism, expat communities, local businesses. (6) Social media presence established before launch to drive initial traffic. (7) Content published during beta (Sprints 26-27) to give search engines a head start on indexing. (8) Google Indexing API for time-sensitive content (events). (9) URL structure designed for longevity (avoid URL changes post-launch). |
| **Contingency Plan** | If indexing is significantly delayed: (1) Increase paid acquisition budget (Google Ads, social ads) to bridge organic traffic gap. (2) Intensify content marketing and guest posting for backlinks. (3) Submit individual URLs via Google Search Console for priority indexing. (4) Focus on social media and email channels for user acquisition during ramp-up. (5) Partner with established Berlin websites for referral traffic. |
| **Owner** | Content Strategist + Tech Lead |
| **Status** | Open |

---

### R011: Video Infrastructure Costs and Complexity

| Field | Value |
|-------|-------|
| **Risk ID** | R011 |
| **Category** | Technical/Financial |
| **Description** | Video content (Sprint 9) introduces significant infrastructure complexity and potentially high costs. Video transcoding is CPU-intensive, storage requirements grow rapidly, and streaming bandwidth can be expensive. Self-hosted video infrastructure requires expertise to maintain, while managed services (Cloudflare Stream, Mux) add ongoing costs. |
| **Probability** | **Medium** |
| **Impact** | **Medium** |
| **Risk Score** | **4 - Moderate** |
| **Affected Phases** | Phase 2-5 |
| **Mitigation Strategy** | (1) Spike story in Sprint 8 to evaluate self-hosted (FFmpeg on Hetzner) vs. managed (Cloudflare Stream) options. (2) Set video upload limits (file size, duration) to control storage growth. (3) Implement video quality tiers (720p default, 1080p for premium). (4) Use HLS for adaptive streaming to reduce bandwidth waste. (5) Cloudflare CDN for video delivery to offload from origin. (6) Lazy load video players (don't load player until user scrolls to video). (7) Budget monitoring with alerts for storage and bandwidth thresholds. |
| **Contingency Plan** | If video costs exceed budget: (1) Reduce transcoding to fewer quality tiers. (2) Implement video quotas (limit uploads per month). (3) Shift to embedded YouTube/Vimeo for non-premium content. (4) Defer video feature to post-launch if costs are prohibitive during development. |
| **Owner** | Tech Lead + DevOps Engineer |
| **Status** | Open |

---

### R012: Payment Integration and Financial Compliance

| Field | Value |
|-------|-------|
| **Risk ID** | R012 |
| **Category** | Legal/Technical |
| **Description** | E-commerce functionality (Sprint 14) requires correct payment processing, VAT handling, invoice generation, and compliance with EU consumer protection laws. Incorrect VAT calculations, missing refund capabilities, or SCA (Strong Customer Authentication) failures could result in financial penalties, customer complaints, or payment processor restrictions. |
| **Probability** | **Medium** |
| **Impact** | **Medium** |
| **Risk Score** | **4 - Moderate** |
| **Affected Phases** | Phase 3-5 |
| **Mitigation Strategy** | (1) Use Stripe's built-in SCA support (no custom 3DS implementation). (2) Stripe Tax or manual VAT calculation validated against EU VAT rates. (3) Refund flow tested end-to-end including partial refunds. (4) Invoice generation includes all legally required fields (German Rechnungspflichtangaben). (5) Consumer protection compliance: 14-day withdrawal right, clear pricing, terms of sale. (6) Stripe webhook handling for payment lifecycle events (failed, disputed, refunded). (7) Reconciliation process for matching Stripe payouts to orders. (8) Test with EU and non-EU payment methods (SEPA, cards, Klarna if added). |
| **Contingency Plan** | If payment issues arise: (1) Temporarily disable store and display "maintenance" message. (2) Process refunds manually through Stripe dashboard. (3) Engage e-commerce legal specialist for compliance review. (4) If Stripe relationship is problematic, evaluate Mollie or Adyen as alternatives. |
| **Owner** | Tech Lead + Project Manager |
| **Status** | Open |

---

### R013: Cross-Browser and Device Compatibility

| Field | Value |
|-------|-------|
| **Risk ID** | R013 |
| **Category** | Technical/Quality |
| **Description** | The web platform must work across multiple browsers (Chrome, Firefox, Safari, Edge) and devices (desktop, tablet, mobile). The Flutter app must work across a range of iOS and Android versions and device sizes. Inconsistencies could lead to broken layouts, non-functional features, or poor user experience for significant user segments. |
| **Probability** | **Medium** |
| **Impact** | **Low** |
| **Risk Score** | **2 - Low** |
| **Affected Phases** | All phases |
| **Mitigation Strategy** | (1) Define browser support matrix (last 2 versions of major browsers). (2) Responsive design testing at standard breakpoints (320px, 768px, 1024px, 1440px). (3) Cross-browser testing in CI (Playwright supports multi-browser). (4) BrowserStack or similar for real device testing. (5) CSS reset/normalize for consistent baseline. (6) Progressive enhancement: core functionality works without JavaScript. (7) Flutter app targets iOS 15+ and Android 10+ (covering 90%+ of active devices). |
| **Contingency Plan** | If compatibility issues surface: (1) Prioritize fixes by browser/device market share. (2) Add polyfills for missing browser features. (3) Accept graceful degradation on older browsers rather than blocking. |
| **Owner** | Frontend Developers + QA Engineer |
| **Status** | Open |

---

### R014: Data Migration and Content Loss

| Field | Value |
|-------|-------|
| **Risk ID** | R014 |
| **Category** | Technical |
| **Description** | If migrating from an existing iloveberlin.biz platform or importing content from external sources, data migration could result in content loss, broken links, formatting issues, or missing media assets. Even without migration, database schema changes across 28 sprints could lead to data issues if migrations are not carefully managed. |
| **Probability** | **Low** |
| **Impact** | **High** |
| **Risk Score** | **3 - Moderate** |
| **Affected Phases** | Phase 1-2 |
| **Mitigation Strategy** | (1) Database migration tool (TypeORM migrations, Prisma Migrate, or Flyway) from Sprint 1. (2) All migrations are version-controlled and reversible. (3) Migration testing in staging before production. (4) Automated database backups (daily, with point-in-time recovery). (5) Content import validation scripts that check for completeness. (6) URL redirect mapping from old URLs to new (if migrating from existing site). (7) Media asset migration with checksum verification. |
| **Contingency Plan** | If data loss occurs: (1) Restore from most recent backup. (2) Replay migrations from a known good state. (3) If old platform exists, re-extract data from source. (4) Engage database specialist for recovery if needed. |
| **Owner** | Tech Lead + DevOps Engineer |
| **Status** | Open |

---

### R015: Regulatory Changes (Digital Services Act, ePrivacy)

| Field | Value |
|-------|-------|
| **Risk ID** | R015 |
| **Category** | Legal/Compliance |
| **Description** | EU regulations are evolving. The Digital Services Act (DSA), upcoming ePrivacy Regulation, and potential changes to GDPR enforcement could introduce new requirements during the development period. Germany-specific regulations (Telemediengesetz, NetzDG for content moderation) may also apply. |
| **Probability** | **Low** |
| **Impact** | **Medium** |
| **Risk Score** | **2 - Low** |
| **Affected Phases** | All phases |
| **Mitigation Strategy** | (1) Legal counsel monitors regulatory developments on a quarterly basis. (2) Content moderation system (Sprint 13) designed to meet DSA requirements for online platforms. (3) Architecture supports adding new consent flows without major refactoring. (4) Impressum (legal notice) page meets German Telemediengesetz requirements. (5) Transparent content moderation reporting (DSA Article 15 compliance for larger platforms). |
| **Contingency Plan** | If new regulations require changes: (1) Assess impact and timeline requirements. (2) Allocate dedicated sprint capacity for compliance work. (3) If changes are fundamental, engage specialized legal-tech consultant. |
| **Owner** | Project Manager + Legal Consultant |
| **Status** | Open |

---

## Risk Summary Dashboard

| Risk ID | Risk | Probability | Impact | Score | Status |
|---------|------|-------------|--------|-------|--------|
| R001 | Scope Creep | High | High | 9 - Critical | Open |
| R002 | Technical Complexity | High | Medium | 6 - High | Open |
| R003 | Third-Party API Changes | Medium | High | 6 - High | Open |
| R004 | Performance Under Load | Medium | High | 6 - High | Open |
| R005 | Security Vulnerabilities | Medium | High | 6 - High | Open |
| R006 | Team Availability | Medium | Medium | 4 - Moderate | Open |
| R007 | Content Availability | High | Medium | 6 - High | Open |
| R008 | App Store Rejection | Medium | Medium | 4 - Moderate | Open |
| R009 | GDPR Compliance Gaps | Medium | High | 6 - High | Open |
| R010 | Search Engine Indexing Delays | High | Medium | 6 - High | Open |
| R011 | Video Infrastructure Costs | Medium | Medium | 4 - Moderate | Open |
| R012 | Payment/Financial Compliance | Medium | Medium | 4 - Moderate | Open |
| R013 | Cross-Browser Compatibility | Medium | Low | 2 - Low | Open |
| R014 | Data Migration/Loss | Low | High | 3 - Moderate | Open |
| R015 | Regulatory Changes | Low | Medium | 2 - Low | Open |

### Risk Distribution

```
Critical (9):  █ 1 risk   (R001)
High (6):      ██████ 6 risks  (R002, R003, R004, R005, R007, R009, R010)
Moderate (3-4): ████ 4 risks  (R006, R008, R011, R012, R014)
Low (1-2):     ██ 2 risks  (R013, R015)
```

---

## Risk Review Log

| Date | Reviewer | Changes Made |
|------|----------|--------------|
| - | - | Initial risk register created |

*This log should be updated at each biweekly review with any changes to risk status, scores, or mitigation actions taken.*

---

## Escalation Procedures

1. **Score 1-4 (Low/Moderate):** Managed by assigned owner. Reported in sprint review.
2. **Score 6 (High):** Active mitigation required. Reported weekly to Project Manager. Included in stakeholder updates.
3. **Score 9 (Critical):** Immediate escalation to Project Sponsor. Emergency meeting if risk materializes. May trigger scope/timeline re-evaluation.

### When a Risk Materializes

When a risk event actually occurs, follow this process:

1. **Declare:** Risk owner declares the risk has materialized and notifies Project Manager.
2. **Assess:** Evaluate actual impact against projected impact. Update risk register.
3. **Activate:** Execute the contingency plan. If no contingency plan exists, convene emergency planning session.
4. **Communicate:** Notify affected stakeholders, team members, and (if user-facing) users.
5. **Resolve:** Execute remediation actions. Track resolution progress daily.
6. **Review:** Conduct post-incident review. Update risk register with lessons learned. Identify if the risk could recur.
