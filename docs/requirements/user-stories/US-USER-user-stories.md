# US-USER: User Profile Management User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** User Profile Management
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| User | Authenticated user with a verified account |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-USER-001: View Profile

**As a** user,
**I want to** view my profile page,
**so that** I can see my personal information, activity summary, and public-facing profile as others see it.

### Acceptance Criteria

**AC-001.1: Profile page display**
- **Given** I am logged in
- **When** I navigate to my profile page (via account menu or "/profile")
- **Then** I see my display name, avatar, bio, location, member-since date, and a summary of my activity (bookmarks count, listings count, competition entries)

**AC-001.2: Public profile preview**
- **Given** I am viewing my profile
- **When** I click "View public profile"
- **Then** I see my profile as other users and visitors would see it, showing only publicly visible fields

**AC-001.3: Profile page for visitors**
- **Given** I am a visitor (not logged in)
- **When** I navigate to a user's public profile URL
- **Then** I see only the user's display name, avatar, and any content they have chosen to make public (e.g., public listings)

**AC-001.4: Profile not found**
- **Given** I navigate to a profile URL for a non-existent or deactivated user
- **When** the page loads
- **Then** the system displays a 404 page with the message "This profile does not exist or has been removed"

---

## US-USER-002: Edit Profile

**As a** user,
**I want to** edit my profile information,
**so that** I can keep my personal details up to date and control what others see.

### Acceptance Criteria

**AC-002.1: Access edit profile**
- **Given** I am logged in
- **When** I navigate to my profile page and click "Edit Profile"
- **Then** I see an editable form pre-populated with my current profile information including display name, bio (max 500 characters), location, website URL, and privacy settings

**AC-002.2: Successful profile update**
- **Given** I am on the edit profile form
- **When** I modify one or more fields with valid data and click "Save Changes"
- **Then** the system saves my updated information, displays a success notification "Profile updated successfully," and redirects me to my profile page with the changes reflected

**AC-002.3: Display name validation**
- **Given** I am editing my profile
- **When** I enter a display name shorter than 2 characters or longer than 50 characters
- **Then** the system displays an inline error "Display name must be between 2 and 50 characters"

**AC-002.4: Display name uniqueness**
- **Given** I am editing my profile
- **When** I enter a display name already in use by another user
- **Then** the system displays an error "This display name is already taken"

**AC-002.5: Bio character limit**
- **Given** I am editing my bio
- **When** I type in the bio field
- **Then** I see a live character counter showing remaining characters (e.g., "347/500"), and the form prevents me from exceeding 500 characters

**AC-002.6: Website URL validation**
- **Given** I am editing my profile
- **When** I enter an invalid URL in the website field
- **Then** the system displays an inline error "Please enter a valid URL (e.g., https://example.com)"

**AC-002.7: Unsaved changes warning**
- **Given** I have made changes to my profile form but have not saved
- **When** I attempt to navigate away from the page
- **Then** the system displays a confirmation dialog "You have unsaved changes. Are you sure you want to leave?"

---

## US-USER-003: Upload Avatar

**As a** user,
**I want to** upload a profile photo (avatar),
**so that** other users can recognize me and my profile feels personalized.

### Acceptance Criteria

**AC-003.1: Upload avatar image**
- **Given** I am on the edit profile page
- **When** I click the avatar upload area and select a valid image file (JPEG, PNG, or WebP, max 5 MB)
- **Then** the system displays a preview of the image with a crop tool allowing me to select a square region

**AC-003.2: Crop and save avatar**
- **Given** I have selected an image and adjusted the crop area
- **When** I click "Save Avatar"
- **Then** the system uploads the cropped image, generates responsive variants (64x64, 128x128, 256x256), stores them in cloud storage, updates my profile with the new avatar, and displays a success notification

**AC-003.3: Invalid file type**
- **Given** I am uploading an avatar
- **When** I select a file that is not JPEG, PNG, or WebP (e.g., a GIF or PDF)
- **Then** the system displays an error "Please upload an image in JPEG, PNG, or WebP format"

**AC-003.4: File too large**
- **Given** I am uploading an avatar
- **When** I select an image file larger than 5 MB
- **Then** the system displays an error "Image must be smaller than 5 MB"

**AC-003.5: Remove avatar**
- **Given** I have a custom avatar set
- **When** I click "Remove Avatar" on the edit profile page
- **Then** the system removes my custom avatar and replaces it with the default avatar (initials-based or generic placeholder)

**AC-003.6: Avatar display across platform**
- **Given** I have uploaded a new avatar
- **When** my avatar is displayed anywhere on the platform (comments, listings, profile)
- **Then** the appropriately sized variant is used based on the display context (small for comments, large for profile page)

