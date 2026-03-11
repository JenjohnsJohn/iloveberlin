# ILoveBerlin - Environment Setup

## Overview

The ILoveBerlin platform runs in three environments: **Development** (local Docker), **Staging** (Hetzner), and **Production** (Hetzner). Each environment has its own configuration, database, and external service credentials.

---

## 1. Environment Matrix

| Property | Development | Staging | Production |
|---|---|---|---|
| **URL** | `http://localhost:3000` | `https://staging.iloveberlin.biz` | `https://iloveberlin.biz` |
| **API URL** | `http://localhost:3001` | `https://staging.iloveberlin.biz/api` | `https://iloveberlin.biz/api` |
| **Server** | Local Docker | Hetzner CX31 | Hetzner CX41 |
| **Database** | Docker PostgreSQL | Hetzner PostgreSQL | Hetzner PostgreSQL |
| **Stripe** | Test mode | Test mode | Live mode |
| **Brevo (Email)** | Console output / Mailtrap | Sandbox list | Live |
| **R2 Storage** | Local MinIO or R2 dev bucket | R2 staging bucket | R2 production bucket |
| **Cloudflare** | N/A | Proxied (staging subdomain) | Proxied (full CDN) |
| **Monitoring** | Docker Prometheus + Grafana | Full stack | Full stack |

---

## 2. Development Environment (Local Docker)

### Prerequisites

- Docker Desktop 4.x+
- Node.js 20 LTS
- Flutter 3.24+
- Git

### Setup

```bash
# Clone the repository
git clone git@github.com:iloveberlin/iloveberlin.git
cd iloveberlin

# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start infrastructure services
docker compose up -d

# Install dependencies and run migrations
cd apps/api
npm install
npx typeorm migration:run -d src/config/data-source.ts

cd ../web
npm install

# Start development servers
# Terminal 1: API
cd apps/api && npm run start:dev

# Terminal 2: Web
cd apps/web && npm run dev
```

### Local Environment Variables

#### Root `.env` (Docker Compose)

```bash
# Database
POSTGRES_DB=iloveberlin_dev
POSTGRES_USER=iloveberlin
POSTGRES_PASSWORD=dev_password_change_me
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Meilisearch
MEILI_MASTER_KEY=dev_master_key_change_me
MEILI_PORT=7700
```

#### `apps/api/.env`

```bash
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=iloveberlin
DATABASE_PASSWORD=dev_password_change_me
DATABASE_NAME=iloveberlin_dev
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=dev-jwt-refresh-secret-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=dev_master_key_change_me

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# Brevo (Email) - dev mode: log to console
BREVO_API_KEY=xkeysib-dev-xxxxxxxxxxxx
BREVO_SENDER_EMAIL=noreply@iloveberlin.biz
BREVO_SENDER_NAME=ILoveBerlin
EMAIL_MODE=console  # 'console' in dev, 'smtp' in staging/prod

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=dev_access_key
R2_SECRET_ACCESS_KEY=dev_secret_key
R2_BUCKET_NAME=iloveberlin-dev
R2_PUBLIC_URL=https://dev-assets.iloveberlin.biz

# Upload
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/avif

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
```

#### `apps/web/.env`

```bash
# Application
NODE_ENV=development
PORT=3000

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# Analytics (disabled in dev)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=

# Feature Flags
NEXT_PUBLIC_ENABLE_CLASSIFIEDS=true
NEXT_PUBLIC_ENABLE_EVENTS=true
NEXT_PUBLIC_ENABLE_PREMIUM=true

# Image optimization
NEXT_PUBLIC_CDN_URL=http://localhost:3001
NEXT_PUBLIC_R2_PUBLIC_URL=https://dev-assets.iloveberlin.biz
```

#### `apps/mobile/.env`

```bash
API_URL=http://10.0.2.2:3001/api/v1  # Android emulator
# API_URL=http://localhost:3001/api/v1  # iOS simulator
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
ENVIRONMENT=development
```

---

## 3. Staging Environment (Hetzner)

### Server Details

| Property | Value |
|---|---|
| Provider | Hetzner Cloud |
| Type | CX31 (4 vCPU, 8 GB RAM, 80 GB SSD) |
| OS | Ubuntu 24.04 LTS |
| Location | Falkenstein, Germany |
| Hostname | `staging.iloveberlin.biz` |
| IP | Configured via Cloudflare DNS |

### Staging Environment Variables

