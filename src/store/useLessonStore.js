import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useLessonStore = create((set, get) => ({
  lessons: [],
  loading: false,
  error: null,
  currentLesson: null,

  // Načíst lekce z databáze
  fetchLessons: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('piano_lessons')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      set({ lessons: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      set({ error: error.message, loading: false });
    }
  },

  setCurrentLesson: (lessonId) => {
    set((state) => ({
      currentLesson: state.lessons.find(l => l.id === lessonId)
    }));
  },

  getLessonById: (lessonId) => {
    const state = get();
    return state.lessons.find(l => l.id === lessonId);
  },

  // Přidat novou lekci
  addLesson: async (newLesson) => {
    try {
      const maxOrder = Math.max(...get().lessons.map(l => l.order_index || 0), 0);

      const { data, error } = await supabase
        .from('piano_lessons')
        .insert({
          title: newLesson.title,
          description: newLesson.description,
          difficulty: newLesson.difficulty,
          content: newLesson.content,
          xp_reward: newLesson.xp_reward || 50,
          is_published: true,
          order_index: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        lessons: [...state.lessons, data]
      }));
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  },

  // Aktualizovat lekci
  updateLesson: async (lessonId, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('piano_lessons')
        .update({
          title: updatedData.title,
          description: updatedData.description,
          difficulty: updatedData.difficulty,
          content: updatedData.content,
          xp_reward: updatedData.xp_reward
        })
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        lessons: state.lessons.map(lesson =>
          lesson.id === lessonId ? data : lesson
        )
      }));
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  // Smazat lekci
  deleteLesson: async (lessonId) => {
    try {
      const { error } = await supabase
        .from('piano_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      set((state) => ({
        lessons: state.lessons.filter(lesson => lesson.id !== lessonId)
      }));
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },

  // Duplikovat lekci
  duplicateLesson: async (lessonId) => {
    try {
      const lessonToDuplicate = get().lessons.find(lesson => lesson.id === lessonId);
      if (!lessonToDuplicate) return;

      const maxOrder = Math.max(...get().lessons.map(l => l.order_index || 0), 0);

      const { data, error } = await supabase
        .from('piano_lessons')
        .insert({
          title: `${lessonToDuplicate.title} (kopie)`,
          description: lessonToDuplicate.description,
          difficulty: lessonToDuplicate.difficulty,
          content: lessonToDuplicate.content,
          xp_reward: lessonToDuplicate.xp_reward,
          is_published: true,
          order_index: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        lessons: [...state.lessons, data]
      }));
    } catch (error) {
      console.error('Error duplicating lesson:', error);
      throw error;
    }
  },

  // Změnit pořadí lekcí
  reorderLessons: async (newOrder) => {
    try {
      const updates = newOrder.map((lesson, index) =>
        supabase
          .from('piano_lessons')
          .update({ order_index: index })
          .eq('id', lesson.id)
      );

      await Promise.all(updates);

      set({ lessons: newOrder });
    } catch (error) {
      console.error('Error reordering lessons:', error);
      throw error;
    }
  }
}));

export default useLessonStore;
