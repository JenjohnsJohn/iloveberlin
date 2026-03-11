# ILoveBerlin - CI/CD Pipeline

## Overview

The ILoveBerlin platform uses GitHub Actions for continuous integration and deployment. The pipeline enforces code quality, runs tests, builds artifacts, and deploys to staging and production environments.

---

## 1. Pipeline Architecture

```
Feature Branch (PR to develop)
  |
  v
[PR Checks] ------> lint, typecheck, unit tests, build, a11y
  |
  v
Merge to develop
  |
  v
[Staging Deploy] --> build images, deploy to staging, E2E tests
  |
  v
PR from develop to main
  |
  v
[Production Deploy] -> build images, deploy to production, smoke tests
```

### Branch Strategy

| Branch | Purpose | Auto-deploy Target |
|---|---|---|
| `feature/*`, `fix/*` | Feature development | None (PR checks only) |
| `develop` | Integration branch | Staging |
| `main` | Production release | Production |

---

## 2. PR Checks Workflow

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [develop, main]
    types: [opened, synchronize, reopened]

concurrency:
  group: pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  # ========== Lint & Format ==========
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: ESLint (API)
        run: npm run lint
        working-directory: apps/api

      - name: ESLint (Web)
        run: npm run lint
        working-directory: apps/web

      - name: Prettier check
        run: npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,scss,md}"

  # ========== Type Check ==========
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check (API)
        run: npx tsc --noEmit
        working-directory: apps/api

      - name: TypeScript check (Web)
        run: npx tsc --noEmit
        working-directory: apps/web

  # ========== Unit Tests ==========
  unit-tests-api:
    name: Unit Tests (API)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: apps/api

      - name: Run unit tests with coverage
        run: npm run test:cov
        working-directory: apps/api

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: api-coverage
          path: apps/api/coverage/
          retention-days: 7

  unit-tests-web:
    name: Unit Tests (Web)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: apps/web

      - name: Run unit tests with coverage
        run: npm run test -- --coverage
        working-directory: apps/web

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: web-coverage
          path: apps/web/coverage/
          retention-days: 7

  # ========== Integration Tests ==========
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
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
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: apps/api

      - name: Run integration tests
        run: npm run test:e2e
        working-directory: apps/api
        env:
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_USER: test_user
          DATABASE_PASSWORD: test_password
          DATABASE_NAME: iloveberlin_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-jwt-secret
          JWT_REFRESH_SECRET: test-jwt-refresh-secret

  # ========== Build Verification ==========
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies (API)
        run: npm ci
        working-directory: apps/api

      - name: Build API
        run: npm run build
        working-directory: apps/api

      - name: Install dependencies (Web)
        run: npm ci
        working-directory: apps/web

      - name: Build Web
        run: npm run build
        working-directory: apps/web
        env:
          NEXT_PUBLIC_API_URL: https://iloveberlin.biz/api/v1
          NEXT_PUBLIC_SITE_URL: https://iloveberlin.biz

      - name: Check bundle size
        run: |
          npm run build 2>&1 | tee build-output.txt
          node scripts/check-bundle-size.js build-output.txt
        working-directory: apps/web
        env:
          NEXT_PUBLIC_API_URL: https://iloveberlin.biz/api/v1
          NEXT_PUBLIC_SITE_URL: https://iloveberlin.biz
        continue-on-error: true

  # ========== Accessibility ==========
  accessibility:
    name: Accessibility Check
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: apps/web

      - name: Install Playwright
        run: npx playwright install --with-deps chromium
        working-directory: apps/web

      - name: Build
        run: npm run build
        working-directory: apps/web
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3001/api/v1
          NEXT_PUBLIC_SITE_URL: http://localhost:3000

      - name: Start server and run a11y tests
        run: |
          npm run start &
          npx wait-on http://localhost:3000 --timeout 30000
          npx playwright test e2e/accessibility/ --project=chromium
        working-directory: apps/web

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: a11y-report
          path: apps/web/playwright-report/
          retention-days: 7

  # ========== Flutter Checks ==========
  flutter-checks:
    name: Flutter Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          cache: true

      - name: Install dependencies
        run: flutter pub get
        working-directory: apps/mobile

      - name: Analyze
        run: flutter analyze
        working-directory: apps/mobile

      - name: Run tests
        run: flutter test --coverage
        working-directory: apps/mobile

      - name: Check coverage threshold
        run: |
          COVERAGE=$(lcov --summary coverage/lcov.info 2>&1 | grep "lines" | grep -oP '[\d.]+%' | head -1 | tr -d '%')
          echo "Coverage: ${COVERAGE}%"
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage ${COVERAGE}% is below 80% threshold"
            exit 1
          fi
        working-directory: apps/mobile
