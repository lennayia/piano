import { useState, useEffect } from 'react';
import { CheckCircle, Music, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import PianoKeyboard from './PianoKeyboard';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function LessonModal({ lesson, isOpen, onClose }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserProgress = useUserStore((state) => state.updateUserProgress);

  useEffect(() => {
    if (currentUser && lesson) {
      const completed = currentUser.progress?.some(p => p.lessonId === lesson.id);
      setIsCompleted(completed);
    }
  }, [lesson, currentUser]);

  if (!lesson) return null;

  const handleComplete = () => {
    if (currentUser && !isCompleted) {
      updateUserProgress(currentUser.id, lesson.id);
      setIsCompleted(true);
      audioEngine.playSuccess();

      // Zavřít modal po 2 sekundách
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', color: '#1e293b' }}>{lesson.title}</h1>
            {isCompleted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge badge-success"
                style={{ padding: '0.5rem 1rem' }}
              >
                <CheckCircle size={16} />
                Dokončeno
              </motion.span>
            )}
          </div>

          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1rem' }}>
            {lesson.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <span className={`badge ${getDifficultyColor(lesson.difficulty)}`}>
              <TrendingUp size={14} />
              {lesson.difficulty}
            </span>
            <span className="badge">
              <Clock size={14} />
              {lesson.duration}
            </span>
          </div>
        </div>

        {/* Lesson Content */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Music size={20} />
            Noty k procvičení
          </h3>
          <div style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            borderRadius: 'var(--radius)',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}>
            {lesson.content.notes.map((note, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  border: '2px solid rgba(45, 91, 120, 0.3)',
                  boxShadow: '0 4px 15px rgba(45, 91, 120, 0.2)',
                  cursor: 'pointer'
                }}
                onClick={() => audioEngine.playNote(note, 0.5)}
              >
                {note}
              </motion.div>
            ))}
          </div>

          {/* Interactive Piano */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Interaktivní klavír</h3>
            <PianoKeyboard highlightedNotes={lesson.content.notes} />
          </div>

          <h3 style={{ marginBottom: '1rem' }}>Instrukce</h3>
          <ol style={{
            paddingLeft: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {lesson.content.instructions.map((instruction, index) => (
              <li key={index} style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#1e293b' }}>
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {/* Complete Button */}
        {currentUser && (
          <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '1.5rem', textAlign: 'center' }}>
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'center',
                  color: 'var(--color-success)',
                  fontWeight: 500,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'inline-block'
                }}
              >
                <CheckCircle size={24} style={{ marginBottom: '0.5rem' }} />
                <div>Gratulujeme! Tuto lekci jste již dokončili.</div>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="btn btn-primary"
                style={{ padding: '1rem 2rem', fontSize: '1rem' }}
              >
                <CheckCircle size={20} />
                Označit jako dokončenou
              </motion.button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default LessonModal;
