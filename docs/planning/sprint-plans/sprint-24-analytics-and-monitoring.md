# Sprint 24: Analytics & Monitoring

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 24 |
| **Sprint Name** | Analytics & Monitoring |
| **Duration** | 2 weeks (10 working days) |
| **Start Date** | Week 47 (Day 231) |
| **End Date** | Week 48 (Day 240) |
| **Phase** | Phase 4 -- Mobile & Notifications (Final Sprint) |

## Sprint Goal

Instrument the entire iloveberlin.biz platform with Prometheus metrics and structured logging, deploy a production-grade Prometheus + Grafana monitoring stack on Hetzner, build dashboards covering system health, API performance, business KPIs, and PostgreSQL, configure alert rules for critical thresholds, implement internal analytics tracking with aggregation crons, deliver an admin analytics section, and conduct the Phase 4 retrospective.

---

## User Stories

### US-24-01: NestJS Prometheus Instrumentation
**As a** platform operator,
**I want to** expose Prometheus metrics from the NestJS API,
**so that** I can monitor request rates, latencies, and error rates in real time.

**Acceptance Criteria:**
- [ ] `prom-client` library integrated in NestJS
- [ ] Default Node.js metrics collected (CPU, memory, event loop lag, GC)
- [ ] HTTP request metrics: `http_request_duration_seconds` histogram with labels: method, route, status_code
- [ ] HTTP request counter: `http_requests_total` with same labels
- [ ] Active connections gauge: `http_active_connections`
- [ ] Metrics endpoint at `/metrics` protected by internal-only access (IP whitelist or API key)
- [ ] Middleware applied globally to all routes

### US-24-02: Custom Business Metrics
**As a** platform operator,
**I want to** track business-specific metrics via Prometheus,
**so that** I can monitor platform health beyond infrastructure.

**Acceptance Criteria:**
- [ ] `users_registered_total` counter (incremented on registration)
- [ ] `content_published_total` counter with label: content_type (article, event, video, restaurant, classified)
- [ ] `competition_entries_total` counter with label: competition_id
- [ ] `search_queries_total` counter
- [ ] `email_sent_total` counter with labels: template, status (success/failure)
- [ ] `push_notifications_sent_total` counter with labels: trigger_type, status
- [ ] `favorites_total` gauge with label: content_type
- [ ] `active_sessions` gauge (based on JWT token activity)

### US-24-03: Internal Analytics Tracking
**As a** platform operator,
**I want to** track page views, content interactions, and user engagement internally,
**so that** I have analytics data without relying solely on third-party tools.

**Acceptance Criteria:**
- [ ] `analytics_events` table: id, event_type, entity_type, entity_id, user_id (nullable), session_id, metadata (JSONB), ip_hash, user_agent, created_at
- [ ] POST `/api/analytics/track` endpoint accepting event_type, entity_type, entity_id, metadata
- [ ] Client-side tracking for: page_view, content_view, search, favorite_toggle, share, competition_entry
- [ ] IP address hashed (SHA-256) for privacy; raw IP never stored
- [ ] Events batched client-side (flush every 30 seconds or on page unload)
- [ ] Rate limiting on analytics endpoint (100 events/minute per IP)

### US-24-04: Analytics Aggregation Cron Jobs
**As a** platform operator,
**I want to** view aggregated analytics summaries,
**so that** I can quickly understand trends without querying raw event data.

**Acceptance Criteria:**
- [ ] `analytics_daily_summary` table: date, event_type, entity_type, entity_id, count, unique_users
- [ ] Daily aggregation cron runs at 02:00 UTC via NestJS @Cron decorator
- [ ] Aggregates: total page views per content item, unique viewers, total searches, top search terms, total favorites by type
- [ ] Weekly summary cron (Monday 03:00 UTC) for week-over-week comparisons
- [ ] Cron execution logged with duration and record counts
- [ ] Raw events older than 90 days archived/deleted by cleanup cron

