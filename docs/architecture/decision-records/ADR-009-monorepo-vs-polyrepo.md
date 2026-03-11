# ADR-009: Monorepo with Turborepo for TypeScript Projects

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform consists of multiple TypeScript-based projects that share code and dependencies:

- **Next.js frontend** (`apps/web`): The public-facing web application.
- **NestJS backend** (`apps/api`): The REST API serving both web and mobile clients.
- **Admin panel** (`apps/admin`): An internal dashboard for content moderation, analytics, and business management (likely Next.js or a lightweight React app).
- **Shared packages**:
  - **TypeScript types/interfaces** (`packages/types`): DTOs, entity types, API response types, and enums shared between frontend and backend.
  - **Validation schemas** (`packages/validation`): Zod or class-validator schemas used for both client-side form validation and server-side request validation.
  - **Utility functions** (`packages/utils`): Date formatting, slug generation, URL helpers, and other shared logic.
  - **UI components** (`packages/ui`): Shared React component library for web and admin panel.
  - **Configuration** (`packages/config`): Shared ESLint, TypeScript, and Prettier configurations.

The Flutter mobile application is written in Dart and has a fundamentally different build system, dependency management (pub), and development workflow. It does not share code directly with the TypeScript projects.

The team needs to decide how to organize these projects: in a single repository (monorepo) or in separate repositories (polyrepo).

## Decision

We will use a **monorepo managed by Turborepo** for all TypeScript-based projects (Next.js frontend, NestJS backend, admin panel, and shared packages). The **Flutter mobile application will remain in a separate repository**.

Turborepo provides incremental builds, remote caching, task orchestration, and dependency graph awareness for the monorepo. It integrates natively with the Node.js/TypeScript ecosystem and has first-class support for Next.js (both are Vercel projects). The monorepo structure enables direct code sharing via TypeScript path references and workspace dependencies, ensuring type safety across project boundaries.

## Alternatives Considered

| Criterion | Monorepo (Turborepo) | Separate Repos (Polyrepo) | Monorepo (Nx) | Monorepo (Lerna) |
|---|---|---|---|---|
| Code sharing | Direct imports via workspaces | Published packages (npm) or git submodules | Direct imports via workspaces | Direct imports via workspaces |
| Type safety across projects | Compile-time (single tsconfig) | Runtime (published types may lag) | Compile-time | Compile-time |
| Build orchestration | Task pipeline with caching | Independent CI per repo | Task pipeline with caching | Basic task running |
| Incremental builds | Yes (content-hash based) | Not applicable (separate builds) | Yes (affected commands) | Limited |
| Remote caching | Yes (Vercel Remote Cache or custom) | Not applicable | Yes (Nx Cloud or custom) | No |
| Dependency management | Single lockfile (pnpm workspaces) | Separate lockfiles per repo | Single lockfile | Single lockfile |
| CI/CD complexity | Single pipeline, filtered by changes | Multiple pipelines, inter-repo triggers | Single pipeline, filtered | Single pipeline |
| Refactoring | Atomic (change type + all consumers in one commit) | Coordinated PRs across repos | Atomic | Atomic |
| Learning curve | Low (thin wrapper over npm scripts) | Familiar (standard repo workflow) | Medium-high (generators, plugins, graph) | Low (but limited features) |
| Tooling maturity | Mature (Vercel-backed, active development) | Not applicable (standard Git) | Very mature (Nrwl, large community) | Declining (maintenance mode) |
| Repository size risk | Grows over time (mitigated by sparse checkout) | Small, focused repos | Grows over time | Grows over time |
| Team autonomy | Shared conventions, coordinated releases | Full autonomy per team | Shared conventions | Shared conventions |

### Why not separate repositories (polyrepo)?

The polyrepo approach gives each project its own repository, CI pipeline, and release cycle. This is the default approach and works well when projects are independently deployable with minimal shared code. However, for the ILoveBerlin platform:

