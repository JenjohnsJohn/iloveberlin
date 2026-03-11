# Sprint 17: Search Integration

**Sprint Number:** 17
**Sprint Name:** Search Integration
**Duration:** 2 weeks (10 working days)
**Dates:** Weeks 33-34 (relative to project start)
**Team Capacity:** ~160 hours (1 backend, 1 frontend, 1 DevOps, 1 QA)

---

## Sprint Goal

Integrate Meilisearch as the platform-wide search engine for ILoveBerlin, covering all 7 content types (articles, events, places, forum posts, listings, products, users), with event-driven index synchronization, a global search bar with debounced autocomplete, a full search results page with type-filtered tabs, and a full-index rebuild script for disaster recovery.

---

## User Stories

### US-17.1: Meilisearch Infrastructure
**As a** developer, **I want** Meilisearch configured and running in Docker **so that** the platform has a fast, typo-tolerant search engine.

**Acceptance Criteria:**
- [ ] Meilisearch container defined in docker-compose with persistent volume
- [ ] Master key configured via environment variable
- [ ] API key provisioned for backend read/write operations
- [ ] Health check endpoint monitored
- [ ] Meilisearch admin dashboard accessible in development

### US-17.2: Search Indexing
**As a** developer, **I want** all 7 content types indexed in Meilisearch **so that** users can search across the entire platform.

**Acceptance Criteria:**
- [ ] Index configuration defined for: articles, events, places, forum_posts, listings, products, users
- [ ] Each index has appropriate searchable attributes, filterable attributes, and sortable attributes
- [ ] Custom ranking rules defined per index (e.g., events ranked by date proximity, articles by recency)
- [ ] Synonyms configured for Berlin-specific terms (e.g., "Kreuzberg" = "Xberg", "U-Bahn" = "subway" = "metro")
- [ ] Stop words configured for English and German
- [ ] Documents indexed with all necessary fields for display in search results

### US-17.3: Real-Time Index Synchronization
**As a** developer, **I want** Meilisearch indexes to update automatically when content changes **so that** search results are always current.

**Acceptance Criteria:**
- [ ] Content create/update/delete events trigger index updates via NestJS event emitter
- [ ] Index updates are processed asynchronously via BullMQ job queue
- [ ] Batch updates are supported for bulk operations
- [ ] Failed index updates are retried (3 attempts with exponential backoff)
- [ ] Dead letter queue captures permanently failed updates for manual review
- [ ] Index update latency is under 2 seconds for single document changes

### US-17.4: Full Index Rebuild
**As a** developer, **I want** a script to rebuild all search indexes from PostgreSQL **so that** I can recover from index corruption or rebuild after schema changes.

**Acceptance Criteria:**
- [ ] CLI command rebuilds all indexes: `npm run search:reindex`
- [ ] Individual index rebuild supported: `npm run search:reindex -- --index=articles`
- [ ] Rebuild uses batch processing (1000 documents per batch) to avoid memory issues
- [ ] Progress bar shows rebuild status per index
- [ ] Zero-downtime rebuild using index swapping (build into temp index, then swap)
- [ ] Script is idempotent and safe to run multiple times

### US-17.5: Search API
**As a** frontend developer, **I want** a search API endpoint with autocomplete support **so that** I can build the search UI.

**Acceptance Criteria:**
- [ ] GET /api/search?q={query}&type={type}&page={page}&limit={limit} endpoint
- [ ] GET /api/search/autocomplete?q={query}&limit=5 endpoint for typeahead
- [ ] Multi-index search returns results grouped by content type
- [ ] Results include: id, type, title, excerpt, image, url, and relevance score
- [ ] Type filter restricts search to a single content type
- [ ] Pagination supported with total count
- [ ] Empty query returns trending/popular content
- [ ] Query sanitization and length limits (max 200 characters)

### US-17.6: Global Search Bar
**As a** user, **I want** a search bar in the header that provides instant suggestions **so that** I can quickly find content.

