import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useLevelStore = create((set, get) => ({
  levels: [],
  loading: false,
  error: null,

  // Načíst levely z Supabase
  loadLevels: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_level_thresholds')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true });

      if (error) throw error;

      set({ levels: data || [], loading: false });
    } catch (error) {
      console.error('Error loading levels:', error);
      set({ error: error.message, loading: false, levels: [] });
    }
  },

  // Vytvořit nový level
  createLevel: async (levelData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_level_thresholds')
        .insert([levelData])
        .select()
        .single();

      if (error) throw error;

      // Reload levels po vytvoření
      await get().loadLevels();
      set({ loading: false });
      return data;
    } catch (error) {
      console.error('Error creating level:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Aktualizovat level
  updateLevel: async (id, levelData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('piano_level_thresholds')
        .update(levelData)
        .eq('id', id);

      if (error) throw error;

      // Reload levels po update
      await get().loadLevels();
      set({ loading: false });
    } catch (error) {
      console.error('Error updating level:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Smazat level
  deleteLevel: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('piano_level_thresholds')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reload levels po smazání
      await get().loadLevels();
      set({ loading: false });
    } catch (error) {
      console.error('Error deleting level:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Duplikovat level
  duplicateLevel: async (level) => {
    const newLevel = {
      level: level.level + 1, // Increment level number
      label: `${level.label} (kopie)`,
      min_xp: level.max_xp ? level.max_xp + 1 : level.min_xp + 100,
      max_xp: level.max_xp ? level.max_xp + 100 : null,
      icon_type: level.icon_type,
      icon_color: level.icon_color,
      is_active: true,
      display_order: level.display_order + 1
    };

    return await get().createLevel(newLevel);
  },

  // Získat level pro dané XP
  getLevelForXP: (xp) => {
    const levels = get().levels;

    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      if (xp >= level.min_xp && (level.max_xp === null || xp <= level.max_xp)) {
        return level;
      }
    }

    return levels[0] || null;
  }
}));

export default useLevelStore;
