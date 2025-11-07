import { useState } from 'react';
import { Settings, Save, X, Key, Shield, AlertCircle } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';

interface UserSettingsProps {
  onClose: () => void;
}

export default function UserSettings({ onClose }: UserSettingsProps) {
  const { isPremium, geminiConfig, updateGeminiConfig } = useUserStore();
  const [apiKey, setApiKey] = useState(geminiConfig.apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateGeminiConfig({ apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">用户设置</h2>
              <p className="text-sm text-slate-400">管理您的API配置</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Account Status */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className={`w-5 h-5 ${isPremium ? 'text-yellow-400' : 'text-slate-400'}`} />
              <span className="font-medium text-white">账户类型</span>
            </div>
            <p className="text-lg font-bold text-white">
              {isPremium ? '🌟 高级会员' : '普通用户'}
            </p>
            {!isPremium && (
              <p className="text-sm text-slate-400 mt-2">
                升级到高级会员解锁深度思考、COT、绘图等高级功能
              </p>
            )}
          </div>

          {/* API Key Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Google Gemini API 配置</h3>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的 Gemini API Key"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-2">
                在{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Google AI Studio
                </a>{' '}
                获取您的API密钥
              </p>
            </div>

            {/* Info Alert */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">安全提示</p>
                <p className="text-yellow-300/80">
                  您的API密钥仅存储在本地浏览器中，我们不会上传到任何服务器。请妥善保管您的密钥。
                </p>
              </div>
            </div>
          </div>

          {/* Available Features */}
          <div className="space-y-4">
            <h3 className="font-medium text-white">可用功能</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">基础对话 (Gemini 2.5 Flash)</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-md">
                  ✓ 可用
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">高级模型 (Gemini 2.5 Pro)</span>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  isPremium
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600/50 text-slate-400'
                }`}>
                  {isPremium ? '✓ 可用' : '🔒 仅会员'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">深度思考模式</span>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  isPremium
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600/50 text-slate-400'
                }`}>
                  {isPremium ? '✓ 可用' : '🔒 仅会员'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">COT (思维链)</span>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  isPremium
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600/50 text-slate-400'
                }`}>
                  {isPremium ? '✓ 可用' : '🔒 仅会员'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">深度搜索</span>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  isPremium
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600/50 text-slate-400'
                }`}>
                  {isPremium ? '✓ 可用' : '🔒 仅会员'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">AI 绘图</span>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  isPremium
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600/50 text-slate-400'
                }`}>
                  {isPremium ? '✓ 可用' : '🔒 仅会员'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
          >
            {saved ? (
              <>
                <span className="text-green-400">✓</span>
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
