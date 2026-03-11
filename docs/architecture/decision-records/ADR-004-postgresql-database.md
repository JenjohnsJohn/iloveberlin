# ADR-004: PostgreSQL as Primary Database

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform needs a primary database to store and manage structured data including:

- **Business listings**: Restaurants, bars, cafes, shops, attractions, services -- each with categories, attributes, opening hours, pricing, and relationships to neighborhoods and tags.
- **User data**: Profiles, preferences, saved places, reviews, ratings, and activity history.
- **Events**: Time-bound events with recurrence rules, venue associations, ticket information, and category classifications.
- **Content**: Editorial articles, neighborhood guides, curated lists, and user-generated content with rich metadata.
- **Geospatial data**: Every listing and event has a geographic location. The platform must support proximity searches ("restaurants within 1 km"), bounding-box queries (map viewport), and neighborhood/district polygon containment.
- **Reviews and ratings**: User reviews with text, ratings, photos, and moderation status. Aggregate ratings must be efficiently computed.
- **Transactions**: Payment records, subscription data, and invoicing for premium business listings.

The database must handle relational integrity (a review belongs to a user and a listing), complex queries (filtered search with geo constraints), full-text search (for fallback and admin tools), and ACID transactions (for payments and critical state changes). The data model is inherently relational with well-defined schemas.

## Decision

We will use **PostgreSQL** as the primary database for the ILoveBerlin platform.

PostgreSQL's relational model with ACID compliance provides the data integrity guarantees required for user data, transactions, and business listings. Its PostGIS extension enables native geospatial queries critical to the platform's location-based features. Built-in full-text search, JSONB columns for semi-structured data, advanced indexing (B-tree, GIN, GiST, BRIN), and mature tooling make it the most capable single-database choice for the platform's diverse data needs.

## Alternatives Considered

| Criterion | PostgreSQL | MySQL | MongoDB | CockroachDB |
|---|---|---|---|---|
| Data model | Relational (+ JSONB) | Relational (+ JSON) | Document (BSON) | Relational (SQL) |
| ACID compliance | Full | Full (InnoDB) | Multi-document (since 4.0) | Full (distributed) |
| Geospatial support | Excellent (PostGIS) | Basic (Spatial extensions) | Good (GeoJSON, 2dsphere) | Basic |
| Full-text search | Good (tsvector, ts_query) | Basic (FULLTEXT index) | Good (Atlas Search) | Limited |
| JSON support | Excellent (JSONB, indexable) | Good (JSON type) | Native (documents are JSON) | Good (JSONB) |
| Indexing options | B-tree, GIN, GiST, BRIN, hash | B-tree, hash, full-text, spatial | B-tree, compound, text, geo | B-tree, GIN, GiST (partial) |
| Schema flexibility | Strict + JSONB for flexibility | Strict | Schema-less (flexible) | Strict + JSONB |
| Horizontal scaling | Read replicas, Citus extension | Read replicas, Group Replication | Native sharding | Native (distributed by design) |
| Licensing | PostgreSQL License (permissive, free) | GPL (or commercial for Enterprise) | SSPL (source-available) | BSL / MIT (core) |
| Maturity | 35+ years, extremely mature | 29+ years, extremely mature | 17+ years, mature | ~10 years, maturing |
| Hosting options | Self-managed, managed (RDS, Cloud SQL, Supabase) | Self-managed, managed (RDS, PlanetScale) | Atlas (managed), self-hosted | Serverless, self-hosted |
| ORM support (Node.js) | Excellent (Prisma, TypeORM, Drizzle) | Excellent (Prisma, TypeORM, Drizzle) | Good (Mongoose, Prisma) | Good (Prisma, pg-compatible) |
| Cost | Free (open source) | Free (Community) / Paid (Enterprise) | Free (Community) / Paid (Atlas) | Free (Core) / Paid (Enterprise) |

### Why not MySQL?

MySQL is a reliable, well-understood relational database that could serve many of the platform's needs. However, PostgreSQL is preferred for several reasons:

- **Geospatial**: PostGIS is the gold standard for geospatial data in relational databases. MySQL's spatial extensions are functional but lack the depth of PostGIS (e.g., complex polygon operations, spatial joins, geography vs. geometry types, routing extensions).
- **Full-text search**: PostgreSQL's full-text search with `tsvector`, `ts_query`, and GIN indexes is more capable than MySQL's `FULLTEXT` indexes, supporting ranking, phrase search, and language-specific stemming.
- **JSONB**: PostgreSQL's JSONB type is indexable with GIN indexes and supports partial updates, containment operators, and path queries. MySQL's JSON type is functional but less deeply integrated.
- **Advanced features**: PostgreSQL offers CTEs with recursive queries, window functions, array types, custom types, materialized views, and table partitioning -- all useful for a data-rich platform.

