# ILoveBerlin - Monitoring Setup

## Overview

The ILoveBerlin platform uses Prometheus for metrics collection and Grafana for visualization and alerting. This document covers the complete monitoring stack configuration including scrape targets, alert rules, dashboards, log aggregation, and health check endpoints.

---

## 1. Prometheus Configuration

### Main Configuration

```yaml
# config/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s

# Alerting configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Rule files
rule_files:
  - /etc/prometheus/alerts.yml

# Scrape configurations
scrape_configs:
  # ---------- Prometheus self-monitoring ----------
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          service: prometheus

  # ---------- Node Exporter (System Metrics) ----------
  - job_name: 'node'
    static_configs:
      - targets: ['host.docker.internal:9100']
        labels:
          service: system
          environment: production

  # ---------- NestJS API ----------
  - job_name: 'nestjs-api'
    metrics_path: /api/v1/metrics
    static_configs:
      - targets: ['api:3001']
        labels:
          service: api
          environment: production
    scrape_interval: 10s

  # ---------- Next.js Web ----------
  - job_name: 'nextjs-web'
    metrics_path: /api/metrics
    static_configs:
      - targets: ['web:3000']
        labels:
          service: web
          environment: production
    scrape_interval: 30s

  # ---------- PostgreSQL Exporter ----------
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
        labels:
          service: postgres
          environment: production

  # ---------- Redis Exporter ----------
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
        labels:
          service: redis
          environment: production

  # ---------- Nginx Exporter ----------
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
        labels:
          service: nginx
          environment: production

  # ---------- Meilisearch ----------
  - job_name: 'meilisearch'
    metrics_path: /metrics
    static_configs:
      - targets: ['meilisearch:7700']
        labels:
          service: meilisearch
          environment: production
    scrape_interval: 30s

  # ---------- Docker Daemon ----------
  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
        labels:
          service: docker
          environment: production
```

### Alert Rules

```yaml
# config/prometheus/alerts.yml
groups:
  # ========== System Alerts ==========
  - name: system
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 80% for 5 minutes. Current value: {{ $value }}%"

      - alert: CriticalCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 95
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 95% for 2 minutes. Current value: {{ $value }}%"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 85%. Current value: {{ $value }}%"

      - alert: CriticalMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 95
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 95%. Immediate action required."

      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low on {{ $labels.instance }}"
          description: "Disk usage is above 80%. Current value: {{ $value }}%"

      - alert: DiskSpaceCritical
        expr: (1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100 > 90
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Disk space critical on {{ $labels.instance }}"
          description: "Disk usage is above 90%. Immediate action required."

  # ========== Application Alerts ==========
  - name: application
    rules:
      - alert: APIDown
        expr: up{job="nestjs-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "NestJS API is down"
          description: "The NestJS API has been unreachable for 1 minute."

      - alert: WebDown
        expr: up{job="nextjs-web"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Next.js Web is down"
          description: "The Next.js web application has been unreachable for 1 minute."

      - alert: HighAPIResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="nestjs-api"}[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "API p95 response time is above 500ms. Current p95: {{ $value }}s"

      - alert: CriticalAPIResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="nestjs-api"}[5m])) > 2
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical API response time"
          description: "API p95 response time is above 2 seconds."

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate (5xx)"
          description: "More than 5% of requests are returning 5xx errors."

      - alert: HighRequestRate
        expr: rate(http_requests_total[1m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Unusually high request rate"
          description: "Request rate exceeds 100 req/s for 5 minutes."

  # ========== Database Alerts ==========
  - name: database
    rules:
      - alert: PostgreSQLDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL exporter is unreachable."

      - alert: PostgreSQLHighConnections
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High PostgreSQL connection count"
          description: "PostgreSQL has {{ $value }} active connections (max 100)."

      - alert: PostgreSQLSlowQueries
        expr: pg_stat_activity_max_tx_duration{datname="iloveberlin_prod"} > 60
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Long-running PostgreSQL query"
          description: "A query has been running for more than 60 seconds."

      - alert: PostgreSQLDeadlocks
        expr: increase(pg_stat_database_deadlocks{datname="iloveberlin_prod"}[5m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL deadlock detected"
          description: "{{ $value }} deadlocks detected in the last 5 minutes."

      - alert: PostgreSQLReplicationLag
        expr: pg_replication_lag > 30
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL replication lag"
          description: "Replication lag is {{ $value }} seconds."

  # ========== Redis Alerts ==========
  - name: redis
    rules:
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis exporter is unreachable."

      - alert: RedisHighMemory
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage high"
          description: "Redis is using more than 90% of its max memory."

  # ========== Business Alerts ==========
  - name: business
    rules:
      - alert: NoNewRegistrations
        expr: increase(user_registrations_total[24h]) == 0
        for: 24h
        labels:
          severity: warning
        annotations:
          summary: "No new user registrations in 24 hours"
          description: "Zero new registrations in the last 24 hours. May indicate a registration issue."

      - alert: PaymentFailureSpike
        expr: rate(payment_failures_total[1h]) > 0.1
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "High payment failure rate"
          description: "Payment failure rate has exceeded 10% in the last hour."
```

