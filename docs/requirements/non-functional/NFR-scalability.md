# NFR-SCA: Scalability Requirements

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Category:** Non-Functional Requirements -- Scalability
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft

---

## 1. Overview

This document defines the scalability requirements and growth strategy for the ILoveBerlin platform. The architecture is designed to scale incrementally across three stages -- from a single-server deployment suitable for launch, through server separation, to horizontal scaling. The platform runs on Hetzner VPS infrastructure with Cloudflare CDN/R2 for edge offloading, PostgreSQL for persistence, Redis for caching, and Meilisearch for full-text search.

---

## 2. Scaling Stages Overview

```
Stage 1 (Launch)          Stage 2 (Growth)           Stage 3 (Scale)
+------------------+     +------------------+       +------------------+
|  Single VPS      |     |  App Server(s)   |       |  Load Balancer   |
|  - Next.js       |     |  - Next.js       |       |       |          |
|  - NestJS        |     |  - NestJS        |       |  +----+----+     |
|  - PostgreSQL    |     |  - Redis         |       |  |    |    |     |
|  - Meilisearch   |     +------------------+       | App  App  App    |
|  - Redis         |     |  DB Server       |       +------------------+
+------------------+     |  - PostgreSQL    |       |  DB Primary      |
                          |  - Meilisearch   |       |  DB Read Replica |
                          +------------------+       |  Meilisearch     |
                                                     |  Redis Cluster   |
                                                     +------------------+
```

---

## 3. Stage 1 -- Single Server (Launch)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-001 | The platform shall launch on a **single Hetzner VPS** (minimum CPX31: 4 vCPU, 8 GB RAM, 160 GB NVMe SSD) running all services: Next.js, NestJS, PostgreSQL, Meilisearch, and Redis. | Single server operational | Server provisioning verification |
| NFR-SCA-002 | All services shall be containerized using **Docker Compose** to enable consistent deployment and simplified migration to multi-server architecture. | Docker Compose deployment | Deployment script review |
| NFR-SCA-003 | The single-server deployment shall support at least **200 concurrent users** while meeting all performance targets defined in NFR-PER. | 200 concurrent users | Load test (k6/Artillery) |
| NFR-SCA-004 | **Resource utilization thresholds** for scaling trigger: CPU sustained above 70% for 15 minutes, memory sustained above 80%, or disk usage above 75%. | Monitoring thresholds defined | Monitoring alerts |
| NFR-SCA-005 | The architecture shall be designed with **stateless application layers** from day one -- no in-memory session state, no local file storage -- to enable future horizontal scaling without refactoring. | Stateless app layer | Architecture review, code review |

---

## 4. Stage 2 -- Server Separation (Growth)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-010 | When Stage 1 capacity thresholds are consistently exceeded, the platform shall be migrated to **separate application and database servers** on Hetzner. | Separation completed within 4 hours planned maintenance | Migration runbook, execution log |
| NFR-SCA-011 | The **database server** (minimum CPX31: 4 vCPU, 8 GB RAM) shall host PostgreSQL and Meilisearch, isolated from the application workload. | Dedicated DB server | Infrastructure audit |
| NFR-SCA-012 | The **application server** (minimum CPX21: 3 vCPU, 4 GB RAM) shall host Next.js, NestJS, and Redis. | Dedicated app server | Infrastructure audit |
| NFR-SCA-013 | Communication between application and database servers shall occur over Hetzner's **private network** (vSwitch or Cloud Network) to minimize latency and avoid public internet traversal. | Private network communication | Network configuration audit, latency test (< 1 ms) |
| NFR-SCA-014 | The separated architecture shall support at least **500 concurrent users** while meeting all performance targets. | 500 concurrent users | Load test |
| NFR-SCA-015 | **Database connection limits** shall be reconfigured for the dedicated server, allowing up to 200 connections with appropriate shared_buffers and work_mem tuning. | PostgreSQL tuned for dedicated hardware | PostgreSQL configuration review |

---

## 5. Stage 3 -- Horizontal Scaling (Scale)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-020 | When Stage 2 capacity is exceeded, the platform shall scale horizontally by deploying **multiple application server instances** behind a load balancer. | Horizontal scaling operational | Infrastructure audit |
| NFR-SCA-021 | A **load balancer** (Hetzner Load Balancer or HAProxy/Nginx on a dedicated VPS) shall distribute traffic across application instances using least-connections or round-robin algorithm. | Load balancer operational | Health check verification, traffic distribution test |
| NFR-SCA-022 | The load balancer shall perform **health checks** against each application instance at 10-second intervals and remove unhealthy instances from the pool within 30 seconds. | Health check interval = 10 s, removal < 30 s | Health check configuration, failover test |
| NFR-SCA-023 | The platform shall support a minimum of **3 application server instances** running simultaneously without conflicts, race conditions, or data inconsistency. | 3+ instances conflict-free | Integration test with multiple instances |
| NFR-SCA-024 | A **PostgreSQL read replica** shall be deployed to offload read-heavy queries (listings, search, content retrieval) from the primary database. | Read replica operational, read queries offloaded | Database replication monitoring, query routing verification |
| NFR-SCA-025 | The horizontally scaled architecture shall support at least **2,000 concurrent users** while meeting all performance targets. | 2,000 concurrent users | Load test |
| NFR-SCA-026 | **Auto-scaling** readiness: the architecture shall support programmatic provisioning of new application instances within 5 minutes, either through infrastructure-as-code (Terraform/Pulumi) or container orchestration. | New instance provisioned in < 5 min | Provisioning test |

