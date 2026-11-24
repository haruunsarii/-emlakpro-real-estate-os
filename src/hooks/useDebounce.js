import { useState, useEffect } from 'react';

/**
 * EmlakPro useDebounce Hook
 * Debounces a fast-changing value (such as search text or filter inputs)
 * by a specified delay in milliseconds, preventing excessive re-computations.
 *
 * @template T
 * @param {T} value - The input value to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {T} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