**Acceptance Criteria:**
- [ ] Search bar is accessible from every page via the site header
- [ ] Search bar expands on focus (desktop: from icon to full input)
- [ ] Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows) opens and focuses the search bar
- [ ] Escape key closes/collapses the search bar
- [ ] Typing triggers debounced autocomplete (300ms delay)
- [ ] Autocomplete dropdown shows up to 5 results grouped by type
- [ ] Each result shows icon, title, type badge, and excerpt
- [ ] Clicking a result navigates to the content page
- [ ] Pressing Enter submits the full search query to the results page
- [ ] Search bar is fully accessible (ARIA labels, keyboard navigation)

### US-17.7: Search Results Page
**As a** user, **I want** a search results page with type filter tabs **so that** I can browse and filter search results.

**Acceptance Criteria:**
- [ ] /search?q={query} route displays full search results
- [ ] Type filter tabs: All, Articles, Events, Places, Forum, Listings, Products, Users
- [ ] "All" tab shows results grouped by type with "View more" links
- [ ] Individual type tabs show paginated results for that type
- [ ] Per-type result cards with appropriate layout (event cards show date, product cards show price, etc.)
- [ ] Result count displayed per tab
- [ ] "No results" state with suggestions (check spelling, try different terms, browse categories)
- [ ] Search query persists in the URL and search bar
- [ ] Recent searches stored in localStorage and shown when search bar is empty
- [ ] Responsive layout for all breakpoints

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday) - Meilisearch Infrastructure
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| DevOps-17.1: Add Meilisearch to docker-compose | DevOps | 2 | Container config, persistent volume, health check, port mapping |
| DevOps-17.2: Meilisearch environment configuration | DevOps | 1.5 | Master key, API keys (search-only + admin), environment variables for staging/production |
| DevOps-17.3: Meilisearch monitoring setup | DevOps | 2 | Prometheus metrics exporter, Grafana dashboard for search performance |
| BE-17.1: Meilisearch NestJS module setup | Backend | 2 | MeilisearchModule with configuration, MeilisearchService wrapper, connection health check |
| BE-17.2: Define index schemas and configuration | Backend | 3 | Index settings per content type: searchable/filterable/sortable attributes, ranking rules |

#### Day 2 (Tuesday) - Index Configuration & Sync Service Foundation
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-17.3: Articles index configuration | Backend | 1 | Searchable: title, content, author_name. Filterable: category, tags, published_at. Sortable: published_at, views |
| BE-17.4: Events index configuration | Backend | 1 | Searchable: title, description, venue_name, organizer. Filterable: category, district, date_range, is_free. Sortable: start_date, popularity |
| BE-17.5: Places index configuration | Backend | 1 | Searchable: name, description, address, category. Filterable: category, district, rating_range, price_range. Sortable: rating, distance (geo) |
| BE-17.6: Forum posts index configuration | Backend | 0.5 | Searchable: title, content, author_name. Filterable: category, is_answered. Sortable: created_at, replies_count |
| BE-17.7: Listings index configuration | Backend | 0.5 | Searchable: title, description, location. Filterable: category, price_range, condition. Sortable: created_at, price |
| BE-17.8: Products index configuration | Backend | 0.5 | Searchable: name, description, category_name. Filterable: category, price_range, in_stock. Sortable: price, created_at, popularity |
| BE-17.9: Users index configuration | Backend | 0.5 | Searchable: username, display_name, bio. Filterable: role, is_verified. Sortable: created_at, followers_count |
| BE-17.10: SearchIndexingService base class | Backend | 3 | Generic indexing service with add/update/delete/batch methods, error handling, retry logic |
| FE-17.1: Research search UI patterns and plan components | Frontend | 2 | Review search UX best practices, plan component architecture |

