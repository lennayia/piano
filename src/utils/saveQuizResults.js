import { supabase } from '../lib/supabase';
import { celebrate } from '../services/celebrationService';

/**
 * Uloží výsledky kvízu do databáze a aktualizuje statistiky uživatele
 * @param {string} quizType - Typ kvízu ('chord_quiz', 'theory_quiz', atd.)
 * @param {number} score - Počet správných odpovědí
 * @param {number} totalQuestions - Celkový počet otázek
 * @param {number} bestStreak - Nejlepší série správných odpovědí
 * @param {number} xpEarned - Získané XP body (DEPRECATED - již se nepoužívá, XP počítá celebrationService)
 * @returns {Promise<{success: boolean, error?: string, data?: Object}>}
 */
export const saveQuizResults = async (quizType, score, totalQuestions, bestStreak, xpEarned) => {
  try {
    // Získat aktuálního uživatele
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, error: 'Uživatel není přihlášen' };
    }

    // Použít centralizovaný celebration service
    const result = await celebrate({
      type: 'quiz',
      userId: user.id,
      itemId: quizType,
      itemTitle: `Kvíz: ${quizType}`,
      metadata: {
        score,
        totalQuestions,
        streak: bestStreak
      }
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Chyba při ukládání kvízu' };
    }

    // Vrátit výsledek včetně level-up informací
    return result;
  } catch (error) {
    console.error('Unexpected error in saveQuizResults:', error);
    return { success: false, error: 'Neočekávaná chyba' };
  }
};
