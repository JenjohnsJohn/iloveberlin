# Onboarding Guide

Welcome to the ILoveBerlin development team. This guide will orient you to the project, help you set up your environment, and give you a clear path to making your first contribution.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Summary](#architecture-summary)
- [Key Documents to Read First](#key-documents-to-read-first)
- [Development Environment Setup](#development-environment-setup)
- [Your First Tasks](#your-first-tasks)
- [Team Communication](#team-communication)
- [Project Tools and Access](#project-tools-and-access)
- [Standards to Review](#standards-to-review)
- [PR Process Walkthrough](#pr-process-walkthrough)
- [First Week Checklist](#first-week-checklist)

---

## Project Overview

**ILoveBerlin** (iloveberlin.biz) is a platform that connects residents and visitors of Berlin with the best the city has to offer -- events, restaurants, articles, neighborhood guides, and local experiences.

### What the Product Does

- **Explore:** Users browse and search for events, restaurants, articles, and neighborhoods across Berlin.
- **Discover:** Curated content and smart search help users find hidden gems and trending spots.
- **Contribute:** Creators (local businesses, bloggers, event organizers) publish and manage their own listings.
- **Engage:** Users save favorites, leave reviews, share content, and follow creators.
- **Administer:** Admins manage content, users, categories, and platform settings through a dashboard.

### User Roles

| Role | What They Can Do |
|---|---|
| **Visitor** (unauthenticated) | Browse public content, search, view listings |
| **User** (registered) | All visitor abilities + save favorites, leave reviews, manage profile |
| **Creator** | All user abilities + create/edit/manage own listings (events, restaurants, articles) |
| **Admin** | Full platform access + manage users, moderate content, configure platform |

---

## Architecture Summary

ILoveBerlin is a monorepo with three main applications and shared packages:

```
iloveberlin/
  apps/
    web/              # Next.js 14 (App Router) -- public website + creator dashboard
    api/              # NestJS 10 -- REST API
    mobile/           # Flutter 3 -- iOS and Android app
  packages/
    shared/           # Shared TypeScript types, constants, and utilities
    eslint-config/    # Shared ESLint configuration
    tsconfig/         # Shared TypeScript base configuration
  docs/               # Documentation (you are here)
  docker/             # Docker Compose and related configuration
  scripts/            # Build, deploy, and utility scripts
```

### How the Pieces Fit Together

```
                        ┌─────────────────┐
                        │   CDN / Vercel   │
                        │   (static assets)│
                        └────────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
     ┌────────▼──────┐ ┌────────▼──────┐ ┌─────────▼─────┐
     │  Next.js Web  │ │ Flutter Mobile│ │ External APIs │
     │  (SSR + SPA)  │ │  (iOS/Android)│ │  (webhooks)   │
     │  :3000        │ │               │ │               │
     └────────┬──────┘ └────────┬──────┘ └───────┬───────┘
              │                  │                 │
              └──────────┬───────┘─────────────────┘
                         │
                ┌────────▼────────┐
                │   NestJS API    │
                │   :3001         │
                │   (REST + Auth) │
                └─┬──────┬──────┬─┘
                  │      │      │
        ┌─────────▼┐ ┌──▼────┐ ┌▼──────────┐
        │PostgreSQL│ │ Redis │ │Meilisearch│
        │  :5432   │ │ :6379 │ │   :7700   │
        └──────────┘ └───────┘ └───────────┘
```

### Tech Stack at a Glance

| Layer | Technology | Key Libraries |
|---|---|---|
| Frontend | Next.js 14 (App Router) | React 18, Tailwind CSS 3, React Query, Zustand |
| Backend | NestJS 10 | TypeORM, class-validator, Passport.js, Swagger |
| Mobile | Flutter 3 | Riverpod, Dio, Go Router |
| Database | PostgreSQL 16 | PostGIS extension for geospatial queries |
| Search | Meilisearch 1.x | Typo-tolerant full-text search |
| Cache | Redis | Session storage, rate limiting, caching |
| Language | TypeScript 5.x | Shared between web and API |
| Package Manager | pnpm 9 | Workspaces for monorepo management |
| Containerization | Docker + Docker Compose | Local dev infrastructure |
| CI/CD | GitHub Actions | Lint, test, build, deploy |
| Hosting | Vercel (web) + Railway/Fly.io (API) | -- |

---

## Key Documents to Read First

Read these documents in this order during your first week:

| Order | Document | Why | Time |
|---|---|---|---|
| 1 | This onboarding guide | High-level orientation | 15 min |
| 2 | [Local Development Setup](./local-development-setup.md) | Get the app running on your machine | 30 min |
| 3 | [Coding Standards](./coding-standards.md) | Understand our TypeScript and code conventions | 20 min |
| 4 | [Git Workflow](./git-workflow.md) | Learn our branch, commit, and PR conventions | 15 min |
| 5 | [Code Review Guidelines](./code-review-guidelines.md) | Know what to expect in reviews | 10 min |
| 6 | [Design System - Brand Guidelines](../design-system/brand-guidelines.md) | Understand the visual identity | 10 min |
| 7 | [Design System - Component Library](../design-system/component-library.md) | Familiarize yourself with UI components | 15 min |
| 8 | [Design System - Layout System](../design-system/layout-system.md) | Understand responsive layout patterns | 10 min |

Total: approximately 2 hours of reading.

---

## Development Environment Setup

Follow the [Local Development Setup](./local-development-setup.md) guide to get the project running on your machine. Here is the summary:

```bash
# 1. Clone the repo
git clone git@github.com:iloveberlin/iloveberlin.git
cd iloveberlin

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# 4. Start infrastructure (PostgreSQL, Meilisearch, Redis)
docker compose up -d

# 5. Run database migrations
pnpm --filter api migration:run

# 6. Seed sample data
pnpm --filter api seed

# 7. Start development servers
pnpm dev

# 8. Open the app
# Frontend: http://localhost:3000
# API docs: http://localhost:3001/api/docs
```

If you hit any issues, check the troubleshooting section in the [Local Development Setup](./local-development-setup.md) guide. If you are still stuck, ask in `#dev-help` on Slack.

---

## Your First Tasks

We label beginner-friendly issues with **`good first issue`** on GitHub. These are small, well-defined tasks that help you learn the codebase without being overwhelming.

### Suggested First Contributions

1. **Fix a typo or improve documentation** -- Edit a docs file or fix a UI text string. This gets you through the entire PR flow with minimal risk.

2. **Add a missing unit test** -- Find a service or utility function with low test coverage and add tests. This teaches you the codebase structure without changing behavior.

3. **Implement a small UI component** -- Pick a component from the component library spec that has not been built yet. This teaches you the frontend stack.

4. **Add Swagger documentation** -- Find an API endpoint missing `@ApiOperation` or `@ApiProperty` decorators and add them.

5. **Fix a `good first issue`** -- Browse the issue tracker and pick one labeled `good first issue`.

### How to Find Good First Issues

```bash
# Using the GitHub CLI
gh issue list --label "good first issue" --state open

# Or browse on GitHub
# https://github.com/iloveberlin/iloveberlin/issues?q=is%3Aopen+label%3A%22good+first+issue%22
```

### Before Starting Work

1. Check if the issue is already assigned. If not, comment "I'll take this" and assign yourself.
2. Read the full issue description and any linked documents.
3. Ask questions in the issue comments if anything is unclear. There are no bad questions.
4. Create a branch following our [naming conventions](./git-workflow.md#branch-naming).

---

## Team Communication

### Channels

| Channel | Purpose | When to Use |
|---|---|---|
| `#dev-general` | General development discussion | Announcements, decisions, architecture discussions |
| `#dev-help` | Technical questions and troubleshooting | When you are stuck or need guidance |
| `#dev-prs` | PR notifications (automated) | Review requests, merge notifications |
| `#design-system` | UI/UX and design system discussion | Component questions, design decisions |
| `#standup` | Async daily standups | Post what you worked on, what you plan to do, and any blockers |

### Meetings

| Meeting | Frequency | Purpose |
|---|---|---|
| Daily standup (async) | Daily | Brief update in `#standup` by 10:00 AM CET |
| Sprint planning | Bi-weekly (Monday) | Plan the next sprint's work |
| Sprint review / retro | Bi-weekly (Friday) | Demo completed work, discuss improvements |
| Architecture review | As needed | Discuss significant technical decisions |

### Communication Norms

- **Default to public channels** over DMs. Others may have the same question or can learn from the discussion.
- **Use threads** in Slack to keep channels readable.
- **Prefer async communication.** Write your question fully so others can respond when available. Avoid "Are you there?" messages.
- **Respond within a few hours** during business hours. If you need more time, acknowledge receipt and give an ETA.

---

## Project Tools and Access

Request access to these tools during your first day. Your manager or onboarding buddy can help.

| Tool | Purpose | How to Get Access |
|---|---|---|
| **GitHub** (iloveberlin org) | Code repository, issues, PRs, CI | Invited by engineering lead |
| **Slack** workspace | Team communication | Invited by your manager |
| **Vercel** | Frontend deployment, preview URLs | Added by DevOps |
| **Railway / Fly.io** | API deployment | Added by DevOps |
| **Figma** | UI designs and prototypes | Added by design team |
| **Linear / Jira** | Project management, issue tracking | Invited by PM |
| **1Password / Vault** | Shared credentials for dev services | Invited by engineering lead |
| **Sentry** | Error monitoring | Added by DevOps |
| **PostHog / Mixpanel** | Analytics | Added by PM |

### First-Day Access Checklist

- [ ] GitHub organization membership confirmed
- [ ] Slack workspace joined, added to relevant channels
- [ ] Can clone the repo and run `pnpm install` successfully
- [ ] Can start Docker services and the dev servers
- [ ] Can access the Swagger API docs at `localhost:3001/api/docs`
- [ ] Can log in to the seeded admin account on localhost
- [ ] Project management tool access confirmed
- [ ] Figma access confirmed (if working on frontend)

---

## Standards to Review

Before writing your first line of code, familiarize yourself with these standards:

### Code Quality

- [Coding Standards](./coding-standards.md) -- TypeScript strict mode, naming conventions, error handling, formatting, linting.
- We use **Prettier** for formatting (runs automatically on save and pre-commit).
- We use **ESLint** for linting (TypeScript-specific rules, import ordering, no-any).
- **TypeScript strict mode** is enforced. No `any` types, no unchecked index access.

### Git and Collaboration

- [Git Workflow](./git-workflow.md) -- Branch naming (`feature/FR-XX-description`), conventional commits (`feat(scope): description`), squash merge to `main`.
- [Code Review Guidelines](./code-review-guidelines.md) -- Review checklist, feedback etiquette, approval requirements.

### Design and UI

- [Brand Guidelines](../design-system/brand-guidelines.md) -- Colors, typography, tone of voice.
- [Component Library](../design-system/component-library.md) -- Reusable components, props, variants.
- [Layout System](../design-system/layout-system.md) -- Responsive breakpoints, grid, spacing.

### Key Conventions Summary

| Convention | Rule |
|---|---|
| Language | TypeScript everywhere (strict mode) |
| File naming | `kebab-case.ts` |
| Component naming | `PascalCase` in code, `kebab-case` file names |
| CSS | Tailwind utility classes only (no CSS files, no `@apply`) |
| State management | React Query (server state), Zustand (client state) |
| API responses | Always return DTOs, never raw entities |
| Database IDs | UUIDs |
| Dates | ISO 8601 strings in API, `Date` objects in TypeScript |
| Errors | NestJS built-in exceptions on backend, error boundaries on frontend |
| Tests | Co-located with source files (`*.spec.ts`) |

---

## PR Process Walkthrough

Here is a complete walkthrough of submitting your first PR, step by step:

### 1. Pick a Task

Find a `good first issue` or ask your onboarding buddy for a suggestion.

### 2. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/FR-101-add-event-category-badge
```

### 3. Make Your Changes

Edit the relevant files. Follow the coding standards.

### 4. Verify Locally

```bash
# Run the linter
pnpm lint

# Run the formatter
pnpm format

# Run tests
pnpm test

# Build (catches TypeScript errors)
pnpm build
```

### 5. Commit

```bash
git add apps/web/src/components/ui/badge.tsx
git add apps/web/src/components/ui/badge.spec.tsx

git commit -m "feat(web): add category badge component for event cards

Implements the Badge atom from the component library spec with
default, success, warning, error, and info variants.

Refs FR-101"
```

### 6. Push

```bash
git push -u origin feature/FR-101-add-event-category-badge
```

### 7. Open the PR

Go to GitHub (or use the GitHub CLI):

```bash
gh pr create --title "feat(web): add category badge component" --body "## Summary
- Added Badge component with 5 variants (default, success, warning, error, info)
- Added unit tests for all variants and sizes
- Component follows the design system spec

## Ticket
Refs FR-101

## Testing
- [x] Unit tests added
- [x] Storybook story added
- [x] Visual check on mobile and desktop

## Screenshots
[Attach screenshots of the badge in different variants]"
```

### 8. Wait for CI

CI will run automatically. If it fails, check the logs, fix the issue, and push a new commit.

### 9. Request Review

Assign a reviewer. Your onboarding buddy is a good first choice.

### 10. Address Feedback

Read every comment. Push fixes as new commits (do not amend during review). Respond to each comment.

### 11. Merge

Once approved and CI is green, click "Squash and merge" on GitHub. The branch is automatically deleted.

### 12. Celebrate

Your first contribution is live. Well done.

---

## First Week Checklist

Use this checklist to track your onboarding progress:

### Day 1: Setup

- [ ] Read this onboarding guide
- [ ] Set up your development environment (follow the local dev setup guide)
- [ ] Successfully run the application locally
- [ ] Join all Slack channels
- [ ] Request access to all project tools
- [ ] Meet your onboarding buddy

### Day 2: Learn

- [ ] Read the coding standards guide
- [ ] Read the git workflow guide
- [ ] Read the code review guidelines
- [ ] Browse the codebase -- look at a few controllers, services, and components
- [ ] Read through the Swagger API docs at `localhost:3001/api/docs`

### Day 3: Explore

- [ ] Read the design system documentation
- [ ] Run the test suite and review how tests are structured
- [ ] Pick your first task (`good first issue`)
- [ ] Ask any questions in `#dev-help`

### Day 4-5: Contribute

- [ ] Create a branch for your first task
- [ ] Implement the change
- [ ] Write tests
- [ ] Submit your first PR
- [ ] Respond to review feedback
- [ ] Merge your first PR

---

## Who to Ask

| Question About | Ask |
|---|---|
| General onboarding, getting unblocked | Your onboarding buddy |
| Architecture decisions, technical direction | Engineering lead |
| Frontend / UI / design system | Frontend team lead |
| Backend / API / database | Backend team lead |
| Mobile / Flutter | Mobile team lead |
| Infrastructure / deployment / CI | DevOps engineer |
| Product requirements, priorities | Product manager |
| Design, UX, brand | Design team lead |

Remember: there are no bad questions. Everyone on the team was new once. Asking early saves time for everyone.

Welcome to the team.
