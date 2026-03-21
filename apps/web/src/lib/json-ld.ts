/**
 * Safely serialize data for embedding in a <script type="application/ld+json"> tag.
 * JSON.stringify alone does NOT escape "</script>" sequences, which can allow
 * an attacker to break out of the script block. This function replaces the
 * dangerous sequences after serialization.
 *
 * This module is intentionally separate from sanitize.ts so that server
 * components can import it without pulling in DOMPurify (which requires
 * browser/JSDOM globals).
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
