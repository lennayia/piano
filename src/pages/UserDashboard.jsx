import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Trophy, Flame, Zap, Piano, Star, Target, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import LessonList from '../components/lessons/LessonList';
import useUserStore from '../store/useUserStore';
import useLessonStore from '../store/useLessonStore';
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

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    }
  }, [currentUser, navigate]);

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

      {/* Lessons */}
      <LessonList />
    </div>
  );
}

export default UserDashboard;
