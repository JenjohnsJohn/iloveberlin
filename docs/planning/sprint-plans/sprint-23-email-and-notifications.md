# Sprint 23: Email & Push Notifications

## Sprint Overview

| Field | Detail |
|---|---|
| **Sprint Number** | 23 |
| **Sprint Name** | Email & Push Notifications |
| **Duration** | 2 weeks (10 working days) |
| **Start Date** | Week 45 (Day 221) |
| **End Date** | Week 46 (Day 230) |
| **Phase** | Phase 4 -- Mobile & Notifications |

## Sprint Goal

Build the complete notification infrastructure for iloveberlin.biz -- transactional email delivery via Brevo with queued processing, push notifications via Firebase Cloud Messaging for the Flutter app, user preference management, newsletter subscription with double opt-in, and frontend interfaces for managing notification settings -- enabling the platform to communicate with users through email and push channels reliably and in compliance with GDPR.

---

## User Stories

### US-23-01: Brevo API Integration and Email Templates
**As a** platform operator,
**I want to** send transactional emails through Brevo with professional templates,
**so that** users receive polished, reliable communications.

**Acceptance Criteria:**
- [ ] Brevo API client integrated in NestJS with API key stored in environment variables
- [ ] Email service abstraction layer allowing future provider swap
- [ ] Welcome email template: logo, greeting, getting-started CTA
- [ ] Password reset email template: reset link with 1-hour expiry, security notice
- [ ] Competition winner email template: congratulations, prize details, claim instructions
- [ ] Order confirmation email template: order summary, payment details, receipt
- [ ] Listing approved email template: listing title, link to live listing, next steps
- [ ] Listing rejected email template: listing title, rejection reason, resubmit instructions
- [ ] All templates are responsive (mobile-friendly) and include unsubscribe footer
- [ ] Template previews available in Brevo dashboard

### US-23-02: Email Queue with BullMQ
**As a** system,
**I want to** process email sending asynchronously through a job queue,
**so that** API responses are not blocked by email delivery and failed sends are retried.

**Acceptance Criteria:**
- [ ] BullMQ queue named `email` configured with Redis connection
- [ ] Email jobs contain: recipient, template ID, template variables, priority
- [ ] Worker processes emails with concurrency of 5
- [ ] Failed jobs retry 3 times with exponential backoff (1min, 5min, 15min)
- [ ] Dead letter queue for jobs that fail all retries
- [ ] Job completion and failure events logged
- [ ] Admin endpoint to view queue status (pending, active, failed counts)
- [ ] Queue dashboard accessible via Bull Board at `/admin/queues`

### US-23-03: Firebase Admin SDK and Push Notification Triggers
**As a** mobile app user,
**I want to** receive timely push notifications about new content and my activities,
**so that** I stay engaged with the platform.

**Acceptance Criteria:**
- [ ] Firebase Admin SDK initialized in NestJS with service account credentials
- [ ] Push notification service with methods for: single device, topic broadcast, multicast
- [ ] Trigger: new article published -> notify subscribers of the article's category
- [ ] Trigger: competition deadline in 24 hours -> notify users who have not yet entered
- [ ] Trigger: event reminder 1 day before -> notify users who favorited the event
- [ ] Trigger: classified listing approved -> notify the listing owner
- [ ] Each notification includes: title, body, data payload (content type, content ID for deep linking)
- [ ] Notifications respect user preferences (do not send if user disabled the category)
- [ ] Rate limiting: maximum 5 push notifications per user per day

### US-23-04: Notification Preferences Table and Endpoints
**As a** user,
**I want to** control which notifications I receive,
**so that** I only get messages I care about.

**Acceptance Criteria:**
- [ ] `notification_preferences` table: user_id, channel (email/push), category (articles, events, competitions, classifieds, newsletter, marketing), enabled (boolean), updated_at
- [ ] Default preferences created on user registration (all enabled except marketing)
- [ ] GET `/api/notifications/preferences` returns current user's preferences
- [ ] PATCH `/api/notifications/preferences` updates one or more preference categories
- [ ] Preferences checked before every notification send
- [ ] API validates that channel and category values are from allowed enums

### US-23-05: Newsletter Subscription with Double Opt-In
**As a** visitor,
**I want to** subscribe to the ILoveBerlin newsletter with confirmation,
**so that** I receive regular Berlin content updates and the platform complies with GDPR.

