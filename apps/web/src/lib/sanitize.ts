import DOMPurify from 'isomorphic-dompurify';

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
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'class', 'id',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):\/\/|\/|#)/i,
  ALLOW_DATA_ATTR: false,
};

/**
 * Sanitize HTML content. Uses isomorphic-dompurify for both SSR and client.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}
