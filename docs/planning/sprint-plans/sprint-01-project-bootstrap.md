# Sprint 1: Project Bootstrap

| Field              | Value                                      |
| ------------------ | ------------------------------------------ |
| **Sprint Number**  | 1                                          |
| **Sprint Name**    | Project Bootstrap                          |
| **Duration**       | 2 weeks (10 working days)                  |
| **Dates**          | Week 1 -- Week 2 (Days 1--10 from project start) |
| **Team**           | 1 Backend, 1 Frontend, 1 DevOps / Infra    |

---

## Sprint Goal

> Stand up the complete local development environment, CI pipeline, and staging server so that every team member can clone the repo, run `docker compose up`, and hit a live health-check endpoint within minutes. Establish coding standards, project structure, and deployment pipeline that will carry the project through all subsequent sprints.

---

## User Stories

### US-1.1 -- Developer Environment Setup
**As a** developer,
**I want** a single command to start the full local stack (API, web, database),
**so that** I can begin feature work without manual configuration.

**Acceptance Criteria:**
- [ ] `git clone` followed by `docker compose up` starts all services
- [ ] API is reachable at `http://localhost:3001`
- [ ] Web app is reachable at `http://localhost:3000`
- [ ] PostgreSQL is accessible at `localhost:5432` with seeded config
- [ ] Hot-reload works for both Next.js and NestJS
- [ ] README documents setup in under 5 minutes of reading

### US-1.2 -- Code Quality Enforcement
**As a** tech lead,
**I want** automated linting, formatting, and type checking on every commit and PR,
**so that** the codebase stays consistent from day one.

**Acceptance Criteria:**
- [ ] ESLint runs on `apps/` and `packages/` with zero errors on clean repo
- [ ] Prettier formats all `.ts`, `.tsx`, `.json`, `.md` files
- [ ] Pre-commit hook runs lint + format check
- [ ] CI fails on any lint or type error

### US-1.3 -- Health Check and API Documentation
**As a** developer / DevOps engineer,
**I want** a `/health` endpoint and auto-generated Swagger docs,
**so that** I can verify the API is running and explore available endpoints.

**Acceptance Criteria:**
- [ ] `GET /api/health` returns `{ "status": "ok", "timestamp": "<ISO>" }`
- [ ] Swagger UI available at `/api/docs` in non-production environments
- [ ] Response time for health check < 100 ms

### US-1.4 -- Continuous Integration Pipeline
**As a** developer,
**I want** GitHub Actions to validate every PR,
**so that** broken code never reaches the main branch.

**Acceptance Criteria:**
- [ ] CI runs lint, type-check, and unit tests
- [ ] CI builds Docker images successfully
- [ ] CI completes in under 5 minutes
- [ ] Branch protection requires CI pass before merge

### US-1.5 -- Staging Deployment
**As a** product owner,
**I want** a staging environment on Hetzner behind Cloudflare,
**so that** I can preview work before it goes to production.

**Acceptance Criteria:**
- [ ] Staging API reachable at `https://api.staging.iloveberlin.biz`
- [ ] Staging web reachable at `https://staging.iloveberlin.biz`
- [ ] SSL/TLS via Cloudflare (Full Strict mode)
- [ ] Deploys triggered on merge to `main`

### US-1.6 -- Base Frontend Layout
**As a** user,
**I want** to see a branded landing page with header, footer, and navigation shell,
**so that** future pages can be built inside a consistent layout.

**Acceptance Criteria:**
- [ ] Header with ILoveBerlin logo, placeholder nav links
- [ ] Footer with copyright, placeholder links
- [ ] Responsive breakpoints: mobile (< 768 px), tablet (768--1024 px), desktop (> 1024 px)
- [ ] Page transitions do not cause layout shift (CLS < 0.1)

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1--5)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **1** | B-1.1 Initialize Turborepo monorepo, configure workspaces | F-1.1 Scaffold Next.js 14 app in `apps/web` | D-1.1 Create `docker-compose.yml` with PostgreSQL 16 service |
| **2** | B-1.2 Scaffold NestJS app in `apps/api` with TypeORM | F-1.2 Configure Tailwind CSS, base theme tokens | D-1.2 Add API and web Dockerfiles (multi-stage) |
| **3** | B-1.3 Configure TypeORM data source, migration runner | F-1.3 Create shared UI package `packages/ui` | D-1.3 Docker Compose full stack (api + web + db + volumes) |
| **4** | B-1.4 Implement `/api/health` endpoint with DB ping | F-1.4 Build base layout: Header, Footer, `<MainLayout>` | D-1.4 ESLint + Prettier shared configs in `packages/config` |
| **5** | B-1.5 Integrate Swagger (OpenAPI 3.0) with decorators | F-1.5 Create API client layer (`packages/api-client`) | D-1.5 Husky pre-commit hooks: lint-staged |

