import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface APIConfig {
  apiEndpoint: string;
  apiKey: string;
}

interface UserState {
  isLoggedIn: boolean;
  isPremium: boolean;
  email: string | null;
  apiConfig: APIConfig;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateApiConfig: (config: Partial<APIConfig>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isPremium: false,
      email: null,
      // Mock API配置 - 实际使用时从后端获取
      apiConfig: {
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'sk-mock-key-xxxxxxxxxxxxxxxx',
      },

      login: async (email: string, password: string) => {
        // 简单的演示登录逻辑
        // 在实际应用中，这里应该调用后端API
        if (password.length >= 6) {
          // premium@example.com 是付费用户
          const isPremium = email === 'premium@example.com';

          // Mock: 不同用户有不同的API配置
          const apiConfig = isPremium
            ? {
                apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                apiKey: 'sk-premium-key-xxxxxxxxxxxxxxxx',
              }
            : {
                apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                apiKey: 'sk-free-key-xxxxxxxxxxxxxxxx',
              };

          set({ isLoggedIn: true, isPremium, email, apiConfig });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isLoggedIn: false,
          isPremium: false,
          email: null,
          apiConfig: {
            apiEndpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: 'sk-mock-key-xxxxxxxxxxxxxxxx',
          }
        });
      },

      updateApiConfig: (config: Partial<APIConfig>) => {
        set((state) => ({
          apiConfig: { ...state.apiConfig, ...config },
        }));
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
