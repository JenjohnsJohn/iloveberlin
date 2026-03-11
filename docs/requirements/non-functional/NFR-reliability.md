# NFR-REL: Reliability Requirements

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Category:** Non-Functional Requirements -- Reliability
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft

---

## 1. Overview

This document defines the reliability requirements for the ILoveBerlin platform, encompassing availability targets, backup and recovery strategies, fault tolerance patterns, monitoring, alerting, and incident response procedures. The platform runs on Hetzner VPS infrastructure with Cloudflare CDN providing edge-level resilience. All reliability measures are designed to protect against data loss, minimize downtime, and ensure a consistent user experience even when components fail.

---

## 2. Availability Targets

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-001 | The platform shall maintain an **uptime target of 99.5%**, measured monthly, for all user-facing services (web frontend, API, search). This allows a maximum of approximately 3 hours and 39 minutes of unplanned downtime per month. | >= 99.5% monthly uptime | Uptime monitoring service (e.g., UptimeRobot, Hetrixtools) |
| NFR-REL-002 | **Planned maintenance windows** shall be scheduled during low-traffic periods (02:00-06:00 CET on weekday nights) and shall not count against the uptime target. Maintenance shall be announced at least 48 hours in advance. | 48-hour advance notice, off-peak scheduling | Maintenance log |
| NFR-REL-003 | The **Cloudflare CDN layer** shall serve cached static content and stale pages even when the origin server is unavailable, providing partial availability during origin outages. | Static content served during origin downtime | Failover test |
| NFR-REL-004 | Individual service degradation (e.g., search unavailable, image processing delayed) shall **not cause total platform unavailability**. Core browsing and content reading functionality shall remain operational. | Partial degradation, not total outage | Fault injection test |
| NFR-REL-005 | The uptime target shall be increased to **99.9%** (approximately 43 minutes downtime per month) when the platform transitions to Stage 3 (horizontal scaling with load balancer and database replication). | 99.9% at Stage 3 | Uptime monitoring |

---

## 3. Database Backup Strategy

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-010 | **Automated daily backups** of the PostgreSQL database shall be performed using `pg_dump` (logical backup) or `pg_basebackup` (physical backup), completed during low-traffic hours (03:00-04:00 CET). | Daily backup at 03:00 CET | Backup cron job verification, backup log |
| NFR-REL-011 | **Weekly full snapshots** of the entire VPS (including OS, application, and database) shall be created using Hetzner's snapshot functionality or an equivalent tool. | Weekly snapshot | Hetzner snapshot schedule, snapshot log |
| NFR-REL-012 | **Backup retention policy**: | Retention policy implemented | Backup storage audit |
| | - Daily database backups: retained for 14 days | | |
| | - Weekly VPS snapshots: retained for 4 weeks | | |
| | - Monthly archival backups: retained for 12 months | | |
| NFR-REL-013 | Backups shall be stored in a **geographically separate location** from the primary server. Database backups shall be uploaded to Cloudflare R2 (or equivalent object storage) with server-side encryption (AES-256). | Off-site, encrypted backup storage | Backup destination verification |
| NFR-REL-014 | **Backup integrity verification** shall run automatically after each backup, performing a checksum comparison and a test restore to a verification environment at least monthly. | Automated integrity check, monthly test restore | Backup verification log |
| NFR-REL-015 | **WAL (Write-Ahead Log) archiving** shall be configured for PostgreSQL to enable point-in-time recovery (PITR) with a granularity of at least 1 minute. | WAL archiving enabled, 1-min PITR granularity | PostgreSQL configuration review |
| NFR-REL-016 | **Cloudflare R2 data** (user uploads, media) shall be backed up via R2's built-in replication. A monthly audit shall verify that all referenced media files exist in R2 storage. | R2 replication active, monthly audit | R2 dashboard, audit log |

---

