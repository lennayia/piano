import { celebrate } from './celebrationService';

/**
 * Konstanta pro XP odměnu za splnění denního cíle
 * DEPRECATED - XP hodnota se nyní načítá z xpRules
 */
export const DAILY_GOAL_XP_REWARD = 50;

/**
 * Uložit splnění denního cíle do databáze
 * Používá centralizovaný celebration service
 *
 * @param {number} userId - ID uživatele
 * @param {object} goalData - Data o splněném cíli { type, goalCount, completedCount, completedItems }
 * @returns {Promise<{success: boolean, xpEarned: number, newStreak: number}>}
 */
export async function saveDailyGoalCompletion(userId, goalData) {
  try {
    const { type, goalCount, completedCount } = goalData;

    // Použít centralizovaný celebration service
    const result = await celebrate({
      type: 'daily_goal',
      userId: userId,
      itemId: 'daily_goal',
      itemTitle: `Denní cíl: ${type}`,
      metadata: {
        goalType: type,
        goalCount,
        completedCount
      }
    });

    if (!result.success) {
      return {
        success: false,
        xpEarned: 0,
        newStreak: 0,
        bestStreak: 0,
        totalGoalsCompleted: 0
      };
    }

    // Vrátit výsledek včetně streak informací
    return {
      success: true,
      xpEarned: result.data.xpEarned,
      newStreak: result.data.dailyStreak || 0,
      bestStreak: result.data.bestDailyStreak || 0,
      totalGoalsCompleted: result.data.totalGoalsCompleted || 0,
      unlockedAchievements: result.data.unlockedAchievements || [],
      leveledUp: result.data.leveledUp,
      levelUpConfig: result.data.levelUpConfig,
      level: result.data.level,
      totalXP: result.data.totalXP
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
