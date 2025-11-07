import { X } from 'lucide-react';
import { tools, toolCategories } from '../config/tools';
import { useUserStore } from '../stores/useUserStore';
import ToolWidget from './ToolWidget';
import type { ToolCategory, ToolId } from '../types/tools';

interface AllToolsModalProps {
  onClose: () => void;
  onToolClick: (toolId: ToolId, isPremium: boolean) => void;
}

export default function AllToolsModal({ onClose, onToolClick }: AllToolsModalProps) {
  const { isPremium } = useUserStore();

  // 所有工具分类
  const categories: ToolCategory[] = ['ai', 'image', 'basic', 'format', 'network', 'hash', 'conversion', 'string'];
  const toolsByCategory = categories.map(cat => ({
    category: cat,
    config: toolCategories[cat],
    tools: tools.filter(t => t.category === cat)
  })).filter(group => group.tools.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass rounded-3xl shadow-glass-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">全部工具</h2>
            <p className="text-sm text-slate-400">共 {tools.length} 个工具 · {categories.length} 个分类</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-10">
            {toolsByCategory.map((group) => (
              <section key={group.category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 bg-gradient-to-br ${group.config.color} rounded-xl flex items-center justify-center`}>
                    <group.config.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{group.config.name}</h3>
                  <span className="text-sm text-slate-500">({group.tools.length})</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {group.tools.map((tool) => (
                    <ToolWidget
                      key={tool.id}
                      tool={tool}
                      onClick={() => onToolClick(tool.id, tool.isPremium || false)}
                      delay={0}
                      showPremiumBadge={tool.isPremium}
                      isLocked={tool.isPremium && !isPremium}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
