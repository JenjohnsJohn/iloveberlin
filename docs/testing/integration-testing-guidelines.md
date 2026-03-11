# ILoveBerlin - Integration Testing Guidelines

## Overview

Integration tests validate that multiple components work together correctly. They cross boundaries that unit tests cannot: HTTP endpoints, database queries, middleware chains, and interactions with external services. Integration tests make up approximately 20% of our test suite.

---

## 1. NestJS Endpoint Testing (Supertest)

### Setup

Integration tests for the NestJS API use Supertest to send real HTTP requests against a running NestJS application instance with a test database.

```typescript
// apps/api/test/setup/integration-test.setup.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { TestDatabaseSeeder } from './test-database.seeder';

export async function createTestApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
  seeder: TestDatabaseSeeder;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('STRIPE_CLIENT')
    .useValue(createMockStripeClient())
    .overrideProvider('BREVO_CLIENT')
    .useValue(createMockBrevoClient())
    .overrideProvider('R2_CLIENT')
    .useValue(createMockR2Client())
    .compile();

  const app = moduleFixture.createNestApplication();

  // Apply the same pipes, guards, and interceptors as production
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api');

  await app.init();

  const dataSource = moduleFixture.get(DataSource);
  const seeder = new TestDatabaseSeeder(dataSource);

  return { app, dataSource, seeder };
}
```

### File Naming and Location

Integration tests live in `apps/api/test/`:

```
apps/api/
  test/
    setup/
      integration-test.setup.ts
      test-database.seeder.ts
      mock-stripe.ts
      mock-brevo.ts
      mock-r2.ts
    articles/
      articles.e2e-spec.ts
    auth/
      auth.e2e-spec.ts
    classifieds/
      classifieds.e2e-spec.ts
    events/
      events.e2e-spec.ts
    payments/
      payments.e2e-spec.ts
```

### Database Setup and Teardown

Each test suite starts with a clean database and seeds baseline data:

```typescript
// apps/api/test/setup/test-database.seeder.ts
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export interface SeededData {
  adminUser: { id: string; email: string; token: string };
  editorUser: { id: string; email: string; token: string };
  regularUser: { id: string; email: string; token: string };
  categories: Array<{ id: string; name: string; slug: string }>;
  sampleArticles: Array<{ id: string; title: string; slug: string }>;
}

export class TestDatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<SeededData> {
    await this.clean();
    await this.runMigrations();

    const adminUser = await this.createUser({
      email: 'admin@test.iloveberlin.biz',
      role: 'admin',
      password: 'AdminPass123!',
    });

    const editorUser = await this.createUser({
      email: 'editor@test.iloveberlin.biz',
      role: 'editor',
      password: 'EditorPass123!',
    });

    const regularUser = await this.createUser({
      email: 'user@test.iloveberlin.biz',
      role: 'user',
      password: 'UserPass123!',
    });

    const categories = await this.seedCategories();
    const sampleArticles = await this.seedArticles(editorUser.id, categories);

    return { adminUser, editorUser, regularUser, categories, sampleArticles };
  }

  async clean(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.query(
        `TRUNCATE TABLE "${entity.tableName}" CASCADE`,
      );
    }
  }

  private async runMigrations(): Promise<void> {
    await this.dataSource.runMigrations();
  }

  private async createUser(data: {
    email: string;
    role: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const result = await this.dataSource.query(
      `INSERT INTO users (email, password_hash, role, is_verified, first_name, last_name)
       VALUES ($1, $2, $3, true, 'Test', 'User')
       RETURNING id, email`,
      [data.email, hashedPassword, data.role],
    );
    return {
      id: result[0].id,
      email: result[0].email,
      token: '', // Will be set after login
    };
  }

  private async seedCategories() {
    const categories = [
      { name: 'Lifestyle', slug: 'lifestyle' },
      { name: 'Culture', slug: 'culture' },
      { name: 'Food & Drink', slug: 'food-drink' },
      { name: 'Events', slug: 'events' },
    ];

    const result = [];
    for (const cat of categories) {
      const inserted = await this.dataSource.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug`,
        [cat.name, cat.slug],
      );
      result.push(inserted[0]);
    }
    return result;
  }

  private async seedArticles(authorId: string, categories: any[]) {
    // Seed a few sample articles for testing
    const articles = [
      {
        title: 'Seeded Article One',
        slug: 'seeded-article-one',
        status: 'published',
        categoryId: categories[0].id,
      },
      {
        title: 'Seeded Article Two',
        slug: 'seeded-article-two',
        status: 'draft',
        categoryId: categories[1].id,
      },
    ];

    const result = [];
    for (const article of articles) {
      const inserted = await this.dataSource.query(
        `INSERT INTO articles (title, slug, status, category_id, author_id, content)
         VALUES ($1, $2, $3, $4, $5, 'Test content')
         RETURNING id, title, slug`,
        [article.title, article.slug, article.status, article.categoryId, authorId],
      );
      result.push(inserted[0]);
    }
    return result;
  }
}
```

### Full Endpoint Test Example

```typescript
// apps/api/test/articles/articles.e2e-spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../setup/integration-test.setup';
import { SeededData, TestDatabaseSeeder } from '../setup/test-database.seeder';
import { DataSource } from 'typeorm';