---

## 6. Connection Pooling

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-030 | **PgBouncer** shall be deployed as a connection pooler between the application layer and PostgreSQL, using **transaction-level pooling**. | PgBouncer operational, transaction mode | Configuration review |
| NFR-SCA-031 | PgBouncer shall maintain a **pool size** of 20 server connections per database (adjustable), supporting up to 200 client connections per application instance. | 20 server / 200 client connections | PgBouncer configuration, `SHOW POOLS` |
| NFR-SCA-032 | **Connection wait time** (time a client waits for an available connection) shall not exceed 100 milliseconds at the 95th percentile. | p95 wait < 100 ms | PgBouncer logs, monitoring |
| NFR-SCA-033 | PgBouncer shall be configured with **server_idle_timeout** to reclaim idle connections after 600 seconds. | Idle timeout = 600 s | Configuration review |
| NFR-SCA-034 | Application database connections shall be configured to go through PgBouncer exclusively; **direct connections to PostgreSQL from the application layer are prohibited** in production. | Zero direct connections | Network audit, connection monitoring |

---

## 7. Redis Caching Strategy

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-040 | **Redis** shall be deployed as a caching layer for frequently accessed data, session-adjacent data (rate limit counters), and as a message broker for background job queues (e.g., BullMQ). | Redis operational for caching, rate limiting, queues | Infrastructure audit |
| NFR-SCA-041 | The following data categories shall be cached in Redis with specified TTLs: | See sub-items | Cache configuration review |
| | - Navigation/menu data: TTL = 3600 seconds (1 hour) | | |
| | - Content listings (paginated): TTL = 300 seconds (5 minutes) | | |
| | - Individual content items: TTL = 600 seconds (10 minutes) | | |
| | - User profile data: TTL = 300 seconds (5 minutes) | | |
| | - Search facet/filter options: TTL = 1800 seconds (30 minutes) | | |
| NFR-SCA-042 | **Cache invalidation** shall be event-driven: when content is created, updated, or deleted, the corresponding cache keys shall be invalidated immediately via pub/sub or direct deletion. | Stale cache cleared within 5 seconds of mutation | Integration test |
| NFR-SCA-043 | **Cache hit ratio** for Redis-cached content shall be at least 80% under normal traffic patterns. | Hit ratio >= 80% | Redis INFO stats, monitoring dashboard |
| NFR-SCA-044 | Redis **memory usage** shall be monitored with an eviction policy of `allkeys-lru` and a maximum memory limit appropriate to the server (e.g., 1 GB in Stage 1, scaling as needed). | Max memory configured, LRU eviction | Redis configuration, memory monitoring |
| NFR-SCA-045 | In Stage 3 (horizontal scaling), Redis shall be deployed as a **shared instance** accessible by all application instances, or as a Redis Cluster for high availability. | Shared Redis across app instances | Architecture review |

---

## 8. CDN Offloading

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-050 | **Cloudflare CDN** shall serve all static assets (JavaScript bundles, CSS, fonts, images) from edge locations, offloading at least 80% of total bandwidth from the origin server. | >= 80% bandwidth offloaded | Cloudflare analytics |
| NFR-SCA-051 | **Cloudflare R2** shall be used for all user-uploaded media storage, eliminating local disk I/O for media serving entirely. | Zero local media storage | Architecture review |
| NFR-SCA-052 | **ISR (Incremental Static Regeneration)** pages shall be served from the CDN edge with `stale-while-revalidate` semantics, reducing origin requests for content pages by at least 70%. | >= 70% origin request reduction for content pages | Cloudflare analytics, origin server request logs |
| NFR-SCA-053 | **Cloudflare Workers** may be used for edge-side logic (A/B testing, geolocation-based content, redirect handling) to further reduce origin load. | Workers deployed as needed | Cloudflare Workers dashboard |

---

