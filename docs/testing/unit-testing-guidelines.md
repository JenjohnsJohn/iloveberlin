# ILoveBerlin - Unit Testing Guidelines

## Overview

Unit tests form the foundation of our testing pyramid (~70% of all tests). They are fast, isolated, and test individual units of code in complete isolation from external dependencies. Every service method, utility function, component, and state management unit must have corresponding unit tests.

---

## 1. NestJS Unit Testing (Jest)

### Setup

The NestJS API uses Jest as its test runner, configured in `apps/api/jest.config.ts`:

```typescript
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
};

export default config;
```

### File Naming and Location

- Test files are co-located with the source files they test.
- Naming convention: `<filename>.spec.ts`

```
src/
  articles/
    articles.service.ts
    articles.service.spec.ts
    articles.controller.ts
    articles.controller.spec.ts
  classifieds/
    classifieds.service.ts
    classifieds.service.spec.ts
```

### Testing Services: Mock Repositories

Services contain business logic and depend on repositories. Always mock repository dependencies.

```typescript
// src/articles/articles.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { createMockUser } from '@test/factories/user.factory';
import { createMockArticle } from '@test/factories/article.factory';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleRepository: jest.Mocked<Repository<Article>>;

  const mockArticleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articleRepository = module.get(getRepositoryToken(Article));

    // Reset all mocks between tests
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new article', async () => {
      const user = createMockUser({ role: 'editor' });
      const createDto: CreateArticleDto = {
        title: 'Best Coffee Shops in Kreuzberg',
        content: 'Berlin is home to some of the world\'s best coffee...',
        categoryId: 'cat-uuid-1',
        tags: ['coffee', 'kreuzberg', 'food'],
      };

      const expectedArticle = createMockArticle({
        ...createDto,
        authorId: user.id,
        status: 'draft',
      });

      mockArticleRepository.create.mockReturnValue(expectedArticle);
      mockArticleRepository.save.mockResolvedValue(expectedArticle);

      const result = await service.create(createDto, user);

      expect(mockArticleRepository.create).toHaveBeenCalledWith({
        ...createDto,
        authorId: user.id,
        status: 'draft',
      });
      expect(mockArticleRepository.save).toHaveBeenCalledWith(expectedArticle);
      expect(result).toEqual(expectedArticle);
      expect(result.status).toBe('draft');
    });

    it('should throw ForbiddenException if user lacks editor role', async () => {
      const user = createMockUser({ role: 'user' });
      const createDto: CreateArticleDto = {
        title: 'Test Article',
        content: 'Content',
        categoryId: 'cat-uuid-1',
        tags: [],
      };

      await expect(service.create(createDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an article when found', async () => {
      const article = createMockArticle();
      mockArticleRepository.findOne.mockResolvedValue(article);

      const result = await service.findOne(article.id);

      expect(result).toEqual(article);
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { id: article.id },
        relations: ['author', 'category'],
      });
    });

    it('should throw NotFoundException when article does not exist', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('publish', () => {
    it('should change article status from draft to published', async () => {
      const article = createMockArticle({ status: 'draft' });
      mockArticleRepository.findOne.mockResolvedValue(article);
      mockArticleRepository.save.mockResolvedValue({
        ...article,
        status: 'published',
        publishedAt: expect.any(Date),
      });

      const result = await service.publish(article.id);

      expect(result.status).toBe('published');
      expect(result.publishedAt).toBeDefined();
    });

    it('should throw if article is already published', async () => {
      const article = createMockArticle({ status: 'published' });
      mockArticleRepository.findOne.mockResolvedValue(article);

      await expect(service.publish(article.id)).rejects.toThrow(
        'Article is already published',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty tags array', async () => {
      const user = createMockUser({ role: 'editor' });
      const createDto: CreateArticleDto = {
        title: 'No Tags Article',
        content: 'Content without tags',
        categoryId: 'cat-uuid-1',
        tags: [],
      };

      const expectedArticle = createMockArticle({
        ...createDto,
        tags: [],
      });

      mockArticleRepository.create.mockReturnValue(expectedArticle);
      mockArticleRepository.save.mockResolvedValue(expectedArticle);

      const result = await service.create(createDto, user);

      expect(result.tags).toEqual([]);
    });

    it('should trim whitespace from title', async () => {
      const user = createMockUser({ role: 'editor' });
      const createDto: CreateArticleDto = {
        title: '  Spaces Around Title  ',
        content: 'Content',
        categoryId: 'cat-uuid-1',
        tags: [],
      };

      await service.create(createDto, user);

      expect(mockArticleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Spaces Around Title',
        }),
      );
    });
  });
});
```

