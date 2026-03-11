# ILoveBerlin Platform - Dependency Map

**Project:** ILoveBerlin (iloveberlin.biz)
**Last Updated:** 2026-03-12

---

## 1. Inter-Sprint Dependencies

This section maps which sprints depend on the completion (or partial completion) of other sprints. Dependencies are categorized as:

- **Hard dependency (BLOCKS):** The dependent sprint cannot start without this sprint being complete.
- **Soft dependency (NEEDS):** The dependent sprint can start but requires certain outputs from the dependency sprint to finish.

### Dependency Matrix

```
Legend:  ██ = Hard dependency (BLOCKS)    ░░ = Soft dependency (NEEDS)    ·· = No dependency

Depends on →   S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12 S13 S14 S15 S16 S17 S18 S19 S20 S21 S22 S23 S24 S25 S26 S27
Sprint ↓
S1  Infra       --
S2  Auth        ██  --
S3  Users       ██  ██  --
S4  Articles    ██  ░░  ░░  --
S5  Media       ██  ░░  ··  ░░  --
S6  Guides      ██  ░░  ··  ██  ██  --
S7  Events      ██  ░░  ··  ██  ██  ··  --
S8  Dining      ██  ░░  ██  ██  ██  ··  ··  --
S9  Video       ██  ░░  ··  ░░  ██  ··  ··  ··  --
S10 Compet.     ██  ██  ██  ··  ··  ··  ··  ··  ··  --
S11 CMS         ██  ░░  ··  ██  ██  ░░  ░░  ░░  ░░  ··  --
S12 Homepage    ██  ░░  ··  ██  ██  ██  ██  ██  ██  ░░  ██  --
S13 Classif.    ██  ██  ██  ░░  ██  ··  ··  ··  ··  ··  ··  ··  --
S14 Store       ██  ██  ██  ··  ██  ··  ··  ··  ··  ··  ··  ··  ··  --
S15 Search      ██  ··  ··  ██  ··  ██  ██  ██  ██  ··  ··  ░░  ██  ██  --
S16 Admin       ██  ██  ██  ██  ██  ░░  ░░  ░░  ░░  ░░  ██  ··  ░░  ░░  ··  --
S17 Ads         ██  ░░  ··  ██  ██  ··  ··  ··  ··  ··  ··  ██  ··  ··  ··  ░░  --
S18 SEO         ██  ··  ··  ██  ··  ██  ██  ██  ██  ··  ··  ██  ██  ██  ██  ··  ··  --
S19 API         ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ··  ··  ██  ██  ██  ··  ··  ··  --
S20 App Core    ██  ██  ██  ░░  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ██  --
S21 App Feat.   ██  ··  ··  ··  ··  ██  ██  ██  ██  ░░  ··  ··  ··  ··  ░░  ··  ··  ··  ██  ██  --
S22 Push        ██  ██  ██  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ██  ░░  --
S23 Email       ██  ██  ██  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  --
S24 Monitor.    ██  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ░░  ··  ░░  ░░  --
S25 Security    ██  ██  ██  ░░  ░░  ··  ··  ··  ··  ··  ··  ··  ··  ██  ··  ██  ··  ··  ██  ██  ██  ██  ░░  ██  --
S26 Beta        ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ██  ██  --
S27 Launch Pr.  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ██  ··  ··  ██  ··  ··  ··  ··  ██  --
S28 Go-Live     ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ··  ██  ██  ██
```

### Detailed Dependency Descriptions

#### Phase 1 Internal Dependencies

| Dependent Sprint | Depends On | Type | Reason |
|-----------------|------------|------|--------|
| S2 (Auth) | S1 (Infra) | BLOCKS | Auth service requires deployed infrastructure, database, and CI/CD pipeline |
| S3 (Users) | S1 (Infra) | BLOCKS | User service requires database and deployment infrastructure |
| S3 (Users) | S2 (Auth) | BLOCKS | User profiles require authentication; profile pages need auth middleware |
| S4 (Articles) | S1 (Infra) | BLOCKS | Content engine requires database and deployment |
| S4 (Articles) | S2 (Auth) | NEEDS | Author attribution needs auth; CRUD endpoints need auth middleware |
| S4 (Articles) | S3 (Users) | NEEDS | Author profile linkage; user role determines editing permissions |
| S5 (Media) | S1 (Infra) | BLOCKS | Media storage requires infrastructure (object storage, CDN) |
| S5 (Media) | S2 (Auth) | NEEDS | Media management endpoints need auth |
| S5 (Media) | S4 (Articles) | NEEDS | Media library is used within article editor; integration needed |

