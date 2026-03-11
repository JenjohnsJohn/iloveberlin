# Sprint 18: Admin Panel Core

**Sprint Number:** 18
**Sprint Name:** Admin Panel Core
**Duration:** 2 weeks (10 working days)
**Dates:** Weeks 35-36 (relative to project start)
**Team Capacity:** ~160 hours (1 backend, 2 frontend, 1 QA)

---

## Sprint Goal

Build the core admin panel for ILoveBerlin, including a dashboard with real-time analytics, user management with role-based access, a content moderation queue with bulk actions, an activity logging system, and an admin settings page -- all protected by RBAC verification ensuring only authorized administrators can access panel features.

---

## User Stories

### US-18.1: Admin Dashboard Analytics
**As an** admin, **I want to** see key platform metrics at a glance **so that** I can monitor the health and growth of ILoveBerlin.

**Acceptance Criteria:**
- [ ] Dashboard displays: total users, new users (7d/30d), active users (DAU/MAU), total content items, new content (7d)
- [ ] Revenue metrics: total revenue, revenue this month, average order value, orders this month
- [ ] Engagement metrics: page views, search queries, forum posts, event RSVPs
- [ ] Moderation metrics: pending items count, flagged content count, reports this week
- [ ] Metrics are visualized with Recharts (line charts for trends, bar charts for comparisons, pie charts for distributions)
- [ ] Dashboard data refreshes every 5 minutes without full page reload
- [ ] Date range selector for historical comparison

### US-18.2: User Management
**As an** admin, **I want to** manage user accounts **so that** I can handle support requests, enforce policies, and manage roles.

**Acceptance Criteria:**
- [ ] User list with: avatar, name, email, role, status, registration date, last active
- [ ] Search users by name, email, or username
- [ ] Filter by role (user, moderator, admin, super_admin) and status (active, suspended, banned)
- [ ] View user detail: profile info, activity summary, content created, orders placed, moderation actions received
- [ ] Change user role (with confirmation dialog)
- [ ] Suspend/ban user (with reason field and duration for suspension)
- [ ] Reactivate suspended/banned users
- [ ] All role changes and moderation actions are logged

### US-18.3: Activity Logging
**As an** admin, **I want to** see an audit trail of all admin actions **so that** I can track who did what and when.

**Acceptance Criteria:**
- [ ] admin_activity_log table captures: admin user, action type, target entity, target ID, details (JSONB), IP address, timestamp
- [ ] Activity logging middleware automatically logs admin API calls
- [ ] Activity log page shows chronological list of all admin actions
- [ ] Filter by: admin user, action type, date range, target entity type
- [ ] Each log entry shows: timestamp, admin name, action description, target link
- [ ] Log entries are immutable (no edit or delete)
- [ ] Logs are retained for 1 year minimum

### US-18.4: Moderation Queue
**As a** moderator, **I want to** review flagged and reported content in a unified queue **so that** I can quickly approve or reject content.

**Acceptance Criteria:**
- [ ] Moderation queue aggregates: reported content, auto-flagged content, new content pending review
- [ ] Queue shows: content type, title/excerpt, reporter, reason, report date, priority
- [ ] Content can be previewed inline (expand to see full content)
- [ ] Actions: approve, reject (with reason), escalate to senior moderator, edit content
- [ ] Bulk actions: approve selected, reject selected
- [ ] Moderation decisions trigger notifications to content author
- [ ] Queue shows count of pending items per content type
- [ ] Auto-refresh when new items enter the queue

### US-18.5: Admin Settings
**As a** super admin, **I want to** configure platform settings **so that** I can customize the platform behavior without code changes.

**Acceptance Criteria:**
- [ ] Settings page with sections: General, Content, Notifications, Store, Integrations
- [ ] General: site name, tagline, maintenance mode toggle, default language
- [ ] Content: auto-moderation rules, content length limits, allowed file types
- [ ] Notifications: email templates selection, notification frequency defaults
- [ ] Store: currency, tax rate, shipping options, minimum order amount
- [ ] Integrations: API keys display (masked), webhook URLs, third-party service status
- [ ] Settings changes are logged in the activity log
- [ ] Settings page is restricted to super_admin role

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday) - Database & Analytics Backend
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-18.1: admin_activity_log migration | Backend | 1.5 | id, admin_user_id (FK), action_type (enum), target_entity_type, target_entity_id, details (JSONB), ip_address, user_agent, created_at |
| BE-18.2: AdminActivityLog entity and repository | Backend | 1.5 | TypeORM entity, repository with filtered queries |
| BE-18.3: Activity logging middleware | Backend | 2.5 | NestJS interceptor that logs all admin API calls, extracts action details from request/response |
| BE-18.4: Dashboard analytics service - user metrics | Backend | 2.5 | Total users, new users (7d/30d), DAU/MAU calculation, user growth trend |
| FE-18.1: Admin layout and navigation shell | Frontend 1 | 3 | Admin-specific layout with sidebar navigation, header with admin user info, responsive collapse |
| FE-18.2: RBAC route guard for admin pages | Frontend 2 | 2 | Next.js middleware to check admin/moderator role, redirect unauthorized users |

