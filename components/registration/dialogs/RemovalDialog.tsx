import React from 'react';
import { useSession } from 'next-auth/react';
import { User } from '../../../types/user';
import { Button } from '../../ui/Button';

type RemovalReason = '' | 'CANCEL' | 'CANCEL_GAME_DAY' | 'NOT_READY' | 'LATE' | 'NO_SHOW' | 'NO_BAN';

const GRACE_PERIOD_MINUTES = 15;

interface RemovalDialogProps {
  isOpen: boolean;
  targetIntra: string;
  removeReason: RemovalReason;
  users: User[];
  onReasonChange: (reason: RemovalReason) => void;
  onConfirm: (intra: string, isAdminAction: boolean) => void;
  onCancel: () => void;
}

/**
 * RemovalDialog Component
 * Single Responsibility: Handle TIG removal dialog UI and logic
 */
export function RemovalDialog({
  isOpen,
  targetIntra,
  removeReason,
  users,
  onReasonChange,
  onConfirm,
  onCancel
}: RemovalDialogProps) {
  const { data: session } = useSession();

  if (!isOpen) return null;

  const targetUser = users.find(u => u.intra === targetIntra);
  if (!targetUser) return null;

  const isAdminAction: boolean = !!(session?.user?.isAdmin && targetUser.user_id !== session.user.id);

  // Check if within 15-minute grace period for self-removal
  const registrationTime = targetUser.created_at ? new Date(targetUser.created_at) : null;
  const now = new Date();
  const minutesSinceRegistration = registrationTime
    ? (now.getTime() - registrationTime.getTime()) / (1000 * 60)
    : Infinity;
  const withinGracePeriod = !isAdminAction && minutesSinceRegistration <= GRACE_PERIOD_MINUTES;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4"
      onClick={onCancel}
      role="dialog"
      aria-labelledby="removal-dialog-title"
      aria-describedby="removal-dialog-description"
      aria-modal="true"
    >
      <div
        className="rounded-lg shadow-2xl p-4 md:p-8 max-w-md w-full"
        style={{ backgroundColor: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="removal-dialog-title"
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {isAdminAction ? "Remove Player (Admin)" : "Remove Registration"}
        </h2>
        <p
          id="removal-dialog-description"
          className="mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isAdminAction
            ? "Select the reason for removing this player:"
            : withinGracePeriod
            ? "You can remove your registration without a ban (within 15-minute grace period) or select a cancellation reason:"
            : "Select the reason for cancelling your registration:"}
        </p>

        <div className="space-y-3 mb-6" role="radiogroup" aria-label="Removal reason">
          {/* Grace period option for users within 15 minutes */}
          {!isAdminAction && withinGracePeriod && (
            <label
              htmlFor="reason-grace"
              className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-green-500"
              style={{ borderColor: 'var(--border-color)', borderWidth: '2px' }}
            >
              <input
                id="reason-grace"
                type="radio"
                name="removeReason"
                value=""
                checked={removeReason === ""}
                onChange={() => onReasonChange("")}
                className="mt-1"
                aria-label="Remove without ban - Grace period within 15 minutes of registration"
              />
              <div className="flex-1">
                <div className="font-medium text-green-600">
                  Remove without ban (Grace Period)
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No ban - Within 15 minutes of registration
                </div>
              </div>
            </label>
          )}

          {/* Cancel reservation - for users only */}
          {!isAdminAction && (
            <label
              htmlFor="reason-cancel"
              className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <input
                id="reason-cancel"
                type="radio"
                name="removeReason"
                value="CANCEL"
                checked={removeReason === "CANCEL"}
                onChange={(e) => onReasonChange(e.target.value as RemovalReason)}
                className="mt-1"
                aria-label="Cancel reservation - Ban: 1 week or 2 weeks if game day after 5 PM"
              />
              <div className="flex-1">
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Cancel reservation
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Ban: 1 week (or 2 weeks if game day after 5 PM)
                </div>
              </div>
            </label>
          )}

          {/* Admin-only options */}
          {isAdminAction && (
            <>
              <label
                htmlFor="reason-no-ban"
                className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <input
                  id="reason-no-ban"
                  type="radio"
                  name="removeReason"
                  value="NO_BAN"
                  checked={removeReason === "NO_BAN"}
                  onChange={(e) => onReasonChange(e.target.value as RemovalReason)}
                  className="mt-1"
                  aria-label="Remove without ban - No ban applied"
                />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Remove without ban
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No ban applied
                  </div>
                </div>
              </label>

              <label
                htmlFor="reason-admin-cancel"
                className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <input
                  id="reason-admin-cancel"
                  type="radio"
                  name="removeReason"
                  value="CANCEL"
                  checked={removeReason === "CANCEL"}
                  onChange={(e) => onReasonChange(e.target.value as RemovalReason)}
                  className="mt-1"
                  aria-label="Cancel reservation - Ban: One week, 7 days"
                />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Cancel reservation
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Ban: One week (7 days)
                  </div>
                </div>
              </label>

              <label
                htmlFor="reason-cancel-game-day"
                className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <input
                  id="reason-cancel-game-day"
                  type="radio"
                  name="removeReason"
                  value="CANCEL_GAME_DAY"
                  checked={removeReason === "CANCEL_GAME_DAY"}
                  onChange={(e) => onReasonChange(e.target.value as RemovalReason)}
                  className="mt-1"
                  aria-label="Cancel on game day after 5 PM - Ban: Two weeks, 14 days"
                />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Cancel on game day after 5 PM
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Ban: Two weeks (14 days)
                  </div>
                </div>
              </label>

              <label
                htmlFor="reason-not-ready"
                className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <input
                  id="reason-not-ready"
                  type="radio"
                  name="removeReason"
                  value="NOT_READY"
                  checked={removeReason === "NOT_READY"}
                  onChange={(e) => onReasonChange(e.target.value as RemovalReason)}
                  className="mt-1"
                  aria-label="Not ready when booking time starts - Ban: Half a week, 3.5 days"
                />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Not ready when booking time starts
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Ban: Half a week (3.5 days)
                  </div>
                </div>
              </label>

              <label
                htmlFor="reason-late"
                className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <input
                  id="reason-late"
                  type="radio"
                  name="removeReason"
                  value="LATE"
                  checked={removeReason === "LATE"}
                  onChange={(e) => onReasonChange(e.target.value as RemovalReason)}
                  className="mt-1"
                  aria-label="Late more than 15 minutes - Ban: One week, 7 days"
                />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Late &gt; 15 minutes
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Ban: One week (7 days)
                  </div>
                </div>
              </label>

              <label
                htmlFor="reason-no-show"
                className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <input
                  id="reason-no-show"
                  type="radio"
                  name="removeReason"
                  value="NO_SHOW"
                  checked={removeReason === "NO_SHOW"}
                  onChange={(e) => onReasonChange(e.target.value as RemovalReason)}
                  className="mt-1"
                  aria-label="No Show without notice - Ban: Four weeks, 28 days"
                />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    No Show without notice
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Ban: Four weeks (28 days)
                  </div>
                </div>
              </label>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="secondary"
            size="lg"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(targetIntra, isAdminAction)}
            variant="danger"
            size="lg"
            fullWidth
            aria-label={isAdminAction ? "Confirm removal of player with selected ban" : "Confirm removal of your registration with selected ban"}
          >
            {isAdminAction ? "Remove Player" : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
