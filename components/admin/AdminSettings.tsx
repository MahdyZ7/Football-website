'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Save, RotateCcw, Plus, AlertTriangle, X, Clock } from 'lucide-react';
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

// ─── Day Toggle Row (toggle button + clock/time input) ───────────
function DayToggleRow({
  dayIndex,
  active,
  onToggle,
  children,
}: {
  dayIndex: number;
  active: boolean;
  onToggle: (dayIndex: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => onToggle(dayIndex)}
        className={`w-28 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${
          active
            ? 'bg-ft-primary text-white border-ft-primary'
            : 'border-dashed'
        }`}
        style={
          !active
            ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }
            : undefined
        }
      >
        {DAY_NAMES[dayIndex]}
      </button>
      {active && (
        <div className="flex items-center gap-2 flex-wrap">
          <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
          {children}
        </div>
      )}
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

  const gameDaysChanged = useMemo(
    () => sectionHasChanges(['gameDays', 'location', 'timezoneOffset']),
    [sectionHasChanges]
  );
  const registrationChanged = useMemo(
    () => sectionHasChanges(['registrationWindows', 'registrationForceClosed']),
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

  // ─── Game day toggle helpers ───────────────────────────────────
  const gameDaySet = new Set(localConfig.gameDays.map((g) => g.day));

  const toggleGameDay = (dayIndex: number) => {
    if (gameDaySet.has(dayIndex)) {
      update('gameDays', localConfig.gameDays.filter((g: GameDayEntry) => g.day !== dayIndex));
    } else {
      const newEntry: GameDayEntry = { day: dayIndex, dayName: DAY_NAMES[dayIndex], time: '9 PM' };
      const updated = [...localConfig.gameDays, newEntry].sort((a, b) => a.day - b.day);
      update('gameDays', updated);
    }
  };

  const updateGameDayTime = (dayIndex: number, time: string) => {
    update(
      'gameDays',
      localConfig.gameDays.map((g: GameDayEntry) =>
        g.day === dayIndex ? { ...g, time } : g
      )
    );
  };

  // ─── Registration window toggle helpers ────────────────────────
  const regDaySet = new Set(localConfig.registrationWindows.map((r) => r.day));

  const toggleRegDay = (dayIndex: number) => {
    if (regDaySet.has(dayIndex)) {
      update('registrationWindows', localConfig.registrationWindows.filter((r: RegistrationWindowEntry) => r.day !== dayIndex));
    } else {
      const newEntry: RegistrationWindowEntry = {
        day: dayIndex, dayName: DAY_NAMES[dayIndex], openHour: 12, closeHour: 22,
      };
      const updated = [...localConfig.registrationWindows, newEntry].sort((a, b) => a.day - b.day);
      update('registrationWindows', updated);
    }
  };

  const updateRegWindow = (dayIndex: number, field: 'openHour' | 'closeHour', value: number) => {
    update(
      'registrationWindows',
      localConfig.registrationWindows.map((r: RegistrationWindowEntry) =>
        r.day === dayIndex ? { ...r, [field]: value } : r
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

      {/* ────── Game Days ────── */}
      <Section title="Game Days" defaultOpen>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Toggle the days games are played and set the time for each day.
          </p>
          <div className="space-y-3">
            {DAY_NAMES.map((_, i) => (
              <DayToggleRow key={i} dayIndex={i} active={gameDaySet.has(i)} onToggle={toggleGameDay}>
                <input
                  type="text"
                  value={localConfig.gameDays.find((g) => g.day === i)?.time ?? ''}
                  onChange={(e) => updateGameDayTime(i, e.target.value)}
                  placeholder='e.g. "9 PM"'
                  className="px-3 py-2 rounded border text-sm w-28 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ft-primary"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </DayToggleRow>
            ))}
          </div>
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
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!gameDaysChanged}
              onClick={() =>
                confirmAndSave('Game Days', {
                  gameDays: localConfig.gameDays,
                  location: localConfig.location,
                  timezoneOffset: localConfig.timezoneOffset,
                })
              }
            >
              Save Game Days
            </Button>
          </div>
        </div>
      </Section>

      {/* ────── Registration Windows ────── */}
      <Section title="Registration Windows">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Toggle the days registration opens and set the opening/closing hours for each day.
          </p>
          <div className="space-y-3">
            {DAY_NAMES.map((_, i) => (
              <DayToggleRow key={i} dayIndex={i} active={regDaySet.has(i)} onToggle={toggleRegDay}>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Opens</label>
                  <HourSelect
                    value={localConfig.registrationWindows.find((r) => r.day === i)?.openHour ?? 12}
                    onChange={(h) => updateRegWindow(i, 'openHour', h)}
                  />
                  <label className="text-xs font-medium ml-2" style={{ color: 'var(--text-secondary)' }}>Closes</label>
                  <HourSelect
                    value={localConfig.registrationWindows.find((r) => r.day === i)?.closeHour ?? 22}
                    onChange={(h) => updateRegWindow(i, 'closeHour', h)}
                  />
                </div>
              </DayToggleRow>
            ))}
          </div>

          {/* Force Close Toggle */}
          <div
            className="p-4 rounded-lg border-2 mt-4"
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

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              loading={updateConfig.isPending}
              disabled={!registrationChanged}
              onClick={() =>
                confirmAndSave('Registration Windows', {
                  registrationWindows: localConfig.registrationWindows,
                  registrationForceClosed: localConfig.registrationForceClosed,
                })
              }
            >
              Save Registration
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
