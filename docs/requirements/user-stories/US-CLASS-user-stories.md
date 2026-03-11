# US-CLASS: Classifieds User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** Classifieds
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-CLASS-001: Browse Listings by Category

**As a** visitor,
**I want to** browse classified listings filtered by category,
**so that** I can find items, housing, jobs, or services relevant to my needs in Berlin.

### Acceptance Criteria

**AC-001.1: Classifieds landing page**
- **Given** I navigate to the Classifieds section (via main navigation or /classifieds)
- **When** the page loads
- **Then** I see a categorized layout with category cards or tabs for major categories: "Housing" (WG rooms, apartments, sublets), "Jobs" (full-time, part-time, freelance), "For Sale" (furniture, electronics, clothing, miscellaneous), "Services" (lessons, repairs, moving help), and "Community" (language exchange, activity partners, lost and found)

**AC-001.2: Category selection**
- **Given** I am on the classifieds landing page
- **When** I click on a category (e.g., "Housing")
- **Then** I see all listings within that category, and sub-category filters become available (e.g., "WG Room," "1-Bedroom Apartment," "Short-term Sublet")

**AC-001.3: Listing card display**
- **Given** I am browsing listings in a category
- **When** I view the listing cards
- **Then** each card shows: primary image (or placeholder if no image), listing title, price (if applicable, or "Price Negotiable" / "Free"), district/neighborhood, posting date (relative, e.g., "2 hours ago"), and category/sub-category badge

**AC-001.4: Sorting options**
- **Given** I am viewing a category's listings
- **When** I use the sort control
- **Then** I can sort by: "Newest first" (default), "Price: Low to High," "Price: High to Low," or "Nearest" (if location access is granted)

**AC-001.5: Sub-category filtering**
- **Given** I have selected a top-level category (e.g., "For Sale")
- **When** I select a sub-category (e.g., "Furniture")
- **Then** only furniture listings are shown, and the URL updates (e.g., /classifieds/for-sale/furniture)

**AC-001.6: Pagination**
- **Given** there are more than 20 listings matching my filters
- **When** I scroll to the bottom of the list
- **Then** I can load more results via "Load more" button or infinite scroll, loading 20 listings per batch

---

## US-CLASS-002: Search Listings

**As a** visitor,
**I want to** search classified listings by keyword,
**so that** I can quickly find specific items, jobs, or services.

### Acceptance Criteria

**AC-002.1: Search bar**
- **Given** I am on the classifieds page
- **When** I look at the top of the page
- **Then** I see a prominent search bar with placeholder text "Search classifieds..." and an optional category dropdown alongside it for scoped searching

**AC-002.2: Keyword search**
- **Given** I enter a search query (e.g., "IKEA desk Neukoelln")
- **When** I submit the search
- **Then** the system returns matching listings ranked by relevance, searching across listing titles, descriptions, and locations, with search terms highlighted in the results

**AC-002.3: Search with category scope**
- **Given** I select a category from the dropdown (e.g., "For Sale") and enter a keyword
- **When** I submit the search
- **Then** results are restricted to the selected category only

**AC-002.4: Search autocomplete**
- **Given** I am typing in the search bar
- **When** I have entered 3 or more characters
- **Then** the system displays up to 5 autocomplete suggestions based on listing titles and popular searches, updating in real time (debounced at 300ms)

**AC-002.5: Advanced filters**
- **Given** I have performed a search or am browsing a category
- **When** I click "Filters"
- **Then** I can apply additional filters including: price range (min and max), district, posted within (today, last 3 days, last week, last month), and listing type (offering, seeking)

**AC-002.6: No search results**
- **Given** I search for a query with no matches
- **When** the results page loads
- **Then** the system displays "No listings found for '[query]'" with suggestions to broaden the search, try different keywords, or set up a search alert

**AC-002.7: Search alert**
- **Given** I am logged in and viewing search results (or a no-results page)
- **When** I click "Set up alert for this search"
- **Then** the system saves my search criteria and notifies me (via email or push notification, based on my preferences) when new listings matching my criteria are posted

---

## US-CLASS-003: View Listing Details

