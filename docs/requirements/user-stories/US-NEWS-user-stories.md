# US-NEWS: News & Articles User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** News & Articles
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Author | Content contributor who can draft articles |
| Editor | Content manager who can publish and manage articles |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-NEWS-001: Browse Articles by Category

**As a** visitor,
**I want to** browse news articles filtered by category,
**so that** I can find content relevant to my interests in Berlin.

### Acceptance Criteria

**AC-001.1: Category listing page**
- **Given** I navigate to the News section
- **When** the page loads
- **Then** I see a list of available categories (e.g., "Culture," "Food & Drink," "Nightlife," "Politics," "Expat Life," "Things to Do," "Berlin History") displayed as navigation tabs or a sidebar menu

**AC-001.2: Category filter**
- **Given** I am on the news listing page
- **When** I click on a category (e.g., "Culture")
- **Then** the article list filters to show only articles in the "Culture" category, the URL updates to reflect the selected category (e.g., /news/culture), and the selected category is visually highlighted

**AC-001.3: Article card display**
- **Given** I am browsing articles (with or without a category filter)
- **When** I view the article list
- **Then** each article card displays: a featured image thumbnail, headline, author name with avatar, publication date, category badge, estimated reading time, and a brief excerpt (first 150 characters)

**AC-001.4: Sorting options**
- **Given** I am on the article listing page
- **When** I use the sort control
- **Then** I can sort articles by "Newest first" (default), "Most popular," or "Most discussed"

**AC-001.5: Pagination**
- **Given** there are more than 12 articles matching my current filters
- **When** I reach the bottom of the list
- **Then** I can load more articles via infinite scroll or a "Load more" button, loading 12 articles at a time

**AC-001.6: No results**
- **Given** I have selected a category with no published articles
- **When** I view the filtered list
- **Then** the system displays "No articles found in this category yet" with a suggestion to browse other categories

---

## US-NEWS-002: Read Article

**As a** visitor,
**I want to** read a full news article with rich content,
**so that** I can stay informed about topics relevant to Berlin.

### Acceptance Criteria

**AC-002.1: Article page display**
- **Given** I click on an article card from any listing
- **When** the article page loads
- **Then** I see the full article with: hero image (full-width), headline, author name and avatar, publication date, estimated reading time, category/tag badges, and the article body rendered from rich text (supporting headings, paragraphs, bold/italic, block quotes, embedded images with captions, embedded videos, and hyperlinks)

**AC-002.2: Reading progress indicator**
- **Given** I am reading a long article
- **When** I scroll through the content
- **Then** a progress bar at the top of the page indicates how far I have read (percentage-based)

**AC-002.3: Author information**
- **Given** I am reading an article
- **When** I look at the author section (at top and bottom of article)
- **Then** I see the author's name, avatar, short bio, and a link to view all articles by that author

**AC-002.4: Related articles**
- **Given** I have finished reading an article
- **When** I scroll past the article content
- **Then** I see a "Related Articles" section showing 3-4 articles from the same category or with matching tags

**AC-002.5: SEO and sharing metadata**
- **Given** the article page is loaded
- **When** search engines or social platforms access the page
- **Then** proper meta tags are present including: Open Graph title, description, and image; Twitter Card metadata; canonical URL; structured data (Article schema via JSON-LD); and a descriptive page title

**AC-002.6: Responsive article layout**
- **Given** I am reading an article on a mobile device
- **When** the page loads
- **Then** the content is formatted for comfortable mobile reading with appropriate font sizes, image scaling, and no horizontal scrolling

---

## US-NEWS-003: Bookmark Article

**As a** user,
**I want to** bookmark an article to save it for later,
**so that** I can easily return to content I find interesting.

### Acceptance Criteria

**AC-003.1: Bookmark an article**
- **Given** I am logged in and reading an article
- **When** I click the bookmark icon (outline) on the article page
- **Then** the icon changes to a filled state, the article is added to my bookmarks, and a brief toast notification confirms "Article bookmarked"

**AC-003.2: Remove bookmark**
- **Given** I am logged in and viewing an article I have previously bookmarked
- **When** I click the bookmark icon (filled)
- **Then** the icon returns to the outline state, the article is removed from my bookmarks, and a toast notification confirms "Bookmark removed"

**AC-003.3: Bookmark from listing**
- **Given** I am logged in and browsing the article listing page
- **When** I click the bookmark icon on an article card
- **Then** the article is bookmarked without navigating away from the listing page

**AC-003.4: Unauthenticated bookmark attempt**
- **Given** I am a visitor (not logged in)
- **When** I click the bookmark icon on an article
- **Then** the system prompts me to log in or register with the message "Log in to bookmark this article" and a link to the login page

**AC-003.5: Bookmark persistence**
- **Given** I have bookmarked an article
- **When** I return to that article later (even in a different session)
- **Then** the bookmark icon is shown in its filled state, indicating it is already bookmarked

---

## US-NEWS-004: Share Article

