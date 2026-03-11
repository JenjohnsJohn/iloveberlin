# ILoveBerlin - Docker Setup

## Overview

All ILoveBerlin services run in Docker containers, both in development and production. This document covers Dockerfiles, Docker Compose configurations, networking, and volume management.

---

## 1. Dockerfile for Next.js (Multi-Stage Build)

```dockerfile
# apps/web/Dockerfile

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables baked into the build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CDN_URL
ARG NEXT_PUBLIC_R2_PUBLIC_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_ENABLE_CLASSIFIEDS=true
ARG NEXT_PUBLIC_ENABLE_EVENTS=true

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL}
ENV NEXT_PUBLIC_R2_PUBLIC_URL=${NEXT_PUBLIC_R2_PUBLIC_URL}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV NEXT_PUBLIC_ENABLE_CLASSIFIEDS=${NEXT_PUBLIC_ENABLE_CLASSIFIEDS}
ENV NEXT_PUBLIC_ENABLE_EVENTS=${NEXT_PUBLIC_ENABLE_EVENTS}

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what is needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

**Required `next.config.mjs` setting for standalone output:**

```javascript
// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.iloveberlin.biz',
      },
      {
        protocol: 'https',
        hostname: 'staging-assets.iloveberlin.biz',
      },
    ],
  },
};

export default nextConfig;
```

---

## 2. Dockerfile for NestJS (Multi-Stage Build)

```dockerfile
# apps/api/Dockerfile

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---- Stage 3: Production Dependencies ----
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ---- Stage 4: Production Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy compiled application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Copy migration files (needed for runtime migration execution)
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/config/data-source.ts ./src/config/data-source.ts

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## 3. Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ---------- PostgreSQL ----------
  postgres:
    image: postgres:16-alpine
    container_name: iloveberlin-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-iloveberlin_dev}
      POSTGRES_USER: ${POSTGRES_USER:-iloveberlin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dev_password_change_me}
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-iloveberlin}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - iloveberlin

  # ---------- Redis ----------
  redis:
    image: redis:7-alpine
    container_name: iloveberlin-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-}
    ports:
      - '${REDIS_PORT:-6379}:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - iloveberlin

  # ---------- Meilisearch ----------
  meilisearch:
    image: getmeili/meilisearch:v1.6
    container_name: iloveberlin-meilisearch
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY:-dev_master_key_change_me}
      MEILI_ENV: development
    ports:
      - '${MEILI_PORT:-7700}:7700'
    volumes:
      - meili_data:/meili_data
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:7700/health']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - iloveberlin

  # ---------- MinIO (R2 Replacement for Development) ----------
  minio:
    image: minio/minio:latest
    container_name: iloveberlin-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio_user
      MINIO_ROOT_PASSWORD: minio_password
    ports:
      - '9000:9000'
      - '9001:9001'  # MinIO Console
    volumes:
      - minio_data:/data
    networks:
      - iloveberlin

  # ---------- Prometheus ----------
  prometheus:
    image: prom/prometheus:v2.51.0
    container_name: iloveberlin-prometheus
    restart: unless-stopped
    volumes:
      - ./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - '9090:9090'
    networks:
      - iloveberlin

  # ---------- Grafana ----------
  grafana:
    image: grafana/grafana:10.4.0
    container_name: iloveberlin-grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_USERS_ALLOW_SIGN_UP: 'false'
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning
    ports:
      - '3100:3000'
    depends_on:
      - prometheus
    networks:
      - iloveberlin

volumes:
  postgres_data:
  redis_data:
  meili_data:
  minio_data:
  prometheus_data:
  grafana_data:

networks:
  iloveberlin:
    driver: bridge
```

---

## 4. Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # ---------- Next.js Web ----------
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://iloveberlin.biz/api/v1
        NEXT_PUBLIC_SITE_URL: https://iloveberlin.biz
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${PROD_STRIPE_PUBLISHABLE_KEY}
        NEXT_PUBLIC_CDN_URL: https://assets.iloveberlin.biz
        NEXT_PUBLIC_R2_PUBLIC_URL: https://assets.iloveberlin.biz
        NEXT_PUBLIC_GA_MEASUREMENT_ID: ${PROD_GA_MEASUREMENT_ID}
    container_name: iloveberlin-web
    restart: always
    expose:
      - '3000'
    environment:
      NODE_ENV: production
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 5s
      start_period: 15s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
    networks:
      - iloveberlin
    logging:
      driver: json-file
      options:
        max-size: '10m'
        max-file: '3'

  # ---------- NestJS API ----------
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: iloveberlin-api
    restart: always
    expose:
      - '3001'
    env_file:
      - ./apps/api/.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      meilisearch:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3001/api/v1/health']
      interval: 30s
      timeout: 5s
      start_period: 15s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '2.0'
        reservations:
          memory: 512M
    networks:
      - iloveberlin
    logging:
      driver: json-file
      options:
        max-size: '10m'
        max-file: '5'

  # ---------- PostgreSQL ----------
  postgres:
    image: postgres:16-alpine
    container_name: iloveberlin-postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
    networks:
      - iloveberlin
    logging:
      driver: json-file
      options:
        max-size: '10m'
        max-file: '3'

  # ---------- Redis ----------
  redis:
    image: redis:7-alpine
    container_name: iloveberlin-redis
    restart: always
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --save 60 1000
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD}', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M
    networks:
      - iloveberlin

  # ---------- Meilisearch ----------
  meilisearch:
    image: getmeili/meilisearch:v1.6
    container_name: iloveberlin-meilisearch
    restart: always
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
      MEILI_MAX_INDEXING_MEMORY: 1073741824  # 1GB
    volumes:
      - meili_data:/meili_data
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:7700/health']
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G
    networks:
      - iloveberlin

  # ---------- Nginx ----------
  nginx:
    image: nginx:1.25-alpine
    container_name: iloveberlin-nginx
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./config/nginx/ssl:/etc/nginx/ssl:ro
      - nginx_cache:/var/cache/nginx
    depends_on:
      web:
        condition: service_healthy
      api:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'nginx', '-t']
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
    networks:
      - iloveberlin
    logging:
      driver: json-file
      options:
        max-size: '10m'
        max-file: '5'

  # ---------- Prometheus ----------
  prometheus:
    image: prom/prometheus:v2.51.0
    container_name: iloveberlin-prometheus
    restart: always
    volumes:
      - ./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./config/prometheus/alerts.yml:/etc/prometheus/alerts.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
      - '--storage.tsdb.retention.size=5GB'
    deploy:
      resources:
        limits:
          memory: 512M
    networks:
      - iloveberlin

  # ---------- Grafana ----------
  grafana:
    image: grafana/grafana:10.4.0
    container_name: iloveberlin-grafana
    restart: always
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: 'false'
      GF_SERVER_ROOT_URL: https://monitoring.iloveberlin.biz
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning:ro
    expose:
      - '3000'
    depends_on:
      - prometheus
    deploy:
      resources:
        limits:
          memory: 256M
    networks:
      - iloveberlin

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  meili_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
  nginx_cache:
    driver: local

networks:
  iloveberlin:
    driver: bridge
```

