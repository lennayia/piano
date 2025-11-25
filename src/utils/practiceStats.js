import { supabase } from '../lib/supabase';
import useUserStore from '../store/useUserStore';

/**
 * Univerzální funkce pro ukládání statistik z cvičení
 */

/**
 * Uložit dokončení písničky do databáze
 * @param {Object} params
 * @param {Object} params.currentUser - aktuální uživatel
 * @param {string} params.songId - ID písničky
 * @param {string} params.songTitle - název písničky
 * @param {number} params.mistakes - počet chyb
 * @param {boolean} params.isPerfect - perfektní zahrání
 * @returns {Promise<boolean>}
 */
export async function saveSongCompletion({ currentUser, songId, songTitle, mistakes, isPerfect }) {
  if (!currentUser) return false;

  try {
    // 1. Uložit do historie
    const { error: completionError } = await supabase
      .from('piano_song_completions')
      .insert([{
        user_id: currentUser.id,
        song_id: songId.toString(),
        song_title: songTitle,
        mistakes_count: mistakes,
        is_perfect: isPerfect
      }]);

    if (completionError) {
      console.error('Chyba při ukládání dokončení písně:', completionError);
      return false;
    }

    // 2. Aktualizovat statistiky
    const { data: stats, error: statsError } = await supabase
      .from('piano_user_stats')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (stats && !statsError) {
      const xpAmount = isPerfect ? 100 : 50; // 100 XP za perfektní, 50 za s chybami

      const { error: updateError } = await supabase
        .from('piano_user_stats')
        .update({
          songs_completed: (stats.songs_completed || 0) + 1,
          songs_perfect_score: isPerfect ? (stats.songs_perfect_score || 0) + 1 : stats.songs_perfect_score,
          total_xp: (stats.total_xp || 0) + xpAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);

      if (updateError) {
        console.error('Chyba při aktualizaci statistik:', updateError);
        return false;
      }

      // Aktualizovat lokální store
      const updateUserStats = useUserStore.getState().updateUserStats;
      if (updateUserStats) {
        await updateUserStats();
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Chyba při ukládání písně:', error);
    return false;
  }
}

/**
 * Uložit dokončení akordu do databáze
 * @param {Object} params
 * @param {Object} params.currentUser - aktuální uživatel
 * @param {string} params.chordId - ID akordu
 * @param {string} params.chordName - název akordu
 * @param {number} params.mistakes - počet chyb
 * @param {boolean} params.isPerfect - perfektní zahrání
 * @returns {Promise<boolean>}
 */
export async function saveChordCompletion({ currentUser, chordId, chordName, mistakes, isPerfect }) {
  if (!currentUser) return false;

  try {
    // 1. Uložit do historie (můžeme použít stejnou tabulku nebo vytvořit novou)
    const { error: completionError } = await supabase
      .from('piano_chord_completions')
      .insert([{
        user_id: currentUser.id,
        chord_id: chordId.toString(),
        chord_name: chordName,
        mistakes_count: mistakes,
        is_perfect: isPerfect
      }]);

    if (completionError) {
      console.error('Chyba při ukládání dokončení akordu:', completionError);
      // Pokud tabulka neexistuje, pokračujeme jen s updatem statistik
    }

    // 2. Aktualizovat statistiky
    const { data: stats, error: statsError } = await supabase
      .from('piano_user_stats')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (stats && !statsError) {
      const xpAmount = isPerfect ? 50 : 25; // 50 XP za perfektní akord, 25 za s chybami

      const { error: updateError } = await supabase
        .from('piano_user_stats')
        .update({
          chords_completed: (stats.chords_completed || 0) + 1,
          chords_perfect_score: isPerfect ? (stats.chords_perfect_score || 0) + 1 : stats.chords_perfect_score,
          total_xp: (stats.total_xp || 0) + xpAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);

      if (updateError) {
        console.error('Chyba při aktualizaci statistik:', updateError);
        return false;
      }

      // Aktualizovat lokální store
      const updateUserStats = useUserStore.getState().updateUserStats;
      if (updateUserStats) {
        await updateUserStats();
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Chyba při ukládání akordu:', error);
    return false;
  }
}

/**
 * Univerzální funkce pro uložení dokončení cvičení
 * Automaticky rozpozná typ (píseň nebo akord) podle předaných parametrů
 */
export async function savePracticeCompletion(params) {
  const { type, ...rest } = params;

  if (type === 'song') {
    return await saveSongCompletion(rest);
  } else if (type === 'chord') {
    return await saveChordCompletion(rest);
  }

  console.error('Neznámý typ cvičení:', type);
  return false;
}