### US-24-05: Health Check Endpoints
**As a** DevOps engineer,
**I want to** have health check endpoints for all services,
**so that** monitoring and load balancers can detect unhealthy instances.

**Acceptance Criteria:**
- [ ] GET `/health` returns 200 with `{ status: "ok", timestamp }` (lightweight, no DB call)
- [ ] GET `/health/ready` checks: database connection, Redis connection, Meilisearch connection
- [ ] Each dependency returns individual status: `{ db: "ok", redis: "ok", meilisearch: "ok" }`
- [ ] If any dependency is down, return 503 with the failing component identified
- [ ] Response time of `/health` under 10ms; `/health/ready` under 500ms
- [ ] Health endpoints excluded from authentication middleware

### US-24-06: Structured JSON Logging
**As a** DevOps engineer,
**I want** all application logs in structured JSON format,
**so that** I can parse, search, and aggregate logs efficiently.

**Acceptance Criteria:**
- [ ] NestJS logger replaced with Winston or Pino configured for JSON output
- [ ] Every log entry contains: timestamp, level, message, service, requestId (correlation ID), userId (if authenticated)
- [ ] HTTP request/response logs include: method, url, statusCode, duration, userAgent
- [ ] Error logs include: stack trace, error code, request context
- [ ] Log levels: error, warn, info, debug (configurable via environment variable)
- [ ] Logs written to stdout (Docker best practice)
- [ ] Sensitive data (passwords, tokens) never logged

### US-24-07: Prometheus and Grafana Deployment
**As a** DevOps engineer,
**I want to** deploy Prometheus and Grafana on the Hetzner server,
**so that** I have a monitoring stack for the platform.

**Acceptance Criteria:**
- [ ] Prometheus deployed via Docker Compose on the Hetzner monitoring server
- [ ] Prometheus configured to scrape NestJS `/metrics` endpoint every 15 seconds
- [ ] Prometheus configured to scrape Node Exporter (system metrics)
- [ ] Prometheus configured to scrape PostgreSQL Exporter
- [ ] Prometheus data retention: 30 days
- [ ] Grafana deployed via Docker Compose with persistent volume
- [ ] Grafana configured with Prometheus as default data source
- [ ] Grafana accessible via HTTPS at monitoring subdomain (e.g., `monitor.iloveberlin.biz`)
- [ ] Grafana admin password set via environment variable; default login disabled

### US-24-08: Grafana Dashboards
**As a** platform operator,
**I want** comprehensive Grafana dashboards,
**so that** I can visualize system health, API performance, and business metrics at a glance.

**Acceptance Criteria:**
- [ ] **System Dashboard**: CPU usage, memory usage, disk I/O, network I/O, disk space, load average
- [ ] **API Dashboard**: Request rate (rpm), error rate (%), p50/p95/p99 latency, top endpoints by traffic, top endpoints by error rate, active connections
- [ ] **Business Dashboard**: New registrations/day, content published/day by type, search queries/day, favorites/day, competition entries, active sessions
- [ ] **PostgreSQL Dashboard**: Active connections, queries per second, cache hit ratio, table sizes, slow queries, replication lag (if applicable)
- [ ] All dashboards have auto-refresh (30s) and time range selector
- [ ] Dashboards exported as JSON for version control

### US-24-09: Alert Rules
**As a** platform operator,
**I want** automated alerts when critical thresholds are breached,
**so that** I am notified of problems before users are significantly impacted.

**Acceptance Criteria:**
- [ ] Alert: API error rate > 5% for 5 minutes -> critical
- [ ] Alert: API p95 latency > 1 second for 5 minutes -> warning
- [ ] Alert: API p95 latency > 3 seconds for 5 minutes -> critical
- [ ] Alert: Disk usage > 80% -> warning
- [ ] Alert: Disk usage > 90% -> critical
- [ ] Alert: PostgreSQL active connections > 80% of max -> warning
- [ ] Alert: Health check endpoint returns 503 for 2 minutes -> critical
- [ ] Alert: Email queue dead letter queue has > 0 items -> warning
- [ ] Alert: No metrics received from NestJS for 5 minutes -> critical
- [ ] Alert rules defined in Prometheus alerting rules YAML file