---

## 2. Grafana Dashboard Setup

### Provisioning Data Sources

```yaml
# config/grafana/provisioning/datasources/datasource.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: PostgreSQL
    type: postgres
    access: proxy
    url: postgres:5432
    database: iloveberlin_prod
    user: grafana_readonly
    secureJsonData:
      password: ${GRAFANA_DB_PASSWORD}
    jsonData:
      sslmode: disable
      maxOpenConns: 5
      maxIdleConns: 2
      connMaxLifetime: 14400
    editable: false
```

### Dashboard Provisioning

```yaml
# config/grafana/provisioning/dashboards/dashboard.yml
apiVersion: 1

providers:
  - name: 'ILoveBerlin Dashboards'
    orgId: 1
    folder: 'ILoveBerlin'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards/json
      foldersFromFilesStructure: false
```

### Dashboard Descriptions

#### Dashboard 1: System Overview

Panels:
- **CPU Usage** (gauge + time series): Current and historical CPU usage
- **Memory Usage** (gauge + time series): RAM usage, available memory
- **Disk Usage** (gauge): Root filesystem usage percentage
- **Disk I/O** (time series): Read/write throughput
- **Network Traffic** (time series): Bytes in/out per second
- **System Load** (time series): 1m, 5m, 15m load averages
- **Container Status** (table): Running containers, their status, CPU/memory usage

#### Dashboard 2: API Performance

Panels:
- **Request Rate** (time series): Requests per second by endpoint
- **Response Time** (heatmap): Request duration distribution
- **p50 / p95 / p99 Latency** (time series): Response time percentiles
- **Error Rate** (time series): 4xx and 5xx rates by endpoint
- **Status Code Distribution** (pie chart): 2xx, 3xx, 4xx, 5xx
- **Top 10 Slowest Endpoints** (table): Average and p95 by route
- **Active Connections** (single stat): Current active HTTP connections

#### Dashboard 3: Business Metrics

Panels:
- **User Registrations** (time series): Daily new registrations
- **Active Users** (single stat + time series): DAU, WAU, MAU
- **Articles Published** (bar chart): Articles per day/week
- **Classifieds Created** (time series): New classifieds per day
- **Events Listed** (time series): New events per day
- **Payments** (time series): Successful and failed payments
- **Revenue** (time series): Daily revenue from premium classifieds and tickets
- **Search Queries** (time series): Popular search terms

#### Dashboard 4: PostgreSQL

Panels:
- **Active Connections** (gauge): Current vs. max connections
- **Query Duration** (heatmap): Query execution time distribution
- **Transactions per Second** (time series): Commits and rollbacks
- **Cache Hit Ratio** (gauge): Buffer cache effectiveness (target > 99%)
- **Table Sizes** (table): Largest tables with row counts
- **Index Usage** (table): Most and least used indexes
- **Locks** (time series): Active locks by type
- **Replication Lag** (single stat): If replication is configured
- **Dead Tuples** (table): Tables needing VACUUM
- **Temp Files** (time series): Temp file usage (indicates need for more work_mem)

### Example Dashboard JSON (System Overview)

```json
{
  "dashboard": {
    "title": "ILoveBerlin - System Overview",
    "tags": ["iloveberlin", "system"],
    "timezone": "Europe/Berlin",
    "refresh": "30s",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "gauge",
        "gridPos": { "h": 8, "w": 6, "x": 0, "y": 0 },
        "targets": [
          {
            "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 60 },
                { "color": "orange", "value": 80 },
                { "color": "red", "value": 90 }
              ]
            },
            "max": 100,
            "unit": "percent"
          }
        }
      },
      {
        "title": "Memory Usage",
        "type": "gauge",
        "gridPos": { "h": 8, "w": 6, "x": 6, "y": 0 },
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "Memory %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 70 },
                { "color": "orange", "value": 85 },
                { "color": "red", "value": 95 }
              ]
            },
            "max": 100,
            "unit": "percent"
          }
        }
      },
      {
        "title": "Disk Usage",
        "type": "gauge",
        "gridPos": { "h": 8, "w": 6, "x": 12, "y": 0 },
        "targets": [
          {
            "expr": "(1 - (node_filesystem_avail_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"})) * 100",
            "legendFormat": "Disk %"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 },
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))",
            "legendFormat": "Total req/s"
          },
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m]))",
            "legendFormat": "5xx req/s"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Alert Notification Channels

### Alertmanager Configuration

```yaml
# config/alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    # Critical alerts go to Slack + Email immediately
    - match:
        severity: critical
      receiver: 'critical-alerts'
      group_wait: 10s
      repeat_interval: 1h

    # Warning alerts go to Slack
    - match:
        severity: warning
      receiver: 'warning-alerts'
      repeat_interval: 4h

