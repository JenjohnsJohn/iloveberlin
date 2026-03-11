# ADR-005: Meilisearch over Elasticsearch for Search

## Status

**Accepted**

## Date

2026-03-11

## Context

Search is a core feature of the ILoveBerlin platform. Users search for restaurants by name, filter events by date and category, discover neighborhoods, and find businesses by cuisine type or service. The search experience must be:

- **Instant**: Results should appear as the user types (search-as-you-type), with latency under 50ms.
- **Typo-tolerant**: Users frequently misspell Berlin neighborhood names (e.g., "Kreuzberg" vs "Kreutzberg"), restaurant names, and German-language terms. The search engine must handle these gracefully.
- **Relevant**: Results must be ranked by a combination of text relevance, popularity (ratings, review count), recency (for events), and optionally proximity (for location-based searches).
- **Filterable**: Users filter by category, neighborhood, price range, rating, opening hours, and other attributes. Filters must be fast and combinable.
- **Faceted**: The UI should display filter counts (e.g., "Italian (23), Japanese (15)") to help users narrow results.
- **Multi-language**: Content exists primarily in English and German. The search engine must handle both languages, including German compound words and diacritics.

PostgreSQL's built-in full-text search (see ADR-004) is capable but lacks the typo tolerance, search-as-you-type performance, and faceting required for the user-facing search experience. A dedicated search engine is needed.

## Decision

We will use **Meilisearch** as the dedicated search engine for the ILoveBerlin platform's user-facing search features.

Meilisearch provides instant, typo-tolerant, relevant search out of the box with minimal configuration. Its resource efficiency, simple deployment, and RESTful API make it an excellent fit for the platform's current scale and operational constraints. PostgreSQL remains the source of truth; Meilisearch indexes are populated and updated via background sync jobs from the NestJS backend.

## Alternatives Considered

| Criterion | Meilisearch | Elasticsearch | Typesense | Algolia (SaaS) |
|---|---|---|---|---|
| Type | Open-source search engine | Open-source search & analytics | Open-source search engine | Managed search service |
| License | MIT | SSPL / Elastic License | GPL v3 | Proprietary (SaaS) |
| Setup complexity | Very low (single binary) | High (JVM, cluster config) | Low (single binary) | None (managed) |
| Resource usage | Low (~100 MB RAM for small indexes) | High (JVM, 2+ GB RAM minimum) | Low (~256 MB RAM) | Not applicable (managed) |
| Typo tolerance | Built-in (default, configurable) | Fuzzy queries (manual config) | Built-in (default) | Built-in (default) |
| Search-as-you-type | Native (prefix search) | Requires configuration | Native (prefix search) | Native (prefix search) |
| Relevance ranking | Customizable (built-in ranking rules) | Highly customizable (BM25, custom) | Customizable (built-in rules) | Customizable |
| Faceted search | Built-in | Built-in (aggregations) | Built-in | Built-in |
| Geo search | Built-in (geo radius, bounding box) | Built-in (geo queries) | Built-in (geo radius) | Built-in |
| Multi-language | Built-in (language-specific tokenizers) | Built-in (analyzers per language) | Limited (language detection) | Built-in |
| Filtering | Built-in (fast, simple syntax) | Built-in (powerful query DSL) | Built-in | Built-in |
| Scalability | Single node (clustering in development) | Excellent (distributed, sharding) | Raft-based clustering | Managed (auto-scaling) |
| Analytics / log search | Not designed for this | Excellent | Not designed for this | Not designed for this |
| API | RESTful (simple JSON) | RESTful (verbose JSON) | RESTful (simple JSON) | RESTful + SDKs |
| Client SDKs | JS, Dart, Python, Go, etc. | Official clients for many languages | JS, Python, Ruby, etc. | Comprehensive SDKs |
| Cost | Free (self-hosted) | Free (self-hosted) / Elastic Cloud | Free (self-hosted) / Typesense Cloud | Pay per search operation |
| Operational overhead | Very low | High (JVM tuning, cluster mgmt) | Low | None |

### Why not Elasticsearch?

Elasticsearch is the most powerful and flexible search engine available, with a proven track record at massive scale. It is the industry standard for log aggregation, analytics, and complex search scenarios. However, for the ILoveBerlin platform at its current scale, Elasticsearch presents several drawbacks:

