import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, BookOpen, Trophy, Flame, Zap, Piano, Star, Target, GraduationCap, History, Music, Gamepad2, Clock, Calendar, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../store/useUserStore';
import useLessonStore from '../store/useLessonStore';
import { supabase } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';
import TabButtons from '../components/ui/TabButtons';
import Leaderboard from '../components/dashboard/Leaderboard';

// Dynamické renderování ikony odměny podle dat z databáze
const getAchievementIcon = (achievement) => {
  // Pokud máme icon_type z databáze, použijeme ho
  if (achievement.icon_type) {
    const IconComponent = LucideIcons[achievement.icon_type];
    const color = achievement.icon_color || 'primary';

    if (IconComponent) {
      return <IconComponent size={32} color={`var(--color-${color})`} />;
    }
  }

  // Fallback: pokud nemáme icon_type, použijeme staré emoji mapování (zpětná kompatibilita)
  const iconMap = {
    '🎹': <Piano size={32} color="var(--color-primary)" />,
    '📚': <BookOpen size={32} color="var(--color-secondary)" />,
    '🎓': <GraduationCap size={32} color="var(--color-primary)" />,
    '🔥': <Flame size={32} color="var(--color-secondary)" />,
    '⭐': <Star size={32} color="var(--color-primary)" />,
    '💯': <Target size={32} color="var(--color-secondary)" />,
    '🏆': <Trophy size={32} color="var(--color-primary)" />
  };

  return iconMap[achievement.icon] || <Award size={32} color="var(--color-primary)" />;
};

// Jednoduchá funkce pro převod jména do vokativu (5. pádu)
function toVocative(name) {
  if (!name) return name;

  // Mužská jména končící na -r, -l, -n přidávají -e
  if (name.match(/^(Petr|Pavel|Karel|Jan|Martin|Milan|Roman|Tomáš|Lukáš)$/i)) {
    return name + 'e';
  }
  // Mužská jména končící na -a mění -a na -o
  if (name.match(/^(Jarda|Honza|Míša)$/i)) {
    return name.slice(0, -1) + 'o';
  }
  // Ženská jména končící na -a mění -a na -o
  if (name.match(/a$/)) {
    return name.slice(0, -1) + 'o';
  }
  // Ostatní jména zůstávají beze změny
  return name;
}

