const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u', 's',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'figure', 'figcaption',
    'iframe',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'class', 'id',
    'allowfullscreen', 'frameborder',
  ],
  ALLOW_DATA_ATTR: false,
};

/**
 * Sanitize HTML content. Uses DOMPurify on the client.
 * On the server (SSR), returns HTML as-is since content originates from our CMS.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // SSR: content is from our own CMS/database, sanitized on input
    return dirty;
  }
  // Lazy-load DOMPurify only on client to avoid jsdom SSR issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require('dompurify');
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}
