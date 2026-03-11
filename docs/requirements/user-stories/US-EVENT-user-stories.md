# US-EVENT: Events User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** Events
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Editor | Content manager who can create and manage events |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-EVENT-001: Find Events Today

**As a** visitor,
**I want to** find events happening today in Berlin,
**so that** I can discover things to do right now or later today.

### Acceptance Criteria

**AC-001.1: Today's events view**
- **Given** I navigate to the Events section
- **When** the page loads
- **Then** the default view shows events happening today, sorted chronologically by start time, with events currently in progress shown first with a "Happening now" badge

**AC-001.2: Today's event card display**
- **Given** I am viewing today's events
- **When** I look at an event card
- **Then** each card displays: event image, title, start time and end time, venue name, district, category icon/badge, and price (or "Free" if applicable)

**AC-001.3: Empty today state**
- **Given** there are no events listed for today
- **When** I view the today filter
- **Then** the system displays "No events listed for today" with a suggestion to check "This Weekend" or "This Week" views

**AC-001.4: Time-aware display**
- **Given** it is currently 3:00 PM
- **When** I view today's events
- **Then** events that have already ended are either hidden or shown at the bottom with an "Ended" badge, and currently active events are highlighted

---

## US-EVENT-002: Find Events This Weekend

**As a** visitor,
**I want to** find events happening this weekend,
**so that** I can plan my Saturday and Sunday activities in Berlin.

### Acceptance Criteria

**AC-002.1: Weekend events filter**
- **Given** I am on the events page
- **When** I click the "This Weekend" filter tab
- **Then** the events list filters to show only events occurring on the upcoming Saturday and Sunday (or current Saturday/Sunday if it is already the weekend)

**AC-002.2: Day grouping**
- **Given** I am viewing weekend events
- **When** the results are displayed
- **Then** events are grouped under "Saturday, [date]" and "Sunday, [date]" headers, sorted chronologically within each day

**AC-002.3: Multi-day event handling**
- **Given** an event spans multiple days (e.g., Friday through Sunday)
- **When** I view the weekend filter
- **Then** the event appears under the weekend days it covers with a "Multi-day event" badge and shows the full date range

**AC-002.4: Weekend count**
- **Given** I am viewing the events page
- **When** the weekend tab is visible
- **Then** it displays the count of weekend events as a badge (e.g., "This Weekend (23)")

---

## US-EVENT-003: Find Events This Month

**As a** visitor,
**I want to** browse events for the current month,
**so that** I can plan ahead and discover upcoming Berlin events.

### Acceptance Criteria

**AC-003.1: Monthly calendar view**
- **Given** I am on the events page
- **When** I click "This Month" or switch to calendar view
- **Then** I see a monthly calendar grid with event indicators (dots or count badges) on days that have events

**AC-003.2: Day click-through**
- **Given** I am viewing the monthly calendar
- **When** I click on a date that has events
- **Then** I see a list of all events on that date, displayed below the calendar or as an expanded day view

**AC-003.3: Month navigation**
- **Given** I am viewing the monthly calendar
- **When** I click the forward/backward arrows
- **Then** the calendar navigates to the next/previous month and updates the event indicators accordingly

**AC-003.4: List vs. calendar toggle**
- **Given** I am viewing events for the month
- **When** I toggle between "List" and "Calendar" views
- **Then** the same events are displayed in either a chronological list format or a calendar grid format, and my preference is remembered

---

## US-EVENT-004: Filter Events by Category and District

**As a** visitor,
**I want to** filter events by category and Berlin district,
**so that** I can find events that match my interests and are convenient to reach.

### Acceptance Criteria

**AC-004.1: Category filter**
- **Given** I am on the events listing page
- **When** I open the category filter
- **Then** I see checkboxes or chips for categories such as: "Music & Concerts," "Art & Exhibitions," "Food & Markets," "Sports & Fitness," "Nightlife & Parties," "Theater & Performance," "Family & Kids," "Festivals," "Tours & Walks," "Workshops," and "Networking"

**AC-004.2: District filter**
- **Given** I am on the events listing page
- **When** I open the district filter
- **Then** I see a list of Berlin districts (Bezirke): Mitte, Friedrichshain-Kreuzberg, Pankow (Prenzlauer Berg), Charlottenburg-Wilmersdorf, Tempelhof-Schoeneberg, Neukoelln, Treptow-Koepenick, Steglitz-Zehlendorf, Spandau, Reinickendorf, Marzahn-Hellersdorf, and Lichtenberg

