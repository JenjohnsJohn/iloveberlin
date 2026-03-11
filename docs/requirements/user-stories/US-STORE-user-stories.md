# US-STORE: Online Store User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** Online Store
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Admin | Platform administrator who manages products, orders, and discounts |
| Superadmin | Top-level administrator with full system access |

---

## US-STORE-001: Browse Products

**As a** visitor,
**I want to** browse products available in the ILoveBerlin store,
**so that** I can discover Berlin-themed merchandise, gifts, and lifestyle products.

### Acceptance Criteria

**AC-001.1: Store landing page**
- **Given** I navigate to the Store section (via main navigation or /store)
- **When** the page loads
- **Then** I see a visually appealing store page with: a hero banner (featuring current promotions or new arrivals), featured products section, product category navigation, and a grid of products

**AC-001.2: Product card display**
- **Given** I am browsing the product grid
- **When** I view a product card
- **Then** each card displays: product image (with hover-to-show-second-image on desktop), product name, price (with original price shown with strikethrough if discounted), discount badge (e.g., "-20%") if applicable, "New" badge if added within the last 14 days, and average rating (stars) if reviews exist

**AC-001.3: Category navigation**
- **Given** I am on the store page
- **When** I view the category navigation
- **Then** I see categories such as: "Apparel" (t-shirts, hoodies, caps), "Accessories" (tote bags, pins, stickers), "Home & Kitchen" (mugs, prints, magnets), "Books & Media," and "Gift Cards," and I can click a category to filter the product grid

**AC-001.4: Product filtering**
- **Given** I am browsing products
- **When** I use the filter controls
- **Then** I can filter by: category, price range (slider or min/max input), availability ("In Stock" only), and tags (e.g., "Best Seller," "Gift Ideas," "Eco-Friendly")

**AC-001.5: Product sorting**
- **Given** I am viewing the product grid
- **When** I use the sort control
- **Then** I can sort by: "Featured" (default, editorial ordering), "Newest," "Price: Low to High," "Price: High to Low," and "Best Selling"

**AC-001.6: Search products**
- **Given** I am on the store page
- **When** I type in the product search bar
- **Then** the system returns matching products by searching across product names, descriptions, and tags, with results displayed as a filtered grid or autocomplete dropdown

**AC-001.7: Pagination**
- **Given** there are more than 24 products matching my current filters
- **When** I scroll to the bottom
- **Then** I can load more products via "Load more" button or pagination controls, loading 24 products per page

**AC-001.8: Empty state**
- **Given** no products match my current filters
- **When** the filtered grid loads
- **Then** the system displays "No products found matching your criteria" with a "Clear filters" button and suggestions to browse all products

---

## US-STORE-002: View Product Details

**As a** visitor,
**I want to** view the complete details of a product,
**so that** I can make an informed purchase decision.

### Acceptance Criteria

**AC-002.1: Product detail page layout**
- **Given** I click on a product card
- **When** the product detail page loads
- **Then** I see: a product image gallery (left/top section), product name, price (with any discount displayed), short description, variant selectors (size, color, etc. if applicable), quantity selector, "Add to Cart" button, detailed product description (rich text), product specifications table (materials, dimensions, weight, care instructions), shipping information summary, and return policy link

**AC-002.2: Product image gallery**
- **Given** I am viewing a product detail page
- **When** I look at the image gallery
- **Then** I see a large main image with thumbnail navigation below/beside it, and I can click any thumbnail to see it as the main image; clicking the main image opens a fullscreen lightbox with zoom capability

**AC-002.3: Zoom functionality**
- **Given** I am viewing the product image gallery on desktop
- **When** I hover over the main product image
- **Then** a magnified view appears showing detail (2x-3x zoom), following my cursor position

**AC-002.4: Product availability**
- **Given** I am viewing a product
- **When** I look at the availability indicator
- **Then** I see one of: "In Stock" (green), "Low Stock - Only X left" (orange, when fewer than 5 remain), or "Out of Stock" (red, with "Add to Cart" disabled and a "Notify me when available" option)

**AC-002.5: Breadcrumb navigation**
- **Given** I am on a product detail page
- **When** I look at the breadcrumb trail
- **Then** I see the navigation path (e.g., Store > Apparel > T-Shirts > Berlin Skyline Tee) allowing me to navigate back to any level

