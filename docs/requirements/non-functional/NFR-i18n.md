# NFR-I18N: Internationalization Requirements

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Category:** Non-Functional Requirements -- Internationalization (i18n) and Localization (l10n)
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft

---

## 1. Overview

This document defines the internationalization and localization requirements for the ILoveBerlin platform. While the platform launches with **English as the primary language**, the architecture must support future localization -- beginning with **German** as the first additional language. All formatting conventions default to European/German standards given the platform's Berlin focus. The requirements cover language support, content translation workflows, date/time/currency/number formatting, URL structure, and timezone handling across the Next.js frontend, NestJS backend, and Flutter mobile application.

---

## 2. Language Support

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-001 | The **primary language** of the platform shall be **English (en)**. All UI strings, system messages, error messages, and default content shall be authored in English. | English as default language | Content and UI audit |
| NFR-I18N-002 | **German (de)** shall be the first additional language, planned for Phase 2. The architecture shall accommodate German localization without requiring structural changes to the codebase. | German-ready architecture | Architecture review |
| NFR-I18N-003 | The platform shall support **future addition of new languages** with a level of effort limited to: (a) translating string files, (b) translating content, (c) adding locale configuration. No code-level refactoring shall be required to add a new language. | New language addition without refactoring | Architecture review |
| NFR-I18N-004 | **Right-to-left (RTL) language support** shall be considered in the CSS architecture. Layout shall use logical properties (`margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`) to simplify future RTL adaptation. | CSS logical properties used | Code review |
| NFR-I18N-005 | The platform shall support a minimum of **5 languages** simultaneously without performance degradation. | 5 languages without performance impact | Architecture review, load test |

---

## 3. UI String Externalization

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-010 | **All user-facing UI strings** shall be externalized into locale-specific resource files using a standard i18n library. No hardcoded strings shall appear in component code. | Zero hardcoded UI strings | Code review, lint rule |
| NFR-I18N-011 | The **Next.js frontend** shall use `next-intl` or `react-i18next` for string management, with JSON or TypeScript-based locale files organized by namespace (e.g., `common.json`, `navigation.json`, `auth.json`, `errors.json`). | i18n library integrated, namespaced files | Code review |
| NFR-I18N-012 | The **NestJS backend** shall externalize all user-facing messages (validation errors, email templates, notification text) using `nestjs-i18n` or equivalent, with locale determined by the `Accept-Language` header or user preference. | Backend i18n library integrated | Code review |
| NFR-I18N-013 | The **Flutter mobile app** shall use Flutter's built-in `intl` package with ARB (Application Resource Bundle) files for string management. | Flutter intl integrated | Code review |
| NFR-I18N-014 | **String interpolation** shall use named parameters (e.g., `"Welcome, {userName}"`) rather than positional parameters to support languages with different word orders. | Named parameters for interpolation | Code review |
| NFR-I18N-015 | **Pluralization rules** shall be handled using the i18n library's plural support (ICU message format or equivalent), accounting for languages with complex plural forms (e.g., `one`, `few`, `many`, `other`). | ICU plural support | Code review, unit test |
| NFR-I18N-016 | **Gender-aware translations** shall be supported for languages that require grammatical gender agreement, using the i18n library's select/gender message format. | Gender-aware message format available | Architecture review |

---

## 4. Date and Time Formatting

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-020 | **Date formatting** shall default to **European format** (DD.MM.YYYY for German locale, DD/MM/YYYY as fallback for English) and adapt based on the user's locale preference. | Locale-aware date formatting | Unit test with multiple locales |
| NFR-I18N-021 | **Time formatting** shall default to **24-hour format** (e.g., 14:30) for the European audience, with 12-hour format (e.g., 2:30 PM) available for locales that prefer it. | 24-hour default, locale-adaptive | Unit test |
| NFR-I18N-022 | All date/time formatting shall use the **Intl.DateTimeFormat API** (web) or equivalent locale-aware formatting library rather than custom format strings. | Standard Intl API usage | Code review |
| NFR-I18N-023 | **Relative time expressions** (e.g., "2 hours ago," "in 3 days") shall use `Intl.RelativeTimeFormat` or the i18n library's relative time support, localized to the user's language. | Locale-aware relative time | Unit test |
| NFR-I18N-024 | The **week start day** shall default to **Monday** (ISO 8601 / European convention) for calendar components and date pickers. | Monday as week start | UI review |
| NFR-I18N-025 | **Date input fields** shall accept dates in the user's locale format and store them in ISO 8601 format (YYYY-MM-DD) in the database. | ISO 8601 storage, locale-aware input | Integration test |

---

