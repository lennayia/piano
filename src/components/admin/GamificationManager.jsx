import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Trophy, Users, TrendingUp, Award,
  Settings, Save, HelpCircle, Crown,
  Zap, Music, BookOpen, Target
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import TabButtons, { HelpPanel } from '../ui/TabButtons';
import { HelpButton } from '../ui/ButtonComponents';

const GamificationManager = () => {
  const [activeTab, setActiveTab] = useState('xp-rules');
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]); // Dynamické achievements z DB
  const [xpRules, setXpRules] = useState({
    lesson_completion: 10,
    quiz_correct: 5,
    song_completion: 15,
    daily_login: 2,
    achievement_unlock: 20
  });
  const [levelThresholds, setLevelThresholds] = useState([
    { level: 1, min_xp: 0, max_xp: 99, label: 'Začátečník' },
    { level: 2, min_xp: 100, max_xp: 249, label: 'Učedník' },
    { level: 3, min_xp: 250, max_xp: 499, label: 'Pokročilý' },
    { level: 4, min_xp: 500, max_xp: 999, label: 'Expert' },
    { level: 5, min_xp: 1000, max_xp: null, label: 'Mistr' }
  ]);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tabs = [
    { id: 'xp-rules', label: 'XP Pravidla', icon: Zap },
    { id: 'levels', label: 'Levely', icon: TrendingUp },
    { id: 'leaderboard', label: 'Žebříček', icon: Trophy },
    { id: 'stats', label: 'Statistiky', icon: Target }
  ];

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (activeTab === 'xp-rules') {
      fetchAchievements();
    }
  }, [activeTab]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('piano_achievements')
        .select('id, title, description, icon_type, xp_reward')
        .order('id', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

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

  const handleSaveXPRules = () => {
    // V budoucnu můžeme uložit do DB, zatím local state
    showSuccess('XP pravidla byla uložena');
  };

  const handleSaveLevels = () => {
    showSuccess('Nastavení levelů bylo uloženo');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={24} color="var(--color-primary)" />
            Správa gamifikace
          </h2>

          <HelpButton onClick={() => setShowHelp(!showHelp)} isActive={showHelp} />
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(45, 91, 120, 0.1)',
              border: '2px solid var(--color-secondary)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              color: 'var(--color-secondary)',
              fontWeight: '500'
            }}
          >
            <Trophy size={20} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        title="Nápověda - Gamifikace"
        content={{
          tips: [
            'XP Pravidla: Nastavte kolik bodů uživatel získá za různé aktivity',
            'Levely: Definujte prahy XP pro jednotlivé levely a jejich názvy',
            'Žebříček: Přehled TOP 50 uživatelů podle celkového XP',
            'Statistiky: Celkové statistiky gamifikace'
          ]
        }}
      />

      {/* Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <TabButtons
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          options={{ layout: 'pill', size: 'sm' }}
        />
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* XP Rules Tab */}
        {activeTab === 'xp-rules' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--color-primary)" />
              Pravidla XP bodů
            </h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Lesson Completion */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(45, 91, 120, 0.2)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <BookOpen size={20} color="var(--color-secondary)" />
                  <h4 style={{ margin: 0 }}>Dokončení lekce</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={xpRules.lesson_completion}
                    onChange={(e) => setXpRules({ ...xpRules, lesson_completion: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ width: '120px' }}
                    min="0"
                  />
                  <span style={{ color: '#64748b' }}>XP za dokončení jedné lekce</span>
                </div>
              </div>

              {/* Quiz Correct */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(45, 91, 120, 0.2)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <Target size={20} color="var(--color-secondary)" />
                  <h4 style={{ margin: 0 }}>Správná odpověď v kvízu</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={xpRules.quiz_correct}
                    onChange={(e) => setXpRules({ ...xpRules, quiz_correct: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ width: '120px' }}
                    min="0"
                  />
                  <span style={{ color: '#64748b' }}>XP za správnou odpověď</span>
                </div>
              </div>

              {/* Song Completion */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(45, 91, 120, 0.2)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <Music size={20} color="var(--color-secondary)" />
                  <h4 style={{ margin: 0 }}>Dokončení písně</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={xpRules.song_completion}
                    onChange={(e) => setXpRules({ ...xpRules, song_completion: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ width: '120px' }}
                    min="0"
                  />
                  <span style={{ color: '#64748b' }}>XP za dokončení písně</span>
                </div>
              </div>

              {/* Daily Login */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(45, 91, 120, 0.2)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <Award size={20} color="var(--color-secondary)" />
                  <h4 style={{ margin: 0 }}>Denní přihlášení</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={xpRules.daily_login}
                    onChange={(e) => setXpRules({ ...xpRules, daily_login: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ width: '120px' }}
                    min="0"
                  />
                  <span style={{ color: '#64748b' }}>XP za denní login</span>
                </div>
              </div>

              {/* Achievement Unlock */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(45, 91, 120, 0.2)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <Trophy size={20} color="var(--color-secondary)" />
                  <h4 style={{ margin: 0 }}>Odemčení achievementu</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={xpRules.achievement_unlock}
                    onChange={(e) => setXpRules({ ...xpRules, achievement_unlock: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ width: '120px' }}
                    min="0"
                  />
                  <span style={{ color: '#64748b' }}>XP za odemčení odměny</span>
                </div>
              </div>
            </div>

            {/* Dynamické XP pravidla - Achievements */}
            {achievements.length > 0 && (
              <>
                <h3 style={{
                  marginTop: '2.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingTop: '2rem',
                  borderTop: '2px solid rgba(45, 91, 120, 0.2)'
                }}>
                  <Award size={20} color="var(--color-primary)" />
                  Odměny (Achievements)
                </h3>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {achievements.map((achievement) => {
                    const IconComponent = (achievement.icon_type && LucideIcons[achievement.icon_type]) || Trophy;

                    return (
                      <div
                        key={achievement.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(181, 31, 101, 0.2)',
                          borderRadius: 'var(--radius)',
                          padding: '1.25rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                          {IconComponent && <IconComponent size={20} color="var(--color-primary)" />}
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>{achievement.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          background: 'rgba(45, 91, 120, 0.05)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          marginTop: '0.75rem'
                        }}>
                          <Zap size={16} color="var(--color-secondary)" />
                          <span style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '1.125rem' }}>
                            {achievement.xp_reward} XP
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            za odemčení této odměny
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(45, 91, 120, 0.08)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <HelpCircle size={20} color="var(--color-secondary)" />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>
                    <strong>Info:</strong> Pro úpravu XP hodnot u achievements přejděte do záložky <strong>"Odměny"</strong> v hlavní navigaci.
                  </p>
                </div>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveXPRules}
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              Uložit XP pravidla
            </motion.button>
          </div>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--color-primary)" />
              Nastavení levelů
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {levelThresholds.map((threshold, index) => (
                <div
                  key={threshold.level}
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(45, 91, 120, 0.2)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px 120px',
                    gap: '1rem',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    color: 'white',
                    borderRadius: 'var(--radius)',
                    padding: '0.5rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.125rem'
                  }}>
                    Level {threshold.level}
                  </div>

                  <input
                    type="text"
                    value={threshold.label}
                    onChange={(e) => {
                      const newThresholds = [...levelThresholds];
                      newThresholds[index].label = e.target.value;
                      setLevelThresholds(newThresholds);
                    }}
                    className="form-input"
                    placeholder="Název levelu"
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Od:</span>
                    <input
                      type="number"
                      value={threshold.min_xp}
                      onChange={(e) => {
                        const newThresholds = [...levelThresholds];
                        newThresholds[index].min_xp = parseInt(e.target.value);
                        setLevelThresholds(newThresholds);
                      }}
                      className="form-input"
                      style={{ width: '80px' }}
                      min="0"
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Do:</span>
                    <input
                      type="number"
                      value={threshold.max_xp || ''}
                      onChange={(e) => {
                        const newThresholds = [...levelThresholds];
                        newThresholds[index].max_xp = e.target.value ? parseInt(e.target.value) : null;
                        setLevelThresholds(newThresholds);
                      }}
                      className="form-input"
                      style={{ width: '80px' }}
                      placeholder="∞"
                      min="0"
                    />
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveLevels}
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              Uložit nastavení levelů
            </motion.button>
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

        {/* Stats Tab */}
        {activeTab === 'stats' && (
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
      </motion.div>
    </div>
  );
};

export default GamificationManager;
