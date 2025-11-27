/**
 * Tests for useToastNotifications hook
 * Validates toast notification management, auto-dismiss, and manual removal
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useToastNotifications } from '@/hooks/useToastNotifications';

describe('useToastNotifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToastNotifications());

      expect(result.current.toasts).toEqual([]);
      expect(typeof result.current.showToast).toBe('function');
      expect(typeof result.current.removeToast).toBe('function');
    });
  });

  describe('showToast', () => {
    it('should add a new toast with default type "info"', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Test message',
        type: 'info',
      });
      expect(result.current.toasts[0].id).toBeDefined();
    });

    it('should add a success toast', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Success!', 'success');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Success!',
        type: 'success',
      });
    });

    it('should add an error toast', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Error occurred', 'error');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Error occurred',
        type: 'error',
      });
    });

    it('should add multiple toasts', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('First toast', 'info');
        result.current.showToast('Second toast', 'success');
        result.current.showToast('Third toast', 'error');
      });

      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts[0].message).toBe('First toast');
      expect(result.current.toasts[1].message).toBe('Second toast');
      expect(result.current.toasts[2].message).toBe('Third toast');
    });

    it('should generate unique IDs for each toast', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Toast 1');
        // Advance time by 1ms to ensure different Date.now() value
        jest.advanceTimersByTime(1);
        result.current.showToast('Toast 2');
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
    });
  });

  describe('Auto-dismiss', () => {
    it('should automatically remove toast after 4 seconds', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Auto-dismiss test');
      });

      expect(result.current.toasts).toHaveLength(1);

      // Advance time by 3.9 seconds (should still be visible)
      act(() => {
        jest.advanceTimersByTime(3900);
      });

      expect(result.current.toasts).toHaveLength(1);

      // Advance time by another 0.2 seconds (total 4.1s, should be dismissed)
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should auto-dismiss multiple toasts independently', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('First');
      });

      // Wait 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.showToast('Second');
      });

      // Wait 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.showToast('Third');
      });

      // At this point:
      // - First toast has been visible for 2s
      // - Second toast has been visible for 1s
      // - Third toast just appeared
      expect(result.current.toasts).toHaveLength(3);

      // Advance 2 more seconds (total 4s for first toast)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // First toast should be dismissed
      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts.find((t: { message: string }) => t.message === 'First')).toBeUndefined();

      // Advance 1 more second (total 4s for second toast)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Second toast should be dismissed
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Third');

      // Advance 1 more second (total 4s for third toast)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // All toasts dismissed
      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('removeToast', () => {
    it('should manually remove a specific toast by ID', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Toast 1');
        jest.advanceTimersByTime(1);
        result.current.showToast('Toast 2');
        jest.advanceTimersByTime(1);
        result.current.showToast('Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      const secondToastId = result.current.toasts[1].id;

      act(() => {
        result.current.removeToast(secondToastId);
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts.find((t: { id: number }) => t.id === secondToastId)).toBeUndefined();
      expect(result.current.toasts[0].message).toBe('Toast 1');
      expect(result.current.toasts[1].message).toBe('Toast 3');
    });

    it('should handle removing non-existent toast ID gracefully', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Test toast');
      });

      expect(result.current.toasts).toHaveLength(1);

      // Try to remove a toast with non-existent ID
      act(() => {
        result.current.removeToast(999999);
      });

      // Should still have the original toast
      expect(result.current.toasts).toHaveLength(1);
    });

    it('should allow manual removal before auto-dismiss', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('Manual removal test');
      });

      const toastId = result.current.toasts[0].id;

      // Manually remove after 2 seconds (before auto-dismiss at 4s)
      act(() => {
        jest.advanceTimersByTime(2000);
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);

      // Advance to when auto-dismiss would have triggered
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should still be empty (no error from trying to remove already-removed toast)
      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('Callback stability', () => {
    it('should maintain stable showToast reference across renders', () => {
      const { result, rerender } = renderHook(() => useToastNotifications());

      const firstShowToast = result.current.showToast;

      // Trigger a re-render by adding a toast
      act(() => {
        result.current.showToast('Test');
      });

      rerender();

      const secondShowToast = result.current.showToast;

      expect(firstShowToast).toBe(secondShowToast);
    });

    it('should maintain stable removeToast reference across renders', () => {
      const { result, rerender } = renderHook(() => useToastNotifications());

      const firstRemoveToast = result.current.removeToast;

      // Trigger a re-render by adding a toast
      act(() => {
        result.current.showToast('Test');
      });

      rerender();

      const secondRemoveToast = result.current.removeToast;

      expect(firstRemoveToast).toBe(secondRemoveToast);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast('');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('');
    });

    it('should handle long messages', () => {
      const { result } = renderHook(() => useToastNotifications());

      const longMessage = 'A'.repeat(1000);

      act(() => {
        result.current.showToast(longMessage);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe(longMessage);
    });

    it('should handle rapid successive toast additions', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.showToast(`Toast ${i}`);
          // Advance time by 1ms to ensure unique IDs
          jest.advanceTimersByTime(1);
        }
      });

      expect(result.current.toasts).toHaveLength(10);

      // All should have unique IDs
      const ids = result.current.toasts.map((t: { id: number }) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });
});
