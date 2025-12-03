import { useState, useEffect, lazy, Suspense } from 'react';
import { CheckCircle, Music, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import { CloseButton, Chip } from '../ui/ButtonComponents';
import { Card } from '../ui/CardComponents';
import NoteCard from './NoteCard';
import PracticeCelebration from '../practice/PracticeCelebration';

// Lazy loading - PianoKeyboard je těžká komponenta, načte se až při otevření modalu
const PianoKeyboard = lazy(() => import('./PianoKeyboard'));
import { getDifficultyColor, LESSON_XP_REWARD, MODAL_AUTO_CLOSE_DELAY } from '../../utils/lessonUtils';
import { RADIUS } from '../../utils/styleConstants';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';
import { supabase } from '../../lib/supabase';
import { celebrate, triggerCelebration } from '../../services/celebrationService';

function LessonModal({ lesson, isOpen, onClose, onComplete }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardData, setRewardData] = useState(null);
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

          // Uložit reward data a zobrazit reward modal
          setRewardData({
            xpAwarded: result.data.xpEarned,
            icon: result.data.celebrationConfig.icon || 'BookOpen',
            iconColor: result.data.celebrationConfig.iconColor || 'var(--color-primary)',
            title: 'Výborně!',
            completedItemTitle: lesson.title,
            xpLabel: 'Odměna za dokončení lekce',
            leveledUp: result.data.leveledUp,
            newLevel: result.data.level
          });

          // Zobrazit reward modal (lesson modal zůstane otevřený na pozadí)
          setTimeout(() => {
            setShowRewardModal(true);
          }, 500);

          // Zavolat callback pro denní cíl
          if (onComplete) {
            onComplete(lesson.id);
          }
        }
      } catch (error) {
        console.error('Chyba při ukládání lekce:', error);
      }
    }
  };

  return (
    <>
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
          <Card blur="15px" opacity={0.8} style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              gap: '0.35rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {lesson.content.notes.map((note, index) => (
                <NoteCard
                  key={index}
                  note={note}
                  index={index}
                />
              ))}
            </div>
          </Card>

          {/* Interactive Piano */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>Interaktivní klavír</h3>
            <Suspense fallback={<div style={{ minHeight: '100px' }} />}>
              <PianoKeyboard highlightedNotes={lesson.content.notes} />
            </Suspense>
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
              <Card
                as={motion.div}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                blur="10px"
                opacity={0.9}
                style={{
                  textAlign: 'center',
                  color: 'var(--color-success)',
                  fontWeight: 500,
                  display: 'inline-block',
                  background: 'var(--color-success-transparent)'
                }}
              >
                <CheckCircle size={24} style={{ marginBottom: '0.5rem' }} />
                <div>Gratulujeme! Tuto lekci jste již dokončili.</div>
              </Card>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="btn btn-primary"
                style={{ padding: '1rem 2rem' }}
              >
                <CheckCircle size={20} />
                Označit jako dokončenou
              </motion.button>
            )}
          </div>
        )}
      </div>
    </Modal>

      {/* Reward Modal */}
      {rewardData && (
        <PracticeCelebration
          showCelebration={showRewardModal}
          showSuccessModal={showRewardModal}
          icon={rewardData.icon}
          iconColor={rewardData.iconColor}
          title={rewardData.title}
          completedItemTitle={rewardData.completedItemTitle}
          xpAwarded={rewardData.xpAwarded}
          xpLabel={rewardData.xpLabel}
          onClose={() => {
            setShowRewardModal(false);

            // Zavřít i lesson modal
            onClose();

            // Po zavření reward modalu zobrazit level-up, pokud nastal
            if (rewardData.leveledUp) {
              setTimeout(() => {
                triggerCelebration(
                  'golden',
                  'fanfare',
                  {
                    title: `⭐ Level ${rewardData.newLevel}!`,
                    message: `Gratulujeme! Dosáhli jste levelu ${rewardData.newLevel}!`,
                    type: 'success',
                    duration: 5000
                  }
                );
              }, 300);
            }
          }}
        />
      )}
    </>
  );
}

export default LessonModal;
