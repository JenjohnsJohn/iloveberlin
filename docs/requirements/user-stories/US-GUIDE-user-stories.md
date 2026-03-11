# US-GUIDE: City Guides User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** City Guides
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Editor | Content manager who can create and publish guides |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-GUIDE-001: Browse Guide Topics

**As a** visitor,
**I want to** browse available city guide topics,
**so that** I can find comprehensive guides on subjects that interest me about Berlin life.

### Acceptance Criteria

**AC-001.1: Guide topics landing page**
- **Given** I navigate to the Guides section (via main navigation or /guides)
- **When** the page loads
- **Then** I see a visually appealing grid of guide topic cards, each displaying a cover image, topic title, subtitle/description, number of guides within the topic, and a category icon

**AC-001.2: Topic categories**
- **Given** I am on the guides landing page
- **When** I view the available topics
- **Then** topics are organized under broad categories such as "Moving to Berlin," "Neighborhoods," "Food & Drink," "Culture & Nightlife," "Practical Info," "Family," and "Day Trips," and I can filter by category

**AC-001.3: Topic card click-through**
- **Given** I am viewing guide topic cards
- **When** I click on a topic card (e.g., "Registering Your Address in Berlin")
- **Then** I am navigated to the topic page showing all guides under that topic

**AC-001.4: Topic page display**
- **Given** I am on a specific topic page
- **When** the page loads
- **Then** I see a topic header with cover image, title, and description, followed by a list of all guides in that topic with their titles, brief descriptions, estimated reading times, and last-updated dates, ordered by editorial priority

**AC-001.5: Search guides**
- **Given** I am on the guides landing page
- **When** I type a search query in the guide search bar
- **Then** the system returns matching guides and topics, searching across titles, descriptions, and body content, with results highlighted

**AC-001.6: Popular guides highlight**
- **Given** I am on the guides landing page
- **When** I view the page
- **Then** I see a "Most Popular Guides" section at the top showing the 4-6 most-viewed guides across all topics

**AC-001.7: Responsive grid layout**
- **Given** I am browsing guide topics on a mobile device
- **When** the page loads
- **Then** the topic grid adapts to a single-column layout with horizontally scrollable category filters and appropriately sized images

---

## US-GUIDE-002: Read Guide with Table of Contents

**As a** visitor,
**I want to** read a comprehensive guide with a clear table of contents,
**so that** I can access well-structured, in-depth information about a specific Berlin topic.

### Acceptance Criteria

**AC-002.1: Guide page layout**
- **Given** I click on a guide from a topic page or search results
- **When** the guide page loads
- **Then** I see a structured layout with: hero image, guide title, last-updated date, estimated reading time, author attribution, a table of contents (ToC) sidebar or inline block, and the full guide body content

**AC-002.2: Table of contents generation**
- **Given** the guide content contains heading elements (H2 and H3)
- **When** the page renders
- **Then** an automatic table of contents is generated listing all H2 headings as primary entries and H3 headings as nested sub-entries, each linked to its corresponding section in the content

**AC-002.3: Table of contents placement**
- **Given** I am reading a guide on desktop
- **When** the page loads
- **Then** the ToC is displayed as a sticky sidebar on the left side that remains visible as I scroll through the content

**AC-002.4: Mobile ToC**
- **Given** I am reading a guide on a mobile device
- **When** the page loads
- **Then** the ToC is displayed as a collapsible block at the top of the article (below the hero image), and I can expand/collapse it by tapping a "Table of Contents" header

**AC-002.5: Rich content support**
- **Given** I am reading a guide
- **When** I scroll through the content
- **Then** the guide supports rich content elements including: formatted text (headings, paragraphs, bold, italic, lists), images with captions and alt text, embedded maps (Google Maps or OpenStreetMap), info boxes and callout blocks (tips, warnings, important notes), tables for structured data, embedded videos, step-by-step numbered instructions, and hyperlinks to external resources and internal content

**AC-002.6: Related guides**
- **Given** I have finished reading a guide
- **When** I scroll past the content
- **Then** I see a "Related Guides" section showing 3-4 guides from the same topic or related topics

