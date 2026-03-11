# US-VIDEO: Video Content User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** Video Content
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Editor | Content manager who can manage videos and series |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-VIDEO-001: Browse Videos by Series

**As a** visitor,
**I want to** browse videos organized by series,
**so that** I can discover and follow themed video collections about Berlin.

### Acceptance Criteria

**AC-001.1: Video landing page**
- **Given** I navigate to the Video section (via main navigation or /videos)
- **When** the page loads
- **Then** I see a visually engaging page with a featured video at the top, followed by video series displayed as horizontal carousels, each series showing its title, description, episode count, and a row of episode thumbnails

**AC-001.2: Series card display**
- **Given** I am viewing the video landing page
- **When** I look at a series section
- **Then** I see the series title, a brief description, total episode count, and the latest episodes as scrollable thumbnail cards within a horizontal carousel

**AC-001.3: Series page**
- **Given** I click on a series title or "View all" link
- **When** the series page loads
- **Then** I see: the series cover image, title, full description, total episode count, and a grid or list of all episodes in the series ordered by episode number (newest first as default, with option to sort oldest first)

**AC-001.4: Episode card display**
- **Given** I am viewing a series or the video listing
- **When** I look at an episode card
- **Then** each card shows: a thumbnail with a play button overlay, video duration badge (e.g., "12:34"), episode number (if part of a series), video title, publication date, and view count

**AC-001.5: Series navigation**
- **Given** I am viewing the video landing page
- **When** I look at the series sections
- **Then** I can browse through available series via the page layout, and I see a "All Series" link that navigates to a page listing all series as cards

**AC-001.6: Responsive layout**
- **Given** I am browsing videos on a mobile device
- **When** the page loads
- **Then** the series carousels are swipeable, thumbnails are appropriately sized, and the layout adapts to a single-column format

---

## US-VIDEO-002: Browse Videos by Category

**As a** visitor,
**I want to** browse videos filtered by category,
**so that** I can find video content about specific Berlin topics that interest me.

### Acceptance Criteria

**AC-002.1: Category filter display**
- **Given** I am on the video listing page
- **When** I look at the filter options
- **Then** I see category filters such as: "Food & Drink," "Culture," "Neighborhoods," "Nightlife," "History," "Interviews," "Travel Tips," "Events," and "Behind the Scenes"

**AC-002.2: Category selection**
- **Given** I click on a category filter
- **When** the filter is applied
- **Then** the video listing shows only videos in the selected category, the URL updates (e.g., /videos?category=culture), the selected category is highlighted, and the result count is displayed

**AC-002.3: Category and series cross-filter**
- **Given** I have selected a category
- **When** I view the results
- **Then** videos are shown with their series affiliation visible, and I can further narrow results by selecting a specific series

**AC-002.4: No results**
- **Given** I select a category with no videos
- **When** the filtered list loads
- **Then** the system displays "No videos found in this category" with suggestions to explore other categories

---

## US-VIDEO-003: Watch Video

**As a** visitor,
**I want to** watch a video on a dedicated player page,
**so that** I can enjoy high-quality Berlin lifestyle video content.

### Acceptance Criteria

**AC-003.1: Video player page layout**
- **Given** I click on a video thumbnail or title
- **When** the video player page loads
- **Then** I see: a large embedded video player (16:9 aspect ratio), video title, series name (with link to series page, if applicable), publication date, view count, duration, video description (expandable if long), category tags, and share/bookmark buttons

**AC-003.2: Video playback controls**
- **Given** I am on the video player page
- **When** the video player loads
- **Then** I have standard playback controls including: play/pause, progress bar with seek capability, volume control with mute toggle, playback speed selector (0.5x, 1x, 1.25x, 1.5x, 2x), fullscreen toggle, and picture-in-picture mode (on supported browsers)

**AC-003.3: Responsive video player**
- **Given** I am watching a video on a mobile device
- **When** the page loads
- **Then** the video player scales to fill the viewport width while maintaining 16:9 aspect ratio, controls are touch-friendly, and the player supports native fullscreen mode

