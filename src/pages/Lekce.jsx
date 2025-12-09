import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, List, Clock, CheckCircle } from 'lucide-react';
import LessonList from '../components/lessons/LessonList';
import useUserStore from '../store/useUserStore';
import useLessonStore from '../store/useLessonStore';
import { PageSection } from '../components/ui/PageSection';
import { ProgressBar } from '../components/ui/CardComponents';
import { useDailyGoal } from '../hooks/useDailyGoal';
import CelebrationEffect from '../components/ui/CelebrationEffect';
import { saveDailyGoalCompletion } from '../services/dailyGoalService';
import { getCelebrationConfig, triggerCelebration } from '../services/celebrationService';
import { supabase } from '../lib/supabase';

// Konstanty pro tab navigaci - mimo komponentu pro lepší performance
const MAIN_TABS = [
  { id: 'all', label: 'Všechny', icon: List },
  { id: 'in_progress', label: 'Probíhající', icon: Clock },
  { id: 'completed', label: 'Dokončené', icon: CheckCircle }
];

const SUB_TABS_CONFIG = {
  'all': [
    { id: 'all', label: 'Vše' },
    { id: 'beginner', label: 'Začátečník' },
    { id: 'intermediate', label: 'Mírně pokročilý začátečník' },
    { id: 'expert', label: 'Mírně pokročilý' }
  ],
  'in_progress': [
    { id: 'all', label: 'Vše' },
    { id: 'beginner', label: 'Začátečník' },
    { id: 'intermediate', label: 'Mírně pokročilý začátečník' },
    { id: 'expert', label: 'Mírně pokročilý' }
  ],
  'completed': [
    { id: 'all', label: 'Vše' },
    { id: 'beginner', label: 'Začátečník' },
    { id: 'intermediate', label: 'Mírně pokročilý začátečník' },
    { id: 'expert', label: 'Mírně pokročilý' }
  ]
};

// Možnosti řazení
const SORT_OPTIONS = [
  { value: 'default', label: 'Výchozí pořadí' },
  { value: 'name-asc', label: 'Název (A-Z)' },
  { value: 'name-desc', label: 'Název (Z-A)' },
  { value: 'difficulty-asc', label: 'Obtížnost (↑)' },
  { value: 'difficulty-desc', label: 'Obtížnost (↓)' }
];