**AC-002.6: Shipping information**
- **Given** I am viewing a product
- **When** I look at the shipping section
- **Then** I see estimated shipping costs and delivery timeframes (e.g., "Standard shipping: 3-5 business days, 4.95 EUR" and "Express: 1-2 business days, 9.95 EUR"), with a note about free shipping thresholds (e.g., "Free shipping on orders over 50 EUR")

**AC-002.7: Related products**
- **Given** I am viewing a product detail page
- **When** I scroll below the product information
- **Then** I see a "You Might Also Like" section showing 4-6 related products from the same category or frequently bought together

**AC-002.8: Social sharing**
- **Given** I am viewing a product
- **When** I click the share button
- **Then** I can share the product via link copy, Facebook, X, WhatsApp, Pinterest, or email, with proper Open Graph product metadata for rich previews

---

## US-STORE-003: Select Product Variants

**As a** visitor,
**I want to** select product variants such as size and color,
**so that** I can purchase the exact version of the product I want.

### Acceptance Criteria

**AC-003.1: Variant selector display**
- **Given** I am on a product detail page for a product with variants
- **When** the page loads
- **Then** I see variant selectors appropriate to the product type: color swatches (visual circles with the actual color), size selector (dropdown or button group: XS, S, M, L, XL, XXL), and any other custom variants (e.g., material, style)

**AC-003.2: Color swatch interaction**
- **Given** I am viewing color options
- **When** I click a color swatch
- **Then** the selected swatch is highlighted with a border/checkmark, the product images update to show the selected color variant, the price updates if the variant has a different price, and the color name is displayed (e.g., "Berlin Blue")

**AC-003.3: Size selection**
- **Given** I am viewing size options
- **When** I see the size selector
- **Then** available sizes are clickable, out-of-stock sizes are shown as disabled/crossed-out, and I can click a "Size Guide" link to view a size chart in a modal

**AC-003.4: Size guide modal**
- **Given** I click "Size Guide"
- **When** the modal opens
- **Then** I see a clear size chart table with measurements in both cm and inches, with sizing notes specific to the product type

**AC-003.5: Variant availability**
- **Given** I select a variant combination (e.g., "Blue, Size M")
- **When** the selection is made
- **Then** the availability indicator updates to reflect the stock level for that specific variant (e.g., "In Stock," "Only 2 left," or "Out of Stock")

**AC-003.6: Variant price updates**
- **Given** a product has variants with different prices
- **When** I select a variant
- **Then** the displayed price updates to reflect the price of the selected variant, including any applicable discounts

**AC-003.7: Required variant selection before add-to-cart**
- **Given** a product has required variants (e.g., size)
- **When** I click "Add to Cart" without selecting all required variants
- **Then** the system highlights the unselected variant selector(s) with an error message "Please select a [size/color]" and does not add the item to the cart

**AC-003.8: SKU and URL update**
- **Given** I select a product variant
- **When** the selection changes
- **Then** the URL updates to include the variant (e.g., /store/berlin-tee?color=blue&size=m) so I can share or bookmark the specific variant

---

## US-STORE-004: Add to Cart

**As a** visitor,
**I want to** add products to my shopping cart,
**so that** I can collect items I want to purchase and checkout when ready.

### Acceptance Criteria

**AC-004.1: Add to cart action**
- **Given** I am on a product detail page with all required variants selected and the product is in stock
- **When** I click "Add to Cart"
- **Then** the product (with selected variant and quantity) is added to my cart, a confirmation notification appears (e.g., slide-in panel or toast showing "Added to cart!" with the product image, name, variant, quantity, and price), and the cart icon in the header updates to show the total item count

**AC-004.2: Quantity selection**
- **Given** I am on a product detail page
- **When** I use the quantity selector
- **Then** I can increase or decrease the quantity (min 1, max limited by stock availability), and the quantity is reflected when added to cart

**AC-004.3: Cart persistence (authenticated)**
- **Given** I am logged in and add items to my cart
- **When** I log out and log back in (or switch devices)
- **Then** my cart contents are preserved and restored

