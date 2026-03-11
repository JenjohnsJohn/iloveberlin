# ADR-002: NestJS for Backend Framework

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform requires a robust backend API to serve the web frontend (Next.js), the mobile application (Flutter), and potentially third-party integrations. The backend is responsible for:

- **RESTful API endpoints** for content management (listings, events, reviews, user profiles), search, authentication, and payment processing.
- **Data validation and transformation** to ensure data integrity across multiple clients (web, mobile, admin panel).
- **Authentication and authorization** including JWT-based auth, social login (Google, Apple, Facebook), and role-based access control (users, business owners, admins).
- **Integration with external services** such as payment gateways, email providers, map services, and the Meilisearch engine.
- **API documentation** that is auto-generated and stays in sync with the codebase for internal and external developer use.
- **Maintainability at scale**: As the platform grows, the backend must remain organized, testable, and easy for new developers to navigate.

The team has strong TypeScript expertise and wants to share type definitions between the frontend and backend in a monorepo.

## Decision

We will use **NestJS** as the backend framework for the ILoveBerlin platform API.

NestJS provides a TypeScript-first, modular, decorator-based architecture inspired by Angular and enterprise Java patterns. Its opinionated structure with modules, controllers, services, guards, pipes, and interceptors enforces separation of concerns and makes the codebase navigable as it grows. Built-in support for validation (class-validator), serialization (class-transformer), Swagger/OpenAPI generation, and authentication (Passport.js integration) covers the platform's core backend needs out of the box.

## Alternatives Considered

| Criterion | NestJS | Express.js | Fastify | Django (Python) | Laravel (PHP) |
|---|---|---|---|---|---|
| Language | TypeScript (native) | JavaScript/TypeScript | JavaScript/TypeScript | Python | PHP |
| Architecture | Opinionated, modular | Unopinionated, minimal | Unopinionated, minimal | Opinionated (MTV) | Opinionated (MVC) |
| TypeScript support | First-class, native | Bolt-on (via @types) | Good (bolt-on) | Not applicable (Python) | Not applicable (PHP) |
| Type sharing with frontend | Seamless (monorepo) | Possible but fragile | Possible but fragile | Requires code generation | Requires code generation |
| Built-in validation | Yes (class-validator, pipes) | No (manual or middleware) | No (manual or plugin) | Yes (forms, serializers) | Yes (form requests) |
| API documentation | Swagger module (auto-generated) | Manual (swagger-jsdoc) | Manual (swagger plugin) | DRF auto-schema | Scribe/L5-Swagger |
| Authentication | Passport.js integration, guards | Manual (Passport.js) | Manual (Passport.js) | Built-in (sessions, tokens) | Built-in (Sanctum, Passport) |
| Dependency injection | Built-in, first-class | None | None | Limited | Built-in |
| Testing support | Built-in testing module, DI mocking | Manual setup | Manual setup | Built-in (pytest-django) | Built-in (PHPUnit) |
| Performance | Good (Express or Fastify under the hood) | Good | Excellent (fastest Node.js) | Good | Good |
| Learning curve | Medium (patterns to learn) | Low | Low | Medium | Medium |
| Community size | Large and growing | Very large | Medium | Very large | Very large |

### Why not Express.js?

Express.js is the most widely used Node.js framework and would allow the team to stay in TypeScript. However, Express is deliberately unopinionated -- it provides routing and middleware but no guidance on project structure, validation, authentication patterns, or API documentation. For a platform of this scope, the team would end up building (or assembling from disparate libraries) many features that NestJS provides out of the box. The resulting codebase would lack the structural consistency that NestJS enforces, making onboarding and long-term maintenance harder.

### Why not Fastify?

Fastify offers the best raw HTTP performance in the Node.js ecosystem and has a clean plugin architecture. However, like Express, it is unopinionated about application structure. Fastify's schema-based validation (using JSON Schema) is powerful but more verbose than NestJS's decorator-based class-validator approach. Notably, NestJS can use Fastify as its underlying HTTP adapter, giving us the option to switch from Express to Fastify under NestJS if raw performance becomes a bottleneck, without changing application code.

### Why not Django?

Django is a mature, battle-tested framework with an excellent ORM, admin panel, and built-in authentication. Django REST Framework extends it for API development. However, choosing Django would mean the backend is written in Python while the frontend is in TypeScript. This eliminates the ability to share type definitions, validation schemas, and utility code between frontend and backend in the monorepo. It would also require the team to maintain expertise in two languages and two ecosystems.

### Why not Laravel?

Laravel offers a similar "batteries included" philosophy to NestJS with elegant syntax, Eloquent ORM, built-in auth (Sanctum), and queue management. The same language-mismatch concern applies: PHP on the backend prevents type sharing with the TypeScript frontend and adds a second language to the stack. Additionally, PHP's deployment model differs significantly from Node.js, complicating the unified Docker-based deployment strategy.

## Consequences

### Positive

- **Consistent codebase structure**: The module/controller/service pattern enforces a predictable project layout. New developers can navigate the codebase quickly by following established conventions.
- **TypeScript end-to-end**: Shared type definitions between Next.js frontend and NestJS backend eliminate an entire class of integration bugs. Refactoring a shared DTO is caught at compile time across the entire monorepo.
- **Auto-generated API documentation**: The `@nestjs/swagger` module generates OpenAPI specs from decorators already present in the code. Documentation stays in sync with the implementation automatically.
- **Built-in validation pipeline**: DTOs with class-validator decorators validate incoming requests before they reach business logic. Validation errors are returned in a consistent format across all endpoints.
- **Dependency injection**: The DI container makes services testable (dependencies can be mocked) and decoupled (implementations can be swapped without changing consumers).
- **Guard-based authorization**: Authentication and role-based access control are declarative (decorators on controllers/routes), keeping authorization logic consistent and auditable.
- **Ecosystem**: Integrations exist for TypeORM/Prisma, Bull (queues), WebSockets, GraphQL, caching, and health checks.

### Negative

- **Learning curve**: Developers unfamiliar with Angular-style patterns (decorators, modules, DI, interceptors, pipes, guards) need time to internalize the NestJS mental model.
- **Boilerplate**: The structured approach requires more files and ceremony than a minimal Express app. A simple CRUD endpoint involves a module, controller, service, DTOs, and potentially an entity -- more setup than a single Express route file.
- **Abstraction overhead**: NestJS's abstractions (e.g., the DI container, lifecycle hooks, middleware vs. interceptor vs. guard distinctions) can be confusing when debugging. Understanding where in the request pipeline an issue occurs requires knowledge of the framework internals.
- **Performance overhead**: The DI container and decorator metadata add a small runtime overhead compared to raw Express or Fastify. This is negligible for most use cases but worth noting.
- **Framework lock-in**: Business logic written with NestJS decorators and DI patterns is coupled to the framework. Migrating away from NestJS would require significant refactoring.

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Swagger Module](https://docs.nestjs.com/openapi/introduction)
- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [NestJS with Fastify](https://docs.nestjs.com/techniques/performance)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
