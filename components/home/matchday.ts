import type { SiteConfig, GameDayEntry, RegistrationWindowEntry } from '../../lib/config/defaults';
import { getNextRegistrationFromConfig } from '../../lib/utils/registration-helpers';

/** Formats a 24h hour as "noon", "midnight" or "10 PM". */
export function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 12) return 'noon';
  if (h === 0) return 'midnight';
  return `${h % 12} ${h < 12 ? 'AM' : 'PM'}`;
}

export interface Matchday {
  game: GameDayEntry;
  /** The sign-up window that belongs to this game (paired by position in the config). */
  window: RegistrationWindowEntry | undefined;
  isToday: boolean;
}

/**
 * The next game from the configured game days, counting today's game until the day ends.
 * Game days and registration windows are paired by index, matching the admin settings
 * ("Game 1 - Monday" owns the first registration window).
 */
export function getNextMatchday(config: SiteConfig, now: Date = new Date()): Matchday | null {
  if (!config.gameDays.length) return null;
  const today = now.getDay();
  let index = 0;
  let distance = 7;
  for (let i = 0; i < config.gameDays.length; i++) {
    const d = (config.gameDays[i].day - today + 7) % 7;
    if (d < distance) {
      distance = d;
      index = i;
    }
  }
  return {
    game: config.gameDays[index],
    window: config.registrationWindows[index],
    isToday: distance === 0,
  };
}

/**
 * The sign-up window that opens next (and the game it is for), using the same
 * calculation as the countdown so the two always agree.
 */
export function getNextSignup(config: SiteConfig): { window: RegistrationWindowEntry; game: GameDayEntry | undefined } | null {
  if (!config.registrationWindows.length) return null;
  const opens = getNextRegistrationFromConfig(config);
  const index = config.registrationWindows.findIndex((w) => w.day === opens.getDay());
  if (index < 0) return null;
  return { window: config.registrationWindows[index], game: config.gameDays[index] };
}