**AC-002.7: Guide freshness indicator**
- **Given** I am reading a guide
- **When** I look at the metadata section
- **Then** I see a "Last verified" date indicating when the information was last checked for accuracy, with a visual indicator if the guide is older than 6 months (e.g., "This guide may need updating")

**AC-002.8: Print-friendly version**
- **Given** I am reading a guide
- **When** I click "Print" or use the browser's print function
- **Then** the page renders in a print-friendly layout with navigation elements removed, optimized typography, and proper page breaks

---

## US-GUIDE-003: Navigate via Table of Contents

**As a** visitor,
**I want to** navigate within a guide using the table of contents,
**so that** I can jump directly to the section I need without scrolling through the entire guide.

### Acceptance Criteria

**AC-003.1: Click-to-scroll navigation**
- **Given** I am reading a guide with a visible table of contents
- **When** I click on a ToC entry (e.g., "Step 3: Required Documents")
- **Then** the page smoothly scrolls to the corresponding section heading, with the heading positioned near the top of the viewport (accounting for any fixed header)

**AC-003.2: Active section highlighting**
- **Given** I am scrolling through a guide with the ToC sidebar visible
- **When** I scroll past different sections
- **Then** the corresponding ToC entry is highlighted (e.g., bold text or a colored left border) to indicate my current position in the guide

