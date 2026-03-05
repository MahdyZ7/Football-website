'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Save, RotateCcw, Plus, AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import {
  useAdminConfig,
  useUpdateConfig,
  useConfigSnapshots,
  useCreateSnapshot,
  useRestoreSnapshot,
  ApiError,
} from '../../hooks/useQueries';
import { SiteConfig, GameDayEntry, RegistrationWindowEntry, DAY_NAMES } from '../../lib/config/defaults';

// ─── Announcement Templates ─────────────────────────────────────
const ANNOUNCEMENT_TEMPLATES = [
  {
    key: 'update_log',
    label: 'Update Log',
    type: 'info' as const,
    title: 'Update Log',
    message: 'Here are the latest changes:\n\n- \n- \n- ',
  },
  {
    key: 'info',
    label: 'Info',
    type: 'info' as const,
    title: 'Information',
    message: '',
  },
  {
    key: 'warning',
    label: 'Warning',
    type: 'warning' as const,
    title: 'Important Notice',
    message: '',
  },
];

// ─── Deep equality check for change detection ────────────────────
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) =>
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
  );
}

// ─── Compute human-readable diff for confirmation dialog ─────────
function describeDiff(
  original: Record<string, unknown>,
  changed: Record<string, unknown>,
  prefix = ''
): string[] {
  const diffs: string[] = [];
  for (const key of Object.keys(changed)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const oldVal = original[key];
    const newVal = changed[key];
    if (deepEqual(oldVal, newVal)) continue;
    if (
      newVal &&
      typeof newVal === 'object' &&
      !Array.isArray(newVal) &&
      oldVal &&
      typeof oldVal === 'object' &&
      !Array.isArray(oldVal)
    ) {
      diffs.push(
        ...describeDiff(
          oldVal as Record<string, unknown>,
          newVal as Record<string, unknown>,
          path
        )
      );
    } else {
      const formatVal = (v: unknown) => {
        if (Array.isArray(v)) {
          // Summarize day entries nicely
          if (v.length > 0 && typeof v[0] === 'object' && v[0] !== null && 'dayName' in v[0]) {
            return v.map((e: Record<string, unknown>) => e.dayName || DAY_NAMES[e.day as number]).join(', ');
          }
          return JSON.stringify(v);
        }
        if (typeof v === 'string' && v.length > 60) return `"${v.slice(0, 57)}..."`;
        if (typeof v === 'string') return `"${v}"`;
        return String(v);
      };
      diffs.push(`${path}: ${formatVal(oldVal)} → ${formatVal(newVal)}`);
    }
  }
  return diffs;
}

