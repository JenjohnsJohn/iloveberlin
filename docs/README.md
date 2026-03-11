# ILoveBerlin Platform Documentation

**Website:** [iloveberlin.biz](https://iloveberlin.biz)

ILoveBerlin is the digital lifestyle hub for Berlin, combining city media, event discovery, restaurant discovery, community storytelling, a local marketplace, classifieds, competitions, and video storytelling into a single platform. This documentation repository contains all technical and product documentation for the platform.

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Tech Stack Summary](#tech-stack-summary)
- [Platform Sections](#platform-sections)
- [Documentation Structure](#documentation-structure)
  - [Requirements](#requirements)
  - [Architecture](#architecture)
  - [API](#api)
  - [Database](#database)
  - [Deployment](#deployment)
  - [Design System](#design-system)
  - [Testing](#testing)
  - [Guides](#guides)
  - [Planning](#planning)
- [Key Reference Documents](#key-reference-documents)
- [Getting Started](#getting-started)

---

## Platform Overview

ILoveBerlin serves five primary audiences:

| Audience      | Description                                              |
|---------------|----------------------------------------------------------|
| **Residents** | Berliners looking for lifestyle information, events, and dining |
| **Visitors**  | Tourists planning trips and exploring the city           |
| **Students**  | International students and newcomers settling in Berlin  |
| **Businesses**| Local brands, restaurants, and event organizers           |
| **Creators**  | Influencers, storytellers, and videographers              |

The platform is built on seven core pillars:

1. **City Media** -- Articles, news, and editorial content covering Berlin life
2. **Berlin Guide** -- Educational hub for residents and visitors covering living, transport, culture, and more
3. **Events Discovery** -- Central event discovery with filtering by category, date, and location
4. **Dining Discovery** -- Restaurant reviews, food news, special offers, and chef interviews
5. **Video Storytelling** -- Short-form lifestyle video content (Berlin tips, restaurant visits, hidden spots)
6. **Community Marketplace** -- Classifieds and local store for goods, services, and experiences
7. **Competitions & Promotions** -- Giveaways and brand promotions driving engagement

---

## Tech Stack Summary

| Layer              | Technology       | Purpose                                      |
|--------------------|------------------|----------------------------------------------|
| Frontend           | Next.js          | SSR/SSG website with strong SEO performance  |
| Backend API        | NestJS           | Modular, TypeScript-based REST API           |
| Mobile App         | Flutter          | Cross-platform iOS and Android application   |
| Database           | PostgreSQL       | Primary relational data store                |
| Search Engine      | Meilisearch      | Fast full-text search across all content     |
| Hosting            | Hetzner VPS      | Application and database servers             |
| CDN & Security     | Cloudflare       | Edge caching, DDoS protection, SSL           |
| Media Storage      | Cloudflare R2    | Scalable object storage for images and media |
| Containerization   | Docker           | Service isolation and reproducible deploys   |
| Reverse Proxy      | Nginx            | Request routing, SSL termination, caching    |
| Monitoring         | Grafana/Prometheus | System health, metrics, and alerting       |
| Email              | Brevo/Mailchimp  | Transactional email and newsletters          |
| Push Notifications | Firebase (FCM)   | Mobile push notifications                    |

---

## Platform Sections

The platform consists of nine main sections, each serving a distinct function:

| Section          | Description                                                        |
|------------------|--------------------------------------------------------------------|
| **Home**         | Hero stories, trending content, featured events, dining highlights, latest videos, and community stories |
| **News**         | Digital Berlin magazine with categories: General, Entertainment, Arts & Culture, Community, Business, Sports, Travel, Health & Wellness, Education, Technology, Things to Do |
| **Berlin Guide** | Educational guides on living in Berlin, transportation, laws, culture, visiting, work & business, places to see, and notable people |
| **Events**       | Event discovery by category (Entertainment, Sports, Food & Dining, Arts & Culture, Nightlife, Community, Education, Volunteer) with date and location filtering |
| **Videos**       | Short-form video series including BTips, Dine Out Berlin, Made in Berlin, 2 Minutes With, and Weekend Roundup |
| **Dining**       | Restaurant reviews, foodie news, special offers, chef interviews, and food festival coverage |
| **Competitions** | Giveaways and promotions (restaurant vouchers, event tickets, brand prizes) |
| **Classifieds**  | Local marketplace for Vehicles, Services, Property, Electronics, Furniture, and Jobs |
| **Store**        | Curated Berlin merchandise, souvenirs, tickets, experiences, and digital guides |

---

## Documentation Structure

All documentation is organized into the following subdirectories:

### Requirements

**Path:** [`docs/requirements/`](requirements/)

Product and system requirements for the ILoveBerlin platform, organized into three categories.

| Subdirectory                                       | Contents                                              |
|----------------------------------------------------|-------------------------------------------------------|
| [`requirements/functional/`](requirements/functional/) | Functional requirements for each platform module      |
| [`requirements/non-functional/`](requirements/non-functional/) | Performance, security, scalability, and accessibility requirements |
| [`requirements/user-stories/`](requirements/user-stories/) | User stories organized by persona and platform section |

See the [Requirements README](requirements/README.md) for full details.

---

### Architecture

**Path:** [`docs/architecture/`](architecture/)

System architecture documentation including high-level design, component diagrams, and architectural decision records.

| Subdirectory                                                   | Contents                                           |
|----------------------------------------------------------------|----------------------------------------------------|
| [`architecture/decision-records/`](architecture/decision-records/) | Architecture Decision Records (ADRs) documenting key technical choices |

Key topics covered:

- High-level system architecture (Cloudflare -> Hetzner VPS -> services)
- Frontend architecture (Next.js SSR/SSG strategy)
- Backend architecture (NestJS module structure)
- Mobile architecture (Flutter app structure)
- Search engine design (Meilisearch integration)
- Media storage pipeline (upload -> R2 -> CDN delivery)
- Authentication system design (email, Google, Apple sign-in)

---

### API

**Path:** [`docs/api/`](api/)

API reference documentation for the NestJS backend. Covers all REST endpoints consumed by the Next.js frontend and the Flutter mobile application.

Backend modules documented:

| Module       | Responsibility                          |
|--------------|-----------------------------------------|
| Auth         | Registration, login, password recovery, social login |
| User         | User profiles and preferences           |
| Article      | News articles and editorial content     |
| Guide        | Berlin Guide content management         |
| Event        | Event listings, filtering, and discovery |
| Dining       | Restaurant listings, reviews, and offers |
| Video        | Video content and series management     |
| Competition  | Competition entries and winner selection |
| Classified   | Classified ad listings and moderation   |
| Store        | Product catalog and order management    |
| Search       | Cross-module search via Meilisearch     |
| Media        | Image and media upload to Cloudflare R2 |
| Admin        | CMS operations and platform management |

---

### Database

**Path:** [`docs/database/`](database/)

PostgreSQL database design documentation including entity-relationship diagrams, table definitions, indexing strategy, and migration procedures.

Core tables: Users, Articles, Guides, Events, Restaurants, DiningOffers, Videos, Competitions, ClassifiedListings, Businesses, Products, Tags, Locations.

---

### Deployment

**Path:** [`docs/deployment/`](deployment/)

Infrastructure and deployment documentation covering:

- Hetzner VPS server provisioning and configuration
- Docker container layout (Nginx, Next.js, NestJS, Meilisearch, PostgreSQL)
- Cloudflare CDN and DNS configuration
- Cloudflare R2 media storage setup
- CI/CD pipeline (build -> test -> deploy)
- Zero-downtime deployment strategy
- Backup strategy (daily database backups, weekly full snapshots)
- Scaling roadmap (single server -> separated services -> load-balanced cluster)

---

### Design System

**Path:** [`docs/design-system/`](design-system/)

UI/UX design system documentation including:

- Brand guidelines and visual identity
- Color palette, typography, and spacing scales
- Component library specifications
- Responsive design breakpoints
- Accessibility standards

---

### Testing

**Path:** [`docs/testing/`](testing/)

Testing strategy and documentation covering:

- Unit testing (backend modules, frontend components)
- Integration testing (API endpoints, database operations)
- End-to-end testing (critical user flows)
- Performance and load testing
- Mobile app testing (Flutter integration tests)

---

### Guides

**Path:** [`docs/guides/`](guides/)

Developer guides and onboarding documentation:

- Local development environment setup
- Coding standards and conventions
- Git workflow and branching strategy
- Code review process
- Contribution guidelines

---

### Planning

**Path:** [`docs/planning/`](planning/)

Project planning and sprint management.

| Subdirectory                                         | Contents                              |
|------------------------------------------------------|---------------------------------------|
| [`planning/sprint-plans/`](planning/sprint-plans/)   | Individual sprint plans and retrospectives |

Covers roadmap, milestones, and sprint-level planning for the platform build-out.

---

## Key Reference Documents

The following documents at the project root provide foundational context for all platform work:

| Document | Path | Description |
|----------|------|-------------|
| Platform Blueprint | [`iloveberlin_complete_platform_blueprint.md`](../iloveberlin_complete_platform_blueprint.md) | Complete platform vision, scope, structure, growth strategy, and revenue model |
| Technical Architecture | [`iloveberlin_technical_architecture.md`](../iloveberlin_technical_architecture.md) | Technology stack decisions, infrastructure design, security, scaling, and deployment strategy |

---

## Getting Started

### For Product Team Members

1. Start with the [Platform Blueprint](../iloveberlin_complete_platform_blueprint.md) for the full product vision
2. Review the [Requirements README](requirements/README.md) for detailed functional and non-functional requirements
3. Explore [user stories](requirements/user-stories/) for specific feature definitions

### For Developers

1. Read the [Technical Architecture](../iloveberlin_technical_architecture.md) for system design context
2. Review [Architecture](architecture/) documentation and [decision records](architecture/decision-records/) for key technical choices
3. Set up your local environment using the [developer guides](guides/)
4. Consult the [API documentation](api/) for endpoint specifications
5. Review the [Database documentation](database/) for schema details

### For DevOps / Infrastructure

1. Start with the [Technical Architecture](../iloveberlin_technical_architecture.md) for infrastructure overview
2. Review the [Deployment documentation](deployment/) for server setup and CI/CD
3. Consult the scaling roadmap in the deployment docs for capacity planning

---

## Content and Revenue Strategy

For reference, the platform targets the following content velocity and revenue model:

**Content Targets:**

| Content Type | Volume Target         |
|--------------|-----------------------|
| Articles     | 20--30 per week       |
| Videos       | 10--20 per month      |
| Events       | 200+ listings monthly |

**Revenue Streams:**

- Display advertising (homepage banners, category banners, article placements)
- Sponsored content (restaurant features, brand stories, startup interviews)
- Event promotion (featured placement, homepage exposure)
- Restaurant promotion (special offers, featured listings)
- Classified upgrades (premium job and property listings)
- Marketplace sales (merchandise, tickets, experiences)
- Brand partnerships (tourism boards, local brands, event organizers)

---

## Editorial Workflow

Content follows a structured publishing pipeline:

```
Idea -> Draft -> Edit -> Approval -> Publish -> Promotion
```

Roles: Writer, Editor, Contributor, Video Creator

---

*This documentation is maintained alongside the ILoveBerlin platform codebase. For questions or contributions, consult the [developer guides](guides/).*
