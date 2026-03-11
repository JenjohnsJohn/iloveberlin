# Coding Standards

This document defines the coding conventions, formatting rules, and best practices for the ILoveBerlin codebase. All developers must follow these standards. The rules are enforced by ESLint, Prettier, and TypeScript compiler checks in CI.

---

## Table of Contents

- [TypeScript](#typescript)
- [NestJS Conventions (Backend)](#nestjs-conventions-backend)
- [Next.js Conventions (Frontend)](#nextjs-conventions-frontend)
- [File Naming](#file-naming)
- [Import Ordering](#import-ordering)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Comments](#comments)
- [Code Formatting (Prettier)](#code-formatting-prettier)
- [Linting (ESLint)](#linting-eslint)

---

## TypeScript

### Strict Mode

TypeScript strict mode is **mandatory** across all workspaces. The shared `tsconfig.json` enforces:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": false
  }
}
```

### Rules

1. **No `any`.** Use `unknown` when the type is genuinely unknown, then narrow with type guards. The ESLint rule `@typescript-eslint/no-explicit-any` is set to `error`.

2. **Prefer `interface` for object shapes, `type` for unions and intersections.**

   ```ts
   // Good
   interface User {
     id: string;
     name: string;
   }

   type Status = 'draft' | 'published' | 'archived';

   // Avoid
   type User = { id: string; name: string };
   ```

3. **Use `readonly` for data that should not be mutated.**

   ```ts
   interface Config {
     readonly apiUrl: string;
     readonly features: readonly string[];
   }
   ```

4. **Prefer `const` assertions for literal objects and arrays.**

   ```ts
   const ROLES = ['user', 'creator', 'admin'] as const;
   type Role = (typeof ROLES)[number]; // 'user' | 'creator' | 'admin'
   ```

5. **Use discriminated unions for state modeling.**

   ```ts
   type AsyncState<T> =
     | { status: 'idle' }
     | { status: 'loading' }
     | { status: 'success'; data: T }
     | { status: 'error'; error: Error };
   ```

6. **Avoid enums.** Use string literal union types or `as const` objects instead. Enums produce runtime code and can behave unexpectedly.

   ```ts
   // Prefer this
   const EventCategory = {
     MUSIC: 'music',
     FOOD: 'food',
     ART: 'art',
   } as const;
   type EventCategory = (typeof EventCategory)[keyof typeof EventCategory];

   // Over this
   enum EventCategory {
     MUSIC = 'music',
     FOOD = 'food',
     ART = 'art',
   }
   ```

7. **Export types separately** when they are consumed by other modules:

   ```ts
   export type { User, CreateUserDto };
   ```

---

## NestJS Conventions (Backend)

### Module Structure

Each feature module follows this layout:

```
apps/api/src/modules/events/
  events.module.ts           # Module declaration
  events.controller.ts       # HTTP endpoints
  events.service.ts          # Business logic
  events.repository.ts       # Database queries (if custom beyond TypeORM)
  dto/
    create-event.dto.ts      # Input validation
    update-event.dto.ts
    event-response.dto.ts    # Output serialization
  entities/
    event.entity.ts          # TypeORM entity
  guards/                    # Feature-specific guards (rare)
  events.controller.spec.ts  # Controller unit tests
  events.service.spec.ts     # Service unit tests
```

### Naming Conventions

| Concept | Pattern | Example |
|---|---|---|
| Module | `feature.module.ts` | `events.module.ts` |
| Controller | `feature.controller.ts` | `events.controller.ts` |
| Service | `feature.service.ts` | `events.service.ts` |
| Entity | `singular.entity.ts` | `event.entity.ts` |
| DTO (create) | `create-feature.dto.ts` | `create-event.dto.ts` |
| DTO (update) | `update-feature.dto.ts` | `update-event.dto.ts` |
| DTO (response) | `feature-response.dto.ts` | `event-response.dto.ts` |
| Guard | `feature.guard.ts` | `roles.guard.ts` |
| Interceptor | `feature.interceptor.ts` | `transform.interceptor.ts` |
| Pipe | `feature.pipe.ts` | `parse-uuid.pipe.ts` |
| Test | `feature.service.spec.ts` | `events.service.spec.ts` |

### Controller Rules

```ts
@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List all events with pagination and filters' })
  async findAll(@Query() query: ListEventsDto): Promise<PaginatedResponse<EventResponseDto>> {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EventResponseDto> {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('creator', 'admin')
  @ApiOperation({ summary: 'Create a new event' })
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.create(dto, user);
  }
}
```

- Prefix routes with the feature name (plural).
- Use `ParseUUIDPipe` for all UUID parameters.
- Always add Swagger decorators (`@ApiTags`, `@ApiOperation`).
- Controllers must not contain business logic -- delegate to services.
- Return DTOs, not raw entities. Map entities to response DTOs in the service layer.

### DTO Validation

Use `class-validator` and `class-transformer`:

```ts
import { IsString, IsDateString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Berlin Music Festival 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: '2026-07-15T18:00:00Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'A weekend of live music in Treptower Park.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}
```

### Entity Conventions

```ts
@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'author_id' })
  author: User;
}
```

- Use `uuid` for primary keys.
- Use snake_case for database column names (TypeORM `namingStrategy` handles this).
- Always include `createdAt` and `updatedAt` timestamps.
- Explicitly define nullable columns with `| null` in TypeScript.

---

## Next.js Conventions (Frontend)

### App Router File Conventions

```
apps/web/src/app/
  layout.tsx                # Root layout (wraps all pages)
  page.tsx                  # Home page (/)
  loading.tsx               # Loading UI
  error.tsx                 # Error boundary
  not-found.tsx             # 404 page

  events/
    page.tsx                # /events (listing)
    [slug]/
      page.tsx              # /events/:slug (detail)
      loading.tsx

  (auth)/
    login/page.tsx          # /login
    register/page.tsx       # /register

  (dashboard)/
    layout.tsx              # Dashboard layout (sidebar)
    dashboard/page.tsx      # /dashboard
    dashboard/events/page.tsx
```

### Component Naming

| Type | Convention | Example |
|---|---|---|
| Page component | Default export in `page.tsx` | `export default function EventsPage()` |
| Layout component | Default export in `layout.tsx` | `export default function DashboardLayout()` |
| UI component | Named export, PascalCase | `export function EventCard()` |
| Hook | `use` prefix, camelCase | `useEvents()`, `useDebounce()` |
| Utility function | camelCase | `formatDate()`, `slugify()` |
| Constant | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_ENDPOINTS` |

### Server Components vs. Client Components

- **Default to Server Components.** Only add `'use client'` when you need:
  - React hooks (`useState`, `useEffect`, `useContext`)
  - Browser APIs (`window`, `localStorage`, `navigator`)
  - Event handlers (`onClick`, `onChange`)
  - Third-party client-only libraries

- **Keep client components small.** Extract interactive parts into small `'use client'` components and keep the rest as server components.

```tsx
// Good: Server component wraps a small client island
// app/events/page.tsx (Server Component)
import { EventFilters } from '@/components/features/event-filters'; // 'use client'

export default async function EventsPage() {
  const events = await fetchEvents(); // runs on server
  return (
    <div>
      <h1>Events in Berlin</h1>
      <EventFilters />           {/* client island */}
      <EventList events={events} /> {/* server component */}
    </div>
  );
}
```

### Data Fetching

- Use `async` server components with direct `fetch()` calls or service functions for server-side data fetching.
- Use React Query (`@tanstack/react-query`) for client-side data fetching and caching.
- Always handle loading and error states.

```tsx
// Server-side fetch
async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${process.env.API_URL}/events`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return res.json();
}
```

### Tailwind CSS Rules

- Use utility classes directly in JSX. Do not create separate CSS files for component styles.
- Use the `cn()` helper (based on `clsx` + `tailwind-merge`) for conditional classes:

  ```tsx
  import { cn } from '@/lib/utils';

  <button className={cn(
    'px-4 py-2 rounded-lg font-medium',
    variant === 'primary' && 'bg-primary-900 text-white',
    variant === 'outline' && 'border border-primary-900 text-primary-900',
    disabled && 'opacity-50 cursor-not-allowed',
  )}>
  ```

- Never use `@apply` in CSS files. It defeats the purpose of utility-first CSS and creates maintenance burden.
- Keep class strings readable: group related utilities (layout, spacing, typography, color) and use multi-line formatting for long strings.

---

## File Naming

**All files use kebab-case** (lowercase with hyphens).

| Type | Pattern | Example |
|---|---|---|
| Component | `component-name.tsx` | `event-card.tsx` |
| Hook | `use-hook-name.ts` | `use-debounce.ts` |
| Utility | `utility-name.ts` | `format-date.ts` |
| Type definitions | `type-name.types.ts` | `event.types.ts` |
| Constants | `constant-group.ts` | `api-endpoints.ts` |
| Test | `file-name.spec.ts` or `file-name.test.ts` | `events.service.spec.ts` |
| NestJS module files | `feature.role.ts` | `events.controller.ts` |

**Directories also use kebab-case:** `user-profile/`, `date-picker/`.

**Exception:** Next.js App Router files must use the exact names Next.js expects: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.

---

## Import Ordering

Imports are organized into groups, separated by blank lines, in this order:

```ts
// 1. Node.js built-in modules
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// 2. External packages (node_modules)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 3. Internal packages (monorepo packages)
import { SharedType } from '@iloveberlin/shared';

// 4. Internal modules (absolute path aliases)
import { EventsService } from '@/modules/events/events.service';
import { User } from '@/modules/users/entities/user.entity';

// 5. Relative imports (same module)
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';

// 6. Type-only imports (last)
import type { PaginatedResponse } from '@/common/types';
```

This ordering is enforced by the ESLint `import/order` rule with auto-fix.

### Path Aliases

Use path aliases instead of deep relative paths:

```ts
// Good
import { Button } from '@/components/ui/button';

// Avoid
import { Button } from '../../../../components/ui/button';
```

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Error Handling

### Backend (NestJS)

Use NestJS built-in exceptions for HTTP errors:

```ts
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

// In a service method
async findOne(id: string): Promise<EventResponseDto> {
  const event = await this.eventRepository.findOne({ where: { id } });

  if (!event) {
    throw new NotFoundException(`Event with ID "${id}" not found`);
  }

  return this.mapToResponse(event);
}
```

- Use specific exception classes, not generic `HttpException`.
- Include a descriptive message for debugging.
- Never expose internal error details (stack traces, SQL errors) to the client. The global exception filter handles this.
- Wrap database operations in try/catch to handle constraint violations gracefully:

```ts
async create(dto: CreateEventDto): Promise<EventResponseDto> {
  try {
    const event = this.eventRepository.create(dto);
    const saved = await this.eventRepository.save(event);
    return this.mapToResponse(saved);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation
      throw new ConflictException('An event with this slug already exists');
    }
    throw error; // re-throw unexpected errors
  }
}
```

### Frontend (Next.js)

- Use `error.tsx` boundaries for page-level errors.
- Use try/catch in server actions and API route handlers.
- Show user-friendly error messages. Log technical details to the console or monitoring service.
- Use toast notifications for transient errors (network failures, validation errors).

```tsx
// error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-h3 font-heading">Something went wrong</h2>
      <p className="text-neutral-600">Please try again or contact support if the problem persists.</p>
      <Button onClick={reset} variant="primary">Try Again</Button>
    </div>
  );
}
```

---

## Logging

### Backend

Use the NestJS built-in `Logger`:

```ts
import { Logger } from '@nestjs/common';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  async create(dto: CreateEventDto, user: User): Promise<EventResponseDto> {
    this.logger.log(`Creating event "${dto.title}" by user ${user.id}`);

    // ... business logic ...

    this.logger.log(`Event created with ID ${event.id}`);
    return this.mapToResponse(event);
  }
}
```

**Log levels:**
- `logger.log()` -- Normal operations (request received, entity created).
- `logger.warn()` -- Unexpected but recoverable situations (deprecated API usage, fallback triggered).
- `logger.error()` -- Failures that need attention (database errors, external service failures). Include the error object.
- `logger.debug()` -- Verbose output for development (query parameters, intermediate values). Disabled in production.

**Rules:**
- Never log sensitive data (passwords, tokens, full credit card numbers).
- Include context (user ID, entity ID, operation name) in every log message.
- Use structured logging in production (JSON format via a custom logger transport).

### Frontend

- Use `console.error()` for caught exceptions.
- Never leave `console.log()` in production code. Use a monitoring service (Sentry, LogRocket) for production error tracking.
- The ESLint rule `no-console` is set to `warn` with exceptions for `console.error` and `console.warn`.

---

## Comments

### When to Comment

- **Do** comment the *why*, not the *what*. If the code's purpose is not obvious from its structure, explain the reasoning.
- **Do** add JSDoc comments to exported functions, classes, and interfaces that are part of the public API.
- **Do** add `// TODO:` comments for known improvements, always with a ticket reference: `// TODO(FR-123): Add pagination support`.
- **Do not** add comments that restate the code. `// increment counter` above `counter++` adds nothing.

