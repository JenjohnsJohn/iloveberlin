# ILoveBerlin - Hetzner Server Setup

## Overview

The ILoveBerlin platform runs on Hetzner Cloud VPS servers located in Falkenstein, Germany. This document covers server provisioning, OS configuration, Docker installation, firewall setup, SSH hardening, and monitoring agent configuration.

---

## 1. Server Specifications

### Recommended VPS Types

| Environment | Hetzner Type | vCPU | RAM | SSD | Monthly Cost | Notes |
|---|---|---|---|---|---|---|
| **Staging** | CX31 | 4 | 8 GB | 80 GB | ~EUR 10 | Adequate for testing |
| **Production** | CX41 | 8 | 16 GB | 160 GB | ~EUR 18 | Good for moderate traffic |
| **Production (scaled)** | CX51 | 16 | 32 GB | 320 GB | ~EUR 36 | For high traffic periods |

### Resource Allocation (Production CX41)

| Service | CPU Share | RAM Limit | Disk |
|---|---|---|---|
| PostgreSQL | 2 cores | 2 GB | ~50 GB (data) |
| NestJS API | 2 cores | 1 GB | ~1 GB (app) |
| Next.js Web | 1 core | 512 MB | ~1 GB (app) |
| Nginx | 0.5 core | 256 MB | ~100 MB (cache) |
| Redis | 0.5 core | 512 MB | ~500 MB |
| Meilisearch | 1 core | 1 GB | ~2 GB (index) |
| Prometheus | 0.5 core | 512 MB | ~5 GB (metrics) |
| Grafana | 0.5 core | 256 MB | ~500 MB |
| OS + overhead | -- | ~2 GB | ~10 GB |
| **Total** | 8 cores | ~8.5 GB / 16 GB | ~70 GB / 160 GB |

---

## 2. Server Provisioning

### Create Server via Hetzner Cloud Console

