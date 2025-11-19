import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Music, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import useLessonStore from '../store/useLessonStore';
import useUserStore from '../store/useUserStore';
import PianoKeyboard from '../components/lessons/PianoKeyboard';
import audioEngine from '../utils/audio';

function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);

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
      audioEngine.playSuccess();
    }
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
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-secondary"
        style={{ marginBottom: '2rem' }}
      >
        <ArrowLeft size={18} />
        Zpět na přehled
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
