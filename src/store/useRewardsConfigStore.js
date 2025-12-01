import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Univerzální store pro správu piano_rewards_config (XP pravidla, bonusy, atd.)
 * Poskytuje plný CRUD pro admin panel
 */
const useRewardsConfigStore = create((set, get) => ({
  rewards: [], // Pole všech rewards z DB
  loading: false,
  error: null,

  // Načíst všechny rewards (volitelně filtrované podle category)
  loadRewards: async (category = null) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('piano_rewards_config')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ rewards: data || [], loading: false });
    } catch (error) {
      console.error('Error loading rewards:', error);
      set({ error: error.message, loading: false, rewards: [] });
    }
  },

  // Načíst rewards podle category
  loadRewardsByCategory: async (category) => {
    return await get().loadRewards(category);
  },

  // Vytvořit nový reward
  createReward: async (rewardData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_rewards_config')
        .insert([{
          ...rewardData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Reload rewards po vytvoření
      await get().loadRewards();
      set({ loading: false });
      return data;
    } catch (error) {
      console.error('Error creating reward:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Aktualizovat reward
  updateReward: async (id, rewardData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('piano_rewards_config')
        .update({
          ...rewardData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Reload rewards po update
      await get().loadRewards();
      set({ loading: false });
    } catch (error) {
      console.error('Error updating reward:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Smazat reward (nebo deaktivovat)
  deleteReward: async (id, hardDelete = false) => {
    set({ loading: true, error: null });
    try {
      if (hardDelete) {
        const { error } = await supabase
          .from('piano_rewards_config')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } else {
        // Soft delete - jen deaktivovat
        const { error } = await supabase
          .from('piano_rewards_config')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
      }

      // Reload rewards po smazání
      await get().loadRewards();
      set({ loading: false });
    } catch (error) {
      console.error('Error deleting reward:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Duplikovat reward
  duplicateReward: async (reward) => {
    const newReward = {
      action_type: `${reward.action_type}_copy`,
      category: reward.category,
      label: `${reward.label} (kopie)`,
      description: reward.description,
      xp_value: reward.xp_value,
      icon_type: reward.icon_type,
      icon_color: reward.icon_color,
      display_order: reward.display_order + 1,
      is_active: true
    };

    return await get().createReward(newReward);
  },

  // Získat reward podle action_type
  getRewardByActionType: (actionType) => {
    const rewards = get().rewards;
    return rewards.find(r => r.action_type === actionType);
  },

  // Získat XP hodnotu pro action_type
  getXPForAction: (actionType) => {
    const reward = get().getRewardByActionType(actionType);
    return reward?.xp_value || 0;
  },

  // Získat všechny rewards v dané kategorii
  getRewardsByCategory: (category) => {
    const rewards = get().rewards;
    return rewards.filter(r => r.category === category);
  }
}));

export default useRewardsConfigStore;