## 4. Disaster Recovery

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-020 | **Recovery Time Objective (RTO)**: the platform shall be fully restored to operational status within **4 hours** of a disaster declaration. | RTO < 4 hours | Disaster recovery drill |
| NFR-REL-021 | **Recovery Point Objective (RPO)**: maximum acceptable data loss shall be **1 hour** of transactions, achieved through WAL archiving and frequent backup schedules. | RPO < 1 hour | WAL archiving verification, PITR test |
| NFR-REL-022 | A **Disaster Recovery Plan (DRP)** document shall be maintained with step-by-step procedures for the following scenarios: | DRP document maintained | Document review |
| | - **Scenario A**: Single service failure (e.g., NestJS crashes) -- automatic restart | | |
| | - **Scenario B**: Server failure (VPS unresponsive) -- provision new VPS, restore from snapshot | | |
| | - **Scenario C**: Database corruption -- restore from backup + WAL replay | | |
| | - **Scenario D**: Data center failure -- provision in alternate Hetzner region, restore from off-site backup | | |
| | - **Scenario E**: Security breach -- isolate, assess, restore from known-good backup | | |
| NFR-REL-023 | **Disaster recovery drills** shall be conducted at least **quarterly**, simulating Scenario B (server failure) or Scenario C (database corruption), with results documented including actual recovery time. | Quarterly DR drills | Drill report with actual RTO |
| NFR-REL-024 | The DRP shall include a **communication plan** with notification templates for stakeholders, users, and team members, with defined escalation paths and responsibilities. | Communication plan in DRP | DRP document review |
| NFR-REL-025 | **Infrastructure-as-code** (e.g., Terraform, Ansible, or shell scripts) shall define the complete server provisioning process, enabling reproducible environment setup for disaster recovery. | IaC for server provisioning | IaC repository review, provisioning test |

---

## 5. Health Check Endpoints

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-030 | A **liveness endpoint** (`GET /health/live`) shall return HTTP 200 if the NestJS process is running and capable of handling requests. This endpoint shall not check downstream dependencies. | Liveness endpoint operational | HTTP request test |
| NFR-REL-031 | A **readiness endpoint** (`GET /health/ready`) shall return HTTP 200 only when all critical dependencies are available: | Readiness endpoint operational | HTTP request test |
| | - PostgreSQL connection: responsive | | |
| | - Redis connection: responsive | | |
| | - Meilisearch connection: responsive | | |
| | If any dependency is unavailable, return HTTP 503 with a JSON body indicating which service(s) failed. | | |
| NFR-REL-032 | A **detailed health endpoint** (`GET /health/details`, admin-only) shall return the status of each dependency with response time, connection pool utilization, and uptime statistics. | Detailed health endpoint operational | HTTP request test (with admin auth) |
| NFR-REL-033 | Health check endpoints shall respond within **50 milliseconds** at the 99th percentile and shall not be rate-limited. | p99 < 50 ms, no rate limiting | APM, load test |
| NFR-REL-034 | **External uptime monitoring** shall poll the liveness endpoint every **60 seconds** from at least 2 geographic locations. | 60-second polling, 2+ locations | Uptime monitoring configuration |
| NFR-REL-035 | The **Next.js frontend** shall expose a health endpoint (`/api/health`) that verifies the frontend server is running and can connect to the backend API. | Frontend health endpoint operational | HTTP request test |

---

