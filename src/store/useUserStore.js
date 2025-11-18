import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      addUser: (userData) => {
        const newUser = {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString(),
          progress: []
        };
        set((state) => ({
          users: [...state.users, newUser]
        }));
        return newUser;
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      updateUserProgress: (userId, lessonId) => {
        set((state) => ({
          users: state.users.map(user =>
            user.id === userId
              ? {
                  ...user,
                  progress: [...user.progress, {
                    lessonId,
                    completedAt: new Date().toISOString()
                  }]
                }
              : user
          )
        }));
      },

      getAllUsers: () => get().users,

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== userId)
        }));
      }
    }),
    {
      name: 'piano-users-storage'
    }
  )
);

export default useUserStore;
