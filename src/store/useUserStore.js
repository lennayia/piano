import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '../lib/supabase';

const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      loading: false,
      error: null,

      // Initialize - just set loading to false
      initAuth: async () => {
        set({ loading: false });
      },

      // Login or create user (no password needed)
      loginUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          // Check if user exists by email
          const { data: existingUser, error: findError } = await supabase
            .from('piano_users')
            .select('*')
            .eq('email', userData.email.toLowerCase())
            .single();

          if (existingUser) {
            // User exists - update name if changed and increment login count
            const { data: updatedUser, error: updateError } = await supabase
              .from('piano_users')
              .update({
                first_name: userData.firstName,
                last_name: userData.lastName,
                login_count: (existingUser.login_count || 0) + 1,
                last_login: new Date().toISOString()
              })
              .eq('id', existingUser.id)
              .select()
              .single();

            if (updateError) throw updateError;

            // Get user stats
            const { data: stats } = await supabase
              .from('piano_user_stats')
              .select('*')
              .eq('user_id', existingUser.id)
              .single();

            // Get user achievements with full achievement data
            const { data: userAchievements } = await supabase
              .from('piano_user_achievements')
              .select(`
                achievement_id,
                earned_at,
                piano_achievements (
                  id,
                  title,
                  description,
                  icon,
                  xp_reward
                )
              `)
              .eq('user_id', existingUser.id);

            const achievements = userAchievements?.map(a => ({
              id: a.achievement_id,
              earnedAt: a.earned_at,
              ...a.piano_achievements
            })) || [];

            const userWithStats = { ...updatedUser, stats, achievements };
            set({ currentUser: userWithStats, loading: false });
            return userWithStats;
          } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
              .from('piano_users')
              .insert({
                email: userData.email.toLowerCase(),
                first_name: userData.firstName,
                last_name: userData.lastName,
                is_admin: userData.email.toLowerCase() === 'lenkaroubalka@seznam.cz'
              })
              .select()
              .single();

            if (createError) throw createError;

            // Create user stats
            await supabase
              .from('piano_user_stats')
              .insert({
                user_id: newUser.id,
                total_xp: 0,
                level: 1,
                lessons_completed: 0,
                current_streak: 0,
                best_streak: 0,
                total_practice_time: 0
              });

            const { data: stats } = await supabase
              .from('piano_user_stats')
              .select('*')
              .eq('user_id', newUser.id)
              .single();

            // Get user achievements with full achievement data (empty for new user)
            const { data: userAchievements } = await supabase
              .from('piano_user_achievements')
              .select(`
                achievement_id,
                earned_at,
                piano_achievements (
                  id,
                  title,
                  description,
                  icon,
                  xp_reward
                )
              `)
              .eq('user_id', newUser.id);

            const achievements = userAchievements?.map(a => ({
              id: a.achievement_id,
              earnedAt: a.earned_at,
              ...a.piano_achievements
            })) || [];

            const userWithStats = { ...newUser, stats, achievements };
            set({ currentUser: userWithStats, loading: false });
            return userWithStats;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      // Admin login with password (Supabase Auth)
      adminLogin: async (credentials) => {
        set({ loading: true, error: null });
        try {
          console.log('🔑 Step 1: Authenticating with Supabase...');
          // Sign in with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email.toLowerCase(),
            password: credentials.password
          });

          if (authError) {
            console.error('❌ Auth error:', authError);
            throw authError;
          }
          console.log('✅ Auth successful:', authData.user?.email);

          console.log('🔍 Step 2: Fetching user profile...');
          // Get user profile from piano_users table
          const { data: userProfile, error: profileError } = await supabase
            .from('piano_users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .single();

          if (profileError) {
            console.error('❌ Profile error:', profileError);
            throw new Error('Uživatelský profil nebyl nalezen');
          }
          console.log('✅ Profile found:', userProfile);

          // Check if user is admin
          if (!userProfile.is_admin) {
            console.error('❌ User is not admin');
            await supabase.auth.signOut();
            throw new Error('Tento účet nemá administrátorská oprávnění');
          }
          console.log('✅ User is admin');

          console.log('📊 Step 3: Updating login stats...');
          // Update login count and last login time
          const { data: updatedProfile, error: updateError } = await supabase
            .from('piano_users')
            .update({
              login_count: (userProfile.login_count || 0) + 1,
              last_login: new Date().toISOString()
            })
            .eq('id', userProfile.id)
            .select()
            .single();

          if (updateError) {
            console.warn('⚠️ Login stats update error (non-critical):', updateError);
          }

          console.log('📊 Step 4: Fetching user stats...');
          // Get user stats
          const { data: stats, error: statsError } = await supabase
            .from('piano_user_stats')
            .select('*')
            .eq('user_id', userProfile.id)
            .single();

          if (statsError) {
            console.warn('⚠️ Stats error (non-critical):', statsError);
          }
          console.log('✅ Stats fetched:', stats);

          console.log('🏆 Step 5: Fetching user achievements...');
          // Get user achievements with full achievement data
          const { data: userAchievements, error: achievementsError } = await supabase
            .from('piano_user_achievements')
            .select(`
              achievement_id,
              earned_at,
              piano_achievements (
                id,
                title,
                description,
                icon,
                xp_reward
              )
            `)
            .eq('user_id', userProfile.id);

          if (achievementsError) {
            console.warn('⚠️ Achievements error (non-critical):', achievementsError);
          }

          const achievements = userAchievements?.map(a => ({
            id: a.achievement_id,
            earnedAt: a.earned_at,
            ...a.piano_achievements
          })) || [];
          console.log('✅ Achievements fetched:', achievements);

          const userWithStats = { ...(updatedProfile || userProfile), stats, achievements };
          set({ currentUser: userWithStats, loading: false });
          console.log('✅ Admin login complete, user set in store');
          return userWithStats;
        } catch (error) {
          console.error('❌ Admin login error:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

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

      // XP reward - defaultní hodnota, protože lekce jsou v localStorage
      const xpReward = 50;
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
        // Fetch updated user data with stats
        const { data: updatedUser } = await supabase
          .from('piano_users')
          .select('*')
          .eq('id', userId)
          .single();

        const { data: stats } = await supabase
          .from('piano_user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Get updated achievements with full achievement data
        const { data: userAchievements } = await supabase
          .from('piano_user_achievements')
          .select(`
            achievement_id,
            earned_at,
            piano_achievements (
              id,
              title,
              description,
              icon,
              xp_reward
            )
          `)
          .eq('user_id', userId);

        const achievements = userAchievements?.map(a => ({
          id: a.achievement_id,
          earnedAt: a.earned_at,
          ...a.piano_achievements
        })) || [];

        const userWithStats = { ...updatedUser, stats, achievements };
        set({ currentUser: userWithStats });
      }

    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

      // Get all users (admin only) with stats and achievements
  getAllUsers: async () => {
    try {
      const { data: users, error } = await supabase
        .from('piano_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch stats and achievements for each user
      const usersWithDetails = await Promise.all(
        (users || []).map(async (user) => {
          // Get user stats
          const { data: stats } = await supabase
            .from('piano_user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

          // Get user achievements with full achievement data
          const { data: userAchievements } = await supabase
            .from('piano_user_achievements')
            .select(`
              achievement_id,
              earned_at,
              piano_achievements (
                id,
                title,
                description,
                icon,
                xp_reward
              )
            `)
            .eq('user_id', user.id);

          const achievements = userAchievements?.map(a => ({
            id: a.achievement_id,
            earnedAt: a.earned_at,
            ...a.piano_achievements
          })) || [];

          return {
            ...user,
            stats,
            achievements
          };
        })
      );

      set({ users: usersWithDetails });
      return usersWithDetails;
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
  logout: () => {
    set({ currentUser: null });
  }
    }),
    {
      name: 'piano-users-storage'
    }
  )
);

export default useUserStore;
