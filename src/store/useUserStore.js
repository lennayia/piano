import { create } from 'zustand';
import { supabase, signIn, signUp, signOut, getUserProfile } from '../lib/supabase';

const useUserStore = create((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,

  // Initialize authentication state from Supabase
  initAuth: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          set({ currentUser: profile, loading: false });
        } else {
          set({ currentUser: null, loading: false });
        }
      } else {
        set({ currentUser: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ error: error.message, loading: false, currentUser: null });
    }
  },

      // Register new user with Supabase
  registerUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const result = await signUp(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName
      );

      // Check if email is admin email
      if (userData.email?.toLowerCase() === 'lenkaroubalka@seznam.cz') {
        await supabase
          .from('piano_users')
          .update({ is_admin: true })
          .eq('id', result.auth.user.id);

        result.profile.is_admin = true;
      }

      set({ currentUser: result.profile, loading: false });
      return result.profile;
    } catch (error) {
      console.error('Registration error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Login user with Supabase
  loginUser: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await signIn(email, password);
      const profile = await getUserProfile(user.id);

      set({ currentUser: profile, loading: false });
      return profile;
    } catch (error) {
      console.error('Login error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  // Set admin rights for an email
  setAdminByEmail: async (email) => {
    try {
      const { data, error } = await supabase
        .from('piano_users')
        .update({ is_admin: true })
        .eq('email', email.toLowerCase())
        .select()
        .single();

      if (error) throw error;

      // Update current user if it's the same email
      const state = get();
      if (state.currentUser?.email?.toLowerCase() === email.toLowerCase()) {
        set({ currentUser: { ...state.currentUser, is_admin: true } });
      }

      console.log(`✅ ${email} je nyní admin!`);
      return data;
    } catch (error) {
      console.error('Error setting admin:', error);
      throw error;
    }
  },

  // Update user progress after completing a lesson
  updateUserProgress: async (userId, lessonId) => {
    try {
      // Check if lesson is already completed
      const { data: existingProgress } = await supabase
        .from('piano_user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (existingProgress?.completed) {
        console.log('Lesson already completed');
        return; // Already completed
      }

      // Get current user stats
      const { data: stats } = await supabase
        .from('piano_user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastDate = stats?.last_activity_date || null;

      // Calculate streak
      let newStreak = stats?.current_streak || 0;
      let bestStreak = stats?.best_streak || 0;

      if (lastDate) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
          newStreak += 1; // Continue streak
        } else if (lastDate !== today) {
          newStreak = 1; // New streak
        }
      } else {
        newStreak = 1; // First lesson
      }

      if (newStreak > bestStreak) {
        bestStreak = newStreak;
      }

      // Get lesson XP reward
      const { data: lesson } = await supabase
        .from('piano_lessons')
        .select('xp_reward')
        .eq('id', lessonId)
        .single();

      const xpReward = lesson?.xp_reward || 50;
      const newTotalXp = (stats?.total_xp || 0) + xpReward;
      const newLevel = Math.floor(newTotalXp / 100) + 1;
      const newLessonsCompleted = (stats?.lessons_completed || 0) + 1;

      // Update or insert progress
      if (existingProgress) {
        await supabase
          .from('piano_user_progress')
          .update({
            completed: true,
            completed_at: now.toISOString(),
            score: 100
          })
          .eq('user_id', userId)
          .eq('lesson_id', lessonId);
      } else {
        await supabase
          .from('piano_user_progress')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
            completed_at: now.toISOString(),
            score: 100
          });
      }

      // Update user stats
      await supabase
        .from('piano_user_stats')
        .update({
          total_xp: newTotalXp,
          level: newLevel,
          lessons_completed: newLessonsCompleted,
          current_streak: newStreak,
          best_streak: bestStreak,
          last_activity_date: today
        })
        .eq('user_id', userId);

      // Check and award achievements
      const { data: allAchievements } = await supabase
        .from('piano_achievements')
        .select('*')
        .eq('is_active', true);

      const { data: earnedAchievements } = await supabase
        .from('piano_user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || []);

      for (const achievement of allAchievements || []) {
        if (earnedIds.has(achievement.id)) continue;

        let shouldAward = false;

        switch (achievement.requirement_type) {
          case 'lessons_completed':
            shouldAward = newLessonsCompleted >= achievement.requirement_value;
            break;
          case 'streak':
            shouldAward = newStreak >= achievement.requirement_value;
            break;
          case 'xp':
            shouldAward = newTotalXp >= achievement.requirement_value;
            break;
        }

        if (shouldAward) {
          await supabase
            .from('piano_user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id
            });

          // Add achievement XP to user stats
          if (achievement.xp_reward > 0) {
            await supabase
              .from('piano_user_stats')
              .update({
                total_xp: newTotalXp + achievement.xp_reward
              })
              .eq('user_id', userId);
          }
        }
      }

      // Refresh current user data
      const state = get();
      if (state.currentUser?.id === userId) {
        const profile = await getUserProfile(userId);
        set({ currentUser: profile });
      }

    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

      // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('piano_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ users: data || [] });
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const { error } = await supabase
        .from('piano_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        users: state.users.filter(user => user.id !== userId)
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Toggle admin role (admin only)
  toggleAdminRole: async (userId) => {
    try {
      // Get current user
      const { data: user, error: fetchError } = await supabase
        .from('piano_users')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle the role
      const { data: updatedUser, error: updateError } = await supabase
        .from('piano_users')
        .update({ is_admin: !user.is_admin })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      set((state) => {
        const updatedUsers = state.users.map(u =>
          u.id === userId ? updatedUser : u
        );

        const updatedCurrentUser = state.currentUser?.id === userId
          ? updatedUser
          : state.currentUser;

        return {
          users: updatedUsers,
          currentUser: updatedCurrentUser
        };
      });

      return updatedUser;
    } catch (error) {
      console.error('Error toggling admin role:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut();
      set({ currentUser: null, users: [], error: null });
    } catch (error) {
      console.error('Error logging out:', error);
      set({ currentUser: null, users: [], error: null }); // Clear anyway
    }
  }
}));

// Subscribe to auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const profile = await getUserProfile(session.user.id);
    useUserStore.setState({ currentUser: profile });
  } else if (event === 'SIGNED_OUT') {
    useUserStore.setState({ currentUser: null, users: [] });
  }
});

export default useUserStore;
