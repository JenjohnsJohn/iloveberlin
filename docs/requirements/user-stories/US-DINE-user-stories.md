# US-DINE: Dining & Restaurants User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** Dining & Restaurants
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Editor | Content manager who can manage restaurant listings and offers |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-DINE-001: Browse Restaurants by Cuisine

**As a** visitor,
**I want to** browse restaurants filtered by cuisine type,
**so that** I can find the type of food I am craving in Berlin.

### Acceptance Criteria

**AC-001.1: Cuisine filter display**
- **Given** I navigate to the Dining section
- **When** the page loads
- **Then** I see cuisine filter options displayed as clickable chips or a dropdown menu, including options such as: "German," "Italian," "Turkish," "Asian," "Japanese," "Vietnamese," "Indian," "Mexican," "Middle Eastern," "American," "Vegan/Vegetarian," "Brunch/Breakfast," "Bakery/Cafe," and "International"

**AC-001.2: Single cuisine filter**
- **Given** I am on the dining listing page
- **When** I select a cuisine type (e.g., "Vietnamese")
- **Then** the restaurant list filters to show only Vietnamese restaurants, the URL updates to reflect the filter (e.g., /dining?cuisine=vietnamese), and the active filter is visually highlighted

**AC-001.3: Multiple cuisine selection**
- **Given** I want to browse multiple cuisine types
- **When** I select more than one cuisine (e.g., "Japanese" and "Vietnamese")
- **Then** the list shows restaurants matching any of the selected cuisines (union), with the count of results displayed

**AC-001.4: Restaurant card display**
- **Given** I am browsing the restaurant listing
- **When** I view a restaurant card
- **Then** each card displays: a hero food/ambiance image, restaurant name, cuisine type(s), district, price range indicator (1-4 currency symbols), average rating (if available), one-line description, and a "Special Offer" badge if an active offer exists

**AC-001.5: No results for cuisine**
- **Given** I select a cuisine with no listed restaurants
- **When** the filtered list loads
- **Then** the system displays "No restaurants found for this cuisine. Try another type or browse all restaurants." with a clear-filter option

---

## US-DINE-002: Browse Restaurants by District

**As a** visitor,
**I want to** browse restaurants by Berlin district,
**so that** I can find dining options near me or in a specific neighborhood I plan to visit.

### Acceptance Criteria

**AC-002.1: District filter**
- **Given** I am on the dining listing page
- **When** I open the district filter
- **Then** I see all Berlin districts listed: Mitte, Friedrichshain-Kreuzberg, Pankow (Prenzlauer Berg), Charlottenburg-Wilmersdorf, Tempelhof-Schoeneberg, Neukoelln, Treptow-Koepenick, Steglitz-Zehlendorf, Spandau, Reinickendorf, Marzahn-Hellersdorf, and Lichtenberg

**AC-002.2: District selection**
- **Given** I select a district (e.g., "Neukoelln")
- **When** the filter is applied
- **Then** only restaurants located in Neukoelln are shown, with the district filter highlighted and result count updated

**AC-002.3: Combined cuisine and district filters**
- **Given** I have selected a cuisine filter (e.g., "Italian")
- **When** I also select a district filter (e.g., "Mitte")
- **Then** the results show only Italian restaurants in Mitte (intersection of both filters)

**AC-002.4: Map view for district**
- **Given** I have selected a district filter
- **When** I toggle to map view
- **Then** the map zooms to the selected district and shows restaurant pins within that area

---

## US-DINE-003: Browse Restaurants by Price Range

**As a** visitor,
**I want to** filter restaurants by price range,
**so that** I can find dining options that fit my budget.

### Acceptance Criteria

**AC-003.1: Price range filter**
- **Given** I am on the dining listing page
- **When** I open the price range filter
- **Then** I see options displayed as currency symbols: "$" (Budget, under 10 EUR), "$$" (Moderate, 10-25 EUR), "$$$" (Upscale, 25-50 EUR), "$$$$" (Fine Dining, 50+ EUR)

**AC-003.2: Price filter application**
- **Given** I select one or more price ranges
- **When** the filter is applied
- **Then** the restaurant list shows only restaurants within the selected price range(s)

