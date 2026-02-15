'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { TIG_BAN_DURATIONS } from '../../lib/utils/TIG_list';

interface BanTarget {
  name: string;
  intra: string;
}

interface BanDialogProps {
  isOpen: boolean;
  targetUser: BanTarget | null;
  onConfirm: (banData: { userId: string; reason: string; duration: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}

const banReasons = [
  { label: 'Select a reason...', value: '', duration: 7 },
  { label: 'Not ready when booking time starts', value: 'Not ready when booking time starts', duration: TIG_BAN_DURATIONS.NOT_READY },
  { label: 'Cancel reservation', value: 'Cancel reservation', duration: TIG_BAN_DURATIONS.CANCEL },
  { label: 'Late > 15 minutes', value: 'Late > 15 minutes', duration: TIG_BAN_DURATIONS.LATE },
  { label: 'Cancel reservation on game day after 5 PM', value: 'Cancel reservation on game day after 5 PM', duration: TIG_BAN_DURATIONS.CANCEL_GAME_DAY },
  { label: 'No Show without notice', value: 'No Show without notice', duration: TIG_BAN_DURATIONS.NO_SHOW },
  { label: 'Custom reason', value: 'custom', duration: 7 },
];

const BanDialog: React.FC<BanDialogProps> = ({ isOpen, targetUser, onConfirm, onCancel, isPending }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [duration, setDuration] = useState(7);
  const [isCustom, setIsCustom] = useState(false);

  // Reset form when dialog opens with a new target
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setCustomReason('');
      setDuration(7);
      setIsCustom(false);
    }
  }, [isOpen, targetUser?.intra]);

  if (!isOpen || !targetUser) return null;

  const handleReasonChange = (value: string) => {
    const selected = banReasons.find(r => r.value === value);
    if (selected) {
      if (selected.value === 'custom') {
        setIsCustom(true);
        setReason('');
        setDuration(7);
      } else {
        setIsCustom(false);
        setReason(selected.value);
        setDuration(selected.duration);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = isCustom ? customReason : reason;
    if (!finalReason) return;
    onConfirm({
      userId: targetUser.intra,
      reason: finalReason,
      duration: duration.toString(),
    });
  };

  const banEndDate = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    return endDate.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const finalReason = isCustom ? customReason : reason;
  const isValid = finalReason && duration > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="rounded-xl shadow-2xl max-w-lg w-full animate-scaleIn"
          style={{ backgroundColor: 'var(--bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 rounded-t-xl bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <div className="text-2xl">&#9888;&#65039;</div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Ban User
              </h3>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Target user info */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Banning user:</div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {targetUser.name} ({targetUser.intra})
              </div>
            </div>

            <Select
              label="Reason"
              value={isCustom ? 'custom' : reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              fullWidth
            >
              {banReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>

            {isCustom && (
              <Input
                label="Custom Reason"
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom ban reason"
                fullWidth
              />
            )}

            <div>
              <Input
                label="Duration (days)"
                type="number"
                value={duration.toString()}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                min="0.5"
                max="365"
                step="0.5"
                disabled={!isCustom && reason !== ''}
                fullWidth
              />
              {duration > 0 && (
                <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Ban ends: {banEndDate()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={isPending}
                disabled={!isValid}
              >
                Ban User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BanDialog;
