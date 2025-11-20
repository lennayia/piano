import { useState, useEffect } from 'react';
import { Play, RotateCcw, Trophy, Zap, Target, Sparkles, Flame, Music, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import Confetti from '../common/Confetti';
import { supabase } from '../../lib/supabase';
import useUserStore from '../../store/useUserStore';

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

  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserStats = useUserStore((state) => state.updateUserStats);

  // Načtení akordů z databáze
  useEffect(() => {
    fetchChords();
  }, []);

  const fetchChords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Načteme aktivní akordy s jejich možnostmi
      const { data: chordsData, error: chordsError } = await supabase
        .from('piano_quiz_chords')
        .select(`
          *,
          piano_quiz_chord_options (*)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (chordsError) throw chordsError;

      if (!chordsData || chordsData.length === 0) {
        setError('Ještě tu nejsou žádné akordy k procvičování 🎹 Ozvěte se nám, prosím.');
        setLoading(false);
        return;
      }

      // Transformujeme data z databáze do formátu, který kvíz očekává
      const transformedChords = chordsData.map((chord, index) => {
        // Seřadíme možnosti podle display_order
        const sortedOptions = [...(chord.piano_quiz_chord_options || [])].sort(
          (a, b) => a.display_order - b.display_order
        );

        // Střídat barvy mezi primary a secondary
        const colors = [
          'rgba(45, 91, 120, 0.2)', // secondary
          'rgba(181, 31, 101, 0.2)', // primary
        ];

        return {
          name: chord.name,
          notes: chord.notes || [],
          options: sortedOptions.map(opt => opt.option_name),
          correctAnswer: sortedOptions.find(opt => opt.is_correct)?.option_name || chord.name,
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
    for (const note of notes) {
      audioEngine.playNote(note, 0.8);
    }
  };

  const saveQuizCompletion = async (finalScore) => {
    if (!currentUser) return;

    const isPerfect = finalScore === chords.length;

    try {
      // 1. Uložit dokončení kvízu do historie
      const xpEarned = isPerfect ? 50 : 20;
      const { error: quizError } = await supabase
        .from('piano_quiz_completions')
        .insert([{
          user_id: currentUser.id,
          quiz_name: 'Poznáte akord?',
          score: finalScore,
          total_questions: chords.length,
          is_perfect: isPerfect,
          xp_earned: xpEarned
        }]);

      if (quizError) {
        console.error('Chyba při ukládání kvízu:', quizError);
      }

      // 2. Aktualizovat statistiky uživatele
      const { data: stats, error: statsError } = await supabase
        .from('piano_user_stats')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (stats && !statsError) {
        const { error: updateError } = await supabase
          .from('piano_user_stats')
          .update({
            quizzes_completed: (stats.quizzes_completed || 0) + 1,
            quizzes_perfect_score: isPerfect
              ? (stats.quizzes_perfect_score || 0) + 1
              : stats.quizzes_perfect_score,
            total_xp: (stats.total_xp || 0) + (isPerfect ? 50 : 20), // 50 XP za perfektní, 20 XP za dokončení
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);

        if (updateError) {
          console.error('Chyba při aktualizaci statistik:', updateError);
        } else {
          // Aktualizovat lokální store
          if (updateUserStats) {
            updateUserStats();
          }
        }
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
      audioEngine.playSuccess(); // Pozitivní zvuk pro správnou odpověď
    } else {
      setStreak(0);
      audioEngine.playError(); // Negativní zvuk pro špatnou odpověď
    }

    setTimeout(() => {
      if (currentQuestion < chords.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Game over - celebrace POUZE pokud má 100% (všechno správně)
        const finalScore = isCorrect ? score + 1 : score;
        const isPerfectScore = finalScore === chords.length;

        // Uložit dokončení kvízu do databáze
        saveQuizCompletion(finalScore);

        if (isPerfectScore) {
          setShowCelebration(true);
          audioEngine.playFanfare();
          setTimeout(() => {
            audioEngine.playApplause();
          }, 500);
        }

        setTimeout(() => {
          setGameStarted(false);
          setShowCelebration(false);
        }, isPerfectScore ? 3000 : 1500);
      }
    }, 1500);
  };

  const currentChord = chords[currentQuestion];

  // Loading state
  if (loading) {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Poznáte akord?</h2>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Music size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem', animation: 'pulse 1.5s infinite' }} />
          <p style={{ color: '#64748b' }}>Načítám akordy...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Poznáte akord?</h2>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <XCircle size={48} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Tohle se nám nedaří načíst</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={fetchChords}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Confetti při dokončení kvízu */}
      <Confetti show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <h2 style={{
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="card"
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1) 0%, rgba(45, 91, 120, 0.1) 100%)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '2px solid rgba(181, 31, 101, 0.2)'
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              <Sparkles size={64} color="var(--color-primary)" style={{ marginBottom: '1.5rem' }} />
            </motion.div>

            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
              Jste připraveni na výzvu?
            </h3>

            {score > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  padding: '1.5rem',
                  background: score === chords.length
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                    : 'rgba(45, 91, 120, 0.1)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '1.5rem',
                  border: score === chords.length
                    ? '2px solid #10b981'
                    : '1px solid rgba(45, 91, 120, 0.2)'
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 700, color: score === chords.length ? '#059669' : 'var(--color-secondary)', marginBottom: '0.5rem' }}>
                  {score} / {chords.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {score === chords.length ? (
                    <>🎉 Perfektní! Všechno správně!</>
                  ) : score >= chords.length * 0.6 ? (
                    <>Dobře! Zkuste to znovu pro 100%</>
                  ) : (
                    <>Není to špatné! Zkuste to ještě jednou</>
                  )}
                </div>
                {score < chords.length && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    padding: '0.5rem',
                    background: 'rgba(181, 31, 101, 0.05)',
                    borderRadius: 'var(--radius)',
                    borderLeft: '3px solid var(--color-primary)'
                  }}>
                    💡 Tip: Poslouchejte si akordy víckrát, pomůže vám to líp je rozpoznat!
                  </div>
                )}
              </motion.div>
            )}

            {bestStreak > 0 && (
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(181, 31, 101, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(181, 31, 101, 0.2)'
                }}>
                  <Zap size={20} color="var(--color-primary)" style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Nejlepší série: <strong>{bestStreak}</strong>
                  </div>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="btn btn-primary"
              style={{
                fontSize: '1.125rem',
                padding: '1rem 3rem',
                boxShadow: '0 8px 24px rgba(45, 91, 120, 0.4)'
              }}
            >
              <Play size={20} />
              {score > 0 ? 'Hrát znovu' : 'Začít hrát'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Score Bar */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div className="card" style={{
                padding: '0.75rem 1.25rem',
                background: 'rgba(45, 91, 120, 0.1)',
                border: '1px solid rgba(45, 91, 120, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Trophy size={20} color="var(--color-secondary)" />
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                  Skóre: {score} / {chords.length}
                </span>
              </div>

              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="card"
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(181, 31, 101, 0.1)',
                    border: '1px solid rgba(181, 31, 101, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Zap size={20} color="var(--color-primary)" />
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Série: {streak} <Flame size={16} color="var(--color-secondary)" />
                  </span>
                </motion.div>
              )}
            </div>

            {/* Question Card */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              className="card"
              style={{
                padding: '3rem 2rem',
                background: `linear-gradient(135deg, ${currentChord.color} 0%, rgba(255, 255, 255, 0.8) 100%)`,
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                textAlign: 'center',
                marginBottom: '2rem'
              }}
            >
              <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Otázka {currentQuestion + 1} z {chords.length}
              </div>

              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#1e293b' }}>
                Který akord slyšíte?
              </h3>

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
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                {currentChord.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentChord.correctAnswer;
                  const showFeedback = showResult && isSelected;

                  return (
                    <motion.button
                      key={index}
                      whileHover={!showResult ? { scale: 1.05, y: -4 } : {}}
                      whileTap={!showResult ? { scale: 0.95 } : {}}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      className="card"
                      style={{
                        padding: '1.25rem',
                        background: showFeedback
                          ? isCorrect
                            ? 'rgba(16, 185, 129, 0.15)' // Zelená pro správně
                            : 'rgba(239, 68, 68, 0.15)' // Červená pro špatně
                          : 'rgba(255, 255, 255, 0.9)',
                        border: showFeedback
                          ? isCorrect
                            ? '2px solid #10b981' // Zelená border
                            : '2px solid #ef4444' // Červená border
                          : '2px solid rgba(255, 255, 255, 0.4)',
                        cursor: showResult ? 'default' : 'pointer',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: showFeedback
                          ? isCorrect
                            ? '#059669' // Tmavší zelená text
                            : '#dc2626' // Tmavší červená text
                          : '#1e293b',
                        transition: 'all 0.3s',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {option}
                      {showFeedback && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          {isCorrect ? (
                            <CheckCircle size={24} color="#10b981" />
                          ) : (
                            <XCircle size={24} color="#ef4444" />
                          )}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChordQuiz;