#### Day 3 (Wednesday) - Event-Driven Index Updates
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-17.11: NestJS event emitter integration | Backend | 2 | Define search index events (CONTENT_CREATED, CONTENT_UPDATED, CONTENT_DELETED) per content type |
| BE-17.12: BullMQ search index queue | Backend | 2.5 | Queue definition, job processor, retry config (3 attempts, exponential backoff), dead letter queue |
| BE-17.13: Event listeners for all content types | Backend | 3 | Subscribe to create/update/delete events for articles, events, places, forum posts, listings, products, users |
| BE-17.14: Document transformer per content type | Backend | 2 | Transform TypeORM entities into Meilisearch documents with correct field mapping |
| DevOps-17.4: BullMQ dashboard for search queue monitoring | DevOps | 1.5 | Bull Board UI for monitoring search index jobs, failed jobs, retry status |

#### Day 4 (Thursday) - Full Rebuild Script & Ranking Rules
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-17.15: Full index rebuild command | Backend | 3 | NestJS CLI command, batch processing (1000/batch), progress reporting |
| BE-17.16: Zero-downtime index swap | Backend | 2 | Build into temporary index, swap alias, delete old index |
| BE-17.17: Individual index rebuild option | Backend | 1 | --index flag to rebuild specific content type |
| BE-17.18: Custom ranking rules per index | Backend | 2 | Events: proximity to current date. Articles: recency + views. Places: rating + review count. Products: popularity + in_stock boost |
| BE-17.19: Synonyms and stop words configuration | Backend | 1.5 | Berlin district synonyms, transit synonyms, English/German stop words |
| FE-17.2: Search bar component - structure and styling | Frontend | 3 | Expandable input, search icon, close button, responsive behavior |

#### Day 5 (Friday) - Search API Endpoints
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-17.20: Global search endpoint | Backend | 3 | GET /api/search, multi-index search, result aggregation, type grouping |
| BE-17.21: Autocomplete endpoint | Backend | 2 | GET /api/search/autocomplete, limited fields, fast response (<100ms target) |
| BE-17.22: Search result DTOs and serialization | Backend | 1.5 | Unified SearchResultDto with type discriminator, per-type detail fields |
| BE-17.23: Query sanitization and validation | Backend | 1 | Input sanitization, length limit, rate limiting |
| FE-17.3: Keyboard shortcut handler (Cmd+K / Ctrl+K) | Frontend | 1.5 | Global keyboard listener, focus management, Escape to close |
| QA-17.1: Meilisearch infrastructure verification | QA | 2 | Verify Docker setup, API connectivity, index creation, document insertion |

### Week 2 (Days 6-10)

#### Day 6 (Monday) - Search Bar Autocomplete
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-17.4: Debounced search hook | Frontend | 2 | Custom hook with 300ms debounce, abort previous request, loading state |
| FE-17.5: Autocomplete dropdown component | Frontend | 3 | Dropdown below search bar, grouped results by type, highlight matching text |
| FE-17.6: Autocomplete result item component | Frontend | 2 | Type icon, title with highlight, excerpt, type badge |
| FE-17.7: Autocomplete keyboard navigation | Frontend | 2 | Arrow keys to navigate results, Enter to select, Escape to close |
| BE-17.24: Search indexing unit tests | Backend | 3 | Test document transformation, event handling, batch processing |

#### Day 7 (Tuesday) - Search Results Page Structure
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-17.8: Search results page route | Frontend | 1.5 | /search route, query param parsing, search on load |
| FE-17.9: Type filter tabs component | Frontend | 2.5 | Tab bar with count badges: All, Articles, Events, Places, Forum, Listings, Products, Users |
| FE-17.10: "All" tab grouped results layout | Frontend | 3 | Results grouped by type, top 3 per type, "View more" link per section |
| FE-17.11: Search results pagination | Frontend | 1.5 | Page controls, URL query param sync, scroll to top on page change |
| BE-17.25: Search API integration tests | Backend | 3 | Multi-index search, type filtering, pagination, autocomplete |

