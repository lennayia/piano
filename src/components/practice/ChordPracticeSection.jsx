import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronRight, ChevronLeft, Volume2, CheckCircle } from 'lucide-react';
import useUserStore from '../../store/useUserStore';
import PianoKeyboard from '../lessons/PianoKeyboard';
import { IconButton, MelodyNote } from '../ui/ButtonComponents';
import { ProgressBar, InfoPanel, Card, PageCard } from '../ui/CardComponents';
import PracticeModeControls from '../ui/PracticeModeControls';
import { RADIUS, SHADOW } from '../../utils/styleConstants';
import audioEngine from '../../utils/audio';
import useProgressTracking from '../../hooks/useProgressTracking';
import PracticeCelebration from './PracticeCelebration';
import { celebrate, triggerCelebration } from '../../services/celebrationService';

/**
 * ChordPracticeSection - Samostatná komponenta pro procvičování akordů
 *
 * @param {object} props
 * @param {array} props.chords - Pole akordů k procvičování
 * @param {string} props.selectedDifficulty - Vybraná obtížnost ('all', 'easy', 'medium')
 * @param {boolean} props.isShuffled - Jsou akordy zamíchané?
 * @param {object} props.currentUser - Aktuální uživatel
 * @param {function} props.onDailyGoalComplete - Callback při splnění denního cíle
 * @param {function} props.onResetProgress - Callback pro reset progressu
 */
