import { SiteConfig } from '../config/defaults';

/**
 * Client-safe registration helper functions.
 * These do NOT import any server-only modules (db, pg, etc.)
 * and can safely be used in client components.
 */

/**
 * Compute the next registration opening date from config.
 * Intended for client-side countdown display.
 */
export function getNextRegistrationFromConfig(config: SiteConfig): Date {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + config.timezoneOffset;

  // Build sorted list of {openDay, openHour} from registration windows
  const entries = config.registrationWindows
    .map((w) => ({ openDay: w.day, openHour: w.openHour }))
    .sort((a, b) => a.openDay - b.openDay);

  // Find the next open day/hour
  for (const entry of entries) {
    if (day < entry.openDay || (day === entry.openDay && hour < entry.openHour)) {
      const nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + ((entry.openDay - day + 7) % 7));
      nextDate.setHours(entry.openHour, 0, 0, 0);
      return nextDate;
    }
  }

  // Wrap to next week's first open entry
  const first = entries[0];
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + ((first.openDay - day + 7) % 7 || 7));
  nextDate.setHours(first.openHour, 0, 0, 0);
  return nextDate;
}
