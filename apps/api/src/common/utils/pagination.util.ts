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

/**
 * Calculate skip/take from already-parsed page and limit values.
 * Clamps both to safe ranges (page >= 1, 1 <= limit <= 100).
 */
export function getPaginationParams(page: number = 1, limit: number = 20) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit,
  };
}
