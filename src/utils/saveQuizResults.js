import { supabase } from '../lib/supabase';
import { celebrate } from '../services/celebrationService';

/**
 * Uloží výsledky kvízu do databáze a aktualizuje statistiky uživatele
 * @param {string} userId - ID uživatele
 * @param {string} quizType - Typ kvízu ('chord_quiz', 'theory_quiz', atd.)
 * @param {number} score - Počet správných odpovědí
 * @param {number} totalQuestions - Celkový počet otázek
 * @param {number} bestStreak - Nejlepší série správných odpovědí
 * @param {number} xpEarned - Získané XP body (DEPRECATED - již se nepoužívá, XP počítá celebrationService)
 * @param {boolean} isPerfect - Je kvíz bezchybný? (true = celebrate s odměnami, false = jen historie)
 * @returns {Promise<{success: boolean, error?: string, data?: Object}>}
 */
export const saveQuizResults = async (userId, quizType, score, totalQuestions, bestStreak, xpEarned, isPerfect = true) => {
  try {
    if (!userId) {
      return { success: false, error: 'Uživatel není přihlášen' };
    }

    // Pokud NENÍ bezchybný kvíz, uložit JEN do historie (bez XP a odměn)
    if (!isPerfect) {
      const { error } = await supabase
        .from('piano_quiz_scores')
        .insert({
          user_id: userId,
          quiz_type: quizType,
          score,
          total_questions: totalQuestions,
          streak: bestStreak,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Chyba při ukládání do historie:', error);
        return { success: false, error: 'Chyba při ukládání do historie' };
      }

      return { success: true, data: { historyOnly: true } };
    }

    // BEZCHYBNÝ kvíz: použít celebration service s odměnami
    const result = await celebrate({
      type: 'quiz',
      userId: userId,
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
