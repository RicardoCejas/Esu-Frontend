import { useState, useEffect } from 'react';

/**
 * Hook para retrasar la actualización de un valor por N milisegundos.
 * Usado para optimizar búsquedas reactivas por DNI o texto y evitar saturación.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
