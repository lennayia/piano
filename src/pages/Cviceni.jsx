import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Headphones, Shuffle, Piano, Target } from 'lucide-react';
import useUserStore from '../store/useUserStore';
import { PageSection } from '../components/ui/PageSection';
import { useDailyGoal } from '../hooks/useDailyGoal';
import { saveDailyGoalCompletion } from '../services/dailyGoalService';
import { getCelebrationConfig, triggerCelebration } from '../services/celebrationService';
import CelebrationEffect from '../components/ui/CelebrationEffect';
import { RADIUS, SHADOW, BORDER } from '../utils/styleConstants';
import SongLibrary from '../components/resources/SongLibrary';
import ChordQuiz from '../components/games/ChordQuiz';
import { FloatingHelpButton } from '../components/ui/FloatingHelp';
import { shuffleArray } from '../utils/noteUtils';
import { supabase } from '../lib/supabase';
import ChordPracticeSection from '../components/practice/ChordPracticeSection';
import { Card } from '../components/ui/CardComponents';
import { ToggleButton } from '../components/ui/ButtonComponents';

// Konstanty pro navigaci - mimo komponentu pro lepší performance
const MAIN_TABS = [
  { id: 'chords', label: 'Akordy', icon: Piano },
  { id: 'quiz', label: 'Poznáte akord?', icon: Target },
  { id: 'songs', label: 'Písničky', icon: Music }
];

// Sub-taby podle aktivní hlavní sekce
const SUB_TABS_CONFIG = {
  'chords': [
    { id: 'all', label: 'Všechny akordy' },
    { id: 'easy', label: 'Základní' },
    { id: 'medium', label: 'Pokročilé' }
  ],
  'quiz': [], // Žádné sub-taby pro quiz
  'songs': [
    { id: 'all', label: 'Všechny' },
    { id: 'lidovky', label: 'Lidovky' },
    { id: 'uzskorolidovky', label: 'Užskorolidovky' },
    { id: 'detske', label: 'Dětské' }
  ]
};

// Možnosti řazení - pouze pro sekci Písničky
const SORT_OPTIONS = [
  { value: 'default', label: 'Výchozí pořadí' },
  { value: 'name-asc', label: 'Název (A-Z)' },
  { value: 'name-desc', label: 'Název (Z-A)' },
  { value: 'difficulty-asc', label: 'Obtížnost (od nejlehčí)' },
  { value: 'difficulty-desc', label: 'Obtížnost (od nejtěžší)' },
  { value: 'tempo-asc', label: 'Tempo (od nejpomalejšího)' },
  { value: 'tempo-desc', label: 'Tempo (od nejrychlejšího)' },
  { value: 'key-asc', label: 'Stupnice (A-Z)' },
  { value: 'key-desc', label: 'Stupnice (Z-A)' }
];