### Week 2 (Days 6--10)

| Day | Backend Tasks | Frontend Tasks | DevOps / Infra Tasks |
| --- | ------------- | -------------- | -------------------- |
| **6** | B-1.6 Shared DTOs / types package `packages/shared` | F-1.6 Wire API client to health endpoint, display status | D-1.6 GitHub Actions CI: lint + typecheck + build |
| **7** | B-1.7 Environment config module (validation with Joi) | F-1.7 Responsive testing & polish, favicon, meta tags | D-1.7 Provision Hetzner staging server (Docker, Traefik) |
| **8** | B-1.8 Logging module (structured JSON, request IDs) | F-1.8 Error boundary, 404 page, loading states | D-1.8 Cloudflare DNS records, SSL config |
| **9** | QA-1.1 Unit tests for health endpoint + config module | QA-1.2 Lighthouse baseline, component smoke tests | D-1.9 Deployment script (SSH + Docker Compose pull) |
| **10** | QA-1.3 Integration test: full Docker stack boots clean | QA-1.4 Cross-browser check (Chrome, Firefox, Safari) | D-1.10 Branch protection rules, CI required status checks |

---

## Backend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| B-1.1 | Initialize Turborepo monorepo | - `npx create-turbo@latest` with pnpm workspaces | 3 h |
|        |  | - Configure `turbo.json` pipeline (build, dev, lint, test) | |
|        |  | - Root `package.json` scripts | |
| B-1.2 | Scaffold NestJS app | - `nest new api` inside `apps/` | 4 h |
|        |  | - Install TypeORM, `@nestjs/typeorm`, `pg` driver | |
|        |  | - Configure `app.module.ts` with async TypeORM config | |
| B-1.3 | TypeORM configuration | - Create `ormconfig.ts` with env vars | 3 h |
|        |  | - Set up migration directory `apps/api/src/migrations` | |
|        |  | - Write + run initial migration (empty, validates connection) | |
| B-1.4 | Health check endpoint | - `HealthModule` with `HealthController` | 2 h |
|        |  | - DB health indicator (TypeORM `query('SELECT 1')`) | |
|        |  | - Return `{ status, timestamp, version, uptime }` | |
| B-1.5 | Swagger integration | - Install `@nestjs/swagger`, `swagger-ui-express` | 2 h |
|        |  | - Configure in `main.ts` with title, version, bearer auth | |
|        |  | - Verify Swagger UI loads at `/api/docs` | |
| B-1.6 | Shared packages | - `packages/shared`: DTOs, interfaces, constants | 3 h |
|        |  | - TypeScript project references, path aliases | |
| B-1.7 | Environment config | - `@nestjs/config` with Joi validation schema | 2 h |
|        |  | - `.env.example` with all required vars documented | |
|        |  | - Fail-fast on missing required env vars | |
| B-1.8 | Logging module | - Winston or Pino structured logger | 2 h |
|        |  | - Request-scoped correlation ID middleware | |
|        |  | - Log levels by environment (debug in dev, info in prod) | |

**Backend Total: 21 hours**

---

## Frontend Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| F-1.1 | Scaffold Next.js 14 app | - `create-next-app` with App Router, TypeScript | 2 h |
|        |  | - Configure `next.config.js` for Turborepo transpile | |
| F-1.2 | Tailwind CSS setup | - Install Tailwind, PostCSS, autoprefixer | 3 h |
|        |  | - Define design tokens: colors, spacing, typography | |
|        |  | - Global styles, CSS reset | |
| F-1.3 | Shared UI package | - `packages/ui` with tsconfig, Tailwind preset | 3 h |
|        |  | - Button, Container, Typography components | |
|        |  | - Storybook-ready exports (Storybook deferred to later) | |
| F-1.4 | Base layout | - `<Header>`: logo, nav links, mobile hamburger | 4 h |
|        |  | - `<Footer>`: links, copyright, social icons | |
|        |  | - `<MainLayout>` wrapper, skip-to-content link | |
| F-1.5 | API client layer | - Axios instance with base URL, interceptors | 3 h |
|        |  | - Type-safe wrapper functions | |
|        |  | - Error handling / retry logic | |
| F-1.6 | Health status wiring | - Fetch `/api/health` on homepage | 1 h |
|        |  | - Display connection status badge (dev only) | |
| F-1.7 | Responsive polish | - Test all breakpoints, fix layout issues | 2 h |
|        |  | - Favicon, `<meta>` tags, `manifest.json` | |
| F-1.8 | Error handling | - Global error boundary component | 2 h |
|        |  | - Custom 404 page with ILoveBerlin branding | |
|        |  | - Loading skeleton components | |

