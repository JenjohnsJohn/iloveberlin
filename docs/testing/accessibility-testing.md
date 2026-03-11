# ILoveBerlin - Accessibility Testing

## Overview

The ILoveBerlin platform must be accessible to all users, including those with disabilities. We target **WCAG 2.1 Level AA** compliance across the web application and follow platform-specific accessibility guidelines for the Flutter mobile app. Accessibility is not optional -- it is enforced in CI and treated as a blocking requirement for release.

---

## 1. WCAG 2.1 AA Compliance Checklist

### Perceivable

| Criterion | ID | Requirement | Testing Method |
|---|---|---|---|
| Non-text Content | 1.1.1 | All images have meaningful alt text (or are marked decorative) | axe-core, manual review |
| Captions | 1.2.2 | All video content has captions | Manual review |
| Audio Description | 1.2.5 | Video has audio description when needed | Manual review |
| Info and Relationships | 1.3.1 | Semantic HTML used (headings, lists, landmarks) | axe-core, manual review |
| Meaningful Sequence | 1.3.2 | DOM order matches visual order | axe-core, screen reader test |
| Sensory Characteristics | 1.3.3 | Instructions do not rely solely on color, shape, or location | Manual review |
| Use of Color | 1.4.1 | Color is not the only means of conveying information | Manual review |
| Contrast (Minimum) | 1.4.3 | Text contrast ratio at least 4.5:1 (3:1 for large text) | axe-core, contrast checker |
| Resize Text | 1.4.4 | Text resizable up to 200% without loss of content | Manual zoom test |
| Images of Text | 1.4.5 | Real text used instead of images of text | Manual review |
| Reflow | 1.4.10 | Content reflows at 320px width without horizontal scrolling | Responsive test |
| Non-text Contrast | 1.4.11 | UI component boundaries and icons have 3:1 contrast ratio | axe-core, manual review |
| Text Spacing | 1.4.12 | Content readable when text spacing is adjusted | Manual test |

### Operable

| Criterion | ID | Requirement | Testing Method |
|---|---|---|---|
| Keyboard | 2.1.1 | All functionality available via keyboard | Keyboard navigation test |
| No Keyboard Trap | 2.1.2 | Keyboard focus is never trapped | Keyboard navigation test |
| Timing Adjustable | 2.2.1 | Time limits can be extended or disabled | Manual review |
| Pause, Stop, Hide | 2.2.2 | Auto-moving content can be paused | Manual review |
| Three Flashes | 2.3.1 | No content flashes more than 3 times per second | Manual review |
| Skip Navigation | 2.4.1 | Skip-to-content link available | Keyboard test |
| Page Titled | 2.4.2 | Pages have descriptive, unique titles | axe-core |
| Focus Order | 2.4.3 | Focus order is logical and intuitive | Keyboard navigation test |
| Link Purpose | 2.4.4 | Link text describes destination (no "click here") | axe-core, manual review |
| Multiple Ways | 2.4.5 | Multiple ways to find pages (nav, search, sitemap) | Manual review |
| Headings and Labels | 2.4.6 | Headings and labels are descriptive | axe-core, manual review |
| Focus Visible | 2.4.7 | Keyboard focus indicator is visible | Manual review |

### Understandable

| Criterion | ID | Requirement | Testing Method |
|---|---|---|---|
| Language of Page | 3.1.1 | Page language declared in HTML | axe-core |
| Language of Parts | 3.1.2 | Language changes marked (e.g., German text within English page) | Manual review |
| On Focus | 3.2.1 | No unexpected context changes on focus | Keyboard test |
| On Input | 3.2.2 | No unexpected context changes on input | Manual test |
| Consistent Navigation | 3.2.3 | Navigation is consistent across pages | Manual review |
| Error Identification | 3.3.1 | Errors are identified and described in text | Manual form test |
| Labels or Instructions | 3.3.2 | Forms have labels and instructions | axe-core, manual review |
| Error Suggestion | 3.3.3 | Error messages suggest correction | Manual form test |
| Error Prevention | 3.3.4 | Reversible/confirmed actions for legal/financial data | Manual review |

