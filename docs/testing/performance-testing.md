# ILoveBerlin - Performance Testing

## Overview

Performance testing ensures the ILoveBerlin platform delivers a fast, responsive experience under realistic load. We measure performance at multiple levels: synthetic browser audits (Lighthouse), API load testing (k6), runtime monitoring (Core Web Vitals), and build-time analysis (bundle size, image optimization).

---

## 1. k6 Load Testing

### Setup

```bash
# Install k6
brew install grafana/tap/k6   # macOS
# or
sudo apt-get install k6        # Ubuntu

# Verify installation
k6 version
```

### Load Test Configuration

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const articleListDuration = new Trend('article_list_duration');
const articleDetailDuration = new Trend('article_detail_duration');
const searchDuration = new Trend('search_duration');
const authDuration = new Trend('auth_duration');

const BASE_URL = __ENV.BASE_URL || 'https://staging.iloveberlin.biz';
const API_URL = __ENV.API_URL || `${BASE_URL}/api`;

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '3m', target: 200 },   // Ramp up to 200 concurrent users
    { duration: '5m', target: 200 },   // Hold at 200 users
    { duration: '2m', target: 50 },    // Ramp down
    { duration: '1m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],  // p95 < 500ms, p99 < 1.5s
    http_req_failed: ['rate<0.01'],                    // Error rate < 1%
    errors: ['rate<0.01'],
    article_list_duration: ['p(95)<400'],
    article_detail_duration: ['p(95)<300'],
    search_duration: ['p(95)<600'],
    auth_duration: ['p(95)<500'],
  },
};

export default function () {
  // Simulate realistic user behavior with weighted scenarios
  const scenario = Math.random();

  if (scenario < 0.40) {
    browseArticles();
  } else if (scenario < 0.60) {
    browseEvents();
  } else if (scenario < 0.75) {
    browseClassifieds();
  } else if (scenario < 0.85) {
    searchContent();
  } else if (scenario < 0.95) {
    authenticatedUserFlow();
  } else {
    createClassified();
  }

  sleep(Math.random() * 3 + 1); // Random wait between 1-4 seconds
}

function browseArticles() {
  group('Browse Articles', () => {
    // List articles (paginated)
    const listResponse = http.get(`${API_URL}/articles?page=1&limit=10`);
    articleListDuration.add(listResponse.timings.duration);
    check(listResponse, {
      'articles list - status 200': (r) => r.status === 200,
      'articles list - has data': (r) => JSON.parse(r.body).data.length > 0,
    }) || errorRate.add(1);

    sleep(1);

    // View a specific article
    const articles = JSON.parse(listResponse.body).data;
    if (articles.length > 0) {
      const randomArticle = articles[Math.floor(Math.random() * articles.length)];
      const detailResponse = http.get(
        `${API_URL}/articles/${randomArticle.slug}`,
      );
      articleDetailDuration.add(detailResponse.timings.duration);
      check(detailResponse, {
        'article detail - status 200': (r) => r.status === 200,
        'article detail - has content': (r) =>
          JSON.parse(r.body).content !== undefined,
      }) || errorRate.add(1);
    }
  });
}

