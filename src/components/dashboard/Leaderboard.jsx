import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useUserStore from '../../store/useUserStore';
import { Card } from '../ui/CardComponents';
import { Chip } from '../ui/ButtonComponents';
import { RADIUS } from '../../utils/styleConstants';
import { useResponsive } from '../../hooks/useResponsive';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useUserStore((state) => state.currentUser);
  const { isCompact } = useResponsive();

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
        return <Crown size={28} color="#D4AF37" />;
      case 2:
        return <Medal size={28} color="#C0C0C0" />;
      case 3:
        return <Medal size={28} color="#C9AE5D" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'rgba(212, 175, 55, 0.9)'; // Metalická zlatá (ne žlutá) - průhledná
      case 2:
        return 'rgba(192, 192, 192, 0.9)'; // Stříbrná - průhledná
      case 3:
        return 'rgba(201, 174, 93, 0.9)'; // Světlá bronzová (ne rezavá) - průhledná
      default:
        return 'rgba(75, 121, 150, 0.6)'; // Světlejší secondary modrá pro ostatní
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
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
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)' }}>
          <Trophy size={24} color="var(--color-primary)" />
          TOP 10 žebříček
        </h2>
        {currentUserRank > 0 && (
          <Chip
            text={`Vaše pozice: #${currentUserRank}`}
            variant="primary"
            style={{ fontWeight: 600, boxShadow: 'none' }}
          />
        )}
      </div>

      {leaderboard.length === 0 ? (
        <Card
          opacity={0.6}
          blur="10px"
          radius="md"
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-text-secondary)'
          }}
        >
          Zatím žádní uživatelé na žebříčku
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {leaderboard.map((user, index) => {
            const level = getLevelForXP(user.total_xp || 0);
            const isTopThree = index < 3;
            const isCurrentUser = user.piano_users?.id === currentUser?.id;

            const getCardBackground = () => {
              if (isCurrentUser) return 'rgba(181, 31, 101, 0.05)';
              return 'rgba(255, 255, 255, 0.7)'; // Všechny stejné
            };

            const getCardShadow = () => {
              return '0 2px 8px rgba(0, 0, 0, 0.1)'; // Všechny stejný defaultní stín
            };

            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: getCardBackground(),
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  borderRadius: RADIUS.lg,
                  padding: isCompact ? '0.75rem' : '1rem',
                  display: 'grid',
                  gridTemplateColumns: isCompact ? '50px 1fr auto' : '60px 1fr auto auto auto auto auto',
                  gap: isCompact ? '0.5rem' : '1rem',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'visible',
                  boxShadow: getCardShadow()
                }}
              >
                {/* Rank Badge */}
                <div style={{
                  background: getRankColor(index + 1),
                  color: 'white',
                  borderRadius: RADIUS.lg,
                  width: isCompact ? '45px' : '50px',
                  height: isCompact ? '45px' : '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: isCompact ? '1.1rem' : '1.25rem',
                  position: 'relative',
                  overflow: 'visible',
                  boxShadow: index === 0 ? '0 4px 15px rgba(212, 175, 55, 0.4)' :
                             index === 1 ? '0 4px 15px rgba(192, 192, 192, 0.4)' :
                             index === 2 ? '0 4px 15px rgba(201, 174, 93, 0.4)' :
                             '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  {index + 1}
                  {isTopThree && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      zIndex: 999
                    }}>
                      {getRankIcon(index + 1)}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <div
                    className="font-semibold"
                    style={{
                      fontSize: '1rem',
                      marginBottom: '0.25rem',
                      color: 'var(--color-text)'
                    }}>
                    {user.piano_users?.first_name && user.piano_users?.last_name
                      ? `${user.piano_users.first_name} ${user.piano_users.last_name}`
                      : 'Neznámý uživatel'}
                    {isCurrentUser && (
                      <span
                        className="text-sm font-medium"
                        style={{
                          marginLeft: '0.5rem',
                          color: 'var(--color-primary)'
                        }}>
                        (Vy)
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                    <TrendingUp size={14} />
                    Level {level.level} - {level.label}
                  </div>
                </div>

                {/* Stats - Lekce, Kvízy, Písně, Cíle (pouze desktop > 1024px) */}
                {!isCompact && (
                  <>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      minWidth: '70px'
                    }}>
                      <div
                        className="text-xs"
                        style={{
                          color: 'var(--color-text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                        Lekce
                      </div>
                      <Chip
                        text={user.lessons_completed || 0}
                        variant="light"
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      minWidth: '70px'
                    }}>
                      <div
                        className="text-xs"
                        style={{
                          color: 'var(--color-text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                        Kvízy
                      </div>
                      <Chip
                        text={user.quizzes_completed || 0}
                        variant="light"
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      minWidth: '70px'
                    }}>
                      <div
                        className="text-xs"
                        style={{
                          color: 'var(--color-text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                        Písně
                      </div>
                      <Chip
                        text={user.songs_completed || 0}
                        variant="light"
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      minWidth: '70px'
                    }}>
                      <div
                        className="text-xs"
                        style={{
                          color: 'var(--color-text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                        Cíle
                      </div>
                      <Chip
                        text={user.daily_goals_completed || 0}
                        variant="light"
                      />
                    </div>
                  </>
                )}

                {/* XP Badge */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  minWidth: '80px'
                }}>
                  <div
                    className="text-xs"
                    style={{
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                    XP
                  </div>
                  <Chip
                    text={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Zap size={14} />
                        {user.total_xp || 0}
                      </div>
                    }
                    variant="info"
                    style={{ fontWeight: 600 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <Card
        opacity={0.05}
        blur="10px"
        radius="md"
        shadow="none"
        className="text-base"
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          background: 'rgba(45, 91, 120, 0.05)'
        }}
      >
        <Trophy size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Získejte XP dokončováním lekcí, kvízů a písní. Žebříček se aktualizuje automaticky!
      </Card>
    </div>
  );
};

export default Leaderboard;
