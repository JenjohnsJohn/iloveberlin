# Migration Strategy

> TypeORM migrations for the ILoveBerlin platform.

---

## Overview

Database schema changes are managed through TypeORM migrations. Migrations are version-controlled, reversible, and environment-aware. The strategy supports zero-downtime deployments for production.

---

## Migration Naming Convention

```
{timestamp}-{description}.ts
```

**Format:** `YYYYMMDDHHMMSS-kebab-case-description.ts`

**Examples:**
```
20260101000000-initial-schema.ts
20260115120000-add-users-table.ts
20260115120100-add-refresh-tokens-table.ts
20260201090000-add-articles-table.ts
20260201090100-add-article-tags-join-table.ts
20260301140000-add-restaurant-rating-column.ts
20260305100000-add-gin-index-articles-fts.ts
20260310160000-alter-event-status-add-cancelled.ts
```

**Naming rules:**
1. Timestamp ensures natural ordering.
2. Description starts with a verb: `add-`, `alter-`, `drop-`, `create-`, `rename-`, `seed-`.
3. Include the affected table name.
4. One migration per logical change (avoid "kitchen sink" migrations).

---

## TypeORM CLI Configuration

```typescript
// src/config/typeorm-cli.config.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'iloveberlin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'iloveberlin',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
```

```json
// package.json scripts
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/config/typeorm-cli.config.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/config/typeorm-cli.config.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/config/typeorm-cli.config.ts",
    "migration:show": "typeorm-ts-node-commonjs migration:show -d src/config/typeorm-cli.config.ts"
  }
}
```

---

## Up/Down Migration Pattern

Every migration must implement both `up()` and `down()` methods. The `down()` method must exactly reverse the `up()` operation.

### Example: Adding a Table

```typescript
// src/migrations/20260115120000-add-users-table.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersTable1736942400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin', 'super_admin');
    `);
    await queryRunner.query(`
      CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
    `);

    // Create table
    await queryRunner.query(`
      CREATE TABLE users (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email           VARCHAR(255) NOT NULL,
        password_hash   VARCHAR(255) NOT NULL,
        display_name    VARCHAR(100) NOT NULL,
        role            user_role NOT NULL DEFAULT 'user',
        email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
        avatar_url      VARCHAR(500),
        bio             TEXT,
        location        VARCHAR(100),
        social_links    JSONB DEFAULT '{}',
        status          user_status NOT NULL DEFAULT 'active',
        last_login_at   TIMESTAMPTZ,
        login_attempts  INTEGER NOT NULL DEFAULT 0,
        locked_until    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at      TIMESTAMPTZ
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_users_email_active
        ON users (email)
        WHERE deleted_at IS NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX idx_users_role
        ON users (role)
        WHERE deleted_at IS NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX idx_users_status
        ON users (status)
        WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role;`);
  }
}
```

### Example: Adding a Column

```typescript
// src/migrations/20260301140000-add-restaurant-rating-column.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRestaurantRatingColumn1740830400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE restaurants
        ADD COLUMN rating DECIMAL(2, 1);
    `);
    await queryRunner.query(`
      ALTER TABLE restaurants
        ADD CONSTRAINT chk_restaurants_rating
        CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));
    `);
    await queryRunner.query(`
      CREATE INDEX idx_restaurants_rating
        ON restaurants (rating DESC NULLS LAST)
        WHERE deleted_at IS NULL AND status = 'published';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_restaurants_rating;`);
    await queryRunner.query(`
      ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS chk_restaurants_rating;
    `);
    await queryRunner.query(`ALTER TABLE restaurants DROP COLUMN IF EXISTS rating;`);
  }
}
```

### Example: Adding an Enum Value