---

## US-USER-004: Manage Notification Preferences

**As a** user,
**I want to** manage my notification preferences,
**so that** I receive only the communications I am interested in.

### Acceptance Criteria

**AC-004.1: View notification settings**
- **Given** I am logged in
- **When** I navigate to Settings > Notifications
- **Then** I see a categorized list of notification types with toggles for each delivery channel (email, push, in-app), grouped by category: Account & Security, Content & Editorial, Events, Competitions, Classifieds, and Marketing

**AC-004.2: Toggle individual notification**
- **Given** I am on the notification preferences page
- **When** I toggle a specific notification type (e.g., disable email for "New competition announcements")
- **Then** the system saves the preference immediately (auto-save) and shows a brief confirmation "Preference saved"

**AC-004.3: Bulk toggle by category**
- **Given** I am on the notification preferences page
- **When** I toggle the master switch for an entire category (e.g., "Marketing")
- **Then** all notification types within that category are enabled or disabled accordingly

**AC-004.4: Mandatory notifications**
- **Given** I am on the notification preferences page
- **When** I view the "Account & Security" category
- **Then** security-critical notifications (password changes, login from new device, account lockout) are shown as always-on and cannot be disabled

**AC-004.5: Email frequency setting**
- **Given** I am on the notification preferences page
- **When** I configure the email digest frequency
- **Then** I can choose between "Immediate," "Daily digest," or "Weekly digest" for non-urgent notifications

**AC-004.6: Unsubscribe via email link**
- **Given** I receive a marketing or content notification email
- **When** I click the "Unsubscribe" link at the bottom of the email
- **Then** I am directed to a page confirming the unsubscription from that notification category without requiring login, compliant with CAN-SPAM and GDPR requirements

---

## US-USER-005: View Bookmarks

**As a** user,
**I want to** view all my bookmarked content in one place,
**so that** I can easily find articles, events, restaurants, and listings I have saved for later.

### Acceptance Criteria

**AC-005.1: Bookmarks page display**
- **Given** I am logged in
- **When** I navigate to My Bookmarks (via account menu)
- **Then** I see all my bookmarked items organized by content type: Articles, Events, Restaurants, Classifieds, and Guides, with the most recently bookmarked items first

**AC-005.2: Filter bookmarks by type**
- **Given** I am on the bookmarks page
- **When** I click a content type tab (e.g., "Events")
- **Then** the list filters to show only bookmarked events

**AC-005.3: Bookmark card display**
- **Given** I am viewing my bookmarks
- **When** I see a bookmarked item
- **Then** each card shows a thumbnail, title, brief description, content type badge, date bookmarked, and a remove-bookmark button

**AC-005.4: Remove bookmark**
- **Given** I am viewing my bookmarks
- **When** I click the remove-bookmark button on an item
- **Then** the item is immediately removed from my bookmarks list with an undo option visible for 5 seconds

**AC-005.5: Empty bookmarks state**
- **Given** I have no bookmarks (or no bookmarks in a selected category)
- **When** I view the bookmarks page
- **Then** the system displays a friendly empty state message "You haven't bookmarked anything yet" with suggestions to explore content

**AC-005.6: Expired content handling**
- **Given** I have bookmarked an event that has already passed or a listing that has been removed
- **When** I view my bookmarks
- **Then** the expired/removed item is shown with a visual indicator (greyed out, "Expired" or "Removed" badge) and I can still remove it from my bookmarks

---

## US-USER-006: View Activity History

**As a** user,
**I want to** view my activity history on the platform,
**so that** I can track my interactions including competition entries, listings created, and articles read.

### Acceptance Criteria

**AC-006.1: Activity page display**
- **Given** I am logged in
- **When** I navigate to My Activity (via account menu)
- **Then** I see a chronological timeline of my platform activities including: competition entries, classified listings posted, articles read, events bookmarked, and account changes

**AC-006.2: Activity filtering**
- **Given** I am on the activity page
- **When** I select a filter (e.g., "Competition entries" or "Listings")
- **Then** the timeline shows only activities of that type

**AC-006.3: Date range filtering**
- **Given** I am on the activity page
- **When** I select a date range (e.g., "Last 7 days," "Last 30 days," "Last 3 months," or a custom range)
- **Then** the timeline shows only activities within that period

**AC-006.4: Activity detail link**
- **Given** I am viewing an activity entry (e.g., "You entered the Berlin Weekend Getaway competition")
- **When** I click on the activity entry
- **Then** I am navigated to the relevant content page (e.g., the competition detail page)

