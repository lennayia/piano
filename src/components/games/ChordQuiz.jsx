import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, RotateCcw, Trophy, Zap, Target, Sparkles, Flame, Music, Award, Star, ChevronRight, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import Confetti from '../common/Confetti';
import { supabase } from '../../lib/supabase';
import useUserStore from '../../store/useUserStore';
import { sortNotesByKeyboard, shuffleArray } from '../../utils/noteUtils';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import { IconButton, BackButton, AnswerStatusChip, PlayButton, QuizAnswerButton } from '../ui/ButtonComponents';
import { Card, ProgressBar } from '../ui/CardComponents';
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
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [perfectTotal, setPerfectTotal] = useState(0); // Celkový počet bezchybných dokončení
  const [perfectStreak, setPerfectStreak] = useState(0); // Bezchybné za sebou
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

  // Načtení perfect stats (série celkem a streak za sebou)
  const fetchPerfectStats = useCallback(async () => {
    if (!currentUser?.id) {
      return;
    }

    try {
      // Načíst všechny výsledky chord_quiz pro aktuálního uživatele
      const { data, error } = await supabase
        .from('piano_quiz_scores')
        .select('score, total_questions, completed_at, streak')
        .eq('user_id', currentUser.id)
        .eq('quiz_type', 'chord_quiz')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setPerfectTotal(0);
        setPerfectStreak(0);
        setBestStreak(0);
        return;
      }

      // Celková série = počet všech bezchybných dokončení
      const perfectCompletions = data.filter(item => item.score === item.total_questions);
      setPerfectTotal(perfectCompletions.length);

      // Aktuální streak = kolik bezchybných za sebou od konce
      let currentStreak = 0;
      for (const item of data) {
        if (item.score === item.total_questions) {
          currentStreak++;
        } else {
          break; // První chyba = konec streaku
        }
      }
      setPerfectStreak(currentStreak);

      // Nejlepší série = maximum ze všech streak hodnot pro tento typ kvízu
      const maxBestStreak = Math.max(...data.map(item => item.streak || 0));
      setBestStreak(maxBestStreak);
    } catch (error) {
      // Tiché zpracování chyby
    }
  }, [currentUser]);

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

        // Stejná barva pro všechny karty
        const colors = [
          'var(--color-secondary-transparent)', // secondary (0.1 opacity)
          'var(--color-secondary-transparent)', // secondary (0.1 opacity)
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
      setError('Neumíme načíst tyhle akordy: ' + err.message);
      setLoading(false);
    }
  }, []);

  // Načtení akordů z databáze při mount
  useEffect(() => {
    fetchChords();
  }, [fetchChords]);

  // Načtení perfect stats při startu kvízu
  useEffect(() => {
    fetchPerfectStats();
  }, [fetchPerfectStats]);

  const playChord = useCallback(async (notes) => {
    audioEngine.playClick();
    // Seřadit noty podle pořadí na klaviatuře (odleva doprava)
    const sortedNotes = sortNotesByKeyboard(notes);
    for (const note of sortedNotes) {
      audioEngine.playNote(note, 0.8);
    }
  }, []);

  const saveQuizCompletion = useCallback(async (finalScore, isPerfect) => {
    try {
      // Vypočítat získané XP
      const xpEarned = calculateXP(finalScore, chords.length);

      // Uložit výsledky do databáze
      // isPerfect = true → celebrate s XP a odměnami
      // isPerfect = false → jen historie bez XP
      const result = await saveQuizResults(
        currentUser.id,
        'chord_quiz',
        finalScore,
        chords.length,
        bestStreak,
        xpEarned,
        isPerfect
      );

      if (result.success && isPerfect) {
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
      }

    } catch (error) {
      // Tiché zpracování chyby
    }
  }, [chords, bestStreak]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setIncorrectAnswers(0);
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
      setIncorrectAnswers(incorrectAnswers + 1);
      setStreak(0);
    }

    // Pokud je to poslední otázka, uložíme výsledek
    if (currentQuestion === chords.length - 1) {
      const finalScore = isCorrect ? score + 1 : score;
      const finalIncorrect = isCorrect ? incorrectAnswers : incorrectAnswers + 1;
      const isPerfect = finalIncorrect === 0;

      // Uložit výsledek (s odměnami pokud bezchybný, jen historie pokud ne)
      saveQuizCompletion(finalScore, isPerfect).then(() => {
        // Po uložení znovu načíst perfect stats (série a streak se aktualizují)
        fetchPerfectStats();
      });

      // Oslava JEN pro bezchybné dokončení
      if (isPerfect) {
        setShowCelebration(true);
        audioEngine.playFanfare();
        setTimeout(() => {
          audioEngine.playApplause();
        }, 500);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [showResult, chords, currentQuestion, score, incorrectAnswers, streak, bestStreak, saveQuizCompletion, fetchPerfectStats]);

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
      setIncorrectAnswers(0);
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
    setIncorrectAnswers(0);
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
        <AnswerStatusChip status="incorrect" size={48} />
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        <button
          onClick={fetchChords}
          className="btn btn-primary"
          style={{
            borderRadius: RADIUS.md,
            padding: '12px 24px',
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
                value={score}
                icon={CheckCircle}
                iconColor="rgb(16, 185, 129)"
                variant="success"
                size="compact"
                isMobile={isMobile}
              />

              <QuizStatCard
                value={incorrectAnswers}
                icon={XCircle}
                iconColor="rgb(239, 68, 68)"
                variant="danger"
                size="compact"
                isMobile={isMobile}
              />

              <QuizStatCard
                value={perfectTotal}
                icon={Trophy}
                iconColor="var(--color-primary)"
                variant="primary"
                size="compact"
                isMobile={isMobile}
                title="Celkový počet bezchybných dokončení"
              />

              <QuizStatCard
                value={perfectStreak}
                icon={Zap}
                iconColor="var(--color-secondary)"
                variant="secondary"
                size="compact"
                isMobile={isMobile}
                title="Bezchybné kvízy za sebou"
              />
            </div>

            {/* Progress Bar */}
            <ProgressBar
              current={currentQuestion + 1}
              total={chords.length}
              title="Otázka"
              titleColor="var(--color-text-secondary)"
            />

            {/* Question Card */}
            <Card
              as={motion.div}
              blur="20px"
              radius="xl"
              shadow="default"
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: currentChord.color,
                padding: isMobile ? '1rem' : '2rem',
                marginBottom: isMobile ? '1rem' : '2rem'
              }}
            >
              <div style={{
                textAlign: 'center',
                marginBottom: isMobile ? '1rem' : '1.5rem'
              }}>
                <h3 style={{
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0'
                }}>
                  Který akord slyšíte?
                </h3>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <PlayButton onClick={() => playChord(currentChord.notes)} />
              </div>

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
                    <QuizAnswerButton
                      key={index}
                      text={option}
                      isSelected={isSelected}
                      showResult={showResult}
                      showCorrect={showCorrect}
                      showWrong={showWrong}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      isMobile={isMobile}
                    />
                  );
                })}
              </div>
            </Card>

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
