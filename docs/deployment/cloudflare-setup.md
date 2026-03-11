# ILoveBerlin - Cloudflare Setup

## Overview

Cloudflare provides DNS, CDN, SSL, WAF, DDoS protection, and object storage (R2) for the ILoveBerlin platform. All traffic to `iloveberlin.biz` is proxied through Cloudflare.

---

## 1. DNS Records

### Required DNS Records

| Type | Name | Content | Proxy | TTL | Notes |
|---|---|---|---|---|---|
| A | `iloveberlin.biz` | `<Hetzner Production IP>` | Proxied | Auto | Main site |
| A | `www` | `<Hetzner Production IP>` | Proxied | Auto | WWW redirect |
| A | `staging` | `<Hetzner Staging IP>` | Proxied | Auto | Staging environment |
| A | `monitoring` | `<Hetzner Production IP>` | Proxied | Auto | Grafana dashboard |
| CNAME | `assets` | `<R2 custom domain>` | Proxied | Auto | R2 public bucket |
| CNAME | `staging-assets` | `<R2 custom domain>` | Proxied | Auto | R2 staging bucket |
| MX | `iloveberlin.biz` | `<Brevo MX records>` | DNS only | Auto | Email delivery |
| TXT | `iloveberlin.biz` | `v=spf1 include:spf.brevo.com ~all` | DNS only | Auto | SPF record |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=...` | DNS only | Auto | DMARC policy |
| CNAME | `<brevo-key>._domainkey` | `<Brevo DKIM value>` | DNS only | Auto | DKIM signing |

### Setting Up DNS Records

```bash
# Using Cloudflare API (or use the dashboard)
# Create A record for production
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "iloveberlin.biz",
    "content": "YOUR_HETZNER_IP",
    "ttl": 1,
    "proxied": true
  }'
```

---

## 2. SSL/TLS Configuration

### SSL Mode: Full (Strict)

Cloudflare uses **Full (Strict)** SSL mode, which requires a valid certificate on the origin server. We use a Cloudflare Origin Certificate.

| Setting | Value |
|---|---|
| SSL/TLS encryption mode | Full (Strict) |
| Always Use HTTPS | On |
| Automatic HTTPS Rewrites | On |
| Minimum TLS Version | TLS 1.2 |
| Opportunistic Encryption | On |
| TLS 1.3 | On |
| Certificate Transparency Monitoring | On |

### Origin Certificate Setup

1. Navigate to **SSL/TLS > Origin Server** in the Cloudflare dashboard.
2. Click **Create Certificate**.
3. Select RSA (2048) and set hostnames: `iloveberlin.biz`, `*.iloveberlin.biz`.
4. Set certificate validity to 15 years.
5. Copy the certificate and private key.
6. Install on the origin server (see [Nginx Configuration](./nginx-configuration.md)).

### Edge Certificates

- Cloudflare provides free Universal SSL certificates for all proxied domains.
- These are managed automatically by Cloudflare.
- No action required beyond enabling proxy on DNS records.

---

## 3. WAF (Web Application Firewall) Rules

### Managed Rulesets (Enable All)

| Ruleset | Status | Sensitivity |
|---|---|---|
| Cloudflare Managed Ruleset | Enabled | High |
| Cloudflare OWASP Core Ruleset | Enabled | Medium |
| Cloudflare Leaked Credentials Detection | Enabled | N/A |

### Custom WAF Rules

#### Rule 1: Block Known Bad User Agents

```
Name: Block Bad User Agents
Expression: (http.user_agent contains "sqlmap") or
            (http.user_agent contains "nikto") or
            (http.user_agent contains "nmap") or
            (http.user_agent contains "masscan") or
            (http.user_agent contains "ZmEu") or
            (http.user_agent contains "python-requests" and not http.request.uri.path contains "/api/")
Action: Block
```

#### Rule 2: Protect Auth Endpoints

```
Name: Rate Limit Auth Endpoints
Expression: (http.request.uri.path contains "/api/v1/auth/login") or
            (http.request.uri.path contains "/api/v1/auth/register") or
            (http.request.uri.path contains "/api/v1/auth/forgot-password")