#### Day 2 (Tuesday) - Analytics Endpoints & Dashboard Start
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-18.5: Dashboard analytics - revenue metrics | Backend | 2 | Total revenue, monthly revenue, AOV, order count, revenue trend (30d) |
| BE-18.6: Dashboard analytics - engagement metrics | Backend | 2 | Page views, search queries, forum posts, event RSVPs, trending content |
| BE-18.7: Dashboard analytics - moderation metrics | Backend | 1.5 | Pending queue count, flagged content count, reports this week, resolution rate |
| BE-18.8: Dashboard analytics controller | Backend | 2 | GET /admin/dashboard/metrics, GET /admin/dashboard/trends, date range params |
| FE-18.3: Dashboard page layout | Frontend 1 | 2 | Grid layout for metric cards and charts, responsive 3-column to 1-column |
| FE-18.4: Metric card component | Frontend 1 | 1.5 | Number display, label, trend indicator (up/down arrow with percentage), icon |
| FE-18.5: Dashboard data fetching hooks | Frontend 2 | 2 | SWR hooks for dashboard metrics with 5-minute revalidation |

#### Day 3 (Wednesday) - Dashboard Charts & User Management Backend
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-18.9: User management endpoints | Backend | 3 | GET /admin/users (paginated, filterable, searchable), GET /admin/users/:id (detail with activity) |
| BE-18.10: User moderation endpoints | Backend | 2 | PATCH /admin/users/:id/role, POST /admin/users/:id/suspend, POST /admin/users/:id/ban, POST /admin/users/:id/reactivate |
| BE-18.11: Analytics aggregation cron job | Backend | 2.5 | BullMQ scheduled job to pre-compute dashboard metrics hourly, store in Redis for fast retrieval |
| FE-18.6: User growth line chart (Recharts) | Frontend 1 | 2 | 30-day trend line, tooltip with exact values, responsive |
| FE-18.7: Revenue bar chart (Recharts) | Frontend 2 | 2 | Monthly revenue bars, current month highlighted, tooltip |
| FE-18.8: Content distribution pie chart (Recharts) | Frontend 2 | 1.5 | Articles, events, places, listings, products breakdown |

#### Day 4 (Thursday) - User Management Frontend
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-18.9: User management page layout | Frontend 1 | 1.5 | Search bar, filter dropdowns, user table, pagination |
| FE-18.10: User table component | Frontend 1 | 3 | Sortable columns (name, email, role, status, last active), row actions dropdown |
| FE-18.11: User search and filter | Frontend 2 | 2 | Debounced search, role filter, status filter, URL param sync |
| FE-18.12: User detail modal/drawer | Frontend 2 | 3 | Profile info, activity summary tabs (content, orders, moderation), action buttons |
| FE-18.13: Role change dialog | Frontend 1 | 1.5 | Role selector, confirmation step, reason field, success/error feedback |
| FE-18.14: Suspend/ban user dialog | Frontend 2 | 1.5 | Reason field, duration selector (for suspend), confirmation, success/error feedback |

#### Day 5 (Friday) - Moderation Queue Backend & Frontend Start
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-18.12: Moderation queue aggregate endpoint | Backend | 3 | GET /admin/moderation/queue, aggregate reports from all content types, sort by priority/date |
| BE-18.13: Moderation action endpoints | Backend | 2.5 | POST /admin/moderation/:id/approve, POST /admin/moderation/:id/reject, POST /admin/moderation/bulk |
| BE-18.14: Moderation notification triggers | Backend | 2 | Send notification to content author on approve/reject, via existing notification system |
| FE-18.15: Moderation queue page layout | Frontend 1 | 2 | Filter bar, content type tabs, queue list, pending count badges |
| FE-18.16: Moderation queue item component | Frontend 2 | 2.5 | Content preview, reporter info, reason, action buttons (approve/reject/escalate) |
| QA-18.1: Dashboard analytics data accuracy testing | QA | 3 | Verify metric calculations match database queries, trend data accuracy |