function Cviceni() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);

  // State pro sekci Akordy
  const [allChords, setAllChords] = useState([]);
  const [chords, setChords] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all', 'easy', 'medium'
  const [isShuffled, setIsShuffled] = useState(false);
  const [loading, setLoading] = useState(true);

  // State pro navigaci mezi sekcemi
  const [activeSection, setActiveSection] = useState('chords'); // 'chords', 'quiz', 'songs'
  const [activeSongCategory, setActiveSongCategory] = useState('all');

  // Search & Sort - pouze pro sekci Písničky
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // State pro daily goal celebration
  const [dailyGoalCelebrationData, setDailyGoalCelebrationData] = useState(null);
  const [showDailyGoalCelebration, setShowDailyGoalCelebration] = useState(false);

  // Callback pro splnění denního cíle - AKORDY
  const handleChordGoalCompleted = useCallback(
    async (goalData) => {
      if (!currentUser) return;

      const result = await saveDailyGoalCompletion(currentUser.id, goalData);

      if (result.success) {
        const unlockedAchievements = result.unlockedAchievements || [];
        const config = getCelebrationConfig('daily_goal', unlockedAchievements);

        if (unlockedAchievements.length === 0) {
          const streakText = result.newStreak > 1
            ? `${result.newStreak} dní v řadě! 🔥`
            : 'První den! 💪';
          config.message = `🎯 Denní cíl splněn!\n${streakText}`;
        }

        setDailyGoalCelebrationData({
          config,
          xpEarned: result.xpEarned,
          achievements: unlockedAchievements
        });
        setShowDailyGoalCelebration(true);

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

        const updateUserStats = useUserStore.getState().updateUserStats;
        if (updateUserStats) updateUserStats();
      }
    },
    [currentUser]
  );

  // Callback pro splnění denního cíle - QUIZ
  const handleQuizGoalCompleted = useCallback(
    async (goalData) => {
      if (!currentUser) return;

      const result = await saveDailyGoalCompletion(currentUser.id, goalData);

      if (result.success) {
        const unlockedAchievements = result.unlockedAchievements || [];
        const config = getCelebrationConfig('daily_goal', unlockedAchievements);

        if (unlockedAchievements.length === 0) {
          const streakText = result.newStreak > 1
            ? `${result.newStreak} dní v řadě! 🔥`
            : 'První den! 💪';
          config.message = `🎯 Denní cíl splněn!\n${streakText}`;
        }

        setDailyGoalCelebrationData({
          config,
          xpEarned: result.xpEarned,
          achievements: unlockedAchievements
        });
        setShowDailyGoalCelebration(true);

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

        const updateUserStats = useUserStore.getState().updateUserStats;
        if (updateUserStats) updateUserStats();
      }
    },
    [currentUser]
  );

  // Callback pro splnění denního cíle - PÍSNIČKY
  const handleSongGoalCompleted = useCallback(
    async (goalData) => {
      if (!currentUser) return;

      const result = await saveDailyGoalCompletion(currentUser.id, goalData);

      if (result.success) {
        const unlockedAchievements = result.unlockedAchievements || [];
        const config = getCelebrationConfig('daily_goal', unlockedAchievements);

        if (unlockedAchievements.length === 0) {
          const streakText = result.newStreak > 1
            ? `${result.newStreak} dní v řadě! 🔥`
            : 'První den! 💪';
          config.message = `🎯 Denní cíl splněn!\n${streakText}`;
        }

        setDailyGoalCelebrationData({
          config,
          xpEarned: result.xpEarned,
          achievements: unlockedAchievements
        });
        setShowDailyGoalCelebration(true);

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

        const updateUserStats = useUserStore.getState().updateUserStats;
        if (updateUserStats) updateUserStats();
      }
    },
    [currentUser]
  );

  // Daily goal hooks - 3 samostatné pro každou sekci
  const chordsGoal = useDailyGoal('chords', handleChordGoalCompleted);
  const quizGoal = useDailyGoal('quiz', handleQuizGoalCompleted);
  const songsGoal = useDailyGoal('songs', handleSongGoalCompleted);

  // Helper funkce - vrátí aktuální daily goal podle aktivní sekce
  const getCurrentGoal = () => {
    switch (activeSection) {
      case 'chords':
        return { goal: chordsGoal, label: 'série v režimu procvičování' };
      case 'quiz':
        return { goal: quizGoal, label: 'akordů v kvízu' };
      case 'songs':
        return { goal: songsGoal, label: 'písniček' };
      default:
        return { goal: chordsGoal, label: 'série v režimu procvičování' };
    }
  };

  const currentGoalData = getCurrentGoal();

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    } else {
      fetchChords();
    }
  }, [currentUser, navigate]);

  const fetchChords = async () => {
    try {
      const { data, error } = await supabase
        .from('piano_quiz_chords')
        .select('*')
        .eq('is_active', true)
        .eq('quiz_type', 'chord')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAllChords(data || []);
      setChords(data || []);
    } catch (error) {
      console.error('Chyba při načítání akordů:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrování a míchání akordů
  useEffect(() => {
    let filtered = selectedDifficulty === 'all'
      ? allChords
      : allChords.filter(chord => chord.difficulty === selectedDifficulty);

    if (isShuffled) {
      filtered = shuffleArray(filtered);
    }

    setChords(filtered);
  }, [selectedDifficulty, allChords, isShuffled]);

  // Callb pro reset progress z ChordPracticeSection
  const handleResetProgress = useCallback(() => {
    // Callback volaný při změně obtížnosti nebo míchání v ChordPracticeSection
    // Můžeme sem přidat další logiku, pokud je potřeba
  }, []);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="container">
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Music size={48} color="var(--color-primary)" />
          </motion.div>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Načítám cvičení...</p>
        </Card>
      </div>
    );
  }

  if (chords.length === 0) {
    return (
      <div className="container">
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <Music size={64} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
          <h2>Zatím nejsou k dispozici žádná cvičení</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Administrátor musí nejprve přidat akordy do databáze.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <FloatingHelpButton title="Nápověda - Cvičení">
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Cvičení
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            Procvičujte si hru na klavír různými způsoby.
          </p>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: RADIUS.md,
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Akordy</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Procvičujte hraní akordů. Zobrazí se vám název akordu a tóny, které máte zahrát na klaviatuře. Můžete si akord přehrát postupně nebo najednou.
            </p>
          </div>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: RADIUS.md,
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Poznáte akord?</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Kvíz pro trénink sluchové analýzy. Přehrajte si akord a hádejte, který to je. Skvělé pro rozvoj hudebního sluchu.
            </p>
          </div>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: RADIUS.md,
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Písničky</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Hrajte známé písničky podle not. Vyberte kategorii (Lidovky, Užskorolidovky, Dětské) a procvičujte melodie.
            </p>
          </div>

          <h4 style={{ color: 'var(--color-text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Tipy
          </h4>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Míchání:</strong> Zapněte náhodné pořadí akordů pro lepší procvičení
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Obtížnost:</strong> Filtrujte akordy podle úrovně (Základní, Pokročilé)
            </li>
            <li>
              <strong>Přehrávání:</strong> Klikněte na tóny pro náslech správného zvuku
            </li>
          </ul>
        </div>
      </FloatingHelpButton>

      <PageSection
        maxWidth="lg"
        icon={Headphones}
        title="Cvičení"
        description="Procvičujte akordy nebo si zahrajte písničky podle not"
        mainTabs={MAIN_TABS}
        subTabs={SUB_TABS_CONFIG}
        activeMainTab={activeSection}
        activeSubTab={activeSection === 'chords' ? selectedDifficulty : activeSection === 'songs' ? activeSongCategory : 'all'}
        onMainTabChange={setActiveSection}
        onSubTabChange={(value) => {
          if (activeSection === 'chords') {
            setSelectedDifficulty(value);
          } else if (activeSection === 'songs') {
            setActiveSongCategory(value);
          }
        }}
        subTabsAction={activeSection === 'chords' ? (
          <ToggleButton
            isActive={isShuffled}
            onClick={() => setIsShuffled(!isShuffled)}
            icon={Shuffle}
            label="Míchat"
            activeTitle="Vypnout míchání"
            inactiveTitle="Zamíchat akordy"
          />
        ) : null}
        showDailyGoal={true}
        dailyGoal={currentGoalData.goal.dailyGoal}
        onSetDailyGoal={currentGoalData.goal.setDailyGoal}
        completedToday={currentGoalData.goal.completedToday}
        progressCurrent={currentGoalData.goal.completedToday}
        progressTotal={currentGoalData.goal.dailyGoal}
        progressTitle="Dnešní pokrok:"
        goalLabel={currentGoalData.label}
        showSearch={activeSection === 'songs'}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Najít písničku"
        showSort={activeSection === 'songs'}
        sortValue={sortBy}
        sortOptions={SORT_OPTIONS}
        onSortChange={setSortBy}
      >
      </PageSection>

      {/* Sekce Akordy - MIMO PageSection */}
      {activeSection === 'chords' && (
        <ChordPracticeSection
          chords={chords}
          selectedDifficulty={selectedDifficulty}
          isShuffled={isShuffled}
          currentUser={currentUser}
          onDailyGoalComplete={chordsGoal.markCompleted}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Sekce Poznáte akord? - MIMO PageSection */}
      {activeSection === 'quiz' && (
        <ChordQuiz onDailyGoalComplete={quizGoal.markCompleted} />
      )}

      {/* Sekce Písničky - MIMO PageSection */}
      {activeSection === 'songs' && (
        <SongLibrary
          activeCategory={activeSongCategory}
          searchTerm={searchTerm}
          sortBy={sortBy}
          onDailyGoalComplete={songsGoal.markCompleted}
        />
      )}

      {/* Oslava pro denní cíle */}
      {dailyGoalCelebrationData && (
        <CelebrationEffect
          isVisible={showDailyGoalCelebration}
          config={dailyGoalCelebrationData.config}
          xpEarned={dailyGoalCelebrationData.xpEarned}
          achievements={dailyGoalCelebrationData.achievements}
          onComplete={() => setShowDailyGoalCelebration(false)}
        />
      )}
    </>
  );
}

export default Cviceni;
