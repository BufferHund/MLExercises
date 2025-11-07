import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  isLoggedIn: boolean;
  isPremium: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isPremium: false,
      email: null,

      login: async (email: string, password: string) => {
        // 简单的演示登录逻辑
        // 在实际应用中，这里应该调用后端API
        if (password.length >= 6) {
          // premium@example.com 是付费用户
          const isPremium = email === 'premium@example.com';
          set({ isLoggedIn: true, isPremium, email });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isLoggedIn: false, isPremium: false, email: null });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
