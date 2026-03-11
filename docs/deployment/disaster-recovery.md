# ILoveBerlin - Disaster Recovery Plan

## Overview

This document defines the disaster recovery (DR) plan for the ILoveBerlin platform. It covers recovery targets, procedures for various failure scenarios, incident response protocols, and communication plans.

---

## 1. Recovery Targets

| Metric | Target | Description |
|---|---|---|
| **RTO** (Recovery Time Objective) | < 4 hours | Maximum acceptable time to restore full service |
| **RPO** (Recovery Point Objective) | < 1 hour | Maximum acceptable data loss window |

### RTO Breakdown by Severity

| Severity | RTO | Example Scenarios |
|---|---|---|
| **P1 - Critical** | < 1 hour | Complete site down, data breach, database corruption |
| **P2 - Major** | < 4 hours | Single service down (API or web), degraded performance |
| **P3 - Minor** | < 8 hours | Non-critical feature broken, monitoring gaps |
| **P4 - Low** | Next business day | Cosmetic issues, non-user-facing bugs |

### RPO Breakdown by Data Type

| Data | RPO | Backup Method |
|---|---|---|
| User data (accounts, profiles) | < 1 hour | WAL archiving (continuous) |
| Articles and content | < 1 hour | WAL archiving (continuous) |
| Classifieds and payments | < 1 hour | WAL archiving (continuous) |
| Media uploads (images) | 0 (no loss) | R2 versioning (real-time) |
| Search index | Rebuildable | Rebuilt from PostgreSQL |
| Session data (Redis) | Acceptable loss | Users re-authenticate |
| Metrics/monitoring data | < 24 hours | Prometheus local storage |

---

## 2. Recovery Procedures

### 2.1 Database Restore (from pg_dump)

**When to use**: Database corruption, accidental data deletion, failed migration.

```bash
#!/bin/bash
# /opt/iloveberlin/scripts/restore-db.sh
#
# Usage:
#   ./restore-db.sh latest                    # Restore latest daily backup
#   ./restore-db.sh pre-deploy                # Restore last pre-deploy backup
#   ./restore-db.sh /path/to/backup.sql.gz    # Restore specific file

set -euo pipefail

BACKUP_SOURCE="${1:-latest}"
DB_CONTAINER="iloveberlin-postgres"
DB_NAME="iloveberlin_prod"
DB_USER="iloveberlin_prod"
STORAGE_BOX_USER="u123456"
STORAGE_BOX_HOST="u123456.your-storagebox.de"
BACKUP_DIR="/opt/backups/postgres"

echo "================================================"
echo "  ILoveBerlin Database Restore"
echo "  Source: $BACKUP_SOURCE"
echo "  Target: $DB_NAME"
echo "  WARNING: This will REPLACE the current database!"
echo "================================================"
read -p "Are you sure? (type 'yes' to continue): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

# Determine backup file
case "$BACKUP_SOURCE" in
  latest)
    echo "Downloading latest daily backup from Storage Box..."
    REMOTE_FILE=$(ssh "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}" \
      "ls -t /backups/postgres/daily/*.sql.gz | head -1")
    LOCAL_FILE="/tmp/restore_$(date +%s).sql.gz"
    scp "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}:${REMOTE_FILE}" "$LOCAL_FILE"
    ;;
  pre-deploy)
    echo "Downloading latest pre-deploy backup..."
    REMOTE_FILE=$(ssh "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}" \
      "ls -t /backups/postgres/pre-deploy/*.sql.gz | head -1")
    LOCAL_FILE="/tmp/restore_$(date +%s).sql.gz"
    scp "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}:${REMOTE_FILE}" "$LOCAL_FILE"
    ;;
  *)
    LOCAL_FILE="$BACKUP_SOURCE"
    if [ ! -f "$LOCAL_FILE" ]; then
      echo "ERROR: Backup file not found: $LOCAL_FILE"
      exit 1
    fi
    ;;
esac

echo "Backup file: $LOCAL_FILE"
echo "File size: $(du -h "$LOCAL_FILE" | cut -f1)"

# Step 1: Create a safety backup of current state
echo "Creating safety backup of current database..."
docker exec "$DB_CONTAINER" pg_dump \
  -U "$DB_USER" -d "$DB_NAME" --format=custom --compress=6 \
  > "${BACKUP_DIR}/${DB_NAME}_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"

# Step 2: Stop application services (prevent writes)
echo "Stopping application services..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml stop api web

# Step 3: Terminate all database connections
echo "Terminating database connections..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"

# Step 4: Drop and recreate database
echo "Recreating database..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

# Step 5: Restore from backup
echo "Restoring database from backup..."
gunzip -c "$LOCAL_FILE" | docker exec -i "$DB_CONTAINER" pg_restore \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-privileges \
  --verbose

echo "Database restore complete."

# Step 6: Run any pending migrations
echo "Running pending migrations..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml run --rm api \
  npx typeorm migration:run -d dist/config/data-source.js

# Step 7: Rebuild search index
echo "Rebuilding Meilisearch index..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml run --rm api \
  node dist/commands/reindex-search.js

# Step 8: Restart application services
echo "Starting application services..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml up -d api web

# Step 9: Verify health
echo "Waiting for services to be healthy..."
sleep 15
curl -sf http://localhost:3001/api/v1/health || echo "WARNING: API health check failed"
curl -sf http://localhost:3000/api/health || echo "WARNING: Web health check failed"

# Clean up temporary file
[ "$BACKUP_SOURCE" = "latest" ] || [ "$BACKUP_SOURCE" = "pre-deploy" ] && rm -f "$LOCAL_FILE"

echo "================================================"
echo "  Database restore completed successfully!"
echo "  Verify at: https://iloveberlin.biz"
echo "================================================"
```

