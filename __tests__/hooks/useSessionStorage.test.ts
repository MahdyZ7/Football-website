/**
 * Tests for useSessionStorage hook
 * Validates session storage persistence, initialization, and error handling
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionStorage, useSessionStorageTuple } from '@/hooks/useSessionStorage';

describe('useSessionStorage', () => {
  let mockSessionStorage: Storage;

  beforeEach(() => {
    // Create mock sessionStorage
    const store: Record<string, string> = {};
    mockSessionStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
    };

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default value when no stored value exists', async () => {
      const { result } = renderHook(() =>
        useSessionStorage('test-key', 'default-value')
      );

      // Initial render before useEffect runs
      expect(result.current.storedValue).toBe('default-value');

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.hasStoredValue).toBe(false);
    });

    it('should load stored value from sessionStorage on mount', async () => {
      sessionStorage.setItem('test-key', JSON.stringify('stored-value'));

      const { result } = renderHook(() =>
        useSessionStorage('test-key', 'default-value')
      );

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.storedValue).toBe('stored-value');
      expect(result.current.hasStoredValue).toBe(true);
    });

    it('should handle complex objects', async () => {
      const complexObject = { name: 'Test', count: 42, nested: { value: true } };
      sessionStorage.setItem('complex-key', JSON.stringify(complexObject));

      const { result } = renderHook(() =>
        useSessionStorage('complex-key', { name: '', count: 0, nested: { value: false } })
      );

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.storedValue).toEqual(complexObject);
    });

    it('should handle arrays', async () => {
      const arrayValue = [1, 2, 3, 4, 5];
      sessionStorage.setItem('array-key', JSON.stringify(arrayValue));

      const { result } = renderHook(() => useSessionStorage('array-key', [] as number[]));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.storedValue).toEqual(arrayValue);
    });
  });

  describe('setValue', () => {
    it('should update value and save to sessionStorage', async () => {
      const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setValue('updated');
      });

      expect(result.current.storedValue).toBe('updated');
      await waitFor(() => {
        expect(sessionStorage.setItem).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify('updated')
        );
      });
    });

    it('should support updater function', async () => {
      const { result } = renderHook(() => useSessionStorage('counter', 0));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setValue((prev: number) => prev + 1);
      });

      expect(result.current.storedValue).toBe(1);

      act(() => {
        result.current.setValue((prev: number) => prev + 5);
      });

      expect(result.current.storedValue).toBe(6);
    });

    it('should save initial value to sessionStorage after initialization', async () => {
      const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // After initialization, the hook should save the initial value to sessionStorage
      await waitFor(() => {
        expect(sessionStorage.setItem).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify('initial')
        );
      });
    });
  });

  describe('clearValue', () => {
    it('should remove value from sessionStorage and reset to initial value', async () => {
      sessionStorage.setItem('test-key', JSON.stringify('stored'));

      const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.storedValue).toBe('stored');

      act(() => {
        result.current.clearValue();
      });

      expect(result.current.storedValue).toBe('initial');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('Error handling', () => {
    it('should handle JSON parse errors gracefully', async () => {
      sessionStorage.setItem('bad-key', 'not-valid-json{');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useSessionStorage('bad-key', 'default'));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Should fall back to default value
      expect(result.current.storedValue).toBe('default');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle sessionStorage.getItem errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useSessionStorage('test-key', 'default'));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.storedValue).toBe('default');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle sessionStorage.setItem errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setValue('new-value');
      });

      // Value should still update in state
      expect(result.current.storedValue).toBe('new-value');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Re-initialization with different keys', () => {
    it('should load correct value when key changes', async () => {
      sessionStorage.setItem('key1', JSON.stringify('value1'));
      sessionStorage.setItem('key2', JSON.stringify('value2'));

      const { result, rerender } = renderHook(
        ({ key }) => useSessionStorage(key, 'default'),
        { initialProps: { key: 'key1' } }
      );

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.storedValue).toBe('value1');

      rerender({ key: 'key2' });

      await waitFor(() => {
        expect(result.current.storedValue).toBe('value2');
      });
    });
  });
});

describe('useSessionStorageTuple', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    const mockSessionStorage: Storage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
  });

  it('should return tuple with [value, setValue, clearValue, isInitialized]', async () => {
    const { result } = renderHook(() =>
      useSessionStorageTuple('test-key', 'initial')
    );

    await waitFor(() => {
      expect(result.current[3]).toBe(true); // isInitialized
    });

    const [value, setValue, clearValue, isInitialized] = result.current;

    expect(value).toBe('initial');
    expect(typeof setValue).toBe('function');
    expect(typeof clearValue).toBe('function');
    expect(isInitialized).toBe(true);
  });

  it('should work with tuple destructuring', async () => {
    const { result } = renderHook(() =>
      useSessionStorageTuple('count', 0)
    );

    await waitFor(() => {
      expect(result.current[3]).toBe(true);
    });

    act(() => {
      result.current[1](5); // setValue(5)
    });

    expect(result.current[0]).toBe(5);

    act(() => {
      result.current[2](); // clearValue()
    });

    expect(result.current[0]).toBe(0);
  });
});