#### Phase 1 -> Phase 2 Dependencies

| Dependent Sprint | Depends On | Type | Reason |
|-----------------|------------|------|--------|
| S6 (Guides) | S4 (Articles) | BLOCKS | Guides extend the article content model |
| S6 (Guides) | S5 (Media) | BLOCKS | Guides require photo galleries and media embedding |
| S7 (Events) | S4 (Articles) | BLOCKS | Events share the content model pattern (rich text, categories, images) |
| S7 (Events) | S5 (Media) | BLOCKS | Events need image uploads for event posters |
| S8 (Dining) | S3 (Users) | BLOCKS | Reviews require authenticated users; rating system tied to user accounts |
| S8 (Dining) | S4 (Articles) | BLOCKS | Dining listings use content model patterns |
| S8 (Dining) | S5 (Media) | BLOCKS | Venue photo galleries require media library |
| S9 (Video) | S5 (Media) | BLOCKS | Video extends media library with transcoding pipeline |
| S10 (Compet.) | S2 (Auth) | BLOCKS | Competition entries require user authentication |
| S10 (Compet.) | S3 (Users) | BLOCKS | Winner selection, entry tracking tied to user accounts |

#### Phase 2 Internal Dependencies

| Dependent Sprint | Depends On | Type | Reason |
|-----------------|------------|------|--------|
| S11 (CMS) | S4 (Articles) | BLOCKS | CMS enhances the existing article/content workflow |
| S11 (CMS) | S5 (Media) | BLOCKS | Editorial workflow includes media management |
| S11 (CMS) | S6-S9 | NEEDS | CMS should support all content types; soft dependency on each vertical existing |
| S12 (Homepage) | S4-S10 | BLOCKS (S4-S9), NEEDS (S10) | Homepage aggregates all content types; needs them to exist |
| S12 (Homepage) | S11 (CMS) | BLOCKS | Homepage content curation relies on CMS features |

#### Phase 2 -> Phase 3 Dependencies

| Dependent Sprint | Depends On | Type | Reason |
|-----------------|------------|------|--------|
| S13 (Classif.) | S2 (Auth), S3 (Users) | BLOCKS | Listings require authenticated users with profiles |
| S13 (Classif.) | S5 (Media) | BLOCKS | Listing image uploads use media library |
| S14 (Store) | S2 (Auth), S3 (Users) | BLOCKS | Checkout requires user accounts; order history needs profiles |
| S14 (Store) | S5 (Media) | BLOCKS | Product images managed through media library |
| S15 (Search) | S4, S6-S9 | BLOCKS | Search indexes all content types; they must exist and have data |
| S15 (Search) | S13, S14 | BLOCKS | Search must also index classifieds and products |
| S16 (Admin) | S2, S3 | BLOCKS | Admin requires auth and user management |
| S16 (Admin) | S4, S5 | BLOCKS | Admin manages all content types and media |
| S16 (Admin) | S11 (CMS) | BLOCKS | Admin includes the editorial workflow from CMS |
| S17 (Ads) | S12 (Homepage) | BLOCKS | Ad zones are placed within the homepage and content pages |
| S17 (Ads) | S4, S5 | BLOCKS | Ads appear alongside content; ad creatives use media |
| S18 (SEO) | S4, S6-S9 | BLOCKS | SEO metadata for all content types |
| S18 (SEO) | S12 (Homepage) | BLOCKS | Homepage SEO, navigation structure |
| S18 (SEO) | S13, S14, S15 | BLOCKS | Sitemaps must include all indexable content |

#### Phase 3 -> Phase 4 Dependencies

