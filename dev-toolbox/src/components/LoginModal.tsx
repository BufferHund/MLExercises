import { useState } from 'react';
import { X, Lock, LogIn } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { getPortalLoginUrl } from '../config/superauth';

interface LoginModalProps {
  onClose: () => void;
  onShowRegister?: () => void;
}

export default function LoginModal({ onClose, onShowRegister }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, authMode, setAuthMode } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      onClose();
    } else {
      setError(result.message || '登录失败');
    }

    setLoading(false);
  };

  const handlePortalLogin = () => {
    window.location.href = getPortalLoginUrl(window.location.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">登录</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Auth Mode Switcher */}
        <div className="mb-6 flex gap-2 p-1 bg-slate-700/50 rounded-xl">
          <button
            type="button"
            onClick={() => setAuthMode('direct')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              authMode === 'direct'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            直接登录
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('portal')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              authMode === 'portal'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            统一认证
          </button>
        </div>

        {authMode === 'direct' ? (
          <>
            {/* Demo Info */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300 mb-2">演示账号：</p>
              <p className="text-xs text-slate-400">免费用户: testuser / 123456</p>
              <p className="text-xs text-slate-400">付费用户: premiumuser / 123456</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="请输入用户名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-xl font-medium text-white transition-colors"
              >
                {loading ? '登录中...' : '登录'}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onShowRegister}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  还没有账号？立即注册
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Portal Mode */
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300 mb-2">统一认证平台</p>
              <p className="text-xs text-slate-400">点击下方按钮跳转到统一认证平台进行登录</p>
            </div>

            <button
              type="button"
              onClick={handlePortalLogin}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              跳转到认证平台
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