describe('Articles API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestDatabaseSeeder;
  let seededData: SeededData;
  let editorToken: string;
  let userToken: string;

  beforeAll(async () => {
    ({ app, dataSource, seeder } = await createTestApp());
    seededData = await seeder.seed();

    // Get auth tokens
    const editorLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'editor@test.iloveberlin.biz', password: 'EditorPass123!' });
    editorToken = editorLogin.body.accessToken;

    const userLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'user@test.iloveberlin.biz', password: 'UserPass123!' });
    userToken = userLogin.body.accessToken;
  });

  afterAll(async () => {
    await seeder.clean();
    await app.close();
  });

  // ------- GET /api/articles -------

  describe('GET /api/articles', () => {
    it('should return paginated published articles', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/articles')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Should only return published articles
      response.body.data.forEach((article: any) => {
        expect(article.status).toBe('published');
      });
    });

    it('should filter articles by category', async () => {
      const categorySlug = 'lifestyle';

      const response = await request(app.getHttpServer())
        .get('/api/articles')
        .query({ category: categorySlug })
        .expect(200);

      response.body.data.forEach((article: any) => {
        expect(article.category.slug).toBe(categorySlug);
      });
    });

    it('should return 400 for invalid pagination parameters', async () => {
      await request(app.getHttpServer())
        .get('/api/articles')
        .query({ page: -1, limit: 0 })
        .expect(400);
    });
  });

  // ------- GET /api/articles/:slug -------

  describe('GET /api/articles/:slug', () => {
    it('should return a single article by slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/articles/seeded-article-one')
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Seeded Article One');
      expect(response.body).toHaveProperty('slug', 'seeded-article-one');
      expect(response.body).toHaveProperty('author');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('content');
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/api/articles/does-not-exist')
        .expect(404);
    });

    it('should not return draft articles to unauthenticated users', async () => {
      await request(app.getHttpServer())
        .get('/api/articles/seeded-article-two')
        .expect(404);
    });
  });

  // ------- POST /api/articles -------

  describe('POST /api/articles', () => {
    it('should create an article when authenticated as editor', async () => {
      const createDto = {
        title: 'Integration Test Article',
        content: 'This article was created during integration testing.',
        categoryId: seededData.categories[0].id,
        tags: ['test', 'integration'],
      };

      const response = await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', createDto.title);
      expect(response.body).toHaveProperty('status', 'draft');
      expect(response.body).toHaveProperty('slug');

      // Verify it was persisted
      const verification = await request(app.getHttpServer())
        .get(`/api/articles/${response.body.slug}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(verification.body.title).toBe(createDto.title);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/articles')
        .send({ title: 'Unauthorized', content: 'Test' })
        .expect(401);
    });

    it('should return 403 when authenticated as regular user', async () => {
      await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Forbidden Article',
          content: 'Test',
          categoryId: seededData.categories[0].id,
        })
        .expect(403);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: '', // Empty title
          content: '', // Empty content
        })
        .expect(400);

      expect(response.body.message).toContain('title');
    });

    it('should strip unknown fields from request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Valid Article',
          content: 'Valid content',
          categoryId: seededData.categories[0].id,
          maliciousField: 'should be stripped',
          isPublished: true, // should not be settable directly
        })
        .expect(201);

      expect(response.body).not.toHaveProperty('maliciousField');
      expect(response.body.status).toBe('draft');
    });
  });

  // ------- PATCH /api/articles/:id -------

  describe('PATCH /api/articles/:id', () => {
    it('should update an article', async () => {
      const articleId = seededData.sampleArticles[1].id;

      const response = await request(app.getHttpServer())
        .patch(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent article', async () => {
      await request(app.getHttpServer())
        .patch('/api/articles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  // ------- POST /api/articles/:id/publish -------

  describe('POST /api/articles/:id/publish', () => {
    it('should publish a draft article', async () => {
      // Create a new draft to publish
      const created = await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Article to Publish',
          content: 'Will be published',
          categoryId: seededData.categories[0].id,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/api/articles/${created.body.id}/publish`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(response.body.status).toBe('published');
      expect(response.body.publishedAt).toBeDefined();
    });
  });

  // ------- DELETE /api/articles/:id -------

  describe('DELETE /api/articles/:id', () => {
    it('should soft-delete an article', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Article to Delete',
          content: 'Will be deleted',
          categoryId: seededData.categories[0].id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/articles/${created.body.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      // Verify it's no longer accessible
      await request(app.getHttpServer())
        .get(`/api/articles/${created.body.slug}`)
        .expect(404);
    });
  });
});
```

---

## 2. API Contract Testing

API contract testing ensures that the API response structure matches the documented schema. This prevents breaking changes from reaching consumers (the Next.js frontend, the Flutter mobile app).

### Schema Validation with Zod

```typescript
// apps/api/test/contracts/article.contract.ts
import { z } from 'zod';