**AC-004.4: Cart persistence (visitor)**
- **Given** I am a visitor (not logged in) and add items to my cart
- **When** I continue browsing or close and reopen the browser
- **Then** my cart is preserved using local storage/cookies for up to 7 days

**AC-004.5: Cart merge on login**
- **Given** I have items in my visitor cart and I log in to an account that also has a saved cart
- **When** the login completes
- **Then** the carts are merged, combining items and quantities (without exceeding stock limits), and I am notified if any adjustments were made

**AC-004.6: Cart sidebar/dropdown**
- **Given** I click the cart icon in the header
- **When** the cart panel opens
- **Then** I see a summary of all items in my cart with: product image thumbnails, names, variants, quantities (editable), individual prices, subtotal, and buttons for "View Cart" and "Checkout"

**AC-004.7: Update quantity in cart**
- **Given** I am viewing my cart (sidebar or full cart page)
- **When** I change the quantity of an item
- **Then** the quantity updates, the line total and cart total recalculate immediately, and if I set quantity to 0 or click "Remove," the item is removed from the cart

**AC-004.8: Empty cart state**
- **Given** my cart is empty
- **When** I view the cart
- **Then** I see a message "Your cart is empty" with a "Continue Shopping" button linking back to the store

**AC-004.9: Stock validation**
- **Given** I have items in my cart
- **When** I view the cart or proceed to checkout
- **Then** the system validates current stock levels and notifies me if any items are no longer available or have insufficient stock (e.g., "Only 1 remaining - quantity adjusted")

---

## US-STORE-005: Apply Discount Code

**As a** user,
**I want to** apply a discount code to my order,
**so that** I can receive a discount on my purchase.

### Acceptance Criteria

**AC-005.1: Discount code input**
- **Given** I am viewing my cart (full cart page) or the checkout page
- **When** I look for the discount section
- **Then** I see an "Apply Discount Code" input field with an "Apply" button

**AC-005.2: Valid discount code**
- **Given** I have a valid, active discount code
- **When** I enter the code and click "Apply"
- **Then** the discount is applied to my order, the discount amount is shown as a line item (e.g., "Discount (SUMMER20): -10.00 EUR"), the order total is recalculated, and a success message confirms "Discount code applied!"

**AC-005.3: Percentage discount**
- **Given** I apply a percentage-based discount code (e.g., "20% off")
- **When** the discount is applied
- **Then** the discount is calculated as the percentage of the eligible subtotal, and the discount amount is shown (e.g., "20% off: -15.80 EUR")

**AC-005.4: Fixed amount discount**
- **Given** I apply a fixed-amount discount code (e.g., "10 EUR off")
- **When** the discount is applied
- **Then** the discount of 10.00 EUR is deducted from the order total, and if the discount exceeds the order total, the total is set to 0.00 EUR (not negative)

**AC-005.5: Free shipping discount**
- **Given** I apply a free-shipping discount code
- **When** the discount is applied
- **Then** the shipping cost is set to 0.00 EUR and the discount is shown as "Free Shipping (code: FREESHIP)"

**AC-005.6: Invalid discount code**
- **Given** I enter a code that is expired, invalid, or does not exist
- **When** I click "Apply"
- **Then** the system displays an error "This discount code is invalid or has expired" and no discount is applied

**AC-005.7: Minimum order value**
- **Given** a discount code requires a minimum order value (e.g., "10% off orders over 50 EUR")
- **When** my cart total is below the minimum
- **Then** the system displays "This code requires a minimum order of 50.00 EUR. Add X.XX EUR more to apply this discount."

**AC-005.8: Single code limitation**
- **Given** I have already applied a discount code
- **When** I try to apply a second code
- **Then** the system displays "Only one discount code can be applied per order" or replaces the existing code (based on admin configuration)

**AC-005.9: Remove discount code**
- **Given** I have a discount code applied
- **When** I click the "Remove" or "X" button next to the applied code
- **Then** the discount is removed and the order total recalculates to the original amount

**AC-005.10: Discount code restrictions**
- **Given** a discount code is restricted to specific products or categories
- **When** I apply the code to an order that contains both eligible and ineligible items
- **Then** the discount applies only to eligible items, and the discount breakdown shows which items received the discount

