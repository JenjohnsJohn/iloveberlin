# ILoveBerlin - End-to-End Testing Guidelines

## Overview

End-to-end (E2E) tests validate complete user flows from the browser or mobile device through the full application stack. They represent the top of the testing pyramid (~10% of tests) and provide the highest confidence that the system works as users expect. E2E tests are slower and more expensive to run, so we focus them on critical user journeys.

---

## 1. Playwright for Web E2E Testing

### Setup

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
```

### File Structure

```
apps/web/
  e2e/
    fixtures/
      auth.fixture.ts        # Authenticated user fixture
      test-data.fixture.ts   # Data seeding helpers
    pages/
      home.page.ts           # Page Object: Home
      login.page.ts          # Page Object: Login
      articles.page.ts       # Page Object: Articles
      events.page.ts         # Page Object: Events
      classifieds.page.ts    # Page Object: Classifieds
      checkout.page.ts       # Page Object: Checkout
    flows/
      auth.spec.ts           # Authentication flows
      articles.spec.ts       # Article browsing flows
      events.spec.ts         # Event browsing and ticketing
      classifieds.spec.ts    # Classified creation and management
      checkout.spec.ts       # Payment checkout flow
      search.spec.ts         # Search functionality
    global-setup.ts          # Global setup (seed database)
    global-teardown.ts       # Global teardown (clean database)
```

### Page Object Model

```typescript
// apps/web/e2e/pages/login.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: /log in|sign in/i });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', {
      name: /forgot password/i,
    });
    this.registerLink = page.getByRole('link', {
      name: /create.*account|sign up|register/i,
    });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/(dashboard|$)/);
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

```typescript
// apps/web/e2e/pages/articles.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class ArticlesPage {
  readonly page: Page;
  readonly articleCards: Locator;
  readonly categoryFilter: Locator;
  readonly searchInput: Locator;
  readonly loadMoreButton: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.articleCards = page.getByTestId('article-card');
    this.categoryFilter = page.getByTestId('category-filter');
    this.searchInput = page.getByPlaceholder(/search/i);
    this.loadMoreButton = page.getByRole('button', { name: /load more/i });
    this.sortSelect = page.getByLabel(/sort/i);
  }

  async goto() {
    await this.page.goto('/articles');
  }

  async clickArticle(title: string) {
    await this.page
      .getByRole('heading', { name: title })
      .click();
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.getByText(category).click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async expectArticleCount(count: number) {
    await expect(this.articleCards).toHaveCount(count);
  }

  async expectArticleVisible(title: string) {
    await expect(
      this.page.getByRole('heading', { name: title }),
    ).toBeVisible();
  }
}
```

```typescript
// apps/web/e2e/pages/classifieds.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class ClassifiedsPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly priceInput: Locator;
  readonly categorySelect: Locator;
  readonly imageUpload: Locator;
  readonly submitButton: Locator;
  readonly classifiedCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByRole('link', { name: /post.*classified|create/i });
    this.titleInput = page.getByLabel(/title/i);
    this.descriptionInput = page.getByLabel(/description/i);
    this.priceInput = page.getByLabel(/price/i);
    this.categorySelect = page.getByLabel(/category/i);
    this.imageUpload = page.getByLabel(/upload.*image|photo/i);
    this.submitButton = page.getByRole('button', { name: /submit|publish|post/i });
    this.classifiedCards = page.getByTestId('classified-card');
  }

  async goto() {
    await this.page.goto('/classifieds');
  }

  async gotoCreate() {
    await this.page.goto('/classifieds/create');
  }

  async fillClassifiedForm(data: {
    title: string;
    description: string;
    price?: string;
    category: string;
    imagePath?: string;
  }) {
    await this.titleInput.fill(data.title);
    await this.descriptionInput.fill(data.description);
    if (data.price) {
      await this.priceInput.fill(data.price);
    }
    await this.categorySelect.selectOption({ label: data.category });
    if (data.imagePath) {
      await this.imageUpload.setInputFiles(data.imagePath);
    }
  }

  async submit() {
    await this.submitButton.click();
  }
}
```

