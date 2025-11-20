import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useSongStore = create((set, get) => ({
  songs: [],
  loading: false,
  error: null,

  // Načíst písničky z databáze
  fetchSongs: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_songs')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Mapovat audio_url → audioUrl pro kompatibilitu s komponentou
      const mappedData = (data || []).map(song => ({
        ...song,
        audioUrl: song.audio_url
      }));

      set({ songs: mappedData, loading: false });
    } catch (error) {
      console.error('Error fetching songs:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Aktualizovat písničku
  updateSong: async (songId, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('piano_songs')
        .update({
          title: updatedData.title,
          notes: updatedData.notes,
          lyrics: updatedData.lyrics,
          difficulty: updatedData.difficulty,
          tempo: updatedData.tempo,
          key: updatedData.key,
          tips: updatedData.tips,
          audio_url: updatedData.audioUrl
        })
        .eq('id', songId)
        .select()
        .single();

      if (error) throw error;

      // Aktualizovat lokální state
      set((state) => ({
        songs: state.songs.map(song =>
          song.id === songId ? { ...song, ...data, audioUrl: data.audio_url } : song
        )
      }));
    } catch (error) {
      console.error('Error updating song:', error);
      throw error;
    }
  },

  // Přidat novou písničku
  addSong: async (newSong) => {
    try {
      // Získat nejvyšší order_index
      const maxOrder = Math.max(...get().songs.map(s => s.order_index || 0), 0);

      const { data, error } = await supabase
        .from('piano_songs')
        .insert({
          title: newSong.title,
          notes: newSong.notes,
          lyrics: newSong.lyrics,
          difficulty: newSong.difficulty,
          tempo: newSong.tempo,
          key: newSong.key,
          tips: newSong.tips,
          audio_url: newSong.audioUrl,
          order_index: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      // Přidat do lokálního state
      set((state) => ({
        songs: [...state.songs, { ...data, audioUrl: data.audio_url }]
      }));
    } catch (error) {
      console.error('Error adding song:', error);
      throw error;
    }
  },

  // Smazat písničku
  deleteSong: async (songId) => {
    try {
      const { error } = await supabase
        .from('piano_songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;

      // Odstranit z lokálního state
      set((state) => ({
        songs: state.songs.filter(song => song.id !== songId)
      }));
    } catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    }
  },

  // Duplikovat písničku
  duplicateSong: async (songId) => {
    try {
      const songToDuplicate = get().songs.find(song => song.id === songId);
      if (!songToDuplicate) return;

      const maxOrder = Math.max(...get().songs.map(s => s.order_index || 0), 0);

      const { data, error } = await supabase
        .from('piano_songs')
        .insert({
          title: `${songToDuplicate.title} (kopie)`,
          notes: songToDuplicate.notes,
          lyrics: songToDuplicate.lyrics,
          difficulty: songToDuplicate.difficulty,
          tempo: songToDuplicate.tempo,
          key: songToDuplicate.key,
          tips: songToDuplicate.tips,
          audio_url: songToDuplicate.audio_url,
          order_index: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        songs: [...state.songs, { ...data, audioUrl: data.audio_url }]
      }));
    } catch (error) {
      console.error('Error duplicating song:', error);
      throw error;
    }
  },

  // Změnit pořadí písniček
  reorderSongs: async (newOrder) => {
    try {
      // Aktualizovat order_index pro všechny písničky
      const updates = newOrder.map((song, index) =>
        supabase
          .from('piano_songs')
          .update({ order_index: index })
          .eq('id', song.id)
      );

      await Promise.all(updates);

      // Aktualizovat lokální state
      set({ songs: newOrder });
    } catch (error) {
      console.error('Error reordering songs:', error);
      throw error;
    }
  }
}));

export default useSongStore;