**As a** visitor,
**I want to** view the full details of a classified listing,
**so that** I can learn everything I need to know about the item, housing, job, or service.

### Acceptance Criteria

**AC-003.1: Listing detail page display**
- **Given** I click on a listing card from the listing or search results
- **When** the detail page loads
- **Then** I see comprehensive listing information including: image gallery (if images were uploaded), listing title, price (or "Free" / "Price Negotiable"), category and sub-category breadcrumbs, district/neighborhood, posting date, listing description (rich text), and seller/poster information (display name, avatar, member-since date)

**AC-003.2: Image gallery**
- **Given** the listing has multiple images
- **When** I view the image section
- **Then** I see the primary image displayed large with thumbnail navigation, and clicking an image opens a full-screen lightbox with swipe navigation and a photo counter

**AC-003.3: Seller information**
- **Given** I am viewing a listing
- **When** I look at the seller section
- **Then** I see the poster's display name, avatar, member-since date, and total active listings count, with a link to view the poster's other listings

**AC-003.4: Contact seller button**
- **Given** I am viewing a listing
- **When** I see the "Contact Seller" button
- **Then** clicking it opens the messaging interface (if logged in) or prompts me to log in first

**AC-003.5: Report listing button**
- **Given** I am viewing a listing
- **When** I see the "Report" link/icon
- **Then** I can flag the listing for admin review (see US-CLASS-007 for details)

**AC-003.6: Share listing**
- **Given** I am viewing a listing detail page
- **When** I click the "Share" button
- **Then** I see options to copy the link, share to social media (Facebook, X, WhatsApp), or share via email

**AC-003.7: Similar listings**
- **Given** I am viewing a listing
- **When** I scroll past the listing content
- **Then** I see a "Similar Listings" section showing 4-6 listings in the same category/sub-category and district

**AC-003.8: Listing expiry notice**
- **Given** a listing was posted more than 30 days ago
- **When** I view the listing
- **Then** I see a notice "This listing was posted over 30 days ago and may no longer be available" to set expectations

---

## US-CLASS-004: Create Listing (Multi-Step)

**As a** user,
**I want to** create a classified listing through a guided multi-step form,
**so that** I can sell items, find housing, post jobs, or offer services to the Berlin community.

### Acceptance Criteria

**AC-004.1: Access create listing**
- **Given** I am logged in
- **When** I click "Post a Listing" (from the classifieds page, header, or CTA)
- **Then** I am directed to the multi-step listing creation wizard

**AC-004.2: Step 1 - Select category**
- **Given** I am on the first step of the listing wizard
- **When** I view the options
- **Then** I see top-level category cards (Housing, Jobs, For Sale, Services, Community) and upon selecting one, I see relevant sub-categories; I must select both a category and sub-category to proceed

**AC-004.3: Step 2 - Listing details**
- **Given** I have selected a category and sub-category
- **When** I proceed to step 2
- **Then** I see a form with fields contextually adapted to my chosen category:
  - **All categories:** Title (required, max 100 characters), description (required, rich text, max 5000 characters), district/neighborhood (required, dropdown of Berlin districts)
  - **For Sale:** Price (required, numeric with EUR currency, or "Free" / "Negotiable" toggle), condition (New, Like New, Good, Fair, For Parts)
  - **Housing:** Price (monthly rent in EUR), room size (sqm), available from date, furnished (yes/no), duration (permanent, temporary with end date)
  - **Jobs:** Job type (full-time, part-time, freelance, internship), salary range (optional), company name (optional)
  - **Services:** Pricing model (hourly, fixed, negotiable), availability

**AC-004.4: Step 3 - Upload images**
- **Given** I proceed to the images step
- **When** I view the upload interface
- **Then** I can upload up to 10 images via drag-and-drop or file picker (JPEG, PNG, WebP, max 5 MB each), reorder images by dragging, set the primary image, and see thumbnail previews of uploaded images; images are optional but recommended (with a note: "Listings with photos get 5x more views")

**AC-004.5: Step 4 - Review and publish**
- **Given** I proceed to the review step
- **When** I view the summary
- **Then** I see a complete preview of my listing as it will appear to visitors, including all details and images, with options to "Go back" to edit any step, or "Publish Listing"