export const ArticleResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable(),
  content: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  coverImage: z.string().url().nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  author: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
  tags: z.array(z.string()),
});

export const PaginatedArticlesResponseSchema = z.object({
  data: z.array(ArticleResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const ErrorResponseSchema = z.object({
  statusCode: z.number().int(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});
```

### Contract Test Example

```typescript
// apps/api/test/contracts/articles.contract.spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../setup/integration-test.setup';
import {
  ArticleResponseSchema,
  PaginatedArticlesResponseSchema,
  ErrorResponseSchema,
} from './article.contract';

describe('Articles API Contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await testApp.seeder.seed();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/articles', () => {
    it('response should match PaginatedArticlesResponse schema', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/articles')
        .expect(200);

      const result = PaginatedArticlesResponseSchema.safeParse(response.body);

      if (!result.success) {
        console.error('Schema validation errors:', result.error.format());
      }

      expect(result.success).toBe(true);
    });
  });

  describe('GET /api/articles/:slug', () => {
    it('response should match ArticleResponse schema', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/articles/seeded-article-one')
        .expect(200);

      const result = ArticleResponseSchema.safeParse(response.body);

      if (!result.success) {
        console.error('Schema validation errors:', result.error.format());
      }

      expect(result.success).toBe(true);
    });
  });

  describe('Error responses', () => {
    it('404 should match ErrorResponse schema', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/articles/nonexistent')
        .expect(404);

      const result = ErrorResponseSchema.safeParse(response.body);
      expect(result.success).toBe(true);
    });

    it('400 should match ErrorResponse schema', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/articles')
        .query({ page: -1 })
        .expect(400);

      const result = ErrorResponseSchema.safeParse(response.body);
      expect(result.success).toBe(true);
    });
  });
});
```

---

## 3. Database Integration Tests

Database integration tests validate that TypeORM queries, custom repositories, and database constraints work as expected against a real PostgreSQL instance.

### Setup

```typescript
// apps/api/test/setup/test-database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5433', 10),
  username: process.env.TEST_DB_USER || 'test_user',
  password: process.env.TEST_DB_PASSWORD || 'test_password',
  database: process.env.TEST_DB_NAME || 'iloveberlin_test',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,         // Never auto-sync; use migrations
  migrationsRun: true,        // Run migrations before tests
  migrations: ['src/migrations/*.ts'],
  logging: false,
};
```

### Repository Tests

```typescript
// apps/api/test/database/articles.repository.spec.ts
import { DataSource, Repository } from 'typeorm';
import { Article } from '../../src/articles/entities/article.entity';
import { User } from '../../src/users/entities/user.entity';
import { Category } from '../../src/categories/entities/category.entity';
import { createTestDataSource } from '../setup/test-datasource';