- **Operational complexity**: Elasticsearch runs on the JVM and requires careful heap tuning, cluster configuration, shard management, and monitoring. Running it on Hetzner alongside the application stack adds significant operational burden for a small team.
- **Resource consumption**: A minimal Elasticsearch setup requires 2+ GB of RAM (4+ GB recommended). As the search index for ILoveBerlin likely contains tens of thousands of documents (not millions), this is disproportionate to the workload.
- **Configuration overhead**: Achieving typo-tolerant, search-as-you-type behavior in Elasticsearch requires custom analyzers, edge n-gram tokenizers, fuzzy queries, and completion suggesters. Meilisearch provides this out of the box with zero configuration.
- **Licensing**: Elasticsearch switched from Apache 2.0 to SSPL/Elastic License, which restricts offering it as a managed service. While this does not directly affect self-hosting, it signals a less open-source-friendly direction. OpenSearch (the Apache 2.0 fork) is an alternative but adds the same operational complexity.

Elasticsearch remains the right choice if the platform needs to index millions of documents, requires complex analytics pipelines, or needs distributed clustering. If the platform outgrows Meilisearch, Elasticsearch (or OpenSearch) would be the natural upgrade path.

### Why not Typesense?

Typesense is similar to Meilisearch in philosophy: simple, fast, typo-tolerant search with minimal setup. It would also be a good choice for the platform. Meilisearch was preferred for the following reasons:

- **Broader SDK support**: Meilisearch has official SDKs for Dart (important for Flutter mobile app integration) and a wider range of languages.
- **Larger community**: Meilisearch has a larger GitHub community and more third-party integrations, resulting in better documentation and community support.
- **Geo search**: Meilisearch's built-in geo search with radius and bounding box filtering integrates cleanly with the platform's location-based features.

The two are close enough that Typesense could be substituted with minimal migration effort if needed.

### Why not Algolia?

Algolia provides the best developer experience and search quality in the market, with zero operational overhead. However:

- **Cost**: Algolia charges per search operation and per record. For a platform with many listings, frequent search-as-you-type queries (every keystroke generates a request), and multiple indexes (listings, events, articles), costs scale quickly and become significant.
- **Data residency**: Algolia is a US-based SaaS platform. While it has EU data centers, the platform's preference for European data sovereignty (see ADR-007) favors self-hosted solutions where data never leaves the controlled infrastructure.
- **Vendor lock-in**: Algolia's proprietary API and ranking algorithms create a dependency. Migrating from Algolia to a self-hosted solution later would require rewriting search integration code.

## Consequences

### Positive

- **Instant, typo-tolerant search with zero configuration**: Meilisearch provides excellent search-as-you-type behavior, typo tolerance, and relevance ranking out of the box. The default configuration covers 90% of the platform's needs.
- **Low resource footprint**: Meilisearch runs efficiently on modest hardware. A single instance with 512 MB to 1 GB RAM comfortably handles the platform's index size (tens of thousands of listings, events, and articles).
- **Simple deployment**: Meilisearch is a single binary (or Docker container) with no JVM, no cluster configuration, and minimal operational overhead. It fits well within the Hetzner deployment alongside the application stack.
- **Excellent SDK support**: Official JavaScript and Dart SDKs integrate cleanly with both the NestJS backend and Flutter mobile app.
- **Built-in geo search**: Location-based filtering (e.g., "restaurants within 2 km of me") is supported natively, complementing PostGIS queries for different use cases.
- **Cost**: Free and MIT-licensed. No per-query or per-record charges.

### Negative

- **Single-node limitation**: Meilisearch does not yet support clustering or horizontal scaling. If the dataset grows to millions of documents or query load exceeds a single instance's capacity, a migration to Elasticsearch or a sharding strategy would be needed.
- **Less flexible ranking**: Meilisearch's ranking rules are simpler than Elasticsearch's scoring capabilities. Complex relevance tuning (e.g., combining BM25 with custom scoring functions, vector search, learning-to-rank) is not available.
- **Data synchronization**: Meilisearch is not a source of truth. The NestJS backend must keep Meilisearch indexes in sync with PostgreSQL, handling creates, updates, and deletes via background jobs. This introduces eventual consistency -- a listing updated in PostgreSQL may take seconds to appear in search results.
- **No analytics/aggregation**: Meilisearch is a search engine, not an analytics engine. Complex aggregations (e.g., "average rating by neighborhood over time") remain in PostgreSQL.
- **Newer project**: Meilisearch is younger than Elasticsearch and has a smaller track record in production at very large scale. This is acceptable for the platform's current needs but is a risk factor for long-term bets.

## References

- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [Meilisearch Typo Tolerance](https://www.meilisearch.com/docs/learn/configuration/typo_tolerance)
- [Meilisearch Geo Search](https://www.meilisearch.com/docs/learn/filtering_and_sorting/geosearch)
- [Meilisearch JavaScript SDK](https://github.com/meilisearch/meilisearch-js)
- [Meilisearch Dart SDK](https://github.com/meilisearch/meilisearch-dart)
- [Elasticsearch vs Meilisearch Comparison](https://www.meilisearch.com/docs/learn/what_is_meilisearch/comparison_to_alternatives)