### 2.2 Point-in-Time Recovery (PITR)

**When to use**: Need to recover to a specific moment (e.g., "restore to 14:30 before the bad data import").

```bash
#!/bin/bash
# /opt/iloveberlin/scripts/restore-pitr.sh
#
# Usage:
#   ./restore-pitr.sh "2026-01-15 14:30:00"

set -euo pipefail

TARGET_TIME="$1"
DB_NAME="iloveberlin_prod"
DB_USER="iloveberlin_prod"
DB_CONTAINER="iloveberlin-postgres"
STORAGE_BOX_USER="u123456"
STORAGE_BOX_HOST="u123456.your-storagebox.de"

echo "================================================"
echo "  Point-in-Time Recovery"
echo "  Target time: $TARGET_TIME"
echo "  WARNING: This will REPLACE the current database!"
echo "================================================"
read -p "Are you sure? (type 'yes' to continue): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

# Step 1: Stop application services
echo "Stopping application services..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml stop api web

# Step 2: Stop PostgreSQL
echo "Stopping PostgreSQL..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml stop postgres

# Step 3: Download the base backup closest to (but before) the target time
echo "Finding appropriate base backup..."
# Find the most recent backup before the target time
BACKUP_FILE=$(ssh "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}" \
  "ls -t /backups/postgres/daily/*.sql.gz | head -1")
echo "Using base backup: $BACKUP_FILE"

# Step 4: Download base backup and WAL files
echo "Downloading base backup and WAL archives..."
mkdir -p /tmp/pitr_restore
scp "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}:${BACKUP_FILE}" /tmp/pitr_restore/base.sql.gz
rsync -avz "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}:/backups/postgres/wal/" /tmp/pitr_restore/wal/

# Step 5: Restore base backup
echo "Restoring base backup..."
# Clear existing data directory
docker compose -f /opt/iloveberlin/docker-compose.prod.yml run --rm postgres \
  bash -c "rm -rf /var/lib/postgresql/data/*"

# Initialize fresh cluster and restore
docker compose -f /opt/iloveberlin/docker-compose.prod.yml start postgres
sleep 5

docker exec "$DB_CONTAINER" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

gunzip -c /tmp/pitr_restore/base.sql.gz | docker exec -i "$DB_CONTAINER" pg_restore \
  -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges

# Step 6: Create recovery.conf for PITR
echo "Configuring point-in-time recovery..."
docker exec "$DB_CONTAINER" bash -c "cat > /var/lib/postgresql/data/recovery.conf << EOF
restore_command = 'gunzip -c /wal_archive/%f.gz > %p'
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF"

# Copy WAL files into container
docker cp /tmp/pitr_restore/wal/ "$DB_CONTAINER:/wal_archive/"

# Step 7: Restart PostgreSQL to apply WAL replay
echo "Replaying WAL to target time..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml restart postgres
sleep 10

# Step 8: Verify recovery
echo "Verifying recovery..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT NOW(), COUNT(*) FROM users;"

# Step 9: Start application services
echo "Starting application services..."
docker compose -f /opt/iloveberlin/docker-compose.prod.yml up -d api web

# Clean up
rm -rf /tmp/pitr_restore

echo "================================================"
echo "  PITR completed to: $TARGET_TIME"
echo "  Verify data at: https://iloveberlin.biz"
echo "================================================"
```