**AC-003.4: Auto-play next video**
- **Given** I have finished watching a video that is part of a series
- **When** the video ends
- **Then** a countdown overlay appears (10 seconds) showing the next episode in the series, and the next video auto-plays unless I cancel by clicking "Cancel" on the overlay

**AC-003.5: Video quality**
- **Given** I am watching a video
- **When** the video streams
- **Then** the player automatically selects the optimal quality based on my connection speed, with an option to manually select quality (360p, 480p, 720p, 1080p) if available

**AC-003.6: Video buffering states**
- **Given** the video is loading or buffering
- **When** playback is interrupted
- **Then** the player displays a loading spinner and resumes playback automatically once sufficient data is buffered

**AC-003.7: Video sharing**
- **Given** I am on the video player page
- **When** I click the share button
- **Then** I see options to copy the video link, share to social platforms (Facebook, X, WhatsApp, Telegram), and share via email, with proper Open Graph video tags so that shared links display a video preview

**AC-003.8: View count tracking**
- **Given** I am watching a video
- **When** I have watched at least 30 seconds of the video (or 50% for videos under 60 seconds)
- **Then** the system counts this as a view and increments the view counter

---

## US-VIDEO-004: View Related Videos

**As a** visitor,
**I want to** see related videos after or alongside the current video,
**so that** I can discover more content and continue watching.

### Acceptance Criteria

**AC-004.1: Related videos sidebar (desktop)**
- **Given** I am on a video player page on desktop
- **When** the page loads
- **Then** I see a "Related Videos" sidebar on the right side showing 6-8 related video cards, ordered by relevance (same series first, then same category, then popular)

**AC-004.2: Related videos below player (mobile)**
- **Given** I am on a video player page on mobile
- **When** I scroll below the video description
- **Then** I see a "Related Videos" section showing related video cards in a vertical list

**AC-004.3: Series continuation**
- **Given** I am watching a video that belongs to a series
- **When** I look at the related videos
- **Then** the first entries are the next and previous episodes in the series (clearly labeled, e.g., "Next Episode" and "Previous Episode"), followed by videos from the same category

**AC-004.4: Related video card interaction**
- **Given** I see a related video card
- **When** I click on it
- **Then** the page navigates to that video's player page and begins loading/playing the selected video

**AC-004.5: Up next queue**
- **Given** I am watching a series
- **When** I look at the "Up Next" area (above or within the related videos section)
- **Then** I see a clear indication of the next video that will auto-play, with its title, thumbnail, and the auto-play countdown timer (when the current video nears completion)

**AC-004.6: Related video relevance**
- **Given** the related videos are generated
- **When** the algorithm selects videos
- **Then** the selection prioritizes: videos from the same series, videos with matching categories, videos with matching tags, and recently published videos, avoiding showing the same video the user is currently watching

---

## US-VIDEO-005: Manage Videos (Editor)

**As an** editor,
**I want to** upload, edit, and manage video content on the platform,
**so that** the video library is well-maintained and up to date.

### Acceptance Criteria

**AC-005.1: Video management dashboard**
- **Given** I am logged in as an editor
- **When** I navigate to Admin Panel > Videos
- **Then** I see a filterable, sortable table of all videos with columns: thumbnail, title, series, category, duration, views, status (published/draft/processing), publication date, and action buttons

**AC-005.2: Upload new video**
- **Given** I am on the video management page
- **When** I click "Add Video"
- **Then** I see a form with: video file upload (or external video URL for YouTube/Vimeo embeds), title, description (rich text), series selector (optional, with option to create new series), episode number (if series is selected), category selector, tags, custom thumbnail upload (auto-generated from video if not provided), publication date (immediate or scheduled), and SEO fields (meta title, meta description, slug)

**AC-005.3: Video upload process**
- **Given** I am uploading a video file
- **When** the upload begins
- **Then** I see a progress bar showing upload percentage, and after upload completes, the system processes the video (transcoding to multiple qualities: 360p, 480p, 720p, 1080p) with a "Processing" status indicator and estimated time

