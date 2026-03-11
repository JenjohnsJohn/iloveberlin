# ILoveBerlin - Testing Strategy

## 1. Testing Philosophy

The ILoveBerlin platform follows a **shift-left testing** approach: catch defects as early and as cheaply as possible. Every feature must include tests before it can be merged. Testing is a shared responsibility across the entire engineering team, not a separate QA function.

### Core Principles

- **Test the behavior, not the implementation.** Tests should validate what the system does, not how it does it internally.
- **Fast feedback loops.** Unit tests run in seconds, integration tests in minutes. Developers get results before context-switching.
- **Deterministic tests.** No flaky tests in the main branch. A flaky test is treated as a bug and fixed or quarantined immediately.
- **Production parity.** Test environments mirror production as closely as possible (same Docker images, same database engine, same environment variable structure).

---

## 2. Testing Pyramid

We follow the classic testing pyramid, weighted heavily toward fast, isolated unit tests:

```
         /  E2E Tests  \          ~10% of tests
        / (Playwright,  \         Slow, expensive, high confidence
       /  Flutter integ.) \
      /--------------------\
     / Integration Tests    \     ~20% of tests
    / (Supertest, DB tests,  \    Moderate speed, cross-boundary
   /   contract tests)        \
  /----------------------------\
 /       Unit Tests             \  ~70% of tests
/ (Jest, React Testing Library,  \ Fast, isolated, cheap
/  Flutter unit/widget tests)     \
-----------------------------------
```

### Distribution Targets

| Layer | Share of Test Suite | Execution Time Budget |
|---|---|---|
| Unit | ~70% | < 60 seconds total |
| Integration | ~20% | < 5 minutes total |
| E2E | ~10% | < 15 minutes total |

---

## 3. Coverage Targets

### Minimum Coverage Thresholds (Enforced in CI)

| Service | Unit Test Line Coverage | Unit Test Branch Coverage | Integration Endpoint Coverage |
|---|---|---|---|
| **NestJS API** | 80% | 75% | 70% |
| **Next.js Web** | 80% | 75% | N/A |
| **Flutter Mobile** | 80% | 70% | N/A |

### Coverage Configuration

**Jest (NestJS and Next.js) - `jest.config.ts`:**

```typescript
// Coverage thresholds enforced in CI
coverageThreshold: {
  global: {
    branches: 75,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
coveragePathIgnorePatterns: [
  '/node_modules/',
  '/dist/',
  '/.next/',
  '/migrations/',
  '/seeds/',
  '*.module.ts',
  '*.dto.ts',
  '*.entity.ts',
],
```

**Flutter - `pubspec.yaml` (via `very_good_cli`):**

```yaml
# Coverage is checked via: flutter test --coverage
# Then: lcov --summary coverage/lcov.info
# Threshold enforced in CI script
```

### What to Cover vs. What to Skip

**Always test:**
- Business logic (services, use cases, state management)
- Data transformations and mapping
- Validation rules
- Error handling paths
- Edge cases (empty arrays, null values, boundary conditions)
- Authorization and access control logic

**Skip or minimize:**
- Auto-generated code (DTOs with no logic, entity definitions)
- Framework boilerplate (module definitions, simple controller routing)
- Third-party library internals
- Pure configuration files

---

## 4. Testing Environments

### Environment Matrix

| Environment | Purpose | Database | External Services | Triggered By |
|---|---|---|---|---|
| **Local** | Developer workstation | Docker PostgreSQL | Mocked / local containers | Manual |
| **CI** | Automated pipeline | Docker PostgreSQL (ephemeral) | Mocked | PR push, merge |
| **Staging** | Pre-production validation | Hetzner PostgreSQL (staging) | Sandbox accounts | Merge to `develop` |
| **Production** | Live system | Hetzner PostgreSQL (prod) | Live accounts | Merge to `main` |

### Local Development Testing