### 2.3 Service Restart

**When to use**: A service crashes or becomes unresponsive.

```bash
# Restart a specific service
docker compose -f /opt/iloveberlin/docker-compose.prod.yml restart api

# Restart with fresh container
docker compose -f /opt/iloveberlin/docker-compose.prod.yml up -d --force-recreate api

# Restart all services
docker compose -f /opt/iloveberlin/docker-compose.prod.yml restart

# Full stack restart (nuclear option)
docker compose -f /opt/iloveberlin/docker-compose.prod.yml down
docker compose -f /opt/iloveberlin/docker-compose.prod.yml up -d

# Check container logs for error cause
docker compose -f /opt/iloveberlin/docker-compose.prod.yml logs --tail=200 api
```

### 2.4 DNS Failover

**When to use**: Primary server is completely unreachable and cannot be recovered quickly.

1. Provision a new Hetzner server (see [Hetzner Server Setup](./hetzner-server-setup.md)).
2. Deploy the application to the new server.
3. Restore the database from the latest backup.
4. Update Cloudflare DNS to point to the new server IP:

```bash
# Update DNS record via Cloudflare API
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${DNS_RECORD_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"A\",
    \"name\": \"iloveberlin.biz\",
    \"content\": \"NEW_SERVER_IP\",
    \"ttl\": 60,
    \"proxied\": true
  }"
```

5. Cloudflare propagation is near-instant (proxied mode).
6. Verify the new server is serving traffic.

---

## 3. Incident Response Plan

### Severity Classification

| Severity | Impact | Examples | Response Time |
|---|---|---|---|
| **P1 - Critical** | Complete service outage, data loss, security breach | Site down, database corruption, data breach | Immediate (< 15 min) |
| **P2 - Major** | Significant degradation, single service down | API down but web cached, payment processing broken | < 30 min |
| **P3 - Minor** | Limited impact, workaround available | Search down, single page broken, slow performance | < 2 hours |
| **P4 - Low** | Minimal impact | Cosmetic issue, minor logging error | Next business day |

### Incident Response Flow

```
[Alert Triggered]
       |
       v
[On-Call Acknowledges] -----> < 15 min for P1, < 30 min for P2
       |
       v
[Assess Severity] -----> Classify P1/P2/P3/P4
       |
       v
[Communicate] -----> Slack #incidents, Status Page (P1/P2)
       |
       v
[Investigate & Diagnose]
       |
       v
[Implement Fix / Workaround]
       |
       v
[Verify Resolution]
       |
       v
[Update Communication] -----> "Resolved" on Status Page
       |
       v
[Post-Incident Review] -----> Within 48 hours for P1/P2
```

### Incident Commander Responsibilities