**AC-005.4: External video embed**
- **Given** I want to embed a video hosted on YouTube or Vimeo
- **When** I paste the video URL in the external URL field
- **Then** the system validates the URL, extracts the video metadata (title, description, thumbnail), and creates the listing with the embedded player

**AC-005.5: Edit video metadata**
- **Given** I am viewing a video in the management dashboard
- **When** I click "Edit"
- **Then** I can modify all metadata fields (title, description, series, category, tags, thumbnail, SEO fields) without re-uploading the video file

**AC-005.6: Video analytics**
- **Given** I am viewing a video's details in the admin panel
- **When** I click "Analytics"
- **Then** I see metrics including: total views, unique viewers, average watch duration, completion rate, traffic sources, and a views-over-time chart

**AC-005.7: Delete video**
- **Given** I want to remove a video
- **When** I click "Delete" and confirm
- **Then** the video and all its transcoded versions are removed from storage, the public page returns a 404, and any references in related videos or series are updated

**AC-005.8: Bulk video management**
- **Given** I am on the video management dashboard
- **When** I select multiple videos
- **Then** I can perform bulk actions: publish, unpublish, change category, assign to series, or delete

---

## US-VIDEO-006: Manage Video Series (Editor)

**As an** editor,
**I want to** create and manage video series,
**so that** related videos are grouped together and easy for visitors to follow.

### Acceptance Criteria

**AC-006.1: View series**
- **Given** I am on Admin Panel > Videos > Series
- **When** the page loads
- **Then** I see a list of all series with: cover image, title, episode count, total views, status (active/archived), and action buttons

**AC-006.2: Create series**
- **Given** I am on the series management page
- **When** I click "Create Series"
- **Then** I see a form with: series title, description (rich text), cover image upload, category, status (active/archived), and SEO fields

**AC-006.3: Edit series**
- **Given** I click "Edit" on a series
- **When** the edit form opens
- **Then** I can modify all series fields and see a list of all episodes within the series with the ability to reorder them via drag-and-drop

**AC-006.4: Episode ordering**
- **Given** I am editing a series
- **When** I reorder episodes via drag-and-drop
- **Then** the episode numbers update accordingly and the series page on the public site reflects the new order

**AC-006.5: Add existing video to series**
- **Given** I am editing a series
- **When** I click "Add Episode"
- **Then** I can search for and select an existing published video to add to the series, or create a new video entry

**AC-006.6: Remove video from series**
- **Given** I am editing a series
- **When** I click "Remove" on an episode
- **Then** the video is disassociated from the series (but not deleted) and the remaining episode numbers are recalculated

**AC-006.7: Archive series**
- **Given** I want to archive a completed series
- **When** I set the series status to "Archived"
- **Then** the series remains viewable on the public site but is moved to an "Archived Series" section and no longer appears in the main series navigation

---

## Cross-Cutting Concerns

### Performance
- Video player page must load within 2 seconds (player initialization)
- Video playback must start within 3 seconds of clicking play on a standard broadband connection
- Thumbnails must be lazy-loaded and served in next-gen formats (WebP)
- Video transcoding must complete within 30 minutes for standard-length videos (under 30 minutes)

### SEO
- Each video must have a unique canonical URL with a human-readable slug
- Video structured data (JSON-LD, VideoObject schema) must include name, description, thumbnailUrl, uploadDate, duration, contentUrl, and embedUrl
- Series pages should include ItemList schema for the episode list
- Video descriptions and transcripts contribute to searchability

### Accessibility
- Video player must be fully keyboard-accessible (play, pause, seek, volume, fullscreen)
- All videos should have captions/subtitles when available (supporting WebVTT format)
- Video player controls must have ARIA labels
- Auto-play must respect user's reduced-motion preferences
- Thumbnail images must have descriptive alt text

### Content Delivery
- Videos should be served via a CDN for optimal global delivery
- Adaptive bitrate streaming (HLS or DASH) should be used for self-hosted videos
- Fallback to lower quality should be seamless when bandwidth drops

---

*Document End*
