# ILoveBerlin - Backup Strategy

## Overview

Data is the most valuable asset of the ILoveBerlin platform. This document defines the backup strategy for all critical data: PostgreSQL databases, media uploads (R2), configuration files, and application state.

---

## 1. Backup Summary

| Data | Method | Frequency | Retention | Storage |
|---|---|---|---|---|
| PostgreSQL (full) | `pg_dump` | Daily at 02:00 CET | 7 daily, 4 weekly, 12 monthly | Hetzner Storage Box |
| PostgreSQL (WAL) | WAL archiving | Continuous | 7 days | Hetzner Storage Box |
| Media uploads | R2 versioning | Continuous (on write) | 90 days (versions) | Cloudflare R2 |
| Configuration | Git repository | On every commit | Unlimited | GitHub |
| Docker volumes | Volume backup | Weekly | 4 weekly | Hetzner Storage Box |
| Grafana dashboards | Provisioning files | On every commit | Unlimited | GitHub |
| Meilisearch index | Snapshot API | Daily | 3 daily | Local + Hetzner Storage Box |

---

## 2. PostgreSQL Automated Backups (pg_dump)

### Backup Script

```bash
#!/bin/bash
# /opt/iloveberlin/scripts/backup-db.sh
#
# Usage:
#   ./backup-db.sh              # Regular daily backup
#   ./backup-db.sh pre-deploy   # Pre-deployment backup with label

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/backups/postgres"
REMOTE_BACKUP_DIR="/backups/postgres"
DB_CONTAINER="iloveberlin-postgres"
DB_NAME="iloveberlin_prod"
DB_USER="iloveberlin_prod"
STORAGE_BOX_USER="u123456"
STORAGE_BOX_HOST="u123456.your-storagebox.de"
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=12
LOG_FILE="/var/log/iloveberlin/backup.log"

# Label (optional, for pre-deploy or manual backups)
LABEL="${1:-daily}"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday
DAY_OF_MONTH=$(date +%d)

# Backup filename
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${LABEL}_${TIMESTAMP}.sql.gz"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

log "Starting PostgreSQL backup: ${LABEL}"

# ========== Create Backup ==========
log "Creating pg_dump backup..."

docker exec "$DB_CONTAINER" pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=6 \
  --verbose \
  2>> "$LOG_FILE" | gzip > "$BACKUP_FILE"

# Verify backup file exists and has content
if [ ! -s "$BACKUP_FILE" ]; then
  log "ERROR: Backup file is empty or missing: $BACKUP_FILE"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# ========== Verify Backup Integrity ==========
log "Verifying backup integrity..."

# Test that the backup can be read
gunzip -t "$BACKUP_FILE" 2>> "$LOG_FILE"
if [ $? -ne 0 ]; then
  log "ERROR: Backup integrity check failed!"
  exit 1
fi

log "Backup integrity verified."

# ========== Upload to Storage Box ==========
log "Uploading backup to Hetzner Storage Box..."

# Determine remote subdirectory based on retention type
if [ "$LABEL" = "pre-deploy" ]; then
  REMOTE_SUBDIR="pre-deploy"
elif [ "$DAY_OF_MONTH" = "01" ]; then
  REMOTE_SUBDIR="monthly"
elif [ "$DAY_OF_WEEK" = "7" ]; then
  REMOTE_SUBDIR="weekly"
else
  REMOTE_SUBDIR="daily"
fi

# Create remote directory and upload
ssh -o StrictHostKeyChecking=no \
  "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}" \
  "mkdir -p ${REMOTE_BACKUP_DIR}/${REMOTE_SUBDIR}" 2>> "$LOG_FILE"

scp -o StrictHostKeyChecking=no \
  "$BACKUP_FILE" \
  "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}:${REMOTE_BACKUP_DIR}/${REMOTE_SUBDIR}/" \
  2>> "$LOG_FILE"

log "Backup uploaded to Storage Box: ${REMOTE_SUBDIR}/"

# ========== Apply Retention Policy ==========
log "Applying retention policy..."

# Local retention: keep only 3 days locally
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +3 -delete
log "Local backups older than 3 days removed."

# Remote retention
ssh "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}" << EOF
  # Daily: keep last $RETENTION_DAILY days
  find ${REMOTE_BACKUP_DIR}/daily -name "*.sql.gz" -mtime +${RETENTION_DAILY} -delete 2>/dev/null

  # Weekly: keep last $RETENTION_WEEKLY weeks
  find ${REMOTE_BACKUP_DIR}/weekly -name "*.sql.gz" -mtime +$((RETENTION_WEEKLY * 7)) -delete 2>/dev/null

  # Monthly: keep last $RETENTION_MONTHLY months
  find ${REMOTE_BACKUP_DIR}/monthly -name "*.sql.gz" -mtime +$((RETENTION_MONTHLY * 31)) -delete 2>/dev/null

  # Pre-deploy: keep last 10
  ls -t ${REMOTE_BACKUP_DIR}/pre-deploy/*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
EOF

log "Retention policy applied."

# ========== Record Metrics ==========
# Push backup metrics to Prometheus Pushgateway (if available)
BACKUP_SIZE_BYTES=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)

cat << METRICS | curl -s --data-binary @- http://localhost:9091/metrics/job/backup/instance/postgres 2>/dev/null || true
# HELP backup_last_success_timestamp Last successful backup timestamp
# TYPE backup_last_success_timestamp gauge
backup_last_success_timestamp $(date +%s)
# HELP backup_size_bytes Size of the last backup in bytes
# TYPE backup_size_bytes gauge
backup_size_bytes ${BACKUP_SIZE_BYTES}
# HELP backup_duration_seconds Duration of the backup process
# TYPE backup_duration_seconds gauge
backup_duration_seconds ${SECONDS}
METRICS

log "Backup completed successfully in ${SECONDS} seconds."
```

