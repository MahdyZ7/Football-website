import { getSiteConfig } from '../config/server';
import { getGameDayNumbers } from '../config/defaults';

// Async config-driven version for server-side use
export async function isRegistrationAllowed(): Promise<boolean> {
  const config = await getSiteConfig();

  if (config.registrationForceClosed) return false;

  const currentTime = new Date(Date.now());
  const currentDay = currentTime.getDay();
  const currentHour = currentTime.getHours() + config.timezoneOffset;

  // Check registration windows
  for (const win of config.registrationWindows) {
    if (currentDay === win.day && currentHour >= win.openHour) return true;
  }
  // Check game days (registration stays open until closeHour on game day)
  for (let i = 0; i < config.gameDays.length; i++) {
    const gd = config.gameDays[i];
    const closeHour = config.registrationWindows[i]?.closeHour ?? 22;
    if (currentDay === gd.day && currentHour <= closeHour) return true;
  }

  return false;
}

export async function isGameDayAsync(): Promise<boolean> {
  const config = await getSiteConfig();
  const now = new Date();
  const dayOfWeek = now.getDay();
  return getGameDayNumbers(config).includes(dayOfWeek);
}

// Legacy synchronous versions (kept for backward compatibility during transition)
export default function allowed_times() {
  const currentTime = new Date(Date.now());
  const currentDay = currentTime.getDay();
  const currentHour = currentTime.getHours() + 4;

  const isAllowed =
    (currentDay === 0 && currentHour >= 12) ||
    (currentDay === 1 && currentHour <= 22) ||
    (currentDay === 3 && currentHour >= 12) ||
    (currentDay === 4 && currentHour <= 22);
  return isAllowed;
}

export function getNextRegistration() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const nextDate = new Date(now);

  if (day < 0 || (day === 0 && hour < 12)) {
    nextDate.setDate(nextDate.getDate() + ((0 - day + 7) % 7));
  } else if (day < 3 || (day === 3 && hour < 12)) {
    nextDate.setDate(nextDate.getDate() + ((3 - day + 7) % 7));
  } else {
    nextDate.setDate(nextDate.getDate() + ((7 - day) % 7));
  }

  nextDate.setHours(12, 0, 0, 0);
  return nextDate;
}

export function isGameDay(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 1 || dayOfWeek === 4;
}