**Frontend Total: 20 hours**

---

## DevOps / Infrastructure Tasks -- Detail

| ID | Task | Sub-tasks | Estimate |
| -- | ---- | --------- | -------- |
| D-1.1 | Docker Compose -- database | - PostgreSQL 16 service with named volume | 1 h |
|        |  | - Init script for dev database + user | |
| D-1.2 | Dockerfiles | - API: multi-stage (deps -> build -> runtime) | 3 h |
|        |  | - Web: multi-stage with Next.js standalone output | |
|        |  | - `.dockerignore` files | |
| D-1.3 | Docker Compose -- full stack | - Add api, web services with depends_on | 2 h |
|        |  | - Bind mounts for hot reload in dev | |
|        |  | - Health check probes for each service | |
| D-1.4 | Linting config | - Shared ESLint config extending Airbnb + TypeScript | 2 h |
|        |  | - Shared Prettier config | |
|        |  | - `packages/config/eslint` and `packages/config/prettier` | |
| D-1.5 | Pre-commit hooks | - Husky install, `.husky/pre-commit` | 1 h |
|        |  | - lint-staged for `*.ts`, `*.tsx` | |
| D-1.6 | GitHub Actions CI | - `.github/workflows/ci.yml` | 3 h |
|        |  | - Jobs: lint, typecheck, test, build | |
|        |  | - pnpm cache, Turborepo remote cache (optional) | |
| D-1.7 | Hetzner staging server | - Provision CX31 (4 vCPU, 8 GB) | 4 h |
|        |  | - Install Docker, Docker Compose, Traefik reverse proxy | |
|        |  | - Firewall rules (22, 80, 443) | |
| D-1.8 | Cloudflare DNS + SSL | - A record for staging subdomain | 1 h |
|        |  | - SSL mode: Full (Strict), origin certificate | |
| D-1.9 | Deployment script | - `scripts/deploy-staging.sh` | 2 h |
|        |  | - SSH, pull images, `docker compose up -d` | |
|        |  | - Rollback support (keep previous image tag) | |
| D-1.10 | Branch protection | - Require CI pass, 1 approval, no force push to main | 1 h |

**DevOps Total: 20 hours**

---

## QA Tasks

| ID | Test Scenario | Type | Estimate |
| -- | ------------- | ---- | -------- |
| QA-1.1 | Health endpoint returns 200 with valid JSON schema | Unit | 2 h |
| QA-1.2 | Lighthouse scores: Performance > 90, Accessibility > 90 | Performance | 2 h |
| QA-1.3 | `docker compose up` from clean clone boots all services | Integration | 2 h |
| QA-1.4 | Layout renders correctly on Chrome, Firefox, Safari (latest) | Cross-browser | 2 h |
| QA-1.5 | CI pipeline passes on a clean PR | Smoke | 1 h |
| QA-1.6 | Staging deployment: health endpoint reachable via HTTPS | Smoke | 1 h |

**QA Total: 10 hours**

---

## Dependencies

```
B-1.1 (Turborepo init)
 +-- B-1.2 (NestJS scaffold) -- depends on monorepo structure
 |    +-- B-1.3 (TypeORM config) -- depends on NestJS app
 |    |    +-- B-1.4 (Health check) -- depends on DB connection
 |    |         +-- B-1.5 (Swagger) -- depends on at least one endpoint
 |    +-- B-1.7 (Config module) -- depends on NestJS app
 |    +-- B-1.8 (Logging) -- depends on NestJS app
 +-- F-1.1 (Next.js scaffold) -- depends on monorepo structure
 |    +-- F-1.2 (Tailwind) -- depends on Next.js app
 |    +-- F-1.4 (Layout) -- depends on F-1.2 + F-1.3
 +-- F-1.3 (UI package) -- depends on monorepo structure
 +-- F-1.5 (API client) -- depends on monorepo structure
 +-- B-1.6 (Shared package) -- depends on monorepo structure

D-1.1 (DB Docker) -- independent
D-1.2 (Dockerfiles) -- depends on B-1.2 and F-1.1
D-1.3 (Full compose) -- depends on D-1.1 + D-1.2
D-1.6 (CI) -- depends on D-1.4 (lint config)
D-1.7 (Hetzner) -- independent
D-1.8 (Cloudflare) -- depends on D-1.7
D-1.9 (Deploy script) -- depends on D-1.7 + D-1.3
```

