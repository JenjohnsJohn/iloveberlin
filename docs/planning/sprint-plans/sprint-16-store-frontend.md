# Sprint 16: Store Frontend

**Sprint Number:** 16
**Sprint Name:** Store Frontend
**Duration:** 2 weeks (10 working days)
**Dates:** Weeks 31-32 (relative to project start)
**Team Capacity:** ~160 hours (2 frontend, 1 backend support, 1 QA)

---

## Sprint Goal

Deliver a fully responsive, production-ready storefront for ILoveBerlin, including a store landing page with category navigation and product grid, product detail pages with image galleries and variant selectors, a full-featured cart page with discount code support, Stripe Elements checkout with 3D Secure handling, order confirmation and order history pages, and comprehensive E2E test coverage.

---

## User Stories

### US-16.1: Store Landing Page
**As a** visitor, **I want to** browse the store by categories and see products in a grid **so that** I can discover items to purchase.

**Acceptance Criteria:**
- [ ] Store landing page displays category tabs/pills at the top
- [ ] Clicking a category filters the product grid without full page reload
- [ ] Product grid shows image, name, price, and "Add to Cart" button
- [ ] Grid supports pagination or infinite scroll (load more)
- [ ] Products marked as "featured" are highlighted
- [ ] Out-of-stock products show a visual indicator
- [ ] Grid is responsive: 4 columns desktop, 2 columns tablet, 1 column mobile
- [ ] Page loads within 2 seconds on 3G connection (skeleton loading)

### US-16.2: Product Detail Page
**As a** visitor, **I want to** view product details with a gallery and select variants **so that** I can make an informed purchase decision.

**Acceptance Criteria:**
- [ ] Product detail page shows image gallery with thumbnails and zoom
- [ ] Full product description rendered as rich text
- [ ] Variant selector (e.g., size/color dropdowns) updates price dynamically
- [ ] "Add to Cart" button with quantity selector
- [ ] Stock availability displayed per variant
- [ ] Out-of-stock variants are disabled
- [ ] Breadcrumb navigation (Store > Category > Product)
- [ ] Related products section at the bottom
- [ ] SEO meta tags (title, description, Open Graph)

### US-16.3: Cart Page
**As a** customer, **I want to** review my cart, adjust quantities, and apply discount codes **so that** I can prepare for checkout.

**Acceptance Criteria:**
- [ ] Cart page lists all items with image, name, variant, unit price, quantity, and line total
- [ ] Quantity can be adjusted with +/- buttons or direct input
- [ ] Items can be removed with a delete button (with confirmation)
- [ ] Discount code input field with "Apply" button
- [ ] Applied discount shows code name and amount saved
- [ ] Invalid discount code shows inline error message
- [ ] Cart summary shows subtotal, discount, tax, and total
- [ ] "Proceed to Checkout" button (disabled if cart is empty)
- [ ] "Continue Shopping" link back to store
- [ ] Cart updates optimistically with rollback on API error

### US-16.4: Checkout Page
**As a** customer, **I want to** enter my shipping/billing info and pay with Stripe **so that** I can complete my purchase.

**Acceptance Criteria:**
- [ ] Checkout page shows order summary sidebar
- [ ] Shipping address form with validation
- [ ] Billing address form (with "same as shipping" toggle)
- [ ] Stripe Elements card input (card number, expiry, CVC)
- [ ] 3D Secure authentication modal handled seamlessly
- [ ] "Place Order" button with loading state during processing
- [ ] Error messages for payment failures displayed inline
- [ ] Successful payment redirects to order confirmation page
- [ ] Form data persists if payment fails (user does not re-enter)

### US-16.5: Order Confirmation Page
**As a** customer, **I want to** see a confirmation after my purchase **so that** I know the order was placed successfully.

**Acceptance Criteria:**
- [ ] Confirmation page shows order number, items, totals, and estimated delivery
- [ ] "Thank you" message with ILoveBerlin branding
- [ ] Link to view order details
- [ ] Link to continue shopping
- [ ] Page is accessible via direct URL (order ID in path) for returning customers
- [ ] Print-friendly layout

### US-16.6: Order History Page
**As a** registered user, **I want to** view my past orders **so that** I can track purchases and reorder.

**Acceptance Criteria:**
- [ ] Order history page lists orders with: order number, date, status, total
- [ ] Orders are paginated (10 per page)
- [ ] Clicking an order expands or navigates to full order detail
- [ ] Order detail shows line items, addresses, payment info (last 4 digits), and status history
- [ ] Status badge with color coding (pending=yellow, paid=blue, shipped=purple, delivered=green, cancelled=red)
- [ ] Page is only accessible to authenticated users

