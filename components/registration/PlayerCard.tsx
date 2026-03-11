import React from 'react';
import { User } from '../../types/user';
import { useConfig } from '../../contexts/SiteConfigContext';

interface PlayerCardProps {
  user: User;
  index: number;
  isOwnRegistration: boolean;
  isAdmin: boolean;
  onRemove: (intra: string) => void;
  onEditName: (intra: string, currentName: string) => void;
}

/**
 * PlayerCard Component
 * Single Responsibility: Display individual player information with action buttons
 */
export function PlayerCard({
  user,
  index,
  isOwnRegistration,
  isAdmin,
  onRemove,
  onEditName
}: PlayerCardProps) {
  const { config } = useConfig();
  const canRemove = isOwnRegistration || isAdmin;

  // Check if within grace period for name editing (own registration only)
  const registrationTime = user.created_at ? new Date(user.created_at) : null;
  const now = new Date();
  const minutesSinceRegistration = registrationTime
    ? (now.getTime() - registrationTime.getTime()) / (1000 * 60)
    : Infinity;
  const withinGracePeriod = isOwnRegistration && !user.verified && minutesSinceRegistration <= config.gracePeriodMinutes;

  const isWaitlisted = (user.registration_status ?? 'confirmed') === 'waitlisted';
  const waitlistPosition = user.waitlist_position ?? null;

  return (
    <div
      className={`p-4 rounded-lg border-l-4 flex items-center justify-between transition-all duration-200 ${
        !isWaitlisted ? 'hover:scale-[1.02]' : ''
      }`}
      style={{
        backgroundColor: !isWaitlisted ? 'var(--paid-bg)' : 'var(--unpaid-bg)',
        borderLeftColor: !isWaitlisted ? '#16a34a' : 'var(--ft-accent)',
        color: !isWaitlisted ? 'var(--registered-txt)' : 'var(--waitlist-txt)'
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="font-bold text-lg min-w-[2rem]">
          {!isWaitlisted ? index + 1 : `W${waitlistPosition ?? '?'}`}
        </span>
        <div className="flex flex-col flex-1">
          <span className="font-semibold">{user.name}</span>
          <span className="text-sm opacity-80">
            {user.intra} {!isWaitlisted ? "• Confirmed" : `• Waitlist #${waitlistPosition ?? '?'}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xl" aria-label={user.verified ? "Verified user" : "Invalid Intra"}>
          {user.verified ? (
            "✅"
          ) : (
            <span className="text-red-600 text-sm font-medium">Invalid Intra</span>
          )}
        </div>
        {withinGracePeriod && (
          <button
            onClick={() => onEditName(user.intra, user.name)}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200
                       hover:scale-110 active:scale-95"
            title="Edit name (within 15-minute grace period)"
            aria-label={`Edit name for ${user.name}`}
          >
            ✏️
          </button>
        )}
        {canRemove && (
          <button
            onClick={() => onRemove(user.intra)}
            className="ml-2 w-10 h-10 flex items-center justify-center rounded-full
                       bg-red-600 hover:bg-red-700 text-white transition-all duration-200
                       hover:scale-110 active:scale-95"
            title={isAdmin && !isOwnRegistration
              ? "Remove player and apply TIG ban (Admin)"
              : "Remove my registration"}
            aria-label={isAdmin && !isOwnRegistration
              ? `Remove ${user.name} (Admin)`
              : "Remove my registration"}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