**Acceptance Criteria:**
- [ ] `newsletter_subscribers` table: id, email, status (pending/confirmed/unsubscribed), token, confirmed_at, unsubscribed_at, created_at
- [ ] POST `/api/newsletter/subscribe` accepts email, creates pending record, sends confirmation email
- [ ] Confirmation email contains a unique token link valid for 48 hours
- [ ] GET `/api/newsletter/confirm/:token` sets status to confirmed
- [ ] Duplicate email submission returns success (idempotent) but does not resend if already confirmed
- [ ] Unsubscribe link in every newsletter email
- [ ] GET `/api/newsletter/unsubscribe/:token` sets status to unsubscribed
- [ ] Brevo contact list synced: confirmed subscribers added, unsubscribed removed

### US-23-06: Topic Management
**As a** user,
**I want to** subscribe to specific notification topics (e.g., food, nightlife, culture),
**so that** I receive only the content categories I am interested in.

**Acceptance Criteria:**
- [ ] `notification_topics` table: id, name, slug, description
- [ ] `user_topic_subscriptions` table: user_id, topic_id, subscribed_at
- [ ] GET `/api/notifications/topics` returns all available topics
- [ ] POST `/api/notifications/topics/:id/subscribe` subscribes user to a topic
- [ ] DELETE `/api/notifications/topics/:id/subscribe` unsubscribes user from a topic
- [ ] Firebase topic subscription managed server-side (subscribe/unsubscribe device token to FCM topic)
- [ ] Topic subscriptions reflected in notification preference checks

### US-23-07: Frontend Notification Preferences Page
**As a** user on the web,
**I want to** manage my notification preferences from my account settings,
**so that** I can control my email and push notification settings.

**Acceptance Criteria:**
- [ ] Notification preferences page at `/account/notifications`
- [ ] Toggle switches for each category grouped by channel (email, push)
- [ ] Topic subscription checkboxes for content categories
- [ ] Newsletter subscription toggle
- [ ] Changes saved via API with optimistic UI update and success toast
- [ ] Page loads current preferences from API on mount

### US-23-08: Email Unsubscribe Page
**As an** email recipient,
**I want to** unsubscribe from emails by clicking a link,
**so that** I can stop receiving unwanted emails easily.

**Acceptance Criteria:**
- [ ] Unsubscribe page at `/unsubscribe` accepts token query parameter
- [ ] Page shows confirmation message: "You have been unsubscribed from [category]"
- [ ] Option to unsubscribe from all emails or just the specific category
- [ ] Re-subscribe link shown after unsubscribing
- [ ] Invalid or expired token shows appropriate error message
- [ ] Unsubscribe action is immediate (no additional confirmation required per GDPR)

### US-23-09: Flutter Push Notification Handling
**As a** mobile app user,
**I want to** receive and interact with push notifications on my device,
**so that** I can navigate directly to relevant content.

**Acceptance Criteria:**
- [ ] firebase_messaging package integrated in Flutter app
- [ ] FCM device token obtained on app launch and sent to backend via POST `/api/devices`
- [ ] Token refresh handler updates the backend
- [ ] Foreground notifications displayed as in-app banner (overlay or local notification)
- [ ] Background notifications handled by system tray
- [ ] Tapping a notification navigates to the correct detail screen based on data payload
- [ ] Notification permission requested on first launch with explanation dialog
- [ ] iOS: APNs configuration and entitlements set up
- [ ] Android: notification channel configured with appropriate importance level

---

## Day-by-Day Task Breakdown

### Week 1 (Days 221-225)

#### Day 1 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-01 | Install and configure Brevo Node.js SDK in NestJS | Backend | 2 | -- |
| T23-02 | Create EmailService abstraction (interface + Brevo implementation) | Backend | 3 | T23-01 |
| T23-03 | Design welcome email template in Brevo dashboard | Backend | 2 | T23-01 |
| T23-04 | Design password reset email template in Brevo dashboard | Backend | 2 | T23-01 |
| T23-05 | Create `notification_preferences` database migration | Backend | 1 | -- |

