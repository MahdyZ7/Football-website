export interface BanDurations {
  NOT_READY: number;
  CANCEL: number;
  CANCEL_GAME_DAY: number;
  LATE: number;
  NO_SHOW: number;
}

export interface Announcement {
  enabled: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  dismissible: boolean;
}

export interface GameRules {
  timeAndScore: string;
  teams: string;
  referee: string;
  lateTig: string;
  conduct: string;
}

export interface GameDayEntry {
  day: number;
  dayName: string;
  time: string; // Display text, e.g. "9 PM"
}

export interface RegistrationWindowEntry {
  day: number;
  dayName: string;
  openHour: number;  // 24h format
  closeHour: number; // 24h format, on the next day (game day)
}

export interface SiteConfig {
  // Game Days (independent per-day config)
  gameDays: GameDayEntry[];
  location: string;
  timezoneOffset: number;

  // Registration Windows (independent per-day config)
  registrationWindows: RegistrationWindowEntry[];
  registrationForceClosed: boolean;

  // Player Limits
  guaranteedSpots: number;
  maxPlayers: number;
  gracePeriodMinutes: number;

  // Team Configuration
  defaultTeamMode: 2 | 3;
  playersPerTeam2Mode: number;
  playersPerTeam3Mode: number;

  // Ban Durations (in days)
  banDurations: BanDurations;
  gameDayBanThresholdHour: number;
  lateThresholdMinutes: number;

  // Announcement Popup
  announcement: Announcement;

