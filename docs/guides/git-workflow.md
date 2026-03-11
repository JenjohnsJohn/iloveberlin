# Git Workflow

This document defines how the ILoveBerlin team uses Git for version control, branching, commits, pull requests, and releases. We follow a **trunk-based development** model with short-lived feature branches.

---

## Table of Contents

- [Branch Strategy](#branch-strategy)
- [Branch Naming](#branch-naming)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Merge Strategy](#merge-strategy)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)

---

## Branch Strategy

We use **trunk-based development** with a single long-lived branch:

- **`main`** -- The production branch. Always deployable. Protected with required reviews and passing CI.

All work happens on short-lived feature branches created from `main` and merged back into `main` via pull request. Branches should live no longer than a few days. If a feature takes longer, break it into smaller incremental PRs.

```
main ─────●─────●─────●─────●─────●─────●──────
           \   /       \   /       \   /
            ●─●         ●─●         ●
         feature/     feature/     bugfix/
         FR-42-...    FR-55-...    BUG-78-...
```

### Protected Branch Rules (main)

- Require at least 1 approving review.
- Require all CI checks to pass (lint, test, build).
- Require branch to be up to date with `main` before merging.
- No direct pushes -- all changes go through PRs.
- No force pushes.

---

## Branch Naming

Branch names follow this format:

```
<type>/<ticket>-<short-description>
```

### Types

| Type | Use When | Example |
|---|---|---|
| `feature/` | New feature or enhancement | `feature/FR-42-event-search-filters` |
| `bugfix/` | Bug fix | `bugfix/BUG-78-fix-date-picker-timezone` |
| `hotfix/` | Urgent production fix | `hotfix/fix-login-crash` |
| `chore/` | Tooling, dependencies, CI changes | `chore/upgrade-nestjs-10` |
| `docs/` | Documentation only | `docs/update-api-swagger` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/FR-90-extract-search-service` |
| `test/` | Adding or fixing tests | `test/add-event-service-unit-tests` |

### Rules

- Use the Jira/Linear/GitHub issue ticket ID when one exists (e.g., `FR-42`, `BUG-78`).
- Use **kebab-case** for the description portion.
- Keep descriptions short but descriptive (3-5 words).
- Hotfix branches may omit the ticket ID for speed.

### Examples

```bash
# Good
git checkout -b feature/FR-42-event-search-filters
git checkout -b bugfix/BUG-78-fix-date-picker-timezone
git checkout -b hotfix/fix-auth-token-expiry
git checkout -b chore/upgrade-nextjs-14
git checkout -b docs/add-onboarding-guide

# Bad
git checkout -b my-feature          # no type, no ticket, not descriptive
git checkout -b feature/stuff       # not descriptive
git checkout -b Feature/FR-42       # wrong case
```

---

## Commit Message Format

We follow the **Conventional Commits** specification (v1.0.0).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|---|---|---|
| `feat` | New feature or user-facing change | `feat(events): add date range filter` |
| `fix` | Bug fix | `fix(auth): resolve token refresh loop` |
| `docs` | Documentation only | `docs(api): update Swagger descriptions` |
| `style` | Code style (formatting, missing semicolons) -- no logic change | `style(web): fix Prettier formatting` |
| `refactor` | Code change that neither fixes a bug nor adds a feature | `refactor(search): extract query builder` |
| `test` | Adding or correcting tests | `test(events): add service unit tests` |
| `chore` | Build, CI, dependency changes | `chore(deps): upgrade TypeORM to 0.3.20` |
| `perf` | Performance improvement | `perf(api): add database index on events.date` |
| `ci` | CI/CD changes | `ci: add Flutter build to GitHub Actions` |
| `revert` | Revert a previous commit | `revert: feat(events): add date range filter` |

### Scope

The scope is optional but encouraged. Use the module or area of the codebase:

- `auth`, `events`, `articles`, `restaurants`, `users`, `search`, `media`
- `web`, `api`, `mobile`, `shared`
- `deps`, `ci`, `docker`

### Description

- Use the **imperative mood** ("add", "fix", "update", not "added", "fixed", "updated").
- Do **not** capitalize the first letter.
- Do **not** end with a period.
- Keep it under 72 characters.

### Body (Optional)

For complex changes, add a body after a blank line. Explain the *why*, not the *what*. Wrap at 72 characters.

### Footer (Optional)

- **Breaking changes:** `BREAKING CHANGE: <description>` (triggers a major version bump).
- **Issue references:** `Closes #42`, `Fixes BUG-78`, `Refs FR-42`.

### Examples

```bash
# Simple feature
git commit -m "feat(events): add neighborhood filter to event search"

# Bug fix with body
git commit -m "fix(auth): prevent infinite redirect on expired tokens

The refresh token endpoint was returning a 302 instead of a 401 when
the refresh token itself had expired. This caused the client to loop
between the login page and the token refresh endpoint.

Fixes BUG-78"

# Breaking change
git commit -m "feat(api)!: change event date field from string to ISO timestamp

BREAKING CHANGE: The 'date' field in event responses is now an ISO 8601
timestamp instead of a formatted string. All API consumers must update
their date parsing logic.

Refs FR-101"

# Chore
git commit -m "chore(deps): upgrade Next.js from 14.1 to 14.2"
```

---

## Pull Request Process

### 1. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/FR-42-event-search-filters
```

### 2. Implement the Change

- Make focused, incremental commits following the conventional commits format.
- Keep the PR small. Aim for under 400 lines of changed code. Split large features into multiple PRs.
- Write or update tests for the changes.
- Update documentation if the change affects APIs, configuration, or developer workflows.

### 3. Push and Open a PR

```bash
git push -u origin feature/FR-42-event-search-filters
```

Open a PR on GitHub. Use this template:

```markdown
## Summary

Brief description of what this PR does and why.

- Bullet point of key change 1
- Bullet point of key change 2

## Ticket

Closes FR-42

## Type of Change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Chore / Dependencies

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed

## Screenshots (if UI change)

| Before | After |
|--------|-------|
| screenshot | screenshot |

## Checklist

- [ ] Code follows the project coding standards
- [ ] Self-review completed
- [ ] No new warnings in lint or build
- [ ] PR title follows conventional commits format
```

### 4. Code Review

- Assign at least one reviewer.
- Respond to review feedback promptly.
- Push fixes as new commits (do not force-push during review -- it destroys review context).
- Re-request review after addressing feedback.

### 5. Merge

Once approved and CI passes:

1. Ensure the branch is up to date with `main` (use "Update branch" on GitHub or rebase locally).
2. Use **Squash and merge** (see [Merge Strategy](#merge-strategy)).
3. Delete the branch after merging.

---

## Merge Strategy

We use **squash merge** for all PRs into `main`.

### Why Squash Merge?

- Produces a **clean, linear history** on `main`.
- Each commit on `main` corresponds to one complete, reviewed change.
- Messy intermediate commits (WIP, fixup, review fixes) are collapsed.

### How It Works

1. GitHub "Squash and merge" combines all commits in the PR into a single commit.
2. The squash commit message should be the PR title (which follows conventional commits format).
3. The squash commit body should include the PR number and a brief summary.

### Example

A PR with these commits:

```
feat(events): add date range filter
fix: handle empty date range
style: fix linting
test: add filter tests
```

Gets squashed into:

```
feat(events): add date range filter to event search (#42)

Added start and end date inputs to the event filter bar.
The API now accepts `dateFrom` and `dateTo` query parameters.

Closes FR-42
```

### Branch Settings

Configure the GitHub repository to:
- Allow squash merging: **Yes**
- Allow merge commits: **No**
- Allow rebase merging: **No**
- Automatically delete head branches: **Yes**

---

## Release Process

We use **semantic versioning** (semver) and tag releases on `main`.

### Version Format

```
v<major>.<minor>.<patch>
```

- **Major** (v2.0.0): Breaking changes to the public API.
- **Minor** (v1.3.0): New features, backward-compatible.
- **Patch** (v1.2.4): Bug fixes, backward-compatible.

### Creating a Release

1. Ensure `main` is in a releasable state (all CI green, QA approved).
2. Determine the version bump based on commits since the last tag:
   - Any `feat` commit with `BREAKING CHANGE` footer: **major**
   - Any `feat` commit: **minor**
   - Only `fix`, `perf`, `refactor`, etc.: **patch**
3. Create and push a tag:

   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.3.0 -m "Release v1.3.0"
   git push origin v1.3.0
   ```

4. GitHub Actions builds and deploys the tagged commit.
5. Create a GitHub Release from the tag with auto-generated release notes.

### Changelog

Release notes are generated automatically from conventional commit messages using the GitHub "Generate release notes" feature. Each commit type maps to a section:

- **Features** (`feat`)
- **Bug Fixes** (`fix`)
- **Performance** (`perf`)
- **Other** (`refactor`, `chore`, `docs`, etc.)

---

## Hotfix Process

For urgent production issues that cannot wait for the normal PR cycle:

1. **Create a hotfix branch** from the latest tag (or `main`):

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/fix-critical-auth-bug
   ```

2. **Implement the minimal fix.** Keep the change as small as possible.

3. **Open a PR** with the `hotfix` label. Request an expedited review.

4. **Merge immediately** once one reviewer approves (two are not required for hotfixes). CI must still pass.

5. **Tag a patch release** immediately after merge:

   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.2.5 -m "Hotfix: fix critical auth bug"
   git push origin v1.2.5
   ```

6. **Post-mortem:** After the hotfix is deployed, write a brief incident report and create follow-up tickets for any additional hardening needed.

---

## Quick Reference

```bash
# Start new work
git checkout main && git pull
git checkout -b feature/FR-42-event-search-filters

# Commit
git add -p                    # stage interactively
git commit -m "feat(events): add date range filter"

# Stay up to date
git fetch origin
git rebase origin/main        # keep branch linear

# Push
git push -u origin feature/FR-42-event-search-filters

# After PR is merged
git checkout main && git pull
git branch -d feature/FR-42-event-search-filters
```
