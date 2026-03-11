# ADR-006: Cloudflare R2 for Media Storage

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform is media-heavy. Listings include photos of restaurants, cafes, bars, and attractions. Users upload photos with their reviews. Events have promotional images and flyers. Editorial content includes high-resolution photography. The platform needs a media storage solution that handles:

- **Storage volume**: Tens of thousands of images initially, growing to hundreds of thousands as user-generated content accumulates. Expected initial storage: 50-200 GB, growing to 1+ TB.
- **Delivery performance**: Images must load quickly for users across Europe and globally (tourists researching Berlin before their trip). A CDN is essential for edge caching.
- **Image transformation**: Thumbnails, responsive image sizes, and format conversion (WebP, AVIF) are needed to serve optimized images to different devices and screen sizes.
- **Upload workflow**: The NestJS backend handles image uploads, validates file types and sizes, and stores images. The Flutter app also uploads images directly.
- **Cost efficiency**: Media storage and delivery costs can grow quickly. Egress bandwidth (serving images to users) is often the largest cost driver with traditional cloud storage providers.
- **API compatibility**: The storage solution should use a standard API (S3-compatible) to avoid proprietary lock-in and ensure library support across Node.js and Dart.
- **Data residency**: Preferably European storage locations to align with GDPR considerations and reduce latency for the primary user base.

## Decision

We will use **Cloudflare R2** for media (image, document, and asset) storage, served through Cloudflare's global CDN.

Cloudflare R2's zero-egress-fee pricing model eliminates the largest variable cost in media delivery. Its S3-compatible API ensures compatibility with existing libraries and tools. Cloudflare's global CDN provides edge caching for fast delivery worldwide. Cloudflare Images or Workers can handle on-the-fly image transformations (resizing, format conversion).

## Alternatives Considered

| Criterion | Cloudflare R2 | AWS S3 | Hetzner Object Storage | Self-hosted MinIO |
|---|---|---|---|---|
| Storage cost | $0.015/GB/month | $0.023/GB/month (Standard) | ~$0.005/GB/month | Hardware cost only |
| Egress cost | **$0 (free)** | $0.09/GB (to internet) | ~$0.01/GB | Bandwidth cost only |
| CDN integration | Native (Cloudflare CDN) | CloudFront (additional config + cost) | No native CDN | No CDN (must add separately) |
| S3-compatible API | Yes | Native S3 | Yes | Yes |
| Image transformation | Cloudflare Images / Workers | Lambda@Edge / CloudFront Functions | None (external service needed) | None (external service needed) |
| Data center locations | Global (EU locations available) | Global (EU regions available) | EU (Germany, Finland) | Wherever you host |
| Durability | 99.999999999% (11 nines) | 99.999999999% (11 nines) | Not publicly stated | Depends on setup |
| Availability SLA | 99.9% | 99.99% (Standard) | 99.9% | Depends on setup |
| Vendor lock-in | Low (S3-compatible) | Low (S3 is de facto standard) | Low (S3-compatible) | None |
| Operational overhead | None (managed) | None (managed) | None (managed) | High (self-managed) |
| Maturity | GA since 2022 | Most mature (since 2006) | Newer offering | Mature (open source) |

### Why not AWS S3?

AWS S3 is the industry standard for object storage, with unmatched durability, availability, and ecosystem support. It would be a safe, reliable choice. However:

- **Egress costs**: This is the decisive factor. At $0.09/GB for data transfer to the internet, egress fees become the dominant cost for a media-heavy platform. If the platform serves 1 TB of images per month (a modest amount for a content platform with user-generated photos), the egress cost alone is $90/month -- and this scales linearly with traffic. R2's zero-egress pricing eliminates this entire cost category.
- **CDN cost stacking**: Using S3 with CloudFront adds CDN costs on top of storage costs. While CloudFront reduces S3 egress fees (S3-to-CloudFront transfer is cheaper), the combined cost is still significantly higher than R2 with Cloudflare CDN included.
- **Complexity**: S3 + CloudFront + Lambda@Edge (for image transformation) involves configuring and managing multiple AWS services with separate billing and IAM policies. R2 + Cloudflare CDN + Workers is a simpler, more integrated stack.

If the platform later requires features specific to the AWS ecosystem (e.g., Rekognition for image moderation, S3 event triggers to Lambda, AWS-native workflows), S3 could be used for those specific use cases alongside R2 for general media delivery.

