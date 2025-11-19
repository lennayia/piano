import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultLessons = [
    {
      id: 1,
      title: 'První tóny',
      description: 'Naučte se základní pozici rukou a zahrajte první tóny C, D, E',
      difficulty: 'začátečník',
      duration: '5 min',
      content: {
        notes: ['C', 'D', 'E'],
        instructions: [
          'Posaďte se pohodlně před klavír',
          'Položte pravou ruku na klávesy - palec na C',
          'Postupně zahrajte C, D, E'
        ]
      }
    },
    {
      id: 2,
      title: 'Celá stupnice C dur',
      description: 'Zvládněte celou stupnici C dur oběma rukama',
      difficulty: 'začátečník',
      duration: '10 min',
      content: {
        notes: ['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C'],
        instructions: [
          'Začněte na C',
          'Postupujte po bílých klávesách vzhůru',
          'Použijte správné prstoklady: 1-2-3-1-2-3-4-5'
        ]
      }
    },
    {
      id: 3,
      title: 'Twinkle Twinkle Little Star',
      description: 'Zahrajte svou první písničku!',
      difficulty: 'začátečník',
      duration: '15 min',
      content: {
        notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G'],
        instructions: [
          'Použijte pouze pravou ruku',
          'Hraje se pomalu, s důrazem na rytmus',
          'Opakujte, dokud nezazní plynule'
        ]
      }
    },
    {
      id: 4,
      title: 'Akordy - C dur',
      description: 'Naučte se zahrát svůj první akord',
      difficulty: 'mírně pokročilý',
      duration: '10 min',
      content: {
        notes: ['C', 'E', 'G'],
        instructions: [
          'Položte palec na C, prostředníček na E, malíček na G',
          'Stiskněte všechny tři klávesy současně',
          'Poslouchejte, jak znějí dohromady'
        ]
      }
    }
  ];

const useLessonStore = create(
  persist(
    (set, get) => ({
      lessons: defaultLessons,
      currentLesson: null,

      setCurrentLesson: (lessonId) => {
        set((state) => ({
          currentLesson: state.lessons.find(l => l.id === lessonId)
        }));
      },

      getLessonById: (lessonId) => {
        const state = get();
        return state.lessons.find(l => l.id === lessonId);
      },

      addLesson: (newLesson) => {
        set((state) => ({
          lessons: [...state.lessons, { ...newLesson, id: Date.now() }]
        }));
      },

      updateLesson: (lessonId, updatedData) => {
        set((state) => ({
          lessons: state.lessons.map(lesson =>
            lesson.id === lessonId ? { ...lesson, ...updatedData } : lesson
          )
        }));
      },

      deleteLesson: (lessonId) => {
        set((state) => ({
          lessons: state.lessons.filter(lesson => lesson.id !== lessonId)
        }));
      },

      resetLessons: () => {
        set({ lessons: defaultLessons });
      }
    }),
    {
      name: 'lesson-storage'
    }
  )
);

export default useLessonStore;
