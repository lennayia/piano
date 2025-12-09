import { supabase } from '../lib/supabase';
import useXPRulesStore from '../store/useXPRulesStore';
import useQuizXPStore from '../store/useQuizXPStore';
import useRewardsConfigStore from '../store/useRewardsConfigStore';
import useAchievementsStore from '../store/useAchievementsStore';

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
    const updatedStats = await updateUserStats(userId, xpEarned, type, metadata);

    // 4a. Pokud došlo k level-upu, zapsat do historie
    if (updatedStats.leveledUp) {
      await saveLevelUp(userId, updatedStats.oldLevel, updatedStats.level, updatedStats.total_xp);
    }

    // 5. Zkontrolovat achievements
    const unlockedAchievements = await checkAndUnlockAchievements(userId, type, itemId, updatedStats);

    // 6. Získat celebration konfiguraci
    const celebrationConfig = await getCelebrationConfig(type, unlockedAchievements, metadata);

    // 6a. Pokud došlo k level-upu, přidat level-up celebration config
    let levelUpConfig = null;
    if (updatedStats.leveledUp) {
      levelUpConfig = await getCelebrationConfig('level_up', [], {});
    }

    return {
      success: true,
      data: {
        xpEarned,
        totalXP: updatedStats.total_xp,
        level: updatedStats.level,
        leveledUp: updatedStats.leveledUp,
        unlockedAchievements,
        celebrationConfig,
        levelUpConfig,
        isFirstTime: !isAlreadyCompleted,
        // Pro denní cíle vrátit streak informace
        dailyStreak: metadata._dailyStreak,
        bestDailyStreak: metadata._bestDailyStreak,
        totalGoalsCompleted: updatedStats.daily_goals_completed
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
    quiz: 'piano_quiz_scores',
    daily_goal: 'piano_daily_goal_completions'
  };

  const table = tables[type];
  if (!table) return false;

  // Pro denní cíle kontrolujeme, jestli už byl dnes splněn
  if (type === 'daily_goal') {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`)
      .limit(1);
    return data && data.length > 0;
  }

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

  if (type === 'chord_practice') {
    // XP za dokončení série akordů
    const { chordsCompleted = 0 } = metadata;
    return chordsCompleted * 10; // 10 XP za akord
  }

  if (type === 'daily_goal') {
    // XP za splnění denního cíle
    const xpRules = useXPRulesStore.getState().xpRules;
    return xpRules.daily_goal || 50;
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

    // Pokud je kvíz bezchybný, zkontrolovat perfect streak a přidat bonus za milníky (5, 10, 15...)
    if (score === totalQuestions) {
      try {
        // Načíst historii kvízů pro tento typ
        const { data: history, error: historyError } = await supabase
          .from('piano_quiz_scores')
          .select('score, total_questions')
          .eq('user_id', userId)
          .eq('quiz_type', itemId)
          .order('completed_at', { ascending: false })
          .limit(20); // Načíst dostatek pro detekci streaku

        if (!historyError && history) {
          // Spočítat perfect streak (bezchybné za sebou od konce)
          let perfectStreak = 0;
          for (const item of history) {
            if (item.score === item.total_questions) {
              perfectStreak++;
            } else {
              break;
            }
          }

          // Bonus za milníky: každých 5 bezchybných za sebou = +50 XP
          if (perfectStreak > 0 && perfectStreak % 5 === 0) {
            const bonusXP = 50;
            console.log(`🎉 Perfect Streak Bonus! ${perfectStreak} bezchybných kvízů za sebou = +${bonusXP} XP`);

            // Přidat bonus XP k user stats
            const { data: currentStats } = await supabase
              .from('user_stats')
              .select('total_xp')
              .eq('id', userId)
              .single();

            if (currentStats) {
              await supabase
                .from('user_stats')
                .update({
                  total_xp: currentStats.total_xp + bonusXP,
                  updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            }
          }
        }
      } catch (error) {
        console.error('Chyba při kontrole perfect streak bonusu:', error);
        // Pokračovat i při chybě - bonus není kritický
      }
    }
  }

  if (type === 'chord_practice') {
    const { chordsCompleted, difficulty, isShuffled } = metadata;
    const { error } = await supabase
      .from('piano_quiz_scores')
      .insert({
        user_id: userId,
        quiz_type: 'chord_practice',
        score: chordsCompleted,
        total_questions: chordsCompleted,
        streak: 0,
        completed_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  if (type === 'daily_goal') {
    const { goalType, goalCount, completedCount } = metadata;
    const { error } = await supabase
      .from('piano_daily_goal_completions')
      .insert({
        user_id: userId,
        goal_type: goalType,
        goal_count: goalCount,
        completed_count: completedCount,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}

/**
 * Aktualizuje user stats
 */
async function updateUserStats(userId, xpEarned, type, metadata = {}) {
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
    } else if (type === 'song') {
      updates.songs_completed = (existingStats.songs_completed || 0) + 1;
      // Pouze v challenge mode počítáme jako perfect score
      if (metadata?.mode === 'challenge') {
        updates.songs_perfect_score = (existingStats.songs_perfect_score || 0) + 1;
      }
    } else if (type === 'quiz') {
      // Kvízy se počítají jen bezchybné (celebrate se volá jen pro isPerfect=true)
      updates.quizzes_completed = (existingStats.quizzes_completed || 0) + 1;
    } else if (type === 'chord_practice') {
      const { chordsCompleted = 0 } = metadata;
      updates.chords_completed = (existingStats.chords_completed || 0) + chordsCompleted;
    } else if (type === 'daily_goal') {
      // Denní cíl - počítat streak
      const lastGoalDate = existingStats.last_goal_completed_date;
      const yesterdayDate = getYesterdayDate();

      let newDailyStreak = 1;
      if (lastGoalDate === yesterdayDate) {
        // Pokračování série
        newDailyStreak = (existingStats.daily_goal_streak || 0) + 1;
      } else if (lastGoalDate !== today) {
        // Nová série (nebo přerušená)
        newDailyStreak = 1;
      } else {
        // Už byl dnes splněn
        newDailyStreak = existingStats.daily_goal_streak || 1;
      }

      updates.daily_goals_completed = (existingStats.daily_goals_completed || 0) + 1;
      updates.daily_goal_streak = newDailyStreak;
      updates.best_daily_goal_streak = Math.max(existingStats.best_daily_goal_streak || 0, newDailyStreak);
      updates.last_goal_completed_date = today;

      // Uložit streak do return hodnoty pro callback
      metadata._dailyStreak = newDailyStreak;
      metadata._bestDailyStreak = updates.best_daily_goal_streak;
    }

    const { error: updateError } = await supabase
      .from('piano_user_stats')
      .update(updates)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return {
      ...existingStats,
      ...updates,
      leveledUp,
      oldLevel
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
      songs_completed: type === 'song' ? 1 : 0,
      songs_perfect_score: (type === 'song' && metadata?.mode === 'challenge') ? 1 : 0,
      chords_completed: type === 'chord_practice' ? (metadata?.chordsCompleted || 0) : 0,
      daily_goals_completed: type === 'daily_goal' ? 1 : 0,
      daily_goal_streak: type === 'daily_goal' ? 1 : 0,
      best_daily_goal_streak: type === 'daily_goal' ? 1 : 0,
      last_goal_completed_date: type === 'daily_goal' ? today : null,
      last_activity_date: today,
      created_at: new Date().toISOString()
    };

    // Uložit streak do metadata pro callback
    if (type === 'daily_goal') {
      metadata._dailyStreak = 1;
      metadata._bestDailyStreak = 1;
    }

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
  // Získat achievements z cache (OPTIMALIZACE!)
  const achievementsStore = useAchievementsStore.getState();
  let achievements = achievementsStore.getAchievements();

  // Pokud cache je prázdná, načíst z DB
  if (achievements.length === 0) {
    achievements = await achievementsStore.loadAchievements();
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
          earned_at: new Date().toISOString()
        });

      if (!unlockError) {
        newlyUnlocked.push(achievement);

        // Přidat XP za achievement
        if (achievement.xp_reward > 0) {
          await updateUserStats(userId, achievement.xp_reward, 'achievement', {});
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
 * @param {Object} metadata - Dodatečná data (např. mode pro songs)
 * @returns {Object} Config pro celebration
 */
export function getCelebrationConfig(type, unlockedAchievements, metadata = {}) {
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

  // Mapování typu na action_type v rewards_config
  const typeToActionType = {
    lesson: 'lesson_completion',
    song: metadata.mode === 'challenge' ? 'song_played_challenge' : 'song_played_practice',
    quiz: 'quiz_completion',
    chord_practice: 'chord_practice_completion',
    daily_goal: 'daily_goal_completion',
    level_up: 'level_up'
  };

  // Pokusit se načíst konfiguraci z rewards_config
  const actionType = typeToActionType[type];
  if (actionType) {
    const reward = useRewardsConfigStore.getState().getRewardByActionType(actionType);
    if (reward) {
      return {
        sound: reward.celebration_sound || 'success',
        icon: reward.icon_type || 'Trophy',
        iconColor: reward.icon_color || 'primary',
        confetti: true,
        confettiType: reward.confetti_type || 'metallic',
        message: getMessageForType(type)
      };
    }
  }

  // Fallback výchozí konfigurace
  return {
    sound: 'success',
    icon: 'Trophy',
    iconColor: 'primary',
    confetti: true,
    confettiType: 'metallic',
    message: getMessageForType(type)
  };
}

// Pomocná funkce pro výchozí zprávy
function getMessageForType(type) {
  const messages = {
    lesson: 'Lekce dokončena!',
    song: 'Píseň zahrána!',
    quiz: 'Kvíz dokončen!',
    chord_practice: 'Série akordů dokončena!',
    daily_goal: 'Denní cíl splněn!'
  };
  return messages[type] || 'Výborně!';
}

// Pomocná funkce pro včerejší datum
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Uloží level-up do historie
 */
async function saveLevelUp(userId, oldLevel, newLevel, totalXP) {
  try {
    const { error } = await supabase
      .from('piano_level_ups')
      .insert({
        user_id: userId,
        old_level: oldLevel,
        new_level: newLevel,
        total_xp: totalXP,
        achieved_at: new Date().toISOString()
      });

    if (error) {
      console.error('Chyba při ukládání level-up:', error);
    }
  } catch (error) {
    console.error('Chyba při ukládání level-up:', error);
  }
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