**AC-004.3: Combined filtering**
- **Given** I have selected one or more categories and one or more districts
- **When** the filter is applied
- **Then** the events list shows only events matching ALL selected criteria (intersection), and the active filter count is displayed on the filter button

**AC-004.4: Filter URL persistence**
- **Given** I have applied filters
- **When** I copy the current URL and share it or revisit it
- **Then** the same filters are applied (filters are encoded in the URL query parameters)

**AC-004.5: Clear filters**
- **Given** I have active filters applied
- **When** I click "Clear all filters"
- **Then** all filters are removed and the full unfiltered events list is displayed

**AC-004.6: Filter result count**
- **Given** I apply or change a filter
- **When** the filtered list updates
- **Then** I see a count of matching events (e.g., "Showing 42 events") and the list updates without a full page reload

**AC-004.7: Price filter**
- **Given** I am on the events listing page
- **When** I use the price filter
- **Then** I can filter by "Free," "Under 10 EUR," "10-25 EUR," "25-50 EUR," and "50+ EUR"

---

## US-EVENT-005: View Events on Map

**As a** visitor,
**I want to** view events on an interactive map of Berlin,
**so that** I can see where events are happening and find events near me or in specific areas.

### Acceptance Criteria

**AC-005.1: Map view toggle**
- **Given** I am on the events listing page
- **When** I click "Map View"
- **Then** the page displays an interactive map of Berlin with event location pins, alongside a scrollable event list panel

**AC-005.2: Event pins**
- **Given** I am viewing the map
- **When** events are plotted on the map
- **Then** each event is represented by a pin colored or iconized by category, and clustered pins show a count number when events are close together at the current zoom level

**AC-005.3: Pin click interaction**
- **Given** I am viewing the events map
- **When** I click on an event pin (or a cluster that expands to individual pins)
- **Then** a popup card appears showing the event image, title, date/time, venue, and a "View details" link

**AC-005.4: Map and list synchronization**
- **Given** I am viewing the split map/list view
- **When** I hover over an event in the list panel
- **Then** the corresponding pin on the map is highlighted, and vice versa

**AC-005.5: Map filters**
- **Given** I have category or district filters applied
- **When** I switch to map view
- **Then** only filtered events are shown as pins on the map

**AC-005.6: Geolocation**
- **Given** I am viewing the events map
- **When** I click "Near me" and grant location permission
- **Then** the map centers on my current location and shows nearby events, with distance indicators on the event cards

**AC-005.7: Map responsiveness**
- **Given** I am viewing the events map on a mobile device
- **When** the page loads
- **Then** the map takes full width with a collapsible list panel that can be swiped up from the bottom

---

## US-EVENT-006: View Event Details

**As a** visitor,
**I want to** view the full details of an event,
**so that** I can learn everything I need to know before deciding to attend.

### Acceptance Criteria

**AC-006.1: Event detail page display**
- **Given** I click on an event card or pin
- **When** the event detail page loads
- **Then** I see comprehensive event information including: hero image or image gallery, event title, date and time (with day of week), venue name and address, district, interactive map showing venue location, category tags, ticket price (or "Free"), event description (rich text with formatting, images, and links), organizer information, and website/ticket purchase link

**AC-006.2: Recurring event display**
- **Given** an event is recurring (e.g., every Wednesday)
- **When** I view the event detail page
- **Then** I see the recurrence pattern clearly stated (e.g., "Every Wednesday, 7:00 PM - 10:00 PM") and a list of upcoming dates for this recurring event

**AC-006.3: Venue information**
- **Given** I am viewing event details
- **When** I look at the venue section
- **Then** I see the venue name (clickable to view other events at this venue), full address, interactive map snippet, and transit information (nearest U-Bahn/S-Bahn station if available)

**AC-006.4: Ticket/booking link**
- **Given** the event has a ticket purchase URL
- **When** I click "Get Tickets" or "Book Now"
- **Then** I am directed to the external ticketing site in a new tab, with a note that I am leaving ILoveBerlin