1. **Acknowledge** the incident within the required response time.
2. **Assess** severity and classify.
3. **Communicate** status to stakeholders.
4. **Coordinate** response efforts.
5. **Decide** on rollback, restore, or fix-forward approach.
6. **Document** actions taken in real-time.
7. **Close** the incident when resolved.
8. **Schedule** post-incident review.

---

## 4. Communication Plan

### Internal Communication

| Channel | Audience | When |
|---|---|---|
| Slack `#incidents` | Engineering team | All incidents (P1-P4) |
| Slack `#alerts-critical` | Engineering leads + on-call | P1-P2 incidents |
| Email to on-call | On-call engineer | P1 incidents (redundant alert) |
| Phone call / SMS | On-call engineer | P1 if Slack unacknowledged after 10 min |

### External Communication

| Channel | Audience | When |
|---|---|---|
| Status Page | All users | P1-P2 incidents affecting users |
| Email notification | Registered users | Extended outages (> 1 hour) |
| Social media | Public | Extended outages (> 2 hours) |

### Communication Templates

#### P1 - Initial Notification

```
Subject: [ILoveBerlin] Service Disruption

We are currently experiencing a service disruption affecting [describe affected service].

Status: Investigating
Impact: [describe user impact]
Start Time: [HH:MM CET]

We are actively working on resolving this issue. Updates will be provided every 30 minutes.
```

#### P1 - Update

```
Subject: [ILoveBerlin] Service Disruption - Update

Update on the ongoing service disruption:

Status: Identified / Implementing Fix
Root Cause: [brief description if known]
ETA to Resolution: [estimated time]

Next update in 30 minutes.
```

#### P1 - Resolution

```
Subject: [ILoveBerlin] Service Disruption - Resolved

The service disruption has been resolved.

Resolution Time: [HH:MM CET]
Duration: [X hours Y minutes]
Root Cause: [brief description]
Actions Taken: [brief description]

All services are operating normally. We apologize for the inconvenience.

A post-incident review will be conducted and a summary will be shared.
```

---

## 5. Post-Incident Review Process

### Timeline

| Step | Timeline | Responsibility |
|---|---|---|
| Schedule review meeting | Within 24 hours of resolution | Incident Commander |
| Gather data and timeline | Within 24 hours | All responders |
| Conduct review meeting | Within 48 hours | Full team |
| Publish post-incident report | Within 72 hours | Incident Commander |
| Complete action items | Within 2 sprints | Assigned owners |

### Post-Incident Report Template

```markdown
# Post-Incident Report: [Incident Title]

**Date**: [Date]
**Duration**: [Start Time] to [End Time] ([Total Duration])
**Severity**: P[1/2/3]
**Incident Commander**: [Name]
**Author**: [Name]

## Summary
[1-2 sentence summary of what happened and the impact]

## Impact
- **Users affected**: [number or description]
- **Revenue impact**: [if applicable]
- **Data loss**: [none / describe]

## Timeline (All times CET)
| Time | Event |
|------|-------|
| HH:MM | Alert triggered: [alert name] |
| HH:MM | On-call acknowledged |
| HH:MM | [Action taken] |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |
| HH:MM | Incident closed |

## Root Cause
[Detailed description of what caused the incident]

## What Went Well
- [List things that worked during the response]

## What Could Be Improved
- [List things that could be better]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action description] | [Name] | [Date] | Open |
| [Action description] | [Name] | [Date] | Open |

## Lessons Learned
[Key takeaways for the team]
```

---

## 6. Runbook for Common Scenarios

### Scenario 1: API Unresponsive (Container Running but Not Responding)

```bash
# 1. Check container status and logs
docker compose -f docker-compose.prod.yml ps api
docker compose -f docker-compose.prod.yml logs --tail=100 api

# 2. Check resource usage
docker stats iloveberlin-api --no-stream

# 3. Check for Node.js memory issues
docker exec iloveberlin-api node -e "console.log(process.memoryUsage())"

# 4. Restart the container
docker compose -f docker-compose.prod.yml restart api

# 5. If restart does not help, recreate the container
docker compose -f docker-compose.prod.yml up -d --force-recreate api

# 6. Verify health
curl -sf http://localhost:3001/api/v1/health
```