describe('Articles Repository (Database)', () => {
  let dataSource: DataSource;
  let articleRepo: Repository<Article>;
  let userRepo: Repository<User>;
  let categoryRepo: Repository<Category>;
  let testUser: User;
  let testCategory: Category;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    articleRepo = dataSource.getRepository(Article);
    userRepo = dataSource.getRepository(User);
    categoryRepo = dataSource.getRepository(Category);

    // Seed required foreign key references
    testUser = await userRepo.save(
      userRepo.create({
        email: 'repo-test@test.com',
        passwordHash: 'hashed',
        firstName: 'Repo',
        lastName: 'Test',
        role: 'editor',
        isVerified: true,
      }),
    );

    testCategory = await categoryRepo.save(
      categoryRepo.create({ name: 'Test Category', slug: 'test-category' }),
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await articleRepo.query('DELETE FROM articles');
  });

  describe('unique slug constraint', () => {
    it('should enforce unique slugs', async () => {
      await articleRepo.save(
        articleRepo.create({
          title: 'First Article',
          slug: 'unique-slug',
          content: 'Content',
          author: testUser,
          category: testCategory,
          status: 'draft',
        }),
      );

      const duplicate = articleRepo.create({
        title: 'Second Article',
        slug: 'unique-slug', // Same slug
        content: 'Content',
        author: testUser,
        category: testCategory,
        status: 'draft',
      });

      await expect(articleRepo.save(duplicate)).rejects.toThrow(
        /duplicate key value violates unique constraint/,
      );
    });
  });

  describe('full-text search', () => {
    it('should find articles matching search query', async () => {
      await articleRepo.save([
        articleRepo.create({
          title: 'Berlin Coffee Shops',
          slug: 'berlin-coffee-shops',
          content: 'The best coffee in Kreuzberg and Neukölln',
          author: testUser,
          category: testCategory,
          status: 'published',
        }),
        articleRepo.create({
          title: 'Hamburg Fish Market',
          slug: 'hamburg-fish-market',
          content: 'A guide to the famous fish market',
          author: testUser,
          category: testCategory,
          status: 'published',
        }),
      ]);

      const results = await articleRepo
        .createQueryBuilder('article')
        .where(
          `to_tsvector('english', article.title || ' ' || article.content)
           @@ plainto_tsquery('english', :query)`,
          { query: 'coffee berlin' },
        )
        .getMany();

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('berlin-coffee-shops');
    });
  });

  describe('soft delete', () => {
    it('should not return soft-deleted articles in standard queries', async () => {
      const article = await articleRepo.save(
        articleRepo.create({
          title: 'Soft Delete Test',
          slug: 'soft-delete-test',
          content: 'Content',
          author: testUser,
          category: testCategory,
          status: 'published',
        }),
      );

      await articleRepo.softDelete(article.id);

      const found = await articleRepo.findOne({
        where: { id: article.id },
      });
      expect(found).toBeNull();

      // But recoverable with withDeleted
      const foundWithDeleted = await articleRepo.findOne({
        where: { id: article.id },
        withDeleted: true,
      });
      expect(foundWithDeleted).toBeDefined();
      expect(foundWithDeleted?.deletedAt).toBeDefined();
    });
  });

  describe('cascading relations', () => {
    it('should delete article tags when article is deleted', async () => {
      const article = await articleRepo.save(
        articleRepo.create({
          title: 'Cascade Test',
          slug: 'cascade-test',
          content: 'Content',
          author: testUser,
          category: testCategory,
          status: 'draft',
          tags: ['tag1', 'tag2'],
        }),
      );

      await articleRepo.remove(article);

      const tagCount = await dataSource.query(
        `SELECT COUNT(*) FROM article_tags WHERE article_id = $1`,
        [article.id],
      );
      expect(parseInt(tagCount[0].count)).toBe(0);
    });
  });

  describe('pagination', () => {
    it('should return correct page of results', async () => {
      // Create 15 articles
      const articles = Array.from({ length: 15 }, (_, i) =>
        articleRepo.create({
          title: `Article ${i + 1}`,
          slug: `article-${i + 1}`,
          content: `Content ${i + 1}`,
          author: testUser,
          category: testCategory,
          status: 'published',
        }),
      );
      await articleRepo.save(articles);

      const [page1, total] = await articleRepo.findAndCount({
        where: { status: 'published' },
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });

      expect(page1).toHaveLength(10);
      expect(total).toBe(15);

      const [page2] = await articleRepo.findAndCount({
        where: { status: 'published' },
        take: 10,
        skip: 10,
        order: { createdAt: 'DESC' },
      });

      expect(page2).toHaveLength(5);
    });
  });
});
```

---

## 4. Third-Party Service Mocking

External services (Stripe, Brevo, Cloudflare R2) are mocked during integration tests to ensure deterministic results and avoid hitting real APIs.

### Stripe Mock

```typescript
// apps/api/test/setup/mock-stripe.ts
export function createMockStripeClient() {
  return {
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test_123',
        email: 'test@test.com',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cus_test_123',
        email: 'test@test.com',
      }),
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        status: 'requires_payment_method',
        amount: 1999,
        currency: 'eur',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 1999,
        currency: 'eur',
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test_session',
          payment_status: 'unpaid',
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn().mockImplementation(
        (body: string, signature: string, secret: string) => {
          return JSON.parse(body);
        },
      ),
    },
  };
}
```

### Brevo (Email) Mock

```typescript
// apps/api/test/setup/mock-brevo.ts
export function createMockBrevoClient() {
  const sentEmails: Array<{
    to: string;
    template: string;
    params: Record<string, any>;
  }> = [];

  return {
    sendTransactionalEmail: jest.fn().mockImplementation(async (options) => {
      sentEmails.push({
        to: options.to[0].email,
        template: options.templateId,
        params: options.params,
      });
      return { messageId: `mock-${Date.now()}` };
    }),
    getSentEmails: () => sentEmails,
    clearSentEmails: () => {
      sentEmails.length = 0;
    },
  };
}
```

### Cloudflare R2 Mock

```typescript
// apps/api/test/setup/mock-r2.ts
import { Readable } from 'stream';

