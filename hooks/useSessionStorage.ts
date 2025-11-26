import { useState, useEffect } from 'react';

/**
 * Custom hook for session storage persistence
 * Single Responsibility: Manage state persistence in sessionStorage
 *
 * Handles:
 * - Loading state from sessionStorage on mount
 * - Saving state to sessionStorage on changes
 * - JSON serialization/deserialization
 * - Initialization tracking to prevent premature saves
 * - Clear functionality to remove stored data
 *
 * This is a REUSABLE hook that can be used across the entire app
 * for any data that needs to persist across page refreshes.
 *
 * Extracted from TeamsImproved component to create a generic utility
 */

interface UseSessionStorageReturn<T> {
  storedValue: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  clearValue: () => void;
  isInitialized: boolean;
  hasStoredValue: boolean;
}

/**
 * Generic session storage hook with TypeScript support
 *
 * @param key - The sessionStorage key to use
 * @param initialValue - Default value if no stored value exists
 * @returns Tuple of [storedValue, setValue, clearValue, isInitialized]
 *
 * @example
 * const { storedValue, setValue, clearValue } = useSessionStorage('myKey', { count: 0 });
 *
 * // Update value
 * setValue({ count: 1 });
 *
 * // Clear storage
 * clearValue();
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): UseSessionStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasStoredValue, setHasStoredValue] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as T;
        setStoredValue(parsed);
        setHasStoredValue(true);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error(`Error loading sessionStorage key "${key}":`, error);
      setIsInitialized(true);
    }
  }, [key]);

  // Save to sessionStorage whenever value changes (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const valueToStore = JSON.stringify(storedValue);
      sessionStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error saving to sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue, isInitialized]);

  /**
   * Update the stored value
   * Supports both direct values and updater functions
   */
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  };

  /**
   * Clear the stored value from sessionStorage
   * Resets to initial value
   */
  const clearValue = () => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error clearing sessionStorage key "${key}":`, error);
    }
  };

  return {
    storedValue,
    setValue,
    clearValue,
    isInitialized,
    hasStoredValue,
  };
}

/**
 * Alternative API that matches React.useState signature more closely
 * Returns a tuple instead of an object
 *
 * @example
 * const [value, setValue, clearValue] = useSessionStorageTuple('myKey', 0);
 */
export function useSessionStorageTuple<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void, boolean] {
  const { storedValue, setValue, clearValue, isInitialized } = useSessionStorage(
    key,
    initialValue
  );
  return [storedValue, setValue, clearValue, isInitialized];
}
