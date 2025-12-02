import { supabase } from '../lib/supabase';

/**
 * Activity Service - Centralizované funkce pro načítání aktivit uživatele
 * Odděleno z celebrationService.js pro lepší modularitu
 */

/**
 * Získá nedávné aktivity uživatele ze všech completion tabulek
 * @param {string} userId - ID uživatele
 * @param {number} limit - Počet aktivit k načtení (default: 5)
 * @returns {Promise<Array>} Pole aktivit s type, title, date, xp, icon
 */
export const getRecentActivities = async (userId, limit = 5) => {
  if (!userId) return [];

  try {
    const allActivities = [];

    // Fetch recent song completions
    const { data: songs } = await supabase
      .from('piano_song_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(3);

    if (songs) {
      songs.forEach(song => {
        allActivities.push({
          id: `song-${song.id}`,
          type: 'song',
          title: song.song_title,
          date: new Date(song.completed_at),
          xp: song.xp_earned || 100,
          icon: 'Music'
        });
      });
    }

    // Fetch recent quiz completions
    const { data: quizzes } = await supabase
      .from('piano_quiz_scores')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(3);

    if (quizzes) {
      quizzes.forEach(quiz => {
        const quizTypeLabels = {
          'chord_practice': 'Cvičení akordů',
          'theory': 'Kvíz: Hudební teorie',
          'interval': 'Kvíz: Intervaly',
          'scale': 'Kvíz: Stupnice',
          'rhythm': 'Kvíz: Rytmus',
          'mixed': 'Kvíz: Mix'
        };

        allActivities.push({
          id: `quiz-${quiz.id}`,
          type: 'quiz',
          title: quizTypeLabels[quiz.quiz_type] || 'Kvíz',
          date: new Date(quiz.completed_at),
          xp: quiz.score * 5, // Odhadovaná hodnota
          icon: 'Gamepad2'
        });
      });
    }

    // Fetch recent lesson completions
    const { data: lessons } = await supabase
      .from('piano_lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(3);

    if (lessons) {
      lessons.forEach(lesson => {
        allActivities.push({
          id: `lesson-${lesson.id}`,
          type: 'lesson',
          title: lesson.lesson_title || 'Lekce',
          date: new Date(lesson.completed_at),
          xp: lesson.xp_earned || 50,
          icon: 'BookOpen'
        });
      });
    }

    // Sort by date and take only requested number
    allActivities.sort((a, b) => b.date - a.date);
    return allActivities.slice(0, limit);
  } catch (error) {
    console.error('Chyba při načítání nedávné aktivity:', error);
    return [];
  }
};

/**
 * Získá VŠECHNY aktivity uživatele (pro stránku Historie)
 * @param {string} userId - ID uživatele
 * @returns {Promise<Array>} Pole všech aktivit
 */
export const getAllUserActivities = async (userId) => {
  if (!userId) return [];

  try {
    const allActivities = [];

    // Fetch song completions
    const { data: songs } = await supabase
      .from('piano_song_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (songs) {
      songs.forEach(song => {
        allActivities.push({
          id: `song-${song.id}`,
          type: 'song',
          title: song.song_title,
          date: new Date(song.completed_at),
          xp: song.xp_earned || 100,
          isPerfect: song.is_perfect,
          mistakes: song.mistakes_count,
          icon: 'Music'
        });
      });
    }

    // Fetch quiz completions (stará tabulka)
    const { data: oldQuizzes } = await supabase
      .from('piano_quiz_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (oldQuizzes) {
      oldQuizzes.forEach(quiz => {
        allActivities.push({
          id: `quiz-old-${quiz.id}`,
          type: 'quiz',
          title: 'Poznáte akord?',
          date: new Date(quiz.completed_at),
          xp: quiz.xp_earned || 50,
          score: quiz.score,
          totalQuestions: quiz.total_questions,
          icon: 'Gamepad2'
        });
      });
    }

    // Fetch quiz scores (nová tabulka)
    const { data: quizScores } = await supabase
      .from('piano_quiz_scores')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (quizScores) {
      quizScores.forEach(quiz => {
        const quizTypeLabels = {
          'chord_practice': 'Cvičení akordů',
          'chord_quiz': 'Poznáte akord?',
          'theory': 'Kvíz: Hudební teorie',
          'interval': 'Kvíz: Intervaly',
          'scale': 'Kvíz: Stupnice',
          'rhythm': 'Kvíz: Rytmus',
          'mixed': 'Kvíz: Mix'
        };

        allActivities.push({
          id: `quiz-${quiz.id}`,
          type: quiz.quiz_type === 'chord_practice' ? 'chord_practice' : 'quiz',
          title: quizTypeLabels[quiz.quiz_type] || 'Kvíz',
          date: new Date(quiz.completed_at),
          xp: quiz.score * 5,
          score: quiz.score,
          totalQuestions: quiz.total_questions,
          icon: quiz.quiz_type === 'chord_practice' ? 'Music' : 'Gamepad2'
        });
      });
    }

    // Fetch lesson completions
    const { data: lessons } = await supabase
      .from('piano_lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (lessons) {
      lessons.forEach(lesson => {
        allActivities.push({
          id: `lesson-${lesson.id}`,
          type: 'lesson',
          title: lesson.lesson_title || 'Lekce',
          date: new Date(lesson.completed_at),
          xp: lesson.xp_earned || 50,
          icon: 'Book'
        });
      });
    }

    // Fetch daily goal completions
    const { data: dailyGoals } = await supabase
      .from('piano_daily_goal_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (dailyGoals) {
      dailyGoals.forEach(goal => {
        const goalTypeLabels = {
          'lessons': 'lekcí',
          'songs': 'písní',
          'quizzes': 'kvízů',
          'harmonizations': 'harmonizací'
        };
        const goalLabel = goalTypeLabels[goal.goal_type] || 'aktivit';

        allActivities.push({
          id: `daily-goal-${goal.id}`,
          type: 'daily_goal',
          title: `🎯 Denní cíl splněn!`,
          subtitle: `${goal.completed_count} ${goalLabel}`,
          date: new Date(goal.completed_at),
          xp: goal.xp_earned || 50,
          icon: 'Trophy',
          isSpecial: true
        });
      });
    }

    // Fetch level ups
    const { data: levelUps } = await supabase
      .from('piano_level_ups')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (levelUps) {
      levelUps.forEach(levelUp => {
        allActivities.push({
          id: `level-up-${levelUp.id}`,
          type: 'level_up',
          title: `⭐ Level ${levelUp.new_level} dosažen!`,
          subtitle: `${levelUp.total_xp} XP celkem`,
          date: new Date(levelUp.achieved_at),
          xp: 0,
          icon: 'Star',
          isSpecial: true,
          isLevelUp: true
        });
      });
    }

    // Sort by date (newest first)
    allActivities.sort((a, b) => b.date - a.date);

    return allActivities;
  } catch (error) {
    console.error('Chyba při načítání všech aktivit:', error);
    return [];
  }
};

/**
 * Získá aktivity, které přispěly k odemčení konkrétního achievementu
 * @param {string} userId - ID uživatele
 * @param {string} requirementType - Typ požadavku achievementu
 * @param {number} requirementValue - Hodnota požadavku
 * @returns {Promise<Array>} Pole aktivit
 */
export const getActivitiesForAchievement = async (userId, requirementType, requirementValue) => {
  if (!userId) return [];

  try {
    const activities = [];

    switch (requirementType) {
      case 'lessons_completed': {
        const { data } = await supabase
          .from('piano_lesson_completions')
          .select('lesson_title, completed_at, xp_earned')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true })
          .limit(requirementValue);

        if (data) {
          data.forEach(item => activities.push({
            title: item.lesson_title || 'Lekce',
            date: new Date(item.completed_at),
            xp: item.xp_earned || 50
          }));
        }
        break;
      }

      case 'quizzes_completed': {
        const { data } = await supabase
          .from('piano_quiz_scores')
          .select('quiz_type, completed_at, score')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true })
          .limit(requirementValue);

        if (data) {
          data.forEach(item => activities.push({
            title: `Kvíz: ${item.quiz_type}`,
            date: new Date(item.completed_at),
            xp: item.score * 5
          }));
        }
        break;
      }

      case 'songs_completed': {
        const { data } = await supabase
          .from('piano_song_completions')
          .select('song_title, completed_at, xp_earned')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true })
          .limit(requirementValue);

        if (data) {
          data.forEach(item => activities.push({
            title: item.song_title || 'Píseň',
            date: new Date(item.completed_at),
            xp: item.xp_earned || 100
          }));
        }
        break;
      }

      case 'streak':
      case 'current_streak': {
        // Pro streak, načíst aktivity z posledních X dní (kde X = aktuální streak)
        const allActivities = [];

        // Vypočítat datum před X dny (kde X = requirementValue)
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - requirementValue);
        const startDate = daysAgo.toISOString();

        // Lessons z posledních X dní
        const { data: lessonData } = await supabase
          .from('piano_lesson_completions')
          .select('lesson_title, completed_at, xp_earned')
          .eq('user_id', userId)
          .gte('completed_at', startDate)
          .order('completed_at', { ascending: false });

        if (lessonData) {
          lessonData.forEach(item => allActivities.push({
            title: item.lesson_title || 'Lekce',
            date: new Date(item.completed_at),
            xp: item.xp_earned || 50
          }));
        }

        // Songs z posledních X dní (NEMÁ xp_earned sloupec - použijeme default 100)
        const { data: songData } = await supabase
          .from('piano_song_completions')
          .select('song_title, completed_at')
          .eq('user_id', userId)
          .gte('completed_at', startDate)
          .order('completed_at', { ascending: false });

        if (songData) {
          songData.forEach(item => allActivities.push({
            title: item.song_title || 'Píseň',
            date: new Date(item.completed_at),
            xp: 100 // Songs nemají xp_earned sloupec
          }));
        }

        // Quizzes z posledních X dní
        const { data: quizData } = await supabase
          .from('piano_quiz_scores')
          .select('quiz_type, completed_at, score')
          .eq('user_id', userId)
          .gte('completed_at', startDate)
          .order('completed_at', { ascending: false });

        if (quizData) {
          quizData.forEach(item => allActivities.push({
            title: `Kvíz: ${item.quiz_type}`,
            date: new Date(item.completed_at),
            xp: item.score * 5
          }));
        }

        // Sort by date (newest first)
        allActivities.sort((a, b) => b.date - a.date);

        // Return all activities from last X days
        return allActivities;
      }

      case 'xp':
      case 'total_xp': {
        // Pro XP achievementy, načíst aktivity dokud nedosáhneme požadovaného XP
        const allActivities = [];

        // Lessons
        const { data: lessonData } = await supabase
          .from('piano_lesson_completions')
          .select('lesson_title, completed_at, xp_earned')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true });

        if (lessonData) {
          lessonData.forEach(item => allActivities.push({
            title: item.lesson_title || 'Lekce',
            date: new Date(item.completed_at),
            xp: item.xp_earned || 50
          }));
        }

        // Songs (NEMÁ xp_earned sloupec - použijeme default 100)
        const { data: songData } = await supabase
          .from('piano_song_completions')
          .select('song_title, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true });

        if (songData) {
          songData.forEach(item => allActivities.push({
            title: item.song_title || 'Píseň',
            date: new Date(item.completed_at),
            xp: 100 // Songs nemají xp_earned sloupec
          }));
        }

        // Sort chronologically
        allActivities.sort((a, b) => a.date - b.date);

        // Take activities until we reach requirementValue XP
        let cumulativeXP = 0;
        for (const activity of allActivities) {
          if (cumulativeXP >= requirementValue) break;
          activities.push(activity);
          cumulativeXP += activity.xp;
        }
        break;
      }
    }

    return activities;
  } catch (error) {
    console.error('Chyba při načítání aktivit pro achievement:', error);
    return [];
  }
};