Environment variables on staging are managed via a `.env.staging` file on the server at `/opt/iloveberlin/.env`, with secrets injected via GitHub Actions from repository secrets.

#### `apps/api/.env` (staging)

```bash
# Application
NODE_ENV=staging
PORT=3001
API_PREFIX=api/v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=iloveberlin_staging
DATABASE_PASSWORD=${STAGING_DB_PASSWORD}  # From GitHub Secrets
DATABASE_NAME=iloveberlin_staging
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${STAGING_REDIS_PASSWORD}

# JWT
JWT_SECRET=${STAGING_JWT_SECRET}
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=${STAGING_JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRATION=7d

# Meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=${STAGING_MEILI_KEY}

# Stripe (Test Mode)
STRIPE_SECRET_KEY=${STAGING_STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STAGING_STRIPE_WEBHOOK_SECRET}
STRIPE_PUBLISHABLE_KEY=${STAGING_STRIPE_PUBLISHABLE_KEY}

# Brevo (Sandbox)
BREVO_API_KEY=${STAGING_BREVO_API_KEY}
BREVO_SENDER_EMAIL=noreply@staging.iloveberlin.biz
BREVO_SENDER_NAME=ILoveBerlin Staging
EMAIL_MODE=smtp

# R2 Storage (Staging Bucket)
R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
R2_ACCESS_KEY_ID=${STAGING_R2_ACCESS_KEY}
R2_SECRET_ACCESS_KEY=${STAGING_R2_SECRET_KEY}
R2_BUCKET_NAME=iloveberlin-staging
R2_PUBLIC_URL=https://staging-assets.iloveberlin.biz

# CORS
CORS_ORIGINS=https://staging.iloveberlin.biz

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info

# Test endpoints (only for staging)
ENABLE_TEST_ENDPOINTS=true
E2E_TEST_SECRET=${STAGING_E2E_TEST_SECRET}
```

---

## 4. Production Environment (Hetzner)

### Server Details

| Property | Value |
|---|---|
| Provider | Hetzner Cloud |
| Type | CX41 (8 vCPU, 16 GB RAM, 160 GB SSD) |
| OS | Ubuntu 24.04 LTS |
| Location | Falkenstein, Germany |
| Hostname | `iloveberlin.biz` |
| IP | Configured via Cloudflare DNS |

### Production Environment Variables

Production secrets are never stored in code. They are managed via:
1. **GitHub Actions Secrets** for CI/CD deployment
2. **Server-side `.env`** file at `/opt/iloveberlin/.env` with restricted permissions (`chmod 600`)

#### `apps/api/.env` (production)

```bash
# Application
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=iloveberlin_prod
DATABASE_PASSWORD=${PROD_DB_PASSWORD}
DATABASE_NAME=iloveberlin_prod
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${PROD_REDIS_PASSWORD}

# JWT
JWT_SECRET=${PROD_JWT_SECRET}
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=${PROD_JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRATION=7d

# Meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=${PROD_MEILI_KEY}

# Stripe (Live Mode)
STRIPE_SECRET_KEY=${PROD_STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${PROD_STRIPE_WEBHOOK_SECRET}
STRIPE_PUBLISHABLE_KEY=${PROD_STRIPE_PUBLISHABLE_KEY}

# Brevo (Live)
BREVO_API_KEY=${PROD_BREVO_API_KEY}
BREVO_SENDER_EMAIL=noreply@iloveberlin.biz
BREVO_SENDER_NAME=ILoveBerlin
EMAIL_MODE=smtp

# R2 Storage (Production Bucket)
R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
R2_ACCESS_KEY_ID=${PROD_R2_ACCESS_KEY}
R2_SECRET_ACCESS_KEY=${PROD_R2_SECRET_KEY}
R2_BUCKET_NAME=iloveberlin-prod
R2_PUBLIC_URL=https://assets.iloveberlin.biz

# CORS
CORS_ORIGINS=https://iloveberlin.biz,https://www.iloveberlin.biz

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=60

# Logging
LOG_LEVEL=warn

# Test endpoints (disabled in production)
ENABLE_TEST_ENDPOINTS=false
```

---

## 5. Secrets Management

### GitHub Actions Secrets

All secrets are stored in GitHub repository settings under **Settings > Secrets and variables > Actions**.

#### Required Secrets