export function createMockR2Client() {
  const storage = new Map<string, Buffer>();

  return {
    send: jest.fn().mockImplementation(async (command) => {
      const commandName = command.constructor.name;

      if (commandName === 'PutObjectCommand') {
        storage.set(command.input.Key, command.input.Body);
        return {
          ETag: '"mock-etag-123"',
          $metadata: { httpStatusCode: 200 },
        };
      }

      if (commandName === 'GetObjectCommand') {
        const data = storage.get(command.input.Key);
        if (!data) {
          throw new Error('NoSuchKey');
        }
        return {
          Body: Readable.from(data),
          ContentType: 'image/jpeg',
          $metadata: { httpStatusCode: 200 },
        };
      }

      if (commandName === 'DeleteObjectCommand') {
        storage.delete(command.input.Key);
        return { $metadata: { httpStatusCode: 204 } };
      }

      if (commandName === 'HeadObjectCommand') {
        if (!storage.has(command.input.Key)) {
          throw new Error('NotFound');
        }
        return {
          ContentLength: storage.get(command.input.Key)!.length,
          ContentType: 'image/jpeg',
          $metadata: { httpStatusCode: 200 },
        };
      }
    }),
    getStorage: () => storage,
    clearStorage: () => storage.clear(),
  };
}
```

### Stripe Webhook Integration Test

```typescript
// apps/api/test/payments/stripe-webhook.e2e-spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../setup/integration-test.setup';