### Testing Controllers

Controllers handle HTTP concerns (request parsing, response formatting, status codes). Mock the underlying service.

```typescript
// src/articles/articles.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { createMockArticle } from '@test/factories/article.factory';
import { createMockUser } from '@test/factories/user.factory';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: jest.Mocked<ArticlesService>;

  const mockArticlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get(ArticlesService);
    jest.clearAllMocks();
  });

  describe('GET /articles', () => {
    it('should return paginated articles', async () => {
      const articles = [createMockArticle(), createMockArticle()];
      const paginatedResult = {
        data: articles,
        total: 2,
        page: 1,
        limit: 10,
      };

      mockArticlesService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('POST /articles', () => {
    it('should create an article and return it', async () => {
      const user = createMockUser({ role: 'editor' });
      const createDto = {
        title: 'New Article',
        content: 'Content',
        categoryId: 'cat-1',
        tags: ['berlin'],
      };
      const createdArticle = createMockArticle(createDto);

      mockArticlesService.create.mockResolvedValue(createdArticle);

      const result = await controller.create(createDto, { user });

      expect(result).toEqual(createdArticle);
    });
  });
});
```

### Testing Guards and Pipes

```typescript
// src/auth/guards/roles.guard.spec.ts
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockExecutionContext({ role: 'user' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const context = createMockExecutionContext({ role: 'admin' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const context = createMockExecutionContext({ role: 'user' });
    expect(guard.canActivate(context)).toBe(false);
  });
});

function createMockExecutionContext(user: { role: string }): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}
```

---

## 2. Next.js Unit Testing (Jest + React Testing Library)

### Setup

```typescript
// apps/web/jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  testRegex: '.*\\.test\\.tsx?$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
```

```typescript
// apps/web/jest.setup.ts
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));
```

### File Naming and Location

- Test files are co-located with components.
- Naming convention: `<ComponentName>.test.tsx`

```
src/
  components/
    ArticleCard/
      ArticleCard.tsx
      ArticleCard.test.tsx
    EventList/
      EventList.tsx
      EventList.test.tsx
  hooks/
    useAuth.ts
    useAuth.test.ts
```

### Testing Components

```typescript
// src/components/ArticleCard/ArticleCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArticleCard } from './ArticleCard';
import { createMockArticle } from '@test/factories/article.factory';

describe('ArticleCard', () => {
  const defaultArticle = createMockArticle({
    title: 'Best Parks in Berlin',
    excerpt: 'Discover the green spaces of the German capital...',
    author: { firstName: 'Anna', lastName: 'Schmidt' },
    publishedAt: '2026-01-15T10:00:00Z',
    coverImage: '/images/parks.jpg',
    category: { name: 'Lifestyle', slug: 'lifestyle' },
  });

  it('renders the article title', () => {
    render(<ArticleCard article={defaultArticle} />);

    expect(
      screen.getByRole('heading', { name: /best parks in berlin/i }),
    ).toBeInTheDocument();
  });

  it('renders the article excerpt', () => {
    render(<ArticleCard article={defaultArticle} />);

    expect(
      screen.getByText(/discover the green spaces/i),
    ).toBeInTheDocument();
  });

  it('renders the author name', () => {
    render(<ArticleCard article={defaultArticle} />);

    expect(screen.getByText('Anna Schmidt')).toBeInTheDocument();
  });

  it('renders the formatted publication date', () => {
    render(<ArticleCard article={defaultArticle} />);

    expect(screen.getByText('January 15, 2026')).toBeInTheDocument();
  });

  it('renders the cover image with alt text', () => {
    render(<ArticleCard article={defaultArticle} />);

    const image = screen.getByRole('img', { name: /best parks in berlin/i });
    expect(image).toHaveAttribute('src', '/images/parks.jpg');
  });

  it('renders a category badge', () => {
    render(<ArticleCard article={defaultArticle} />);

    expect(screen.getByText('Lifestyle')).toBeInTheDocument();
  });

  it('links to the full article page', () => {
    render(<ArticleCard article={defaultArticle} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      `/articles/${defaultArticle.slug}`,
    );
  });

  it('renders a placeholder when no cover image is provided', () => {
    const articleWithoutImage = createMockArticle({ coverImage: null });
    render(<ArticleCard article={articleWithoutImage} />);

    expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
  });

  it('calls onBookmark when bookmark button is clicked', async () => {
    const onBookmark = jest.fn();
    const user = userEvent.setup();

    render(
      <ArticleCard article={defaultArticle} onBookmark={onBookmark} />,
    );

    await user.click(screen.getByRole('button', { name: /bookmark/i }));

    expect(onBookmark).toHaveBeenCalledWith(defaultArticle.id);
  });
});
```

