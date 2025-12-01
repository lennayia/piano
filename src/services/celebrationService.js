import { supabase } from '../lib/supabase';
import useXPRulesStore from '../store/useXPRulesStore';
import useQuizXPStore from '../store/useQuizXPStore';

/**
 * Centralizovaný celebration service pro všechny typy dokončení
 * Podporuje: lekce, písně, kvízy, achievements
 */

// Vypočítá level na základě celkového XP
const calculateLevel = (totalXP) => {
  if (totalXP >= 1000) return 5;
  if (totalXP >= 500) return 4;
  if (totalXP >= 250) return 3;
  if (totalXP >= 100) return 2;
  return 1;
};

/**
 * Hlavní funkce pro oslavu dokončení aktivity
 * @param {Object} params - Parametry dokončení
 * @param {string} params.type - Typ aktivity ('lesson', 'song', 'quiz', 'achievement')
 * @param {string} params.userId - ID uživatele
 * @param {number} params.itemId - ID položky (lekce, písně, atd.)
 * @param {string} params.itemTitle - Název položky
 * @param {Object} params.metadata - Dodatečná data (score, atd.)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const celebrate = async ({ type, userId, itemId, itemTitle, metadata = {} }) => {
  try {
    // 1. Zkontrolovat, jestli už není dokončeno
    const isAlreadyCompleted = await checkIfCompleted(type, userId, itemId);

    // 2. Získat XP hodnotu
    const xpEarned = await getXPForCompletion(type, metadata);

    // 3. Uložit dokončení
    await saveCompletion(type, userId, itemId, itemTitle, xpEarned, metadata);

    // 4. Aktualizovat user stats (pouze pokud ještě nebylo dokončeno)
    const updatedStats = await updateUserStats(userId, xpEarned, type);

    // 5. Zkontrolovat achievements
    const unlockedAchievements = await checkAndUnlockAchievements(userId, type, itemId, updatedStats);

    // 6. Získat celebration konfiguraci
    const celebrationConfig = await getCelebrationConfig(type, unlockedAchievements);

    return {
      success: true,
      data: {
        xpEarned,
        totalXP: updatedStats.total_xp,
        level: updatedStats.level,
        leveledUp: updatedStats.leveledUp,
        unlockedAchievements,
        celebrationConfig,
        isFirstTime: !isAlreadyCompleted
      }
    };
  } catch (error) {
    console.error('Chyba v celebration service:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Zkontroluje, jestli je aktivita už dokončená
 */
async function checkIfCompleted(type, userId, itemId) {
  const tables = {
    lesson: 'piano_lesson_completions',
    song: 'piano_song_completions',
    quiz: 'piano_quiz_scores'
  };

  const table = tables[type];
  if (!table) return false;

  const idColumn = type === 'lesson' ? 'lesson_id' : type === 'song' ? 'song_id' : 'quiz_type';
  const { data } = await supabase
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .eq(idColumn, itemId.toString())
    .limit(1);

  return data && data.length > 0;
}

/**
 * Získá XP hodnotu pro dokončení
 */
async function getXPForCompletion(type, metadata) {
  if (type === 'lesson') {
    const xpRules = useXPRulesStore.getState().xpRules;
    return xpRules.lesson_completion || 10;
  }

  if (type === 'song') {
    const xpRules = useXPRulesStore.getState().xpRules;
    return xpRules.song_completion || 15;
  }

  if (type === 'quiz') {
    const { score, totalQuestions } = metadata;
    const percentage = (score / totalQuestions) * 100;

    // Základní XP za správné odpovědi
    const xpRules = useXPRulesStore.getState().xpRules;
    const baseXP = score * (xpRules.quiz_correct || 5);

    // Bonus za výkon
    const bonusXP = useQuizXPStore.getState().getXPForPercentage(percentage);

    return baseXP + bonusXP;
  }

  if (type === 'achievement') {
    return metadata.xp_reward || 20;
  }

  return 0;
}

/**
 * Uloží dokončení do příslušné tabulky
 */
