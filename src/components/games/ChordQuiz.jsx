import { useState, useEffect } from 'react';
import { Play, RotateCcw, Trophy, Zap, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';

function ChordQuiz() {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const chords = [
    {
      name: 'C dur',
      notes: ['C', 'E', 'G'],
      options: ['C dur', 'F dur', 'G dur', 'Am'],
      color: 'rgba(45, 91, 120, 0.2)'
    },
    {
      name: 'F dur',
      notes: ['F', 'A', 'C'],
      options: ['C dur', 'F dur', 'G dur', 'Dm'],
      color: 'rgba(181, 31, 101, 0.2)'
    },
    {
      name: 'G dur',
      notes: ['G', 'H', 'D'],
      options: ['C dur', 'F dur', 'G dur', 'Em'],
      color: 'rgba(45, 91, 120, 0.2)'
    },
    {
      name: 'Am',
      notes: ['A', 'C', 'E'],
      options: ['Am', 'C dur', 'F dur', 'Dm'],
      color: 'rgba(100, 80, 150, 0.2)'
    },
    {
      name: 'D dur',
      notes: ['D', 'F#', 'A'],
      options: ['D dur', 'G dur', 'A dur', 'Hm'],
      color: 'rgba(181, 31, 101, 0.2)'
    }
  ];

  const playChord = async (notes) => {
    audioEngine.playClick();
    for (const note of notes) {
      audioEngine.playNote(note, 0.8);
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

    const isCorrect = answer === chords[currentQuestion].name;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
      audioEngine.playSuccess();
    } else {
      setStreak(0);
      audioEngine.playClick();
    }

    setTimeout(() => {
      if (currentQuestion < chords.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Game over
        setTimeout(() => {
          setGameStarted(false);
        }, 1500);
      }
    }, 1500);
  };

  const currentChord = chords[currentQuestion];

  return (
    <div>
      <h2 style={{
        marginBottom: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Target size={28} color="var(--color-primary)" />
        Poznáš akord? 🎵
      </h2>
      <p style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
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
              Připraven na výzvu?
            </h3>

            {score > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                  {score} / {chords.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Poslední skóre
                </div>
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
                  background: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(255, 193, 7, 0.2)'
                }}>
                  <Zap size={20} color="#ffc107" style={{ marginBottom: '0.25rem' }} />
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
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Zap size={20} color="#ffc107" />
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                    Série: {streak} 🔥
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
                  const isCorrect = option === currentChord.name;
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
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(255, 255, 255, 0.9)',
                        border: showFeedback
                          ? isCorrect
                            ? '2px solid var(--color-success)'
                            : '2px solid var(--color-danger)'
                          : '2px solid rgba(255, 255, 255, 0.4)',
                        cursor: showResult ? 'default' : 'pointer',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        transition: 'all 0.3s',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                      }}
                    >
                      {option}
                      {showFeedback && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{ marginLeft: '0.5rem', fontSize: '1.5rem' }}
                        >
                          {isCorrect ? '✓' : '✗'}
                        </motion.span>
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