describe('Stripe Webhook (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await testApp.seeder.seed();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle checkout.session.completed event', async () => {
    const webhookPayload = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_status: 'paid',
          metadata: {
            classifiedId: 'classified-uuid-1',
            userId: 'user-uuid-1',
            plan: 'premium',
          },
          amount_total: 1999,
          currency: 'eur',
        },
      },
    };

    await request(app.getHttpServer())
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send(webhookPayload)
      .expect(200);

    // Verify the classified was upgraded to premium
    // (check database state after webhook processing)
  });

  it('should handle payment_intent.payment_failed event', async () => {
    const webhookPayload = {
      id: 'evt_test_456',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_456',
          status: 'failed',
          last_payment_error: {
            message: 'Your card was declined.',
          },
          metadata: {
            classifiedId: 'classified-uuid-2',
            userId: 'user-uuid-1',
          },
        },
      },
    };

    await request(app.getHttpServer())
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send(webhookPayload)
      .expect(200);
  });

  it('should return 400 for unrecognized event types', async () => {
    const webhookPayload = {
      id: 'evt_test_789',
      type: 'unknown.event.type',
      data: { object: {} },
    };

    await request(app.getHttpServer())
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send(webhookPayload)
      .expect(400);
  });
});
```

---

## 5. Auth Flow Integration Test

```typescript
// apps/api/test/auth/auth.e2e-spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../setup/integration-test.setup';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let brevoClient: any;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    brevoClient = testApp.brevoClient;
    await testApp.seeder.seed();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and send verification email', async () => {
      brevoClient.clearSentEmails();

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'SecurePass123!',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@test.com');
      expect(response.body.user).not.toHaveProperty('passwordHash');

      // Verify email was sent
      const sentEmails = brevoClient.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe('newuser@test.com');
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'SecurePass123!',
          firstName: 'First',
          lastName: 'User',
        })
        .expect(201);

      // Second registration with same email
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'SecurePass123!',
          firstName: 'Second',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should reject weak passwords', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'weakpass@test.com',
          password: '123', // Too weak
          firstName: 'Weak',
          lastName: 'Pass',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return access token and refresh token on valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'editor@test.iloveberlin.biz',
          password: 'EditorPass123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('editor@test.iloveberlin.biz');
    });

    it('should return 401 on invalid password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'editor@test.iloveberlin.biz',
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nobody@test.com',
          password: 'SomePass123!',
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should issue new tokens with a valid refresh token', async () => {
      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'editor@test.iloveberlin.biz',
          password: 'EditorPass123!',
        })
        .expect(200);

      // Use refresh token
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body.accessToken).not.toBe(
        loginResponse.body.accessToken,
      );
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the current user profile', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'editor@test.iloveberlin.biz',
          password: 'EditorPass123!',
        });

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(response.body.email).toBe('editor@test.iloveberlin.biz');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 without auth header', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('should return 401 with expired token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxfQ.invalid';

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
```

---

## 6. Running Integration Tests

### Commands

```bash
# Start test database
docker compose -f docker-compose.test.yml up -d postgres

# Run all integration tests
cd apps/api
npm run test:e2e

# Run specific test file
npm run test:e2e -- --testPathPattern=articles

# Run with verbose output
npm run test:e2e -- --verbose

# Run with coverage
npm run test:e2e -- --coverage
```

### CI Configuration

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  pull_request:
    branches: [develop, main]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: iloveberlin_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
        working-directory: apps/api

      - run: npm run test:e2e
        working-directory: apps/api
        env:
          TEST_DB_HOST: localhost
          TEST_DB_PORT: 5433
          TEST_DB_USER: test_user
          TEST_DB_PASSWORD: test_password
          TEST_DB_NAME: iloveberlin_test
          JWT_SECRET: test-jwt-secret
          JWT_REFRESH_SECRET: test-jwt-refresh-secret
```

---

## 7. Best Practices

1. **Isolate test suites.** Each test file should set up and tear down its own data. Do not rely on test execution order.

2. **Use transactions for speed.** Where possible, wrap each test in a database transaction and roll back after. This is faster than truncating tables.

3. **Test the full middleware chain.** Integration tests should exercise authentication guards, validation pipes, interceptors, and error filters -- exactly as they run in production.

4. **Assert both response body and status code.** A 200 response with wrong data is just as much a bug as a 500 error.

5. **Test error responses thoroughly.** Validate that error messages are user-friendly and do not leak implementation details (no stack traces, no SQL errors).

6. **Keep mocks minimal and focused.** Mock only what you must (external services). Let the real database, real validation, and real middleware run.

7. **Version your contract schemas.** When the API response shape changes, update the contract schemas first, then update the implementation. This forces intentional breaking changes.
