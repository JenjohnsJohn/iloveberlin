# Component Library

This document specifies the UI components used across the ILoveBerlin platform, organized following **Atomic Design** methodology. Each component lists its purpose, props/variants, responsive behavior, and accessibility requirements.

All components are built with **React** (Next.js) and styled with **Tailwind CSS**. The Flutter mobile app mirrors these components with equivalent Dart widgets.

---

## Table of Contents

- [Design Principles](#design-principles)
- [Atoms](#atoms)
- [Molecules](#molecules)
- [Organisms](#organisms)
- [Templates](#templates)

---

## Design Principles

1. **Composition over configuration.** Prefer composing small components over adding flags to large ones.
2. **Accessible by default.** Every component must pass axe-core automated checks and support keyboard navigation.
3. **Server Components first.** Default to React Server Components. Add `'use client'` only when the component requires interactivity, browser APIs, or React hooks.
4. **Co-located styles.** Use Tailwind utility classes directly in JSX. Extract repeated patterns into component-level abstractions, not global CSS.

---

## Atoms

Atoms are the smallest building blocks. They have no internal dependencies on other custom components.

### Button

The primary interactive element for triggering actions.

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Variants**

| Variant | Background | Text | Border | Use Case |
|---|---|---|---|---|
| `primary` | `bg-primary-900` | `text-white` | none | Primary actions (Save, Submit, Publish) |
| `secondary` | `bg-accent-500` | `text-white` | none | Call-to-action (Sign Up, Explore) |
| `outline` | `bg-transparent` | `text-primary-900` | `border-primary-900` | Secondary actions (Cancel, Edit) |
| `ghost` | `bg-transparent` | `text-primary-700` | none | Tertiary actions (Learn More, View All) |
| `danger` | `bg-error` | `text-white` | none | Destructive actions (Delete, Remove) |

**Sizes**

| Size | Padding | Font Size | Min Height |
|---|---|---|---|
| `sm` | `px-3 py-1.5` | `text-body-sm` (14 px) | 32 px |
| `md` | `px-4 py-2` | `text-body` (16 px) | 40 px |
| `lg` | `px-6 py-3` | `text-body-lg` (18 px) | 48 px |

**States:** hover (5% darker), active (10% darker), focus (2 px ring in `primary-500`), disabled (50% opacity, `cursor-not-allowed`), loading (spinner replaces leftIcon, pointer-events disabled).

**Accessibility:** Renders as `<button>` by default. When used as a link, render as `<a>` with `role="button"` only if it triggers a JS action; otherwise use a plain `<a>`. Always provide visible text or `aria-label`.

---

### Input

Text input field for forms.

```tsx
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  label: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}
```

**Anatomy:** Label (above) + input field + helper text or error message (below).

**States:**
- Default: `border-neutral-300`, `bg-white`
- Focus: `border-primary-500`, `ring-2 ring-primary-500/20`
- Error: `border-error`, helper text turns red, error icon appears
- Disabled: `bg-neutral-100`, `text-neutral-400`, `cursor-not-allowed`

**Responsive:** Full-width on mobile. On desktop forms, respect the parent grid column width.

**Accessibility:** The `<label>` is always rendered and linked to the input via `htmlFor`/`id`. Error messages use `aria-describedby`. Required fields use `aria-required="true"`.

---

### Badge

Small status indicator or count label.

```tsx
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md';
  children: React.ReactNode;
}
```

**Rendering:** Inline `<span>` with `rounded-full`, appropriate background/text color from the semantic palette, and `font-medium`.

| Variant | Classes |
|---|---|
| `default` | `bg-neutral-100 text-neutral-800` |
| `success` | `bg-success-light text-success-dark` |
| `warning` | `bg-warning-light text-warning-dark` |
| `error` | `bg-error-light text-error-dark` |
| `info` | `bg-info-light text-info-dark` |

---

### Avatar

User profile image with fallback initials.

```tsx
interface AvatarProps {
  src?: string;
  alt: string;
  name: string;           // used to generate initials fallback
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
}
```

**Sizes:** `xs` = 24 px, `sm` = 32 px, `md` = 40 px, `lg` = 56 px, `xl` = 80 px.

**Fallback:** When `src` is undefined or fails to load, display the user's initials (first letter of first and last name) on a `bg-primary-100 text-primary-900` circle.

**Status indicator:** A small colored dot positioned at the bottom-right of the avatar circle (green = online, gray = offline, yellow = away).

---

### Icon

Wrapper around Lucide icons for consistent sizing and color.

```tsx
interface IconProps {
  name: string;            // Lucide icon name, e.g. "map-pin"
  size?: 'sm' | 'md' | 'lg';  // 16, 20, 24 px
  className?: string;
  'aria-hidden'?: boolean; // true when decorative
}
```

When the icon is decorative (next to a text label), set `aria-hidden="true"`. When the icon is the sole content of a button, the button must have `aria-label`.

---

## Molecules

Molecules combine atoms into functional UI units.

### Card

A surface container for grouped content.

```tsx
interface CardProps {
  variant: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;     // adds hover shadow lift
  onClick?: () => void;    // if set, renders as <a> or interactive element
  children: React.ReactNode;
}
```

**Variants:**
- `elevated`: `bg-white shadow-md rounded-xl`
- `outlined`: `bg-white border border-neutral-200 rounded-xl`
- `flat`: `bg-neutral-100 rounded-xl`

**Hover (when `hoverable`):** `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`

**Sub-components:** `Card.Image`, `Card.Header`, `Card.Body`, `Card.Footer` for structured layout within the card.

---

### SearchBar

Combined input + button for search functionality.

```tsx
interface SearchBarProps {
  placeholder?: string;    // default: "Search Berlin..."
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions?: string[];
  showFilterButton?: boolean;
  size?: 'md' | 'lg';
}
```

**Anatomy:** Magnifying glass icon (left) + text input + clear button (when value is non-empty, right) + optional filter toggle button.

**Responsive:**
- Mobile: Full-width, `size="md"`, filter button opens a bottom sheet.
- Desktop: Can be constrained to `max-w-2xl`, `size="lg"`, filter button opens a dropdown.

**Behavior:** Debounced `onChange` (300 ms). Shows suggestion dropdown when `suggestions` is non-empty. Keyboard navigation (Arrow Up/Down + Enter) through suggestions.

---

### FilterChip

Toggleable filter tag used in filter bars and search refinement.

```tsx
interface FilterChipProps {
  label: string;
  selected?: boolean;
  count?: number;          // shows badge with count
  onToggle?: () => void;
  removable?: boolean;     // shows X icon when selected
}
```

**States:**
- Unselected: `bg-neutral-100 text-neutral-800 border border-neutral-200`
- Selected: `bg-primary-50 text-primary-900 border border-primary-500`
- Hover: slightly darker background

**Accessibility:** Renders as `<button>` with `aria-pressed` reflecting the selected state.

---

### MediaUploader

Drag-and-drop or click-to-upload area for images and files.

```tsx
interface MediaUploaderProps {
  accept: string[];        // e.g. ['image/jpeg', 'image/png', 'image/webp']
  maxSizeMB: number;       // default: 10
  maxFiles: number;        // default: 1
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  preview?: boolean;       // show thumbnail preview
}

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  progress?: number;       // 0-100 during upload
}
```

**States:** Empty (dashed border, upload icon, "Drag & drop or click to upload"), dragging over (blue dashed border, `bg-primary-50`), uploading (progress bar), uploaded (thumbnail grid with remove button).

**Validation:** Client-side checks for file type and size before upload begins. Shows inline error for rejected files.

---

### DatePicker

Date selection input with calendar dropdown.

```tsx
interface DatePickerProps {
  label: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;    // default: "Select a date"
  disabled?: boolean;
  error?: string;
}
```

**Behavior:** Click the input to open a calendar popover. Navigate months with arrow buttons. Today is highlighted. Selected date is filled with `bg-primary-900 text-white`. Dates outside `minDate`/`maxDate` are dimmed and unselectable.

**Responsive:** Calendar popover on desktop; full-screen modal on mobile (below 640 px).

**Accessibility:** Full keyboard navigation. Arrow keys move focus between dates. Enter selects. Escape closes.

---

## Organisms

Organisms are complex components composed of atoms and molecules.

### ArticleCard

Displays a blog article or city guide preview.

```tsx
interface ArticleCardProps {
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: Date;
  readingTime: number;     // minutes
  slug: string;
  featured?: boolean;      // larger variant
}
```

**Layout:**
- Default: Vertical card -- image top (3:2), content bottom.
- Featured: Horizontal card on desktop -- image left (50%), content right (50%). Falls back to vertical on mobile.

**Content order:** Category badge, title (H3, 2-line clamp), excerpt (3-line clamp), author avatar + name + date + reading time.

**Responsive:**
- Mobile: Full-width vertical stack, `gap-4`
- Tablet: 2-column grid
- Desktop: 3-column grid; featured cards span 2 columns

---

### EventCard

Displays an event listing.

```tsx
interface EventCardProps {
  title: string;
  description: string;
  coverImage: string;
  date: Date;
  endDate?: Date;
  time: string;
  location: {
    name: string;
    neighborhood: string;
  };
  price?: {
    amount: number;
    currency: string;      // default: 'EUR'
  };
  category: string;
  isFree: boolean;
  slug: string;
  saved?: boolean;
  onSave?: () => void;
}
```

**Layout:** Vertical card with image (3:2). Below the image: date block (large day number + month abbreviation in a colored box), title, location with map-pin icon, price or "Free" badge, save/heart button.

**Date block styling:** `bg-accent-500 text-white rounded-lg` with the day number in `text-h2` weight and month in `text-caption` uppercase.

---

### RestaurantCard

Displays a restaurant or cafe listing.

```tsx
interface RestaurantCardProps {
  name: string;
  cuisine: string[];       // e.g. ['Vietnamese', 'Vegan-friendly']
  coverImage: string;
  rating: number;          // 0.0 - 5.0
  reviewCount: number;
  priceLevel: 1 | 2 | 3;  // $ / $$ / $$$
  neighborhood: string;
  distance?: string;       // e.g. "0.3 km"
  isOpen?: boolean;
  openUntil?: string;      // e.g. "10:00 PM"
  slug: string;
}
```

**Layout:** Horizontal card on desktop (image left, 40%), vertical on mobile. Shows star rating with numeric value, cuisine tags as FilterChips, price level as repeated euro sign, open/closed status badge.

---

### NavigationBar

Main site navigation header.

```tsx
interface NavigationBarProps {
  user?: {
    name: string;
    avatar?: string;
    role: 'user' | 'creator' | 'admin';
  };
  currentPath: string;
}
```

**Anatomy:**
- Left: Logo (links to home)
- Center: Primary nav links -- Explore, Events, Restaurants, Articles, Neighborhoods
- Right: Search icon button, Language toggle (EN/DE), user avatar dropdown (or Sign In / Sign Up buttons)

**Responsive:**
- Desktop (1024 px+): Full horizontal bar, sticky at top (`sticky top-0 z-50`), `bg-white/95 backdrop-blur-md shadow-sm`, height 64 px.
- Mobile/Tablet (< 1024 px): Logo left, hamburger button right. Hamburger opens a full-screen slide-in menu from the right with all nav links stacked vertically.

**Active state:** Current page link has `text-primary-900 font-semibold` with a 2 px bottom border in accent color.

---

### Footer

Site-wide footer.

```tsx
// No dynamic props -- content is static / configured via CMS
```

**Sections:**
1. **Brand column:** Logo, tagline ("Your guide to the best of Berlin"), social media icon links (Instagram, Twitter/X, Facebook, TikTok).
2. **Explore column:** Links to Explore, Events, Restaurants, Articles, Neighborhoods.
3. **Company column:** About Us, Contact, Careers, Press.
4. **Legal column:** Privacy Policy, Terms of Service, Imprint (Impressum), Cookie Settings.
5. **Newsletter row:** Email input + "Subscribe" button spanning full width.
6. **Bottom bar:** Copyright notice, "Made with love in Berlin" tagline.

**Responsive:** 4-column grid on desktop, 2-column on tablet, single-column accordion on mobile.

**Styling:** `bg-primary-900 text-white`, links in `text-neutral-300 hover:text-white`.

---

### HeroSection

Full-width hero banner for landing and listing pages.

```tsx
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  showSearch?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'full';
  overlay?: 'light' | 'dark';   // gradient overlay
  cta?: {
    label: string;
    href: string;
  };
}
```

**Heights:** `sm` = 300 px, `md` = 450 px, `lg` = 600 px, `full` = 100vh.

**Overlay:** `dark` applies `bg-gradient-to-t from-black/70 via-black/30 to-transparent`. `light` applies `bg-gradient-to-t from-white/70 via-white/30 to-transparent`.

**Content:** Centered vertically and horizontally. Title in `text-display text-white`, subtitle in `text-body-lg text-white/90`. SearchBar below subtitle when `showSearch` is true.

**Responsive:** Heights reduce by ~30% on mobile. Text sizes step down one level.

---

### FilterBar

Horizontal scrollable bar of FilterChips for listing pages.

```tsx
interface FilterBarProps {
  filters: {
    key: string;
    label: string;
    options: { value: string; label: string; count?: number }[];
    type: 'single' | 'multi';
  }[];
  activeFilters: Record<string, string[]>;
  onChange: (filters: Record<string, string[]>) => void;
  onClearAll: () => void;
}
```

**Layout:** Horizontally scrollable on mobile (hide scrollbar, show fade-out gradient on edges). Wrapping flex on desktop. "Clear all" link appears when any filter is active.

**Behavior:** Clicking a filter chip with type `single` opens a dropdown. Type `multi` toggles directly. Active filter count shown as a badge on the parent category.

---

## Templates

Templates are full-page layouts composed of organisms. They define content zones but not the actual content.

### ListingPage

Used for: Explore page, Events listing, Restaurants listing, Articles listing, Search results.

**Structure:**
```
+---------------------------------------------+
|              NavigationBar                   |
+---------------------------------------------+
|              HeroSection (sm)                |
+---------------------------------------------+
|   FilterBar                                  |
+---------------------------------------------+
|                                              |
|   Content Grid                               |
|   +--------+ +--------+ +--------+          |
|   | Card   | | Card   | | Card   |          |
|   +--------+ +--------+ +--------+          |
|   +--------+ +--------+ +--------+          |
|   | Card   | | Card   | | Card   |          |
|   +--------+ +--------+ +--------+          |
|                                              |
|   [ Load More / Pagination ]                 |
|                                              |
+---------------------------------------------+
|              Footer                          |
+---------------------------------------------+
```

**Grid:** 1 column on mobile, 2 on tablet, 3 on desktop, 4 on wide. Gap: `gap-6`.

**Pagination:** Infinite scroll with a "Load more" button as fallback. URL updates with page number for SEO.

---

### DetailPage

Used for: Article detail, Event detail, Restaurant detail, Neighborhood guide.

**Structure:**
```
+---------------------------------------------+
|              NavigationBar                   |
+---------------------------------------------+
|              Hero Image (md)                 |
+---------------------------------------------+
|                                              |
|   +---------------------------+  +---------+ |
|   | Main Content              |  | Sidebar | |
|   | (article body, details,   |  | (map,   | |
|   |  photos, reviews)         |  |  info   | |
|   |                           |  |  card,  | |
|   |                           |  |  share) | |
|   +---------------------------+  +---------+ |
|                                              |
|   Related Items (horizontal scroll)          |
|                                              |
+---------------------------------------------+
|              Footer                          |
+---------------------------------------------+
```

**Layout:** 8/4 column split on desktop (content / sidebar). Single column on mobile with sidebar content moved below main content.

**Sidebar:** Sticky within its container (`sticky top-20`), containing a summary info card, map embed, share buttons, and "Save" button.

---

### FormPage

Used for: Create/Edit article, Create/Edit event, User settings, Contact form.

**Structure:**
```
+---------------------------------------------+
|              NavigationBar                   |
+---------------------------------------------+
|                                              |
|   Page Title + Breadcrumbs                   |
|                                              |
|   +---------------------------+              |
|   | Form Section 1            |              |
|   | (grouped inputs)          |              |
|   +---------------------------+              |
|                                              |
|   +---------------------------+              |
|   | Form Section 2            |              |
|   | (grouped inputs)          |              |
|   +---------------------------+              |
|                                              |
|   [ Cancel ]          [ Save Draft ] [ Publish ] |
|                                              |
+---------------------------------------------+
|              Footer                          |
+---------------------------------------------+
```

**Layout:** Centered single column, `max-w-3xl`, with form sections as Card components. Each section has a heading (H3) and grouped inputs.

**Sticky actions:** On mobile, the action buttons stick to the bottom of the viewport.

---

### DashboardPage

Used for: Admin dashboard, Creator dashboard, User profile.

**Structure:**
```
+------+--------------------------------------+
| Side |          NavigationBar               |
| bar  +--------------------------------------+
|      |                                      |
|      |   Page Title + Actions               |
|      |                                      |
|      |   +----------+ +----------+          |
|      |   | Stat     | | Stat     |          |
|      |   | Card     | | Card     |          |
|      |   +----------+ +----------+          |
|      |                                      |
|      |   +-----------------------------+    |
|      |   | Data Table / Content List   |    |
|      |   +-----------------------------+    |
|      |                                      |
+------+--------------------------------------+
```

**Sidebar:** 256 px wide on desktop, collapsible to icon-only (64 px). Hidden on mobile -- replaced by the standard hamburger NavigationBar. Contains: logo, nav links (Dashboard, Content, Events, Analytics, Settings), user info at bottom.

**Sidebar styling:** `bg-primary-900 text-white`, active link has `bg-primary-700 rounded-lg`.

**Content area:** Stat cards in a 2-column (tablet) or 4-column (desktop) grid at the top. Below that, a data table or card list with sorting, filtering, and pagination.

---

## Component File Structure

```
apps/web/src/components/
  ui/                      # Atoms
    button.tsx
    input.tsx
    badge.tsx
    avatar.tsx
    icon.tsx
  composed/                # Molecules
    card.tsx
    search-bar.tsx
    filter-chip.tsx
    media-uploader.tsx
    date-picker.tsx
  features/                # Organisms
    article-card.tsx
    event-card.tsx
    restaurant-card.tsx
    navigation-bar.tsx
    footer.tsx
    hero-section.tsx
    filter-bar.tsx
  layouts/                 # Templates
    listing-layout.tsx
    detail-layout.tsx
    form-layout.tsx
    dashboard-layout.tsx
```

Each component file exports the component as a named export. Shared TypeScript types go in a sibling `.types.ts` file (e.g., `button.types.ts`) when they grow beyond a few lines.
