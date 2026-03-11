# Developer Guides

Welcome to the ILoveBerlin developer documentation. These guides cover everything you need to set up your environment, write code that meets our standards, and collaborate effectively with the team.

## Guides

| Guide | Description | Audience |
|---|---|---|
| [Onboarding Guide](./onboarding-guide.md) | Start here if you are new to the project | New team members |
| [Local Development Setup](./local-development-setup.md) | Prerequisites, installation, and running the stack locally | All developers |
| [Coding Standards](./coding-standards.md) | TypeScript, NestJS, Next.js conventions, formatting, and linting | All developers |
| [Git Workflow](./git-workflow.md) | Branch naming, commit messages, PR process, and merge strategy | All developers |
| [Code Review Guidelines](./code-review-guidelines.md) | Review checklist, etiquette, and approval requirements | All developers |

## Recommended Reading Order

If you are joining the project for the first time:

1. **[Onboarding Guide](./onboarding-guide.md)** -- High-level overview and first steps.
2. **[Local Development Setup](./local-development-setup.md)** -- Get the app running on your machine.
3. **[Coding Standards](./coding-standards.md)** -- Understand how we write code.
4. **[Git Workflow](./git-workflow.md)** -- Learn how we use branches, commits, and PRs.
5. **[Code Review Guidelines](./code-review-guidelines.md)** -- Know what to look for (and expect) in reviews.

Then explore the [Design System documentation](../design-system/README.md) for UI and component guidelines.

## Architecture Overview

```
iloveberlin/
  apps/
    web/              # Next.js frontend (React, Tailwind CSS)
    api/              # NestJS backend (REST API, PostgreSQL)
    mobile/           # Flutter mobile app (iOS + Android)
  packages/
    shared/           # Shared TypeScript types and utilities
    eslint-config/    # Shared ESLint configuration
    tsconfig/         # Shared TypeScript configuration
  docs/               # This documentation
  docker/             # Docker Compose and Dockerfiles
  scripts/            # Build, deploy, and utility scripts
```

## Tech Stack Quick Reference

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 14.x |
| Styling | Tailwind CSS | 3.x |
| Backend | NestJS | 10.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 16 |
| ORM | TypeORM | 0.3.x |
| Search | Meilisearch | 1.x |
| Mobile | Flutter (Dart) | 3.x |
| Package Manager | pnpm | 9.x |
| Containerization | Docker + Docker Compose | Latest |
| CI/CD | GitHub Actions | -- |

## Getting Help

- **Slack:** `#dev-help` for technical questions, `#dev-general` for discussions.
- **GitHub Issues:** Search existing issues before opening a new one.
- **Documentation gaps:** If something is missing or unclear, open a PR to improve these docs. Every developer is a documentation contributor.
