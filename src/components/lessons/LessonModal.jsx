import { useState, useEffect } from 'react';
import { CheckCircle, Music, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import { CloseButton } from '../ui/ButtonComponents';
import PianoKeyboard from './PianoKeyboard';
import NoteCard from './NoteCard';
import { getDifficultyColor, LESSON_XP_REWARD, MODAL_AUTO_CLOSE_DELAY } from '../../utils/lessonUtils';
import { RADIUS } from '../../utils/styleConstants';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';
import { supabase } from '../../lib/supabase';
import { celebrate, triggerCelebration } from '../../services/celebrationService';

function LessonModal({ lesson, isOpen, onClose, onComplete }) {
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
        // Použít centralizovaný celebration service
        const result = await celebrate({
          type: 'lesson',
          userId: currentUser.id,
          itemId: lesson.id,
          itemTitle: lesson.title,
          metadata: {}
        });

        if (result.success) {
          setIsCompleted(true);
          audioEngine.playSuccess();

          // Aktualizovat lokální store
          const updateUserStats = useUserStore.getState().updateUserStats;
          if (updateUserStats) {
            updateUserStats();
          }

          // Pokud došlo k level-upu, zobrazit speciální oslavu
          if (result.data.leveledUp && result.data.levelUpConfig) {
            // Malé zpoždění, aby se nejdřív zavřel modal lekce
            setTimeout(() => {
              triggerCelebration(
                result.data.levelUpConfig.confettiType,
                result.data.levelUpConfig.sound,
                {
                  title: `⭐ Level ${result.data.level}!`,
                  message: `Gratulujeme! Dosáhli jste levelu ${result.data.level} s ${result.data.totalXP} XP!`,
                  type: 'success',
                  duration: 5000
                }
              );
            }, MODAL_AUTO_CLOSE_DELAY + 500);
          }

          // Zavolat callback pro denní cíl
          if (onComplete) {
            onComplete(lesson.id);
          }

          // Zavřít modal po 2 sekundách
          setTimeout(() => {
            onClose();
          }, MODAL_AUTO_CLOSE_DELAY);
        }
      } catch (error) {
        console.error('Chyba při ukládání lekce:', error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader={true}>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: 'none', boxShadow: '0 1px 0 rgba(0, 0, 0, 0.05)' }}>
          {/* První řádek: Chipy vlevo, očičko vpravo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {isCompleted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="badge badge-xs"
                  style={{
                    backgroundColor: 'var(--color-success-transparent)',
                    color: 'var(--color-success)',
                    padding: '0.2rem 0.4rem'
                  }}
                  title="Dokončeno"
                >
                  <CheckCircle size={14} />
                </motion.span>
              )}
              <span className={`badge badge-xs ${getDifficultyColor(lesson.difficulty)}`}>
                <TrendingUp size={14} />
                {lesson.difficulty}
              </span>
              <span className="badge badge-xs">
                <Clock size={14} />
                {lesson.duration}
              </span>
            </div>
            <CloseButton onClick={onClose} />
          </div>

          {/* Nadpis */}
          <h1 style={{ marginBottom: '0.75rem' }}>{lesson.title}</h1>

          {/* Popis */}
          <p>
            {lesson.description}
          </p>
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
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            borderRadius: RADIUS.lg,
            marginBottom: '2rem'
          }}>
            {lesson.content.notes.map((note, index) => (
              <NoteCard
                key={index}
                note={note}
                index={index}
              />
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
              <li key={index}>
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {/* Complete Button */}
        {currentUser && (
          <div style={{ borderTop: 'none', boxShadow: '0 -1px 0 rgba(0, 0, 0, 0.05)', paddingTop: '1.5rem', textAlign: 'center' }}>
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '1rem',
                  background: 'var(--color-success-transparent)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: RADIUS.lg,
                  textAlign: 'center',
                  color: 'var(--color-success)',
                  fontWeight: 500,
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
