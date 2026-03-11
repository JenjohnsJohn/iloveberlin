# ILoveBerlin - Nginx Configuration

## Overview

Nginx serves as the reverse proxy for the ILoveBerlin platform, routing requests to the Next.js frontend (port 3000) and NestJS API (port 3001). It handles SSL termination, compression, caching, rate limiting, security headers, static file serving, and WebSocket support.

---

## 1. Main Nginx Configuration

```nginx
# config/nginx/nginx.conf

user nginx;
worker_processes auto;
pid /var/run/nginx.pid;
error_log /var/log/nginx/error.log warn;

events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}

http {
    # ---------- Basic Settings ----------
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;          # Hide Nginx version
    client_max_body_size 10M;   # Max upload size

    # ---------- Logging ----------
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time';

    access_log /var/log/nginx/access.log main;

    # ---------- Gzip Compression ----------
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        application/xml+rss
        image/svg+xml
        image/x-icon
        font/woff
        font/woff2;

    # ---------- Brotli Compression ----------
    # Requires ngx_brotli module (compile or use nginx-extras)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types
    #     text/plain
    #     text/css
    #     text/javascript
    #     application/javascript
    #     application/json
    #     application/xml
    #     image/svg+xml
    #     font/woff
    #     font/woff2;

    # ---------- Rate Limiting ----------
    # General rate limit: 10 requests/second per IP
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

    # API rate limit: 5 requests/second per IP
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

    # Auth rate limit: 3 requests/second per IP (stricter for login/register)
    limit_req_zone $binary_remote_addr zone=auth:10m rate=3r/s;

    # Upload rate limit: 1 request/second per IP
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;

    # ---------- Proxy Cache ----------
    proxy_cache_path /var/cache/nginx/api
        levels=1:2
        keys_zone=api_cache:10m
        max_size=100m
        inactive=10m
        use_temp_path=off;

    # ---------- Upstream Definitions ----------
    upstream nextjs {
        server web:3000;
        keepalive 32;
    }

    upstream nestjs {
        server api:3001;
        keepalive 32;
    }

    # ---------- Include Server Blocks ----------
    include /etc/nginx/conf.d/*.conf;
}
```

---

## 2. Server Block Configuration

```nginx
# config/nginx/conf.d/iloveberlin.conf

# ---------- HTTP -> HTTPS Redirect ----------
server {
    listen 80;
    listen [::]:80;
    server_name iloveberlin.biz www.iloveberlin.biz;

    # Allow Cloudflare health checks on HTTP
    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }

    # Redirect all other HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# ---------- Main HTTPS Server ----------
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name iloveberlin.biz www.iloveberlin.biz;

    # ---------- SSL Configuration ----------
    # When behind Cloudflare (Full Strict mode), use Cloudflare Origin Certificate
    ssl_certificate /etc/nginx/ssl/origin-cert.pem;
    ssl_certificate_key /etc/nginx/ssl/origin-key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # ---------- Security Headers ----------
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self), payment=(self)" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://assets.iloveberlin.biz https://*.stripe.com; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.google-analytics.com https://*.plausible.io; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self';" always;

    # ---------- WWW -> Non-WWW Redirect ----------
    if ($host = www.iloveberlin.biz) {
        return 301 https://iloveberlin.biz$request_uri;
    }

    # ---------- API Proxy (NestJS) ----------
    location /api/ {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # Do not cache POST/PUT/DELETE by default
        proxy_cache api_cache;
        proxy_cache_methods GET HEAD;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_bypass $http_authorization;
        proxy_no_cache $http_authorization;
        add_header X-Cache-Status $upstream_cache_status;
    }

    # ---------- Auth Rate Limiting (Stricter) ----------
    location /api/v1/auth/ {
        limit_req zone=auth burst=5 nodelay;

        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 10s;
        proxy_send_timeout 15s;
        proxy_read_timeout 15s;

        # Never cache auth responses
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }

    # ---------- Stripe Webhook (No Rate Limit, Larger Body) ----------
    location /api/v1/webhooks/stripe {
        client_max_body_size 1M;

        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Pass raw body for Stripe signature verification
        proxy_set_header Content-Type $content_type;
        proxy_pass_request_body on;
    }

    # ---------- File Upload (Stricter Rate Limit, Larger Body) ----------
    location /api/v1/upload/ {
        limit_req zone=upload burst=3 nodelay;
        client_max_body_size 10M;

        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ---------- WebSocket Support ----------
    location /api/v1/ws {
        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400s;  # Keep WebSocket connections alive
        proxy_send_timeout 86400s;
    }

    # ---------- Static Files (Next.js Build Output) ----------
    location /_next/static/ {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;

        # Immutable cache for hashed static assets
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # ---------- Public Static Files ----------
    location /static/ {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;

        add_header Cache-Control "public, max-age=86400";
        access_log off;
    }

    # ---------- Favicon and Robots ----------
    location = /favicon.ico {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
    }

    location = /robots.txt {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=86400";
        access_log off;
    }

    location = /sitemap.xml {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=3600";
    }

    # ---------- Next.js (Default Handler) ----------
    location / {
        limit_req zone=general burst=30 nodelay;

        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # ---------- Prometheus Metrics (Internal Only) ----------
    location /api/v1/metrics {
        # Only allow local access (from Prometheus container)
        allow 172.16.0.0/12;   # Docker internal network
        allow 127.0.0.1;
        deny all;

        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # ---------- Health Check ----------
    location = /nginx-health {
        access_log off;
        return 200 'ok';
        add_header Content-Type text/plain;
    }

    # ---------- Block Common Attack Paths ----------
    location ~ /\.(git|env|svn|htaccess|htpasswd) {
        deny all;
        return 404;
    }

    location ~ /(wp-admin|wp-login|xmlrpc|phpmyadmin|administrator) {
        deny all;
        return 404;
    }
}
```