### Auth Fixture

```typescript
// apps/web/e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
  editorPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@test.iloveberlin.biz');
    await page.getByLabel('Password').fill('UserPass123!');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL(/\/(dashboard|$)/);

    // Store auth state for subsequent requests
    await page.context().storageState({ path: '.auth/user.json' });

    await use(page);
  },

  editorPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/editor.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
```

### Global Setup: Data Seeding for E2E

```typescript
// apps/web/e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  const apiURL = process.env.E2E_API_URL || 'http://localhost:3001';

  // Seed the test database via the API
  const response = await fetch(`${apiURL}/api/test/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Secret': process.env.E2E_TEST_SECRET || 'e2e-test-secret',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to seed test database: ${response.status} ${await response.text()}`,
    );
  }

  console.log('Test database seeded successfully');

  // Pre-authenticate test users and save storage state
  const browser = await chromium.launch();

  // Authenticate regular user
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await userPage.goto(`${baseURL}/login`);
  await userPage.getByLabel('Email').fill('user@test.iloveberlin.biz');
  await userPage.getByLabel('Password').fill('UserPass123!');
  await userPage.getByRole('button', { name: /log in/i }).click();
  await userPage.waitForURL(/\/(dashboard|$)/);
  await userContext.storageState({ path: '.auth/user.json' });
  await userContext.close();

  // Authenticate editor user
  const editorContext = await browser.newContext();
  const editorPage = await editorContext.newPage();
  await editorPage.goto(`${baseURL}/login`);
  await editorPage.getByLabel('Email').fill('editor@test.iloveberlin.biz');
  await editorPage.getByLabel('Password').fill('EditorPass123!');
  await editorPage.getByRole('button', { name: /log in/i }).click();
  await editorPage.waitForURL(/\/(dashboard|$)/);
  await editorContext.storageState({ path: '.auth/editor.json' });
  await editorContext.close();

  // Authenticate admin user
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseURL}/login`);
  await adminPage.getByLabel('Email').fill('admin@test.iloveberlin.biz');
  await adminPage.getByLabel('Password').fill('AdminPass123!');
  await adminPage.getByRole('button', { name: /log in/i }).click();
  await adminPage.waitForURL(/\/(dashboard|$)/);
  await adminContext.storageState({ path: '.auth/admin.json' });
  await adminContext.close();

  await browser.close();
}

export default globalSetup;
```

```typescript
// apps/web/e2e/global-teardown.ts
async function globalTeardown() {
  const apiURL = process.env.E2E_API_URL || 'http://localhost:3001';

  await fetch(`${apiURL}/api/test/cleanup`, {
    method: 'POST',
    headers: {
      'X-Test-Secret': process.env.E2E_TEST_SECRET || 'e2e-test-secret',
    },
  });

  console.log('Test database cleaned up');
}

export default globalTeardown;
```

---

## 2. Critical User Flow Test Scenarios

### Authentication Flow