### Scenario 2: Database Out of Disk Space

```bash
# 1. Check disk usage
df -h
docker exec iloveberlin-postgres du -sh /var/lib/postgresql/data/

# 2. Check for large tables and bloat
docker exec iloveberlin-postgres psql -U iloveberlin_prod -d iloveberlin_prod -c "
  SELECT
    relname AS table,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_table_size(relid)) AS data_size,
    pg_size_pretty(pg_indexes_size(relid)) AS index_size
  FROM pg_catalog.pg_statio_user_tables
  ORDER BY pg_total_relation_size(relid) DESC
  LIMIT 20;
"

# 3. Run VACUUM FULL on bloated tables (requires downtime for that table)
docker exec iloveberlin-postgres psql -U iloveberlin_prod -d iloveberlin_prod -c "VACUUM FULL VERBOSE;"

# 4. Clear old WAL files if safe
docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "SELECT pg_switch_wal();"

# 5. If immediate space is needed, clear Docker build cache
docker builder prune -f
docker system prune -f

# 6. If disk is truly full, consider upgrading the server
```

### Scenario 3: High CPU / Memory Usage

```bash
# 1. Identify the culprit
docker stats --no-stream

# 2. Check for runaway queries
docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
  FROM pg_stat_activity
  WHERE state = 'active' AND query NOT ILIKE '%pg_stat_activity%'
  ORDER BY duration DESC
  LIMIT 10;
"

# 3. Kill long-running queries if needed
docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "SELECT pg_terminate_backend(<pid>);"

# 4. Check for memory leaks in Node.js
docker exec iloveberlin-api node -e "console.log(JSON.stringify(process.memoryUsage(), null, 2))"

# 5. Restart affected services
docker compose -f docker-compose.prod.yml restart api

# 6. If persistent, check for DDoS or bot traffic
docker compose -f docker-compose.prod.yml logs nginx | grep -c "$(date +%H:%M)"
```

### Scenario 4: SSL Certificate Expired

```bash
# 1. Check current certificate status
openssl s_client -connect iloveberlin.biz:443 -servername iloveberlin.biz 2>/dev/null | openssl x509 -noout -dates

# 2. If using Cloudflare Origin Certificate
#    Go to Cloudflare Dashboard > SSL/TLS > Origin Server
#    Create a new certificate
#    Copy cert and key to server:
scp origin-cert.pem deploy@iloveberlin.biz:/opt/iloveberlin/config/nginx/ssl/
scp origin-key.pem deploy@iloveberlin.biz:/opt/iloveberlin/config/nginx/ssl/

# 3. Set permissions
ssh deploy@iloveberlin.biz "chmod 600 /opt/iloveberlin/config/nginx/ssl/*.pem"

# 4. Reload Nginx
ssh deploy@iloveberlin.biz "docker compose -f /opt/iloveberlin/docker-compose.prod.yml exec nginx nginx -s reload"
```

### Scenario 5: Complete Server Failure

```bash
# 1. Provision new server (see hetzner-server-setup.md)
hcloud server create --name iloveberlin-prod-recovery --type cx41 --image ubuntu-24.04 --location fsn1

# 2. Run server setup script
ssh root@NEW_SERVER_IP < scripts/server-setup.sh

# 3. Deploy application
scp -r /opt/iloveberlin/config deploy@NEW_SERVER_IP:/opt/iloveberlin/config
scp docker-compose.prod.yml deploy@NEW_SERVER_IP:/opt/iloveberlin/
scp .env deploy@NEW_SERVER_IP:/opt/iloveberlin/

# 4. Start infrastructure services
ssh deploy@NEW_SERVER_IP "cd /opt/iloveberlin && docker compose -f docker-compose.prod.yml up -d postgres redis meilisearch"

# 5. Restore database from backup
ssh deploy@NEW_SERVER_IP "/opt/iloveberlin/scripts/restore-db.sh latest"

# 6. Build and deploy application
ssh deploy@NEW_SERVER_IP "cd /opt/iloveberlin && docker compose -f docker-compose.prod.yml up -d"

# 7. Update DNS
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${DNS_RECORD_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{\"content\": \"NEW_SERVER_IP\"}"

# 8. Verify
curl -sf https://iloveberlin.biz/api/v1/health

# Estimated time: 2-4 hours
```

