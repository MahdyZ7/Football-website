/**
 * Custom hook for feedback color utilities
 * Single Responsibility: Provide color classes for feedback types and statuses
 *
 * Extracted from AdminFeedbackPage component to separate color logic
 */
export function useFeedbackColors() {
  /**
   * Get badge color class based on feedback type
   */
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'feature':
        return 'bg-blue-600';
      case 'bug':
        return 'bg-red-600';
      case 'feedback':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  /**
   * Get badge color class based on feedback status
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600';
      case 'approved':
        return 'bg-green-600';
      case 'rejected':
        return 'bg-red-600';
      case 'in_progress':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-blue-600';
      default:
        return 'bg-gray-500';
    }
  };

  /**
   * Format status text for display (replace underscores with spaces)
   */
  const formatStatus = (status: string): string => {
    return status.replace('_', ' ');
  };

  return {
    getTypeColor,
    getStatusColor,
    formatStatus,
  };
}
