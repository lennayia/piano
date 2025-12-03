import { useMemo } from 'react';
import { useResponsive } from './useResponsive';
import { getResponsiveValue } from '../utils/responsiveConstants';

/**
 * Hook pro získání responzivní hodnoty podle aktuální šířky okna
 *
 * @param {Object} values - Objekt s hodnotami pro různé breakpointy
 * @example
 * const padding = useResponsiveValue({
 *   xs: '0.5rem',
 *   sm: '0.75rem',
 *   lg: '1rem',
 *   default: '1.5rem'
 * });
 */
export function useResponsiveValue(values) {
  const { width } = useResponsive();

  return useMemo(() => {
    return getResponsiveValue(width, values);
  }, [width, values]);
}

export default useResponsiveValue;