### Scenario 6: Accidental Data Deletion

```bash
# 1. Immediately stop write traffic to prevent further changes
docker compose -f docker-compose.prod.yml stop api

# 2. Assess what was deleted
docker exec iloveberlin-postgres psql -U iloveberlin_prod -d iloveberlin_prod -c "
  -- Check if soft-deleted records exist
  SELECT COUNT(*) FROM articles WHERE deleted_at IS NOT NULL;
"

# 3a. If soft-deleted, recover via application
docker compose -f docker-compose.prod.yml start api
# Use admin API to restore soft-deleted records

# 3b. If hard-deleted, use PITR
./scripts/restore-pitr.sh "TIME_JUST_BEFORE_DELETION"

# 4. Verify recovered data
# 5. Restart services
```

### Scenario 7: Security Breach / Unauthorized Access

```bash
# 1. IMMEDIATELY: Enable Cloudflare Under Attack Mode
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/settings/security_level" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"value": "under_attack"}'

# 2. Rotate all secrets immediately
#    - Database passwords
#    - JWT secrets
#    - API keys
#    - SSH keys

# 3. Check for unauthorized access
docker compose -f docker-compose.prod.yml logs api | grep -i "unauthorized\|forbidden\|login"
docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100;"

# 4. Block suspicious IPs via Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/firewall/access_rules/rules" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{\"mode\": \"block\", \"configuration\": {\"target\": \"ip\", \"value\": \"SUSPICIOUS_IP\"}, \"notes\": \"Security incident $(date)\"}"

# 5. Force logout all users (invalidate all JWT tokens by rotating JWT_SECRET)

# 6. Notify affected users if data was exposed

# 7. File incident report and begin forensic analysis
```

---

## 7. DR Testing Schedule

| Test | Frequency | Procedure |
|---|---|---|
| Backup restore test | Monthly | Restore latest backup to verify DB (automated) |
| Service failover test | Quarterly | Simulate API crash and verify auto-restart |
| Full DR drill | Semi-annually | Provision new server, restore from backup, verify all services |
| Incident response drill | Quarterly | Simulated P1 incident, practice communication flow |
| Runbook walkthrough | Per runbook change | Review and dry-run updated procedures |

---

## 8. Emergency Contact List

| Role | Name | Contact | Escalation Order |
|---|---|---|---|
| On-Call Engineer | [Rotating schedule] | Slack `@oncall`, Phone | 1st |
| Engineering Lead | [Name] | Slack, Phone, Email | 2nd |
| CTO / Technical Owner | [Name] | Phone, Email | 3rd |
| Hetzner Support | N/A | https://console.hetzner.cloud/support | For server issues |
| Cloudflare Support | N/A | https://dash.cloudflare.com/support | For CDN/DNS issues |
| Stripe Support | N/A | https://support.stripe.com | For payment issues |

---

## 9. Key Access and Credentials

During an emergency, the incident responder needs access to:

| System | Access Method | Who Has Access |
|---|---|---|
| Hetzner Cloud Console | Web login + 2FA | Engineering leads |
| Server SSH | SSH key (`deploy` user) | On-call, Engineering leads |
| Cloudflare Dashboard | Web login + 2FA | Engineering leads |
| GitHub Repository | SSH key + 2FA | All engineers |
| Grafana | Web login | All engineers |
| Stripe Dashboard | Web login + 2FA | Engineering leads, Finance |
| Hetzner Storage Box | SSH key | On-call, Engineering leads |

All credentials and access procedures are documented in the team's password manager (1Password/Bitwarden) under the "ILoveBerlin Infrastructure" vault.
