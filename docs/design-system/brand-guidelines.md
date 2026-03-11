# Brand Guidelines

This document defines the visual and verbal identity of **ILoveBerlin**. Follow these rules in every customer-facing surface -- web, mobile, email, social, and print.

---

## 1. Brand Name Usage

The official brand name is **ILoveBerlin** -- written as one word with capital **I**, capital **L**, and capital **B**.

| Context | Correct | Incorrect |
|---|---|---|
| Running text | ILoveBerlin | I Love Berlin, iLoveBerlin, Iloveberlin, ILOVEBERLIN |
| Domain / URL | iloveberlin.biz | -- |
| Hashtag | #ILoveBerlin | #iloveberlin (acceptable only where platform forces lowercase) |
| Code identifiers | `ILoveBerlin` (PascalCase class names), `iloveberlin` (package names, URLs) | -- |

Never abbreviate the brand name to "ILB" in user-facing content. Internal shorthand is acceptable in code comments and Slack.

---

## 2. Logo

### Primary Logo

The primary logo combines the **ILoveBerlin** wordmark with a stylized heart icon that subtly incorporates the silhouette of the Brandenburg Gate.

### Usage Rules

- **Minimum size:** 120 px wide on screen, 30 mm wide in print.
- **Clear space:** Maintain a clear zone around the logo equal to the height of the letter "I" in the wordmark.
- **Backgrounds:** Use the full-color logo on white or light neutral backgrounds. Use the white (reversed) logo on dark or photographic backgrounds.
- **Do not** rotate, stretch, recolor, add effects (drop shadow, glow), or place on busy backgrounds without a scrim.

### Logo Variants

| Variant | File | Use When |
|---|---|---|
| Full color | `logo-full-color.svg` | Default for light backgrounds |
| Reversed (white) | `logo-reversed.svg` | Dark or photographic backgrounds |
| Monochrome (black) | `logo-mono-black.svg` | Single-color printing |
| Favicon / app icon | `logo-icon.svg` | Browser tab, app icon, social avatar |

Logo assets live in `/public/brand/`.

---

## 3. Color Palette

### Primary Colors

| Name | Hex | Tailwind Token | Usage |
|---|---|---|---|
| Berlin Blue | `#1E3A5F` | `primary-900` | Primary buttons, headings, navbar background |
| Berlin Blue Light | `#2B5A8F` | `primary-700` | Links, active states |
| Berlin Blue Lighter | `#4A7FB5` | `primary-500` | Hover states, secondary elements |
| Berlin Blue Pale | `#E8F0FE` | `primary-50` | Tinted backgrounds, badges |

### Secondary / Accent Colors

| Name | Hex | Tailwind Token | Usage |
|---|---|---|---|
| Vibrant Coral | `#E85D4A` | `accent-500` | Call-to-action buttons, highlights, hearts/likes |
| Coral Light | `#F4A698` | `accent-300` | Hover accents, illustrations |
| Coral Dark | `#C24434` | `accent-700` | Pressed state for accent buttons |

### Neutral Colors

| Name | Hex | Tailwind Token | Usage |
|---|---|---|---|
| Neutral 950 | `#0F1114` | `neutral-950` | Primary text |
| Neutral 800 | `#2D3239` | `neutral-800` | Secondary text |
| Neutral 600 | `#5C6370` | `neutral-600` | Tertiary text, placeholders |
| Neutral 400 | `#9CA3AF` | `neutral-400` | Disabled text, borders |
| Neutral 200 | `#E5E7EB` | `neutral-200` | Dividers, light borders |
| Neutral 100 | `#F3F4F6` | `neutral-100` | Page backgrounds, cards |
| White | `#FFFFFF` | `white` | Card surfaces, input backgrounds |

### Semantic Colors