## 5. Currency Formatting

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-030 | The **primary currency** shall be **Euro (EUR)**, displayed with the euro sign and formatted according to the user's locale (e.g., German: `12,99 EUR` or `12,99 Euro`; English: `EUR 12.99` or `12.99 Euro`). | EUR as primary currency | UI review |
| NFR-I18N-031 | All currency formatting shall use the **Intl.NumberFormat API** with `style: 'currency'` and `currency: 'EUR'` rather than manual string formatting. | Standard Intl API usage | Code review |
| NFR-I18N-032 | **Currency values** shall be stored in the database as integers representing the smallest currency unit (**cents**) to avoid floating-point precision issues. (e.g., EUR 12.99 stored as 1299). | Integer cent storage | Database schema review, code review |
| NFR-I18N-033 | The architecture shall support **future multi-currency display** (e.g., showing approximate prices in USD or GBP alongside EUR) without structural changes. | Multi-currency-ready architecture | Architecture review |

---

## 6. Number Formatting

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-040 | **Number formatting** shall respect locale conventions for decimal separators and thousands grouping. German locale: `1.234,56` (period for thousands, comma for decimal). English locale: `1,234.56`. | Locale-aware number formatting | Unit test |
| NFR-I18N-041 | All number formatting shall use the **Intl.NumberFormat API** or equivalent library rather than manual formatting. | Standard Intl API usage | Code review |
| NFR-I18N-042 | **Percentage formatting** shall use `Intl.NumberFormat` with `style: 'percent'` and adapt to locale (e.g., `85 %` in German with non-breaking space, `85%` in English). | Locale-aware percent formatting | Unit test |
| NFR-I18N-043 | **Distance and measurement** values shall default to the **metric system** (kilometers, meters) as standard for Germany. | Metric system default | UI review |

---

## 7. URL Structure for Multi-Language

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-050 | The platform shall use a **path-based locale prefix** for multi-language URLs: | Path-based locale prefixes | URL structure review |
| | - English (default): `iloveberlin.biz/blog/article-slug` (no prefix for default language) | | |
| | - German: `iloveberlin.biz/de/blog/article-slug` | | |
| | - Future languages: `iloveberlin.biz/{locale}/...` | | |
| NFR-I18N-051 | The **default language (English)** shall not require a locale prefix in the URL. The `/en/` prefix shall redirect to the equivalent URL without prefix via 301 redirect. | No prefix for default, 301 redirect for /en/ | URL test |
| NFR-I18N-052 | **`hreflang` tags** shall be present on all pages indicating available language versions, including `x-default` pointing to the English version. | hreflang tags on all pages | HTML inspection |
| NFR-I18N-053 | **Localized slugs** shall be supported: German content may have German-language slugs (e.g., `/de/blog/berliner-essensguide` vs. `/blog/berlin-food-guide`). A mapping table shall link equivalent content across languages. | Localized slugs with cross-language mapping | Database schema review |
| NFR-I18N-054 | **Language switcher** UI component shall be present on all pages, linking to the equivalent page in the other available language(s). If translated content does not exist, the switcher shall link to the homepage in the target language. | Language switcher present and functional | UI review |
| NFR-I18N-055 | **Sitemap files** shall be generated per language (e.g., `sitemap-articles-en.xml`, `sitemap-articles-de.xml`) with `hreflang` annotations. | Per-language sitemaps | Sitemap inspection |

---

## 8. Content Translation Workflow

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-060 | The **content model** shall support multiple language versions of each content item, linked by a shared `content_group_id` or equivalent foreign key, with each version having its own slug, title, body, and metadata. | Multi-language content model | Database schema review |
| NFR-I18N-061 | The **CMS/admin interface** shall display the translation status of each content item: "Original only," "Translation in progress," "Translated," "Translation outdated" (when original has been updated after translation). | Translation status tracking | CMS UI review |
| NFR-I18N-062 | The admin interface shall provide a **side-by-side translation view** showing the original content alongside the translation editor. | Side-by-side translation UI | CMS UI review |
| NFR-I18N-063 | When original content is **updated**, all linked translations shall be automatically flagged as "Translation outdated" with a diff of changes highlighted for the translator. | Auto-flagging on original update | Integration test |
| NFR-I18N-064 | The platform shall support **translation memory** integration or export capability (XLIFF format) for professional translation services. | XLIFF export support | Feature test |
| NFR-I18N-065 | **Machine translation** integration (e.g., DeepL API) shall be architecturally supported for generating draft translations that can be reviewed and edited by human translators. | Machine translation integration planned | Architecture review |

---

