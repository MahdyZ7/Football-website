import { toast } from 'sonner';
import {
  useApproveFeedback,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from './useQueries';

/**
 * Custom hook for admin feedback action handlers
 * Single Responsibility: Handle feedback approval, status updates, and deletion
 *
 * Extracted from AdminFeedbackPage component to separate handler logic
 */
export function useAdminFeedbackHandlers() {
  const approveMutation = useApproveFeedback();
  const updateStatusMutation = useUpdateFeedbackStatus();
  const deleteMutation = useDeleteFeedback();

  /**
   * Approve or reject a feedback submission
   */
  const handleApprove = async (feedbackId: number, action: 'approve' | 'reject') => {
    try {
      await approveMutation.mutateAsync({ feedbackId, action });
      toast.success(`Feedback ${action}d successfully`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || `Failed to ${action} feedback`);
    }
  };

  /**
   * Update feedback status (approved → in_progress → completed)
   */
  const handleStatusUpdate = async (feedbackId: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ feedbackId, status });
      toast.success('Status updated successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Failed to update status');
    }
  };

  /**
   * Delete a feedback submission with confirmation
   */
  const handleDelete = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(feedbackId);
      toast.success('Feedback deleted successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Failed to delete feedback');
    }
  };

  return {
    handleApprove,
    handleStatusUpdate,
    handleDelete,
    isPending: approveMutation.isPending || updateStatusMutation.isPending || deleteMutation.isPending,
    approvePending: approveMutation.isPending,
    updatePending: updateStatusMutation.isPending,
    deletePending: deleteMutation.isPending,
  };
}
