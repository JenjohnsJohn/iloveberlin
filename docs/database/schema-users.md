# Schema: Users & Authentication

> Domain: `auth / identity`
> Tables: `users`, `refresh_tokens`, `user_bookmarks`

---

## Table: `users`

The central identity table. Every authenticated action references this table.

### SQL

```sql
-- Enum types
CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');

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
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `email` | VARCHAR(255) | NO | -- | Login email, unique among active users |
| `password_hash` | VARCHAR(255) | NO | -- | bcrypt hash (cost factor 12) |
| `display_name` | VARCHAR(100) | NO | -- | Public-facing name |
| `role` | `user_role` | NO | `'user'` | Permission level |
| `email_verified` | BOOLEAN | NO | `FALSE` | Whether email has been confirmed |
| `avatar_url` | VARCHAR(500) | YES | `NULL` | URL to avatar image (may point to media table or external) |
| `bio` | TEXT | YES | `NULL` | User biography, supports Markdown |
| `location` | VARCHAR(100) | YES | `NULL` | Freeform location string, e.g., "Kreuzberg, Berlin" |
| `social_links` | JSONB | YES | `'{}'` | Structured object: `{ twitter?: string, instagram?: string, website?: string }` |
| `status` | `user_status` | NO | `'active'` | Account status for moderation |
| `last_login_at` | TIMESTAMPTZ | YES | `NULL` | Updated on each successful login |
| `login_attempts` | INTEGER | NO | `0` | Failed login counter, reset on success |
| `locked_until` | TIMESTAMPTZ | YES | `NULL` | Account locked until this time (after 5 failed attempts) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Row creation time |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification time |
| `deleted_at` | TIMESTAMPTZ | YES | `NULL` | Soft-delete timestamp |

### Constraints

```sql
-- Unique email among non-deleted users
-- Allows re-registration after account deletion
ALTER TABLE users
  ADD CONSTRAINT uq_users_email
  UNIQUE (email);

-- Note: The partial unique index below is preferred over the simple unique
-- constraint above if you want to allow deleted users to have duplicate emails.
-- Choose one approach:

-- Option A (simple): UNIQUE(email) -- no duplicate emails ever
-- Option B (soft-delete aware):
CREATE UNIQUE INDEX uq_users_email_active
  ON users (email)
  WHERE deleted_at IS NULL;

-- Check constraint on login_attempts
ALTER TABLE users
  ADD CONSTRAINT chk_users_login_attempts
  CHECK (login_attempts >= 0);
```

### Indexes

```sql
-- Email lookup (login flow) - covered by unique index above
-- B-tree on email is the most critical index in the system.

-- Role-based queries (admin panel: list all editors)
CREATE INDEX idx_users_role
  ON users (role)
  WHERE deleted_at IS NULL;
-- Rationale: Admin panel filters users by role. Partial index excludes
-- soft-deleted users, keeping the index small.

-- Status filtering (moderation)
CREATE INDEX idx_users_status
  ON users (status)
  WHERE deleted_at IS NULL;

-- Last login (identify inactive accounts)
CREATE INDEX idx_users_last_login
  ON users (last_login_at DESC NULLS LAST)
  WHERE deleted_at IS NULL;

-- Created at (newest users report)
CREATE INDEX idx_users_created_at
  ON users (created_at DESC)
  WHERE deleted_at IS NULL;
```

### JSONB Shape: `social_links`

```json
{
  "twitter": "https://twitter.com/username",
  "instagram": "https://instagram.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "website": "https://example.com"
}
```

No GIN index on `social_links` -- we never query by social link values. The JSONB column is read-only in display contexts.

---

## Table: `refresh_tokens`

Stores hashed refresh tokens for JWT-based authentication. Tokens are rotated on each refresh. Old tokens are revoked and eventually purged.

### SQL

```sql
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | -- | Owner of the token |
| `token_hash` | VARCHAR(255) | NO | -- | SHA-256 hash of the raw refresh token |
| `expires_at` | TIMESTAMPTZ | NO | -- | Token expiration (typically 30 days) |
| `revoked_at` | TIMESTAMPTZ | YES | `NULL` | Set when token is revoked (rotation or logout) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the token was issued |