## 6. Graceful Degradation

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-040 | When **Meilisearch is unavailable**, the search feature shall degrade to a PostgreSQL full-text search fallback with reduced performance rather than showing an error. Users shall be notified of limited search functionality via a non-intrusive banner. | Search fallback to PostgreSQL | Fault injection test |
| NFR-REL-041 | When **Redis is unavailable**, the platform shall bypass caching and serve requests directly from the database/API with increased latency. Rate limiting shall fall back to in-memory counters per application instance. | Cache bypass, in-memory rate limiting | Fault injection test |
| NFR-REL-042 | When **Cloudflare R2 is unavailable**, image placeholders shall be displayed for user-uploaded content, and upload functionality shall queue files for later processing. | Image placeholders, upload queuing | Fault injection test |
| NFR-REL-043 | When the **backend API is unavailable**, the Next.js frontend shall serve cached/ISR pages for content browsing. Dynamic features (authentication, submissions, search) shall display user-friendly "temporarily unavailable" messages. | Cached content served, graceful error messages | Fault injection test |
| NFR-REL-044 | **Third-party service failures** (analytics, email, external APIs) shall never cause user-facing errors. These integrations shall use fire-and-forget patterns with background retry. | Third-party failures invisible to users | Fault injection test |
| NFR-REL-045 | The platform shall implement a **maintenance mode** that can be activated via a configuration flag, showing a branded maintenance page served directly by Cloudflare (no origin dependency). | Maintenance mode functional | Activation test |

---

## 7. Error Handling Strategy

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-050 | All API endpoints shall implement **structured error responses** using a consistent format: | Consistent error format | API response audit |
| | ```json | | |
| | { | | |
| |   "statusCode": 400, | | |
| |   "error": "Bad Request", | | |
| |   "message": "Human-readable description", | | |
| |   "details": [...], | | |
| |   "timestamp": "ISO-8601", | | |
| |   "path": "/api/v1/..." | | |
| | } | | |
| | ``` | | |
| NFR-REL-051 | **Unhandled exceptions** shall be caught by a global NestJS exception filter that logs the full error (including stack trace) and returns a sanitized error response to the client (no internal details exposed). | Global exception filter, no internal details leaked | Code review, penetration test |
| NFR-REL-052 | **Frontend error boundaries** (React Error Boundaries) shall wrap all route-level and major component-level sections, preventing a single component failure from crashing the entire page. | Error boundaries on all routes and major sections | Code review |
| NFR-REL-053 | Client-side errors shall be reported to a **centralized error tracking service** (e.g., Sentry) with context (user ID, route, browser, action performed) for debugging. | Client error tracking active | Sentry dashboard, error report |
| NFR-REL-054 | Server-side errors shall be logged with **structured logging** (JSON format) including: timestamp, request ID, user ID, error message, stack trace, HTTP method, path, response status code, and duration. | Structured JSON logging | Log inspection |
| NFR-REL-055 | **Error rates** shall be tracked per endpoint. Any endpoint exceeding a **5% error rate** (5xx responses) over a 5-minute window shall trigger an alert. | 5% error rate alerting threshold | Monitoring configuration |

---

## 8. Circuit Breaker Patterns

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-060 | **Circuit breaker** patterns shall be implemented for all external service calls and critical internal service calls (database, Redis, Meilisearch, R2, external APIs). | Circuit breakers on all external calls | Code review |
| NFR-REL-061 | Circuit breaker **state transitions** shall follow the standard pattern: | Standard circuit breaker behavior | Unit test |
| | - **Closed** (normal): requests pass through normally | | |
| | - **Open** (tripped): after 5 consecutive failures or 50% failure rate in a 30-second window, requests are immediately rejected with a fallback response | | |
| | - **Half-Open** (testing): after 30 seconds in Open state, allow 1 test request through; if successful, transition to Closed; if failed, return to Open | | |
| NFR-REL-062 | Circuit breaker **state changes** shall be logged and shall trigger alerts when a circuit opens (indicating a dependency failure). | State change logging and alerting | Monitoring configuration |
| NFR-REL-063 | When a circuit breaker is **open**, the application shall use the defined fallback behavior (see Graceful Degradation, section 6) rather than queuing requests indefinitely. | Fallback on open circuit | Integration test |

---