async function saveCompletion(type, userId, itemId, itemTitle, xpEarned, metadata) {
  if (type === 'lesson') {
    const { error } = await supabase
      .from('piano_lesson_completions')
      .insert({
        user_id: userId,
        lesson_id: itemId.toString(),
        lesson_title: itemTitle,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  if (type === 'song') {
    const { error } = await supabase
      .from('piano_song_completions')
      .insert({
        user_id: userId,
        song_id: itemId.toString(),
        song_title: itemTitle,
        xp_earned: xpEarned,
        mode: metadata.mode || 'challenge',
        completed_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  if (type === 'quiz') {
    const { score, totalQuestions, streak } = metadata;
    const { error } = await supabase
      .from('piano_quiz_scores')
      .insert({
        user_id: userId,
        quiz_type: itemId,
        score,
        total_questions: totalQuestions,
        streak: streak || 0,
        completed_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}

/**
 * Aktualizuje user stats
 */
async function updateUserStats(userId, xpEarned, type) {
  const { data: existingStats, error: fetchError } = await supabase
    .from('piano_user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  const today = new Date().toISOString().split('T')[0];

  if (existingStats) {
    // Aktualizovat existující statistiky
    const newTotalXP = (existingStats.total_xp || 0) + xpEarned;
    const oldLevel = existingStats.level || 1;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Aktualizovat streak
    const isToday = existingStats.last_activity_date === today;
    const isYesterday = existingStats.last_activity_date === getYesterdayDate();
    const newCurrentStreak = isToday
      ? existingStats.current_streak
      : isYesterday
        ? (existingStats.current_streak || 0) + 1
        : 1;
    const newBestStreak = Math.max(existingStats.best_streak || 0, newCurrentStreak);

    // Aktualizovat počty dokončení
    const updates = {
      total_xp: newTotalXP,
      level: newLevel,
      current_streak: newCurrentStreak,
      best_streak: newBestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString()
    };

    if (type === 'lesson') {
      updates.lessons_completed = (existingStats.lessons_completed || 0) + 1;
    }

    const { error: updateError } = await supabase
      .from('piano_user_stats')
      .update(updates)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return {
      ...existingStats,
      ...updates,
      leveledUp
    };
  } else {
    // Vytvořit nové statistiky
    const newLevel = calculateLevel(xpEarned);
    const newStats = {
      user_id: userId,
      total_xp: xpEarned,
      level: newLevel,
      current_streak: 1,
      best_streak: 1,
      lessons_completed: type === 'lesson' ? 1 : 0,
      last_activity_date: today,
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('piano_user_stats')
      .insert(newStats);

    if (insertError) throw insertError;

    return {
      ...newStats,
      leveledUp: false
    };
  }
}

/**
 * Zkontroluje a odemkne achievements
 */
async function checkAndUnlockAchievements(userId, type, itemId, stats) {
  // Získat všechny achievements
  const { data: achievements, error } = await supabase
    .from('piano_achievements')
    .select(`
      *,
      piano_achievement_triggers (
        trigger_type,
        trigger_id
      )
    `);

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

    const trigger = achievement.piano_achievement_triggers?.[0];
    let shouldUnlock = false;

    // Zkontrolovat trigger
    if (trigger) {
      if (trigger.trigger_type === type && trigger.trigger_id === itemId) {
        shouldUnlock = true;
      }
    }

    // Zkontrolovat podmínky
    if (!shouldUnlock) {
      if (achievement.requirement_type === 'global') {
        shouldUnlock = true;
      } else if (achievement.requirement_type === 'xp') {
        shouldUnlock = stats.total_xp >= achievement.requirement_value;
      } else if (achievement.requirement_type === 'lessons_completed') {
        shouldUnlock = stats.lessons_completed >= achievement.requirement_value;
      } else if (achievement.requirement_type === 'streak') {
        shouldUnlock = stats.current_streak >= achievement.requirement_value;
      } else if (achievement.requirement_type === 'daily_goals_completed') {
        shouldUnlock = (stats.daily_goals_completed || 0) >= achievement.requirement_value;
      } else if (achievement.requirement_type === 'daily_goal_streak') {
        shouldUnlock = (stats.daily_goal_streak || 0) >= achievement.requirement_value;
      }
    }

    // Odemknout achievement
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

        // Přidat XP za achievement
        if (achievement.xp_reward > 0) {
          await updateUserStats(userId, achievement.xp_reward, 'achievement');
        }
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Získá konfiguraci pro oslavu
 * @param {string} type - Typ aktivity ('lesson', 'song', 'quiz', 'daily_goal')
 * @param {Array} unlockedAchievements - Pole odemčených achievements
 * @returns {Object} Config pro celebration
 */
export function getCelebrationConfig(type, unlockedAchievements) {
  // Pokud byly odemčeny achievements, použít konfiguraci prvního
  if (unlockedAchievements && unlockedAchievements.length > 0) {
    const achievement = unlockedAchievements[0];
    return {
      sound: achievement.celebration_sound || 'success',
      icon: achievement.icon_type || 'Trophy',
      iconColor: achievement.icon_color || 'primary',
      confetti: true,
      confettiType: achievement.confetti_type || 'metallic',
      message: `${achievement.title} odemčeno!`
    };
  }

  // Výchozí konfigurace podle typu
  const configs = {
    lesson: {
      sound: 'success',
      icon: 'BookOpen',
      iconColor: 'secondary',
      confetti: true,
      confettiType: 'blue',
      message: 'Lekce dokončena!'
    },
    song: {
      sound: 'fanfare',
      icon: 'Music',
      iconColor: 'primary',
      confetti: true,
      confettiType: 'rainbow',
      message: 'Píseň zahrána!'
    },
    quiz: {
      sound: 'achievement',
      icon: 'Target',
      iconColor: 'secondary',
      confetti: true,
      confettiType: 'golden',
      message: 'Kvíz dokončen!'
    },
    daily_goal: {
      sound: 'achievement',
      icon: 'Target',
      iconColor: 'primary',
      confetti: true,
      confettiType: 'golden',
      message: 'Denní cíl splněn!'
    }
  };

  return configs[type] || configs.lesson;
}

// Pomocná funkce pro včerejší datum
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Jednoduchá funkce pro vizuální oslavu (bez ukládání do DB)
 * Použití: Denní cíle, milníky, atd.
 *
 * @param {string} confettiType - Typ konfet ('rainbow', 'golden', 'pink', atd.)
 * @param {string} soundType - Typ zvuku ('achievement', 'success', 'fanfare')
 * @param {Object} notification - Notifikace {title, message, type, duration}
 */
export const triggerCelebration = (confettiType = 'rainbow', soundType = 'achievement', notification = null) => {
  // Trigger confetti event
  if (window.Confetti && typeof window.Confetti.trigger === 'function') {
    window.Confetti.trigger(confettiType);
  } else {
    // Fallback: Trigger custom event pro Confetti komponentu
    const event = new CustomEvent('triggerConfetti', {
      detail: { type: confettiType }
    });
    window.dispatchEvent(event);
  }

  // Play sound (pokud existuje audioEngine)
  if (window.audioEngine && typeof window.audioEngine.playSound === 'function') {
    window.audioEngine.playSound(soundType);
  }

  // Show notification (pokud je poskytnutá)
  if (notification && window.showNotification && typeof window.showNotification === 'function') {
    window.showNotification(notification);
  }

  return { success: true };
};
