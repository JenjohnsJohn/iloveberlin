# NFR-SEO: Search Engine Optimization Requirements

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Category:** Non-Functional Requirements -- SEO
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft

---

## 1. Overview

This document defines the search engine optimization requirements for the ILoveBerlin platform. As a content-driven lifestyle hub targeting Berlin residents and visitors, organic search traffic is a primary growth channel. The platform must be optimized for search engine discovery, indexing, and ranking across all content verticals -- articles, events, restaurants, businesses, and products. The Next.js frontend provides server-side rendering capabilities that form the foundation of the SEO strategy.

---

## 2. Server-Side Rendering and Crawlability

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-001 | All public-facing pages shall be **server-side rendered (SSR)** or **statically generated (SSG/ISR)** via Next.js to ensure full HTML content is available to search engine crawlers without JavaScript execution. | 100% public pages SSR/SSG | View source inspection, `curl` response verification |
| NFR-SEO-002 | Server-rendered HTML shall contain **all essential content** visible to users -- page title, headings, body text, image alt attributes, and internal links -- without requiring client-side JavaScript to populate. | Content in initial HTML response | Google Search Console URL Inspection tool, `curl` comparison |
| NFR-SEO-003 | Pages using **Incremental Static Regeneration (ISR)** shall revalidate at intervals appropriate to content freshness: articles (300 s), events (60 s), listings (120 s). | ISR revalidation configured per route | Next.js route configuration review |
| NFR-SEO-004 | The site shall render correctly and be fully crawlable with **JavaScript disabled** for all indexable content. Interactive features may degrade, but content must remain accessible. | Content visible without JS | Browser test with JS disabled |
| NFR-SEO-005 | **Rendering performance** shall ensure Googlebot receives a complete response within 5 seconds to avoid timeout-based crawl issues. | SSR response < 5 s | Server-side timing logs, Google Search Console crawl stats |

---

## 3. XML Sitemaps

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-010 | **Dynamic XML sitemaps** shall be generated automatically and updated at least daily, organized by content section: | Sitemaps generated and current | Sitemap URL inspection |
| | - `/sitemap-main.xml` -- core pages (home, about, contact, category landing pages) | | |
| | - `/sitemap-articles.xml` -- all published blog articles | | |
| | - `/sitemap-events.xml` -- all upcoming and recent past events | | |
| | - `/sitemap-restaurants.xml` -- all restaurant listings | | |
| | - `/sitemap-businesses.xml` -- all business directory listings | | |
| | - `/sitemap-products.xml` -- all marketplace product listings | | |
| NFR-SEO-011 | A **sitemap index file** (`/sitemap.xml`) shall reference all section sitemaps and be submitted to Google Search Console and Bing Webmaster Tools. | Sitemap index at /sitemap.xml | URL inspection, search console verification |
| NFR-SEO-012 | Each sitemap entry shall include the **`<loc>`**, **`<lastmod>`**, **`<changefreq>`**, and **`<priority>`** elements with accurate values. | All elements present | Sitemap validation tool |
| NFR-SEO-013 | Sitemaps shall not exceed **50,000 URLs per file** (XML sitemap protocol limit). When a section exceeds this limit, it shall be split into multiple numbered sitemaps (e.g., `sitemap-articles-1.xml`, `sitemap-articles-2.xml`). | < 50,000 URLs per file | Sitemap URL count check |
| NFR-SEO-014 | **Image sitemaps** shall be included for content with featured images, using the `<image:image>` extension. | Image sitemap entries for featured content | Sitemap inspection |

---

## 4. Robots.txt

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-020 | A **robots.txt** file shall be served at `/robots.txt` with rules that allow crawling of all public content and disallow crawling of: | robots.txt correctly configured | URL inspection |
| | - `/admin/*` -- admin panel routes | | |
| | - `/api/*` -- API endpoints (except health check) | | |
| | - `/auth/*` -- authentication pages | | |
| | - `/_next/static/*` -- Next.js internal static files (optional, usually not needed) | | |
| | - Any user-specific pages (dashboard, settings, profile edit) | | |
| NFR-SEO-021 | The robots.txt shall include a **Sitemap** directive pointing to the sitemap index. | `Sitemap: https://iloveberlin.biz/sitemap.xml` | robots.txt inspection |
| NFR-SEO-022 | **Staging and development environments** shall use `Disallow: /` to prevent accidental indexing of non-production content. | Staging robots.txt blocks all | Staging environment check |

---

