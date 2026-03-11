# Layout System

This document defines the responsive breakpoints, grid system, spacing scale, container widths, and page layout templates for the ILoveBerlin platform. All values are configured in `tailwind.config.ts` and should be used through Tailwind utility classes rather than custom CSS.

---

## Table of Contents

- [Responsive Breakpoints](#responsive-breakpoints)
- [Grid System](#grid-system)
- [Spacing Scale](#spacing-scale)
- [Container Widths](#container-widths)
- [Page Layout Templates](#page-layout-templates)
- [Navigation Layout](#navigation-layout)
- [Z-Index Scale](#z-index-scale)

---

## Responsive Breakpoints

We use a **mobile-first** approach. Base styles target the smallest screens; larger breakpoints override progressively.

| Name | Range | Tailwind Prefix | Target Devices |
|---|---|---|---|
| **Mobile** | 0 -- 639 px | _(default, no prefix)_ | Phones (portrait and landscape) |
| **Tablet** | 640 -- 1023 px | `sm:` and `md:` | Tablets, small laptops |
| **Desktop** | 1024 -- 1279 px | `lg:` | Laptops, desktops |
| **Wide** | 1280 px + | `xl:` and `2xl:` | Large monitors, ultra-wide |

### Tailwind Breakpoint Configuration

```ts
// tailwind.config.ts
const screens = {
  sm: '640px',    // Tablet starts
  md: '768px',    // Larger tablet
  lg: '1024px',   // Desktop starts
  xl: '1280px',   // Wide starts
  '2xl': '1536px' // Ultra-wide
};
```

### Breakpoint Usage Guidelines

- **Never hide critical content** behind a breakpoint. Content should be accessible at every size; only the layout changes.
- **Test at boundary widths** (639, 640, 1023, 1024, 1279, 1280) to catch layout breaks.
- **Use `min-width` media queries** (Tailwind's default). Avoid `max-width` overrides except in rare edge cases.
- **Prefer fluid sizing** (`w-full`, percentages, `fr` units) over fixed pixel widths.

---

## Grid System

The layout uses a **12-column grid** implemented with CSS Grid via Tailwind utilities.

### Base Grid

```html
<!-- 12-column grid container -->
<div class="grid grid-cols-12 gap-6">
  <!-- Full width -->
  <div class="col-span-12">...</div>

  <!-- Two equal columns (desktop) -->
  <div class="col-span-12 lg:col-span-6">...</div>
  <div class="col-span-12 lg:col-span-6">...</div>

  <!-- Content + sidebar (8/4 split) -->
  <main class="col-span-12 lg:col-span-8">...</main>
  <aside class="col-span-12 lg:col-span-4">...</aside>
</div>
```

### Common Column Configurations

| Layout | Mobile | Tablet | Desktop | Wide |
|---|---|---|---|---|
| Full width | 12 | 12 | 12 | 12 |
| Two column | 12 + 12 | 6 + 6 | 6 + 6 | 6 + 6 |
| Content + sidebar | 12 + 12 | 12 + 12 | 8 + 4 | 8 + 4 |
| Three column | 12 | 6 + 6 | 4 + 4 + 4 | 4 + 4 + 4 |
| Four column | 12 | 6 + 6 | 3 + 3 + 3 + 3 | 3 + 3 + 3 + 3 |
| Narrow centered | 12 | 10 (offset 1) | 8 (offset 2) | 6 (offset 3) |

### Card Grids

For listing pages with repeating cards, use `auto-fill` or explicit column counts:

```html
<!-- Listing card grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <ArticleCard />
  <ArticleCard />
  <ArticleCard />
  <!-- ... -->
</div>
```

### Gutter / Gap

| Context | Gap | Tailwind Class |
|---|---|---|
| Page-level grid | 24 px (1.5 rem) | `gap-6` |
| Card grid | 24 px (1.5 rem) | `gap-6` |
| Form field groups | 16 px (1 rem) | `gap-4` |
| Tight inline elements | 8 px (0.5 rem) | `gap-2` |
| Stat card row | 16 px (1 rem) | `gap-4` |

---

## Spacing Scale

All spacing uses a **4 px base unit**. This keeps visual rhythm consistent across the entire UI.

| Token | Value | Tailwind | Common Use |
|---|---|---|---|
| `0` | 0 px | `p-0`, `m-0` | Reset |
| `0.5` | 2 px | `p-0.5` | Fine adjustments |
| `1` | 4 px | `p-1` | Tight padding (badges) |
| `1.5` | 6 px | `p-1.5` | Small button padding |
| `2` | 8 px | `p-2` | Inner padding (chips, tags) |
| `3` | 12 px | `p-3` | Input padding |
| `4` | 16 px | `p-4` | Card inner padding (mobile) |
| `5` | 20 px | `p-5` | Section spacing (mobile) |
| `6` | 24 px | `p-6` | Card inner padding (desktop), grid gap |
| `8` | 32 px | `p-8` | Section padding |
| `10` | 40 px | `p-10` | Large section padding |
| `12` | 48 px | `p-12` | Page vertical padding |
| `16` | 64 px | `p-16` | Hero internal spacing |
| `20` | 80 px | `p-20` | Major section separation |
| `24` | 96 px | `p-24` | Page top/bottom margin |

### Spacing Guidelines

1. **Vertical rhythm:** Use multiples of 4 px. When in doubt, use `gap-6` (24 px) between major elements and `gap-4` (16 px) between related elements.
2. **Section spacing:** Separate major page sections with `py-12` (48 px) on mobile and `py-20` (80 px) on desktop.
3. **Component internal spacing:** Cards use `p-4` on mobile and `p-6` on desktop. Consistency across all cards is more important than custom padding for each.
4. **Negative space is intentional.** Do not fill empty space just because it exists. White space improves readability.

---

## Container Widths

The main content container centers content horizontally and constrains maximum width.

```html
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### Container Configuration

```ts
// tailwind.config.ts
const container = {
  center: true,
  padding: {
    DEFAULT: '1rem',     // 16 px on mobile
    sm: '1.5rem',        // 24 px on tablet
    lg: '2rem',          // 32 px on desktop
  },
};
```

### Max Widths by Context

| Context | Max Width | Tailwind Class | Rationale |
|---|---|---|---|
| Full page container | 1280 px | `max-w-7xl` | Comfortable reading on wide screens |
| Content area (articles) | 768 px | `max-w-3xl` | Optimal line length for prose |
| Form container | 768 px | `max-w-3xl` | Focused form experience |
| Narrow content (auth pages) | 448 px | `max-w-md` | Login/signup cards |
| Dialog / modal | 512 px (sm), 640 px (md), 768 px (lg) | `max-w-lg` (default) | Depends on content complexity |
| Dashboard content | No max-width | `w-full` | Uses available space |

### Full-Bleed Sections

Some sections (hero banners, promotional strips, footer) break out of the container to span the full viewport width:

```html
<!-- Full-bleed pattern -->
<section class="w-full bg-primary-900">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Constrained content within full-bleed background -->
  </div>
</section>
```

---

## Page Layout Templates

### Full-Width Layout

Used for: Home page, landing pages, listing pages.

```
+--------------------------------------------------+
|  NavigationBar (sticky, full-width)               |
+--------------------------------------------------+
|  HeroSection (full-bleed)                         |
+--------------------------------------------------+
|  [container]                                      |
|    FilterBar                                      |
|    Content Grid (1 / 2 / 3 / 4 cols responsive)  |
|    Pagination                                     |
|  [/container]                                     |
+--------------------------------------------------+
|  Promotional Section (full-bleed)                 |
+--------------------------------------------------+
|  [container]                                      |
|    More Content                                   |
|  [/container]                                     |
+--------------------------------------------------+
|  Footer (full-bleed)                              |
+--------------------------------------------------+
```

```tsx
// apps/web/src/components/layouts/full-width-layout.tsx
export function FullWidthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Sidebar Layout

Used for: Detail pages (article, event, restaurant).

```
+--------------------------------------------------+
|  NavigationBar                                    |
+--------------------------------------------------+
|  [container]                                      |
|    grid grid-cols-12 gap-6                        |
|    +------------------------------+  +---------+ |
|    | Main Content   col-span-8    |  | Sidebar | |
|    | (scrolls normally)           |  | col-4   | |
|    |                              |  | sticky  | |
|    +------------------------------+  +---------+ |
|  [/container]                                     |
+--------------------------------------------------+
|  Footer                                           |
+--------------------------------------------------+
```

```tsx
export function SidebarLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">{children}</div>
            <aside className="col-span-12 lg:col-span-4">
              <div className="lg:sticky lg:top-20">{sidebar}</div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

### Two-Column Layout

Used for: Comparison pages, neighborhood overview.

```
+--------------------------------------------------+
|  NavigationBar                                    |
+--------------------------------------------------+
|  [container]                                      |
|    grid grid-cols-12 gap-6                        |
|    +--------------------+  +--------------------+ |
|    | Left Column        |  | Right Column       | |
|    | col-span-6         |  | col-span-6         | |
|    +--------------------+  +--------------------+ |
|  [/container]                                     |
+--------------------------------------------------+
|  Footer                                           |
+--------------------------------------------------+
```

Both columns stack to full width on mobile and tablet (below `lg:`).

### Dashboard Layout

Used for: Admin panel, creator dashboard.

```
+------+-------------------------------------------+
|      |  Top Bar (search, notifications, user)    |
| Side +-------------------------------------------+
| bar  |  [content area, scrollable]               |
| 256  |    Breadcrumbs                             |
| px   |    Page Title + Actions                    |
|      |    Stat Cards (grid)                       |
| or   |    Data Table / Content List               |
|      |                                            |
| 64px +-------------------------------------------+
| icon |  (no footer in dashboard)                  |
+------+-------------------------------------------+
```

```tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-primary-900">
        <DashboardSidebar />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden">
        <NavigationBar />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-6 py-4">
          <DashboardTopBar />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## Navigation Layout

### Sticky Header (Public Pages)

- Position: `sticky top-0 z-50`
- Height: 64 px (`h-16`)
- Background: `bg-white/95 backdrop-blur-md` (semi-transparent with blur for content scroll-through effect)
- Border: `border-b border-neutral-200`
- Shadow on scroll: Dynamically add `shadow-sm` when `scrollY > 0`

```tsx
// Scroll detection hook
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 0);
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Applied class
<nav className={cn(
  'sticky top-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-shadow',
  scrolled && 'shadow-sm'
)}>
```

### Mobile Hamburger Menu

- Trigger: Hamburger icon button in the top-right of the NavigationBar (visible below `lg:`)
- Panel: Slides in from the right, covers full screen width and height
- Background overlay: `bg-black/50` behind the panel, clicking it closes the menu
- Content: All nav links stacked vertically, user info at bottom, close button at top-right
- Animation: `transform transition-transform duration-300 ease-out` from `translate-x-full` to `translate-x-0`
- Focus trap: When open, Tab cycles through menu items only. Escape closes the menu.

### Admin Sidebar

- Width: 256 px (expanded), 64 px (collapsed icon-only mode)
- Position: `fixed inset-y-0 left-0` on desktop
- Background: `bg-primary-900`
- Navigation items: Icon + label, grouped into sections with subtle dividers
- Active item: `bg-primary-700 rounded-lg text-white`
- Inactive item: `text-neutral-300 hover:bg-primary-800 hover:text-white rounded-lg`
- Collapse toggle: Chevron button at the bottom of the sidebar
- On mobile (below `lg:`): Sidebar is hidden entirely; the standard mobile hamburger menu is used instead

---

## Z-Index Scale

Manage stacking contexts with a defined scale to prevent z-index wars.

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `base` | 0 | `z-0` | Default stacking |
| `dropdown` | 10 | `z-10` | Dropdown menus, popovers |
| `sticky` | 20 | `z-20` | Sticky sidebar, sticky table headers |
| `overlay` | 30 | `z-30` | Background overlays (scrim behind modals) |
| `modal` | 40 | `z-40` | Modal dialogs, bottom sheets |
| `navbar` | 50 | `z-50` | Navigation bar (always on top) |
| `toast` | 60 | `z-[60]` | Toast notifications (above everything) |

### Rules

- Never use arbitrary z-index values outside this scale.
- If two elements at the same z-level overlap, restructure the DOM order rather than bumping z-index.
- Modals and toasts should use React portals to render at the document root, avoiding ancestor stacking context issues.

---

## Tailwind Configuration Reference

Here is the consolidated layout-related section of `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      maxWidth: {
        '8xl': '1440px',
      },
      spacing: {
        '18': '4.5rem',  // 72 px -- useful for navbar offset
        '88': '22rem',   // 352 px
        '128': '32rem',  // 512 px
      },
    },
  },
  plugins: [],
};

export default config;
```
