import { Crown, Lock } from 'lucide-react';
import type { Tool } from '../types/tools';

interface ToolWidgetProps {
  tool: Tool;
  onClick: () => void;
  delay?: number;
  showPremiumBadge?: boolean;
  isLocked?: boolean;
}

export default function ToolWidget({ tool, onClick, delay = 0, showPremiumBadge, isLocked }: ToolWidgetProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 transition-all duration-300 hover:scale-105 animate-scale-in ${
        isLocked ? 'opacity-75' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Premium Badge */}
      {showPremiumBadge && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <Crown className="w-3 h-3 text-yellow-500" />
          </div>
        </div>
      )}

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
      )}

      {/* Icon Container */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <tool.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>

        {/* Text */}
        <div className="text-center">
          <div className="font-semibold text-white text-sm mb-0.5">{tool.name}</div>
          <div className="text-xs text-slate-400">{tool.description}</div>
        </div>
      </div>
    </button>
  );
}