**AC-006.5: Pagination**
- **Given** I have more than 50 activity entries
- **When** I scroll to the bottom of the activity list
- **Then** additional entries are loaded via infinite scroll or a "Load more" button

---

## US-USER-007: GDPR Data Export

**As a** user,
**I want to** export all personal data the platform holds about me,
**so that** I can exercise my right to data portability under GDPR.

### Acceptance Criteria

**AC-007.1: Request data export**
- **Given** I am logged in and on my Privacy Settings page
- **When** I click "Request Data Export"
- **Then** the system confirms my identity (by requiring me to re-enter my password), initiates the data export process, and displays "Your data export is being prepared. You will receive an email when it is ready for download."

**AC-007.2: Data export contents**
- **Given** I have requested a data export
- **When** the export is complete
- **Then** the export file (ZIP archive) contains all my personal data in machine-readable format (JSON), including: profile information, email address, bookmarks, activity history, competition entries, classified listings, messages, notification preferences, and login history

**AC-007.3: Download notification**
- **Given** I have requested a data export
- **When** the export file is ready (within 48 hours, per GDPR requirement)
- **Then** I receive an email notification with a secure, time-limited download link (valid for 7 days)

**AC-007.4: Secure download**
- **Given** I have received the data export email
- **When** I click the download link
- **Then** I must be logged in to download the file, the download is served over HTTPS, and the link becomes invalid after one successful download or after 7 days

**AC-007.5: Rate limiting**
- **Given** I have already requested a data export
- **When** I attempt to request another export within 30 days
- **Then** the system displays "A data export was recently requested on [date]. You can request a new export after [date]."

---

## US-USER-008: Account Deletion

**As a** user,
**I want to** permanently delete my account and all associated data,
**so that** I can exercise my right to erasure under GDPR.

### Acceptance Criteria

**AC-008.1: Initiate account deletion**
- **Given** I am logged in and on my Privacy Settings page
- **When** I click "Delete My Account"
- **Then** the system displays a clear warning explaining the consequences: "This action is permanent and cannot be undone. All your data, including your profile, bookmarks, listings, competition entries, and messages, will be permanently deleted."

**AC-008.2: Confirm deletion with password**
- **Given** I have read the deletion warning
- **When** I type "DELETE" in the confirmation field and enter my password
- **Then** the system verifies my password and proceeds with scheduling the account deletion

**AC-008.3: Grace period**
- **Given** I have confirmed account deletion
- **When** the deletion is scheduled
- **Then** the system sets a 14-day grace period, sends a confirmation email with instructions to cancel, logs me out of all sessions, and marks my account as "pending deletion"

**AC-008.4: Cancel deletion during grace period**
- **Given** my account is in "pending deletion" state within the 14-day grace period
- **When** I log in with my credentials
- **Then** the system prompts me with "Your account is scheduled for deletion on [date]. Would you like to cancel the deletion?" and allows me to cancel and restore my account

**AC-008.5: Permanent deletion after grace period**
- **Given** the 14-day grace period has elapsed without cancellation
- **When** the deletion process executes
- **Then** the system permanently deletes all personal data (profile, avatar, bookmarks, messages, activity history), anonymizes my contributions (classifieds become "Deleted User"), removes my email from all marketing lists, and logs the deletion event for compliance records (without PII)

**AC-008.6: Active listings handling**
- **Given** I have active classified listings
- **When** I initiate account deletion
- **Then** the system warns me "You have [N] active listings. These will be removed when your account is deleted." and all listings are immediately deactivated upon deletion confirmation

**AC-008.7: Social account unlinking**
- **Given** I registered via Google or Apple sign-in
- **When** my account is permanently deleted
- **Then** the OAuth connection is revoked and the platform no longer retains any tokens or identifiers from the social provider

---

## Cross-Cutting Concerns

### Privacy & Compliance
- All profile data handling must comply with GDPR (EU) and applicable German data protection laws (BDSG)
- Users must be able to control visibility of each profile field (public, registered users only, private)
- Data exports must be delivered within the GDPR-mandated 30-day window (target: 48 hours)
- Account deletion must comply with the right to erasure, with appropriate exceptions for legal retention requirements

### Accessibility
- All profile and settings forms must meet WCAG 2.1 AA standards
- Avatar upload must support keyboard navigation and screen reader announcements
- Activity timelines must be navigable with assistive technologies

### Performance
- Profile page must load within 2 seconds
- Avatar upload and processing must complete within 10 seconds
- Data export generation should not impact platform performance for other users

---

*Document End*