```typescript
// apps/web/e2e/flows/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication Flow', () => {
  test.describe('Registration', () => {
    test('user can register with valid credentials', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel('First name').fill('Test');
      await page.getByLabel('Last name').fill('User');
      await page.getByLabel('Email').fill(`e2e-${Date.now()}@test.com`);
      await page.getByLabel('Password').fill('SecurePass123!');
      await page.getByLabel('Confirm password').fill('SecurePass123!');
      await page.getByRole('button', { name: /create account|register/i }).click();

      // Should redirect to verification prompt
      await expect(page).toHaveURL(/verify|check.*email/i);
      await expect(
        page.getByText(/check your email|verification/i),
      ).toBeVisible();
    });

    test('registration shows validation errors for weak password', async ({
      page,
    }) => {
      await page.goto('/register');

      await page.getByLabel('First name').fill('Test');
      await page.getByLabel('Last name').fill('User');
      await page.getByLabel('Email').fill('weak@test.com');
      await page.getByLabel('Password').fill('123');
      await page.getByLabel('Confirm password').fill('123');
      await page.getByRole('button', { name: /create account|register/i }).click();

      await expect(page.getByText(/password.*must/i)).toBeVisible();
    });
  });

  test.describe('Login', () => {
    test('user can log in with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('user@test.iloveberlin.biz', 'UserPass123!');
      await loginPage.expectLoggedIn();
    });

    test('shows error for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('user@test.iloveberlin.biz', 'WrongPassword!');
      await loginPage.expectError(/invalid.*credentials|email.*password/i);
    });

    test('user can log out', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('user@test.iloveberlin.biz', 'UserPass123!');
      await loginPage.expectLoggedIn();

      // Open user menu and click logout
      await page.getByTestId('user-menu').click();
      await page.getByRole('menuitem', { name: /log out|sign out/i }).click();

      // Should redirect to homepage or login
      await expect(page).toHaveURL(/\/(login)?$/);
    });

    test('redirects to original page after login', async ({ page }) => {
      // Try to access a protected page
      await page.goto('/dashboard/classifieds/create');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);

      // Login
      await page.getByLabel('Email').fill('user@test.iloveberlin.biz');
      await page.getByLabel('Password').fill('UserPass123!');
      await page.getByRole('button', { name: /log in/i }).click();

      // Should redirect back to the original page
      await expect(page).toHaveURL(/classifieds\/create/);
    });
  });
});
```

### Browse Articles Flow

```typescript
// apps/web/e2e/flows/articles.spec.ts
import { test, expect } from '@playwright/test';
import { ArticlesPage } from '../pages/articles.page';

test.describe('Articles Browsing Flow', () => {
  test('user can browse articles on the homepage', async ({ page }) => {
    await page.goto('/');

    // Featured articles section should be visible
    await expect(page.getByTestId('featured-articles')).toBeVisible();

    // Should show article cards
    const articleCards = page.getByTestId('article-card');
    await expect(articleCards.first()).toBeVisible();
  });

  test('user can navigate to articles listing page', async ({ page }) => {
    const articlesPage = new ArticlesPage(page);
    await articlesPage.goto();

    // Should show multiple articles
    await expect(articlesPage.articleCards.first()).toBeVisible();
  });

  test('user can filter articles by category', async ({ page }) => {
    const articlesPage = new ArticlesPage(page);
    await articlesPage.goto();

    await articlesPage.filterByCategory('Lifestyle');

    // URL should reflect the filter
    await expect(page).toHaveURL(/category=lifestyle/);

    // All visible articles should be in the Lifestyle category
    const categoryBadges = page.getByTestId('article-category');
    const count = await categoryBadges.count();
    for (let i = 0; i < count; i++) {
      await expect(categoryBadges.nth(i)).toHaveText('Lifestyle');
    }
  });

  test('user can read a full article', async ({ page }) => {
    const articlesPage = new ArticlesPage(page);
    await articlesPage.goto();

    // Click the first article
    const firstTitle = await articlesPage.articleCards
      .first()
      .getByRole('heading')
      .textContent();

    await articlesPage.articleCards.first().click();

    // Should navigate to article detail page
    await expect(page).toHaveURL(/\/articles\/.+/);

    // Article content should be visible
    await expect(page.getByRole('article')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: firstTitle! }),
    ).toBeVisible();
  });

  test('user can search for articles', async ({ page }) => {
    const articlesPage = new ArticlesPage(page);
    await articlesPage.goto();

    await articlesPage.search('Berlin coffee');

    // Should show search results
    await expect(page).toHaveURL(/search.*coffee/i);
    await expect(articlesPage.articleCards.first()).toBeVisible();
  });

  test('user can load more articles with pagination', async ({ page }) => {
    const articlesPage = new ArticlesPage(page);
    await articlesPage.goto();

    const initialCount = await articlesPage.articleCards.count();

    // Click load more if available
    if (await articlesPage.loadMoreButton.isVisible()) {
      await articlesPage.loadMoreButton.click();

      // Wait for new articles to load
      await page.waitForResponse((resp) =>
        resp.url().includes('/api/articles') && resp.status() === 200,
      );

      const newCount = await articlesPage.articleCards.count();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });
});
```

