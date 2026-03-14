/**
 * Shared date/time formatting utilities.
 *
 * All display-facing dates should go through these helpers so the site
 * renders a consistent style everywhere.
 */

/** "Mar 14, 2026" */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(
      // If the string is date-only (YYYY-MM-DD) append midnight to avoid
      // timezone shifts that could move the day backwards.
      dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr,
    );
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr ?? '';
  }
}

/** "Monday, March 14, 2026" */
export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(
      dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr,
    );
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr ?? '';
  }
}

/** "Mar 14" (short, no year — good for charts / compact UI) */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(
      dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr,
    );
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr ?? '';
  }
}

/**
 * Convert a 24-hour "HH:MM" or "HH:MM:SS" string to 12-hour display.
 * e.g. "14:30" → "2:30 PM", "09:05" → "9:05 AM"
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${m} ${suffix}`;
}

/** "2026-03-14" — ISO date for APIs / date inputs */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
