# US-COMP: Competitions User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** Competitions
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Admin | Platform administrator who manages competitions |
| Superadmin | Top-level administrator with full system access |

---

## US-COMP-001: View Active Competitions

**As a** visitor,
**I want to** view all currently active competitions,
**so that** I can discover prizes I could win and decide which competitions to enter.

### Acceptance Criteria

**AC-001.1: Competitions landing page**
- **Given** I navigate to the Competitions section (via main navigation or /competitions)
- **When** the page loads
- **Then** I see a visually appealing page with all active competitions displayed as large cards, ordered by closing date (soonest closing first)

**AC-001.2: Competition card display**
- **Given** I am viewing the competitions listing
- **When** I look at a competition card
- **Then** each card displays: a high-quality prize image, competition title, prize description summary (1-2 sentences), a live countdown timer showing remaining time (days, hours, minutes), a "Enter Now" call-to-action button, and the total number of entries (optional, based on admin configuration)

**AC-001.3: No active competitions**
- **Given** there are no currently active competitions
- **When** I visit the competitions page
- **Then** the system displays a friendly message "No active competitions right now. Check back soon!" with a section showing recently ended competitions and a link to sign up for notifications

**AC-001.4: Competition detail preview**
- **Given** I am on the competitions listing page
- **When** I click on a competition card
- **Then** I am navigated to the full competition detail page

**AC-001.5: Authenticated user entry status**
- **Given** I am a logged-in user who has already entered a competition
- **When** I view that competition card on the listing page
- **Then** the card shows a "You've entered" badge and the CTA changes from "Enter Now" to "View Entry" or "Good Luck!"

---

## US-COMP-002: Enter a Competition

**As a** user,
**I want to** enter a competition by providing the required information,
**so that** I have a chance to win the prize.

### Acceptance Criteria

**AC-002.1: Competition detail page**
- **Given** I click on a competition card
- **When** the competition detail page loads
- **Then** I see: hero image of the prize, competition title, full prize description (rich text with details, value, and what is included), start and end dates, terms and conditions link, entry form or "Enter Now" button, and a countdown timer

**AC-002.2: Entry form display**
- **Given** I am logged in and click "Enter Now" on a competition detail page
- **When** the entry form appears
- **Then** I see a form with fields configured by the admin (which may include: name (pre-filled from profile), email (pre-filled from profile), answer to a question, optional marketing opt-in checkbox, and terms acceptance checkbox)

**AC-002.3: Successful entry submission**
- **Given** I have filled out all required fields in the entry form
- **When** I click "Submit Entry"
- **Then** the system records my entry, displays a confirmation screen with "You're entered! Good luck!" message, sends a confirmation email with entry details, and updates the competition card to show my entry status

**AC-002.4: Unauthenticated entry attempt**
- **Given** I am a visitor (not logged in)
- **When** I click "Enter Now" on a competition
- **Then** the system prompts me to log in or register with "Log in to enter this competition" and after authentication redirects me back to the competition entry form

**AC-002.5: Duplicate entry prevention**
- **Given** I have already entered a competition
- **When** I try to enter it again
- **Then** the system displays "You have already entered this competition. Good luck!" and does not create a duplicate entry

**AC-002.6: Closed competition entry attempt**
- **Given** a competition has ended (countdown reached zero)
- **When** I try to enter it
- **Then** the "Enter Now" button is disabled, the page displays "This competition has ended," and the form is no longer accessible

**AC-002.7: Terms and conditions**
- **Given** I am filling out the competition entry form
- **When** I look at the terms checkbox
- **Then** I must check "I agree to the competition terms and conditions" (with a link to the full T&C) before the form can be submitted

**AC-002.8: Entry validation**
- **Given** I submit the entry form with missing required fields or invalid data
- **When** validation occurs
- **Then** the system highlights the specific fields with errors and displays appropriate inline error messages without losing any data I have already entered

---

## US-COMP-003: View Competition Countdown

**As a** visitor,
**I want to** see a live countdown timer for each active competition,
**so that** I know how much time I have left to enter and feel a sense of urgency.

### Acceptance Criteria

**AC-003.1: Countdown timer display**
- **Given** a competition is active
- **When** I view the competition card or detail page
- **Then** I see a countdown timer displaying remaining time in the format: "X days, Y hours, Z minutes" (or "Y hours, Z minutes, W seconds" if less than 24 hours remain)

**AC-003.2: Real-time countdown**
- **Given** I am viewing a competition countdown
- **When** time passes
- **Then** the countdown updates in real time (every second when less than 1 hour remains, every minute otherwise) without requiring a page refresh

**AC-003.3: Urgency visual cues**
- **Given** a competition has less than 24 hours remaining
- **When** I view the countdown
- **Then** the timer displays in a highlighted/urgent color (e.g., red or orange) with a label like "Ending soon!"

**AC-003.4: Final moments**
- **Given** a competition has less than 1 hour remaining
- **When** I view the countdown
- **Then** the timer shows seconds ticking down and may include a pulsing animation to convey urgency

