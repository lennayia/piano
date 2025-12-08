import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, RotateCcw, Trophy, Zap, Target, Sparkles, Flame, Music, CheckCircle, XCircle, Award, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import Confetti from '../common/Confetti';
import { supabase } from '../../lib/supabase';
import useUserStore from '../../store/useUserStore';
import { sortNotesByKeyboard, shuffleArray } from '../../utils/noteUtils';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import { IconButton, BackButton, AnswerStatusChip } from '../ui/ButtonComponents';
import QuizResultsPanel from './QuizResultsPanel';
import QuizStatCard from './QuizStatCard';
import QuizStartScreen from './QuizStartScreen';
import PianoPrepareDialog from '../ui/PianoPrepareDialog';
import { calculateXP } from '../../utils/quizUtils';
import { saveQuizResults } from '../../utils/saveQuizResults';
import { triggerCelebration } from '../../services/celebrationService';
import { useResponsive } from '../../hooks/useResponsive';
import { usePiano } from '../../contexts/PianoContext';

function ChordQuiz() {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserStats = useUserStore((state) => state.updateUserStats);

  // Detekce velikosti obrazovky pro responzivitu
  const { isMobile } = useResponsive();

  // Piano Context - global piano initialization
  const { pianoReady, isLoading: pianoLoading, initPiano } = usePiano();

  const fetchChords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Načteme VŠECHNY aktivní akordy (pouze ty s notami pro poslechový kvíz)
      // BEZ možností z piano_quiz_chord_options - ty generujeme automaticky!
      const { data: chordsData, error: chordsError } = await supabase
        .from('piano_quiz_chords')
        .select('*')
        .eq('quiz_type', 'chord')
        .eq('is_active', true)
        .not('notes', 'is', null)
        .order('display_order');

      if (chordsError) throw chordsError;

      if (!chordsData || chordsData.length === 0) {
        setError('Ještě tu nejsou žádné akordy k procvičování 🎹 Ozvěte se nám, prosím.');
        setLoading(false);
        return;
      }

      // Získáme všechny názvy akordů pro generování možností
      const allChordNames = chordsData.map(chord => chord.name);

      // Transformujeme data z databáze do formátu, který kvíz očekává
      const transformedChords = chordsData.map((chord, index) => {
        // Generujeme 4 možnosti: 1 správná + 3 náhodné špatné
        const correctAnswer = chord.name;

        // Vybereme 3 náhodné špatné odpovědi (jiné názvy akordů)
        const wrongAnswers = allChordNames
          .filter(name => name !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Spojíme správnou a špatné odpovědi a zamícháme
        const allOptions = shuffleArray([correctAnswer, ...wrongAnswers]);

        // Střídat barvy mezi primary a secondary
        const colors = [
          'rgba(45, 91, 120, 0.05)', // secondary
          'rgba(181, 31, 101, 0.05)', // primary
        ];

        return {
          name: chord.name,
          notes: chord.notes || [],
          options: allOptions,
          correctAnswer: correctAnswer,
          color: colors[index % 2]
        };
      });

      setChords(transformedChords);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching chords:', err);
      setError('Neumíme načíst tyhle akordy: ' + err.message);
      setLoading(false);
    }
  }, []);

  // Načtení akordů z databáze při mount
  useEffect(() => {
    fetchChords();
  }, [fetchChords]);

  const playChord = useCallback(async (notes) => {
    audioEngine.playClick();
    // Seřadit noty podle pořadí na klaviatuře (odleva doprava)
    const sortedNotes = sortNotesByKeyboard(notes);
    for (const note of sortedNotes) {
      audioEngine.playNote(note, 0.8);
    }
  }, []);

  const saveQuizCompletion = useCallback(async (finalScore) => {
    try {
      // Vypočítat získané XP
      const xpEarned = calculateXP(finalScore, chords.length);

      // Uložit výsledky do databáze pomocí utility funkce
      const result = await saveQuizResults(
        'chord_quiz',
        finalScore,
        chords.length,
        bestStreak,
        xpEarned
      );

      if (result.success) {
        // Aktualizovat zobrazené XP (použít skutečné XP z celebration service)
        const actualXP = result.data?.xpEarned || xpEarned;
        setTotalXpEarned(prev => prev + actualXP);

        // Pokud došlo k level-upu, zobrazit speciální oslavu
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
          }, 1000);
        }
      } else {
        console.error('Chyba při ukládání výsledků kvízu:', result.error);
      }

    } catch (error) {
      console.error('Neočekávaná chyba při ukládání kvízu:', error);
    }
  }, [chords, bestStreak]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setCurrentQuestion(0);
    setStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTotalXpEarned(0);
  }, []);

  const handleAnswer = useCallback((answer) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === chords[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
    } else {
      setStreak(0);
    }

    // Pokud je to poslední otázka, uložíme výsledek
    if (currentQuestion === chords.length - 1) {
      const finalScore = isCorrect ? score + 1 : score;
      saveQuizCompletion(finalScore);

      // Pokud perfektní skóre, zobrazíme konfety a zahrajeme fanfáru
      if (finalScore === chords.length) {
        setShowCelebration(true);
        audioEngine.playFanfare();
        setTimeout(() => {
          audioEngine.playApplause();
        }, 500);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [showResult, chords, currentQuestion, score, streak, bestStreak, saveQuizCompletion]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < chords.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentQuestion, chords.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Pokud jsme na první otázce, vrátíme se na start
      setGameStarted(false);
      setScore(0);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setStreak(0);
      setTotalXpEarned(0);
    }
  }, [currentQuestion]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setScore(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
    setTotalXpEarned(0);
  }, []);

  const currentChord = useMemo(() => chords[currentQuestion], [chords, currentQuestion]);

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <Music size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Načítám akordy...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: RADIUS.lg,
        border: '2px solid rgba(239, 68, 68, 0.3)'
      }}>
        <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
        <button
          onClick={fetchChords}
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: RADIUS.md,
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            marginTop: '1rem'
          }}
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  // Show "Připravit piano" dialog before game starts
  if (!pianoReady) {
    return (
      <PianoPrepareDialog
        onInitPiano={initPiano}
        isLoading={pianoLoading}
        title="Připravit piano pro kvíz"
        description="Kvíz používá kvalitní piano samples ze Salamander Grand Piano. Klikněte pro načtení."
      />
    );
  }

  return (
    <div>
      {/* Confetti při dokončení kvízu */}
      <Confetti show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <h2 className="card-title" style={{
        marginBottom: '1.5rem',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(181, 31, 101, 0.2)',
          boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
        }}>
          <Target size={24} color="var(--color-primary)" />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Poznáte akord?
          <Music size={24} color="var(--color-primary)" />
        </span>
      </h2>
      <p style={{ marginBottom: '2rem', color: '#64748b', fontSize: '1rem' }}>
        Zahrajte akord a zkuste uhodnout, který to je. Zábavný způsob, jak se naučit rozpoznávat akordy!
      </p>

      <AnimatePresence mode="wait">
        {!gameStarted ? (
          <QuizStartScreen
            key="start"
            title="Kvíz: Akordy"
            description="Naučte se rozpoznávat hudební akordy poslechem."
            icon={Music}
            questionCount={chords.length}
            bestStreak={bestStreak}
            maxXP={100}
            onStart={startGame}
            isMobile={isMobile}
            buttonText="Začít kvíz"
          />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Statistics */}
            <div style={{
              display: 'flex',
              gap: isMobile ? '0.5rem' : '1rem',
              flexWrap: 'wrap',
              marginBottom: isMobile ? '1rem' : '1.5rem'
            }}>
              <QuizStatCard
                value={`${score}/${chords.length}`}
                label="Skóre"
                variant="secondary"
                size="compact"
                isMobile={isMobile}
              />

              <QuizStatCard
                value={streak}
                label="Série"
                variant="secondary"
                size="compact"
                isMobile={isMobile}
              />

              <QuizStatCard
                value={`${currentQuestion + 1}/${chords.length}`}
                label="Otázka"
                variant="secondary"
                size="compact"
                isMobile={isMobile}
              />
            </div>

            {/* Question Card */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: currentChord.color,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.xl,
                padding: isMobile ? '1rem' : '2rem',
                marginBottom: isMobile ? '1rem' : '2rem',
                border: BORDER.default,
                boxShadow: SHADOW.default
              }}
            >
              <div style={{
                textAlign: 'center',
                marginBottom: isMobile ? '1rem' : '1.5rem'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '1.125rem' : '1.5rem',
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.4
                }}>
                  Který akord slyšíte?
                </h3>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playChord(currentChord.notes)}
                style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(181, 31, 101, 0.4)',
                  margin: '0 auto 2rem',
                  transition: 'all 0.3s'
                }}
              >
                <Play size={40} color="#ffffff" style={{ marginLeft: '4px' }} />
              </motion.button>

              {/* Options */}
              <div style={{
                display: 'grid',
                gap: isMobile ? '0.75rem' : '1rem',
                gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(120px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))'
              }}>
                {currentChord.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentChord.correctAnswer;
                  const showCorrect = showResult && isSelected && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      style={{
                        padding: isMobile ? '0.875rem' : '1.25rem',
                        borderRadius: RADIUS.lg,
                        border: BORDER.none,
                        boxShadow: isSelected
                          ? SHADOW.selected
                          : SHADOW.subtle,
                        background: 'rgba(255, 255, 255, 0.7)',
                        cursor: showResult ? 'not-allowed' : 'pointer',
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        minHeight: isMobile ? '3rem' : '3.5rem'
                      }}
                    >
                      <span>{option}</span>
                      {showCorrect && <AnswerStatusChip status="correct" size={isMobile ? 16 : 20} />}
                      {showWrong && <AnswerStatusChip status="incorrect" size={isMobile ? 16 : 20} />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              {showResult && (
                <IconButton
                  icon={ChevronLeft}
                  onClick={previousQuestion}
                  variant="secondary"
                  size={isMobile ? 44 : 48}
                  iconSize={isMobile ? 20 : 24}
                  ariaLabel={currentQuestion > 0 ? "Předchozí otázka" : "Zpět na start"}
                />
              )}

              {showResult && currentQuestion < chords.length - 1 && (
                <IconButton
                  icon={ChevronRight}
                  onClick={nextQuestion}
                  variant="primary"
                  size={isMobile ? 44 : 48}
                  iconSize={isMobile ? 20 : 24}
                  ariaLabel="Další otázka"
                />
              )}

              {showResult && currentQuestion === chords.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="btn btn-primary"
                  style={{
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    padding: isMobile ? '0.5rem 1rem' : '0.625rem 1.5rem',
                    borderRadius: RADIUS.md,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RotateCcw size={isMobile ? 16 : 18} />
                  Hrát znovu
                </motion.button>
              )}
            </div>

            {/* Final score */}
            {showResult && currentQuestion === chords.length - 1 && (
              <QuizResultsPanel
                score={score}
                total={chords.length}
                bestStreak={bestStreak}
                totalXpEarned={totalXpEarned}
                isMobile={isMobile}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChordQuiz;
