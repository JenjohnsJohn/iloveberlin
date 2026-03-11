# Sprint 27: Launch Preparation

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 27 |
| **Sprint Name** | Launch Preparation |
| **Duration** | 2 weeks (10 working days) |
| **Start Date** | Week 53 (Day 261) |
| **End Date** | Week 54 (Day 270) |
| **Phase** | Phase 5 -- Launch Preparation |

## Sprint Goal

Provision and configure the complete production environment on Hetzner -- Dockerized services, Nginx with SSL and caching, Cloudflare with DNS and WAF, PostgreSQL with PgBouncer, Meilisearch with full index, automated backups, and Prometheus/Grafana monitoring -- deploy the application, load test at 2x expected traffic, complete final content seeding, prepare launch operational documents (runbook, DNS cutover plan), submit mobile apps to stores, set up web analytics, submit sitemaps to search engines, and produce social media launch assets -- achieving full production readiness.

---

## User Stories

### US-27-01: Production Hetzner Provisioning and Docker
**As a** DevOps engineer,
**I want** the production server provisioned and all services running in Docker,
**so that** the platform has a reliable, reproducible production environment.

**Acceptance Criteria:**
- [ ] Hetzner dedicated server or cloud instance provisioned (specs: 8+ vCPU, 32+ GB RAM, 500+ GB SSD)
- [ ] Ubuntu 22.04 LTS installed with security updates
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured: only ports 80, 443, 22 (restricted IPs) open
- [ ] SSH key-only authentication (password auth disabled)
- [ ] Unattended security updates configured
- [ ] Swap configured (4 GB)
- [ ] Production Docker Compose file created with all services:
  - NestJS API (2 replicas)
  - Next.js frontend
  - PostgreSQL 15
  - Redis 7
  - Meilisearch
  - Nginx (reverse proxy)
  - BullMQ worker
- [ ] Docker volumes for persistent data (database, uploads, Meilisearch data)
- [ ] Docker restart policies: `unless-stopped` for all services
- [ ] Environment variables configured via `.env` file (not committed to repo)

### US-27-02: Production Nginx Configuration
**As a** DevOps engineer,
**I want** Nginx configured for production with SSL, caching, and rate limiting,
**so that** the platform is fast, secure, and protected from abuse.

**Acceptance Criteria:**
- [ ] Nginx configured as reverse proxy for NestJS API and Next.js frontend
- [ ] SSL certificates via Let's Encrypt with auto-renewal (certbot)
- [ ] HTTP to HTTPS redirect (301)
- [ ] SSL configuration: TLS 1.2+ only, strong cipher suite, OCSP stapling
- [ ] Gzip compression for text, HTML, CSS, JS, JSON, SVG
- [ ] Static asset caching: `Cache-Control: public, max-age=31536000, immutable` for hashed assets
- [ ] API response caching: short-lived (1-5 min) for public GET endpoints
- [ ] Rate limiting: 10 req/s per IP for API, 50 req/s for static assets
- [ ] Request body size limit: 10 MB
- [ ] Client connection timeouts configured
- [ ] Access logs and error logs configured with rotation
- [ ] Security headers passed through from NestJS (or added at Nginx level)
- [ ] Upstream health checks for NestJS replicas

### US-27-03: Production Cloudflare Configuration
**As a** DevOps engineer,
**I want** Cloudflare configured for DNS, SSL, WAF, and performance,
**so that** the platform benefits from CDN, DDoS protection, and global reach.

**Acceptance Criteria:**
- [ ] DNS records configured: A record for iloveberlin.biz pointing to Hetzner IP (proxied through Cloudflare)
- [ ] CNAME records for www, monitor, and any subdomains
- [ ] SSL mode: Full (Strict) -- Cloudflare to origin with valid certificate
- [ ] Always Use HTTPS enabled
- [ ] Automatic HTTPS Rewrites enabled
- [ ] WAF managed rules enabled (OWASP Core Rule Set)
- [ ] Custom WAF rules: block known bad bots, rate limit login endpoint
- [ ] Page rules:
  - `iloveberlin.biz/static/*` -> Cache Level: Cache Everything, Edge TTL: 1 month
  - `iloveberlin.biz/api/*` -> Cache Level: Bypass (dynamic content)