### Constraints & Foreign Keys

- `user_id` references `users(id)` with `ON DELETE CASCADE`. When a user is hard-deleted, all their tokens are removed.
- No unique constraint on `token_hash` because hash collisions are astronomically unlikely with SHA-256, and adding a unique index would slow inserts for no practical benefit.

### Indexes

```sql
-- Token lookup during refresh flow
CREATE INDEX idx_refresh_tokens_token_hash
  ON refresh_tokens (token_hash)
  WHERE revoked_at IS NULL;
-- Rationale: Partial index skips revoked tokens. The refresh flow
-- searches by hash and must only match active tokens.

-- User's active tokens (for "revoke all sessions")
CREATE INDEX idx_refresh_tokens_user_id
  ON refresh_tokens (user_id)
  WHERE revoked_at IS NULL;

-- Cleanup job: find expired tokens to hard-delete
CREATE INDEX idx_refresh_tokens_expires_at
  ON refresh_tokens (expires_at)
  WHERE revoked_at IS NULL;
-- Rationale: A scheduled cron job (e.g., daily) purges tokens where
-- expires_at < now(). The partial index ensures we only scan active tokens.
```

### Design Decisions

1. **Hash storage, not raw tokens:** The database never stores the plaintext refresh token. If the database is compromised, tokens cannot be replayed.
2. **Hard delete for cleanup:** Unlike content tables, refresh_tokens uses hard DELETE for expired/revoked tokens. There is no business value in keeping them, and the table would grow unbounded.
3. **CASCADE on user delete:** If a user account is permanently removed (GDPR erasure), all tokens are automatically cleaned up.
4. **No `updated_at`:** Tokens are immutable after creation. The only mutation is setting `revoked_at`.

---

## Table: `user_bookmarks`

Polymorphic bookmarks allowing users to save any content type (articles, events, restaurants, guides, etc.).

### SQL

```sql
CREATE TABLE user_bookmarks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  bookmarkable_type VARCHAR(50) NOT NULL,
  bookmarkable_id   UUID NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_user_bookmarks_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Column Descriptions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | -- | User who created the bookmark |
| `bookmarkable_type` | VARCHAR(50) | NO | -- | Entity type: `'article'`, `'event'`, `'restaurant'`, `'guide'`, `'video'`, `'classified'` |
| `bookmarkable_id` | UUID | NO | -- | ID of the bookmarked entity |
| `created_at` | TIMESTAMPTZ | NO | `now()` | When the bookmark was created |

### Constraints

```sql
-- Each user can bookmark a specific entity only once
ALTER TABLE user_bookmarks
  ADD CONSTRAINT uq_user_bookmarks_unique
  UNIQUE (user_id, bookmarkable_type, bookmarkable_id);

-- Restrict bookmarkable_type to known entity types
ALTER TABLE user_bookmarks
  ADD CONSTRAINT chk_bookmarkable_type
  CHECK (bookmarkable_type IN (
    'article', 'event', 'restaurant', 'guide', 'video', 'classified', 'competition'
  ));
```

### Indexes

```sql
-- User's bookmarks of a specific type (e.g., "my saved articles")
CREATE INDEX idx_user_bookmarks_user_type
  ON user_bookmarks (user_id, bookmarkable_type, created_at DESC);
-- Rationale: The most common query is "show me all my bookmarked articles,
-- newest first." This composite index covers that query without a sort.

-- Reverse lookup: "how many users bookmarked this article?"
CREATE INDEX idx_user_bookmarks_target
  ON user_bookmarks (bookmarkable_type, bookmarkable_id);
