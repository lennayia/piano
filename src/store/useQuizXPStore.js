import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const DEFAULT_QUIZ_BONUSES = {
  perfect: 100,      // 100% správně
  excellent: 75,     // 80%+ správně
  good: 50,          // 70%+ správně
  decent: 25         // 50%+ správně
};

const useQuizXPStore = create((set, get) => ({
  quizBonuses: DEFAULT_QUIZ_BONUSES,
  loading: false,
  error: null,

  // Načíst XP bonusy z Supabase
  loadQuizBonuses: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_rewards_config')
        .select('action_type, xp_value')
        .in('action_type', ['quiz_perfect', 'quiz_excellent', 'quiz_good', 'quiz_decent'])
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const bonuses = {
          perfect: data.find(r => r.action_type === 'quiz_perfect')?.xp_value || DEFAULT_QUIZ_BONUSES.perfect,
          excellent: data.find(r => r.action_type === 'quiz_excellent')?.xp_value || DEFAULT_QUIZ_BONUSES.excellent,
          good: data.find(r => r.action_type === 'quiz_good')?.xp_value || DEFAULT_QUIZ_BONUSES.good,
          decent: data.find(r => r.action_type === 'quiz_decent')?.xp_value || DEFAULT_QUIZ_BONUSES.decent,
        };
        set({ quizBonuses: bonuses, loading: false });
      } else {
        set({ quizBonuses: DEFAULT_QUIZ_BONUSES, loading: false });
      }
    } catch (error) {
      console.error('Error loading quiz XP bonuses:', error);
      set({ error: error.message, loading: false, quizBonuses: DEFAULT_QUIZ_BONUSES });
    }
  },

  // Uložit XP bonusy do Supabase
  saveQuizBonuses: async (bonuses) => {
    set({ loading: true, error: null });
    try {
      // Aktualizovat každý typ bonusu
      const updates = [
        { action_type: 'quiz_perfect', xp_value: bonuses.perfect },
        { action_type: 'quiz_excellent', xp_value: bonuses.excellent },
        { action_type: 'quiz_good', xp_value: bonuses.good },
        { action_type: 'quiz_decent', xp_value: bonuses.decent },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('piano_rewards_config')
          .update({ xp_value: update.xp_value, updated_at: new Date().toISOString() })
          .eq('action_type', update.action_type);

        if (error) throw error;
      }

      set({ quizBonuses: bonuses, loading: false });
    } catch (error) {
      console.error('Error saving quiz XP bonuses:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Aktualizovat konkrétní bonus
  updateBonus: (key, value) => {
    const current = get().quizBonuses;
    const updated = { ...current, [key]: value };
    get().saveQuizBonuses(updated);
  },

  // Získat XP na základě procenta úspěšnosti
  getXPForPercentage: (percentage) => {
    const bonuses = get().quizBonuses;

    if (percentage === 100) return bonuses.perfect;
    if (percentage >= 80) return bonuses.excellent;
    if (percentage >= 70) return bonuses.good;
    if (percentage >= 50) return bonuses.decent;
    return 0;
  },

  // Reset na výchozí hodnoty
  resetToDefaults: () => {
    get().saveQuizBonuses(DEFAULT_QUIZ_BONUSES);
  }
}));

export default useQuizXPStore;