#### Day 2 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-06 | Design competition winner email template | Backend | 1.5 | T23-01 |
| T23-07 | Design order confirmation email template | Backend | 2 | T23-01 |
| T23-08 | Design listing approved email template | Backend | 1 | T23-01 |
| T23-09 | Design listing rejected email template | Backend | 1 | T23-01 |
| T23-10 | Add unsubscribe footer and mobile-responsive styling to all templates | Backend | 2 | T23-03 through T23-09 |
| T23-11 | Hook welcome email into user registration flow | Backend | 1.5 | T23-02, T23-03 |
| T23-12 | Hook password reset email into auth flow | Backend | 1 | T23-02, T23-04 |

#### Day 3 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-13 | Set up BullMQ email queue with Redis connection | Backend | 2 | -- |
| T23-14 | Create email queue producer: enqueue method in EmailService | Backend | 2 | T23-13, T23-02 |
| T23-15 | Create email queue worker: process jobs, call Brevo API | Backend | 3 | T23-13, T23-02 |
| T23-16 | Configure retry logic: 3 retries, exponential backoff | Backend | 1 | T23-15 |
| T23-17 | Set up dead letter queue and failure logging | Backend | 1.5 | T23-15 |
| T23-18 | Install Bull Board and mount at `/admin/queues` | Backend | 1 | T23-13 |

#### Day 4 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-19 | Initialize Firebase Admin SDK in NestJS (service account credentials) | Backend | 2 | -- |
| T23-20 | Create PushNotificationService: sendToDevice, sendToTopic, sendMulticast | Backend | 3 | T23-19 |
| T23-21 | Create `notification_preferences` entity, repository, and CRUD service | Backend | 3 | T23-05 |
| T23-22 | Create GET/PATCH `/api/notifications/preferences` endpoints | Backend | 2 | T23-21 |

#### Day 5 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-23 | Push trigger: new article published -> notify category subscribers | Backend | 2 | T23-20, T23-21 |
| T23-24 | Push trigger: competition deadline 24h -> notify non-entered users | Backend | 2 | T23-20 |
| T23-25 | Push trigger: event reminder 1 day before -> notify favorited users | Backend | 2 | T23-20 |
| T23-26 | Push trigger: listing approved -> notify owner | Backend | 1.5 | T23-20 |
| T23-27 | Add preference check before all notification sends | Backend | 1.5 | T23-21, T23-23 through T23-26 |
| T23-28 | Add rate limiting: max 5 push per user per day | Backend | 1.5 | T23-20 |

### Week 2 (Days 226-230)

#### Day 6 (Monday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-29 | Create `newsletter_subscribers` migration and entity | Backend | 1.5 | -- |
| T23-30 | POST `/api/newsletter/subscribe`: create pending record, send confirmation | Backend | 2.5 | T23-29, T23-14 |
| T23-31 | GET `/api/newsletter/confirm/:token`: confirm subscription | Backend | 1.5 | T23-29 |
| T23-32 | GET `/api/newsletter/unsubscribe/:token`: unsubscribe | Backend | 1.5 | T23-29 |
| T23-33 | Design newsletter confirmation email template | Backend | 1.5 | T23-01 |
| T23-34 | Brevo contact list sync: add confirmed, remove unsubscribed | Backend | 2 | T23-31, T23-32 |

#### Day 7 (Tuesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-35 | Create `notification_topics` and `user_topic_subscriptions` migrations | Backend | 1.5 | -- |
| T23-36 | Topics CRUD: GET `/api/notifications/topics`, POST/DELETE subscribe | Backend | 3 | T23-35 |
| T23-37 | FCM topic subscription: manage device token subscription server-side | Backend | 2 | T23-36, T23-19 |
| T23-38 | Create POST `/api/devices` endpoint for FCM token registration | Backend | 2 | T23-19 |
| T23-39 | Default preferences creation on user registration | Backend | 1.5 | T23-21 |

#### Day 8 (Wednesday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-40 | Frontend: notification preferences page layout (`/account/notifications`) | Frontend | 4 | T23-22 |
| T23-41 | Frontend: toggle switches for email/push categories, topic checkboxes | Frontend | 3 | T23-40, T23-36 |
| T23-42 | Frontend: newsletter subscription toggle on preferences page | Frontend | 1.5 | T23-40, T23-30 |
| T23-43 | Frontend: optimistic UI updates with success/error toasts | Frontend | 1.5 | T23-41 |