**AC-003.5: Countdown completion**
- **Given** I am viewing a competition when the countdown reaches zero
- **When** the timer expires
- **Then** the countdown is replaced with "Competition ended," the entry form is disabled, and the page state updates without requiring a manual refresh

**AC-003.6: Timezone handling**
- **Given** the competition end time is stored in UTC
- **When** the countdown is displayed
- **Then** the countdown is calculated based on the difference between the current time and the end time, so it is accurate regardless of the visitor's timezone

---

## US-COMP-004: Check if I Won

**As a** user,
**I want to** check whether I have won a competition I entered,
**so that** I can claim my prize and celebrate.

### Acceptance Criteria

**AC-004.1: Winner notification via email**
- **Given** I have been selected as the winner of a competition
- **When** the admin selects winners
- **Then** I receive an email notification with the subject "Congratulations! You've won [Competition Title]!" containing prize details, instructions for claiming the prize, and a link to my competition entry on the platform

**AC-004.2: Winner status on competition page**
- **Given** I am logged in and I won a competition
- **When** I visit that competition's detail page
- **Then** I see a prominent "You Won!" banner with prize claim instructions and any next steps (e.g., contact details, claim deadline)

**AC-004.3: Winner announcement (public)**
- **Given** a competition has ended and winners have been selected
- **When** any visitor views the ended competition page
- **Then** they see a "Winner Announced" section showing the winner's display name (or first name and last initial, based on privacy settings) and a congratulations message, without revealing sensitive contact information

**AC-004.4: Non-winner notification**
- **Given** I entered a competition but was not selected as the winner
- **When** the winners are announced
- **Then** I receive an optional email (if I opted in for competition notifications) saying "The winners of [Competition Title] have been announced" with a link to view the results and explore other active competitions

**AC-004.5: Competition entry history**
- **Given** I am logged in
- **When** I navigate to My Activity or My Competitions
- **Then** I see a list of all competitions I have entered with their status: "Active" (still running), "Awaiting results" (ended, no winner yet), "Won" (I won), or "Not selected" (winner announced, not me)

**AC-004.6: Prize claim deadline**
- **Given** I have won a competition
- **When** I view the prize claim details
- **Then** I see a claim deadline (e.g., "Claim your prize by [date]") and instructions for how to claim (e.g., reply to email, visit a location, provide shipping address)

---

## US-COMP-005: View Past Competitions

**As a** visitor,
**I want to** view past competitions and their results,
**so that** I can see what prizes were offered, who won, and get excited about future competitions.

### Acceptance Criteria

**AC-005.1: Past competitions section**
- **Given** I am on the competitions page
- **When** I scroll past active competitions or click the "Past Competitions" tab
- **Then** I see a list of ended competitions in reverse chronological order (most recently ended first)

**AC-005.2: Past competition card display**
- **Given** I am viewing past competitions
- **When** I look at a competition card
- **Then** each card shows: the prize image, competition title, end date, "Ended" badge, and winner name (if announced)

**AC-005.3: Past competition detail page**
- **Given** I click on a past competition card
- **When** the detail page loads
- **Then** I see the full competition details (prize, description, dates) with a "This competition has ended" notice, the winner announcement section, and a "Browse active competitions" link

**AC-005.4: Pagination for past competitions**
- **Given** there are many past competitions
- **When** I view the past competitions list
- **Then** results are paginated (12 per page) or loaded via "Load more" button

**AC-005.5: No entry form on past competitions**
- **Given** I am viewing a past competition's detail page
- **When** I look for the entry form
- **Then** no entry form is displayed, and the "Enter Now" button is replaced with "Competition ended on [date]"

---

## US-COMP-006: Create Competition (Admin)

**As an** admin,
**I want to** create and configure competitions,
**so that** I can engage platform users with prize giveaways and promotions.

### Acceptance Criteria

**AC-006.1: Competition creation form**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Competitions > Create New
- **Then** I see a comprehensive form with sections for: basic information, entry configuration, scheduling, and display settings

**AC-006.2: Basic information fields**
- **Given** I am creating a competition
- **When** I fill in the basic information
- **Then** I can set: competition title, prize description (rich text), prize value, prize image(s) upload (hero and gallery), sponsor name (optional), sponsor logo (optional), terms and conditions (rich text editor), and SEO fields (meta title, meta description, slug)

**AC-006.3: Entry configuration**
- **Given** I am configuring competition entries
- **When** I set up the entry form
- **Then** I can configure: entry fields (add/remove/reorder custom fields such as text input, dropdown, checkbox), a competition question (optional, for skill-based entry), whether the correct answer is required, maximum entries (optional limit), and whether to show the entry count publicly

**AC-006.4: Scheduling**
- **Given** I am configuring competition timing
- **When** I set the schedule
- **Then** I can set: start date and time, end date and time, and the competition will automatically open and close at the specified times

