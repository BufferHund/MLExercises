import { X, Eye, EyeOff } from 'lucide-react';
import { useWidgetStore } from '../stores/useWidgetStore';

interface WidgetManagerProps {
  onClose: () => void;
}

export default function WidgetManager({ onClose }: WidgetManagerProps) {
  const { widgets, toggleWidget } = useWidgetStore();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">卡片管理</h2>
            <p className="text-sm text-slate-400 mt-1">选择要显示的卡片</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Widget List */}
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              onClick={() => toggleWidget(widget.id)}
              className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                {widget.enabled ? (
                  <Eye className="w-5 h-5 text-blue-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <div className="text-sm font-medium text-white">{widget.title}</div>
                  <div className="text-xs text-slate-400">
                    {widget.enabled ? '已启用' : '已禁用'}
                  </div>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  widget.enabled ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                    widget.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
