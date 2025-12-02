import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, BookOpen, Trophy, Flame, Zap, Piano, Star, Target, GraduationCap, History, Music, Gamepad2, Clock, Calendar, X, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../store/useUserStore';
import useLessonStore from '../store/useLessonStore';
import useAchievementsStore from '../store/useAchievementsStore';
import { getRecentActivities, getActivitiesForAchievement } from '../services/activityService';
import * as LucideIcons from 'lucide-react';
import TabButtons from '../components/ui/TabButtons';
import Leaderboard from '../components/dashboard/Leaderboard';
import { StatCard, ProgressBar } from '../components/ui/CardComponents';
import { PrimaryButton, Chip, CloseButton } from '../components/ui/ButtonComponents';
import Drawer from '../components/ui/Drawer';
import { useResponsive } from '../hooks/useResponsive';
import { DRAWER_SPACING } from '../utils/styleConstants';

// Dynamické renderování ikony odměny podle dat z databáze
const getAchievementIcon = (achievement) => {
  // Pokud máme icon_type z databáze, použijeme ho
  if (achievement.icon_type) {
    const IconComponent = LucideIcons[achievement.icon_type];
    const color = achievement.icon_color || 'primary';

    if (IconComponent) {
      return <IconComponent size={32} color={`var(--color-${color})`} />;
    }
  }

  // Fallback: pokud nemáme icon_type, použijeme staré emoji mapování (zpětná kompatibilita)
  const iconMap = {
    '🎹': <Piano size={32} color="var(--color-primary)" />,
    '📚': <BookOpen size={32} color="var(--color-secondary)" />,
    '🎓': <GraduationCap size={32} color="var(--color-primary)" />,
    '🔥': <Flame size={32} color="var(--color-secondary)" />,
    '⭐': <Star size={32} color="var(--color-primary)" />,
    '💯': <Target size={32} color="var(--color-secondary)" />,
    '🏆': <Trophy size={32} color="var(--color-primary)" />
  };

  return iconMap[achievement.icon] || <Award size={32} color="var(--color-primary)" />;
};

// Jednoduchá funkce pro převod jména do vokativu (5. pádu)
function toVocative(name) {
  if (!name) return name;

  // Mužská jména končící na -r, -l, -n přidávají -e
  if (name.match(/^(Petr|Pavel|Karel|Jan|Martin|Milan|Roman|Tomáš|Lukáš)$/i)) {
    return name + 'e';
  }
  // Mužská jména končící na -a mění -a na -o
  if (name.match(/^(Jarda|Honza|Míša)$/i)) {
    return name.slice(0, -1) + 'o';
  }
  // Ženská jména končící na -a mění -a na -o
  if (name.match(/a$/)) {
    return name.slice(0, -1) + 'o';
  }
  // Ostatní jména zůstávají beze změny
  return name;
}

