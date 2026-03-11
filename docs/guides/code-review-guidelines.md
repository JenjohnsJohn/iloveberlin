# Code Review Guidelines

Code review is a critical practice for maintaining code quality, sharing knowledge, and catching issues before they reach production. Every change to the ILoveBerlin codebase goes through peer review via pull requests.

---

## Table of Contents

- [Purpose of Code Review](#purpose-of-code-review)
- [Review Checklist](#review-checklist)
- [Common Issues to Check](#common-issues-to-check)
- [Approval Requirements](#approval-requirements)
- [Turnaround Time](#turnaround-time)
- [Review Etiquette](#review-etiquette)
- [How to Give Good Feedback](#how-to-give-good-feedback)
- [How to Receive Feedback](#how-to-receive-feedback)

---

## Purpose of Code Review

Code review serves four goals, in order of importance:

1. **Correctness** -- Does the code do what it claims to do? Are there edge cases or failure modes?
2. **Security** -- Does the code introduce vulnerabilities? Is user input validated and sanitized?
3. **Maintainability** -- Will the next developer understand this code in six months? Is it consistent with the rest of the codebase?
4. **Knowledge sharing** -- Reviews spread understanding of the codebase and surface better approaches.

Code review is **not** about:
- Gatekeeping or power dynamics.
- Enforcing personal preferences that are not in the coding standards.
- Catching formatting issues (that is Prettier's and ESLint's job).

---

## Review Checklist

Use this checklist when reviewing a PR. You do not need to check every item for trivial changes, but all items should be considered for feature PRs.

### Correctness

- [ ] Does the code implement the requirements described in the PR and the linked ticket?
- [ ] Are edge cases handled (empty inputs, null values, large datasets, concurrent access)?
- [ ] Does the code handle failure gracefully (network errors, database failures, invalid data)?
- [ ] Are database migrations reversible? Do they handle existing data correctly?
- [ ] Do API changes maintain backward compatibility (or is the breaking change documented)?

### Security

- [ ] Is user input validated on the server side (not just the client)?
- [ ] Are SQL queries parameterized (no string concatenation of user input)?
- [ ] Is output properly escaped to prevent XSS (React handles this by default, but check `dangerouslySetInnerHTML` usage)?
- [ ] Are authentication and authorization checks in place for protected endpoints?
- [ ] Are sensitive fields (passwords, tokens, PII) excluded from API responses and logs?
- [ ] Are file uploads validated (type, size, content)?
- [ ] Are rate limits applied to sensitive endpoints (login, registration, password reset)?

### Performance

- [ ] Are database queries efficient? Are appropriate indexes in place?
- [ ] Are N+1 query patterns avoided (use eager loading or joins where appropriate)?
- [ ] Are large lists paginated?
- [ ] Are images optimized and lazy-loaded?
- [ ] Will this change impact page load time or Core Web Vitals?
- [ ] Are expensive computations memoized or cached where appropriate?

### Readability

- [ ] Is the code easy to follow without the PR description for context?
- [ ] Are variable and function names descriptive and consistent with the codebase?
- [ ] Is the code DRY without being over-abstracted? (Duplication is better than the wrong abstraction.)
- [ ] Are complex sections commented with the *why*?
- [ ] Does the file structure follow the project conventions?

### Tests

- [ ] Are there tests for the new or changed functionality?
- [ ] Do tests cover happy paths, edge cases, and error paths?
- [ ] Are tests deterministic (no flaky tests depending on timing or external services)?
- [ ] Is test code as clean and readable as production code?
- [ ] For API changes: are integration/e2e tests updated?

### Documentation

- [ ] Are Swagger decorators updated for API changes?
- [ ] Are JSDoc comments added for new public functions and interfaces?
- [ ] Is the README or developer documentation updated if the change affects setup or workflows?
- [ ] Are new environment variables documented in `.env.example`?

---

## Common Issues to Check

These are the most frequent problems found in code reviews. Pay special attention to them.

### SQL Injection

```ts
// BAD: String interpolation in queries
const events = await this.dataSource.query(
  `SELECT * FROM events WHERE title LIKE '%${searchTerm}%'`
);

// GOOD: Parameterized query
const events = await this.dataSource.query(
  `SELECT * FROM events WHERE title LIKE $1`,
  [`%${searchTerm}%`]
);

// BEST: Use the ORM's query builder
const events = await this.eventRepository
  .createQueryBuilder('event')
  .where('event.title ILIKE :search', { search: `%${searchTerm}%` })
  .getMany();
```

### Cross-Site Scripting (XSS)

```tsx
// BAD: Rendering raw HTML from user input
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// GOOD: Use a sanitization library if raw HTML is required
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />

// BEST: Avoid raw HTML entirely -- use structured data and render components
<Comment author={comment.author} text={comment.text} />
```

### Missing Input Validation

```ts
// BAD: Trusting client input
@Post()
async create(@Body() body: any) {
  return this.service.create(body);
}

// GOOD: Validate with DTOs and class-validator
@Post()
async create(@Body() dto: CreateEventDto) {
  return this.service.create(dto);
}

// And the DTO:
export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
```

### Missing Error Handling

```ts
// BAD: Unhandled promise rejection
async function fetchEvents() {
  const res = await fetch('/api/events');
  const data = await res.json();
  return data;
}

// GOOD: Handle errors explicitly
async function fetchEvents() {
  const res = await fetch('/api/events');

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
```

### Missing Authorization Checks

```ts
// BAD: Any authenticated user can delete any event
@Delete(':id')
@UseGuards(AuthGuard)
async delete(@Param('id', ParseUUIDPipe) id: string) {
  return this.eventsService.delete(id);
}

// GOOD: Verify the user owns the event or is an admin
@Delete(':id')
@UseGuards(AuthGuard)
async delete(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: User,
) {
  const event = await this.eventsService.findOne(id);

  if (event.authorId !== user.id && user.role !== 'admin') {
    throw new ForbiddenException('You can only delete your own events');
  }

  return this.eventsService.delete(id);
}
```

### Insufficient Test Coverage

```ts
// BAD: Only testing the happy path
it('should create an event', async () => {
  const result = await service.create(validDto, mockUser);
  expect(result).toBeDefined();
});

// GOOD: Test happy path, edge cases, and errors
describe('create', () => {
  it('should create an event with valid data', async () => {
    const result = await service.create(validDto, mockUser);
    expect(result.title).toBe(validDto.title);
    expect(result.authorId).toBe(mockUser.id);
  });

  it('should throw BadRequest if title is too short', async () => {
    const shortTitleDto = { ...validDto, title: 'AB' };
    await expect(service.create(shortTitleDto, mockUser))
      .rejects.toThrow(BadRequestException);
  });

  it('should throw Conflict if slug already exists', async () => {
    repository.save.mockRejectedValueOnce({ code: '23505' });
    await expect(service.create(validDto, mockUser))
      .rejects.toThrow(ConflictException);
  });

  it('should generate a unique slug from the title', async () => {
    const result = await service.create(
      { ...validDto, title: 'Berlin Music Festival 2026' },
      mockUser,
    );
    expect(result.slug).toBe('berlin-music-festival-2026');
  });
});
```

---

## Approval Requirements

| Change Type | Minimum Approvals | Reviewer Requirements |
|---|---|---|
| Standard feature | 1 | Any team member |
| Bug fix | 1 | Any team member |
| Documentation only | 1 | Any team member |
| Security-critical changes | 2 | At least one senior developer or security reviewer |
| Infrastructure / CI changes | 2 | At least one DevOps or platform engineer |
| Database migration | 2 | At least one backend senior developer |
| API breaking changes | 2 | At least one frontend and one backend developer |
| Dependency major version upgrades | 1 | Any team member (but announce in `#dev-general` first) |
| Hotfix | 1 | Any available team member (expedited) |

### What Counts as Security-Critical?

- Authentication or authorization logic.
- Password hashing or token generation.
- Payment processing.
- PII handling or data export.
- File upload handling.
- Changes to CORS, CSP, or other security headers.
- Changes to rate limiting or abuse prevention.

---

## Turnaround Time

| Priority | Expected Response Time | When to Use |
|---|---|---|
| **Normal** | Within 24 hours (business hours) | Standard features and bug fixes |
| **Urgent** (labeled `urgent`) | Within 4 hours | Blocking other developers or time-sensitive work |
| **Hotfix** (labeled `hotfix`) | Within 1 hour | Production incidents |

### Tips for Fast Reviews

- **Keep PRs small.** A 50-line PR gets reviewed in minutes. A 500-line PR sits in the queue.
- **Write a clear PR description.** The reviewer should understand the *what* and *why* before reading a single line of code.
- **Add screenshots or recordings** for UI changes. Reviewers should not need to run the branch locally to see what changed.
- **Self-review first.** Read through your own diff before requesting review. You will catch obvious issues.

### If You Are Blocked

If your PR has not been reviewed within the expected time:

1. Post a reminder in the team Slack channel.
2. Tag a specific person in the PR.
3. Discuss in standup.

Never merge your own PR without review (except for trivial typo fixes in documentation, with team agreement).

---

## Review Etiquette

### As a Reviewer

1. **Be constructive.** The goal is to improve the code, not to demonstrate your knowledge. Frame suggestions as improvements, not criticisms.

2. **Distinguish severity.** Use these prefixes:

   | Prefix | Meaning | Blocks Merge? |
   |---|---|---|
   | `blocker:` | Must be fixed before merge. Correctness, security, or production risk. | Yes |
   | `suggestion:` | Would improve the code but is not required. | No |
   | `nit:` | Minor style or naming preference. Take it or leave it. | No |
   | `question:` | Asking for clarification. Not a change request. | No |
   | `praise:` | Calling out something well done. | No |

   Example:
   ```
   blocker: This query is vulnerable to SQL injection.
   Please use parameterized queries or the query builder.

   suggestion: Consider extracting this into a helper function
   since it is repeated in three places.

   nit: I'd name this `eventDate` instead of `date` for clarity,
   but it's fine either way.

   praise: Really clean implementation of the search debounce.
   The edge case handling is thorough.
   ```

3. **Explain the why.** Do not just say "change this." Explain *why* the change improves the code. Link to documentation if relevant.

4. **Praise good work.** If a solution is elegant, a test is thorough, or a complex problem is handled well, say so. Positive feedback is as important as constructive criticism.

5. **Review the code, not the person.** Say "this function could be simplified" not "you wrote this in a complicated way."

6. **Limit scope.** Review the changes in the PR, not the entire file. If you spot issues in surrounding code, file a separate issue or ticket.

7. **Be timely.** A review that arrives three days late has already wasted three days of the author's time and context.

### As an Author

1. **Do not take feedback personally.** Reviews are about the code, not about you. Every developer receives change requests, including senior engineers.

2. **Respond to every comment.** Even if just "Done" or "Good point, fixed." This shows the reviewer their feedback was read and considered.

3. **Explain your reasoning.** If you disagree with a suggestion, explain why. A respectful discussion often leads to a better solution than either person's original idea.

4. **Do not get defensive.** If someone found a bug, thank them. They just saved you from a production incident.

5. **Mark resolved conversations.** After addressing feedback, resolve the conversation in GitHub so the reviewer can easily see what is still open.

---

## How to Give Good Feedback

### Instead of This...

> "This is wrong."

### Say This...

> "blocker: This will throw a NullPointerException if the user has no profile photo. We should add a null check here. Something like:
> ```ts
> const avatarUrl = user.profile?.photoUrl ?? DEFAULT_AVATAR;
> ```
> "

### Instead of This...

> "Why did you do it this way?"

### Say This...

> "question: I'm curious about the approach here. Was there a specific reason to use `reduce` instead of `map` + `filter`? I find the latter easier to read, but I might be missing a performance consideration."

### Instead of This...

> (Silence on a well-written PR)

### Say This...

> "praise: This is a really solid implementation. The error handling is thorough, the tests are comprehensive, and the code reads well. Approving as-is."

---

## How to Receive Feedback

| Scenario | Good Response |
|---|---|
| Reviewer finds a genuine bug | "Good catch, thanks! Fixed in the latest push." |
| Reviewer suggests a different approach | "That's a good idea. I went with this approach because [reason], but I can see the benefit of your suggestion. Let me try it." |
| You disagree with a suggestion | "I considered that, but [reason]. What do you think? Happy to discuss." |
| Reviewer leaves a nit you disagree with | "I see your point. I'll keep it as-is for now since it matches the pattern in [other file], but I'm open to changing the convention." |
| PR has many comments | "Thanks for the thorough review. I'll work through the feedback and push updates shortly." |

---

## Automated Checks

Before a human reviews the code, CI runs automated checks. These must all pass before the PR can be merged:

| Check | What It Validates |
|---|---|
| **ESLint** | Code quality and style rules |
| **Prettier** | Consistent formatting |
| **TypeScript** | Type correctness (`tsc --noEmit`) |
| **Unit Tests** | All tests pass, no regressions |
| **E2E Tests** | Critical user flows work end-to-end |
| **Build** | The application compiles without errors |
| **Bundle Size** | No unexpected increase in client bundle size (warning, not blocking) |

If an automated check fails, fix it before requesting human review. Do not ask reviewers to "ignore the red CI."
