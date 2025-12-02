import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { BarChart3, Zap, Trophy, Users, Target } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import AdminDashboard from '../Dashboard';
import LeaderboardTable from '../LeaderboardTable';

/**
 * Wrapper komponenta pro Admin → Přehledy → Statistiky
 * Zobrazuje 3. úroveň navigace (Obecné, Gamifikace, Žebříček)
 */
function StatisticsOverview() {
  const [activeTab, setActiveTab] = useState('general');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'general', label: 'Obecné', icon: BarChart3 },
    { id: 'gamification', label: 'Gamifikace', icon: Zap },
    { id: 'leaderboard', label: 'Žebříček', icon: Trophy }
  ];

  useEffect(() => {
    if (activeTab === 'gamification') {
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

        {/* Leaderboard Tab - Kompaktní tabulková verze pro admin */}
        {activeTab === 'leaderboard' && <LeaderboardTable />}
      </div>
    </div>
  );
}

export default StatisticsOverview;