### US-16.7: Cart Icon with Badge
**As a** visitor, **I want to** see a cart icon with item count in the header **so that** I know how many items are in my cart.

**Acceptance Criteria:**
- [ ] Cart icon displayed in the site header/navigation
- [ ] Badge shows the number of items in the cart
- [ ] Badge updates immediately when items are added (optimistic update)
- [ ] Badge animates briefly when count changes
- [ ] Clicking the icon navigates to the cart page
- [ ] On hover/click, shows a mini-cart preview dropdown (desktop only)

---

## Day-by-Day Task Breakdown

### Week 1 (Days 1-5)

#### Day 1 (Monday) - Store Landing Page Foundation
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.1: Store page route and layout | Frontend 1 | 2 | Create /store route, page layout with header/footer integration |
| FE-16.2: Category tabs component | Frontend 1 | 2.5 | Horizontal scrollable tabs, active state, "All" tab, fetch categories from API |
| FE-16.3: Product card component | Frontend 2 | 3 | Image, name, price, "Add to Cart" button, featured badge, out-of-stock overlay |
| FE-16.4: Product grid component | Frontend 2 | 2.5 | Responsive CSS Grid (4/2/1 columns), loading skeleton, empty state |
| FE-16.5: Cart context/store setup | Frontend 1 | 2 | React context or Zustand store for cart state, API integration hooks |

#### Day 2 (Tuesday) - Store Landing Completion & Cart Icon
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.6: Category filtering logic | Frontend 1 | 2 | Filter products by category, URL query param sync, smooth transition |
| FE-16.7: Pagination/infinite scroll | Frontend 1 | 2.5 | Load more button or intersection observer, page state management |
| FE-16.8: Cart icon component with badge | Frontend 2 | 2 | Icon in header, item count badge, animation on change |
| FE-16.9: Mini-cart dropdown (desktop) | Frontend 2 | 3 | Dropdown on hover/click, item list, subtotal, "View Cart" and "Checkout" links |
| FE-16.10: Store page SEO and meta tags | Frontend 1 | 1 | Title, description, Open Graph for store landing |
| BE-16.1: Product listing API optimizations | Backend | 2 | Ensure category filter, sort, and pagination perform well; add any missing query params |

#### Day 3 (Wednesday) - Product Detail Page
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.11: Product detail page route and layout | Frontend 1 | 1.5 | /store/[slug] route, fetch product with variants and images |
| FE-16.12: Image gallery component | Frontend 1 | 3 | Main image + thumbnails, click to switch, pinch-to-zoom on mobile, lightbox |
| FE-16.13: Variant selector component | Frontend 2 | 3 | Dropdown or button group for each attribute, dynamic price update, stock display |
| FE-16.14: Add to Cart with quantity selector | Frontend 2 | 2 | Quantity input with +/- buttons, max = stock, add to cart API call, success toast |
| FE-16.15: Product description and details | Frontend 1 | 1.5 | Rich text rendering, expandable sections (description, specs, shipping info) |
| FE-16.16: Breadcrumb navigation component | Frontend 2 | 1 | Store > Category > Product, linked segments |

#### Day 4 (Thursday) - Product Detail Completion & Cart Page Start
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.17: Related products section | Frontend 1 | 2 | Horizontal scroll of related products (same category), reuse ProductCard |
| FE-16.18: Product detail SEO meta tags | Frontend 1 | 1.5 | Dynamic title, description, Open Graph image, structured data (Product schema) |
| FE-16.19: Cart page route and layout | Frontend 2 | 1.5 | /cart route, fetch cart items from API |
| FE-16.20: Cart item row component | Frontend 2 | 2.5 | Image, name, variant, unit price, quantity controls, line total, remove button |
| FE-16.21: Cart quantity update logic | Frontend 1 | 2 | Optimistic update, debounced API call, rollback on error, stock validation |
| FE-16.22: Cart item removal with confirmation | Frontend 2 | 1.5 | Confirm dialog, optimistic removal, undo toast |