### US-24-10: Alert Notifications (Email and Slack)
**As a** platform operator,
**I want** alert notifications delivered to email and Slack,
**so that** the team is notified promptly.

**Acceptance Criteria:**
- [ ] Alertmanager deployed via Docker Compose
- [ ] Email notifications configured via Brevo SMTP for critical alerts
- [ ] Slack webhook configured for all alert severities
- [ ] Alert grouping: related alerts grouped to avoid notification spam
- [ ] Alert inhibition: critical alert inhibits warning for same metric
- [ ] Alert silence capability via Alertmanager UI
- [ ] Test alert sent and verified during setup

### US-24-11: Admin Analytics Section
**As an** admin user,
**I want** an analytics section in the admin panel,
**so that** I can view platform performance and content metrics without accessing Grafana.

**Acceptance Criteria:**
- [ ] Admin analytics page at `/admin/analytics`
- [ ] Overview cards: total users, total content items, page views today, active users today
- [ ] Time-series chart: page views over last 30 days
- [ ] Top content table: most viewed articles, events, restaurants (last 7 days)
- [ ] Search analytics: top search terms, search volume trend
- [ ] User growth chart: new registrations over last 30 days
- [ ] Data sourced from `analytics_daily_summary` table via admin API endpoints

### US-24-12: Content Performance Dashboard
**As a** content creator/admin,
**I want** to see how individual content pieces are performing,
**so that** I can understand what resonates with the audience.

**Acceptance Criteria:**
- [ ] Content performance page accessible from admin analytics
- [ ] Filter by content type and date range
- [ ] Per-item metrics: views, unique viewers, average time (if tracked), favorites count, share count
- [ ] Sortable by any metric column
- [ ] Export to CSV button
- [ ] Sparkline trend for each content item (last 7 days)

---

## Day-by-Day Task Breakdown

### Week 1 (Days 231-235)

#### Day 1 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-01 | Install prom-client, create PrometricsModule in NestJS | Backend | 2 | -- |
| T24-02 | Implement HTTP metrics middleware (histogram, counter, active connections) | Backend | 3 | T24-01 |
| T24-03 | Expose `/metrics` endpoint with IP whitelist guard | Backend | 1.5 | T24-01 |
| T24-04 | Enable default Node.js metrics (CPU, memory, event loop, GC) | Backend | 0.5 | T24-01 |
| T24-05 | Replace NestJS default logger with Pino (structured JSON) | Backend | 3 | -- |

#### Day 2 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-06 | Implement custom business metrics: users_registered_total, content_published_total | Backend | 2 | T24-01 |
| T24-07 | Implement custom metrics: competition_entries_total, search_queries_total | Backend | 1.5 | T24-01 |
| T24-08 | Implement custom metrics: email_sent_total, push_notifications_sent_total | Backend | 1.5 | T24-01 |
| T24-09 | Implement custom metrics: favorites_total gauge, active_sessions gauge | Backend | 2 | T24-01 |
| T24-10 | Add correlation ID (requestId) to all log entries via middleware | Backend | 1.5 | T24-05 |
| T24-11 | Configure log levels via env var, ensure sensitive data exclusion | Backend | 1 | T24-05 |

#### Day 3 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-12 | Create `analytics_events` table migration | Backend | 1 | -- |
| T24-13 | Create POST `/api/analytics/track` endpoint with rate limiting | Backend | 3 | T24-12 |
| T24-14 | Implement IP hashing (SHA-256), session ID handling | Backend | 1.5 | T24-13 |
| T24-15 | Implement client-side analytics tracking service (batch + flush) | Frontend | 3 | T24-13 |
| T24-16 | Add tracking calls: page_view, content_view, search, favorite, share, competition_entry | Frontend | 2 | T24-15 |

