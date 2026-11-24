import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Pure helper to read safely from localStorage or return fallback
 */
function getStoredValue(key, fallbackValue, legacyKey, migrate) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    const legacyRaw = !raw && legacyKey ? window.localStorage.getItem(legacyKey) : null;
    const targetStr = raw || legacyRaw;

    if (targetStr !== null) {
      let parsed = JSON.parse(targetStr);
      if (migrate && typeof migrate === 'function') {
        parsed = migrate(parsed);
      }
      return parsed;
    }
  } catch (error) {
    console.warn(`[useLocalStorage] "${key}" okunamadı veya JSON geçersiz, varsayılan değer kullanılıyor:`, error);
  }

  return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
}

/**
 * EmlakPro Central useLocalStorage Hook
 * Provides safe, synchronized, and resilient persistence across components, tabs,
 * and custom EmlakPro backup/restore/reset events.
 *
 * @template T
 * @param {string} key - localStorage key (e.g. 'emlakpro_properties_v1')
 * @param {T | (() => T)} initialValue - Default fallback if key is empty or invalid
 * @param {Object} [options] - Optional configurations
 * @param {string} [options.legacyKey] - Optional legacy fallback key (e.g. 'emlakpro_customers')
 * @param {boolean} [options.syncOnFocus=true] - Whether to re-sync when window regains focus
 * @param {(parsed: any) => T} [options.migrate] - Optional migration transformer
 * @returns {[T, (value: T | ((prev: T) => T)) => void, () => void]}
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { legacyKey, syncOnFocus = true, migrate } = options;

  // React state initialized synchronously from localStorage
  const [storedValue, setStoredValue] = useState(() =>
    getStoredValue(key, initialValue, legacyKey, migrate)
  );

  // References updated safely in effects to avoid render-phase ref access
  const initialValueRef = useRef(initialValue);
  const migrateRef = useRef(migrate);
  const valueRef = useRef(storedValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
    migrateRef.current = migrate;
    valueRef.current = storedValue;
  }, [initialValue, migrate, storedValue]);

  // Safe read function
  const readValue = useCallback(() => {
    return getStoredValue(key, initialValueRef.current, legacyKey, migrateRef.current);
  }, [key, legacyKey]);

  // Safe write function
  const setValue = useCallback(
    (value) => {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      try {
        const previousValue = valueRef.current;
        const newValue = typeof value === 'function' ? value(previousValue) : value;
        const newStr = JSON.stringify(newValue);
        const currentStr = window.localStorage.getItem(key);
        const prevStr = JSON.stringify(previousValue);

        // Avoid redundant writes if serialization matches both storage and ref
        if (newStr === currentStr && newStr === prevStr) {
          return;
        }

        // Update ref immediately so that synchronous events dispatched below do not re-trigger this hook
        valueRef.current = newValue;

        // Update React state with pure value (side-effect free)
        setStoredValue(newValue);

        // Persist to localStorage and dispatch event for same-tab siblings
        if (currentStr !== newStr) {
          window.localStorage.setItem(key, newStr);

          // Dispatch custom event so sibling components update immediately
          window.dispatchEvent(
            new CustomEvent('emlakpro_local_storage_sync', {
              detail: { key, newValue },
            })
          );
        }
      } catch (error) {
        console.error(`[useLocalStorage] "${key}" değerini kaydederken hata oluştu:`, error);
      }
    },
    [key]
  );

  // Safe remove function
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      window.localStorage.removeItem(key);
      const fallback =
        typeof initialValueRef.current === 'function'
          ? initialValueRef.current()
          : initialValueRef.current;
      valueRef.current = fallback;
      setStoredValue(fallback);
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key, newValue: fallback },
        })
      );
    } catch (error) {
      console.error(`[useLocalStorage] "${key}" silinirken hata:`, error);
    }
  }, [key]);

  // Synchronize across components in the same window, other tabs, and system reset/restore events
  useEffect(() => {
    const handleSync = (e) => {
      // Check if event targets this key (or is a broad restore/reset event)
      if (e?.type === 'emlakpro_local_storage_sync') {
        if (e.detail?.key === key) {
          const nextVal = e.detail.newValue;
          if (JSON.stringify(valueRef.current) !== JSON.stringify(nextVal)) {
            valueRef.current = nextVal;
            setStoredValue(nextVal);
          }
        }
        return;
      }

      if (e?.type === 'storage' && e.key && e.key !== key) {
        return; // Irrelevant key from another tab
      }

      // Re-read current value from localStorage
      const nextVal = readValue();
      if (JSON.stringify(valueRef.current) !== JSON.stringify(nextVal)) {
        valueRef.current = nextVal;
        setStoredValue(nextVal);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('emlakpro_local_storage_sync', handleSync);
    window.addEventListener('emlakpro_data_restored', handleSync);
    window.addEventListener('emlakpro_data_reset', handleSync);

    if (syncOnFocus) {
      window.addEventListener('focus', handleSync);
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('emlakpro_local_storage_sync', handleSync);
      window.removeEventListener('emlakpro_data_restored', handleSync);
      window.removeEventListener('emlakpro_data_reset', handleSync);
      if (syncOnFocus) {
        window.removeEventListener('focus', handleSync);
      }
    };
  }, [key, readValue, syncOnFocus]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
