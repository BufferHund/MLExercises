// SuperAuth 配置文件
export const SUPERAUTH_CONFIG = {
  // Gateway API地址
  GATEWAY_URL: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000',

  // Portal地址（用于重定向登录）
  PORTAL_URL: import.meta.env.VITE_PORTAL_URL || 'http://localhost',

  // 当前应用地址
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3100',

  // 认证模式：'direct' | 'portal'
  DEFAULT_AUTH_MODE: 'direct',

  // API路径
  API_PATHS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
    ME: '/api/auth/me',
    VIRTUAL_ID: '/api/virtual-identity',
  },

  // Cookie配置
  COOKIE_NAME: 'auth_token',
};

// 帮助函数
export function getPortalLoginUrl(redirectTo?: string): string {
  const redirect = redirectTo || SUPERAUTH_CONFIG.APP_URL;
  return `${SUPERAUTH_CONFIG.PORTAL_URL}/?redirect=${encodeURIComponent(redirect)}`;
}

export function getPortalRegisterUrl(redirectTo?: string): string {
  const redirect = redirectTo || SUPERAUTH_CONFIG.APP_URL;
  return `${SUPERAUTH_CONFIG.PORTAL_URL}/register?redirect=${encodeURIComponent(redirect)}`;
}