- **Type synchronization**: The NestJS backend defines DTOs that the Next.js frontend consumes. In a polyrepo setup, these types must be published as an npm package, versioned, and consumed by the frontend. Every type change requires: (1) update the types package, (2) publish a new version, (3) update the dependency in the frontend, (4) verify compatibility. In a monorepo, changing a shared type and updating all consumers is a single commit with compile-time verification.
- **Validation schema sharing**: The same validation logic (e.g., "email must be valid, password must be 8+ characters") runs on both frontend (form validation) and backend (request validation). In a polyrepo, this is either duplicated (drift risk) or extracted to a published package (version coordination overhead).
- **Refactoring friction**: Renaming a field in an API response requires changes in the backend (DTO, controller, service), shared types, and frontend (API client, components). In a monorepo, this is one PR with compile-time safety. In a polyrepo, it is three coordinated PRs across repos with runtime risk.
- **Dependency version drift**: Separate repos tend to drift in dependency versions (React, TypeScript, ESLint). This causes subtle bugs when shared code is tested against one version but consumed with another. A monorepo with shared configurations ensures consistency.
- **CI/CD duplication**: Each repo needs its own CI pipeline, Docker build, and deployment configuration. Shared CI logic is either duplicated or managed through a shared CI template, adding complexity.

### Why not Nx?

Nx is the most feature-rich monorepo tool, with deep integration for React, Next.js, NestJS, and many other frameworks. It provides project generators, dependency graph visualization, affected commands (run only what changed), distributed task execution, and Nx Cloud for remote caching. Nx would be a strong choice. Turborepo was preferred for:

- **Simplicity**: Turborepo is a thinner abstraction. It focuses on task orchestration and caching without imposing project structure, generators, or plugins. The monorepo uses standard `package.json` scripts, TypeScript project references, and pnpm workspaces -- all standard tools that work without Turborepo if needed.
- **Lower learning curve**: Turborepo's configuration is a single `turbo.json` file defining the task pipeline. Nx requires understanding workspaces, project configurations (`project.json`), generators, executors, and the plugin system. For a small team, Turborepo's simplicity reduces onboarding time.
- **No lock-in**: Turborepo adds caching and orchestration on top of existing npm scripts. Removing Turborepo means running scripts directly -- the projects themselves are unchanged. Nx's generators and executors create tighter coupling to the Nx toolchain.
- **Native Next.js alignment**: Turborepo and Next.js are both Vercel projects, ensuring first-class compatibility and integration. While Nx also supports Next.js well, Turborepo's integration is guaranteed to be maintained.

If the monorepo grows to include many more projects (10+) or the team needs Nx's advanced features (distributed task execution, custom generators for scaffolding, module boundary enforcement), migrating from Turborepo to Nx is feasible since both use standard workspace conventions.

### Why not Lerna?

Lerna was the original JavaScript monorepo tool, popularized by Babel, React, and other large open-source projects. However:

- **Limited scope**: Lerna primarily manages versioning and publishing of npm packages. It does not provide build caching, task orchestration, or dependency-graph-aware execution -- the features most valuable for an application monorepo (as opposed to a library monorepo).
- **Maintenance status**: Lerna's development has slowed significantly. While Nx now maintains Lerna and has added some modern features, Lerna on its own is not competitive with Turborepo or Nx for new projects.
- **No remote caching**: Lerna does not support remote caching, which is important for CI performance as the monorepo grows.

### Why is Flutter in a separate repository?

The Flutter mobile application is written in Dart, not TypeScript. Including it in the TypeScript monorepo would add complexity without the primary benefit (direct code sharing):

