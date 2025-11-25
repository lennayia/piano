import { useState, useEffect } from 'react';
import { Play, RotateCcw, Trophy, Zap, Target, Sparkles, Flame, Music, CheckCircle, XCircle, Award, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import Confetti from '../common/Confetti';
import { supabase } from '../../lib/supabase';
import useUserStore from '../../store/useUserStore';
import { sortNotesByKeyboard } from '../../utils/noteUtils';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import { IconButton, BackButton, AnswerStatusChip } from '../ui/ButtonComponents';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Načtení akordů z databáze
  useEffect(() => {
    fetchChords();
  }, []);

  // Helper funkce pro zamíchání pole
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchChords = async () => {
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
  };

  const playChord = async (notes) => {
    audioEngine.playClick();
    // Seřadit noty podle pořadí na klaviatuře (odleva doprava)
    const sortedNotes = sortNotesByKeyboard(notes);
    for (const note of sortedNotes) {
      audioEngine.playNote(note, 0.8);
    }
  };

  const saveQuizCompletion = async (finalScore) => {
    if (!currentUser) return;

    const isPerfect = finalScore === chords.length;

    try {
      // 1. Uložit dokončení kvízu do historie
      const { error: quizError } = await supabase
        .from('piano_quiz_completions')
        .insert([{
          user_id: currentUser.id,
          quiz_name: 'Poznáte akord?',
          score: finalScore,
          total_questions: chords.length,
          is_perfect: isPerfect,
          xp_earned: isPerfect ? 50 : 20
        }]);

      if (quizError) {
        console.error('Chyba při ukládání kvízu:', quizError);
      }

      // 2. Aktualizovat statistiky a achievementy pomocí store
      let xpEarned = 0;
      if (isPerfect) {
        xpEarned = 100; // Perfektní skóre 🎉
      } else if (finalScore >= chords.length * 0.8) {
        xpEarned = 75; // 80%+ správně 👏
      } else if (finalScore >= chords.length * 0.7) {
        xpEarned = 50; // 70%+ správně 👍
      } else if (finalScore >= chords.length * 0.5) {
        xpEarned = 25; // 50%+ správně 💪
      }

      if (xpEarned > 0) {
        await updateUserStats({ xp_gained: xpEarned, quiz_completed: true });
        setTotalXpEarned(prev => prev + xpEarned);
      }

    } catch (error) {
      console.error('Chyba při ukládání kvízu:', error);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentQuestion(0);
    setStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTotalXpEarned(0);
  };

  const handleAnswer = (answer) => {
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
  };

  const nextQuestion = () => {
    if (currentQuestion < chords.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const previousQuestion = () => {
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
  };

  const currentChord = chords[currentQuestion];

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
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: RADIUS.lg,
              padding: isMobile ? '1.5rem' : '2rem',
              textAlign: 'center',
              border: BORDER.default,
              boxShadow: SHADOW.default
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <Music size={32} color="var(--color-primary)" />
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', margin: 0, color: 'var(--text-primary)' }}>
                Kvíz: Akordy
              </h2>
            </div>

            <p style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem'
            }}>
              Naučte se rozpoznávat hudební akordy poslechem. Odpovězte na {chords.length} otázek a prokažte své znalosti!
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              <div style={{
                background: 'rgba(45, 91, 120, 0.05)',
                padding: isMobile ? '0.875rem 1.25rem' : '1rem 1.5rem',
                borderRadius: RADIUS.md,
                boxShadow: SHADOW.default
              }}>
                <div style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-secondary)',
                  marginBottom: '0.25rem'
                }}>
                  {chords.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Otázek</div>
              </div>

              <div style={{
                background: 'rgba(181, 31, 101, 0.05)',
                padding: isMobile ? '0.875rem 1.25rem' : '1rem 1.5rem',
                borderRadius: RADIUS.md,
                boxShadow: SHADOW.default
              }}>
                <div style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {bestStreak}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nejlepší série</div>
              </div>

              <div style={{
                background: 'rgba(45, 91, 120, 0.05)',
                padding: isMobile ? '0.875rem 1.25rem' : '1rem 1.5rem',
                borderRadius: RADIUS.md,
                boxShadow: SHADOW.default
              }}>
                <div style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-secondary)',
                  marginBottom: '0.25rem'
                }}>
                  100
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Max XP</div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="btn btn-primary"
              style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                padding: isMobile ? '0.625rem 1.25rem' : '0.625rem 1.5rem',
                borderRadius: RADIUS.md,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Play size={18} />
              Začít kvíz
            </button>
          </motion.div>
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
              <div style={{
                background: 'rgba(45, 91, 120, 0.05)',
                padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
                borderRadius: RADIUS.md,
                boxShadow: SHADOW.default,
                flex: 1,
                minWidth: isMobile ? '80px' : '100px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '0.625rem' : '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Skóre
                </div>
                <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                  {score}/{chords.length}
                </div>
              </div>

              <div style={{
                background: 'rgba(45, 91, 120, 0.05)',
                padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
                borderRadius: RADIUS.md,
                boxShadow: SHADOW.default,
                flex: 1,
                minWidth: isMobile ? '80px' : '100px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '0.625rem' : '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Série
                </div>
                <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                  {streak}
                </div>
              </div>

              <div style={{
                background: 'rgba(45, 91, 120, 0.05)',
                padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
                borderRadius: RADIUS.md,
                boxShadow: SHADOW.default,
                flex: 1,
                minWidth: isMobile ? '80px' : '100px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: isMobile ? '0.625rem' : '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Otázka
                </div>
                <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                  {currentQuestion + 1}/{chords.length}
                </div>
              </div>
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGameStarted(false);
                    setScore(0);
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setShowResult(false);
                    setStreak(0);
                  }}
                  style={{
                    padding: isMobile ? '0.75rem 1.5rem' : '0.875rem 2rem',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: RADIUS.lg,
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: SHADOW.default
                  }}
                >
                  Zobrazit výsledky
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChordQuiz;