- [ ] Bot Fight Mode enabled
- [ ] Under Attack Mode available (manual toggle for DDoS situations)
- [ ] Cloudflare analytics verified as collecting data

### US-27-04: Production Database and PgBouncer
**As a** DevOps engineer,
**I want** PostgreSQL optimized for production with connection pooling,
**so that** the database handles production load efficiently.

**Acceptance Criteria:**
- [ ] PostgreSQL 15 configured with production settings:
  - `shared_buffers`: 8 GB (25% of RAM)
  - `effective_cache_size`: 24 GB (75% of RAM)
  - `work_mem`: 64 MB
  - `maintenance_work_mem`: 2 GB
  - `max_connections`: 200
  - `wal_level`: replica
  - `checkpoint_completion_target`: 0.9
- [ ] PgBouncer installed and configured in transaction pooling mode
  - `pool_mode`: transaction
  - `max_client_conn`: 500
  - `default_pool_size`: 50
- [ ] NestJS configured to connect through PgBouncer (port 6432)
- [ ] Database created with production schema (TypeORM migrations run)
- [ ] Database user with minimal required privileges (no superuser)
- [ ] pg_stat_statements extension enabled for query analysis
- [ ] Connection monitoring: verify pool utilization via PgBouncer SHOW POOLS

### US-27-05: Production Meilisearch and Full Index
**As a** DevOps engineer,
**I want** Meilisearch deployed with all production content indexed,
**so that** search works with the full dataset.

**Acceptance Criteria:**
- [ ] Meilisearch deployed in Docker with production master key
- [ ] All indexes created: articles, events, restaurants, guides, videos, classifieds
- [ ] Full content indexed from production database
- [ ] Search settings configured per index: searchable attributes, filterable attributes, sortable attributes, ranking rules
- [ ] Synonyms configured (e.g., "restaurant" = "dining", "Berlin" = "Berliner")
- [ ] Typo tolerance configured
- [ ] Index size and search latency verified (p95 < 50ms)
- [ ] Meilisearch data directory on persistent Docker volume

### US-27-06: Automated Database Backups
**As a** DevOps engineer,
**I want** automated database backups,
**so that** data can be recovered in case of failure.

**Acceptance Criteria:**
- [ ] `pg_dump` backup script running daily at 01:00 UTC via cron
- [ ] Backups compressed with gzip
- [ ] Backups stored locally and copied to offsite storage (Hetzner Storage Box or S3-compatible)
- [ ] Backup retention: 7 daily, 4 weekly, 3 monthly
- [ ] Backup script logs success/failure
- [ ] Alert (email or Slack) on backup failure
- [ ] Backup restoration tested: restore a backup to a temporary database and verify data integrity
- [ ] Backup documentation: step-by-step restore procedure documented

### US-27-07: Production Docker Compose
**As a** DevOps engineer,
**I want** a production-ready Docker Compose configuration,
**so that** the entire stack can be deployed and managed with a single command.

**Acceptance Criteria:**
- [ ] `docker-compose.production.yml` with all services configured
- [ ] Resource limits set per service (CPU and memory)
- [ ] Logging configured: JSON driver with max-size and max-file rotation
- [ ] Network isolation: services in internal network, only Nginx exposed
- [ ] Health checks defined for every service
- [ ] Depends_on with health check conditions for startup ordering
- [ ] Named volumes for all persistent data
- [ ] Deploy section with restart policies
- [ ] Environment variable references to `.env` file
- [ ] Separate profiles for optional services (monitoring, backups)

### US-27-08: Deploy to Production and Verify
**As a** DevOps engineer,
**I want** to deploy the application to production and verify everything works,
**so that** the platform is ready for users.

**Acceptance Criteria:**
- [ ] Production deployment executed via `docker-compose -f docker-compose.production.yml up -d`
- [ ] All services healthy (check with `docker-compose ps` and health endpoints)
- [ ] Frontend loads at https://iloveberlin.biz (via Cloudflare)
- [ ] API responds at https://iloveberlin.biz/api
- [ ] User registration, login, and content browsing verified
- [ ] Search returns results from production Meilisearch index
- [ ] Image uploads work (verify storage path)
- [ ] Email sending works (send test email via Brevo)
- [ ] Push notifications work (send test push)
- [ ] SSL certificate valid and trusted
- [ ] No console errors in browser DevTools

