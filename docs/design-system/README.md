# ILoveBerlin Design System

The ILoveBerlin Design System is the single source of truth for the visual language, UI components, and layout patterns used across the ILoveBerlin platform (iloveberlin.biz). Every screen -- whether rendered in the Next.js web application, the Flutter mobile app, or the admin dashboard -- should conform to these guidelines.

## Contents

| Document | Description |
|---|---|
| [Brand Guidelines](./brand-guidelines.md) | Logo, color palette, typography, tone of voice, and imagery standards |
| [Component Library](./component-library.md) | Atomic design component catalogue with props, variants, and usage guidance |
| [Layout System](./layout-system.md) | Responsive breakpoints, grid, spacing scale, and page layout templates |

## Guiding Principles

1. **Consistency** -- Users should feel at home wherever they are in the product. Reuse existing components before creating new ones.
2. **Accessibility** -- Target WCAG 2.1 AA compliance. All interactive elements must be keyboard-navigable, all images must carry alt text, and color contrast ratios must meet the minimum 4.5:1 for body text.
3. **Performance** -- Favor lightweight markup and CSS-first solutions. Avoid shipping unnecessary JavaScript for purely visual concerns.
4. **Responsiveness** -- Every component and layout must work across mobile, tablet, and desktop viewports without horizontal scrolling.
5. **Localization** -- Support both English and German content. Use flexible containers that accommodate varying text lengths.

## Quick Start for Developers

```bash
# The component library lives inside the Next.js app
cd apps/web

# Storybook (when available)
pnpm storybook        # launches at localhost:6006

# Tailwind config (theme tokens live here)
cat tailwind.config.ts
```

All design tokens (colors, spacing, typography) are defined in `tailwind.config.ts` so that the Tailwind utility classes stay in sync with this documentation.

## Contributing to the Design System

1. Open an issue with the label `design-system`.
2. Propose the change in a short RFC (a GitHub issue is fine).
3. Implement the component or token change along with a Storybook story.
4. Submit a PR referencing the issue. At least one design-system maintainer must approve.

## Contact

Questions about the design system? Reach out in the `#design-system` channel on the team Slack workspace or tag `@design-system-maintainers` on GitHub.