#### Day 4 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-17 | Create `analytics_daily_summary` table migration | Backend | 1 | -- |
| T24-18 | Implement daily aggregation cron (02:00 UTC) | Backend | 3 | T24-17, T24-12 |
| T24-19 | Implement weekly summary cron (Monday 03:00 UTC) | Backend | 2 | T24-17 |
| T24-20 | Implement raw event cleanup cron (delete > 90 days) | Backend | 1 | T24-12 |
| T24-21 | Implement health check endpoints: GET `/health` and GET `/health/ready` | Backend | 2.5 | -- |

#### Day 5 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-22 | Write Docker Compose for Prometheus (config, scrape targets, retention) | DevOps | 3 | T24-03 |
| T24-23 | Write Docker Compose for Grafana (persistent volume, datasource provisioning) | DevOps | 2 | T24-22 |
| T24-24 | Configure Node Exporter for system metrics | DevOps | 1 | T24-22 |
| T24-25 | Configure PostgreSQL Exporter | DevOps | 1.5 | T24-22 |
| T24-26 | Deploy Prometheus + Grafana stack to Hetzner monitoring server | DevOps | 2.5 | T24-22, T24-23, T24-24, T24-25 |

### Week 2 (Days 236-240)

#### Day 6 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-27 | Set up Nginx reverse proxy for Grafana with HTTPS (monitor.iloveberlin.biz) | DevOps | 2 | T24-26 |
| T24-28 | Create System Dashboard in Grafana (CPU, memory, disk, network, load) | DevOps | 3 | T24-26 |
| T24-29 | Create API Dashboard in Grafana (request rate, error rate, latency percentiles, top endpoints) | DevOps | 3 | T24-26, T24-02 |

#### Day 7 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-30 | Create Business Dashboard in Grafana (registrations, content published, searches, favorites, sessions) | DevOps | 3 | T24-26, T24-06-09 |
| T24-31 | Create PostgreSQL Dashboard in Grafana (connections, QPS, cache hit ratio, table sizes) | DevOps | 3 | T24-25, T24-26 |
| T24-32 | Export all dashboards as JSON, commit to repository | DevOps | 1 | T24-28-31 |

#### Day 8 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-33 | Write Prometheus alert rules YAML (error rate, latency, disk, connections, health, DLQ, scrape) | DevOps | 3 | T24-22 |
| T24-34 | Deploy Alertmanager via Docker Compose | DevOps | 1.5 | T24-22 |
| T24-35 | Configure Alertmanager: email via Brevo SMTP, Slack webhook | DevOps | 2 | T24-34 |
| T24-36 | Configure alert grouping, inhibition rules, silence capability | DevOps | 1.5 | T24-35 |
| T24-37 | Send test alert and verify delivery on email and Slack | DevOps | 1 | T24-35 |

#### Day 9 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-38 | Backend: admin analytics API endpoints (overview stats, time-series, top content, search analytics) | Backend | 4 | T24-18 |
| T24-39 | Frontend: admin analytics page layout with overview cards | Frontend | 3 | T24-38 |
| T24-40 | Frontend: page views time-series chart (Chart.js or Recharts) | Frontend | 2 | T24-39 |
| T24-41 | Frontend: top content table, search analytics, user growth chart | Frontend | 3 | T24-39 |

#### Day 10 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T24-42 | Backend: content performance API endpoints (per-item metrics, sortable, CSV export) | Backend | 3 | T24-18 |
| T24-43 | Frontend: content performance dashboard with filters, table, sparklines, CSV export | Frontend | 4 | T24-42 |
| T24-44 | QA: verify Prometheus scraping all targets, metrics populating | QA | 1 | T24-26 |
| T24-45 | QA: verify all 4 Grafana dashboards display correct data | QA | 1.5 | T24-28-31 |
| T24-46 | QA: trigger alert conditions and verify notifications arrive | QA | 1.5 | T24-37 |
| T24-47 | QA: test analytics tracking (track events, verify aggregation, test admin views) | QA | 2 | T24-18, T24-41, T24-43 |
| T24-48 | QA: test health check endpoints (simulate DB down, Redis down) | QA | 1 | T24-21 |
| T24-49 | Phase 4 retrospective meeting (team) | All | 2 | -- |