---

## 5. Volume Mounts

### Data Persistence

| Volume | Container | Mount Point | Purpose |
|---|---|---|---|
| `postgres_data` | postgres | `/var/lib/postgresql/data` | Database files |
| `redis_data` | redis | `/data` | Redis persistence (RDB snapshots) |
| `meili_data` | meilisearch | `/meili_data` | Search index data |
| `prometheus_data` | prometheus | `/prometheus` | Metrics time-series data |
| `grafana_data` | grafana | `/var/lib/grafana` | Dashboards, plugins, settings |
| `nginx_cache` | nginx | `/var/cache/nginx` | Nginx proxy cache |

### Configuration Mounts (Read-Only in Production)

| Host Path | Container | Mount Point |
|---|---|---|
| `config/nginx/nginx.conf` | nginx | `/etc/nginx/nginx.conf` |
| `config/nginx/conf.d/` | nginx | `/etc/nginx/conf.d/` |
| `config/prometheus/prometheus.yml` | prometheus | `/etc/prometheus/prometheus.yml` |
| `config/grafana/provisioning/` | grafana | `/etc/grafana/provisioning/` |
| `config/postgres/postgresql.conf` | postgres | `/etc/postgresql/postgresql.conf` |

### Backup-Critical Volumes

The following volumes must be backed up regularly (see [Backup Strategy](./backup-strategy.md)):

1. `postgres_data` -- critical, backed up via pg_dump and WAL archiving
2. `meili_data` -- important, can be rebuilt from PostgreSQL if lost
3. `grafana_data` -- nice to have, dashboards can be re-provisioned from config

---

## 6. Networking

### Docker Network

All services communicate over the `iloveberlin` bridge network. Only Nginx exposes ports to the host.

```
Host Machine
  |
  +-- port 80/443 --> [nginx]
                        |
                        +-- internal:3000 --> [web (Next.js)]
                        +-- internal:3001 --> [api (NestJS)]
                                               |
                                               +-- internal:5432 --> [postgres]
                                               +-- internal:6379 --> [redis]
                                               +-- internal:7700 --> [meilisearch]
```

### Port Exposure Rules

| Environment | Service | Exposed to Host? |
|---|---|---|
| Development | All services | Yes (for direct access) |
| Production | Nginx only | Yes (80, 443) |
| Production | All other services | No (`expose` only, internal network) |

### DNS Resolution

Within the Docker network, services resolve each other by container name:
- `postgres:5432`
- `redis:6379`
- `meilisearch:7700`
- `web:3000`
- `api:3001`

---

## 7. Docker Build and Deploy Commands

### Local Development

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f api web

# Rebuild a specific service
docker compose build api
docker compose up -d api

# Stop all services
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

### Production Deployment

```bash
# Pull latest images (if using a registry)
docker compose -f docker-compose.prod.yml pull

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker compose -f docker-compose.prod.yml exec api npx typeorm migration:run -d dist/config/data-source.js

# Rolling restart of a single service
docker compose -f docker-compose.prod.yml up -d --no-deps --build api

# View production logs
docker compose -f docker-compose.prod.yml logs -f --tail=100 api

# Check service health
docker compose -f docker-compose.prod.yml ps
```

### Useful Maintenance Commands

```bash
# Enter a running container
docker compose exec api sh
docker compose exec postgres psql -U iloveberlin -d iloveberlin_prod

# Check disk usage
docker system df

# Clean up unused images and containers
docker system prune -f

# Clean up unused volumes (careful!)
docker volume prune -f

# Export database from container
docker compose exec postgres pg_dump -U iloveberlin iloveberlin_prod > backup.sql
```

---

## 8. PostgreSQL Production Configuration

```ini
# config/postgres/postgresql.conf
# Tuned for Hetzner CX41 (8 vCPU, 16 GB RAM)

# Connection Settings
listen_addresses = '*'
max_connections = 100
superuser_reserved_connections = 3

# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 16MB
maintenance_work_mem = 512MB
wal_buffers = 64MB

# Write Ahead Log
wal_level = replica
max_wal_size = 2GB
min_wal_size = 512MB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1         # SSD storage
effective_io_concurrency = 200  # SSD storage
default_statistics_target = 100

# Logging
log_min_duration_statement = 100  # Log queries slower than 100ms
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_statement = 'ddl'
log_temp_files = 0

# Autovacuum
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 60

# Extensions
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
```
