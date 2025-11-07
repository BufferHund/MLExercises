import { X } from 'lucide-react';
import type { ToolId } from '../types/tools';
import { tools } from '../config/tools';
import JsonFormatter from './tools/JsonFormatter';
import Base64Tool from './tools/Base64Tool';
import UrlEncoder from './tools/UrlEncoder';
import TimestampConverter from './tools/TimestampConverter';
import ColorConverter from './tools/ColorConverter';
import RegexTester from './tools/RegexTester';
import TokenCounter from './tools/TokenCounter';
import PromptTemplate from './tools/PromptTemplate';
import MarkdownPreview from './tools/MarkdownPreview';
import CsvToJson from './tools/CsvToJson';
import UuidGenerator from './tools/UuidGenerator';
import HashCalculator from './tools/HashCalculator';

interface ToolDetailProps {
  toolId: ToolId;
  onClose: () => void;
}

export default function ToolDetail({ toolId, onClose }: ToolDetailProps) {
  const tool = tools.find((t) => t.id === toolId);

  if (!tool) return null;

  const renderTool = () => {
    switch (toolId) {
      case 'json-formatter':
        return <JsonFormatter />;
      case 'base64':
        return <Base64Tool />;
      case 'url-encoder':
        return <UrlEncoder />;
      case 'timestamp':
        return <TimestampConverter />;
      case 'color-converter':
        return <ColorConverter />;
      case 'regex-tester':
        return <RegexTester />;
      case 'token-counter':
        return <TokenCounter />;
      case 'prompt-template':
        return <PromptTemplate />;
      case 'markdown-preview':
        return <MarkdownPreview />;
      case 'csv-to-json':
        return <CsvToJson />;
      case 'uuid-generator':
        return <UuidGenerator />;
      case 'hash-calculator':
        return <HashCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-soft`}>
              <tool.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
              <p className="text-white/60">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Tool Content */}
        <div className="glass rounded-3xl p-8 shadow-glass-lg">
          {renderTool()}
        </div>
      </div>
    </div>
  );
}