## 9. Retry Logic

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-070 | **Transient failure retries** shall be implemented for: database queries (deadlocks, connection errors), Redis commands, Meilisearch requests, R2 uploads, and external API calls. | Retry logic on transient failures | Code review |
| NFR-REL-071 | Retry strategy shall use **exponential backoff with jitter**: | Exponential backoff with jitter | Unit test |
| | - Attempt 1: immediate | | |
| | - Attempt 2: 200ms + random jitter (0-100ms) | | |
| | - Attempt 3: 800ms + random jitter (0-200ms) | | |
| | - Maximum retries: 3 (configurable per operation) | | |
| NFR-REL-072 | Retries shall only be attempted for **idempotent operations** or operations that are safe to repeat. Non-idempotent operations (e.g., payment processing, email sending) shall not be automatically retried without deduplication safeguards. | Idempotent-only retries | Code review |
| NFR-REL-073 | **Retry exhaustion** (all retries failed) shall trigger the circuit breaker evaluation and log the failure with full context for debugging. | Retry exhaustion logged, circuit breaker notified | Integration test |
| NFR-REL-074 | **Background job retry** (BullMQ): failed jobs shall be retried up to 5 times with exponential backoff (1 min, 5 min, 15 min, 30 min, 60 min) before being moved to the dead-letter queue. | 5 retries with backoff, dead-letter queue | BullMQ configuration review |

---

## 10. Monitoring and Alerting

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-080 | A **monitoring stack** shall be deployed to collect, store, and visualize metrics from all platform components. Minimum components: metrics collection (Prometheus or equivalent), visualization (Grafana or equivalent), log aggregation. | Monitoring stack operational | Infrastructure audit |
| NFR-REL-081 | The following **server-level metrics** shall be collected at 15-second intervals: | 15-second collection interval | Monitoring configuration |
| | - CPU utilization (user, system, iowait) | | |
| | - Memory utilization (used, buffered, cached, available) | | |
| | - Disk utilization (space, IOPS, read/write throughput) | | |
| | - Network throughput (in/out, packets, errors) | | |
| | - Process count and state | | |
| NFR-REL-082 | The following **application-level metrics** shall be collected: | Application metrics collected | APM configuration |
| | - Request rate (requests/second) per endpoint | | |
| | - Response time distribution (p50, p95, p99) per endpoint | | |
| | - Error rate (4xx, 5xx) per endpoint | | |
| | - Active connections / concurrent requests | | |
| | - Background job queue depth and processing rate | | |
| NFR-REL-083 | The following **database metrics** shall be collected: | Database metrics collected | Monitoring configuration |
| | - Active connections and connection pool utilization | | |
| | - Query rate and average query time | | |
| | - Replication lag (when read replicas are deployed) | | |
| | - Cache hit ratio (shared_buffers) | | |
| | - Table and index bloat | | |
| | - WAL generation rate | | |
| NFR-REL-084 | **Alert rules** shall be configured for the following conditions with immediate notification: | Alert rules configured | Monitoring alert test |

### Alert Rules

| Alert ID | Condition | Severity | Notification Channel |
|----------|-----------|----------|---------------------|
| ALERT-001 | API error rate (5xx) > 5% over 5 minutes | Critical | Slack + SMS/Email |
| ALERT-002 | API p95 response time > 1 second over 5 minutes | Warning | Slack |
| ALERT-003 | API p95 response time > 2 seconds over 5 minutes | Critical | Slack + SMS/Email |
| ALERT-004 | Disk usage > 80% | Warning | Slack |
| ALERT-005 | Disk usage > 90% | Critical | Slack + SMS/Email |
| ALERT-006 | CPU usage > 80% sustained for 15 minutes | Warning | Slack |
| ALERT-007 | CPU usage > 95% sustained for 5 minutes | Critical | Slack + SMS/Email |
| ALERT-008 | Memory usage > 85% | Warning | Slack |
| ALERT-009 | Memory usage > 95% | Critical | Slack + SMS/Email |
| ALERT-010 | Health check endpoint unreachable for 2 consecutive checks | Critical | Slack + SMS/Email |
| ALERT-011 | Database connection pool > 80% utilization | Warning | Slack |
| ALERT-012 | Database replication lag > 30 seconds | Warning | Slack |
| ALERT-013 | SSL certificate expiry < 14 days | Warning | Slack + Email |
| ALERT-014 | Backup job failed | Critical | Slack + SMS/Email |
| ALERT-015 | Circuit breaker opened for any service | Warning | Slack |
| ALERT-016 | Background job queue depth > 1000 | Warning | Slack |
| ALERT-017 | Background job dead-letter queue has new entries | Warning | Slack |

