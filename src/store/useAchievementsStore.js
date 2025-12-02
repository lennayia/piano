import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Store pro achievements - načítá se 1x při startu aplikace
 * Optimalizace: místo načítání při každém dokončení
 */
const useAchievementsStore = create((set, get) => ({
  achievements: [],
  loading: false,
  error: null,
  lastFetch: null,

  // Načíst všechny achievements
  loadAchievements: async (force = false) => {
    const state = get();

    // Pokud už jsou načtené a není force, použít cache
    if (!force && state.achievements.length > 0 && state.lastFetch) {
      const timeSinceLastFetch = Date.now() - state.lastFetch;
      // Cache platí 5 minut
      if (timeSinceLastFetch < 5 * 60 * 1000) {
        return state.achievements;
      }
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_achievements')
        .select(`
          *,
          piano_achievement_triggers (
            trigger_type,
            trigger_id
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      set({
        achievements: data || [],
        loading: false,
        lastFetch: Date.now()
      });

      return data || [];
    } catch (error) {
      console.error('Error loading achievements:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Vyčistit cache (volat po změnách v admin)
  clearCache: () => {
    set({ achievements: [], lastFetch: null });
  },

  // Získat všechny achievements (použít cache)
  getAchievements: () => {
    return get().achievements;
  }
}));

export default useAchievementsStore;