#### Day 8 (Wednesday) - Per-Type Result Cards
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-17.12: Article result card | Frontend | 1 | Thumbnail, title, excerpt, author, date, category badge |
| FE-17.13: Event result card | Frontend | 1.5 | Image, title, date/time, venue, district badge, "Free" indicator |
| FE-17.14: Place result card | Frontend | 1 | Photo, name, category, rating stars, district, price range |
| FE-17.15: Forum post result card | Frontend | 1 | Title, excerpt, author, replies count, answered badge |
| FE-17.16: Listing result card | Frontend | 1 | Image, title, price, condition badge, location |
| FE-17.17: Product result card | Frontend | 1 | Image, name, price, "In Stock"/"Out of Stock" badge |
| FE-17.18: User result card | Frontend | 0.5 | Avatar, display name, username, bio excerpt, verified badge |
| FE-17.19: "No results" state component | Frontend | 1 | Illustration, message, spelling suggestion, browse links |
| QA-17.2: Search indexing sync testing | QA | 3 | Create/update/delete content, verify index updates within 2 seconds |

#### Day 9 (Thursday) - Polish, Recent Searches & Edge Cases
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-17.20: Recent searches (localStorage) | Frontend | 2 | Store last 10 searches, display when search bar is empty/focused, clear option |
| FE-17.21: Search bar responsive design | Frontend | 1.5 | Mobile: full-width overlay. Tablet: expanding input. Desktop: expanding input in header |
| FE-17.22: Search results responsive design | Frontend | 1.5 | Result cards stack on mobile, grid on desktop, tabs scroll horizontally on mobile |
| FE-17.23: Search analytics tracking | Frontend | 1 | Track search queries, result clicks, zero-result queries (for future improvement) |
| FE-17.24: Search accessibility audit | Frontend | 1.5 | ARIA live regions for results, combobox pattern for autocomplete, focus management |
| BE-17.26: Search performance optimization | Backend | 2 | Response caching for popular queries (Redis, 60s TTL), query logging for analytics |
| BE-17.27: Full rebuild script end-to-end test | Backend | 2 | Run full rebuild, verify all indexes, verify document counts |
| QA-17.3: Search UI functional testing | QA | 3 | Autocomplete, result cards, type tabs, pagination, no results, recent searches |

#### Day 10 (Friday) - Integration Testing & Final Verification
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-17.25: E2E test - search autocomplete flow | Frontend | 2 | Type query, verify dropdown, keyboard navigate, select result |
| FE-17.26: E2E test - search results page flow | Frontend | 2 | Search query, switch tabs, paginate, verify result cards |
| FE-17.27: Search performance testing | Frontend | 1 | Measure autocomplete response time, verify <300ms target |
| BE-17.28: Load test search endpoints | Backend | 2 | k6 script: 50 concurrent search queries, verify <200ms p95 response time |
| BE-17.29: Index consistency verification | Backend | 1.5 | Script to compare PostgreSQL record counts with Meilisearch document counts |
| QA-17.4: Cross-browser search testing | QA | 2 | Chrome, Firefox, Safari, Edge - search bar, autocomplete, results |
| QA-17.5: Full search regression suite | QA | 3 | End-to-end: create content -> verify indexed -> search -> find -> navigate |
| DevOps-17.5: Production Meilisearch sizing and backup config | DevOps | 2 | Memory allocation, snapshot schedule, restore procedure documentation |

---

## Backend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| BE-17.1-17.2 | Meilisearch module setup | NestJS module, service wrapper, index schemas | 5 |
| BE-17.3-17.9 | Index configurations (7 types) | Searchable/filterable/sortable attributes per type | 5 |
| BE-17.10-17.14 | Indexing service | Base class, event emitter, BullMQ queue, event listeners, document transformers | 12.5 |
| BE-17.15-17.19 | Rebuild script & ranking | CLI command, zero-downtime swap, ranking rules, synonyms | 9.5 |
| BE-17.20-17.23 | Search API endpoints | Global search, autocomplete, DTOs, sanitization | 7.5 |
| BE-17.24-17.25 | Unit & integration tests | Indexing tests, API tests | 6 |
| BE-17.26-17.29 | Performance & verification | Caching, load test, consistency check, rebuild test | 7.5 |
| **Total** | | | **53** |