**AC-006.5: Event status indicators**
- **Given** an event has a special status
- **When** I view the event page
- **Then** I see appropriate status badges: "Sold Out," "Last Few Tickets," "Cancelled," "Postponed," or "Updated" with relevant details

**AC-006.6: Social proof**
- **Given** I am viewing an event detail page
- **When** I look at the engagement section
- **Then** I see how many users have bookmarked this event (e.g., "42 people interested")

---

## US-EVENT-007: Add Event to Calendar

**As a** visitor,
**I want to** add an event to my personal calendar,
**so that** I do not forget about it and have all the details saved.

### Acceptance Criteria

**AC-007.1: Add to calendar button**
- **Given** I am on an event detail page
- **When** I click the "Add to Calendar" button
- **Then** I see options for: Google Calendar, Apple Calendar (.ics download), Outlook (.ics download), and Yahoo Calendar

**AC-007.2: Calendar event content**
- **Given** I add an event to my calendar
- **When** the calendar entry is created
- **Then** it includes: event title, start and end date/time (with correct timezone, Europe/Berlin), venue name and address in the location field, a brief description with a link back to the event page on ILoveBerlin, and any ticket/booking URL

**AC-007.3: Google Calendar integration**
- **Given** I click "Add to Google Calendar"
- **When** the action is performed
- **Then** a new tab opens with Google Calendar's event creation form pre-populated with the event details

**AC-007.4: ICS file download**
- **Given** I click "Apple Calendar" or "Outlook"
- **When** the action is performed
- **Then** an .ics file is downloaded that I can open with my default calendar application, and the file is properly formatted per the iCalendar (RFC 5545) specification

---

## US-EVENT-008: Bookmark Events

**As a** user,
**I want to** bookmark events I am interested in,
**so that** I can keep track of them and access them easily from my profile.

### Acceptance Criteria

**AC-008.1: Bookmark an event**
- **Given** I am logged in and viewing an event (from the listing or detail page)
- **When** I click the bookmark/heart icon
- **Then** the event is added to my bookmarks, the icon fills/changes state, and a toast notification confirms "Event bookmarked"

**AC-008.2: Remove event bookmark**
- **Given** I am viewing a bookmarked event
- **When** I click the filled bookmark icon
- **Then** the event is removed from my bookmarks with confirmation

**AC-008.3: Unauthenticated bookmark**
- **Given** I am a visitor (not logged in)
- **When** I click the bookmark icon on an event
- **Then** the system prompts me to log in with "Log in to bookmark this event"

**AC-008.4: Bookmarked events in profile**
- **Given** I have bookmarked events
- **When** I navigate to My Bookmarks > Events
- **Then** I see my bookmarked events sorted by event date (soonest first), with expired events shown separately at the bottom with an "Past" label

**AC-008.5: Upcoming event reminder**
- **Given** I have bookmarked an event and have notifications enabled
- **When** the event is 24 hours away
- **Then** I receive a notification (push or email, based on my preferences) reminding me about the bookmarked event

---

## US-EVENT-009: Create and Manage Events (Editor)

**As an** editor,
**I want to** create and manage events on the platform,
**so that** Berlin visitors and residents can discover upcoming activities.

### Acceptance Criteria

**AC-009.1: Access event editor**
- **Given** I am logged in as an editor
- **When** I navigate to Admin Panel > Events > Create New Event
- **Then** I see an event creation form with fields for: title, description (rich text), date and time (start and end), recurrence settings, venue selector (from existing venues or create new), category selector, image upload (hero and gallery), ticket price, ticket URL, organizer name, organizer URL, and tags

**AC-009.2: Venue selector**
- **Given** I am creating an event
- **When** I use the venue field
- **Then** I can search existing venues (with autocomplete), select a venue (which auto-fills address and map location), or create a new venue inline by entering name, address, and confirming the map pin location

**AC-009.3: Recurring event creation**
- **Given** I am creating a recurring event
- **When** I enable the "Recurring" toggle
- **Then** I can set the recurrence pattern (daily, weekly on specific days, monthly, or custom), an end condition (end date, number of occurrences, or never), and the system generates individual event instances

**AC-009.4: Event status management**
- **Given** I am managing an existing event
- **When** I update the event status
- **Then** I can set it to: Active, Cancelled (with optional reason), Postponed (with new date if known), Sold Out, or Draft

