import { useState } from 'react';
import { ArrowLeft, Code, Sparkles } from 'lucide-react';
import { tools } from '../config/tools';
import ToolWidget from './ToolWidget';
import ToolDetail from './ToolDetail';
import type { ToolId } from '../types/tools';

interface DevToolboxProps {
  onBack?: () => void;
}

export default function DevToolbox({ onBack }: DevToolboxProps) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  const webTools = tools.filter((t) => t.category === 'web');
  const aiTools = tools.filter((t) => t.category === 'ai');

  if (activeTool) {
    return <ToolDetail toolId={activeTool} onClose={() => setActiveTool(null)} />;
  }

  return (
    <div className="min-h-screen p-6 animate-slide-up">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
          )}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-3">开发者工具箱</h1>
            <p className="text-white/60">简洁实用的开发工具集合</p>
          </div>
        </div>

        {/* Web Tools Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Web 开发</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {webTools.map((tool, index) => (
              <ToolWidget
                key={tool.id}
                tool={tool}
                onClick={() => setActiveTool(tool.id as ToolId)}
                delay={index * 50}
              />
            ))}
          </div>
        </section>

        {/* AI Tools Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">AI 开发</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {aiTools.map((tool, index) => (
              <ToolWidget
                key={tool.id}
                tool={tool}
                onClick={() => setActiveTool(tool.id as ToolId)}
                delay={index * 50}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