---

## US-STORE-006: Checkout with Stripe

**As a** user,
**I want to** complete my purchase through a secure checkout process powered by Stripe,
**so that** I can pay for my items safely and receive my order.

### Acceptance Criteria

**AC-006.1: Proceed to checkout**
- **Given** I have items in my cart
- **When** I click "Checkout"
- **Then** I am directed to the checkout page (if logged in) or prompted to log in / continue as guest (if guest checkout is enabled)

**AC-006.2: Checkout page layout**
- **Given** I am on the checkout page
- **When** the page loads
- **Then** I see a multi-section checkout form with: shipping address form, shipping method selection, order summary (items, quantities, prices, subtotal, shipping, discount, total), and payment section (Stripe Elements)

**AC-006.3: Shipping address form**
- **Given** I am completing the shipping address
- **When** I fill in the form
- **Then** I must provide: full name, street address (line 1 and optional line 2), postal code (PLZ), city, country (defaulting to Germany with international options), and optional phone number; if I am a returning customer, previously used addresses are available for selection

**AC-006.4: Shipping method selection**
- **Given** I have entered my shipping address
- **When** I select a shipping method
- **Then** I see available options with prices and estimated delivery times: "Standard (3-5 business days): 4.95 EUR," "Express (1-2 business days): 9.95 EUR," and "Free Standard Shipping" if the order qualifies (e.g., over 50 EUR)

**AC-006.5: Stripe payment integration**
- **Given** I am on the payment section of checkout
- **When** I view the payment form
- **Then** I see Stripe Elements embedded securely on the page with fields for: card number, expiration date, CVC, and cardholder name, with real-time validation (card type detection, invalid card number, expired card)

**AC-006.6: Supported payment methods**
- **Given** I am completing payment
- **When** I view the payment options
- **Then** I can pay via: credit/debit card (Visa, Mastercard, American Express), Apple Pay (on supported devices), Google Pay (on supported devices), and optionally SEPA Direct Debit (for German customers)

**AC-006.7: Order total confirmation**
- **Given** I have filled in shipping and payment information
- **When** I review the order summary before placing the order
- **Then** I see a clear breakdown: subtotal, shipping cost, discount (if applied), VAT (included, with the amount shown, e.g., "Includes 19% VAT: 12.50 EUR"), and the grand total in EUR

**AC-006.8: Place order**
- **Given** I have completed all checkout fields and reviewed my order
- **When** I click "Place Order" (or "Pay XX.XX EUR")
- **Then** the system processes the payment via Stripe, disables the button to prevent double-submission, shows a loading indicator, and on success redirects me to the order confirmation page

**AC-006.9: Payment failure handling**
- **Given** my payment fails (e.g., insufficient funds, card declined)
- **When** Stripe returns an error
- **Then** the system displays a clear error message (e.g., "Your card was declined. Please try a different payment method.") without losing my form data, and I can retry with the same or different payment method

**AC-006.10: Secure checkout**
- **Given** I am on the checkout page
- **When** I view the page
- **Then** the page is served over HTTPS, Stripe Elements are loaded in an iframe (PCI-compliant), no card data is transmitted to or stored on the ILoveBerlin server, and a security badge/lock icon is visible

**AC-006.11: Guest checkout (optional)**
- **Given** I am a visitor who does not want to create an account
- **When** I proceed to checkout
- **Then** I can complete the purchase by providing my email address (for order confirmation and tracking) and shipping details without registering, with an optional prompt to create an account after checkout

---

## US-STORE-007: View Order Confirmation

**As a** user,
**I want to** see an order confirmation page and receive a confirmation email after a successful purchase,
**so that** I have a record of my order and know what to expect next.

### Acceptance Criteria

**AC-007.1: Order confirmation page**
- **Given** my payment has been successfully processed
- **When** I am redirected to the confirmation page
- **Then** I see: a "Thank you for your order!" message, order number (e.g., "ILB-2026-00001"), order summary (all items with images, names, variants, quantities, prices), shipping address, shipping method and estimated delivery date, payment method summary (e.g., "Visa ending in 4242"), discount applied (if any), total amount charged, and a "Continue Shopping" button

