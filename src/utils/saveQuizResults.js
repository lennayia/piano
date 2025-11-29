import { supabase } from '../lib/supabase';

/**
 * Uloží výsledky kvízu do databáze a aktualizuje statistiky uživatele
 * @param {string} quizType - Typ kvízu ('chord_quiz', 'theory_quiz', atd.)
 * @param {number} score - Počet správných odpovědí
 * @param {number} totalQuestions - Celkový počet otázek
 * @param {number} bestStreak - Nejlepší série správných odpovědí
 * @param {number} xpEarned - Získané XP body
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveQuizResults = async (quizType, score, totalQuestions, bestStreak, xpEarned) => {
  try {
    // Získat aktuálního uživatele
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, error: 'Uživatel není přihlášen' };
    }

    // 1. Uložit výsledek kvízu do piano_quiz_scores
    const { error: scoreError } = await supabase
      .from('piano_quiz_scores')
      .insert({
        user_id: user.id,
        quiz_type: quizType,
        score: score,
        total_questions: totalQuestions,
        streak: bestStreak,
        completed_at: new Date().toISOString()
      });

    if (scoreError) {
      console.error('Error saving quiz score:', scoreError);
      return { success: false, error: 'Chyba při ukládání skóre' };
    }

    // 2. Načíst nebo vytvořit záznam v piano_user_stats
    const { data: existingStats, error: fetchError } = await supabase
      .from('piano_user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, což je OK pro nového uživatele
      console.error('Error fetching user stats:', fetchError);
      return { success: false, error: 'Chyba při načítání statistik' };
    }

    // 3. Aktualizovat nebo vytvořit statistiky
    const today = new Date().toISOString().split('T')[0];

    if (existingStats) {
      // Aktualizovat existující statistiky
      const newTotalXP = (existingStats.total_xp || 0) + xpEarned;
      const newLevel = calculateLevel(newTotalXP);

      // Aktualizovat streak pokud je to dnes
      const isToday = existingStats.last_activity_date === today;
      const newCurrentStreak = isToday ? existingStats.current_streak : 1;
      const newBestStreak = Math.max(existingStats.best_streak || 0, newCurrentStreak, bestStreak);

      const { error: updateError } = await supabase
        .from('piano_user_stats')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          current_streak: newCurrentStreak,
          best_streak: newBestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating user stats:', updateError);
        return { success: false, error: 'Chyba při aktualizaci statistik' };
      }
    } else {
      // Vytvořit nové statistiky pro nového uživatele
      const { error: insertError } = await supabase
        .from('piano_user_stats')
        .insert({
          user_id: user.id,
          total_xp: xpEarned,
          level: calculateLevel(xpEarned),
          current_streak: 1,
          best_streak: Math.max(1, bestStreak),
          last_activity_date: today,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting user stats:', insertError);
        return { success: false, error: 'Chyba při vytváření statistik' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in saveQuizResults:', error);
    return { success: false, error: 'Neočekávaná chyba' };
  }
};

/**
 * Vypočítá level na základě celkového XP
 * @param {number} totalXP - Celkové XP
 * @returns {number} Level
 */
const calculateLevel = (totalXP) => {
  if (totalXP >= 1000) return 5;
  if (totalXP >= 500) return 4;
  if (totalXP >= 250) return 3;
  if (totalXP >= 100) return 2;
  return 1;
};
