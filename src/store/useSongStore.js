import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const defaultSongs = [
  {
    id: 1,
    title: 'Skákal pes přes oves',
    difficulty: 'začátečník',
    notes: ['G', 'G', 'A', 'H', 'H', 'A', 'G'],
    tempo: 'Allegro',
    key: 'C dur',
    tips: 'Doprovod: C dur - F dur - G dur - C dur'
  },
  {
    id: 2,
    title: 'Holka modrooká',
    difficulty: 'začátečník',
    notes: ['G', 'A', 'H', 'C', 'D', 'C', 'H'],
    tempo: 'Moderato',
    key: 'C dur',
    tips: 'Doprovod: C dur - G dur - C dur'
  },
  {
    id: 3,
    title: 'Když jsem já šel okolo vrat',
    difficulty: 'mírně pokročilý',
    notes: ['G', 'A', 'H', 'H', 'C', 'H', 'A', 'G', 'A', 'H', 'C', 'D'],
    tempo: 'Andante',
    key: 'G dur',
    tips: 'Doprovod: G dur - D dur - Em - C dur - G dur'
  },
  {
    id: 4,
    title: 'Ach synku, synku',
    difficulty: 'začátečník',
    notes: ['C', 'C', 'C', 'C', 'D', 'E', 'F', 'E', 'E', 'E', 'E', 'F', 'G'],
    tempo: 'Moderato',
    key: 'C dur',
    tips: 'Doprovod: C dur - F dur - G dur - C dur'
  },
  {
    id: 5,
    title: 'Slyšel jsem zvon',
    difficulty: 'mírně pokročilý',
    notes: ['D', 'F#', 'A', 'A', 'G', 'F#', 'E', 'D'],
    tempo: 'Andante',
    key: 'D dur',
    tips: 'Doprovod: D dur - A dur - Hm - G dur - D dur'
  },
  {
    id: 6,
    title: 'Twinkle Twinkle Little Star',
    difficulty: 'začátečník',
    notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C'],
    tempo: 'Andante',
    key: 'C dur',
    tips: 'Doprovod: C dur - F dur - C dur - G dur - C dur'
  }
];

const useSongStore = create(
  persist(
    (set) => ({
      songs: defaultSongs,

      updateSong: (songId, updatedData) => {
        set((state) => ({
          songs: state.songs.map(song =>
            song.id === songId ? { ...song, ...updatedData } : song
          )
        }));
      },

      addSong: (newSong) => {
        set((state) => ({
          songs: [...state.songs, { ...newSong, id: Date.now() }]
        }));
      },

      deleteSong: (songId) => {
        set((state) => ({
          songs: state.songs.filter(song => song.id !== songId)
        }));
      },

      duplicateSong: (songId) => {
        set((state) => {
          const songToDuplicate = state.songs.find(song => song.id === songId);
          if (!songToDuplicate) return state;

          const duplicatedSong = {
            ...songToDuplicate,
            id: Date.now(),
            title: `${songToDuplicate.title} (kopie)`
          };

          return {
            songs: [...state.songs, duplicatedSong]
          };
        });
      },

      reorderSongs: (newOrder) => {
        set({ songs: newOrder });
      },

      resetSongs: () => {
        set({ songs: defaultSongs });
      }
    }),
    {
      name: 'song-storage'
    }
  )
);

export default useSongStore;