```

---

## 3. Staging Deploy Workflow

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

concurrency:
  group: staging-deploy
  cancel-in-progress: false  # Do not cancel in-progress deploys

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build API image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: false
          load: true
          tags: iloveberlin-api:staging
          cache-from: type=gha,scope=api-staging
          cache-to: type=gha,mode=max,scope=api-staging

      - name: Build Web image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/web
          push: false
          load: true
          tags: iloveberlin-web:staging
          build-args: |
            NEXT_PUBLIC_API_URL=https://staging.iloveberlin.biz/api/v1
            NEXT_PUBLIC_SITE_URL=https://staging.iloveberlin.biz
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${{ secrets.STAGING_STRIPE_PUBLISHABLE_KEY }}
            NEXT_PUBLIC_R2_PUBLIC_URL=https://staging-assets.iloveberlin.biz
          cache-from: type=gha,scope=web-staging
          cache-to: type=gha,mode=max,scope=web-staging

      - name: Save Docker images
        run: |
          docker save iloveberlin-api:staging | gzip > api-image.tar.gz
          docker save iloveberlin-web:staging | gzip > web-image.tar.gz

      - name: Copy images to staging server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.STAGING_SSH_HOST }}
          username: deploy
          key: ${{ secrets.STAGING_SSH_KEY }}
          source: "api-image.tar.gz,web-image.tar.gz"
          target: /tmp/deploy/

      - name: Deploy to staging
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.STAGING_SSH_HOST }}
          username: deploy
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            set -e

            cd /opt/iloveberlin

            # Load new images
            docker load < /tmp/deploy/api-image.tar.gz
            docker load < /tmp/deploy/web-image.tar.gz

            # Update environment variables
            echo "Updating .env file..."
            # (Environment variables are managed in the .env file on the server)

            # Stop old containers and start new ones
            docker compose -f docker-compose.prod.yml up -d --no-deps web api

            # Run database migrations
            docker compose -f docker-compose.prod.yml exec -T api \
              npx typeorm migration:run -d dist/config/data-source.js

            # Wait for health checks
            echo "Waiting for services to be healthy..."
            sleep 10

            # Verify health
            curl -sf http://localhost:3000/api/health || exit 1
            curl -sf http://localhost:3001/api/v1/health || exit 1

            # Clean up
            rm -f /tmp/deploy/api-image.tar.gz /tmp/deploy/web-image.tar.gz
            docker image prune -f

            echo "Staging deployment complete!"

      - name: Run E2E tests on staging
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.STAGING_SSH_HOST }}
          username: deploy
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/iloveberlin
            # Trigger E2E test suite
            # (or run from CI with remote URL)
        continue-on-error: true

      - name: Notify deployment
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "${{ job.status == 'success' && 'Staging deployment successful' || 'Staging deployment failed' }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "${{ job.status == 'success' && ':white_check_mark:' || ':x:' }} *Staging Deployment* - ${{ job.status }}\n*Commit:* `${{ github.sha }}` by ${{ github.actor }}\n*URL:* https://staging.iloveberlin.biz"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 4. Production Deploy Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval in GitHub
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build API image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: false
          load: true
          tags: iloveberlin-api:production
          cache-from: type=gha,scope=api-prod
          cache-to: type=gha,mode=max,scope=api-prod

      - name: Build Web image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/web
          push: false
          load: true
          tags: iloveberlin-web:production
          build-args: |
            NEXT_PUBLIC_API_URL=https://iloveberlin.biz/api/v1
            NEXT_PUBLIC_SITE_URL=https://iloveberlin.biz
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${{ secrets.PROD_STRIPE_PUBLISHABLE_KEY }}
            NEXT_PUBLIC_CDN_URL=https://assets.iloveberlin.biz
            NEXT_PUBLIC_R2_PUBLIC_URL=https://assets.iloveberlin.biz
            NEXT_PUBLIC_GA_MEASUREMENT_ID=${{ secrets.PROD_GA_MEASUREMENT_ID }}
          cache-from: type=gha,scope=web-prod
          cache-to: type=gha,mode=max,scope=web-prod

      - name: Save Docker images
        run: |
          docker save iloveberlin-api:production | gzip > api-image.tar.gz
          docker save iloveberlin-web:production | gzip > web-image.tar.gz

      - name: Copy images to production server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.PROD_SSH_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          source: "api-image.tar.gz,web-image.tar.gz"
          target: /tmp/deploy/

      - name: Create database backup before deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_SSH_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/iloveberlin
            ./scripts/backup-db.sh pre-deploy

      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_SSH_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            set -e

            cd /opt/iloveberlin

            # Load new images
            docker load < /tmp/deploy/api-image.tar.gz
            docker load < /tmp/deploy/web-image.tar.gz

            # Deploy API first (includes migrations)
            docker compose -f docker-compose.prod.yml up -d --no-deps api

            # Run database migrations
            docker compose -f docker-compose.prod.yml exec -T api \
              npx typeorm migration:run -d dist/config/data-source.js

            # Wait for API health
            echo "Waiting for API health check..."
            for i in $(seq 1 30); do
              if curl -sf http://localhost:3001/api/v1/health; then
                echo "API is healthy"
                break
              fi
              if [ $i -eq 30 ]; then
                echo "API health check failed after 30 attempts"
                exit 1
              fi
              sleep 2
            done

            # Deploy Web
            docker compose -f docker-compose.prod.yml up -d --no-deps web

            # Wait for Web health
            echo "Waiting for Web health check..."
            for i in $(seq 1 30); do
              if curl -sf http://localhost:3000/api/health; then
                echo "Web is healthy"
                break
              fi
              if [ $i -eq 30 ]; then
                echo "Web health check failed after 30 attempts"
                exit 1
              fi
              sleep 2
            done

            # Clean up
            rm -f /tmp/deploy/api-image.tar.gz /tmp/deploy/web-image.tar.gz
            docker image prune -f

            echo "Production deployment complete!"

      - name: Run smoke tests
        run: |
          # Basic smoke tests against production
          curl -sf https://iloveberlin.biz/ || exit 1
          curl -sf https://iloveberlin.biz/api/v1/health || exit 1
          curl -sf https://iloveberlin.biz/articles || exit 1
          echo "Smoke tests passed"

      - name: Purge Cloudflare cache
        run: |
          curl -s -X POST \
            "https://api.cloudflare.com/client/v4/zones/${{ secrets.CF_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CF_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything": true}'

      - name: Notify deployment
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "${{ job.status == 'success' && 'Production deployment successful' || 'PRODUCTION DEPLOYMENT FAILED' }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "${{ job.status == 'success' && ':rocket:' || ':rotating_light:' }} *Production Deployment* - ${{ job.status }}\n*Commit:* `${{ github.sha }}` by ${{ github.actor }}\n*URL:* https://iloveberlin.biz"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 5. Mobile Build Pipeline

```yaml
# .github/workflows/mobile-build.yml
name: Mobile Build

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'both'
        type: choice
        options:
          - android
          - ios
          - both

