import { isGameDay } from "./allowed_times";


// TIG Ban durations in days (admin-only reasons)
export const TIG_BAN_DURATIONS = {
  NOT_READY: 4, // Half a week - admin only
  CANCEL: 8, // One week - admin can explicitly choose
  CANCEL_GAME_DAY: 15, // Two weeks - admin can explicitly choose
  LATE: 8, // One week - admin only
  NO_SHOW: 30, // Four weeks - admin only
  NO_BAN: 0, // Admin can remove without ban
};

export function calculateCancelBanDuration(): number {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeZoneOffset = 4; // UTC+4
  const adjustedHour = (hour + timeZoneOffset) % 24;

  const isAfter5PM = adjustedHour >= 17;
  const isAfter830PM = adjustedHour >= 20 && minutes >= 30;

  // If it's game day and after 5 PM, apply same day cancel ban
  if (isGameDay() && isAfter5PM) {
    return TIG_BAN_DURATIONS.CANCEL_GAME_DAY;
  }

  // Otherwise, apply cancel ban
  return TIG_BAN_DURATIONS.CANCEL;
}