**AC-007.2: Confirmation email**
- **Given** my order is placed successfully
- **When** the order is confirmed
- **Then** I receive an email within 5 minutes containing: order number, itemized order summary, shipping address, estimated delivery date, total amount charged, a link to view my order status on the platform, and customer support contact information

**AC-007.3: Order number format**
- **Given** a new order is placed
- **When** the order number is generated
- **Then** it follows the format "ILB-YYYY-NNNNN" (e.g., "ILB-2026-00042") for easy reference in communications

**AC-007.4: Print/save confirmation**
- **Given** I am on the order confirmation page
- **When** I click "Print" or "Save as PDF"
- **Then** a print-friendly version of the confirmation is generated with all order details

**AC-007.5: Account creation prompt (guest checkout)**
- **Given** I completed checkout as a guest
- **When** I view the confirmation page
- **Then** I see a prompt: "Create an account to track your order and enjoy member benefits" with a simplified registration form (password only, since email is already provided)

---

## US-STORE-008: View Order History

**As a** user,
**I want to** view my past orders and their statuses,
**so that** I can track deliveries, reorder items, or reference past purchases.

### Acceptance Criteria

**AC-008.1: Order history page**
- **Given** I am logged in
- **When** I navigate to My Orders (via account menu or /account/orders)
- **Then** I see a list of all my orders sorted by date (newest first), each showing: order number, order date, total amount, number of items, order status, and a "View Details" link

**AC-008.2: Order status display**
- **Given** I am viewing my order history
- **When** I look at an order's status
- **Then** I see one of the following statuses with appropriate visual indicators: "Payment Processing" (grey), "Confirmed" (blue), "Shipped" (orange, with tracking link), "Delivered" (green), "Cancelled" (red), or "Refunded" (purple)

**AC-008.3: Order detail view**
- **Given** I click "View Details" on an order
- **When** the order detail page loads
- **Then** I see the complete order information: order number, order date, status with timeline/progress indicator, itemized list (images, names, variants, quantities, prices), subtotal, shipping cost, discount (if any), VAT, total, shipping address, shipping method, tracking number (with link to carrier tracking page, if shipped), and payment method summary

**AC-008.4: Order tracking**
- **Given** my order has been shipped
- **When** I view the order details
- **Then** I see a tracking number that links to the shipping carrier's tracking page (e.g., DHL, DPD, Hermes) in a new tab

**AC-008.5: Reorder**
- **Given** I am viewing a past order
- **When** I click "Reorder" or "Buy Again"
- **Then** all items from the order (that are still available) are added to my cart with the same variants and quantities, and I am notified if any items are no longer available

**AC-008.6: Empty order history**
- **Given** I have never placed an order
- **When** I navigate to My Orders
- **Then** I see a message "You haven't placed any orders yet" with a "Browse Store" button

**AC-008.7: Order invoice**
- **Given** I am viewing an order's details
- **When** I click "Download Invoice"
- **Then** a PDF invoice is generated with: seller details (ILoveBerlin company info), buyer details, order number, invoice number, itemized list with VAT breakdown, total, and payment information, formatted in compliance with German invoicing requirements (Rechnungsanforderungen)

---

## US-STORE-009: Manage Products (Admin)

**As an** admin,
**I want to** manage the product catalog including adding, editing, and organizing products,
**so that** the store inventory is up to date and products are well-presented.

### Acceptance Criteria

**AC-009.1: Product management dashboard**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Store > Products
- **Then** I see a searchable, filterable, sortable table of all products with columns: image thumbnail, name, category, price, stock quantity, status (active/draft/out of stock/archived), and action buttons

**AC-009.2: Create product**
- **Given** I am on the products management page
- **When** I click "Add Product"
- **Then** I see a comprehensive product form with sections for: basic info (name, description/rich text, short description), pricing (base price, compare-at price for showing discounts, cost price for margin tracking), media (multiple image upload with drag-to-reorder and primary image selection), variants (add variant options like size, color with individual stock and pricing per variant), inventory (SKU, stock quantity, low-stock threshold, track inventory toggle), categorization (category, tags, collection), shipping (weight, dimensions for shipping calculation), SEO (meta title, meta description, slug), and status (active/draft)

