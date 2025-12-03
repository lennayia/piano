import { useState, useEffect } from 'react';

/**
 * Custom hook pro správu denního cíle (daily goal)
 * Ukládá cíl a pokrok do localStorage, resetuje se o půlnoci
 *
 * @param {string} type - Typ aktivity ('lessons', 'songs', 'quizzes', 'harmonizations')
 * @param {function} onGoalCompleted - Callback volaný při splnění denního cíle
 * @returns {object} { dailyGoal, setDailyGoal, completedToday, markCompleted, progress, resetProgress, isGoalCompleted }
 */
export function useDailyGoal(type = 'lessons', onGoalCompleted) {
  const STORAGE_KEY = `dailyGoal_${type}`;
  const GOAL_COMPLETED_KEY = `dailyGoalCompleted_${type}`;

  const [dailyGoal, setDailyGoalState] = useState(0);
  const [completedToday, setCompletedToday] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [isGoalCompleted, setIsGoalCompleted] = useState(false);

  // Načíst data z localStorage při mount
  useEffect(() => {
    loadFromStorage();
  }, [type]);

  // Spočítat progress při změně dokončených položek nebo cíle
  useEffect(() => {
    if (dailyGoal > 0) {
      const progressPercentage = (completedToday.size / dailyGoal) * 100;
      setProgress(Math.min(progressPercentage, 100));
    } else {
      setProgress(0);
    }
  }, [completedToday, dailyGoal]);

  // Načíst z localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const goalCompletedStored = localStorage.getItem(GOAL_COMPLETED_KEY);

      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();

        // Pokud je jiný den, reset
        if (data.date !== today) {
          resetProgress();
        } else {
          setDailyGoalState(data.dailyGoal || 0);
          setCompletedToday(new Set(data.completedToday || []));
          setIsGoalCompleted(goalCompletedStored === today);
        }
      }
    } catch (error) {
      console.error('Chyba při načítání denního cíle:', error);
    }
  };

  // Uložit do localStorage
  const saveToStorage = (goal, completed) => {
    try {
      const data = {
        date: new Date().toDateString(),
        dailyGoal: goal,
        completedToday: Array.from(completed)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Chyba při ukládání denního cíle:', error);
    }
  };

  // Nastavit denní cíl
  const setDailyGoal = (value) => {
    const goal = parseInt(value) || 0;
    setDailyGoalState(goal);
    saveToStorage(goal, completedToday);
  };

  // Označit položku jako dokončenou (jen 1x za den)
  const markCompleted = (itemId) => {
    if (!completedToday.has(itemId)) {
      const newCompleted = new Set(completedToday);
      newCompleted.add(itemId);
      setCompletedToday(newCompleted);
      saveToStorage(dailyGoal, newCompleted);

      // Zkontrolovat, jestli jsme právě splnili cíl
      if (dailyGoal > 0 && newCompleted.size === dailyGoal && !isGoalCompleted) {
        setIsGoalCompleted(true);
        localStorage.setItem(GOAL_COMPLETED_KEY, new Date().toDateString());

        // Zavolat callback
        if (onGoalCompleted) {
          onGoalCompleted({
            type,
            goalCount: dailyGoal,
            completedCount: newCompleted.size,
            completedItems: Array.from(newCompleted)
          });
        }
      }
    }
  };

  // Reset pokroku (nový den)
  const resetProgress = () => {
    setDailyGoalState(0);
    setCompletedToday(new Set());
    setProgress(0);
    setIsGoalCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GOAL_COMPLETED_KEY);
  };

  return {
    dailyGoal,
    setDailyGoal,
    completedToday: completedToday.size, // Vrátit count místo Set
    completedItems: completedToday, // Pro kontrolu, jestli je položka dokončená
    markCompleted,
    progress,
    resetProgress,
    isGoalCompleted // Jestli už byl dnes cíl splněn
  };
}

export default useDailyGoal;
