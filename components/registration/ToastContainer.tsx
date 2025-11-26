import React from 'react';
import { Toast } from '../../types/user';

interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: number) => void;
}

/**
 * ToastContainer Component
 * Single Responsibility: Display toast notifications
 */
export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => onRemoveToast(toast.id)}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => onRemoveToast(toast.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
