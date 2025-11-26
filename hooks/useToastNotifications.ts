import { useState, useCallback } from 'react';
import { Toast } from '../types/user';

/**
 * Custom hook for managing toast notifications
 * Single Responsibility: Handle toast state and lifecycle
 */
export function useToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast
  };
}