  // Game Rules (free-form text per section, one bullet point per line)
  gameRules: GameRules;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export { DAY_NAMES };

/** Helper: extract game day numbers */
export function getGameDayNumbers(config: SiteConfig): number[] {
  return config.gameDays.map((g) => g.day);
}

/** Helper: extract registration open day numbers */
export function getRegistrationDayNumbers(config: SiteConfig): number[] {
  return config.registrationWindows.map((r) => r.day);
}

/**
 * Migrate old config formats to the current shape.
 * Handles: flat fields (v1), schedule array (v2), and current gameDays/registrationWindows (v3).
 */
export function migrateConfig(raw: Record<string, unknown>): SiteConfig {
  // Current format - already has gameDays array of objects with .day
  if (
    Array.isArray(raw.gameDays) &&
    raw.gameDays.length > 0 &&
    typeof raw.gameDays[0] === 'object' &&
    raw.gameDays[0] !== null &&
    'day' in raw.gameDays[0]
  ) {
    return { ...DEFAULT_CONFIG, ...raw } as SiteConfig;
  }

  // v2 format - schedule array
  if (Array.isArray(raw.schedule)) {
    const schedule = raw.schedule as Array<{
      gameDay: number; gameDayName: string; gameTime: string;
      registrationOpenDay: number; registrationOpenDayName: string;
      registrationOpenHour: number; registrationCloseHour: number;
    }>;
    const gameDays: GameDayEntry[] = schedule.map((s) => ({
      day: s.gameDay,
      dayName: s.gameDayName,
      time: s.gameTime,
    }));
    const registrationWindows: RegistrationWindowEntry[] = schedule.map((s) => ({
      day: s.registrationOpenDay,
      dayName: s.registrationOpenDayName,
      openHour: s.registrationOpenHour,
      closeHour: s.registrationCloseHour,
    }));
    const { schedule: _s, ...rest } = raw;
    return { ...DEFAULT_CONFIG, ...rest, gameDays, registrationWindows } as SiteConfig;
  }

  // v1 format - flat fields
  const flatGameDays = (raw.gameDays as number[]) || DEFAULT_CONFIG.gameDays.map((g) => g.day);
  const flatGameDayNames = (raw.gameDayNames as string[]) || flatGameDays.map((d) => DAY_NAMES[d]);
  const flatGameTime = (raw.gameTime as string) || DEFAULT_CONFIG.gameDays[0].time;
  const flatRegDays = (raw.registrationOpenDays as number[]) || DEFAULT_CONFIG.registrationWindows.map((r) => r.day);
  const flatRegDayNames = (raw.registrationOpenDayNames as string[]) || flatRegDays.map((d) => DAY_NAMES[d]);
  const flatOpenHour = (raw.registrationOpenHour as number) ?? DEFAULT_CONFIG.registrationWindows[0].openHour;
  const flatCloseHour = (raw.registrationCloseHour as number) ?? DEFAULT_CONFIG.registrationWindows[0].closeHour;

  const gameDays: GameDayEntry[] = flatGameDays.map((day, i) => ({
    day,
    dayName: flatGameDayNames[i] || DAY_NAMES[day],
    time: flatGameTime,
  }));
  const registrationWindows: RegistrationWindowEntry[] = flatRegDays.map((day, i) => ({
    day,
    dayName: flatRegDayNames[i] || DAY_NAMES[day],
    openHour: flatOpenHour,
    closeHour: flatCloseHour,
  }));

  // Strip old flat fields
  const {
    gameDays: _gd, gameDayNames: _gdn, gameTime: _gt,
    registrationOpenDays: _rod, registrationOpenDayNames: _rodn,
    registrationOpenHour: _roh, registrationCloseHour: _rch,
    ...rest
  } = raw;

  return { ...DEFAULT_CONFIG, ...rest, gameDays, registrationWindows } as SiteConfig;
}

export const DEFAULT_CONFIG: SiteConfig = {
  gameDays: [
    { day: 1, dayName: "Monday", time: "9 PM" },
    { day: 4, dayName: "Thursday", time: "9 PM" },
  ],
  location: "Outdoor Pitch 2 - Active Al Maria",
  timezoneOffset: 4,

  registrationWindows: [
    { day: 0, dayName: "Sunday", openHour: 12, closeHour: 22 },
    { day: 3, dayName: "Wednesday", openHour: 12, closeHour: 22 },
  ],
  registrationForceClosed: false,

  // Player Limits
  guaranteedSpots: 21,
  maxPlayers: 40,
  gracePeriodMinutes: 15,

  // Team Configuration
  defaultTeamMode: 3,
  playersPerTeam2Mode: 10,
  playersPerTeam3Mode: 7,

  // Ban Durations (in days)
  banDurations: {
    NOT_READY: 4,
    CANCEL: 8,
    CANCEL_GAME_DAY: 15,
    LATE: 8,
    NO_SHOW: 30,
  },
  gameDayBanThresholdHour: 17,
  lateThresholdMinutes: 15,

  // Announcement Popup
  announcement: {
    enabled: false,
    title: "",
    message: "",
    type: "info",
    dismissible: true,
  },

  // Game Rules
  gameRules: {
    timeAndScore: `Games are **10 minutes long** or until a team scores **2 goals**.
**Winner stays on**, loser rotates out.
In case of a draw, the team that played consecutive games is out.
If the first game ends in a draw, a **coin toss** will decide which team is out.
Game ends with referee's call.`,
    teams: `Three teams of **7 players each**.
First two teams wear colored bibs, third team waits off the field.
The waiting team rotates in after each game with the losing team.
Team selection is done **5 minutes** before the pitch booking starts.
If a player is late for team selection, they are presumed to be unregistered.
Unregistered and waiting list players can join the game as **substitutes only**.
In case of missing players, due to late arrival or injury, players from the waiting team or waiting list can substitute in.
The referee has the final say on substitutions skill level and fairness.
Rebalancing teams is at the discretion of all teams involved.`,
    referee: `A referee is chosen for each game from the **waiting team**.
Their decision is **final** and they can arbitrate any disagreement.
This includes decisions on fouls, goals, and rule interpretations.
The referee is responsible for **game time**.
They also have a final say in substituting missing, late or injured players with another player of comparable skill level from the waiting team.
The referees are fallible human beings, **respect their decisions** despite any shortcomings.`,
    lateTig: `Late players forfeit their position and can join as **substitutes only**.
Joining as a substitute can only happen if the substituted player forfeits their position voluntarily.
Players are responsible for removing themselves from the roster if they do not intend to show up.`,
    conduct: `This is a **friendly game**.
No aggressive behavior or foul language.
Any use of physical violence outside the game will result in **immediate banning** from future games.`,
  },
};