**AC-004.6: Successful publication**
- **Given** I click "Publish Listing" on the review step
- **When** the listing is submitted
- **Then** the system creates the listing (with status "Active" or "Pending Review" if moderation is enabled), displays a success screen "Your listing has been published!" with a link to view it, and sends a confirmation email

**AC-004.7: Step progress indicator**
- **Given** I am at any step of the wizard
- **When** I look at the progress indicator
- **Then** I see a step bar showing all steps (1. Category, 2. Details, 3. Images, 4. Review) with completed steps marked and the current step highlighted

**AC-004.8: Draft saving**
- **Given** I am partway through creating a listing and want to leave
- **When** I navigate away or click "Save Draft"
- **Then** my progress is saved as a draft, and I can resume from where I left off via my listings dashboard

**AC-004.9: Unauthenticated access**
- **Given** I am a visitor (not logged in)
- **When** I click "Post a Listing"
- **Then** I am redirected to the login page with a message "Log in to post a listing" and after authentication, I am redirected back to the listing wizard

**AC-004.10: Form validation**
- **Given** I attempt to proceed to the next step with missing required fields
- **When** the step validation occurs
- **Then** the system highlights the incomplete fields with inline error messages and prevents progression until all required fields are filled

---

## US-CLASS-005: Manage Own Listings

**As a** user,
**I want to** manage my classified listings (view, edit, renew, deactivate, delete),
**so that** I can keep my listings up to date and remove them when they are no longer needed.

### Acceptance Criteria

**AC-005.1: My listings dashboard**
- **Given** I am logged in
- **When** I navigate to My Listings (via account menu)
- **Then** I see a list of all my listings organized by status: "Active," "Pending Review," "Draft," "Expired," and "Deactivated," with each listing showing its title, primary image, category, posting date, status, and view count

**AC-005.2: Edit listing**
- **Given** I am viewing my listings dashboard
- **When** I click "Edit" on an active or draft listing
- **Then** I am taken to the listing editor with all fields pre-populated, and I can modify any field and save changes

**AC-005.3: Deactivate listing**
- **Given** I have an active listing that I no longer want to display
- **When** I click "Deactivate"
- **Then** the listing is immediately hidden from public view, its status changes to "Deactivated," and I can reactivate it later

**AC-005.4: Reactivate listing**
- **Given** I have a deactivated listing
- **When** I click "Reactivate"
- **Then** the listing becomes active again with its original posting date (or a refreshed date, based on system configuration)

**AC-005.5: Delete listing**
- **Given** I want to permanently remove a listing
- **When** I click "Delete" and confirm the action in a confirmation dialog
- **Then** the listing and all associated images are permanently deleted, and the listing URL returns a 404

**AC-005.6: Renew listing**
- **Given** my listing has expired (after 30 days of activity)
- **When** I click "Renew"
- **Then** the listing is reactivated with a new posting date (as if newly posted), and it appears at the top of the relevant category

**AC-005.7: Listing performance metrics**
- **Given** I am viewing my listings dashboard
- **When** I click on a listing's metrics
- **Then** I see view count, contact/message count, bookmark count, and a simple views-over-time chart

**AC-005.8: Expired listing notification**
- **Given** my listing is about to expire (within 3 days)
- **When** the system checks listing expiry
- **Then** I receive an email notification "Your listing '[title]' is expiring in [X] days. Renew it to keep it active." with a direct link to renew

---

## US-CLASS-006: Message Seller

**As a** user,
**I want to** send a message to the seller/poster of a listing,
**so that** I can ask questions, negotiate, or arrange a meetup.

### Acceptance Criteria

**AC-006.1: Initiate contact**
- **Given** I am logged in and viewing a listing detail page
- **When** I click "Contact Seller" or "Send Message"
- **Then** an inline messaging form appears (or I am navigated to the messaging page) with the listing title pre-filled as the conversation subject

**AC-006.2: Send message**
- **Given** the messaging form is open
- **When** I type a message (min 10 characters, max 2000 characters) and click "Send"
- **Then** the message is delivered to the seller, I see a confirmation "Message sent!", and a conversation thread is created between us linked to this listing

