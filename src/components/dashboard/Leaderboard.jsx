import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useUserStore from '../../store/useUserStore';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useUserStore((state) => state.currentUser);

  const levelThresholds = [
    { level: 1, min_xp: 0, max_xp: 99, label: 'Začátečník' },
    { level: 2, min_xp: 100, max_xp: 249, label: 'Učedník' },
    { level: 3, min_xp: 250, max_xp: 499, label: 'Pokročilý' },
    { level: 4, min_xp: 500, max_xp: 999, label: 'Expert' },
    { level: 5, min_xp: 1000, max_xp: null, label: 'Mistr' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('piano_user_stats')
        .select(`
          *,
          piano_users!inner (
            id,
            first_name,
            last_name
          )
        `)
        .order('total_xp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelForXP = (xp) => {
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      const threshold = levelThresholds[i];
      if (xp >= threshold.min_xp) {
        return threshold;
      }
    }
    return levelThresholds[0];
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'linear-gradient(135deg, #FFD700, #FFA500)';
      case 2:
        return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
      case 3:
        return 'linear-gradient(135deg, #CD7F32, #B8860B)';
      default:
        return 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        <Zap size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
        Načítám žebříček...
      </div>
    );
  }

  // Find current user's rank
  const currentUserRank = leaderboard.findIndex(
    user => user.piano_users?.id === currentUser?.id
  ) + 1;

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e293b' }}>
          <Trophy size={24} color="var(--color-primary)" />
          TOP 10 žebříček
        </h2>
        {currentUserRank > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.1), rgba(181, 31, 101, 0.1))',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(181, 31, 101, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 1rem',
            fontWeight: '600',
            color: 'var(--color-primary)',
            fontSize: '0.875rem'
          }}>
            Vaše pozice: #{currentUserRank}
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(45, 91, 120, 0.2)'
        }}>
          Zatím žádní uživatelé na žebříčku
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {leaderboard.map((user, index) => {
            const level = getLevelForXP(user.total_xp || 0);
            const isTopThree = index < 3;
            const isCurrentUser = user.piano_users?.id === currentUser?.id;

            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: isCurrentUser
                    ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.15), rgba(255, 255, 255, 0.8))'
                    : isTopThree
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(255, 255, 255, 0.8))'
                    : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: isCurrentUser
                    ? '2px solid var(--color-primary)'
                    : isTopThree
                    ? '2px solid rgba(255, 215, 0, 0.4)'
                    : '1px solid rgba(45, 91, 120, 0.2)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Rank Circle */}
                <div style={{
                  background: getRankColor(index + 1),
                  color: 'white',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  position: 'relative',
                  boxShadow: isTopThree ? '0 4px 15px rgba(255, 215, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  {index + 1}
                  {isTopThree && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px'
                    }}>
                      {getRankIcon(index + 1)}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginBottom: '0.25rem',
                    color: '#1e293b'
                  }}>
                    {user.piano_users?.first_name && user.piano_users?.last_name
                      ? `${user.piano_users.first_name} ${user.piano_users.last_name}`
                      : 'Neznámý uživatel'}
                    {isCurrentUser && (
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-primary)',
                        fontWeight: '500'
                      }}>
                        (Vy)
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TrendingUp size={14} />
                    Level {level.level} - {level.label}
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  background: 'rgba(45, 91, 120, 0.08)',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 0.75rem',
                  textAlign: 'center',
                  minWidth: '80px'
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Lekce
                  </div>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '1.125rem',
                    color: 'var(--color-secondary)'
                  }}>
                    {user.lessons_completed || 0}
                  </div>
                </div>

                {/* XP Badge */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'white',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  minWidth: '90px',
                  boxShadow: '0 4px 12px rgba(181, 31, 101, 0.3)'
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    opacity: 0.9,
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    XP
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}>
                    <Zap size={16} />
                    {user.total_xp || 0}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(45, 91, 120, 0.05)',
        borderRadius: 'var(--radius)',
        border: '1px solid rgba(45, 91, 120, 0.1)',
        fontSize: '0.875rem',
        color: '#64748b',
        textAlign: 'center'
      }}>
        <Trophy size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Získejte XP dokončováním lekcí, kvízů a písní. Žebříček se aktualizuje automaticky!
      </div>
    </div>
  );
};

export default Leaderboard;