---

## Backend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T24-01 | Prometheus module | Install prom-client, create NestJS module, register as global | 2 |
| T24-02 | HTTP metrics middleware | Histogram for duration, counter for total, gauge for active connections, route normalization | 3 |
| T24-03 | Metrics endpoint | /metrics controller, IP whitelist guard, PrometheusController | 1.5 |
| T24-04 | Default metrics | collectDefaultMetrics() configuration | 0.5 |
| T24-05 | Structured logging | Install pino + nestjs-pino, configure JSON format, replace default logger | 3 |
| T24-06-09 | Custom business metrics | 8 custom metrics with correct labels, increment/set in relevant services | 7 |
| T24-10-11 | Logging enhancements | Correlation ID middleware, log level env config, sensitive data filter | 2.5 |
| T24-12 | Analytics events table | Migration: id, event_type, entity_type, entity_id, user_id, session_id, metadata, ip_hash, user_agent, created_at; indexes | 1 |
| T24-13-14 | Analytics tracking endpoint | POST /api/analytics/track, validation, rate limiting, IP hashing, session handling | 4.5 |
| T24-17-20 | Aggregation crons | Daily summary table migration, daily cron, weekly cron, cleanup cron | 7 |
| T24-21 | Health checks | /health (lightweight), /health/ready (DB + Redis + Meilisearch), NestJS Terminus | 2.5 |
| T24-38 | Admin analytics API | GET /api/admin/analytics/overview, /timeseries, /top-content, /search-analytics, /user-growth | 4 |
| T24-42 | Content performance API | GET /api/admin/analytics/content-performance with filters, sorting, CSV export | 3 |
| | **Backend Total** | | **41.5** |

## Frontend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T24-15 | Analytics tracking service | AnalyticsService class, event batching (array + 30s timer), flush on unload (sendBeacon) | 3 |
| T24-16 | Add tracking calls | Instrument page views (router), content views (detail pages), search, favorites, shares, entries | 2 |
| T24-39 | Admin analytics layout | Page with grid layout, overview stat cards (users, content, views, active users) | 3 |
| T24-40 | Page views chart | Line chart with 30-day data, date axis, view count axis | 2 |
| T24-41 | Top content + search + growth | Sortable table, search terms list, line chart for registrations | 3 |
| T24-43 | Content performance dashboard | Filter bar (type, date range), metrics table, sparkline column, CSV download button | 4 |
| | **Frontend Total** | | **17** |