**As a** visitor,
**I want to** share an article via social media, messaging apps, or a direct link,
**so that** I can pass along interesting Berlin content to friends and family.

### Acceptance Criteria

**AC-004.1: Share button availability**
- **Given** I am reading an article
- **When** I look at the article toolbar (top or floating sidebar)
- **Then** I see a share button/icon

**AC-004.2: Share options modal**
- **Given** I am reading an article
- **When** I click the share button
- **Then** a share modal or popover appears with options: Copy Link, Share to Facebook, Share to X (Twitter), Share to LinkedIn, Share via WhatsApp, Share via Telegram, and Share via Email

**AC-004.3: Copy link**
- **Given** the share modal is open
- **When** I click "Copy Link"
- **Then** the article's canonical URL is copied to my clipboard and a confirmation message "Link copied!" is displayed

**AC-004.4: Social media share**
- **Given** the share modal is open
- **When** I click a social media platform (e.g., Facebook)
- **Then** a new window opens with the platform's share dialog pre-populated with the article's URL, title, and description (via Open Graph tags)

**AC-004.5: Native sharing on mobile**
- **Given** I am reading an article on a mobile device that supports the Web Share API
- **When** I click the share button
- **Then** the system invokes the native OS share sheet instead of the custom share modal

**AC-004.6: Share tracking**
- **Given** a share action is performed
- **When** the share completes
- **Then** the system increments the share count for analytics purposes (displayed only in admin/editor dashboards, not publicly)

---

## US-NEWS-005: Search Articles

**As a** visitor,
**I want to** search for articles by keyword,
**so that** I can find specific topics or content I am looking for.

### Acceptance Criteria

**AC-005.1: Search input**
- **Given** I am on any page of the news section
- **When** I locate the search bar (in the header or news section navigation)
- **Then** I see a prominent search input with placeholder text "Search articles..."

**AC-005.2: Search execution**
- **Given** I have typed a search query (minimum 2 characters)
- **When** I press Enter or click the search icon
- **Then** the system returns matching articles ranked by relevance, searching across article titles, body content, tags, and author names

**AC-005.3: Search suggestions**
- **Given** I am typing in the search field
- **When** I have entered 3 or more characters
- **Then** the system displays up to 5 autocomplete suggestions based on article titles and popular search terms, updating as I type (debounced at 300ms)

**AC-005.4: Search results display**
- **Given** a search has been performed
- **When** results are returned
- **Then** each result shows the article thumbnail, headline with search terms highlighted, excerpt with search terms highlighted, publication date, and category badge

**AC-005.5: No search results**
- **Given** a search has been performed
- **When** no articles match the query
- **Then** the system displays "No articles found for '[query]'" with suggestions: "Try different keywords" or "Browse by category"

**AC-005.6: Search filters**
- **Given** search results are displayed
- **When** I use the filter options
- **Then** I can narrow results by category, date range (e.g., "Past week," "Past month," "Past year"), and sort by relevance or date

---

## US-NEWS-006: Create and Edit Articles (Editor)

**As an** editor,
**I want to** create and edit articles using a rich text editor,
**so that** I can produce engaging, well-formatted content for the platform.

### Acceptance Criteria

**AC-006.1: Access article editor**
- **Given** I am logged in as an editor
- **When** I navigate to Admin Panel > Articles > Create New
- **Then** I see a full-featured article editor with fields for: headline, subtitle, featured image upload, category selector, tags input, author attribution, and a rich text body editor

**AC-006.2: Rich text editing**
- **Given** I am in the article editor
- **When** I compose content in the body field
- **Then** the rich text editor supports: headings (H2-H4), paragraphs, bold, italic, underline, strikethrough, ordered and unordered lists, block quotes, hyperlinks, inline code, horizontal rules, embedded images (with upload, caption, and alt text), embedded YouTube/Vimeo videos, and content blocks/callouts

**AC-006.3: Image management**
- **Given** I am editing an article
- **When** I insert an image
- **Then** I can upload an image (drag-and-drop or file picker), add a caption and alt text, select alignment (left, center, right, full-width), and the image is automatically optimized (resized, compressed, converted to WebP)

**AC-006.4: Save as draft**
- **Given** I am composing an article
- **When** I click "Save Draft"
- **Then** the article is saved with a "Draft" status, is not visible to the public, and I receive confirmation "Draft saved successfully"

**AC-006.5: Auto-save**
- **Given** I am editing an article
- **When** I make changes and pause typing for 30 seconds
- **Then** the system automatically saves the current state as a draft and displays a subtle "Auto-saved at [time]" indicator

**AC-006.6: Preview article**
- **Given** I am editing an article
- **When** I click "Preview"
- **Then** a new tab opens showing the article exactly as it will appear to readers on the published site, including all formatting, images, and embedded content

**AC-006.7: SEO fields**
- **Given** I am editing an article
- **When** I expand the "SEO" section
- **Then** I can edit the meta title (with character count, max 60), meta description (with character count, max 160), URL slug (auto-generated from headline, editable), and Open Graph image override