#### Day 9 (Thursday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-44 | Frontend: email unsubscribe page at `/unsubscribe` | Frontend | 3 | T23-32 |
| T23-45 | Frontend: unsubscribe page handles token validation, category vs all, re-subscribe | Frontend | 2 | T23-44 |
| T23-46 | Flutter: integrate firebase_messaging package | Mobile | 2 | -- |
| T23-47 | Flutter: obtain FCM token on launch, send to backend, handle refresh | Mobile | 2 | T23-46, T23-38 |
| T23-48 | Flutter: notification permission request with explanation dialog | Mobile | 1.5 | T23-46 |

#### Day 10 (Friday)
| Task ID | Task | Assignee | Hours | Dependencies |
|---|---|---|---|---|
| T23-49 | Flutter: foreground notification display (in-app banner) | Mobile | 2 | T23-46 |
| T23-50 | Flutter: background notification handling, tap navigation to detail screen | Mobile | 3 | T23-46 |
| T23-51 | Flutter: iOS APNs configuration and entitlements | Mobile | 1.5 | T23-46 |
| T23-52 | Flutter: Android notification channel setup | Mobile | 1 | T23-46 |
| T23-53 | QA: test all email templates (send test, verify rendering) | QA | 2 | T23-10 |
| T23-54 | QA: test email queue (retry behavior, dead letter queue) | QA | 1.5 | T23-15 |
| T23-55 | QA: test push notifications end-to-end (trigger -> receive on device) | QA | 2 | T23-50 |
| T23-56 | QA: test newsletter subscribe/confirm/unsubscribe flow | QA | 1.5 | T23-34 |
| T23-57 | QA: test notification preferences (toggle off category, verify no notification sent) | QA | 1.5 | T23-27, T23-41 |

---

## Backend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T23-01 | Brevo SDK setup | Install @sendinblue/client, configure API key from env, create module | 2 |
| T23-02 | EmailService abstraction | Interface with send(), Brevo implementation, DI registration | 3 |
| T23-03-09 | Email templates (6) | Design in Brevo: welcome, password reset, competition winner, order confirmation, listing approved, listing rejected | 9.5 |
| T23-10 | Template polish | Unsubscribe footer, responsive CSS, test renders | 2 |
| T23-11-12 | Hook emails into flows | Registration -> welcome, password reset flow -> reset email | 2.5 |
| T23-13 | BullMQ setup | Install bullmq, configure Redis connection, create email queue | 2 |
| T23-14 | Queue producer | Enqueue method wrapping EmailService.send() | 2 |
| T23-15 | Queue worker | Process handler calling Brevo API, logging, error handling | 3 |
| T23-16-17 | Retry + DLQ | Exponential backoff config, dead letter queue, failure events | 2.5 |
| T23-18 | Bull Board | Install @bull-board/express, mount at /admin/queues, auth guard | 1 |
| T23-19 | Firebase Admin SDK | Install firebase-admin, initialize with service account, create module | 2 |
| T23-20 | PushNotificationService | sendToDevice, sendToTopic, sendMulticast methods | 3 |
| T23-05, T23-21-22 | Notification preferences | Migration, entity, repository, CRUD service, GET/PATCH endpoints | 6 |
| T23-23-26 | Push triggers (4) | Article published, competition deadline, event reminder, listing approved | 7.5 |
| T23-27 | Preference checks | Middleware to check preferences before send | 1.5 |
| T23-28 | Rate limiting | Redis counter per user per day, check before send | 1.5 |
| T23-29-34 | Newsletter system | Migration, subscribe/confirm/unsubscribe endpoints, email template, Brevo sync | 10.5 |
| T23-35-37 | Topic management | Migrations, CRUD endpoints, FCM topic subscription | 6.5 |
| T23-38 | Device registration | POST /api/devices endpoint, devices table, token storage | 2 |
| T23-39 | Default preferences | Hook into registration to create default preference rows | 1.5 |
| | **Backend Total** | | **68** |

## Frontend Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T23-40 | Preferences page layout | Page component, section headers, loading state | 4 |
| T23-41 | Toggle switches + topics | SwitchGroup for email/push per category, topic checkboxes, API calls | 3 |
| T23-42 | Newsletter toggle | Subscribe/unsubscribe toggle, pending state indicator | 1.5 |
| T23-43 | Optimistic UI | Immediate toggle, revert on error, toast notifications | 1.5 |
| T23-44-45 | Unsubscribe page | Token handling, category selection, confirmation message, re-subscribe link, error states | 5 |
| | **Frontend Total** | | **15** |