**AC-006.3: Seller notification**
- **Given** I send a message to a seller
- **When** the message is delivered
- **Then** the seller receives a notification (in-app and email, based on their preferences) with the message preview, my display name, and a link to respond

**AC-006.4: Conversation thread**
- **Given** a message has been sent about a listing
- **When** the seller replies
- **Then** a conversation thread is maintained between us, linked to the specific listing, visible in both parties' message inboxes

**AC-006.5: Message inbox**
- **Given** I am logged in
- **When** I navigate to My Messages (via account menu)
- **Then** I see all my conversations organized by listing, with unread conversations highlighted, sorted by most recent activity first, showing the listing title, other party's name, last message preview, and timestamp

**AC-006.6: Unread message count**
- **Given** I have unread messages
- **When** I am logged in and viewing any page
- **Then** the messages icon in the navigation shows a badge with the unread message count

**AC-006.7: Unauthenticated contact attempt**
- **Given** I am a visitor (not logged in)
- **When** I click "Contact Seller"
- **Then** the system prompts me to log in with "Log in to contact the seller"

**AC-006.8: Self-messaging prevention**
- **Given** I am viewing my own listing
- **When** I look for the "Contact Seller" button
- **Then** the button is not displayed (I cannot message myself)

**AC-006.9: Message abuse prevention**
- **Given** I am sending messages
- **When** I send more than 20 messages within 1 hour
- **Then** the system rate-limits me and displays "You've reached the message limit. Please try again later."

---

## US-CLASS-007: Report Listing

**As a** user,
**I want to** report a listing that appears to be fraudulent, inappropriate, or violates community guidelines,
**so that** the platform remains safe and trustworthy.

### Acceptance Criteria

**AC-007.1: Report button availability**
- **Given** I am viewing a listing detail page
- **When** I look for the report option
- **Then** I see a "Report" link or flag icon in the listing actions area

**AC-007.2: Report form**
- **Given** I click "Report" on a listing
- **When** the report form appears
- **Then** I see a form with: reason selection (required, options: "Spam," "Fraudulent/Scam," "Prohibited item," "Inappropriate content," "Incorrect category," "Duplicate listing," "Other"), additional details text field (optional, max 500 characters), and a "Submit Report" button

**AC-007.3: Submit report (authenticated)**
- **Given** I am logged in and have filled out the report form
- **When** I click "Submit Report"
- **Then** the report is submitted, I see a confirmation "Thank you for your report. Our team will review it within 24 hours," and my identity is recorded but not shared with the listing owner

**AC-007.4: Submit report (unauthenticated)**
- **Given** I am a visitor (not logged in) and click "Report"
- **When** the system responds
- **Then** I am prompted to log in to submit a report (to prevent spam reports)

**AC-007.5: Duplicate report prevention**
- **Given** I have already reported a specific listing
- **When** I try to report it again
- **Then** the system displays "You have already reported this listing. Our team is reviewing it."

**AC-007.6: Report confirmation email**
- **Given** I have submitted a report
- **When** the report is confirmed
- **Then** I receive an email confirming my report was received, with a reference number for tracking

---

## US-CLASS-008: Moderate Listings (Admin)

**As an** admin,
**I want to** moderate classified listings and manage reported content,
**so that** the classifieds section remains safe, appropriate, and free from spam.

### Acceptance Criteria

**AC-008.1: Moderation dashboard**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Classifieds > Moderation
- **Then** I see a dashboard with tabs for: "Pending Review" (new listings requiring approval, if moderation is enabled), "Reported Listings" (listings flagged by users), and "Flagged Users" (users with multiple reports)

**AC-008.2: Review pending listings**
- **Given** I am on the Pending Review tab
- **When** I view the queue
- **Then** I see listings awaiting approval with their full details (title, description, images, category, poster info), and I can "Approve," "Reject" (with reason), or "Edit & Approve" each listing

**AC-008.3: Manage reported listings**
- **Given** I am on the Reported Listings tab
- **When** I view a reported listing
- **Then** I see the listing details, all reports filed against it (with reasons, additional details, and reporter info), report count, and I can take action: "Dismiss report" (no violation), "Remove listing" (with notification to poster), "Remove listing & warn user," or "Remove listing & suspend user"