| NFR-REL-085 | **Alert fatigue** shall be minimized through alert deduplication, grouping, and escalation policies. Alerts that fire more than 3 times per day without actionable cause shall be tuned. | Alert noise reduction | Alert audit (monthly) |
| NFR-REL-086 | A **status page** (e.g., using Atlassian Statuspage, Instatus, or a custom solution) shall display current system status, active incidents, and historical uptime for users. | Public status page operational | Status page availability |

---

## 11. Process Management and Auto-Recovery

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-090 | All application processes shall be managed by a **process supervisor** (Docker restart policies, systemd, or PM2) that automatically restarts crashed processes within 10 seconds. | Auto-restart within 10 seconds | Process crash test |
| NFR-REL-091 | Docker containers shall use **restart policy `unless-stopped`** or `always` to ensure automatic recovery after process crashes or server reboots. | Docker restart policy configured | Docker Compose review |
| NFR-REL-092 | The NestJS application shall implement a **graceful shutdown handler** that: (a) stops accepting new requests, (b) completes in-flight requests (up to 30-second timeout), (c) closes database connections, (d) flushes logs, before terminating. | Graceful shutdown implemented | Integration test, code review |
| NFR-REL-093 | The Next.js application shall implement graceful shutdown with in-flight request completion and proper cleanup of server-side resources. | Graceful shutdown implemented | Integration test |
| NFR-REL-094 | **Out-of-memory (OOM) protection**: Node.js processes shall be configured with appropriate `--max-old-space-size` limits and Docker memory limits to prevent uncontrolled memory consumption from affecting other services. | Memory limits configured | Docker Compose review, Node.js configuration |

---

## 12. Data Integrity

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-100 | **Database transactions** shall be used for all multi-step write operations to ensure atomicity. No partial writes shall be visible to users. | Transactions on all multi-step writes | Code review |
| NFR-REL-101 | **Referential integrity** shall be enforced at the database level using foreign key constraints. Application-level deletes shall use soft-delete (setting a `deleted_at` timestamp) rather than hard-delete for user-generated content. | Foreign keys enforced, soft-delete pattern | Database schema review |
| NFR-REL-102 | **Optimistic locking** (using a `version` or `updated_at` column) shall be implemented for content editing to prevent lost updates when multiple users edit the same resource simultaneously. | Optimistic locking on content entities | Code review, integration test |
| NFR-REL-103 | **Idempotency keys** shall be supported for critical write operations (e.g., payment processing, order creation) to prevent duplicate processing from retry logic or network issues. | Idempotency key support | API design review, integration test |

---

## 13. Incident Response Procedures

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-110 | An **Incident Response Plan (IRP)** shall be documented and maintained, defining: | IRP document maintained | Document review |
| | - Incident severity levels (SEV-1: total outage, SEV-2: major degradation, SEV-3: minor issue, SEV-4: cosmetic/low impact) | | |
| | - Response time expectations per severity level | | |
| | - Escalation paths and on-call responsibilities | | |
| | - Communication templates for internal and external stakeholders | | |
| NFR-REL-111 | **Incident response times** shall meet the following targets: | Response time targets | Incident log |