**AC-003.3: Combined filtering**
- **Given** I have selected cuisine, district, and price range filters
- **When** all filters are applied
- **Then** the results show restaurants matching all selected criteria, and I see the active filter summary (e.g., "Italian restaurants in Mitte, $$-$$$")

**AC-003.4: Sort by price**
- **Given** I am viewing the restaurant listing
- **When** I select "Sort by Price (Low to High)" or "Sort by Price (High to Low)"
- **Then** the restaurant list reorders accordingly

---

## US-DINE-004: View Restaurant Details with Gallery

**As a** visitor,
**I want to** view detailed information about a restaurant including a photo gallery,
**so that** I can make an informed decision about whether to dine there.

### Acceptance Criteria

**AC-004.1: Restaurant detail page display**
- **Given** I click on a restaurant card from the listing
- **When** the restaurant detail page loads
- **Then** I see comprehensive information including: image gallery (hero image and additional photos), restaurant name, cuisine type(s), price range, full address with district, interactive map showing location, opening hours (for each day of the week, with today's hours highlighted), phone number (click-to-call on mobile), website link, description/about section (rich text), and a "Special Offer" section if an active offer exists

**AC-004.2: Photo gallery**
- **Given** I am on a restaurant detail page
- **When** I view the photo gallery
- **Then** I see a hero image displayed prominently, with a thumbnail strip or grid showing additional photos (food, ambiance, exterior); clicking a thumbnail opens a full-screen lightbox gallery with swipe navigation

**AC-004.3: Gallery lightbox**
- **Given** I have opened the gallery lightbox
- **When** I navigate through photos
- **Then** I can swipe left/right (mobile) or use arrow buttons (desktop), see a photo counter (e.g., "3 of 12"), view optional captions, and close the lightbox by clicking the X button or pressing Escape

**AC-004.4: Opening hours awareness**
- **Given** I am viewing a restaurant's opening hours
- **When** I look at today's hours
- **Then** today's row is visually highlighted, and the restaurant shows a status indicator: "Open now" (green), "Closing soon" (yellow, within 1 hour), or "Closed" (red) based on the current time

**AC-004.5: Map and directions**
- **Given** I am viewing the restaurant's location section
- **When** I see the embedded map
- **Then** I can click "Get Directions" to open Google Maps or Apple Maps (based on device) with the restaurant's address pre-filled as the destination

**AC-004.6: Nearest transit**
- **Given** the restaurant has transit information stored
- **When** I view the location section
- **Then** I see the nearest U-Bahn and/or S-Bahn station(s) with walking distance estimates

**AC-004.7: Reservation link**
- **Given** the restaurant has a reservation URL configured
- **When** I click "Make a Reservation"
- **Then** I am directed to the external reservation site (e.g., OpenTable, Quandoo, or the restaurant's own booking page) in a new tab

---

## US-DINE-005: View Dining Offers

**As a** visitor,
**I want to** view special dining offers and deals,
**so that** I can find discounted or unique dining experiences in Berlin.

### Acceptance Criteria

**AC-005.1: Dining offers listing**
- **Given** I navigate to the Dining Offers section (or see it highlighted on the dining page)
- **When** the page loads
- **Then** I see a list of active dining offers displayed as cards, each showing: the restaurant name and image, offer title (e.g., "2-for-1 Cocktails"), offer description, validity period (start and end dates), applicable days/times, and a "View Details" link

**AC-005.2: Offer detail on restaurant page**
- **Given** a restaurant has an active offer
- **When** I view that restaurant's detail page
- **Then** I see a prominent "Special Offer" section highlighting the deal with full details and terms

**AC-005.3: Offer badge on listing**
- **Given** a restaurant has an active offer
- **When** I browse the restaurant listing
- **Then** the restaurant card displays a "Special Offer" or "Deal" badge to attract attention

**AC-005.4: Offer expiry handling**
- **Given** an offer's end date has passed
- **When** the offer is evaluated by the system
- **Then** the offer is automatically hidden from public view and removed from restaurant cards

**AC-005.5: Offer terms and conditions**
- **Given** I am viewing an offer detail
- **When** I expand the "Terms & Conditions" section
- **Then** I see any restrictions (e.g., "Valid Monday-Thursday only," "Minimum 2 guests," "Cannot be combined with other offers")

**AC-005.6: Sort and filter offers**
- **Given** I am on the dining offers page
- **When** I use the filter options
- **Then** I can filter offers by cuisine type, district, and offer type (e.g., "Happy Hour," "Set Menu," "Discount," "Free Item"), and sort by newest, expiring soon, or popularity

---

## US-DINE-006: Read Restaurant Reviews

**As a** visitor,
**I want to** read reviews and ratings for a restaurant,
**so that** I can see other people's experiences and make a better dining decision.

### Acceptance Criteria

**AC-006.1: Reviews section on restaurant page**
- **Given** I am on a restaurant detail page
- **When** I scroll to the reviews section
- **Then** I see an overall rating summary (average score out of 5, total review count, rating distribution histogram) followed by individual reviews sorted by most recent first

**AC-006.2: Individual review display**
- **Given** I am viewing restaurant reviews
- **When** I read an individual review
- **Then** each review shows: the reviewer's display name and avatar, review date, overall rating (stars out of 5), optional sub-ratings (food, service, ambiance, value), review text, and optional photos uploaded by the reviewer

**AC-006.3: Review sorting**
- **Given** I am viewing restaurant reviews
- **When** I use the sort control
- **Then** I can sort reviews by "Most recent," "Highest rated," "Lowest rated," or "Most helpful"

**AC-006.4: Helpful review voting**
- **Given** I am logged in and reading a review
- **When** I click "Helpful" on a review
- **Then** my vote is recorded, the helpful count increments, and the button state changes to indicate I have voted (one vote per review per user)

**AC-006.5: Write a review**
- **Given** I am logged in and on a restaurant detail page
- **When** I click "Write a Review"
- **Then** a review form appears with: overall star rating (required), optional sub-ratings (food, service, ambiance, value), review text field (min 50 characters, max 2000), and optional photo upload (up to 5 photos)

**AC-006.6: Submit review**
- **Given** I have completed the review form with at least the overall rating and minimum text
- **When** I click "Submit Review"
- **Then** the review is submitted for moderation, I see a confirmation "Thank you! Your review will appear after moderation," and the review is visible publicly after editor/admin approval

**AC-006.7: One review per user per restaurant**
- **Given** I have already submitted a review for a restaurant
- **When** I visit that restaurant's page
- **Then** I see my existing review with an "Edit" option instead of the "Write a Review" button

**AC-006.8: Unauthenticated review attempt**
- **Given** I am a visitor (not logged in)
- **When** I click "Write a Review"
- **Then** the system prompts me to log in with "Log in to write a review"

---

## US-DINE-007: Manage Restaurants and Offers (Editor)

**As an** editor,
**I want to** create, edit, and manage restaurant listings and their offers,
**so that** the dining section has accurate, up-to-date information.

### Acceptance Criteria

**AC-007.1: Restaurant management dashboard**
- **Given** I am logged in as an editor
- **When** I navigate to Admin Panel > Dining > Restaurants
- **Then** I see a searchable, filterable table of all restaurants with columns: name, cuisine, district, price range, rating, active offers count, status (published/draft/archived), and action buttons

**AC-007.2: Create restaurant listing**
- **Given** I am on the restaurant management page
- **When** I click "Add Restaurant"
- **Then** I see a comprehensive form with sections for: basic information (name, cuisine types, price range, description), location (address, district, map pin with geocoding), contact (phone, email, website, reservation URL), hours (per-day opening/closing times with support for split hours and holidays), media (hero image upload, gallery image uploads with drag-to-reorder), transit info (nearest stations), and SEO fields (meta title, meta description, slug)

**AC-007.3: Edit restaurant**
- **Given** I am viewing a restaurant in the management dashboard
- **When** I click "Edit"
- **Then** the edit form opens pre-populated with all current data, and I can modify and save changes

**AC-007.4: Manage restaurant gallery**
- **Given** I am editing a restaurant
- **When** I manage the photo gallery
- **Then** I can upload new images (drag-and-drop or file picker, max 5 MB each), reorder images via drag-and-drop, set the hero image, add captions and alt text to each image, and delete images

**AC-007.5: Create dining offer**
- **Given** I am editing a restaurant or on the offers management page
- **When** I click "Add Offer"
- **Then** I see a form with fields for: offer title, description, terms and conditions, start date, end date, applicable days/times, offer type (discount, set menu, happy hour, etc.), and an optional promotional image

**AC-007.6: Manage offers**
- **Given** I am on Admin Panel > Dining > Offers
- **When** I view the offers list
- **Then** I see all offers (active, scheduled, and expired) with restaurant name, offer title, validity dates, status, and action buttons (edit, duplicate, deactivate)

**AC-007.7: Moderate reviews**
- **Given** I am an editor
- **When** I navigate to Admin Panel > Dining > Reviews
- **Then** I see a queue of pending reviews with their content, and I can approve, reject (with reason), or edit reviews before they go live

**AC-007.8: Restaurant status management**
- **Given** I am managing a restaurant
- **When** I change its status
- **Then** I can set it to "Published" (visible on site), "Draft" (not visible), "Temporarily Closed" (visible with a notice), or "Permanently Closed" (archived, visible with closed notice)

---

## US-DINE-008: Manage Cuisines (Admin)

**As an** admin,
**I want to** manage the cuisine categories available for restaurant classification,
**so that** the dining section has a well-organized, comprehensive set of cuisine types.

### Acceptance Criteria

**AC-008.1: View cuisines**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Dining > Cuisines
- **Then** I see a list of all cuisine types with their names, slugs, icons/images, restaurant counts, and display order

**AC-008.2: Create cuisine**
- **Given** I am on the cuisines management page
- **When** I click "Add Cuisine" and enter a name, slug, description, and optional icon/image
- **Then** the new cuisine type is created and available for editors to assign to restaurants

**AC-008.3: Edit cuisine**
- **Given** I am on the cuisines management page
- **When** I click "Edit" on an existing cuisine
- **Then** I can modify the name, slug, description, and icon/image, with changes reflected in all restaurant listings and filters

**AC-008.4: Delete cuisine**
- **Given** I attempt to delete a cuisine that has restaurants assigned
- **When** I click "Delete"
- **Then** the system prompts me to reassign the associated restaurants to another cuisine before deletion

**AC-008.5: Merge cuisines**
- **Given** I want to consolidate similar cuisine categories
- **When** I select two or more cuisines and click "Merge"
- **Then** the system merges them into a single cuisine, updates all associated restaurants, and removes the redundant entries

**AC-008.6: Reorder cuisines**
- **Given** I am on the cuisines management page
- **When** I drag and drop cuisine entries
- **Then** the display order is updated in all filter menus across the site

---

## Cross-Cutting Concerns

### Performance
- Restaurant listing pages must load within 2 seconds
- Gallery lightbox must open within 500ms with smooth transitions
- Map interactions must be responsive (no lag on pan/zoom)
- Restaurant images must be served in next-gen formats with responsive srcsets

### SEO
- Each restaurant must have a unique canonical URL with a human-readable slug
- Restaurant structured data (JSON-LD, Restaurant schema) must include name, address, telephone, servesCuisine, priceRange, openingHours, geo coordinates, image, and aggregateRating
- Dining offers should include Offer schema markup
- Cuisine and district landing pages must have optimized meta tags

### Accessibility
- Gallery lightbox must be navigable via keyboard with proper focus trapping
- Star ratings must include text alternatives for screen readers (e.g., "4 out of 5 stars")
- Opening hours table must be properly structured with appropriate headers
- Map must have a text-based address alternative

### Data Integrity
- Restaurant hours must support edge cases: split hours (e.g., 11:00-14:00, 18:00-23:00), varying hours by day, holiday closures, and "Open 24 hours"
- Price ranges must be validated and consistent across the platform
- Cuisine assignments must be limited to prevent over-categorization (max 3 cuisines per restaurant)

---

*Document End*
