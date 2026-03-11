# ILoveBerlin Platform - Testing Documentation

> Comprehensive testing documentation for the ILoveBerlin platform (iloveberlin.biz).

## Overview

The ILoveBerlin platform employs a multi-layered testing strategy to ensure reliability, performance, and accessibility across all services: the Next.js frontend, NestJS backend API, Flutter mobile application, and supporting infrastructure.

## Documentation Index

| Document | Description |
|---|---|
| [Testing Strategy](./testing-strategy.md) | Overall testing philosophy, pyramid, coverage targets, environments, and CI integration |
| [Unit Testing Guidelines](./unit-testing-guidelines.md) | Jest for NestJS and Next.js, Flutter unit tests, example test structures |
| [Integration Testing Guidelines](./integration-testing-guidelines.md) | API endpoint testing, contract testing, database tests, third-party service mocking |
| [E2E Testing Guidelines](./e2e-testing-guidelines.md) | Playwright web tests, Flutter integration tests, critical user flows |
| [Performance Testing](./performance-testing.md) | k6 load testing, Lighthouse audits, Core Web Vitals, API benchmarks |
| [Accessibility Testing](./accessibility-testing.md) | WCAG 2.1 AA compliance, axe-core, manual testing, mobile accessibility |

## Tech Stack for Testing

| Tool | Purpose |
|---|---|
| **Jest** | Unit and integration testing for NestJS and Next.js |
| **React Testing Library** | Component testing for Next.js |
| **Supertest** | HTTP endpoint testing for NestJS |
| **Playwright** | End-to-end browser testing |
| **Flutter Test** | Unit and widget testing for the mobile app |
| **Flutter Integration Test** | Integration and E2E testing for the mobile app |
| **k6** | Load and performance testing |
| **axe-core** | Automated accessibility testing |
| **Lighthouse** | Performance, SEO, and accessibility audits |
| **Prometheus / Grafana** | Runtime performance monitoring |

## Quick Start

### Running All Tests Locally

```bash
# Backend (NestJS)
cd apps/api
npm run test           # Unit tests
npm run test:e2e       # Integration tests
npm run test:cov       # Coverage report

# Frontend (Next.js)
cd apps/web
npm run test           # Unit tests
npm run test:e2e       # Playwright E2E tests

# Mobile (Flutter)
cd apps/mobile
flutter test           # Unit and widget tests
flutter test integration_test  # Integration tests

# Performance
cd tests/performance
k6 run load-test.js

# Accessibility
cd apps/web
npm run test:a11y
```

### CI Pipeline Test Stages

All tests run automatically in the GitHub Actions CI pipeline:

1. **PR Checks**: Lint, typecheck, unit tests, build verification
2. **Staging Deploy**: Full integration and E2E test suite
3. **Production Deploy**: Smoke tests and performance benchmarks

## Coverage Requirements

| Test Type | Target | Enforcement |
|---|---|---|
| Unit Tests | 80% line coverage | CI gate (blocks merge) |
| Integration Tests | 70% endpoint coverage | CI gate (blocks merge) |
| E2E Tests | All critical user flows | CI gate (blocks merge) |
| Performance | p95 < 500ms API, Lighthouse 90+ | CI warning (manual review) |
| Accessibility | WCAG 2.1 AA | CI gate (blocks merge) |

## Contact

For questions about testing practices, reach out to the engineering team or refer to the individual guideline documents linked above.