| Severity | Detection | Acknowledgment | Resolution Target |
|----------|-----------|----------------|-------------------|
| SEV-1 (Total outage) | < 5 min (automated) | < 15 min | < 1 hour |
| SEV-2 (Major degradation) | < 10 min (automated) | < 30 min | < 4 hours |
| SEV-3 (Minor issue) | < 1 hour | < 4 hours | < 24 hours |
| SEV-4 (Low impact) | Next business day | Next business day | Next sprint |

| NFR-REL-112 | **Post-incident reviews** (blameless postmortems) shall be conducted within 48 hours for all SEV-1 and SEV-2 incidents, documenting: root cause, timeline, impact, resolution, and preventive action items. | Postmortem within 48 hours for SEV-1/2 | Postmortem document |
| NFR-REL-113 | **Action items** from post-incident reviews shall be tracked in the project backlog and prioritized for the next sprint. Preventive measures for SEV-1 incidents shall be implemented within 14 days. | Action items tracked and prioritized | Backlog review |
| NFR-REL-114 | An **on-call rotation** shall be established with at least 2 team members capable of responding to SEV-1 and SEV-2 incidents outside business hours. | On-call rotation defined | Schedule review |
| NFR-REL-115 | **Runbooks** shall be maintained for common incident scenarios (database recovery, service restart, CDN purge, rollback deployment) with step-by-step instructions executable by any on-call team member. | Runbooks for common scenarios | Runbook review |

---

## 14. Deployment Reliability

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-REL-120 | **Zero-downtime deployments** shall be achieved using rolling restarts or blue-green deployment patterns. Users shall not experience errors or downtime during routine deployments. | Zero downtime during deployment | Deployment monitoring |
| NFR-REL-121 | **Rollback capability**: every deployment shall be reversible within 5 minutes by redeploying the previous version. The previous 3 deployment artifacts shall be retained. | 5-minute rollback, 3 versions retained | Rollback test |
| NFR-REL-122 | **Database migrations** shall be backward-compatible (expand-contract pattern) to support rollback without data loss. Destructive schema changes shall be deferred to a separate migration after the new code is stable. | Backward-compatible migrations | Migration review |
| NFR-REL-123 | **Deployment smoke tests** shall run automatically after each deployment, verifying health endpoints, critical page loads, and API availability before marking the deployment as successful. | Automated post-deploy smoke tests | CI/CD pipeline configuration |
| NFR-REL-124 | **Feature flags** shall be used for major new features to enable gradual rollout and instant rollback without redeployment. | Feature flag system operational | Code review, feature flag dashboard |

---

## 15. Acceptance Criteria Summary

All requirements in this document are considered **met** when:

1. Uptime monitoring confirms 99.5% availability over 30 consecutive days.
2. Automated daily database backups complete successfully for 14 consecutive days with verified integrity.
3. A disaster recovery drill achieves recovery within the 4-hour RTO target with data loss within the 1-hour RPO target.
4. Health check endpoints respond correctly and uptime monitoring alerts trigger within defined thresholds.
5. Fault injection tests confirm graceful degradation for each dependency failure scenario.
6. Circuit breakers and retry logic are verified through integration tests.
7. All monitoring alerts are configured and tested (at least one test firing per alert rule).
8. Incident response plan is documented, reviewed, and a tabletop exercise has been conducted.
9. Zero-downtime deployment is demonstrated with a rollback completing within 5 minutes.

---

## 16. References

- [PostgreSQL Backup and Recovery](https://www.postgresql.org/docs/current/backup.html)
- [Hetzner Cloud Snapshots](https://docs.hetzner.com/cloud/servers/getting-started/taking-snapshots/)
- [Circuit Breaker Pattern (Martin Fowler)](https://martinfowler.com/bliki/CircuitBreaker.html)
- [NestJS Health Checks (Terminus)](https://docs.nestjs.com/recipes/terminus)
- [Cloudflare Always Online](https://developers.cloudflare.com/cache/how-to/always-online/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Incident Management Best Practices](https://sre.google/sre-book/managing-incidents/)