### US-27-09: Production Monitoring (Prometheus + Grafana)
**As a** DevOps engineer,
**I want** production monitoring fully operational,
**so that** I can detect and respond to issues immediately after launch.

**Acceptance Criteria:**
- [ ] Prometheus scraping production NestJS `/metrics`, Node Exporter, PostgreSQL Exporter
- [ ] Grafana dashboards imported (system, API, business, PostgreSQL)
- [ ] All dashboards showing live production data
- [ ] Alert rules active for production thresholds
- [ ] Alertmanager sending to production Slack channel and email
- [ ] Grafana accessible at https://monitor.iloveberlin.biz (auth-protected)
- [ ] Uptime monitoring configured (external: UptimeRobot, Pingdom, or Cloudflare Health Check)

### US-27-10: Load Test Production
**As a** DevOps engineer,
**I want** to load test the production environment at 2x expected traffic,
**so that** I can confirm the platform handles launch-day load.

**Acceptance Criteria:**
- [ ] Expected traffic baseline defined (e.g., 100 concurrent users, 500 req/min)
- [ ] Load test tool selected (k6, Artillery, or Locust)
- [ ] Load test scenarios:
  - Homepage and listing pages (GET)
  - Search queries (GET with query params)
  - Authentication flow (POST login/register)
  - Content detail pages (GET)
  - API write operations (POST favorites, feedback)
- [ ] Load test executed at 2x expected traffic (200 concurrent users, 1000 req/min)
- [ ] Performance targets met: p95 latency < 500ms, error rate < 1%, zero 5xx errors
- [ ] Load test report produced with graphs (response time distribution, throughput, error rate)
- [ ] Bottlenecks identified and addressed (if any)
- [ ] Grafana dashboards verified during load test (confirm metrics capture the load)

### US-27-11: Final Content Seeding
**As a** content creator,
**I want** to finalize all content,
**so that** the platform is content-complete for launch.

**Acceptance Criteria:**
- [ ] Any content gaps from Sprint 26 filled (target: 50+ articles, 100+ events, 30+ restaurants, 20+ guides, 20+ videos)
- [ ] Featured/spotlight content selected for homepage
- [ ] Content reviewed for quality, accuracy, and broken links
- [ ] Images optimized (WebP where supported, lazy loading)
- [ ] Meta descriptions and SEO titles set on all content pages
- [ ] Meilisearch index rebuilt with final production content

### US-27-12: Launch Runbook
**As a** DevOps engineer,
**I want** a detailed launch runbook,
**so that** the launch process is documented, repeatable, and has clear escalation procedures.

**Acceptance Criteria:**
- [ ] Launch runbook document created with:
  - Pre-launch checklist (all items must be green)
  - Step-by-step launch procedure
  - Service verification steps (each service checked)
  - Rollback procedure (how to revert if launch goes wrong)
  - Escalation contacts and communication plan
  - Monitoring checklist (what to watch in first 72 hours)
  - Known issues and workarounds
- [ ] Runbook reviewed by at least 2 team members
- [ ] Runbook tested via dry run (walk through steps mentally or on staging)

### US-27-13: DNS Cutover Plan
**As a** DevOps engineer,
**I want** a DNS cutover plan,
**so that** the domain transition is smooth and downtime is minimized.

**Acceptance Criteria:**
- [ ] Current DNS configuration documented
- [ ] Target DNS configuration documented (Cloudflare as DNS provider)
- [ ] TTL lowered to 300 seconds 48 hours before cutover
- [ ] Step-by-step cutover procedure:
  1. Verify production environment is healthy
  2. Update DNS records in Cloudflare
  3. Verify DNS propagation (using dig, nslookup, whatsmydns.com)
  4. Verify HTTPS works via the domain
  5. Verify all services accessible
  6. Monitor for 1 hour post-cutover
- [ ] Rollback procedure: previous DNS configuration ready to restore
- [ ] Communication plan: notify stakeholders of cutover window
- [ ] Estimated propagation time documented (typically 5-30 minutes with low TTL)

### US-27-14: Submit Mobile Apps to Stores
**As a** platform operator,
**I want** the mobile apps submitted to Apple App Store and Google Play Store,
**so that** they are available for download at or shortly after launch.