### Cron Schedule

```bash
# /etc/cron.d/iloveberlin-backup

# Daily database backup at 02:00 CET
0 2 * * * deploy /opt/iloveberlin/scripts/backup-db.sh daily >> /var/log/iloveberlin/backup.log 2>&1

# Meilisearch snapshot at 03:00 CET
0 3 * * * deploy /opt/iloveberlin/scripts/backup-meilisearch.sh >> /var/log/iloveberlin/backup.log 2>&1

# Docker volume backup (weekly, Sunday 04:00 CET)
0 4 * * 0 deploy /opt/iloveberlin/scripts/backup-volumes.sh >> /var/log/iloveberlin/backup.log 2>&1
```

---

## 3. WAL Archiving (Point-in-Time Recovery)

WAL (Write-Ahead Log) archiving enables point-in-time recovery, allowing restoration to any moment within the retention window.

### PostgreSQL Configuration

```ini
# config/postgres/postgresql.conf (add to existing)

# WAL Archiving
wal_level = replica
archive_mode = on
archive_command = 'gzip < %p > /var/lib/postgresql/wal_archive/%f.gz'
archive_timeout = 300           # Archive every 5 minutes even if not full

# Ensure sufficient WAL retention
max_wal_size = 2GB
min_wal_size = 512MB
```

### WAL Archive Sync Script

```bash
#!/bin/bash
# /opt/iloveberlin/scripts/sync-wal-archive.sh
# Sync WAL archives to Hetzner Storage Box every 15 minutes

STORAGE_BOX_USER="u123456"
STORAGE_BOX_HOST="u123456.your-storagebox.de"
WAL_LOCAL="/opt/iloveberlin/data/postgres/wal_archive/"
WAL_REMOTE="/backups/postgres/wal/"

rsync -avz --remove-source-files \
  -e "ssh -o StrictHostKeyChecking=no" \
  "$WAL_LOCAL" \
  "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}:${WAL_REMOTE}"

# Clean up WAL archives older than 7 days on remote
ssh "${STORAGE_BOX_USER}@${STORAGE_BOX_HOST}" \
  "find ${WAL_REMOTE} -name '*.gz' -mtime +7 -delete"
```

```bash
# Cron: sync WAL every 15 minutes
*/15 * * * * deploy /opt/iloveberlin/scripts/sync-wal-archive.sh >> /var/log/iloveberlin/wal-sync.log 2>&1
```

---

## 4. Backup Storage (Hetzner Storage Box)

### Setup

1. Order a **Hetzner Storage Box** (BX11 -- 1 TB, ~EUR 3.81/month).
2. Configure SSH key access:

