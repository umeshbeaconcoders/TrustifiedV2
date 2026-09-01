import { useEffect, useState } from 'react';

/** Debounces a value by `delayMs` — used for the Shop/Reports search inputs (~300ms per Section 5 of the instructions, matches the recent web fix). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