| Dependent Sprint | Depends On | Type | Reason |
|-----------------|------------|------|--------|
| S19 (API) | S4-S10, S13-S15 | BLOCKS | Public API exposes all content types |
| S20 (App Core) | S19 (API) | BLOCKS | Mobile app consumes the public API |
| S20 (App Core) | S2 (Auth) | BLOCKS | App auth flow uses the same auth backend |
| S21 (App Feat.) | S20 (App Core) | BLOCKS | Features build on the app core scaffold |
| S21 (App Feat.) | S6-S9 | BLOCKS | App features correspond to web content verticals |
| S21 (App Feat.) | S19 (API) | BLOCKS | All features consume API endpoints |
| S22 (Push) | S20 (App Core) | BLOCKS | Push notifications require app with FCM SDK |
| S22 (Push) | S2, S3 | BLOCKS | Push targeting requires user authentication and preferences |
| S23 (Email) | S2, S3 | BLOCKS | Email campaigns require user accounts and preferences |
| S24 (Monitor.) | S1 (Infra) | BLOCKS | Monitoring instruments the existing infrastructure |

#### Phase 4 -> Phase 5 Dependencies

| Dependent Sprint | Depends On | Type | Reason |
|-----------------|------------|------|--------|
| S25 (Security) | S14 (Store) | BLOCKS | Security audit must cover payment processing |
| S25 (Security) | S16 (Admin) | BLOCKS | Security audit covers admin access controls |
| S25 (Security) | S19 (API) | BLOCKS | API security audit |
| S25 (Security) | S20-S22 | BLOCKS | Mobile app and push included in security scope |
| S25 (Security) | S24 (Monitor.) | BLOCKS | Security monitoring must be in place |
| S26 (Beta) | S24 (Monitor.) | BLOCKS | Beta requires monitoring to track issues |
| S26 (Beta) | S25 (Security) | BLOCKS | Cannot start beta without security audit passed |
| S27 (Launch Pr.) | S18 (SEO) | BLOCKS | SEO must be finalized before launch |
| S27 (Launch Pr.) | S21 (App Feat.) | BLOCKS | App must be feature-complete for store submission |
| S27 (Launch Pr.) | S26 (Beta) | BLOCKS | Beta findings must be resolved |
| S28 (Go-Live) | S25, S26, S27 | BLOCKS | Launch requires security, beta, and prep all complete |

---

## 2. External Dependencies

### Service Provider Dependencies

| Provider | Service | Used In Sprints | Criticality | Account Required By | Fallback |
|----------|---------|----------------|-------------|--------------------|---------|
| **Hetzner Cloud** | Application servers, database hosting, object storage | S1 onward | Critical | Sprint 1, Day 1 | AWS EU (Frankfurt), DigitalOcean EU |
| **Cloudflare** | CDN, DNS, DDoS protection, R2 object storage, SSL | S1 onward | Critical | Sprint 1, Day 1 | Fastly, AWS CloudFront |
| **GitHub** | Source control, CI/CD (Actions), project management | S1 onward | Critical | Pre-project | GitLab |
| **Stripe** | Payment processing, SCA, refunds, invoicing | S14 onward | Critical (for commerce) | Sprint 13 (setup) | Mollie, Adyen |
| **Google Cloud** | OAuth (Sign-In), Maps API, Analytics, Search Console | S2 (OAuth), S6 (Maps), S18 (Analytics) | High | Sprint 1 (project setup) | Auth0 (OAuth), OpenStreetMap (Maps), Plausible (Analytics) |
| **Apple** | Sign-In with Apple, App Store, TestFlight | S2 (Sign-In), S21 (TestFlight), S27 (App Store) | High | Sprint 1 (developer account) | No alternative for App Store |
| **Brevo** | Transactional email, marketing campaigns, SMTP | S2 (transactional), S23 (campaigns) | High | Sprint 1 (account + domain verification) | SendGrid, Mailgun, Amazon SES |
| **Firebase** | Cloud Messaging (FCM), Analytics (mobile) | S22 (Push), S20 (mobile analytics) | High | Sprint 20 (project setup) | OneSignal (push), self-hosted (limited) |

### External Service Setup Timeline

```
Sprint 1 (Week 1-2):
  ├── Hetzner Cloud account + servers provisioned
  ├── Cloudflare account + DNS configured
  ├── GitHub repository + Actions configured
  ├── Google Cloud project created (OAuth credentials)
  ├── Apple Developer account enrolled ($99/year)
  ├── Brevo account created + sending domain verified
  └── Domain registrar: iloveberlin.biz DNS delegation to Cloudflare

Sprint 13 (Week 25-26):
  └── Stripe account created, verified, and test mode configured

Sprint 20 (Week 39-40):
  ├── Firebase project created + apps registered
  ├── Apple App Store Connect: app ID registered
  └── Google Play Console: app listing created

Sprint 27 (Week 53-54):
  ├── Apple App Store: app submitted for review
  └── Google Play Store: app submitted for review
```