```typescript
// src/migrations/20260310160000-alter-event-status-add-cancelled.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterEventStatusAddCancelled1741622400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL requires this approach to add values to an existing enum
    await queryRunner.query(`
      ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'cancelled';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing values from an enum.
    // The down migration is a no-op. The enum value remains but is unused.
    // For a full reversal, the enum must be recreated:
    //   1. Create new enum without the value
    //   2. ALTER column to use new enum
    //   3. DROP old enum
    // This is intentionally left as a no-op for safety.
    console.warn('Cannot remove enum value from PostgreSQL. Manual intervention required if needed.');
  }
}
```

---

## Migration Ordering

Migrations are grouped by dependency. The initial schema setup follows this order:

```
Phase 1: Foundation
  1. Extensions (uuid-ossp, pgcrypto, pg_trgm, unaccent)
  2. Users + refresh_tokens + user_bookmarks
  3. Media

Phase 2: Content
  4. Categories + tags
  5. Articles + article_tags + article_revisions
  6. Guide_topics + guides

Phase 3: Events & Dining
  7. Venues + events
  8. Cuisines + restaurants + restaurant_cuisines + restaurant_images + dining_offers

Phase 4: Additional Content
  9. Video_series + videos + video_tags
  10. Competitions + competition_entries
  11. Classified_categories + classifieds + classified_images + classified_messages + classified_reports

Phase 5: E-Commerce
  12. Product_categories + products + product_variants + product_images
  13. Carts + cart_items
  14. Orders + order_items
  15. Discount_codes

Phase 6: Admin
  16. Admin_activity_log + homepage_featured
  17. Ad_campaigns + ad_placements
  18. Notification_preferences

Phase 7: Seeds
  19. seed-categories
  20. seed-guide-topics
  21. seed-cuisines
  22. seed-classified-categories
  23. seed-product-categories
  24. seed-admin-user
```

---

## Environment-Specific Seeds

### Development

Full seed data for all tables, including test users, sample content, and mock data:

```typescript
// src/seeds/development.seed.ts
export class DevelopmentSeed {
  async run(): Promise<void> {
    // All categories, topics, cuisines
    // 4 test users (admin, editor, user, unverified)
    // 10 sample articles with tags
    // 5 sample guides
    // 5 venues + 10 events
    // 5 restaurants with cuisines and images
    // 3 videos in series
    // 2 competitions with entries
    // 3 classifieds with messages
    // 2 products with variants
    // Sample orders and carts
    // Homepage featured content
    // Ad campaign with placements
  }
}
```

### Staging

Identical to production seeds plus a small set of test content:

```typescript
// src/seeds/staging.seed.ts
export class StagingSeed {
  async run(): Promise<void> {
    // All reference data (categories, topics, cuisines, etc.)
    // 2 test users (admin, editor)
    // 3 sample articles for layout verification
    // 1 sample event
    // 1 sample restaurant
  }
}
```

### Production

Only reference data -- no test content:

```typescript
// src/seeds/production.seed.ts
export class ProductionSeed {
  async run(): Promise<void> {
    // Categories (article, event, video)
    // Guide topics
    // Cuisines
    // Classified categories
    // Product categories
    // Super admin user (email from env var)
    // Default notification preferences for admin
  }
}
```

### Running Seeds

```bash
# Development
npm run seed:dev

# Staging
npm run seed:staging

# Production (first deploy only)
npm run seed:prod
```

---

## Rollback Procedures

### Single Migration Revert

```bash
# Revert the last migration
npm run migration:revert