**AC-009.3: Variant management**
- **Given** I am creating or editing a product with variants
- **When** I add variant options (e.g., Size: S, M, L, XL and Color: Blue, Red)
- **Then** the system generates all variant combinations (S-Blue, S-Red, M-Blue, M-Red, etc.) with individual fields for: price override, SKU, stock quantity, and variant-specific image, and I can bulk-edit common fields across variants

**AC-009.4: Product image management**
- **Given** I am editing a product
- **When** I manage images
- **Then** I can upload multiple images (drag-and-drop, max 10 MB each), reorder them via drag-and-drop, set the primary image, assign images to specific variants, add alt text to each image, and delete images

**AC-009.5: Inventory management**
- **Given** I am managing product inventory
- **When** stock changes occur
- **Then** the system tracks stock levels per variant, sends admin notifications when stock reaches the low-stock threshold, automatically updates product availability status (in stock, low stock, out of stock), and maintains an inventory adjustment log

**AC-009.6: Bulk product actions**
- **Given** I am on the product management dashboard
- **When** I select multiple products
- **Then** I can perform bulk actions: publish, unpublish, change category, adjust prices (by percentage or fixed amount), export to CSV, or delete

**AC-009.7: Product duplication**
- **Given** I want to create a similar product
- **When** I click "Duplicate" on an existing product
- **Then** a new product is created with all details copied (except SKU, which is cleared for re-entry), saved as a draft for editing before publication

---

## US-STORE-010: Manage Orders (Admin)

**As an** admin,
**I want to** view and manage customer orders,
**so that** I can fulfill orders, handle issues, and track sales performance.

### Acceptance Criteria

**AC-010.1: Order management dashboard**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Store > Orders
- **Then** I see a filterable, sortable table of all orders with columns: order number, date, customer name, total amount, items count, status, payment status, and action buttons

**AC-010.2: Order detail view (admin)**
- **Given** I click on an order
- **When** the order detail loads
- **Then** I see comprehensive order information: customer details (name, email, shipping address), itemized products (with variant details), payment details (Stripe payment ID, payment status, amount), shipping details (method, tracking number), order timeline (all status changes with timestamps), internal notes section, and action buttons (update status, add tracking, issue refund, add note)

**AC-010.3: Update order status**
- **Given** I am viewing an order
- **When** I update the order status (e.g., from "Confirmed" to "Shipped")
- **Then** the status updates, a status change is logged in the order timeline, and the customer receives an email notification about the status change

**AC-010.4: Add tracking information**
- **Given** I am shipping an order
- **When** I enter the tracking number and select the carrier (DHL, DPD, Hermes, UPS, other)
- **Then** the tracking information is saved, the order status updates to "Shipped," and the customer receives a shipping notification email with the tracking link

**AC-010.5: Issue refund**
- **Given** I need to refund an order (full or partial)
- **When** I click "Issue Refund" and specify the amount (full order or specific items/amounts)
- **Then** the refund is processed via Stripe, the order status updates to "Refunded" (or "Partially Refunded"), the refund amount and reason are logged, and the customer receives a refund confirmation email with expected processing time

**AC-010.6: Order search and filtering**
- **Given** I am on the orders dashboard
- **When** I use the search and filter controls
- **Then** I can search by order number, customer name, or customer email, and filter by: status, date range, payment status, and fulfillment status

**AC-010.7: Order export**
- **Given** I want to export order data
- **When** I click "Export Orders" (with optional date range filter)
- **Then** the system generates a CSV file with all order details for download, suitable for accounting or reporting

**AC-010.8: Sales analytics summary**
- **Given** I am on the orders dashboard
- **When** I view the summary section
- **Then** I see key metrics: total orders (today/this week/this month), total revenue, average order value, top-selling products, and a revenue trend chart

---

## US-STORE-011: Manage Discounts (Admin)

**As an** admin,
**I want to** create and manage discount codes and promotions,
**so that** I can run sales campaigns, reward loyal customers, and incentivize purchases.

### Acceptance Criteria

**AC-011.1: Discount management dashboard**
- **Given** I am logged in as an admin
- **When** I navigate to Admin Panel > Store > Discounts
- **Then** I see a table of all discount codes with: code, type (percentage/fixed/free shipping), value, usage count, usage limit, start date, end date, status (active/expired/disabled), and action buttons

