import sanitizeHtml from 'sanitize-html';

/**
 * Shared HTML sanitizer using allowlist-based sanitize-html.
 * Replaces regex-based sanitization across all services.
 */
export function sanitize(dirty: string): string {
  if (!dirty) return dirty;
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 's',
      'a',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
      div: ['class'],
      span: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
    // Strip all inline styles - they can be used for CSS-based data exfiltration.
    allowedStyles: {},
    // Enforce rel="noopener noreferrer" on links that open in a new tab.
    transformTags: {
      a: (tagName: string, attribs: Record<string, string>) => {
        // Strip javascript: URIs that might bypass scheme checks.
        if (attribs.href && /^\s*javascript\s*:/i.test(attribs.href)) {
          delete attribs.href;
        }
        // Force safe rel on target="_blank" links.
        if (attribs.target === '_blank') {
          attribs.rel = 'noopener noreferrer';
        }
        return { tagName, attribs };
      },
    },
  });
}