| Secret Name | Used In | Description |
|---|---|---|
| `STAGING_SSH_KEY` | Staging deploy | SSH private key for deploy user on staging |
| `STAGING_SSH_HOST` | Staging deploy | Staging server IP or hostname |
| `PROD_SSH_KEY` | Production deploy | SSH private key for deploy user on production |
| `PROD_SSH_HOST` | Production deploy | Production server IP or hostname |
| `STAGING_DB_PASSWORD` | Staging | PostgreSQL password for staging |
| `PROD_DB_PASSWORD` | Production | PostgreSQL password for production |
| `STAGING_JWT_SECRET` | Staging | JWT signing secret for staging |
| `PROD_JWT_SECRET` | Production | JWT signing secret for production |
| `STAGING_JWT_REFRESH_SECRET` | Staging | JWT refresh token secret for staging |
| `PROD_JWT_REFRESH_SECRET` | Production | JWT refresh token secret for production |
| `STAGING_REDIS_PASSWORD` | Staging | Redis password for staging |
| `PROD_REDIS_PASSWORD` | Production | Redis password for production |
| `STAGING_STRIPE_SECRET_KEY` | Staging | Stripe test-mode secret key |
| `PROD_STRIPE_SECRET_KEY` | Production | Stripe live-mode secret key |
| `STAGING_STRIPE_WEBHOOK_SECRET` | Staging | Stripe webhook signing secret |
| `PROD_STRIPE_WEBHOOK_SECRET` | Production | Stripe webhook signing secret |
| `R2_ACCOUNT_ID` | Both | Cloudflare account ID |
| `STAGING_R2_ACCESS_KEY` | Staging | R2 access key for staging bucket |
| `STAGING_R2_SECRET_KEY` | Staging | R2 secret key for staging bucket |
| `PROD_R2_ACCESS_KEY` | Production | R2 access key for production bucket |
| `PROD_R2_SECRET_KEY` | Production | R2 secret key for production bucket |
| `STAGING_BREVO_API_KEY` | Staging | Brevo API key for staging |
| `PROD_BREVO_API_KEY` | Production | Brevo API key for production |
| `STAGING_MEILI_KEY` | Staging | Meilisearch master key for staging |
| `PROD_MEILI_KEY` | Production | Meilisearch master key for production |
| `STAGING_E2E_TEST_SECRET` | Staging | Secret for enabling E2E test endpoints |
| `DOCKER_REGISTRY_TOKEN` | Both | Container registry authentication |

### Secret Rotation Policy

| Secret Type | Rotation Frequency | Procedure |
|---|---|---|
| Database passwords | Every 90 days | Update GitHub secret, rotate on server, restart services |
| JWT secrets | Every 90 days | Update GitHub secret, deploy, (existing tokens expire naturally) |
| API keys (Stripe, Brevo) | On compromise only | Regenerate in provider dashboard, update GitHub secret, deploy |
| SSH keys | Every 180 days | Generate new key pair, update authorized_keys, update GitHub secret |
| Redis passwords | Every 90 days | Update GitHub secret, rotate on server, restart services |

### Environment Variable Validation

On application startup, validate that all required environment variables are present:

```typescript
// apps/api/src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsEnum, IsBoolean, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  REDIS_HOST: string;

  @IsString()
  STRIPE_SECRET_KEY: string;

  @IsString()
  BREVO_API_KEY: string;

  @IsString()
  R2_BUCKET_NAME: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors
        .map((e) => Object.values(e.constraints || {}).join(', '))
        .join('\n')}`,
    );
  }

  return validatedConfig;
}
```

---

## 6. Environment-Specific Configuration

### Feature Flags

| Flag | Development | Staging | Production |
|---|---|---|---|
| `ENABLE_TEST_ENDPOINTS` | `true` | `true` | `false` |
| `ENABLE_CLASSIFIEDS` | `true` | `true` | `true` |
| `ENABLE_EVENTS` | `true` | `true` | `true` |
| `ENABLE_PREMIUM` | `true` | `true` | `true` |
| `ENABLE_SWAGGER` | `true` | `true` | `false` |

### Logging Levels

| Environment | API Log Level | Web Log Level |
|---|---|---|
| Development | `debug` | `debug` |
| Staging | `info` | `info` |
| Production | `warn` | `error` |

### Rate Limiting

| Environment | Requests per Minute (per IP) |
|---|---|
| Development | 100 |
| Staging | 100 |
| Production | 60 |

### Database Connection Pool

| Environment | Pool Size | Idle Timeout |
|---|---|---|
| Development | 5 | 30s |
| Staging | 10 | 60s |
| Production | 20 | 120s |