### Events Flow

```typescript
// apps/web/e2e/flows/events.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Events Flow', () => {
  test('user can browse upcoming events', async ({ page }) => {
    await page.goto('/events');

    const eventCards = page.getByTestId('event-card');
    await expect(eventCards.first()).toBeVisible();

    // Events should show date, title, and venue
    const firstEvent = eventCards.first();
    await expect(firstEvent.getByTestId('event-date')).toBeVisible();
    await expect(firstEvent.getByRole('heading')).toBeVisible();
    await expect(firstEvent.getByTestId('event-venue')).toBeVisible();
  });

  test('user can view event details', async ({ page }) => {
    await page.goto('/events');

    const firstEventTitle = await page
      .getByTestId('event-card')
      .first()
      .getByRole('heading')
      .textContent();

    await page.getByTestId('event-card').first().click();

    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(
      page.getByRole('heading', { level: 1, name: firstEventTitle! }),
    ).toBeVisible();
    await expect(page.getByTestId('event-description')).toBeVisible();
    await expect(page.getByTestId('event-location')).toBeVisible();
  });

  test('user can filter events by date', async ({ page }) => {
    await page.goto('/events');

    // Select "This Weekend" filter
    await page.getByRole('button', { name: /this weekend/i }).click();

    // Verify filtered results
    await expect(page).toHaveURL(/filter.*weekend|date/i);
  });

  test('user can filter events by category', async ({ page }) => {
    await page.goto('/events');

    await page.getByTestId('event-category-filter').getByText('Music').click();

    await expect(page).toHaveURL(/category=music/i);
  });
});
```

### Create Classified Flow

```typescript
// apps/web/e2e/flows/classifieds.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { ClassifiedsPage } from '../pages/classifieds.page';
import path from 'path';

test.describe('Classifieds Flow', () => {
  test('authenticated user can create a classified ad', async ({
    authenticatedPage: page,
  }) => {
    const classifiedsPage = new ClassifiedsPage(page);
    await classifiedsPage.gotoCreate();

    await classifiedsPage.fillClassifiedForm({
      title: 'Vintage Bicycle for Sale',
      description:
        'Beautiful vintage bicycle in excellent condition. Perfect for riding around Tiergarten.',
      price: '150',
      category: 'For Sale',
      imagePath: path.join(__dirname, '../fixtures/test-image.jpg'),
    });

    await classifiedsPage.submit();

    // Should redirect to the new classified page
    await expect(page).toHaveURL(/\/classifieds\/.+/);
    await expect(
      page.getByRole('heading', { name: 'Vintage Bicycle for Sale' }),
    ).toBeVisible();
    await expect(page.getByText('150')).toBeVisible();
  });

  test('classified form validates required fields', async ({
    authenticatedPage: page,
  }) => {
    const classifiedsPage = new ClassifiedsPage(page);
    await classifiedsPage.gotoCreate();

    // Submit without filling anything
    await classifiedsPage.submit();

    // Should show validation errors
    await expect(page.getByText(/title.*required/i)).toBeVisible();
    await expect(page.getByText(/description.*required/i)).toBeVisible();
    await expect(page.getByText(/category.*required/i)).toBeVisible();
  });

  test('unauthenticated user is redirected to login when creating classified', async ({
    page,
  }) => {
    await page.goto('/classifieds/create');

    await expect(page).toHaveURL(/login/);
  });

  test('user can browse classifieds', async ({ page }) => {
    await page.goto('/classifieds');

    const classifiedCards = page.getByTestId('classified-card');
    await expect(classifiedCards.first()).toBeVisible();
  });

  test('user can filter classifieds by category', async ({ page }) => {
    await page.goto('/classifieds');

    await page.getByTestId('classified-category-filter').getByText('Housing').click();

    await expect(page).toHaveURL(/category=housing/i);
  });

  test('user can view their own classifieds in dashboard', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/dashboard/classifieds');

    await expect(page.getByRole('heading', { name: /my classifieds/i })).toBeVisible();
  });
});
```

