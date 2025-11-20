import { Clock, TrendingUp, ChevronRight, Edit3, Trash2, GripVertical, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import audioEngine from '../../utils/audio';

function LessonCard({ lesson, onClick, isAdmin, onEdit, onDelete, onDuplicate, dragAttributes, dragListeners }) {
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
    onClick(lesson);
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
          {/* Drag Handle (pouze pro adminy) */}
          {isAdmin && dragAttributes && dragListeners && (
            <div
              {...dragAttributes}
              {...dragListeners}
              onClick={(e) => e.stopPropagation()}
              style={{
                cursor: 'grab',
                padding: '0.25rem',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
                transition: 'opacity 0.2s',
                marginRight: '0.5rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              <GripVertical size={16} />
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{lesson.title}</h3>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDuplicate(lesson.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(181, 31, 101, 0.1)',
                      border: '1px solid rgba(181, 31, 101, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Duplikovat lekci"
                  >
                    <Copy size={14} color="var(--color-primary)" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(lesson)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(45, 91, 120, 0.1)',
                      border: '1px solid rgba(45, 91, 120, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Edit3 size={14} color="var(--color-secondary)" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(lesson.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={14} color="var(--color-danger)" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
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