receivers:
  - name: 'default'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#monitoring'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical-alerts'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts-critical'
        title: 'CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true
    email_configs:
      - to: 'oncall@iloveberlin.biz'
        from: 'alerts@iloveberlin.biz'
        smarthost: 'smtp.brevo.com:587'
        auth_username: '${BREVO_SMTP_USER}'
        auth_password: '${BREVO_SMTP_PASSWORD}'
        send_resolved: true
        headers:
          Subject: 'CRITICAL ALERT: {{ .GroupLabels.alertname }}'

  - name: 'warning-alerts'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#monitoring'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

inhibit_rules:
  # If critical is firing, suppress warning for same alert
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

---

## 4. Log Aggregation

### Docker Log Collection

All Docker containers log to the `json-file` driver with rotation limits:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Specific service
docker compose -f docker-compose.prod.yml logs -f api

# Filter by time
docker compose -f docker-compose.prod.yml logs --since="2026-01-15T10:00:00" api

# Search logs
docker compose -f docker-compose.prod.yml logs api | grep "ERROR"
```

### Structured Logging in NestJS

```typescript
// apps/api/src/common/logger/logger.service.ts
import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  log(message: string, context?: string) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
      service: 'api',
    }));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      trace,
      context,
      timestamp: new Date().toISOString(),
      service: 'api',
    }));
  }

  warn(message: string, context?: string) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
      service: 'api',
    }));
  }

  debug(message: string, context?: string) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify({
        level: 'debug',
        message,
        context,
        timestamp: new Date().toISOString(),
        service: 'api',
      }));
    }
  }
}
```

---

## 5. Health Check Endpoints

### NestJS API Health Check

```typescript
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { MeilisearchHealthIndicator } from './meilisearch.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private redis: RedisHealthIndicator,
    private meilisearch: MeilisearchHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database connectivity
      () => this.db.pingCheck('database'),

      // Redis connectivity
      () => this.redis.isHealthy('redis'),

      // Meilisearch connectivity
      () => this.meilisearch.isHealthy('meilisearch'),

      // Memory usage (fail if > 500MB RSS)
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

      // Disk usage (fail if > 90%)
      () => this.disk.checkStorage('disk', {
        path: '/',
        thresholdPercent: 0.9,
      }),
    ]);
  }

  // Lightweight ping for load balancer checks
  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

### Health Check Response Format

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "meilisearch": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "meilisearch": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk": { "status": "up" }
  }
}
```

---

## 6. Uptime Monitoring

### External Uptime Monitoring

Use an external service (e.g., UptimeRobot, Better Uptime, or Checkly) to monitor from outside the infrastructure:

| Monitor | URL | Interval | Alert After |
|---|---|---|---|
| Website | `https://iloveberlin.biz/` | 1 min | 2 failures |
| API Health | `https://iloveberlin.biz/api/v1/health` | 1 min | 2 failures |
| API Ping | `https://iloveberlin.biz/api/v1/health/ping` | 30 sec | 3 failures |
| Staging | `https://staging.iloveberlin.biz/` | 5 min | 3 failures |
| Grafana | `https://monitoring.iloveberlin.biz/` | 5 min | 5 failures |

### Status Page

Consider publishing a status page (e.g., via Atlassian Statuspage, Instatus, or a custom solution) at `https://status.iloveberlin.biz` to communicate incidents to users.

---

## 7. Monitoring Checklist

### Daily Checks (Automated via Dashboards)

- [ ] All services are healthy (green health checks)
- [ ] No critical or warning alerts firing
- [ ] API p95 response time < 500ms
- [ ] Error rate < 1%
- [ ] Database connection count < 80% of max
- [ ] Disk usage < 80%
- [ ] Memory usage < 85%
- [ ] CPU usage < 80% average

### Weekly Checks (Manual Review)

- [ ] Review Grafana dashboards for trends
- [ ] Check slow query log for new problematic queries
- [ ] Review error logs for recurring issues
- [ ] Verify backup success (see [Backup Strategy](./backup-strategy.md))
- [ ] Review Core Web Vitals from RUM data
- [ ] Check PostgreSQL cache hit ratio (should be > 99%)
- [ ] Review disk usage trends (project when capacity is needed)

### Monthly Checks

- [ ] Review and update alert thresholds
- [ ] Verify monitoring coverage for new endpoints/services
- [ ] Review Prometheus retention and storage usage
- [ ] Update Grafana dashboards for new features
- [ ] Test alert notification channels (send test alert)
