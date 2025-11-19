import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Migrace starých uživatelů - přidání isAdmin pole
const migrateUsers = (users) => {
  if (!users || users.length === 0) return users;

  let needsMigration = false;
  const migratedUsers = users.map((user) => {
    if (user.isAdmin === undefined) {
      needsMigration = true;
      // Nastavit isAdmin podle emailu - Lenka Roubalová je admin
      const isAdmin = user.email?.toLowerCase() === 'lenkaroubalka@seznam.cz';
      return {
        ...user,
        isAdmin
      };
    }
    return user;
  });

  if (needsMigration) {
    const adminUser = migratedUsers.find(u => u.isAdmin);
    if (adminUser) {
      console.log(`Migrace dokončena - ${adminUser.firstName} ${adminUser.lastName} je nyní admin`);
    }
  }

  return migratedUsers;
};

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
          progress: [],
          achievements: [],
          points: 0,
          streak: 0,
          lastLessonDate: null,
          isAdmin: false // Výchozí nastavení - běžný uživatel
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

              const now = new Date();
              const today = now.toISOString().split('T')[0];
              const lastDate = user.lastLessonDate ? user.lastLessonDate.split('T')[0] : null;

              // Spočítat streak (série dnů po sobě)
              let newStreak = user.streak || 0;
              if (lastDate) {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === yesterdayStr) {
                  newStreak += 1; // Pokračování série
                } else if (lastDate !== today) {
                  newStreak = 1; // Nová série
                }
              } else {
                newStreak = 1; // První lekce
              }

              // Přidat body za dokončení lekce
              const points = (user.points || 0) + 100;

              // Kontrola nových achievementů
              const achievements = [...(user.achievements || [])];
              const newAchievements = [];

              // Achievement: První lekce
              if (user.progress.length === 0 && !achievements.includes('first-lesson')) {
                achievements.push('first-lesson');
                newAchievements.push('first-lesson');
              }

              // Achievement: 5 lekcí
              if (user.progress.length + 1 === 5 && !achievements.includes('five-lessons')) {
                achievements.push('five-lessons');
                newAchievements.push('five-lessons');
              }

              // Achievement: Série 3 dny
              if (newStreak === 3 && !achievements.includes('streak-3')) {
                achievements.push('streak-3');
                newAchievements.push('streak-3');
              }

              // Achievement: Série 7 dní
              if (newStreak === 7 && !achievements.includes('streak-7')) {
                achievements.push('streak-7');
                newAchievements.push('streak-7');
              }

              return {
                ...user,
                progress: [...user.progress, {
                  lessonId,
                  completedAt: new Date().toISOString()
                }],
                points,
                streak: newStreak,
                lastLessonDate: now.toISOString(),
                achievements,
                newAchievements // Dočasně pro zobrazení
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
      },

      toggleAdminRole: (userId) => {
        set((state) => {
          const updatedUsers = state.users.map(user => {
            if (user.id === userId) {
              return { ...user, isAdmin: !user.isAdmin };
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
      }
    }),
    {
      name: 'piano-users-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Spustit migraci při načtení z localStorage
          const migratedUsers = migrateUsers(state.users);
          if (migratedUsers !== state.users) {
            state.users = migratedUsers;

            // Aktualizovat currentUser pokud byl migrován
            if (state.currentUser) {
              const updatedCurrentUser = migratedUsers.find(u => u.id === state.currentUser.id);
              if (updatedCurrentUser) {
                state.currentUser = updatedCurrentUser;
              }
            }
          }
        }
      }
    }
  )
);

export default useUserStore;