// Lekce page with daily goal tracking
function Lekce() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const lessons = useLessonStore((state) => state.lessons);
  const [mainTab, setMainTab] = useState('all');
  const [difficultyTab, setDifficultyTab] = useState('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

  // Callback pro splnění denního cíle - memoizovaný pro lepší performance
  const handleGoalCompleted = useCallback(
    async (goalData) => {
      if (!currentUser) return;

      const result = await saveDailyGoalCompletion(currentUser.id, goalData);

    if (result.success) {
      const unlockedAchievements = result.unlockedAchievements || [];

      // Získat config z modularního systému
      const config = getCelebrationConfig('daily_goal', unlockedAchievements);

      // Pokud není achievement, přidat streak info do zprávy
      if (unlockedAchievements.length === 0) {
        const streakText = result.newStreak > 1
          ? `${result.newStreak} dní v řadě! 🔥`
          : 'První den! 💪';
        config.message = `🎯 Denní cíl splněn!\n${streakText}`;
      }

      setCelebrationData({
        config,
        xpEarned: result.xpEarned,
        achievements: unlockedAchievements
      });
      setShowCelebration(true);

      // Pokud došlo k level-upu, přidat level-up celebration
      if (result.leveledUp && result.levelUpConfig) {
        setTimeout(() => {
          triggerCelebration(
            result.levelUpConfig.confettiType,
            result.levelUpConfig.sound,
            {
              title: `⭐ Level ${result.level}!`,
              message: `Gratulujeme! Dosáhli jste levelu ${result.level} s ${result.totalXP} XP!`,
              type: 'success',
              duration: 5000
            }
          );
        }, 3500);
      }

      // Refresh stats
      const updateUserStats = useUserStore.getState().updateUserStats;
      if (updateUserStats) updateUserStats();
    }
  },
  [currentUser]
);

  // Denní cíl hook s callbackem
  const { dailyGoal, setDailyGoal, completedToday, markCompleted, progress, isGoalCompleted } = useDailyGoal('lessons', handleGoalCompleted);

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    }
  }, [currentUser, navigate]);

  // Načíst dokončené lekce pro aktuálního uživatele
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      if (currentUser) {
        try {
          const { data, error } = await supabase
            .from('piano_lesson_completions')
            .select('lesson_id')
            .eq('user_id', currentUser.id);

          if (!error && data) {
            setCompletedLessonIds(new Set(data.map(item => parseInt(item.lesson_id))));
          }
        } catch (error) {
          console.error('Error fetching completed lessons:', error);
        }
      }
    };

    fetchCompletedLessons();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  // Dynamický obsah podle aktivních tabů - memoizovaný pro lepší performance
  const sectionContent = useMemo(() => {
    const mainTabContent = {
      all: {
        title: 'Všechny lekce',
        description: 'Procházejte kompletní nabídku lekcí a vyberte si, co vás zajímá.'
      },
      in_progress: {
        title: 'Probíhající lekce',
        description: 'Pokračujte v lekcích, které jste již začali a ještě jste nedokončili.'
      },
      completed: {
        title: 'Dokončené lekce',
        description: 'Přehled všech lekcí, které jste úspěšně dokončili.'
      }
    };

    const difficultyContent = {
      all: '',
      beginner: ' Pro začátečníky.',
      intermediate: ' Pro pokročilé.',
      expert: ' Pro experty.'
    };

    const main = mainTabContent[mainTab] || mainTabContent.all;
    const difficulty = difficultyTab !== 'all' ? difficultyContent[difficultyTab] : '';

    return {
      title: main.title,
      description: main.description + difficulty
    };
  }, [mainTab, difficultyTab]);

  return (
    <>
      <PageSection
        maxWidth="lg"
        icon={BookOpen}
        title="Lekce"
        description="Procházejte si lekce a pokračujte v učení."
        mainTabs={MAIN_TABS}
        subTabs={SUB_TABS_CONFIG}
        activeMainTab={mainTab}
        activeSubTab={difficultyTab}
        onMainTabChange={setMainTab}
        onSubTabChange={setDifficultyTab}
        sectionTitle={sectionContent.title}
        sectionDescription={sectionContent.description}
        showDailyGoal={true}
        dailyGoal={dailyGoal}
        onSetDailyGoal={setDailyGoal}
        completedToday={completedToday}
        goalLabel="dokončených lekcí"
        progressLabel="Dnešní pokrok"
        progressCurrent={completedToday}
        progressTotal={dailyGoal}
        progressTitle="Dnešní pokrok:"
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Co hledáte?"
        showSort={true}
        sortOptions={SORT_OPTIONS}
        sortValue={sortBy}
        onSortChange={setSortBy}
      >
        {/* Progress bar - celkový pokrok všech lekcí */}
        <ProgressBar
          current={completedLessonIds.size}
          total={lessons.length}
          title="Celkový pokrok:"
          titleColor="var(--color-secondary)"
        />

        <LessonList
          filter={mainTab}
          difficulty={difficultyTab}
          onLessonComplete={markCompleted}
          searchTerm={searchTerm}
          sortBy={sortBy}
        />
      </PageSection>

      {/* Celebration Effect pro denní cíl */}
      {celebrationData && (
        <CelebrationEffect
          isVisible={showCelebration}
          config={celebrationData.config}
          xpEarned={celebrationData.xpEarned}
          achievements={celebrationData.achievements}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </>
  );
}

export default Lekce;