### External Service Risk Assessment

| Provider | Risk | Likelihood | Impact if Unavailable |
|----------|------|------------|----------------------|
| Hetzner | Service outage | Low | Total platform downtime |
| Cloudflare | Service outage | Very Low | CDN loss, potential direct origin exposure |
| GitHub | Service outage | Low | Development halted, no deployments |
| Stripe | API changes, account issues | Low | Store payments non-functional |
| Google | OAuth API changes, Maps pricing increase | Medium | Login flow disruption, map cost spike |
| Apple | Sign-In API changes, App Store rejection | Medium | iOS login issues, app launch delay |
| Brevo | Deliverability issues, service changes | Low | Email delivery failure |
| Firebase | FCM changes, pricing changes | Low | Push notification failure |

---

## 3. Technology Dependencies

### Core Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Next.js    │  │   Flutter    │  │   Admin Panel    │  │
│  │   (React)    │  │  (iOS/And)   │  │   (React)        │  │
│  │   Web App    │  │  Mobile App  │  │   Internal       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NestJS / Node.js Backend               │    │
│  │          (REST API + WebSocket where needed)        │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────────┐
          ▼              ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │    Redis     │  │  Search Engine   │
│  (Primary    │  │  (Cache,     │  │  (Meilisearch/   │
│   Database)  │  │   Sessions)  │  │   Elasticsearch) │
└──────────────┘  └──────────────┘  └──────────────────┘
```

### Technology Dependency Tree

| Technology | Version (Target) | Introduced In | Depends On | Used By |
|-----------|-----------------|---------------|------------|---------|
| **Node.js** | 20 LTS | S1 | OS | Backend API, build tools |
| **NestJS** | 10.x | S1 | Node.js | All backend modules |
| **TypeScript** | 5.x | S1 | Node.js | All application code |
| **PostgreSQL** | 16.x | S1 | Hetzner | All data storage |
| **Redis** | 7.x | S1 | Hetzner | Caching, sessions, rate limiting, queues |
| **Next.js** | 14.x | S1 | Node.js, React | Web frontend |
| **React** | 18.x | S1 | Node.js | Web frontend, admin panel |
| **Tailwind CSS** | 3.x | S1 | Node.js | All frontend styling |
| **Docker** | 24.x | S1 | OS | All deployments |
| **Nginx** | 1.25+ | S1 | Docker | Reverse proxy, static serving |
| **Flutter** | 3.x | S20 | Dart SDK | Mobile app |
| **Dart** | 3.x | S20 | OS | Flutter mobile app |
| **Meilisearch** | 1.x | S15 | Docker | Full-text search |
| **FFmpeg** | 6.x | S9 | OS/Docker | Video transcoding |
| **Prometheus** | 2.x | S24 | Docker | Metrics collection |
| **Grafana** | 10.x | S24 | Docker, Prometheus | Dashboards, alerting |
| **Sentry** | Latest | S24 | SaaS/Self-hosted | Error tracking |

### NPM Package Dependencies (Key Packages)

| Package | Purpose | Introduced In | Risk Level |
|---------|---------|---------------|------------|
| `@nestjs/core` | Backend framework | S1 | Low (stable, well-maintained) |
| `@nestjs/jwt` | JWT token handling | S2 | Low |
| `@nestjs/passport` | Auth strategies | S2 | Low |
| `passport-google-oauth20` | Google Sign-In | S2 | Low |
| `passport-apple` | Apple Sign-In | S2 | Medium (less mature ecosystem) |
| `typeorm` / `prisma` | Database ORM | S1 | Low |
| `sharp` | Image processing | S5 | Low |
| `stripe` | Stripe SDK | S14 | Low (official SDK) |
| `@sentry/node` | Error tracking | S24 | Low |
| `next` | Frontend framework | S1 | Low (Vercel-backed) |
| `tiptap` / `prosemirror` | Rich text editor | S4 | Medium (complex, upgrade-sensitive) |
| `meilisearch` | Search client | S15 | Medium (newer project) |
| `firebase-admin` | FCM push | S22 | Low (Google-maintained) |
| `@brevo/api` | Email sending | S2 | Medium (provider-specific) |

### Flutter Package Dependencies (Key Packages)

| Package | Purpose | Introduced In | Risk Level |
|---------|---------|---------------|------------|
| `flutter_riverpod` / `flutter_bloc` | State management | S20 | Low |
| `go_router` | Navigation / routing | S20 | Low |
| `dio` | HTTP client | S20 | Low |
| `flutter_secure_storage` | Secure token storage | S20 | Low |
| `firebase_messaging` | Push notifications | S22 | Low |
| `google_maps_flutter` | Map integration | S21 | Low |
| `video_player` | Video playback | S21 | Low |
| `cached_network_image` | Image caching | S20 | Low |

---

## 4. Data Dependencies

This section maps which modules and sprints depend on which database tables/entities. Understanding data dependencies helps with migration planning, schema design, and identifying shared data.

### Entity-Module Dependency Matrix

```
Entity →           users  roles  articles  categories  tags  media  guides  events  venues
Module ↓
Auth (S2)           ██     ██      ··        ··        ··    ··      ··      ··      ··
Users (S3)          ██     ██      ··        ··        ··    ██      ··      ··      ··
Articles (S4)       ░░     ··      ██        ██        ██    ██      ··      ··      ··
Media (S5)          ░░     ··      ··        ··        ··    ██      ··      ··      ··
Guides (S6)         ░░     ··      ░░        ██        ██    ██      ██      ··      ··
Events (S7)         ░░     ··      ··        ██        ██    ██      ··      ██      ██
Dining (S8)         ██     ··      ··        ██        ··    ██      ··      ··      ██
Video (S9)          ░░     ··      ··        ██        ██    ██      ··      ··      ··
Competitions (S10)  ██     ··      ··        ··        ··    ██      ··      ··      ··
CMS (S11)           ░░     ██      ██        ██        ██    ██      ██      ██      ··
Homepage (S12)      ··     ··      ██        ██        ··    ██      ██      ██      ··
Classifieds (S13)   ██     ··      ··        ██        ··    ██      ··      ··      ··
Store (S14)         ██     ··      ··        ██        ··    ██      ··      ··      ··
Search (S15)        ··     ··      ██        ██        ██    ··      ██      ██      ██
Admin (S16)         ██     ██      ██        ██        ██    ██      ██      ██      ██
Ads (S17)           ░░     ··      ··        ··        ··    ██      ··      ··      ··
SEO (S18)           ··     ··      ██        ██        ··    ██      ██      ██      ██
API (S19)           ██     ··      ██        ██        ██    ██      ██      ██      ██
Push (S22)          ██     ··      ··        ··        ··    ··      ··      ··      ··
Email (S23)         ██     ··      ··        ··        ··    ··      ··      ··      ··