// ─── Confirmation Dialog ─────────────────────────────────────────
function ConfirmDialog({
  title,
  changes,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  changes: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="rounded-xl shadow-2xl max-w-lg w-full animate-scaleIn"
          style={{ backgroundColor: 'var(--bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <button onClick={onCancel} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <X size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
          <div className="px-6 py-4 max-h-80 overflow-y-auto">
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              The following changes will be saved:
            </p>
            <ul className="space-y-1.5">
              {changes.map((change, i) => (
                <li key={i} className="text-sm font-mono p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {change}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={<Save size={16} />} loading={isPending} onClick={onConfirm}>
              Confirm Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Collapsible Section ─────────────────────────────────────────
function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg shadow-md overflow-hidden mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-lg border-b transition-colors hover:opacity-80"
        style={{ borderColor: open ? 'var(--border-color)' : 'transparent', color: 'var(--text-primary)' }}
      >
        {title}
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

// ─── Hour Select with labelled start/end of day ──────────────────
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  let label = `${h}:00`;
  if (h === 0) label = '0:00 (Start of day)';
  else if (h === 23) label = '23:59 (End of day)';
  else if (h === 12) label = '12:00 (Noon)';
  return { value: h, label };
});

function HourSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (hour: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="px-3 py-2 rounded border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ft-primary"
      style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
    >
      {HOUR_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// ─── Format hour helper ──────────────────────────────────────────
const formatHour = (h: number) => {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h === 23) return '11:59 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

// ─── Day Select dropdown ─────────────────────────────────────────
function DaySelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (day: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="px-3 py-2 rounded border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ft-primary"
      style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
    >
      {DAY_NAMES.map((name, i) => (
        <option key={i} value={i}>{name}</option>
      ))}
    </select>
  );
}

// ─── Week Timeline visualization ─────────────────────────────────
function WeekTimeline({
  regDay,
  gameDay,
}: {
  regDay: number;
  gameDay: number;
}) {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isInRange = (day: number) => {
    if (regDay === gameDay) return day === regDay;
    if (regDay < gameDay) return day >= regDay && day <= gameDay;
    return day >= regDay || day <= gameDay;
  };

  return (
    <div className="flex w-full max-w-xs">
      {dayLabels.map((label, i) => {
        const inRange = isInRange(i);
        const isReg = i === regDay;
        const isGame = i === gameDay;

        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <span
              className="text-[11px] font-bold mb-1.5"
              style={{ color: isReg || isGame ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {label}
            </span>
            <div className="relative w-full h-5 flex items-center">
              <div
                className="absolute h-1 left-0 right-0 rounded-full"
                style={{ backgroundColor: inRange ? '#00babc' : 'var(--border-color)', opacity: inRange ? 1 : 0.3 }}
              />
              {isReg && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-10 w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: '#22c55e', border: '2px solid var(--bg-secondary)' }}
                />
              )}
              {isGame && !isReg && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-10 w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: '#00babc', border: '2px solid var(--bg-secondary)' }}
                />
              )}
              {isGame && isReg && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-10 w-4 h-4 rounded-full shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 50%, #00babc 50%)',
                    border: '2px solid var(--bg-secondary)',
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Game Event Card ─────────────────────────────────────────────
function GameEventCard({
  index,
  gameDay,
  regWindow,
  onUpdateGameDay,
  onUpdateRegWindow,
  onRemove,
  canRemove,
}: {
  index: number;
  gameDay: GameDayEntry;
  regWindow: RegistrationWindowEntry;
  onUpdateGameDay: (updates: Partial<GameDayEntry>) => void;
  onUpdateRegWindow: (updates: Partial<RegistrationWindowEntry>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Game {index + 1} &mdash; {gameDay.dayName}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Remove game"
          >
            <X size={16} className="text-red-500" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Timeline */}
        <WeekTimeline regDay={regWindow.day} gameDay={gameDay.day} />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span>Opens {regWindow.dayName} {formatHour(regWindow.openHour)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span>Closes {gameDay.dayName} {formatHour(regWindow.closeHour)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00babc' }} />
            <span>Game {gameDay.dayName} {gameDay.time}</span>
          </div>
        </div>

        {/* Registration Controls */}
        <div
          className="rounded-lg border p-3 space-y-3"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Registration
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Opens:</label>
            <DaySelect
              value={regWindow.day}
              onChange={(day) => onUpdateRegWindow({ day, dayName: DAY_NAMES[day] })}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>at</span>
            <HourSelect
              value={regWindow.openHour}
              onChange={(h) => onUpdateRegWindow({ openHour: h })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Closes:</label>
            <span
              className="text-sm px-3 py-2 rounded"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              {gameDay.dayName}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>at</span>
            <HourSelect
              value={regWindow.closeHour}
              onChange={(h) => onUpdateRegWindow({ closeHour: h })}
            />
          </div>
        </div>

        {/* Game Controls */}
        <div
          className="rounded-lg border p-3 space-y-3"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Game
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Day:</label>
            <DaySelect
              value={gameDay.day}
              onChange={(day) => onUpdateGameDay({ day, dayName: DAY_NAMES[day] })}
            />
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Time:</label>
            <input
              type="text"
              value={gameDay.time}
              onChange={(e) => onUpdateGameDay({ time: e.target.value })}
              placeholder='e.g. "9 PM"'
              className="px-3 py-2 rounded border text-sm w-28 focus:outline-none focus:ring-2 focus:ring-ft-primary"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminSettings ──────────────────────────────────────────
export default function AdminSettings() {
  const { data, isLoading, error } = useAdminConfig();
  const updateConfig = useUpdateConfig();
  const { data: snapshotsData, isLoading: snapshotsLoading } = useConfigSnapshots();
  const createSnapshot = useCreateSnapshot();
  const restoreSnapshot = useRestoreSnapshot();

  const [localConfig, setLocalConfig] = useState<SiteConfig | null>(null);
  const [savedConfig, setSavedConfig] = useState<SiteConfig | null>(null);
  const [version, setVersion] = useState(0);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const [restoreConfirmId, setRestoreConfirmId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    changes: string[];
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (data?.config) {
      setLocalConfig(data.config);
      setSavedConfig(data.config);
      setVersion(data.version);
    }
  }, [data]);

  // ─── Change detection ──────────────────────────────────────────
  const sectionHasChanges = useCallback(
    (keys: string[]): boolean => {
      if (!localConfig || !savedConfig) return false;
      for (const key of keys) {
        const local = (localConfig as unknown as Record<string, unknown>)[key];
        const saved = (savedConfig as unknown as Record<string, unknown>)[key];
        if (!deepEqual(local, saved)) return true;
      }
      return false;
    },
    [localConfig, savedConfig]
  );

  const getSectionDiff = useCallback(
    (changes: Partial<SiteConfig>): string[] => {
      if (!savedConfig) return [];
      return describeDiff(
        savedConfig as unknown as Record<string, unknown>,
        changes as unknown as Record<string, unknown>
      );
    },
    [savedConfig]
  );

  const scheduleChanged = useMemo(
    () => sectionHasChanges(['gameDays', 'registrationWindows', 'registrationForceClosed', 'location', 'timezoneOffset']),
    [sectionHasChanges]
  );
  const limitsChanged = useMemo(
    () => sectionHasChanges(['guaranteedSpots', 'maxPlayers', 'gracePeriodMinutes']),
    [sectionHasChanges]
  );
  const teamChanged = useMemo(
    () => sectionHasChanges(['defaultTeamMode', 'playersPerTeam2Mode', 'playersPerTeam3Mode']),
    [sectionHasChanges]
  );
  const banChanged = useMemo(
    () => sectionHasChanges(['banDurations', 'gameDayBanThresholdHour', 'lateThresholdMinutes']),
    [sectionHasChanges]
  );
  const rulesChanged = useMemo(
    () => sectionHasChanges(['gameRules']),
    [sectionHasChanges]
  );
  const announcementChanged = useMemo(
    () => sectionHasChanges(['announcement']),
    [sectionHasChanges]
  );

  if (isLoading || !localConfig) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
        Loading settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load settings. Make sure the site_config table exists (run npm run db:migrate:site-config).
      </div>
    );
  }

  const update = (path: string, value: unknown) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      const keys = path.split('.');
      const result = { ...prev };
      let current: Record<string, unknown> = result;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return result as SiteConfig;
    });
  };

  const saveSection = async (changes: Partial<SiteConfig>) => {
    try {
      const result = await updateConfig.mutateAsync({
        changes,
        expectedVersion: version,
      });
      setVersion(result.version);
      setSavedConfig((prev) => (prev ? { ...prev, ...changes } : prev));
      toast.success('Settings saved successfully');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Another admin modified settings. Refreshing...');
        window.location.reload();
      } else {
        toast.error('Failed to save settings');
      }
    }
  };

  const confirmAndSave = (sectionTitle: string, changes: Partial<SiteConfig>) => {
    const diffs = getSectionDiff(changes);
    if (diffs.length === 0) return;
    setConfirmDialog({
      title: `Save ${sectionTitle}`,
      changes: diffs,
      onConfirm: () => {
        setConfirmDialog(null);
        saveSection(changes);
      },
    });
  };

  // ─── Game event helpers (paired gameDays + registrationWindows) ─
  const addGameEvent = () => {
    const usedGameDays = new Set(localConfig.gameDays.map((g) => g.day));
    let nextGameDay = -1;
    for (let i = 1; i <= 7; i++) {
      const day = i % 7;
      if (!usedGameDays.has(day)) { nextGameDay = day; break; }
    }
    if (nextGameDay === -1) {
      toast.error('All 7 days already have games scheduled');
      return;
    }
    const regDay = (nextGameDay - 1 + 7) % 7;
    const newPairs = [
      ...localConfig.gameDays.map((g, i) => ({ game: g, reg: localConfig.registrationWindows[i] })),
      {
        game: { day: nextGameDay, dayName: DAY_NAMES[nextGameDay], time: '9 PM' } as GameDayEntry,
        reg: { day: regDay, dayName: DAY_NAMES[regDay], openHour: 12, closeHour: 22 } as RegistrationWindowEntry,
      },
    ].sort((a, b) => a.game.day - b.game.day);
    update('gameDays', newPairs.map((p) => p.game));
    update('registrationWindows', newPairs.map((p) => p.reg));
  };

  const removeGameEvent = (index: number) => {
    if (localConfig.gameDays.length <= 1) {
      toast.error('Must have at least one game');
      return;
    }
    update('gameDays', localConfig.gameDays.filter((_: GameDayEntry, i: number) => i !== index));
    update('registrationWindows', localConfig.registrationWindows.filter((_: RegistrationWindowEntry, i: number) => i !== index));
  };

  const updateGameDayByIndex = (index: number, updates: Partial<GameDayEntry>) => {
    update(
      'gameDays',
      localConfig.gameDays.map((g: GameDayEntry, i: number) =>
        i === index ? { ...g, ...updates } : g
      )
    );
  };

  const updateRegWindowByIndex = (index: number, updates: Partial<RegistrationWindowEntry>) => {
    update(
      'registrationWindows',
      localConfig.registrationWindows.map((r: RegistrationWindowEntry, i: number) =>
        i === index ? { ...r, ...updates } : r
      )
    );
  };

  // ─── Snapshot handlers ─────────────────────────────────────────
  const handleCreateSnapshot = async () => {
    if (!snapshotName.trim()) {
      toast.error('Please enter a snapshot name');
      return;
    }
    try {
      await createSnapshot.mutateAsync({
        name: snapshotName.trim(),
        description: snapshotDescription.trim() || undefined,
      });
      setSnapshotName('');
      setSnapshotDescription('');
      toast.success('Snapshot created');
    } catch {
      toast.error('Failed to create snapshot');
    }
  };

  const handleRestore = async (snapshotId: number) => {
    try {
      const result = await restoreSnapshot.mutateAsync(snapshotId);
      if (result.config) {
        setLocalConfig(result.config);
        setSavedConfig(result.config);
      }
      setVersion(result.version);
      setRestoreConfirmId(null);
      toast.success('Config restored successfully');
    } catch {
      toast.error('Failed to restore config');
    }
  };

  return (
    <div className="space-y-2">
      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          changes={confirmDialog.changes}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          isPending={updateConfig.isPending}
        />
      )}

      {/* Version info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Config version: <strong>v{version}</strong>
          {data?.updatedAt && (
            <> &middot; Last updated: {new Date(data.updatedAt).toLocaleString()}</>
          )}
          {data?.updatedByName && (
            <> by <strong>{data.updatedByName}</strong></>
          )}
        </p>
      </div>

      {/* ────── Game Schedule ────── */}
      <Section title="Game Schedule" defaultOpen>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Each game event defines when registration opens, when it closes, and when the game starts.
            Registration opens on the specified day and closes on game day.
          </p>

          {/* Game Event Cards */}
          <div className="space-y-4">
            {localConfig.gameDays.map((gameDay, i) => (
              <GameEventCard
                key={`${gameDay.day}-${i}`}
                index={i}
                gameDay={gameDay}
                regWindow={localConfig.registrationWindows[i] || {
                  day: (gameDay.day - 1 + 7) % 7,
                  dayName: DAY_NAMES[(gameDay.day - 1 + 7) % 7],
                  openHour: 12,
                  closeHour: 22,
                }}
                onUpdateGameDay={(updates) => updateGameDayByIndex(i, updates)}
                onUpdateRegWindow={(updates) => updateRegWindowByIndex(i, updates)}
                onRemove={() => removeGameEvent(i)}
                canRemove={localConfig.gameDays.length > 1}
              />
            ))}
          </div>

          {/* Add Game Button */}
          <button
            type="button"
            onClick={addGameEvent}
            className="w-full py-3 rounded-lg border-2 border-dashed text-sm font-medium transition-all duration-200 hover:border-ft-primary hover:text-ft-primary"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <Plus size={16} className="inline mr-1.5 -mt-0.5" />
            Add Game
          </button>

          {/* Location & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={localConfig.location}
              onChange={(e) => update('location', e.target.value)}
              fullWidth
            />
            <Input
              label="Timezone Offset (hours from UTC)"
              type="number"
              value={localConfig.timezoneOffset}
              onChange={(e) => update('timezoneOffset', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Force Close Toggle */}
          <div
            className="p-4 rounded-lg border-2"
            style={{
              borderColor: localConfig.registrationForceClosed ? '#ef4444' : 'var(--border-color)',
              backgroundColor: localConfig.registrationForceClosed ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Force Close Registration
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Immediately prevents new registrations regardless of schedule
                </p>
              </div>
              <button
                type="button"
                onClick={() => update('registrationForceClosed', !localConfig.registrationForceClosed)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                  localConfig.registrationForceClosed ? 'bg-red-500' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                    localConfig.registrationForceClosed ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>
            {localConfig.registrationForceClosed && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertTriangle size={16} />
                Registration is currently force-closed. Players cannot register.
              </div>
            )}
          </div>

          {/* Save Schedule */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!scheduleChanged}
              onClick={() =>
                confirmAndSave('Game Schedule', {
                  gameDays: localConfig.gameDays,
                  registrationWindows: localConfig.registrationWindows,
                  registrationForceClosed: localConfig.registrationForceClosed,
                  location: localConfig.location,
                  timezoneOffset: localConfig.timezoneOffset,
                })
              }
            >
              Save Schedule
            </Button>
          </div>
        </div>
      </Section>

      {/* ────── Player Limits ────── */}
      <Section title="Player Limits">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Guaranteed Spots"
              type="number"
              min={1}
              value={localConfig.guaranteedSpots}
              onChange={(e) => update('guaranteedSpots', parseInt(e.target.value) || 1)}
              helperText="Main list size"
            />
            <Input
              label="Max Players"
              type="number"
              min={1}
              value={localConfig.maxPlayers}
              onChange={(e) => update('maxPlayers', parseInt(e.target.value) || 1)}
              helperText="Main + waitlist total"
            />
            <Input
              label="Grace Period (minutes)"
              type="number"
              min={1}
              value={localConfig.gracePeriodMinutes}
              onChange={(e) => update('gracePeriodMinutes', parseInt(e.target.value) || 1)}
              helperText="Free removal window"
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!limitsChanged}
              onClick={() =>
                confirmAndSave('Player Limits', {
                  guaranteedSpots: localConfig.guaranteedSpots,
                  maxPlayers: localConfig.maxPlayers,
                  gracePeriodMinutes: localConfig.gracePeriodMinutes,
                })
              }
            >
              Save Player Limits
            </Button>
          </div>
        </div>
      </Section>

      {/* ────── Team Configuration ────── */}
      <Section title="Team Configuration">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              Default Team Mode
            </label>
            <div className="flex gap-3">
              {[2, 3].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update('defaultTeamMode', mode as 2 | 3)}
                  className={`px-6 py-3 rounded font-medium transition-all duration-200 ${
                    localConfig.defaultTeamMode === mode
                      ? 'bg-ft-primary text-white'
                      : 'border'
                  }`}
                  style={
                    localConfig.defaultTeamMode !== mode
                      ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--input-bg)' }
                      : undefined
                  }
                >
                  {mode} Teams
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Players per Team (2-team mode)"
              type="number"
              min={1}
              value={localConfig.playersPerTeam2Mode}
              onChange={(e) => update('playersPerTeam2Mode', parseInt(e.target.value) || 1)}
            />
            <Input
              label="Players per Team (3-team mode)"
              type="number"
              min={1}
              value={localConfig.playersPerTeam3Mode}
              onChange={(e) => update('playersPerTeam3Mode', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!teamChanged}
              onClick={() =>
                confirmAndSave('Team Configuration', {
                  defaultTeamMode: localConfig.defaultTeamMode,
                  playersPerTeam2Mode: localConfig.playersPerTeam2Mode,
                  playersPerTeam3Mode: localConfig.playersPerTeam3Mode,
                })
              }
            >
              Save Team Config
            </Button>
          </div>
        </div>
      </Section>

      {/* ────── Ban / TIG Rules ────── */}
      <Section title="Ban / TIG Rules">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Not Ready (days)" type="number" min={0} value={localConfig.banDurations.NOT_READY} onChange={(e) => update('banDurations.NOT_READY', parseInt(e.target.value) || 0)} helperText="Not ready when booking starts" />
            <Input label="Cancel (days)" type="number" min={0} value={localConfig.banDurations.CANCEL} onChange={(e) => update('banDurations.CANCEL', parseInt(e.target.value) || 0)} helperText="Cancel reservation" />
            <Input label="Cancel on Game Day (days)" type="number" min={0} value={localConfig.banDurations.CANCEL_GAME_DAY} onChange={(e) => update('banDurations.CANCEL_GAME_DAY', parseInt(e.target.value) || 0)} helperText="Cancel after threshold hour" />
            <Input label="Late (days)" type="number" min={0} value={localConfig.banDurations.LATE} onChange={(e) => update('banDurations.LATE', parseInt(e.target.value) || 0)} helperText="More than threshold mins late" />
            <Input label="No Show (days)" type="number" min={0} value={localConfig.banDurations.NO_SHOW} onChange={(e) => update('banDurations.NO_SHOW', parseInt(e.target.value) || 0)} helperText="No show without notice" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Game Day Ban Threshold Hour (24h)" type="number" min={0} max={23} value={localConfig.gameDayBanThresholdHour} onChange={(e) => update('gameDayBanThresholdHour', parseInt(e.target.value) || 0)} helperText="After this hour on game day, cancel = game day ban" />
            <Input label="Late Threshold (minutes)" type="number" min={1} value={localConfig.lateThresholdMinutes} onChange={(e) => update('lateThresholdMinutes', parseInt(e.target.value) || 1)} helperText="Minutes before 'late' ban applies" />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!banChanged}
              onClick={() =>
                confirmAndSave('Ban Rules', {
                  banDurations: localConfig.banDurations,
                  gameDayBanThresholdHour: localConfig.gameDayBanThresholdHour,
                  lateThresholdMinutes: localConfig.lateThresholdMinutes,
                })
              }
            >
              Save Ban Rules
            </Button>
          </div>
        </div>
      </Section>

      {/* ────── Game Rules ────── */}
      <Section title="Game Rules">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Each section is displayed on the /rules page. Use one bullet point per line. Surround text with **double asterisks** for bold.
          </p>
          {(
            [
              ['timeAndScore', 'Time and Score'],
              ['teams', 'Teams'],
              ['referee', 'Referee'],
              ['lateTig', 'Late TIG'],
              ['conduct', 'Conduct'],
            ] as const
          ).map(([key, label]) => (
            <Textarea
              key={key}
              label={label}
              value={localConfig.gameRules[key]}
              onChange={(e) => update(`gameRules.${key}`, e.target.value)}
              rows={6}
              fullWidth
            />
          ))}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!rulesChanged}
              onClick={() => confirmAndSave('Game Rules', { gameRules: localConfig.gameRules })}
            >
              Save Game Rules
            </Button>
          </div>
        </div>
      </Section>

      {/* ────── Announcement ────── */}
      <Section title="Announcement Popup">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Enable Announcement
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Shows a popup to all users on the home page
              </p>
            </div>
            <button
              type="button"
              onClick={() => update('announcement.enabled', !localConfig.announcement.enabled)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                localConfig.announcement.enabled ? 'bg-ft-primary' : 'bg-gray-400'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                  localConfig.announcement.enabled ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>

          {localConfig.announcement.enabled && (
            <>
              {/* Templates */}
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Start from a template
                </label>
                <div className="flex flex-wrap gap-2">
                  {ANNOUNCEMENT_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.key}
                      type="button"
                      onClick={() => {
                        update('announcement.type', tpl.type);
                        update('announcement.title', tpl.title);
                        update('announcement.message', tpl.message);
                      }}
                      className="px-4 py-2 rounded border text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--input-bg)',
                      }}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Type"
                value={localConfig.announcement.type}
                onChange={(e) => update('announcement.type', e.target.value)}
                options={[
                  { value: 'info', label: 'Info (Blue)' },
                  { value: 'warning', label: 'Warning (Orange)' },
                  { value: 'success', label: 'Success (Green)' },
                  { value: 'error', label: 'Error (Red)' },
                ]}
                fullWidth
              />
              <Input
                label="Title"
                value={localConfig.announcement.title}
                onChange={(e) => update('announcement.title', e.target.value)}
                fullWidth
              />
              <Textarea
                label="Message"
                value={localConfig.announcement.message}
                onChange={(e) => update('announcement.message', e.target.value)}
                rows={4}
                fullWidth
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.announcement.dismissible}
                    onChange={(e) => update('announcement.dismissible', e.target.checked)}
                    className="w-5 h-5 rounded accent-ft-primary"
                  />
                  Dismissible by users
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!announcementChanged}
              onClick={() => confirmAndSave('Announcement', { announcement: localConfig.announcement })}
            >
              Save Announcement
            </Button>
          </div>
        </div>
      </Section>

      {/* ────── Restore Points ────── */}
      <Section title="Restore Points">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Snapshots save the entire configuration at a point in time. Auto-snapshots are created before every change.
            Manual snapshots let you create named restore points.
          </p>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Create Named Snapshot
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} placeholder="Snapshot name (required)" fullWidth />
              <Input value={snapshotDescription} onChange={(e) => setSnapshotDescription(e.target.value)} placeholder="Description (optional)" fullWidth />
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="primary" size="sm" icon={<Plus size={16} />} loading={createSnapshot.isPending} onClick={handleCreateSnapshot}>
                Create Snapshot
              </Button>
            </div>
          </div>

          {snapshotsLoading ? (
            <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>Loading snapshots...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Version</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Created By</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Date</th>
                    <th className="px-4 py-3 text-right font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshotsData?.snapshots?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
                        No snapshots yet
                      </td>
                    </tr>
                  )}
                  {snapshotsData?.snapshots?.map((s) => (
                    <tr key={s.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        <span className="font-medium">{s.name}</span>
                        {s.description && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>v{s.config_version}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_auto ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                          {s.is_auto ? 'Auto' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.created_by_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(s.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        {restoreConfirmId === s.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-600 font-medium">Restore?</span>
                            <Button variant="danger" size="sm" loading={restoreSnapshot.isPending} onClick={() => handleRestore(s.id)}>Yes</Button>
                            <Button variant="secondary" size="sm" onClick={() => setRestoreConfirmId(null)}>No</Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" icon={<RotateCcw size={14} />} onClick={() => setRestoreConfirmId(s.id)}>
                            Restore
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
