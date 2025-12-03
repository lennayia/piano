/**
 * Utility funkce pro lekce
 */

/**
 * Vrací CSS třídu pro badge podle obtížnosti lekce
 * @param {string} difficulty - Obtížnost lekce
 * @returns {string} CSS třída pro badge
 */
export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'začátečník':
      return 'badge-success';
    case 'mírně pokročilý začátečník':
      return 'badge-warning';
    case 'mírně pokročilý':
      return 'badge-primary';
    default:
      return '';
  }
}

/**
 * Konstanty pro obtížnost lekcí
 */
export const DIFFICULTY_OPTIONS = [
  { value: 'začátečník', label: 'začátečník' },
  { value: 'mírně pokročilý začátečník', label: 'mírně pokročilý začátečník' },
  { value: 'mírně pokročilý', label: 'mírně pokročilý' }
];

/**
 * Konstanty pro XP a časy
 */
export const LESSON_XP_REWARD = 50; // XP za dokončení lekce
export const MODAL_AUTO_CLOSE_DELAY = 2000; // Prodleva před automatickým zavřením modalu (ms)