██ = Primary dependency (module owns or heavily writes to this entity)
░░ = Secondary dependency (module reads from or lightly references this entity)
·· = No dependency
```

```
Entity →           restaurants  reviews  videos  competitions  entries  listings
Module ↓
Dining (S8)         ██           ██       ··       ··            ··       ··
Video (S9)          ··           ··       ██       ··            ··       ··
Competitions (S10)  ··           ··       ··       ██            ██       ··
Classifieds (S13)   ··           ··       ··       ··            ··       ██
Search (S15)        ██           ··       ██       ··            ··       ██
Admin (S16)         ██           ██       ██       ██            ██       ██
SEO (S18)           ██           ··       ██       ··            ··       ██
API (S19)           ██           ░░       ██       ██            ··       ██
```

```
Entity →           products  orders  cart  payments  ad_campaigns  ad_impressions  notifications  emails
Module ↓
Store (S14)         ██        ██      ██    ██        ··            ··              ··             ··
Ads (S17)           ··        ··      ··    ··        ██            ██              ··             ··
Admin (S16)         ██        ██      ··    ██        ██            ██              ··             ··
Push (S22)          ··        ··      ··    ··        ··            ··              ██             ··
Email (S23)         ··        ··      ··    ··        ··            ··              ··             ██
Search (S15)        ██        ··      ··    ··        ··            ··              ··             ··
API (S19)           ██        ░░      ··    ··        ··            ··              ··             ··
```

### Database Schema Introduction Timeline

| Sprint | New Tables / Entities Introduced |
|--------|-------------------------------|
| S1 | `migrations`, system configuration tables |
| S2 | `users`, `roles`, `user_roles`, `refresh_tokens`, `social_accounts`, `password_resets` |
| S3 | `user_profiles`, `user_preferences`, `user_avatars`, `activity_log` |
| S4 | `articles`, `categories`, `tags`, `article_tags`, `article_categories`, `article_revisions` |
| S5 | `media`, `media_folders`, `media_metadata` |
| S6 | `guides`, `neighborhoods`, `points_of_interest`, `guide_pois` |
| S7 | `events`, `venues`, `event_categories`, `recurring_event_rules` |
| S8 | `restaurants`, `cuisines`, `restaurant_cuisines`, `reviews`, `ratings` |
| S9 | `videos`, `video_playlists`, `playlist_videos`, `video_transcodes` |
| S10 | `competitions`, `competition_entries`, `prizes`, `winners` |
| S11 | `content_workflows`, `workflow_transitions`, `scheduled_publishes`, `content_versions` |
| S12 | `homepage_sections`, `featured_content`, `navigation_items` |
| S13 | `listings`, `listing_categories`, `listing_reports`, `listing_contacts` |
| S14 | `products`, `product_variants`, `cart_items`, `orders`, `order_items`, `payments`, `invoices` |
| S15 | `search_index_status`, `search_analytics`, `popular_queries` |
| S16 | `admin_settings`, `admin_audit_log`, `moderation_queue`, `dashboard_widgets` |
| S17 | `ad_campaigns`, `ad_creatives`, `ad_zones`, `ad_impressions`, `ad_clicks`, `advertisers` |
| S18 | `seo_metadata`, `redirects`, `sitemap_entries` |
| S19 | `api_keys`, `api_usage_log`, `webhooks`, `webhook_deliveries` |
| S22 | `device_tokens`, `notification_preferences`, `notifications`, `notification_topics` |
| S23 | `email_templates`, `email_campaigns`, `email_sends`, `email_lists`, `email_subscriptions` |

### Shared Data Entities

These entities are referenced by many modules and require careful schema design to avoid breaking changes:

1. **users** - Referenced by 15+ modules. Schema changes to users table have the widest blast radius.
2. **categories** - Shared taxonomy across articles, guides, events, dining, classifieds, products. Consider polymorphic categories or per-module category tables.
3. **tags** - Shared tagging across articles, guides, events, videos. Use a polymorphic taggable pattern.
4. **media** - Referenced by all content types. Media association should use a polymorphic relationship (mediable_type, mediable_id).
5. **venues** - Shared between events and dining. Single venue table with type classification.

### Data Flow Diagram

```
User Input ──► API Layer ──► Business Logic ──► Database (PostgreSQL)
                  │                                    │
                  │                                    ▼
                  │                              Search Index
                  │                           (Meilisearch/ES)
                  │                                    ▲
                  │                                    │
                  ├──► Cache Layer (Redis) ◄───── Cache Invalidation
                  │
                  ├──► Object Storage (Cloudflare R2) ◄── Media Upload
                  │
                  ├──► Email Service (Brevo) ◄── Transactional Events
                  │
                  ├──► Push Service (Firebase) ◄── Notification Events
                  │
                  └──► Payment Gateway (Stripe) ◄── Checkout Events