1. Log in to [Hetzner Cloud Console](https://console.hetzner.cloud/).
2. Select **New Project** or use existing project.
3. Click **Add Server**.
4. Configure:
   - **Location**: Falkenstein (fsn1) -- closest to Berlin
   - **Image**: Ubuntu 24.04 LTS
   - **Type**: CX41 (or as needed)
   - **Networking**: Public IPv4 + IPv6
   - **SSH Key**: Add your deployment SSH key
   - **Volumes**: None (use local SSD)
   - **Firewall**: Create/attach firewall (see below)
   - **Name**: `iloveberlin-prod` or `iloveberlin-staging`

### Alternatively, Provision via CLI

```bash
# Install hcloud CLI
brew install hcloud   # macOS

# Configure
hcloud context create iloveberlin
# Enter your Hetzner API token

# Create server
hcloud server create \
  --name iloveberlin-prod \
  --type cx41 \
  --image ubuntu-24.04 \
  --location fsn1 \
  --ssh-key your-ssh-key-name \
  --firewall iloveberlin-fw

# Get server IP
hcloud server ip iloveberlin-prod
```

---

## 3. OS Setup (Ubuntu 24.04 LTS)

### Initial Server Configuration

```bash
# SSH into the server as root
ssh root@YOUR_SERVER_IP

# ========== System Update ==========
apt update && apt upgrade -y
apt install -y \
  curl \
  wget \
  git \
  unzip \
  htop \
  iotop \
  ncdu \
  tree \
  jq \
  fail2ban \
  ufw \
  logrotate \
  cron \
  ca-certificates \
  gnupg \
  lsb-release \
  software-properties-common

# ========== Set Timezone ==========
timedatectl set-timezone Europe/Berlin

# ========== Set Hostname ==========
hostnamectl set-hostname iloveberlin-prod
echo "127.0.1.1 iloveberlin-prod" >> /etc/hosts

# ========== Configure Automatic Security Updates ==========
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
# Select "Yes" to enable automatic updates

# Verify configuration
cat /etc/apt/apt.conf.d/20auto-upgrades
# Should contain:
# APT::Periodic::Update-Package-Lists "1";
# APT::Periodic::Unattended-Upgrade "1";
```

---

## 4. User Setup

### Create Deploy User

```bash
# Create the deploy user
adduser --disabled-password --gecos "Deploy User" deploy

# Add to docker group (after Docker installation)
usermod -aG docker deploy

# Create .ssh directory
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Add authorized SSH key for the deploy user
# Paste your CI/CD public key here
cat >> /home/deploy/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAA... deploy@github-actions
ssh-ed25519 AAAA... admin@iloveberlin
EOF

chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Grant deploy user limited sudo access (Docker and systemctl only)
cat > /etc/sudoers.d/deploy << 'EOF'
deploy ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/bin/systemctl restart nginx, /usr/bin/systemctl reload nginx
EOF
chmod 440 /etc/sudoers.d/deploy
```

### Create Application Directory

```bash
# Create application directory
mkdir -p /opt/iloveberlin
chown deploy:deploy /opt/iloveberlin

# Create log directory
mkdir -p /var/log/iloveberlin
chown deploy:deploy /var/log/iloveberlin

# Create backup directory
mkdir -p /opt/backups
chown deploy:deploy /opt/backups
```

---

## 5. SSH Hardening

### Configure SSHD

```bash
# Backup original config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Edit SSH configuration
cat > /etc/ssh/sshd_config.d/hardening.conf << 'EOF'
# ========== Authentication ==========
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ChallengeResponseAuthentication no
UsePAM yes

# ========== Security ==========
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# ========== Connection ==========
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2

# ========== Allowed Users ==========
AllowUsers deploy

# ========== Logging ==========
LogLevel VERBOSE
EOF

# Test configuration
sshd -t

# Restart SSH
systemctl restart sshd
```

### Configure Fail2Ban

```bash
# Create jail configuration
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600        # 1 hour ban
findtime = 600        # 10 minute window
maxretry = 3          # 3 attempts before ban
banaction = ufw

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200        # 2 hour ban for SSH

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

# Restart fail2ban
systemctl enable fail2ban
systemctl restart fail2ban

# Check status
fail2ban-client status
fail2ban-client status sshd
```

---

## 6. Firewall Configuration (UFW)

### Setup UFW Rules

```bash
# Reset UFW to defaults
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS (from Cloudflare IPs only)
# Cloudflare IPv4 ranges (as of 2026 -- verify at https://www.cloudflare.com/ips-v4)
ufw allow from 173.245.48.0/20 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 103.21.244.0/22 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 103.22.200.0/22 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 103.31.4.0/22 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 141.101.64.0/18 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 108.162.192.0/18 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 190.93.240.0/20 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 188.114.96.0/20 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 197.234.240.0/22 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 198.41.128.0/17 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 162.158.0.0/15 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 104.16.0.0/13 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 104.24.0.0/14 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 172.64.0.0/13 to any port 80,443 proto tcp comment 'Cloudflare'
ufw allow from 131.0.72.0/22 to any port 80,443 proto tcp comment 'Cloudflare'

# Block all other HTTP/HTTPS (prevents direct IP access)
# (Implicit via default deny)

# Enable UFW
ufw --force enable

# Verify rules
ufw status verbose
```

### Updating Cloudflare IPs

Cloudflare IP ranges can change. Create a script to update them:

```bash
#!/bin/bash
# /opt/iloveberlin/scripts/update-cloudflare-ips.sh

# Download current Cloudflare IPs
CF_IPV4=$(curl -s https://www.cloudflare.com/ips-v4)

# Remove existing Cloudflare rules
ufw status numbered | grep "Cloudflare" | awk -F'[][]' '{print $2}' | sort -rn | while read num; do
  ufw --force delete $num
done

# Add current Cloudflare IPs
for ip in $CF_IPV4; do
  ufw allow from $ip to any port 80,443 proto tcp comment 'Cloudflare'
done

ufw reload
echo "Cloudflare IPs updated at $(date)"
```

Add to cron (monthly):
```bash
echo "0 3 1 * * /opt/iloveberlin/scripts/update-cloudflare-ips.sh >> /var/log/iloveberlin/cloudflare-ips.log 2>&1" | crontab -u root -
```

---

## 7. Docker Installation

```bash
# Remove old Docker packages (if any)
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  apt remove -y $pkg 2>/dev/null
done

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Verify installation
docker --version
docker compose version

# Add deploy user to docker group
usermod -aG docker deploy

# Configure Docker daemon
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "default-address-pools": [
    {"base": "172.28.0.0/16", "size": 24}
  ]
}
EOF

# Restart Docker to apply configuration
systemctl restart docker
```

---

## 8. Swap Configuration

Swap provides a safety net when RAM is exhausted. For a VPS with 16 GB RAM, configure 4 GB swap.

```bash
# Check current swap
swapon --show

# Create swap file (4 GB)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Configure swappiness (prefer RAM, use swap only when needed)
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
sysctl -p

# Verify
swapon --show
free -h
```

---

## 9. Server Monitoring Agent Setup

### Node Exporter (for Prometheus)

Node Exporter provides system-level metrics to Prometheus (CPU, RAM, disk, network).

```bash
# Download Node Exporter
NODE_EXPORTER_VERSION="1.7.0"
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
tar xzf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
mv node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-*

# Create systemd service
cat > /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=nobody
Group=nogroup
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --collector.systemd \
  --collector.processes \
  --web.listen-address=:9100

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter

# Verify
curl -s http://localhost:9100/metrics | head -20
```

### PostgreSQL Exporter

```bash
# Run as Docker container alongside other services
# (Included in docker-compose.prod.yml)
docker run -d \
  --name postgres-exporter \
  --network iloveberlin \
  -e DATA_SOURCE_NAME="postgresql://iloveberlin_prod:${DB_PASSWORD}@postgres:5432/iloveberlin_prod?sslmode=disable" \
  -p 9187:9187 \
  quay.io/prometheuscommunity/postgres-exporter:latest
```

### Redis Exporter

```bash
# Run as Docker container
docker run -d \
  --name redis-exporter \
  --network iloveberlin \
  -e REDIS_ADDR=redis://redis:6379 \
  -e REDIS_PASSWORD=${REDIS_PASSWORD} \
  -p 9121:9121 \
  oliver006/redis_exporter:latest
```

---

## 10. System Optimization

### Kernel Parameters

```bash
cat >> /etc/sysctl.conf << 'EOF'
# Network optimization
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65535

# File descriptors
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288

# Memory
vm.overcommit_memory = 1
EOF

sysctl -p
```

### File Descriptor Limits

```bash
cat >> /etc/security/limits.conf << 'EOF'
deploy soft nofile 65535
deploy hard nofile 65535
deploy soft nproc 65535
deploy hard nproc 65535
EOF
```

### Logrotate Configuration

```bash
cat > /etc/logrotate.d/iloveberlin << 'EOF'
/var/log/iloveberlin/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        docker kill --signal=USR1 iloveberlin-nginx 2>/dev/null || true
    endscript
}
EOF
```

---

## 11. Server Setup Verification Checklist

After completing the setup, verify each item:

- [ ] SSH login works with key-based auth for `deploy` user
- [ ] Root login is disabled
- [ ] Password authentication is disabled
- [ ] UFW is active with correct rules (`ufw status verbose`)
- [ ] Fail2Ban is running (`fail2ban-client status`)
- [ ] Docker is installed and running (`docker --version`)
- [ ] Deploy user can run Docker commands (`su - deploy -c "docker ps"`)
- [ ] Swap is configured (`free -h`)
- [ ] Timezone is set to Europe/Berlin (`timedatectl`)
- [ ] Automatic security updates are enabled
- [ ] Node Exporter is running (`curl localhost:9100/metrics`)
- [ ] Application directory exists (`ls -la /opt/iloveberlin`)
- [ ] Backup directory exists (`ls -la /opt/backups`)
- [ ] Logrotate is configured (`logrotate -d /etc/logrotate.d/iloveberlin`)