## Mobile (Flutter) Tasks

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---|---|---|---|
| T23-46 | firebase_messaging setup | Add package, configure Android/iOS, initialize in main.dart | 2 |
| T23-47 | FCM token management | Get token, send to backend, onTokenRefresh listener | 2 |
| T23-48 | Permission request | PermissionHandler dialog, explanation text, handle denial gracefully | 1.5 |
| T23-49 | Foreground handling | onMessage listener, show in-app banner or flutter_local_notifications | 2 |
| T23-50 | Background + tap navigation | onMessageOpenedApp, getInitialMessage, route to detail screen | 3 |
| T23-51 | iOS APNs config | Xcode entitlements, APNs key upload to Firebase, Runner.entitlements | 1.5 |
| T23-52 | Android channel | Create NotificationChannel in Application class, set importance | 1 |
| | **Mobile Total** | | **13** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---|---|---|---|
| T23-53 | Email template tests | Send each template via test endpoint; verify subject, body, rendering on Gmail/Outlook/mobile; check unsubscribe footer | 2 |
| T23-54 | Email queue tests | Enqueue email, verify delivery; simulate Brevo failure, verify retry; verify DLQ after 3 failures; check Bull Board stats | 1.5 |
| T23-55 | Push notification E2E | Trigger each push type; verify receipt on iOS and Android; verify deep link navigation; verify rate limit at 5/day | 2 |
| T23-56 | Newsletter flow | Subscribe with new email, verify confirmation email, click confirm link, verify status; test duplicate submission; test unsubscribe; verify Brevo list sync | 1.5 |
| T23-57 | Preference enforcement | Disable push for articles, publish article, verify no push; disable email for competitions, verify no winner email; re-enable, verify resume | 1.5 |
| | **QA Total** | | **8.5** |

---

## DevOps/Infrastructure Tasks

| Task ID | Task | Effort (hrs) |
|---|---|---|
| T23-INFRA-01 | Add Brevo API key to environment variables and Docker secrets | 1 |
| T23-INFRA-02 | Add Firebase service account JSON to environment/secrets | 1 |
| T23-INFRA-03 | Verify Redis is configured for BullMQ (separate DB index or namespace) | 0.5 |
| T23-INFRA-04 | Add BullMQ worker process to Docker Compose (separate service or same container) | 1 |
| T23-INFRA-05 | Configure Firebase project for both iOS and Android (google-services.json, GoogleService-Info.plist) | 1 |
| | **DevOps Total** | **4.5** |

---

## Dependencies

