/**
 * Tests for useFeedbackColors hook
 * Validates color mapping utilities for feedback types and statuses
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useFeedbackColors } from '@/hooks/useFeedbackColors';

describe('useFeedbackColors', () => {
  describe('getTypeColor', () => {
    it('should return correct color for feature type', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getTypeColor('feature')).toBe('bg-blue-600');
    });

    it('should return correct color for bug type', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getTypeColor('bug')).toBe('bg-red-600');
    });

    it('should return correct color for feedback type', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getTypeColor('feedback')).toBe('bg-green-600');
    });

    it('should return default color for unknown type', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getTypeColor('unknown')).toBe('bg-gray-600');
      expect(result.current.getTypeColor('')).toBe('bg-gray-600');
      expect(result.current.getTypeColor('random')).toBe('bg-gray-600');
    });

    it('should handle case-sensitive type values', () => {
      const { result } = renderHook(() => useFeedbackColors());

      // Should only match exact case
      expect(result.current.getTypeColor('FEATURE')).toBe('bg-gray-600');
      expect(result.current.getTypeColor('Feature')).toBe('bg-gray-600');
      expect(result.current.getTypeColor('BUG')).toBe('bg-gray-600');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for pending status', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getStatusColor('pending')).toBe('bg-yellow-600');
    });

    it('should return correct color for approved status', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getStatusColor('approved')).toBe('bg-green-600');
    });

    it('should return correct color for rejected status', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getStatusColor('rejected')).toBe('bg-red-600');
    });

    it('should return correct color for in_progress status', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getStatusColor('in_progress')).toBe('bg-orange-500');
    });

    it('should return correct color for completed status', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getStatusColor('completed')).toBe('bg-blue-600');
    });

    it('should return default color for unknown status', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.getStatusColor('unknown')).toBe('bg-gray-500');
      expect(result.current.getStatusColor('')).toBe('bg-gray-500');
      expect(result.current.getStatusColor('random')).toBe('bg-gray-500');
    });

    it('should handle case-sensitive status values', () => {
      const { result } = renderHook(() => useFeedbackColors());

      // Should only match exact case
      expect(result.current.getStatusColor('PENDING')).toBe('bg-gray-500');
      expect(result.current.getStatusColor('Pending')).toBe('bg-gray-500');
      expect(result.current.getStatusColor('IN_PROGRESS')).toBe('bg-gray-500');
    });
  });

  describe('formatStatus', () => {
    it('should replace underscore with space', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.formatStatus('in_progress')).toBe('in progress');
    });

    it('should handle status without underscore', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.formatStatus('pending')).toBe('pending');
      expect(result.current.formatStatus('approved')).toBe('approved');
      expect(result.current.formatStatus('rejected')).toBe('rejected');
      expect(result.current.formatStatus('completed')).toBe('completed');
    });

    it('should handle empty string', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.formatStatus('')).toBe('');
    });

    it('should only replace first underscore', () => {
      const { result } = renderHook(() => useFeedbackColors());

      // The current implementation only replaces the first underscore
      expect(result.current.formatStatus('in_progress_test')).toBe('in progress_test');
    });

    it('should handle status with multiple words', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current.formatStatus('awaiting_review')).toBe('awaiting review');
    });
  });

  describe('Return value structure', () => {
    it('should return all three utility functions', () => {
      const { result } = renderHook(() => useFeedbackColors());

      expect(result.current).toHaveProperty('getTypeColor');
      expect(result.current).toHaveProperty('getStatusColor');
      expect(result.current).toHaveProperty('formatStatus');

      expect(typeof result.current.getTypeColor).toBe('function');
      expect(typeof result.current.getStatusColor).toBe('function');
      expect(typeof result.current.formatStatus).toBe('function');
    });
  });

  describe('Integration scenarios', () => {
    it('should work correctly when all functions are used together', () => {
      const { result } = renderHook(() => useFeedbackColors());

      const type = 'feature';
      const status = 'in_progress';

      const typeColor = result.current.getTypeColor(type);
      const statusColor = result.current.getStatusColor(status);
      const formattedStatus = result.current.formatStatus(status);

      expect(typeColor).toBe('bg-blue-600');
      expect(statusColor).toBe('bg-orange-500');
      expect(formattedStatus).toBe('in progress');
    });

    it('should handle typical feedback workflow statuses', () => {
      const { result } = renderHook(() => useFeedbackColors());

      // Workflow: pending -> approved -> in_progress -> completed
      const statuses = ['pending', 'approved', 'in_progress', 'completed'];
      const colors = statuses.map(s => result.current.getStatusColor(s));

      expect(colors).toEqual([
        'bg-yellow-600',
        'bg-green-600',
        'bg-orange-500',
        'bg-blue-600',
      ]);
    });

    it('should handle all feedback types', () => {
      const { result } = renderHook(() => useFeedbackColors());

      const types = ['feature', 'bug', 'feedback'];
      const colors = types.map(t => result.current.getTypeColor(t));

      expect(colors).toEqual([
        'bg-blue-600',
        'bg-red-600',
        'bg-green-600',
      ]);
    });
  });
});