- **Different language and toolchain**: Flutter uses Dart, `pub` for dependencies, and its own build system. Turborepo's task orchestration and caching are designed for Node.js/TypeScript projects and provide no benefit for Flutter.
- **Different CI pipeline**: Flutter builds require Flutter SDK, Xcode (iOS), and Android SDK -- none of which are needed for the TypeScript projects. Combining these in one CI pipeline would slow down all builds.
- **No direct code sharing**: Dart cannot import TypeScript types. Type synchronization between the API and Flutter app is handled via OpenAPI code generation (the NestJS API generates an OpenAPI spec, and a Dart client is generated from it).
- **Different release cycle**: Mobile app releases go through App Store/Play Store review processes with different cadence than web deployments.

The Flutter repository consumes the NestJS API's OpenAPI specification to generate type-safe Dart API clients, maintaining contract compatibility without repository coupling.

## Consequences

### Positive

- **Single source of truth for types**: TypeScript interfaces and DTOs defined in `packages/types` are imported directly by both the Next.js frontend and NestJS backend. A type change is immediately verified across all consumers at compile time. This eliminates an entire category of runtime bugs caused by API contract drift.
- **Shared validation**: Validation schemas in `packages/validation` run identically on client and server. Form validation in the browser matches server-side validation exactly, providing consistent error messages and behavior.
- **Atomic refactoring**: Renaming a field, changing an API endpoint, or restructuring shared code is done in a single PR with compile-time verification across all affected projects. Code reviewers see the complete impact of a change.
- **Consistent tooling**: Shared ESLint, TypeScript, and Prettier configurations in `packages/config` ensure consistent code style and quality across all projects. Updates to tooling configuration apply everywhere at once.
- **Fast CI with caching**: Turborepo's content-hash-based caching skips unchanged tasks. If only the frontend changes, backend tests and builds are cached. Remote caching shares these results across team members and CI runs.
- **Simplified dependency management**: A single `pnpm-lock.yaml` ensures all projects use the same versions of shared dependencies (React, TypeScript, ESLint, etc.), eliminating version drift issues.
- **Developer experience**: A single `git clone`, `pnpm install`, and `turbo dev` starts the entire development stack (frontend, backend, database) with hot reload. New developers are productive in minutes, not hours.

### Negative

- **Repository size growth**: Over time, the repository accumulates history, build artifacts (if not properly gitignored), and dependencies. `git clone` may become slow. Mitigation: shallow clones in CI (`--depth 1`), Git LFS for large assets, and periodic history cleanup if needed.
- **CI pipeline complexity**: The CI pipeline must determine which projects are affected by a change and run only the relevant tests and builds. Turborepo's `--filter` flag handles this, but the pipeline configuration is more complex than "run all tests" or a simple per-repo pipeline.
- **Merge conflicts**: With multiple developers working in the same repository, merge conflicts in shared files (lockfile, shared configurations) are more frequent than in separate repos. Mitigation: `pnpm` handles lockfile merges well, and clear ownership of shared packages reduces conflicts.
- **Permission boundaries**: In a monorepo, all developers have access to all code. If fine-grained access control is needed (e.g., restricting access to payment processing code), this requires Git hosting features (GitHub CODEOWNERS, branch protection) rather than repository-level permissions.
- **Flutter separation overhead**: The Flutter app being in a separate repository means API contract changes require a two-step process: (1) update the NestJS API and regenerate the OpenAPI spec in the monorepo, (2) regenerate the Dart client and update the Flutter app in its repo. This coordination is manageable with CI automation (auto-generate Dart client on OpenAPI spec changes) but is additional overhead compared to a hypothetical all-in-one repo.
- **Turborepo dependency**: While Turborepo's coupling is light (standard npm scripts underneath), the team depends on Turborepo for caching and orchestration. If Turborepo's development direction diverges from the team's needs, migration to Nx or a custom solution requires effort.

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Turborepo Task Pipeline](https://turbo.build/repo/docs/crafting-your-repository/configuring-tasks)
- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Nx Documentation](https://nx.dev/getting-started/intro)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [OpenAPI Generator](https://openapi-generator.tech/)
