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
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {stat.title}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: `${stat.color}15`,
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} color={stat.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;