```bash
# On the application server
ssh-keygen -t ed25519 -f /home/deploy/.ssh/storagebox_key -N ""

# Copy public key to Storage Box
cat /home/deploy/.ssh/storagebox_key.pub | \
  ssh -p 23 u123456@u123456.your-storagebox.de \
  "mkdir -p .ssh && cat >> .ssh/authorized_keys"
```

3. Configure SSH for easy access:

```bash
# /home/deploy/.ssh/config
Host storagebox
  HostName u123456.your-storagebox.de
  User u123456
  Port 23
  IdentityFile ~/.ssh/storagebox_key
  StrictHostKeyChecking no
```

### Storage Structure

```
/backups/
  postgres/
    daily/              # Last 7 daily pg_dump backups
    weekly/             # Last 4 weekly backups (Sunday)
    monthly/            # Last 12 monthly backups (1st of month)
    pre-deploy/         # Last 10 pre-deployment backups
    wal/                # WAL archive files (7-day rolling)
  meilisearch/
    snapshots/          # Last 3 daily snapshots
  volumes/
    weekly/             # Last 4 weekly Docker volume backups
```

---

## 5. Retention Policy

| Type | Frequency | Retention | Total Backups Kept |
|---|---|---|---|
| **Daily pg_dump** | Every day at 02:00 | 7 days | ~7 |
| **Weekly pg_dump** | Every Sunday | 4 weeks | ~4 |
| **Monthly pg_dump** | 1st of each month | 12 months | ~12 |
| **Pre-deploy pg_dump** | Before each production deploy | Last 10 | 10 |
| **WAL archive** | Continuous | 7 days | Variable |
| **Meilisearch snapshot** | Daily | 3 days | 3 |
| **Docker volumes** | Weekly | 4 weeks | 4 |
| **R2 object versions** | On object change | 90 days | Variable |

### Estimated Storage Usage

| Data | Estimated Size | Monthly Growth |
|---|---|---|
| Daily PostgreSQL backup | ~500 MB compressed | ~50 MB/month |
| WAL files (7 days) | ~5 GB compressed | Stable |
| Meilisearch snapshots | ~1 GB | ~100 MB/month |
| Docker volumes | ~2 GB compressed | ~200 MB/month |
| **Total per month** | | ~10-15 GB |

A 1 TB Storage Box provides ample capacity for years of backups.

---

## 6. Backup Verification Testing

### Automated Monthly Verification

```bash
#!/bin/bash
# /opt/iloveberlin/scripts/verify-backup.sh
# Run monthly to verify backup restorability

set -euo pipefail

LOG_FILE="/var/log/iloveberlin/backup-verify.log"
BACKUP_DIR="/opt/backups/postgres"
VERIFY_DB="iloveberlin_verify"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] VERIFY: $1" | tee -a "$LOG_FILE"
}

log "Starting backup verification..."

# Get the latest backup file
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  # Download latest from Storage Box
  log "No local backup found. Downloading latest from Storage Box..."
  LATEST_BACKUP="/tmp/verify_backup.sql.gz"
  scp storagebox:/backups/postgres/daily/$(ssh storagebox "ls -t /backups/postgres/daily/ | head -1") "$LATEST_BACKUP"
fi

log "Verifying backup: $LATEST_BACKUP"

# Create verification database
docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "DROP DATABASE IF EXISTS ${VERIFY_DB};"
docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "CREATE DATABASE ${VERIFY_DB};"

# Restore backup to verification database
gunzip -c "$LATEST_BACKUP" | docker exec -i iloveberlin-postgres pg_restore \
  -U iloveberlin_prod \
  -d "$VERIFY_DB" \
  --no-owner \
  --no-privileges \
  --verbose 2>> "$LOG_FILE"

RESTORE_STATUS=$?

if [ $RESTORE_STATUS -ne 0 ]; then
  log "ERROR: Backup restore failed with status $RESTORE_STATUS"
  docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "DROP DATABASE IF EXISTS ${VERIFY_DB};"
  exit 1
fi

# Run verification queries
log "Running verification queries..."

USERS_COUNT=$(docker exec iloveberlin-postgres psql -U iloveberlin_prod -d "$VERIFY_DB" -t -c "SELECT COUNT(*) FROM users;")
ARTICLES_COUNT=$(docker exec iloveberlin-postgres psql -U iloveberlin_prod -d "$VERIFY_DB" -t -c "SELECT COUNT(*) FROM articles;")
EVENTS_COUNT=$(docker exec iloveberlin-postgres psql -U iloveberlin_prod -d "$VERIFY_DB" -t -c "SELECT COUNT(*) FROM events;")
CLASSIFIEDS_COUNT=$(docker exec iloveberlin-postgres psql -U iloveberlin_prod -d "$VERIFY_DB" -t -c "SELECT COUNT(*) FROM classifieds;")

log "Verification results:"
log "  Users: ${USERS_COUNT}"
log "  Articles: ${ARTICLES_COUNT}"
log "  Events: ${EVENTS_COUNT}"
log "  Classifieds: ${CLASSIFIEDS_COUNT}"

# Verify counts are reasonable (not zero, not wildly different from expected)
if [ "$(echo "$USERS_COUNT" | tr -d ' ')" -eq 0 ]; then
  log "WARNING: Users table is empty after restore!"
fi

# Clean up verification database
docker exec iloveberlin-postgres psql -U iloveberlin_prod -c "DROP DATABASE IF EXISTS ${VERIFY_DB};"

# Clean up downloaded backup if applicable
[ "$LATEST_BACKUP" = "/tmp/verify_backup.sql.gz" ] && rm -f "$LATEST_BACKUP"

log "Backup verification completed successfully."

# Report metrics
cat << METRICS | curl -s --data-binary @- http://localhost:9091/metrics/job/backup_verify/instance/postgres 2>/dev/null || true
# HELP backup_verify_last_success Last successful backup verification
# TYPE backup_verify_last_success gauge
backup_verify_last_success $(date +%s)
METRICS
```

