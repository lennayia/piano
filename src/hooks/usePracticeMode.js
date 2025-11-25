import { useState } from 'react';
import audioEngine from '../utils/audio';

/**
 * Univerzální hook pro správu režimů cvičení (Procvičovat / Výzva)
 * Používá se pro písničky i akordy
 */
function usePracticeMode() {
  const [practicingMode, setPracticingMode] = useState(null); // ID položky v režimu procvičování
  const [challengeMode, setChallengeMode] = useState(null); // ID položky v režimu výzvy
  const [practiceProgress, setPracticeProgress] = useState([]); // [{note, correct}]
  const [practiceErrors, setPracticeErrors] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedItemTitle, setCompletedItemTitle] = useState('');

  /**
   * Spustit režim procvičování (s nápovědou)
   */
  const startPractice = (itemId) => {
    setPracticingMode(itemId);
    setChallengeMode(null);
    setPracticeProgress([]);
    setPracticeErrors(0);
  };

  /**
   * Spustit režim výzvy (bez nápovědy, pro odměny)
   */
  const startChallenge = (itemId) => {
    setChallengeMode(itemId);
    setPracticingMode(null);
    setPracticeProgress([]);
    setPracticeErrors(0);
  };

  /**
   * Ukončit cvičení
   */
  const stopPractice = () => {
    setPracticingMode(null);
    setChallengeMode(null);
    setPracticeProgress([]);
    setPracticeErrors(0);
  };

  /**
   * Zaznamenat zahranou notu
   */
  const recordNote = (note, isCorrect) => {
    setPracticeProgress(prev => [...prev, { note, correct: isCorrect }]);

    if (!isCorrect) {
      setPracticeErrors(prev => prev + 1);
      audioEngine.playError();
    }
  };

  /**
   * Zkontrolovat, zda je cvičení dokončeno
   */
  const checkCompletion = (totalNotes, onComplete) => {
    if (practiceProgress.length >= totalNotes) {
      const isPerfect = practiceErrors === 0;
      const isChallenge = challengeMode !== null;

      if (onComplete) {
        onComplete({
          isPerfect,
          isChallenge,
          errors: practiceErrors,
          progress: practiceProgress
        });
      }

      return true;
    }
    return false;
  };

  /**
   * Spustit oslavu (pro perfektní výzvu)
   */
  const celebrate = (itemTitle) => {
    setShowCelebration(true);
    setCompletedItemTitle(itemTitle);
    audioEngine.playFanfare();
    setTimeout(() => audioEngine.playApplause(), 500);

    setTimeout(() => {
      setShowCelebration(false);
      setShowSuccessModal(true);
    }, 3000);
  };

  /**
   * Zavřít success modal
   */
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    stopPractice();
  };

  return {
    // States
    practicingMode,
    challengeMode,
    practiceProgress,
    practiceErrors,
    showCelebration,
    showSuccessModal,
    completedItemTitle,

    // Actions
    startPractice,
    startChallenge,
    stopPractice,
    recordNote,
    checkCompletion,
    celebrate,
    closeSuccessModal,

    // Computed
    isPracticing: practicingMode !== null,
    isChallenge: challengeMode !== null,
    isActive: practicingMode !== null || challengeMode !== null
  };
}

export default usePracticeMode;
