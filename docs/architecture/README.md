# ILoveBerlin Platform - Architecture Documentation

**Platform:** [iloveberlin.biz](https://iloveberlin.biz)
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Overview

ILoveBerlin is a comprehensive Berlin-focused content and commerce platform serving residents, expats, and visitors with articles, city guides, events, dining recommendations, video content, competitions, classifieds, and an online store. The platform is delivered through a responsive web application and native mobile apps for iOS and Android.

## Tech Stack Summary

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Frontend (Web)   | Next.js 14+ (App Router)           |
| Backend (API)    | NestJS 10+                         |
| Mobile           | Flutter 3+                         |
| Database         | PostgreSQL 16                      |
| Search Engine    | Meilisearch                        |
| Cache            | Redis 7                            |
| Object Storage   | Cloudflare R2                      |
| CDN / DNS / WAF  | Cloudflare                         |
| Hosting          | Hetzner VPS                        |
| Reverse Proxy    | Nginx                              |
| Containerization | Docker / Docker Compose            |
| Monitoring       | Prometheus + Grafana                |
| CI/CD            | GitHub Actions                     |

## Documentation Index

| # | Document | Description |
|---|----------|-------------|
| 1 | [System Architecture](system-architecture.md) | High-level system architecture, request flow, component diagram, service communication patterns, and environment overview. |
| 2 | [Backend Module Architecture](backend-module-architecture.md) | NestJS module structure, module dependencies, shared modules, middleware pipeline, interceptors, exception filters, and the TypeORM repository pattern. |
| 3 | [Frontend Architecture](frontend-architecture.md) | Next.js App Router structure, rendering strategies (SSR, SSG, ISR), component hierarchy, state management, API client layer, SEO strategy, and Tailwind CSS setup. |
| 4 | [Mobile Architecture](mobile-architecture.md) | Flutter clean architecture layers, state management with BLoC/Riverpod, HTTP client, secure storage, deep linking, push notifications, offline support, and navigation. |
| 5 | [Data Flow Diagrams](data-flow-diagrams.md) | ASCII data flow diagrams for authentication, article publishing, event submission, classified listings, store checkout, media upload, and search indexing. |
| 6 | [Infrastructure Architecture](infrastructure-architecture.md) | Hetzner server layout, Docker Compose services, Nginx configuration, Cloudflare setup, network topology, and environment differences. |
| 7 | [Search Architecture](search-architecture.md) | Meilisearch setup, index definitions, ranking rules, filterable/sortable attributes, synonyms, stop words, indexing pipeline, and autocomplete. |
| 8 | [Media Pipeline](media-pipeline.md) | Upload flow with presigned URLs, image processing pipeline, supported formats, R2 storage structure, CDN delivery, metadata tracking, and orphan cleanup. |
| 9 | [Caching Strategy](caching-strategy.md) | CDN cache rules, API response headers, Redis caching layer, ISR revalidation intervals, browser cache policy, and cache invalidation strategy. |

## Architecture Principles

1. **Separation of Concerns** - Clear boundaries between frontend, backend, and infrastructure layers.
2. **Module Isolation** - Each NestJS backend module is self-contained with its own controllers, services, entities, and DTOs.
3. **API-First Design** - The REST API is the single source of truth, consumed by both web and mobile clients.
4. **Cache at Every Layer** - CDN, reverse proxy, application-level Redis, and client-side caching all work together.
5. **Search as a First-Class Feature** - Meilisearch provides sub-50ms full-text search across all content types.
6. **Infrastructure as Code** - All services are containerized and reproducible via Docker Compose.
7. **Progressive Enhancement** - The web app works without JavaScript for core content, with JavaScript enhancing interactivity.
8. **Security by Default** - Cloudflare WAF, rate limiting, JWT authentication, role-based access control, and input validation at every boundary.

## Quick Reference - Port Allocation

| Service          | Internal Port | External Port |
| ---------------- | ------------- | ------------- |
| Next.js          | 3000          | —             |
| NestJS API       | 4000          | —             |
| PostgreSQL       | 5432          | —             |
| Redis            | 6379          | —             |
| Meilisearch      | 7700          | —             |
| Nginx            | 80 / 443      | 80 / 443      |
| Prometheus       | 9090          | —             |
| Grafana          | 3100          | —             |

## Contact

For questions about this architecture, contact the ILoveBerlin engineering team.