function UserDashboard() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserStats = useUserStore((state) => state.updateUserStats);
  const lessons = useLessonStore((state) => state.lessons);
  const fetchLessons = useLessonStore((state) => state.fetchLessons);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activeTab, setActiveTab] = useState('achievements');
  const [allAchievements, setAllAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // Filter for achievements
  const [selectedAchievement, setSelectedAchievement] = useState(null); // For modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [achievementActivities, setAchievementActivities] = useState([]);
  const [loadingModalActivities, setLoadingModalActivities] = useState(false);

  // Responzivita
  const { isMobile } = useResponsive();
  const spacing = isMobile ? DRAWER_SPACING.mobile : DRAWER_SPACING.desktop;

  // Načíst lekce z databáze
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Refresh user stats and achievements when component mounts or becomes visible
  useEffect(() => {
    const refreshData = async () => {
      if (currentUser) {
        await updateUserStats(); // Refresh stats and achievements from database
        fetchRecentActivities();
        fetchAllAchievements();
      }
    };

    refreshData();

    // Refresh when window gains focus (user returns to tab)
    const handleFocus = () => {
      if (currentUser) {
        updateUserStats();
        fetchAllAchievements();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser?.id, updateUserStats]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    }
  }, [currentUser, navigate]);

  const fetchRecentActivities = async () => {
    if (!currentUser) return;

    try {
      // Použít centralizovanou helper funkci (OPTIMALIZACE!)
      const activities = await getRecentActivities(currentUser.id, 5);

      // Mapovat ikony na Lucide komponenty
      const activitiesWithIcons = activities.map(activity => ({
        ...activity,
        icon: activity.icon === 'Music' ? Music :
              activity.icon === 'Gamepad2' ? Gamepad2 :
              activity.icon === 'BookOpen' ? BookOpen :
              BookOpen
      }));

      setRecentActivities(activitiesWithIcons);
    } catch (error) {
      console.error('Chyba při načítání nedávné aktivity:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchAllAchievements = async () => {
    if (!currentUser) return;

    try {
      // Získat achievements z cache (OPTIMALIZACE!)
      const achievementsStore = useAchievementsStore.getState();
      let achievementsData = achievementsStore.getAchievements();

      // Pokud cache je prázdná, načíst z DB
      if (achievementsData.length === 0) {
        achievementsData = await achievementsStore.loadAchievements();
      }

      if (!achievementsData) {
        console.error('Chyba při načítání achievementů z cache');
        return;
      }

      // Get user's earned achievements IDs with dates
      const earnedAchievements = currentUser.achievements || [];
      const earnedMap = new Map(earnedAchievements.map(a => [a.id, a]));

      // Calculate progress for each achievement
      const mergedAchievements = achievementsData.map(achievement => {
        const isEarned = earnedMap.has(achievement.id);
        const earnedData = earnedMap.get(achievement.id);

        // Calculate progress based on requirement type
        let progress = 0;
        let currentValue = 0;
        const requirementValue = achievement.requirement_value || 0;

        if (!isEarned) {
          switch (achievement.requirement_type) {
            case 'total_xp':
              currentValue = currentUser.stats?.total_xp || 0;
              break;
            case 'level':
              currentValue = currentUser.stats?.level || 1;
              break;
            case 'current_streak':
              currentValue = currentUser.stats?.current_streak || 0;
              break;
            case 'lessons_completed':
              currentValue = currentUser.stats?.lessons_completed || 0;
              break;
            case 'quizzes_completed':
              currentValue = currentUser.stats?.quizzes_completed || 0;
              break;
            case 'songs_completed':
              currentValue = currentUser.stats?.songs_completed || 0;
              break;
            default:
              currentValue = 0;
          }
          progress = requirementValue > 0 ? Math.min((currentValue / requirementValue) * 100, 100) : 0;
        } else {
          // Pro earned achievementy nastavíme currentValue = requirementValue
          currentValue = requirementValue;
          progress = 100;
        }

        return {
          ...achievement,
          isEarned,
          earnedAt: earnedData?.earnedAt || null,
          progress,
          currentValue,
          requirementValue
        };
      });

      setAllAchievements(mergedAchievements);
    } catch (error) {
      console.error('Chyba při načítání achievementů:', error);
    } finally {
      setLoadingAchievements(false);
    }
  };

  // Handle stat card click - filter achievements and switch to achievements tab
  const handleStatClick = (filterType) => {
    setActiveFilter(filterType);
    setActiveTab('achievements');

    // Scroll to achievements section
    setTimeout(() => {
      const achievementsSection = document.querySelector('[data-section="achievements"]');
      if (achievementsSection) {
        achievementsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Fetch activities that contributed to achievement
  const fetchAchievementActivities = async (achievement) => {
    if (!currentUser) return;

    setLoadingModalActivities(true);
    try {
      // Použít centralizovanou helper funkci (OPTIMALIZACE!)
      const activities = await getActivitiesForAchievement(
        currentUser.id,
        achievement.requirement_type,
        achievement.requirementValue || 10
      );

      setAchievementActivities(activities);

      // Update achievement's earnedAt to match last activity date
      if (achievement.isEarned && activities.length > 0) {
        const lastActivity = activities[activities.length - 1];
        const updatedAchievement = {
          ...achievement,
          earnedAt: lastActivity.date.toISOString()
        };

        // Update in allAchievements array so card shows correct date
        setAllAchievements(prev =>
          prev.map(a => a.id === achievement.id ? updatedAchievement : a)
        );

        // Update selected achievement for modal
        setSelectedAchievement(updatedAchievement);
      }
    } catch (error) {
      console.error('❌ Error fetching achievement activities:', error);
    } finally {
      setLoadingModalActivities(false);
    }
  };

  // Handle achievement click - open modal
  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
    fetchAchievementActivities(achievement);
  };

  // Navigate to relevant section based on achievement type
  const navigateToAchievementSection = (requirementType, e) => {
    e?.stopPropagation();

    const navigationMap = {
      'lessons_completed': '/lekce',
      'xp': '/lekce',
      'total_xp': '/lekce',
      'streak': '/lekce',
      'current_streak': '/lekce',
      'quizzes_completed': '/teorie',
      'songs_completed': '/cviceni'
    };

    const path = navigationMap[requirementType];

    if (path) {
      setIsModalOpen(false);
      navigate(path);
    }
  };

  if (!currentUser) {
    return null;
  }

  const completedLessons = currentUser.stats?.lessons_completed || 0;
  const totalLessons = lessons.length;
  const points = currentUser.stats?.total_xp || 0;
  const streak = currentUser.stats?.current_streak || 0;
  const quizzesCompleted = currentUser.stats?.quizzes_completed || 0;
  const songsCompleted = currentUser.stats?.songs_completed || 0;

  return (
    <div className="container">
      {/* Welcome Section */}
      <div className="card" style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: '0 8px 32px rgba(181, 31, 101, 0.15)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          Vítejte, {toVocative(currentUser.first_name)}!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Těšíte se na svoje další pokroky? Pojďme na to!
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
          <StatCard
            icon={Award}
            value={completedLessons}
            label="Dokončených lekcí"
            onClick={() => handleStatClick('lessons_completed')}
            delay={0.2}
          />

          <StatCard
            icon={BookOpen}
            value={totalLessons}
            label="Dostupných lekcí"
            delay={0.4}
          />

          <StatCard
            icon={Zap}
            value={points}
            label="Bodů"
            onClick={() => handleStatClick('total_xp')}
            delay={0.6}
          />

          <StatCard
            icon={Flame}
            value={streak}
            label="Dní v řadě"
            onClick={() => handleStatClick('current_streak')}
            delay={0.8}
          />

          <StatCard
            icon={Gamepad2}
            value={quizzesCompleted}
            label="Dokončených kvízů"
            onClick={() => handleStatClick('quizzes_completed')}
            delay={1.0}
          />

          <StatCard
            icon={Music}
            value={songsCompleted}
            label="Zahraných písní"
            onClick={() => handleStatClick('songs_completed')}
            delay={1.2}
          />
        </div>
      </div>

      {/* Achievements & Leaderboard Section */}
      <motion.div
        className="card"
        data-section="achievements"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: '0 8px 32px rgba(181, 31, 101, 0.15)',
          marginBottom: '2rem'
        }}
      >
        {/* Tabs */}
        <div style={{ marginBottom: '2rem' }}>
          <TabButtons
            tabs={[
              { id: 'achievements', label: 'Vaše odměny', icon: Trophy },
              { id: 'leaderboard', label: 'Žebříček', icon: Target }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            options={{ layout: 'pill', size: 'md' }}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'achievements' && (
          <div>
            {/* Filter indicator */}
            {activeFilter && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(181, 31, 101, 0.1)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                boxShadow: '0 1px 3px rgba(181, 31, 101, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span className="text-base font-medium" style={{ color: 'var(--color-primary)' }}>
                  Zobrazeny achievementy pro: {
                    activeFilter === 'lessons_completed' ? 'Dokončené lekce' :
                    activeFilter === 'total_xp' ? 'Body' :
                    activeFilter === 'current_streak' ? 'Dny v řadě' :
                    activeFilter === 'quizzes_completed' ? 'Dokončené kvízy' :
                    activeFilter === 'songs_completed' ? 'Zahrané písně' : ''
                  }
                </span>
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-base font-semibold"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Zobrazit vše
                </button>
              </div>
            )}

            {loadingAchievements ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--color-text-secondary)'
              }}>
                Načítání achievementů...
              </div>
            ) : allAchievements.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--color-text-secondary)',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                boxShadow: '0 1px 3px rgba(148, 163, 184, 0.1)'
              }}>
                <Trophy size={48} color="var(--color-primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Zatím nejsou k dispozici žádné odměny.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {allAchievements.map((achievement, index) => {
                  const isEarned = achievement.isEarned;
                  const isHighlighted = !activeFilter || achievement.requirement_type === activeFilter;
                  const isDimmed = activeFilter && achievement.requirement_type !== activeFilter;

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                        opacity: isDimmed ? 0.3 : 1
                      }}
                      transition={{ delay: index * 0.05, type: 'spring' }}
                      whileHover={{ scale: isDimmed ? 1 : 1.05, y: isDimmed ? 0 : -5 }}
                      onClick={() => !isDimmed && handleAchievementClick(achievement)}
                      style={{
                        padding: '1.5rem',
                        background: isDimmed
                          ? 'rgba(255, 255, 255, 0.3)'
                          : isEarned
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        borderRadius: 'var(--radius-xl)',
                        border: 'none',
                        textAlign: 'center',
                        cursor: isDimmed ? 'default' : 'pointer',
                        boxShadow: isDimmed
                          ? 'none'
                          : isEarned
                            ? '0 8px 24px rgba(181, 31, 101, 0.25)'
                            : '0 4px 12px rgba(148, 163, 184, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                        position: 'relative',
                        filter: isDimmed ? 'grayscale(80%)' : 'none',
                        transform: isHighlighted && activeFilter ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                      title={isDimmed ? achievement.description : 'Klikněte pro více informací'}
                    >
                      {/* Earned Badge - zelená ikona vlevo dole */}
                      {isEarned && !isDimmed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.3, type: 'spring' }}
                          style={{
                            position: 'absolute',
                            bottom: '0.75rem',
                            left: '0.75rem',
                            zIndex: 1,
                            width: '32px',
                            height: '32px',
                            background: '#ffffff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            border: 'none'
                          }}
                        >
                          <CheckCircle size={20} color="#10b981" fill="none" strokeWidth={2.5} />
                        </motion.div>
                      )}

                      {/* Icon */}
                      <div style={{
                        width: '64px',
                        height: '64px',
                        background: isEarned
                          ? 'rgba(255, 255, 255, 0.95)'
                          : 'rgba(226, 232, 240, 0.6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        boxShadow: isEarned
                          ? '0 4px 16px rgba(181, 31, 101, 0.25)'
                          : '0 2px 8px rgba(148, 163, 184, 0.15)',
                        filter: isEarned ? 'none' : 'grayscale(70%)'
                      }}>
                        {getAchievementIcon(achievement)}
                      </div>

                      {/* Title */}
                      <div style={{
                        fontWeight: 600,
                        color: isEarned ? 'var(--color-text)' : 'var(--color-text-secondary)',
                        fontSize: '0.95rem',
                        lineHeight: '1.3'
                      }}>
                        {achievement.title}
                      </div>

                      {/* Description */}
                      <div className="text-sm" style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.4',
                        minHeight: '2.8em'
                      }}>
                        {achievement.description}
                      </div>

                      {/* XP Reward */}
                      <Chip
                        text={`+${achievement.xp_reward} XP`}
                        variant={isEarned ? 'info' : 'inactive'}
                      />

                      {/* Progress Bar for Unearned */}
                      {!isEarned && (
                        <div style={{ width: '100%', marginTop: '0.25rem' }}>
                          <div className="text-xs font-medium" style={{
                            color: 'var(--color-text-secondary)',
                            marginBottom: '0.375rem'
                          }}>
                            {achievement.currentValue} / {achievement.requirementValue}
                          </div>
                          <div style={{
                            width: '100%',
                            height: '6px',
                            background: 'rgba(148, 163, 184, 0.2)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${achievement.progress}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, rgba(181, 31, 101, 0.6), rgba(221, 51, 121, 0.6))',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Earned Date */}
                      {isEarned && achievement.earnedAt && (
                        <div className="text-xs" style={{
                          color: 'var(--color-text-secondary)',
                          marginTop: '0.25rem'
                        }}>
                          Získáno {new Date(achievement.earnedAt).toLocaleDateString('cs-CZ')}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && <Leaderboard />}
      </motion.div>

      {/* Recent Activity */}
      {!loadingActivities && recentActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: 0
            }}>
              <History size={24} color="var(--color-primary)" />
              Nedávná aktivita
            </h2>
            <Link
              to="/history"
              className="text-base font-medium"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                color: 'var(--color-primary)',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Ukázat všechno →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0' : '0.5rem' }}>
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              const formatDate = (date) => {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                return `${day}.${month}.`;
              };
              const formatTime = (date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
              };

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="card"
                  style={{
                    padding: isMobile ? '0.75rem' : '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.75rem' : '1rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: 'none',
                    cursor: 'default',
                    borderRadius: isMobile ? 'var(--radius-md)' : 'var(--radius-lg)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.15) 0%, rgba(221, 51, 121, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    flexShrink: 0
                  }}>
                    <Icon size={20} color="var(--color-primary)" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-base font-semibold" style={{
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {activity.title}
                    </div>
                    <div className="text-sm" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: '0.25rem'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {formatDate(activity.date)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {formatTime(activity.date)}
                      </span>
                    </div>
                  </div>

                  <Chip
                    text={`+${activity.xp} XP`}
                    variant="info"
                    style={{
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Achievement Detail Drawer */}
      <Drawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAchievement?.title}
        width="500px"
      >
        {selectedAchievement && (
          <div>
              {/* Icon */}
              <div style={{
                width: '64px',
                height: '64px',
                background: selectedAchievement.isEarned
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(226, 232, 240, 0.6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                boxShadow: selectedAchievement.isEarned
                  ? '0 4px 16px rgba(181, 31, 101, 0.25)'
                  : '0 2px 8px rgba(148, 163, 184, 0.15)',
                filter: selectedAchievement.isEarned ? 'none' : 'grayscale(70%)',
                margin: `0 auto ${spacing.margin}`
              }}>
                <div style={{ transform: 'scale(1.0)' }}>
                  {getAchievementIcon(selectedAchievement)}
                </div>
              </div>

              {/* Description */}
              <p className="text-base" style={{
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.5',
                marginBottom: spacing.margin
              }}>
                {selectedAchievement.description}
              </p>

              {/* Requirements & Progress */}
              <div style={{
                background: 'rgba(248, 250, 252, 0.8)',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                padding: spacing.cardPadding,
                marginBottom: spacing.margin
              }}>
                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(181, 31, 101, 0.06)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedAchievement.currentValue / selectedAchievement.requirementValue) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, rgba(181, 31, 101, 1) 0%, rgba(45, 91, 120, 1) 100%)',
                      borderRadius: '999px'
                    }}
                  />
                </div>
                {/* Progress text */}
                <div className="text-sm font-medium" style={{
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  {selectedAchievement.currentValue} z {selectedAchievement.requirementValue}
                </div>
              </div>

              {/* Earned Date - show date of last contributing activity */}
              {selectedAchievement.isEarned && achievementActivities.length > 0 && (() => {
                const lastActivity = achievementActivities[achievementActivities.length - 1];
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: spacing.margin
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      border: 'none'
                    }}>
                      <CheckCircle size={16} color="#10b981" fill="none" strokeWidth={2.5} />
                    </div>
                    <span>
                      Splněno {lastActivity.date.toLocaleDateString('cs-CZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} v {lastActivity.date.toLocaleTimeString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                );
              })()}

              {/* XP Reward */}
              <div style={{
                textAlign: 'center',
                marginBottom: spacing.margin
              }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 10,
                    delay: 0.3
                  }}
                  whileHover={{ scale: 1.05 }}
                  style={{ display: 'inline-block' }}
                >
                  <Chip
                    text={`+${selectedAchievement.xp_reward} XP`}
                    variant="info"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      color: 'var(--color-primary)',
                      boxShadow: 'inset 0 0 16px rgba(181, 31, 101, 1), 0 1px 3px rgba(181, 31, 101, 0.15)'
                    }}
                  />
                </motion.div>
              </div>

              {/* Activity Details Section */}
              {achievementActivities.length > 0 && (
                <div style={{
                  marginBottom: spacing.margin,
                  paddingTop: spacing.sectionGap
                }}>
                  {loadingModalActivities ? (
                    <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Načítání...
                    </div>
                  ) : (
                    <div style={{
                      maxHeight: '70vh',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 'var(--radius-lg)',
                      border: 'none',
                      boxShadow: '0 1px 3px rgba(148, 163, 184, 0.1)'
                    }}>
                      {achievementActivities.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.03)' }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderBottom: index < achievementActivities.length - 1
                              ? '1px solid rgba(148, 163, 184, 0.1)'
                              : 'none',
                            cursor: 'default'
                          }}
                        >
                          {/* Icon */}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            minWidth: '32px',
                            background: 'rgba(181, 31, 101, 0.12)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none'
                          }}>
                            <CheckCircle size={16} color="var(--color-primary)" fill="none" strokeWidth={2.5} />
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-base font-medium" style={{
                              color: 'var(--color-text)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginBottom: '0.125rem'
                            }}>
                              {activity.title}
                            </div>
                            <div className="text-sm" style={{
                              color: 'var(--color-text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              {activity.date.toLocaleDateString('cs-CZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                              <span>•</span>
                              {activity.date.toLocaleTimeString('cs-CZ', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {/* XP Badge */}
                          <Chip
                            text={`+${activity.xp}`}
                            variant="success"
                            style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-md)' }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {!selectedAchievement.isEarned && (
                <PrimaryButton
                  onClick={(e) => navigateToAchievementSection(selectedAchievement.requirement_type, e)}
                  style={{ margin: '0 auto' }}
                >
                  Jít splnit
                  <ArrowRight size={18} />
                </PrimaryButton>
              )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default UserDashboard;
