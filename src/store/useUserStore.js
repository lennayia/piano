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
        set((state) => {
          const updatedUsers = state.users.map(user => {
            if (user.id === userId) {
              // Zkontrolovat, jestli už lekce není dokončená
              const alreadyCompleted = user.progress.some(p => p.lessonId === lessonId);
              if (alreadyCompleted) {
                return user; // Nedělat nic, už je dokončená
              }

              return {
                ...user,
                progress: [...user.progress, {
                  lessonId,
                  completedAt: new Date().toISOString()
                }]
              };
            }
            return user;
          });

          // Aktualizovat i currentUser pokud je to ten stejný uživatel
          const updatedCurrentUser = state.currentUser?.id === userId
            ? updatedUsers.find(u => u.id === userId)
            : state.currentUser;

          return {
            users: updatedUsers,
            currentUser: updatedCurrentUser
          };
        });
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