# Check what the current state is
npm run migration:show
```

### Multiple Migration Revert

```bash
# Revert the last 3 migrations (run revert 3 times)
npm run migration:revert && npm run migration:revert && npm run migration:revert
```

### Emergency Rollback

For critical production issues:

1. **Identify the breaking migration:**
   ```bash
   npm run migration:show
   ```

2. **Revert to a known good state:**
   ```bash
   # Revert one at a time until stable
   npm run migration:revert
   ```

3. **Deploy the previous application version** (the app must be compatible with the reverted schema).

4. **Investigate and fix** the migration in a new branch.

### Rollback Safety Rules

- **Never revert a migration that dropped a column with data.** The data is gone. Restore from backup if needed.
- **Never revert a migration that dropped a table.** Same reason.
- **Enum value additions cannot be reverted** in PostgreSQL. The value remains but is unused.
- **Always test down migrations** in development before deploying up migrations to production.

---

## Zero-Downtime Migration Approach

Production deployments use the **expand/contract** pattern to avoid downtime:

### Phase 1: Expand (Compatible with Old and New Code)

```
Old Code Running  -->  Run Expand Migration  -->  Old Code Still Works
```

**Expand migrations** only add things:
- Add new columns (with defaults or nullable)
- Add new tables
- Add new indexes (CONCURRENTLY)
- Add new enum values

**Rules:**
- New columns must be `NULL` or have a `DEFAULT` value
- No column renames
- No column type changes
- No column drops
- No NOT NULL constraints on existing data

### Phase 2: Deploy New Code

```
Run Expand Migration  -->  Deploy New Code  -->  New Code Reads/Writes New Columns
```

The new application code starts using the new columns/tables. Both old and new data formats work.

### Phase 3: Backfill (If Needed)

```
Deploy New Code  -->  Run Backfill Job  -->  Existing Data Updated
```

If new columns need data from existing rows, a background job populates them.

### Phase 4: Contract (Clean Up)

```
Backfill Complete  -->  Run Contract Migration  -->  Remove Old Columns/Constraints
```

**Contract migrations** remove things:
- Drop old columns that are no longer used
- Add NOT NULL constraints (after backfill)
- Drop old indexes
- Rename columns (if needed, via a new column + backfill + drop old)

### Example: Adding a Required Column

**Bad approach (downtime):**
```sql
-- This locks the table and fails if existing rows exist
ALTER TABLE articles ADD COLUMN read_time_minutes SMALLINT NOT NULL;
```

**Good approach (zero-downtime):**

**Migration 1 (Expand):**
```sql
-- Nullable column with no default -- no lock, no data validation
ALTER TABLE articles ADD COLUMN read_time_minutes SMALLINT;
```

**Deploy new code** that writes `read_time_minutes` for new articles.

**Migration 2 (Backfill):**
```sql
-- Run as a background job, not in a migration (to avoid long transactions)
UPDATE articles SET read_time_minutes = CEIL(
  array_length(regexp_split_to_array(body, '\s+'), 1) / 200.0
)
WHERE read_time_minutes IS NULL;
```

**Migration 3 (Contract):**
```sql
ALTER TABLE articles ALTER COLUMN read_time_minutes SET NOT NULL;
```

### Concurrent Index Creation

For production databases, always create indexes concurrently to avoid locking:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // CONCURRENTLY prevents table lock but cannot run inside a transaction
  await queryRunner.query(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_fts
      ON articles USING gin (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
      );
  `);
}
```

**Important:** `CREATE INDEX CONCURRENTLY` cannot run inside a transaction. TypeORM migrations run inside transactions by default. To use CONCURRENTLY:

```typescript
export class AddArticlesFtsIndex implements MigrationInterface {
  // Disable transaction for this migration
  transaction = false as const;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_fts
        ON articles USING gin (
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_articles_fts;`);
  }
}
```

---

## Pre-Deployment Checklist

Before running migrations in production:

- [ ] All migrations have both `up()` and `down()` methods
- [ ] `down()` exactly reverses `up()` (tested in development)
- [ ] No `synchronize: true` in production config
- [ ] New columns are nullable or have defaults (expand phase)
- [ ] Indexes use `CONCURRENTLY` where table size > 100K rows
- [ ] Migration tested against a staging database with production-like data
- [ ] Backup taken before migration run
- [ ] Application code is compatible with both pre- and post-migration schema
- [ ] Migration execution time estimated (for large tables, consider batched updates)
- [ ] Rollback plan documented and tested

---

## Database Backup Strategy

| Environment | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| Production | Daily full + continuous WAL archiving | 30 days | pg_basebackup + WAL-G |
| Staging | Weekly | 7 days | pg_dump |
| Development | None (reproducible via migrations + seeds) | -- | -- |

**Pre-migration backups:**
```bash
# Always take a backup before production migrations
pg_dump -Fc -f backup_$(date +%Y%m%d_%H%M%S).dump iloveberlin
```
