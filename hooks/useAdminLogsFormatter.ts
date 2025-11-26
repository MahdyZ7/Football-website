/**
 * Custom hook for admin logs formatting utilities
 * Single Responsibility: Provide formatting functions for admin log display
 *
 * Extracted from AdminLogs component to separate formatting logic
 */
export function useAdminLogsFormatter() {
  /**
   * Format timestamp to localized date/time string
   */
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  /**
   * Get color class based on admin action type
   */
  const getActionColorClass = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'user_deleted':
        return 'text-red-500';
      case 'user_banned':
        return 'text-orange-500';
      case 'user_unbanned':
        return 'text-green-600';
      case 'user_verified':
        return 'text-blue-500';
      case 'user_unverified':
        return 'text-gray-500';
      default:
        return '';
    }
  };

  /**
   * Format action name for display (remove underscores, uppercase)
   */
  const formatActionName = (action: string): string => {
    return action.replace(/_/g, ' ').toUpperCase();
  };

  return {
    formatTimestamp,
    getActionColorClass,
    formatActionName
  };
}
