import { Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import audioEngine from '../../utils/audio';

function LessonCard({ lesson }) {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'začátečník':
        return 'badge-success';
      case 'mírně pokročilý':
        return 'badge-warning';
      case 'pokročilý':
        return 'badge-primary';
      default:
        return '';
    }
  };

  const handleClick = () => {
    audioEngine.playClick();
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <motion.div
      className="card"
      style={{
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 12px 48px rgba(45, 91, 120, 0.25)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{lesson.title}</h3>
          <ChevronRight size={20} color="var(--color-text-secondary)" />
        </div>
        <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
          {lesson.description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <span className={`badge ${getDifficultyColor(lesson.difficulty)}`}>
          <TrendingUp size={14} />
          {lesson.difficulty}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <Clock size={14} />
          {lesson.duration}
        </span>
      </div>
    </motion.div>
  );
}

export default LessonCard;
