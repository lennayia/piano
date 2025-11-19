import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

// Používáme custom schéma 'piano'
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'piano'
  }
});

// Helper functions for common operations

/**
 * Get user profile from piano_users table
 */
export async function getUserProfile(userId) {
  const { data: user, error: userError } = await supabase
    .from('piano_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user profile:', userError);
    return null;
  }

  // Get user stats
  const { data: stats, error: statsError } = await supabase
    .from('piano_user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (statsError) {
    console.error('Error fetching user stats:', statsError);
    return user;
  }

  return { ...user, stats };
}

// Export the default client
export default supabase;
