import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, BookOpen, Trophy, Flame, Zap, Piano, Star, Target, GraduationCap, History, Music, Gamepad2, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import LessonList from '../components/lessons/LessonList';
import useUserStore from '../store/useUserStore';
import useLessonStore from '../store/useLessonStore';
import { supabase } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';

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
  const lessons = useLessonStore((state) => state.lessons);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    } else {
      fetchRecentActivities();
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

      // Fetch recent quiz completions
      const { data: quizzes } = await supabase
        .from('piano_quiz_completions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('completed_at', { ascending: false })
        .limit(3);

      if (quizzes) {
        quizzes.forEach(quiz => {
          allActivities.push({
            id: `quiz-${quiz.id}`,
            type: 'quiz',
            title: 'Poznáte akord?',
            date: new Date(quiz.completed_at),
            xp: quiz.xp_earned || 50,
            icon: Gamepad2
          });
        });
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

  if (!currentUser) {
    return null;
  }

  const completedLessons = currentUser.stats?.lessons_completed || 0;
  const totalLessons = lessons.length;
  const points = currentUser.stats?.total_xp || 0;
  const streak = currentUser.stats?.current_streak || 0;
  const achievements = currentUser.achievements || [];

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

        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
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
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div
          className="card"
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
          <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy size={24} color="var(--color-primary)" />
            Vaše odměny
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {achievements.map((achievement, index) => {
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  style={{
                    padding: '2rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    borderRadius: 'var(--radius)',
                    border: '2px solid rgba(181, 31, 101, 0.3)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(181, 31, 101, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  title={achievement.description}
                >
                  <div style={{
                    width: '72px',
                    height: '72px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(181, 31, 101, 0.2)',
                    boxShadow: '0 4px 16px rgba(181, 31, 101, 0.25)'
                  }}>
                    {getAchievementIcon(achievement)}
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    +{achievement.xp_reward} XP
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

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

      {/* Lessons */}
      <LessonList />
    </div>
  );
}

export default UserDashboard;