**AC-011.2: Create discount code**
- **Given** I am on the discounts page
- **When** I click "Create Discount"
- **Then** I see a form with fields for: discount code (manually entered or auto-generated), discount type (percentage off, fixed amount off, free shipping), discount value (percentage or EUR amount), minimum order value (optional), maximum discount amount (optional, for percentage discounts), applicable products or categories (all products, specific products, or specific categories), usage limits (total uses, uses per customer), start date and time, end date and time, and active/disabled toggle

**AC-011.3: Auto-generate code**
- **Given** I am creating a discount
- **When** I click "Generate Code"
- **Then** the system creates a random alphanumeric code (e.g., "BERLIN-X7K9M2") that I can customize before saving

**AC-011.4: Discount validation rules**
- **Given** I am creating a discount
- **When** I save the discount
- **Then** the system validates: the code is unique (not already in use), the discount value is positive, the end date is after the start date, and the minimum order value (if set) is a positive number

**AC-011.5: Discount analytics**
- **Given** I am viewing a discount code's details
- **When** I look at the analytics section
- **Then** I see: total times used, total discount amount given, average order value when used, revenue generated from orders using this code, and a usage timeline chart

**AC-011.6: Disable discount**
- **Given** I want to stop a discount code from being used
- **When** I toggle the status to "Disabled" or click "Disable"
- **Then** the code immediately stops working for new orders, and any attempt to apply it returns "This discount code is no longer valid"

**AC-011.7: Duplicate discount**
- **Given** I want to create a similar discount campaign
- **When** I click "Duplicate" on an existing discount
- **Then** a new discount is created with all settings copied (except the code, which must be unique) and saved as a draft

**AC-011.8: Bulk code generation**
- **Given** I want to create unique codes for a promotional campaign
- **When** I click "Generate Bulk Codes" and specify a quantity (e.g., 100), prefix (e.g., "SUMMER"), and discount settings
- **Then** the system generates the specified number of unique codes with the same discount configuration, exportable as a CSV file

---

## Cross-Cutting Concerns

### Performance
- Store pages must load within 2 seconds
- Product image galleries must load images progressively (blur-up or skeleton placeholders)
- Cart operations (add, update, remove) must respond within 1 second
- Checkout page must load within 2 seconds with Stripe Elements initialized

### Security & PCI Compliance
- The store must not store, process, or transmit raw credit card data on its servers (PCI DSS compliance via Stripe Elements)
- All checkout and payment pages must be served over HTTPS (TLS 1.2+)
- Stripe webhook endpoints must validate signatures to prevent spoofed events
- Cart tampering must be prevented (server-side price validation before charging)
- Admin access to order and customer data must be logged

### SEO
- Each product must have a unique canonical URL with a human-readable slug
- Product structured data (JSON-LD, Product schema) must include name, description, image, price, priceCurrency, availability, brand, and aggregateRating
- Category pages must have optimized meta tags
- Out-of-stock products should remain indexed with updated availability markup

### Accessibility
- All store pages must meet WCAG 2.1 AA standards
- Product images must have descriptive alt text
- Variant selectors (color swatches, size buttons) must be keyboard-accessible with visible focus indicators and screen reader labels
- The checkout form must support autocomplete attributes for address fields
- Price information must be announced by screen readers with proper currency formatting

### Legal & Tax Compliance
- All prices must include VAT (Mehrwertsteuer) as required by German law
- VAT amount must be displayed in the cart and on invoices
- Invoices must comply with German requirements (section 14 UStG): seller name and address, buyer name and address, invoice number, invoice date, itemized list with net amount, VAT rate, and gross amount
- Customers must have a 14-day withdrawal right (Widerrufsrecht) per EU distance selling regulations
- The cancellation policy must be clearly presented during checkout

### Shipping
- Shipping rates must be configurable by weight, order value, and destination
- Free shipping thresholds must be configurable by the admin
- International shipping rules and rates must be manageable separately from domestic
- Shipping label generation integration (optional, e.g., DHL API) should be considered for future enhancement

---

*Document End*