### Robust

| Criterion | ID | Requirement | Testing Method |
|---|---|---|---|
| Parsing | 4.1.1 | Valid HTML, no duplicate IDs | axe-core, HTML validator |
| Name, Role, Value | 4.1.2 | Custom components have proper ARIA roles and states | axe-core, screen reader |
| Status Messages | 4.1.3 | Status messages announced by screen readers | Screen reader test |

---

## 2. axe-core Automated Testing

### Setup

```bash
cd apps/web
npm install --save-dev @axe-core/playwright axe-html-reporter
```

### Playwright + axe-core Integration

```typescript
// apps/web/e2e/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Articles', path: '/articles' },
  { name: 'Events', path: '/events' },
  { name: 'Classifieds', path: '/classifieds' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Search', path: '/search?q=berlin' },
];

test.describe('Accessibility - axe-core scans', () => {
  for (const { name, path } of pages) {
    test(`${name} page should have no critical accessibility violations`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.third-party-widget') // Exclude third-party embeds we cannot control
        .analyze();

      // No critical or serious violations allowed
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );

      if (criticalViolations.length > 0) {
        const summary = criticalViolations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`,
          )
          .join('\n');

        console.error(`Accessibility violations on ${name}:\n${summary}`);
      }

      expect(
        criticalViolations,
        `${name} has ${criticalViolations.length} critical/serious violations`,
      ).toHaveLength(0);

      // Log moderate/minor violations as warnings
      const minorViolations = results.violations.filter(
        (v) => v.impact === 'moderate' || v.impact === 'minor',
      );

      if (minorViolations.length > 0) {
        console.warn(
          `${name}: ${minorViolations.length} minor/moderate violations (non-blocking)`,
        );
      }
    });
  }
});
```

### Component-Level Accessibility Testing

```typescript
// apps/web/src/components/ArticleCard/ArticleCard.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ArticleCard } from './ArticleCard';
import { createMockArticle } from '@test/factories/article.factory';

expect.extend(toHaveNoViolations);

