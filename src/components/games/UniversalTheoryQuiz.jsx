import { useState, useEffect } from 'react';
import { Play, RotateCcw, Trophy, Zap, Target, Sparkles, Flame, BookOpen, CheckCircle, XCircle, Brain, Music, TrendingUp, Award, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from '../common/Confetti';
import { supabase } from '../../lib/supabase';
import useUserStore from '../../store/useUserStore';

/**
 * UniversalTheoryQuiz - Univerzální komponenta pro teoretické kvízy
 * @param {string} quizType - Typ kvízu: 'interval', 'scale', 'rhythm', 'mixed'
 * @param {string} title - Nadpis kvízu
 * @param {string} description - Popis kvízu
 * @param {object} icon - Lucide icon komponenta
 */
function UniversalTheoryQuiz({
  quizType = 'interval',
  title = 'Teoretický kvíz',
  description = 'Otestujte své znalosti!',
  icon: Icon = Music
}) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserStats = useUserStore((state) => state.updateUserStats);

  // Mapování tabulek podle typu kvízu
  const getTableNames = () => {
    const tableMap = {
      interval: {
        mainTable: 'piano_quiz_interval',
        optionsTable: 'piano_quiz_interval_options',
        completionsTable: 'piano_quiz_interval_completions',
        foreignKey: 'interval_question_id'
      },
      scale: {
        mainTable: 'piano_quiz_scale',
        optionsTable: 'piano_quiz_scale_options',
        completionsTable: 'piano_quiz_scale_completions',
        foreignKey: 'scale_question_id'
      },
      rhythm: {
        mainTable: 'piano_quiz_rhythm',
        optionsTable: 'piano_quiz_rhythm_options',
        completionsTable: 'piano_quiz_rhythm_completions',
        foreignKey: 'rhythm_question_id'
      },
      mixed: {
        mainTable: 'piano_quiz_mixed',
        optionsTable: 'piano_quiz_mixed_options',
        completionsTable: 'piano_quiz_mixed_completions',
        foreignKey: 'mixed_question_id'
      }
    };
    return tableMap[quizType] || tableMap.interval;
  };

  // Načtení otázek z databáze
  useEffect(() => {
    fetchQuestions();
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const tables = getTableNames();

      // Načteme aktivní otázky s jejich možnostmi
      const { data: questionsData, error: questionsError } = await supabase
        .from(tables.mainTable)
        .select(`
          *,
          ${tables.optionsTable} (*)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        setError(`Ještě tu nejsou žádné otázky pro ${title} 📚 Přidejte je v administraci.`);
        setLoading(false);
        return;
      }

      // Transformujeme data z databáze do formátu, který kvíz očekává
      const transformedQuestions = questionsData.map((question, index) => {
        // Seřadíme možnosti podle display_order
        const optionsKey = Object.keys(question).find(key =>
          key.includes('_options') && Array.isArray(question[key])
        );
        const sortedOptions = [...(question[optionsKey] || [])].sort(
          (a, b) => a.display_order - b.display_order
        );

        // Střídat barvy mezi primary a secondary
        const colors = [
          'rgba(45, 91, 120, 0.2)', // secondary
          'rgba(181, 31, 101, 0.2)', // primary
        ];

        return {
          id: question.id,
          question: question.question_text || question.name,
          difficulty: question.difficulty,
          category: question.category,
          options: sortedOptions.map(opt => ({
            id: opt.id,
            text: opt.option_name,
            isCorrect: opt.is_correct
          })),
          correctAnswer: sortedOptions.find(opt => opt.is_correct)?.option_name || '',
          color: colors[index % 2]
        };
      });

      setQuestions(transformedQuestions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Nepodařilo se načíst otázky: ' + err.message);
      setLoading(false);
    }
  };

  const saveQuizCompletion = async (finalScore) => {
    if (!currentUser) return;

    const isPerfect = finalScore === questions.length;
    const tables = getTableNames();

    try {
      // 1. Uložit dokončení aktuální otázky
      const currentQuestionData = questions[currentQuestion];
      const selectedOption = currentQuestionData.options.find(opt => opt.text === selectedAnswer);

      if (selectedOption) {
        const completionData = {
          user_id: currentUser.id,
          [tables.foreignKey]: currentQuestionData.id,
          selected_option_id: selectedOption.id,
          is_correct: selectedOption.isCorrect
        };

        await supabase
          .from(tables.completionsTable)
          .insert(completionData);
      }

      // 2. Přidat XP podle výsledku
      let xpEarned = 0;
      if (isPerfect) {
        xpEarned = 100; // Perfektní skóre 🎉
      } else if (finalScore >= questions.length * 0.8) {
        xpEarned = 75; // 80%+ správně 👏
      } else if (finalScore >= questions.length * 0.7) {
        xpEarned = 50; // 70%+ správně 👍
      } else if (finalScore >= questions.length * 0.5) {
        xpEarned = 25; // 50%+ správně 💪
      }

      if (xpEarned > 0) {
        await updateUserStats({ xp_gained: xpEarned });
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
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
    setTotalXpEarned(0);
  };

  const handleAnswer = (answer) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === questions[currentQuestion].correctAnswer;

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
    if (currentQuestion === questions.length - 1) {
      const finalScore = isCorrect ? score + 1 : score;
      saveQuizCompletion(finalScore);

      // Pokud perfektní skóre, zobrazíme konfety
      if (finalScore === questions.length) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
    setTotalXpEarned(0);
  };

  // Motivační zprávy podle výsledku
  const getMotivationalMessage = (finalScore) => {
    const percentage = (finalScore / questions.length) * 100;

    if (percentage === 100) {
      return {
        emoji: '🎉',
        title: 'Perfektní!',
        message: 'Jste mistr hudební teorie! Absolutně neuvěřitelný výkon!',
        color: '#10b981'
      };
    } else if (percentage >= 80) {
      return {
        emoji: '🌟',
        title: 'Vynikající!',
        message: 'Skvělá práce! Jen pár chybiček a budete na vrcholu!',
        color: '#f59e0b'
      };
    } else if (percentage >= 70) {
      return {
        emoji: '👏',
        title: 'Velmi dobře!',
        message: 'Solidní výkon! Ještě trochu praxe a budete perfektní!',
        color: '#3b82f6'
      };
    } else if (percentage >= 50) {
      return {
        emoji: '💪',
        title: 'Dobrý začátek!',
        message: 'Jste na dobré cestě! Zkuste to znovu a zlepšete se!',
        color: '#8b5cf6'
      };
    } else {
      return {
        emoji: '🎯',
        title: 'Zkuste to znovu!',
        message: 'Každý začátek je těžký. Zopakujte si teorii a zkuste to znovu!',
        color: '#ef4444'
      };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <Icon size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Načítám otázky...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 'var(--radius)',
        border: '2px solid rgba(239, 68, 68, 0.3)'
      }}>
        <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.1), rgba(181, 31, 101, 0.1))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius)',
          padding: '3rem',
          textAlign: 'center',
          border: '2px solid rgba(45, 91, 120, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Icon size={80} color="var(--color-primary)" style={{ margin: '0 auto 2rem' }} />
        </motion.div>

        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {title}
        </h2>

        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          {description} Odpovězte na {questions.length} otázek a prokažte své znalosti!
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            style={{
              background: 'rgba(45, 91, 120, 0.1)',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(45, 91, 120, 0.3)'
            }}
          >
            <Target size={32} color="var(--color-secondary)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
              {questions.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Otázek</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            style={{
              background: 'rgba(181, 31, 101, 0.1)',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(181, 31, 101, 0.3)'
            }}
          >
            <Trophy size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {bestStreak}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nejlepší série</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(255, 215, 0, 0.3)'
            }}
          >
            <Star size={32} color="#FFD700" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>
              100
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Max XP</div>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="btn btn-primary"
          style={{
            fontSize: '1.25rem',
            padding: '1rem 3rem',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <Play size={24} />
          Začít kvíz
        </motion.button>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ.correctAnswer;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={{ position: 'relative' }}>
      {showCelebration && <Confetti />}

      {/* Progress bar */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 'var(--radius)',
        height: '8px',
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            borderRadius: 'var(--radius)'
          }}
        />
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            background: 'rgba(45, 91, 120, 0.1)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '2px solid rgba(45, 91, 120, 0.3)',
            flex: 1,
            minWidth: '150px'
          }}
        >
          <Trophy size={24} color="var(--color-secondary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Skóre</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
              {score}/{questions.length}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            background: streak > 0 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(45, 91, 120, 0.1)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: streak > 0 ? '2px solid rgba(255, 215, 0, 0.5)' : '2px solid rgba(45, 91, 120, 0.3)',
            flex: 1,
            minWidth: '150px'
          }}
        >
          <Flame size={24} color={streak > 0 ? '#FFD700' : 'var(--color-secondary)'} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Série</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: streak > 0 ? '#FFD700' : 'var(--color-secondary)' }}>
              {streak} 🔥
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            background: 'rgba(181, 31, 101, 0.1)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '2px solid rgba(181, 31, 101, 0.3)',
            flex: 1,
            minWidth: '150px'
          }}
        >
          <Target size={24} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Otázka</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {currentQuestion + 1}/{questions.length}
            </div>
          </div>
        </motion.div>

        {totalXpEarned > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              flex: 1,
              minWidth: '150px'
            }}
          >
            <Zap size={24} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Získané XP</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                +{totalXpEarned}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          style={{
            background: currentQ.color,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
            marginBottom: '2rem',
            border: '2px solid rgba(45, 91, 120, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <Icon size={32} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.5rem',
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0',
                lineHeight: 1.4
              }}>
                {currentQ.question}
              </h3>
              {currentQ.category && (
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(45, 91, 120, 0.2)',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  color: 'var(--color-secondary)',
                  fontWeight: 600
                }}>
                  {currentQ.category}
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
          }}>
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === option.text;
              const showCorrect = showResult && option.isCorrect;
              const showWrong = showResult && isSelected && !option.isCorrect;

              return (
                <motion.button
                  key={index}
                  whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(option.text)}
                  disabled={showResult}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius)',
                    border: showCorrect
                      ? '3px solid #10b981'
                      : showWrong
                      ? '3px solid #ef4444'
                      : isSelected
                      ? '3px solid var(--color-primary)'
                      : '2px solid rgba(45, 91, 120, 0.3)',
                    background: showCorrect
                      ? 'rgba(16, 185, 129, 0.2)'
                      : showWrong
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(255, 255, 255, 0.7)',
                    cursor: showResult ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: showCorrect
                      ? '#10b981'
                      : showWrong
                      ? '#ef4444'
                      : 'var(--text-primary)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <span>{option.text}</span>
                  {showCorrect && <CheckCircle size={20} />}
                  {showWrong && <XCircle size={20} />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {showResult && currentQuestion < questions.length - 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextQuestion}
            className="btn btn-primary"
            style={{
              fontSize: '1.125rem',
              padding: '0.875rem 2rem'
            }}
          >
            Další otázka →
          </motion.button>
        )}

        {showResult && currentQuestion === questions.length - 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="btn btn-primary"
            style={{
              fontSize: '1.125rem',
              padding: '0.875rem 2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RotateCcw size={20} />
            Hrát znovu
          </motion.button>
        )}
      </div>

      {/* Final score */}
      {showResult && currentQuestion === questions.length - 1 && (() => {
        const motivation = getMotivationalMessage(score);
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: '2rem',
              padding: '2rem',
              background: score === questions.length
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(255, 215, 0, 0.2))'
                : 'linear-gradient(135deg, rgba(45, 91, 120, 0.1), rgba(181, 31, 101, 0.1))',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              border: `2px solid ${motivation.color}`,
              boxShadow: `0 4px 20px ${motivation.color}40`
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: 2, duration: 0.5 }}
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
            >
              {motivation.emoji}
            </motion.div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: motivation.color }}>
              {motivation.title}
            </h3>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {motivation.message}
            </p>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
              Vaše skóre: <strong style={{ color: motivation.color }}>{score}/{questions.length}</strong>
              {' '}({Math.round((score / questions.length) * 100)}%)
            </p>
            {bestStreak > 1 && (
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                🔥 Nejlepší série: <strong style={{ color: '#FFD700' }}>{bestStreak} správně za sebou!</strong>
              </p>
            )}
            {totalXpEarned > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: 'var(--radius)',
                  display: 'inline-block'
                }}
              >
                <Zap size={24} color="#3b82f6" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                <strong style={{ fontSize: '1.5rem', color: '#3b82f6' }}>+{totalXpEarned} XP získáno!</strong>
              </motion.div>
            )}
          </motion.div>
        );
      })()}
    </div>
  );
}

export default UniversalTheoryQuiz;