/**
 * Získá všechny aktivity všech uživatelů (pro admin panel)
 * Používá database view 'user_activities' pro efektivní dotazování
 * @param {number} limit - Počet aktivit k načtení (default: 100)
 * @returns {Promise<Array>} Pole všech aktivit s informacemi o uživateli
 */
export const getAllUsersActivities = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Chyba při načítání aktivit:', error);
      return [];
    }

    // Transform data to expected format
    const activities = data.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      subtitle: activity.subtitle,
      date: new Date(activity.date),
      xp: activity.xp,
      isPerfect: activity.is_perfect,
      mistakes: activity.mistakes_count,
      icon: activity.icon,
      isSpecial: activity.is_special,
      user: {
        id: activity.user_id,
        first_name: activity.first_name,
        last_name: activity.last_name,
        email: activity.email
      }
    }));

    console.log('✅ Loaded', activities.length, 'activities from user_activities view');
    console.log('📊 Activities by type:', {
      songs: activities.filter(a => a.type === 'song').length,
      quizzes: activities.filter(a => a.type === 'quiz').length,
      lessons: activities.filter(a => a.type === 'lesson').length,
      dailyGoals: activities.filter(a => a.type === 'daily_goal').length
    });

    return activities;
  } catch (error) {
    console.error('Chyba při načítání aktivit všech uživatelů:', error);
    return [];
  }
};