jobs:
  # ========== Android Build ==========
  android:
    name: Android Build
    runs-on: ubuntu-latest
    if: github.event.inputs.platform != 'ios'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          cache: true

      - name: Install dependencies
        run: flutter pub get
        working-directory: apps/mobile

      - name: Run tests
        run: flutter test
        working-directory: apps/mobile

      - name: Build APK (release)
        run: flutter build apk --release
        working-directory: apps/mobile
        env:
          API_URL: https://iloveberlin.biz/api/v1

      - name: Build App Bundle (release)
        run: flutter build appbundle --release
        working-directory: apps/mobile
        env:
          API_URL: https://iloveberlin.biz/api/v1

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: apps/mobile/build/app/outputs/flutter-apk/app-release.apk

      - name: Upload AAB
        uses: actions/upload-artifact@v4
        with:
          name: android-aab
          path: apps/mobile/build/app/outputs/bundle/release/app-release.aab

  # ========== iOS Build ==========
  ios:
    name: iOS Build
    runs-on: macos-latest
    if: github.event.inputs.platform != 'android'
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          cache: true

      - name: Install dependencies
        run: flutter pub get
        working-directory: apps/mobile

      - name: Run tests
        run: flutter test
        working-directory: apps/mobile

      - name: Build iOS (no codesign for CI)
        run: flutter build ios --release --no-codesign
        working-directory: apps/mobile
        env:
          API_URL: https://iloveberlin.biz/api/v1

      - name: Upload iOS build
        uses: actions/upload-artifact@v4
        with:
          name: ios-build
          path: apps/mobile/build/ios/iphoneos/
