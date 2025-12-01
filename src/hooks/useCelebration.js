import { useState } from 'react';
import { celebrate as celebrateService } from '../services/celebrationService';
import CelebrationEffect from '../components/ui/CelebrationEffect';

/**
 * Hook pro snadné použití celebration systému
 * @returns {Object} { celebrate, CelebrationDisplay }
 */
export function useCelebration() {
  const [celebrationData, setCelebrationData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Spustí oslavu dokončení
   * @param {Object} params - Parametry dokončení
   * @param {string} params.type - Typ aktivity ('lesson', 'song', 'quiz')
   * @param {number} params.id - ID položky
   * @param {string} params.title - Název položky
   * @param {string} params.userId - ID uživatele
   * @param {Object} params.metadata - Dodatečná data (score, atd.)
   */
  const celebrate = async ({ type, id, title, userId, metadata = {} }) => {
    try {
      const result = await celebrateService({
        type,
        userId,
        itemId: id,
        itemTitle: title,
        metadata
      });

      if (result.success) {
        // Nastavit data pro zobrazení
        setCelebrationData({
          xpEarned: result.data.xpEarned,
          totalXP: result.data.totalXP,
          level: result.data.level,
          leveledUp: result.data.leveledUp,
          unlockedAchievements: result.data.unlockedAchievements,
          config: result.data.celebrationConfig,
          isFirstTime: result.data.isFirstTime
        });

        // Zobrazit celebration
        setIsVisible(true);

        return result;
      } else {
        console.error('Chyba při oslavě:', result.error);
        return result;
      }
    } catch (error) {
      console.error('Chyba v useCelebration:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Zavře celebration
   */
  const handleClose = () => {
    setIsVisible(false);
    setCelebrationData(null);
  };

  /**
   * Komponenta pro zobrazení celebration
   */
  const CelebrationDisplay = () => {
    if (!celebrationData) return null;

    return (
      <CelebrationEffect
        isVisible={isVisible}
        config={celebrationData.config}
        xpEarned={celebrationData.xpEarned}
        achievements={celebrationData.unlockedAchievements}
        onComplete={handleClose}
      />
    );
  };

  return {
    celebrate,
    CelebrationDisplay,
    isVisible,
    celebrationData
  };
}

export default useCelebration;
