import useQuizXPStore from '../store/useQuizXPStore';

/**
 * Získá motivační zprávu na základě skóre
 * @param {number} score - Počet správných odpovědí
 * @param {number} total - Celkový počet otázek
 * @returns {Object} Objekt s emoji, titulem, zprávou a barvou
 */
export const getMotivationalMessage = (score, total) => {
  const percentage = (score / total) * 100;

  if (percentage === 100) {
    return {
      emoji: '🎉',
      title: 'Perfektní!',
      message: 'Jste mistr rozpoznávání akordů! Absolutně neuvěřitelný výkon!',
      color: '#10b981'
    };
  } else if (percentage >= 80) {
    return {
      emoji: '🌟',
      title: 'Vynikající!',
      message: 'Skvělá práce! Jen pár chybiček a budete na vrcholu!',
      color: '#f59e0b'
    };
  } else if (percentage >= 70) {
    return {
      emoji: '👍',
      title: 'Velmi dobře!',
      message: 'Máte na to! Ještě trochu cvičení a budete hvězda!',
      color: '#3b82f6'
    };
  } else if (percentage >= 50) {
    return {
      emoji: '💪',
      title: 'Dobrý začátek!',
      message: 'Jste na dobré cestě. Pokračujte v tréninku!',
      color: '#8b5cf6'
    };
  } else {
    return {
      emoji: '🎯',
      title: 'Pokračujte v tréninku!',
      message: 'Každý mistr spadl z nebe. Zkuste to znovu!',
      color: '#ef4444'
    };
  }
};

/**
 * Vypočítá XP na základě skóre pomocí dynamických pravidel ze store
 * @param {number} score - Počet správných odpovědí
 * @param {number} total - Celkový počet otázek
 * @returns {number} Počet získaných XP
 */
export const calculateXP = (score, total) => {
  const percentage = (score / total) * 100;

  // Získat XP pravidla ze store bez použití hooks
  const { getXPForPercentage } = useQuizXPStore.getState();

  return getXPForPercentage(percentage);
};
