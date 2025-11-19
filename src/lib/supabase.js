import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'piano-auth-token'
  },
  db: {
    schema: 'piano'
  }
});

// Helper functions for common operations

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
}

/**
 * Get user profile from piano_users table
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('piano_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign up a new user
 */
export async function signUp(email, password, firstName, lastName) {
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error('No user returned from sign up');
  }

  // Then create the profile in piano_users
  const { data: profileData, error: profileError } = await supabase
    .from('piano_users')
    .insert([
      {
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        is_admin: false,
      },
    ])
    .select()
    .single();

  if (profileError) {
    console.error('Error creating user profile:', profileError);
    throw profileError;
  }

  // Initialize user stats
  await supabase
    .from('piano_user_stats')
    .insert([
      {
        user_id: authData.user.id,
        total_xp: 0,
        level: 1,
        lessons_completed: 0,
        current_streak: 0,
        best_streak: 0,
        total_practice_time: 0,
      },
    ]);

  return { auth: authData, profile: profileData };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Export the default client
export default supabase;
