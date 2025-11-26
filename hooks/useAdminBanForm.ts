import { useState } from 'react';
import { TIG_BAN_DURATIONS } from '../lib/utils/TIG_list';
import { useBanUser } from './useQueries';

/**
 * Ban form state interface
 */
export interface BanFormState {
  userId: string;
  reason: string;
  duration: number;
}

/**
 * Ban reason option interface
 */
export interface BanReason {
  label: string;
  value: string;
  duration: number;
}

/**
 * Custom hook for admin ban form management
 * Single Responsibility: Manage ban form state and submission logic
 *
 * Extracted from Admin component to separate form logic from UI rendering
 */
export function useAdminBanForm(showToast: (message: string, type: 'success' | 'error' | 'info') => void) {
  const [banForm, setBanForm] = useState<BanFormState>({
    userId: '',
    reason: '',
    duration: 7 // days
  });

  const [isCustomReason, setIsCustomReason] = useState(false);
  const banUserMutation = useBanUser();

  // Predefined ban reasons with durations
  const banReasons: BanReason[] = [
    { label: 'Select a reason...', value: '', duration: 7 },
    { label: 'Not ready when booking time starts', value: 'Not ready when booking time starts', duration: TIG_BAN_DURATIONS.NOT_READY },
    { label: 'Cancel reservation', value: 'Cancel reservation', duration: TIG_BAN_DURATIONS.CANCEL },
    { label: 'Late > 15 minutes', value: 'Late > 15 minutes', duration: TIG_BAN_DURATIONS.LATE },
    { label: 'Cancel reservation on game day after 5 PM', value: 'Cancel reservation on game day after 5 PM', duration: TIG_BAN_DURATIONS.CANCEL_GAME_DAY },
    { label: 'No Show without notice', value: 'No Show without notice', duration: TIG_BAN_DURATIONS.NO_SHOW },
    { label: 'Custom reason', value: 'custom', duration: 7 }
  ];

  /**
   * Handle ban form submission
   */
  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!banForm.userId || !banForm.reason || banForm.reason === '') {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    banUserMutation.mutate(
      {
        userId: banForm.userId,
        reason: banForm.reason,
        duration: banForm.duration.toString()
      },
      {
        onSuccess: () => {
          setBanForm({ userId: '', reason: '', duration: 7 });
          setIsCustomReason(false);
          showToast('User banned successfully', 'success');
        },
        onError: () => {
          showToast('Failed to ban user', 'error');
        }
      }
    );
  };

  /**
   * Handle ban reason selection change
   */
  const handleReasonChange = (value: string) => {
    const selectedReason = banReasons.find(r => r.value === value);
    if (selectedReason) {
      if (selectedReason.value === 'custom') {
        setIsCustomReason(true);
        setBanForm(prev => ({ ...prev, reason: '', duration: 7 }));
      } else {
        setIsCustomReason(false);
        setBanForm(prev => ({
          ...prev,
          reason: selectedReason.value,
          duration: selectedReason.duration
        }));
      }
    }
  };

  /**
   * Quick ban a user (2 days)
   */
  const quickBan = (userId: string) => {
    setBanForm({
      userId,
      reason: 'Quick ban - 2 days',
      duration: 2
    });
  };

  /**
   * Calculate ban end date
   */
  const getBanEndDate = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + banForm.duration);
    return endDate.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return {
    banForm,
    setBanForm,
    isCustomReason,
    banReasons,
    handleBanUser,
    handleReasonChange,
    quickBan,
    getBanEndDate,
    isPending: banUserMutation.isPending
  };
}