| Purpose | Default | Light (bg) | Dark (text/icon) | Tailwind Prefix |
|---|---|---|---|---|
| Success | `#16A34A` | `#DCFCE7` | `#166534` | `success-*` |
| Warning | `#EAB308` | `#FEF9C3` | `#854D0E` | `warning-*` |
| Error | `#DC2626` | `#FEE2E2` | `#991B1B` | `error-*` |
| Info | `#2563EB` | `#DBEAFE` | `#1E40AF` | `info-*` |

### Accessibility Notes

- Body text (`neutral-950` on `white`) achieves a contrast ratio of **17.4:1** (AAA).
- Primary button text (white on `Berlin Blue #1E3A5F`) achieves **9.8:1** (AAA).
- Accent button text (white on `Vibrant Coral #E85D4A`) achieves **4.6:1** (AA). Use bold/large text if the ratio is borderline.
- Never rely on color alone to convey meaning. Pair color with icons, text labels, or patterns.

### Tailwind Configuration

```ts
// tailwind.config.ts (excerpt)
const colors = {
  primary: {
    50:  '#E8F0FE',
    100: '#D1E1FD',
    300: '#7DAAE0',
    500: '#4A7FB5',
    700: '#2B5A8F',
    900: '#1E3A5F',
  },
  accent: {
    300: '#F4A698',
    500: '#E85D4A',
    700: '#C24434',
  },
  success: { light: '#DCFCE7', DEFAULT: '#16A34A', dark: '#166534' },
  warning: { light: '#FEF9C3', DEFAULT: '#EAB308', dark: '#854D0E' },
  error:   { light: '#FEE2E2', DEFAULT: '#DC2626', dark: '#991B1B' },
  info:    { light: '#DBEAFE', DEFAULT: '#2563EB', dark: '#1E40AF' },
};
```

---

## 4. Typography

### Font Families

| Role | Font | Fallback Stack | Tailwind Class |
|---|---|---|---|
| Headings | **Inter** (preferred) or **Poppins** | `'Inter', 'Poppins', ui-sans-serif, system-ui, -apple-system, sans-serif` | `font-heading` |
| Body | System font stack | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | `font-body` (default) |
| Code / Monospace | JetBrains Mono | `'JetBrains Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace` | `font-mono` |

