import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen } from 'lucide-react';
import LessonList from '../components/lessons/LessonList';
import useUserStore from '../store/useUserStore';

function UserDashboard() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const completedLessons = currentUser.progress?.length || 0;

  return (
    <div className="container">
      {/* Welcome Section */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1) 0%, rgba(181, 31, 101, 0.05) 100%)',
        border: '1px solid rgba(181, 31, 101, 0.2)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ marginBottom: '0.5rem' }}>
          Vítejte zpět, {currentUser.firstName}!
        </h1>
        <p className="text-secondary">
          Pokračujte ve svém učení a objevujte nové lekce
        </p>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={24} color="var(--color-success)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{completedLessons}</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Dokončených lekcí</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(181, 31, 101, 0.1)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>4</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Dostupných lekcí</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <LessonList />
    </div>
  );
}

export default UserDashboard;
