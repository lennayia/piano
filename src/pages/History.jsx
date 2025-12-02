import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Music, Gamepad2, Book, Trophy, Calendar, Clock, Award, Star } from 'lucide-react';
import useUserStore from '../store/useUserStore';
import { getAllUserActivities } from '../services/activityService';

function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, songs, quizzes, lessons
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser) {
      fetchUserHistory();
    }
  }, [currentUser]);

  const fetchUserHistory = async () => {
    setLoading(true);
    try {
      // Použít centralizovanou helper funkci (OPTIMALIZACE - odstranění duplicity!)
      const allActivities = await getAllUserActivities(currentUser.id);

      // Mapovat ikony ze stringů na Lucide komponenty
      const activitiesWithIcons = allActivities.map(activity => ({
        ...activity,
        icon: activity.icon === 'Music' ? Music :
              activity.icon === 'Gamepad2' ? Gamepad2 :
              activity.icon === 'Book' ? Book :
              activity.icon === 'Trophy' ? Trophy :
              activity.icon === 'Star' ? Star :
              Book
      }));

      setActivities(activitiesWithIcons);
    } catch (error) {
      console.error('Chyba při načítání historie:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'songs') return activity.type === 'song';
    if (filter === 'quizzes') return activity.type === 'quiz';
    if (filter === 'lessons') return activity.type === 'lesson';
    if (filter === 'daily_goals') return activity.type === 'daily_goal';
    return true;
  });

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const totalXP = activities.reduce((sum, activity) => sum + activity.xp, 0);
  const songCount = activities.filter(a => a.type === 'song').length;
  const quizCount = activities.filter(a => a.type === 'quiz').length;
  const lessonCount = activities.filter(a => a.type === 'lesson').length;
  const dailyGoalCount = activities.filter(a => a.type === 'daily_goal').length;

  const filterButtons = [
    { id: 'all', label: 'Všechno', icon: HistoryIcon },
    { id: 'lessons', label: 'Lekce', icon: Book },
    { id: 'songs', label: 'Písničky', icon: Music },
    { id: 'quizzes', label: 'Kvízy', icon: Gamepad2 },
    { id: 'daily_goals', label: 'Denní cíle', icon: Trophy },
  ];

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--color-border)'
      }}>
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
          <HistoryIcon size={24} color="var(--color-primary)" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.25rem', color: '#1e293b' }}>Historie aktivit</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Přehled všech dokončených aktivit a získaných bodů
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1) 0%, rgba(221, 51, 121, 0.1) 100%)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Award size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {totalXP}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Celkem XP</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Book size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>
            {lessonCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených lekcí</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Music size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>
            {songCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených písní</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Gamepad2 size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>
            {quizCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených kvízů</div>
        </motion.div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <motion.button
              key={btn.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(btn.id)}
              className="card"
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === btn.id
                  ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: filter === btn.id
                  ? '2px solid rgba(181, 31, 101, 0.3)'
                  : '2px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: filter === btn.id ? 600 : 500,
                color: filter === btn.id ? '#ffffff' : '#64748b',
                transition: 'all 0.3s'
              }}
            >
              <Icon size={16} />
              {btn.label}
            </motion.button>
          );
        })}
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>Načítám historii...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <HistoryIcon size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Ještě tu nic není</h3>
          <p style={{ color: '#64748b' }}>
            {filter === 'all'
              ? 'Hned jak začnete cvičit, uvidíte tady všechny svoje úspěchy 🎉'
              : `Ještě jste to nezkusili. Tak s chutí do toho! 🎵`
            }
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Desktop - tabulka */}
          <style>{`
            @media (max-width: 768px) {
              .history-table { display: none !important; }
              .history-mobile { display: block !important; }
            }
            @media (min-width: 769px) {
              .history-table { display: block !important; }
              .history-mobile { display: none !important; }
            }
          `}</style>
          <div className="history-table">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: 'rgba(181, 31, 101, 0.05)',
                  borderBottom: '2px solid rgba(181, 31, 101, 0.1)'
                }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Typ</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aktivita</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Datum</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Čas</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detaily</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XP</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.tr
                      key={activity.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      style={{
                        background: activity.isSpecial
                          ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.08), transparent)'
                          : 'transparent',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        cursor: 'default',
                        transition: 'background 0.2s'
                      }}
                      whileHover={{
                        background: activity.isSpecial
                          ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.12), transparent)'
                          : 'rgba(181, 31, 101, 0.03)'
                      }}
                    >
                      <td style={{ padding: '0.625rem 0.75rem', width: '60px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius)',
                          background: activity.isSpecial
                            ? 'rgba(255, 215, 0, 0.15)'
                            : 'rgba(181, 31, 101, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={16} color={activity.isSpecial ? '#FFD700' : 'var(--color-primary)'} />
                        </div>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {activity.title}
                        </div>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {formatDate(activity.date)}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {formatTime(activity.date)}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem' }}>
                        {activity.type === 'daily_goal' && activity.subtitle && (
                          <span style={{ color: '#FFD700', fontWeight: 600 }}>
                            {activity.subtitle}
                          </span>
                        )}
                        {activity.type === 'level_up' && activity.subtitle && (
                          <span style={{ color: '#FFD700', fontWeight: 600 }}>
                            {activity.subtitle}
                          </span>
                        )}
                        {activity.type === 'song' && activity.isPerfect && (
                          <span style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Trophy size={14} />
                            Perfektní!
                          </span>
                        )}
                        {activity.type === 'song' && !activity.isPerfect && (
                          <span style={{ color: '#94a3b8' }}>
                            {activity.mistakes} {activity.mistakes === 1 ? 'chyba' : activity.mistakes < 5 ? 'chyby' : 'chyb'}
                          </span>
                        )}
                        {activity.type === 'quiz' && (
                          <span style={{ color: '#64748b' }}>
                            {activity.score}/{activity.totalQuestions}
                          </span>
                        )}
                        {activity.type === 'lesson' && (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius)',
                          background: 'rgba(181, 31, 101, 0.1)',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: 'var(--color-primary)',
                          whiteSpace: 'nowrap'
                        }}>
                          +{activity.xp}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile - kompaktní seznam */}
          <div className="history-mobile">
            {filteredActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  style={{
                    padding: '0.75rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    background: activity.isSpecial
                      ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.08), transparent)'
                      : 'transparent',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Ikona */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius)',
                    background: activity.isSpecial
                      ? 'rgba(255, 215, 0, 0.15)'
                      : 'rgba(181, 31, 101, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={16} color={activity.isSpecial ? '#FFD700' : 'var(--color-primary)'} />
                  </div>

                  {/* Obsah */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {activity.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.25rem'
                    }}>
                      <span>{formatDate(activity.date)}</span>
                      <span>•</span>
                      <span>{formatTime(activity.date)}</span>
                    </div>
                    {activity.type === 'daily_goal' && activity.subtitle && (
                      <div style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: 600 }}>
                        {activity.subtitle}
                      </div>
                    )}
                    {activity.type === 'level_up' && activity.subtitle && (
                      <div style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: 600 }}>
                        {activity.subtitle}
                      </div>
                    )}
                    {activity.type === 'song' && activity.isPerfect && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Trophy size={12} />
                        Perfektní!
                      </div>
                    )}
                    {activity.type === 'song' && !activity.isPerfect && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {activity.mistakes} {activity.mistakes === 1 ? 'chyba' : activity.mistakes < 5 ? 'chyby' : 'chyb'}
                      </div>
                    )}
                    {activity.type === 'quiz' && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Skóre: {activity.score}/{activity.totalQuestions}
                      </div>
                    )}
                  </div>

                  {/* XP */}
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius)',
                    background: 'rgba(181, 31, 101, 0.1)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    +{activity.xp}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