Action: Rate Limit (10 requests per minute per IP)
Mitigation: Challenge (CAPTCHA)
```

#### Rule 3: Block Access to Admin from Non-Allowed Countries

```
Name: Geo-Restrict Admin
Expression: (http.request.uri.path contains "/admin") and
            (not ip.geoip.country in {"DE" "AT" "CH"})
Action: Block
```

#### Rule 4: Block Direct IP Access

```
Name: Block Direct IP Access
Expression: (http.host eq "YOUR_SERVER_IP")
Action: Block
```

#### Rule 5: Challenge Suspicious POST Requests

```
Name: Challenge Suspicious POSTs
Expression: (http.request.method eq "POST") and
            (http.request.uri.path contains "/api/") and
            (not http.request.uri.path contains "/webhooks/") and
            (cf.threat_score gt 30)
Action: Managed Challenge
```

---

## 4. Page Rules / Cache Rules

### Cache Rules

#### Rule 1: Cache Static Assets Aggressively

```
URI Path: /_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge TTL: 1 month
  - Browser TTL: 1 year
  - Cache Status: Bypass cookie (none needed)
```

#### Rule 2: Cache Public Pages

```
URI Path: /articles/*
Settings:
  - Cache Level: Standard
  - Edge TTL: 1 hour
  - Browser TTL: 5 minutes
  - Respect Origin Cache-Control: On
```

#### Rule 3: Cache Event Listings

```
URI Path: /events*
Settings:
  - Cache Level: Standard
  - Edge TTL: 30 minutes
  - Browser TTL: 5 minutes
```

#### Rule 4: Bypass Cache for API Mutations

```
URI Path: /api/*
Condition: Request Method is not GET/HEAD
Settings:
  - Cache Level: Bypass
```

#### Rule 5: Bypass Cache for Authenticated Content

```
Condition: Cookie contains "accessToken" or "refreshToken"
Settings:
  - Cache Level: Bypass
```

#### Rule 6: Cache API GET Requests (Public)

```
URI Path: /api/v1/articles*, /api/v1/events*, /api/v1/classifieds*
Condition: Request Method is GET, no Authorization header
Settings:
  - Cache Level: Standard
  - Edge TTL: 5 minutes
  - Respect Origin Cache-Control: On
```

---

## 5. R2 Bucket Setup

### Bucket Configuration

| Bucket | Purpose | Access |
|---|---|---|
| `iloveberlin-prod` | Production media uploads (images, files) | Private (API access via S3-compatible API) |
| `iloveberlin-staging` | Staging media uploads | Private |
| `iloveberlin-dev` | Development media uploads | Private |

### Creating R2 Buckets

```bash
# Using Wrangler CLI
npx wrangler r2 bucket create iloveberlin-prod --location eu
npx wrangler r2 bucket create iloveberlin-staging --location eu
npx wrangler r2 bucket create iloveberlin-dev --location eu
```

### R2 API Tokens

Create an R2 API token for each environment:

1. Navigate to **R2 > Manage R2 API Tokens**.
2. Create a token with:
   - Permissions: Object Read & Write
   - Specify bucket(s): Select the appropriate bucket
   - TTL: No expiration (rotate manually)
3. Note the **Access Key ID** and **Secret Access Key**.

### Custom Domain for R2 (Public Access)

For serving images publicly via `https://assets.iloveberlin.biz`:

1. Navigate to **R2 > iloveberlin-prod > Settings**.
2. Under **Public access**, click **Connect Domain**.
3. Enter `assets.iloveberlin.biz`.
4. Cloudflare will automatically create a CNAME record.

### R2 CORS Configuration

```json
[
  {
    "AllowedOrigins": [
      "https://iloveberlin.biz",
      "https://www.iloveberlin.biz",
      "https://staging.iloveberlin.biz"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

### R2 Lifecycle Rules

```json
{
  "Rules": [
    {
      "ID": "delete-temp-uploads",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "temp/"
      },
      "Expiration": {
        "Days": 1
      }
    },
    {
      "ID": "transition-old-uploads",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "uploads/"
      },
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 90
      }
    }
  ]
}
```

### NestJS R2 Integration

```typescript
// apps/api/src/storage/storage.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${configService.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: configService.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('R2_SECRET_ACCESS_KEY'),
      },
    });

    this.bucket = configService.get('R2_BUCKET_NAME');
    this.publicUrl = configService.get('R2_PUBLIC_URL');
  }

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }
}
```

---

## 6. CDN Caching Strategy

### Cache Tiers

| Content Type | Edge TTL | Browser TTL | Purge Strategy |
|---|---|---|---|
| Static assets (`/_next/static/`) | 30 days | 1 year | Automatic (content-hashed filenames) |
| Images (`/assets/`) | 7 days | 1 day | Purge on update |
| HTML pages | 1 hour | 5 minutes | Purge on deploy |
| API responses (GET, public) | 5 minutes | None | Purge on data change |
| API responses (authenticated) | No cache | No cache | N/A |

### Cache Purge on Deployment

After every production deployment, the CI pipeline purges the Cloudflare cache:

```bash
# Purge everything (used in CI)
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything": true}'

# Purge specific URLs (for targeted updates)
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "files": [
      "https://iloveberlin.biz/",
      "https://iloveberlin.biz/articles",
      "https://iloveberlin.biz/events"
    ]
  }'

# Purge by cache tag (if using Cache-Tag headers)
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"tags": ["articles", "events"]}'
```

---

## 7. DDoS Protection Settings

### Automatic DDoS Protection

Cloudflare provides automatic DDoS mitigation for all proxied domains. The following settings are recommended:

| Setting | Value |
|---|---|
| DDoS L7 Attack Protection | Enabled (automatic) |
| Security Level | Medium |
| Challenge Passage | 30 minutes |
| Browser Integrity Check | On |

### Under Attack Mode

For active DDoS attacks, enable **Under Attack Mode**:

```bash
# Enable Under Attack Mode via API
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/settings/security_level" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"value": "under_attack"}'

# Disable Under Attack Mode (return to normal)
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/settings/security_level" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"value": "medium"}'
```

---

## 8. Firewall Rules

### IP Access Rules

| Rule | Action | Notes |
|---|---|---|
| Allow Hetzner monitoring IPs | Allow | For external health checks |
| Allow GitHub Actions IPs | Allow | For deployment webhooks |
| Block known malicious ASNs | Block | Updated periodically |
| Challenge Tor exit nodes | Challenge | For admin pages only |

### Rate Limiting Rules (Cloudflare Level)

| Rule | Path | Rate | Period | Action |
|---|---|---|---|---|
| API General | `/api/*` | 60 requests | 1 minute | Block for 10 min |
| Auth Endpoints | `/api/*/auth/*` | 10 requests | 1 minute | Block for 30 min |
| Search | `/api/*/search*` | 30 requests | 1 minute | Challenge |
| Webhooks (exempt) | `/api/*/webhooks/*` | No limit | N/A | Allow |

---

## 9. Bot Management

### Bot Fight Mode

| Setting | Value |
|---|---|
| Bot Fight Mode | On |
| JavaScript Detections | On |
| Static Resource Protection | Off (allow CDN crawlers) |

### Verified Bot Allowlist

The following bots are explicitly allowed:

- Googlebot
- Bingbot
- Cloudflare Always Online
- Stripe webhook IPs
- Monitoring services (UptimeRobot, etc.)

### Blocking Criteria

Block or challenge requests matching:

- Missing or suspicious `User-Agent`
- Threat score > 50
- Known bot signatures (not in allowlist)
- More than 100 requests/minute from a single IP

---

## 10. Cloudflare Access (Staging Protection)

Staging is protected via Cloudflare Access (Zero Trust):

1. Navigate to **Cloudflare Zero Trust > Access > Applications**.
2. Create an application:
   - Name: `ILoveBerlin Staging`
   - Domain: `staging.iloveberlin.biz`
   - Session duration: 24 hours
3. Create a policy:
   - Name: `Team Access`
   - Action: Allow
   - Include: Emails ending in `@iloveberlin.biz` or specific email addresses
   - Require: One-time PIN (email verification)

This ensures only authorized team members can access the staging environment.
