import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useEditName } from './useQueries';
import { toast } from 'sonner';

type RemovalReason = '' | 'CANCEL' | 'CANCEL_GAME_DAY' | 'NOT_READY' | 'LATE' | 'NO_SHOW' | 'NO_BAN';

/**
 * Custom hook for player management (removal and name editing)
 * Single Responsibility: Handle player modification operations
 */
export function usePlayerManagement() {
  const onSuccess = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  }, []);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeReason, setRemoveReason] = useState<RemovalReason>('');
  const [targetIntra, setTargetIntra] = useState("");

  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [editNameIntra, setEditNameIntra] = useState("");

  const { data: session } = useSession();
  const editNameMutation = useEditName();

  // Removal handlers
  const initiateRemoval = useCallback((intra: string) => {
    setTargetIntra(intra);
    setShowRemoveDialog(true);
  }, []);

  const handleSelfRemove = useCallback(async (intra: string, isAdminRemoval: boolean = false) => {
    try {
      if (isAdminRemoval && session?.user?.isAdmin) {
        // Admin removing another player - use admin endpoint
        if (!removeReason) {
          onSuccess("Please select a reason for removal", 'error');
          return;
        }

        const response = await fetch("/api/admin/remove-player", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intra, reason: removeReason })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove player');
        }

        const data = await response.json();
        onSuccess(data.message || "Player removed successfully", 'success');
      } else {
        // Self-removal - reason is optional if within 15-minute grace period
        const response = await fetch("/api/self-remove", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intra, reason: removeReason || undefined })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove registration');
        }

        const data = await response.json();
        onSuccess(data.message, 'success');
      }

      setShowRemoveDialog(false);
      setRemoveReason('');
      setTargetIntra("");
    } catch (error: any) {
      onSuccess(error.message || "Failed to remove registration", 'error');
    }
  }, [removeReason, session, onSuccess]);

  const closeRemovalDialog = useCallback(() => {
    setShowRemoveDialog(false);
    setRemoveReason('');
    setTargetIntra("");
  }, []);

  // Name editing handlers
  const initiateEditName = useCallback((intra: string, currentName: string) => {
    setEditNameIntra(intra);
    setEditNameValue(currentName);
    setShowEditNameDialog(true);
  }, []);

  const handleEditName = useCallback(async () => {
    if (!editNameValue.trim()) {
      onSuccess("Name cannot be empty", 'error');
      return;
    }

    try {
      await editNameMutation.mutateAsync({
        intra: editNameIntra,
        newName: editNameValue
      });

      onSuccess('Name updated successfully!', 'success');
      setShowEditNameDialog(false);
      setEditNameValue("");
      setEditNameIntra("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update name";
      onSuccess(errorMessage, 'error');
    }
  }, [editNameValue, editNameIntra, editNameMutation, onSuccess]);

  const closeEditNameDialog = useCallback(() => {
    setShowEditNameDialog(false);
    setEditNameValue("");
    setEditNameIntra("");
  }, []);

  return {
    // Removal state
    showRemoveDialog,
    removeReason,
    targetIntra,
    setRemoveReason,
    initiateRemoval,
    handleSelfRemove,
    closeRemovalDialog,

    // Edit name state
    showEditNameDialog,
    editNameValue,
    editNameIntra,
    setEditNameValue,
    initiateEditName,
    handleEditName,
    closeEditNameDialog,
    isEditingName: editNameMutation.isPending
  };
}
