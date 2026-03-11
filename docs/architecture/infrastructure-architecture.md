# Infrastructure Architecture

**Platform:** ILoveBerlin (iloveberlin.biz)
**Last Updated:** 2026-03-12

---

## Table of Contents

1. [Hetzner Server Layout](#hetzner-server-layout)
2. [Docker Compose Services](#docker-compose-services)
3. [Nginx Configuration Strategy](#nginx-configuration-strategy)
4. [Cloudflare Setup](#cloudflare-setup)
5. [Network Topology](#network-topology)
6. [Staging vs Production Differences](#staging-vs-production-differences)
7. [Deployment Pipeline](#deployment-pipeline)
8. [Backup Strategy](#backup-strategy)
9. [Monitoring and Alerting](#monitoring-and-alerting)

---

## Hetzner Server Layout

### Production Server

```
Server: Hetzner CX41 (Cloud VPS)
├── Location:   Falkenstein, Germany (FSN1)
├── vCPU:       4 dedicated cores (AMD EPYC)
├── RAM:        16 GB
├── Storage:    160 GB NVMe SSD
├── Network:    1 Gbps (20 TB included traffic)
├── OS:         Ubuntu 24.04 LTS
├── IP:         1x IPv4 + 1x IPv6 /64
└── Cost:       ~EUR 15.90/month

Disk Layout:
├── /              50 GB  (OS + Docker images)
├── /var/lib/docker 60 GB  (Container volumes)
├── /var/lib/postgresql 30 GB  (PostgreSQL data)
├── /var/backups   20 GB  (Local backup staging)
└── Free           ~10 GB (buffer)
```

### Staging Server

```
Server: Hetzner CX21 (Cloud VPS)
├── Location:   Falkenstein, Germany (FSN1)
├── vCPU:       2 shared cores
├── RAM:        4 GB
├── Storage:    40 GB NVMe SSD
├── OS:         Ubuntu 24.04 LTS
└── Cost:       ~EUR 5.39/month
```

### Hetzner Cloud Network

```
Hetzner Cloud Network: 10.0.0.0/16
│
├── Production Server:  10.0.1.1
├── Staging Server:     10.0.1.2
└── (Future) DB Server: 10.0.2.1   (if separate DB needed)

Private network used for:
├── Server-to-server communication (if multi-server)
├── Backup transfer
└── Future horizontal scaling
```

---

## Docker Compose Services

### Production Docker Compose

```yaml
# docker-compose.prod.yml (structure overview)

version: '3.9'

services:

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d/:/etc/nginx/conf.d/:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - nextjs
      - nestjs
    restart: always
    networks:
      - frontend

  nextjs:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://iloveberlin.biz/api/v1
      - INTERNAL_API_URL=http://nestjs:4000/api/v1
    depends_on:
      - nestjs
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    networks:
      - frontend
      - backend

  nestjs:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    expose:
      - "4000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - REDIS_HOST=redis
      - MEILI_HOST=http://meilisearch:7700
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      meilisearch:
        condition: service_started
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: '0.75'
    networks:
      - backend

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    expose:
      - "5432"
    restart: always
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    expose:
      - "6379"
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  meilisearch:
    image: getmeili/meilisearch:v1.6
    volumes:
      - meili_data:/meili_data
    environment:
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
      - MEILI_ENV=production
      - MEILI_MAX_INDEXING_MEMORY=1024Mb
    expose:
      - "7700"
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
    networks:
      - backend

  prometheus:
    image: prom/prometheus:v2.48
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    expose:
      - "9090"
    restart: always
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:10.2
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_SERVER_ROOT_URL=https://iloveberlin.biz/grafana
    expose:
      - "3100"
    restart: always
    networks:
      - monitoring
      - frontend

  node-exporter:
    image: prom/node-exporter:v1.7
    expose:
      - "9100"
    restart: always
    networks:
      - monitoring

volumes:
  postgres_data:
  redis_data:
  meili_data:
  prometheus_data:
  grafana_data:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
  monitoring:
    driver: bridge
    internal: true
```

### Service Architecture Map

```
                         EXPOSED TO HOST
                         ┌──────────────┐
                         │   Port 80    │
                         │   Port 443   │
                         └──────+───────┘
                                |
                    ════════════|════════════
                    ║    FRONTEND NETWORK    ║
                    ║                        ║
                    ║  ┌────────────────┐    ║
                    ║  │    NGINX       │    ║
                    ║  │  (reverse      │    ║
                    ║  │   proxy)       │    ║
                    ║  └───┬────┬───────┘    ║
                    ║      |    |             ║
                    ║      |    |  ┌────────┐ ║
                    ║      |    +->│Grafana │ ║
                    ║      |       │ :3100  │ ║
                    ║      |       └────────┘ ║
                    ║      |                  ║
                    ║  ┌───+──────────┐       ║
                    ║  │  Next.js x2  │       ║
                    ║  │  :3000       │       ║
                    ║  └───+──────────┘       ║
                    ║      |                  ║
                    ════════|══════════════════
                           |
                    ════════|══════════════════
                    ║  BACKEND NETWORK        ║
                    ║  (internal only)        ║
                    ║                         ║
                    ║  ┌──────────────┐       ║
                    ║  │  NestJS x2   │       ║
                    ║  │  :4000       │       ║
                    ║  └──┬──┬──┬─────┘       ║
                    ║     |  |  |              ║
                    ║     |  |  |              ║
                    ║  ┌──+──+──+──────────┐  ║
                    ║  │  │  │  │          │  ║
                    ║  │  v  v  v          │  ║
                    ║  │ PG Redis Meili    │  ║
                    ║  │5432 6379  7700    │  ║
                    ║  └──────────────────┘   ║
                    ║                         ║
                    ═══════════════════════════

                    ═══════════════════════════
                    ║  MONITORING NETWORK     ║
                    ║  (internal only)        ║
                    ║                         ║
                    ║  Prometheus  :9090      ║
                    ║  Grafana     :3100      ║
                    ║  Node Export :9100      ║
                    ║                         ║
                    ═══════════════════════════
```

---

## Nginx Configuration Strategy

### Main Configuration

```
nginx/
├── nginx.conf                   # Main config (worker processes, events, http block)
├── conf.d/
│   ├── default.conf             # Main server block for iloveberlin.biz
│   ├── upstream.conf            # Upstream server definitions
│   ├── security.conf            # Security headers (included)
│   ├── cache.conf               # Caching directives (included)
│   ├── gzip.conf                # Compression settings (included)
│   └── rate-limit.conf          # Rate limiting zones (included)
└── ssl/                         # SSL certificates (managed by Cloudflare)
```

### Upstream Configuration

```
# upstream.conf

upstream nextjs_upstream {
    least_conn;
    server nextjs-1:3000;
    server nextjs-2:3000;
    keepalive 32;
}

upstream nestjs_upstream {
    least_conn;
    server nestjs-1:4000;
    server nestjs-2:4000;
    keepalive 32;
}

upstream grafana_upstream {
    server grafana:3100;
}
```

### Server Block

```
# default.conf (simplified)

server {
    listen 80;
    server_name iloveberlin.biz www.iloveberlin.biz;

    # Cloudflare real IP restoration
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    # ... (all Cloudflare IP ranges)
    real_ip_header CF-Connecting-IP;

    include conf.d/security.conf;
    include conf.d/gzip.conf;

    # Health check (bypasses all processing)
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # API routes -> NestJS
    location /api/ {
        include conf.d/rate-limit.conf;
        proxy_pass http://nestjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # API-specific cache headers
        add_header Cache-Control "no-store";
        add_header X-Content-Type-Options nosniff;
    }

    # Webhook routes -> NestJS (no rate limiting)
    location /api/v1/webhooks/ {
        proxy_pass http://nestjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Grafana dashboard (admin only, behind auth)
    location /grafana/ {
        proxy_pass http://grafana_upstream/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Static assets with long cache
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://nextjs_upstream;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600";
    }

    # All other routes -> Next.js
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Headers

```
# security.conf

# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions policy
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Content Security Policy
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.iloveberlin.biz https://*.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.stripe.com https://*.google-analytics.com;
    frame-src https://js.stripe.com;
    object-src 'none';
    base-uri 'self';
" always;

# HSTS (1 year, includeSubDomains)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## Cloudflare Setup

### DNS Configuration

```
DNS Records (iloveberlin.biz):

Type   Name              Content              Proxy    TTL
────── ──────────────── ────────────────────── ──────── ──────
A      iloveberlin.biz   <Hetzner IPv4>       Proxied  Auto
AAAA   iloveberlin.biz   <Hetzner IPv6>       Proxied  Auto
CNAME  www               iloveberlin.biz      Proxied  Auto
CNAME  staging           <Staging IPv4>       Proxied  Auto
A      mail              <Mail server IP>     DNS only 3600
MX     iloveberlin.biz   mail.iloveberlin.biz DNS only 3600
TXT    iloveberlin.biz   v=spf1 ...           DNS only 3600
TXT    _dmarc            v=DMARC1; ...        DNS only 3600
```

### SSL/TLS Configuration

```
SSL/TLS Settings:
├── Encryption Mode:     Full (Strict)
├── Minimum TLS Version: TLS 1.2
├── TLS 1.3:             Enabled
├── Automatic HTTPS:     Enabled (redirect HTTP -> HTTPS)
├── HSTS:                Enabled (max-age=31536000, includeSubDomains)
├── Certificate:         Cloudflare Universal SSL (edge)
├── Origin Certificate:  Cloudflare Origin CA (15-year, installed on Nginx)
└── Authenticated Origin Pulls: Enabled
```

### WAF (Web Application Firewall)

```
WAF Configuration:
│
├── Managed Rulesets:
│   ├── Cloudflare Managed Ruleset:    Enabled (default action)
│   ├── Cloudflare OWASP Core Ruleset: Enabled (sensitivity: medium)
│   └── Cloudflare Leaked Credentials: Enabled
│
├── Custom WAF Rules:
│   │
│   ├── Rule 1: Block known bad bots
│   │   Expression: (cf.client.bot and not cf.bot_management.verified_bot)
│   │   Action: Block
│   │
│   ├── Rule 2: Rate limit login attempts
│   │   Expression: (http.request.uri.path eq "/api/v1/auth/login")
│   │   Action: Rate limit (10 requests per minute per IP)
│   │
│   ├── Rule 3: Block non-DE/EU registration abuse
│   │   Expression: (http.request.uri.path eq "/api/v1/auth/register"
│   │                and not ip.geoip.continent eq "EU"
│   │                and http.request.method eq "POST")
│   │   Action: Challenge (JS challenge)
│   │
│   ├── Rule 4: Protect admin panel
│   │   Expression: (http.request.uri.path contains "/admin"
│   │                and not ip.src in {office_ip_list})
│   │   Action: Challenge (Managed challenge)
│   │
│   └── Rule 5: Block excessive API usage
│       Expression: (http.request.uri.path contains "/api/"
│                    and not http.request.uri.path contains "/webhooks/")
│       Action: Rate limit (200 requests per minute per IP)
│
└── IP Access Rules:
    ├── Whitelist: Office/developer IPs
    ├── Whitelist: Stripe webhook IPs
    └── Blocklist: Known abuse IPs (manual)
```

### Caching Rules

```
Cloudflare Cache Rules:
│
├── Rule 1: Static Assets (aggressive cache)
│   Match: (http.request.uri.path contains "/_next/static/")
│   Edge TTL: 1 year
│   Browser TTL: 1 year
│   Cache Level: Cache Everything
│
├── Rule 2: Images/Media
│   Match: (http.request.uri.path.extension in {"jpg" "jpeg" "png" "webp" "avif" "gif" "svg" "ico"})
│   Edge TTL: 30 days
│   Browser TTL: 7 days
│   Cache Level: Cache Everything
│
├── Rule 3: API responses (no cache at edge)
│   Match: (http.request.uri.path contains "/api/")
│   Cache Level: Bypass
│
├── Rule 4: HTML pages (respect origin cache headers)
│   Match: (http.response.content_type.media_type eq "text/html")
│   Edge TTL: Respect origin Cache-Control
│   Browser TTL: Respect origin Cache-Control
│
├── Rule 5: Admin panel (no cache)
│   Match: (http.request.uri.path contains "/admin")
│   Cache Level: Bypass
│
└── Rule 6: Auth pages (no cache)
    Match: (http.request.uri.path contains "/auth" or
            http.request.uri.path contains "/account")
    Cache Level: Bypass
```

### Page Rules (Legacy, migrating to Cache Rules)

```
Page Rules:
├── *iloveberlin.biz/api/*          -> Cache Level: Bypass
├── *iloveberlin.biz/admin/*        -> Cache Level: Bypass, Security: High
├── *iloveberlin.biz/auth/*         -> Cache Level: Bypass
├── *iloveberlin.biz/*.js           -> Cache Level: Cache Everything, Edge TTL: 1 month
├── *iloveberlin.biz/*.css          -> Cache Level: Cache Everything, Edge TTL: 1 month
└── www.iloveberlin.biz/*           -> 301 Redirect to https://iloveberlin.biz/$1
```

### Cloudflare R2 Configuration

```
R2 Bucket: iloveberlin-media
│
├── Custom Domain: cdn.iloveberlin.biz (CNAME -> R2 bucket)
├── Public Access: Enabled (via custom domain)
├── CORS Policy:
│   ├── Allowed Origins: https://iloveberlin.biz, https://staging.iloveberlin.biz
│   ├── Allowed Methods: GET, PUT, HEAD
│   ├── Allowed Headers: Content-Type, Authorization, X-Amz-*
│   └── Max Age: 3600
│
├── Lifecycle Rules:
│   ├── Delete incomplete multipart uploads after 1 day
│   └── (No expiration rules - media is permanent)
│
└── Access:
    ├── S3 API endpoint: https://<account-id>.r2.cloudflarestorage.com
    ├── Access Key ID: stored in .env
    └── Secret Access Key: stored in .env
```

---

## Network Topology

```
                    INTERNET
                       |
           +-----------+-----------+
           |                       |
     Web Browsers            Mobile Apps
     (iloveberlin.biz)       (iOS/Android)
           |                       |
           +-----------+-----------+
                       |
              +--------+--------+
              |   CLOUDFLARE    |
              |                 |
              | ┌─────────────┐ |
              | │  DNS Proxy  │ |
              | │  SSL/TLS    │ |
              | │  WAF        │ |
              | │  CDN Cache  │ |
              | │  DDoS Prot. │ |
              | └──────+──────┘ |
              |        |        |
              | ┌──────+──────┐ |
              | │  R2 Storage │ |     cdn.iloveberlin.biz
              | │  (Media)    │ |<--- (images, videos)
              | └─────────────┘ |
              +--------+--------+
                       |
                       | Origin pull
                       | (HTTPS, Full Strict)
                       |
          +============+============+
          |    HETZNER DATA CENTER  |
          |    (Falkenstein, DE)     |
          |                         |
          |  ┌─────────────────┐    |
          |  │ Firewall (UFW)  │    |
          |  │ Allow: 80, 443  │    |
          |  │ Allow: 22 (SSH) │    |
          |  │ from admin IPs  │    |
          |  └────────+────────┘    |
          |           |             |
          |  +--------+--------+   |
          |  |  Production VPS |   |
          |  |  (CX41)         |   |
          |  |                 |   |
          |  | Docker Network  |   |
          |  | (see above)     |   |
          |  +-----------------+   |
          |           |             |
          |  Private Network       |
          |  10.0.0.0/16           |
          |           |             |
          |  +--------+--------+   |
          |  |  Staging VPS    |   |
          |  |  (CX21)         |   |
          |  +-----------------+   |
          |                         |
          +=========================+
```

### Firewall Rules (UFW)

```
Production Server Firewall:
├── Default: Deny incoming, Allow outgoing
├── Allow 80/tcp   (HTTP - Cloudflare IPs only)
├── Allow 443/tcp  (HTTPS - Cloudflare IPs only)
├── Allow 22/tcp   (SSH - admin IPs only)
├── Allow from 10.0.0.0/16 (Hetzner private network)
└── Deny everything else
```

---

## Staging vs Production Differences

| Aspect               | Staging                          | Production                        |
| -------------------- | -------------------------------- | --------------------------------- |
| **Server**           | Hetzner CX21 (2 vCPU, 4 GB)     | Hetzner CX41 (4 vCPU, 16 GB)     |
| **URL**              | staging.iloveberlin.biz          | iloveberlin.biz                   |
| **Replicas**         | 1 each (Next.js, NestJS)         | 2 each (Next.js, NestJS)          |
| **PostgreSQL Memory**| 512 MB limit                     | 2 GB limit                        |
| **Redis Memory**     | 128 MB limit                     | 512 MB limit                      |
| **Meilisearch Memory**| 256 MB limit                    | 1 GB limit                        |
| **Cloudflare Mode**  | Development mode (no cache)      | Full production caching           |
| **Cloudflare WAF**   | Simulate only (log, don't block) | Active (block malicious requests) |
| **SSL**              | Cloudflare Flexible              | Cloudflare Full (Strict)          |
| **Monitoring**       | Prometheus only (no Grafana)     | Full Prometheus + Grafana         |
| **Logging Level**    | DEBUG                            | INFO                              |
| **Data**             | Sanitized copy of production     | Live data                         |
| **Email**            | Mailtrap (captured, not sent)    | SMTP provider (real delivery)     |
| **Stripe**           | Test mode (test API keys)        | Live mode (real payments)         |
| **R2 Bucket**        | iloveberlin-media-staging        | iloveberlin-media                 |
| **Backups**          | Daily (7-day retention)          | Hourly + Daily + Weekly           |
| **Deploy Trigger**   | Push to `develop` branch         | Push to `main` branch             |
| **Approval**         | Automatic                        | Requires PR approval              |

---

## Deployment Pipeline

```
Developer                GitHub                     GitHub Actions              Server
   |                       |                            |                        |
   |  1. Push to branch    |                            |                        |
   |---------------------->|                            |                        |
   |                       |  2. Trigger CI workflow    |                        |
   |                       |--------------------------->|                        |
   |                       |                            |                        |
   |                       |                            |  3. Run tests          |
   |                       |                            |  - Lint (ESLint)       |
   |                       |                            |  - Unit tests (Jest)   |
   |                       |                            |  - E2E tests (basic)   |
   |                       |                            |  - Type check (tsc)    |
   |                       |                            |                        |
   |                       |                            |  4. Build Docker images|
   |                       |                            |  - frontend:tag        |
   |                       |                            |  - backend:tag         |
   |                       |                            |                        |
   |                       |                            |  5. Push to GHCR      |
   |                       |                            |  (GitHub Container     |
   |                       |                            |   Registry)            |
   |                       |                            |                        |
   |  [develop branch]     |                            |                        |
   |                       |                            |  6. SSH to staging     |
   |                       |                            |----------------------->|
   |                       |                            |  - docker compose pull |
   |                       |                            |  - docker compose up -d|
   |                       |                            |  - Run migrations      |
   |                       |                            |  - Health check        |
   |                       |                            |                        |
   |  [main branch]        |                            |                        |
   |                       |                            |  7. SSH to production  |
   |                       |                            |----------------------->|
   |                       |                            |  - docker compose pull |
   |                       |                            |  - Rolling restart     |
   |                       |                            |  - Run migrations      |
   |                       |                            |  - Health check        |
   |                       |                            |  - Purge CDN cache     |
   |                       |                            |                        |
   |                       |                            |  8. Notify (Slack)     |
   |                       |                            |                        |
```

### Rolling Restart Strategy

```
Production Rolling Restart:
│
├── 1. Pull new images:        docker compose pull
├── 2. Restart NestJS (one at a time):
│   ├── docker compose up -d --no-deps --scale nestjs=1 nestjs
│   ├── Wait for health check pass
│   └── docker compose up -d --no-deps --scale nestjs=2 nestjs
├── 3. Restart Next.js (one at a time):
│   ├── docker compose up -d --no-deps --scale nextjs=1 nextjs
│   ├── Wait for health check pass
│   └── docker compose up -d --no-deps --scale nextjs=2 nextjs
├── 4. Run database migrations:
│   └── docker compose exec nestjs npm run migration:run
├── 5. Reindex Meilisearch (if needed):
│   └── docker compose exec nestjs npm run search:reindex
├── 6. Purge Cloudflare CDN cache
└── 7. Verify deployment via health endpoints
```

---

## Backup Strategy

```
Backup Schedule:
│
├── PostgreSQL:
│   ├── Hourly:  pg_dump -> /var/backups/hourly/ (keep last 24)
│   ├── Daily:   pg_dump -> /var/backups/daily/  (keep last 30)
│   ├── Weekly:  pg_dump -> Hetzner Object Storage (keep last 12)
│   └── Tool:    pg_dump with --format=custom for compression
│
├── Redis:
│   ├── AOF persistence enabled (appendonly yes)
│   ├── RDB snapshots every 15 minutes
│   └── Daily backup of dump.rdb to /var/backups/
│
├── Meilisearch:
│   ├── Daily: Meilisearch dump -> /var/backups/meili/
│   └── Snapshots created via API before major changes
│
├── R2 Media:
│   └── No backup needed (Cloudflare R2 provides 99.999999999% durability)
│
├── Configuration:
│   ├── All config files in Git repository
│   ├── .env files backed up encrypted to Hetzner Object Storage
│   └── Nginx configs versioned in repository
│
└── Backup Verification:
    ├── Weekly automated restore test to staging
    └── Monthly manual verification of backup integrity
```

---

## Monitoring and Alerting

### Prometheus Metrics

```
Scraped Targets:
├── NestJS API (:4000/metrics)
│   ├── http_requests_total (method, route, status)
│   ├── http_request_duration_seconds (histogram)
│   ├── active_connections
│   ├── database_query_duration_seconds
│   └── custom business metrics (articles_published, users_registered, etc.)
│
├── Node Exporter (:9100/metrics)
│   ├── node_cpu_seconds_total
│   ├── node_memory_MemAvailable_bytes
│   ├── node_disk_io_time_seconds_total
│   ├── node_filesystem_avail_bytes
│   └── node_network_receive_bytes_total
│
├── PostgreSQL Exporter (:9187/metrics)
│   ├── pg_stat_activity_count
│   ├── pg_stat_database_tup_fetched
│   └── pg_stat_database_deadlocks
│
└── Redis Exporter (:9121/metrics)
    ├── redis_connected_clients
    ├── redis_used_memory_bytes
    └── redis_keyspace_hits_total
```

### Grafana Dashboards

```
Dashboards:
├── System Overview    # CPU, Memory, Disk, Network
├── API Performance    # Request rate, latency percentiles, error rate
├── Database Health    # Connections, queries/sec, slow queries
├── Redis Metrics      # Hit rate, memory, connected clients
├── Business Metrics   # Registrations, articles, orders per day
└── Uptime Monitor     # Service health status
```

### Alert Rules

| Alert                    | Condition                         | Severity | Action          |
| ------------------------ | --------------------------------- | -------- | --------------- |
| High CPU                 | CPU > 85% for 5 minutes           | Warning  | Slack + Email   |
| Critical CPU             | CPU > 95% for 2 minutes           | Critical | Slack + PagerDuty |
| Low Disk Space           | Disk < 15% free                   | Warning  | Slack + Email   |
| Critical Disk            | Disk < 5% free                    | Critical | Slack + PagerDuty |
| High Memory              | Memory > 90% for 5 minutes        | Warning  | Slack + Email   |
| API Error Rate           | 5xx rate > 5% for 3 minutes       | Critical | Slack + PagerDuty |
| API Latency              | p95 latency > 2s for 5 minutes    | Warning  | Slack + Email   |
| Database Connections     | Active connections > 80% of max   | Warning  | Slack + Email   |
| Service Down             | Health check fails for 1 minute   | Critical | Slack + PagerDuty |
| SSL Certificate Expiry   | < 14 days until expiry            | Warning  | Slack + Email   |
