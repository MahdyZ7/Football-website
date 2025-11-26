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
      className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4"
      onClick={onCancel}
      role="dialog"
      aria-labelledby="edit-name-dialog-title"
      aria-describedby="edit-name-dialog-description"
      aria-modal="true"
    >
      <div
        className="rounded-lg shadow-2xl p-4 md:p-8 max-w-md w-full"
        style={{ backgroundColor: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="edit-name-dialog-title"
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Edit Name
        </h2>
        <p
          id="edit-name-dialog-description"
          className="mb-6 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          You can edit your name within 15 minutes of registration. This option is only available for unverified accounts.
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
            variant="secondary"
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
            Update Name
          </Button>
        </div>
      </div>
    </div>
  );
}