**AC-008.4: Remove listing action**
- **Given** I decide to remove a reported listing
- **When** I click "Remove Listing" and select a reason
- **Then** the listing is immediately hidden from public view, the poster receives an email explaining the removal reason, the reporter(s) receive a notification that action was taken, and the action is logged in the audit trail

**AC-008.5: Warn user**
- **Given** I remove a listing with a warning
- **When** the action is taken
- **Then** the user receives a warning email explaining the violation, the warning is recorded on their account, and if the user accumulates 3 warnings, their account is automatically flagged for review

**AC-008.6: Suspend user**
- **Given** a user has repeatedly posted violating content
- **When** I click "Suspend User"
- **Then** the user's account is suspended (they cannot log in or post), all their active listings are deactivated, and the user receives a suspension notification email with appeal instructions

**AC-008.7: Bulk moderation**
- **Given** I have multiple listings to review
- **When** I select multiple listings
- **Then** I can perform bulk actions: approve all, reject all (with reason), or remove all

---

## US-CLASS-009: Manage Reports (Admin)

**As an** admin,
**I want to** manage and track the lifecycle of classified listing reports,
**so that** all reports are handled consistently and transparently.

### Acceptance Criteria

**AC-009.1: Reports management page**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Classifieds > Reports
- **Then** I see a filterable, sortable table of all reports with columns: report ID, listing title, report reason, reporter name, report date, status (Open, In Review, Resolved, Dismissed), assigned moderator, and resolution date

**AC-009.2: Report status workflow**
- **Given** I am managing a report
- **When** I update its status
- **Then** I can transition it through: Open (new report) -> In Review (assigned to a moderator) -> Resolved (action taken) or Dismissed (no violation found)

**AC-009.3: Assign report**
- **Given** a new report comes in
- **When** I click "Assign" on the report
- **Then** I can assign it to a specific moderator/admin, and the assignee receives a notification

**AC-009.4: Report resolution notes**
- **Given** I am resolving or dismissing a report
- **When** I change the status
- **Then** I must provide a resolution note explaining the action taken (or reason for dismissal), which is recorded for audit purposes

**AC-009.5: Report statistics**
- **Given** I am on the reports management page
- **When** I view the statistics panel
- **Then** I see metrics including: total reports (this week/month), average resolution time, reports by reason (pie chart), reports by status, and most-reported users

**AC-009.6: Reporter feedback**
- **Given** a report has been resolved or dismissed
- **When** the status is updated
- **Then** the reporter receives an email notification: "Your report regarding '[listing title]' has been reviewed. [Action taken / No violation found]. Thank you for helping keep our community safe."

---

## Cross-Cutting Concerns

### Performance
- Classifieds listing pages must load within 2 seconds
- Search results must return within 500ms
- Image uploads must process (resize, compress) within 5 seconds per image
- Messaging must deliver in near real-time (under 3 seconds)

### SEO
- Each listing must have a unique canonical URL with a human-readable slug
- Listing structured data (JSON-LD) should include Product or JobPosting schema as appropriate
- Category pages must have optimized meta tags and descriptions
- Expired/removed listing URLs should return appropriate HTTP status codes (410 Gone for deleted, 301 redirect for merged categories)

### Security & Privacy
- Seller contact information (email, phone) must never be displayed publicly; all communication goes through the platform messaging system
- Images must be scanned for inappropriate content (optional automated moderation)
- Rate limiting must be applied to listing creation (max 10 listings per day per user) and messaging
- Report data (reporter identity) must be kept confidential from the listing poster

### Accessibility
- Multi-step listing form must be navigable via keyboard with proper focus management between steps
- Image upload must support keyboard-triggered file picker
- All filter controls must be accessible via keyboard and screen readers
- Listing cards must have meaningful link text (not just "View details")

### Data Retention
- Expired listings are retained for 90 days in a deactivated state before permanent deletion
- Messages are retained for 12 months after the last activity in the conversation
- Reports and moderation actions are retained indefinitely for compliance

---

*Document End*