---

## 3. Staging Server Block

```nginx
# config/nginx/conf.d/staging.conf

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name staging.iloveberlin.biz;

    ssl_certificate /etc/nginx/ssl/staging-origin-cert.pem;
    ssl_certificate_key /etc/nginx/ssl/staging-origin-key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers (same as production)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Robots-Tag "noindex, nofollow" always;  # Prevent indexing

    # All locations same as production (see above)
    # ...

    # Additional: Basic auth for staging access (optional, if not using Cloudflare Access)
    # auth_basic "Staging";
    # auth_basic_user_file /etc/nginx/.htpasswd;
}
```

---

## 4. Monitoring Server Block (Grafana)

```nginx
# config/nginx/conf.d/monitoring.conf

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name monitoring.iloveberlin.biz;

    ssl_certificate /etc/nginx/ssl/origin-cert.pem;
    ssl_certificate_key /etc/nginx/ssl/origin-key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Restrict access to Grafana
    # Protected via Cloudflare Access or basic auth

    location / {
        proxy_pass http://grafana:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Caching Headers Summary

| Path | Cache-Control | Purpose |
|---|---|---|
| `/_next/static/*` | `public, max-age=31536000, immutable` | Hashed build assets (never change) |
| `/static/*` | `public, max-age=86400` | Public static files (1 day) |
| `/favicon.ico` | `public, max-age=604800` | Favicon (1 week) |
| `/robots.txt` | `public, max-age=86400` | Robots file (1 day) |
| `/sitemap.xml` | `public, max-age=3600` | Sitemap (1 hour) |
| `/api/*` (GET) | Proxy cache 5 min (unauthenticated only) | API response caching |
| `/api/*/auth/*` | No cache | Auth endpoints |

---

## 6. Rate Limiting Summary

| Zone | Rate | Burst | Applied To |
|---|---|---|---|
| `general` | 10 req/s | 30 | All page requests |
| `api` | 5 req/s | 20 | All API endpoints |
| `auth` | 3 req/s | 5 | Login, register, password reset |
| `upload` | 1 req/s | 3 | File upload endpoints |

---

## 7. Nginx Management Commands

```bash
# Test configuration
docker compose exec nginx nginx -t

# Reload configuration (no downtime)
docker compose exec nginx nginx -s reload

# View access logs
docker compose logs -f nginx

# View error logs
docker compose exec nginx tail -f /var/log/nginx/error.log

# Check active connections
docker compose exec nginx nginx -V 2>&1 | grep -o 'with-http_stub_status_module' && \
  curl http://localhost/nginx_status
```

---

## 8. SSL Certificate Management

### Cloudflare Origin Certificate

When using Cloudflare in Full (Strict) mode, use a Cloudflare Origin Certificate:

1. Go to Cloudflare Dashboard > SSL/TLS > Origin Server
2. Create Certificate (RSA, 15-year validity)
3. Save the certificate and private key to the server:

```bash
# On the server
sudo mkdir -p /opt/iloveberlin/config/nginx/ssl
sudo nano /opt/iloveberlin/config/nginx/ssl/origin-cert.pem   # Paste certificate
sudo nano /opt/iloveberlin/config/nginx/ssl/origin-key.pem    # Paste private key
sudo chmod 600 /opt/iloveberlin/config/nginx/ssl/*.pem
sudo chown root:root /opt/iloveberlin/config/nginx/ssl/*.pem
```

### Let's Encrypt (Alternative, without Cloudflare proxy)

If not using Cloudflare proxy, use Certbot for Let's Encrypt certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d iloveberlin.biz -d www.iloveberlin.biz

# Auto-renewal (added automatically by Certbot)
sudo systemctl status certbot.timer
```
