import { useState } from 'react';

/**
 * Confirm dialog state interface
 */
export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type?: 'danger' | 'warning' | 'info';
}

/**
 * Custom hook for confirmation dialog management
 * Single Responsibility: Manage confirmation dialog state and interactions
 *
 * Extracted from Admin component to separate dialog logic from main component
 */
export function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  /**
   * Show a confirmation dialog
   */
  const showConfirm = (config: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({
      ...config,
      isOpen: true
    });
  };

  /**
   * Close the confirmation dialog
   */
  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  /**
   * Confirm and execute the action
   */
  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  return {
    confirmDialog,
    showConfirm,
    closeConfirm,
    handleConfirm
  };
}