## 9. Database Scaling Strategy

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-060 | **Database indexing strategy** shall be defined and maintained: all columns used in WHERE, JOIN, and ORDER BY clauses on tables exceeding 10,000 rows shall have appropriate indexes (B-tree, GIN, or GiST as applicable). | Indexes on all hot-path query columns | `EXPLAIN ANALYZE` review, `pg_stat_user_indexes` |
| NFR-SCA-061 | **Composite indexes** shall be created for common multi-column query patterns (e.g., `(category_id, created_at DESC)` for listing pages). | Composite indexes for top 10 query patterns | Query analysis, index review |
| NFR-SCA-062 | **Partial indexes** shall be used where applicable (e.g., `WHERE status = 'published'` for content queries) to reduce index size and improve performance. | Partial indexes for filtered queries | Index review |
| NFR-SCA-063 | **Table partitioning** shall be planned for tables expected to exceed 1 million rows (e.g., analytics events, audit logs) using PostgreSQL native partitioning by date range. | Partitioning plan for large tables | Schema review |
| NFR-SCA-064 | **VACUUM and ANALYZE** shall be configured with appropriate autovacuum settings to prevent table bloat and maintain query planner statistics. | Autovacuum tuned | PostgreSQL configuration review |
| NFR-SCA-065 | **Slow query logging** shall be enabled for queries exceeding 200 milliseconds, with weekly review and optimization of the top 10 slowest queries. | Slow query threshold = 200 ms, weekly review | PostgreSQL log configuration, review log |

---

## 10. Search Index Scaling (Meilisearch)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-070 | Meilisearch shall be configured with sufficient **memory** to hold the entire searchable index in RAM for optimal query performance (minimum 2 GB allocated in Stage 1). | 2 GB minimum allocation | Meilisearch configuration |
| NFR-SCA-071 | The search index shall support **up to 100,000 documents** in Stage 1 without degradation. In Stage 3, the index shall scale to 500,000 documents. | Stage 1: 100K, Stage 3: 500K | Load test with representative data |
| NFR-SCA-072 | **Index updates** shall be processed asynchronously via a background job queue (BullMQ on Redis) to prevent blocking API responses during content ingestion. | Async index updates | Architecture review, queue monitoring |
| NFR-SCA-073 | In Stage 3, if a single Meilisearch instance becomes a bottleneck, a **dedicated Meilisearch server** shall be provisioned with sufficient resources. | Dedicated search server when needed | Monitoring, scaling trigger |

---

## 11. Media Storage Scaling (Cloudflare R2)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-080 | All user-uploaded media shall be stored in **Cloudflare R2**, which scales automatically with no provisioned capacity limits. | 100% media on R2 | Architecture review |
| NFR-SCA-081 | Media uploads shall be organized in a **structured key hierarchy** (e.g., `media/{content_type}/{year}/{month}/{uuid}.{ext}`) to facilitate management and lifecycle policies. | Structured key scheme | R2 bucket inspection |
| NFR-SCA-082 | **Lifecycle policies** shall be configured to move or delete orphaned media (media not referenced by any content) after 90 days. | 90-day orphan cleanup | R2 lifecycle configuration |
| NFR-SCA-083 | R2 storage costs shall be monitored with alerts when monthly storage exceeds projected thresholds (e.g., 50 GB in Stage 1, 500 GB in Stage 2, 2 TB in Stage 3). | Storage cost alerts configured | Cloudflare billing alerts |

---

## 12. Capacity Planning

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SCA-090 | **Monthly capacity reviews** shall assess current resource utilization against scaling thresholds and project growth trends. | Monthly review conducted | Review meeting notes |
| NFR-SCA-091 | **Scaling triggers** shall be documented and automated where possible: | See sub-items | Monitoring alert configuration |
| | - CPU > 70% sustained for 15 min --> investigate, plan Stage N+1 | | |
| | - Memory > 80% --> immediate investigation | | |
| | - Disk > 75% --> storage expansion or cleanup | | |
| | - p95 response time > 1 s --> performance investigation | | |
| | - Connection pool > 80% utilization --> pool expansion or Stage N+1 | | |
| NFR-SCA-092 | **Cost projections** shall be maintained for each scaling stage with estimated monthly costs for Hetzner VPS, Cloudflare services, and any third-party tools. | Cost projection document | Budget review |
| NFR-SCA-093 | **Migration runbooks** shall be prepared for each stage transition (Stage 1 to 2, Stage 2 to 3) with step-by-step procedures, rollback plans, and estimated downtime. | Runbooks completed before reaching 70% of current stage capacity | Runbook review |

---

## 13. Acceptance Criteria Summary

All requirements in this document are considered **met** when:

1. Stage 1 deployment passes a 200-concurrent-user load test meeting all NFR-PER targets.
2. Docker Compose configuration enables clean separation of services for Stage 2 migration.
3. PgBouncer is operational with transaction-level pooling and connection wait times under target.
4. Redis caching achieves an 80%+ hit ratio under production traffic patterns.
5. Cloudflare CDN offloads at least 80% of static asset bandwidth.
6. Database indexing strategy is documented and all hot-path queries use indexes.
7. Migration runbooks for Stage 2 and Stage 3 are reviewed and tested in staging.

---

## 14. References

- [Hetzner Cloud VPS Plans](https://www.hetzner.com/cloud)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Meilisearch Scaling Guide](https://docs.meilisearch.com/)
- [PostgreSQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)
