'use client';

import React, { useEffect, useId } from 'react';
import { AlertTriangle, Info, Zap } from 'lucide-react';
import { Button } from './ui/Button';

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

const TYPES = {
  danger: { Icon: AlertTriangle, tone: 'var(--danger)', variant: 'danger' as const },
  warning: { Icon: Zap, tone: 'var(--ft-accent)', variant: 'accent' as const },
  info: { Icon: Info, tone: 'var(--ft-primary)', variant: 'primary' as const },
};

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
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const { Icon, tone, variant } = TYPES[type];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--overlay)] z-[9998] animate-fadeIn"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={messageId}
          className="pointer-events-auto rounded-lg border max-w-md w-full animate-scaleIn shadow-[0_24px_48px_var(--shadow)]"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="px-6 pt-6 pb-2 flex items-start gap-4">
            <span
              className="flex-none inline-flex items-center justify-center w-10 h-10 rounded-full"
              style={{ color: tone, border: `2px solid ${tone}` }}
              aria-hidden="true"
            >
              <Icon size={20} />
            </span>
            <div>
              <h3 id={titleId} className="text-[1.75rem] leading-tight m-0" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <p id={messageId} className="mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel} autoFocus>
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={() => {
                onConfirm();
                onCancel();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