### Checkout Flow

```typescript
// apps/web/e2e/flows/checkout.spec.ts
import { test, expect } from '../fixtures/auth.fixture';

test.describe('Checkout Flow', () => {
  test('user can upgrade a classified to premium', async ({
    authenticatedPage: page,
  }) => {
    // Navigate to an existing classified in the dashboard
    await page.goto('/dashboard/classifieds');
    await page.getByTestId('classified-card').first().click();

    // Click upgrade to premium
    await page.getByRole('button', { name: /upgrade|premium/i }).click();

    // Should show pricing options
    await expect(page.getByTestId('pricing-plans')).toBeVisible();

    // Select a plan
    await page.getByTestId('plan-premium-30').click();

    // Should redirect to Stripe checkout (in test mode)
    // In E2E we verify the redirect happens; we don't complete Stripe's flow
    await page.waitForURL(/checkout\.stripe\.com|\/checkout/);
  });

  test('user can purchase event tickets', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/events');
    await page.getByTestId('event-card').first().click();

    // Select ticket quantity
    await page.getByLabel(/quantity|tickets/i).fill('2');
    await page.getByRole('button', { name: /buy tickets|purchase/i }).click();

    // Should show order summary
    await expect(page.getByTestId('order-summary')).toBeVisible();

    // Proceed to payment
    await page.getByRole('button', { name: /proceed.*payment|checkout/i }).click();

    // Should redirect to payment page
    await page.waitForURL(/checkout|payment/);
  });
});
```

---

## 3. Flutter Integration Tests

### Setup

```yaml
# apps/mobile/pubspec.yaml (dev_dependencies)
dev_dependencies:
  integration_test:
    sdk: flutter
  flutter_test:
    sdk: flutter
```

### Test Structure

```
apps/mobile/
  integration_test/
    app_test.dart               # Main integration test entry
    robots/
      auth_robot.dart           # Auth flow automation
      articles_robot.dart       # Articles flow automation
      events_robot.dart         # Events flow automation
      classifieds_robot.dart    # Classifieds flow automation
    helpers/
      test_helpers.dart         # Shared utilities
```

### Flutter Integration Test Example

```dart
// apps/mobile/integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:iloveberlin/main.dart' as app;
import 'robots/auth_robot.dart';
import 'robots/articles_robot.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow', () {
    testWidgets('user can log in and see the home screen', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      final authRobot = AuthRobot(tester);

      // Navigate to login
      await authRobot.tapLoginButton();
      await tester.pumpAndSettle();

      // Enter credentials
      await authRobot.enterEmail('user@test.iloveberlin.biz');
      await authRobot.enterPassword('UserPass123!');
      await authRobot.submitLogin();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify home screen
      authRobot.expectHomeScreen();
    });

    testWidgets('shows error on invalid credentials', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      final authRobot = AuthRobot(tester);

      await authRobot.tapLoginButton();
      await tester.pumpAndSettle();

      await authRobot.enterEmail('user@test.iloveberlin.biz');
      await authRobot.enterPassword('WrongPassword!');
      await authRobot.submitLogin();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      authRobot.expectErrorMessage();
    });
  });

  group('Articles Browsing', () => {
    testWidgets('user can browse and read articles', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      final articlesRobot = ArticlesRobot(tester);

      // Navigate to articles tab
      await articlesRobot.navigateToArticles();
      await tester.pumpAndSettle();

      // Verify articles are displayed
      articlesRobot.expectArticlesVisible();

      // Tap the first article
      await articlesRobot.tapFirstArticle();
      await tester.pumpAndSettle();

      // Verify article detail is shown
      articlesRobot.expectArticleDetailVisible();
    });
  });
}
```

