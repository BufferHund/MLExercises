import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { superAuthService } from '../services/superAuthService';

interface GeminiConfig {
  apiKey: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

interface UserState {
  isLoggedIn: boolean;
  isPremium: boolean;
  email: string | null;
  username: string | null;
  userId: string | null;
  isVirtual: boolean;
  geminiConfig: GeminiConfig;
  authMode: 'direct' | 'portal'; // 认证模式
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateGeminiConfig: (config: Partial<GeminiConfig>) => void;
  setAuthMode: (mode: 'direct' | 'portal') => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isPremium: false,
      email: null,
      username: null,
      userId: null,
      isVirtual: true,
      authMode: 'direct', // 默认使用直接登录
      // Gemini API配置
      geminiConfig: {
        apiKey: '',
        model: 'gemini-2.5-flash',
      },

      // 使用SuperAuth注册
      register: async (username: string, email: string, password: string) => {
        try {
          const result = await superAuthService.register({ username, email, password });

          if (result.success && result.user) {
            const isPremium = result.user.role === 'premium' || result.user.role === 'admin';
            set((state) => ({
              isLoggedIn: true,
              isPremium,
              email: result.user?.email || email,
              username: result.user?.username || username,
              userId: result.user?.userId || null,
              isVirtual: false,
              geminiConfig: {
                ...state.geminiConfig,
                model: isPremium ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
              },
            }));
            return { success: true, message: '注册成功' };
          }

          return { success: false, message: result.error || '注册失败' };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : '注册失败',
          };
        }
      },

      // 使用SuperAuth登录
      login: async (username: string, password: string) => {
        try {
          const result = await superAuthService.login({ username, password });

          if (result.success && result.user) {
            const isPremium = result.user.role === 'premium' || result.user.role === 'admin';
            set((state) => ({
              isLoggedIn: true,
              isPremium,
              email: result.user?.email || null,
              username: result.user?.username || username,
              userId: result.user?.userId || null,
              isVirtual: false,
              geminiConfig: {
                ...state.geminiConfig,
                model: isPremium ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
              },
            }));
            return { success: true, message: '登录成功' };
          }

          return { success: false, message: result.error || '登录失败' };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : '登录失败',
          };
        }
      },

      // 登出
      logout: async () => {
        try {
          await superAuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }

        set((state) => ({
          isLoggedIn: false,
          isPremium: false,
          email: null,
          username: null,
          userId: null,
          isVirtual: true,
          geminiConfig: { ...state.geminiConfig, model: 'gemini-2.5-flash' },
        }));
      },

      // 检查认证状态
      checkAuth: async () => {
        try {
          const { isAuthenticated, user } = await superAuthService.checkAuth();

          if (isAuthenticated && user && !user.isVirtual) {
            const isPremium = user.role === 'premium' || user.role === 'admin';
            set((state) => ({
              isLoggedIn: true,
              isPremium,
              email: user.email || null,
              username: user.username,
              userId: user.userId,
              isVirtual: false,
              geminiConfig: {
                ...state.geminiConfig,
                model: isPremium ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
              },
            }));
          } else if (user) {
            // 虚拟用户
            set({
              isLoggedIn: false,
              isPremium: false,
              email: null,
              username: user.username,
              userId: user.userId,
              isVirtual: true,
            });
          }
        } catch (error) {
          console.error('Check auth error:', error);
        }
      },

      updateGeminiConfig: (config: Partial<GeminiConfig>) => {
        set((state) => ({
          geminiConfig: { ...state.geminiConfig, ...config },
        }));
      },

      setAuthMode: (mode: 'direct' | 'portal') => {
        set({ authMode: mode });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