### Testing Hooks

```typescript
// src/hooks/useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { apiClient } from '@/lib/api-client';

describe('useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should start with no user and loading state', () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should set user after successful login', async () => {
    const mockUser = { id: '1', email: 'user@test.com', firstName: 'Test' };
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { user: mockUser, accessToken: 'token-123' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('user@test.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear user after logout', async () => {
    const mockUser = { id: '1', email: 'user@test.com', firstName: 'Test' };
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { user: mockUser, accessToken: 'token-123' },
    });
    (apiClient.get as jest.Mock).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('user@test.com', 'password123');
    });

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return error message on failed login', async () => {
    (apiClient.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('wrong@test.com', 'wrongpass');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
  });
});
```

### Testing Utility Functions

```typescript
// src/utils/format.test.ts
import {
  formatPrice,
  formatDate,
  truncateText,
  slugify,
} from './format';

describe('formatPrice', () => {
  it('formats a price in EUR', () => {
    expect(formatPrice(1999)).toBe('19,99\u00a0\u20ac');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0,00\u00a0\u20ac');
  });

  it('handles free items', () => {
    expect(formatPrice(0, { showFree: true })).toBe('Free');
  });
});

describe('truncateText', () => {
  it('returns the full text when under the limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates at word boundary and adds ellipsis', () => {
    expect(truncateText('Hello wonderful world', 15)).toBe('Hello...');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });

  it('handles null input', () => {
    expect(truncateText(null as any, 10)).toBe('');
  });
});

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Caf\u00e9 & Bar!')).toBe('cafe-bar');
  });

  it('handles German umlauts', () => {
    expect(slugify('Sch\u00f6ne Gr\u00fc\u00dfe')).toBe('schoene-gruesse');
  });
});
```

---

## 3. Flutter Unit Testing

### Setup

```yaml
# apps/mobile/pubspec.yaml (dev_dependencies)
dev_dependencies:
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.4
  bloc_test: ^9.1.7
  fake_async: ^1.3.2
```

### File Naming and Location

- Test files mirror the `lib/` directory structure under `test/`.
- Naming convention: `<filename>_test.dart`

```
lib/
  features/
    articles/
      bloc/
        articles_bloc.dart
      models/
        article.dart
test/
  features/
    articles/
      bloc/
        articles_bloc_test.dart
      models/
        article_test.dart
```

### Testing BLoC / Riverpod State Management

**BLoC Example:**

```dart
// test/features/articles/bloc/articles_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:iloveberlin/features/articles/bloc/articles_bloc.dart';
import 'package:iloveberlin/features/articles/repositories/articles_repository.dart';
import 'package:iloveberlin/features/articles/models/article.dart';

class MockArticlesRepository extends Mock implements ArticlesRepository {}

void main() {
  late ArticlesBloc bloc;
  late MockArticlesRepository mockRepository;

  setUp(() {
    mockRepository = MockArticlesRepository();
    bloc = ArticlesBloc(repository: mockRepository);
  });

  tearDown(() {
    bloc.close();
  });

  group('ArticlesBloc', () {
    final testArticles = [
      Article(
        id: '1',
        title: 'Berlin Street Art Guide',
        excerpt: 'Explore the murals...',
        publishedAt: DateTime(2026, 1, 10),
      ),
      Article(
        id: '2',
        title: 'Weekend Markets',
        excerpt: 'The best flea markets...',
        publishedAt: DateTime(2026, 1, 12),
      ),
    ];

    test('initial state is ArticlesInitial', () {
      expect(bloc.state, equals(ArticlesInitial()));
    });

    blocTest<ArticlesBloc, ArticlesState>(
      'emits [ArticlesLoading, ArticlesLoaded] when FetchArticles succeeds',
      build: () {
        when(() => mockRepository.getArticles(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
        )).thenAnswer((_) async => testArticles);
        return bloc;
      },
      act: (bloc) => bloc.add(FetchArticles()),
      expect: () => [
        ArticlesLoading(),
        ArticlesLoaded(articles: testArticles, hasMore: false),
      ],
    );

    blocTest<ArticlesBloc, ArticlesState>(
      'emits [ArticlesLoading, ArticlesError] when FetchArticles fails',
      build: () {
        when(() => mockRepository.getArticles(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
        )).thenThrow(Exception('Network error'));
        return bloc;
      },
      act: (bloc) => bloc.add(FetchArticles()),
      expect: () => [
        ArticlesLoading(),
        ArticlesError(message: 'Failed to load articles'),
      ],
    );

    blocTest<ArticlesBloc, ArticlesState>(
      'appends articles on LoadMore when more are available',
      build: () {
        when(() => mockRepository.getArticles(
          page: 2,
          limit: any(named: 'limit'),
        )).thenAnswer((_) async => [testArticles[1]]);
        return bloc;
      },
      seed: () => ArticlesLoaded(articles: [testArticles[0]], hasMore: true),
      act: (bloc) => bloc.add(LoadMoreArticles()),
      expect: () => [
        ArticlesLoaded(articles: testArticles, hasMore: false),
      ],
    );
  });
}
```