### Robot Pattern

```dart
// apps/mobile/integration_test/robots/auth_robot.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class AuthRobot {
  final WidgetTester tester;

  AuthRobot(this.tester);

  Future<void> tapLoginButton() async {
    final loginButton = find.byKey(const Key('login-button'));
    await tester.tap(loginButton);
  }

  Future<void> enterEmail(String email) async {
    final emailField = find.byKey(const Key('email-input'));
    await tester.enterText(emailField, email);
  }

  Future<void> enterPassword(String password) async {
    final passwordField = find.byKey(const Key('password-input'));
    await tester.enterText(passwordField, password);
  }

  Future<void> submitLogin() async {
    final submitButton = find.byKey(const Key('submit-login'));
    await tester.tap(submitButton);
  }

  void expectHomeScreen() {
    expect(find.byKey(const Key('home-screen')), findsOneWidget);
  }

  void expectErrorMessage() {
    expect(find.byType(SnackBar), findsOneWidget);
  }

  Future<void> logout() async {
    final profileTab = find.byKey(const Key('profile-tab'));
    await tester.tap(profileTab);
    await tester.pumpAndSettle();

    final logoutButton = find.byKey(const Key('logout-button'));
    await tester.tap(logoutButton);
    await tester.pumpAndSettle();
  }
}
```

```dart
// apps/mobile/integration_test/robots/articles_robot.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class ArticlesRobot {
  final WidgetTester tester;

  ArticlesRobot(this.tester);

  Future<void> navigateToArticles() async {
    final articlesTab = find.byKey(const Key('articles-tab'));
    await tester.tap(articlesTab);
  }

  void expectArticlesVisible() {
    expect(find.byKey(const Key('articles-list')), findsOneWidget);
    expect(find.byType(ListTile), findsWidgets);
  }

  Future<void> tapFirstArticle() async {
    final firstArticle = find.byType(ListTile).first;
    await tester.tap(firstArticle);
  }

  void expectArticleDetailVisible() {
    expect(find.byKey(const Key('article-detail')), findsOneWidget);
  }

  Future<void> scrollToBottom() async {
    await tester.drag(
      find.byKey(const Key('articles-list')),
      const Offset(0, -500),
    );
    await tester.pumpAndSettle();
  }
}
```

---

## 4. Test Environment Setup

### Local E2E Environment

```bash
# Start all services for E2E testing
docker compose -f docker-compose.e2e.yml up -d

# docker-compose.e2e.yml provides:
#   - PostgreSQL (seeded with test data)
#   - Redis
#   - Meilisearch
#   - NestJS API (port 3001)
#   - Next.js Web (port 3000)
```

```yaml
# docker-compose.e2e.yml
version: '3.8'

services:
  postgres-e2e:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: iloveberlin_e2e
      POSTGRES_USER: e2e_user
      POSTGRES_PASSWORD: e2e_password
    ports:
      - '5434:5432'
    tmpfs:
      - /var/lib/postgresql/data  # RAM disk for speed

  redis-e2e:
    image: redis:7-alpine
    ports:
      - '6381:6379'

  meilisearch-e2e:
    image: getmeili/meilisearch:v1.6
    environment:
      MEILI_MASTER_KEY: e2e-master-key
    ports:
      - '7702:7700'

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: development
    environment:
      DATABASE_URL: postgresql://e2e_user:e2e_password@postgres-e2e:5432/iloveberlin_e2e
      REDIS_URL: redis://redis-e2e:6379
      MEILISEARCH_HOST: http://meilisearch-e2e:7700
      MEILISEARCH_API_KEY: e2e-master-key
      NODE_ENV: test
      ENABLE_TEST_ENDPOINTS: 'true'
    ports:
      - '3001:3001'
    depends_on:
      postgres-e2e:
        condition: service_healthy
      redis-e2e:
        condition: service_started

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      target: development
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
      NODE_ENV: test
    ports:
      - '3000:3000'
    depends_on:
      - api
```