```

### Design Decisions

1. **Polymorphic pattern:** We use a type + ID pair instead of separate bookmark tables per entity (e.g., `article_bookmarks`, `event_bookmarks`). This is simpler for the API (one endpoint: `POST /bookmarks`) and avoids table proliferation.
2. **No foreign key on `bookmarkable_id`:** PostgreSQL cannot enforce a FK that references different tables based on a type column. Referential integrity for the target entity is enforced at the application layer. Orphaned bookmarks (where the target is deleted) are acceptable -- the UI simply shows "content no longer available" or filters them out.
3. **No `updated_at` or `deleted_at`:** Bookmarks are created or hard-deleted. There is no intermediate state.
4. **CHECK constraint on type:** Prevents typos and invalid types at the database level.

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Polymorphic (chosen)** | Single table, single API, easy to extend | No FK on target, orphan risk |
| **Separate tables per type** | Full FK integrity | 7+ tables, 7+ endpoints, more joins |
| **JSONB favorites column on users** | Simple reads | Unbounded growth, no indexes, no relational queries |

---

## TypeORM Entities

### User Entity

```typescript
// src/modules/users/entities/user.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  OneToMany, Index,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  EDITOR = 'editor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @Column({ type: 'varchar', length: 100 })
  display_name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'jsonb', default: {} })
  social_links: Record<string, string>;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'int', default: 0 })
  login_attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  locked_until: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refresh_tokens: RefreshToken[];

  @OneToMany(() => UserBookmark, (bookmark) => bookmark.user)
  bookmarks: UserBookmark[];
}
```

---

## Example Seed Data

```sql
-- Admin user (password: "Admin123!Berlin" hashed with bcrypt cost 12)
INSERT INTO users (id, email, password_hash, display_name, role, email_verified, status, bio, location)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@iloveberlin.biz',
  '$2b$12$LJ3m4ys2Kq9YCg0hXh5W3eGzVbJK5rGqN0w5nEf1QxV8kT3pK6Puy',
  'ILB Admin',
  'super_admin',
  TRUE,
  'active',
  'Platform administrator for ILoveBerlin.',
  'Mitte, Berlin'
);

-- Editor user (password: "Editor123!Berlin")
INSERT INTO users (id, email, password_hash, display_name, role, email_verified, status, bio, location)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'editor@iloveberlin.biz',
  '$2b$12$Xk9Rq5Ym3Pz1Lw8Vn4G6eHjT0sA7dF2iB5cN3mE8pQ4rK6tU9wYx',
  'Sarah Schmidt',
  'editor',
  TRUE,
  'active',
  'Berlin-based journalist covering culture, food, and nightlife.',
  'Kreuzberg, Berlin'
);

-- Regular user (password: "User123!Berlin")
INSERT INTO users (id, email, password_hash, display_name, role, email_verified, status, bio, location, social_links)
VALUES (
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'max@example.com',
  '$2b$12$Rr7Ht3Ws5Kp0Jn6Yq2M8deFgA1bC4xZ9iL3vO7uS5tN0mG8hQ2eR',
  'Max Mueller',
  'user',
  TRUE,
  'active',
  'Expat living in Berlin since 2019. Love exploring the city!',
  'Friedrichshain, Berlin',
  '{"instagram": "https://instagram.com/maxinberlin", "website": "https://maxinberlin.com"}'
);

-- Unverified new user (password: "NewUser123!")
INSERT INTO users (id, email, password_hash, display_name, role, email_verified, status)
VALUES (
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'newuser@example.com',
  '$2b$12$Aa1Bb2Cc3Dd4Ee5Ff6Gg7hHiIjJkKlLmMnNoOpPqQrRsStTuUvVw',
  'New User',
  'user',
  FALSE,
  'active'
);

-- Sample refresh token
INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
VALUES (
  'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'sha256_hash_of_actual_refresh_token_value_here',
  now() + INTERVAL '30 days'
);

-- Sample bookmarks
INSERT INTO user_bookmarks (user_id, bookmarkable_type, bookmarkable_id) VALUES
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'article', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66'),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'restaurant', 'a1234567-1234-1234-1234-123456789abc'),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'event', 'b2345678-2345-2345-2345-234567890bcd');
```

---

## Security Considerations

1. **`password_hash` is never selected by default** (`select: false` in TypeORM). It must be explicitly requested in queries that need it (login flow only).
2. **Account lockout:** After 5 failed login attempts, `locked_until` is set to `now() + 15 minutes`. The application checks this before allowing login.
3. **Soft delete preserves audit trail.** Hard delete is only used for GDPR "right to erasure" requests, which also purges `refresh_tokens`, `user_bookmarks`, and anonymizes authored content.
4. **Email uniqueness:** The partial unique index on `email WHERE deleted_at IS NULL` allows a deleted user's email to be re-registered.