**Riverpod Example:**

```dart
// test/features/events/providers/events_provider_test.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:iloveberlin/features/events/providers/events_provider.dart';
import 'package:iloveberlin/features/events/repositories/events_repository.dart';
import 'package:iloveberlin/features/events/models/event.dart';

class MockEventsRepository extends Mock implements EventsRepository {}

void main() {
  late ProviderContainer container;
  late MockEventsRepository mockRepository;

  setUp(() {
    mockRepository = MockEventsRepository();
    container = ProviderContainer(
      overrides: [
        eventsRepositoryProvider.overrideWithValue(mockRepository),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  group('eventsProvider', () {
    test('starts with AsyncLoading', () {
      when(() => mockRepository.getUpcomingEvents())
          .thenAnswer((_) async => []);

      final state = container.read(eventsProvider);
      expect(state, isA<AsyncLoading>());
    });

    test('returns events on success', () async {
      final events = [
        Event(id: '1', title: 'Berlin Music Festival', date: DateTime(2026, 6, 15)),
      ];
      when(() => mockRepository.getUpcomingEvents())
          .thenAnswer((_) async => events);

      // Wait for the provider to resolve
      await container.read(eventsProvider.future);
      final state = container.read(eventsProvider);

      expect(state, isA<AsyncData<List<Event>>>());
      expect(state.value, equals(events));
    });
  });
}
```

### Testing Models

```dart
// test/features/articles/models/article_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:iloveberlin/features/articles/models/article.dart';

void main() {
  group('Article', () {
    test('fromJson creates a valid Article', () {
      final json = {
        'id': '123',
        'title': 'Test Article',
        'excerpt': 'An excerpt',
        'content': 'Full content here',
        'slug': 'test-article',
        'publishedAt': '2026-01-15T10:00:00Z',
        'author': {'firstName': 'Anna', 'lastName': 'Schmidt'},
        'category': {'name': 'Lifestyle', 'slug': 'lifestyle'},
        'coverImage': 'https://cdn.iloveberlin.biz/images/test.jpg',
        'tags': ['berlin', 'lifestyle'],
      };

      final article = Article.fromJson(json);

      expect(article.id, '123');
      expect(article.title, 'Test Article');
      expect(article.slug, 'test-article');
      expect(article.publishedAt, DateTime.utc(2026, 1, 15, 10, 0, 0));
      expect(article.tags, ['berlin', 'lifestyle']);
    });

    test('toJson produces valid JSON', () {
      final article = Article(
        id: '123',
        title: 'Test Article',
        excerpt: 'An excerpt',
        slug: 'test-article',
        publishedAt: DateTime.utc(2026, 1, 15, 10, 0, 0),
      );

      final json = article.toJson();

      expect(json['id'], '123');
      expect(json['title'], 'Test Article');
      expect(json['publishedAt'], '2026-01-15T10:00:00.000Z');
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': '123',
        'title': 'Minimal Article',
        'excerpt': null,
        'content': null,
        'slug': 'minimal-article',
        'publishedAt': null,
        'coverImage': null,
        'tags': null,
      };

      final article = Article.fromJson(json);

      expect(article.excerpt, isNull);
      expect(article.publishedAt, isNull);
      expect(article.coverImage, isNull);
      expect(article.tags, isEmpty);
    });

    test('equality based on id', () {
      final a = Article(id: '1', title: 'A', slug: 'a');
      final b = Article(id: '1', title: 'B', slug: 'b');

      expect(a, equals(b));
    });
  });
}
```

### Testing Widget Rendering

