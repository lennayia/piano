import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Music, Clock, TrendingUp, Trophy, Star, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useLessonStore from '../store/useLessonStore';
import useUserStore from '../store/useUserStore';
import PianoKeyboard from '../components/lessons/PianoKeyboard';
import audioEngine from '../utils/audio';
import Confetti from '../components/common/Confetti';

function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);

  const lesson = useLessonStore((state) =>
    state.lessons.find(l => l.id === parseInt(id))
  );

  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserProgress = useUserStore((state) => state.updateUserProgress);

  useEffect(() => {
    if (!lesson) {
      navigate('/dashboard');
    }

    if (currentUser && lesson) {
      const completed = currentUser.progress?.some(p => p.lessonId === lesson.id);
      setIsCompleted(completed);
    }
  }, [lesson, currentUser, navigate]);

  if (!lesson) {
    return null;
  }

  const handleComplete = () => {
    if (currentUser && !isCompleted) {
      updateUserProgress(currentUser.id, lesson.id);
      setIsCompleted(true);
      setEarnedPoints(100);

      // Získat aktualizovaného uživatele pro nové achievementy
      setTimeout(() => {
        const users = useUserStore.getState().users;
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser && updatedUser.newAchievements && updatedUser.newAchievements.length > 0) {
          setNewAchievements(updatedUser.newAchievements);
        }
      }, 100);

      // Spustit celebraci
      setShowCelebration(true);
      audioEngine.playFanfare();
      setTimeout(() => {
        audioEngine.playApplause();
      }, 500);
    }
  };

  const getAchievementInfo = (achievementId) => {
    const achievements = {
      'first-lesson': { title: 'První krok', icon: Star, description: 'Dokončili jste první lekci!' },
      'five-lessons': { title: 'Milovník hudby', icon: Trophy, description: 'Dokončeno 5 lekcí!' },
      'streak-3': { title: 'Série 3 dní', icon: Flame, description: '3 dny v řadě!' },
      'streak-7': { title: 'Týdenní šampion', icon: Flame, description: '7 dní v řadě!' }
    };
    return achievements[achievementId] || { title: 'Achievement', icon: Star, description: '' };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'začátečník':
        return 'badge-success';
      case 'mírně pokročilý':
        return 'badge-warning';
      case 'pokročilý':
        return 'badge-primary';
      default:
        return '';
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      {/* Confetti při dokončení */}
      <Confetti show={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Celebrační popup s body a achievementy */}
      <AnimatePresence>
        {showCelebration && earnedPoints > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9998,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(5px)'
            }}
            onClick={() => {
              setShowCelebration(false);
              setEarnedPoints(0);
              setNewAchievements([]);
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                maxWidth: '500px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(30px)',
                textAlign: 'center',
                padding: '3rem 2rem',
                border: '3px solid var(--color-primary)',
                boxShadow: '0 20px 60px rgba(181, 31, 101, 0.4)'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Trophy size={80} color="#64748b" style={{ marginBottom: '1.5rem' }} />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}
              >
                Skvělá práce!
              </motion.h2>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  marginBottom: '1.5rem'
                }}
              >
                +{earnedPoints} bodů
              </motion.div>

              {newAchievements.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{ marginTop: '2rem' }}
                >
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#1e293b' }}>
                    Nové odměny!
                  </h3>
                  {newAchievements.map((achId, index) => {
                    const achInfo = getAchievementInfo(achId);
                    const Icon = achInfo.icon;
                    return (
                      <motion.div
                        key={achId}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1) 0%, rgba(45, 91, 120, 0.05) 100%)',
                          borderRadius: 'var(--radius)',
                          marginBottom: '0.75rem',
                          border: '2px solid rgba(181, 31, 101, 0.3)'
                        }}
                      >
                        <Icon size={32} color="#64748b" />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{achInfo.title}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{achInfo.description}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: newAchievements.length > 0 ? 0.9 : 0.7 }}
                onClick={() => {
                  setShowCelebration(false);
                  setEarnedPoints(0);
                  setNewAchievements([]);
                }}
                className="btn btn-primary"
                style={{ marginTop: '2rem', padding: '0.875rem 2rem' }}
              >
                Pokračovat
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-secondary"
        style={{ marginBottom: '2rem' }}
      >
        <ArrowLeft size={18} />
        Zpátky na přehled
      </button>

      <div className="card" style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)'
      }}>
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>{lesson.title}</h1>
            {isCompleted && (
              <span className="badge badge-success" style={{ padding: '0.5rem 1rem' }}>
                <CheckCircle size={16} />
                Dokončeno
              </span>
            )}
          </div>

          <p className="text-secondary" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
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
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Music size={20} />
            Noty k procvičení
          </h3>
          <div style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius)',
            marginBottom: '2rem'
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
            <h3 style={{ marginBottom: '1rem' }}>Interaktivní klavír</h3>
            <PianoKeyboard highlightedNotes={lesson.content.notes} />
          </div>

          <h3 style={{ marginBottom: '1rem' }}>Instrukce</h3>
          <ol style={{
            paddingLeft: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {lesson.content.instructions.map((instruction, index) => (
              <li key={index} style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {/* Complete Button */}
        {currentUser && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            {isCompleted ? (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                color: 'var(--color-success)',
                fontWeight: 500
              }}>
                <CheckCircle size={24} style={{ marginBottom: '0.5rem' }} />
                <div>Gratulujeme! Tuto lekci jste již dokončili.</div>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                className="btn btn-primary"
                style={{ padding: '1rem', fontSize: '1rem' }}
              >
                <CheckCircle size={20} />
                Označit jako dokončenou
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Lesson;