**Acceptance Criteria:**
- [ ] Apple Developer account active and configured
- [ ] Google Play Developer account active and configured
- [ ] App Store listing prepared: description, screenshots (6.5" and 5.5" iPhone, iPad), keywords, categories, privacy policy URL
- [ ] Google Play listing prepared: description, screenshots (phone, tablet), feature graphic, categories, privacy policy URL
- [ ] Flutter app built in release mode for iOS and Android
- [ ] iOS app archive created and uploaded via Xcode / Transporter
- [ ] Android app bundle (.aab) created and uploaded to Google Play Console
- [ ] App review submitted on both platforms
- [ ] Expected review timeline documented (Apple: 1-3 days, Google: 1-7 days)
- [ ] Plan for addressing review rejections (if any)

### US-27-15: Analytics Setup (Web)
**As a** platform operator,
**I want** web analytics tracking in place,
**so that** I can measure user behavior and traffic from day one.

**Acceptance Criteria:**
- [ ] Google Analytics 4 or Plausible Analytics account created
- [ ] Tracking script added to Next.js frontend (respecting cookie consent)
- [ ] Analytics only loads if user has given analytics consent (cookie consent integration)
- [ ] Key events configured: page_view, sign_up, login, search, content_view, favorite, share
- [ ] Goals/conversions defined: registration completion, newsletter signup, competition entry
- [ ] Dashboard verified with test traffic
- [ ] Google Search Console linked to analytics (if using GA4)

### US-27-16: Submit Sitemaps to Search Engines
**As a** platform operator,
**I want** sitemaps submitted to Google and Bing,
**so that** content is indexed quickly after launch.

**Acceptance Criteria:**
- [ ] XML sitemap generated at `/sitemap.xml` (using next-sitemap or custom generation)
- [ ] Sitemap includes: all articles, events, restaurants, guides, videos, classifieds, static pages
- [ ] Sitemap auto-updates when new content is published (or regenerated on a schedule)
- [ ] robots.txt configured with sitemap reference and appropriate crawl directives
- [ ] Google Search Console verified (DNS TXT record or HTML meta tag)
- [ ] Sitemap submitted to Google Search Console
- [ ] Bing Webmaster Tools verified
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Initial crawl requested from both search engines

### US-27-17: Social Media Launch Assets
**As a** marketing team,
**I want** social media assets ready for launch day,
**so that** we can promote the platform effectively.

**Acceptance Criteria:**
- [ ] Launch announcement graphic: 1200x630px (Facebook/Twitter/LinkedIn), 1080x1080px (Instagram)
- [ ] App store promo graphic: "Available on App Store" and "Get it on Google Play" badges
- [ ] 5 content teaser graphics (highlighting best articles, events, restaurants)
- [ ] Launch announcement copy (short and long versions) for each platform
- [ ] Social media posting schedule for launch week (day-by-day)
- [ ] Social media account bios updated with iloveberlin.biz link
- [ ] Open Graph meta tags verified on key pages (homepage, articles, events)
- [ ] Twitter Card meta tags verified

---

## Day-by-Day Task Breakdown

### Week 1 (Days 261-265)

#### Day 1 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-01 | Provision Hetzner production server (order, OS install, SSH setup, firewall) | DevOps | 3 | -- |
| T27-02 | Install Docker + Docker Compose on production server | DevOps | 1 | T27-01 |
| T27-03 | Configure server security: SSH keys only, unattended upgrades, swap, fail2ban | DevOps | 2 | T27-01 |
| T27-04 | Create production docker-compose.production.yml with all services | DevOps | 4 | T27-02 |

#### Day 2 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-05 | Configure production Nginx: reverse proxy, SSL (Let's Encrypt), HTTPS redirect | DevOps | 3 | T27-04 |
| T27-06 | Nginx: gzip compression, static asset caching, API caching, rate limiting | DevOps | 2.5 | T27-05 |
| T27-07 | Nginx: request body limit, timeouts, log rotation, upstream health checks | DevOps | 1.5 | T27-05 |
| T27-08 | Configure production Cloudflare: DNS records (A, CNAME), SSL Full Strict | DevOps | 2 | T27-01 |
| T27-09 | Cloudflare: WAF rules, page rules, Bot Fight Mode | DevOps | 1.5 | T27-08 |