## 5. Structured Data (JSON-LD)

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-030 | **JSON-LD structured data** shall be embedded in the `<head>` of every applicable page using Schema.org vocabulary. | JSON-LD present on all applicable pages | Google Rich Results Test, Schema.org validator |
| NFR-SEO-031 | **Article pages** shall include `Article` (or `BlogPosting`) schema with: `headline`, `description`, `image`, `author`, `datePublished`, `dateModified`, `publisher`, `mainEntityOfPage`. | Valid Article schema | Google Rich Results Test |
| NFR-SEO-032 | **Event pages** shall include `Event` schema with: `name`, `description`, `startDate`, `endDate`, `location` (with `Place` sub-schema including `address` and `geo`), `image`, `organizer`, `offers` (if ticketed), `eventStatus`, `eventAttendanceMode`. | Valid Event schema | Google Rich Results Test |
| NFR-SEO-033 | **Restaurant listing pages** shall include `Restaurant` schema with: `name`, `description`, `image`, `address`, `geo`, `telephone`, `url`, `servesCuisine`, `priceRange`, `openingHoursSpecification`, `aggregateRating` (when reviews are available). | Valid Restaurant schema | Google Rich Results Test |
| NFR-SEO-034 | **Product listing pages** (marketplace) shall include `Product` schema with: `name`, `description`, `image`, `offers` (including `price`, `priceCurrency`, `availability`), `brand`, `sku`. | Valid Product schema | Google Rich Results Test |
| NFR-SEO-035 | The **homepage** shall include `WebSite` schema with `SearchAction` (sitelinks search box) and `Organization` schema with `name`, `url`, `logo`, `sameAs` (social media profiles). | Valid WebSite + Organization schema | Google Rich Results Test |
| NFR-SEO-036 | **Breadcrumb** structured data (`BreadcrumbList` schema) shall be present on all pages except the homepage, reflecting the navigation hierarchy. | Valid BreadcrumbList schema | Google Rich Results Test |
| NFR-SEO-037 | All structured data shall pass the **Google Rich Results Test** with zero errors and zero warnings. | Zero errors, zero warnings | Google Rich Results Test |

---

## 6. Meta Tags and Open Graph

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-040 | Every page shall include a unique, descriptive **`<title>`** tag between 30 and 60 characters, following the pattern: `{Page Title} | ILoveBerlin`. | Unique titles, 30-60 chars | Crawl audit (Screaming Frog or similar) |
| NFR-SEO-041 | Every page shall include a unique **`<meta name="description">`** tag between 120 and 160 characters summarizing the page content. | Unique descriptions, 120-160 chars | Crawl audit |
| NFR-SEO-042 | **Open Graph meta tags** shall be present on all public pages: | OG tags present | Social media debugger tools |
| | - `og:title` -- page title | | |
| | - `og:description` -- page description | | |
| | - `og:image` -- featured image (minimum 1200x630 px) | | |
| | - `og:url` -- canonical URL | | |
| | - `og:type` -- `website`, `article`, `event`, or `product` as applicable | | |
| | - `og:site_name` -- "ILoveBerlin" | | |
| | - `og:locale` -- `en_US` (primary), `de_DE` (when German content is available) | | |
| NFR-SEO-043 | **Twitter Card meta tags** shall be present on all public pages: | Twitter Card tags present | Twitter Card Validator |
| | - `twitter:card` -- `summary_large_image` | | |
| | - `twitter:title` -- page title | | |
| | - `twitter:description` -- page description | | |
| | - `twitter:image` -- featured image | | |
| | - `twitter:site` -- `@ILoveBerlin` (platform Twitter handle) | | |
| NFR-SEO-044 | **Social sharing images** shall be pre-generated at 1200x630 pixels for all content types and stored in Cloudflare R2. | OG images at 1200x630 px | Image dimension verification |

---

## 7. URL Structure

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-050 | All URLs shall be **clean, human-readable, and keyword-rich**, using lowercase, hyphen-separated slugs. No query parameters, session IDs, or numeric-only identifiers in public URLs. | Clean URL structure | Crawl audit |
| NFR-SEO-051 | **URL patterns** shall follow a consistent hierarchy: | Pattern compliance | Crawl audit |
| | - Articles: `/blog/{slug}` | | |
| | - Events: `/events/{slug}` | | |
| | - Restaurants: `/restaurants/{slug}` | | |
| | - Businesses: `/directory/{category-slug}/{business-slug}` | | |
| | - Products: `/marketplace/{slug}` | | |
| | - Categories: `/blog/category/{category-slug}` | | |
| NFR-SEO-052 | **Canonical URLs** (`<link rel="canonical">`) shall be present on every page, pointing to the definitive version of the URL (without trailing slashes, without `www` prefix unless `www` is the canonical domain). | Canonical tags on all pages | Crawl audit |
| NFR-SEO-053 | **Slug generation** shall automatically create URL-safe slugs from content titles, transliterating non-ASCII characters (e.g., umlauts: "Kreuzberg Kaffeekuche" not "kreuzberg-kaffeek%C3%BCche"). | Transliterated slugs | Content creation test |
| NFR-SEO-054 | **Slug uniqueness** shall be enforced at the database level. Duplicate slugs shall be appended with a numeric suffix (e.g., `berlin-food-guide-2`). | Unique slugs enforced | Database constraint review, integration test |

---