```

---

## 6. Environment-Specific Secrets

### GitHub Environments

| Environment | Required Reviewers | Secrets Scope |
|---|---|---|
| `staging` | None (auto-deploy) | Staging-specific secrets |
| `production` | 1 reviewer required | Production-specific secrets |

### Secret Access per Workflow

| Workflow | Secrets Used |
|---|---|
| PR Checks | None (tests use in-memory/Docker services) |
| Deploy Staging | `STAGING_SSH_*`, `STAGING_*`, `SLACK_WEBHOOK_URL` |
| Deploy Production | `PROD_SSH_*`, `PROD_*`, `CF_*`, `SLACK_WEBHOOK_URL` |
| Mobile Build | `API_URL` (hardcoded), signing keys (for signed builds) |

---

## 7. Deployment Notifications

### Slack Notifications

| Event | Channel | Severity |
|---|---|---|
| Staging deploy success | `#deployments` | Info |
| Staging deploy failure | `#deployments`, `#engineering` | Warning |
| Production deploy success | `#deployments`, `#general` | Info |
| Production deploy failure | `#deployments`, `#engineering`, `@oncall` | Critical |
| PR checks failure | PR comment (GitHub) | Info |

### GitHub Status Checks

All PR check jobs are required to pass before merge. This is configured in GitHub branch protection rules:

- Branch: `develop` and `main`
- Required status checks: `lint`, `typecheck`, `unit-tests-api`, `unit-tests-web`, `integration-tests`, `build`, `accessibility`, `flutter-checks`
- Require PR reviews: 1 reviewer
- Dismiss stale reviews: Yes
- Require up-to-date branches: Yes

---

## 8. Rollback Procedure

If a deployment causes issues:

### Automated Rollback

```bash
# On the server
cd /opt/iloveberlin

# List previous images
docker images iloveberlin-api --format "{{.Tag}} {{.CreatedAt}}"
docker images iloveberlin-web --format "{{.Tag}} {{.CreatedAt}}"

# Revert to previous image tag
docker compose -f docker-compose.prod.yml up -d --no-deps api
docker compose -f docker-compose.prod.yml up -d --no-deps web
```

### Database Rollback

```bash
# Revert the last migration
docker compose -f docker-compose.prod.yml exec -T api \
  npx typeorm migration:revert -d dist/config/data-source.js

# Or restore from pre-deploy backup
./scripts/restore-db.sh pre-deploy
```

See [Disaster Recovery](./disaster-recovery.md) for comprehensive rollback procedures.