#### Day 3 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-10 | PostgreSQL production config: memory settings, max_connections, WAL, checkpoints | DevOps | 2 | T27-04 |
| T27-11 | Install and configure PgBouncer (transaction pooling, pool sizes) | DevOps | 2 | T27-10 |
| T27-12 | Run TypeORM migrations on production database, create production user with minimal privileges | DevOps | 1.5 | T27-10 |
| T27-13 | Enable pg_stat_statements, verify connection monitoring | DevOps | 1 | T27-10 |
| T27-14 | Deploy Meilisearch in production Docker, configure master key, create indexes | DevOps | 2 | T27-04 |
| T27-15 | Configure Meilisearch: searchable/filterable/sortable attributes, synonyms, typo tolerance | DevOps | 1.5 | T27-14 |

#### Day 4 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-16 | Automated backup script: pg_dump, gzip, local + offsite storage, retention policy | DevOps | 3 | T27-10 |
| T27-17 | Backup cron (01:00 UTC daily), failure alerting, log rotation | DevOps | 1.5 | T27-16 |
| T27-18 | Test backup restoration: restore to temp DB, verify data integrity | DevOps | 2 | T27-16 |
| T27-19 | Document backup restoration procedure (step-by-step) | DevOps | 1 | T27-18 |
| T27-20 | Build production Docker images: NestJS API, Next.js frontend, BullMQ worker | DevOps | 3 | T27-04 |

#### Day 5 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-21 | Deploy all services to production: docker-compose up -d | DevOps | 2 | T27-20, T27-05, T27-10, T27-14 |
| T27-22 | Verify deployment: all services healthy, frontend loads, API responds | DevOps | 2 | T27-21 |
| T27-23 | Verify: user registration/login, content browsing, search, image uploads | DevOps | 2 | T27-22 |
| T27-24 | Verify: email sending (Brevo), push notifications, SSL certificate | DevOps | 1.5 | T27-22 |
| T27-25 | Configure production Prometheus: scrape NestJS, Node Exporter, PG Exporter | DevOps | 2 | T27-21 |

### Week 2 (Days 266-270)

#### Day 6 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-26 | Import Grafana dashboards, verify live production data | DevOps | 2 | T27-25 |
| T27-27 | Activate alert rules for production, configure Alertmanager for production channels | DevOps | 1.5 | T27-26 |
| T27-28 | Configure external uptime monitoring (UptimeRobot/Pingdom/Cloudflare Health) | DevOps | 1 | T27-22 |
| T27-29 | Define load test scenarios and expected traffic baseline | DevOps | 1.5 | -- |
| T27-30 | Write load test scripts (k6 or Artillery): homepage, search, auth, content, API writes | DevOps | 3 | T27-29 |

#### Day 7 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-31 | Execute load test at 1x expected traffic; monitor Grafana; identify early bottlenecks | DevOps | 2 | T27-30, T27-26 |
| T27-32 | Address bottlenecks from 1x test (query optimization, caching, connection pooling) | DevOps/Backend | 3 | T27-31 |
| T27-33 | Execute load test at 2x expected traffic; verify p95 < 500ms, error rate < 1% | DevOps | 2 | T27-32 |
| T27-34 | Produce load test report: response time distribution, throughput, error rate, graphs | DevOps | 1.5 | T27-33 |
| T27-35 | Final content seeding: fill any gaps from Sprint 26 | Content | 4 | -- |

#### Day 8 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-36 | Content review: quality check, broken links, image optimization, meta descriptions | Content | 4 | T27-35 |
| T27-37 | Select featured/spotlight content for homepage | Content | 1 | T27-36 |
| T27-38 | Rebuild Meilisearch index with final production content | DevOps | 1 | T27-36 |
| T27-39 | Write launch runbook: pre-launch checklist, step-by-step procedure, rollback, escalation | DevOps | 4 | T27-22 |
| T27-40 | Write DNS cutover plan: current config, target config, TTL lowering, step-by-step, rollback | DevOps | 2 | T27-08 |

