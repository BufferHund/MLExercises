import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GeminiConfig {
  apiKey: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

interface UserState {
  isLoggedIn: boolean;
  isPremium: boolean;
  email: string | null;
  geminiConfig: GeminiConfig;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateGeminiConfig: (config: Partial<GeminiConfig>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isPremium: false,
      email: null,
      // Gemini API配置
      geminiConfig: {
        apiKey: '',
        model: 'gemini-2.5-flash',
      },

      login: async (email: string, password: string) => {
        // 简单的演示登录逻辑
        // 在实际应用中，这里应该调用后端API
        if (password.length >= 6) {
          // premium@example.com 是付费用户
          const isPremium = email === 'premium@example.com';

          // 根据用户类型设置默认模型
          const model = isPremium ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

          set((state) => ({
            isLoggedIn: true,
            isPremium,
            email,
            geminiConfig: { ...state.geminiConfig, model: model as 'gemini-2.5-flash' | 'gemini-2.5-pro' },
          }));
          return true;
        }
        return false;
      },

      logout: () => {
        set((state) => ({
          isLoggedIn: false,
          isPremium: false,
          email: null,
          geminiConfig: { ...state.geminiConfig, model: 'gemini-2.5-flash' },
        }));
      },

      updateGeminiConfig: (config: Partial<GeminiConfig>) => {
        set((state) => ({
          geminiConfig: { ...state.geminiConfig, ...config },
        }));
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