**AC-006.5: Save as draft**
- **Given** I have partially completed the competition form
- **When** I click "Save Draft"
- **Then** the competition is saved as a draft and is not visible to the public, allowing me to continue editing later

**AC-006.6: Publish competition**
- **Given** I have completed all required fields
- **When** I click "Publish" (or the start date/time arrives for a scheduled competition)
- **Then** the competition becomes visible on the public site, appears on the homepage competitions section, and the countdown timer begins

**AC-006.7: Preview competition**
- **Given** I have filled in competition details
- **When** I click "Preview"
- **Then** I see the competition page exactly as visitors will see it, including the entry form, countdown timer, and all visual elements

**AC-006.8: Edit active competition**
- **Given** a competition is currently active
- **When** I edit its details (description, images, etc.)
- **Then** changes are saved and reflected on the public page immediately, but I cannot change the end date to a time in the past, and I receive a warning if I change the entry form fields (as it may affect existing entries)

**AC-006.9: Competition management dashboard**
- **Given** I am an admin
- **When** I navigate to Admin Panel > Competitions
- **Then** I see a dashboard showing: active competitions (with entry counts and time remaining), scheduled competitions (not yet started), ended competitions awaiting winner selection, and past competitions (with winners selected), each with edit, view entries, and select winner actions

---

## US-COMP-007: Select Winners (Admin)

**As an** admin,
**I want to** select competition winners from the pool of entries,
**so that** prizes can be awarded and results announced.

### Acceptance Criteria

**AC-007.1: View entries**
- **Given** a competition has ended
- **When** I navigate to Admin Panel > Competitions > [Competition] > Entries
- **Then** I see a table of all entries with: entrant name, email, entry date, answer (if applicable), and answer correctness indicator (if a question was set)

**AC-007.2: Filter entries**
- **Given** I am viewing competition entries
- **When** I use the filter options
- **Then** I can filter by: correct answers only (if a question was set), entry date range, and search by entrant name or email

**AC-007.3: Random winner selection**
- **Given** I am ready to select a winner
- **When** I click "Select Random Winner"
- **Then** the system randomly selects one entry from the eligible pool (those with correct answers if a question was set), highlights the selected entry, and displays the winner's details with options to "Confirm Winner" or "Re-draw"

**AC-007.4: Multiple winners**
- **Given** the competition allows multiple winners
- **When** I click "Select Random Winners" and enter the number of winners (e.g., 3)
- **Then** the system randomly selects the specified number of unique entries and displays all winners

**AC-007.5: Manual winner selection**
- **Given** I want to manually select a winner (e.g., for a skill-based competition)
- **When** I click the "Select as Winner" button next to a specific entry
- **Then** that entry is marked as the winner

**AC-007.6: Confirm and announce winners**
- **Given** I have selected the winner(s)
- **When** I click "Confirm Winners & Announce"
- **Then** the system: records the winner(s) permanently, sends congratulatory emails to winner(s), sends optional "not selected" notifications to other entrants (if configured), updates the competition page with the winner announcement, and marks the competition as "Completed"

**AC-007.7: Re-draw capability**
- **Given** a winner has been selected but not yet confirmed
- **When** I click "Re-draw" (e.g., if the winner is ineligible or unreachable)
- **Then** the system selects a new random winner from the remaining eligible entries and the previous selection is logged

**AC-007.8: Export entries**
- **Given** I am viewing competition entries
- **When** I click "Export Entries"
- **Then** the system generates a CSV file containing all entry data (name, email, answers, entry date) for download

**AC-007.9: Winner audit trail**
- **Given** a winner has been selected and confirmed
- **When** I view the competition's admin page
- **Then** I see a complete audit trail showing: who selected the winner, the selection method (random or manual), the date and time, and any re-draws that occurred

---

## Cross-Cutting Concerns

### Security & Fairness
- Each user account is limited to one entry per competition (enforced at the database level)
- Random winner selection must use a cryptographically secure random number generator
- Admin actions (winner selection, re-draws) must be logged with immutable audit trails
- Entry data must be treated as personal data under GDPR

### Performance
- Competition pages must load within 2 seconds
- Countdown timers must update smoothly without causing excessive client-side processing
- Entry submission must respond within 1 second

### SEO
- Active competition pages should include structured data (Event or Contest schema)
- Ended competitions should remain indexed with updated content (winner announcements)
- Each competition must have a unique canonical URL

### Accessibility
- Countdown timers must include aria-live regions so screen readers announce updates
- Entry forms must meet WCAG 2.1 AA standards
- Color-coded urgency indicators must also have text labels
- All competition images must have descriptive alt text

### Legal & Compliance
- Terms and conditions must be presented and accepted before entry
- Competitions must comply with German competition law (Gewinnspielrecht)
- Marketing opt-ins must be separate from competition entry and not pre-checked (GDPR)
- Prize values above legal thresholds must include appropriate tax disclaimers

---

*Document End*
