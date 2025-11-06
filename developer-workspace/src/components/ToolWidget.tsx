import type { Tool } from '../types/tools';

interface ToolWidgetProps {
  tool: Tool;
  onClick: () => void;
  delay?: number;
}

export default function ToolWidget({ tool, onClick, delay = 0 }: ToolWidgetProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-soft-lg animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon Container */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-soft-lg group-hover:scale-110 transition-all duration-300`}
        >
          <tool.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>

        {/* Text */}
        <div className="text-center">
          <div className="font-semibold text-white text-sm mb-0.5">{tool.name}</div>
          <div className="text-xs text-white/50">{tool.description}</div>
        </div>
      </div>

      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
    </button>
  );
}
