import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Výchozí XP hodnoty pro různé akce
const DEFAULT_XP_RULES = {
  lesson_completion: 10,
  quiz_correct: 5,
  song_completion: 15,
  daily_login: 2,
  achievement_unlock: 20
};

const useXPRulesStore = create((set, get) => ({
  xpRules: DEFAULT_XP_RULES,
  loading: false,
  error: null,

  // Načíst XP pravidla z Supabase
  loadXPRules: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_rewards_config')
        .select('action_type, xp_value')
        .in('action_type', [
          'lesson_completion',
          'quiz_correct',
          'song_completion',
          'daily_login',
          'achievement_unlock'
        ])
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const rules = {
          lesson_completion: data.find(r => r.action_type === 'lesson_completion')?.xp_value || DEFAULT_XP_RULES.lesson_completion,
          quiz_correct: data.find(r => r.action_type === 'quiz_correct')?.xp_value || DEFAULT_XP_RULES.quiz_correct,
          song_completion: data.find(r => r.action_type === 'song_completion')?.xp_value || DEFAULT_XP_RULES.song_completion,
          daily_login: data.find(r => r.action_type === 'daily_login')?.xp_value || DEFAULT_XP_RULES.daily_login,
          achievement_unlock: data.find(r => r.action_type === 'achievement_unlock')?.xp_value || DEFAULT_XP_RULES.achievement_unlock,
        };
        set({ xpRules: rules, loading: false });
      } else {
        set({ xpRules: DEFAULT_XP_RULES, loading: false });
      }
    } catch (error) {
      console.error('Error loading XP rules:', error);
      set({ error: error.message, loading: false, xpRules: DEFAULT_XP_RULES });
    }
  },

  // Uložit XP pravidla do Supabase
  saveXPRules: async (rules) => {
    set({ loading: true, error: null });
    try {
      // Aktualizovat každý typ pravidla
      const updates = [
        { action_type: 'lesson_completion', xp_value: rules.lesson_completion },
        { action_type: 'quiz_correct', xp_value: rules.quiz_correct },
        { action_type: 'song_completion', xp_value: rules.song_completion },
        { action_type: 'daily_login', xp_value: rules.daily_login },
        { action_type: 'achievement_unlock', xp_value: rules.achievement_unlock },
      ];

      for (const update of updates) {
        // Nejdřív zkusit aktualizovat
        const { data: existing } = await supabase
          .from('piano_rewards_config')
          .select('id')
          .eq('action_type', update.action_type)
          .single();

        if (existing) {
          // Aktualizovat existující
          const { error } = await supabase
            .from('piano_rewards_config')
            .update({ xp_value: update.xp_value, updated_at: new Date().toISOString() })
            .eq('action_type', update.action_type);

          if (error) throw error;
        } else {
          // Vytvořit nový záznam
          const { error } = await supabase
            .from('piano_rewards_config')
            .insert({
              action_type: update.action_type,
              xp_value: update.xp_value,
              is_active: true,
              created_at: new Date().toISOString()
            });

          if (error) throw error;
        }
      }

      set({ xpRules: rules, loading: false });
    } catch (error) {
      console.error('Error saving XP rules:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Aktualizovat konkrétní pravidlo
  updateRule: (key, value) => {
    const current = get().xpRules;
    const updated = { ...current, [key]: value };
    set({ xpRules: updated });
  },

  // Získat XP pro konkrétní akci
  getXPForAction: (actionType) => {
    const rules = get().xpRules;
    return rules[actionType] || 0;
  },

  // Reset na výchozí hodnoty
  resetToDefaults: () => {
    get().saveXPRules(DEFAULT_XP_RULES);
  }
}));

export default useXPRulesStore;