**AC-006.8: Edit existing article**
- **Given** I am logged in as an editor
- **When** I navigate to an existing article and click "Edit"
- **Then** the article editor opens pre-populated with the current content, and I can make and save changes

**AC-006.9: Revision history**
- **Given** I am editing an article
- **When** I click "Revision History"
- **Then** I see a list of all previous versions with timestamps and editor names, and I can view or restore any previous version

---

## US-NEWS-007: Manage Editorial Workflow (Editor)

**As an** editor,
**I want to** manage the editorial workflow including review, approval, and publishing,
**so that** articles go through a quality control process before being published.

### Acceptance Criteria

**AC-007.1: Workflow statuses**
- **Given** I am managing articles
- **When** I view the article management dashboard
- **Then** articles can be in one of the following statuses: Draft, In Review, Approved, Published, Unpublished, and Archived

**AC-007.2: Submit for review**
- **Given** I am an author who has finished drafting an article
- **When** I click "Submit for Review"
- **Then** the article status changes to "In Review," the assigned editor receives a notification, and I can no longer edit the article until it is returned to me

**AC-007.3: Review and approve**
- **Given** I am an editor reviewing an article in "In Review" status
- **When** I click "Approve"
- **Then** the article status changes to "Approved" and I can proceed to publish it

**AC-007.4: Request changes**
- **Given** I am an editor reviewing an article
- **When** I click "Request Changes" and add a comment explaining the required revisions
- **Then** the article status changes back to "Draft," the author receives a notification with the comments, and the author can make changes and resubmit

**AC-007.5: Publish article**
- **Given** I am an editor with an approved article
- **When** I click "Publish" or "Schedule Publish" (with a date/time)
- **Then** the article status changes to "Published," it becomes visible to the public on the site (immediately or at the scheduled time), and the publication date/time is recorded

**AC-007.6: Unpublish article**
- **Given** I am an editor and an article is currently published
- **When** I click "Unpublish"
- **Then** the article is removed from public visibility, its status changes to "Unpublished," and the URL returns a 404 or redirect as configured

**AC-007.7: Article management dashboard**
- **Given** I am an editor
- **When** I navigate to Admin Panel > Articles
- **Then** I see a filterable, sortable table of all articles with columns for: title, author, status, category, published date, and last updated date, with bulk action capabilities

---

## US-NEWS-008: Manage Categories and Tags (Admin)

**As an** admin,
**I want to** manage the article categories and tags,
**so that** content is well-organized and discoverable by readers.

### Acceptance Criteria

**AC-008.1: View categories**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > News > Categories
- **Then** I see a list of all categories with their names, slugs, descriptions, article counts, and display order

**AC-008.2: Create category**
- **Given** I am on the categories management page
- **When** I click "Add Category" and enter a name, slug, description, and optional icon/image
- **Then** the new category is created and available for editors to assign to articles

**AC-008.3: Edit category**
- **Given** I am on the categories management page
- **When** I click "Edit" on an existing category
- **Then** I can modify the category name, slug, description, and icon/image, and changes are reflected across all associated articles

**AC-008.4: Delete category**
- **Given** I am on the categories management page
- **When** I click "Delete" on a category that has articles assigned to it
- **Then** the system prompts me to reassign the articles to another category before deletion, or merge the category with an existing one

**AC-008.5: Reorder categories**
- **Given** I am on the categories management page
- **When** I drag and drop categories to reorder them
- **Then** the display order is updated across the site (navigation, filters)

**AC-008.6: Manage tags**
- **Given** I am on the Admin Panel > News > Tags page
- **When** I view the tags list
- **Then** I see all tags with their names, article counts, and can create, edit, merge, or delete tags

**AC-008.7: Merge tags**
- **Given** I want to consolidate duplicate or similar tags
- **When** I select two or more tags and click "Merge"
- **Then** the system merges them into a single tag, updating all associated articles, and the secondary tags are deleted

---

## Cross-Cutting Concerns

### Performance
- Article listing pages must load within 2 seconds
- Full article pages must achieve a Largest Contentful Paint (LCP) under 2.5 seconds
- Search results must return within 500ms
- Images must be lazy-loaded and served in next-gen formats (WebP/AVIF)

### SEO
- Every article must have a unique canonical URL with human-readable slug
- Category pages must include proper pagination with rel="next" and rel="prev"
- Article structured data (JSON-LD) must include headline, datePublished, dateModified, author, publisher, and image

### Analytics
- Every article view must be tracked for analytics (unique views, total views, average read time)
- Editors must have access to article performance metrics in their dashboard
- Popular articles should be surfaced in "Trending" sections based on view velocity

### Accessibility
- All article content must meet WCAG 2.1 AA standards
- Images must have descriptive alt text
- Videos must have captions or transcripts
- Article pages must have proper heading hierarchy (single H1, sequential sub-headings)

---

*Document End*
