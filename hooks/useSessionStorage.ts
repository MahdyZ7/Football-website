import { useCallback, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

interface UseSessionStorageReturn<T> {
  storedValue: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  clearValue: () => void;
  isInitialized: boolean;
  hasStoredValue: boolean;
}

const keyListeners = new Map<string, Set<() => void>>();

function subscribeToKey(key: string, callback: () => void) {
  let set = keyListeners.get(key);
  if (!set) {
    set = new Set();
    keyListeners.set(key, set);
  }
  set.add(callback);

  const onStorage = (e: StorageEvent) => {
    if (e.key === key && e.storageArea === sessionStorage) callback();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    set!.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function notifyKey(key: string) {
  keyListeners.get(key)?.forEach((cb) => cb());
}

function readRaw(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading sessionStorage key "${key}":`, error);
    return null;
  }
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): UseSessionStorageReturn<T> {
  const subscribe = useCallback(
    (callback: () => void) => subscribeToKey(key, callback),
    [key]
  );
  const getSnapshot = useCallback(() => readRaw(key), [key]);
  const getServerSnapshot = useCallback(() => null, []);

  const rawItem = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let storedValue: T = initialValue;
  if (rawItem != null) {
    try {
      storedValue = JSON.parse(rawItem) as T;
    } catch (error) {
      console.error(`Error parsing sessionStorage key "${key}":`, error);
    }
  }

  // `useSyncExternalStore` with a constant getServerSnapshot returns false during
  // SSR/initial hydration render and true after commit — no effect needed.
  const isInitialized = useSyncExternalStore(emptySubscribe, getTrue, getFalse);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const current = (() => {
          const raw = readRaw(key);
          if (raw == null) return initialValue;
          try {
            return JSON.parse(raw) as T;
          } catch {
            return initialValue;
          }
        })();
        const next =
          typeof value === 'function'
            ? (value as (prev: T) => T)(current)
            : value;
        sessionStorage.setItem(key, JSON.stringify(next));
        notifyKey(key);
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  const clearValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      notifyKey(key);
    } catch (error) {
      console.error(`Error clearing sessionStorage key "${key}":`, error);
    }
  }, [key]);

  return {
    storedValue,
    setValue,
    clearValue,
    isInitialized,
    hasStoredValue: rawItem != null,
  };
}

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
