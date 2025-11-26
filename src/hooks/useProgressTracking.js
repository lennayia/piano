import { useState, useCallback } from 'react';

/**
 * Custom hook pro sledování pokroku (dokončených položek)
 * Použití: v kvízech, akordech, písničkách - kdekoli potřebujete počítat dokončené úkoly
 *
 * @returns {Object} - objekt s completedCount, incrementCompleted, resetProgress
 *
 * @example
 * const { completedCount, incrementCompleted, resetProgress } = useProgressTracking();
 *
 * // Při úspěšném dokončení:
 * incrementCompleted();
 *
 * // Pro reset (např. při změně filtru):
 * resetProgress();
 *
 * // V ProgressBar:
 * <ProgressBar current={completedCount} total={items.length} />
 */
function useProgressTracking() {
  const [completedCount, setCompletedCount] = useState(0);

  // Zvýšit počet dokončených o 1
  const incrementCompleted = useCallback(() => {
    setCompletedCount(prev => prev + 1);
  }, []);

  // Resetovat počet dokončených na 0
  const resetProgress = useCallback(() => {
    setCompletedCount(0);
  }, []);

  return {
    completedCount,
    incrementCompleted,
    resetProgress
  };
}

export default useProgressTracking;