```dart
// test/features/articles/widgets/article_card_widget_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iloveberlin/features/articles/models/article.dart';
import 'package:iloveberlin/features/articles/widgets/article_card.dart';

void main() {
  group('ArticleCard Widget', () {
    final article = Article(
      id: '1',
      title: 'Berlin Wall History',
      excerpt: 'A journey through the history of the Berlin Wall...',
      slug: 'berlin-wall-history',
      coverImage: 'https://cdn.iloveberlin.biz/images/wall.jpg',
      publishedAt: DateTime(2026, 1, 20),
    );

    testWidgets('displays article title', (tester) async {
      await tester.pumpWidget(
        MaterialApp(home: Scaffold(body: ArticleCard(article: article))),
      );

      expect(find.text('Berlin Wall History'), findsOneWidget);
    });

    testWidgets('displays article excerpt', (tester) async {
      await tester.pumpWidget(
        MaterialApp(home: Scaffold(body: ArticleCard(article: article))),
      );

      expect(find.text('A journey through the history of the Berlin Wall...'),
          findsOneWidget);
    });

    testWidgets('triggers onTap callback when tapped', (tester) async {
      String? tappedId;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ArticleCard(
              article: article,
              onTap: (id) => tappedId = id,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ArticleCard));
      expect(tappedId, '1');
    });
  });
}
```

---

## 4. General Best Practices

### Arrange-Act-Assert Pattern

Every test should follow the AAA pattern:

```typescript
it('should calculate the correct total with discount', () => {
  // Arrange
  const items = [{ price: 1000 }, { price: 2000 }];
  const discount = 0.1; // 10%

  // Act
  const total = calculateTotal(items, discount);

  // Assert
  expect(total).toBe(2700);
});
```

### One Assertion Per Logical Concept

A test can have multiple `expect` statements, but they should all validate the same logical concept:

```typescript
// Good: Multiple assertions about the same concept (the created user)
it('should create a user with default values', () => {
  const user = createUser({ email: 'test@test.com' });

  expect(user.email).toBe('test@test.com');
  expect(user.role).toBe('user');         // default
  expect(user.isVerified).toBe(false);    // default
});

// Bad: Testing two unrelated behaviors in one test
it('should create and delete a user', () => { ... });
```

### Test Naming Conventions

Use descriptive names that explain the scenario and expected outcome:

```typescript
// Good
'should return empty array when no articles match the filter'
'should throw NotFoundException when article ID does not exist'
'should send welcome email after successful registration'

// Bad
'test article filter'
'error test'
'email test'
```

### Mock Judiciously

- Mock **external dependencies** (database, HTTP calls, file system, time).
- Do **not** mock the unit under test.
- Do **not** mock value objects or simple utilities (unless they have side effects).
- Prefer **fakes** (in-memory implementations) over mocks when the interface is simple.

### Test Edge Cases

Always test:
- Empty inputs (empty string, empty array, `null`, `undefined`)
- Boundary values (0, 1, MAX_INT, first/last item)
- Error paths (network failure, invalid data, permission denied)
- Concurrent access (if applicable)
- Unicode and special characters (especially relevant for a Berlin-focused platform with German text)

```typescript
describe('edge cases', () => {
  it('handles German umlauts in search queries', async () => {
    const result = await service.search('Sch\u00f6neberg');
    expect(result).toBeDefined();
  });

  it('handles emoji in user-generated content', async () => {
    const classified = await service.create({
      title: 'Room in Neuk\u00f6lln \u2764\ufe0f',
      description: 'Cozy room available',
    });
    expect(classified.title).toContain('\u2764\ufe0f');
  });
});
```

---

## 5. Running Tests

### Commands

```bash
# NestJS
cd apps/api
npm run test                    # Run all unit tests
npm run test -- --watch         # Watch mode
npm run test -- --coverage      # With coverage report
npm run test -- articles        # Run tests matching "articles"
npm run test -- --verbose       # Verbose output

# Next.js
cd apps/web
npm run test                    # Run all unit tests
npm run test -- --watch         # Watch mode
npm run test -- --coverage      # With coverage report
npm run test -- ArticleCard     # Run specific test file

# Flutter
cd apps/mobile
flutter test                    # Run all unit tests
flutter test --coverage         # With coverage
flutter test test/features/articles/  # Run specific directory
```

### Coverage Reports

Coverage reports are generated in HTML format and can be viewed in a browser:

```bash
# NestJS
open apps/api/coverage/lcov-report/index.html

# Next.js
open apps/web/coverage/lcov-report/index.html

# Flutter
genhtml apps/mobile/coverage/lcov.info -o apps/mobile/coverage/html
open apps/mobile/coverage/html/index.html
```