```

---

## 5. Critical Path Analysis

### Primary Critical Path

The longest dependency chain through the project, determining minimum duration:

```
S1 (Infra) ──[2wk]──► S2 (Auth) ──[2wk]──► S3 (Users) ──[2wk]──► S4 (Articles) ──[2wk]──►
S5 (Media) ──[2wk]──► S6 (Guides) ──[2wk]──► S7 (Events) ──[2wk]──► S11 (CMS) ──[2wk]──►
S12 (Homepage) ──[2wk]──► S15 (Search) ──[2wk]──► S18 (SEO) ──[2wk]──► S19 (API) ──[2wk]──►
S20 (App Core) ──[2wk]──► S21 (App Feat.) ──[2wk]──► S25 (Security) ──[2wk]──►
S26 (Beta) ──[2wk]──► S27 (Launch Prep) ──[2wk]──► S28 (Go-Live) ──[2wk]──► DONE

Critical path length: 19 sprints x 2 weeks = 38 weeks
Available time: 28 sprints x 2 weeks = 56 weeks
Float: 18 weeks (distributed across parallel sprint opportunities)
```

### Parallel Execution Opportunities

Several sprints within each phase can execute in parallel, which is how 28 sprints fit into the 56-week timeline despite the critical path.

```
Phase 1 (Sequential - 5 sprints, 10 weeks):
  S1 → S2 → S3 → S4 → S5
  (Mostly sequential due to foundational dependencies)