function ChordPracticeSection({
  chords,
  selectedDifficulty,
  isShuffled,
  currentUser,
  onDailyGoalComplete,
  onResetProgress
}) {
  // State pro chord practice
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [practicingMode, setPracticingMode] = useState(false); // režim procvičování S nápovědou
  const [challengeMode, setChallengeMode] = useState(false); // režim výzvy BEZ nápovědy (pro odměny)
  const [practiceErrors, setPracticeErrors] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const celebrationTriggeredRef = useRef(false);

  // Hook pro sledování pokroku (dokončených akordů)
  const { completedCount, incrementCompleted, resetProgress } = useProgressTracking();
  const [completedChordIds, setCompletedChordIds] = useState(new Set()); // Challenge mode
  const [practiceCompletedChordIds, setPracticeCompletedChordIds] = useState(new Set()); // Practice mode

  const [playingNoteIndex, setPlayingNoteIndex] = useState(-1);
  const [isPlayingFullChord, setIsPlayingFullChord] = useState(false);

  // Reset při změně obtížnosti nebo míchání
  useEffect(() => {
    setCurrentChordIndex(0);
    resetProgress();
    setCompletedChordIds(new Set());
    setPracticeCompletedChordIds(new Set());
    celebrationTriggeredRef.current = false;
    resetPractice();

    // Volat callback pro reset progress v rodiči
    if (onResetProgress) {
      onResetProgress();
    }
  }, [selectedDifficulty, isShuffled, chords.length]);

  // Sledování dokončení série v režimu Procvičovat
  useEffect(() => {
    if (practicingMode && chords.length > 0 && practiceCompletedChordIds.size === chords.length) {
      setTimeout(() => {
        // Odměny a statistiky JEN při dokončení "Všechny akordy"
        if (selectedDifficulty === 'all') {
          // Zvýšit denní cíl
          if (onDailyGoalComplete) {
            onDailyGoalComplete();
          }

          audioEngine.playSuccess();
          alert(`🎉 Série dokončena!\n\nZahráli jste všechny akordy (${chords.length} akordů).\n\nDenní cíl: +1 série procvičování\n✅ Uloženo do statistik`);
        } else {
          audioEngine.playSuccess();
          alert(`✅ Dokončili jste všechny akordy v obtížnosti (${chords.length} akordů).\n\nℹ️ Pro odměny a statistiky procvičujte "Všechny akordy".`);
        }

        // Reset pro novou sérii
        setPracticeCompletedChordIds(new Set());
      }, 500);
    }
  }, [practiceCompletedChordIds, chords.length, practicingMode, selectedDifficulty, onDailyGoalComplete]);

  // Sledování dokončení všech akordů - VELKÁ OSLAVA! 🎉 (JEN v režimu Výzvy)
  useEffect(() => {
    if (challengeMode && completedCount > 0 && chords.length > 0 && completedCount === chords.length && !celebrationTriggeredRef.current) {
      setTimeout(async () => {
        if (celebrationTriggeredRef.current) return;
        celebrationTriggeredRef.current = true;

        audioEngine.playSuccess();
        setShowCelebration(true);
        setShowSuccessModal(true);

        // Odměny a uložení do DB JEN při dokončení "Všechny akordy"
        if (selectedDifficulty === 'all') {
          try {
            const result = await celebrate({
              type: 'chord_practice',
              userId: currentUser.id,
              itemId: 'chord_series',
              itemTitle: `Série ${chords.length} akordů`,
              metadata: {
                chordsCompleted: chords.length,
                difficulty: selectedDifficulty,
                isShuffled: isShuffled,
                mode: 'challenge'
              }
            });

            if (result.success) {
              const updateUserStats = useUserStore.getState().updateUserStats;
              if (updateUserStats) {
                updateUserStats();
              }

              if (result.data?.leveledUp && result.data?.levelUpConfig) {
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
                }, 3500);
              }
            }
          } catch (error) {
            console.error('Chyba při ukládání dokončení akordů:', error);
          }
        } else {
          setTimeout(() => {
            alert(`✅ Dokončili jste všechny akordy v obtížnosti!\n\nℹ️ Pro odměny, XP a statistiky dokončete "Všechny akordy" v režimu Výzva.`);
          }, 1000);
        }
      }, 500);
    }
  }, [challengeMode, completedCount, chords.length, currentUser, selectedDifficulty, isShuffled]);

  const currentChord = chords[currentChordIndex];
  const chordNotesWithOctaves = currentChord?.notes || [];

  // Přehrát celý akord najednou
  const playFullChord = useCallback(() => {
    if (!currentChord) return;

    setIsPlayingFullChord(true);

    chordNotesWithOctaves.forEach((note, index) => {
      setTimeout(() => {
        audioEngine.playNote(note, 1.0);
        if (index === chordNotesWithOctaves.length - 1) {
          setTimeout(() => setIsPlayingFullChord(false), 300);
        }
      }, index * 50);
    });
  }, [currentChord, chordNotesWithOctaves]);

  // Přehrát akord postupně (arpeggio)
  const playArpeggio = useCallback(() => {
    if (!currentChord) return;

    chordNotesWithOctaves.forEach((note, index) => {
      setTimeout(() => {
        setPlayingNoteIndex(index);
        audioEngine.playNote(note, 1.0);
        if (index === chordNotesWithOctaves.length - 1) {
          setTimeout(() => setPlayingNoteIndex(-1), 300);
        }
      }, index * 400);
    });
  }, [currentChord, chordNotesWithOctaves]);

  // Handler pro klik na klávesu
  const handleNoteClick = useCallback((note) => {
    if (!currentChord) return;

    const requiredNotes = chordNotesWithOctaves;
    const currentIndex = playedNotes.length % requiredNotes.length;
    const expectedNote = requiredNotes[currentIndex];

    if (note !== expectedNote) {
      audioEngine.playError();
      setShowError(true);
      setPracticeErrors(prev => prev + 1);

      // VÝZVA: Reset na ZAČÁTEK CELÉ SÉRIE při jakékoliv chybě
      if (challengeMode) {
        setTimeout(() => {
          setPlayedNotes([]);
          setPracticeErrors(0);
          setCurrentChordIndex(0);
          setCompletedChordIds(new Set());
          resetProgress();
          celebrationTriggeredRef.current = false;
        }, 1000);
      }

      setTimeout(() => {
        setShowError(false);
      }, 1000);
      return;
    }

    const newPlayedNotes = [...playedNotes, note];
    setPlayedNotes(newPlayedNotes);

    const isFirstCompletion = newPlayedNotes.length === requiredNotes.length;
    const isPerfect = practiceErrors === 0;

    if (!showSuccess && isFirstCompletion && isPerfect) {
      setTimeout(() => {
        audioEngine.playSuccess();
        setShowSuccess(true);

        // Zvýšit počítadlo JEN v režimu Výzvy
        if (challengeMode && !completedChordIds.has(currentChord.id)) {
          incrementCompleted();
          setCompletedChordIds(prev => new Set(prev).add(currentChord.id));
        }

        // V režimu Procvičovat - označit akord jako dokončený
        if (practicingMode && !practiceCompletedChordIds.has(currentChord.id)) {
          setPracticeCompletedChordIds(prev => new Set(prev).add(currentChord.id));
        }

        // Automatický přechod na další akord
        setTimeout(() => {
          nextChord();
        }, 1500);
      }, 300);
    }
  }, [currentChord, chordNotesWithOctaves, playedNotes, practiceErrors, showSuccess, challengeMode, practicingMode, completedChordIds, practiceCompletedChordIds]);

  // Reset aktuálního cvičení
  const resetPractice = () => {
    setPlayedNotes([]);
    setShowSuccess(false);
    setShowError(false);
    setPracticeErrors(0);
  };

  // Přejít na další akord
  const nextChord = () => {
    if (currentChordIndex < chords.length - 1) {
      setCurrentChordIndex(currentChordIndex + 1);
    } else {
      setCurrentChordIndex(0);
    }
    resetPractice();
  };

  // Přejít na předchozí akord
  const prevChord = () => {
    if (currentChordIndex > 0) {
      setCurrentChordIndex(currentChordIndex - 1);
    } else {
      setCurrentChordIndex(chords.length - 1);
    }
    resetPractice();
  };

  if (!chords || chords.length === 0) {
    return null;
  }

  return (
    <>
      {/* Progress bar - jen pro challenge mode */}
      {challengeMode && (
        <div className="container" style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 1rem' }}>
          <ProgressBar
            current={completedCount}
            total={chords.length}
            title="Režim výzva:"
            titleColor="var(--color-primary)"
          />
        </div>
      )}

      {/* Hlavní karta cvičení */}
      <div className="container" style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <PageCard
          as={motion.div}
          key={currentChordIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ marginBottom: '2rem' }}
        >
          {/* Název akordu s navigací */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <IconButton
              icon={ChevronLeft}
              onClick={prevChord}
              variant="secondary"
              size={40}
              iconSize={24}
              ariaLabel="Předchozí akord"
            />
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                margin: 0
              }}
            >
              {currentChord?.name}
            </motion.h2>
            <IconButton
              icon={ChevronRight}
              onClick={nextChord}
              variant="primary"
              size={40}
              iconSize={24}
              ariaLabel="Další akord"
            />
          </div>

          {/* Tóny k zahrání - skryté v režimu výzvy */}
          {!challengeMode && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              padding: '0.5rem'
            }}>
              {chordNotesWithOctaves.map((note, index) => {
                const isPlayed = playedNotes.includes(note);
                const isCurrent = (practicingMode || challengeMode)
                  ? playedNotes.length === index
                  : isPlayingFullChord
                  ? true
                  : playingNoteIndex === index;
                const displayNote = currentChord?.notes[index] || note;

                return (
                  <motion.div
                    key={note}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                    onClick={() => audioEngine.playNote(note, 1.0)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <MelodyNote
                      note={displayNote}
                      isCurrent={isCurrent}
                      isNext={false}
                      isPlayed={isPlayed}
                    />
                    {isPlayed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px'
                        }}
                      >
                        <CheckCircle size={24} color="white" fill="var(--color-primary)" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Režimy cvičení s přehrávacími tlačítky */}
          <PracticeModeControls
            isPracticing={practicingMode}
            isChallenge={challengeMode}
            practiceErrors={practiceErrors}
            progress={playedNotes.length}
            totalNotes={chordNotesWithOctaves.length}
            onStartPractice={() => {
              setPracticingMode(true);
              setChallengeMode(false);
              setPracticeErrors(0);
              setPlayedNotes([]);
              setShowSuccess(false);
            }}
            onStartChallenge={() => {
              setPracticingMode(false);
              setChallengeMode(true);
              setPracticeErrors(0);
              setPlayedNotes([]);
              setShowSuccess(false);
            }}
            onStop={() => {
              setPracticingMode(false);
              setChallengeMode(false);
              setPracticeErrors(0);
              setPlayedNotes([]);
              setShowSuccess(false);
            }}
            showStopButton={true}
            showSuccess={showSuccess}
            showError={showError}
            onReset={resetPractice}
          >
            {/* Přehrávací tlačítka */}
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={playArpeggio}
              className="btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                background: 'rgba(45, 91, 120, 0.1)',
                color: 'var(--color-secondary)',
                border: 'none',
                borderRadius: RADIUS.md,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Play size={16} />
              Přehrát postupně
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={playFullChord}
              className="btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                background: 'rgba(45, 91, 120, 0.1)',
                color: 'var(--color-secondary)',
                border: 'none',
                borderRadius: RADIUS.md,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Volume2 size={16} />
              Přehrát akord
            </motion.button>
          </PracticeModeControls>
        </PageCard>
      </div>

      {/* Klaviatura - plná šířka obrazovky */}
      {(practicingMode || challengeMode) && (
        <div className="container" style={{ margin: '2rem 0' }}>
          <PianoKeyboard
            highlightedNotes={
              challengeMode
                ? []
                : chordNotesWithOctaves
            }
            onNoteClick={handleNoteClick}
          />
        </div>
      )}

      {/* Stav zahraných not - pod klaviaturou */}
      {(practicingMode || challengeMode) && playedNotes.length > 0 && !showSuccess && (
        <div className="container" style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 1rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(181, 31, 101, 0.1)',
              borderRadius: RADIUS.lg,
              marginBottom: '1rem'
            }}
          >
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Zahrané tóny:</p>
            <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              {playedNotes.join(' → ')}
            </p>
          </motion.div>
        </div>
      )}

      {/* Úspěch! - VÝZVA */}
      <AnimatePresence>
        {showSuccess && challengeMode && (
          <div className="container" style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <InfoPanel
                variant="secondary"
                style={{ textAlign: 'center', padding: '2rem 1.5rem', borderRadius: RADIUS.xl }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <CheckCircle size={56} color="var(--color-secondary)" style={{ margin: '0 auto' }} />
                </motion.div>
                <h3 style={{
                  color: 'var(--color-secondary)',
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 700
                }}>
                  Výborně!
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                  Správně jste zahráli akord <strong style={{ color: 'var(--color-secondary)' }}>{currentChord?.name}</strong>
                </p>
              </InfoPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Oslava po dokončení všech akordů */}
      <PracticeCelebration
        showCelebration={showCelebration}
        showSuccessModal={showSuccessModal}
        completedItemTitle={`Všechny akordy (${chords.length} akordů)`}
        xpAwarded={chords.length * 10}
        onClose={() => {
          setShowCelebration(false);
          setShowSuccessModal(false);
          resetProgress();
        }}
      />
    </>
  );
}

export default ChordPracticeSection;