### Why not Hetzner Object Storage?

Since the platform is hosted on Hetzner (see ADR-007), using Hetzner's Object Storage would keep everything with one provider and minimize data transfer between storage and application servers. However:

- **No CDN**: Hetzner Object Storage has no built-in CDN. Images would be served from Hetzner's data centers in Germany/Finland, resulting in slow load times for users outside Europe. Adding a third-party CDN (Cloudflare, Bunny CDN) in front of Hetzner Object Storage is possible but adds configuration and introduces the same architecture as R2 with extra steps.
- **Newer service**: Hetzner's Object Storage offering is less mature than R2 or S3, with less documentation and community experience.
- **No image transformation**: Image resizing and format conversion would require a separate service (e.g., imgproxy, Thumbor) deployed on Hetzner, adding operational overhead.

Hetzner Object Storage could be used for backups or non-public assets where CDN delivery is not needed, complementing R2 for public media.

### Why not self-hosted MinIO?

MinIO is an open-source, S3-compatible object storage server that could run on the existing Hetzner infrastructure. It offers full control and no vendor dependency. However:

- **Operational burden**: Running MinIO in production requires managing storage hardware, replication, monitoring, capacity planning, and upgrades. For a small team, this is a significant distraction from product development.
- **No CDN**: Like Hetzner Object Storage, self-hosted MinIO has no CDN. Edge caching for global delivery would require a separate CDN layer.
- **Durability and availability**: Achieving the durability guarantees of managed services (11 nines) with self-hosted storage requires multi-node replication and careful operational practices.
- **Cost illusion**: While MinIO is free software, the hardware, bandwidth, operational time, and risk of data loss make the total cost of ownership higher than managed solutions for most teams.

MinIO could be appropriate for on-premise requirements or air-gapped environments, neither of which applies here.

## Consequences

### Positive

- **Predictable, low cost**: Zero egress fees mean storage cost is the only variable, and it scales linearly with data volume. At $0.015/GB/month, even 1 TB of media costs only $15/month for storage, with no delivery fees regardless of traffic.
- **Global CDN included**: Cloudflare's CDN is one of the largest in the world with edge nodes in 300+ cities. Images are cached close to users worldwide with no additional configuration or cost.
- **S3-compatible API**: Existing S3 client libraries for Node.js (`@aws-sdk/client-s3`) and Dart (`minio` package) work with R2 with only an endpoint change. Migration to or from R2 is straightforward.
- **Image transformation**: Cloudflare Images (or custom Cloudflare Workers) can resize, crop, and convert image formats at the edge, eliminating the need for a separate image processing pipeline.
- **Security**: Cloudflare provides DDoS protection, bot management, and WAF for assets served through its CDN. Signed URLs can restrict direct access to private assets.
- **Integration with Cloudflare ecosystem**: If the platform later uses Cloudflare Workers, Pages, or KV for other purposes, R2 integrates natively.

### Negative

- **Cloudflare dependency**: While R2's S3-compatible API reduces lock-in, the zero-egress pricing advantage is specific to Cloudflare. The cost savings are lost if migrating to another provider.
- **Cloudflare CDN requirement**: R2's zero-egress pricing applies when serving through Cloudflare. Accessing R2 directly (bypassing Cloudflare) incurs standard egress fees via the S3 API, though this is typically only used for backend operations.
- **Newer service**: R2 has been generally available since 2022 and is mature for most use cases, but it lacks some S3 features (e.g., S3 Object Lock, some lifecycle policy options) that may be needed for compliance or advanced workflows.
- **Storage location transparency**: Cloudflare does not guarantee specific storage locations for R2 objects. While data is stored in Cloudflare's network (which includes European locations), there is less control over data residency compared to S3's explicit region selection. For strictly GDPR-sensitive data (user PII), the primary PostgreSQL database on Hetzner Germany is the source of truth; R2 stores media files (images) which are generally lower sensitivity.
- **Rate limits and quotas**: R2 has per-account rate limits on API operations (Class A and Class B operations) that could be relevant at high scale, though the free tier is generous.

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare Images](https://developers.cloudflare.com/images/)
- [S3-compatible API Reference](https://developers.cloudflare.com/r2/api/s3/)
- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [Cloudflare CDN](https://www.cloudflare.com/cdn/)
