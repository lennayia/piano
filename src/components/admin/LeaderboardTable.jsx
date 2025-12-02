import { useState, useEffect } from 'react';
import { Trophy, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/CardComponents';
import { useResponsive } from '../../hooks/useResponsive';

/**
 * Kompaktní tabulková verze žebříčku pro admin panel
 * - Pagination (50 uživatelů na stránku)
 * - Menší řádky pro úsporu místa
 * - Bez ikon (pouze číslo pozice)
 * - Responzivní: mobile (320-640px) = #, Jméno, Email, Level, XP
 * - Desktop (>640px) = všechny sloupce
 */
const LeaderboardTable = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 50;
  const { isMobile, width } = useResponsive();
  const showEmail = width >= 480;

  const levelThresholds = [
    { level: 1, min_xp: 0, max_xp: 99, label: 'Začátečník' },
    { level: 2, min_xp: 100, max_xp: 249, label: 'Učedník' },
    { level: 3, min_xp: 250, max_xp: 499, label: 'Pokročilý' },
    { level: 4, min_xp: 500, max_xp: 999, label: 'Expert' },
    { level: 5, min_xp: 1000, max_xp: null, label: 'Mistr' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from('piano_user_stats')
        .select('*', { count: 'exact', head: true });

      setTotalUsers(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('piano_user_stats')
        .select(`
          *,
          piano_users!inner (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('total_xp', { ascending: false })
        .range(from, to);

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

  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startRank = (currentPage - 1) * itemsPerPage;
  const endRank = Math.min(startRank + itemsPerPage, totalUsers);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
          <Zap size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
          Načítám žebříček...
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Trophy size={24} color="var(--color-primary)" />
          <h2 style={{ margin: 0, color: 'var(--color-text)' }}>
            Žebříček všech uživatelů
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Celkem: {totalUsers} uživatelů
          </span>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            | Stránka {currentPage}/{totalPages}
          </span>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <Card opacity={0.6} blur="10px" radius="md">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            Zatím žádní uživatelé na žebříčku
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid rgba(45, 91, 120, 0.1)',
                    background: 'rgba(45, 91, 120, 0.03)'
                  }}>
                    {/* # */}
                    <th className="text-xs font-semibold" style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      #
                    </th>

                    {/* Jméno */}
                    <th className="text-xs font-semibold" style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Jméno
                    </th>

                    {/* Email - skrýt pod 480px */}
                    {showEmail && (
                      <th className="text-xs font-semibold" style={{
                        padding: '0.5rem',
                        textAlign: 'left',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Email
                      </th>
                    )}

                    {/* Level */}
                    <th className="text-xs font-semibold" style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Level
                    </th>

                    {/* Lekce - skrýt na mobile */}
                    {!isMobile && (
                      <th className="text-xs font-semibold" style={{
                        padding: '0.5rem',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Lekce
                      </th>
                    )}

                    {/* Kvízy - skrýt na mobile */}
                    {!isMobile && (
                      <th className="text-xs font-semibold" style={{
                        padding: '0.5rem',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Kvízy
                      </th>
                    )}

                    {/* Písně - skrýt na mobile */}
                    {!isMobile && (
                      <th className="text-xs font-semibold" style={{
                        padding: '0.5rem',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Písně
                      </th>
                    )}

                    {/* Cíle - skrýt na mobile */}
                    {!isMobile && (
                      <th className="text-xs font-semibold" style={{
                        padding: '0.5rem',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Cíle
                      </th>
                    )}

                    {/* XP */}
                    <th className="text-xs font-semibold" style={{
                      padding: '0.5rem',
                      textAlign: 'right',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => {
                    const level = getLevelForXP(user.total_xp || 0);
                    const globalRank = startRank + index + 1;

                    return (
                      <tr
                        key={user.user_id}
                        style={{
                          borderBottom: '1px solid rgba(45, 91, 120, 0.05)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(45, 91, 120, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Rank */}
                        <td className="font-semibold" style={{
                          padding: '0.5rem',
                          color: 'var(--color-text)'
                        }}>
                          {globalRank}
                        </td>

                        {/* Jméno */}
                        <td className="font-medium" style={{
                          padding: '0.5rem',
                          color: 'var(--color-text)'
                        }}>
                          {user.piano_users?.first_name && user.piano_users?.last_name
                            ? `${user.piano_users.first_name} ${user.piano_users.last_name}`
                            : 'Neznámý uživatel'}
                        </td>

                        {/* Email - skrýt pod 480px */}
                        {showEmail && (
                          <td className="text-sm" style={{
                            padding: '0.5rem',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {user.piano_users?.email || '-'}
                          </td>
                        )}

                        {/* Level */}
                        <td className="text-sm" style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {level.level}
                        </td>

                        {/* Lekce - skrýt na mobile */}
                        {!isMobile && (
                          <td className="font-medium" style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            color: 'var(--color-text)'
                          }}>
                            {user.lessons_completed || 0}
                          </td>
                        )}

                        {/* Kvízy - skrýt na mobile */}
                        {!isMobile && (
                          <td className="font-medium" style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            color: 'var(--color-text)'
                          }}>
                            {user.quizzes_completed || 0}
                          </td>
                        )}

                        {/* Písně - skrýt na mobile */}
                        {!isMobile && (
                          <td className="font-medium" style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            color: 'var(--color-text)'
                          }}>
                            {user.songs_completed || 0}
                          </td>
                        )}

                        {/* Cíle - skrýt na mobile */}
                        {!isMobile && (
                          <td className="font-medium" style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            color: 'var(--color-text)'
                          }}>
                            {user.daily_goals_completed || 0}
                          </td>
                        )}

                        {/* XP */}
                        <td className="font-semibold" style={{
                          padding: '0.5rem',
                          textAlign: 'right',
                          color: 'var(--color-primary)'
                        }}>
                          {user.total_xp || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: currentPage === 1 ? 'rgba(45, 91, 120, 0.1)' : 'var(--color-secondary)',
                  color: currentPage === 1 ? 'var(--color-text-secondary)' : '#ffffff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                <ChevronLeft size={16} />
                Předchozí
              </button>

              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {startRank + 1} - {endRank} z {totalUsers}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: currentPage === totalPages ? 'rgba(45, 91, 120, 0.1)' : 'var(--color-secondary)',
                  color: currentPage === totalPages ? 'var(--color-text-secondary)' : '#ffffff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                Další
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
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
        Kompaktní tabulkový přehled všech uživatelů seřazených podle XP. Zobrazeno {itemsPerPage} uživatelů na stránku.
      </Card>
    </div>
  );
};

export default LeaderboardTable;