## 8. Redirects

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-060 | **301 (permanent) redirects** shall be implemented for all URL changes (slug updates, content restructuring) to preserve link equity and prevent 404 errors. | 301 redirects for all URL changes | Redirect test, crawl audit |
| NFR-SEO-061 | A **redirect mapping table** shall be maintained in the database to track old-URL-to-new-URL mappings, with middleware in Next.js to process redirects efficiently. | Redirect table operational | Database schema review, redirect test |
| NFR-SEO-062 | **Redirect chains** (A -> B -> C) shall be avoided; all redirects shall point directly to the final destination. Maximum redirect chain length: 1 hop. | Max 1 redirect hop | Crawl audit |
| NFR-SEO-063 | **www/non-www** and **HTTP/HTTPS** variants shall redirect to the canonical version (e.g., `www.iloveberlin.biz` -> `iloveberlin.biz`, `http://` -> `https://`). | Canonical redirects configured | URL test |
| NFR-SEO-064 | **Trailing slash** handling shall be consistent (either always include or always exclude) with redirects for the non-canonical variant. | Consistent trailing slash policy | Crawl audit |

---

## 9. Semantic HTML

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-070 | All pages shall use **semantic HTML5 elements**: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`. | Semantic elements used throughout | HTML audit, Lighthouse |
| NFR-SEO-071 | Each page shall have exactly **one `<h1>` tag** containing the primary keyword or page title. Heading hierarchy (`<h1>` through `<h6>`) shall be maintained without skipping levels. | Single h1, proper hierarchy | HTML audit |
| NFR-SEO-072 | **Internal links** shall use descriptive anchor text (not "click here" or "read more") to convey page context to search engines. | Descriptive anchor text | Content review, crawl audit |
| NFR-SEO-073 | **Breadcrumb navigation** shall be present on all pages (except homepage) using an ordered list (`<ol>`) with structured data markup. | Breadcrumbs on all sub-pages | Visual inspection, structured data test |

---

## 10. Technical SEO

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-080 | **Google Search Console** shall be verified and configured with the production domain. Sitemaps shall be submitted and monitored for crawl errors. | Search Console active | Search Console dashboard |
| NFR-SEO-081 | **Bing Webmaster Tools** shall be verified and configured with the production domain. | Bing Webmaster Tools active | Bing Webmaster dashboard |
| NFR-SEO-082 | **Crawl errors** (4xx, 5xx) reported in Search Console shall be reviewed weekly and resolved within 7 days. | Zero unresolved crawl errors older than 7 days | Search Console error report |
| NFR-SEO-083 | **Page speed** shall meet Core Web Vitals thresholds as defined in NFR-PER to benefit from Google's page experience ranking signal. | Core Web Vitals passing | Google Search Console Core Web Vitals report |
| NFR-SEO-084 | **Mobile-friendliness** shall be verified for all pages. The platform shall pass Google's Mobile-Friendly Test with zero issues. | Mobile-friendly on all pages | Google Mobile-Friendly Test |
| NFR-SEO-085 | **Lighthouse SEO score** shall be 95 or above on all public-facing pages. | Lighthouse SEO >= 95 | Lighthouse CI in deployment pipeline |
| NFR-SEO-086 | **Duplicate content** shall be prevented through canonical tags, proper pagination (`rel="next"` / `rel="prev"` or load-more patterns), and unique meta descriptions. | Zero duplicate content issues | Crawl audit, Search Console |
| NFR-SEO-087 | **Hreflang tags** shall be prepared for future multi-language support (`<link rel="alternate" hreflang="en">`, `<link rel="alternate" hreflang="de">`). Initial implementation for English only. | Hreflang-ready architecture | Code review |
| NFR-SEO-088 | **404 pages** shall return proper HTTP 404 status codes (not soft 404s) and include helpful navigation to guide users back to relevant content. | Proper 404 status codes | HTTP status check, Search Console |

---

## 11. Content SEO Guidelines

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-SEO-090 | The CMS/content editor shall include **SEO fields** for each content type: custom title tag, meta description, OG image, focus keyword, and slug override. | SEO fields in content editor | CMS interface review |
| NFR-SEO-091 | **SEO preview** functionality shall be available in the content editor showing how the page will appear in Google search results (title, URL, description). | SERP preview in editor | CMS interface review |
| NFR-SEO-092 | **Image alt text** fields shall be required (not optional) for all images uploaded through the CMS. | Alt text required | CMS validation, content audit |
| NFR-SEO-093 | **Internal linking** suggestions shall be provided in the content editor based on related content within the platform. | Linking suggestions available | CMS feature review |

---

## 12. Acceptance Criteria Summary

All requirements in this document are considered **met** when:

1. Lighthouse SEO score is 95+ on all public pages for two consecutive weekly audits.
2. All structured data passes Google Rich Results Test with zero errors.
3. XML sitemaps are submitted and accepted by Google Search Console and Bing Webmaster Tools with zero errors.
4. A crawl audit (Screaming Frog or equivalent) reports zero critical SEO issues (broken links, missing titles, missing meta descriptions, broken redirects, duplicate content).
5. All page types render complete content via server-side rendering, verified by `curl` inspection.
6. Social sharing previews display correctly on Facebook, Twitter, and LinkedIn.

---

## 13. References

- [Google Search Central Documentation](https://developers.google.com/search/docs)
- [Schema.org Vocabulary](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Next.js SEO Best Practices](https://nextjs.org/learn/seo/introduction-to-seo)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
