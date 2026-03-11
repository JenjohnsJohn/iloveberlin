# Local Development Setup

This guide walks you through setting up the ILoveBerlin development environment on your local machine. By the end, you will have the Next.js frontend, NestJS API, PostgreSQL database, and Meilisearch all running locally.

---

## Prerequisites

Install the following before proceeding:

| Tool | Minimum Version | Installation |
|---|---|---|
| **Node.js** | 20.x LTS | [nodejs.org](https://nodejs.org/) or via `nvm install 20` |
| **pnpm** | 9.x | `corepack enable && corepack prepare pnpm@latest --activate` |
| **Docker** | 24.x + Docker Compose v2 | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com/) |
| **Flutter** (optional) | 3.x | [flutter.dev](https://flutter.dev/docs/get-started/install) (only needed for mobile development) |

### Verify Prerequisites

```bash
node --version      # v20.x.x
pnpm --version      # 9.x.x
docker --version    # Docker version 24.x.x
docker compose version  # Docker Compose version v2.x.x
git --version       # git version 2.4x.x
```

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone git@github.com:iloveberlin/iloveberlin.git
cd iloveberlin
```

If you do not have SSH keys configured, use HTTPS:

```bash
git clone https://github.com/iloveberlin/iloveberlin.git
cd iloveberlin
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for all workspaces (`apps/web`, `apps/api`, `packages/*`) thanks to pnpm workspaces.

### 3. Configure Environment Variables

```bash
# Copy the example env files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Open each `.env` file and review the values. The defaults work for local development, but you may need to set:

| Variable | Location | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | `apps/api/.env` | `postgresql://iloveberlin:iloveberlin@localhost:5432/iloveberlin` | Matches Docker Compose config |
| `MEILISEARCH_HOST` | `apps/api/.env` | `http://localhost:7700` | Matches Docker Compose config |
| `MEILISEARCH_API_KEY` | `apps/api/.env` | `iloveberlin_dev_key` | Development key |
| `NEXT_PUBLIC_API_URL` | `apps/web/.env.local` | `http://localhost:3001` | Points frontend to local API |
| `JWT_SECRET` | `apps/api/.env` | `dev-secret-change-in-production` | Any string for local dev |

> **Never commit `.env` files.** They are listed in `.gitignore`.

### 4. Start Docker Services

Docker Compose runs PostgreSQL, Meilisearch, and any other infrastructure services:

```bash
docker compose up -d
```

This starts:

| Service | Port | Description |
|---|---|---|
| PostgreSQL | 5432 | Primary database |
| Meilisearch | 7700 | Full-text search engine |
| Redis (if configured) | 6379 | Caching and session store |
| Mailpit (if configured) | 8025 | Email testing UI |

Verify services are running:

```bash
docker compose ps
```

All services should show status `running` or `Up`.

### 5. Run Database Migrations

```bash
pnpm --filter api migration:run
```

This applies all pending TypeORM migrations to your local PostgreSQL database, creating the schema.

### 6. Seed the Database

```bash
pnpm --filter api seed
```

This populates the database with sample data: test users, articles, events, restaurants, and neighborhoods. Useful for development and testing.

**Default test accounts after seeding:**

| Email | Password | Role |
|---|---|---|
| `admin@iloveberlin.biz` | `Admin123!` | Admin |
| `creator@iloveberlin.biz` | `Creator123!` | Creator |
| `user@iloveberlin.biz` | `User123!` | User |

### 7. Start Development Servers

Start all apps simultaneously from the monorepo root:

```bash
pnpm dev
```

Or start them individually:

```bash
# Frontend only
pnpm --filter web dev

# API only
pnpm --filter api dev

# Both (using turbo)
pnpm turbo dev
```

### 8. Access the Application

| Service | URL | Description |
|---|---|---|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Next.js web application |
| **API** | [http://localhost:3001](http://localhost:3001) | NestJS REST API |
| **Swagger Docs** | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) | Interactive API documentation |
| **Meilisearch Dashboard** | [http://localhost:7700](http://localhost:7700) | Search engine admin UI |
| **Mailpit UI** | [http://localhost:8025](http://localhost:8025) | Captured emails (dev only) |

---

## Common Development Tasks

### Generating a New Migration

After modifying a TypeORM entity:

```bash
pnpm --filter api migration:generate src/database/migrations/DescriptiveName
```

### Creating a New NestJS Module

```bash
cd apps/api
pnpm nest generate module modules/feature-name
pnpm nest generate controller modules/feature-name
pnpm nest generate service modules/feature-name
```

### Running Tests

```bash
# All tests
pnpm test

# Specific workspace
pnpm --filter web test
pnpm --filter api test

# Watch mode
pnpm --filter api test:watch

# E2E tests (API)
pnpm --filter api test:e2e

# Coverage
pnpm --filter api test:cov
```

### Linting and Formatting

```bash
# Lint all workspaces
pnpm lint

# Fix auto-fixable lint issues
pnpm lint:fix

# Format with Prettier
pnpm format

# Check formatting without writing
pnpm format:check
```

### Rebuilding Docker Services

If you change Docker-related files or need a fresh database:

```bash
# Stop and remove containers + volumes (resets database)
docker compose down -v

# Rebuild and start
docker compose up -d --build

# Re-run migrations and seed
pnpm --filter api migration:run
pnpm --filter api seed
```

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update a specific package
pnpm --filter web add next@latest

# Update all packages (review changes carefully)
pnpm update --recursive
```

---

## Troubleshooting

### Port Already in Use

**Symptom:** `Error: listen EADDRINUSE :::3000` or similar.

**Fix:**

```bash
# Find the process using the port
lsof -i :3000

# Kill it
kill -9 <PID>
```

Or change the port in your `.env` file.

### Docker Services Not Starting

**Symptom:** `docker compose up` fails or containers exit immediately.

**Fix:**

```bash
# Check logs
docker compose logs postgres
docker compose logs meilisearch

# Common cause: port conflict. Check if another PostgreSQL is running.
lsof -i :5432

# Reset everything
docker compose down -v
docker compose up -d
```

### Database Connection Refused

**Symptom:** API fails with `ECONNREFUSED 127.0.0.1:5432`.

**Fix:**

1. Verify PostgreSQL is running: `docker compose ps`
2. Verify the `DATABASE_URL` in `apps/api/.env` matches Docker Compose config.
3. Wait a few seconds after `docker compose up` -- PostgreSQL may still be initializing.
4. Try connecting directly: `docker compose exec postgres psql -U iloveberlin -d iloveberlin`

### Migration Errors

**Symptom:** `migration:run` fails with a SQL error.

**Fix:**

```bash
# Check migration status
pnpm --filter api migration:show

# If the database is in a bad state, reset it (development only!)
docker compose down -v
docker compose up -d
pnpm --filter api migration:run
pnpm --filter api seed
```

### Node Module Issues

**Symptom:** Missing modules, version mismatches, or strange build errors after pulling new code.

**Fix:**

```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Meilisearch Index Out of Sync

**Symptom:** Search returns stale or no results.

**Fix:**

```bash
# Re-index all data
pnpm --filter api search:reindex
```

### Hot Reload Not Working (Next.js)

**Symptom:** Changes to `.tsx` files do not appear in the browser.

**Fix:**

1. Check that you saved the file.
2. Try a hard refresh: `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux).
3. Delete the Next.js cache: `rm -rf apps/web/.next`
4. Restart the dev server.

### Flutter Setup (Mobile)

If you are working on the mobile app:

```bash
cd apps/mobile
flutter pub get
flutter run
```

Ensure you have an iOS Simulator or Android Emulator running, or a physical device connected.

---

## IDE Setup

### VS Code (Recommended)

Install these extensions:

- **ESLint** -- Lint on save
- **Prettier** -- Format on save
- **Tailwind CSS IntelliSense** -- Autocomplete for Tailwind classes
- **TypeScript Importer** -- Auto-import suggestions
- **Docker** -- Container management
- **Thunder Client** or **REST Client** -- API testing

Workspace settings (`.vscode/settings.json`):

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

### JetBrains (WebStorm / IntelliJ)

1. Enable ESLint: **Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint > Automatic**.
2. Enable Prettier: **Settings > Languages & Frameworks > JavaScript > Prettier > On save**.
3. Install the **Tailwind CSS** plugin from the JetBrains Marketplace.

---

## Environment Architecture Diagram

```
Your Machine
  |
  |-- apps/web (Next.js)           :3000
  |     |
  |     +-- calls API at           :3001
  |
  |-- apps/api (NestJS)            :3001
  |     |
  |     +-- connects to PostgreSQL :5432 (Docker)
  |     +-- connects to Meilisearch:7700 (Docker)
  |     +-- connects to Redis      :6379 (Docker, optional)
  |
  |-- Docker Compose
        |-- postgres               :5432
        |-- meilisearch            :7700
        |-- redis                  :6379
        |-- mailpit                :8025
```

You are now ready to develop. Head to the [Coding Standards](./coding-standards.md) guide to understand our conventions before writing your first line of code.