### Why not MongoDB?

MongoDB's document model offers schema flexibility and a natural fit for content that varies in structure. However:

- **Relational integrity**: The ILoveBerlin data model is fundamentally relational. A listing belongs to a neighborhood, has many reviews from users, is associated with categories and tags, and may have events. Enforcing these relationships in MongoDB requires application-level logic that PostgreSQL handles with foreign keys and constraints.
- **Transactions**: While MongoDB supports multi-document transactions, they are a relatively recent addition and carry performance implications. PostgreSQL's transaction support is mature and deeply integrated.
- **Consistency**: MongoDB's eventual consistency model (in replica sets) can lead to stale reads. The platform requires strong consistency for user data, reviews, and payment records.
- **Aggregation complexity**: Complex queries involving joins across collections (e.g., "find listings in this neighborhood, with average rating above 4, that have events this weekend, sorted by distance") are significantly more complex in MongoDB's aggregation pipeline than in PostgreSQL SQL with joins.
- **Licensing**: MongoDB's Server Side Public License (SSPL) is not a true open-source license and imposes restrictions on offering MongoDB as a service.

### Why not CockroachDB?

CockroachDB provides PostgreSQL-compatible distributed SQL with automatic sharding, strong consistency, and multi-region capabilities. It would be compelling if the platform required global distribution or massive horizontal scale from day one. However:

- **Complexity for current scale**: CockroachDB's distributed architecture adds operational complexity (cluster management, range distribution, latency considerations) that is unnecessary for a single-region platform focused on Berlin.
- **Cost**: Running a CockroachDB cluster requires more resources than a single PostgreSQL instance or primary-replica setup.
- **Feature gaps**: CockroachDB's PostGIS support and full-text search are less mature than PostgreSQL's native implementations.
- **Premature optimization**: The platform can start with PostgreSQL and scale vertically (larger instances), then horizontally (read replicas, Citus for sharding) long before needing a distributed database. If global scale is eventually needed, CockroachDB could be evaluated at that time.

## Consequences

### Positive

- **Data integrity**: Foreign keys, constraints, and ACID transactions ensure the data model remains consistent even under concurrent writes and complex operations.
- **PostGIS for geospatial**: Native support for proximity searches, bounding box queries, polygon containment, and distance calculations without a separate service or data store.
- **Full-text search fallback**: Built-in full-text search with `tsvector` and GIN indexes provides a capable search fallback and powers admin-side search without external dependencies. Meilisearch handles the user-facing search experience (see ADR-005).
- **JSONB flexibility**: Semi-structured data (listing attributes that vary by category, event metadata, user preferences) can be stored in JSONB columns with indexing, avoiding rigid schema changes for every new field.
- **Tooling maturity**: Excellent support from ORMs (Prisma, TypeORM, Drizzle), migration tools, monitoring (pg_stat_statements, pgBadger), and backup solutions (pg_dump, pgBackRest, WAL-G).
- **Cost**: PostgreSQL is free and open-source with a permissive license. No licensing fees regardless of scale.
- **Community**: One of the largest and most active open-source database communities, with extensive documentation, tutorials, and Stack Overflow coverage.

### Negative

- **Horizontal scaling complexity**: PostgreSQL does not natively shard. Horizontal write scaling requires extensions (Citus) or architectural changes (partitioning, application-level sharding). This is acceptable for the current scale but is a constraint to monitor.
- **Operational responsibility**: Self-hosting PostgreSQL on Hetzner (per ADR-007) means the team is responsible for backups, replication, failover, upgrades, and performance tuning. A managed service (e.g., Supabase, AWS RDS) would reduce this burden but at higher cost.
- **PostGIS learning curve**: PostGIS is powerful but has its own set of concepts (SRID, geometry vs. geography, spatial indexes) that require learning.
- **Full-text search limitations**: While PostgreSQL's full-text search is capable, it lacks the typo tolerance, faceting, and instant search experience that Meilisearch provides (see ADR-005). PostgreSQL's FTS is a complement, not a replacement, for the user-facing search engine.

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [PostgreSQL Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [pgBackRest - Backup & Restore](https://pgbackrest.org/)