### Week 2 (Days 6-10)

#### Day 6 (Monday) - Moderation Queue Completion
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-18.17: Moderation content preview inline expansion | Frontend 1 | 2.5 | Expandable row showing full content (article text, image, forum post), media preview |
| FE-18.18: Bulk moderation actions | Frontend 1 | 2 | Checkbox selection, bulk action bar (approve all, reject all), confirmation dialog |
| FE-18.19: Rejection reason dialog | Frontend 2 | 1.5 | Predefined reasons dropdown + custom text, reason attached to notification |
| FE-18.20: Moderation queue auto-refresh | Frontend 2 | 1.5 | Poll for new items every 30 seconds, show "X new items" banner, animate new entries |
| BE-18.15: Bulk moderation service | Backend | 2.5 | Process bulk approve/reject with transaction, emit notifications, log activities |
| QA-18.2: User management testing | QA | 3 | Search, filter, role change, suspend, ban, reactivate flows |

#### Day 7 (Tuesday) - Activity Log
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-18.16: Activity log query service | Backend | 2 | Paginated queries with filters (admin, action type, date range, entity type), full-text search on details |
| BE-18.17: Activity log controller | Backend | 1.5 | GET /admin/activity-log, query params for filters |
| FE-18.21: Activity log page layout | Frontend 1 | 1.5 | Timeline view, filter sidebar, search bar |
| FE-18.22: Activity log entry component | Frontend 1 | 2 | Timestamp, admin avatar+name, action description, target link, details expandable |
| FE-18.23: Activity log filters | Frontend 2 | 2 | Admin user dropdown, action type dropdown, date range picker, entity type dropdown |
| FE-18.24: Activity log pagination and infinite scroll | Frontend 2 | 1.5 | Load more on scroll, loading indicator, URL param sync |
| QA-18.3: Moderation queue testing | QA | 3 | Approve/reject single, bulk actions, escalation, notification delivery |

#### Day 8 (Wednesday) - Admin Settings
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-18.18: Admin settings CRUD service | Backend | 2.5 | Key-value settings store, typed retrieval, default values, validation |
| BE-18.19: Admin settings controller | Backend | 1.5 | GET /admin/settings, PATCH /admin/settings, super_admin guard |
| FE-18.25: Admin settings page layout | Frontend 1 | 1.5 | Tab sections (General, Content, Notifications, Store, Integrations) |
| FE-18.26: General settings section | Frontend 1 | 2 | Site name, tagline, maintenance mode toggle, default language selector |
| FE-18.27: Content settings section | Frontend 2 | 2 | Auto-moderation toggle, content length limits, allowed file types checkboxes |
| FE-18.28: Store settings section | Frontend 2 | 2 | Currency selector, tax rate input, shipping options, minimum order amount |
| FE-18.29: Settings save with confirmation | Frontend 1 | 1.5 | Save button with unsaved changes indicator, confirmation dialog, success toast |

#### Day 9 (Thursday) - RBAC Verification & Integration Testing
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| BE-18.20: RBAC endpoint audit | Backend | 2 | Verify all admin endpoints have proper role guards (admin, moderator, super_admin) |
| BE-18.21: RBAC integration tests | Backend | 3 | Test each endpoint with user, moderator, admin, super_admin roles; verify 403 for unauthorized |
| FE-18.30: Notification settings section | Frontend 1 | 1.5 | Email template selection, default notification frequency |
| FE-18.31: Integrations settings section | Frontend 2 | 2 | API key display (masked with reveal toggle), webhook URLs, service status indicators |
| FE-18.32: Admin panel navigation polish | Frontend 1 | 1.5 | Active state highlighting, breadcrumbs, collapsed sidebar icons |
| FE-18.33: Admin panel loading states | Frontend 2 | 1.5 | Skeleton loaders for tables, charts, and settings forms |
| QA-18.4: Activity log testing | QA | 2 | Verify all admin actions are logged, filter functionality, search, log immutability |
| QA-18.5: RBAC verification testing | QA | 3 | Test each page/action with different roles, verify access denied appropriately |