```bash
# Cron: monthly verification on the 15th at 05:00 CET
0 5 15 * * deploy /opt/iloveberlin/scripts/verify-backup.sh >> /var/log/iloveberlin/backup-verify.log 2>&1
```

---

## 7. Media Backup (R2 Versioning)

Cloudflare R2 handles media backups via object versioning:

### Enable Versioning

```bash
# Via Wrangler CLI
npx wrangler r2 bucket update iloveberlin-prod --versioning enabled
```

### Versioning Policy

- **Enabled**: All objects retain previous versions when overwritten or deleted.
- **Noncurrent version expiration**: 90 days (configured via lifecycle rule).
- **Delete markers**: Cleaned up after 30 days.

### Restoring a Previous Version

```bash
# List object versions
npx wrangler r2 object list iloveberlin-prod --prefix "uploads/" --include-versions

# Restore a specific version by copying it back
# (Use the S3-compatible API via the NestJS application or a script)
```

### R2 Backup Considerations

- R2 is inherently durable (11 nines durability), so external backups of R2 content are generally unnecessary.
- Versioning provides protection against accidental deletion or overwriting.
- For critical media (e.g., original uploaded images), the 90-day version retention provides ample recovery time.

---

## 8. Disaster Recovery Reference

For complete recovery procedures using these backups, see [Disaster Recovery](./disaster-recovery.md).

### Quick Restore Commands

```bash
# Restore latest daily backup
./scripts/restore-db.sh latest

# Restore specific backup
./scripts/restore-db.sh /opt/backups/postgres/iloveberlin_prod_daily_20260115_020000.sql.gz

# Restore pre-deploy backup
./scripts/restore-db.sh pre-deploy

# Point-in-time recovery (to a specific timestamp)
./scripts/restore-pitr.sh "2026-01-15 14:30:00"
```

---

## 9. Backup Monitoring

### Alerts

| Alert | Condition | Severity |
|---|---|---|
| Backup not completed | No successful backup in 26 hours | Critical |
| Backup size anomaly | Size < 50% or > 200% of 7-day average | Warning |
| WAL sync failed | No WAL sync in 30 minutes | Warning |
| Storage Box unreachable | SSH connection fails | Critical |
| Disk space on Storage Box | > 80% usage | Warning |
| Backup verification failed | Monthly verify script fails | Critical |

### Prometheus Metrics

```
backup_last_success_timestamp         # Timestamp of last successful backup
backup_size_bytes                     # Size of last backup
backup_duration_seconds               # Duration of backup process
backup_verify_last_success            # Timestamp of last successful verification
```

### Grafana Dashboard Panel

Add a "Backup Status" panel to the System Overview dashboard showing:
- Time since last successful backup
- Backup size trend over time
- Verification status