### JSDoc Format

```ts
/**
 * Finds events within a geographic bounding box.
 *
 * Uses a PostGIS ST_Within query to filter events whose venue
 * falls within the specified coordinates. Results are sorted
 * by distance from the center point.
 *
 * @param bounds - Geographic bounding box (SW and NE corners)
 * @param options - Pagination and sorting options
 * @returns Paginated list of events within the bounds
 */
async findWithinBounds(
  bounds: GeoBounds,
  options: PaginationOptions,
): Promise<PaginatedResponse<EventResponseDto>> {
```

### Inline Comments

```ts
// Meilisearch returns relevance-sorted results, but we need to
// re-sort by date for the "upcoming" view. This is a trade-off:
// we lose relevance ranking but gain chronological ordering.
const sorted = results.sort((a, b) => a.date.getTime() - b.date.getTime());
```

---

## Code Formatting (Prettier)

Prettier is the sole code formatter. Never manually format code -- let Prettier handle it.

### Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Key Decisions

| Rule | Value | Rationale |
|---|---|---|
| Semicolons | Yes | Avoids ASI edge cases |
| Quotes | Single | Cleaner for TypeScript/JSX |
| Trailing commas | All | Cleaner diffs in Git |
| Print width | 100 | Wider than 80 to reduce line wrapping in modern screens, narrower than 120 to stay readable |
| Tailwind plugin | Enabled | Sorts Tailwind classes consistently |

### Ignored Files

```
# .prettierignore
dist/
.next/
node_modules/
coverage/
pnpm-lock.yaml
*.generated.ts
```

---

## Linting (ESLint)

ESLint catches bugs, enforces patterns, and maintains consistency.

### Configuration Overview

```js
// .eslintrc.js (simplified)
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:import/typescript',
    'prettier', // must be last -- disables formatting rules
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-floating-promises': 'error',

    // Imports
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'type'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
    }],
    'import/no-duplicates': 'error',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
  },
};
```

### Next.js-Specific Rules

The web app extends `next/core-web-vitals` which includes rules for:
- Using `next/image` instead of `<img>`.
- Using `next/link` instead of `<a>` for internal navigation.
- Proper use of `next/script`.

### Running the Linter

```bash
# Lint all workspaces
pnpm lint

# Lint a specific workspace
pnpm --filter api lint

# Auto-fix
pnpm lint:fix

# Lint staged files only (used in pre-commit hook)
pnpm lint-staged
```

### Pre-commit Hook

We use `husky` + `lint-staged` to run linting on staged files before every commit:

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

This prevents poorly formatted or linting-error code from entering the repository.