## Frontend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| FE-17.1-17.3 | Search bar foundation | Research, component structure, keyboard shortcuts | 6.5 |
| FE-17.4-17.7 | Autocomplete | Debounce hook, dropdown, result items, keyboard nav | 9 |
| FE-17.8-17.11 | Search results page | Route, type tabs, grouped layout, pagination | 8.5 |
| FE-17.12-17.19 | Per-type result cards | 7 card types + no results state | 8 |
| FE-17.20-17.24 | Polish & UX | Recent searches, responsive, analytics, accessibility | 7.5 |
| FE-17.25-17.27 | E2E tests & performance | Autocomplete test, results page test, perf measurement | 5 |
| **Total** | | | **44.5** |

## DevOps/Infrastructure Tasks

| Task ID | Task | Effort (hrs) |
|---------|------|-------------|
| DevOps-17.1 | Docker Compose Meilisearch container | 2 |
| DevOps-17.2 | Environment configuration and API keys | 1.5 |
| DevOps-17.3 | Prometheus/Grafana monitoring for Meilisearch | 2 |
| DevOps-17.4 | BullMQ dashboard for search queue | 1.5 |
| DevOps-17.5 | Production sizing, backup, and restore config | 2 |
| **Total** | | **9** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---------|------|---------------|-------------|
| QA-17.1 | Infrastructure verification | Docker health, API connectivity, index CRUD, document CRUD | 2 |
| QA-17.2 | Index sync testing | Create content -> verify indexed (< 2s); update -> verify updated; delete -> verify removed; batch update | 3 |
| QA-17.3 | Search UI testing | Autocomplete shows results; type tabs filter correctly; pagination works; no results state; recent searches | 3 |
| QA-17.4 | Cross-browser testing | Search bar expand/collapse; autocomplete dropdown; results page; keyboard shortcuts | 2 |
| QA-17.5 | Full regression | Content creation -> indexing -> search -> click -> navigation for each of 7 content types | 3 |
| **Total** | | | **13** |

---

## Dependencies

