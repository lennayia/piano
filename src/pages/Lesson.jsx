import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Music, Clock, TrendingUp } from 'lucide-react';
import useLessonStore from '../store/useLessonStore';
import useUserStore from '../store/useUserStore';

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

      <div className="card">
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
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius)',
            marginBottom: '2rem'
          }}>
            {lesson.content.notes.map((note, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  border: '2px solid var(--color-border)'
                }}
              >
                {note}
              </div>
            ))}
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
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
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
