import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, RotateCcw, CheckCircle, XCircle, ChevronRight, ChevronLeft, Volume2, Headphones, Shuffle, Piano, Target } from 'lucide-react';
import useUserStore from '../store/useUserStore';
import PianoKeyboard from '../components/lessons/PianoKeyboard';
import { PageSection } from '../components/ui/PageSection';
import { useDailyGoal } from '../hooks/useDailyGoal';
import { saveDailyGoalCompletion } from '../services/dailyGoalService';
import { getCelebrationConfig } from '../services/celebrationService';
import CelebrationEffect from '../components/ui/CelebrationEffect';
import { IconButton, MelodyNote } from '../components/ui/ButtonComponents';
import { ProgressBar, InfoPanel } from '../components/ui/CardComponents';
import PracticeModeControls from '../components/ui/PracticeModeControls';
import { RADIUS, SHADOW, BORDER } from '../utils/styleConstants';
import SongLibrary from '../components/resources/SongLibrary';
import ChordQuiz from '../components/games/ChordQuiz';
import { FloatingHelpButton } from '../components/ui/FloatingHelp';
import audioEngine from '../utils/audio';
import { getChordNotesWithOctaves, shuffleArray } from '../utils/noteUtils';
import { supabase } from '../lib/supabase';
import useProgressTracking from '../hooks/useProgressTracking';
import PracticeCelebration from '../components/practice/PracticeCelebration';
import { celebrate, triggerCelebration } from '../services/celebrationService';

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

  const [allChords, setAllChords] = useState([]);
  const [chords, setChords] = useState([]);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [practicingMode, setPracticingMode] = useState(false); // režim procvičování S nápovědou
  const [challengeMode, setChallengeMode] = useState(false); // režim výzvy BEZ nápovědy (pro odměny)
  const [practiceErrors, setPracticeErrors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const celebrationTriggeredRef = useRef(false); // Ochrana před dvojím spuštěním celebration

  // Hook pro sledování pokroku (dokončených akordů)
  const { completedCount, incrementCompleted, resetProgress } = useProgressTracking();
  const [completedChordIds, setCompletedChordIds] = useState(new Set()); // Set ID akordů dokončených v této sérii (challenge mode)
  const [practiceCompletedChordIds, setPracticeCompletedChordIds] = useState(new Set()); // Set ID akordů dokončených v practice sérii
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all', 'easy', 'medium'
  const [isShuffled, setIsShuffled] = useState(false);
  const [activeSection, setActiveSection] = useState('chords'); // 'chords', 'quiz', 'theory', 'songs'
  const [activeSongCategory, setActiveSongCategory] = useState('all');
  const [playingNoteIndex, setPlayingNoteIndex] = useState(-1); // Index přehrávané noty při poslechu (-1 = nepřehrává se)
  const [isPlayingFullChord, setIsPlayingFullChord] = useState(false); // true = přehrává se celý akord najednou

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
    setCurrentChordIndex(0);
    resetProgress(); // Reset počítadla dokončených akordů
    setCompletedChordIds(new Set()); // Reset seznamu dokončených akordů v nové sérii (challenge mode)
    setPracticeCompletedChordIds(new Set()); // Reset practice série při změně obtížnosti
    celebrationTriggeredRef.current = false; // Reset celebration flagu pro novou sérii
    resetPractice();
  }, [selectedDifficulty, allChords, isShuffled]);

  // Sledování dokončení série v režimu Procvičovat
  useEffect(() => {
    if (practicingMode && chords.length > 0 && practiceCompletedChordIds.size === chords.length) {
      // Všechny akordy v obtížnosti dokončeny! Série hotova
      setTimeout(() => {
        // Odměny a statistiky JEN při dokončení "Všechny akordy"
        if (selectedDifficulty === 'all') {
          // Zvýšit denní cíl (uloží se do Supabase)
          chordsGoal.markCompleted();

          // Zobrazit info uživateli
          audioEngine.playSuccess();
          alert(`🎉 Série dokončena!\n\nZahráli jste všechny akordy (${chords.length} akordů).\n\nDenní cíl: +1 série procvičování\n✅ Uloženo do statistik`);
        } else {
          // Jen lokální feedback, bez odměn
          audioEngine.playSuccess();
          alert(`✅ Dokončili jste všechny akordy v obtížnosti (${chords.length} akordů).\n\nℹ️ Pro odměny a statistiky procvičujte "Všechny akordy".`);
        }

        // Reset pro novou sérii
        setPracticeCompletedChordIds(new Set());
      }, 500);
    }
  }, [practiceCompletedChordIds, chords.length, practicingMode, selectedDifficulty, chordsGoal]);

  // Sledování dokončení všech akordů - VELKÁ OSLAVA! 🎉 (JEN v režimu Výzvy)
  useEffect(() => {
    if (challengeMode && completedCount > 0 && chords.length > 0 && completedCount === chords.length && !celebrationTriggeredRef.current) {
      // Všechny akordy dokončeny v režimu Výzvy!
      setTimeout(async () => {
        // Zkontrolovat flag znovu (ochrana před race condition)
        if (celebrationTriggeredRef.current) return;
        celebrationTriggeredRef.current = true; // Nastavit flag, aby se nespustilo znovu

        audioEngine.playSuccess();
        setShowCelebration(true);
        setShowSuccessModal(true);

        // Odměny a uložení do DB JEN při dokončení "Všechny akordy"
        if (selectedDifficulty === 'all') {
          // Použít centralizovaný celebration service
          try {
            const result = await celebrate({
              type: 'chord_practice',
              userId: currentUser.id,
              itemId: 'chord_series',
              itemTitle: `Série ${chords.length} akordů`,
              metadata: {
                chordsCompleted: chords.length,
                difficulty: selectedDifficulty,
                isShuffled: isShuffled,
                mode: 'challenge' // Pouze v režimu výzvy se ukládá completion
              }
            });

            if (result.success) {
              // Aktualizovat lokální store
              const updateUserStats = useUserStore.getState().updateUserStats;
              if (updateUserStats) {
                updateUserStats();
              }

              // Pokud došlo k level-upu, zobrazit speciální oslavu
              if (result.data?.leveledUp && result.data?.levelUpConfig) {
                setTimeout(() => {
                  triggerCelebration(
                    result.data.levelUpConfig.confettiType,
                    result.data.levelUpConfig.sound,
                    {
                      title: `⭐ Level ${result.data.level}!`,
                      message: `Gratulujeme! Dosáhli jste levelu ${result.data.level} s ${result.data.totalXP} XP!`,
                      type: 'success',
                      duration: 5000
                    }
                  );
                }, 3500);
              }
            }
          } catch (error) {
            console.error('Chyba při ukládání dokončení akordů:', error);
          }
        } else {
          // Gratulace, ale bez odměn a uložení do DB
          setTimeout(() => {
            alert(`✅ Dokončili jste všechny akordy v obtížnosti!\n\nℹ️ Pro odměny, XP a statistiky dokončete "Všechny akordy" v režimu Výzva.`);
          }, 1000);
        }
      }, 500);
    }
  }, [challengeMode, completedCount, chords.length, currentUser, selectedDifficulty, isShuffled]);

  const currentChord = chords[currentChordIndex];

  // Noty jsou už ve správném formátu v databázi (A., C#, H'', atd.)
  // Použijeme je přímo pro zvýraznění na klaviatuře
  const chordNotesWithOctaves = currentChord?.notes || [];

  // Přehrát celý akord najednou
  const playFullChord = () => {
    if (!currentChord) return;

    // Vizuálně zvýraznit všechny noty najednou
    setIsPlayingFullChord(true);

    chordNotesWithOctaves.forEach((note, index) => {
      setTimeout(() => {
        audioEngine.playNote(note, 1.0);
        // Reset po posledním tónu
        if (index === chordNotesWithOctaves.length - 1) {
          setTimeout(() => setIsPlayingFullChord(false), 300);
        }
      }, index * 50); // Malé zpoždění pro "rozložený" zvuk
    });
  };

  // Přehrát akord postupně (arpeggio)
  const playArpeggio = () => {
    if (!currentChord) return;

    chordNotesWithOctaves.forEach((note, index) => {
      setTimeout(() => {
        setPlayingNoteIndex(index); // Vizuálně zvýraznit
        audioEngine.playNote(note, 1.0);
        // Reset po posledním tónu
        if (index === chordNotesWithOctaves.length - 1) {
          setTimeout(() => setPlayingNoteIndex(-1), 300);
        }
      }, index * 400);
    });
  };

  // Handler pro klik na klávesu
  const handleNoteClick = (note) => {
    if (!currentChord) return;

    const requiredNotes = chordNotesWithOctaves;

    // Kontrola: je aktuální nota správná? (odpovídá notě na dané pozici)
    // Použijeme modulo pro umožnění opakování akordu
    const currentIndex = playedNotes.length % requiredNotes.length;
    const expectedNote = requiredNotes[currentIndex];

    if (note !== expectedNote) {
      // Špatná nota! Přehrát chybový zvuk, zobrazit chybu
      audioEngine.playError();
      setShowError(true);
      setPracticeErrors(prev => prev + 1);

      // VÝZVA: Reset na ZAČÁTEK CELÉ SÉRIE při jakékoliv chybě (velmi přísný režim!)
      if (challengeMode) {
        setTimeout(() => {
          setPlayedNotes([]);
          setPracticeErrors(0);
          setCurrentChordIndex(0); // Zpět na první akord
          setCompletedChordIds(new Set()); // Reset všech dokončených akordů
          resetProgress(); // Reset completion bar
          celebrationTriggeredRef.current = false;
        }, 1000); // Po zobrazení chyby
      }
      // PROCVIČOVÁNÍ: Nechat playedNotes - uživatel může pokračovat i po chybě

      // Skrýt ikonu chyby po animaci
      setTimeout(() => {
        setShowError(false);
      }, 1000);
      return;
    }

    const newPlayedNotes = [...playedNotes, note];
    setPlayedNotes(newPlayedNotes);

    // Kontrola: všechny noty zahrány správně v pořadí poprvé?
    const isFirstCompletion = newPlayedNotes.length === requiredNotes.length;
    // Úspěch JEN když nebyly žádné chyby!
    const isPerfect = practiceErrors === 0;

    // Přehrát zvuk úspěchu jen pokud ještě nebyl úspěch, všechny noty jsou správně a NENÍ ŽÁDNÁ CHYBA
    if (!showSuccess && isFirstCompletion && isPerfect) {
      // Úspěch! Přehrát zvuk úspěchu
      setTimeout(() => {
        audioEngine.playSuccess();
        setShowSuccess(true);

        // Zvýšit počítadlo JEN v režimu Výzvy (challengeMode) a jen pokud akord ještě nebyl dokončen
        if (challengeMode && !completedChordIds.has(currentChord.id)) {
          incrementCompleted(); // Lišta nad kvízem - completion bar
          setCompletedChordIds(prev => new Set(prev).add(currentChord.id));
        }

        // V režimu Procvičovat - označit akord jako dokončený v sérii
        if (practicingMode && !practiceCompletedChordIds.has(currentChord.id)) {
          setPracticeCompletedChordIds(prev => new Set(prev).add(currentChord.id));
        }

        // Automatický přechod na další akord po 1.5 sekundě (v obou režimech)
        setTimeout(() => {
          nextChord();
        }, 1500);
      }, 300);
    }
  };

  // Reset aktuálního cvičení
  const resetPractice = () => {
    setPlayedNotes([]);
    setShowSuccess(false);
    setShowError(false);
    setPracticeErrors(0); // Reset počtu chyb pro nový pokus
  };

  // Přejít na další akord
  const nextChord = () => {
    if (currentChordIndex < chords.length - 1) {
      setCurrentChordIndex(currentChordIndex + 1);
    } else {
      setCurrentChordIndex(0); // Začít znovu od začátku
    }
    resetPractice();
  };

  // Přejít na předchozí akord
  const prevChord = () => {
    if (currentChordIndex > 0) {
      setCurrentChordIndex(currentChordIndex - 1);
    } else {
      setCurrentChordIndex(chords.length - 1);
    }
    resetPractice();
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Music size={48} color="var(--color-primary)" />
        </motion.div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Načítám cvičení...</p>
      </div>
    );
  }

  if (chords.length === 0) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Music size={64} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
          <h2>Zatím nejsou k dispozici žádná cvičení</h2>
          <p style={{ color: '#64748b' }}>Administrátor musí nejprve přidat akordy do databáze.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FloatingHelpButton title="Nápověda - Cvičení">
        <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
          <h4 style={{ color: '#1e293b', marginBottom: '0.75rem', fontSize: '1rem' }}>
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
            <strong style={{ color: '#1e293b' }}>Akordy</strong>
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
            <strong style={{ color: '#1e293b' }}>Poznáte akord?</strong>
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
            <strong style={{ color: '#1e293b' }}>Písničky</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Hrajte známé písničky podle not. Vyberte kategorii (Lidovky, Užskorolidovky, Dětské) a procvičujte melodie.
            </p>
          </div>

          <h4 style={{ color: '#1e293b', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsShuffled(!isShuffled)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: RADIUS.md,
              border: BORDER.none,
              boxShadow: SHADOW.subtle,
              background: isShuffled
                ? 'var(--color-secondary)'
                : 'rgba(255, 255, 255, 0.7)',
              color: isShuffled ? 'white' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: isShuffled ? 600 : 400,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title={isShuffled ? 'Vypnout míchání' : 'Zamíchat akordy'}
          >
            <Shuffle size={16} />
            Míchat
          </motion.button>
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
      {/* Sekce Akordy */}
      {activeSection === 'chords' && (
        <>
      {/* Progress bar */}
      <ProgressBar
        current={completedCount}
        total={chords.length}
        title="Režim výzva:"
        titleColor="var(--color-primary)"
      />

      {/* Hlavní karta cvičení */}
      <motion.div
        key={currentChordIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: 'none',
          borderRadius: RADIUS.xl,
          boxShadow: SHADOW.lg,
          marginBottom: '2rem',
          paddingBottom: '1rem'
        }}
      >
        {/* Název akordu s navigací */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <IconButton
            icon={ChevronLeft}
            onClick={prevChord}
            variant="secondary"
            size={40}
            iconSize={24}
            ariaLabel="Předchozí akord"
          />
          <motion.h2
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              margin: 0
            }}
          >
            {currentChord?.name}
          </motion.h2>
          <IconButton
            icon={ChevronRight}
            onClick={nextChord}
            variant="primary"
            size={40}
            iconSize={24}
            ariaLabel="Další akord"
          />
        </div>

        {/* Tóny k zahrání - skryté v režimu výzvy */}
        {!challengeMode && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            padding: '0.5rem'
          }}>
            {chordNotesWithOctaves.map((note, index) => {
              const isPlayed = playedNotes.includes(note);
              // isCurrent = buď nota při cvičení, nebo nota při přehrávání
              const isCurrent = (practicingMode || challengeMode)
                ? playedNotes.length === index // V režimu cvičení: nota, kterou má uživatel zahrát
                : isPlayingFullChord // Při přehrávání celého akordu: všechny noty najednou
                ? true
                : playingNoteIndex === index; // Při přehrávání postupně: jen aktuální nota
              // Zobrazit původní název noty (bez oktávové notace)
              const displayNote = currentChord?.notes[index] || note;
              return (
                <motion.div
                  key={note}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  onClick={() => audioEngine.playNote(note, 1.0)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <MelodyNote
                    note={displayNote}
                    isCurrent={isCurrent}
                    isNext={false}
                    isPlayed={isPlayed}
                  />
                  {isPlayed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px'
                      }}
                    >
                      <CheckCircle size={24} color="white" fill="var(--color-primary)" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Režimy cvičení s přehrávacími tlačítky - univerzální komponenta */}
        <PracticeModeControls
          isPracticing={practicingMode}
          isChallenge={challengeMode}
          practiceErrors={practiceErrors}
          progress={playedNotes.length}
          totalNotes={chordNotesWithOctaves.length}
          onStartPractice={() => {
            setPracticingMode(true);
            setChallengeMode(false);
            setPracticeErrors(0);
            setPlayedNotes([]);
            setShowSuccess(false);
          }}
          onStartChallenge={() => {
            setPracticingMode(false);
            setChallengeMode(true);
            setPracticeErrors(0);
            setPlayedNotes([]);
            setShowSuccess(false);
          }}
          onStop={() => {
            setPracticingMode(false);
            setChallengeMode(false);
            setPracticeErrors(0);
            setPlayedNotes([]);
            setShowSuccess(false);
          }}
          showStopButton={true}
          showSuccess={showSuccess}
          showError={showError}
          onReset={resetPractice}
        >
          {/* Přehrávací tlačítka */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={playArpeggio}
            className="btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              background: 'rgba(45, 91, 120, 0.1)',
              color: 'var(--color-secondary)',
              border: 'none',
              borderRadius: RADIUS.md,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Play size={16} />
            Přehrát postupně
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={playFullChord}
            className="btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              background: 'rgba(45, 91, 120, 0.1)',
              color: 'var(--color-secondary)',
              border: 'none',
              borderRadius: RADIUS.md,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Volume2 size={16} />
            Přehrát akord
          </motion.button>
        </PracticeModeControls>

        {/* Klaviatura */}
        <div style={{ marginBottom: '1rem' }}>
          <PianoKeyboard
            highlightedNotes={
              challengeMode
                ? [] // VÝZVA: Žádné zvýraznění - bez nápovědy!
                : chordNotesWithOctaves // PROCVIČOVÁNÍ nebo normální režim: Zobrazit nápovědu
            }
            onNoteClick={handleNoteClick}
          />
        </div>

        {/* Stav zahraných not */}
        {playedNotes.length > 0 && !showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(181, 31, 101, 0.1)',
              borderRadius: RADIUS.lg,
              marginBottom: '1rem'
            }}
          >
            <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Zahrané tóny:</p>
            <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              {playedNotes.join(' → ')}
            </p>
          </motion.div>
        )}

        {/* Úspěch! - VÝZVA: InfoPanel s oslavou */}
        <AnimatePresence>
          {showSuccess && challengeMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <InfoPanel
                variant="secondary"
                style={{ textAlign: 'center', padding: '2rem 1.5rem', borderRadius: RADIUS.xl }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <CheckCircle size={56} color="var(--color-secondary)" style={{ margin: '0 auto' }} />
                </motion.div>
                <h3 style={{
                  color: 'var(--color-secondary)',
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 700
                }}>
                  Výborně!
                </h3>
                <p style={{ fontSize: '1rem', color: '#475569' }}>
                  Správně jste zahráli akord <strong style={{ color: 'var(--color-secondary)' }}>{currentChord?.name}</strong>
                </p>
              </InfoPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
        </>
      )}

      {/* Sekce Poznáte akord? */}
      {activeSection === 'quiz' && (
        <ChordQuiz onDailyGoalComplete={quizGoal.markCompleted} />
      )}

      {/* Sekce Písničky */}
      {activeSection === 'songs' && (
        <SongLibrary
          activeCategory={activeSongCategory}
          searchTerm={searchTerm}
          sortBy={sortBy}
          onDailyGoalComplete={songsGoal.markCompleted}
        />
      )}
      </PageSection>

      {/* Oslava po dokončení všech akordů */}
      <PracticeCelebration
        showCelebration={showCelebration}
        showSuccessModal={showSuccessModal}
        completedItemTitle={`Všechny akordy (${chords.length} akordů)`}
        xpAwarded={chords.length * 10}
        onClose={() => {
          setShowCelebration(false);
          setShowSuccessModal(false);
          resetProgress();
        }}
      />

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