#### Day 10 (Friday) - Polish & Final Testing
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-18.34: Admin panel responsive design | Frontend 1 | 2 | Sidebar collapse on mobile, table horizontal scroll, chart resize |
| FE-18.35: Admin panel dark mode support | Frontend 1 | 2 | Dark mode toggle, Recharts dark theme, table dark styles |
| FE-18.36: Admin panel keyboard shortcuts | Frontend 2 | 1.5 | G+D = dashboard, G+U = users, G+M = moderation, G+A = activity log |
| FE-18.37: Admin panel E2E tests | Frontend 2 | 2.5 | Dashboard load, user search, moderation approve/reject, settings save |
| QA-18.6: Admin settings testing | QA | 2 | Save/retrieve settings, super_admin restriction, validation |
| QA-18.7: Full admin panel regression | QA | 3 | End-to-end flows across all admin pages, role-based access, data accuracy |

---

## Backend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| BE-18.1-18.3 | Activity logging infrastructure | Migration, entity, middleware | 5.5 |
| BE-18.4-18.8 | Dashboard analytics | User/revenue/engagement/moderation metrics, controller | 10 |
| BE-18.9-18.11 | User management | List/detail endpoints, moderation actions, analytics cron | 7.5 |
| BE-18.12-18.15 | Moderation queue | Aggregate endpoint, action endpoints, notifications, bulk processing | 10 |
| BE-18.16-18.17 | Activity log queries | Service with filters, controller | 3.5 |
| BE-18.18-18.19 | Admin settings | CRUD service, controller | 4 |
| BE-18.20-18.21 | RBAC verification | Endpoint audit, integration tests | 5 |
| **Total** | | | **45.5** |

## Frontend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| FE-18.1-18.2 | Admin shell | Layout, navigation, RBAC guard | 5 |
| FE-18.3-18.8 | Dashboard | Layout, metric cards, charts (line, bar, pie), data hooks | 11 |
| FE-18.9-18.14 | User management | Page layout, table, search/filter, detail modal, role/suspend dialogs | 13 |
| FE-18.15-18.20 | Moderation queue | Page layout, item component, preview, bulk actions, rejection dialog, auto-refresh | 12 |
| FE-18.21-18.24 | Activity log | Page layout, entry component, filters, pagination | 7 |
| FE-18.25-18.31 | Admin settings | Layout, 5 sections, save logic, integrations display | 12.5 |
| FE-18.32-18.37 | Polish & testing | Navigation, loading states, responsive, dark mode, shortcuts, E2E | 11.5 |
| **Total** | | | **72** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---------|------|---------------|-------------|
| QA-18.1 | Dashboard analytics | Metric accuracy vs DB, trend data, chart rendering, date range filter | 3 |
| QA-18.2 | User management | User search, role filter, role change (valid/invalid), suspend/ban/reactivate | 3 |
| QA-18.3 | Moderation queue | Single approve/reject, bulk approve/reject, escalation, author notification | 3 |
| QA-18.4 | Activity log | All admin actions logged, filter combinations, search, immutability | 2 |
| QA-18.5 | RBAC verification | User role: denied access. Moderator: queue access only. Admin: full access. Super admin: settings access | 3 |
| QA-18.6 | Admin settings | Save settings, load settings, validation errors, super_admin restriction | 2 |
| QA-18.7 | Full regression | Cross-page navigation, data consistency, responsive design, dark mode | 3 |
| **Total** | | | **19** |

---

## Dependencies

