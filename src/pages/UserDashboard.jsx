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
import UserStatsGrid from '../components/dashboard/UserStatsGrid';
import AchievementGrid from '../components/dashboard/AchievementGrid';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import AchievementDetail from '../components/dashboard/AchievementDetail';
import { ProgressBar, Card } from '../components/ui/CardComponents';
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
            case 'xp':
              currentValue = currentUser.stats?.total_xp || 0;
              break;
            case 'level':
              currentValue = currentUser.stats?.level || 1;
              break;
            case 'streak':
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
      <Card
        className="card"
        shadow="primary"
        radius="xl"
        style={{
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          Vítejte, {toVocative(currentUser.first_name)}!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Těšíte se na svoje další pokroky? Pojďme se do toho hned pustit!
        </p>

        <UserStatsGrid
          stats={{
            completedLessons,
            totalLessons,
            points,
            streak,
            quizzesCompleted,
            songsCompleted
          }}
          onStatClick={handleStatClick}
        />
      </Card>

      {/* Achievements & Leaderboard Section */}
      <Card
        className="card"
        shadow="primary"
        radius="xl"
        opacity={0.4}
        style={{ marginBottom: '2rem' }}
      >
        <motion.div
          data-section="achievements"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
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
              <Card
                opacity={0.6}
                blur="10px"
                radius="md"
                style={{
                  textAlign: 'center',
                  padding: '3rem'
                }}
              >
                <Trophy size={48} color="var(--color-primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>Zatím nejsou k dispozici žádné odměny.</p>
              </Card>
            ) : (
              <AchievementGrid
                achievements={allAchievements}
                activeFilter={activeFilter}
                onAchievementClick={handleAchievementClick}
                getAchievementIcon={getAchievementIcon}
              />
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && <Leaderboard />}
      </motion.div>
      </Card>

      {/* Recent Activity */}
      {!loadingActivities && <RecentActivityList activities={recentActivities} isMobile={isMobile} />}

      {/* Achievement Detail Drawer */}
      <Drawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAchievement?.title}
        width="500px"
      >
        <AchievementDetail
          achievement={selectedAchievement}
          activities={achievementActivities}
          loadingActivities={loadingModalActivities}
          spacing={spacing}
          getAchievementIcon={getAchievementIcon}
          onNavigateToSection={navigateToAchievementSection}
        />
      </Drawer>
    </div>
  );
}

export default UserDashboard;
