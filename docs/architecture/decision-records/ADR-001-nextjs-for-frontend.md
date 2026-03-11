# ADR-001: Next.js for Frontend Framework

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform (iloveberlin.biz) is a content-heavy, SEO-driven platform focused on Berlin culture, events, food, nightlife, and city life. The frontend must serve both first-time visitors arriving via search engines and returning users who expect a fast, app-like experience. Key requirements include:

- **Search engine optimization**: The platform depends on organic traffic. Pages for neighborhoods, restaurants, events, and guides must be fully indexable by search engines with proper meta tags, structured data, and fast initial load times.
- **Multiple rendering strategies**: Some pages (e.g., static guides) change infrequently and benefit from static generation. Others (e.g., event listings, search results) require server-side rendering or incremental regeneration. Interactive dashboards need client-side rendering.
- **Performance**: Core Web Vitals scores directly affect search rankings and user engagement. The platform must achieve excellent LCP, FID, and CLS metrics.
- **Developer experience**: The team primarily works in TypeScript and React. The chosen framework should support rapid iteration, hot module replacement, and a productive development workflow.
- **Ecosystem compatibility**: The frontend must integrate with a NestJS backend API, third-party services (maps, payment, analytics), and eventually share types with the backend via a monorepo.

## Decision

We will use **Next.js** (App Router, React Server Components) as the frontend framework for the ILoveBerlin web platform.

Next.js provides the rendering flexibility the platform requires: Static Site Generation (SSG) for evergreen content pages, Server-Side Rendering (SSR) for personalized or time-sensitive pages, Incremental Static Regeneration (ISR) for content that changes periodically, and client-side rendering for interactive features. React Server Components reduce the JavaScript shipped to the client for content-heavy pages, directly improving performance.

## Alternatives Considered

| Criterion | Next.js | Nuxt.js (Vue) | Remix | Astro | React + Vite (SPA) |
|---|---|---|---|---|---|
| SSR support | Excellent (SSR, SSG, ISR, RSC) | Good (SSR, SSG, ISR) | Good (SSR, streaming) | Good (SSR, SSG, islands) | None (client-only) |
| SEO capabilities | Excellent | Good | Good | Excellent | Poor without workarounds |
| React ecosystem | Native | Not applicable (Vue) | Native | Partial (island architecture) | Native |
| TypeScript support | First-class | First-class | First-class | First-class | First-class |
| Performance (Core Web Vitals) | Excellent (Image, Font, Script optimization) | Good | Good | Excellent (zero JS by default) | Depends on implementation |
| Community and ecosystem | Very large, mature | Large (Vue ecosystem) | Growing | Growing | Very large (React) |
| Learning curve for React team | Low | High (new framework, Vue) | Low-medium | Medium (new mental model) | Low |
| API routes / BFF pattern | Built-in | Built-in | Built-in (loaders/actions) | Limited | Not applicable |
| Incremental Static Regeneration | Built-in | Available via Nitro | Not built-in | Not built-in | Not applicable |
| Deployment flexibility | Vercel, self-hosted, Docker | Vercel, self-hosted, Docker | Various | Various | Any static host |
| Monorepo compatibility | Excellent (Turborepo native) | Good | Good | Good | Good |

### Why not Nuxt.js?

Nuxt.js is an excellent framework, but it is built on Vue.js. Adopting Nuxt would require the team to learn a new UI framework and would prevent sharing React component libraries and TypeScript types seamlessly between frontend and potential React Native or shared UI efforts. The Vue ecosystem, while strong, is smaller than React's for the kinds of integrations the platform needs (maps, rich text editors, payment UIs).

### Why not Remix?

Remix offers a compelling data-loading model with loaders and actions, and its focus on web standards is admirable. However, Remix lacks built-in ISR, which is important for a content platform where pages must be regenerated without full redeployment. Remix's ecosystem and community, while growing, are significantly smaller than Next.js, resulting in fewer third-party integrations and learning resources.

### Why not Astro?

Astro excels at content-heavy static sites with its zero-JavaScript-by-default approach and island architecture. For purely static content, Astro would outperform Next.js. However, the ILoveBerlin platform requires significant interactivity (search, filtering, user accounts, real-time event updates, maps) that goes beyond Astro's island model. Mixing Astro with React islands for interactive sections adds architectural complexity without clear benefit over a unified Next.js approach.

### Why not React + Vite (SPA)?

A client-side single-page application would be the simplest to build but fundamentally fails the SEO requirement. Search engines, despite improvements in JavaScript rendering, still favor server-rendered content. An SPA would also result in poor initial load performance (large JavaScript bundles, no streaming HTML) and would not support the meta tag and structured data requirements for each page.

## Consequences

### Positive

- **SEO out of the box**: Server-rendered pages with proper meta tags, Open Graph data, and structured data are straightforward to implement.
- **Rendering flexibility**: Different pages can use different rendering strategies (SSG, SSR, ISR, client) based on their needs, all within one framework.
- **Performance optimizations**: Built-in image optimization (`next/image`), font optimization (`next/font`), script loading (`next/script`), and automatic code splitting reduce the effort to achieve strong Core Web Vitals.
- **React Server Components**: Content-heavy pages ship minimal JavaScript to the client, improving Time to Interactive.
- **Monorepo integration**: Next.js works natively with Turborepo, enabling shared TypeScript types and utility packages with the NestJS backend.
- **Incremental adoption**: The App Router and Pages Router can coexist, allowing gradual migration and experimentation.
- **Large ecosystem**: Extensive library of React components, UI kits, and integrations available.

### Negative

- **Framework coupling**: Tight coupling to the Next.js framework and its release cycle. Breaking changes in major versions require migration effort.
- **Complexity**: The App Router with React Server Components introduces a new mental model (server vs. client components, caching behavior) that takes time to master.
- **Self-hosting considerations**: While Next.js can be self-hosted (important for our Hetzner deployment), some features (image optimization, ISR) require additional configuration outside of Vercel's managed platform.
- **Build times**: Large Next.js applications can have slow build times, though Turborepo caching and ISR mitigate this.
- **Opinionated routing**: File-system-based routing is convenient but can become unwieldy for complex route structures.

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Incremental Static Regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Core Web Vitals](https://web.dev/vitals/)
- [Turborepo with Next.js](https://turbo.build/repo/docs)