## DevOps/Infrastructure Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T24-22 | Prometheus Docker Compose | Docker image, prometheus.yml (scrape configs, retention 30d), volume mount | 3 |
| T24-23 | Grafana Docker Compose | Docker image, persistent volume, datasource provisioning YAML, env admin password | 2 |
| T24-24 | Node Exporter | Docker service, host network, system metrics exposure | 1 |
| T24-25 | PostgreSQL Exporter | Docker service, DSN config, custom queries for table sizes | 1.5 |
| T24-26 | Deploy stack | docker-compose up on Hetzner, verify scrape targets, troubleshoot connectivity | 2.5 |
| T24-27 | Nginx + HTTPS for Grafana | Server block, Let's Encrypt cert, proxy_pass to Grafana, basic auth or Grafana auth | 2 |
| T24-28 | System Dashboard | Panels: CPU, memory, disk I/O, network, disk space, load average; auto-refresh 30s | 3 |
| T24-29 | API Dashboard | Panels: RPS, error %, p50/p95/p99 latency, top endpoints by traffic and errors, active connections | 3 |
| T24-30 | Business Dashboard | Panels: registrations/day, content/day by type, searches, favorites, sessions | 3 |
| T24-31 | PostgreSQL Dashboard | Panels: connections, QPS, cache hit ratio, table sizes, slow queries | 3 |
| T24-32 | Export dashboards | Export JSON, add to repo under /infrastructure/grafana/dashboards/ | 1 |
| T24-33 | Alert rules | prometheus_rules.yml with all 9 alert conditions | 3 |
| T24-34 | Alertmanager deploy | Docker Compose service, config file | 1.5 |
| T24-35 | Alert notification config | Brevo SMTP receiver, Slack webhook receiver, route config | 2 |
| T24-36 | Alert tuning | Group_by, group_wait, group_interval, inhibit_rules, silence UI | 1.5 |
| T24-37 | Test alert | Trigger test condition, verify email + Slack delivery | 1 |
| | **DevOps Total** | | **34** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---|---|---|---|
| T24-44 | Prometheus verification | All scrape targets UP; NestJS metrics populating; Node Exporter metrics visible; PG Exporter metrics visible | 1 |
| T24-45 | Dashboard verification | Each dashboard loads without errors; all panels display data; time range selector works; auto-refresh functions | 1.5 |
| T24-46 | Alert testing | Simulate >5% error rate (return 500s), verify alert fires and email/Slack received; simulate disk >80% alert; verify inhibition (critical inhibits warning) | 1.5 |
| T24-47 | Analytics testing | Track events from frontend, verify they appear in analytics_events table; wait for cron, verify daily summary; check admin analytics page numbers match; test CSV export | 2 |
| T24-48 | Health check testing | /health returns 200; stop PostgreSQL, verify /health/ready returns 503 with db:down; restart, verify recovery | 1 |
| | **QA Total** | | **7** |

---

## Dependencies