#### Day 5 (Friday) - Cart Page Completion
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.23: Discount code input component | Frontend 1 | 2 | Text input + "Apply" button, loading state, success/error feedback |
| FE-16.24: Discount code integration | Frontend 1 | 2 | API call to validate, display applied discount, remove discount option |
| FE-16.25: Cart summary component | Frontend 2 | 2 | Subtotal, discount line, tax line, total, "Proceed to Checkout" button |
| FE-16.26: Empty cart state | Frontend 2 | 1 | Illustration, "Your cart is empty" message, "Start Shopping" CTA |
| FE-16.27: Cart page responsive testing | Frontend 1 | 1 | Verify layout on mobile, tablet, desktop |
| FE-16.28: Cart page accessibility audit | Frontend 2 | 1 | Keyboard navigation, screen reader labels, focus management |
| QA-16.1: Store landing and product detail manual testing | QA | 4 | Test category filtering, product grid, product detail, responsive layouts |

### Week 2 (Days 6-10)

#### Day 6 (Monday) - Checkout Page Foundation
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.29: Checkout page route and layout | Frontend 1 | 1.5 | /checkout route, redirect if cart empty, two-column layout (form + summary) |
| FE-16.30: Shipping address form | Frontend 1 | 3 | Form fields (name, address, city, postal code, country), validation with react-hook-form/Zod |
| FE-16.31: Billing address form | Frontend 2 | 2 | Same fields as shipping, "Same as shipping" checkbox toggle |
| FE-16.32: Order summary sidebar | Frontend 2 | 2 | Item list (collapsed), subtotal, discount, tax, total, applied discount code display |
| FE-16.33: Checkout page state management | Frontend 1 | 1.5 | Multi-step state (address -> payment -> confirm), persist form data on navigation |
| BE-16.2: Guest checkout support | Backend | 2 | Ensure checkout works without authentication, collect email for confirmation |

#### Day 7 (Tuesday) - Stripe Elements Integration
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.34: Stripe Elements setup | Frontend 1 | 2 | Install @stripe/react-stripe-js, configure Stripe provider, load publishable key |
| FE-16.35: Card input component | Frontend 1 | 2.5 | CardElement with custom styling matching ILoveBerlin theme, error display |
| FE-16.36: Payment submission flow | Frontend 2 | 3 | Create PaymentIntent via API, confirmCardPayment, handle response |
| FE-16.37: 3D Secure handling | Frontend 2 | 2.5 | Handle requires_action status, Stripe.js 3DS modal, retry after authentication |
| FE-16.38: Payment error handling | Frontend 1 | 2 | Display card errors (declined, insufficient funds, etc.), form preservation |

#### Day 8 (Wednesday) - Order Confirmation & History
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.39: Order confirmation page | Frontend 1 | 3 | /orders/[id]/confirmation route, order details, thank you message, branding |
| FE-16.40: Order confirmation print layout | Frontend 1 | 1 | Print-friendly CSS, hide navigation elements |
| FE-16.41: Order history page | Frontend 2 | 3 | /account/orders route, paginated order list, status badges |
| FE-16.42: Order detail page | Frontend 2 | 2.5 | /account/orders/[id] route, line items, addresses, status timeline |
| FE-16.43: Post-checkout redirect flow | Frontend 1 | 1.5 | Success redirect to confirmation, failure stay on checkout with error |
| QA-16.2: Cart page and discount code testing | QA | 3 | Quantity changes, item removal, discount apply/remove, edge cases |

#### Day 9 (Thursday) - Responsive Design & Polish
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.44: Mobile responsive - store landing | Frontend 1 | 1.5 | Category scroll, single-column grid, touch targets |
| FE-16.45: Mobile responsive - product detail | Frontend 1 | 1.5 | Stacked layout, swipeable gallery, sticky add-to-cart bar |
| FE-16.46: Mobile responsive - cart | Frontend 2 | 1 | Stacked items, full-width summary |
| FE-16.47: Mobile responsive - checkout | Frontend 2 | 1.5 | Single column form, collapsible order summary |
| FE-16.48: Loading states and skeletons | Frontend 1 | 2 | Skeleton loaders for product grid, product detail, cart, order history |
| FE-16.49: Error boundaries and fallbacks | Frontend 2 | 1.5 | Error boundaries around store sections, user-friendly error messages |
| FE-16.50: Animation and micro-interactions | Frontend 1 | 1.5 | Add-to-cart animation, cart badge bounce, page transitions |
| QA-16.3: Checkout and payment flow testing | QA | 4 | Success flow, 3DS flow, declined card, form validation, error recovery |

