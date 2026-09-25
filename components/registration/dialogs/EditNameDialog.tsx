import React from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

interface EditNameDialogProps {
  isOpen: boolean;
  nameValue: string;
  isPending: boolean;
  onNameChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * EditNameDialog Component
 * Single Responsibility: Handle name editing dialog UI
 */
export function EditNameDialog({
  isOpen,
  nameValue,
  isPending,
  onNameChange,
  onConfirm,
  onCancel
}: EditNameDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--overlay)] z-[1000] flex items-center justify-center p-4"
      onClick={onCancel}
      role="dialog"
      aria-labelledby="edit-name-dialog-title"
      aria-describedby="edit-name-dialog-description"
      aria-modal="true"
    >
      <div
        className="rounded-lg border shadow-[0_24px_48px_var(--shadow)] p-6 md:p-8 max-w-md w-full"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="edit-name-dialog-title"
          className="ds-title text-[2rem]"
        >
          Edit your name
        </h2>
        <p
          id="edit-name-dialog-description"
          className="mb-6 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          You can change your name for 15 minutes after signing up, as long as your intra hasn&apos;t been verified yet.
        </p>

        <Input
          id="editName"
          label="New Name"
          type="text"
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && nameValue.trim() && !isPending) {
              onConfirm();
            }
            if (e.key === 'Escape') {
              onCancel();
            }
          }}
          placeholder="Enter new name"
          autoFocus
          required
          fullWidth
        />

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            fullWidth
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!nameValue.trim()}
            loading={isPending}
          >
            Save name
          </Button>
        </div>
      </div>
    </div>
  );
}
