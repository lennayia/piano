import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen } from 'lucide-react';
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
        </div>
      </div>

      {/* Lessons */}
      <LessonList />
    </div>
  );
}

export default UserDashboard;