```
BE-18.1-18.3 (activity log infra) --> All other admin endpoints (logging middleware)
BE-18.4-18.8 (analytics endpoints) --> FE-18.3-18.8 (dashboard UI)
BE-18.9-18.10 (user management endpoints) --> FE-18.9-18.14 (user management UI)
BE-18.12-18.13 (moderation endpoints) --> FE-18.15-18.20 (moderation queue UI)
BE-18.16-18.17 (activity log endpoints) --> FE-18.21-18.24 (activity log UI)
BE-18.18-18.19 (settings endpoints) --> FE-18.25-18.31 (settings UI)
FE-18.1-18.2 (admin shell + RBAC) --> All admin pages
Sprint 17 search --> Moderation queue (uses indexed content)
Existing notification system --> BE-18.14 (moderation notifications)
Existing user module --> BE-18.9-18.10 (user management)
BE-18.11 (analytics cron) --> FE-18.3-18.8 (fast dashboard loading)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Analytics queries slow on large datasets | High | Medium | Pre-compute metrics via cron job (BE-18.11); use Redis caching |
| Moderation queue aggregation complex across content types | Medium | Medium | Start with standardized report/flag schema; abstract content type differences |
| RBAC gaps allowing unauthorized access | Medium | High | Dedicated RBAC audit task; automated tests for every endpoint |
| Recharts performance with large datasets | Low | Medium | Limit chart data points; use downsampled data for trends |
| Activity log storage growth | Low | Medium | Implement log rotation policy; archive logs older than 1 year |
| Admin settings cache invalidation | Medium | Medium | Clear Redis cache on settings update; use short TTL |
| Dark mode inconsistencies with Recharts | Medium | Low | Test dark mode early; define Recharts theme variables upfront |

---

## Deliverables Checklist

- [ ] admin_activity_log table created and migrated
- [ ] Activity logging middleware capturing all admin API calls
- [ ] Dashboard analytics endpoints returning accurate metrics
- [ ] Analytics aggregation cron job running hourly
- [ ] Admin dashboard page with metric cards and Recharts visualizations
- [ ] User management page with search, filter, and role management
- [ ] User suspend/ban/reactivate functionality with logging
- [ ] Moderation queue page aggregating reports from all content types
- [ ] Bulk moderation actions (approve/reject multiple items)
- [ ] Activity log page with timeline view and filters
- [ ] Admin settings page with 5 configuration sections
- [ ] RBAC verified on all admin endpoints
- [ ] All admin actions logged in the activity log
- [ ] Admin panel responsive design (desktop and tablet)
- [ ] E2E tests for critical admin flows

---

## Definition of Done

1. admin_activity_log table captures all admin actions with correct metadata
2. Dashboard metrics are accurate and match direct database queries (within 1-hour freshness)
3. Dashboard charts render correctly with real data
4. User management search returns results within 500ms
5. Role changes and moderation actions are immediately reflected and logged
6. Moderation queue shows all pending items from all content types
7. Bulk moderation processes up to 50 items in a single transaction
8. Activity log displays chronological admin actions with filter support
9. Admin settings persist across sessions and are restricted to super_admin
10. All admin endpoints return 403 for unauthorized roles
11. Admin panel renders correctly on desktop (1440px) and tablet (768px)
12. E2E tests pass for dashboard, user management, moderation, and settings
13. No admin action can be performed without corresponding activity log entry
14. Code reviewed and approved by at least one other developer

---

## Sprint Review Demo Script

1. **Admin Panel Overview** (2 min)
   - Navigate to admin panel, show sidebar navigation
   - Point out RBAC: login as different roles, show access differences

2. **Dashboard** (5 min)
   - Show metric cards: total users, revenue, content count, pending moderation
   - Walk through Recharts: user growth line chart, revenue bar chart, content pie chart
   - Change date range, show metrics update
   - Show auto-refresh (wait or force refresh)

3. **User Management** (5 min)
   - Search for a user by name
   - Filter by role (show moderators only)
   - Open user detail, show activity summary
   - Change a user's role from user to moderator
   - Suspend a test user with a reason
   - Show the activity log entry created

4. **Moderation Queue** (5 min)
   - Show queue with pending items from different content types
   - Expand an item to preview content inline
   - Approve a single item
   - Select multiple items, perform bulk reject with reason
   - Show notification sent to content author

5. **Activity Log** (3 min)
   - Show the timeline of all admin actions performed during the demo
   - Filter by admin user
   - Filter by action type (role_change)
   - Show details expansion

6. **Admin Settings** (3 min)
   - Navigate to settings (as super_admin)
   - Change a setting, show unsaved changes indicator
   - Save with confirmation dialog
   - Show setting change logged in activity log
   - Switch to admin role, show settings page restricted

7. **Dark Mode** (1 min)
   - Toggle dark mode, show all pages render correctly

---

## Rollover Criteria

Tasks may roll over to Sprint 19 if:
- Analytics aggregation complexity exceeds estimate by more than 6 hours
- Moderation queue integration with all content types requires refactoring existing modules
- Recharts customization takes more than 4 additional hours beyond estimate

Tasks that MUST complete in this sprint (no rollover):
- Activity logging infrastructure (migration, entity, middleware)
- Dashboard with at least user and content metrics
- User management page with search and role change
- Basic moderation queue (single item approve/reject)
- RBAC verification on all admin endpoints

Deprioritized if time is short:
- Dark mode support
- Admin panel keyboard shortcuts
- Analytics aggregation cron (use direct queries instead)
- Integrations settings section
- Auto-refresh on moderation queue