function browseEvents() {
  group('Browse Events', () => {
    const response = http.get(`${API_URL}/events?page=1&limit=10`);
    check(response, {
      'events list - status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(0.5);

    const events = JSON.parse(response.body).data;
    if (events.length > 0) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const detailResponse = http.get(
        `${API_URL}/events/${randomEvent.slug}`,
      );
      check(detailResponse, {
        'event detail - status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
    }
  });
}

function browseClassifieds() {
  group('Browse Classifieds', () => {
    const response = http.get(
      `${API_URL}/classifieds?page=1&limit=20&status=active`,
    );
    check(response, {
      'classifieds list - status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

function searchContent() {
  group('Search', () => {
    const queries = ['coffee', 'berlin', 'apartment', 'music', 'market', 'kreuzberg'];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const response = http.get(`${API_URL}/search?q=${query}&limit=20`);
    searchDuration.add(response.timings.duration);
    check(response, {
      'search - status 200': (r) => r.status === 200,
      'search - returns results': (r) => JSON.parse(r.body).total >= 0,
    }) || errorRate.add(1);
  });
}

function authenticatedUserFlow() {
  group('Authenticated User', () => {
    // Login
    const loginResponse = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({
        email: `loadtest-${__VU}@test.iloveberlin.biz`,
        password: 'LoadTestPass123!',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    authDuration.add(loginResponse.timings.duration);

    if (loginResponse.status !== 200) {
      errorRate.add(1);
      return;
    }

    const token = JSON.parse(loginResponse.body).accessToken;
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    sleep(0.5);

    // Get profile
    const profileResponse = http.get(`${API_URL}/auth/me`, {
      headers: authHeaders,
    });
    check(profileResponse, {
      'profile - status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(0.5);

    // Get user's classifieds
    const myClassifieds = http.get(`${API_URL}/classifieds/mine`, {
      headers: authHeaders,
    });
    check(myClassifieds, {
      'my classifieds - status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

function createClassified() {
  group('Create Classified', () => {
    // Login first
    const loginResponse = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({
        email: `loadtest-${__VU}@test.iloveberlin.biz`,
        password: 'LoadTestPass123!',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (loginResponse.status !== 200) {
      errorRate.add(1);
      return;
    }

    const token = JSON.parse(loginResponse.body).accessToken;

    const createResponse = http.post(
      `${API_URL}/classifieds`,
      JSON.stringify({
        title: `Load Test Classified ${Date.now()}`,
        description: 'This is a load test classified. It will be cleaned up.',
        categoryId: 'for-sale',
        price: 100,
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    check(createResponse, {
      'create classified - status 201': (r) => r.status === 201,
    }) || errorRate.add(1);
  });
}
```

### Spike Test

```javascript
// tests/performance/spike-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const API_URL = __ENV.API_URL || 'https://staging.iloveberlin.biz/api';

export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Normal load
    { duration: '10s', target: 500 },   // Spike to 500 users
    { duration: '1m', target: 500 },    // Hold spike
    { duration: '10s', target: 50 },    // Recover
    { duration: '1m', target: 50 },     // Verify recovery
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // More lenient during spike
    http_req_failed: ['rate<0.05'],     // Allow up to 5% errors during spike
  },
};

export default function () {
  const response = http.get(`${API_URL}/articles?page=1&limit=10`);
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

### Soak Test

```javascript
// tests/performance/soak-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const API_URL = __ENV.API_URL || 'https://staging.iloveberlin.biz/api';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '4h', target: 100 },   // Sustained load for 4 hours
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const endpoints = [
    '/articles?page=1&limit=10',
    '/events?page=1&limit=10',
    '/classifieds?page=1&limit=20',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(`${API_URL}${endpoint}`);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(Math.random() * 5 + 2);
}
```

### Running k6 Tests

```bash
# Standard load test
k6 run tests/performance/load-test.js

# With environment variables
k6 run --env BASE_URL=https://staging.iloveberlin.biz tests/performance/load-test.js

# Spike test
k6 run tests/performance/spike-test.js

# Soak test (runs for 4+ hours)
k6 run tests/performance/soak-test.js

# Export results to JSON
k6 run --out json=results.json tests/performance/load-test.js

# Export results to Prometheus (for Grafana dashboards)
k6 run --out experimental-prometheus-rw tests/performance/load-test.js
```

---

## 2. Lighthouse Audits

### Performance Targets

| Metric | Target | Critical Threshold |
|---|---|---|
| Performance Score | 90+ | 80 (blocks release) |
| SEO Score | 95+ | 90 (blocks release) |
| Accessibility Score | 95+ | 90 (blocks release) |
| Best Practices Score | 95+ | 90 (blocks release) |

### Lighthouse CI Configuration

```javascript
// apps/web/lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',                         // Homepage
        'http://localhost:3000/articles',                 // Articles listing
        'http://localhost:3000/articles/sample-article',  // Article detail
        'http://localhost:3000/events',                   // Events listing
        'http://localhost:3000/classifieds',              // Classifieds listing
        'http://localhost:3000/login',                    // Login page
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.80 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // SEO
        'categories:seo': ['error', { minScore: 0.90 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.90 }],

        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.90 }],

        // Specific checks
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',
        'render-blocking-resources': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Running Lighthouse Audits

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
cd apps/web
lhci autorun

# Run manually against a URL
lighthouse https://staging.iloveberlin.biz \
  --output html \
  --output-path ./lighthouse-report.html

# Mobile audit
lighthouse https://staging.iloveberlin.biz \
  --preset perf \
  --emulated-form-factor mobile \
  --output html
```

### CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
        working-directory: apps/web

      - run: npm run build
        working-directory: apps/web

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: apps/web/lighthouserc.js
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

## 3. Core Web Vitals Targets

### Target Metrics

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| **Largest Contentful Paint (LCP)** | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **First Input Delay (FID)** | < 100ms | 100ms - 300ms | > 300ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **Interaction to Next Paint (INP)** | < 200ms | 200ms - 500ms | > 500ms |
| **First Contentful Paint (FCP)** | < 1.8s | 1.8s - 3.0s | > 3.0s |
| **Time to First Byte (TTFB)** | < 800ms | 800ms - 1800ms | > 1800ms |

### Our Targets (All Pages Must Meet)

| Metric | Target |
|---|---|
| LCP | < 2.0s |
| FID | < 50ms |
| CLS | < 0.05 |
| INP | < 150ms |
| FCP | < 1.5s |
| TTFB | < 600ms |

### Real User Monitoring (RUM)

Core Web Vitals are tracked in production via the `web-vitals` library:

```typescript
// apps/web/src/lib/vitals.ts
import { onCLS, onFID, onLCP, onINP, onFCP, onTTFB, Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.pathname,
  };

  // Send to our analytics endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(body));
  } else {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify(body),
      keepalive: true,
    });
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

---

## 4. API Response Time Benchmarks

### Endpoint Benchmarks

| Endpoint | Method | p50 Target | p95 Target | p99 Target |
|---|---|---|---|---|
| `GET /api/articles` | List | < 100ms | < 300ms | < 800ms |
| `GET /api/articles/:slug` | Detail | < 50ms | < 200ms | < 500ms |
| `GET /api/events` | List | < 100ms | < 300ms | < 800ms |
| `GET /api/events/:slug` | Detail | < 50ms | < 200ms | < 500ms |
| `GET /api/classifieds` | List | < 150ms | < 400ms | < 1000ms |
| `GET /api/search` | Search | < 200ms | < 500ms | < 1200ms |
| `POST /api/auth/login` | Auth | < 200ms | < 500ms | < 1000ms |
| `POST /api/classifieds` | Create | < 300ms | < 600ms | < 1500ms |
| `POST /api/upload/image` | Upload | < 1000ms | < 3000ms | < 5000ms |

### Monitoring API Response Times

API response times are tracked via Prometheus metrics exposed by the NestJS application:

```typescript
// apps/api/src/common/interceptors/metrics.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const route = request.route?.path || request.url;
    const end = this.httpRequestDuration.startTimer({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          end({ status_code: response.statusCode });
        },
        error: (error) => {
          end({ status_code: error.status || 500 });
        },
      }),
    );
  }
}
```

---

## 5. Database Query Monitoring

### Slow Query Detection

```typescript
// apps/api/src/common/interceptors/query-logger.interceptor.ts
import { Logger } from '@nestjs/common';

const SLOW_QUERY_THRESHOLD_MS = 100;

export class QueryLogger {
  private readonly logger = new Logger('QueryPerformance');

  logQuery(query: string, parameters: any[], queryRunner: any) {
    // Handled by TypeORM logger
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters: any[],
    queryRunner: any,
  ) {
    this.logger.warn(
      `Slow query detected (${time}ms): ${query.substring(0, 200)}`,
    );
  }
}
```

### TypeORM Configuration for Query Monitoring

```typescript
// apps/api/src/config/database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  // ... connection config
  logging: ['error', 'warn', 'query'],
  maxQueryExecutionTime: 100, // Log queries taking > 100ms
  logger: new QueryLogger(),
};
```

### Key Database Performance Checks

| Check | Target | Action if Exceeded |
|---|---|---|
| Average query time | < 20ms | Optimize query, add indexes |
| Max query time | < 200ms | Investigate, consider caching |
| Connection pool utilization | < 70% | Increase pool size |
| Active connections | < 80% of max | Investigate connection leaks |
| Table bloat | < 20% | Schedule VACUUM |

### PostgreSQL Performance Queries

```sql
-- Find slow queries (requires pg_stat_statements extension)
SELECT
  calls,
  mean_exec_time::numeric(10,2) AS avg_ms,
  max_exec_time::numeric(10,2) AS max_ms,
  total_exec_time::numeric(10,2) AS total_ms,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check index usage
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Find missing indexes (sequential scans on large tables)
SELECT
  schemaname,
  relname AS table_name,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup AS estimated_rows
FROM pg_stat_user_tables
WHERE seq_scan > 100
  AND n_live_tup > 10000
ORDER BY seq_tup_read DESC;
```

---

## 6. Bundle Size Tracking

### Next.js Bundle Analysis

```bash
# Analyze bundle size
cd apps/web
ANALYZE=true npm run build

# Or use @next/bundle-analyzer
```

### Bundle Size Budgets

```javascript
// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable output file tracing for accurate size measurement
    outputFileTracingRoot: undefined,
  },
};

export default nextConfig;
```

### Size Limits

| Bundle | Max Size (gzipped) | Warning Threshold |
|---|---|---|
| First Load JS (shared) | 80 KB | 70 KB |
| Per-page JS | 50 KB | 40 KB |
| CSS (total) | 30 KB | 25 KB |
| Largest single chunk | 100 KB | 80 KB |
| Total first load | 200 KB | 170 KB |

### CI Bundle Size Check

```yaml
# Part of PR checks
- name: Check bundle size
  run: |
    npm run build 2>&1 | tee build-output.txt
    # Parse Next.js build output for bundle sizes
    node scripts/check-bundle-size.js build-output.txt
  working-directory: apps/web
```

```javascript
// apps/web/scripts/check-bundle-size.js
const fs = require('fs');
const path = require('path');

const MAX_FIRST_LOAD_KB = 200;
const BUILD_OUTPUT = process.argv[2];

const output = fs.readFileSync(BUILD_OUTPUT, 'utf-8');

// Parse "First Load JS" values from Next.js build output
const firstLoadMatch = output.match(
  /First Load JS shared by all\s+([\d.]+)\s*kB/,
);

if (firstLoadMatch) {
  const sizeKB = parseFloat(firstLoadMatch[1]);

  if (sizeKB > MAX_FIRST_LOAD_KB) {
    console.error(
      `Bundle size ${sizeKB} kB exceeds maximum ${MAX_FIRST_LOAD_KB} kB`,
    );
    process.exit(1);
  }

  console.log(
    `Bundle size OK: ${sizeKB} kB (max: ${MAX_FIRST_LOAD_KB} kB)`,
  );
}
```

---

## 7. Image Optimization Verification

### Requirements

| Requirement | Target |
|---|---|
| Format | WebP or AVIF (with JPEG/PNG fallback) |
| Max file size (hero images) | 200 KB |
| Max file size (thumbnails) | 50 KB |
| Max file size (article images) | 150 KB |
| Responsive images | `srcset` with 640w, 750w, 1080w, 1200w, 1920w |
| Lazy loading | All below-the-fold images |
| Explicit dimensions | All `<img>` tags have `width` and `height` |

### Automated Image Check

```typescript
// apps/web/e2e/performance/images.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Image Optimization', () => {
  test('all images use next/image or have explicit dimensions', async ({
    page,
  }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      const src = await img.getAttribute('src');

      // Skip SVGs and data URIs
      if (src?.startsWith('data:') || src?.endsWith('.svg')) continue;

      expect(width, `Image ${src} missing width`).toBeTruthy();
      expect(height, `Image ${src} missing height`).toBeTruthy();
    }
  });

  test('below-the-fold images have lazy loading', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const rect = await img.boundingBox();
      if (!rect) continue;

      // If image is below the viewport, it should be lazy loaded
      const viewportHeight = page.viewportSize()?.height || 800;
      if (rect.y > viewportHeight) {
        const loading = await img.getAttribute('loading');
        expect(loading, `Below-fold image should be lazy loaded`).toBe(
          'lazy',
        );
      }
    }
  });

  test('images serve modern formats', async ({ page }) => {
    const imageRequests: string[] = [];

    page.on('response', (response) => {
      const contentType = response.headers()['content-type'];
      if (contentType?.startsWith('image/') && !contentType.includes('svg')) {
        imageRequests.push(contentType);
      }
    });

    await page.goto('/articles');
    await page.waitForLoadState('networkidle');

    // At least some images should be WebP or AVIF
    const modernFormats = imageRequests.filter(
      (ct) => ct.includes('webp') || ct.includes('avif'),
    );

    expect(modernFormats.length).toBeGreaterThan(0);
  });
});
```

---

## 8. Running Performance Tests

### Quick Reference

```bash
# k6 load test
k6 run tests/performance/load-test.js

# k6 with custom environment
k6 run --env BASE_URL=https://staging.iloveberlin.biz tests/performance/load-test.js

# k6 spike test
k6 run tests/performance/spike-test.js

# k6 soak test
k6 run tests/performance/soak-test.js

# Lighthouse audit
cd apps/web && lhci autorun

# Bundle size analysis
cd apps/web && ANALYZE=true npm run build

# Image optimization check
cd apps/web && npx playwright test e2e/performance/images.spec.ts
```

### Performance Testing Schedule

| Test | Frequency | Environment | Trigger |
|---|---|---|---|
| Lighthouse CI | Every PR | CI | Automated |
| Bundle size check | Every PR | CI | Automated |
| k6 load test (200 users) | Weekly | Staging | Scheduled |
| k6 spike test | Before releases | Staging | Manual |
| k6 soak test | Monthly | Staging | Manual |
| Core Web Vitals review | Weekly | Production | Dashboard review |
| Database query review | Weekly | Production | Dashboard review |

---

## 9. Performance Regression Handling

When a performance regression is detected:

1. **Lighthouse score drops > 5 points**: Flag in PR, investigate before merge.
2. **Bundle size increases > 10%**: Block merge, require justification or optimization.
3. **API p95 exceeds 500ms**: P2 bug, fix within current sprint.
4. **Core Web Vitals in "Needs Improvement"**: P2 bug, investigate within 1 week.
5. **Core Web Vitals in "Poor"**: P1 bug, fix within 48 hours.
6. **k6 error rate > 1% under normal load**: P1 bug, fix immediately.