```
T24-01 (prom-client) --> T24-02 (HTTP metrics), T24-03 (/metrics), T24-04 (default metrics), T24-06-09 (custom metrics)
T24-05 (Pino logger) --> T24-10 (correlation ID), T24-11 (log levels)
T24-12 (analytics table) --> T24-13 (track endpoint) --> T24-14 (IP hashing)
T24-13 --> T24-15 (frontend tracking) --> T24-16 (tracking calls)
T24-17 (summary table) --> T24-18 (daily cron), T24-19 (weekly cron)
T24-18 --> T24-38 (admin analytics API) --> T24-39 (admin analytics frontend)
T24-39 --> T24-40 (chart), T24-41 (tables)
T24-42 (content perf API) --> T24-43 (content perf frontend)
T24-22 (Prometheus) --> T24-23 (Grafana), T24-24 (Node Exporter), T24-25 (PG Exporter)
T24-22, T24-23, T24-24, T24-25 --> T24-26 (deploy)
T24-26 --> T24-27 (Nginx), T24-28-31 (dashboards), T24-33 (alerts)
T24-33 --> T24-34 (Alertmanager) --> T24-35 (notification config) --> T24-36 (tuning) --> T24-37 (test)
T24-28-31 --> T24-32 (export)
All tasks --> T24-44-48 (QA)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Prometheus scraping blocked by network/firewall between monitoring server and app server | Medium | High | Test connectivity early; configure Docker network correctly; use SSH tunnel if needed |
| High cardinality metrics causing Prometheus memory issues | Medium | Medium | Normalize route labels (remove dynamic params); set metric label limits |
| Grafana dashboard complexity slows rendering | Low | Low | Limit panel count per dashboard; use appropriate time ranges |
| Analytics tracking impacts frontend performance | Low | Medium | Batch events; use sendBeacon for unload; async non-blocking |
| Alertmanager email delivery via Brevo SMTP | Medium | Medium | Test SMTP credentials early; have Slack as backup channel |
| Phase 4 retrospective reveals significant issues needing re-work | Medium | Medium | Timebox retrospective; defer non-critical items to Phase 5 backlog |

---

## Deliverables Checklist

- [ ] NestJS Prometheus metrics endpoint at `/metrics`
- [ ] HTTP request metrics (histogram, counter, active connections)
- [ ] Default Node.js metrics (CPU, memory, event loop, GC)
- [ ] 8 custom business metrics
- [ ] Structured JSON logging with correlation IDs
- [ ] Internal analytics tracking (POST `/api/analytics/track`)
- [ ] Client-side analytics batching and tracking calls
- [ ] Analytics daily and weekly aggregation cron jobs
- [ ] Raw event cleanup cron (90-day retention)
- [ ] Health check endpoints (`/health`, `/health/ready`)
- [ ] Prometheus deployed on Hetzner with all scrape targets
- [ ] Grafana deployed with HTTPS access
- [ ] System Dashboard
- [ ] API Dashboard
- [ ] Business Dashboard
- [ ] PostgreSQL Dashboard
- [ ] Dashboard JSON exports committed to repo
- [ ] 9 alert rules configured in Prometheus
- [ ] Alertmanager with email and Slack notifications
- [ ] Admin analytics page with overview, charts, tables
- [ ] Content performance dashboard with filters and CSV export
- [ ] Phase 4 retrospective completed

---

## Definition of Done

- Prometheus scrapes all configured targets successfully (NestJS, Node Exporter, PostgreSQL Exporter)
- All 4 Grafana dashboards display live data and auto-refresh
- All 9 alert rules are defined and at least 1 test alert has been successfully delivered to both email and Slack
- Internal analytics tracking captures events from the frontend and aggregation crons produce daily summaries
- Admin analytics section displays accurate, up-to-date platform metrics
- Health check endpoints correctly report service status, including degraded states
- Structured logging is active with JSON output and correlation IDs
- All code reviewed and merged
- All QA test scenarios passed
- Phase 4 retrospective documented with action items

---

## Sprint Review Demo Script

1. **Prometheus metrics** (3 min): Show `/metrics` endpoint output; highlight HTTP histogram, custom business metrics; show Prometheus targets page with all targets UP
2. **Grafana System Dashboard** (2 min): Walk through CPU, memory, disk, network panels; change time range; show auto-refresh
3. **Grafana API Dashboard** (3 min): Show request rate, error rate, p95 latency; drill into top endpoints; demonstrate time range selector
4. **Grafana Business Dashboard** (2 min): Show registrations trend, content published by type, search volume, active sessions
5. **Grafana PostgreSQL Dashboard** (2 min): Show connection count, QPS, cache hit ratio, table sizes
6. **Alert demonstration** (3 min): Trigger a test alert (e.g., simulated high error rate); show alert firing in Prometheus; show notification arriving in Slack and email; demonstrate Alertmanager silence UI
7. **Health checks** (2 min): Hit `/health` (fast 200), hit `/health/ready` (all green); simulate stopping Redis; hit `/health/ready` again (503 with redis: down); restart Redis; show recovery
8. **Structured logging** (1 min): Show JSON log output with correlation ID, request context, error stack trace
9. **Admin analytics** (3 min): Open admin analytics page; show overview cards; browse page views chart; review top content table; check search analytics; view user growth
10. **Content performance** (2 min): Open content performance dashboard; filter by articles; sort by views; export CSV; show sparkline trends
11. **Phase 4 retrospective summary** (2 min): Summarize key wins, challenges, and action items from retrospective

**Total demo time:** ~25 minutes

---

## Rollover Criteria

Items roll over to Sprint 25 if:
- Content performance dashboard (US-24-12) is incomplete -- admin analytics overview (US-24-11) takes priority
- PostgreSQL dashboard has limited panels -- system and API dashboards are mandatory
- Weekly aggregation cron is not complete -- daily cron is mandatory
- Alert notification via one channel (email OR Slack) fails -- at least one channel must work

Items that **must** be completed this sprint (no rollover):
- Prometheus instrumentation and `/metrics` endpoint
- Health check endpoints
- Structured JSON logging
- Prometheus + Grafana deployed and accessible
- System and API dashboards functional
- At least 3 alert rules active with at least 1 notification channel working
- Daily analytics aggregation cron running
- Admin analytics overview page functional
- Phase 4 retrospective completed
