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
    'class',
  ],
  // Defense-in-depth: explicitly forbid dangerous tags even though they are
  // already excluded by the ALLOWED_TAGS allowlist above.
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'link', 'meta', 'base', 'svg', 'math'],
  // Defense-in-depth: explicitly forbid event-handler and dangerous attributes.
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'id', 'name', 'action', 'formaction', 'xlink:href', 'srcdoc'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):\/\/|\/|#)/i,
  ALLOW_DATA_ATTR: false,
};

// Force rel="noopener noreferrer" on links that open in a new tab.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const target = node.getAttribute('target');
    if (target === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
    // Strip javascript: URIs that might survive the regex (belt-and-suspenders).
    const href = node.getAttribute('href') || '';
    if (/^\s*javascript\s*:/i.test(href)) {
      node.removeAttribute('href');
    }
  }
});

/**
 * Sanitize HTML content. Uses isomorphic-dompurify for both SSR and client.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}

/**
 * Safely serialize data for embedding in a <script type="application/ld+json"> tag.
 * JSON.stringify alone does NOT escape "</script>" sequences, which can allow
 * an attacker to break out of the script block. This function replaces the
 * dangerous sequences after serialization.
 *
 * NOTE: Also re-exported from '@/lib/json-ld' for server-component-safe imports
 * that avoid pulling in DOMPurify on the server.
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