#### Day 9 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-41 | Review launch runbook with team (dry run walkthrough) | DevOps/All | 2 | T27-39 |
| T27-42 | Lower DNS TTL to 300 seconds (48 hours before planned cutover) | DevOps | 0.5 | T27-40 |
| T27-43 | Build Flutter release: iOS archive, Android AAB | Mobile | 3 | -- |
| T27-44 | Prepare App Store listing: description, screenshots, keywords, privacy policy | Mobile | 3 | T27-43 |
| T27-45 | Prepare Google Play listing: description, screenshots, feature graphic, privacy policy | Mobile | 2.5 | T27-43 |
| T27-46 | Upload iOS app to App Store Connect, submit for review | Mobile | 1.5 | T27-44 |

#### Day 10 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T27-47 | Upload Android AAB to Google Play Console, submit for review | Mobile | 1 | T27-45 |
| T27-48 | Set up Google Analytics 4 or Plausible: install script, configure events, cookie consent integration | Frontend | 3 | -- |
| T27-49 | Configure GA4 goals/conversions: registration, newsletter signup, competition entry | Frontend | 1 | T27-48 |
| T27-50 | Generate sitemap.xml (next-sitemap), configure robots.txt | Frontend | 1.5 | -- |
| T27-51 | Verify Google Search Console, submit sitemap | DevOps | 1 | T27-50 |
| T27-52 | Verify Bing Webmaster Tools, submit sitemap | DevOps | 0.5 | T27-50 |
| T27-53 | Create social media launch assets: announcement graphic, teaser graphics, app store badges | Marketing | 4 | -- |
| T27-54 | Write launch announcement copy, create posting schedule | Marketing | 2 | T27-53 |
| T27-55 | Verify Open Graph and Twitter Card meta tags on key pages | Frontend | 1 | -- |

---

## Backend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T27-32 | Bottleneck remediation | Query optimization, add caching, tune connection pool based on load test results | 3 |
| | **Backend Total** | | **3** |

## Frontend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T27-48 | Analytics setup | Install GA4/Plausible script, cookie consent integration, pageview tracking | 3 |
| T27-49 | Analytics events | Configure custom events and conversions | 1 |
| T27-50 | Sitemap + robots.txt | next-sitemap config, dynamic sitemap generation, robots.txt with sitemap reference | 1.5 |
| T27-55 | OG/Twitter meta tags | Verify og:title, og:description, og:image, twitter:card on homepage, articles, events | 1 |
| | **Frontend Total** | | **6.5** |

## Mobile Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T27-43 | Release builds | Flutter build ios --release, flutter build appbundle --release, signing config | 3 |
| T27-44 | App Store listing | Write description, take screenshots (multiple device sizes), set keywords, categories, privacy URL | 3 |
| T27-45 | Google Play listing | Write description, take screenshots, create feature graphic, set categories, privacy URL | 2.5 |
| T27-46 | iOS submission | Upload via Xcode/Transporter, complete App Store Connect forms, submit for review | 1.5 |
| T27-47 | Android submission | Upload AAB, complete Play Console forms, submit for review | 1 |
| | **Mobile Total** | | **11** |

## DevOps/Infrastructure Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T27-01-03 | Server provisioning | Hetzner order, OS install, SSH, firewall, security, swap | 6 |
| T27-04 | Docker Compose production | All services, volumes, restart policies, env vars, resource limits, health checks | 4 |
| T27-05-07 | Nginx production | Reverse proxy, SSL, gzip, caching, rate limiting, timeouts, logs, health checks | 7 |
| T27-08-09 | Cloudflare production | DNS, SSL Full Strict, WAF, page rules, Bot Fight Mode | 3.5 |
| T27-10-13 | PostgreSQL production | Config tuning, PgBouncer, migrations, user privileges, pg_stat_statements | 6.5 |
| T27-14-15 | Meilisearch production | Deploy, master key, indexes, search settings, synonyms | 3.5 |
| T27-16-19 | Automated backups | Backup script, cron, offsite storage, retention, test restore, documentation | 7.5 |
| T27-20 | Docker image builds | Build and tag production images for API, frontend, worker | 3 |
| T27-21-24 | Deploy + verify | docker-compose up, service health, feature verification, SSL, email, push | 7.5 |
| T27-25-28 | Production monitoring | Prometheus config, Grafana import, alerts, uptime monitoring | 6.5 |
| T27-29-34 | Load testing | Define scenarios, write scripts, execute 1x + 2x tests, fix bottlenecks, report | 13 |
| T27-38 | Meilisearch re-index | Full index rebuild with final content | 1 |
| T27-39 | Launch runbook | Pre-launch checklist, procedure, rollback, escalation, monitoring checklist | 4 |
| T27-40 | DNS cutover plan | Document current/target config, TTL strategy, step-by-step, rollback | 2 |
| T27-41 | Runbook review | Team walkthrough, dry run | 2 |
| T27-42 | TTL lowering | Lower DNS TTL to 300s | 0.5 |
| T27-51-52 | Search engine submission | Google Search Console, Bing Webmaster Tools, sitemap submission | 1.5 |
| | **DevOps Total** | | **75.5** |

