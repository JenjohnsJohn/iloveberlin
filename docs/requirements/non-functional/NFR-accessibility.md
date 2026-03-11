# NFR-ACC: Accessibility Requirements

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Category:** Non-Functional Requirements -- Accessibility
**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Draft

---

## 1. Overview

This document defines the accessibility requirements for the ILoveBerlin platform. The platform shall conform to the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standard, ensuring that all users -- including those with visual, auditory, motor, or cognitive disabilities -- can access and interact with the platform effectively. These requirements apply to the Next.js web frontend; applicable requirements extend to the Flutter mobile application where noted.

---

## 2. Compliance Standard

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-001 | The platform shall conform to **WCAG 2.1 Level AA** for all public-facing web pages. | WCAG 2.1 AA compliance | Manual audit + automated testing |
| NFR-ACC-002 | Accessibility compliance shall be verified through a combination of **automated testing** (axe-core) and **manual testing** (screen reader, keyboard navigation) before each major release. | Audit per major release | Test reports |
| NFR-ACC-003 | The platform shall target a **Lighthouse Accessibility score of 95 or above** on all public-facing pages. | Lighthouse Accessibility >= 95 | Lighthouse CI in deployment pipeline |

---

## 3. Semantic HTML and Document Structure

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-010 | All pages shall use **semantic HTML5 elements** (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`) to define document structure and landmark regions. | Semantic elements used throughout | axe-core audit, manual review |
| NFR-ACC-011 | Each page shall have exactly **one `<main>` landmark** containing the primary content area. | Single `<main>` per page | axe-core audit |
| NFR-ACC-012 | **Heading hierarchy** shall be strictly maintained: one `<h1>` per page, followed by `<h2>`, `<h3>`, etc. without skipping levels. Headings shall accurately describe the content that follows. | Proper heading hierarchy, no skipped levels | axe-core audit, manual review |
| NFR-ACC-013 | **Navigation landmarks** shall be labeled with `aria-label` when multiple `<nav>` elements exist on a page (e.g., "Main navigation," "Footer navigation," "Breadcrumb navigation"). | Labeled nav landmarks | axe-core audit |
| NFR-ACC-014 | **Lists** shall be used for groups of related items (navigation menus, search results, listing cards) using `<ul>`, `<ol>`, or `<dl>` elements. | Lists for grouped items | Manual review |
| NFR-ACC-015 | **Tables** shall use `<thead>`, `<th>` with `scope` attributes, and `<caption>` elements for data presentation. Tables shall not be used for layout purposes. | Accessible tables, no layout tables | axe-core audit |

---

## 4. ARIA Labels and Roles

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-020 | **Interactive elements** that lack visible text labels shall have `aria-label` or `aria-labelledby` attributes providing a descriptive label (e.g., icon-only buttons, hamburger menus, close buttons). | All interactive elements labeled | axe-core audit, manual review |
| NFR-ACC-021 | **Dynamic content regions** that update without a page reload (e.g., search results, notification badges, loading states) shall use `aria-live` regions with appropriate politeness settings (`polite` or `assertive`). | aria-live on dynamic regions | Manual screen reader test |
| NFR-ACC-022 | **Custom interactive components** (dropdowns, modals, tabs, accordions, date pickers) shall implement the appropriate **WAI-ARIA design pattern** with correct roles, states, and properties. | WAI-ARIA patterns implemented | Manual review against WAI-ARIA Authoring Practices |
| NFR-ACC-023 | **Modals and dialogs** shall use `role="dialog"` or `role="alertdialog"`, trap focus within the dialog while open, and return focus to the triggering element on close. | Accessible modals with focus trapping | Manual test, integration test |
| NFR-ACC-024 | **Loading states** shall be communicated to assistive technology using `aria-busy="true"` on the container being updated and/or an `aria-live` region announcing "Loading" and "Content loaded." | Loading states announced | Screen reader test |
| NFR-ACC-025 | ARIA attributes shall **not be overused**; native HTML elements and attributes shall be preferred over ARIA wherever possible (first rule of ARIA). | Native HTML preferred | Code review |

---

## 5. Keyboard Navigation

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-030 | All interactive elements shall be **operable via keyboard alone** without requiring a mouse or touch input. This includes navigation, links, buttons, form fields, search, dropdowns, modals, and content cards. | 100% keyboard operability | Manual keyboard-only test |
| NFR-ACC-031 | **Tab order** shall follow a logical reading order (left-to-right, top-to-bottom for LTR languages) and match the visual presentation of the page. | Logical tab order | Manual test |
| NFR-ACC-032 | A **"Skip to main content"** link shall be the first focusable element on every page, visible on focus, allowing keyboard users to bypass repetitive navigation. | Skip link present and functional | Manual test |
| NFR-ACC-033 | **Focus indicators** shall be clearly visible on all interactive elements with a minimum contrast ratio of 3:1 against the surrounding background. The default browser outline shall not be removed without providing a custom, equally visible alternative. | Visible focus indicators, 3:1 contrast | Visual inspection, contrast check |
| NFR-ACC-034 | **Keyboard shortcuts** (if implemented) shall not conflict with browser or assistive technology shortcuts and shall be documented in an accessible help section. | No conflicting shortcuts | Manual test |
| NFR-ACC-035 | **Dropdown menus** shall be operable via keyboard: Enter/Space to open, Arrow keys to navigate options, Escape to close, Tab to move to the next element. | Full keyboard support for dropdowns | Manual test |
| NFR-ACC-036 | **No keyboard traps** shall exist. Users shall be able to navigate away from any component using standard keyboard interaction (Tab, Shift+Tab, Escape). | Zero keyboard traps | Manual test |
| NFR-ACC-037 | **Focus management** for single-page application (SPA) navigation: when navigating between routes, focus shall be moved to the main content area or page heading to orient screen reader users. | Focus managed on route change | Manual screen reader test |

---

## 6. Screen Reader Support

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-040 | The platform shall be tested and verified compatible with the following **screen readers**: | Compatibility with 3 screen readers | Manual screen reader testing |
| | - **VoiceOver** (macOS/iOS) -- primary | | |
| | - **TalkBack** (Android) -- for Flutter mobile app | | |
| | - **NVDA** (Windows) -- for web platform | | |
| NFR-ACC-041 | All page content shall be **readable and navigable** using screen reader commands: heading navigation, landmark navigation, link listing, form field listing. | Full screen reader navigability | Manual screen reader test |
| NFR-ACC-042 | **Content order** in the DOM shall match the visual presentation order. CSS shall not be used to visually reorder content in a way that creates a confusing screen reader experience. | DOM order matches visual order | Manual review, screen reader test |
| NFR-ACC-043 | **Decorative images** shall use empty `alt=""` attributes to be skipped by screen readers. **Informative images** shall have descriptive alt text. **Complex images** (charts, infographics) shall have extended descriptions. | Appropriate alt text strategy | axe-core audit, manual review |
| NFR-ACC-044 | **Icons** used alongside text shall be hidden from screen readers (`aria-hidden="true"`). Icons used as the sole content of a button or link shall have `aria-label` descriptions. | Icons properly handled | axe-core audit |

---

## 7. Color and Visual Design

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-050 | **Text color contrast** shall meet WCAG 2.1 AA minimum ratios: **4.5:1** for normal text (below 18pt / 14pt bold) and **3:1** for large text (18pt+ / 14pt+ bold). | AA contrast ratios | axe-core audit, contrast checker tool |
| NFR-ACC-051 | **Non-text contrast** for UI components and graphical elements (icons, borders, focus indicators) shall meet a minimum ratio of **3:1** against adjacent colors. | 3:1 non-text contrast | Contrast checker tool |
| NFR-ACC-052 | **Color shall not be the sole means** of conveying information. All information conveyed through color (e.g., error states, status indicators, required fields) shall also be communicated through text, icons, or patterns. | No color-only information | Manual review |
| NFR-ACC-053 | The design system shall be reviewed for accessibility with **common color vision deficiencies** (protanopia, deuteranopia, tritanopia) using simulation tools. | Usable with color vision deficiencies | Simulation tool review |
| NFR-ACC-054 | **Text resizing** up to 200% shall not cause loss of content or functionality. The layout shall reflow without horizontal scrolling at 200% zoom on a 1280px-wide viewport. | Content intact at 200% zoom | Manual zoom test |
| NFR-ACC-055 | **Animations and motion** shall respect the `prefers-reduced-motion` media query. Users who prefer reduced motion shall see static alternatives or minimal transitions. | Reduced motion respected | Manual test with prefers-reduced-motion enabled |

---

## 8. Forms and Input

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-060 | All form fields shall have **visible labels** associated via `<label for="...">` or `aria-labelledby`. Placeholder text alone is not an acceptable substitute for labels. | Labels on all form fields | axe-core audit |
| NFR-ACC-061 | **Required fields** shall be indicated both visually (asterisk or text) and programmatically (`aria-required="true"` or HTML `required` attribute). | Required fields indicated | axe-core audit, manual review |
| NFR-ACC-062 | **Form validation errors** shall be: | Accessible error handling | Manual test |
| | (a) Announced to screen readers via `aria-live` region or `role="alert"` | | |
| | (b) Visually associated with the specific field using `aria-describedby` | | |
| | (c) Described in text (not color alone) with clear guidance on how to fix the error | | |
| NFR-ACC-063 | **Error summary** shall be provided at the top of the form listing all errors with links to the corresponding fields when a form submission fails. | Error summary with field links | Manual test |
| NFR-ACC-064 | **Autocomplete attributes** (`autocomplete`) shall be used on form fields for common data types (name, email, phone, address) to support browser autofill and assistive technologies. | Autocomplete on common fields | HTML attribute review |
| NFR-ACC-065 | **Touch targets** on mobile shall have a minimum size of **44x44 CSS pixels** (WCAG 2.5.5 AAA recommendation, adopted as AA target for this project). | Touch targets >= 44x44 px | Design review, manual measurement |
| NFR-ACC-066 | **Form instructions** and help text shall be programmatically associated with fields using `aria-describedby`. | Help text associated | axe-core audit |

---

## 9. Images and Media

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-070 | All **content images** shall have descriptive `alt` text that conveys the purpose or information of the image. Alt text shall be concise (under 125 characters where possible). | Alt text on all content images | axe-core audit, content audit |
| NFR-ACC-071 | **Decorative images** (backgrounds, spacers, purely visual embellishments) shall have empty `alt=""` to be ignored by screen readers. | Empty alt on decorative images | Code review |
| NFR-ACC-072 | **Video content** shall include closed captions (CC) for all spoken audio and sound effects. Captions shall be synchronized with the video. | Captions on all video | Manual review |
| NFR-ACC-073 | **Audio content** (podcasts, audio clips) shall have text transcripts available. | Transcripts for audio content | Content audit |
| NFR-ACC-074 | **Auto-playing media** is prohibited. All video and audio shall require user action to play. If auto-play is deemed necessary for specific use cases, the media shall start muted with visible controls to unmute. | No auto-play (or muted with controls) | Manual test |

---

## 10. Responsive Design and Mobile Accessibility

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-080 | The platform shall be **fully functional and accessible** across viewport widths from 320px to 2560px without horizontal scrolling (except for data tables or maps). | No horizontal scroll 320-2560px | Responsive design test |
| NFR-ACC-081 | **Content reflow** shall work correctly at all viewport sizes: single-column layout on small screens, multi-column on larger screens, with no content overlap or truncation. | Proper content reflow | Visual inspection at multiple breakpoints |
| NFR-ACC-082 | **Mobile navigation** (hamburger menu) shall be accessible: the toggle button shall have an `aria-expanded` attribute, the menu shall be keyboard navigable, and focus shall be managed when opening/closing. | Accessible mobile nav | Manual test on mobile, screen reader test |
| NFR-ACC-083 | **Pinch-to-zoom** shall not be disabled on mobile devices (`user-scalable=no` is prohibited in the viewport meta tag). | Zoom not disabled | Meta tag inspection |

---

## 11. Flutter Mobile Application Accessibility

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-090 | The Flutter mobile app shall support **TalkBack** (Android) and **VoiceOver** (iOS) screen readers with appropriate `Semantics` widgets on all interactive elements. | Screen reader support on both platforms | Manual screen reader test |
| NFR-ACC-091 | All interactive elements in the Flutter app shall meet minimum **touch target sizes** of 48x48 dp (Material Design recommendation, exceeding WCAG 44x44). | Touch targets >= 48x48 dp | Design review |
| NFR-ACC-092 | The Flutter app shall support **system-level accessibility settings**: dynamic type/font scaling, bold text, high contrast, reduced motion. | System accessibility settings respected | Manual test with accessibility settings enabled |
| NFR-ACC-093 | The Flutter app shall include a **Semantics tree** that provides meaningful ordering and grouping of elements for screen reader navigation. | Logical semantics tree | `flutter test` with semantics debugging |

---

## 12. Automated Testing

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-100 | **axe-core** (or equivalent, e.g., @axe-core/react) shall be integrated into the automated test suite, running on every pull request. | axe-core in CI/CD | CI/CD pipeline configuration |
| NFR-ACC-101 | **Zero axe-core violations** at the "critical" and "serious" impact levels shall be allowed in production builds. Violations shall block the deployment pipeline. | Zero critical/serious violations | CI/CD pipeline results |
| NFR-ACC-102 | **Lighthouse Accessibility audit** shall run in CI/CD for all page templates, with a minimum score of 95. | Lighthouse Accessibility >= 95 | Lighthouse CI results |
| NFR-ACC-103 | **Storybook** (or equivalent component library) shall include accessibility checks for all reusable UI components using the `@storybook/addon-a11y` plugin. | Accessibility addon active | Storybook configuration review |
| NFR-ACC-104 | **End-to-end accessibility tests** shall verify critical user journeys (registration, search, content browsing, checkout) are completable using keyboard-only navigation. | Critical journeys keyboard-testable | E2E test suite (Playwright/Cypress) |

---

## 13. Organizational Practices

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|-------------------|
| NFR-ACC-110 | **Accessibility acceptance criteria** shall be included in the definition of done for every user story that produces UI changes. | Accessibility in DoD | Story template review |
| NFR-ACC-111 | **Design reviews** shall include an accessibility check verifying color contrast, touch targets, focus states, and content order before development begins. | Accessibility in design review | Design review checklist |
| NFR-ACC-112 | An **accessibility statement** page shall be published on the platform describing the conformance level, known limitations, and contact information for reporting accessibility issues. | Accessibility statement published | Page availability check |
| NFR-ACC-113 | **User feedback channel** for accessibility issues shall be established and monitored, with a response SLA of 5 business days. | Feedback channel active, 5-day SLA | Channel configuration, SLA tracking |

---

## 14. Acceptance Criteria Summary

All requirements in this document are considered **met** when:

1. Lighthouse Accessibility score is 95+ on all public page templates.
2. axe-core reports zero critical or serious violations across all pages.
3. Manual keyboard-only testing confirms all critical user journeys are completable.
4. Screen reader testing (VoiceOver + NVDA) confirms content is readable and navigable.
5. Color contrast audit shows all text and UI elements meet WCAG 2.1 AA ratios.
6. An independent accessibility audit (manual + automated) confirms WCAG 2.1 AA conformance.

---

## 15. References

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Lighthouse Accessibility Scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring/)
- [Flutter Accessibility Documentation](https://docs.flutter.dev/development/accessibility-and-localization/accessibility)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
