import { isGameDay, isGameDayAsync } from "./allowed_times";
import { getSiteConfig } from '../config/server';

// Legacy static exports (kept for backward compatibility)
export const TIG_BAN_DURATIONS = {
  NOT_READY: 4,
  CANCEL: 8,
  CANCEL_GAME_DAY: 15,
  LATE: 8,
  NO_SHOW: 30,
  NO_BAN: 0,
};

// Async config-driven versions
export async function getBanDurations() {
  const config = await getSiteConfig();
  return { ...config.banDurations, NO_BAN: 0 };
}

export async function calculateCancelBanDurationAsync(): Promise<number> {
  const config = await getSiteConfig();
  const now = new Date();
  const hour = now.getHours();
  const adjustedHour = (hour + config.timezoneOffset) % 24;
  const isGame = await isGameDayAsync();

  if (isGame && adjustedHour >= config.gameDayBanThresholdHour) {
    return config.banDurations.CANCEL_GAME_DAY;
  }
  return config.banDurations.CANCEL;
}

// Legacy synchronous version
export function calculateCancelBanDuration(): number {
  const now = new Date();
  const hour = now.getHours();
  const timeZoneOffset = 4;
  const adjustedHour = (hour + timeZoneOffset) % 24;

  const isAfter5PM = adjustedHour >= 17;

  if (isGameDay() && isAfter5PM) {
    return TIG_BAN_DURATIONS.CANCEL_GAME_DAY;
  }

  return TIG_BAN_DURATIONS.CANCEL;
}