## Content Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T27-35 | Final content seeding | Fill gaps: remaining articles, events, restaurants, guides, videos | 4 |
| T27-36 | Content review | Quality check, broken links, image optimization, meta descriptions/SEO titles | 4 |
| T27-37 | Homepage curation | Select featured articles, events, restaurants for homepage spotlight | 1 |
| | **Content Total** | | **9** |

## Marketing Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T27-53 | Launch graphics | Announcement graphic (2 sizes), 5 teaser graphics, app store badges | 4 |
| T27-54 | Launch copy + schedule | Write announcement copy (short + long), create day-by-day posting schedule | 2 |
| | **Marketing Total** | | **6** |

---

## Dependencies

```
T27-01 (server provision) --> T27-02 (Docker install) --> T27-04 (Docker Compose)
T27-01 --> T27-03 (server security)
T27-04 --> T27-05 (Nginx) --> T27-06, T27-07 (Nginx config)
T27-01 --> T27-08 (Cloudflare DNS) --> T27-09 (Cloudflare WAF/rules)
T27-04 --> T27-10 (PostgreSQL) --> T27-11 (PgBouncer), T27-12 (migrations), T27-13 (pg_stat_statements)
T27-04 --> T27-14 (Meilisearch) --> T27-15 (search config)
T27-10 --> T27-16 (backup script) --> T27-17 (cron), T27-18 (test restore) --> T27-19 (documentation)
T27-04 --> T27-20 (build images)
T27-20, T27-05, T27-10, T27-14 --> T27-21 (deploy) --> T27-22 (verify) --> T27-23, T27-24 (feature verify)
T27-21 --> T27-25 (Prometheus) --> T27-26 (Grafana) --> T27-27 (alerts)
T27-22 --> T27-28 (uptime monitoring)
T27-29 (load test scenarios) --> T27-30 (scripts) --> T27-31 (1x test) --> T27-32 (fix bottlenecks) --> T27-33 (2x test) --> T27-34 (report)
T27-35 (content seeding) --> T27-36 (review) --> T27-37 (homepage curation) --> T27-38 (re-index)
T27-22 --> T27-39 (runbook)
T27-08 --> T27-40 (DNS plan) --> T27-42 (lower TTL)
T27-39 --> T27-41 (runbook review)
T27-43 (Flutter builds) --> T27-44 (App Store listing), T27-45 (Play listing)
T27-44 --> T27-46 (iOS submit)
T27-45 --> T27-47 (Android submit)
T27-50 (sitemap) --> T27-51 (Google), T27-52 (Bing)
T27-53 (graphics) --> T27-54 (copy + schedule)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hetzner server provisioning delay | Low | High | Order server immediately on Day 1; have backup provider identified |
| SSL certificate issues (Let's Encrypt rate limits) | Low | Medium | Use staging cert for testing; only request production cert once confident |
| Load test reveals critical performance bottleneck | Medium | High | Allocate Day 7 for bottleneck remediation; have query optimization strategies ready |
| App Store review rejection | Medium | High | Follow App Store Review Guidelines carefully; submit early for maximum review buffer; prepare response plan |
| Google Play review rejection | Low | Medium | Google reviews are typically faster; address content policy issues proactively |
| DNS propagation takes longer than expected | Low | Medium | Lower TTL 48h in advance; use Cloudflare proxied records; have fallback IP ready |
| Backup restoration test fails | Low | High | Test early (Day 4); fix backup script immediately; consider WAL archiving as additional backup method |
| Database migration fails on production | Medium | High | Test migrations on staging with production-like data first; have rollback migration ready |

---

## Deliverables Checklist

- [ ] Hetzner production server provisioned and secured
- [ ] Docker Compose production configuration with all services
- [ ] Nginx configured with SSL, caching, rate limiting, compression
- [ ] Cloudflare configured with DNS, SSL Full Strict, WAF, page rules
- [ ] PostgreSQL production-tuned with PgBouncer connection pooling
- [ ] Meilisearch deployed with full production index
- [ ] Automated database backups with offsite storage and tested restoration
- [ ] Application deployed to production and all services verified
- [ ] Prometheus + Grafana monitoring live on production
- [ ] Alert rules active with notifications configured
- [ ] External uptime monitoring configured
- [ ] Load test at 2x traffic: p95 < 500ms, error rate < 1%
- [ ] Load test report produced
- [ ] Final content seeded and reviewed
- [ ] Meilisearch re-indexed with final content
- [ ] Launch runbook written and reviewed
- [ ] DNS cutover plan written and TTL lowered
- [ ] iOS app submitted to App Store
- [ ] Android app submitted to Google Play
- [ ] Web analytics installed and verified
- [ ] Sitemap submitted to Google and Bing
- [ ] Social media launch assets created
- [ ] Launch posting schedule ready

---

## Definition of Done

- Production environment is fully operational with all services healthy
- Frontend, API, search, email, and push notifications all verified working in production
- Nginx serves HTTPS with valid certificate, compression, caching, and rate limiting
- Cloudflare is proxying traffic with WAF and page rules active
- Database is tuned, connection-pooled via PgBouncer, and backed up with tested restoration
- Load test at 2x expected traffic passes: p95 < 500ms, error rate < 1%
- Monitoring stack is live with dashboards and alerts operational
- Launch runbook and DNS cutover plan reviewed by team
- Mobile apps submitted to both stores
- Analytics tracking verified
- Sitemaps submitted to Google and Bing
- Social media assets ready for launch day
- All code reviewed and merged
- Team confirms readiness for launch

---

## Sprint Review Demo Script

1. **Production environment tour** (4 min): Show Hetzner server specs; walk through docker-compose.production.yml; show `docker ps` with all services running and healthy; show Nginx config highlights (SSL, caching, rate limiting)
2. **Cloudflare configuration** (2 min): Show DNS records, SSL mode, WAF rules, page rules, analytics
3. **Database setup** (2 min): Show PostgreSQL config settings; demonstrate PgBouncer pool stats; show pg_stat_statements top queries
4. **Backup system** (2 min): Show backup cron entry; show latest backup file in offsite storage; demonstrate backup restoration test result
5. **Live production demo** (4 min): Browse iloveberlin.biz in production: homepage, search, article detail, event detail, restaurant with gallery, register account, login, add favorite
6. **Monitoring** (3 min): Open Grafana at monitor.iloveberlin.biz; walk through system, API, business dashboards with live production data; show alert rules; show uptime monitoring status
7. **Load test results** (3 min): Present load test report: traffic profile, response time distribution at 2x load, throughput graph, error rate (should be near zero), bottlenecks identified and resolved
8. **Content status** (2 min): Show content counts (articles, events, restaurants, guides, videos); browse homepage with featured content
9. **Mobile app submission** (2 min): Show App Store Connect status (submitted/in review); show Google Play Console status; walk through app store listings
10. **SEO and analytics** (2 min): Show Google Analytics with test traffic; show sitemap.xml; show Google Search Console verification; show Bing Webmaster Tools
11. **Launch readiness** (3 min): Walk through launch runbook highlights; present DNS cutover plan; show social media assets; confirm team readiness

**Total demo time:** ~29 minutes

---

## Rollover Criteria

Items roll over to Sprint 28 (but Sprint 28 is launch, so these must be handled immediately):
- App store review rejections -- address feedback and resubmit immediately in Sprint 28
- Load test bottlenecks not fully resolved -- continue optimization in Sprint 28 Day 1
- Any content gaps -- fill before launch

Items that **must** be completed this sprint (no rollover):
- Production server provisioned and all services deployed
- Nginx, Cloudflare, PostgreSQL, Meilisearch configured
- Automated backups operational and tested
- Load test executed with acceptable results
- Monitoring fully operational
- Launch runbook and DNS cutover plan complete
- Mobile apps submitted to stores
- Sitemaps submitted to search engines