**AC-003.3: URL hash update**
- **Given** I navigate to a section via the ToC
- **When** the page scrolls to the target section
- **Then** the URL hash updates to reflect the current section (e.g., /guides/registering-address#required-documents) so I can share a direct link to that section

**AC-003.4: Direct section linking**
- **Given** someone shares a guide URL with a section hash
- **When** I open the link
- **Then** the page loads and automatically scrolls to the referenced section

**AC-003.5: Back-to-top navigation**
- **Given** I am deep into a long guide
- **When** I scroll down significantly
- **Then** a "Back to top" floating button appears that, when clicked, smoothly scrolls me back to the top of the guide and the ToC

**AC-003.6: Keyboard navigation**
- **Given** I am reading a guide and using keyboard navigation
- **When** I tab through the ToC entries and press Enter
- **Then** the page scrolls to the selected section, and focus moves to the section heading

---

## US-GUIDE-004: Bookmark Guide

**As a** user,
**I want to** bookmark a guide for easy access later,
**so that** I can save useful Berlin guides to reference when needed.

### Acceptance Criteria

**AC-004.1: Bookmark a guide**
- **Given** I am logged in and reading a guide
- **When** I click the bookmark icon on the guide page
- **Then** the guide is added to my bookmarks under the "Guides" category, the icon changes to a filled state, and a toast notification confirms "Guide bookmarked"

**AC-004.2: Remove bookmark**
- **Given** I am viewing a guide I have previously bookmarked
- **When** I click the filled bookmark icon
- **Then** the guide is removed from my bookmarks, the icon returns to outline, and a toast confirms "Bookmark removed"

**AC-004.3: Unauthenticated bookmark attempt**
- **Given** I am a visitor (not logged in)
- **When** I click the bookmark icon on a guide
- **Then** the system prompts me to log in with "Log in to bookmark this guide"

**AC-004.4: View bookmarked guides**
- **Given** I have bookmarked one or more guides
- **When** I navigate to My Bookmarks and filter by "Guides"
- **Then** I see all my bookmarked guides with their titles, topics, and bookmark dates

---

## US-GUIDE-005: Create and Edit Guides (Editor)

**As an** editor,
**I want to** create and edit comprehensive city guides using a structured editor,
**so that** I can provide visitors with high-quality, well-organized information about Berlin.

### Acceptance Criteria

**AC-005.1: Access guide editor**
- **Given** I am logged in as an editor
- **When** I navigate to Admin Panel > Guides > Create New Guide
- **Then** I see a structured guide editor with fields for: title, subtitle, topic selector (existing topics or create new), cover image upload, meta description, and a rich content editor with support for all guide content elements

**AC-005.2: Structured content sections**
- **Given** I am composing a guide
- **When** I add content
- **Then** I can structure the guide using H2 and H3 headings that automatically populate the ToC preview shown alongside the editor

**AC-005.3: Special content blocks**
- **Given** I am editing a guide
- **When** I use the block inserter
- **Then** I can add special content blocks including: tip boxes (blue), warning boxes (yellow), important/alert boxes (red), step-by-step instruction blocks (numbered), image galleries, embedded maps with custom pins, comparison tables, and FAQ accordion sections

**AC-005.4: Save and publish workflow**
- **Given** I am editing a guide
- **When** I complete the content
- **Then** I can save it as a Draft, submit it for Review, or Publish it directly (if I have publishing permissions), with the same workflow states as articles (Draft, In Review, Approved, Published, Archived)

**AC-005.5: Guide preview**
- **Given** I am editing a guide
- **When** I click "Preview"
- **Then** a new tab shows the guide exactly as readers will see it, including the auto-generated ToC, all content blocks, and proper layout

**AC-005.6: Set last-verified date**
- **Given** I am editing an existing published guide
- **When** I have verified the guide content is still accurate
- **Then** I can update the "Last verified" date without changing the original publication date, and this is reflected on the public guide page

**AC-005.7: Manage guide ordering within topic**
- **Given** I am managing guides within a topic
- **When** I access the topic management page
- **Then** I can drag and drop guides to set their display order within the topic

**AC-005.8: SEO fields**
- **Given** I am editing a guide
- **When** I expand the SEO section
- **Then** I can set the meta title (max 60 characters), meta description (max 160 characters), URL slug, and Open Graph image, with character count indicators

---

## US-GUIDE-006: Manage Guide Topics (Admin)

**As an** admin,
**I want to** manage guide topics and their organization,
**so that** the guides section is well-structured and easy for visitors to navigate.

### Acceptance Criteria

**AC-006.1: View topics**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Guides > Topics
- **Then** I see a list of all topics with their names, categories, guide counts, cover images, status (active/hidden), and display order

**AC-006.2: Create topic**
- **Given** I am on the topics management page
- **When** I click "Add Topic" and enter a name, slug, description, category, cover image, and icon
- **Then** the new topic is created and available for editors to assign guides to

**AC-006.3: Edit topic**
- **Given** I am on the topics management page
- **When** I click "Edit" on an existing topic
- **Then** I can modify the topic name, slug, description, category, cover image, and icon, with changes reflected across the site

**AC-006.4: Delete topic**
- **Given** I attempt to delete a topic that contains guides
- **When** I click "Delete"
- **Then** the system requires me to first reassign all guides to another topic, or confirm deletion of the topic and all contained guides

**AC-006.5: Reorder topics**
- **Given** I am on the topics management page
- **When** I drag and drop topic cards
- **Then** the display order updates on the public guides landing page

**AC-006.6: Manage topic categories**
- **Given** I am on the topics management page
- **When** I click "Manage Categories"
- **Then** I can create, edit, reorder, and delete the broad categories (e.g., "Moving to Berlin," "Neighborhoods") that organize topics on the landing page

**AC-006.7: Topic analytics**
- **Given** I am viewing a topic in the admin panel
- **When** I click "Analytics"
- **Then** I see aggregate metrics for the topic including total views across all guides, most popular guides, average reading time, and traffic sources

---

## Cross-Cutting Concerns

### Performance
- Guide pages must load within 2 seconds on a standard connection
- Embedded maps must be lazy-loaded to avoid blocking page render
- Images must be served in next-gen formats with responsive srcsets
- The ToC sidebar must not cause layout shifts during page load

### SEO
- Each guide must have a unique canonical URL with a human-readable slug
- Structured data (JSON-LD) must include HowTo or Article schema as appropriate
- Topic pages must have proper heading hierarchy and meta tags
- Internal linking between related guides must be encouraged for SEO benefits

### Accessibility
- Guide content must meet WCAG 2.1 AA standards
- All images must have descriptive alt text
- The ToC must be navigable via keyboard and screen readers
- Special content blocks (tips, warnings) must use appropriate ARIA roles
- Embedded maps must have text-based alternatives for key location information

### Content Maintenance
- Guides with a "Last verified" date older than 12 months should be flagged in the admin dashboard
- Editors should receive quarterly reminders to review and update assigned guides
- Broken links within guides should be detected and reported automatically

---

*Document End*
