import { SUPERAUTH_CONFIG } from '../config/superauth';

interface User {
  userId: string;
  username: string;
  email?: string;
  isVirtual: boolean;
  isAuthenticated: boolean;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  error?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

class SuperAuthService {
  private gatewayUrl: string;

  constructor() {
    this.gatewayUrl = SUPERAUTH_CONFIG.GATEWAY_URL;
  }

  /**
   * 用户注册
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${this.gatewayUrl}${SUPERAUTH_CONFIG.API_PATHS.REGISTER}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include', // 重要：包含Cookie
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || '注册失败',
        };
      }

      return result;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误，请稍后再试',
      };
    }
  }

  /**
   * 用户登录
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${this.gatewayUrl}${SUPERAUTH_CONFIG.API_PATHS.LOGIN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || '登录失败',
        };
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误，请稍后再试',
      };
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${this.gatewayUrl}${SUPERAUTH_CONFIG.API_PATHS.LOGOUT}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '登出失败',
      };
    }
  }

  /**
   * 验证Token
   */
  async verify(): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${this.gatewayUrl}${SUPERAUTH_CONFIG.API_PATHS.VERIFY}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Verify error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '验证失败',
      };
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${this.gatewayUrl}${SUPERAUTH_CONFIG.API_PATHS.ME}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取用户信息失败',
      };
    }
  }

  /**
   * 获取或创建虚拟身份
   */
  async getVirtualIdentity(): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${this.gatewayUrl}${SUPERAUTH_CONFIG.API_PATHS.VIRTUAL_ID}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get virtual identity error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取虚拟身份失败',
      };
    }
  }

  /**
   * 检查是否已登录
   */
  async checkAuth(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    const result = await this.verify();
    return {
      isAuthenticated: result.success && result.user?.isAuthenticated === true,
      user: result.user || null,
    };
  }
}

// 导出单例
export const superAuthService = new SuperAuthService();

// 导出类型
export type { User, AuthResponse, RegisterData, LoginData };