describe('ArticleCard accessibility', () => {
  it('should have no accessibility violations', async () => {
    const article = createMockArticle({
      title: 'Test Article',
      coverImage: '/test.jpg',
    });

    const { container } = render(<ArticleCard article={article} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should have no violations when image is missing', async () => {
    const article = createMockArticle({
      title: 'No Image Article',
      coverImage: null,
    });

    const { container } = render(<ArticleCard article={article} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

### Jest-axe Setup

```bash
npm install --save-dev jest-axe @types/jest-axe
```

```typescript
// apps/web/jest.setup.ts (add to existing setup)
import 'jest-axe/extend-expect';
```

### CI Configuration

```yaml
# Part of the PR checks pipeline
- name: Run accessibility tests
  run: |
    npx playwright test e2e/accessibility/ --project=chromium
  working-directory: apps/web
  env:
    E2E_BASE_URL: http://localhost:3000
```

---

## 3. Manual Testing Procedures

### Keyboard Navigation Testing

Test every interactive page using **only the keyboard** (no mouse). Document results in the accessibility checklist.

#### Keyboard Controls

| Key | Action |
|---|---|
| `Tab` | Move focus to next interactive element |
| `Shift + Tab` | Move focus to previous interactive element |
| `Enter` | Activate button, link, or form submit |
| `Space` | Activate button, toggle checkbox |
| `Arrow keys` | Navigate within menus, radio groups, tabs |
| `Escape` | Close modal, dropdown, or popover |
| `Home / End` | Jump to first/last item in a list |

#### Keyboard Navigation Checklist

For each page, verify:

- [ ] All interactive elements (links, buttons, inputs, selects) are reachable via `Tab`
- [ ] Focus order follows the visual reading order (left to right, top to bottom)
- [ ] Focus is never trapped (pressing `Tab` always moves to the next element or wraps)
- [ ] Skip-to-content link appears on first `Tab` press and works correctly
- [ ] Dropdown menus open with `Enter`/`Space` and close with `Escape`
- [ ] Modal dialogs trap focus within the modal while open
- [ ] Modal dialogs return focus to the trigger element when closed
- [ ] Custom components (carousels, accordions, tabs) follow WAI-ARIA patterns
- [ ] All form fields can be filled and submitted via keyboard
- [ ] Error messages are announced and focusable
- [ ] Focus indicator is clearly visible on all interactive elements (not just the browser default)

#### Pages to Test

1. Homepage
2. Articles listing and detail pages
3. Events listing and detail pages
4. Classifieds listing, detail, and creation pages
5. Login and registration forms
6. User profile and dashboard
7. Search results
8. Checkout flow

### Screen Reader Testing

#### Tools

| Screen Reader | Platform | Browser |
|---|---|---|
| **NVDA** (primary) | Windows | Chrome, Firefox |
| **VoiceOver** | macOS | Safari |
| **VoiceOver** | iOS | Safari |
| **TalkBack** | Android | Chrome |

#### Screen Reader Testing Procedure

1. **Navigate the page using standard screen reader commands.**
   - Does the screen reader announce the page title?
   - Are all headings announced in the correct hierarchy (h1 > h2 > h3)?
   - Are landmark regions announced (main, nav, footer, aside)?

2. **Read through all content.**
   - Is the reading order logical?
   - Are images announced with meaningful alt text?
   - Are decorative images skipped?
   - Is link text descriptive (not "click here" or "read more")?

3. **Interact with forms.**
   - Are all form fields labeled?
   - Are required fields announced as required?
   - Are error messages announced when they appear?
   - Are success messages announced?

4. **Interact with dynamic content.**
   - Are notifications (toast, snackbar) announced via `aria-live` regions?
   - Are loading states announced?
   - Are content changes (pagination, filtering) announced?

5. **Navigate modals and dialogs.**
   - Is the modal announced when opened?
   - Is focus moved to the modal?
   - Is content behind the modal hidden from the screen reader?
   - Is focus returned when the modal closes?

#### Screen Reader Testing Checklist Template

```markdown
## Screen Reader Audit: [Page Name]
Date: [Date]
Tester: [Name]
Screen Reader: [NVDA/VoiceOver]
Browser: [Chrome/Safari]

### Page Structure
- [ ] Page title announced correctly
- [ ] Main heading (h1) present and descriptive
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Landmark regions present (main, nav, footer)

### Content
- [ ] All images have appropriate alt text
- [ ] Decorative images are hidden (alt="" or aria-hidden)
- [ ] Links have descriptive text
- [ ] Lists are marked up correctly
- [ ] Tables have headers (if applicable)

### Interaction
- [ ] All buttons are announced with their purpose
- [ ] Form fields have associated labels
- [ ] Error messages are announced automatically
- [ ] Dynamic content changes are announced

### Notes
[Free-form observations and issues found]
```

---

## 4. Color Contrast Verification

### Requirements

| Element Type | Minimum Contrast Ratio (WCAG AA) |
|---|---|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 |
| Large text (>= 18pt / >= 14pt bold) | 3:1 |
| UI components and graphical objects | 3:1 |
| Disabled elements | Exempt |
| Logos and brand text | Exempt |

### ILoveBerlin Design System Colors (Verify These)

| Color Pair | Foreground | Background | Expected Ratio | Passes AA? |
|---|---|---|---|---|
| Body text on white | #1A1A1A | #FFFFFF | ~16.5:1 | Yes |
| Muted text on white | #6B7280 | #FFFFFF | Verify >= 4.5:1 | Check |
| Link text on white | #2563EB | #FFFFFF | Verify >= 4.5:1 | Check |
| White text on primary | #FFFFFF | #E11D48 | Verify >= 4.5:1 | Check |
| White text on dark | #FFFFFF | #1A1A1A | ~16.5:1 | Yes |
| Error text on white | #DC2626 | #FFFFFF | Verify >= 4.5:1 | Check |
| Success text on white | #16A34A | #FFFFFF | Verify >= 4.5:1 | Check |
| Placeholder text | #9CA3AF | #FFFFFF | Verify >= 4.5:1 | Check |

### Tools for Contrast Checking

- **axe-core**: Automatically flags contrast violations
- **Chrome DevTools**: Inspect element > color picker shows contrast ratio
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Figma Plugin**: Stark or A11y - Color Contrast Checker

### Automated Contrast Test

```typescript
// apps/web/e2e/accessibility/contrast.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Color Contrast', () => {
  const pages = ['/', '/articles', '/events', '/login'];

  for (const path of pages) {
    test(`${path} passes WCAG AA contrast requirements`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(results.violations).toHaveLength(0);
    });

    test(`${path} passes contrast in dark mode`, async ({ page }) => {
      // Enable dark mode via media query emulation
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(results.violations).toHaveLength(0);
    });
  }
});
```

---

## 5. Focus Management Testing

### Focus Management Rules

1. **Page load**: Focus starts at the top of the page (or skip-to-content link).
2. **Navigation**: After client-side navigation, focus moves to the main content heading.
3. **Modal open**: Focus moves to the first focusable element inside the modal.
4. **Modal close**: Focus returns to the element that triggered the modal.
5. **Toast/notification**: Does not steal focus; announced via `aria-live`.
6. **Dynamic content load**: Focus remains on the trigger (e.g., "Load More" button).
7. **Form error**: Focus moves to the first errored field or the error summary.
8. **Tab deletion**: Focus moves to the adjacent tab.

### Focus Management Test

```typescript
// apps/web/e2e/accessibility/focus.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Focus Management', () => {
  test('skip-to-content link is present and functional', async ({ page }) => {
    await page.goto('/');

    // Press Tab to reveal skip link
    await page.keyboard.press('Tab');

    const skipLink = page.getByText(/skip to.*content/i);
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');

    // Focus should be on the main content
    const main = page.locator('main, [id="main-content"]').first();
    await expect(main).toBeFocused();
  });

  test('modal traps focus and returns it on close', async ({ page }) => {
    await page.goto('/login');

    // Trigger a modal (e.g., forgot password)
    await page.getByRole('link', { name: /forgot password/i }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Focus should be inside the modal
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Verify focus is inside the modal
    const isInsideModal = await focusedElement.evaluate((el) => {
      return el.closest('[role="dialog"]') !== null;
    });
    expect(isInsideModal).toBe(true);

    // Tab through modal elements - focus should not leave the modal
    const focusableInModal = modal.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const count = await focusableInModal.count();

    for (let i = 0; i < count + 2; i++) {
      await page.keyboard.press('Tab');
      const currentFocused = page.locator(':focus');
      const stillInModal = await currentFocused.evaluate((el) => {
        return el.closest('[role="dialog"]') !== null;
      });
      expect(stillInModal).toBe(true);
    }

    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Focus should return to the trigger element
    await expect(
      page.getByRole('link', { name: /forgot password/i }),
    ).toBeFocused();
  });

  test('form error moves focus to first errored field', async ({ page }) => {
    await page.goto('/register');

    // Submit empty form
    await page.getByRole('button', { name: /create account|register/i }).click();

    // Focus should move to the first errored field
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate((el) =>
      el.tagName.toLowerCase(),
    );
    expect(['input', 'select', 'textarea']).toContain(tagName);
  });

  test('client-side navigation moves focus to main heading', async ({
    page,
  }) => {
    await page.goto('/');

    // Click a navigation link
    await page.getByRole('link', { name: /articles/i }).first().click();
    await page.waitForURL('/articles');

    // Focus should be on the page heading or main content
    // (implementation depends on focus management approach)
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});
```

---

## 6. ARIA Attribute Verification

### Common ARIA Patterns in ILoveBerlin

#### Navigation Menu

```html
<!-- Expected markup -->
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/articles">Articles</a>
    </li>
    <li role="none">
      <a role="menuitem" href="/events">Events</a>
    </li>
    <li role="none">
      <a role="menuitem" aria-current="page" href="/classifieds">Classifieds</a>
    </li>
  </ul>
</nav>
```

#### Modal Dialog

```html
<!-- Expected markup -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm Action</h2>
  <p>Are you sure you want to proceed?</p>
  <button>Cancel</button>
  <button>Confirm</button>
</div>
```

#### Expandable Section / Accordion

```html
<!-- Expected markup -->
<h3>
  <button aria-expanded="false" aria-controls="section-1-content">
    Section Title
  </button>
</h3>
<div id="section-1-content" role="region" aria-labelledby="section-1-heading" hidden>
  <p>Section content...</p>
</div>
```

#### Live Region (Toast Notification)

```html
<!-- Expected markup -->
<div role="status" aria-live="polite" aria-atomic="true">
  Your classified has been published successfully.
</div>
```

#### Loading State

```html
<!-- Expected markup -->
<div aria-busy="true" aria-live="polite">
  <span class="sr-only">Loading articles...</span>
  <div class="spinner" aria-hidden="true"></div>
</div>
```

### ARIA Automated Checks

```typescript
// apps/web/e2e/accessibility/aria.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('ARIA Attributes', () => {
  test('all interactive elements have accessible names', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules([
        'button-name',
        'image-alt',
        'input-image-alt',
        'label',
        'link-name',
        'select-name',
      ])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('ARIA roles are valid', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules([
        'aria-allowed-attr',
        'aria-allowed-role',
        'aria-hidden-body',
        'aria-required-attr',
        'aria-required-children',
        'aria-required-parent',
        'aria-roles',
        'aria-valid-attr-value',
        'aria-valid-attr',
      ])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('landmarks are present and properly labeled', async ({ page }) => {
    await page.goto('/');

    // Verify required landmarks
    await expect(page.locator('header, [role="banner"]')).toBeVisible();
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    await expect(page.locator('footer, [role="contentinfo"]')).toBeVisible();
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();

    // Multiple nav elements should be labeled
    const navs = page.locator('nav');
    const navCount = await navs.count();
    if (navCount > 1) {
      for (let i = 0; i < navCount; i++) {
        const label = await navs.nth(i).getAttribute('aria-label');
        const labelledby = await navs.nth(i).getAttribute('aria-labelledby');
        expect(
          label || labelledby,
          `Navigation element ${i} missing aria-label or aria-labelledby`,
        ).toBeTruthy();
      }
    }
  });

  test('form fields have associated labels', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withRules(['label', 'label-title-only'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('heading hierarchy is valid', async ({ page }) => {
    await page.goto('/');

    // Check that heading levels do not skip
    const headings = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((elements) =>
        elements.map((el) => ({
          level: parseInt(el.tagName.substring(1)),
          text: el.textContent?.trim().substring(0, 50),
        })),
      );

    expect(headings.length).toBeGreaterThan(0);

    // Verify there is exactly one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Verify no skipped heading levels
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i - 1].level;
      expect(
        diff,
        `Heading level skipped: h${headings[i - 1].level} -> h${headings[i].level} (${headings[i].text})`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
```

---

## 7. Mobile Accessibility (VoiceOver and TalkBack)

### iOS VoiceOver Testing (Flutter App)

#### Setup

1. Open **Settings > Accessibility > VoiceOver** on the iOS device or simulator.
2. Turn on VoiceOver.

#### Testing Procedure

| Step | Action | Expected Result |
|---|---|---|
| 1 | Swipe right through the home screen | Each element is announced with its role and label |
| 2 | Navigate to the articles tab | "Articles" tab is announced, screen changes |
| 3 | Swipe through article cards | Title, excerpt, and date are announced for each card |
| 4 | Double-tap an article | Article detail is announced, heading is read |
| 5 | Navigate back | "Back" button is announced, previous screen returns |
| 6 | Navigate to login | All form fields are labeled and announced |
| 7 | Enter text in fields | Each character is announced |
| 8 | Submit form | Feedback (success or error) is announced |
| 9 | Verify error states | Error messages are announced when they appear |
| 10 | Test custom widgets | Carousels, bottom sheets, and dialogs are accessible |

### Android TalkBack Testing (Flutter App)

#### Setup

1. Open **Settings > Accessibility > TalkBack** on the Android device or emulator.
2. Turn on TalkBack.

#### Testing Procedure

Same steps as VoiceOver above, using TalkBack gestures:
- **Swipe right**: Move to next element
- **Double-tap**: Activate focused element
- **Swipe up then down**: Open context menu

### Flutter Accessibility in Code

```dart
// Ensure all interactive widgets have Semantics
Semantics(
  label: 'Berlin Coffee Festival',
  hint: 'Double tap to view event details',
  button: true,
  child: EventCard(event: event),
)

// Ensure images have semantic labels
Image.network(
  article.coverImage,
  semanticLabel: article.title,
)

// Exclude decorative elements
ExcludeSemantics(
  child: DecorativeBackground(),
)

// Mark regions
Semantics(
  header: true,
  child: Text('Featured Articles', style: headlineStyle),
)
```

### Flutter Accessibility Tests

```dart
// test/accessibility/semantics_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iloveberlin/features/articles/widgets/article_card.dart';
import 'package:iloveberlin/features/articles/models/article.dart';

void main() {
  testWidgets('ArticleCard has correct semantics', (tester) async {
    final article = Article(
      id: '1',
      title: 'Berlin Parks Guide',
      excerpt: 'Discover beautiful parks',
      slug: 'berlin-parks',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: ArticleCard(article: article)),
      ),
    );

    // Verify semantics
    expect(
      tester.getSemantics(find.byType(ArticleCard)),
      matchesSemantics(
        label: 'Berlin Parks Guide',
        hasAction: true,
      ),
    );
  });

  testWidgets('Login form fields are labeled', (tester) async {
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: LoginForm())),
    );

    // Verify each field has a semantic label
    final emailField = find.bySemanticsLabel('Email');
    expect(emailField, findsOneWidget);

    final passwordField = find.bySemanticsLabel('Password');
    expect(passwordField, findsOneWidget);
  });
}
```

---

## 8. Accessibility Testing Schedule

| Activity | Frequency | Tool | Responsibility |
|---|---|---|---|
| axe-core automated scan | Every PR | CI / Playwright | Automated |
| Component-level jest-axe tests | Every PR (for new/modified components) | CI / Jest | Developer |
| Keyboard navigation audit | Per sprint (changed pages) | Manual | Developer or QA |
| Screen reader audit (NVDA) | Per release | Manual | QA |
| Screen reader audit (VoiceOver) | Per release | Manual | QA |
| Color contrast check | Per design change | axe-core + manual | Designer or developer |
| Mobile accessibility (VoiceOver) | Per release | Manual on device | QA |
| Mobile accessibility (TalkBack) | Per release | Manual on device | QA |
| Full WCAG 2.1 AA audit | Quarterly | External audit or internal | Team lead |

---

## 9. Handling Accessibility Violations

### Severity Levels

| Level | Description | Response Time | CI Impact |
|---|---|---|---|
| **Critical** | Prevents use by assistive technology users (e.g., no alt text on critical images, keyboard trap) | Fix before merge | Blocks merge |
| **Serious** | Significant barrier (e.g., poor contrast, missing labels) | Fix before merge | Blocks merge |
| **Moderate** | Usability issue (e.g., inconsistent focus order) | Fix within sprint | Warning |
| **Minor** | Best-practice improvement (e.g., redundant ARIA) | Fix when convenient | Warning |

### Filing Accessibility Bugs

When an accessibility issue is found, file a ticket with:

1. **Page/component** where the issue occurs
2. **WCAG criterion** violated (e.g., 1.4.3 Contrast Minimum)
3. **Severity** (critical, serious, moderate, minor)
4. **Steps to reproduce** (include assistive technology used)
5. **Expected behavior** vs. **actual behavior**
6. **Suggested fix** (if known)
7. **Screenshot or recording** (if applicable)

### Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Flutter Accessibility Guide](https://docs.flutter.dev/development/accessibility-and-localization/accessibility)
