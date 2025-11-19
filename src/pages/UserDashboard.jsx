import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Trophy, Star, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import LessonList from '../components/lessons/LessonList';
import useUserStore from '../store/useUserStore';
import useLessonStore from '../store/useLessonStore';

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

  const completedLessons = currentUser.progress?.length || 0;
  const totalLessons = lessons.length;
  const points = currentUser.points || 0;
  const streak = currentUser.streak || 0;
  const achievements = currentUser.achievements || [];

  const getAchievementInfo = (achievementId) => {
    const achievementData = {
      'first-lesson': { title: 'První krok', icon: Star, color: 'rgba(255, 215, 0, 0.3)' },
      'five-lessons': { title: 'Milovník hudby', icon: Trophy, color: 'rgba(181, 31, 101, 0.3)' },
      'streak-3': { title: 'Série 3 dní', icon: Flame, color: 'rgba(255, 69, 0, 0.3)' },
      'streak-7': { title: 'Týdenní šampion', icon: Flame, color: 'rgba(255, 140, 0, 0.3)' }
    };
    return achievementData[achievementId] || { title: 'Achievement', icon: Star, color: 'rgba(45, 91, 120, 0.3)' };
  };

  return (
    <div className="container">
      {/* Welcome Section */}
      <div className="card" style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '2px solid rgba(181, 31, 101, 0.3)',
        boxShadow: '0 8px 32px rgba(181, 31, 101, 0.2)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>
          Vítejte zpět, {toVocative(currentUser.firstName)}!
        </h1>
        <p style={{ color: '#64748b' }}>
          Pokračujte ve svém učení a objevujte nové lekce
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
                background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.2) 0%, rgba(45, 91, 120, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(45, 91, 120, 0.2)'
              }}
            >
              <Award size={24} color="var(--color-secondary)" />
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
                background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.2) 0%, rgba(45, 91, 120, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(45, 91, 120, 0.2)'
              }}
            >
              <BookOpen size={24} color="var(--color-secondary)" />
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
                background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(181, 31, 101, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.2) 0%, rgba(255, 69, 0, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(255, 140, 0, 0.2)'
              }}
            >
              <Flame size={24} color="#ff8c00" />
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
            border: '2px solid rgba(181, 31, 101, 0.3)',
            boxShadow: '0 8px 32px rgba(181, 31, 101, 0.2)',
            marginBottom: '2rem'
          }}
        >
          <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy size={24} color="var(--color-primary)" />
            Vaše odměny
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {achievements.map((achId, index) => {
              const achInfo = getAchievementInfo(achId);
              const Icon = achInfo.icon;
              return (
                <motion.div
                  key={achId}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  style={{
                    padding: '1.5rem',
                    background: achInfo.color,
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius)',
                    border: '2px solid rgba(181, 31, 101, 0.3)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <Icon size={40} color="var(--color-primary)" style={{ marginBottom: '0.75rem' }} />
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem' }}>
                    {achInfo.title}
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