### CI Configuration for E2E

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

jobs:
  e2e-web:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start E2E environment
        run: docker compose -f docker-compose.e2e.yml up -d --wait

      - name: Wait for services
        run: |
          npx wait-on http://localhost:3000 --timeout 120000
          npx wait-on http://localhost:3001/api/health --timeout 120000

      - name: Run Playwright tests
        run: npx playwright test --project=chromium
        working-directory: apps/web
        env:
          E2E_BASE_URL: http://localhost:3000
          E2E_API_URL: http://localhost:3001
          E2E_TEST_SECRET: e2e-test-secret

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
          retention-days: 7

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-traces
          path: apps/web/test-results/
          retention-days: 7

      - name: Tear down E2E environment
        if: always()
        run: docker compose -f docker-compose.e2e.yml down -v

  e2e-mobile:
    runs-on: macos-latest
    timeout-minutes: 45

    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'

      - name: Start API services
        run: docker compose -f docker-compose.e2e.yml up -d postgres-e2e redis-e2e api

      - name: Boot iOS Simulator
        run: |
          UDID=$(xcrun simctl list devices | grep "iPhone 15" | head -1 | grep -oE '[0-9A-F-]{36}')
          xcrun simctl boot "$UDID"

      - name: Run Flutter integration tests
        working-directory: apps/mobile
        run: flutter test integration_test --device-id=iPhone
        env:
          API_URL: http://localhost:3001

      - name: Tear down
        if: always()
        run: docker compose -f docker-compose.e2e.yml down -v
```

---

## 5. Running E2E Tests

### Commands

```bash
# Playwright (Web)
cd apps/web
npx playwright test                          # All browsers
npx playwright test --project=chromium       # Chromium only
npx playwright test --project=mobile-chrome  # Mobile Chrome
npx playwright test flows/auth.spec.ts       # Specific test file
npx playwright test --ui                     # Interactive UI mode
npx playwright test --debug                  # Step-through debugger
npx playwright show-report                   # View HTML report

# Flutter (Mobile)
cd apps/mobile
flutter test integration_test                        # All integration tests
flutter test integration_test/app_test.dart           # Specific file
flutter test integration_test --device-id=<device>    # Specific device
```

### Debugging Failures

1. **Playwright Trace Viewer**: When a test fails on CI, download the trace artifact and open it:
   ```bash
   npx playwright show-trace trace.zip
   ```

2. **Screenshots**: Failed tests automatically capture a screenshot. Check `test-results/` directory.

3. **Video**: On retries, Playwright records video. Found in `test-results/`.

4. **Headed mode** for local debugging:
   ```bash
   npx playwright test --headed --project=chromium flows/auth.spec.ts
   ```

---

## 6. Best Practices

1. **Test user-visible behavior.** Click buttons by their accessible name, not by CSS selectors or test IDs. Use `getByRole`, `getByLabel`, `getByText` first. Fall back to `getByTestId` only when no semantic selector works.

2. **Keep E2E tests focused.** Each test should cover one complete user journey. Do not combine unrelated flows in a single test.

3. **Avoid sleeping.** Use `waitForURL`, `waitForResponse`, `waitForSelector` or Playwright's auto-waiting instead of hardcoded waits.

4. **Use unique test data.** Include timestamps or UUIDs in test data to prevent collisions during parallel runs.

5. **Clean up after tests.** Use global teardown to remove E2E test data. Never leave test artifacts in shared environments.

6. **Run on multiple browsers in CI.** At minimum, test on Chromium and WebKit. Add Firefox and mobile viewports for cross-browser confidence.

7. **Keep the test suite under 15 minutes.** If it gets longer, identify tests that can be moved to integration-level testing or parallelize more aggressively.