## 9. Timezone Handling

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-070 | The **platform default timezone** shall be **Europe/Berlin** (CET/CEST, UTC+1/UTC+2). All event times, business hours, and time-sensitive content shall be displayed in this timezone unless the user specifies otherwise. | Europe/Berlin default | Configuration review |
| NFR-I18N-071 | All timestamps shall be **stored in UTC** in the PostgreSQL database using `TIMESTAMP WITH TIME ZONE` (`timestamptz`) column type. | UTC storage with timestamptz | Database schema review |
| NFR-I18N-072 | **Timezone conversion** shall occur at the presentation layer (frontend/API response serialization), converting UTC to the display timezone. | Presentation-layer conversion | Code review |
| NFR-I18N-073 | **Event dates and times** shall display the timezone abbreviation (e.g., "CET" or "CEST") alongside the time to avoid ambiguity, especially for events relevant to international visitors. | Timezone abbreviation displayed | UI review |
| NFR-I18N-074 | The platform shall correctly handle **daylight saving time (DST) transitions** for the Europe/Berlin timezone (last Sunday of March and October). Events spanning a DST transition shall display correct times for both sides of the transition. | Correct DST handling | Unit test with DST boundary dates |
| NFR-I18N-075 | **Server-side cron jobs and scheduled tasks** shall use UTC to avoid DST-related scheduling issues. | UTC for scheduled tasks | Configuration review |

---

## 10. Locale Detection and Preference

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-080 | **Initial locale detection** shall use the following priority order: | Priority-based locale detection | Integration test |
| | 1. User's saved language preference (if authenticated) | | |
| | 2. URL path locale prefix (e.g., `/de/...`) | | |
| | 3. `Accept-Language` HTTP header | | |
| | 4. Default to English | | |
| NFR-I18N-081 | Authenticated users shall be able to **set their preferred language** in their profile settings, which persists across sessions and devices. | Language preference in profile | Feature test |
| NFR-I18N-082 | **Locale switching** shall not cause a full page reload on the web platform; content shall update dynamically where possible (for UI strings). Content translations may require navigation to the translated URL. | Smooth locale switching | Manual test |
| NFR-I18N-083 | The **API** shall accept a `locale` query parameter or `Accept-Language` header to return localized responses (error messages, validation messages, translated content). | API locale support | API test |

---

## 11. Text and Typography

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-090 | **Font selection** shall include support for German special characters (umlauts: Ae, Oe, Ue, ae, oe, ue; Eszett: ss) and common European diacritics. | Full European character support | Font rendering test |
| NFR-I18N-091 | **UI layouts** shall accommodate text expansion of up to **40%** compared to English (German text is typically 20-30% longer) without breaking layouts, truncating text, or requiring horizontal scrolling. | Layout accommodates 40% text expansion | UI test with German locale strings |
| NFR-I18N-092 | **Line height and text spacing** shall be sufficient for languages with diacritics and tall character sets, avoiding clipping of ascenders and descenders. | No character clipping | Visual inspection with German text |
| NFR-I18N-093 | **Text sorting and collation** shall use locale-aware comparison (`Intl.Collator` on frontend, PostgreSQL `COLLATE` on backend) to correctly sort characters with diacritics (e.g., "ae" sorted correctly in German). | Locale-aware sorting | Unit test |

---

## 12. Email and Notification Localization

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-100 | **Email templates** shall be maintained in each supported language, with the user's preferred language determining which template is sent. | Localized email templates | Email template review |
| NFR-I18N-101 | **Push notifications** (mobile) shall be sent in the user's preferred language. | Localized push notifications | Notification test |
| NFR-I18N-102 | **System notification** text (in-app notifications, alerts) shall be translated alongside UI strings. | Localized system notifications | Feature test |
| NFR-I18N-103 | **Email subject lines** shall be localized and shall not exceed 50 characters in any language to avoid truncation in email clients. | Localized subjects, < 50 chars | Email template review |

---

## 13. Legal and Regulatory Localization

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-I18N-110 | **Terms of Service** and **Privacy Policy** shall be available in both English and German at launch, as required by German law for platforms operating in Germany. | Legal pages in EN + DE | Content review |
| NFR-I18N-111 | **Cookie consent** banners and preference dialogs shall be displayed in the user's detected or selected language. | Localized cookie consent | UI review |
| NFR-I18N-112 | **Impressum** (legal notice required by German TMG/DDG law) shall be provided in German, with an English translation available. | Impressum in DE (+ EN translation) | Page availability check |

---

## 14. Acceptance Criteria Summary

All requirements in this document are considered **met** when:

1. Zero hardcoded UI strings exist in component code across all three platforms (web, backend, mobile).
2. All date, time, currency, and number formatting uses standard Intl APIs with locale-aware output.
3. URL structure with path-based locale prefixes is functional and hreflang tags are present.
4. Content model supports multi-language content with translation status tracking.
5. All timestamps are stored in UTC and correctly converted to Europe/Berlin for display.
6. UI layouts accommodate 40% text expansion without visual defects.
7. German Terms of Service, Privacy Policy, and Impressum are published at launch.

---

## 15. References

- [Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n-routing)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Intl JavaScript API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Flutter Internationalization](https://docs.flutter.dev/development/accessibility-and-localization/internationalization)
- [German Telemedia Act (TMG) / Digital Services Act (DDG)](https://www.gesetze-im-internet.de/ddg/)
- [XLIFF Specification](http://docs.oasis-open.org/xliff/xliff-core/v2.1/xliff-core-v2.1.html)
