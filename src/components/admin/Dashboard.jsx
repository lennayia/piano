import { Users, BookOpen, TrendingUp } from 'lucide-react';
import useUserStore from '../../store/useUserStore';
import useLessonStore from '../../store/useLessonStore';

function Dashboard() {
  const users = useUserStore((state) => state.users);
  const lessons = useLessonStore((state) => state.lessons);

  const totalCompletedLessons = users.reduce((sum, user) =>
    sum + (user.progress?.length || 0), 0
  );

  const averageProgress = users.length > 0
    ? (totalCompletedLessons / users.length).toFixed(1)
    : 0;

  const stats = [
    {
      title: 'Registrovaní uživatelé',
      value: users.length,
      icon: Users,
      color: 'var(--color-primary)'
    },
    {
      title: 'Dostupné lekce',
      value: lessons.length,
      icon: BookOpen,
      color: 'var(--color-success)'
    },
    {
      title: 'Průměrný pokrok',
      value: `${averageProgress} lekcí`,
      icon: TrendingUp,
      color: 'var(--color-warning)'
    }
  ];

  return (
    <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="card">
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#64748b' }}>
                  {stat.title}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1, color: '#1e293b' }}>
                  {stat.value}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(181, 31, 101, 0.2)',
                boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
              }}>
                <Icon size={24} color="#64748b" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;