**AC-009.5: Bulk event management**
- **Given** I am on the events management dashboard
- **When** I select multiple events
- **Then** I can perform bulk actions: publish, unpublish, delete, or change category

**AC-009.6: Event management dashboard**
- **Given** I am an editor
- **When** I navigate to Admin Panel > Events
- **Then** I see a filterable, sortable table of all events with columns: title, date, venue, category, status, bookmarks count, and actions (edit, duplicate, delete)

**AC-009.7: Duplicate event**
- **Given** I am viewing an event in the management dashboard
- **When** I click "Duplicate"
- **Then** a new event is created pre-populated with the original event's details (except date), and I can modify it before saving

---

## US-EVENT-010: Moderate Submitted Events (Admin)

**As an** admin,
**I want to** moderate events submitted by community members or external sources,
**so that** I can ensure event quality and prevent spam or inappropriate content.

### Acceptance Criteria

**AC-010.1: Submission review queue**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Events > Submissions
- **Then** I see a queue of submitted events pending review, sorted by submission date (oldest first), with each submission showing title, submitter info, date, venue, and submission timestamp

**AC-010.2: Review submitted event**
- **Given** I am viewing a submitted event in the review queue
- **When** I click "Review"
- **Then** I see the full event details as submitted, with options to edit any field before approving

**AC-010.3: Approve submission**
- **Given** I am reviewing a submitted event
- **When** I click "Approve" (after any edits)
- **Then** the event is published on the platform, the submitter receives a notification "Your event has been approved and published," and the submission is removed from the queue

**AC-010.4: Reject submission**
- **Given** I am reviewing a submitted event
- **When** I click "Reject" and provide a reason
- **Then** the submission is removed from the queue, the submitter receives a notification with the rejection reason, and the rejected submission is logged for audit purposes

**AC-010.5: Flag for spam**
- **Given** I am reviewing a submitted event
- **When** I click "Flag as Spam"
- **Then** the submission is removed, the submitter's account is flagged for review, and future submissions from this account require manual approval

---

## US-EVENT-011: Manage Venues (Admin)

**As an** admin,
**I want to** manage the venue database,
**so that** events have consistent, accurate location information.

### Acceptance Criteria

**AC-011.1: View venues**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Events > Venues
- **Then** I see a searchable, sortable list of all venues with: name, address, district, event count, and status (active/inactive)

**AC-011.2: Create venue**
- **Given** I am on the venues management page
- **When** I click "Add Venue" and enter the name, address, district, description, website URL, capacity, and map coordinates (with pin-drop map interface)
- **Then** the venue is created and available for editors to use when creating events

**AC-011.3: Edit venue**
- **Given** I am editing a venue
- **When** I modify the venue details and save
- **Then** the changes are reflected across all events associated with that venue

**AC-011.4: Merge duplicate venues**
- **Given** I identify duplicate venue entries
- **When** I select them and click "Merge"
- **Then** the system merges the venues into one, reassigns all events to the merged venue, and deletes the duplicate

**AC-011.5: Deactivate venue**
- **Given** a venue has permanently closed
- **When** I deactivate the venue
- **Then** it is no longer available for new event creation but remains associated with historical events with a "Venue closed" note

---

## Cross-Cutting Concerns

### Performance
- Event listing pages must load within 2 seconds
- Map view must initialize within 3 seconds with pin rendering
- Calendar view must be smoothly navigable without lag
- Event images must be lazy-loaded and served in optimized formats

### SEO
- Each event must have a unique canonical URL with a human-readable slug
- Event structured data (JSON-LD, Event schema) must include name, startDate, endDate, location, description, image, offers (price), and organizer
- Expired event pages should remain accessible with a "This event has ended" notice and related upcoming event suggestions

### Accessibility
- Calendar navigation must be fully keyboard-accessible
- Map view must provide a list-based alternative for screen reader users
- Event dates and times must be marked up with <time> elements
- All interactive elements (filters, map controls) must have ARIA labels

### Timezone Handling
- All event times must be stored and displayed in Europe/Berlin timezone
- Calendar downloads must include proper timezone information (VTIMEZONE)
- Daylight saving time transitions must be handled correctly

---

*Document End*