Phase 2 (Partially parallel - 7 sprints, 14 weeks):
  S6 ─┬─► S11 → S12
  S7 ─┤
  S8 ─┤    (S6-S10 can run in parallel pairs if team capacity allows)
  S9 ─┤    (S11 needs S4-S9 outputs; S12 needs everything)
  S10─┘

Phase 3 (Partially parallel - 7 sprints, 14 weeks):
  S13 ─┬─► S15 → S16
  S14 ─┤         ↓
       │    S17 ─┬─► S18 → S19
       └────────►┘

Phase 4 (Mixed - 5 sprints, 10 weeks):
  S20 → S21 ─┬─► S22
              │   (S22, S23 can be parallel)
  S23 ────────┤
  S24 ────────┘

Phase 5 (Sequential - 4 sprints, 8 weeks):
  S25 → S26 → S27 → S28
  (Strictly sequential: security → beta → prep → launch)
```

### Near-Critical Paths

These paths are close to the critical path length. Delays on these paths could shift them onto the critical path:

**Path A: Commerce Chain**
```
S1 → S2 → S3 → S14 (Store) → S25 (Security) → S26 → S27 → S28
Length: 16 sprints (32 weeks)
Float: 6 sprints (12 weeks)
```

**Path B: Mobile Chain**
```
S1 → S2 → S19 (API) → S20 (App Core) → S21 (App Feat.) → S22 (Push) → S25 → S26 → S27 → S28
Length: 18 sprints (36 weeks)
Float: 2 sprints (4 weeks) — NEAR CRITICAL
```

**Path C: Video Chain**
```
S1 → S5 (Media) → S9 (Video) → S15 (Search) → S19 (API) → S21 (App Feat.) → S25 → S26 → S27 → S28
Length: 16 sprints (32 weeks)
Float: 6 sprints (12 weeks)
```

### Critical Path Risk Mitigation

| Critical Path Segment | Risk | Mitigation |
|----------------------|------|------------|
| S1 → S2 (Infra → Auth) | Infra delays block everything | Pre-provision infrastructure before Sprint 1 officially starts; have Docker-based local dev as fallback |
| S4 → S6 (Articles → Guides) | Content model design flaws propagate | Invest extra architecture time in S4; review content model with all Phase 2 leads before finalizing |
| S12 → S15 (Homepage → Search) | Homepage scope creep delays search | Timebox homepage to 2 weeks strictly; defer cosmetic improvements to post-launch |
| S19 → S20 (API → App Core) | API instability disrupts mobile | Freeze API contract after Sprint 19; version the API |
| S25 → S26 (Security → Beta) | Security findings require major rework | Start security scanning earlier (Sprint 18); Sprint 25 should be remediation, not discovery |
| S27 → S28 (Prep → Go-Live) | App store approval delays | Submit app in Sprint 27 Week 1; have contingency for web-only launch |

---

## 6. Dependency Monitoring

### How to Use This Document

1. **During sprint planning:** Check the dependency matrix before committing to sprint scope. Verify that all blocking dependencies are complete.
2. **When re-sequencing sprints:** Consult the detailed dependency descriptions to understand what can safely be moved and what cannot.
3. **When adding new features:** Evaluate which existing modules the new feature depends on. Add new rows to the dependency matrix.
4. **When an external service has issues:** Check the external dependencies table for fallback options and affected sprints.

### Dependency Health Checks

Perform these checks at each phase gate:

- [ ] All hard dependencies for the next phase's sprints are satisfied
- [ ] External service accounts are provisioned and functional
- [ ] Shared database entities have stable schemas (no planned breaking changes)
- [ ] API contracts between modules are documented and versioned
- [ ] Search index includes all content types from completed sprints
- [ ] Mobile API endpoints match the web API for completed features

### Updating This Document

This dependency map should be updated when:

- A new sprint or feature is added to the roadmap
- A dependency relationship is discovered or changed during development
- An external provider is added, removed, or replaced
- A database entity schema changes in a way that affects dependent modules
- The critical path shifts due to delays or scope changes