function UserDashboard() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserStats = useUserStore((state) => state.updateUserStats);
  const lessons = useLessonStore((state) => state.lessons);
  const fetchLessons = useLessonStore((state) => state.fetchLessons);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activeTab, setActiveTab] = useState('achievements');
  const [allAchievements, setAllAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // Filter for achievements
  const [selectedAchievement, setSelectedAchievement] = useState(null); // For modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [achievementActivities, setAchievementActivities] = useState([]);
  const [loadingModalActivities, setLoadingModalActivities] = useState(false);

  // Načíst lekce z databáze
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Refresh user stats and achievements when component mounts or becomes visible
  useEffect(() => {
    const refreshData = async () => {
      if (currentUser) {
        await updateUserStats(); // Refresh stats and achievements from database
        fetchRecentActivities();
        fetchAllAchievements();
      }
    };

    refreshData();

    // Refresh when window gains focus (user returns to tab)
    const handleFocus = () => {
      if (currentUser) {
        updateUserStats();
        fetchAllAchievements();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser?.id, updateUserStats]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    }
  }, [currentUser, navigate]);

  const fetchRecentActivities = async () => {
    if (!currentUser) return;

    try {
      const allActivities = [];

      // Fetch recent song completions
      const { data: songs } = await supabase
        .from('piano_song_completions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('completed_at', { ascending: false })
        .limit(3);

      if (songs) {
        songs.forEach(song => {
          allActivities.push({
            id: `song-${song.id}`,
            type: 'song',
            title: song.song_title,
            date: new Date(song.completed_at),
            xp: 100,
            icon: Music
          });
        });
      }

      // Fetch recent theory quiz completions from all 5 tables
      const quizTables = [
        { table: 'piano_quiz_theory_completions', title: 'Kvíz: Hudební teorie' },
        { table: 'piano_quiz_interval_completions', title: 'Kvíz: Intervaly' },
        { table: 'piano_quiz_scale_completions', title: 'Kvíz: Stupnice' },
        { table: 'piano_quiz_rhythm_completions', title: 'Kvíz: Rytmus' },
        { table: 'piano_quiz_mixed_completions', title: 'Kvíz: Mix' }
      ];

      for (const quizTable of quizTables) {
        try {
          const { data: quizzes, error } = await supabase
            .from(quizTable.table)
            .select('id, completed_at, is_correct')
            .eq('user_id', currentUser.id)
            .order('completed_at', { ascending: false })
            .limit(1);

          if (!error && quizzes && quizzes.length > 0) {
            const quiz = quizzes[0];
            allActivities.push({
              id: `quiz-${quizTable.table}-${quiz.id}`,
              type: 'quiz',
              title: quizTable.title,
              date: quiz.completed_at ? new Date(quiz.completed_at) : new Date(),
              xp: quiz.is_correct ? 100 : 0,
              icon: Gamepad2
            });
          }
        } catch (err) {
          // Tabulka neexistuje nebo nemáme přístup - přeskočíme
          console.log(`Table ${quizTable.table} not accessible:`, err.message);
        }
      }

      // Fetch recent lesson completions
      const { data: lessonCompletions } = await supabase
        .from('piano_lesson_completions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('completed_at', { ascending: false })
        .limit(3);

      if (lessonCompletions) {
        lessonCompletions.forEach(lesson => {
          allActivities.push({
            id: `lesson-${lesson.id}`,
            type: 'lesson',
            title: lesson.lesson_title || 'Lekce',
            date: new Date(lesson.completed_at),
            xp: lesson.xp_earned || 50,
            icon: BookOpen
          });
        });
      }

      // Sort by date and take only 5 most recent
      allActivities.sort((a, b) => b.date - a.date);
      setRecentActivities(allActivities.slice(0, 5));
    } catch (error) {
      console.error('Chyba při načítání nedávné aktivity:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchAllAchievements = async () => {
    if (!currentUser) return;

    try {
      // Fetch all active achievements from database
      const { data: achievementsData, error } = await supabase
        .from('piano_achievements')
        .select('*')
        .eq('is_active', true)
        .order('xp_reward', { ascending: true });

      if (error) {
        console.error('Chyba při načítání achievementů:', error);
        return;
      }

      // Get user's earned achievements IDs with dates
      const earnedAchievements = currentUser.achievements || [];
      const earnedMap = new Map(earnedAchievements.map(a => [a.id, a]));

      // Calculate progress for each achievement
      const mergedAchievements = achievementsData.map(achievement => {
        const isEarned = earnedMap.has(achievement.id);
        const earnedData = earnedMap.get(achievement.id);

        // Calculate progress based on requirement type
        let progress = 0;
        let currentValue = 0;
        const requirementValue = achievement.requirement_value || 0;

        if (!isEarned) {
          switch (achievement.requirement_type) {
            case 'total_xp':
              currentValue = currentUser.stats?.total_xp || 0;
              break;
            case 'level':
              currentValue = currentUser.stats?.level || 1;
              break;
            case 'current_streak':
              currentValue = currentUser.stats?.current_streak || 0;
              break;
            case 'lessons_completed':
              currentValue = currentUser.stats?.lessons_completed || 0;
              break;
            case 'quizzes_completed':
              currentValue = currentUser.stats?.quizzes_completed || 0;
              break;
            case 'songs_completed':
              currentValue = currentUser.stats?.songs_completed || 0;
              break;
            default:
              currentValue = 0;
          }
          progress = requirementValue > 0 ? Math.min((currentValue / requirementValue) * 100, 100) : 0;
        } else {
          progress = 100;
        }

        return {
          ...achievement,
          isEarned,
          earnedAt: earnedData?.earnedAt || null,
          progress,
          currentValue,
          requirementValue
        };
      });

      setAllAchievements(mergedAchievements);
    } catch (error) {
      console.error('Chyba při načítání achievementů:', error);
    } finally {
      setLoadingAchievements(false);
    }
  };

  // Handle stat card click - filter achievements and switch to achievements tab
  const handleStatClick = (filterType) => {
    setActiveFilter(filterType);
    setActiveTab('achievements');

    // Scroll to achievements section
    setTimeout(() => {
      const achievementsSection = document.querySelector('[data-section="achievements"]');
      if (achievementsSection) {
        achievementsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Fetch activities that contributed to achievement
  const fetchAchievementActivities = async (achievement) => {
    if (!currentUser) return;

    console.log('🔍 Fetching activities for:', achievement.title);
    console.log('📊 Type:', achievement.requirement_type, 'Value:', achievement.requirementValue);
    console.log('✓ Is earned:', achievement.isEarned, 'Earned at:', achievement.earnedAt);

    setLoadingModalActivities(true);
    try {
      const activities = [];
      const requirementValue = achievement.requirementValue || 10;

      // Don't use date filtering - just get first X activities chronologically
      // This ensures we get the activities that actually led to earning the achievement
      console.log('🎯 Requirement:', requirementValue, 'Is earned:', achievement.isEarned);

      switch (achievement.requirement_type) {
        case 'lessons_completed': {
          // Get first X lessons chronologically
          const { data } = await supabase
            .from('piano_lesson_completions')
            .select('lesson_title, completed_at, xp_earned')
            .eq('user_id', currentUser.id)
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
          const quizTables = [
            { table: 'piano_quiz_theory_completions', title: 'Kvíz: Hudební teorie' },
            { table: 'piano_quiz_interval_completions', title: 'Kvíz: Intervaly' },
            { table: 'piano_quiz_scale_completions', title: 'Kvíz: Stupnice' },
            { table: 'piano_quiz_rhythm_completions', title: 'Kvíz: Rytmus' },
            { table: 'piano_quiz_mixed_completions', title: 'Kvíz: Mix' }
          ];

          // Collect all quizzes
          const allQuizzes = [];
          for (const quizTable of quizTables) {
            try {
              const { data } = await supabase
                .from(quizTable.table)
                .select('completed_at, is_correct')
                .eq('user_id', currentUser.id)
                .order('completed_at', { ascending: true});

              if (data) {
                data.forEach(item => allQuizzes.push({
                  title: quizTable.title,
                  date: new Date(item.completed_at),
                  xp: item.is_correct ? 100 : 0
                }));
              }
            } catch (err) {
              console.log(`Error loading ${quizTable.table}:`, err.message);
            }
          }

          // Sort chronologically and take first X
          allQuizzes.sort((a, b) => a.date - b.date);
          activities.push(...allQuizzes.slice(0, requirementValue));
          break;
        }

        case 'songs_completed': {
          // Get first X songs chronologically
          const { data } = await supabase
            .from('piano_song_completions')
            .select('song_title, completed_at')
            .eq('user_id', currentUser.id)
            .order('completed_at', { ascending: true })
            .limit(requirementValue);

          if (data) {
            data.forEach(item => activities.push({
              title: item.song_title || 'Píseň',
              date: new Date(item.completed_at),
              xp: 100
            }));
          }
          break;
        }

        case 'xp':
        case 'total_xp':
        case 'streak':
        case 'current_streak': {
          // For XP and streak, collect activities and calculate cumulative XP up to requirementValue
          console.log('💡 Loading activities for XP/streak type');
          const allActivities = [];

          // Get all lessons
          const { data: lessonData } = await supabase
            .from('piano_lesson_completions')
            .select('lesson_title, completed_at, xp_earned')
            .eq('user_id', currentUser.id)
            .order('completed_at', { ascending: true });

          if (lessonData) {
            lessonData.forEach(item => allActivities.push({
              title: item.lesson_title || 'Lekce',
              date: new Date(item.completed_at),
              xp: item.xp_earned || 50
            }));
          }

          // Get all songs
          const { data: songData } = await supabase
            .from('piano_song_completions')
            .select('song_title, completed_at')
            .eq('user_id', currentUser.id)
            .order('completed_at', { ascending: true });

          if (songData) {
            songData.forEach(item => allActivities.push({
              title: item.song_title || 'Píseň',
              date: new Date(item.completed_at),
              xp: 100
            }));
          }

          // Sort chronologically
          allActivities.sort((a, b) => a.date - b.date);

          // Calculate cumulative XP and take activities until we reach requirementValue
          let cumulativeXP = 0;
          for (const activity of allActivities) {
            if (cumulativeXP >= requirementValue) break;
            activities.push(activity);
            cumulativeXP += activity.xp;
          }

          console.log('📊 XP/streak activities:', activities.length, `(total: ${cumulativeXP} XP)`);
          break;
        }
      }

      console.log('✅ Loaded activities:', activities.length, activities);
      setAchievementActivities(activities);

      // Update achievement's earnedAt to match last activity date
      if (achievement.isEarned && activities.length > 0) {
        const lastActivity = activities[activities.length - 1];
        const updatedAchievement = {
          ...achievement,
          earnedAt: lastActivity.date.toISOString()
        };

        // Update in allAchievements array so card shows correct date
        setAllAchievements(prev =>
          prev.map(a => a.id === achievement.id ? updatedAchievement : a)
        );

        // Update selected achievement for modal
        setSelectedAchievement(updatedAchievement);
      }
    } catch (error) {
      console.error('❌ Error fetching achievement activities:', error);
    } finally {
      setLoadingModalActivities(false);
    }
  };

  // Handle achievement click - open modal
  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
    fetchAchievementActivities(achievement);
  };

  // Navigate to relevant section based on achievement type
  const navigateToAchievementSection = (requirementType, e) => {
    e?.stopPropagation();
    console.log('🚀 Navigating to:', requirementType);

    const navigationMap = {
      'lessons_completed': '/lekce',
      'xp': '/lekce',
      'total_xp': '/lekce',
      'streak': '/lekce',
      'current_streak': '/lekce',
      'quizzes_completed': '/teorie',
      'songs_completed': '/cviceni'
    };

    const path = navigationMap[requirementType];
    console.log('📍 Path:', path);

    if (path) {
      setIsModalOpen(false);
      navigate(path);
    }
  };

  if (!currentUser) {
    return null;
  }

  const completedLessons = currentUser.stats?.lessons_completed || 0;
  const totalLessons = lessons.length;
  const points = currentUser.stats?.total_xp || 0;
  const streak = currentUser.stats?.current_streak || 0;

  // DEBUG: Zkontrolovat achievements
  console.log('🏆 All achievements v dashboardu:', allAchievements);
  console.log('👤 CurrentUser:', currentUser);
  const quizzesCompleted = currentUser.stats?.quizzes_completed || 0;
  const songsCompleted = currentUser.stats?.songs_completed || 0;

  return (
    <div className="container">
      {/* Welcome Section */}
      <div className="card" style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: '0 8px 32px rgba(181, 31, 101, 0.15)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>
          Vítejte, {toVocative(currentUser.first_name)}!
        </h1>
        <p style={{ color: '#64748b' }}>
          Těšíte se na svoje další pokroky? Pojďme na to! 
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleStatClick('lessons_completed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              transition: 'background 0.2s'
            }}
            whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.05)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(181, 31, 101, 0.2)',
                boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
              }}
            >
              <Award size={24} color="var(--color-primary)" />
            </motion.div>
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}
              >
                {completedLessons}
              </motion.div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených lekcí</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(181, 31, 101, 0.2)',
                boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
              }}
            >
              <BookOpen size={24} color="var(--color-primary)" />
            </motion.div>
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}
              >
                {totalLessons}
              </motion.div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dostupných lekcí</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => handleStatClick('total_xp')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              transition: 'background 0.2s'
            }}
            whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.05)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(181, 31, 101, 0.2)',
                boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
              }}
            >
              <Zap size={24} color="var(--color-primary)" />
            </motion.div>
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}
              >
                {points}
              </motion.div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Bodů</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => handleStatClick('current_streak')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              transition: 'background 0.2s'
            }}
            whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.05)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(181, 31, 101, 0.2)',
                boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
              }}
            >
              <Flame size={24} color="var(--color-primary)" />
            </motion.div>
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: 'spring' }}
                style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}
              >
                {streak}
              </motion.div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dní v řadě</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            onClick={() => handleStatClick('quizzes_completed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              transition: 'background 0.2s'
            }}
            whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.05)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(181, 31, 101, 0.2)',
                boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
              }}
            >
              <Gamepad2 size={24} color="var(--color-primary)" />
            </motion.div>
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: 'spring' }}
                style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}
              >
                {quizzesCompleted}
              </motion.div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených kvízů</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            onClick={() => handleStatClick('songs_completed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              transition: 'background 0.2s'
            }}
            whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.05)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(181, 31, 101, 0.2)',
                boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
              }}
            >
              <Music size={24} color="var(--color-primary)" />
            </motion.div>
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3, type: 'spring' }}
                style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}
              >
                {songsCompleted}
              </motion.div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Zahraných písní</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Achievements & Leaderboard Section */}
      <motion.div
        className="card"
        data-section="achievements"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: '0 8px 32px rgba(181, 31, 101, 0.15)',
          marginBottom: '2rem'
        }}
      >
        {/* Tabs */}
        <div style={{ marginBottom: '2rem' }}>
          <TabButtons
            tabs={[
              { id: 'achievements', label: 'Vaše odměny', icon: Trophy },
              { id: 'leaderboard', label: 'Žebříček', icon: Target }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            options={{ layout: 'pill', size: 'md' }}
          />
        </div>

        {/* Tab Content */}
        {console.log('🔍 ActiveTab:', activeTab, 'Achievements length:', allAchievements.length, 'ActiveFilter:', activeFilter)}
        {activeTab === 'achievements' && (
          <div>
            {/* Filter indicator */}
            {activeFilter && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(181, 31, 101, 0.1)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(181, 31, 101, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                  Zobrazeny achievementy pro: {
                    activeFilter === 'lessons_completed' ? 'Dokončené lekce' :
                    activeFilter === 'total_xp' ? 'Body' :
                    activeFilter === 'current_streak' ? 'Dny v řadě' :
                    activeFilter === 'quizzes_completed' ? 'Dokončené kvízy' :
                    activeFilter === 'songs_completed' ? 'Zahrané písně' : ''
                  }
                </span>
                <button
                  onClick={() => setActiveFilter(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  Zobrazit vše
                </button>
              </div>
            )}

            {loadingAchievements ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#64748b'
              }}>
                Načítání achievementů...
              </div>
            ) : allAchievements.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#64748b',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(45, 91, 120, 0.2)'
              }}>
                <Trophy size={48} color="var(--color-primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Zatím nejsou k dispozici žádné odměny.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {allAchievements.map((achievement, index) => {
                  const isEarned = achievement.isEarned;
                  const isHighlighted = !activeFilter || achievement.requirement_type === activeFilter;
                  const isDimmed = activeFilter && achievement.requirement_type !== activeFilter;

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                        opacity: isDimmed ? 0.3 : 1
                      }}
                      transition={{ delay: index * 0.05, type: 'spring' }}
                      whileHover={{ scale: isDimmed ? 1 : 1.05, y: isDimmed ? 0 : -5 }}
                      onClick={() => !isDimmed && handleAchievementClick(achievement)}
                      style={{
                        padding: '1.5rem',
                        background: isDimmed
                          ? 'rgba(255, 255, 255, 0.3)'
                          : isEarned
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        borderRadius: 'var(--radius)',
                        border: isDimmed
                          ? '2px solid rgba(148, 163, 184, 0.15)'
                          : isEarned
                            ? '2px solid rgba(181, 31, 101, 0.4)'
                            : '2px solid rgba(148, 163, 184, 0.3)',
                        textAlign: 'center',
                        cursor: isDimmed ? 'default' : 'pointer',
                        boxShadow: isDimmed
                          ? 'none'
                          : isEarned
                            ? '0 8px 24px rgba(181, 31, 101, 0.25)'
                            : '0 4px 12px rgba(148, 163, 184, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                        position: 'relative',
                        filter: isDimmed ? 'grayscale(80%)' : 'none',
                        transform: isHighlighted && activeFilter ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                      title={isDimmed ? achievement.description : 'Klikněte pro více informací'}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '64px',
                        height: '64px',
                        background: isEarned
                          ? 'rgba(255, 255, 255, 0.95)'
                          : 'rgba(226, 232, 240, 0.6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isEarned
                          ? '2px solid rgba(181, 31, 101, 0.3)'
                          : '2px solid rgba(148, 163, 184, 0.3)',
                        boxShadow: isEarned
                          ? '0 4px 16px rgba(181, 31, 101, 0.25)'
                          : '0 2px 8px rgba(148, 163, 184, 0.15)',
                        filter: isEarned ? 'none' : 'grayscale(70%)'
                      }}>
                        {getAchievementIcon(achievement)}
                      </div>

                      {/* Title */}
                      <div style={{
                        fontWeight: 600,
                        color: isEarned ? '#1e293b' : '#64748b',
                        fontSize: '0.95rem',
                        lineHeight: '1.3'
                      }}>
                        {achievement.title}
                      </div>

                      {/* Description */}
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        lineHeight: '1.4',
                        minHeight: '2.8em'
                      }}>
                        {achievement.description}
                      </div>

                      {/* XP Reward */}
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: isEarned ? 'var(--color-primary)' : '#94a3b8',
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius)',
                        background: isEarned
                          ? 'rgba(181, 31, 101, 0.1)'
                          : 'rgba(148, 163, 184, 0.1)',
                        border: isEarned
                          ? '1px solid rgba(181, 31, 101, 0.2)'
                          : '1px solid rgba(148, 163, 184, 0.2)'
                      }}>
                        +{achievement.xp_reward} XP
                      </div>

                      {/* Progress Bar for Unearned */}
                      {!isEarned && (
                        <div style={{ width: '100%', marginTop: '0.25rem' }}>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#64748b',
                            marginBottom: '0.375rem',
                            fontWeight: 500
                          }}>
                            {achievement.currentValue} / {achievement.requirementValue}
                          </div>
                          <div style={{
                            width: '100%',
                            height: '6px',
                            background: 'rgba(148, 163, 184, 0.2)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${achievement.progress}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, rgba(181, 31, 101, 0.6), rgba(221, 51, 121, 0.6))',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Earned Date */}
                      {isEarned && achievement.earnedAt && (
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#94a3b8',
                          marginTop: '0.25rem'
                        }}>
                          Získáno {new Date(achievement.earnedAt).toLocaleDateString('cs-CZ')}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && <Leaderboard />}
      </motion.div>

      {/* Recent Activity */}
      {!loadingActivities && recentActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: 0
            }}>
              <History size={24} color="var(--color-primary)" />
              Nedávná aktivita
            </h2>
            <Link
              to="/history"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Ukázat všechno →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              const formatDate = (date) => {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                return `${day}.${month}.`;
              };
              const formatTime = (date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
              };

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="card"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius)',
                    background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.15) 0%, rgba(221, 51, 121, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(181, 31, 101, 0.2)',
                    flexShrink: 0
                  }}>
                    <Icon size={20} color="var(--color-primary)" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {activity.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginTop: '0.25rem'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {formatDate(activity.date)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {formatTime(activity.date)}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.15) 0%, rgba(221, 51, 121, 0.15) 100%)',
                    border: '2px solid rgba(181, 31, 101, 0.2)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    +{activity.xp} XP
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Achievement Detail Modal */}
      {isModalOpen && selectedAchievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            console.log('🖱️ Overlay clicked');
            setIsModalOpen(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => {
              console.log('📦 Modal content clicked');
              e.stopPropagation();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(30px)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(181, 31, 101, 0.3)',
              boxShadow: '0 20px 60px rgba(181, 31, 101, 0.3)',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(148, 163, 184, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
                zIndex: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'}
            >
              <X size={18} color="#64748b" />
            </button>

            {/* Modal Content */}
            <div style={{ padding: '2rem' }}>
              {/* Icon */}
              <div style={{
                width: '96px',
                height: '96px',
                background: selectedAchievement.isEarned
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(226, 232, 240, 0.6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: selectedAchievement.isEarned
                  ? '3px solid rgba(181, 31, 101, 0.3)'
                  : '3px solid rgba(148, 163, 184, 0.3)',
                boxShadow: selectedAchievement.isEarned
                  ? '0 8px 24px rgba(181, 31, 101, 0.25)'
                  : '0 4px 12px rgba(148, 163, 184, 0.15)',
                filter: selectedAchievement.isEarned ? 'none' : 'grayscale(70%)',
                margin: '0 auto 1.5rem'
              }}>
                <div style={{ transform: 'scale(1.5)' }}>
                  {getAchievementIcon(selectedAchievement)}
                </div>
              </div>

              {/* Title */}
              <h2 style={{
                textAlign: 'center',
                color: '#1e293b',
                marginBottom: '0.75rem',
                fontSize: '1.5rem'
              }}>
                {selectedAchievement.title}
              </h2>

              {/* Status Badge */}
              <div style={{
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.375rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: selectedAchievement.isEarned
                    ? 'rgba(181, 31, 101, 0.15)'
                    : 'rgba(148, 163, 184, 0.15)',
                  color: selectedAchievement.isEarned
                    ? 'var(--color-primary)'
                    : '#64748b',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: selectedAchievement.isEarned
                    ? '1px solid rgba(181, 31, 101, 0.3)'
                    : '1px solid rgba(148, 163, 184, 0.3)'
                }}>
                  {selectedAchievement.isEarned ? '✓ Splněno' : 'Nesplněno'}
                </span>
              </div>

              {/* Description */}
              <p style={{
                textAlign: 'center',
                color: '#64748b',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontSize: '0.95rem'
              }}>
                {selectedAchievement.description}
              </p>

              {/* Divider */}
              <div style={{
                height: '1px',
                background: 'rgba(148, 163, 184, 0.2)',
                marginBottom: '1.5rem'
              }} />

              {/* Requirements & Progress */}
              <div style={{
                background: 'rgba(248, 250, 252, 0.8)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                    Požadavky
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {selectedAchievement.currentValue} / {selectedAchievement.requirementValue}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(148, 163, 184, 0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${selectedAchievement.progress}%`,
                    height: '100%',
                    background: selectedAchievement.isEarned
                      ? 'linear-gradient(90deg, rgba(181, 31, 101, 0.8), rgba(221, 51, 121, 0.8))'
                      : 'linear-gradient(90deg, rgba(181, 31, 101, 0.5), rgba(221, 51, 121, 0.5))',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* XP Reward */}
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(181, 31, 101, 0.08)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(181, 31, 101, 0.2)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Odměna
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  +{selectedAchievement.xp_reward} XP
                </div>
              </div>

              {/* Earned Date - show date of last contributing activity */}
              {selectedAchievement.isEarned && achievementActivities.length > 0 && (() => {
                const lastActivity = achievementActivities[achievementActivities.length - 1];
                console.log('📅 Last activity date:', lastActivity.date);
                return (
                  <div style={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    marginBottom: '1.5rem'
                  }}>
                    Splněno {lastActivity.date.toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                );
              })()}

              {/* Activity Details Section */}
              {achievementActivities.length > 0 && (
                <div style={{
                  marginBottom: '1.5rem',
                  borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                  paddingTop: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    {selectedAchievement.isEarned ? 'Splněno díky' : 'Váš pokrok'}
                  </h3>

                  {loadingModalActivities ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                      Načítání...
                    </div>
                  ) : (
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '0.5rem'
                    }}>
                      {achievementActivities.map((activity, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: 'rgba(248, 250, 252, 0.6)',
                            borderRadius: 'var(--radius)',
                            marginBottom: '0.5rem',
                            border: '1px solid rgba(148, 163, 184, 0.15)'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#1e293b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {activity.title}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              marginTop: '0.125rem'
                            }}>
                              {activity.date.toLocaleDateString('cs-CZ', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(181, 31, 101, 0.1)',
                            borderRadius: 'var(--radius)',
                            marginLeft: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}>
                            +{activity.xp} XP
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {!selectedAchievement.isEarned && (
                <button
                  onClick={(e) => {
                    console.log('🔘 Button clicked!', e);
                    console.log('🎯 Achievement type:', selectedAchievement.requirement_type);
                    navigateToAchievementSection(selectedAchievement.requirement_type, e);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, rgba(181, 31, 101, 1) 0%, rgba(221, 51, 121, 1) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 12px rgba(181, 31, 101, 0.3)',
                    pointerEvents: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    console.log('🖱️ Mouse entered button');
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(181, 31, 101, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 31, 101, 0.3)';
                  }}
                >
                  Jít splnit
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default UserDashboard;