```
DevOps-17.1-17.2 (Meilisearch Docker) --> BE-17.1 (NestJS module)
BE-17.1 (module setup) --> BE-17.2-17.9 (index configs)
BE-17.2-17.9 (index configs) --> BE-17.10-17.14 (indexing service)
BE-17.10-17.14 (indexing service) --> BE-17.15-17.17 (rebuild script)
BE-17.10-17.14 (indexing service) --> BE-17.20-17.21 (search endpoints)
BE-17.20-17.21 (search endpoints) --> FE-17.4-17.7 (autocomplete)
BE-17.20-17.21 (search endpoints) --> FE-17.8-17.11 (results page)
FE-17.2-17.3 (search bar) --> FE-17.4-17.7 (autocomplete)
FE-17.8-17.11 (results page) --> FE-17.12-17.19 (result cards)
All implementation --> FE-17.20-17.24 (polish)
All implementation --> QA-17.2-17.5 (testing)
Sprint 15 products data --> BE-17.8 (products index config)
Existing content modules (articles, events, places, forum, listings) --> BE-17.13 (event listeners)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Meilisearch memory usage exceeds allocated resources | Medium | High | Start with conservative dataset; monitor memory in Grafana; plan for vertical scaling |
| Index sync lag exceeds 2-second target under load | Medium | Medium | Batch processing, queue prioritization, performance profiling |
| Existing content modules lack proper event emission | High | Medium | Audit all existing modules in Day 1; add missing events in parallel |
| Search relevance tuning requires more iteration | High | Medium | Define baseline ranking rules; plan a follow-up tuning sprint if needed |
| Zero-downtime index swap has edge cases | Medium | High | Test thoroughly in staging; have rollback procedure documented |
| Autocomplete UX performance on slow connections | Medium | Medium | Client-side caching of recent results; skeleton loading; abort previous requests |
| German/English mixed content affects search quality | Medium | Medium | Configure language-specific analyzers; test with bilingual queries |

---

## Deliverables Checklist

- [ ] Meilisearch running in Docker with persistent storage
- [ ] 7 search indexes configured with appropriate attributes and ranking rules
- [ ] Search indexing service syncing PostgreSQL changes to Meilisearch in real-time
- [ ] Event-driven index updates via BullMQ with retry and dead letter queue
- [ ] Full index rebuild CLI script with zero-downtime swap
- [ ] Synonyms and stop words configured for Berlin context
- [ ] Global search API endpoint with multi-index support
- [ ] Autocomplete API endpoint with sub-100ms response time
- [ ] Global search bar component with Cmd+K shortcut
- [ ] Debounced autocomplete dropdown with grouped results
- [ ] Search results page with type filter tabs
- [ ] 7 per-type result card components
- [ ] "No results" state with helpful suggestions
- [ ] Recent searches stored in localStorage
- [ ] Search analytics tracking
- [ ] Prometheus/Grafana monitoring for Meilisearch
- [ ] BullMQ dashboard for search queue monitoring

---

## Definition of Done

1. Meilisearch container runs reliably with health checks passing
2. All 7 content type indexes are created with correct attribute configuration
3. Content create/update/delete events trigger index updates within 2 seconds
4. Full index rebuild completes successfully for all 7 types with zero downtime
5. Search API returns relevant results for English and German queries
6. Autocomplete endpoint responds in under 100ms for 95th percentile
7. Search bar is accessible from every page with Cmd+K/Ctrl+K shortcut
8. Autocomplete dropdown supports full keyboard navigation
9. Search results page renders correct cards for each content type
10. Type filter tabs correctly filter and show accurate counts
11. "No results" state displays when no matches are found
12. Search works correctly on Chrome, Firefox, Safari, and Edge
13. All E2E tests pass for search autocomplete and results page flows
14. Monitoring dashboards show search query volume, latency, and error rates

---

## Sprint Review Demo Script

1. **Infrastructure** (2 min)
   - Show Meilisearch running in Docker
   - Show Grafana dashboard with search metrics
   - Show BullMQ dashboard with index queue

2. **Index Configuration** (3 min)
   - Show index settings for articles (searchable, filterable, sortable attributes)
   - Show custom ranking rules for events (date proximity)
   - Show Berlin-specific synonyms

3. **Real-Time Sync** (4 min)
   - Create a new article in the admin
   - Show it appearing in Meilisearch within 2 seconds
   - Update the article title, show the index updating
   - Delete the article, show it removed from the index

4. **Full Rebuild** (2 min)
   - Run the rebuild command, show progress bar
   - Verify document counts match PostgreSQL

5. **Search Bar & Autocomplete** (4 min)
   - Press Cmd+K to open search bar
   - Type "Brandenburg" - show autocomplete dropdown with results from articles, events, places
   - Use arrow keys to navigate results
   - Press Enter to go to search results page
   - Press Escape to close

6. **Search Results Page** (5 min)
   - Show "All" tab with grouped results
   - Click "Events" tab, show filtered event cards
   - Click "Places" tab, show place cards with ratings
   - Show pagination
   - Search for a typo ("Brandonburg"), show typo-tolerant results
   - Search for something with no results, show suggestions

7. **Per-Type Cards** (3 min)
   - Walk through each card type, point out type-specific details
   - Show mobile responsive layout

8. **Edge Cases** (2 min)
   - Show recent searches when focusing empty search bar
   - Show German query handling
   - Demonstrate zero-result search with helpful messaging

---

## Rollover Criteria

Tasks may roll over to Sprint 18 if:
- Existing content modules require more than 8 hours of event emission retrofitting
- Meilisearch performance tuning requires more than 4 additional hours
- Per-type result card designs require design team input not available this sprint
- Full rebuild script zero-downtime swap has unresolved edge cases

Tasks that MUST complete in this sprint (no rollover):
- Meilisearch Docker setup and basic configuration
- At least 4 of 7 index configurations (articles, events, places, products)
- Basic search indexing service with event-driven updates
- Global search endpoint
- Search bar with autocomplete
- Search results page with "All" tab

Deprioritized if time is short:
- User search index (least impactful content type)
- Search analytics tracking
- Recent searches localStorage feature
- Zero-downtime index swap (use simple rebuild instead)
