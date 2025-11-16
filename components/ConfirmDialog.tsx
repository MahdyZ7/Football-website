'use client';

import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          headerBg: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'warning':
        return {
          icon: '⚡',
          confirmBg: 'bg-orange-600 hover:bg-orange-700',
          headerBg: 'bg-orange-50 dark:bg-orange-900/20'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmBg: 'bg-ft-primary hover:bg-ft-secondary',
          headerBg: 'bg-blue-50 dark:bg-blue-900/20'
        };
    }
  };

  const styles = getTypeStyles();

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
          className="rounded-xl shadow-2xl max-w-md w-full animate-scaleIn"
          style={{ backgroundColor: 'var(--bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 py-4 rounded-t-xl ${styles.headerBg}`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{styles.icon}</div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 flex gap-3 justify-end border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200
                         border-2 hover:scale-105 active:scale-95"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`px-5 py-2.5 rounded-lg font-medium text-white transition-all duration-200
                         hover:scale-105 active:scale-95 shadow-md ${styles.confirmBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
