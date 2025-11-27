/**
 * Tests for useConfirmDialog hook
 * Validates confirmation dialog state management
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useConfirmDialog, ConfirmDialogState } from '@/hooks/useConfirmDialog';

describe('useConfirmDialog', () => {
  describe('Initial state', () => {
    it('should initialize with closed dialog', () => {
      const { result } = renderHook(() => useConfirmDialog());

      expect(result.current.confirmDialog).toEqual({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: expect.any(Function),
        type: 'danger',
      });
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useConfirmDialog());

      expect(typeof result.current.showConfirm).toBe('function');
      expect(typeof result.current.closeConfirm).toBe('function');
      expect(typeof result.current.handleConfirm).toBe('function');
    });
  });

  describe('showConfirm', () => {
    it('should open dialog with provided configuration', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockOnConfirm = jest.fn();

      act(() => {
        result.current.showConfirm({
          title: 'Delete User',
          message: 'Are you sure you want to delete this user?',
          onConfirm: mockOnConfirm,
          type: 'danger',
        });
      });

      expect(result.current.confirmDialog).toEqual({
        isOpen: true,
        title: 'Delete User',
        message: 'Are you sure you want to delete this user?',
        onConfirm: mockOnConfirm,
        type: 'danger',
      });
    });

    it('should handle warning type dialog', () => {
      const { result } = renderHook(() => useConfirmDialog());

      act(() => {
        result.current.showConfirm({
          title: 'Warning',
          message: 'This action cannot be undone',
          onConfirm: jest.fn(),
          type: 'warning',
        });
      });

      expect(result.current.confirmDialog.type).toBe('warning');
      expect(result.current.confirmDialog.isOpen).toBe(true);
    });

    it('should handle info type dialog', () => {
      const { result } = renderHook(() => useConfirmDialog());

      act(() => {
        result.current.showConfirm({
          title: 'Information',
          message: 'Please confirm this action',
          onConfirm: jest.fn(),
          type: 'info',
        });
      });

      expect(result.current.confirmDialog.type).toBe('info');
      expect(result.current.confirmDialog.isOpen).toBe(true);
    });

    it('should allow dialog without type (defaults to danger)', () => {
      const { result } = renderHook(() => useConfirmDialog());

      act(() => {
        result.current.showConfirm({
          title: 'Confirm',
          message: 'Continue?',
          onConfirm: jest.fn(),
        });
      });

      expect(result.current.confirmDialog.isOpen).toBe(true);
      expect(result.current.confirmDialog.title).toBe('Confirm');
      expect(result.current.confirmDialog.message).toBe('Continue?');
    });

    it('should allow opening new dialog while one is open', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const firstConfirm = jest.fn();
      const secondConfirm = jest.fn();

      act(() => {
        result.current.showConfirm({
          title: 'First Dialog',
          message: 'First message',
          onConfirm: firstConfirm,
        });
      });

      expect(result.current.confirmDialog.title).toBe('First Dialog');

      act(() => {
        result.current.showConfirm({
          title: 'Second Dialog',
          message: 'Second message',
          onConfirm: secondConfirm,
        });
      });

      // Should replace first dialog with second
      expect(result.current.confirmDialog.title).toBe('Second Dialog');
      expect(result.current.confirmDialog.message).toBe('Second message');
      expect(result.current.confirmDialog.onConfirm).toBe(secondConfirm);
    });
  });

  describe('closeConfirm', () => {
    it('should close the dialog', () => {
      const { result } = renderHook(() => useConfirmDialog());

      act(() => {
        result.current.showConfirm({
          title: 'Test',
          message: 'Test message',
          onConfirm: jest.fn(),
        });
      });

      expect(result.current.confirmDialog.isOpen).toBe(true);

      act(() => {
        result.current.closeConfirm();
      });

      expect(result.current.confirmDialog.isOpen).toBe(false);
    });

    it('should preserve dialog data when closing', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockOnConfirm = jest.fn();

      act(() => {
        result.current.showConfirm({
          title: 'Delete User',
          message: 'Are you sure?',
          onConfirm: mockOnConfirm,
          type: 'danger',
        });
      });

      act(() => {
        result.current.closeConfirm();
      });

      // Dialog should be closed but data preserved
      expect(result.current.confirmDialog).toEqual({
        isOpen: false,
        title: 'Delete User',
        message: 'Are you sure?',
        onConfirm: mockOnConfirm,
        type: 'danger',
      });
    });

    it('should handle closing already closed dialog', () => {
      const { result } = renderHook(() => useConfirmDialog());

      expect(result.current.confirmDialog.isOpen).toBe(false);

      act(() => {
        result.current.closeConfirm();
      });

      expect(result.current.confirmDialog.isOpen).toBe(false);
    });
  });

  describe('handleConfirm', () => {
    it('should execute onConfirm callback and close dialog', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockOnConfirm = jest.fn();

      act(() => {
        result.current.showConfirm({
          title: 'Delete',
          message: 'Confirm delete?',
          onConfirm: mockOnConfirm,
        });
      });

      expect(result.current.confirmDialog.isOpen).toBe(true);

      act(() => {
        result.current.handleConfirm();
      });

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(result.current.confirmDialog.isOpen).toBe(false);
    });

    it('should execute onConfirm callback with no parameters', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockOnConfirm = jest.fn();

      act(() => {
        result.current.showConfirm({
          title: 'Test',
          message: 'Test',
          onConfirm: mockOnConfirm,
        });
      });

      act(() => {
        result.current.handleConfirm();
      });

      expect(mockOnConfirm).toHaveBeenCalledWith();
    });

    it('should handle async onConfirm callback', async () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockAsyncConfirm = jest.fn().mockResolvedValue('success');

      act(() => {
        result.current.showConfirm({
          title: 'Async Action',
          message: 'Confirm async?',
          onConfirm: mockAsyncConfirm,
        });
      });

      act(() => {
        result.current.handleConfirm();
      });

      expect(mockAsyncConfirm).toHaveBeenCalled();
      expect(result.current.confirmDialog.isOpen).toBe(false);
    });

    it('should throw if onConfirm throws an error', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockOnConfirm = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      act(() => {
        result.current.showConfirm({
          title: 'Error Test',
          message: 'Will error',
          onConfirm: mockOnConfirm,
        });
      });

      expect(() => {
        act(() => {
          result.current.handleConfirm();
        });
      }).toThrow('Test error');

      // Dialog remains open if callback throws (closeConfirm is not called)
      expect(result.current.confirmDialog.isOpen).toBe(true);
    });

    it('should call current onConfirm, not the original', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const firstConfirm = jest.fn();
      const secondConfirm = jest.fn();

      act(() => {
        result.current.showConfirm({
          title: 'First',
          message: 'First',
          onConfirm: firstConfirm,
        });
      });

      // Replace with new dialog before confirming
      act(() => {
        result.current.showConfirm({
          title: 'Second',
          message: 'Second',
          onConfirm: secondConfirm,
        });
      });

      act(() => {
        result.current.handleConfirm();
      });

      expect(firstConfirm).not.toHaveBeenCalled();
      expect(secondConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      const { result } = renderHook(() => useConfirmDialog());

      act(() => {
        result.current.showConfirm({
          title: '',
          message: '',
          onConfirm: jest.fn(),
        });
      });

      expect(result.current.confirmDialog.title).toBe('');
      expect(result.current.confirmDialog.message).toBe('');
      expect(result.current.confirmDialog.isOpen).toBe(true);
    });

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const longMessage = 'A'.repeat(10000);

      act(() => {
        result.current.showConfirm({
          title: 'Long Message',
          message: longMessage,
          onConfirm: jest.fn(),
        });
      });

      expect(result.current.confirmDialog.message).toBe(longMessage);
    });

    it('should handle special characters in title and message', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const specialTitle = '<script>alert("XSS")</script>';
      const specialMessage = 'Special chars: @#$%^&*()';

      act(() => {
        result.current.showConfirm({
          title: specialTitle,
          message: specialMessage,
          onConfirm: jest.fn(),
        });
      });

      expect(result.current.confirmDialog.title).toBe(specialTitle);
      expect(result.current.confirmDialog.message).toBe(specialMessage);
    });
  });

  describe('Integration scenarios', () => {
    it('should support complete dialog workflow: open -> confirm -> close', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockAction = jest.fn();

      // Initial state
      expect(result.current.confirmDialog.isOpen).toBe(false);

      // Open dialog
      act(() => {
        result.current.showConfirm({
          title: 'Delete User',
          message: 'This will permanently delete the user',
          onConfirm: mockAction,
          type: 'danger',
        });
      });

      expect(result.current.confirmDialog.isOpen).toBe(true);

      // Confirm action
      act(() => {
        result.current.handleConfirm();
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
      expect(result.current.confirmDialog.isOpen).toBe(false);
    });

    it('should support cancel workflow: open -> close', () => {
      const { result } = renderHook(() => useConfirmDialog());

      const mockAction = jest.fn();

      // Open dialog
      act(() => {
        result.current.showConfirm({
          title: 'Delete User',
          message: 'Are you sure?',
          onConfirm: mockAction,
        });
      });

      expect(result.current.confirmDialog.isOpen).toBe(true);

      // User cancels (closes without confirming)
      act(() => {
        result.current.closeConfirm();
      });

      expect(mockAction).not.toHaveBeenCalled();
      expect(result.current.confirmDialog.isOpen).toBe(false);
    });
  });
});
