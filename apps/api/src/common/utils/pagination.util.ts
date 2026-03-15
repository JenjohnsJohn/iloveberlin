/**
 * Parse and clamp pagination parameters to safe ranges.
 */
export function parsePagination(
  rawPage?: string,
  rawLimit?: string,
  defaults: { page?: number; limit?: number } = {},
): { page: number; limit: number } {
  const page = Math.max(1, parseInt(rawPage || '', 10) || (defaults.page ?? 1));
  const limit = Math.min(100, Math.max(1, parseInt(rawLimit || '', 10) || (defaults.limit ?? 20)));
  return { page, limit };
}