---

## Risk Items

| # | Risk | Likelihood | Impact | Mitigation |
| - | ---- | ---------- | ------ | ---------- |
| R-1 | Turborepo workspace resolution issues with NestJS | Medium | High | Test early on Day 1; fallback to Nx if blocked > 4 h |
| R-2 | Docker hot-reload performance on macOS (bind mounts) | Medium | Medium | Use Docker Desktop VirtioFS; document `WATCHPACK_POLLING` flag |
| R-3 | Hetzner provisioning delays | Low | Medium | Order server on Day 1; use local Docker as fallback |
| R-4 | TypeORM + NestJS version incompatibility | Low | High | Pin exact versions; test migration runner immediately |
| R-5 | Team unfamiliar with Turborepo | Medium | Medium | 30-min knowledge-sharing session on Day 1 |

---

## Deliverables Checklist

- [ ] Turborepo monorepo with `apps/api`, `apps/web`, `packages/shared`, `packages/ui`, `packages/api-client`, `packages/config`
- [ ] NestJS API with health endpoint and Swagger docs
- [ ] Next.js web app with base layout (Header, Footer, responsive)
- [ ] PostgreSQL running in Docker with TypeORM connected
- [ ] Docker Compose starts full stack with one command
- [ ] ESLint + Prettier configured and enforced via pre-commit hooks
- [ ] GitHub Actions CI pipeline passing
- [ ] Staging server on Hetzner with Cloudflare DNS and SSL
- [ ] Deployment script for staging
- [ ] API client package with typed health-check call
- [ ] README with setup instructions

---

## Definition of Done

1. All acceptance criteria for every user story are met
2. Code reviewed and approved by at least one other team member
3. All unit and integration tests pass in CI
4. No ESLint errors or warnings
5. Docker Compose boots from clean state in under 2 minutes
6. Staging deployment successful and health endpoint responds over HTTPS
7. Lighthouse Performance score > 90 on landing page
8. README updated with accurate setup instructions
9. All environment variables documented in `.env.example`
10. No secrets committed to the repository

---

## Sprint Review Demo Script

1. **Clone and boot** (2 min) -- Clone repo fresh, run `docker compose up`, show all services starting
2. **Health check** (1 min) -- Hit `http://localhost:3001/api/health` in browser, show JSON response
3. **Swagger docs** (1 min) -- Open `http://localhost:3001/api/docs`, walk through auto-generated docs
4. **Frontend layout** (2 min) -- Open `http://localhost:3000`, show header/footer, resize for responsive breakpoints
5. **Code quality** (1 min) -- Introduce a lint error, show pre-commit hook catching it
6. **CI pipeline** (1 min) -- Open GitHub Actions, show passing pipeline on latest merge
7. **Staging** (2 min) -- Open `https://staging.iloveberlin.biz`, show live health check, SSL certificate
8. **Monorepo structure** (1 min) -- Walk through folder structure, explain workspace dependencies
9. **Q&A** (3 min)

**Total demo time: ~14 minutes**

---

## Rollover Criteria

A task may roll over to Sprint 2 only if ALL of the following are true:

1. The task is not on the critical path for Sprint 2 (auth system does not depend on it)
2. At least 80% of the sprint's story points are completed
3. The rollover is documented with a reason and revised estimate
4. The team agrees during sprint review

**Candidates for rollover (if needed):**
- D-1.9 Deployment script (can do manual deploys temporarily)
- F-1.8 Error boundary (non-blocking for Sprint 2 work)
- QA-1.4 Cross-browser testing (can defer to Sprint 5 polish phase)

**Must NOT roll over:**
- Docker Compose full stack (blocks all future development)
- CI pipeline (blocks safe merging)
- NestJS + TypeORM setup (blocks Sprint 2 auth work)
- Base layout (blocks Sprint 2 auth pages)
