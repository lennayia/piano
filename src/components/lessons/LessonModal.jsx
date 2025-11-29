import { useState, useEffect } from 'react';
import { CheckCircle, Music, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import PianoKeyboard from './PianoKeyboard';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';
import { supabase } from '../../lib/supabase';

function LessonModal({ lesson, isOpen, onClose }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser && lesson && isOpen) {
      checkLessonCompletion();
    }
  }, [lesson, currentUser, isOpen]);

  const checkLessonCompletion = async () => {
    try {
      const { data, error } = await supabase
        .from('piano_lesson_completions')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('lesson_id', lesson.id.toString())
        .limit(1);

      if (!error && data && data.length > 0) {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    } catch (error) {
      console.error('Chyba při kontrole dokončení lekce:', error);
      setIsCompleted(false);
    }
  };

  if (!lesson) return null;

  const handleComplete = async () => {
    if (currentUser && !isCompleted) {
      try {
        // 1. Uložit do historie
        const { error: lessonError } = await supabase
          .from('piano_lesson_completions')
          .insert([{
            user_id: currentUser.id,
            lesson_id: lesson.id.toString(),
            lesson_title: lesson.title,
            xp_earned: 50
          }]);

        if (lessonError) {
          console.error('Chyba při ukládání lekce:', lessonError);
          return;
        }

        // 2. Aktualizovat statistiky
        const { data: stats, error: statsError } = await supabase
          .from('piano_user_stats')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (stats && !statsError) {
          await supabase
            .from('piano_user_stats')
            .update({
              lessons_completed: (stats.lessons_completed || 0) + 1,
              total_xp: (stats.total_xp || 0) + 50,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', currentUser.id);

          // Aktualizovat lokální store
          const updateUserStats = useUserStore.getState().updateUserStats;
          if (updateUserStats) {
            updateUserStats();
          }
        }

        setIsCompleted(true);
        audioEngine.playSuccess();

        // Zavřít modal po 2 sekundách
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (error) {
        console.error('Chyba při ukládání lekce:', error);
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'začátečník':
        return 'badge-success';
      case 'mírně pokročilý začátečník':
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
            <h1>{lesson.title}</h1>
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

          <p>
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
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <h3>Interaktivní klavír</h3>
            <PianoKeyboard highlightedNotes={lesson.content.notes} />
          </div>

          <h3>Instrukce</h3>
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
