import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { BarChart3, Zap, Trophy, Crown, Users, Target } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import AdminDashboard from '../Dashboard';

/**
 * Wrapper komponenta pro Admin → Přehledy → Statistiky
 * Zobrazuje 3. úroveň navigace (Obecné, Gamifikace, Žebříček)
 */
function StatisticsOverview() {
  const [activeTab, setActiveTab] = useState('general');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const [levelThresholds] = useState([
    { level: 1, min_xp: 0, max_xp: 99, label: 'Začátečník' },
    { level: 2, min_xp: 100, max_xp: 249, label: 'Učedník' },
    { level: 3, min_xp: 250, max_xp: 499, label: 'Pokročilý' },
    { level: 4, min_xp: 500, max_xp: 999, label: 'Expert' },
    { level: 5, min_xp: 1000, max_xp: null, label: 'Mistr' }
  ]);

  const tabs = [
    { id: 'general', label: 'Obecné', icon: BarChart3 },
    { id: 'gamification', label: 'Gamifikace', icon: Zap },
    { id: 'leaderboard', label: 'Žebříček', icon: Trophy }
  ];

  useEffect(() => {
    if (activeTab === 'leaderboard' || activeTab === 'gamification') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('piano_user_stats')
        .select(`
          *,
          piano_users!inner (
            first_name,
            last_name,
            email
          )
        `)
        .order('total_xp', { ascending: false })
        .limit(50);

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

  return (
    <div className="card">
      {/* 3. úroveň navigace */}
      <TabButtons
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        options={{ layout: 'pill', size: 'sm' }}
      />

      {/* Obsah podle aktivního tabu */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'general' && <AdminDashboard />}

        {/* Gamification Stats Tab */}
        {activeTab === 'gamification' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} color="var(--color-primary)" />
              Celkové statistiky gamifikace
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.1), rgba(255, 255, 255, 0.6))',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(45, 91, 120, 0.3)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <Users size={32} color="var(--color-secondary)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  {leaderboard.length}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Aktivních uživatelů
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1), rgba(255, 255, 255, 0.6))',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(181, 31, 101, 0.3)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <Zap size={32} color="var(--color-primary)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  {leaderboard.reduce((sum, user) => sum + (user.total_xp || 0), 0)}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Celkem XP rozdáno
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.1), rgba(255, 255, 255, 0.6))',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(45, 91, 120, 0.3)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <Trophy size={32} color="var(--color-secondary)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, user) => sum + (user.total_xp || 0), 0) / leaderboard.length) : 0}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Průměr XP na uživatele
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="var(--color-primary)" />
                TOP 50 žebříček
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchLeaderboard}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Aktualizovat
              </motion.button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Načítám žebříček...
              </div>
            ) : leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Zatím žádní uživatelé
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {leaderboard.map((user, index) => {
                  const level = getLevelForXP(user.total_xp || 0);
                  const isTopThree = index < 3;

                  return (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      style={{
                        background: isTopThree
                          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 255, 255, 0.6))'
                          : 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: isTopThree
                          ? '2px solid rgba(255, 215, 0, 0.4)'
                          : '1px solid rgba(45, 91, 120, 0.2)',
                        borderRadius: 'var(--radius)',
                        padding: '1rem',
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr auto auto',
                        gap: '1rem',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        background: isTopThree
                          ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                          : 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                        color: 'white',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        position: 'relative'
                      }}>
                        {index + 1}
                        {isTopThree && (
                          <Crown
                            size={16}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              color: '#FFD700'
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                          {user.piano_users?.first_name && user.piano_users?.last_name
                            ? `${user.piano_users.first_name} ${user.piano_users.last_name}`
                            : 'Neznámý uživatel'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {user.piano_users?.email}
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(45, 91, 120, 0.1)',
                        borderRadius: 'var(--radius)',
                        padding: '0.5rem 1rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                          Level {level.level}
                        </div>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                          {level.label}
                        </div>
                      </div>

                      <div style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        color: 'white',
                        borderRadius: 'var(--radius)',
                        padding: '0.75rem 1.25rem',
                        textAlign: 'center',
                        minWidth: '100px'
                      }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                          Celkem XP
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                          {user.total_xp || 0}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatisticsOverview;