#### Day 10 (Friday) - E2E Tests & Final Polish
| Task | Assignee | Hours | Details |
|------|----------|-------|---------|
| FE-16.51: E2E test - store browsing flow | Frontend 1 | 2 | Navigate categories, view product, verify content |
| FE-16.52: E2E test - add to cart flow | Frontend 1 | 2 | Add item, verify cart badge, view cart, change quantity |
| FE-16.53: E2E test - checkout flow | Frontend 2 | 2.5 | Fill addresses, enter test card, complete purchase, verify confirmation |
| FE-16.54: E2E test - order history flow | Frontend 2 | 1.5 | Login, view orders, view detail, verify status |
| FE-16.55: Cross-browser testing | Frontend 1 | 1.5 | Chrome, Firefox, Safari, Edge - verify core flows |
| FE-16.56: Final accessibility audit | Frontend 2 | 1.5 | WCAG 2.1 AA compliance, keyboard navigation, screen reader testing |
| QA-16.4: Responsive design testing | QA | 2 | Test all pages on mobile (375px), tablet (768px), desktop (1440px) |
| QA-16.5: Full E2E regression suite | QA | 3 | Run complete store E2E suite, document results |

---

## Backend Tasks Summary

| Task ID | Task | Effort (hrs) |
|---------|------|-------------|
| BE-16.1 | Product listing API optimizations | 2 |
| BE-16.2 | Guest checkout support | 2 |
| **Total** | | **4** |

## Frontend Tasks Summary

| Task ID | Task | Sub-tasks | Effort (hrs) |
|---------|------|-----------|-------------|
| FE-16.1-16.10 | Store landing page | Route, categories, product grid, filtering, pagination, cart icon, mini-cart, SEO | 20.5 |
| FE-16.11-16.18 | Product detail page | Route, gallery, variants, add-to-cart, breadcrumbs, related products, SEO | 15.5 |
| FE-16.19-16.28 | Cart page | Route, item rows, quantity, removal, discount code, summary, empty state, responsive, a11y | 14 |
| FE-16.29-16.38 | Checkout page | Route, shipping/billing forms, Stripe Elements, 3DS, errors, state management | 20.5 |
| FE-16.39-16.43 | Order confirmation & history | Confirmation page, print, order list, order detail, redirect flow | 11 |
| FE-16.44-16.50 | Responsive & polish | Mobile layouts, skeletons, error boundaries, animations | 10.5 |
| FE-16.51-16.56 | E2E tests & final | 4 E2E test suites, cross-browser, accessibility audit | 11 |
| **Total** | | | **103** |

## QA Tasks

| Task ID | Task | Test Scenarios | Effort (hrs) |
|---------|------|---------------|-------------|
| QA-16.1 | Store landing & product detail | Category filter, product grid rendering, image gallery, variant selection, responsive breakpoints | 4 |
| QA-16.2 | Cart page & discounts | Add/remove items, quantity change, discount apply/remove/invalid, empty cart, total calculation | 3 |
| QA-16.3 | Checkout & payment | Valid card, declined card, 3DS card, form validation, address same-as-shipping, error recovery | 4 |
| QA-16.4 | Responsive design | All pages at 375px, 768px, 1024px, 1440px breakpoints | 2 |
| QA-16.5 | Full E2E regression | Complete purchase flow, order history, guest vs authenticated, cross-browser | 3 |
| **Total** | | | **16** |

---

## Dependencies

```
Sprint 15 (store backend) --> All Sprint 16 tasks (frontend depends on API)
FE-16.1-16.4 (store landing) --> FE-16.6-16.7 (filtering/pagination)
FE-16.5 (cart context) --> FE-16.8-16.9 (cart icon/mini-cart)
FE-16.5 (cart context) --> FE-16.19-16.28 (cart page)
FE-16.11-16.16 (product detail) --> FE-16.17-16.18 (related products, SEO)
FE-16.19-16.28 (cart page) --> FE-16.29-16.38 (checkout page)
FE-16.34-16.38 (Stripe integration) --> FE-16.39-16.43 (order confirmation)
BE-16.2 (guest checkout) --> FE-16.36 (payment submission)
All page implementations --> FE-16.44-16.50 (responsive/polish)
All page implementations --> FE-16.51-16.56 (E2E tests)
FE-16.44-16.50 (responsive) --> QA-16.4 (responsive testing)
```

---

## Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Sprint 15 backend not complete, blocking frontend | Medium | High | Mock API responses for first 2 days; prioritize critical endpoints in Sprint 15 |
| Stripe Elements styling conflicts with design system | Medium | Medium | Start Stripe integration early (Day 7); allocate extra time for custom styling |
| 3D Secure flow complexity across browsers | Medium | High | Test with Stripe test cards for 3DS early; have fallback error handling |
| Image gallery performance with large product images | Low | Medium | Implement lazy loading, use Next.js Image component with R2 CDN |
| Cart state sync issues between tabs/sessions | Medium | Medium | Use SWR/React Query for cache invalidation; WebSocket for real-time sync optional |
| E2E test flakiness with Stripe test mode | High | Medium | Use deterministic test cards; add retry logic; mock Stripe in CI if needed |
| Mobile responsive issues not caught until Day 9 | Medium | Medium | Test responsive continuously during development, not just at the end |

---

## Deliverables Checklist

- [ ] Store landing page with category tabs and responsive product grid
- [ ] Product detail page with image gallery, variant selector, and add-to-cart
- [ ] Cart page with quantity management, item removal, and discount code support
- [ ] Checkout page with shipping/billing forms and Stripe Elements
- [ ] 3D Secure payment authentication handling
- [ ] Order confirmation page with print layout
- [ ] Order history page with order detail view
- [ ] Cart icon with badge in site header
- [ ] Mini-cart dropdown preview (desktop)
- [ ] All pages fully responsive (mobile, tablet, desktop)
- [ ] Loading skeletons and error boundaries
- [ ] SEO meta tags on store and product pages
- [ ] E2E test suites for browsing, cart, checkout, and order history flows
- [ ] Cross-browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] WCAG 2.1 AA accessibility compliance

---

## Definition of Done

1. All pages render correctly on Chrome, Firefox, Safari, and Edge
2. Responsive design works at 375px, 768px, 1024px, and 1440px breakpoints
3. Complete purchase flow works end-to-end (browse -> add to cart -> checkout -> confirmation)
4. 3D Secure authentication flow works with Stripe test cards
5. Discount codes can be applied and removed on the cart page
6. Order history is accessible for authenticated users
7. Cart icon badge updates in real-time when items are added
8. All pages have appropriate SEO meta tags
9. E2E tests pass for all critical flows
10. Lighthouse scores: Performance > 80, Accessibility > 90, SEO > 90
11. No layout shifts (CLS < 0.1) on any store page
12. All form validations provide clear user feedback
13. Error states are handled gracefully with user-friendly messages
14. Code reviewed and approved by at least one other developer

---

## Sprint Review Demo Script

1. **Store Landing Page** (4 min)
   - Navigate to /store, show the category tabs
   - Click through categories, show filtered product grid
   - Demonstrate responsive behavior (resize browser)
   - Show skeleton loading states

2. **Product Detail Page** (4 min)
   - Click into a product, show image gallery with zoom
   - Select different variants, show price updates
   - Show stock availability per variant
   - Point out breadcrumbs and related products

3. **Add to Cart Flow** (3 min)
   - Add item to cart, show cart badge animation
   - Hover over cart icon for mini-cart preview
   - Add another item from a different product

4. **Cart Page** (4 min)
   - Navigate to cart, show item list
   - Change quantities, show total recalculation
   - Apply a discount code, show savings
   - Try an invalid discount code, show error

5. **Checkout Flow** (5 min)
   - Click "Proceed to Checkout"
   - Fill shipping address, toggle "same as billing"
   - Enter Stripe test card (4242...)
   - Complete purchase, show redirect to confirmation
   - Demo 3D Secure with test card (4000 0025 0000 3155)

6. **Order Confirmation & History** (3 min)
   - Show confirmation page with order details
   - Navigate to order history
   - Click into order detail, show status badge

7. **Mobile Demo** (3 min)
   - Show store landing on mobile viewport
   - Navigate through product detail on mobile
   - Complete a purchase on mobile viewport

---

## Rollover Criteria

Tasks may roll over to Sprint 17 if:
- Sprint 15 backend delays block more than 3 frontend tasks for more than 2 days
- Stripe 3D Secure handling requires more than 5 additional hours
- E2E test suite has more than 3 flaky tests requiring investigation
- Design feedback requires significant layout rework

Tasks that MUST complete in this sprint (no rollover):
- Store landing page with product grid
- Product detail page with variant selector
- Cart page with quantity management
- Checkout with Stripe Elements (basic flow)
- Order confirmation page

Deprioritized if time is short:
- Mini-cart dropdown (replace with direct navigation to cart page)
- Print layout for order confirmation
- Related products section
- Animation and micro-interactions