```bash
# Start local test infrastructure
docker compose -f docker-compose.test.yml up -d

# This provides:
#   - PostgreSQL on port 5433 (separate from dev DB on 5432)
#   - Redis on port 6380
#   - Meilisearch on port 7701
```

### CI Testing Environment

The CI environment uses GitHub Actions with ephemeral Docker containers:

```yaml
# .github/workflows/test.yml (excerpt)
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_DB: iloveberlin_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Staging Environment

- Mirrors production infrastructure on Hetzner
- Uses separate database with anonymized production-like data
- External services use sandbox/test API keys (Stripe test mode, Brevo test lists)
- Accessed at `staging.iloveberlin.biz` (restricted via Cloudflare Access)

---

## 5. CI Integration

### Pipeline Stages

```
PR Created/Updated
  |
  v
[1. Lint & Typecheck]  -----> Fail fast on syntax/type errors
  |
  v
[2. Unit Tests + Coverage] -> Enforce 80% coverage threshold
  |
  v
[3. Build Verification]  ---> Ensure all services compile/build
  |
  v
[4. Integration Tests]  ----> Test cross-service boundaries
  |
  v
[5. E2E Tests]  ------------> Run on staging-like environment
  |
  v
[6. Performance Check]  ----> Lighthouse, bundle size comparison
  |
  v
[7. Accessibility Check] ---> axe-core automated scan
  |
  v
PR Approved & Merged
```

### CI Gates (Must Pass to Merge)

| Gate | Tool | Criteria |
|---|---|---|
| Linting | ESLint, Prettier, flutter_lints | Zero errors |
| Type checking | TypeScript `tsc --noEmit`, Dart analyzer | Zero errors |
| Unit tests | Jest, flutter test | All pass, coverage thresholds met |
| Integration tests | Jest + Supertest | All pass |
| E2E tests | Playwright | All critical flows pass |
| Build | Next.js build, NestJS build, Flutter build | Successful build |
| Accessibility | axe-core | Zero critical/serious violations |

### CI Warnings (Do Not Block Merge)

| Check | Tool | Criteria |
|---|---|---|
| Performance regression | Lighthouse CI | Score delta > -5 from baseline |
| Bundle size increase | `next build` output | > 10% increase in any chunk |
| New dependency added | `npm diff` | Flagged for manual review |

---

## 6. Test Data Management

### Strategy

We use a layered approach to test data:

1. **Factories** for unit tests (in-memory, no database)
2. **Seeders** for integration tests (database fixtures, reset between suites)
3. **Scenario builders** for E2E tests (API-driven data setup)

### Test Factories (Unit Tests)

```typescript
// tests/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { User } from '../../src/users/entities/user.entity';

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'user',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

### Database Seeders (Integration Tests)

```typescript
// tests/seeders/test-database.seeder.ts
import { DataSource } from 'typeorm';

export class TestDatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    await this.seedUsers();
    await this.seedCategories();
    await this.seedArticles();
    await this.seedEvents();
    await this.seedClassifieds();
  }

  async clean(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.query(
        `TRUNCATE TABLE "${entity.tableName}" CASCADE`,
      );
    }
  }

  private async seedUsers(): Promise<void> {
    // Insert baseline test users with known credentials
  }

  // ... additional seed methods
}
```

### E2E Scenario Builders

```typescript
// tests/e2e/helpers/scenario-builder.ts
export class ScenarioBuilder {
  constructor(private apiClient: APIRequestContext) {}

  async createAuthenticatedUser(): Promise<{ token: string; user: User }> {
    const response = await this.apiClient.post('/api/auth/register', {
      data: {
        email: `e2e-${Date.now()}@test.iloveberlin.biz`,
        password: 'TestPass123!',
        firstName: 'E2E',
        lastName: 'TestUser',
      },
    });
    return response.json();
  }

  async createPublishedArticle(token: string): Promise<Article> {
    // Create article via API
  }

  async createEventWithTickets(token: string): Promise<Event> {
    // Create event with ticket types via API
  }
}
```

