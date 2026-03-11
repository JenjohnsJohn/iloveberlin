# ADR-007: Hetzner for Infrastructure Hosting

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform requires infrastructure to host its application stack: NestJS backend, Next.js frontend (SSR), PostgreSQL database, Meilisearch, Redis (caching/queues), and supporting services. The hosting decision must balance:

- **GDPR compliance**: As a Berlin-focused platform serving European users, data must be stored and processed within the European Union. The platform collects user data (profiles, reviews, location history), which falls under GDPR. European data residency is both a legal requirement and a trust signal for privacy-conscious Berlin users.
- **Cost efficiency**: The platform is bootstrapped and must operate on a lean budget. Infrastructure costs must be predictable and proportional to actual resource needs, not inflated by cloud pricing premiums.
- **Performance**: Low latency for users primarily in Berlin and Germany, with acceptable performance for European and global visitors. The data center should be geographically close to the primary user base.
- **Scalability**: The infrastructure must handle growth from initial launch (hundreds of daily users) to a mature platform (tens of thousands of daily users) without requiring a complete re-architecture.
- **Operational simplicity**: The team is small. The hosting solution should not require deep cloud infrastructure expertise (AWS has 200+ services) or a dedicated DevOps engineer.
- **Reliability**: Reasonable uptime guarantees with straightforward backup and recovery procedures.

## Decision

We will use **Hetzner** (Hetzner Cloud and, as needed, Hetzner Dedicated Servers) to host the ILoveBerlin platform infrastructure, with data centers in Germany (Falkenstein and Nuremberg).

Hetzner offers exceptional price-to-performance ratios for compute, storage, and bandwidth. As a German company with data centers in Germany and Finland, it provides native GDPR-compliant data residency. Hetzner Cloud provides the API-driven, scalable infrastructure needed for the application stack, while dedicated servers are available for cost-efficient scaling of resource-intensive services (PostgreSQL, Meilisearch) when cloud instances become the more expensive option.

## Alternatives Considered

| Criterion | Hetzner | AWS | DigitalOcean | OVH | Self-hosted (colocation) |
|---|---|---|---|---|---|
| EU data centers | Germany, Finland | Frankfurt, Ireland, Stockholm, etc. | Frankfurt, Amsterdam, London | France, Germany, and more | Depends on facility |
| Company headquarters | Germany (EU) | USA | USA | France (EU) |  Not applicable |
| Compute cost (4 vCPU, 8 GB RAM) | ~$8/month (CX31) | ~$70-100/month (t3.large) | ~$48/month (4 vCPU droplet) | ~$25/month (B2-15) | Hardware amortized |
| Bandwidth included | 20 TB/month | Pay per GB ($0.09/GB) | 4-6 TB/month | Generous (unmetered on some) | Depends on facility |
| Block storage cost | $0.052/GB/month | $0.08-0.10/GB/month (gp3) | $0.10/GB/month | $0.04/GB/month | Hardware cost |
| Dedicated servers | Yes (excellent value) | Bare metal (expensive) | Not available | Yes (good value) | Full control |
| Managed database | Not available (DIY) | RDS (fully managed) | Managed DB available | Not available (DIY) | DIY |
| Load balancer | $6/month | ~$18/month (ALB) + per GB | $12/month | Included with some plans | DIY |
| Managed Kubernetes | Yes (free control plane) | EKS ($73/month control plane) | DOKS (free control plane) | Yes (free control plane) | DIY |
| API / Terraform support | Yes (hcloud provider) | Comprehensive | Yes (Terraform provider) | Yes (Terraform provider) | Not applicable |
| Support quality | Good (German, responsive) | Good (paid tiers) | Good (community + paid) | Mixed (variable response) | Not applicable |
| DDoS protection | Basic included | AWS Shield (basic free) | Basic included | Basic included | Depends on facility |
| Scaling flexibility | Cloud VMs + dedicated | Virtually unlimited | Cloud VMs only | Cloud VMs + dedicated | Hardware-limited |

### Why not AWS?

AWS is the most comprehensive cloud platform with services for every conceivable infrastructure need. Choosing AWS would provide access to managed services (RDS, ElastiCache, ECS/EKS, CloudFront, SES, SQS) that reduce operational burden. However:

- **Cost**: AWS is significantly more expensive for equivalent compute and bandwidth. A comparable setup on AWS (EC2 instances, RDS, ElastiCache, ALB, CloudFront, data transfer) would cost 5-10x what Hetzner charges. For a bootstrapped platform, this difference is material.
- **Bandwidth costs**: AWS charges $0.09/GB for data transfer to the internet. Combined with S3 egress (mitigated by CloudFront but not eliminated), bandwidth costs on AWS are unpredictable and scale with traffic. Hetzner includes 20 TB/month per server.
- **Complexity**: AWS has 200+ services, complex IAM policies, and a steep learning curve. The cognitive overhead of choosing between similar services (ECS vs. EKS vs. Fargate vs. App Runner vs. Lambda) consumes engineering time that could be spent on product development.
- **US company and data governance**: While AWS has EU data centers, it is a US company subject to the CLOUD Act, which can compel disclosure of data stored in EU regions. For a privacy-focused European platform, this is a concern that Hetzner (a German company under German/EU law) does not present.

AWS could be reconsidered if the platform reaches a scale where managed services (especially managed database with automated failover, managed search, managed queues) provide enough operational savings to justify the cost premium.

### Why not DigitalOcean?

DigitalOcean offers a good middle ground between cloud simplicity and cost. Its Droplets, managed databases, and Kubernetes service are straightforward. However:

- **Cost vs. Hetzner**: DigitalOcean is 3-5x more expensive than Hetzner for equivalent compute. A 4 vCPU, 8 GB RAM droplet costs ~$48/month vs. ~$8/month on Hetzner.
- **Less bandwidth**: DigitalOcean includes 4-6 TB/month of bandwidth per droplet vs. Hetzner's 20 TB.
- **US company**: Same CLOUD Act concern as AWS, though DigitalOcean has a smaller data footprint and less government interest.
- **No dedicated servers**: For resource-intensive workloads (database, search engine), Hetzner's dedicated servers offer better price-to-performance than any cloud VM.

DigitalOcean's managed database offering is an advantage over Hetzner, where database management is DIY. If the operational burden of managing PostgreSQL becomes excessive, a managed database on DigitalOcean or Supabase could complement Hetzner hosting.

### Why not OVH?

OVH is a large European cloud provider (headquartered in France) with competitive pricing and EU data residency. It would be a reasonable alternative. However:

- **Reliability concerns**: OVH has experienced notable incidents, including a major data center fire in Strasbourg (March 2021) that resulted in data loss for customers without off-site backups. While OVH has since improved its infrastructure, this event raised questions about their operational practices.
- **Support quality**: OVH's customer support has a mixed reputation, with reports of slow response times and limited technical depth for complex issues.
- **Developer experience**: Hetzner's Cloud API, CLI, and Terraform provider are well-designed and well-documented. OVH's tooling is functional but less polished.
- **Pricing**: OVH's pricing is competitive but slightly higher than Hetzner for comparable configurations, without the same dedicated-server value.

### Why not self-hosted (colocation)?

Colocation (renting rack space in a Berlin data center and managing physical hardware) would provide maximum control and potentially the lowest long-term cost at scale. However:

- **Upfront capital**: Purchasing servers, networking equipment, and redundant power supplies requires significant upfront investment.
- **Operational burden**: Hardware maintenance, replacements, firmware updates, physical security, and data center visits are responsibilities the team cannot absorb at this stage.
- **Scaling rigidity**: Adding capacity requires purchasing and installing new hardware, which takes days or weeks. Cloud instances can be provisioned in seconds.
- **No redundancy by default**: Achieving high availability with self-hosted hardware requires multiple servers, network redundancy, and careful failover design -- all of which Hetzner Cloud handles transparently.

Colocation could become attractive at very high scale (hundreds of servers) where the cost savings of owned hardware outweigh the operational investment.

## Consequences

### Positive

- **Dramatic cost savings**: Hetzner's pricing is 5-10x lower than AWS for equivalent compute, with generous bandwidth inclusion. The entire application stack (API servers, database, search, cache, load balancer) can run for $50-150/month initially, scaling to a few hundred dollars/month at moderate traffic levels.
- **GDPR-compliant by default**: Data stored on Hetzner Germany data centers never leaves Germany. Hetzner is a German company subject to German and EU data protection law, with no CLOUD Act concerns.
- **Low latency for target users**: Data centers in Falkenstein and Nuremberg provide single-digit millisecond latency to Berlin (~300-400 km). Combined with Cloudflare CDN for static assets, the user experience is fast.
- **Scaling path**: Start with Hetzner Cloud VMs for all services. As individual services outgrow cloud VMs (e.g., PostgreSQL needs more IOPS, Meilisearch needs more RAM), migrate them to dedicated servers for better price-to-performance. Hetzner Cloud Kubernetes is available for container orchestration at scale.
- **Bandwidth generosity**: 20 TB/month included bandwidth per cloud server eliminates bandwidth cost anxiety. API responses, SSR pages, and other server-originated traffic are effectively free.
- **Infrastructure as Code**: Hetzner Cloud's Terraform provider and CLI enable reproducible, version-controlled infrastructure management.

### Negative

- **No managed services**: Hetzner does not offer managed PostgreSQL, managed Redis, or managed search. The team is responsible for database administration (backups, replication, failover, upgrades), Redis configuration, and Meilisearch deployment. This is the most significant tradeoff.
- **Limited service ecosystem**: Hetzner provides compute, storage, networking, load balancers, and Kubernetes. There are no equivalents to AWS SQS, SES, Lambda, or Cognito. Message queues (BullMQ on Redis), email (external provider like Postmark), and serverless functions (not used) must be handled separately.
- **Smaller community**: Hetzner has a smaller user community than AWS or DigitalOcean, meaning fewer blog posts, tutorials, and Stack Overflow answers for troubleshooting. Documentation is good but less extensive.
- **Single-provider risk**: Concentrating infrastructure on Hetzner creates a dependency on one provider. Hetzner outages (rare but possible) would affect the entire platform. Mitigation: regular off-site backups (to R2 or another provider), infrastructure-as-code for rapid re-deployment, and Cloudflare CDN as a separate layer for static content.
- **Manual scaling**: While Hetzner Cloud VMs can be resized, there is no auto-scaling equivalent to AWS Auto Scaling Groups. Scaling in response to traffic spikes requires manual intervention or custom automation.

## References

- [Hetzner Cloud](https://www.hetzner.com/cloud)
- [Hetzner Dedicated Servers](https://www.hetzner.com/dedicated-rootserver)
- [Hetzner Cloud Pricing](https://www.hetzner.com/cloud#pricing)
- [Hetzner Cloud Terraform Provider](https://registry.terraform.io/providers/hetznercloud/hcloud/latest)
- [GDPR and Data Residency](https://gdpr.eu/)
- [Hetzner Cloud Kubernetes](https://www.hetzner.com/cloud/kubernetes)