```
T23-01 (Brevo SDK) --> T23-02 (EmailService) --> T23-14 (queue producer)
T23-01 --> T23-03 through T23-09 (all templates)
T23-03-09 (templates) --> T23-10 (polish) --> T23-11, T23-12 (hook into flows)
T23-13 (BullMQ setup) --> T23-14, T23-15 (producer, worker)
T23-15 (worker) --> T23-16, T23-17 (retry, DLQ)
T23-19 (Firebase SDK) --> T23-20 (PushService) --> T23-23-26 (triggers)
T23-05 (preferences migration) --> T23-21 (entity) --> T23-22 (endpoints) --> T23-27 (preference checks)
T23-21 --> T23-39 (default preferences on registration)
T23-29 (newsletter migration) --> T23-30, T23-31, T23-32 (newsletter endpoints)
T23-30 (subscribe) --> T23-33 (confirmation email) --> T23-34 (Brevo sync)
T23-35 (topics migration) --> T23-36 (topics API) --> T23-37 (FCM topics)
T23-19 --> T23-38 (device registration)
T23-22 --> T23-40 (frontend preferences page)
T23-36 --> T23-41 (frontend topics)
T23-32 --> T23-44 (frontend unsubscribe page)
T23-38 --> T23-47 (Flutter token send)
T23-46 (Flutter firebase_messaging) --> T23-47, T23-48, T23-49, T23-50, T23-51, T23-52
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Brevo API rate limits hit during testing | Low | Medium | Use sandbox/test mode for development; batch sends in queue |
| Firebase APNs setup complexity on iOS | Medium | Medium | Follow official Firebase iOS guide; test on physical iOS device early |
| BullMQ Redis connection issues in Docker | Low | High | Use health checks; ensure Redis is reachable from worker container |
| Email deliverability (landing in spam) | Medium | High | Set up SPF, DKIM, DMARC records in Cloudflare DNS; use Brevo best practices |
| Push notification permission denial rates | Medium | Medium | Design compelling permission request dialog; allow deferred asking |
| GDPR compliance gaps in newsletter flow | Medium | High | Implement strict double opt-in; ensure every email has unsubscribe; log consent timestamps |

---

## Deliverables Checklist

- [ ] Brevo API integration with EmailService abstraction
- [ ] 6 email templates (welcome, password reset, competition winner, order confirmation, listing approved, listing rejected)
- [ ] BullMQ email queue with retry logic and dead letter queue
- [ ] Bull Board dashboard at `/admin/queues`
- [ ] Firebase Admin SDK initialized and PushNotificationService created
- [ ] 4 push notification triggers (article, competition, event, listing)
- [ ] `notification_preferences` table with GET/PATCH API
- [ ] Push notification rate limiting (5/day per user)
- [ ] Newsletter subscription with double opt-in
- [ ] Newsletter unsubscribe flow
- [ ] Brevo contact list sync
- [ ] Notification topics management API
- [ ] Frontend notification preferences page
- [ ] Frontend email unsubscribe page
- [ ] Flutter firebase_messaging integration
- [ ] Flutter foreground and background notification handling
- [ ] Flutter notification tap navigation (deep linking)
- [ ] iOS APNs and Android notification channel configured
- [ ] All QA test scenarios passed

---

## Definition of Done

- Brevo sends all 6 email template types reliably through the BullMQ queue
- Failed emails retry automatically and dead-letter after 3 failures
- Push notifications reach iOS and Android devices for all 4 trigger types
- Notification preferences are enforced: toggling off a category prevents notification delivery
- Newsletter subscribe/confirm/unsubscribe flow works end-to-end with GDPR compliance
- Frontend preferences page allows users to manage all notification settings
- Unsubscribe page handles token-based unsubscription with one click
- Flutter app receives push notifications in foreground and background, with correct deep link navigation
- All environment variables and secrets documented and configured in staging
- All QA test scenarios executed and passing
- Code reviewed and merged

---

## Sprint Review Demo Script

1. **Email templates** (3 min): Trigger each email type from the admin or test endpoint; show rendered emails in a mail client (Gmail, Outlook); highlight responsive layout and unsubscribe footer
2. **Email queue** (2 min): Show Bull Board dashboard; enqueue several emails; show processing; simulate failure; show retry; show dead letter queue
3. **Push notification triggers** (4 min): Publish a new article from admin -> show push arriving on Android device; trigger competition deadline -> show push on iOS device; favorite an event -> show reminder push; approve a listing -> show push to listing owner
4. **Notification preferences** (3 min): Open web preferences page; toggle off "articles" push; publish new article; show no push received; toggle back on; publish another; show push received
5. **Newsletter flow** (3 min): Enter email in newsletter signup; show confirmation email; click confirm link; show confirmed status in database; send test newsletter; click unsubscribe link; show unsubscribed status
6. **Topic management** (2 min): Show topics list on preferences page; subscribe to "Food" topic; unsubscribe from "Nightlife"; verify FCM topic subscription in Firebase console
7. **Flutter notifications** (3 min): Show permission dialog on first launch; receive foreground notification (in-app banner); send app to background, receive notification in system tray; tap notification and navigate to content detail screen
8. **Rate limiting** (1 min): Trigger 6 push notifications for one user; show that the 6th is blocked by rate limit

**Total demo time:** ~21 minutes

---

## Rollover Criteria

Items roll over to Sprint 24 if:
- Topic management (US-23-06) is not complete -- it is an enhancement, not core
- Frontend notification preferences page styling is incomplete -- functionality must work
- iOS APNs configuration has issues -- Android push must work; iOS can roll over with a tracked bug

Items that **must** be completed this sprint (no rollover):
- Brevo integration and all email templates (foundation for all transactional email)
- BullMQ email queue (reliability requirement)
- Firebase push notification sending with at least 2 triggers working
- Notification preferences table and API (GDPR requirement)
- Newsletter double opt-in flow (GDPR requirement)
- Flutter push notification receiving (foreground + background)
