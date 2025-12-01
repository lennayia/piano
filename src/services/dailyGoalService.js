import { supabase } from '../lib/supabase';

/**
 * Konstanta pro XP odměnu za splnění denního cíle
 */
export const DAILY_GOAL_XP_REWARD = 50;

/**
 * Zkontroluje a odemkne achievements pro denní cíle
 */
async function checkDailyGoalAchievements(userId, stats) {
  // Získat všechny achievements pro denní cíle
  const { data: achievements, error } = await supabase
    .from('piano_achievements')
    .select('*')
    .in('requirement_type', ['daily_goals_completed', 'daily_goal_streak'])
    .eq('is_active', true);

  if (error) {
    console.error('Chyba při načítání achievements:', error);
    return [];
  }

  // Získat již odemčené achievements
  const { data: unlocked } = await supabase
    .from('piano_user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = new Set((unlocked || []).map(a => a.achievement_id));
  const newlyUnlocked = [];

  // Zkontrolovat každý achievement
  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    if (achievement.requirement_type === 'daily_goals_completed') {
      shouldUnlock = (stats.daily_goals_completed || 0) >= achievement.requirement_value;
    } else if (achievement.requirement_type === 'daily_goal_streak') {
      shouldUnlock = (stats.daily_goal_streak || 0) >= achievement.requirement_value;
    }

    if (shouldUnlock) {
      const { error: unlockError } = await supabase
        .from('piano_user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString()
        });

      if (!unlockError) {
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Uložit splnění denního cíle do databáze
 *
 * @param {number} userId - ID uživatele
 * @param {object} goalData - Data o splněném cíli { type, goalCount, completedCount, completedItems }
 * @returns {Promise<{success: boolean, xpEarned: number, newStreak: number}>}
 */
export async function saveDailyGoalCompletion(userId, goalData) {
  try {
    const { type, goalCount, completedCount } = goalData;

    // 1. Uložit do historie
    const { error: historyError } = await supabase
      .from('piano_daily_goal_completions')
      .insert([{
        user_id: userId,
        goal_type: type,
        goal_count: goalCount,
        completed_count: completedCount,
        xp_earned: DAILY_GOAL_XP_REWARD
      }]);

    if (historyError) {
      console.error('Chyba při ukládání historie denního cíle:', historyError);
      return { success: false, xpEarned: 0, newStreak: 0 };
    }

    // 2. Načíst aktuální statistiky
    const { data: stats, error: statsError } = await supabase
      .from('piano_user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError || !stats) {
      console.error('Chyba při načítání statistik:', statsError);
      return { success: false, xpEarned: 0, newStreak: 0 };
    }

    // 3. Spočítat novou sérii (streak)
    const today = new Date().toDateString();
    const lastCompletedDate = stats.last_goal_completed_date
      ? new Date(stats.last_goal_completed_date).toDateString()
      : null;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    let newStreak = 1;
    if (lastCompletedDate === yesterdayString) {
      // Pokračování série
      newStreak = (stats.daily_goal_streak || 0) + 1;
    } else if (lastCompletedDate !== today) {
      // Nová série (nebo přerušená)
      newStreak = 1;
    } else {
      // Už bylo dnes splněno (nemělo by nastat, ale pro jistotu)
      newStreak = stats.daily_goal_streak || 1;
    }

    const bestStreak = Math.max(stats.best_daily_goal_streak || 0, newStreak);

    // 4. Aktualizovat statistiky
    const { error: updateError } = await supabase
      .from('piano_user_stats')
      .update({
        daily_goals_completed: (stats.daily_goals_completed || 0) + 1,
        daily_goal_streak: newStreak,
        best_daily_goal_streak: bestStreak,
        last_goal_completed_date: new Date().toISOString().split('T')[0],
        total_xp: (stats.total_xp || 0) + DAILY_GOAL_XP_REWARD,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Chyba při aktualizaci statistik:', updateError);
      return { success: false, xpEarned: 0, newStreak: 0 };
    }

    // 5. Zkontrolovat achievements
    const updatedStats = {
      daily_goals_completed: (stats.daily_goals_completed || 0) + 1,
      daily_goal_streak: newStreak,
      best_daily_goal_streak: bestStreak
    };
    const unlockedAchievements = await checkDailyGoalAchievements(userId, updatedStats);

    return {
      success: true,
      xpEarned: DAILY_GOAL_XP_REWARD,
      newStreak,
      bestStreak,
      totalGoalsCompleted: (stats.daily_goals_completed || 0) + 1,
      unlockedAchievements
    };

  } catch (error) {
    console.error('Chyba při ukládání denního cíle:', error);
    return { success: false, xpEarned: 0, newStreak: 0 };
  }
}

/**
 * Načíst historii denních cílů pro uživatele
 *
 * @param {number} userId - ID uživatele
 * @param {number} limit - Kolik záznamů načíst (default: 30)
 * @returns {Promise<Array>} - Seznam dokončených denních cílů
 */
export async function getDailyGoalHistory(userId, limit = 30) {
  try {
    const { data, error } = await supabase
      .from('piano_daily_goal_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Chyba při načítání historie:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Chyba při načítání historie:', error);
    return [];
  }
}
