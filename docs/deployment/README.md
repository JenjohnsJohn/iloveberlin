# ILoveBerlin Platform - Deployment Documentation

> Comprehensive deployment documentation for the ILoveBerlin platform (iloveberlin.biz).

## Overview

The ILoveBerlin platform runs on Hetzner Cloud servers behind Cloudflare, using Docker containers managed via Docker Compose. This documentation covers the complete deployment lifecycle from local development through staging to production.

## Architecture Overview

```
                     [Users]
                       |
                 [Cloudflare CDN]
                   DNS, WAF, R2
                       |
                 [Hetzner VPS]
                       |
                   [Nginx]
                   /       \
          [Next.js:3000]  [NestJS:3001]
                            |
                    [PostgreSQL:5432]
                    [Redis:6379]
                    [Meilisearch:7700]
                            |
                [Prometheus + Grafana]
```

## Documentation Index

| Document | Description |
|---|---|
| [Environment Setup](./environment-setup.md) | Development, staging, and production environment configuration |
| [Docker Setup](./docker-setup.md) | Dockerfiles, Docker Compose, networking, and volumes |
| [CI/CD Pipeline](./ci-cd-pipeline.md) | GitHub Actions workflows for testing, building, and deploying |
| [Nginx Configuration](./nginx-configuration.md) | Reverse proxy, SSL, compression, caching, and security headers |
| [Cloudflare Setup](./cloudflare-setup.md) | DNS, CDN, WAF, R2, and DDoS protection |
| [Hetzner Server Setup](./hetzner-server-setup.md) | Server provisioning, OS setup, firewall, and SSH hardening |
| [Monitoring Setup](./monitoring-setup.md) | Prometheus, Grafana, alerts, and log aggregation |
| [Backup Strategy](./backup-strategy.md) | Database backups, retention policy, and verification |
| [Disaster Recovery](./disaster-recovery.md) | RTO/RPO targets, recovery procedures, and incident response |

## Quick Reference

### Deploy to Staging

```bash
git checkout develop
git merge feature/your-feature
git push origin develop
# GitHub Actions deploys automatically to staging
```

### Deploy to Production

```bash
git checkout main
git merge develop
git push origin main
# GitHub Actions deploys automatically to production
```

### Manual Deployment (Emergency)

```bash
ssh deploy@staging.iloveberlin.biz
cd /opt/iloveberlin
docker compose pull
docker compose up -d --no-deps --build api web
docker compose exec api npx typeorm migration:run
```

### Service Health Checks

| Service | Health URL |
|---|---|
| Next.js (Web) | `https://iloveberlin.biz/api/health` |
| NestJS (API) | `https://iloveberlin.biz/api/v1/health` |
| PostgreSQL | `docker compose exec postgres pg_isready` |
| Redis | `docker compose exec redis redis-cli ping` |
| Meilisearch | `http://localhost:7700/health` |

### Key Ports

| Service | Port |
|---|---|
| Next.js | 3000 |
| NestJS API | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Meilisearch | 7700 |
| Prometheus | 9090 |
| Grafana | 3100 |
| Nginx | 80, 443 |

## Contact

For deployment issues, escalate to the infrastructure team lead or refer to the [Disaster Recovery](./disaster-recovery.md) runbook.