### Test Data Isolation

- Each integration test suite gets a **fresh database transaction** that is rolled back after the suite completes.
- E2E tests use **unique identifiers** (timestamps, UUIDs) in test data to avoid collisions during parallel runs.
- External service mocks return **deterministic responses** keyed to specific test scenarios.

---

## 7. Testing Responsibilities per Sprint

### Sprint Testing Checklist

| Phase | Activity | Responsible | Artifacts |
|---|---|---|---|
| **Sprint Planning** | Identify test scenarios for each story | Dev + QA | Test scenarios in ticket |
| **Development** | Write unit tests alongside code | Developer | Passing tests, coverage report |
| **Development** | Write integration tests for API changes | Developer | Passing tests |
| **Code Review** | Review test quality and coverage | Reviewer | Review comments |
| **Pre-Merge** | All CI gates pass | Automated | CI pipeline green |
| **Staging** | Run E2E suite on staging | Automated / QA | E2E report |
| **Staging** | Exploratory testing of new features | QA / Team | Bug reports if needed |
| **Pre-Release** | Performance regression check | Automated | Lighthouse / k6 reports |
| **Pre-Release** | Accessibility audit on changed pages | Automated + Manual | axe-core report |
| **Post-Release** | Smoke test production | Automated | Health check dashboard |

### Per-Story Test Requirements

Every user story must include:

1. **Unit tests** covering the new or modified business logic
2. **Integration tests** if the story involves API endpoint changes
3. **E2E test updates** if the story modifies a critical user flow
4. **Accessibility check** if the story involves UI changes

### Test Ownership

- **The developer who writes the feature writes the tests.** This is non-negotiable.
- **The code reviewer validates test quality.** Are edge cases covered? Are assertions meaningful?
- **The team collectively owns test infrastructure.** Flaky tests, test utilities, CI configuration, and test environments are maintained by the full team.

---

## 8. Handling Test Failures

### In CI

1. **Flaky test detected**: Quarantine immediately (move to `describe.skip` or `@Skip()`), file a bug ticket with P2 priority, fix within the current sprint.
2. **Legitimate failure**: Fix before merging. No exceptions.
3. **Infrastructure failure** (Docker timeout, network issue): Retry the CI run once. If it persists, investigate and fix the infrastructure.

### In Staging

1. **E2E failure on staging**: Block release until resolved.
2. **Performance regression on staging**: Investigate. Block release if p95 exceeds 500ms for any critical endpoint.

### Escalation Path

```
Test failure in CI
  |
  +--> Developer fixes immediately
  |
  +--> Cannot fix quickly?
        |
        +--> Quarantine test + file ticket
        |
        +--> Discuss in daily standup
        |
        +--> P2 priority fix within sprint
```

---

## 9. Testing Tools Quick Reference

| Task | Command | Where |
|---|---|---|
| Run NestJS unit tests | `npm run test` | `apps/api/` |
| Run NestJS tests in watch mode | `npm run test:watch` | `apps/api/` |
| Run NestJS integration tests | `npm run test:e2e` | `apps/api/` |
| Generate NestJS coverage report | `npm run test:cov` | `apps/api/` |
| Run Next.js unit tests | `npm run test` | `apps/web/` |
| Run Playwright E2E tests | `npx playwright test` | `apps/web/` |
| Run Playwright with UI | `npx playwright test --ui` | `apps/web/` |
| Run Flutter unit tests | `flutter test` | `apps/mobile/` |
| Run Flutter integration tests | `flutter test integration_test` | `apps/mobile/` |
| Run k6 load test | `k6 run load-test.js` | `tests/performance/` |
| Run axe-core accessibility test | `npm run test:a11y` | `apps/web/` |
| Run Lighthouse audit | `npx lhci autorun` | `apps/web/` |