Load Inter from Google Fonts via `next/font/google` to avoid layout shift:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});
```

### Type Scale

| Name | Size (rem / px) | Line Height | Weight | Tailwind Class | Use |
|---|---|---|---|---|---|
| Display | 3 / 48 | 1.1 | 700 | `text-display` | Hero headlines |
| H1 | 2.25 / 36 | 1.2 | 700 | `text-h1` | Page titles |
| H2 | 1.875 / 30 | 1.25 | 600 | `text-h2` | Section headings |
| H3 | 1.5 / 24 | 1.3 | 600 | `text-h3` | Sub-section headings |
| H4 | 1.25 / 20 | 1.35 | 600 | `text-h4` | Card titles |
| Body Large | 1.125 / 18 | 1.6 | 400 | `text-body-lg` | Lead paragraphs |
| Body | 1 / 16 | 1.6 | 400 | `text-body` | Default body text |
| Body Small | 0.875 / 14 | 1.5 | 400 | `text-body-sm` | Captions, helper text |
| Caption | 0.75 / 12 | 1.5 | 400 | `text-caption` | Timestamps, footnotes |

### Rules

- Use **sentence case** for headings ("Discover hidden gems in Berlin", not "Discover Hidden Gems In Berlin").
- Maximum paragraph width: **72 characters** (`max-w-prose` in Tailwind) for comfortable reading.
- Use `font-medium` (500) for UI labels and `font-semibold` (600) for emphasis within body text.

---

## 5. Tone of Voice

ILoveBerlin speaks as a **knowledgeable local friend** who also understands that Berlin is an international city.

### Voice Attributes

| Attribute | What It Means | Example |
|---|---|---|
| **Friendly** | Warm, approachable, never corporate | "Welcome back! Here's what's happening this week." |
| **Informative** | Fact-based, useful, action-oriented | "Markthalle Neun hosts Street Food Thursday every Thursday from 5 to 10 PM." |
| **Local** | Insider knowledge, neighborhood-level detail | "Tucked behind the U-Bahn arches in Kreuzberg..." |
| **Cosmopolitan** | Inclusive, multilingual-aware, globally curious | "Whether you just moved here or have been a Berliner for decades..." |

### Writing Tips

- **Be direct.** Lead with the most useful information.
- **Use active voice.** "We updated the event listings" not "The event listings have been updated."
- **Avoid jargon.** If a German term has no perfect English equivalent (e.g., "Kiez"), explain it on first use.
- **Use contractions** in UI copy ("don't", "you'll") to stay conversational, but avoid them in legal text.
- **Be culturally sensitive.** Berlin's history is complex. When referencing historical sites, use respectful, factual language.

### UI Microcopy Examples

| Scenario | Copy |
|---|---|
| Empty search results | "No results for '{{query}}'. Try broadening your search or explore what's trending." |
| Successful save | "Saved! You'll find this in your favorites." |
| Error state | "Something went wrong. Please try again, and if the problem persists, contact us." |
| Loading state | "Loading the latest from Berlin..." |
| 404 page | "This page has moved on, like a pop-up bar in Neukölln. Let's get you back on track." |

---

## 6. Imagery Style

### Photography

- **Authentic:** Use real photos of Berlin -- streets, neighborhoods, food, events, people. Avoid generic stock photography.
- **Diverse representation:** Show the full diversity of Berlin's population in age, ethnicity, gender, and ability.
- **Natural light preferred:** Berlin has a particular overcast quality; embrace it rather than over-saturating.
- **Candid over posed:** Show real moments -- someone laughing at a Biergarten, a cyclist crossing Oberbaumbrucke, a vendor at a Wochenmarkt.

### Image Treatment

- Use a subtle warm color grade for consistency across user-uploaded and editorial photos.
- Hero images: full-bleed, 16:9 aspect ratio, with a dark gradient overlay (`bg-gradient-to-t from-black/60 to-transparent`) for text legibility.
- Card thumbnails: 3:2 aspect ratio, cropped to center, lazy-loaded with blur-up placeholder.
- Avatar images: circular crop, 1:1 aspect ratio, with a `neutral-200` border as fallback if no image is provided.

### Illustration

When illustration is used (empty states, onboarding), follow these guidelines:

- Line-art style with thin strokes using Berlin Blue.
- Minimal fills using the accent palette.
- Keep illustrations simple -- they supplement the message, not replace it.

### Icons

- Use [Lucide Icons](https://lucide.dev/) as the primary icon set (already tree-shakable, MIT-licensed).
- Icon size: 20 px for inline/body, 24 px for navigation/toolbar, 32 px for feature highlights.
- Stroke width: 1.5 px (Lucide default).
- Color: inherit from parent text color unless semantically meaningful (e.g., red for error).

---

## 7. Motion and Animation

- **Duration:** 150 ms for micro-interactions (hover, focus), 300 ms for transitions (modals, page), 500 ms for complex animations (skeleton loading).
- **Easing:** Use `ease-out` (`cubic-bezier(0.0, 0, 0.2, 1)`) for entrances, `ease-in` for exits, `ease-in-out` for ongoing animations.
- **Reduce motion:** Respect `prefers-reduced-motion`. Wrap all animations in a `motion-safe:` Tailwind variant or a media query.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Dark Mode (Future)

Dark mode is on the roadmap but not yet implemented. When it ships:

- Surface color: `neutral-950` (#0F1114).
- Card surface: `neutral-800` (#2D3239).
- Primary text: `neutral-100` (#F3F4F6).
- Primary blue shifts to `primary-300` for sufficient contrast on dark surfaces.
- All semantic colors shift to their `light` variant for text/icons and `dark` variant for backgrounds.

Design tokens will use Tailwind's `dark:` variant. Preparation: avoid hard-coding `text-black` or `bg-white`; use semantic tokens (`text-foreground`, `bg-surface`) instead.
