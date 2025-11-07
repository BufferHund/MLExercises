import { Wrench, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  toolName: string;
  description?: string;
}

export default function ComingSoon({ toolName, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
          <Wrench className="w-12 h-12 text-white" strokeWidth={2} />
        </div>
        <div className="absolute -top-2 -right-2">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-3">{toolName}</h2>
      {description && <p className="text-slate-400 mb-6 max-w-md">{description}</p>}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 max-w-lg">
        <p className="text-blue-300 text-sm leading-relaxed">
          这个工具正在精心开发中,敬请期待!
          <br />
          <span className="text-blue-400/60">即将推出更多强大功能...</span>
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl mb-1">🚀</div>
          <div className="text-xs text-slate-400">功能丰富</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-xs text-slate-400">性能优越</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl mb-1">🎨</div>
          <div className="text-xs text-slate-400">界面精致</div>
        </div>
      </div>
    </div>
  );
}
